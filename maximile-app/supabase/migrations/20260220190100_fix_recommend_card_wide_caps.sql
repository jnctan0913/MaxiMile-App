-- Fix: recommend() now matches card-wide caps (category_id IS NULL)
-- Previously only matched category-specific caps, causing cards with
-- card-wide caps to show "No cap limit" incorrectly.

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

  RETURN QUERY
  WITH user_card_rates AS (
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

  category_spending AS (
    SELECT t.card_id, SUM(t.amount) AS total_cat
    FROM transactions t
    WHERE t.user_id = v_user_id
      AND t.category_id = p_category_id
      AND t.transaction_date >= (date_trunc('month', CURRENT_DATE))::date
      AND t.transaction_date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date
    GROUP BY t.card_id
  ),

  card_total_spending AS (
    SELECT t.card_id, SUM(t.amount) AS total_all
    FROM transactions t
    WHERE t.user_id = v_user_id
      AND t.transaction_date >= (date_trunc('month', CURRENT_DATE))::date
      AND t.transaction_date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date
    GROUP BY t.card_id
  ),

  card_spending AS (
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

GRANT EXECUTE ON FUNCTION public.recommend(TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.recommend(TEXT) FROM anon;

CREATE INDEX IF NOT EXISTS idx_earn_rules_card_category_active
  ON earn_rules (card_id, category_id)
  WHERE effective_to IS NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_user_card_category
  ON transactions (user_id, card_id, category_id);
