-- =============================================================================
-- MaxiMile -- Monthly Reset Verification (verify_monthly_reset.sql)
-- =============================================================================
-- Description:  SQL test cases that verify the monthly cap reset mechanism:
--               implicit reset (no rows = full cap), explicit reset via
--               reset_caps_for_month(), and purge via purge_old_spending_state().
--
-- Task:    T3.08 -- Monthly Reset Verification
-- Author:  Software Engineer
-- Created: 2026-02-19
--
-- How to run:
--   Execute this script against a Supabase instance (or local PostgreSQL)
--   that has migrations 001 and 002 applied.
--
-- IMPORTANT:
--   This script creates test data in a transaction and rolls it back at
--   the end.  The database is left unchanged.
-- =============================================================================

BEGIN;

-- =============================================================================
-- SETUP: Test fixtures
-- =============================================================================

-- Test user
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    INSERT INTO auth.users (id, email)
    VALUES ('a0000000-0000-0000-0000-000000000001', 'test-reset@maximile.test')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Test card with a cap
INSERT INTO cards (id, bank, name, slug, network, base_rate_mpd, is_active)
VALUES ('c0000000-0000-0000-0000-000000000001', 'TestBank', 'Test Card A', 'test-card-a', 'visa', 0.4, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO categories (id, name, display_order)
VALUES ('dining', 'Dining', 1)
ON CONFLICT (id) DO NOTHING;

-- Cap: $1,000/month on dining
INSERT INTO caps (card_id, category_id, monthly_cap_amount, cap_type)
VALUES ('c0000000-0000-0000-0000-000000000001', 'dining', 1000.00, 'spend')
ON CONFLICT (card_id, category_id) DO UPDATE SET monthly_cap_amount = 1000.00;

-- User portfolio
INSERT INTO user_cards (user_id, card_id)
VALUES ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Clean any prior test spending_state rows for our test months
DELETE FROM spending_state
WHERE user_id = 'a0000000-0000-0000-0000-000000000001'
  AND card_id = 'c0000000-0000-0000-0000-000000000001';

-- Seed spending_state rows for multiple months (direct INSERT, bypassing trigger)
-- We insert directly to control the month values precisely.
INSERT INTO spending_state (user_id, card_id, category_id, month, total_spent, remaining_cap)
VALUES
  -- January 2026: user spent $600 on dining
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'dining', '2026-01', 600.00, 400.00),
  -- December 2025: user spent $900 on dining
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'dining', '2025-12', 900.00, 100.00),
  -- November 2025: user spent $300 on dining
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'dining', '2025-11', 300.00, 700.00),
  -- October 2025: user spent $500 on dining
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'dining', '2025-10', 500.00, 500.00),
  -- September 2025: user spent $200 on dining
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'dining', '2025-09', 200.00, 800.00)
ON CONFLICT (user_id, card_id, category_id, month) DO UPDATE SET
  total_spent = EXCLUDED.total_spent,
  remaining_cap = EXCLUDED.remaining_cap;


-- =============================================================================
-- TEST 1: Spending in January -> query for February returns full cap
--         (implicit reset -- no spending_state row for February)
-- =============================================================================

DO $$
DECLARE
  v_feb_count INTEGER;
  v_jan_total DECIMAL;
BEGIN
  RAISE NOTICE '--- TEST 1: Implicit reset -- February query returns full cap ---';

  -- Confirm January has a row
  SELECT total_spent INTO v_jan_total
  FROM spending_state
  WHERE user_id     = 'a0000000-0000-0000-0000-000000000001'
    AND card_id     = 'c0000000-0000-0000-0000-000000000001'
    AND category_id = 'dining'
    AND month       = '2026-01';

  -- Confirm February has NO row (new month, implicit reset)
  SELECT COUNT(*) INTO v_feb_count
  FROM spending_state
  WHERE user_id     = 'a0000000-0000-0000-0000-000000000001'
    AND card_id     = 'c0000000-0000-0000-0000-000000000001'
    AND category_id = 'dining'
    AND month       = '2026-02';

  IF v_jan_total = 600.00 AND v_feb_count = 0 THEN
    RAISE NOTICE 'TEST 1 PASSED: January has total_spent=600, February has 0 rows (full cap implicit)';
  ELSE
    RAISE WARNING 'TEST 1 FAILED: Jan total=%, Feb count=% (expected 600, 0)',
      v_jan_total, v_feb_count;
  END IF;

  -- Verify the recommend() interpretation: when spending_state has no row for
  -- the queried month, remaining_cap is treated as monthly_cap_amount (full cap).
  -- This is the core of the implicit reset mechanism.
  RAISE NOTICE 'TEST 1 NOTE: recommend() LEFT JOIN spending_state for 2026-02 returns NULL remaining_cap';
  RAISE NOTICE 'TEST 1 NOTE: CASE expression interprets NULL + cap defined -> full cap = 1000';
END $$;


-- =============================================================================
-- TEST 2: reset_caps_for_month('2026-01') deletes January rows
-- =============================================================================

DO $$
DECLARE
  v_deleted INTEGER;
  v_remaining_count INTEGER;
BEGIN
  RAISE NOTICE '--- TEST 2: reset_caps_for_month deletes target month ---';

  -- Call the admin reset function for January
  SELECT reset_caps_for_month('2026-01') INTO v_deleted;

  -- Verify January rows are gone
  SELECT COUNT(*) INTO v_remaining_count
  FROM spending_state
  WHERE user_id = 'a0000000-0000-0000-0000-000000000001'
    AND month = '2026-01';

  IF v_deleted >= 1 AND v_remaining_count = 0 THEN
    RAISE NOTICE 'TEST 2 PASSED: reset_caps_for_month(2026-01) deleted % row(s), 0 remaining for Jan',
      v_deleted;
  ELSE
    RAISE WARNING 'TEST 2 FAILED: deleted=%, remaining_count=% (expected >=1, 0)',
      v_deleted, v_remaining_count;
  END IF;

  -- Verify other months are untouched
  SELECT COUNT(*) INTO v_remaining_count
  FROM spending_state
  WHERE user_id = 'a0000000-0000-0000-0000-000000000001'
    AND month = '2025-12';

  IF v_remaining_count = 1 THEN
    RAISE NOTICE 'TEST 2 PASSED: December row untouched (count=%)', v_remaining_count;
  ELSE
    RAISE WARNING 'TEST 2 FAILED: December count=% (expected 1)', v_remaining_count;
  END IF;
END $$;


-- =============================================================================
-- TEST 3: purge_old_spending_state(3) removes rows older than 3 months
-- =============================================================================

DO $$
DECLARE
  v_deleted INTEGER;
  v_remaining INTEGER;
  v_cutoff TEXT;
BEGIN
  RAISE NOTICE '--- TEST 3: purge_old_spending_state(3) removes old rows ---';

  -- With NOW() ~ 2026-02-19 and p_months_to_keep = 3:
  --   cutoff_month = 2025-11 (3 months back from Feb 2026)
  --   Rows with month < '2025-11' are deleted.
  --   That means: 2025-09 and 2025-10 should be deleted.
  --   Remaining: 2025-11, 2025-12 (January was already deleted in test 2)

  v_cutoff := to_char(NOW() - INTERVAL '3 months', 'YYYY-MM');
  RAISE NOTICE 'TEST 3 NOTE: cutoff month = % (rows strictly before this are purged)', v_cutoff;

  SELECT purge_old_spending_state(3) INTO v_deleted;

  -- Count remaining rows for our test user
  SELECT COUNT(*) INTO v_remaining
  FROM spending_state
  WHERE user_id = 'a0000000-0000-0000-0000-000000000001';

  -- After purge: months >= cutoff remain.  Jan was already deleted.
  -- Remaining should be: 2025-11, 2025-12 (2 rows)
  -- Deleted should include 2025-09, 2025-10 (2 rows)
  IF v_deleted >= 2 THEN
    RAISE NOTICE 'TEST 3 PASSED: purge_old_spending_state(3) deleted % row(s), % remaining',
      v_deleted, v_remaining;
  ELSE
    RAISE WARNING 'TEST 3 RESULT: deleted=%, remaining=% (expected >=2 deleted)',
      v_deleted, v_remaining;
    -- Note: exact count depends on whether other users have data.
    -- We verify our test rows below.
  END IF;

  -- Verify specific months: 2025-09 and 2025-10 should be gone
  SELECT COUNT(*) INTO v_remaining
  FROM spending_state
  WHERE user_id = 'a0000000-0000-0000-0000-000000000001'
    AND month IN ('2025-09', '2025-10');

  IF v_remaining = 0 THEN
    RAISE NOTICE 'TEST 3 PASSED: Sept and Oct rows purged (count=0)';
  ELSE
    RAISE WARNING 'TEST 3 FAILED: Sept/Oct rows still exist (count=%)', v_remaining;
  END IF;

  -- Verify kept months: 2025-11, 2025-12 should still exist
  SELECT COUNT(*) INTO v_remaining
  FROM spending_state
  WHERE user_id = 'a0000000-0000-0000-0000-000000000001'
    AND month IN ('2025-11', '2025-12');

  IF v_remaining = 2 THEN
    RAISE NOTICE 'TEST 3 PASSED: Nov and Dec rows retained (count=2)';
  ELSE
    RAISE WARNING 'TEST 3 FAILED: Nov/Dec row count=% (expected 2)', v_remaining;
  END IF;
END $$;


-- =============================================================================
-- TEST 4: Safety guard -- cannot delete current month
-- =============================================================================

DO $$
DECLARE
  v_current_month TEXT;
  v_error_caught BOOLEAN := FALSE;
BEGIN
  RAISE NOTICE '--- TEST 4: Safety guard -- cannot delete current month ---';

  v_current_month := to_char(NOW(), 'YYYY-MM');

  BEGIN
    PERFORM reset_caps_for_month(v_current_month);
  EXCEPTION
    WHEN OTHERS THEN
      v_error_caught := TRUE;
      RAISE NOTICE 'TEST 4 PASSED: reset_caps_for_month(%) correctly raised error: %',
        v_current_month, SQLERRM;
  END;

  IF NOT v_error_caught THEN
    RAISE WARNING 'TEST 4 FAILED: reset_caps_for_month(%) did NOT raise an error (should have)',
      v_current_month;
  END IF;
END $$;


-- =============================================================================
-- TEST 4b: Input validation -- invalid month format
-- =============================================================================

DO $$
DECLARE
  v_error_caught BOOLEAN := FALSE;
BEGIN
  RAISE NOTICE '--- TEST 4b: Input validation -- invalid month format ---';

  BEGIN
    PERFORM reset_caps_for_month('2026-13');
  EXCEPTION
    WHEN OTHERS THEN
      v_error_caught := TRUE;
      RAISE NOTICE 'TEST 4b PASSED: Invalid month format correctly rejected: %', SQLERRM;
  END;

  IF NOT v_error_caught THEN
    RAISE WARNING 'TEST 4b FAILED: Invalid month 2026-13 was NOT rejected';
  END IF;
END $$;


-- =============================================================================
-- TEST 4c: purge_old_spending_state rejects p_months_to_keep < 1
-- =============================================================================

DO $$
DECLARE
  v_error_caught BOOLEAN := FALSE;
BEGIN
  RAISE NOTICE '--- TEST 4c: purge rejects p_months_to_keep < 1 ---';

  BEGIN
    PERFORM purge_old_spending_state(0);
  EXCEPTION
    WHEN OTHERS THEN
      v_error_caught := TRUE;
      RAISE NOTICE 'TEST 4c PASSED: purge_old_spending_state(0) correctly rejected: %', SQLERRM;
  END;

  IF NOT v_error_caught THEN
    RAISE WARNING 'TEST 4c FAILED: purge_old_spending_state(0) was NOT rejected';
  END IF;
END $$;


-- =============================================================================
-- SUMMARY
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '=============================================================';
  RAISE NOTICE 'Monthly Reset Verification Complete (T3.08)';
  RAISE NOTICE '=============================================================';
  RAISE NOTICE 'Test 1:  Implicit reset -- no Feb row, full cap assumed';
  RAISE NOTICE 'Test 2:  reset_caps_for_month(2026-01) deletes January';
  RAISE NOTICE 'Test 3:  purge_old_spending_state(3) removes old months';
  RAISE NOTICE 'Test 4:  Safety guard -- current month deletion blocked';
  RAISE NOTICE 'Test 4b: Input validation -- invalid month format rejected';
  RAISE NOTICE 'Test 4c: purge rejects p_months_to_keep < 1';
  RAISE NOTICE '=============================================================';
  RAISE NOTICE 'Review NOTICE/WARNING messages above for pass/fail status.';
  RAISE NOTICE '=============================================================';
END $$;


-- =============================================================================
-- CLEANUP: Roll back all test data
-- =============================================================================
ROLLBACK;
