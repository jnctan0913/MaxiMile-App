# Sprint Plan: MaxiMile — Credit Card Miles Optimizer

**Version**: 5.0
**Created**: 2026-02-19
**Author**: Scrum Master Agent
**Source**: PRD v1.5, EPICS_AND_USER_STORIES v1.4
**Status**: Draft — Awaiting Stakeholder Review
**Change Log**: v5.0 — Added Sprint 11 ("Every Card": F22 Card Coverage Expansion 20→29) and Sprint 12 ("Every Change": F23 Rate Change Monitoring & Alerts). Adds 10 new credit cards with eligibility metadata, reclassifies POSB Everyday, and builds rate change alert system. v4.0 — Added Sprint 9 ("Miles Ecosystem Foundation": F21+F19) and Sprint 10 ("Miles Ecosystem Presentation": F18+F20) with full story breakdowns, task estimates, dependency maps, DoR/DoD, and risks. Expands miles programs from 7 to ~20, adds transfer partner mapping, two-layer UI architecture, and smart transfer nudges. v3.0 — Added Sprint 7 ("Miles Portfolio MVP": F13+F14) and Sprint 8 ("Engagement Loop": F15+F16) with full story breakdowns, task estimates, dependency maps, DoR/DoD, and risks. v2.0 — Compressed from 8-week (5-sprint) plan to 2-week (4-phase) plan. Pre-decisions made to eliminate blockers. v2.1 — Restored full 20-card coverage (batched: 10 cards D1–3, 10 cards D4–6).

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
| **Card Coverage** | Top 20 miles cards (batched) | Batch 1 (D1–3): DBS Altitude, Citi PremierMiles, UOB PRVI Miles, OCBC 90°N, KrisFlyer UOB, HSBC Revolution, Amex KrisFlyer Ascend, BOC Elite Miles, SC Visa Infinite, DBS Woman's World. Batch 2 (D4–7): UOB Lady's Card, OCBC Titanium Rewards, HSBC TravelOne, Amex KrisFlyer CC, SC X Card, Maybank Horizon Visa, Maybank FC Barcelona, Citi Rewards, POSB Everyday, UOB Preferred Platinum |
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
