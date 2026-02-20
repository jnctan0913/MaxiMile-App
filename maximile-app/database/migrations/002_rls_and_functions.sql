-- =============================================================================
-- MaxiMile -- Migration 002: RLS Policies + Functions
-- =============================================================================
-- Description:  Enables Row Level Security on all tables, creates all RLS
--               policies, deploys the recommend() RPC function, the
--               update_spending_state() trigger, and the monthly cap reset
--               utility functions.
--
-- Prerequisites:
--   - 001_initial_schema.sql must have been applied (tables exist).
--   - Supabase auth.users must exist (provided by the platform).
--
-- Idempotency:
--   This migration uses IF NOT EXISTS / CREATE OR REPLACE / DROP IF EXISTS
--   throughout so it is safe to re-run.  However, it should only need to be
--   run once as migration 002.
--
-- Task:    T2.08 -- RLS Migration (Phase 2 Core Build)
-- Author:  Software Engineer
-- Created: 2026-02-19
-- =============================================================================

BEGIN;

-- #############################################################################
-- PART 1: ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- #############################################################################
-- Enabling RLS is idempotent; running it on a table that already has RLS
-- enabled is a no-op.

ALTER TABLE cards          ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE earn_rules     ENABLE ROW LEVEL SECURITY;
ALTER TABLE caps           ENABLE ROW LEVEL SECURITY;
ALTER TABLE exclusions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards     ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_state ENABLE ROW LEVEL SECURITY;


-- #############################################################################
-- PART 2: RLS POLICIES -- PUBLIC REFERENCE TABLES
-- #############################################################################
-- These tables are readable by all users (including anonymous/unauthenticated).
-- No INSERT/UPDATE/DELETE policies: only service_role can modify these.
--
-- DROP IF EXISTS ensures we can cleanly recreate policies if this migration
-- is re-applied (e.g., during development).

-- -------------------------------------------------------------------------
-- cards
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "cards_select_public" ON cards;
CREATE POLICY "cards_select_public"
  ON cards
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- -------------------------------------------------------------------------
-- categories
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "categories_select_public" ON categories;
CREATE POLICY "categories_select_public"
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- -------------------------------------------------------------------------
-- earn_rules
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "earn_rules_select_public" ON earn_rules;
CREATE POLICY "earn_rules_select_public"
  ON earn_rules
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- -------------------------------------------------------------------------
-- caps
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "caps_select_public" ON caps;
CREATE POLICY "caps_select_public"
  ON caps
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- -------------------------------------------------------------------------
-- exclusions
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "exclusions_select_public" ON exclusions;
CREATE POLICY "exclusions_select_public"
  ON exclusions
  FOR SELECT
  TO anon, authenticated
  USING (true);


-- #############################################################################
-- PART 3: RLS POLICIES -- USER-OWNED TABLES
-- #############################################################################

-- -------------------------------------------------------------------------
-- user_cards: SELECT, INSERT, DELETE (no UPDATE in v1 per spec)
-- -------------------------------------------------------------------------
-- Note: 001_initial_schema already created these policies with slightly
-- different names.  We drop old names and create the canonical ones.
-- -------------------------------------------------------------------------

DROP POLICY IF EXISTS "user_cards_select"     ON user_cards;
DROP POLICY IF EXISTS "user_cards_insert"     ON user_cards;
DROP POLICY IF EXISTS "user_cards_update"     ON user_cards;
DROP POLICY IF EXISTS "user_cards_delete"     ON user_cards;
DROP POLICY IF EXISTS "user_cards_select_own" ON user_cards;
DROP POLICY IF EXISTS "user_cards_insert_own" ON user_cards;
DROP POLICY IF EXISTS "user_cards_delete_own" ON user_cards;

-- SELECT: user can only see their own cards.
CREATE POLICY "user_cards_select_own"
  ON user_cards
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: user can only add cards for themselves.
CREATE POLICY "user_cards_insert_own"
  ON user_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- DELETE: user can only remove their own cards.
CREATE POLICY "user_cards_delete_own"
  ON user_cards
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- No UPDATE policy in v1: user_cards rows are add-or-remove only.
-- No anon policies: anonymous users cannot access user_cards.

-- -------------------------------------------------------------------------
-- transactions: SELECT, INSERT (no UPDATE/DELETE in v1 -- immutable log)
-- -------------------------------------------------------------------------

DROP POLICY IF EXISTS "transactions_select"     ON transactions;
DROP POLICY IF EXISTS "transactions_insert"     ON transactions;
DROP POLICY IF EXISTS "transactions_update"     ON transactions;
DROP POLICY IF EXISTS "transactions_delete"     ON transactions;
DROP POLICY IF EXISTS "transactions_select_own" ON transactions;
DROP POLICY IF EXISTS "transactions_insert_own" ON transactions;

-- SELECT: user can only see their own transactions.
CREATE POLICY "transactions_select_own"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: user can only log transactions for themselves.
CREATE POLICY "transactions_insert_own"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- No UPDATE/DELETE policies: transactions are immutable in v1.
-- Correction workflow: log a new offsetting transaction.

-- -------------------------------------------------------------------------
-- spending_state: SELECT only (writes via trigger SECURITY DEFINER)
-- -------------------------------------------------------------------------

DROP POLICY IF EXISTS "spending_state_select"     ON spending_state;
DROP POLICY IF EXISTS "spending_state_insert"     ON spending_state;
DROP POLICY IF EXISTS "spending_state_update"     ON spending_state;
DROP POLICY IF EXISTS "spending_state_delete"     ON spending_state;
DROP POLICY IF EXISTS "spending_state_select_own" ON spending_state;

-- SELECT: user can only see their own spending state.
CREATE POLICY "spending_state_select_own"
  ON spending_state
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- No INSERT/UPDATE/DELETE policies for authenticated users.
-- The update_spending_state() trigger is SECURITY DEFINER and bypasses RLS.
-- This ensures users cannot manipulate their cap state directly.


-- #############################################################################
-- PART 4: COLUMN DEFAULTS (auto-populate user_id from JWT)
-- #############################################################################
-- These defaults allow the client to omit user_id in INSERT operations;
-- it is automatically populated from the authenticated JWT.

ALTER TABLE user_cards
  ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE transactions
  ALTER COLUMN user_id SET DEFAULT auth.uid();


-- #############################################################################
-- PART 5: RECOMMENDATION ENGINE -- recommend() RPC FUNCTION
-- #############################################################################
-- The core product function.  Given a category, returns the user's cards
-- ranked by effective earning potential (earn_rate_mpd * cap_ratio).
-- See /database/functions/recommend.sql for full documentation.

CREATE OR REPLACE FUNCTION public.recommend(p_category_id TEXT)
RETURNS TABLE (
  card_id            UUID,
  card_name          TEXT,
  bank               TEXT,
  network            TEXT,
  earn_rate_mpd      DECIMAL,
  remaining_cap      DECIMAL,
  monthly_cap_amount DECIMAL,
  score              DECIMAL,
  is_recommended     BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id       UUID;
  v_current_month TEXT;
BEGIN
  -- =====================================================================
  -- 1. Authentication & Input Validation
  -- =====================================================================

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

  -- =====================================================================
  -- 2. Build ranked recommendation result set
  -- =====================================================================
  --
  -- Query plan (EXPLAIN ANALYZE, typical user with 5-7 cards):
  --
  --   user_cards     -> Index Scan on user_cards_pkey (user_id)     ~5 rows
  --   cards          -> Index Scan on cards_pkey (id = uc.card_id)  nested loop
  --   earn_rules     -> Index Scan on idx_earn_rules_active         partial idx
  --   caps           -> Index Scan on caps_unique_card_category     unique idx
  --   spending_state -> Index Scan on spending_state_pkey (4-col)   unique row
  --
  --   All joins are index-backed nested loops.  No sequential scans.
  --   Expected execution: 1-5 ms.  Target: < 100 ms.
  --

  RETURN QUERY
  WITH user_card_rates AS (
    -- Gather user's cards with earn rate and cap data for the category.
    --
    -- Edge case 3.1 (no cards):  INNER JOIN on empty user_cards = 0 rows.
    -- Edge case 3.3 (no bonus):  LEFT JOIN earn_rules = NULL -> COALESCE -> base_rate.
    -- Edge case 3.5 ('general'): Typically no bonus rules -> all base rates.
    -- Edge case 3.9 (cap removed): LEFT JOIN caps = NULL -> uncapped.
    SELECT
      c.id                                          AS card_id,
      c.name                                        AS card_name,
      c.bank                                        AS bank,
      c.network                                     AS network,
      COALESCE(er.earn_rate_mpd, c.base_rate_mpd)   AS earn_rate_mpd,
      ss.remaining_cap                              AS current_remaining_cap,
      cap.monthly_cap_amount                        AS monthly_cap_amount
    FROM user_cards uc
    INNER JOIN cards c
      ON c.id = uc.card_id
    LEFT JOIN earn_rules er
      ON er.card_id      = c.id
      AND er.category_id = p_category_id
      AND er.is_bonus    = TRUE
      AND er.effective_to IS NULL
    LEFT JOIN caps cap
      ON cap.card_id      = c.id
      AND cap.category_id = p_category_id
    LEFT JOIN spending_state ss
      ON ss.user_id      = v_user_id
      AND ss.card_id     = c.id
      AND ss.category_id = p_category_id
      AND ss.month       = v_current_month
    WHERE uc.user_id = v_user_id
  ),

  scored_cards AS (
    -- Compute score = earn_rate_mpd * cap_ratio.
    --
    -- cap_ratio:
    --   No cap (monthly_cap IS NULL)      -> 1.0
    --   Cap, no spend (remaining IS NULL) -> 1.0  (edge 3.6, 3.8)
    --   Cap, remaining <= 0               -> 0.0  (exhausted)
    --   Cap, remaining > 0                -> remaining / cap  (proportional)
    SELECT
      ucr.card_id,
      ucr.card_name,
      ucr.bank,
      ucr.network,
      ucr.earn_rate_mpd,
      -- Display value for remaining_cap
      CASE
        WHEN ucr.monthly_cap_amount IS NULL THEN NULL::DECIMAL
        WHEN ucr.current_remaining_cap IS NULL THEN ucr.monthly_cap_amount
        ELSE ucr.current_remaining_cap
      END AS remaining_cap,
      ucr.monthly_cap_amount,
      -- Ranking score
      ucr.earn_rate_mpd * (
        CASE
          WHEN ucr.monthly_cap_amount IS NULL        THEN 1.0
          WHEN ucr.current_remaining_cap IS NULL     THEN 1.0
          WHEN ucr.current_remaining_cap <= 0        THEN 0.0
          ELSE LEAST(ucr.current_remaining_cap / ucr.monthly_cap_amount, 1.0)
        END
      ) AS score
    FROM user_card_rates ucr
  ),

  ranked_cards AS (
    -- Rank by:
    --   1) score DESC          (highest effective earning first)
    --   2) earn_rate_mpd DESC  (fallback for tied/zero scores, edge 3.2)
    --   3) card_name ASC       (deterministic tiebreaker, edge 3.4)
    SELECT
      sc.card_id,
      sc.card_name,
      sc.bank,
      sc.network,
      sc.earn_rate_mpd,
      sc.remaining_cap,
      sc.monthly_cap_amount,
      sc.score,
      ROW_NUMBER() OVER (
        ORDER BY
          sc.score DESC,
          sc.earn_rate_mpd DESC,
          sc.card_name ASC
      ) AS rank
    FROM scored_cards sc
  )

  -- Return results; top card is_recommended = TRUE (edge 3.7: single card).
  SELECT
    rc.card_id,
    rc.card_name,
    rc.bank,
    rc.network,
    rc.earn_rate_mpd,
    rc.remaining_cap,
    rc.monthly_cap_amount,
    rc.score,
    (rc.rank = 1) AS is_recommended
  FROM ranked_cards rc
  ORDER BY rc.rank;

END;
$$;

-- Permissions for recommend()
GRANT EXECUTE ON FUNCTION public.recommend(TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.recommend(TEXT) FROM anon;


-- #############################################################################
-- PART 6: CAP DEDUCTION TRIGGER -- update_spending_state()
-- #############################################################################
-- Fires AFTER INSERT on transactions.  Upserts spending_state to track
-- cumulative spend and recalculate remaining cap.
-- See /database/functions/update_spending_state.sql for full documentation.

CREATE OR REPLACE FUNCTION public.update_spending_state()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_month      TEXT;
  v_cap_amount DECIMAL(12,2);
BEGIN
  -- Derive calendar month from transaction date.
  v_month := to_char(NEW.transaction_date, 'YYYY-MM');

  -- Look up monthly cap (category-specific > global).
  SELECT monthly_cap_amount
  INTO   v_cap_amount
  FROM   caps
  WHERE  card_id = NEW.card_id
    AND  (category_id = NEW.category_id OR category_id IS NULL)
  ORDER BY category_id NULLS LAST
  LIMIT 1;

  -- UPSERT spending_state.
  --   INSERT path:  first txn for this card+category+month.
  --   UPDATE path:  subsequent txn; increment total, recalculate cap.
  --   No cap:       remaining_cap stays NULL.
  --   Over cap:     GREATEST(..., 0) clamps to zero.
  INSERT INTO spending_state (
    user_id, card_id, category_id, month, total_spent, remaining_cap
  )
  VALUES (
    NEW.user_id,
    NEW.card_id,
    NEW.category_id,
    v_month,
    NEW.amount,
    CASE
      WHEN v_cap_amount IS NULL THEN NULL
      ELSE GREATEST(v_cap_amount - NEW.amount, 0)
    END
  )
  ON CONFLICT (user_id, card_id, category_id, month)
  DO UPDATE SET
    total_spent   = spending_state.total_spent + NEW.amount,
    remaining_cap = CASE
      WHEN v_cap_amount IS NULL THEN NULL
      ELSE GREATEST(v_cap_amount - (spending_state.total_spent + NEW.amount), 0)
    END,
    updated_at    = NOW();

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_spending_state()
  IS 'Trigger: upserts spending_state on transaction INSERT. SECURITY DEFINER.';

-- Attach the INSERT trigger.
-- Drop all historical trigger name variants first.
DROP TRIGGER IF EXISTS trg_transaction_update_spending_state ON transactions;
DROP TRIGGER IF EXISTS after_transaction_insert ON transactions;

CREATE TRIGGER after_transaction_insert
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_spending_state();


-- -------------------------------------------------------------------------
-- DELETE trigger (for future use when DELETE is enabled in v1.1)
-- -------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_spending_state_on_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_month      TEXT;
  v_cap_amount DECIMAL(12,2);
BEGIN
  v_month := to_char(OLD.transaction_date, 'YYYY-MM');

  SELECT monthly_cap_amount
  INTO   v_cap_amount
  FROM   caps
  WHERE  card_id = OLD.card_id
    AND  (category_id = OLD.category_id OR category_id IS NULL)
  ORDER BY category_id NULLS LAST
  LIMIT 1;

  UPDATE spending_state
  SET
    total_spent   = GREATEST(spending_state.total_spent - OLD.amount, 0),
    remaining_cap = CASE
      WHEN v_cap_amount IS NULL THEN NULL
      ELSE GREATEST(
        v_cap_amount - GREATEST(spending_state.total_spent - OLD.amount, 0),
        0
      )
    END,
    updated_at    = NOW()
  WHERE user_id     = OLD.user_id
    AND card_id     = OLD.card_id
    AND category_id = OLD.category_id
    AND month       = v_month;

  RETURN OLD;
END;
$$;

COMMENT ON FUNCTION public.update_spending_state_on_delete()
  IS 'Trigger: decrements spending_state on transaction DELETE. SECURITY DEFINER.';

DROP TRIGGER IF EXISTS trg_transaction_delete_spending_state ON transactions;
DROP TRIGGER IF EXISTS after_transaction_delete ON transactions;

CREATE TRIGGER after_transaction_delete
  AFTER DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_spending_state_on_delete();


-- #############################################################################
-- PART 7: MONTHLY CAP RESET UTILITIES
-- #############################################################################
-- See /database/functions/reset_monthly_caps.sql for full documentation.
--
-- MVP approach: implicit reset (no rows for new month = full caps).
-- These utilities are for admin cleanup only.

-- -------------------------------------------------------------------------
-- reset_caps_for_month(p_month TEXT) -> INTEGER
-- -------------------------------------------------------------------------
-- Deletes all spending_state rows for a specific month.
-- Cannot delete the current month (safety guard).

CREATE OR REPLACE FUNCTION public.reset_caps_for_month(p_month TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  -- Validate YYYY-MM format.
  IF p_month !~ '^\d{4}-(0[1-9]|1[0-2])$' THEN
    RAISE EXCEPTION 'Invalid month format: %. Expected YYYY-MM (e.g. 2026-02).', p_month
      USING ERRCODE = 'P0001';
  END IF;

  -- Prevent accidental deletion of current month's live data.
  IF p_month = to_char(NOW(), 'YYYY-MM') THEN
    RAISE EXCEPTION 'Cannot reset the current month (%). '
      'This would delete live spending data. '
      'Use service_role direct DELETE if absolutely necessary.',
      p_month
      USING ERRCODE = 'P0001';
  END IF;

  -- Delete all spending_state rows for the given month (all users).
  DELETE FROM spending_state
  WHERE month = p_month;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RAISE NOTICE 'reset_caps_for_month(%): deleted % spending_state rows.',
    p_month, v_deleted;

  RETURN v_deleted;
END;
$$;

COMMENT ON FUNCTION public.reset_caps_for_month(TEXT)
  IS 'Admin utility: deletes all spending_state rows for a given month (YYYY-MM). '
     'Cannot delete the current month. Returns rows deleted. SECURITY DEFINER.';

-- Restrict to admin only.
REVOKE EXECUTE ON FUNCTION public.reset_caps_for_month(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reset_caps_for_month(TEXT) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.reset_caps_for_month(TEXT) FROM anon;

-- -------------------------------------------------------------------------
-- purge_old_spending_state(p_months_to_keep INTEGER) -> INTEGER
-- -------------------------------------------------------------------------
-- Convenience: delete rows older than N months.

CREATE OR REPLACE FUNCTION public.purge_old_spending_state(
  p_months_to_keep INTEGER DEFAULT 3
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cutoff_month TEXT;
  v_deleted      INTEGER;
BEGIN
  IF p_months_to_keep < 1 THEN
    RAISE EXCEPTION 'p_months_to_keep must be >= 1 (got %).', p_months_to_keep
      USING ERRCODE = 'P0001';
  END IF;

  v_cutoff_month := to_char(
    NOW() - (p_months_to_keep || ' months')::INTERVAL,
    'YYYY-MM'
  );

  DELETE FROM spending_state
  WHERE month < v_cutoff_month;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RAISE NOTICE 'purge_old_spending_state(%): deleted % rows older than %.',
    p_months_to_keep, v_deleted, v_cutoff_month;

  RETURN v_deleted;
END;
$$;

COMMENT ON FUNCTION public.purge_old_spending_state(INTEGER)
  IS 'Admin utility: purges spending_state rows older than N months. '
     'Default keeps 3 months. Returns rows deleted. SECURITY DEFINER.';

REVOKE EXECUTE ON FUNCTION public.purge_old_spending_state(INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.purge_old_spending_state(INTEGER) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.purge_old_spending_state(INTEGER) FROM anon;


-- #############################################################################
-- PART 8: PERFORMANCE INDEXES
-- #############################################################################
-- Additional indexes that the recommendation engine depends on.
-- Most are already created in 001_initial_schema; these are additive.

-- Partial index for active earn rules (the recommend() hot path).
CREATE INDEX IF NOT EXISTS idx_earn_rules_card_category_active
  ON earn_rules (card_id, category_id)
  WHERE effective_to IS NULL;

-- User+card+category index for spend aggregation queries.
CREATE INDEX IF NOT EXISTS idx_transactions_user_card_category
  ON transactions (user_id, card_id, category_id);


COMMIT;
