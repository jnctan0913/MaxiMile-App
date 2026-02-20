-- =============================================================================
-- MaxiMile — Migration 016: Rate Change RPCs (Sprint 12 — F23 / S12.2)
-- =============================================================================
-- Description:  Adds RPC functions for the rate change monitoring system:
--               1. get_user_rate_changes — unread alerts for a user's portfolio
--               2. get_card_rate_changes — all recent changes for a specific card
--
-- New functions:
--   get_user_rate_changes(UUID) — returns unread rate change alerts relevant
--                                  to the user's card portfolio (last 90 days)
--   get_card_rate_changes(UUID) — returns all rate changes for a card
--                                  (last 90 days, no user/read filter)
--
-- Prerequisites:
--   - 015_rate_change_tables.sql (rate_changes, user_alert_reads tables + enums)
--   - 008_miles_portfolio.sql (cards.miles_program_id)
--   - 001_initial_schema.sql (user_cards, cards, miles_programs)
--
-- Author:  Software Engineer
-- Created: 2026-02-20
-- =============================================================================

BEGIN;


-- ==========================================================================
-- SECTION 1: get_user_rate_changes — unread alerts for user's portfolio
-- ==========================================================================
-- Returns rate changes relevant to the authenticated user's cards:
--   • Card-specific changes (rc.card_id matches a card in user_cards)
--   • Program-wide changes (rc.program_id matches miles_program_id of any
--     card in user_cards — covers devaluations affecting entire programs)
--
-- Filters:
--   • Last 90 days only (effective_date)
--   • Excludes already-read/dismissed alerts (via user_alert_reads)
--
-- Ordering: severity DESC (critical → warning → info), then newest first.

CREATE OR REPLACE FUNCTION public.get_user_rate_changes(p_user_id UUID)
RETURNS TABLE (
  rate_change_id UUID,
  card_id        UUID,
  card_name      TEXT,
  card_bank      TEXT,
  program_id     UUID,
  program_name   TEXT,
  change_type    TEXT,
  category       TEXT,
  old_value      TEXT,
  new_value      TEXT,
  effective_date DATE,
  alert_title    TEXT,
  alert_body     TEXT,
  severity       TEXT,
  source_url     TEXT,
  created_at     TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH user_card_ids AS (
    SELECT uc.card_id
    FROM public.user_cards uc
    WHERE uc.user_id = p_user_id
  ),
  user_program_ids AS (
    SELECT DISTINCT c.miles_program_id
    FROM public.user_cards uc
    JOIN public.cards c ON c.id = uc.card_id
    WHERE uc.user_id = p_user_id
      AND c.miles_program_id IS NOT NULL
  )
  SELECT
    rc.id              AS rate_change_id,
    rc.card_id,
    c.name             AS card_name,
    c.bank             AS card_bank,
    rc.program_id,
    mp.name            AS program_name,
    rc.change_type::TEXT,
    rc.category,
    rc.old_value,
    rc.new_value,
    rc.effective_date,
    rc.alert_title,
    rc.alert_body,
    rc.severity::TEXT,
    rc.source_url,
    rc.created_at
  FROM public.rate_changes rc
  LEFT JOIN public.cards c ON c.id = rc.card_id
  LEFT JOIN public.miles_programs mp ON mp.id = rc.program_id
  LEFT JOIN public.user_alert_reads uar
    ON uar.rate_change_id = rc.id
    AND uar.user_id = p_user_id
  WHERE
    uar.id IS NULL
    AND rc.effective_date > (CURRENT_DATE - INTERVAL '90 days')
    AND (
      rc.card_id IN (SELECT uci.card_id FROM user_card_ids uci)
      OR rc.program_id IN (SELECT upi.miles_program_id FROM user_program_ids upi)
    )
  ORDER BY
    CASE rc.severity
      WHEN 'critical' THEN 1
      WHEN 'warning'  THEN 2
      WHEN 'info'     THEN 3
    END ASC,
    rc.effective_date DESC;
END;
$$;

COMMENT ON FUNCTION public.get_user_rate_changes(UUID)
  IS 'Returns unread rate change alerts relevant to a user''s card portfolio. '
     'Includes card-specific and program-wide changes from the last 90 days. '
     'Ordered by severity (critical first) then newest effective_date.';

GRANT EXECUTE ON FUNCTION public.get_user_rate_changes(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_rate_changes(UUID) FROM anon;


-- ==========================================================================
-- SECTION 2: get_card_rate_changes — all recent changes for a specific card
-- ==========================================================================
-- For the card detail screen. Returns all rate changes linked to a card
-- (last 90 days). Not filtered by user or read status — any authenticated
-- user viewing a card can see its change history.

CREATE OR REPLACE FUNCTION public.get_card_rate_changes(p_card_id UUID)
RETURNS TABLE (
  rate_change_id UUID,
  card_id        UUID,
  card_name      TEXT,
  card_bank      TEXT,
  program_id     UUID,
  program_name   TEXT,
  change_type    TEXT,
  category       TEXT,
  old_value      TEXT,
  new_value      TEXT,
  effective_date DATE,
  alert_title    TEXT,
  alert_body     TEXT,
  severity       TEXT,
  source_url     TEXT,
  created_at     TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rc.id              AS rate_change_id,
    rc.card_id,
    c.name             AS card_name,
    c.bank             AS card_bank,
    rc.program_id,
    mp.name            AS program_name,
    rc.change_type::TEXT,
    rc.category,
    rc.old_value,
    rc.new_value,
    rc.effective_date,
    rc.alert_title,
    rc.alert_body,
    rc.severity::TEXT,
    rc.source_url,
    rc.created_at
  FROM public.rate_changes rc
  LEFT JOIN public.cards c ON c.id = rc.card_id
  LEFT JOIN public.miles_programs mp ON mp.id = rc.program_id
  WHERE
    rc.card_id = p_card_id
    AND rc.effective_date > (CURRENT_DATE - INTERVAL '90 days')
  ORDER BY rc.effective_date DESC;
END;
$$;

COMMENT ON FUNCTION public.get_card_rate_changes(UUID)
  IS 'Returns all rate changes for a specific card from the last 90 days. '
     'Ordered by effective_date DESC. No user/read filtering — for card detail view.';

GRANT EXECUTE ON FUNCTION public.get_card_rate_changes(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_card_rate_changes(UUID) FROM anon;


COMMIT;
