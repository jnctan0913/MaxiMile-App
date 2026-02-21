# Epics & User Stories: MaxiMile

**Version**: 1.7
**Last Updated**: 2026-02-21
**Derived From**: Product Hypothesis (PRD Section 6), PRD Section 9, PRD Section 16 (Miles Portfolio Design Notes, Card Coverage Expansion Design Notes, Rate Change Detection Design Notes), NOTIFICATION_CAPTURE_FEASIBILITY v1.0, DRD_AUTO_CAPTURE v1.1
**Change Log**: v1.7 — Added 3 new user stories to Epic 12 from DRD v1.1 design decisions: S16.7 (Onboarding Step 1.5 — platform-adaptive auto-capture setup integrated between Add Cards and Set Miles Balances, skippable with "I'll do this later"), S16.8 (Recommendation Match Indicator — calls recommend() RPC on auto-capture confirmation, shows green "best card" or blue "tip" nudge, hidden when cap exhausted), S16.9 (Smart Pay → Auto-Capture Handoff — 60-second listener after Wallet return, skips manual entry, dual source badge). Added iOS Shortcut platform constraint note to S16.4 (user MUST tap "Add Automation" in Shortcuts app — Apple requirement). Updated Feature Traceability Matrix, Story Map, and Anti-Feature-Jam Check. Epic 12 now has 14 stories total. v1.6 — Added Epic 12 (Transaction Auto-Capture) with 11 user stories (S16.1–S16.6, S17.1–S17.5) covering F26–F27; addresses the #1 product risk (manual logging fatigue) with platform-native auto-capture on iOS (Apple Pay Shortcuts) and Android (NotificationListenerService). v1.5 — Added Epic 11 (Rate Change Detection Pipeline) with 12 user stories (S13.1–S13.6, S14.1–S14.3, S15.1–S15.3) covering F24–F25; updated traceability tables and hypothesis mapping. v1.4 — Added Epic 10 (Card Coverage Expansion & Rate Monitoring) with 12 user stories (S11.1–S11.6, S12.1–S12.6) covering F22–F23; updated traceability tables and hypothesis mapping. v1.3 — Added Epic 9 (Miles Ecosystem: Two-Layer Architecture) with 11 user stories (S9.1–S9.5, S10.1–S10.6) covering F18–F21; updated traceability tables. v1.2 — Added Epic 8 (Miles Portfolio & Goal Tracking) with 7 user stories (S8.1–S8.7) covering F13–F16; updated traceability tables. v1.1 — Added S1.3 (Card Rules Database), Epic 5 (MCC Validation), Epic 6 (Speed & Convenience), Epic 7 (Smart Portfolio); aligned with PRD v1.1 feature list (F1–F12)

---

## Hypothesis → Epic Mapping

Our hypothesis states:

> A **context-aware mobile application** that automatically **recommends the optimal credit card** at the **point of payment** based on **spend category**, **remaining bonus cap**, and **user preferences**. The system **continuously tracks cumulative spending** across cards and **updates recommendations in real-time**.

This decomposes into **12 Epics**, each addressing a distinct capability required to fulfil the hypothesis:

| Hypothesis Component | Epic | Priority |
|----------------------|------|----------|
| "user preferences" — the system must know which cards the user holds | **Epic 1: Card Portfolio Management** (F1, F5) | P0 (MVP) |
| "recommends the optimal credit card at the point of payment based on spend category" | **Epic 2: Smart Card Recommendation** (F2) | P0 (MVP) |
| "remaining bonus cap... continuously tracks cumulative spending across cards" | **Epic 3: Spending & Cap Tracking** (F3, F4, F6) | P0 (MVP) + P1 |
| "updates recommendations in real-time" — user sees value and impact | **Epic 4: Miles Performance & Insights** (F7) | P1 |
| Community-driven data accuracy — crowdsource MCC verification (Waze model) | **Epic 5: MCC Data Contribution & Validation** (F10) | P1 |
| Speed at point of payment — widget and merchant lookup | **Epic 6: Speed & Convenience** (F8, F9) | P1 |
| Proactive portfolio guidance beyond per-transaction optimization | **Epic 7: Smart Portfolio** (F11, F12) | P2 |
| Unified miles visibility + goal motivation — close the feedback loop | **Epic 8: Miles Portfolio & Goal Tracking** (F13, F14, F15, F16) | P1 |
| Complete miles ecosystem — users think in destinations, not sources | **Epic 9: Miles Ecosystem — Two-Layer Architecture** (F18, F19, F20, F21) | P1 |
| Market coverage & trust — support more cards and track rate changes | **Epic 10: Card Coverage Expansion & Rate Monitoring** (F22, F23) | P1 |
| "continuously tracks... updates in real-time" — data must stay fresh automatically | **Epic 11: Rate Change Detection Pipeline** (F24, F25) | P1 |
| "continuously tracks cumulative spending" — auto-capture replaces manual logging burden | **Epic 12: Transaction Auto-Capture** (F26, F27) | P1 |

---

## Feature → Story Traceability

| Feature (PRD) | Priority | Epic | User Stories |
|----------------|----------|------|-------------|
| F1: Card Portfolio Setup | P0 | E1 | S1.1, S1.2 |
| F5: Card Rules Database | P0 | E1 | S1.3 |
| F2: Spend Category Recommendation | P0 | E2 | S2.1, S2.2 |
| F3: Bonus Cap Tracker | P0 | E3 | S3.2 |
| F4: Transaction Logging | P0 | E3 | S3.1 |
| F6: Cap Approach Alerts | P1 | E3 | S3.3 |
| F7: Miles Dashboard | P1 | E4 | S4.1 |
| F10: MCC Crowdsource Validation | P1 | E5 | S5.1, S5.2, S5.3 |
| F8: Quick-Access Widget | P1 | E6 | S6.1 |
| F9: Merchant Search & MCC Lookup | P1 | E6 | S6.2 |
| F11: Portfolio Optimizer | P2 | E7 | S7.1 |
| F12: Promo & Bonus Tracker | P2 | E7 | S7.2 |
| F13: Miles Portfolio Dashboard | P1 | E8 | S8.1, S8.7 |
| F14: Manual Miles Balance Entry | P1 | E8 | S8.2, S8.3 |
| F15: Miles Redemption Logging | P1 | E8 | S8.4, S8.6 |
| F16: Miles Goal Tracker | P1 | E8 | S8.5, S8.6 |
| F18: Two-Layer Miles Architecture | P1 | E9 | S10.1, S10.2, S10.3, S10.4 |
| F19: Transfer Partner Mapping | P1 | E9 | S9.3, S9.4, S9.5 |
| F20: Smart Transfer Nudges | P1 | E9 | S10.5 |
| F21: Expanded Miles Programs | P1 | E9 | S9.1, S9.2 |
| F22: Card Coverage Expansion (20→29) | P1 | E10 | S11.1, S11.2, S11.3, S11.4, S11.5, S11.6 |
| F23: Rate Change Monitoring & Alerts | P1 | E10 | S12.1, S12.2, S12.3, S12.4, S12.5, S12.6 |
| F24: Community-Sourced Rate Change Submissions | P1 | E11 | S13.1, S13.2, S13.3, S13.4, S13.5, S13.6 |
| F25: Automated Rate Change Detection | P1 | E11 | S14.1, S14.2, S14.3, S15.1, S15.2, S15.3 |
| F26: Apple Pay Shortcuts Auto-Capture (iOS) | P1 | E12 | S16.1, S16.2, S16.3, S16.4, S16.5, S16.6, S16.7, S16.8, S16.9 |
| F27: Android Notification Auto-Capture | P1 | E12 | S17.1, S17.2, S17.3, S17.4, S17.5, S16.7, S16.8, S16.9 |

---

## Epic 1: Card Portfolio Management

**Goal**: Enable users to set up and manage their personal credit card portfolio so the system can deliver personalized recommendations.

**Hypothesis link**: The system needs to know the user's card portfolio ("user preferences") before it can recommend the optimal card. Without this, recommendations are generic, not personalized — which is no better than existing blogs.

**Success Metric**: Average 3+ cards added per user during onboarding; 90%+ of users complete portfolio setup.

**Features**: F1 (Card Portfolio Setup) + F5 (Card Rules Database)

---

### User Story 1.1: Add Credit Cards to My Portfolio

> **As a** miles-focused professional,
> **I want to** add my credit cards from a list of supported Singapore miles cards,
> **So that** the app knows which cards I hold and can recommend the best one for each purchase.

**Priority**: P0 (Must Have)
**Story Points**: 5

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I am on the portfolio setup screen | I search for "DBS Altitude" | The card appears in the search results with its correct card image/icon |
| AC2 | I select a card from the list | I tap "Add Card" | The card is added to my portfolio and its earn rates, bonus categories, and cap rules are auto-populated |
| AC3 | I have added a card | I view my portfolio | I see the card with a summary of its top earning categories and monthly caps |
| AC4 | The app has a pre-populated database | I browse available cards | At least the top 20 Singapore miles-earning cards are available (DBS Altitude, Citi PremierMiles, UOB PRVI Miles, OCBC 90°N, KrisFlyer UOB, etc.) |
| AC5 | I am a new user | I complete onboarding | The entire card setup process takes less than 3 minutes for 3 cards |

**Notes / Dependencies**:
- Depends on Card Rules Database (S1.3 / F5) being populated first
- Cards should be searchable by bank name and card name
- Consider allowing users to see popular card combos for inspiration

---

### User Story 1.2: View and Manage My Card Portfolio

> **As a** user with cards in my portfolio,
> **I want to** view, edit, and remove cards from my portfolio,
> **So that** my recommendations stay accurate when I cancel or acquire new cards.

**Priority**: P0 (Must Have)
**Story Points**: 3

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have 4 cards in my portfolio | I open the "My Cards" screen | I see all 4 cards listed with their key earn rates and current cap status |
| AC2 | I no longer hold a card | I swipe to remove it | The card is removed and future recommendations exclude it |
| AC3 | I tap on a card in my portfolio | I view the card detail | I see full earn rate breakdown by category, monthly caps, exclusions, and last-updated date |

---

### User Story 1.3: Card Rules Database (Foundation)

> **As the** system,
> **I need** a comprehensive, maintained database of Singapore miles card earn rates, bonus categories, caps, exclusions, and MCC mappings,
> **So that** all recommendations are accurate, trustworthy, and up-to-date.

**Priority**: P0 (Must Have) — **CRITICAL DEPENDENCY: blocks all other features**
**Story Points**: 13

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | The database is built | I query for any of the top 20 SG miles cards | Earn rates, bonus categories, monthly caps, and exclusions are returned accurately |
| AC2 | A bank changes a card's rules | Within 48 hours | The database is updated and version-controlled |
| AC3 | The data is queried by the recommendation engine | Engine requests card data | Response time is <100ms |
| AC4 | Data integrity is checked | A validation script runs | All cards have complete earn rate, cap, and category data — no null fields |
| AC5 | A card rule is updated | The old rule is checked | Previous rule is archived with effective_from/effective_to dates — not deleted |

**Notes / Dependencies**:
- This is the foundation — must be started in Sprint 0 (schema) and completed in Sprint 1 (data population)
- Card rules sourced from public bank T&Cs, MileLion, Suitesmile, SingSaver
- Data accuracy target: >99% match against actual bank T&Cs
- Must cover all 7 spend categories (Dining, Transport, Online Shopping, Groceries, Petrol, Travel/Hotels, General/Others)

---

## Epic 2: Smart Card Recommendation

**Goal**: Deliver instant, accurate, personalized card recommendations at the point of payment based on spend category and the user's portfolio.

**Hypothesis link**: This is the **core value proposition** — "recommends the optimal credit card at the point of payment based on spend category." This epic directly addresses the central friction: users not knowing which card to use at checkout.

**Success Metric**: Recommendation used 3+ times per user per week; <2 second response time; >95% recommendation accuracy.

**Features**: F2 (Spend Category Recommendation)

---

### User Story 2.1: Get Card Recommendation by Spend Category

> **As a** miles-focused professional standing at checkout,
> **I want to** select a spending category (e.g., Dining, Transport, Online Shopping) and instantly see which of my cards earns the most miles for that category,
> **So that** I can confidently tap the right card and maximize my miles without remembering complex rules.

**Priority**: P0 (Must Have) — **CORE VALUE PROPOSITION**
**Story Points**: 8

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have 4 cards in my portfolio and I am at a restaurant | I open the app and select "Dining" | I see the recommended card (e.g., "OCBC 90°N — 4 mpd") within 1 second |
| AC2 | The recommended card is displayed | I view the recommendation | I see: (a) card name, (b) earn rate in miles-per-dollar, (c) remaining monthly bonus cap for this category, and (d) a brief reason (e.g., "Highest dining earn rate, $650 cap remaining") |
| AC3 | I have 4 cards in my portfolio | I select "Dining" | I see the top recommended card AND a ranked list of alternatives from my portfolio (e.g., "2nd: DBS Altitude — 3 mpd, cap reached") |
| AC4 | One of my cards has a higher earn rate but its bonus cap is fully used | I select that category | The app recommends the next best card that still has cap remaining, NOT the capped-out card |
| AC5 | I open the app at checkout | I complete the recommendation flow | The entire interaction (open app → see recommendation) takes less than 5 seconds |

**Recommendation Engine Logic**:
1. For selected category, retrieve all user's cards with earn rates for that category
2. Filter out cards where monthly bonus cap is 100% used
3. Rank remaining cards by effective miles-per-dollar (mpd)
4. Display top card + ranked alternatives
5. If all bonus caps exhausted, show card with best base rate

**Spend Categories (v1)**: Dining, Transport (Grab/taxi), Online Shopping, Groceries, Petrol, Travel/Hotels, General/Others

**Notes / Dependencies**:
- Depends on Epic 1 (user must have cards in portfolio)
- Depends on Epic 3 (cap status must be tracked for cap-aware recommendations)

---

### User Story 2.2: Understand Why a Card Is Recommended

> **As a** user who wants to trust the app's recommendation,
> **I want to** see a clear explanation of why a specific card was recommended over my other cards,
> **So that** I understand the logic and build confidence in the system's accuracy.

**Priority**: P1 (Should Have)
**Story Points**: 3

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I see a card recommendation | I tap "Why this card?" | I see a breakdown: earn rate for this category, remaining cap, and comparison vs my other cards |
| AC2 | The explanation is displayed | I read it | It uses plain language (e.g., "This card earns 4 miles per dollar on dining. Your DBS Altitude also earns 3 mpd on dining, but you've already hit the $1,000 monthly bonus cap.") |
| AC3 | A card was skipped due to cap exhaustion | I view the explanation | The capped-out card is shown with a clear "Cap reached" label and the amount already spent |

---

## Epic 3: Spending & Cap Tracking

**Goal**: Track cumulative spending per card per category against monthly bonus caps, and adjust recommendations dynamically when caps are approached or exceeded.

**Hypothesis link**: Addresses "remaining bonus cap" and "continuously tracks cumulative spending across cards." This is the **key differentiator** — no existing solution tracks a user's real-time spending state. Without this, we're just another static earn-rate guide.

**Success Metric**: 70%+ of transactions logged within 24 hours; cap breach rate reduced by 80% vs pre-adoption baseline.

**Features**: F4 (Transaction Logging) + F3 (Bonus Cap Tracker) + F6 (Cap Approach Alerts)

---

### User Story 3.1: Log a Transaction After Payment

> **As a** user who just made a purchase,
> **I want to** quickly log the transaction (amount, category, card used),
> **So that** the app can accurately track my spending against bonus caps and give me correct future recommendations.

**Priority**: P0 (Must Have)
**Story Points**: 5

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I just paid for dinner with OCBC 90°N | I tap "Log Transaction" | I see a quick-log form pre-filled with the last recommended card and category |
| AC2 | I enter the amount ($85) and confirm | I submit the log | The transaction is recorded, and my remaining dining cap for OCBC 90°N decreases by $85 |
| AC3 | I am in a hurry | I complete the logging flow | The entire log takes less than 10 seconds (amount → confirm → done) |
| AC4 | I used a different card than the one recommended | I change the card in the log form | I can select any card from my portfolio; the system updates the correct card's cap |
| AC5 | I forgot to log a transaction yesterday | I access transaction history | I can add a back-dated transaction with the correct date |

**Notes / Dependencies**:
- This is the most friction-sensitive feature — if logging feels burdensome, users will stop and cap tracking becomes inaccurate
- Consider smart defaults: pre-fill category based on time of day, pre-fill card based on last recommendation
- Future (v2): Replace manual logging with bank API auto-import via SGFinDex

---

### User Story 3.2: View Remaining Bonus Cap Per Card

> **As a** user with multiple miles cards,
> **I want to** see my remaining monthly bonus cap for each card by category at a glance,
> **So that** I know when to switch cards and avoid earning base rate instead of bonus rate.

**Priority**: P0 (Must Have)
**Story Points**: 5

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have logged several dining transactions this month | I open the "Cap Status" view | I see each card's dining cap usage as a visual progress bar (e.g., "OCBC 90°N Dining: $750 / $1,000 used — $250 remaining") |
| AC2 | A card's cap is more than 80% used | I view cap status | That card's progress bar turns amber/orange as a visual warning |
| AC3 | A card's cap is 100% exhausted | I view cap status | That card shows a "Cap reached" label in red; the recommendation engine stops suggesting it for that category |
| AC4 | It is the 1st of a new month | I open the app | All monthly caps reset to $0 spent / full cap available |

---

### User Story 3.3: Receive Alert When Approaching a Card's Bonus Cap

> **As a** user who doesn't want to unknowingly exceed a bonus cap,
> **I want to** receive a push notification when I'm approaching a card's monthly bonus limit,
> **So that** I can proactively switch to the next best card before losing bonus miles.

**Priority**: P1 (Should Have)
**Story Points**: 3

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | My OCBC 90°N dining cap is $1,000/month and I've spent $800 | I log a transaction that brings me to 80% | I receive a push notification: "Heads up: Your OCBC 90°N dining cap is 80% used ($200 remaining). Consider switching to DBS Altitude for dining." |
| AC2 | My cap reaches 95% | I log the triggering transaction | I receive an urgent notification: "Almost there: Only $50 left on your OCBC 90°N dining bonus cap this month." |
| AC3 | I receive an alert | I tap the notification | It opens directly to the recommendation screen for that category, showing the next best card |
| AC4 | I find the alerts too frequent | I go to Settings | I can adjust alert thresholds (e.g., change from 80% to 90%) or disable alerts per card |

---

## Epic 4: Miles Performance & Insights

**Goal**: Show users the tangible value of using MaxiMile — how many additional miles they earned by following recommendations vs. their old approach.

**Hypothesis link**: Validates "users will earn more miles per dollar" — the user needs to see proof that the system delivers on its promise. This closes the feedback loop and drives long-term retention.

**Success Metric**: 60%+ of users check the dashboard at least once per month; NPS 50+.

**Features**: F7 (Miles Dashboard)

---

### User Story 4.1: View Monthly Miles Performance Summary

> **As a** user who has been using MaxiMile for a month,
> **I want to** see a dashboard showing how many miles I earned and how many additional miles I gained by following the app's recommendations,
> **So that** I can see the tangible value of the product and feel confident continuing to use it.

**Priority**: P1 (Should Have)
**Story Points**: 5

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have logged transactions for the past month | I open the "Miles Dashboard" | I see: (a) total miles earned this month, (b) total transactions logged, (c) average effective mpd |
| AC2 | I view the dashboard | I see the "Miles Saved" section | I see a comparison: "Miles earned with MaxiMile: 8,500. Estimated miles with a single default card: 5,200. **Extra miles earned: 3,300**" |
| AC3 | I want to understand the trend | I view the dashboard | I see a month-over-month chart of miles earned and effective mpd |
| AC4 | I want to see per-card breakdown | I scroll down | I see each card's contribution: total spend, miles earned, cap utilization (e.g., "OCBC 90°N: $2,400 spent, 9,600 miles, 80% of cap used") |

---

## Epic 5: MCC Data Contribution & Validation

**Goal**: Build a community-driven MCC verification system (Waze model) that improves recommendation accuracy over time through user contributions, without requiring a standalone community platform.

**Hypothesis link**: Accurate MCC-to-category mapping is foundational to recommendation quality. Crowdsourcing corrections enables a self-improving data moat that no static blog can replicate.

**Success Metric**: 30%+ of logged transactions include MCC confirmation within 3 months; 500+ community-verified merchants by Month 7.

**Features**: F10 (MCC Crowdsource Validation)

---

### User Story 5.1: Confirm or Flag MCC Mapping After Transaction

> **As a** user who just logged a transaction,
> **I want to** confirm or flag whether the merchant's category (MCC mapping) was correct,
> **So that** the app's recommendations become more accurate over time for me and other users.

**Priority**: P1 (Should Have)
**Story Points**: 5

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I just logged a transaction at a restaurant | I see a prompt "Was this categorized correctly as Dining?" | I can tap "Yes" to confirm or "No" to flag it |
| AC2 | I tap "No" (incorrect MCC) | I am prompted to select the correct category | I can choose from the 7 spend categories; my correction is submitted |
| AC3 | 3+ users flag the same merchant's MCC as incorrect | The system processes the flags | The merchant's MCC mapping is queued for admin review and potentially auto-corrected |
| AC4 | I skip the MCC confirmation prompt | The prompt disappears | It is non-intrusive and does not block the transaction logging flow |

**Notes / Dependencies**:
- Must be lightweight and non-intrusive — do not slow down the <10 sec transaction logging flow
- Prompt should appear after transaction is confirmed, not during
- This is a product data quality feature, not a community/social feature

---

### User Story 5.2: See Community Verification Status for Merchants

> **As a** user viewing a recommendation,
> **I want to** see whether the merchant's MCC mapping has been community-verified,
> **So that** I can gauge the confidence level of the recommendation for that specific merchant.

**Priority**: P1 (Should Have)
**Story Points**: 3

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I search for a merchant (P1: Merchant Search F9) | I view the merchant's recommended card | I see a "Community-verified" badge if 3+ users have confirmed the MCC, or "Unverified" otherwise |
| AC2 | A merchant is unverified | I view the recommendation | I see a note: "This category is based on MCC data and hasn't been verified by other users yet" |

**Notes / Dependencies**:
- Depends on F9 (Merchant Search) for the merchant-specific view
- Can also display verification status in the recommendation flow when category is auto-detected

---

### User Story 5.3: View My MCC Contribution Stats

> **As a** power user who contributes MCC verifications,
> **I want to** see my contribution stats (e.g., "You've verified 23 merchants"),
> **So that** I feel ownership, motivation, and recognition for helping improve the app's accuracy.

**Priority**: P1 (Should Have — lower priority within P1)
**Story Points**: 2

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have confirmed/flagged several MCCs | I view my profile or settings | I see "You've verified X merchants" and "You've flagged Y corrections" |
| AC2 | I want motivation to contribute | I see the stats | I see a message like "Your contributions helped improve accuracy for 150 users" |

**Notes / Dependencies**:
- Lightweight gamification — do not over-engineer
- Consider a simple "Data Champion" badge for top contributors

---

## Epic 6: Speed & Convenience (P1)

**Goal**: Minimize the time from "I need to pay" to "I know which card to use" through quick-access mechanisms and merchant-level lookup.

**Features**: F8 (Quick-Access Widget) + F9 (Merchant Search & MCC Lookup)

---

### User Story 6.1: Quick-Access Widget for Instant Recommendation

> **As a** user who wants to check the best card without opening the full app,
> **I want** a home screen widget that shows the top card for my most common categories,
> **So that** I can get a recommendation in <1 second without opening MaxiMile.

**Priority**: P1 (Should Have)
**Story Points**: 5

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have the widget on my home screen | I glance at it | I see the top recommended card for my top 3 most-used categories |
| AC2 | I tap a category on the widget | The app opens to that recommendation | I see the full recommendation with alternatives in <0.5 sec |

---

### User Story 6.2: Search for Merchant and See Recommended Card

> **As a** user at a specific merchant,
> **I want to** search for the merchant by name and see which card to use,
> **So that** I don't have to guess which spend category the merchant falls under.

**Priority**: P1 (Should Have)
**Story Points**: 5

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I am at a merchant | I search for "GrabFood" | I see the mapped category (e.g., "Online Shopping") and the recommended card for that category |
| AC2 | I search for a merchant | Results are displayed | The top 500 Singapore merchants are covered |
| AC3 | The merchant's MCC is community-verified | I view the result | I see a "Verified" badge next to the category |
| AC4 | I believe the category is wrong | I tap "Flag" | I can submit a correction (feeds into Epic 5: MCC Validation) |

---

## Epic 7: Smart Portfolio (P2)

**Goal**: Move beyond per-transaction optimization to provide strategic portfolio-level guidance — helping users decide which cards to hold, not just which to use.

**Features**: F11 (Portfolio Optimizer) + F12 (Promo & Bonus Tracker)

---

### User Story 7.1: Get Portfolio Optimization Suggestions

> **As a** user with 3+ months of spending data,
> **I want** the app to analyze my spending patterns and suggest cards to add or drop,
> **So that** my portfolio is optimally configured for my actual spending habits.

**Priority**: P2 (Could Have)
**Story Points**: 8

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have 3+ months of transaction data | I open "Portfolio Optimizer" | I see suggestions like "Adding HSBC Revolution could earn you 2,000 more miles/month on online shopping" |
| AC2 | I view a suggestion | I see the details | Projected miles gain/loss, annual fee trade-off, and a link to the card's info |

---

### User Story 7.2: Track Active Promotions for My Cards

> **As a** user,
> **I want to** see limited-time promotions for my cards (e.g., "10X points on Grab this month"),
> **So that** I can take advantage of temporary bonus earning opportunities.

**Priority**: P2 (Could Have)
**Story Points**: 5

**Acceptance Criteria**:
| # | Given | When | Then |
|---|-------|------|------|
| AC1 | One of my cards has an active promotion | I open the app | I see the promo highlighted (e.g., "DBS Altitude: 10X points on Grab until 28 Feb") |
| AC2 | I view a promo | It integrates with recommendations | The recommendation engine factors in the temporary bonus rate |

---

## Story Map Summary

```
                EPIC 1              EPIC 2                  EPIC 3                  EPIC 4              EPIC 5              EPIC 6              EPIC 7           EPIC 8                     EPIC 9
          Card Portfolio      Smart Recommendation     Spending & Cap Tracking   Miles Performance   MCC Validation    Speed & Convenience  Smart Portfolio  Miles Portfolio & Goals  Miles Ecosystem
          ─────────────      ────────────────────     ──────────────────────    ────────────────    ──────────────    ───────────────────  ──────────────  ──────────────────────  ───────────────

 P0       1.1 Add Cards  →   2.1 Get Recommendation → 3.1 Log Transaction
(MVP)     1.2 Manage Cards                             3.2 View Remaining Cap
          1.3 Card Rules DB

 P1       ─ ─ ─ ─ ─ ─ ─ ─   2.2 Why This Card?       3.3 Cap Approach Alert   4.1 Miles Dashboard  5.1 Confirm MCC    6.1 Widget                           8.1 Miles Dashboard     9.1 Expand Banks
                                                                                                     5.2 Verified Badge  6.2 Merchant Search                  8.2 Manual Balance      9.2 Add Airlines
                                                                                                     5.3 Contribution                                         8.3 Onboarding Step 2   9.3 Transfer DB
                                                                                                         Stats                                                8.4 Log Redemption      9.4 Potential Calc
                                                                                                                                                              8.5 Miles Goal          9.5 Seg Control
                                                                                                                                                              8.6 Program Detail      9.6 Layer 1
                                                                                                                                                              8.7 Miles Tab Nav       9.7 Layer 2
                                                                                                                                                                                      9.8 Nudges

 P2       ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ 7.1 Portfolio Opt
                                                                                                                              7.2 Promo Tracker

 Flow:  [Setup Cards] → [Ask "What am I buying?"] → [See Best Card] → [Pay] → [Log It] → [Confirm MCC] → [Track Caps] → [See Value]
            → [Miles Portfolio] → [Set Goal] → [Achieve!] → [View "My Miles"] ↔ [View "My Points"] → [Transfer Nudge] → [Transfer!]
```

---

## Traceability: Hypothesis → Epic → User Story → Friction Addressed

| Hypothesis Element | Epic | Key User Story | Friction Directly Addressed |
|--------------------|------|----------------|----------------------------|
| "based on... user preferences" | Epic 1 | 1.1 Add Cards | Users have no tool personalized to their actual portfolio |
| (Foundation: system needs accurate data) | Epic 1 | 1.3 Card Rules DB | No single source of truth for card earn rates, caps, exclusions |
| "recommends the optimal credit card at the point of payment based on spend category" | Epic 2 | 2.1 Get Recommendation | Users forget which card earns best for each category; stress at checkout |
| "remaining bonus cap" | Epic 3 | 3.2 View Remaining Cap | Users exceed caps unknowingly, losing bonus miles |
| "continuously tracks cumulative spending across cards" | Epic 3 | 3.1 Log Transaction | No existing tool tracks spending state in real-time |
| "updates recommendations in real-time" | Epic 2 + Epic 3 | 2.1 + 3.3 | Recommendations must adapt as caps are consumed throughout the month |
| (Implicit: user must see value to continue using) | Epic 4 | 4.1 Miles Dashboard | Users have no visibility into optimization performance |
| (Implicit: data accuracy improves over time) | Epic 5 | 5.1 Confirm MCC | MCC-to-category mappings have errors; crowdsourcing fixes them |
| (Implicit: speed at checkout is critical) | Epic 6 | 6.1 Widget, 6.2 Merchant Search | Opening full app takes too long; merchant category is unclear |
| (Implicit: portfolio strategy, not just transaction tactic) | Epic 7 | 7.1 Portfolio Opt | Users don't know which cards to hold, only which to use |
| (Implicit: visible reward of optimization drives retention) | Epic 8 | 8.1 Miles Dashboard, 8.5 Miles Goal | Users earn miles but have no unified view; no motivational framing |
| (Implicit: users think in destinations not sources) | Epic 9 | 9.5 Segmented Control, 9.6 Layer 1 | Flat program list mixes bank points and airline miles; users confused |
| (Implicit: bank points have hidden transfer value) | Epic 9 | 9.3 Transfer DB, 9.8 Nudge | Users don't know what their bank points are worth as airline miles |
| (Implicit: all 9 SG banks must be covered) | Epic 9 | 9.1 Expand Banks | HSBC/Amex/BOC users excluded; product feels incomplete |

---

## Anti-Feature-Jam Check

Every user story maps directly back to the hypothesis or a validated user need. No story exists that doesn't address a core friction point:

| User Story | Feature | Maps to Core Friction? | Verdict |
|------------|---------|----------------------|---------|
| 1.1 Add Cards | F1 | Yes — personalization prerequisite | Keep |
| 1.2 Manage Cards | F1 | Yes — portfolio accuracy | Keep |
| 1.3 Card Rules DB | F5 | Yes — foundation for all recommendations | Keep |
| 2.1 Get Recommendation | F2 | Yes — THE core friction | Keep |
| 2.2 Why This Card? | F2 | Yes — trust/transparency at checkout | Keep |
| 3.1 Log Transaction | F4 | Yes — enables cap tracking (differentiator) | Keep |
| 3.2 View Remaining Cap | F3 | Yes — prevents cap breaches | Keep |
| 3.3 Cap Approach Alert | F6 | Yes — proactive cap management | Keep |
| 4.1 Miles Dashboard | F7 | Yes — proves value, drives retention | Keep |
| 5.1 Confirm MCC | F10 | Yes — improves data accuracy (self-improving moat) | Keep |
| 5.2 Verified Badge | F10 | Yes — builds recommendation trust | Keep |
| 5.3 Contribution Stats | F10 | Yes — motivates data contribution | Keep |
| 6.1 Widget | F8 | Yes — speed at checkout | Keep |
| 6.2 Merchant Search | F9 | Yes — eliminates category guesswork | Keep |
| 7.1 Portfolio Optimizer | F11 | Yes — strategic portfolio value | Keep |
| 7.2 Promo Tracker | F12 | Yes — captures time-limited value | Keep |
| 8.1 View Miles Dashboard | F13 | Yes — no unified miles view | Keep |
| 8.2 Set Manual Balance | F14 | Yes — trust requires accurate total | Keep |
| 8.3 Onboarding Step 2 | F14 | Yes — empty day-one state reduces value | Keep |
| 8.4 Log Redemption | F15 | Yes — balance accuracy + celebration | Keep |
| 8.5 Set Miles Goal | F16 | Yes — motivational framing for retention | Keep |
| 8.6 Program Detail | F15+F16 | Yes — unified program view | Keep |
| 8.7 Miles Tab Nav | F13 | Yes — discoverability of core feature | Keep |

| 9.1 Expand Bank Programs | F21 | Yes — incomplete bank coverage | Keep |
| 9.2 Add Airline FFPs | F21 | Yes — only KrisFlyer is tracked | Keep |
| 9.3 Transfer Partner DB | F19 | Yes — no transfer pathway data | Keep |
| 9.4 Potential Miles Calc | F19 | Yes — hidden value in bank points | Keep |
| 9.5 Segmented Control | F18 | Yes — flat list confuses bank pts vs airline miles | Keep |
| 9.6 Airline + Potential | F18 | Yes — users think in destinations | Keep |
| 9.7 Bank Pts + Transfer Opts | F18 | Yes — "what to do with my points?" unanswered | Keep |
| 9.8 Smart Transfer Nudge | F20 | Yes — idle points losing value | Keep |

No feature-jamming detected. All 31 stories trace to hypothesis or validated user needs.

---

## Epic 8: Miles Portfolio & Goal Tracking (P1)

**Goal**: Give users a unified view of their miles across all loyalty programs, with the ability to set baselines, log redemptions, set goals, and track progress — closing the motivational feedback loop that drives long-term retention.

**Hypothesis link**: While Epics 1–3 optimize the *earning* of miles, users have no visibility into what they've accumulated. Without seeing the tangible result of their optimization, the perceived value of the product erodes over time. A Miles Portfolio with goal tracking transforms abstract "miles per dollar" into concrete "I'm 49% of the way to Tokyo in Business Class" — the strongest retention lever in the product.

**Success Metric**:
- 40% of users enter at least one manual balance within 2 weeks of feature launch
- Miles tab DAU = 30% of MAU
- 25% of users set at least one goal within 4 weeks
- Miles tab bounce rate <20% (users engage, not just glance)

**Features**: F13 (Miles Portfolio Dashboard) + F14 (Manual Miles Balance Entry) + F15 (Miles Redemption Logging) + F16 (Miles Goal Tracker)

**Sprint Mapping**: Sprint 7 (F13 + F14) → Sprint 8 (F15 + F16)

---

### User Story 8.1: View Miles Portfolio Dashboard (Auto-Calculated)

> **As a** miles-focused professional with multiple credit cards,
> **I want to** see a "Miles" tab showing my total miles per loyalty program — auto-calculated from my logged transactions,
> **So that** I know what I have earned across all programs without checking multiple bank apps.

**Priority**: P1 (Should Have)
**Feature**: F13 (Miles Portfolio Dashboard)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have logged transactions using cards mapped to KrisFlyer and Citi Miles | I open the Miles tab | I see a hero total showing the sum of all miles across all my programs |
| AC2 | I view the Miles tab | I scroll down | I see per-program glassmorphic cards showing: program icon, program name, manual balance + auto-earned = estimated display total |
| AC3 | Auto-earned miles are displayed | The system has calculated them | They are computed as `SUM(transaction.amount * earn_rule.earn_rate_mpd)` grouped by `card.miles_program_id` for the current user |
| AC4 | I have not logged any transactions and have no manual balances | I open the Miles tab | I see a friendly empty state with an illustration and CTA: "Start logging transactions to watch your miles grow" |
| AC5 | I pull down on the Miles tab | The screen refreshes | Auto-earned miles are recalculated and "Last refreshed" timestamp updates |
| AC6 | A program card is visible | I look at its detail | I see the contributing cards listed (e.g., "DBS Altitude, KrisFlyer UOB") |
| AC7 | The Miles tab loads | I observe performance | Dashboard renders in <2 seconds, even with 500+ historical transactions |

---

### User Story 8.2: Set Manual Miles Balance Per Program

> **As a** user who already has miles in my loyalty accounts,
> **I want to** set my current miles balance per program (e.g., "28,500 KrisFlyer miles") as a baseline,
> **So that** the app shows my true total — not just the miles tracked since I installed the app.

**Priority**: P1 (Should Have)
**Feature**: F14 (Manual Miles Balance Entry)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I tap a program card on the Miles tab | A bottom sheet opens | I see a numeric input field pre-filled with my current manual balance (or 0 if not set) |
| AC2 | I enter "28500" and tap "Save" | The balance is persisted | The `miles_balances` table is upserted with `manual_balance = 28500` and `updated_at = now()` |
| AC3 | I view the program card after saving | The display total updates | It shows the breakdown: 28,500 (manual) + 2,450 (earned) = 30,950 total |
| AC4 | I enter a non-numeric value or negative number | I try to save | Validation prevents save; inline error message displayed |
| AC5 | I saved a balance 3 days ago | I view the program card | I see "Balance last updated 3 days ago" below the total |

---

### User Story 8.3: Enter Miles Balances During Onboarding (Step 2)

> **As a** new user who just selected my credit cards during onboarding,
> **I want to** optionally enter my current miles balances for the loyalty programs my cards earn into,
> **So that** the Miles tab shows meaningful data from day one — not just zeros.

**Priority**: P1 (Should Have)
**Feature**: F14 (Onboarding integration)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I complete onboarding Step 1 (card selection) and tap "Done" | I see a new Step 2 screen | Title: "Set your current miles balances"; subtitle: "Optional — you can always update these later" |
| AC2 | I selected DBS Altitude and Citi PremierMiles in Step 1 | I view Step 2 | I see KrisFlyer (derived from DBS Altitude) and Citi Miles (derived from Citi PremierMiles) — only programs relevant to my selected cards, deduplicated |
| AC3 | I enter "28500" for KrisFlyer and leave Citi Miles blank | I tap "Save & Continue" | KrisFlyer balance saved as 28,500; Citi Miles defaults to 0; I proceed to the main app |
| AC4 | I don't want to enter balances now | I tap "I'll do this later" skip link | I proceed to the main app; all program balances default to 0; program associations are still created |
| AC5 | The skip link is displayed | I view the screen | It is always visible without scrolling (fixed at bottom or positioned above the CTA) |

---

### User Story 8.4: Log Miles Redemption

> **As a** user who just redeemed miles for a flight, upgrade, or transfer,
> **I want to** log the redemption (e.g., "42,000 KrisFlyer for SIN→NRT"),
> **So that** my running miles balance stays accurate and I can celebrate the reward I earned through optimization.

**Priority**: P1 (Should Have)
**Feature**: F15 (Miles Redemption Logging)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I tap "Log Redemption" on a program card or program detail | A bottom sheet opens | I see fields: miles amount (numeric), description (text), date (defaults to today, can change) |
| AC2 | I enter 42,000 miles with description "SIN→NRT Business Class" and tap "Save" | The redemption is recorded | A row is inserted in `miles_transactions` with `type = 'redeem'`; the program's display total decreases by 42,000 |
| AC3 | I save a redemption | A celebration moment appears | Brief confetti animation + positive message: "Congrats! You redeemed 42,000 miles" |
| AC4 | I try to redeem more miles than my current balance | I tap "Save" | A warning appears: "This exceeds your current balance. Save anyway?" — allows override since bank balance may differ |
| AC5 | I view a program's detail screen | I scroll to redemption history | I see a chronological list of my redemptions (date, amount, description), newest first |

---

### User Story 8.5: Set Miles Goal with Progress Tracking

> **As a** user working toward a specific miles redemption,
> **I want to** set a miles goal per program (e.g., "63,000 KrisFlyer for Tokyo Business Class") and see a progress bar with a projected achievement date,
> **So that** I stay motivated to optimize my spending and can plan my travel accordingly.

**Priority**: P1 (Should Have)
**Feature**: F16 (Miles Goal Tracker)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I tap "Set Goal" on a program card or program detail | A bottom sheet opens | I see fields: target miles (numeric), description (text — e.g., "Tokyo Business Class"), and a "Save" button |
| AC2 | I set a goal of 63,000 KrisFlyer miles | I view the program card | I see a progress bar showing `current_balance / target_miles` as a percentage (e.g., "30,950 / 63,000 — 49%") |
| AC3 | I have 3+ months of earning history for KrisFlyer | I view the goal | I see a projected achievement date calculated from a 3-month rolling average earning velocity |
| AC4 | I have <3 months of earning data | I view the goal | I see "Keep logging transactions to see a projection" instead of a date |
| AC5 | My current balance meets or exceeds the goal target | I view the goal | The goal is marked "Achieved!" with a celebration animation; progress bar shows 100% in brand gold color |
| AC6 | I already have 3 active goals for the same program | I try to set a 4th | I see an error: "Maximum 3 goals per program" |
| AC7 | I want to remove a goal | I swipe or tap delete | The goal is removed; progress bar disappears from the program card |

---

### User Story 8.6: View Program Detail with Goals, Redemptions, and Contributing Cards

> **As a** user who taps a program card on the Miles tab,
> **I want to** see a comprehensive detail screen with my balance breakdown, active goals, redemption history, and contributing cards,
> **So that** I have full visibility into a single loyalty program in one place.

**Priority**: P1 (Should Have)
**Feature**: F15 + F16 (presentation layer)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I tap a program card (e.g., KrisFlyer) on the Miles tab | A program detail screen opens | I see: program name, total balance with breakdown (manual + earned - redeemed) |
| AC2 | I have active goals for this program | I view the detail screen | I see each goal with its progress bar, percentage, and projected date |
| AC3 | I have logged redemptions for this program | I scroll down | I see a "Redemption History" section with entries sorted newest first |
| AC4 | I have multiple cards contributing to this program | I scroll down | I see a "Contributing Cards" section listing each card with its earn rate summary |
| AC5 | I want to take action | I view the detail screen | I see action buttons: "Update Balance", "Log Redemption", "Set Goal" |

---

### User Story 8.7: Navigate to Miles Tab

> **As a** user,
> **I want to** access the Miles Portfolio from a dedicated "Miles" tab in the bottom navigation bar,
> **So that** checking my miles balance is as easy as checking recommendations or cap status.

**Priority**: P1 (Should Have)
**Feature**: F13 (navigation entry point)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I am on any screen in the app | I look at the bottom tab bar | I see 5 tabs: Recommend, My Cards, Cap Status, Log, Miles |
| AC2 | I tap the "Miles" tab | The Miles Portfolio screen loads | I see the Miles Portfolio Dashboard with hero total and per-program cards |
| AC3 | The Miles tab icon | I view the tab bar | The icon is a diamond-outline; active state uses the brand accent color |

---

### Epic 8 — Feature Traceability Matrix

| User Story | Feature (PRD) | Sprint | Core Friction Addressed |
|------------|---------------|--------|------------------------|
| 8.1 View Miles Dashboard | F13 | Sprint 7 | No unified view of miles across programs; users check multiple bank apps |
| 8.2 Set Manual Balance | F14 | Sprint 7 | App-tracked miles understate true total; users lose trust |
| 8.3 Onboarding Step 2 | F14 | Sprint 7 | Day-one empty state reduces perceived value; users don't discover balance entry |
| 8.4 Log Redemption | F15 | Sprint 8 | Balance drifts from reality after redemptions; no celebration of the reward |
| 8.5 Set Miles Goal | F16 | Sprint 8 | Abstract miles lack motivational framing; no connection to tangible travel plans |
| 8.6 Program Detail | F15 + F16 | Sprint 8 | Fragmented program info; no single place to see goals + history + cards |
| 8.7 Navigate to Miles Tab | F13 | Sprint 7 | Miles portfolio buried or inaccessible; not a daily check-in habit |

---

### Epic 8 — Story Map

```
                    EPIC 8: Miles Portfolio & Goal Tracking
                    =======================================

 Sprint 7       8.7 Miles Tab Nav → 8.1 View Dashboard → 8.2 Set Manual Balance → 8.3 Onboarding Step 2
 (MVP)          (entry point)        (auto-calculated)    (baseline)                (day-one value)

 Sprint 8       ─ ─ ─ ─ ─ ─ ─ ─ → 8.4 Log Redemption → 8.5 Set Miles Goal → 8.6 Program Detail
 (Engagement)                       (balance accuracy)    (motivation)          (unified view)

 Flow:  [Open Miles Tab] → [See Auto-Calculated Totals] → [Set Baseline] → [Log Redemptions]
            → [Set Goal] → [Track Progress] → [Goal Achieved!] → [Repeat]
```

---

## Epic 9: Miles Ecosystem — Two-Layer Architecture (P1)

**Goal**: Restructure the Miles tab into a two-layer presentation that matches how users actually think about miles — destinations (airline FFPs they redeem with) vs sources (bank points they earn from cards) — while expanding coverage to all 9 Singapore banks and 7 key airline programs.

**Hypothesis link**: Research shows users think in *destinations* ("Can I book that SQ flight?") not *sources* ("I have DBS Points"). The current flat list of mixed programs creates confusion. By separating airline miles (Layer 1, default) from bank points (Layer 2) and showing transfer pathways between them, we align the product with the user's mental model and surface hidden value (transferable bank points they didn't know could become airline miles).

**Success Metric**:
- All 9 SG banks covered (up from 6) — no user sees "my bank isn't supported"
- 50%+ of users view Layer 1 ("My Miles") daily
- Transfer nudge CTR > 15% (users find nudges valuable, not spammy)
- Asia Miles and KrisFlyer both tracked by 40%+ of active users
- <5% of users report confusion about confirmed vs potential miles (post-feature survey)

**Features**: F18 (Two-Layer Architecture) + F19 (Transfer Partner Mapping) + F20 (Smart Transfer Nudges) + F21 (Expanded Miles Programs)

**Sprint Mapping**: Sprint 9 (F21 + F19 — data foundation) → Sprint 10 (F18 + F20 — presentation)

---

### User Story 9.1: Expand Bank Points Programs (HSBC, Amex, BOC)

> **As a** user with HSBC, Amex, or BOC credit cards,
> **I want** my bank's reward points program to appear in MaxiMile,
> **So that** my miles portfolio is complete and I don't feel like a second-class user.

**Priority**: P1 (Must Have)
**Feature**: F21 (Expanded Miles Programs — bank points)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have HSBC Revolution in my card portfolio | I view the Miles tab | I see "HSBC Reward Points" as one of my programs |
| AC2 | I have Amex KrisFlyer Ascend in my portfolio | I view the Miles tab | I see either "KrisFlyer" (direct-earn) or "Amex Membership Rewards" depending on card behavior — correctly mapped |
| AC3 | I have BOC Elite Miles in my portfolio | I view the Miles tab | I see "BOC Points" as one of my programs |
| AC4 | The expanded programs are seeded | I query miles_programs | 10 bank/transferable programs exist (7 existing + 3 new) |
| AC5 | Existing users without HSBC/Amex/BOC cards | They view the Miles tab | They see no change — new programs don't appear unless the user has matching cards |

---

### User Story 9.2: Add Airline Frequent Flyer Programs

> **As a** miles-focused professional who earns airline miles beyond KrisFlyer,
> **I want** the app to recognize Asia Miles, BA Avios, Qantas FF, and other airline FFPs,
> **So that** I can track all the airline programs my bank points can transfer into.

**Priority**: P1 (Must Have)
**Feature**: F21 (Expanded Miles Programs — airline FFPs)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | 6 new airline FFPs are seeded | I query miles_programs for type 'airline' | I see 7 programs: KrisFlyer + Asia Miles, BA Avios, Qantas FF, Qatar Privilege Club, Flying Blue, Malaysia Airlines Enrich |
| AC2 | Asia Miles is seeded | I view its details | airline = 'Cathay Pacific', program_type = 'airline' |
| AC3 | The existing KrisFlyer program | After migration | It is unchanged — no duplicates, no data alterations |

---

### User Story 9.3: Transfer Partner Database with Conversion Rates

> **As the** system,
> **I need** a database of which bank points programs can transfer to which airline FFPs, with conversion rates, fees, and minimums,
> **So that** the app can calculate "potential miles" and show users their transfer options.

**Priority**: P1 (Must Have — data foundation)
**Feature**: F19 (Transfer Partner Mapping)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | transfer_partners table exists | I query DBS Points' partners | I see rows for KrisFlyer, Asia Miles, Qantas FF with correct conversion rates (5:2 ratio) |
| AC2 | HSBC Reward Points is queried | I view its transfer options | At least 7 airline partners are shown with verified conversion rates |
| AC3 | Each transfer partner row | I inspect it | It has: source_program_id, destination_program_id, conversion_rate_from, conversion_rate_to, transfer_fee_sgd, min_transfer_amount, transfer_url, last_verified_at |
| AC4 | All 9 bank programs are seeded | I count total partner rows | At minimum 40+ transfer relationship rows exist |
| AC5 | BOC Points has a transfer fee | I view its KrisFlyer row | transfer_fee_sgd = 30.56 is correctly stored |
| AC6 | I call get_transfer_options(program_id) | Results are returned | Destination programs with rates, sorted by conversion value (best rate first) |

---

### User Story 9.4: Potential Miles Calculation Engine

> **As the** system,
> **I need** to calculate how many airline miles a user could get by transferring their bank points,
> **So that** Layer 1 ("My Miles") can show "potential miles" alongside confirmed balances.

**Priority**: P1 (Should Have)
**Feature**: F19 (calculation engine for F18)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | User has 50,000 DBS Points, DBS→KrisFlyer rate is 5:2 | I call get_potential_miles for KrisFlyer | Returns 20,000 potential KrisFlyer miles from DBS Points |
| AC2 | User has DBS Points AND HSBC Rewards both transferable to KrisFlyer | I call the function | Returns combined potential from both sources, with per-source breakdown |
| AC3 | User has no bank points | I call the function | Returns 0 potential miles |

---

### User Story 9.5: Switch Between "My Miles" and "My Points" Views

> **As a** user on the Miles tab,
> **I want to** switch between "My Miles" (airline programs) and "My Points" (bank reward points) using a segmented control,
> **So that** I can view my rewards from both the destination and source perspectives.

**Priority**: P1 (Must Have)
**Feature**: F18 (Two-Layer Architecture)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I open the Miles tab | I see the screen | A segmented control below the title: "My Miles" (default active) and "My Points" |
| AC2 | "My Miles" is active | I view the content | I see airline program cards only (KrisFlyer, Asia Miles, etc.) |
| AC3 | I tap "My Points" | The view switches | I see bank reward point cards only (DBS Points, HSBC Rewards, etc.) |
| AC4 | I switch segments | The hero total updates | "My Miles" = total airline miles; "My Points" = total bank points |
| AC5 | I switch and switch back | Transition is smooth | Content switches in <300ms; scroll position resets to top |

---

### User Story 9.6: View Airline Program with Confirmed + Potential Miles

> **As a** user viewing "My Miles",
> **I want to** see each airline program showing both my confirmed balance and potential miles from transferable bank points,
> **So that** I understand the full redemption power available to me.

**Priority**: P1 (Must Have)
**Feature**: F18 (Layer 1)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have 30,000 KrisFlyer (confirmed) + 50,000 DBS Points (20,000 potential KrisFlyer at 5:2) | I view KrisFlyer in "My Miles" | "30,000 confirmed + 20,000 potential = 50,000 total" with clear visual distinction |
| AC2 | I tap the "potential" line | A breakdown expands | "20,000 from DBS Points (50,000 × 2/5)" — shows each bank source, balance, and conversion math |
| AC3 | I have no transferable bank points for Asia Miles | I view Asia Miles card | Only confirmed miles shown; no potential section |
| AC4 | An airline program has 0 confirmed but >0 potential | It still appears | Because cards feed into it — shows "0 confirmed + 20,000 potential" |

---

### User Story 9.7: View Bank Points with Transfer Options

> **As a** user viewing "My Points",
> **I want to** see each bank points program with my balance and a list of airline programs I can transfer to (with rates),
> **So that** I can decide where to transfer for maximum value.

**Priority**: P1 (Must Have)
**Feature**: F18 (Layer 2)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have 50,000 DBS Points | I view DBS Points in "My Points" | Balance shown with "Transfer options" section: KrisFlyer (20k miles at 5:2), Asia Miles (20k at 5:2), Qantas (20k at 5:2) |
| AC2 | I view a transfer option | I see details | Airline name, conversion rate, resulting miles, fee (if any), "Transfer" CTA |
| AC3 | I tap "Transfer" CTA | The app opens the bank's transfer page | Deep-link to bank transfer URL or external browser |
| AC4 | BOC Points has a S$30.56 transfer fee | I view the option | Fee is clearly displayed: "Transfer fee: S$30.56" |

---

### User Story 9.8: Smart Transfer Nudge for Idle Bank Points

> **As a** user with idle bank points that haven't been transferred,
> **I want** a smart suggestion card telling me about my transfer options,
> **So that** I don't miss opportunities or let my points devalue.

**Priority**: P1 (Should Have)
**Feature**: F20 (Smart Transfer Nudges)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have 50,000 DBS Points, no transfers in 30 days | I view "My Points" | Nudge card at top: "Your 50,000 DBS Points could become 20,000 KrisFlyer miles" |
| AC2 | I tap "Dismiss" on the nudge | It hides | Hidden for this session; may reappear next session |
| AC3 | Multiple banks have idle points | System selects best | Maximum 1 nudge per session; highest-value suggestion shown first |
| AC4 | I have 0 bank points | I view "My Points" | No nudge shown |
| AC5 | I tap "View options" on the nudge | The screen scrolls | Scrolls to the relevant bank program's transfer options |

---

### Epic 9 — Feature Traceability Matrix

| User Story | Feature (PRD) | Sprint | Core Friction Addressed |
|------------|---------------|--------|------------------------|
| 9.1 Expand Bank Programs | F21 | Sprint 9 | HSBC/Amex/BOC users have no support; incomplete portfolio |
| 9.2 Add Airline FFPs | F21 | Sprint 9 | Only KrisFlyer tracked; users with Asia Miles, Qantas etc. excluded |
| 9.3 Transfer Partner DB | F19 | Sprint 9 | No data exists on bank→airline transfer relationships |
| 9.4 Potential Miles Calc | F19 | Sprint 9 | Users don't know what their bank points are worth in airline miles |
| 9.5 Segmented Control | F18 | Sprint 10 | Flat program list mixes bank points and airline miles — confusing |
| 9.6 Airline + Potential | F18 | Sprint 10 | Users think in destinations but current view doesn't separate them |
| 9.7 Bank Points + Options | F18 | Sprint 10 | "What should I do with my DBS Points?" — no answer in the app |
| 9.8 Smart Transfer Nudge | F20 | Sprint 10 | Users have idle points they could transfer but don't know about |

---

### Epic 9 — Story Map

```
                    EPIC 9: Miles Ecosystem — Two-Layer Architecture
                    ================================================

 Sprint 9       9.1 Expand Bank Programs → 9.2 Add Airline FFPs → 9.3 Transfer Partner DB → 9.4 Potential Miles Calc
 (Foundation)   (HSBC, Amex, BOC)          (Asia Miles, BA, etc.)  (rates, fees, minimums)   (bank pts → airline miles)

 Sprint 10      ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ → 9.5 Segmented Control → 9.6 Airline Layer 1 → 9.7 Bank Points Layer 2 → 9.8 Smart Nudges
 (Presentation) (DRD update first)         (My Miles | My Points)  (confirmed + potential)  (balance + transfer opts)  (idle point alerts)

 Flow:  [See "My Miles" — airline totals + potential] ↔ [Switch to "My Points" — bank balances + transfer options]
            → [See transfer nudge] → [Tap "Transfer"] → [Open bank transfer page] → [Update confirmed balance] → [Repeat]
```

---

### Anti-Feature-Jam Check (Epic 8)

| User Story | Feature | Maps to Core Friction? | Verdict |
|------------|---------|----------------------|---------|
| 8.1 View Miles Dashboard | F13 | Yes — no unified miles view; users check multiple apps | Keep |
| 8.2 Set Manual Balance | F14 | Yes — app-only tracking understates true balance, eroding trust | Keep |
| 8.3 Onboarding Step 2 | F14 | Yes — empty Miles tab on day one reduces perceived value | Keep |
| 8.4 Log Redemption | F15 | Yes — balance becomes inaccurate after redemptions; no celebration moment | Keep |
| 8.5 Set Miles Goal | F16 | Yes — abstract miles lack motivational framing | Keep |
| 8.6 Program Detail | F15+F16 | Yes — fragmented info across multiple views | Keep |
| 8.7 Navigate to Miles Tab | F13 | Yes — without top-level access, feature is undiscoverable | Keep |

No feature-jamming detected. All 7 stories trace to validated user needs or PRD features F13–F16.

---

## Epic 10: Card Coverage Expansion & Rate Monitoring

**Goal**: Expand MaxiMile's card database from 20 to 29 miles cards (~85% market coverage) and build a rate change monitoring system to proactively alert users about earn rate changes, cap adjustments, and program devaluations.

**Hypothesis link**: MaxiMile can only "recommend the optimal credit card" if the user's cards are in the database. Users with unsupported cards get zero value — they churn. Expanding to 29 cards opens ~25% more addressable market. Rate change alerts build trust by protecting users from silent devaluations (e.g., Amex MR Feb 2026, DBS WWC cap cut Aug 2025).

**Success Metric**: Card coverage ≥85% of SG miles card market; 0 users with unsupported primary miles card; rate change alerts read rate >60%.

**Features**: F22 (Card Coverage Expansion 20→29) + F23 (Rate Change Monitoring & Alerts)

---

### User Story 11.1: Database Migration for Eligibility Metadata & POSB Reclassification

> **As the** system,
> **I need** an `eligibility_criteria` JSONB column on the credit cards table and the POSB Everyday Card reclassified as cashback,
> **So that** restricted cards can store eligibility requirements and the database accurately reflects which cards are miles cards.

**Priority**: P1 (Must Have — foundation)
**Feature**: F22 (Card Coverage Expansion)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Migration is applied | I describe the credit_cards table | `eligibility_criteria JSONB` column exists with DEFAULT NULL |
| AC2 | POSB Everyday Card | I query it after migration | `is_miles_card = false` (or removed from miles card results) |
| AC3 | Existing 19 miles cards | After migration | All remain unchanged — no data corruption, no broken FKs |
| AC4 | I query eligibility_criteria for DBS Altitude | It returns | NULL (no restrictions — open to all applicants meeting standard income) |

---

### User Story 11.2: Seed 10 New High-Priority Miles Cards with Earn Rules

> **As a** user who holds a DBS Vantage, OCBC VOYAGE, or any of the 10 new cards,
> **I want** my card to be recognized by MaxiMile with accurate earn rates, caps, and conditions,
> **So that** I receive correct spend recommendations and can optimize my miles earning.

**Priority**: P1 (Must Have — primary value driver)
**Feature**: F22 (Card Coverage Expansion)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | All 10 cards are seeded | I query credit_cards | 29 total miles cards exist (20 - 1 POSB + 10 new) |
| AC2 | DBS Vantage is seeded | I view its earn rules | 1.5 mpd local, 2.2 mpd overseas (uncapped), eligibility: income ≥ S$120k |
| AC3 | UOB Lady's Solitaire is seeded | I view its eligibility | `{"gender": "female"}` in eligibility_criteria; 4 mpd on TWO preferred categories |
| AC4 | Maybank XL Rewards is seeded | I view its eligibility | `{"age_min": 21, "age_max": 39}` in eligibility_criteria |
| AC5 | OCBC VOYAGE is seeded | I view its earn rules | 1.3 mpd local, 2.2 mpd overseas (uncapped), mapped to VOYAGE Miles program |
| AC6 | SC Beyond is seeded | I view its details | Tiered earn rates (1.5 mpd local / 3 mpd overseas standard; 2 mpd / 4 mpd Priority Banking), eligibility: `{"banking_tier": "priority_banking"}` |
| AC7 | Each new card | I verify earn rules | All 7 spend categories have correct earn rates cross-referenced against bank T&Cs |

**Cards to Seed**:

| # | Card | Bank | Key Earn Rate | Annual Fee | Special Notes |
|---|------|------|---------------|------------|---------------|
| 1 | DBS Vantage Visa Infinite | DBS | 1.5/2.2 mpd (uncapped) | S$600 | Income S$120k; Treasures tier |
| 2 | UOB Lady's Solitaire Metal | UOB | 4 mpd × 2 categories | S$490 | Women only |
| 3 | UOB Visa Signature | UOB | 4 mpd contactless/petrol/overseas | S$196 | Min spend S$1k/month |
| 4 | OCBC VOYAGE Card | OCBC | 1.3/2.2 mpd (uncapped) | S$498 | Own VOYAGE Miles currency |
| 5 | SC Journey Card | SC | 3 mpd groceries/food/rides | S$196 | Cap S$1k/month per category |
| 6 | SC Smart Card | SC | Up to 9.28 mpd niche | S$99 | EV charging, streaming, transport |
| 7 | SC Beyond Card | SC | 1.5-4 mpd (tiered) | S$1,500+ | Priority Banking required |
| 8 | Maybank World MC | Maybank | 4 mpd petrol (uncapped!) | S$196 | Best petrol card in SG |
| 9 | Maybank XL Rewards | Maybank | 4 mpd dining/shopping/travel | S$87 | Age 21-39 only |
| 10 | HSBC Premier MC | HSBC | 1.4/2.3 mpd | S$709 | Premier relationship; 91.8k welcome miles |

---

### User Story 11.3: Map New Cards to Miles Programs & Create VOYAGE Miles Program

> **As the** system,
> **I need** all 10 new cards mapped to their correct bank points / miles programs, including creating VOYAGE Miles as a new program with transfer partners,
> **So that** the Miles Portfolio shows accurate program balances and transfer options for new card holders.

**Priority**: P1 (Must Have)
**Feature**: F22 (Program Mapping)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | DBS Vantage is added | I check its program mapping | Mapped to DBS Points (like DBS Altitude) |
| AC2 | UOB Lady's Solitaire & UOB Visa Signature | I check mappings | Both mapped to UNI$ (UOB) |
| AC3 | SC Journey, SC Smart, SC Beyond | I check mappings | All mapped to 360 Rewards (SC) |
| AC4 | Maybank World MC & Maybank XL | I check mappings | Both mapped to TreatsPoints (Maybank) |
| AC5 | HSBC Premier MC | I check mapping | Mapped to HSBC Reward Points |
| AC6 | OCBC VOYAGE | I check mapping | Mapped to new "VOYAGE Miles" program (program_type: 'transferable') |
| AC7 | VOYAGE Miles program exists | I query its transfer partners | At least 5 airline partners with verified conversion rates (KrisFlyer, Asia Miles, etc.) |

---

### User Story 11.4: Card Browser UI with Eligibility Badges

> **As a** user browsing available cards,
> **I want to** see eligibility requirements (age, gender, income, banking tier) clearly displayed on restricted cards,
> **So that** I know which cards I'm eligible for before attempting to apply.

**Priority**: P1 (Should Have)
**Feature**: F22 (UI Enhancement)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | UOB Lady's Solitaire in card list | I view it | Badge: "Women Only" displayed prominently |
| AC2 | Maybank XL Rewards in card list | I view it | Badge: "Ages 21-39" displayed |
| AC3 | DBS Vantage in card list | I view it | Badge: "Income ≥ S$120k" displayed |
| AC4 | SC Beyond in card list | I view it | Badge: "Priority Banking" displayed |
| AC5 | DBS Altitude (no restrictions) | I view it | No eligibility badge — clean card display |
| AC6 | I tap an eligibility badge | Tooltip appears | Shows full eligibility details from eligibility_criteria JSON |

---

### User Story 11.5: Recommendation Engine Validation for New Cards

> **As a** user with one of the 10 new cards in my portfolio,
> **I want** the recommendation engine to include my new card in spend recommendations,
> **So that** I get accurate "which card to use" advice that considers all 29 supported cards.

**Priority**: P1 (Must Have — correctness)
**Feature**: F22 (Validation)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | User holds Maybank World MC + DBS Altitude | They ask for Petrol recommendation | Maybank World MC is recommended (4 mpd uncapped vs DBS Altitude's lower rate) |
| AC2 | User holds OCBC VOYAGE + Citi PremierMiles | They ask for overseas dining | OCBC VOYAGE recommended (2.2 mpd uncapped vs Citi 2 mpd capped) |
| AC3 | User holds SC Smart | They ask for transport | SC Smart recommended with its high niche earn rate |
| AC4 | User holds SC Beyond (Priority Banking) | They ask for overseas | SC Beyond recommended at 3-4 mpd tier |
| AC5 | All 29 cards | Recommendation engine runs | No errors, no NULL program references, all earn rules resolved |

---

### User Story 11.6: E2E Testing & Stabilization for Card Expansion

> **As the** QA team,
> **I need** comprehensive testing of all 29 cards across the full user journey (onboarding → recommendations → cap tracking → Miles Portfolio),
> **So that** we can ship v1.5 with confidence that the expanded card database works end-to-end.

**Priority**: P1 (Must Have)
**Feature**: F22 (Quality)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Each of the 10 new cards | Added during onboarding | Appears in user's portfolio with correct name, bank, earn rates |
| AC2 | Each new card | Used in transaction logging | Cap tracking works correctly; spending state updates |
| AC3 | Each new card | Viewed in Miles Portfolio | Maps to correct program; contributes to hero total |
| AC4 | Existing 19 miles cards | Full regression test | All original functionality intact — no regressions |
| AC5 | Card browser | Shows all 29 cards | Eligibility badges render correctly; search/filter works |

---

### User Story 12.1: Database Migration for Rate Changes Table

> **As the** system,
> **I need** a `rate_changes` table to store structured rate change events (earn rate changes, cap adjustments, devaluations) and a `user_alert_reads` table to track notification dismissals,
> **So that** rate change alerts can be created, stored, and tracked per user.

**Priority**: P1 (Must Have — foundation)
**Feature**: F23 (Rate Change Monitoring)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Migration applied | I describe rate_changes table | Columns: id, card_id (nullable FK), program_id (nullable FK), change_type enum, severity enum, title, description, old_value, new_value, effective_date, source_url, created_at |
| AC2 | change_type enum | I inspect values | Includes: 'earn_rate_change', 'cap_adjustment', 'program_devaluation', 'new_card_launch', 'card_discontinued' |
| AC3 | severity enum | I inspect values | Includes: 'info', 'warning', 'critical' |
| AC4 | user_alert_reads table | I describe it | Columns: user_id (FK), rate_change_id (FK), read_at; UNIQUE on (user_id, rate_change_id) |
| AC5 | RLS policies | I check | rate_changes publicly readable; user_alert_reads user-isolated |
| AC6 | Known 2025-2026 changes | Seeded as initial data | At least 5 historical rate changes (Amex MR devaluation, DBS WWC cap cut, BOC rate hike, Maybank Horizon cap, HSBC Revolution boost) |

---

### User Story 12.2: Rate Change Alert RPC

> **As a** user,
> **I want** an API that returns rate changes relevant to my card portfolio, filtered to unread alerts,
> **So that** I only see alerts that affect the cards I actually hold.

**Priority**: P1 (Must Have)
**Feature**: F23 (Rate Change API)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I hold a DBS Woman's World Card | I call get_user_rate_changes(my_id) | I see the DBS WWC cap cut alert |
| AC2 | I hold cards unaffected by any changes | I call the RPC | Empty array returned — no irrelevant alerts |
| AC3 | I have dismissed an alert | I call the RPC | That alert is excluded from results |
| AC4 | A program-wide change (e.g., Amex MR devaluation) | I hold an Amex card | Alert appears because my card's program is affected |

---

### User Story 12.3: In-App Notification Banner for Rate Changes

> **As a** user opening the app,
> **I want to** see a notification banner when there are unread rate changes affecting my cards,
> **So that** I'm immediately aware of changes that could impact my miles earning strategy.

**Priority**: P1 (Should Have)
**Feature**: F23 (Notification UI)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have 1 unread critical alert | I open the app | A red-accent banner appears at top: "Rate Alert: [title]" with a "View Details" CTA |
| AC2 | I have 1 unread warning alert | I open the app | An amber-accent banner appears |
| AC3 | I have 1 unread info alert | I open the app | A blue-accent banner appears |
| AC4 | Multiple unread alerts | I view the banner | Shows count: "3 rate changes affect your cards" with "View All" CTA |
| AC5 | I tap "Dismiss" on the banner | It hides | Alert marked as read in user_alert_reads; won't reappear |
| AC6 | I tap "View Details" | Navigation occurs | Opens the affected card's detail screen with rate change info |
| AC7 | No unread alerts | I open the app | No banner shown — clean home screen |

---

### User Story 12.4: Card Detail "Rate Updated" Badge

> **As a** user viewing a card's detail screen,
> **I want to** see a "Rate Updated" badge when the card has had a recent rate change,
> **So that** I can review how the change affects my earning strategy for that card.

**Priority**: P1 (Should Have)
**Feature**: F23 (Card Detail Enhancement)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | DBS Woman's World Card has a cap change | I open its detail screen | "Rate Updated" badge visible near the card title |
| AC2 | I tap the badge | Change details expand | Shows: what changed, old value → new value, effective date, impact summary |
| AC3 | Card has no recent changes | I view its detail | No badge displayed |
| AC4 | Change is older than 90 days | I view the card | Badge auto-hides (changes are stale after 3 months) |

---

### User Story 12.5: Rate Change Administration

> **As an** admin/operator,
> **I need** a way to create rate change entries (via migration or admin flow),
> **So that** users receive timely alerts when banks change earn rates, caps, or program terms.

**Priority**: P1 (Must Have — operational)
**Feature**: F23 (Administration)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Admin creates a rate change via SQL migration | It is committed | The change appears in rate_changes table with all required fields |
| AC2 | The change has severity 'critical' | Users with affected cards log in | They see the critical banner immediately |
| AC3 | A migration template exists | Admin reviews it | Clear instructions for creating earn_rate_change, cap_adjustment, and program_devaluation entries |

---

### User Story 12.6: E2E Testing & Stabilization for Rate Monitoring

> **As the** QA team,
> **I need** end-to-end testing of the rate change alert system from data entry through notification display,
> **So that** we ship a reliable alert system that correctly targets affected users.

**Priority**: P1 (Must Have)
**Feature**: F23 (Quality)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | 5 historical rate changes seeded | Different user profiles tested | Each user only sees alerts for cards they hold |
| AC2 | Alert dismissal flow | User dismisses, reopens app | Dismissed alerts stay dismissed; new alerts still appear |
| AC3 | Card detail badge | Tested on cards with and without changes | Badge appears/hides correctly; tap expansion works |
| AC4 | All 3 severity levels | Rendered in banner | Correct color styling: critical (red), warning (amber), info (blue) |
| AC5 | Existing features | Full regression test | Home, recommendations, Miles Portfolio, cap tracking — all unaffected |

---

### Epic 10 — Feature Traceability Matrix

| User Story | Feature (PRD) | Sprint | Core Friction Addressed |
|------------|---------------|--------|------------------------|
| 11.1 Eligibility Migration | F22 | Sprint 11 | Cards with restrictions have no metadata; POSB isn't a miles card |
| 11.2 Seed 10 New Cards | F22 | Sprint 11 | ~25% of addressable market has unsupported cards — zero MaxiMile value |
| 11.3 Program Mapping + VOYAGE | F22 | Sprint 11 | New cards must integrate into Miles Portfolio ecosystem |
| 11.4 Eligibility Badges UI | F22 | Sprint 11 | Users can't tell if they're eligible for restricted cards |
| 11.5 Recommendation Validation | F22 | Sprint 11 | New cards must participate in recommendations or users lose trust |
| 11.6 E2E Testing | F22 | Sprint 11 | Quality gate — all 29 cards must work end-to-end |
| 12.1 Rate Changes DB | F23 | Sprint 12 | No structured way to track or communicate earn rate changes |
| 12.2 Alert RPC | F23 | Sprint 12 | Users need portfolio-filtered alerts, not broadcast spam |
| 12.3 Notification Banner | F23 | Sprint 12 | Users miss important changes that silently cost them miles |
| 12.4 Card Detail Badge | F23 | Sprint 12 | Users reviewing a card don't know its rates recently changed |
| 12.5 Administration | F23 | Sprint 12 | Operators need a workflow to create alert entries |
| 12.6 E2E Testing | F23 | Sprint 12 | Quality gate — alert system must correctly target affected users |

---

### Epic 10 — Story Map

```
                    EPIC 10: Card Coverage Expansion & Rate Monitoring
                    ==================================================

 Sprint 11       11.1 Eligibility Migration → 11.2 Seed 10 Cards → 11.3 Map to Programs → 11.4 Eligibility UI → 11.5 Recommendation Validation
 (Every Card)    (JSONB column + POSB fix)    (earn rules × 7 cats) (VOYAGE Miles program)  (badges on cards)     (29-card engine test)
                                                                                                          ↓
                                                                                               11.6 E2E Testing
                                                                                               (all 29 cards verified)

 Sprint 12       12.1 Rate Changes DB → 12.2 Alert RPC → 12.3 Notification Banner → 12.4 Card Detail Badge → 12.5 Administration
 (Every Change)  (table + seeds)         (user-filtered)   (severity styling)          ("Rate Updated")         (migration template)
                                                                                                          ↓
                                                                                               12.6 E2E Testing
                                                                                               (alert targeting verified)

 Flow:  [Card added during onboarding] → [Appears in recommendations] → [Tracked in Miles Portfolio]
            → [Rate changes detected] → [Alert banner appears] → [User reviews changes on card detail] → [Adjusts strategy]
```

---

### Anti-Feature-Jam Check (Epic 10)

| User Story | Feature | Maps to Core Friction? | Verdict |
|------------|---------|----------------------|---------|
| 11.1 Eligibility Migration | F22 | Yes — restricted cards need metadata; POSB miscategorized as miles card | Keep |
| 11.2 Seed 10 New Cards | F22 | Yes — ~25% of addressable market gets zero value without their card | Keep |
| 11.3 Program Mapping | F22 | Yes — new cards must integrate into existing Miles Portfolio ecosystem | Keep |
| 11.4 Eligibility Badges | F22 | Yes — users need to know eligibility before adding restricted cards | Keep |
| 11.5 Recommendation Validation | F22 | Yes — recommendations are the North Star; new cards must participate | Keep |
| 11.6 E2E Testing | F22 | Yes — quality gate prevents shipping broken card data | Keep |
| 12.1 Rate Changes DB | F23 | Yes — no structured way to track rate changes that cost users miles | Keep |
| 12.2 Alert RPC | F23 | Yes — broadcast alerts are noise; portfolio-filtered alerts are signal | Keep |
| 12.3 Notification Banner | F23 | Yes — users miss silent devaluations without proactive notification | Keep |
| 12.4 Card Detail Badge | F23 | Yes — contextual change info at the point of card review | Keep |
| 12.5 Administration | F23 | Yes — operators need to create alerts; foundational for the feature | Keep |
| 12.6 E2E Testing | F23 | Yes — quality gate prevents incorrect alert targeting | Keep |

No feature-jamming detected. All 12 stories trace to validated user needs or PRD features F22–F23. Each story directly supports the MARU North Star (more supported cards = more users benefiting from recommendations; rate alerts = trust retention).

---

## Epic 11: Rate Change Detection Pipeline (P1)

**Goal**: Close the Layer 1 detection gap by enabling community-sourced rate change submissions (F24) and automated bank page monitoring with AI classification (F25), replacing manual admin SQL inserts with scalable detection channels.

**Hypothesis link**: The card rules database is MaxiMile's primary defensible moat. If earn rates, caps, or partner terms change and MaxiMile's data becomes stale, recommendations degrade — directly eroding user trust and MARU. Manual detection doesn't scale beyond ~30 cards. Automated and community-sourced detection ensures data freshness as the card roster grows.

**Success Metric**:
- Detection latency < 48 hours from bank announcement
- Coverage >= 90% of real rate changes detected
- Precision >= 95% of published changes are accurate (user flag rate < 5%)
- Community participation >= 10 submissions/month by month 3
- Admin review time < 15 min/day
- Pipeline uptime >= 99% (scraper success rate)
- Total infrastructure cost: $0/month

**Features**: F24 (Community-Sourced Rate Change Submissions) + F25 (Automated Rate Change Detection)

**Sprint Mapping**: Sprint 13 (F24 — community submissions) → Sprint 14 (F25 Part 1 — scraping foundation) → Sprint 15 (F25 Part 2 — AI classification + polish)

**Technical Reference**: `docs/RATE_DETECTION_ARCHITECTURE.md`

---

### User Story 13.1: Submit a Rate Change Report

> **As a** user who notices a rate change on a bank's website or T&C page,
> **I want to** report it via an in-app form with structured fields and evidence,
> **So that** other MaxiMile users are alerted to the change and can adjust their strategy.

**Priority**: P1 (Must Have)
**Feature**: F24 (Community-Sourced Rate Change Submissions)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I am on any screen in the app | I tap "Report a Rate Change" (accessible from card detail or settings) | A structured submission form opens |
| AC2 | I am on the submission form | I see the form fields | I see: card selector (searchable), change type picker (earn_rate/cap_change/devaluation/partner_change/fee_change), old value (text), new value (text), effective date (date picker), optional source URL, optional notes |
| AC3 | I fill in all required fields and submit | I tap "Submit" | The submission is saved with status "pending" and I see a confirmation message |
| AC4 | I submit a change that matches an existing rate_change (same card + type + month) | I tap "Submit" | I see a note: "A similar change has already been reported" with option to proceed or cancel |
| AC5 | I have already submitted 5 reports today | I try to submit another | I see a rate limit message: "You've reached the daily submission limit. Try again tomorrow" |

---

### User Story 13.2: Attach Evidence to Submission

> **As a** user submitting a rate change,
> **I want to** attach a screenshot or link to the bank page as evidence,
> **So that** admins can verify my report quickly.

**Priority**: P1 (Should Have)
**Feature**: F24

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I am filling out the submission form | I see the evidence section | I see optional fields: "Source URL" (text input) and "Screenshot" (image upload button) |
| AC2 | I tap "Add Screenshot" | The device camera/gallery opens | I can take a photo or select an existing image (max 5 MB) |
| AC3 | I submit with a URL | The URL is saved | Admin sees the clickable URL in the review dashboard |
| AC4 | I submit with a screenshot | The image is uploaded to Supabase Storage | Admin sees the screenshot preview in the review dashboard |

---

### User Story 13.3: Admin Review Dashboard

> **As an** admin,
> **I want to** review pending community submissions in a web dashboard and approve, reject, or edit them,
> **So that** only verified, accurate rate changes reach users.

**Priority**: P0 (Must Have)
**Feature**: F24

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | There are pending submissions | I open the admin dashboard (Cloudflare Pages) | I see a list of pending submissions sorted by submission date |
| AC2 | I view a submission | I click on it | I see all fields (card, change type, old/new values, evidence URL, screenshot, submitter info) |
| AC3 | I approve a submission | I click "Approve" | The submission status changes to "approved" and a new row is inserted into `rate_changes` with `detection_source = 'community'` |
| AC4 | I want to edit before approving | I click "Edit & Approve" | I can modify any field (e.g., fix typo in values, adjust severity) before approving |
| AC5 | I reject a submission | I click "Reject" with a reason | The submission status changes to "rejected"; the submitter can see the reason in their submission history |

---

### User Story 13.4: Submission Status Tracking

> **As a** user who submitted a rate change report,
> **I want to** see the status of my submissions (pending, approved, rejected),
> **So that** I know my contributions are valued and acted upon.

**Priority**: P1 (Should Have)
**Feature**: F24

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have submitted one or more rate change reports | I navigate to "My Submissions" (from settings or profile) | I see a list of my submissions with status badges (pending/approved/rejected) |
| AC2 | A submission was rejected | I view the submission | I see the rejection reason provided by the admin |
| AC3 | A submission was approved | I view the submission | I see "Approved" status and the date it was published |

---

### User Story 13.5: Contributor Recognition Badge

> **As a** user with 3+ approved submissions,
> **I want to** see a "Verified Contributor" badge on my profile,
> **So that** I feel recognised for helping keep MaxiMile's data accurate.

**Priority**: P2 (Nice to Have)
**Feature**: F24

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have fewer than 3 approved submissions | I view my profile | I see my submission count but no badge |
| AC2 | My 3rd submission gets approved | I view my profile | I see a "Verified Contributor" badge with a count of approved submissions |
| AC3 | I have the badge | Other users view a rate change I submitted | They see "Submitted by Verified Contributor" attribution |

---

### User Story 13.6: Community Submissions E2E Testing

> **As a** tester,
> **I want to** validate the full community submission pipeline end-to-end,
> **So that** submissions flow correctly from user form → admin review → rate_changes → user alerts.

**Priority**: P0 (Must Have)
**Feature**: F24

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Test data exists | I run the E2E test suite | All submission form validations pass (required fields, rate limits, dedup) |
| AC2 | A test submission is created | Admin approves it | A new rate_changes row exists with `detection_source = 'community'` |
| AC3 | The approved change matches a user's portfolio | The user queries `get_user_rate_changes` | The community-sourced change appears in their alert feed |
| AC4 | The dedup fingerprint matches an existing change | A duplicate is submitted | The dedup detection fires and warns the user |

---

### User Story 14.1: Source Configuration & Snapshot Storage

> **As a** system operator,
> **I want to** configure bank T&C page URLs for automated monitoring and store page snapshots,
> **So that** the detection pipeline knows which pages to check and can compare changes over time.

**Priority**: P0 (Must Have)
**Feature**: F25 (Automated Rate Change Detection — Foundation)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I am setting up monitoring | I insert a row into `source_configs` | The source is registered with URL, bank name, scrape method (playwright/http), check interval, and CSS selector |
| AC2 | The scraper fetches a page successfully | A snapshot is taken | A new row in `source_snapshots` stores the content hash (SHA-256), raw content, and timestamp |
| AC3 | The scraper encounters an error (timeout, 404, structure change) | The error is logged | A `pipeline_runs` entry records the failure with error details; the source status is not changed until 3 consecutive failures |
| AC4 | A source has 3+ consecutive failures | The system checks | The source status is set to "broken" and an admin notification is triggered |

---

### User Story 14.2: GitHub Actions Scraper Workflow

> **As a** system operator,
> **I want to** run a daily Playwright scraper via GitHub Actions that fetches all configured bank pages,
> **So that** page content is captured automatically without any hosting costs.

**Priority**: P0 (Must Have)
**Feature**: F25

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Source configs exist in the database | GitHub Actions cron fires daily at 6 AM SGT | The workflow installs Playwright, fetches source configs from Supabase, and scrapes each URL |
| AC2 | A page's content hash matches the previous snapshot | The scraper compares hashes | No LLM call is made; the page is marked as "unchanged" in pipeline_runs |
| AC3 | A page's content hash differs from the previous snapshot | The scraper detects a change | The new content is stored as a snapshot and forwarded to the AI classifier |
| AC4 | The workflow completes | Results are logged | A `last_run.json` file is auto-committed to the repo (prevents GitHub's 60-day inactivity disable) |

---

### User Story 14.3: Content Hash Gating

> **As the** detection pipeline,
> **I want to** compute SHA-256 hashes of page content and skip AI classification when nothing changed,
> **So that** we use zero LLM tokens on unchanged pages (cost optimization).

**Priority**: P0 (Must Have)
**Feature**: F25

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Today's page hash matches yesterday's hash | The diff engine compares | No Gemini/Groq API call is made; pipeline logs "no change detected" |
| AC2 | Today's page hash differs from yesterday's | The diff engine compares | The raw content diff (old vs new) is sent to the AI classifier |
| AC3 | This is the first scrape for a source (no previous snapshot) | The scraper runs | The content is stored as the baseline snapshot; no AI classification triggered |

---

### User Story 15.1: AI Classification Pipeline

> **As the** detection pipeline,
> **I want to** classify detected page changes using Gemini 2.5 Flash with structured output,
> **So that** rate changes are automatically extracted into the `rate_changes` schema.

**Priority**: P0 (Must Have)
**Feature**: F25 (Automated Rate Change Detection — AI + Polish)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | A content change is detected | The AI classifier is called | Gemini 2.5 Flash processes the before/after text with a system prompt and 5 few-shot examples |
| AC2 | The model response | The pipeline parses it | Structured JSON output via tool_use includes: card_name, change_type, category, old_value, new_value, effective_date, alert_title, alert_body, severity, confidence |
| AC3 | Gemini API is unavailable or rate-limited | The pipeline retries | Groq Llama 3.3 70B is used as fallback with equivalent prompt |
| AC4 | The model returns `{"changes": []}` | No changes detected in the page text | The pipeline logs "no rate change" and moves to next source |

---

### User Story 15.2: Confidence-Based Routing

> **As an** admin,
> **I want** AI-detected changes to be routed based on confidence scores,
> **So that** high-confidence changes are auto-published while uncertain ones are manually reviewed.

**Priority**: P0 (Must Have)
**Feature**: F25

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Confidence >= 0.85 AND source is Tier 1 (official bank page) | The pipeline evaluates | The change is auto-inserted into `rate_changes` with `detection_source = 'automated'`; admin receives digest notification |
| AC2 | Confidence 0.50–0.84 | The pipeline evaluates | The change is queued in `detected_changes` with status "detected"; appears in admin review dashboard |
| AC3 | Confidence < 0.50 | The pipeline evaluates | The change is discarded; logged in `pipeline_runs` for audit; not shown to admin unless explicitly requested |
| AC4 | A dedup fingerprint matches an existing rate_change | The pipeline checks | The detected change is marked as "duplicate" and not published again |

---

### User Story 15.3: Pipeline Health & E2E Testing

> **As a** tester and operator,
> **I want to** monitor pipeline health and validate the full detection flow end-to-end,
> **So that** we can trust the system's reliability and catch regressions.

**Priority**: P0 (Must Have)
**Feature**: F25

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | The pipeline has run for 7+ days | I view the health dashboard | I see per-source uptime, last check time, error rate, and changes detected |
| AC2 | A source has been "broken" for 3+ days | I view the dashboard | I see a red alert with the error details and a "Fix CSS Selector" action |
| AC3 | E2E test suite runs | I execute `sprint15-detection.test.ts` | Tests cover: hash gating (unchanged → no LLM), change detection (modified → LLM call), confidence routing (auto-approve, review, discard), dedup, and fallback to Groq |
| AC4 | All Sprint 13–15 stories are complete | I run the full test suite | All project tests pass (480 existing + new detection tests), 0 regressions |

---

### Epic 11 — Feature Traceability Matrix

| User Story | Feature (PRD) | Sprint | Core Friction Addressed |
|------------|---------------|--------|------------------------|
| 13.1 Submit Rate Change | F24 | Sprint 13 | Users discover changes before MaxiMile does; no way to contribute |
| 13.2 Attach Evidence | F24 | Sprint 13 | Unverified reports waste admin time; evidence speeds review |
| 13.3 Admin Review Dashboard | F24 | Sprint 13 | No tool for reviewing community input; raw SQL is untenable |
| 13.4 Submission Status | F24 | Sprint 13 | Contributors don't know if their report was used; discourages participation |
| 13.5 Contributor Badge | F24 | Sprint 13 | No recognition for community effort; reduces motivation |
| 13.6 E2E Testing | F24 | Sprint 13 | Quality gate for community pipeline |
| 14.1 Source Config & Snapshots | F25 | Sprint 14 | No structured way to register and track monitored pages |
| 14.2 GitHub Actions Scraper | F25 | Sprint 14 | Manual page checking doesn't scale; $0 automation replaces it |
| 14.3 Content Hash Gating | F25 | Sprint 14 | Unnecessary LLM calls waste tokens; hashing eliminates ~90% of calls |
| 15.1 AI Classification | F25 | Sprint 15 | Manual reading of T&C diffs is slow and error-prone |
| 15.2 Confidence Routing | F25 | Sprint 15 | Binary auto-approve/reject is too risky; tiered routing balances speed and accuracy |
| 15.3 Pipeline Health & E2E | F25 | Sprint 15 | No visibility into scraper reliability; no regression safety net |

---

### Epic 11 — Story Map

```
                    EPIC 11: Rate Change Detection Pipeline
                    =======================================

 Sprint 13        13.1 Submit Report → 13.2 Attach Evidence → 13.3 Admin Dashboard
 (Community)      (user input)         (verification)          (approval gate)
                       ↓                                            ↓
                  13.4 Status Tracking → 13.5 Contributor Badge → 13.6 E2E Testing
                  (feedback loop)        (gamification)           (quality gate)

 Sprint 14        14.1 Source Config → 14.2 GitHub Actions Scraper → 14.3 Hash Gating
 (Foundation)     (what to monitor)   ($0 daily automation)          (cost gate)

 Sprint 15        15.1 AI Classifier → 15.2 Confidence Routing → 15.3 Pipeline Health
 (AI + Polish)    (Gemini Flash)       (auto/review/discard)     (monitoring + E2E)

 Flow:  [Bank page changes] → [Scraper detects] → [Hash confirms change]
            → [AI classifies] → [Confidence routes] → [Admin reviews if needed]
            → [Published to rate_changes] → [Existing Layer 2+3 delivers to users]
```

---

### Anti-Feature-Jam Check (Epic 11)

| User Story | Feature | Maps to Core Friction? | Verdict |
|------------|---------|----------------------|---------|
| 13.1 Submit Rate Change | F24 | Yes — users discover changes faster than admin; no way to contribute knowledge | Keep |
| 13.2 Attach Evidence | F24 | Yes — unverified reports slow admin review; evidence is the quality gate | Keep |
| 13.3 Admin Review Dashboard | F24 | Yes — raw SQL review is untenable at scale; admin needs a tool | Keep |
| 13.4 Submission Status | F24 | Yes — contributors need feedback to stay engaged; silent rejection kills community | Keep |
| 13.5 Contributor Badge | F24 | Marginal — gamification, not core friction. But low effort (2 points) and drives participation | Keep (P2) |
| 13.6 E2E Testing | F24 | Yes — quality gate prevents publishing unverified changes to users | Keep |
| 14.1 Source Config & Snapshots | F25 | Yes — no structured registry of monitored pages; prerequisite for automation | Keep |
| 14.2 GitHub Actions Scraper | F25 | Yes — manual page monitoring doesn't scale; this is the core automation | Keep |
| 14.3 Content Hash Gating | F25 | Yes — prevents unnecessary LLM costs; gates the expensive operation | Keep |
| 15.1 AI Classification | F25 | Yes — manual reading of T&C changes is slow and error-prone; AI extraction is the value | Keep |
| 15.2 Confidence Routing | F25 | Yes — binary auto-publish is too risky; tiered routing balances speed with accuracy | Keep |
| 15.3 Pipeline Health & E2E | F25 | Yes — no observability = no trust in automated system; regression testing is essential | Keep |

No feature-jamming detected. All 12 stories trace to validated operational needs and PRD features F24–F25. Each story supports data freshness → recommendation accuracy → MARU retention. S13.5 (Contributor Badge) is the lowest-friction item but justified at P2 effort (2 story points) for community engagement value.

---

## Epic 12: Transaction Auto-Capture (P1)

**Goal**: Reduce or eliminate the manual transaction logging burden by automatically capturing transaction data from mobile payment notifications (iOS via Apple Pay Shortcuts, Android via NotificationListenerService), transforming MaxiMile from a "log-then-recommend" tool into a "just-tap-and-confirm" experience.

**Hypothesis link**: Directly addresses the **#1 product risk** identified in the Problem-Solution Analysis — the Manual Logging Paradox (Gap 1, Friction F7). The product promises to eliminate manual tracking, yet requires manual transaction logging for cap accuracy. Auto-capture solves this paradox for the most frequent transaction types (in-store contactless payments).

**Success Metric**: 50%+ of transactions logged via auto-capture (vs. manual) within 60 days of feature launch; per-transaction logging time reduced from ~20 seconds to ~2-3 seconds; Day-7 retention improved by 15%+ vs. pre-auto-capture baseline.

**Features**: F26 (Apple Pay Shortcuts Auto-Capture — iOS) + F27 (Android Notification Auto-Capture)

**Technical Reference**: `docs/NOTIFICATION_CAPTURE_FEASIBILITY.md` — full feasibility analysis with architecture diagrams, App Store precedents, privacy assessment, and coverage estimates.

**Dependencies**: Epic 3 (Spending & Cap Tracking — transaction logging and spending state must exist), Epic 1 (Card Portfolio — user must have cards in portfolio for matching)

---

### User Story 16.1: Deep Link Handler for Auto-Capture

> **As a** user with Apple Pay,
> **I want** MaxiMile to receive transaction data from iOS Shortcuts via a deep link (`maximile://log`),
> **So that** my Apple Pay transactions are automatically pre-filled in the transaction log without manual data entry.

**Priority**: P0 (Must Have)
**Story Points**: 5
**Feature**: F26
**Sprint**: 16

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | The app is installed and a Shortcut triggers `maximile://log?amount=42.50&merchant=COLD+STORAGE&card=DBS+Altitude+Visa&source=shortcut` | The deep link is received | The app launches/foregrounds and navigates to the transaction log screen with amount (42.50), merchant (Cold Storage), and card (DBS Altitude) pre-filled |
| AC2 | The URL contains an amount with currency prefix (e.g., "S$42.50") | The parser processes it | The amount is extracted as 42.50 (currency symbols stripped) |
| AC3 | Required parameters are missing (e.g., no amount) | The deep link is received | The app opens the transaction log screen with available fields pre-filled and empty fields editable; a note says "Some data could not be captured" |
| AC4 | The app is closed (cold start) | The deep link is triggered | The app cold-launches and navigates to the pre-filled log screen within 3 seconds |
| AC5 | The `source=shortcut` parameter is present | The transaction is saved | The transaction record includes `source = 'shortcut'` for analytics differentiation |

**Dependencies**: URL scheme `maximile://` already configured in `app.json`; transaction logging (S3.1) must be functional.

---

### User Story 16.2: Merchant-to-Category Mapping Engine

> **As a** user,
> **I want** auto-captured transactions to show the correct spending category based on the merchant name,
> **So that** my cap tracking stays accurate without me having to manually select the category every time.

**Priority**: P0 (Must Have)
**Story Points**: 8
**Feature**: F26
**Sprint**: 16

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Merchant name "COLD STORAGE GREAT WORLD" is received | The mapping engine runs | Category resolves to "Groceries" |
| AC2 | Merchant name "GRABCAR" or "GRAB TRANSPORT" is received | The mapping engine runs | Category resolves to "Transport" |
| AC3 | Merchant name "SUSHI TEI VIVOCITY" is received | The mapping engine runs | Category resolves to "Dining" |
| AC4 | Merchant name "ABC PTE LTD" (unrecognized) is received | The mapping engine runs | Category defaults to "General/Others"; user is prompted to select the correct category |
| AC5 | The merchant keyword lookup table is queried | It returns results | At minimum 200 common SG merchants are mapped across all 7 spend categories |
| AC6 | A user corrects a merchant's category | The correction is saved | Future transactions from that merchant use the corrected category for that user (user-level override persists) |
| AC7 | The fuzzy match runs on a merchant name | I measure performance | Category resolution completes in <100ms |

**Dependencies**: Spend category taxonomy (7 categories) from S1.3/T1.09; merchant correction feeds back into MCC data quality (Epic 5).

---

### User Story 16.3: Card Name Fuzzy Matching

> **As a** user,
> **I want** the card name from Apple Pay (e.g., "DBS Altitude Visa") to correctly match to my MaxiMile portfolio card (e.g., "DBS Altitude"),
> **So that** auto-captured transactions are attributed to the right card without manual selection.

**Priority**: P0 (Must Have)
**Story Points**: 5
**Feature**: F26
**Sprint**: 16

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | Apple Wallet reports "DBS Altitude Visa" and my portfolio has "DBS Altitude" | The card matcher runs | Match confidence >0.8; transaction attributed to "DBS Altitude" |
| AC2 | Apple Wallet reports "Citi PremierMiles Visa Signature" and portfolio has "Citi PremierMiles" | The matcher runs | Correctly matched (network suffixes like "Visa Signature" ignored) |
| AC3 | Wallet card name does not match any portfolio card (confidence <0.5) | The matcher runs | User is shown a selection prompt: "Which card did you use?" with their portfolio listed |
| AC4 | During setup wizard, user verifies Wallet → MaxiMile card mappings | The mapping is saved | The verified mapping is persisted and used for all future transactions without re-matching |
| AC5 | A verified mapping exists for a Wallet card name | A transaction uses that Wallet name | The verified mapping is used directly (no fuzzy match re-computation) |

**Dependencies**: Card portfolio (S1.1/S1.2) must be populated; setup wizard (S16.5) provides the verification step.

---

### User Story 16.4: Downloadable Shortcut Template

> **As a** user who wants to set up Apple Pay auto-capture,
> **I want to** download a ready-made iOS Shortcut that triggers on every Apple Pay transaction and sends data to MaxiMile,
> **So that** I don't have to build the Shortcuts automation from scratch.

**Priority**: P0 (Must Have)
**Story Points**: 5
**Feature**: F26
**Sprint**: 16

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I tap "Download Shortcut" in the setup wizard | iOS downloads the `.shortcut` file | The Shortcuts app opens with an import prompt showing the pre-built automation |
| AC2 | I import and inspect the Shortcut | I view its actions | It: (1) triggers on any Apple Pay transaction, (2) extracts Amount, Merchant, Card from Shortcut Input, (3) constructs `maximile://log?amount=X&merchant=Y&card=Z&source=shortcut`, (4) opens the URL |
| AC3 | I make an Apple Pay NFC payment at a store | The Shortcut fires automatically | MaxiMile opens with the transaction pre-filled; I confirm with one tap |
| AC4 | The `.shortcut` file is accessed via its download URL | I tap the link | The file downloads successfully over HTTPS (hosted on CDN or MaxiMile website) |
| AC5 | My iPhone runs iOS 17+ | I use the Transaction trigger | The Shortcut correctly uses the "Transaction" Personal Automation trigger (available iOS 17+) |

**Dependencies**: S16.1 (deep link handler) must be functional for the URL scheme to work.

**Platform Constraint (iOS Shortcut)**: Apple does NOT allow apps to programmatically create or install Personal Automations. This is a hard iOS platform constraint that no app can bypass. The user MUST manually tap "Add Automation" in the iOS Shortcuts app after downloading the `.shortcut` file. MaxiMile provides a fully pre-configured Shortcut (user doesn't build anything), but the final "Add Automation" tap is an unavoidable Apple requirement. Total active setup time is ~30 seconds. See `docs/DRD_AUTO_CAPTURE.md` Section 1.4 for full details.

**Precedent**: TravelSpend, BalanceTrackr, MoneyCoach, Skwad, and Expenses.cash all ship this same pattern and are live on the App Store (see feasibility doc Section 3.4).

---

### User Story 16.5: In-App Setup Wizard for iOS Auto-Capture

> **As a** user,
> **I want to** see a step-by-step setup wizard that guides me through enabling Apple Pay auto-capture,
> **So that** I can set it up in under 3 minutes without needing external instructions.

**Priority**: P1 (Should Have)
**Story Points**: 8
**Feature**: F26
**Sprint**: 16

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I navigate to Settings → "Auto-Capture Setup" | The wizard opens | Step 1: "How It Works" — visual diagram showing Apple Pay → iOS Shortcut → MaxiMile flow |
| AC2 | I proceed to Step 2 | I see the download step | "Download Shortcut" button with instructions to import into the Shortcuts app |
| AC3 | I proceed to Step 3 | I see card verification | Apple Wallet card names shown alongside MaxiMile portfolio names; I confirm or correct each mapping |
| AC4 | I proceed to Step 4 | I see the test step | Instructions to make a small Apple Pay purchase (or simulate); app listens for a deep link to confirm the flow works |
| AC5 | I complete all 4 steps | A confirmation is shown | "You're all set! Future Apple Pay transactions will be auto-logged." with a summary of mapped cards |
| AC6 | I want to skip | I tap "Set up later" | The wizard dismisses; re-accessible from Settings at any time |
| AC7 | I complete the wizard | I view Settings | "Auto-Capture: Active (iOS Shortcuts)" status badge is displayed |

**Dependencies**: S16.3 (card name matching) for the verification step; S16.4 (Shortcut template) for the download step; S16.1 (deep link) for the test step.

---

### User Story 16.6: Auto-Capture Confirmation Flow

> **As a** user,
> **I want to** confirm or edit auto-captured transactions before they are saved,
> **So that** I can correct any errors in the merchant, category, or card and maintain accurate cap tracking.

**Priority**: P0 (Must Have)
**Story Points**: 5
**Feature**: F26
**Sprint**: 16

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | An Apple Pay transaction triggers the deep link | MaxiMile opens | I see a pre-filled transaction form showing: amount, merchant name, inferred category (S16.2), matched card (S16.3), and a "Via Apple Pay" source badge |
| AC2 | All fields are correct | I tap "Confirm" | The transaction is logged in <3 seconds total interaction; spending state and cap tracking update immediately |
| AC3 | The auto-detected category is wrong | I tap the category field and change it | My correction is saved and persisted as a user override for future transactions from this merchant |
| AC4 | The card match is wrong | I tap the card field and change it | My correction is saved as a verified card mapping for future transactions using that Wallet card name |
| AC5 | I don't want to log this transaction | I tap "Dismiss" | The transaction is discarded; no data is saved; no side effects |
| AC6 | The source badge is displayed | I view the confirmation screen | "Via Apple Pay" is shown, distinguishing auto-captured from manually entered transactions |

**Dependencies**: S16.1 (deep link), S16.2 (merchant mapping), S16.3 (card matching), S3.1 (transaction logging), S3.2 (cap tracking).

---

### User Story 17.1: Android NotificationListenerService Native Module

> **As an** Android user,
> **I want** MaxiMile to read my banking app notifications in the background,
> **So that** my credit card transactions are automatically detected and pre-filled for logging without any manual action.

**Priority**: P0 (Must Have)
**Story Points**: 13
**Feature**: F27
**Sprint**: 17

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I have granted notification access permission | A banking app (DBS, OCBC, UOB, Citi, AMEX) sends a transaction notification | MaxiMile's NotificationListenerService receives the notification content (title, text, sub-text, extras) |
| AC2 | A notification arrives from a non-banking app | The service evaluates it | The notification is ignored (only whitelisted banking app packages are processed) |
| AC3 | A matching banking notification is received | The service processes it | The notification text is passed to the JavaScript layer via the React Native bridge for regex parsing |
| AC4 | The app is backgrounded or closed | A banking notification arrives | The service still receives and processes it (foreground service behavior) |
| AC5 | The service runs for 24 hours | Battery usage is measured | The service adds <2% additional battery drain per day |
| AC6 | The Expo Dev Build is created | The Android manifest is inspected | The Expo config plugin has correctly registered the NotificationListenerService and `BIND_NOTIFICATION_LISTENER_SERVICE` permission |

**Dependencies**: Requires Expo Dev Build (NOT compatible with Expo Go). The `react-native-notification-listener` community package or a custom native module is required.

**Technical Reference**: `docs/NOTIFICATION_CAPTURE_FEASIBILITY.md` Section 5 (Android NotificationListenerService).

---

### User Story 17.2: SG Bank Notification Regex Parsers

> **As an** Android user with Singapore bank credit cards,
> **I want** MaxiMile to correctly parse the amount, merchant, and card from my banking notifications,
> **So that** auto-captured transactions have accurate data pre-filled.

**Priority**: P0 (Must Have)
**Story Points**: 8
**Feature**: F27
**Sprint**: 17

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | DBS notification: "Your DBS/POSB Card ending 1234 was used for SGD 42.50 at COLD STORAGE on 21 Feb" | Parser extracts | amount=42.50, merchant="COLD STORAGE", card_last4="1234", bank="DBS" |
| AC2 | OCBC notification: "Card xxxx1234 txn SGD 42.50 at MERCHANT NAME on 21/02" | Parser extracts | amount=42.50, merchant="MERCHANT NAME", card_last4="1234", bank="OCBC" |
| AC3 | UOB notification: "UOB Card ending 1234: SGD 42.50 at MERCHANT. Date: 21 Feb 2026" | Parser extracts | amount=42.50, merchant="MERCHANT", card_last4="1234", bank="UOB" |
| AC4 | Citi notification: "Citi Card x1234 SGD 42.50 MERCHANT NAME 21FEB" | Parser extracts | amount=42.50, merchant="MERCHANT NAME", card_last4="1234", bank="Citi" |
| AC5 | AMEX notification: "A charge of SGD 42.50 was made on your AMEX card ending 1234 at MERCHANT" | Parser extracts | amount=42.50, merchant="MERCHANT", card_last4="1234", bank="AMEX" |
| AC6 | An unrecognized notification format arrives | Parser evaluates | The notification is silently ignored (logged for future format analysis); no error shown to user |
| AC7 | card_last4 is parsed | The system matches to portfolio | The card is matched by bank + last-4-digits to the user's portfolio cards |

**Dependencies**: S17.1 (native module) must be functional to receive notifications. Merchant→category mapping (S16.2) and card matching (S16.3) from Sprint 16 are reused.

**Notification formats reference**: `docs/NOTIFICATION_CAPTURE_FEASIBILITY.md` Section 4.2 (Singapore Banking Notification Formats).

---

### User Story 17.3: Privacy Disclosure & Permission Flow

> **As a** user,
> **I want** clear privacy disclosures about what notification data MaxiMile accesses and how it is used,
> **So that** I can make an informed decision about granting notification access and trust the app with sensitive data.

**Priority**: P0 (Must Have — required by Google Play policy)
**Story Points**: 5
**Feature**: F27
**Sprint**: 17

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I tap "Enable Auto-Capture" on Android | A privacy disclosure screen appears | It clearly states: (1) only banking notification text is accessed, (2) amount/merchant/card are extracted, (3) all processing is on-device, (4) no raw notification content is stored or uploaded to any server |
| AC2 | I tap "Grant Access" after reading the disclosure | Android Settings opens | I am taken to the notification access permission screen for MaxiMile |
| AC3 | I grant the permission and return to MaxiMile | The app detects the granted permission | Confirmation: "Auto-capture is now active. Your banking notifications will be used to pre-fill transactions." |
| AC4 | I deny or skip the permission | I return to MaxiMile | Graceful fallback: "No problem — you can log transactions manually. Enable auto-capture anytime in Settings." |
| AC5 | I want to revoke access later | I go to Settings → Auto-Capture | A toggle to disable; a link to Android notification access settings for full revocation |
| AC6 | The app is listed on Google Play | Data Safety section is reviewed | Notification access is disclosed with purpose "App functionality — transaction logging" per Google Play policy |

**Dependencies**: S17.1 (NotificationListenerService registered). Google Play Data Safety disclosure must be drafted before Play Store submission.

**Privacy reference**: `docs/NOTIFICATION_CAPTURE_FEASIBILITY.md` Section 8.2 (Privacy & Compliance Risks).

---

### User Story 17.4: Google Pay Notification Parsing

> **As an** Android user who pays with Google Pay,
> **I want** my Google Pay transaction notifications to be auto-captured,
> **So that** mobile wallet payments are logged automatically just like banking app notifications.

**Priority**: P1 (Should Have)
**Story Points**: 5
**Feature**: F27
**Sprint**: 17

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I make a Google Pay NFC payment | Google Pay sends a notification | MaxiMile captures and parses it: amount, merchant, and card info (last 4 digits if available) |
| AC2 | Amount and merchant are in the notification | Parser extracts them | Both are correctly parsed; card is matched via last-4-digits to portfolio |
| AC3 | Google Pay notification format changes | Parser encounters unrecognized format | Notification is silently logged for future analysis; no error shown to user |
| AC4 | Google Pay AND the banking app both send notifications for the same transaction | Both are received within 60 seconds | MaxiMile deduplicates: only one pre-filled transaction is shown (prefer the notification with more complete data) |

**Dependencies**: S17.1 (NotificationListenerService), S17.2 (parser infrastructure). Google Pay is not available via Shortcuts on iOS, so this is Android-exclusive.

**Technical reference**: `docs/NOTIFICATION_CAPTURE_FEASIBILITY.md` Section 6.2 (Google Pay / Google Wallet).

---

### User Story 17.5: Android Auto-Capture E2E Testing

> **As a** tester,
> **I want to** validate the full Android auto-capture flow end-to-end across all 5 SG banks and Google Pay,
> **So that** the feature ships with verified reliability across the most common banking apps in Singapore.

**Priority**: P0 (Must Have)
**Story Points**: 5
**Feature**: F27
**Sprint**: 17

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | All parsers are implemented | E2E test suite runs | Tests cover all 5 bank formats + Google Pay with 5+ cases each (standard, edge cases, foreign currency, declined transactions) |
| AC2 | A DBS notification is simulated | Full flow executes | Notification received → parsed → merchant mapped to category (S16.2) → card matched (S16.3/last-4) → confirmation screen shows correct pre-filled data |
| AC3 | Battery test completes | Results are reviewed | Background service adds <2% drain over 24 hours on 3 test devices (Samsung, Pixel, Xiaomi) |
| AC4 | Permission grant and deny paths are tested | Both paths execute | Grant → service starts capturing; Deny → graceful fallback with manual logging available |
| AC5 | Sprint 16 iOS features are tested | Regression suite runs | iOS Shortcuts auto-capture is completely unaffected by Sprint 17 Android changes |

**Dependencies**: All Sprint 17 stories (S17.1-S17.4) must be complete. Sprint 16 features must be regression-tested.

---

### User Story 16.7: Onboarding Step 1.5 — Auto-Capture Setup

> **As a** new user who just added my cards,
> **I want to** see an optional auto-capture setup step in onboarding (between Add Cards and Set Miles Balances),
> **So that** I can enable auto-capture from my very first session without having to find it in Settings later.

**Priority**: P1 (Should Have)
**Story Points**: 4
**Feature**: F26 / F27 (onboarding integration — platform-adaptive)
**Sprint**: 16
**DRD Reference**: `docs/DRD_AUTO_CAPTURE.md` v1.1, Section 2.1 Phase A + Section 3.2

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I complete onboarding Step 1 (Add Your Cards) and tap "Done" | Onboarding advances | I see new Step 1.5: title "Log Without Typing", a value-prop pitch, and two buttons: "Set Up Auto-Capture" (primary CTA) and "I'll do this later" (ghost/skip) |
| AC2 | I am on an iOS device | I view Step 1.5 | The pitch reads: "Pay with Apple Pay, and MaxiMile logs it for you. Works with Apple Pay contactless payments at stores." The CTA says "Set Up Auto-Capture" and opens the iOS setup wizard (S16.5) inline within onboarding |
| AC3 | I am on an Android device | I view Step 1.5 | The pitch reads: "MaxiMile reads your banking notifications to log transactions automatically. Works with DBS, OCBC, UOB, Citi, AMEX." The CTA says "Enable Auto-Capture" and opens the privacy disclosure flow (S17.3) |
| AC4 | I don't want to set up auto-capture now | I tap "I'll do this later" | Onboarding proceeds directly to Step 2 (Set Miles Balances); auto-capture remains inactive; no data is lost |
| AC5 | I skipped auto-capture during onboarding | I later go to Settings → Auto-Capture | The same setup flow is fully available and functional; I can complete it at any time |
| AC6 | I complete the auto-capture setup from Step 1.5 | The setup finishes | Onboarding proceeds to Step 2 (Set Miles Balances); Settings now shows "Auto-Capture: Active" |
| AC7 | The "I'll do this later" skip link is displayed | I view the Step 1.5 screen | The skip link is always visible without scrolling (fixed at bottom or above the CTA) |

**Dependencies**: S16.5 (Setup Wizard for iOS) and S17.3 (Privacy Disclosure for Android) must be functional. Onboarding flow (S1.1) and Step 2 (S7.4) must exist.

---

### User Story 16.8: Recommendation Match Indicator on Confirmation Screen

> **As a** user who just auto-captured a transaction,
> **I want to** see whether the card I used was the best option for that spending category,
> **So that** every auto-captured transaction becomes a micro-learning moment that helps me build the habit of always using the optimal card.

**Priority**: P1 (Should Have)
**Story Points**: 5
**Feature**: F26 / F27 (cross-platform — shared confirmation screen component)
**Sprint**: 16
**DRD Reference**: `docs/DRD_AUTO_CAPTURE.md` v1.1, Section 3.2.3 (Recommendation Match Indicator) + Section 4.1 (Confirmation Screen)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | An auto-captured transaction with inferred category "Groceries" and card "DBS Altitude" is on the confirmation screen | The confirmation screen loads | The system calls the existing `recommend('Groceries')` RPC to retrieve the top recommended card for that category from the user's portfolio |
| AC2 | The auto-captured card (DBS Altitude) matches the top recommended card for "Groceries" | The recommendation comparison completes | A green banner is displayed: "You used the best card! DBS Altitude earns X mpd for Groceries (vs Y avg)" |
| AC3 | The auto-captured card (Citi PremierMiles) does NOT match the top recommended card (DBS Altitude) for "Groceries" | The recommendation comparison completes | A blue "Tip" nudge is displayed: "DBS Altitude earns X mpd for Groceries (vs Y for this card). Try it next time!" — the nudge is gentle, not blocking |
| AC4 | The top recommended card for the inferred category has its monthly cap fully exhausted | The recommendation comparison completes | The recommendation match banner is hidden entirely (the recommendation would have changed anyway, so comparing is misleading) |
| AC5 | The inferred category is "General/Others" or could not be determined | The confirmation screen loads | The recommendation match banner is hidden (category is too ambiguous for a meaningful comparison) |
| AC6 | The nudge banner (blue "Tip") is displayed | I view the confirmation screen | The nudge does not block the Confirm button; I can confirm the transaction without interacting with the nudge |
| AC7 | I tap "Confirm" on a transaction with a match banner | The transaction is logged | Analytics event `auto_capture_recommendation_match` or `auto_capture_recommendation_nudge_shown` is fired (depending on match/mismatch) |

**Dependencies**: S16.6 (Confirmation Flow) must be functional. The existing `recommend()` RPC (S2.1 / T2.08) is reused — no new endpoint required.

---

### User Story 16.9: Smart Pay → Auto-Capture Handoff

> **As a** user who just paid via the Smart Pay flow (merchant detected, card recommended, Wallet opened, payment made),
> **I want** the app to automatically detect the auto-captured transaction instead of showing me the manual amount entry keypad,
> **So that** the Smart Pay recommend-pay-log loop closes seamlessly without redundant manual data entry.

**Priority**: P1 (Should Have)
**Story Points**: 5
**Feature**: F26 / F27 (cross-platform — Smart Pay integration)
**Sprint**: 16
**DRD Reference**: `docs/DRD_AUTO_CAPTURE.md` v1.1, Section 3.2.4 (Smart Pay → Auto-Capture Handoff)

**Acceptance Criteria**:

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | I am in the Smart Pay flow and return to MaxiMile after paying in Wallet | The app detects my return from Wallet (State 5→6 transition) | A 60-second countdown listener starts, waiting for an incoming auto-capture event (deep link on iOS, notification on Android) |
| AC2 | An auto-capture deep link or notification fires within the 60-second window | The Smart Pay flow intercepts it | Smart Pay skips its manual amount entry step (State 6) and navigates directly to the auto-capture confirmation screen with amount, merchant, and card pre-filled |
| AC3 | The auto-capture confirmation appears via Smart Pay handoff | I view the source badge | Dual attribution is shown — e.g., "Via Apple Pay" badge + "Smart Pay" badge (iOS) or "Via Bank Notification" + "Smart Pay" (Android) |
| AC4 | The auto-capture confirmation appears via Smart Pay handoff | I view the recommendation match indicator | The match indicator is pre-populated using the card that Smart Pay recommended (since we already know which card was recommended, no additional RPC call is needed) |
| AC5 | No auto-capture event fires within 60 seconds (user paid with physical card, notification delayed, etc.) | The 60-second timer expires | The Smart Pay flow falls back to its existing manual logging step: amount keypad with category and card pre-filled from the recommendation |
| AC6 | The handoff transaction is confirmed and logged | I view the transaction in history | The `source` field is set to `shortcut_smart_pay` (iOS) or `notification_smart_pay` (Android), distinguishing it from pure auto-capture or pure Smart Pay transactions |
| AC7 | The user dismisses the auto-capture confirmation (taps "Dismiss") during a Smart Pay handoff | The confirmation is dismissed | The Smart Pay flow does NOT fall back to manual entry; the transaction is simply discarded (same as dismissing any auto-capture confirmation) |

**Dependencies**: S16.6 (Confirmation Flow), S16.8 (Recommendation Match Indicator), S16.1 (Deep Link Handler). The existing Smart Pay flow (`pay/index.tsx`) must be functional.

---

### Epic 12 — Feature Traceability Matrix

| User Story | Feature (PRD) | Sprint | Core Friction Addressed |
|------------|---------------|--------|------------------------|
| 16.1 Deep Link Handler | F26 | Sprint 16 | F7: Manual tracking fatigue — enables auto-populated transaction forms from Apple Pay |
| 16.2 Merchant→Category Mapping | F26 | Sprint 16 | F7: Manual tracking fatigue — eliminates manual category selection for known merchants |
| 16.3 Card Name Fuzzy Matching | F26 | Sprint 16 | F7: Manual tracking fatigue — eliminates manual card selection by matching Wallet names to portfolio |
| 16.4 Downloadable Shortcut | F26 | Sprint 16 | Setup friction — removes need to manually build iOS Shortcuts automation |
| 16.5 Setup Wizard | F26 | Sprint 16 | Setup friction — guides non-technical users through one-time configuration in <3 min |
| 16.6 Confirmation Flow | F26 | Sprint 16 | Data accuracy — user confirms/corrects before saving; corrections persist for future use |
| 17.1 NotificationListener Module | F27 | Sprint 17 | F7: Manual tracking fatigue — Android platform equivalent of iOS auto-capture |
| 17.2 Bank Regex Parsers | F27 | Sprint 17 | F7: Manual tracking fatigue — structured extraction from SG bank notification formats |
| 17.3 Privacy Disclosure | F27 | Sprint 17 | Trust — transparent data handling; Google Play policy compliance |
| 17.4 Google Pay Parsing | F27 | Sprint 17 | F7: Manual tracking fatigue — captures mobile wallet payments on Android |
| 17.5 E2E Testing | F27 | Sprint 17 | Quality gate — validates cross-bank reliability before shipping |
| 16.7 Onboarding Step 1.5 | F26/F27 | Sprint 16 | Setup friction — surfaces auto-capture during onboarding for maximum adoption; platform-adaptive (Apple Pay on iOS, Notifications on Android); skippable |
| 16.8 Recommendation Match Indicator | F26/F27 | Sprint 16 | F6: No proof optimization works — shows "best card" or "tip" on every auto-captured transaction; turns each log into a micro-learning moment |
| 16.9 Smart Pay Handoff | F26/F27 | Sprint 16 | Loop closure — eliminates manual amount entry when auto-capture fires after Smart Pay-guided Wallet payment; 60s listener with fallback |

---

### Epic 12 — Story Map

```
                    EPIC 12: Transaction Auto-Capture
                    ==================================

 Sprint 16        16.1 Deep Link ──→ 16.2 Merchant Mapping ──→ 16.6 Confirmation Flow
 (iOS +           (URL scheme)        (category inference)       (confirm/edit/save)
  Cross-              │                                              ↑      │
  platform)      16.3 Card Matching ─────────────────────────────────┘      │
                 (fuzzy + verified)                                          ▼
                      │                                          16.8 Recommendation Match
                 16.4 Shortcut Template ──→ 16.5 Setup Wizard   (green "best card" banner
                 (.shortcut file)            (step-by-step)      or blue "tip" nudge)
                      │                          │                          │
                      │                     16.7 Onboarding                ▼
                      │                     Step 1.5             16.9 Smart Pay Handoff
                      │                     (platform-adaptive,  (60s listener, skip
                      │                      skippable)           manual entry, dual badge)
                      │
                      └──── ⚠️ iOS constraint: user MUST tap "Add Automation" in Shortcuts app

 Sprint 17        17.1 NotificationListener ──→ 17.2 Bank Parsers ──→ 16.6 Confirmation
 (Android)        (native module)               (DBS/OCBC/UOB/         (reused from S16)
                       │                         Citi/AMEX regex)
                  17.3 Privacy Disclosure                    │
                  (consent + permissions)              17.4 Google Pay
                       │                               (GPay parsing + dedup)
                  16.7 Onboarding Step 1.5                   │
                  (Android variant —                   17.5 E2E Testing
                   reused from S16)                    (all banks + regression)

 Data flow:  [Apple Pay tap / Bank notification] → [Shortcut / NotificationListener]
                → [Parse amount + merchant + card] → [Map merchant → category]
                → [Match card → portfolio] → [Pre-fill confirmation form]
                → [Match indicator: best card? tip?] → [User confirms with one tap]
                → [Transaction logged + cap updated]

 Smart Pay:  [Smart Pay recommends card] → [Open Wallet] → [User pays]
                → [Return to app] → [60s listener] → [Auto-capture fires?]
                → YES: [Confirmation screen (skip manual entry)] → [One-tap confirm]
                → NO:  [Fall back to manual amount entry (existing flow)]
```

---

### Anti-Feature-Jam Check (Epic 12)

| User Story | Feature | Maps to Core Friction? | Verdict |
|------------|---------|----------------------|---------|
| 16.1 Deep Link Handler | F26 | Yes — enables the core data pipeline from Apple Pay to MaxiMile; without this, no auto-capture is possible | Keep |
| 16.2 Merchant→Category Mapping | F26 | Yes — without category inference, user must manually select category on every auto-captured transaction; defeats the purpose | Keep |
| 16.3 Card Name Fuzzy Matching | F26 | Yes — without card matching, user must manually select card on every auto-captured transaction | Keep |
| 16.4 Downloadable Shortcut | F26 | Yes — without a pre-built Shortcut, users must manually create the automation (high setup friction = low adoption) | Keep |
| 16.5 Setup Wizard | F26 | Marginal — power users can set up without a wizard. But: testing shows non-technical users need guidance; wizard reduces setup from ~10 min to ~3 min | Keep (P1) |
| 16.6 Confirmation Flow | F26 | Yes — users need to verify and correct auto-captured data before it affects cap tracking; without this, data quality degrades | Keep |
| 17.1 NotificationListener Module | F27 | Yes — Android equivalent of the iOS deep link; without this, Android users have no auto-capture | Keep |
| 17.2 Bank Regex Parsers | F27 | Yes — without parsers, raw notification text cannot be structured into transaction fields | Keep |
| 17.3 Privacy Disclosure | F27 | Yes — Google Play policy requires prominent disclosure; without it, app risks rejection | Keep |
| 17.4 Google Pay Parsing | F27 | Marginal — banking app notifications already capture Google Pay transactions indirectly. But: Google Pay notifications arrive faster and may contain richer data; dedup handles overlap | Keep (P1) |
| 17.5 E2E Testing | F27 | Yes — notification parsing is fragile (bank format changes); without comprehensive testing, false positives/negatives erode trust | Keep |
| 16.7 Onboarding Step 1.5 | F26/F27 | Yes — auto-capture adoption is directly tied to discoverability; embedding in onboarding ensures maximum exposure. Skippable design prevents drop-off | Keep (P1) |
| 16.8 Recommendation Match Indicator | F26/F27 | Yes — directly addresses Friction F6 (no proof optimization works); turns every auto-captured transaction into a micro-learning moment. Reuses existing recommend() RPC | Keep (P1) |
| 16.9 Smart Pay Handoff | F26/F27 | Yes — without this, Smart Pay's recommend→pay loop still breaks at the manual entry step. Auto-capture fills the gap for the most common payment scenario | Keep (P1) |

No feature-jamming detected. All 14 stories trace to the validated #1 product risk (manual logging paradox) and PRD features F26–F27. S16.5 (Setup Wizard), S16.7 (Onboarding Step 1.5), S16.8 (Recommendation Match), S16.9 (Smart Pay Handoff), and S17.4 (Google Pay) are P1 items but justified: the wizard and onboarding step maximize adoption, the match indicator reinforces the core value proposition on every transaction, Smart Pay handoff closes the recommend-pay-log loop, and Google Pay handles a growing payment channel in Singapore.
