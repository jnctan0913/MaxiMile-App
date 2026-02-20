-- =============================================================================
-- MaxiMile — Migration 011: Miles Ecosystem Foundation (Sprint 9 — F21 + F19)
-- =============================================================================
-- Description:  Expands the miles programs database from 7 to 16 programs,
--               remaps HSBC and BOC cards from KrisFlyer to their correct bank
--               points programs, creates the transfer_partners table mapping
--               bank points → airline FFPs with verified conversion rates,
--               and seeds ~50 transfer relationships.
--
-- New objects:
--   Programs  — 3 bank points (HSBC Reward Points, Amex Membership Rewards,
--               BOC Points) + 6 airline FFPs (Asia Miles, BA Avios, Qantas FF,
--               Qatar Privilege Club, Flying Blue, Malaysia Airlines Enrich)
--   Tables    — transfer_partners
--   Indexes   — idx_transfer_partners_source, idx_transfer_partners_destination
--   RLS       — transfer_partners (public read for authenticated + anon)
--
-- Card remapping:
--   HSBC Revolution, HSBC TravelOne → HSBC Reward Points (earn bank points, not direct KF)
--   BOC Elite Miles → BOC Points (earn bank points, not direct KF)
--   Amex KrisFlyer Ascend, Amex KrisFlyer CC → STAY as KrisFlyer (co-brand, direct earn)
--
-- Prerequisites:
--   - 008_miles_portfolio.sql (miles_programs, cards.miles_program_id)
--   - 009_miles_engagement.sql (miles_transactions, get_miles_portfolio v2)
--   - 010_earning_insights.sql
--
-- Transfer rates verified: 2026-02-20 (sources: bank websites, MileLion, SingSaver)
--
-- Author:  Data Engineer
-- Created: 2026-02-20
-- =============================================================================

BEGIN;


-- ==========================================================================
-- SECTION 1: Seed 3 new bank/transferable points programs
-- ==========================================================================

INSERT INTO public.miles_programs (name, airline, program_type, icon_url) VALUES
  ('HSBC Reward Points',        NULL, 'bank_points',   'card-outline'),
  ('Amex Membership Rewards',   NULL, 'transferable',  'star-outline'),
  ('BOC Points',                NULL, 'bank_points',   'card-outline');


-- ==========================================================================
-- SECTION 2: Seed 6 new airline FFP programs
-- ==========================================================================

INSERT INTO public.miles_programs (name, airline, program_type, icon_url) VALUES
  ('Asia Miles',                  'Cathay Pacific',    'airline', 'airplane-outline'),
  ('British Airways Avios',       'British Airways',   'airline', 'airplane-outline'),
  ('Qantas Frequent Flyer',      'Qantas',            'airline', 'airplane-outline'),
  ('Qatar Privilege Club',        'Qatar Airways',     'airline', 'airplane-outline'),
  ('Flying Blue',                 'Air France-KLM',    'airline', 'airplane-outline'),
  ('Malaysia Airlines Enrich',    'Malaysia Airlines',  'airline', 'airplane-outline');


-- ==========================================================================
-- SECTION 3: Remap HSBC cards from KrisFlyer → HSBC Reward Points
-- ==========================================================================
-- HSBC Revolution and TravelOne earn HSBC Reward Points (bank points) that
-- can TRANSFER to KrisFlyer at 30,000:10,000. They are NOT direct KrisFlyer
-- earn cards. The transfer relationship is captured in transfer_partners below.

UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = 'HSBC Reward Points')
WHERE name IN ('HSBC Revolution Credit Card', 'HSBC TravelOne Credit Card');


-- ==========================================================================
-- SECTION 4: Remap BOC cards from KrisFlyer → BOC Points
-- ==========================================================================
-- BOC Elite Miles earns BOC Points that transfer to KrisFlyer at 50,000:10,000
-- with a S$30.56 fee. NOT a direct KrisFlyer earn card.

UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = 'BOC Points')
WHERE name ILIKE '%BOC Elite%';


-- ==========================================================================
-- NOTE: Amex KrisFlyer Ascend and Amex KrisFlyer Credit Card STAY mapped
-- to KrisFlyer. These are co-branded cards that earn KrisFlyer miles directly.
-- They do NOT earn Amex Membership Rewards points.
-- ==========================================================================


-- ==========================================================================
-- SECTION 5: Create transfer_partners table
-- ==========================================================================

CREATE TABLE public.transfer_partners (
  id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  source_program_id       UUID          NOT NULL REFERENCES public.miles_programs(id) ON DELETE CASCADE,
  destination_program_id  UUID          NOT NULL REFERENCES public.miles_programs(id) ON DELETE CASCADE,
  conversion_rate_from    INTEGER       NOT NULL CHECK (conversion_rate_from > 0),
  conversion_rate_to      INTEGER       NOT NULL CHECK (conversion_rate_to > 0),
  transfer_fee_sgd        DECIMAL(10,2),
  min_transfer_amount     INTEGER,
  transfer_url            TEXT,
  last_verified_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  UNIQUE(source_program_id, destination_program_id)
);

COMMENT ON TABLE  public.transfer_partners
  IS 'Maps bank points programs to airline FFPs with conversion rates, fees, and minimums.';
COMMENT ON COLUMN public.transfer_partners.conversion_rate_from
  IS 'Source points required (e.g., 10000 for "10,000 Citi Miles → 10,000 KrisFlyer").';
COMMENT ON COLUMN public.transfer_partners.conversion_rate_to
  IS 'Destination miles received (e.g., 10000 for "10,000 Citi Miles → 10,000 KrisFlyer").';
COMMENT ON COLUMN public.transfer_partners.transfer_fee_sgd
  IS 'One-time transfer fee in SGD. NULL if free.';
COMMENT ON COLUMN public.transfer_partners.min_transfer_amount
  IS 'Minimum source points per transfer. NULL if no minimum.';
COMMENT ON COLUMN public.transfer_partners.transfer_url
  IS 'Bank website URL for initiating the transfer.';
COMMENT ON COLUMN public.transfer_partners.last_verified_at
  IS 'Date when conversion rate was last verified against bank website.';


-- ==========================================================================
-- SECTION 6: Indexes on transfer_partners
-- ==========================================================================

CREATE INDEX idx_transfer_partners_source
  ON public.transfer_partners (source_program_id);

CREATE INDEX idx_transfer_partners_destination
  ON public.transfer_partners (destination_program_id);


-- ==========================================================================
-- SECTION 7: RLS on transfer_partners (public read — reference data)
-- ==========================================================================

ALTER TABLE public.transfer_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transfer_partners_select_public"
  ON public.transfer_partners
  FOR SELECT
  TO anon, authenticated
  USING (true);


-- ==========================================================================
-- SECTION 8: Seed transfer partner relationships (~50 rows)
-- ==========================================================================
-- All rates verified 2026-02-20 from bank websites / MileLion / SingSaver.
-- Format: source → destination (from:to ratio), fee, min transfer
--
-- Naming convention for subqueries:
--   src_xxx = source bank points program
--   dst_xxx = destination airline FFP

INSERT INTO public.transfer_partners (
  source_program_id, destination_program_id,
  conversion_rate_from, conversion_rate_to,
  transfer_fee_sgd, min_transfer_amount,
  last_verified_at
)
VALUES

-- =========================================================================
-- Citi Miles → Airlines (7 partners) — best rates in SG: 1:1 across all
-- =========================================================================
(
  (SELECT id FROM public.miles_programs WHERE name = 'Citi Miles'),
  (SELECT id FROM public.miles_programs WHERE name = 'KrisFlyer'),
  10000, 10000, NULL, 10000, '2026-02-20'::TIMESTAMPTZ
),
(
  (SELECT id FROM public.miles_programs WHERE name = 'Citi Miles'),
  (SELECT id FROM public.miles_programs WHERE name = 'Asia Miles'),
  10000, 10000, NULL, 10000, '2026-02-20'::TIMESTAMPTZ
),
(
  (SELECT id FROM public.miles_programs WHERE name = 'Citi Miles'),
  (SELECT id FROM public.miles_programs WHERE name = 'Qantas Frequent Flyer'),
  10000, 10000, NULL, 10000, '2026-02-20'::TIMESTAMPTZ
),
(
  (SELECT id FROM public.miles_programs WHERE name = 'Citi Miles'),
  (SELECT id FROM public.miles_programs WHERE name = 'British Airways Avios'),
  10000, 10000, NULL, 10000, '2026-02-20'::TIMESTAMPTZ
),
(
  (SELECT id FROM public.miles_programs WHERE name = 'Citi Miles'),
  (SELECT id FROM public.miles_programs WHERE name = 'Qatar Privilege Club'),
  10000, 10000, NULL, 10000, '2026-02-20'::TIMESTAMPTZ
),
(
  (SELECT id FROM public.miles_programs WHERE name = 'Citi Miles'),
  (SELECT id FROM public.miles_programs WHERE name = 'Flying Blue'),
  10000, 10000, NULL, 10000, '2026-02-20'::TIMESTAMPTZ
),
(
  (SELECT id FROM public.miles_programs WHERE name = 'Citi Miles'),
  (SELECT id FROM public.miles_programs WHERE name = 'Malaysia Airlines Enrich'),
  10000, 10000, NULL, 10000, '2026-02-20'::TIMESTAMPTZ
),

-- =========================================================================
-- DBS Points → Airlines (3 partners) — 5,000:2,000 (2.5 pts per mile)
-- =========================================================================
(
  (SELECT id FROM public.miles_programs WHERE name = 'DBS Points'),
  (SELECT id FROM public.miles_programs WHERE name = 'KrisFlyer'),
  5000, 2000, NULL, 5000, '2026-02-20'::TIMESTAMPTZ
),
(
  (SELECT id FROM public.miles_programs WHERE name = 'DBS Points'),
  (SELECT id FROM public.miles_programs WHERE name = 'Asia Miles'),
  5000, 2000, NULL, 5000, '2026-02-20'::TIMESTAMPTZ
),
(
  (SELECT id FROM public.miles_programs WHERE name = 'DBS Points'),
  (SELECT id FROM public.miles_programs WHERE name = 'Qantas Frequent Flyer'),
  5000, 2000, NULL, 5000, '2026-02-20'::TIMESTAMPTZ
),

-- =========================================================================
-- UNI$ (UOB) → Airlines (2 partners) — 2,500:1,000 (2.5 pts per mile)
-- =========================================================================
(
  (SELECT id FROM public.miles_programs WHERE name = 'UNI$'),
  (SELECT id FROM public.miles_programs WHERE name = 'KrisFlyer'),
  2500, 1000, NULL, 2500, '2026-02-20'::TIMESTAMPTZ
),
(
  (SELECT id FROM public.miles_programs WHERE name = 'UNI$'),
  (SELECT id FROM public.miles_programs WHERE name = 'Asia Miles'),
  2500, 1000, NULL, 2500, '2026-02-20'::TIMESTAMPTZ
),

-- =========================================================================
-- OCBC$ → Airlines (5 partners) — 12,500:5,000 (2.5 pts per mile)
-- =========================================================================
(
  (SELECT id FROM public.miles_programs WHERE name = 'OCBC$'),
  (SELECT id FROM public.miles_programs WHERE name = 'KrisFlyer'),
  12500, 5000, NULL, 12500, '2026-02-20'::TIMESTAMPTZ
),
(
  (SELECT id FROM public.miles_programs WHERE name = 'OCBC$'),
  (SELECT id FROM public.miles_programs WHERE name = 'Asia Miles'),
  12500, 5000, NULL, 12500, '2026-02-20'::TIMESTAMPTZ
),
(
  (SELECT id FROM public.miles_programs WHERE name = 'OCBC$'),
  (SELECT id FROM public.miles_programs WHERE name = 'British Airways Avios'),
  12500, 5000, NULL, 12500, '2026-02-20'::TIMESTAMPTZ
),
(
  (SELECT id FROM public.miles_programs WHERE name = 'OCBC$'),
  (SELECT id FROM public.miles_programs WHERE name = 'Qantas Frequent Flyer'),
  12500, 5000, NULL, 12500, '2026-02-20'::TIMESTAMPTZ
),
(
  (SELECT id FROM public.miles_programs WHERE name = 'OCBC$'),
  (SELECT id FROM public.miles_programs WHERE name = 'Flying Blue'),
  12500, 5000, NULL, 12500, '2026-02-20'::TIMESTAMPTZ
),

-- =========================================================================
-- 360 Rewards (Standard Chartered) → Airlines (2 partners) — 2,500:1,000
-- =========================================================================
(
  (SELECT id FROM public.miles_programs WHERE name = '360 Rewards'),
  (SELECT id FROM public.miles_programs WHERE name = 'KrisFlyer'),
  2500, 1000, NULL, 2500, '2026-02-20'::TIMESTAMPTZ
),
(
  (SELECT id FROM public.miles_programs WHERE name = '360 Rewards'),
  (SELECT id FROM public.miles_programs WHERE name = 'Asia Miles'),
  2500, 1000, NULL, 2500, '2026-02-20'::TIMESTAMPTZ
),

-- =========================================================================
-- TreatsPoints (Maybank) → Airlines (3 partners) — 5,000:2,000
-- =========================================================================
(
  (SELECT id FROM public.miles_programs WHERE name = 'TreatsPoints'),
  (SELECT id FROM public.miles_programs WHERE name = 'KrisFlyer'),
  5000, 2000, NULL, 5000, '2026-02-20'::TIMESTAMPTZ
),
(
  (SELECT id FROM public.miles_programs WHERE name = 'TreatsPoints'),
  (SELECT id FROM public.miles_programs WHERE name = 'Asia Miles'),
  5000, 2000, NULL, 5000, '2026-02-20'::TIMESTAMPTZ
),
(
  (SELECT id FROM public.miles_programs WHERE name = 'TreatsPoints'),
  (SELECT id FROM public.miles_programs WHERE name = 'Malaysia Airlines Enrich'),
  5000, 2000, NULL, 5000, '2026-02-20'::TIMESTAMPTZ
),

-- =========================================================================
-- HSBC Reward Points → Airlines (6 partners) — varying rates
-- =========================================================================
-- KrisFlyer: 30,000:10,000 (3 pts per mile)
(
  (SELECT id FROM public.miles_programs WHERE name = 'HSBC Reward Points'),
  (SELECT id FROM public.miles_programs WHERE name = 'KrisFlyer'),
  30000, 10000, NULL, 30000, '2026-02-20'::TIMESTAMPTZ
),
-- Asia Miles: 25,000:10,000 (2.5 pts per mile)
(
  (SELECT id FROM public.miles_programs WHERE name = 'HSBC Reward Points'),
  (SELECT id FROM public.miles_programs WHERE name = 'Asia Miles'),
  25000, 10000, NULL, 25000, '2026-02-20'::TIMESTAMPTZ
),
-- BA Avios: 25,000:10,000 (2.5 pts per mile)
(
  (SELECT id FROM public.miles_programs WHERE name = 'HSBC Reward Points'),
  (SELECT id FROM public.miles_programs WHERE name = 'British Airways Avios'),
  25000, 10000, NULL, 25000, '2026-02-20'::TIMESTAMPTZ
),
-- Qantas FF: 25,000:10,000 (2.5 pts per mile)
(
  (SELECT id FROM public.miles_programs WHERE name = 'HSBC Reward Points'),
  (SELECT id FROM public.miles_programs WHERE name = 'Qantas Frequent Flyer'),
  25000, 10000, NULL, 25000, '2026-02-20'::TIMESTAMPTZ
),
-- Flying Blue: 25,000:10,000 (2.5 pts per mile)
(
  (SELECT id FROM public.miles_programs WHERE name = 'HSBC Reward Points'),
  (SELECT id FROM public.miles_programs WHERE name = 'Flying Blue'),
  25000, 10000, NULL, 25000, '2026-02-20'::TIMESTAMPTZ
),
-- Qatar Privilege Club: 35,000:10,000 (3.5 pts per mile)
(
  (SELECT id FROM public.miles_programs WHERE name = 'HSBC Reward Points'),
  (SELECT id FROM public.miles_programs WHERE name = 'Qatar Privilege Club'),
  35000, 10000, NULL, 35000, '2026-02-20'::TIMESTAMPTZ
),

-- =========================================================================
-- Amex Membership Rewards → Airlines (6 partners)
-- Post-devaluation Feb 2026: 10,000:5,625
-- =========================================================================
(
  (SELECT id FROM public.miles_programs WHERE name = 'Amex Membership Rewards'),
  (SELECT id FROM public.miles_programs WHERE name = 'KrisFlyer'),
  10000, 5625, NULL, 10000, '2026-02-20'::TIMESTAMPTZ
),
(
  (SELECT id FROM public.miles_programs WHERE name = 'Amex Membership Rewards'),
  (SELECT id FROM public.miles_programs WHERE name = 'Asia Miles'),
  10000, 5625, NULL, 10000, '2026-02-20'::TIMESTAMPTZ
),
(
  (SELECT id FROM public.miles_programs WHERE name = 'Amex Membership Rewards'),
  (SELECT id FROM public.miles_programs WHERE name = 'British Airways Avios'),
  10000, 5625, NULL, 10000, '2026-02-20'::TIMESTAMPTZ
),
(
  (SELECT id FROM public.miles_programs WHERE name = 'Amex Membership Rewards'),
  (SELECT id FROM public.miles_programs WHERE name = 'Qantas Frequent Flyer'),
  10000, 5625, NULL, 10000, '2026-02-20'::TIMESTAMPTZ
),
(
  (SELECT id FROM public.miles_programs WHERE name = 'Amex Membership Rewards'),
  (SELECT id FROM public.miles_programs WHERE name = 'Malaysia Airlines Enrich'),
  10000, 5625, NULL, 10000, '2026-02-20'::TIMESTAMPTZ
),
(
  (SELECT id FROM public.miles_programs WHERE name = 'Amex Membership Rewards'),
  (SELECT id FROM public.miles_programs WHERE name = 'Flying Blue'),
  10000, 5625, NULL, 10000, '2026-02-20'::TIMESTAMPTZ
),

-- =========================================================================
-- BOC Points → Airlines (1 partner) — 50,000:10,000, S$30.56 fee
-- =========================================================================
(
  (SELECT id FROM public.miles_programs WHERE name = 'BOC Points'),
  (SELECT id FROM public.miles_programs WHERE name = 'KrisFlyer'),
  50000, 10000, 30.56, 50000, '2026-02-20'::TIMESTAMPTZ
);


COMMIT;
