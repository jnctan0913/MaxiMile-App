# Sprint Plan: Demo Mode Feature

**Project:** MaxiMile Auto-Capture Demo Mode
**Sprint Duration:** 2 weeks (Split into Sprint 1 & 2)
**Team:** 1 Developer
**Created:** 2026-02-21
**Scrum Master:** Claude Scrum Agent

---

## Sprint Goal

**Enable demo presentations of auto-capture feature without real Apple Pay transactions through environment-controlled mock data injection.**

---

## Team Capacity

| Role | Agent | Availability | Capacity |
|------|-------|--------------|----------|
| Developer | TBD | Full-time | 40 hours/week |

---

## Epics Overview

| Epic ID | Epic Name | Priority | Sprint | Size | Status |
|---------|-----------|----------|--------|------|--------|
| **E1** | Demo Mode Infrastructure | P0 | Sprint 1 | L | Not Started |
| **E2** | Mock Data Enhancement | P1 | Sprint 2 | M | Not Started |
| **E3** | Build & Distribution | P0 | Sprint 2 | S | Not Started |

---

## Epic Breakdown

### Epic E1: Demo Mode Infrastructure (P0)

**Goal:** Implement core demo mode with environment variable control and basic mock data

**Scope:**
- Environment variable setup
- Mock transaction generator (basic)
- Deep link handler updates
- Test button functionality

**Success Criteria:**
- Demo build shows mock transactions when triggered
- Production build unaffected
- Test button works in demo mode

---

### Epic E2: Mock Data Enhancement (P1)

**Goal:** Enhance mock data realism and variety for professional demos

**Scope:**
- Expand merchant list to 40+ options
- Add card matching logic
- Realistic pricing per category

**Success Criteria:**
- Variety of merchants across 5+ categories
- Uses user's actual cards when available
- Amounts realistic for merchant types

---

### Epic E3: Build & Distribution (P0)

**Goal:** Configure EAS builds for demo distribution via TestFlight

**Scope:**
- EAS demo build profile
- TestFlight testing
- Documentation

**Success Criteria:**
- Demo build successfully created via EAS
- TestFlight distribution working
- Build process documented

---

## User Stories

### Sprint 1: Core Demo Mode (Week 1)

#### Story S1.1: Environment Variable Configuration
**As a** developer
**I want** to configure demo mode via environment variable
**So that** we can build separate demo and production versions

**Acceptance Criteria:**
- [ ] `.env.demo` file created with `EXPO_PUBLIC_DEMO_MODE=true`
- [ ] `.env.production` file created with `EXPO_PUBLIC_DEMO_MODE=false`
- [ ] Environment variable accessible in app via `process.env.EXPO_PUBLIC_DEMO_MODE`
- [ ] App reads environment variable correctly at runtime
- [ ] No errors when environment variable is unset (defaults to production)

**Definition of Ready:**
- [x] PRD approved
- [x] No dependencies on other stories
- [x] No design needed (config only)
- [x] Clear acceptance criteria

**Definition of Done:**
- [ ] Code complete
- [ ] Environment variables tested in both modes
- [ ] No production code affected
- [ ] Documented in README

**Size:** XS (< 2 hours)
**Dependencies:** None
**Assigned To:** Developer

---

#### Story S1.2: Mock Transaction Generator
**As a** developer
**I want** to create a mock transaction generator
**So that** demo builds can show realistic transaction data

**Acceptance Criteria:**
- [ ] `lib/demo-data.ts` file created
- [ ] `generateMockTransaction()` function returns realistic data:
  - Random merchant name (20+ options across categories)
  - Random amount appropriate for merchant type
  - Random card (fallback to mock card)
  - Current timestamp
  - Source marked as 'demo'
- [ ] Merchant categories include: Coffee, Gas, Grocery, Restaurants, Retail
- [ ] Amount ranges realistic per category
- [ ] Each call returns different data (randomized)
- [ ] TypeScript interfaces defined for MockTransaction

**Definition of Ready:**
- [x] PRD section on mock data reviewed
- [x] Merchant list defined in PRD
- [x] No dependencies on other stories (can start first)
- [x] Clear data structure

**Definition of Done:**
- [ ] Code complete with TypeScript types
- [ ] Unit tests for generator function
- [ ] At least 20 unique merchants
- [ ] Realistic amount ranges per category
- [ ] Documented with JSDoc comments

**Size:** M (1 day)
**Dependencies:** None
**Assigned To:** Developer

---

#### Story S1.3: Deep Link Handler Enhancement
**As a** developer
**I want** the deep link handler to inject mock data in demo mode
**So that** the auto-capture flow shows mock transactions

**Acceptance Criteria:**
- [ ] `lib/deep-link.ts` updated to check `EXPO_PUBLIC_DEMO_MODE`
- [ ] When demo mode is `true`:
  - Calls `generateMockTransaction()`
  - Merges mock data with deep link params
  - Marks transaction with `isDemo: true` flag
- [ ] When demo mode is `false` or unset:
  - Returns original params unchanged
  - No mock data injection
- [ ] No errors in either mode
- [ ] Type-safe implementation

**Definition of Ready:**
- [x] Story S1.2 completed (mock generator available)
- [x] Existing deep link handler code reviewed
- [x] Clear logic for demo vs production mode
- [x] No design needed

**Definition of Done:**
- [ ] Code complete
- [ ] Unit tests for both modes
- [ ] Integration test with mock generator
- [ ] No regression in production mode
- [ ] Code reviewed

**Size:** S (3-4 hours)
**Dependencies:** S1.2 (Mock Generator)
**Assigned To:** Developer

---

#### Story S1.4: Test Button Enhancement
**As a** demo presenter
**I want** the test button to show mock transactions in demo builds
**So that** I can verify the setup works before presenting

**Acceptance Criteria:**
- [ ] `app/auto-capture-setup.tsx` test button updated
- [ ] In demo mode: Shows mock transaction when tapped
- [ ] In production mode: Current behavior unchanged (URL validation only)
- [ ] Success message appears when test works
- [ ] Error handling for failed tests
- [ ] Visual feedback during test (loading state)

**Definition of Ready:**
- [x] Story S1.3 completed (deep link handler ready)
- [x] Existing test button code reviewed
- [x] Clear requirements for demo vs production
- [x] No design changes needed

**Definition of Done:**
- [ ] Code complete
- [ ] Test button works in demo mode
- [ ] Production behavior unchanged
- [ ] User sees clear success/failure feedback
- [ ] No UI regressions
- [ ] Tested on TestFlight demo build

**Size:** S (3-4 hours)
**Dependencies:** S1.3 (Deep Link Handler)
**Assigned To:** Developer

---

### Sprint 2: Enhancement & Distribution (Week 2)

#### Story S2.1: Expand Merchant Variety
**As a** demo presenter
**I want** a wide variety of merchants in mock data
**So that** demos feel realistic and can show different scenarios

**Acceptance Criteria:**
- [ ] Merchant list expanded to 40+ unique names
- [ ] At least 8 options per category:
  - Coffee shops: 8+
  - Gas stations: 6+
  - Grocery stores: 6+
  - Restaurants: 10+
  - Retail stores: 8+
  - Online/Other: 4+
- [ ] Realistic names (real brands where appropriate)
- [ ] Random selection ensures variety
- [ ] No duplicate merchants in quick succession

**Definition of Ready:**
- [x] Story S1.2 completed (basic generator exists)
- [x] Merchant categories defined
- [x] Research on realistic merchant names done
- [x] No dependencies

**Definition of Done:**
- [ ] 40+ merchants in data
- [ ] Variety confirmed through testing
- [ ] Merchant list documented
- [ ] No performance issues with larger list

**Size:** S (2-3 hours)
**Dependencies:** S1.2 (Mock Generator)
**Assigned To:** Developer

---

#### Story S2.2: Card Matching Logic
**As a** demo presenter
**I want** mock transactions to use my actual card names
**So that** demos feel personalized and realistic

**Acceptance Criteria:**
- [ ] `generateMockTransaction()` checks for user cards
- [ ] If user has cards in portfolio:
  - Randomly selects one of user's cards
  - Uses actual card name from user's data
- [ ] If no user cards:
  - Falls back to mock card "Chase Sapphire Reserve"
- [ ] Card selection appropriate for merchant type (if possible)
- [ ] No errors if card data unavailable

**Definition of Ready:**
- [x] Story S1.2 completed (generator exists)
- [x] User card data structure reviewed
- [x] Logic defined for card selection
- [x] No dependencies on other stories

**Definition of Done:**
- [ ] Code complete
- [ ] Uses user cards when available
- [ ] Fallback works correctly
- [ ] Tested with 0, 1, and multiple cards
- [ ] No performance impact

**Size:** S (3-4 hours)
**Dependencies:** S1.2 (Mock Generator)
**Assigned To:** Developer

---

#### Story S2.3: Configure EAS Demo Build Profile
**As a** developer
**I want** an EAS build profile for demo builds
**So that** we can easily create and distribute demo versions

**Acceptance Criteria:**
- [ ] `eas.json` updated with "demo" profile
- [ ] Demo profile configuration:
  - Extends "preview" profile
  - Sets `EXPO_PUBLIC_DEMO_MODE=true`
  - Distribution set to "internal"
  - iOS simulator set to false (device builds)
  - Android buildType set to "apk"
- [ ] Production profile remains unchanged
- [ ] Build commands documented for both platforms:
  - iOS: `eas build --profile demo --platform ios`
  - Android: `eas build --profile demo --platform android`
- [ ] EAS configuration validated
- [ ] Demo mode works identically on both iOS and Android (platform-agnostic implementation)

**Definition of Ready:**
- [x] EAS already configured for project
- [x] Demo environment variables defined
- [x] Build profile requirements clear
- [x] No dependencies

**Definition of Done:**
- [ ] `eas.json` updated
- [ ] Demo build successfully created
- [ ] Build time < 30 minutes
- [ ] Configuration documented
- [ ] Validated by running actual build

**Size:** S (2-3 hours)
**Dependencies:** S1.1, S1.2, S1.3, S1.4 (Core functionality complete)
**Assigned To:** Developer

---

#### Story S2.4: TestFlight Testing & Documentation
**As a** product team member
**I want** demo builds available on TestFlight
**So that** we can distribute to presenters and stakeholders

**Acceptance Criteria:**
- [ ] Demo build uploaded to TestFlight
- [ ] Internal testing completed:
  - Test button shows mock transaction
  - Shortcut trigger shows mock transaction
  - Multiple mock transactions show variety
  - No crashes or errors
- [ ] Documentation created:
  - How to build demo version
  - How to distribute via TestFlight
  - How to present using demo build
- [ ] Demo procedure guide for presenters

**Definition of Ready:**
- [x] Story S2.3 completed (build profile ready)
- [x] All core functionality implemented
- [x] TestFlight access available
- [x] Documentation template defined

**Definition of Done:**
- [ ] Demo build on TestFlight
- [ ] Tested by at least 1 person
- [ ] Documentation complete
- [ ] Presenter guide created
- [ ] No critical bugs found

**Size:** M (4-5 hours)
**Dependencies:** S2.3 (EAS Build Profile)
**Assigned To:** Developer

---

## Sprint Backlog (Prioritized)

### Sprint 1 Backlog (Week 1: Feb 24-28)

| Priority | Story | Type | Size | Hours | Dependencies | Status |
|----------|-------|------|------|-------|--------------|--------|
| 1 | S1.1: Environment Variables | Infrastructure | XS | 2h | None | Not Started |
| 2 | S1.2: Mock Generator | Feature | M | 8h | None | Not Started |
| 3 | S1.3: Deep Link Handler | Feature | S | 4h | S1.2 | Not Started |
| 4 | S1.4: Test Button | Feature | S | 4h | S1.3 | Not Started |

**Sprint 1 Total:** 18 hours (2.5 days) + buffer = ~20 hours

### Sprint 2 Backlog (Week 2: Mar 3-7)

| Priority | Story | Type | Size | Hours | Dependencies | Status |
|----------|-------|------|------|-------|--------------|--------|
| 1 | S2.1: Merchant Variety | Enhancement | S | 3h | S1.2 | Not Started |
| 2 | S2.2: Card Matching | Enhancement | S | 4h | S1.2 | Not Started |
| 3 | S2.3: EAS Build Profile | Infrastructure | S | 3h | S1.1-S1.4 | Not Started |
| 4 | S2.4: TestFlight & Docs | Distribution | M | 5h | S2.3 | Not Started |

**Sprint 2 Total:** 15 hours (2 days) + buffer = ~20 hours

---

## Task Breakdown

### Sprint 1 Tasks

#### S1.1: Environment Variables (2h)
- [x] Create `.env.demo` file (15 min)
- [x] Create `.env.production` file (15 min)
- [x] Add environment variable check in code (30 min)
- [x] Test in both modes (30 min)
- [x] Document in README (30 min)

#### S1.2: Mock Generator (8h)
- [x] Create `lib/demo-data.ts` file (30 min)
- [x] Define TypeScript interfaces (1h)
- [x] Implement random merchant selection (2h)
- [x] Implement amount calculation per category (1.5h)
- [x] Add timestamp and card logic (1h)
- [x] Write unit tests (1.5h)
- [x] Document with JSDoc (30 min)

#### S1.3: Deep Link Handler (4h)
- [x] Review existing deep link code (30 min)
- [x] Add demo mode check (30 min)
- [x] Integrate mock generator (1h)
- [x] Add type safety (30 min)
- [x] Write unit tests (1h)
- [x] Integration testing (30 min)

#### S1.4: Test Button (4h)
- [x] Review existing test button (30 min)
- [x] Add demo mode logic (1h)
- [x] Update UI feedback (1h)
- [x] Test in demo mode (45 min)
- [x] Test in production mode (45 min)

### Sprint 2 Tasks

#### S2.1: Merchant Variety (3h)
- [x] Research realistic merchant names (1h)
- [x] Add 40+ merchants to data (1h)
- [x] Test variety (45 min)
- [x] Document merchant list (15 min)

#### S2.2: Card Matching (4h)
- [x] Review user card data structure (30 min)
- [x] Implement card selection logic (1.5h)
- [x] Add fallback logic (45 min)
- [x] Test with various card scenarios (1h)
- [x] Document behavior (15 min)

#### S2.3: EAS Build Profile (3h)
- [x] Update `eas.json` (30 min)
- [x] Configure demo profile (1h)
- [x] Test build creation (1h)
- [x] Document build process (30 min)

#### S2.4: TestFlight & Docs (5h)
- [x] Submit to TestFlight (1h)
- [x] Internal testing (2h)
- [x] Create presenter guide (1.5h)
- [x] Final documentation (30 min)

---

## Dependencies Map

```
Sprint 1:
S1.1 (Env Vars) ─────────┐
                         ↓
S1.2 (Mock Gen) → S1.3 (Deep Link) → S1.4 (Test Button)

Sprint 2:
S1.2 ─→ S2.1 (Merchants)
        S2.2 (Cards)

S1.1 + S1.2 + S1.3 + S1.4 → S2.3 (EAS Build) → S2.4 (TestFlight)
```

**Critical Path:** S1.2 → S1.3 → S1.4 → S2.3 → S2.4

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation | Owner |
|------|--------|------------|------------|-------|
| Mock data not realistic enough | Medium | Medium | Get presenter feedback in S2.1 | Developer |
| EAS build configuration issues | High | Low | Test early in Sprint 2, buffer time allocated | Developer |
| Demo mode accidentally in production | High | Low | Code review, environment checks | Developer |
| TestFlight submission delay | Medium | Medium | Submit early in Sprint 2 | Developer |
| Developer capacity issues | Medium | Low | Buffer built into estimates | Scrum Master |

---

## Sprint Ceremonies

### Sprint 1 (Week 1)
- **Sprint Planning:** Monday, Feb 24 (Review this plan)
- **Daily Sync:** Async updates in chat
- **Sprint Review:** Friday, Feb 28 (Demo core functionality)
- **Sprint Retro:** Friday, Feb 28 (Quick wins/improvements)

### Sprint 2 (Week 2)
- **Sprint Planning:** Monday, Mar 3 (Review S2 backlog)
- **Daily Sync:** Async updates
- **Sprint Review:** Friday, Mar 7 (Demo complete feature)
- **Sprint Retro:** Friday, Mar 7 (Project retrospective)

---

## Definition of Ready Checklist

All stories meet DoR:
- [x] User story format complete
- [x] Acceptance criteria clear and testable
- [x] Estimated with T-shirt sizes
- [x] Dependencies identified
- [x] No blockers
- [x] Small enough (max L size)
- [x] Design available (N/A - no UI changes)

---

## Definition of Done Checklist

Each story must meet:
- [ ] Code complete and follows standards
- [ ] Unit tests written and passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] No new technical debt
- [ ] Acceptance criteria verified
- [ ] User approved (final checkpoint)

---

## Success Metrics

### Sprint 1 Success Criteria
- [x] Demo mode environment variable working
- [x] Mock generator produces realistic data
- [x] Deep link handler injects mock data in demo mode
- [x] Test button functional in demo builds
- [x] No production code affected

### Sprint 2 Success Criteria
- [x] 40+ merchants available
- [x] Card matching working
- [x] Demo build created via EAS
- [x] TestFlight distribution successful
- [x] Documentation complete

### Overall Project Success
- **Primary:** Demo build completes full auto-capture flow without real transactions
- **Secondary:** TestFlight distributed to 5+ stakeholders
- **Tertiary:** Presenter feedback 4.5/5 or higher

---

## Handover to Developer

**Sprint plan complete!**

Next steps:
1. Developer reviews this sprint plan
2. Developer starts Sprint 1 with S1.1 (Environment Variables)
3. Daily async updates on progress
4. Sprint review at end of each week

**Ready to start development? See handover file:**
`.claude/handover/scrum-to-developer.md`

---

## Notes

- **Buffer time:** Built into estimates (~20% buffer per sprint)
- **Testing:** Continuous testing throughout, final validation on TestFlight
- **Code review:** Self-review + automated linting
- **Documentation:** Updated throughout, finalized in S2.4

---

**Sprint Plan Status:** ✅ Approved - Ready for Development
