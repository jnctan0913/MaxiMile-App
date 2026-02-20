-- =============================================================================
-- MaxiMile -- Monthly Cap Reset (reset_monthly_caps.sql)
-- =============================================================================
-- Description:  Utility function for administrative cleanup of spending_state
--               rows.  In the MVP, monthly cap resets are handled implicitly:
--               the recommend() function filters spending_state by the current
--               month (YYYY-MM), so when a new month begins, there are no rows
--               for that month and all caps are treated as fully available.
--               No cron job or explicit reset is required.
--
-- Task:    T2.08 -- Monthly Cap Reset (part of Recommendation Engine build)
-- Author:  Software Engineer
-- Created: 2026-02-19
--
-- =============================================================================
-- MVP APPROACH: IMPLICIT RESET
-- =============================================================================
--
-- How it works:
--
--   1. spending_state rows are keyed on (user_id, card_id, category_id, month).
--   2. recommend() always queries WHERE month = to_char(NOW(), 'YYYY-MM').
--   3. On the 1st of a new month, no spending_state rows exist for the new
--      month.  The LEFT JOIN in recommend() returns NULL for remaining_cap.
--   4. The CASE expression in recommend() interprets NULL remaining_cap (when
--      a cap IS defined) as "full cap available" -> cap_ratio = 1.0.
--
-- Result: caps automatically reset at month boundaries with zero maintenance.
--
-- Old months' spending_state rows accumulate but are:
--   - Harmless (never read by recommend() unless month matches)
--   - Useful for historical spend tracking (future feature)
--   - Cleanable via reset_caps_for_month() below
--
-- =============================================================================
-- FUTURE APPROACH: pg_cron (when needed)
-- =============================================================================
--
-- If proactive cap alerts (Feature F6) require initialization of spending_state
-- rows at the start of each month, a pg_cron job can be added:
--
--   SELECT cron.schedule(
--     'monthly-cap-reset',
--     '0 16 L * *',   -- midnight SGT (UTC+8) on last day of month
--     $$ SELECT reset_caps_for_month(
--          to_char(NOW() - INTERVAL '2 months', 'YYYY-MM')
--        ); $$
--   );
--
-- This would purge stale rows older than 2 months to keep the table lean.
--
-- =============================================================================


-- =============================================================================
-- Utility: reset_caps_for_month(p_month TEXT)
-- =============================================================================
-- Deletes all spending_state rows for the specified month.
-- Intended for admin use only (manual cleanup / testing).
--
-- Parameters:
--   p_month TEXT  -- Calendar month in 'YYYY-MM' format, e.g. '2026-01'
--
-- Returns:
--   INTEGER  -- Number of rows deleted
--
-- Examples:
--   SELECT reset_caps_for_month('2026-01');  -- clean up January
--   SELECT reset_caps_for_month('2025-12');  -- clean up December
--
-- Security:
--   SECURITY DEFINER to bypass RLS on spending_state.
--   Only grant EXECUTE to service_role (admin) -- not to authenticated users.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.reset_caps_for_month(p_month TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  -- =========================================================================
  -- 1. Validate input format (YYYY-MM).
  -- =========================================================================
  IF p_month !~ '^\d{4}-(0[1-9]|1[0-2])$' THEN
    RAISE EXCEPTION 'Invalid month format: %. Expected YYYY-MM (e.g. 2026-02).', p_month
      USING ERRCODE = 'P0001';
  END IF;

  -- =========================================================================
  -- 2. Safety: prevent deleting the current month's data accidentally.
  --    Admin can override by calling reset_caps_for_month_force() (not
  --    implemented in MVP -- this guard is sufficient).
  -- =========================================================================
  IF p_month = to_char(NOW(), 'YYYY-MM') THEN
    RAISE EXCEPTION 'Cannot reset the current month (%). '
      'This would delete live spending data.  '
      'If you really need to do this, delete rows manually via service_role.',
      p_month
      USING ERRCODE = 'P0001';
  END IF;

  -- =========================================================================
  -- 3. Delete all spending_state rows for the given month.
  --    This affects ALL users.  The WHERE clause uses the month column which
  --    is part of the composite PK, so this is an efficient index scan.
  -- =========================================================================
  DELETE FROM spending_state
  WHERE month = p_month;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  -- =========================================================================
  -- 4. Log the action (appears in Supabase Logs > Database).
  -- =========================================================================
  RAISE NOTICE 'reset_caps_for_month(%): deleted % spending_state rows.',
    p_month, v_deleted;

  RETURN v_deleted;
END;
$$;

COMMENT ON FUNCTION public.reset_caps_for_month(TEXT)
  IS 'Admin utility: deletes all spending_state rows for a given month (YYYY-MM). '
     'Cannot delete the current month. Returns the number of rows deleted. '
     'SECURITY DEFINER to bypass RLS.';

-- =============================================================================
-- Permissions
-- =============================================================================

-- Only the service_role (admin) can call this function.
-- Revoke from all, then grant only to postgres (owner) implicitly.
REVOKE EXECUTE ON FUNCTION public.reset_caps_for_month(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reset_caps_for_month(TEXT) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.reset_caps_for_month(TEXT) FROM anon;

-- If you need to grant to a specific admin role:
-- GRANT EXECUTE ON FUNCTION public.reset_caps_for_month(TEXT) TO service_role;


-- =============================================================================
-- Companion utility: purge_old_spending_state(p_months_to_keep INTEGER)
-- =============================================================================
-- Convenience wrapper that deletes spending_state rows older than N months.
-- Useful for periodic cleanup (e.g. keep last 3 months, purge the rest).
-- =============================================================================

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
  -- Validate input.
  IF p_months_to_keep < 1 THEN
    RAISE EXCEPTION 'p_months_to_keep must be >= 1 (got %).', p_months_to_keep
      USING ERRCODE = 'P0001';
  END IF;

  -- Calculate the cutoff: months strictly older than this are purged.
  -- Example: NOW() = 2026-02-19, p_months_to_keep = 3
  --   -> cutoff = '2025-11' (keep Dec, Jan, Feb)
  v_cutoff_month := to_char(
    NOW() - (p_months_to_keep || ' months')::INTERVAL,
    'YYYY-MM'
  );

  -- Delete all rows from months before the cutoff.
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
     'Default keeps 3 months. Returns number of rows deleted. '
     'SECURITY DEFINER to bypass RLS.';

-- Restrict access.
REVOKE EXECUTE ON FUNCTION public.purge_old_spending_state(INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.purge_old_spending_state(INTEGER) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.purge_old_spending_state(INTEGER) FROM anon;
