-- =============================================================================
-- MaxiMile — Migration 014: Card Coverage Expansion (Sprint 11 — F22)
-- =============================================================================
-- Description:  Seeds 10 new high-priority miles cards with earn rules, caps,
--               eligibility metadata, and program mappings. Creates VOYAGE Miles
--               as a new transferable program and seeds its transfer partners.
--               Expands card coverage from 19 active miles cards to 29 (~85%
--               of Singapore miles card market).
--
-- New cards (10):
--   21. DBS Vantage Visa Infinite       — DBS Points
--   22. UOB Lady's Solitaire Metal Card — UNI$
--   23. UOB Visa Signature              — UNI$
--   24. OCBC VOYAGE Card                — VOYAGE Miles (NEW program)
--   25. Standard Chartered Journey Card  — 360 Rewards
--   26. Standard Chartered Smart Card    — 360 Rewards
--   27. Standard Chartered Beyond Card   — 360 Rewards
--   28. Maybank World Mastercard         — TreatsPoints
--   29. Maybank XL Rewards Card          — TreatsPoints
--   30. HSBC Premier Mastercard          — HSBC Reward Points
--
-- New objects:
--   Programs         — VOYAGE Miles (transferable, OCBC's own currency)
--   Transfer partners — 5 rows for VOYAGE Miles → airline partners
--
-- Prerequisites:
--   - 013_eligibility_metadata.sql (eligibility_criteria column exists)
--   - 011_miles_ecosystem.sql (expanded programs + transfer_partners table)
--
-- Earn rates verified: 2026-02-20 (sources: bank websites, MileLion, SingSaver)
--
-- Author:  Data Engineer
-- Created: 2026-02-20
-- Sprint:  11 — "Every Card" (F22)
-- =============================================================================

BEGIN;


-- ==========================================================================
-- SECTION 1: Create VOYAGE Miles program
-- ==========================================================================
-- OCBC VOYAGE has its own transferable currency ("VOYAGE Miles") distinct
-- from OCBC$ (OCBC Rewards). VOYAGE Miles transfer to 9+ airline/hotel
-- partners at various rates. Treated as 'transferable' like Amex MR.

INSERT INTO public.miles_programs (name, airline, program_type, icon_url) VALUES
  ('VOYAGE Miles', NULL, 'transferable', 'globe-outline');


-- ==========================================================================
-- SECTION 2: Seed 10 new cards
-- ==========================================================================

INSERT INTO public.cards (id, bank, name, slug, network, annual_fee, base_rate_mpd, image_url, is_active, notes, eligibility_criteria)
VALUES

  -- 21. DBS Vantage Visa Infinite
  (
    '00000000-0000-0000-0003-000000000021',
    'DBS',
    'DBS Vantage Visa Infinite',
    'dbs-vantage-visa-infinite',
    'visa',
    600.00,
    1.5,
    NULL,
    TRUE,
    'Premium DBS Treasures card. 1.5 mpd local, 2.2 mpd overseas (both uncapped). 25,000 bonus miles on annual fee payment. Income requirement S$120,000. Popular among high-earners for overseas spend. [VERIFIED from DBS website]',
    '{"min_income": 120000, "banking_tier": "treasures"}'
  ),

  -- 22. UOB Lady''s Solitaire Metal Card
  (
    '00000000-0000-0000-0003-000000000022',
    'UOB',
    'UOB Lady''s Solitaire Metal Card',
    'uob-ladys-solitaire',
    'visa',
    490.00,
    0.4,
    NULL,
    TRUE,
    'Premium women-only card. 4 mpd (10X UNI$) on TWO self-selected preferred categories (vs one for regular Lady''s). Up to 10 mpd with UOB One savings account link. Annual fee S$490. Higher monthly cap than Lady''s Card. [VERIFIED from UOB website]',
    '{"gender": "female"}'
  ),

  -- 23. UOB Visa Signature
  (
    '00000000-0000-0000-0003-000000000023',
    'UOB',
    'UOB Visa Signature',
    'uob-visa-signature',
    'visa',
    196.00,
    0.4,
    NULL,
    TRUE,
    'High-earner UOB card. 4 mpd (10X UNI$) on contactless, petrol, and overseas spend with min spend S$1,000/month. 0.4 mpd base. Annual fee S$196. Strong for contactless payment users. [VERIFIED from UOB website]',
    NULL
  ),

  -- 24. OCBC VOYAGE Card
  (
    '00000000-0000-0000-0003-000000000024',
    'OCBC',
    'OCBC VOYAGE Card',
    'ocbc-voyage-card',
    'visa',
    498.00,
    1.3,
    NULL,
    TRUE,
    'OCBC''s premium travel card. Earns VOYAGE Miles (own transferable currency). 1.3 mpd local, 1.6 mpd online, 2.2 mpd overseas — ALL UNCAPPED. Transfer to 9+ airlines at 1:1. In-house flight booking portal. Annual fee S$498. Best uncapped overseas card for mid-income. [VERIFIED from OCBC website]',
    NULL
  ),

  -- 25. Standard Chartered Journey Card
  (
    '00000000-0000-0000-0003-000000000025',
    'SC',
    'Standard Chartered Journey Card',
    'sc-journey-card',
    'visa',
    196.00,
    1.2,
    NULL,
    TRUE,
    'Lifestyle-focused SC card. 3 mpd on groceries, food delivery, and ride-hailing (cap S$1,000/month per category). 1.2 mpd local, 2 mpd overseas on other spend. Annual fee S$196. Unique niche for everyday lifestyle spend. [VERIFIED from SC website]',
    NULL
  ),

  -- 26. Standard Chartered Smart Card
  (
    '00000000-0000-0000-0003-000000000026',
    'SC',
    'Standard Chartered Smart Card',
    'sc-smart-card',
    'visa',
    99.00,
    0.4,
    NULL,
    TRUE,
    'Niche category specialist. Up to 9.28 mpd on fast food, streaming, EV charging, public transport. 0.4 mpd on other categories. Annual fee S$99. Extreme niche earn rates for specific lifestyle categories. Not for general spending. [VERIFIED from SC website]',
    NULL
  ),

  -- 27. Standard Chartered Beyond Card
  (
    '00000000-0000-0000-0003-000000000027',
    'SC',
    'Standard Chartered Beyond Card',
    'sc-beyond-card',
    'visa',
    1500.00,
    1.5,
    NULL,
    TRUE,
    'SC''s ultra-premium card. Standard tier: 1.5 mpd local, 3 mpd overseas. Priority Banking tier: 2 mpd local, 4 mpd overseas (uncapped). Up to 8 mpd overseas dining for PB. 100,000 welcome miles. Annual fee S$1,500+. [VERIFIED from SC website]',
    '{"banking_tier": "priority_banking"}'
  ),

  -- 28. Maybank World Mastercard
  (
    '00000000-0000-0000-0003-000000000028',
    'Maybank',
    'Maybank World Mastercard',
    'maybank-world-mc',
    'mastercard',
    196.00,
    0.4,
    NULL,
    TRUE,
    'BEST petrol card in Singapore. 4 mpd on petrol — UNCAPPED, NO minimum spend requirement. 2.8-3.2 mpd on overseas spend. 0.4 mpd on other local categories. Annual fee S$196. Must-have for drivers. [VERIFIED from Maybank website]',
    NULL
  ),

  -- 29. Maybank XL Rewards Card
  (
    '00000000-0000-0000-0003-000000000029',
    'Maybank',
    'Maybank XL Rewards Card',
    'maybank-xl-rewards',
    'visa',
    87.00,
    0.4,
    NULL,
    TRUE,
    'NEW card (launched July 2025). 4 mpd on dining, shopping, flights, hotels, entertainment, overseas. Age restricted: 21-39 only. Annual fee S$87. Growing fast among young professionals. Promo rates may change. [VERIFIED from Maybank website]',
    '{"age_min": 21, "age_max": 39}'
  ),

  -- 30. HSBC Premier Mastercard
  (
    '00000000-0000-0000-0003-000000000030',
    'HSBC',
    'HSBC Premier Mastercard',
    'hsbc-premier-mc',
    'mastercard',
    709.00,
    1.4,
    NULL,
    TRUE,
    'HSBC''s top-tier card. 1.4 mpd local, 2.3 mpd overseas. Unlimited Priority Pass. 91,800 miles welcome bonus. Annual fee S$709 (waived for Premier customers). Comprehensive travel insurance. [VERIFIED from HSBC website]',
    '{"banking_tier": "premier"}'
  )

ON CONFLICT (id) DO UPDATE SET
  bank                = EXCLUDED.bank,
  name                = EXCLUDED.name,
  slug                = EXCLUDED.slug,
  network             = EXCLUDED.network,
  annual_fee          = EXCLUDED.annual_fee,
  base_rate_mpd       = EXCLUDED.base_rate_mpd,
  image_url           = EXCLUDED.image_url,
  is_active           = EXCLUDED.is_active,
  notes               = EXCLUDED.notes,
  eligibility_criteria = EXCLUDED.eligibility_criteria,
  updated_at          = NOW();


-- ==========================================================================
-- SECTION 3: Map new cards to miles programs
-- ==========================================================================

-- DBS Vantage → DBS Points
UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = 'DBS Points')
WHERE id = '00000000-0000-0000-0003-000000000021';

-- UOB Lady's Solitaire → UNI$
UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = 'UNI$')
WHERE id = '00000000-0000-0000-0003-000000000022';

-- UOB Visa Signature → UNI$
UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = 'UNI$')
WHERE id = '00000000-0000-0000-0003-000000000023';

-- OCBC VOYAGE → VOYAGE Miles (new program)
UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = 'VOYAGE Miles')
WHERE id = '00000000-0000-0000-0003-000000000024';

-- SC Journey → 360 Rewards
UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = '360 Rewards')
WHERE id = '00000000-0000-0000-0003-000000000025';

-- SC Smart → 360 Rewards
UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = '360 Rewards')
WHERE id = '00000000-0000-0000-0003-000000000026';

-- SC Beyond → 360 Rewards
UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = '360 Rewards')
WHERE id = '00000000-0000-0000-0003-000000000027';

-- Maybank World MC → TreatsPoints
UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = 'TreatsPoints')
WHERE id = '00000000-0000-0000-0003-000000000028';

-- Maybank XL Rewards → TreatsPoints
UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = 'TreatsPoints')
WHERE id = '00000000-0000-0000-0003-000000000029';

-- HSBC Premier MC → HSBC Reward Points
UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = 'HSBC Reward Points')
WHERE id = '00000000-0000-0000-0003-000000000030';


-- ==========================================================================
-- SECTION 4: Earn Rules (7 categories × 10 cards = 70 rows)
-- ==========================================================================

INSERT INTO public.earn_rules (card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note, source_url)
VALUES

-- CARD 21: DBS Vantage Visa Infinite
-- 1.5 mpd local across all categories, 2.2 mpd overseas (captured via travel category + conditions)
('00000000-0000-0000-0003-000000000021', 'dining',    1.5,  FALSE, '{}', 'Flat 1.5 mpd on local dining. 2.2 mpd on overseas dining. Uncapped. [VERIFIED]', 'https://www.dbs.com.sg/personal/cards/credit-cards/dbs-vantage-card'),
('00000000-0000-0000-0003-000000000021', 'transport',  1.5,  FALSE, '{}', 'Flat 1.5 mpd on local transport. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000021', 'online',     1.5,  FALSE, '{}', 'Flat 1.5 mpd on local online. 2.2 mpd on overseas online. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000021', 'groceries',  1.5,  FALSE, '{}', 'Flat 1.5 mpd on local groceries. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000021', 'petrol',     1.5,  FALSE, '{}', 'Flat 1.5 mpd on petrol. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000021', 'travel',     2.2,  TRUE,  '{"currency": "foreign"}', 'Earn 2.2 mpd on all overseas/FCY spend including travel. Uncapped. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000021', 'general',    1.5,  FALSE, '{}', 'Flat 1.5 mpd on all other local spend. [VERIFIED]', NULL),

-- CARD 22: UOB Lady's Solitaire Metal Card
-- 4 mpd on TWO self-selected preferred categories, 0.4 mpd base
('00000000-0000-0000-0003-000000000022', 'dining',    4.0,  TRUE,  '{"selectable_category": true, "max_selected": 2}', 'Earn 4 mpd (10X UNI$) if dining is one of TWO selected preferred categories. 0.4 mpd otherwise. [VERIFIED]', 'https://www.uob.com.sg/personal/cards/credit/ladys-solitaire-card.page'),
('00000000-0000-0000-0003-000000000022', 'transport',  0.4,  FALSE, '{}', 'Base rate unless selected as preferred category.', NULL),
('00000000-0000-0000-0003-000000000022', 'online',     4.0,  TRUE,  '{"selectable_category": true, "max_selected": 2}', 'Earn 4 mpd if online is one of TWO selected preferred categories. 0.4 mpd otherwise. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000022', 'groceries',  0.4,  FALSE, '{}', 'Base rate unless selected as preferred category.', NULL),
('00000000-0000-0000-0003-000000000022', 'petrol',     0.4,  FALSE, '{}', 'Base rate unless selected as preferred category.', NULL),
('00000000-0000-0000-0003-000000000022', 'travel',     0.4,  FALSE, '{}', 'Base rate unless selected as preferred category.', NULL),
('00000000-0000-0000-0003-000000000022', 'general',    4.0,  TRUE,  '{"selectable_category": true, "max_selected": 2}', 'Earn 4 mpd if general/fashion is one of TWO selected preferred categories. Beauty, fashion, bags, shoes included. [VERIFIED]', NULL),

-- CARD 23: UOB Visa Signature
-- 4 mpd contactless, petrol, overseas with min spend S$1,000/month
('00000000-0000-0000-0003-000000000023', 'dining',    4.0,  TRUE,  '{"min_spend_monthly": 1000, "payment_method": "contactless"}', 'Earn 4 mpd (10X UNI$) on contactless dining with min spend S$1,000/month. 0.4 mpd if conditions not met. [VERIFIED]', 'https://www.uob.com.sg/personal/cards/credit/visa-signature.page'),
('00000000-0000-0000-0003-000000000023', 'transport',  4.0,  TRUE,  '{"min_spend_monthly": 1000, "payment_method": "contactless"}', 'Earn 4 mpd on contactless transport with min spend S$1,000/month. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000023', 'online',     0.4,  FALSE, '{}', 'Online does not qualify for contactless bonus. Base 0.4 mpd. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000023', 'groceries',  4.0,  TRUE,  '{"min_spend_monthly": 1000, "payment_method": "contactless"}', 'Earn 4 mpd on contactless groceries with min spend S$1,000/month. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000023', 'petrol',     4.0,  TRUE,  '{"min_spend_monthly": 1000}', 'Earn 4 mpd on petrol with min spend S$1,000/month. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000023', 'travel',     4.0,  TRUE,  '{"min_spend_monthly": 1000, "currency": "foreign"}', 'Earn 4 mpd on overseas/FCY spend with min spend S$1,000/month. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000023', 'general',    0.4,  FALSE, '{}', 'Base 0.4 mpd on non-contactless, non-petrol, non-overseas. [VERIFIED]', NULL),

-- CARD 24: OCBC VOYAGE Card
-- 1.3 mpd local, 1.6 mpd online, 2.2 mpd overseas — ALL UNCAPPED
('00000000-0000-0000-0003-000000000024', 'dining',    1.3,  FALSE, '{}', 'Flat 1.3 VOYAGE Miles per $1 on local dining. Uncapped. [VERIFIED]', 'https://www.ocbc.com/personal-banking/cards/voyage-card'),
('00000000-0000-0000-0003-000000000024', 'transport',  1.3,  FALSE, '{}', 'Flat 1.3 mpd on local transport. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000024', 'online',     1.6,  TRUE,  '{}', 'Earn 1.6 VOYAGE Miles per $1 on online spend. Uncapped. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000024', 'groceries',  1.3,  FALSE, '{}', 'Flat 1.3 mpd on local groceries. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000024', 'petrol',     1.3,  FALSE, '{}', 'Flat 1.3 mpd on petrol. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000024', 'travel',     2.2,  TRUE,  '{"currency": "foreign"}', 'Earn 2.2 VOYAGE Miles per $1 on all overseas/FCY spend. Uncapped. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000024', 'general',    1.3,  FALSE, '{}', 'Flat 1.3 mpd on all other local spend. [VERIFIED]', NULL),

-- CARD 25: Standard Chartered Journey Card
-- 3 mpd groceries/food delivery/ride-hailing (cap S$1k/month), 1.2 local, 2 overseas
('00000000-0000-0000-0003-000000000025', 'dining',    3.0,  TRUE,  '{"includes": "food_delivery"}', 'Earn 3 mpd on dining and food delivery. Cap S$1,000/month. 1.2 mpd after cap. [VERIFIED]', 'https://www.sc.com/sg/credit-cards/journey-credit-card/'),
('00000000-0000-0000-0003-000000000025', 'transport',  3.0,  TRUE,  '{"includes": "ride_hailing"}', 'Earn 3 mpd on ride-hailing (Grab, Gojek). Cap S$1,000/month. 1.2 mpd after cap. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000025', 'online',     1.2,  FALSE, '{}', 'Base 1.2 mpd on online shopping. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000025', 'groceries',  3.0,  TRUE,  '{}', 'Earn 3 mpd on groceries. Cap S$1,000/month. 1.2 mpd after cap. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000025', 'petrol',     1.2,  FALSE, '{}', 'Base 1.2 mpd on petrol. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000025', 'travel',     2.0,  TRUE,  '{"currency": "foreign"}', 'Earn 2 mpd on overseas/FCY spend. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000025', 'general',    1.2,  FALSE, '{}', 'Base 1.2 mpd on all other local spend. [VERIFIED]', NULL),

-- CARD 26: Standard Chartered Smart Card
-- Up to 9.28 mpd on niche categories, 0.4 mpd on everything else
('00000000-0000-0000-0003-000000000026', 'dining',    5.0,  TRUE,  '{"includes": "fast_food_only"}', 'Earn up to 5 mpd on fast food chains. Regular dining earns 0.4 mpd. [VERIFIED]', 'https://www.sc.com/sg/credit-cards/smart-credit-card/'),
('00000000-0000-0000-0003-000000000026', 'transport',  9.28, TRUE,  '{"includes": "public_transport_ev_charging"}', 'Earn up to 9.28 mpd on public transport (EZ-Link top-up, MRT/bus) and EV charging. Regular transport 0.4 mpd. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000026', 'online',     5.0,  TRUE,  '{"includes": "streaming_services"}', 'Earn up to 5 mpd on streaming services (Netflix, Spotify, Disney+). Other online 0.4 mpd. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000026', 'groceries',  0.4,  FALSE, '{}', 'Base 0.4 mpd. Groceries not a bonus category. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000026', 'petrol',     0.4,  FALSE, '{}', 'Base 0.4 mpd. Petrol not a bonus category (EV charging is under transport). [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000026', 'travel',     0.4,  FALSE, '{}', 'Base 0.4 mpd on travel. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000026', 'general',    0.4,  FALSE, '{}', 'Base 0.4 mpd. [VERIFIED]', NULL),

-- CARD 27: Standard Chartered Beyond Card
-- Tiered: 1.5/3 mpd standard; 2/4 mpd Priority Banking (PB)
-- We store the PB rates as the card requires PB anyway. Standard tier noted in conditions.
('00000000-0000-0000-0003-000000000027', 'dining',    2.0,  TRUE,  '{"banking_tier": "priority_banking"}', 'Priority Banking: 2 mpd local dining. Standard: 1.5 mpd. Up to 8 mpd overseas dining for PB. [VERIFIED]', 'https://www.sc.com/sg/credit-cards/beyond-credit-card/'),
('00000000-0000-0000-0003-000000000027', 'transport',  2.0,  TRUE,  '{"banking_tier": "priority_banking"}', 'Priority Banking: 2 mpd local transport. Standard: 1.5 mpd. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000027', 'online',     2.0,  TRUE,  '{"banking_tier": "priority_banking"}', 'Priority Banking: 2 mpd local online. Standard: 1.5 mpd. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000027', 'groceries',  2.0,  TRUE,  '{"banking_tier": "priority_banking"}', 'Priority Banking: 2 mpd local groceries. Standard: 1.5 mpd. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000027', 'petrol',     2.0,  TRUE,  '{"banking_tier": "priority_banking"}', 'Priority Banking: 2 mpd petrol. Standard: 1.5 mpd. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000027', 'travel',     4.0,  TRUE,  '{"banking_tier": "priority_banking", "currency": "foreign"}', 'Priority Banking: 4 mpd overseas/FCY. Standard: 3 mpd overseas. Uncapped. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000027', 'general',    2.0,  TRUE,  '{"banking_tier": "priority_banking"}', 'Priority Banking: 2 mpd general. Standard: 1.5 mpd. [VERIFIED]', NULL),

-- CARD 28: Maybank World Mastercard
-- 4 mpd petrol (UNCAPPED, no minimum), 2.8-3.2 mpd overseas, 0.4 mpd other
('00000000-0000-0000-0003-000000000028', 'dining',    0.4,  FALSE, '{}', 'Base 0.4 mpd on local dining. [VERIFIED]', 'https://www.maybank.com.sg/cards/credit-cards/world-mastercard/'),
('00000000-0000-0000-0003-000000000028', 'transport',  0.4,  FALSE, '{}', 'Base 0.4 mpd on transport. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000028', 'online',     0.4,  FALSE, '{}', 'Base 0.4 mpd on online. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000028', 'groceries',  0.4,  FALSE, '{}', 'Base 0.4 mpd on groceries. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000028', 'petrol',     4.0,  TRUE,  '{}', 'Earn 4 mpd on petrol — UNCAPPED, NO minimum spend. Best petrol card in Singapore. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000028', 'travel',     3.2,  TRUE,  '{"currency": "foreign"}', 'Earn 2.8-3.2 mpd on overseas/FCY spend (varies by merchant). [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000028', 'general',    0.4,  FALSE, '{}', 'Base 0.4 mpd on all other local spend. [VERIFIED]', NULL),

-- CARD 29: Maybank XL Rewards Card
-- 4 mpd on dining/shopping/flights/hotels/entertainment/overseas
('00000000-0000-0000-0003-000000000029', 'dining',    4.0,  TRUE,  '{}', 'Earn 4 mpd on dining. Age 21-39 only. [VERIFIED]', 'https://www.maybank.com.sg/cards/credit-cards/xl-rewards-card/'),
('00000000-0000-0000-0003-000000000029', 'transport',  0.4,  FALSE, '{}', 'Base 0.4 mpd on transport. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000029', 'online',     4.0,  TRUE,  '{}', 'Earn 4 mpd on online shopping. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000029', 'groceries',  0.4,  FALSE, '{}', 'Base 0.4 mpd on groceries. Not a bonus category. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000029', 'petrol',     0.4,  FALSE, '{}', 'Base 0.4 mpd on petrol. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000029', 'travel',     4.0,  TRUE,  '{}', 'Earn 4 mpd on flights, hotels, travel, overseas/FCY spend. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000029', 'general',    4.0,  TRUE,  '{"includes": "entertainment"}', 'Earn 4 mpd on entertainment and general shopping. [VERIFIED]', NULL),

-- CARD 30: HSBC Premier Mastercard
-- 1.4 mpd local, 2.3 mpd overseas
('00000000-0000-0000-0003-000000000030', 'dining',    1.4,  FALSE, '{}', 'Flat 1.4 mpd on local dining. [VERIFIED]', 'https://www.hsbc.com.sg/credit-cards/products/premier-mastercard/'),
('00000000-0000-0000-0003-000000000030', 'transport',  1.4,  FALSE, '{}', 'Flat 1.4 mpd on local transport. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000030', 'online',     1.4,  FALSE, '{}', 'Flat 1.4 mpd on local online. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000030', 'groceries',  1.4,  FALSE, '{}', 'Flat 1.4 mpd on local groceries. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000030', 'petrol',     1.4,  FALSE, '{}', 'Flat 1.4 mpd on petrol. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000030', 'travel',     2.3,  TRUE,  '{"currency": "foreign"}', 'Earn 2.3 mpd on overseas/FCY spend. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000030', 'general',    1.4,  FALSE, '{}', 'Flat 1.4 mpd on all other local spend. [VERIFIED]', NULL)

ON CONFLICT (card_id, category_id, is_bonus, effective_from) DO UPDATE SET
  earn_rate_mpd   = EXCLUDED.earn_rate_mpd,
  conditions      = EXCLUDED.conditions,
  conditions_note = EXCLUDED.conditions_note,
  source_url      = EXCLUDED.source_url,
  updated_at      = NOW();


-- ==========================================================================
-- SECTION 5: Monthly Caps
-- ==========================================================================

INSERT INTO public.caps (card_id, category_id, monthly_cap_amount, cap_type, notes)
VALUES

  -- CARD 22: UOB Lady's Solitaire — cap on selected categories
  ('00000000-0000-0000-0003-000000000022', NULL, 2000.00, 'spend',
   'Combined cap across TWO selected preferred categories. Higher than regular Lady''s Card (S$1,000). [VERIFIED from UOB website]'),

  -- CARD 23: UOB Visa Signature — cap on contactless bonus
  ('00000000-0000-0000-0003-000000000023', NULL, 2000.00, 'spend',
   'Combined cap across contactless, petrol, overseas bonus categories. Requires min spend S$1,000/month. [VERIFIED from UOB website]'),

  -- CARD 25: SC Journey — per-category caps
  ('00000000-0000-0000-0003-000000000025', 'dining', 1000.00, 'spend',
   'Cap on 3 mpd dining/food delivery bonus. Reverts to 1.2 mpd after cap. [VERIFIED from SC website]'),
  ('00000000-0000-0000-0003-000000000025', 'transport', 1000.00, 'spend',
   'Cap on 3 mpd ride-hailing bonus. Reverts to 1.2 mpd after cap. [VERIFIED from SC website]'),
  ('00000000-0000-0000-0003-000000000025', 'groceries', 1000.00, 'spend',
   'Cap on 3 mpd groceries bonus. Reverts to 1.2 mpd after cap. [VERIFIED from SC website]'),

  -- CARD 26: SC Smart — per-category caps
  ('00000000-0000-0000-0003-000000000026', 'dining', 500.00, 'spend',
   'Cap on fast food bonus category. [ESTIMATED — SC Smart has tiered caps]'),
  ('00000000-0000-0000-0003-000000000026', 'transport', 500.00, 'spend',
   'Cap on public transport/EV charging bonus. [ESTIMATED]'),
  ('00000000-0000-0000-0003-000000000026', 'online', 500.00, 'spend',
   'Cap on streaming services bonus. [ESTIMATED]'),

  -- CARD 29: Maybank XL Rewards — cap on bonus categories
  ('00000000-0000-0000-0003-000000000029', NULL, 2000.00, 'spend',
   'Combined cap across all 4 mpd bonus categories. [ESTIMATED — verify with Maybank T&Cs]')

  -- NOTE: No caps for DBS Vantage (uncapped), OCBC VOYAGE (uncapped),
  -- SC Beyond (uncapped for PB), Maybank World MC petrol (uncapped),
  -- HSBC Premier MC (no meaningful caps)

ON CONFLICT (card_id, category_id) DO UPDATE SET
  monthly_cap_amount = EXCLUDED.monthly_cap_amount,
  cap_type           = EXCLUDED.cap_type,
  notes              = EXCLUDED.notes,
  updated_at         = NOW();


-- ==========================================================================
-- SECTION 6: VOYAGE Miles Transfer Partners
-- ==========================================================================
-- OCBC VOYAGE Miles transfer at 1:1 to most airline partners.
-- Source: https://www.ocbc.com/personal-banking/cards/voyage-card

INSERT INTO public.transfer_partners
  (source_program_id, destination_program_id, conversion_rate_from, conversion_rate_to, transfer_fee_sgd, min_transfer_amount, transfer_url, last_verified_at)
VALUES
  -- VOYAGE Miles → KrisFlyer (1:1)
  (
    (SELECT id FROM public.miles_programs WHERE name = 'VOYAGE Miles'),
    (SELECT id FROM public.miles_programs WHERE name = 'KrisFlyer'),
    1, 1, NULL, 5000,
    'https://www.ocbc.com/personal-banking/cards/voyage-card',
    NOW()
  ),
  -- VOYAGE Miles → Asia Miles (1:1)
  (
    (SELECT id FROM public.miles_programs WHERE name = 'VOYAGE Miles'),
    (SELECT id FROM public.miles_programs WHERE name = 'Asia Miles'),
    1, 1, NULL, 5000,
    NULL,
    NOW()
  ),
  -- VOYAGE Miles → BA Avios (1:1)
  (
    (SELECT id FROM public.miles_programs WHERE name = 'VOYAGE Miles'),
    (SELECT id FROM public.miles_programs WHERE name = 'British Airways Avios'),
    1, 1, NULL, 5000,
    NULL,
    NOW()
  ),
  -- VOYAGE Miles → Qantas FF (1:1)
  (
    (SELECT id FROM public.miles_programs WHERE name = 'VOYAGE Miles'),
    (SELECT id FROM public.miles_programs WHERE name = 'Qantas Frequent Flyer'),
    1, 1, NULL, 5000,
    NULL,
    NOW()
  ),
  -- VOYAGE Miles → Flying Blue (1:1)
  (
    (SELECT id FROM public.miles_programs WHERE name = 'VOYAGE Miles'),
    (SELECT id FROM public.miles_programs WHERE name = 'Flying Blue'),
    1, 1, NULL, 5000,
    NULL,
    NOW()
  )

ON CONFLICT (source_program_id, destination_program_id) DO UPDATE SET
  conversion_rate_from = EXCLUDED.conversion_rate_from,
  conversion_rate_to   = EXCLUDED.conversion_rate_to,
  transfer_fee_sgd     = EXCLUDED.transfer_fee_sgd,
  min_transfer_amount  = EXCLUDED.min_transfer_amount,
  transfer_url         = EXCLUDED.transfer_url,
  last_verified_at     = EXCLUDED.last_verified_at;


-- ==========================================================================
-- SECTION 7: Verification queries
-- ==========================================================================
-- Run after applying to verify:
--
--   -- Total active miles cards should be 29
--   SELECT COUNT(*) FROM cards WHERE is_active = TRUE;
--
--   -- All active cards should have a miles program
--   SELECT name FROM cards WHERE is_active = TRUE AND miles_program_id IS NULL;
--   -- Should return 0 rows
--
--   -- New cards with eligibility restrictions
--   SELECT name, eligibility_criteria FROM cards
--   WHERE eligibility_criteria IS NOT NULL AND is_active = TRUE
--   ORDER BY name;
--   -- Should return: DBS Vantage, HSBC Premier MC, Maybank XL, SC Beyond, UOB Lady's Solitaire
--
--   -- VOYAGE Miles program and its transfer partners
--   SELECT mp.name AS source, mp2.name AS destination,
--          tp.conversion_rate_from, tp.conversion_rate_to
--   FROM transfer_partners tp
--   JOIN miles_programs mp ON tp.source_program_id = mp.id
--   JOIN miles_programs mp2 ON tp.destination_program_id = mp2.id
--   WHERE mp.name = 'VOYAGE Miles';
--   -- Should return 5 rows (KrisFlyer, Asia Miles, BA Avios, Qantas FF, Flying Blue)
--
--   -- Earn rules count per new card (should be 7 each)
--   SELECT c.name, COUNT(er.id) AS rule_count
--   FROM cards c
--   LEFT JOIN earn_rules er ON c.id = er.card_id
--   WHERE c.id LIKE '00000000-0000-0000-0003%'
--   GROUP BY c.name
--   ORDER BY c.name;


COMMIT;
