-- =============================================================================
-- Migration: v1.7.0 Bills Subcategory Expansion, Data Fix, and Phase 2 Exclusions
-- Sprint 27 (S27.1-S27.6) — Applied to live Supabase instance 2026-03-01
--
-- Previous migrations (v1.4.0–v1.6.0) exist only in local all_cards.sql.
-- Old live rows have stale effective_from dates and wrong earn rates/notes.
-- This migration directly corrects all stale bills data.
-- Sections:
--   1. Update bills category MCCs (add education/medical/pharmacy)
--   2. Fix stale bills earn_rules base rows (wrong rate/note from old seeds)
--   3. Insert bills subcategory earn_rules (145 rows, effective_from='2026-03-01')
--   4. Update recommend() function (p_subcategory parameter, subcategory_base CTE)
--   5. Insert Exclusions Phase 2

BEGIN;
-- ============================================================
-- SECTION 1: Update bills category MCCs
-- Adds education (8211,8220,8241,8244,8249,8299),
-- medical (8011,8021,8062,8099), and pharmacy (5912) MCCs.
UPDATE public.categories
SET
  mccs = ARRAY[
    '4812',  -- Telecommunication Equipment
    '4814',  -- Telecommunication Services
    '4899',  -- Cable, Satellite, Pay TV
    '4816',  -- Computer Network/Information Services
    '4900',  -- Utilities — Electric, Gas, Water, Sanitary
    '6300',  -- Insurance Sales, Underwriting
    '6381',  -- Insurance Premiums
    '6399',  -- Insurance — Not Elsewhere Classified
    '8211',  -- Elementary and Secondary Schools (v1.7.0)
    '8220',  -- Colleges, Universities, Professional Schools (v1.7.0)
    '8241',  -- Correspondence Schools (v1.7.0)
    '8244',  -- Business and Secretarial Schools (v1.7.0)
    '8249',  -- Trade and Vocational Schools (v1.7.0)
    '8299',  -- Schools and Educational Services — NEC (v1.7.0)
    '8011',  -- Doctors and Physicians — NEC (v1.7.0)
    '8021',  -- Dentists and Orthodontists (v1.7.0)
    '8062',  -- Hospitals (v1.7.0)
    '8099',  -- Health Services — NEC (v1.7.0)
    '5912'   -- Drug Stores and Pharmacies (v1.7.0)
  ],
  description = 'Utilities, telco, insurance, education, medical, pharmacy',
  updated_at  = NOW()
WHERE id = 'bills';
-- SECTION 2: Fix stale bills earn_rules base rows
-- Step 2a: Fix all non-Maybank-Horizon base bills rows → 0.0 mpd
UPDATE public.earn_rules
SET
  earn_rate_mpd   = 0.0,
  conditions_note = 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]',
  updated_at      = NOW()
WHERE category_id = 'bills'
  AND is_bonus    = FALSE
  AND (conditions->>'subcategory') IS NULL
  AND card_id    != '00000000-0000-0000-0002-000000000016';  -- Maybank Horizon exception

-- Step 2a cont: Fix Maybank Horizon (Card 16) base bills row → 0.4 mpd
UPDATE public.earn_rules
SET
  earn_rate_mpd   = 0.4,
  conditions_note = 'Utility payments earn 0.4 mpd base (Maybank Horizon has fewer utility exclusions). [ESTIMATED]',
  updated_at      = NOW()
WHERE category_id = 'bills'
  AND is_bonus    = FALSE
  AND (conditions->>'subcategory') IS NULL
  AND card_id     = '00000000-0000-0000-0002-000000000016';
-- Step 2b: Remove duplicate bills base rows — keep only most recent per card
-- (Cleans up multiple effective_to IS NULL rows with different effective_from)
DELETE FROM public.earn_rules
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY card_id, category_id, is_bonus
             ORDER BY effective_from DESC, updated_at DESC
           ) AS rn
    FROM public.earn_rules
    WHERE category_id  = 'bills'
      AND is_bonus     = FALSE
      AND effective_to IS NULL
      AND (conditions->>'subcategory') IS NULL
  ) ranked
  WHERE rn > 1
);
-- SECTION 3: Bills subcategory earn_rules (v1.7.0 Section 3b)
-- 145 rows: utilities/education/medical/pharmacy/telco × 29 cards
-- effective_from = '2026-03-01'
-- PREREQUISITE: Extend unique constraint to include subcategory so that
-- multiple subcategory rows can coexist per card (utilities, education,
-- medical, pharmacy, telco all share the same card/category/is_bonus/
-- effective_from tuple — the old 4-column constraint would reject them).
-- Drop the old 4-column unique constraint and replace with a unique INDEX
-- that includes the subcategory expression.  PostgreSQL requires CREATE UNIQUE INDEX
-- (not ADD CONSTRAINT UNIQUE) for functional/expression columns.
ALTER TABLE public.earn_rules
  DROP CONSTRAINT IF EXISTS earn_rules_unique_active;
CREATE UNIQUE INDEX earn_rules_unique_active
  ON public.earn_rules (card_id, category_id, is_bonus, effective_from,
                        (COALESCE(conditions->>'subcategory', '')));
INSERT INTO public.earn_rules
  (card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note, source_url, effective_from)
VALUES
-- UTILITIES subcategory — 0.0 mpd for all cards except Maybank Horizon (16)
('00000000-0000-0000-0001-000000000001','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000002','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000003','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000004','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000005','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000006','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000007','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000008','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000009','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000010','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000011','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000012','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000013','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000014','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000015','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000016','bills',0.4,FALSE,'{"subcategory":"utilities"}','Utility payments earn 0.4 mpd base (Maybank Horizon has fewer utility exclusions). [ESTIMATED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000017','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000018','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000019','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000020','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000028','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000023','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000021','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000024','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000025','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000027','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000030','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000029','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
-- EDUCATION subcategory
-- DBS/Citi/UOB/OCBC/HSBC/SC/BOC/Amex: 0.0 mpd | Maybank: 0.16 mpd
-- DBS cards (1, 10, 19, 23)
('00000000-0000-0000-0001-000000000001','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000010','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000019','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000021','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
-- Citi cards (2, 18)
('00000000-0000-0000-0001-000000000002','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000018','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
-- UOB cards (3, 5, 11, 20, 22, 29)
('00000000-0000-0000-0001-000000000003','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000005','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000011','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000020','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000023','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
-- OCBC cards (4, 12, 24)
('00000000-0000-0000-0001-000000000004','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000012','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000024','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
-- HSBC cards (6, 13, 27)
('00000000-0000-0000-0001-000000000006','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000013','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000030','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
-- SC cards (9, 15, 25, 26)
('00000000-0000-0000-0001-000000000009','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000015','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000025','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000027','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
-- BOC card (8)
('00000000-0000-0000-0001-000000000008','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
-- Amex cards (7, 14)
('00000000-0000-0000-0001-000000000007','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000014','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
-- Maybank cards (16, 17, 21, 28): 0.16 mpd [UNVERIFIED]
('00000000-0000-0000-0002-000000000016','bills',0.16,FALSE,'{"subcategory":"education"}','School fee payments earn approx 0.16 mpd (TreatsPoints conversion, 8x points x 0.02 mpd). Education exclusion unverified for Maybank. [UNVERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000017','bills',0.16,FALSE,'{"subcategory":"education"}','School fee payments earn approx 0.16 mpd (TreatsPoints conversion, 8x points x 0.02 mpd). Education exclusion unverified for Maybank. [UNVERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000028','bills',0.16,FALSE,'{"subcategory":"education"}','School fee payments earn approx 0.16 mpd (TreatsPoints conversion, 8x points x 0.02 mpd). Education exclusion unverified for Maybank. [UNVERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000029','bills',0.16,FALSE,'{"subcategory":"education"}','School fee payments earn approx 0.16 mpd (TreatsPoints conversion, 8x points x 0.02 mpd). Education exclusion unverified for Maybank. [UNVERIFIED]',NULL,'2026-03-01'),
-- MEDICAL subcategory
-- DBS/Citi/UOB/OCBC/SC/BOC: 0.0 mpd | HSBC: base rate | Amex: 1.1 mpd | Maybank: 0.16 mpd
('00000000-0000-0000-0001-000000000001','bills',0.0,FALSE,'{"subcategory":"medical"}','Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000010','bills',0.0,FALSE,'{"subcategory":"medical"}','Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000019','bills',0.0,FALSE,'{"subcategory":"medical"}','Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000021','bills',0.0,FALSE,'{"subcategory":"medical"}','Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000002','bills',0.0,FALSE,'{"subcategory":"medical"}','Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000018','bills',0.0,FALSE,'{"subcategory":"medical"}','Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000003','bills',0.0,FALSE,'{"subcategory":"medical"}','Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000005','bills',0.0,FALSE,'{"subcategory":"medical"}','Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000011','bills',0.0,FALSE,'{"subcategory":"medical"}','Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000020','bills',0.0,FALSE,'{"subcategory":"medical"}','Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000023','bills',0.0,FALSE,'{"subcategory":"medical"}','Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000004','bills',0.0,FALSE,'{"subcategory":"medical"}','Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000012','bills',0.0,FALSE,'{"subcategory":"medical"}','Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000024','bills',0.0,FALSE,'{"subcategory":"medical"}','Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000009','bills',0.0,FALSE,'{"subcategory":"medical"}','Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000015','bills',0.0,FALSE,'{"subcategory":"medical"}','Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000025','bills',0.0,FALSE,'{"subcategory":"medical"}','Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000027','bills',0.0,FALSE,'{"subcategory":"medical"}','Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000008','bills',0.0,FALSE,'{"subcategory":"medical"}','Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
-- HSBC cards (6=0.4, 13=1.0, 27=1.4): private hospital exception
('00000000-0000-0000-0001-000000000006','bills',0.4,FALSE,'{"subcategory":"medical"}','Private hospital bills earn base rate (HSBC excludes public hospitals only). [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000013','bills',1.0,FALSE,'{"subcategory":"medical"}','Private hospital bills earn base rate (HSBC excludes public hospitals only). [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000030','bills',1.4,FALSE,'{"subcategory":"medical"}','Private hospital bills earn base rate (HSBC excludes public hospitals only). [VERIFIED]',NULL,'2026-03-01'),
-- Amex cards (7=1.1, 14=1.1): private hospital exception
('00000000-0000-0000-0001-000000000007','bills',1.1,FALSE,'{"subcategory":"medical"}','Private hospital bills earn base rate. Public hospital bills excluded (Amex excludes public MCC 8062). [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000014','bills',1.1,FALSE,'{"subcategory":"medical"}','Private hospital bills earn base rate. Public hospital bills excluded (Amex excludes public MCC 8062). [VERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000016','bills',0.16,FALSE,'{"subcategory":"medical"}','Hospital bill payments earn approx 0.16 mpd (unverified — Maybank may have shorter exclusion list). [UNVERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000017','bills',0.16,FALSE,'{"subcategory":"medical"}','Hospital bill payments earn approx 0.16 mpd (unverified — Maybank may have shorter exclusion list). [UNVERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000028','bills',0.16,FALSE,'{"subcategory":"medical"}','Hospital bill payments earn approx 0.16 mpd (unverified — Maybank may have shorter exclusion list). [UNVERIFIED]',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000029','bills',0.16,FALSE,'{"subcategory":"medical"}','Hospital bill payments earn approx 0.16 mpd (unverified — Maybank may have shorter exclusion list). [UNVERIFIED]',NULL,'2026-03-01'),
-- PHARMACY subcategory — ALL 29 cards: base_rate_mpd (standalone pharmacies not excluded)
('00000000-0000-0000-0001-000000000001','bills',1.2,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000002','bills',1.2,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000003','bills',1.4,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000004','bills',1.2,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000005','bills',1.2,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000006','bills',0.4,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000007','bills',1.1,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000008','bills',1.5,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000009','bills',1.4,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000010','bills',0.4,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd. Note: MCC 8099 (HealthHub) earns 4 mpd on this card as online spend.',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000011','bills',0.4,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000012','bills',0.4,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000013','bills',1.0,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000014','bills',1.1,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000015','bills',0.4,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000016','bills',0.4,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000017','bills',0.4,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000018','bills',0.4,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd. Note: MCC 8099 (HealthHub) earns 4 mpd on this card as online spend.',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000019','bills',0.4,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000020','bills',0.4,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000028','bills',0.4,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000023','bills',0.4,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000021','bills',1.5,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000024','bills',1.3,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000025','bills',1.2,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000027','bills',1.5,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000030','bills',1.4,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000029','bills',0.4,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
-- TELCO subcategory — base rate fallback for all 29 cards
('00000000-0000-0000-0001-000000000001','bills',1.2,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000002','bills',1.2,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000003','bills',1.4,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000004','bills',1.2,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000005','bills',1.2,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000006','bills',0.4,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000007','bills',1.1,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000008','bills',1.5,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000009','bills',1.4,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0001-000000000010','bills',0.4,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000011','bills',0.4,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000012','bills',0.4,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000013','bills',1.0,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000014','bills',1.1,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000015','bills',0.4,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000016','bills',0.4,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000017','bills',0.4,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000018','bills',0.4,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000019','bills',0.4,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0002-000000000020','bills',0.4,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000028','bills',0.4,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000023','bills',0.4,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000021','bills',1.5,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000024','bills',1.3,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000025','bills',1.2,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000027','bills',1.5,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000030','bills',1.4,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000029','bills',0.4,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01'),
('00000000-0000-0000-0003-000000000022','bills',0.4,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01')
ON CONFLICT (card_id, category_id, is_bonus, effective_from, (COALESCE(conditions->>'subcategory', ''))) DO UPDATE SET
  earn_rate_mpd   = EXCLUDED.earn_rate_mpd,
  conditions      = EXCLUDED.conditions,
  conditions_note = EXCLUDED.conditions_note,
  source_url      = EXCLUDED.source_url,
  updated_at      = NOW();
-- SECTION 4: Update recommend() function
-- Adds p_subcategory TEXT DEFAULT NULL parameter and subcategory_base CTE.
-- Source: database/functions/recommend.sql v1.7.0
CREATE OR REPLACE FUNCTION public.recommend(p_category_id TEXT, p_subcategory TEXT DEFAULT NULL)
RETURNS TABLE (
  card_id              UUID,
  card_name            TEXT,
  bank                 TEXT,
  network              TEXT,
  earn_rate_mpd        DECIMAL,
  remaining_cap        DECIMAL,
  monthly_cap_amount   DECIMAL,
  score                DECIMAL,
  is_recommended       BOOLEAN,
  conditions_note      TEXT,
  min_spend_threshold  DECIMAL,
  min_spend_met        BOOLEAN,
  total_monthly_spend  DECIMAL,
  requires_contactless BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id              UUID;
  v_current_month        TEXT;
  v_estimated_spend      DECIMAL;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated'
      USING ERRCODE = 'PGRST301';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = p_category_id) THEN
    RAISE EXCEPTION 'Invalid category: %', p_category_id
      USING ERRCODE = 'P0001';
  END IF;

  v_current_month := to_char(NOW(), 'YYYY-MM');

  SELECT COALESCE(us.estimated_monthly_spend, 0)
  INTO v_estimated_spend
  FROM user_settings us
  WHERE us.user_id = v_user_id;

  IF v_estimated_spend IS NULL THEN
    v_estimated_spend := 0;
  END IF;

  RETURN QUERY

  WITH subcategory_base AS (
    SELECT er.card_id, er.earn_rate_mpd AS subcategory_base_rate
    FROM earn_rules er
    WHERE er.category_id = p_category_id
      AND er.is_bonus = FALSE
      AND er.effective_to IS NULL
      AND (
        CASE WHEN p_subcategory IS NOT NULL
          THEN er.conditions->>'subcategory' = p_subcategory
          ELSE er.conditions->>'subcategory' IS NULL
        END
      )
  ),

  card_total_spending AS (
    SELECT t.card_id, SUM(t.amount) AS total_all
    FROM transactions t
    WHERE t.user_id = v_user_id
      AND t.transaction_date >= (date_trunc('month', CURRENT_DATE))::date
      AND t.transaction_date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date
    GROUP BY t.card_id
  ),

  user_card_rates AS (
    SELECT
      c.id                                          AS card_id,
      c.name                                        AS card_name,
      c.bank                                        AS bank,
      c.network                                     AS network,
      COALESCE(sb.subcategory_base_rate, c.base_rate_mpd) AS base_rate_mpd,
      (er.conditions->>'min_spend_monthly')::DECIMAL AS min_spend_threshold,
      GREATEST(COALESCE(cts.total_all, 0), v_estimated_spend) AS effective_monthly_spend,
      CASE
        WHEN (er.conditions->>'min_spend_monthly') IS NULL THEN TRUE
        WHEN GREATEST(COALESCE(cts.total_all, 0), v_estimated_spend)
             >= (er.conditions->>'min_spend_monthly')::DECIMAL THEN TRUE
        ELSE FALSE
      END AS min_spend_met,
      CASE
        WHEN (er.conditions->>'min_spend_monthly') IS NOT NULL
          AND GREATEST(COALESCE(cts.total_all, 0), v_estimated_spend)
              < (er.conditions->>'min_spend_monthly')::DECIMAL
          THEN c.base_rate_mpd
        WHEN er.conditions->>'user_selectable' = 'true'
          AND (ucp.selected_categories IS NULL
               OR NOT (p_category_id = ANY(ucp.selected_categories)))
          THEN c.base_rate_mpd
        ELSE COALESCE(er.earn_rate_mpd, c.base_rate_mpd)
      END AS earn_rate_mpd,
      cap.monthly_cap_amount                        AS monthly_cap_amount,
      cap.category_id                               AS cap_category_id,
      er.conditions_note                            AS conditions_note,
      COALESCE(cts.total_all, 0)                    AS actual_monthly_spend,
      COALESCE((er.conditions->>'contactless')::BOOLEAN, FALSE) AS requires_contactless
    FROM user_cards uc
    INNER JOIN cards c
      ON c.id = uc.card_id
    LEFT JOIN earn_rules er
      ON er.card_id = c.id
      AND er.category_id = p_category_id
      AND er.is_bonus = TRUE
      AND er.effective_to IS NULL
      AND (
        p_subcategory IS NULL
        OR er.conditions->>'subcategory' = p_subcategory
        OR er.conditions->>'subcategory' IS NULL
      )
    LEFT JOIN subcategory_base sb
      ON sb.card_id = c.id
    LEFT JOIN LATERAL (
      SELECT cap_inner.monthly_cap_amount, cap_inner.category_id
      FROM caps cap_inner
      WHERE cap_inner.card_id = c.id
        AND (cap_inner.category_id = p_category_id OR cap_inner.category_id IS NULL)
      ORDER BY cap_inner.category_id NULLS LAST
      LIMIT 1
    ) cap ON TRUE
    LEFT JOIN card_total_spending cts
      ON cts.card_id = c.id
    LEFT JOIN user_card_preferences ucp
      ON ucp.user_id = uc.user_id
      AND ucp.card_id = uc.card_id
    WHERE uc.user_id = v_user_id
  ),

  category_spending AS (
    SELECT t.card_id, SUM(t.amount) AS total_cat
    FROM transactions t
    WHERE t.user_id = v_user_id
      AND t.category_id = p_category_id
      AND t.transaction_date >= (date_trunc('month', CURRENT_DATE))::date
      AND t.transaction_date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date
    GROUP BY t.card_id
  ),

  card_spending AS (
    SELECT
      ucr.card_id,
      ucr.card_name,
      ucr.bank,
      ucr.network,
      ucr.earn_rate_mpd,
      ucr.monthly_cap_amount,
      ucr.conditions_note,
      ucr.min_spend_threshold,
      ucr.min_spend_met,
      ucr.actual_monthly_spend,
      ucr.requires_contactless,
      CASE
        WHEN ucr.cap_category_id IS NOT NULL THEN COALESCE(cs.total_cat, 0)
        WHEN ucr.monthly_cap_amount IS NOT NULL THEN ucr.actual_monthly_spend
        ELSE 0
      END AS total_spent
    FROM user_card_rates ucr
    LEFT JOIN category_spending cs ON cs.card_id = ucr.card_id
  ),

  scored_cards AS (
    SELECT
      csp.card_id,
      csp.card_name,
      csp.bank,
      csp.network,
      csp.earn_rate_mpd,
      CASE
        WHEN csp.monthly_cap_amount IS NULL THEN NULL::DECIMAL
        ELSE GREATEST(csp.monthly_cap_amount - csp.total_spent, 0)
      END AS remaining_cap,
      csp.monthly_cap_amount,
      csp.earn_rate_mpd * (
        CASE
          WHEN csp.monthly_cap_amount IS NULL THEN 1.0
          WHEN csp.total_spent >= csp.monthly_cap_amount THEN 0.0
          ELSE LEAST((csp.monthly_cap_amount - csp.total_spent) / csp.monthly_cap_amount, 1.0)
        END
      ) AS score,
      csp.conditions_note,
      csp.min_spend_threshold,
      csp.min_spend_met,
      csp.actual_monthly_spend,
      csp.requires_contactless
    FROM card_spending csp
  ),

  ranked_cards AS (
    SELECT
      sc.card_id,
      sc.card_name,
      sc.bank,
      sc.network,
      sc.earn_rate_mpd,
      sc.remaining_cap,
      sc.monthly_cap_amount,
      sc.score,
      sc.conditions_note,
      sc.min_spend_threshold,
      sc.min_spend_met,
      sc.actual_monthly_spend,
      sc.requires_contactless,
      ROW_NUMBER() OVER (
        ORDER BY
          sc.score DESC,
          sc.earn_rate_mpd DESC,
          sc.card_name ASC
      ) AS rank
    FROM scored_cards sc
  )

  SELECT
    rc.card_id,
    rc.card_name,
    rc.bank,
    rc.network,
    rc.earn_rate_mpd,
    rc.remaining_cap,
    rc.monthly_cap_amount,
    rc.score,
    (rc.rank = 1) AS is_recommended,
    rc.conditions_note,
    rc.min_spend_threshold,
    rc.min_spend_met,
    rc.actual_monthly_spend AS total_monthly_spend,
    rc.requires_contactless
  FROM ranked_cards rc
  ORDER BY rc.rank;

END;
$$;
GRANT EXECUTE ON FUNCTION public.recommend(TEXT, TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.recommend(TEXT, TEXT) FROM anon;
CREATE INDEX IF NOT EXISTS idx_earn_rules_card_category_active
  ON earn_rules (card_id, category_id) WHERE effective_to IS NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_user_card_category
  ON transactions (user_id, card_id, category_id);
-- SECTION 5: Exclusions Phase 2 (v1.7.0)
-- Clean slate for Phase 2 payment types to ensure idempotency.
DELETE FROM public.exclusions
WHERE conditions->>'payment_type' IN (
  'wire_transfer', 'real_estate', 'quasi_cash_financial', 'securities',
  'charitable', 'gambling', 'cleaning', 'insurance_direct_marketing'
);
INSERT INTO public.exclusions (card_id, category_id, excluded_mccs, conditions, description)
VALUES
-- MCC 4829 — Wire Transfer / Money Orders (DBS/Citi/UOB/OCBC/HSBC/SC/BOC — 23 cards)
('00000000-0000-0000-0001-000000000001',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 mpd. DBS excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0001-000000000002',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 mpd. Citi excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0001-000000000003',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 UNI$. UOB excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0001-000000000004',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 OCBC$. OCBC excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0001-000000000005',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 KrisFlyer miles. UOB excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0001-000000000006',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 HSBC Reward Points. HSBC excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0001-000000000008',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 BOC Bonus Points. BOC excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0001-000000000009',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 SC 360 Points. SC excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0001-000000000010',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 DBS Points. DBS excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0002-000000000011',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 UNI$. UOB excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0002-000000000012',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 OCBC$. OCBC excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0002-000000000013',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 HSBC Reward Points. HSBC excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0002-000000000015',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 SC 360 Points. SC excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0002-000000000018',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 ThankYou Points. Citi excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0002-000000000019',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 DBS Points. DBS excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0002-000000000020',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 UNI$. UOB excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0003-000000000023',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 UNI$. UOB excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0003-000000000021',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 DBS Points. DBS excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0003-000000000024',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 VOYAGE Miles. OCBC excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0003-000000000025',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 SC 360 Points. SC excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0003-000000000027',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 SC 360 Points. SC excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0003-000000000030',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 HSBC Reward Points. HSBC excludes MCC 4829. [VERIFIED]'),
-- MCC 6513 — Real Estate Agents (DBS/Citi/UOB/OCBC/SC/BOC — 20 cards, not HSBC/Amex/Maybank)
('00000000-0000-0000-0001-000000000001',NULL,ARRAY['6513'],'{"payment_type":"real_estate"}','Real estate agent payments earn 0 mpd. DBS excludes MCC 6513. [VERIFIED]'),
('00000000-0000-0000-0001-000000000002',NULL,ARRAY['6513'],'{"payment_type":"real_estate"}','Real estate agent payments earn 0 mpd. Citi excludes MCC 6513. [VERIFIED]'),
('00000000-0000-0000-0001-000000000003',NULL,ARRAY['6513'],'{"payment_type":"real_estate"}','Real estate agent payments earn 0 UNI$. UOB excludes MCC 6513. [VERIFIED]'),
('00000000-0000-0000-0001-000000000004',NULL,ARRAY['6513'],'{"payment_type":"real_estate"}','Real estate agent payments earn 0 OCBC$. OCBC excludes MCC 6513. [VERIFIED]'),
('00000000-0000-0000-0001-000000000005',NULL,ARRAY['6513'],'{"payment_type":"real_estate"}','Real estate agent payments earn 0 KrisFlyer miles. UOB excludes MCC 6513. [VERIFIED]'),
('00000000-0000-0000-0001-000000000008',NULL,ARRAY['6513'],'{"payment_type":"real_estate"}','Real estate agent payments earn 0 BOC Bonus Points. BOC excludes MCC 6513. [VERIFIED]'),
('00000000-0000-0000-0001-000000000009',NULL,ARRAY['6513'],'{"payment_type":"real_estate"}','Real estate agent payments earn 0 SC 360 Points. SC excludes MCC 6513. [VERIFIED]'),
('00000000-0000-0000-0001-000000000010',NULL,ARRAY['6513'],'{"payment_type":"real_estate"}','Real estate agent payments earn 0 DBS Points. DBS excludes MCC 6513. [VERIFIED]'),
('00000000-0000-0000-0002-000000000011',NULL,ARRAY['6513'],'{"payment_type":"real_estate"}','Real estate agent payments earn 0 UNI$. UOB excludes MCC 6513. [VERIFIED]'),
('00000000-0000-0000-0002-000000000012',NULL,ARRAY['6513'],'{"payment_type":"real_estate"}','Real estate agent payments earn 0 OCBC$. OCBC excludes MCC 6513. [VERIFIED]'),
('00000000-0000-0000-0002-000000000015',NULL,ARRAY['6513'],'{"payment_type":"real_estate"}','Real estate agent payments earn 0 SC 360 Points. SC excludes MCC 6513. [VERIFIED]'),
('00000000-0000-0000-0002-000000000018',NULL,ARRAY['6513'],'{"payment_type":"real_estate"}','Real estate agent payments earn 0 ThankYou Points. Citi excludes MCC 6513. [VERIFIED]'),
('00000000-0000-0000-0002-000000000019',NULL,ARRAY['6513'],'{"payment_type":"real_estate"}','Real estate agent payments earn 0 DBS Points. DBS excludes MCC 6513. [VERIFIED]'),
('00000000-0000-0000-0002-000000000020',NULL,ARRAY['6513'],'{"payment_type":"real_estate"}','Real estate agent payments earn 0 UNI$. UOB excludes MCC 6513. [VERIFIED]'),
('00000000-0000-0000-0003-000000000023',NULL,ARRAY['6513'],'{"payment_type":"real_estate"}','Real estate agent payments earn 0 UNI$. UOB excludes MCC 6513. [VERIFIED]'),
('00000000-0000-0000-0003-000000000021',NULL,ARRAY['6513'],'{"payment_type":"real_estate"}','Real estate agent payments earn 0 DBS Points. DBS excludes MCC 6513. [VERIFIED]'),
('00000000-0000-0000-0003-000000000024',NULL,ARRAY['6513'],'{"payment_type":"real_estate"}','Real estate agent payments earn 0 VOYAGE Miles. OCBC excludes MCC 6513. [VERIFIED]'),
('00000000-0000-0000-0003-000000000025',NULL,ARRAY['6513'],'{"payment_type":"real_estate"}','Real estate agent payments earn 0 SC 360 Points. SC excludes MCC 6513. [VERIFIED]'),
('00000000-0000-0000-0003-000000000027',NULL,ARRAY['6513'],'{"payment_type":"real_estate"}','Real estate agent payments earn 0 SC 360 Points. SC excludes MCC 6513. [VERIFIED]'),
-- MCCs 6050, 6051 — Quasi-cash / Crypto (ALL 29 cards)
('00000000-0000-0000-0001-000000000001',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 mpd. MCC 6050/6051 excluded by all banks. [VERIFIED]'),
('00000000-0000-0000-0001-000000000002',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 mpd. MCC 6050/6051 excluded by all banks. [VERIFIED]'),
('00000000-0000-0000-0001-000000000003',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 UNI$. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0001-000000000004',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 OCBC$. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0001-000000000005',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 KrisFlyer miles. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0001-000000000006',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 HSBC Reward Points. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0001-000000000007',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 KrisFlyer miles. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0001-000000000008',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 BOC Bonus Points. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0001-000000000009',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 SC 360 Points. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0001-000000000010',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 DBS Points. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0002-000000000011',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 UNI$. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0002-000000000012',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 OCBC$. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0002-000000000013',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 HSBC Reward Points. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0002-000000000014',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 KrisFlyer miles. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0002-000000000015',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 SC 360 Points. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0002-000000000016',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 TreatsPoints. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0002-000000000017',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 TreatsPoints. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0002-000000000018',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 ThankYou Points. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0002-000000000019',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 DBS Points. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0002-000000000020',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 UNI$. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0003-000000000028',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 TreatsPoints. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0003-000000000023',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 UNI$. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0003-000000000021',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 DBS Points. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0003-000000000024',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 VOYAGE Miles. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0003-000000000025',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 SC 360 Points. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0003-000000000027',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 SC 360 Points. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0003-000000000030',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 HSBC Reward Points. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0003-000000000029',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 TreatsPoints. MCC 6050/6051 excluded. [VERIFIED]'),
-- MCC 6211 — Securities Brokers/Dealers (same 20 cards as 6513)
('00000000-0000-0000-0001-000000000001',NULL,ARRAY['6211'],'{"payment_type":"securities"}','Securities broker/dealer transactions earn 0 mpd. DBS excludes MCC 6211. [VERIFIED]'),
('00000000-0000-0000-0001-000000000002',NULL,ARRAY['6211'],'{"payment_type":"securities"}','Securities broker/dealer transactions earn 0 mpd. Citi excludes MCC 6211. [VERIFIED]'),
('00000000-0000-0000-0001-000000000003',NULL,ARRAY['6211'],'{"payment_type":"securities"}','Securities broker/dealer transactions earn 0 UNI$. UOB excludes MCC 6211. [VERIFIED]'),
('00000000-0000-0000-0001-000000000004',NULL,ARRAY['6211'],'{"payment_type":"securities"}','Securities broker/dealer transactions earn 0 OCBC$. OCBC excludes MCC 6211. [VERIFIED]'),
('00000000-0000-0000-0001-000000000005',NULL,ARRAY['6211'],'{"payment_type":"securities"}','Securities broker/dealer transactions earn 0 KrisFlyer miles. UOB excludes MCC 6211. [VERIFIED]'),
('00000000-0000-0000-0001-000000000008',NULL,ARRAY['6211'],'{"payment_type":"securities"}','Securities broker/dealer transactions earn 0 BOC Bonus Points. BOC excludes MCC 6211. [VERIFIED]'),
('00000000-0000-0000-0001-000000000009',NULL,ARRAY['6211'],'{"payment_type":"securities"}','Securities broker/dealer transactions earn 0 SC 360 Points. SC excludes MCC 6211. [VERIFIED]'),
('00000000-0000-0000-0001-000000000010',NULL,ARRAY['6211'],'{"payment_type":"securities"}','Securities broker/dealer transactions earn 0 DBS Points. DBS excludes MCC 6211. [VERIFIED]'),
('00000000-0000-0000-0002-000000000011',NULL,ARRAY['6211'],'{"payment_type":"securities"}','Securities broker/dealer transactions earn 0 UNI$. UOB excludes MCC 6211. [VERIFIED]'),
('00000000-0000-0000-0002-000000000012',NULL,ARRAY['6211'],'{"payment_type":"securities"}','Securities broker/dealer transactions earn 0 OCBC$. OCBC excludes MCC 6211. [VERIFIED]'),
('00000000-0000-0000-0002-000000000015',NULL,ARRAY['6211'],'{"payment_type":"securities"}','Securities broker/dealer transactions earn 0 SC 360 Points. SC excludes MCC 6211. [VERIFIED]'),
('00000000-0000-0000-0002-000000000018',NULL,ARRAY['6211'],'{"payment_type":"securities"}','Securities broker/dealer transactions earn 0 ThankYou Points. Citi excludes MCC 6211. [VERIFIED]'),
('00000000-0000-0000-0002-000000000019',NULL,ARRAY['6211'],'{"payment_type":"securities"}','Securities broker/dealer transactions earn 0 DBS Points. DBS excludes MCC 6211. [VERIFIED]'),
('00000000-0000-0000-0002-000000000020',NULL,ARRAY['6211'],'{"payment_type":"securities"}','Securities broker/dealer transactions earn 0 UNI$. UOB excludes MCC 6211. [VERIFIED]'),
('00000000-0000-0000-0003-000000000023',NULL,ARRAY['6211'],'{"payment_type":"securities"}','Securities broker/dealer transactions earn 0 UNI$. UOB excludes MCC 6211. [VERIFIED]'),
('00000000-0000-0000-0003-000000000021',NULL,ARRAY['6211'],'{"payment_type":"securities"}','Securities broker/dealer transactions earn 0 DBS Points. DBS excludes MCC 6211. [VERIFIED]'),
('00000000-0000-0000-0003-000000000024',NULL,ARRAY['6211'],'{"payment_type":"securities"}','Securities broker/dealer transactions earn 0 VOYAGE Miles. OCBC excludes MCC 6211. [VERIFIED]'),
('00000000-0000-0000-0003-000000000025',NULL,ARRAY['6211'],'{"payment_type":"securities"}','Securities broker/dealer transactions earn 0 SC 360 Points. SC excludes MCC 6211. [VERIFIED]'),
('00000000-0000-0000-0003-000000000027',NULL,ARRAY['6211'],'{"payment_type":"securities"}','Securities broker/dealer transactions earn 0 SC 360 Points. SC excludes MCC 6211. [VERIFIED]'),
-- MCCs 8398, 8651, 8661 — Charitable/Religious/Political (ALL 29 cards)
('00000000-0000-0000-0001-000000000001',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 mpd. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0001-000000000002',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 mpd. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0001-000000000003',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 UNI$. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0001-000000000004',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 OCBC$. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0001-000000000005',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 KrisFlyer miles. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0001-000000000006',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 HSBC Reward Points. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0001-000000000007',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 KrisFlyer miles. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0001-000000000008',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 BOC Bonus Points. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0001-000000000009',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 SC 360 Points. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0001-000000000010',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 DBS Points. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0002-000000000011',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 UNI$. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0002-000000000012',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 OCBC$. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0002-000000000013',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 HSBC Reward Points. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0002-000000000014',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 KrisFlyer miles. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0002-000000000015',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 SC 360 Points. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0002-000000000016',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 TreatsPoints. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0002-000000000017',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 TreatsPoints. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0002-000000000018',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 ThankYou Points. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0002-000000000019',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 DBS Points. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0002-000000000020',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 UNI$. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0003-000000000028',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 TreatsPoints. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0003-000000000023',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 UNI$. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0003-000000000021',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 DBS Points. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0003-000000000024',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 VOYAGE Miles. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0003-000000000025',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 SC 360 Points. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0003-000000000027',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 SC 360 Points. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0003-000000000030',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 HSBC Reward Points. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0003-000000000029',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 TreatsPoints. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
-- MCC 7995 — Gambling (UOB/OCBC/HSBC/SC/BOC — 17 cards, NOT DBS/Citi/Amex/Maybank)
('00000000-0000-0000-0001-000000000003',NULL,ARRAY['7995'],'{"payment_type":"gambling"}','Gambling transactions earn 0 UNI$. UOB excludes MCC 7995. [VERIFIED]'),
('00000000-0000-0000-0001-000000000004',NULL,ARRAY['7995'],'{"payment_type":"gambling"}','Gambling transactions earn 0 OCBC$. OCBC excludes MCC 7995. [VERIFIED]'),
('00000000-0000-0000-0001-000000000005',NULL,ARRAY['7995'],'{"payment_type":"gambling"}','Gambling transactions earn 0 KrisFlyer miles. UOB excludes MCC 7995. [VERIFIED]'),
('00000000-0000-0000-0001-000000000006',NULL,ARRAY['7995'],'{"payment_type":"gambling"}','Gambling transactions earn 0 HSBC Reward Points. HSBC excludes MCC 7995. [VERIFIED]'),
('00000000-0000-0000-0001-000000000008',NULL,ARRAY['7995'],'{"payment_type":"gambling"}','Gambling transactions earn 0 BOC Bonus Points. BOC excludes MCC 7995. [VERIFIED]'),
('00000000-0000-0000-0001-000000000009',NULL,ARRAY['7995'],'{"payment_type":"gambling"}','Gambling transactions earn 0 SC 360 Points. SC excludes MCC 7995. [VERIFIED]'),
('00000000-0000-0000-0002-000000000011',NULL,ARRAY['7995'],'{"payment_type":"gambling"}','Gambling transactions earn 0 UNI$. UOB excludes MCC 7995. [VERIFIED]'),
('00000000-0000-0000-0002-000000000012',NULL,ARRAY['7995'],'{"payment_type":"gambling"}','Gambling transactions earn 0 OCBC$. OCBC excludes MCC 7995. [VERIFIED]'),
('00000000-0000-0000-0002-000000000013',NULL,ARRAY['7995'],'{"payment_type":"gambling"}','Gambling transactions earn 0 HSBC Reward Points. HSBC excludes MCC 7995. [VERIFIED]'),
('00000000-0000-0000-0002-000000000015',NULL,ARRAY['7995'],'{"payment_type":"gambling"}','Gambling transactions earn 0 SC 360 Points. SC excludes MCC 7995. [VERIFIED]'),
('00000000-0000-0000-0002-000000000020',NULL,ARRAY['7995'],'{"payment_type":"gambling"}','Gambling transactions earn 0 UNI$. UOB excludes MCC 7995. [VERIFIED]'),
('00000000-0000-0000-0003-000000000023',NULL,ARRAY['7995'],'{"payment_type":"gambling"}','Gambling transactions earn 0 UNI$. UOB excludes MCC 7995. [VERIFIED]'),
('00000000-0000-0000-0003-000000000024',NULL,ARRAY['7995'],'{"payment_type":"gambling"}','Gambling transactions earn 0 VOYAGE Miles. OCBC excludes MCC 7995. [VERIFIED]'),
('00000000-0000-0000-0003-000000000025',NULL,ARRAY['7995'],'{"payment_type":"gambling"}','Gambling transactions earn 0 SC 360 Points. SC excludes MCC 7995. [VERIFIED]'),
('00000000-0000-0000-0003-000000000027',NULL,ARRAY['7995'],'{"payment_type":"gambling"}','Gambling transactions earn 0 SC 360 Points. SC excludes MCC 7995. [VERIFIED]'),
('00000000-0000-0000-0003-000000000030',NULL,ARRAY['7995'],'{"payment_type":"gambling"}','Gambling transactions earn 0 HSBC Reward Points. HSBC excludes MCC 7995. [VERIFIED]'),
-- MCC 7349 — Cleaning/Janitorial (DBS/UOB/OCBC/HSBC/SC/Maybank/BOC — 25 cards)
('00000000-0000-0000-0001-000000000001',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 mpd. DBS excluded MCC 7349 from 1 Dec 2025. [VERIFIED]'),
('00000000-0000-0000-0001-000000000010',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 DBS Points. DBS excluded MCC 7349 from 1 Dec 2025. [VERIFIED]'),
('00000000-0000-0000-0002-000000000019',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 DBS Points. DBS excluded MCC 7349 from 1 Dec 2025. [VERIFIED]'),
('00000000-0000-0000-0003-000000000021',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 DBS Points. DBS excluded MCC 7349 from 1 Dec 2025. [VERIFIED]'),
('00000000-0000-0000-0001-000000000003',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 UNI$. UOB excludes MCC 7349. [VERIFIED]'),
('00000000-0000-0000-0001-000000000005',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 KrisFlyer miles. UOB excludes MCC 7349. [VERIFIED]'),
('00000000-0000-0000-0002-000000000011',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 UNI$. UOB excludes MCC 7349. [VERIFIED]'),
('00000000-0000-0000-0002-000000000020',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 UNI$. UOB excludes MCC 7349. [VERIFIED]'),
('00000000-0000-0000-0003-000000000023',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 UNI$. UOB excludes MCC 7349. [VERIFIED]'),
('00000000-0000-0000-0001-000000000004',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 OCBC$. OCBC excludes MCC 7349. [VERIFIED]'),
('00000000-0000-0000-0002-000000000012',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 OCBC$. OCBC excludes MCC 7349. [VERIFIED]'),
('00000000-0000-0000-0003-000000000024',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 VOYAGE Miles. OCBC excludes MCC 7349. [VERIFIED]'),
('00000000-0000-0000-0001-000000000006',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 HSBC Reward Points. HSBC excludes MCC 7349. [VERIFIED]'),
('00000000-0000-0000-0002-000000000013',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 HSBC Reward Points. HSBC excludes MCC 7349. [VERIFIED]'),
('00000000-0000-0000-0003-000000000030',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 HSBC Reward Points. HSBC excludes MCC 7349. [VERIFIED]'),
('00000000-0000-0000-0001-000000000009',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 SC 360 Points. SC excludes MCC 7349. [VERIFIED]'),
('00000000-0000-0000-0002-000000000015',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 SC 360 Points. SC excludes MCC 7349. [VERIFIED]'),
('00000000-0000-0000-0003-000000000025',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 SC 360 Points. SC excludes MCC 7349. [VERIFIED]'),
('00000000-0000-0000-0003-000000000027',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 SC 360 Points. SC excludes MCC 7349. [VERIFIED]'),
('00000000-0000-0000-0002-000000000016',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 TreatsPoints. Maybank excluded MCC 7349 from 1 Dec 2025. [VERIFIED]'),
('00000000-0000-0000-0002-000000000017',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 TreatsPoints. Maybank excluded MCC 7349 from 1 Dec 2025. [VERIFIED]'),
('00000000-0000-0000-0003-000000000028',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 TreatsPoints. Maybank excluded MCC 7349 from 1 Dec 2025. [VERIFIED]'),
('00000000-0000-0000-0003-000000000029',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 TreatsPoints. Maybank excluded MCC 7349 from 1 Dec 2025. [VERIFIED]'),
('00000000-0000-0000-0001-000000000008',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 BOC Bonus Points. BOC excluded MCC 7349 from 1 Jul 2025. [VERIFIED]'),
-- MCC 5960 — Direct Marketing Insurance (DBS/Citi/HSBC/BOC/Maybank — 14 cards)
('00000000-0000-0000-0001-000000000001',NULL,ARRAY['5960'],'{"payment_type":"insurance_direct_marketing"}','Direct marketing insurance payments earn 0 mpd. DBS excludes MCC 5960. [VERIFIED]'),
('00000000-0000-0000-0001-000000000002',NULL,ARRAY['5960'],'{"payment_type":"insurance_direct_marketing"}','Direct marketing insurance payments earn 0 mpd. Citi excludes MCC 5960. [VERIFIED]'),
('00000000-0000-0000-0001-000000000006',NULL,ARRAY['5960'],'{"payment_type":"insurance_direct_marketing"}','Direct marketing insurance payments earn 0 HSBC Reward Points. HSBC excludes MCC 5960. [VERIFIED]'),
('00000000-0000-0000-0001-000000000008',NULL,ARRAY['5960'],'{"payment_type":"insurance_direct_marketing"}','Direct marketing insurance payments earn 0 BOC Bonus Points. BOC excludes MCC 5960. [VERIFIED]'),
('00000000-0000-0000-0001-000000000010',NULL,ARRAY['5960'],'{"payment_type":"insurance_direct_marketing"}','Direct marketing insurance payments earn 0 DBS Points. DBS excludes MCC 5960. [VERIFIED]'),
('00000000-0000-0000-0002-000000000013',NULL,ARRAY['5960'],'{"payment_type":"insurance_direct_marketing"}','Direct marketing insurance payments earn 0 HSBC Reward Points. HSBC excludes MCC 5960. [VERIFIED]'),
('00000000-0000-0000-0002-000000000016',NULL,ARRAY['5960'],'{"payment_type":"insurance_direct_marketing"}','Direct marketing insurance payments earn 0 TreatsPoints. Maybank excludes MCC 5960. [VERIFIED]'),
('00000000-0000-0000-0002-000000000017',NULL,ARRAY['5960'],'{"payment_type":"insurance_direct_marketing"}','Direct marketing insurance payments earn 0 TreatsPoints. Maybank excludes MCC 5960. [VERIFIED]'),
('00000000-0000-0000-0002-000000000018',NULL,ARRAY['5960'],'{"payment_type":"insurance_direct_marketing"}','Direct marketing insurance payments earn 0 ThankYou Points. Citi excludes MCC 5960. [VERIFIED]'),
('00000000-0000-0000-0002-000000000019',NULL,ARRAY['5960'],'{"payment_type":"insurance_direct_marketing"}','Direct marketing insurance payments earn 0 DBS Points. DBS excludes MCC 5960. [VERIFIED]'),
('00000000-0000-0000-0003-000000000028',NULL,ARRAY['5960'],'{"payment_type":"insurance_direct_marketing"}','Direct marketing insurance payments earn 0 TreatsPoints. Maybank excludes MCC 5960. [VERIFIED]'),
('00000000-0000-0000-0003-000000000021',NULL,ARRAY['5960'],'{"payment_type":"insurance_direct_marketing"}','Direct marketing insurance payments earn 0 DBS Points. DBS excludes MCC 5960. [VERIFIED]'),
('00000000-0000-0000-0003-000000000030',NULL,ARRAY['5960'],'{"payment_type":"insurance_direct_marketing"}','Direct marketing insurance payments earn 0 HSBC Reward Points. HSBC excludes MCC 5960. [VERIFIED]'),
('00000000-0000-0000-0003-000000000029',NULL,ARRAY['5960'],'{"payment_type":"insurance_direct_marketing"}','Direct marketing insurance payments earn 0 TreatsPoints. Maybank excludes MCC 5960. [VERIFIED]');
-- CORRECTION: Insert earn_rules for UOB Lady's Solitaire (0003-22).
-- This card was dropped from Section 3 due to a chain UUID substitution error.
-- Section 3 already has its telco row; ON CONFLICT handles the duplicate.
INSERT INTO public.earn_rules
  (card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note, source_url, effective_from)
VALUES
  ('00000000-0000-0000-0003-000000000022','bills',0.0,FALSE,'{"subcategory":"utilities"}','Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
  ('00000000-0000-0000-0003-000000000022','bills',0.0,FALSE,'{"subcategory":"education"}','School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
  ('00000000-0000-0000-0003-000000000022','bills',0.0,FALSE,'{"subcategory":"medical"}','Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',NULL,'2026-03-01'),
  ('00000000-0000-0000-0003-000000000022','bills',0.4,FALSE,'{"subcategory":"pharmacy"}','Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies code as MCC 9399 = 0 mpd.',NULL,'2026-03-01'),
  ('00000000-0000-0000-0003-000000000022','bills',0.4,FALSE,'{"subcategory":"telco"}','Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',NULL,'2026-03-01')
ON CONFLICT (card_id, category_id, is_bonus, effective_from, (COALESCE(conditions->>'subcategory', ''))) DO UPDATE SET
  earn_rate_mpd   = EXCLUDED.earn_rate_mpd,
  conditions      = EXCLUDED.conditions,
  conditions_note = EXCLUDED.conditions_note,
  source_url      = EXCLUDED.source_url,
  updated_at      = NOW();

-- CORRECTION: Insert Phase 2 exclusions for UOB Lady's Solitaire (0003-22).
-- Section 5 INSERT omitted this card due to the same UUID error.
INSERT INTO public.exclusions (card_id, category_id, excluded_mccs, conditions, description)
VALUES
('00000000-0000-0000-0003-000000000022',NULL,ARRAY['4829'],'{"payment_type":"wire_transfer"}','Wire transfers and money orders earn 0 UNI$. UOB excludes MCC 4829. [VERIFIED]'),
('00000000-0000-0000-0003-000000000022',NULL,ARRAY['6513'],'{"payment_type":"real_estate"}','Real estate agent payments earn 0 UNI$. UOB excludes MCC 6513. [VERIFIED]'),
('00000000-0000-0000-0003-000000000022',NULL,ARRAY['6050','6051'],'{"payment_type":"quasi_cash_financial"}','Quasi-cash / crypto transactions earn 0 UNI$. MCC 6050/6051 excluded. [VERIFIED]'),
('00000000-0000-0000-0003-000000000022',NULL,ARRAY['6211'],'{"payment_type":"securities"}','Securities broker/dealer transactions earn 0 UNI$. UOB excludes MCC 6211. [VERIFIED]'),
('00000000-0000-0000-0003-000000000022',NULL,ARRAY['8398','8651','8661'],'{"payment_type":"charitable"}','Charitable/religious/political payments earn 0 UNI$. MCCs 8398/8651/8661 excluded. [VERIFIED]'),
('00000000-0000-0000-0003-000000000022',NULL,ARRAY['7995'],'{"payment_type":"gambling"}','Gambling transactions earn 0 UNI$. UOB excludes MCC 7995. [VERIFIED]'),
('00000000-0000-0000-0003-000000000022',NULL,ARRAY['7349'],'{"payment_type":"cleaning"}','Cleaning/janitorial services earn 0 UNI$. UOB excludes MCC 7349. [VERIFIED]');
COMMIT;
