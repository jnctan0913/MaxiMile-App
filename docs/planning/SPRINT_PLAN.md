# Sprint Plan: MaxiMile — Credit Card Miles Optimizer

**Version**: 13.0
**Created**: 2026-02-19
**Author**: Scrum Master Agent
**Source**: PRD v2.3, EPICS_AND_USER_STORIES v1.7, MAXIMILE_VS_MILELION_ANALYSIS v1.0, CARD_DATA_VERIFICATION v1.0
**Status**: In Progress — Sprint 20 Active, Sprints 21-22 Planned (Recommendation Accuracy), Sprints 23-24 Planned (Card Expansion 22→29)
**Change Log**: v13.0 — Added Sprint 23 "More Cards" (F33 Part 1 — 6 straightforward cards) and Sprint 24 "Smart Categories" (F33 Part 2 — UOB Lady's Solitaire category selection UX). Card Expansion 20→22 (Maybank World MC + UOB Visa Signature) marked COMPLETE. SC Smart Card DEFERRED (P3, cashback card). Slug mismatch `maybank-world-mc` fixed. v12.0 — Added Sprint 21 "Data Fix" (F30 Petrol/Bills Resolution + F32 Condition Transparency) and Sprint 22 "Smart Scoring" (F31 Min Spend Condition Enforcement). Based on MileLion competitive analysis identifying recommendation accuracy gaps. See `docs/technical/MAXIMILE_VS_MILELION_ANALYSIS.md`. v11.0 — REVISED Push Notifications Plan (Sprints 19-20): Sprint 19 Foundation COMPLETE ✅. Consolidated original Sprints 20-22 into single NEW Sprint 20 "Complete System + Demo Mode" (13 SP, 2 weeks). Removed gradual user rollout (beta → expand → full launch). New focus: Build complete production-ready system (all severities, batching, granular controls) + beautiful demo mode for stakeholder presentations. Total: 2 sprints (19-20), 19 SP, 4 weeks instead of original 8 weeks. No user launch—demo readiness only. v10.0 — Added Sprints 19-22 ("Proactive Alerts": Push Notifications Implementation) with 4-phase rollout (Foundation → Beta → Expand → Full Launch). 22 story points total across 4+ sprints for rate change push alerts with granular user controls, smart batching, and F6 cap alert integration. Addresses critical visibility gap in current in-app-only notification system. See `docs/PUSH_NOTIFICATIONS_EVALUATION.md` for full analysis. v9.0 — Added Sprint 18 ("Demo Mode": F28 — Environment-Controlled Mock Data) enabling product demonstrations without real Apple Pay transactions. Lightweight 14-point sprint with 5 stories covering environment configuration, mock transaction generator, deep link integration, EAS demo build profile, and comprehensive documentation. Fully implemented and shipped with `eas build --profile demo` support. v8.0 — Added 3 new stories to Sprint 16 from DRD v1.1 design decisions: S16.7 (Onboarding Step 1.5 — auto-capture setup integrated into onboarding flow, platform-adaptive, skippable), S16.8 (Recommendation Match Indicator — green "best card" banner or blue "tip" nudge on confirmation screen), S16.9 (Smart Pay → Auto-Capture Handoff — 60-second listener that skips manual entry when auto-capture fires after Wallet return). Sprint 16 total points updated from 36 to 50. Added iOS Shortcut platform constraint note to S16.4. v7.0 — Added Sprint 16 ("Smart Logging: iOS": F26 Apple Pay Shortcuts Auto-Capture) and Sprint 17 ("Smart Logging: Android": F27 Android Notification Auto-Capture). Addresses the #1 product risk (manual logging fatigue) with platform-native auto-capture. See `docs/NOTIFICATION_CAPTURE_FEASIBILITY.md` for full technical analysis. v6.0 — Added Sprint 13 ("Crowdsourced Accuracy": F24 Community Rate Change Submissions), Sprint 14 ("Detection Foundation": F25 Part 1 — scraper + hashing), and Sprint 15 ("Always Up to Date": F25 Part 2 — AI classification + pipeline health). Closes the Layer 1 detection gap with $0/month infrastructure. v5.0 — Added Sprint 11 ("Every Card": F22 Card Coverage Expansion 20→29) and Sprint 12 ("Every Change": F23 Rate Change Monitoring & Alerts). v4.0 — Added Sprint 9–10 (Miles Ecosystem). v3.0 — Added Sprint 7–8 (Miles Portfolio). v2.0 — Compressed to 2-week plan. v2.1 — Restored full 20-card coverage.

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
- Basic navigation (Recommend, My Cards, Cap Status, Log)

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

## Sprint 14: "Detection Foundation" (F25 Part 1 — Scraper + Hashing)

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
| R14.5 | Compiling 50 bank T&C URLs takes longer than estimated | **Medium** | **Low** | Start with top 20 most important sources (covering the 29 cards in our DB); expand to 50 in Sprint 15 |

---

## Sprint 15: "Always Up to Date" (F25 Part 2 — AI Classification + Pipeline Health)

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
Day 2–4:  Submission form UI         Day 2–4:  Seed 50 URLs +                      API clients
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
| **S22.3** | Add user monthly spending estimate in Settings | P1 | M | 3 | Developer |
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

> **As a** user,
> **I want** to set my estimated monthly spending level in Settings,
> **So that** the app knows whether I'm likely to meet card-specific minimum spend thresholds even before I've logged enough transactions this month.

**Priority**: P1 (Should Have — improves first-month accuracy)
**T-Shirt Size**: **M** (Medium) — ~2 days
**Feature**: F31

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

**Sprint 21-22 Status**: Sprint 21 📋 PLANNED | Sprint 22 📋 PLANNED | Card Expansion (20→22) ✅ COMPLETED

**Next Steps**:
1. Complete Sprint 20 (Push Notifications)
2. Begin Sprint 21 — start with S21.1 (bills earn rules) and S21.2 (gas_station fix) on Day 1
3. Sprint 22 begins after Sprint 21 ships
4. Sprint 23-24 (F33 Card Expansion 22→29) begins after Sprint 22 ships

---

## Sprint 23: "More Cards" (F33 Part 1 — 6 Straightforward Cards: 22→28)

**Duration**: 1 week (5 working days)
**Sprint Goal**: Add 6 straightforward miles cards to the database (DBS Vantage, OCBC Voyage, SC Journey, SC Beyond, HSBC Premier MC, Maybank XL Rewards) — all follow existing data patterns with no new UX required.
**Epic**: E15 — Card Database Expansion (F33)
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
**Epic**: E15 — Card Database Expansion (F33)
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

**Sprint 23-24 Status**: Sprint 23 📋 PLANNED | Sprint 24 📋 PLANNED

---

## Sprint 16: T&C Focus Refactor (Detection Pipeline v2.0.1)

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

**Sprint 16 Status**: ✅ COMPLETED

---

**Next Steps**:
1. Complete Sprints 21-22 (Recommendation Accuracy)
2. Begin Sprint 23 — 6 straightforward cards (Day 1: flat-rate cards first)
3. Sprint 24 begins after Sprint 23 ships — UOB Lady's Solitaire with category selection UX
