-- =============================================================================
-- MaxiMile — Migration 010: Monthly Earning Insights (Sprint 9 — Miles Tab)
-- =============================================================================
-- Description:  Adds an RPC that computes monthly earning insights server-side,
--               replicating the client-side dashboard logic from dashboard.tsx.
--               Returns total miles earned, miles saved vs baseline, transaction
--               count, and a 3-month trend array.
--
-- New objects:
--   Functions— get_monthly_earning_insights(UUID, DATE)
--   Indexes  — idx_transactions_user_date (supports monthly range scans)
--
-- Calculation logic (mirrors dashboard.tsx fetchDashboard):
--   1. Per-transaction miles = FLOOR(amount × earn_rate_mpd) where earn_rate
--      comes from earn_rules (card_id + category_id match) with fallback to
--      cards.base_rate_mpd when no category-specific rule exists.
--   2. Baseline miles = SUM(amount) × MIN(base_rate_mpd) across user's cards.
--   3. Miles saved = GREATEST(total_miles - baseline, 0).
--   4. 3-month trend = miles calculation for (target_month-2, -1, 0).
--
-- Prerequisites:
--   - 001_initial_schema.sql  (cards, transactions, earn_rules, user_cards)
--   - 008_miles_portfolio.sql (get_miles_portfolio pattern reference)
--
-- Author:  Data Engineer + Software Engineer
-- Created: 2026-02-20
-- =============================================================================

BEGIN;


-- ==========================================================================
-- SECTION 1: RPC — get_monthly_earning_insights(p_user_id, p_month_start)
-- ==========================================================================
-- Server-side equivalent of the dashboard.tsx fetchDashboard() function.
-- Accepts a target month (defaults to current month) and returns aggregate
-- earning metrics plus a 3-month trend as JSONB.

CREATE OR REPLACE FUNCTION public.get_monthly_earning_insights(
  p_user_id    UUID,
  p_month_start DATE DEFAULT date_trunc('month', CURRENT_DATE)::DATE
)
RETURNS TABLE (
  total_miles_earned   BIGINT,
  miles_saved          BIGINT,
  transaction_count    INTEGER,
  trend_months         JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_min_base_rate  NUMERIC;
  v_month_end      DATE;
  v_trend_start    DATE;
  v_has_cards      BOOLEAN;
BEGIN
  v_month_end   := (p_month_start + INTERVAL '1 month')::DATE;
  v_trend_start := (p_month_start - INTERVAL '2 months')::DATE;

  -- Early exit: user has no cards
  SELECT EXISTS(
    SELECT 1 FROM public.user_cards WHERE user_id = p_user_id
  ) INTO v_has_cards;

  IF NOT v_has_cards THEN
    RETURN QUERY SELECT 0::BIGINT, 0::BIGINT, 0::INTEGER, '[]'::JSONB;
    RETURN;
  END IF;

  -- Lowest base_rate_mpd across user's cards — the "worst card" baseline
  SELECT COALESCE(MIN(c.base_rate_mpd), 0)
  INTO v_min_base_rate
  FROM public.user_cards uc
  JOIN public.cards c ON uc.card_id = c.id
  WHERE uc.user_id = p_user_id;

  RETURN QUERY
  WITH best_earn_rules AS (
    -- Deduplicate earn_rules: pick the highest rate per (card, category).
    -- Mirrors dashboard.tsx logic: keep max earn_rate_mpd per key.
    SELECT DISTINCT ON (er.card_id, er.category_id)
      er.card_id,
      er.category_id,
      er.earn_rate_mpd
    FROM public.earn_rules er
    JOIN public.user_cards uc ON er.card_id = uc.card_id
    WHERE uc.user_id = p_user_id
      AND (er.effective_to IS NULL OR er.effective_to >= CURRENT_DATE)
      AND er.effective_from <= CURRENT_DATE
    ORDER BY er.card_id, er.category_id, er.earn_rate_mpd DESC
  ),

  -- Compute miles per transaction across the full 3-month window.
  -- LEFT JOIN earn_rules with COALESCE fallback to base_rate_mpd replicates
  -- the client-side computeMilesForTransaction() function.
  txn_miles AS (
    SELECT
      t.transaction_date,
      FLOOR(t.amount * COALESCE(ber.earn_rate_mpd, c.base_rate_mpd)) AS miles,
      t.amount
    FROM public.transactions t
    JOIN public.cards c ON t.card_id = c.id
    LEFT JOIN best_earn_rules ber
      ON t.card_id = ber.card_id
      AND t.category_id = ber.category_id
    WHERE t.user_id = p_user_id
      AND t.transaction_date >= v_trend_start
      AND t.transaction_date < v_month_end
  ),

  -- Aggregate the target month
  current_month AS (
    SELECT
      COALESCE(SUM(tm.miles), 0)::BIGINT AS earned,
      COALESCE(SUM(tm.amount), 0)        AS total_spend,
      COUNT(*)::INTEGER                   AS txn_count
    FROM txn_miles tm
    WHERE tm.transaction_date >= p_month_start
      AND tm.transaction_date < v_month_end
  ),

  -- Aggregate miles per calendar month for the trend
  monthly_totals AS (
    SELECT
      date_trunc('month', tm.transaction_date)::DATE AS month_start,
      COALESCE(SUM(tm.miles), 0)::BIGINT             AS month_miles
    FROM txn_miles tm
    GROUP BY date_trunc('month', tm.transaction_date)::DATE
  ),

  -- Generate 3-month series and left-join aggregated totals
  trend_series AS (
    SELECT
      gs::DATE                             AS month_start,
      to_char(gs, 'Mon')                   AS label,
      COALESCE(mt.month_miles, 0)::BIGINT  AS miles
    FROM generate_series(
      v_trend_start::TIMESTAMP,
      p_month_start::TIMESTAMP,
      INTERVAL '1 month'
    ) gs
    LEFT JOIN monthly_totals mt ON mt.month_start = gs::DATE
    ORDER BY gs
  ),

  trend_json AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object('label', ts.label, 'miles', ts.miles)
        ORDER BY ts.month_start
      ),
      '[]'::JSONB
    ) AS trend
    FROM trend_series ts
  )

  SELECT
    cm.earned                                                                    AS total_miles_earned,
    GREATEST(cm.earned - FLOOR(cm.total_spend * v_min_base_rate)::BIGINT, 0)     AS miles_saved,
    cm.txn_count                                                                 AS transaction_count,
    tj.trend                                                                     AS trend_months
  FROM current_month cm
  CROSS JOIN trend_json tj;
END;
$$;

COMMENT ON FUNCTION public.get_monthly_earning_insights(UUID, DATE)
  IS 'Returns monthly earning insights for a user: total miles earned, miles saved vs baseline (lowest base_rate card), transaction count, and 3-month trend. Replicates dashboard.tsx client logic server-side.';

GRANT EXECUTE ON FUNCTION public.get_monthly_earning_insights(UUID, DATE) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_monthly_earning_insights(UUID, DATE) FROM anon;


-- ==========================================================================
-- SECTION 2: Performance index
-- ==========================================================================
-- Supports the monthly date-range scans in txn_miles CTE.

CREATE INDEX IF NOT EXISTS idx_transactions_user_date
  ON public.transactions (user_id, transaction_date);


COMMIT;
