-- =============================================================================
-- MaxiMile — Migration 012: Miles Ecosystem RPCs (Sprint 9 — F19 + S9.4/S9.5)
-- =============================================================================
-- Description:  Adds RPC functions for the miles ecosystem:
--               1. Updated get_miles_portfolio — optional program_type filter
--               2. get_transfer_options — transfer partners for a source program
--               3. get_potential_miles — potential airline miles from bank points
--
-- New/updated functions:
--   get_miles_portfolio(UUID, TEXT)   — adds optional p_program_type filter
--   get_transfer_options(UUID)       — returns transfer partners with rates
--   get_potential_miles(UUID, UUID)   — calculates potential miles from bank pts
--
-- Prerequisites:
--   - 011_miles_ecosystem.sql (transfer_partners table, expanded programs)
--
-- Author:  Software Engineer
-- Created: 2026-02-20
-- =============================================================================

BEGIN;


-- ==========================================================================
-- SECTION 1: Update get_miles_portfolio — add optional program_type filter
-- ==========================================================================
-- Drop the old single-parameter version and create a new version with an
-- optional p_program_type parameter. When NULL (default), returns all
-- programs (backward compatible). When 'airline', returns airline only.
-- When 'bank_points', returns bank_points + transferable.

DROP FUNCTION IF EXISTS public.get_miles_portfolio(UUID);

CREATE OR REPLACE FUNCTION public.get_miles_portfolio(
  p_user_id      UUID,
  p_program_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  program_id        UUID,
  program_name      TEXT,
  airline           TEXT,
  program_type      TEXT,
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
    SELECT DISTINCT mp.id, mp.name, mp.airline, mp.program_type, mp.icon_url
    FROM public.user_cards uc
    JOIN public.cards c ON uc.card_id = c.id
    JOIN public.miles_programs mp ON c.miles_program_id = mp.id
    WHERE uc.user_id = p_user_id
      AND (
        p_program_type IS NULL
        OR (p_program_type = 'airline' AND mp.program_type = 'airline')
        OR (p_program_type = 'bank_points' AND mp.program_type IN ('bank_points', 'transferable'))
      )
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
    up.program_type,
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

COMMENT ON FUNCTION public.get_miles_portfolio(UUID, TEXT)
  IS 'Returns per-program miles breakdown. Optional p_program_type filter: NULL=all, ''airline''=airline only, ''bank_points''=bank_points+transferable.';

GRANT EXECUTE ON FUNCTION public.get_miles_portfolio(UUID, TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_miles_portfolio(UUID, TEXT) FROM anon;


-- ==========================================================================
-- SECTION 2: get_transfer_options — transfer partners for a source program
-- ==========================================================================
-- Given a source program (e.g., DBS Points), returns all destination
-- airline programs with conversion rates, sorted by best rate (lowest
-- points-per-mile ratio first).

CREATE OR REPLACE FUNCTION public.get_transfer_options(p_program_id UUID)
RETURNS TABLE (
  transfer_id           UUID,
  destination_id        UUID,
  destination_name      TEXT,
  destination_airline   TEXT,
  destination_icon      TEXT,
  conversion_rate_from  INTEGER,
  conversion_rate_to    INTEGER,
  points_per_mile       NUMERIC,
  transfer_fee_sgd      DECIMAL(10,2),
  min_transfer_amount   INTEGER,
  last_verified_at      TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tp.id                                                    AS transfer_id,
    mp.id                                                    AS destination_id,
    mp.name                                                  AS destination_name,
    mp.airline                                               AS destination_airline,
    mp.icon_url                                              AS destination_icon,
    tp.conversion_rate_from,
    tp.conversion_rate_to,
    ROUND(tp.conversion_rate_from::NUMERIC / tp.conversion_rate_to::NUMERIC, 2) AS points_per_mile,
    tp.transfer_fee_sgd,
    tp.min_transfer_amount,
    tp.last_verified_at
  FROM public.transfer_partners tp
  JOIN public.miles_programs mp ON tp.destination_program_id = mp.id
  WHERE tp.source_program_id = p_program_id
  ORDER BY (tp.conversion_rate_from::NUMERIC / tp.conversion_rate_to::NUMERIC) ASC;
END;
$$;

COMMENT ON FUNCTION public.get_transfer_options(UUID)
  IS 'Returns all transfer destination programs for a source program, with conversion rates sorted by best value (lowest points-per-mile first).';

GRANT EXECUTE ON FUNCTION public.get_transfer_options(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_transfer_options(UUID) FROM anon;


-- ==========================================================================
-- SECTION 3: get_potential_miles — potential airline miles from bank points
-- ==========================================================================
-- Calculates how many airline miles a user could get by transferring their
-- bank reward points to a specific airline FFP program.
-- Returns a breakdown by source program showing: source balance, rate, and
-- potential miles.

CREATE OR REPLACE FUNCTION public.get_potential_miles(
  p_user_id                UUID,
  p_destination_program_id UUID
)
RETURNS TABLE (
  source_program_id    UUID,
  source_program_name  TEXT,
  source_balance       BIGINT,
  conversion_rate_from INTEGER,
  conversion_rate_to   INTEGER,
  transfer_fee_sgd     DECIMAL(10,2),
  potential_miles       BIGINT,
  total_potential       BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
DECLARE
  v_total BIGINT := 0;
BEGIN
  -- First pass: calculate total potential miles for the summary field
  SELECT COALESCE(SUM(
    FLOOR(
      COALESCE(mb.manual_balance, 0)::NUMERIC
      * tp.conversion_rate_to::NUMERIC
      / tp.conversion_rate_from::NUMERIC
    )
  ), 0)::BIGINT
  INTO v_total
  FROM public.transfer_partners tp
  JOIN public.miles_programs src ON tp.source_program_id = src.id
  LEFT JOIN public.miles_balances mb
    ON mb.user_id = p_user_id AND mb.miles_program_id = tp.source_program_id
  WHERE tp.destination_program_id = p_destination_program_id
    AND COALESCE(mb.manual_balance, 0) > 0;

  -- Second pass: return per-source breakdown
  RETURN QUERY
  SELECT
    tp.source_program_id,
    src.name                                                   AS source_program_name,
    COALESCE(mb.manual_balance, 0)::BIGINT                     AS source_balance,
    tp.conversion_rate_from,
    tp.conversion_rate_to,
    tp.transfer_fee_sgd,
    FLOOR(
      COALESCE(mb.manual_balance, 0)::NUMERIC
      * tp.conversion_rate_to::NUMERIC
      / tp.conversion_rate_from::NUMERIC
    )::BIGINT                                                  AS potential_miles,
    v_total                                                    AS total_potential
  FROM public.transfer_partners tp
  JOIN public.miles_programs src ON tp.source_program_id = src.id
  LEFT JOIN public.miles_balances mb
    ON mb.user_id = p_user_id AND mb.miles_program_id = tp.source_program_id
  WHERE tp.destination_program_id = p_destination_program_id
    AND COALESCE(mb.manual_balance, 0) > 0
  ORDER BY FLOOR(
    COALESCE(mb.manual_balance, 0)::NUMERIC
    * tp.conversion_rate_to::NUMERIC
    / tp.conversion_rate_from::NUMERIC
  ) DESC;
END;
$$;

COMMENT ON FUNCTION public.get_potential_miles(UUID, UUID)
  IS 'Calculates potential airline miles from a user''s bank points for a specific destination program. Returns per-source breakdown with total.';

GRANT EXECUTE ON FUNCTION public.get_potential_miles(UUID, UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_potential_miles(UUID, UUID) FROM anon;


COMMIT;
