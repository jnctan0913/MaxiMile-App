-- =============================================================================
-- Migration: Remap UOB Lady's Solitaire to official UOB category names
-- =============================================================================
-- Per UOB Lady's Card FAQ (faqs-final.pdf), the 7 selectable categories are:
--
--   Beauty & Wellness  MCCs 5912, 5977, 7230, 7231, 7297, 7298
--   Dining             MCCs 5811, 5812, 5814, 5499
--   Entertainment      MCCs 5813, 7832, 7922
--   Family             MCCs 5411, 5641
--   Fashion            MCCs 5311, 5611, 5621, 5631, 5651, 5661, 5655, 5691, 5699, 5948
--   Transport          MCCs 4111, 4121, 4789, 5541, 5542
--   Travel             credit card retail at airlines/hotels
--
-- Mapping to MaxiMile categories:
--   Dining        → dining
--   Transport     → transport AND petrol (UOB Transport includes petrol MCCs)
--   Family        → groceries
--   Travel        → travel
--   Entertainment → general (entertainment merchants)
--   Fashion       → general (fashion/department store merchants)
--   Beauty & Wellness → bills/pharmacy (MCC 5912) + general (spas/wellness)
--
-- Changes:
--   1. Revert migration 7: re-add user_selectable to pharmacy bonus rule
--   2. Delete the 'online' bonus rule (not a UOB category)
--   3. Add 'petrol' bonus rule (Transport includes petrol MCCs 5541, 5542)
--   4. Update recommend() to map MaxiMile category → UOB category names
--      when checking user_card_preferences.selected_categories
-- =============================================================================

BEGIN;

-- ============================================================
-- 1. Revert migration 7: pharmacy must be user_selectable
--    (gated by "Beauty & Wellness" selection)
-- ============================================================

UPDATE public.earn_rules
SET conditions = '{"subcategory":"pharmacy","user_selectable":"true"}'::jsonb,
    conditions_note = 'Earn 4 mpd (10X UNI$) at pharmacies (Guardian, Watsons, Unity) if Beauty & Wellness is a selected preferred category. Cap: $750/mo per category. [VERIFIED from UOB FAQ]',
    updated_at = NOW()
WHERE card_id = '00000000-0000-0000-0003-000000000022'
  AND category_id = 'bills'
  AND is_bonus = TRUE
  AND conditions->>'subcategory' = 'pharmacy';

-- ============================================================
-- 2. Delete 'online' bonus rule (not a UOB selectable category)
-- ============================================================

DELETE FROM public.earn_rules
WHERE card_id = '00000000-0000-0000-0003-000000000022'
  AND category_id = 'online'
  AND is_bonus = TRUE;

-- ============================================================
-- 3. Add 'petrol' bonus rule
--    UOB Transport category includes petrol MCCs 5541, 5542
-- ============================================================

INSERT INTO public.earn_rules (
  card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note,
  effective_from, effective_to
) VALUES (
  '00000000-0000-0000-0003-000000000022', 'petrol', 4.0, TRUE,
  '{"user_selectable":"true"}'::jsonb,
  'Earn 4 mpd (10X UNI$) at petrol stations if Transport is a selected preferred category. UOB Transport category includes petrol MCCs 5541/5542. Cap: $750/mo per category. [VERIFIED from UOB FAQ]',
  '2026-03-03', NULL
);

-- ============================================================
-- 4. Update recommend() function
--    Map MaxiMile categories to UOB selectable category names
--    when checking user_card_preferences.selected_categories
-- ============================================================

CREATE OR REPLACE FUNCTION public.recommend(p_category_id TEXT, p_subcategory TEXT DEFAULT NULL)
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
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = 'PGRST301';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = p_category_id) THEN
    RAISE EXCEPTION 'Invalid category: %', p_category_id USING ERRCODE = 'P0001';
  END IF;

  v_current_month := to_char(NOW(), 'YYYY-MM');
  v_estimated_spend := 0;

  RETURN QUERY

  WITH subcategory_base AS (
    SELECT er.card_id, er.earn_rate_mpd AS subcategory_base_rate
    FROM earn_rules er
    WHERE er.category_id = p_category_id
      AND er.is_bonus = FALSE
      AND er.effective_to IS NULL
      AND (
        CASE WHEN p_subcategory IS NOT NULL
          THEN er.conditions->>'subcategory' = p_subcategory
          ELSE er.conditions->>'subcategory' IS NULL
        END
      )
  ),

  card_total_spending AS (
    SELECT t.card_id, SUM(t.amount) AS total_all
    FROM transactions t
    WHERE t.user_id = v_user_id
      AND t.transaction_date >= (date_trunc('month', CURRENT_DATE))::date
      AND t.transaction_date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date
    GROUP BY t.card_id
  ),

  user_card_rates AS (
    SELECT
      c.id                                                        AS card_id,
      c.name                                                      AS card_name,
      c.bank                                                      AS bank,
      c.network                                                   AS network,
      COALESCE(sb.subcategory_base_rate, c.base_rate_mpd)        AS base_rate_mpd,
      (er.conditions->>'min_spend_monthly')::DECIMAL             AS min_spend_threshold,
      GREATEST(COALESCE(cts.total_all, 0), v_estimated_spend)    AS effective_monthly_spend,
      CASE
        WHEN (er.conditions->>'min_spend_monthly') IS NULL THEN TRUE
        WHEN GREATEST(COALESCE(cts.total_all, 0), v_estimated_spend)
             >= (er.conditions->>'min_spend_monthly')::DECIMAL THEN TRUE
        ELSE FALSE
      END AS min_spend_met,
      -- Earn rate with user-selectable gating
      -- Maps MaxiMile categories to UOB Lady's selectable category names:
      --   dining    → 'Dining'
      --   transport → 'Transport'
      --   petrol    → 'Transport'  (UOB Transport includes petrol MCCs)
      --   groceries → 'Family'
      --   travel    → 'Travel'
      --   general   → 'Entertainment' OR 'Fashion'
      --   bills/pharmacy → 'Beauty & Wellness'
      CASE
        WHEN (er.conditions->>'min_spend_monthly') IS NOT NULL
          AND GREATEST(COALESCE(cts.total_all, 0), v_estimated_spend)
              < (er.conditions->>'min_spend_monthly')::DECIMAL
          THEN COALESCE(sb.subcategory_base_rate, c.base_rate_mpd)
        WHEN er.conditions->>'user_selectable' = 'true'
          AND (ucp.selected_categories IS NULL
               OR NOT (
                 CASE
                   WHEN p_category_id = 'dining'    THEN 'Dining' = ANY(ucp.selected_categories)
                   WHEN p_category_id = 'transport'  THEN 'Transport' = ANY(ucp.selected_categories)
                   WHEN p_category_id = 'petrol'     THEN 'Transport' = ANY(ucp.selected_categories)
                   WHEN p_category_id = 'groceries'  THEN 'Family' = ANY(ucp.selected_categories)
                   WHEN p_category_id = 'travel'     THEN 'Travel' = ANY(ucp.selected_categories)
                   WHEN p_category_id = 'general'    THEN ('Entertainment' = ANY(ucp.selected_categories)
                                                           OR 'Fashion' = ANY(ucp.selected_categories))
                   WHEN p_category_id = 'bills'
                     AND p_subcategory = 'pharmacy'  THEN 'Beauty & Wellness' = ANY(ucp.selected_categories)
                   ELSE FALSE
                 END
               ))
          THEN COALESCE(sb.subcategory_base_rate, c.base_rate_mpd)
        ELSE COALESCE(er.earn_rate_mpd, COALESCE(sb.subcategory_base_rate, c.base_rate_mpd))
      END AS earn_rate_mpd,
      cap.monthly_cap_amount                                      AS monthly_cap_amount,
      cap.category_id                                             AS cap_category_id,
      er.conditions_note                                          AS conditions_note,
      COALESCE(cts.total_all, 0)                                  AS actual_monthly_spend,
      COALESCE((er.conditions->>'contactless')::BOOLEAN, FALSE)  AS requires_contactless
    FROM user_cards uc
    INNER JOIN cards c ON c.id = uc.card_id
    LEFT JOIN earn_rules er
      ON er.card_id = c.id
      AND er.category_id = p_category_id
      AND er.is_bonus = TRUE
      AND er.effective_to IS NULL
      AND (
        CASE WHEN p_subcategory IS NOT NULL
          THEN er.conditions->>'subcategory' = p_subcategory
          ELSE er.conditions->>'subcategory' IS NULL
        END
      )
    LEFT JOIN subcategory_base sb ON sb.card_id = c.id
    LEFT JOIN LATERAL (
      SELECT cap_inner.monthly_cap_amount, cap_inner.category_id
      FROM caps cap_inner
      WHERE cap_inner.card_id = c.id
        AND (cap_inner.category_id = p_category_id OR cap_inner.category_id IS NULL)
      ORDER BY cap_inner.category_id NULLS LAST
      LIMIT 1
    ) cap ON TRUE
    LEFT JOIN card_total_spending cts ON cts.card_id = c.id
    LEFT JOIN user_card_preferences ucp
      ON ucp.user_id = uc.user_id AND ucp.card_id = uc.card_id
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

  card_spending AS (
    SELECT
      ucr.card_id, ucr.card_name, ucr.bank, ucr.network,
      ucr.earn_rate_mpd, ucr.monthly_cap_amount, ucr.conditions_note,
      ucr.min_spend_threshold, ucr.min_spend_met, ucr.actual_monthly_spend,
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
    SELECT
      csp.card_id, csp.card_name, csp.bank, csp.network, csp.earn_rate_mpd,
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
      csp.conditions_note, csp.min_spend_threshold, csp.min_spend_met,
      csp.actual_monthly_spend, csp.requires_contactless
    FROM card_spending csp
  ),

  ranked_cards AS (
    SELECT
      sc.card_id, sc.card_name, sc.bank, sc.network, sc.earn_rate_mpd,
      sc.remaining_cap, sc.monthly_cap_amount, sc.score,
      sc.conditions_note, sc.min_spend_threshold, sc.min_spend_met,
      sc.actual_monthly_spend, sc.requires_contactless,
      ROW_NUMBER() OVER (
        ORDER BY sc.score DESC, sc.earn_rate_mpd DESC, sc.card_name ASC
      ) AS rank
    FROM scored_cards sc
  )

  SELECT
    rc.card_id, rc.card_name, rc.bank, rc.network, rc.earn_rate_mpd,
    rc.remaining_cap, rc.monthly_cap_amount, rc.score,
    (rc.rank = 1) AS is_recommended,
    rc.conditions_note, rc.min_spend_threshold, rc.min_spend_met,
    rc.actual_monthly_spend AS total_monthly_spend, rc.requires_contactless
  FROM ranked_cards rc
  ORDER BY rc.rank;

END;
$$;

GRANT EXECUTE ON FUNCTION public.recommend(TEXT, TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.recommend(TEXT, TEXT) FROM anon;

COMMIT;
