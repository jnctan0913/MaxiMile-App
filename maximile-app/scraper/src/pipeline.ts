// =============================================================================
// MaxiMile Scraper — Pipeline Orchestrator
// =============================================================================
// Main orchestration logic: fetch → hash → compare → classify → route → store.
//
// Flow:
//   1. Create pipeline_run record
//   2. Get sources due for check via fn_get_sources_due_for_check()
//   3. For each source:
//      a. Scrape the page (Playwright or HTTP)
//      b. Compute SHA-256 hash of extracted content
//      c. Compare with latest snapshot hash
//      d. If unchanged: update last_checked_at, skip
//      e. If changed: save new snapshot, classify with AI, route changes
//      f. On error: increment consecutive_failures, mark 'broken' at 3
//      g. On success: reset failure count
//   4. Update pipeline_run with stats (including AI classification stats)
//   5. Log daily digest of auto-approved changes (T15.13)
//   6. Update last_run.json with timestamp
//
// Key design decisions:
//   - Gemini Flash primary, Groq Llama fallback (Sprint 15)
//   - Confidence-based routing: auto-approve >= 0.85, review 0.50-0.84, discard < 0.50
//   - 3 consecutive failures → mark source as 'broken'
//   - last_run.json auto-commit prevents 60-day GH Actions disable
// =============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { scrapePage } from './scraper.js';
import { computeContentHash, hasContentChanged } from './hasher.js';
import {
  getSourcesDueForCheck,
  getLatestSnapshot,
  saveSnapshot,
  updateSourceStatus,
  incrementFailureCount,
  resetFailureCount,
  createPipelineRun,
  updatePipelineRun,
  updateSourceVersion,
  updateSourceUrl,
  getClient,
} from './supabase-client.js';
import { withRetry } from './error-handler.js';
import { classifyPageChange } from './ai/classifier.js';
import { routeDetectedChanges } from './ai/router.js';
import type { SourceConfig, PipelineRun } from './types.js';

// Resolve __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Path to last_run.json (one level up from src/) */
const LAST_RUN_PATH = path.resolve(__dirname, '..', 'last_run.json');

// ---------------------------------------------------------------------------
// AI classification stats (accumulated across all sources)
// ---------------------------------------------------------------------------

interface AIStats {
  changes_auto_approved: number;
  changes_queued: number;
  changes_discarded: number;
  /** Detailed log of auto-approved changes for the daily digest. */
  autoApprovedDetails: Array<{
    card_name: string;
    change_type: string;
    alert_title: string;
    provider: string;
  }>;
}

/**
 * Run the complete detection pipeline.
 *
 * This is the top-level function called by index.ts.
 * It orchestrates the entire fetch → hash → compare → classify → route flow.
 */
export async function runPipeline(): Promise<void> {
  const startTime = Date.now();

  // Stats tracking
  let sourcesChecked = 0;
  let sourcesChanged = 0;
  const errors: Array<{ source_id?: string; url?: string; error: string }> = [];

  // AI classification stats (Sprint 15)
  const aiStats: AIStats = {
    changes_auto_approved: 0,
    changes_queued: 0,
    changes_discarded: 0,
    autoApprovedDetails: [],
  };

  // Step 1: Create pipeline_run record
  console.log('[Pipeline] Creating pipeline run record...');
  let runId: string;
  try {
    runId = await withRetry(() => createPipelineRun());
    console.log(`[Pipeline] Pipeline run ID: ${runId}`);
  } catch (error) {
    console.error('[Pipeline] Failed to create pipeline run:', error);
    throw error;
  }

  try {
    // Step 1b: URL discovery for versioned PDFs (before main scrape loop)
    await runUrlDiscovery();

    // Step 2: Get sources due for check
    console.log('[Pipeline] Fetching sources due for check...');
    const sources = await withRetry(() => getSourcesDueForCheck());
    console.log(`[Pipeline] Found ${sources.length} sources due for check`);

    if (sources.length === 0) {
      console.log('[Pipeline] No sources due for check. Exiting early.');
      await finalizePipelineRun(runId, startTime, {
        sourcesChecked: 0,
        sourcesChanged: 0,
        errors: [],
        status: 'completed',
        aiStats,
      });
      await updateLastRunJson(0, 0);
      return;
    }

    // Step 3: Process each source
    for (const source of sources) {
      console.log(
        `\n[Pipeline] Processing: ${source.bank_name} — ${source.url}`
      );
      console.log(
        `[Pipeline]   Method: ${source.scrape_method}, Selector: ${source.css_selector ?? '(full page)'}`
      );

      try {
        const sourceResult = await processSource(source);
        sourcesChecked++;

        if (sourceResult.changed) {
          sourcesChanged++;

          // Accumulate AI classification stats
          aiStats.changes_auto_approved += sourceResult.routing.autoApproved;
          aiStats.changes_queued += sourceResult.routing.queued;
          aiStats.changes_discarded += sourceResult.routing.discarded;

          // Track auto-approved details for digest
          if (sourceResult.classificationDetails) {
            for (const detail of sourceResult.classificationDetails) {
              aiStats.autoApprovedDetails.push(detail);
            }
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `[Pipeline] Error processing ${source.url}: ${errorMessage}`
        );
        errors.push({
          source_id: source.id,
          url: source.url,
          error: errorMessage,
        });
      }
    }

    // Step 4: Update pipeline_run with final stats
    const status =
      errors.length === 0
        ? 'completed'
        : errors.length === sources.length
          ? 'failed'
          : 'partial';

    await finalizePipelineRun(runId, startTime, {
      sourcesChecked,
      sourcesChanged,
      errors,
      status,
      aiStats,
    });

    // Step 5: Daily digest (T15.13)
    logDailyDigest(aiStats);

    // Step 6: Update last_run.json
    await updateLastRunJson(sourcesChecked, sourcesChanged);

    // Summary
    console.log('\n[Pipeline] === Run Summary ===');
    console.log(`[Pipeline] Sources checked: ${sourcesChecked}`);
    console.log(`[Pipeline] Sources changed: ${sourcesChanged}`);
    console.log(`[Pipeline] Changes auto-approved: ${aiStats.changes_auto_approved}`);
    console.log(`[Pipeline] Changes queued for review: ${aiStats.changes_queued}`);
    console.log(`[Pipeline] Changes discarded: ${aiStats.changes_discarded}`);
    console.log(`[Pipeline] Errors: ${errors.length}`);
    console.log(
      `[Pipeline] Duration: ${((Date.now() - startTime) / 1000).toFixed(1)}s`
    );
    console.log(`[Pipeline] Status: ${status}`);
  } catch (error) {
    // Catastrophic failure — update pipeline run as failed
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error(`[Pipeline] Catastrophic failure: ${errorMessage}`);

    await finalizePipelineRun(runId, startTime, {
      sourcesChecked,
      sourcesChanged,
      errors: [
        ...errors,
        { error: `Pipeline failure: ${errorMessage}` },
      ],
      status: 'failed',
      aiStats,
    });

    throw error;
  }
}

// ---------------------------------------------------------------------------
// Per-source processing
// ---------------------------------------------------------------------------

/** Result of processing a single source. */
interface ProcessSourceResult {
  changed: boolean;
  routing: {
    autoApproved: number;
    queued: number;
    discarded: number;
  };
  classificationDetails: Array<{
    card_name: string;
    change_type: string;
    alert_title: string;
    provider: string;
  }> | null;
}

/**
 * Process a single source: scrape, hash, compare, classify, route.
 */
async function processSource(source: SourceConfig): Promise<ProcessSourceResult> {
  const noChangeResult: ProcessSourceResult = {
    changed: false,
    routing: { autoApproved: 0, queued: 0, discarded: 0 },
    classificationDetails: null,
  };

  // Step 3a: Scrape the page (with retry)
  const result = await withRetry(
    () => scrapePage(source.url, source.css_selector, source.scrape_method),
    3,
    2000
  );

  if (!result.success) {
    // Step 3f: On error — increment failures
    console.warn(
      `[Pipeline]   Scrape failed: ${result.error}`
    );
    await withRetry(() => incrementFailureCount(source.id));
    await withRetry(() =>
      updateSourceStatus(source.id, source.status, new Date())
    );
    throw new Error(result.error ?? 'Scrape failed');
  }

  // -------------------------------------------------------------------------
  // Gate 1: Version + date check (cheapest — skip everything if unchanged)
  // -------------------------------------------------------------------------
  if (result.tcVersion && result.tcLastUpdated &&
      source.tc_version && source.tc_last_updated) {
    if (result.tcVersion === source.tc_version &&
        result.tcLastUpdated === source.tc_last_updated) {
      console.log(
        `[Pipeline]   T&C version unchanged (${result.tcVersion}, updated ${result.tcLastUpdated}). Skipping.`
      );
      await withRetry(() =>
        updateSourceStatus(source.id, 'active', new Date())
      );
      await withRetry(() => resetFailureCount(source.id));
      return noChangeResult;
    }
    console.log(
      `[Pipeline]   T&C version changed: ${source.tc_version} → ${result.tcVersion}, ` +
        `date: ${source.tc_last_updated} → ${result.tcLastUpdated}`
    );
  }

  // -------------------------------------------------------------------------
  // Gate 2: SHA-256 hash comparison
  // -------------------------------------------------------------------------
  const contentHash = result.contentHash;
  console.log(
    `[Pipeline]   Content hash: ${contentHash.substring(0, 16)}...`
  );

  const latestSnapshot = await withRetry(() =>
    getLatestSnapshot(source.id)
  );

  const previousHash = latestSnapshot?.content_hash ?? null;
  const oldContent = latestSnapshot?.raw_content ?? '';
  const changed = hasContentChanged(contentHash, previousHash);

  if (!changed) {
    console.log('[Pipeline]   Content unchanged (hash match). Skipping.');
    await withRetry(() =>
      updateSourceStatus(source.id, 'active', new Date())
    );
    await withRetry(() => resetFailureCount(source.id));
    // Update version metadata even if hash unchanged (first time extracting)
    if (result.tcVersion || result.tcLastUpdated) {
      await withRetry(() =>
        updateSourceVersion(source.id, result.tcVersion, result.tcLastUpdated)
      );
    }
    return noChangeResult;
  }

  // Step 3e: Changed — save new snapshot (with version/date metadata)
  console.log(
    '[Pipeline]   CHANGE DETECTED! Saving new snapshot.'
  );
  if (previousHash) {
    console.log(
      `[Pipeline]   Previous hash: ${previousHash.substring(0, 16)}...`
    );
    console.log(
      `[Pipeline]   New hash:      ${contentHash.substring(0, 16)}...`
    );
  } else {
    console.log('[Pipeline]   First snapshot for this source.');
  }

  const snapshotId = await withRetry(() =>
    saveSnapshot(source.id, contentHash, result.content, result.tcVersion, result.tcLastUpdated)
  );

  // Update version metadata on the source config
  if (result.tcVersion || result.tcLastUpdated) {
    await withRetry(() =>
      updateSourceVersion(source.id, result.tcVersion, result.tcLastUpdated)
    );
  }

  // Step 3g: On success — reset failure count, update status
  await withRetry(() =>
    updateSourceStatus(source.id, 'active', new Date())
  );
  await withRetry(() => resetFailureCount(source.id));

  // -------------------------------------------------------------------------
  // Gate 3: AI Classification + Confidence Routing
  // -------------------------------------------------------------------------

  // Only classify if we have previous content to compare against.
  // First snapshot for a source is just a baseline — nothing to diff.
  if (!oldContent) {
    console.log(
      '[Pipeline]   First snapshot — no previous content for AI classification.'
    );
    return { changed: true, routing: { autoApproved: 0, queued: 0, discarded: 0 }, classificationDetails: null };
  }

  console.log('[Pipeline]   Running AI classification...');
  const classification = await classifyPageChange(
    oldContent,
    result.content,
    source.bank_name,
    source.url,
    source.card_name
  );

  console.log(
    `[Pipeline]   AI result: ${classification.response.changes.length} changes detected ` +
      `(provider: ${classification.provider}, latency: ${classification.latencyMs}ms)`
  );

  if (classification.response.analysis_notes) {
    console.log(
      `[Pipeline]   AI notes: ${classification.response.analysis_notes}`
    );
  }

  // Route based on confidence
  if (classification.response.changes.length > 0) {
    const supabaseClient = getClient();
    const routing = await routeDetectedChanges(
      classification.response.changes,
      source,
      snapshotId,
      supabaseClient
    );

    // Build details for digest
    const classificationDetails = classification.response.changes
      .filter((c) => c.confidence >= 0.85)
      .map((c) => ({
        card_name: c.card_name,
        change_type: c.change_type,
        alert_title: c.alert_title,
        provider: classification.provider,
      }));

    return {
      changed: true,
      routing: {
        autoApproved: routing.autoApproved,
        queued: routing.queued,
        discarded: routing.discarded,
      },
      classificationDetails,
    };
  }

  console.log('[Pipeline]   No rate changes detected by AI.');
  return { changed: true, routing: { autoApproved: 0, queued: 0, discarded: 0 }, classificationDetails: null };
}

// ---------------------------------------------------------------------------
// URL discovery for versioned PDFs
// ---------------------------------------------------------------------------

/**
 * Cards whose T&C PDF URLs contain version numbers or dates that change
 * when a new version is published. URL discovery fetches the bank index
 * page and extracts the current PDF link.
 */
const VERSIONED_PDF_CARDS: ReadonlyMap<string, { bankName: string; indexUrlPattern: string }> = new Map([
  ['OCBC Titanium Rewards', { bankName: 'OCBC', indexUrlPattern: 'tnc-titaniumrewards' }],
  ['BOC Elite Miles Card', { bankName: 'BOC', indexUrlPattern: 'elite-miles' }],
  ['Maybank FC Barcelona Card', { bankName: 'Maybank', indexUrlPattern: 'fc-barcelona' }],
  ['Citi Rewards Card', { bankName: 'Citibank', indexUrlPattern: 'citi-thankyou-rewards' }],
  ['Citi PremierMiles Card', { bankName: 'Citibank', indexUrlPattern: 'premiermiles' }],
  ['SC Smart Card', { bankName: 'Standard Chartered', indexUrlPattern: 'smart-card' }],
]);

/**
 * Run URL discovery before the main scrape loop.
 *
 * Fetches bank index pages (which list T&C PDFs) and extracts current
 * PDF links. If a PDF URL has changed (versioned filename), updates the
 * source_configs record with the new URL.
 *
 * This is best-effort — if discovery fails for any index page, we fall
 * back to the last known URL.
 */
async function runUrlDiscovery(): Promise<void> {
  console.log('[Pipeline] Running URL discovery for versioned PDFs...');

  const supabase = getClient();

  // Get all bank_index_page sources
  const { data: indexSources, error } = await supabase
    .from('source_configs')
    .select('*')
    .eq('source_type', 'bank_index_page')
    .eq('status', 'active');

  if (error || !indexSources || indexSources.length === 0) {
    console.log('[Pipeline] No index page sources found. Skipping URL discovery.');
    return;
  }

  for (const indexSource of indexSources) {
    try {
      console.log(`[Pipeline] Discovering PDFs from: ${indexSource.url}`);
      const result = await scrapePage(indexSource.url, indexSource.css_selector, indexSource.scrape_method);

      if (!result.success || !result.content) {
        console.warn(`[Pipeline] Index page scrape failed: ${result.error}`);
        continue;
      }

      // Extract PDF links from the page content
      const pdfLinks = extractPdfLinks(result.content, indexSource.url);

      if (pdfLinks.length === 0) {
        console.log(`[Pipeline] No PDF links found on ${indexSource.url}`);
        continue;
      }

      console.log(`[Pipeline] Found ${pdfLinks.length} PDF links on ${indexSource.url}`);

      // Match PDF links to card-specific sources and update URLs if changed
      const { data: pdfSources } = await supabase
        .from('source_configs')
        .select('*')
        .eq('bank_name', indexSource.bank_name)
        .eq('source_type', 'bank_tc_pdf')
        .eq('status', 'active');

      if (!pdfSources) continue;

      for (const pdfSource of pdfSources) {
        // Find a PDF link that matches this source's card
        const matchingLink = pdfLinks.find((link) => {
          const cardInfo = VERSIONED_PDF_CARDS.get(pdfSource.card_name ?? '');
          if (cardInfo) {
            return link.toLowerCase().includes(cardInfo.indexUrlPattern.toLowerCase());
          }
          // Generic match: check if the link looks similar to the current URL
          const currentFilename = pdfSource.url.split('/').pop()?.replace(/\.pdf.*/, '') ?? '';
          return link.includes(currentFilename.split('-')[0]);
        });

        if (matchingLink && matchingLink !== pdfSource.url) {
          console.log(
            `[Pipeline] URL changed for ${pdfSource.card_name}: ${pdfSource.url} → ${matchingLink}`
          );
          await withRetry(() => updateSourceUrl(pdfSource.id, matchingLink));
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[Pipeline] URL discovery failed for ${indexSource.url}: ${errMsg}`);
      // Non-fatal — continue with other index pages
    }
  }

  console.log('[Pipeline] URL discovery complete.');
}

/**
 * Extract PDF links from page content or raw HTML.
 * Returns absolute URLs to PDF files found on the page.
 */
function extractPdfLinks(content: string, baseUrl: string): string[] {
  const pdfPattern = /https?:\/\/[^\s"'<>]+\.pdf(?:\?[^\s"'<>]*)?/gi;
  const results: string[] = [...(content.match(pdfPattern) ?? [])];

  // Also try relative paths
  const relativePattern = /(?:href=["'])([^"']+\.pdf(?:\?[^"']*)?)/gi;
  let relMatch;
  while ((relMatch = relativePattern.exec(content)) !== null) {
    try {
      const absoluteUrl = new URL(relMatch[1], baseUrl).href;
      results.push(absoluteUrl);
    } catch {
      // Invalid URL — skip
    }
  }

  // Deduplicate
  return [...new Set(results)];
}

// ---------------------------------------------------------------------------
// Daily digest (T15.13)
// ---------------------------------------------------------------------------

/**
 * Log a daily digest summary of auto-approved changes.
 *
 * Since we don't have email/push notifications yet, this logs to console
 * and the information is persisted in the pipeline_run record.
 */
function logDailyDigest(aiStats: AIStats): void {
  if (aiStats.changes_auto_approved === 0) {
    console.log('\n[DIGEST] No changes auto-approved in this run.');
    return;
  }

  console.log(`\n[DIGEST] === Daily Digest ===`);
  console.log(
    `[DIGEST] ${aiStats.changes_auto_approved} change(s) auto-approved today:`
  );

  for (const detail of aiStats.autoApprovedDetails) {
    console.log(
      `[DIGEST]   - ${detail.alert_title} (${detail.change_type}, provider: ${detail.provider})`
    );
  }

  console.log(
    `[DIGEST] ${aiStats.changes_queued} change(s) queued for manual review.`
  );
  console.log(
    `[DIGEST] ${aiStats.changes_discarded} change(s) auto-discarded (low confidence).`
  );
  console.log('[DIGEST] === End Digest ===\n');
}

// ---------------------------------------------------------------------------
// Pipeline run finalization
// ---------------------------------------------------------------------------

interface PipelineStats {
  sourcesChecked: number;
  sourcesChanged: number;
  errors: Array<{ source_id?: string; url?: string; error: string }>;
  status: string;
  aiStats: AIStats;
}

/**
 * Update the pipeline_run record with final stats.
 */
async function finalizePipelineRun(
  runId: string,
  startTime: number,
  stats: PipelineStats
): Promise<void> {
  const durationMs = Date.now() - startTime;

  // Count total changes detected (all classifications across all sources)
  const totalChangesDetected =
    stats.aiStats.changes_auto_approved +
    stats.aiStats.changes_queued +
    stats.aiStats.changes_discarded;

  try {
    await withRetry(() =>
      updatePipelineRun(runId, {
        completed_at: new Date().toISOString(),
        status: stats.status as PipelineRun['status'],
        sources_checked: stats.sourcesChecked,
        sources_changed: stats.sourcesChanged,
        changes_detected: totalChangesDetected,
        changes_auto_approved: stats.aiStats.changes_auto_approved,
        changes_queued: stats.aiStats.changes_queued,
        changes_discarded: stats.aiStats.changes_discarded,
        errors: stats.errors,
        duration_ms: durationMs,
      })
    );
  } catch (error) {
    console.error('[Pipeline] Failed to finalize pipeline run:', error);
    // Don't re-throw — we don't want this to mask the original pipeline result
  }
}

// ---------------------------------------------------------------------------
// last_run.json management
// ---------------------------------------------------------------------------

/**
 * Update last_run.json with the current timestamp and stats.
 *
 * This file is auto-committed by the GitHub Actions workflow to
 * prevent the 60-day inactivity disable. The commit step in
 * scrape.yml does: git add last_run.json && git commit && git push
 */
async function updateLastRunJson(
  sourcesChecked: number,
  sourcesChanged: number
): Promise<void> {
  const data = {
    last_run: new Date().toISOString(),
    sources_checked: sourcesChecked,
    sources_changed: sourcesChanged,
  };

  try {
    fs.writeFileSync(LAST_RUN_PATH, JSON.stringify(data, null, 2) + '\n');
    console.log(`[Pipeline] Updated ${LAST_RUN_PATH}`);
  } catch (error) {
    console.warn('[Pipeline] Failed to update last_run.json:', error);
    // Non-fatal — the pipeline itself still succeeded
  }
}
