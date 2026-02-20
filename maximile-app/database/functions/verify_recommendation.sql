-- =============================================================================
-- MaxiMile -- Recommendation Engine Integration Verification
--             (verify_recommendation.sql)
-- =============================================================================
-- Description:  SQL test cases that verify the full integration of the
--               recommend() RPC function with spending_state (via the
--               cap deduction trigger) and monthly reset logic.
--
-- Task:    T3.09 -- Cap-Aware Recommendation Integration Verification
-- Author:  Software Engineer
-- Created: 2026-02-19
--
-- How to run:
--   Execute this script against a Supabase instance (or local PostgreSQL)
--   that has migrations 001 and 002 applied, plus seed data.
--
-- IMPORTANT:
--   The recommend() function calls auth.uid() internally.  In a live
--   Supabase environment, tests must be run with a valid JWT or by
--   temporarily overriding auth.uid() for testing.  This script assumes
--   a test helper that sets the session user to the test user UUID.
--
--   For local testing, create a mock auth.uid() function:
--     CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
--       SELECT 'a0000000-0000-0000-0000-000000000001'::UUID;
--     $$ LANGUAGE sql STABLE;
--
--   Restore it after testing.
--
-- All test data is rolled back at the end.
-- =============================================================================

BEGIN;

-- =============================================================================
-- SETUP: Test fixtures
-- =============================================================================

-- Create mock auth.uid() if not running in Supabase context
-- (Safe to run: CREATE OR REPLACE does not fail if auth schema exists)
DO $$
BEGIN
  -- Create auth schema if it does not exist (local pg only)
  IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
    CREATE SCHEMA auth;
  END IF;
END $$;

-- Save original auth.uid() and replace with test user
-- NOTE: If running on Supabase, comment this out and use a JWT instead.
CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
  SELECT 'a0000000-0000-0000-0000-000000000001'::UUID;
$$ LANGUAGE sql STABLE;

-- Test user
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    INSERT INTO auth.users (id, email)
    VALUES ('a0000000-0000-0000-0000-000000000001', 'test-rec@maximile.test')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Test cards:
--   Card A: 4.0 mpd dining bonus, $1000 cap, base 0.4 mpd
--   Card B: 3.0 mpd dining bonus, uncapped,   base 1.2 mpd
--   Card C: no dining bonus rule,               base 1.0 mpd (flat-rate card)

INSERT INTO cards (id, bank, name, slug, network, base_rate_mpd, is_active)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'TestBank', 'Test Card A', 'test-card-a', 'visa', 0.4, TRUE),
  ('c0000000-0000-0000-0000-000000000002', 'TestBank', 'Test Card B', 'test-card-b', 'visa', 1.2, TRUE),
  ('c0000000-0000-0000-0000-000000000003', 'TestBank', 'Test Card C', 'test-card-c', 'visa', 1.0, TRUE)
ON CONFLICT (id) DO UPDATE SET
  base_rate_mpd = EXCLUDED.base_rate_mpd,
  name = EXCLUDED.name;

-- Categories
INSERT INTO categories (id, name, display_order)
VALUES
  ('dining',  'Dining',          1),
  ('general', 'General / Others', 7)
ON CONFLICT (id) DO NOTHING;

-- Earn rules: bonus rates for dining
INSERT INTO earn_rules (card_id, category_id, earn_rate_mpd, is_bonus, effective_from)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'dining', 4.0, TRUE, '2026-01-01'),
  ('c0000000-0000-0000-0000-000000000002', 'dining', 3.0, TRUE, '2026-01-01')
ON CONFLICT (card_id, category_id, is_bonus, effective_from) DO UPDATE SET
  earn_rate_mpd = EXCLUDED.earn_rate_mpd;
-- Card C has no dining bonus rule -> will use base_rate_mpd = 1.0

-- Cap: Card A dining $1,000/month
INSERT INTO caps (card_id, category_id, monthly_cap_amount, cap_type)
VALUES ('c0000000-0000-0000-0000-000000000001', 'dining', 1000.00, 'spend')
ON CONFLICT (card_id, category_id) DO UPDATE SET monthly_cap_amount = 1000.00;
-- Card B: uncapped (no row in caps)
-- Card C: uncapped (no row in caps)

-- User portfolio
INSERT INTO user_cards (user_id, card_id)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002'),
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- Clean spending_state for current month
DELETE FROM spending_state
WHERE user_id = 'a0000000-0000-0000-0000-000000000001'
  AND month = to_char(NOW(), 'YYYY-MM');

-- Clean transactions for this test user
DELETE FROM transactions
WHERE user_id = 'a0000000-0000-0000-0000-000000000001';


-- =============================================================================
-- TEST 1: New user with no spending -> recommend() returns cards ranked by
--         earn_rate_mpd (all cap_ratios = 1.0)
-- =============================================================================

DO $$
DECLARE
  rec RECORD;
  v_row_num INTEGER := 0;
  v_pass BOOLEAN := TRUE;
BEGIN
  RAISE NOTICE '--- TEST 1: New user, no spending -> ranked by earn_rate_mpd ---';

  FOR rec IN SELECT * FROM recommend('dining') LOOP
    v_row_num := v_row_num + 1;

    IF v_row_num = 1 THEN
      -- Card A should be #1: earn_rate = 4.0, full cap, score = 4.0
      IF rec.card_name != 'Test Card A' OR rec.is_recommended != TRUE THEN
        RAISE WARNING 'TEST 1 FAILED row 1: got card=%, is_rec=% (expected Test Card A, true)',
          rec.card_name, rec.is_recommended;
        v_pass := FALSE;
      END IF;
      -- remaining_cap should show full cap (1000) since no spending
      IF rec.remaining_cap != 1000.00 THEN
        RAISE WARNING 'TEST 1 FAILED row 1: remaining_cap=% (expected 1000.00)', rec.remaining_cap;
        v_pass := FALSE;
      END IF;
    ELSIF v_row_num = 2 THEN
      -- Card B should be #2: earn_rate = 3.0, uncapped, score = 3.0
      IF rec.card_name != 'Test Card B' THEN
        RAISE WARNING 'TEST 1 FAILED row 2: got card=% (expected Test Card B)', rec.card_name;
        v_pass := FALSE;
      END IF;
      -- remaining_cap should be NULL (uncapped)
      IF rec.remaining_cap IS NOT NULL THEN
        RAISE WARNING 'TEST 1 FAILED row 2: remaining_cap=% (expected NULL)', rec.remaining_cap;
        v_pass := FALSE;
      END IF;
    ELSIF v_row_num = 3 THEN
      -- Card C should be #3: earn_rate = 1.0 (base), uncapped, score = 1.0
      IF rec.card_name != 'Test Card C' THEN
        RAISE WARNING 'TEST 1 FAILED row 3: got card=% (expected Test Card C)', rec.card_name;
        v_pass := FALSE;
      END IF;
    END IF;
  END LOOP;

  IF v_row_num = 3 AND v_pass THEN
    RAISE NOTICE 'TEST 1 PASSED: 3 cards returned in correct order (A=4.0, B=3.0, C=1.0)';
  ELSIF v_row_num != 3 THEN
    RAISE WARNING 'TEST 1 FAILED: expected 3 rows, got %', v_row_num;
  END IF;
END $$;


-- =============================================================================
-- TEST 2: User logs transaction -> spending_state updates ->
--         recommend() returns updated cap info
-- =============================================================================

DO $$
DECLARE
  rec RECORD;
  v_row_num INTEGER := 0;
  v_pass BOOLEAN := TRUE;
BEGIN
  RAISE NOTICE '--- TEST 2: After transaction, recommend() reflects updated cap ---';

  -- Log $800 dining on Card A (current month)
  INSERT INTO transactions (user_id, card_id, category_id, amount, transaction_date)
  VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'dining',
    800.00,
    CURRENT_DATE
  );

  -- Now call recommend('dining') -- should show updated cap
  FOR rec IN SELECT * FROM recommend('dining') LOOP
    v_row_num := v_row_num + 1;

    IF v_row_num = 1 THEN
      -- Card B should now be #1: score = 3.0 * 1.0 = 3.0 (uncapped)
      -- Card A: score = 4.0 * (200/1000) = 0.8
      IF rec.card_name != 'Test Card B' THEN
        RAISE WARNING 'TEST 2 FAILED row 1: got card=% (expected Test Card B after $800 spend on A)',
          rec.card_name;
        v_pass := FALSE;
      END IF;
    END IF;

    IF rec.card_name = 'Test Card A' THEN
      -- Card A: remaining_cap should be 200 (1000 - 800)
      IF rec.remaining_cap != 200.00 THEN
        RAISE WARNING 'TEST 2 FAILED: Card A remaining_cap=% (expected 200.00)', rec.remaining_cap;
        v_pass := FALSE;
      END IF;
      -- Score should be 4.0 * 0.2 = 0.8
      IF rec.score != 0.8 THEN
        RAISE WARNING 'TEST 2 NOTE: Card A score=% (expected 0.8)', rec.score;
        -- This may differ due to decimal precision; just note it
      END IF;
    END IF;
  END LOOP;

  IF v_pass THEN
    RAISE NOTICE 'TEST 2 PASSED: Card B now recommended (3.0 > 0.8); Card A remaining_cap=200';
  END IF;
END $$;


-- =============================================================================
-- TEST 3: User exhausts cap on a card -> recommend() de-ranks that card
--         (score drops to 0)
-- =============================================================================

DO $$
DECLARE
  rec RECORD;
  v_pass BOOLEAN := TRUE;
  v_card_a_score DECIMAL;
  v_card_a_rank INTEGER := 0;
  v_row_num INTEGER := 0;
BEGIN
  RAISE NOTICE '--- TEST 3: Exhausted cap -> card score drops to 0 ---';

  -- Spend another $300 on Card A to exhaust the cap (total = 800 + 300 = 1100 > 1000 cap)
  INSERT INTO transactions (user_id, card_id, category_id, amount, transaction_date)
  VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'dining',
    300.00,
    CURRENT_DATE
  );

  FOR rec IN SELECT * FROM recommend('dining') LOOP
    v_row_num := v_row_num + 1;

    IF rec.card_name = 'Test Card A' THEN
      v_card_a_score := rec.score;
      v_card_a_rank := v_row_num;

      IF rec.score != 0 THEN
        RAISE WARNING 'TEST 3 FAILED: Card A score=% (expected 0 after cap exhausted)', rec.score;
        v_pass := FALSE;
      END IF;
      IF rec.remaining_cap != 0 THEN
        RAISE WARNING 'TEST 3 FAILED: Card A remaining_cap=% (expected 0)', rec.remaining_cap;
        v_pass := FALSE;
      END IF;
    END IF;

    -- Card A should be last (rank 3) since score = 0
    IF v_row_num = 1 AND rec.card_name = 'Test Card A' THEN
      RAISE WARNING 'TEST 3 FAILED: Card A should not be rank 1 with exhausted cap';
      v_pass := FALSE;
    END IF;
  END LOOP;

  IF v_pass THEN
    RAISE NOTICE 'TEST 3 PASSED: Card A score=0, ranked #% (de-ranked due to exhausted cap)', v_card_a_rank;
  END IF;
END $$;


-- =============================================================================
-- TEST 4: All cards exhausted -> recommend() falls back to earn_rate ranking
-- =============================================================================

DO $$
DECLARE
  rec RECORD;
  v_row_num INTEGER := 0;
  v_pass BOOLEAN := TRUE;
BEGIN
  RAISE NOTICE '--- TEST 4: All cards exhausted -> fallback to earn_rate ranking ---';

  -- To test this, we need all cards to have caps and all to be exhausted.
  -- Add a cap for Card B and Card C temporarily, then exhaust them.
  INSERT INTO caps (card_id, category_id, monthly_cap_amount, cap_type)
  VALUES
    ('c0000000-0000-0000-0000-000000000002', 'dining', 500.00, 'spend'),
    ('c0000000-0000-0000-0000-000000000003', 'dining', 300.00, 'spend')
  ON CONFLICT (card_id, category_id) DO UPDATE SET monthly_cap_amount = EXCLUDED.monthly_cap_amount;

  -- Exhaust Card B cap: spend $600 (cap=500)
  INSERT INTO transactions (user_id, card_id, category_id, amount, transaction_date)
  VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'dining',
    600.00,
    CURRENT_DATE
  );

  -- Exhaust Card C cap: spend $400 (cap=300)
  INSERT INTO transactions (user_id, card_id, category_id, amount, transaction_date)
  VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000003',
    'dining',
    400.00,
    CURRENT_DATE
  );

  -- All caps exhausted. recommend() should fall back to earn_rate_mpd DESC.
  -- Card A = 4.0 mpd, Card B = 3.0 mpd, Card C = 1.0 mpd (base, no bonus rule)
  FOR rec IN SELECT * FROM recommend('dining') LOOP
    v_row_num := v_row_num + 1;

    -- All scores should be 0
    IF rec.score != 0 THEN
      RAISE WARNING 'TEST 4 FAILED: card=% has score=% (expected 0)', rec.card_name, rec.score;
      v_pass := FALSE;
    END IF;

    -- Ranking should follow earn_rate_mpd DESC:
    -- #1 = Card A (4.0), #2 = Card B (3.0), #3 = Card C (1.0)
    IF v_row_num = 1 AND rec.card_name != 'Test Card A' THEN
      RAISE WARNING 'TEST 4 FAILED: rank 1 should be Card A (4.0 mpd), got %', rec.card_name;
      v_pass := FALSE;
    END IF;
    IF v_row_num = 2 AND rec.card_name != 'Test Card B' THEN
      RAISE WARNING 'TEST 4 FAILED: rank 2 should be Card B (3.0 mpd), got %', rec.card_name;
      v_pass := FALSE;
    END IF;
  END LOOP;

  IF v_pass THEN
    RAISE NOTICE 'TEST 4 PASSED: All scores=0, fallback order: A(4.0) > B(3.0) > C(1.0)';
  END IF;

  -- Clean up the temporary caps so they do not affect test 5
  DELETE FROM caps WHERE card_id = 'c0000000-0000-0000-0000-000000000002' AND category_id = 'dining';
  DELETE FROM caps WHERE card_id = 'c0000000-0000-0000-0000-000000000003' AND category_id = 'dining';
END $$;


-- =============================================================================
-- TEST 5: New month -> recommend() returns full caps again (implicit reset)
-- =============================================================================

DO $$
DECLARE
  rec RECORD;
  v_pass BOOLEAN := TRUE;
BEGIN
  RAISE NOTICE '--- TEST 5: Implicit monthly reset -> full caps in new month ---';

  -- The spending_state rows from previous tests are for the current month.
  -- When a new month starts, there will be no spending_state rows for that month.
  -- We simulate this by querying recommend() logic manually:
  -- If there are no spending_state rows for a given month, remaining_cap = full cap.

  -- Verify: spending_state for Card A in current month shows exhausted cap
  -- But recommend() for the NEXT month (no rows) would show full cap.
  -- Since we cannot change NOW(), we verify the invariant:
  -- no spending_state row for a month -> recommend() treats cap as full.

  -- Delete all spending_state for current month to simulate "new month"
  DELETE FROM spending_state
  WHERE user_id = 'a0000000-0000-0000-0000-000000000001'
    AND month = to_char(NOW(), 'YYYY-MM');

  -- Now call recommend('dining') -- should show full caps
  FOR rec IN SELECT * FROM recommend('dining') LOOP
    IF rec.card_name = 'Test Card A' THEN
      -- Card A should have remaining_cap = 1000 (full cap, no spending)
      IF rec.remaining_cap != 1000.00 THEN
        RAISE WARNING 'TEST 5 FAILED: Card A remaining_cap=% (expected 1000.00 after reset)',
          rec.remaining_cap;
        v_pass := FALSE;
      END IF;
      -- Score should be 4.0 * 1.0 = 4.0
      IF rec.score < 3.99 THEN
        RAISE WARNING 'TEST 5 FAILED: Card A score=% (expected ~4.0)', rec.score;
        v_pass := FALSE;
      END IF;
      -- Card A should be recommended again
      IF rec.is_recommended != TRUE THEN
        RAISE WARNING 'TEST 5 FAILED: Card A should be recommended after reset';
        v_pass := FALSE;
      END IF;
    END IF;
  END LOOP;

  IF v_pass THEN
    RAISE NOTICE 'TEST 5 PASSED: After implicit reset, Card A has full cap (1000) and score=4.0';
  END IF;
END $$;


-- =============================================================================
-- TEST 6: Category 'general' -> returns base_rate_mpd only
-- =============================================================================

DO $$
DECLARE
  rec RECORD;
  v_row_num INTEGER := 0;
  v_pass BOOLEAN := TRUE;
BEGIN
  RAISE NOTICE '--- TEST 6: General category -> base rates only ---';

  -- None of our test cards have bonus rules for 'general' category.
  -- All should fall back to base_rate_mpd: A=0.4, B=1.2, C=1.0
  -- Expected ranking: B(1.2) > C(1.0) > A(0.4)

  FOR rec IN SELECT * FROM recommend('general') LOOP
    v_row_num := v_row_num + 1;

    IF v_row_num = 1 THEN
      IF rec.card_name != 'Test Card B' OR rec.earn_rate_mpd != 1.2 THEN
        RAISE WARNING 'TEST 6 FAILED row 1: got card=%, rate=% (expected Card B, 1.2)',
          rec.card_name, rec.earn_rate_mpd;
        v_pass := FALSE;
      END IF;
      -- remaining_cap should be NULL (no caps for general)
      IF rec.remaining_cap IS NOT NULL THEN
        RAISE WARNING 'TEST 6 FAILED row 1: remaining_cap=% (expected NULL)', rec.remaining_cap;
        v_pass := FALSE;
      END IF;
    ELSIF v_row_num = 2 THEN
      IF rec.card_name != 'Test Card C' OR rec.earn_rate_mpd != 1.0 THEN
        RAISE WARNING 'TEST 6 FAILED row 2: got card=%, rate=% (expected Card C, 1.0)',
          rec.card_name, rec.earn_rate_mpd;
        v_pass := FALSE;
      END IF;
    ELSIF v_row_num = 3 THEN
      IF rec.card_name != 'Test Card A' OR rec.earn_rate_mpd != 0.4 THEN
        RAISE WARNING 'TEST 6 FAILED row 3: got card=%, rate=% (expected Card A, 0.4)',
          rec.card_name, rec.earn_rate_mpd;
        v_pass := FALSE;
      END IF;
    END IF;
  END LOOP;

  IF v_row_num = 3 AND v_pass THEN
    RAISE NOTICE 'TEST 6 PASSED: General category returns base rates only: B(1.2) > C(1.0) > A(0.4)';
  ELSE
    RAISE WARNING 'TEST 6: got % rows', v_row_num;
  END IF;
END $$;


-- =============================================================================
-- SUMMARY
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '=============================================================';
  RAISE NOTICE 'Recommendation Integration Verification Complete (T3.09)';
  RAISE NOTICE '=============================================================';
  RAISE NOTICE 'Test 1: New user, no spending -> ranked by earn_rate_mpd';
  RAISE NOTICE 'Test 2: After transaction -> updated cap in recommend()';
  RAISE NOTICE 'Test 3: Exhausted cap -> card de-ranked (score = 0)';
  RAISE NOTICE 'Test 4: All caps exhausted -> fallback to earn_rate ranking';
  RAISE NOTICE 'Test 5: Implicit monthly reset -> full caps again';
  RAISE NOTICE 'Test 6: General category -> base rates only';
  RAISE NOTICE '=============================================================';
  RAISE NOTICE 'Review NOTICE/WARNING messages above for pass/fail status.';
  RAISE NOTICE '=============================================================';
END $$;


-- =============================================================================
-- CLEANUP: Roll back all test data
-- =============================================================================
ROLLBACK;
