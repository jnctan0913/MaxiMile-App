# Row Level Security (RLS) Policies: MaxiMile

**Version**: 1.0
**Created**: 2026-02-19
**Author**: Software Engineer
**Status**: Draft
**Task**: T1.12 — Set up Supabase Row Level Security policies (user data isolation)
**Dependencies**: T1.07 (Supabase tables created)

---

## 1. Overview

Row Level Security (RLS) is Supabase's mechanism for ensuring that users can only access their own data. When RLS is enabled on a table, **every query** (including from the Supabase REST API) is filtered by the defined policies. If no policy grants access, the query returns zero rows (SELECT) or is silently rejected (INSERT/UPDATE/DELETE).

### Security Principles

1. **Public reference data** (cards, categories, earn_rules, caps, exclusions): Readable by everyone, writable only by admins (via Supabase dashboard or service_role key).
2. **User-owned data** (user_cards, transactions, spending_state): Each user can only access their own rows, identified by `user_id = auth.uid()`.
3. **No cross-user data leakage**: A user can never see, modify, or infer another user's data through any API endpoint.
4. **Defense in depth**: RLS policies are enforced at the database level, independent of application logic. Even if the client-side code has a bug, the database will not return unauthorized data.

### Supabase Auth Context

- `auth.uid()` — Returns the UUID of the currently authenticated user (extracted from the JWT).
- `auth.role()` — Returns the role: `'authenticated'` for logged-in users, `'anon'` for anonymous requests.
- `auth.jwt()` — Returns the full JWT payload (rarely needed for RLS).

---

## 2. Policy Summary

| Table | RLS Enabled | anon SELECT | auth SELECT | auth INSERT | auth UPDATE | auth DELETE | Notes |
|-------|-------------|-------------|-------------|-------------|-------------|-------------|-------|
| `cards` | Yes | Yes (all) | Yes (all) | No | No | No | Public reference data |
| `categories` | Yes | Yes (all) | Yes (all) | No | No | No | Public reference data |
| `earn_rules` | Yes | Yes (all) | Yes (all) | No | No | No | Public reference data |
| `caps` | Yes | Yes (all) | Yes (all) | No | No | No | Public reference data |
| `exclusions` | Yes | Yes (all) | Yes (all) | No | No | No | Public reference data |
| `user_cards` | Yes | No | Own rows | Own rows | No (v1) | Own rows | User portfolio |
| `transactions` | Yes | No | Own rows | Own rows | No (v1) | No (v1) | Immutable transaction log |
| `spending_state` | Yes | No | Own rows | No (trigger only) | No (trigger only) | No | System-managed via trigger |

---

## 3. Public Reference Tables

These tables contain card rules, categories, earn rates, caps, and exclusions. They are readable by all users (including unauthenticated/anonymous) but only writable by admins.

### 3.1 cards

```sql
-- Enable RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous) to read all cards
CREATE POLICY "cards_select_public"
  ON cards
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- No INSERT/UPDATE/DELETE policies for anon or authenticated.
-- Only the service_role (Supabase admin) can modify card data.
-- This is the default behavior: when RLS is enabled and no policy grants
-- INSERT/UPDATE/DELETE, those operations are denied.
```

### 3.2 categories

```sql
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_public"
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (true);
```

### 3.3 earn_rules

```sql
ALTER TABLE earn_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "earn_rules_select_public"
  ON earn_rules
  FOR SELECT
  TO anon, authenticated
  USING (true);
```

### 3.4 caps

```sql
ALTER TABLE caps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "caps_select_public"
  ON caps
  FOR SELECT
  TO anon, authenticated
  USING (true);
```

### 3.5 exclusions

```sql
ALTER TABLE exclusions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exclusions_select_public"
  ON exclusions
  FOR SELECT
  TO anon, authenticated
  USING (true);
```

---

## 4. User-Owned Tables

### 4.1 user_cards

Users can add cards to their portfolio, view their portfolio, and remove cards. No UPDATE in v1 (there is nothing to update — the row is just `user_id + card_id + added_at`).

```sql
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;

-- SELECT: User can only see their own cards
CREATE POLICY "user_cards_select_own"
  ON user_cards
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: User can only insert rows for themselves
CREATE POLICY "user_cards_insert_own"
  ON user_cards
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- DELETE: User can only remove their own cards
CREATE POLICY "user_cards_delete_own"
  ON user_cards
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- No UPDATE policy: user_cards rows are immutable (add or remove only).
-- No anon policies: anonymous users cannot access user_cards.
```

**Column default for user_id** (enables the client to omit user_id in INSERT):

```sql
ALTER TABLE user_cards
  ALTER COLUMN user_id SET DEFAULT auth.uid();
```

---

### 4.2 transactions

Users can log transactions (INSERT) and view their own transaction history (SELECT). No UPDATE or DELETE in v1 — transactions are an immutable log. This prevents accidental or malicious modification of spending history, which would corrupt cap tracking.

```sql
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- SELECT: User can only see their own transactions
CREATE POLICY "transactions_select_own"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: User can only insert transactions for themselves
CREATE POLICY "transactions_insert_own"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- No UPDATE policy: transactions are immutable in v1.
-- No DELETE policy: transactions cannot be deleted in v1.
-- No anon policies: anonymous users cannot access transactions.
```

**Column default for user_id**:

```sql
ALTER TABLE transactions
  ALTER COLUMN user_id SET DEFAULT auth.uid();
```

**Rationale for no UPDATE/DELETE in v1**:
- Transaction logs feed into spending_state via triggers. Allowing edits/deletes would require compensating logic (reverse the old spending_state update, apply the new one), which adds complexity.
- For the MVP, if a user makes an error, they can log a "correction" transaction. Proper edit/delete can be added in v1.1 with the corresponding trigger logic.

---

### 4.3 spending_state

The spending_state table is **system-managed**. It is populated and updated exclusively by the `update_spending_state()` trigger that fires after transaction inserts. Users can only read their own spending state.

```sql
ALTER TABLE spending_state ENABLE ROW LEVEL SECURITY;

-- SELECT: User can only see their own spending state
CREATE POLICY "spending_state_select_own"
  ON spending_state
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- No INSERT policy for authenticated users (trigger uses SECURITY DEFINER).
-- No UPDATE policy for authenticated users (trigger uses SECURITY DEFINER).
-- No DELETE policy for authenticated users.
-- No anon policies.
```

**How the trigger bypasses RLS**:

The `update_spending_state()` trigger function is declared as `SECURITY DEFINER`, which means it executes with the permissions of the function owner (typically the `postgres` superuser), not the calling user. This allows the trigger to INSERT/UPDATE rows in `spending_state` even though no RLS policy grants those operations to `authenticated` users.

This is the correct pattern because:
1. Users should not be able to directly manipulate their spending_state (it would allow them to "reset" their caps).
2. The trigger ensures spending_state is always consistent with the transactions table.
3. The `SECURITY DEFINER` function is tightly scoped — it only writes based on the NEW transaction row.

---

## 5. Complete Migration SQL

This is the full SQL migration to be run on the Supabase instance (after tables are created by T1.07).

```sql
-- ================================================================
-- MaxiMile RLS Policies Migration
-- Run AFTER table creation (T1.07)
-- ================================================================

-- ---------------------------------------------------------------
-- Step 1: Enable RLS on ALL tables
-- ---------------------------------------------------------------

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE earn_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE caps ENABLE ROW LEVEL SECURITY;
ALTER TABLE exclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_state ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------
-- Step 2: Public reference tables — anyone can read, no one can write
-- ---------------------------------------------------------------

-- cards
CREATE POLICY "cards_select_public"
  ON cards FOR SELECT
  TO anon, authenticated
  USING (true);

-- categories
CREATE POLICY "categories_select_public"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- earn_rules
CREATE POLICY "earn_rules_select_public"
  ON earn_rules FOR SELECT
  TO anon, authenticated
  USING (true);

-- caps
CREATE POLICY "caps_select_public"
  ON caps FOR SELECT
  TO anon, authenticated
  USING (true);

-- exclusions
CREATE POLICY "exclusions_select_public"
  ON exclusions FOR SELECT
  TO anon, authenticated
  USING (true);

-- ---------------------------------------------------------------
-- Step 3: user_cards — user can CRUD their own rows
-- ---------------------------------------------------------------

CREATE POLICY "user_cards_select_own"
  ON user_cards FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_cards_insert_own"
  ON user_cards FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_cards_delete_own"
  ON user_cards FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------
-- Step 4: transactions — user can INSERT and SELECT their own
-- ---------------------------------------------------------------

CREATE POLICY "transactions_select_own"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "transactions_insert_own"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------
-- Step 5: spending_state — user can SELECT their own; writes via trigger only
-- ---------------------------------------------------------------

CREATE POLICY "spending_state_select_own"
  ON spending_state FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------
-- Step 6: Set column defaults for user_id (auto-populate from JWT)
-- ---------------------------------------------------------------

ALTER TABLE user_cards
  ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE transactions
  ALTER COLUMN user_id SET DEFAULT auth.uid();
```

---

## 6. Security Verification Checklist

This checklist should be validated during T4.05 (security review on Day 9).

### 6.1 Data Isolation Tests

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 1 | User A queries `user_cards` | Returns only User A's cards | |
| 2 | User A queries `transactions` | Returns only User A's transactions | |
| 3 | User A queries `spending_state` | Returns only User A's spending state | |
| 4 | User A calls `recommend()` | Uses only User A's portfolio and spending data | |
| 5 | User A tries to insert `user_cards` with User B's `user_id` | Rejected by RLS (WITH CHECK fails) | |
| 6 | User A tries to insert `transactions` with User B's `user_id` | Rejected by RLS (WITH CHECK fails) | |
| 7 | User A tries to delete User B's `user_cards` row | No rows affected (USING clause filters out) | |
| 8 | Anonymous user queries `user_cards` | Returns zero rows (no anon policy) | |
| 9 | Anonymous user queries `transactions` | Returns zero rows (no anon policy) | |
| 10 | Anonymous user queries `spending_state` | Returns zero rows (no anon policy) | |
| 11 | Anonymous user calls `recommend()` | Error: "Not authenticated" | |

### 6.2 Public Data Tests

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 12 | Anonymous user queries `cards` | Returns all cards | |
| 13 | Anonymous user queries `categories` | Returns all categories | |
| 14 | Anonymous user queries `earn_rules` | Returns all earn rules | |
| 15 | Anonymous user queries `caps` | Returns all caps | |
| 16 | Authenticated user queries `cards` | Returns all cards | |
| 17 | Anonymous user tries to INSERT into `cards` | Rejected (no INSERT policy) | |
| 18 | Authenticated user tries to INSERT into `cards` | Rejected (no INSERT policy) | |
| 19 | Authenticated user tries to UPDATE `earn_rules` | Rejected (no UPDATE policy) | |
| 20 | Authenticated user tries to DELETE from `caps` | Rejected (no DELETE policy) | |

### 6.3 Write Protection Tests

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 21 | User tries to INSERT directly into `spending_state` | Rejected (no INSERT policy for authenticated) | |
| 22 | User tries to UPDATE `spending_state` directly | Rejected (no UPDATE policy for authenticated) | |
| 23 | User tries to DELETE from `spending_state` | Rejected (no DELETE policy) | |
| 24 | User tries to UPDATE their own `transactions` | Rejected (no UPDATE policy in v1) | |
| 25 | User tries to DELETE their own `transactions` | Rejected (no DELETE policy in v1) | |
| 26 | User logs a transaction | `spending_state` is updated via trigger (SECURITY DEFINER bypasses RLS) | |

### 6.4 Auth Edge Cases

| # | Test | Expected Result | Status |
|---|------|-----------------|--------|
| 27 | Expired JWT on authenticated endpoint | HTTP 401 | |
| 28 | Malformed JWT | HTTP 401 | |
| 29 | Valid JWT but user deleted from auth.users | Queries return empty (no matching user_id) | |
| 30 | JWT from a different Supabase project | HTTP 401 (JWT secret mismatch) | |

---

## 7. Admin Access Pattern

For data maintenance (updating card rules, seeding data, fixing issues), use the **Supabase service_role key**. This key bypasses all RLS policies.

```typescript
import { createClient } from '@supabase/supabase-js'

// ADMIN CLIENT — NEVER expose this key in client-side code
const supabaseAdmin = createClient(
  'https://<project-ref>.supabase.co',
  '<service-role-key>'  // This key bypasses RLS
)

// Admin can read/write all tables without restriction
const { data } = await supabaseAdmin
  .from('cards')
  .insert({ bank: 'DBS', name: 'New Card', base_rate_mpd: 1.0 })
```

**Security rules for service_role key**:
1. NEVER include it in client-side code (React Native app bundle)
2. NEVER commit it to version control
3. Only use it in server-side scripts, CI/CD pipelines, or the Supabase dashboard
4. Store it in environment variables with restricted access

---

## 8. Future Considerations (v1.1+)

### 8.1 Transaction UPDATE/DELETE (v1.1)

When we allow transaction editing/deletion, we need:
1. UPDATE and DELETE policies on `transactions` (with `user_id = auth.uid()`)
2. Compensating trigger logic to reverse the old spending_state and apply the new values
3. Careful handling of month boundaries (editing a transaction from a previous month)

### 8.2 Shared Portfolios (v2.0+)

If we add household/shared portfolios, the RLS policies will need to expand:
```sql
-- Hypothetical shared portfolio policy
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM portfolio_members
    WHERE portfolio_id = user_cards.portfolio_id
    AND member_id = auth.uid()
  )
)
```

### 8.3 Admin Dashboard (v1.1+)

For a web-based admin dashboard (card rules management), create a custom `admin` role:
```sql
-- Create admin policies (future)
CREATE POLICY "cards_admin_all"
  ON cards FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

This requires custom JWT claims, which can be set via Supabase Auth hooks or custom claims functions.

---

## 9. PDPA Compliance Notes

Singapore's Personal Data Protection Act (PDPA) applies to user spending data:

1. **Data minimization**: We only store transaction amount, category, card, and date. We do not store merchant names, receipt images, or bank account numbers.
2. **Purpose limitation**: Spending data is used exclusively for cap tracking and recommendation accuracy. It is never shared with third parties.
3. **Access control**: RLS ensures users can only access their own data. No API endpoint exposes cross-user data.
4. **Data retention**: Transaction history is retained indefinitely in v1 (users may want historical data). A data export and deletion feature should be added in v1.1 to comply with PDPA access and correction rights.
5. **Consent**: User consent for data collection and processing should be obtained during sign-up (handled in the app's terms of service and privacy policy).
