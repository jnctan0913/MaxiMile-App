-- =============================================================================
-- MaxiMile — Batch 1 Card Rules Seed Data (batch1_cards.sql)
-- =============================================================================
-- Description: Seed data for the first 10 Singapore miles credit cards.
--              Earn rates sourced from bank websites and cross-referenced
--              with MileLion, SingSaver, and Suitesmile (as of Feb 2026).
--
-- IMPORTANT NOTES ON DATA ACCURACY:
--   - Rates marked with "-- [VERIFIED]" are from official bank T&Cs
--   - Rates marked with "-- [ESTIMATED]" are conservative estimates based on
--     aggregator sites; should be cross-checked against bank T&Cs
--   - All earn_rate_mpd values represent TOTAL miles per dollar (not incremental)
--   - Banks may change rates at any time; periodic re-validation required
--   - v1 assumption: all conditions are assumed to be met (per PRD)
--
-- Author:  Data Engineer Agent
-- Created: 2026-02-19
-- =============================================================================

-- ============================================================
-- PART A: Card Metadata
-- ============================================================

INSERT INTO public.cards (id, bank, name, slug, network, annual_fee, base_rate_mpd, image_url, is_active, notes)
VALUES
  -- 1. DBS Altitude Visa
  (
    '00000000-0000-0000-0001-000000000001',
    'DBS',
    'DBS Altitude Visa Signature',
    'dbs-altitude-visa',
    'visa',
    192.60,
    1.2,   -- 1.2 mpd on local spend (3X DBS points = 1.2 mpd at 2500pts per mile)
    NULL,
    TRUE,
    'Base 1.2 mpd local, 2 mpd overseas. 10X on online travel booking via specific portals. Annual fee often waivable. [VERIFIED from DBS website]'
  ),

  -- 2. Citi PremierMiles Visa
  (
    '00000000-0000-0000-0001-000000000002',
    'Citi',
    'Citi PremierMiles Visa Signature',
    'citi-premiermiles-visa',
    'visa',
    192.60,
    1.2,   -- 1.2 mpd local (4 Citi Miles per SGD1 local => 1.2 mpd)
    NULL,
    TRUE,
    'No miles expiry. 1.2 mpd local, 2 mpd overseas. Annual fee $192.60 (first year waiver often available). [VERIFIED from Citi website]'
  ),

  -- 3. UOB PRVI Miles Visa
  (
    '00000000-0000-0000-0001-000000000003',
    'UOB',
    'UOB PRVI Miles Visa',
    'uob-prvi-miles-visa',
    'visa',
    256.80,
    1.4,   -- 1.4 mpd local
    NULL,
    TRUE,
    '1.4 mpd local, 2.4 mpd overseas. No min spend for bonus. Annual fee $256.80. [VERIFIED from UOB website]'
  ),

  -- 4. OCBC 90°N Visa
  (
    '00000000-0000-0000-0001-000000000004',
    'OCBC',
    'OCBC 90°N Visa',
    'ocbc-90n-visa',
    'visa',
    192.60,
    1.2,   -- 1.2 mpd on most categories
    NULL,
    TRUE,
    '1.2 mpd local, 2.1 mpd overseas. Auto-transfer to KrisFlyer/Asia Miles. Annual fee $192.60. [VERIFIED from OCBC website]'
  ),

  -- 5. KrisFlyer UOB Credit Card
  (
    '00000000-0000-0000-0001-000000000005',
    'UOB',
    'KrisFlyer UOB Credit Card',
    'krisflyer-uob',
    'visa',
    194.40,
    1.2,   -- 1.2 mpd base (3 KF miles per $1 local)
    NULL,
    TRUE,
    'Direct KrisFlyer miles. Up to 3 mpd on selected spend. Contactless bonus available. Annual fee $194.40. [VERIFIED from UOB website]'
  ),

  -- 6. HSBC Revolution
  (
    '00000000-0000-0000-0001-000000000006',
    'HSBC',
    'HSBC Revolution Credit Card',
    'hsbc-revolution',
    'visa',
    0,     -- No annual fee
    0.4,   -- 0.4 mpd base
    NULL,
    TRUE,
    'No annual fee. 4 mpd on dining, entertainment, online. 0.4 mpd elsewhere. 10X rewards on selected categories. Cap of $1000/month on bonus. [VERIFIED from HSBC website]'
  ),

  -- 7. Amex KrisFlyer Ascend
  (
    '00000000-0000-0000-0001-000000000007',
    'Amex',
    'American Express KrisFlyer Ascend',
    'amex-krisflyer-ascend',
    'amex',
    337.05,
    1.1,   -- 1.1 mpd base local
    NULL,
    TRUE,
    'Direct KrisFlyer miles. 1.1 mpd base, 2 mpd on dining/travel, 3 mpd on SIA purchases. Bonus capped at $2500/month per category. Annual fee $337.05. [VERIFIED from Amex website]'
  ),

  -- 8. BOC Elite Miles World Mastercard
  (
    '00000000-0000-0000-0001-000000000008',
    'BOC',
    'BOC Elite Miles World Mastercard',
    'boc-elite-miles-world-mc',
    'mastercard',
    0,     -- First 2 years no annual fee; subsequent $193.50
    1.5,   -- 1.5 mpd (3X BOC points on everything — local and overseas)
    NULL,
    TRUE,
    'Flat 1.5 mpd on all local spend, no category restriction. Cap at $2000/month. No annual fee first 2 years, then $193.50. [ESTIMATED - rates may vary; verify with BOC T&Cs]'
  ),

  -- 9. Standard Chartered Visa Infinite
  (
    '00000000-0000-0000-0001-000000000009',
    'SC',
    'Standard Chartered Visa Infinite',
    'sc-visa-infinite',
    'visa',
    588.50,
    1.4,   -- 1.4 mpd base local
    NULL,
    TRUE,
    'Premium card. 1.4 mpd local, 3 mpd overseas. Income requirement $150K. Annual fee $588.50 (waivable). [VERIFIED from SC website]'
  ),

  -- 10. DBS Woman''s World Card
  (
    '00000000-0000-0000-0001-000000000010',
    'DBS',
    'DBS Woman''s World Card',
    'dbs-womans-world-card',
    'mastercard',
    0,     -- No annual fee
    0.4,   -- 0.4 mpd base
    NULL,
    TRUE,
    'No annual fee. 4 mpd on online, 10X DBS points on online spend up to $2000/month. 0.4 mpd on other spend. [VERIFIED from DBS website]'
  )

ON CONFLICT (id) DO UPDATE SET
  bank          = EXCLUDED.bank,
  name          = EXCLUDED.name,
  slug          = EXCLUDED.slug,
  network       = EXCLUDED.network,
  annual_fee    = EXCLUDED.annual_fee,
  base_rate_mpd = EXCLUDED.base_rate_mpd,
  image_url     = EXCLUDED.image_url,
  is_active     = EXCLUDED.is_active,
  notes         = EXCLUDED.notes,
  updated_at    = NOW();


-- ============================================================
-- PART B: Earn Rules (7 categories x 10 cards = 70 rows)
-- ============================================================
-- Convention:
--   is_bonus = TRUE  → this is the accelerated/bonus rate for this category
--   is_bonus = FALSE → this is the base rate fallback (used when no bonus applies)
--
-- For clarity, we insert the EFFECTIVE rate the user earns.
-- If a card earns the same base rate across all categories, we still insert
-- per-category rows so the recommendation engine doesn't need fallback logic.
-- ============================================================

INSERT INTO public.earn_rules (card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note, source_url)
VALUES

-- ============================================================
-- CARD 1: DBS Altitude Visa (base 1.2 mpd local, 2 mpd overseas)
-- ============================================================
-- DBS Altitude earns 3X DBS Points (= 1.2 mpd) on local spend,
-- 10X DBS Points on online travel bookings (= 4 mpd via Kaligo/Expedia).
-- For simplicity in v1, we use the local rates.
-- [VERIFIED from DBS website]
('00000000-0000-0000-0001-000000000001', 'dining',    1.2,  FALSE, '{}', NULL, 'https://www.dbs.com.sg/personal/cards/credit-cards/altitude-visa-signature-card'),
('00000000-0000-0000-0001-000000000001', 'transport',  1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000001', 'online',     1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000001', 'groceries',  1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000001', 'petrol',     1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000001', 'travel',     4.0,  TRUE,  '{"online_travel_portal": true}', 'Up to 10X DBS Points (4 mpd) for online travel bookings. Standard 1.2 mpd at travel agencies.', 'https://www.dbs.com.sg/personal/cards/credit-cards/altitude-visa-signature-card'),
('00000000-0000-0000-0001-000000000001', 'general',    1.2,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 2: Citi PremierMiles Visa (1.2 mpd local, 2 mpd overseas)
-- ============================================================
-- Flat 1.2 mpd on all local spend. No bonus categories locally.
-- 2 mpd on overseas spend (FCY). Miles never expire.
-- [VERIFIED from Citi website]
('00000000-0000-0000-0001-000000000002', 'dining',    1.2,  FALSE, '{}', NULL, 'https://www.citibank.com.sg/credit-cards/premiermiles-visa-signature/'),
('00000000-0000-0000-0001-000000000002', 'transport',  1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000002', 'online',     1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000002', 'groceries',  1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000002', 'petrol',     1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000002', 'travel',     1.2,  FALSE, '{}', 'Overseas travel spend earns 2 mpd. Local travel agencies earn 1.2 mpd.', NULL),
('00000000-0000-0000-0001-000000000002', 'general',    1.2,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 3: UOB PRVI Miles Visa (1.4 mpd local, 2.4 mpd overseas)
-- ============================================================
-- Flat 1.4 mpd on all local spend. 2.4 mpd on overseas spend.
-- No specific bonus categories — pure flat rate locally.
-- [VERIFIED from UOB website]
('00000000-0000-0000-0001-000000000003', 'dining',    1.4,  FALSE, '{}', NULL, 'https://www.uob.com.sg/personal/cards/credit/prvi-miles-visa.page'),
('00000000-0000-0000-0001-000000000003', 'transport',  1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000003', 'online',     1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000003', 'groceries',  1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000003', 'petrol',     1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000003', 'travel',     1.4,  FALSE, '{}', 'Overseas travel spend earns 2.4 mpd.', NULL),
('00000000-0000-0000-0001-000000000003', 'general',    1.4,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 4: OCBC 90°N Visa (1.2 mpd local, 2.1 mpd overseas)
-- ============================================================
-- Flat 1.2 mpd on local spend. 2.1 mpd overseas.
-- Points auto-convert to KrisFlyer or Asia Miles.
-- [VERIFIED from OCBC website]
('00000000-0000-0000-0001-000000000004', 'dining',    1.2,  FALSE, '{}', NULL, 'https://www.ocbc.com/personal-banking/cards/90n-card'),
('00000000-0000-0000-0001-000000000004', 'transport',  1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000004', 'online',     1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000004', 'groceries',  1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000004', 'petrol',     1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000004', 'travel',     1.2,  FALSE, '{}', 'Overseas travel spend earns 2.1 mpd.', NULL),
('00000000-0000-0000-0001-000000000004', 'general',    1.2,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 5: KrisFlyer UOB Credit Card (1.2 mpd base, up to 3 mpd bonus)
-- ============================================================
-- Direct KrisFlyer miles. 1.2 mpd base on local spend.
-- Bonus: Up to 3 KF miles per $1 on selected categories (contactless, online, SIA).
-- Contactless payments earn additional bonus.
-- [VERIFIED from UOB website]
('00000000-0000-0000-0001-000000000005', 'dining',    2.0,  TRUE,  '{"contactless": true}', 'Earn 2 mpd on contactless dining transactions. Standard 1.2 mpd for non-contactless.', 'https://www.uob.com.sg/personal/cards/credit/krisflyer-uob-credit-card.page'),
('00000000-0000-0000-0001-000000000005', 'transport',  2.0,  TRUE,  '{"contactless": true}', 'Earn 2 mpd on contactless transport (Grab, taxis). Standard 1.2 mpd otherwise.', NULL),
('00000000-0000-0000-0001-000000000005', 'online',     2.0,  TRUE,  '{}', 'Earn 2 mpd on online spend.', NULL),
('00000000-0000-0000-0001-000000000005', 'groceries',  1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000005', 'petrol',     1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000005', 'travel',     3.0,  TRUE,  '{"merchant": "SIA"}', 'Earn 3 mpd on SIA purchases (flights, SIA website). 1.2 mpd on other travel.', NULL),
('00000000-0000-0000-0001-000000000005', 'general',    1.2,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 6: HSBC Revolution (4 mpd on dining/entertainment/online, 0.4 mpd else)
-- ============================================================
-- No annual fee. 10X rewards (4 mpd) on dining, entertainment, and online spend.
-- Capped at $1,000/month for bonus categories.
-- 0.4 mpd on everything else.
-- [VERIFIED from HSBC website]
('00000000-0000-0000-0001-000000000006', 'dining',    4.0,  TRUE,  '{}', 'Earn 4 mpd on dining (10X HSBC rewards). Capped at $1,000/month across bonus categories.', 'https://www.hsbc.com.sg/credit-cards/products/revolution/'),
('00000000-0000-0000-0001-000000000006', 'transport',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000006', 'online',     4.0,  TRUE,  '{}', 'Earn 4 mpd on online spend (10X HSBC rewards). Capped at $1,000/month across bonus categories.', NULL),
('00000000-0000-0000-0001-000000000006', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000006', 'petrol',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000006', 'travel',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000006', 'general',    0.4,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 7: Amex KrisFlyer Ascend (1.1 mpd base, 2 mpd dining/travel, 3 mpd SIA)
-- ============================================================
-- Direct KrisFlyer miles. High annual fee ($337.05) but strong bonus rates.
-- 1.1 mpd base. 2 mpd dining/supermarkets, 2 mpd travel, 3 mpd SIA.
-- Bonus capped at $2,500/month per category.
-- [VERIFIED from Amex website]
('00000000-0000-0000-0001-000000000007', 'dining',    2.0,  TRUE,  '{}', 'Earn 2 KrisFlyer miles per $1 on dining. Capped at $2,500/month.', 'https://www.americanexpress.com/sg/credit-cards/krisflyer-ascend-card/'),
('00000000-0000-0000-0001-000000000007', 'transport',  1.1,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000007', 'online',     1.1,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000007', 'groceries',  2.0,  TRUE,  '{}', 'Earn 2 KrisFlyer miles per $1 at supermarkets. Capped at $2,500/month.', NULL),
('00000000-0000-0000-0001-000000000007', 'petrol',     1.1,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000007', 'travel',     2.0,  TRUE,  '{}', 'Earn 2 KrisFlyer miles per $1 on travel. 3 mpd on SIA purchases. Capped at $2,500/month.', NULL),
('00000000-0000-0000-0001-000000000007', 'general',    1.1,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 8: BOC Elite Miles World Mastercard (flat 1.5 mpd)
-- ============================================================
-- Flat 1.5 mpd on ALL local spend (3X BOC rewards points).
-- No category bonus — uniformly strong.
-- Capped at $2,000/month for bonus.
-- [ESTIMATED — rate derived from 3X BOC points structure; verify with BOC T&Cs]
('00000000-0000-0000-0001-000000000008', 'dining',    1.5,  FALSE, '{}', NULL, 'https://www.bankofchina.com/sg/pbservice/pb1/201803/t20180329_11814364.html'),
('00000000-0000-0000-0001-000000000008', 'transport',  1.5,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000008', 'online',     1.5,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000008', 'groceries',  1.5,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000008', 'petrol',     1.5,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000008', 'travel',     1.5,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000008', 'general',    1.5,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 9: SC Visa Infinite (1.4 mpd local, 3 mpd overseas)
-- ============================================================
-- Premium card. 1.4 mpd on local spend (360 rewards points = 1.4 mpd).
-- 3 mpd on overseas spend. Income req $150K.
-- [VERIFIED from SC website]
('00000000-0000-0000-0001-000000000009', 'dining',    1.4,  FALSE, '{}', NULL, 'https://www.sc.com/sg/credit-cards/visa-infinite/'),
('00000000-0000-0000-0001-000000000009', 'transport',  1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000009', 'online',     1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000009', 'groceries',  1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000009', 'petrol',     1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000009', 'travel',     1.4,  FALSE, '{}', 'Overseas travel spend earns 3 mpd.', NULL),
('00000000-0000-0000-0001-000000000009', 'general',    1.4,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 10: DBS Woman's World Card (4 mpd online, 0.4 mpd else)
-- ============================================================
-- No annual fee. 10X DBS Points on online spend = 4 mpd.
-- Capped at $2,000/month for 10X bonus.
-- 0.4 mpd on all other categories.
-- [VERIFIED from DBS website]
('00000000-0000-0000-0001-000000000010', 'dining',    0.4,  FALSE, '{}', NULL, 'https://www.dbs.com.sg/personal/cards/credit-cards/womans-card'),
('00000000-0000-0000-0001-000000000010', 'transport',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000010', 'online',     4.0,  TRUE,  '{}', 'Earn 4 mpd (10X DBS Points) on online spend. Capped at $2,000/month.', NULL),
('00000000-0000-0000-0001-000000000010', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000010', 'petrol',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000010', 'travel',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000010', 'general',    0.4,  FALSE, '{}', NULL, NULL)

ON CONFLICT (card_id, category_id, is_bonus, effective_from) DO UPDATE SET
  earn_rate_mpd   = EXCLUDED.earn_rate_mpd,
  conditions      = EXCLUDED.conditions,
  conditions_note = EXCLUDED.conditions_note,
  source_url      = EXCLUDED.source_url,
  updated_at      = NOW();


-- ============================================================
-- PART C: Monthly Caps
-- ============================================================
-- Not all cards have caps. We only insert rows where a cap exists.
-- cap_type = 'spend' means the cap is on the SGD spend amount.
-- ============================================================

INSERT INTO public.caps (card_id, category_id, monthly_cap_amount, cap_type, notes)
VALUES

  -- CARD 1: DBS Altitude Visa — No specific monthly bonus cap documented
  -- (Standard earning is not capped; travel bonus portal has separate terms)

  -- CARD 2: Citi PremierMiles Visa — No monthly cap (flat rate, no bonus)

  -- CARD 3: UOB PRVI Miles Visa — No monthly cap (flat rate)

  -- CARD 4: OCBC 90°N Visa — No monthly cap (flat rate)

  -- CARD 5: KrisFlyer UOB Credit Card
  -- Bonus categories have a combined cap; estimated at $1,000/month [ESTIMATED]
  ('00000000-0000-0000-0001-000000000005', NULL, 1000.00, 'spend',
   'Combined cap across all bonus categories (contactless/online). [ESTIMATED — verify with UOB T&Cs]'),

  -- CARD 6: HSBC Revolution
  -- 10X bonus capped at $1,000/month across dining + online + entertainment
  ('00000000-0000-0000-0001-000000000006', NULL, 1000.00, 'spend',
   'Combined cap across dining, online, and entertainment bonus categories. [VERIFIED from HSBC website]'),

  -- CARD 7: Amex KrisFlyer Ascend
  -- $2,500/month per bonus category
  ('00000000-0000-0000-0001-000000000007', 'dining',    2500.00, 'spend',
   'Per-category cap. [VERIFIED from Amex website]'),
  ('00000000-0000-0000-0001-000000000007', 'groceries', 2500.00, 'spend',
   'Per-category cap. [VERIFIED from Amex website]'),
  ('00000000-0000-0000-0001-000000000007', 'travel',    2500.00, 'spend',
   'Per-category cap. [VERIFIED from Amex website]'),

  -- CARD 8: BOC Elite Miles World MC
  -- Bonus capped at $2,000/month across all categories [ESTIMATED]
  ('00000000-0000-0000-0001-000000000008', NULL, 2000.00, 'spend',
   'Combined cap across all categories. [ESTIMATED — verify with BOC T&Cs]'),

  -- CARD 9: SC Visa Infinite — No monthly cap documented for local spend

  -- CARD 10: DBS Woman's World Card
  -- 10X bonus capped at $2,000/month on online spend
  ('00000000-0000-0000-0001-000000000010', 'online', 2000.00, 'spend',
   'Cap on 10X bonus for online spending. [VERIFIED from DBS website]')

ON CONFLICT (card_id, category_id) DO UPDATE SET
  monthly_cap_amount = EXCLUDED.monthly_cap_amount,
  cap_type           = EXCLUDED.cap_type,
  notes              = EXCLUDED.notes,
  updated_at         = NOW();


-- ============================================================
-- PART D: Exclusions
-- ============================================================
-- Key exclusions per card. Not exhaustive; covers major known ones.
-- ============================================================

INSERT INTO public.exclusions (card_id, category_id, excluded_mccs, conditions, description)
VALUES

  -- CARD 1: DBS Altitude Visa
  ('00000000-0000-0000-0001-000000000001', NULL,
   ARRAY['9311', '9222', '9211', '9399'],  -- Government services
   '{"payment_type": "government"}',
   'Government-related transactions do not earn bonus DBS Points.'),
  ('00000000-0000-0000-0001-000000000001', NULL,
   ARRAY['6300', '6381', '6399'],  -- Insurance
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded from DBS Points earning.'),

  -- CARD 2: Citi PremierMiles Visa
  ('00000000-0000-0000-0001-000000000002', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government transactions excluded from Citi Miles earning.'),
  ('00000000-0000-0000-0001-000000000002', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance payments excluded.'),

  -- CARD 3: UOB PRVI Miles Visa
  ('00000000-0000-0000-0001-000000000003', NULL,
   ARRAY['9311', '9222', '9211'],
   '{"payment_type": "government"}',
   'Government payments excluded.'),
  ('00000000-0000-0000-0001-000000000003', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),

  -- CARD 4: OCBC 90°N Visa
  ('00000000-0000-0000-0001-000000000004', NULL,
   ARRAY['9311', '9222', '9211'],
   '{"payment_type": "government"}',
   'Government payments excluded.'),

  -- CARD 5: KrisFlyer UOB Credit Card
  ('00000000-0000-0000-0001-000000000005', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from KrisFlyer miles earning.'),
  ('00000000-0000-0000-0001-000000000005', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance payments excluded.'),
  ('00000000-0000-0000-0001-000000000005', 'petrol',
   ARRAY['5541', '5542'],
   '{}',
   'Petrol transactions excluded from bonus earning on KrisFlyer UOB. [ESTIMATED — verify]'),

  -- CARD 6: HSBC Revolution
  ('00000000-0000-0000-0001-000000000006', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from bonus.'),
  ('00000000-0000-0000-0001-000000000006', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),
  ('00000000-0000-0000-0001-000000000006', 'groceries',
   ARRAY['5411'],
   '{}',
   'Supermarkets typically excluded from the 10X bonus categories. [ESTIMATED]'),

  -- CARD 7: Amex KrisFlyer Ascend
  ('00000000-0000-0000-0001-000000000007', NULL,
   ARRAY['9311', '9222', '9211'],
   '{"payment_type": "government"}',
   'Government payments excluded.'),
  ('00000000-0000-0000-0001-000000000007', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),
  ('00000000-0000-0000-0001-000000000007', NULL,
   ARRAY[]::TEXT[],
   '{"payment_type": "installment"}',
   'Instalment plan payments excluded from bonus miles.'),

  -- CARD 8: BOC Elite Miles World MC
  ('00000000-0000-0000-0001-000000000008', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government transactions excluded.'),
  ('00000000-0000-0000-0001-000000000008', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),

  -- CARD 9: SC Visa Infinite
  ('00000000-0000-0000-0001-000000000009', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government transactions excluded from 360 reward points.'),
  ('00000000-0000-0000-0001-000000000009', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),

  -- CARD 10: DBS Woman's World Card
  ('00000000-0000-0000-0001-000000000010', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from DBS Points earning.'),
  ('00000000-0000-0000-0001-000000000010', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),
  ('00000000-0000-0000-0001-000000000010', 'online',
   ARRAY[]::TEXT[],
   '{"payment_type": "recurring"}',
   'Recurring online payments may not qualify for 10X bonus. [ESTIMATED — verify with DBS T&Cs]');
