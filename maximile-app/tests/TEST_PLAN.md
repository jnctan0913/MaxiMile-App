# MaxiMile Test Plan

**Version**: 1.0
**Created**: 2026-02-19
**Author**: Tester Agent
**Phase**: Phase 2 (Core Build)
**Status**: Active
**Tasks**: T1.11 (Test Plan), T2.12 (Card Rules Tests), T2.13 (Recommendation Tests)

---

## 1. Overview

This test plan covers the MaxiMile MVP unit testing strategy for the 2-week build period. The goal is to validate the critical paths of the app -- card rules retrieval, recommendation engine scoring, user portfolio management, and cap tracking -- without requiring a live Supabase instance.

### 1.1 Scope

**In scope (Phase 2)**:
- Card rules API queries (cards, earn_rules, caps, categories)
- Recommendation engine scoring algorithm
- User portfolio CRUD (add/remove/list cards)
- Error handling and edge cases for all the above

**Out of scope for MVP unit tests** (validated manually or in integration tests):
- Supabase Auth flows (sign-up, sign-in, OAuth) -- tested via Supabase dashboard
- RLS policy enforcement -- tested via integration/security review on Day 9 (T4.05)
- Transaction logging and trigger-based cap deduction -- tested in Phase 3 integration
- React Native UI rendering and navigation -- tested via manual QA
- Network latency and performance benchmarks

### 1.2 Testing Pyramid

```
           /  Manual E2E  \          <- Smoke tests on device (Day 8-10)
          / Integration    \         <- Supabase RLS + trigger tests (Day 9)
         /  Unit Tests      \        <- THIS PLAN: Jest mocked tests (Day 4-6)
        /_____________________\
```

For the 2-week MVP, we prioritize **unit tests** to catch logic errors early and fast. Integration and E2E tests are manual and lighter.

---

## 2. Unit Test Strategy

### 2.1 What We Test

| Layer | What | How |
|-------|------|-----|
| **Data access** | Supabase query construction and response handling | Mock Supabase client, verify correct response shapes |
| **Business logic** | Recommendation scoring formula, cap_ratio math, ranking | Pure function tests with deterministic inputs |
| **Error paths** | Network errors, not found, auth failures, constraint violations | Mock error responses from Supabase |
| **Edge cases** | Empty portfolios, exhausted caps, tied scores, single card | Scenario-based tests with crafted data |

### 2.2 What We Mock

| Dependency | Mock Strategy |
|------------|---------------|
| `@supabase/supabase-js` client | Custom `MockQueryBuilder` class with chainable methods (`.from().select().eq().single()`) that resolve to configurable responses |
| `supabase.rpc()` | `MockRpc` class with per-function response registration |
| `supabase.auth` | `MockAuth` class with `getUser()`, `getSession()`, `signOut()` |
| AsyncStorage | Not needed for unit tests (auth persistence is not under test) |
| React Native modules | Not needed for pure logic tests |

### 2.3 Test Naming Convention

```
describe('<Module Name>', () => {
  describe('<function or feature> -- <brief description>', () => {
    it('should <expected behavior> when <condition>', () => { ... });
  });
});
```

Examples:
- `describe('Recommendation Engine')` > `describe('Normal case -- 3 cards, dining category')` > `it('should recommend the card with highest score (earn_rate * cap_ratio)')`
- `describe('Card Rules API')` > `describe('getEarnRulesForCard')` > `it('should return 7 earn rules for HSBC Revolution')`

### 2.4 File Organization

```
tests/
  TEST_PLAN.md              <- This document
  mocks/
    supabase.ts             <- MockQueryBuilder, MockAuth, MockRpc, createMockSupabase()
    test-data.ts            <- Card, EarnRule, Cap, Category fixtures + factory functions
  card-rules.test.ts        <- Card rules API query tests (T2.12)
  recommendation.test.ts    <- Recommendation engine scoring tests (T2.13)
  portfolio.test.ts         <- User portfolio CRUD tests
```

---

## 3. Test Data

### 3.1 Mock Cards (subset of Batch 1)

| Card | Bank | base_rate_mpd | Dining mpd | Online mpd | Cap | Why chosen |
|------|------|---------------|------------|------------|-----|------------|
| HSBC Revolution | HSBC | 0.4 | 4.0 (bonus) | 4.0 (bonus) | $1,000 shared | High bonus rate with cap -- tests cap_ratio math |
| UOB PRVI Miles Visa | UOB | 1.4 | 1.4 (base) | 1.4 (base) | None | Flat rate, no cap -- tests uncapped path |
| Amex KrisFlyer Ascend | Amex | 1.1 | 2.0 (bonus) | 1.1 (base) | $2,500/category | Per-category caps -- tests category-specific cap logic |

### 3.2 Mock Categories

All 7 standard categories are mocked: dining, transport, online, groceries, petrol, travel, general. Display order 1-7. MCCs included for dining, transport, groceries, petrol, travel.

### 3.3 Mock Earn Rules

21 earn rules total (7 categories x 3 cards). Each card has a rule for every category, matching the Batch 1 seed data structure. Bonus rules have `is_bonus: true`.

### 3.4 Mock Caps

| Cap | Card | Category | Monthly Amount | Type |
|-----|------|----------|---------------|------|
| capHSBCShared | HSBC Revolution | null (shared) | $1,000 | spend |
| capAmexDining | Amex Ascend | dining | $2,500 | spend |
| capAmexGroceries | Amex Ascend | groceries | $2,500 | spend |
| capAmexTravel | Amex Ascend | travel | $2,500 | spend |

### 3.5 Mock User

- User ID: `aaaaaaaa-bbbb-cccc-dddd-eeeeeeee0001`
- Email: `test@maximile.app`
- Role: `authenticated`
- Session: Mock JWT with 1-hour expiry

### 3.6 Factory Functions

Test data factories are provided for creating custom test objects with overrides:
- `createCard(overrides)` -- returns a Card with sensible defaults
- `createEarnRule(overrides)` -- returns an EarnRule
- `createCap(overrides)` -- returns a Cap
- `createUserCard(overrides)` -- returns a UserCard
- `createTransaction(overrides)` -- returns a Transaction

---

## 4. Test Categories

### 4.1 Card Rules API (`card-rules.test.ts`)

Tests the Supabase client query patterns for public reference data.

| # | Test Case | Category | Priority |
|---|-----------|----------|----------|
| CR-01 | List all cards returns array with correct fields | Happy path | P0 |
| CR-02 | List cards returns empty array when no cards exist | Edge case | P1 |
| CR-03 | Get card by ID returns card with embedded earn_rules, caps, exclusions | Happy path | P0 |
| CR-04 | Get card by ID returns error when card not found | Error | P0 |
| CR-05 | Get earn rules returns 7 category rules with correct mpd values | Happy path | P0 |
| CR-06 | Get earn rules filters to active only (effective_to is null) | Happy path | P1 |
| CR-07 | Get earn rules returns empty for card with no rules | Edge case | P1 |
| CR-08 | Get caps returns caps with correct monthly amounts | Happy path | P0 |
| CR-09 | Get caps returns empty for uncapped card | Edge case | P1 |
| CR-10 | Get caps returns shared (null category) cap | Edge case | P1 |
| CR-11 | Get categories returns 7 in display order | Happy path | P0 |
| CR-12 | Categories include MCCs arrays | Happy path | P1 |
| CR-13 | Filter active cards excludes is_active=false | Happy path | P0 |
| CR-14 | Inactive card ID not in active results | Edge case | P1 |
| CR-15 | Network error propagated correctly | Error | P0 |
| CR-16 | Invalid UUID format returns error code 22P02 | Error | P1 |
| CR-17 | Empty results return empty array (not error) | Edge case | P0 |
| CR-18 | 401 unauthorized error propagated | Error | P1 |
| CR-19 | 500 server error propagated | Error | P2 |

### 4.2 Recommendation Engine (`recommendation.test.ts`)

Tests the scoring algorithm and ranking logic.

| # | Test Case | Category | Priority |
|---|-----------|----------|----------|
| RE-01 | Normal case: 3 cards, highest score wins | Happy path | P0 |
| RE-02 | RPC mock returns correct ranked results | Happy path | P0 |
| RE-03 | All caps exhausted: falls back to earn_rate ranking | Edge case | P0 |
| RE-04 | All caps exhausted: top card still gets is_recommended | Edge case | P1 |
| RE-05 | Single card: always is_recommended=true | Edge case | P0 |
| RE-06 | Single card with exhausted cap: still recommended | Edge case | P1 |
| RE-07 | No cards: returns empty array | Edge case | P0 |
| RE-08 | No cards via RPC: returns empty array | Edge case | P1 |
| RE-09 | General category: all cards at base_rate_mpd | Happy path | P1 |
| RE-10 | Tied scores: alphabetical tiebreaker on card_name | Edge case | P0 |
| RE-11 | Tied scores: deterministic across multiple calls | Edge case | P1 |
| RE-12 | Tied scores at zero: earn_rate_mpd secondary sort | Edge case | P1 |
| RE-13 | New user (full caps): ranked by earn_rate_mpd | Happy path | P0 |
| RE-14 | Missing spending_state treated as full cap | Edge case | P0 |
| RE-15 | Mixed caps: uncapped card above exhausted capped card | Edge case | P0 |
| RE-16 | Mixed caps: partial cap vs uncapped, score-based ranking | Edge case | P1 |
| RE-17 | Mixed caps: high-rate partial cap beats low-rate uncapped | Edge case | P1 |
| RE-18 | cap_ratio calculation: 300/1000 = 0.3 | Unit | P0 |
| RE-19 | cap_ratio clamped at 1.0 for remaining > monthly | Edge case | P1 |
| RE-20 | Remaining cap exactly 0 produces score 0 | Edge case | P1 |
| RE-21 | Negative remaining cap treated as 0 | Edge case | P2 |
| RE-22 | RPC error for invalid category | Error | P0 |
| RE-23 | RPC error for unauthenticated user | Error | P0 |

### 4.3 User Portfolio (`portfolio.test.ts`)

Tests CRUD operations on user_cards.

| # | Test Case | Category | Priority |
|---|-----------|----------|----------|
| PF-01 | Add card: returns success with created row | Happy path | P0 |
| PF-02 | Add card: FK violation for invalid card_id | Error | P0 |
| PF-03 | Add card: user_id auto-populated from auth.uid() | Happy path | P1 |
| PF-04 | Remove card: returns no error on success | Happy path | P0 |
| PF-05 | Remove card: idempotent (no error if card not in portfolio) | Edge case | P1 |
| PF-06 | Remove card: RLS prevents deleting other users' cards | Security | P0 |
| PF-07 | List cards: returns cards with embedded card details | Happy path | P0 |
| PF-08 | List cards: RLS filters to current user only | Security | P0 |
| PF-09 | Add duplicate: returns 23505 unique violation error | Error | P0 |
| PF-10 | Add two different cards: both succeed | Happy path | P1 |
| PF-11 | Empty portfolio: returns empty array | Edge case | P0 |
| PF-12 | Unauthenticated: returns 401 error | Error | P0 |
| PF-13 | Auth context: getUser returns mock user | Setup | P1 |
| PF-14 | Auth context: getSession returns mock session | Setup | P1 |
| PF-15 | Auth context: signOut works | Setup | P2 |

### 4.4 Transaction Logging (Phase 3 -- Documented for Completeness)

These tests will be implemented in Phase 3 when transaction logging is built.

| # | Test Case | Category | Priority |
|---|-----------|----------|----------|
| TX-01 | Log transaction: returns created transaction row | Happy path | P0 |
| TX-02 | Log transaction: triggers spending_state update | Integration | P0 |
| TX-03 | Log transaction: FK violation for invalid card_id | Error | P1 |
| TX-04 | Log transaction: FK violation for invalid category_id | Error | P1 |
| TX-05 | Log transaction: CHECK violation for negative amount | Error | P0 |
| TX-06 | Get transaction history: returns user's transactions | Happy path | P0 |
| TX-07 | Get transaction history: RLS filters to current user | Security | P0 |
| TX-08 | Get transaction history: filter by date range | Happy path | P1 |
| TX-09 | Get transaction history: empty result | Edge case | P1 |

### 4.5 Cap Tracking (Phase 3 -- Documented for Completeness)

These tests will be implemented in Phase 3 when cap-aware features are built.

| # | Test Case | Category | Priority |
|---|-----------|----------|----------|
| CT-01 | First transaction: spending_state row created | Happy path | P0 |
| CT-02 | Subsequent transaction: total_spent incremented | Happy path | P0 |
| CT-03 | Remaining cap decremented correctly | Happy path | P0 |
| CT-04 | Remaining cap floors at 0 (does not go negative) | Edge case | P0 |
| CT-05 | Uncapped card+category: remaining_cap stays null | Edge case | P1 |
| CT-06 | Month boundary: new month has no spending_state (auto-reset) | Edge case | P0 |
| CT-07 | Spending state readable by user (RLS) | Security | P1 |
| CT-08 | Spending state not directly writable by user (RLS) | Security | P0 |

---

## 5. Coverage Targets

### 5.1 Quantitative Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Line coverage | >= 70% | Sufficient for MVP; focus on critical paths |
| Branch coverage | >= 60% | Cover major conditional branches (cap_ratio, tiebreakers) |
| Function coverage | >= 70% | All exported functions should have at least one test |
| Statement coverage | >= 70% | Aligned with line coverage |

### 5.2 Qualitative Targets

- **All P0 tests pass**: Every priority-0 test case must pass before merging.
- **No false positives**: Mocks should be realistic. Tests should fail if the implementation changes behavior.
- **Deterministic**: All tests produce the same results on every run. No reliance on system time, random data, or network.
- **Fast**: All unit tests should complete in under 10 seconds total (no network I/O, no database).

---

## 6. Test Execution

### 6.1 Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx jest tests/recommendation.test.ts

# Run with coverage report
npx jest --coverage

# Run in watch mode (during development)
npx jest --watch
```

### 6.2 Jest Configuration

See `jest.config.js` at the project root. Key settings:
- Preset: `jest-expo` (handles React Native module transforms)
- Module aliases: `@/` maps to project root
- Transform ignore: Supabase and React Native packages are transformed
- Coverage collection: `lib/**/*.ts` (excludes type files and node_modules)

### 6.3 CI Integration (Future)

When CI is set up, tests should run on every push:
```yaml
# Example GitHub Actions step
- name: Run tests
  run: npm test -- --ci --coverage --forceExit
```

---

## 7. Test Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `jest` | ^29.7.0 | Test runner and assertion library |
| `jest-expo` | ~52.0.0 | Expo-compatible Jest preset |
| `@testing-library/react-native` | ^12.0.0 | UI testing (for future component tests) |
| `typescript` | ~5.3.0 | TypeScript compilation for test files |

All dependencies are already declared in `package.json` under `devDependencies`.

---

## 8. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Mock drift: mocks diverge from real Supabase behavior | Medium | Keep mock shapes aligned with `supabase-types.ts`. Run manual smoke tests against real Supabase. |
| Algorithm spec changes | Low | Recommendation algorithm is spec-locked for Phase 2. Any changes require updating both SQL and TypeScript test implementations. |
| Missing edge cases | Medium | The test plan covers all edge cases from RECOMMENDATION_ALGORITHM.md section 3. Additional cases can be added post-launch based on user reports. |
| False confidence from passing mocked tests | Medium | Supplement with manual integration tests against Supabase on Day 9 (T4.05). |

---

## 9. Acceptance Criteria

Phase 2 testing is complete when:

1. All test files are written and placed in `tests/`.
2. `npm test` passes with zero failures.
3. Coverage meets the targets in section 5.1 (>= 70% lines, 60% branches).
4. All P0 test cases from sections 4.1-4.3 pass.
5. Test plan is documented and reviewed.
