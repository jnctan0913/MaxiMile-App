-- =============================================================================
-- MaxiMile — Migration 018: Automated Detection Pipeline (Sprint 14 — F23 v2.0)
-- =============================================================================
-- Description:  Creates the automated rate-change detection pipeline schema.
--               Includes source configuration registry, content snapshots,
--               AI-detected changes awaiting review, and pipeline execution logs.
--               Also seeds ~50 real Singapore bank T&C URLs across 9 banks
--               with CSS selectors and scrape-method annotations.
--
-- New objects:
--   Enums     — source_type, source_status, detected_change_status,
--               pipeline_run_status
--   Tables    — source_configs, source_snapshots, detected_changes,
--               pipeline_runs
--   Functions — fn_get_sources_due_for_check()
--               fn_cleanup_old_snapshots(INT)
--   Views     — v_pipeline_health, v_pipeline_summary
--   Indexes   — 6 indexes across 3 tables
--   RLS       — source_configs: public read; other 3 tables: service_role only
--   Seed      — ~50 bank T&C URLs for 9 Singapore banks
--
-- Stories:
--   S14.1  — Source configuration registry
--   S14.2  — Content snapshot storage
--   S14.3  — AI-detected change queue
--   S14.4  — Pipeline execution logging
--   S14.5  — Bank URL seed data (~50 URLs)
--   S14.6  — CSS selector documentation
--
-- Prerequisites:
--   - 015_rate_changes.sql  (rate_change_type, alert_severity enums)
--   - 017_community_submissions.sql (community_submissions table)
--   - 001_initial_schema.sql (cards table)
--
-- Architecture Reference:  docs/RATE_DETECTION_ARCHITECTURE.md
--
-- Author:  Data Engineer
-- Created: 2026-02-21
-- Sprint:  14 — Automated Detection Pipeline (F23 v2.0)
-- =============================================================================

BEGIN;


-- ==========================================================================
-- SECTION 1: Create enums
-- ==========================================================================

-- Source type: what kind of page are we monitoring?
CREATE TYPE source_type AS ENUM (
  'bank_tc_page',
  'bank_announcement',
  'regulatory',
  'community_forum'
);

-- Source health status
CREATE TYPE source_status AS ENUM (
  'active',
  'paused',
  'broken',
  'retired'
);

-- Lifecycle of an AI-detected change
CREATE TYPE detected_change_status AS ENUM (
  'detected',
  'confirmed',
  'rejected',
  'published',
  'duplicate'
);

-- Pipeline run outcome
CREATE TYPE pipeline_run_status AS ENUM (
  'running',
  'completed',
  'failed',
  'partial'
);


-- ==========================================================================
-- SECTION 2: Create source_configs table
-- ==========================================================================
-- Registry of URLs the pipeline monitors.  Each row represents one page
-- (e.g. a bank T&C page or a rewards program landing page).

CREATE TABLE public.source_configs (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  url                 TEXT        NOT NULL UNIQUE,
  bank_name           TEXT        NOT NULL,
  source_type         source_type NOT NULL DEFAULT 'bank_tc_page',
  scrape_method       TEXT        NOT NULL DEFAULT 'playwright',  -- 'playwright' or 'http'
  css_selector        TEXT,                                       -- CSS selector for content extraction
  check_interval      INTERVAL    NOT NULL DEFAULT '1 day',
  status              source_status NOT NULL DEFAULT 'active',
  last_checked_at     TIMESTAMPTZ,
  consecutive_failures INT        DEFAULT 0,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.source_configs
  IS 'Registry of monitored URLs for the automated rate-change detection pipeline. '
     'Each row is a single page (bank T&C, announcement, regulatory, or forum) '
     'that the scraper visits on a configurable schedule.';

COMMENT ON COLUMN public.source_configs.scrape_method
  IS 'How to fetch this page: ''playwright'' for JS-heavy SPAs, ''http'' for static HTML.';

COMMENT ON COLUMN public.source_configs.css_selector
  IS 'CSS selector targeting the main content area. Used to extract only relevant '
     'text and ignore navigation, footers, and ads.';

COMMENT ON COLUMN public.source_configs.check_interval
  IS 'How often to re-check this source. Default 1 day. Regulatory sources may use 7 days.';

COMMENT ON COLUMN public.source_configs.consecutive_failures
  IS 'Counter incremented on each failed scrape, reset to 0 on success. '
     'Source is automatically set to ''broken'' after 5 consecutive failures.';


-- ==========================================================================
-- SECTION 3: Create source_snapshots table
-- ==========================================================================
-- Point-in-time content captures.  The scraper stores the extracted text
-- and its SHA-256 hash.  If the hash matches the previous snapshot,
-- no diff is needed (content unchanged).

CREATE TABLE public.source_snapshots (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  source_config_id  UUID        NOT NULL REFERENCES public.source_configs(id) ON DELETE CASCADE,
  content_hash      TEXT        NOT NULL,   -- SHA-256 of extracted content
  raw_content       TEXT,                   -- extracted text (nullable for hash-only mode)
  snapshot_at       TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.source_snapshots
  IS 'Point-in-time content captures of monitored pages. The content_hash '
     'is compared across snapshots to detect changes efficiently (SHA-256 gating). '
     'Old snapshots are periodically cleaned by fn_cleanup_old_snapshots().';

COMMENT ON COLUMN public.source_snapshots.content_hash
  IS 'SHA-256 hex digest of the extracted page content. Used for quick '
     'change detection without full-text comparison.';


-- ==========================================================================
-- SECTION 4: Create detected_changes table
-- ==========================================================================
-- When the AI classifier identifies a rate change in a content diff,
-- it creates a row here.  Changes go through a review workflow before
-- being published to the rate_changes table.

CREATE TABLE public.detected_changes (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  source_snapshot_id  UUID        REFERENCES public.source_snapshots(id),
  card_id             UUID        REFERENCES public.cards(id),   -- nullable: program-wide changes
  change_type         rate_change_type,
  category            TEXT,
  old_value           TEXT,
  new_value           TEXT,
  effective_date      DATE,
  alert_title         TEXT,
  alert_body          TEXT,
  severity            alert_severity,
  confidence          NUMERIC(3,2),   -- 0.00 to 1.00
  status              detected_change_status DEFAULT 'detected',
  reviewer_notes      TEXT,
  dedup_fingerprint   TEXT,           -- SHA-256 for duplicate detection
  created_at          TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.detected_changes
  IS 'AI-detected rate changes awaiting human review. The classifier writes here; '
     'admins review and either confirm (publish to rate_changes) or reject. '
     'Confidence-based routing: >=0.85 auto-approve, 0.50-0.84 escalate, <0.50 discard.';

COMMENT ON COLUMN public.detected_changes.confidence
  IS 'AI classifier confidence score from 0.00 to 1.00. '
     'Used for tiered routing: auto-approve / escalate / discard.';

COMMENT ON COLUMN public.detected_changes.dedup_fingerprint
  IS 'SHA-256 hash of (card_slug + change_type + normalized_new_value + effective_month). '
     'Prevents duplicate alerts from multiple sources reporting the same change.';


-- ==========================================================================
-- SECTION 5: Create pipeline_runs table
-- ==========================================================================
-- Each execution of the detection pipeline logs a summary here.
-- Used for the v_pipeline_health monitoring view.

CREATE TABLE public.pipeline_runs (
  id                    UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at            TIMESTAMPTZ DEFAULT now(),
  completed_at          TIMESTAMPTZ,
  status                pipeline_run_status DEFAULT 'running',
  sources_checked       INT         DEFAULT 0,
  sources_changed       INT         DEFAULT 0,
  changes_detected      INT         DEFAULT 0,
  changes_auto_approved INT         DEFAULT 0,
  changes_queued        INT         DEFAULT 0,
  changes_discarded     INT         DEFAULT 0,
  errors                JSONB       DEFAULT '[]',
  duration_ms           INT
);

COMMENT ON TABLE public.pipeline_runs
  IS 'Execution log for the automated detection pipeline. One row per run. '
     'Tracks how many sources were checked, how many had changes, and how '
     'many AI-detected changes were auto-approved vs queued for review.';


-- ==========================================================================
-- SECTION 6: Indexes
-- ==========================================================================

-- source_snapshots: look up latest snapshots per source
CREATE INDEX idx_source_snapshots_config_time
  ON public.source_snapshots (source_config_id, snapshot_at DESC);

-- detected_changes: filter by review status
CREATE INDEX idx_detected_changes_status
  ON public.detected_changes (status);

-- detected_changes: dedup lookups
CREATE INDEX idx_detected_changes_dedup
  ON public.detected_changes (dedup_fingerprint);

-- detected_changes: join back to snapshot
CREATE INDEX idx_detected_changes_snapshot
  ON public.detected_changes (source_snapshot_id);

-- pipeline_runs: chronological listing
CREATE INDEX idx_pipeline_runs_started
  ON public.pipeline_runs (started_at DESC);

-- source_configs: find active sources by bank
CREATE INDEX idx_source_configs_bank_status
  ON public.source_configs (bank_name, status);


-- ==========================================================================
-- SECTION 7: Row Level Security
-- ==========================================================================
-- source_configs: public read (anyone can see which URLs we monitor)
-- source_snapshots: service_role only (raw content is internal)
-- detected_changes: service_role only (review queue is admin-only)
-- pipeline_runs: service_role only (operational data)

-- source_configs — public read, no write for regular users
ALTER TABLE public.source_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "source_configs_public_read"
  ON public.source_configs
  FOR SELECT
  USING (true);

-- No INSERT/UPDATE/DELETE policies for anon/authenticated.
-- All writes go through service_role (pipeline runner).

-- source_snapshots — service_role only
ALTER TABLE public.source_snapshots ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated = no access.
-- The pipeline uses service_role key to bypass RLS.

-- detected_changes — service_role only
ALTER TABLE public.detected_changes ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated = no access.
-- Admin dashboard uses service_role key or SECURITY DEFINER RPCs.

-- pipeline_runs — service_role only
ALTER TABLE public.pipeline_runs ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated = no access.
-- Pipeline health view uses SECURITY DEFINER function.


-- ==========================================================================
-- SECTION 8: Helper function — fn_get_sources_due_for_check()
-- ==========================================================================
-- Returns active sources where last_checked_at is NULL (never checked)
-- or older than the source's check_interval.
-- Called by the pipeline scheduler to determine which URLs to scrape.

CREATE OR REPLACE FUNCTION public.fn_get_sources_due_for_check()
RETURNS SETOF public.source_configs
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.source_configs
  WHERE status = 'active'
    AND (
      last_checked_at IS NULL
      OR last_checked_at < (now() - check_interval)
    )
  ORDER BY last_checked_at ASC NULLS FIRST;
END;
$$;

COMMENT ON FUNCTION public.fn_get_sources_due_for_check()
  IS 'Returns active source_configs that are overdue for a check. '
     'Sources that have never been checked (last_checked_at IS NULL) come first, '
     'followed by the oldest-checked sources.';


-- ==========================================================================
-- SECTION 9: Helper function — fn_cleanup_old_snapshots(INT)
-- ==========================================================================
-- Deletes snapshots older than N days, but always keeps the latest
-- snapshot per source_config_id (so we have a baseline for diffing).
-- Default retention: 90 days.

CREATE OR REPLACE FUNCTION public.fn_cleanup_old_snapshots(
  days_to_keep INT DEFAULT 90
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INT;
BEGIN
  WITH latest_per_source AS (
    -- Find the most recent snapshot_at per source
    SELECT DISTINCT ON (source_config_id)
      id AS keep_id
    FROM public.source_snapshots
    ORDER BY source_config_id, snapshot_at DESC
  ),
  deleted AS (
    DELETE FROM public.source_snapshots
    WHERE snapshot_at < (now() - make_interval(days => days_to_keep))
      AND id NOT IN (SELECT keep_id FROM latest_per_source)
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted FROM deleted;

  RETURN v_deleted;
END;
$$;

COMMENT ON FUNCTION public.fn_cleanup_old_snapshots(INT)
  IS 'Deletes source_snapshots older than the specified number of days (default 90), '
     'but always retains the latest snapshot per source so we have a diff baseline. '
     'Returns the number of rows deleted. Call periodically via pg_cron or pipeline.';


-- ==========================================================================
-- SECTION 10: Seed source_configs — ~50 Real Singapore Bank URLs
-- ==========================================================================
-- These are real, publicly accessible URLs for the 9 Singapore banks
-- tracked by MaxiMile.  Each URL is annotated with:
--   - bank_name: which bank
--   - source_type: bank_tc_page (default) or bank_announcement
--   - scrape_method: 'playwright' (JS-heavy SPA) or 'http' (static HTML)
--   - css_selector: CSS selector targeting the main content area
--   - notes: what this page covers
--
-- CSS Selector Strategy per Bank:
-- ┌───────────────────┬───────────────┬──────────────────────────────────────┐
-- │ Bank              │ Scrape Method │ Selector Notes                       │
-- ├───────────────────┼───────────────┼──────────────────────────────────────┤
-- │ DBS               │ Playwright    │ React SPA; .card-detail, main article│
-- │ OCBC              │ Playwright    │ SPA with lazy-load; .content-area    │
-- │ UOB               │ Playwright    │ SPA; .page-content, main .content    │
-- │ Citibank          │ Playwright    │ Angular-based; .main-content         │
-- │ HSBC              │ HTTP          │ Mostly static; .article-content      │
-- │ Standard Chartered│ Playwright    │ React SPA; .content-body             │
-- │ Maybank           │ HTTP          │ Mostly static; .content-area         │
-- │ BOC               │ HTTP          │ Static HTML; .TRS_Editor, .content   │
-- │ Amex              │ Playwright    │ React SPA; .axp-page-content         │
-- └───────────────────┴───────────────┴──────────────────────────────────────┘

INSERT INTO public.source_configs (url, bank_name, source_type, scrape_method, css_selector, notes) VALUES

  -- ========================================================================
  -- DBS (7 URLs) — Playwright required (React SPA)
  -- ========================================================================
  (
    'https://www.dbs.com.sg/personal/cards/credit-cards/default.page',
    'DBS', 'bank_tc_page', 'playwright',
    'main .card-listing',
    'DBS credit cards listing page — all card products'
  ),
  (
    'https://www.dbs.com.sg/personal/cards/cards-terms-conditions.page',
    'DBS', 'bank_tc_page', 'playwright',
    'main .content-area',
    'DBS cards master T&C page — earn rates, fees, general conditions'
  ),
  (
    'https://www.dbs.com.sg/personal/cards/credit-cards/dbs-altitude-cards',
    'DBS', 'bank_tc_page', 'playwright',
    'main .card-detail',
    'DBS Altitude Visa Signature card detail page — earn rates and benefits'
  ),
  (
    'https://www.dbs.com.sg/personal/cards/credit-cards/dbs-woman-mastercard-card',
    'DBS', 'bank_tc_page', 'playwright',
    'main .card-detail',
    'DBS Woman''s World Mastercard card detail page — 10X DBS Points categories'
  ),
  (
    'https://www.dbs.com.sg/iwov-resources/media/pdf/cards/dbs-womans-card-tnc.pdf',
    'DBS', 'bank_tc_page', 'http',
    NULL,
    'DBS Woman''s World Card T&C PDF — official terms document'
  ),
  (
    'https://www.dbs.com.sg/personal/cards/card-services/default.page',
    'DBS', 'bank_tc_page', 'playwright',
    'main .content-area',
    'DBS card services page — fee schedule, payment info'
  ),
  (
    'https://www.dbs.com.sg/personal/support/cards-product.html',
    'DBS', 'bank_announcement', 'playwright',
    'main .content-area',
    'DBS cards support/FAQ page — captures product change announcements'
  ),

  -- ========================================================================
  -- OCBC (7 URLs) — Playwright required (SPA with lazy-loading)
  -- ========================================================================
  (
    'https://www.ocbc.com/personal-banking/cards/credit-card',
    'OCBC', 'bank_tc_page', 'playwright',
    '.content-area',
    'OCBC credit cards listing — all miles, cashback, rewards cards'
  ),
  (
    'https://www.ocbc.com/personal-banking/cards/90-degrees-travel-credit-card',
    'OCBC', 'bank_tc_page', 'playwright',
    '.content-area',
    'OCBC 90 Degrees N Mastercard — earn rates, travel benefits, miles program'
  ),
  (
    'https://www.ocbc.com/personal-banking/cards/90-degrees-visa-card.page',
    'OCBC', 'bank_tc_page', 'playwright',
    '.content-area',
    'OCBC 90 Degrees N Visa — alternate network card details'
  ),
  (
    'https://www.ocbc.com/personal-banking/cards/rewards-card',
    'OCBC', 'bank_tc_page', 'playwright',
    '.content-area',
    'OCBC Titanium Rewards card — OCBC$ earn rates and categories'
  ),
  (
    'https://www.ocbc.com/iwov-resources/sg/ocbc/personal/pdf/cards/tnc-titaniumrewards-creditcard-programme-wef-1mar23.pdf',
    'OCBC', 'bank_tc_page', 'http',
    NULL,
    'OCBC Titanium Rewards programme T&C PDF — official terms'
  ),
  (
    'https://www.ocbc.com/iwov-resources/sg/ocbc/personal/pdf/cards/tncs-governing-ocbc-90n-card-programme.pdf',
    'OCBC', 'bank_tc_page', 'http',
    NULL,
    'OCBC 90N Card programme T&C PDF — official VOYAGE Miles terms'
  ),
  (
    'https://www.ocbc.com/personal-banking/cards',
    'OCBC', 'bank_tc_page', 'playwright',
    '.content-area',
    'OCBC all cards landing page — overview of card portfolio'
  ),

  -- ========================================================================
  -- UOB (6 URLs) — Playwright required (SPA)
  -- ========================================================================
  (
    'https://www.uob.com.sg/personal/cards/travel/prvi-miles-card.page',
    'UOB', 'bank_tc_page', 'playwright',
    'main .page-content',
    'UOB PRVI Miles card detail page — earn rates, travel benefits'
  ),
  (
    'https://www.uob.com.sg/personal/cards/rewards/preferred-platinum-visa-card.page',
    'UOB', 'bank_tc_page', 'playwright',
    'main .page-content',
    'UOB Preferred Platinum Visa — UNI$ earn rates and categories'
  ),
  (
    'https://www.uob.com.sg/personal/cards/rewards/visa-signature-card.page',
    'UOB', 'bank_tc_page', 'playwright',
    'main .page-content',
    'UOB Visa Signature — 4 mpd contactless, earn rates'
  ),
  (
    'https://www.uob.com.sg/personal/cards/card-privileges/uob-dollar.page',
    'UOB', 'bank_tc_page', 'playwright',
    'main .page-content',
    'UOB UNI$ programme page — points earn rates, conversion, expiry'
  ),
  (
    'https://www.uob.com.sg/personal/cards/rewards/index.page',
    'UOB', 'bank_tc_page', 'playwright',
    'main .page-content',
    'UOB Rewards+ landing page — rewards cards overview'
  ),
  (
    'https://www.uob.com.sg/assets/pdfs/personal/cards/rewardsplus_tnc.pdf',
    'UOB', 'bank_tc_page', 'http',
    NULL,
    'UOB Rewards+ programme T&C PDF — official UNI$ terms'
  ),

  -- ========================================================================
  -- Citibank (5 URLs) — Playwright required (Angular SPA)
  -- ========================================================================
  (
    'https://www.citibank.com.sg/credit-cards/privileges-programs/credit-card-rewards-redemption/index.html',
    'Citibank', 'bank_tc_page', 'playwright',
    '.main-content',
    'Citi ThankYou Rewards redemption page — program overview'
  ),
  (
    'https://www.citibank.com.sg/pdf/0424/citi-thankyou-rewards-terms-and-conditions.pdf',
    'Citibank', 'bank_tc_page', 'http',
    NULL,
    'Citi ThankYou Rewards T&C PDF — official terms for all Citi cards'
  ),
  (
    'https://www.citibank.com.sg/credit-cards/rewards/citi-rewards-card/',
    'Citibank', 'bank_tc_page', 'playwright',
    '.main-content',
    'Citi Rewards Card detail page — 10X points categories'
  ),
  (
    'https://www.citibank.com.sg/credit-cards/pdf/rewards-exclusion-list.pdf',
    'Citibank', 'bank_tc_page', 'http',
    NULL,
    'Citi rewards exclusion list PDF — MCC exclusions'
  ),
  (
    'https://www.citibank.com.sg/credit-cards/privileges-programs/credit-card-rewards-redemption/pay-with-points.html',
    'Citibank', 'bank_tc_page', 'playwright',
    '.main-content',
    'Citi Pay with Points page — ThankYou Points conversion rates'
  ),

  -- ========================================================================
  -- HSBC (6 URLs) — Mostly HTTP (static pages), some Playwright
  -- ========================================================================
  (
    'https://www.hsbc.com.sg/credit-cards/rewards/',
    'HSBC', 'bank_tc_page', 'http',
    '.article-content',
    'HSBC rewards programme page — earn rates overview'
  ),
  (
    'https://www.hsbc.com.sg/credit-cards/products/revolution/',
    'HSBC', 'bank_tc_page', 'http',
    '.article-content',
    'HSBC Revolution card detail page — 10X reward points categories'
  ),
  (
    'https://www.hsbc.com.sg/content/dam/hsbc/sg/documents/credit-cards/rewards/terms-and-conditions-wef-2025.pdf',
    'HSBC', 'bank_tc_page', 'http',
    NULL,
    'HSBC Rewards Programme T&C PDF (effective 2025) — official terms'
  ),
  (
    'https://www.hsbc.com.sg/content/dam/hsbc/sg/documents/credit-cards/travelone/hsbc-rewards-programme-terms-and-conditions.pdf',
    'HSBC', 'bank_tc_page', 'http',
    NULL,
    'HSBC TravelOne rewards programme T&C PDF — travel card terms'
  ),
  (
    'https://cardpromotions.hsbc.com.sg/general-tnc/',
    'HSBC', 'bank_tc_page', 'http',
    'main .content-body',
    'HSBC general card T&C page — fee schedule and general conditions'
  ),
  (
    'https://www.hsbc.com.sg/promotions/credit-cards/',
    'HSBC', 'bank_announcement', 'http',
    '.article-content',
    'HSBC credit card promotions page — captures new offers and rate changes'
  ),

  -- ========================================================================
  -- Standard Chartered (6 URLs) — Playwright required (React SPA)
  -- ========================================================================
  (
    'https://www.sc.com/sg/credit-cards/',
    'Standard Chartered', 'bank_tc_page', 'playwright',
    '.content-body',
    'SC credit cards listing page — all card products'
  ),
  (
    'https://www.sc.com/sg/credit-cards/visa-infinite-card/',
    'Standard Chartered', 'bank_tc_page', 'playwright',
    '.content-body',
    'SC Visa Infinite card detail page — earn rates, Priority Pass'
  ),
  (
    'https://www.sc.com/sg/credit-cards/x-card/',
    'Standard Chartered', 'bank_tc_page', 'playwright',
    '.content-body',
    'SC X Card (Visa Infinite Metal) detail page — 360 Rewards earn rates'
  ),
  (
    'https://www.sc.com/sg/credit-cards/beyond-credit-card/',
    'Standard Chartered', 'bank_tc_page', 'playwright',
    '.content-body',
    'SC Beyond credit card detail page — tiered earn rates'
  ),
  (
    'https://www.sc.com/sg/rewards-programmes/360-rewards/',
    'Standard Chartered', 'bank_tc_page', 'playwright',
    '.content-body',
    'SC 360 Rewards programme page — points earn rates, conversion, partners'
  ),
  (
    'https://www.sc.com/sg/_pdf/rewards/programtnc.pdf',
    'Standard Chartered', 'bank_tc_page', 'http',
    NULL,
    'SC 360 Rewards Programme T&C PDF — official terms'
  ),

  -- ========================================================================
  -- Maybank (6 URLs) — Mostly HTTP (static), some Playwright
  -- ========================================================================
  (
    'https://www.maybank2u.com.sg/en/personal/cards/credit/maybank-horizon-visa-signature-card.page',
    'Maybank', 'bank_tc_page', 'http',
    '.content-area',
    'Maybank Horizon Visa Signature card — earn rates, TreatsPoints'
  ),
  (
    'https://www.maybank2u.com.sg/en/personal/cards/rewards/catalogue.page',
    'Maybank', 'bank_tc_page', 'http',
    '.content-area',
    'Maybank TREATS Points rewards catalogue — redemption rates'
  ),
  (
    'https://www.maybank2u.com.sg/iwov-resources/sg/pdf/cards/terms_and_conditions.pdf',
    'Maybank', 'bank_tc_page', 'http',
    NULL,
    'Maybank cards master T&C PDF — general terms and fee schedule'
  ),
  (
    'https://www.maybank2u.com.sg/iwov-resources/sg/pdf/cards/tp-rewards-tnc.pdf',
    'Maybank', 'bank_tc_page', 'http',
    NULL,
    'Maybank TreatsPoints Rewards Programme T&C PDF — official terms'
  ),
  (
    'https://www.maybank2u.com.sg/iwov-resources/sg/pdf/cards/horizon-visa-signature-card-tnc.pdf',
    'Maybank', 'bank_tc_page', 'http',
    NULL,
    'Maybank Horizon Visa Signature TreatsPoints T&C PDF'
  ),
  (
    'https://www.maybank2u.com.sg/en/personal/about_us/others/cards-terms-and-conditions.page',
    'Maybank', 'bank_tc_page', 'http',
    '.content-area',
    'Maybank master cards T&C landing page — links to all card terms'
  ),

  -- ========================================================================
  -- Bank of China (5 URLs) — HTTP (static HTML site)
  -- ========================================================================
  (
    'https://www.bankofchina.com/sg/bcservice/bc1/',
    'BOC', 'bank_tc_page', 'http',
    '.TRS_Editor',
    'BOC credit/debit cards listing page — all card products'
  ),
  (
    'https://www.bankofchina.com/sg/bcservice/bc1/201909/t20190903_16537165.html',
    'BOC', 'bank_tc_page', 'http',
    '.TRS_Editor',
    'BOC Elite Miles World Mastercard detail page — earn rates and benefits'
  ),
  (
    'https://www.bankofchina.com/sg/bcservice/bc3/',
    'BOC', 'bank_tc_page', 'http',
    '.TRS_Editor',
    'BOC Rewards page — points programme overview'
  ),
  (
    'https://www.bankofchina.com/sg/bocinfo/bi5/201810/t20181009_15906464.html',
    'BOC', 'bank_tc_page', 'http',
    '.TRS_Editor',
    'BOC Elite Miles World Mastercard Programme T&C page'
  ),
  (
    'https://www.bankofchina.com/sg/bocinfo/bi1/202505/t20250523_25361106.html',
    'BOC', 'bank_announcement', 'http',
    '.TRS_Editor',
    'BOC notice of T&C changes for Elite Miles programme (Jul 2025)'
  ),

  -- ========================================================================
  -- American Express (6 URLs) — Playwright required (React SPA)
  -- ========================================================================
  (
    'https://www.americanexpress.com/en-sg/credit-cards/',
    'Amex', 'bank_tc_page', 'playwright',
    'main [class*="page-content"]',
    'Amex Singapore credit cards listing page — all card products'
  ),
  (
    'https://www.americanexpress.com/en-sg/credit-cards/singapore-airlines-credit-cards/',
    'Amex', 'bank_tc_page', 'playwright',
    'main [class*="page-content"]',
    'Amex KrisFlyer credit cards page — Ascend and standard KrisFlyer cards'
  ),
  (
    'https://www.americanexpress.com/en-sg/rewards/membership-rewards/about-program',
    'Amex', 'bank_tc_page', 'playwright',
    'main [class*="page-content"]',
    'Amex Membership Rewards programme page — MR points earning and transfer'
  ),
  (
    'https://www.americanexpress.com/en-sg/rewards/membership-rewards/about-earning',
    'Amex', 'bank_tc_page', 'playwright',
    'main [class*="page-content"]',
    'Amex MR earning points page — earn rates per card, bonus categories'
  ),
  (
    'https://www.americanexpress.com/en-sg/credit-cards/rewards-cards/',
    'Amex', 'bank_tc_page', 'playwright',
    'main [class*="page-content"]',
    'Amex rewards cards listing — True Cashback, EveryDay, Gold etc.'
  ),
  (
    'https://www.americanexpress.com/en-sg/benefits/rewards-card/',
    'Amex', 'bank_tc_page', 'playwright',
    'main [class*="page-content"]',
    'Amex Rewards Card benefits page — earn rates and redemption options'
  );


-- ==========================================================================
-- SECTION 11: Monitoring views — v_pipeline_health, v_pipeline_summary
-- ==========================================================================
-- Per-source health metrics and aggregate summary for the pipeline
-- monitoring dashboard (T14.14).

CREATE OR REPLACE VIEW v_pipeline_health AS
SELECT
  sc.id AS source_id,
  sc.url,
  sc.bank_name,
  sc.source_type::TEXT,
  sc.scrape_method,
  sc.status::TEXT AS source_status,
  sc.last_checked_at,
  sc.consecutive_failures,
  sc.check_interval,
  -- Uptime: percentage of successful checks in last 30 days
  -- (total snapshots / expected checks based on interval)
  COALESCE(
    ROUND(
      (snapshot_counts.snapshot_count::NUMERIC /
       GREATEST(EXTRACT(EPOCH FROM INTERVAL '30 days') / EXTRACT(EPOCH FROM sc.check_interval), 1)
      ) * 100, 1
    ), 0
  ) AS uptime_pct_30d,
  -- Last snapshot info
  latest_snapshot.snapshot_at AS last_snapshot_at,
  latest_snapshot.content_hash AS last_content_hash,
  -- Change detection stats (last 30 days)
  COALESCE(change_counts.changes_detected, 0) AS changes_detected_30d,
  -- Time since last check
  CASE
    WHEN sc.last_checked_at IS NULL THEN 'never'
    WHEN NOW() - sc.last_checked_at < INTERVAL '2 hours' THEN 'recent'
    WHEN NOW() - sc.last_checked_at < sc.check_interval * 2 THEN 'on_schedule'
    ELSE 'overdue'
  END AS check_freshness,
  sc.created_at AS source_created_at
FROM source_configs sc
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS snapshot_count
  FROM source_snapshots ss
  WHERE ss.source_config_id = sc.id
    AND ss.snapshot_at > NOW() - INTERVAL '30 days'
) snapshot_counts ON true
LEFT JOIN LATERAL (
  SELECT ss.snapshot_at, ss.content_hash
  FROM source_snapshots ss
  WHERE ss.source_config_id = sc.id
  ORDER BY ss.snapshot_at DESC
  LIMIT 1
) latest_snapshot ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS changes_detected
  FROM detected_changes dc
  JOIN source_snapshots ss ON dc.source_snapshot_id = ss.id
  WHERE ss.source_config_id = sc.id
    AND dc.created_at > NOW() - INTERVAL '30 days'
) change_counts ON true
ORDER BY
  CASE sc.status
    WHEN 'broken' THEN 0
    WHEN 'active' THEN 1
    WHEN 'paused' THEN 2
    WHEN 'retired' THEN 3
  END,
  sc.consecutive_failures DESC,
  sc.bank_name;

COMMENT ON VIEW v_pipeline_health IS 'Per-source health metrics for the pipeline monitoring dashboard. Shows uptime, freshness, failure counts, and change detection stats.';


CREATE OR REPLACE VIEW v_pipeline_summary AS
SELECT
  COUNT(*) FILTER (WHERE status = 'active') AS active_sources,
  COUNT(*) FILTER (WHERE status = 'broken') AS broken_sources,
  COUNT(*) FILTER (WHERE status = 'paused') AS paused_sources,
  COUNT(*) AS total_sources,
  -- Latest pipeline run stats
  (SELECT started_at FROM pipeline_runs ORDER BY started_at DESC LIMIT 1) AS last_run_at,
  (SELECT status::TEXT FROM pipeline_runs ORDER BY started_at DESC LIMIT 1) AS last_run_status,
  (SELECT sources_checked FROM pipeline_runs ORDER BY started_at DESC LIMIT 1) AS last_run_sources_checked,
  (SELECT changes_detected FROM pipeline_runs ORDER BY started_at DESC LIMIT 1) AS last_run_changes_detected,
  -- 30-day change stats
  (SELECT COUNT(*) FROM detected_changes WHERE created_at > NOW() - INTERVAL '30 days') AS changes_detected_30d
FROM source_configs;

COMMENT ON VIEW v_pipeline_summary IS 'Aggregate pipeline health summary for the dashboard header.';


-- ==========================================================================
-- SECTION 12: Verification queries
-- ==========================================================================
-- Run after applying to verify:
--
--   -- Enums created (4 new types)
--   SELECT unnest(enum_range(NULL::source_type));
--   -- Should return: bank_tc_page, bank_announcement, regulatory, community_forum
--
--   SELECT unnest(enum_range(NULL::source_status));
--   -- Should return: active, paused, broken, retired
--
--   SELECT unnest(enum_range(NULL::detected_change_status));
--   -- Should return: detected, confirmed, rejected, published, duplicate
--
--   SELECT unnest(enum_range(NULL::pipeline_run_status));
--   -- Should return: running, completed, failed, partial
--
--   -- Tables created (4 new tables)
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public'
--     AND table_name IN ('source_configs', 'source_snapshots',
--                        'detected_changes', 'pipeline_runs');
--   -- Should return 4 rows
--
--   -- Seed data: ~54 URLs across 9 banks
--   SELECT bank_name, COUNT(*) AS url_count
--   FROM source_configs
--   GROUP BY bank_name
--   ORDER BY bank_name;
--   -- Should return 9 banks with 5-7 URLs each (~54 total)
--
--   -- Scrape method distribution
--   SELECT scrape_method, COUNT(*) FROM source_configs GROUP BY scrape_method;
--   -- Should return: playwright ~34, http ~20
--
--   -- Helper functions exist
--   SELECT routine_name FROM information_schema.routines
--   WHERE routine_schema = 'public'
--     AND routine_name IN ('fn_get_sources_due_for_check', 'fn_cleanup_old_snapshots');
--   -- Should return 2 rows
--
--   -- All sources are due for check (never been checked)
--   SELECT COUNT(*) FROM fn_get_sources_due_for_check();
--   -- Should return ~54 (all of them, since last_checked_at is NULL)
--
--   -- RLS is enabled on all 4 tables
--   SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname = 'public'
--     AND tablename IN ('source_configs', 'source_snapshots',
--                       'detected_changes', 'pipeline_runs');
--   -- Should return 4 rows with rowsecurity = true
--
--   -- Monitoring views exist
--   SELECT * FROM v_pipeline_health LIMIT 5;
--   -- Should return up to 5 rows with source health metrics
--
--   SELECT * FROM v_pipeline_summary;
--   -- Should return 1 row with aggregate pipeline stats


COMMIT;


-- ==========================================================================
-- ROLLBACK:
-- DROP VIEW IF EXISTS v_pipeline_summary;
-- DROP VIEW IF EXISTS v_pipeline_health;
-- DROP FUNCTION IF EXISTS public.fn_cleanup_old_snapshots(INT);
-- DROP FUNCTION IF EXISTS public.fn_get_sources_due_for_check();
-- DROP TABLE IF EXISTS public.pipeline_runs;
-- DROP TABLE IF EXISTS public.detected_changes;
-- DROP TABLE IF EXISTS public.source_snapshots;
-- DROP TABLE IF EXISTS public.source_configs;
-- DROP TYPE IF EXISTS pipeline_run_status;
-- DROP TYPE IF EXISTS detected_change_status;
-- DROP TYPE IF EXISTS source_status;
-- DROP TYPE IF EXISTS source_type;
-- ==========================================================================
