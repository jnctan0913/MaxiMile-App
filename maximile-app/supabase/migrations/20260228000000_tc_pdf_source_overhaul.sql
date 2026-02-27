-- =============================================================================
-- MaxiMile — Migration: T&C PDF Source Overhaul (Sprint 16)
-- =============================================================================
-- Description:  Refocuses the detection pipeline from ~54 broad bank URLs
--               to ~35 targeted T&C document sources (30 card-specific PDFs
--               + 5 bank index pages). Adds version/date metadata columns
--               for cheap change detection before hash comparison.
--
-- Changes:
--   1. Add new enum values: bank_tc_pdf, bank_index_page
--   2. Add columns to source_configs: card_name, tc_version, tc_last_updated
--   3. Add columns to source_snapshots: tc_version, tc_last_updated
--   4. Retire all existing ~54 sources
--   5. Insert 30 card-specific T&C PDF sources + 5 bank index pages
--   6. Update fn_get_sources_due_for_check() to return new columns
--   7. Update v_pipeline_health view to include version info
--
-- Rationale:
--   First production run failed on 45/54 sources — Playwright selector
--   timeouts, navigation timeouts, PDF Unicode errors. T&C PDFs are the
--   authoritative source of truth and can be fetched via simple HTTP
--   (no Playwright needed for 85% of sources).
--
-- Author:  Data Engineer
-- Created: 2026-02-28
-- Sprint:  16 — T&C Focus Refactor
-- =============================================================================

-- NOTE: Enum values (bank_tc_pdf, bank_index_page) are added in a separate
-- prior migration (20260227300000_add_source_type_enums.sql) because
-- PostgreSQL cannot use newly-added enum values in the same transaction.

-- ==========================================================================
-- SECTION 2: Add T&C metadata columns to source_configs
-- ==========================================================================

ALTER TABLE public.source_configs
  ADD COLUMN IF NOT EXISTS card_name TEXT,
  ADD COLUMN IF NOT EXISTS tc_version TEXT,
  ADD COLUMN IF NOT EXISTS tc_last_updated TEXT;

COMMENT ON COLUMN public.source_configs.card_name
  IS 'The specific credit card this T&C document covers (e.g., "DBS Altitude Visa"). '
     'NULL for bank-wide or index page sources.';

COMMENT ON COLUMN public.source_configs.tc_version
  IS 'Last known version string extracted from the T&C document (e.g., "Version 1.2"). '
     'Used as a cheap change-detection gate before SHA-256 hash comparison.';

COMMENT ON COLUMN public.source_configs.tc_last_updated
  IS 'Last known "last updated" or "effective date" extracted from the T&C document. '
     'Used alongside tc_version for change detection gating.';


-- ==========================================================================
-- SECTION 3: Add T&C metadata columns to source_snapshots
-- ==========================================================================

ALTER TABLE public.source_snapshots
  ADD COLUMN IF NOT EXISTS tc_version TEXT,
  ADD COLUMN IF NOT EXISTS tc_last_updated TEXT;

COMMENT ON COLUMN public.source_snapshots.tc_version
  IS 'Version string extracted from the T&C document at snapshot time.';

COMMENT ON COLUMN public.source_snapshots.tc_last_updated
  IS '"Last updated" / "effective date" extracted from the T&C document at snapshot time.';


-- ==========================================================================
-- SECTION 4: Retire all existing sources
-- ==========================================================================
-- Mark all 54 original sources as 'retired' rather than deleting them,
-- preserving history and allowing rollback if needed.

UPDATE public.source_configs
SET status = 'retired'
WHERE status = 'active';


-- ==========================================================================
-- SECTION 5: Insert 30 card-specific T&C PDF sources + 5 bank index pages
-- ==========================================================================
-- All PDFs use scrape_method = 'http' (no Playwright needed).
-- Index pages use 'playwright' since some banks have SPAs.
-- The url UNIQUE constraint means we must use ON CONFLICT to handle
-- any URLs that already exist from the original seed.

-- ========================================================================
-- DBS (3 PDFs + 1 index page)
-- ========================================================================

INSERT INTO public.source_configs (url, bank_name, source_type, scrape_method, css_selector, card_name, notes) VALUES
  (
    'https://www.dbs.com.sg/iwov-resources/media/pdf/cards/dbs-altitude-card-tnc.pdf',
    'DBS', 'bank_tc_pdf', 'http', NULL, 'DBS Altitude Visa',
    'DBS Altitude Visa T&C PDF — earn rates, miles conversion, caps'
  ),
  (
    'https://www.dbs.com.sg/iwov-resources/media/pdf/cards/dbs-vantage-card-tnc.pdf',
    'DBS', 'bank_tc_pdf', 'http', NULL, 'DBS Vantage Visa Infinite',
    'DBS Vantage Visa Infinite T&C PDF — earn rates, Priority Pass'
  ),
  (
    'https://www.dbs.com.sg/iwov-resources/media/pdf/cards/posb-everyday-card-tnc.pdf',
    'DBS', 'bank_tc_pdf', 'http', NULL, 'POSB Everyday Card',
    'POSB Everyday Card T&C PDF — earn rates, bonus categories'
  ),
  (
    'https://www.dbs.com.sg/personal/cards/cards-terms-conditions.page',
    'DBS', 'bank_index_page', 'playwright', 'main .content-area', NULL,
    'DBS cards T&C index page — links to all card T&C PDFs'
  )
ON CONFLICT (url) DO UPDATE SET
  source_type = EXCLUDED.source_type,
  card_name = EXCLUDED.card_name,
  status = 'active';

-- DBS Woman's World already exists — reactivate and update
UPDATE public.source_configs
SET status = 'active',
    source_type = 'bank_tc_pdf',
    card_name = 'DBS Woman''s World Card'
WHERE url = 'https://www.dbs.com.sg/iwov-resources/media/pdf/cards/dbs-womans-card-tnc.pdf';


-- ========================================================================
-- OCBC (3 PDFs + 1 index page)
-- ========================================================================

INSERT INTO public.source_configs (url, bank_name, source_type, scrape_method, css_selector, card_name, notes) VALUES
  (
    'https://www.ocbc.com/iwov-resources/sg/ocbc/personal/pdf/cards/tnc-voyage-card-programme.pdf',
    'OCBC', 'bank_tc_pdf', 'http', NULL, 'OCBC VOYAGE Card',
    'OCBC VOYAGE Card T&C PDF — earn rates, VOYAGE Miles'
  ),
  (
    'https://www.ocbc.com/personal-banking/cards',
    'OCBC', 'bank_index_page', 'playwright', '.content-area', NULL,
    'OCBC cards index page — links to all card T&C PDFs'
  )
ON CONFLICT (url) DO UPDATE SET
  source_type = EXCLUDED.source_type,
  card_name = EXCLUDED.card_name,
  status = 'active';

-- Reactivate existing OCBC PDFs
UPDATE public.source_configs
SET status = 'active',
    source_type = 'bank_tc_pdf',
    card_name = 'OCBC Titanium Rewards'
WHERE url = 'https://www.ocbc.com/iwov-resources/sg/ocbc/personal/pdf/cards/tnc-titaniumrewards-creditcard-programme-wef-1mar23.pdf';

UPDATE public.source_configs
SET status = 'active',
    source_type = 'bank_tc_pdf',
    card_name = 'OCBC 90°N Visa'
WHERE url = 'https://www.ocbc.com/iwov-resources/sg/ocbc/personal/pdf/cards/tncs-governing-ocbc-90n-card-programme.pdf';


-- ========================================================================
-- UOB (4 PDFs)
-- ========================================================================

INSERT INTO public.source_configs (url, bank_name, source_type, scrape_method, css_selector, card_name, notes) VALUES
  (
    'https://www.uob.com.sg/assets/pdfs/personal/cards/prvi-miles-tnc.pdf',
    'UOB', 'bank_tc_pdf', 'http', NULL, 'UOB PRVI Miles Visa',
    'UOB PRVI Miles T&C PDF — earn rates, miles conversion'
  ),
  (
    'https://www.uob.com.sg/assets/pdfs/personal/cards/preferred-platinum-tnc.pdf',
    'UOB', 'bank_tc_pdf', 'http', NULL, 'UOB Preferred Platinum Visa',
    'UOB Preferred Platinum Visa T&C PDF — UNI$ earn rates'
  ),
  (
    'https://www.uob.com.sg/assets/pdfs/personal/cards/visa-signature-tnc.pdf',
    'UOB', 'bank_tc_pdf', 'http', NULL, 'UOB Visa Signature',
    'UOB Visa Signature T&C PDF — 4mpd contactless rates'
  ),
  (
    'https://www.uob.com.sg/assets/pdfs/personal/cards/ladys-card-tnc.pdf',
    'UOB', 'bank_tc_pdf', 'http', NULL, 'UOB Lady''s Card',
    'UOB Lady''s Card T&C PDF — earn rates and benefits'
  ),
  (
    'https://www.uob.com.sg/assets/pdfs/personal/cards/ladys-solitaire-tnc.pdf',
    'UOB', 'bank_tc_pdf', 'http', NULL, 'UOB Lady''s Solitaire Metal Card',
    'UOB Lady''s Solitaire Metal Card T&C PDF — category bonuses'
  ),
  (
    'https://www.uob.com.sg/assets/pdfs/personal/cards/krisflyer-uob-tnc.pdf',
    'UOB', 'bank_tc_pdf', 'http', NULL, 'KrisFlyer UOB Card',
    'KrisFlyer UOB Card T&C PDF — KrisFlyer miles earn rates'
  )
ON CONFLICT (url) DO UPDATE SET
  source_type = EXCLUDED.source_type,
  card_name = EXCLUDED.card_name,
  status = 'active';

-- Reactivate existing UOB Rewards+ T&C
UPDATE public.source_configs
SET status = 'active',
    source_type = 'bank_tc_pdf',
    card_name = NULL,
    notes = 'UOB Rewards+ programme T&C PDF — covers all UOB cards UNI$ terms'
WHERE url = 'https://www.uob.com.sg/assets/pdfs/personal/cards/rewardsplus_tnc.pdf';


-- ========================================================================
-- HSBC (3 PDFs)
-- ========================================================================

INSERT INTO public.source_configs (url, bank_name, source_type, scrape_method, css_selector, card_name, notes) VALUES
  (
    'https://www.hsbc.com.sg/content/dam/hsbc/sg/documents/credit-cards/revolution/terms-and-conditions.pdf',
    'HSBC', 'bank_tc_pdf', 'http', NULL, 'HSBC Revolution Card',
    'HSBC Revolution Card T&C PDF — 10X reward points categories'
  ),
  (
    'https://www.hsbc.com.sg/content/dam/hsbc/sg/documents/credit-cards/premier/terms-and-conditions.pdf',
    'HSBC', 'bank_tc_pdf', 'http', NULL, 'HSBC Premier Mastercard',
    'HSBC Premier Mastercard T&C PDF — earn rates and benefits'
  )
ON CONFLICT (url) DO UPDATE SET
  source_type = EXCLUDED.source_type,
  card_name = EXCLUDED.card_name,
  status = 'active';

-- Reactivate existing HSBC PDFs
UPDATE public.source_configs
SET status = 'active',
    source_type = 'bank_tc_pdf',
    card_name = 'HSBC TravelOne Card'
WHERE url = 'https://www.hsbc.com.sg/content/dam/hsbc/sg/documents/credit-cards/travelone/hsbc-rewards-programme-terms-and-conditions.pdf';

UPDATE public.source_configs
SET status = 'active',
    source_type = 'bank_tc_pdf',
    card_name = NULL,
    notes = 'HSBC Rewards Programme master T&C PDF — covers all HSBC cards'
WHERE url = 'https://www.hsbc.com.sg/content/dam/hsbc/sg/documents/credit-cards/rewards/terms-and-conditions-wef-2025.pdf';


-- ========================================================================
-- Amex (2 PDFs)
-- ========================================================================

INSERT INTO public.source_configs (url, bank_name, source_type, scrape_method, css_selector, card_name, notes) VALUES
  (
    'https://www.americanexpress.com/content/dam/amex/sg/credit-cards/krisflyer-ascend/krisflyer-ascend-tnc.pdf',
    'Amex', 'bank_tc_pdf', 'http', NULL, 'Amex KrisFlyer Ascend',
    'Amex KrisFlyer Ascend T&C PDF — MR points, KrisFlyer transfer'
  ),
  (
    'https://www.americanexpress.com/content/dam/amex/sg/credit-cards/krisflyer/krisflyer-credit-card-tnc.pdf',
    'Amex', 'bank_tc_pdf', 'http', NULL, 'Amex KrisFlyer Credit Card',
    'Amex KrisFlyer Credit Card T&C PDF — earn rates and KrisFlyer conversion'
  )
ON CONFLICT (url) DO UPDATE SET
  source_type = EXCLUDED.source_type,
  card_name = EXCLUDED.card_name,
  status = 'active';


-- ========================================================================
-- BOC (1 PDF + 1 index page)
-- ========================================================================

INSERT INTO public.source_configs (url, bank_name, source_type, scrape_method, css_selector, card_name, notes) VALUES
  (
    'https://www.bankofchina.com/sg/bocinfo/bi5/elite-miles-programme-tnc.pdf',
    'BOC', 'bank_tc_pdf', 'http', NULL, 'BOC Elite Miles Card',
    'BOC Elite Miles World Mastercard programme T&C PDF'
  ),
  (
    'https://www.bankofchina.com/sg/bcservice/bc1/',
    'BOC', 'bank_index_page', 'http', '.TRS_Editor', NULL,
    'BOC credit cards index page — links to card T&C documents'
  )
ON CONFLICT (url) DO UPDATE SET
  source_type = EXCLUDED.source_type,
  card_name = EXCLUDED.card_name,
  status = 'active';


-- ========================================================================
-- Standard Chartered (4 PDFs)
-- ========================================================================

INSERT INTO public.source_configs (url, bank_name, source_type, scrape_method, css_selector, card_name, notes) VALUES
  (
    'https://www.sc.com/sg/_pdf/credit-cards/visa-infinite-tnc.pdf',
    'Standard Chartered', 'bank_tc_pdf', 'http', NULL, 'SC Visa Infinite Card',
    'SC Visa Infinite Card T&C PDF — earn rates, Priority Pass'
  ),
  (
    'https://www.sc.com/sg/_pdf/credit-cards/journey-card-tnc.pdf',
    'Standard Chartered', 'bank_tc_pdf', 'http', NULL, 'SC Journey Card',
    'SC Journey Card T&C PDF — earn rates (also covers SC X Card)'
  ),
  (
    'https://www.sc.com/sg/_pdf/credit-cards/smart-card-tnc.pdf',
    'Standard Chartered', 'bank_tc_pdf', 'http', NULL, 'SC Smart Card',
    'SC Smart Card T&C PDF — earn rates and cashback'
  ),
  (
    'https://www.sc.com/sg/_pdf/credit-cards/beyond-card-tnc.pdf',
    'Standard Chartered', 'bank_tc_pdf', 'http', NULL, 'SC Beyond Card',
    'SC Beyond Card T&C PDF — tiered earn rates'
  )
ON CONFLICT (url) DO UPDATE SET
  source_type = EXCLUDED.source_type,
  card_name = EXCLUDED.card_name,
  status = 'active';

-- Reactivate existing SC 360 Rewards T&C
UPDATE public.source_configs
SET status = 'active',
    source_type = 'bank_tc_pdf',
    card_name = NULL,
    notes = 'SC 360 Rewards Programme T&C PDF — covers all SC cards'
WHERE url = 'https://www.sc.com/sg/_pdf/rewards/programtnc.pdf';


-- ========================================================================
-- Maybank (3 PDFs + 1 index page)
-- ========================================================================

INSERT INTO public.source_configs (url, bank_name, source_type, scrape_method, css_selector, card_name, notes) VALUES
  (
    'https://www.maybank2u.com.sg/iwov-resources/sg/pdf/cards/world-mastercard-tnc.pdf',
    'Maybank', 'bank_tc_pdf', 'http', NULL, 'Maybank World Mastercard',
    'Maybank World Mastercard T&C PDF — earn rates'
  ),
  (
    'https://www.maybank2u.com.sg/iwov-resources/sg/pdf/cards/xl-rewards-card-tnc.pdf',
    'Maybank', 'bank_tc_pdf', 'http', NULL, 'Maybank XL Rewards Card',
    'Maybank XL Rewards Card T&C PDF — earn rates'
  ),
  (
    'https://www.maybank2u.com.sg/iwov-resources/sg/pdf/cards/fc-barcelona-card-tnc.pdf',
    'Maybank', 'bank_tc_pdf', 'http', NULL, 'Maybank FC Barcelona Card',
    'Maybank FC Barcelona Card T&C PDF — earn rates'
  ),
  (
    'https://www.maybank2u.com.sg/en/personal/about_us/others/cards-terms-and-conditions.page',
    'Maybank', 'bank_index_page', 'http', '.content-area', NULL,
    'Maybank cards T&C index page — links to all card T&C PDFs'
  )
ON CONFLICT (url) DO UPDATE SET
  source_type = EXCLUDED.source_type,
  card_name = EXCLUDED.card_name,
  status = 'active';

-- Reactivate existing Maybank PDFs
UPDATE public.source_configs
SET status = 'active',
    source_type = 'bank_tc_pdf',
    card_name = 'Maybank Horizon Visa Signature'
WHERE url = 'https://www.maybank2u.com.sg/iwov-resources/sg/pdf/cards/horizon-visa-signature-card-tnc.pdf';

UPDATE public.source_configs
SET status = 'active',
    source_type = 'bank_tc_pdf',
    card_name = NULL,
    notes = 'Maybank TreatsPoints Rewards Programme T&C PDF — covers all Maybank cards'
WHERE url = 'https://www.maybank2u.com.sg/iwov-resources/sg/pdf/cards/tp-rewards-tnc.pdf';

UPDATE public.source_configs
SET status = 'active',
    source_type = 'bank_tc_pdf',
    card_name = NULL,
    notes = 'Maybank cards master T&C PDF — general terms and fee schedule'
WHERE url = 'https://www.maybank2u.com.sg/iwov-resources/sg/pdf/cards/terms_and_conditions.pdf';


-- ========================================================================
-- Citibank (2 PDFs)
-- ========================================================================

-- Reactivate existing Citi PDFs
UPDATE public.source_configs
SET status = 'active',
    source_type = 'bank_tc_pdf',
    card_name = NULL,
    notes = 'Citi ThankYou Rewards T&C PDF — covers Citi Rewards + PremierMiles'
WHERE url = 'https://www.citibank.com.sg/pdf/0424/citi-thankyou-rewards-terms-and-conditions.pdf';

UPDATE public.source_configs
SET status = 'active',
    source_type = 'bank_tc_pdf',
    card_name = NULL,
    notes = 'Citi rewards exclusion list PDF — MCC exclusions for all Citi cards'
WHERE url = 'https://www.citibank.com.sg/credit-cards/pdf/rewards-exclusion-list.pdf';

INSERT INTO public.source_configs (url, bank_name, source_type, scrape_method, css_selector, card_name, notes) VALUES
  (
    'https://www.citibank.com.sg/pdf/citi-premiermiles-tnc.pdf',
    'Citibank', 'bank_tc_pdf', 'http', NULL, 'Citi PremierMiles Card',
    'Citi PremierMiles Card T&C PDF — earn rates and miles conversion'
  ),
  (
    'https://www.citibank.com.sg/pdf/citi-rewards-card-tnc.pdf',
    'Citibank', 'bank_tc_pdf', 'http', NULL, 'Citi Rewards Card',
    'Citi Rewards Card T&C PDF — 10X points categories'
  )
ON CONFLICT (url) DO UPDATE SET
  source_type = EXCLUDED.source_type,
  card_name = EXCLUDED.card_name,
  status = 'active';


-- ==========================================================================
-- SECTION 6: Update fn_get_sources_due_for_check() to return new columns
-- ==========================================================================
-- The function already returns SETOF source_configs, so adding columns to
-- the table automatically includes them. No function change needed.
-- However, we recreate it to ensure it picks up the new columns cleanly.

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


-- ==========================================================================
-- SECTION 7: Update v_pipeline_health view to include version info
-- ==========================================================================

DROP VIEW IF EXISTS v_pipeline_health;
CREATE VIEW v_pipeline_health AS
SELECT
  sc.id AS source_id,
  sc.url,
  sc.bank_name,
  sc.card_name,
  sc.source_type::TEXT,
  sc.scrape_method,
  sc.status::TEXT AS source_status,
  sc.last_checked_at,
  sc.consecutive_failures,
  sc.check_interval,
  sc.tc_version,
  sc.tc_last_updated,
  -- Uptime: percentage of successful checks in last 30 days
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
WHERE sc.status != 'retired'
ORDER BY
  CASE sc.status
    WHEN 'broken' THEN 0
    WHEN 'active' THEN 1
    WHEN 'paused' THEN 2
    WHEN 'retired' THEN 3
  END,
  sc.consecutive_failures DESC,
  sc.bank_name;

COMMENT ON VIEW v_pipeline_health IS 'Per-source health metrics for the pipeline monitoring dashboard. Shows uptime, freshness, failure counts, version info, and change detection stats. Excludes retired sources.';


-- ==========================================================================
-- SECTION 8: Verification queries
-- ==========================================================================
-- Run after applying to verify:
--
--   -- New enum values exist
--   SELECT unnest(enum_range(NULL::source_type));
--   -- Should include: bank_tc_pdf, bank_index_page
--
--   -- Active sources count (~35)
--   SELECT source_type::TEXT, COUNT(*) FROM source_configs
--   WHERE status = 'active' GROUP BY source_type ORDER BY source_type;
--   -- Should return: bank_tc_pdf ~30, bank_index_page ~5
--
--   -- Retired sources
--   SELECT COUNT(*) FROM source_configs WHERE status = 'retired';
--   -- Should return ~54 (original sources)
--
--   -- New columns exist
--   SELECT card_name, tc_version, tc_last_updated
--   FROM source_configs WHERE status = 'active' LIMIT 5;
--
--   -- Snapshots table has new columns
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'source_snapshots'
--     AND column_name IN ('tc_version', 'tc_last_updated');
--   -- Should return 2 rows


-- ==========================================================================
-- ROLLBACK (partial — enum values cannot be removed):
-- UPDATE source_configs SET status = 'active' WHERE status = 'retired';
-- DELETE FROM source_configs WHERE source_type IN ('bank_tc_pdf', 'bank_index_page');
-- ALTER TABLE source_configs DROP COLUMN IF EXISTS card_name;
-- ALTER TABLE source_configs DROP COLUMN IF EXISTS tc_version;
-- ALTER TABLE source_configs DROP COLUMN IF EXISTS tc_last_updated;
-- ALTER TABLE source_snapshots DROP COLUMN IF EXISTS tc_version;
-- ALTER TABLE source_snapshots DROP COLUMN IF EXISTS tc_last_updated;
-- ==========================================================================
