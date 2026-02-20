# Sprint Plan: Earning Insights Improvements

**Project**: MaxiMile — Earning Insights Enhancements (F7/F17)
**Created**: 2026-02-20
**Scrum Master**: SM Agent
**PRD Reference**: `docs/PRD.md` Features F7 (Miles Earning Insights) and F17 (Miles Earning Insights Extended)
**Source Files**: `app/earning-insights.tsx`, `components/MilesHeroSection.tsx`, `app/(tabs)/miles.tsx`

---

## Sprint Overview

| Field | Detail |
|-------|--------|
| **Total Duration** | 5 weeks across 3 sprints |
| **Sprint Cadence** | Sprint N: 2 weeks, Sprint N+1: 2 weeks, Sprint N+2: 1 week |
| **Sprint Goal** | Deepen the Earning Insights experience with card-level analytics, category breakdowns, actionable recommendations, cap utilisation visibility, goal projections, and month-end notifications |
| **Team Capacity** | 2 Frontend Engineers (FE), 1 Backend/Data Engineer (BE), 1 Designer (UX), 1 QA Engineer |
| **Velocity Assumption** | ~26 story points per 2-week sprint (2 FE x 10 SP + 1 BE x 6 SP); ~13 SP for 1-week sprint |
| **Story Point Scale** | Fibonacci: 1, 2, 3, 5, 8, 13 |

---

## Epics

| Epic ID | Epic Name | Description | Priority | Sprint |
|---------|-----------|-------------|----------|--------|
| E1 | Top Earning Card Highlight | Identify and display which card earned the most miles in the selected month | P1 (RICE 10,200) | Sprint N |
| E2 | Miles Saved Baseline Fix | Change "Miles Saved" calculation from lowest-rate-card baseline to 1.4 mpd SG industry average | P1 (RICE 5,400) | Sprint N |
| E3 | Category Spending Breakdown | Group transactions by category, compute per-category miles, render ranked breakdown | P1 (RICE 4,800) | Sprint N |
| E4 | Actionable Insight Cards | Conditional logic cards surfacing underutilised caps, unused cards, missed categories | P2 (RICE 2,333) | Sprint N+1 |
| E5 | Cap Utilisation Summary | Per-card monthly cap usage percentages with visual progress bars | P2 (RICE 4,000) | Sprint N+1 |
| E6 | Goal Projection Tie-In | Compute monthly earning rate and project months-to-goal on insights screen | P2 (RICE 3,000) | Sprint N+2 |
| E7 | Monthly Summary Notification | Push notification at month-end deep-linking to earning insights | P2 (RICE 3,000) | Sprint N+2 |

---

## User Stories

### Epic E1: Top Earning Card Highlight

| Story ID | As a... | I want... | So that... | Points | Assigned To |
|----------|---------|-----------|------------|--------|-------------|
| S1.1 | miles optimizer | to see which card earned the most miles this month on the earning insights screen | I know which card is pulling the most weight in my portfolio | 5 | FE1 |
| S1.2 | user | the MVP card highlight to also appear as a compact chip on the Miles tab hero section | I get a quick glance at my top performer without navigating to full insights | 3 | FE1 |

### Epic E2: Miles Saved Baseline Fix

| Story ID | As a... | I want... | So that... | Points | Assigned To |
|----------|---------|-----------|------------|--------|-------------|
| S2.1 | user | the "Miles Saved" metric to compare against the SG industry average (1.4 mpd) instead of my worst card | the number reflects realistic savings vs what a typical card holder earns | 2 | FE2 |

### Epic E3: Category Spending Breakdown

| Story ID | As a... | I want... | So that... | Points | Assigned To |
|----------|---------|-----------|------------|--------|-------------|
| S3.1 | user | to see a ranked breakdown of miles earned per spending category for the selected month | I understand which categories drive the most value | 5 | FE2 |
| S3.2 | user | the category breakdown to show the category name, icon, total miles, and percentage of total | I can quickly compare categories at a glance | 3 | FE2 |

### Epic E4: Actionable Insight Cards

| Story ID | As a... | I want... | So that... | Points | Assigned To |
|----------|---------|-----------|------------|--------|-------------|
| S4.1 | user | to see an insight card when I have bonus cap headroom remaining on a card I used heavily this month | I know I could have earned more by shifting spend to utilise remaining cap | 5 | FE1 |
| S4.2 | user | to see an insight card when I have cards in my portfolio with zero transactions this month | I am reminded to use underutilised cards where they offer better rates | 3 | FE1 |
| S4.3 | user | to see an insight card when I spent in a category without using the best card for it | I avoid repeating suboptimal card choices next month | 5 | FE2 |

### Epic E5: Cap Utilisation Summary

| Story ID | As a... | I want... | So that... | Points | Assigned To |
|----------|---------|-----------|------------|--------|-------------|
| S5.1 | user | to see a per-card cap utilisation summary showing percentage used of each monthly cap | I understand how much cap headroom remains across my portfolio | 5 | BE |
| S5.2 | user | cap utilisation to render as visual progress bars with colour coding (green/amber/red) | I can instantly gauge which caps are near exhaustion | 3 | FE2 |

### Epic E6: Goal Projection Tie-In

| Story ID | As a... | I want... | So that... | Points | Assigned To |
|----------|---------|-----------|------------|--------|-------------|
| S6.1 | user with an active miles goal | to see a projection of how many months until I reach my goal based on current earning rate | I can plan my travel redemptions with realistic timelines | 5 | FE1 |

### Epic E7: Monthly Summary Notification

| Story ID | As a... | I want... | So that... | Points | Assigned To |
|----------|---------|-----------|------------|--------|-------------|
| S7.1 | user | to receive a push notification at the end of each month summarising my miles earned | I am prompted to review my performance and stay engaged with the app | 5 | BE |
| S7.2 | user | tapping the notification to deep-link directly to the earning insights screen | I can immediately see my full monthly report | 3 | FE2 |

---

## Task Breakdown

### Story S1.1: Top Earning Card — Insights Screen (5 SP)

- [ ] T1.1.1 — Aggregate transactions by `card_id` and compute total miles per card for the selected month in `fetchDashboard()` (2 SP) — @FE1
- [ ] T1.1.2 — Identify the card with the highest miles earned; store as `topEarningCard` in component state with `card_name`, `bank`, `miles_earned`, and `image_url` (1 SP) — @FE1
- [ ] T1.1.3 — Render "MVP Card of the Month" GlassCard section below the stats row showing card name, bank, miles earned, and card image (1 SP) — @FE1
- [ ] T1.1.4 — Write unit tests for the per-card aggregation logic (1 SP) — @FE1

**Acceptance Criteria (DoD):**
- [ ] When the user has transactions in the selected month, the card with the highest total miles is displayed as "MVP Card of the Month"
- [ ] The card shows: card name, issuing bank, miles earned, and card image (or placeholder if no image)
- [ ] When there are no transactions, the section is hidden
- [ ] When there is a tie, any one of the tied cards may be shown (deterministic by card name alphabetical)
- [ ] Unit tests cover: single card, multiple cards, tie scenario, zero transactions
- [ ] Code reviewed and passing lint

---

### Story S1.2: Top Earning Card — Miles Tab Hero Chip (3 SP)

- [ ] T1.2.1 — Extend `get_monthly_earning_insights` RPC (or client-side computation) to include `top_card_name` and `top_card_miles` in the response (1 SP) — @BE
- [ ] T1.2.2 — Add an optional `topCardName` prop to `MilesHeroSection` and render a third chip "Top card: [name]" when present (1 SP) — @FE1
- [ ] T1.2.3 — Pass the top card data from `miles.tsx` to `MilesHeroSection` (1 SP) — @FE1

**Acceptance Criteria (DoD):**
- [ ] The Miles tab hero section shows a third chip with the name of the top earning card when data is available
- [ ] The chip is hidden when there are no transactions this month
- [ ] The chip does not break layout when card name is long (truncated with ellipsis at 18 characters)
- [ ] Existing hero section layout and accessibility labels remain intact

---

### Story S2.1: Fix Miles Saved Baseline (2 SP)

- [ ] T2.1.1 — In `earning-insights.tsx`, replace the `lowestBaseRate` loop (lines 181-187) with a constant `const BASELINE_MPD = 1.4` and compute `baselineMiles = totalSpend * BASELINE_MPD` (1 SP) — @FE2
- [ ] T2.1.2 — Update the insight card explanation text (line 420-425) to say "compared to the Singapore average of 1.4 miles per dollar" instead of "than if you had used a single card for everything" (0.5 SP) — @FE2
- [ ] T2.1.3 — If the RPC `get_monthly_earning_insights` also uses the lowest-rate baseline, update the server-side logic equivalently (0.5 SP) — @BE

**Acceptance Criteria (DoD):**
- [ ] "Miles Saved" on the earning insights screen equals `totalMilesEarned - (totalSpend * 1.4)`
- [ ] "Miles Saved" on the Miles tab hero chip uses the same 1.4 mpd baseline
- [ ] The insight card text references "Singapore average of 1.4 miles per dollar"
- [ ] If total miles earned is less than baseline, Miles Saved displays as 0 (never negative)
- [ ] `BASELINE_MPD` is defined as a named constant (not magic number) for future configurability
- [ ] Unit test verifies the new baseline calculation

---

### Story S3.1: Category Spending Breakdown — Data (5 SP)

- [ ] T3.1.1 — In `fetchDashboard()`, group the current month's transactions by `category_id` and compute: total spend, total miles, and transaction count per category (2 SP) — @FE2
- [ ] T3.1.2 — Fetch category metadata (name, icon) from the `categories` table and join with the grouped data (1 SP) — @FE2
- [ ] T3.1.3 — Sort categories by miles earned descending; compute percentage of total miles per category (1 SP) — @FE2
- [ ] T3.1.4 — Add `CategoryBreakdown` interface and update `DashboardData` type to include `categoryBreakdown: CategoryBreakdown[]` (1 SP) — @FE2

**Acceptance Criteria (DoD):**
- [ ] `categoryBreakdown` array is populated with one entry per category that has transactions in the selected month
- [ ] Each entry contains: `category_id`, `category_name`, `icon`, `miles_earned`, `total_spend`, `transaction_count`, `percentage`
- [ ] Entries are sorted descending by `miles_earned`
- [ ] Percentages sum to 100% (with rounding tolerance)
- [ ] Categories with zero transactions are excluded

---

### Story S3.2: Category Spending Breakdown — UI (3 SP)

- [ ] T3.2.1 — Create a "Category Breakdown" section below the Monthly Trend section in `earning-insights.tsx` (1 SP) — @FE2
- [ ] T3.2.2 — Render each category as a row: icon + name on the left, miles earned + horizontal progress bar + percentage on the right (1.5 SP) — @FE2
- [ ] T3.2.3 — Hide the section when there are zero categories; add "No category data" fallback if needed (0.5 SP) — @FE2

**Acceptance Criteria (DoD):**
- [ ] Category breakdown renders as a ranked list with horizontal bars proportional to miles earned
- [ ] Each row shows: category icon, category name, miles earned (formatted with commas), percentage of total
- [ ] The top category's bar is full width; others are proportional
- [ ] Section heading reads "Earning by Category"
- [ ] Section is hidden when no transactions exist for the month
- [ ] Accessibility: each row has an `accessibilityLabel` reading "[Category] earned [X] miles, [Y]% of total"

---

### Story S4.1: Insight Card — Underutilised Cap (5 SP)

- [ ] T4.1.1 — After fetching transactions and caps, compute per-card cap utilisation percentage for the selected month (2 SP) — @FE1
- [ ] T4.1.2 — Identify cards where cap utilisation is below 50% but the card had transactions (indicating usage but not maxing out) (1 SP) — @FE1
- [ ] T4.1.3 — Render an insight card: "You only used [X]% of your [Card Name] [Category] bonus cap. You could have earned [Y] more miles by shifting spend." (1.5 SP) — @FE1
- [ ] T4.1.4 — Limit to a maximum of 2 insight cards of this type to avoid clutter (0.5 SP) — @FE1

**Acceptance Criteria (DoD):**
- [ ] When a card's cap utilisation is below 50% and the card was used this month, an insight card appears
- [ ] The card shows the card name, category, cap percentage used, and estimated additional miles
- [ ] Maximum 2 underutilised-cap insight cards are shown
- [ ] The insight card has a distinct visual style (amber left border, lightbulb icon)
- [ ] When no cards meet the criteria, no card is shown (no empty state needed)

---

### Story S4.2: Insight Card — Unused Cards (3 SP)

- [ ] T4.2.1 — Compare user's card portfolio (`user_cards`) against transactions for the month to find cards with zero transactions (1 SP) — @FE1
- [ ] T4.2.2 — For each unused card, find its best bonus category earn rate (1 SP) — @FE1
- [ ] T4.2.3 — Render insight card: "You didn't use [Card Name] this month. It earns [X] mpd on [Category] -- consider it next time!" (1 SP) — @FE1

**Acceptance Criteria (DoD):**
- [ ] When a user has cards with zero transactions in the selected month, an insight card appears for each (max 2)
- [ ] The card highlights the unused card's best bonus category
- [ ] The card is styled with a blue-grey left border and an `information-circle-outline` icon
- [ ] Cards without any bonus categories are excluded from this insight

---

### Story S4.3: Insight Card — Missed Best Card (5 SP)

- [ ] T4.3.1 — For each transaction in the month, compare the card used against the optimal card for that category from the user's portfolio (2 SP) — @FE2
- [ ] T4.3.2 — Aggregate the total "missed miles" (optimal miles - actual miles) per category and identify the top missed category (1 SP) — @FE2
- [ ] T4.3.3 — Render insight card: "For [Category] spending, [Optimal Card] would have earned [X] more miles than [Used Card]. Consider switching next month." (1.5 SP) — @FE2
- [ ] T4.3.4 — Only show this card if the missed miles exceed a minimum threshold (100 miles) to avoid trivial suggestions (0.5 SP) — @FE2

**Acceptance Criteria (DoD):**
- [ ] When the user could have earned 100+ more miles by using a different card for a given category, an insight card appears
- [ ] Maximum 1 missed-best-card insight card is shown (the highest-impact category)
- [ ] The card shows the category name, the card used, the optimal card, and the miles difference
- [ ] The card is styled with a red left border and a `swap-horizontal-outline` icon
- [ ] When all categories used optimal cards, no card is shown

---

### Story S5.1: Cap Utilisation Summary — Data (5 SP)

- [ ] T5.1.1 — Fetch the `caps` table for all user cards and the `spending_state` for the selected month (2 SP) — @BE
- [ ] T5.1.2 — Compute utilisation percentage per card per capped category: `(total_spent / monthly_cap_amount) * 100` (1 SP) — @BE
- [ ] T5.1.3 — Expose cap utilisation data through the existing `fetchDashboard` flow or a new lightweight RPC `get_cap_utilisation` (2 SP) — @BE

**Acceptance Criteria (DoD):**
- [ ] For each card with a cap, the utilisation percentage is correctly computed
- [ ] Cards without caps are excluded
- [ ] When `total_spent` exceeds `monthly_cap_amount`, utilisation shows as 100% (capped, not >100%)
- [ ] Data is returned sorted by utilisation percentage descending (highest usage first)
- [ ] Server-side logic handles the case where no `spending_state` row exists (treats as 0%)

---

### Story S5.2: Cap Utilisation Summary — UI (3 SP)

- [ ] T5.2.1 — Create a "Cap Utilisation" section in `earning-insights.tsx` below the Category Breakdown section (1 SP) — @FE2
- [ ] T5.2.2 — Render each capped card as a row: card name + category, horizontal progress bar with fill colour (green <60%, amber 60-89%, red 90-100%), percentage label (1.5 SP) — @FE2
- [ ] T5.2.3 — Add a tooltip or info icon explaining "Cap resets on the 1st of each month" (0.5 SP) — @FE2

**Acceptance Criteria (DoD):**
- [ ] Each capped card/category shows a labelled progress bar
- [ ] Colour coding: green (#34C759) for <60%, amber (#FF9500) for 60-89%, red (#FF3B30) for 90-100%
- [ ] When a cap is fully exhausted (100%), the row shows a "Cap reached" badge
- [ ] Section heading reads "Cap Utilisation"
- [ ] Section is hidden when the user has no capped cards
- [ ] Accessibility: each bar has `accessibilityLabel` reading "[Card] [Category] cap [X]% used"

---

### Story S6.1: Goal Projection Tie-In (5 SP)

- [ ] T6.1.1 — Fetch the user's active miles goals from the goals table (or existing goal tracker state) (1 SP) — @FE1
- [ ] T6.1.2 — Compute the average monthly earning rate using the 3-month trend data already fetched in `fetchDashboard()` (1 SP) — @FE1
- [ ] T6.1.3 — For each active goal, calculate: `remaining_miles = goal_target - current_balance` and `months_to_goal = remaining_miles / avg_monthly_rate` (1 SP) — @FE1
- [ ] T6.1.4 — Render a "Goal Projection" card at the bottom of the insights screen showing: goal name, progress bar, projected achievement date (month/year), earning rate trend indicator (up/down/flat) (2 SP) — @FE1

**Acceptance Criteria (DoD):**
- [ ] When the user has an active miles goal, a projection card appears
- [ ] The projection shows: goal name, current progress percentage, projected completion month/year
- [ ] If monthly earning rate is zero, show "Set a target and start earning to see projections" instead of dividing by zero
- [ ] The projected date is computed from the average of available trend months (up to 3)
- [ ] If the goal is already achieved, show a celebratory state instead of projection
- [ ] Card is hidden when the user has no active goals

---

### Story S7.1: Monthly Summary Notification — Backend (5 SP)

- [ ] T7.1.1 — Create a Supabase Edge Function or scheduled cron job `send-monthly-summary` that runs on the 1st of each month at 09:00 SGT (2 SP) — @BE
- [ ] T7.1.2 — The function queries each user's total miles earned and miles saved for the previous month (1 SP) — @BE
- [ ] T7.1.3 — Compose and send a push notification via Expo Push API: title "Your [Month] Miles Report", body "[X] miles earned, [Y] miles saved vs average" (1.5 SP) — @BE
- [ ] T7.1.4 — Add a `notification_preferences` column or table row for users to opt out of monthly summaries (0.5 SP) — @BE

**Acceptance Criteria (DoD):**
- [ ] On the 1st of each month, all opted-in users receive a push notification
- [ ] The notification body shows accurate miles earned and miles saved figures
- [ ] Users who have opted out do not receive the notification
- [ ] The notification payload includes a `deep_link` field pointing to `/earning-insights`
- [ ] The function handles users with zero transactions gracefully (no notification sent, or a "No transactions" variant)
- [ ] Error handling: failed push tokens are logged, not retried immediately

---

### Story S7.2: Monthly Summary Notification — Deep Link (3 SP)

- [ ] T7.2.1 — Configure Expo notifications handler in the app to parse the `deep_link` field from the push payload (1 SP) — @FE2
- [ ] T7.2.2 — When the app opens from the notification, navigate to the `earning-insights` screen with the previous month pre-selected (1.5 SP) — @FE2
- [ ] T7.2.3 — Test deep-link behaviour for: app in foreground, app in background, app killed (0.5 SP) — @QA

**Acceptance Criteria (DoD):**
- [ ] Tapping the notification opens the app to the earning insights screen
- [ ] The selected month defaults to the previous month (the month being summarised)
- [ ] Deep-linking works when the app is in foreground, background, and killed states
- [ ] If the user has logged out, the deep-link lands on the login screen and then redirects after auth

---

## Sprint Backlog (Prioritized)

### Sprint N — Quick Wins (2 weeks, 26 SP capacity)

| Priority | Item | Type | Points | Dependencies | Assigned |
|----------|------|------|--------|--------------|----------|
| 1 | S2.1: Fix Miles Saved baseline | Story | 2 | None | FE2, BE |
| 2 | S1.1: Top Earning Card — Insights screen | Story | 5 | None | FE1 |
| 3 | S3.1: Category Spending Breakdown — Data | Story | 5 | None | FE2 |
| 4 | S3.2: Category Spending Breakdown — UI | Story | 3 | S3.1 | FE2 |
| 5 | S1.2: Top Earning Card — Miles Tab chip | Story | 3 | S1.1 | FE1, BE |
| | **Sprint N Total** | | **18** | | |

**Sprint N Goal**: Deliver the three highest-RICE quick wins -- users can see their top earning card, a corrected Miles Saved figure, and a full category breakdown on the earning insights screen.

**Sprint N Buffer**: 8 SP buffer for unforeseen complexity, code review cycles, and bug fixes.

---

### Sprint N+1 — Value Deepening (2 weeks, 26 SP capacity)

| Priority | Item | Type | Points | Dependencies | Assigned |
|----------|------|------|--------|--------------|----------|
| 1 | S5.1: Cap Utilisation Summary — Data | Story | 5 | None | BE |
| 2 | S5.2: Cap Utilisation Summary — UI | Story | 3 | S5.1 | FE2 |
| 3 | S4.1: Insight Card — Underutilised Cap | Story | 5 | S5.1 (cap data) | FE1 |
| 4 | S4.2: Insight Card — Unused Cards | Story | 3 | None | FE1 |
| 5 | S4.3: Insight Card — Missed Best Card | Story | 5 | S3.1 (category data) | FE2 |
| | **Sprint N+1 Total** | | **21** | | |

**Sprint N+1 Goal**: Surface actionable recommendations and cap visibility -- users receive personalised insight cards and understand their cap utilisation at a glance.

**Sprint N+1 Buffer**: 5 SP buffer for integration testing across the insight card types and cap data pipelines.

---

### Sprint N+2 — Engagement Loop (1 week, 13 SP capacity)

| Priority | Item | Type | Points | Dependencies | Assigned |
|----------|------|------|--------|--------------|----------|
| 1 | S6.1: Goal Projection Tie-In | Story | 5 | Miles Goal Tracker (F16) shipped | FE1 |
| 2 | S7.1: Monthly Summary Notification — Backend | Story | 5 | S2.1 (correct baseline) | BE |
| 3 | S7.2: Monthly Summary Notification — Deep Link | Story | 3 | S7.1 | FE2, QA |
| | **Sprint N+2 Total** | | **13** | | |

**Sprint N+2 Goal**: Close the engagement loop -- users are proactively brought back to the app via monthly push notifications and can see goal projections powered by their earning data.

**Sprint N+2 Buffer**: 0 SP (tight 1-week sprint). If S7.2 deep-linking proves more complex than estimated, it can spill to the next sprint.

---

## Dependencies Map

```
[S3.1] ──> [S3.2]     (S3.2 needs category data computed in S3.1)
[S1.1] ──> [S1.2]     (S1.2 Miles tab chip depends on top-card logic from S1.1)
[S5.1] ──> [S5.2]     (S5.2 UI depends on cap utilisation data from S5.1)
[S5.1] ──> [S4.1]     (Underutilised cap insight needs cap data from S5.1)
[S3.1] ──> [S4.3]     (Missed best card insight reuses category grouping from S3.1)
[S7.1] ──> [S7.2]     (Deep link handler depends on notification payload from S7.1)
[S2.1] ──> [S7.1]     (Notification should use corrected 1.4 mpd baseline)
[F16]  ──> [S6.1]     (Goal projection requires Miles Goal Tracker feature to be shipped)
```

### Cross-Feature Dependencies

| Dependency | Feature | Status | Impact if Unresolved |
|------------|---------|--------|----------------------|
| Miles Goal Tracker (F16) must be shipped | S6.1 (Goal Projection) | Shipped | S6.1 cannot render without active goals data |
| `get_monthly_earning_insights` RPC exists | S1.2, S2.1 | Shipped | Server-side baseline fix (T2.1.3) depends on RPC being modifiable |
| `caps` and `spending_state` tables populated | S5.1, S4.1 | Shipped (F3) | Cap utilisation data requires cap tracking to be functional |
| Expo Push Notifications configured | S7.1, S7.2 | Requires verification | Monthly notification is blocked if push tokens are not collected |

---

## Sprint Capacity Assumptions

| Role | Availability | SP per 2-week Sprint | Notes |
|------|-------------|---------------------|-------|
| FE1 (Frontend Engineer 1) | 100% | ~10 SP | Focuses on E1, E4, E6 |
| FE2 (Frontend Engineer 2) | 100% | ~10 SP | Focuses on E2, E3, E5, S7.2 |
| BE (Backend/Data Engineer) | 100% | ~6 SP | Focuses on RPC updates, cap data, notification function |
| UX (Designer) | 50% (shared) | N/A (design ahead) | Delivers wireframes 1 sprint ahead; available for review |
| QA (QA Engineer) | 50% (shared) | N/A (testing) | Runs acceptance testing in final 2 days of each sprint |

### Design Readiness

| Sprint | Design Items Needed | Due By |
|--------|-------------------|--------|
| Sprint N | MVP Card of the Month card layout; Category breakdown row design; Updated "Miles Saved" explanation copy | Sprint N Day 1 (design ahead) |
| Sprint N+1 | Insight card variants (3 types) with iconography and colour coding; Cap utilisation progress bar design | Sprint N+1 Day 1 |
| Sprint N+2 | Goal projection card layout; Notification copy and payload spec | Sprint N+2 Day 1 |

---

## Risks & Blockers

| ID | Risk/Blocker | Likelihood | Impact | Mitigation | Owner |
|----|-------------|------------|--------|------------|-------|
| R1 | `get_monthly_earning_insights` RPC may not expose per-card or per-category data, requiring schema changes | Medium | Medium | Inspect RPC definition early (Sprint N Day 1). If insufficient, compute client-side using existing transaction queries as already done in `earning-insights.tsx` | BE |
| R2 | Expo Push Notification tokens may not be collected for all users, reducing S7.1 reach | Medium | Low | Verify push token collection in current onboarding flow. Add token registration prompt if missing. Gracefully skip users without tokens | BE |
| R3 | Cap utilisation depends on `spending_state` being kept in sync — if users skip transaction logging, cap data is stale | High | Medium | Show "Based on logged transactions" disclaimer on cap utilisation section. Long-term: bank API integration in v2 | FE2, PM |
| R4 | 1-week Sprint N+2 is tight for 13 SP — notification deep-linking across 3 app states (foreground, background, killed) may need extra testing | Medium | Medium | If S7.2 is not fully tested, ship notification without deep-link (plain app open) and add deep-link in a patch | QA |
| R5 | Actionable insight cards (E4) require careful threshold tuning — too aggressive = spammy, too conservative = never shown | Medium | Low | Start with conservative thresholds (50% cap headroom, 100+ missed miles). Tune based on analytics after 1 month | FE1, PM |
| R6 | Category breakdown may show misleading data if users do not consistently categorise transactions correctly | Low | Medium | Categories are system-assigned based on selection at logging time. Add "Categories are based on your transaction logs" footnote | FE2 |
| R7 | The 1.4 mpd baseline (S2.1) may not be universally accepted — some users may prefer personalised baseline | Low | Low | Ship with 1.4 mpd as default. Log feature requests for configurable baseline. The constant `BASELINE_MPD` makes future changes trivial | PM |

---

## Definition of Ready (DoR) — All Stories

| DoR Item | Status | Notes |
|----------|--------|-------|
| Clear user story format | Pass | All stories follow "As a... I want... So that..." |
| Acceptance criteria defined | Pass | Each story has specific, testable criteria |
| Estimated with story points | Pass | All stories estimated using Fibonacci scale |
| Dependencies identified | Pass | See Dependencies Map above |
| Design ready | Pending | UX to deliver wireframes 1 sprint ahead |
| Data model defined | Pass | Existing schema (`supabase-types.ts`) supports all queries; S5.1 may need new RPC |
| No blockers preventing start | Pass | All external dependencies (F16, F3) are already shipped |
| Story is small enough | Pass | Largest story is 5 SP; no story exceeds sprint capacity |

---

## Definition of Done (DoD) — Global

Every story must satisfy all of the following before it can be marked complete:

- [ ] Code complete and follows project TypeScript/React Native conventions
- [ ] All new functions have JSDoc comments
- [ ] Unit tests written and passing (Jest) for computation logic
- [ ] Component renders correctly on iOS and Android (manual verification)
- [ ] Code reviewed by at least one other engineer
- [ ] Acceptance criteria verified by QA
- [ ] No new TypeScript `any` types introduced
- [ ] Accessibility labels added for all interactive and data-display elements
- [ ] Analytics events tracked for new interactions (`track()` calls)
- [ ] No regression in existing earning insights or Miles tab functionality
- [ ] PR merged to `main` branch

---

## Ceremonies

| Ceremony | Cadence | Duration | Format |
|----------|---------|----------|--------|
| Sprint Planning | Start of each sprint | 1 hour | Synchronous, all roles |
| Daily Standup | Daily | 15 minutes | Async standup in team chat |
| Backlog Refinement | Mid-sprint | 30 minutes | FE + BE + PM |
| Sprint Review / Demo | End of each sprint | 30 minutes | Live demo to PM + stakeholders |
| Sprint Retrospective | End of each sprint | 20 minutes | Quick wins / improvements list |

---

## Appendix: Code Change Summary

### Files to Modify

| File | Changes | Stories |
|------|---------|---------|
| `app/earning-insights.tsx` | Add top-card aggregation, fix baseline constant, add category breakdown section, add insight cards section, add cap utilisation section, add goal projection card | S1.1, S2.1, S3.1, S3.2, S4.1, S4.2, S4.3, S5.2, S6.1 |
| `components/MilesHeroSection.tsx` | Add optional `topCardName` prop and third chip | S1.2 |
| `app/(tabs)/miles.tsx` | Pass `topCardName` from insights data to `MilesHeroSection` | S1.2 |
| `lib/supabase-types.ts` | Add interfaces for `CapUtilisation`, `CategoryBreakdown` if using RPC | S3.1, S5.1 |

### Files to Create

| File | Purpose | Stories |
|------|---------|---------|
| `database/functions/get_cap_utilisation.sql` | RPC for per-card cap usage percentages | S5.1 |
| `database/functions/send_monthly_summary.ts` | Edge Function for monthly push notification | S7.1 |
| `lib/notification-handler.ts` | Deep-link parser for push notification payloads | S7.2 |
| `tests/earning-insights.test.ts` | Unit tests for new computation logic | S1.1, S2.1, S3.1, S4.1, S4.3 |

### Key Constants

```typescript
// earning-insights.tsx
const BASELINE_MPD = 1.4;             // SG industry average miles per dollar
const INSIGHT_MAX_UNDERUTILISED = 2;  // Max underutilised-cap insight cards
const INSIGHT_MAX_UNUSED = 2;         // Max unused-card insight cards
const INSIGHT_MISSED_THRESHOLD = 100; // Min missed miles to show missed-card insight
const CAP_AMBER_THRESHOLD = 0.6;     // 60% cap usage = amber
const CAP_RED_THRESHOLD = 0.9;       // 90% cap usage = red
```
