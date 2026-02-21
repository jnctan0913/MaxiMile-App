// =============================================================================
// MaxiMile Scraper — Supabase Service Client
// =============================================================================
// Connects to Supabase using the service_role key (bypasses RLS).
// Used by the pipeline to read source configs, write snapshots,
// update source status, and log pipeline runs.
//
// Environment variables (set in GitHub Actions secrets):
//   SUPABASE_URL         — e.g. https://xxxx.supabase.co
//   SUPABASE_SERVICE_KEY — service_role key (NOT anon key)
// =============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { SourceConfig, SourceSnapshot, PipelineRun } from './types.js';

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

let client: SupabaseClient | null = null;

/**
 * Get (or create) the Supabase client using service_role credentials.
 * Throws immediately if environment variables are missing.
 *
 * Exported so the pipeline can pass it to the AI router for
 * detected_changes and rate_changes inserts.
 */
export function getClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables. ' +
        'These must be set as GitHub Actions secrets.'
    );
  }

  client = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return client;
}

// ---------------------------------------------------------------------------
// Source configs
// ---------------------------------------------------------------------------

/**
 * Fetch sources that are due for a check via the `fn_get_sources_due_for_check` RPC.
 *
 * This calls the PostgreSQL function defined in Migration 018, Section 8.
 * It returns active sources where `last_checked_at` is NULL or older than
 * the source's `check_interval`.
 */
export async function getSourcesDueForCheck(): Promise<SourceConfig[]> {
  const { data, error } = await getClient().rpc('fn_get_sources_due_for_check');

  if (error) {
    throw new Error(`Failed to get sources due for check: ${error.message}`);
  }

  return (data ?? []) as SourceConfig[];
}

/**
 * Update a source's status and last_checked_at timestamp.
 */
export async function updateSourceStatus(
  sourceConfigId: string,
  status: string,
  lastCheckedAt: Date
): Promise<void> {
  const { error } = await getClient()
    .from('source_configs')
    .update({
      status,
      last_checked_at: lastCheckedAt.toISOString(),
    })
    .eq('id', sourceConfigId);

  if (error) {
    throw new Error(
      `Failed to update source status for ${sourceConfigId}: ${error.message}`
    );
  }
}

/**
 * Increment the consecutive_failures counter for a source.
 * If failures reach the threshold (3), the source is automatically marked as 'broken'.
 */
export async function incrementFailureCount(
  sourceConfigId: string
): Promise<void> {
  // First, get the current failure count
  const { data, error: fetchError } = await getClient()
    .from('source_configs')
    .select('consecutive_failures')
    .eq('id', sourceConfigId)
    .single();

  if (fetchError) {
    throw new Error(
      `Failed to fetch failure count for ${sourceConfigId}: ${fetchError.message}`
    );
  }

  const currentFailures = (data?.consecutive_failures ?? 0) as number;
  const newFailures = currentFailures + 1;
  const FAILURE_THRESHOLD = 3;

  const updates: Record<string, unknown> = {
    consecutive_failures: newFailures,
  };

  if (newFailures >= FAILURE_THRESHOLD) {
    updates.status = 'broken';
    console.warn(
      `[Source ${sourceConfigId}] Reached ${newFailures} consecutive failures. ` +
        `Marking as 'broken'.`
    );
  }

  const { error: updateError } = await getClient()
    .from('source_configs')
    .update(updates)
    .eq('id', sourceConfigId);

  if (updateError) {
    throw new Error(
      `Failed to increment failure count for ${sourceConfigId}: ${updateError.message}`
    );
  }
}

/**
 * Reset the consecutive_failures counter to 0 (called on successful scrape).
 */
export async function resetFailureCount(
  sourceConfigId: string
): Promise<void> {
  const { error } = await getClient()
    .from('source_configs')
    .update({ consecutive_failures: 0 })
    .eq('id', sourceConfigId);

  if (error) {
    throw new Error(
      `Failed to reset failure count for ${sourceConfigId}: ${error.message}`
    );
  }
}

// ---------------------------------------------------------------------------
// Source snapshots
// ---------------------------------------------------------------------------

/**
 * Get the latest snapshot for a given source config.
 * Returns null if no snapshots exist yet (first run for this source).
 */
export async function getLatestSnapshot(
  sourceConfigId: string
): Promise<SourceSnapshot | null> {
  const { data, error } = await getClient()
    .from('source_snapshots')
    .select('*')
    .eq('source_config_id', sourceConfigId)
    .order('snapshot_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to get latest snapshot for ${sourceConfigId}: ${error.message}`
    );
  }

  return data as SourceSnapshot | null;
}

/**
 * Save a new content snapshot for a source.
 * Returns the generated snapshot UUID for use in AI classification routing.
 */
export async function saveSnapshot(
  sourceConfigId: string,
  contentHash: string,
  rawContent: string
): Promise<string> {
  const { data, error } = await getClient()
    .from('source_snapshots')
    .insert({
      source_config_id: sourceConfigId,
      content_hash: contentHash,
      raw_content: rawContent,
      snapshot_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(
      `Failed to save snapshot for ${sourceConfigId}: ${error.message}`
    );
  }

  return data.id as string;
}

// ---------------------------------------------------------------------------
// Pipeline runs
// ---------------------------------------------------------------------------

/**
 * Create a new pipeline_run record with status 'running'.
 * Returns the generated UUID for the run.
 */
export async function createPipelineRun(): Promise<string> {
  const { data, error } = await getClient()
    .from('pipeline_runs')
    .insert({
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create pipeline run: ${error.message}`);
  }

  return data.id as string;
}

/**
 * Update a pipeline_run record with final stats.
 */
export async function updatePipelineRun(
  runId: string,
  updates: Partial<PipelineRun>
): Promise<void> {
  const { error } = await getClient()
    .from('pipeline_runs')
    .update(updates)
    .eq('id', runId);

  if (error) {
    throw new Error(
      `Failed to update pipeline run ${runId}: ${error.message}`
    );
  }
}
