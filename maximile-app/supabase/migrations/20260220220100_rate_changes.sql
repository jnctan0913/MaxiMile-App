-- =============================================================================
-- MaxiMile — Migration 015: Rate Changes & User Alert Reads (Sprint 12 — F23)
-- =============================================================================
-- Description:  Creates the rate_changes table for tracking credit card earn
--               rate modifications, cap changes, devaluations, partner changes,
--               and fee changes. Also creates user_alert_reads for per-user
--               alert dismissal tracking. Seeds 5 historical rate changes.
--
-- New objects:
--   Enums  — rate_change_type, alert_severity
--   Tables — rate_changes, user_alert_reads
--   Seed   — 5 historical rate change records
--
-- Stories:
--   S12.1  — Rate change data model (AC1)
--   S12.5  — Historical seed data (T12.23)
--   T12.10 — User alert read tracking
--
-- Prerequisites:
--   - 014_card_expansion.sql (expanded card roster)
--   - 011_miles_ecosystem.sql (miles_programs table)
--
-- Author:  Data Engineer
-- Created: 2026-02-20
-- Sprint:  12 — Rate Change Monitoring (F23)
-- =============================================================================

BEGIN;


-- ==========================================================================
-- SECTION 1: Create enums
-- ==========================================================================

CREATE TYPE rate_change_type AS ENUM (
  'earn_rate',
  'cap_change',
  'devaluation',
  'partner_change',
  'fee_change'
);

CREATE TYPE alert_severity AS ENUM (
  'info',
  'warning',
  'critical'
);


-- ==========================================================================
-- SECTION 2: Create rate_changes table
-- ==========================================================================

CREATE TABLE public.rate_changes (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id         UUID        REFERENCES public.cards(id) ON DELETE SET NULL,
  program_id      UUID        REFERENCES public.miles_programs(id) ON DELETE SET NULL,
  change_type     rate_change_type NOT NULL,
  category        TEXT,
  old_value       TEXT        NOT NULL,
  new_value       TEXT        NOT NULL,
  effective_date  DATE        NOT NULL,
  alert_title     TEXT        NOT NULL,
  alert_body      TEXT        NOT NULL,
  severity        alert_severity NOT NULL DEFAULT 'info',
  source_url      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rate_changes_card_id        ON public.rate_changes (card_id);
CREATE INDEX idx_rate_changes_program_id     ON public.rate_changes (program_id);
CREATE INDEX idx_rate_changes_effective_date ON public.rate_changes (effective_date DESC);
CREATE INDEX idx_rate_changes_severity       ON public.rate_changes (severity);

ALTER TABLE public.rate_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rate_changes_select_authenticated"
  ON public.rate_changes
  FOR SELECT
  TO authenticated
  USING (true);


-- ==========================================================================
-- SECTION 3: Create user_alert_reads table
-- ==========================================================================

CREATE TABLE public.user_alert_reads (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rate_change_id  UUID        NOT NULL REFERENCES public.rate_changes(id) ON DELETE CASCADE,
  read_at         TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, rate_change_id)
);

CREATE INDEX idx_user_alert_reads_user_id ON public.user_alert_reads (user_id);

ALTER TABLE public.user_alert_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_alert_reads_select_own"
  ON public.user_alert_reads
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_alert_reads_insert_own"
  ON public.user_alert_reads
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());


-- ==========================================================================
-- SECTION 4: Seed 5 historical rate changes
-- ==========================================================================

-- 1. DBS Woman's World Card — Cap Reduction (warning)
INSERT INTO public.rate_changes
  (card_id, program_id, change_type, category, old_value, new_value, effective_date, alert_title, alert_body, severity)
VALUES (
  (SELECT id FROM public.cards WHERE name ILIKE '%Woman%World%' LIMIT 1),
  NULL,
  'cap_change',
  NULL,
  'S$2,000/month bonus cap',
  'S$1,000/month bonus cap',
  '2025-08-01',
  'Cap Change: DBS Woman''s World Card',
  'The 4 mpd bonus cap has been reduced from S$2,000 to S$1,000 per month. This means 50% less bonus spending capacity. Consider supplementing with another high-earn card for spend above S$1,000.',
  'warning'
);

-- 2. Amex MR Program — Transfer Rate Devaluation (critical)
INSERT INTO public.rate_changes
  (card_id, program_id, change_type, category, old_value, new_value, effective_date, alert_title, alert_body, severity)
VALUES (
  (SELECT id FROM public.cards WHERE name ILIKE '%KrisFlyer Ascend%' LIMIT 1),
  (SELECT id FROM public.miles_programs WHERE name = 'KrisFlyer'),
  'devaluation',
  NULL,
  '1 MR point = 1 KrisFlyer mile',
  '1.5 MR points = 1 KrisFlyer mile (33% devaluation)',
  '2025-11-01',
  'Rate Alert: Amex MR Devaluation',
  'Amex Membership Rewards transfer rate to KrisFlyer has worsened by 33%. You now need 1.5 MR points per KrisFlyer mile instead of 1:1. Effective earn rate drops from ~1.2 mpd to ~0.8 mpd. Consider alternative cards for KrisFlyer earning.',
  'critical'
);

-- 3. HSBC Revolution — Bonus Cap Increase (info)
INSERT INTO public.rate_changes
  (card_id, program_id, change_type, category, old_value, new_value, effective_date, alert_title, alert_body, severity)
VALUES (
  (SELECT id FROM public.cards WHERE name ILIKE '%HSBC Revolution%' LIMIT 1),
  NULL,
  'cap_change',
  NULL,
  'S$1,000/month bonus cap',
  'S$1,500/month bonus cap',
  '2026-01-15',
  'HSBC Revolution: Bonus Cap Boosted',
  'Great news! The monthly bonus cap has been increased from S$1,000 to S$1,500. You can now earn 10x points (4 mpd) on 50% more spending each month.',
  'info'
);

-- 4. BOC Elite Miles — Earn Rate Cut (warning)
INSERT INTO public.rate_changes
  (card_id, program_id, change_type, category, old_value, new_value, effective_date, alert_title, alert_body, severity)
VALUES (
  (SELECT id FROM public.cards WHERE name ILIKE '%BOC Elite%' LIMIT 1),
  NULL,
  'earn_rate',
  'dining',
  '3.0 mpd on dining',
  '2.0 mpd on dining',
  '2025-06-01',
  'BOC Elite Miles: Dining Rate Reduced',
  'The dining bonus earn rate has been cut from 3.0 mpd to 2.0 mpd. This makes BOC Elite Miles less competitive for dining spend. Consider Citi PremierMiles or OCBC 90°N for dining.',
  'warning'
);

-- 5. Maybank Horizon — Annual Fee Increase (info)
INSERT INTO public.rate_changes
  (card_id, program_id, change_type, category, old_value, new_value, effective_date, alert_title, alert_body, severity)
VALUES (
  (SELECT id FROM public.cards WHERE name ILIKE '%Maybank Horizon%' LIMIT 1),
  NULL,
  'fee_change',
  NULL,
  '$196.00/year (first year waived)',
  '$235.00/year (first year waived)',
  '2026-02-01',
  'Maybank Horizon: Annual Fee Increase',
  'Annual fee increased from S$196 to S$235 (20% increase). First year waiver still applies. Consider whether the TreatsPoints earn rate justifies the higher fee compared to alternatives.',
  'info'
);


-- ==========================================================================
-- SECTION 5: Verification queries
-- ==========================================================================
-- Run after applying to verify:
--
--   -- Total rate changes seeded
--   SELECT COUNT(*) FROM rate_changes;
--   -- Should return 5
--
--   -- Severity distribution
--   SELECT severity, COUNT(*) FROM rate_changes GROUP BY severity ORDER BY severity;
--   -- Should return: critical=1, info=2, warning=2
--
--   -- Change type distribution
--   SELECT change_type, COUNT(*) FROM rate_changes GROUP BY change_type ORDER BY change_type;
--   -- Should return: cap_change=2, devaluation=1, earn_rate=1, fee_change=1
--
--   -- User alert reads should be empty
--   SELECT COUNT(*) FROM user_alert_reads;
--   -- Should return 0


COMMIT;


-- ==========================================================================
-- ROLLBACK:
-- DROP TABLE IF EXISTS user_alert_reads;
-- DROP TABLE IF EXISTS rate_changes;
-- DROP TYPE IF EXISTS alert_severity;
-- DROP TYPE IF EXISTS rate_change_type;
-- ==========================================================================
