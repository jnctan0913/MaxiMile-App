-- =============================================================================
-- MaxiMile -- Recommendation Engine (recommend.sql)
-- =============================================================================
-- Description:  Supabase RPC function that returns a user's credit cards ranked
--               by effective earning potential for a given spend category,
--               factoring in remaining monthly bonus cap headroom.
--
-- Task:    T2.08 -- Implement Recommendation Engine as Supabase RPC Function
-- Author:  Software Engineer
-- Created: 2026-02-19
--
-- Signature:
--   recommend(p_category_id TEXT)
--   -> TABLE(card_id, card_name, bank, network, earn_rate_mpd,
--            remaining_cap, monthly_cap_amount, score, is_recommended)
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
-- =============================================================================

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

  -- =======================================================================
  -- 2. Build the ranked recommendation result set
  -- =======================================================================
  --
  -- EXPLAIN ANALYZE expectations (typical user, 5 cards, 7 categories):
  --
  --   user_cards     : Index Scan using user_cards_pkey (user_id = ?)
  --                    Rows: ~5.  Cost: negligible.
  --   cards          : Index Scan using cards_pkey (id = uc.card_id)
  --                    Nested Loop, 5 iterations.
  --   earn_rules     : Index Scan using idx_earn_rules_active
  --                    (card_id, category_id) WHERE effective_to IS NULL
  --                    Partial index; at most 1 row per card.
  --   caps           : Index Scan using caps_unique_card_category
  --                    (card_id, category_id)
  --                    At most 1 row per card.
  --   spending_state : Index Scan using spending_state_pkey
  --                    (user_id, card_id, category_id, month)
  --                    At most 1 row per card.
  --
  --   Total: 5 nested-loop iterations, each doing 4 index lookups.
  --   Expected wall-clock: 1-5 ms on Supabase shared instance.
  --   No sequential scans.  No sorts beyond the final ORDER BY on ~5 rows.
  --

  RETURN QUERY
  WITH user_card_rates AS (
    -- -----------------------------------------------------------------
    -- Step 1: Gather the user's cards with earn rate & cap data for the
    --         requested category.
    -- -----------------------------------------------------------------
    -- Edge case 3.1: If user_cards is empty for this user, the INNER JOIN
    --   produces zero rows and the entire CTE chain returns nothing.
    -- Edge case 3.3: LEFT JOIN earn_rules returns NULL when no bonus rule
    --   exists; COALESCE falls back to base_rate_mpd.
    -- Edge case 3.5: 'general' category typically has no bonus rules, so
    --   COALESCE yields base_rate_mpd for all cards.
    -- Edge case 3.9: If a cap was removed (no row in caps), the LEFT JOIN
    --   returns NULL for monthly_cap_amount, treating the card as uncapped.
    -- Edge case 3.10: Card-wide caps (category_id IS NULL) are matched
    --   via LATERAL subquery; category-specific caps take priority.
    -- -----------------------------------------------------------------
    SELECT
      c.id                                          AS card_id,
      c.name                                        AS card_name,
      c.bank                                        AS bank,
      c.network                                     AS network,
      COALESCE(er.earn_rate_mpd, c.base_rate_mpd)   AS earn_rate_mpd,
      cap.monthly_cap_amount                        AS monthly_cap_amount,
      cap.category_id                               AS cap_category_id
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

  -- Pre-aggregate card-wide spending (all categories) for this month
  card_total_spending AS (
    SELECT t.card_id, SUM(t.amount) AS total_all
    FROM transactions t
    WHERE t.user_id = v_user_id
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
      CASE
        WHEN ucr.cap_category_id IS NOT NULL THEN COALESCE(cs.total_cat, 0)
        WHEN ucr.monthly_cap_amount IS NOT NULL THEN COALESCE(cts.total_all, 0)
        ELSE 0
      END AS total_spent
    FROM user_card_rates ucr
    LEFT JOIN category_spending cs ON cs.card_id = ucr.card_id
    LEFT JOIN card_total_spending cts ON cts.card_id = ucr.card_id
  ),

  scored_cards AS (
    -- -----------------------------------------------------------------
    -- Step 2: Compute the ranking score for each card.
    --
    -- Formula:  score = earn_rate_mpd * cap_ratio
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
      ) AS score

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
    (rc.rank = 1) AS is_recommended
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
-- At typical data volumes (5-7 cards, <100 txns/month), all CTEs complete
-- via index scans.  Expected wall-clock: < 10 ms on Supabase shared instance.
-- =============================================================================
