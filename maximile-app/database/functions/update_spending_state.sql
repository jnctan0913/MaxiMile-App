-- =============================================================================
-- MaxiMile -- Cap Deduction Trigger (update_spending_state.sql)
-- =============================================================================
-- Description:  Trigger function that fires AFTER INSERT on `transactions`.
--               Upserts into `spending_state` to increment total_spent and
--               recalculate remaining_cap for the relevant card+category+month.
--
-- Task:    T2.08 -- Cap Deduction Trigger (part of Recommendation Engine build)
-- Author:  Software Engineer
-- Created: 2026-02-19
--
-- Security:
--   SECURITY DEFINER -- executes as function owner (postgres) to bypass RLS
--   on spending_state.  Users cannot INSERT/UPDATE spending_state directly;
--   the only write path is through this trigger.
--
-- Behaviour matrix:
--   +------------------------------------------+----------------------+----------------------------+
--   | Scenario                                 | total_spent          | remaining_cap              |
--   +------------------------------------------+----------------------+----------------------------+
--   | First txn for card+category+month        | amount               | cap - amount  (or NULL)    |
--   | Subsequent txn                           | += amount            | cap - new_total (floor 0)  |
--   | No cap defined for card+category         | += amount            | NULL (stays NULL)          |
--   | Transaction exceeds remaining cap        | += amount            | 0 (clamped via GREATEST)   |
--   +------------------------------------------+----------------------+----------------------------+
--
-- NOTE: This function replaces the version created in 001_initial_schema.sql.
--       Using CREATE OR REPLACE so it is safe to run on top of the existing
--       definition.  The trigger attachment uses DROP + CREATE to ensure the
--       trigger points to this specific function name.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_spending_state()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_month      TEXT;
  v_cap_amount DECIMAL(12,2);
BEGIN
  -- =========================================================================
  -- 1. Derive the calendar month from the transaction date.
  --    spending_state is keyed on (user_id, card_id, category_id, month).
  -- =========================================================================
  v_month := to_char(NEW.transaction_date, 'YYYY-MM');

  -- =========================================================================
  -- 2. Look up the monthly cap for this card + category.
  --
  --    - If a category-specific cap exists, use it.
  --    - If only a global cap exists (category_id IS NULL), use that.
  --    - If no cap row exists at all, v_cap_amount stays NULL (uncapped).
  --
  --    ORDER BY category_id NULLS LAST ensures category-specific caps take
  --    priority over global (NULL) caps.
  -- =========================================================================
  SELECT monthly_cap_amount
  INTO   v_cap_amount
  FROM   caps
  WHERE  card_id = NEW.card_id
    AND  (category_id = NEW.category_id OR category_id IS NULL)
  ORDER BY category_id NULLS LAST
  LIMIT 1;

  -- =========================================================================
  -- 3. UPSERT the spending_state row.
  --
  --    INSERT path (first transaction for this card+category+month):
  --      total_spent   = transaction amount
  --      remaining_cap = cap - amount  (or NULL if uncapped)
  --
  --    UPDATE path (subsequent transactions):
  --      total_spent   = old total + new amount
  --      remaining_cap = cap - new total  (floored at 0, or NULL if uncapped)
  --
  --    Edge case: No cap exists (v_cap_amount IS NULL)
  --      remaining_cap is set to NULL on both INSERT and UPDATE paths.
  --      The recommend() function treats NULL remaining_cap as uncapped.
  --
  --    Edge case: Transaction exceeds remaining cap
  --      GREATEST(..., 0) ensures remaining_cap never goes negative.
  --      The card simply has 0 cap remaining (bonus exhausted).
  -- =========================================================================
  INSERT INTO spending_state (
    user_id,
    card_id,
    category_id,
    month,
    total_spent,
    remaining_cap
  )
  VALUES (
    NEW.user_id,
    NEW.card_id,
    NEW.category_id,
    v_month,
    NEW.amount,
    CASE
      WHEN v_cap_amount IS NULL THEN NULL
      ELSE GREATEST(v_cap_amount - NEW.amount, 0)
    END
  )
  ON CONFLICT (user_id, card_id, category_id, month)
  DO UPDATE SET
    total_spent   = spending_state.total_spent + NEW.amount,
    remaining_cap = CASE
      WHEN v_cap_amount IS NULL THEN NULL
      ELSE GREATEST(v_cap_amount - (spending_state.total_spent + NEW.amount), 0)
    END,
    updated_at    = NOW();

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_spending_state()
  IS 'Trigger function: upserts spending_state on transaction INSERT. '
     'Increments total_spent and recalculates remaining_cap based on the '
     'monthly cap from the caps table. SECURITY DEFINER to bypass RLS.';

-- =============================================================================
-- Trigger attachment
-- =============================================================================
-- Drop the old trigger (from 001_initial_schema) if it exists, then create the
-- new one pointing to our refined function.  The old function name was
-- update_spending_state_on_transaction(); we consolidate to update_spending_state().
-- =============================================================================

-- Remove old trigger + old function name (safe if they do not exist).
DROP TRIGGER IF EXISTS trg_transaction_update_spending_state ON transactions;
DROP TRIGGER IF EXISTS after_transaction_insert ON transactions;

CREATE TRIGGER after_transaction_insert
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_spending_state();

-- =============================================================================
-- Companion: DELETE trigger (unchanged from 001, included for completeness)
-- =============================================================================
-- When a transaction is deleted, decrement spending_state accordingly.
-- This ensures spending_state stays consistent if we ever allow DELETE.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_spending_state_on_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_month      TEXT;
  v_cap_amount DECIMAL(12,2);
BEGIN
  v_month := to_char(OLD.transaction_date, 'YYYY-MM');

  -- Look up cap (same logic as INSERT trigger).
  SELECT monthly_cap_amount
  INTO   v_cap_amount
  FROM   caps
  WHERE  card_id = OLD.card_id
    AND  (category_id = OLD.category_id OR category_id IS NULL)
  ORDER BY category_id NULLS LAST
  LIMIT 1;

  -- Decrement total_spent (floor at 0) and recalculate remaining_cap.
  UPDATE spending_state
  SET
    total_spent   = GREATEST(spending_state.total_spent - OLD.amount, 0),
    remaining_cap = CASE
      WHEN v_cap_amount IS NULL THEN NULL
      ELSE GREATEST(
        v_cap_amount - GREATEST(spending_state.total_spent - OLD.amount, 0),
        0
      )
    END,
    updated_at    = NOW()
  WHERE user_id     = OLD.user_id
    AND card_id     = OLD.card_id
    AND category_id = OLD.category_id
    AND month       = v_month;

  -- If total_spent reaches 0, optionally clean up the row.
  -- For MVP we leave the row (harmless; recommend() handles it).

  RETURN OLD;
END;
$$;

COMMENT ON FUNCTION public.update_spending_state_on_delete()
  IS 'Trigger function: decrements spending_state when a transaction is deleted. '
     'SECURITY DEFINER to bypass RLS.';

-- Drop old trigger name variants, then create.
DROP TRIGGER IF EXISTS trg_transaction_delete_spending_state ON transactions;
DROP TRIGGER IF EXISTS after_transaction_delete ON transactions;

CREATE TRIGGER after_transaction_delete
  AFTER DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_spending_state_on_delete();
