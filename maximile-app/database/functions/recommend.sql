-- =============================================================================
-- MaxiMile -- Recommendation Engine (recommend.sql)
-- =============================================================================
-- Description:  Supabase RPC function that returns a user's credit cards ranked
--               by effective earning potential for a given spend category,
--               factoring in remaining monthly bonus cap headroom AND minimum
--               monthly spend enforcement (F31).
--
-- Task:    T2.08 -- Implement Recommendation Engine as Supabase RPC Function
-- Author:  Software Engineer
-- Created: 2026-02-19
-- Updated: 2026-02-27 (F31 — Min Spend Enforcement, Contactless Badge,
--                       User-Selectable Bonus Categories)
--
-- Signature:
--   recommend(p_category_id TEXT)
--   -> TABLE(card_id, card_name, bank, network, earn_rate_mpd,
--            remaining_cap, monthly_cap_amount, score, is_recommended,
--            conditions_note, min_spend_threshold, min_spend_met,
--            total_monthly_spend, requires_contactless)
--
-- Security:
--   SECURITY DEFINER -- executes as function owner (postgres) so it can read
--   spending_state rows that belong to the authenticated user without needing
--   a SELECT RLS policy grant on every joined table.
--
-- Performance target: < 100 ms for typical user (5-7 cards, 7 categories).
-- At expected data volumes the query completes in < 5 ms.
--
-- Edge cases handled (see inline comments for each):
--   3.1  No cards in portfolio             -> empty result set
--   3.2  All caps exhausted                -> rank by earn_rate_mpd (secondary sort)
--   3.3  No bonus rule for category        -> fallback to base_rate_mpd
--   3.4  Tied scores                       -> alphabetical by card_name ASC
--   3.5  'general' category                -> base rates (no bonus rules typically)
--   3.6  New user, no spending_state rows  -> full cap remaining (cap_ratio = 1.0)
--   3.7  Single card in portfolio          -> single row, is_recommended = true
--   3.8  Cap defined, no spending row yet  -> treated as $0 spent
--   3.9  Spending state exists but cap removed -> uncapped (cap_ratio = 1.0)
--   3.10 Min spend not met                 -> downrank to base_rate_mpd
--   3.11 No user_settings row              -> treated as $0 (conservative)
--   3.12 User-selectable bonus category   -> check user_card_preferences;
--        if user hasn't selected this category (or has no prefs), fall back
--        to base_rate_mpd
-- =============================================================================

CREATE OR REPLACE FUNCTION public.recommend(p_category_id TEXT)
RETURNS TABLE (
  card_id              UUID,
  card_name            TEXT,
  bank                 TEXT,
  network              TEXT,
  earn_rate_mpd        DECIMAL,
  remaining_cap        DECIMAL,
  monthly_cap_amount   DECIMAL,
  score                DECIMAL,
  is_recommended       BOOLEAN,
  conditions_note      TEXT,
  min_spend_threshold  DECIMAL,
  min_spend_met        BOOLEAN,
  total_monthly_spend  DECIMAL,
  requires_contactless BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id              UUID;
  v_current_month        TEXT;
  v_estimated_spend      DECIMAL;
BEGIN
  -- =======================================================================
  -- 1. Authentication & Input Validation
  -- =======================================================================

  -- Extract the authenticated user's UUID from the Supabase JWT.
  v_user_id := auth.uid();

  -- Guard: reject unauthenticated callers.
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated'
      USING ERRCODE = 'PGRST301';  -- maps to HTTP 401 via PostgREST
  END IF;

  -- Guard: reject unknown categories.  A single index-only lookup on the
  -- categories PK; negligible cost.
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = p_category_id) THEN
    RAISE EXCEPTION 'Invalid category: %', p_category_id
      USING ERRCODE = 'P0001';
  END IF;

  -- Current calendar month in YYYY-MM form (used to filter spending_state).
  v_current_month := to_char(NOW(), 'YYYY-MM');

  -- Fetch user's estimated monthly spend (edge case 3.11: default to 0)
  SELECT COALESCE(us.estimated_monthly_spend, 0)
  INTO v_estimated_spend
  FROM user_settings us
  WHERE us.user_id = v_user_id;

  -- If no row found, default to 0
  IF v_estimated_spend IS NULL THEN
    v_estimated_spend := 0;
  END IF;

  -- =======================================================================
  -- 2. Build the ranked recommendation result set
  -- =======================================================================

  RETURN QUERY

  -- Pre-aggregate card-wide spending (all categories) for this month
  -- Moved before user_card_rates so we can use it for min_spend checks
  WITH card_total_spending AS (
    SELECT t.card_id, SUM(t.amount) AS total_all
    FROM transactions t
    WHERE t.user_id = v_user_id
      AND t.transaction_date >= (date_trunc('month', CURRENT_DATE))::date
      AND t.transaction_date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date
    GROUP BY t.card_id
  ),

  user_card_rates AS (
    -- -----------------------------------------------------------------
    -- Step 1: Gather the user's cards with earn rate & cap data for the
    --         requested category, with min_spend enforcement.
    -- -----------------------------------------------------------------
    SELECT
      c.id                                          AS card_id,
      c.name                                        AS card_name,
      c.bank                                        AS bank,
      c.network                                     AS network,
      c.base_rate_mpd                               AS base_rate_mpd,
      -- Extract min_spend_monthly from earn rule conditions JSONB
      (er.conditions->>'min_spend_monthly')::DECIMAL AS min_spend_threshold,
      -- Effective monthly spend: higher of actual vs estimated (handles early-month)
      GREATEST(COALESCE(cts.total_all, 0), v_estimated_spend) AS effective_monthly_spend,
      -- Min spend met?
      CASE
        WHEN (er.conditions->>'min_spend_monthly') IS NULL THEN TRUE
        WHEN GREATEST(COALESCE(cts.total_all, 0), v_estimated_spend)
             >= (er.conditions->>'min_spend_monthly')::DECIMAL THEN TRUE
        ELSE FALSE
      END AS min_spend_met,
      -- Effective earn rate: bonus rate if conditions met, else base_rate.
      --
      -- Condition priority:
      --   1. min_spend_monthly — downrank if total spend below threshold (F31)
      --   2. user_selectable  — downrank if user hasn't picked this category
      --      in user_card_preferences (edge case 3.12, e.g. UOB Lady's Solitaire)
      --   3. Default           — use bonus rate or fall back to base_rate
      CASE
        -- F31: min_spend not met → fall back to base_rate
        WHEN (er.conditions->>'min_spend_monthly') IS NOT NULL
          AND GREATEST(COALESCE(cts.total_all, 0), v_estimated_spend)
              < (er.conditions->>'min_spend_monthly')::DECIMAL
          THEN c.base_rate_mpd
        -- User-selectable bonus category: only apply bonus if the user has
        -- explicitly selected this category in their card preferences.
        -- If no preferences exist (ucp is NULL) or the category is not in
        -- selected_categories, conservatively fall back to base_rate_mpd.
        WHEN er.conditions->>'user_selectable' = 'true'
          AND (ucp.selected_categories IS NULL
               OR NOT (p_category_id = ANY(ucp.selected_categories)))
          THEN c.base_rate_mpd
        ELSE COALESCE(er.earn_rate_mpd, c.base_rate_mpd)
      END AS earn_rate_mpd,
      cap.monthly_cap_amount                        AS monthly_cap_amount,
      cap.category_id                               AS cap_category_id,
      er.conditions_note                            AS conditions_note,
      COALESCE(cts.total_all, 0)                    AS actual_monthly_spend,
      COALESCE((er.conditions->>'contactless')::BOOLEAN, FALSE) AS requires_contactless
    FROM user_cards uc
    INNER JOIN cards c
      ON c.id = uc.card_id
    LEFT JOIN earn_rules er
      ON er.card_id = c.id
      AND er.category_id = p_category_id
      AND er.is_bonus = TRUE
      AND er.effective_to IS NULL
    -- LATERAL subquery picks the best matching cap:
    --   category-specific cap preferred over card-wide (NULL) cap.
    LEFT JOIN LATERAL (
      SELECT cap_inner.monthly_cap_amount, cap_inner.category_id
      FROM caps cap_inner
      WHERE cap_inner.card_id = c.id
        AND (cap_inner.category_id = p_category_id OR cap_inner.category_id IS NULL)
      ORDER BY cap_inner.category_id NULLS LAST
      LIMIT 1
    ) cap ON TRUE
    LEFT JOIN card_total_spending cts
      ON cts.card_id = c.id
    -- user_card_preferences: stores user's selected bonus categories for cards
    -- with user-selectable earn rules (e.g. UOB Lady's Solitaire).
    -- Unique index on (user_id, card_id) ensures minimal overhead.
    LEFT JOIN user_card_preferences ucp
      ON ucp.user_id = uc.user_id
      AND ucp.card_id = uc.card_id
    WHERE uc.user_id = v_user_id
  ),

  -- Pre-aggregate category-specific spending for this month in one scan
  category_spending AS (
    SELECT t.card_id, SUM(t.amount) AS total_cat
    FROM transactions t
    WHERE t.user_id = v_user_id
      AND t.category_id = p_category_id
      AND t.transaction_date >= (date_trunc('month', CURRENT_DATE))::date
      AND t.transaction_date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date
    GROUP BY t.card_id
  ),

  card_spending AS (
    -- Resolve the correct spending amount based on cap type:
    --   Category-specific cap -> spending in that category only
    --   Card-wide cap (NULL)  -> total spending across all categories
    SELECT
      ucr.card_id,
      ucr.card_name,
      ucr.bank,
      ucr.network,
      ucr.earn_rate_mpd,
      ucr.monthly_cap_amount,
      ucr.conditions_note,
      ucr.min_spend_threshold,
      ucr.min_spend_met,
      ucr.actual_monthly_spend,
      ucr.requires_contactless,
      CASE
        WHEN ucr.cap_category_id IS NOT NULL THEN COALESCE(cs.total_cat, 0)
        WHEN ucr.monthly_cap_amount IS NOT NULL THEN ucr.actual_monthly_spend
        ELSE 0
      END AS total_spent
    FROM user_card_rates ucr
    LEFT JOIN category_spending cs ON cs.card_id = ucr.card_id
  ),

  scored_cards AS (
    -- -----------------------------------------------------------------
    -- Step 2: Compute the ranking score for each card.
    --
    -- Formula:  score = effective_earn_rate * cap_ratio
    --
    -- effective_earn_rate falls back to base_rate when min_spend
    -- is not met, naturally downranking the card (F31).
    --
    -- cap_ratio rules:
    --   No cap defined (monthly_cap_amount IS NULL)       -> 1.0 (uncapped)
    --   Cap defined, no spending this month               -> 1.0 (full cap)
    --   Cap defined, spending >= cap                      -> 0.0 (exhausted)
    --   Cap defined, spending < cap                       -> remaining / cap
    -- -----------------------------------------------------------------
    SELECT
      csp.card_id,
      csp.card_name,
      csp.bank,
      csp.network,
      csp.earn_rate_mpd,

      CASE
        WHEN csp.monthly_cap_amount IS NULL THEN NULL::DECIMAL
        ELSE GREATEST(csp.monthly_cap_amount - csp.total_spent, 0)
      END AS remaining_cap,

      csp.monthly_cap_amount,

      csp.earn_rate_mpd * (
        CASE
          WHEN csp.monthly_cap_amount IS NULL THEN 1.0
          WHEN csp.total_spent >= csp.monthly_cap_amount THEN 0.0
          ELSE LEAST((csp.monthly_cap_amount - csp.total_spent) / csp.monthly_cap_amount, 1.0)
        END
      ) AS score,

      csp.conditions_note,
      csp.min_spend_threshold,
      csp.min_spend_met,
      csp.actual_monthly_spend,
      csp.requires_contactless

    FROM card_spending csp
  ),

  ranked_cards AS (
    -- -----------------------------------------------------------------
    -- Step 3: Rank cards by score with deterministic tiebreakers.
    --
    -- Primary:   score DESC          (highest effective earning first)
    -- Secondary: earn_rate_mpd DESC  (when scores tie -- especially when
    --            all are 0 due to exhausted caps -- rank by raw earn rate,
    --            Edge case 3.2)
    -- Tertiary:  card_name ASC       (alphabetical for determinism,
    --            Edge case 3.4)
    -- -----------------------------------------------------------------
    SELECT
      sc.card_id,
      sc.card_name,
      sc.bank,
      sc.network,
      sc.earn_rate_mpd,
      sc.remaining_cap,
      sc.monthly_cap_amount,
      sc.score,
      sc.conditions_note,
      sc.min_spend_threshold,
      sc.min_spend_met,
      sc.actual_monthly_spend,
      sc.requires_contactless,
      ROW_NUMBER() OVER (
        ORDER BY
          sc.score DESC,
          sc.earn_rate_mpd DESC,
          sc.card_name ASC
      ) AS rank
    FROM scored_cards sc
  )

  -- -----------------------------------------------------------------
  -- Step 4: Return the final result set.
  --
  -- Edge case 3.7: Single card -> rank = 1 -> is_recommended = true.
  -- The top card (rank = 1) is flagged is_recommended = TRUE;
  -- all others are FALSE.
  -- -----------------------------------------------------------------
  SELECT
    rc.card_id,
    rc.card_name,
    rc.bank,
    rc.network,
    rc.earn_rate_mpd,
    rc.remaining_cap,
    rc.monthly_cap_amount,
    rc.score,
    (rc.rank = 1) AS is_recommended,
    rc.conditions_note,
    rc.min_spend_threshold,
    rc.min_spend_met,
    rc.actual_monthly_spend AS total_monthly_spend,
    rc.requires_contactless
  FROM ranked_cards rc
  ORDER BY rc.rank;

END;
$$;

-- =============================================================================
-- Permissions
-- =============================================================================

-- Authenticated users can call recommend() via Supabase RPC.
GRANT EXECUTE ON FUNCTION public.recommend(TEXT) TO authenticated;

-- Anonymous users cannot call recommend() (requires login).
REVOKE EXECUTE ON FUNCTION public.recommend(TEXT) FROM anon;

-- =============================================================================
-- Performance indexes (idempotent -- safe to re-run)
-- =============================================================================
-- These indexes are critical for the recommendation query to avoid seq scans.
-- Most are already created in the schema migration; listed here for reference.
-- =============================================================================

-- earn_rules: partial index for active bonus rules (the hot path).
CREATE INDEX IF NOT EXISTS idx_earn_rules_card_category_active
  ON earn_rules (card_id, category_id)
  WHERE effective_to IS NULL;

-- transactions: user + card + category lookup for spend aggregation.
CREATE INDEX IF NOT EXISTS idx_transactions_user_card_category
  ON transactions (user_id, card_id, category_id);

-- =============================================================================
-- Query plan notes (5-card user, category = 'dining'):
-- =============================================================================
--
-- The query uses LATERAL subquery for caps to match both category-specific
-- and card-wide (category_id IS NULL) caps, preferring category-specific.
-- Spending is computed from transactions via two pre-aggregated CTEs:
--   category_spending  — sum per card for the requested category
--   card_total_spending — sum per card across all categories (for card-wide caps)
--
-- F31 addition: card_total_spending is also used to determine effective_monthly_spend
-- for min_spend enforcement. GREATEST(actual_spend, estimated_spend) is used so
-- early-month scenarios (low actual spend) don't penalize users who set estimates.
--
-- At typical data volumes (5-7 cards, <100 txns/month), all CTEs complete
-- via index scans.  Expected wall-clock: < 10 ms on Supabase shared instance.
-- =============================================================================
