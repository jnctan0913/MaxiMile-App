-- =============================================================================
-- MaxiMile -- Cap Deduction Trigger Verification (verify_cap_deduction.sql)
-- =============================================================================
-- Description:  SQL test cases that verify the update_spending_state() trigger
--               correctly upserts spending_state rows when transactions are
--               inserted or deleted.
--
-- Task:    T3.05 -- Cap Deduction Verification
-- Author:  Software Engineer
-- Created: 2026-02-19
--
-- How to run:
--   Execute this script against a Supabase instance (or local PostgreSQL)
--   that has migrations 001 and 002 applied.  The script uses DO blocks
--   with RAISE NOTICE for pass/fail reporting.
--
-- Prerequisites:
--   - Tables: cards, categories, caps, transactions, spending_state, user_cards
--   - Triggers: after_transaction_insert, after_transaction_delete
--   - At least one user in auth.users (for FK constraints)
--
-- IMPORTANT:
--   This script creates test data in a transaction and rolls it back at the end
--   so the database is left in its original state.  If you need to inspect
--   intermediate state, comment out the final ROLLBACK and use COMMIT instead.
-- =============================================================================

BEGIN;

-- =============================================================================
-- SETUP: Create test fixtures
-- =============================================================================
-- We insert test data directly (bypassing RLS via service_role or superuser).
-- These UUIDs are deterministic to make assertions easy.
-- =============================================================================

-- Test user (simulated -- in real Supabase this would be in auth.users)
-- If auth.users requires a real row, insert one; otherwise skip if testing
-- with a local pg that does not have the auth schema.
DO $$
BEGIN
  -- Attempt to insert a test user into auth.users if the table exists.
  -- On local PostgreSQL without Supabase auth schema, this will be skipped.
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    INSERT INTO auth.users (id, email)
    VALUES ('a0000000-0000-0000-0000-000000000001', 'test-cap@maximile.test')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Test card WITH a cap (Card A: dining cap = $1,000)
INSERT INTO cards (id, bank, name, slug, network, base_rate_mpd, is_active)
VALUES ('c0000000-0000-0000-0000-000000000001', 'TestBank', 'Test Card A', 'test-card-a', 'visa', 0.4, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Test card WITHOUT a cap (Card B: no cap rows at all)
INSERT INTO cards (id, bank, name, slug, network, base_rate_mpd, is_active)
VALUES ('c0000000-0000-0000-0000-000000000002', 'TestBank', 'Test Card B', 'test-card-b', 'visa', 1.2, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Ensure test categories exist
INSERT INTO categories (id, name, display_order)
VALUES ('dining', 'Dining', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (id, name, display_order)
VALUES ('online', 'Online Shopping', 3)
ON CONFLICT (id) DO NOTHING;

-- Cap for Card A + dining: $1,000/month
INSERT INTO caps (card_id, category_id, monthly_cap_amount, cap_type)
VALUES ('c0000000-0000-0000-0000-000000000001', 'dining', 1000.00, 'spend')
ON CONFLICT (card_id, category_id) DO UPDATE SET monthly_cap_amount = 1000.00;

-- No cap for Card B (no row in caps table)

-- Add both cards to user's portfolio
INSERT INTO user_cards (user_id, card_id)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;


-- =============================================================================
-- TEST 1: Insert a transaction -> spending_state row created with correct
--         total_spent and remaining_cap
-- =============================================================================

DO $$
DECLARE
  v_total   DECIMAL;
  v_remain  DECIMAL;
  v_count   INTEGER;
BEGIN
  RAISE NOTICE '--- TEST 1: First transaction creates spending_state row ---';

  -- Clean slate: remove any prior spending_state for this combo
  DELETE FROM spending_state
  WHERE user_id = 'a0000000-0000-0000-0000-000000000001'
    AND card_id = 'c0000000-0000-0000-0000-000000000001'
    AND category_id = 'dining'
    AND month = '2026-02';

  -- Insert a $200 dining transaction on Card A
  INSERT INTO transactions (id, user_id, card_id, category_id, amount, transaction_date)
  VALUES (
    'e0000000-0000-0000-0001-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'dining',
    200.00,
    '2026-02-15'
  );

  -- Verify spending_state row was created
  SELECT COUNT(*), SUM(total_spent), SUM(remaining_cap)
  INTO v_count, v_total, v_remain
  FROM spending_state
  WHERE user_id     = 'a0000000-0000-0000-0000-000000000001'
    AND card_id     = 'c0000000-0000-0000-0000-000000000001'
    AND category_id = 'dining'
    AND month       = '2026-02';

  IF v_count = 1 AND v_total = 200.00 AND v_remain = 800.00 THEN
    RAISE NOTICE 'TEST 1 PASSED: total_spent=%, remaining_cap=%', v_total, v_remain;
  ELSE
    RAISE WARNING 'TEST 1 FAILED: count=%, total_spent=%, remaining_cap=% (expected 1, 200.00, 800.00)',
      v_count, v_total, v_remain;
  END IF;
END $$;


-- =============================================================================
-- TEST 2: Insert second transaction for same card+category+month ->
--         total_spent incremented, remaining_cap decremented
-- =============================================================================

DO $$
DECLARE
  v_total  DECIMAL;
  v_remain DECIMAL;
BEGIN
  RAISE NOTICE '--- TEST 2: Second transaction increments spending_state ---';

  -- Insert another $350 dining transaction on Card A (same month)
  INSERT INTO transactions (id, user_id, card_id, category_id, amount, transaction_date)
  VALUES (
    'e0000000-0000-0000-0001-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'dining',
    350.00,
    '2026-02-16'
  );

  SELECT total_spent, remaining_cap
  INTO v_total, v_remain
  FROM spending_state
  WHERE user_id     = 'a0000000-0000-0000-0000-000000000001'
    AND card_id     = 'c0000000-0000-0000-0000-000000000001'
    AND category_id = 'dining'
    AND month       = '2026-02';

  -- Expected: total_spent = 200 + 350 = 550, remaining_cap = 1000 - 550 = 450
  IF v_total = 550.00 AND v_remain = 450.00 THEN
    RAISE NOTICE 'TEST 2 PASSED: total_spent=%, remaining_cap=%', v_total, v_remain;
  ELSE
    RAISE WARNING 'TEST 2 FAILED: total_spent=%, remaining_cap=% (expected 550.00, 450.00)',
      v_total, v_remain;
  END IF;
END $$;


-- =============================================================================
-- TEST 3: Insert transaction for card with no cap -> remaining_cap stays NULL
-- =============================================================================

DO $$
DECLARE
  v_total  DECIMAL;
  v_remain DECIMAL;
  v_count  INTEGER;
BEGIN
  RAISE NOTICE '--- TEST 3: Transaction on uncapped card -> remaining_cap NULL ---';

  -- Clean slate
  DELETE FROM spending_state
  WHERE user_id = 'a0000000-0000-0000-0000-000000000001'
    AND card_id = 'c0000000-0000-0000-0000-000000000002'
    AND category_id = 'dining'
    AND month = '2026-02';

  -- Insert a $500 dining transaction on Card B (no cap)
  INSERT INTO transactions (id, user_id, card_id, category_id, amount, transaction_date)
  VALUES (
    'e0000000-0000-0000-0001-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'dining',
    500.00,
    '2026-02-15'
  );

  SELECT COUNT(*), total_spent, remaining_cap
  INTO v_count, v_total, v_remain
  FROM spending_state
  WHERE user_id     = 'a0000000-0000-0000-0000-000000000001'
    AND card_id     = 'c0000000-0000-0000-0000-000000000002'
    AND category_id = 'dining'
    AND month       = '2026-02'
  GROUP BY total_spent, remaining_cap;

  IF v_count = 1 AND v_total = 500.00 AND v_remain IS NULL THEN
    RAISE NOTICE 'TEST 3 PASSED: total_spent=%, remaining_cap=NULL', v_total;
  ELSE
    RAISE WARNING 'TEST 3 FAILED: count=%, total_spent=%, remaining_cap=% (expected 1, 500.00, NULL)',
      v_count, v_total, v_remain;
  END IF;
END $$;


-- =============================================================================
-- TEST 4: Insert transaction that exceeds cap -> remaining_cap clamped to 0
-- =============================================================================

DO $$
DECLARE
  v_total  DECIMAL;
  v_remain DECIMAL;
BEGIN
  RAISE NOTICE '--- TEST 4: Transaction exceeding cap -> remaining_cap clamped to 0 ---';

  -- Card A currently has total_spent = 550, remaining_cap = 450 (from tests 1+2).
  -- Insert $600 more -> total = 1150, cap = 1000, so remaining = max(1000-1150, 0) = 0
  INSERT INTO transactions (id, user_id, card_id, category_id, amount, transaction_date)
  VALUES (
    'e0000000-0000-0000-0001-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'dining',
    600.00,
    '2026-02-17'
  );

  SELECT total_spent, remaining_cap
  INTO v_total, v_remain
  FROM spending_state
  WHERE user_id     = 'a0000000-0000-0000-0000-000000000001'
    AND card_id     = 'c0000000-0000-0000-0000-000000000001'
    AND category_id = 'dining'
    AND month       = '2026-02';

  -- Expected: total_spent = 1150, remaining_cap = 0 (clamped, not -150)
  IF v_total = 1150.00 AND v_remain = 0 THEN
    RAISE NOTICE 'TEST 4 PASSED: total_spent=%, remaining_cap=% (clamped)', v_total, v_remain;
  ELSE
    RAISE WARNING 'TEST 4 FAILED: total_spent=%, remaining_cap=% (expected 1150.00, 0)',
      v_total, v_remain;
  END IF;
END $$;


-- =============================================================================
-- TEST 5: Insert transaction for new month -> new spending_state row created
--         (old month untouched)
-- =============================================================================

DO $$
DECLARE
  v_feb_total  DECIMAL;
  v_feb_remain DECIMAL;
  v_jan_total  DECIMAL;
  v_jan_remain DECIMAL;
  v_jan_count  INTEGER;
BEGIN
  RAISE NOTICE '--- TEST 5: New month creates separate spending_state row ---';

  -- Clean slate for January
  DELETE FROM spending_state
  WHERE user_id = 'a0000000-0000-0000-0000-000000000001'
    AND card_id = 'c0000000-0000-0000-0000-000000000001'
    AND category_id = 'dining'
    AND month = '2026-01';

  -- Insert a $100 dining transaction dated January (different month)
  INSERT INTO transactions (id, user_id, card_id, category_id, amount, transaction_date)
  VALUES (
    'e0000000-0000-0000-0001-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'dining',
    100.00,
    '2026-01-20'
  );

  -- Check January row exists
  SELECT COUNT(*), total_spent, remaining_cap
  INTO v_jan_count, v_jan_total, v_jan_remain
  FROM spending_state
  WHERE user_id     = 'a0000000-0000-0000-0000-000000000001'
    AND card_id     = 'c0000000-0000-0000-0000-000000000001'
    AND category_id = 'dining'
    AND month       = '2026-01'
  GROUP BY total_spent, remaining_cap;

  -- Check February row is untouched (still 1150 from test 4)
  SELECT total_spent, remaining_cap
  INTO v_feb_total, v_feb_remain
  FROM spending_state
  WHERE user_id     = 'a0000000-0000-0000-0000-000000000001'
    AND card_id     = 'c0000000-0000-0000-0000-000000000001'
    AND category_id = 'dining'
    AND month       = '2026-02';

  IF v_jan_count = 1 AND v_jan_total = 100.00 AND v_jan_remain = 900.00
     AND v_feb_total = 1150.00 AND v_feb_remain = 0 THEN
    RAISE NOTICE 'TEST 5 PASSED: Jan total=%, Jan remain=%, Feb total=% (untouched)',
      v_jan_total, v_jan_remain, v_feb_total;
  ELSE
    RAISE WARNING 'TEST 5 FAILED: Jan count=%, Jan total=%, Jan remain=%, Feb total=%, Feb remain=%',
      v_jan_count, v_jan_total, v_jan_remain, v_feb_total, v_feb_remain;
  END IF;
END $$;


-- =============================================================================
-- TEST 6: Delete transaction -> spending_state decremented back
-- =============================================================================

DO $$
DECLARE
  v_total  DECIMAL;
  v_remain DECIMAL;
BEGIN
  RAISE NOTICE '--- TEST 6: Delete transaction decrements spending_state ---';

  -- Delete the $350 transaction from test 2 (Feb, Card A, dining)
  -- Before delete: total_spent = 1150, remaining_cap = 0
  -- After delete:  total_spent = 1150 - 350 = 800, remaining_cap = max(1000 - 800, 0) = 200
  DELETE FROM transactions
  WHERE id = 'e0000000-0000-0000-0001-000000000002';

  SELECT total_spent, remaining_cap
  INTO v_total, v_remain
  FROM spending_state
  WHERE user_id     = 'a0000000-0000-0000-0000-000000000001'
    AND card_id     = 'c0000000-0000-0000-0000-000000000001'
    AND category_id = 'dining'
    AND month       = '2026-02';

  IF v_total = 800.00 AND v_remain = 200.00 THEN
    RAISE NOTICE 'TEST 6 PASSED: total_spent=%, remaining_cap=% (after delete)', v_total, v_remain;
  ELSE
    RAISE WARNING 'TEST 6 FAILED: total_spent=%, remaining_cap=% (expected 800.00, 200.00)',
      v_total, v_remain;
  END IF;
END $$;


-- =============================================================================
-- SUMMARY
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '=============================================================';
  RAISE NOTICE 'Cap Deduction Verification Complete (T3.05)';
  RAISE NOTICE '=============================================================';
  RAISE NOTICE 'Test 1: First transaction -> spending_state created';
  RAISE NOTICE 'Test 2: Second transaction -> total_spent incremented';
  RAISE NOTICE 'Test 3: Uncapped card -> remaining_cap stays NULL';
  RAISE NOTICE 'Test 4: Over-cap transaction -> remaining_cap clamped to 0';
  RAISE NOTICE 'Test 5: Different month -> separate row, old untouched';
  RAISE NOTICE 'Test 6: Delete transaction -> spending_state decremented';
  RAISE NOTICE '=============================================================';
  RAISE NOTICE 'Review NOTICE/WARNING messages above for pass/fail status.';
  RAISE NOTICE '=============================================================';
END $$;


-- =============================================================================
-- CLEANUP: Roll back all test data so the database is unchanged
-- =============================================================================
ROLLBACK;
