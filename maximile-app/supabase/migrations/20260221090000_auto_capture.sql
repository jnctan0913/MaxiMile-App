-- =============================================================================
-- MaxiMile — Migration 019: Auto-Capture Infrastructure (Sprint 16 — F25)
-- =============================================================================
-- Description:  Adds the database layer for the Auto-Capture feature: merchant
--               pattern matching for automatic category detection, user-level
--               category overrides, Apple Wallet → MaxiMile card name mappings,
--               and the match_merchant() RPC.  Seeds 200+ common Singapore
--               merchant patterns across all 7 spending categories.
--
-- New objects:
--   Columns   — transactions.source (capture origin tracking)
--   Tables    — merchant_patterns, user_merchant_overrides, card_name_mappings
--   Functions — match_merchant(UUID, TEXT)
--   Indexes   — idx_merchant_patterns_trgm (GIN), idx_transactions_source
--   RLS       — merchant_patterns: public read
--               user_merchant_overrides: owner-only CRUD
--               card_name_mappings: owner-only CRUD
--   Seed      — 200+ Singapore merchant patterns (7 categories)
--
-- Prerequisites:
--   - 001_initial_schema.sql  (categories, cards, transactions, user_cards)
--   - 007_add_bills_category.sql (bills category)
--
-- Author:  Data Engineer + Software Engineer
-- Created: 2026-02-21
-- Sprint:  16 — Auto-Capture (F25)
-- =============================================================================

BEGIN;


-- ==========================================================================
-- SECTION 1: Add source column to transactions
-- ==========================================================================
-- Tracks how a transaction was captured: manual entry, Smart Pay shortcut,
-- iOS Shortcut, notification listener, or hybrid flows.

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual'
  CHECK (source IN (
    'manual',
    'smart_pay',
    'shortcut',
    'notification',
    'shortcut_smart_pay',
    'notification_smart_pay'
  ));

COMMENT ON COLUMN public.transactions.source
  IS 'How the transaction was captured: manual (default), smart_pay, shortcut, '
     'notification, shortcut_smart_pay, or notification_smart_pay.';


-- ==========================================================================
-- SECTION 2: merchant_patterns — Merchant-to-category keyword mapping
-- ==========================================================================
-- Public reference data mapping merchant name keywords/substrings to
-- spending categories.  Used by match_merchant() for auto-categorisation.

CREATE TABLE public.merchant_patterns (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern       TEXT          NOT NULL,
  category_id   TEXT          NOT NULL REFERENCES public.categories(id),
  confidence    NUMERIC(3,2)  DEFAULT 0.90 CHECK (confidence BETWEEN 0 AND 1),
  merchant_type TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT merchant_patterns_pattern_unique UNIQUE (pattern)
);

COMMENT ON TABLE  public.merchant_patterns
  IS 'Keyword-to-category mapping for merchant name auto-detection. '
     'Each pattern is an ILIKE substring matched against transaction merchant names.';
COMMENT ON COLUMN public.merchant_patterns.pattern
  IS 'Keyword or substring to match (e.g. ''COLD STORAGE'', ''GRAB'', ''SHELL''). '
     'Matched case-insensitively via ILIKE.';
COMMENT ON COLUMN public.merchant_patterns.confidence
  IS 'Match confidence score from 0.00 to 1.00. Higher = more reliable pattern.';
COMMENT ON COLUMN public.merchant_patterns.merchant_type
  IS 'Optional merchant sub-type (e.g. ''supermarket'', ''restaurant'', ''ride_hailing'').';


-- ==========================================================================
-- SECTION 3: user_merchant_overrides — Per-user category corrections
-- ==========================================================================
-- When a user corrects an auto-detected category, the override is stored
-- here and takes priority over merchant_patterns in match_merchant().

CREATE TABLE public.user_merchant_overrides (
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_pattern TEXT        NOT NULL,
  category_id      TEXT        NOT NULL REFERENCES public.categories(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id, merchant_pattern)
);

COMMENT ON TABLE  public.user_merchant_overrides
  IS 'User-level category corrections for merchant auto-detection. '
     'Overrides take priority over global merchant_patterns in match_merchant().';
COMMENT ON COLUMN public.user_merchant_overrides.merchant_pattern
  IS 'The merchant name pattern that was corrected by the user.';

CREATE TRIGGER user_merchant_overrides_updated_at
  BEFORE UPDATE ON public.user_merchant_overrides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ==========================================================================
-- SECTION 4: card_name_mappings — Apple Wallet → MaxiMile card mapping
-- ==========================================================================
-- Maps card names as displayed in Apple Wallet to MaxiMile card IDs.
-- Verified by the user (confidence = 1.0) during onboarding or first use.

CREATE TABLE public.card_name_mappings (
  user_id     UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_name TEXT          NOT NULL,
  card_id     UUID          NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  confidence  NUMERIC(3,2)  DEFAULT 1.0,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id, wallet_name)
);

COMMENT ON TABLE  public.card_name_mappings
  IS 'Maps Apple Wallet card names to MaxiMile card IDs. '
     'Verified by the user (confidence=1.0) during onboarding or first shortcut use.';
COMMENT ON COLUMN public.card_name_mappings.wallet_name
  IS 'Card name exactly as shown in Apple Wallet (e.g. ''DBS Altitude Visa Signature'').';
COMMENT ON COLUMN public.card_name_mappings.confidence
  IS '1.0 for user-verified mappings. Lower values reserved for future auto-detection.';


-- ==========================================================================
-- SECTION 5: Row Level Security — merchant_patterns (public read)
-- ==========================================================================

ALTER TABLE public.merchant_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY merchant_patterns_select ON public.merchant_patterns
  FOR SELECT
  TO anon, authenticated
  USING (true);


-- ==========================================================================
-- SECTION 6: Row Level Security — user_merchant_overrides (owner-only)
-- ==========================================================================

ALTER TABLE public.user_merchant_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_merchant_overrides_select ON public.user_merchant_overrides
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY user_merchant_overrides_insert ON public.user_merchant_overrides
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_merchant_overrides_update ON public.user_merchant_overrides
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_merchant_overrides_delete ON public.user_merchant_overrides
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ==========================================================================
-- SECTION 7: Row Level Security — card_name_mappings (owner-only)
-- ==========================================================================

ALTER TABLE public.card_name_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY card_name_mappings_select ON public.card_name_mappings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY card_name_mappings_insert ON public.card_name_mappings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY card_name_mappings_update ON public.card_name_mappings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY card_name_mappings_delete ON public.card_name_mappings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ==========================================================================
-- SECTION 8: RPC — match_merchant(p_user_id UUID, p_merchant_name TEXT)
-- ==========================================================================
-- Three-tier merchant matching:
--   1. User override (exact match)  → confidence 1.0, source 'user_override'
--   2. Global pattern (ILIKE)       → best confidence,  source 'pattern_match'
--   3. Default fallback             → confidence 0,     source 'default'

CREATE OR REPLACE FUNCTION public.match_merchant(
  p_user_id       UUID,
  p_merchant_name TEXT
)
RETURNS TABLE (
  category_id   TEXT,
  category_name TEXT,
  confidence    NUMERIC,
  source        TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Tier 1: Check user-level overrides (exact pattern match)
  RETURN QUERY
  SELECT
    umo.category_id,
    c.name,
    1.0::NUMERIC,
    'user_override'::TEXT
  FROM public.user_merchant_overrides umo
  JOIN public.categories c ON c.id = umo.category_id
  WHERE umo.user_id = p_user_id
    AND UPPER(p_merchant_name) LIKE '%' || UPPER(umo.merchant_pattern) || '%'
  LIMIT 1;

  IF FOUND THEN RETURN; END IF;

  -- Tier 2: Check global merchant_patterns (ILIKE substring match)
  RETURN QUERY
  SELECT
    mp.category_id,
    c.name,
    mp.confidence,
    'pattern_match'::TEXT
  FROM public.merchant_patterns mp
  JOIN public.categories c ON c.id = mp.category_id
  WHERE UPPER(p_merchant_name) LIKE '%' || UPPER(mp.pattern) || '%'
  ORDER BY mp.confidence DESC, length(mp.pattern) DESC
  LIMIT 1;

  IF FOUND THEN RETURN; END IF;

  -- Tier 3: Default fallback — 'general' category
  RETURN QUERY
  SELECT
    'general'::TEXT,
    c.name,
    0::NUMERIC,
    'default'::TEXT
  FROM public.categories c
  WHERE c.id = 'general'
  LIMIT 1;
END;
$$;

COMMENT ON FUNCTION public.match_merchant(UUID, TEXT)
  IS 'Three-tier merchant matching: (1) user override, (2) global pattern ILIKE, '
     '(3) ''general'' fallback. Returns category_id, category_name, confidence, and source.';

GRANT EXECUTE ON FUNCTION public.match_merchant(UUID, TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.match_merchant(UUID, TEXT) FROM anon;


-- ==========================================================================
-- SECTION 9: Performance indexes
-- ==========================================================================

-- GIN trigram index for fuzzy merchant pattern matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_merchant_patterns_trgm
  ON public.merchant_patterns
  USING GIN (pattern gin_trgm_ops);

-- Analytics index on transaction capture source
CREATE INDEX IF NOT EXISTS idx_transactions_source
  ON public.transactions (source);


-- ==========================================================================
-- SECTION 10: Seed data — 200+ Singapore merchant patterns
-- ==========================================================================
-- Idempotent: ON CONFLICT (pattern) DO NOTHING allows safe re-runs.

-- --------------------------------------------------------------------------
-- 10a. Dining (category_id: 'dining') — 70 patterns
-- --------------------------------------------------------------------------
INSERT INTO public.merchant_patterns (pattern, category_id, confidence, merchant_type) VALUES
  ('MCDONALDS',       'dining', 0.95, 'fast_food'),
  ('MCDONALD',        'dining', 0.95, 'fast_food'),
  ('BURGER KING',     'dining', 0.95, 'fast_food'),
  ('KFC',             'dining', 0.95, 'fast_food'),
  ('SUBWAY',          'dining', 0.90, 'fast_food'),
  ('STARBUCKS',       'dining', 0.95, 'cafe'),
  ('COFFEE BEAN',     'dining', 0.95, 'cafe'),
  ('TOAST BOX',       'dining', 0.95, 'cafe'),
  ('YA KUN',          'dining', 0.95, 'cafe'),
  ('KILLINEY',        'dining', 0.90, 'cafe'),
  ('SWENSEN',         'dining', 0.90, 'restaurant'),
  ('SAKAE SUSHI',     'dining', 0.95, 'restaurant'),
  ('SUSHI TEI',       'dining', 0.95, 'restaurant'),
  ('GENKI SUSHI',     'dining', 0.95, 'restaurant'),
  ('ITACHO',          'dining', 0.90, 'restaurant'),
  ('MARCHE',          'dining', 0.90, 'restaurant'),
  ('ASTONS',          'dining', 0.90, 'restaurant'),
  ('COLLIN',          'dining', 0.85, 'restaurant'),
  ('COLLINS',         'dining', 0.85, 'restaurant'),
  ('PASTAMANIA',      'dining', 0.95, 'restaurant'),
  ('PIZZA HUT',       'dining', 0.95, 'fast_food'),
  ('DOMINOS',         'dining', 0.95, 'fast_food'),
  ('DOMINO',          'dining', 0.90, 'fast_food'),
  ('NANDOS',          'dining', 0.95, 'restaurant'),
  ('NANDO',           'dining', 0.90, 'restaurant'),
  ('HANS',            'dining', 0.80, 'restaurant'),
  ('SWEE CHOON',      'dining', 0.95, 'restaurant'),
  ('DIN TAI FUNG',    'dining', 0.95, 'restaurant'),
  ('CRYSTAL JADE',    'dining', 0.95, 'restaurant'),
  ('SOUP SPOON',      'dining', 0.90, 'restaurant'),
  ('SOUP RESTAURANT', 'dining', 0.90, 'restaurant'),
  ('STUFF''D',        'dining', 0.90, 'fast_food'),
  ('GONG CHA',        'dining', 0.95, 'cafe'),
  ('LI HO',           'dining', 0.90, 'cafe'),
  ('TIGER SUGAR',     'dining', 0.95, 'cafe'),
  ('KOI',             'dining', 0.80, 'cafe'),
  ('JOLLIBEAN',       'dining', 0.90, 'cafe'),
  ('OLD CHANG KEE',   'dining', 0.95, 'fast_food'),
  ('BAN MIAN',        'dining', 0.85, 'hawker'),
  ('WINGSTOP',        'dining', 0.95, 'fast_food'),
  ('POPEYES',         'dining', 0.95, 'fast_food'),
  ('JOLLIBEE',        'dining', 0.95, 'fast_food'),
  ('FOUR LEAVES',     'dining', 0.90, 'bakery'),
  ('BREADTALK',       'dining', 0.95, 'bakery'),
  ('DELIFRANCE',      'dining', 0.90, 'bakery'),
  ('PARIS BAGUETTE',  'dining', 0.90, 'bakery'),
  ('CEDELE',          'dining', 0.90, 'cafe'),
  ('FOODPANDA',       'dining', 0.90, 'delivery'),
  ('GRABFOOD',        'dining', 0.90, 'delivery'),
  ('DELIVEROO',       'dining', 0.90, 'delivery'),
  ('BOON TONG KEE',   'dining', 0.90, 'restaurant'),
  ('JUMBO SEAFOOD',   'dining', 0.95, 'restaurant'),
  ('NO SIGNBOARD',    'dining', 0.90, 'restaurant'),
  ('LONG JOHN SILVER','dining', 0.95, 'fast_food'),
  ('MOS BURGER',      'dining', 0.95, 'fast_food'),
  ('IPPUDO',          'dining', 0.95, 'restaurant'),
  ('RAMEN',           'dining', 0.80, 'restaurant'),
  ('HAWKER',          'dining', 0.80, 'hawker'),
  ('KOPITIAM',        'dining', 0.90, 'hawker'),
  ('FOOD REPUBLIC',   'dining', 0.90, 'food_court'),
  ('KOUFU',           'dining', 0.90, 'food_court'),
  ('KIMLY',           'dining', 0.90, 'food_court'),
  ('ICHIBAN',         'dining', 0.85, 'restaurant'),
  ('THAI EXPRESS',    'dining', 0.90, 'restaurant'),
  ('PEPPER LUNCH',    'dining', 0.90, 'restaurant'),
  ('YOSHINOYA',       'dining', 0.90, 'fast_food'),
  ('AJISEN',          'dining', 0.90, 'restaurant'),
  ('MR BEAN',         'dining', 0.90, 'cafe'),
  ('LLAOLLAO',        'dining', 0.85, 'dessert'),
  ('GELARE',          'dining', 0.85, 'dessert')
ON CONFLICT (pattern) DO NOTHING;

-- --------------------------------------------------------------------------
-- 10b. Transport (category_id: 'transport') — 20 patterns
-- --------------------------------------------------------------------------
INSERT INTO public.merchant_patterns (pattern, category_id, confidence, merchant_type) VALUES
  ('GRAB',            'transport', 0.85, 'ride_hailing'),
  ('GRABCAR',         'transport', 0.95, 'ride_hailing'),
  ('GRABTAXI',        'transport', 0.95, 'ride_hailing'),
  ('GOJEK',           'transport', 0.95, 'ride_hailing'),
  ('COMFORT',         'transport', 0.85, 'taxi'),
  ('COMFORTDELGRO',   'transport', 0.95, 'taxi'),
  ('SMRT',            'transport', 0.90, 'public_transport'),
  ('EZ-LINK',         'transport', 0.95, 'public_transport'),
  ('EZLINK',          'transport', 0.95, 'public_transport'),
  ('NETS',            'transport', 0.80, 'payment'),
  ('TRANSITLINK',     'transport', 0.95, 'public_transport'),
  ('BUS',             'transport', 0.70, 'public_transport'),
  ('TAXI',            'transport', 0.85, 'taxi'),
  ('CDG',             'transport', 0.85, 'taxi'),
  ('BLUSG',           'transport', 0.90, 'car_sharing'),
  ('GETGO',           'transport', 0.90, 'car_sharing'),
  ('CARLITE',         'transport', 0.90, 'car_sharing'),
  ('TRIBECAR',        'transport', 0.90, 'car_sharing'),
  ('RYDE',            'transport', 0.90, 'ride_hailing'),
  ('TADA',            'transport', 0.90, 'ride_hailing')
ON CONFLICT (pattern) DO NOTHING;

-- --------------------------------------------------------------------------
-- 10c. Online Shopping (category_id: 'online') — 27 patterns
-- --------------------------------------------------------------------------
INSERT INTO public.merchant_patterns (pattern, category_id, confidence, merchant_type) VALUES
  ('SHOPEE',          'online', 0.95, 'marketplace'),
  ('LAZADA',          'online', 0.95, 'marketplace'),
  ('AMAZON',          'online', 0.90, 'marketplace'),
  ('QOOL',            'online', 0.85, 'marketplace'),
  ('EZBUY',           'online', 0.90, 'marketplace'),
  ('TAOBAO',          'online', 0.90, 'marketplace'),
  ('ALIEXPRESS',      'online', 0.90, 'marketplace'),
  ('ZALORA',          'online', 0.95, 'fashion'),
  ('ASOS',            'online', 0.90, 'fashion'),
  ('SHEIN',           'online', 0.90, 'fashion'),
  ('IHERB',           'online', 0.90, 'health'),
  ('BOOK DEPOSITORY', 'online', 0.90, 'books'),
  ('APPLE.COM',       'online', 0.90, 'digital'),
  ('GOOGLE PLAY',     'online', 0.95, 'digital'),
  ('SPOTIFY',         'online', 0.95, 'subscription'),
  ('NETFLIX',         'online', 0.95, 'subscription'),
  ('DISNEY+',         'online', 0.95, 'subscription'),
  ('YOUTUBE',         'online', 0.85, 'subscription'),
  ('APPLE MUSIC',     'online', 0.95, 'subscription'),
  ('ADOBE',           'online', 0.90, 'software'),
  ('MICROSOFT',       'online', 0.80, 'software'),
  ('STEAM',           'online', 0.90, 'gaming'),
  ('PLAYSTATION',     'online', 0.90, 'gaming'),
  ('NINTENDO',        'online', 0.90, 'gaming'),
  ('GRAB MART',       'online', 0.85, 'marketplace'),
  ('CAROUSELL',       'online', 0.85, 'marketplace'),
  ('EBAY',            'online', 0.90, 'marketplace')
ON CONFLICT (pattern) DO NOTHING;

-- --------------------------------------------------------------------------
-- 10d. Groceries (category_id: 'groceries') — 25 patterns
-- --------------------------------------------------------------------------
INSERT INTO public.merchant_patterns (pattern, category_id, confidence, merchant_type) VALUES
  ('NTUC',            'groceries', 0.95, 'supermarket'),
  ('FAIRPRICE',       'groceries', 0.95, 'supermarket'),
  ('FAIR PRICE',      'groceries', 0.95, 'supermarket'),
  ('COLD STORAGE',    'groceries', 0.95, 'supermarket'),
  ('GIANT',           'groceries', 0.90, 'supermarket'),
  ('SHENG SIONG',     'groceries', 0.95, 'supermarket'),
  ('PRIME',           'groceries', 0.70, 'supermarket'),
  ('REDMART',         'groceries', 0.95, 'online_grocery'),
  ('HAO MART',        'groceries', 0.90, 'convenience'),
  ('DON DON DONKI',   'groceries', 0.90, 'supermarket'),
  ('DONKI',           'groceries', 0.85, 'supermarket'),
  ('DAISO',           'groceries', 0.80, 'variety_store'),
  ('MUSTAFA',         'groceries', 0.80, 'department_store'),
  ('SCARLETT',        'groceries', 0.85, 'supermarket'),
  ('MARKET PLACE',    'groceries', 0.90, 'supermarket'),
  ('MEIDI-YA',        'groceries', 0.90, 'supermarket'),
  ('ISETAN SUPERMARKET', 'groceries', 0.90, 'supermarket'),
  ('RYAN''S GROCERY', 'groceries', 0.90, 'specialty'),
  ('LITTLE FARMS',    'groceries', 0.90, 'specialty'),
  ('THE BUTCHER',     'groceries', 0.85, 'specialty'),
  ('ZAIRYO',          'groceries', 0.90, 'specialty'),
  ('NATURE''S WONDERS','groceries', 0.85, 'snacks'),
  ('IRVINS',          'groceries', 0.85, 'snacks'),
  ('BEE CHENG HIANG', 'groceries', 0.85, 'snacks'),
  ('BENGAWAN SOLO',   'groceries', 0.85, 'bakery')
ON CONFLICT (pattern) DO NOTHING;

-- --------------------------------------------------------------------------
-- 10e. Petrol (category_id: 'petrol') — 11 patterns
-- --------------------------------------------------------------------------
INSERT INTO public.merchant_patterns (pattern, category_id, confidence, merchant_type) VALUES
  ('SHELL',           'petrol', 0.90, 'petrol_station'),
  ('ESSO',            'petrol', 0.95, 'petrol_station'),
  ('CALTEX',          'petrol', 0.95, 'petrol_station'),
  ('SPC',             'petrol', 0.85, 'petrol_station'),
  ('SINOPEC',         'petrol', 0.90, 'petrol_station'),
  ('PETROL',          'petrol', 0.80, 'petrol_station'),
  ('FUEL',            'petrol', 0.75, 'petrol_station'),
  ('EV CHARGING',     'petrol', 0.85, 'ev_charging'),
  ('CHARGE+',         'petrol', 0.90, 'ev_charging'),
  ('SP MOBILITY',     'petrol', 0.90, 'ev_charging'),
  ('BLUECHARGE',      'petrol', 0.90, 'ev_charging'),
  ('PETRONAS',        'petrol', 0.90, 'petrol_station')
ON CONFLICT (pattern) DO NOTHING;

-- --------------------------------------------------------------------------
-- 10f. Bills (category_id: 'bills') — 20 patterns
-- --------------------------------------------------------------------------
INSERT INTO public.merchant_patterns (pattern, category_id, confidence, merchant_type) VALUES
  ('SINGTEL',         'bills', 0.95, 'telco'),
  ('STARHUB',         'bills', 0.95, 'telco'),
  ('M1',              'bills', 0.80, 'telco'),
  ('SIMBA',           'bills', 0.85, 'telco'),
  ('CIRCLES',         'bills', 0.85, 'telco'),
  ('TPG',             'bills', 0.80, 'telco'),
  ('SP SERVICES',     'bills', 0.95, 'utilities'),
  ('SP GROUP',        'bills', 0.95, 'utilities'),
  ('PUB',             'bills', 0.80, 'utilities'),
  ('TOWN COUNCIL',    'bills', 0.90, 'housing'),
  ('HDB',             'bills', 0.85, 'housing'),
  ('INCOME',          'bills', 0.75, 'insurance'),
  ('AIA',             'bills', 0.85, 'insurance'),
  ('PRUDENTIAL',      'bills', 0.90, 'insurance'),
  ('GREAT EASTERN',   'bills', 0.90, 'insurance'),
  ('NTUC INCOME',     'bills', 0.90, 'insurance'),
  ('AVIVA',           'bills', 0.85, 'insurance'),
  ('AXA',             'bills', 0.85, 'insurance'),
  ('MANULIFE',        'bills', 0.90, 'insurance'),
  ('ETIQA',           'bills', 0.85, 'insurance')
ON CONFLICT (pattern) DO NOTHING;

-- --------------------------------------------------------------------------
-- 10g. Travel (category_id: 'travel') — 29 patterns
-- --------------------------------------------------------------------------
INSERT INTO public.merchant_patterns (pattern, category_id, confidence, merchant_type) VALUES
  ('SINGAPORE AIRLINES', 'travel', 0.95, 'airline'),
  ('SCOOT',              'travel', 0.90, 'airline'),
  ('JETSTAR',            'travel', 0.95, 'airline'),
  ('AIRASIA',            'travel', 0.95, 'airline'),
  ('CATHAY',             'travel', 0.90, 'airline'),
  ('CEBU PACIFIC',       'travel', 0.95, 'airline'),
  ('EXPEDIA',            'travel', 0.95, 'ota'),
  ('BOOKING.COM',        'travel', 0.95, 'ota'),
  ('AGODA',              'travel', 0.95, 'ota'),
  ('HOTELS.COM',         'travel', 0.95, 'ota'),
  ('AIRBNB',             'travel', 0.95, 'accommodation'),
  ('KLOOK',              'travel', 0.90, 'ota'),
  ('TRIP.COM',           'travel', 0.90, 'ota'),
  ('TRAVELOKA',          'travel', 0.95, 'ota'),
  ('ZUJI',               'travel', 0.90, 'ota'),
  ('CHANGI',             'travel', 0.80, 'airport'),
  ('AIRPORT',            'travel', 0.75, 'airport'),
  ('MARRIOTT',           'travel', 0.95, 'hotel'),
  ('HILTON',             'travel', 0.95, 'hotel'),
  ('HYATT',              'travel', 0.95, 'hotel'),
  ('ACCOR',              'travel', 0.90, 'hotel'),
  ('IHG',                'travel', 0.90, 'hotel'),
  ('RITZ',               'travel', 0.90, 'hotel'),
  ('SHANGRI-LA',         'travel', 0.95, 'hotel'),
  ('MANDARIN ORIENTAL',  'travel', 0.95, 'hotel'),
  ('FULLERTON',          'travel', 0.90, 'hotel'),
  ('CAPELLA',            'travel', 0.90, 'hotel'),
  ('GRAB TRAVEL',        'travel', 0.85, 'ota'),
  ('SIA',                'travel', 0.80, 'airline')
ON CONFLICT (pattern) DO NOTHING;


-- ==========================================================================
-- SECTION 11: Grant permissions
-- ==========================================================================

GRANT SELECT ON public.merchant_patterns TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_merchant_overrides TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.card_name_mappings TO authenticated;


-- ==========================================================================
-- SECTION 12: Verification queries
-- ==========================================================================
-- Run after applying to verify:
--
--   -- New column on transactions
--   SELECT column_name, column_default, is_nullable
--   FROM information_schema.columns
--   WHERE table_name = 'transactions' AND column_name = 'source';
--   -- Should return: source, 'manual'::text, YES
--
--   -- New tables created (3)
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public'
--     AND table_name IN ('merchant_patterns', 'user_merchant_overrides', 'card_name_mappings');
--   -- Should return 3 rows
--
--   -- Merchant patterns count by category
--   SELECT category_id, COUNT(*) AS pattern_count
--   FROM merchant_patterns
--   GROUP BY category_id
--   ORDER BY pattern_count DESC;
--   -- Should return 7 categories with 200+ total patterns
--
--   -- match_merchant function exists
--   SELECT routine_name FROM information_schema.routines
--   WHERE routine_schema = 'public' AND routine_name = 'match_merchant';
--   -- Should return 1 row
--
--   -- Test match_merchant (works without a user_id for tier 2+3)
--   SELECT * FROM match_merchant('00000000-0000-0000-0000-000000000000', 'STARBUCKS ORCHARD');
--   -- Should return: dining, Dining, 0.95, pattern_match
--
--   SELECT * FROM match_merchant('00000000-0000-0000-0000-000000000000', 'UNKNOWN MERCHANT XYZ');
--   -- Should return: general, General, 0, default
--
--   -- RLS enabled on all 3 new tables
--   SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname = 'public'
--     AND tablename IN ('merchant_patterns', 'user_merchant_overrides', 'card_name_mappings');
--   -- Should return 3 rows with rowsecurity = true
--
--   -- GIN trigram index exists
--   SELECT indexname FROM pg_indexes
--   WHERE tablename = 'merchant_patterns' AND indexname = 'idx_merchant_patterns_trgm';
--   -- Should return 1 row
--
--   -- Transactions source index exists
--   SELECT indexname FROM pg_indexes
--   WHERE tablename = 'transactions' AND indexname = 'idx_transactions_source';
--   -- Should return 1 row


COMMIT;


-- ==========================================================================
-- ROLLBACK:
-- DROP INDEX IF EXISTS idx_transactions_source;
-- DROP INDEX IF EXISTS idx_merchant_patterns_trgm;
-- DROP FUNCTION IF EXISTS public.match_merchant(UUID, TEXT);
-- DROP TABLE IF EXISTS public.card_name_mappings;
-- DROP TABLE IF EXISTS public.user_merchant_overrides;
-- DROP TABLE IF EXISTS public.merchant_patterns;
-- ALTER TABLE public.transactions DROP COLUMN IF EXISTS source;
-- ==========================================================================
