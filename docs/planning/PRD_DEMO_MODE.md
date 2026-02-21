# PRD: Environment-Controlled Demo Mode

**Version:** 1.0
**Date:** 2026-02-21
**Status:** Approved
**PM:** Claude PM Agent

---

## Executive Summary

Enable demo presentations of the auto-capture feature without requiring real Apple Pay transactions by implementing an environment variable-controlled demo mode that injects mock transaction data.

---

## Problem Statement

**A demo presenter** struggles with **making real Apple Pay purchases** to demonstrate the auto-capture feature **but cannot do so because it requires actual financial transactions**, which makes **demos impractical, time-consuming, and potentially costly**.

### Current State
- Auto-capture feature requires real Apple Pay transactions to demonstrate
- Demo presenters must make actual purchases during presentations
- This is impractical for client demos, investor presentations, and testing
- Current test button only validates URL scheme, doesn't show full flow

### Target State
- Demo builds can simulate complete auto-capture flow with mock data
- No real transactions needed
- Same user experience as production
- Easy to create demo builds for TestFlight distribution

---

## Business Goals

### North Star Metric
**Successful demo completion rate: 100%** (demos completed without real transactions)

### Success Metrics
- **Primary:** 100% of demos can be completed without real transactions
- **Secondary:** Demo builds distributed via TestFlight to 10+ stakeholders
- **Tertiary:** Demo mode used in 80%+ of client presentations
- **User Satisfaction:** Presenters rate demo experience 4.5/5 or higher

---

## Solution Overview

Implement an environment variable (`EXPO_PUBLIC_DEMO_MODE`) that controls whether the app injects mock transaction data when the auto-capture flow is triggered. This allows building separate demo and production versions without any UI changes.

### Key Principle
- **Zero UI changes** - no buttons, toggles, or demo-specific screens
- **Build-time decision** - controlled via environment variable
- **Same user flow** - demo version looks and behaves identically to production

---

## User Personas

### Primary: Demo Presenter
- **Name:** Sarah (Sales Lead)
- **Context:** Presenting MaxiMile to potential clients
- **Pain:** Can't demo auto-capture without making real purchases
- **Need:** Quick, reliable way to show the feature working
- **Technical level:** Moderate - comfortable with TestFlight

### Secondary: Product Team
- **Name:** Alex (Product Manager)
- **Context:** Showing feature to investors/stakeholders
- **Pain:** Making purchases during demos is awkward
- **Need:** Professional demo experience
- **Technical level:** High - can build and distribute apps

---

## Features & Requirements

### P0: Core Demo Mode (Must Have)

#### 1. Environment Variable Setup
**Requirement:** Add `EXPO_PUBLIC_DEMO_MODE` environment variable
- **Values:** `true` (demo), `false` or unset (production)
- **Configuration:** Via `.env.demo` and `eas.json` build profiles
- **Behavior:** Read at runtime to determine mock vs real data

**Acceptance Criteria:**
- [ ] Environment variable read correctly in app
- [ ] Demo mode active when `EXPO_PUBLIC_DEMO_MODE=true`
- [ ] Production mode active when `EXPO_PUBLIC_DEMO_MODE=false`

#### 2. Mock Transaction Generator
**Requirement:** Create realistic mock transaction data generator

**Mock Data Includes:**
- **Merchants:** Variety of realistic names
  - Coffee: Starbucks, Peet's Coffee, Dunkin'
  - Gas: Shell, Chevron, Exxon, BP
  - Grocery: Whole Foods, Safeway, Trader Joe's
  - Restaurants: Chipotle, Panera, Subway
  - Retail: Target, CVS, Walgreens
- **Amounts:** Random realistic amounts
  - Coffee: $4.00 - $12.00
  - Gas: $35.00 - $85.00
  - Grocery: $20.00 - $150.00
  - Restaurants: $10.00 - $60.00
  - Retail: $8.00 - $100.00
- **Cards:** User's actual cards if available, fallback to mock card
- **Timestamps:** Current time
- **Source:** Marked as 'demo' for tracking

**Acceptance Criteria:**
- [ ] Mock data generator creates realistic transactions
- [ ] Variety of merchants across categories
- [ ] Amounts appropriate for merchant type
- [ ] Uses user's cards when available
- [ ] Different data on each trigger

#### 3. Deep Link Handler Enhancement
**Requirement:** Update `maximile://log` handler to inject mock data in demo mode

**Logic:**
```
When maximile://log is triggered:
  IF demo mode is enabled:
    - Generate mock transaction
    - Display auto-capture flow with mock data
  ELSE:
    - Use real transaction data (production behavior)
```

**Acceptance Criteria:**
- [ ] Demo mode checked on deep link trigger
- [ ] Mock data injected when demo mode active
- [ ] Production behavior unchanged when demo mode off
- [ ] No errors or crashes in either mode

#### 4. Setup Test Button Enhancement
**Requirement:** Make test button functional in demo mode

**Behavior:**
- **Demo mode:** Test button shows mock transaction immediately
- **Production mode:** Test button validates URL scheme only (current behavior)

**Acceptance Criteria:**
- [ ] Test button shows mock transaction in demo builds
- [ ] Test succeeds and shows "It works!" message
- [ ] Production behavior unchanged
- [ ] Clear success feedback to user

### P1: Enhanced Mock Data (Should Have)

#### 5. Merchant Category Variety
**Requirement:** Expand merchant list for more realistic demos

**Categories:**
- Coffee shops (8+ options)
- Gas stations (6+ options)
- Grocery stores (6+ options)
- Restaurants (10+ options)
- Retail stores (8+ options)
- Online services (Amazon, Apple, etc.)

**Acceptance Criteria:**
- [ ] At least 40 unique merchants
- [ ] Random selection on each trigger
- [ ] Realistic pricing per category

#### 6. Card Matching Logic
**Requirement:** Use user's actual card names when available

**Logic:**
- If user has mapped cards in profile → use actual card names
- If no cards mapped → use realistic mock card "Chase Sapphire Reserve"
- Makes demo feel personalized

**Acceptance Criteria:**
- [ ] Uses user's cards when available
- [ ] Fallback to mock card when no user cards
- [ ] Card selection realistic for merchant type

### P2: Future Enhancements (Could Have)

#### 7. Demo Build Indicator
**Requirement:** Subtle indicator for presenter (dev menu only)

**Details:**
- Small "DEMO" badge in development menu
- Not visible during normal demo flow
- Helps presenter confirm they're in demo mode

**Acceptance Criteria:**
- [ ] Indicator only in dev menu
- [ ] Not visible to audience
- [ ] Clear when in demo mode

---

## Technical Architecture

### File Structure
```
maximile-app/
├── .env                       # Default (production)
├── .env.demo                  # Demo mode config
├── .env.production            # Explicit production
├── eas.json                   # Updated with demo profile
├── lib/
│   ├── demo-data.ts          # NEW: Mock transaction generator
│   ├── deep-link.ts          # UPDATED: Check demo mode
│   └── constants.ts          # UPDATED: Demo mode flag
└── app/
    └── auto-capture-setup.tsx # UPDATED: Test button uses demo data
```

### Key Components

#### 1. Environment Configuration
**File:** `.env.demo`
```env
EXPO_PUBLIC_DEMO_MODE=true
```

**File:** `eas.json`
```json
{
  "build": {
    "demo": {
      "extends": "preview",
      "env": {
        "EXPO_PUBLIC_DEMO_MODE": "true"
      },
      "distribution": "internal"
    }
  }
}
```

#### 2. Mock Data Generator
**File:** `lib/demo-data.ts`
```typescript
export interface MockTransaction {
  amount: number;
  merchant: string;
  card: string;
  timestamp: Date;
  source: 'demo';
}

export function generateMockTransaction(): MockTransaction {
  // Implementation details
}
```

#### 3. Deep Link Handler
**File:** `lib/deep-link.ts`
```typescript
export function handleAutoCaptureDeepLink(url: string) {
  const params = parseAutoCaptureUrl(url);

  if (process.env.EXPO_PUBLIC_DEMO_MODE === 'true') {
    return {
      ...params,
      ...generateMockTransaction(),
      isDemo: true
    };
  }

  return params;
}
```

---

## User Flows

### Demo Mode Flow
```
1. [Build Time] Developer creates demo build:
   - Run: eas build --profile demo --platform ios
   - Result: Demo build uploaded to TestFlight

2. [Distribution] Share TestFlight link with presenters

3. [Setup] Presenter installs demo build
   - Same setup flow as production
   - Adds shortcut, configures automation

4. [Test] Presenter taps "Test Setup" button
   - Opens maximile://log
   - Mock transaction appears (e.g., "Starbucks $5.47")
   - Shows success screen
   - ✅ Setup confirmed working

5. [Demo - Quick Test] Presenter taps test button again
   - Different mock transaction appears (e.g., "Shell $52.30")
   - Demonstrates variety

6. [Demo - Realistic] Presenter opens Shortcuts app
   - Taps "MaxiMile" shortcut manually
   - App opens with mock transaction
   - Demonstrates automation flow

7. [Demo - Review] Presenter shows review/confirm screen
   - Mock transaction pre-filled
   - Can select card, add notes
   - Can confirm (doesn't save to real DB in demo)

8. [Repeat] Generate new mock transactions for multiple demos
```

### Production Mode Flow
```
1. [Build Time] Developer creates production build:
   - Run: eas build --profile production --platform ios
   - Result: Production build

2. [Distribution] User downloads from App Store

3. [Setup] User goes through auto-capture setup
   - Same flow as demo

4. [Test] User taps "Test Setup" button
   - Validates URL scheme only
   - Shows success if configured

5. [Real Use] User taps Apple Pay in Wallet
   - Shortcut triggers maximile://log
   - Real transaction data captured
   - App opens with pre-filled transaction

6. [Review] User reviews and confirms
   - Real data saved to database
```

---

## Build Configuration

### EAS Build Profiles

**Demo Build:**
```bash
eas build --profile demo --platform ios
```
- Environment: `EXPO_PUBLIC_DEMO_MODE=true`
- Distribution: Internal (TestFlight)
- Use case: Demos, presentations, stakeholder reviews

**Production Build:**
```bash
eas build --profile production --platform ios
```
- Environment: `EXPO_PUBLIC_DEMO_MODE=false`
- Distribution: App Store
- Use case: Real users

---

## Success Criteria

### Functional Requirements
- [ ] Demo builds work without real transactions
- [ ] Mock data realistic and varied
- [ ] Same user flow as production
- [ ] Test button functional in demo mode
- [ ] No visual differences between demo and production

### Performance Requirements
- [ ] Mock data generation < 100ms
- [ ] No performance degradation in demo mode
- [ ] Build time similar to production builds

### Quality Requirements
- [ ] Zero production code impacted by demo mode
- [ ] No demo-specific UI elements
- [ ] Environment variable isolated to build time

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Demo mode accidentally enabled in production | High | Low | Environment variable only set in demo profile |
| Mock data not realistic enough | Medium | Medium | Test with real presenters, iterate on merchants |
| Presenters confused about demo vs production | Low | Medium | Clear documentation, TestFlight naming |
| Demo data saved to real database | High | Low | Add checks to prevent saving demo transactions |

---

## Dependencies

### Technical Dependencies
- Expo environment variables support ✅ (already available)
- EAS Build profiles ✅ (already configured)
- Deep link handling ✅ (already implemented)

### Team Dependencies
- Developer: Implement mock data generator and deep link updates
- QA: Test demo builds on TestFlight
- Product/Sales: Validate mock data realism

---

## Timeline

### Sprint 1 (Week 1)
- **Day 1-2:** Implement mock data generator
- **Day 3:** Update deep link handler
- **Day 4:** Update test button logic
- **Day 5:** Testing and iteration

### Sprint 2 (Week 2)
- **Day 1:** EAS build configuration
- **Day 2:** Create demo build, test on TestFlight
- **Day 3:** Expand merchant variety (P1)
- **Day 4:** Card matching logic (P1)
- **Day 5:** Documentation and handover

**Total Effort:** ~2 weeks (1 developer)

---

## Out of Scope

- Custom demo scenarios (user-selectable)
- Demo session analytics
- Multiple demo modes (e.g., different regions)
- Demo transaction persistence
- Demo mode UI indicators visible to audience

---

## Appendix

### Mock Merchant List (Sample)

**Coffee Shops:**
- Starbucks, Peet's Coffee, Dunkin', Blue Bottle, Philz Coffee

**Gas Stations:**
- Shell, Chevron, Exxon, BP, Arco, 76

**Grocery:**
- Whole Foods, Safeway, Trader Joe's, Sprouts, Costco

**Restaurants:**
- Chipotle, Panera, Subway, Chick-fil-A, In-N-Out, Shake Shack

**Retail:**
- Target, CVS, Walgreens, Best Buy, Apple Store

### Environment Variable Reference

| Variable | Demo Value | Production Value | Purpose |
|----------|------------|------------------|---------|
| `EXPO_PUBLIC_DEMO_MODE` | `true` | `false` or unset | Enable/disable mock data |

---

## Approval Sign-off

- [x] **PM:** Approved - 2026-02-21
- [ ] **Engineering:** Review
- [ ] **QA:** Review
- [ ] **Product Lead:** Final Approval

---

**Next Steps:**
1. Scrum Master: Create sprint plan with epics and stories
2. Developer: Implement according to technical specs
3. QA: Test demo build on TestFlight
4. Product: Validate with real demo scenario
