-- Fix: column reference "manual_balance" is ambiguous (42702)
-- PL/pgSQL RETURNS TABLE output params shadow CTE columns of the same name.
-- #variable_conflict use_column tells PG to prefer the SQL column over the
-- output parameter variable when names collide.

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
#variable_conflict use_column
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

GRANT EXECUTE ON FUNCTION public.get_miles_portfolio(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_miles_portfolio(UUID) FROM anon;
