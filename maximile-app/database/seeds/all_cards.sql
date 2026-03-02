-- =============================================================================
-- MaxiMile — Consolidated Card Rules Seed Data (all_cards.sql)
-- =============================================================================
--
-- SINGLE SOURCE OF TRUTH for all card data.
--
-- Card count:    29 cards (batch 1: cards 1-10, batch 2: cards 11-20, batch 3: cards 21-22, batch 4: cards 23-29)
-- Last updated:  2026-03-01
-- Version:       1.7.0
-- v1.7.0: Sprint 27 — Bills subcategory expansion (S27.1-S27.6): expanded bills MCCs (education/medical/pharmacy),
--         added subcategory earn rules for all 29 cards (utilities/education/medical/pharmacy/telco),
--         updated recommend() to accept p_subcategory parameter with subcategory_base CTE.
--         Exclusions Phase 2: wire transfers (4829), real estate (6513), quasi-cash (6050/6051),
--         securities (6211), charitable/religious/political (8398/8651/8661), gambling (7995),
--         cleaning/janitorial (7349), direct marketing insurance (5960).
-- v1.6.0: Fix 6 — Telco bonus rules for Cards 6, 10, 18, 20 (4 mpd one-off online telco, recurring excluded)
-- v1.5.0: Phase 2 exclusions audit — added utilities/hospitals/education/quasi-cash/parking per MileLion 2026
-- v1.4.0: Phase 1 P0 data corrections (MileLion 2026 gap analysis) — bills→0mpd, Card5/6/7/20 rate fixes
-- Author:        Data Engineer Agent
--
-- Description:
--   Combined seed file for all 29 Singapore miles credit cards.
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
    -- Telco & Internet
    '4812',  -- Telecommunication Equipment and Telephone Sales
    '4814',  -- Telecommunication Services
    '4899',  -- Cable, Satellite, Pay Television, Radio Services
    '4816',  -- Computer Network/Information Services (internet providers)
    -- Utilities
    '4900',  -- Utilities — Electric, Gas, Water, Sanitary
    -- Insurance
    '6300',  -- Insurance Sales, Underwriting
    '6381',  -- Insurance Premiums
    '6399',  -- Insurance — Not Elsewhere Classified
    -- Education (v1.7.0)
    '8211',  -- Elementary and Secondary Schools
    '8220',  -- Colleges, Universities, Professional Schools
    '8241',  -- Correspondence Schools
    '8244',  -- Business and Secretarial Schools
    '8249',  -- Trade and Vocational Schools
    '8299',  -- Schools and Educational Services — Not Elsewhere Classified
    -- Medical / Hospital (v1.7.0)
    '8011',  -- Doctors and Physicians — Not Elsewhere Classified
    '8021',  -- Dentists and Orthodontists
    '8062',  -- Hospitals
    '8099',  -- Health Services — Not Elsewhere Classified (incl. HealthHub, Health Buddy app)
    -- Pharmacy — standalone only (v1.7.0)
    '5912'   -- Drug Stores and Pharmacies (Guardian, Watsons, Unity — standalone)
  ],
  'Utilities, telco, insurance, education, medical, pharmacy'
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
-- SECTION 2: CARD METADATA (all 28 cards)
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
    'No annual fee. 4 mpd on dining, entertainment, online. 0.4 mpd elsewhere. 10X rewards on selected categories. Cap of $1,500/month on bonus. [VERIFIED from HSBC website]'
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
  ),

  -- =============================================
  -- BATCH 3: Cards 21-22
  -- =============================================

  -- 21. Maybank World Mastercard
  (
    '00000000-0000-0000-0003-000000000021',
    'Maybank',
    'Maybank World Mastercard',
    'maybank-world-mc',
    'mastercard',
    261.60,  -- S$261.60 annual fee (1st year waived)
    0.4,     -- 0.4 mpd base
    NULL,
    TRUE,
    'First Mastercard in database. Uncapped 4 mpd on petrol (MCC 5541), no min spend. 0.4 mpd base on other categories. 4 mpd at selected dining merchants (Paradise Group, Imperial Treasure, Les Amis, RWS) — merchant-specific, not modeled as category bonus. 3.2 mpd on overseas (FCY, out of scope). Min income $80K. Annual fee $261.60 (1st year waived). [VERIFIED from Maybank website + SingSaver]'
  ),

  -- 22. UOB Visa Signature
  (
    '00000000-0000-0000-0003-000000000022',
    'UOB',
    'UOB Visa Signature',
    'uob-visa-signature',
    'visa',
    218.00,  -- S$218.00 annual fee (1st year waived)
    0.4,     -- 0.4 mpd base
    NULL,
    TRUE,
    '4 mpd on contactless spend (dining, transport, groceries, general) + petrol. Requires $1,000/month min spend across petrol & contactless. Cap $1,200/month shared across all bonus categories. Petrol does NOT require contactless. Online/bills at base 0.4 mpd. Overseas 4 mpd (FCY, out of scope). Annual fee $218 (1st year waived). [VERIFIED from UOB website]'
  ),

  -- =============================================
  -- BATCH 4: Cards 23-28
  -- =============================================

  -- 23. DBS Vantage Visa Infinite
  (
    '00000000-0000-0000-0004-000000000023',
    'DBS',
    'DBS Vantage Visa Infinite',
    'dbs-vantage-visa-infinite',
    'visa',
    599.50,
    1.0,     -- 1.0 mpd base (without min spend)
    NULL,
    TRUE,
    'Flat 1.5 mpd all local spend with $2,000/month min spend. 1.0 mpd without min spend. No bonus categories. Annual fee $599.50 (non-waivable year 1). [VERIFIED]'
  ),

  -- 24. OCBC Voyage Card
  (
    '00000000-0000-0000-0004-000000000024',
    'OCBC',
    'OCBC Voyage Card',
    'ocbc-voyage-card',
    'visa',
    497.06,
    1.3,     -- 1.3 mpd flat
    NULL,
    TRUE,
    'Flat 1.3 mpd all local spend. No caps, no min spend. VOYAGE Miles do not expire. Annual fee $497.06. [VERIFIED from OCBC website]'
  ),

  -- 25. SC Journey Card
  (
    '00000000-0000-0000-0004-000000000025',
    'SC',
    'SC Journey Card',
    'sc-journey-card',
    'visa',
    196.20,
    1.2,     -- 1.2 mpd base
    NULL,
    TRUE,
    '3 mpd on online transport/food delivery and online grocery delivery. 1.2 mpd base on all other spend. Cap $1,000/month shared. Annual fee $196.20. [VERIFIED]'
  ),

  -- 26. SC Beyond Card
  (
    '00000000-0000-0000-0004-000000000026',
    'SC',
    'SC Beyond Card',
    'sc-beyond-card',
    'mastercard',
    1635.00,
    1.5,     -- 1.5 mpd flat
    NULL,
    TRUE,
    'Flat 1.5 mpd all local spend. No caps, no min spend. Premium card with $1,635 non-waivable annual fee. Priority Banking: 2.0 mpd (not modeled). [VERIFIED from SC website]'
  ),

  -- 27. HSBC Premier Mastercard
  (
    '00000000-0000-0000-0004-000000000027',
    'HSBC',
    'HSBC Premier Mastercard',
    'hsbc-premier-mc',
    'mastercard',
    708.50,
    1.4,     -- 1.4 mpd flat (KrisFlyer rate)
    NULL,
    TRUE,
    'Flat 1.4 mpd all local spend (KrisFlyer rate). Uncapped, no min spend. Annual fee $708.50 (waived for Premier customers with $200K TRB). Transfer fee waived. [VERIFIED from HSBC website]'
  ),

  -- 28. Maybank XL Rewards
  (
    '00000000-0000-0000-0004-000000000028',
    'Maybank',
    'Maybank XL Rewards',
    'maybank-xl-rewards',
    'mastercard',
    87.20,
    0.4,     -- 0.4 mpd base
    NULL,
    TRUE,
    '4 mpd on dining, online shopping, travel. Base 0.4 mpd. Min spend $500/month. Cap $1,000/month shared. Age 21-39 only. 1-year points expiry. $27.25 transfer fee. Annual fee $87.20. [VERIFIED]'
  ),

  -- 29. UOB Lady's Solitaire
  (
    '00000000-0000-0000-0004-000000000029',
    'UOB',
    'UOB Lady''s Solitaire',
    'uob-ladys-solitaire',
    'mastercard',
    414.20,
    0.4,
    NULL,
    TRUE,
    'Choose 2 of 7 bonus categories for 4 mpd (10X UNI$). Base 0.4 mpd. Cap $1,500/month shared ($750 per category). No min spend. Categories: Fashion, Dining, Travel, Beauty & Wellness, Family (groceries), Transport, Entertainment. Re-selectable quarterly. Annual fee $414.20. [VERIFIED from UOB website]'
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
-- SECTION 3: EARN RULES (8 categories x 29 cards = 232 rows)
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
('00000000-0000-0000-0001-000000000001', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
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
('00000000-0000-0000-0001-000000000002', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
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
('00000000-0000-0000-0001-000000000003', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
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
('00000000-0000-0000-0001-000000000004', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
('00000000-0000-0000-0001-000000000004', 'travel',     2.1,  TRUE,  '{}', 'Earns 2.1 mpd on overseas / FCY transactions and travel merchants. Local SGD transactions earn the base rate of 1.2 mpd. No monthly cap. [VERIFIED from OCBC website]', 'https://www.ocbc.com/personal-banking/cards/90n-card'),
('00000000-0000-0000-0001-000000000004', 'general',    1.2,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 5: KrisFlyer UOB Credit Card (1.2 mpd base, up to 3 mpd bonus)
-- ============================================================
-- [VERIFIED from UOB website]
('00000000-0000-0000-0001-000000000005', 'dining',    1.2,  FALSE, '{}', NULL, 'https://www.uob.com.sg/personal/cards/credit/krisflyer-uob-credit-card.page'),
('00000000-0000-0000-0001-000000000005', 'transport',  1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000005', 'online',     1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000005', 'groceries',  1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000005', 'petrol',     1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000005', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
('00000000-0000-0000-0001-000000000005', 'travel',     3.0,  TRUE,  '{"merchant": "SIA"}', 'Earn 3 mpd on SIA purchases (flights, SIA website). 1.2 mpd on other travel.', NULL),
('00000000-0000-0000-0001-000000000005', 'general',    1.2,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 6: HSBC Revolution (4 mpd on dining/entertainment/online, 0.4 mpd else)
-- ============================================================
-- [VERIFIED from HSBC website]
('00000000-0000-0000-0001-000000000006', 'dining',    4.0,  TRUE,  '{}', 'Earn 4 mpd on dining (10X HSBC rewards). Capped at $1,000/month across bonus categories.', 'https://www.hsbc.com.sg/credit-cards/products/revolution/'),
('00000000-0000-0000-0001-000000000006', 'transport',  4.0,  TRUE,  '{"contactless": true}', 'Earn 4 mpd on contactless transport (Revo Up promo, valid to 31 Mar 2026). Cap $1,500/month shared across dining, online, transport. Reverts to 0.4 mpd base after promo ends. [VERIFIED from MileLion 2026]', NULL),
('00000000-0000-0000-0001-000000000006', 'online',     4.0,  TRUE,  '{}', 'Earn 4 mpd on online spend (10X HSBC rewards). Capped at $1,000/month across bonus categories.', NULL),
('00000000-0000-0000-0001-000000000006', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000006', 'petrol',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000006', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
('00000000-0000-0000-0001-000000000006', 'travel',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000006', 'general',    0.4,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 7: Amex KrisFlyer Ascend (1.1 mpd base, 2 mpd dining/travel, 3 mpd SIA)
-- ============================================================
-- [VERIFIED from Amex website]
('00000000-0000-0000-0001-000000000007', 'dining',    2.0,  TRUE,  '{}', 'Earn 2 KrisFlyer miles per $1 on dining. Capped at $2,500/month.', 'https://www.americanexpress.com/sg/credit-cards/krisflyer-ascend-card/'),
('00000000-0000-0000-0001-000000000007', 'transport',  1.1,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000007', 'online',     1.1,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000007', 'groceries',  1.1,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000007', 'petrol',     1.1,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0001-000000000007', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
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
('00000000-0000-0000-0001-000000000008', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
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
('00000000-0000-0000-0001-000000000009', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
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
('00000000-0000-0000-0001-000000000010', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
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
('00000000-0000-0000-0002-000000000011', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
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
('00000000-0000-0000-0002-000000000012', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
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
('00000000-0000-0000-0002-000000000013', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
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
('00000000-0000-0000-0002-000000000014', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
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
('00000000-0000-0000-0002-000000000015', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
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
('00000000-0000-0000-0002-000000000016', 'bills',      0.4,  FALSE, '{}', 'Utility payments: 0.4 mpd base (Maybank has fewer exclusions — verify against Maybank T&Cs). [ESTIMATED]', NULL),
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
('00000000-0000-0000-0002-000000000017', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
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
('00000000-0000-0000-0002-000000000018', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
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
('00000000-0000-0000-0002-000000000019', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
('00000000-0000-0000-0002-000000000019', 'travel',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000019', 'general',    0.4,  FALSE, '{}', 'POSB Everyday earns flat 0.4 mpd across all categories. This card is primarily cashback-focused; miles conversion is secondary. [ESTIMATED]', NULL),

-- ============================================================
-- CARD 20: UOB Preferred Platinum Visa (4 mpd dining, 0.4 mpd else)
-- ============================================================
-- [VERIFIED from UOB website]
('00000000-0000-0000-0002-000000000020', 'dining',    4.0,  TRUE,  '{"min_spend_monthly": 600}', 'Earn 4 mpd (10X UNI$) on dining with min spend $600/month. Otherwise base 0.4 mpd. Capped at $1,000/month. [VERIFIED]', 'https://www.uob.com.sg/personal/cards/credit/preferred-platinum.page'),
('00000000-0000-0000-0002-000000000020', 'transport',  4.0,  TRUE,  '{"min_spend_monthly": 600, "contactless": true}', 'Earn 4 mpd (10X UNI$) on mobile contactless transport incl. SimplyGo. Min spend $600/month. Cap $1,000/month shared across dining, transport, online. [VERIFIED from MileLion 2026]', NULL),
('00000000-0000-0000-0002-000000000020', 'online',     4.0,  TRUE,  '{"min_spend_monthly": 600}', 'Earn 4 mpd (10X UNI$) on online spend. Min spend $600/month. Cap $1,000/month shared across dining, transport, online. [VERIFIED from MileLion 2026]', NULL),
('00000000-0000-0000-0002-000000000020', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000020', 'petrol',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000020', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
('00000000-0000-0000-0002-000000000020', 'travel',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0002-000000000020', 'general',    0.4,  FALSE, '{}', NULL, NULL),

-- =============================================
-- BATCH 3: Cards 21-22
-- =============================================

-- ============================================================
-- CARD 21: Maybank World Mastercard (4 mpd petrol uncapped, 0.4 mpd else)
-- ============================================================
-- [VERIFIED from Maybank website + SingSaver]
('00000000-0000-0000-0003-000000000021', 'dining',    0.4,  FALSE, '{}', '4 mpd at selected dining merchants (Paradise Group, Imperial Treasure, Les Amis, RWS). 0.4 mpd at other dining merchants.', 'https://www.maybank2u.com.sg/en/personal/cards/credit/maybank-world-mastercard.page'),
('00000000-0000-0000-0003-000000000021', 'transport',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0003-000000000021', 'online',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0003-000000000021', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0003-000000000021', 'petrol',     4.0,  TRUE,  '{}', 'Earn 4 mpd on petrol (MCC 5541). Uncapped, no min spend. [VERIFIED from Maybank website]', NULL),
('00000000-0000-0000-0003-000000000021', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
('00000000-0000-0000-0003-000000000021', 'travel',     0.4,  FALSE, '{}', '3.2 mpd on overseas travel (FCY). 0.4 mpd on local travel. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000021', 'general',    0.4,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 22: UOB Visa Signature (4 mpd contactless + petrol, 0.4 mpd else)
-- ============================================================
-- [VERIFIED from UOB website]
('00000000-0000-0000-0003-000000000022', 'dining',    4.0,  TRUE,  '{"contactless": true, "min_spend_monthly": 1000}', 'Earn 4 mpd on contactless dining. Min spend $1,000/month across petrol & contactless. Cap $1,200/month shared. 0.4 mpd otherwise. [VERIFIED from UOB website]', 'https://www.uob.com.sg/personal/cards/rewards/visa-signature-card.page'),
('00000000-0000-0000-0003-000000000022', 'transport',  4.0,  TRUE,  '{"contactless": true, "min_spend_monthly": 1000}', 'Earn 4 mpd on contactless transport incl. SimplyGo. Min spend $1,000/month. Cap $1,200/month shared. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000022', 'online',     0.4,  FALSE, '{}', 'Mobile contactless in-app payments classified as online, not contactless. 0.4 mpd. [VERIFIED from UOB T&Cs]', NULL),
('00000000-0000-0000-0003-000000000022', 'groceries',  4.0,  TRUE,  '{"contactless": true, "min_spend_monthly": 1000}', 'Earn 4 mpd on contactless groceries. Min spend $1,000/month. Cap $1,200/month shared. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000022', 'petrol',     4.0,  TRUE,  '{"min_spend_monthly": 1000}', 'Earn 4 mpd on petrol. Min spend $1,000/month. Cap $1,200/month shared. No contactless required for petrol. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000022', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
('00000000-0000-0000-0003-000000000022', 'travel',     0.4,  FALSE, '{}', '4 mpd on overseas travel (FCY, out of scope). 0.4 mpd on local travel. [VERIFIED]', NULL),
('00000000-0000-0000-0003-000000000022', 'general',    4.0,  TRUE,  '{"contactless": true, "min_spend_monthly": 1000}', 'Earn 4 mpd on contactless spend. Min spend $1,000/month. Cap $1,200/month shared. [VERIFIED]', NULL),

-- =============================================
-- BATCH 4: Cards 23-28
-- =============================================

-- ============================================================
-- CARD 23: DBS Vantage Visa Infinite (1.5 mpd all categories with min spend)
-- ============================================================
-- [VERIFIED from DBS website]
('00000000-0000-0000-0004-000000000023', 'dining',    1.5,  TRUE,  '{"min_spend_monthly": 2000}', 'Earn 1.5 mpd on all local spend. Requires $2,000/month min spend (1.0 mpd otherwise). [VERIFIED from DBS website]', NULL),
('00000000-0000-0000-0004-000000000023', 'transport',  1.5,  TRUE,  '{"min_spend_monthly": 2000}', 'Earn 1.5 mpd on all local spend. Requires $2,000/month min spend (1.0 mpd otherwise). [VERIFIED from DBS website]', NULL),
('00000000-0000-0000-0004-000000000023', 'online',     1.5,  TRUE,  '{"min_spend_monthly": 2000}', 'Earn 1.5 mpd on all local spend. Requires $2,000/month min spend (1.0 mpd otherwise). [VERIFIED from DBS website]', NULL),
('00000000-0000-0000-0004-000000000023', 'groceries',  1.5,  TRUE,  '{"min_spend_monthly": 2000}', 'Earn 1.5 mpd on all local spend. Requires $2,000/month min spend (1.0 mpd otherwise). [VERIFIED from DBS website]', NULL),
('00000000-0000-0000-0004-000000000023', 'petrol',     1.5,  TRUE,  '{"min_spend_monthly": 2000}', 'Earn 1.5 mpd on all local spend. Requires $2,000/month min spend (1.0 mpd otherwise). [VERIFIED from DBS website]', NULL),
('00000000-0000-0000-0004-000000000023', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
('00000000-0000-0000-0004-000000000023', 'travel',     1.5,  TRUE,  '{"min_spend_monthly": 2000}', 'Earn 1.5 mpd on all local spend. Requires $2,000/month min spend (1.0 mpd otherwise). [VERIFIED from DBS website]', NULL),
('00000000-0000-0000-0004-000000000023', 'general',    1.5,  TRUE,  '{"min_spend_monthly": 2000}', 'Earn 1.5 mpd on all local spend. Requires $2,000/month min spend (1.0 mpd otherwise). [VERIFIED from DBS website]', NULL),

-- ============================================================
-- CARD 24: OCBC Voyage Card (flat 1.3 mpd all categories)
-- ============================================================
-- [VERIFIED from OCBC website]
('00000000-0000-0000-0004-000000000024', 'dining',    1.3,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000024', 'transport',  1.3,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000024', 'online',     1.3,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000024', 'groceries',  1.3,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000024', 'petrol',     1.3,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000024', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
('00000000-0000-0000-0004-000000000024', 'travel',     1.3,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000024', 'general',    1.3,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 25: SC Journey Card (3 mpd transport/groceries online, 1.2 mpd else)
-- ============================================================
-- [VERIFIED from SC website]
('00000000-0000-0000-0004-000000000025', 'dining',    1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000025', 'transport',  3.0,  TRUE,  '{}', 'Earn 3 mpd on online transport and food delivery (Grab, foodpanda, Deliveroo). In-store transport earns 1.2 mpd base rate. Cap $1,000/month shared. [VERIFIED from SC website]', NULL),
('00000000-0000-0000-0004-000000000025', 'online',     1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000025', 'groceries',  3.0,  TRUE,  '{}', 'Earn 3 mpd on online grocery delivery. In-store groceries earn 1.2 mpd base rate. Cap $1,000/month shared. [VERIFIED from SC website]', NULL),
('00000000-0000-0000-0004-000000000025', 'petrol',     1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000025', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
('00000000-0000-0000-0004-000000000025', 'travel',     1.2,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000025', 'general',    1.2,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 26: SC Beyond Card (flat 1.5 mpd all categories)
-- ============================================================
-- [VERIFIED from SC website]
('00000000-0000-0000-0004-000000000026', 'dining',    1.5,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000026', 'transport',  1.5,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000026', 'online',     1.5,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000026', 'groceries',  1.5,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000026', 'petrol',     1.5,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000026', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
('00000000-0000-0000-0004-000000000026', 'travel',     1.5,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000026', 'general',    1.5,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 27: HSBC Premier Mastercard (flat 1.4 mpd all categories)
-- ============================================================
-- [VERIFIED from HSBC website]
('00000000-0000-0000-0004-000000000027', 'dining',    1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000027', 'transport',  1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000027', 'online',     1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000027', 'groceries',  1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000027', 'petrol',     1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000027', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
('00000000-0000-0000-0004-000000000027', 'travel',     1.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000027', 'general',    1.4,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 28: Maybank XL Rewards (4 mpd dining/online/travel, 0.4 mpd else)
-- ============================================================
-- [VERIFIED from Maybank website]
('00000000-0000-0000-0004-000000000028', 'dining',    4.0,  TRUE,  '{"min_spend_monthly": 500}', 'Earn 4 mpd on dining (restaurants + food delivery). Min spend $500/month. Cap $1,000/month shared. Age 21-39 only. [VERIFIED from Maybank website]', NULL),
('00000000-0000-0000-0004-000000000028', 'transport',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000028', 'online',     4.0,  TRUE,  '{"min_spend_monthly": 500}', 'Earn 4 mpd on online shopping. Min spend $500/month. Cap $1,000/month shared. [VERIFIED from Maybank website]', NULL),
('00000000-0000-0000-0004-000000000028', 'groceries',  0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000028', 'petrol',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000028', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
('00000000-0000-0000-0004-000000000028', 'travel',     4.0,  TRUE,  '{"min_spend_monthly": 500}', 'Earn 4 mpd on travel (flights, hotels). Min spend $500/month. Cap $1,000/month shared. [VERIFIED from Maybank website]', NULL),
('00000000-0000-0000-0004-000000000028', 'general',    0.4,  FALSE, '{}', NULL, NULL),

-- ============================================================
-- CARD 29: UOB Lady's Solitaire (user-selectable bonus categories)
-- ============================================================
-- [VERIFIED from UOB website]
('00000000-0000-0000-0004-000000000029', 'dining',    4.0,  TRUE,  '{"user_selectable": true}', 'Earn 4 mpd if Dining selected as bonus category. Choose 2 of 7 categories. Cap $750/month per category ($1,500 total). [VERIFIED from UOB website]', NULL),
('00000000-0000-0000-0004-000000000029', 'transport',  4.0,  TRUE,  '{"user_selectable": true}', 'Earn 4 mpd if Transport selected as bonus category. Choose 2 of 7 categories. Cap $750/month per category ($1,500 total). [VERIFIED]', NULL),
('00000000-0000-0000-0004-000000000029', 'online',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000029', 'groceries',  4.0,  TRUE,  '{"user_selectable": true}', 'Earn 4 mpd if Family (groceries) selected as bonus category. Choose 2 of 7 categories. Cap $750/month per category ($1,500 total). [VERIFIED]', NULL),
('00000000-0000-0000-0004-000000000029', 'petrol',     0.4,  FALSE, '{}', NULL, NULL),
('00000000-0000-0000-0004-000000000029', 'bills',      0.0,  FALSE, '{}', 'Utility payments (electricity, water) earn 0 mpd — excluded by bank. For telco see conditions. [VERIFIED from MileLion 2026]', NULL),
('00000000-0000-0000-0004-000000000029', 'travel',     4.0,  TRUE,  '{"user_selectable": true}', 'Earn 4 mpd if Travel selected as bonus category. Choose 2 of 7 categories. Cap $750/month per category ($1,500 total). [VERIFIED]', NULL),
('00000000-0000-0000-0004-000000000029', 'general',    4.0,  TRUE,  '{"user_selectable": true}', 'Earn 4 mpd if Fashion, Beauty & Wellness, or Entertainment selected as bonus category (mapped to general). Choose 2 of 7 categories. Cap $750/month per category ($1,500 total). [VERIFIED]', NULL),

-- ============================================================
-- FIX 6 (v1.6.0): Telco Bonus Rules — Cards 6, 10, 18, 20
-- One-off online telco payments (Singtel, StarHub, M1) earn 4 mpd
-- on these 4 cards when charged directly to card (not recurring GIRO/FAST)
-- Telco MCCs: 4812 (Telephone), 4814 (Telecomm Services), 4899 (Cable & TV)
-- Source: MileLion 2026 (telco online spend treated as online shopping)
-- ============================================================

-- CARD 6: HSBC Revolution — telco online earns 4 mpd (falls under online 10X)
('00000000-0000-0000-0001-000000000006', 'bills', 4.0, TRUE, '{"telco_online": true, "recurring_excluded": true}',
 'Earn 4 mpd on one-off online telco payments (Singtel, StarHub, M1 billed directly to card). Recurring GIRO/auto-debit excluded — earns 0 mpd. Cap $1,500/month shared with dining, online, transport. [VERIFIED from MileLion 2026]',
 NULL),

-- CARD 10: DBS Woman's World Card — telco online earns 4 mpd (online category 10X)
('00000000-0000-0000-0001-000000000010', 'bills', 4.0, TRUE, '{"telco_online": true, "recurring_excluded": true}',
 'Earn 4 mpd on one-off online telco payments (Singtel, StarHub, M1 billed directly to card). Recurring GIRO/auto-debit excluded — earns 0 mpd. Cap $2,000/month shared with online spend. [VERIFIED from MileLion 2026]',
 NULL),

-- CARD 18: Citi Rewards — telco online earns 4 mpd (online shopping 10X)
('00000000-0000-0000-0002-000000000018', 'bills', 4.0, TRUE, '{"telco_online": true, "recurring_excluded": true}',
 'Earn 4 mpd on one-off online telco payments (Singtel, StarHub, M1 billed directly to card). Recurring GIRO/auto-debit excluded — earns 0 mpd. Cap $1,000/month shared with online and in-store shopping. [VERIFIED from MileLion 2026]',
 NULL),

-- CARD 20: UOB Preferred Platinum Visa — telco online earns 4 mpd (online 10X)
('00000000-0000-0000-0002-000000000020', 'bills', 4.0, TRUE, '{"telco_online": true, "recurring_excluded": true, "min_spend_monthly": 600}',
 'Earn 4 mpd on one-off online telco payments (Singtel, StarHub, M1 billed directly to card). Min spend $600/month required. Recurring GIRO/auto-debit excluded — earns 0 mpd. Cap $1,000/month shared with dining, transport, online. [VERIFIED from MileLion 2026]',
 NULL)

ON CONFLICT (card_id, category_id, is_bonus, effective_from) DO UPDATE SET
  earn_rate_mpd   = EXCLUDED.earn_rate_mpd,
  conditions      = EXCLUDED.conditions,
  conditions_note = EXCLUDED.conditions_note,
  source_url      = EXCLUDED.source_url,
  updated_at      = NOW();


-- ============================================================
-- SECTION 3b: BILLS SUBCATEGORY EARN RULES (v1.7.0)
-- ============================================================
-- All subcategory rows use explicit effective_from = '2026-03-01'
-- so they do NOT conflict with existing bills rows (which use CURRENT_DATE
-- default, effectively the same date but differ in the unique constraint
-- because effective_from is part of the PK: card_id, category_id, is_bonus,
-- effective_from).
--
-- Subcategories:
--   utilities  — 0 mpd (excluded) for most cards; 0.4 mpd Maybank Horizon only
--   education  — 0 mpd for DBS/Citi/UOB/OCBC/HSBC/SC/BOC/Amex; 0.16 mpd Maybank
--   medical    — 0 mpd for DBS/Citi/UOB/OCBC/SC/BOC; base rate for HSBC/Amex; 0.16 mpd Maybank
--   pharmacy   — base_rate_mpd for all cards (standalone pharmacy not excluded)
--   telco      — base rate fallback for all 29 cards (bonus rows already in Section 3/FIX 6)
-- ============================================================

INSERT INTO public.earn_rules (card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note, source_url, effective_from)
VALUES

-- ============================================================
-- UTILITIES subcategory — 0.0 mpd for all cards except Maybank Horizon
-- ============================================================

-- CARD 1: DBS Altitude Visa
('00000000-0000-0000-0001-000000000001', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 2: Citi PremierMiles Visa
('00000000-0000-0000-0001-000000000002', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 3: UOB PRVI Miles Visa
('00000000-0000-0000-0001-000000000003', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 4: OCBC 90N Visa
('00000000-0000-0000-0001-000000000004', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 5: KrisFlyer UOB Credit Card
('00000000-0000-0000-0001-000000000005', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 6: HSBC Revolution
('00000000-0000-0000-0001-000000000006', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 7: Amex KrisFlyer Ascend
('00000000-0000-0000-0001-000000000007', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 8: BOC Elite Miles World Mastercard
('00000000-0000-0000-0001-000000000008', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 9: SC Visa Infinite
('00000000-0000-0000-0001-000000000009', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 10: DBS Woman's World Card
('00000000-0000-0000-0001-000000000010', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 11: UOB Lady's Card
('00000000-0000-0000-0002-000000000011', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 12: OCBC Titanium Rewards
('00000000-0000-0000-0002-000000000012', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 13: HSBC TravelOne
('00000000-0000-0000-0002-000000000013', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 14: Amex KrisFlyer Credit Card
('00000000-0000-0000-0002-000000000014', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 15: SC X Card
('00000000-0000-0000-0002-000000000015', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 16: Maybank Horizon Visa Signature (EXCEPTION: 0.4 mpd — Maybank has fewer exclusions)
('00000000-0000-0000-0002-000000000016', 'bills', 0.4, FALSE, '{"subcategory": "utilities"}',
 'Utility payments earn 0.4 mpd base (Maybank Horizon has fewer utility exclusions). [ESTIMATED]',
 NULL, '2026-03-01'::date),

-- CARD 17: Maybank FC Barcelona
('00000000-0000-0000-0002-000000000017', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 18: Citi Rewards
('00000000-0000-0000-0002-000000000018', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 19: POSB Everyday Card
('00000000-0000-0000-0002-000000000019', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 20: UOB Preferred Platinum Visa
('00000000-0000-0000-0002-000000000020', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 21: Maybank World Mastercard
('00000000-0000-0000-0003-000000000021', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 22: UOB Visa Signature
('00000000-0000-0000-0003-000000000022', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 23: DBS Vantage Visa Infinite
('00000000-0000-0000-0004-000000000023', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 24: OCBC Voyage Card
('00000000-0000-0000-0004-000000000024', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 25: SC Journey Card
('00000000-0000-0000-0004-000000000025', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 26: SC Beyond Card
('00000000-0000-0000-0004-000000000026', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 27: HSBC Premier Mastercard
('00000000-0000-0000-0004-000000000027', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 28: Maybank XL Rewards
('00000000-0000-0000-0004-000000000028', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- CARD 29: UOB Lady's Solitaire
('00000000-0000-0000-0004-000000000029', 'bills', 0.0, FALSE, '{"subcategory": "utilities"}',
 'Utility payments (SP Services, Geneco, City Energy) earn 0 mpd. Excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- ============================================================
-- EDUCATION subcategory
-- DBS/Citi/UOB/OCBC/HSBC/SC/BOC/Amex: 0.0 mpd [VERIFIED]
-- Maybank (16, 17, 21, 28): 0.16 mpd [UNVERIFIED]
-- ============================================================

-- DBS cards: 0.0 mpd
('00000000-0000-0000-0001-000000000001', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0001-000000000010', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0002-000000000019', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0004-000000000023', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- Citi cards: 0.0 mpd
('00000000-0000-0000-0001-000000000002', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0002-000000000018', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- UOB cards: 0.0 mpd
('00000000-0000-0000-0001-000000000003', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0001-000000000005', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0002-000000000011', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0002-000000000020', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0003-000000000022', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0004-000000000029', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- OCBC cards: 0.0 mpd
('00000000-0000-0000-0001-000000000004', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0002-000000000012', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0004-000000000024', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- HSBC cards: 0.0 mpd
('00000000-0000-0000-0001-000000000006', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0002-000000000013', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0004-000000000027', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- SC cards: 0.0 mpd
('00000000-0000-0000-0001-000000000009', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0002-000000000015', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0004-000000000025', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0004-000000000026', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- BOC card: 0.0 mpd
('00000000-0000-0000-0001-000000000008', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- Amex cards: 0.0 mpd
('00000000-0000-0000-0001-000000000007', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0002-000000000014', 'bills', 0.0, FALSE, '{"subcategory": "education"}',
 'School fee payments (GIRO or direct) earn 0 mpd. MCCs 8211/8220/8241/8249/8299 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- Maybank cards: 0.16 mpd [UNVERIFIED]
('00000000-0000-0000-0002-000000000016', 'bills', 0.16, FALSE, '{"subcategory": "education"}',
 'School fee payments earn approx 0.16 mpd (TreatsPoints conversion, 8x points × 0.02 mpd). Education exclusion unverified for Maybank — may earn base rate. [UNVERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0002-000000000017', 'bills', 0.16, FALSE, '{"subcategory": "education"}',
 'School fee payments earn approx 0.16 mpd (TreatsPoints conversion, 8x points × 0.02 mpd). Education exclusion unverified for Maybank — may earn base rate. [UNVERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0003-000000000021', 'bills', 0.16, FALSE, '{"subcategory": "education"}',
 'School fee payments earn approx 0.16 mpd (TreatsPoints conversion, 8x points × 0.02 mpd). Education exclusion unverified for Maybank — may earn base rate. [UNVERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0004-000000000028', 'bills', 0.16, FALSE, '{"subcategory": "education"}',
 'School fee payments earn approx 0.16 mpd (TreatsPoints conversion, 8x points × 0.02 mpd). Education exclusion unverified for Maybank — may earn base rate. [UNVERIFIED]',
 NULL, '2026-03-01'::date),

-- ============================================================
-- MEDICAL subcategory
-- DBS/Citi/UOB/OCBC/SC/BOC: 0.0 mpd [VERIFIED]
-- HSBC (6, 13, 27): base rate (0.4, 1.0, 1.4) [VERIFIED — private hospital exception]
-- Amex (7, 14): 1.1 mpd [VERIFIED — private hospital exception]
-- Maybank (16, 17, 21, 28): 0.16 mpd [UNVERIFIED]
-- ============================================================

-- DBS cards: 0.0 mpd
('00000000-0000-0000-0001-000000000001', 'bills', 0.0, FALSE, '{"subcategory": "medical"}',
 'Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0001-000000000010', 'bills', 0.0, FALSE, '{"subcategory": "medical"}',
 'Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0002-000000000019', 'bills', 0.0, FALSE, '{"subcategory": "medical"}',
 'Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0004-000000000023', 'bills', 0.0, FALSE, '{"subcategory": "medical"}',
 'Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- Citi cards: 0.0 mpd
('00000000-0000-0000-0001-000000000002', 'bills', 0.0, FALSE, '{"subcategory": "medical"}',
 'Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0002-000000000018', 'bills', 0.0, FALSE, '{"subcategory": "medical"}',
 'Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- UOB cards: 0.0 mpd
('00000000-0000-0000-0001-000000000003', 'bills', 0.0, FALSE, '{"subcategory": "medical"}',
 'Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0001-000000000005', 'bills', 0.0, FALSE, '{"subcategory": "medical"}',
 'Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0002-000000000011', 'bills', 0.0, FALSE, '{"subcategory": "medical"}',
 'Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0002-000000000020', 'bills', 0.0, FALSE, '{"subcategory": "medical"}',
 'Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0003-000000000022', 'bills', 0.0, FALSE, '{"subcategory": "medical"}',
 'Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0004-000000000029', 'bills', 0.0, FALSE, '{"subcategory": "medical"}',
 'Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- OCBC cards: 0.0 mpd
('00000000-0000-0000-0001-000000000004', 'bills', 0.0, FALSE, '{"subcategory": "medical"}',
 'Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0002-000000000012', 'bills', 0.0, FALSE, '{"subcategory": "medical"}',
 'Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0004-000000000024', 'bills', 0.0, FALSE, '{"subcategory": "medical"}',
 'Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- SC cards: 0.0 mpd
('00000000-0000-0000-0001-000000000009', 'bills', 0.0, FALSE, '{"subcategory": "medical"}',
 'Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0002-000000000015', 'bills', 0.0, FALSE, '{"subcategory": "medical"}',
 'Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0004-000000000025', 'bills', 0.0, FALSE, '{"subcategory": "medical"}',
 'Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0004-000000000026', 'bills', 0.0, FALSE, '{"subcategory": "medical"}',
 'Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- BOC card: 0.0 mpd
('00000000-0000-0000-0001-000000000008', 'bills', 0.0, FALSE, '{"subcategory": "medical"}',
 'Hospital/medical bill payments earn 0 mpd. MCC 8062 excluded by bank. [VERIFIED]',
 NULL, '2026-03-01'::date),

-- HSBC cards: base rate (private hospital exception — public hospitals excluded only)
-- Card 6: HSBC Revolution (0.4 mpd base)
('00000000-0000-0000-0001-000000000006', 'bills', 0.4, FALSE, '{"subcategory": "medical"}',
 'Private hospital bills earn base rate (HSBC excludes public hospitals only — MCC 8062 at public hospitals). [VERIFIED]',
 NULL, '2026-03-01'::date),
-- Card 13: HSBC TravelOne (1.0 mpd base)
('00000000-0000-0000-0002-000000000013', 'bills', 1.0, FALSE, '{"subcategory": "medical"}',
 'Private hospital bills earn base rate (HSBC excludes public hospitals only — MCC 8062 at public hospitals). [VERIFIED]',
 NULL, '2026-03-01'::date),
-- Card 27: HSBC Premier Mastercard (1.4 mpd base)
('00000000-0000-0000-0004-000000000027', 'bills', 1.4, FALSE, '{"subcategory": "medical"}',
 'Private hospital bills earn base rate (HSBC excludes public hospitals only — MCC 8062 at public hospitals). [VERIFIED]',
 NULL, '2026-03-01'::date),

-- Amex cards: 1.1 mpd (private hospital exception)
('00000000-0000-0000-0001-000000000007', 'bills', 1.1, FALSE, '{"subcategory": "medical"}',
 'Private hospital bills earn base rate. Public hospital bills excluded (Amex excludes public MCC 8062). [VERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0002-000000000014', 'bills', 1.1, FALSE, '{"subcategory": "medical"}',
 'Private hospital bills earn base rate. Public hospital bills excluded (Amex excludes public MCC 8062). [VERIFIED]',
 NULL, '2026-03-01'::date),

-- Maybank cards: 0.16 mpd [UNVERIFIED]
('00000000-0000-0000-0002-000000000016', 'bills', 0.16, FALSE, '{"subcategory": "medical"}',
 'Hospital bill payments earn approx 0.16 mpd (unverified — Maybank may have shorter exclusion list). [UNVERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0002-000000000017', 'bills', 0.16, FALSE, '{"subcategory": "medical"}',
 'Hospital bill payments earn approx 0.16 mpd (unverified — Maybank may have shorter exclusion list). [UNVERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0003-000000000021', 'bills', 0.16, FALSE, '{"subcategory": "medical"}',
 'Hospital bill payments earn approx 0.16 mpd (unverified — Maybank may have shorter exclusion list). [UNVERIFIED]',
 NULL, '2026-03-01'::date),
('00000000-0000-0000-0004-000000000028', 'bills', 0.16, FALSE, '{"subcategory": "medical"}',
 'Hospital bill payments earn approx 0.16 mpd (unverified — Maybank may have shorter exclusion list). [UNVERIFIED]',
 NULL, '2026-03-01'::date),

-- ============================================================
-- PHARMACY subcategory
-- ALL 29 cards: base_rate_mpd (standalone pharmacies not excluded)
-- Guardian, Watsons, Unity = MCC 5912 = earns base rate
-- Hospital-linked pharmacies (SingHealth, NHG) = MCC 9399 = 0 mpd (govt)
-- SPECIAL: Card 10 (DBS WWMC) and Card 18 (Citi Rewards) — note MCC 8099 tip
-- ============================================================

-- CARD 1: DBS Altitude Visa (1.2 mpd)
('00000000-0000-0000-0001-000000000001', 'bills', 1.2, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 2: Citi PremierMiles Visa (1.2 mpd)
('00000000-0000-0000-0001-000000000002', 'bills', 1.2, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 3: UOB PRVI Miles Visa (1.4 mpd)
('00000000-0000-0000-0001-000000000003', 'bills', 1.4, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 4: OCBC 90N Visa (1.2 mpd)
('00000000-0000-0000-0001-000000000004', 'bills', 1.2, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 5: KrisFlyer UOB Credit Card (1.2 mpd)
('00000000-0000-0000-0001-000000000005', 'bills', 1.2, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 6: HSBC Revolution (0.4 mpd)
('00000000-0000-0000-0001-000000000006', 'bills', 0.4, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 7: Amex KrisFlyer Ascend (1.1 mpd)
('00000000-0000-0000-0001-000000000007', 'bills', 1.1, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 8: BOC Elite Miles World Mastercard (1.5 mpd)
('00000000-0000-0000-0001-000000000008', 'bills', 1.5, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 9: SC Visa Infinite (1.4 mpd)
('00000000-0000-0000-0001-000000000009', 'bills', 1.4, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 10: DBS Woman's World Card (0.4 mpd) — SPECIAL: MCC 8099 earns 4 mpd
('00000000-0000-0000-0001-000000000010', 'bills', 0.4, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying. MCC 8099 (HealthHub/Health Buddy app payments) earns 4 mpd on this card as online spend.',
 NULL, '2026-03-01'::date),

-- CARD 11: UOB Lady's Card (0.4 mpd)
('00000000-0000-0000-0002-000000000011', 'bills', 0.4, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 12: OCBC Titanium Rewards (0.4 mpd)
('00000000-0000-0000-0002-000000000012', 'bills', 0.4, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 13: HSBC TravelOne (1.0 mpd)
('00000000-0000-0000-0002-000000000013', 'bills', 1.0, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 14: Amex KrisFlyer Credit Card (1.1 mpd)
('00000000-0000-0000-0002-000000000014', 'bills', 1.1, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 15: SC X Card (0.4 mpd)
('00000000-0000-0000-0002-000000000015', 'bills', 0.4, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 16: Maybank Horizon Visa Signature (0.4 mpd)
('00000000-0000-0000-0002-000000000016', 'bills', 0.4, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 17: Maybank FC Barcelona (0.4 mpd)
('00000000-0000-0000-0002-000000000017', 'bills', 0.4, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 18: Citi Rewards (0.4 mpd) — SPECIAL: MCC 8099 earns 4 mpd
('00000000-0000-0000-0002-000000000018', 'bills', 0.4, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying. MCC 8099 (HealthHub/Health Buddy app payments) earns 4 mpd on this card as online spend.',
 NULL, '2026-03-01'::date),

-- CARD 19: POSB Everyday Card (0.4 mpd)
('00000000-0000-0000-0002-000000000019', 'bills', 0.4, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 20: UOB Preferred Platinum Visa (0.4 mpd)
('00000000-0000-0000-0002-000000000020', 'bills', 0.4, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 21: Maybank World Mastercard (0.4 mpd)
('00000000-0000-0000-0003-000000000021', 'bills', 0.4, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 22: UOB Visa Signature (0.4 mpd)
('00000000-0000-0000-0003-000000000022', 'bills', 0.4, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 23: DBS Vantage Visa Infinite (1.5 mpd)
('00000000-0000-0000-0004-000000000023', 'bills', 1.5, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 24: OCBC Voyage Card (1.3 mpd)
('00000000-0000-0000-0004-000000000024', 'bills', 1.3, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 25: SC Journey Card (1.2 mpd)
('00000000-0000-0000-0004-000000000025', 'bills', 1.2, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 26: SC Beyond Card (1.5 mpd)
('00000000-0000-0000-0004-000000000026', 'bills', 1.5, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 27: HSBC Premier Mastercard (1.4 mpd)
('00000000-0000-0000-0004-000000000027', 'bills', 1.4, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 28: Maybank XL Rewards (0.4 mpd)
('00000000-0000-0000-0004-000000000028', 'bills', 0.4, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- CARD 29: UOB Lady's Solitaire (0.4 mpd)
('00000000-0000-0000-0004-000000000029', 'bills', 0.4, FALSE, '{"subcategory": "pharmacy"}',
 'Standalone pharmacies (Guardian, Watsons, Unity — MCC 5912) earn base rate. Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (government) = 0 mpd. Tip: Check if your pharmacy is standalone or hospital-linked before paying.',
 NULL, '2026-03-01'::date),

-- ============================================================
-- TELCO subcategory — base rate fallback for all 29 cards
-- NOTE: Cards 6, 10, 18, 20 already have bills is_bonus=TRUE rows for telco
-- (added in Section 3 / FIX 6 v1.6.0 with effective_from = CURRENT_DATE).
-- These rows are is_bonus=FALSE base fallback rows, effective_from='2026-03-01'.
-- They will NOT conflict with the FIX 6 bonus rows (different is_bonus value).
-- ============================================================

-- CARD 1: DBS Altitude Visa (1.2 mpd)
('00000000-0000-0000-0001-000000000001', 'bills', 1.2, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 2: Citi PremierMiles Visa (1.2 mpd)
('00000000-0000-0000-0001-000000000002', 'bills', 1.2, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 3: UOB PRVI Miles Visa (1.4 mpd)
('00000000-0000-0000-0001-000000000003', 'bills', 1.4, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 4: OCBC 90N Visa (1.2 mpd)
('00000000-0000-0000-0001-000000000004', 'bills', 1.2, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 5: KrisFlyer UOB Credit Card (1.2 mpd)
('00000000-0000-0000-0001-000000000005', 'bills', 1.2, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 6: HSBC Revolution (0.4 mpd base — 4 mpd bonus for one-off online in FIX 6)
('00000000-0000-0000-0001-000000000006', 'bills', 0.4, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 7: Amex KrisFlyer Ascend (1.1 mpd)
('00000000-0000-0000-0001-000000000007', 'bills', 1.1, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 8: BOC Elite Miles World Mastercard (1.5 mpd)
('00000000-0000-0000-0001-000000000008', 'bills', 1.5, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 9: SC Visa Infinite (1.4 mpd)
('00000000-0000-0000-0001-000000000009', 'bills', 1.4, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 10: DBS Woman's World Card (0.4 mpd base — 4 mpd bonus for one-off online in FIX 6)
('00000000-0000-0000-0001-000000000010', 'bills', 0.4, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 11: UOB Lady's Card (0.4 mpd)
('00000000-0000-0000-0002-000000000011', 'bills', 0.4, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 12: OCBC Titanium Rewards (0.4 mpd)
('00000000-0000-0000-0002-000000000012', 'bills', 0.4, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 13: HSBC TravelOne (1.0 mpd)
('00000000-0000-0000-0002-000000000013', 'bills', 1.0, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 14: Amex KrisFlyer Credit Card (1.1 mpd)
('00000000-0000-0000-0002-000000000014', 'bills', 1.1, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 15: SC X Card (0.4 mpd)
('00000000-0000-0000-0002-000000000015', 'bills', 0.4, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 16: Maybank Horizon Visa Signature (0.4 mpd)
('00000000-0000-0000-0002-000000000016', 'bills', 0.4, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 17: Maybank FC Barcelona (0.4 mpd)
('00000000-0000-0000-0002-000000000017', 'bills', 0.4, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 18: Citi Rewards (0.4 mpd base — 4 mpd bonus for one-off online in FIX 6)
('00000000-0000-0000-0002-000000000018', 'bills', 0.4, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 19: POSB Everyday Card (0.4 mpd)
('00000000-0000-0000-0002-000000000019', 'bills', 0.4, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 20: UOB Preferred Platinum Visa (0.4 mpd base — 4 mpd bonus for one-off online in FIX 6)
('00000000-0000-0000-0002-000000000020', 'bills', 0.4, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 21: Maybank World Mastercard (0.4 mpd)
('00000000-0000-0000-0003-000000000021', 'bills', 0.4, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 22: UOB Visa Signature (0.4 mpd)
('00000000-0000-0000-0003-000000000022', 'bills', 0.4, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 23: DBS Vantage Visa Infinite (1.5 mpd)
('00000000-0000-0000-0004-000000000023', 'bills', 1.5, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 24: OCBC Voyage Card (1.3 mpd)
('00000000-0000-0000-0004-000000000024', 'bills', 1.3, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 25: SC Journey Card (1.2 mpd)
('00000000-0000-0000-0004-000000000025', 'bills', 1.2, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 26: SC Beyond Card (1.5 mpd)
('00000000-0000-0000-0004-000000000026', 'bills', 1.5, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 27: HSBC Premier Mastercard (1.4 mpd)
('00000000-0000-0000-0004-000000000027', 'bills', 1.4, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 28: Maybank XL Rewards (0.4 mpd)
('00000000-0000-0000-0004-000000000028', 'bills', 0.4, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date),

-- CARD 29: UOB Lady's Solitaire (0.4 mpd)
('00000000-0000-0000-0004-000000000029', 'bills', 0.4, FALSE, '{"subcategory": "telco"}',
 'Telco bills (Singtel, StarHub, M1) earn base rate when charged via GIRO/recurring debit. One-off online payments may earn higher rate on select cards.',
 NULL, '2026-03-01'::date)

ON CONFLICT (card_id, category_id, is_bonus, effective_from) DO UPDATE SET
  earn_rate_mpd   = EXCLUDED.earn_rate_mpd,
  conditions      = EXCLUDED.conditions,
  conditions_note = EXCLUDED.conditions_note,
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
  ('00000000-0000-0000-0001-000000000006', NULL, 1500.00, 'spend',
   'Revo Up promo cap $1,500/month across dining, online, transport bonus categories. Valid to 31 Mar 2026 — reverts to $1,000/month after. [VERIFIED from MileLion 2026]'),

  -- CARD 7: Amex KrisFlyer Ascend
  ('00000000-0000-0000-0001-000000000007', 'dining',    2500.00, 'spend',
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
  ('00000000-0000-0000-0002-000000000020', NULL, 1000.00, 'spend',
   'Combined cap across dining, transport, online (10X UNI$). Min spend $600/month to qualify for 10X. [VERIFIED from MileLion 2026]'),

  -- =============================================
  -- BATCH 3 CAPS
  -- =============================================

  -- CARD 21: Maybank World Mastercard — No cap (uncapped petrol is the key differentiator)

  -- CARD 22: UOB Visa Signature
  ('00000000-0000-0000-0003-000000000022', NULL, 1200.00, 'spend',
   'Combined cap across all bonus categories (petrol + contactless spend). $1,200/month shared. [VERIFIED from UOB website]'),

  -- =============================================
  -- BATCH 4 CAPS
  -- =============================================

  -- CARD 23: DBS Vantage Visa Infinite — No cap (flat rate with min spend condition)
  -- CARD 24: OCBC Voyage Card — No cap (flat rate, uncapped)

  -- CARD 25: SC Journey Card
  ('00000000-0000-0000-0004-000000000025', NULL, 1000.00, 'spend',
   'Combined cap across online transport and grocery delivery bonus categories. $1,000/month shared. [VERIFIED from SC website]'),

  -- CARD 26: SC Beyond Card — No cap (flat rate, uncapped)
  -- CARD 27: HSBC Premier Mastercard — No cap (flat rate, uncapped)

  -- CARD 28: Maybank XL Rewards
  ('00000000-0000-0000-0004-000000000028', NULL, 1000.00, 'spend',
   'Combined cap across dining, online shopping, and travel bonus categories. $1,000/month shared. Age 21-39 only. 1-year points expiry. [VERIFIED from Maybank website]'),

  -- CARD 29: UOB Lady's Solitaire
  ('00000000-0000-0000-0004-000000000029', NULL, 1500.00, 'spend',
   'Combined cap across 2 chosen bonus categories. $1,500/month shared ($750 per category). [VERIFIED from UOB website]')

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
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from UNI$ earning.'),
  ('00000000-0000-0000-0001-000000000003', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),

  -- CARD 4: OCBC 90N Visa
  ('00000000-0000-0000-0001-000000000004', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from OCBC$ earning.'),

  -- CARD 5: KrisFlyer UOB Credit Card
  ('00000000-0000-0000-0001-000000000005', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from KrisFlyer miles earning.'),
  ('00000000-0000-0000-0001-000000000005', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance payments excluded.'),
  -- NOTE: KrisFlyer UOB earns base rate 1.2 mpd on petrol — no MCC exclusion confirmed.
  -- Petrol MCC 5541/5542 is not in UOB official exclusion list for this card. Removed [ESTIMATED] entry.

  -- CARD 6: HSBC Revolution
  ('00000000-0000-0000-0001-000000000006', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from bonus.'),
  ('00000000-0000-0000-0001-000000000006', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),
  ('00000000-0000-0000-0001-000000000006', 'dining',
   ARRAY['5814'],
   '{}',
   'Fast food restaurants (MCC 5814) excluded from 10X bonus on HSBC Revolution. Per MileLion analysis, fast food coded under MCC 5814 does not earn 4 mpd. [F32 — Condition Transparency]'),
  ('00000000-0000-0000-0001-000000000006', 'groceries',
   ARRAY['5411', '5499'],
   '{}',
   'Supermarkets (MCC 5411) and miscellaneous food stores (MCC 5499) excluded from Revolution 4 mpd bonus from 1 May 2024. Earn base 0.4 mpd. [VERIFIED from HSBC May 2024 update]'),

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
   ARRAY['8211', '8220', '8241', '8244', '8249', '8299'],
   '{"payment_type": "education"}',
   'School fees and educational payments excluded from UNI$ earning. UOB excluded education pre-2020. [VERIFIED from UOB T&Cs]'),

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
   ARRAY['4900'],
   '{"payment_type": "utility"}',
   'Utility payments (MCC 4900) earn 0 mpd. SC excluded utilities from 3 Sep 2024. [VERIFIED from SC Sep 2024 MCC update]'),

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
  -- NOTE: Fast food delivery MCC ambiguity removed — no specific MCC exclusion confirmed for UOB PPV dining.
  -- Delivery apps like Grab Food, foodpanda typically code as MCC 5812 (dining) and earn 4 mpd normally.

  -- =============================================
  -- BATCH 3 EXCLUSIONS
  -- =============================================

  -- CARD 21: Maybank World Mastercard
  ('00000000-0000-0000-0003-000000000021', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from TreatsPoints earning.'),
  ('00000000-0000-0000-0003-000000000021', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),

  -- CARD 22: UOB Visa Signature
  ('00000000-0000-0000-0003-000000000022', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from UNI$ earning.'),
  ('00000000-0000-0000-0003-000000000022', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),

  -- =============================================
  -- BATCH 4 EXCLUSIONS
  -- =============================================

  -- CARD 23: DBS Vantage Visa Infinite
  ('00000000-0000-0000-0004-000000000023', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from DBS Points earning.'),
  ('00000000-0000-0000-0004-000000000023', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),

  -- CARD 24: OCBC Voyage Card
  ('00000000-0000-0000-0004-000000000024', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from VOYAGE Miles earning.'),
  ('00000000-0000-0000-0004-000000000024', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),

  -- CARD 25: SC Journey Card
  ('00000000-0000-0000-0004-000000000025', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from 360 reward points earning.'),
  ('00000000-0000-0000-0004-000000000025', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),

  -- CARD 26: SC Beyond Card
  ('00000000-0000-0000-0004-000000000026', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from 360 reward points earning.'),
  ('00000000-0000-0000-0004-000000000026', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),

  -- CARD 27: HSBC Premier Mastercard
  ('00000000-0000-0000-0004-000000000027', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from HSBC rewards earning.'),
  ('00000000-0000-0000-0004-000000000027', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),

  -- CARD 28: Maybank XL Rewards
  ('00000000-0000-0000-0004-000000000028', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from TreatsPoints earning.'),
  ('00000000-0000-0000-0004-000000000028', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),

  -- CARD 29: UOB Lady's Solitaire
  ('00000000-0000-0000-0004-000000000029', NULL,
   ARRAY['9311', '9222', '9211', '9399'],
   '{"payment_type": "government"}',
   'Government payments excluded from UNI$ earning.'),
  ('00000000-0000-0000-0004-000000000029', NULL,
   ARRAY['6300', '6381', '6399'],
   '{"payment_type": "insurance"}',
   'Insurance premium payments excluded.'),

  -- ============================================================
  -- PHASE 2 ADDITIONS: Missing exclusions for all 29 cards
  -- Added: 2026-03-01 (MileLion 2026 gap analysis)
  -- ============================================================

  -- -------------------------------------------------------
  -- UTILITIES (MCC 4900) — Added to all cards that now show 0 mpd
  -- (All major banks exclude utilities; Maybank excluded from 1 Dec 2025)
  -- -------------------------------------------------------
  ('00000000-0000-0000-0001-000000000001', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities (SP Services, Geneco) earn 0 mpd. DBS excludes MCC 4900. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000002', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. Citi excludes MCC 4900. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000003', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. UOB excluded MCC 4900 from 1 Aug 2022. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000004', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. OCBC excludes MCC 4900. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000005', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. UOB excluded MCC 4900 from 1 Aug 2022. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000006', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. HSBC excludes MCC 4900. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000007', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. Amex excludes MCC 4900. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000008', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. BOC excludes MCC 4900. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000009', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. SC excluded MCC 4900 from 3 Sep 2024. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000010', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. DBS excludes MCC 4900. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000011', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. UOB excluded MCC 4900 from 1 Aug 2022. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000012', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. OCBC excludes MCC 4900. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000013', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. HSBC excludes MCC 4900. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000014', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. Amex excludes MCC 4900. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000015', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. SC excluded MCC 4900 from 3 Sep 2024. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000016', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. Maybank excluded MCC 4900 from 1 Dec 2025. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000017', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. Maybank excluded MCC 4900 from 1 Dec 2025. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000018', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. Citi excludes MCC 4900. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000019', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. DBS/POSB excludes MCC 4900. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000020', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. UOB excluded MCC 4900 from 1 Aug 2022. [VERIFIED]'),
  ('00000000-0000-0000-0003-000000000021', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. Maybank excluded MCC 4900 from 1 Dec 2025. [VERIFIED]'),
  ('00000000-0000-0000-0003-000000000022', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. UOB excluded MCC 4900 from 1 Aug 2022. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000023', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. DBS excludes MCC 4900. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000024', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. OCBC excludes MCC 4900. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000025', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. SC excluded MCC 4900 from 3 Sep 2024. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000026', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. SC excluded MCC 4900 from 3 Sep 2024. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000027', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. HSBC excludes MCC 4900. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000028', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. Maybank excluded MCC 4900 from 1 Dec 2025. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000029', NULL, ARRAY['4900'], '{"payment_type": "utility"}', 'Utilities earn 0 mpd. UOB excluded MCC 4900 from 1 Aug 2022. [VERIFIED]'),

  -- -------------------------------------------------------
  -- HOSPITALS (MCC 8062) — Most banks exclude; exceptions noted
  -- -------------------------------------------------------
  ('00000000-0000-0000-0001-000000000001', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. DBS excluded MCC 8062 from 1 Dec 2025. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000002', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. Citi excluded MCC 8062 from 17 Jan 2024 (except ULTIMA). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000003', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. UOB excluded MCC 8062 from 1 Feb 2021. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000004', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. OCBC excluded MCC 8062 from Apr 2021. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000005', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. UOB excluded MCC 8062 from 1 Feb 2021. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000006', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. HSBC excludes MCC 8062. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000007', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Public hospital bills earn 0 mpd (Amex excludes public hospitals from Oct 2022). Private hospitals still earn 1.1 mpd base rate. Tip: HealthHub app payments code as MCC 8099 and may earn on select cards. [VERIFIED — Amex partial exclusion]'),
  ('00000000-0000-0000-0001-000000000008', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. BOC excludes MCC 8062. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000009', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. SC excluded MCC 8062 from 3 Sep 2024. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000010', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. DBS excluded MCC 8062 from 1 Dec 2025. Tip: Paying via HealthHub/Health Buddy app → MCC 8099 → earns 4 mpd on DBS WWMC. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000011', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. UOB excluded MCC 8062 from 1 Feb 2021. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000012', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. OCBC excluded MCC 8062 from Apr 2021. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000013', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. HSBC excludes MCC 8062. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000014', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Public hospital bills earn 0 mpd (Amex excludes from Oct 2022). Private hospitals still earn 1.1 mpd base rate. [VERIFIED — Amex partial exclusion]'),
  ('00000000-0000-0000-0002-000000000015', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. SC excluded MCC 8062 from 3 Sep 2024. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000018', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. Citi excluded MCC 8062 from 17 Jan 2024. Tip: Paying via HealthHub app → MCC 8099 → earns 4 mpd on Citi Rewards. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000019', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. DBS excluded MCC 8062 from 1 Dec 2025. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000020', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. UOB excluded MCC 8062 from 1 Feb 2021. [VERIFIED]'),
  ('00000000-0000-0000-0003-000000000022', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. UOB excluded MCC 8062 from 1 Feb 2021. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000023', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. DBS excluded MCC 8062 from 1 Dec 2025. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000024', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills: OCBC Voyage still earns at PRIVATE hospitals (Gleneagles, Mount E, Parkway, etc.). Public hospitals (MCC 8062) excluded from OCBC Voyage from Apr 2021. [VERIFIED — Voyage exception]'),
  ('00000000-0000-0000-0004-000000000025', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. SC excluded MCC 8062 from 3 Sep 2024. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000026', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. SC excluded MCC 8062 from 3 Sep 2024. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000027', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. HSBC excludes MCC 8062. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000029', NULL, ARRAY['8062'], '{"payment_type": "hospital"}', 'Hospital bills earn 0 mpd. UOB excluded MCC 8062 from 1 Feb 2021. [VERIFIED]'),
  -- NOTE: Cards 16, 17, 21, 28 (Maybank) — hospital exclusion unverified for all Maybank card variants; omitted pending Maybank T&C confirmation.

  -- -------------------------------------------------------
  -- EDUCATION (MCCs 8211, 8220, 8241, 8244, 8249, 8299)
  -- Excluded by DBS, Citi, UOB, OCBC, HSBC, SC, BOC, Amex — NOT Maybank
  -- -------------------------------------------------------
  ('00000000-0000-0000-0001-000000000001', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. DBS excludes education MCCs. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000002', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. Citi excluded education from Oct 2018. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000003', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. UOB excluded education from Sep 2019. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000004', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. OCBC excludes education MCCs. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000005', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. UOB excluded education from Sep 2019. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000006', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. HSBC excludes education MCCs from Jul 2020. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000007', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. Amex excludes education MCCs. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000008', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. BOC excludes education MCCs. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000009', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. SC excluded education from May 2020. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000010', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. DBS excludes education MCCs. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000012', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. OCBC excludes education MCCs. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000013', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. HSBC excludes education MCCs from Jul 2020. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000014', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. Amex excludes education MCCs. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000015', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. SC excluded education from May 2020. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000018', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. Citi excluded education from Oct 2018. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000019', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. DBS/POSB excludes education MCCs. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000020', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. UOB excluded education from Sep 2019. [VERIFIED]'),
  ('00000000-0000-0000-0003-000000000022', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. UOB excluded education from Sep 2019. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000023', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. DBS excludes education MCCs. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000024', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. OCBC excludes education MCCs. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000025', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. SC excluded education from May 2020. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000026', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. SC excluded education from May 2020. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000027', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. HSBC excludes education MCCs from Jul 2020. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000029', NULL, ARRAY['8211','8220','8241','8244','8249','8299'], '{"payment_type": "education"}', 'School fees earn 0 mpd. UOB excluded education from Sep 2019. [VERIFIED]'),
  -- NOTE: Cards 11, 28 (UOB Lady's, Maybank XL) — UOB Lady's already has education exclusion (updated above). Maybank education status unverified — omitted.

  -- -------------------------------------------------------
  -- QUASI-CASH / GRABPAY TOP-UPS (MCC 6540, 6529, 6530, 6534)
  -- Excluded by ALL banks — single most common user surprise
  -- -------------------------------------------------------
  ('00000000-0000-0000-0001-000000000001', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay wallet top-ups and stored value loads earn 0 mpd (MCC 6540). Downstream GrabPay merchant spend earns normally. [VERIFIED — all banks]'),
  ('00000000-0000-0000-0002-000000000002', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups and stored value loads earn 0 mpd. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000003', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups and stored value loads earn 0 UNI$. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000004', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups and stored value loads earn 0 OCBC$. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000005', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 KrisFlyer miles. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000006', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 HSBC Reward Points. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000007', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 KrisFlyer miles. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000008', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 BOC Bonus Points. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000009', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 SC 360 Points. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000010', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 DBS Points. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000011', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 UNI$. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000012', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 OCBC$. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000013', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 HSBC Reward Points. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000014', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 KrisFlyer miles. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000015', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 SC 360 Points. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000016', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 TreatsPoints. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000017', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 TreatsPoints. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000018', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 ThankYou Points. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000019', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 DBS Points. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000020', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 UNI$. [VERIFIED]'),
  ('00000000-0000-0000-0003-000000000021', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 TreatsPoints. [VERIFIED]'),
  ('00000000-0000-0000-0003-000000000022', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 UNI$. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000023', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 DBS Points. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000024', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 VOYAGE Miles. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000025', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 SC 360 Points. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000026', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 SC 360 Points. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000027', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 HSBC Reward Points. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000028', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 TreatsPoints. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000029', NULL, ARRAY['6540','6529','6530','6534'], '{"payment_type": "quasi_cash"}', 'GrabPay top-ups earn 0 UNI$. [VERIFIED]'),

  -- -------------------------------------------------------
  -- PARKING (MCC 7523) — UOB (Feb 21), DBS (Dec 25), Citi, OCBC, HSBC, SC, BOC (Jul 25), Maybank (Jul 25)
  -- -------------------------------------------------------
  ('00000000-0000-0000-0001-000000000001', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking (Parking.sg, HDB parking) earn 0 mpd. DBS excluded MCC 7523 from 1 Dec 2025. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000002', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 mpd. Citi excludes MCC 7523. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000003', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 UNI$. UOB excluded MCC 7523 from 1 Feb 2021. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000004', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 OCBC$. OCBC excludes MCC 7523. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000005', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 KrisFlyer miles. UOB excluded MCC 7523 from 1 Feb 2021. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000006', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 HSBC Reward Points. HSBC excludes MCC 7523. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000008', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 BOC Bonus Points. BOC excluded MCC 7523 from 1 Jul 2025. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000009', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 SC 360 Points. SC excludes MCC 7523. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000010', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 DBS Points. DBS excluded MCC 7523 from 1 Dec 2025. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000011', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 UNI$. UOB excluded MCC 7523 from 1 Feb 2021. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000012', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 OCBC$. OCBC excludes MCC 7523. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000013', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 HSBC Reward Points. HSBC excludes MCC 7523. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000015', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 SC 360 Points. SC excludes MCC 7523. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000016', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 TreatsPoints. Maybank excluded MCC 7523 from 1 Jul 2025. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000018', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 ThankYou Points. Citi excludes MCC 7523. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000019', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 DBS Points. DBS excluded MCC 7523 from 1 Dec 2025. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000020', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 UNI$. UOB excluded MCC 7523 from 1 Feb 2021. [VERIFIED]'),
  ('00000000-0000-0000-0003-000000000021', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 TreatsPoints. Maybank excluded MCC 7523 from 1 Jul 2025. [VERIFIED]'),
  ('00000000-0000-0000-0003-000000000022', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 UNI$. UOB excluded MCC 7523 from 1 Feb 2021. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000023', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 DBS Points. DBS excluded MCC 7523 from 1 Dec 2025. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000025', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 SC 360 Points. SC excludes MCC 7523. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000026', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 SC 360 Points. SC excludes MCC 7523. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000027', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 HSBC Reward Points. HSBC excludes MCC 7523. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000028', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 TreatsPoints. Maybank excluded MCC 7523 from 1 Jul 2025. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000029', NULL, ARRAY['7523'], '{"payment_type": "parking"}', 'Parking earn 0 UNI$. UOB excluded MCC 7523 from 1 Feb 2021. [VERIFIED]'),

  -- ============================================================
  -- EXCLUSIONS PHASE 2 (v1.7.0) — Lower Priority MCCs
  -- Added: 2026-03-01 (Sprint 27 completeness items)
  -- ============================================================

  -- -------------------------------------------------------
  -- MCC 4829 — Wire Transfer / Money Orders
  -- DBS, Citi, UOB, OCBC, HSBC, SC, BOC — pre-2020
  -- Amex and Maybank omitted — unconfirmed
  -- Cards: 1-15, 18-20, 22-27, 29
  -- -------------------------------------------------------
  ('00000000-0000-0000-0001-000000000001', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 mpd. DBS excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000002', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 mpd. Citi excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000003', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 UNI$. UOB excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000004', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 OCBC$. OCBC excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000005', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 KrisFlyer miles. UOB excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000006', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 HSBC Reward Points. HSBC excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000008', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 BOC Bonus Points. BOC excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000009', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 SC 360 Points. SC excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000010', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 DBS Points. DBS excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000011', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 UNI$. UOB excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000012', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 OCBC$. OCBC excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000013', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 HSBC Reward Points. HSBC excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000015', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 SC 360 Points. SC excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000018', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 ThankYou Points. Citi excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000019', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 DBS Points. DBS excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000020', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 UNI$. UOB excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0003-000000000022', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 UNI$. UOB excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000023', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 DBS Points. DBS excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000024', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 VOYAGE Miles. OCBC excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000025', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 SC 360 Points. SC excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000026', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 SC 360 Points. SC excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000027', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 HSBC Reward Points. HSBC excludes MCC 4829 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000029', NULL, ARRAY['4829'], '{"payment_type": "wire_transfer"}', 'Wire transfers and money orders earn 0 UNI$. UOB excludes MCC 4829 (pre-2020). [VERIFIED]'),
  -- NOTE: Cards 7 (Amex), 14 (Amex), 16-17 (Maybank), 21 (Maybank), 28 (Maybank) omitted — MCC 4829 exclusion unconfirmed for Amex/Maybank.

  -- -------------------------------------------------------
  -- MCC 6513 — Real Estate Agents
  -- DBS, Citi, UOB, OCBC, SC, BOC — not HSBC, Amex, Maybank
  -- Cards: 1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 18, 19, 20, 22, 23, 24, 25, 26, 29
  -- -------------------------------------------------------
  ('00000000-0000-0000-0001-000000000001', NULL, ARRAY['6513'], '{"payment_type": "real_estate"}', 'Real estate agent payments earn 0 mpd. DBS excludes MCC 6513 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000002', NULL, ARRAY['6513'], '{"payment_type": "real_estate"}', 'Real estate agent payments earn 0 mpd. Citi excludes MCC 6513 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000003', NULL, ARRAY['6513'], '{"payment_type": "real_estate"}', 'Real estate agent payments earn 0 UNI$. UOB excludes MCC 6513 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000004', NULL, ARRAY['6513'], '{"payment_type": "real_estate"}', 'Real estate agent payments earn 0 OCBC$. OCBC excludes MCC 6513 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000005', NULL, ARRAY['6513'], '{"payment_type": "real_estate"}', 'Real estate agent payments earn 0 KrisFlyer miles. UOB excludes MCC 6513 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000008', NULL, ARRAY['6513'], '{"payment_type": "real_estate"}', 'Real estate agent payments earn 0 BOC Bonus Points. BOC excludes MCC 6513 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000009', NULL, ARRAY['6513'], '{"payment_type": "real_estate"}', 'Real estate agent payments earn 0 SC 360 Points. SC excludes MCC 6513 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000010', NULL, ARRAY['6513'], '{"payment_type": "real_estate"}', 'Real estate agent payments earn 0 DBS Points. DBS excludes MCC 6513 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000011', NULL, ARRAY['6513'], '{"payment_type": "real_estate"}', 'Real estate agent payments earn 0 UNI$. UOB excludes MCC 6513 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000012', NULL, ARRAY['6513'], '{"payment_type": "real_estate"}', 'Real estate agent payments earn 0 OCBC$. OCBC excludes MCC 6513 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000015', NULL, ARRAY['6513'], '{"payment_type": "real_estate"}', 'Real estate agent payments earn 0 SC 360 Points. SC excludes MCC 6513 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000018', NULL, ARRAY['6513'], '{"payment_type": "real_estate"}', 'Real estate agent payments earn 0 ThankYou Points. Citi excludes MCC 6513 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000019', NULL, ARRAY['6513'], '{"payment_type": "real_estate"}', 'Real estate agent payments earn 0 DBS Points. DBS excludes MCC 6513 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000020', NULL, ARRAY['6513'], '{"payment_type": "real_estate"}', 'Real estate agent payments earn 0 UNI$. UOB excludes MCC 6513 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0003-000000000022', NULL, ARRAY['6513'], '{"payment_type": "real_estate"}', 'Real estate agent payments earn 0 UNI$. UOB excludes MCC 6513 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000023', NULL, ARRAY['6513'], '{"payment_type": "real_estate"}', 'Real estate agent payments earn 0 DBS Points. DBS excludes MCC 6513 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000024', NULL, ARRAY['6513'], '{"payment_type": "real_estate"}', 'Real estate agent payments earn 0 VOYAGE Miles. OCBC excludes MCC 6513 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000025', NULL, ARRAY['6513'], '{"payment_type": "real_estate"}', 'Real estate agent payments earn 0 SC 360 Points. SC excludes MCC 6513 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000026', NULL, ARRAY['6513'], '{"payment_type": "real_estate"}', 'Real estate agent payments earn 0 SC 360 Points. SC excludes MCC 6513 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000029', NULL, ARRAY['6513'], '{"payment_type": "real_estate"}', 'Real estate agent payments earn 0 UNI$. UOB excludes MCC 6513 (pre-2020). [VERIFIED]'),
  -- NOTE: Cards 6/13/27 (HSBC), 7/14 (Amex), 16/17/21/28 (Maybank) omitted — MCC 6513 exclusion unconfirmed for those banks.

  -- -------------------------------------------------------
  -- MCCs 6050, 6051 — Quasi-cash (crypto, financial institutions)
  -- All banks — pre-2020 — All 29 cards
  -- -------------------------------------------------------
  ('00000000-0000-0000-0001-000000000001', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions (incl. crypto exchanges) earn 0 mpd. MCC 6050/6051 excluded by all banks (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000002', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions (incl. crypto exchanges) earn 0 mpd. MCC 6050/6051 excluded by all banks (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000003', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions (incl. crypto exchanges) earn 0 UNI$. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000004', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 OCBC$. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000005', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 KrisFlyer miles. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000006', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 HSBC Reward Points. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000007', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 KrisFlyer miles. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000008', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 BOC Bonus Points. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000009', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 SC 360 Points. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000010', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 DBS Points. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000011', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 UNI$. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000012', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 OCBC$. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000013', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 HSBC Reward Points. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000014', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 KrisFlyer miles. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000015', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 SC 360 Points. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000016', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 TreatsPoints. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000017', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 TreatsPoints. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000018', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 ThankYou Points. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000019', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 DBS Points. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000020', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 UNI$. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0003-000000000021', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 TreatsPoints. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0003-000000000022', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 UNI$. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000023', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 DBS Points. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000024', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 VOYAGE Miles. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000025', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 SC 360 Points. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000026', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 SC 360 Points. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000027', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 HSBC Reward Points. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000028', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 TreatsPoints. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000029', NULL, ARRAY['6050','6051'], '{"payment_type": "quasi_cash_financial"}', 'Quasi-cash transactions at financial institutions earn 0 UNI$. MCC 6050/6051 excluded (pre-2020). [VERIFIED]'),

  -- -------------------------------------------------------
  -- MCC 6211 — Security Brokers / Dealers
  -- DBS, Citi, UOB, OCBC, SC, BOC — not HSBC, Amex, Maybank
  -- Same card list as MCC 6513 (real estate)
  -- -------------------------------------------------------
  ('00000000-0000-0000-0001-000000000001', NULL, ARRAY['6211'], '{"payment_type": "securities"}', 'Securities broker/dealer transactions earn 0 mpd. DBS excludes MCC 6211 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000002', NULL, ARRAY['6211'], '{"payment_type": "securities"}', 'Securities broker/dealer transactions earn 0 mpd. Citi excludes MCC 6211 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000003', NULL, ARRAY['6211'], '{"payment_type": "securities"}', 'Securities broker/dealer transactions earn 0 UNI$. UOB excludes MCC 6211 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000004', NULL, ARRAY['6211'], '{"payment_type": "securities"}', 'Securities broker/dealer transactions earn 0 OCBC$. OCBC excludes MCC 6211 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000005', NULL, ARRAY['6211'], '{"payment_type": "securities"}', 'Securities broker/dealer transactions earn 0 KrisFlyer miles. UOB excludes MCC 6211 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000008', NULL, ARRAY['6211'], '{"payment_type": "securities"}', 'Securities broker/dealer transactions earn 0 BOC Bonus Points. BOC excludes MCC 6211 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000009', NULL, ARRAY['6211'], '{"payment_type": "securities"}', 'Securities broker/dealer transactions earn 0 SC 360 Points. SC excludes MCC 6211 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000010', NULL, ARRAY['6211'], '{"payment_type": "securities"}', 'Securities broker/dealer transactions earn 0 DBS Points. DBS excludes MCC 6211 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000011', NULL, ARRAY['6211'], '{"payment_type": "securities"}', 'Securities broker/dealer transactions earn 0 UNI$. UOB excludes MCC 6211 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000012', NULL, ARRAY['6211'], '{"payment_type": "securities"}', 'Securities broker/dealer transactions earn 0 OCBC$. OCBC excludes MCC 6211 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000015', NULL, ARRAY['6211'], '{"payment_type": "securities"}', 'Securities broker/dealer transactions earn 0 SC 360 Points. SC excludes MCC 6211 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000018', NULL, ARRAY['6211'], '{"payment_type": "securities"}', 'Securities broker/dealer transactions earn 0 ThankYou Points. Citi excludes MCC 6211 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000019', NULL, ARRAY['6211'], '{"payment_type": "securities"}', 'Securities broker/dealer transactions earn 0 DBS Points. DBS excludes MCC 6211 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000020', NULL, ARRAY['6211'], '{"payment_type": "securities"}', 'Securities broker/dealer transactions earn 0 UNI$. UOB excludes MCC 6211 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0003-000000000022', NULL, ARRAY['6211'], '{"payment_type": "securities"}', 'Securities broker/dealer transactions earn 0 UNI$. UOB excludes MCC 6211 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000023', NULL, ARRAY['6211'], '{"payment_type": "securities"}', 'Securities broker/dealer transactions earn 0 DBS Points. DBS excludes MCC 6211 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000024', NULL, ARRAY['6211'], '{"payment_type": "securities"}', 'Securities broker/dealer transactions earn 0 VOYAGE Miles. OCBC excludes MCC 6211 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000025', NULL, ARRAY['6211'], '{"payment_type": "securities"}', 'Securities broker/dealer transactions earn 0 SC 360 Points. SC excludes MCC 6211 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000026', NULL, ARRAY['6211'], '{"payment_type": "securities"}', 'Securities broker/dealer transactions earn 0 SC 360 Points. SC excludes MCC 6211 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000029', NULL, ARRAY['6211'], '{"payment_type": "securities"}', 'Securities broker/dealer transactions earn 0 UNI$. UOB excludes MCC 6211 (pre-2020). [VERIFIED]'),
  -- NOTE: Cards 6/13/27 (HSBC), 7/14 (Amex), 16/17/21/28 (Maybank) omitted — MCC 6211 exclusion unconfirmed for those banks.

  -- -------------------------------------------------------
  -- MCCs 8398, 8651, 8661 — Charitable/Religious/Political Orgs
  -- All banks — pre-2020 — All 29 cards
  -- -------------------------------------------------------
  ('00000000-0000-0000-0001-000000000001', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 mpd. MCCs 8398/8651/8661 excluded by all banks (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000002', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 mpd. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000003', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 UNI$. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000004', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 OCBC$. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000005', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 KrisFlyer miles. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000006', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 HSBC Reward Points. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000007', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 KrisFlyer miles. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000008', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 BOC Bonus Points. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000009', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 SC 360 Points. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000010', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 DBS Points. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000011', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 UNI$. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000012', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 OCBC$. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000013', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 HSBC Reward Points. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000014', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 KrisFlyer miles. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000015', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 SC 360 Points. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000016', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 TreatsPoints. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000017', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 TreatsPoints. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000018', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 ThankYou Points. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000019', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 DBS Points. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000020', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 UNI$. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0003-000000000021', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 TreatsPoints. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0003-000000000022', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 UNI$. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000023', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 DBS Points. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000024', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 VOYAGE Miles. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000025', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 SC 360 Points. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000026', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 SC 360 Points. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000027', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 HSBC Reward Points. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000028', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 TreatsPoints. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000029', NULL, ARRAY['8398','8651','8661'], '{"payment_type": "charitable"}', 'Charitable, religious, and political organization payments earn 0 UNI$. MCCs 8398/8651/8661 excluded (pre-2020). [VERIFIED]'),

  -- -------------------------------------------------------
  -- MCC 7995 — Gambling (casino, lottery, betting)
  -- UOB, OCBC, HSBC, SC, BOC — NOT DBS, Citi, Amex, Maybank (unconfirmed for those)
  -- Cards: 3, 4, 5, 6, 8, 9, 11, 12, 13, 15, 20, 22, 24, 25, 26, 27, 29
  -- -------------------------------------------------------
  ('00000000-0000-0000-0001-000000000003', NULL, ARRAY['7995'], '{"payment_type": "gambling"}', 'Gambling transactions (casino, lottery, betting) earn 0 UNI$. UOB excludes MCC 7995 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000004', NULL, ARRAY['7995'], '{"payment_type": "gambling"}', 'Gambling transactions earn 0 OCBC$. OCBC excludes MCC 7995 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000005', NULL, ARRAY['7995'], '{"payment_type": "gambling"}', 'Gambling transactions earn 0 KrisFlyer miles. UOB excludes MCC 7995 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000006', NULL, ARRAY['7995'], '{"payment_type": "gambling"}', 'Gambling transactions earn 0 HSBC Reward Points. HSBC excludes MCC 7995 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000008', NULL, ARRAY['7995'], '{"payment_type": "gambling"}', 'Gambling transactions earn 0 BOC Bonus Points. BOC excludes MCC 7995 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000009', NULL, ARRAY['7995'], '{"payment_type": "gambling"}', 'Gambling transactions earn 0 SC 360 Points. SC excludes MCC 7995 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000011', NULL, ARRAY['7995'], '{"payment_type": "gambling"}', 'Gambling transactions earn 0 UNI$. UOB excludes MCC 7995 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000012', NULL, ARRAY['7995'], '{"payment_type": "gambling"}', 'Gambling transactions earn 0 OCBC$. OCBC excludes MCC 7995 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000013', NULL, ARRAY['7995'], '{"payment_type": "gambling"}', 'Gambling transactions earn 0 HSBC Reward Points. HSBC excludes MCC 7995 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000015', NULL, ARRAY['7995'], '{"payment_type": "gambling"}', 'Gambling transactions earn 0 SC 360 Points. SC excludes MCC 7995 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000020', NULL, ARRAY['7995'], '{"payment_type": "gambling"}', 'Gambling transactions earn 0 UNI$. UOB excludes MCC 7995 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0003-000000000022', NULL, ARRAY['7995'], '{"payment_type": "gambling"}', 'Gambling transactions earn 0 UNI$. UOB excludes MCC 7995 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000024', NULL, ARRAY['7995'], '{"payment_type": "gambling"}', 'Gambling transactions earn 0 VOYAGE Miles. OCBC excludes MCC 7995 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000025', NULL, ARRAY['7995'], '{"payment_type": "gambling"}', 'Gambling transactions earn 0 SC 360 Points. SC excludes MCC 7995 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000026', NULL, ARRAY['7995'], '{"payment_type": "gambling"}', 'Gambling transactions earn 0 SC 360 Points. SC excludes MCC 7995 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000027', NULL, ARRAY['7995'], '{"payment_type": "gambling"}', 'Gambling transactions earn 0 HSBC Reward Points. HSBC excludes MCC 7995 (pre-2020). [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000029', NULL, ARRAY['7995'], '{"payment_type": "gambling"}', 'Gambling transactions earn 0 UNI$. UOB excludes MCC 7995 (pre-2020). [VERIFIED]'),
  -- NOTE: Cards 1/2/10/19/23 (DBS/Citi), 7/14 (Amex), 16/17/21/28 (Maybank) omitted — MCC 7995 exclusion unconfirmed for those banks.

  -- -------------------------------------------------------
  -- MCC 7349 — Cleaning / Janitorial Services (Urban Company, Helpling)
  -- DBS (Dec 2025), UOB, OCBC, HSBC, SC, Maybank (Dec 2025), BOC (Jul 2025)
  -- Cards: 1, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 15, 16, 17, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29
  -- -------------------------------------------------------
  -- DBS cards (excluded from Dec 2025)
  ('00000000-0000-0000-0001-000000000001', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 mpd. DBS excluded MCC 7349 from 1 Dec 2025. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000010', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 DBS Points. DBS excluded MCC 7349 from 1 Dec 2025. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000019', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 DBS Points. DBS excluded MCC 7349 from 1 Dec 2025. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000023', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 DBS Points. DBS excluded MCC 7349 from 1 Dec 2025. [VERIFIED]'),
  -- UOB cards
  ('00000000-0000-0000-0001-000000000003', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 UNI$. UOB excludes MCC 7349. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000005', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 KrisFlyer miles. UOB excludes MCC 7349. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000011', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 UNI$. UOB excludes MCC 7349. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000020', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 UNI$. UOB excludes MCC 7349. [VERIFIED]'),
  ('00000000-0000-0000-0003-000000000022', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 UNI$. UOB excludes MCC 7349. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000029', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 UNI$. UOB excludes MCC 7349. [VERIFIED]'),
  -- OCBC cards
  ('00000000-0000-0000-0001-000000000004', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 OCBC$. OCBC excludes MCC 7349. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000012', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 OCBC$. OCBC excludes MCC 7349. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000024', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 VOYAGE Miles. OCBC excludes MCC 7349. [VERIFIED]'),
  -- HSBC cards
  ('00000000-0000-0000-0001-000000000006', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 HSBC Reward Points. HSBC excludes MCC 7349. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000013', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 HSBC Reward Points. HSBC excludes MCC 7349. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000027', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 HSBC Reward Points. HSBC excludes MCC 7349. [VERIFIED]'),
  -- SC cards
  ('00000000-0000-0000-0001-000000000009', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 SC 360 Points. SC excludes MCC 7349. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000015', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 SC 360 Points. SC excludes MCC 7349. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000025', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 SC 360 Points. SC excludes MCC 7349. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000026', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 SC 360 Points. SC excludes MCC 7349. [VERIFIED]'),
  -- Maybank cards (excluded from Dec 2025)
  ('00000000-0000-0000-0002-000000000016', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 TreatsPoints. Maybank excluded MCC 7349 from 1 Dec 2025. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000017', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 TreatsPoints. Maybank excluded MCC 7349 from 1 Dec 2025. [VERIFIED]'),
  ('00000000-0000-0000-0003-000000000021', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 TreatsPoints. Maybank excluded MCC 7349 from 1 Dec 2025. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000028', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 TreatsPoints. Maybank excluded MCC 7349 from 1 Dec 2025. [VERIFIED]'),
  -- BOC card (excluded from Jul 2025)
  ('00000000-0000-0000-0001-000000000008', NULL, ARRAY['7349'], '{"payment_type": "cleaning"}', 'Cleaning/janitorial services (Urban Company, Helpling) earn 0 BOC Bonus Points. BOC excluded MCC 7349 from 1 Jul 2025. [VERIFIED]'),
  -- NOTE: Cards 2/18 (Citi), 7/14 (Amex) omitted — MCC 7349 exclusion not confirmed for Citi and Amex.

  -- -------------------------------------------------------
  -- MCC 5960 — Direct Marketing Insurance
  -- DBS, Citi, HSBC, BOC, Maybank
  -- Cards: 1, 2, 6, 8, 10, 13, 16, 17, 18, 19, 21, 23, 27, 28
  -- -------------------------------------------------------
  ('00000000-0000-0000-0001-000000000001', NULL, ARRAY['5960'], '{"payment_type": "insurance_direct_marketing"}', 'Direct marketing insurance payments earn 0 mpd. DBS excludes MCC 5960. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000002', NULL, ARRAY['5960'], '{"payment_type": "insurance_direct_marketing"}', 'Direct marketing insurance payments earn 0 mpd. Citi excludes MCC 5960. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000006', NULL, ARRAY['5960'], '{"payment_type": "insurance_direct_marketing"}', 'Direct marketing insurance payments earn 0 HSBC Reward Points. HSBC excludes MCC 5960. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000008', NULL, ARRAY['5960'], '{"payment_type": "insurance_direct_marketing"}', 'Direct marketing insurance payments earn 0 BOC Bonus Points. BOC excludes MCC 5960. [VERIFIED]'),
  ('00000000-0000-0000-0001-000000000010', NULL, ARRAY['5960'], '{"payment_type": "insurance_direct_marketing"}', 'Direct marketing insurance payments earn 0 DBS Points. DBS excludes MCC 5960. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000013', NULL, ARRAY['5960'], '{"payment_type": "insurance_direct_marketing"}', 'Direct marketing insurance payments earn 0 HSBC Reward Points. HSBC excludes MCC 5960. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000016', NULL, ARRAY['5960'], '{"payment_type": "insurance_direct_marketing"}', 'Direct marketing insurance payments earn 0 TreatsPoints. Maybank excludes MCC 5960. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000017', NULL, ARRAY['5960'], '{"payment_type": "insurance_direct_marketing"}', 'Direct marketing insurance payments earn 0 TreatsPoints. Maybank excludes MCC 5960. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000018', NULL, ARRAY['5960'], '{"payment_type": "insurance_direct_marketing"}', 'Direct marketing insurance payments earn 0 ThankYou Points. Citi excludes MCC 5960. [VERIFIED]'),
  ('00000000-0000-0000-0002-000000000019', NULL, ARRAY['5960'], '{"payment_type": "insurance_direct_marketing"}', 'Direct marketing insurance payments earn 0 DBS Points. DBS excludes MCC 5960. [VERIFIED]'),
  ('00000000-0000-0000-0003-000000000021', NULL, ARRAY['5960'], '{"payment_type": "insurance_direct_marketing"}', 'Direct marketing insurance payments earn 0 TreatsPoints. Maybank excludes MCC 5960. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000023', NULL, ARRAY['5960'], '{"payment_type": "insurance_direct_marketing"}', 'Direct marketing insurance payments earn 0 DBS Points. DBS excludes MCC 5960. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000027', NULL, ARRAY['5960'], '{"payment_type": "insurance_direct_marketing"}', 'Direct marketing insurance payments earn 0 HSBC Reward Points. HSBC excludes MCC 5960. [VERIFIED]'),
  ('00000000-0000-0000-0004-000000000028', NULL, ARRAY['5960'], '{"payment_type": "insurance_direct_marketing"}', 'Direct marketing insurance payments earn 0 TreatsPoints. Maybank excludes MCC 5960. [VERIFIED]');
  -- NOTE: Cards 3/5/11/20/22/29 (UOB), 4/12/24 (OCBC), 7/14 (Amex), 9/15/25/26 (SC) omitted — MCC 5960 exclusion not confirmed for those banks.


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
