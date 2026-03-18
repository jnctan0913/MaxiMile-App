# Sprint Plan: MaxiMile — Credit Card Miles Optimizer

**Version**: 21.0
**Created**: 2026-02-19
**Author**: Scrum Master Agent
**Source**: PRD v2.13, EPICS_AND_USER_STORIES v1.7, MAXIMILE_VS_MILELION_ANALYSIS v1.0, CARD_DATA_VERIFICATION v1.0, AUDIT_MILELION_VS_RANKINGS v1.0
**Status**: In Progress — Sprint 20 Active, Sprint 16b ✅ COMPLETED (T&C Focus Refactor), Sprint 16c ✅ COMPLETED (MileLion Detection Pivot), Sprint 21 ✅ COMPLETED (F30 + F32 Condition Transparency), Sprint 22 ✅ COMPLETED (Min Spend Enforcement), Sprints 23-24 ✅ COMPLETED (Card Expansion 22→29 + UOB Lady's Solitaire UX), Sprints 25-28 ✅ COMPLETED (MileLion Gap Analysis Data Corrections + Bills Subcategory — v1.4.0–v1.7.0 applied 2026-03-01), Sprint 29 ✅ COMPLETED (Earn Rate Refresh — MileLion March 2026 Audit Phase 5), Sprint 30 Planned (DBS yuu Card Integration), Sprint 31 Planned (SC Smart Card Bonus Tiers), Sprint 32 Planned (Auto-Capture Setup Carousel), Sprint 33 ✅ COMPLETED (Navigation Restructure), Sprint 34 ✅ COMPLETED (Merchant Search + Real Logos), Sprint 35 Planned (Transaction Entry Correction), Sprint 38 Planned (Admin Analytics Dashboard)
**Change Log**: v21.0 — Added Sprint 38 "Product Analytics" (F46, Epic E25). 6 stories, 16 SP, 1.5 weeks. Analytics tab for admin dashboard: 5 SQL analytics views (v_active_users, v_event_daily, v_onboarding_funnel, v_smart_pay_funnel, v_notification_funnel), Analytics tab shell with date range picker, North Star MARU card + 6 KPI cards, 3 funnel visualizations with drop-off highlighting, feature adoption chart + event heatmap, active users chart with Recharts. Source: PRD v2.15, F46. v20.0 — Sprint 34 marked COMPLETED. All 6 stories shipped (merchant catalogue, search hook, autocomplete UI, routing integration, merchant context header, analytics). Added merchant logo assets: 162 real brand logos (64×64 PNG) replace placeholders in `assets/merchants/` — 152 downloaded via Google Favicon API, 10 sourced manually. New files added: `constants/merchantImages.ts` (static require map). Source: PRD v2.13. v19.0 — Added Sprint 35 "Transaction Entry Correction" (F43, Epic E22). 5 stories, 14 SP, 1.5 weeks. Swipe-to-reveal Edit and Delete actions on transaction rows; Edit bottom sheet reuses Log form components with pre-filled fields (amount, category, card, date); Supabase UPDATE + spending_state recalculation on save; Delete with confirmation alert and optional 5-second undo snackbar; Supabase DELETE + spending_state decrement; analytics events transaction_edited and transaction_deleted. Addresses permanent data entry errors that silently corrupt cap tracking. Modified files: transactions.tsx (swipe gesture + actions), log.tsx or new EditTransactionSheet.tsx (bottom sheet), analytics.ts. v18.0 — Added Sprint 34 "Merchant Search" (F42, Epic E21). 6 stories, 20 SP, 2 weeks. Client-side merchant search on Recommend home screen with ~200 curated Singapore merchants, fuzzy prefix/substring ranking, 120ms debounce, Bills subcategory routing, merchant context on recommendation page, analytics events. Supersedes original F9 placeholder (RICE 467) with fully specified F42 (RICE 3200). New files: merchant-catalogue.ts, useMerchantSearch.ts, MerchantSearchBar.tsx, MerchantAutocomplete.tsx. Source: `docs/planning/MERCHANT_SEARCH_PLAN.md`. v17.0 — Added Sprint 33 "Navigation Restructure" (F41, Epic E20). Merges My Cards + Cap Status tabs into single "My Cards" tab, promotes Transaction History to dedicated "Transactions" tab, adds "See Transactions" button to Card Detail, removes Transaction History from Profile. 5 stories, 8 SP, 0.5 weeks. v16.0 — Added Sprint 30 "DBS yuu Card Integration" (F37, Epic E18) and Sprint 31 "SC Smart Card Bonus Tiers" (F38, Epic E19). Sprint 30: 8 stories, 18 SP, 2 weeks — adds DBS yuu AMEX + DBS yuu Visa as cards #30-31, 10 mpd grocery/food delivery bonus rules, caps, AMEX acceptance warning, rankings update. Sprint 31: 7 stories, 16 SP, 2 weeks — models SC Smart Card tiered cashback-to-miles equivalence (5.6/7.42/9.28 mpd), requires policy decision on cashback-to-miles conversion, recommend() logic update for tiered earn rates. v15.0 — Added Sprint 29 "Earn Rate Refresh" (MileLion March 2026 Audit — Phase 5) and Epic E17 (Earn Rate Accuracy). 8 stories, 14 SP, 1 week. Corrects 7 earn rate/cap discrepancies: DBS Altitude travel bonus removed (4.0→1.2 mpd), HSBC Revolution cap $1,000→$1,500, DBS Woman's World cap $2,000→$1,000, UOB Lady's Card added to groceries, HSBC Revolution added to travel, KrisFlyer UOB transport 2.0→2.4 mpd, UOB PP transport verified. DBS yuu Card and SC Smart Card bonus tiers deferred to Sprint 30+. Source: `docs/technical/AUDIT_MILELION_VS_RANKINGS.md`. v14.0 — Added Sprints 25-28 and Epics E15/E16 based on MileLion 2026 gap analysis. Sprint 25 "Earn Rate Hotfix" (Phase 1 — P0 data corrections: 5 verified wrong earn rates across 29 cards causing incorrect recommendations). Sprint 26 "Telco Bonus Rules" (Phase 2 — 4 mpd telco one-off rules for Cards 6/10/18/20). Sprint 27 "Bills Subcategory Data" (Phase 3 — MCC expansion + per-subcategory earn rules). Sprint 28 "Bills Subcategory UI" (Phase 4 — subcategory picker + HealthHub tip). Source: `docs/technical/DATA_CORRECTION_PLAN.md`. v13.0 — Added Sprint 23 "More Cards" (F33 Part 1 — 6 straightforward cards) and Sprint 24 "Smart Categories" (F33 Part 2 — UOB Lady's Solitaire category selection UX). Card Expansion 20→22 (Maybank World MC + UOB Visa Signature) marked COMPLETE. SC Smart Card DEFERRED (P3, cashback card). Slug mismatch `maybank-world-mc` fixed. v12.0 — Added Sprint 21 "Data Fix" (F30 Petrol/Bills Resolution + F32 Condition Transparency) and Sprint 22 "Smart Scoring" (F31 Min Spend Condition Enforcement). Based on MileLion competitive analysis identifying recommendation accuracy gaps. See `docs/technical/MAXIMILE_VS_MILELION_ANALYSIS.md`. v11.0 — REVISED Push Notifications Plan (Sprints 19-20): Sprint 19 Foundation COMPLETE ✅. Consolidated original Sprints 20-22 into single NEW Sprint 20 "Complete System + Demo Mode" (13 SP, 2 weeks). Removed gradual user rollout (beta → expand → full launch). New focus: Build complete production-ready system (all severities, batching, granular controls) + beautiful demo mode for stakeholder presentations. Total: 2 sprints (19-20), 19 SP, 4 weeks instead of original 8 weeks. No user launch—demo readiness only. v10.0 — Added Sprints 19-22 ("Proactive Alerts": Push Notifications Implementation) with 4-phase rollout (Foundation → Beta → Expand → Full Launch). 22 story points total across 4+ sprints for rate change push alerts with granular user controls, smart batching, and F6 cap alert integration. Addresses critical visibility gap in current in-app-only notification system. See `docs/PUSH_NOTIFICATIONS_EVALUATION.md` for full analysis. v9.0 — Added Sprint 18 ("Demo Mode": F28 — Environment-Controlled Mock Data) enabling product demonstrations without real Apple Pay transactions. Lightweight 14-point sprint with 5 stories covering environment configuration, mock transaction generator, deep link integration, EAS demo build profile, and comprehensive documentation. Fully implemented and shipped with `eas build --profile demo` support. v8.0 — Added 3 new stories to Sprint 16 from DRD v1.1 design decisions: S16.7 (Onboarding Step 1.5 — auto-capture setup integrated into onboarding flow, platform-adaptive, skippable), S16.8 (Recommendation Match Indicator — green "best card" banner or blue "tip" nudge on confirmation screen), S16.9 (Smart Pay → Auto-Capture Handoff — 60-second listener that skips manual entry when auto-capture fires after Wallet return). Sprint 16 total points updated from 36 to 50. Added iOS Shortcut platform constraint note to S16.4. v7.0 — Added Sprint 16 ("Smart Logging: iOS": F26 Apple Pay Shortcuts Auto-Capture) and Sprint 17 ("Smart Logging: Android": F27 Android Notification Auto-Capture). Addresses the #1 product risk (manual logging fatigue) with platform-native auto-capture. See `docs/NOTIFICATION_CAPTURE_FEASIBILITY.md` for full technical analysis. v6.0 — Added Sprint 13 ("Crowdsourced Accuracy": F24 Community Rate Change Submissions), Sprint 14 ("Detection Foundation": F25 Part 1 — scraper + hashing), and Sprint 15 ("Always Up to Date": F25 Part 2 — AI classification + pipeline health). Closes the Layer 1 detection gap with $0/month infrastructure. v5.0 — Added Sprint 11 ("Every Card": F22 Card Coverage Expansion 20→29) and Sprint 12 ("Every Change": F23 Rate Change Monitoring & Alerts). v4.0 — Added Sprint 9–10 (Miles Ecosystem). v3.0 — Added Sprint 7–8 (Miles Portfolio). v2.0 — Compressed to 2-week plan. v2.1 — Restored full 20-card coverage.

---

## Sprint Overview

| Field | Value |
|-------|-------|
| **Total Timeline** | **2 weeks (10 working days)** |
| **Structure** | 4 overlapping phases across a single 2-week sprint |
| **Sprint Goal** | Ship functional MaxiMile MVP (F1–F5) to beta users in 14 days |
| **Team Capacity** | Designer, Software Engineer, Data Engineer, Developer, Tester |
| **Methodology** | Kanban-style continuous flow within a single sprint |
| **North Star Metric** | Monthly Active Recommendations Used (MARU) — target 10,000 in 6 months |

### What Changed from v1.0 (8-Week Plan)

| Aspect | v1.0 (8 weeks) | v2.0 (2 weeks) | Rationale |
|--------|----------------|-----------------|-----------|
| Card coverage | Top 20 SG miles cards | **Top 20 cards** (batched: 10 by D3 + 10 by D7) | Full coverage; batched to unblock developers early |
| Platform decision | Open (React Native vs Flutter) | **React Native — decided** | Eliminates Day 1 blocker |
| Backend | Open (Node vs Python) | **Supabase (Postgres + Auth + API)** | BaaS eliminates boilerplate; auth out-of-box |
| S2.2 "Why this card?" | Sprint 2 | **Deferred to v1.1** | Nice-to-have; core recommendation works without it |
| Back-dated transactions | Sprint 2 | **Deferred to v1.1** | Edge case; manual entry covers 95% of use |
| Settings screen | Sprint 3 | **Deferred to v1.1** | Not needed for beta |
| Accessibility audit | Sprint 3 | **Deferred to v1.1** | Important but not launch-blocking for beta |
| App Store submission | Sprint 4 | **TestFlight / internal beta only** | Skip review queue; distribute via TestFlight + APK |
| Onboarding | Full flow with combos | **Simplified: add cards → done** | Minimum viable onboarding |
| UI polish pass | Sprint 3 | **Functional UI, not polished** | Ship fast, polish in v1.1 |

### Scope: What Ships in 2 Weeks

**IN (launch-critical):**
- S1.1: Add cards to portfolio (top 20 cards)
- S1.2: View/manage card portfolio
- S1.3: Card Rules Database (top 20 cards, 7 categories)
- S2.1: Category-based recommendation engine
- S3.1: Transaction logging (<10 sec)
- S3.2: Cap status view with progress bars
- User authentication (signup/login)
- Basic navigation (My Cards, Transactions, Recommend, Log, Miles)

**OUT (deferred to v1.1):**
- S2.2: "Why this card?" explanation
- S3.1 AC5: Back-dated transactions
- S3.3: Cap approach alerts (push notifications)
- S4.1: Miles dashboard
- Settings screen
- Accessibility audit
- App Store / Play Store submission (TestFlight beta instead)

---

## Pre-Decisions (Eliminates Sprint 0 Blockers)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Platform** | React Native (Expo) | Fastest cross-platform; Expo simplifies builds; large ecosystem |
| **Backend** | Supabase | Postgres DB + Auth + REST API + Realtime — all-in-one; free tier sufficient for beta |
| **Database** | PostgreSQL (via Supabase) | Relational data fits perfectly; JSONB for flexible rule conditions |
| **Auth** | Supabase Auth | Email/password + Google; built-in; no custom auth code needed |
| **Hosting** | Supabase (DB/API) + Expo EAS (mobile builds) | Zero DevOps overhead for MVP |
| **API Style** | Supabase auto-generated REST + custom RPC for recommendation engine | Minimal API code needed |
| **Card Coverage** | 29 miles cards (batched) | Batch 1 (D1–3): DBS Altitude, Citi PremierMiles, UOB PRVI Miles, OCBC 90°N, KrisFlyer UOB, HSBC Revolution, Amex KrisFlyer Ascend, BOC Elite Miles, SC Visa Infinite, DBS Woman's World. Batch 2 (D4–7): UOB Lady's Card, OCBC Titanium Rewards, HSBC TravelOne, Amex KrisFlyer CC, SC X Card, Maybank Horizon Visa, Maybank FC Barcelona, Citi Rewards, POSB Everyday, UOB Preferred Platinum. Batch 3 (Sprint 22+): Maybank World MC, UOB Visa Signature. Batch 4 (Sprint 23-24): DBS Vantage, UOB Lady's Solitaire, OCBC Voyage, SC Journey, SC Beyond, HSBC Premier MC, Maybank XL Rewards |
| **Categories** | 7 categories | Dining, Transport, Online Shopping, Groceries, Petrol, Travel/Hotels, General |

---

## Team Composition & Parallel Tracks

All 5 agents work **simultaneously across 4 phases** with staggered starts:

| Role | Track | Days 1–2 | Days 3–5 | Days 6–8 | Days 9–10 |
|------|-------|----------|----------|----------|-----------|
| **Designer** | UI/UX | Wireframes (all screens) | Support UI build | Cap status visuals | Final UI cleanup |
| **Software Engineer** | Architecture | Schema + API design + Rec algorithm spec | Recommendation engine implementation | Integration | Code review + security |
| **Data Engineer** | Data | Schema DDL + begin data sourcing (batch 1: 10 cards) | Populate batch 2 (10 cards) + validation | Data accuracy check | Bug support |
| **Developer** | Frontend + Backend | Repo setup + Supabase config + Auth | Card Portfolio UI + API | Tx Logging + Cap Tracker + Nav | Bug fixes |
| **Tester** | Quality | Test plan + test data setup | Unit tests (API, data) | Integration tests + E2E | Bug verification + beta prep |

---

## Epics (Unchanged)

| Epic ID | Epic Name | Features | Priority | Phase Target |
|---------|-----------|----------|----------|-------------|
| **E1** | Card Portfolio Management | F1, F5 | P0 (MVP) | Phase 1–2 |
| **E2** | Smart Card Recommendation | F2 | P0 (MVP) | Phase 2–3 |
| **E3** | Spending & Cap Tracking | F3, F4 | P0 (MVP) | Phase 3 |
| **E4** | Miles Performance Dashboard | F7 | P1 | Post-MVP |
| **E5** | MCC Data Contribution & Validation | F10 | P1 | Post-MVP |
| **E6** | Speed & Convenience | F8, F9 | P1 | Post-MVP |
| **E7** | Smart Portfolio | F11, F12 | P2 | Future |
| **E8** | Miles Portfolio & Goal Tracking | F13, F14, F15, F16 | P1 | Sprint 7–8 (Shipped) |
| **E9** | Miles Ecosystem — Two-Layer Architecture | F18, F19, F20, F21 | P1 | Sprint 9–10 |
| **E10** | Card Coverage Expansion & Rate Monitoring | F22, F23 | P1 | Sprint 11–12 (Shipped) |
| **E11** | Rate Change Detection Pipeline | F24, F25 | P1 | Sprint 13–15 |
| **E12** | Transaction Auto-Capture | F26, F27 | P1 | Sprint 16–17 |
| **E13** | Demo Mode | F28 | P1 | Sprint 18 (Shipped) |
| **E14** | Push Notifications for Rate Alerts | New Feature | P1 | Sprint 19–22 |
| **E15** | Earn Rate Data Integrity | F34, F35 | P0 | Sprint 25–27 |
| **E16** | Bills Subcategory Intelligence | F36 | P1 | Sprint 27–28 |
| **E17** | Earn Rate Accuracy (March 2026 Refresh) | F36 | P0 | Sprint 29 |
| **E18** | DBS yuu Card Integration | F37 | P0 | Sprint 30 |
| **E19** | SC Smart Card Bonus Tiers | F38 | P0 | Sprint 31 |
| **E20** | Navigation Restructure | F41 | P1 | Sprint 33 |
| **E21** | Merchant-Driven Discovery | F42 | P1 | Sprint 34 |
| **E22** | Transaction Data Integrity | F43 | P1 | Sprint 35 |

**Critical Path**: F5 (Rules DB) → F1 (Card Setup) → F2 (Recommendation) → F4 (Transaction Log) → F3 (Cap Tracker)

---

## User Stories — 2-Week Scope

*Acceptance criteria unchanged from `docs/EPICS_AND_USER_STORIES.md` unless noted below.*

| Story | Feature | Size | Phase | Assigned To | Scope Adjustment |
|-------|---------|------|-------|-------------|-----------------|
| **S1.3** | F5: Card Rules DB | **L** | Phase 1–3 | Data Engineer + SE | All 20 cards (batch 1: 10 by D3, batch 2: 10 by D7) |
| **S1.1** | F1: Add Cards | **M** | Phase 2 | Developer + Designer | Simplified onboarding (no combos) |
| **S1.2** | F1: Manage Portfolio | **S** | Phase 2 | Developer | View + remove only (no inline edit) |
| **S2.1** | F2: Recommendation | **L** | Phase 2–3 | SE + Developer | Core algorithm; no "Why this card?" |
| **S3.1** | F4: Transaction Logging | **M** | Phase 3 | Developer + Designer | No back-dated transactions in v1 |
| **S3.2** | F3: Cap Tracker | **M** | Phase 3 | Developer + Designer | Progress bars + color coding |
| ~~S2.2~~ | ~~"Why this card?"~~ | — | ~~Deferred~~ | — | *Moved to v1.1* |

---

## Phase Breakdown (10 Working Days)

### Phase 1: Foundation (Days 1–2)

**Goal**: All agents unblocked. Schema live, wireframes done, repo ready, data sourcing started.

| Task ID | Task | Story | Owner | Day | Dependencies |
|---------|------|-------|-------|-----|--------------|
| T1.01 | Design card rules schema (cards, earn_rules, caps, exclusions, categories) | S1.3 | Data Engineer | D1 | None |
| T1.02 | Design user data model (users, user_cards, transactions, spending_state) | S3.1, S3.2 | Data Engineer | D1 | None |
| T1.03 | Define API contracts (card CRUD, recommendation RPC, transactions, caps) | S2.1, S3.1 | Software Engineer | D1 | None |
| T1.04 | Define recommendation algorithm spec (pseudocode + edge cases) | S2.1 | Software Engineer | D1 | None |
| T1.05 | Set up Expo React Native project + Supabase instance + CI | — | Developer | D1 | None |
| T1.06 | Wireframe all MVP screens (card list, add card, portfolio, recommend, log tx, cap status, nav) | All | Designer | D1–D2 | None |
| T1.07 | Create Supabase tables from schema (run DDL migrations) | S1.3 | Data Engineer | D2 | T1.01, T1.02 |
| T1.08 | Source card rules data for batch 1 (10 cards: DBS Altitude, Citi PremierMiles, UOB PRVI, OCBC 90°N, KrisFlyer UOB, HSBC Revolution, Amex KrisFlyer Ascend, BOC Elite Miles, SC Visa Infinite, DBS Woman's World) | S1.3 | Data Engineer | D1–D2 | T1.01 |
| T1.09 | Define spend category taxonomy + MCC mappings (7 categories) | S2.1 | Data Engineer | D1 | None |
| T1.10 | Implement Supabase Auth (email + Google sign-in) | — | Developer | D2 | T1.05 |
| T1.11 | Write test plan + prepare test data (mock cards, mock transactions) | All | Tester | D1–D2 | T1.01 |
| T1.12 | Set up Supabase Row Level Security policies (user data isolation) | — | Software Engineer | D2 | T1.07 |

**Phase 1 Exit Criteria (End of Day 2)**:
- [ ] Supabase instance live with all tables created
- [ ] Auth working (signup, login, session management)
- [ ] Wireframes complete for all MVP screens
- [ ] API contracts documented
- [ ] Card data sourcing in progress (batch 1: ≥5 of 10 cards sourced)
- [ ] Test plan and mock data ready
- [ ] Recommendation algorithm spec reviewed

---

### Phase 2: Core Build (Days 3–5)

**Goal**: Card Rules DB populated. Card Portfolio functional. Recommendation engine working.

| Task ID | Task | Story | Owner | Day | Dependencies |
|---------|------|-------|-------|-----|--------------|
| T2.01 | Seed card rules database with batch 1 (10 cards — earn rates, caps, exclusions, categories) | S1.3 | Data Engineer | D3 | T1.07, T1.08 |
| T2.02 | Validate batch 1: all 10 cards complete, no null fields, cross-check 3 cards vs bank T&Cs | S1.3 | Data Engineer | D3–D4 | T2.01 |
| T2.03 | Build card browse/search screen (list all supported cards with bank + name) | S1.1 | Developer | D3 | T1.06, T2.01 |
| T2.04 | Build "Add Card to Portfolio" flow (select card → add → auto-populate rules) | S1.1 | Developer | D3–D4 | T2.03 |
| T2.05 | Build portfolio view (list my cards, summary earn rates, cap status) | S1.2 | Developer | D4 | T2.04 |
| T2.06 | Build card detail view (full earn rate breakdown by category, caps) | S1.2 | Developer | D4 | T2.05 |
| T2.07 | Build card removal from portfolio (swipe to remove) | S1.2 | Developer | D4 | T2.05 |
| T2.08 | Implement recommendation engine as Supabase RPC function | S2.1 | Software Engineer | D3–D4 | T1.04, T2.01 |
| T2.09 | Build category selection UI (7 category tiles/buttons) | S2.1 | Developer | D4–D5 | T1.06 |
| T2.10 | Build recommendation results UI (top card + alternatives with mpd + remaining cap) | S2.1 | Developer | D5 | T2.08, T2.09 |
| T2.11 | Integration: recommendation screen calls engine, displays results | S2.1 | Developer | D5 | T2.08, T2.10 |
| T2.12 | Write unit tests for card rules API (query, CRUD) | S1.3 | Tester | D4 | T2.01 |
| T2.13 | Write unit tests for recommendation engine (normal, all-caps-hit, single-card, no-cards) | S2.1 | Tester | D5 | T2.08 |
| T2.14 | Support UI implementation: component specs, asset handoff | All | Designer | D3–D5 | T1.06 |

**Phase 2 Exit Criteria (End of Day 5)**:
- [ ] Batch 1 (10 cards) seeded and validated in database
- [ ] Users can add/remove cards from portfolio
- [ ] Category selection → recommendation results working end-to-end
- [ ] Recommendation accounts for remaining caps (using default $0 spent for new users)
- [ ] Unit tests passing for card rules API and recommendation engine

---

### Phase 3: Features Complete (Days 6–8)

**Goal**: Transaction logging, cap tracking, and cap-aware recommendation integration complete.

| Task ID | Task | Story | Owner | Day | Dependencies |
|---------|------|-------|-------|-----|--------------|
| T3.01 | Build transaction logging form (amount, category pre-fill, card pre-fill) | S3.1 | Developer | D6 | T1.06, T2.04 |
| T3.02 | Implement smart defaults (pre-fill category by time-of-day, card from last recommendation) | S3.1 | Developer | D6 | T3.01 |
| T3.03 | Build transaction storage (insert to Supabase + update spending_state) | S3.1 | Developer | D6–D7 | T3.01 |
| T3.04 | Build transaction history view (list of logged transactions) | S3.1 | Developer | D7 | T3.03 |
| T3.05 | Implement cap deduction logic (transaction logged → spending_state updates → remaining_cap decreases) | S3.1, S3.2 | Software Engineer | D6–D7 | T3.03, T1.07 |
| T3.06 | Build cap status dashboard (progress bars per card per category) | S3.2 | Developer + Designer | D7 | T3.05 |
| T3.07 | Implement color-coded cap warnings (green <80%, amber 80–99%, red 100%) | S3.2 | Developer | D7 | T3.06 |
| T3.08 | Implement monthly cap reset logic (auto-reset spending_state on 1st of month) | S3.2 | Software Engineer | D7 | T3.05 |
| T3.09 | Integration: recommendation engine reads live spending_state for cap-aware results | S2.1, S3.2 | Software Engineer | D7–D8 | T3.05, T2.08 |
| T3.10 | Build app navigation (tab bar: Recommend, My Cards, Cap Status, Log, Profile) | — | Developer + Designer | D7–D8 | T2.10, T3.06 |
| T3.11 | Write integration tests: log transaction → cap updates → recommendation changes | S2.1, S3.1 | Tester | D8 | T3.09 |
| T3.12 | E2E test: onboard → add cards → recommend → log → cap update → re-recommend | All | Tester | D8 | T3.09, T3.10 |
| T3.13 | Source + seed batch 2 (10 cards: UOB Lady's, OCBC Titanium Rewards, HSBC TravelOne, Amex KrisFlyer CC, SC X Card, Maybank Horizon, Maybank FC Barcelona, Citi Rewards, POSB Everyday, UOB Preferred Platinum) | S1.3 | Data Engineer | D6–D7 | T1.07, T1.08 |
| T3.14 | Validate batch 2: all 10 cards complete, no nulls, cross-check 3 cards vs bank T&Cs | S1.3 | Data Engineer | D7–D8 | T3.13 |
| T3.15 | Data accuracy spot-check: verify 5 sample cards (across both batches) vs bank T&Cs | S1.3 | Data Engineer | D8 | T2.02, T3.14 |

**Phase 3 Exit Criteria (End of Day 8)**:
- [ ] Transaction logging works in <10 seconds
- [ ] Logging a transaction updates cap tracking immediately
- [ ] Cap status dashboard shows progress bars with color coding
- [ ] Recommendation changes dynamically when cap is exhausted (cap-aware)
- [ ] Monthly cap reset logic implemented
- [ ] App navigation complete (all screens accessible)
- [ ] E2E flow tested: onboard → recommend → log → cap update → re-recommend
- [ ] All 20 cards seeded and validated (batch 1 by D3, batch 2 by D7)
- [ ] Sample accuracy spot-check passed (5 cards across both batches)

---

### Phase 4: Stabilize & Ship (Days 9–10)

**Goal**: Fix bugs, performance-tune, deploy to beta testers.

| Task ID | Task | Story | Owner | Day | Dependencies |
|---------|------|-------|-------|-----|--------------|
| T4.01 | Bug fix: address all P0 bugs from Phase 3 testing | All | Developer | D9 | T3.12 |
| T4.02 | Bug fix: address any data accuracy issues | S1.3 | Data Engineer | D9 | T3.13 |
| T4.03 | Performance check: recommendation <1 sec, logging flow <10 sec, app startup <3 sec | All | Tester | D9 | T4.01 |
| T4.04 | Error handling pass: no crashes on empty state, network errors, edge cases | All | Developer | D9 | T4.01 |
| T4.05 | Security review: RLS policies, auth flows, data isolation between users | — | Software Engineer | D9 | T4.01 |
| T4.06 | Build TestFlight (iOS) + APK (Android) via Expo EAS | — | Developer | D10 | T4.01 |
| T4.07 | Analytics instrumentation (MARU, MAU, key events: card_added, recommendation_used, transaction_logged) | — | Developer | D9–D10 | T4.01 |
| T4.08 | In-app feedback form (simple "Report issue" / "Suggest feature" form) | — | Developer | D10 | T4.06 |
| T4.09 | Final UI consistency pass (spacing, colors, fonts — functional, not polished) | All | Designer | D9–D10 | T4.01 |
| T4.10 | Beta distribution: share TestFlight link + APK with 5–10 miles community testers | — | PM | D10 | T4.06 |

**Phase 4 Exit Criteria (End of Day 10)**:
- [ ] All P0 bugs fixed; no crash-level issues remaining
- [ ] Performance targets met
- [ ] Security review passed (RLS, auth, data isolation)
- [ ] TestFlight build + APK distributed to beta group
- [ ] Analytics tracking verified
- [ ] Feedback mechanism in place

---

## Sprint Backlog (Prioritized — 2-Week Plan)

| Priority | Item | Type | Size | Phase | Dependencies | Assigned |
|----------|------|------|------|-------|--------------|----------|
| 1 | S1.3: Card Rules Schema + Data (20 cards, batched) | Story | L | P1–P3 | None | Data Engineer |
| 2 | T1.03–T1.04: API + Algorithm Spec | Task | M | P1 | None | Software Engineer |
| 3 | T1.05–T1.10: Repo + Supabase + Auth | Task | M | P1 | None | Developer |
| 4 | T1.06: All MVP Wireframes | Task | M | P1 | None | Designer |
| 5 | S1.1: Add Cards to Portfolio | Story | M | P2 | S1.3 | Developer |
| 6 | S1.2: Manage Portfolio | Story | S | P2 | S1.1 | Developer |
| 7 | S2.1: Recommendation Engine | Story | L | P2–P3 | S1.3 | SE + Developer |
| 8 | S3.1: Transaction Logging | Story | M | P3 | S1.1 | Developer |
| 9 | S3.2: Cap Status Dashboard | Story | M | P3 | S3.1 | Developer |
| 10 | T3.09: Cap-Aware Recommendation Integration | Task | M | P3 | S2.1, S3.1 | Software Engineer |
| 11 | T3.12: E2E Testing | Task | M | P3 | All stories | Tester |
| 12 | T4.01–T4.06: Stabilize + Ship | Task | L | P4 | P3 complete | All |

---

## Dependencies Map (2-Week)

```
DAY 1          DAY 2          DAY 3          DAY 4          DAY 5          DAY 6          DAY 7          DAY 8          DAY 9          DAY 10
─────          ─────          ─────          ─────          ─────          ─────          ─────          ─────          ─────          ──────
PHASE 1: FOUNDATION            PHASE 2: CORE BUILD                         PHASE 3: FEATURES COMPLETE                  PHASE 4: SHIP
───────────────────            ────────────────────                         ───────────────────────────                  ─────────────

T1.01 Schema ─────→ T1.07 DDL ─→ T2.01 Seed B1 (10) ─→ T2.02 Validate B1 ──→ T3.13 Seed B2 (10) ─→ T3.14 Validate B2 ─→ T3.15 Accuracy ─→ T4.02 Data Fix
T1.08 Data Source ──────────────┘                                                                                          │
                                                                                                                           ▼
T1.03 API Spec ───────────────────→ T2.08 Rec Engine ───────────────────→ T3.05 Cap Logic ──→ T3.09 Cap+Rec ──────→ T4.05 Security
T1.04 Algo Spec ──────────────────┘                                      T3.08 Monthly Reset    │                       │
                                                                                                 ▼                       ▼
T1.05 Repo Setup ──→ T1.10 Auth ──→ T2.03 Card Browse ─→ T2.04 Add Card ─→ T2.09 Cat UI ──→ T3.01 Tx Log ──→ T3.03 Tx Store ──→ T4.01 Bug Fix
                                     T2.05 Portfolio ──→ T2.06 Detail       T2.10 Rec UI       T3.02 Defaults    T3.04 History       T4.04 Errors
                                     T2.07 Remove                           T2.11 Integration   T3.06 Cap Dash    T3.10 Nav           T4.06 Build
                                                                                                 T3.07 Colors                          T4.07 Analytics
                                                                                                                                       T4.08 Feedback
T1.06 Wireframes ─────────────────→ T2.14 UI Support ──────────────────────────────────────→ T4.09 UI Pass        T4.10 Beta Ship

T1.11 Test Plan ──────────────────→ T2.12 Unit Tests ──→ T2.13 Rec Tests ─→ T3.11 Int Tests ─→ T3.12 E2E ───→ T4.03 Perf Check
```

---

## Risks & Blockers (2-Week Specific)

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R1 | Card rules data sourcing for 20 cards takes longer than planned | **Medium-High** | **Critical** | Batch approach: batch 1 (10 cards) sourced D1–D2, seeded D3; batch 2 (10 cards) sourced D4–D5, seeded D6–D7. If behind, prioritize batch 1 accuracy — batch 2 can slip to D8 as fallback |
| R2 | Supabase RPC performance too slow for recommendation engine | **Low** | **High** | Benchmark on Day 4; fall back to Edge Function if RPC is >500ms |
| R3 | React Native / Expo build issues block deployment | **Medium** | **Medium** | Use Expo Go for development; only build native binaries on Day 10 |
| R4 | Transaction logging UX doesn't hit <10 sec target | **Medium** | **High** | Designer prioritizes this flow in Day 1 wireframes; developer prototype on Day 6 AM |
| R5 | Integration bugs between cap tracking and recommendation engine | **Medium** | **High** | Software Engineer owns both sides; integration test on Day 8 |
| R6 | Scope creep from "just one more thing" requests | **High** | **Medium** | Strict scope freeze after Day 2. All new items go to v1.1 backlog. Zero exceptions. |

---

## Definition of Done (DoD) — 2-Week MVP

A story/task is "Done" when:
- [ ] Feature works as described in acceptance criteria
- [ ] Core unit tests passing (not exhaustive — focus on happy path + critical edge cases)
- [ ] No crash-level bugs
- [ ] Code committed to main branch
- [ ] Works on both iOS (Expo Go / TestFlight) and Android (Expo Go / APK)

**Explicitly NOT required for 2-week MVP** (deferred to v1.1):
- Exhaustive edge case tests
- Accessibility audit
- Performance optimization beyond targets
- UI polish / pixel-perfect design
- Documentation beyond inline code comments

---

## Ceremonies (Lightweight for 2-Week Sprint)

| Ceremony | Cadence | Format | Duration |
|----------|---------|--------|----------|
| **Kickoff** | Day 1 AM | All agents sync: confirm scope, assignments, blockers | 15 min |
| **Daily Standup** | Daily (Days 2–9) | Async: done / doing / blocked | 5 min |
| **Mid-Sprint Check** | Day 5 PM | Sync: are we on track? Any scope cuts needed? | 15 min |
| **Bug Triage** | Day 9 AM | Classify all bugs as P0 (fix) or P1 (defer to v1.1) | 15 min |
| **Ship Review** | Day 10 PM | Demo full flow; go/no-go for beta distribution | 15 min |

---

## Human-in-the-Loop Checkpoints

| Checkpoint | Day | Decision Required |
|------------|-----|-------------------|
| ✅ PRD review and approval | Pre-Day 1 | Confirm problem, scope, and priorities |
| ✅ Tech stack pre-decided | Pre-Day 1 | React Native + Supabase (approved in this plan) |
| ⬜ Wireframe review | Day 2 | Approve core flows before build starts |
| ⬜ Card rules data spot-check | Day 4 | Verify 3 sample cards vs actual bank T&Cs |
| ⬜ Mid-sprint demo | Day 5 | Portfolio + Recommendation working; approve to continue |
| ⬜ Full MVP demo | Day 8 | All features working end-to-end |
| ⬜ Beta go/no-go | Day 10 | Approve TestFlight/APK distribution to beta testers |

---

## Post-2-Week Roadmap

### v1.0.1 — Quick Follows (Week 3)
| Item | Story | Effort |
|------|-------|--------|
| Add cards 21–30 to database (if demand warrants) | S1.3 | 2 days |
| Back-dated transactions | S3.1 AC5 | 0.5 day |
| "Why this card?" explanation | S2.2 | 1 day |
| Settings screen (notification prefs, default category) | — | 1 day |
| UI polish pass | — | 2 days |

### v1.1 — P1 Features (Weeks 4–6)
| Feature | Epic | Stories | Est. Duration |
|---------|------|---------|---------------|
| F6: Cap Approach Alerts | E3 | S3.3 | 1 week |
| F7: Miles Dashboard | E4 | S4.1 | 2 weeks |
| F10: MCC Crowdsource Validation | E5 | S5.1, S5.2, S5.3 | 2 weeks |

### v1.2 — P1 Features (Weeks 7–9)
| Feature | Epic | Stories | Est. Duration |
|---------|------|---------|---------------|
| F8: Quick-Access Widget | E6 | S6.1 | 2 weeks |
| F9: Merchant Search & MCC Lookup | E6 | S6.2 | 2 weeks |

### v2.0 — P2 Features (Weeks 10+)
| Feature | Epic | Stories | Est. Duration |
|---------|------|---------|---------------|
| F11: Portfolio Optimizer | E7 | S7.1 | 3 weeks |
| F12: Promo & Bonus Tracker | E7 | S7.2 | 2 weeks |

*Full story details: `docs/EPICS_AND_USER_STORIES.md`*

---

## Velocity Tracking

| Day | Planned Tasks | Completed | Cumulative | Notes |
|-----|---------------|-----------|------------|-------|
| D1 | T1.01–T1.06, T1.08–T1.09, T1.11 | — | — | |
| D2 | T1.06 (cont), T1.07, T1.10, T1.12 | — | — | |
| D3 | T2.01, T2.03, T2.08, T2.14 | — | — | |
| D4 | T2.02, T2.04–T2.07, T2.08 (cont), T2.12 | — | — | |
| D5 | T2.09–T2.11, T2.13 | — | — | **Mid-sprint check** |
| D6 | T3.01–T3.02, T3.05 | — | — | |
| D7 | T3.03–T3.04, T3.06–T3.08, T3.10 | — | — | |
| D8 | T3.09, T3.11–T3.13 | — | — | **Full MVP demo** |
| D9 | T4.01–T4.05, T4.07, T4.09 | — | — | **Bug triage** |
| D10 | T4.06, T4.08, T4.10 | — | — | **Ship review** |

---

## Appendix: Open Items

| Item | Owner | Due | Status |
|------|-------|-----|--------|
| Verify Supabase free tier limits are sufficient for beta (500 MB DB, 50K API requests/month) | Software Engineer | Day 1 | **Open** |
| Legal position on aggregating bank T&Cs | PM | Pre-launch | **Open** |
| Partnership model with MileLion/Suitesmile | PM | Post-beta | **Open** |
| App Store / Play Store submission (post-beta) | Developer | Week 3 | **Open** |

---

## Sprint 7: "Miles Portfolio MVP" (F13 + F14)

**Sprint Duration**: 2 weeks (10 working days)
**Sprint Goal**: Users can see auto-calculated miles per loyalty program and enter manual balances, giving them a unified view of their miles portfolio from day one.
**PRD Features**: F13 (Miles Portfolio Dashboard) + F14 (Manual Miles Balance Entry)
**Phase**: v1.2 — "See Your Miles Grow"
**Predecessor**: Sprints 1–6 (MVP + v1.1 must be shipped; card rules DB, transaction logging, and earn_rules data are prerequisites)

---

### Sprint 7 — Definition of Ready (DoR) Checklist

Before any story enters the sprint, it must satisfy:

- [ ] User story has clear "As a... I want... So that..." statement
- [ ] Acceptance criteria defined and reviewed by PM + Tech Lead
- [ ] T-shirt size estimated by the team
- [ ] Dependencies identified and resolved (or a plan exists)
- [ ] UI wireframes / design specs available (from Designer)
- [ ] Data model for miles_programs, miles_balances confirmed by Data Engineer
- [ ] Card-to-program mapping data (PRD Section 16 seed table) validated against actual bank programs
- [ ] Existing transaction and earn_rules tables confirmed compatible with auto-calculation query

### Sprint 7 — Definition of Done (DoD) Checklist

A story is "Done" when:

- [ ] Feature works as described in all acceptance criteria
- [ ] Unit tests written and passing (happy path + key edge cases)
- [ ] Integration test confirms data flows end-to-end (migration → API → UI)
- [ ] No P0 or P1 bugs remaining
- [ ] Code committed to main branch and peer-reviewed
- [ ] Works on both iOS (TestFlight) and Android (APK)
- [ ] Pull-to-refresh and empty state behaviors verified
- [ ] Accessibility: minimum contrast ratios met; screen reader labels on key elements
- [ ] Performance: Miles tab loads in <2 seconds with 500+ transactions

---

### Story S7.1: Database Migration — Miles Programs, Balances, and Card Mappings

> **As the** system,
> **I need** new database tables for miles programs, manual balances, and card-to-program mappings,
> **So that** the Miles Portfolio features have a reliable data foundation.

**Priority**: P1 (Must Have for Miles Portfolio)
**T-Shirt Size**: **M** (Medium) — ~3 days
**Feature**: F13 + F14 (data layer)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | The migration runs | `miles_programs` table is created | It contains columns: `id` (PK), `name` (text, unique), `airline` (text, nullable), `program_type` (enum: airline/bank_points/transferable), `icon_url` (text), `created_at` (timestamp) |
| AC2 | The migration runs | `cards` table is updated | A new `miles_program_id` FK column references `miles_programs.id`; all existing top-20 cards are mapped to their correct program |
| AC3 | The migration runs | `miles_balances` table is created | It contains columns: `id` (PK), `user_id` (FK), `miles_program_id` (FK), `manual_balance` (integer, default 0), `updated_at` (timestamp); unique constraint on `(user_id, miles_program_id)` |
| AC4 | Seed data is inserted | I query `miles_programs` | At least 7 programs exist: KrisFlyer, Citi Miles, UNI$ (UOB), OCBC$, 360 Rewards (SC), TreatsPoints (Maybank), DBS Points |
| AC5 | Seed data is inserted | I query `cards` with JOIN to `miles_programs` | Every one of the top-20 cards is mapped to its correct program per the PRD mapping table (e.g., DBS Altitude → KrisFlyer, Citi PremierMiles → Citi Miles) |
| AC6 | RLS policies are applied | A user queries `miles_balances` | They can only read/write their own rows (user_id matches auth.uid) |
| AC7 | The migration is rolled back | Tables are dropped cleanly | No orphaned data or broken FK references remain |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T7.01: Design miles_programs schema + miles_balances schema | Data Engineer | 0.5d | None |
| T7.02: Write Supabase migration DDL (create tables, add FK to cards) | Data Engineer | 0.5d | T7.01 |
| T7.03: Seed miles_programs with 7+ programs (name, airline, icon) | Data Engineer | 0.5d | T7.02 |
| T7.04: Map all 20 cards to miles_program_id (UPDATE cards SET miles_program_id) | Data Engineer | 0.5d | T7.02, T7.03 |
| T7.05: Validate seed data — cross-check card→program mapping vs bank websites | Data Engineer + Tester | 0.5d | T7.04 |
| T7.06: Apply RLS policies on miles_balances | Software Engineer | 0.5d | T7.02 |
| T7.07: Write migration rollback script | Data Engineer | 0.25d | T7.02 |

---

### Story S7.2: Miles Portfolio Dashboard Screen

> **As a** miles-focused professional,
> **I want to** see a "Miles" tab showing my total miles per loyalty program — auto-calculated from my logged transactions,
> **So that** I know what I have earned without checking multiple bank apps.

**Priority**: P1 (Should Have)
**T-Shirt Size**: **L** (Large) — ~4 days
**Feature**: F13 (Miles Portfolio Dashboard)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have logged transactions with cards mapped to KrisFlyer and Citi Miles | I open the Miles tab | I see a hero total showing the sum of all miles across all programs |
| AC2 | I view the Miles tab | I scroll down | I see per-program glassmorphic cards showing: program icon, program name, `manual_balance + auto_earned = display_total` |
| AC3 | Auto-earned miles are calculated | The system queries transactions | It computes `SUM(transaction.amount * earn_rule.earn_rate_mpd)` grouped by `card.miles_program_id` for the current user |
| AC4 | I have not logged any transactions and have no manual balances | I open the Miles tab | I see a friendly empty state: illustration + "Start logging transactions to watch your miles grow" + CTA to log a transaction |
| AC5 | I pull down on the Miles tab | The screen refreshes | Auto-earned miles are recalculated; "Last refreshed" timestamp updates |
| AC6 | A card in my portfolio is mapped to a program I already see | I view the program card | I see "Contributing cards: DBS Altitude, KrisFlyer UOB" listed under the program total |
| AC7 | The Miles tab loads | I observe the loading time | Dashboard renders in <2 seconds, even with 500+ historical transactions |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T7.08: Design Miles tab wireframe (hero total, per-program cards, empty state) | Designer | 1d | S7.1 complete |
| T7.09: Build Supabase RPC function: `get_miles_portfolio(user_id)` — returns per-program breakdown with manual_balance + auto_earned | Software Engineer | 1d | S7.1 complete |
| T7.10: Build Miles tab screen — hero total, program card list, glassmorphic styling | Developer | 1.5d | T7.08, T7.09 |
| T7.11: Implement pull-to-refresh on Miles tab | Developer | 0.25d | T7.10 |
| T7.12: Implement empty state (no transactions, no balances) | Developer + Designer | 0.5d | T7.10 |
| T7.13: Integration test — log transaction → Miles tab updates auto-earned | Tester | 0.5d | T7.10 |
| T7.14: Performance test — 500+ transactions, tab loads <2s | Tester | 0.25d | T7.10 |

---

### Story S7.3: Manual Balance Entry

> **As a** user who already has miles in my loyalty accounts,
> **I want to** set my current miles balance per program (e.g., "28,500 KrisFlyer miles") as a baseline,
> **So that** the app shows my true total — not just the miles I earned since installing the app.

**Priority**: P1 (Should Have)
**T-Shirt Size**: **S** (Small) — ~2 days
**Feature**: F14 (Manual Miles Balance Entry)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I tap a program card on the Miles tab | A bottom sheet opens | I see a numeric input field pre-filled with my current manual balance (or 0 if not set) |
| AC2 | I enter "28500" and tap "Save" | The balance is persisted | The `miles_balances` table is upserted with `manual_balance = 28500` and `updated_at = now()` |
| AC3 | I view the program card after saving | The display total updates | It shows `28,500 (manual) + 2,450 (earned) = 30,950 total` |
| AC4 | I enter a non-numeric value or negative number | I try to save | Validation prevents save; inline error: "Please enter a valid number" |
| AC5 | I saved a balance 3 days ago | I view the program card | I see "Balance last updated 3 days ago" below the total |
| AC6 | I tap "Save" without changing the value | The bottom sheet closes | No unnecessary write is made; `updated_at` remains unchanged |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T7.15: Design manual balance bottom sheet (input field, save button, last updated label) | Designer | 0.5d | T7.08 |
| T7.16: Build balance entry bottom sheet UI | Developer | 0.5d | T7.15 |
| T7.17: Implement upsert API: `upsert_miles_balance(user_id, program_id, amount)` | Software Engineer | 0.5d | S7.1 complete |
| T7.18: Wire bottom sheet to API; update Miles tab on save | Developer | 0.5d | T7.16, T7.17 |
| T7.19: Validation — numeric only, non-negative, max 10,000,000 | Developer | 0.25d | T7.16 |
| T7.20: Unit test — upsert creates row if absent, updates if present | Tester | 0.25d | T7.17 |

---

### Story S7.4: Onboarding Step 2 — Optional Miles Balance Entry

> **As a** new user who just selected my cards,
> **I want to** optionally enter my current miles balances for the programs my cards earn into,
> **So that** the Miles tab shows meaningful data from day one instead of zeros.

**Priority**: P1 (Should Have)
**T-Shirt Size**: **M** (Medium) — ~3 days
**Feature**: F14 (Onboarding integration)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I complete onboarding Step 1 (card selection) and tap "Done" | I see a new Step 2 screen | Title: "Set your current miles balances"; subtitle: "Optional — you can always update these later" |
| AC2 | I selected DBS Altitude and Citi PremierMiles in Step 1 | I view Step 2 | I see KrisFlyer (derived from DBS Altitude) and Citi Miles (derived from Citi PremierMiles) — only programs relevant to my selected cards |
| AC3 | I enter "28500" for KrisFlyer and leave Citi Miles blank | I tap "Save & Continue" | KrisFlyer balance saved as 28,500; Citi Miles defaults to 0; I proceed to the main app |
| AC4 | I don't want to enter balances now | I tap "I'll do this later" skip link | I proceed to the main app; all program balances default to 0; program associations are still created |
| AC5 | The skip link is displayed | I view the screen | The skip link is always visible without scrolling (fixed at bottom or above the CTA) |
| AC6 | I selected 5 cards across 3 programs | I view Step 2 | Only 3 program rows are shown (deduplicated), not 5 |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T7.21: Design onboarding Step 2 screen (program rows with input, skip link, CTA) | Designer | 0.5d | None |
| T7.22: Build onboarding Step 2 screen UI | Developer | 1d | T7.21 |
| T7.23: Implement logic: derive unique programs from selected cards via miles_program_id | Developer | 0.5d | S7.1 complete |
| T7.24: Wire "Save & Continue" to batch-upsert miles_balances for entered values | Developer | 0.5d | T7.17 (reuse upsert API) |
| T7.25: Wire "I'll do this later" skip — create program associations with 0 balance | Developer | 0.25d | T7.23 |
| T7.26: E2E test — full onboarding: select cards → Step 2 → save balances → Miles tab shows data | Tester | 0.5d | T7.22, T7.24 |
| T7.27: E2E test — skip path: select cards → skip Step 2 → Miles tab shows programs with 0 | Tester | 0.25d | T7.25 |

---

### Story S7.5: Tab Navigation Update — Add "Miles" Tab

> **As a** user,
> **I want to** access the Miles Portfolio from a dedicated tab in the bottom navigation,
> **So that** I can check my miles balance as easily as checking recommendations or cap status.

**Priority**: P1 (Should Have)
**T-Shirt Size**: **S** (Small) — ~1 day
**Feature**: F13 (navigation entry point)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I am on any screen in the app | I look at the bottom tab bar | I see 5 tabs: Recommend, My Cards, Cap Status, Log, Miles |
| AC2 | I tap the "Miles" tab | The Miles Portfolio screen loads | I see the Miles Portfolio Dashboard (S7.2) |
| AC3 | The Miles tab icon | I view the tab bar | The icon is a diamond-outline (consistent with miles/rewards metaphor); active state uses brand accent color |
| AC4 | I have unviewed miles changes (e.g., new auto-earned miles since last visit) | I view the tab bar | A subtle badge/dot appears on the Miles tab (stretch goal — can be deferred) |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T7.28: Update tab navigation config — add 5th "Miles" tab with diamond-outline icon | Developer | 0.5d | T7.10 (Miles screen exists) |
| T7.29: Select/design diamond-outline icon (from existing icon library or custom) | Designer | 0.25d | None |
| T7.30: Test 5-tab layout on small screens (iPhone SE, narrow Android devices) | Tester | 0.25d | T7.28 |

---

### Sprint 7 — Dependencies Map

```
                                SPRINT 7 DEPENDENCY FLOW
                                ========================

S7.1 DB Migration ──────────────────────────────────────────────────────────┐
  T7.01 Schema Design                                                       │
    ↓                                                                       │
  T7.02 DDL Migration                                                       │
    ↓              ↓              ↓                                          │
  T7.03 Seed      T7.06 RLS     T7.07 Rollback                             │
  Programs         Policies       Script                                     │
    ↓                                                                       │
  T7.04 Map Cards→Programs                                                  │
    ↓                                                                       │
  T7.05 Validate Seed Data                                                  │
    │                                                                       │
    ▼                                                                       │
S7.2 Miles Dashboard ◄─────────────── (BLOCKED until S7.1 complete) ────────┘
  T7.08 Wireframe ─────→ T7.10 Build Miles Tab ────→ T7.11 Pull-to-Refresh
  T7.09 RPC Function ──┘       │                      T7.12 Empty State
                                │                      T7.13 Integration Test
                                │                      T7.14 Performance Test
                                ▼
S7.3 Manual Balance ◄──── (BLOCKED until S7.2 screen exists)
  T7.15 Bottom Sheet Design ──→ T7.16 Build UI ──→ T7.18 Wire to API
  T7.17 Upsert API ──────────────────────────────┘   T7.19 Validation
                                                       T7.20 Unit Test

S7.4 Onboarding Step 2 ◄── (BLOCKED until S7.1 + T7.17 upsert API)
  T7.21 Design ──→ T7.22 Build UI ──→ T7.24 Save & Continue
  T7.23 Derive Programs ─────────────→ T7.25 Skip Path
                                        T7.26 E2E Test (save)
                                        T7.27 E2E Test (skip)

S7.5 Tab Navigation ◄──── (BLOCKED until T7.10 Miles screen exists)
  T7.29 Icon Design ──→ T7.28 Add Tab ──→ T7.30 Small Screen Test
```

**Critical Path**: S7.1 (migration) → S7.2 (dashboard) → S7.3 (balance entry) → S7.5 (tab)

**Parallel Track**: S7.4 (onboarding) can proceed in parallel with S7.3 once S7.1 and T7.17 are complete.

---

### Sprint 7 — Risks & Mitigations

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R7.1 | Card-to-program mapping data is inaccurate for some cards (e.g., transferable points programs with multiple airline partners) | **Medium** | **High** | Validate all 20 mappings against bank websites before seeding; start with primary program only (e.g., UOB PRVI → KrisFlyer); add transfer partners in v1.3 |
| R7.2 | Auto-earned miles calculation is slow with 500+ transactions (JOIN across transactions, earn_rules, cards) | **Medium** | **Medium** | Pre-compute with Supabase RPC function; add index on `transactions(user_id, card_id)`; cache result per user with 5-min TTL |
| R7.3 | 5-tab bottom navigation feels cluttered on small screens | **Low** | **Medium** | Test on iPhone SE (375px width) during Sprint; fallback: move Miles to a sub-tab under an existing section or use "More" overflow |
| R7.4 | Onboarding Step 2 causes drop-off — users abandon setup when asked for miles balances | **Medium** | **Medium** | Step 2 is fully optional with prominent skip link; track completion rate vs skip rate; if >60% skip, consider removing from onboarding and showing a nudge later |
| R7.5 | Users confused by "manual balance + auto-earned" split — don't understand why the number differs from their bank app | **Medium** | **High** | Clear labeling: show breakdown as "28,500 (your balance) + 2,450 (earned via MaxiMile) = 30,950 estimated total"; add tooltip explaining the calculation |
| R7.6 | Scope creep: team wants to add redemption logging or goals into Sprint 7 | **High** | **Medium** | Strict scope: Sprint 7 is dashboard + balance only. Redemptions and goals are Sprint 8. Zero exceptions. |

---

## Sprint 8: "Engagement Loop" (F15 + F16)

**Sprint Duration**: 2 weeks (10 working days)
**Sprint Goal**: Users can log miles redemptions and set miles goals with projected achievement dates, creating an engagement loop that keeps them motivated to optimize.
**PRD Features**: F15 (Miles Redemption Logging) + F16 (Miles Goal Tracker)
**Phase**: v1.3 — "Engagement Loop"
**Predecessor**: Sprint 7 (Miles Portfolio MVP must be shipped; miles_programs, miles_balances, and Miles tab are prerequisites)

---

### Sprint 8 — Definition of Ready (DoR) Checklist

Before any story enters the sprint, it must satisfy:

- [ ] User story has clear "As a... I want... So that..." statement
- [ ] Acceptance criteria defined and reviewed by PM + Tech Lead
- [ ] T-shirt size estimated by the team
- [ ] Dependencies identified — Sprint 7 fully shipped and verified
- [ ] UI wireframes / design specs available (from Designer)
- [ ] Data model for miles_transactions and miles_goals confirmed by Data Engineer
- [ ] Miles Portfolio Dashboard (Sprint 7) is working end-to-end in production
- [ ] Manual balance entry API (Sprint 7 T7.17) is stable and tested

### Sprint 8 — Definition of Done (DoD) Checklist

A story is "Done" when:

- [ ] Feature works as described in all acceptance criteria
- [ ] Unit tests written and passing (happy path + key edge cases)
- [ ] Integration test confirms data flows end-to-end (migration → API → UI → balance update)
- [ ] No P0 or P1 bugs remaining
- [ ] Code committed to main branch and peer-reviewed
- [ ] Works on both iOS (TestFlight) and Android (APK)
- [ ] Emotional design moments verified (celebration animation on goal achieved, positive framing on redemptions)
- [ ] Accessibility: minimum contrast ratios met; screen reader labels on key elements
- [ ] Performance: all bottom sheets open in <300ms; goal projection calculation <1 second

---

### Story S8.1: Database Migration — Miles Transactions and Miles Goals

> **As the** system,
> **I need** new database tables for miles transactions (redemptions, adjustments) and miles goals,
> **So that** the redemption logging and goal tracking features have a reliable data foundation.

**Priority**: P1 (Must Have for Engagement Loop)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F15 + F16 (data layer)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | The migration runs | `miles_transactions` table is created | It contains columns: `id` (PK), `user_id` (FK), `miles_program_id` (FK), `type` (enum: redeem/transfer_out/transfer_in/adjust), `amount` (integer, positive), `description` (text, nullable), `transaction_date` (date), `created_at` (timestamp) |
| AC2 | The migration runs | `miles_goals` table is created | It contains columns: `id` (PK), `user_id` (FK), `miles_program_id` (FK), `target_miles` (integer), `description` (text — e.g., "Tokyo Business Class"), `created_at` (timestamp), `achieved_at` (timestamp, nullable) |
| AC3 | RLS policies are applied | A user queries `miles_transactions` | They can only read/write their own rows |
| AC4 | RLS policies are applied | A user queries `miles_goals` | They can only read/write their own rows |
| AC5 | A user creates goals | They try to add a 4th goal for the same program | The system rejects it with an error: "Maximum 3 goals per program" |
| AC6 | The migration is rolled back | Tables are dropped cleanly | No orphaned data or broken FK references remain |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T8.01: Design miles_transactions + miles_goals schema | Data Engineer | 0.5d | Sprint 7 shipped |
| T8.02: Write Supabase migration DDL (create tables, constraints, indexes) | Data Engineer | 0.5d | T8.01 |
| T8.03: Apply RLS policies on miles_transactions and miles_goals | Software Engineer | 0.5d | T8.02 |
| T8.04: Add check constraint: max 3 active goals per (user_id, miles_program_id) | Data Engineer | 0.25d | T8.02 |
| T8.05: Write migration rollback script | Data Engineer | 0.25d | T8.02 |

---

### Story S8.2: Redemption Logging

> **As a** user who just redeemed miles for a flight or upgrade,
> **I want to** log the redemption (e.g., "42,000 KrisFlyer for SIN→NRT"),
> **So that** my running miles balance stays accurate and I can celebrate the reward I earned.

**Priority**: P1 (Should Have)
**T-Shirt Size**: **M** (Medium) — ~3 days
**Feature**: F15 (Miles Redemption Logging)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I tap a program card on the Miles tab | I see the program detail / action options | There is a "Log Redemption" action button |
| AC2 | I tap "Log Redemption" | A bottom sheet opens | I see fields: miles amount (numeric input), description (text — e.g., "SIN→NRT Business Class"), date (defaults to today, can change) |
| AC3 | I enter 42,000 miles and a description and tap "Save" | The redemption is recorded | A row is inserted in `miles_transactions` with `type = 'redeem'` and `amount = 42000` |
| AC4 | I save a redemption | The Miles tab updates | The program's display total decreases by 42,000 (i.e., `manual_balance + auto_earned - total_redeemed`) |
| AC5 | I try to redeem more miles than my current balance | I tap "Save" | Validation warning: "This exceeds your current balance of X miles. Save anyway?" (allow override — bank balance may differ) |
| AC6 | I save a redemption | A celebration moment appears | Brief confetti animation + message: "Congrats! You redeemed 42,000 miles" (positive emotional design) |
| AC7 | I view a program's detail screen | I scroll to redemption history | I see a chronological list of my redemptions for that program (date, amount, description) |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T8.06: Design redemption bottom sheet (amount, description, date fields) + celebration animation spec | Designer | 0.5d | S8.1 complete |
| T8.07: Build redemption bottom sheet UI | Developer | 0.5d | T8.06 |
| T8.08: Implement API: `log_miles_redemption(user_id, program_id, amount, description, date)` | Software Engineer | 0.5d | S8.1 complete |
| T8.09: Update `get_miles_portfolio` RPC to deduct total redeemed from display balance | Software Engineer | 0.5d | T8.08 |
| T8.10: Wire bottom sheet to API; update Miles tab on save | Developer | 0.5d | T8.07, T8.08 |
| T8.11: Implement celebration animation (confetti + message) | Developer + Designer | 0.25d | T8.10 |
| T8.12: Build redemption history list on program detail | Developer | 0.5d | T8.08 |
| T8.13: Validation — numeric, positive, overdraft warning | Developer | 0.25d | T8.07 |
| T8.14: Integration test — log redemption → balance decreases → history shows entry | Tester | 0.5d | T8.10, T8.12 |

---

### Story S8.3: Miles Goal Tracker

> **As a** user working toward a miles redemption target,
> **I want to** set a miles goal per program (e.g., "63,000 KrisFlyer for Tokyo Business Class") and see a progress bar with a projected achievement date,
> **So that** I stay motivated to optimize my spending and can plan my travel.

**Priority**: P1 (Should Have)
**T-Shirt Size**: **L** (Large) — ~4 days
**Feature**: F16 (Miles Goal Tracker)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I tap a program card on the Miles tab | I see the program detail / action options | There is a "Set Goal" action button |
| AC2 | I tap "Set Goal" | A bottom sheet opens | I see fields: target miles (numeric), description (text — e.g., "Tokyo Business Class"), and a "Save" button |
| AC3 | I set a goal of 63,000 KrisFlyer miles | I view the program card | I see a progress bar showing `current_balance / target_miles` as a percentage (e.g., "30,950 / 63,000 — 49%") |
| AC4 | I have 3 months of earning history for KrisFlyer | I view the goal | I see a projected achievement date calculated as: `today + ((target - current) / avg_monthly_earning_velocity)` based on a 3-month rolling average |
| AC5 | I have <3 months of data | I view the goal | I see "Not enough data to project — keep logging transactions!" instead of a date |
| AC6 | My current balance meets or exceeds the goal target | I view the goal | The goal is marked "Achieved!" with `achieved_at = now()`; a celebration animation plays; progress bar shows 100% in brand gold |
| AC7 | I already have 3 active goals for KrisFlyer | I try to set a 4th | I see an error: "Maximum 3 goals per program. Delete or complete an existing goal first." |
| AC8 | I want to remove a goal | I swipe or tap delete on a goal | The goal is soft-deleted; progress bar is removed |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T8.15: Design goal bottom sheet (target, description) + progress bar + projected date display | Designer | 0.5d | S8.1 complete |
| T8.16: Build goal-setting bottom sheet UI | Developer | 0.5d | T8.15 |
| T8.17: Implement API: `create_miles_goal(user_id, program_id, target, description)` with max-3 check | Software Engineer | 0.5d | S8.1 complete |
| T8.18: Implement projection calculation: `get_goal_projection(user_id, program_id, goal_id)` — uses 3-month avg velocity from transactions + earn_rules | Software Engineer | 1d | T8.17 |
| T8.19: Build progress bar UI (percentage, projected date, brand gold for achieved) | Developer | 0.5d | T8.15, T8.18 |
| T8.20: Wire goal bottom sheet to API; display progress on program card | Developer | 0.5d | T8.16, T8.17, T8.19 |
| T8.21: Implement goal-achieved detection (balance >= target → set achieved_at, trigger animation) | Software Engineer + Developer | 0.5d | T8.20 |
| T8.22: Implement goal deletion (soft delete or hard delete) | Developer | 0.25d | T8.20 |
| T8.23: Unit test — projection calculation with 1, 2, 3+ months of data; edge case: 0 velocity | Tester | 0.5d | T8.18 |
| T8.24: Integration test — set goal → log transactions → progress updates → goal achieved | Tester | 0.5d | T8.20, T8.21 |

---

### Story S8.4: Program Detail Screen Enhancements

> **As a** user who taps a program card on the Miles tab,
> **I want to** see a comprehensive program detail screen with my goals, redemption history, and contributing cards,
> **So that** I have full visibility into a single loyalty program in one place.

**Priority**: P1 (Should Have)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F15 + F16 (presentation layer)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I tap a program card (e.g., KrisFlyer) on the Miles tab | A program detail screen opens | I see: program name, total balance (manual + earned - redeemed), balance breakdown |
| AC2 | I have active goals for this program | I view the detail screen | I see each goal with its progress bar, percentage, and projected date |
| AC3 | I have logged redemptions for this program | I scroll down | I see a "Redemption History" section with entries sorted by date (newest first) |
| AC4 | I have cards that contribute to this program | I scroll down | I see a "Contributing Cards" section listing each card name with its earn rate summary |
| AC5 | I want to take action | I view the detail screen | I see action buttons: "Update Balance", "Log Redemption", "Set Goal" — each opening the respective bottom sheet |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T8.25: Design program detail screen layout (balance, goals section, redemption history, contributing cards, action buttons) | Designer | 0.5d | T8.06, T8.15 |
| T8.26: Build program detail screen — assemble sections from existing components | Developer | 1d | T8.25, T8.12 (redemption history), T8.19 (progress bar) |
| T8.27: Implement API: `get_program_detail(user_id, program_id)` — returns goals, redemptions, contributing cards | Software Engineer | 0.5d | S8.1, S7.1 |
| T8.28: Wire screen to API; handle loading and empty states per section | Developer | 0.5d | T8.26, T8.27 |
| T8.29: E2E test — full program detail: balance, goals, redemptions, contributing cards all display correctly | Tester | 0.5d | T8.28 |

---

### Sprint 8 — Dependencies Map

```
                                SPRINT 8 DEPENDENCY FLOW
                                ========================

PREREQUISITE: Sprint 7 fully shipped (Miles tab, miles_programs, miles_balances, upsert API)
                                        │
                                        ▼
S8.1 DB Migration ──────────────────────────────────────────────────────────┐
  T8.01 Schema Design                                                       │
    ↓                                                                       │
  T8.02 DDL Migration                                                       │
    ↓              ↓              ↓                                          │
  T8.03 RLS      T8.04 Max-3    T8.05 Rollback                             │
  Policies        Constraint      Script                                     │
    │                                                                       │
    ▼                                                                       │
S8.2 Redemption Logging ◄──── (BLOCKED until S8.1 complete) ───────────────┘
  T8.06 Design ──→ T8.07 Build UI ──→ T8.10 Wire to API ──→ T8.11 Celebration
  T8.08 API ─────────────────────────┘   T8.13 Validation
  T8.09 Update Portfolio RPC              T8.12 History List
                                          T8.14 Integration Test
    │
    ▼
S8.3 Goal Tracker ◄──── (BLOCKED until S8.1 complete; can parallel with S8.2)
  T8.15 Design ──→ T8.16 Build UI ──→ T8.20 Wire to API ──→ T8.21 Goal Achieved
  T8.17 Goal API ─→ T8.18 Projection ┘   T8.22 Deletion
  T8.19 Progress Bar UI ─────────────┘    T8.23 Projection Test
                                           T8.24 Integration Test
    │
    ▼
S8.4 Program Detail ◄──── (BLOCKED until S8.2 + S8.3 components exist)
  T8.25 Design ──→ T8.26 Build Screen ──→ T8.28 Wire to API
  T8.27 Detail API ──────────────────────┘   T8.29 E2E Test
```

**Critical Path**: S8.1 (migration) → S8.2 (redemptions) + S8.3 (goals) in parallel → S8.4 (program detail)

**Parallel Tracks**: S8.2 and S8.3 can be built in parallel by different developers once S8.1 is complete. S8.4 assembles components from both.

---

### Sprint 8 — Risks & Mitigations

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R8.1 | Sprint 7 not fully shipped — Miles tab or balance API has bugs that block Sprint 8 | **Medium** | **Critical** | Allocate Day 1–2 of Sprint 8 as buffer for Sprint 7 bug fixes; S8.1 migration can proceed while fixes happen |
| R8.2 | Projection calculation inaccurate — users with irregular spending get misleading dates | **Medium** | **High** | Use 3-month rolling average (not lifetime); show "Estimated" label clearly; add disclaimer "Based on your recent earning rate"; if <3 months data, don't show projection |
| R8.3 | Celebration animations feel gimmicky or slow down the UI | **Low** | **Low** | Keep animations brief (<2 seconds); make them skippable by tapping; test with 3 users for sentiment |
| R8.4 | Overdraft scenario — user redeems more miles than shown balance (bank has different number) | **Medium** | **Medium** | Allow override with warning; clear disclaimer: "Balances are estimates based on your logged data"; don't hard-block redemption logging |
| R8.5 | Goal projection with 0 velocity (user stopped logging transactions) shows "Infinity" date | **Low** | **Medium** | If avg velocity is 0, display "Start logging transactions to see a projection" instead of a date |
| R8.6 | Program detail screen becomes too long / cluttered with goals + redemptions + cards | **Medium** | **Medium** | Use collapsible sections (accordion pattern); show most recent 5 redemptions with "View all" link; limit visible goals to 3 (max anyway) |

---

### Sprint 7 + 8 Combined Timeline

```
SPRINT 7 (Weeks 1–2)                    SPRINT 8 (Weeks 3–4)
═══════════════════                      ═══════════════════
Day 1–3:  S7.1 DB Migration             Day 1–2:  S8.1 DB Migration + S7 bug fixes
Day 2–3:  S7.5 Tab Nav (icon + config)  Day 2–4:  S8.2 Redemption Logging
Day 3–7:  S7.2 Miles Dashboard          Day 2–5:  S8.3 Goal Tracker (parallel)
Day 6–8:  S7.3 Manual Balance Entry     Day 5–7:  S8.4 Program Detail Screen
Day 5–8:  S7.4 Onboarding Step 2        Day 8–9:  Integration testing + bug fixes
Day 9–10: Integration testing + fixes   Day 10:   Stabilize + ship v1.3 beta
```

---

## Sprint 9: "Miles Ecosystem Foundation" (F21 + F19)

**Sprint Duration**: 2 weeks (10 working days)
**Sprint Goal**: Expand the miles programs database from 7 to ~20 programs covering all 9 Singapore banks and 7 airline FFPs, and build the transfer partner mapping that connects bank points to airline miles with verified conversion rates.
**PRD Features**: F21 (Expanded Miles Programs) + F19 (Transfer Partner Mapping)
**Phase**: v1.4 — "Your Complete Miles Picture"
**Predecessor**: Sprint 8 (Engagement Loop must be shipped; miles_programs, miles_balances, Miles tab are prerequisites)

---

### Sprint 9 — Definition of Ready (DoR) Checklist

Before any story enters the sprint, it must satisfy:

- [ ] User story has clear "As a... I want... So that..." statement
- [ ] Acceptance criteria defined and reviewed by PM + Tech Lead
- [ ] T-shirt size estimated by the team
- [ ] Dependencies identified — Sprint 7–8 fully shipped and verified
- [ ] Transfer rate data researched and documented for all 9 SG banks
- [ ] Data model for transfer_partners confirmed by Data Engineer
- [ ] Existing miles_programs table confirmed compatible (program_type column exists with correct enum values)
- [ ] Card-to-program mappings for new banks (HSBC, Amex, BOC) verified against bank websites

### Sprint 9 — Definition of Done (DoD) Checklist

A story is "Done" when:

- [ ] Feature works as described in all acceptance criteria
- [ ] Unit tests written and passing (happy path + key edge cases)
- [ ] Integration test confirms data flows end-to-end (migration → API → UI compatibility)
- [ ] No P0 or P1 bugs remaining
- [ ] Code committed to main branch and peer-reviewed
- [ ] All seeded data cross-checked against bank websites (transfer rates, fees, minimums)
- [ ] Existing Miles tab continues to work with expanded data (backward compatibility verified)
- [ ] RPC functions return correct results with the expanded program set

---

### Story S9.1: Expand Miles Programs — Seed 3 New Bank Points Programs

> **As the** system,
> **I need** 3 additional bank reward points programs added to the miles_programs table (HSBC Reward Points, Amex Membership Rewards, BOC Points),
> **So that** users with HSBC, Amex, or BOC cards see their points programs in the app.

**Priority**: P1 (Must Have for Miles Ecosystem)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F21 (Expanded Programs — bank points)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | The migration runs | I query `miles_programs` for `program_type = 'bank_points'` | I see 9 programs total: the existing 6 (Citi Miles, UNI$, OCBC$, 360 Rewards, TreatsPoints, DBS Points) + 3 new (HSBC Reward Points, BOC Points) + 1 transferable (Amex Membership Rewards) |
| AC2 | HSBC Reward Points is seeded | I query its details | `name = 'HSBC Reward Points'`, `program_type = 'bank_points'`, `airline = NULL`, `icon_url` set to appropriate icon |
| AC3 | Amex Membership Rewards is seeded | I query its details | `name = 'Amex Membership Rewards'`, `program_type = 'transferable'`, `airline = NULL` |
| AC4 | BOC Points is seeded | I query its details | `name = 'BOC Points'`, `program_type = 'bank_points'`, `airline = NULL` |
| AC5 | The existing Miles tab loads | I view it with the expanded data | No regression — existing program cards still display correctly; new programs appear only when user has relevant cards |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T9.01: Write migration to INSERT 3 new programs into miles_programs | Data Engineer | 0.5d | Sprint 8 shipped |
| T9.02: Map existing HSBC cards (Revolution, TravelOne) to HSBC Reward Points program | Data Engineer | 0.25d | T9.01 |
| T9.03: Map existing Amex cards (KrisFlyer Ascend, KrisFlyer CC) — decision: direct-earn KrisFlyer vs Amex MR | Data Engineer + PM | 0.25d | T9.01 |
| T9.04: Map existing BOC cards (Elite Miles) to BOC Points program | Data Engineer | 0.25d | T9.01 |
| T9.05: Validate all card→program mappings against bank websites | Data Engineer + Tester | 0.5d | T9.02, T9.03, T9.04 |
| T9.06: Regression test — existing Miles tab works with expanded programs | Tester | 0.5d | T9.05 |

---

### Story S9.2: Seed 6 New Airline FFP Programs

> **As a** miles-focused professional,
> **I want** the app to recognize airline frequent flyer programs beyond just KrisFlyer (Asia Miles, BA Avios, Qantas FF, Qatar Privilege Club, Flying Blue, Malaysia Airlines Enrich),
> **So that** I can track all the airline programs I can transfer my bank points into.

**Priority**: P1 (Must Have for Miles Ecosystem)
**T-Shirt Size**: **S** (Small) — ~1 day
**Feature**: F21 (Expanded Programs — airline FFPs)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | The migration runs | I query `miles_programs` for `program_type = 'airline'` | I see 7 airline programs: KrisFlyer (existing) + Asia Miles, British Airways Avios, Qantas Frequent Flyer, Qatar Privilege Club, Flying Blue, Malaysia Airlines Enrich |
| AC2 | Asia Miles is seeded | I query its details | `name = 'Asia Miles'`, `airline = 'Cathay Pacific'`, `program_type = 'airline'`, `icon_url` set |
| AC3 | All 6 new airline programs | I query their details | Each has correct airline name, program_type = 'airline', and icon_url |
| AC4 | The existing KrisFlyer program | I query it after migration | It is unchanged — no duplicate rows, no altered data |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T9.07: Write migration to INSERT 6 new airline FFP programs into miles_programs | Data Engineer | 0.5d | Sprint 8 shipped |
| T9.08: Source and assign icon_url values for each airline program (Ionicons or custom) | Designer | 0.25d | T9.07 |
| T9.09: Validate all 7 airline programs exist with correct data | Tester | 0.25d | T9.07 |

---

### Story S9.3: Transfer Partners Database Table & Seed Data

> **As the** system,
> **I need** a `transfer_partners` table that maps which bank points programs can transfer to which airline FFPs, with conversion rates, fees, and minimums,
> **So that** the app can calculate "potential miles" and show transfer options to users.

**Priority**: P1 (Must Have — blocks F18 and F20)
**T-Shirt Size**: **L** (Large) — ~5 days
**Feature**: F19 (Transfer Partner Mapping)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | The migration runs | `transfer_partners` table is created | It contains columns: `id` (PK), `source_program_id` (FK→miles_programs), `destination_program_id` (FK→miles_programs), `conversion_rate_from` (integer — source points), `conversion_rate_to` (integer — destination miles), `transfer_fee_sgd` (decimal, nullable), `min_transfer_amount` (integer, nullable), `transfer_url` (text, nullable), `last_verified_at` (timestamptz), `created_at` (timestamptz) |
| AC2 | The migration runs | Unique constraint on (source_program_id, destination_program_id) exists | No duplicate source→destination pairings allowed |
| AC3 | Seed data is inserted for DBS Points | I query DBS Points' transfer partners | I see 4 rows: DBS Points→KrisFlyer (5:2, free), DBS Points→Asia Miles (5:2, free), DBS Points→Qantas FF (5:2, free), DBS Points→AirAsia (incomplete — can be null if deferred) |
| AC4 | Seed data is inserted for HSBC Reward Points | I query HSBC's transfer partners | I see at least 7 top airline partner rows with verified conversion rates (HSBC has 16 airline partners — seed top 7 initially, rest as lower priority) |
| AC5 | Seed data is inserted for all 9 bank programs | I count total rows | At minimum 40+ transfer partner rows exist (9 banks × avg ~5 top partners each) |
| AC6 | Each row has last_verified_at | I query any row | The `last_verified_at` date is set to the date the rate was verified against the bank website |
| AC7 | RLS is applied | An authenticated user queries transfer_partners | They can read all rows (reference data — public read) |
| AC8 | I query a specific source program's partners | Using get_transfer_options(program_id) RPC | It returns destination programs with rates, sorted by best rate |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T9.10: Design transfer_partners schema (columns, constraints, indexes) | Data Engineer | 0.5d | None |
| T9.11: Write migration DDL (create table, FK constraints, unique constraint, RLS) | Data Engineer | 0.5d | T9.10 |
| T9.12: Research and document transfer rates for Citibank (10 airline partners) | Data Engineer | 0.5d | None (can parallel) |
| T9.13: Research and document transfer rates for DBS (4 airline partners) | Data Engineer | 0.25d | None |
| T9.14: Research and document transfer rates for UOB (3 airline partners) | Data Engineer | 0.25d | None |
| T9.15: Research and document transfer rates for OCBC (6 airline partners) | Data Engineer | 0.25d | None |
| T9.16: Research and document transfer rates for HSBC (top 7 of 16 airline partners) | Data Engineer | 0.5d | None |
| T9.17: Research and document transfer rates for Standard Chartered (2 airline partners) | Data Engineer | 0.25d | None |
| T9.18: Research and document transfer rates for Maybank (4 airline partners) | Data Engineer | 0.25d | None |
| T9.19: Research and document transfer rates for Amex MR (8 airline partners) | Data Engineer | 0.5d | None |
| T9.20: Research and document transfer rates for BOC (1 airline partner) | Data Engineer | 0.1d | None |
| T9.21: Write seed INSERT statements for all ~50 transfer partner rows | Data Engineer | 1d | T9.11, T9.12–T9.20 |
| T9.22: Build RPC function: `get_transfer_options(p_program_id UUID)` — returns destination programs with rates sorted by value | Software Engineer | 0.5d | T9.11 |
| T9.23: Cross-verify all seeded rates against bank websites (spot-check 15 rows across all 9 banks) | Tester + Data Engineer | 1d | T9.21 |
| T9.24: Write unit tests for get_transfer_options RPC | Tester | 0.5d | T9.22 |

---

### Story S9.4: Update get_miles_portfolio RPC for program_type Filtering

> **As the** system,
> **I need** the `get_miles_portfolio` RPC to support optional `program_type` filtering,
> **So that** the frontend can request only airline programs (for Layer 1) or only bank_points programs (for Layer 2).

**Priority**: P1 (Should Have — enables two-layer UI)
**T-Shirt Size**: **S** (Small) — ~1 day
**Feature**: F19 (supporting infrastructure for F18)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I call `get_miles_portfolio(user_id)` with no type filter | It returns results | All programs returned (backward compatible with existing behavior) |
| AC2 | I call `get_miles_portfolio(user_id, 'airline')` | It returns results | Only programs where `program_type = 'airline'` are returned |
| AC3 | I call `get_miles_portfolio(user_id, 'bank_points')` | It returns results | Only programs where `program_type IN ('bank_points', 'transferable')` are returned |
| AC4 | The existing Miles tab calls the RPC without the filter | Everything works | No regression — existing UI is unaffected |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T9.25: Add optional `p_program_type` parameter to get_miles_portfolio RPC | Software Engineer | 0.5d | S9.1, S9.2 complete |
| T9.26: Unit tests — verify filter returns correct subsets; no-filter returns all | Tester | 0.25d | T9.25 |
| T9.27: Regression test — existing Miles tab works without filter parameter | Tester | 0.25d | T9.25 |

---

### Story S9.5: Build RPC for Potential Miles Calculation

> **As the** system,
> **I need** an RPC function that calculates "potential airline miles" from a user's bank points using transfer partner conversion rates,
> **So that** Layer 1 (My Miles) can show both confirmed miles and potential miles per airline program.

**Priority**: P1 (Should Have — powers Layer 1 display)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F19 (calculation engine for F18)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | User has 50,000 DBS Points and DBS→KrisFlyer rate is 5:2 | I call `get_potential_miles(user_id, 'KrisFlyer_program_id')` | It returns 20,000 potential KrisFlyer miles from DBS Points |
| AC2 | User has DBS Points AND HSBC Rewards, both transferable to KrisFlyer | I call the function | It returns the sum of potential from both sources, broken down by source |
| AC3 | User has no bank points programs | I call the function | It returns 0 potential miles with empty source breakdown |
| AC4 | The function returns results | I inspect the response | Each row includes: source_program_name, source_balance, conversion_rate, potential_miles |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T9.28: Design `get_potential_miles(p_user_id, p_destination_program_id)` RPC | Software Engineer | 0.5d | S9.3 complete (transfer_partners table) |
| T9.29: Implement the RPC — JOIN miles_balances × transfer_partners, calculate conversions | Software Engineer | 1d | T9.28 |
| T9.30: Unit tests — single source, multiple sources, no sources, zero balances | Tester | 0.5d | T9.29 |

---

### Sprint 9 — Dependencies Map

```
                                SPRINT 9 DEPENDENCY FLOW
                                ========================

PREREQUISITE: Sprint 7–8 fully shipped (Miles tab, programs, balances, redemptions, goals)
                                        │
                                        ▼
S9.1 Expand Bank Programs ──────────────────────────────────────────────────┐
  T9.01 INSERT 3 new programs                                               │
    ↓                                                                       │
  T9.02 Map HSBC cards ──→ T9.05 Validate mappings ──→ T9.06 Regression    │
  T9.03 Map Amex cards ──┘                                                  │
  T9.04 Map BOC cards ───┘                                                  │
                                                                            │
S9.2 Seed Airline FFPs ◄──── (can parallel with S9.1) ─────────────────────┤
  T9.07 INSERT 6 airline programs                                           │
  T9.08 Icon design ────→ T9.09 Validate                                   │
                                                                            │
S9.3 Transfer Partners DB ◄──── (BLOCKED until S9.1 + S9.2 complete) ──────┘
  T9.10 Schema Design
    ↓
  T9.11 DDL Migration
    ↓
  T9.12–T9.20 Research rates (ALL 9 BANKS — can parallel)
    ↓
  T9.21 Seed all ~50 rows ──→ T9.23 Cross-verify rates
  T9.22 RPC: get_transfer_options ──→ T9.24 Unit tests

S9.4 Update get_miles_portfolio ◄──── (BLOCKED until S9.1 + S9.2)
  T9.25 Add program_type filter
  T9.26 Unit tests ──→ T9.27 Regression test

S9.5 Potential Miles RPC ◄──── (BLOCKED until S9.3 complete)
  T9.28 RPC design ──→ T9.29 Implement ──→ T9.30 Unit tests
```

**Critical Path**: S9.1 + S9.2 (seed programs) → S9.3 (transfer partners) → S9.5 (potential miles calc)

**Parallel Tracks**:
- S9.1 (bank programs) and S9.2 (airline FFPs) can proceed in parallel from Day 1
- T9.12–T9.20 (rate research for all 9 banks) can all proceed in parallel
- S9.4 (RPC filter) can proceed once S9.1 + S9.2 are done, parallel with S9.3

---

### Sprint 9 — Risks & Mitigations

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R9.1 | Transfer rate data is stale or incorrect — banks may have changed rates since last published | **High** | **High** | Set `last_verified_at` on every seeded row; cross-check against 2 independent sources (bank website + miles blog); flag any discrepancy for PM review; display "Rate verified [date]" in UI |
| R9.2 | HSBC has 16 airline + 4 hotel partners — seeding all 20 is time-consuming | **Medium** | **Medium** | Seed top 7 airline partners only (KrisFlyer, Asia Miles, BA Avios, Qantas, Flying Blue, Etihad, United); defer lower-priority partners; add a "more partners" note in UI |
| R9.3 | Amex MR devaluation (Feb 2026) makes seeded rates incorrect | **High** | **Medium** | Research the POST-devaluation rates specifically; verify against Amex SG website; note devaluation date in last_verified_at |
| R9.4 | OCBC has 3 sub-currencies (OCBC$, VOYAGE Miles, 90N Miles) — unclear if 1 or 3 programs | **Medium** | **Medium** | Decision: keep as 1 program (OCBC$) for Sprint 9. VOYAGE and 90N have the same transfer partners but different rates — can split in a future sprint if user demand warrants |
| R9.5 | Regression in existing Miles tab due to expanded program data | **Low** | **High** | S9.1 AC5 requires regression testing; the Miles tab should only show programs where user has cards; expanded programs are invisible to users without matching cards |
| R9.6 | Scope creep — team wants to build two-layer UI in Sprint 9 | **Medium** | **Medium** | Strict scope: Sprint 9 is data only. UI changes are Sprint 10. Zero exceptions. The existing Miles tab continues to work as-is with more data. |

---

## Sprint 10: "Miles Ecosystem Presentation" (F18 + F20)

**Sprint Duration**: 2 weeks (10 working days)
**Sprint Goal**: Restructure the Miles tab into a two-layer architecture ("My Miles" airline view + "My Points" bank view) with smart transfer nudges, giving users a clear picture of both their confirmed and potential miles.
**PRD Features**: F18 (Two-Layer Miles Architecture) + F20 (Smart Transfer Nudges)
**Phase**: v1.4 — "Your Complete Miles Picture"
**Predecessor**: Sprint 9 (Expanded programs and transfer_partners table must be shipped)

---

### Sprint 10 — Definition of Ready (DoR) Checklist

Before any story enters the sprint, it must satisfy:

- [ ] User story has clear "As a... I want... So that..." statement
- [ ] Acceptance criteria defined and reviewed by PM + Tech Lead
- [ ] T-shirt size estimated by the team
- [ ] Dependencies identified — Sprint 9 fully shipped and verified
- [ ] DRD updated for two-layer architecture (designer has produced wireframes)
- [ ] transfer_partners table is seeded and verified (Sprint 9 complete)
- [ ] get_transfer_options and get_potential_miles RPCs are working
- [ ] get_miles_portfolio RPC supports program_type filtering

### Sprint 10 — Definition of Done (DoD) Checklist

A story is "Done" when:

- [ ] Feature works as described in all acceptance criteria
- [ ] Unit tests written and passing (happy path + key edge cases)
- [ ] Integration test confirms data flows end-to-end (API → UI for both layers)
- [ ] No P0 or P1 bugs remaining
- [ ] Code committed to main branch and peer-reviewed
- [ ] Works on both iOS (TestFlight) and Android (APK)
- [ ] Segmented control switches cleanly between layers with no flicker
- [ ] Accessibility: labels on segmented control, screen reader compatible
- [ ] Performance: both layers load in <2 seconds; segmented control switch <300ms

---

### Story S10.1: DRD Update — Two-Layer Architecture Wireframes

> **As the** design team,
> **I need** updated wireframes and design specifications for the two-layer Miles tab,
> **So that** developers have clear visual specs before building the UI refactor.

**Priority**: P1 (Must Have — blocks all UI stories)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F18 (design foundation)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | The DRD is updated | I review Layer 1 ("My Miles") specs | I see wireframes for: segmented control, airline program cards with confirmed + potential miles, "potential" badge/tag styling, empty state |
| AC2 | The DRD is updated | I review Layer 2 ("My Points") specs | I see wireframes for: bank points cards with transfer partner list, conversion rates, transfer nudge card, "Transfer" CTA styling |
| AC3 | The DRD is updated | I review the segmented control spec | It specifies position (below title), active/inactive styling, animation on switch, and how scroll position resets between layers |
| AC4 | The DRD is updated | I review the transfer nudge card spec | It specifies: card layout, dismiss behavior, frequency cap (max 1 per session per program), and "Transfer" CTA linking to bank URL |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T10.01: Design Layer 1 "My Miles" wireframe (airline cards, confirmed vs potential breakdown) | Designer | 0.5d | Sprint 9 shipped |
| T10.02: Design Layer 2 "My Points" wireframe (bank points cards, transfer options, nudge card) | Designer | 0.5d | Sprint 9 shipped |
| T10.03: Design segmented control component spec (styling, animation, position) | Designer | 0.25d | None |
| T10.04: Design transfer nudge card component spec (layout, dismiss, CTA) | Designer | 0.25d | None |
| T10.05: Update DRD_MILES_PORTFOLIO.md with all new specs | Designer | 0.5d | T10.01–T10.04 |

---

### Story S10.2: Segmented Control — "My Miles" | "My Points" Toggle

> **As a** user on the Miles tab,
> **I want to** switch between "My Miles" (airline programs) and "My Points" (bank reward points) using a segmented control,
> **So that** I can view my rewards from both the destination and source perspectives.

**Priority**: P1 (Must Have)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F18 (Two-Layer Architecture — navigation)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I open the Miles tab | I see the screen | A segmented control appears below the title with two segments: "My Miles" (default active) and "My Points" |
| AC2 | "My Miles" is active | I view the content | I see airline program cards (KrisFlyer, Asia Miles, etc.) — programs the user has balances for or cards that feed into |
| AC3 | I tap "My Points" | The view switches | I see bank reward points cards (DBS Points, HSBC Rewards, etc.) — programs linked to user's cards |
| AC4 | I switch from "My Miles" to "My Points" | I observe the transition | The content switches smoothly (<300ms); scroll position resets to top |
| AC5 | I switch segments | The hero total updates | "My Miles" hero shows total airline miles (confirmed + potential); "My Points" hero shows total bank points |
| AC6 | I am on the Miles tab and navigate away then return | The tab remembers my selection | The previously active segment is restored |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T10.06: Build segmented control component (reusable, styled per DRD spec) | Developer | 0.5d | T10.03 |
| T10.07: Integrate segmented control into Miles tab; manage active state | Developer | 0.5d | T10.06 |
| T10.08: Implement content switching logic — filter programs by type and render appropriate card style | Developer | 0.5d | T10.07, T9.25 (program_type filter) |
| T10.09: Update hero section to show context-appropriate totals per segment | Developer | 0.5d | T10.08 |
| T10.10: Test segment switching — smooth transition, state persistence, scroll reset | Tester | 0.25d | T10.08 |

---

### Story S10.3: Layer 1 — "My Miles" Airline Program Cards with Potential Miles

> **As a** user viewing the "My Miles" layer,
> **I want to** see each airline program with both my confirmed balance and potential miles from transferable bank points,
> **So that** I understand the full redemption power available to me.

**Priority**: P1 (Must Have)
**T-Shirt Size**: **L** (Large) — ~4 days
**Feature**: F18 (Two-Layer Architecture — Layer 1)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have 30,000 KrisFlyer miles (confirmed) and 50,000 DBS Points (transferable at 5:2 = 20,000 potential KrisFlyer) | I view the KrisFlyer card in "My Miles" | I see: "30,000 confirmed + 20,000 potential = 50,000 total" with visual distinction |
| AC2 | "Confirmed" and "Potential" miles are displayed | I look at the card | Confirmed miles are shown in the standard text color; Potential miles are shown with a distinct style (e.g., lighter opacity, dashed border, or "potential" tag) |
| AC3 | I tap on the "potential" line | A tooltip or expansion reveals the breakdown | "20,000 from DBS Points (50,000 × 2/5)" — shows each bank source, its balance, and the conversion math |
| AC4 | I have no bank points transferable to Asia Miles | I view the Asia Miles card | I see only confirmed miles; no "potential" section shown |
| AC5 | I have cards that feed into KrisFlyer but no confirmed KrisFlyer balance | I view "My Miles" | KrisFlyer still appears (because cards feed into it) with "0 confirmed + 20,000 potential = 20,000 total" |
| AC6 | I view an airline program I have zero connection to (no cards, no balance) | I view "My Miles" | That airline program does NOT appear in my list |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T10.11: Design airline program card component with confirmed + potential display | Designer | 0.5d | T10.01 |
| T10.12: Build airline program card component (MilesProgramCard variant for Layer 1) | Developer | 1d | T10.11 |
| T10.13: Integrate get_potential_miles RPC into Layer 1 data fetch | Developer | 0.5d | T9.29 (potential miles RPC), T10.08 |
| T10.14: Build "potential miles breakdown" expansion/tooltip on tap | Developer | 0.5d | T10.12 |
| T10.15: Implement program visibility logic — show only if user has balance OR contributing cards | Developer | 0.5d | T10.13 |
| T10.16: Integration test — confirmed + potential add up correctly; breakdown matches source data | Tester | 0.5d | T10.13, T10.14 |
| T10.17: Visual test — confirm distinct styling between confirmed and potential | Tester + Designer | 0.25d | T10.12 |

---

### Story S10.4: Layer 2 — "My Points" Bank Points Cards with Transfer Options

> **As a** user viewing the "My Points" layer,
> **I want to** see each bank points program with my current balance and a list of airline programs I can transfer to (with conversion rates),
> **So that** I can decide where to transfer my points for maximum value.

**Priority**: P1 (Must Have)
**T-Shirt Size**: **L** (Large) — ~4 days
**Feature**: F18 (Two-Layer Architecture — Layer 2)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have 50,000 DBS Points | I view the DBS Points card in "My Points" | I see: "50,000 DBS Points" with a "Transfer options" section below showing: KrisFlyer (20,000 miles at 5:2), Asia Miles (20,000 miles at 5:2), Qantas FF (20,000 miles at 5:2) |
| AC2 | I view a transfer option | I see the conversion details | Each option shows: airline name, conversion rate (e.g., "5 pts → 2 miles"), resulting miles, transfer fee (if any), and "Transfer" CTA |
| AC3 | I tap the "Transfer" CTA on KrisFlyer | The app opens the bank's transfer URL | It deep-links to the DBS Points transfer page (or opens in external browser) |
| AC4 | HSBC Reward Points has 16 partners but we only seeded 7 | I view HSBC card | I see the 7 seeded partners; a "See all partners" note indicates more exist |
| AC5 | I have multiple bank points programs | I scroll through "My Points" | Each bank has its own card with its own transfer option list; sorted by total points balance (highest first) |
| AC6 | A bank has a transfer fee (e.g., BOC S$30.56) | I view that transfer option | The fee is clearly shown: "Transfer fee: S$30.56" |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T10.18: Design bank points card component with transfer options list | Designer | 0.5d | T10.02 |
| T10.19: Build bank points card component (new variant for Layer 2) | Developer | 1d | T10.18 |
| T10.20: Integrate get_transfer_options RPC into Layer 2 data fetch | Developer | 0.5d | T9.22 (transfer options RPC), T10.08 |
| T10.21: Build transfer option row component (airline name, rate, resulting miles, fee, CTA) | Developer | 0.5d | T10.19 |
| T10.22: Implement "Transfer" CTA — open bank transfer URL in external browser (Linking.openURL) | Developer | 0.25d | T10.21, T9.21 (transfer_url seeded) |
| T10.23: Sort bank cards by total balance descending | Developer | 0.25d | T10.19 |
| T10.24: Integration test — transfer options match seeded data; CTA opens correct URL | Tester | 0.5d | T10.22 |
| T10.25: Visual test — card layout, rate formatting, fee display | Tester + Designer | 0.25d | T10.19 |

---

### Story S10.5: Smart Transfer Nudges

> **As a** user with idle bank points,
> **I want to** see smart suggestions about transferring my points to airline programs,
> **So that** I don't miss transfer opportunities or let points devalue.

**Priority**: P1 (Should Have)
**T-Shirt Size**: **M** (Medium) — ~3 days
**Feature**: F20 (Smart Transfer Nudges)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have 50,000 DBS Points and have not transferred any in the last 30 days | I view "My Points" | I see a nudge card at the top: "Your 50,000 DBS Points could become 20,000 KrisFlyer miles" with a "View options" CTA |
| AC2 | The nudge shows | I tap "Dismiss" (X button) | The nudge is hidden for this session; it may reappear next session |
| AC3 | I have bank points with multiple transfer destinations | The system selects which airline to suggest | It picks the airline program where the user has the highest existing balance or most active goals (preference toward programs user is already engaged with) |
| AC4 | I have 0 bank points across all programs | I view "My Points" | No nudge is shown |
| AC5 | Multiple bank programs have idle points | The system generates nudges | Maximum 1 nudge visible per session (show the highest-value suggestion first) |
| AC6 | The nudge is displayed | I tap "View options" | It scrolls to / highlights the relevant bank program's transfer options |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T10.26: Design nudge card component (message, CTA, dismiss, icon) | Designer | 0.25d | T10.04 |
| T10.27: Implement nudge logic — detect idle points, rank suggestions, select best option | Software Engineer | 1d | S9.3 (transfer_partners), S9.5 (potential miles) |
| T10.28: Build nudge card UI component | Developer | 0.5d | T10.26 |
| T10.29: Integrate nudge into "My Points" layer (positioned above first bank card) | Developer | 0.25d | T10.28, T10.27 |
| T10.30: Implement dismiss behavior (session-scoped; reappears next session) | Developer | 0.25d | T10.29 |
| T10.31: Implement "View options" CTA — scroll to relevant bank card | Developer | 0.25d | T10.29 |
| T10.32: Unit test — nudge logic: idle detection, ranking, no-points case, max 1 per session | Tester | 0.5d | T10.27 |
| T10.33: Integration test — nudge appears correctly; dismiss works; CTA scrolls | Tester | 0.25d | T10.31 |

---

### Story S10.6: E2E Integration Testing & Stabilization

> **As the** QA team,
> **I need** comprehensive end-to-end testing of the entire two-layer Miles ecosystem,
> **So that** we can ship v1.4 with confidence that all features work together.

**Priority**: P1 (Must Have)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F18 + F19 + F20 + F21 (integration)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | A user with cards from 3 different banks (DBS, HSBC, Citi) | They open Miles tab | Layer 1 shows airline programs these banks feed into; Layer 2 shows the 3 bank points programs |
| AC2 | The user switches between layers | Back and forth 5 times | No performance degradation, no stale data, no visual glitches |
| AC3 | The user logs a new transaction | They return to Miles tab | Auto-earned miles update in Layer 1 (airline); bank points balance unaffected (bank points are manually entered, not auto-calculated from transactions) |
| AC4 | The user updates a manual balance for DBS Points | Layer 1 recalculates | KrisFlyer's "potential miles" from DBS Points updates accordingly |
| AC5 | All existing Sprint 7–8 features | Full regression test | Redemption logging, goal tracking, onboarding Step 2, program detail — all still work |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T10.34: E2E test — multi-bank user: add cards → view layers → verify program visibility | Tester | 0.5d | S10.2–S10.4 complete |
| T10.35: E2E test — update balance → potential miles recalculate → Layer 1 reflects change | Tester | 0.5d | S10.3 complete |
| T10.36: Regression test — Sprint 7–8 features (redemption, goals, onboarding) with expanded data | Tester | 0.5d | All Sprint 10 stories complete |
| T10.37: Performance test — both layers load <2s with 20 programs + 50 transfer partners | Tester | 0.25d | All stories complete |
| T10.38: Bug fix buffer — address P0/P1 issues found in testing | Developer + SE | 1d | T10.34–T10.37 |

---

### Sprint 10 — Dependencies Map

```
                                SPRINT 10 DEPENDENCY FLOW
                                =========================

PREREQUISITE: Sprint 9 fully shipped (expanded programs, transfer_partners, RPCs)
                                        │
                                        ▼
S10.1 DRD Update ──────────────────────────────────────────────────────────┐
  T10.01 Layer 1 wireframe                                                  │
  T10.02 Layer 2 wireframe                                                  │
  T10.03 Segmented control spec                                             │
  T10.04 Nudge card spec                                                    │
  T10.05 Update DRD ──→ ALL UI STORIES UNBLOCKED                           │
    │                                                                       │
    ▼                                                                       │
S10.2 Segmented Control ◄──── (BLOCKED until DRD) ─────────────────────────┘
  T10.06 Build component ──→ T10.07 Integrate ──→ T10.08 Content switching
  T10.09 Hero totals ──→ T10.10 Testing               │
                                                        │
    ┌───────────────────────────────────────────────────┘
    │                           │
    ▼                           ▼
S10.3 Layer 1 "My Miles" ◄     S10.4 Layer 2 "My Points" ◄
  T10.11 Card design             T10.18 Card design
  T10.12 Build card              T10.19 Build card
  T10.13 Integrate RPC           T10.20 Integrate RPC
  T10.14 Potential breakdown     T10.21 Transfer options
  T10.15 Visibility logic        T10.22 Transfer CTA
  T10.16 Integration test        T10.23 Sort by balance
  T10.17 Visual test             T10.24 Integration test
                                  T10.25 Visual test
    │                           │
    └─────────┬─────────────────┘
              ▼
S10.5 Smart Nudges ◄──── (BLOCKED until Layer 2 exists + RPCs ready)
  T10.26 Nudge design
  T10.27 Nudge logic ──→ T10.29 Integrate into Layer 2
  T10.28 Build card UI ─┘   T10.30 Dismiss behavior
                              T10.31 "View options" CTA
                              T10.32 Unit tests
                              T10.33 Integration test
              │
              ▼
S10.6 E2E Testing & Stabilization ◄──── (BLOCKED until ALL stories complete)
  T10.34 Multi-bank E2E
  T10.35 Balance→Potential E2E
  T10.36 Sprint 7–8 regression
  T10.37 Performance test
  T10.38 Bug fix buffer
```

**Critical Path**: S10.1 (DRD) → S10.2 (segmented control) → S10.3 + S10.4 (both layers in parallel) → S10.5 (nudges) → S10.6 (E2E)

**Parallel Tracks**: S10.3 (Layer 1) and S10.4 (Layer 2) can be built in parallel by different developers once the segmented control (S10.2) is done. S10.5 (nudges) can start design in parallel but needs Layer 2 rendering for integration.

---

### Sprint 10 — Risks & Mitigations

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R10.1 | "Potential miles" concept confuses users — they think they HAVE those miles when they haven't transferred yet | **High** | **High** | Clear visual distinction (opacity, "potential" tag, dashed border); tooltip on first view explaining "These are points you can transfer, not miles in your account"; user-testable wording |
| R10.2 | Performance degradation — two layers with transfer calculations slow down Miles tab | **Medium** | **High** | Cache potential miles calculation per user (5-min TTL); lazy-load Layer 2 only when user switches to it; benchmark on Day 5 |
| R10.3 | Segmented control doesn't feel native — clunky or unfamiliar UX | **Low** | **Medium** | Use well-tested RN library (e.g., react-native-segmented-control); test on both iOS and Android; follow platform conventions |
| R10.4 | Transfer URLs go stale — banks change their transfer pages | **Medium** | **Low** | Show "Transfer via [bank] app" as fallback if URL fails; add error handling for URL open; monitor click-through rates |
| R10.5 | Smart nudges feel spammy or annoying | **Medium** | **Medium** | Max 1 per session; dismissible; only show when bank points > 10,000 (meaningful amount); user testing for sentiment |
| R10.6 | Sprint 9 not fully shipped — transfer_partners data has gaps | **Medium** | **High** | Allocate Days 1–2 as buffer for Sprint 9 fixes; Layer 2 can gracefully handle missing transfer data ("No transfer options found") |

---

### Sprint 9 + 10 Combined Timeline

```
SPRINT 9 (Weeks 1–2)                        SPRINT 10 (Weeks 3–4)
═══════════════════                          ═══════════════════
Day 1–2:  S9.1 Seed bank programs            Day 1–2:  S10.1 DRD update + S9 bug fixes
          S9.2 Seed airline FFPs              Day 2–3:  S10.2 Segmented control
Day 2–5:  T9.12–T9.20 Rate research (all 9   Day 3–7:  S10.3 Layer 1 "My Miles"
          banks in parallel)                            S10.4 Layer 2 "My Points" (parallel)
Day 3–4:  S9.3 Transfer partners schema       Day 6–8:  S10.5 Smart Transfer Nudges
Day 5–7:  T9.21 Seed all transfer partners    Day 8–9:  S10.6 E2E testing + regression
Day 6–7:  S9.4 Update get_miles_portfolio     Day 10:   Stabilize + ship v1.4 beta
Day 7–9:  S9.5 Potential miles RPC
Day 9–10: Cross-verification + testing
```

---

## Sprint 11: "Every Card" (F22 — Card Coverage Expansion 20→29)

**Sprint Duration**: 2 weeks (10 working days)
**Sprint Goal**: Expand the credit card rules database from 20 to 29 cards by adding 10 high-priority miles cards (covering ~85% of the SG market), adding eligibility metadata for restricted cards, and reclassifying the POSB Everyday Card as cashback.
**PRD Features**: F22 (Card Coverage Expansion)
**Phase**: v1.5 — "Every Card, Every Change"
**Predecessor**: Sprint 10 (Two-Layer Ecosystem must be shipped; new cards map to existing programs/transfer partners)

---

### Sprint 11 — Definition of Ready (DoR) Checklist

Before any story enters the sprint, it must satisfy:

- [ ] User story has clear "As a... I want... So that..." statement
- [ ] Acceptance criteria defined and reviewed by PM + Tech Lead
- [ ] T-shirt size estimated by the team
- [ ] Dependencies identified — Sprint 9–10 fully shipped and verified
- [ ] Earn rate data for all 10 new cards researched and documented from bank websites/T&Cs
- [ ] Card-to-program mappings confirmed (which bank points program does each card earn into)
- [ ] Eligibility criteria documented for restricted cards (UOB Lady's Solitaire, Maybank XL, DBS Vantage, SC Beyond)
- [ ] OCBC VOYAGE currency treatment decided (separate program or merged with OCBC$)

### Sprint 11 — Definition of Done (DoD) Checklist

A story is "Done" when:

- [ ] Feature works as described in all acceptance criteria
- [ ] Unit tests written and passing (happy path + key edge cases)
- [ ] Integration test confirms new cards work with recommendation engine end-to-end
- [ ] No P0 or P1 bugs remaining
- [ ] Code committed to main branch and peer-reviewed
- [ ] All seeded card data cross-checked against bank websites (earn rates, caps, conditions)
- [ ] Existing 20 cards continue to work correctly (backward compatibility verified)
- [ ] Recommendation engine produces correct results with new cards added to user portfolios
- [ ] Card browser shows eligibility badges for restricted cards

---

### Story S11.1: Database Migration — Eligibility Metadata + POSB Reclassification

> **As the** system,
> **I need** an `eligibility_criteria` JSONB column on the credit cards table and a mechanism to reclassify the POSB Everyday Card,
> **So that** restricted cards can be properly filtered and cashback-only cards are excluded from miles recommendations.

**Priority**: P1 (Must Have — blocks S11.2)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F22 (data foundation)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | The migration runs | I query the credit_cards table schema | An `eligibility_criteria JSONB` column exists (nullable, default NULL) |
| AC2 | The migration runs | I query the POSB Everyday Card | It is either: (a) soft-deleted with a `is_miles_card = false` flag, or (b) removed from the active card list with a migration note |
| AC3 | A card has no eligibility restrictions | I query its eligibility_criteria | The value is NULL (no restrictions apply) |
| AC4 | UOB Lady's Solitaire is seeded (S11.2) | I query its eligibility_criteria | It contains `{"gender": "female"}` |
| AC5 | Maybank XL Rewards is seeded (S11.2) | I query its eligibility_criteria | It contains `{"age_min": 21, "age_max": 39}` |
| AC6 | The migration is rolled back | Changes are cleanly reversed | No orphaned data; POSB Everyday is restored if removed |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T11.01: Design eligibility_criteria JSONB schema (gender, age_min, age_max, income_min, banking_tier) | Data Engineer | 0.25d | None |
| T11.02: Write migration DDL — add eligibility_criteria column to credit_cards | Data Engineer | 0.25d | T11.01 |
| T11.03: Write migration to reclassify POSB Everyday Card (set is_miles_card = false or remove from active list) | Data Engineer | 0.25d | T11.02 |
| T11.04: Write rollback script | Data Engineer | 0.25d | T11.02 |
| T11.05: Validate schema change — column exists, POSB flagged, existing cards unaffected | Tester | 0.25d | T11.03 |

---

### Story S11.2: Seed 10 New High-Priority Credit Cards with Earn Rules

> **As a** miles optimizer with a DBS Vantage, OCBC VOYAGE, or other popular miles card,
> **I want** my card to be supported in MaxiMile with accurate earn rates and category rules,
> **So that** I get correct recommendations and cap tracking for my actual card.

**Priority**: P1 (Must Have — primary value driver)
**T-Shirt Size**: **L** (Large) — ~5 days
**Feature**: F22 (Card Coverage Expansion — core data)

**Cards to Seed**:

| # | Card | Bank | Key Special Handling |
|---|------|------|---------------------|
| 1 | DBS Vantage Visa Infinite | DBS | Income S$120k; Treasures tier; uncapped overseas |
| 2 | UOB Lady's Solitaire Metal | UOB | Women only; dual-category 4 mpd; higher caps than Lady's |
| 3 | UOB Visa Signature | UOB | S$1k/month min spend for bonus rates |
| 4 | OCBC VOYAGE Card | OCBC | Own VOYAGE Miles currency; separate transfer partners; uncapped overseas |
| 5 | SC Journey Card | Standard Chartered | Unique niche: groceries/food delivery/ride-hailing 3 mpd |
| 6 | SC Smart Card | Standard Chartered | Extreme niche: fast food/streaming/EV/transport up to 9.28 mpd |
| 7 | SC Beyond Card | Standard Chartered | Priority Banking; tiered rates; uncapped overseas |
| 8 | Maybank World Mastercard | Maybank | 4 mpd petrol UNCAPPED; best petrol card in SG |
| 9 | Maybank XL Rewards Card | Maybank | Age 21-39 only; 4 mpd across 6+ categories |
| 10 | HSBC Premier Mastercard | HSBC | Premier Banking; high overseas rates; 91.8k welcome miles |

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | The migration runs | I query the credit_cards table | 10 new cards are inserted with name, bank, annual_fee, and eligibility_criteria |
| AC2 | DBS Vantage is seeded | I query its earn rules | 7 category rules exist: 1.5 mpd local general, 2.2 mpd overseas (all categories), with no monthly cap on overseas earn |
| AC3 | UOB Lady's Solitaire is seeded | I query its rules | 4 mpd on TWO user-selectable preferred categories; eligibility_criteria = `{"gender": "female"}` |
| AC4 | OCBC VOYAGE is seeded | I query its program mapping | It maps to a new "VOYAGE Miles" program (or OCBC$ depending on design decision) with 1.3-1.6 mpd local / 2.2 mpd overseas uncapped |
| AC5 | SC Smart Card is seeded | I query its rules | Niche categories correctly seeded: fast food, streaming, EV charging, public transport with their respective earn rates |
| AC6 | Maybank XL Rewards is seeded | I query its details | eligibility_criteria = `{"age_min": 21, "age_max": 39}`; 4 mpd across dining/shopping/flights/hotels/entertainment/overseas |
| AC7 | All 10 cards are seeded | I run the recommendation engine for each card's best category | The engine returns the new card when it beats existing cards (e.g., Maybank World MC should win for petrol at 4 mpd uncapped) |
| AC8 | Existing 20 cards (now 19 after POSB removal) | I run the recommendation engine | No regression — existing recommendations unchanged for existing cards |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T11.06: Research and document DBS Vantage earn rules (7 categories, caps, conditions) from DBS website | Data Engineer | 0.25d | None |
| T11.07: Research and document UOB Lady's Solitaire rules (dual-category, caps, women-only) | Data Engineer | 0.25d | None |
| T11.08: Research and document UOB Visa Signature rules (min spend, contactless/petrol/overseas) | Data Engineer | 0.25d | None |
| T11.09: Research and document OCBC VOYAGE rules (VOYAGE Miles currency, transfer partners, uncapped) | Data Engineer | 0.5d | None |
| T11.10: Research and document SC Journey rules (groceries/food delivery/ride-hailing niche) | Data Engineer | 0.25d | None |
| T11.11: Research and document SC Smart rules (fast food/streaming/EV/transport extreme rates) | Data Engineer | 0.25d | None |
| T11.12: Research and document SC Beyond rules (Priority Banking tiers, overseas rates) | Data Engineer | 0.25d | None |
| T11.13: Research and document Maybank World MC rules (4 mpd petrol uncapped, overseas) | Data Engineer | 0.25d | None |
| T11.14: Research and document Maybank XL Rewards rules (age 21-39, 6+ bonus categories) | Data Engineer | 0.25d | None |
| T11.15: Research and document HSBC Premier MC rules (Premier Banking, overseas, Priority Pass) | Data Engineer | 0.25d | None |
| T11.16: Write migration to INSERT 10 new cards with earn rules across 7 categories | Data Engineer | 1.5d | T11.06–T11.15, S11.1 complete |
| T11.17: Set eligibility_criteria for restricted cards (Lady's Solitaire, XL, Vantage, Beyond, Premier) | Data Engineer | 0.25d | T11.16 |
| T11.18: Cross-verify all 10 cards' earn rules against bank websites (spot-check each card × 3 categories) | Tester + Data Engineer | 1d | T11.16 |

---

### Story S11.3: Map New Cards to Existing Miles Programs

> **As the** system,
> **I need** each of the 10 new credit cards mapped to the correct miles/points program,
> **So that** the Miles tab and recommendation engine correctly attribute earnings to the right loyalty programs.

**Priority**: P1 (Must Have)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F22 (program mapping)

**Mapping Reference**:

| Card | Maps To | Rationale |
|------|---------|-----------|
| DBS Vantage | DBS Points | Earns DBS Points; transfers to airlines |
| UOB Lady's Solitaire | UNI$ | UOB reward currency |
| UOB Visa Signature | UNI$ | UOB reward currency |
| OCBC VOYAGE | VOYAGE Miles (NEW program needed) | Own transferable currency with 9+ airline/hotel partners |
| SC Journey | 360 Rewards | Standard Chartered reward currency |
| SC Smart | 360 Rewards | Standard Chartered reward currency |
| SC Beyond | 360 Rewards | Standard Chartered reward currency |
| Maybank World MC | TreatsPoints | Maybank reward currency |
| Maybank XL Rewards | TreatsPoints | Maybank reward currency |
| HSBC Premier MC | HSBC Reward Points | HSBC reward currency (added Sprint 9) |

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | DBS Vantage is mapped to DBS Points | I add DBS Vantage in the app | DBS Points appears in my Miles tab |
| AC2 | OCBC VOYAGE requires a new program | The migration seeds "VOYAGE Miles" | A new miles_program with `program_type = 'transferable'` and relevant transfer partners exists |
| AC3 | OCBC VOYAGE transfer partners are seeded | I query VOYAGE Miles transfer options | At least 5 airline partners appear with conversion rates (KrisFlyer, Asia Miles, BA Avios, Qantas, etc.) |
| AC4 | UOB Lady's Solitaire is mapped to UNI$ | I add both Lady's Solitaire and PRVI Miles | Both cards show under the same UNI$ program (deduplicated) |
| AC5 | All 10 new cards are mapped | I query each card | Every card has a valid `miles_program_id` pointing to an existing program |
| AC6 | Existing card mappings | After migration | No existing card-to-program mappings are altered |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T11.19: Create "VOYAGE Miles" program in miles_programs table (program_type = 'transferable') | Data Engineer | 0.25d | S11.1 complete |
| T11.20: Seed VOYAGE Miles transfer partners (5+ airline partners with conversion rates) | Data Engineer | 0.5d | T11.19 |
| T11.21: Map all 10 new cards to their respective programs via miles_program_id | Data Engineer | 0.5d | T11.16, T11.19 |
| T11.22: Validate all mappings — each card links to correct program; deduplication works | Tester | 0.5d | T11.21 |
| T11.23: Regression test — existing card-to-program mappings unchanged | Tester | 0.25d | T11.21 |

---

### Story S11.4: Card Browser UI — Eligibility Badges & Filtering

> **As a** user browsing cards to add to my portfolio,
> **I want to** see eligibility badges (e.g., "Women only", "Age 21-39") on restricted cards and optionally filter cards based on my profile,
> **So that** I know which cards I can apply for and don't waste time browsing ineligible cards.

**Priority**: P1 (Should Have)
**T-Shirt Size**: **M** (Medium) — ~3 days
**Feature**: F22 (UI — eligibility presentation)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | UOB Lady's Solitaire has eligibility_criteria `{"gender": "female"}` | I view it in the card browser | I see a "Women only" badge on the card |
| AC2 | Maybank XL Rewards has eligibility_criteria `{"age_min": 21, "age_max": 39}` | I view it in the card browser | I see an "Age 21-39" badge on the card |
| AC3 | DBS Vantage has eligibility_criteria `{"income_min": 120000}` | I view it in the card browser | I see "Income S$120k+" badge on the card |
| AC4 | SC Beyond has eligibility_criteria `{"banking_tier": "Priority Banking"}` | I view it in the card browser | I see a "Priority Banking" badge on the card |
| AC5 | A card has no eligibility_criteria (NULL) | I view it in the card browser | No badge is shown — card appears as normal |
| AC6 | The card browser loads with 29 cards | I scroll through the list | All 29 cards (19 existing + 10 new) are visible and browsable; sorted alphabetically by bank then card name |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T11.24: Design eligibility badge component (pill shape, muted color, icon + text) | Designer | 0.25d | None |
| T11.25: Build eligibility badge component (reads from eligibility_criteria JSONB) | Developer | 0.5d | T11.24, T11.02 |
| T11.26: Integrate badges into card browser list item — positioned below card name | Developer | 0.5d | T11.25 |
| T11.27: Update card browser to display all 29 cards (sorted by bank then name) | Developer | 0.25d | T11.16 |
| T11.28: Test badge rendering for all 5 restricted cards + verify no badge for unrestricted | Tester | 0.5d | T11.26, T11.27 |
| T11.29: Accessibility — ensure badges are read by screen readers; minimum contrast ratio | Tester + Designer | 0.25d | T11.26 |

---

### Story S11.5: Recommendation Engine Validation — New Cards

> **As a** user with one of the 10 new cards in my portfolio,
> **I want** the recommendation engine to consider my new card when suggesting the best card for each category,
> **So that** I get accurate, optimal recommendations.

**Priority**: P1 (Must Have)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F22 (end-to-end validation)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have Maybank World MC (4 mpd petrol uncapped) and DBS Altitude (1.4 mpd petrol capped) in my portfolio | I ask for a petrol recommendation | Maybank World MC is recommended (4 mpd > 1.4 mpd) |
| AC2 | I have SC Smart (9.28 mpd fast food) but the "dining" category is selected | The recommendation engine runs | SC Smart is NOT recommended for general dining (it only earns bonus on fast food subcategory — maps to general dining at base rate) unless the MCC matches fast food specifically |
| AC3 | I have OCBC VOYAGE (2.2 mpd overseas uncapped) and Citi PremierMiles (1.2 mpd overseas after cap) | I ask for overseas recommendation after Citi cap is exhausted | OCBC VOYAGE is recommended (2.2 mpd > 1.2 mpd base rate) |
| AC4 | I add DBS Vantage (requires S$120k income) to my portfolio | The app processes the addition | The card is added successfully; no income verification — the user asserts their own eligibility |
| AC5 | I have only new cards in my portfolio (no original 20) | I use the recommendation engine | Recommendations work correctly — engine handles new cards independently |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T11.30: Write integration tests — new card vs existing card for each of 7 categories | Tester | 1d | T11.16, T11.21 |
| T11.31: Validate recommendation engine handles uncapped cards correctly (Vantage, VOYAGE, World MC) | Tester | 0.5d | T11.30 |
| T11.32: Validate conditional earn rates (UOB Visa Sig min spend, SC Smart niche categories) | Software Engineer + Tester | 0.5d | T11.30 |
| T11.33: Fix any recommendation engine bugs found during validation | Developer + SE | 0.5d (buffer) | T11.30–T11.32 |

---

### Story S11.6: E2E Testing & Stabilization

> **As the** QA team,
> **I need** comprehensive end-to-end testing of the 29-card database and eligibility system,
> **So that** we can ship v1.5 Phase 1 with confidence.

**Priority**: P1 (Must Have)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F22 (integration)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | A new user signs up | They browse available cards | All 29 cards are visible with correct names, banks, and eligibility badges |
| AC2 | A user adds 3 new cards (DBS Vantage, Maybank XL, OCBC VOYAGE) | They view the Miles tab | Correct programs appear: DBS Points, TreatsPoints, VOYAGE Miles |
| AC3 | A user with both old and new cards | They use the recommendation engine across all 7 categories | Recommendations correctly compare all cards in portfolio; new cards win when they have higher rates |
| AC4 | POSB Everyday Card is reclassified | I search for it in the card browser | It does NOT appear in the miles card list |
| AC5 | All Sprint 7–10 features | Full regression | Miles Portfolio, Two-Layer Architecture, Transfer Nudges, Goals — all still work correctly with 29 cards |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T11.34: E2E test — new user onboarding with new cards → recommendations → Miles tab | Tester | 0.5d | All S11 stories complete |
| T11.35: E2E test — mixed portfolio (old + new cards) → recommendations across all 7 categories | Tester | 0.5d | T11.34 |
| T11.36: Regression test — Sprint 7–10 features work with expanded card database | Tester | 0.5d | T11.34 |
| T11.37: Verify POSB Everyday Card is removed from all user-facing surfaces | Tester | 0.25d | T11.03 |
| T11.38: Bug fix buffer — address P0/P1 issues found in testing | Developer + SE | 0.5d | T11.34–T11.37 |

---

### Sprint 11 — Dependencies Map

```
                                SPRINT 11 DEPENDENCY FLOW
                                =========================

PREREQUISITE: Sprint 9–10 fully shipped (two-layer architecture, transfer partners, RPCs)
                                        │
                                        ▼
S11.1 DB Migration (eligibility + POSB) ──────────────────────────────────────┐
  T11.01 Schema design                                                         │
    ↓                                                                         │
  T11.02 Add eligibility_criteria column                                       │
    ↓                                                                         │
  T11.03 Reclassify POSB Everyday ──→ T11.05 Validate                        │
  T11.04 Rollback script                                                       │
    │                                                                         │
    ▼                                                                         │
S11.2 Seed 10 New Cards ◄──── (BLOCKED until S11.1 complete) ────────────────┘
  T11.06–T11.15 Rate research (all 10 cards — can parallel)
    ↓
  T11.16 Write INSERT migration ──→ T11.17 Set eligibility ──→ T11.18 Cross-verify
    │
    ▼
S11.3 Map Cards to Programs ◄──── (BLOCKED until S11.2 complete)
  T11.19 Create VOYAGE Miles program
    ↓
  T11.20 Seed VOYAGE transfer partners
  T11.21 Map all 10 cards ──→ T11.22 Validate mappings ──→ T11.23 Regression test
    │
    ├─────────────────────────────────────────────────────┐
    ▼                                                      ▼
S11.4 Card Browser UI ◄──── (parallel with S11.5)    S11.5 Recommendation Validation ◄
  T11.24 Badge design                                   T11.30 Integration tests
  T11.25 Build badge component                          T11.31 Uncapped validation
  T11.26 Integrate into browser                         T11.32 Conditional rates
  T11.27 Display 29 cards                               T11.33 Bug fix buffer
  T11.28 Test badges
  T11.29 Accessibility
    │                                                      │
    └─────────────────────┬────────────────────────────────┘
                          ▼
S11.6 E2E Testing & Stabilization ◄──── (BLOCKED until ALL stories complete)
  T11.34 New card onboarding E2E
  T11.35 Mixed portfolio E2E
  T11.36 Sprint 7–10 regression
  T11.37 POSB removal verification
  T11.38 Bug fix buffer
```

**Critical Path**: S11.1 (migration) → S11.2 (seed 10 cards) → S11.3 (map to programs) → S11.5 (recommendation validation) → S11.6 (E2E)

**Parallel Tracks**:
- T11.06–T11.15 (rate research for 10 cards) can all proceed in parallel from Day 1
- S11.4 (UI badges) and S11.5 (recommendation validation) can proceed in parallel once S11.3 is done
- T11.24 (badge design) can start Day 1 in parallel with rate research

---

### Sprint 11 — Risks & Mitigations

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R11.1 | Earn rate data for new cards is inaccurate or outdated — bank websites may not clearly state all category rules | **High** | **High** | Cross-check every card against 2 independent sources (bank website + miles blog like MileLion); flag any discrepancies for PM review; document source URL for each rate |
| R11.2 | OCBC VOYAGE Miles is a separate transferable currency with its own transfer partners — adding it increases complexity | **Medium** | **Medium** | Treat VOYAGE Miles as a new `program_type = 'transferable'` entry; seed top 5 airline transfer partners; defer hotel partners to later sprint |
| R11.3 | SC Smart Card has extremely niche categories (EV charging, fast food) that don't cleanly map to our 7 categories | **Medium** | **Medium** | Map to nearest existing category with a note; for EV charging → "Transport"; for fast food → "Dining" with a `subcategory_note` field; the recommendation engine selects based on primary category |
| R11.4 | UOB Visa Signature requires S$1k min monthly spend for bonus rates — conditional logic may be complex | **Medium** | **Medium** | Implement as a simple threshold check: if total card spend this month < S$1,000, use base rate; if ≥ S$1,000, use bonus rate. Check at recommendation time. |
| R11.5 | POSB Everyday Card removal may affect existing users who added it | **Low** | **Medium** | Soft-delete rather than hard-delete; existing users who had POSB see a one-time notice: "POSB Everyday Card has been reclassified as a cashback card and removed from miles recommendations"; keep their historical transaction data intact |
| R11.6 | 10 new cards × 7 categories = 70 earn rules to seed — data entry errors are likely | **High** | **High** | Automated validation script: check every card has exactly 7 category rules; no null earn rates; caps are non-negative; cross-verify 3 cards fully (all 7 categories) as a sample |

---

## Sprint 12: "Every Change" (F23 — Rate Change Monitoring & Alerts)

**Sprint Duration**: 2 weeks (10 working days)
**Sprint Goal**: Build a rate change monitoring system that tracks earn rate changes, cap adjustments, and program devaluations, and proactively alerts affected users via in-app notifications and card detail badges.
**PRD Features**: F23 (Rate Change Monitoring & Alerts)
**Phase**: v1.5 — "Every Card, Every Change"
**Predecessor**: Sprint 11 (29-card database must be stable; eligibility metadata in place)

---

### Sprint 12 — Definition of Ready (DoR) Checklist

Before any story enters the sprint, it must satisfy:

- [ ] User story has clear "As a... I want... So that..." statement
- [ ] Acceptance criteria defined and reviewed by PM + Tech Lead
- [ ] T-shirt size estimated by the team
- [ ] Dependencies identified — Sprint 11 fully shipped and verified
- [ ] Rate change data model reviewed by Data Engineer
- [ ] Known recent rate changes documented (Amex MR devaluation, DBS WWC cap, Maybank Horizon cut)
- [ ] Notification UI patterns decided (banner vs bottom sheet vs modal)

### Sprint 12 — Definition of Done (DoD) Checklist

A story is "Done" when:

- [ ] Feature works as described in all acceptance criteria
- [ ] Unit tests written and passing (happy path + key edge cases)
- [ ] Integration test confirms alerts flow from creation → notification → card detail display
- [ ] No P0 or P1 bugs remaining
- [ ] Code committed to main branch and peer-reviewed
- [ ] Sample rate changes seeded (Amex MR devaluation, DBS WWC cap) for testing
- [ ] Existing features continue to work correctly (no regression)
- [ ] Push notification delivery verified on both iOS and Android

---

### Story S12.1: Database Migration — Rate Changes Table

> **As the** system,
> **I need** a `rate_changes` table to store structured rate change events with affected cards, old/new values, and alert text,
> **So that** rate change alerts can be created, stored, and queried per user.

**Priority**: P1 (Must Have — blocks all other Sprint 12 stories)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F23 (data foundation)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | The migration runs | `rate_changes` table is created | It contains columns: `id` (PK), `card_id` (FK→credit_cards, nullable — NULL for program-wide changes), `program_id` (FK→miles_programs, nullable), `change_type` (enum: 'earn_rate', 'cap_change', 'devaluation', 'partner_change', 'fee_change'), `category` (text, nullable — e.g., 'dining'), `old_value` (text), `new_value` (text), `effective_date` (date), `alert_title` (text), `alert_body` (text), `severity` (enum: 'info', 'warning', 'critical'), `created_at` (timestamptz) |
| AC2 | A rate change for DBS Woman's World cap cut is seeded | I query it | card_id matches DBS WWC; change_type = 'cap_change'; old_value = '1500'; new_value = '1000'; severity = 'warning' |
| AC3 | An Amex MR devaluation is seeded | I query it | program_id matches Amex MR; change_type = 'devaluation'; severity = 'critical'; alert_body describes the impact |
| AC4 | RLS is applied | A user queries rate_changes | They can read all rows (reference data — publicly readable by authenticated users) |
| AC5 | The migration is rolled back | The table is dropped cleanly | No orphaned data or broken FK references |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T12.01: Design rate_changes schema (columns, constraints, enums, indexes) | Data Engineer | 0.5d | None |
| T12.02: Write migration DDL (create table, enums, FK constraints, RLS, indexes) | Data Engineer | 0.5d | T12.01 |
| T12.03: Seed sample rate changes — Amex MR devaluation (critical), DBS WWC cap (warning), HSBC Revolution boost (info) | Data Engineer | 0.5d | T12.02 |
| T12.04: Write rollback script | Data Engineer | 0.25d | T12.02 |
| T12.05: Validate schema — table exists, sample data queryable, RLS works | Tester | 0.25d | T12.03 |

---

### Story S12.2: Rate Change Alert RPC — Get Alerts for User's Cards

> **As the** system,
> **I need** an RPC function that returns rate change alerts relevant to a specific user's card portfolio,
> **So that** users only see alerts for cards they actually hold.

**Priority**: P1 (Must Have — bridges data to UI)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F23 (query layer)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | User has DBS Woman's World Card and a cap change exists for it | I call `get_user_rate_changes(user_id)` | The DBS WWC cap change alert is returned |
| AC2 | User has Amex KrisFlyer Ascend and a MR devaluation alert exists (program-level) | I call the function | The Amex MR devaluation alert is returned (matched via card → program → rate_change) |
| AC3 | User does NOT have DBS Woman's World Card | I call the function | The DBS WWC alert is NOT returned |
| AC4 | The function returns results | I inspect the response | Each row includes: alert_title, alert_body, severity, effective_date, change_type, card_name (if card-specific), old_value, new_value |
| AC5 | Results are returned | They are ordered | Most recent effective_date first; critical severity before warning before info |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T12.06: Design `get_user_rate_changes(p_user_id UUID)` RPC — JOIN rate_changes with user's cards and programs | Software Engineer | 0.5d | S12.1 complete |
| T12.07: Implement the RPC — filter by user's portfolio, ORDER BY severity DESC, effective_date DESC | Software Engineer | 0.5d | T12.06 |
| T12.08: Unit tests — user with affected card, user without, multiple alerts, empty portfolio | Tester | 0.5d | T12.07 |

---

### Story S12.3: In-App Rate Change Notification Banner

> **As a** user whose card has been affected by a rate change,
> **I want to** see an in-app notification banner when I open the app,
> **So that** I'm immediately aware of changes that affect my miles earning strategy.

**Priority**: P1 (Should Have)
**T-Shirt Size**: **M** (Medium) — ~3 days
**Feature**: F23 (notification UI)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have unread rate change alerts | I open the app | A notification banner appears at the top of the home screen: "[severity icon] [alert_title]" with a "View details" CTA |
| AC2 | The alert is severity = 'critical' (e.g., Amex MR devaluation) | I view the banner | The banner has a red/warning background; icon is an exclamation triangle |
| AC3 | The alert is severity = 'warning' (e.g., cap change) | I view the banner | The banner has an amber/gold background |
| AC4 | The alert is severity = 'info' (e.g., rate boost) | I view the banner | The banner has a blue/neutral background |
| AC5 | I tap "View details" on the banner | I navigate | It takes me to the affected card's detail screen with the rate change highlighted |
| AC6 | I tap "Dismiss" on the banner | The banner hides | It does not reappear for this alert; a `read_at` timestamp is stored |
| AC7 | I have multiple unread alerts | I view the banners | Maximum 1 banner shown at a time (highest severity first); after dismissing, next alert appears |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T12.09: Design notification banner component (3 severity variants: critical/warning/info) | Designer | 0.5d | None |
| T12.10: Create `user_alert_reads` table (user_id, rate_change_id, read_at) for tracking dismissals | Data Engineer | 0.25d | S12.1 |
| T12.11: Build notification banner UI component (severity-aware, dismiss CTA, view details CTA) | Developer | 0.5d | T12.09 |
| T12.12: Integrate banner into app home screen — fetch unread alerts on app open | Developer | 0.5d | T12.11, T12.07 |
| T12.13: Implement dismiss → write to user_alert_reads → hide banner → show next | Developer | 0.25d | T12.12, T12.10 |
| T12.14: Implement "View details" navigation → card detail screen | Developer | 0.25d | T12.12 |
| T12.15: Test banner rendering for all 3 severity levels + dismiss + navigation | Tester | 0.5d | T12.13, T12.14 |

---

### Story S12.4: Card Detail Screen — "Rate Updated" Badge

> **As a** user viewing a card's detail screen,
> **I want to** see a "Rate Updated" badge with the change date when the card has had a recent rate change,
> **So that** I know to review the new rates and adjust my strategy.

**Priority**: P1 (Should Have)
**T-Shirt Size**: **S** (Small) — ~2 days
**Feature**: F23 (card-level indicator)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | DBS Woman's World Card has a rate change with effective_date = 2025-08-01 | I view the DBS WWC detail screen | I see a "Rate Updated Aug 2025" badge near the card header |
| AC2 | I tap the "Rate Updated" badge | A bottom sheet or expansion shows | I see the change details: old rate/cap → new rate/cap, with a plain-English explanation |
| AC3 | The rate change effective_date is > 90 days ago | I view the card | The badge is still shown but in a more muted style (not highlighted) |
| AC4 | A card has no rate changes | I view its detail screen | No "Rate Updated" badge is shown |
| AC5 | A card has multiple rate changes | I view the badge | It shows the most recent change; tapping reveals a chronological list |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T12.16: Design "Rate Updated" badge (pill shape, date text, severity-colored left border) | Designer | 0.25d | None |
| T12.17: Build "Rate Updated" badge component | Developer | 0.25d | T12.16 |
| T12.18: Integrate badge into card detail screen header area | Developer | 0.25d | T12.17 |
| T12.19: Build change details bottom sheet (old vs new, explanation, change history list) | Developer | 0.5d | T12.17, T12.07 |
| T12.20: Test badge rendering, tap expansion, and history list | Tester | 0.25d | T12.19 |

---

### Story S12.5: Rate Change History & Administration

> **As an** admin (via migration or admin function),
> **I need** to create rate change records with proper metadata when a bank announces a rate change,
> **So that** the alert system can notify affected users.

**Priority**: P1 (Should Have)
**T-Shirt Size**: **S** (Small) — ~1 day
**Feature**: F23 (data administration)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | A new rate change is discovered (e.g., via miles blog or bank announcement) | An admin INSERT is run | A new row is created in rate_changes with all required fields |
| AC2 | The rate change affects earn rules in our database | The admin also updates earn_rules | Both the rate_change record AND the earn_rules are updated in the same migration/transaction |
| AC3 | A rate change template exists | I reference it | Standard templates for common change types: earn_rate change, cap change, devaluation, new/removed transfer partner |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T12.21: Create SQL templates for each change_type (earn_rate, cap_change, devaluation, partner_change) | Data Engineer | 0.5d | S12.1 complete |
| T12.22: Document admin workflow — how to add a rate change record + update earn_rules atomically | Data Engineer | 0.25d | T12.21 |
| T12.23: Seed 5 historical rate changes from 2025-2026 market data (Amex MR, DBS WWC, BOC Elite, Maybank Horizon, HSBC Revolution) | Data Engineer | 0.5d | T12.21 |

---

### Story S12.6: E2E Testing & Stabilization

> **As the** QA team,
> **I need** comprehensive end-to-end testing of the rate change monitoring system,
> **So that** we can ship v1.5 with confidence.

**Priority**: P1 (Must Have)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F23 (integration)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | A user with DBS Woman's World Card opens the app | An unread cap_change alert exists | The notification banner appears; tapping "View details" navigates to DBS WWC detail with "Rate Updated" badge |
| AC2 | A user with Amex KrisFlyer Ascend opens the app | An unread MR devaluation (critical) exists | Critical banner appears with red styling; change details explain the devaluation impact |
| AC3 | A user dismisses all alerts | They reopen the app | No banners appear; dismissed alerts don't resurface |
| AC4 | A user without any affected cards | They open the app | No banners, no badges — clean experience |
| AC5 | All Sprint 7–11 features | Full regression | Everything still works: recommendations, Miles Portfolio, Two-Layer, Transfer Nudges, 29 cards |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T12.24: E2E test — affected user: app open → banner → dismiss → card detail → badge → change details | Tester | 0.5d | All S12 stories complete |
| T12.25: E2E test — unaffected user: no banners, no badges | Tester | 0.25d | T12.24 |
| T12.26: E2E test — multiple alerts: severity ordering, sequential display after dismiss | Tester | 0.25d | T12.24 |
| T12.27: Regression test — Sprint 7–11 features with rate changes in database | Tester | 0.5d | T12.24 |
| T12.28: Performance test — alert banner rendering <200ms on app open | Tester | 0.25d | T12.24 |
| T12.29: Bug fix buffer — address P0/P1 issues found in testing | Developer + SE | 0.5d | T12.24–T12.28 |

---

### Sprint 12 — Dependencies Map

```
                                SPRINT 12 DEPENDENCY FLOW
                                =========================

PREREQUISITE: Sprint 11 fully shipped (29 cards, eligibility, POSB removed)
                                        │
                                        ▼
S12.1 DB Migration (rate_changes) ─────────────────────────────────────────────┐
  T12.01 Schema design                                                          │
    ↓                                                                          │
  T12.02 DDL Migration                                                          │
    ↓                                                                          │
  T12.03 Seed sample changes ──→ T12.05 Validate                              │
  T12.04 Rollback script                                                        │
    │                                                                          │
    ▼                                                                          │
S12.2 Alert RPC ◄──── (BLOCKED until S12.1 complete) ─────────────────────────┘
  T12.06 RPC design ──→ T12.07 Implement ──→ T12.08 Unit tests
    │
    ├────────────────────────────────────────────────────────┐
    ▼                                                         ▼
S12.3 Notification Banner ◄                           S12.4 Card Detail Badge ◄
  T12.09 Banner design                                   T12.16 Badge design
  T12.10 user_alert_reads table                          T12.17 Build badge
  T12.11 Build banner ──→ T12.12 Integrate into app      T12.18 Integrate into card detail
  T12.13 Dismiss logic                                    T12.19 Change details sheet
  T12.14 Navigation CTA                                   T12.20 Test badge
  T12.15 Test banner
    │                                                         │
    └───────────────────┬─────────────────────────────────────┘
                        │
                        ▼
S12.5 Administration ◄──── (can parallel with S12.3 + S12.4)
  T12.21 SQL templates
  T12.22 Document workflow
  T12.23 Seed 5 historical changes
                        │
                        ▼
S12.6 E2E Testing ◄──── (BLOCKED until ALL stories complete)
  T12.24 Affected user E2E
  T12.25 Unaffected user E2E
  T12.26 Multiple alerts E2E
  T12.27 Sprint 7–11 regression
  T12.28 Performance test
  T12.29 Bug fix buffer
```

**Critical Path**: S12.1 (migration) → S12.2 (RPC) → S12.3 (banner) → S12.6 (E2E)

**Parallel Tracks**:
- S12.3 (notification banner) and S12.4 (card detail badge) can proceed in parallel once S12.2 is done
- S12.5 (administration) can proceed in parallel from Day 3 once schema is stable
- T12.09 (banner design) and T12.16 (badge design) can start Day 1 in parallel with schema work

---

### Sprint 12 — Risks & Mitigations

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R12.1 | Rate changes happen during Sprint 12 — new changes not yet in the system | **High** | **Low** | The admin workflow (S12.5) enables quick insertion of new changes; system handles additions gracefully |
| R12.2 | Notification banner is intrusive — users feel nagged when opening the app | **Medium** | **Medium** | Max 1 banner at a time; easy dismiss; only show for user's own cards; severity-based styling so minor changes are subtle |
| R12.3 | Push notifications for devaluations require Expo Push setup which isn't configured | **Medium** | **High** | Defer push notifications to v1.5.1; Sprint 12 focuses on in-app notifications only; push is a stretch goal |
| R12.4 | Rate change data is complex — some changes affect specific categories, others affect entire programs | **Medium** | **Medium** | The schema supports both card-level and program-level changes via nullable card_id/program_id; alert_body is free-text for nuanced explanations |
| R12.5 | Users don't understand old_value → new_value format | **Low** | **Medium** | Design change details with plain English: "Your 4 mpd dining bonus cap was reduced from S$1,500 to S$1,000 per month, starting August 2025" — not just numbers |
| R12.6 | Sprint 11 not fully shipped — 29-card database has data quality issues | **Medium** | **High** | Allocate Days 1-2 as buffer for Sprint 11 fixes; S12.1 migration can proceed while fixes happen |

---

### Sprint 11 + 12 Combined Timeline

```
SPRINT 11 (Weeks 1–2)                       SPRINT 12 (Weeks 3–4)
═══════════════════                          ═══════════════════
Day 1:    S11.1 DB migration (eligibility    Day 1–2:  S12.1 DB migration (rate_changes)
          + POSB reclassification)                      + S11 bug fixes + design tasks
Day 1–3:  T11.06–T11.15 Rate research       Day 2–4:  S12.2 Alert RPC
          (all 10 cards in parallel)         Day 3–6:  S12.3 Notification banner
Day 3–5:  T11.16 Seed 10 cards              Day 3–5:  S12.4 Card detail badge (parallel)
Day 5–6:  S11.3 Map cards to programs       Day 4–6:  S12.5 Administration + seed changes
Day 5–7:  T11.24–11.29 Card browser UI      Day 7–8:  S12.6 E2E testing + regression
Day 6–8:  S11.5 Recommendation validation   Day 9:    Stabilize
Day 8–9:  S11.6 E2E testing + regression    Day 10:   Ship v1.5 beta
Day 10:   Stabilize + ship v1.5 Phase 1
```

---

## Sprint 13: "Crowdsourced Accuracy" (F24 — Community Rate Change Submissions)

**Duration**: 2 weeks (10 working days)
**Goal**: Enable users to submit rate changes they discover, with admin verification via a Cloudflare Pages dashboard before publishing to the existing `rate_changes` table. Closes Layer 1 detection gap with community-sourced data.
**Epic**: E11 — Rate Change Detection Pipeline
**Prerequisite**: Sprint 12 complete (rate_changes table + RPCs + UI components exist)
**Infrastructure cost**: $0/month (Supabase free tier + Cloudflare Pages free tier)

### Sprint 13 — Stories

| ID | Story | Feature | Size | Points | Owner |
|----|-------|---------|------|--------|-------|
| **S13.1** | Submit a Rate Change Report | F24 | M | 5 | Developer |
| **S13.2** | Attach Evidence to Submission | F24 | S | 3 | Developer |
| **S13.3** | Admin Review Dashboard | F24 | L | 5 | Developer |
| **S13.4** | Submission Status Tracking | F24 | S | 2 | Developer |
| **S13.5** | Contributor Recognition Badge | F24 | XS | 2 | Developer |
| **S13.6** | Community Submissions E2E Testing | F24 | M | 3 | Tester |
| **Total** | | | | **20** | |

### Sprint 13 — Task Breakdown

| Task | Description | Owner | Day | Size | Dependencies |
|------|-------------|-------|-----|------|-------------|
| **T13.01** | Design `community_submissions` table schema | Data Engineer | 1 | S | — |
| **T13.02** | Write Migration 017: community_submissions + detection_source column | Data Engineer | 1 | M | T13.01 |
| **T13.03** | Add RLS policies: users can insert own submissions, read own status | Software Engineer | 1 | S | T13.02 |
| **T13.04** | Create `fn_compute_dedup_fingerprint()` function | Software Engineer | 1–2 | S | T13.02 |
| **T13.05** | Create submission form UI (card selector, change type, old/new, date, URL) | Developer | 2–4 | L | T13.02 |
| **T13.06** | Wire submission form to Supabase insert | Developer | 4 | S | T13.05 |
| **T13.07** | Add screenshot upload to Supabase Storage | Developer | 4–5 | M | T13.05 |
| **T13.08** | Implement rate limiting (5/day/user) | Software Engineer | 3 | S | T13.03 |
| **T13.09** | Implement dedup check on submission (warn if similar exists) | Software Engineer | 3–4 | M | T13.04 |
| **T13.10** | Design admin dashboard wireframe | Designer | 1–2 | M | — |
| **T13.11** | Build admin dashboard (Cloudflare Pages, React) | Developer | 3–6 | L | T13.10, T13.02 |
| **T13.12** | Admin approve flow: insert into rate_changes with detection_source='community' | Software Engineer | 5–6 | M | T13.11 |
| **T13.13** | Admin reject flow: update status + record reason | Developer | 6 | S | T13.11 |
| **T13.14** | Admin edit-before-approve flow | Developer | 6–7 | S | T13.12 |
| **T13.15** | Build "My Submissions" screen (status list) | Developer | 5–6 | S | T13.06 |
| **T13.16** | Contributor badge logic (count approved, show badge at 3+) | Developer | 7 | S | T13.12 |
| **T13.17** | Add "Report a Rate Change" entry point to card detail screen | Developer | 4 | XS | T13.05 |
| **T13.18** | Analytics tracking: submission events, approval events | Developer | 7 | XS | T13.06, T13.12 |
| **T13.19** | Write E2E tests: submission flow, dedup, approval, rate_changes insertion | Tester | 7–9 | L | T13.12 |
| **T13.20** | Write E2E tests: rate limiting, status tracking, contributor badge | Tester | 8–9 | M | T13.16 |
| **T13.21** | Regression testing (480 existing tests must pass) | Tester | 9–10 | M | T13.19 |
| **T13.22** | Stabilize + bug fixes | All | 10 | S | T13.21 |

### Sprint 13 — Dependency Map

```
T13.01 (Schema Design)
    └── T13.02 (Migration 017)
            ├── T13.03 (RLS Policies) ── T13.08 (Rate Limiting)
            ├── T13.04 (Dedup Function) ── T13.09 (Dedup Check)
            ├── T13.05 (Submission Form UI)
            │       ├── T13.06 (Wire to Supabase) ── T13.17 (Entry Point)
            │       └── T13.07 (Screenshot Upload)
            └── T13.11 (Admin Dashboard) ← T13.10 (Wireframe)
                    ├── T13.12 (Approve Flow) ── T13.14 (Edit+Approve)
                    ├── T13.13 (Reject Flow)
                    └── T13.15 (My Submissions)

T13.12 + T13.16 ── T13.18 (Analytics) ── T13.19 (E2E Tests) ── T13.21 (Regression)
```

### Sprint 13 — DoR (Definition of Ready)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | PRD v1.6 F24 acceptance criteria defined | ✅ |
| 2 | Rate Detection Architecture doc reviewed | ✅ |
| 3 | Migration 015-016 (rate_changes system) shipped and stable | ✅ |
| 4 | Supabase Storage configured for screenshot uploads | Ready |
| 5 | Cloudflare Pages account created | Ready |
| 6 | Admin auth strategy decided (Supabase Auth role or separate) | Open |

### Sprint 13 — DoD (Definition of Done)

| # | Criterion |
|---|-----------|
| 1 | Users can submit rate change reports with all required fields |
| 2 | Submissions support optional screenshot upload and source URL |
| 3 | Rate limiting enforced (5/day/user) |
| 4 | Dedup fingerprint warns on potential duplicates |
| 5 | Admin dashboard on Cloudflare Pages: view, approve, reject, edit |
| 6 | Approved submissions insert into rate_changes with detection_source='community' |
| 7 | Users can view their submission history with status badges |
| 8 | Contributor badge appears after 3+ approved submissions |
| 9 | All new E2E tests pass |
| 10 | All 480 existing tests still pass (0 regressions) |

### Sprint 13 — Risks & Mitigations

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R13.1 | Low community participation — users don't submit reports | **Medium** | **Medium** | Prominent "Report a Change" button on card detail; in-app prompt when user views rate change banner ("Did you spot this change? Help others!") |
| R13.2 | Spam submissions overwhelm admin queue | **Low** | **Low** | Rate limiting (5/day); require email verification; dedup fingerprinting catches obvious duplicates |
| R13.3 | Admin dashboard scope creep — becomes a full CMS | **Medium** | **Medium** | Strict scope: list + approve/reject/edit only. No analytics, no user management, no content editing beyond rate changes |
| R13.4 | Supabase Storage limits for screenshots | **Low** | **Low** | 1 GB free tier; compress images to max 500 KB on upload; cleanup old rejected submission screenshots monthly |
| R13.5 | Cloudflare Pages deployment issues | **Low** | **Medium** | Simple React SPA; minimal dependencies; fallback to Vercel Hobby if needed |

---

## Sprint 14: "Detection Foundation" (F25 Part 1 — Scraper + Hashing) ✅ COMPLETED

**Duration**: 2 weeks (10 working days)
**Goal**: Build the automated page monitoring foundation: source configuration, GitHub Actions Playwright scraper, content-hash change detection, and snapshot storage. No AI classification yet — this sprint delivers the data collection layer.
**Epic**: E11 — Rate Change Detection Pipeline
**Prerequisite**: Sprint 13 complete (community_submissions table, detection_source column on rate_changes)
**Infrastructure cost**: $0/month (GitHub Actions free tier for public repos)

### Sprint 14 — Stories

| ID | Story | Feature | Size | Points | Owner |
|----|-------|---------|------|--------|-------|
| **S14.1** | Source Configuration & Snapshot Storage | F25 | L | 5 | Data Engineer + SWE |
| **S14.2** | GitHub Actions Scraper Workflow | F25 | L | 8 | Software Engineer |
| **S14.3** | Content Hash Gating | F25 | M | 3 | Software Engineer |
| **Total** | | | | **16** | |

### Sprint 14 — Task Breakdown

| Task | Description | Owner | Day | Size | Dependencies |
|------|-------------|-------|-----|------|-------------|
| **T14.01** | Design source_configs + source_snapshots schema | Data Engineer | 1 | M | — |
| **T14.02** | Design pipeline_runs schema | Data Engineer | 1 | S | — |
| **T14.03** | Write Migration 018: source_configs, source_snapshots, detected_changes, pipeline_runs tables + enums | Data Engineer | 1–2 | L | T14.01, T14.02 |
| **T14.04** | Create helper functions: fn_compute_content_hash, fn_get_sources_due_for_check, fn_cleanup_old_snapshots | Software Engineer | 2–3 | M | T14.03 |
| **T14.05** | Seed source_configs with ~50 bank T&C URLs (all 9 SG banks) | Data Engineer | 2–4 | L | T14.03 |
| **T14.06** | Research and document CSS selectors for each bank page | Data Engineer | 3–5 | L | T14.05 |
| **T14.07** | Create GitHub repo for scraper (public, for free Actions) | Software Engineer | 2 | XS | — |
| **T14.08** | Write Playwright scraper script (fetch page, extract via CSS selector, hash content) | Software Engineer | 3–6 | L | T14.06, T14.07 |
| **T14.09** | Write GitHub Actions workflow YAML (cron schedule, Playwright install, env vars) | Software Engineer | 4–5 | M | T14.08 |
| **T14.10** | Implement content-hash comparison (SHA-256, compare with previous snapshot) | Software Engineer | 5–6 | M | T14.04, T14.08 |
| **T14.11** | Implement Supabase client in scraper (read source_configs, write snapshots + pipeline_runs) | Software Engineer | 5–6 | M | T14.08, T14.03 |
| **T14.12** | Add last_run.json auto-commit (prevent GitHub 60-day inactivity disable) | Software Engineer | 6 | XS | T14.09 |
| **T14.13** | Implement error handling: retry logic, failure counting, source status updates | Software Engineer | 6–7 | M | T14.11 |
| **T14.14** | Create v_pipeline_health view (per-source uptime, last check, error rate) | Data Engineer | 7 | S | T14.03, T14.13 |
| **T14.15** | Manual test: trigger GitHub Actions workflow, verify snapshots stored | Software Engineer | 7–8 | M | T14.09, T14.11 |
| **T14.16** | Write unit tests for hash comparison, snapshot storage, error handling | Tester | 8–9 | M | T14.10, T14.13 |
| **T14.17** | Regression testing (all existing tests must pass) | Tester | 9–10 | M | T14.16 |
| **T14.18** | Stabilize + bug fixes | All | 10 | S | T14.17 |

### Sprint 14 — Dependency Map

```
T14.01 (source_configs schema) + T14.02 (pipeline_runs schema)
    └── T14.03 (Migration 018)
            ├── T14.04 (Helper Functions)
            │       └── T14.10 (Hash Comparison)
            ├── T14.05 (Seed 50 URLs)
            │       └── T14.06 (CSS Selectors)
            │               └── T14.08 (Playwright Script)
            │                       ├── T14.09 (GH Actions YAML) ── T14.12 (last_run.json)
            │                       └── T14.11 (Supabase Client) ── T14.13 (Error Handling)
            └── T14.14 (Pipeline Health View)

T14.15 (Manual Test) ← T14.09 + T14.11
T14.16 (Unit Tests) ← T14.10 + T14.13 ── T14.17 (Regression)
```

### Sprint 14 — DoR

| # | Criterion | Status |
|---|-----------|--------|
| 1 | PRD v1.6 F25 acceptance criteria defined | ✅ |
| 2 | Rate Detection Architecture doc reviewed | ✅ |
| 3 | Sprint 13 complete (community_submissions, detection_source column) | Prerequisite |
| 4 | List of ~50 bank T&C URLs compiled | Open (T14.05-06) |
| 5 | GitHub repo created (public, for free Actions) | Ready |
| 6 | Supabase project env vars available for GitHub Actions secrets | Ready |

### Sprint 14 — DoD

| # | Criterion |
|---|-----------|
| 1 | source_configs table seeded with ~50 bank URLs across 9 banks |
| 2 | GitHub Actions workflow runs daily on cron schedule |
| 3 | Playwright successfully fetches pages and stores snapshots |
| 4 | SHA-256 hash comparison correctly identifies unchanged pages (no downstream processing) |
| 5 | SHA-256 hash comparison correctly flags changed pages for AI processing (Sprint 15) |
| 6 | Pipeline health view shows per-source uptime and error rates |
| 7 | Error handling: 3 consecutive failures marks source as "broken" |
| 8 | last_run.json auto-committed to prevent GitHub inactivity disable |
| 9 | All new tests pass + all existing tests pass (0 regressions) |

### Sprint 14 — Risks & Mitigations

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R14.1 | Bank pages use heavy JavaScript rendering that Playwright can't handle | **Low** | **High** | Test all 50 URLs during T14.06; fall back to HTTP+cheerio for static pages; document rendering requirements per source |
| R14.2 | CSS selectors break due to bank page redesigns | **High** | **Medium** | Version selectors in source_configs; fallback to full-page content hash if selector extraction fails; alerting on extraction errors |
| R14.3 | GitHub Actions runner environment changes break Playwright | **Low** | **Medium** | Pin Playwright version in workflow; use ubuntu-22.04 runner (LTS); test locally before deploying |
| R14.4 | Supabase connection from GitHub Actions fails (CORS/auth) | **Low** | **High** | Use Supabase service_role key in GitHub Secrets; test connection in T14.07 before building full pipeline |
| R14.5 | Compiling bank T&C URLs takes longer than estimated | **Medium** | **Low** | Start with top 20 most important sources (covering the 29 cards in our DB); expand in subsequent sprints. **Post-mortem**: Refocused to 30 T&C PDFs + 5 index pages in Sprint 16b |

---

## Sprint 15: "Always Up to Date" (F25 Part 2 — AI Classification + Pipeline Health) ✅ COMPLETED

**Duration**: 2 weeks (10 working days)
**Goal**: Wire the AI classification pipeline (Gemini Flash + Groq fallback), implement confidence-based routing, build the pipeline health monitoring dashboard, and run comprehensive E2E testing. After this sprint, the full detection pipeline runs autonomously at $0/month.
**Epic**: E11 — Rate Change Detection Pipeline
**Prerequisite**: Sprint 14 complete (scraper running, snapshots stored, hashes computed)
**Infrastructure cost**: $0/month (Gemini Flash free tier: 250 req/day, Groq free tier: 1,000 req/day)

### Sprint 15 — Stories

| ID | Story | Feature | Size | Points | Owner |
|----|-------|---------|------|--------|-------|
| **S15.1** | AI Classification Pipeline | F25 | L | 8 | AI Engineer + SWE |
| **S15.2** | Confidence-Based Routing | F25 | M | 5 | Software Engineer |
| **S15.3** | Pipeline Health & E2E Testing | F25 | M | 5 | Tester + SWE |
| **Total** | | | | **18** | |

### Sprint 15 — Task Breakdown

| Task | Description | Owner | Day | Size | Dependencies |
|------|-------------|-------|-----|------|-------------|
| **T15.01** | Design Gemini Flash system prompt with few-shot examples (5 seed records) | AI Engineer | 1 | M | — |
| **T15.02** | Define tool_use schema for structured rate_change output | AI Engineer | 1 | S | T15.01 |
| **T15.03** | Implement Gemini Flash API client (structured output, retry logic) | Software Engineer | 2–3 | M | T15.02 |
| **T15.04** | Implement Groq Llama fallback client (same prompt, JSON mode) | Software Engineer | 3–4 | M | T15.02 |
| **T15.05** | Wire AI classifier into scraper pipeline (after hash-diff detects change) | Software Engineer | 4–5 | M | T15.03, Sprint 14 scraper |
| **T15.06** | Implement confidence scoring extraction from model response | Software Engineer | 4 | S | T15.03 |
| **T15.07** | Implement auto-approve routing (confidence >= 0.85, Tier 1 source) | Software Engineer | 5–6 | M | T15.06 |
| **T15.08** | Implement review queue routing (confidence 0.50–0.84 → detected_changes table) | Software Engineer | 5–6 | S | T15.06 |
| **T15.09** | Implement auto-discard routing (confidence < 0.50, log only) | Software Engineer | 5 | XS | T15.06 |
| **T15.10** | Implement dedup fingerprint check before auto-approve | Software Engineer | 6 | S | T15.07 |
| **T15.11** | Add AI-detected changes to admin review dashboard (extend Sprint 13 dashboard) | Developer | 5–7 | M | T15.08, Sprint 13 dashboard |
| **T15.12** | Build pipeline health dashboard page (source uptime, detection stats, error rates) | Developer | 6–8 | M | T14.14 (v_pipeline_health view) |
| **T15.13** | Admin daily digest notification (auto-approved changes summary) | Software Engineer | 7 | S | T15.07 |
| **T15.14** | Prompt tuning: test against 5 known rate changes, adjust few-shot examples | AI Engineer | 7–8 | M | T15.05 |
| **T15.15** | Write E2E tests: hash gating (no-change → no LLM call) | Tester | 7–8 | M | T15.05 |
| **T15.16** | Write E2E tests: change detection → LLM → confidence routing | Tester | 8–9 | M | T15.07, T15.08, T15.09 |
| **T15.17** | Write E2E tests: dedup, Groq fallback, pipeline_runs logging | Tester | 8–9 | M | T15.10, T15.04 |
| **T15.18** | Full regression testing (all project tests: 480+ existing + Sprint 13-15 new) | Tester | 9–10 | L | T15.15, T15.16, T15.17 |
| **T15.19** | Stabilize + bug fixes + prompt refinement | All | 10 | S | T15.18 |

### Sprint 15 — Dependency Map

```
T15.01 (System Prompt) ── T15.02 (Tool Schema)
    ├── T15.03 (Gemini Client) ── T15.05 (Wire to Pipeline) ── T15.06 (Confidence)
    │                                                              ├── T15.07 (Auto-approve) ── T15.10 (Dedup)
    │                                                              ├── T15.08 (Review Queue)
    │                                                              └── T15.09 (Auto-discard)
    └── T15.04 (Groq Fallback)

T15.08 ── T15.11 (Extend Admin Dashboard)
T14.14 ── T15.12 (Pipeline Health UI)
T15.07 ── T15.13 (Daily Digest)
T15.05 ── T15.14 (Prompt Tuning)

T15.05 + T15.07-09 + T15.10 + T15.04 ── T15.15-17 (E2E Tests) ── T15.18 (Regression)
```

### Sprint 15 — DoR

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Sprint 14 complete (scraper running, snapshots stored) | Prerequisite |
| 2 | Gemini API key provisioned (free tier) | Ready |
| 3 | Groq API key provisioned (free tier) | Ready |
| 4 | 5 seed rate change records available as few-shot examples | ✅ (Migration 015) |
| 5 | detected_changes table created (Migration 018 in Sprint 14) | Prerequisite |

### Sprint 15 — DoD

| # | Criterion |
|---|-----------|
| 1 | Gemini Flash classifies detected page changes into rate_changes schema |
| 2 | Groq Llama 3.3 70B works as fallback when Gemini is unavailable |
| 3 | Confidence >= 0.85 from Tier 1 sources auto-inserts into rate_changes |
| 4 | Confidence 0.50–0.84 queued in detected_changes for admin review |
| 5 | Confidence < 0.50 auto-discarded with logging |
| 6 | Dedup fingerprint prevents duplicate rate_changes entries |
| 7 | Admin dashboard shows AI-detected changes alongside community submissions |
| 8 | Pipeline health dashboard shows source uptime, detection stats, error rates |
| 9 | All E2E tests pass (hash gating, classification, routing, dedup, fallback) |
| 10 | All project tests pass (480+ existing + Sprint 13-15 new), 0 regressions |
| 11 | Full pipeline runs autonomously at $0/month infrastructure cost |

### Sprint 15 — Risks & Mitigations

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R15.1 | Gemini Flash produces inconsistent structured output | **Medium** | **High** | tool_use schema enforcement; validate all fields before accepting; retry with temperature=0 on parsing failure |
| R15.2 | Confidence scores are poorly calibrated (too many auto-approves or too many reviews) | **Medium** | **Medium** | Start conservative (0.85 threshold); tune based on first 2 weeks of data; admin can adjust threshold in source_configs |
| R15.3 | Groq fallback produces lower quality than Gemini | **Medium** | **Low** | Groq uses Llama 3.3 70B (strong model); same prompt/schema; test equivalence during T15.14 |
| R15.4 | False positives overwhelm admin review queue | **Low** | **Medium** | Max 5 items/day in review queue (excess auto-discarded); admin can bulk-reject; tune prompt to reduce false positives |
| R15.5 | Pipeline E2E tests are flaky due to external API calls | **High** | **Medium** | Mock Gemini/Groq responses in E2E tests; integration tests use real APIs with test-specific prompts; separate unit and integration test suites |

---

### Sprint 13 + 14 + 15 Combined Timeline

```
SPRINT 13 (Weeks 1–2)                SPRINT 14 (Weeks 3–4)                SPRINT 15 (Weeks 5–6)
"Crowdsourced Accuracy"              "Detection Foundation"               "Always Up to Date"
═══════════════════                  ═══════════════════                  ═══════════════════
Day 1:    Migration 017              Day 1:    Migration 018              Day 1:    AI prompt design
          (community_submissions)              (source_configs +                    + tool schema
Day 1–2:  RLS + dedup function                 snapshots + pipeline)     Day 2–4:  Gemini + Groq
Day 2–4:  Submission form UI         Day 2–4:  Seed source URLs +                      API clients
Day 3–6:  Admin dashboard                      CSS selectors            Day 4–6:  Wire to pipeline
          (Cloudflare Pages)         Day 3–6:  Playwright scraper                  + confidence routing
Day 5–6:  Status tracking +         Day 5–6:  Hash comparison +          Day 5–7:  Extend admin dashboard
          approve/reject flows                 Supabase client                     + pipeline health UI
Day 7:    Contributor badges         Day 6–7:  Error handling +           Day 7–8:  Prompt tuning
          + analytics                          health view                         + daily digest
Day 7–9:  E2E testing               Day 7–9:  Manual + unit tests        Day 7–9:  E2E tests
Day 10:   Stabilize                  Day 10:   Stabilize                  Day 10:   Full regression
                                                                                   + ship v1.7
```

---

## Sprint 16: "Smart Logging: iOS" (F26 — Apple Pay Shortcuts Auto-Capture)

**Duration**: 2 weeks (10 working days)
**Sprint Goal**: iOS users with Apple Pay can have in-store NFC transactions automatically logged in MaxiMile via iOS Shortcuts, reducing per-transaction effort from ~20 seconds to ~2-3 seconds (one-tap confirm). This sprint delivers the deep link handler, merchant-to-category mapping, card fuzzy matching, a downloadable Shortcut template, and an in-app setup wizard.
**Epic**: E12 — Transaction Auto-Capture
**PRD Features**: F26 (Apple Pay Shortcuts Auto-Capture)
**Prerequisite**: Sprints 1-6 (MVP shipped; transaction logging, card portfolio, and spend categories are prerequisites). URL scheme `maximile://` already configured in `app.json`.
**Estimated Effort**: 2-3 sprints of work compressed into a focused 2-week sprint
**Feasibility Reference**: `docs/NOTIFICATION_CAPTURE_FEASIBILITY.md` — Approach A (iOS Shortcuts Transaction Trigger)
**Infrastructure cost**: $0 (no server-side components; all processing on-device)
**App Store risk**: None — Apple-sanctioned Shortcuts API with multiple App Store precedents (TravelSpend, BalanceTrackr, MoneyCoach, Skwad)

---

### Sprint 16 — Definition of Ready (DoR) Checklist

Before any story enters the sprint, it must satisfy:

- [ ] User story has clear "As a... I want... So that..." statement
- [ ] Acceptance criteria defined and reviewed by PM + Tech Lead
- [ ] T-shirt size estimated by the team
- [ ] Dependencies identified — MVP (Sprints 1-6) fully shipped; transaction logging and card portfolio functional
- [ ] URL scheme `maximile://` confirmed in `app.json` (already exists)
- [ ] Merchant-to-category mapping approach agreed (fuzzy match on existing 7 categories)
- [ ] Apple Pay Shortcuts Transaction trigger tested manually on test device (iOS 17+)
- [ ] Downloadable `.shortcut` file format researched and prototyped

### Sprint 16 — Definition of Done (DoD) Checklist

A story is "Done" when:

- [ ] Feature works as described in all acceptance criteria
- [ ] Unit tests written and passing (happy path + key edge cases)
- [ ] Integration test confirms deep link → parse → category map → pre-fill → confirm flow
- [ ] No P0 or P1 bugs remaining
- [ ] Code committed to main branch and peer-reviewed
- [ ] Works on iOS (TestFlight) — this sprint is iOS-only
- [ ] Setup wizard tested with 3 users; >80% complete setup within 3 minutes
- [ ] Fuzzy matching correctly resolves >90% of common SG merchant names to categories
- [ ] Card name matching correctly resolves Apple Wallet card names to MaxiMile portfolio entries

---

### Sprint 16 — Stories

| ID | Story | Feature | Size | Points | Owner |
|----|-------|---------|------|--------|-------|
| **S16.1** | Deep Link Handler for Auto-Capture | F26 | M | 5 | Software Engineer |
| **S16.2** | Merchant-to-Category Mapping Engine | F26 | L | 8 | Software Engineer + Data Engineer |
| **S16.3** | Card Name Fuzzy Matching | F26 | M | 5 | Software Engineer |
| **S16.4** | Downloadable Shortcut Template | F26 | M | 5 | Developer |
| **S16.5** | In-App Setup Wizard | F26 | L | 8 | Developer + Designer |
| **S16.6** | Auto-Capture Confirmation Flow | F26 | M | 5 | Developer + Designer |
| **S16.7** | Onboarding Step 1.5 — Auto-Capture Setup | F26/F27 | S–M | 4 | Developer + Designer |
| **S16.8** | Recommendation Match Indicator | F26/F27 | M | 5 | Developer + Software Engineer |
| **S16.9** | Smart Pay → Auto-Capture Handoff | F26/F27 | M | 5 | Developer + Software Engineer |
| **Total** | | | | **50** | |

---

### Story S16.1: Deep Link Handler for Auto-Capture

> **As a** user with Apple Pay,
> **I want** MaxiMile to receive transaction data from iOS Shortcuts via a deep link,
> **So that** my Apple Pay transactions are automatically pre-filled in the transaction log.

**Priority**: P0 (Must Have — blocks all other Sprint 16 stories)
**T-Shirt Size**: **M** (Medium) — ~3 days
**Feature**: F26

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | The app is installed | A URL `maximile://log?amount=42.50&merchant=COLD+STORAGE&card=DBS+Altitude+Visa&source=shortcut` is opened | The app launches and navigates to the transaction log screen with amount, merchant, and card pre-filled |
| AC2 | The URL contains an amount parameter | The deep link is parsed | The amount is extracted as a numeric value, stripping any currency symbols (e.g., "S$42.50" → 42.50) |
| AC3 | The URL contains a merchant parameter | The deep link is parsed | The merchant name is URL-decoded and normalized (e.g., "COLD+STORAGE+GREAT+WORLD" → "Cold Storage Great World") |
| AC4 | The URL is missing required parameters (amount) | The deep link is parsed | The app opens the transaction log screen with a graceful fallback (empty form with a note: "Some data could not be captured — please fill in manually") |
| AC5 | The app is in the background or closed | The deep link is triggered | The app foregrounds or cold-launches and navigates directly to the pre-filled log screen |
| AC6 | The source=shortcut parameter is present | The transaction is logged | The transaction record includes `source = 'shortcut'` for analytics tracking |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T16.01: Register `maximile://log` deep link route in Expo Router | Software Engineer | 0.5d | None |
| T16.02: Build URL parameter parser (amount, merchant, card, source) with sanitization | Software Engineer | 0.5d | T16.01 |
| T16.03: Implement navigation from deep link to pre-filled transaction log screen | Software Engineer | 1d | T16.02 |
| T16.04: Handle edge cases: missing params, malformed URLs, app cold start | Software Engineer | 0.5d | T16.03 |
| T16.05: Unit tests — valid URL, partial URL, malformed URL, special characters in merchant names | Tester | 0.5d | T16.03 |

---

### Story S16.2: Merchant-to-Category Mapping Engine

> **As a** user,
> **I want** auto-captured transactions to show the correct spending category based on the merchant name,
> **So that** my cap tracking is accurate without me having to manually select the category every time.

**Priority**: P0 (Must Have)
**T-Shirt Size**: **L** (Large) — ~4 days
**Feature**: F26

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | A transaction from "COLD STORAGE GREAT WORLD" is received | The merchant mapper runs | The category is resolved to "Groceries" |
| AC2 | A transaction from "GRABCAR" or "GRAB TRANSPORT" is received | The merchant mapper runs | The category is resolved to "Transport" |
| AC3 | A transaction from "SUSHI TEI VIVOCITY" is received | The merchant mapper runs | The category is resolved to "Dining" |
| AC4 | A transaction from an unrecognized merchant (e.g., "ABC PTE LTD") is received | The merchant mapper runs | The category defaults to "General/Others" and the user is prompted to select the correct category |
| AC5 | The system has a merchant keyword lookup table | I query it | At minimum 200 common SG merchants are mapped to one of the 7 spend categories |
| AC6 | A user corrects a merchant's category | The correction is saved | Future transactions from that merchant use the corrected category for that user (user-level override) |
| AC7 | The fuzzy match runs | I observe performance | Category resolution completes in <100ms |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T16.06: Design merchant keyword lookup table schema (merchant_patterns: pattern, category, confidence) | Data Engineer | 0.5d | None |
| T16.07: Seed 200+ common SG merchants with category mappings (dining chains, supermarkets, transport, petrol, travel) | Data Engineer | 1d | T16.06 |
| T16.08: Implement fuzzy match engine (keyword match → Levenshtein distance fallback → default "General") | Software Engineer | 1d | T16.06 |
| T16.09: Implement user-level category override (user_merchant_overrides table) | Software Engineer | 0.5d | T16.08 |
| T16.10: Unit tests — exact match, fuzzy match, no match, user override | Tester | 0.5d | T16.08, T16.09 |
| T16.11: Performance test — 200-entry lookup completes in <100ms | Tester | 0.25d | T16.08 |

---

### Story S16.3: Card Name Fuzzy Matching

> **As a** user,
> **I want** the card name from Apple Pay (e.g., "DBS Altitude Visa") to correctly match to my MaxiMile portfolio card (e.g., "DBS Altitude"),
> **So that** auto-captured transactions are attributed to the right card without manual selection.

**Priority**: P0 (Must Have)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F26

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Apple Wallet reports "DBS Altitude Visa" and my portfolio has "DBS Altitude" | The card matcher runs | It matches with high confidence (>0.8) to "DBS Altitude" |
| AC2 | Apple Wallet reports "Citi PremierMiles Visa Signature" and my portfolio has "Citi PremierMiles" | The card matcher runs | It matches correctly, ignoring the network suffix |
| AC3 | Apple Wallet reports a card name that does not match any portfolio card | The card matcher runs | The user is shown a selection prompt: "Which card did you use?" with their portfolio listed |
| AC4 | During setup, the user verifies card name mappings | The setup wizard shows the mapping | The user can confirm or correct the Wallet → MaxiMile card mapping, which is persisted for future transactions |
| AC5 | A user has verified a card mapping | A future transaction uses that Wallet card name | The verified mapping is used directly without re-matching |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T16.12: Implement card name fuzzy matcher (normalize → tokenize → Levenshtein → threshold) | Software Engineer | 1d | None |
| T16.13: Build card_name_mappings table (wallet_name, maximile_card_id, user_id) for verified mappings | Software Engineer | 0.5d | T16.12 |
| T16.14: Implement fallback UI: "Which card did you use?" selection when confidence is low | Developer | 0.5d | T16.12, T16.03 |
| T16.15: Unit tests — exact match, partial match, no match, verified override | Tester | 0.5d | T16.12, T16.13 |

---

### Story S16.4: Downloadable Shortcut Template

> **As a** user who wants to set up Apple Pay auto-capture,
> **I want to** download a ready-made iOS Shortcut that triggers on every Apple Pay transaction and sends data to MaxiMile,
> **So that** I don't have to build the automation from scratch.

**Priority**: P0 (Must Have)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F26

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I tap "Download Shortcut" in the MaxiMile setup wizard | The `.shortcut` file is downloaded | iOS Shortcuts app opens with an import prompt showing the pre-built automation |
| AC2 | I import the Shortcut | I view its actions | The Shortcut: (1) triggers on any Apple Pay transaction, (2) extracts Amount, Merchant, Card from Shortcut Input, (3) constructs the `maximile://log` URL with parameters, (4) opens the URL |
| AC3 | I make an Apple Pay NFC payment at a store | The Shortcut fires | MaxiMile opens with amount, merchant, and card pre-filled; I confirm with one tap |
| AC4 | The Shortcut is hosted | I access the download URL | The `.shortcut` file is hosted on a stable CDN or the MaxiMile website, accessible via HTTPS |
| AC5 | A user runs iOS 17+ | They can use the Transaction trigger | The Shortcut uses the "Transaction" Personal Automation trigger available in iOS 17+ |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T16.16: Build the iOS Shortcut automation (Transaction trigger → extract vars → construct URL → open) | Developer | 1d | T16.01 (URL scheme working) |
| T16.17: Export as `.shortcut` file and host on CDN/website | Developer | 0.5d | T16.16 |
| T16.18: Test Shortcut on iOS 17 and iOS 18 devices; document any version-specific issues | Tester | 0.5d | T16.16 |

**Platform Constraint (iOS Shortcut)**: Apple does NOT allow apps to programmatically install Personal Automations. The user MUST manually tap "Add Automation" in the Shortcuts app. MaxiMile provides a fully pre-configured `.shortcut` file (user doesn't need to build anything), but the final "Add Automation" tap is an unavoidable Apple requirement. See `docs/DRD_AUTO_CAPTURE.md` Section 1.4 for details.

---

### Story S16.5: In-App Setup Wizard

> **As a** user,
> **I want to** see a step-by-step setup wizard that guides me through enabling Apple Pay auto-capture,
> **So that** I can set it up in under 3 minutes without needing external instructions.

**Priority**: P1 (Should Have)
**T-Shirt Size**: **L** (Large) — ~4 days
**Feature**: F26

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I navigate to Settings → "Auto-Capture Setup" | I see the setup wizard | Step 1: "How It Works" explanation with a visual diagram of the Apple Pay → Shortcut → MaxiMile flow |
| AC2 | I proceed to Step 2 | I see the download step | Step 2: "Download Shortcut" button + instructions to import it into the Shortcuts app |
| AC3 | I proceed to Step 3 | I see card verification | Step 3: "Verify Your Cards" — shows Apple Wallet card names detected (or asks user to enter them) alongside MaxiMile portfolio card names; user confirms or adjusts mappings |
| AC4 | I proceed to Step 4 | I see the test step | Step 4: "Test It" — instructs user to make a small Apple Pay purchase (or simulate) to verify the flow works end-to-end |
| AC5 | I complete all steps | I see a confirmation | "You're all set! Future Apple Pay transactions will be auto-logged." with a summary of mapped cards |
| AC6 | I want to skip setup for now | I can dismiss the wizard | A "Set up later" option is always visible; the wizard can be re-accessed from Settings |
| AC7 | I complete the wizard | I view my profile/settings | A badge shows "Auto-Capture: Active (iOS Shortcuts)" |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T16.19: Design setup wizard screens (4 steps: How It Works, Download, Verify Cards, Test) | Designer | 1d | None |
| T16.20: Build wizard UI — multi-step flow with progress indicator | Developer | 1.5d | T16.19 |
| T16.21: Implement card verification step — display Wallet names, match to portfolio, allow edits | Developer | 1d | T16.12 (fuzzy matcher), T16.13 (mapping table) |
| T16.22: Implement "Test It" step — listen for deep link arrival, show success/failure feedback | Developer | 0.5d | T16.03 (deep link handler) |
| T16.23: Add "Auto-Capture Setup" entry to Settings screen | Developer | 0.25d | T16.20 |
| T16.24: E2E test — wizard completion, card mapping saved, test transaction received | Tester | 0.5d | T16.20, T16.21, T16.22 |

---

### Story S16.6: Auto-Capture Confirmation Flow

> **As a** user,
> **I want to** confirm or edit auto-captured transactions before they are saved,
> **So that** I can correct any errors and maintain accurate cap tracking data.

**Priority**: P0 (Must Have)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F26

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | An Apple Pay transaction triggers the deep link | MaxiMile opens | I see a pre-filled transaction form showing: amount, merchant name, inferred category (from S16.2), matched card (from S16.3) |
| AC2 | All fields are correctly pre-filled | I tap "Confirm" | The transaction is logged in <3 seconds total interaction time; spending state and cap tracking update immediately |
| AC3 | The category is wrong | I tap the category field | I can select the correct category from the 7 options; my correction is saved as a user override for future transactions from this merchant |
| AC4 | The card match is wrong | I tap the card field | I can select the correct card from my portfolio; my correction is saved as a verified card mapping |
| AC5 | I don't want to log this transaction | I tap "Dismiss" or swipe away | The transaction is discarded; no data is saved |
| AC6 | The confirmation screen appears | I view the source indicator | I see a subtle "Via Apple Pay" badge indicating this was auto-captured, not manually entered |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T16.25: Design auto-capture confirmation screen (pre-filled form with source badge) | Designer | 0.5d | None |
| T16.26: Build confirmation UI — reuse transaction log form with pre-filled values and source badge | Developer | 0.5d | T16.25, T16.03 |
| T16.27: Wire confirm action to transaction storage + cap tracking update | Developer | 0.5d | T16.26 |
| T16.28: Wire category correction to user_merchant_overrides (S16.2) | Developer | 0.25d | T16.09, T16.26 |
| T16.29: Wire card correction to card_name_mappings (S16.3) | Developer | 0.25d | T16.13, T16.26 |
| T16.30: Integration test — full flow: deep link → parse → match → confirm → log → cap update | Tester | 0.5d | T16.27 |

---

### Story S16.7: Onboarding Step 1.5 — Auto-Capture Setup

> **As a** new user who just added my cards,
> **I want to** see an optional auto-capture setup step in onboarding (between Add Cards and Set Miles Balances),
> **So that** I can enable auto-capture from the very first session without hunting for it in Settings later.

**Priority**: P1 (Should Have)
**T-Shirt Size**: **S–M** (Small–Medium) — ~2 days
**Feature**: F26 / F27 (onboarding integration — platform-adaptive)
**DRD Reference**: `docs/DRD_AUTO_CAPTURE.md` v1.1, Section 2.1 Phase A (Onboarding Path) + Section 3.2

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I complete onboarding Step 1 (Add Your Cards) | Onboarding advances | I see new Step 1.5: "Log Without Typing" with a value-prop pitch and "Set Up Auto-Capture" CTA |
| AC2 | I am on iOS | I view Step 1.5 | The pitch reads: "Pay with Apple Pay, and MaxiMile logs it for you." CTA: "Set Up Auto-Capture" (opens the setup wizard inline) |
| AC3 | I am on Android | I view Step 1.5 | The pitch reads: "MaxiMile reads your banking notifications to log transactions automatically." CTA: "Enable Auto-Capture" (opens privacy disclosure) |
| AC4 | I don't want to set up now | I tap "I'll do this later" | Onboarding proceeds to Step 2 (Set Miles Balances); auto-capture status defaults to inactive |
| AC5 | I skipped during onboarding | I go to Settings → Auto-Capture | The same setup flow is available and fully functional |
| AC6 | I complete auto-capture setup from Step 1.5 | Onboarding advances | Onboarding proceeds to Step 2; auto-capture status is now "Active" in Settings |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T16.31: Design onboarding Step 1.5 screen — platform-adaptive layout (iOS Apple Pay variant, Android Notification variant) | Designer | 0.5d | None |
| T16.32: Build Step 1.5 screen in onboarding flow — insert between Add Cards and Set Miles Balances | Developer | 0.5d | T16.31 |
| T16.33: Implement platform detection — show iOS (Apple Pay) or Android (Notifications) copy and CTA | Developer | 0.25d | T16.32 |
| T16.34: Wire "Set Up Auto-Capture" CTA to setup wizard (iOS) or privacy disclosure (Android) | Developer | 0.25d | T16.20, T17.17 |
| T16.35: Wire "I'll do this later" skip to proceed to Step 2 (Miles Balances) | Developer | 0.25d | T16.32 |
| T16.36: Pass auto-capture status to Step 2 via route params (same pattern as cardIds) | Developer | 0.25d | T16.34 |
| T16.37: E2E test — onboarding: Add Cards → Step 1.5 → setup → Step 2; also skip path | Tester | 0.5d | T16.32, T16.34, T16.35 |

---

### Story S16.8: Recommendation Match Indicator on Confirmation Screen

> **As a** user who just auto-captured a transaction,
> **I want to** see whether the card I used was the best option for that spending category,
> **So that** I learn from every transaction and gradually build the habit of using the optimal card.

**Priority**: P1 (Should Have)
**T-Shirt Size**: **M** (Medium) — ~3 days
**Feature**: F26 / F27 (cross-platform — shared confirmation screen component)
**DRD Reference**: `docs/DRD_AUTO_CAPTURE.md` v1.1, Section 3.2.3 (Recommendation Match Indicator) + Section 4.1 (Confirmation Screen Layout)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | An auto-captured transaction with category "Groceries" and card "DBS Altitude" is on the confirmation screen | The system calls `recommend('Groceries')` RPC | The top recommended card for Groceries is retrieved and compared with the auto-captured card |
| AC2 | The auto-captured card matches the recommended card | The confirmation screen renders | A green banner shows: "You used the best card! DBS Altitude earns X mpd for Groceries (vs Y avg)" |
| AC3 | The auto-captured card does NOT match the recommended card | The confirmation screen renders | A blue "Tip" nudge shows: "[Best card] earns X mpd for [Category] (vs Y for this card). Try it next time!" |
| AC4 | The recommended card has its cap exhausted for this category | The confirmation screen renders | The recommendation match banner is hidden (the recommendation would have changed anyway) |
| AC5 | The inferred category is "General/Others" or could not be determined | The confirmation screen renders | The recommendation match banner is hidden (category too ambiguous for a meaningful recommendation) |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T16.38: Design recommendation match banner — green "best card" variant and blue "tip" nudge variant | Designer | 0.5d | T16.25 |
| T16.39: Implement `recommend(category)` call on confirmation screen load — reuse existing RPC, no new endpoint | Software Engineer | 0.5d | T16.26, T2.08 (existing RPC) |
| T16.40: Implement match comparison logic — compare auto-captured card_id vs recommended card_id | Software Engineer | 0.25d | T16.39 |
| T16.41: Build match banner UI — green variant (match), blue variant (mismatch), hidden state (cap exhausted / ambiguous category) | Developer | 0.5d | T16.38, T16.40 |
| T16.42: Wire banner to confirmation screen — insert below card field, above action buttons | Developer | 0.25d | T16.41, T16.26 |
| T16.43: Unit tests — match, mismatch, cap exhausted, ambiguous category | Tester | 0.5d | T16.40, T16.41 |
| T16.44: Analytics events — track `auto_capture_recommendation_match` and `auto_capture_recommendation_nudge_shown` | Developer | 0.25d | T16.42 |

---

### Story S16.9: Smart Pay → Auto-Capture Handoff

> **As a** user who just paid via the Smart Pay flow (Wallet opened → tapped card),
> **I want** the app to automatically detect the auto-captured transaction instead of asking me to enter the amount manually,
> **So that** the Smart Pay → Wallet → Log loop closes seamlessly without redundant data entry.

**Priority**: P1 (Should Have)
**T-Shirt Size**: **M** (Medium) — ~3 days
**Feature**: F26 / F27 (cross-platform — Smart Pay integration)
**DRD Reference**: `docs/DRD_AUTO_CAPTURE.md` v1.1, Section 3.2.4 (Smart Pay → Auto-Capture Handoff)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I am in the Smart Pay flow and have just returned from Wallet after paying | The app detects my return | The app listens for an incoming auto-capture deep link or notification for up to 60 seconds |
| AC2 | An auto-capture event fires within the 60-second window | The Smart Pay flow detects it | Smart Pay skips its manual amount entry step and navigates to the auto-capture confirmation screen instead |
| AC3 | The auto-capture confirmation screen appears via Smart Pay handoff | I view the screen | The source badge shows dual attribution (e.g., "Via Apple Pay" + "Smart Pay"); the recommendation match indicator is pre-populated (Smart Pay already knows which card was recommended) |
| AC4 | No auto-capture event fires within 60 seconds | The timer expires | The Smart Pay flow falls back to its existing manual logging step (amount keypad with category + card pre-filled) |
| AC5 | The handoff transaction is logged | I view the transaction in history | The `source` field is `shortcut_smart_pay` (iOS) or `notification_smart_pay` (Android) |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T16.45: Implement 60-second listener in Smart Pay State 5→6 transition — listen for incoming deep link / notification event | Software Engineer | 1d | T16.03 (deep link handler), Smart Pay flow (existing) |
| T16.46: Implement handoff logic — if auto-capture fires within 60s, skip manual entry and navigate to auto-capture confirmation | Software Engineer | 0.5d | T16.45, T16.26 |
| T16.47: Pass Smart Pay recommendation context to confirmation screen — pre-populate match indicator with the card that was recommended | Developer | 0.5d | T16.46, T16.39 |
| T16.48: Add dual source badge — "Via Apple Pay" + "Smart Pay" (or "Via Bank Notification" + "Smart Pay") | Developer | 0.25d | T16.46, T16.26 |
| T16.49: Implement 60-second timeout fallback — if no auto-capture, resume existing manual flow | Software Engineer | 0.25d | T16.45 |
| T16.50: Set transaction source to `shortcut_smart_pay` or `notification_smart_pay` for handoff transactions | Developer | 0.25d | T16.46 |
| T16.51: Integration test — Smart Pay → Wallet → return → auto-capture fires → confirmation → log; also timeout fallback path | Tester | 0.5d | T16.46, T16.49 |
| T16.52: Analytics event — track `smart_pay_auto_capture_handoff` | Developer | 0.25d | T16.46 |

---

### Sprint 16 — Dependencies Map

```
                                SPRINT 16 DEPENDENCY FLOW
                                =========================

S16.1 Deep Link Handler ──────────────────────────────────────────────────────┐
  T16.01 Register route                                                       │
    ↓                                                                         │
  T16.02 URL parser                                                           │
    ↓                                                                         │
  T16.03 Navigate to pre-filled form ──→ T16.04 Edge cases                    │
    ↓                                         ↓                               │
  T16.05 Unit tests                      T16.14 Fallback card UI              │
                                                                              │
S16.2 Merchant→Category Mapping ◄──── (can parallel with S16.1) ─────────────┤
  T16.06 Schema                                                               │
    ↓                                                                         │
  T16.07 Seed 200+ merchants                                                  │
  T16.08 Fuzzy match engine ──→ T16.09 User overrides                         │
    ↓                                 ↓                                       │
  T16.10 Unit tests              T16.11 Performance test                      │
                                                                              │
S16.3 Card Name Matching ◄──── (can parallel with S16.1 + S16.2) ────────────┤
  T16.12 Fuzzy matcher ──→ T16.13 Mapping table                              │
    ↓                          ↓                                              │
  T16.14 Fallback UI      T16.15 Unit tests                                  │
                                                                              │
S16.4 Shortcut Template ◄──── (BLOCKED until S16.1 URL scheme working) ──────┤
  T16.16 Build Shortcut ──→ T16.17 Host .shortcut file                        │
    ↓                                                                         │
  T16.18 Test on iOS 17/18                                                    │
                                                                              │
S16.5 Setup Wizard ◄──── (BLOCKED until S16.3 + S16.4 complete) ─────────────┤
  T16.19 Design ──→ T16.20 Build UI ──→ T16.21 Card verification step        │
                                    ──→ T16.22 Test step                      │
                                    ──→ T16.23 Settings entry                 │
                                         ↓                                    │
                                    T16.24 E2E test                           │
                                                                              │
S16.6 Confirmation Flow ◄──── (BLOCKED until S16.1 + S16.2 + S16.3) ────────┘
  T16.25 Design ──→ T16.26 Build UI ──→ T16.27 Confirm + log
                                    ──→ T16.28 Category correction
                                    ──→ T16.29 Card correction
                                         ↓
                                    T16.30 Integration test (full flow)

S16.7 Onboarding Step 1.5 ◄──── (BLOCKED until S16.5 wizard + S17.3 privacy)
  T16.31 Design ──→ T16.32 Build Step 1.5 ──→ T16.33 Platform detect
                                           ──→ T16.34 Wire CTA to wizard/privacy
                                           ──→ T16.35 Skip path
                                           ──→ T16.36 Route params
                                                ↓
                                           T16.37 E2E test

S16.8 Recommendation Match ◄──── (BLOCKED until S16.6 confirmation + recommend RPC)
  T16.38 Design ──→ T16.39 Call recommend() ──→ T16.40 Match logic
                                                  ↓
                 T16.41 Banner UI ──→ T16.42 Wire to confirmation
                                          ↓
                                    T16.43 Unit tests
                                    T16.44 Analytics

S16.9 Smart Pay Handoff ◄──── (BLOCKED until S16.6 confirmation + S16.8 match indicator)
  T16.45 60s listener ──→ T16.46 Handoff logic ──→ T16.47 Pass recommendation context
                                               ──→ T16.48 Dual source badge
                                               ──→ T16.50 Source field
  T16.49 Timeout fallback ──────────────────────┘
                                                    ↓
                                               T16.51 Integration test
                                               T16.52 Analytics
```

**Critical Path**: S16.1 (deep link) + S16.2 (merchant mapping) + S16.3 (card matching) → S16.6 (confirmation) → S16.8 (match indicator) → S16.9 (Smart Pay handoff)

**Parallel Tracks**:
- S16.1, S16.2, and S16.3 can all proceed in parallel from Day 1
- S16.4 requires only S16.1 (URL scheme) and can start by Day 3
- S16.5 and S16.6 require S16.1 + S16.2 + S16.3 and start in the second week
- S16.7 (onboarding) requires S16.5 (wizard) and can proceed in parallel with S16.8/S16.9
- S16.8 (match indicator) requires S16.6 (confirmation) and the existing recommend() RPC
- S16.9 (Smart Pay handoff) requires S16.6 + S16.8 and the existing Smart Pay flow

---

### Sprint 16 — Risks & Mitigations

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R16.1 | Card names in Apple Wallet vary by bank/card network — fuzzy matching has low accuracy | **Medium** | **High** | Build verified card_name_mappings table; during setup wizard, user confirms each mapping once; use confirmed mappings for all future transactions |
| R16.2 | Merchant names from Apple Pay are abbreviated/encoded (e.g., "NTUC FP-JURONG PT" instead of "NTUC FairPrice Jurong Point") — category mapping fails | **Medium** | **High** | Seed merchant patterns table with common SG abbreviations; implement keyword-based matching (not just exact string match); allow user corrections that persist |
| R16.3 | iOS 18 intermittently fails to trigger Shortcuts on Apple Pay transactions (known Apple bug) | **Medium** | **Medium** | Document the limitation; build a "retry" manual trigger within the Shortcut; monitor Apple developer forums for fix; provide manual log fallback |
| R16.4 | Users struggle with Shortcuts setup despite wizard | **Medium** | **High** | Provide downloadable `.shortcut` file (one-tap import); video walkthrough in wizard; test with 3 non-technical users before launch |
| R16.5 | Scope creep — team wants to add auto-confirmation mode (skip confirm tap) | **High** | **Medium** | Strict scope: Sprint 16 is always-confirm mode. Auto-confirm is a P2 enhancement for a future sprint. |
| R16.6 | Coverage disappointment — users expect ALL transactions captured, not just Apple Pay NFC | **Medium** | **High** | Clear messaging in setup wizard: "Works with Apple Pay contactless payments at stores. Online and physical card transactions still require manual logging." |

---

## Sprint 17: "Smart Logging: Android" (F27 — Android Notification Auto-Capture)

**Duration**: 2 weeks (10 working days)
**Sprint Goal**: Android users can have their banking app transaction notifications automatically parsed and pre-filled in MaxiMile's transaction log, providing cross-platform auto-capture coverage. This sprint delivers the NotificationListenerService native module, SG bank notification regex parsers, privacy/permission flows, and Google Pay notification support.
**Epic**: E12 — Transaction Auto-Capture
**PRD Features**: F27 (Android Notification Auto-Capture)
**Prerequisite**: Sprint 16 complete (merchant→category mapping engine, card matching, and confirmation flow are reused). Also requires Expo Dev Build (not compatible with Expo Go).
**Estimated Effort**: 3-4 sprints of work compressed into a focused 2-week sprint; overflow tasks may spill into Sprint 18
**Feasibility Reference**: `docs/NOTIFICATION_CAPTURE_FEASIBILITY.md` — Approach C (Android NotificationListenerService)
**Infrastructure cost**: $0 (all processing on-device; no server-side notification storage)
**Play Store risk**: Medium — requires prominent privacy disclosure under Google Play Data Safety; `BIND_NOTIFICATION_LISTENER_SERVICE` permission requires justification. Multiple Play Store precedents exist (FinArt 1M+, Walnut 5M+, PennyWise).

---

### Sprint 17 — Definition of Ready (DoR) Checklist

Before any story enters the sprint, it must satisfy:

- [ ] User story has clear "As a... I want... So that..." statement
- [ ] Acceptance criteria defined and reviewed by PM + Tech Lead
- [ ] T-shirt size estimated by the team
- [ ] Dependencies identified — Sprint 16 fully shipped; merchant→category mapping and card matching are reusable
- [ ] Expo Dev Build configured (cannot use Expo Go for native notification module)
- [ ] `react-native-notification-listener` community package evaluated and compatible with current RN version
- [ ] SG bank notification formats documented with sample text (DBS, OCBC, UOB, Citi, AMEX — per feasibility doc Section 4.2)
- [ ] Privacy disclosure text drafted and reviewed by PM/legal
- [ ] Google Play Data Safety section requirements documented

### Sprint 17 — Definition of Done (DoD) Checklist

A story is "Done" when:

- [ ] Feature works as described in all acceptance criteria
- [ ] Unit tests written and passing (happy path + key edge cases per bank format)
- [ ] Integration test confirms notification → parse → category map → pre-fill → confirm flow
- [ ] No P0 or P1 bugs remaining
- [ ] Code committed to main branch and peer-reviewed
- [ ] Works on Android (APK via Expo Dev Build) — this sprint is Android-only
- [ ] Privacy disclosure displayed and consent captured before notification access is requested
- [ ] Battery impact measured: background service adds <2% additional drain per day
- [ ] All 5 SG bank notification formats correctly parsed (DBS, OCBC, UOB, Citi, AMEX)

---

### Sprint 17 — Stories

| ID | Story | Feature | Size | Points | Owner |
|----|-------|---------|------|--------|-------|
| **S17.1** | NotificationListenerService Native Module | F27 | XL | 13 | Software Engineer (native) |
| **S17.2** | SG Bank Notification Regex Parsers | F27 | L | 8 | Software Engineer + Data Engineer |
| **S17.3** | Privacy Disclosure & Permission Flow | F27 | M | 5 | Developer + Designer |
| **S17.4** | Google Pay Notification Parsing | F27 | M | 5 | Software Engineer |
| **S17.5** | Android Auto-Capture E2E Testing | F27 | M | 5 | Tester |
| **Total** | | | | **36** | |

---

### Story S17.1: NotificationListenerService Native Module

> **As an** Android user,
> **I want** MaxiMile to read my banking app notifications in the background,
> **So that** my credit card transactions are automatically detected and pre-filled for logging.

**Priority**: P0 (Must Have — blocks all other Sprint 17 stories)
**T-Shirt Size**: **XL** (Extra Large) — ~5 days
**Feature**: F27

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have granted notification access permission | A banking app sends a transaction notification | MaxiMile's NotificationListenerService receives the notification content (title, text, sub-text, extras) |
| AC2 | The service receives a notification | It checks the source package | Only notifications from whitelisted banking app packages (DBS, OCBC, UOB, Citi, AMEX) are processed; all others are ignored |
| AC3 | The service receives a matching notification | It processes the text | The notification text is passed to the JavaScript layer via the React Native bridge for regex parsing |
| AC4 | The app is in the background or closed | A banking notification arrives | The service still receives and processes it (foreground service behavior) |
| AC5 | The service is running | I check battery usage | The service adds less than 2% additional battery drain per day (efficient filtering — only process whitelisted packages) |
| AC6 | The native module is integrated | I build the app | The Expo config plugin correctly adds the NotificationListenerService to the Android manifest |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T17.01: Evaluate and integrate `react-native-notification-listener` package (or build custom native module) | Software Engineer | 1d | None |
| T17.02: Create Expo config plugin to register NotificationListenerService in AndroidManifest.xml | Software Engineer | 1d | T17.01 |
| T17.03: Implement notification filter — whitelist banking app package names (com.dbs.*, com.ocbc.*, etc.) | Software Engineer | 0.5d | T17.01 |
| T17.04: Build React Native bridge — forward notification text from native to JS layer | Software Engineer | 1d | T17.01 |
| T17.05: Implement efficient background processing (batch notifications, debounce rapid-fire alerts) | Software Engineer | 0.5d | T17.04 |
| T17.06: Battery impact testing — measure drain with service active over 24 hours | Tester | 0.5d | T17.04 |
| T17.07: Build EAS Dev Build with native module; verify on 3 Android devices (Samsung, Pixel, Xiaomi) | Developer | 0.5d | T17.02 |

---

### Story S17.2: SG Bank Notification Regex Parsers

> **As an** Android user with Singapore bank cards,
> **I want** MaxiMile to correctly parse the amount, merchant, and card from my banking notifications,
> **So that** auto-captured transactions have accurate data.

**Priority**: P0 (Must Have)
**T-Shirt Size**: **L** (Large) — ~4 days
**Feature**: F27

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | DBS sends: "Your DBS/POSB Card ending 1234 was used for SGD 42.50 at COLD STORAGE on 21 Feb" | The parser processes it | Amount = 42.50, merchant = "COLD STORAGE", card_last4 = "1234", bank = "DBS" |
| AC2 | OCBC sends: "Card xxxx1234 txn SGD 42.50 at MERCHANT NAME on 21/02" | The parser processes it | Amount = 42.50, merchant = "MERCHANT NAME", card_last4 = "1234", bank = "OCBC" |
| AC3 | UOB sends: "UOB Card ending 1234: SGD 42.50 at MERCHANT. Date: 21 Feb 2026" | The parser processes it | Amount = 42.50, merchant = "MERCHANT", card_last4 = "1234", bank = "UOB" |
| AC4 | Citi sends: "Citi Card x1234 SGD 42.50 MERCHANT NAME 21FEB" | The parser processes it | Amount = 42.50, merchant = "MERCHANT NAME", card_last4 = "1234", bank = "Citi" |
| AC5 | AMEX sends: "A charge of SGD 42.50 was made on your AMEX card ending 1234 at MERCHANT" | The parser processes it | Amount = 42.50, merchant = "MERCHANT", card_last4 = "1234", bank = "AMEX" |
| AC6 | A notification format doesn't match any known regex | The parser processes it | The notification is silently ignored (not an error); logged for future format analysis |
| AC7 | The parsed card_last4 is available | The system matches to portfolio | The card_last4 is matched against the user's portfolio cards (user must have entered last 4 digits during card setup, or this is matched via bank + card type) |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T17.08: Collect 10+ sample notifications per bank (DBS, OCBC, UOB, Citi, AMEX) — real and documented formats | Data Engineer | 1d | None |
| T17.09: Write regex parser for DBS notification format (with variants for DBS/POSB cards) | Software Engineer | 0.5d | T17.08 |
| T17.10: Write regex parser for OCBC notification format | Software Engineer | 0.5d | T17.08 |
| T17.11: Write regex parser for UOB notification format | Software Engineer | 0.5d | T17.08 |
| T17.12: Write regex parser for Citi notification format | Software Engineer | 0.5d | T17.08 |
| T17.13: Write regex parser for AMEX notification format | Software Engineer | 0.5d | T17.08 |
| T17.14: Implement parser router — detect bank from package name, route to correct regex | Software Engineer | 0.5d | T17.09–T17.13 |
| T17.15: Unit tests — 5+ test cases per bank format (normal, edge cases, foreign currency, declined) | Tester | 1d | T17.09–T17.14 |

---

### Story S17.3: Privacy Disclosure & Permission Flow

> **As a** user,
> **I want** clear privacy disclosures about what notification data MaxiMile accesses and how it is used,
> **So that** I can make an informed decision about granting notification access.

**Priority**: P0 (Must Have — required by Google Play policy)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F27

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I tap "Enable Auto-Capture" on Android | I see a privacy disclosure screen | The screen clearly states: (1) what data is accessed (banking notification text only), (2) what is extracted (amount, merchant, card), (3) that all processing happens on-device, (4) that no raw notification content is stored or uploaded |
| AC2 | I read the disclosure and tap "Grant Access" | The Android notification access settings open | I am taken directly to the notification access permission screen for MaxiMile |
| AC3 | I grant the permission and return to MaxiMile | The app detects the permission | A confirmation screen shows: "Auto-capture is now active. Your banking notifications will be used to pre-fill transactions." |
| AC4 | I do not grant the permission | I return to MaxiMile | The app shows a graceful fallback: "No problem — you can always log transactions manually. You can enable auto-capture later in Settings." |
| AC5 | I want to revoke access later | I go to MaxiMile Settings → Auto-Capture | I see a toggle to disable auto-capture, with a link to Android notification access settings for full revocation |
| AC6 | Google Play Data Safety section | The app listing is reviewed | Notification access is disclosed under "Data collected" with purpose "App functionality — transaction logging" |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T17.16: Design privacy disclosure screen (what, why, how, on-device badge) | Designer | 0.5d | None |
| T17.17: Build privacy disclosure UI with "Grant Access" and "Not Now" buttons | Developer | 0.5d | T17.16 |
| T17.18: Implement permission check + deep link to Android notification access settings | Developer | 0.5d | T17.01 |
| T17.19: Implement permission state detection (granted/denied) with appropriate UI feedback | Developer | 0.5d | T17.18 |
| T17.20: Add auto-capture toggle + revocation link to Settings screen | Developer | 0.25d | T17.19 |
| T17.21: Draft Google Play Data Safety disclosure text for notification access | PM | 0.25d | None |

---

### Story S17.4: Google Pay Notification Parsing

> **As an** Android user who pays with Google Pay,
> **I want** my Google Pay transaction notifications to be auto-captured,
> **So that** mobile wallet payments are logged just like banking app notifications.

**Priority**: P1 (Should Have)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F27

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I make a Google Pay NFC payment | Google Pay sends a notification | MaxiMile captures the notification and parses: amount, merchant, and partial card info |
| AC2 | The Google Pay notification contains amount and merchant | The parser processes it | Amount and merchant are correctly extracted; card is matched via last-4-digits if available |
| AC3 | The Google Pay notification format changes | The parser encounters an unrecognized format | The notification is silently logged for future analysis; not treated as an error |
| AC4 | Google Pay and the banking app both send notifications for the same transaction | Both are received | MaxiMile deduplicates: only one pre-filled transaction is shown (prefer the one with more data) |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T17.22: Collect Google Pay notification samples (10+); document format variations | Data Engineer | 0.5d | None |
| T17.23: Write regex parser for Google Pay notification format | Software Engineer | 0.5d | T17.22 |
| T17.24: Add Google Pay package to notification whitelist | Software Engineer | 0.25d | T17.03 |
| T17.25: Implement dedup logic — same amount + merchant + timestamp within 60 seconds = duplicate | Software Engineer | 0.5d | T17.14, T17.23 |
| T17.26: Unit tests — Google Pay parsing, dedup with banking notification | Tester | 0.5d | T17.23, T17.25 |

---

### Story S17.5: Android Auto-Capture E2E Testing

> **As a** tester,
> **I want to** validate the full Android auto-capture flow end-to-end across all 5 banks and Google Pay,
> **So that** we can ship with confidence that the feature works reliably.

**Priority**: P0 (Must Have)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F27

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | All parsers are implemented | I run the test suite | Tests cover all 5 bank formats + Google Pay with 5+ cases each (standard, edge cases, foreign currency, declined) |
| AC2 | The full flow is tested | I simulate a DBS notification | The notification is received → parsed → merchant mapped to category → card matched → confirmation screen shown with correct pre-filled data |
| AC3 | Battery tests are complete | I review results | Background service adds <2% battery drain over 24 hours on test devices |
| AC4 | Permission flow is tested | I test grant and deny paths | Both paths work correctly: granted → service starts; denied → graceful fallback shown |
| AC5 | Sprint 16 features still work on iOS | I run regression tests | iOS Shortcuts auto-capture is unaffected by Sprint 17 changes |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T17.27: Write E2E test suite — notification → parse → map → match → confirm → log for each bank | Tester | 1d | T17.14, T16.08, T16.12 |
| T17.28: Test permission flow — grant, deny, revoke, re-grant | Tester | 0.25d | T17.19 |
| T17.29: Battery impact test — 24-hour test with service active on 3 devices | Tester | 0.5d | T17.05 |
| T17.30: Regression test — Sprint 16 iOS features + existing transaction logging unaffected | Tester | 0.5d | All Sprint 17 stories |

---

### Sprint 17 — Dependencies Map

```
                                SPRINT 17 DEPENDENCY FLOW
                                =========================

PREREQUISITE: Sprint 16 complete (deep link handler, merchant→category mapping,
              card matching, confirmation flow — all reused on Android)
                                        │
                                        ▼
S17.1 NotificationListenerService ─────────────────────────────────────────────┐
  T17.01 Integrate native module                                               │
    ↓                                                                         │
  T17.02 Expo config plugin                                                    │
    ↓                                                                         │
  T17.03 Package whitelist ──→ T17.04 RN bridge ──→ T17.05 Background opt     │
    │                                   ↓                                     │
    │                              T17.06 Battery test                        │
    │                              T17.07 Dev build test                      │
    │                                                                         │
S17.2 Bank Parsers ◄──── (BLOCKED until S17.1 bridge working) ───────────────┤
  T17.08 Sample collection                                                     │
    ↓                                                                         │
  T17.09 DBS parser ──┐                                                        │
  T17.10 OCBC parser ─┤                                                        │
  T17.11 UOB parser ──┼──→ T17.14 Parser router ──→ T17.15 Unit tests         │
  T17.12 Citi parser ─┤                                                        │
  T17.13 AMEX parser ─┘                                                        │
                                                                              │
S17.3 Privacy & Permissions ◄──── (can parallel with S17.2) ─────────────────┤
  T17.16 Design ──→ T17.17 Build UI ──→ T17.18 Permission deep link           │
                                    ──→ T17.19 Permission detection            │
                                    ──→ T17.20 Settings toggle                 │
  T17.21 Data Safety text (parallel)                                           │
                                                                              │
S17.4 Google Pay ◄──── (BLOCKED until S17.1 + S17.2 parser infra) ───────────┤
  T17.22 Sample collection                                                     │
  T17.23 Google Pay parser                                                     │
  T17.24 Package whitelist ──→ T17.25 Dedup logic                              │
  T17.26 Unit tests                                                            │
                                                                              │
S17.5 E2E Testing ◄──── (BLOCKED until S17.1-S17.4 complete) ────────────────┘
  T17.27 E2E test suite (all banks + GPay)
  T17.28 Permission flow tests
  T17.29 Battery impact test
  T17.30 Regression test (Sprint 16 iOS + existing features)
```

**Critical Path**: S17.1 (native module) → S17.2 (bank parsers) → S17.5 (E2E testing)

**Parallel Tracks**:
- S17.3 (privacy/permissions) can proceed in parallel with S17.2 once S17.1 is started
- S17.4 (Google Pay) can proceed in parallel with S17.3 once S17.2 parser infra exists
- T17.08 (sample collection) can start Day 1, independent of native module work

---

### Sprint 17 — Risks & Mitigations

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R17.1 | `react-native-notification-listener` package is incompatible with current Expo/RN version | **Medium** | **High** | Evaluate on Day 1; fallback to building custom native module (adds ~2 days); consider `expo-notification-listener` if available |
| R17.2 | SG bank notification formats change without notice — parsers break | **Medium** | **High** | Build format versioning; log unrecognized notifications for analysis; enable community format reporting (tie into Sprint 13 community submissions); design parsers to be regex-configurable without code changes |
| R17.3 | Google Play rejects the app for notification access without sufficient justification | **Low** | **Critical** | Draft comprehensive Data Safety disclosure; emphasize on-device-only processing; cite Play Store precedents (FinArt, Walnut); prepare appeal with documentation |
| R17.4 | Battery drain exceeds 2% threshold on some Android devices (OEM-specific background service behavior) | **Medium** | **Medium** | Test on Samsung, Pixel, Xiaomi (top 3 SG Android brands); implement adaptive polling; add battery usage monitoring in Settings; allow user to disable if concerned |
| R17.5 | Duplicate notifications from Google Pay + banking app confuse users (two confirmation prompts) | **Medium** | **Medium** | T17.25 dedup logic: same amount + merchant within 60-second window = duplicate; prefer the notification with more data fields |
| R17.6 | Sprint scope overflow — 36 story points may not fit in 2 weeks given native module complexity | **High** | **Medium** | Prioritize: S17.1 → S17.2 → S17.3 are P0; S17.4 (Google Pay) can spill to Sprint 18; E2E testing (S17.5) is non-negotiable |

---

### Sprint 16 + 17 Combined Timeline

```
SPRINT 16 (Weeks 1–2)                    SPRINT 17 (Weeks 3–4)
"Smart Logging: iOS"                     "Smart Logging: Android"
═══════════════════                      ═══════════════════
Day 1–3:  S16.1 Deep link handler        Day 1–3:  S17.1 Native module + config plugin
Day 1–4:  S16.2 Merchant→category map    Day 1:    T17.08 Bank notification samples
Day 1–2:  S16.3 Card name matching       Day 3–6:  S17.2 Bank regex parsers (5 banks)
Day 3–5:  S16.4 Shortcut template        Day 3–5:  S17.3 Privacy disclosure + permissions
Day 5–8:  S16.5 Setup wizard             Day 5–7:  S17.4 Google Pay parsing + dedup
Day 5–8:  S16.6 Confirmation flow        Day 7–9:  S17.5 E2E testing (all banks + GPay)
Day 6–7:  S16.7 Onboarding Step 1.5      Day 9:    Battery impact testing
Day 7–8:  S16.8 Recommendation match     Day 10:   Regression testing + stabilize
Day 8–9:  S16.9 Smart Pay handoff                  + ship v2.0 beta
Day 9–10: Integration testing + fixes
```

---

## Sprint 18: "Demo Mode" (F28 — Environment-Controlled Mock Data)

**Duration**: 2 weeks (10 working days)
**Sprint Goal**: Enable professional product demonstrations without real Apple Pay transactions through environment-controlled mock transaction data injection. Essential for investor presentations, sales demos, and TestFlight/EAS Build testing.
**Epic**: Standalone (F28)
**PRD Feature**: F28 (Demo Mode)
**Prerequisites**: Sprint 16 complete (auto-capture flow and deep link handler available for integration)
**Estimated Effort**: 1 week of core work + 1 week polish & documentation
**Infrastructure cost**: $0 (all mock data generation on-device; no external services)
**Distribution**: EAS Build internal distribution (no App Store submission required for demo builds)
**Platform Support**: Cross-platform (iOS and Android) — demo mode implementation is platform-agnostic; works identically on both platforms with same build command (`eas build --profile demo --platform [ios|android]`)

---

### Sprint 18 — Definition of Ready (DoR) Checklist

Before any story enters the sprint, it must satisfy:

- [ ] User story has clear "As a... I want... So that..." statement
- [ ] Acceptance criteria defined and reviewed by PM
- [ ] T-shirt size estimated
- [ ] Dependencies identified — Sprint 16 shipped (deep link handler available)
- [ ] No UI changes required (purely environment variable + backend logic)
- [ ] EAS Build configured (already complete from previous sprints)
- [ ] Detailed demo mode PRD available (`docs/PRD_DEMO_MODE.md`)
- [ ] Merchant data sourced and realistic price ranges defined

### Sprint 18 — Definition of Done (DoD) Checklist

A story is "Done" when:

- [ ] Feature works as described in all acceptance criteria
- [ ] Unit tests written and passing (mock data generator, demo mode toggle)
- [ ] Integration test confirms: demo build → trigger shortcut → mock data appears → confirm flow works
- [ ] No P0 or P1 bugs remaining
- [ ] Code committed to main branch via feature branch (feat/demo-mode)
- [ ] Works in EAS Build demo profile (`eas build --profile demo --platform ios`)
- [ ] Production builds unaffected (demo mode disabled via `EXPO_PUBLIC_DEMO_MODE=false`)
- [ ] Documentation complete (`docs/DEMO_MODE.md` with build instructions, usage guide, FAQ)
- [ ] Demo build successfully distributed internally and tested on real device

---

### Sprint 18 — Stories

| ID | Story | Feature | Size | Points | Owner |
|----|-------|---------|------|--------|-------|
| **S18.1** | Environment Variable Configuration | F28 | XS | 1 | Developer |
| **S18.2** | Mock Transaction Generator | F28 | M | 5 | Developer |
| **S18.3** | Deep Link Handler Demo Mode Integration | F28 | S | 3 | Developer |
| **S18.4** | EAS Build Demo Profile | F28 | S | 2 | Developer |
| **S18.5** | Demo Mode Documentation | F28 | S | 3 | Developer |
| **Total** | | | | **14** | |

---

### Story S18.1: Environment Variable Configuration

> **As a** developer,
> **I want** to configure demo mode via environment variables in the build system,
> **So that** we can build separate demo and production app versions without code changes.

**Priority**: P0 (Must Have — foundation for all other stories)
**T-Shirt Size**: **XS** (Extra Small) — ~2 hours
**Feature**: F28

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I create `.env.demo` file | The file contains `EXPO_PUBLIC_DEMO_MODE=true` | Environment variable is set for demo builds |
| AC2 | I create `.env.production` file | The file contains `EXPO_PUBLIC_DEMO_MODE=false` | Environment variable is set for production builds |
| AC3 | The app code reads the variable | It accesses `process.env.EXPO_PUBLIC_DEMO_MODE` | The value is correctly available at runtime |
| AC4 | `.gitignore` is updated | Both `.env.demo` and `.env.production` are allowed | The template files are committed to the repo (not ignored like `.env.local`) |
| AC5 | Demo mode is not set | The app defaults | App behaves as production (demo mode defaults to false) |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T18.01: Create `.env.demo` with `EXPO_PUBLIC_DEMO_MODE=true` | Developer | 0.25h | None |
| T18.02: Create `.env.production` with `EXPO_PUBLIC_DEMO_MODE=false` | Developer | 0.25h | None |
| T18.03: Update `.gitignore` to allow `.env.demo` and `.env.production` (add `!.env.demo` and `!.env.production`) | Developer | 0.25h | None |
| T18.04: Add helper function `isDemoMode()` in `lib/demo-data.ts` | Developer | 0.5h | None |
| T18.05: Test environment variable in both demo and production builds | Developer | 0.5h | T18.01–T18.04 |

---

### Story S18.2: Mock Transaction Generator

> **As a** demo presenter,
> **I want** the app to generate realistic mock transaction data,
> **So that** demos feel authentic and showcase the product effectively.

**Priority**: P0 (Must Have)
**T-Shirt Size**: **M** (Medium) — ~1 day
**Feature**: F28

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I call `generateMockTransaction()` | No parameters provided | Returns a random transaction with merchant, amount, card, timestamp, and source='demo' |
| AC2 | The merchant list is seeded | The generator selects a merchant | Merchant name is realistic (e.g., "Starbucks", "Shell", "Whole Foods") from 44+ options across 6 categories |
| AC3 | Each merchant has a category | The generator selects a merchant | The amount is realistic for that merchant type (e.g., Coffee: $3.50–$14.00, Gas: $32–$90) |
| AC4 | The user has cards in their portfolio | `userCards` array is passed | The generator randomly selects one of the user's actual cards |
| AC5 | The user has no cards | No `userCards` provided | The generator falls back to common mock card names (e.g., "Chase Sapphire Reserve", "Amex Gold") |
| AC6 | Multiple calls are made | The function is called repeatedly | Each call returns different randomized data (merchant, amount, card vary) |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T18.06: Create `lib/demo-data.ts` with TypeScript interfaces (`MockTransaction`, `MerchantData`) | Developer | 0.5h | None |
| T18.07: Seed merchant database with 44 merchants across 6 categories (Coffee, Gas, Grocery, Restaurant, Retail, Online) | Developer | 2h | T18.06 |
| T18.08: Implement `generateMockTransaction()` with random merchant selection and realistic amount generation | Developer | 2h | T18.07 |
| T18.09: Add card selection logic (user cards > fallback cards) | Developer | 1h | T18.08 |
| T18.10: Write unit tests for mock generator (test all categories, amount ranges, card logic) | Developer | 1.5h | T18.08 |
| T18.11: Add JSDoc comments and export helper functions (`isDemoMode()`, `getMockTransactionIfDemo()`) | Developer | 0.5h | T18.08 |

---

### Story S18.3: Deep Link Handler Demo Mode Integration

> **As a** demo presenter,
> **I want** the auto-capture deep link handler to inject mock data in demo mode,
> **So that** triggering the shortcut shows realistic transactions without real purchases.

**Priority**: P0 (Must Have — core integration)
**T-Shirt Size**: **S** (Small) — ~3 hours
**Feature**: F28

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Demo mode is enabled (`EXPO_PUBLIC_DEMO_MODE=true`) | The shortcut triggers `maximile://log` | The deep link handler calls `generateMockTransaction()` and injects mock data (amount, merchant, card) |
| AC2 | Demo mode is enabled | Mock data is injected | The transaction includes `isDemo: true` flag and `source: 'demo'` |
| AC3 | Demo mode is enabled | URL params have partial data (e.g., `card=MyCard`) | Mock data is merged intelligently (preserves provided params, fills in missing ones) |
| AC4 | Demo mode is disabled (`EXPO_PUBLIC_DEMO_MODE=false`) | The shortcut triggers `maximile://log?amount=X&merchant=Y` | The deep link handler returns real URL params unchanged — no mock injection |
| AC5 | Demo mode is disabled | URL params are empty | The deep link handler returns empty params (no automatic mock injection) |
| AC6 | Deep link handler is called in both modes | Both demo and production builds | No errors or crashes; seamless behavior in both modes |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T18.12: Update `lib/deep-link.ts` to import `generateMockTransaction()` and `isDemoMode()` | Developer | 0.25h | S18.2 |
| T18.13: Add `injectMockData()` helper function that merges mock data with URL params | Developer | 1h | T18.12 |
| T18.14: Update `parseAutoCaptureUrl()` to check `isDemoMode()` and call `injectMockData()` when true | Developer | 0.5h | T18.13 |
| T18.15: Update `AutoCaptureParams` interface to include `isDemo?: boolean` field | Developer | 0.25h | T18.14 |
| T18.16: Write unit tests for demo mode injection and production mode passthrough | Developer | 1h | T18.14 |

---

### Story S18.4: EAS Build Demo Profile

> **As a** developer,
> **I want** an EAS Build profile specifically for demo builds,
> **So that** I can generate demo-enabled app binaries with one command.

**Priority**: P0 (Must Have — enables distribution)
**T-Shirt Size**: **S** (Small) — ~2 hours
**Feature**: F28

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I run `eas build --profile demo --platform ios` (or `--platform android`) | EAS Build starts | The build uses `.env.demo` and sets `EXPO_PUBLIC_DEMO_MODE=true` |
| AC2 | The demo build completes | I install it on a device | The app is in demo mode (shortcut triggers show mock data) |
| AC3 | I run `eas build --profile production --platform ios` | EAS Build starts | The build uses `.env.production` and sets `EXPO_PUBLIC_DEMO_MODE=false` |
| AC4 | The production build completes | I install it on a device | The app is in production mode (no mock data injection) |
| AC5 | The `eas.json` file is updated | It includes a `demo` profile | Profile extends `preview`, sets distribution to `internal`, includes Android APK config, and includes `env: { EXPO_PUBLIC_DEMO_MODE: "true" }` |
| AC6 | Demo mode is platform-agnostic | Built on iOS or Android | Mock data injection works identically on both platforms |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T18.17: Update `eas.json` to add `demo` build profile (extends `preview`, internal distribution, env var) | Developer | 0.5h | S18.1 |
| T18.18: Test demo build locally: `eas build --profile demo --platform ios --local` (if supported) or trigger cloud build | Developer | 0.5h | T18.17 |
| T18.19: Verify demo build on device — shortcut trigger shows mock data | Developer | 0.5h | T18.18 |
| T18.20: Test production build to ensure demo mode is disabled | Developer | 0.5h | T18.17 |

---

### Story S18.5: Demo Mode Documentation

> **As a** demo presenter or new team member,
> **I want** comprehensive documentation on how to build, install, and use demo mode,
> **So that** I can confidently demo the product without assistance.

**Priority**: P1 (Should Have — critical for adoption)
**T-Shirt Size**: **S** (Small) — ~3 hours
**Feature**: F28

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I read `docs/DEMO_MODE.md` | I follow the build instructions | I can successfully build a demo app using `eas build --profile demo --platform ios` |
| AC2 | I read the documentation | I follow the installation guide | I can install the demo build on my device via QR code or direct download |
| AC3 | I read the usage section | I follow the demo steps | I can trigger the shortcut and see mock transactions appear |
| AC4 | I encounter an issue | I check the troubleshooting section | I find solutions for common problems (build failures, installation issues, demo mode not working) |
| AC5 | I want to understand the architecture | I read the "How It Works" section | I understand the environment variable flow, mock data generation, and deep link integration |
| AC6 | I want to add more merchants | I read the "Extending Mock Data" section | I know how to edit `lib/demo-data.ts` to add custom merchants |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T18.21: Create `docs/DEMO_MODE.md` with overview, how it works, build instructions, installation, usage, troubleshooting, FAQ | Developer | 2h | S18.1–S18.4 complete |
| T18.22: Add architecture diagram (text-based) showing environment variable → deep link → mock data flow | Developer | 0.5h | T18.21 |
| T18.23: Document EAS Build command and all build profiles (demo, development, preview, production) | Developer | 0.5h | T18.21 |
| T18.24: Add troubleshooting section for common issues (build failures, installation problems, demo mode not activating) | Developer | 0.5h | T18.21 |
| T18.25: Update main README.md with link to Demo Mode documentation | Developer | 0.25h | T18.21 |

---

### Sprint 18 Timeline

```
Week 1: Core Implementation
═══════════════════════════
Day 1:    S18.1 Environment setup (2h)
          S18.2 Mock generator start (4h)
Day 2:    S18.2 Mock generator complete (4h)
          S18.3 Deep link integration (3h)
Day 3:    S18.4 EAS demo profile (2h)
          Testing & fixes (4h)
Day 4–5:  S18.5 Documentation (3h)
          Integration testing (4h)
          Polish & bug fixes (3h)

Week 2: Polish & Distribution (Optional)
═══════════════════════════════════════
Day 6–7:  Expand merchant list to 50+ (if time)
          Add more realistic card logic
Day 8–9:  Internal demo testing with team
          Gather feedback & iterate
Day 10:   Final stabilization & demo prep
          Ship v1.0 with demo mode enabled
```

> **Note**: Sprint 18 is relatively lightweight (14 points vs typical 36-50) because it's a pure infrastructure feature with no UI changes. Core implementation can be completed in 3-4 days; remaining time is for polish, testing, and documentation to ensure demo success.

---

### Sprint 18 — Risk Register

| Risk | Impact | Likelihood | Mitigation | Owner |
|------|--------|------------|------------|-------|
| Mock data feels fake/unconvincing in demos | High | Medium | Source realistic merchant names and price ranges from actual transactions; test with real demo audience | Developer |
| Demo mode accidentally enabled in production | Critical | Low | Use build-time environment variable (not runtime toggle); test production builds thoroughly | Developer |
| EAS Build demo profile fails | High | Low | Test build early in sprint; fallback to manual .env switching if needed | Developer |
| Documentation incomplete or unclear | Medium | Medium | Peer review docs with team member who hasn't used demo mode; iterate based on feedback | Developer |

---

### Sprint 18 — Dependencies

| Dependency | Type | Status | Mitigation |
|------------|------|--------|------------|
| Sprint 16 complete (auto-capture deep link handler) | Hard dependency | ✅ Complete | N/A — already shipped |
| EAS Build configured | Infrastructure | ✅ Complete | N/A — already configured from previous sprints |
| Demo device available for testing | Testing | Required | Ensure iOS device available for demo build installation and testing |

---

### Sprint 18 — Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Demo build success rate | 100% | `eas build --profile demo` completes without errors |
| Mock data variety | 40+ merchants | Count unique merchants in `lib/demo-data.ts` |
| Demo mode isolation | 0 production impact | Production builds tested — no mock data appears |
| Documentation completeness | 100% coverage | All build, installation, usage, troubleshooting sections complete |
| Demo presentation success | 90%+ | Internal team demos show realistic transactions; positive feedback |

---

### Reference Documentation

For full implementation details, see:
- **PRD**: `docs/PRD_DEMO_MODE.md` — Complete product requirements
- **Sprint Plan**: `docs/SPRINT_PLAN_DEMO_MODE.md` — Detailed 2-week breakdown
- **Technical Documentation**: `docs/DEMO_MODE.md` — Build instructions, usage guide, FAQ
- **Main PRD**: `docs/PRD.md` — F28 feature entry
- **Implementation Files**:
  - `lib/demo-data.ts` — Mock transaction generator
  - `lib/deep-link.ts` — Demo mode integration
  - `.env.demo` / `.env.production` — Environment configuration
  - `eas.json` — Demo build profile

---

**Sprint 18 Status**: ✅ Complete (2026-02-21)
**Implementation**: Fully shipped with 8 commits, 741 lines added, feature branch `feat/demo-mode` merged to `main`
**Demo Build**: Available via `eas build --profile demo --platform ios`

---

## Sprint 19: "Foundation" (Push Notifications Phase 1 — Infrastructure) ✅ COMPLETE

**Duration**: 2 weeks (10 working days)
**Sprint Goal**: Build basic push notification infrastructure with token registration, permission flow, and backend sender capability. No user-facing notifications yet — this sprint establishes the foundation for push alerts.
**Epic**: E14 — Push Notifications for Rate Alerts
**PRD Reference**: `docs/PUSH_NOTIFICATIONS_EVALUATION.md` — Phase 1 (Foundation)
**Prerequisite**: Sprint 12 complete (rate_changes table and in-app notification system operational)
**Infrastructure Cost**: $0/month (Expo Push Service free tier: 600K notifications/month)
**Status**: COMPLETE ✅ — All stories shipped, infrastructure operational

### Sprint 19 — Stories

| ID | Story | Priority | Size | Points | Owner |
|----|-------|----------|------|--------|-------|
| **S19.1** | As a developer, I want to register device push tokens so users can receive notifications | P0 | M | 2 | Developer |
| **S19.2** | As a user, I want to opt into push notifications during onboarding so I don't miss rate changes | P0 | S | 1 | Developer + Designer |
| **S19.3** | As a backend, I want to send push notifications via Expo API when rate changes are inserted | P0 | L | 3 | Software Engineer |
| **Total** | | | | **6** | |

### Sprint 19 — User Story Details

#### S19.1: Device Push Token Registration

**As a developer, I want to register device push tokens so users can receive notifications**

**Acceptance Criteria**:

| AC# | Given | When | Then |
|-----|-------|------|------|
| AC1 | User grants notification permission | App requests Expo push token | Token is retrieved and stored in `auth.users.push_token` |
| AC2 | Token registration succeeds | Token is saved to database | `auth.users.push_enabled` is set to `true` |
| AC3 | Token registration fails (network error) | Token save fails | Error is logged; user can retry in Settings |
| AC4 | User's token expires or changes | App detects token change on startup | New token overwrites old token in database |
| AC5 | Developer tests on physical device | Test notification is sent via Expo Push API | Notification appears on device lock screen |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T19.01: Add `push_token`, `push_enabled`, `push_settings` columns to `auth.users` table (Migration 020) | Data Engineer | 1h | — |
| T19.02: Create `lib/push-notifications.ts` module with `registerForPushNotifications()` function | Developer | 2h | T19.01 |
| T19.03: Implement Expo `requestPermissionsAsync()` and `getExpoPushTokenAsync()` logic | Developer | 2h | T19.02 |
| T19.04: Wire token registration to onboarding flow (call after user adds first card) | Developer | 1h | T19.02 |
| T19.05: Add fallback: re-register token on app startup if expired/changed | Developer | 1.5h | T19.02 |
| T19.06: Create Supabase RPC `upsert_push_token(user_id, token)` | Software Engineer | 1h | T19.01 |
| T19.07: Test token registration on iOS (physical device required for push) | Tester | 2h | T19.02 |
| T19.08: Test token registration on Android (emulator OK) | Tester | 1.5h | T19.02 |

---

#### S19.2: Onboarding Permission Prompt

**As a user, I want to opt into push notifications during onboarding so I don't miss rate changes**

**Acceptance Criteria**:

| AC# | Given | When | Then |
|-----|-------|------|------|
| AC1 | User completes "Add Cards" step | Pre-permission primer screen appears | Screen explains value: "Never miss a rate change that costs you miles" |
| AC2 | User taps "Enable Notifications" | iOS/Android permission prompt appears | User can grant or deny |
| AC3 | User grants permission | Permission is saved | App proceeds to next onboarding step; push_enabled=true |
| AC4 | User denies permission | Permission denial is saved | App proceeds to next step; in-app notifications remain active |
| AC5 | User taps "I'll do this later" | No permission prompt shown | App proceeds; user can enable later in Settings |
| AC6 | User denies then revisits Settings | Settings shows "Enable Push Notifications" toggle | User can grant permission retroactively |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T19.09: Design pre-permission primer screen wireframe (iOS + Android variants) | Designer | 2h | — |
| T19.10: Build pre-permission primer UI (modal with "Enable" + "Later" buttons) | Developer | 3h | T19.09 |
| T19.11: Implement iOS permission flow (primer → system prompt) | Developer | 2h | T19.10, T19.02 |
| T19.12: Implement Android permission flow (primer → auto-grant on API 33+) | Developer | 1.5h | T19.10, T19.02 |
| T19.13: Add "Enable Push Notifications" toggle to Settings screen | Developer | 2h | T19.02 |
| T19.14: Wire Settings toggle to re-request permission if previously denied | Developer | 1.5h | T19.13 |
| T19.15: Analytics: Track permission opt-in rate (iOS vs Android) | Developer | 1h | T19.11, T19.12 |

---

#### S19.3: Backend Push Notification Sender

**As a backend, I want to send push notifications via Expo API when rate changes are inserted**

**Acceptance Criteria**:

| AC# | Given | When | Then |
|-----|-------|------|------|
| AC1 | New critical rate change is inserted | Trigger fires | Backend Edge Function is called with `rate_change_id` |
| AC2 | Edge Function receives rate change | Function queries affected users (users with card in portfolio) | List of users with `push_enabled=true` is retrieved |
| AC3 | Affected users are identified | Function builds notification payload for each user | Payload includes title, body, deep link data |
| AC4 | Notification payload is built | Function sends batch request to Expo Push API | Expo returns delivery receipts |
| AC5 | Expo Push API succeeds | Delivery status is logged to `push_notification_log` table | `delivered=true` is recorded |
| AC6 | Expo Push API fails (invalid token, network error) | Error is logged | `delivered=false`, `error_message` is recorded |
| AC7 | Developer tests with manual trigger | Edge Function is invoked via Supabase dashboard | Test notification is sent to developer's device |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T19.16: Design `push_notification_log` table schema | Data Engineer | 1h | — |
| T19.17: Write Migration 021: `push_notification_log` table | Data Engineer | 1h | T19.16 |
| T19.18: Create Supabase Edge Function scaffold: `send-push-notifications` | Software Engineer | 1.5h | — |
| T19.19: Implement RPC `get_affected_users(card_id, program_id)` to find users with card in portfolio | Software Engineer | 2h | T19.01 |
| T19.20: Implement notification payload builder (title, body, data, priority) | Software Engineer | 2.5h | T19.18 |
| T19.21: Integrate Expo Push API client (POST to `https://exp.host/--/api/v2/push/send`) | Software Engineer | 2h | T19.20 |
| T19.22: Implement delivery logging (insert to `push_notification_log`) | Software Engineer | 1.5h | T19.17, T19.21 |
| T19.23: Create database trigger on `rate_changes` table to call Edge Function | Software Engineer | 2h | T19.18 |
| T19.24: Implement error handling (retry once after 5 min for critical, log failures) | Software Engineer | 2h | T19.21 |
| T19.25: Test Edge Function with manual rate change insert (dev environment) | Tester | 2h | T19.23 |
| T19.26: Verify notification appears on physical iOS device | Tester | 1.5h | T19.25 |
| T19.27: Verify notification appears on Android device/emulator | Tester | 1.5h | T19.25 |

---

### Sprint 19 — Dependency Map

```
T19.01 (Migration: push columns)
    ├── T19.02 (lib/push-notifications.ts)
    │       ├── T19.03 (Expo permission + token APIs)
    │       ├── T19.04 (Wire to onboarding)
    │       ├── T19.05 (Startup re-registration)
    │       ├── T19.07 (Test iOS)
    │       └── T19.08 (Test Android)
    ├── T19.06 (RPC: upsert_push_token)
    ├── T19.09 (Design primer screen)
    │       └── T19.10 (Build primer UI)
    │               ├── T19.11 (iOS permission flow)
    │               ├── T19.12 (Android permission flow)
    │               └── T19.15 (Analytics)
    ├── T19.13 (Settings toggle)
    │       └── T19.14 (Re-request permission)
    └── T19.19 (RPC: get_affected_users)

T19.16 (push_notification_log schema)
    └── T19.17 (Migration 021)
            └── T19.22 (Delivery logging)

T19.18 (Edge Function scaffold)
    ├── T19.20 (Payload builder)
    │       └── T19.21 (Expo Push API client)
    │               ├── T19.22 (Delivery logging)
    │               └── T19.24 (Error handling)
    └── T19.23 (Database trigger)
            └── T19.25 (Manual test)
                    ├── T19.26 (iOS verification)
                    └── T19.27 (Android verification)
```

---

### Sprint 19 — DoR (Definition of Ready)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | `expo-notifications@0.32.16` already in package.json | ✅ |
| 2 | Push Notifications Evaluation v1.0 approved by stakeholders | ✅ |
| 3 | Sprint 12 complete (rate_changes table, in-app notifications operational) | ✅ |
| 4 | Physical iOS device available for push testing (emulator doesn't support push) | Required |
| 5 | Supabase Edge Functions enabled on project | Ready |
| 6 | Expo Push Notification Service account configured (free tier) | Ready |

---

### Sprint 19 — DoD (Definition of Done)

| # | Criterion |
|---|-----------|
| 1 | Users can grant push notification permission during onboarding (iOS + Android) |
| 2 | Device push tokens are registered and stored in `auth.users.push_token` |
| 3 | Backend Edge Function can send push notifications via Expo Push API |
| 4 | Notifications are logged to `push_notification_log` with delivery status |
| 5 | Database trigger on `rate_changes` table fires Edge Function on insert |
| 6 | Developer can receive test push notification on physical device |
| 7 | Permission opt-in rate tracked in analytics (iOS vs Android) |
| 8 | All new unit tests pass (token registration, Edge Function, delivery logging) |
| 9 | No regressions in existing functionality (all 600+ tests pass) |

---

### Sprint 19 — Risks & Mitigations

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R19.1 | Low iOS permission opt-in rate (~50% is typical) | **High** | **Medium** | Pre-permission primer explains clear value; ask after user adds cards (contextual timing); track opt-in rate daily |
| R19.2 | Expo Push API rate limits or downtime | **Low** | **Medium** | Free tier: 600K/month (sufficient for beta); fallback to in-app notifications if API fails; monitor delivery rate |
| R19.3 | Physical iOS device not available for testing | **Low** | **High** | Borrow device from team member; use TestFlight for beta testing with external devices |
| R19.4 | Database trigger causes performance issues on high-volume inserts | **Low** | **Low** | Trigger only fires on new rate_changes (infrequent: ~10-20/month); Edge Function is async; monitor query time |
| R19.5 | Token expiry not handled correctly | **Medium** | **Medium** | Implement startup re-registration; log token refresh events; test with expired tokens |

---

### Sprint 19 — Timeline

```
Week 1: Infrastructure Build
═════════════════════════════
Day 1-2:  T19.01–T19.06 (Database + token registration)
Day 3-4:  T19.09–T19.14 (Permission UI + Settings)
Day 5:    T19.16–T19.18 (Edge Function scaffold + logging)

Week 2: Backend Integration
════════════════════════════
Day 6-7:  T19.19–T19.24 (Edge Function implementation)
Day 8:    T19.23–T19.27 (Trigger + testing)
Day 9:    Integration testing (E2E)
Day 10:   Stabilization + bug fixes
```

---

## Sprint 20: "Complete System + Demo Mode" (Push Notifications Phase 2 — Production Ready)

**Duration**: 2 weeks (10 working days)
**Sprint Goal**: Build complete production-ready push notification system with all severities, smart batching, granular controls, F6 cap alerts, and beautiful demo mode for stakeholder presentations. No user rollout—focus on complete implementation + demo polish.
**Epic**: E14 — Push Notifications for Rate Alerts
**PRD Reference**: `docs/PUSH_NOTIFICATIONS_EVALUATION.md` (consolidated Phases 2-4) + `docs/PRD_DEMO_MODE.md`
**Prerequisite**: Sprint 19 complete (push infrastructure operational)
**Infrastructure Cost**: $0/month (Expo Push free tier)

### Sprint 20 — Stories

| ID | Story | Priority | Size | Points | Owner |
|----|-------|----------|------|--------|-------|
| **S20.1** | As a backend, I want to send notifications for all severities (critical/warning/info) with smart batching | P0 | L | 8 | Software Engineer |
| **S20.2** | As a user, I want to preview beautiful push notifications in demo mode | P1 | M | 3 | Developer + Designer |
| **S20.3** | As a demo presenter, I want to trigger demo notifications from the Miles tab and control them in Settings | P1 | S | 2 | Developer |
| **Total** | | | | **13** | |

### Sprint 20 — User Story Details

#### S20.1: Complete Notification System (All Severities + Batching + Controls)

**As a backend, I want to send notifications for all severities (critical/warning/info) with smart batching, granular user controls, quiet hours, F6 cap alerts, deep linking, and notification history**

**Acceptance Criteria**:

| AC# | Given | When | Then |
|-----|-------|------|------|
| AC1 | Critical rate change is inserted | Edge Function triggers | Notification sent instantly to affected users (severity=critical) |
| AC2 | Warning rate change is inserted | Edge Function triggers | Notification queued for 9 AM daily batch (severity=warning) |
| AC3 | Info rate change is inserted | Edge Function triggers | Notification queued for Friday 9 AM weekly digest (severity=info) |
| AC4 | User taps any notification | Tap detected | Deep links to relevant screen (card detail, cap status, or rate changes list) |
| AC5 | User navigates to Settings | Screen loads | Granular toggles shown: Critical (ON), Warning (ON), Info (OFF), Cap Alerts (ON), Quiet Hours (10PM-8AM) |
| AC6 | User reaches 80% of bonus cap | Daily cap check runs | Push notification: "You've used $800 of $1,000 DBS WWC cap. Switch cards?" |
| AC7 | User navigates to Notification History | History screen loads | All sent notifications shown with timestamps, "Opened" badges, deep links |
| AC8 | Critical notification triggers at 11 PM | Quiet hours active (10 PM - 8 AM) | Notification delayed until 8 AM |
| AC9 | User disables "Warning changes" in Settings | Toggle OFF | No warning notifications sent; only critical + cap alerts |
| AC10 | 2 warning changes occur same day | 9 AM batch job runs | Single batched notification: "2 rate changes affect your cards" |

**Task Breakdown** (Consolidated from original Sprints 20-22):

**Phase 1: Severity Handling + Deep Linking** (Days 1-3)

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T20.01: Update Edge Function to handle all severities (critical=instant, warning=batch 9AM, info=batch Friday) | Software Engineer | 2.5h | Sprint 19 T19.18 |
| T20.02: Design `notification_queue` table schema (rate_change_id, user_id, severity, scheduled_send_time, delayed_until) | Data Engineer | 1h | — |
| T20.03: Write Migration 022: notification_queue table | Data Engineer | 0.5h | T20.02 |
| T20.04: Implement queuing logic for warning/info notifications | Software Engineer | 2h | T20.03 |
| T20.05: Calculate next 9 AM / Friday 9 AM timestamps (UTC+8 Singapore) | Software Engineer | 1h | T20.04 |
| T20.06: Update notification payload to include deep link data: {screen, cardId, rateChangeId} | Software Engineer | 1h | Sprint 19 T19.20 |
| T20.07: Implement Notifications.addNotificationResponseReceivedListener() in App.tsx | Developer | 2h | — |
| T20.08: Implement deep link router: parse notification data → navigate to CardDetail, CapStatus, or RateChangesList | Developer | 3h | T20.07 |
| T20.09: Build "Rate Changes List" screen (new) showing all unread changes | Developer | 3h | — |
| T20.10: Update deep link handler to support maximile://rate-changes and maximile://caps?highlight={cardId} | Developer | 1.5h | T20.08 |
| T20.11: Test: Insert warning at 2 PM → verify queued for 9 AM, not sent instantly | Tester | 1h | T20.04 |
| T20.12: Test: Tap notification (background/closed/logged out) → verify deep linking works | Tester | 2h | T20.08 |

**Phase 2: Batching + Quiet Hours + Granular Settings** (Days 4-6)

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T20.13: Create Supabase Edge Function: process-notification-queue (cron job for batching) | Software Engineer | 2.5h | T20.03 |
| T20.14: Implement batching logic: group by user+day, create single notification if ≥2 changes | Software Engineer | 2h | T20.13 |
| T20.15: Set up GitHub Actions cron trigger (daily 9 AM SGT, Friday 9 AM for weekly digest) | Software Engineer | 1.5h | T20.13 |
| T20.16: Add quiet_hours_start, quiet_hours_end to push_settings JSONB (defaults: 22, 8) | Data Engineer | 0.5h | Sprint 19 T19.01 |
| T20.17: Implement quiet hours check in Edge Function: delay notifications if within window | Software Engineer | 2h | T20.16 |
| T20.18: Update notification_queue to support delayed_until timestamp for quiet hours | Software Engineer | 1h | T20.03 |
| T20.19: Design expanded Settings screen wireframe (5 toggles + time pickers + history link) | Designer | 2h | — |
| T20.20: Build Settings UI: Critical/Warning/Info/Cap Alerts toggles + Quiet Hours time pickers + History link | Developer | 4h | T20.19 |
| T20.21: Wire toggles to update push_settings JSONB (rate_changes_critical, rate_changes_warning, rate_changes_info, cap_alerts_enabled) | Developer | 2h | T20.20 |
| T20.22: Update Edge Function to check user's severity preferences before sending | Software Engineer | 1.5h | T20.21 |
| T20.23: Test: Manual trigger cron job → verify batch sent with 2+ changes | Tester | 1.5h | T20.15 |
| T20.24: Test: Trigger critical at 11 PM → verify delayed to 8 AM (quiet hours) | Tester | 1.5h | T20.17 |
| T20.25: Test: Disable warning toggle → insert warning → verify no push sent | Tester | 1h | T20.22 |

**Phase 3: F6 Cap Alerts + Notification History** (Days 7-9)

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T20.26: Design cap_alert_sent tracking table (card_id, user_id, month, sent_at) to prevent duplicates | Data Engineer | 1h | — |
| T20.27: Write Migration 023: cap_alert_sent table | Data Engineer | 0.5h | T20.26 |
| T20.28: Create RPC get_users_approaching_cap(threshold=0.8) to find users at 80%+ cap usage | Software Engineer | 2.5h | T20.27 |
| T20.29: Create Supabase Edge Function: send-cap-approaching-alerts (daily cron) | Software Engineer | 2h | T20.28 |
| T20.30: Implement dedup logic: check cap_alert_sent, skip if already sent this month | Software Engineer | 1.5h | T20.27 |
| T20.31: Build cap notification payload (distinct from rate changes): "📊 You've used $X of $Y cap. Switch cards?" | Software Engineer | 1.5h | T20.29 |
| T20.32: Set up daily cron job (GitHub Actions) for cap alert check | Software Engineer | 1h | T20.29 |
| T20.33: Design Notification History screen wireframe (list view, timestamps, "Opened" badges, deep links) | Designer | 2h | — |
| T20.34: Create RPC get_user_notification_history(user_id, limit, offset) | Software Engineer | 1.5h | Sprint 19 T19.17 |
| T20.35: Build Notification History screen (list view, pagination, infinite scroll) | Developer | 3.5h | T20.33 |
| T20.36: Implement "Opened" vs "Not opened" badge logic based on push_notification_log.opened | Developer | 1h | T20.35 |
| T20.37: Wire history list items to deep link to card detail or cap status | Developer | 1.5h | T20.35 |
| T20.38: Update notification response listener to log opened=true on tap | Developer | 1.5h | T20.07 |
| T20.39: Test: Manually set user to 80% cap → trigger job → verify notification + dedup works | Tester | 2h | T20.32 |
| T20.40: Test: Receive 3 notifications → verify all appear in History with correct badges | Tester | 1.5h | T20.35 |

**Phase 4: Testing + Stabilization** (Day 10)

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T20.41: E2E test: Full notification lifecycle (critical instant, warning batched, cap alert, history) | Tester | 3h | All above |
| T20.42: E2E test: Settings controls (disable severity → verify no notifications sent) | Tester | 2h | T20.25 |
| T20.43: E2E test: Deep linking from all notification types (rate change, cap, batched) | Tester | 2h | T20.12 |
| T20.44: Bug fixes + stabilization | Developer + Software Engineer | 4h | All tests |

---

#### S20.2: Demo Notification Preview Component

**As a user, I want to preview beautiful push notifications in demo mode with realistic, polished designs**

**Acceptance Criteria**:

| AC# | Given | When | Then |
|-----|-------|------|------|
| AC1 | Demo mode is enabled | User navigates to Miles tab | "Preview Push Notifications" button appears at bottom |
| AC2 | User taps "Preview Push Notifications" | Button is pressed | Modal appears showing 4 notification previews (critical rate change, warning batch, cap alert, info digest) |
| AC3 | Modal displays notification preview | User views preview | Realistic iOS/Android notification UI shown with icon, title, body, timestamp |
| AC4 | User views critical rate change preview | Preview is displayed | Shows: "⚠️ Your Amex KrisFlyer card: Major Change" + "Earn rate dropped 33% (1.2 → 0.8 miles/$). Tap to switch cards." |
| AC5 | User views warning batch preview | Preview is displayed | Shows: "📬 2 rate changes affect your cards" + "DBS Altitude & Citi PremierMiles updated. Review changes." |
| AC6 | User views cap alert preview | Preview is displayed | Shows: "📊 Approaching DBS WWC bonus cap" + "You've used $800 of $1,000. Switch to Citi PremierMiles?" |
| AC7 | User views info digest preview | Preview is displayed | Shows: "✨ 3 positive changes this week" + "Better rates on OCBC 90°N, UOB PRVI, HSBC Revolution" |
| AC8 | User taps preview notification | Tap detected | Modal closes + deep link simulated (navigates to card detail / cap status) |
| AC9 | User dismisses modal | X button tapped or swipe down | Modal closes, returns to Miles tab |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T20.45: Design notification preview modal wireframe (iOS + Android variants) | Designer | 2h | — |
| T20.46: Build NotificationPreviewModal component with 4 sample notifications | Developer | 3h | T20.45 |
| T20.47: Style notifications to match iOS/Android native appearance (colors, fonts, spacing) | Developer | 2h | T20.46 |
| T20.48: Implement tap handlers for each preview → close modal + deep link to relevant screen | Developer | 1.5h | T20.46, T20.08 |
| T20.49: Add "Preview Push Notifications" button to Miles tab (only visible in demo mode) | Developer | 1h | Sprint 18 (demo mode context) |
| T20.50: Test: Open preview modal → verify all 4 notifications render correctly | Tester | 1h | T20.46 |
| T20.51: Test: Tap each preview → verify deep linking works | Tester | 1h | T20.48 |

---

#### S20.3: Demo Mode Integration (Miles Tab Trigger + Settings Controls)

**As a demo presenter, I want to trigger demo notifications from the Miles tab and control notification settings in Settings**

**Acceptance Criteria**:

| AC# | Given | When | Then |
|-----|-------|------|------|
| AC1 | Demo mode is enabled | User navigates to Settings > Push Notifications | Full Settings UI shown with all toggles (Critical/Warning/Info/Cap Alerts/Quiet Hours) |
| AC2 | Demo mode is enabled | User toggles any setting in Settings | Setting is saved to demo user profile; preview modal respects settings |
| AC3 | Demo mode is disabled (production) | User navigates to Settings | Push Notifications section still shown (if feature enabled for user) |
| AC4 | Demo mode is enabled | User disables "Warning changes" toggle | Warning batch preview is grayed out in modal with "Disabled" badge |
| AC5 | Demo mode is enabled | User navigates to Notification History | History screen shows 5-10 sample notifications (mix of types, timestamps) |
| AC6 | Demo mode is disabled | User navigates to Notification History | Only real notifications shown (empty if none sent) |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T20.52: Wire demo mode context to Settings screen (show/hide notification settings based on env) | Developer | 1.5h | T20.20, Sprint 18 |
| T20.53: Update Settings toggles to save to demo user profile when in demo mode | Developer | 1.5h | T20.52 |
| T20.54: Update NotificationPreviewModal to gray out disabled severity previews | Developer | 1h | T20.46, T20.53 |
| T20.55: Create sample notification history data (5-10 notifications with realistic timestamps) | Developer | 1h | T20.35 |
| T20.56: Update Notification History screen to show sample data in demo mode | Developer | 1.5h | T20.55 |
| T20.57: Test: Demo mode → toggle settings → verify preview modal updates | Tester | 1h | T20.54 |
| T20.58: Test: Demo mode → Notification History → verify sample data shown | Tester | 1h | T20.56 |
| T20.59: Test: Production mode → verify only real notifications appear | Tester | 0.5h | T20.56 |

---

### Sprint 20 — Dependency Map

```
Phase 1: Severity + Deep Linking (Days 1-3)
═════════════════════════════════════════════
T20.02 (notification_queue schema)
    └── T20.03 (Migration 022)
            ├── T20.01 (Handle all severities in Edge Function)
            ├── T20.04 (Queuing logic)
            │       └── T20.05 (Calculate 9 AM / Friday timestamps)
            └── T20.18 (Add delayed_until column)

T20.06 (Add deep link data to payload) ← Sprint 19 T19.20
    └── T20.07 (Notification response listener)
            └── T20.08 (Deep link router)
                    ├── T20.09 (Rate Changes List screen)
                    └── T20.10 (Update deep link handler)

T20.11 (Test: queuing)
T20.12 (Test: deep linking)

Phase 2: Batching + Settings + Quiet Hours (Days 4-6)
════════════════════════════════════════════════════════
T20.13 (process-notification-queue cron Edge Function) ← T20.03
    ├── T20.14 (Batching logic)
    └── T20.15 (GitHub Actions cron)

T20.16 (quiet_hours columns) ← Sprint 19 T19.01
    ├── T20.17 (Quiet hours check in Edge Function)
    └── T20.18 (delayed_until support)

T20.19 (Settings wireframe)
    └── T20.20 (Build Settings UI: 5 toggles + time pickers + history link)
            ├── T20.21 (Wire to JSONB)
            │       └── T20.22 (Check severity preferences in Edge Function)
            └── T20.23 (Test: batch sent)

T20.24 (Test: quiet hours delay)
T20.25 (Test: toggle warnings off)

Phase 3: F6 Cap Alerts + History (Days 7-9)
═══════════════════════════════════════════════
T20.26 (cap_alert_sent schema)
    └── T20.27 (Migration 023)
            ├── T20.28 (RPC: get_users_approaching_cap)
            │       └── T20.29 (Edge Function: send-cap-alerts)
            │               ├── T20.30 (Dedup logic)
            │               ├── T20.31 (Cap payload)
            │               └── T20.32 (Daily cron)
            └── T20.39 (Test: cap alert + dedup)

T20.33 (History wireframe)
    └── T20.34 (RPC: get_notification_history) ← Sprint 19 T19.17
            └── T20.35 (Build History screen)
                    ├── T20.36 (Opened/Not opened badges)
                    ├── T20.37 (Deep link from history)
                    └── T20.38 (Log opened=true)

T20.40 (Test: history appears)

Phase 4: Demo Mode (Days 7-9, parallel)
═══════════════════════════════════════════
T20.45 (Preview modal wireframe)
    └── T20.46 (Build NotificationPreviewModal)
            ├── T20.47 (Style iOS/Android appearance)
            ├── T20.48 (Tap handlers + deep links)
            └── T20.49 (Add button to Miles tab)

T20.52 (Wire demo context to Settings) ← T20.20, Sprint 18
    ├── T20.53 (Save to demo profile)
    ├── T20.54 (Gray out disabled previews)
    ├── T20.55 (Sample history data)
    └── T20.56 (Show sample data in History)

T20.50 (Test: preview modal)
T20.51 (Test: preview deep links)
T20.57 (Test: demo settings integration)
T20.58 (Test: demo history)
T20.59 (Test: production mode)

Phase 5: E2E Testing + Stabilization (Day 10)
══════════════════════════════════════════════════
T20.41 (E2E: full lifecycle)
T20.42 (E2E: settings controls)
T20.43 (E2E: deep linking all types)
T20.44 (Bug fixes + stabilization)
```

---

### Sprint 20 — DoR (Definition of Ready)

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Sprint 19 complete (push infrastructure operational) | ✅ |
| 2 | Sprint 18 complete (demo mode environment controls operational) | ✅ |
| 3 | Notification preview designs approved by Product Owner | Ready |
| 4 | Deep link schema extended: `maximile://card/{id}`, `maximile://caps?highlight={id}`, `maximile://rate-changes` | ✅ |
| 5 | F6 Cap Approaching Alerts deferred from v1.1 — ready for implementation | ✅ |

---

### Sprint 20 — DoD (Definition of Done)

| # | Criterion |
|---|-----------|
| 1 | Critical rate changes send instant push notifications |
| 2 | Warning rate changes are batched and sent at 9 AM daily |
| 3 | Info rate changes are batched and sent Friday 9 AM weekly |
| 4 | Users receive push notification when reaching 80% of any bonus cap |
| 5 | Cap alerts sent max once per card per month (no duplicates) |
| 6 | Deep linking works from all notification types (rate change, cap, batched) when app is background/closed/logged out |
| 7 | Settings shows 5 controls: Critical/Warning/Info/Cap Alerts toggles + Quiet Hours time pickers |
| 8 | Quiet hours (default 10 PM - 8 AM) delay notifications until quiet hours end |
| 9 | Notification History screen shows all sent notifications with timestamps and "Opened" badges |
| 10 | Demo mode: "Preview Push Notifications" button appears on Miles tab |
| 11 | Demo mode: Preview modal shows 4 beautiful notification designs (critical, warning batch, cap, info) |
| 12 | Demo mode: Settings controls work and update preview modal (gray out disabled types) |
| 13 | Demo mode: Notification History shows 5-10 sample notifications |
| 14 | Production mode: Only real notifications appear (no demo data) |
| 15 | All new tests pass; no regressions in existing functionality |
| 16 | Complete system ready for future user rollout (infrastructure complete, no beta launch yet) |

---

### Sprint 20 — Risks & Mitigations

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R20.1 | Consolidating 3 sprints into 1 causes scope creep or delays | **High** | **High** | Strict task prioritization; defer non-critical polish (e.g., analytics dashboard, A/B testing) to post-sprint; focus on core implementation + demo |
| R20.2 | Deep linking breaks on iOS vs Android platform differences | **Medium** | **Medium** | Test on both platforms; use Expo Linking API (handles platform differences); allocate 2h buffer for cross-platform fixes |
| R20.3 | Demo mode integration with real notification system causes conflicts | **Medium** | **Low** | Strict environment checks (`__DEV__` or demo flag); separate demo preview component from production notification system |
| R20.4 | Batching logic has edge case bugs (timezone, quiet hours overlap) | **Medium** | **Medium** | Extensive testing with mock data; manual cron triggers; store user timezone in profile |
| R20.5 | Cap alert logic has edge case bugs (cap resets not detected) | **Medium** | **Medium** | Test with mock cap data; monitor cap_alert_sent table for anomalies; dedup logic prevents worst-case duplicates |
| R20.6 | Notification History screen loads slowly with 100+ notifications | **Low** | **Low** | Implement pagination (20 per page); add index on push_notification_log(user_id, sent_at) |

---

### Sprint 20 — Timeline

```
Week 1: Core Implementation (Days 1-5)
═══════════════════════════════════════
Day 1:    Phase 1 — Severity handling + queuing (T20.01–T20.06)
Day 2:    Phase 1 — Deep linking + Rate Changes List screen (T20.07–T20.12)
Day 3:    Phase 2 — Batching cron job + quiet hours (T20.13–T20.18)
Day 4:    Phase 2 — Granular Settings UI (5 toggles + time pickers) (T20.19–T20.22)
Day 5:    Phase 2 — Testing batching + quiet hours + settings (T20.23–T20.25)

Week 2: F6 + History + Demo Mode (Days 6-10)
═════════════════════════════════════════════
Day 6:    Phase 3 — Cap alerts implementation (T20.26–T20.32)
Day 7:    Phase 3 — Notification History screen (T20.33–T20.38)
Day 8:    Phase 3 — Testing cap + history (T20.39–T20.40)
          Phase 4 — Demo preview modal (T20.45–T20.49, parallel)
Day 9:    Phase 4 — Demo Settings + History integration (T20.52–T20.56)
          Phase 4 — Demo testing (T20.50–T20.59)
Day 10:   Phase 5 — E2E testing all flows (T20.41–T20.43)
          Phase 5 — Bug fixes + stabilization (T20.44)
```

---

## Sprint 19-20 Summary: Push Notifications Roadmap (REVISED)

**Change from Original Plan**: Consolidated Sprints 20-22 into single NEW Sprint 20. Removed gradual user rollout (beta → expand → full launch). Focus: Complete production-ready system + demo mode. No user launch.

### Total Effort

| Sprint | Phase | Stories | Points | Duration |
|--------|-------|---------|--------|----------|
| **Sprint 19** | Foundation ✅ COMPLETE | 3 | 6 | 2 weeks |
| **Sprint 20** | Complete System + Demo Mode | 3 | 13 | 2 weeks |
| **Total** | | **6** | **19** | **4 weeks** |

**Original Plan (v10.0)**: 4 sprints (19-22), 22 story points, 8 weeks, gradual user rollout (beta → expand → full launch)

**Revised Plan (v11.0)**: 2 sprints (19-20), 19 story points, 4 weeks, complete system build + demo mode (no user launch)

---

### Key Milestones

| Milestone | Sprint | Status | Success Criteria |
|-----------|--------|--------|------------------|
| **Push Infrastructure Live** | Sprint 19 | ✅ COMPLETE | Device token registration, permission flow, backend sender operational |
| **Complete Notification System** | Sprint 20 | 🔄 IN PROGRESS | All severities (critical/warning/info), batching, granular controls, quiet hours, F6 cap alerts, deep linking, notification history |
| **Demo Mode Ready** | Sprint 20 | 🔄 IN PROGRESS | Preview modal with 4 notification designs, Settings integration, sample history data |
| **Production-Ready (No Launch)** | Sprint 20 | 🎯 TARGET | Complete system built, tested, documented; ready for future user rollout decision |

---

### Scope Changes from Original Plan

| Aspect | Original Plan (Sprints 20-22) | Revised Plan (Sprint 20 Only) |
|--------|-------------------------------|-------------------------------|
| **User Rollout** | Gradual: 100 users → 500 users → 5,000 users | No rollout — system build only |
| **A/B Testing** | Test 3 notification copy variants with beta users | Deferred — not needed without user rollout |
| **Beta Management** | Track opt-out rates, delivery rates, open rates per cohort | Deferred — no live users |
| **Analytics Dashboard** | PM dashboard for delivery/open/opt-out metrics | Deferred — build analytics when launching to users |
| **Timeline** | 6 weeks (3 sprints × 2 weeks) | 2 weeks (1 sprint) |
| **Story Points** | 16 SP across Sprints 20-22 | 13 SP consolidated into Sprint 20 |
| **Focus** | Gradual validation + user feedback loops | Complete implementation + demo polish |
| **Milestone** | Full launch to 5,000+ users | Production-ready system (no launch) |

---

### Dependencies & Prerequisites

| Sprint | Hard Dependencies | Soft Dependencies |
|--------|-------------------|-------------------|
| **Sprint 19** ✅ | `expo-notifications` installed (✅), Sprint 12 complete (✅) | Physical iOS device for testing (✅) |
| **Sprint 20** 🔄 | Sprint 19 complete (✅), Sprint 18 demo mode complete (✅) | Notification preview designs approved |

---

### Reference Documentation

For full implementation details, technical architecture, and risk analysis, see:
- **Push Notifications Evaluation**: `docs/PUSH_NOTIFICATIONS_EVALUATION.md`
- **Demo Mode PRD**: `docs/PRD_DEMO_MODE.md`
- **Demo Mode Sprint Plan**: `docs/SPRINT_PLAN_DEMO_MODE.md`
- **PRD**: `docs/PRD.md` — Sprint 12 (F23 Rate Change Monitoring & Alerts)
- **User Stories**: `docs/EPICS_AND_USER_STORIES.md` — E14 (Push Notifications)

---

**Sprint 19-20 Status**: Sprint 19 ✅ COMPLETE | Sprint 20 🔄 IN PROGRESS

**Next Steps**:
1. Complete Sprint 20 implementation (all 3 stories: S20.1, S20.2, S20.3)
2. Conduct stakeholder demo with preview modal + sample notifications
3. Document complete system for future user rollout decision
4. If approved for user launch: Create Sprint 21 for gradual rollout (beta → expand → full)

---

**DELETED FROM ORIGINAL PLAN** (Sprints 20-22 detailed content):
- Sprint 20: Beta (Critical Only) — 4 stories, 5 SP
- Sprint 21: Expand (Warning + Info + Batching) — 3 stories, 6 SP
- Sprint 22: Full Launch (F6 + History + Analytics) — 2 stories, 5 SP

**REASON**: No user rollout needed at this time. Focus on complete system build + beautiful demo mode for stakeholder presentations. User launch deferred pending business decision.

---

## Sprint 21: "Data Fix" (F30 — Petrol/Bills Category Resolution + F32 — Condition Transparency)

**Duration**: 2 weeks (10 working days)
**Sprint Goal**: Resolve the petrol/bills data conflict that leaves 140 earn rules inaccessible and 1 category returning undifferentiated results, then surface card conditions and exclusions in the recommendation UI so users understand the fine print behind every recommendation.
**Epic**: E14 — Recommendation Accuracy Improvements (Post-MileLion Analysis)
**PRD Features**: F30 (P0, RICE 9500), F32 (P2, RICE 4800)
**Phase**: v2.2 — Recommendation Accuracy
**Predecessor**: Sprint 20 (Push Notifications complete)
**Reference**: `docs/technical/MAXIMILE_VS_MILELION_ANALYSIS.md`, `docs/technical/CARD_DATA_VERIFICATION.md` Section 3.1

---

### Sprint 21 — Definition of Ready (DoR) Checklist

Before any story enters the sprint, it must satisfy:

- [ ] User story has clear "As a... I want... So that..." statement
- [ ] Acceptance criteria defined and reviewed by PM + Tech Lead
- [ ] T-shirt size estimated by the team
- [ ] Dependencies identified — Sprint 20 complete
- [ ] `constants/categories.ts` confirmed to have both `petrol` and `bills` categories
- [ ] `all_cards.sql` earn rules for `petrol` verified as correct for all 20 cards
- [ ] HSBC Revolution MCC 5814 exclusion confirmed via MileLion analysis
- [ ] Insurance MCC exclusion data (6300/6381/6399) confirmed in existing `exclusions` table

### Sprint 21 — Definition of Done (DoD) Checklist

A story is "Done" when:

- [ ] Feature works as described in all acceptance criteria
- [ ] Unit tests written and passing (happy path + key edge cases)
- [ ] `recommend('bills')` returns differentiated results (not all identical base rates)
- [ ] `recommend('petrol')` continues to return correct petrol-specific earn rates
- [ ] Google Places `gas_station` maps to `petrol` (not `transport`)
- [ ] Condition notes visible on recommendation cards where applicable
- [ ] Insurance warning banner appears on Bills recommendation screen
- [ ] No P0 or P1 bugs remaining
- [ ] Code committed to main branch and peer-reviewed
- [ ] All existing tests pass (no regressions)
- [ ] HSBC Revolution excluded from dining for fast food merchants

---

### Sprint 21 Stories

| ID | Story | Priority | Size | Points | Owner |
|----|-------|----------|------|--------|-------|
| **S21.1** | Add base-rate earn rules for `bills` category across all 20 cards | P0 | M | 3 | Data Engineer |
| **S21.2** | Fix Google Places `gas_station` mapping to `petrol` | P0 | S | 1 | Developer |
| **S21.3** | Add `bills` to AI scraper schema and prompts | P0 | S | 2 | Software Engineer |
| **S21.4** | Add HSBC Revolution MCC 5814 exclusion | P1 | XS | 1 | Data Engineer |
| **S21.5** | Surface `conditions_note` on recommendation cards | P1 | M | 3 | Developer |
| **S21.6** | Add insurance warning banner on Bills recommendation screen | P1 | S | 2 | Developer |
| **S21.7** | Update tests for 8-category coverage and new exclusion | P1 | S | 2 | Tester |
| **Total** | | | | **14** | |

---

### Sprint 21 — User Story Details

#### S21.1: Add Base-Rate Earn Rules for `bills` Category

> **As a** user selecting "Bills" in the app,
> **I want** `recommend('bills')` to return differentiated results for all 20 cards,
> **So that** I know which card earns the most on telco and utility payments.

**Priority**: P0 (Must Have — core data fix)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F30

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | The earn rules migration runs | I call `recommend('bills')` | All 20 cards appear with earn rates (base rates: 0.4–1.5 mpd) |
| AC2 | Bills earn rules are seeded | I compare `recommend('bills')` results | Cards are ranked by `base_rate_mpd`: BOC Elite Miles (1.5) > UOB PRVI/SC Visa Infinite (1.4) > ... > HSBC Revolution/DBS WWC (0.4) |
| AC3 | Bills earn rules are seeded | I query `earn_rules WHERE category_id = 'bills'` | 20 rows exist (one per card), all with `is_bonus = FALSE` |
| AC4 | Petrol earn rules already exist | I call `recommend('petrol')` | Results unchanged — existing petrol-specific bonus rates still apply (e.g., Maybank Horizon 1.6 mpd, SC X Card 3.3 mpd) |
| AC5 | Both categories exist | I view the category tile grid | 8 categories visible: Dining, Transport, Online, Groceries, Petrol, Bills, Travel, General |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T21.01: Write SQL INSERT for 20 base-rate earn rules for `bills` category (matching each card's `base_rate_mpd`) | Data Engineer | 2h | None |
| T21.02: Add `ON CONFLICT` clause for idempotent re-runs | Data Engineer | 0.5h | T21.01 |
| T21.03: Update `all_cards.sql` seed file with bills earn rules section | Data Engineer | 1h | T21.01 |
| T21.04: Run migration on Supabase and verify `recommend('bills')` output | Data Engineer | 1h | T21.03 |
| T21.05: Verify `recommend('petrol')` output is unchanged (regression check) | Tester | 1h | T21.04 |
| T21.06: Test that all 8 category tiles are visible and tappable in the app | Tester | 0.5h | T21.04 |

---

#### S21.2: Fix Google Places `gas_station` Mapping

> **As a** user at a petrol station with GPS enabled,
> **I want** the app to detect my location as "Petrol" (not "Transport"),
> **So that** the auto-detected category matches the correct earn rules.

**Priority**: P0 (Must Have — wrong category mapping)
**T-Shirt Size**: **S** (Small) — ~0.5 day
**Feature**: F30

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | User is near a petrol station | Google Places API returns `gas_station` type | App maps to `petrol` category (not `transport`) |
| AC2 | User is near a taxi stand | Google Places API returns `taxi_stand` type | App still maps to `transport` (unchanged) |
| AC3 | Mapping is updated | I look up `mapTypesToCategory('gas_station')` | Returns `petrol` |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T21.07: Update `mapTypesToCategory()` in `lib/merchant.ts` — change `gas_station` from `transport` to `petrol` | Developer | 0.5h | None |
| T21.08: Update unit tests for `mapTypesToCategory()` to expect `petrol` for `gas_station` | Tester | 0.5h | T21.07 |
| T21.09: Verify other Google Places type mappings are unaffected (regression) | Tester | 0.5h | T21.07 |

---

#### S21.3: Add `bills` to AI Scraper Schema

> **As the** AI rate change detection system,
> **I need** `bills` to be a valid category in the scraper schema and prompts,
> **So that** rate change submissions for bills-related cards pass schema validation.

**Priority**: P0 (Must Have — schema consistency)
**T-Shirt Size**: **S** (Small) — ~1 day
**Feature**: F30

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | AI scraper processes a bills-related rate change | Schema validation runs | `bills` is accepted as a valid `category` value |
| AC2 | The category enum is updated | I inspect `scraper/src/ai/schema.ts` | `bills` is in the `CategoryId` enum/type |
| AC3 | The system prompt is updated | I inspect `scraper/src/ai/prompts.ts` | `bills` appears in the tracked categories list with description |
| AC4 | Both `petrol` and `bills` are in schema | I check the category enum | Both values are present |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T21.10: Add `bills` to `CategoryId` enum in `scraper/src/ai/schema.ts` | Software Engineer | 0.5h | None |
| T21.11: Add `bills` description to tracked categories in `scraper/src/ai/prompts.ts` system prompt | Software Engineer | 0.5h | T21.10 |
| T21.12: Update Zod validation schema (if `GROQ_RESPONSE_SCHEMA` has category validation) | Software Engineer | 0.5h | T21.10 |
| T21.13: Test: Submit a mock rate change with `category: 'bills'` → verify schema accepts it | Tester | 0.5h | T21.12 |

---

#### S21.4: Add HSBC Revolution MCC 5814 Exclusion

> **As the** system,
> **I need** HSBC Revolution to be excluded from dining bonus for MCC 5814 (fast food),
> **So that** users are not recommended HSBC Revolution at 4 mpd at McDonald's, KFC, or Burger King when it actually earns 0.4 mpd there.

**Priority**: P1 (Should Have — accuracy fix)
**T-Shirt Size**: **XS** (Extra Small) — ~2 hours
**Feature**: F32

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Exclusion row is inserted | I query `exclusions WHERE card_id = hsbc-revolution AND category_id = 'dining'` | MCC 5814 is in the `excluded_mccs` array |
| AC2 | HSBC Revolution has dining exclusion | User selects "Dining" category | HSBC Revolution recommendation shows asterisk/note: "Excludes fast food (MCC 5814)" |
| AC3 | Exclusion exists | HSBC Revolution is recommended for dining | `conditions_note` or exclusion note visible to user |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T21.14: Write SQL INSERT for HSBC Revolution MCC 5814 exclusion in `exclusions` table | Data Engineer | 0.5h | None |
| T21.15: Update `all_cards.sql` seed file with HSBC Revolution dining exclusion | Data Engineer | 0.5h | T21.14 |
| T21.16: Verify HSBC Revolution exclusion appears in recommendation UI (after S21.5 ships) | Tester | 0.5h | T21.14, S21.5 |

---

#### S21.5: Surface `conditions_note` on Recommendation Cards

> **As a** user viewing a card recommendation,
> **I want** to see any conditions attached to the earn rate (e.g., "Requires contactless", "SIA bookings only"),
> **So that** I understand the fine print before choosing a card and can make an informed decision.

**Priority**: P1 (Should Have — trust building)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F32

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | A card has `conditions_note` in its earn rule | Recommendation screen loads for that category | Condition text shown below earn rate in muted/secondary style |
| AC2 | A card has no conditions (null `conditions_note`) | Recommendation screen loads | No condition text shown — clean display |
| AC3 | KrisFlyer UOB is recommended for Travel | User views recommendation | Shows: "Earn 3 mpd on SIA purchases (flights, SIA website). 1.2 mpd on other travel." |
| AC4 | SC X Card is recommended for Dining | User views recommendation | Shows: "Earn 3.3 mpd with min spend $500/month. Otherwise 0.4 mpd." |
| AC5 | UOB Preferred Platinum for Dining | User views recommendation | Shows: "Earn 4 mpd (10X UNI$) on dining with min spend $600/month." |
| AC6 | Condition text is long | Screen renders | Text wraps cleanly; no layout breakage; max 2 lines with ellipsis |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T21.17: Update `recommend()` RPC to return `conditions_note` field from `earn_rules` join | Software Engineer | 1.5h | None |
| T21.18: Update TypeScript types for recommendation response to include `conditions_note: string | null` | Developer | 0.5h | T21.17 |
| T21.19: Add conditions text UI to `app/recommend/[category].tsx` — below earn rate, muted style, max 2 lines | Developer | 3h | T21.18 |
| T21.20: Add conditions text to `RecommendationMatchBanner.tsx` (transaction log flow) | Developer | 1.5h | T21.18 |
| T21.21: Style condition text — secondary color, smaller font, italic, ellipsis for overflow | Developer | 1h | T21.19 |
| T21.22: Test: Verify conditions shown for cards with conditions (KrisFlyer UOB, SC X, UOB PP) | Tester | 1h | T21.19 |
| T21.23: Test: Verify no condition text for cards without conditions (DBS Altitude base rate) | Tester | 0.5h | T21.19 |
| T21.24: Test: Long condition text wraps cleanly on small screen (iPhone SE) | Tester | 0.5h | T21.21 |

---

#### S21.6: Insurance Warning Banner on Bills Recommendation Screen

> **As a** user viewing Bills recommendations,
> **I want** to see a clear warning that insurance payments are excluded from earning on most cards,
> **So that** I have realistic expectations and don't assume I'll earn 0.4+ mpd on Prudential or AIA payments.

**Priority**: P1 (Should Have — prevents user confusion)
**T-Shirt Size**: **S** (Small) — ~1 day
**Feature**: F32

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | User navigates to Bills recommendation screen | Screen loads | Warning banner visible at top (before card list): "Insurance payments (MCC 6300/6381/6399) are excluded from earning on most cards. Rates shown below apply to telco and utility bills." |
| AC2 | Warning banner is shown | User reads it | Styled as amber/yellow info banner with ⚠️ icon; dismissible but reappears on next visit |
| AC3 | User navigates to Dining recommendation screen | Screen loads | No warning banner shown (only appears on Bills) |
| AC4 | Banner is displayed | Layout | Does not push card list below the fold on small screens; compact design |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T21.25: Create `CategoryWarningBanner` component (reusable for future category-specific warnings) | Developer | 2h | None |
| T21.26: Add Bills-specific warning content and amber/yellow styling with ⚠️ icon | Developer | 1h | T21.25 |
| T21.27: Integrate banner into `app/recommend/[category].tsx` — show only when `category_id === 'bills'` | Developer | 1h | T21.25 |
| T21.28: Test: Banner visible on Bills, not on other categories | Tester | 0.5h | T21.27 |
| T21.29: Test: Banner layout doesn't push card list below fold on iPhone SE | Tester | 0.5h | T21.27 |

---

#### S21.7: Update Tests for 8-Category Coverage and New Exclusion

> **As the** development team,
> **I need** existing tests updated to reflect 8 categories (including `petrol` and `bills`) and the new HSBC Revolution exclusion,
> **So that** CI/CD catches regressions in category or exclusion logic.

**Priority**: P1 (Should Have — test coverage)
**T-Shirt Size**: **S** (Small) — ~1 day
**Feature**: F30 + F32

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Tests run | Category list tests execute | Tests expect 8 categories (dining, transport, online, groceries, petrol, bills, travel, general) |
| AC2 | Tests run | Merchant mapping tests execute | `gas_station` Google Places type maps to `petrol` in tests |
| AC3 | Tests run | Exclusion tests execute | HSBC Revolution MCC 5814 exclusion is validated |
| AC4 | All tests run | CI pipeline completes | All existing tests pass + new tests pass; zero regressions |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T21.30: Update `tests/card-rules.test.ts` to expect 8 categories (add `bills` alongside existing `petrol`) | Tester | 1h | S21.1 |
| T21.31: Update `tests/merchant.test.ts` to expect `petrol` for `gas_station` mapping | Tester | 0.5h | S21.2 |
| T21.32: Add test case for HSBC Revolution MCC 5814 exclusion | Tester | 1h | S21.4 |
| T21.33: Add test case for `recommend('bills')` returning differentiated results | Tester | 1.5h | S21.1 |
| T21.34: Run full test suite — verify zero regressions | Tester | 1h | All above |

---

### Sprint 21 — Dependencies Map

```
S21.1 (Bills earn rules) ──→ S21.7 (Tests update)
         │
         └──→ S21.5 (Conditions UI) ──→ S21.4 (HSBC exclusion verification)
                                              │
S21.2 (gas_station fix) ──→ S21.7             │
                                              ↓
S21.3 (Scraper schema) ──→ (independent)    S21.7 (Tests)

S21.6 (Insurance banner) ──→ (independent, parallel with S21.5)
```

**Critical Path**: S21.1 → S21.5 → S21.7 (data fix → UI → tests)
**Parallel Track**: S21.2, S21.3, S21.6 can all start Day 1

---

### Sprint 21 — Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Bills earn rules INSERT conflicts with existing data | Low | Medium | Use `ON CONFLICT DO UPDATE` for idempotent runs; verify no existing bills rules |
| `conditions_note` is NULL for most cards | Medium | Low | UI hides section when NULL; no visual noise |
| Insurance warning banner pushes content below fold | Low | Low | Compact design; test on iPhone SE; make dismissible |
| Gas_station mapping change affects existing user overrides | Low | Low | User overrides have higher priority than Places API; no impact |
| AI scraper schema change breaks existing detections | Low | Medium | `bills` is additive (new enum value); existing values unchanged |

---

### Sprint 21 — Schedule

| Days | Focus | Stories | Owners |
|------|-------|---------|--------|
| **Days 1-3** | Data fixes | S21.1 (bills earn rules), S21.2 (gas_station), S21.3 (scraper), S21.4 (HSBC exclusion) | Data Engineer, Developer, Software Engineer |
| **Days 4-7** | UI implementation | S21.5 (conditions_note display), S21.6 (insurance banner) | Developer, Software Engineer |
| **Days 8-9** | Testing | S21.7 (test updates + full regression) | Tester |
| **Day 10** | Stabilization + review | Bug fixes, code review, PR merge | All |

---

## Sprint 22: "Smart Scoring" (F31 — Min Spend Condition Enforcement)

**Duration**: 2 weeks (10 working days)
**Sprint Goal**: Enforce minimum monthly spend conditions in the recommendation scoring algorithm so that cards requiring $300-$600/month min spend are downranked to base rate for users who haven't met the threshold, preventing wrong recommendations for ~5 of 20 cards.
**Epic**: E14 — Recommendation Accuracy Improvements (Post-MileLion Analysis)
**PRD Feature**: F31 (P1, RICE 3400)
**Phase**: v2.2 — Recommendation Accuracy
**Predecessor**: Sprint 21 (F30 data fix must be complete — bills earn rules must exist before condition checks)
**Reference**: `docs/technical/MAXIMILE_VS_MILELION_ANALYSIS.md`, `docs/technical/RECOMMENDATION_AND_CATEGORY_LOGIC.md`

---

### Sprint 22 — Definition of Ready (DoR) Checklist

Before any story enters the sprint, it must satisfy:

- [ ] User story has clear "As a... I want... So that..." statement
- [ ] Acceptance criteria defined and reviewed by PM + Tech Lead
- [ ] T-shirt size estimated by the team
- [ ] Dependencies identified — Sprint 21 complete (F30 shipped, bills earn rules exist)
- [ ] Cards with `min_spend_monthly` conditions identified: SC X Card ($500), UOB Preferred Platinum ($600), Maybank Horizon ($300), Maybank FC Barcelona ($300), KrisFlyer UOB (conditional on contactless — separate consideration)
- [ ] `recommend()` RPC current behaviour understood and documented
- [ ] UX for "spend more to unlock" nudge designed (can be wireframe)

### Sprint 22 — Definition of Done (DoD) Checklist

A story is "Done" when:

- [ ] Feature works as described in all acceptance criteria
- [ ] Unit tests written and passing (happy path + edge cases)
- [ ] `recommend()` returns downranked results for cards whose min spend isn't met
- [ ] SC X Card shows 0.4 mpd (not 3.3 mpd) for users spending <$500/month
- [ ] UOB Preferred Platinum shows 0.4 mpd (not 4 mpd) for users spending <$600/month
- [ ] "Spend $X more to unlock bonus rate" message visible on downranked cards
- [ ] No P0 or P1 bugs remaining
- [ ] Code committed to main branch and peer-reviewed
- [ ] All existing tests pass (no regressions)
- [ ] Recommendation engine performance still < 10ms for typical users

---

### Sprint 22 Stories

| ID | Story | Priority | Size | Points | Owner |
|----|-------|----------|------|--------|-------|
| **S22.1** | Modify `recommend()` RPC to check min spend conditions | P0 | L | 5 | Software Engineer |
| **S22.2** | Add "Spend more to unlock" nudge on recommendation cards | P1 | M | 3 | Developer |
| **S22.3** | ~~Add user monthly spending estimate in Settings~~ **DEFERRED — hidden from demo UI** | P1 | M | 3 | Developer |
| **S22.4** | Comprehensive testing of condition-aware recommendations | P1 | M | 3 | Tester |
| **Total** | | | | **14** | |

---

### Sprint 22 — User Story Details

#### S22.1: Modify `recommend()` RPC to Check Min Spend Conditions

> **As a** user who spends less than $500/month,
> **I want** SC X Card to show me 0.4 mpd (not 3.3 mpd),
> **So that** I don't follow a recommendation that won't actually earn me bonus miles.

**Priority**: P0 (Must Have — fixes wrong recommendations)
**T-Shirt Size**: **L** (Large) — ~4 days
**Feature**: F31

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | SC X Card has `conditions: {"min_spend_monthly": 500}` | User has spent $200 this month | `recommend('dining')` returns SC X Card at 0.4 mpd (base rate, not 3.3 mpd bonus) |
| AC2 | SC X Card has min spend condition | User has spent $550 this month | `recommend('dining')` returns SC X Card at 3.3 mpd (bonus rate unlocked) |
| AC3 | UOB Preferred Platinum has `conditions: {"min_spend_monthly": 600}` | User has spent $400 this month | `recommend('dining')` returns UOB PP at 0.4 mpd (not 4 mpd) |
| AC4 | Maybank Horizon has `conditions: {"min_spend_monthly": 300}` | User has spent $350 this month | `recommend('dining')` returns Maybank Horizon at 1.6 mpd (bonus unlocked) |
| AC5 | Card has no min_spend condition (NULL conditions) | User has any spend level | Card scored at normal bonus rate (no change from current behaviour) |
| AC6 | New month starts (March 1) | User's monthly spend resets to $0 | All cards with min spend conditions revert to base rate until threshold met again |
| AC7 | Performance check | `recommend()` called with condition checks | Response time still < 10ms for 5-card user |
| AC8 | The RPC returns a downranked card | Result set includes the card | A new field `min_spend_remaining` shows how much more the user needs to spend (e.g., $300 remaining) |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T22.01: Analyze current `recommend()` RPC — identify where to inject condition check (after `user_card_rates` CTE) | Software Engineer | 1h | None |
| T22.02: Add new CTE `total_monthly_spend` — aggregate total user spend across ALL categories for current month | Software Engineer | 1.5h | T22.01 |
| T22.03: Add condition check logic — if `earn_rules.conditions->>'min_spend_monthly'` exists AND user spend < threshold, use `base_rate_mpd` instead of bonus `earn_rate_mpd` | Software Engineer | 3h | T22.02 |
| T22.04: Add `min_spend_remaining` to return type — calculated as `MAX(0, threshold - total_spend)` (NULL if no condition) | Software Engineer | 1.5h | T22.03 |
| T22.05: Handle edge case: card with both min spend AND cap — min spend checked first, then cap ratio applied | Software Engineer | 2h | T22.03 |
| T22.06: Add `conditions_note` to return columns (if not already added in Sprint 21) | Software Engineer | 0.5h | Sprint 21 S21.5 |
| T22.07: Performance test — `EXPLAIN ANALYZE` on modified query with 7-card user | Software Engineer | 1h | T22.03 |
| T22.08: Create migration script for updated `recommend()` function | Software Engineer | 0.5h | T22.05 |
| T22.09: Deploy to Supabase and verify with manual RPC calls | Software Engineer | 1h | T22.08 |

---

#### S22.2: "Spend More to Unlock" Nudge on Recommendation Cards

> **As a** user who hasn't met a card's min spend threshold this month,
> **I want** to see "Spend $X more to unlock bonus rate" on the recommendation card,
> **So that** I understand why the earn rate is lower than expected and what I can do about it.

**Priority**: P1 (Should Have — UX clarity)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F31

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | SC X Card is downranked (user spent $200, threshold $500) | User views recommendation | Orange badge: "Spend $300 more this month to unlock 3.3 mpd" |
| AC2 | SC X Card has met min spend (user spent $550) | User views recommendation | No orange badge; normal 3.3 mpd display |
| AC3 | Card has no min spend condition | User views recommendation | No badge or nudge shown |
| AC4 | Multiple cards are downranked | User views recommendation list | Each downranked card shows its own nudge with correct remaining amount |
| AC5 | User taps the nudge badge | Badge is tapped | Tooltip/expandable shows: "This card requires $500/month total spend to unlock bonus rates. You've spent $200 so far this month." |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T22.10: Update TypeScript types for recommendation response to include `min_spend_remaining: number | null` | Developer | 0.5h | S22.1 T22.04 |
| T22.11: Create `MinSpendNudge` component — orange badge with "Spend $X more to unlock Y mpd" | Developer | 2h | T22.10 |
| T22.12: Integrate `MinSpendNudge` into recommendation card in `app/recommend/[category].tsx` | Developer | 1.5h | T22.11 |
| T22.13: Add tap-to-expand tooltip with full explanation text | Developer | 1.5h | T22.12 |
| T22.14: Integrate into `RecommendationMatchBanner.tsx` (transaction log flow) | Developer | 1h | T22.11 |
| T22.15: Test: SC X shows nudge at $200 spend, no nudge at $550 spend | Tester | 1h | T22.12 |
| T22.16: Test: Card without min spend shows no nudge | Tester | 0.5h | T22.12 |

---

#### S22.3: User Monthly Spending Estimate in Settings

> **STATUS: DEFERRED — Not included in demo.** UI page (`spending-settings`) exists in codebase but navigation link commented out. `recommend()` hardcodes spend to 0. Database table not deployed. Code preserved for post-demo enablement.
>
> **Affected cards** (7): SC X Card ($500/mo), Maybank Horizon ($300/mo), Maybank Barcelona ($300/mo), UOB Preferred Platinum ($600/mo), UOB Visa Signature ($1,000/mo), DBS Insignia, Maybank Family & Friends.

> **As a** user,
> **I want** to set my estimated monthly spending level in Settings,
> **So that** the app knows whether I'm likely to meet card-specific minimum spend thresholds even before I've logged enough transactions this month.

**Priority**: P1 (Should Have — improves first-month accuracy)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F31
**Status**: **Deferred** — hidden from demo, implement post-demo

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | User navigates to Settings | Settings screen loads | "Monthly Spending Estimate" section visible with input field |
| AC2 | User enters $2,000 as estimate | Value is saved | Stored in `user_preferences` table (or user profile) |
| AC3 | It's the 1st of the month (no transactions logged yet) | User selects a category for recommendation | `recommend()` uses the estimate as a proxy for min spend check until actual transactions exist |
| AC4 | User has logged $800 in transactions this month | User selects a category | `recommend()` uses actual transaction total ($800), NOT the estimate |
| AC5 | User doesn't set an estimate (NULL) | User selects a category early in month | `recommend()` uses actual transaction total only (may be $0, so all min-spend cards default to base rate) |
| AC6 | User updates estimate from $2,000 to $500 | Value is saved | Future recommendations reflect the new estimate |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T22.17: Add `monthly_spend_estimate` column to user profile or `user_preferences` table | Data Engineer | 0.5h | None |
| T22.18: Write migration for new column | Data Engineer | 0.5h | T22.17 |
| T22.19: Build Settings UI — "Monthly Spending Estimate" input with SGD prefix, numeric keyboard | Developer | 2h | None |
| T22.20: Wire Settings input to upsert `monthly_spend_estimate` via Supabase | Developer | 1h | T22.17 |
| T22.21: Update `recommend()` RPC — use `GREATEST(actual_total_spend, monthly_spend_estimate)` for condition check when actual spend is below estimate | Software Engineer | 2h | S22.1, T22.18 |
| T22.22: Test: Set estimate $2,000, no transactions → SC X shows 3.3 mpd (estimate > $500 threshold) | Tester | 1h | T22.21 |
| T22.23: Test: No estimate, no transactions → SC X shows 0.4 mpd (defaults to actual $0) | Tester | 0.5h | T22.21 |
| T22.24: Test: Actual spend $800 overrides estimate $500 → uses $800 for condition check | Tester | 0.5h | T22.21 |

---

#### S22.4: Comprehensive Testing of Condition-Aware Recommendations

> **As the** development team,
> **I need** thorough testing of the min spend condition enforcement across all affected cards,
> **So that** we're confident the algorithm produces correct results in all scenarios.

**Priority**: P1 (Should Have — quality gate)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F31

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | All affected cards tested | Test suite runs | SC X ($500), UOB PP ($600), Maybank Horizon ($300), Maybank FC Barcelona ($300) all correctly downranked/upgraded based on spend |
| AC2 | Cards without conditions tested | Test suite runs | DBS Altitude, Citi PremierMiles, HSBC Revolution, etc. behave identically to pre-Sprint 22 |
| AC3 | Edge cases tested | Test suite runs | Zero spend, exact threshold, one dollar below, one dollar above, mid-month, month rollover |
| AC4 | Performance tested | Benchmark runs | `recommend()` still < 10ms for 7-card portfolio |
| AC5 | Ranking tested | Test suite runs | Cards re-ranked correctly when condition state changes (e.g., SC X drops from #1 to #5 when user hasn't met min spend) |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T22.25: Write unit tests for `recommend()` with min spend conditions — 5 affected cards × 3 spend scenarios | Tester | 3h | S22.1 |
| T22.26: Write edge case tests — zero spend, exact threshold ($500.00), $499.99, $500.01 | Tester | 2h | S22.1 |
| T22.27: Write regression tests — verify unaffected cards (15 of 20) produce same results as before | Tester | 2h | S22.1 |
| T22.28: Write month rollover test — simulate February→March transition, verify reset | Tester | 1.5h | S22.1 |
| T22.29: Performance benchmark — `EXPLAIN ANALYZE` with modified RPC, compare to baseline | Software Engineer | 1h | S22.1 |
| T22.30: E2E test — full user flow: set estimate → log transaction → check recommendation changes | Tester | 2h | S22.2, S22.3 |
| T22.31: Bug fixes + stabilization | Developer + Software Engineer | 3h | All tests |

---

### Sprint 22 — Dependencies Map

```
S22.1 (recommend() RPC) ──→ S22.2 (Nudge UI)
         │                        │
         │                        ↓
         └──→ S22.3 (Settings) ──→ S22.4 (Testing)
                                        │
                                        ↓
                               Sprint 22 Complete
```

**Critical Path**: S22.1 (algorithm) → S22.4 (testing)
**Parallel**: S22.2 (nudge UI) and S22.3 (settings) can start after S22.1 ships, run in parallel

---

### Sprint 22 — Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| `recommend()` RPC performance degrades with condition check | Low | High | Pre-compute total monthly spend in CTE; add index on transactions(user_id, transaction_date); benchmark with `EXPLAIN ANALYZE` |
| Edge case: card with BOTH min spend AND cap creates confusing UX | Medium | Medium | Check min spend first → if met, apply cap ratio; if not met, show base rate + nudge. Document logic clearly |
| User confusion about "estimate" vs actual spend | Medium | Low | Settings label: "Estimated Monthly Card Spending (all cards combined)"; help text explains it's used for early-month recommendations |
| Min spend is per-card or total? Ambiguity in bank T&Cs | Medium | High | Verify with bank T&Cs: SC X = total across all transactions; UOB PP = total. Store in `conditions` JSONB as `min_spend_monthly` (total). If per-category, add `min_spend_scope: 'total' | 'category'` |
| Month rollover edge case at midnight SGT | Low | Low | Use `date_trunc('month', CURRENT_DATE AT TIME ZONE 'Asia/Singapore')` for month boundary |

---

### Sprint 22 — Schedule

| Days | Focus | Stories | Owners |
|------|-------|---------|--------|
| **Days 1-4** | Algorithm implementation | S22.1 (`recommend()` RPC modification) | Software Engineer |
| **Days 3-6** | UI implementation | S22.2 (nudge component), S22.3 (settings) | Developer, Data Engineer |
| **Days 5-8** | Testing | S22.4 (comprehensive tests — unit, edge case, regression, performance) | Tester |
| **Days 9-10** | Stabilization + review | Bug fixes, code review, PR merge, performance validation | All |

---

## Sprint 21-22 Summary: Recommendation Accuracy Roadmap

### Total Effort

| Sprint | Phase | Features | Stories | Points | Duration |
|--------|-------|----------|---------|--------|----------|
| **Sprint 21** | Data Fix + UI | F30 + F32 | 7 | 14 | 2 weeks |
| **Sprint 22** | Smart Scoring | F31 | 4 | 14 | 2 weeks |
| **Total** | | **F30 + F31 + F32** | **11** | **28** | **4 weeks** |

### Key Milestones

| Milestone | Sprint | Success Criteria |
|-----------|--------|------------------|
| **Bills Earn Rules Live** | Sprint 21 | `recommend('bills')` returns differentiated results for all 20 cards |
| **Gas Station Fix** | Sprint 21 | Google Places `gas_station` → `petrol` (not `transport`) |
| **Conditions Visible** | Sprint 21 | `conditions_note` shown on recommendation cards; insurance warning on Bills |
| **Min Spend Enforced** | Sprint 22 | SC X shows 0.4 mpd (not 3.3 mpd) for users spending <$500/month |
| **Recommendation Accuracy Complete** | Sprint 22 | All 20 cards produce correct recommendations under all spending scenarios |
| **Card Expansion to 22** | Post-Sprint 22 | Maybank World MC + UOB Visa Signature added, 4 new tests passing |

### Dependencies & Prerequisites

| Sprint | Hard Dependencies | Soft Dependencies |
|--------|-------------------|-------------------|
| **Sprint 21** | Sprint 20 complete | None |
| **Sprint 22** | Sprint 21 complete (F30 shipped) | UX wireframe for "spend more" nudge |
| **Card Expansion** | Sprint 22 complete (min spend + contactless) | None |

### Reference Documentation

- **MileLion Analysis**: `docs/technical/MAXIMILE_VS_MILELION_ANALYSIS.md`
- **Card Data Verification**: `docs/technical/CARD_DATA_VERIFICATION.md`
- **Recommendation Logic**: `docs/technical/RECOMMENDATION_AND_CATEGORY_LOGIC.md`
- **PRD v2.2**: `docs/planning/PRD.md` (Section 8, P0.5)
- **PM Handover**: `.claude/handover/pm-to-scrum.md`

---

## Card Expansion: Maybank World Mastercard + UOB Visa Signature

**Date**: 2026-02-27
**Prerequisite**: Sprint 21-22 complete (petrol/bills resolution, min spend enforcement, contactless badge)

### Story: Expand Card Database from 20 to 22 Cards

> **As a** user who holds a Maybank World Mastercard or UOB Visa Signature,
> **I want** the app to include my card in recommendations,
> **So that** I get accurate "use this card" advice for my spending categories.

**Cards Added:**

| # | Card | Key Feature | Why Now |
|---|------|-------------|---------|
| 21 | Maybank World Mastercard | 4 mpd petrol, uncapped, no min spend | Petrol/bills resolution (Sprint 21) makes this viable |
| 22 | UOB Visa Signature | 4 mpd contactless + petrol, $1,000 min spend, $1,200 cap | Min spend enforcement + contactless badge (Sprint 22) handle dual conditions |

**Changes:**

| File | Change |
|------|--------|
| `database/seeds/all_cards.sql` | +2 card metadata, +16 earn rules, +1 cap (UOB VS shared), +4 exclusions |
| `tests/mocks/test-data.ts` | +2 mock cards, +16 earn rules, +1 cap constant |
| `tests/recommendation.test.ts` | +4 test cases (40 total, all passing) |
| `docs/technical/CARD_DATA_VERIFICATION.md` | +2 card data sheets, updated counts |
| `docs/technical/MAXIMILE_VS_MILELION_ANALYSIS.md` | Updated gap status, P3 completed |
| `docs/technical/RECOMMENDATION_AND_CATEGORY_LOGIC.md` | Updated card count, test count |

**Verification:**
- All 40 tests pass (`npm test`)
- SQL is syntactically correct with ON CONFLICT for idempotent re-runs
- Card count consistent across all docs: 22

---

**Sprint 21-22 Status**: Sprint 21 ✅ COMPLETED (F30 Petrol/Bills Resolution + F32 Condition Transparency — conditions_note displayed on recommendation cards, HSBC Revolution MCC 5814 exclusion seeded, insurance warning on Bills screen) | Sprint 22 ✅ COMPLETED (Min Spend Enforcement — migration 020, spending-settings.tsx) | Card Expansion (20→22) ✅ COMPLETED

**Next Steps**:
1. Complete Sprint 20 (Push Notifications)
2. Begin Sprint 21 — start with S21.1 (bills earn rules) and S21.2 (gas_station fix) on Day 1
3. Sprint 22 begins after Sprint 21 ships
4. Sprint 23-24 (F33 Card Expansion 22→29) begins after Sprint 22 ships

---

## Sprint 23: "More Cards" (F33 Part 1 — 6 Straightforward Cards: 22→28)

**Duration**: 1 week (5 working days)
**Sprint Goal**: Add 6 straightforward miles cards to the database (DBS Vantage, OCBC Voyage, SC Journey, SC Beyond, HSBC Premier MC, Maybank XL Rewards) — all follow existing data patterns with no new UX required.
**Epic**: E10 — Card Coverage Expansion & Rate Monitoring (F33)
**PRD Feature**: F33 (P1, RICE 4050)
**Phase**: v2.3 — Card Expansion
**Predecessor**: Sprint 22 (F31 min spend enforcement must be complete — DBS Vantage and Maybank XL have min spend conditions)
**Reference**: `docs/technical/CARD_DATA_VERIFICATION.md`, `docs/technical/RECOMMENDATION_AND_CATEGORY_LOGIC.md`

---

### Sprint 23 — Definition of Ready (DoR) Checklist

Before any story enters the sprint, it must satisfy:

- [ ] User story has clear "As a... I want... So that..." statement
- [ ] Acceptance criteria defined and reviewed
- [ ] T-shirt size estimated
- [ ] Sprint 22 complete (min spend enforcement working — needed for DBS Vantage $2K/month and Maybank XL $500/month)
- [ ] All 6 card earn rates verified against bank T&Cs and MileLion/SingSaver
- [ ] Card image assets exist in `assets/cards/` (all 6 confirmed present)
- [ ] UUIDs assigned (batch 4: `00000000-0000-0000-0004-000000000023` through `...0028`)

### Sprint 23 — Definition of Done (DoD) Checklist

A story is "Done" when:

- [ ] Card data inserted into `all_cards.sql` with ON CONFLICT for idempotent re-runs
- [ ] Earn rules cover all 8 categories per card (48 total new rows)
- [ ] Caps and exclusions added where applicable
- [ ] Mock test data added to `tests/mocks/test-data.ts`
- [ ] New recommendation test cases pass
- [ ] All existing tests pass (no regressions)
- [ ] `recommend()` returns correct results for new cards (verified manually)
- [ ] Documentation updated (CARD_DATA_VERIFICATION.md, RECOMMENDATION_AND_CATEGORY_LOGIC.md)
- [ ] Card count consistent across all docs: 28

---

### Sprint 23 Stories

| ID | Story | Priority | Size | Points | Owner |
|----|-------|----------|------|--------|-------|
| **S23.1** | Add 3 flat-rate cards to database (OCBC Voyage, SC Beyond, HSBC Premier MC) | P0 | M | 3 | Data Engineer |
| **S23.2** | Add DBS Vantage Visa Infinite with $2,000/month min spend condition | P0 | M | 3 | Data Engineer |
| **S23.3** | Add SC Journey Card with online transport/grocery bonus | P0 | M | 3 | Data Engineer |
| **S23.4** | Add Maybank XL Rewards with $500/month min spend + age restriction | P0 | M | 3 | Data Engineer |
| **S23.5** | Add test cases for all 6 new cards | P1 | M | 3 | Tester |
| **S23.6** | Update documentation for card expansion 22→28 | P1 | S | 1 | Scrum Master |
| **Total** | | | | **16** | |

---

### Sprint 23 — User Story Details

#### S23.1: Add 3 Flat-Rate Cards (OCBC Voyage, SC Beyond, HSBC Premier MC)

> **As a** user with an OCBC Voyage, SC Beyond, or HSBC Premier Mastercard,
> **I want** my card to appear in MaxiMile recommendations,
> **So that** I see accurate earn rates when comparing cards for any spend category.

**Priority**: P0
**T-Shirt Size**: **M** (Moderate) — ~1 day
**Feature**: F33

**Card Data Summary**:

| Card | Slug | Network | Base Rate | Conditions | Cap |
|------|------|---------|-----------|------------|-----|
| OCBC Voyage Card | `ocbc-voyage-card` | visa | 1.3 mpd (all categories) | None | None |
| SC Beyond Card | `sc-beyond-card` | mastercard | 1.5 mpd (all categories) | None | None |
| HSBC Premier MC | `hsbc-premier-mc` | mastercard | 1.4 mpd (all categories) | None | None |

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | OCBC Voyage added to database | `recommend('dining')` called for user with OCBC Voyage | Returns 1.3 mpd |
| AC2 | SC Beyond added to database | `recommend('general')` called | Returns 1.5 mpd, no conditions badge |
| AC3 | HSBC Premier MC added | `recommend('petrol')` called | Returns 1.4 mpd, no cap indicator |
| AC4 | All 3 cards have 8 earn rule rows each | SQL seed re-run | ON CONFLICT handles idempotent insert |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T23.01: Add 3 card metadata rows to `all_cards.sql` Section 2 | Data Engineer | 0.5h | None |
| T23.02: Add 24 earn rule rows (8 per card, all same rate) | Data Engineer | 1h | T23.01 |
| T23.03: Add standard exclusion rows (government + insurance) | Data Engineer | 0.5h | T23.01 |
| T23.04: Verify SQL syntax and test with `psql` | Data Engineer | 0.5h | T23.02 |

---

#### S23.2: Add DBS Vantage Visa Infinite with Min Spend Condition

> **As a** user with a DBS Vantage card who spends $2,000+/month,
> **I want** the app to show me 1.5 mpd (not 1.0 mpd),
> **So that** my recommendation reflects my actual earning rate.

**Priority**: P0
**T-Shirt Size**: **M** (Moderate) — ~1 day
**Feature**: F33

**Card Data**:

| Field | Value |
|-------|-------|
| Slug | `dbs-vantage-visa-infinite` |
| Network | visa |
| Annual Fee | $599.50 |
| Base Rate | 1.0 mpd (min spend NOT met) |
| Bonus Rate | 1.5 mpd all categories (min spend met) |
| Min Spend | $2,000/month |
| Cap | None |

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | DBS Vantage has `conditions: {"min_spend_monthly": 2000}` | User has spent $1,500 this month | Card shows 1.0 mpd (base rate, downranked by F31 logic) |
| AC2 | Same card | User has spent $2,200 this month | Card shows 1.5 mpd (bonus unlocked) |
| AC3 | All 8 categories have same rate | `recommend('dining')` and `recommend('petrol')` | Both return 1.5 mpd (or 1.0 mpd if min spend not met) |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T23.05: Add card metadata with `base_rate_mpd: 1.0` | Data Engineer | 0.5h | None |
| T23.06: Add 8 earn rules at 1.5 mpd with `{"min_spend_monthly": 2000}` condition | Data Engineer | 1h | T23.05 |
| T23.07: Add exclusion rows | Data Engineer | 0.5h | T23.05 |
| T23.08: Verify min spend downranking works via `recommend()` | Tester | 0.5h | T23.06, Sprint 22 |

---

#### S23.3: Add SC Journey Card with Online Bonus Categories

> **As a** user with an SC Journey Card,
> **I want** to see 3 mpd for online food delivery and grocery delivery,
> **So that** I know to use this card when ordering from Grab or online groceries.

**Priority**: P0
**T-Shirt Size**: **M** (Moderate) — ~1 day
**Feature**: F33

**Card Data**:

| Field | Value |
|-------|-------|
| Slug | `sc-journey-card` |
| Network | visa |
| Annual Fee | $196.20 |
| Base Rate | 1.2 mpd |
| Bonus Categories | Online transport (3.0 mpd), Online groceries (3.0 mpd) |
| Cap | $1,000/month shared across bonus categories |

**Note**: The 3 mpd bonus applies to ONLINE transactions (food delivery, ride-hailing apps, online grocery). In-store dining/groceries earn base 1.2 mpd. In our category model, this maps to `transport` and `groceries` with a `conditions_note` explaining the online-only distinction.

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | SC Journey transport earn rule = 3.0 mpd | `recommend('transport')` | Returns 3.0 mpd with note "Online transport/food delivery only" |
| AC2 | SC Journey groceries earn rule = 3.0 mpd | `recommend('groceries')` | Returns 3.0 mpd with note "Online grocery delivery only" |
| AC3 | Combined cap $1,000/month | User spends $900 on transport | Groceries cap remaining = $100 |
| AC4 | User at in-store restaurant | `recommend('dining')` | SC Journey shows 1.2 mpd (base rate) |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T23.09: Add card metadata | Data Engineer | 0.5h | None |
| T23.10: Add 8 earn rules (transport + groceries at 3.0 mpd bonus, others at 1.2 base) | Data Engineer | 1h | T23.09 |
| T23.11: Add shared cap row (NULL category, $1,000, 'spend') | Data Engineer | 0.5h | T23.09 |
| T23.12: Add exclusion rows | Data Engineer | 0.5h | T23.09 |

---

#### S23.4: Add Maybank XL Rewards with Min Spend + Age Restriction

> **As a** young professional (age 21-39) with a Maybank XL Rewards card,
> **I want** to see my 4 mpd bonus on dining, online shopping, and travel,
> **So that** I maximize the card's earning potential on my everyday spending.

**Priority**: P0
**T-Shirt Size**: **M** (Moderate) — ~1 day
**Feature**: F33

**Card Data**:

| Field | Value |
|-------|-------|
| Slug | `maybank-xl-rewards` |
| Network | mastercard |
| Annual Fee | $87.20 |
| Base Rate | 0.4 mpd |
| Bonus Categories | Dining (4.0 mpd), Online/Shopping (4.0 mpd), Travel (4.0 mpd) |
| Cap | $1,000/month shared across bonus categories |
| Min Spend | $500/month |
| Age Restriction | 21-39 only |
| Points Expiry | 1 year |

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Maybank XL has `{"min_spend_monthly": 500}` on dining | User spends $600/month | `recommend('dining')` returns 4.0 mpd |
| AC2 | Same card | User spends $300/month | `recommend('dining')` returns 0.4 mpd (downranked) |
| AC3 | Online earn rule = 4.0 mpd | `recommend('online')` with min spend met | Returns 4.0 mpd |
| AC4 | Transport is NOT a bonus category | `recommend('transport')` | Returns 0.4 mpd base rate |
| AC5 | Combined cap $1,000/month | User spends $800 on dining + $300 online | Cap exceeded — remaining bonus categories downranked |
| AC6 | Card notes include "Age 21-39 only" | Card displayed in portfolio browse | Age restriction visible in card notes |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T23.13: Add card metadata with age restriction in notes | Data Engineer | 0.5h | None |
| T23.14: Add 8 earn rules (dining/online/travel at 4.0 bonus + $500 min spend, others at 0.4 base) | Data Engineer | 1h | T23.13 |
| T23.15: Add shared cap row ($1,000/month) | Data Engineer | 0.5h | T23.13 |
| T23.16: Add exclusion rows (government + insurance) | Data Engineer | 0.5h | T23.13 |

---

#### S23.5: Test Cases for 6 New Cards

> **As a** developer,
> **I want** comprehensive test coverage for all 6 new cards,
> **So that** future code changes don't break recommendation accuracy for these cards.

**Priority**: P1
**T-Shirt Size**: **M** (Moderate) — ~1 day
**Feature**: F33

**Test Cases to Add**:

| # | Test | Expected Result |
|---|------|-----------------|
| TC1 | OCBC Voyage general recommendation | 1.3 mpd, no conditions |
| TC2 | SC Beyond dining recommendation | 1.5 mpd, no conditions |
| TC3 | HSBC Premier MC petrol recommendation | 1.4 mpd, no conditions |
| TC4 | DBS Vantage with min spend met ($2,000+) | 1.5 mpd all categories |
| TC5 | DBS Vantage without min spend (<$2,000) | 1.0 mpd (downranked) |
| TC6 | SC Journey transport (online) | 3.0 mpd, cap $1,000 |
| TC7 | SC Journey dining (in-store) | 1.2 mpd base rate |
| TC8 | Maybank XL dining with min spend met | 4.0 mpd, cap $1,000 |
| TC9 | Maybank XL transport (not bonus) | 0.4 mpd base rate |
| TC10 | Maybank XL dining without min spend | 0.4 mpd (downranked) |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T23.17: Add 6 mock cards to `test-data.ts` | Tester | 1.5h | S23.1-S23.4 complete |
| T23.18: Add 10 test cases to `recommendation.test.ts` | Tester | 2h | T23.17 |
| T23.19: Run full test suite, verify all pass | Tester | 0.5h | T23.18 |

---

#### S23.6: Documentation Update for Card Expansion 22→28

> **As a** team member,
> **I want** all documentation to reflect the new card count of 28,
> **So that** card data verification docs, analysis docs, and technical docs are consistent.

**Priority**: P1
**T-Shirt Size**: **S** (Simple) — ~2 hours
**Feature**: F33

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T23.20: Update `CARD_DATA_VERIFICATION.md` — add 6 card data sheets | Scrum Master | 1h | S23.1-S23.4 |
| T23.21: Update `RECOMMENDATION_AND_CATEGORY_LOGIC.md` — card count + test count | Scrum Master | 0.5h | S23.5 |
| T23.22: Update `MAXIMILE_VS_MILELION_ANALYSIS.md` — gap status | Scrum Master | 0.5h | S23.1-S23.4 |

---

### Sprint 23 — Dependencies Map

```
Sprint 22 (F31 Min Spend) ─────────────────────────────────────────┐
                                                                    ▼
S23.1 (3 flat-rate cards) ──────────────┐                   S23.2 (DBS Vantage)
S23.3 (SC Journey) ────────────────────┤                   S23.4 (Maybank XL)
                                        │                          │
                                        ▼                          ▼
                                   S23.5 (Tests) ◄─────────────────┘
                                        │
                                        ▼
                                   S23.6 (Docs)
```

- **S23.1** has no internal dependencies (flat-rate cards, no conditions)
- **S23.2** and **S23.4** depend on Sprint 22 (min spend enforcement must work)
- **S23.3** follows existing cap patterns (no new logic needed)
- **S23.5** depends on all card data stories
- **S23.6** depends on tests passing

---

### Sprint 23 — Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SC Journey "online-only" bonus doesn't fit category model cleanly | Medium | Medium | Use `conditions_note` to explain distinction; model as transport/groceries bonus with note |
| DBS Vantage $2K min spend rarely met by users | Low | Low | F31 handles this — card correctly downranked for low spenders |
| Maybank XL age restriction not enforceable in app | Low | Low | Display in card notes; don't filter in card browse (user responsibility) |
| Points expiry (Maybank XL: 1 year) not tracked | Low | Low | Out of scope for v1; note in card description |

---

### Sprint 23 — Schedule

| Day | Focus | Deliverables |
|-----|-------|-------------|
| **Day 1** | S23.1: 3 flat-rate cards (OCBC Voyage, SC Beyond, HSBC Premier MC) | 3 cards + 24 earn rules + exclusions in SQL |
| **Day 2** | S23.2 + S23.3: DBS Vantage + SC Journey | 2 cards + conditions + caps in SQL |
| **Day 3** | S23.4: Maybank XL Rewards | 1 card + conditions + cap + age note in SQL |
| **Day 4** | S23.5: All test cases | 10 new tests, mock data, full suite passing |
| **Day 5** | S23.6: Documentation + verification | All docs updated, card count = 28 everywhere |

---

## Sprint 24: "Smart Categories" (F33 Part 2 — UOB Lady's Solitaire: 28→29)

**Duration**: 1 week (5 working days)
**Sprint Goal**: Add UOB Lady's Solitaire with user-selectable bonus categories — the only card in the database where the user chooses which categories earn the bonus rate, requiring new UX and recommend() logic.
**Epic**: E10 — Card Coverage Expansion & Rate Monitoring (F33)
**PRD Feature**: F33 (P1, RICE 4050)
**Phase**: v2.3 — Card Expansion
**Predecessor**: Sprint 23 (28-card database must be stable before adding UX complexity)
**Reference**: `docs/planning/PRD.md` (F33), UOB official site

---

### Sprint 24 — Definition of Ready (DoR) Checklist

- [ ] User story has clear "As a... I want... So that..." statement
- [ ] Acceptance criteria defined
- [ ] T-shirt size estimated
- [ ] Sprint 23 complete (6 straightforward cards stable)
- [ ] UOB Lady's Solitaire earn rates verified: 4.0 mpd on 2 chosen categories, 0.4 mpd base
- [ ] Category mapping defined: Fashion→general, Beauty & Wellness→general, Family→groceries, Entertainment→general (best fit)
- [ ] UX wireframe for category selection ready (or in-sprint design)
- [ ] Card image `uob-ladys-solitaire.png` exists in `assets/cards/`

### Sprint 24 — Definition of Done (DoD) Checklist

- [ ] UOB Lady's Solitaire card data in `all_cards.sql`
- [ ] User can select 2 preferred categories for the card
- [ ] `recommend()` uses user's selected categories for bonus rate
- [ ] Default behaviour when no categories selected: base rate (0.4 mpd)
- [ ] UI for category selection accessible from card detail screen
- [ ] Tests cover category selection logic
- [ ] All existing tests pass
- [ ] Documentation updated (card count = 29)

---

### Sprint 24 Stories

| ID | Story | Priority | Size | Points | Owner |
|----|-------|----------|------|--------|-------|
| **S24.1** | Add UOB Lady's Solitaire base card data to database | P0 | S | 2 | Data Engineer |
| **S24.2** | Design and implement category selection UX | P0 | L | 5 | Developer + Designer |
| **S24.3** | Modify `recommend()` to use user-selected bonus categories | P0 | L | 5 | Software Engineer |
| **S24.4** | Add test cases for UOB Lady's Solitaire | P1 | M | 3 | Tester |
| **S24.5** | Update documentation for 29-card database | P1 | S | 1 | Scrum Master |
| **Total** | | | | **16** | |

---

### Sprint 24 — User Story Details

#### S24.1: Add UOB Lady's Solitaire Base Card Data

> **As a** user with a UOB Lady's Solitaire card,
> **I want** my card to appear in MaxiMile,
> **So that** I can get recommendations tailored to my card's earn rates.

**Priority**: P0
**T-Shirt Size**: **S** (Simple) — ~2 hours
**Feature**: F33

**Card Data**:

| Field | Value |
|-------|-------|
| Slug | `uob-ladys-solitaire` |
| Network | mastercard |
| Annual Fee | $414.20 |
| Base Rate | 0.4 mpd |
| Bonus Rate | 4.0 mpd on 2 user-chosen categories |
| Cap | $1,500/month shared ($750 per category) |
| Min Income | $120,000 |

**Category Mapping** (UOB's 7 categories → MaxiMile's 8 categories):

| UOB Category | MaxiMile Category | Notes |
|-------------|-------------------|-------|
| Dining | `dining` | Direct map |
| Transport | `transport` | Direct map |
| Travel | `travel` | Direct map |
| Family | `groceries` | UOB "Family" includes supermarkets/groceries |
| Fashion | `general` | No direct category; closest fit |
| Beauty & Wellness | `general` | No direct category; closest fit |
| Entertainment | `general` | No direct category; closest fit |

**Implementation approach**: Store all 8 MaxiMile categories as earn rules with `is_bonus: TRUE` and `earn_rate_mpd: 4.0`. Add a new `user_card_preferences` table (or use existing user settings) to store which 2 categories the user has selected. The `recommend()` RPC checks this preference when scoring UOB Lady's Solitaire.

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T24.01: Add card metadata to `all_cards.sql` | Data Engineer | 0.5h | None |
| T24.02: Add 8 earn rules — all at 4.0 mpd bonus with `{"user_selectable": true}` condition | Data Engineer | 1h | T24.01 |
| T24.03: Add cap row ($1,500/month shared) | Data Engineer | 0.5h | T24.01 |
| T24.04: Add exclusion rows | Data Engineer | 0.5h | T24.01 |

---

#### S24.2: Category Selection UX for UOB Lady's Solitaire

> **As a** UOB Lady's Solitaire cardholder,
> **I want** to choose my 2 preferred reward categories in the app,
> **So that** my recommendations reflect my actual 4 mpd bonus categories.

**Priority**: P0
**T-Shirt Size**: **L** (Large) — ~3-4 days
**Feature**: F33

**UX Requirements**:
- Accessible from card detail screen (tap UOB Lady's Solitaire → "Set Bonus Categories")
- Shows 7 category options matching UOB's official list
- User selects exactly 2 categories (validated)
- Selection stored in `user_card_preferences` table
- Can be updated quarterly (UOB allows quarterly re-selection)
- Default state: no categories selected → card shows base 0.4 mpd everywhere
- After selection: selected categories show 4.0 mpd, others show 0.4 mpd

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | User has UOB Lady's Solitaire in portfolio | Taps card in My Cards | "Set Bonus Categories" button visible |
| AC2 | User opens category selector | Selects Dining + Transport | Selection saved; returns to card detail |
| AC3 | User tries to select 3 categories | Taps a 3rd option | Validation error: "Select exactly 2 categories" |
| AC4 | Categories saved (Dining + Transport) | `recommend('dining')` | UOB Lady's Solitaire shows 4.0 mpd |
| AC5 | Categories saved (Dining + Transport) | `recommend('online')` | UOB Lady's Solitaire shows 0.4 mpd (not selected) |
| AC6 | No categories selected yet | `recommend('dining')` | UOB Lady's Solitaire shows 0.4 mpd (base) |
| AC7 | User wants to change selection | Taps "Set Bonus Categories" again | Can re-select 2 different categories |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T24.05: Design category selector bottom sheet (wireframe) | Designer | 2h | None |
| T24.06: Create `user_card_preferences` table migration | Software Engineer | 1h | None |
| T24.07: Build category selector component (bottom sheet with 7 options, 2-select validation) | Developer | 4h | T24.05 |
| T24.08: Add "Set Bonus Categories" button to card detail screen | Developer | 1h | T24.07 |
| T24.09: Connect selector to Supabase (upsert user_card_preferences) | Developer | 2h | T24.06, T24.07 |
| T24.10: Handle default state (no selection = base rate) | Developer | 1h | T24.09 |

---

#### S24.3: Modify `recommend()` for User-Selected Bonus Categories

> **As a** UOB Lady's Solitaire user who selected Dining + Transport,
> **I want** `recommend('dining')` to show 4.0 mpd for my card,
> **So that** the recommendation engine respects my chosen bonus categories.

**Priority**: P0
**T-Shirt Size**: **L** (Large) — ~3-4 days
**Feature**: F33

**Implementation**:
- Add `user_card_preferences` join to `recommend()` RPC
- For cards with `conditions->>'user_selectable' = 'true'`:
  - If user has selected this category → use bonus rate (4.0 mpd)
  - If user has NOT selected this category → use base rate (0.4 mpd)
  - If user has not set any preferences → use base rate for all categories
- Cap logic unchanged: $1,500/month shared across both selected categories

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | User selected Dining + Transport | `recommend('dining')` | UOB Lady's Solitaire scored at 4.0 mpd |
| AC2 | User selected Dining + Transport | `recommend('groceries')` | UOB Lady's Solitaire scored at 0.4 mpd |
| AC3 | User has not set preferences | `recommend('dining')` | UOB Lady's Solitaire scored at 0.4 mpd |
| AC4 | User changes selection to Transport + Travel | `recommend('dining')` | UOB Lady's Solitaire now scored at 0.4 mpd |
| AC5 | Cap applies to selected categories | User spent $1,400 on dining | Transport cap remaining = $100 (shared cap) |
| AC6 | Performance | `recommend()` with user_selectable check | Still < 10ms response time |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T24.11: Add `user_card_preferences` CTE to `recommend()` | Software Engineer | 2h | T24.06 |
| T24.12: Add conditional scoring logic for `user_selectable` cards | Software Engineer | 4h | T24.11 |
| T24.13: Handle edge case: user deletes UOB Lady's Solitaire then re-adds | Software Engineer | 1h | T24.12 |
| T24.14: Performance test with `EXPLAIN ANALYZE` | Software Engineer | 1h | T24.12 |
| T24.15: Create migration script for updated `recommend()` | Software Engineer | 0.5h | T24.12 |

---

#### S24.4: Test Cases for UOB Lady's Solitaire

> **As a** developer,
> **I want** comprehensive tests for user-selectable category logic,
> **So that** this unique card behaviour is protected from regressions.

**Priority**: P1
**T-Shirt Size**: **M** (Moderate) — ~1 day
**Feature**: F33

**Test Cases**:

| # | Test | Expected Result |
|---|------|-----------------|
| TC1 | Dining selected as bonus + recommend dining | 4.0 mpd |
| TC2 | Dining NOT selected + recommend dining | 0.4 mpd base |
| TC3 | No preferences set + recommend any category | 0.4 mpd base |
| TC4 | 2 categories selected + recommend non-selected | 0.4 mpd base |
| TC5 | Cap applied to selected categories | Score reduced when cap exceeded |
| TC6 | Category selection changed mid-month | New selection reflected in next recommend() |

**Task Breakdown**:

| Task | Owner | Est. | Dependencies |
|------|-------|------|--------------|
| T24.16: Add UOB Lady's Solitaire mock data to `test-data.ts` | Tester | 1h | S24.1 |
| T24.17: Add 6 test cases for category selection logic | Tester | 2h | T24.16, S24.3 |
| T24.18: Run full test suite | Tester | 0.5h | T24.17 |

---

#### S24.5: Documentation Update for 29-Card Database

**Priority**: P1
**T-Shirt Size**: **S** (Simple) — ~2 hours

| Task | Owner | Est. |
|------|-------|------|
| T24.19: Update CARD_DATA_VERIFICATION.md — add UOB Lady's Solitaire data sheet | Scrum Master | 0.5h |
| T24.20: Update RECOMMENDATION_AND_CATEGORY_LOGIC.md — document user_selectable pattern | Scrum Master | 0.5h |
| T24.21: Update MAXIMILE_VS_MILELION_ANALYSIS.md — mark UOB Lady's Solitaire as ADDED | Scrum Master | 0.5h |
| T24.22: Verify card count = 29 across all docs | Scrum Master | 0.5h |

---

### Sprint 24 — Dependencies Map

```
Sprint 23 (28 cards stable) ───────────────────────────────────────┐
                                                                    ▼
S24.1 (Card data) ──────────┐
                             ├──► S24.3 (recommend() modification)
S24.2 (Category UX) ────────┘              │
                                            ▼
                                      S24.4 (Tests)
                                            │
                                            ▼
                                      S24.5 (Docs)
```

- **S24.1** and **S24.2** can start in parallel on Day 1
- **S24.3** depends on both (needs card data + user_card_preferences table)
- **S24.4** depends on S24.3 (tests exercise the full flow)
- **S24.5** depends on everything

---

### Sprint 24 — Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| UOB's 7 categories don't map cleanly to MaxiMile's 8 | Medium | Medium | Fashion/Beauty/Entertainment → `general`. Document mapping clearly |
| `user_card_preferences` table adds complexity to `recommend()` | Medium | Medium | Use LEFT JOIN — NULL preferences default to base rate |
| User confusion about "choose 2 categories" concept | Medium | Low | Clear UX copy explaining the UOB benefit structure |
| Quarterly re-selection timing not enforced | Low | Low | Allow re-selection anytime (more flexible than UOB's quarterly constraint) |

---

### Sprint 24 — Schedule

| Day | Focus | Deliverables |
|-----|-------|-------------|
| **Day 1** | S24.1 (card data) + S24.2 start (UX design) | Card in SQL; wireframe ready |
| **Day 2** | S24.2 continue (build component) + S24.3 start (DB migration) | Category selector built; `user_card_preferences` table created |
| **Day 3** | S24.3 continue (recommend() modification) | Conditional scoring logic working |
| **Day 4** | S24.3 finish + S24.4 (tests) | All tests pass; recommend() handles user_selectable |
| **Day 5** | S24.5 (docs) + verification | Card count = 29 everywhere; full suite green |

---

## Sprint 23-24 Summary: Card Expansion Roadmap (22→29)

### Total Effort

| Sprint | Phase | Cards Added | Stories | Points | Duration |
|--------|-------|-------------|---------|--------|----------|
| **Sprint 23** | Straightforward Cards | 6 (22→28) | 6 | 16 | 1 week |
| **Sprint 24** | UOB Lady's Solitaire | 1 (28→29) | 5 | 16 | 1 week |
| **Total** | | **7 new cards** | **11** | **32** | **2 weeks** |

### Key Milestones

| Milestone | Sprint | Success Criteria |
|-----------|--------|------------------|
| **6 Straightforward Cards Live** | Sprint 23 | 28 cards in DB; 10 new tests pass; flat-rate + conditional cards working |
| **UOB Lady's Solitaire Category Selection** | Sprint 24 | User can choose 2 bonus categories; recommend() respects selection |
| **29-Card Database Complete** | Sprint 24 | All docs at 29; SC Smart Card documented as deferred (P3) |

### Dependencies & Prerequisites

| Sprint | Hard Dependencies | Soft Dependencies |
|--------|-------------------|-------------------|
| **Sprint 23** | Sprint 22 complete (F31 min spend enforcement) | None |
| **Sprint 24** | Sprint 23 complete (28-card baseline stable) | Designer wireframe for category selector |

### Deferred: SC Smart Card (P3)

**Reason**: SC Smart Card is primarily a cashback card (0.5%-10% cashback) with a poor miles conversion path ($27.25 transfer fee, ~0.4 mpd effective base). The 9.28 mpd equivalent is only achievable on specific merchants (McDonald's, KFC, Netflix, SimplyGo) at the highest spend tier ($1,500+/month). Including it in a miles optimizer app would be misleading for most users. **Revisit in v2.0** if product expands to include cashback cards.

### Reference Documentation

- **PRD v2.3**: `docs/planning/PRD.md` (F33)
- **Card Data Verification**: `docs/technical/CARD_DATA_VERIFICATION.md`
- **MileLion Analysis**: `docs/technical/MAXIMILE_VS_MILELION_ANALYSIS.md`
- **Recommendation Logic**: `docs/technical/RECOMMENDATION_AND_CATEGORY_LOGIC.md`

---

**Sprint 23-24 Status**: Sprint 23 ✅ COMPLETED (Card Expansion 22→29, migration 014) | Sprint 24 ✅ COMPLETED (UOB Lady's Solitaire category selection, migration 021, CategorySelectionSheet.tsx)

---

## Sprint 16b: T&C Focus Refactor (Detection Pipeline v2.0.1)

> **Context**: Sprint 14-15 deployed the automated detection pipeline, but the first production run failed on **45 of 54 sources** — Playwright selector timeouts, navigation timeouts, and PDF Unicode encoding errors. Root cause: broad website scraping (card listing pages, promo pages, rewards pages) is unreliable because bank SPAs block headless browsers and CSS selectors don't match actual page structure.
>
> **Solution**: Replace 54 broad URLs with ~35 focused T&C document sources (30 card-specific PDFs + 5 bank index pages). T&C documents are the authoritative source of truth for rate changes, and PDFs are simple HTTP downloads — no Playwright needed for 85% of sources.

### Sprint 16 Goal

Refocus the detection pipeline from broad web scraping to targeted T&C PDF monitoring with version-based change detection gating.

### Stories

| ID | Story | Points | Priority | Status |
|----|-------|--------|----------|--------|
| S16.1 | PDF text extraction via `pdf-parse` (replace base64 encoding) | 3 | P0 | Done |
| S16.2 | T&C version + date extraction with regex patterns | 3 | P0 | Done |
| S16.3 | Version-based short-circuit in pipeline (3-tier gate) | 5 | P0 | Done |
| S16.4 | Database migration: retire 54 sources, insert 30 PDFs + 5 index pages | 5 | P0 | Done |
| S16.5 | URL discovery for versioned PDF filenames | 3 | P1 | Done |
| S16.6 | AI prompt updates for T&C PDF input + cardName parameter | 2 | P0 | Done |
| S16.7 | Documentation updates (architecture, PRD, sprint plan) | 2 | P1 | Done |
| **Total** | | **23** | | |

### Task Breakdown

#### S16.1 — PDF Text Extraction
- Add `pdf-parse` dependency to scraper package.json
- Create `src/types/pdf-parse.d.ts` type declaration
- Replace base64 PDF storage with `pdfParse(buffer).text` in `scraper.ts`
- Add content length warning for scanned image PDFs (< 100 chars)

#### S16.2 — Version + Date Extraction
- `extractTcVersion(text)`: regex patterns for "Version X.X", "V1.2", "Rev 2024/01", "Edition 2025"
- `extractTcLastUpdated(text)`: regex patterns for "Last updated: DD MMM YYYY", "Effective date:", "WEF", etc.
- Return version + date metadata in `ScrapeResult`

#### S16.3 — Version-Based Short-Circuit
- After scraping, compare `result.tcVersion` + `result.tcLastUpdated` against stored `source.tc_version` + `source.tc_last_updated`
- Both match → skip hash check, skip AI → log "T&C version unchanged"
- Either differs or null → proceed with existing hash comparison flow
- On change detection: update `source_configs.tc_version` and `tc_last_updated`
- New `updateSourceVersion()` function in `supabase-client.ts`

#### S16.4 — Database Migration
- Add `bank_tc_pdf` and `bank_index_page` to `source_type` enum
- Add `card_name`, `tc_version`, `tc_last_updated` columns to `source_configs`
- Add `tc_version`, `tc_last_updated` columns to `source_snapshots`
- Retire all existing 54 sources (`SET status = 'retired'`)
- Insert 30 card-specific T&C PDF sources + 5 bank index pages
- Update `v_pipeline_health` view to include version info and exclude retired sources

#### S16.5 — URL Discovery
- `runUrlDiscovery()` runs before main scrape loop
- Fetches bank index pages, extracts PDF links via regex
- Matches to card-specific sources, updates `source_configs.url` if changed
- Handles 6 versioned-URL cards (OCBC Titanium, BOC Elite Miles, Maybank FC Barcelona, Citi Rewards, Citi PremierMiles, SC Smart)

#### S16.6 — AI Prompt Updates
- Update `SYSTEM_PROMPT`: input is now extracted PDF text from official T&C documents
- Add guidance about PDF text extraction artifacts
- Add `cardName` parameter to `classifyPageChange()`, `classifyWithGemini()`, `classifyWithGroq()`
- Increase `MAX_CONTENT_LENGTH` from 15,000 to 30,000 chars
- Add `bank_tc_pdf` to `TIER_1_SOURCE_TYPES` for auto-approval

### Sprint 14-15 Retrospective

**What went wrong:**
- 45/54 sources failed on first production run
- Playwright selector timeouts: bank SPAs use dynamic class names that don't match static CSS selectors
- Navigation timeouts: some bank sites block headless browsers entirely
- PDF Unicode errors: base64 encoding didn't enable content analysis

**Key learnings:**
- T&C PDFs are more reliable than web pages (simple HTTP download, no JS rendering)
- T&C documents are the authoritative source of truth for rate changes
- Version metadata provides a cheap change detection gate before expensive hash/AI processing

**Sprint 16b Status**: ✅ COMPLETED

---

## Sprint 16c: MileLion Detection Pivot (Detection Pipeline v2.0.2)

> **Sprint Goal**: Pivot from fragile bank T&C PDF monitoring to MileLion review pages as the primary detection source. MileLion maintains authoritative, human-verified credit card reviews with `dateModified` metadata, enabling reliable date-gated change detection.

| Field | Value |
|-------|-------|
| **Sprint Goal** | Replace 35 fragile bank T&C sources with 25 reliable MileLion review sources |
| **Duration** | 1 day (focused implementation) |
| **Story Points** | 21 |
| **Status** | ✅ COMPLETED |

### Why the Pivot

**Sprint 16b post-mortem revealed systemic issues with bank T&C PDF sources:**
- Maybank blocks GitHub Actions IPs → scrape failures
- Bank PDF URLs are fragile (404s, versioned paths that break)
- PDF text extraction produces noisy output (table misalignment, encoding issues)
- 35 sources × daily = many potential failure points

**MileLion advantages:**
- Human-verified, authoritative credit card reviews
- JSON-LD `dateModified` metadata = reliable change signal (no content hashing needed)
- Server-rendered WordPress = simple HTTP fetch (no Playwright)
- 24 review pages cover 29 tracked cards
- Trusted source in the Singapore miles community

### Sprint 16c — Stories

| ID | Story | Points | Priority | Status |
|----|-------|--------|----------|--------|
| S16c.1 | Migration: add `milelion_review` source type enum | 1 | P0 | ✅ |
| S16c.2 | Migration: pause bank T&C sources, insert 25 MileLion sources | 3 | P0 | ✅ |
| S16c.3 | MileLion scraper module (HTTP + JSON-LD extraction) | 3 | P0 | ✅ |
| S16c.4 | DB comparator module (fetch card data for AI comparison) | 3 | P0 | ✅ |
| S16c.5 | Pipeline integration (date gate + MileLion comparison branch) | 5 | P0 | ✅ |
| S16c.6 | MileLion comparison AI prompt | 2 | P0 | ✅ |
| S16c.7 | Router update (milelion_review as Tier-1) | 1 | P0 | ✅ |
| S16c.8 | Type updates + documentation | 3 | P0 | ✅ |
| **Total** | | **21** | | |

### Sprint 16c — Files Changed

| # | File | Action |
|---|------|--------|
| 1 | `supabase/migrations/20260228300000_add_milelion_source_type.sql` | NEW |
| 2 | `supabase/migrations/20260228400000_milelion_sources.sql` | NEW |
| 3 | `scraper/src/milelion.ts` | NEW — date extraction + content scraping |
| 4 | `scraper/src/db-comparator.ts` | NEW — fetch card data for AI comparison |
| 5 | `scraper/src/pipeline.ts` | MODIFY — add MileLion date gate branch |
| 6 | `scraper/src/ai/prompts.ts` | MODIFY — add MileLion comparison prompt |
| 7 | `scraper/src/ai/classifier.ts` | MODIFY — add MileLion comparison classifier |
| 8 | `scraper/src/ai/gemini-client.ts` | MODIFY — add custom prompt classifier |
| 9 | `scraper/src/ai/groq-client.ts` | MODIFY — add custom prompt classifier |
| 10 | `scraper/src/ai/router.ts` | MODIFY — add milelion_review to Tier-1 |
| 11 | `scraper/src/types.ts` | MODIFY — add milelion_review type |

### Sprint 16c — Pipeline Flow

```
GitHub Actions (weekly or manual trigger)
  │
  ├─ For each milelion_review source:
  │    ├─ HTTP fetch MileLion page
  │    ├─ Extract dateModified from JSON-LD
  │    ├─ GATE: dateModified == stored date? → SKIP (no change)
  │    ├─ Date newer → extract article content
  │    ├─ Fetch our DB data for this card (db-comparator)
  │    ├─ AI: Compare MileLion content vs our DB
  │    ├─ Differences found?
  │    │    ├─ YES → Insert into detected_changes → Admin dashboard
  │    │    └─ NO → Log "MileLion updated but no rate changes"
  │    └─ Update source_configs.tc_last_updated = new dateModified
  │
  └─ Update pipeline_run stats + last_run.json
```

### Sprint 16b/16c Retrospective

**What went wrong with bank T&C PDFs (Sprint 16b):**
- Maybank blocks GitHub Actions IPs → all Maybank sources fail
- Bank PDF URLs are fragile (version numbers in filenames change)
- PDF text extraction noisy — tables don't align, headers repeat
- 35 sources × daily = too many failure points for reliable monitoring

**What the MileLion pivot solves (Sprint 16c):**
- Single, reliable third-party source that's always accessible
- `dateModified` in JSON-LD = cheap, reliable change detection
- AI comparison against our DB (not old-vs-new content diff) = better precision
- Server-rendered HTML = no Playwright, no PDF parsing
- 25 sources × weekly = simpler, more maintainable

**Sprint 16c Status**: ✅ COMPLETED

---

**Next Steps**:
1. Apply database migrations (`20260228300000` + `20260228400000`) to production
2. Trigger manual GitHub Actions workflow run to verify MileLion sources scrape successfully
3. First run saves baseline `dateModified` dates — no AI comparison yet
4. Subsequent runs detect MileLion page updates and trigger AI comparison
5. Complete Sprints 21-22 (Recommendation Accuracy)
6. Begin Sprint 23 — 6 straightforward cards (Day 1: flat-rate cards first)
7. Sprint 24 begins after Sprint 23 ships — UOB Lady's Solitaire with category selection UX
8. **Sprint 25 (P0 Hotfix)** — Apply 5 verified earn rate corrections from MileLion gap analysis (see `docs/technical/DATA_CORRECTION_PLAN.md`). These fixes address wrong recommendations currently being served to users.
9. **Sprints 26-28** — Telco bonus rules, bills subcategory data expansion, bills subcategory UI picker

---

## Sprint 25: "Earn Rate Hotfix" (MileLion Gap Analysis — Phase 1 P0 Data Corrections)

**Duration**: 1 week (5 working days)
**Sprint Goal**: Fix 5 verified wrong earn rates discovered via MileLion 2026 gap analysis. The current database causes the recommendation engine to confidently recommend the wrong card in 5 documented scenarios. These are SQL-only corrections — no UI changes.
**Epic**: E15 — Earn Rate Data Integrity
**PRD Features**: F34 (P0 — Earn Rate Accuracy Corrections)
**Phase**: v2.3 — Data Integrity
**Predecessor**: Sprint 24 (29-card DB complete; corrections apply cleanly to full dataset)
**Source of Truth**: `docs/technical/DATA_CORRECTION_PLAN.md` Part 1

> **P0 CRITICAL**: The current DB has 5 verified wrong earn rates. Until these are fixed, the recommendation engine is producing incorrect results for bills (all 29 cards), dining/transport/online (Card 5), transport/online (Card 20), transport (Card 6), and groceries (Card 7).
>
> **QA process**: All Phase 1 fixes must follow the same QA process as any earn rule change — update `all_cards.sql`, run `recommendation.test.ts`, and manually verify against bank T&Cs before merging.

---

### Sprint 25 — Definition of Ready (DoR) Checklist

Before any story enters the sprint, it must satisfy:

- [ ] User story has clear "As a... I want... So that..." statement
- [ ] Acceptance criteria defined and reviewed by PM + Data Engineer
- [ ] T-shirt size estimated by the team
- [ ] Sprint 24 complete (all 29 cards stable in DB)
- [ ] MileLion source for each correction confirmed (URL + date of verification)
- [ ] SQL correction statements drafted and peer-reviewed before merge
- [ ] `recommendation.test.ts` test cases written for each affected card+category pair

### Sprint 25 — Definition of Done (DoD) Checklist

A story is "Done" when:

- [ ] `all_cards.sql` updated with corrected earn rate
- [ ] Database migration written and applied to staging
- [ ] `recommendation.test.ts` passes for affected card+category (new test added where missing)
- [ ] Manual spot-check: recommendation results match expected ranked order post-fix
- [ ] Verified against MileLion 2026 source — link recorded in PR description
- [ ] No regressions in existing test suite
- [ ] Code committed to main branch and peer-reviewed

---

### Sprint 25 Stories

| ID | Story | Priority | Size | Points | Owner |
|----|-------|----------|------|--------|-------|
| **S25.1** | Fix bills earn rate: set 0 mpd on utilities for all 29 cards | P0 | M | 3 | Data Engineer |
| **S25.2** | Fix Card 5 KrisFlyer UOB: remove incorrect 2 mpd contactless bonus; revert to 1.2 mpd flat | P0 | S | 2 | Data Engineer |
| **S25.3** | Fix Card 20 UOB PPV: add missing 4 mpd rules for transport (SimplyGo) and online spend | P0 | S | 2 | Data Engineer |
| **S25.4** | Fix Card 6 HSBC Revolution: add 4 mpd contactless transport (Revo Up promo); fix cap $1,000 → $1,500 | P0 | S | 2 | Data Engineer |
| **S25.5** | Fix Card 7 Amex KrisFlyer Ascend: correct groceries 2 mpd → 1.1 mpd base rate | P0 | XS | 1 | Data Engineer |
| **S25.6** | Write/update recommendation.test.ts for all 5 corrected scenarios | P0 | S | 2 | Tester |
| **S25.7** | Post-fix verification: spot-check recommendations for bills, Card 5, Card 20, Card 6, Card 7 | P0 | S | 1 | Tester |
| **Total** | | | | **13** | |

---

### Sprint 25 — User Story Details

#### S25.1: Fix Bills Earn Rate — 0 mpd for Utilities (All 29 Cards)

> **As a** user asking "which card should I use for my SP Services bill?",
> **I want** the recommendation engine to return 0 mpd for utilities across all cards,
> **So that** I am not incorrectly directed to use a card that earns 0 miles on utility payments.

**Priority**: P0 (Critical data correction — affects all 29 cards)
**T-Shirt Size**: M (Medium) — ~1.5 days (29-row SQL update + conditions_note update)
**Feature**: F34

**Background**: All 29 cards currently show `bills` earn_rate_mpd = their base_rate_mpd (e.g., BOC Elite 1.5 mpd, SC Beyond 1.5 mpd). In reality, MCC 4900 (utilities: SP Services, Geneco, Sembcorp) earns **0 mpd** on all major Singapore bank cards. The engine currently recommends "use BOC Elite for 1.5 mpd on your utilities bill" — which is factually wrong.

**Exception**: Maybank Horizon (Card 16) may earn 0.16 mpd on utilities — confirm before applying this fix to Card 16.

**Correction**:
- Set `earn_rate_mpd = 0` for `bills` on all 29 cards (pending Maybank Horizon confirmation)
- Add MCC 4900 to each card's `exclusions` table entry
- Update `conditions_note` to: `"Utilities (electricity, water) earn 0 mpd — excluded by bank. See subcategory for telco rates."`

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | The bills earn rate migration runs | I call `recommend('bills')` | All cards return 0 mpd for utilities (or 0.16 mpd for Maybank Horizon if confirmed) |
| AC2 | Bills earn rates are corrected | I query `earn_rules WHERE category_id='bills'` | All 29 rows have `earn_rate_mpd = 0` (or 0.16 for Maybank Horizon) |
| AC3 | MCC 4900 is in exclusions | I query `exclusions WHERE mcc_code='4900'` | 29 rows exist, one per card |
| AC4 | Bills correction is live | I verify `conditions_note` for Card 1 (DBS Altitude) bills | Note reads "Utilities (electricity, water) earn 0 mpd — excluded by bank. See subcategory for telco rates." |
| AC5 | All other categories unchanged | I call `recommend('dining')` | Results identical to pre-fix (no regressions) |

---

#### S25.2: Fix Card 5 KrisFlyer UOB — Remove Incorrect 2 mpd Contactless Bonus

> **As a** user who holds the KrisFlyer UOB Credit Card,
> **I want** recommendations to reflect my card's true 1.2 mpd flat rate for local spend,
> **So that** I am not incorrectly told I earn 2 mpd on dining, transport, or online purchases.

**Priority**: P0 (Critical — Card 5 is being over-recommended across 3 high-frequency categories)
**T-Shirt Size**: S (Small) — ~0.5 day (3-row SQL update)
**Feature**: F34

**Background**: The DB currently shows Card 5 earning 2 mpd with `{"contactless": true}` on dining, transport, and online. This is wrong — the 2 mpd contactless bonus belongs to Card 22 (UOB Visa Signature) and was incorrectly applied to Card 5. KrisFlyer UOB earns 1.2 mpd flat on all local spend except SIA Group (3 mpd).

**Correction** (3 rows in `earn_rules`):
```
dining:    1.2 mpd, is_bonus=FALSE, {}
transport: 1.2 mpd, is_bonus=FALSE, {}
online:    1.2 mpd, is_bonus=FALSE, {}
```

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Card 5 earn rules are corrected | I call `recommend('dining')` | Card 5 appears with 1.2 mpd (not 2 mpd); ranked below 4 mpd cards |
| AC2 | Card 5 earn rules are corrected | I call `recommend('transport')` | Card 5 appears with 1.2 mpd (not 2 mpd) |
| AC3 | Card 5 earn rules are corrected | I call `recommend('online')` | Card 5 appears with 1.2 mpd (not 2 mpd) |
| AC4 | is_bonus corrected | I query `earn_rules WHERE card_id='card-05'` | `is_bonus = FALSE` for dining/transport/online; conditions JSONB is `{}` |
| AC5 | Card 22 unchanged | I query `earn_rules WHERE card_id='card-22'` | Card 22 retains 2 mpd contactless bonus (no regression) |

---

#### S25.3: Fix Card 20 UOB PPV — Add Missing 4 mpd Transport and Online Rules

> **As a** user who holds the UOB Preferred Platinum Visa,
> **I want** the app to recognise that my card earns 4 mpd on mobile contactless transport and online spend,
> **So that** UOB PPV appears in my top recommendations for transport and online (not just dining).

**Priority**: P0 (Critical — Card 20 severely under-recommended for transport and online)
**T-Shirt Size**: S (Small) — ~0.5 day (2 INSERT rows + 1 cap UPDATE)
**Feature**: F34

**Correction**: Add two missing earn_rule rows and update shared cap scope:
```sql
-- Add transport bonus rule
('card-20', 'transport', 4.0, TRUE,
 '{"min_spend_monthly": 600, "contactless": true}',
 'Earn 4 mpd (10X UNI$) on mobile contactless transport incl. SimplyGo. Min spend $600/month. Cap $1,000/month shared with dining and online.', NULL),

-- Add online bonus rule
('card-20', 'online', 4.0, TRUE,
 '{"min_spend_monthly": 600}',
 'Earn 4 mpd (10X UNI$) on online spend. Min spend $600/month. Cap $1,000/month shared with dining and transport.', NULL)
```

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Card 20 transport rule added | I call `recommend('transport')` | Card 20 appears in top-3 at 4 mpd (was missing entirely) |
| AC2 | Card 20 online rule added | I call `recommend('online')` | Card 20 appears in top-3 at 4 mpd (was showing 0.4 mpd) |
| AC3 | Conditions correct | I query Card 20 transport earn_rule | `conditions = {"min_spend_monthly": 600, "contactless": true}`, `is_bonus = TRUE` |
| AC4 | Dining rule unchanged | I call `recommend('dining')` | Card 20 still shows 4 mpd dining (no regression) |
| AC5 | Shared cap noted | I view Card 20 detail screen | Cap displayed as "$1,000/month combined across dining, transport, online" |

---

#### S25.4: Fix Card 6 HSBC Revolution — Add 4 mpd Transport (Revo Up) + Fix Cap

> **As a** user who holds the HSBC Revolution card with the Revo Up promotion active,
> **I want** the app to show me 4 mpd for contactless transport and the correct $1,500 monthly cap,
> **So that** I am not leaving miles on the table by using a different card for transport.

**Priority**: P0 (Critical — Card 6 missing transport bonus; cap is understated by $500/month)
**T-Shirt Size**: S (Small) — ~0.5 day (1 earn_rule UPDATE + 1 cap UPDATE)
**Feature**: F34

**Correction**:
```sql
-- Update transport to 4 mpd contactless (Revo Up promo, valid to 31 Mar 2026)
UPDATE earn_rules SET earn_rate_mpd=4.0, is_bonus=TRUE,
  conditions='{"contactless": true}',
  conditions_note='Earn 4 mpd on contactless transport (Revo Up promo, valid to 31 Mar 2026). Reverts to 0.4 mpd after promo ends.'
WHERE card_id='card-06' AND category_id='transport';

-- Fix cap from $1,000 to $1,500
UPDATE caps SET monthly_cap_amount=1500.00,
  notes='Revo Up promo cap $1,500/month across dining, online, transport. Valid to 31 Mar 2026. Reverts to $1,000 after.'
WHERE card_id='card-06';
```

**Note**: Both corrections carry a promo expiry of 31 March 2026. Add a backlog item to revert both after April 2026.

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Card 6 transport rule updated | I call `recommend('transport')` | Card 6 appears in top-3 at 4 mpd contactless (was 0.4 mpd) |
| AC2 | Cap corrected | I query `caps WHERE card_id='card-06'` | `monthly_cap_amount = 1500.00` |
| AC3 | Promo noted | I view Card 6 conditions_note for transport | Note references "Revo Up promo, valid to 31 Mar 2026" |
| AC4 | Other Card 6 categories unchanged | I call `recommend('dining')` | Card 6 dining result unchanged at 4 mpd |

---

#### S25.5: Fix Card 7 Amex KrisFlyer Ascend — Correct Groceries 2 mpd → 1.1 mpd

> **As a** user who holds the Amex KrisFlyer Ascend card,
> **I want** the app to reflect that my card earns only 1.1 mpd (base rate) at supermarkets,
> **So that** I am not misled into using my Amex Ascend for groceries when better options exist.

**Priority**: P0 (Critical — Card 7 over-recommended for groceries at 2 mpd vs true 1.1 mpd)
**T-Shirt Size**: XS (Extra Small) — ~2 hours (1-row SQL update)
**Feature**: F34

**Correction**:
```sql
UPDATE earn_rules SET earn_rate_mpd=1.1, is_bonus=FALSE, conditions='{}'
WHERE card_id='card-07' AND category_id='groceries';
```

**Background**: The 2 mpd bonus on Card 7 applies to dining and travel only. Supermarkets earn base rate 1.1 mpd.

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Card 7 groceries corrected | I call `recommend('groceries')` | Card 7 shows 1.1 mpd (not 2 mpd); ranked below 4 mpd grocery cards |
| AC2 | is_bonus corrected | I query Card 7 groceries earn_rule | `earn_rate_mpd=1.1`, `is_bonus=FALSE` |
| AC3 | Dining/travel unchanged | I call `recommend('dining')` | Card 7 dining result unchanged (no regression) |

---

#### S25.6: Write/Update recommendation.test.ts for All 5 Corrected Scenarios

> **As a** developer merging earn rate corrections,
> **I want** automated tests that validate the expected output for each corrected card+category pair,
> **So that** future data changes cannot silently reintroduce wrong rates.

**Priority**: P0 (Required gate before merging any S25.1–S25.5 fix)
**T-Shirt Size**: S (Small) — ~1 day
**Feature**: F34

**Test cases to add or update in `recommendation.test.ts`**:

| Test ID | Input | Expected output |
|---------|-------|-----------------|
| T25.A | `recommend('bills')` | Top result is NOT a 0 mpd card promoted above Maybank Horizon; all 29 cards return 0 mpd except Maybank Horizon (pending confirmation) |
| T25.B | `recommend('dining')` with Card 5 in portfolio | Card 5 ranked at 1.2 mpd (not 2 mpd) |
| T25.C | `recommend('transport')` with Card 20 in portfolio | Card 20 appears at 4 mpd (was absent) |
| T25.D | `recommend('online')` with Card 20 in portfolio | Card 20 appears at 4 mpd (was 0.4 mpd) |
| T25.E | `recommend('transport')` with Card 6 in portfolio | Card 6 appears at 4 mpd contactless |
| T25.F | `recommend('groceries')` with Card 7 in portfolio | Card 7 ranked at 1.1 mpd (not 2 mpd) |

---

#### S25.7: Post-Fix Verification Spot-Check

> **As a** QA engineer,
> **In order to** confirm that all 5 P0 data corrections produce correct recommendations end-to-end,
> **I want** to manually verify the recommendation output for each corrected scenario against the MileLion 2026 source.

**Priority**: P0 (Release gate)
**T-Shirt Size**: S (Small) — ~3 hours
**Feature**: F34

**Verification Checklist** (from `DATA_CORRECTION_PLAN.md`):
- [ ] Bills recommendation returns 0 mpd for a test user paying utilities
- [ ] Card 5 KrisFlyer UOB no longer appears top-3 for dining (should be ~1.2 mpd, beaten by 4 mpd cards)
- [ ] Card 20 UOB PPV appears in top-3 for transport and online at 4 mpd
- [ ] Card 6 HSBC Revolution appears in top-3 for transport at 4 mpd contactless
- [ ] Card 7 Amex Ascend no longer appears top for groceries (should be 1.1 mpd)
- [ ] All existing `recommendation.test.ts` cases pass (no regressions)

---

### Sprint 25 — Dependencies Map

```
S25.6 (Tests) ──────────────────────────────────────────────────────────────────────── Gate for merge
     ↑                                                                                       ↓
S25.1 (Bills 0mpd fix) ──┐                                                           S25.7 (Spot-check)
S25.2 (Card 5 fix) ──────┤
S25.3 (Card 20 fix) ─────┤──── all_cards.sql migration drafted → peer review → merge ──────┘
S25.4 (Card 6 fix) ──────┤
S25.5 (Card 7 fix) ──────┘

Sprint 24 (29-card DB stable) ─── Hard prerequisite ───── Sprint 25 begins
```

### Sprint 25 — Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Maybank Horizon (Card 16) utility rate unconfirmed | Medium | Low | Apply 0 mpd to Card 16 with a TODO comment; confirm separately and patch if 0.16 mpd is correct |
| HSBC Revo Up promo ends before sprint completes | Low | Low | Promo valid to 31 Mar 2026; note expiry in conditions_note; add Apr 2026 revert to backlog |
| Test suite breaks on bills change (expects base rate) | Medium | High | Update test expectations as part of S25.6 before merging S25.1 |
| Card 20 shared cap scope logic untested | Medium | Medium | Add explicit cap-deduction integration test for dining+transport+online combined cap |

### Sprint 25 — Schedule

| Day | Focus | Exit Criteria |
|-----|-------|---------------|
| **Day 1** | S25.1 (Bills 0 mpd) + S25.6 test scaffolding | Migration written; failing tests written for all 5 fixes |
| **Day 2** | S25.2 (Card 5) + S25.3 (Card 20) corrections | SQL drafted; T25.B/C/D passing |
| **Day 3** | S25.4 (Card 6) + S25.5 (Card 7) corrections | SQL drafted; T25.E/F passing |
| **Day 4** | S25.6 finalize tests + peer review migrations | All 6 test cases green; migrations reviewed |
| **Day 5** | S25.7 spot-check + deploy to staging | All verification checklist items ticked; ready for prod merge |

---

**Sprint 25 Status**: ✅ COMPLETED — v1.4.0 (earn rate P0 fixes applied 2026-03-01)

---

## Sprint 26: "Telco Bonus Rules" (MileLion Gap Analysis — Phase 2 P1 Missing Data)

**Duration**: 1 week (5 working days)
**Sprint Goal**: Add 4 mpd telco one-off online payment earn rules for the 4 cards that support this bonus (HSBC Revolution, DBS WWMC, Citi Rewards, UOB PPV). These rules are not causing wrong winners today (the bill payer likely gets 0 mpd or base rate), but they represent genuine untapped value the app is failing to surface.
**Epic**: E15 — Earn Rate Data Integrity
**PRD Features**: F35 (P1 — Telco Bonus Rule Data)
**Phase**: v2.3 — Data Integrity
**Predecessor**: Sprint 25 complete (bills earn rates corrected; telco rules build on the corrected bills foundation)
**Source of Truth**: `docs/technical/DATA_CORRECTION_PLAN.md` Part 2

---

### Sprint 26 — Definition of Ready (DoR) Checklist

- [ ] Sprint 25 complete (bills earn rates = 0 mpd for utilities)
- [ ] Telco MCC list confirmed (4812, 4814, 4816, 4899 — Singtel, StarHub, M1)
- [ ] Confirmed that one-off online telco payments (not GIRO) trigger the bonus on all 4 cards
- [ ] `{"telco_online": true}` condition key agreed as naming convention with Data Engineer + Software Engineer
- [ ] `recommendation.test.ts` scaffolding in place from Sprint 25

### Sprint 26 — Definition of Done (DoD) Checklist

- [ ] 4 new `earn_rules` rows inserted (one per card, `bills`, `is_bonus=TRUE`, `{"telco_online": true}`)
- [ ] Recommendation engine handles `telco_online` condition key without breaking existing logic
- [ ] `recommend('bills', {telco_online: true})` returns Card 6/10/18/20 in top-4 at 4 mpd
- [ ] `recommendation.test.ts` updated with telco_online test case
- [ ] No regressions on base bills (0 mpd utility) or other categories
- [ ] Code committed and peer-reviewed

---

### Sprint 26 Stories

| ID | Story | Priority | Size | Points | Owner |
|----|-------|----------|------|--------|-------|
| **S26.1** | Add 4 mpd telco one-off earn rules for Cards 6, 10, 18, 20 | P1 | S | 2 | Data Engineer |
| **S26.2** | Update recommendation engine to handle `telco_online` condition in bills routing | P1 | S | 2 | Software Engineer |
| **S26.3** | Write recommendation.test.ts test for `recommend('bills', {telco_online: true})` | P1 | XS | 1 | Tester |
| **Total** | | | | **5** | |

---

### Sprint 26 — User Story Details

#### S26.1: Add 4 mpd Telco One-Off Earn Rules

> **As a** user paying a one-off Singtel or StarHub bill online,
> **I want** the app to tell me that HSBC Revolution, DBS WWMC, Citi Rewards, or UOB PPV earns 4 mpd on my payment,
> **So that** I use the right card and earn maximum miles on my telco bill.

**Priority**: P1
**T-Shirt Size**: S — ~0.5 day (4 INSERT rows)
**Feature**: F35

**Correction** (4 INSERT rows, one per card):
```sql
-- Card 6 HSBC Revolution
('card-06', 'bills', 4.0, TRUE,
 '{"telco_online": true, "recurring_excluded": true}',
 'Earn 4 mpd on one-off online telco payments (Singtel, StarHub, M1 direct website). Recurring GIRO/auto-debit excluded.', NULL),

-- Card 10 DBS Woman''s World MC
('card-10', 'bills', 4.0, TRUE,
 '{"telco_online": true, "recurring_excluded": true}',
 'Earn 4 mpd on one-off online telco payments (Singtel, StarHub, M1 direct website). Recurring GIRO/auto-debit excluded.', NULL),

-- Card 18 Citi Rewards
('card-18', 'bills', 4.0, TRUE,
 '{"telco_online": true, "recurring_excluded": true}',
 'Earn 4 mpd on one-off online telco payments (Singtel, StarHub, M1 direct website). Recurring GIRO/auto-debit excluded.', NULL),

-- Card 20 UOB PPV
('card-20', 'bills', 4.0, TRUE,
 '{"telco_online": true, "min_spend_monthly": 600, "recurring_excluded": true}',
 'Earn 4 mpd on one-off online telco payments (Singtel, StarHub, M1 direct website). Min spend $600/month. Recurring GIRO/auto-debit excluded.', NULL),
```

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Telco bonus rules inserted | `recommend('bills', {telco_online: true})` | Cards 6, 10, 18, 20 appear at 4 mpd |
| AC2 | Base bills unchanged | `recommend('bills')` (no telco flag) | All cards still return 0 mpd for utilities (no regression from Sprint 25) |
| AC3 | UOB PPV min_spend noted | Card 20 telco bonus rule | `conditions` includes `{"min_spend_monthly": 600}` |
| AC4 | Recurring excluded | conditions_note for all 4 cards | Note reads "Recurring GIRO/auto-debit excluded" |

---

### Sprint 26 — Schedule

| Day | Focus | Exit Criteria |
|-----|-------|---------------|
| **Day 1** | S26.1 — write 4 SQL INSERT rows + peer review | 4 rows drafted; conditions JSONB agreed |
| **Day 2** | S26.2 — engine handles `telco_online` condition | `recommend('bills', {telco_online: true})` returns correct top-4 |
| **Day 3** | S26.3 — write test + full regression run | All tests green including new telco case |
| **Day 4-5** | Deploy to staging, spot-check, merge to main | No regressions; staging verified |

---

**Sprint 26 Status**: ✅ COMPLETED — v1.6.0 (telco bonus rules applied 2026-03-01)

---

## Sprint 27: "Bills Subcategory Data" (MileLion Gap Analysis — Phase 3 Data Expansion)

**Duration**: 2 weeks (10 working days)
**Sprint Goal**: Expand the bills category MCC list to include education, medical/hospital, and pharmacy MCCs, and add per-subcategory earn rules for all 29 cards reflecting actual bank exclusion policies. This is a data-layer change only — no UI changes.
**Epic**: E16 — Bills Subcategory Intelligence
**PRD Features**: F36 Part 1 (P1 — Bills Subcategory Data)
**Phase**: v2.4 — Bills Intelligence
**Predecessor**: Sprint 26 complete (telco bonus rules live; bills data foundation ready for subcategory expansion)
**Source of Truth**: `docs/technical/DATA_CORRECTION_PLAN.md` Part 3

---

### Sprint 27 — Definition of Ready (DoR) Checklist

- [ ] Sprint 26 complete (telco bonus rules live)
- [ ] MCC list for education (8211, 8220, 8249, 8299) confirmed via MileLion + bank T&Cs
- [ ] MCC list for medical (8011, 8021, 8062, 8099) confirmed
- [ ] MCC 5912 (pharmacy) confirmed as not excluded by most banks
- [ ] Bank exclusion matrix (which bank excludes education/medical) confirmed for all 29 cards
- [ ] `subcategory` JSONB key agreed as naming convention in conditions field
- [ ] `categories.ts` MCC array expansion reviewed by Software Engineer before implementation

### Sprint 27 — Definition of Done (DoD) Checklist

- [ ] `categories.ts` bills MCC list expanded with education, medical, pharmacy MCCs
- [ ] `subcategory` field added to earn_rules conditions JSONB schema documentation
- [ ] Earn rules added per subcategory for all 29 cards (utilities, telco, insurance, education, medical, pharmacy)
- [ ] `recommend('bills', {subcategory: 'education'})` returns 0 mpd for DBS/Citi/UOB/OCBC/HSBC/SC/Amex
- [ ] `recommend('bills', {subcategory: 'pharmacy'})` returns base_rate_mpd rankings (not 0)
- [ ] MCC 8099 (HealthHub → Citi Rewards / DBS WWMC 4 mpd) documented in earn rules conditions_note
- [ ] `recommendation.test.ts` updated with subcategory test cases
- [ ] No regressions on existing category recommendations

---

### Sprint 27 Stories

| ID | Story | Priority | Size | Points | Owner |
|----|-------|----------|------|--------|-------|
| **S27.1** | Expand bills MCC list in `categories.ts` with education (8211/8220/8249/8299), hospital (8011/8021/8062/8099), pharmacy (5912) | P1 | S | 2 | Data Engineer |
| **S27.2** | Add `subcategory` field to earn_rules conditions JSONB; seed utilities subcategory rows (29 cards, 0 mpd) | P1 | M | 3 | Data Engineer |
| **S27.3** | Add education subcategory earn rules (0 mpd DBS/Citi/UOB/OCBC/HSBC/SC/Amex; 0.16 mpd Maybank Horizon) | P1 | M | 3 | Data Engineer |
| **S27.4** | Add medical subcategory earn rules (0 mpd for DBS/UOB/Citi/SC/OCBC; base rate for HSBC/Amex; 0.16 mpd Maybank) | P1 | M | 3 | Data Engineer |
| **S27.5** | Add pharmacy subcategory earn rules (base_rate_mpd for all 29 cards; MCC 8099 HealthHub tip noted) | P1 | S | 2 | Data Engineer |
| **S27.6** | Update recommendation engine to route on `subcategory` condition in bills | P1 | M | 3 | Software Engineer |
| **S27.7** | Write recommendation.test.ts subcategory test cases (education, medical, pharmacy) | P1 | S | 2 | Tester |
| **Total** | | | | **18** | |

---

### Sprint 27 — User Story Details

#### S27.1: Expand Bills MCC List

> **As a** data engineer maintaining the bills category,
> **In order to** correctly classify education, medical, and pharmacy transactions under bills,
> **I want** the bills MCC list in `categories.ts` to include MCCs 8211, 8220, 8249, 8299, 8011, 8021, 8062, 8099, and 5912.

**Priority**: P1
**T-Shirt Size**: S — ~2 hours (single file edit to `maximile-app/constants/categories.ts`)

**Change**:
```typescript
// Add to bills MCCs in categories.ts:
'8211', '8220', '8249', '8299',  // Education / school fees
'8011', '8021', '8062', '8099',  // Medical / hospital
'5912',                           // Pharmacy (standalone — Guardian, Watsons, Unity)
```

---

#### S27.2–S27.5: Add Subcategory Earn Rules (All 29 Cards)

> **As a** user paying school fees, a hospital bill, or buying medicine,
> **I want** the app to tell me the correct earn rate for my specific type of bill,
> **So that** I use the right card and am not misled by a "base rate" that my bank actually excludes.

**Priority**: P1 (S27.2–S27.5)
**T-Shirt Size**: M per story — database migration work

**Subcategory earn rule matrix**:

| Subcategory | DBS / UOB / Citi / OCBC / SC | HSBC / Amex | Maybank Horizon |
|-------------|------------------------------|-------------|-----------------|
| Utilities | 0 mpd | 0 mpd | 0.16 mpd (confirm) |
| Education | 0 mpd | 0 mpd | 0.16 mpd |
| Medical | 0 mpd | Base rate (private hospitals) | 0.16 mpd |
| Pharmacy (MCC 5912) | Base rate | Base rate | Base rate |
| Telco (one-off online) | 0 mpd / 4 mpd (Cards 6/10/18/20) | — | — |

**Key note for Medical/MCC 8099**: Paying hospital bills via HealthHub, Health Buddy, or OneNUHS app routes as MCC 8099. Citi Rewards (Card 18) and DBS WWMC (Card 10) treat MCC 8099 as "online shopping" → **4 mpd**. This must be captured in the earn rule `conditions_note` for these two cards under the medical subcategory.

---

### Sprint 27 — Schedule

| Day | Focus | Exit Criteria |
|-----|-------|---------------|
| **Day 1-2** | S27.1 (MCC expansion) + S27.2 (utilities subcategory rows) | `categories.ts` updated; 29 utility rows seeded |
| **Day 3-4** | S27.3 (education rows) | 29 education rows; DBS/Citi etc = 0 mpd; Maybank = 0.16 mpd |
| **Day 4-5** | S27.4 (medical rows incl. MCC 8099 note) | 29 medical rows; HealthHub tip in conditions_note |
| **Day 6** | S27.5 (pharmacy rows) | 29 pharmacy rows; all at base_rate_mpd |
| **Day 7-8** | S27.6 (engine subcategory routing) | `recommend('bills', {subcategory: 'pharmacy'})` returns ranked results |
| **Day 9** | S27.7 (tests) | All subcategory test cases green |
| **Day 10** | Regression run + staging deploy | No regressions; ready for Sprint 28 UI |

---

**Sprint 27 Status**: ✅ COMPLETED — v1.7.0 (bills subcategory data + exclusions Phase 2 applied 2026-03-01)

---

## Sprint 28: "Bills Subcategory UI" (MileLion Gap Analysis — Phase 4 UI Picker)

**Duration**: 2 weeks (10 working days)
**Sprint Goal**: Add a subcategory picker to the bills recommendation screen so users explicitly select the bill type before receiving a recommendation. Route recommendations based on selection. Surface the HealthHub → 4 mpd tip for medical bills.
**Epic**: E16 — Bills Subcategory Intelligence
**PRD Features**: F36 Part 2 (P1 — Bills Subcategory UI)
**Phase**: v2.4 — Bills Intelligence
**Predecessor**: Sprint 27 complete (subcategory earn rules fully seeded; recommendation engine routes on subcategory)
**Source of Truth**: `docs/technical/DATA_CORRECTION_PLAN.md` Part 3 (UI wireframe section)

---

### Sprint 28 — Definition of Ready (DoR) Checklist

- [ ] Sprint 27 complete (all subcategory earn rules live; engine routing on subcategory)
- [ ] Designer wireframe for bills subcategory picker approved
- [ ] `recommend('bills', {subcategory: 'X'})` confirmed working end-to-end from Sprint 27
- [ ] HealthHub tip copy confirmed with PM (MCC 8099 → Citi Rewards / DBS WWMC 4 mpd)
- [ ] Category 7 tile ("Bills") current UX documented (no regression spec)

### Sprint 28 — Definition of Done (DoD) Checklist

- [ ] Bills recommendation screen shows subcategory picker before displaying results
- [ ] 6 subcategory tiles shown: Utilities, Telco, Insurance, Education, Medical, Pharmacy
- [ ] Selecting a subcategory routes to `recommend('bills', {subcategory: 'X'})` results
- [ ] Utilities and Insurance subcategories show "0 mpd — no recommendation" state with explanatory copy
- [ ] Medical subcategory shows HealthHub tip: "Paying via HealthHub app → MCC 8099 → 4 mpd on Citi Rewards / DBS WWMC"
- [ ] E2E test: select Bills → select Medical → verify HealthHub tip shown
- [ ] Works on iOS (TestFlight) and Android (APK)
- [ ] No regressions on other category tiles

---

### Sprint 28 Stories

| ID | Story | Priority | Size | Points | Owner |
|----|-------|----------|------|--------|-------|
| **S28.1** | Design bills subcategory picker wireframe (6 tiles + 0-mpd empty states + HealthHub tip) | P1 | M | 3 | Designer |
| **S28.2** | Build bills subcategory picker UI (6 tiles: Utilities / Telco / Insurance / Education / Medical / Pharmacy) | P1 | M | 5 | Developer |
| **S28.3** | Route recommendation results based on selected subcategory | P1 | S | 3 | Developer |
| **S28.4** | Build 0-mpd empty state for Utilities and Insurance subcategories with explanatory copy | P1 | S | 2 | Developer + Designer |
| **S28.5** | Add HealthHub tip to Medical subcategory result screen | P1 | S | 2 | Developer + Designer |
| **S28.6** | E2E test: Bills → subcategory picker → results → HealthHub tip flow | P1 | S | 2 | Tester |
| **Total** | | | | **17** | |

---

### Sprint 28 — User Story Details

#### S28.2: Bills Subcategory Picker UI

> **As a** user who selects "Bills" from the category grid,
> **I want** to choose the specific type of bill I am paying before seeing card recommendations,
> **So that** the recommendation reflects the actual MCC my payment will attract (not a generic base rate).

**Priority**: P1
**T-Shirt Size**: M — ~3 days (new UI component + 6 tile states)
**Feature**: F36

**UI reference** (from `DATA_CORRECTION_PLAN.md` wireframe):
```
Bills
──────────────────────────────
What type of bill are you paying?

  [Utilities]  [Telco]  [Insurance]
  [Education]  [Medical]  [Pharmacy]

──────────────────────────────
Selected: Utilities

All cards earn 0 mpd on utility payments
(SP Services, Geneco, Sembcorp).
No recommendation — any card earns the same.

Exception: Maybank Horizon earns 0.16 mpd.
```

---

#### S28.5: HealthHub Medical Bill Tip

> **As a** user paying a hospital bill,
> **I want** the app to tell me that paying via the HealthHub app routes as MCC 8099 (online shopping) and earns 4 mpd on Citi Rewards or DBS WWMC,
> **So that** I can earn up to 4 mpd on a payment category that most people assume earns 0 mpd.

**Priority**: P1 (High-value insight unique to MaxiMile)
**T-Shirt Size**: S — ~1 day

**Tip copy**:
> "Paying hospital bills? Use the HealthHub, Health Buddy, or OneNUHS app. These payments are coded as MCC 8099 (online), not MCC 8062 (hospital) — which means Citi Rewards and DBS WWMC earn 4 mpd instead of 0 mpd."

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | User selects Bills → Medical | Medical results screen loads | HealthHub tip card shown above recommendations |
| AC2 | HealthHub tip shown | Citi Rewards / DBS WWMC in portfolio | These two cards are highlighted with "4 mpd via HealthHub" label |
| AC3 | Other subcategories | User selects Bills → Pharmacy | No HealthHub tip shown (only Medical) |

---

### Sprint 28 — Schedule

| Day | Focus | Exit Criteria |
|-----|-------|---------------|
| **Day 1-2** | S28.1 (wireframes) | All 6 subcategory states + 0-mpd empty state + HealthHub tip wireframed and approved |
| **Day 3-5** | S28.2 (picker UI) + S28.3 (routing) | Picker renders; selecting a tile calls `recommend('bills', {subcategory: 'X'})` |
| **Day 6-7** | S28.4 (0-mpd empty states) + S28.5 (HealthHub tip) | Utilities shows 0-mpd state; Medical shows HealthHub tip |
| **Day 8-9** | S28.6 (E2E tests) | E2E flow passes; regression run clean |
| **Day 10** | Deploy to staging + TestFlight build | All acceptance criteria met; ready for beta |

---

**Sprint 28 Status**: ✅ COMPLETED — v1.7.0 (bills subcategory UI shipped 2026-03-01)

---

## Sprint 25-28 Summary: MileLion Gap Analysis Roadmap

### Total Effort

| Sprint | Phase | Name | Stories | Points | Duration |
|--------|-------|------|---------|--------|----------|
| **Sprint 25** | Phase 1 — P0 Data Corrections | Earn Rate Hotfix | 7 | 13 | 1 week |
| **Sprint 26** | Phase 2 — Telco Bonus Rules | Telco Bonus Rules | 3 | 5 | 1 week |
| **Sprint 27** | Phase 3 — Bills Subcategory Data | Bills Subcategory Data | 7 | 18 | 2 weeks |
| **Sprint 28** | Phase 4 — Bills Subcategory UI | Bills Subcategory UI | 6 | 17 | 2 weeks |
| **Total** | | | **23** | **53** | **6 weeks** |

### Key Milestones

| Milestone | Sprint | Success Criteria |
|-----------|--------|------------------|
| **P0 Wrong Recommendations Fixed** | Sprint 25 | 5 verified wrong earn rates corrected; recommendation.test.ts all green |
| **Telco 4 mpd Surfaced** | Sprint 26 | Cards 6/10/18/20 show 4 mpd on one-off telco bills |
| **Bills Subcategory Data Complete** | Sprint 27 | All 29 cards have per-subcategory earn rules; engine routes correctly |
| **Bills Subcategory UI Live** | Sprint 28 | Subcategory picker in app; HealthHub tip surfaced for medical bills |

### Dependencies & Prerequisites

| Sprint | Hard Dependencies | Soft Dependencies |
|--------|-------------------|-------------------|
| **Sprint 25** | Sprint 24 complete (29-card DB stable) | MileLion 2026 source confirmed per fix |
| **Sprint 26** | Sprint 25 complete (bills = 0 mpd for utilities) | Telco MCC list confirmed |
| **Sprint 27** | Sprint 26 complete (telco bonus rules live) | Bank exclusion matrix for education/medical |
| **Sprint 28** | Sprint 27 complete (subcategory engine routing working) | Designer wireframe approved |

### Reference Documentation

- **Data Correction Source of Truth**: `docs/technical/DATA_CORRECTION_PLAN.md`
- **Recommendation Logic**: `docs/technical/RECOMMENDATION_AND_CATEGORY_LOGIC.md`
- **Card Data**: `maximile-app/database/seeds/all_cards.sql`
- **Category MCCs**: `maximile-app/constants/categories.ts`
- **Tests**: `maximile-app/tests/recommendation.test.ts`

---

**Sprint 25-28 Status**: Sprint 25 ✅ COMPLETED | Sprint 26 ✅ COMPLETED | Sprint 27 ✅ COMPLETED | Sprint 28 ✅ COMPLETED

---

## Sprint 29: "Earn Rate Refresh" (MileLion March 2026 Audit — Phase 5)

**Duration**: 1 week (5 working days)
**Sprint Goal**: Apply 7 earn rate/cap corrections discovered via systematic MileLion March 2026 audit. These are SQL-only corrections to existing earn_rules and caps — no UI changes, no new cards. Addresses 3 P0 (critical) and 4 P1 (major) discrepancies between our data and MileLion's authoritative guide. DBS yuu Card (P0 new card), SC Smart Card bonus tiers (P0 complex logic), and currency quality tiebreaker (P2) are deferred to Sprint 30+.
**Epic**: E17 — Earn Rate Accuracy (March 2026 Refresh)
**PRD Features**: F36 (P0 — Earn Rate Data Refresh)
**Phase**: v2.6 — Data Accuracy
**Predecessor**: Sprint 28 complete (bills subcategory UI live; all prior data corrections applied)
**Source of Truth**: `docs/technical/AUDIT_MILELION_VS_RANKINGS.md`

---

### Sprint 29 — Definition of Ready (DoR) Checklist

- [x] Sprint 28 complete (bills subcategory data + UI live)
- [x] MileLion March 2026 audit complete (`docs/technical/AUDIT_MILELION_VS_RANKINGS.md`)
- [x] Each discrepancy verified against MileLion's published data
- [x] DBS Altitude travel bonus removal confirmed (MileLion says old 6 mpd Expedia / 3 mpd online travel bonuses removed)
- [x] HSBC Revolution cap $1,500/mo confirmed (boosted from $1,000/mo)
- [x] DBS Woman's World cap $1,000/mo confirmed (cut from $2,000/mo in August 2025)
- [x] KrisFlyer UOB transport 2.4 mpd confirmed (with $1,000/year SIA spend condition)
- [ ] SQL correction statements drafted and peer-reviewed
- [ ] RECOMMENDATION_RANKINGS.md update plan prepared

### Sprint 29 — Definition of Done (DoD) Checklist

- [ ] Migration SQL applied successfully (idempotent — safe to re-run)
- [ ] DBS Altitude no longer appears at 4 mpd in Travel rankings
- [ ] HSBC Revolution cap references updated to $1,500/mo in all affected earn_rules
- [ ] DBS Woman's World cap updated to $1,000/mo
- [ ] UOB Lady's Card appears in Groceries rankings at 4 mpd
- [ ] HSBC Revolution appears in Travel rankings at 4 mpd
- [ ] KrisFlyer UOB shows 2.4 mpd for transport
- [ ] RECOMMENDATION_RANKINGS.md Quick Reference table matches new data
- [ ] Seed file (`all_cards.sql`) updated to match migration
- [ ] No regressions in other category rankings

---

### Sprint 29 Stories

| ID | Story | Priority | Size | Points | Owner |
|----|-------|----------|------|--------|-------|
| S29.1 | Correct DBS Altitude travel earn_rule (4.0 → 1.2 mpd, bonus removed) | P0 | S | 2 | Data Engineer |
| S29.2 | Update HSBC Revolution cap to $1,500/mo (all bonus categories) | P0 | S | 2 | Data Engineer |
| S29.3 | Update DBS Woman's World cap to $1,000/mo (online shopping) | P0 | S | 2 | Data Engineer |
| S29.4 | Add UOB Lady's Card groceries bonus rule (4 mpd supermarkets) | P1 | S | 2 | Data Engineer |
| S29.5 | Add HSBC Revolution travel bonus rule (4 mpd direct airline/hotel) | P1 | S | 2 | Data Engineer |
| S29.6 | Update KrisFlyer UOB transport rate (add 2.4 mpd bonus rule) | P1 | S | 1 | Data Engineer |
| S29.7 | Verify UOB Preferred Platinum transport in rankings doc | P1 | XS | 1 | Data Engineer |
| S29.8 | Update RECOMMENDATION_RANKINGS.md to reflect all changes | P0 | S | 2 | Data Engineer |
| **Total** | | | | **14** | |

---

### Sprint 29 — User Story Details

#### S29.1: Correct DBS Altitude Travel Earn Rule

**As a** user with DBS Altitude Visa checking travel recommendations,
**I want** the app to show 1.2 mpd (not 4.0 mpd) for travel spend,
**So that** I don't use this card for travel expecting 4 mpd when the bonus has been removed.

**Priority**: P0 (Critical — Card 1 is being over-recommended for travel at 4 mpd when it earns 1.2 mpd)
**T-Shirt Size**: S — ~0.5 day (DELETE or UPDATE 1 earn_rule row)
**Feature**: F36

**Correction**:
```sql
-- Remove the 4.0 mpd travel bonus rule (bonus was removed per MileLion)
DELETE FROM earn_rules
WHERE card_id = '00000000-0000-0000-0001-000000000001'
  AND category_id = 'travel'
  AND is_bonus = TRUE;
```

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | DBS Altitude travel bonus deleted | `recommend('travel')` | DBS Altitude shows 1.2 mpd (base rate), not 4.0 mpd |
| AC2 | Other DBS Altitude earn rates unchanged | `recommend('dining')` | Still shows 1.2 mpd base rate |

---

#### S29.2: Update HSBC Revolution Cap to $1,500/mo

**As a** user with HSBC Revolution checking dining/online recommendations,
**I want** the cap to show $1,500/mo (not $1,000/mo),
**So that** I know my actual remaining cap and don't prematurely switch to a different card.

**Priority**: P0 (Cap already correct in caps table at $1,500; conditions_note text is stale at $1,000)
**T-Shirt Size**: S — ~0.5 day (UPDATE conditions_note on 2-3 earn_rule rows)
**Feature**: F36

**Correction**:
```sql
-- Update conditions_note to reflect $1,500/mo cap (caps table already correct)
UPDATE earn_rules
SET conditions_note = REPLACE(conditions_note, '$1,000/month', '$1,500/month')
WHERE card_id = '00000000-0000-0000-0001-000000000006'
  AND conditions_note LIKE '%$1,000/month%';
```

---

#### S29.3: Update DBS Woman's World Cap to $1,000/mo

**As a** user with DBS Woman's World checking online shopping recommendations,
**I want** the cap to show $1,000/mo (not $2,000/mo),
**So that** I know my actual cap limit and don't overspend expecting a higher cap.

**Priority**: P0 (Cap is $2,000 in caps table but MileLion confirms cut to $1,000 in August 2025)
**T-Shirt Size**: S — ~0.5 day (UPDATE 1 caps row + conditions_note)
**Feature**: F36

**Correction**:
```sql
-- Update caps table
UPDATE caps
SET monthly_cap_amount = 1000.00,
    notes = 'Cap on 10X bonus for online spending. Cut from $2,000 to $1,000/mo in August 2025. [VERIFIED from MileLion 2026]'
WHERE card_id = '00000000-0000-0000-0001-000000000010'
  AND category_id = 'online';

-- Update conditions_note in earn_rules
UPDATE earn_rules
SET conditions_note = 'Earn 4 mpd (10X DBS Points) on online spend. Capped at $1,000/month (cut from $2,000 in August 2025). [VERIFIED from MileLion 2026]'
WHERE card_id = '00000000-0000-0000-0001-000000000010'
  AND category_id = 'online'
  AND is_bonus = TRUE;
```

---

#### S29.4: Add UOB Lady's Card Groceries Bonus Rule

**As a** user with UOB Lady's Card shopping at supermarkets,
**I want** to see 4 mpd for groceries,
**So that** I use this card at FairPrice/Cold Storage and earn maximum miles.

**Priority**: P1 (Card 11 missing from grocery rankings despite MileLion listing it)
**T-Shirt Size**: S — ~0.5 day (1 INSERT row)
**Feature**: F36

**Correction**:
```sql
INSERT INTO earn_rules (card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note, source_url)
VALUES (
  '00000000-0000-0000-0002-000000000011', 'groceries', 4.0, TRUE,
  '{"user_selectable": true}',
  'Earn 4 mpd (10X UNI$) on supermarkets. Select Beauty & Wellness category to cover grocery MCCs. Cap $1,000/mo shared. [VERIFIED from MileLion 2026]',
  NULL
);
```

---

#### S29.5: Add HSBC Revolution Travel Bonus Rule

**As a** user with HSBC Revolution booking flights or hotels,
**I want** to see 4 mpd for direct airline/hotel bookings,
**So that** I use this card for travel (not just dining/online).

**Priority**: P1 (Card 6 missing from travel rankings despite MileLion listing it)
**T-Shirt Size**: S — ~0.5 day (1 INSERT row)
**Feature**: F36

**Correction**:
```sql
INSERT INTO earn_rules (card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note, source_url)
VALUES (
  '00000000-0000-0000-0001-000000000006', 'travel', 4.0, TRUE,
  '{"contactless": true, "direct_booking_only": true}',
  'Earn 4 mpd on direct airline, hotel, car rental, and cruise bookings (contactless). Online travel agencies (Expedia, Airbnb) NOT eligible. Cap $1,500/mo shared across bonus categories. [VERIFIED from MileLion 2026]',
  NULL
);
```

---

#### S29.6: Update KrisFlyer UOB Transport Rate

**As a** user with KrisFlyer UOB taking public transport,
**I want** to see 2.4 mpd for transport (not 1.2 mpd base),
**So that** I know to use this card on SimplyGo for a higher earn rate.

**Priority**: P1 (Card 5 shows 1.2 mpd base for transport; MileLion says 2.4 mpd uncapped)
**T-Shirt Size**: S — ~0.5 day (1 INSERT row for bonus rule)
**Feature**: F36

**Correction**:
```sql
INSERT INTO earn_rules (card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note, source_url)
VALUES (
  '00000000-0000-0000-0001-000000000005', 'transport', 2.4, TRUE,
  '{"contactless": true, "sia_spend_yearly": 1000}',
  'Earn 2.4 mpd on public transport (contactless/SimplyGo). Requires $1,000/year SIA spend to qualify. Uncapped. [VERIFIED from MileLion 2026]',
  NULL
);
```

---

#### S29.7: Verify UOB Preferred Platinum Transport in Rankings

**As a** user with UOB Preferred Platinum,
**I want** to see this card appear in transport rankings,
**So that** I know it earns 4 mpd on SimplyGo contactless transport.

**Priority**: P1 (Card 20 already has transport bonus rule in DB from Sprint 25 fix; just missing from RECOMMENDATION_RANKINGS.md)
**T-Shirt Size**: XS — ~1 hour (doc update only)
**Feature**: F36

**Note**: No SQL change needed. The bonus rule was added in Sprint 25 (S25.3). This story ensures the rankings doc is updated.

---

#### S29.8: Update RECOMMENDATION_RANKINGS.md

**As a** developer or PM reviewing card rankings,
**I want** the RECOMMENDATION_RANKINGS.md to reflect all Sprint 29 corrections,
**So that** the documentation matches the database and is the single source of truth.

**Priority**: P0 (Documentation must match data)
**T-Shirt Size**: S — ~0.5 day
**Feature**: F36

**Changes required**:
- Travel: Remove DBS Altitude from #1 (now 1.2 mpd base), add HSBC Revolution at 4 mpd
- Dining: Update HSBC Revolution cap reference from $1,000 to $1,500/mo
- Online Shopping: Update HSBC Revolution cap to $1,500/mo, DBS Woman's World cap to $1,000/mo
- Transport: Add UOB Preferred Platinum at 4 mpd, add KrisFlyer UOB bonus at 2.4 mpd
- Groceries: Add UOB Lady's Card at 4 mpd
- Bills > Telco: Update DBS Woman's World cap reference to $1,000/mo
- Bills > Pharmacy: Update HSBC Revolution cap reference to $1,500/mo
- Bills > Hospital: Update HSBC Revolution cap to $1,500/mo, DBS Woman's World cap to $1,000/mo
- Quick Reference table: Update accordingly
- Add migration history entry

---

### Sprint 29 — Dependencies Map

```
S29.1 (DBS Altitude) ─────────┐
S29.2 (HSBC Rev cap) ─────────┤
S29.3 (DBS WWC cap) ──────────┤
S29.4 (UOB Lady's groceries) ─┼──── S29.8 (Rankings doc update)
S29.5 (HSBC Rev travel) ──────┤
S29.6 (KrisFlyer UOB) ────────┤
S29.7 (UOB PP verify) ────────┘

Sprint 28 (bills subcategory live) ─── Hard prerequisite ───── Sprint 29 begins
```

### Sprint 29 — Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| DBS Altitude travel bonus removal unverified | Low | High | MileLion explicitly states "old bonuses removed"; verify with DBS T&C page before merging |
| HSBC Revolution cap revert after Revo Up promo (31 Mar 2026) | Medium | Medium | Note the promo expiry in conditions_note; schedule a follow-up check in April 2026 |
| KrisFlyer UOB 2.4 mpd requires SIA spend condition users may not meet | Medium | Low | Document the condition clearly; F31 (min spend enforcement) will handle this in a future sprint |

### Sprint 29 — Schedule

| Day | Focus | Exit Criteria |
|-----|-------|---------------|
| **Day 1** | S29.1 (DBS Altitude) + S29.2 (HSBC cap) + S29.3 (DBS WWC cap) | P0 corrections applied |
| **Day 2** | S29.4 (UOB Lady's) + S29.5 (HSBC Rev travel) + S29.6 (KrisFlyer UOB) | P1 corrections applied |
| **Day 3** | S29.7 (UOB PP verify) + S29.8 (Rankings doc) | All docs updated |
| **Day 4** | Regression testing + seed file sync | No regressions |
| **Day 5** | Final review + staging deploy | Sprint 29 complete |

---

**Sprint 29 Status**: ✅ COMPLETED — Migration 20260303000009 applied (2026-03-03). 7 earn rate/cap corrections: DBS Altitude travel 4.0→1.2, HSBC Revolution cap $1K→$1.5K, DBS WWC cap $2K→$1K, UOB Lady's groceries, HSBC Revolution travel, KrisFlyer UOB transport 2.0→2.4, UOB PP transport verified

---

## Sprint 30: "DBS yuu Card Integration" (MileLion March 2026 Audit — Phase 6)

**Duration**: 2 weeks (10 working days)
**Sprint Goal**: Add DBS yuu AMEX and DBS yuu Visa as cards #30-31. These cards earn 10 mpd at yuu merchants (FairPrice, 7-Eleven, Giant) for groceries and 10 mpd for food delivery (Deliveroo, GrabFood, Foodpanda). This is the single largest gap in our recommendation engine — DBS yuu would rank #1 in Groceries at 10 mpd (2.5x higher than any existing card) and #1 in Dining (food delivery) at 10 mpd. Adding two card variants (AMEX + Visa) because many SG merchants don't accept AMEX.
**Epic**: E18 — DBS yuu Card Integration
**PRD Features**: F37 (P0 — DBS yuu Card Integration)
**Phase**: v2.7 — Card Expansion (yuu)
**Predecessor**: Sprint 29 complete (earn rate refresh applied; all existing cards corrected)
**Source of Truth**: `docs/technical/AUDIT_MILELION_VS_RANKINGS.md` (Discrepancy #1, #6)

---

### Sprint 30 — Definition of Ready (DoR) Checklist

- [x] Sprint 29 complete (earn rate refresh applied)
- [x] DBS yuu Card earn rates confirmed from MileLion (10 mpd groceries at yuu merchants, 10 mpd food delivery)
- [x] Card variants identified: DBS yuu AMEX (primary) + DBS yuu Visa (fallback for non-AMEX merchants)
- [x] Cap confirmed: $800/mo on bonus categories, $800/mo minimum spend
- [x] yuu merchant list confirmed: FairPrice, Giant, 7-Eleven, Cold Storage, CS Fresh, Unity
- [x] Food delivery platforms confirmed: Deliveroo, GrabFood, Foodpanda
- [ ] Card images sourced (placeholder acceptable for Sprint 30)
- [ ] AMEX acceptance warning UX pattern approved

### Sprint 30 — Definition of Done (DoD) Checklist

- [ ] DBS yuu AMEX and DBS yuu Visa inserted into cards table with correct metadata
- [ ] 10 mpd grocery bonus rules created for both cards (yuu merchants, $800/mo cap, $800/mo min spend)
- [ ] 10 mpd food delivery bonus rules created for both cards (Deliveroo, GrabFood, Foodpanda)
- [ ] Base rate earn rules (0.4 mpd) created for all 8 categories
- [ ] Caps table entries created ($800/mo for groceries and dining)
- [ ] DBS yuu AMEX appears as #1 in Groceries recommendations at 10 mpd
- [ ] DBS yuu AMEX appears as #1 in Dining (food delivery) at 10 mpd
- [ ] AMEX acceptance warning displayed when DBS yuu AMEX is recommended
- [ ] DBS yuu Visa recommended as alternative when AMEX not accepted
- [ ] Seed file (`all_cards.sql`) updated with both cards
- [ ] RECOMMENDATION_RANKINGS.md updated with DBS yuu in Groceries (#1), Dining (#1 for food delivery)
- [ ] No regressions in other category rankings

---

### Sprint 30 Stories

| ID | Story | Priority | Size | Points | Owner |
|----|-------|----------|------|--------|-------|
| S30.1 | Add DBS yuu AMEX to cards table (card #30) | P0 | S | 2 | Data Engineer |
| S30.2 | Add DBS yuu Visa to cards table (card #31) | P0 | S | 2 | Data Engineer |
| S30.3 | Create 10 mpd grocery bonus rules for both yuu cards | P0 | M | 3 | Data Engineer |
| S30.4 | Create 10 mpd food delivery bonus rules for both yuu cards | P0 | M | 3 | Data Engineer |
| S30.5 | Create base rate earn rules (0.4 mpd) for all categories | P0 | S | 2 | Data Engineer |
| S30.6 | Create caps table entries ($800/mo for grocery + dining) | P0 | S | 1 | Data Engineer |
| S30.7 | Add AMEX acceptance warning to recommendation UI | P1 | M | 3 | Developer |
| S30.8 | Update RECOMMENDATION_RANKINGS.md with DBS yuu rankings | P0 | S | 2 | Data Engineer |
| **Total** | | | | **18** | |

---

### Sprint 30 — User Story Details

#### S30.1: Add DBS yuu AMEX to Cards Table

**As a** user who holds a DBS yuu AMEX card,
**I want** to add it to my portfolio,
**So that** I get recommendations that leverage its 10 mpd earning rate at yuu merchants.

**Priority**: P0 (Card missing entirely — largest gap in recommendation engine)
**T-Shirt Size**: S — ~0.5 day (1 INSERT into cards table)
**Feature**: F37

**Card metadata**:
```sql
INSERT INTO cards (id, bank, name, slug, network, annual_fee, base_rate_mpd, image_url, is_active, notes)
VALUES (
  '00000000-0000-0000-0005-000000000030',
  'DBS',
  'DBS yuu AMEX',
  'dbs-yuu-amex',
  'amex',
  0.00,
  0.4,
  NULL,
  TRUE,
  'DBS yuu AMEX. 10 mpd at yuu merchants (FairPrice, Giant, 7-Eleven, Cold Storage, CS Fresh, Unity). 10 mpd food delivery (Deliveroo, GrabFood, Foodpanda). Base 0.4 mpd. Min spend $800/mo. Cap $800/mo on bonus categories. Primary yuu card but AMEX not universally accepted — pair with DBS yuu Visa. No annual fee. [VERIFIED from MileLion March 2026]'
);
```

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | DBS yuu AMEX in cards table | User searches for DBS cards | DBS yuu AMEX appears in card list |
| AC2 | Card has correct metadata | User views card details | Shows AMEX network, $0 annual fee, 0.4 mpd base |
| AC3 | Card is active | App loads card list | Card is available for portfolio addition |

---

#### S30.2: Add DBS yuu Visa to Cards Table

**As a** user who holds a DBS yuu Visa card,
**I want** to add it to my portfolio,
**So that** I get yuu merchant recommendations at non-AMEX merchants.

**Priority**: P0 (Visa variant needed for merchants that don't accept AMEX)
**T-Shirt Size**: S — ~0.5 day (1 INSERT into cards table)
**Feature**: F37

**Card metadata**:
```sql
INSERT INTO cards (id, bank, name, slug, network, annual_fee, base_rate_mpd, image_url, is_active, notes)
VALUES (
  '00000000-0000-0000-0005-000000000031',
  'DBS',
  'DBS yuu Visa',
  'dbs-yuu-visa',
  'visa',
  0.00,
  0.4,
  NULL,
  TRUE,
  'DBS yuu Visa. Same yuu merchant bonuses as DBS yuu AMEX (10 mpd at FairPrice, Giant, 7-Eleven, Cold Storage, CS Fresh, Unity). 10 mpd food delivery (Deliveroo, GrabFood, Foodpanda). Base 0.4 mpd. Min spend $800/mo. Cap $800/mo on bonus categories. Visa variant for merchants that don''t accept AMEX. No annual fee. [VERIFIED from MileLion March 2026]'
);
```

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | DBS yuu Visa in cards table | User searches for DBS cards | DBS yuu Visa appears in card list |
| AC2 | Card has Visa network | User views card details | Shows Visa network, $0 annual fee, 0.4 mpd base |

---

#### S30.3: Create 10 mpd Grocery Bonus Rules

**As a** user with a DBS yuu card shopping at FairPrice or Giant,
**I want** to see 10 mpd for groceries,
**So that** I use this card at yuu merchants and earn maximum miles (2.5x better than any other card).

**Priority**: P0 (10 mpd would rank #1 in Groceries, displacing all 4 mpd cards)
**T-Shirt Size**: M — ~1 day (2 INSERT rows + conditions for yuu merchants + min spend)
**Feature**: F37

**Correction**:
```sql
-- DBS yuu AMEX groceries bonus
INSERT INTO earn_rules (card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note, source_url)
VALUES (
  '00000000-0000-0000-0005-000000000030', 'groceries', 10.0, TRUE,
  '{"yuu_merchants": true, "min_spend_monthly": 800}'::jsonb,
  'Earn 10 mpd at yuu merchants (FairPrice, Giant, 7-Eleven, Cold Storage, CS Fresh, Unity). Min spend $800/mo. Cap $800/mo on bonus categories shared with food delivery. [VERIFIED from MileLion March 2026]',
  NULL
);

-- DBS yuu Visa groceries bonus
INSERT INTO earn_rules (card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note, source_url)
VALUES (
  '00000000-0000-0000-0005-000000000031', 'groceries', 10.0, TRUE,
  '{"yuu_merchants": true, "min_spend_monthly": 800}'::jsonb,
  'Earn 10 mpd at yuu merchants (FairPrice, Giant, 7-Eleven, Cold Storage, CS Fresh, Unity). Min spend $800/mo. Cap $800/mo on bonus categories shared with food delivery. [VERIFIED from MileLion March 2026]',
  NULL
);
```

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Both yuu cards have grocery bonus rules | `recommend('groceries')` | DBS yuu AMEX shows 10 mpd, ranked #1 |
| AC2 | Conditions documented | User taps card for details | Shows yuu merchant list, $800/mo cap, $800/mo min spend |
| AC3 | Existing grocery rankings unaffected | `recommend('groceries')` | UOB Visa Sig still at 4 mpd, just ranked lower |

---

#### S30.4: Create 10 mpd Food Delivery Bonus Rules

**As a** user with a DBS yuu card ordering from Deliveroo, GrabFood, or Foodpanda,
**I want** to see 10 mpd for food delivery,
**So that** I use this card for delivery orders and earn maximum miles.

**Priority**: P0 (10 mpd food delivery would rank #1 in Dining subcategory)
**T-Shirt Size**: M — ~1 day (2 INSERT rows + merchant-specific conditions)
**Feature**: F37

**Correction**:
```sql
-- DBS yuu AMEX food delivery bonus (modeled as dining bonus with food_delivery condition)
INSERT INTO earn_rules (card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note, source_url)
VALUES (
  '00000000-0000-0000-0005-000000000030', 'dining', 10.0, TRUE,
  '{"food_delivery": true, "merchants": ["deliveroo", "grabfood", "foodpanda"], "min_spend_monthly": 800}'::jsonb,
  'Earn 10 mpd on food delivery (Deliveroo, GrabFood, Foodpanda). Min spend $800/mo. Cap $800/mo shared with grocery bonus. [VERIFIED from MileLion March 2026]',
  NULL
);

-- DBS yuu Visa food delivery bonus
INSERT INTO earn_rules (card_id, category_id, earn_rate_mpd, is_bonus, conditions, conditions_note, source_url)
VALUES (
  '00000000-0000-0000-0005-000000000031', 'dining', 10.0, TRUE,
  '{"food_delivery": true, "merchants": ["deliveroo", "grabfood", "foodpanda"], "min_spend_monthly": 800}'::jsonb,
  'Earn 10 mpd on food delivery (Deliveroo, GrabFood, Foodpanda). Min spend $800/mo. Cap $800/mo shared with grocery bonus. [VERIFIED from MileLion March 2026]',
  NULL
);
```

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Both yuu cards have dining bonus rules | `recommend('dining')` | DBS yuu AMEX shows 10 mpd for food delivery |
| AC2 | Food delivery condition noted | User taps card | Shows "food delivery only" — not restaurant dining |
| AC3 | Non-food-delivery dining | `recommend('dining')` for restaurants | DBS yuu shows 0.4 mpd base (not 10 mpd) |

---

#### S30.5: Create Base Rate Earn Rules for All Categories

**As a** data engineer setting up DBS yuu cards,
**I want** base rate earn rules (0.4 mpd) for all 8 categories,
**So that** the cards show in recommendation results even for non-bonus categories.

**Priority**: P0 (Missing base rules would cause cards to not appear in category recommendations)
**T-Shirt Size**: S — ~0.5 day (16 INSERT rows — 8 categories × 2 cards)
**Feature**: F37

**Note**: Bills base rate is 0 mpd (utilities/insurance excluded). Travel, transport, petrol, online all earn 0.4 mpd base.

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | All 8 categories have base earn rules | `recommend('transport')` | DBS yuu AMEX shows 0.4 mpd (base) |
| AC2 | Bills set to 0 mpd | `recommend('bills')` | DBS yuu cards show 0 mpd for utilities |

---

#### S30.6: Create Caps Table Entries

**As a** user tracking spending caps,
**I want** accurate cap data for DBS yuu cards,
**So that** I see when I'm approaching the $800/mo bonus cap.

**Priority**: P0 (Cap tracking requires caps table rows)
**T-Shirt Size**: S — ~2 hours (4 INSERT rows — groceries + dining × 2 cards)
**Feature**: F37

**Correction**:
```sql
-- DBS yuu AMEX caps
INSERT INTO caps (card_id, category_id, monthly_cap_amount, cap_type, notes)
VALUES
  ('00000000-0000-0000-0005-000000000030', 'groceries', 800.00, 'bonus_spend', 'Cap on 10X yuu bonus for groceries. $800/mo shared across bonus categories. [VERIFIED from MileLion March 2026]'),
  ('00000000-0000-0000-0005-000000000030', 'dining', 800.00, 'bonus_spend', 'Cap on 10X yuu bonus for food delivery. $800/mo shared across bonus categories. [VERIFIED from MileLion March 2026]');

-- DBS yuu Visa caps
INSERT INTO caps (card_id, category_id, monthly_cap_amount, cap_type, notes)
VALUES
  ('00000000-0000-0000-0005-000000000031', 'groceries', 800.00, 'bonus_spend', 'Cap on 10X yuu bonus for groceries. $800/mo shared across bonus categories. [VERIFIED from MileLion March 2026]'),
  ('00000000-0000-0000-0005-000000000031', 'dining', 800.00, 'bonus_spend', 'Cap on 10X yuu bonus for food delivery. $800/mo shared across bonus categories. [VERIFIED from MileLion March 2026]');
```

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Caps created for both cards | User views cap tracker | Shows $800/mo cap for groceries and dining |
| AC2 | Shared cap documented | Conditions note visible | States "shared across bonus categories" |

---

#### S30.7: AMEX Acceptance Warning in Recommendation UI

**As a** user seeing DBS yuu AMEX recommended at #1,
**I want** a warning that AMEX may not be accepted everywhere,
**So that** I carry the DBS yuu Visa as backup or use another card.

**Priority**: P1 (UX improvement — AMEX acceptance is ~60% in SG)
**T-Shirt Size**: M — ~1-2 days (UI component + conditional rendering)
**Feature**: F37

**Design**:
- Show amber badge "AMEX — may not be accepted at all merchants" on DBS yuu AMEX recommendation card
- Below the AMEX card, show a "Visa alternative" row: "DBS yuu Visa (same benefits, Visa accepted everywhere)"
- Badge should appear for ALL AMEX cards in the system (also Amex KrisFlyer Ascend, Amex KrisFlyer CC)

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | DBS yuu AMEX recommended | User views groceries recommendation | Amber AMEX badge visible |
| AC2 | DBS yuu Visa shown as alternative | User sees AMEX warning | DBS yuu Visa listed below as "Visa alternative" |
| AC3 | Other AMEX cards also show badge | User sees Amex KrisFlyer Ascend | Same amber AMEX badge shown |

---

#### S30.8: Update RECOMMENDATION_RANKINGS.md

**As a** developer or PM reviewing card rankings,
**I want** the RECOMMENDATION_RANKINGS.md to include DBS yuu cards,
**So that** the documentation is the single source of truth.

**Priority**: P0 (Documentation must match data)
**T-Shirt Size**: S — ~0.5 day
**Feature**: F37

**Changes required**:
- Groceries: Add DBS yuu AMEX at #1 (10 mpd), DBS yuu Visa at #2 (10 mpd)
- Dining: Add DBS yuu AMEX/Visa for food delivery at 10 mpd (note: restaurant dining is 0.4 mpd base)
- Quick Reference table: Update Groceries and Dining top picks
- Card Reference table: Add DBS yuu AMEX and DBS yuu Visa
- Add migration history entry
- Note AMEX acceptance caveat in rankings

---

### Sprint 30 — Dependencies Map

```
S30.1 (yuu AMEX card) ──────────┐
S30.2 (yuu Visa card) ──────────┤
                                 ├── S30.3 (grocery bonus rules) ──┐
                                 ├── S30.4 (food delivery bonus)  ─┤
                                 ├── S30.5 (base rate rules) ──────┼── S30.8 (Rankings doc)
                                 └── S30.6 (caps) ────────────────┘
                                                                    │
S30.7 (AMEX warning UI) ──────────────────────── Independent ──────┘

Sprint 29 (earn rate refresh) ─── Hard prerequisite ───── Sprint 30 begins
```

### Sprint 30 — Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| yuu merchant MCC list incomplete | Medium | Medium | Cross-reference with DBS T&C page; add "yuu_merchants" condition flag for future merchant additions |
| Food delivery MCCs overlap with restaurant dining | Medium | High | Use merchant-specific conditions (Deliveroo, GrabFood, Foodpanda) rather than MCC-based matching |
| $800/mo cap shared across groceries and dining may confuse users | Low | Medium | Clearly state "shared cap" in conditions_note and cap tracker UI |
| AMEX acceptance warning may discourage users from DBS yuu AMEX | Low | Low | Frame as informational, not prohibitive; show Visa alternative prominently |
| Min spend $800/mo condition may not be met by all users | Medium | Medium | Document condition clearly; F31 (min spend enforcement) will handle this in a future sprint |

### Sprint 30 — Schedule

| Day | Focus | Exit Criteria |
|-----|-------|---------------|
| **Day 1-2** | S30.1 (yuu AMEX) + S30.2 (yuu Visa) — card table entries | Both cards in DB |
| **Day 3-4** | S30.3 (grocery bonus) + S30.4 (food delivery bonus) — earn rules | 10 mpd rules live |
| **Day 5** | S30.5 (base rates) + S30.6 (caps) | All earn rules + caps complete |
| **Day 6-7** | S30.7 (AMEX warning UI) | AMEX badge in recommendation UI |
| **Day 8** | S30.8 (Rankings doc) + seed file sync | Docs match DB |
| **Day 9-10** | Regression testing + staging deploy | Sprint 30 complete |

---

**Sprint 30 Status**: 📋 PLANNED — Awaiting Sprint 29 completion

---

## Sprint 31: "SC Smart Card Bonus Tiers" (MileLion March 2026 Audit — Phase 7)

**Duration**: 2 weeks (10 working days)
**Sprint Goal**: Model SC Smart Card's tiered cashback-to-miles equivalence. Currently listed at 0.4 mpd (base only), but MileLion values it at 5.6 mpd equivalent on transport, fast food, streaming, and EV charging (rising to 7.42 mpd at $800-$1,500/mo total spend, 9.28 mpd at $1,500+). This is the second-largest gap in our recommendation engine — SC Smart Card would rank #1 or #2 in Transport at 5.6+ mpd. Requires a **policy decision** on showing cashback-to-miles conversion in a miles-focused app, and **engineering changes** to model tiered earn rates in the recommendation engine.
**Epic**: E19 — SC Smart Card Bonus Tiers
**PRD Features**: F38 (P0 — SC Smart Card Bonus Tiers)
**Phase**: v2.8 — Cashback-to-Miles Equivalence
**Predecessor**: Sprint 30 complete (DBS yuu cards integrated; recommendation engine stable)
**Source of Truth**: `docs/technical/AUDIT_MILELION_VS_RANKINGS.md` (Discrepancy #2)

---

### Sprint 31 — Definition of Ready (DoR) Checklist

- [x] Sprint 30 complete (DBS yuu cards integrated)
- [x] SC Smart Card bonus tiers confirmed from MileLion (5.6/7.42/9.28 mpd equiv.)
- [x] Eligible categories identified: transport, fast food, streaming, EV charging
- [x] Tier thresholds confirmed: base tier (<$800/mo), mid tier ($800-$1,500/mo), high tier ($1,500+/mo)
- [ ] **Policy decision made**: How to display cashback-to-miles equivalence in a miles-focused app
- [ ] Conversion formula documented: 1% cashback = X mpd equivalent
- [ ] recommend() RPC function reviewed for tiered earn rate support
- [ ] Design for tiered rate display approved (e.g., "5.6 mpd equiv.*" with asterisk explanation)

### Sprint 31 — Definition of Done (DoD) Checklist

- [ ] Policy decision on cashback-to-miles conversion documented in PRD
- [ ] SC Smart Card earn rules updated from 0.4 mpd to tiered rates for transport, fast food, streaming, EV charging
- [ ] Tiered earn rates modeled in earn_rules conditions JSONB (base/mid/high tiers)
- [ ] recommend() function returns correct tiered rate based on user's declared monthly spend (or base tier as default)
- [ ] UI shows "mpd equiv." label for cashback-to-miles converted cards
- [ ] SC Smart Card appears competitively in Transport rankings (rank #1-2 at 5.6+ mpd)
- [ ] RECOMMENDATION_RANKINGS.md updated with SC Smart Card tiered rates
- [ ] Seed file updated with new earn rules
- [ ] Conversion formula documented and unit tested
- [ ] No regressions in other category rankings

---

### Sprint 31 Stories

| ID | Story | Priority | Size | Points | Owner |
|----|-------|----------|------|--------|-------|
| S31.1 | Document cashback-to-miles conversion policy decision | P0 | S | 2 | PM + Data Engineer |
| S31.2 | Update SC Smart Card transport earn rule to 5.6 mpd equiv. (base tier) | P0 | M | 3 | Data Engineer |
| S31.3 | Add SC Smart Card fast food bonus rule (5.6 mpd equiv.) | P0 | S | 2 | Data Engineer |
| S31.4 | Add SC Smart Card streaming + EV charging bonus rules | P1 | S | 2 | Data Engineer |
| S31.5 | Model tiered spend thresholds in earn_rules conditions | P0 | L | 3 | Software Engineer |
| S31.6 | Update recommend() to support tiered earn rates | P0 | L | 3 | Software Engineer |
| S31.7 | Update RECOMMENDATION_RANKINGS.md with SC Smart Card tiers | P0 | S | 1 | Data Engineer |
| **Total** | | | | **16** | |

---

### Sprint 31 — User Story Details

#### S31.1: Document Cashback-to-Miles Conversion Policy

**As a** product team deciding how to display cashback cards,
**I want** a documented policy on cashback-to-miles equivalence,
**So that** we have a consistent approach for SC Smart Card and any future cashback cards.

**Priority**: P0 (Blocks all other stories — must decide before implementation)
**T-Shirt Size**: S — ~0.5 day (policy document + PRD update)
**Feature**: F38

**Policy options to evaluate**:
1. **Show equivalent mpd with label**: "5.6 mpd equiv.*" — clearest for users comparing cards
2. **Show cashback % with conversion note**: "5.6% cashback (≈5.6 mpd)" — more transparent
3. **Separate cashback ranking**: Don't mix cashback and miles cards — most conservative
4. **MileLion approach**: Show equivalent mpd using 1 cpp = 1 mpd conversion (MileLion's method)

**Recommended**: Option 1 (equivalent mpd with label), matching MileLion's approach. This keeps the ranking system consistent while flagging that the card earns cashback, not miles.

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Policy decision documented | Team reviews | Clear conversion formula: 1% cashback = 1 mpd equivalent |
| AC2 | PRD updated | F38 acceptance criteria | Reflects chosen policy |
| AC3 | UI label defined | Design review | "mpd equiv." label approved for cashback cards |

---

#### S31.2: Update SC Smart Card Transport Earn Rule

**As a** user with SC Smart Card taking public transport,
**I want** to see 5.6 mpd equivalent (not 0.4 mpd) for transport,
**So that** I know this card is competitive for SimplyGo and transit payments.

**Priority**: P0 (Currently massively understated — 0.4 mpd vs. actual 5.6 mpd equiv.)
**T-Shirt Size**: M — ~1 day (UPDATE existing rule + add tiered conditions)
**Feature**: F38

**Correction**:
```sql
-- Update existing SC Smart Card transport base rule to show bonus tier
UPDATE earn_rules
SET earn_rate_mpd = 5.6,
    is_bonus = TRUE,
    conditions = '{"cashback_equivalent": true, "tier": "base", "tiered_rates": {"base": 5.6, "mid": 7.42, "high": 9.28}, "tier_thresholds": {"mid_min": 800, "high_min": 1500}}'::jsonb,
    conditions_note = 'SC Smart Card earns 5.6% cashback on transport (≈5.6 mpd equiv. using 1 cpp = 1 mpd). Tiered by total monthly spend: 7.42 mpd equiv. at $800-$1,500/mo; 9.28 mpd equiv. at $1,500+/mo. [VERIFIED from MileLion March 2026]',
    updated_at = NOW()
WHERE card_id = (SELECT id FROM cards WHERE slug = 'sc-smart-card' LIMIT 1)
  AND category_id = 'transport';

-- Keep a base rate rule at 0.4 mpd for non-bonus categories
```

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | SC Smart Card transport updated | `recommend('transport')` | Shows 5.6 mpd equiv. (base tier), ranked #1-2 |
| AC2 | Tiered rates in conditions | User taps card for details | Shows tiers: 5.6 / 7.42 / 9.28 mpd equiv. |
| AC3 | "mpd equiv." label visible | Recommendation card | Clearly labeled as cashback equivalent, not actual miles |

---

#### S31.3: Add SC Smart Card Fast Food Bonus Rule

**As a** user with SC Smart Card buying fast food,
**I want** to see 5.6 mpd equivalent for fast food,
**So that** I use this card at McDonald's, KFC, and similar outlets.

**Priority**: P0 (Fast food is a new bonus category for SC Smart Card not currently modeled)
**T-Shirt Size**: S — ~0.5 day (1 INSERT row)
**Feature**: F38

**Note**: Fast food may need to be modeled as a dining subcategory with MCC filter (5812, 5814), or as a separate conditions flag. Decision depends on whether our category system supports MCC-level filtering within dining.

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | SC Smart Card fast food rule created | `recommend('dining')` with fast food context | Shows 5.6 mpd equiv. |
| AC2 | Non-fast-food dining unaffected | `recommend('dining')` for restaurants | SC Smart Card shows 0.4 mpd base |

---

#### S31.4: Add SC Smart Card Streaming + EV Charging Bonus Rules

**As a** user with SC Smart Card paying for Netflix or EV charging,
**I want** to see 5.6 mpd equivalent for these categories,
**So that** I know this card earns bonus rates on streaming and EV charging.

**Priority**: P1 (Lower priority than transport/fast food — smaller user impact)
**T-Shirt Size**: S — ~0.5 day (2 INSERT rows)
**Feature**: F38

**Note**: Streaming may map to online or bills subcategory. EV charging may map to petrol or transport. Category mapping decisions needed.

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Streaming bonus rule created | Streaming payment recommendation | Shows 5.6 mpd equiv. for SC Smart Card |
| AC2 | EV charging bonus rule created | EV charging recommendation | Shows 5.6 mpd equiv. for SC Smart Card |

---

#### S31.5: Model Tiered Spend Thresholds in Earn Rules

**As a** data engineer modeling tiered earn rates,
**I want** a consistent JSONB structure for tiered rates,
**So that** the recommendation engine can look up the correct tier based on user spend.

**Priority**: P0 (Foundation for tiered rate display)
**T-Shirt Size**: L — ~2-3 days (JSONB schema design + documentation + validation)
**Feature**: F38

**Proposed JSONB structure**:
```json
{
  "cashback_equivalent": true,
  "tier": "base",
  "tiered_rates": {
    "base": 5.6,
    "mid": 7.42,
    "high": 9.28
  },
  "tier_thresholds": {
    "mid_min": 800,
    "high_min": 1500
  }
}
```

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | JSONB schema documented | Data engineer reviews | Consistent structure for all tiered cards |
| AC2 | All SC Smart Card bonus rules use schema | DB query | All bonus rules have `tiered_rates` in conditions |
| AC3 | Schema extensible | Future tiered card added | Same structure works without migration |

---

#### S31.6: Update recommend() to Support Tiered Earn Rates

**As a** user with varying monthly spend levels,
**I want** the recommendation engine to show the correct tier rate,
**So that** I see 7.42 mpd equiv. if I spend $800-$1,500/mo or 9.28 mpd at $1,500+.

**Priority**: P0 (Without this, recommend() can't display tiered rates correctly)
**T-Shirt Size**: L — ~2-3 days (RPC function modification + testing)
**Feature**: F38

**Implementation approach**:
1. Default to base tier (5.6 mpd) when user's monthly spend is unknown
2. If user's transaction history shows total monthly spend, calculate tier automatically
3. Allow manual tier override in user preferences (future sprint)
4. Display all three tiers in card detail view regardless of current tier

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | User with no spend history | `recommend('transport')` | SC Smart Card shows 5.6 mpd equiv. (base tier) |
| AC2 | User spending $1,000/mo | `recommend('transport')` | SC Smart Card shows 7.42 mpd equiv. (mid tier) |
| AC3 | User spending $2,000/mo | `recommend('transport')` | SC Smart Card shows 9.28 mpd equiv. (high tier) |
| AC4 | Card detail view | User taps SC Smart Card | All 3 tiers displayed with threshold labels |

---

#### S31.7: Update RECOMMENDATION_RANKINGS.md

**As a** developer or PM reviewing card rankings,
**I want** the RECOMMENDATION_RANKINGS.md to reflect SC Smart Card's tiered rates,
**So that** documentation is the single source of truth.

**Priority**: P0 (Documentation must match data)
**T-Shirt Size**: S — ~2 hours
**Feature**: F38

**Changes required**:
- Transport: Add SC Smart Card at 5.6 mpd equiv. (rank #1-2), note tiered rates
- Dining (fast food): Note SC Smart Card 5.6 mpd equiv. for fast food MCCs
- Add "Cashback-to-Miles Equivalence" section explaining the conversion formula
- Quick Reference table: Update Transport top pick
- Card Reference table: Update SC Smart Card entry with bonus categories
- Add migration history entry

---

### Sprint 31 — Dependencies Map

```
S31.1 (Policy decision) ────── BLOCKS ────── S31.2 (transport rule)
                                              S31.3 (fast food rule)
                                              S31.4 (streaming/EV rules)
                                              S31.5 (tiered JSONB schema)

S31.5 (tiered JSONB schema) ── BLOCKS ────── S31.6 (recommend() update)

S31.2 + S31.3 + S31.4 + S31.6 ────────────── S31.7 (Rankings doc)

Sprint 30 (DBS yuu) ─── Hard prerequisite ───── Sprint 31 begins
```

### Sprint 31 — Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Policy deadlock on cashback-to-miles conversion | Medium | High | Default to MileLion's approach (1 cpp = 1 mpd equiv.) if no team consensus by Day 2 |
| Tiered rate logic adds complexity to recommend() | High | Medium | Keep tier lookup simple — one CASE statement based on total monthly spend; avoid over-engineering |
| "mpd equiv." label confuses users unfamiliar with conversion | Medium | Medium | Add tooltip/info icon explaining "this card earns cashback, not miles — shown as miles equivalent for comparison" |
| SC Smart Card cashback rates change | Low | Medium | Document source and verification date; schedule quarterly re-check |
| Fast food MCC overlap with dining category | Medium | Medium | Use specific MCC codes (5812, 5814) in conditions to distinguish fast food from full-service restaurants |
| User monthly spend data may not be available for tier calculation | High | Low | Default to base tier (5.6 mpd equiv.); show all tiers in card detail view for user reference |

### Sprint 31 — Schedule

| Day | Focus | Exit Criteria |
|-----|-------|---------------|
| **Day 1** | S31.1 (Policy decision) — team alignment on conversion approach | Policy documented, conversion formula agreed |
| **Day 2-3** | S31.5 (Tiered JSONB schema) — design and document | Schema approved and documented |
| **Day 4-5** | S31.2 (transport) + S31.3 (fast food) + S31.4 (streaming/EV) | All earn rules created with tiered conditions |
| **Day 6-8** | S31.6 (recommend() update) — implement tiered rate lookup | Tiered rates returned correctly by recommend() |
| **Day 9** | S31.7 (Rankings doc) + seed file sync | Docs match DB |
| **Day 10** | Regression testing + staging deploy | Sprint 31 complete |

---

**Sprint 31 Status**: 📋 PLANNED — Awaiting Sprint 30 completion + cashback-to-miles policy decision

---

## Sprint 32: "Visual Setup" (F40 — Auto-Capture Setup Carousel)

**Duration**: 0.5 weeks (2-3 working days)
**Sprint Goal**: Replace the 6-item numbered text instruction list on the auto-capture setup screen with a swipeable carousel. Each setup step gets its own visual card with an icon illustration, step badge, title, and short description. Reduces cognitive load and improves shortcut setup completion rate.
**Epic**: E12 — Transaction Auto-Capture (UX improvement)
**PRD Features**: F40 (P1.5 — Auto-Capture Setup Carousel)
**Phase**: v2.7 — Onboarding UX Polish
**Predecessor**: None — no hard dependencies; can be scheduled at any time
**Files Modified**: `maximile-app/app/auto-capture-setup.tsx` (single file change)

---

### Sprint 32 — Definition of Ready (DoR) Checklist

- [x] Auto-capture setup screen exists and is functional (`auto-capture-setup.tsx`)
- [x] 6 setup steps defined with icons, titles, and descriptions
- [x] No new dependencies required — `FlatList` and `Dimensions` are built into React Native
- [x] Design spec: each slide has step badge (gold pill), 72px icon circle (gold tint), optional secondary icon, centered title, centered description
- [x] Pagination: active dot = 20px gold pill, inactive dots = 7px circles

### Sprint 32 — Definition of Done (DoD) Checklist

- [ ] 6-slide horizontal carousel renders in place of the old numbered instruction list
- [ ] Each slide displays: step badge, icon illustration, title, description
- [ ] Pagination dots below carousel update on swipe
- [ ] Carousel works on both iOS (native) and web (Vercel)
- [ ] Download button still functions correctly
- [ ] "I've set this up" button still advances to success step
- [ ] "Set up later" still skips to miles entry
- [ ] Old instruction styles removed (no dead code)
- [ ] `npx expo export --platform web` builds successfully

---

### Sprint 32 — Stories

| ID | Story | Priority | Size | Points | Owner |
|----|-------|----------|------|--------|-------|
| **S32.1** | As a user, I want the shortcut setup instructions displayed as a swipeable visual carousel so I can focus on one step at a time | P0 | S | 3 | Developer |
| **Total** | | | | **3** | |

---

### Sprint 32 — User Story Details

#### S32.1: Auto-Capture Setup Carousel

**As a** user viewing the shortcut setup instructions,
**I want** each step presented as a visual card in a swipeable carousel,
**So that** I can focus on one step at a time and feel less overwhelmed.

**Priority**: P0
**T-Shirt Size**: S — ~2-3 days (single file, UI-only change)
**Feature**: F40

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I am on the auto-capture setup screen (Step 0) | The screen loads | I see a horizontal carousel where the numbered instruction list used to be |
| AC2 | I view a carousel slide | I look at the slide | I see a step badge (e.g. "Step 3"), a 72px gold-tinted icon circle with an Ionicons icon, a title, and a short description |
| AC3 | A slide has a secondary icon (Steps 1, 3, 4, 6) | I view that slide | I see a 32px secondary icon badge at the bottom-right of the main icon circle |
| AC4 | I swipe left or right on the carousel | The carousel animates | The next/previous slide scrolls into view and the pagination dots update |
| AC5 | I view the pagination dots | I count them | There are 6 dots; the active dot is a 20px gold pill, inactive dots are 7px circles |
| AC6 | I tap the "Add Shortcut" download button | Button is pressed | The shortcut download still works as before |
| AC7 | I tap "I've set this up" | Button is pressed | The screen advances to the success step (Step 1) |

**Task Breakdown**:

| Task | Description | Size | Owner |
|------|-------------|------|-------|
| T32.1 | Add `SETUP_SLIDES` data constant (6 objects with id, stepNumber, icon, secondaryIcon, title, description) | XS | Developer |
| T32.2 | Build `CarouselSlide` sub-component (step badge, icon illustration with optional secondary icon, title, description) | S | Developer |
| T32.3 | Build `CarouselPagination` sub-component (6 dots, active = gold pill, inactive = circle) | XS | Developer |
| T32.4 | Replace instruction list in `renderStep0()` with horizontal `FlatList` + pagination | S | Developer |
| T32.5 | Add `activeSlide` state, `flatListRef`, and `onViewableItemsChanged` callback | XS | Developer |
| T32.6 | Add carousel and pagination StyleSheets | XS | Developer |
| T32.7 | Remove unused instruction styles (`instructionHeader`, `instructionRow`, `instructionNumber`, `instructionNumberText`, `instructionText`) | XS | Developer |
| T32.8 | Add `FlatList` and `Dimensions` to react-native imports | XS | Developer |
| T32.9 | Verify build with `npx expo export --platform web` | XS | Developer |

---

### Sprint 32 — Slide Data Reference

| Step | Icon | Secondary Icon | Title | Description |
|------|------|----------------|-------|-------------|
| 1 | `download-outline` | `open-outline` | Download & Open | Tap "Add Shortcut" above, then open the downloaded file. |
| 2 | `add-circle-outline` | — | Add the Shortcut | In the Shortcuts app, tap "+ Add Shortcut" to install it. |
| 3 | `git-branch-outline` | `add-outline` | Create Automation | Open the Automation tab and tap "+" to create a new one. |
| 4 | `wallet-outline` | `hand-left-outline` | Set Trigger | Choose "When I tap a Wallet Card or Pass" as the trigger. |
| 5 | `search-outline` | — | Select MaxiMile | Under "My Shortcuts", find and tap "MaxiMile". |
| 6 | `flash-outline` | `checkmark-circle-outline` | Run Immediately | Set the automation to "Run Immediately", then tap "Done". |

---

### Sprint 32 — Dependencies Map

```
No external dependencies.
All tasks are sequential within a single file.

T32.8 (imports) → T32.1 (slide data) → T32.2 (CarouselSlide) → T32.3 (CarouselPagination)
                                                                         ↓
T32.5 (state/refs) ──────────────────────────────────────────→ T32.4 (replace instruction list)
                                                                         ↓
                                                               T32.6 (new styles) → T32.7 (remove old styles)
                                                                         ↓
                                                               T32.9 (verify build)
```

---

### Sprint 32 — Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| FlatList horizontal scroll doesn't work well on web | Medium | Medium | `pagingEnabled` works on web via react-native-web; test on Vercel deployment; fallback to `ScrollView` with `snapToInterval` if needed |
| Carousel slides too wide/narrow on different screen sizes | Low | Low | Use `Dimensions.get('window').width` minus padding for slide width; test on multiple viewport sizes |

---

### Sprint 32 — Schedule

| Day | Focus | Exit Criteria |
|-----|-------|---------------|
| **Day 1** | T32.8 + T32.1 + T32.2 + T32.3 (imports, data, components) | Slide and pagination components render in isolation |
| **Day 2** | T32.4 + T32.5 + T32.6 + T32.7 (integration, state, styles, cleanup) | Carousel replaces instruction list, old styles removed |
| **Day 3** | T32.9 (build verification + Vercel deploy + testing) | Sprint 32 complete |

---

**Sprint 32 Status**: 📋 PLANNED — Ready to start (no dependencies)

---

## Sprint 33: "Navigation Restructure" (F41 — Cards+Caps Merge & Transactions Tab)

**Duration**: 0.5 weeks (2-3 working days)
**Sprint Goal**: Merge "My Cards" and "Cap Status" tabs into one enriched "My Cards" tab, and promote Transaction History to a dedicated "Transactions" tab. Reduces navigation redundancy and surfaces high-frequency features at top level.
**Epic**: E20 — Navigation Restructure
**PRD Features**: F41 (P1 — Navigation Restructure — Cards+Caps Merge & Transactions Tab)
**Phase**: v2.8 — Navigation Polish
**Predecessor**: None — no hard dependencies; can be scheduled at any time
**Files Modified**: `caps.tsx`, `cards.tsx`, `_layout.tsx`, `card/[id].tsx`, `profile.tsx`

---

### Sprint 33 — Definition of Ready (DoR) Checklist

- [x] Cap Status screen exists and shows card list with progress bars (`caps.tsx`)
- [x] My Cards screen exists as separate tab (`cards.tsx`)
- [x] Tab layout defined in `_layout.tsx` with 5 visible tabs
- [x] Transaction History screen exists at `app/transactions.tsx` (content to be reused)
- [x] Card Detail screen exists at `app/card/[id].tsx`
- [x] Profile screen has Transaction History menu item

### Sprint 33 — Definition of Done (DoD) Checklist

- [ ] My Cards tab shows cap status view (merged from old Caps tab)
- [ ] Tapping a card in My Cards navigates to Card Detail (`/card/${id}`)
- [ ] My Cards tab has "Add Card" button in header
- [ ] Transactions tab shows global transaction history grouped by month
- [ ] Card Detail screen has "See Transactions" button linking to card-specific transactions
- [ ] Profile no longer shows Transaction History menu item
- [ ] Cap badge (red dot) appears on My Cards tab when any cap >= 80%
- [ ] Tab order: My Cards, Transactions, Recommend, Log, Miles
- [ ] `npx expo export --platform web` builds successfully

---

### Sprint 33 — Stories

| ID | Story | Priority | Size | Points | Owner |
|----|-------|----------|------|--------|-------|
| **S33.1** | As a user, I want the My Cards tab to show my card list with cap progress bars so I can see card health at a glance without switching tabs | P0 | S | 2 | Developer |
| **S33.2** | As a user, I want a dedicated Transactions tab so I can view my transaction history without navigating through Profile | P0 | S | 2 | Developer |
| **S33.3** | As a user, I want the tab bar to show My Cards first with a cap badge, then Transactions with a receipt icon, so navigation is clear | P0 | XS | 1 | Developer |
| **S33.4** | As a user, I want a "See Transactions" button on the Card Detail screen so I can quickly view transactions for a specific card | P1 | XS | 1 | Developer |
| **S33.5** | As a user, I want the Transaction History removed from Profile so there's no redundant navigation path | P1 | XS | 2 | Developer |
| **Total** | | | | **8** | |

---

### Sprint 33 — User Story Details

#### S33.1: Merge Caps into My Cards Tab

**As a** user viewing my card portfolio,
**I want** to see cap progress bars alongside my cards in one tab,
**So that** I don't need to switch between two tabs showing the same cards.

**Priority**: P0
**T-Shirt Size**: S
**Feature**: F41

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I am on the My Cards tab | The screen loads | I see my cards with cap progress bars (the old Cap Status view) |
| AC2 | I tap on a card | Card is pressed | I navigate to Card Detail (`/card/${id}`), not card-transactions |
| AC3 | I have no cards | The screen loads | I see an empty state encouraging me to add cards |
| AC4 | The screen has a header | I look at the top | I see "My Cards" title with an "Add Card" (+) button |

**Files Modified**: `maximile-app/app/(tabs)/caps.tsx`

---

#### S33.2: Transactions Tab

**As a** user wanting to review my transaction history,
**I want** a dedicated Transactions tab in the main navigation,
**So that** I can access my transactions in one tap instead of navigating through Profile.

**Priority**: P0
**T-Shirt Size**: S
**Feature**: F41

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I tap the Transactions tab | The screen loads | I see my transaction history grouped by month |
| AC2 | I have no transactions | The screen loads | I see an empty state directing me to the Log tab |
| AC3 | I pull down to refresh | Refresh gesture triggered | Transaction list reloads from the database |

**Files Modified**: `maximile-app/app/(tabs)/cards.tsx`

---

#### S33.3: Tab Bar Restructure

**As a** user navigating the app,
**I want** the tab bar to show My Cards (with cap badge) first, then Transactions,
**So that** the navigation reflects the merged card+caps experience.

**Priority**: P0
**T-Shirt Size**: XS
**Feature**: F41

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I view the tab bar | I look at the bottom | I see 5 tabs: My Cards (card icon), Transactions (receipt icon), Recommend (center logo), Log, Miles |
| AC2 | Any card has cap >= 80% | I view the tab bar | My Cards tab shows a red dot badge |
| AC3 | No card has high cap usage | I view the tab bar | No badge on any tab |

**Files Modified**: `maximile-app/app/(tabs)/_layout.tsx`

---

#### S33.4: See Transactions Button on Card Detail

**As a** user viewing a card's details,
**I want** a "See Transactions" button,
**So that** I can quickly view transactions logged against this specific card.

**Priority**: P1
**T-Shirt Size**: XS
**Feature**: F41

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I am on the Card Detail screen | I scroll past Monthly Caps | I see a "See Transactions" tappable row |
| AC2 | I tap "See Transactions" | Button is pressed | I navigate to `/card-transactions/${id}` showing card-specific transactions |

**Files Modified**: `maximile-app/app/card/[id].tsx`

---

#### S33.5: Remove Transaction History from Profile

**As a** user viewing Profile,
**I want** the Transaction History menu item removed,
**So that** there's no confusing duplicate path to transactions (now in main tab).

**Priority**: P1
**T-Shirt Size**: XS
**Feature**: F41

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I open the Profile screen | The Activity section loads | I see "Auto-Capture" but NOT "Transaction History" |

**Files Modified**: `maximile-app/app/(tabs)/profile.tsx`

---

### Sprint 33 — Dependencies Map

```
No external dependencies.
All stories are independent and can be implemented in parallel.

S33.3 (_layout.tsx) should be applied after S33.1 (caps.tsx) and S33.2 (cards.tsx)
for coherent testing, but there are no code-level dependencies.
```

---

### Sprint 33 — Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Users confused by merged tab | Low | Medium | Cap progress bars provide visual context; "Add Card" button maintains discoverability |
| Transaction History removed from Profile disrupts muscle memory | Low | Low | Transactions tab is more prominent; Profile still shows Auto-Capture |

---

### Sprint 33 — Schedule

| Day | Focus | Exit Criteria |
|-----|-------|---------------|
| **Day 1** | S33.1 (caps.tsx) + S33.2 (cards.tsx) + S33.5 (profile.tsx) | Caps screen navigates to card detail, cards screen shows transactions, Profile cleaned up |
| **Day 2** | S33.3 (_layout.tsx) + S33.4 (card/[id].tsx) + build verification | Tab bar restructured, See Transactions button added, build passes |

---

**Sprint 33 Status**: ✅ COMPLETED — Navigation restructure implemented (Cards+Caps merged, Transactions tab promoted, pending push to GitHub)

---

## Sprint 34: "Merchant Search" (F42 — Merchant Search on Recommend Tab)

**Duration**: 2 weeks (10 working days)
**Sprint Goal**: Enable users to search for merchants by name on the Recommend home screen, auto-match to spend categories, and route to the correct card recommendation — eliminating the need to guess which of 8 category tiles maps to their merchant.
**Epic**: E21 — Merchant-Driven Discovery
**PRD Features**: F42 (P1, RICE 3200)
**Phase**: v2.3 — Discovery UX Improvements
**Predecessor**: None (independent)
**Reference**: `docs/planning/MERCHANT_SEARCH_PLAN.md`, `docs/planning/PRD_MERCHANT_SEARCH.md`
**Story Points**: 20

---

### Sprint 34 — Definition of Ready (DoR) Checklist

Before any story enters the sprint, it must satisfy:

- [ ] User story has clear "As a... I want... So that..." statement
- [ ] Acceptance criteria defined in Given/When/Then format
- [ ] Story point estimate agreed by team
- [ ] `lib/merchant-mapper.ts` confirmed to have `matchMerchantLocal()` function
- [ ] `recommend()` RPC confirmed to accept `p_category_id` and `p_subcategory` params
- [ ] Bills subcategory routing confirmed functional (Sprint 28)
- [ ] UI wireframes reviewed (see `docs/planning/MERCHANT_SEARCH_PLAN.md` Section 2)

### Sprint 34 — Definition of Done (DoD) Checklist

A story is "Done" when:

- [ ] Feature works as described in all acceptance criteria
- [ ] Works on both iOS and web (Expo Go + Vercel)
- [ ] No TypeScript errors (`npx tsc --noEmit` passes)
- [ ] Analytics events fire in `__DEV__` console
- [ ] All interactive elements have `accessibilityRole` and `accessibilityLabel`
- [ ] Edge cases handled: empty query, no results, Bills subcategory routing
- [ ] `npx expo export --platform web` build succeeds
- [ ] Code committed to main branch

---

### Sprint 34 — Stories

| ID | Story | Priority | Points | Owner |
|----|-------|----------|--------|-------|
| **S34.1** | Merchant catalogue data (~200 curated SG merchants) | P0 | 5 | Data Engineer |
| **S34.2** | `useMerchantSearch` hook (debounced fuzzy search) | P0 | 3 | Software Engineer |
| **S34.3** | MerchantSearch UI component (search bar + autocomplete dropdown) | P0 | 5 | Developer |
| **S34.4** | Integrate search into Recommend home + routing | P0 | 3 | Developer |
| **S34.5** | Merchant context on recommendation result screen | P1 | 2 | Developer |
| **S34.6** | Analytics events (search_initiated, merchant_selected, search_abandoned) | P1 | 2 | Developer |
| **Total** | | | **20** | |

---

### Sprint 34 — User Story Details

#### S34.1: Merchant Catalogue Data

> **As a** developer, **I want** a curated merchant catalogue with ~200 popular Singapore merchants mapped to categories, **so that** the search has accurate data to match against.

**Priority**: P0 — blocks all other stories
**Story Points**: 5
**Feature**: F42

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | The catalogue is loaded | I query for "grab" | Entries for Grab (transport), GrabFood (dining), GrabMart (groceries) are returned with correct category IDs |
| AC2 | The catalogue is loaded | I query for "mcdonalds" (no apostrophe) | McDonald's is matched via alias |
| AC3 | The catalogue is loaded | I count entries | There are ≥ 150 merchants across all 8 categories |
| AC4 | Every entry has a categoryId | I validate against CATEGORIES constant | All categoryIds are valid |

**Task Breakdown**:

| Task | Owner | Est. |
|------|-------|------|
| T34.01: Create `lib/merchant-catalogue.ts` with `MerchantEntry` interface, `buildStaticCatalogue()`, `getMerchantCatalogue()` | Developer | 3h |
| T34.02: Populate ~200 merchants across 8 categories (Dining 40+, Transport 10+, Online 20+, Groceries 15+, Petrol 5+, Bills 15+, Travel 15+, General 10+) | Data Engineer | 4h |
| T34.03: Validate every `categoryId` against CATEGORIES constant; validate Bills merchants have correct subcategory | Data Engineer | 1h |

---

#### S34.2: useMerchantSearch Hook

> **As a** developer, **I want** a `useMerchantSearch` hook with debounced fuzzy search, **so that** the search component has clean, testable logic decoupled from UI.

**Priority**: P0 — blocks S34.3
**Story Points**: 3
**Feature**: F42

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Query is `""` | Results are read | Empty array returned |
| AC2 | Query is `"grab"` | 120ms have elapsed | All merchants matching "grab" returned, ranked: exact > prefix > contains |
| AC3 | Rapid typing (< 120ms between chars) | Results observed | Only the final stable query produces results |
| AC4 | Component unmounts | Debounce timer pending | Timer cleaned up, no state update after unmount |

**Task Breakdown**:

| Task | Owner | Est. |
|------|-------|------|
| T34.04: Create `hooks/useMerchantSearch.ts` with normalisation + scoring (exact=100, prefix=80, keyword-prefix=70, contains=50, keyword-contains=40) + 120ms debounce | Software Engineer | 2h |
| T34.05: Create `hooks/useMerchantCatalogue.ts` — thin memoised wrapper over `getMerchantCatalogue()` | Software Engineer | 0.5h |

**Dependencies**: S34.1

---

#### S34.3: MerchantSearch UI Component

> **As a** user on the Recommend tab, **I want** a search bar with an autocomplete dropdown, **so that** I can type a merchant name and see matching suggestions.

**Priority**: P0 — blocks S34.4
**Story Points**: 5
**Feature**: F42

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Recommend tab with cards in portfolio | Screen loads | Search bar with placeholder "Search merchant, e.g. Grab, Starbucks…" visible above category tiles |
| AC2 | User types ≥ 2 characters | Results available | Dropdown shows up to 6 merchant rows with name + category badge |
| AC3 | User taps outside dropdown | Touch detected | Dropdown closes and search bar clears |
| AC4 | Query with no matches | ≥ 2 chars typed | "No merchants found" message appears with category browse suggestion |
| AC5 | User has no cards | Recommend screen renders | Search bar NOT shown (consistent with existing empty-state guard) |

**Task Breakdown**:

| Task | Owner | Est. |
|------|-------|------|
| T34.06: Create `components/MerchantSearchBar.tsx` — TextInput with Ionicons search/clear icons, glassmorphism styling | Developer | 2h |
| T34.07: Create `components/MerchantAutocomplete.tsx` — FlatList dropdown with result rows (merchant name, category badge, matched chars highlighted in gold) | Developer | 2h |
| T34.08: Implement close/clear, `keyboardShouldPersistTaps`, dropdown animation (opacity + translateY, 150ms) | Developer | 1h |
| T34.09: Add accessibility labels (`accessibilityRole="search"`, result rows read "[Name], [Category], tap to see recommendations") | Developer | 0.5h |

**Dependencies**: S34.2

---

#### S34.4: Integrate Search into Recommend Home

> **As a** user, **I want** selecting a merchant to navigate me to the card recommendation for that merchant's category, **so that** I don't have to know the category myself.

**Priority**: P0
**Story Points**: 3
**Feature**: F42

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | "Starbucks" selected (dining) | Navigation occurs | App navigates to `/recommend/dining?merchantName=Starbucks` |
| AC2 | "Singtel" selected (bills/telco) | Navigation occurs | App navigates to `/recommend/bills?subcategory=telco&merchantName=Singtel` |
| AC3 | Merchant selected | Navigation occurs | Search bar cleared and dropdown dismissed |

**Task Breakdown**:

| Task | Owner | Est. |
|------|-------|------|
| T34.10: Update Recommend home `index.tsx`: insert MerchantSearch, implement `handleMerchantSelect` with category + subcategory routing | Developer | 1.5h |
| T34.11: Test Bills merchant routing end-to-end (Singtel → bills/telco, SP Services → bills/utilities) | Developer | 0.5h |
| T34.12: Ensure ScrollView wrapping doesn't break existing layout (category tiles, FAB, alerts) | Developer | 0.5h |

**Dependencies**: S34.3

---

#### S34.5: Merchant Context on Result Screen

> **As a** user who searched for a merchant, **I want** the recommendation page to show the merchant name, **so that** I know the recommendation is for the right merchant.

**Priority**: P1
**Story Points**: 2
**Feature**: F42

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | `/recommend/dining?merchantName=Starbucks` | Screen mounts | Header title reads "Starbucks" |
| AC2 | `/recommend/dining` (no merchantName) | Screen mounts | Header title reads "Dining" (no regression) |
| AC3 | merchantName present | Hero section renders | Shows "Best card for Starbucks" with category context below |

**Task Breakdown**:

| Task | Owner | Est. |
|------|-------|------|
| T34.13: Extend `useLocalSearchParams` in `[category].tsx` to include `merchantName` | Developer | 0.5h |
| T34.14: Update header title logic: `merchantName ?? subcategoryInfo?.label ?? categoryInfo?.name` | Developer | 0.5h |
| T34.15: Add "Best card for [merchant]" hero label with category context badge | Developer | 1h |

**Dependencies**: S34.4

---

#### S34.6: Analytics Events

> **As the** product team, **I want** search analytics events, **so that** we can measure adoption, success rate, and abandonment.

**Priority**: P1
**Story Points**: 2
**Feature**: F42

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | User types ≥ 2 chars (debounce settled) | Event fires | `search_initiated` with `{ query_length, results_count }` |
| AC2 | User taps a result | Event fires | `merchant_selected` with `{ merchant_name, category_id, query }` |
| AC3 | User clears/dismisses without selecting | Event fires | `search_abandoned` with `{ query, results_count }` |

**Task Breakdown**:

| Task | Owner | Est. |
|------|-------|------|
| T34.16: Add event types to analytics type union in `lib/analytics.ts` | Developer | 0.5h |
| T34.17: Instrument `search_initiated` in useMerchantSearch hook | Developer | 0.5h |
| T34.18: Instrument `merchant_selected` in MerchantAutocomplete component | Developer | 0.5h |
| T34.19: Instrument `search_abandoned` with focus/blur tracking | Developer | 1h |

**Dependencies**: S34.3, S34.2

---

### Sprint 34 — Dependencies Map

```
S34.1 (Catalogue Data)
  └── S34.2 (Search Hook)
        └── S34.3 (UI Component)
              ├── S34.4 (Home Integration)
              │     └── S34.5 (Result Screen Context)
              └── S34.6 (Analytics)
```

**Critical Path**: S34.1 → S34.2 → S34.3 → S34.4 → S34.5
**Parallel Track**: S34.6 can start after S34.3 (parallel with S34.4)

---

### Sprint 34 — Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Wrong category mappings in seed data (e.g., GrabFood→transport instead of dining) | High | High | Validation script cross-checks every categoryId. Manual review of top-20 merchants |
| ScrollView replacement in index.tsx breaks FAB or banner on Android | Medium | Medium | Test on Android Expo Go immediately after S34.4 |
| Bills 0-mpd merchants (SP Services) cause confusing empty state | Medium | Medium | Show "No miles earned" note inline in dropdown for 0-mpd subcategories |
| TypeScript route param — merchantName arrives as string \| string[] | Low | High | Normalise with Array.isArray() check at top of [category].tsx |
| Scope creep — "recently searched" or logos added mid-sprint | Medium | Medium | Explicitly out-of-scope in kickoff. Create backlog items proactively |

---

### Sprint 34 — Schedule

| Days | Focus | Exit Criteria |
|------|-------|---------------|
| **Days 1-2** | S34.1 (catalogue data) | ≥ 150 merchants, all categoryIds validated |
| **Days 2-4** | S34.2 (search hook) | Debounced search returns ranked results, cleanup on unmount |
| **Day 5** | S34.3 begins (UI component) | Search bar renders, dropdown appears on type |
| **Days 6-7** | S34.3 completes + S34.4 (integration) | Merchant selection navigates to correct recommendation |
| **Day 8** | S34.5 (result screen header) | "Best card for [Merchant]" shown when accessed via search |
| **Day 9** | S34.6 (analytics) | All 3 events fire in __DEV__ console |
| **Day 10** | Buffer — QA, edge cases, build verification | `npx expo export --platform web` succeeds, Vercel deploy |

---

### Sprint 34 — New/Modified Files

**New Files**:
- `lib/merchant-catalogue.ts` — Static MerchantEntry[] + buildStaticCatalogue()
- `hooks/useMerchantCatalogue.ts` — Memoised catalogue loader
- `hooks/useMerchantSearch.ts` — Debounced query → ranked results
- `components/MerchantSearchBar.tsx` — TextInput with clear button
- `components/MerchantAutocomplete.tsx` — FlatList dropdown with merchant logos
- `constants/merchantImages.ts` — Static `require()` map for 162 merchant logo PNGs

**Modified Files**:
- `app/(tabs)/index.tsx` — Add search bar + handle merchant selection
- `app/(tabs)/recommend/[category].tsx` — Accept merchantName param, adapt header
- `lib/analytics.ts` — Add search event types

**Asset Files**:
- `assets/merchants/*.png` — 162 real merchant logos (64×64 PNG), replacing placeholder images. 152 sourced via Google Favicon API (128px downloaded, resized to 64×64 with PIL LANCZOS), 10 sourced manually (Jollibean, Collin's, Stuff'd, LiHO, EZ-Link, BlueSG, Qoo10, Mustafa Centre, Meidi-Ya, Sinopec)

---

**Sprint 34 Status**: ✅ COMPLETED — All 6 stories shipped. Merchant search bar with autocomplete on Recommend tab, category routing, Bills subcategory routing, "Best card for [Merchant]" header, analytics events. 162 real merchant logos (64×64 PNG) replace placeholders in `assets/merchants/` — 152 downloaded via Google Favicon API, 10 sourced manually.

---

## Sprint 35: "Transaction Correction" (F43 — Transaction Entry Correction)

**Duration**: 1.5 weeks (7–8 working days)
**Sprint Goal**: Enable users to edit or delete a wrongly logged transaction from the Transactions tab, with immediate recalculation of cap tracking so that data accuracy is self-healing.
**Epic**: E22 — Transaction Data Integrity
**PRD Features**: F43 (P1, RICE 1012)
**Phase**: v2.4 — Data Quality & Trust
**Predecessor**: Sprint 33 (F41 Navigation Restructure — Transactions tab must exist as a promoted tab)
**Story Points**: 14

---

### Sprint 35 — Definition of Ready (DoR) Checklist

Before any story enters the sprint, it must satisfy:

- [ ] User story has clear "As a... I want... So that..." statement
- [ ] Acceptance criteria defined in Given/When/Then format
- [ ] Story point estimate agreed by team
- [ ] `transactions` table schema and `spending_state` recalculation logic confirmed with Data Engineer
- [ ] Supabase RLS policies confirmed: users can only UPDATE/DELETE their own rows
- [ ] Log tab form components (amount input, category picker, card picker, date picker) confirmed reusable as a bottom sheet
- [ ] UI swipe-gesture library availability confirmed (React Native Gesture Handler already installed via Expo)

### Sprint 35 — Definition of Done (DoD) Checklist

A story is "Done" when:

- [ ] Feature works as described in all acceptance criteria
- [ ] Works on both iOS and web (Expo Go + Vercel)
- [ ] No TypeScript errors (`npx tsc --noEmit` passes)
- [ ] Supabase RLS verified: UPDATE/DELETE blocked for non-owner rows
- [ ] spending_state totals recalculate correctly after edit and delete
- [ ] Analytics events fire in `__DEV__` console
- [ ] Destructive actions (delete) guarded by confirmation dialog
- [ ] `npx expo export --platform web` build succeeds
- [ ] Code committed to main branch

---

### Sprint 35 — Stories

| ID | Story | Priority | Points | Owner |
|----|-------|----------|--------|-------|
| **S35.1** | Swipe-to-reveal Edit and Delete actions on transaction rows | P0 | 3 | Developer |
| **S35.2** | Edit transaction bottom sheet (pre-filled form, all fields editable) | P0 | 5 | Developer |
| **S35.3** | Backend: UPDATE transaction + recalculate spending_state | P0 | 3 | Software Engineer |
| **S35.4** | Delete transaction with confirmation + spending_state adjustment | P0 | 2 | Developer |
| **S35.5** | Analytics events (transaction_edited, transaction_deleted) | P1 | 1 | Developer |
| **Total** | | | **14** | |

---

### Sprint 35 — User Story Details

#### S35.1: Swipe-to-Reveal Actions on Transaction Rows

> **As a** user who made a logging error, **I want** to swipe left on a transaction to reveal Edit and Delete options, **so that** I can fix or remove incorrect entries without leaving the Transactions screen.

**Priority**: P0 — entry point for the entire feature
**Story Points**: 3
**Feature**: F43

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Transactions tab with logged entries | User swipes left on any transaction row | A gold "Edit" button (pencil icon) and a red "Delete" button (trash icon) are revealed on the right side of the row |
| AC2 | Swipe actions are revealed | User swipes right or taps elsewhere | Actions are dismissed and the row returns to its resting position |
| AC3 | Transactions tab is empty | Screen renders | No gesture handler interference; empty state renders normally |
| AC4 | User swipes left on a row | Actions revealed | Row width, icon, amount, and date layout remain undistorted |

**Task Breakdown**:

| Task | Owner | Est. |
|------|-------|------|
| T35.01: Wrap `transactionRow` in `Swipeable` (React Native Gesture Handler) with `renderRightActions` returning gold Edit + red Delete buttons | Developer | 2h |
| T35.02: Style action buttons (gold `#C5A55A` for Edit, `#E53E3E` for Delete, each 72px wide, full row height, centered icon) | Developer | 1h |
| T35.03: Ensure swipe does not conflict with `SectionList` vertical scroll on iOS and Android | Developer | 0.5h |

---

#### S35.2: Edit Transaction Bottom Sheet

> **As a** user who logged the wrong card, category, amount, or date, **I want** to open a pre-filled edit form by tapping the Edit action, **so that** I can correct any field and save the updated entry without re-entering all data.

**Priority**: P0 — core edit flow
**Story Points**: 5
**Feature**: F43

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Edit action tapped | Bottom sheet opens | All four fields pre-populated: amount (existing), category (existing), card (existing), date (existing) |
| AC2 | User changes any field | "Save Changes" tapped | Form shows loading state while Supabase call is in-flight |
| AC3 | Save succeeds | Response received | Bottom sheet closes, transaction list refreshes with updated values |
| AC4 | Save fails (network error) | Response received | Error message shown inline; bottom sheet stays open; user can retry |
| AC5 | User taps outside or pulls down | Bottom sheet dismisses | No changes are saved; original entry unchanged |

**Task Breakdown**:

| Task | Owner | Est. |
|------|-------|------|
| T35.04: Create `components/EditTransactionSheet.tsx` — Modal bottom sheet wrapping amount TextInput, category picker (7 categories), card picker (user's portfolio), date picker | Developer | 3h |
| T35.05: Pre-populate all fields from the selected `TransactionRow` props on mount | Developer | 0.5h |
| T35.06: Wire "Save Changes" button to S35.3 update handler; show ActivityIndicator during in-flight call | Developer | 1h |
| T35.07: Handle error state with inline error message (red text below Save button) | Developer | 0.5h |

**Dependencies**: S35.1, S35.3

---

#### S35.3: Backend — UPDATE Transaction + Recalculate spending_state

> **As a** developer, **I want** a function that atomically updates a transaction and recalculates the affected `spending_state` record, **so that** cap tracking reflects corrections immediately.

**Priority**: P0 — blocks S35.2 and S35.4
**Story Points**: 3
**Feature**: F43

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Transaction row exists | UPDATE called with new amount/card/category/date | Supabase `transactions` row reflects new values |
| AC2 | Card or category changed | UPDATE applied | Old `spending_state` total decremented by old amount; new `spending_state` total incremented by new amount |
| AC3 | Amount changed only | UPDATE applied | Same card + category `spending_state` total adjusted by the delta (new amount − old amount) |
| AC4 | UPDATE attempted by non-owner | RLS policy enforced | 403 returned; no data changed |
| AC5 | Month boundary change (date changed across months) | UPDATE applied | `spending_state` for old month decremented; `spending_state` for new month incremented |

**Task Breakdown**:

| Task | Owner | Est. |
|------|-------|------|
| T35.08: Create `lib/transactions.ts` function `updateTransaction(id, oldTx, newTx)` — calls Supabase UPDATE then calls `recalculateSpendingState()` | Software Engineer | 2h |
| T35.09: Implement `recalculateSpendingState(userId, cardId, categoryId, month)` — re-sums all transactions for that user/card/category/month and upserts to `spending_state` | Software Engineer | 1h |
| T35.10: Verify Supabase RLS policy: `UPDATE ON transactions WHERE user_id = auth.uid()` | Software Engineer | 0.5h |

---

#### S35.4: Delete Transaction with Confirmation + spending_state Adjustment

> **As a** user who logged a transaction that shouldn't exist (duplicate or entirely wrong), **I want** to delete it after confirming, with a brief undo window, **so that** I can clean up my history without worrying about accidental taps.

**Priority**: P0
**Story Points**: 2
**Feature**: F43

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Delete action tapped | Alert shown | Confirmation alert reads "Delete Transaction?" with body "This will adjust your cap tracking for [card name]." and buttons "Cancel" (safe) / "Delete" (destructive, red) |
| AC2 | User taps "Delete" | Supabase DELETE called | Transaction removed from list; `spending_state` total for the transaction's card/category/month decremented by the transaction amount |
| AC3 | Delete succeeds | Operation complete | 5-second undo snackbar appears at bottom of screen: "Transaction deleted. Undo?" |
| AC4 | User taps "Undo" within 5 seconds | Undo triggered | Transaction re-inserted to Supabase; `spending_state` re-incremented; snackbar dismissed |
| AC5 | DELETE attempted by non-owner | RLS policy enforced | 403 returned; no data changed |

**Task Breakdown**:

| Task | Owner | Est. |
|------|-------|------|
| T35.11: Wire Delete swipe action to `Alert.alert()` with destructive confirm | Developer | 0.5h |
| T35.12: Create `lib/transactions.ts` function `deleteTransaction(id, tx)` — Supabase DELETE + `recalculateSpendingState()` | Developer | 0.5h |
| T35.13: Implement 5-second undo snackbar using `Animated` (slide-up, auto-dismiss); on "Undo" tap, call `insertTransaction(tx)` and re-increment spending_state | Developer | 1h |

**Dependencies**: S35.1, S35.3

---

#### S35.5: Analytics Events

> **As the** product team, **I want** analytics events for edit and delete actions, **so that** we can measure how often users correct data and which fields are most commonly changed.

**Priority**: P1
**Story Points**: 1
**Feature**: F43

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | User saves a corrected transaction | Event fires | `transaction_edited` with `{ changed_fields: string[], category_changed: boolean, card_changed: boolean }` |
| AC2 | User confirms deletion | Event fires | `transaction_deleted` with `{ had_undo: boolean }` (true if undo was available; false if they confirmed and undo expired) |

**Task Breakdown**:

| Task | Owner | Est. |
|------|-------|------|
| T35.14: Add `transaction_edited` and `transaction_deleted` event types to analytics type union in `lib/analytics.ts` | Developer | 0.5h |
| T35.15: Instrument events in `EditTransactionSheet.tsx` on save and in delete handler | Developer | 0.5h |

**Dependencies**: S35.2, S35.4

---

### Sprint 35 — Dependencies Map

```
S35.3 (Backend: UPDATE + spending_state recalc)
  └── S35.1 (Swipe-to-reveal actions)
        ├── S35.2 (Edit bottom sheet) ─── depends on S35.3
        │     └── S35.5 (Analytics)
        └── S35.4 (Delete + undo) ──────── depends on S35.3
              └── S35.5 (Analytics)
```

**Critical Path**: S35.3 → S35.1 → S35.2 → [done]
**Parallel Track**: S35.4 can be built in parallel with S35.2 (both depend on S35.1 and S35.3)

---

### Sprint 35 — Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| spending_state recalculation misses edge case: transaction date change crosses month boundary | Medium | High | AC5 in S35.3 explicitly covers this; write a test case that moves a transaction from Jan→Feb and validates both months' spending_state |
| Swipe gesture conflicts with SectionList vertical scroll on Android | Medium | Medium | Use `Swipeable` from `react-native-gesture-handler` (already available via Expo); test on Android Expo Go on Day 1 |
| User deletes a transaction and cannot undo (snackbar dismissed before realising) | Low | Medium | 5-second window is standard iOS/Android pattern; if feedback warrants it, post-sprint consideration to extend to 10 seconds |
| Bottom sheet reuse of Log form: category picker or card picker breaks in sheet context | Low | Medium | Extract pickers into reusable components early (T35.04); test sheet open/close on both platforms before wiring up save |
| RLS not enforced on UPDATE/DELETE | Low | High | T35.10 explicitly verifies this; Supabase dashboard review before ship |

---

### Sprint 35 — Schedule

| Days | Focus | Exit Criteria |
|------|-------|---------------|
| **Day 1** | S35.3 (backend logic + RLS verification) | `updateTransaction()` and `deleteTransaction()` tested with `spending_state` validation |
| **Days 2-3** | S35.1 (swipe gesture on both platforms) | Gold Edit and red Delete buttons revealed on left-swipe; no scroll conflict |
| **Days 4-5** | S35.2 (edit bottom sheet) | Pre-filled form opens, all fields editable, save triggers update and closes sheet |
| **Day 6** | S35.4 (delete with confirmation + undo snackbar) | Confirm alert + delete + undo flow works end-to-end; cap totals correct after each |
| **Day 7** | S35.5 (analytics) + QA + build | Events fire in `__DEV__`; `npx expo export --platform web` succeeds |
| **Day 8 (buffer)** | Edge cases, regression testing | No regressions on transaction log, cap tracker, or recommendation engine |

---

### Sprint 35 — New/Modified Files

**New Files**:
- `components/EditTransactionSheet.tsx` — Pre-filled edit form as a modal bottom sheet

**Modified Files**:
- `app/(tabs)/cards.tsx` (transactions.tsx) — Add `Swipeable` wrapper with Edit/Delete actions; wire to EditTransactionSheet and delete handler
- `lib/transactions.ts` — Add `updateTransaction()`, `deleteTransaction()`, `recalculateSpendingState()` functions
- `lib/analytics.ts` — Add `transaction_edited` and `transaction_deleted` event types

---

**Sprint 35 Status**: 📋 PLANNED — Requires Sprint 33 (Transactions tab) to be complete (already ✅ COMPLETED)

---

## Sprint 36: "First Impression" (F44 — Recommend Tab Coach Mark Tour)

> Introduce new users to the three transaction entry paths (Merchant Search, Category Tiles, FAB) via a one-time 3-step coach mark overlay on the Recommend tab. Renames the Recommend tab FAB from "Smart Pay" to "Quick Pick". Renames the Smart Pay screen to "Flash Pay" (e-wallet trigger with location-based card detection).

**Sprint Goal**: New users completing onboarding see a sequential coach mark tour on their first Recommend tab visit. Tour shows exactly once, is fully skippable, and fires the correct analytics events for each transition.

**Duration**: 1 week | **Story Points**: 10 | **Priority**: P1.5 — Onboarding UX

### Sprint 36 — Stories

| ID | Story | Priority | Size | SP | Assignee |
|----|-------|----------|------|----|----------|
| **S36.1** | Coach mark hook + AsyncStorage gate | M | S | 2 | Developer |
| **S36.2** | CoachMarkOverlay component (spotlight + tooltip bubble) | M | M | 3 | Developer + Designer |
| **S36.3** | Wire coach mark into `index.tsx` (refs, trigger, render) | M | S | 2 | Developer |
| **S36.4** | Label renames: FAB "Smart Pay" → "Quick Pick"; screen "Smart Pay" → "Flash Pay" | M | XS | 1 | Developer |
| **S36.5** | Analytics events + QA (iOS + Android) | M | S | 2 | Developer + Tester |

### Sprint 36 — Story Details

#### S36.1: Coach Mark Hook + AsyncStorage Gate

> **As a** developer, **I want** a `useCoachMark` hook that reads/writes AsyncStorage to determine whether the tour should be shown, **so that** the overlay fires exactly once per device install.

**Files**: `hooks/useCoachMark.ts` (new)

| AC | Given | When | Then |
|----|-------|------|------|
| AC1 | Fresh install, key absent | Recommend tab focuses | `coachMarkVisible = true` after cards load |
| AC2 | Tour previously dismissed | Recommend tab focuses | `coachMarkVisible = false`, no overlay |
| AC3 | User has 0 cards | Recommend tab focuses | `coachMarkVisible = false` (nothing to recommend yet) |
| AC4 | User taps Got it on step 3 | Step 3 displayed | AsyncStorage key `@maximile_recommend_coach_mark_done` written as `'true'` |
| AC5 | User taps Skip at any step | Any step displayed | AsyncStorage key written immediately; overlay dismissed |

**Tasks**:
| ID | Task | Assignee | Est |
|----|------|----------|-----|
| T36.01 | Create `hooks/useCoachMark.ts` with AsyncStorage read/write, in-memory `hasChecked` flag, step state, and `measureStep` using `ref.current.measureInWindow()` | Developer | 3h |
| T36.02 | Add 100ms settle delay and width=0 guard before showing overlay | Developer | 0.5h |
| T36.03 | Unit test: key absent → show; key present → hide; 0 cards → hide | Tester | 1h |

#### S36.2: CoachMarkOverlay Component

> **As a** new user, **I want** a clear visual spotlight highlighting each feature with a concise explanation, **so that** I understand what each entry path does without reading a manual.

**Files**: `components/CoachMarkOverlay.tsx` (new)

**Step content**:
| Step | Target | Title | Description |
|------|--------|-------|-------------|
| 1 | Merchant Search bar | "Know where you're spending?" | "Type a merchant like 'Starbucks' or 'Grab' — we find the right card instantly." |
| 2 | Category tile grid | "Spending by category?" | "Tap Dining, Transport, Shopping and more to see your best card for each type." |
| 3 | FAB button | "At the checkout?" | "Tap [FAB name] — we detect where you are and open your best card automatically." |

**Spotlight technique**: 4 `View` rects (top / left / right / bottom) with `rgba(0,0,0,0.72)` background surrounding the target bounding box. Gold `borderWidth: 2` ring overlay on cutout. Tooltip above spotlight if target is in bottom half of screen (handles FAB edge case).

**Rendering**: Transparent `Modal` with `statusBarTranslucent={true}` and `animationType="none"` (manual Animated.timing fade, matching `BottomSheet.tsx` pattern).

| AC | Given | When | Then |
|----|-------|------|------|
| AC1 | Step 1 active | Overlay renders | Merchant search bar area is spotlit with gold border; tooltip below |
| AC2 | Step 2 active | Overlay renders | Category grid area is spotlit; tooltip below |
| AC3 | Step 3 active | Overlay renders | FAB button spotlit; tooltip **above** (bottom-half of screen) |
| AC4 | Any step | User taps outside tooltip | Nothing (overlay is not dismissible by background tap — prevents accidental dismiss) |
| AC5 | Step 1 or 2 | User taps Next | Overlay advances to next step; scroll + re-measure fires |
| AC6 | Step 3 | User taps Got it | Overlay fades out and is unmounted |

**Tasks**:
| ID | Task | Assignee | Est |
|----|------|----------|-----|
| T36.04 | Design tooltip bubble — step dots, title, body, Next/Got it button, Skip link (follow brand gold + `Colors`, `Typography`, `BorderRadius` from `constants/theme.ts`) | Designer | 2h |
| T36.05 | Implement 4-rect spotlight cutout with gold border ring | Developer | 2h |
| T36.06 | Implement tooltip bubble with above/below positioning logic | Developer | 1.5h |
| T36.07 | Wire `onRequestClose` → dismiss for Android back button | Developer | 0.5h |
| T36.08 | Manual test spotlight positioning on iPhone SE (small) and iPhone 15 Pro Max (large) | Tester | 1h |

#### S36.3: Wire into `index.tsx`

> **As a** developer, **I want** the coach mark trigger wired into the Recommend screen with `useFocusEffect`, **so that** the overlay fires at the correct moment and refs correctly point to the three target elements.

**Files**: `app/(tabs)/index.tsx` (modified)

| AC | Given | When | Then |
|----|-------|------|------|
| AC1 | First focus after onboarding | Cards loaded | Coach mark fires; step 1 spotlight on search bar |
| AC2 | Subsequent tab focuses | Any state | No overlay shown |
| AC3 | User navigates to step 3 | FAB may be off-screen | `scrollViewRef.current.scrollToEnd()` called before measuring |

**Tasks**:
| ID | Task | Assignee | Est |
|----|------|----------|-----|
| T36.09 | Add `scrollViewRef`, `searchBarRef`, `categoryGridRef`, `fabRef` declarations | Developer | 0.5h |
| T36.10 | Wrap `<MerchantSearchBar>` in `<View ref={searchBarRef}>`, add `ref={categoryGridRef}` to categoryGrid View, add `ref={fabRef}` to fabRow View | Developer | 0.5h |
| T36.11 | Call `useCoachMark` and add `useFocusEffect` trigger after `fetchUserCards` resolves | Developer | 1h |
| T36.12 | Render `<CoachMarkOverlay>` conditionally at bottom of return JSX | Developer | 0.5h |

#### S36.4: FAB Label Rename

> **As a** user at the point of payment, **I want** the FAB button label to immediately convey that the app auto-selects the best card for me, **so that** I know to use it without prior explanation.

**Files**: `app/(tabs)/index.tsx`, `app/pay/index.tsx`, `lib/analytics.ts` (string update only)

| AC | Given | When | Then |
|----|-------|------|------|
| AC1 | Any user | Views Recommend tab | FAB shows "Quick Pick" (not "Smart Pay") |
| AC2 | Any user | Views Flash Pay screen header | Header title shows "Flash Pay" |
| AC3 | Analytics | FAB tapped | `smart_pay_opened` event retained (or updated per analytics decision) |

**Tasks**:
| ID | Task | Assignee | Est |
|----|------|----------|-----|
| T36.13 | Replace all "Smart Pay" strings with confirmed new label in `index.tsx` and `pay/index.tsx` | Developer | 0.5h |
| T36.14 | Update coach mark step 3 tooltip copy to reference new label | Developer | 0.25h |

#### S36.5: Analytics + QA

**Tasks**:
| ID | Task | Assignee | Est |
|----|------|----------|-----|
| T36.15 | Add `track('coach_mark_shown', { step })`, `track('coach_mark_advanced', { from_step })`, `track('coach_mark_skipped', { at_step })`, `track('coach_mark_completed')` calls | Developer | 1h |
| T36.16 | E2E test — fresh install → onboard → Recommend tab → coach mark shows step 1→2→3→dismiss → subsequent visit: no overlay | Tester | 1h |
| T36.17 | E2E test — skip path: coach mark shows → skip at step 1 → subsequent visit: no overlay | Tester | 0.5h |
| T36.18 | Test on Android (Expo Go) — spotlight positions correct, tab bar covered by Modal | Tester | 0.5h |

### Sprint 36 — Definition of Ready (DoR)

- [ ] F44 spec approved (this document)
- [ ] FAB label name confirmed (naming decision made before T36.13)
- [ ] Coach mark step copy reviewed and signed off
- [ ] Sprint 34 complete (MerchantSearchBar in DOM — required for ref attachment)

### Sprint 36 — Definition of Done (DoD)

- [ ] Coach mark shows on first Recommend tab visit post-onboarding
- [ ] Coach mark never shows again after dismiss or skip
- [ ] All 3 spotlight positions visually correct on iOS and Android
- [ ] FAB label updated across all surfaces
- [ ] All 4 analytics events fire correctly
- [ ] 0 regressions on Recommend tab (tiles, search, FAB all functional during and after tour)

### Sprint 36 — Dependencies Map

```
S36.1 (hook) ──────────────────────────► S36.3 (wire into index.tsx)
S36.2 (component) ─────────────────────► S36.3
S36.4 (FAB rename) ─────────────────────► S36.3 (tooltip copy references new label)
S36.3 + S36.4 ──────────────────────────► S36.5 (QA)
Sprint 34 (MerchantSearchBar) ──────────► S36.3 (ref attachment to search bar)
```

### Sprint 36 — Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `measureInWindow` returns zeros on first render | Medium | High | 100ms settle delay + width=0 guard → fail silently (no overlay) rather than broken spotlight |
| Spotlight mispositioned on Android due to status bar height difference | Medium | Medium | Use `statusBarTranslucent={true}` on Modal; test on Android emulator before ship |
| Tab bar not covered by overlay | Low | High | Transparent Modal renders above native tab bar; confirmed pattern from BottomSheet.tsx |
| FAB scroll position: off-screen when step 3 activates | Medium | Medium | `scrollToEnd()` before measuring step 3; 300ms animation wait before `measureInWindow` |

### Sprint 36 — Schedule

```
Day 1–2:  S36.1 (hook) + S36.4 (rename)
Day 2–3:  S36.2 (component design + implementation)
Day 3–4:  S36.3 (wire into index.tsx) + S36.5 (analytics)
Day 4–5:  QA (iOS + Android) + bug fixes
```

### Sprint 36 — New/Modified Files

**New Files**:
- `components/CoachMarkOverlay.tsx` — Spotlight overlay with 4-rect dim, gold border ring, tooltip bubble
- `hooks/useCoachMark.ts` — AsyncStorage gate, step state, `measureInWindow` measurement logic

**Modified Files**:
- `app/(tabs)/index.tsx` — Add 4 refs, `useCoachMark` call, `useFocusEffect` trigger, ref attachments to 3 targets, `<CoachMarkOverlay>` render
- `app/pay/index.tsx` — Update screen title / header string from "Smart Pay" to new label
- `lib/analytics.ts` — Add coach mark event types

---

**Sprint 36 Status**: 📋 PLANNED — Requires Sprint 34 (MerchantSearchBar in DOM) to be complete (already ✅ COMPLETED)

---

## Sprint 37: "Polish Pass" (F45 — Heuristic Usability Fixes)

**Epic**: E24 — Usability Polish (Heuristic Evaluation)
**Sprint Goal**: Address 7 usability issues from Nielsen heuristic evaluation + add inline password requirements on signup.
**Duration**: 1 week (10 SP)
**Source**: `maximile-app/testing/HEURISTIC_EVALUATION.md`

### Sprint 37 — Stories

| ID | Story | SP | Priority | Heuristic |
|----|-------|----|----------|-----------|
| S37.1 | **Help & FAQ screen** — Create `app/help.tsx` with "How It Works" 4-step summary + 6-section accordion FAQ (Getting Started, MPD, Caps, Recommendations, Flash Pay, Transactions). Link from Profile under new "Support" section. | 3 | P0 | H10 (F10.1) |
| S37.2 | **Onboarding step indicator** — Create `OnboardingStepIndicator` component (step dots + "Step X of 3" label). Add to `onboarding.tsx` (1/3), `onboarding-auto-capture.tsx` (2/3), `onboarding-miles.tsx` (3/3). Skip indicator when accessed from "Add More Cards". | 1 | P1 | H1 (F1.1) |
| S37.3 | **$0 transaction validation hint** — Show "Please enter a transaction amount" hint text in `log.tsx` when amount is 0 but category and card are selected. Button already disabled via `canSubmit`. | 0.5 | P1 | H5 (F5.1) |
| S37.4 | **Long-press context menu** — Add `onLongPress` to transaction rows in `transactions.tsx` and `(tabs)/cards.tsx`. iOS: `ActionSheetIOS` with Edit/Delete/Cancel. Android/Web: `Alert` with same options. Update hint text to "Long-press or swipe left to edit or delete". | 1.5 | P1 | H6 (F6.1) |
| S37.5 | **Info tooltips on complex UI** — Create `InfoTooltip` component (info-circle icon → modal with title, message, "Got it" button). Add to: mpd rate + cap progress bar in `recommend/[category].tsx`, Miles Saved stat in `earning-insights.tsx`. | 1.5 | P1 | H10 (F10.2) |
| S37.6 | **Flash Pay back navigation** — Add "Change merchant or category" link below Log Transaction in `pay/index.tsx` result state. Resets state to `confirming`, clears recommendation/alternatives. | 0.5 | P1 | H3 (F3.2) |
| S37.7 | **Flash Pay naming unification** — Replace all user-facing "Smart Pay" references with "Flash Pay" in `help.tsx` FAQ content. Internal analytics event names unchanged. | 0.5 | P1 | H2 (F2.2) |
| S37.8 | **Signup password requirements** — Add inline real-time password requirements checklist below password field in `signup.tsx`. Shows checkmark/cross for: min 6 characters, passwords match. Updates live as user types. | 1.5 | P1 | H5 (new) |

**Total**: 10 SP

### Sprint 37 — Dependencies Map

```
S37.5 (InfoTooltip) ─── no deps (new component)
S37.2 (StepIndicator) ── no deps (new component)
S37.1 (Help screen) ──── S37.7 (naming must be unified before FAQ content is finalized)
S37.3 (validation) ───── no deps
S37.4 (long-press) ───── no deps
S37.6 (back nav) ─────── no deps
S37.8 (password) ─────── no deps
```

### Sprint 37 — Schedule

```
Day 1:  S37.2 (step indicator) + S37.3 (validation) + S37.7 (naming)
Day 2:  S37.5 (tooltips) + S37.6 (back nav)
Day 3:  S37.4 (long-press) + S37.8 (password requirements)
Day 4:  S37.1 (Help/FAQ screen)
Day 5:  QA + bug fixes
```

### Sprint 37 — New/Modified Files

**New Files**:
- `components/OnboardingStepIndicator.tsx` — Step progress bar with "Step X of N" label
- `components/InfoTooltip.tsx` — Reusable info icon → modal tooltip
- `app/help.tsx` — Help & FAQ screen with accordion sections

**Modified Files**:
- `app/(tabs)/log.tsx` — Validation hint text
- `app/onboarding.tsx` — Step indicator (1/3)
- `app/onboarding-auto-capture.tsx` — Step indicator (2/3)
- `app/onboarding-miles.tsx` — Step indicator (3/3)
- `app/transactions.tsx` — Long-press handler + hint text update
- `app/(tabs)/cards.tsx` — Long-press handler + hint text update
- `app/(tabs)/profile.tsx` — Help & FAQ menu link
- `app/(tabs)/recommend/[category].tsx` — InfoTooltips on mpd + cap
- `app/earning-insights.tsx` — InfoTooltip on Miles Saved
- `app/pay/index.tsx` — Back nav button + naming fix
- `app/(auth)/signup.tsx` — Inline password requirements checklist

### Sprint 37 — Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| ActionSheetIOS not available on web | Low | Low | Web falls back to Alert-based menu (already handled) |
| InfoTooltip modal conflicts with other modals | Low | Medium | Uses separate Modal instance, tested against EditTransactionSheet |
| Supabase password rules stricter than displayed | Low | Medium | Current Supabase config only requires 6 chars; update requirements if config changes |

---

**Sprint 37 Status**: 🚧 IN PROGRESS — S37.1–S37.7 implemented, S37.8 pending

---

## Sprint 38: "Product Analytics" (F46 — Admin Analytics Dashboard)

| Field | Value |
|-------|-------|
| **Sprint Goal** | Add an Analytics tab to the admin dashboard providing MARU trends, user activity metrics, conversion funnels, and feature adoption tracking — all powered by Supabase analytics_events data |
| **Duration** | 1.5 weeks (8 working days) |
| **Story Points** | 16 SP |
| **Feature** | F46: Admin Analytics Dashboard |
| **Epic** | E25: Product Analytics & Insights |
| **Depends On** | Supabase analytics_events table (migration 004 — already deployed), existing admin-dashboard shell |

### Sprint 38 — Definition of Ready (DoR) Checklist

- [x] PRD F46 section complete (v2.15)
- [x] Analytics events already flowing to Supabase (51+ event types, dual-write active)
- [x] Supabase analytics_events table deployed (migration 004)
- [x] maru_monthly SQL view exists (migration 004)
- [x] Admin dashboard shell exists with tab navigation pattern (App.tsx)
- [x] Supabase service_role client configured in admin-dashboard
- [ ] Recharts library evaluated and approved for admin-dashboard

### Sprint 38 — Definition of Done (DoD) Checklist

- [ ] All 5 SQL views created and returning correct data
- [ ] Analytics tab visible in admin dashboard navigation
- [ ] Date range picker filters all dashboard data (7d / 30d / 90d)
- [ ] MARU north star card displays current month value + trend sparkline
- [ ] All 6 KPI cards (MARU, DAU, MAU, transactions, churn, cap breaches) render correctly
- [ ] 3 funnels (onboarding, Smart Pay, notification) display with accurate conversion rates
- [ ] Drop-off highlighting works (>30% = amber, >50% = red)
- [ ] Feature adoption bar chart shows rates for 5 major features
- [ ] Event heatmap renders daily event density
- [ ] Active users chart (DAU/WAU/MAU) toggleable and responsive
- [ ] Gold/charcoal theme consistent with existing admin dashboard
- [ ] No regressions in existing admin dashboard tabs

### Sprint 38 — Stories

| Story ID | Story | Size | Points |
|----------|-------|------|--------|
| S38.1 | SQL Analytics Views | M | 3 |
| S38.2 | Analytics Tab Shell + Navigation | S | 2 |
| S38.3 | North Star & KPI Cards | M | 3 |
| S38.4 | Funnel Visualizations | M | 3 |
| S38.5 | Feature Adoption & Event Heatmap | M | 3 |
| S38.6 | Active Users Chart + Recharts Integration | S | 2 |

### Sprint 38 — User Story Details

---

#### S38.1: SQL Analytics Views (3 SP)

**As a** product team member,
**I want** pre-computed SQL views over the analytics_events table,
**So that** the admin dashboard can query aggregated metrics efficiently without complex client-side logic.

**Acceptance Criteria:**
1. `v_active_users` view returns daily unique user count from analytics_events
2. `v_event_daily` view returns daily event counts grouped by event type
3. `v_onboarding_funnel` view returns distinct user counts for each step: sign_up → card_added → onboarding_completed → transaction_logged
4. `v_smart_pay_funnel` view returns distinct user counts for: pay_flow_started → merchant_detected → recommendation_used → pay_transaction_logged
5. `v_notification_funnel` view returns distinct user counts for: notification_primer_shown → notification_primer_accepted → notification_permission_granted
6. All views execute in <500ms on 100K+ events
7. Migration file: `database/migrations/005_analytics_views.sql`

**Tasks:**
- [ ] Create migration file `005_analytics_views.sql`
- [ ] Implement `v_active_users` view with daily grouping
- [ ] Implement `v_event_daily` view with event + date grouping
- [ ] Implement `v_onboarding_funnel` view with 4-step UNION
- [ ] Implement `v_smart_pay_funnel` view with 4-step UNION
- [ ] Implement `v_notification_funnel` view with 3-step UNION
- [ ] Add performance indexes if needed
- [ ] Test all views return expected data shapes

---

#### S38.2: Analytics Tab Shell + Navigation (2 SP)

**As a** product team member,
**I want** an Analytics tab in the admin dashboard,
**So that** I can access product metrics from the same interface I use for community and pipeline management.

**Acceptance Criteria:**
1. 4th "Analytics" tab appears in admin dashboard tab navigation with chart icon
2. Tab follows existing navigation pattern (gold underline for active, icon + label)
3. Analytics.tsx component renders with date range picker (7d / 30d / 90d / custom)
4. Date range selection filters data passed to child components
5. Loading and empty states handled gracefully
6. Supabase service_role client fetches from analytics views

**Tasks:**
- [ ] Add 'analytics' to Tab type union in App.tsx
- [ ] Add Analytics tab config to TAB_CONFIG array
- [ ] Create `Analytics.tsx` main component
- [ ] Implement `DateRangePicker.tsx` component (7d / 30d / 90d presets + custom)
- [ ] Wire up Supabase service_role queries to new views
- [ ] Add loading skeleton and empty state

---

#### S38.3: North Star & KPI Cards (3 SP)

**As a** product team member,
**I want** to see MARU and key product metrics at a glance,
**So that** I can quickly assess product health without querying databases.

**Acceptance Criteria:**
1. `NorthStarCard.tsx` shows current month MARU count as large number with sparkline trend
2. `MetricCard.tsx` is a reusable KPI card showing: metric name, current value, trend arrow (↑/↓/→), percentage change vs previous period
3. Dashboard displays 6 KPI cards: MARU, DAU, MAU, transaction count, churn count, cap breach count
4. Trend comparison period matches selected date range
5. Cards are responsive (2×3 grid on desktop, stacked on mobile)
6. Gold accent for positive trends, red for negative

**Tasks:**
- [ ] Create `NorthStarCard.tsx` with sparkline (Recharts)
- [ ] Create `MetricCard.tsx` reusable component
- [ ] Query `maru_monthly` view for MARU data
- [ ] Query `v_active_users` for DAU/MAU
- [ ] Query `v_event_daily` for transaction, churn, cap breach counts
- [ ] Calculate trend vs previous period
- [ ] Responsive grid layout

---

#### S38.4: Funnel Visualizations (3 SP)

**As a** product team member,
**I want** to see conversion funnels for key user journeys,
**So that** I can identify where users drop off and prioritize improvements.

**Acceptance Criteria:**
1. `FunnelChart.tsx` is a reusable horizontal funnel bar component
2. Each step shows: step label, user count, conversion rate (% of step 1)
3. Color-coded drop-off: >30% drop between steps = amber highlight, >50% = red highlight
4. 3 funnels rendered: Onboarding (4 steps), Smart Pay (4 steps), Notification opt-in (3 steps)
5. Hover/click on a step shows tooltip with exact counts
6. Funnel data sourced from `v_onboarding_funnel`, `v_smart_pay_funnel`, `v_notification_funnel`

**Tasks:**
- [ ] Create `FunnelChart.tsx` reusable component
- [ ] Implement step-to-step drop-off calculation
- [ ] Add color-coded highlighting logic (amber >30%, red >50%)
- [ ] Render Onboarding funnel from `v_onboarding_funnel`
- [ ] Render Smart Pay funnel from `v_smart_pay_funnel`
- [ ] Render Notification funnel from `v_notification_funnel`
- [ ] Add tooltips with exact counts

---

#### S38.5: Feature Adoption & Event Heatmap (3 SP)

**As a** product team member,
**I want** to see which features users adopt and daily activity patterns,
**So that** I can understand feature engagement and identify usage trends.

**Acceptance Criteria:**
1. Horizontal bar chart shows adoption rate (% of total users) for 5 features: Smart Pay, Auto-Capture, Goals, Notifications, Miles Redemption
2. Adoption = distinct users who triggered feature's key event / total distinct users
3. `EventHeatmap.tsx` shows calendar-style grid (GitHub contribution graph style) with daily event volume
4. Heatmap color intensity scales with event count (light gold → dark gold → charcoal)
5. Hover on a day shows date + event count
6. Both charts responsive

**Tasks:**
- [ ] Create feature adoption bar chart component
- [ ] Calculate adoption rates from `v_event_daily` (map events to features)
- [ ] Create `EventHeatmap.tsx` calendar grid component
- [ ] Query `v_event_daily` for daily totals
- [ ] Implement color scale (gold gradient)
- [ ] Add hover tooltips

---

#### S38.6: Active Users Chart + Recharts Integration (2 SP)

**As a** product team member,
**I want** to see DAU/WAU/MAU trends over time,
**So that** I can track user engagement growth and identify anomalies.

**Acceptance Criteria:**
1. `recharts` installed in admin-dashboard package.json
2. `ActiveUsersChart.tsx` renders a line chart with 3 toggleable series: DAU, WAU, MAU
3. WAU = 7-day rolling unique users, MAU = 30-day rolling unique users
4. Chart is responsive and matches gold/charcoal admin dashboard theme
5. X-axis shows dates, Y-axis shows user count
6. Toggle buttons to show/hide each series

**Tasks:**
- [ ] Install `recharts` in admin-dashboard
- [ ] Create `ActiveUsersChart.tsx` component
- [ ] Query `v_active_users` for DAU data
- [ ] Calculate WAU (7-day rolling) and MAU (30-day rolling) from DAU data
- [ ] Implement series toggle (DAU/WAU/MAU)
- [ ] Style chart with admin dashboard theme colors
- [ ] Responsive container

### Sprint 38 — Dependencies Map

```
S38.1 (SQL Views) ──────────┐
                              ├──► S38.3 (KPI Cards)
S38.2 (Tab Shell) ──────────┤
                              ├──► S38.4 (Funnels)
S38.6 (Recharts install) ───┤
                              ├──► S38.5 (Adoption + Heatmap)
                              │
                              └──► S38.6 (Active Users Chart)

External dependencies:
- analytics_events table (migration 004) ✅ Already deployed
- maru_monthly view (migration 004) ✅ Already deployed
- Admin dashboard shell (App.tsx) ✅ Already exists
```

### Sprint 38 — Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Analytics events table has low volume (pre-launch) | High | Medium | Seed with demo data; views work correctly regardless of volume |
| Recharts bundle size bloats admin dashboard | Low | Low | Recharts is ~40KB gzipped; admin dashboard is internal tool, performance less critical |
| SQL views slow on large datasets | Low | Medium | Views use indexed columns (event, created_at); add composite indexes in migration if needed |
| Funnel conversion rates misleading without cohort filtering | Medium | Medium | V1 shows all-time funnels; add date-range filtering (already in S38.2) |
| Admin dashboard not behind auth | Medium | High | Already uses Supabase service_role; document that Cloudflare Access or similar should protect the deployment |

### Sprint 38 — Schedule

| Day | Focus | Stories |
|-----|-------|---------|
| D1 | SQL views + Recharts setup | S38.1 + S38.6 (install only) |
| D2 | SQL views testing + Tab shell | S38.1 (complete) + S38.2 |
| D3 | North Star + KPI cards | S38.3 |
| D4 | KPI cards complete + Funnel start | S38.3 (complete) + S38.4 |
| D5 | Funnel visualizations | S38.4 (complete) |
| D6 | Feature adoption + Heatmap | S38.5 |
| D7 | Active users chart + polish | S38.6 + S38.5 (complete) |
| D8 | Integration testing + theme polish | All stories — verification |

### Sprint 38 — New/Modified Files

| File | Action | Story |
|------|--------|-------|
| `database/migrations/005_analytics_views.sql` | **New** | S38.1 |
| `admin-dashboard/package.json` | **Modified** (add recharts) | S38.6 |
| `admin-dashboard/src/App.tsx` | **Modified** (add Analytics tab) | S38.2 |
| `admin-dashboard/src/components/Analytics.tsx` | **New** | S38.2 |
| `admin-dashboard/src/components/analytics/DateRangePicker.tsx` | **New** | S38.2 |
| `admin-dashboard/src/components/analytics/NorthStarCard.tsx` | **New** | S38.3 |
| `admin-dashboard/src/components/analytics/MetricCard.tsx` | **New** | S38.3 |
| `admin-dashboard/src/components/analytics/FunnelChart.tsx` | **New** | S38.4 |
| `admin-dashboard/src/components/analytics/EventHeatmap.tsx` | **New** | S38.5 |
| `admin-dashboard/src/components/analytics/ActiveUsersChart.tsx` | **New** | S38.6 |

---
