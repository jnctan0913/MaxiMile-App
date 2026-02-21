// =============================================================================
// MaxiMile Scraper — Confidence-Based Router (Sprint 15 — T15.07–T15.10)
// =============================================================================
// Routes AI-detected changes based on confidence score and source type.
//
// Routing rules:
//   - Auto-approve: confidence >= 0.85 AND source is Tier-1 (bank_tc_page or bank_announcement)
//   - Review queue: confidence 0.50–0.84, or any confidence from non-Tier-1 sources
//   - Auto-discard: confidence < 0.50
//
// Dedup:
//   - SHA-256 fingerprint of card_slug|change_type|new_value|currentMonth
//   - Prevents duplicate rate_changes inserts
//
// Architecture Reference: docs/RATE_DETECTION_ARCHITECTURE.md
// =============================================================================

import crypto from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { DetectedRateChange } from './schema.js';
import { CHANGE_TYPE_TO_DB_ENUM } from './schema.js';
import type { SourceConfig } from '../types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Result of routing all changes from a single classification. */
export interface RoutingResult {
  /** Number of changes auto-approved and inserted into rate_changes. */
  autoApproved: number;
  /** Number of changes queued for human review in detected_changes. */
  queued: number;
  /** Number of changes auto-discarded (low confidence). */
  discarded: number;
}

/** Tier-1 source types eligible for auto-approval. */
const TIER_1_SOURCE_TYPES: ReadonlySet<string> = new Set([
  'bank_tc_page',
  'bank_announcement',
]);

/** Minimum confidence for auto-approval (when source is Tier-1). */
const AUTO_APPROVE_THRESHOLD = 0.85;

/** Minimum confidence to enter the review queue. */
const REVIEW_QUEUE_THRESHOLD = 0.50;

// ---------------------------------------------------------------------------
// Main routing function
// ---------------------------------------------------------------------------

/**
 * Route detected changes based on confidence and source type.
 *
 * For each change in the classification result:
 *   1. Auto-approve if confidence >= 0.85 AND source is Tier-1
 *   2. Queue for review if confidence >= 0.50 (or any confidence from non-Tier-1)
 *   3. Auto-discard if confidence < 0.50
 *
 * @param changes       - Array of detected rate changes from AI classification
 * @param sourceConfig  - The source configuration that produced these changes
 * @param snapshotId    - ID of the source_snapshot that triggered classification
 * @param supabaseClient - Supabase client for database operations
 * @returns RoutingResult with counts of auto-approved, queued, and discarded changes
 */
export async function routeDetectedChanges(
  changes: DetectedRateChange[],
  sourceConfig: SourceConfig,
  snapshotId: string,
  supabaseClient: SupabaseClient
): Promise<RoutingResult> {
  const result: RoutingResult = {
    autoApproved: 0,
    queued: 0,
    discarded: 0,
  };

  const isTier1 = TIER_1_SOURCE_TYPES.has(sourceConfig.source_type);

  for (const change of changes) {
    try {
      if (change.confidence >= AUTO_APPROVE_THRESHOLD && isTier1) {
        // Auto-approve path
        const approved = await handleAutoApprove(
          change,
          sourceConfig,
          snapshotId,
          supabaseClient
        );
        if (approved) {
          result.autoApproved++;
        } else {
          // Duplicate detected — don't count as approved
          console.log(
            `[Router] Duplicate detected for ${change.card_name} — ${change.change_type}. Skipping.`
          );
        }
      } else if (change.confidence >= REVIEW_QUEUE_THRESHOLD) {
        // Review queue path
        await handleReviewQueue(change, sourceConfig, snapshotId, supabaseClient);
        result.queued++;
      } else {
        // Auto-discard path
        await handleAutoDiscard(change, sourceConfig, snapshotId, supabaseClient);
        result.discarded++;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(
        `[Router] Failed to route change for ${change.card_name}: ${errorMsg}`
      );
      // On error, queue for review so it doesn't get lost
      try {
        await handleReviewQueue(change, sourceConfig, snapshotId, supabaseClient);
        result.queued++;
      } catch (fallbackError) {
        console.error(
          `[Router] Fallback queue also failed for ${change.card_name}: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`
        );
      }
    }
  }

  console.log(
    `[Router] Routing complete: ${result.autoApproved} auto-approved, ` +
      `${result.queued} queued, ${result.discarded} discarded`
  );

  return result;
}

// ---------------------------------------------------------------------------
// Auto-approve path (T15.08)
// ---------------------------------------------------------------------------

/**
 * Auto-approve a high-confidence change from a Tier-1 source.
 *
 * 1. Compute dedup fingerprint
 * 2. Check for existing duplicate in rate_changes
 * 3. If no duplicate: insert into rate_changes with detection_source='automated'
 * 4. If duplicate: insert into detected_changes with status='duplicate'
 *
 * @returns true if inserted into rate_changes, false if duplicate
 */
async function handleAutoApprove(
  change: DetectedRateChange,
  sourceConfig: SourceConfig,
  snapshotId: string,
  supabaseClient: SupabaseClient
): Promise<boolean> {
  const fingerprint = computeDedupFingerprint(
    cardNameToSlug(change.card_name),
    change.change_type,
    change.new_value
  );

  // Check for duplicate
  const isDuplicate = await checkDuplicateFingerprint(fingerprint, supabaseClient);

  if (isDuplicate) {
    // Mark as duplicate in detected_changes
    await insertDetectedChange(
      change,
      sourceConfig,
      snapshotId,
      'duplicate',
      supabaseClient,
      fingerprint,
      'Duplicate of existing rate_changes record'
    );
    return false;
  }

  // Insert into rate_changes
  await insertRateChange(change, sourceConfig, fingerprint, supabaseClient);

  // Also log in detected_changes for audit trail
  await insertDetectedChange(
    change,
    sourceConfig,
    snapshotId,
    'published',
    supabaseClient,
    fingerprint,
    'Auto-approved: high confidence from Tier-1 source'
  );

  console.log(
    `[Router] Auto-approved: ${change.alert_title} (confidence: ${change.confidence})`
  );

  return true;
}

// ---------------------------------------------------------------------------
// Review queue path (T15.09)
// ---------------------------------------------------------------------------

/**
 * Queue a medium-confidence change for human review.
 *
 * Inserts into detected_changes with status 'detected'.
 * These show up in the admin dashboard for manual review.
 */
async function handleReviewQueue(
  change: DetectedRateChange,
  sourceConfig: SourceConfig,
  snapshotId: string,
  supabaseClient: SupabaseClient
): Promise<void> {
  const fingerprint = computeDedupFingerprint(
    cardNameToSlug(change.card_name),
    change.change_type,
    change.new_value
  );

  await insertDetectedChange(
    change,
    sourceConfig,
    snapshotId,
    'detected',
    supabaseClient,
    fingerprint,
    null
  );

  console.log(
    `[Router] Queued for review: ${change.alert_title} (confidence: ${change.confidence})`
  );
}

// ---------------------------------------------------------------------------
// Auto-discard path
// ---------------------------------------------------------------------------

/**
 * Auto-discard a low-confidence change.
 *
 * Logs to detected_changes with status 'rejected' for audit purposes
 * but does not notify anyone or create a review queue item.
 */
async function handleAutoDiscard(
  change: DetectedRateChange,
  sourceConfig: SourceConfig,
  snapshotId: string,
  supabaseClient: SupabaseClient
): Promise<void> {
  const fingerprint = computeDedupFingerprint(
    cardNameToSlug(change.card_name),
    change.change_type,
    change.new_value
  );

  await insertDetectedChange(
    change,
    sourceConfig,
    snapshotId,
    'rejected',
    supabaseClient,
    fingerprint,
    `Auto-discarded: confidence ${change.confidence} below threshold ${REVIEW_QUEUE_THRESHOLD}`
  );

  console.log(
    `[Router] Auto-discarded: ${change.alert_title} (confidence: ${change.confidence})`
  );
}

// ---------------------------------------------------------------------------
// Dedup fingerprint (T15.10)
// ---------------------------------------------------------------------------

/**
 * Compute a dedup fingerprint for a rate change.
 *
 * SHA-256 of `${cardSlug}|${changeType}|${normalize(newValue)}|${currentMonth}`
 *
 * This prevents the same change from being inserted twice within the
 * same calendar month (e.g., if the scraper runs multiple times and
 * detects the same page change).
 *
 * @param cardSlug  - Slugified card name (e.g., "dbs-womans-world-card")
 * @param changeType - Type of change (e.g., "earn_rate_change")
 * @param newValue   - The new value string from the change
 * @returns SHA-256 hex digest
 */
export function computeDedupFingerprint(
  cardSlug: string,
  changeType: string,
  newValue: string
): string {
  const currentMonth = getCurrentMonth();
  const normalized = normalizeValue(newValue);
  const input = `${cardSlug}|${changeType}|${normalized}|${currentMonth}`;

  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * Get the current month in YYYY-MM format.
 */
function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Normalize a value string for consistent fingerprinting.
 * Lowercases, trims, and collapses whitespace.
 */
function normalizeValue(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Convert a card name to a URL-safe slug.
 * e.g., "DBS Woman's World Card" -> "dbs-womans-world-card"
 */
function cardNameToSlug(cardName: string): string {
  return cardName
    .toLowerCase()
    .replace(/['']/g, '') // Remove apostrophes
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-|-$/g, ''); // Trim leading/trailing hyphens
}

// ---------------------------------------------------------------------------
// Database operations
// ---------------------------------------------------------------------------

/**
 * Check if a dedup fingerprint already exists in rate_changes.
 */
async function checkDuplicateFingerprint(
  fingerprint: string,
  supabaseClient: SupabaseClient
): Promise<boolean> {
  const { data, error } = await supabaseClient
    .from('rate_changes')
    .select('id')
    .eq('dedup_fingerprint', fingerprint)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn(
      `[Router] Dedup check failed: ${error.message}. Treating as non-duplicate.`
    );
    return false;
  }

  return data !== null;
}

/**
 * Insert an auto-approved change into the rate_changes table.
 */
async function insertRateChange(
  change: DetectedRateChange,
  sourceConfig: SourceConfig,
  fingerprint: string,
  supabaseClient: SupabaseClient
): Promise<void> {
  const dbChangeType = CHANGE_TYPE_TO_DB_ENUM[change.change_type] ?? change.change_type;

  const { error } = await supabaseClient.from('rate_changes').insert({
    // Card lookup will be done via card_name for now.
    // In production, we'd resolve card_name -> card_id first.
    card_name: change.card_name,
    change_type: dbChangeType,
    category: change.category,
    old_value: change.old_value,
    new_value: change.new_value,
    effective_date: change.effective_date,
    severity: change.severity,
    alert_title: change.alert_title,
    alert_body: change.alert_body,
    detection_source: 'automated',
    dedup_fingerprint: fingerprint,
    source_config_id: sourceConfig.id,
    detected_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Failed to insert rate_change: ${error.message}`);
  }
}

/**
 * Insert a detected change record for audit/review.
 */
async function insertDetectedChange(
  change: DetectedRateChange,
  sourceConfig: SourceConfig,
  snapshotId: string,
  status: 'detected' | 'confirmed' | 'rejected' | 'published' | 'duplicate',
  supabaseClient: SupabaseClient,
  fingerprint: string,
  reviewerNotes: string | null
): Promise<void> {
  const dbChangeType = CHANGE_TYPE_TO_DB_ENUM[change.change_type] ?? change.change_type;

  const { error } = await supabaseClient.from('detected_changes').insert({
    source_config_id: sourceConfig.id,
    snapshot_id: snapshotId,
    card_name: change.card_name,
    change_type: dbChangeType,
    category: change.category,
    old_value: change.old_value,
    new_value: change.new_value,
    effective_date: change.effective_date,
    severity: change.severity,
    confidence: change.confidence,
    alert_title: change.alert_title,
    alert_body: change.alert_body,
    status,
    dedup_fingerprint: fingerprint,
    reviewer_notes: reviewerNotes,
    detected_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Failed to insert detected_change: ${error.message}`);
  }
}
