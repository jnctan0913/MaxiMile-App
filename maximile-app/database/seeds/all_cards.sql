-- =============================================================================
-- MaxiMile — Consolidated Card Rules Seed Data (all_cards.sql)
-- =============================================================================
--
-- SINGLE SOURCE OF TRUTH for all card data.
--
-- Card count:    20 cards (batch 1: cards 1-10, batch 2: cards 11-20)
-- Last updated:  2026-02-19
-- Version:       1.0.0
-- Author:        Data Engineer Agent
--
-- Description:
--   Combined seed file for all 20 Singapore miles credit cards.
--   Includes categories, card metadata, earn rules, caps, and exclusions.
--   All statements use ON CONFLICT for idempotent re-runs.
--
-- Dependency order:
--   1. categories (referenced by earn_rules, caps, exclusions)
--   2. cards (referenced by earn_rules, caps, exclusions)
--   3. earn_rules (depends on cards + categories)
--   4. caps (depends on cards + categories)
--   5. exclusions (depends on cards + categories)
--
-- Data accuracy:
--   - Rates marked with "-- [VERIFIED]" are from official bank T&Cs
--   - Rates marked with "-- [ESTIMATED]" are conservative estimates
--   - All earn_rate_mpd values represent TOTAL miles per dollar (not incremental)
--   - Banks may change rates; periodic re-validation required
--   - v1 assumption: all conditions are assumed to be met (per PRD)
--
-- Sources:
--   - Bank official websites (DBS, Citi, UOB, OCBC, HSBC, Amex, BOC, SC, Maybank)
--   - MileLion (milelion.com) — cross-reference
--   - SingSaver (singsaver.com.sg) — cross-reference
--   - Suitesmile (suitesmile.com) — cross-reference
--
-- =============================================================================

BEGIN;

-- ============================================================
-- SECTION 1: CATEGORIES (8 fixed spend categories)
-- ============================================================
-- Must be seeded FIRST as earn_rules, caps, and exclusions reference category IDs.

INSERT INTO public.categories (id, name, display_order, icon, mccs, description)
VALUES

-- 1. Dining
(
  'dining',
  'Dining',
  1,
  'utensils',
  ARRAY[
    '5811',  -- Caterers
    '5812',  -- Eating Places, Restaurants
    '5813',  -- Drinking Places (Bars, Taverns, Nightclubs)
    '5814'   -- Fast Food Restaurants
  ],
  'Restaurants, cafes, bars, fast food, food delivery apps (when coded as dining)'
),

-- 2. Transport
(
  'transport',
  'Transport',
  2,
  'car',
  ARRAY[
    '4121',  -- Taxicabs / Limousines (Grab, Gojek, ComfortDelGro)
    '4131',  -- Bus Lines
    '4111',  -- Local / Suburban Commuter Passenger Transportation (MRT/LRT)
    '4112',  -- Passenger Railways (KTM, etc.)
    '4789',  -- Transportation Services (not elsewhere classified)
    '7512',  -- Automobile Rental (car rental / car sharing)
    '7523'   -- Parking Lots, Garages
  ],
  'Taxis, ride-hailing (Grab/Gojek), public transport, car rentals, parking'
),

-- 3. Online Shopping
(
  'online',
  'Online Shopping',
  3,
  'globe',
  ARRAY[
    '5262',  -- Marketplaces (online retail - general)
    '5310',  -- Discount Stores (Shopee, Lazada when coded here)
    '5311',  -- Department Stores
    '5399',  -- General Merchandise (not elsewhere classified)
    '5944',  -- Jewelry Stores (online)
    '5945',  -- Hobby, Toy, and Game Shops
    '5946',  -- Camera and Photographic Supply Stores
    '5947',  -- Gift, Card, Novelty Shops
    '5964',  -- Direct Marketing — Catalog Merchant
    '5965',  -- Direct Marketing — Combination Catalog and Retail
    '5966',  -- Direct Marketing — Outbound Telemarketing
    '5967',  -- Direct Marketing — Inbound Teleservices
    '5968',  -- Direct Marketing — Continuity / Subscription
    '5969',  -- Direct Marketing — Not Elsewhere Classified
    '7372',  -- Computer Programming, Data Processing (SaaS/digital)
    '5818',  -- Digital Goods (large digital goods merchants)
    '5816',  -- Digital Goods — Games
    '5817'   -- Digital Goods — Applications (excl games)
  ],
  'E-commerce (Shopee, Lazada, Amazon), online subscriptions, digital goods'
),

-- 4. Groceries
(
  'groceries',
  'Groceries',
  4,
  'shopping-cart',
  ARRAY[
    '5411',  -- Grocery Stores, Supermarkets (FairPrice, Cold Storage, Sheng Siong)
    '5422',  -- Freezer and Locker Meat Provisioners
    '5441',  -- Candy, Nut, Confectionery Stores
    '5451',  -- Dairy Products Stores
    '5462',  -- Bakeries
    '5499'   -- Miscellaneous Food Stores (specialty, convenience)
  ],
  'Supermarkets (FairPrice, Cold Storage, Sheng Siong), bakeries, specialty food stores'
),

-- 5. Petrol
(
  'petrol',
  'Petrol',
  5,
  'fuel',
  ARRAY[
    '5541',  -- Service Stations (with or without ancillary services)
    '5542',  -- Automated Fuel Dispensers (self-service petrol stations)
    '5983'   -- Fuel Dealers (non-automotive — heating oil, LPG)
  ],
  'Petrol stations (Shell, Esso, Caltex, SPC), fuel dispensers'
),

-- 6. Bills
(
  'bills',
  'Bills',
  6,
  'receipt',
  ARRAY[
    '4812',  -- Telecommunication Equipment and Telephone Sales
    '4814',  -- Telecommunication Services
    '4899',  -- Cable, Satellite, Pay Television, Radio Services
    '4900',  -- Utilities — Electric, Gas, Water, Sanitary
    '6300',  -- Insurance Sales, Underwriting
    '6381',  -- Insurance Premiums
    '6399',  -- Insurance — Not Elsewhere Classified
    '4816'   -- Computer Network/Information Services (internet providers)
  ],
  'Utilities, insurance, telco, recurring payments'
),

-- 7. Travel / Hotels
(
  'travel',
  'Travel',
  7,
  'plane',
  ARRAY[
    -- Airlines (MCC 3000-3299 range — major airlines)
    '3000', '3001', '3002', '3003', '3004', '3005', '3006', '3007', '3008', '3009',
    '3010', '3011', '3012', '3013', '3014', '3015', '3016', '3017', '3018', '3019',
    '3020', '3021', '3022', '3023', '3024', '3025', '3026', '3027', '3028', '3029',
    '3030', '3031', '3032', '3033', '3034', '3035', '3036', '3037', '3038', '3039',
    '3040', '3041', '3042', '3043', '3044', '3045', '3046', '3047', '3048', '3049',
    '3050', '3051', '3052', '3053', '3054', '3055', '3056', '3057', '3058', '3059',
    '3060', '3061', '3062', '3063', '3064', '3065', '3066', '3067', '3068', '3069',
    '3070', '3071', '3072', '3073', '3074', '3075', '3076', '3077', '3078', '3079',
    '3080', '3081', '3082', '3083', '3084', '3085', '3086', '3087', '3088', '3089',
    '3090', '3091', '3092', '3093', '3094', '3095', '3096', '3097', '3098', '3099',
    '3100', '3101', '3102', '3103', '3104', '3105', '3106', '3107', '3108', '3109',
    '3110', '3111', '3112', '3113', '3114', '3115', '3116', '3117', '3118', '3119',
    '3120', '3121', '3122', '3123', '3124', '3125', '3126', '3127', '3128', '3129',
    '3130', '3131', '3132', '3133', '3134', '3135', '3136', '3137', '3138', '3139',
    '3140', '3141', '3142', '3143', '3144', '3145', '3146', '3147', '3148', '3149',
    '3150', '3151', '3152', '3153', '3154', '3155', '3156', '3157', '3158', '3159',
    '3160', '3161', '3162', '3163', '3164', '3165', '3166', '3167', '3168', '3169',
    '3170', '3171', '3172', '3173', '3174', '3175', '3176', '3177', '3178', '3179',
    '3180', '3181', '3182', '3183', '3184', '3185', '3186', '3187', '3188', '3189',
    '3190', '3191', '3192', '3193', '3194', '3195', '3196', '3197', '3198', '3199',
    '3200', '3201', '3202', '3203', '3204', '3205', '3206', '3207', '3208', '3209',
    '3210', '3211', '3212', '3213', '3214', '3215', '3216', '3217', '3218', '3219',
    '3220', '3221', '3222', '3223', '3224', '3225', '3226', '3227', '3228', '3229',
    '3230', '3231', '3232', '3233', '3234', '3235', '3236', '3237', '3238', '3239',
    '3240', '3241', '3242', '3243', '3244', '3245', '3246', '3247', '3248', '3249',
    '3250', '3251', '3252', '3253', '3254', '3255', '3256', '3257', '3258', '3259',
    '3260', '3261', '3262', '3263', '3264', '3265', '3266', '3267', '3268', '3269',
    '3270', '3271', '3272', '3273', '3274', '3275', '3276', '3277', '3278', '3279',
    '3280', '3281', '3282', '3283', '3284', '3285', '3286', '3287', '3288', '3289',
    '3290', '3291', '3292', '3293', '3294', '3295', '3296', '3297', '3298', '3299',
    -- Hotel / Lodging
    '3501', '3502', '3503', '3504', '3505',  -- Major hotel chains (Hilton, Marriott, etc.)
    '7011',  -- Lodging — Hotels, Motels, Resorts
    -- Travel Agencies & Tour Operators
    '4411',  -- Steamship / Cruise Lines
    '4511',  -- Airlines, Air Carriers (direct airline purchases)
    '4722',  -- Travel Agencies / Tour Operators
    '7991',  -- Tourist Attractions and Exhibits
    '7011'   -- Hotels and Motels (duplicate-safe)
  ],
  'Flights, hotels, cruises, travel agencies, tour bookings'
),

-- 8. General / Others (catch-all)
(
  'general',
  'General',
  8,
  'circle',
  ARRAY[]::TEXT[],  -- Empty array = catch-all for all MCCs not in other categories
  'All other spending not classified in the above categories'
)

ON CONFLICT (id) DO UPDATE SET
  name          = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  icon          = EXCLUDED.icon,
  mccs          = EXCLUDED.mccs,
  description   = EXCLUDED.description,
  updated_at    = NOW();


-- ============================================================
-- SECTION 2: CARD METADATA (all 20 cards)
-- ============================================================

INSERT INTO public.cards (id, bank, name, slug, network, annual_fee, base_rate_mpd, image_url, is_active, notes)
VALUES

  -- =============================================
  -- BATCH 1: Cards 1-10
  -- =============================================

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

  -- 4. OCBC 90N Visa
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
  ),

  -- =============================================
  -- BATCH 2: Cards 11-20
  -- =============================================

  -- 11. UOB Lady''s Card
  (
    '00000000-0000-0000-0002-000000000011',
    'UOB',
    'UOB Lady''s Card',
    'uob-ladys-card',
    'visa',
    0,       -- No annual fee (first year waived, subsequent often waivable)
    0.4,     -- 0.4 mpd base
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
    0.4,     -- 0.4 mpd base
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
    0.4,     -- 0.4 mpd base
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
    0.4,     -- 0.4 mpd base
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
    0.4,     -- 0.4 mpd base
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
    0.4,     -- 0.4 mpd base
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
-- SECTION 3: EARN RULES (8 categories x 20 cards = 160 rows)
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

-- =============================================
-- BATCH 1: Cards 1-10
-- =============================================

-- ============================================================
-- CARD 1: DBS Altitude Visa (base 1.2 mpd local, 2 mpd overseas)
-- ============================================================
-- [VERIFIED from DBS website]
('00000000-0000-0000-0001-000000000001', 'dining',    1.2,  FALSE, '{}', NULL, 'https://www.dbs.com.sg/personal/cards/credit-cards/altitude-visa-signature-card'),
('00000000-0000-0000-0001-000000000001', 'transport',  1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000001', 'online',     1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000001', 'groceries',  1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000001', 'petrol',     1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000001', 'bills',      1.2,  FALSE, '{}', 'Base rate on bills/utilities.', NULL),
('00000000-0000-0000-0001-000000000001', 'travel',     4.0,  TRUE,  '{"online_travel_portal": true}', 'Up to 10X DBS Points (4 mpd) for online travel bookings. Standard 1.2 mpd at travel agencies.', 'https://www.dbs.com.sg/personal/cards/credit-cards/altitude-visa-signature-card'),
('00000000-0000-0000-0001-000000000001', 'general',    1.2,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 2: Citi PremierMiles Visa (1.2 mpd local, 2 mpd overseas)
-- ============================================================
-- [VERIFIED from Citi website]
('00000000-0000-0000-0001-000000000002', 'dining',    1.2,  FALSE, '{}', NULL, 'https://www.citibank.com.sg/credit-cards/premiermiles-visa-signature/'),
('00000000-0000-0000-0001-000000000002', 'transport',  1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000002', 'online',     1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000002', 'groceries',  1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000002', 'petrol',     1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000002', 'bills',      1.2,  FALSE, '{}', 'Base rate on bills/utilities.', NULL),
('00000000-0000-0000-0001-000000000002', 'travel',     1.2,  FALSE, '{}', 'Overseas travel spend earns 2 mpd. Local travel agencies earn 1.2 mpd.', NULL),
('00000000-0000-0000-0001-000000000002', 'general',    1.2,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 3: UOB PRVI Miles Visa (1.4 mpd local, 2.4 mpd overseas)
-- ============================================================
-- [VERIFIED from UOB website]
('00000000-0000-0000-0001-000000000003', 'dining',    1.4,  FALSE, '{}', NULL, 'https://www.uob.com.sg/personal/cards/credit/prvi-miles-visa.page'),
('00000000-0000-0000-0001-000000000003', 'transport',  1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000003', 'online',     1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000003', 'groceries',  1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000003', 'petrol',     1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000003', 'bills',      1.4,  FALSE, '{}', 'Base rate on bills/utilities.', NULL),
('00000000-0000-0000-0001-000000000003', 'travel',     1.4,  FALSE, '{}', 'Overseas travel spend earns 2.4 mpd.', NULL),
('00000000-0000-0000-0001-000000000003', 'general',    1.4,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 4: OCBC 90N Visa (1.2 mpd local, 2.1 mpd overseas)
-- ============================================================
-- [VERIFIED from OCBC website]
('00000000-0000-0000-0001-000000000004', 'dining',    1.2,  FALSE, '{}', NULL, 'https://www.ocbc.com/personal-banking/cards/90n-card'),
('00000000-0000-0000-0001-000000000004', 'transport',  1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000004', 'online',     1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000004', 'groceries',  1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000004', 'petrol',     1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000004', 'bills',      1.2,  FALSE, '{}', 'Base rate on bills/utilities.', NULL),
('00000000-0000-0000-0001-000000000004', 'travel',     1.2,  FALSE, '{}', 'Overseas travel spend earns 2.1 mpd.', NULL),
('00000000-0000-0000-0001-000000000004', 'general',    1.2,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 5: KrisFlyer UOB Credit Card (1.2 mpd base, up to 3 mpd bonus)
-- ============================================================
-- [VERIFIED from UOB website]
('00000000-0000-0000-0001-000000000005', 'dining',    2.0,  TRUE,  '{"contactless": true}', 'Earn 2 mpd on contactless dining transactions. Standard 1.2 mpd for non-contactless.', 'https://www.uob.com.sg/personal/cards/credit/krisflyer-uob-credit-card.page'),
('00000000-0000-0000-0001-000000000005', 'transport',  2.0,  TRUE,  '{"contactless": true}', 'Earn 2 mpd on contactless transport (Grab, taxis). Standard 1.2 mpd otherwise.', NULL),
('00000000-0000-0000-0001-000000000005', 'online',     2.0,  TRUE,  '{}', 'Earn 2 mpd on online spend.', NULL),
('00000000-0000-0000-0001-000000000005', 'groceries',  1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000005', 'petrol',     1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000005', 'bills',      1.2,  FALSE, '{}', 'Base rate on bills/utilities.', NULL),
('00000000-0000-0000-0001-000000000005', 'travel',     3.0,  TRUE,  '{"merchant": "SIA"}', 'Earn 3 mpd on SIA purchases (flights, SIA website). 1.2 mpd on other travel.', NULL),
('00000000-0000-0000-0001-000000000005', 'general',    1.2,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 6: HSBC Revolution (4 mpd on dining/entertainment/online, 0.4 mpd else)
-- ============================================================
-- [VERIFIED from HSBC website]
('00000000-0000-0000-0001-000000000006', 'dining',    4.0,  TRUE,  '{}', 'Earn 4 mpd on dining (10X HSBC rewards). Capped at $1,000/month across bonus categories.', 'https://www.hsbc.com.sg/credit-cards/products/revolution/'),
('00000000-0000-0000-0001-000000000006', 'transport',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000006', 'online',     4.0,  TRUE,  '{}', 'Earn 4 mpd on online spend (10X HSBC rewards). Capped at $1,000/month across bonus categories.', NULL),
('00000000-0000-0000-0001-000000000006', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000006', 'petrol',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000006', 'bills',      0.4,  FALSE, '{}', 'Base rate on bills/utilities.', NULL),
('00000000-0000-0000-0001-000000000006', 'travel',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000006', 'general',    0.4,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 7: Amex KrisFlyer Ascend (1.1 mpd base, 2 mpd dining/travel, 3 mpd SIA)
-- ============================================================
-- [VERIFIED from Amex website]
('00000000-0000-0000-0001-000000000007', 'dining',    2.0,  TRUE,  '{}', 'Earn 2 KrisFlyer miles per $1 on dining. Capped at $2,500/month.', 'https://www.americanexpress.com/sg/credit-cards/krisflyer-ascend-card/'),
('00000000-0000-0000-0001-000000000007', 'transport',  1.1,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000007', 'online',     1.1,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000007', 'groceries',  2.0,  TRUE,  '{}', 'Earn 2 KrisFlyer miles per $1 at supermarkets. Capped at $2,500/month.', NULL),
('00000000-0000-0000-0001-000000000007', 'petrol',     1.1,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000007', 'bills',      1.1,  FALSE, '{}', 'Base rate on bills/utilities.', NULL),
('00000000-0000-0000-0001-000000000007', 'travel',     2.0,  TRUE,  '{}', 'Earn 2 KrisFlyer miles per $1 on travel. 3 mpd on SIA purchases. Capped at $2,500/month.', NULL),
('00000000-0000-0000-0001-000000000007', 'general',    1.1,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 8: BOC Elite Miles World Mastercard (flat 1.5 mpd)
-- ============================================================
-- [ESTIMATED — rate derived from 3X BOC points structure]
('00000000-0000-0000-0001-000000000008', 'dining',    1.5,  FALSE, '{}', NULL, 'https://www.bankofchina.com/sg/pbservice/pb1/201803/t20180329_11814364.html'),
('00000000-0000-0000-0001-000000000008', 'transport',  1.5,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000008', 'online',     1.5,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000008', 'groceries',  1.5,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000008', 'petrol',     1.5,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000008', 'bills',      1.5,  FALSE, '{}', 'Base rate on bills/utilities.', NULL),
('00000000-0000-0000-0001-000000000008', 'travel',     1.5,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000008', 'general',    1.5,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 9: SC Visa Infinite (1.4 mpd local, 3 mpd overseas)
-- ============================================================
-- [VERIFIED from SC website]
('00000000-0000-0000-0001-000000000009', 'dining',    1.4,  FALSE, '{}', NULL, 'https://www.sc.com/sg/credit-cards/visa-infinite/'),
('00000000-0000-0000-0001-000000000009', 'transport',  1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000009', 'online',     1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000009', 'groceries',  1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000009', 'petrol',     1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000009', 'bills',      1.4,  FALSE, '{}', 'Base rate on bills/utilities.', NULL),
('00000000-0000-0000-0001-000000000009', 'travel',     1.4,  FALSE, '{}', 'Overseas travel spend earns 3 mpd.', NULL),
('00000000-0000-0000-0001-000000000009', 'general',    1.4,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 10: DBS Woman's World Card (4 mpd online, 0.4 mpd else)
-- ============================================================
-- [VERIFIED from DBS website]
('00000000-0000-0000-0001-000000000010', 'dining',    0.4,  FALSE, '{}', NULL, 'https://www.dbs.com.sg/personal/cards/credit-cards/womans-card'),
('00000000-0000-0000-0001-000000000010', 'transport',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000010', 'online',     4.0,  TRUE,  '{}', 'Earn 4 mpd (10X DBS Points) on online spend. Capped at $2,000/month.', NULL),
('00000000-0000-0000-0001-000000000010', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000010', 'petrol',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000010', 'bills',      0.4,  FALSE, '{}', 'Base rate on bills/utilities.', NULL),
('00000000-0000-0000-0001-000000000010', 'travel',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000010', 'general',    0.4,  FALSE, '{}', NULL, NULL),

-- =============================================
-- BATCH 2: Cards 11-20
-- =============================================

-- ============================================================
-- CARD 11: UOB Lady's Card (4 mpd on beauty/fashion, 0.4 mpd else)
-- ============================================================
-- [VERIFIED from UOB website]
('00000000-0000-0000-0002-000000000011', 'dining',    0.4,  FALSE, '{}', NULL, 'https://www.uob.com.sg/personal/cards/credit/ladys-card.page'),
('00000000-0000-0000-0002-000000000011', 'transport',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000011', 'online',     4.0,  TRUE,  '{"category_restriction": "fashion_beauty_bags_shoes"}', 'Earn 4 mpd (10X UNI$) on online fashion, beauty, bags and shoes merchants. Other online merchants earn 0.4 mpd. [VERIFIED]', NULL),
('00000000-0000-0000-0002-000000000011', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000011', 'petrol',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000011', 'bills',      0.4,  FALSE, '{}', 'Base rate on bills/utilities.', NULL),
('00000000-0000-0000-0002-000000000011', 'travel',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000011', 'general',    4.0,  TRUE,  '{"category_restriction": "fashion_beauty_bags_shoes"}', 'Earn 4 mpd (10X UNI$) on in-store fashion, beauty, bags and shoes merchants. Other general merchants earn 0.4 mpd. [VERIFIED]', NULL),

-- ============================================================
-- CARD 12: OCBC Titanium Rewards (4 mpd dining/online, 0.4 mpd else)
-- ============================================================
-- [VERIFIED from OCBC website]
('00000000-0000-0000-0002-000000000012', 'dining',    4.0,  TRUE,  '{}', 'Earn 4 mpd (10X OCBC$) on dining. Capped at $1,000/month across bonus categories. [VERIFIED]', 'https://www.ocbc.com/personal-banking/cards/titanium-rewards-card'),
('00000000-0000-0000-0002-000000000012', 'transport',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000012', 'online',     4.0,  TRUE,  '{}', 'Earn 4 mpd (10X OCBC$) on online shopping. Capped at $1,000/month across bonus categories. [VERIFIED]', NULL),
('00000000-0000-0000-0002-000000000012', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000012', 'petrol',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000012', 'bills',      0.4,  FALSE, '{}', 'Base rate on bills/utilities.', NULL),
('00000000-0000-0000-0002-000000000012', 'travel',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000012', 'general',    0.4,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 13: HSBC TravelOne (flat 1.0 mpd local, 2.7 mpd overseas)
-- ============================================================
-- [VERIFIED from HSBC website]
('00000000-0000-0000-0002-000000000013', 'dining',    1.0,  FALSE, '{}', NULL, 'https://www.hsbc.com.sg/credit-cards/products/travelone/'),
('00000000-0000-0000-0002-000000000013', 'transport',  1.0,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000013', 'online',     1.0,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000013', 'groceries',  1.0,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000013', 'petrol',     1.0,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000013', 'bills',      1.0,  FALSE, '{}', 'Base rate on bills/utilities.', NULL),
('00000000-0000-0000-0002-000000000013', 'travel',     1.0,  FALSE, '{}', 'Overseas travel spend earns 2.7 mpd. Local travel agencies earn 1 mpd. [VERIFIED]', NULL),
('00000000-0000-0000-0002-000000000013', 'general',    1.0,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 14: Amex KrisFlyer Credit Card (1.1 mpd base, 1.5 mpd dining, 2 mpd SIA)
-- ============================================================
-- [VERIFIED from Amex website]
('00000000-0000-0000-0002-000000000014', 'dining',    1.5,  TRUE,  '{}', 'Earn 1.5 KrisFlyer miles per $1 on dining. [VERIFIED]', 'https://www.americanexpress.com/sg/credit-cards/krisflyer-credit-card/'),
('00000000-0000-0000-0002-000000000014', 'transport',  1.1,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000014', 'online',     1.1,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000014', 'groceries',  1.1,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000014', 'petrol',     1.1,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000014', 'bills',      1.1,  FALSE, '{}', 'Base rate on bills/utilities.', NULL),
('00000000-0000-0000-0002-000000000014', 'travel',     2.0,  TRUE,  '{"merchant": "SIA"}', 'Earn 2 KrisFlyer miles per $1 on SIA purchases. 1.1 mpd on other travel. [VERIFIED]', NULL),
('00000000-0000-0000-0002-000000000014', 'general',    1.1,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 15: SC X Card (3.3 mpd on selected categories, 0.4 mpd else)
-- ============================================================
-- [ESTIMATED — 3.3 mpd is the commonly cited rate]
('00000000-0000-0000-0002-000000000015', 'dining',    3.3,  TRUE,  '{"min_spend_monthly": 500}', 'Earn 3.3 mpd on dining with min spend $500/month. Otherwise 0.4 mpd. Capped at $2,000/month. [ESTIMATED]', 'https://www.sc.com/sg/credit-cards/x-card/'),
('00000000-0000-0000-0002-000000000015', 'transport',  3.3,  TRUE,  '{"min_spend_monthly": 500}', 'Earn 3.3 mpd on transport with min spend $500/month. Otherwise 0.4 mpd. [ESTIMATED]', NULL),
('00000000-0000-0000-0002-000000000015', 'online',     3.3,  TRUE,  '{"min_spend_monthly": 500}', 'Earn 3.3 mpd on online shopping with min spend $500/month. Otherwise 0.4 mpd. [ESTIMATED]', NULL),
('00000000-0000-0000-0002-000000000015', 'groceries',  3.3,  TRUE,  '{"min_spend_monthly": 500}', 'Earn 3.3 mpd on groceries with min spend $500/month. Otherwise 0.4 mpd. [ESTIMATED]', NULL),
('00000000-0000-0000-0002-000000000015', 'petrol',     3.3,  TRUE,  '{"min_spend_monthly": 500}', 'Earn 3.3 mpd on petrol with min spend $500/month. Otherwise 0.4 mpd. [ESTIMATED]', NULL),
('00000000-0000-0000-0002-000000000015', 'bills',      0.4,  FALSE, '{}', 'Base rate on bills/utilities.', NULL),
('00000000-0000-0000-0002-000000000015', 'travel',     0.4,  FALSE, '{}', 'Travel does not earn bonus rate on SC X Card. Base 0.4 mpd. [ESTIMATED]', NULL),
('00000000-0000-0000-0002-000000000015', 'general',    0.4,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 16: Maybank Horizon Visa Signature (1.6 mpd selected, 0.4 mpd else)
-- ============================================================
-- [ESTIMATED — Maybank TreatsPoints conversion is complex]
('00000000-0000-0000-0002-000000000016', 'dining',    1.6,  TRUE,  '{"min_spend_monthly": 300}', 'Earn up to 1.6 mpd on dining with min spend $300/month. 0.4 mpd otherwise. [ESTIMATED — rate depends on TreatsPoints tier]', 'https://www.maybank.com.sg/cards/credit-cards/horizon-visa-signature/'),
('00000000-0000-0000-0002-000000000016', 'transport',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000016', 'online',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000016', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000016', 'petrol',     1.6,  TRUE,  '{"min_spend_monthly": 300}', 'Earn up to 1.6 mpd on petrol with min spend $300/month. 0.4 mpd otherwise. [ESTIMATED]', NULL),
('00000000-0000-0000-0002-000000000016', 'bills',      0.4,  FALSE, '{}', 'Base rate on bills/utilities.', NULL),
('00000000-0000-0000-0002-000000000016', 'travel',     1.6,  TRUE,  '{"min_spend_monthly": 300}', 'Earn up to 1.6 mpd on local travel. Overseas travel up to 3.2 mpd. 0.4 mpd if conditions not met. [ESTIMATED]', NULL),
('00000000-0000-0000-0002-000000000016', 'general',    0.4,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 17: Maybank FC Barcelona Visa Signature (same earn structure as Horizon)
-- ============================================================
-- [ESTIMATED — modeled as Horizon-equivalent]
('00000000-0000-0000-0002-000000000017', 'dining',    1.6,  TRUE,  '{"min_spend_monthly": 300}', 'Earn up to 1.6 mpd on dining with min spend $300/month. 0.4 mpd otherwise. Same structure as Horizon. [ESTIMATED]', 'https://www.maybank.com.sg/cards/credit-cards/fc-barcelona-visa-signature/'),
('00000000-0000-0000-0002-000000000017', 'transport',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000017', 'online',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000017', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000017', 'petrol',     1.6,  TRUE,  '{"min_spend_monthly": 300}', 'Earn up to 1.6 mpd on petrol with min spend $300/month. 0.4 mpd otherwise. [ESTIMATED]', NULL),
('00000000-0000-0000-0002-000000000017', 'bills',      0.4,  FALSE, '{}', 'Base rate on bills/utilities.', NULL),
('00000000-0000-0000-0002-000000000017', 'travel',     1.6,  TRUE,  '{"min_spend_monthly": 300}', 'Earn up to 1.6 mpd on travel. Overseas up to 3.2 mpd. [ESTIMATED]', NULL),
('00000000-0000-0000-0002-000000000017', 'general',    0.4,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 18: Citi Rewards Card (4 mpd shopping/online, 0.4 mpd else)
-- ============================================================
-- [VERIFIED from Citi website]
('00000000-0000-0000-0002-000000000018', 'dining',    0.4,  FALSE, '{}', NULL, 'https://www.citibank.com.sg/credit-cards/citi-rewards-card/'),
('00000000-0000-0000-0002-000000000018', 'transport',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000018', 'online',     4.0,  TRUE,  '{}', 'Earn 4 mpd (10X Citi ThankYou Points) on online shopping. Capped at $1,000/month. [VERIFIED]', NULL),
('00000000-0000-0000-0002-000000000018', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000018', 'petrol',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000018', 'bills',      0.4,  FALSE, '{}', 'Base rate on bills/utilities.', NULL),
('00000000-0000-0000-0002-000000000018', 'travel',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000018', 'general',    4.0,  TRUE,  '{}', 'Earn 4 mpd (10X Citi ThankYou Points) on in-store shopping (department stores, fashion). Capped at $1,000/month combined with online. [VERIFIED]', NULL),

-- ============================================================
-- CARD 19: POSB Everyday Card (0.4 mpd flat, entry-level)
-- ============================================================
-- [ESTIMATED — miles path is secondary]
('00000000-0000-0000-0002-000000000019', 'dining',    0.4,  FALSE, '{}', NULL, 'https://www.posb.com.sg/personal/cards/credit-cards/everyday-card'),
('00000000-0000-0000-0002-000000000019', 'transport',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000019', 'online',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000019', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000019', 'petrol',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000019', 'bills',      0.4,  FALSE, '{}', 'Base rate on bills/utilities.', NULL),
('00000000-0000-0000-0002-000000000019', 'travel',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000019', 'general',    0.4,  FALSE, '{}', 'POSB Everyday earns flat 0.4 mpd across all categories. This card is primarily cashback-focused; miles conversion is secondary. [ESTIMATED]', NULL),

-- ============================================================
-- CARD 20: UOB Preferred Platinum Visa (4 mpd dining, 0.4 mpd else)
-- ============================================================
-- [VERIFIED from UOB website]
('00000000-0000-0000-0002-000000000020', 'dining',    4.0,  TRUE,  '{"min_spend_monthly": 600}', 'Earn 4 mpd (10X UNI$) on dining with min spend $600/month. Otherwise base 0.4 mpd. Capped at $1,000/month. [VERIFIED]', 'https://www.uob.com.sg/personal/cards/credit/preferred-platinum.page'),
('00000000-0000-0000-0002-000000000020', 'transport',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000020', 'online',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000020', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000020', 'petrol',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000020', 'bills',      0.4,  FALSE, '{}', 'Base rate on bills/utilities.', NULL),
('00000000-0000-0000-0002-000000000020', 'travel',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000020', 'general',    0.4,  FALSE, '{}', NULL, NULL)

ON CONFLICT (card_id, category_id, is_bonus, effective_from) DO UPDATE SET
  earn_rate_mpd   = EXCLUDED.earn_rate_mpd,
  conditions      = EXCLUDED.conditions,
  conditions_note = EXCLUDED.conditions_note,
  source_url      = EXCLUDED.source_url,
  updated_at      = NOW();


-- ============================================================
-- SECTION 4: MONTHLY CAPS
-- ============================================================
-- Not all cards have caps. We only insert rows where a cap exists.
-- cap_type = 'spend' means the cap is on the SGD spend amount.
-- ============================================================

INSERT INTO public.caps (card_id, category_id, monthly_cap_amount, cap_type, notes)
VALUES

  -- =============================================
  -- BATCH 1 CAPS
  -- =============================================

  -- CARD 1: DBS Altitude Visa — No specific monthly bonus cap documented
  -- CARD 2: Citi PremierMiles Visa — No monthly cap (flat rate, no bonus)
  -- CARD 3: UOB PRVI Miles Visa — No monthly cap (flat rate)
  -- CARD 4: OCBC 90N Visa — No monthly cap (flat rate)

  -- CARD 5: KrisFlyer UOB Credit Card
  ('00000000-0000-0000-0001-000000000005', NULL, 1000.00, 'spend',
   'Combined cap across all bonus categories (contactless/online). [ESTIMATED — verify with UOB T&Cs]'),

  -- CARD 6: HSBC Revolution
  ('00000000-0000-0000-0001-000000000006', NULL, 1000.00, 'spend',
   'Combined cap across dining, online, and entertainment bonus categories. [VERIFIED from HSBC website]'),

  -- CARD 7: Amex KrisFlyer Ascend
  ('00000000-0000-0000-0001-000000000007', 'dining',    2500.00, 'spend',
   'Per-category cap. [VERIFIED from Amex website]'),
  ('00000000-0000-0000-0001-000000000007', 'groceries', 2500.00, 'spend',
   'Per-category cap. [VERIFIED from Amex website]'),
  ('00000000-0000-0000-0001-000000000007', 'travel',    2500.00, 'spend',
   'Per-category cap. [VERIFIED from Amex website]'),

  -- CARD 8: BOC Elite Miles World MC
  ('00000000-0000-0000-0001-000000000008', NULL, 2000.00, 'spend',
   'Combined cap across all categories. [ESTIMATED — verify with BOC T&Cs]'),

  -- CARD 9: SC Visa Infinite — No monthly cap documented for local spend

  -- CARD 10: DBS Woman's World Card
  ('00000000-0000-0000-0001-000000000010', 'online', 2000.00, 'spend',
   'Cap on 10X bonus for online spending. [VERIFIED from DBS website]'),

  -- =============================================
  -- BATCH 2 CAPS
  -- =============================================

  -- CARD 11: UOB Lady's Card
  ('00000000-0000-0000-0002-000000000011', NULL, 1000.00, 'spend',
   'Combined cap across all 10X bonus categories (beauty, fashion, bags, shoes). [VERIFIED from UOB website]'),

  -- CARD 12: OCBC Titanium Rewards
  ('00000000-0000-0000-0002-000000000012', NULL, 1000.00, 'spend',
   'Combined cap across dining and online shopping 10X bonus categories. [VERIFIED from OCBC website]'),

  -- CARD 13: HSBC TravelOne — No monthly cap documented for local flat rate

  -- CARD 14: Amex KrisFlyer Credit Card
  ('00000000-0000-0000-0002-000000000014', 'dining', 2000.00, 'spend',
   'Cap on dining bonus. [ESTIMATED — verify with Amex T&Cs]'),
  ('00000000-0000-0000-0002-000000000014', 'travel', 2000.00, 'spend',
   'Cap on travel/SIA bonus. [ESTIMATED — verify with Amex T&Cs]'),

  -- CARD 15: SC X Card
  ('00000000-0000-0000-0002-000000000015', NULL, 2000.00, 'spend',
   'Combined cap across all bonus categories (dining, transport, online, groceries, petrol). [ESTIMATED — verify with SC T&Cs]'),

  -- CARD 16: Maybank Horizon Visa Signature
  ('00000000-0000-0000-0002-000000000016', NULL, 1500.00, 'spend',
   'Combined cap across bonus categories. [ESTIMATED — Maybank T&Cs have complex tiered caps]'),

  -- CARD 17: Maybank FC Barcelona
  ('00000000-0000-0000-0002-000000000017', NULL, 1500.00, 'spend',
   'Combined cap across bonus categories. Same as Horizon. [ESTIMATED]'),

  -- CARD 18: Citi Rewards
  ('00000000-0000-0000-0002-000000000018', NULL, 1000.00, 'spend',
   'Combined cap across online shopping and in-store shopping 10X bonus categories. [VERIFIED from Citi website]'),

  -- CARD 19: POSB Everyday Card — No cap (flat rate, no bonus)

  -- CARD 20: UOB Preferred Platinum
  ('00000000-0000-0000-0002-000000000020', 'dining', 1000.00, 'spend',
   'Cap on 10X dining bonus. Min spend $600/month to qualify for 10X. [VERIFIED from UOB website]')

ON CONFLICT (card_id, category_id) DO UPDATE SET
  monthly_cap_amount = EXCLUDED.monthly_cap_amount,
  cap_type           = EXCLUDED.cap_type,
  notes              = EXCLUDED.notes,
  updated_at         = NOW();


-- ============================================================
-- SECTION 5: EXCLUSIONS
-- ============================================================
-- Key exclusions per card. Not exhaustive; covers major known ones.
-- Common across Singapore cards: government payments, insurance premiums.
-- ============================================================

INSERT INTO public.exclusions (card_id, category_id, excluded_mccs, conditions, description)
VALUES

  -- =============================================
  -- BATCH 1 EXCLUSIONS
  -- =============================================

  -- CARD 1: DBS Altitude Visa
  ('00000000-0000-0000-0001-000000000001', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government-related transactions do not earn bonus DBS Points.'),
  ('00000000-0000-0000-0001-000000000001', NULL,
   ARRAY['6300', '6381', '6399'],
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

  -- CARD 4: OCBC 90N Visa
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
   'Recurring online payments may not qualify for 10X bonus. [ESTIMATED — verify with DBS T&Cs]'),

  -- =============================================
  -- BATCH 2 EXCLUSIONS
  -- =============================================

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


-- ============================================================
-- SECTION 6: VERIFICATION (post-seed sanity check)
-- ============================================================
-- Run these after seeding to confirm data integrity.
-- Uncomment to execute.

-- SELECT 'Cards' AS entity, COUNT(*) AS total FROM public.cards WHERE is_active = TRUE;
-- SELECT 'Earn Rules' AS entity, COUNT(*) AS total FROM public.earn_rules WHERE effective_to IS NULL;
-- SELECT 'Caps' AS entity, COUNT(*) AS total FROM public.caps;
-- SELECT 'Exclusions' AS entity, COUNT(*) AS total FROM public.exclusions;

COMMIT;
