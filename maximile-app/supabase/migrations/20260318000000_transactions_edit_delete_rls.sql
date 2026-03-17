-- =============================================================================
-- Migration: Add UPDATE + DELETE RLS policies for transaction correction (F43)
-- =============================================================================
-- The original 002_rls_and_functions.sql treated transactions as an immutable
-- log (no UPDATE/DELETE policies). Sprint 35 / F43 added edit & delete UX,
-- so we now need to allow authenticated users to mutate their own rows.
--
-- spending_state is also unlocked for direct upsert: the client-side
-- recalculateSpendingState() helper re-sums transactions and writes the
-- derived total back. The caps screen reads from transactions directly, so
-- the worst a user can do is corrupt their own cached cap total (which is
-- corrected on the next recalculate call).
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- transactions: allow UPDATE and DELETE on own rows
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "transactions_update_own" ON transactions;
CREATE POLICY "transactions_update_own"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "transactions_delete_own" ON transactions;
CREATE POLICY "transactions_delete_own"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- spending_state: allow INSERT and UPDATE on own rows
-- (client-side recalculateSpendingState upsert after edit/delete)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "spending_state_insert_own" ON spending_state;
CREATE POLICY "spending_state_insert_own"
  ON spending_state
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "spending_state_update_own" ON spending_state;
CREATE POLICY "spending_state_update_own"
  ON spending_state
  FOR UPDATE
  TO authenticated
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

COMMIT;
