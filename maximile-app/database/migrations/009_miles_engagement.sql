-- =============================================================================
-- MaxiMile — Migration 009: Miles Engagement Loop (Sprint 8 — F15 + F16)
-- =============================================================================
-- Description:  Adds redemption logging and goal tracking tables, trigger for
--               max-3 active goals per program, RPC functions for logging
--               redemptions, managing goals, and querying history. Updates
--               get_miles_portfolio() to deduct redemptions from display_total.
--
-- New objects:
--   Tables   — miles_transactions, miles_goals
--   Triggers — trg_max_goals_per_program (enforces max 3 active goals)
--   Functions— log_miles_redemption(), create_miles_goal(),
--              delete_miles_goal(), get_program_goals(),
--              get_redemption_history()
--   Updated  — get_miles_portfolio() (adds total_redeemed column)
--   Indexes  — idx_miles_tx_user_program, idx_miles_tx_user_type,
--              idx_miles_goals_user_program
--   RLS      — miles_transactions (SELECT/INSERT/UPDATE/DELETE for owner)
--              miles_goals (SELECT/INSERT/UPDATE/DELETE for owner)
--
-- Prerequisites:
--   - 008_miles_portfolio.sql (miles_programs, miles_balances, cards.miles_program_id,
--     get_miles_portfolio(), upsert_miles_balance())
--
-- Author:  Data Engineer + Software Engineer
-- Created: 2026-02-20
-- =============================================================================

BEGIN;


-- ==========================================================================
-- SECTION 1: miles_transactions — User-logged miles events
-- ==========================================================================

CREATE TABLE public.miles_transactions (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  miles_program_id UUID          NOT NULL REFERENCES public.miles_programs(id) ON DELETE CASCADE,
  type             TEXT          NOT NULL CHECK (type IN ('redeem', 'transfer_out', 'transfer_in', 'adjust')),
  amount           INTEGER       NOT NULL CHECK (amount > 0),
  description      TEXT,
  transaction_date DATE          NOT NULL DEFAULT CURRENT_DATE,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.miles_transactions
  IS 'User-logged miles events: redemptions, transfers, adjustments.';
COMMENT ON COLUMN public.miles_transactions.type
  IS 'redeem = miles used for reward; transfer_out/in = inter-program moves; adjust = manual correction.';
COMMENT ON COLUMN public.miles_transactions.amount
  IS 'Positive integer. For redemptions and transfers, represents miles consumed or moved.';

CREATE INDEX idx_miles_tx_user_program
  ON public.miles_transactions (user_id, miles_program_id, transaction_date DESC);

CREATE INDEX idx_miles_tx_user_type
  ON public.miles_transactions (user_id, type);


-- ==========================================================================
-- SECTION 2: miles_goals — User-defined miles targets per program
-- ==========================================================================

CREATE TABLE public.miles_goals (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  miles_program_id UUID          NOT NULL REFERENCES public.miles_programs(id) ON DELETE CASCADE,
  target_miles     INTEGER       NOT NULL CHECK (target_miles >= 1000),
  description      TEXT          NOT NULL,
  achieved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.miles_goals
  IS 'User-defined miles targets per program with optional achievement tracking.';
COMMENT ON COLUMN public.miles_goals.target_miles
  IS 'Minimum 1,000 miles. Represents the user''s target balance for this program.';
COMMENT ON COLUMN public.miles_goals.achieved_at
  IS 'NULL while active. Set to NOW() when the user''s balance reaches or exceeds target_miles.';

CREATE INDEX idx_miles_goals_user_program
  ON public.miles_goals (user_id, miles_program_id);


-- ==========================================================================
-- SECTION 3: Max-3 active goals constraint (trigger)
-- ==========================================================================

CREATE OR REPLACE FUNCTION public.check_max_goals_per_program()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  active_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO active_count
  FROM public.miles_goals
  WHERE user_id = NEW.user_id
    AND miles_program_id = NEW.miles_program_id
    AND achieved_at IS NULL;

  IF active_count >= 3 THEN
    RAISE EXCEPTION 'Maximum 3 active goals per program. Delete or complete an existing goal first.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.check_max_goals_per_program()
  IS 'Trigger function: enforces max 3 active (non-achieved) goals per (user_id, miles_program_id).';

CREATE TRIGGER trg_max_goals_per_program
  BEFORE INSERT ON public.miles_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.check_max_goals_per_program();


-- ==========================================================================
-- SECTION 4: RLS policies on miles_transactions
-- ==========================================================================

ALTER TABLE public.miles_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY miles_transactions_select ON public.miles_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY miles_transactions_insert ON public.miles_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY miles_transactions_update ON public.miles_transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY miles_transactions_delete ON public.miles_transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ==========================================================================
-- SECTION 5: RLS policies on miles_goals
-- ==========================================================================

ALTER TABLE public.miles_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY miles_goals_select ON public.miles_goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY miles_goals_insert ON public.miles_goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY miles_goals_update ON public.miles_goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY miles_goals_delete ON public.miles_goals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ==========================================================================
-- SECTION 6: RPC — log_miles_redemption(...)
-- ==========================================================================
-- Inserts a redemption transaction and auto-checks if any active goals
-- for the same program are now achieved based on the updated balance.

CREATE OR REPLACE FUNCTION public.log_miles_redemption(
  p_user_id      UUID,
  p_program_id   UUID,
  p_amount       INTEGER,
  p_description  TEXT DEFAULT NULL,
  p_date         DATE DEFAULT CURRENT_DATE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tx_id UUID;
BEGIN
  IF p_amount <= 0 OR p_amount > 10000000 THEN
    RAISE EXCEPTION 'Redemption amount must be between 1 and 10,000,000'
      USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.miles_transactions (user_id, miles_program_id, type, amount, description, transaction_date)
  VALUES (p_user_id, p_program_id, 'redeem', p_amount, p_description, p_date)
  RETURNING id INTO v_tx_id;

  UPDATE public.miles_goals g
  SET achieved_at = NOW()
  WHERE g.user_id = p_user_id
    AND g.miles_program_id = p_program_id
    AND g.achieved_at IS NULL
    AND g.target_miles <= (
      SELECT COALESCE(mb.manual_balance, 0) + COALESCE(earned.total, 0) - COALESCE(redeemed.total, 0)
      FROM (SELECT 1) dummy
      LEFT JOIN public.miles_balances mb
        ON mb.user_id = p_user_id AND mb.miles_program_id = p_program_id
      LEFT JOIN (
        SELECT SUM(FLOOR(t.amount * er.earn_rate_mpd))::BIGINT AS total
        FROM public.transactions t
        JOIN public.earn_rules er
          ON t.card_id = er.card_id AND t.category_id = er.category_id
        JOIN public.cards c ON t.card_id = c.id
        WHERE t.user_id = p_user_id
          AND c.miles_program_id = p_program_id
      ) earned ON true
      LEFT JOIN (
        SELECT SUM(mt.amount)::BIGINT AS total
        FROM public.miles_transactions mt
        WHERE mt.user_id = p_user_id
          AND mt.miles_program_id = p_program_id
          AND mt.type = 'redeem'
      ) redeemed ON true
    );

  RETURN v_tx_id;
END;
$$;

COMMENT ON FUNCTION public.log_miles_redemption(UUID, UUID, INTEGER, TEXT, DATE)
  IS 'Logs a miles redemption and auto-marks any active goals as achieved if the current balance meets the target.';

GRANT EXECUTE ON FUNCTION public.log_miles_redemption(UUID, UUID, INTEGER, TEXT, DATE) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.log_miles_redemption(UUID, UUID, INTEGER, TEXT, DATE) FROM anon;


-- ==========================================================================
-- SECTION 7: RPC — create_miles_goal(...)
-- ==========================================================================

CREATE OR REPLACE FUNCTION public.create_miles_goal(
  p_user_id      UUID,
  p_program_id   UUID,
  p_target       INTEGER,
  p_description  TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_goal_id UUID;
BEGIN
  IF p_target < 1000 THEN
    RAISE EXCEPTION 'Target must be at least 1,000 miles'
      USING ERRCODE = 'P0001';
  END IF;

  IF p_description IS NULL OR trim(p_description) = '' THEN
    RAISE EXCEPTION 'Goal description is required'
      USING ERRCODE = 'P0001';
  END IF;

  IF (SELECT COUNT(*) FROM public.miles_goals
      WHERE user_id = p_user_id
        AND miles_program_id = p_program_id
        AND achieved_at IS NULL) >= 3
  THEN
    RAISE EXCEPTION 'Maximum 3 active goals per program. Delete or complete an existing goal first.'
      USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.miles_goals (user_id, miles_program_id, target_miles, description)
  VALUES (p_user_id, p_program_id, p_target, trim(p_description))
  RETURNING id INTO v_goal_id;

  RETURN v_goal_id;
END;
$$;

COMMENT ON FUNCTION public.create_miles_goal(UUID, UUID, INTEGER, TEXT)
  IS 'Creates a miles goal for a user+program. Validates min 1,000 target, non-empty description, and max 3 active goals.';

GRANT EXECUTE ON FUNCTION public.create_miles_goal(UUID, UUID, INTEGER, TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.create_miles_goal(UUID, UUID, INTEGER, TEXT) FROM anon;


-- ==========================================================================
-- SECTION 8: RPC — delete_miles_goal(...)
-- ==========================================================================

CREATE OR REPLACE FUNCTION public.delete_miles_goal(
  p_user_id  UUID,
  p_goal_id  UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.miles_goals
  WHERE id = p_goal_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Goal not found or not owned by user'
      USING ERRCODE = 'P0001';
  END IF;
END;
$$;

COMMENT ON FUNCTION public.delete_miles_goal(UUID, UUID)
  IS 'Deletes a miles goal by ID, only if owned by the specified user.';

GRANT EXECUTE ON FUNCTION public.delete_miles_goal(UUID, UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_miles_goal(UUID, UUID) FROM anon;


-- ==========================================================================
-- SECTION 9: Update get_miles_portfolio — add total_redeemed column
-- ==========================================================================
-- BREAKING CHANGE for frontend TypeScript interface:
--   RETURNS TABLE now includes `total_redeemed BIGINT` between auto_earned
--   and display_total. display_total formula changes from
--   (manual + earned) to (manual + earned - redeemed).

DROP FUNCTION IF EXISTS public.get_miles_portfolio(UUID);

CREATE OR REPLACE FUNCTION public.get_miles_portfolio(p_user_id UUID)
RETURNS TABLE (
  program_id        UUID,
  program_name      TEXT,
  airline           TEXT,
  icon_url          TEXT,
  manual_balance    INTEGER,
  auto_earned       BIGINT,
  total_redeemed    BIGINT,
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
  redeemed AS (
    SELECT mt.miles_program_id,
           COALESCE(SUM(mt.amount), 0)::BIGINT AS total_redeemed
    FROM public.miles_transactions mt
    WHERE mt.user_id = p_user_id
      AND mt.type = 'redeem'
    GROUP BY mt.miles_program_id
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
    COALESCE(r.total_redeemed, 0)                                      AS total_redeemed,
    (COALESCE(b.manual_balance, 0)
      + COALESCE(e.total_earned, 0)
      - COALESCE(r.total_redeemed, 0))::BIGINT                        AS display_total,
    b.updated_at                                                       AS last_updated,
    COALESCE(cpp.cards, '[]'::JSONB)                                   AS contributing_cards
  FROM user_programs up
  LEFT JOIN earned e              ON up.id = e.miles_program_id
  LEFT JOIN redeemed r            ON up.id = r.miles_program_id
  LEFT JOIN balances b            ON up.id = b.miles_program_id
  LEFT JOIN cards_per_program cpp ON up.id = cpp.miles_program_id
  ORDER BY (COALESCE(b.manual_balance, 0)
            + COALESCE(e.total_earned, 0)
            - COALESCE(r.total_redeemed, 0)) DESC;
END;
$$;

COMMENT ON FUNCTION public.get_miles_portfolio(UUID)
  IS 'Returns per-program miles breakdown for a user: manual balance, auto-earned, total redeemed, display total (manual + earned - redeemed), and contributing cards.';

GRANT EXECUTE ON FUNCTION public.get_miles_portfolio(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_miles_portfolio(UUID) FROM anon;


-- ==========================================================================
-- SECTION 10: RPC — get_program_goals(...)
-- ==========================================================================

CREATE OR REPLACE FUNCTION public.get_program_goals(
  p_user_id    UUID,
  p_program_id UUID
)
RETURNS TABLE (
  goal_id      UUID,
  target_miles INTEGER,
  description  TEXT,
  achieved_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT g.id, g.target_miles, g.description, g.achieved_at, g.created_at
  FROM public.miles_goals g
  WHERE g.user_id = p_user_id
    AND g.miles_program_id = p_program_id
  ORDER BY g.achieved_at NULLS FIRST, g.created_at DESC;
END;
$$;

COMMENT ON FUNCTION public.get_program_goals(UUID, UUID)
  IS 'Returns all goals for a user+program, ordered active-first then by newest.';

GRANT EXECUTE ON FUNCTION public.get_program_goals(UUID, UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_program_goals(UUID, UUID) FROM anon;


-- ==========================================================================
-- SECTION 11: RPC — get_redemption_history(...)
-- ==========================================================================

CREATE OR REPLACE FUNCTION public.get_redemption_history(
  p_user_id    UUID,
  p_program_id UUID,
  p_limit      INTEGER DEFAULT 20
)
RETURNS TABLE (
  transaction_id    UUID,
  amount            INTEGER,
  description       TEXT,
  transaction_date  DATE,
  created_at        TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT mt.id, mt.amount, mt.description, mt.transaction_date, mt.created_at
  FROM public.miles_transactions mt
  WHERE mt.user_id = p_user_id
    AND mt.miles_program_id = p_program_id
    AND mt.type = 'redeem'
  ORDER BY mt.transaction_date DESC, mt.created_at DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION public.get_redemption_history(UUID, UUID, INTEGER)
  IS 'Returns paginated redemption history for a user+program, newest first.';

GRANT EXECUTE ON FUNCTION public.get_redemption_history(UUID, UUID, INTEGER) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_redemption_history(UUID, UUID, INTEGER) FROM anon;


COMMIT;
