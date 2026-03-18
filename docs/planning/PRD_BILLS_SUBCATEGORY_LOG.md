# PRD: Bills Subcategory Support in Transaction Logging

| Field | Value |
|-------|-------|
| **Status** | Draft |
| **Author** | PM Agent |
| **Date** | 2026-03-18 |
| **Sprint** | TBD (targeting Sprint 46+) |
| **Tier** | STANDARD |

---

## 1. Problem Statement

A **MaxiMile user logging a bills transaction** currently selects only the top-level "Bills" category when using the Log screen. However, the Recommendation engine already distinguishes **6 bills subcategories** (utilities, telco, insurance, education, hospital, pharmacy) with drastically different earn rates — utilities/insurance/education earn **0 mpd** on most cards, while telco/hospital/pharmacy earn **bonus miles**.

Because the `transactions` table has no `subcategory` column and the Log screen has no subcategory picker, the system **cannot determine which earn rate actually applies** to a logged bills transaction. This results in:

1. **Inaccurate miles-earned calculations** — the system cannot distinguish a $200 utility bill (0 mpd) from a $200 telco bill (4 mpd)
2. **Degraded spending cap tracking** — subcategory-specific caps cannot be enforced against logged spending
3. **Weakened recommendation quality** — the `category_spending` CTE in `recommend()` aggregates all bills spending together, unable to filter by subcategory for cap ratio calculations

**Impact**: Users who primarily spend on bills (a common pattern in Singapore) receive less accurate miles projections and suboptimal card recommendations, undermining trust in MaxiMile's core value proposition.

---

## 2. Goal

Enable the Log screen to capture bills subcategory data so that miles calculations, cap tracking, and recommendation scoring are accurate at the subcategory level.

---

## 3. User Stories

| ID | Story | Priority |
|----|-------|----------|
| **US-1** | As a user, when I select "Bills" in the Log screen, I want to specify which type of bill (telco, utilities, etc.) so my miles estimate is accurate | P0 |
| **US-2** | As a user, when I edit a bills transaction, I want to change the subcategory so I can correct mistakes | P1 |
| **US-3** | As a user, I want to see the subcategory label on my bills transactions in the transaction list so I know what I logged | P1 |
| **US-4** | As the recommendation engine, I need subcategory data on bills transactions so cap-ratio calculations reflect actual subcategory spending | P1 |

---

## 4. Proposed Solution

### 4.1 Database: Add `subcategory` Column

Add a nullable `TEXT` column `subcategory` to the `transactions` table.

```sql
ALTER TABLE public.transactions
  ADD COLUMN subcategory TEXT;

COMMENT ON COLUMN public.transactions.subcategory
  IS 'Bills subcategory (utilities, telco, insurance, education, hospital, pharmacy). NULL for non-bills categories.';
```

- **Nullable** — only populated when `category_id = 'bills'`
- **No FK constraint** — subcategories are defined in app constants, not a DB table (consistent with earn_rules `conditions->>'subcategory'` pattern)
- **CHECK constraint** (optional): `CHECK (subcategory IS NULL OR category_id = 'bills')`

### 4.2 Log Screen: Conditional Subcategory Picker

When the user selects "Bills" as the category in the Log screen:

1. **Show a secondary row of subcategory chips** directly below the category chips (same visual style, slightly smaller)
2. **Pre-select nothing** — user must pick a subcategory (it's required for bills)
3. **Disable Submit** until subcategory is selected (same pattern as requiring category + card)
4. If user switches away from "Bills" to another category, **hide subcategory chips and clear selection**

Reuse the existing `BILLS_SUBCATEGORIES` constant from `constants/categories.ts`.

### 4.3 Transaction Insert: Include Subcategory

Update the `handleConfirm` function in `log.tsx` to include `subcategory` in the insert payload:

```typescript
subcategory: selectedCategory === 'bills' ? selectedSubcategory : null,
```

### 4.4 Edit Transaction: Subcategory Support

Update `EditTransactionSheet` to show subcategory picker when editing a bills transaction, pre-populated with the current value.

### 4.5 Transaction List: Display Subcategory

In the transaction list rows, when a transaction has `category_id = 'bills'` and a non-null `subcategory`, show the subcategory label (e.g., "Bills - Telco") instead of just "Bills".

### 4.6 Recommendation Engine: Filter by Subcategory

Update the `category_spending` CTE in `recommend.sql` to filter bills transactions by subcategory when `p_subcategory` is provided:

```sql
category_spending AS (
  SELECT t.card_id, SUM(t.amount) AS total_cat
  FROM transactions t
  WHERE t.user_id = v_user_id
    AND t.category_id = p_category_id
    AND (p_subcategory IS NULL OR t.subcategory = p_subcategory OR p_category_id != 'bills')
    AND t.transaction_date >= (date_trunc('month', CURRENT_DATE))::date
    AND t.transaction_date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date
  GROUP BY t.card_id
),
```

---

## 5. RICE Prioritization

| Feature | Reach | Impact | Confidence | Effort (person-weeks) | Score | Priority |
|---------|-------|--------|------------|----------------------|-------|----------|
| US-1: Subcategory picker in Log | 1000 | 2 (High) | 90% | 1 | 1800 | **P0** |
| US-4: Recommendation engine filter | 1000 | 2 (High) | 80% | 0.5 | 3200 | **P0** |
| US-2: Edit subcategory support | 800 | 1 (Medium) | 80% | 0.5 | 1280 | **P1** |
| US-3: Display subcategory in list | 800 | 0.5 (Low) | 90% | 0.5 | 720 | **P1** |
| DB migration | — | — | — | 0.25 | — | **P0** (prerequisite) |

**Total estimated effort**: ~2.75 person-weeks

---

## 6. Scope & Non-Goals

### In Scope
- `subcategory` column on `transactions` table
- Subcategory picker in Log screen (bills only)
- Subcategory in Edit flow
- Subcategory display in transaction list
- `recommend()` function updated to use subcategory spending data
- Backfill strategy for existing bills transactions (see section 8)

### Out of Scope
- Subcategories for non-bills categories (future consideration)
- Auto-detection of subcategory from merchant MCC (future — MCC data already stored)
- Separate spending caps per bills subcategory (current caps are at category level)

---

## 7. Success Metrics

| Metric | Baseline | Target |
|--------|----------|--------|
| Bills transactions with subcategory populated | 0% | >85% within 2 weeks of launch |
| Miles estimate accuracy for bills transactions | Unknown (treated as uniform) | Subcategory-correct rate matching |
| User drop-off at subcategory step in Log | N/A | <5% abandonment after selecting Bills |

---

## 8. Migration & Backfill Strategy

**Existing bills transactions** will have `subcategory = NULL`. Options:

- **Option A (Recommended)**: Leave existing records as NULL. The recommend engine already handles `p_subcategory IS NULL` gracefully. Display "Bills" (no subcategory) for historical records.
- **Option B**: Prompt users to backfill via a one-time "categorize your bills" flow. Higher effort, lower priority.

---

## 9. Technical Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| `BILLS_SUBCATEGORIES` constant | Exists | `constants/categories.ts:125-153` |
| `recommend()` subcategory param | Exists | Already accepts `p_subcategory` |
| `earn_rules` subcategory conditions | Exists | Migration `20260301000000` already populated |
| `transactions.subcategory` column | **Needed** | New migration required |
| RLS policies | Review | Ensure `subcategory` is included in insert/update policies |

---

## 10. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Users skip/ignore subcategory selection | Medium | Medium | Make it required when Bills is selected; clear UX affordance |
| Extra tap adds friction to logging flow | Low | Medium | Subcategory chips appear inline (no extra screen); only for Bills |
| Existing bills transactions lack subcategory | Certain | Low | Graceful NULL handling; historical data still works |

---

## 11. Design Notes

- Subcategory chips should use the same visual style as category chips but slightly smaller (compact variant already exists in styles)
- Use the `emoji` + `label` from `BILLS_SUBCATEGORIES` for each chip
- Animate the subcategory row appearance (slide down) when Bills is selected
- On the Recommend tab, Bills already routes through a subcategory picker — maintain visual consistency between both flows

---

## Handover Notes

**Ready for**: Scrum Master (sprint planning) and Developer (implementation)

**Key implementation files**:
- `app/(tabs)/log.tsx` — Add subcategory state + conditional picker + insert payload
- `components/EditTransactionSheet.tsx` — Add subcategory editing
- `app/transactions.tsx` — Display subcategory in list rows
- `app/card-transactions/[cardId].tsx` — Same display update
- `database/functions/recommend.sql` — Update `category_spending` CTE
- New migration — `ALTER TABLE transactions ADD COLUMN subcategory TEXT`

**Critical context**: The subcategory infrastructure (constants, earn rules, recommend function parameter) already exists from Sprint 28. This PRD closes the gap where the **logging side** was never wired up to capture subcategory data.
