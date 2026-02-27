// =============================================================================
// MaxiMile Scraper — TypeScript Interfaces
// =============================================================================
// Matches the Migration 018 schema (source_configs, source_snapshots,
// detected_changes, pipeline_runs tables).
// =============================================================================

/**
 * Source type enum — what kind of page are we monitoring?
 * Matches: CREATE TYPE source_type AS ENUM (...)
 */
export type SourceType =
  | 'bank_tc_page'
  | 'bank_announcement'
  | 'regulatory'
  | 'community_forum'
  | 'bank_tc_pdf'
  | 'bank_index_page';

/**
 * Source health status enum.
 * Matches: CREATE TYPE source_status AS ENUM (...)
 */
export type SourceStatus = 'active' | 'paused' | 'broken' | 'retired';

/**
 * Lifecycle of an AI-detected change.
 * Matches: CREATE TYPE detected_change_status AS ENUM (...)
 */
export type DetectedChangeStatus =
  | 'detected'
  | 'confirmed'
  | 'rejected'
  | 'published'
  | 'duplicate';

/**
 * Pipeline run outcome.
 * Matches: CREATE TYPE pipeline_run_status AS ENUM (...)
 */
export type PipelineRunStatus = 'running' | 'completed' | 'failed' | 'partial';

/**
 * Scrape method — how to fetch the page content.
 */
export type ScrapeMethod = 'playwright' | 'http';

// ---------------------------------------------------------------------------
// Table interfaces
// ---------------------------------------------------------------------------

/**
 * Matches: public.source_configs table (Migration 018, Section 2).
 *
 * Registry of URLs the pipeline monitors. Each row represents one page
 * (e.g. a bank T&C page or a rewards program landing page).
 */
export interface SourceConfig {
  id: string;
  url: string;
  bank_name: string;
  source_type: SourceType;
  scrape_method: ScrapeMethod;
  css_selector: string | null;
  check_interval: string; // PostgreSQL INTERVAL serialized as string (e.g. "1 day")
  status: SourceStatus;
  last_checked_at: string | null; // ISO 8601 timestamp or null
  consecutive_failures: number;
  notes: string | null;
  created_at: string;
  card_name: string | null;
  tc_version: string | null;
  tc_last_updated: string | null;
}

/**
 * Matches: public.source_snapshots table (Migration 018, Section 3).
 *
 * Point-in-time content captures. The scraper stores the extracted text
 * and its SHA-256 hash. If the hash matches the previous snapshot,
 * no diff is needed (content unchanged).
 */
export interface SourceSnapshot {
  id: string;
  source_config_id: string;
  content_hash: string; // SHA-256 hex digest
  raw_content: string | null;
  snapshot_at: string; // ISO 8601 timestamp
  tc_version: string | null;
  tc_last_updated: string | null;
}

/**
 * Matches: public.pipeline_runs table (Migration 018, Section 5).
 *
 * Each execution of the detection pipeline logs a summary here.
 * Used for the pipeline health monitoring view.
 */
export interface PipelineRun {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: PipelineRunStatus;
  sources_checked: number;
  sources_changed: number;
  changes_detected: number;
  changes_auto_approved: number;
  changes_queued: number;
  changes_discarded: number;
  errors: Array<{ source_id?: string; url?: string; error: string }>;
  duration_ms: number | null;
}

// ---------------------------------------------------------------------------
// Scraper result (not a DB table — internal pipeline type)
// ---------------------------------------------------------------------------

/**
 * Result of scraping a single URL.
 * Used internally by the pipeline to pass data between stages.
 */
export interface ScrapeResult {
  url: string;
  content: string;
  contentHash: string;
  success: boolean;
  error?: string;
  tcVersion: string | null;
  tcLastUpdated: string | null;
}
