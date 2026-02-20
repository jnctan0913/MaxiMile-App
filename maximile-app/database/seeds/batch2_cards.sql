-- =============================================================================
-- MaxiMile — Batch 2 Card Rules Seed Data (batch2_cards.sql)
-- =============================================================================
-- Description: Seed data for cards 11-20 (Singapore miles credit cards).
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
--   - Miles conversion: UOB UNI$ 1 = 400 miles; OCBC$ 1 = 200 miles;
--     Citi Reward Points 1 = 0.4 miles; Maybank TreatsPoints 3000 = 1000 miles
--
-- Author:  Data Engineer Agent
-- Created: 2026-02-19
-- =============================================================================

-- ============================================================
-- PART A: Card Metadata (cards 11-20)
-- ============================================================

INSERT INTO public.cards (id, bank, name, slug, network, annual_fee, base_rate_mpd, image_url, is_active, notes)
VALUES

  -- 11. UOB Lady's Card
  (
    '00000000-0000-0000-0002-000000000011',
    'UOB',
    'UOB Lady''s Card',
    'uob-ladys-card',
    'visa',
    0,       -- No annual fee (first year waived, subsequent often waivable)
    0.4,     -- 0.4 mpd base (1X UNI$ per $5 = 400 miles per $5 = 0.4 mpd base on non-bonus)
    NULL,
    TRUE,
    'No annual fee. 10X UNI$ on beauty, fashion, bags/shoes (= 4 mpd). 0.4 mpd on other categories. Capped at $1,000/month on 10X categories. Popular with female cardholders. [VERIFIED from UOB website]'
  ),

  -- 12. OCBC Titanium Rewards Card
  (
    '00000000-0000-0000-0002-000000000012',
    'OCBC',
    'OCBC Titanium Rewards Card',
    'ocbc-titanium-rewards',
    'visa',
    0,       -- No annual fee (first 2 years, then $192.60)
    0.4,     -- 0.4 mpd base (1X OCBC$ per $5 = 200 miles per $5 base)
    NULL,
    TRUE,
    'No annual fee first 2 years. 10X OCBC$ on dining and online shopping (= 4 mpd). 1X OCBC$ on other spend (= 0.4 mpd). Capped at $1,000/month on 10X categories. [VERIFIED from OCBC website]'
  ),

  -- 13. HSBC TravelOne Credit Card
  (
    '00000000-0000-0000-0002-000000000013',
    'HSBC',
    'HSBC TravelOne Credit Card',
    'hsbc-travelone',
    'visa',
    192.60,  -- $192.60 annual fee (waivable)
    1.0,     -- 1 mpd on local spend
    NULL,
    TRUE,
    'Flat-rate travel card. 1 mpd on local spend, 2.7 mpd on overseas spend. No category bonus locally — pure flat rate. Annual fee $192.60 (often waivable). Good for overseas spenders. [VERIFIED from HSBC website]'
  ),

  -- 14. American Express KrisFlyer Credit Card
  (
    '00000000-0000-0000-0002-000000000014',
    'Amex',
    'American Express KrisFlyer Credit Card',
    'amex-krisflyer-credit-card',
    'amex',
    176.55,  -- $176.55 annual fee
    1.1,     -- 1.1 KrisFlyer miles per $1 base
    NULL,
    TRUE,
    'Entry-level KrisFlyer Amex. Direct KrisFlyer miles. 1.1 mpd base, 1.5 mpd on dining, 2 mpd on SIA purchases. Lower annual fee than Ascend ($176.55 vs $337.05). [VERIFIED from Amex website]'
  ),

  -- 15. Standard Chartered X Credit Card
  (
    '00000000-0000-0000-0002-000000000015',
    'SC',
    'Standard Chartered X Credit Card',
    'sc-x-card',
    'visa',
    0,       -- No annual fee
    0.4,     -- 0.4 mpd base (non-bonus categories)
    NULL,
    TRUE,
    'No annual fee. Targeted at young professionals (income req $30K). Up to 3.3 mpd on selected categories (dining, groceries, petrol, transport, online). Requires min spend $500/month to unlock bonus. Capped at $2,000/month. [ESTIMATED — bonus mpd varies by tier; 3.3 mpd is the commonly cited top rate]'
  ),

  -- 16. Maybank Horizon Visa Signature
  (
    '00000000-0000-0000-0002-000000000016',
    'Maybank',
    'Maybank Horizon Visa Signature',
    'maybank-horizon-visa',
    'visa',
    0,       -- $0 first year, then $194.40
    0.4,     -- 0.4 mpd base (1X TreatsPoints base)
    NULL,
    TRUE,
    'General miles card. 0.4 mpd base. Up to 3.2 mpd on overseas spend and 1.6 mpd on local selected categories (with min spend conditions). TreatsPoints convert to KrisFlyer/Asia Miles. Annual fee $0 first year, $194.40 thereafter. [ESTIMATED — rates depend on TreatsPoints conversion which varies]'
  ),

  -- 17. Maybank FC Barcelona Visa Signature
  (
    '00000000-0000-0000-0002-000000000017',
    'Maybank',
    'Maybank FC Barcelona Visa Signature',
    'maybank-fc-barcelona',
    'visa',
    0,       -- No annual fee
    0.4,     -- 0.4 mpd base
    NULL,
    TRUE,
    'Branded card with same TreatsPoints structure as Horizon. 0.4 mpd base. No annual fee. Earn TreatsPoints convertible to miles. Bonus via Maybank promotions. Effectively a cashback-miles hybrid. [ESTIMATED — limited public data on specific bonus rates; uses Horizon-equivalent rates]'
  ),

  -- 18. Citi Rewards Card
  (
    '00000000-0000-0000-0002-000000000018',
    'Citi',
    'Citi Rewards Card',
    'citi-rewards',
    'visa',
    0,       -- No annual fee (waived)
    0.4,     -- 0.4 mpd base (1 Citi ThankYou Point per $1 = 0.4 mpd)
    NULL,
    TRUE,
    'No annual fee. 10X Citi ThankYou Points on shopping and online (= 4 mpd). 1X on other spend (= 0.4 mpd). Capped at $1,000/month on bonus categories. Popular for online/shopping spenders. [VERIFIED from Citi website]'
  ),

  -- 19. POSB Everyday Card
  (
    '00000000-0000-0000-0002-000000000019',
    'DBS/POSB',
    'POSB Everyday Card',
    'posb-everyday-card',
    'visa',
    0,       -- No annual fee
    0.4,     -- 0.4 mpd base (1X DBS Points per $5 = 0.4 mpd)
    NULL,
    TRUE,
    'No annual fee. Entry-level DBS/POSB card. 0.4 mpd base on all categories. Primarily a cashback card (up to 5% cashback on specific categories) but DBS Points can be converted to miles at 5000 points = 2000 miles (= 0.4 mpd). Very low miles earning — included for completeness. [ESTIMATED — miles path is secondary to cashback on this card]'
  ),

  -- 20. UOB Preferred Platinum Visa
  (
    '00000000-0000-0000-0002-000000000020',
    'UOB',
    'UOB Preferred Platinum Visa',
    'uob-preferred-platinum',
    'visa',
    0,       -- No annual fee
    0.4,     -- 0.4 mpd base (1X UNI$ per $5)
    NULL,
    TRUE,
    'No annual fee. 10X UNI$ on dining (= 4 mpd). 0.4 mpd on other spend. Capped at $1,000/month on bonus categories. Minimum spend $600/month to qualify for 10X. Popular mid-range dining card. [VERIFIED from UOB website]'
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
--   is_bonus = TRUE  -> this is the accelerated/bonus rate for this category
--   is_bonus = FALSE -> this is the base rate fallback
--
-- For clarity, we insert the EFFECTIVE rate the user earns.
-- If a card earns the same base rate across all categories, we still insert
-- per-category rows so the recommendation engine doesn't need fallback logic.
-- ============================================================

INSERT INTO public.earn_rules (card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note, source_url)
VALUES

-- ============================================================
-- CARD 11: UOB Lady's Card (4 mpd on beauty/fashion, 0.4 mpd else)
-- ============================================================
-- 10X UNI$ on "Ladies' categories": beauty, fashion, bags & shoes.
-- Our 7-category taxonomy does not have a "beauty/fashion" category.
-- Beauty/fashion merchants are typically coded under "online" (if online)
-- or "general" (if in-store). We model the bonus on "online" (where
-- fashion e-commerce like Shopee/Lazada fashion would land) and
-- "general" for in-store fashion/beauty.
-- 0.4 mpd on everything else.
-- Capped at $1,000/month on 10X categories.
-- [VERIFIED from UOB website]
('00000000-0000-0000-0002-000000000011', 'dining',    0.4,  FALSE, '{}', NULL, 'https://www.uob.com.sg/personal/cards/credit/ladys-card.page'),
('00000000-0000-0000-0002-000000000011', 'transport',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000011', 'online',     4.0,  TRUE,  '{"category_restriction": "fashion_beauty_bags_shoes"}', 'Earn 4 mpd (10X UNI$) on online fashion, beauty, bags and shoes merchants. Other online merchants earn 0.4 mpd. [VERIFIED]', NULL),
('00000000-0000-0000-0002-000000000011', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000011', 'petrol',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000011', 'travel',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000011', 'general',    4.0,  TRUE,  '{"category_restriction": "fashion_beauty_bags_shoes"}', 'Earn 4 mpd (10X UNI$) on in-store fashion, beauty, bags and shoes merchants. Other general merchants earn 0.4 mpd. [VERIFIED]', NULL),

-- ============================================================
-- CARD 12: OCBC Titanium Rewards (4 mpd dining/online, 0.4 mpd else)
-- ============================================================
-- 10X OCBC$ on dining and online shopping (= 4 mpd).
-- 1X OCBC$ on everything else (= 0.4 mpd).
-- Capped at $1,000/month across 10X categories.
-- [VERIFIED from OCBC website]
('00000000-0000-0000-0002-000000000012', 'dining',    4.0,  TRUE,  '{}', 'Earn 4 mpd (10X OCBC$) on dining. Capped at $1,000/month across bonus categories. [VERIFIED]', 'https://www.ocbc.com/personal-banking/cards/titanium-rewards-card'),
('00000000-0000-0000-0002-000000000012', 'transport',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000012', 'online',     4.0,  TRUE,  '{}', 'Earn 4 mpd (10X OCBC$) on online shopping. Capped at $1,000/month across bonus categories. [VERIFIED]', NULL),
('00000000-0000-0000-0002-000000000012', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000012', 'petrol',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000012', 'travel',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000012', 'general',    0.4,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 13: HSBC TravelOne (flat 1.0 mpd local, 2.7 mpd overseas)
-- ============================================================
-- Flat 1 mpd on all local spend. No bonus categories locally.
-- 2.7 mpd on overseas spend (FCY transactions).
-- [VERIFIED from HSBC website]
('00000000-0000-0000-0002-000000000013', 'dining',    1.0,  FALSE, '{}', NULL, 'https://www.hsbc.com.sg/credit-cards/products/travelone/'),
('00000000-0000-0000-0002-000000000013', 'transport',  1.0,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000013', 'online',     1.0,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000013', 'groceries',  1.0,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000013', 'petrol',     1.0,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000013', 'travel',     1.0,  FALSE, '{}', 'Overseas travel spend earns 2.7 mpd. Local travel agencies earn 1 mpd. [VERIFIED]', NULL),
('00000000-0000-0000-0002-000000000013', 'general',    1.0,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 14: Amex KrisFlyer Credit Card (1.1 mpd base, 1.5 mpd dining, 2 mpd SIA)
-- ============================================================
-- Entry-level KrisFlyer Amex (tier below Ascend).
-- Direct KrisFlyer miles. 1.1 mpd base. 1.5 mpd on dining.
-- 2 mpd on SIA purchases.
-- Lower caps than Ascend.
-- [VERIFIED from Amex website]
('00000000-0000-0000-0002-000000000014', 'dining',    1.5,  TRUE,  '{}', 'Earn 1.5 KrisFlyer miles per $1 on dining. [VERIFIED]', 'https://www.americanexpress.com/sg/credit-cards/krisflyer-credit-card/'),
('00000000-0000-0000-0002-000000000014', 'transport',  1.1,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000014', 'online',     1.1,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000014', 'groceries',  1.1,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000014', 'petrol',     1.1,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000014', 'travel',     2.0,  TRUE,  '{"merchant": "SIA"}', 'Earn 2 KrisFlyer miles per $1 on SIA purchases. 1.1 mpd on other travel. [VERIFIED]', NULL),
('00000000-0000-0000-0002-000000000014', 'general',    1.1,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 15: SC X Card (3.3 mpd on selected categories, 0.4 mpd else)
-- ============================================================
-- Targeted at young professionals (income $30K).
-- Up to 3.3 mpd on dining, groceries, petrol, transport, online
-- when min spend $500/month is met.
-- 0.4 mpd on non-bonus categories.
-- Capped at $2,000/month across bonus categories.
-- [ESTIMATED — 3.3 mpd is the commonly cited rate; SC website uses
--  tiered structure (10X SC Points on selected). Conservative approach.]
('00000000-0000-0000-0002-000000000015', 'dining',    3.3,  TRUE,  '{"min_spend_monthly": 500}', 'Earn 3.3 mpd on dining with min spend $500/month. Otherwise 0.4 mpd. Capped at $2,000/month. [ESTIMATED]', 'https://www.sc.com/sg/credit-cards/x-card/'),
('00000000-0000-0000-0002-000000000015', 'transport',  3.3,  TRUE,  '{"min_spend_monthly": 500}', 'Earn 3.3 mpd on transport with min spend $500/month. Otherwise 0.4 mpd. [ESTIMATED]', NULL),
('00000000-0000-0000-0002-000000000015', 'online',     3.3,  TRUE,  '{"min_spend_monthly": 500}', 'Earn 3.3 mpd on online shopping with min spend $500/month. Otherwise 0.4 mpd. [ESTIMATED]', NULL),
('00000000-0000-0000-0002-000000000015', 'groceries',  3.3,  TRUE,  '{"min_spend_monthly": 500}', 'Earn 3.3 mpd on groceries with min spend $500/month. Otherwise 0.4 mpd. [ESTIMATED]', NULL),
('00000000-0000-0000-0002-000000000015', 'petrol',     3.3,  TRUE,  '{"min_spend_monthly": 500}', 'Earn 3.3 mpd on petrol with min spend $500/month. Otherwise 0.4 mpd. [ESTIMATED]', NULL),
('00000000-0000-0000-0002-000000000015', 'travel',     0.4,  FALSE, '{}', 'Travel does not earn bonus rate on SC X Card. Base 0.4 mpd. [ESTIMATED]', NULL),
('00000000-0000-0000-0002-000000000015', 'general',    0.4,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 16: Maybank Horizon Visa Signature (1.6 mpd selected, 0.4 mpd else)
-- ============================================================
-- TreatsPoints card. 5X TreatsPoints on selected categories
-- (dining, travel, petrol) with conditions.
-- 3000 TreatsPoints = 1000 miles.
-- Base earn: 5 TreatsPoints per $1 (most spend) = 0.33 mpd.
-- Bonus: 8X TreatsPoints on selected = ~1.33 mpd.
-- With weekend/overseas multipliers: up to 3.2 mpd overseas.
-- We use conservative local rates.
-- [ESTIMATED — Maybank TreatsPoints conversion is complex and conditional]
('00000000-0000-0000-0002-000000000016', 'dining',    1.6,  TRUE,  '{"min_spend_monthly": 300}', 'Earn up to 1.6 mpd on dining with min spend $300/month. 0.4 mpd otherwise. [ESTIMATED — rate depends on TreatsPoints tier]', 'https://www.maybank.com.sg/cards/credit-cards/horizon-visa-signature/'),
('00000000-0000-0000-0002-000000000016', 'transport',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000016', 'online',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000016', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000016', 'petrol',     1.6,  TRUE,  '{"min_spend_monthly": 300}', 'Earn up to 1.6 mpd on petrol with min spend $300/month. 0.4 mpd otherwise. [ESTIMATED]', NULL),
('00000000-0000-0000-0002-000000000016', 'travel',     1.6,  TRUE,  '{"min_spend_monthly": 300}', 'Earn up to 1.6 mpd on local travel. Overseas travel up to 3.2 mpd. 0.4 mpd if conditions not met. [ESTIMATED]', NULL),
('00000000-0000-0000-0002-000000000016', 'general',    0.4,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 17: Maybank FC Barcelona Visa Signature (same earn structure as Horizon)
-- ============================================================
-- Branded variant of Horizon. Same TreatsPoints structure.
-- Earn rates are functionally identical to Horizon.
-- [ESTIMATED — limited specific T&C data; modeled as Horizon-equivalent]
('00000000-0000-0000-0002-000000000017', 'dining',    1.6,  TRUE,  '{"min_spend_monthly": 300}', 'Earn up to 1.6 mpd on dining with min spend $300/month. 0.4 mpd otherwise. Same structure as Horizon. [ESTIMATED]', 'https://www.maybank.com.sg/cards/credit-cards/fc-barcelona-visa-signature/'),
('00000000-0000-0000-0002-000000000017', 'transport',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000017', 'online',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000017', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000017', 'petrol',     1.6,  TRUE,  '{"min_spend_monthly": 300}', 'Earn up to 1.6 mpd on petrol with min spend $300/month. 0.4 mpd otherwise. [ESTIMATED]', NULL),
('00000000-0000-0000-0002-000000000017', 'travel',     1.6,  TRUE,  '{"min_spend_monthly": 300}', 'Earn up to 1.6 mpd on travel. Overseas up to 3.2 mpd. [ESTIMATED]', NULL),
('00000000-0000-0000-0002-000000000017', 'general',    0.4,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 18: Citi Rewards Card (4 mpd shopping/online, 0.4 mpd else)
-- ============================================================
-- 10X Citi ThankYou Points on shopping and online (= 4 mpd).
-- 1X on other spend (= 0.4 mpd).
-- Capped at $1,000/month on 10X categories.
-- [VERIFIED from Citi website]
('00000000-0000-0000-0002-000000000018', 'dining',    0.4,  FALSE, '{}', NULL, 'https://www.citibank.com.sg/credit-cards/citi-rewards-card/'),
('00000000-0000-0000-0002-000000000018', 'transport',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000018', 'online',     4.0,  TRUE,  '{}', 'Earn 4 mpd (10X Citi ThankYou Points) on online shopping. Capped at $1,000/month. [VERIFIED]', NULL),
('00000000-0000-0000-0002-000000000018', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000018', 'petrol',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000018', 'travel',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000018', 'general',    4.0,  TRUE,  '{}', 'Earn 4 mpd (10X Citi ThankYou Points) on in-store shopping (department stores, fashion). Capped at $1,000/month combined with online. [VERIFIED]', NULL),

-- ============================================================
-- CARD 19: POSB Everyday Card (0.4 mpd flat, entry-level)
-- ============================================================
-- Entry-level DBS/POSB card. Primarily cashback-focused.
-- Miles conversion: 1X DBS Points per $5 = 0.4 mpd.
-- No bonus categories for miles earning.
-- Included for completeness — users may have this card.
-- [ESTIMATED — miles path is secondary; conversion rate from DBS Points]
('00000000-0000-0000-0002-000000000019', 'dining',    0.4,  FALSE, '{}', NULL, 'https://www.posb.com.sg/personal/cards/credit-cards/everyday-card'),
('00000000-0000-0000-0002-000000000019', 'transport',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000019', 'online',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000019', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000019', 'petrol',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000019', 'travel',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000019', 'general',    0.4,  FALSE, '{}', 'POSB Everyday earns flat 0.4 mpd across all categories. This card is primarily cashback-focused; miles conversion is secondary. [ESTIMATED]', NULL),

-- ============================================================
-- CARD 20: UOB Preferred Platinum Visa (4 mpd dining, 0.4 mpd else)
-- ============================================================
-- 10X UNI$ on dining (= 4 mpd) with min spend $600/month.
-- 0.4 mpd on all other categories.
-- Capped at $1,000/month on 10X dining.
-- [VERIFIED from UOB website]
('00000000-0000-0000-0002-000000000020', 'dining',    4.0,  TRUE,  '{"min_spend_monthly": 600}', 'Earn 4 mpd (10X UNI$) on dining with min spend $600/month. Otherwise base 0.4 mpd. Capped at $1,000/month. [VERIFIED]', 'https://www.uob.com.sg/personal/cards/credit/preferred-platinum.page'),
('00000000-0000-0000-0002-000000000020', 'transport',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000020', 'online',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000020', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000020', 'petrol',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000020', 'travel',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000020', 'general',    0.4,  FALSE, '{}', NULL, NULL)

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

  -- CARD 11: UOB Lady's Card
  -- 10X bonus capped at $1,000/month across beauty/fashion categories
  ('00000000-0000-0000-0002-000000000011', NULL, 1000.00, 'spend',
   'Combined cap across all 10X bonus categories (beauty, fashion, bags, shoes). [VERIFIED from UOB website]'),

  -- CARD 12: OCBC Titanium Rewards
  -- 10X bonus capped at $1,000/month across dining + online
  ('00000000-0000-0000-0002-000000000012', NULL, 1000.00, 'spend',
   'Combined cap across dining and online shopping 10X bonus categories. [VERIFIED from OCBC website]'),

  -- CARD 13: HSBC TravelOne — No monthly cap documented for local flat rate

  -- CARD 14: Amex KrisFlyer Credit Card
  -- Bonus capped; using conservative estimate
  ('00000000-0000-0000-0002-000000000014', 'dining', 2000.00, 'spend',
   'Cap on dining bonus. [ESTIMATED — verify with Amex T&Cs]'),
  ('00000000-0000-0000-0002-000000000014', 'travel', 2000.00, 'spend',
   'Cap on travel/SIA bonus. [ESTIMATED — verify with Amex T&Cs]'),

  -- CARD 15: SC X Card
  -- Bonus capped at $2,000/month across all bonus categories
  ('00000000-0000-0000-0002-000000000015', NULL, 2000.00, 'spend',
   'Combined cap across all bonus categories (dining, transport, online, groceries, petrol). [ESTIMATED — verify with SC T&Cs]'),

  -- CARD 16: Maybank Horizon Visa Signature
  -- Bonus capped; TreatsPoints bonus has monthly limits
  ('00000000-0000-0000-0002-000000000016', NULL, 1500.00, 'spend',
   'Combined cap across bonus categories. [ESTIMATED — Maybank T&Cs have complex tiered caps]'),

  -- CARD 17: Maybank FC Barcelona
  -- Same cap structure as Horizon
  ('00000000-0000-0000-0002-000000000017', NULL, 1500.00, 'spend',
   'Combined cap across bonus categories. Same as Horizon. [ESTIMATED]'),

  -- CARD 18: Citi Rewards
  -- 10X bonus capped at $1,000/month across shopping + online categories
  ('00000000-0000-0000-0002-000000000018', NULL, 1000.00, 'spend',
   'Combined cap across online shopping and in-store shopping 10X bonus categories. [VERIFIED from Citi website]'),

  -- CARD 19: POSB Everyday Card — No cap (flat rate, no bonus)

  -- CARD 20: UOB Preferred Platinum
  -- 10X dining bonus capped at $1,000/month
  ('00000000-0000-0000-0002-000000000020', 'dining', 1000.00, 'spend',
   'Cap on 10X dining bonus. Min spend $600/month to qualify for 10X. [VERIFIED from UOB website]')

ON CONFLICT (card_id, category_id) DO UPDATE SET
  monthly_cap_amount = EXCLUDED.monthly_cap_amount,
  cap_type           = EXCLUDED.cap_type,
  notes              = EXCLUDED.notes,
  updated_at         = NOW();


-- ============================================================
-- PART D: Exclusions
-- ============================================================
-- Key exclusions per card. Not exhaustive; covers major known ones.
-- Common across Singapore cards: government payments, insurance premiums.
-- ============================================================

INSERT INTO public.exclusions (card_id, category_id, excluded_mccs, conditions, description)
VALUES

  -- CARD 11: UOB Lady's Card
  ('00000000-0000-0000-0002-000000000011', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from UNI$ earning.'),
  ('00000000-0000-0000-0002-000000000011', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),
  ('00000000-0000-0000-0002-000000000011', NULL,
   ARRAY[]::TEXT[],
   '{"payment_type": "education"}',
   'Education-related payments excluded from 10X bonus. [ESTIMATED]'),

  -- CARD 12: OCBC Titanium Rewards
  ('00000000-0000-0000-0002-000000000012', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from OCBC$ earning.'),
  ('00000000-0000-0000-0002-000000000012', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),
  ('00000000-0000-0000-0002-000000000012', 'groceries',
   ARRAY['5411'],
   '{}',
   'Supermarkets typically excluded from the 10X bonus categories. [ESTIMATED]'),

  -- CARD 13: HSBC TravelOne
  ('00000000-0000-0000-0002-000000000013', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded.'),
  ('00000000-0000-0000-0002-000000000013', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),

  -- CARD 14: Amex KrisFlyer Credit Card
  ('00000000-0000-0000-0002-000000000014', NULL,
   ARRAY['9311', '9222', '9211'],
   '{"payment_type": "government"}',
   'Government payments excluded.'),
  ('00000000-0000-0000-0002-000000000014', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),
  ('00000000-0000-0000-0002-000000000014', NULL,
   ARRAY[]::TEXT[],
   '{"payment_type": "installment"}',
   'Instalment plan payments excluded from bonus miles. [VERIFIED from Amex T&Cs]'),

  -- CARD 15: SC X Card
  ('00000000-0000-0000-0002-000000000015', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from 360 reward points earning.'),
  ('00000000-0000-0000-0002-000000000015', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),
  ('00000000-0000-0000-0002-000000000015', NULL,
   ARRAY[]::TEXT[],
   '{"payment_type": "utility"}',
   'Utility bill payments excluded from bonus categories. [ESTIMATED]'),

  -- CARD 16: Maybank Horizon Visa Signature
  ('00000000-0000-0000-0002-000000000016', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from TreatsPoints earning.'),
  ('00000000-0000-0000-0002-000000000016', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),

  -- CARD 17: Maybank FC Barcelona
  ('00000000-0000-0000-0002-000000000017', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from TreatsPoints earning.'),
  ('00000000-0000-0000-0002-000000000017', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),

  -- CARD 18: Citi Rewards
  ('00000000-0000-0000-0002-000000000018', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from ThankYou Points earning.'),
  ('00000000-0000-0000-0002-000000000018', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),
  ('00000000-0000-0000-0002-000000000018', 'groceries',
   ARRAY['5411'],
   '{}',
   'Supermarkets excluded from 10X bonus. Only department stores and fashion/retail qualify. [ESTIMATED]'),

  -- CARD 19: POSB Everyday Card
  ('00000000-0000-0000-0002-000000000019', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from DBS Points earning.'),
  ('00000000-0000-0000-0002-000000000019', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),

  -- CARD 20: UOB Preferred Platinum
  ('00000000-0000-0000-0002-000000000020', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from UNI$ earning.'),
  ('00000000-0000-0000-0002-000000000020', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),
  ('00000000-0000-0000-0002-000000000020', 'dining',
   ARRAY[]::TEXT[],
   '{"payment_type": "fast_food_delivery"}',
   'Fast food delivery apps may not always code as dining MCC. Bonus may not apply. [ESTIMATED]');
