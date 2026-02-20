-- =============================================================================
-- MaxiMile — Migration 008: Miles Portfolio (Sprint 7 — F13 + F14)
-- =============================================================================
-- Description:  Adds miles portfolio tracking tables, links cards to their
--               loyalty programs, seeds 7 Singapore-market miles programs,
--               maps all 20 cards to programs, and deploys the RPC functions
--               get_miles_portfolio() and upsert_miles_balance().
--
-- New objects:
--   Tables   — miles_programs, miles_balances
--   Columns  — cards.miles_program_id (FK)
--   Functions— get_miles_portfolio(UUID), upsert_miles_balance(UUID,UUID,INT)
--   Indexes  — idx_cards_miles_program_id, idx_transactions_user_card
--   RLS      — miles_balances (SELECT/INSERT/UPDATE/DELETE for owner)
--
-- Prerequisites:
--   - 001_initial_schema.sql  (cards, transactions, earn_rules, user_cards)
--   - 002_rls_and_functions.sql (RLS policies, recommend())
--   - 003_seed_batch2.sql (cards 11-20)
--   - batch1_cards.sql seed applied (cards 1-10)
--
-- Assumptions:
--   - DBS Woman's World Card (#10) is not in the original mapping spec.
--     Mapped to KrisFlyer here since it earns DBS Points that transfer to
--     KrisFlyer at the same rate as DBS Altitude.
--
-- Author:  Data Engineer + Software Engineer
-- Created: 2026-02-20
-- =============================================================================

BEGIN;


-- ==========================================================================
-- SECTION 1: miles_programs — Loyalty program reference table
-- ==========================================================================

CREATE TABLE public.miles_programs (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT          NOT NULL UNIQUE,
  airline      TEXT,
  program_type TEXT          NOT NULL DEFAULT 'airline'
                             CHECK (program_type IN ('airline', 'bank_points', 'transferable')),
  icon_url     TEXT          DEFAULT 'airplane-outline',
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.miles_programs
  IS 'Loyalty/miles programs that credit cards earn into (e.g. KrisFlyer, Citi Miles).';
COMMENT ON COLUMN public.miles_programs.program_type
  IS 'airline = direct airline miles; bank_points = bank reward points convertible to miles; transferable = flexible points program.';
COMMENT ON COLUMN public.miles_programs.icon_url
  IS 'Ionicons icon name or image URL for the program logo.';


-- ==========================================================================
-- SECTION 2: miles_balances — User-owned manual balance overrides
-- ==========================================================================

CREATE TABLE public.miles_balances (
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  miles_program_id UUID        NOT NULL REFERENCES public.miles_programs(id) ON DELETE CASCADE,
  manual_balance   INTEGER     NOT NULL DEFAULT 0 CHECK (manual_balance >= 0),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id, miles_program_id)
);

COMMENT ON TABLE  public.miles_balances
  IS 'User-entered miles/points balances per program. Combined with auto-earned for display_total.';
COMMENT ON COLUMN public.miles_balances.manual_balance
  IS 'Manually entered balance (miles or points). Must be >= 0.';


-- ==========================================================================
-- SECTION 3: FK on cards table — link each card to its miles program
-- ==========================================================================

ALTER TABLE public.cards
  ADD COLUMN miles_program_id UUID REFERENCES public.miles_programs(id);

COMMENT ON COLUMN public.cards.miles_program_id
  IS 'The loyalty program this card earns into. NULL if not yet mapped.';

CREATE INDEX idx_cards_miles_program_id ON public.cards (miles_program_id);


-- ==========================================================================
-- SECTION 4: Seed data — 7 miles programs
-- ==========================================================================

INSERT INTO public.miles_programs (name, airline, program_type) VALUES
  ('KrisFlyer',    'Singapore Airlines', 'airline'),
  ('Citi Miles',    NULL,                'bank_points'),
  ('UNI$',          NULL,                'bank_points'),
  ('OCBC$',         NULL,                'bank_points'),
  ('360 Rewards',   NULL,                'bank_points'),
  ('TreatsPoints',  NULL,                'bank_points'),
  ('DBS Points',    NULL,                'bank_points');


-- ==========================================================================
-- SECTION 5: Map all 20 cards to their miles programs
-- ==========================================================================

-- KrisFlyer (10 cards + DBS Woman's World Card = 11 cards)
UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = 'KrisFlyer')
WHERE name ILIKE '%DBS Altitude%'
   OR name ILIKE '%PRVI Miles%'
   OR name ILIKE '%90°N%'
   OR name ILIKE '%90_N%'
   OR name ILIKE '%KrisFlyer UOB%'
   OR name ILIKE '%HSBC Revolution%'
   OR name ILIKE '%KrisFlyer Ascend%'
   OR name ILIKE '%BOC Elite%'
   OR name ILIKE '%Visa Infinite%'
   OR name ILIKE '%TravelOne%'
   OR name ILIKE '%KrisFlyer Credit%'
   OR name ILIKE '%Woman_s World%';

-- Citi Miles (2 cards)
UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = 'Citi Miles')
WHERE name ILIKE '%PremierMiles%'
   OR name ILIKE '%Citi Rewards%';

-- UNI$ (2 cards)
UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = 'UNI$')
WHERE name ILIKE '%Lady_s Card%'
   OR name ILIKE '%Preferred Platinum%';

-- OCBC$ (1 card)
UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = 'OCBC$')
WHERE name ILIKE '%Titanium Rewards%';

-- 360 Rewards (1 card)
UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = '360 Rewards')
WHERE name ILIKE '%Chartered X Credit%'
   OR name ILIKE '%SC X Card%';

-- TreatsPoints (2 cards)
UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = 'TreatsPoints')
WHERE name ILIKE '%Horizon Visa%'
   OR name ILIKE '%FC Barcelona%';

-- DBS Points (1 card)
UPDATE public.cards
SET miles_program_id = (SELECT id FROM public.miles_programs WHERE name = 'DBS Points')
WHERE name ILIKE '%POSB Everyday%';


-- ==========================================================================
-- SECTION 6: RLS policies on miles_balances
-- ==========================================================================

ALTER TABLE public.miles_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY miles_balances_select ON public.miles_balances
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY miles_balances_insert ON public.miles_balances
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY miles_balances_update ON public.miles_balances
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY miles_balances_delete ON public.miles_balances
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ==========================================================================
-- SECTION 7: RPC — get_miles_portfolio(p_user_id UUID)
-- ==========================================================================
-- Returns per-program breakdown: manual balance, auto-earned from
-- transactions, display total, and contributing cards as JSONB array.

CREATE OR REPLACE FUNCTION public.get_miles_portfolio(p_user_id UUID)
RETURNS TABLE (
  program_id        UUID,
  program_name      TEXT,
  airline           TEXT,
  icon_url          TEXT,
  manual_balance    INTEGER,
  auto_earned       BIGINT,
  display_total     BIGINT,
  last_updated      TIMESTAMPTZ,
  contributing_cards JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH user_programs AS (
    SELECT DISTINCT mp.id, mp.name, mp.airline, mp.icon_url
    FROM public.user_cards uc
    JOIN public.cards c ON uc.card_id = c.id
    JOIN public.miles_programs mp ON c.miles_program_id = mp.id
    WHERE uc.user_id = p_user_id
  ),
  earned AS (
    SELECT c.miles_program_id,
           COALESCE(SUM(FLOOR(t.amount * er.earn_rate_mpd)), 0)::BIGINT AS total_earned
    FROM public.transactions t
    JOIN public.earn_rules er
      ON t.card_id = er.card_id
      AND t.category_id = er.category_id
    JOIN public.cards c ON t.card_id = c.id
    WHERE t.user_id = p_user_id
      AND (er.effective_to IS NULL OR er.effective_to >= CURRENT_DATE)
      AND er.effective_from <= CURRENT_DATE
    GROUP BY c.miles_program_id
  ),
  balances AS (
    SELECT miles_program_id, manual_balance, updated_at
    FROM public.miles_balances
    WHERE user_id = p_user_id
  ),
  cards_per_program AS (
    SELECT c.miles_program_id,
           jsonb_agg(jsonb_build_object(
             'card_id', c.id,
             'name', c.name,
             'bank', c.bank
           )) AS cards
    FROM public.user_cards uc
    JOIN public.cards c ON uc.card_id = c.id
    WHERE uc.user_id = p_user_id
      AND c.miles_program_id IS NOT NULL
    GROUP BY c.miles_program_id
  )
  SELECT
    up.id                                                              AS program_id,
    up.name                                                            AS program_name,
    up.airline,
    up.icon_url,
    COALESCE(b.manual_balance, 0)                                      AS manual_balance,
    COALESCE(e.total_earned, 0)                                        AS auto_earned,
    (COALESCE(b.manual_balance, 0) + COALESCE(e.total_earned, 0))::BIGINT AS display_total,
    b.updated_at                                                       AS last_updated,
    COALESCE(cpp.cards, '[]'::JSONB)                                   AS contributing_cards
  FROM user_programs up
  LEFT JOIN earned e            ON up.id = e.miles_program_id
  LEFT JOIN balances b          ON up.id = b.miles_program_id
  LEFT JOIN cards_per_program cpp ON up.id = cpp.miles_program_id
  ORDER BY (COALESCE(b.manual_balance, 0) + COALESCE(e.total_earned, 0)) DESC;
END;
$$;

COMMENT ON FUNCTION public.get_miles_portfolio(UUID)
  IS 'Returns per-program miles breakdown for a user: manual balance, auto-earned from transactions, display total, and contributing cards.';

GRANT EXECUTE ON FUNCTION public.get_miles_portfolio(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_miles_portfolio(UUID) FROM anon;


-- ==========================================================================
-- SECTION 8: RPC — upsert_miles_balance(p_user_id, p_program_id, p_amount)
-- ==========================================================================

CREATE OR REPLACE FUNCTION public.upsert_miles_balance(
  p_user_id    UUID,
  p_program_id UUID,
  p_amount     INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_amount < 0 OR p_amount > 10000000 THEN
    RAISE EXCEPTION 'Balance must be between 0 and 10,000,000'
      USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.miles_balances (user_id, miles_program_id, manual_balance, updated_at)
  VALUES (p_user_id, p_program_id, p_amount, NOW())
  ON CONFLICT (user_id, miles_program_id)
  DO UPDATE SET manual_balance = p_amount,
                updated_at     = NOW()
  WHERE public.miles_balances.manual_balance != p_amount;
END;
$$;

COMMENT ON FUNCTION public.upsert_miles_balance(UUID, UUID, INTEGER)
  IS 'Upserts a manual miles balance for a user+program. Validates 0-10M range. No-ops if value unchanged.';

GRANT EXECUTE ON FUNCTION public.upsert_miles_balance(UUID, UUID, INTEGER) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.upsert_miles_balance(UUID, UUID, INTEGER) FROM anon;


-- ==========================================================================
-- SECTION 9: Performance indexes
-- ==========================================================================

-- Covers the auto-earned CTE join path in get_miles_portfolio.
-- idx_transactions_user_card already exists from 001 but we ensure it.
CREATE INDEX IF NOT EXISTS idx_transactions_user_card_v2
  ON public.transactions (user_id, card_id);

-- miles_balances composite PK (user_id, miles_program_id) already covers
-- the user_id lookup path, so no additional index needed.


-- ==========================================================================
-- SECTION 10: Public read policy on miles_programs
-- ==========================================================================
-- miles_programs is a reference table readable by everyone (like cards).

ALTER TABLE public.miles_programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "miles_programs_select_public" ON public.miles_programs;
CREATE POLICY "miles_programs_select_public"
  ON public.miles_programs
  FOR SELECT
  TO anon, authenticated
  USING (true);


COMMIT;
