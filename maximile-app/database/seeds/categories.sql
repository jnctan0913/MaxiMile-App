-- =============================================================================
-- MaxiMile — Category Taxonomy & MCC Mappings (categories.sql)
-- =============================================================================
-- Description: Seed data for the 7 fixed spend categories.
--              MCC codes sourced from Visa/Mastercard merchant category lists
--              and Singapore bank T&Cs.
--
-- Author:  Data Engineer Agent
-- Created: 2026-02-19
-- =============================================================================

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

-- 5. Bills
(
  'bills',
  'Bills',
  5,
  'receipt',
  ARRAY[
    '4812',  -- Telecommunication Equipment and Telephone Sales
    '4814',  -- Telecommunication Services (Singtel, Starhub, M1)
    '4899',  -- Cable, Satellite, Pay Television, Radio
    '4900',  -- Utilities — Electric, Gas, Water, Sanitary
    '6300',  -- Insurance Sales, Underwriting, Premiums
    '6381',  -- Insurance Premiums (no longer categorized)
    '6399',  -- Insurance — Not Elsewhere Classified
    '4816'   -- Computer Network / Information Services (ISPs)
  ],
  'Utilities, insurance, telco, recurring payments'
),

-- 6. Travel / Hotels
(
  'travel',
  'Travel',
  6,
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

-- 7. General / Others (catch-all)
(
  'general',
  'General',
  7,
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
