# PRD: MaxiMile — Credit Card Miles Optimizer

**Version**: 2.3
**Last Updated**: 2026-02-27
**Author**: PM Agent
**Status**: Draft
**Changelog (v2.3)**: Card database expansion planning. Cards 21-22 (Maybank World MC, UOB Visa Signature) already implemented. Added F33 (Card Database Expansion 22→29) for 7 remaining miles cards. SC Smart Card deferred (P3) — cashback card with poor miles conversion doesn't fit miles optimizer positioning. UOB Lady's Solitaire requires user category selection UX (choose 2 of 7). Updated F22 to reflect partial completion. Fixed Maybank World MC slug mismatch (`maybank-world-mc`).
**Changelog (v2.2)**: Recommendation accuracy improvements based on MileLion competitive analysis. Added F30 (Petrol/Bills Category Resolution), F31 (Min Spend Condition Enforcement), F32 (Condition Transparency in UI). Decision: Bills kept as single category with insurance warning — no sub-categories. See `docs/technical/MAXIMILE_VS_MILELION_ANALYSIS.md` for full comparative analysis.
**Changelog (v2.1)**: Updated F29 Push Notifications strategy — changed from 4-phase gradual rollout to single-sprint complete system build with demo mode. System production-ready but not user-enabled pending business launch decision.
**Changelog (v2.0)**: Added F29 Push Notifications for Rate Change Alerts — proactive mobile notifications with portfolio-aware filtering, severity-based batching, and F6 integration. See comprehensive evaluation at `docs/PUSH_NOTIFICATIONS_EVALUATION.md`
**Changelog (v1.9)**: Added F28 Demo Mode feature — environment-controlled mock data for demos without real transactions
**Changelog (v1.8)**: Incorporated DRD v1.1 design decisions — onboarding integration (Step 1.5), recommendation match indicator, Smart Pay auto-capture handoff, iOS Shortcut platform constraint clarification

---

## Executive Summary

MaxiMile is a context-aware mobile application that helps Singapore urban professionals maximize airline miles from credit card spending. By automating card selection recommendations and bonus cap tracking at the point of payment, it eliminates the cognitive burden of managing complex multi-card rules — turning thousands of lost miles into tangible travel rewards.

---

## 1. Problem Statement

### The Problem (Structured)

**Persona**: Urban working professionals, aged 25–45, in Singapore who actively use 3–7 credit cards to earn airline miles. Financially literate, travel at least once a year, value efficiency and rewards optimization.

**Goal / Job-to-be-Done**: Maximize airline miles earned from everyday spending by always using the right card for the right purchase — functionally (optimal card per transaction), emotionally (confidence they're not missing out), and situationally (instant clarity at point of payment).

**Mental Model**: Users manually track card rules via spreadsheets, notes apps, mileage blogs (MileLion, Suitesmile), and Telegram groups. They assume spending categories are static, mentally track bonus caps, and default to a "safe" card when unsure.

**Pain Point / Friction**: Users face a **four-dimensional friction landscape** that compounds at the point of payment:

1. **Complexity at POS**: Bonus caps, category-specific earn rates, MCC exclusions, and promotional overlaps across 3–7 cards are too complex to apply in real-time at a contactless checkout
2. **Operational Burden**: Manual transaction logging (~10-20 sec/txn) creates fatigue; card rule changes happen without notice, invalidating mental models
3. **Cognitive Load**: Chronic decision fatigue and anxiety at checkout; eroding confidence in their own optimization strategy over time
4. **Knowledge Gaps**: Confusion between bank points vs airline miles (transferable programs add complexity)

Result: Users frequently forget bonus caps, misclassify transactions, or exceed monthly limits unknowingly — leading to lost miles. Some users eventually abandon optimization entirely (HardwareZone evidence: users going from 7–10 cards down to 2).

**Impact**: The cost is measured in **missed vacations** and **mounting psychological burden**:

- **Financial**: Users lose 5,000–15,000 miles annually — *enough for a return business class seat to Tokyo, now permanently lost*. In dollar terms: SGD 200–500 in unrealized flight value per year, per user. Multiply by 200,000 active optimizers in Singapore = **SGD 40M–100M in lost value annually** across the market.

- **Temporal**: ~18-27 hours per year spent on uncompensated cognitive labor — maintaining spreadsheets, second-guessing decisions at checkout ("Did I already use my dining cap this month?"), reconciling post-facto cap breaches. That's **2-3 full workdays** of mental effort with no reward.

- **Psychological**: Each transaction triggers a micro-anxiety loop: *"Which card? Did I pick right? What if I'm wrong?"* This relentless decision burden compounds into chronic stress and eroding confidence. Users start doubting their own optimization strategy. The emotional toll is severe enough that many eventually surrender entirely — HardwareZone forums document users abandoning their optimization efforts, going from 7–10 carefully selected cards down to just 2. **What began as a smart financial strategy ends in exhausted resignation.**

- **Systemic**: For banks, this exodus represents weakened customer engagement and abandoned category-specific spend incentives — the very mechanisms designed to differentiate premium cards. For the broader miles ecosystem, when users give up, it reduces demand pressure that keeps airline programs honest, paradoxically hurting even the engaged users who remain.

> **Full statement**: An **urban working professional in Singapore** struggles with **manually tracking credit card rules across spreadsheets, blogs, and memory** to **maximize airline miles earned from everyday spending** but cannot do so effectively because of **four compounding frictions: (1) complexity at POS (bonus caps, category rules, MCC exclusions across 3–7 cards), (2) operational burden (manual logging, rule changes without notice), (3) cognitive load (chronic decision fatigue, eroding confidence), and (4) knowledge gaps (bank points vs airline miles confusion)**, which leads to **thousands of lost miles annually (worth SGD 200–500+ in flights), chronic decision fatigue, and eventual abandonment of optimization entirely (users going from 7–10 cards down to 2)**.

### Evidence
- [HardwareZone forums](https://forums.hardwarezone.com.sg/threads/who-gave-up-miles-chasing-via-credit-card.7187086/): Users reporting giving up miles chasing due to complexity; going from 7–10 cards down to 2
- [MileLion](https://milelion.com/2026/01/10/the-milelions-2026-credit-card-strategy/): Even expert bloggers require annual strategy overhauls due to constant rule changes
- Singapore cards & payments market projected at USD 50.37B by 2033 ([Market Data Forecast](https://www.marketdataforecast.com/market-reports/Singapore-Cards-and-Payments-Market))
- Community sentiment: Miles described as "imaginary coins subject to spontaneous devaluation" — indicating fragile trust

### Who Has This Problem
- **Primary**: Active miles optimizers holding 3–7 cards (~100,000–200,000 in Singapore)
- **Secondary**: Passive miles holders who use 1–2 cards sub-optimally due to complexity (~100,000–200,000)
- **Total addressable**: ~200,000–400,000 miles-focused professionals in Singapore

### Current Alternatives
| Solution | Type | Gap |
|----------|------|-----|
| MileLion / Suitesmile | Blogs | Static, requires user to read, interpret, remember |
| SingSaver / MoneySmart | Comparison Sites | Card selection only, not ongoing usage optimization |
| Seedly | Expense Tracker | Tracks spending but doesn't recommend optimal card |
| CardUp | Payment Platform | Enables card payments for non-card categories; not an optimizer |
| Spreadsheets / Notes | DIY | High effort, error-prone, no real-time capability |
| Telegram Groups | Community | Unstructured, not personalized |

### Value Creation Opportunity
Removing the friction of manual card selection and cap tracking creates value across multiple dimensions:
- **Functional**: Saves time (eliminates research), simplifies (one recommendation), reduces cost (more miles = free flights)
- **Emotional**: Reduces anxiety (confidence at checkout), rewards the user (visible miles gain)
- **Maslow's**: Addresses Safety (financial optimization), Esteem (feeling smart), Self-Actualization (mastering the miles game effortlessly)

---

## 2. Product Vision & Strategy

### Vision Statement

**For** urban working professionals in Singapore who use multiple credit cards for miles
**Who** struggle to track complex earn rates, bonus caps, and category rules across cards
**Our product** MilesMax
**Is a** context-aware mobile miles optimization app
**That** automatically recommends the optimal credit card at the point of payment
**Unlike** static blogs, comparison sites, and manual spreadsheets
**We** deliver real-time, state-aware, personalized recommendations that eliminate guesswork and maximize every transaction

### North Star Metric
**Metric**: Monthly Active Recommendations Used (MARU) — number of card recommendations acted on per month
**Why**: Directly measures whether users trust and rely on the product at the point of payment — the core value moment
**Target**: 10,000 MARU within 6 months of launch (avg 8 recommendations/user/month across 1,250 active users)

### Product Strategy Canvas

#### Vision
In 3 years, MaxiMile will be the default "which card should I use?" companion for at least 50% miles-focused consumer in Singapore, expanding to Southeast Asia.

#### Challenge
In order to reach our vision, we need to acquire 10,000 active users in Singapore and achieve a 60%+ monthly retention rate within 12 months.

#### Target Condition
In order to reach our Challenge, we first need to deliver a product that provides accurate, instant card recommendations with <5 second response time, covers the top 30 miles-earning credit cards in Singapore (expanding from initial 20-card MVP to 85% market coverage), and keeps card rules automatically up-to-date through community-sourced and AI-powered rate change detection.

#### Current State
No product exists in Singapore that provides real-time, personalized card recommendations at the point of payment. Users rely on static content, manual tracking, or guesswork.

#### Full Canvas Elements

| Element | Detail |
|---------|--------|
| **Vision** | Empower every miles-focused consumer to maximize rewards effortlessly |
| **Market** | TAM: ~400K miles card holders in SG; SAM: ~200K active optimizers; SOM: ~50K early adopters (Year 1) |
| **Value Proposition** | Turn complex credit card rules into simple, real-time, one-tap decisions |
| **Constraints** | No direct bank API access (SGFinDex not open to fintechs yet); manual transaction logging in v1; Singapore-only initially |
| **Relative Costs** | Optimize for unique value (not low cost) — premium positioning for financially literate users |
| **Growth & Marketing** | PLG (product-led growth): free tier with core recommendations; word-of-mouth via miles community; content partnerships with MileLion/Suitesmile |
| **Unique Activities** | Maintaining a real-time credit card rules database (automated via AI + community); building a spending-state engine; community-driven rule verification |
| **Capabilities** | Card rules database team; mobile engineering; UX for speed-of-checkout scenarios |
| **Supporting Systems** | Card rules database with version control; user spending tracker; notification engine |
| **Trade-Offs** | Will NOT be a card comparison/application site (no affiliate revenue from card signups in v1); will NOT track cashback cards (miles-only focus); will NOT require bank login |

### Gap Analysis

| Metric | Current State | Target State | Gap |
|--------|---------------|--------------|-----|
| Card recommendation at point of payment | None exists | Instant, accurate, personalized | Full product build |
| Bonus cap tracking | Manual (spreadsheets) or none | Automated, real-time alerts | Core feature |
| Miles earned per dollar (average) | ~1.2 mpd (suboptimal) | ~2.5–4.0 mpd (optimal) | +100–230% improvement |
| Time to decide which card | 10–30 seconds | <2 seconds | UX & algorithm |
| User confidence at checkout | Low–Medium | High | Trust through accuracy |
| Transaction logging effort | ~20 sec manual per txn | ~2-3 sec auto-confirm (Apple Pay) / 0 sec (Android notif.) | F26 iOS Shortcuts + F27 Android NotificationListener |
| Recommend-to-Log feedback loop | None — recommendation and logging are disconnected | Closed loop: Recommend->Pay->Auto-log->Cap update->Better recommendation | F26/F27 recommendation match indicator on confirmation screen + Smart Pay auto-capture handoff |

---

## 3. Stakeholder Summary

### Stakeholder Map

| Stakeholder | Role | Interest Level | Influence | Key Needs |
|-------------|------|----------------|-----------|-----------|
| **End Users** (Miles optimizers) | Primary users | High | High (adoption determines success) | Accurate recommendations, low effort, visible miles gain |
| **Banks** (DBS, UOB, OCBC, Citi, HSBC) | Data source, potential partners | Medium | High (card rules, potential API access) | Increased card usage, category-aligned spend, customer retention |
| **Miles Blog Community** (MileLion, Suitesmile) | Influencers, content partners | Medium-High | Medium (distribution, credibility) | Audience engagement, content monetization opportunities |
| **Airline Programs** (KrisFlyer, Asia Miles) | Ecosystem partners | Low-Medium | Low | More active miles earners = more redemptions |
| **Technical Team** | Builds the product | High | Medium | Clear requirements, feasible scope, maintainable architecture |
| **Investors / Business Owners** | Fund and govern | Medium | High | Market traction, revenue model viability, path to profitability |

### Key Stakeholder Insights
- **Must satisfy**: End Users — product lives or dies on accuracy and ease of use at point of payment
- **Must inform**: Banks — future partnership/integration potential; avoid adversarial positioning
- **Must consult**: Miles Blog Community — they are the trusted authorities; their endorsement is critical for early adoption

### Approval Required From
- [ ] Product Owner / Business Stakeholder
- [ ] Technical Lead (feasibility review)

---

## 4. Competitive Context

### Direct Competitors

| Competitor | Type | Strengths | Weaknesses | Our Differentiator |
|------------|------|-----------|------------|-------------------|
| **MileLion** | Blog/Guides | Deep expertise; trusted brand; "What card do I use for..." guide; MCC lookup tool | Static content; not personalized; no cap tracking; requires user effort to apply | Real-time, personalized, state-aware recommendations |
| **Suitesmile** | Blog/Guides | Timely news; earn rate comparisons; strategy guides | Same as MileLion — informational, not actionable at POS | Automated at point of payment; no reading required |
| **SingSaver** | Comparison Platform | Comprehensive card comparison; sign-up bonuses; ~SGD 25M revenue | Focused on card acquisition, not usage optimization; no spend tracking | We optimize usage, not selection |
| **MoneySmart** | Comparison Platform | Financial calculators; card reviews; wide product range | Same as SingSaver — selection tool, not optimization tool | Post-acquisition optimization |
| **Seedly** | Finance Tracker | Expense tracking; community reviews; card reviews | Tracks spending but doesn't recommend optimal card; no miles-specific optimization | Miles-specific; recommendation engine |

### Indirect Alternatives

| Alternative | Why Users Choose It | Gap We Can Fill |
|-------------|---------------------|-----------------|
| Spreadsheets / Notes | Free, customizable, full control | Automate what they're doing manually |
| Telegram Miles Groups | Crowdsourced, real-time alerts, social | Personalize the advice to individual portfolios |
| CardUp / ipaymy | Earn miles on non-card categories (rent, tax) | Complementary — we recommend which card to use with CardUp |
| Bank own apps | Transaction history, rewards balance | Banks don't cross-recommend competitor cards |

### Competitive Positioning
- **Our unique value**: The only product that combines personalized card portfolio awareness + real-time spending state + point-of-payment recommendations
- **Table stakes**: Accurate earn rate data, coverage of top 30 SG miles cards (~85% market), mobile-first UX
- **Differentiators**: State-aware cap tracking, proactive alerts, miles-saved insights (integrated into Miles tab), rate change monitoring (community + AI-automated detection), spending-pattern-based portfolio suggestions, **Apple Pay / Android notification auto-capture (F26/F27) — no Singapore competitor offers this**; **closed-loop Recommend->Pay->Auto-log->Cap update->Better recommendation feedback cycle** — auto-capture confirmation screen shows whether user used the best card (recommendation match indicator), turning every transaction into a micro-learning moment that reinforces the core value prop; **proactive push notifications for rate changes (F29) — no competitor (MileLion, Suitesmile, SingSaver) offers mobile push alerts for credit card rate changes**, creating a critical retention touchpoint for passive users

### SWOT Analysis

| | Helpful | Harmful |
|---|---------|---------|
| **Internal** | **Strengths**: First-mover in real-time miles optimization; clear value prop; no direct competitor | **Weaknesses**: No bank API access initially; requires manual transaction input for non-Apple-Pay transactions (partially mitigated by F26/F27 auto-capture); card rules database needs constant maintenance |
| **External** | **Opportunities**: SGFinDex expansion to fintechs; growing contactless payments; miles community eager for tools; potential bank partnerships | **Threats**: Banks could build this natively; comparison sites could pivot; miles program devaluations reducing user motivation; super apps embedding financial tools |

### Porter's Five Forces

| Force | Assessment | Implication |
|-------|------------|-------------|
| **Supplier Power** (Banks) | HIGH — Banks control card rules, could restrict data access or build competing features | Maintain good relationships; use publicly available data; position as complementary to banks |
| **Buyer Power** (Users) | MEDIUM — Users have alternatives (manual tracking, blogs) but none are automated | Must demonstrate clear value quickly; free tier essential for adoption |
| **Threat of New Entrants** | MEDIUM — Low technical barrier but high data-maintenance barrier; comparison sites could pivot | Build moat through accuracy, community trust, and user spending data |
| **Threat of Substitutes** | MEDIUM — Manual methods work (just painfully); AI assistants could evolve to answer "which card?" | Stay ahead on real-time state awareness; integrate AI capabilities ourselves |
| **Competitive Rivalry** | LOW — No direct competitor in Singapore currently | Window of opportunity; move fast to establish brand and user base |

---

## 5. User Personas

### Primary Persona: Miles-Maximizing Maya

- **Demographics**: 32, Marketing Manager at an MNC, SGD 7K–12K/month, high digital literacy
- **Behavioral Traits**: Reads MileLion/Suitesmile weekly, participates in Telegram miles chat groups, maintains a spreadsheet of card rules, holds 4–5 miles cards
- **Attitudes & Emotions**: Feels anxiety when unsure which card to tap; frustration when discovering exceeded bonus caps; satisfaction when optimizing correctly
- **Key Needs**: Earn enough miles for 1–2 business class redemptions/year without excessive tracking effort
- **Pain Points**: Forgetting which card earns bonus for this merchant; discovering exceeded caps after the fact; stress at contactless checkout

### Secondary Persona: Passive Peter

- **Demographics**: 28, Software Engineer, SGD 5K–8K/month, high digital literacy
- **Behavioral Traits**: Knows he should optimize but finds it too tedious; uses one "safe" card for everything; occasionally reads a miles blog
- **Key Needs**: Earn more miles without dedicating any time to tracking or research
- **Pain Points**: FOMO when friends discuss free business class flights; guilty feeling of wasting potential miles

### User Journey (Primary Persona)

1. **Trigger**: Maya is at a restaurant, ready to pay. She has 4 cards in her wallet.
2. **Current**: She tries to remember — is it DBS Altitude or OCBC 90°N that gives 4 mpd for dining? Has she hit the $1,000 cap on DBS this month?
3. **With MilesMax**: She opens the app, taps "Dining" — sees "Use OCBC 90°N (4 mpd, $650 cap remaining). DBS Altitude cap reached."
4. **Result**: Confident tap. 4 mpd earned. Zero anxiety.

---

## 6. Hypothesis & Differentiation

### Hypothesis (Proposed Solution)

A context-aware mobile application that automatically recommends the optimal credit card at the point of payment based on spend category, remaining bonus cap, and user preferences. The system continuously tracks cumulative spending across cards and updates recommendations in real-time.

**We believe that** automating card selection and cap tracking at the point of payment **will** help miles-focused consumers earn 20–40% more miles per dollar and reduce missed bonus opportunities by 80%+ **for** urban working professionals in Singapore **by** eliminating the cognitive load of manual tracking and delivering instant, state-aware recommendations.

### Key Differentiators (vs Existing Alternatives)

| Our Approach | Existing Alternatives | Why Ours Is Better |
|--------------|----------------------|-------------------|
| Real-time, state-aware at point of payment | Static information requiring lookup | Acts when users need it most — at checkout |
| Automated cap tracking across all cards | Manual spreadsheet tracking | Prevents #1 cause of lost miles |
| Personalized to actual card portfolio | Generic "best cards" lists | Relevant, not aspirational |
| Proactive alerts (approaching cap) | Reactive (user must seek info) | System-push, not user-pull |
| Miles-saved insights (integrated into Miles tab) | No optimization visibility | Tangible proof of value |
| Auto-capture via Apple Pay / Android notifications (F26/F27) | Manual expense logging or no tracking at all | Passive data capture; "log without lifting a finger" |
| Recommendation match indicator on every auto-captured transaction | No post-payment feedback in any competitor | Closes the Recommend->Pay->Log loop; every transaction proves value and educates the user |

---

## 7. Goals & Success Metrics

### Primary Goal
Enable miles-focused users to consistently use the optimal credit card for every transaction, maximizing miles earned while minimizing cognitive effort.

### Value Metrics (to User)

| Metric | Type | Current | Target | Measurement |
|--------|------|---------|--------|-------------|
| Effective miles per dollar | Better | ~1.2 mpd (avg) | ~2.5–4.0 mpd | Avg mpd across user transactions |
| Time to decide which card | Faster | 10–30 sec | <2 sec | In-app recommendation speed |
| Annual miles lost to errors | Cheaper | ~5,000–15,000 miles | <500 miles | User-reported + cap breach tracking |
| Confidence at checkout | Subjective | Low–Medium | High | In-app NPS / satisfaction surveys |

### Impact Metrics (to System/Business)

| Metric | Time Horizon | Current | Target | Measurement |
|--------|-------------|---------|--------|-------------|
| Monthly Active Users (MAU) | Short-term | 0 | 5,000 (6 months) | App analytics |
| Monthly Active Recommendations Used | Short-term | 0 | 10,000 (6 months) | In-app tracking |
| Monthly Retention Rate | Medium-term | N/A | 60%+ | Cohort analysis |
| Premium Conversion Rate | Medium-term | N/A | 10–15% | Subscription analytics |
| Card applications via referral (future) | Long-term | N/A | Revenue stream | Affiliate tracking |

### Leading Indicators
- Number of cards added per user during onboarding (target: 3+)
- Frequency of app opens at point of payment (target: 3+/week)
- Transaction logging rate (target: 70%+ of recommendations result in logged transaction; target increases to 85%+ after F26/F27 auto-capture rollout)
- Auto-capture setup rate (target: 30%+ of iOS users complete Shortcut setup within 7 days of F26 launch)
- Auto-capture confirmation rate (target: 95%+ of auto-captured transactions confirmed by user)
- Push notification opt-in rate (F29) (target for future launch: 50%+ iOS, 70%+ Android after 6 months)
- Push notification open rate (F29) (target for future launch: 15%+ for critical, 10%+ for warning)
- Push notification delivery rate (F29) (target for future launch: 95%+)
- Demo mode presentation readiness (F29) (target: 100% — stakeholders can experience full notification flow on demand)

### Lagging Indicators
- User-reported additional miles earned per month
- Monthly churn rate (target: <15%)
- NPS score (target: 50+)
- Push notification opt-out rate (F29) (target for future launch: <5% after 6 months)
- Retention uplift for push-enabled users (F29) (target for future launch: +20% vs non-push users)
- Stakeholder demo feedback score (F29) (target: 4.5+/5.0 — measures demo mode effectiveness)

---

## 8. Scope & Features

### RICE-Prioritized Features

#### P0 — Must Have (MVP)

| # | Feature | Description | Reach | Impact | Confidence | Effort (wks) | RICE Score | Acceptance Criteria |
|---|---------|-------------|-------|--------|------------|--------------|------------|---------------------|
| F1 | **Card Portfolio Setup** | User adds their credit cards from a pre-populated list of SG miles cards; system auto-loads earn rates, categories, and cap rules | 5000 | 3 | 90% | 3 | 4500 | User can add/remove cards; rules auto-populate for 29 SG miles cards; setup completes in <3 min |
| F2 | **Spend Category Recommendation** | User selects a spend category (dining, transport, online, groceries, etc.) and gets the optimal card recommendation based on earn rate | 5000 | 3 | 90% | 4 | 3375 | Recommends highest-mpd card for selected category; shows earn rate and reasoning; <1 sec response |
| F3 | **Bonus Cap Tracker** | Tracks cumulative spending per card per category against monthly bonus caps; adjusts recommendations when caps are approached/exceeded | 4000 | 3 | 80% | 5 | 1920 | Accurately tracks caps; switches recommendation when cap exceeded; shows remaining cap amount |
| F4 | **Transaction Logging** | User logs each transaction (amount, category, card used) to keep cap tracking accurate | 4000 | 2 | 85% | 3 | 2267 | Quick-log (<10 sec per entry); auto-suggests category; updates cap tracker immediately |
| F5 | **Card Rules Database** | Comprehensive, maintained database of SG miles card earn rates, bonus categories, caps, exclusions, and MCC mappings | 5000 | 3 | 80% | 6 | 2000 | Covers 29 miles cards; updated within 48 hrs of bank rule changes; version-controlled |

#### P1 — Should Have

| # | Feature | Description | Reach | Impact | Confidence | Effort (wks) | RICE Score | Acceptance Criteria |
|---|---------|-------------|-------|--------|------------|--------------|------------|---------------------|
| F6 | **Cap Approach Alerts** | Push notifications when user approaches 80% of a card's monthly bonus cap | 3000 | 2 | 80% | 2 | 2400 | Triggers at 80% and 95%; suggests alternative card; configurable thresholds |
| F7 | **Miles Earning Insights** | Monthly earning performance integrated into the Miles tab: miles earned this month + miles saved shown as hero stats, with full insights accessible via "View earning insights" link. Standalone dashboard replaced by push screen from Miles tab. **Includes sub-features**: I1 Top Earning Card highlight (RICE 10,200), I2 Category spending breakdown (RICE 4,800), I5 Fixed Miles Saved baseline using 1.4 mpd SG industry average (RICE 5,400) | 3000 | 2 | 85% | 2 | 2550 | Monthly miles earned + miles saved shown on Miles tab hero; 3-month trend + insight card on full insights screen; miles saved = earned vs 1.4 mpd industry-average baseline; top earning card highlighted with earn rate breakdown; spend distribution by category with miles earned per category shown on insights screen |
| F8 | **Quick-Access Widget** | Home screen widget or quick-access feature for instant category lookup without opening full app | 2500 | 2 | 70% | 3 | 1167 | Widget shows top 3 categories; one-tap to get recommendation; <0.5 sec |
| F9 | **Merchant Search** | Search for a specific merchant to see recommended card (uses MCC mapping) | 2000 | 1 | 70% | 3 | 467 | Search by merchant name; shows mapped category and recommended card; covers top 500 merchants |
| F13 | **Miles Portfolio Dashboard** | New "Miles" tab showing total miles per loyalty program. Auto-calculated from logged transactions + manual baseline. Per-program glassmorphic cards with balance breakdown | 4000 | 2 | 85% | 3 | 2267 | Total miles hero section; per-program cards; tap for detail; pull-to-refresh; empty state for no cards |
| F14 | **Manual Miles Balance Entry** | Users set a baseline miles balance per program via onboarding Step 2 or Miles tab. Combined with auto-earned for display total | 3500 | 2 | 80% | 2 | 2800 | Bottom sheet number input; upserts to miles_balances; reflected immediately in portfolio; accessible from onboarding + Miles tab |
| F15 | **Miles Redemption Logging** | Users log miles used for flights/upgrades/transfers. Deducted from displayed balance. Celebration animation on log | 3000 | 2 | 75% | 2 | 2250 | Bottom sheet form (amount, description, date); inserts to miles_transactions; auto-checks goal achievement; history list on program detail |
| F16 | **Miles Goal Tracker** | Users set a miles target per program (max 3 active goals). Progress bar, projected date, achievement celebration | 2500 | 2 | 70% | 3 | 1167 | Create/delete goals; progress bar with percentage; achieved state with timestamp; max 3 active goals enforced |
| F18 | **Two-Layer Miles Architecture** | Restructure Miles tab into two views: Layer 1 "My Miles" (airline FFPs — destination-focused, default view) and Layer 2 "My Points" (bank reward points — source-focused). Segmented control to switch between views | 4500 | 3 | 80% | 4 | 2700 | Segmented control toggle; Layer 1 shows airline programs with confirmed + potential miles; Layer 2 shows bank points with transfer options; default to Layer 1 |
| F19 | **Transfer Partner Mapping** | Database of bank-to-airline transfer relationships with conversion rates, fees, and minimums. Powers the "potential miles" calculation in Layer 1 and transfer options in Layer 2 | 4500 | 3 | 85% | 3 | 3825 | transfer_partners table with rates; covers all 9 SG banks; shows conversion rate per path; updated when banks change rates |
| F20 | **Smart Transfer Nudges** | Contextual suggestions when users have idle bank points that could be transferred to airline programs. "You have 50k DBS Points — transfer to KrisFlyer for 20k miles" | 3000 | 2 | 70% | 2 | 2100 | Nudge card on My Points view; shows best transfer option; links to bank transfer page; dismissible; respects frequency cap |
| F21 | **Expanded Miles Programs** | Expand from 7 to ~20 programs: add 3 bank points (HSBC Rewards, Amex MR, BOC Points) + 7 airline FFPs (Asia Miles, BA Avios, Qantas FF, Qatar Avios, Flying Blue, Enrich, AirAsia Rewards) | 4500 | 2 | 90% | 2 | 4050 | All 10 bank/transferable programs seeded; top 7 airline FFPs seeded; card-to-program mappings complete; transfer_partners populated |
| F22 | **Card Coverage Expansion (20→22)** | ~~Originally planned as 20→30.~~ **PARTIALLY COMPLETE**: Added Maybank World Mastercard (Card 21, uncapped 4 mpd petrol, no min spend) and UOB Visa Signature (Card 22, 4 mpd contactless + $1,000/month min spend). Remaining 8 cards moved to F33. Slug mismatch fixed (`maybank-world-mc`). | 4500 | 2 | 90% | 1 | 8100 | 2 new cards seeded with 16 earn rules, 1 cap, 4 exclusions; all verified against bank T&Cs; 40 recommendation tests pass; slug matches image filename |
| F33 | **Card Database Expansion (22→29)** | Add 7 high-priority miles credit cards to reach 29 total: (1) DBS Vantage Visa Infinite (flat 1.5 mpd, $2K/month min spend), (2) UOB Lady's Solitaire (4 mpd on 2 user-chosen categories, cap $1,500/month), (3) OCBC Voyage Card (flat 1.3 mpd, no conditions), (4) SC Journey Card (3 mpd online transport/grocery delivery, cap $1K/month), (5) SC Beyond Card (flat 1.5 mpd, $1,635 non-waivable fee), (6) HSBC Premier Mastercard (flat 1.4 mpd, uncapped), (7) Maybank XL Rewards (4 mpd dining/online/travel, $500/month min spend, age 21-39 only). SC Smart Card **DEFERRED** (P3) — cashback card with poor miles conversion (~0.4 mpd effective), doesn't fit miles optimizer positioning. UOB Lady's Solitaire requires new UX for user category selection (choose 2 of 7 quarterly). Increases market coverage from ~65% to ~85% | 4500 | 2 | 90% | 2 | 4050 | 7 new cards seeded with earn rules across 8 categories, caps, conditions; UOB Lady's Solitaire category selection UX designed and implemented; eligibility metadata for age-restricted (Maybank XL: 21-39) cards; all rules verified against bank T&Cs; existing recommendation engine works with new cards without code changes; 29 total cards in database |
| F23 | **Rate Change Monitoring & Alerts** | Track earn rate changes, cap adjustments, and program devaluations. Alert affected users in-app when their cards' earn rates change. Admin-triggered in v1 with structured change log. Covers events like Amex MR devaluation (Feb 2026, 22-50% increase in transfer costs), DBS Woman's World cap cut (S$1,500→S$1,000), Maybank Horizon rate cut | 3500 | 2 | 60% | 4 | 1050 | Admin can create rate change alerts; affected users see in-app notification with old vs new rate; card detail screen shows "Rate updated [date]" badge; change history log per card; push notification for major devaluations |
| F24 | **Community-Sourced Rate Change Submissions** | Users report rate/benefit changes they discover via an in-app form. Submissions enter a review queue for admin verification before publishing to rate_changes. Includes evidence attachments (URL/screenshot), dedup fingerprinting, submission status tracking, and contributor recognition badges. Closes the Layer 1 detection gap identified in the Rate Detection Architecture | 3200 | 2 | 80% | 2 | 2560 | User can submit a rate change via structured form (card, change type, old/new values, evidence URL); submission saved as "pending"; admin can approve/reject/edit in dashboard; approved submissions auto-inserted into rate_changes; SHA-256 dedup prevents duplicates; user sees submission status history; "Verified Contributor" badge after 3+ approved submissions |
| F25 | **Automated Rate Change Detection** | Automated pipeline that monitors bank T&C pages and detects rate/benefit changes using AI classification. GitHub Actions runs Playwright scraper daily against ~50 bank URLs, SHA-256 content hashing gates LLM calls, Gemini 2.5 Flash classifies changes into rate_changes schema with confidence scoring. Entire infrastructure runs at $0/month on free tiers. See `docs/RATE_DETECTION_ARCHITECTURE.md` for full technical spec | 3500 | 3 | 50% | 6 | 875 | Daily scraper checks ~50 bank URLs; content-hash gating eliminates unchanged pages (zero LLM cost on no-change days); Gemini Flash classifies detected changes with structured JSON output; confidence >=0.85 auto-approved from Tier 1 sources; 0.50-0.84 queued for admin review; <0.50 auto-discarded; pipeline health dashboard shows source uptime and detection accuracy; detection latency <48 hours |
| F26 | **Apple Pay Shortcuts Auto-Capture** | iOS Shortcuts Transaction trigger integration that auto-populates transaction logs via the existing `maximile://` URL scheme when users pay with Apple Pay NFC. Captures amount, merchant, and card used — user confirms with one tap. Reduces per-transaction logging from ~20 sec to ~2-3 sec. Solves the #1 product risk (manual logging paradox) with zero native code required. Multiple App Store precedents (TravelSpend, MoneyCoach, BalanceTrackr). **Setup offered during onboarding as Step 1.5** (between "Add Cards" and "Set Miles Balances") to maximize adoption, with fallback access via Settings. **Confirmation screen includes recommendation match indicator** — calls `recommend()` RPC to show whether the user used the best card for that category, closing the Recommend->Pay->Auto-log->Cap update feedback loop. **iOS platform constraint**: Shortcuts automations cannot be programmatically installed — user must manually tap "Add Automation" in the Shortcuts app (hard Apple limitation); the setup wizard minimizes this friction with a pre-configured `.shortcut` file. See `docs/NOTIFICATION_CAPTURE_FEASIBILITY.md` and `docs/DRD_AUTO_CAPTURE.md` | 3500 | 3 | 85% | 3 | 2975 | Deep link handler parses `maximile://log?amount=X&merchant=Y&card=Z&source=shortcut`; card name fuzzy-matched to user portfolio; merchant auto-mapped to spend category; pre-filled transaction form shown for one-tap confirmation with recommendation match indicator; downloadable `.shortcut` template provided (cannot be auto-installed — Apple platform constraint); in-app setup wizard completes in <2 min; setup offered during onboarding Step 1.5; works on iOS 17+ |
| F27 | **Android Notification Auto-Capture** | `NotificationListenerService`-based automatic transaction capture from banking app notifications on Android. Parses push notifications from DBS, OCBC, UOB, Citi, AMEX (and Google Pay/Samsung Pay) to extract amount, merchant, and card — auto-logs transactions with no user action. Requires one-time notification access permission. **Setup offered during onboarding as Step 1.5** (same screen as F26, platform-adaptive: shows notification-based messaging on Android). **Confirmation screen includes recommendation match indicator** (same as F26) — reinforces good card choices and educates on better alternatives. See `docs/NOTIFICATION_CAPTURE_FEASIBILITY.md` and `docs/DRD_AUTO_CAPTURE.md` | 3000 | 3 | 70% | 4 | 1575 | Native Android module via Expo config plugin; regex parsers for top 5 SG bank notification formats; on-device-only processing (no raw notification data uploaded); prominent privacy disclosure; background service with battery-efficient filtering; Google Pay + Samsung Pay notification parsing; Play Store Data Safety section updated; setup offered during onboarding Step 1.5; confirmation screen shows recommendation match indicator |
| F28 | **Demo Mode** | Environment-controlled demo mode that enables product demonstrations without requiring real Apple Pay transactions. Activated via `EXPO_PUBLIC_DEMO_MODE=true` environment variable in EAS Build demo profile. When enabled, auto-capture flow automatically injects realistic mock transaction data (44 merchants across 6 categories: Coffee, Gas, Grocery, Restaurant, Retail, Online) into the deep link handler. Zero UI changes — completely transparent to the user experience. Essential for sales demos, investor presentations, and TestFlight/EAS Build testing where triggering the Shortcuts automation without making real purchases is required. Mock data generator produces randomized amounts within realistic merchant price ranges, uses user's portfolio cards when available, falls back to common card names otherwise. See `docs/DEMO_MODE.md` and `docs/PRD_DEMO_MODE.md` for full technical spec | 1000 | 2 | 95% | 1 | 1900 | Build command `eas build --profile demo --platform ios` generates demo-enabled build; deep link handler automatically injects mock data when `isDemoMode()` returns true; mock transactions include realistic amounts, merchant names, and card assignments; works seamlessly with existing auto-capture confirmation flow; production builds have demo mode disabled via `EXPO_PUBLIC_DEMO_MODE=false`; internal distribution via EAS Build (no App Store submission required) |
| F29 | **Push Notifications for Rate Change Alerts** | Complete production-ready push notification system that alerts users when credit card earn rates, bonus caps, or transfer ratios change for cards in their portfolio. Complements existing in-app rate change alerts (F23) by reaching users who don't actively open the app. Implements portfolio-aware filtering (only alerts for owned cards), severity-based batching (critical = immediate, warning = daily batch, info = opt-in weekly), smart frequency capping (<4 notifications/user/month avg), and granular user controls. Uses `expo-notifications` (already installed) with Expo Push Service backend. Includes deep linking to card details, quiet hours support, and notification history. Addresses critical user need: rate changes directly impact earning potential (users who miss devaluations lose SGD 50-200+ per change). **Competitive differentiation**: None of our competitors (MileLion, Suitesmile, SingSaver) offer proactive push alerts for rate changes. **Build strategy**: Complete system built in single sprint (Sprint 13) with comprehensive demo mode for stakeholder presentations. System is production-ready and fully tested but NOT enabled for end users yet — launch date pending business decision. **Demo mode**: Auto-triggers on first Miles tab visit with realistic mock notifications showcasing critical/warning/info severity levels, batching behavior, and deep-link navigation. Enables compelling product demonstrations without real rate changes. See comprehensive evaluation at `docs/PUSH_NOTIFICATIONS_EVALUATION.md` for technical architecture, risk analysis, UX design, and success metrics | 4000 | 3 | 85% | 4 | 2550 | Complete notification infrastructure built and tested; demo mode auto-triggers realistic notifications on Miles tab visit; users can opt into push during onboarding with pre-permission primer (disabled in production by default); critical rate changes trigger immediate push notification; warning changes batched to 9 AM daily; notification copy follows template "[Emoji] [Card]: [Change] — [Impact] [CTA]"; tap notification deep-links to card detail with rate change expanded; granular settings (critical/warning/info toggles, quiet hours, frequency mode); notification history accessible in Settings; demo mode showcases all notification types with realistic timing; production launch controlled via feature flag; integrates with F6 for cap approaching alerts; supports batched multi-change digest; portfolio-aware filtering ensures relevance |

#### P0.5 — Recommendation Accuracy (Post-MileLion Analysis)

> **Context**: Comparative analysis against [MileLion's credit card guide](https://milelion.com/credit-cards/guide/) (Feb 2026) identified three gaps where MaxiMile's recommendations can be inaccurate. These features address data integrity and scoring accuracy — the foundation that all other features depend on. See `docs/technical/MAXIMILE_VS_MILELION_ANALYSIS.md` for full analysis.

| # | Feature | Description | Reach | Impact | Confidence | Effort (wks) | RICE Score | Acceptance Criteria |
|---|---------|-------------|-------|--------|------------|--------------|------------|---------------------|
| F30 | **Petrol/Bills Category Resolution** | Resolve the petrol/bills data conflict: (1) Add base-rate earn rules for `bills` across all 20 cards so `recommend('bills')` returns meaningful results instead of undifferentiated base rates, (2) Fix `gas_station` Google Places mapping from `transport` to `petrol` in `lib/merchant.ts`, (3) Add `bills` to AI scraper schema (`scraper/src/ai/schema.ts` and `prompts.ts`). **Decision**: Both `petrol` AND `bills` remain as separate categories (8 total). Bills is NOT sub-categorized — telco and utilities produce identical recommendations (all base rate). Insurance warning banner added instead. See `docs/technical/CARD_DATA_VERIFICATION.md` Section 3.1 for full conflict timeline | 5000 | 3 | 95% | 1.5 | 9500 | `recommend('bills')` returns differentiated results for all 20 cards; `recommend('petrol')` returns existing petrol-specific earn rates; Google Places `gas_station` type maps to `petrol` category; AI scraper schema accepts `bills` as valid category; insurance warning banner shown on Bills recommendation screen ("Insurance payments are excluded from earning on most cards — rates shown apply to telco and utility bills"); 8 categories visible in app UI; all existing tests pass |
| F31 | **Min Spend Condition Enforcement** | Enforce minimum monthly spend conditions in the recommendation scoring algorithm. Currently, SC X Card (3.3 mpd, requires $500/month), UOB Preferred Platinum (4 mpd, requires $600/month), and Maybank cards (requires $300/month) are recommended at their bonus rate regardless of user's actual spending level — producing **wrong recommendations** for low spenders. Fix: (1) Add user monthly spend estimate input (onboarding or settings), (2) Modify `recommend()` RPC to check `earn_rules.conditions->>'min_spend_monthly'` against user's actual monthly spend from `transactions`, (3) If condition not met, use `base_rate_mpd` instead of bonus rate. Affects ~5 of 20 cards | 4000 | 3 | 85% | 3 | 3400 | Cards with min spend conditions downranked to base rate when user's monthly spend is below threshold; SC X Card shows 0.4 mpd (not 3.3 mpd) for users spending <$500/month; UOB Preferred Platinum shows 0.4 mpd (not 4 mpd) for users spending <$600/month; `recommend()` RPC checks `conditions->>'min_spend_monthly'` against current month's `SUM(transactions.amount)`; user can set a monthly spend estimate in settings; recommendation cards show condition note when min spend not yet met ("Spend $X more this month to unlock bonus rate") |
| F32 | **Condition Transparency in Recommendation UI** | Surface card conditions and exclusions on recommendation cards so users understand the fine print behind each recommendation. Three sub-features: (1) **Conditions display**: Show `earn_rules.conditions_note` on recommendation cards (e.g., "SIA bookings only", "Requires contactless payment", "Min spend $500/month required"), (2) **HSBC Revolution fast food exclusion**: Add MCC 5814 exclusion row to `exclusions` table — HSBC Revolution earns 4 mpd on dining but excludes fast food (MCC 5814), which MileLion explicitly flags, (3) **Insurance warning on Bills screen**: Static warning banner on Bills recommendation screen noting that insurance payments (MCC 6300/6381/6399) are excluded from earning on most cards despite being in the bills category. This is a UI-only change — the data already exists in `earn_rules.conditions_note` and `exclusions` table | 4000 | 2 | 90% | 1.5 | 4800 | Recommendation cards display `conditions_note` text when present (non-null); HSBC Revolution excluded from dining recommendation for MCC 5814 merchants; Bills recommendation screen shows insurance exclusion warning banner; condition text styled as secondary/muted below earn rate; no algorithm changes required — purely UI surfacing of existing data |

#### P2 — Could Have

| # | Feature | Description | Reach | Impact | Confidence | Effort (wks) | RICE Score | Acceptance Criteria |
|---|---------|-------------|-------|--------|------------|--------------|------------|---------------------|
| F10 | **Portfolio Optimizer** | Analyzes user spending patterns and suggests cards to add/drop from portfolio | 1500 | 2 | 50% | 5 | 300 | Requires 3 months of spending data; shows projected miles gain/loss; links to card info |
| F11 | **Promo & Bonus Tracker** | Tracks limited-time card promotions (e.g., "10X points on Grab this month") | 2000 | 1 | 60% | 4 | 300 | Shows active promos for user's cards; integrates into recommendations |
| F12 | **Social / Community** | Share optimization results, compare with friends, community-sourced rule corrections | 1000 | 1 | 40% | 6 | 67 | Optional sharing; leaderboard; community rule flagging |
| F17 | **Miles Earning Insights (Extended)** | Advanced earning analytics beyond F7: per-program trends, earning rate comparisons, and engagement features. **Includes sub-features**: I3 Actionable insight cards — smart tips on underutilised caps, categories with no logged spend, unused cards (RICE 2,333); I7 Cap utilisation summary — per-card cap usage for the month (RICE 4,000); I4 Goal projection tie-in — "At this rate, you'll reach [goal] by [date]" (RICE 3,000); I6 Monthly summary notification — push notification at month-end with deep-link to insights (RICE 3,000) | 2000 | 2 | 70% | 3 | 933 | Actionable tip cards surfaced based on monthly data (unused caps, zero-spend categories, idle cards); per-card cap utilisation bars shown on insights screen; goal projection date shown for active goals; month-end push notification with deep-link to earning insights; requires 2+ months of data for trend-based tips |

### Kano Model Classification

| Feature | Kano Category | Rationale |
|---------|---------------|-----------|
| F1: Card Portfolio Setup | **Must-Have** | Essential for any functionality; absence = product doesn't work |
| F2: Spend Category Recommendation | **Must-Have** | Core value proposition; this IS the product |
| F3: Bonus Cap Tracker | **Must-Have** | Primary differentiator; without it, we're just another static guide |
| F4: Transaction Logging | **Must-Have** | Required for cap tracking accuracy |
| F5: Card Rules Database | **Must-Have** | Foundation for all recommendations |
| F6: Cap Approach Alerts | **Performance** | More alerting = more satisfaction; directly correlated |
| F7: Miles Earning Insights | **Performance** | More insight = more satisfaction; proves value. Now integrated into Miles tab for better discoverability. I1 (Top Earning Card) and I2 (Category breakdown) are Performance; I5 (Fixed baseline) is Must-Have for trust |
| F8: Quick-Access Widget | **Delighter** | Unexpected convenience; "wow, that's fast" moment |
| F9: Merchant Search | **Performance** | Useful for edge cases; more coverage = more confidence |
| F10: Portfolio Optimizer | **Delighter** | Unexpected value; shifts from reactive to proactive tool |
| F11: Promo Tracker | **Performance** | More promos tracked = more value captured |
| F12: Social/Community | **Delighter** | Fun but not expected; engagement booster |
| F13: Miles Portfolio Dashboard | **Must-Have** | Core miles visibility; users need to see their balances to engage with the miles ecosystem |
| F14: Manual Miles Balance Entry | **Must-Have** | Required for accurate display total; without it, balances are incomplete |
| F15: Miles Redemption Logging | **Performance** | More tracking = more accurate picture; drives engagement loop |
| F16: Miles Goal Tracker | **Delighter** | Unexpected motivational feature; gamifies the miles journey |
| F17: Miles Earning Insights (Extended) | **Performance** | Extends F7 with deeper analytics. I3 (Actionable tips) and I7 (Cap utilisation summary) are Performance; I4 (Goal projection) and I6 (Monthly notification) are Delighters that drive engagement loops |
| F18: Two-Layer Miles Architecture | **Must-Have** | Users think in destinations (airline miles), not sources (bank points); essential mental model alignment |
| F19: Transfer Partner Mapping | **Must-Have** | Foundation for "potential miles" calculation; without it, Layer 1 can't show transferable value |
| F20: Smart Transfer Nudges | **Delighter** | Proactive value — surfaces hidden optimization opportunities users didn't know they had |
| F21: Expanded Miles Programs | **Performance** | More programs = more complete picture; absence means missing major banks/airlines |
| F22: Card Coverage Expansion (20→22) | **Performance** | PARTIALLY COMPLETE. Maybank World MC + UOB Visa Signature added. More cards = more users served |
| F33: Card Database Expansion (22→29) | **Performance** | Continuation of F22. 7 more cards = broader market coverage (~85%). UOB Lady's Solitaire category selection is a Delighter sub-feature |
| F23: Rate Change Alerts | **Delighter** | Unexpected proactive value; "the app watches out for me"; builds deep trust |
| F24: Community Rate Submissions | **Performance** | More community input = faster detection = more trust; directly correlated with data freshness |
| F25: Automated Rate Detection | **Must-Have** (for scale) | Without automation, card rules database degrades over time; manual updates are the #1 operational risk |
| F26: Apple Pay Shortcuts Auto-Capture | **Delighter** → **Must-Have** (for retention) | Unexpected automation that "just works" for Apple Pay users; eliminates the #1 friction (manual logging) and converts a chore into a delight. Becomes Must-Have once users experience it — they won't go back to manual |
| F27: Android Notification Auto-Capture | **Delighter** | Same automation delight for Android users; full notification interception feels magical; one-time setup then passive value delivery |
| F28: Demo Mode | **Performance** (for go-to-market) | Critical enabler for product demonstrations, investor presentations, and sales demos; eliminates the requirement for real transactions during demos; purely operational value (no end-user impact in production) |
| F29: Push Notifications for Rate Changes | **Delighter** → **Performance** (retention driver) | Unexpected proactive value; "the app watches out for me" even when I'm not using it; builds deep trust and drives re-engagement. Initially a delighter but becomes performance driver as users come to expect timely rate change alerts. Critical retention lever: push-enabled users show 15-25% higher retention vs non-push users. **Built as production-ready system in Sprint 13 but not user-enabled pending launch decision; includes comprehensive demo mode for stakeholder presentations** |
| F30: Petrol/Bills Category Resolution | **Must-Have** (data integrity) | Without this fix, 140 petrol earn rules are invisible to users and bills recommendations are meaningless (all cards show undifferentiated base rate). This is a data quality issue that undermines trust in the core recommendation engine — the #1 value prop. Blocking prerequisite for accurate recommendations in 2 of 8 categories |
| F31: Min Spend Condition Enforcement | **Must-Have** (recommendation accuracy) | Without this, ~5 of 20 cards produce wrong recommendations for low spenders. SC X Card appears as 3.3 mpd but earns 0.4 mpd if user doesn't hit $500/month. Users who follow a wrong recommendation and check their statement will lose trust permanently. This is the most impactful recommendation accuracy gap identified in the MileLion comparison |
| F32: Condition Transparency in UI | **Performance** (trust building) | More condition transparency = more user trust. Directly correlated with recommendation confidence. Without it, users see "4 mpd" but don't know it requires contactless payment or SIA bookings only — leading to disappointment when actual earning differs. Low effort, high trust impact |

### Impact-Effort Matrix

```
                    HIGH IMPACT
                    |
     F6 (Alerts)   |  F1 (Portfolio Setup)
     F4 (Logging)  |  F2 (Recommendation)
     F14 (Balance) |  F3 (Cap Tracker)
     F21 (Programs)|  F5 (Rules DB)
     F20 (Nudges)  |  F18 (Two-Layer)
     F22 (22 ✓)   |  F19 (Transfer Map)
     F33 (29 Cards)|
     F24 (Community)|  F13 (Miles Dashboard)
   ★ F26 (iOS Auto)|  F23 (Rate Alerts)
  ★★ F30 (Petrol/  |  F25 (Auto Detect)
       Bills Fix)  |  F27 (Android Auto)
   ★ F32 (Cond.UI) |  F31 (Min Spend)
  ──────────────────┼──────────────────
                    |
     F8 (Widget)   |  F10 (Portfolio Opt)
     F9 (Merchant) |  F11 (Promo Tracker)
     F15 (Redeem)  |  F12 (Social)
     F16 (Goals)   |
     F28 (Demo)    |
                    |
                    LOW IMPACT
   LOW EFFORT ──────────────── HIGH EFFORT
```

> **Note**: F30 (Petrol/Bills Fix) is marked with ★★ as the highest-priority data integrity fix — highest RICE score (9,500) across all features, unlocks 140 existing earn rules, and resolves a long-standing category conflict. F32 (Condition UI) is marked ★ as a high-impact quick win (surfaces existing data). F31 (Min Spend Enforcement) sits at the intersection of high impact and medium effort — prevents wrong recommendations for ~5 cards.

> **Note**: F26 (iOS Shortcuts Auto-Capture) is marked with ★ as the highest-value quick win in the matrix — high impact (solves #1 product risk) with low effort (2-3 sprints, zero native code). F27 (Android Notification Auto-Capture) is high impact but higher effort due to native module requirement. F28 (Demo Mode) is low effort and primarily enables go-to-market activities (demos, presentations) rather than direct end-user value.

### Explicitly Out of Scope (v1)

| Feature | Reason | Revisit |
|---------|--------|---------|
| Bank API integration / auto-transaction import | SGFinDex not open to fintechs; regulatory complexity | v2 (when SGFinDex opens to fintechs) |
| Cashback card optimization | Miles-only focus for v1; dilutes positioning | v2 if market demands |
| Card application / affiliate links | Avoid conflict of interest in recommendations; trust-first approach | v1.5 after establishing credibility |
| International card support | Singapore-only focus for v1 | v2 (Malaysia, Hong Kong) |
| Bills sub-categories (telco/utilities/insurance) | Telco and utilities produce identical recommendations (all base rate). Insurance handled via warning banner (F32). Sub-categories add UI complexity for zero accuracy gain. Decision: Feb 2026 | Only if cards differentiate telco vs utility earn rates |
| MCC-level earn rule granularity | Category-level scoring sufficient for 95% of transactions. MCC-level would require major schema change. Only known impact: HSBC Rev fast food exclusion, handled via `exclusions` table (F32) | v2 if accuracy demands increase |
| Card stacking / combo recommendations | Different product scope — MaxiMile is a per-transaction recommender, not a portfolio advisor. MileLion covers this editorially | v2 if user demand emerges |
| MCC switching strategies (HeyMax, Atome) | Power-user optimization beyond core recommendation scope. Requires partnership integrations | v2+ |
| Points currency quality scoring | Not all "4 mpd" is equal (AMEX MR > Citi ThankYou), but only matters for tied-MPD cards. Current alphabetical tiebreaker is acceptable for v1 | v1.5 as refinement |
| Overseas / FCY spend optimization | Intentional Singapore local-only scope. FCY requires FCY fee data, card pairing logic, separate earn rates — significant new data model. MileLion comparison confirms this is a distinct product dimension | v2 (Malaysia, Hong Kong expansion) |
| Apple Wallet / Google Pay deep integration | Direct Wallet SDK integration still requires OS-level permissions and Apple/Google partnership. However, **F26 (iOS Shortcuts)** provides a user-side bridge to Apple Pay transaction data via the sanctioned Shortcuts Transaction trigger (note: user must manually add the automation — Apple does not allow programmatic installation), and **F27 (Android NotificationListener)** captures Google Pay/Samsung Pay notifications. Full Wallet SDK integration remains out of scope | v3 (if Apple/Google open APIs) |
| Invite-only ultra-premium cards (DBS Insignia, Citi ULTIMA, Amex Centurion) | Combined <7.5k holders in SG; rules not publicly verifiable; RICE score 125 (lowest); these holders already have mainstream cards in our DB | v2.0 backlog |
| Non-miles cards (cashback, rewards-only) | Miles-only focus. POSB Everyday Card reclassified as cashback (earns DBS Daily$, not miles) and removed from miles card database. **SC Smart Card deferred (P3)**: primarily a cashback card with specific merchant bonuses (McDonald's, KFC, Netflix, SimplyGo); miles conversion requires $27.25 fee with unfavorable rate (~0.4 mpd effective base); up to 9.28 mpd equivalent only on bonus merchants at $1,500+ spend tier. Does not fit miles optimizer positioning | Only if product pivots to general rewards |
| Low-priority niche cards (Diners Club, RHB, ICBC) | Negligible miles value; very small user base; poor conversion rates | v2.0 backlog if demand emerges |

---

## 9. User Stories (High-Level)

### Epic 1: Card Portfolio Management
- As a miles optimizer, I want to add my credit cards to the app, so that I get recommendations tailored to my actual portfolio
- As a user, I want the app to auto-populate card rules when I add a card, so that I don't have to manually enter earn rates
- As a user, I want to remove or update cards in my portfolio, so that my recommendations stay current

### Epic 2: Smart Card Recommendation
- As a user at checkout, I want to select a spending category and instantly see which card to use, so that I earn maximum miles on this transaction
- As a user, I want to see the earn rate and remaining cap for the recommended card, so that I understand why this card is recommended
- As a user, I want alternative card options ranked by earn rate, so that I have a backup if I don't have my top card with me

### Epic 3: Spending & Cap Tracking
- As a user, I want to quickly log my transactions after payment, so that my cap tracking stays accurate
- As a user, I want to see my remaining bonus cap per card per category at a glance, so that I know when to switch cards
- As a user, I want to receive an alert when I'm approaching a card's bonus cap, so that I can proactively switch to the next best card

### Epic 4: Miles Earning Insights (Integrated)
- As a user, I want to see how many miles I earned this month, so that I feel motivated and see the product's value
- As a user, I want to see how many extra miles I earned vs using a single "default" card, so that I can quantify the benefit of optimizing
- As a user, I want a monthly summary of my cap utilization across cards, so that I understand my spending patterns
- As a miles optimizer, I want to see which card earned me the most miles this month, so that I know which cards are most valuable *(I1)*
- As a user, I want to see my spending broken down by category with miles earned, so that I understand where my miles come from *(I2)*
- As a user, I want the miles saved calculation to use a realistic baseline, so that I trust the number *(I5)*
- As a user, I want actionable tips based on my monthly data, so I can improve my optimization next month *(I3)*
- As a user, I want to see per-card cap utilisation for the month, so I know which caps I'm underusing *(I7)*
- As a user with a miles goal, I want to see how my monthly earning rate maps to my goal timeline *(I4)*
- As a user, I want a monthly notification when my earnings report is ready *(I6)*

### Epic 8: Miles Portfolio & Goal Tracking (F13–F16)
- As a user, I want to see all my miles balances across loyalty programs in one place, so that I know my total rewards position
- As a user, I want to set my starting miles balance per program, so that auto-earned miles add to the correct baseline
- As a user, I want to log miles I've redeemed for flights, so that my displayed balance stays accurate
- As a user, I want to set miles goals per program with progress tracking, so that I stay motivated toward a reward target
- As a user, I want to see which of my cards contribute to each loyalty program, so that I understand the earn pathways

### Epic 9: Miles Ecosystem — Two-Layer Architecture (F18–F21)
- As a user, I want to see my airline miles (KrisFlyer, Asia Miles, etc.) as the primary view, so that I know what flights I can book right now
- As a user, I want to see both "confirmed" miles (already in my FFP account) and "potential" miles (bank points that can transfer), so that I understand my full redemption power
- As a user, I want a secondary view showing my bank reward points (DBS Points, HSBC Rewards, etc.) and where they can transfer to, so that I can decide which airline to transfer into
- As a user, I want to see the conversion rate when transferring bank points to airline miles, so that I can compare value across pathways
- As a user, I want smart suggestions when I have idle bank points, so that I don't miss transfer opportunities before devaluations
- As a user with HSBC, Amex, or BOC cards, I want my bank points programs to appear in the app, so that my portfolio is complete (not just DBS/UOB/OCBC/Citi/SC/Maybank)

### Epic 10: Card Coverage Expansion & Rate Monitoring (F22–F23, F33)
- As a user with a DBS Vantage or OCBC VOYAGE card, I want my card to be supported in MaxiMile, so that I get accurate recommendations for my premium miles card
- As a user, I want to see all mainstream miles cards in Singapore when browsing available cards, so that I can find and add any card I hold
- As a young professional (21-39) with Maybank XL Rewards, I want the app to show me my card's unique earn categories, so that I maximize its 4 mpd across dining/shopping/travel
- As a female user with UOB Lady's Solitaire, I want to choose my 2 preferred reward categories in the app, so that my recommendations reflect the 4 mpd bonus on my selected categories
- As a UOB Lady's Solitaire user, I want to update my chosen categories each quarter, so that my recommendations stay aligned with my spending priorities
- As a user with SC Journey Card, I want my online food delivery and grocery delivery spend to show the 3 mpd bonus, so that I know to use this card for Grab and online groceries
- As a user with DBS Vantage, I want the app to show me 1.5 mpd (not 1.0) when I meet the $2,000/month min spend, so that my recommendation reflects my actual earning
- As a user with HSBC Premier Mastercard, I want my flat 1.4 mpd rate to be reflected, so that the card appears as a competitive general spend option
- As a user with SC Beyond Card, I want the app to support my premium card's flat 1.5 mpd rate, so that I see recommendations for my $1,635/year card
- As a user, I want to be alerted when my card's earn rates change (e.g., Amex MR devaluation, DBS cap cuts), so that I can adjust my spending strategy before losing miles
- As a user, I want to see a "rate updated" indicator on affected cards, so that I know which cards have recently changed and can review the impact
- As a user, I want to see which cards are eligible for me during setup (filtering by age, banking relationship), so that I don't waste time browsing cards I can't apply for

### Epic 12: Transaction Auto-Capture (F26–F27)
- As an iPhone user, I want my Apple Pay NFC transactions to auto-populate in MaxiMile, so that I don't have to manually type in every purchase
- As a new user during onboarding, I want the option to set up auto-capture right after adding my cards (Step 1.5), so that I start capturing transactions from day one without having to find the setting later
- As a user who skipped auto-capture during onboarding, I want to set it up later via Settings or a discovery nudge on the Log tab, so that I'm not locked out
- As a user, I want to set up auto-capture in under 2 minutes with a guided wizard, so that the setup doesn't feel burdensome
- As an iOS user, I understand that I need to manually tap "Add Automation" in the Shortcuts app because Apple does not allow automatic installation, so that I have correct expectations during setup
- As a user, I want auto-captured transactions to show a pre-filled form for one-tap confirmation, so that I can quickly verify the amount and category before logging
- As a user, I want to see whether I used the best card for each auto-captured transaction (recommendation match indicator), so that I learn which cards to use over time and see proof that MaxiMile is helping me earn more miles
- As a user who used a suboptimal card, I want a gentle "tip" nudge showing the better card for next time, so that I gradually improve without feeling shamed
- As a user, I want the app to auto-detect the spend category from the merchant name, so that I don't have to manually select the category every time
- As a user, I want the option to enable fully automatic logging (skip confirmation tap), so that my transactions are captured with zero effort
- As a user who triggered Smart Pay and then paid with Apple Pay, I want the auto-capture to replace the manual amount entry step (within 60 seconds of returning from Wallet), so that the Smart Pay flow completes seamlessly without redundant input
- As an Android user, I want my banking app notifications to be automatically parsed into transaction logs, so that my cap tracking stays accurate without manual input
- As an Android user, I want to clearly understand what data MaxiMile reads from my notifications, so that I feel comfortable granting notification access
- As a user who pays with both Apple Pay and physical cards, I want non-auto-captured transactions to fall back to the existing manual log flow, so that my cap tracking covers all spending

### Epic 11: Rate Change Detection Pipeline (F24–F25)
- As a user who notices a rate change, I want to submit it via an in-app form with evidence, so that the community benefits from my discovery
- As a user, I want to see my submission history and whether each was approved/rejected, so that I know my contributions are valued
- As a contributor with 3+ approved submissions, I want a "Verified Contributor" badge, so that I'm recognised for helping keep data accurate
- As an admin, I want to review pending community submissions and approve/reject/edit them, so that only verified changes reach users
- As a product owner, I want automated monitoring of bank T&C pages, so that rate changes are detected within 48 hours without manual effort
- As an admin, I want a pipeline health dashboard showing scraper uptime and detection accuracy, so that I can monitor system reliability

### Epic 13: Push Notifications for Rate Change Alerts (F29 + F6 Integration + Demo Mode)
- As a user, I want to opt into push notifications during onboarding with a clear explanation of value, so that I never miss critical rate changes without feeling pressured (production-ready but disabled by default pending launch decision)
- As a user, I want to receive immediate push notifications for critical rate changes (devaluations, major earn rate cuts), so that I can adjust my strategy before the change becomes effective
- As a user, I want warning-level rate changes (cap reductions, moderate cuts) batched into a daily 9 AM notification, so that I stay informed without being overwhelmed
- As a user, I want granular control over which types of notifications I receive (critical/warning/info toggles), so that I only get alerts that matter to me
- As a user, I want to set quiet hours for notifications, so that I'm not disturbed during sleep hours
- As a user, I want to tap a notification and be taken directly to the affected card's detail screen, so that I can quickly review the change and see alternatives
- As a user, I want to see a notification history in Settings, so that I can review past alerts even if I dismissed them
- As a user approaching a bonus cap (F6), I want a push notification at 80% usage suggesting an alternative card, so that I don't exceed the cap and lose earning potential
- As a user with multiple rate changes affecting my portfolio within a week, I want them collapsed into a single digest notification, so that I'm not bombarded with individual alerts
- As a user, I want notification copy to be clear and actionable (showing impact in SGD or mpd), so that I understand why the alert matters and what to do about it
- **As a stakeholder viewing a demo, I want push notifications to auto-trigger when I first visit the Miles tab, so that I can experience the complete notification flow without waiting for real rate changes**
- **As a stakeholder viewing a demo, I want to see realistic examples of critical, warning, and info notifications with proper severity-based timing, so that I understand the full feature value proposition**
- **As a product manager demoing the system, I want demo notifications to showcase deep-link navigation to card details, so that stakeholders see the complete user journey**

### Epic 14: Recommendation Accuracy Improvements (F30–F32, Post-MileLion Analysis)

**Context**: Comparative analysis against MileLion's credit card guide identified three recommendation accuracy gaps. These stories address data integrity and scoring correctness — the foundation all other features rely on.

#### F30 — Petrol/Bills Category Resolution
- As a driver, I want to see "Petrol" as a spend category in the app, so that I get optimized card recommendations for fuel purchases at Shell, Esso, Caltex, and SPC
- As a user paying bills (Singtel, SP Services, Starhub), I want the Bills category to show differentiated card recommendations, so that I know which card earns the most on recurring payments (not just undifferentiated base rates)
- As a user paying insurance premiums, I want to see a clear warning that most cards exclude insurance from earning, so that I don't expect miles from my Prudential or AIA payments
- As a user at a petrol station, I want Google Places to detect the location as "Petrol" (not "Transport"), so that the auto-detected category matches the correct earn rules

#### F31 — Min Spend Condition Enforcement
- As a user who spends less than $500/month, I want SC X Card to show me 0.4 mpd (not 3.3 mpd), so that I don't follow a recommendation that won't actually earn me bonus miles
- As a user who spends less than $600/month, I want UOB Preferred Platinum to show me 0.4 mpd (not 4 mpd) on dining, so that my recommendation is accurate
- As a user, I want to set my estimated monthly spending level (in settings or onboarding), so that the app knows whether I meet card-specific minimum spend thresholds
- As a user who hasn't met a card's min spend yet this month, I want to see "Spend $X more to unlock bonus rate" on the recommendation card, so that I understand why the earn rate is lower than expected and what I can do about it

#### F32 — Condition Transparency
- As a user viewing a recommendation, I want to see any conditions attached to the earn rate (e.g., "Requires contactless", "SIA bookings only", "Min spend $500/month"), so that I know the fine print before choosing a card
- As a user looking at HSBC Revolution for dining, I want to know that fast food (MCC 5814) is excluded from the 4 mpd bonus, so that I use a different card at McDonald's or KFC
- As a user browsing Bills recommendations, I want a visible warning that insurance MCCs (6300/6381/6399) are excluded by most cards, so that I have realistic expectations for insurance payments

---

## 10. Assumptions & Hypotheses

### Assumptions (Believed True)

| Assumption | Evidence | Risk if Wrong |
|------------|----------|---------------|
| Users are willing to manually log transactions in v1 | Seedly users already track expenses manually; miles community is motivated. **Mitigation planned**: F26 (iOS Shortcuts) and F27 (Android notification capture) reduce manual logging by ~20-25% of transactions in v1.8+, with further coverage as adoption grows | Core cap tracking feature becomes inaccurate; reduces trust. Auto-capture (F26/F27) is the primary mitigation strategy |
| Card rules can be sourced from public information (bank websites, T&Cs) | MileLion and Suitesmile already aggregate this info; it's publicly available | Legal/data sourcing risk; delays in rule updates |
| Users hold 3+ miles cards on average | Community forums show 3–7 cards typical for active optimizers | Product less valuable for 1–2 card users; smaller addressable market |
| Miles community (MileLion, Telegram) will drive early adoption | Strong, engaged community with shared pain point | Need alternative acquisition channels; higher CAC |
| Users will open the app at the point of payment | High motivation at decision moment; quick-access widget reduces friction | If too slow/cumbersome, users won't form the habit |

### Hypotheses (To Validate)

| Hypothesis | How to Validate | Success Criteria |
|------------|-----------------|------------------|
| Automated recommendations increase miles earned by 20–40% | A/B comparison: track miles earned with vs without app over 3 months | 20%+ increase in effective mpd |
| Users will log 70%+ of transactions | In-app tracking of log completion rate | 70%+ transactions logged within 24 hours |
| Auto-capture (F26) improves retention by reducing logging fatigue | Compare Day-7 and Day-30 retention for users with vs without Shortcut setup | 10%+ retention improvement for auto-capture users |
| Auto-capture (F26) unlocks the "Passive Peter" persona | Track adoption and retention of users who set up auto-capture but rarely open the app proactively | 20%+ of auto-capture users are "passive" users who wouldn't log manually |
| Cap alerts reduce cap breaches by 80% | Compare cap breach rate pre/post adoption | 80%+ reduction in months where cap is unknowingly exceeded |
| Free tier converts 10–15% to premium | Conversion funnel analytics | 10%+ conversion within 3 months |

---

## 11. Constraints

### Technical Constraints
- No direct bank API access — transactions must be manually logged by user in v1. Partially mitigated in v1.8+ by F26 (iOS Shortcuts auto-capture for Apple Pay NFC transactions) and F27 (Android notification auto-capture)
- Card rules must be manually maintained and updated from public sources
- SGFinDex is not currently open to fintech developers
- F27 (Android NotificationListenerService) requires Expo Dev Build with custom native module — not compatible with Expo Go
- F26 (iOS Shortcuts) requires iOS 17+ — covers ~90%+ of active iPhones in Singapore
- F26 (iOS Shortcuts) automations **cannot be programmatically installed** — Apple does not allow apps to create Personal Automations via API. User must manually tap "Add Automation" in the Shortcuts app. This is a hard platform constraint

### Business Constraints
- Singapore-only market limits total addressable market in v1
- Freemium model requires sufficient free-tier value to drive adoption before monetization
- No affiliate revenue in v1 (trust-first positioning)

### Resource Constraints
- Small team — must scope MVP tightly to 5 core features
- Card rules database maintenance is an ongoing operational cost
- Community partnerships (MileLion, Suitesmile) require relationship-building

---

## 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| **Card rules change without notice** | High | High | Community-sourced verification; automated monitoring of bank T&C pages; rapid update process | Data/Ops Team |
| **User fatigue from manual transaction logging** | Medium | High | Minimize logging friction (<10 sec); build smart defaults; **F26/F27 auto-capture reduces logging to ~2-3 sec for Apple Pay / 0 sec for Android notifications**; prioritize bank API integration in v2 | Product/UX |
| **Banks build competing native features** | Medium | Medium | Move fast to establish user base and brand trust; offer cross-bank value that no single bank can replicate | Product/Strategy |
| **Low adoption / cold start** | Medium | High | Partner with miles blogs for launch; offer compelling free tier; leverage Telegram communities | Growth/Marketing |
| **Inaccurate recommendations erode trust** | Low | Critical | Rigorous QA on card rules; community flagging system; transparency in recommendation logic | Data/QA |
| **Min spend conditions not enforced in scoring** | High | High | ~5 of 20 cards have min spend conditions (SC X Card: $500/mo, UOB Preferred Platinum: $600/mo, Maybank cards: $300/mo) that are stored but not enforced — producing wrong recommendations for low spenders. F31 addresses this by checking `conditions->>'min_spend_monthly'` against actual monthly spend. Without F31, users who follow recommendations and check their statement will lose trust permanently. Identified via MileLion competitive analysis (Feb 2026) | Product/Engineering |
| **Petrol/bills data conflict produces empty recommendations** | High | Medium | 140 petrol earn rules exist in DB but were previously invisible in frontend. Bills category had UI but zero earn rules — `recommend('bills')` returned undifferentiated base rates. F30 resolves by ensuring both categories have complete data and correct mappings. Identified via CARD_DATA_VERIFICATION.md review | Data/Engineering |
| **Miles program devaluations reduce user motivation** | Medium | Medium | Position value as "get the most from what you have" regardless of program changes; track sentiment | Product |
| **Regulatory issues with financial data/advice** | Low | High | Legal review; position as informational tool, not financial advice; comply with MAS guidelines | Legal |
| **Transfer rates change without notice** | High | Medium | Automated monitoring of bank transfer pages; community-sourced alerts; version-stamped rates with "last verified" dates shown to users | Data/Ops Team |
| **User confusion between bank points and airline miles** | Medium | Medium | Two-layer architecture with clear labelling; onboarding tooltip explaining "Points vs Miles"; visual distinction (bank icon vs airline icon) | Product/UX |
| **AI misclassifies a rate change (false positive)** | Medium | High | Confidence thresholds (>=0.85 auto-approve, <0.50 discard); admin review queue for mid-confidence; user flagging mechanism | AI/Data Team |
| **Bank T&C page structure changes break scrapers** | High | Medium | CSS selector versioning; fallback to full-page diff; automated alerting on scrape failures; daily health dashboard | Data/Ops Team |
| **Community submissions are low quality or spam** | Medium | Low | Rate limiting (5/day/user); evidence requirements (URL/screenshot); reputation system; admin verification gate | Product/Community |
| **Free-tier LLM API limits tightened** | Medium | Low | Dual-provider strategy (Gemini Flash primary + Groq Llama fallback); abstracted provider layer; paid fallback costs only $1-5/mo | Engineering |
| **Apple changes/removes Shortcuts Transaction trigger** | Low | High | This is a stable, promoted API introduced in iOS 17; monitor WWDC announcements; fallback to manual logging always available | Engineering |
| **iOS 18+ reliability issues with Shortcuts trigger** | Medium | Medium | Build error reporting and retry mechanism; document known iOS bugs; fallback to manual logging for failed triggers | Engineering |
| **Users assume auto-capture covers ALL transactions** | Medium | High | Clear messaging: "Works with Apple Pay contactless payments only"; show which transactions were auto-captured vs manually logged; expectation-setting during onboarding Step 1.5 | Product/UX |
| **iOS Shortcut setup drop-off due to manual "Add Automation" step** | Medium | Medium | Apple does not allow programmatic Shortcut installation — user must manually tap "Add Automation" in the Shortcuts app. Mitigation: pre-configured `.shortcut` file minimizes effort to ~30 seconds; setup wizard provides step-by-step guidance; onboarding Step 1.5 catches users at peak motivation | Product/UX |
| **Android notification access permission scares users** | Medium | Medium | Prominent privacy disclosure; on-device-only processing; never upload raw notification content; transparent privacy policy; gradual rollout with opt-in | Product/UX |
| **SG bank notification format changes break Android parsers** | Medium | Low | Regex patterns per bank with version control; community-reported format changes; automated test suite with sample notifications | Engineering |
| **Push notification fatigue leads to high opt-out rate (F29)** | Medium | High | Frequency caps (<4 notifications/user/month avg); smart batching (warning=daily, info=weekly); granular user controls; portfolio-aware filtering (only owned cards); auto-throttle for non-engaging users; monitor opt-out rate weekly (target <5% when launched); system ready but disabled in production pending launch decision | Product/UX |
| **Low push permission opt-in rate on iOS (F29)** | Medium | Medium | Pre-permission primer explaining value ("Never miss a rate change"); ask during onboarding Step 1.5 (contextual timing); retry after user's first in-app rate change alert; A/B test primer copy; accept lower iOS adoption, focus on Android + in-app fallback | Product/UX |
| **Push notification delivery failures (F29)** | Low | Medium | Fallback to in-app banner (source of truth); retry critical notifications once after 1 hour; monitor Expo API status; alert eng team if delivery rate <85% for 24 hours; log delivery status for all notifications | Engineering |
| **Irrelevant push notifications damage trust (F29)** | Low | High | Portfolio-aware filtering (only cards user owns); exclude cards unused in 90+ days (except critical devaluations); user feedback loop ("Was this helpful?"); one-tap opt-out in-app; monthly health check (auto-switch to digest if >10 notifications/month) | Product/UX |

---

## 13. Dependencies

| Dependency | Type | Status | Impact if Delayed |
|------------|------|--------|-------------------|
| Card rules database (initial build) | Internal | Not started | Blocks all recommendation features |
| Mobile app development (iOS + Android) | Internal | Not started | Blocks launch |
| MileLion/Suitesmile partnership | External | Not initiated | Reduces launch reach but not blocking |
| SGFinDex fintech access | External | Not available | Blocks auto-transaction import (v2 feature) |
| App Store / Play Store approval | External | N/A | Could delay launch by 1–2 weeks |
| Apple Shortcuts Transaction trigger API stability (F26) | External | Stable (iOS 17+) | If Apple deprecates trigger, F26 auto-capture becomes unavailable; manual logging remains |
| Expo Dev Build for native Android module (F27) | Internal | Available | Required for NotificationListenerService; blocks F27 if team is using Expo Go only |
| expo-notifications package (F29) | Internal | Available (v0.32.16 installed) | Already in package.json; F29 implementation ready to start |
| Expo Push Notification Service (F29) | External | Stable | Free tier 600K/month; if unavailable, can switch to OneSignal or direct FCM/APNs |
| F23 Rate Change Monitoring (F29 dependency) | Internal | Shipped (Sprint 12) | F29 requires F23's rate_changes table and in-app banner infrastructure as foundation |

---

## 14. Open Questions

| Question | Owner | Due Date | Status |
|----------|-------|----------|--------|
| What is the legal position on scraping/aggregating bank card T&Cs? | Legal | Pre-launch | Open |
| Should we pursue MAS regulatory sandbox for financial recommendation features? | Legal/Product | Pre-launch | Open |
| What is the monetization split between freemium subscription and future affiliate revenue? | Business | Sprint 2 | Open |
| Can we partner with MileLion/Suitesmile for launch distribution? | Growth | Sprint 1 | Open |
| Should we build iOS-first or cross-platform from day one? | Tech Lead | Sprint 0 | Open |
| Should `bills` category be sub-categorized into telco/utilities/insurance? | PM/SME | 2026-02-26 | **Resolved: No** — Telco and utilities produce identical recommendations (all base rate across 20 cards). Insurance is the only sub-type that differs (excluded by most cards). Solution: single `bills` category with insurance warning banner instead of sub-categories. See `docs/technical/MAXIMILE_VS_MILELION_ANALYSIS.md` |
| Should we match MileLion's 12+ category granularity? | PM/SME | 2026-02-26 | **Resolved: No** — 8 categories sufficient. MileLion's splits (air vs hotels, SimplyGo vs ride-hailing) produce identical earn rates within MaxiMile's scoring algorithm. Focus on condition enforcement (F31) over category proliferation |
| How deep should card recommendation logic go ("just enough" vs "holy bible")? | PM/SME | 2026-02-26 | **Resolved: "Just enough"** — Focus on accurate per-transaction recommendations (our core value prop), not comprehensive consumer education (MileLion's value prop). MileLion serves card selection; MaxiMile serves card usage. Different products, different depth requirements |

---

## 15. Release Strategy

### MVP Definition
A mobile app where users can:
1. Add their miles credit cards (from 29 SG miles cards)
2. Get instant card recommendations by spend category
3. Track spending against bonus caps
4. Log transactions to keep tracking accurate
5. Receive alerts when approaching caps

**MVP = Features F1 + F2 + F3 + F4 + F5**

### Phase Plan

| Phase | Features | Timeline | Success Criteria |
|-------|----------|----------|------------------|
| **MVP** | F1–F5: Card setup, Recommendations, Cap tracking, Transaction logging, Rules DB | Months 1–3 | 1,000 users, 70% log rate, <5% rule error rate |
| **v1.1** | F6, F10: Cap alerts, MCC crowdsource validation | Months 4–5 | 3,000 users, 60% monthly retention, NPS 40+, 30%+ MCC contribution rate |
| **v1.2** | F7, F13–F14: Miles Earning Insights (integrated into Miles tab) + Miles Portfolio Dashboard + Manual Balance Entry. **Includes Phase 1 Earning Insights (P0 quick wins)**: I1 Top Earning Card highlight, I2 Category spending breakdown, I5 Fixed Miles Saved baseline (1.4 mpd) | Months 5–6 | 40% of users enter at least one balance; Miles tab DAU = 30% of MAU; 60% of active users view earning insights weekly; top earning card visible on insights screen; category breakdown renders for users with 5+ transactions |
| **v1.3** | F15–F16: Miles Redemption Logging + Goal Tracker. **Includes Phase 2 Earning Insights (P1 value deepening)**: I3 Actionable insight cards, I7 Cap utilisation summary. **Phase 3 Earning Insights (P1 engagement loop)**: I4 Goal projection tie-in, I6 Monthly summary notification | Months 6–7 | 25% of users log at least one redemption; 30% create a goal; engagement loop established; actionable tip cards shown for users with underutilised caps; month-end push notification delivered with >20% open rate |
| **v1.4** | F18–F21: Two-Layer Architecture + Transfer Partners + Expanded Programs + Smart Nudges | Months 7–9 | All 9 SG banks covered; 50%+ of users view Layer 1 (My Miles) daily; transfer nudge CTR > 15%; Asia Miles and KrisFlyer both tracked by 40%+ of active users |
| **v1.5** | F22 (DONE): Card Coverage 20→22 (Maybank World MC + UOB Visa Signature). F33: Card Expansion 22→29 (DBS Vantage, UOB Lady's Solitaire, OCBC Voyage, SC Journey, SC Beyond, HSBC Premier MC, Maybank XL Rewards). F23: Rate Change Monitoring & Alerts. SC Smart Card deferred (cashback). UOB Lady's Solitaire category selection UX | Months 9–11 | 29 cards in database (~85% market coverage); 25% increase in addressable users; UOB Lady's Solitaire category selection functional; rate change alerts delivered within 48 hrs; age-restricted cards filtered in setup |
| **v1.6** | F24: Community-Sourced Rate Change Submissions + admin verification dashboard. Closes Layer 1 detection gap with user-generated content | Months 11–12 | 10+ community submissions/month by month 3; <15 min/day admin review time; 0 false positives published; contributor badge system active |
| **v1.7** | F25: Automated Rate Change Detection — GitHub Actions scraper + Gemini Flash AI classifier. $0/month infrastructure. Full detection pipeline | Months 12–14 | 90%+ of real rate changes auto-detected within 48 hours; 95%+ precision on published changes; pipeline uptime >=99%; admin review <30 min/month |
| **v1.8** | F29: Push Notifications (Complete System + Demo Mode) + F26: Apple Pay Shortcuts Auto-Capture — F29: production-ready push notification infrastructure with demo mode for stakeholder presentations (system built but not user-enabled pending launch decision); F26: deep link handler, merchant→category mapping, card name fuzzy matching, downloadable Shortcut template (user must manually add via Shortcuts app — Apple platform constraint), in-app setup wizard offered during onboarding Step 1.5, recommendation match indicator on confirmation screen, Smart Pay auto-capture handoff (60s window). **Solves the #1 product risk (manual logging paradox) with zero native code. Closes the Recommend->Log feedback loop.** | Months 13–15 | F29: Complete notification system built with demo mode showcasing all severity levels; stakeholder demo feedback >4.5/5.0; F26: 30%+ of iOS users complete Shortcut setup; auto-captured transactions confirmed in <3 sec; transaction logging rate improves from 70% to 85%+; Day-7 retention improves by 10%+ for Shortcut-enabled users; recommendation match shown on 100% of auto-captured confirmations |
| **v2.0** | F27: Android Notification Auto-Capture (with onboarding Step 1.5, recommendation match indicator, Smart Pay handoff) + F10–F11: Portfolio optimizer, Promo tracker + bank API exploration + SC Smart Card evaluation (cashback-to-miles) + ultra-premium card expansion (29→35+) | Months 15–18 | Android auto-capture covers top 5 SG banks; 10,000 users, 10%+ premium conversion, revenue positive. SC Smart Card included if product expands to cashback. Note: F29 push notifications built in v1.8 (Month 13) but launch date TBD pending business decision |

---

## 16. Design Considerations (for Designer Handover)

### Innovation Sweet Spot Validation
- [x] **Desirability**: Confirmed user demand via community research (HardwareZone, MileLion, Telegram)
- [x] **Feasibility**: Technically buildable — mobile app + card rules DB + recommendation engine; no novel tech
- [x] **Viability**: Freemium model with premium tier; potential B2B bank partnerships for future revenue

### Mental Models & Conceptual Design
- **User's current mental model**: "I need to remember complex rules and mentally calculate which card is best right now" — like solving a puzzle at checkout
- **Our conceptual model**: "The app is my miles expert in my pocket — I ask which card, it tells me instantly" — like having a personal financial advisor
- **Gulf of Execution risk**: Users may not know which spending category their merchant falls under (e.g., is GrabFood "dining" or "online"?) — provide category guidance and MCC-based auto-detection where possible
- **Gulf of Evaluation risk**: Users may not trust the recommendation without understanding the logic — show earn rate, remaining cap, and reasoning for every recommendation

### Information Architecture Guidance
- **Organization**: Card-centric (my cards) + Category-centric (what am I buying?) — dual entry points
- **Labelling**: Use plain language matching user mental models (e.g., "Dining" not "F&B MCC 5812")
- **Navigation**: Primary flow = Category → Recommendation (1 tap); secondary = Dashboard, Cards, Alerts
- **Search**: Merchant name search with MCC auto-mapping

### Usability & Testing Recommendations
- **Prototyping**: Low-fidelity wireframes for core recommendation flow first; test with 5 miles community users
- **Formative testing**: Can users get a recommendation in <5 seconds from app open? Do they understand the recommendation?
- **Summative testing**: Track effective mpd improvement; measure recommendation adoption rate
- **Cognitive walkthrough**: Focus on the "at checkout" moment — speed, clarity, and trust are paramount
- **A/B testing candidates**: Recommendation display format (card image vs text vs minimalist); transaction logging flow (modal vs inline vs swipe)

### Inclusive & Ethical Design
- **Accessibility**: WCAG 2.1 AA compliance; high contrast for outdoor/bright checkout environments; large tap targets for quick interaction
- **Inclusivity**: Support for users with varying financial literacy — avoid jargon; provide tooltips for "mpd", "MCC", "bonus cap"
- **Ethical considerations**: No dark patterns in premium conversion; transparent recommendation logic (no hidden bank partnerships influencing recommendations); user data privacy (spending data never shared without consent)

### Behavioral Design Notes
- **Defaults**: Auto-select most likely spend category based on time of day (e.g., "Dining" at 12pm–2pm, 6pm–9pm)
- **Loss aversion**: Show "miles you would have missed" without the app — motivates continued use
- **Social proof**: "X users in Singapore saved Y miles this month" — builds community and trust
- **Gamification**: Monthly miles streak; "optimization score" — use carefully to reinforce value, not distract

### Miles Portfolio Design Notes (F13–F21)

**F7 Integration Decision**: The standalone Miles Dashboard (F7) has been integrated directly into the Miles tab (F13). Monthly "Miles Earned" and "Miles Saved" metrics appear as compact stat chips below the hero section. The full earning insights (3-month trend, transaction count, insight card) are accessible via a "View full earning insights" link that pushes to a dedicated screen. This decision was made to:
1. Consolidate all miles-related information in one tab
2. Increase discoverability of earning insights (previously hidden in a separate tab)
3. Reduce tab bar clutter (maintain 5 tabs)
4. Surface the app's value proposition (miles saved) where users already check their balances

**Two-Layer Architecture (F18)**: The Miles tab evolves from a flat list of programs into a two-layer presentation that matches how users actually think about miles:

**Layer 1 — "My Miles" (Destination-Focused, Default View)**
- Shows **airline loyalty programs** the user can redeem with (KrisFlyer, Asia Miles, Qantas FF, etc.)
- Each program displays: existing balance (confirmed) + potential miles from transferable bank points + auto-earned from card spending
- Clear visual distinction between "confirmed miles" (already in airline account) and "potential miles" (bank points that can transfer at shown conversion rate)
- This is the DEFAULT view because users think in destinations: "Can I book that SQ Tokyo flight?"
- Only shows airline programs where the user has a balance OR has cards that feed into them

**Layer 2 — "My Points" (Source-Focused)**
- Shows **bank reward point balances** (DBS Points, HSBC Rewards, Citi Miles, Amex MR, etc.)
- Each bank program shows: current balance, transfer partner options, best conversion rates, transfer fees
- Answers "What should I do with my DBS Points?"
- Smart transfer nudges (F20) appear here: "50k DBS Points idle — transfer to KrisFlyer for 20k miles"

**Switching Between Layers**: Segmented control at top of Miles tab — "My Miles" | "My Points"

**Transfer Partner Data Model (F19)**:
- New `transfer_partners` junction table: source_program_id → destination_program_id
- Fields: conversion_rate (e.g., 2.5:1), transfer_fee, min_transfer_amount, transfer_url
- Powers the "potential miles" calculation in Layer 1 and transfer options in Layer 2
- Must be kept current as banks occasionally change rates (e.g., Amex MR devaluation Feb 2026)

**Expanded Programs (F21) — Full Singapore Coverage**:

*Bank Points / Transferable (10 programs):*
| Program | Bank | Transfer Partners | Status |
|---------|------|------------------|--------|
| KrisFlyer (co-brand direct earn) | Amex, UOB | N/A (direct earn) | Existing |
| Citi Miles / ThankYou Points | Citibank | 10 airlines, 1 hotel | Existing |
| UNI$ | UOB | 3 airlines | Existing |
| OCBC$ | OCBC | 6 airlines, 3 hotels | Existing |
| 360 Rewards | Standard Chartered | 2 airlines | Existing |
| TreatsPoints | Maybank | 4 airlines | Existing |
| DBS Points | DBS | 4 airlines | Existing |
| HSBC Reward Points | HSBC | 16 airlines, 4 hotels | **NEW** |
| Amex Membership Rewards | American Express | 8 airlines, 2 hotels | **NEW** |
| BOC Points | Bank of China | 1 airline (KrisFlyer) | **NEW** |

*Airline FFPs (7 programs — top destinations accessible from SG banks):*
| Program | Airline | Accessible From | Status |
|---------|---------|-----------------|--------|
| KrisFlyer | Singapore Airlines | All 9 banks + Amex | Existing |
| Asia Miles | Cathay Pacific | 8 of 9 banks | **NEW** |
| British Airways Avios | British Airways | 4 banks | **NEW** |
| Qantas Frequent Flyer | Qantas | 5 banks | **NEW** |
| Qatar Privilege Club | Qatar Airways | 3 banks | **NEW** |
| Flying Blue | Air France-KLM | 3 banks | **NEW** |
| Malaysia Airlines Enrich | Malaysia Airlines | 2 banks | **NEW** |

*Lower-priority airline FFPs (deferred, can add later):*
AirAsia Rewards, Turkish Miles&Smiles, Thai Royal Orchid Plus, EVA Air, United MileagePlus, Etihad Guest, Emirates Skywards, Vietnam Airlines, Air Canada Aeroplan, Hainan Fortune Wings, JAL Mileage Bank

### Card Coverage Expansion Design Notes (F22–F23)

**Market Coverage Analysis**: The Singapore miles card market has approximately 45-50 miles-earning cards. Our current 20-card database covers ~60% of the market. Adding 10 high-priority cards brings coverage to ~85%.

**F22 — 10 High-Priority Cards to Add (Phase 1, Sprint 11)**:

| # | Card | Bank | Key Earn Rates | Annual Fee | Special Notes |
|---|------|------|----------------|------------|---------------|
| 1 | DBS Vantage Visa Infinite | DBS | 1.5 mpd local / 2.2 mpd overseas (uncapped) | S$600 | Treasures-tier; income S$120k; 25k miles on fee payment |
| 2 | UOB Lady's Solitaire Metal | UOB | 4 mpd on TWO preferred categories, up to 10 mpd w/ savings | ~S$490 | Women only; higher caps than Lady's Card |
| 3 | UOB Visa Signature | UOB | 4 mpd contactless/petrol/overseas (S$1k min spend) | S$196 | Popular among high-spenders |
| 4 | OCBC VOYAGE Card | OCBC | 1.3-1.6 mpd local / 2.2 mpd overseas (UNCAPPED) | S$498 | VOYAGE Miles transfer to 9+ partners; in-house booking |
| 5 | SC Journey Card | Standard Chartered | 3 mpd groceries/food delivery/ride-hailing (S$1k cap) | S$196 | Unique niche categories |
| 6 | SC Smart Card | Standard Chartered | Up to 9.28 mpd fast food/streaming/EV/transport | S$99 | Extreme niche rates |
| 7 | SC Beyond Card | Standard Chartered | 1.5-2 mpd local / 3-4 mpd overseas (uncapped) | S$1,500+ | Priority Banking; 100k welcome miles |
| 8 | Maybank World Mastercard | Maybank | 4 mpd petrol (uncapped!) + 2.8-3.2 mpd overseas | S$196 | BEST petrol card in SG |
| 9 | Maybank XL Rewards Card | Maybank | 4 mpd dining/shopping/flights/hotels/entertainment/overseas | S$87 | Age 21-39 only; launched July 2025 |
| 10 | HSBC Premier Mastercard | HSBC | 1.4 mpd local / 2.3 mpd overseas | S$709 (waived) | Unlimited Priority Pass; 91.8k welcome miles |

**Medium-Priority Cards (Phase 2, Sprint 12-13, RICE 750)**:
1. Amex Platinum Credit Card — MR Points, ~0.7 mpd post-devaluation, S$398/yr
2. Amex Platinum Reserve Credit Card — MR Points, ~0.7 mpd, S$337/yr
3. Amex Platinum Charge Card — MR Points, 10Xcelerator, S$1,744/yr
4. Amex SQ PPS Club Credit Card — 1.4/2.0 mpd, PPS members only, S$556/yr
5. Maybank Privilege Horizon Visa Signature — 3.2 mpd dining/travel, Privilege Banking only

**Deferred Cards (v2.0, RICE 125)**:
- DBS Insignia Visa Infinite (<5k holders, invite-only)
- Citi ULTIMA Card (<2k holders, invite-only)
- Amex Centurion Black Card (<500 holders in SG, invite-only)
- Amex SQ Solitaire PPS Credit Card (<1k worldwide)

**Low-Priority / Out of Scope**:
- Diners Club cards (DCS) — Club Rewards, poor miles conversion
- RHB Credit Cards — LoyaltyPlus Points, negligible miles value
- ICBC Credit Cards — Primarily cashback, not miles

**Data Correction — POSB Everyday Card**: Currently card #19 in our database, but this is a **cashback card** (earns DBS Daily$, not miles). It should be removed from the miles card database and noted in out-of-scope. Users who added it should see a migration notice explaining the reclassification.

**Eligibility Metadata**: Cards with restrictions need structured metadata:
```
eligibility_criteria: {
  gender: "female" | null,           // UOB Lady's Solitaire
  age_min: 21, age_max: 39,          // Maybank XL Rewards
  banking_tier: "Treasures" | null,  // DBS Vantage
  income_min: 120000 | null          // DBS Vantage
}
```
During card setup, filter cards based on optional user profile. Show eligibility badges ("Women only", "Age 21-39") in the card browser. Do not hard-block — users know their own eligibility.

**F23 — Rate Change Monitoring**: Key market changes detected in 2025-2026:
| Change | Date | Impact | Affected Users |
|--------|------|--------|----------------|
| Amex MR devaluation | Feb 2026 | 22-50% more points needed for airline transfers | All Amex MR holders |
| DBS Woman's World cap cut | Aug 2025 | 4 mpd cap from S$1,500→S$1,000/month | DBS WWC holders |
| BOC Elite Miles partner cut | 2025 | Asia Miles removed; only KrisFlyer remains | BOC Elite holders |
| Maybank Horizon rate cut | Dec 2025 | 0.24→0.16 mpd on selected categories | Maybank Horizon holders |
| HSBC Revolution cap boost | 2025 | Bonus cap increased to S$1,500/month | HSBC Revolution holders |

v1 implementation: Admin-triggered alerts with structured change log. Each alert includes: affected card(s), old vs new rate/cap, user impact summary, and recommended action (e.g., "Consider transferring Amex MR before further devaluation").

### Transaction Auto-Capture Design Notes (F26–F27)

**Feasibility Reference**: See `docs/NOTIFICATION_CAPTURE_FEASIBILITY.md` for the full technical feasibility analysis, including platform comparison, risk assessment, and implementation breakdown.

**Why This Matters — The Manual Logging Paradox**:
The product's #1 promise is to eliminate manual tracking. Yet cap tracking requires manual transaction logging (~20 sec per transaction). This creates a paradox: the product that claims to save time costs time. Auto-capture is the highest-leverage solution to this paradox.

**F26 — iOS Shortcuts Auto-Capture (P1, v1.8)**:

```
Apple Pay NFC Tap → iOS Shortcuts Transaction Trigger → maximile://log?amount=X&merchant=Y&card=Z
    → MaxiMile deep link handler → Card fuzzy match → Merchant→category auto-map
    → Pre-filled transaction form (with recommendation match indicator) → User confirms (1 tap) → Cap tracker updated
```

Key design decisions:
- **Zero native code** — Uses the existing `maximile://` URL scheme already configured in `app.json`
- **Apple-sanctioned** — Transaction trigger is an official Shortcuts API; zero App Store risk (TravelSpend, MoneyCoach, BalanceTrackr all ship this pattern)
- **iOS platform constraint** — Shortcuts automations **cannot be programmatically installed**. Apple does not allow apps to create or install Personal Automations via API. User must manually tap "Add Automation" in the Shortcuts app. The setup wizard minimizes this friction by providing a fully pre-configured `.shortcut` file — user taps one button to download, one button to add (~30 seconds of active setup)
- **Onboarding integration** — Auto-capture setup is offered during onboarding as **Step 1.5** (between "Add Your Cards" and "Set Miles Balances") to maximize adoption. Skippable via "I'll do this later." Also accessible post-onboarding via Settings > Auto-Capture and via periodic discovery nudges on the Log tab
- **Recommendation match indicator** — Confirmation screen calls `recommend(category)` RPC to compare the auto-captured card against the current top recommendation. Shows green "You used the best card!" banner (match) or gentle blue "Tip" nudge with the better card (mismatch). Creates the closed feedback loop: Recommend -> Pay -> Auto-log -> Cap update -> Better next recommendation
- **Smart Pay handoff** — When the Smart Pay flow opens Wallet and auto-capture fires within 60 seconds of the user returning, auto-capture replaces the manual amount entry step. If no auto-capture fires within 60 seconds (user paid with physical card), falls back to existing manual logging step
- **Coverage**: Apple Pay NFC in-store payments only. Online purchases, physical card swipes, and non-Apple-Pay transactions fall back to manual logging
- **Singapore context**: 70%+ of iPhone users have Apple Pay enabled; ~55% of in-person transactions are contactless; effective auto-capture coverage ~20-25% of all transactions
- **Card name matching**: Fuzzy match between Apple Wallet card name (e.g., "DBS Altitude Visa") and MaxiMile card portfolio; verification step during setup
- **Merchant→category mapping**: Merchant name from Shortcuts mapped to MaxiMile spend categories via fuzzy matching + growing merchant database. No MCC code available from Shortcuts

**F27 — Android Notification Auto-Capture (P1, v2.0)**:

```
Banking app push notification → Android NotificationListenerService → MaxiMile native module
    → Bank-specific regex parser → Extract amount, merchant, card last-4 → Match to user portfolio
    → Auto-log transaction (no user action) → Cap tracker updated → Optional confirmation notification
```

Key design decisions:
- **Requires native module** — `NotificationListenerService` needs Expo Dev Build with config plugin; not compatible with Expo Go
- **Sensitive permission** — `BIND_NOTIFICATION_LISTENER_SERVICE` requires clear privacy disclosure; on-device-only processing; never upload raw notification content
- **Onboarding integration** — Same Step 1.5 screen as iOS, but with platform-adaptive messaging: "MaxiMile reads your banking notifications to log transactions automatically." CTA: "Enable Auto-Capture"
- **Recommendation match indicator** — Same confirmation-screen behavior as F26: calls `recommend(category)` to show best-card match or improvement tip
- **Smart Pay handoff** — Same 60-second handoff logic as F26: if notification auto-capture fires within 60s of returning from Wallet, replaces manual amount entry
- **Bank parsers**: Regex patterns for DBS, OCBC, UOB, Citi, AMEX notification formats (all include amount + last-4-digits + merchant in structured text)
- **Google Pay + Samsung Pay**: Their notifications are also captured via the same NotificationListenerService
- **Battery efficiency**: Filter to only process notifications from known banking app package names; no CPU waste on unrelated notifications
- **Play Store precedent**: FinArt (1M+ downloads), Walnut (5M+), PennyWise AI all use this approach

**Cross-Platform Coverage Summary**:
| Transaction Type | iOS (F26) | Android (F27) |
|-----------------|-----------|---------------|
| Apple Pay NFC in-store | Auto-captured | N/A |
| Google Pay / Samsung Pay in-store | Manual | Auto-captured (via notification) |
| Physical card swipe/insert | Manual | Auto-captured (via bank notification) |
| Online / in-app purchases | Manual | Auto-captured (via bank notification) |
| Apple Watch / Mac payments | Manual | N/A |

### Rate Change Detection Design Notes (F24–F25)

**Architecture Reference**: See `docs/RATE_DETECTION_ARCHITECTURE.md` for the full technical specification, including database schema (Migration 017-018), AI pipeline design, and infrastructure decisions.

**Three-Layer Architecture**:
- **Layer 3 — Delivery** (Shipped, Sprint 12): `RateChangeBanner` + `RateUpdatedBadge`, portfolio-filtered via `get_user_rate_changes` RPC
- **Layer 2 — Processing** (Shipped, Sprint 12): `rate_changes` table (5 change types, 3 severities), `user_alert_reads`, 2 RPCs
- **Layer 1 — Detection** (F24–F25): The gap being closed. Three sources feeding into the existing `rate_changes` table:
  1. Manual admin entry (v1.0, shipped)
  2. Community submissions (F24, v1.6)
  3. Automated scraping + AI classification (F25, v1.7)

**$0 Infrastructure Stack** (validated — see Architecture doc Section 8):
| Component | Service | Cost |
|-----------|---------|------|
| Scraper + Cron | GitHub Actions (public repo) | $0 |
| AI Classification | Google Gemini 2.5 Flash (primary) + Groq Llama 3.3 70B (fallback) | $0 |
| Database + Storage | Supabase (existing, free tier) | $0 |
| Admin Dashboard | Cloudflare Pages | $0 |
| **Total** | | **$0/mo** |

**F24 — Community Submissions Flow**:
```
User discovers change → "Report a Change" form → Fills structured fields
    → Submission saved as "pending" → Admin reviews in dashboard
    → Admin approves/rejects/edits → If approved, inserted into rate_changes
    → All portfolio-matched users see banner/badge
```

Key design decisions:
- Submissions require a card selection + change type + old/new values (structured, not free-text)
- Optional evidence: source URL and/or screenshot upload
- Anti-spam: max 5 submissions/day/user, require email verification
- Dedup: SHA-256 fingerprint of (card_slug + change_type + normalized_new_value + effective_month)
- Gamification: "Verified Contributor" badge after 3+ approved submissions

**F25 — Automated Detection Pipeline**:
```
GitHub Actions (daily cron) → Playwright scrapes ~50 bank URLs
    → SHA-256 content hash comparison (zero-cost gate)
    → If changed: Gemini Flash classifies via tool_use structured output
    → Confidence routing: >=0.85 auto-approve | 0.50-0.84 admin review | <0.50 discard
    → Approved changes → INSERT into rate_changes
    → Existing Layer 2+3 delivers to users automatically
```

Key design decisions:
- Content-hash gating means LLM is only called when a page actually changes (~5-10% of daily checks)
- Gemini Flash chosen over Claude Haiku: comparable quality for structured extraction, $0 vs $1-5/mo
- Groq Llama 3.3 70B as fallback if Gemini limits tighten
- Scraper auto-commits `last_run.json` to prevent GitHub's 60-day inactivity disable
- Admin review expected: ~15-30 min/month (most changes auto-approved)

**Detection-Specific Success Metrics**:
| Metric | Target | Measurement |
|--------|--------|-------------|
| Detection latency | < 48 hours from bank announcement | `effective_date` vs `created_at` delta |
| Coverage | >= 90% of real rate changes detected | Monthly audit vs forum discussions |
| Precision | >= 95% of published changes are accurate | User flag rate < 5% |
| Community participation | >= 10 submissions/month (by v1.6 + 3 months) | `community_submissions` count |
| Admin review time | < 15 min/day | Pipeline health dashboard |
| Pipeline uptime | >= 99% scraper success rate | `v_pipeline_health` view |

---

## Appendix

### A. Customer Journey Map
See `docs/DISCOVERY.md` Section 10 for full current-state and future-state journey maps.

### B. Competitive Analysis Details
See PRD Section 4 for full competitive matrix, SWOT, and Porter's Five Forces analysis.

### C. Research & References
- [MileLion — 2026 Credit Card Strategy](https://milelion.com/2026/01/10/the-milelions-2026-credit-card-strategy/)
- [Suitesmile — 2026 Miles & Credit Card Strategy](https://suitesmile.com/blog/2026/01/03/miles-credit-card-strategy-singapore/)
- [SingSaver — Best Miles Credit Cards 2026](https://www.singsaver.com.sg/credit-card/comparison/best-air-miles-credit-cards)
- [HardwareZone — Who Gave Up Miles Chasing](https://forums.hardwarezone.com.sg/threads/who-gave-up-miles-chasing-via-credit-card.7187086/)
- [MAS — SGFinDex](https://www.mas.gov.sg/development/fintech/sgfindex)
- [Singapore Cards & Payments Market](https://www.marketdataforecast.com/market-reports/Singapore-Cards-and-Payments-Market)
- [MOM Labour Force 2025](https://stats.mom.gov.sg/iMAS_PdfLibrary/mrsd-labour-force-in-singapore-advance-release-2025.pdf)
- [Population.gov.sg — Population Trends](https://www.population.gov.sg/our-population/population-trends/overall-population/)
- [Seedly — How to Track Credit Card Rewards](https://blog.seedly.sg/how-to-track-credit-card-rewards-simple-steps/)
- [CardUp](https://www.cardup.co/)

### D. OKRs & KPIs

#### OKRs

**Objective 1: Establish MilesMax as the go-to miles optimization tool in Singapore**

| Key Result | Metric | Baseline | Target | Status |
|------------|--------|----------|--------|--------|
| KR1: Acquire active users | MAU | 0 | 5,000 | 🔴 |
| KR2: Achieve strong retention | Month-1 Retention | 0% | 60% | 🔴 |
| KR3: Earn community trust | NPS Score | N/A | 50+ | 🔴 |

**Objective 2: Deliver measurable miles optimization value to users**

| Key Result | Metric | Baseline | Target | Status |
|------------|--------|----------|--------|--------|
| KR1: Increase effective miles per dollar | Avg mpd | ~1.2 | 2.5+ | 🔴 |
| KR2: Reduce cap breach incidents | Cap breaches/month | ~3–5 per user | <1 per user | 🔴 |
| KR3: High recommendation adoption | Recommendations acted on | 0 | 70%+ | 🔴 |

**Objective 3: Build a sustainable business model**

| Key Result | Metric | Baseline | Target | Status |
|------------|--------|----------|--------|--------|
| KR1: Convert free to premium | Conversion rate | 0% | 10% | 🔴 |
| KR2: Achieve revenue target | MRR | $0 | SGD 15K | 🔴 |
| KR3: Reduce operational costs | Rules DB update cost | TBD | $0/month infra + <30 min/month admin | 🔴 |

#### KPIs

| KPI | Category | Current | Target | Measurement Method | Frequency |
|-----|----------|---------|--------|--------------------|-----------|
| New user signups | Acquisition | 0 | 500/month | App analytics | Weekly |
| Cards added per user | Activation | 0 | 3+ avg | In-app tracking | Monthly |
| Recommendations used per user/week | Activation | 0 | 3+ | In-app tracking | Weekly |
| Month-1 retention | Retention | 0% | 60% | Cohort analysis | Monthly |
| Month-3 retention | Retention | 0% | 40% | Cohort analysis | Monthly |
| Premium conversion | Revenue | 0% | 10% | Subscription analytics | Monthly |
| App Store rating | Referral | N/A | 4.5+ | App Store | Monthly |
| Organic referral rate | Referral | 0% | 20% of signups | Attribution tracking | Monthly |

### E. Product Roadmap

| Timeframe | Theme / Initiative | Key Deliverables | Milestone |
|-----------|-------------------|------------------|-----------|
| **Month 1–3** | Core MVP — "Right Card, Right Now" | Card setup, Category recommendations, Cap tracking, Transaction logging, Rules DB (22 cards) | MVP Launch |
| **Month 4–5** | Proactive Intelligence | Cap approach alerts, MCC crowdsource validation | v1.1 Release |
| **Month 5–6** | Miles & Portfolio + Earning Insights Phase 1 | Miles Earning Insights (integrated into Miles tab) with I1 Top Earning Card highlight, I2 Category spending breakdown, I5 Fixed Miles Saved baseline (1.4 mpd); Miles Portfolio Dashboard; Manual Balance Entry | v1.2 Release |
| **Month 6–7** | Engagement Loop + Earning Insights Phase 2 & 3 | Miles Redemption Logging, Miles Goal Tracker, I3 Actionable insight cards, I7 Cap utilisation summary, I4 Goal projection tie-in, I6 Monthly summary notification | v1.3 Release |
| **Month 7–9** | Miles Ecosystem — "Your Complete Miles Picture" | Two-Layer Architecture (My Miles + My Points), Transfer Partner Database, Expanded Programs (7→20), Smart Transfer Nudges | v1.4 Release |
| **Month 9–11** | Market Coverage & Intelligence — "Every Card, Every Change" | Card Coverage Expansion (22→30 cards, 85% market coverage), Rate Change Monitoring & Alerts, POSB Everyday reclassification, Eligibility metadata for restricted cards | v1.5 Release |
| **Month 11–12** | Community Intelligence — "Crowdsourced Accuracy" | Community rate change submissions, admin verification dashboard (Cloudflare Pages), dedup fingerprinting, contributor badges, submission status tracking | v1.6 Release |
| **Month 12–14** | Automated Intelligence — "Always Up to Date" | GitHub Actions scraper (50 bank URLs), Gemini Flash AI classification, confidence-based routing, pipeline health monitoring. $0/month infrastructure | v1.7 Release |
| **Month 13** | Proactive Engagement Foundation — "Build Once, Demo Well, Launch Later" | **F29 Push Notifications Complete System + Demo Mode**: Build production-ready push notification infrastructure with full feature completeness (token registration, permission flow, severity-based routing, batching, deep linking, notification history, granular settings, F6 cap alerts integration). System is fully functional but NOT enabled for end users in production — launch date TBD pending business decision. Includes comprehensive demo mode that auto-triggers realistic notifications on Miles tab visit for stakeholder presentations and investor demos. Enables immediate value demonstration without requiring beta cohorts or gradual rollout. See `docs/PUSH_NOTIFICATIONS_EVALUATION.md` | v1.8 Release |
| **Month 14–15** | Auto-Capture — "Log Without Lifting a Finger" | F26: iOS Shortcuts Transaction trigger integration for Apple Pay NFC auto-capture. Deep link handler, merchant→category mapping, card fuzzy matching, downloadable Shortcut template (user must manually add — Apple platform constraint), in-app setup wizard. Onboarding Step 1.5 integration. Recommendation match indicator on confirmation screen. Smart Pay auto-capture handoff (60s window). Zero native code. **Solves #1 product risk. Closes Recommend->Log loop.** | v1.8 Release |
| **Month 15–16** | Cross-Platform Auto-Capture + Smart Portfolio | F27: Android NotificationListenerService for banking app auto-capture (DBS, OCBC, UOB, Citi, AMEX). Portfolio optimizer, Promo & bonus tracker, Medium/ultra-premium card expansion (35→40+) | v2.0 Release |
| **Month 17–18** | Monetization & Scale | Premium tier launch, Bank partnership exploration, Regional expansion research | Revenue Milestone |

### F. Product Backlog

| Priority | Item | Type | Status | Sprint Target |
|----------|------|------|--------|---------------|
| P0 | F5: Card rules database (29 SG miles cards) | Feature | Future | Sprint 1 |
| P0 | F1: Card portfolio setup (add/remove cards) | Feature | Future | Sprint 1 |
| P0 | F2: Spend category recommendation engine | Feature | Future | Sprint 2 |
| P0 | F4: Transaction logging (quick-log) | Feature | Future | Sprint 2 |
| P0 | F3: Bonus cap tracker (real-time) | Feature | Future | Sprint 3 |
| P1 | F6: Cap approach alerts (push notifications) | Feature | Future | Sprint 4 |
| P1 | F7: Miles Earning Insights (integrated into Miles tab) | Feature | Shipped | Sprint 7 |
| P0 | F7/I1: Top Earning Card highlight — show which card earned the most miles with earn rate breakdown (RICE 10,200) | Sub-feature | Ready | Sprint 7 |
| P0 | F7/I5: Fix Miles Saved baseline — use 1.4 mpd SG industry average instead of user's lowest card (RICE 5,400) | Sub-feature | Ready | Sprint 7 |
| P0 | F7/I2: Category spending breakdown — spend distribution by category with miles earned per category (RICE 4,800) | Sub-feature | Ready | Sprint 7 |
| P1 | F17/I7: Cap utilisation summary — per-card cap usage for the month (RICE 4,000) | Sub-feature | Future | Sprint 8 |
| P1 | F17/I4: Goal projection tie-in — "At this rate, you'll reach [goal] by [date]" (RICE 3,000) | Sub-feature | Future | Sprint 8 |
| P1 | F17/I6: Monthly summary notification — push notification at month-end with deep-link (RICE 3,000) | Sub-feature | Future | Sprint 8 |
| P1 | F17/I3: Actionable insight cards — smart tips on underutilised caps, zero-spend categories, idle cards (RICE 2,333) | Sub-feature | Future | Sprint 8 |
| P1 | F13: Miles Portfolio Dashboard | Feature | Shipped | Sprint 7 |
| P1 | F14: Manual Miles Balance Entry | Feature | Shipped | Sprint 7 |
| P1 | F15: Miles Redemption Logging | Feature | Shipped | Sprint 8 |
| P1 | F16: Miles Goal Tracker | Feature | Shipped | Sprint 8 |
| P1 | F21: Expanded Miles Programs (7→20) | Feature | Ready | Sprint 9 |
| P1 | F19: Transfer Partner Mapping | Feature | Ready | Sprint 9 |
| P1 | F18: Two-Layer Miles Architecture | Feature | Ready | Sprint 10 |
| P1 | F20: Smart Transfer Nudges | Feature | Ready | Sprint 10 |
| P1 | F22: Card Coverage Expansion (20→30 cards) | Feature | Ready | Sprint 11 |
| P1 | F23: Rate Change Monitoring & Alerts | Feature | Shipped | Sprint 12 |
| P1 | F24: Community-Sourced Rate Change Submissions | Feature | Ready | Sprint 13 |
| **P1** | **F29: Push Notifications (Complete System + Demo Mode)** | **Feature** | **Ready** | **Sprint 13** |
| P1 | F25: Automated Rate Change Detection | Feature | Ready | Sprint 14–15 |
| **P1** | **F26: Apple Pay Shortcuts Auto-Capture** | **Feature** | **Ready** | **Sprint 16–17** |
| P1 | F27: Android Notification Auto-Capture | Feature | Future | Sprint 18–19 |
| P1 | F8: Quick-access widget | Feature | Future | Sprint 20+ |
| P1 | F9: Merchant search (MCC mapping) | Feature | Future | Sprint 20+ |
| P2 | F10: Portfolio optimizer | Feature | Future | Sprint 20+ |
| P2 | F11: Promo & bonus tracker | Feature | Future | Sprint 20+ |
| P2 | F12: Social / community features | Feature | Future | Backlog |
| P3 | Invite-only ultra-premium cards (Insignia, ULTIMA, Centurion) | Feature | Deferred | v2.0 |
| P3 | Niche cards (Diners Club, RHB, ICBC) | Feature | Deferred | v2.0 |
