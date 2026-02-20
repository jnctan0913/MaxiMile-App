# Recommendation Algorithm Specification

**Version**: 1.0
**Created**: 2026-02-19
**Author**: Software Engineer
**Status**: Draft
**Task**: T1.04 — Define recommendation algorithm spec (pseudocode + edge cases)
**Related**: T2.08 (implementation), T3.09 (cap-aware integration)

---

## 1. Overview

The MaxiMile recommendation engine is a **Supabase RPC function** (`recommend`) that, given a spend category, returns the authenticated user's credit cards ranked by effective earning potential (miles per dollar), factoring in remaining monthly bonus cap headroom.

**Core principle**: Recommend the card that will earn the most miles _right now_, considering both the earn rate and whether the bonus cap still has room.

---

## 2. Core Algorithm

### 2.1 Function Signature

```sql
CREATE OR REPLACE FUNCTION recommend(p_category_id TEXT)
RETURNS TABLE (
  card_id       UUID,
  card_name     TEXT,
  bank          TEXT,
  earn_rate_mpd DECIMAL,
  remaining_cap DECIMAL,
  monthly_cap_amount DECIMAL,
  is_recommended BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_current_month TEXT;
BEGIN
  -- Extract authenticated user from JWT
  v_user_id := auth.uid();

  -- Validate user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated'
      USING ERRCODE = 'PGRST301';
  END IF;

  -- Validate category exists
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = p_category_id) THEN
    RAISE EXCEPTION 'Invalid category: %', p_category_id
      USING ERRCODE = 'P0001';
  END IF;

  -- Current month in YYYY-MM format
  v_current_month := to_char(NOW(), 'YYYY-MM');

  RETURN QUERY
  WITH user_card_rates AS (
    -- Step 1: Get all user's cards with their earn rate for this category
    SELECT
      c.id        AS card_id,
      c.name      AS card_name,
      c.bank      AS bank,
      -- Use bonus earn rate if one exists for this category; otherwise fall back to base rate
      COALESCE(er.earn_rate_mpd, c.base_rate_mpd) AS earn_rate_mpd,
      -- Get remaining cap from spending_state (NULL if no spending yet this month)
      ss.remaining_cap AS current_remaining_cap,
      -- Get the monthly cap definition (NULL if uncapped)
      cap.monthly_cap_amount AS monthly_cap_amount
    FROM user_cards uc
    INNER JOIN cards c ON c.id = uc.card_id
    -- LEFT JOIN: not all cards have bonus rules for every category
    LEFT JOIN earn_rules er ON er.card_id = c.id
      AND er.category_id = p_category_id
      AND er.is_bonus = TRUE
      AND er.effective_to IS NULL  -- only active rules
    -- LEFT JOIN: not all card+category combos have caps
    LEFT JOIN caps cap ON cap.card_id = c.id
      AND cap.category_id = p_category_id
    -- LEFT JOIN: user may not have spent anything this month for this card+category
    LEFT JOIN spending_state ss ON ss.user_id = v_user_id
      AND ss.card_id = c.id
      AND ss.category_id = p_category_id
      AND ss.month = v_current_month
    WHERE uc.user_id = v_user_id
  ),
  scored_cards AS (
    -- Step 2: Calculate the recommendation score
    SELECT
      ucr.card_id,
      ucr.card_name,
      ucr.bank,
      ucr.earn_rate_mpd,
      -- Resolve remaining cap:
      -- If no cap defined (monthly_cap_amount IS NULL) -> NULL (uncapped)
      -- If cap defined but no spending state row -> full cap (haven't spent anything)
      -- If cap defined and spending state exists -> use the remaining_cap value
      CASE
        WHEN ucr.monthly_cap_amount IS NULL THEN NULL
        WHEN ucr.current_remaining_cap IS NULL THEN ucr.monthly_cap_amount
        ELSE ucr.current_remaining_cap
      END AS remaining_cap,
      ucr.monthly_cap_amount,
      -- Ranking score: earn_rate_mpd * cap_ratio
      ucr.earn_rate_mpd * (
        CASE
          -- No cap defined: treat as fully available (ratio = 1.0)
          WHEN ucr.monthly_cap_amount IS NULL THEN 1.0
          -- Cap defined, no spending yet: full cap available (ratio = 1.0)
          WHEN ucr.current_remaining_cap IS NULL THEN 1.0
          -- Cap exhausted: score drops to zero (will fall back to base rate ordering)
          WHEN ucr.current_remaining_cap <= 0 THEN 0.0
          -- Partial cap remaining: scale proportionally, capped at 1.0
          ELSE LEAST(ucr.current_remaining_cap / ucr.monthly_cap_amount, 1.0)
        END
      ) AS score
    FROM user_card_rates ucr
  ),
  ranked_cards AS (
    -- Step 3: Rank cards by score, with deterministic tiebreaker
    SELECT
      sc.*,
      ROW_NUMBER() OVER (
        ORDER BY sc.score DESC, sc.card_name ASC
      ) AS rank
    FROM scored_cards sc
  )
  -- Step 4: Return results with is_recommended flag on the top card
  SELECT
    rc.card_id,
    rc.card_name,
    rc.bank,
    rc.earn_rate_mpd,
    rc.remaining_cap,
    rc.monthly_cap_amount,
    (rc.rank = 1) AS is_recommended
  FROM ranked_cards rc
  ORDER BY rc.rank;
END;
$$;
```

### 2.2 Ranking Formula

The core ranking formula is:

```
score = earn_rate_mpd * cap_ratio
```

Where `cap_ratio` is computed as:

| Condition | `cap_ratio` | Rationale |
|-----------|-------------|-----------|
| No cap exists for this card+category (`monthly_cap_amount IS NULL`) | `1.0` | Uncapped bonus — fully available |
| Cap exists, no spending this month (`remaining_cap` row missing) | `1.0` | Full cap available (new month / new user) |
| Cap exists, `remaining_cap <= 0` | `0.0` | Cap exhausted — bonus rate no longer applies |
| Cap exists, `remaining_cap > 0` | `LEAST(remaining_cap / monthly_cap_amount, 1.0)` | Proportional availability. Cards with more headroom score higher. |

**Intuition**: A card earning 4 mpd with only 10% of its cap remaining is less attractive than a card earning 3 mpd with 80% of its cap remaining. The ratio ensures the recommendation accounts for how much "runway" is left on each card's bonus.

### 2.3 Earn Rate Resolution

For a given card and category, the earn rate is resolved as follows:

```
earn_rate_mpd = COALESCE(
  active bonus rule for (card_id, category_id),
  card.base_rate_mpd
)
```

An **active bonus rule** is one where:
- `earn_rules.card_id` matches the card
- `earn_rules.category_id` matches the requested category
- `earn_rules.is_bonus = TRUE`
- `earn_rules.effective_to IS NULL` (currently active)

If no bonus rule exists for this card+category, the card's `base_rate_mpd` is used.

### 2.4 Tiebreaker

When two or more cards have the same score, the tiebreaker is **alphabetical by card_name** (ascending). This ensures deterministic, reproducible results.

```sql
ORDER BY sc.score DESC, sc.card_name ASC
```

### 2.5 `is_recommended` Flag

Only the top-ranked card (rank = 1) receives `is_recommended = TRUE`. All other cards receive `FALSE`. The client displays the top card prominently and the rest as alternatives.

---

## 3. Edge Cases

### 3.1 User Has No Cards

**Condition**: `user_cards` table has no rows for `auth.uid()`.

**Behavior**: The function returns an **empty array** (`[]`).

**Client handling**: The app should detect the empty array and redirect the user to onboarding / card setup, with a message like: "Add your credit cards to get personalized recommendations."

**SQL behavior**: The `INNER JOIN cards c ON c.id = uc.card_id` produces zero rows when `user_cards` is empty, so the entire CTE chain returns nothing.

---

### 3.2 All Cards Have Exhausted Caps for This Category

**Condition**: Every card in the user's portfolio has `remaining_cap <= 0` for the requested category.

**Behavior**: All cards have `cap_ratio = 0.0`, so `score = 0.0` for all cards. The function still returns all cards, sorted by the tiebreaker (`card_name ASC`).

**Important**: Since `score = earn_rate_mpd * 0.0 = 0` for all cards, the ranking degenerates to alphabetical ordering. To provide a better fallback, we rank by `base_rate_mpd` when all scores are zero.

**Refined SQL for the ORDER BY in `ranked_cards`**:

```sql
ROW_NUMBER() OVER (
  ORDER BY
    sc.score DESC,
    -- Secondary sort: when all scores are 0, rank by base rate
    sc.earn_rate_mpd DESC,
    sc.card_name ASC
) AS rank
```

This ensures that when all caps are exhausted, cards are ranked by their base earn rate (the rate they will earn post-cap), with alphabetical tiebreaker.

**Client handling**: The app should display a notice: "All bonus caps exhausted for [category]. Showing cards by base earn rate." The recommended card is still the best option, just at a lower earn rate.

---

### 3.3 Card Has No Specific Rule for Category (Falls Back to Base Rate)

**Condition**: No row exists in `earn_rules` for this `card_id + category_id`.

**Behavior**: The `LEFT JOIN earn_rules` returns `NULL` for `earn_rate_mpd`. The `COALESCE(er.earn_rate_mpd, c.base_rate_mpd)` expression falls back to the card's `base_rate_mpd`.

**Example**: If a user holds the "HSBC Revolution" card and selects "Petrol", but HSBC Revolution has no bonus rule for petrol, the card's base rate (e.g., 0.4 mpd) is used in the ranking.

---

### 3.4 Multiple Cards Tied on Score

**Condition**: Two or more cards have identical `score` values.

**Behavior**: The tiebreaker is **alphabetical by `card_name` ascending**. This is deterministic — the same inputs always produce the same output.

**Example**: If "Amex KrisFlyer Ascend" and "DBS Altitude Visa" both have `score = 3.0`, "Amex KrisFlyer Ascend" ranks higher because "A" < "D".

---

### 3.5 Category is 'general'

**Condition**: `p_category_id = 'general'`.

**Behavior**: Most cards will have no bonus rule for the 'general' category (it is the catch-all for non-bonus spending). The `COALESCE` falls back to `base_rate_mpd` for most cards. Cards that do offer a general bonus (rare) will have an `earn_rules` row and rank higher.

**There are no caps on general spending** for most cards, so `cap_ratio = 1.0` for all cards, and ranking simplifies to `base_rate_mpd DESC, card_name ASC`.

---

### 3.6 New User with No Transactions

**Condition**: User has cards in portfolio but no rows in `spending_state` for the current month.

**Behavior**: The `LEFT JOIN spending_state` returns `NULL` for `current_remaining_cap`. The `CASE` expression handles this:

```sql
WHEN ucr.current_remaining_cap IS NULL THEN ucr.monthly_cap_amount
```

So `remaining_cap` = full `monthly_cap_amount`, and `cap_ratio = 1.0` (full cap available).

**Result**: All cards are ranked purely by `earn_rate_mpd` (since all cap ratios are 1.0). This is the correct behavior — a new user should see the highest-earning card first.

---

### 3.7 Single Card in Portfolio

**Condition**: User has exactly one card.

**Behavior**: The function returns a single-element array with `is_recommended = true`. The card is always recommended regardless of cap status.

**Client handling**: The app should display the card with its cap status. If the cap is exhausted, show a note: "This is your only card for [category]. Consider adding another card to earn bonus miles."

---

### 3.8 Card Has Cap but Category Has No Spending State Row

**Condition**: A cap is defined for `card_id + category_id` in the `caps` table, but no row exists in `spending_state` for the current month (user hasn't spent in this category this month).

**Behavior**: This is the same as edge case 3.6. `remaining_cap` is set to the full `monthly_cap_amount`, and the card ranks at full potential.

---

### 3.9 Spending State Exists but Cap Was Removed

**Condition**: An older `spending_state` row exists, but the cap was subsequently removed from the `caps` table (bank changed rules).

**Behavior**: The `LEFT JOIN caps` returns `NULL` for `monthly_cap_amount`. Since `monthly_cap_amount IS NULL`, the card is treated as uncapped (`cap_ratio = 1.0`). The stale `spending_state` row is effectively ignored for ranking purposes.

---

## 4. Full SQL (Production-Ready)

```sql
-- ================================================================
-- MaxiMile Recommendation Engine
-- Supabase RPC Function: recommend(p_category_id TEXT)
-- ================================================================

CREATE OR REPLACE FUNCTION recommend(p_category_id TEXT)
RETURNS TABLE (
  card_id            UUID,
  card_name          TEXT,
  bank               TEXT,
  earn_rate_mpd      DECIMAL,
  remaining_cap      DECIMAL,
  monthly_cap_amount DECIMAL,
  is_recommended     BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id      UUID;
  v_current_month TEXT;
BEGIN
  -- ---------------------------------------------------------------
  -- 1. Auth & Validation
  -- ---------------------------------------------------------------
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated'
      USING ERRCODE = 'PGRST301';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = p_category_id) THEN
    RAISE EXCEPTION 'Invalid category: %', p_category_id
      USING ERRCODE = 'P0001';
  END IF;

  v_current_month := to_char(NOW(), 'YYYY-MM');

  -- ---------------------------------------------------------------
  -- 2. Build ranked recommendation set
  -- ---------------------------------------------------------------
  RETURN QUERY
  WITH user_card_rates AS (
    -- Get the user's cards with earn rates and cap data
    SELECT
      c.id                                       AS card_id,
      c.name                                     AS card_name,
      c.bank                                     AS bank,
      COALESCE(er.earn_rate_mpd, c.base_rate_mpd) AS earn_rate_mpd,
      ss.remaining_cap                           AS current_remaining_cap,
      cap.monthly_cap_amount                     AS monthly_cap_amount
    FROM user_cards uc
    INNER JOIN cards c
      ON c.id = uc.card_id
    LEFT JOIN earn_rules er
      ON er.card_id = c.id
      AND er.category_id = p_category_id
      AND er.is_bonus = TRUE
      AND er.effective_to IS NULL
    LEFT JOIN caps cap
      ON cap.card_id = c.id
      AND cap.category_id = p_category_id
    LEFT JOIN spending_state ss
      ON ss.user_id = v_user_id
      AND ss.card_id = c.id
      AND ss.category_id = p_category_id
      AND ss.month = v_current_month
    WHERE uc.user_id = v_user_id
  ),
  scored_cards AS (
    SELECT
      ucr.card_id,
      ucr.card_name,
      ucr.bank,
      ucr.earn_rate_mpd,
      -- Resolve remaining_cap display value
      CASE
        WHEN ucr.monthly_cap_amount IS NULL THEN NULL::DECIMAL
        WHEN ucr.current_remaining_cap IS NULL THEN ucr.monthly_cap_amount
        ELSE ucr.current_remaining_cap
      END AS remaining_cap,
      ucr.monthly_cap_amount,
      -- Compute ranking score = earn_rate * cap_ratio
      ucr.earn_rate_mpd * (
        CASE
          WHEN ucr.monthly_cap_amount IS NULL THEN 1.0
          WHEN ucr.current_remaining_cap IS NULL THEN 1.0
          WHEN ucr.current_remaining_cap <= 0 THEN 0.0
          ELSE LEAST(ucr.current_remaining_cap / ucr.monthly_cap_amount, 1.0)
        END
      ) AS score
    FROM user_card_rates ucr
  ),
  ranked_cards AS (
    SELECT
      sc.card_id,
      sc.card_name,
      sc.bank,
      sc.earn_rate_mpd,
      sc.remaining_cap,
      sc.monthly_cap_amount,
      ROW_NUMBER() OVER (
        ORDER BY
          sc.score DESC,
          sc.earn_rate_mpd DESC,  -- fallback when scores tie (esp. all zeros)
          sc.card_name ASC        -- deterministic tiebreaker
      ) AS rank
    FROM scored_cards sc
  )
  SELECT
    rc.card_id,
    rc.card_name,
    rc.bank,
    rc.earn_rate_mpd,
    rc.remaining_cap,
    rc.monthly_cap_amount,
    (rc.rank = 1) AS is_recommended
  FROM ranked_cards rc
  ORDER BY rc.rank;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION recommend(TEXT) TO authenticated;
-- Revoke from anonymous (recommendations require login)
REVOKE EXECUTE ON FUNCTION recommend(TEXT) FROM anon;
```

---

## 5. Performance Requirements

### 5.1 Target Latency

| Metric | Target | Rationale |
|--------|--------|-----------|
| RPC function execution time | < 100ms | From handover constraints; ensures the full recommendation flow (app open -> category tap -> see result) completes in < 2 seconds |
| End-to-end API response (including network) | < 500ms | Supabase PostgREST overhead + network latency from Singapore |

### 5.2 Expected Data Volumes

| Entity | Expected Max Size | Notes |
|--------|-------------------|-------|
| Cards per user (`user_cards`) | 20 | Max 20 supported cards; typical user has 3-7 |
| Categories | 7 | Fixed: dining, transport, online, groceries, petrol, travel, general |
| Earn rules total | ~140 | ~20 cards x 7 categories |
| Earn rules per card | ~7 | One per category (some categories may not have bonus rules) |
| Caps per card | ~3-5 | Not all categories are capped |
| Caps total | ~60-100 | ~20 cards x 3-5 categories with caps |
| Spending state rows per user per month | ~140 max | 20 cards x 7 categories; typical: 20-40 active combos |

At these volumes, the query operates on tiny datasets and should execute in single-digit milliseconds.

### 5.3 Index Strategy

The following indexes ensure the recommendation query performs well even as data grows:

```sql
-- ================================================================
-- Indexes for recommendation engine performance
-- ================================================================

-- user_cards: lookup by user_id (primary access pattern)
-- Already covered by PK (user_id, card_id) — composite index scans for user_id

-- earn_rules: lookup by card_id + category_id + active status
CREATE INDEX IF NOT EXISTS idx_earn_rules_card_category_active
  ON earn_rules (card_id, category_id)
  WHERE effective_to IS NULL;

-- caps: lookup by card_id + category_id
-- Already covered by UNIQUE(card_id, category_id)

-- spending_state: lookup by user_id + card_id + category_id + month
-- Already covered by PK (user_id, card_id, category_id, month)

-- transactions: for spending_state trigger / history queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_date
  ON transactions (user_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_card_category
  ON transactions (user_id, card_id, category_id);
```

### 5.4 Query Plan Analysis

The recommendation query's JOINs all use indexed lookups:

1. `user_cards WHERE user_id = v_user_id` — PK index scan (composite key starts with `user_id`)
2. `cards WHERE id = uc.card_id` — PK index scan
3. `earn_rules WHERE card_id AND category_id AND effective_to IS NULL` — partial index scan via `idx_earn_rules_card_category_active`
4. `caps WHERE card_id AND category_id` — UNIQUE constraint index scan
5. `spending_state WHERE user_id AND card_id AND category_id AND month` — PK index scan (all 4 columns in PK)

No sequential scans are expected. The query should execute in < 5ms for typical payloads.

---

## 6. Worked Examples

### 6.1 Standard Case — Multiple Cards, Partial Caps

**User's portfolio**: OCBC 90N, DBS Altitude, UOB PRVI Miles
**Category**: Dining
**Month**: 2026-02

| Card | earn_rate_mpd (dining) | monthly_cap | total_spent | remaining_cap | cap_ratio | score |
|------|------------------------|-------------|-------------|---------------|-----------|-------|
| OCBC 90N | 4.0 | 1000 | 750 | 250 | 0.25 | 1.0 |
| DBS Altitude | 3.0 | NULL | - | NULL | 1.0 | 3.0 |
| UOB PRVI Miles | 1.4 | 1000 | 0 (no row) | 1000 | 1.0 | 1.4 |

**Result ranking**:
1. DBS Altitude (score=3.0, is_recommended=true) — uncapped, high rate
2. UOB PRVI Miles (score=1.4) — full cap remaining
3. OCBC 90N (score=1.0) — high rate but cap nearly exhausted

**Explanation**: Even though OCBC 90N has the highest raw earn rate (4.0 mpd), only 25% of its cap remains. DBS Altitude's uncapped 3.0 mpd wins.

### 6.2 All Caps Exhausted

| Card | earn_rate_mpd (online) | monthly_cap | remaining_cap | cap_ratio | score |
|------|------------------------|-------------|---------------|-----------|-------|
| DBS Altitude | 6.0 | 2000 | 0 | 0.0 | 0.0 |
| OCBC 90N | 4.0 | 1000 | 0 | 0.0 | 0.0 |

**Result ranking** (falls back to earn_rate_mpd DESC):
1. DBS Altitude (score=0.0, earn_rate=6.0, is_recommended=true)
2. OCBC 90N (score=0.0, earn_rate=4.0)

**Client message**: "All online shopping bonus caps are exhausted. Cards ranked by base earn rate."

### 6.3 New User, No Transactions

| Card | earn_rate_mpd (dining) | monthly_cap | remaining_cap (computed) | cap_ratio | score |
|------|------------------------|-------------|--------------------------|-----------|-------|
| OCBC 90N | 4.0 | 1000 | 1000 (full) | 1.0 | 4.0 |
| DBS Altitude | 3.0 | NULL | NULL (uncapped) | 1.0 | 3.0 |
| HSBC Revolution | 2.0 | 1000 | 1000 (full) | 1.0 | 2.0 |

**Result ranking**:
1. OCBC 90N (score=4.0, is_recommended=true)
2. DBS Altitude (score=3.0)
3. HSBC Revolution (score=2.0)

Pure earn-rate ranking since all caps are at full capacity.

### 6.4 General Category (Base Rates Only)

**Category**: general

Most cards have no bonus rule for "general", so earn_rate_mpd = base_rate_mpd.

| Card | base_rate_mpd | bonus rule? | earn_rate_mpd | cap_ratio | score |
|------|---------------|-------------|---------------|-----------|-------|
| DBS Altitude | 1.2 | No | 1.2 | 1.0 | 1.2 |
| OCBC 90N | 0.4 | No | 0.4 | 1.0 | 0.4 |
| UOB PRVI Miles | 1.4 | No | 1.4 | 1.0 | 1.4 |

**Result ranking**:
1. UOB PRVI Miles (score=1.4, is_recommended=true)
2. DBS Altitude (score=1.2)
3. OCBC 90N (score=0.4)

---

## 7. Cap Deduction Logic (T3.05)

When a transaction is logged, the spending_state table must be updated. This is implemented as a PostgreSQL trigger.

### 7.1 Trigger Function

```sql
CREATE OR REPLACE FUNCTION update_spending_state()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_month TEXT;
  v_cap_amount DECIMAL;
BEGIN
  -- Determine the month from the transaction date
  v_month := to_char(NEW.transaction_date, 'YYYY-MM');

  -- Look up the monthly cap for this card + category (may be NULL if uncapped)
  SELECT monthly_cap_amount INTO v_cap_amount
  FROM caps
  WHERE card_id = NEW.card_id
    AND category_id = NEW.category_id;

  -- Upsert the spending_state row
  INSERT INTO spending_state (user_id, card_id, category_id, month, total_spent, remaining_cap)
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
  ON CONFLICT (user_id, card_id, category_id, month) DO UPDATE SET
    total_spent = spending_state.total_spent + NEW.amount,
    remaining_cap = CASE
      WHEN v_cap_amount IS NULL THEN NULL
      ELSE GREATEST(v_cap_amount - (spending_state.total_spent + NEW.amount), 0)
    END;

  RETURN NEW;
END;
$$;

-- Attach trigger to transactions table
CREATE TRIGGER after_transaction_insert
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_spending_state();
```

### 7.2 Cap Deduction Logic Summary

| Scenario | `total_spent` update | `remaining_cap` update |
|----------|---------------------|----------------------|
| First transaction for this card+category+month | Set to `amount` | `monthly_cap_amount - amount` (or NULL if uncapped) |
| Subsequent transaction | Increment by `amount` | `monthly_cap_amount - new_total_spent` (floored at 0) |
| No cap defined for card+category | Increment by `amount` | Stays `NULL` |
| Transaction exceeds remaining cap | Increment by `amount` | `0` (clamped via `GREATEST(..., 0)`) |

---

## 8. Monthly Cap Reset Logic (T3.08)

On the 1st of each month, all spending_state rows should effectively "reset" because cap limits are monthly. There are two implementation strategies:

### 8.1 Strategy A: Automatic via Query (Preferred for MVP)

The recommendation engine queries spending_state with `month = current_month`. At the start of a new month, no rows exist for the new month, so all caps are automatically at full capacity. No explicit reset needed.

**Pros**: Zero maintenance; no cron job; no data mutation.
**Cons**: Old months accumulate in the table (manageable; can be purged periodically).

### 8.2 Strategy B: Scheduled Reset (Supabase pg_cron)

For future use if we need proactive cap alerts (F6) that trigger on month boundaries:

```sql
-- Create a scheduled function to initialize spending_state for new month
-- Runs at midnight on the 1st of each month (SGT = UTC+8)
SELECT cron.schedule(
  'monthly-cap-reset',
  '0 16 28-31 * *',  -- Run at midnight SGT on potential last days of month
  $$
    -- No need to delete old rows; they serve as history.
    -- The recommendation engine automatically reads the current month.
    -- This job exists only if we need proactive alerts (F6) for the new month.
  $$
);
```

**MVP Decision**: Use Strategy A. The recommendation engine inherently handles month boundaries because it filters by `month = to_char(NOW(), 'YYYY-MM')`. When a new month starts, there are no spending_state rows for the new month, so all remaining_cap values resolve to full monthly_cap_amount. No explicit reset is required.

---

## 9. Integration: Cap-Aware Recommendations (T3.09)

The recommendation engine already reads live spending_state data via the `LEFT JOIN spending_state` in the main query. No additional integration work is needed beyond:

1. Ensuring the `update_spending_state()` trigger is active (T3.05)
2. Ensuring the recommendation function reads `spending_state.month = current_month` (already in the SQL)

**Test scenario for integration verification**:
1. User has card A (4 mpd dining, $1000 cap) and card B (3 mpd dining, uncapped)
2. Initial recommendation: card A is recommended (score = 4.0)
3. User logs $800 dining on card A
4. New recommendation: card A has remaining_cap = $200, cap_ratio = 0.2, score = 0.8
5. Card B is now recommended (score = 3.0 > 0.8)
6. User logs another $250 dining on card A (exceeds cap)
7. New recommendation: card A has remaining_cap = 0, cap_ratio = 0.0, score = 0.0
8. Card B is recommended (score = 3.0)

---

## 10. Future Extensions (NOT Implemented in v1)

These are documented for future reference but are explicitly out of scope for the 2-week MVP.

### 10.1 Conditional Earn Rates

Some cards have earn rates conditional on minimum monthly spend (e.g., "4 mpd if total monthly spend >= $800"). In v1, we store conditions in the `earn_rules.conditions` JSONB field and assume conditions are met.

**Future implementation**: The recommendation engine would check the user's total monthly spend against the condition threshold before applying the bonus rate.

### 10.2 Time-Weighted Recommendations

Consider time remaining in the month when recommending. A card with 50% cap remaining on the 25th of the month is more "comfortable" than 50% remaining on the 5th.

**Future formula**:
```
adjusted_cap_ratio = remaining_cap / (monthly_cap_amount * days_remaining / days_in_month)
```

### 10.3 Multi-Transaction Optimization

Instead of optimizing each transaction independently, consider the user's planned spending for the rest of the month and allocate cards across transactions for global optimization.

**Example**: If a user expects $500 more in dining this month and has two cards with $300 and $400 remaining cap, the optimizer would suggest splitting spend across both cards rather than exhausting one.

### 10.4 Transaction Amount-Aware Ranking

Factor the current transaction amount into the recommendation. If the user is about to spend $500 but a card only has $200 cap remaining, the card will earn bonus on only $200 of the $500 — the effective rate is lower.

**Future formula**:
```
effective_rate = CASE
  WHEN remaining_cap IS NULL THEN earn_rate_mpd
  WHEN remaining_cap >= amount THEN earn_rate_mpd
  ELSE (remaining_cap * earn_rate_mpd + (amount - remaining_cap) * base_rate_mpd) / amount
END
```

---

## 11. Testing Checklist

These test cases should be validated during T2.08 (implementation) and T2.13 (unit tests):

| # | Test Case | Input | Expected Output |
|---|-----------|-------|-----------------|
| 1 | Standard recommendation | User has 3 cards, category=dining, varying caps | Cards ranked by score; top card is_recommended=true |
| 2 | No cards in portfolio | User has 0 cards, category=dining | Empty array `[]` |
| 3 | All caps exhausted | User has 2 cards, both caps at 0 for online | Cards sorted by earn_rate_mpd DESC |
| 4 | No bonus rule for category | User has cards but none have dining bonus | All cards return base_rate_mpd |
| 5 | Tied scores | Two cards with identical score | Alphabetical by card_name |
| 6 | General category | category=general | All cards at base_rate_mpd (no bonus rules) |
| 7 | New user, no transactions | User has 4 cards, no spending_state rows | All caps at full; ranked by earn_rate_mpd |
| 8 | Single card | User has 1 card | Single result with is_recommended=true |
| 9 | Invalid category | category=invalid | Error: "Invalid category: invalid" |
| 10 | Unauthenticated call | No JWT provided | Error: "Not authenticated" |
| 11 | Cap partially used | Card has $300 of $1000 spent | remaining_cap=700, cap_ratio=0.7 |
| 12 | Uncapped card vs capped card | Uncapped 3mpd vs capped 4mpd with 10% remaining | Uncapped card wins (3.0 > 0.4) |
| 13 | Month boundary | Last day of month, spending_state for old month | New month = full caps (no rows) |
