# MaxiMile — Product Pitch Deck
**Master's-Level PM Module | MVP Stage | Singapore Market**
*Prepared: February 2026*

---

## Slide 1: Title

**MaxiMile**
*The right card. Every time. Zero guesswork.*

> A context-aware mobile app that recommends the optimal credit card at the point of payment — eliminating the cognitive burden of managing complex multi-card miles rules in real-time.

**Stage**: MVP (Beta)
**Market**: Singapore
**Team**: Product, Engineering, Design, Data, QA

---

## Slide 2: Problem Statement

### The Problem

**Who**: Urban working professionals in Singapore, aged 25–45, holding 3–7 miles-earning credit cards. Financially literate PMETs who travel 2–3 times per year and actively participate in the miles optimization community.

**What they are trying to do**: Earn maximum airline miles from everyday spending — without spending excessive time tracking rules.

**Why they fail today**:
- Each card has category-specific earn rates, monthly bonus caps, MCC exclusions, and promotional overlaps
- Rules change without notice; banks redesign structures annually
- At contactless checkout, there is no time to consult a blog or spreadsheet
- Result: users either default to one "safe" card (leaving miles on the table) or give up optimization entirely

**Quantified impact**:
| Impact Dimension | Evidence |
|-----------------|----------|
| Miles lost annually per user | 5,000–15,000 miles (~SGD 200–500 in flight value) |
| Time lost at checkout | 10–30 seconds per transaction; 30–50+ decisions/month |
| User abandonment | HardwareZone: users reporting going from 7–10 cards down to 2 because complexity became unsustainable |
| Community scale of pain | MileLion: 948K monthly visits, 31,300+ Telegram members — sustained demand for optimization help |

**Why existing solutions are insufficient**:
| Solution | Type | Core Gap |
|----------|------|----------|
| MileLion / Suitesmile | Blogs | Informational; static; user must read, interpret, and remember |
| SingSaver / MoneySmart | Comparison sites | Card *selection* tool only; no ongoing usage optimization |
| Seedly | Expense tracker | Tracks spend but does not recommend optimal card |
| Spreadsheets / Notes | DIY | High effort, error-prone, no real-time state awareness |
| Telegram communities | Crowdsourced | Unstructured, not personalized to individual card portfolio |

**No product in Singapore operates at the point of spend or accounts for a user's real-time spending state (remaining monthly cap, cumulative category spend).**

**Why now**:
- Contactless payments now dominant in Singapore — the checkout moment is frictionless *except* for card selection
- MAS's SGFinDex is live and expanding; fintech access may open in v2
- US market has validated the model: CardPointers (Apple App of the Day), MaxRewards (USD 3M seed), Kudos (USD 10.2M Series A from QED) — no APAC entrant exists
- Singapore cards and payments market: USD 24.12B (2025) → USD 50.37B by 2033 (CAGR 9.64%)

---

## Slide 3: Persona 1 — Miles-Maximizing Maya

**"I know exactly which card I should use. Until I'm standing at the cashier."**

| Attribute | Detail |
|-----------|--------|
| **Role** | Marketing Manager, MNC |
| **Age / Income** | 32 / SGD 7K–12K/month |
| **Digital literacy** | High — uses mobile banking, e-wallets, fintech apps daily |
| **Card portfolio** | 4–5 miles cards: Citi PremierMiles, DBS Altitude, UOB PRVI Miles, OCBC 90°N, KrisFlyer UOB |
| **Travel frequency** | 2–3 trips/year (leisure + work) |

**Goals**:
- Earn enough miles for 1–2 business class redemptions per year
- Spend no more than 5 minutes/week on miles tracking
- Feel confident at every checkout, not anxious

**Pain Points**:
- Forgets which card earns the dining bonus this month vs last month
- Discovers she exceeded a card's SGD 1,000 monthly cap three weeks after the fact
- Reads MileLion weekly but cannot apply it in real time at checkout
- Maintains a spreadsheet that becomes outdated every time a bank changes rules

**Current workaround**: Pre-memorizes the top 2 rules for each card at the start of the month; defaults to DBS Altitude when uncertain. Estimates she loses ~10,000 miles/month from cap errors and wrong-card decisions.

**Decision-making triggers**:
- "Did I already use my dining cap this month?" is the core question at the point of payment
- Switching apps to blog mid-checkout causes social friction — she needs an answer in <3 seconds

**Emotional drivers**:
- *Anxiety* — fear of missing out on miles she should have earned
- *Satisfaction ("winning")* — when optimization works, she feels financially competent
- *Frustration* — when she discovers a mistake she could have prevented

**How MaxiMile serves her**: Opens app → taps "Dining" → sees "Use OCBC 90°N (4 mpd, SGD 350 cap remaining). DBS Altitude cap reached." Confident tap. Zero anxiety.

---

## Slide 4: Persona 2 — Passive Peter

**"I know I'm leaving miles on the table. I just haven't found a tool worth the setup."**

| Attribute | Detail |
|-----------|--------|
| **Role** | Software Engineer |
| **Age / Income** | 28 / SGD 5K–8K/month |
| **Digital literacy** | High — early adopter of apps, but minimal patience for manual data entry |
| **Card portfolio** | 2–3 miles cards; uses one for everything |
| **Travel frequency** | 1–2 trips/year; aspires to premium cabin redemptions |

**Goals**:
- Earn meaningfully more miles with zero research effort
- Understand whether his current cards are even worth keeping

**Pain Points**:
- Uses his "safe" card (Citi PremierMiles) for all spend — earning only 1.2 mpd when he could be earning 4 mpd on dining and transport
- FOMO when friends discuss free business class flights he cannot afford
- Has tried spreadsheets twice; abandoned both within two weeks
- Low motivation because miles feel abstract — no visibility into what he has or what he could book

**Current workaround**: None. Defaults to inertia.

**Decision-making triggers**:
- Would switch behavior if the app setup takes <5 minutes and first recommendation delivers visible value
- Needs to see a concrete "you could have earned X more miles" figure to be convinced

**Emotional drivers**:
- *FOMO* — awareness that the opportunity exists but he's not capturing it
- *Inertia* — prior bad experiences with manual tracking tools
- *Delight* — would respond strongly to low-effort, high-visibility value proof

**How MaxiMile serves him**: Onboards in <3 minutes by selecting cards from a list. App auto-loads all rules. First recommendation shows "You would earn 3x more miles using UOB PRVI Miles here vs Citi PremierMiles." Miles tab shows cumulative balance building. Insight screen shows "Miles saved vs average cardholder: 1,240 this month."

---

## Slide 5: User Journey Map (MVP Scope)

| Stage | User Goal | Key Touchpoints | Friction / Risk | Opportunity | How MVP Addresses It |
|-------|-----------|-----------------|-----------------|-------------|----------------------|
| **1. Awareness** | Discover that a tool exists for this exact problem | MileLion / Suitesmile articles, Telegram community shares, word of mouth from friends | Miles community is skeptical of new tools — trust is earned slowly | Endorsed by trusted voices (MileLion, Suitesmile) who already have the audience | Community partnership at launch; transparent, non-affiliate recommendation logic |
| **2. Consideration** | Understand what the app does and whether it is worth trying | App Store listing, landing page, community review threads | User's prior experience: "I tried spreadsheets, they didn't last" | Demonstrate specific, quantified value ("earn 2–3x more miles on dining") | Clear value prop in onboarding: show estimated miles gain before any data entry |
| **3. Onboarding** | Add card portfolio without friction | Card selection screen (pre-populated list of top 20 SG miles cards), auto-loaded rules | If setup takes >5 minutes or requires manual rule entry, drop-off is high | Rule auto-population eliminates the most common DIY failure point | F1 + F5: User selects cards from list → all earn rates, caps, categories auto-load. Target: <3 minutes to first recommendation |
| **4. Core Usage** | Get the right card recommendation at checkout | Category tap (Dining / Transport / Online / etc.) → instant recommendation with earn rate and remaining cap | If recommendation is wrong, trust erodes immediately. If app is not open during checkout, habit does not form | The "right card, right now" moment is the core value event | F2 + F3: Recommendation shows optimal card, earn rate, remaining cap, and fallback option. Response target: <1 second |
| **5. Value Realization** | See tangible evidence that the app is working | Miles Earning Insights (miles earned this month vs 1.4 mpd industry average); Top earning card highlight; Category breakdown | If users do not log transactions, cap tracking degrades and insights are inaccurate | Transaction logging is the flywheel — the product gets more valuable the more it is used | F4: Quick-log <10 seconds per transaction; auto-suggests category; immediately updates cap tracker and insights |
| **6. Retention / Expansion** | Continue using the app and tell others | Cap approach alerts ("DBS Altitude dining cap 80% used — switch to OCBC 90°N"), monthly summary push notification, miles portfolio dashboard | Users churn when card rules change and recommendations feel stale; when miles feel abstract | Proactive alerts create habitual re-engagement; miles portfolio visibility sustains motivation | F6 (v1.1): Cap alerts at 80% + 95% thresholds. F7 (v1.2): Miles dashboard showing earned + saved vs average. F13–F16: Full miles portfolio with goal tracker |

---

## Slide 6: Business Model Canvas

### Value Proposition
**"Turn complex multi-card rules into simple, real-time, one-tap decisions."**
- Functional: eliminates manual research and decision fatigue at checkout
- Emotional: confidence, reduced anxiety, visible proof of optimization
- Strategic: delivers more miles per dollar without behavioral change — users keep spending the same way, just tap the right card

Unique position: the only product in Singapore combining **portfolio-aware personalization + real-time cap tracking + point-of-payment recommendations**.

---

### Customer Segments

| Segment | Size | Acquisition Strategy |
|---------|------|----------------------|
| **Active optimizers (Maya)** | ~100K–200K in SG | Miles community (MileLion, Telegram, HardwareZone) — existing, motivated, trust earned via accuracy |
| **Passive holders (Peter)** | ~100K–200K in SG | Organic word-of-mouth from active optimizers; App Store discovery; social proof ("X users earned Y miles this month") |
| **Future: B2B (Banks)** | 9 major SG banks | Engagement analytics, category-level spend data (aggregated, anonymized) — v2 revenue stream |

---

### Channels
- **Primary**: Miles blogs (MileLion, Suitesmile) — partnership/editorial placement; combined audience ~1M+ monthly visits
- **Secondary**: Telegram communities (35K–50K+ members in SG miles groups) — direct community seeding
- **Tertiary**: App Store / Play Store organic search ("credit card miles Singapore")
- **Future**: Content SEO, referral program, bank partner co-marketing

---

### Revenue Streams

| Stream | Model | Timing | Target |
|--------|-------|--------|--------|
| **Freemium — Premium Subscription** | Free tier: core recommendations (top 3 cards). Premium (~SGD 4.99/month): full portfolio tracking, cap alerts, insights, all 30+ cards | Month 9–12 | 10–15% conversion; SGD 15K MRR at 3,000 premium users |
| **B2B — Bank Data Partnerships** | Aggregated, anonymized category-level spend insights sold to banks; card engagement optimization | v2 (Month 15+) | Secondary revenue; does not compromise user-first positioning |
| **Affiliate (Deferred)** | Card application referrals — intentionally excluded from v1 to protect recommendation credibility | v1.5+ (after trust established) | Revenue unlocked only after brand trust is proven |

**Why no affiliate in v1**: Affiliate revenue creates structural conflict of interest in recommendations. Trust is the product's core asset. Monetization follows credibility.

---

## Slide 7: Business Model Canvas (continued)

### Key Activities
1. **Card rules database maintenance**: Monitor bank T&Cs, process rule changes within 48 hours, version-control all earn rates and caps. This is the highest operational burden and the primary defensible moat.
2. **Recommendation engine accuracy**: Continuous QA on card-category-cap logic; community flagging; A/B testing recommendation formats.
3. **Community relationship management**: Active presence in MileLion, Suitesmile, Telegram channels — both for distribution and as an early-warning system for rule changes.
4. **User retention loops**: Cap alerts, monthly insights notifications, miles portfolio features — designed to pull users back without active push marketing spend.

### Key Resources
- **Card rules database** — proprietary, maintained, version-controlled. 20 cards at MVP; 30 cards by v1.5 (85% market coverage).
- **Recommendation algorithm** — category + cap + portfolio awareness engine; real-time state computation.
- **Community trust** — earned via accuracy and transparency; cannot be bought or replicated quickly.
- **User spending data** — individual cap state and category patterns; becomes more valuable as users log more transactions.

### Key Partners
| Partner | Role | Value Exchange |
|---------|------|----------------|
| MileLion / Suitesmile | Distribution + editorial credibility | Audience access; content alignment; early adopter community |
| Supabase | Backend infrastructure (DB, Auth, API) | Eliminates DevOps overhead; scales with growth |
| Banks (future) | API access, co-marketing | Increased card engagement; potential SGFinDex integration in v2 |
| Expo / App Store / Play Store | Mobile distribution | Reach; user trust signals |

### Cost Structure
| Cost Category | Nature | Scale Impact |
|--------------|--------|-------------|
| Card rules database maintenance | Ongoing operational (manual research + verification) | Grows modestly with card count; partially offset by community |
| Mobile engineering (React Native + Expo) | Development + ongoing maintenance | Linear with feature scope |
| Supabase infrastructure | Usage-based; near-zero at MVP scale | Scales predictably; low burn early |
| Community / growth | Low CAC via earned channels (blogs, Telegram) | Marginal cost per user acquisition |
| Customer support | Low in early stage; rises with user base | Tied to data accuracy — accurate recommendations reduce support volume |

### Competitive Advantage
Three layers, in order of defensibility:
1. **Data moat**: Accuracy and freshness of the card rules database — takes 6+ months and ongoing effort to replicate
2. **User spending state**: Accumulated cap tracking data per user — valuable to the user, hard to export, increases switching cost
3. **Community trust**: Endorsement by MileLion/Suitesmile and the miles community — earned, not bought; first-mover advantage in a relationship-driven niche

---

## Slide 8: RICE Prioritization Model

### Methodology
- **Reach**: Estimated users impacted per quarter (out of 5,000 initial users)
- **Impact**: 1 = minor, 2 = moderate, 3 = massive
- **Confidence**: % confidence in estimates
- **Effort**: Engineering weeks
- **RICE Score**: (Reach × Impact × Confidence) ÷ Effort

| # | Feature | Reach | Impact | Confidence | Effort (wks) | RICE Score | MVP? |
|---|---------|-------|--------|------------|--------------|------------|------|
| F1 | **Card Portfolio Setup** | 5,000 | 3 | 90% | 3 | **4,500** | ✅ P0 |
| F2 | **Spend Category Recommendation** | 5,000 | 3 | 90% | 4 | **3,375** | ✅ P0 |
| F19 | **Transfer Partner Mapping** | 4,500 | 3 | 85% | 3 | **3,825** | P1 |
| F3 | **Bonus Cap Tracker** | 4,000 | 3 | 80% | 5 | **1,920** | ✅ P0 |
| F4 | **Transaction Logging** | 4,000 | 2 | 85% | 3 | **2,267** | ✅ P0 |
| F5 | **Card Rules Database** | 5,000 | 3 | 80% | 6 | **2,000** | ✅ P0 |
| F6 | **Cap Approach Alerts** | 3,000 | 2 | 80% | 2 | **2,400** | P1 |
| F8 | **Quick-Access Widget** | 2,500 | 2 | 70% | 3 | **1,167** | P1 |
| F10 | **Portfolio Optimizer** | 1,500 | 2 | 50% | 5 | **300** | P2 |
| F12 | **Social / Community** | 1,000 | 1 | 40% | 6 | **67** | P2 |

### Why This Prioritization Is Correct

**P0 justified**: F1+F2+F3+F4+F5 are not features — they are the *product*. Removing any one of them removes the core value proposition entirely. Without F5 (Rules DB) there are no recommendations. Without F3 (Cap Tracker) we are not differentiated from a static blog. Without F4 (Logging) the cap tracker degrades. These are structural dependencies, not feature preferences.

**F6 (Cap Alerts) deferred to v1.1**: High RICE score (2,400) but requires push notification infrastructure and behavioral pattern data that is only available after 4+ weeks of user logging. Cannot ship in MVP sprint; correctly deferred.

**F8 (Widget) deferred**: Useful for power users (Maya), but requires OS-level permissions and additional development complexity disproportionate to its gain at a 5,000-user scale. High effort relative to v1 priority.

**F10 (Portfolio Optimizer) intentionally excluded**: Requires 3+ months of individual spending data to generate meaningful suggestions. Shipping a feature that cannot deliver value to any user in Month 1 is wasteful. Correct v2 placement.

**F12 (Social) lowest priority**: Community validation already exists externally (Telegram, HardwareZone). Recreating this inside the app at this stage would divert resources from accuracy and core functionality — the only things that build trust at launch.

### Trade-offs Made Explicitly
- **No affiliate links in v1**: Despite high revenue potential, excluded to protect recommendation credibility
- **Manual transaction logging over automation**: SGFinDex not available to fintechs; manual logging accepted as v1 constraint despite friction cost
- **Singapore-only focus**: Limits TAM but ensures recommendation accuracy and community fit — the right constraint for MVP

---

## Slide 9: Solution Showcase — Core Workflow

### The MVP in One Flow

```
User at checkout
        ↓
Opens MaxiMile → taps spend category (e.g., "Dining")
        ↓
Engine checks: user's card portfolio → earn rates by category → remaining bonus cap per card this month
        ↓
Recommendation displayed in <1 second:
"Use OCBC 90°N — 4 mpd | SGD 350 cap remaining
 Alt: Citi PremierMiles — 1.2 mpd | Uncapped"
        ↓
User taps recommended card, pays
        ↓
Quick-log: amount auto-populated, category pre-selected → confirm in <10 seconds
        ↓
Cap tracker updates → Insights screen reflects new miles earned
```

**Entire flow: 15 seconds. Zero manual rule-checking. Zero anxiety.**

### 5 Key Differentiating Features

**1. State-Aware Recommendations (F2 + F3)**
Not just "which card earns most on dining" — but "which card earns most on dining *given how much of each cap you have left this month*." This is the gap no blog, comparison site, or spreadsheet can fill.

**2. Automated Cap Tracking (F3)**
The primary cause of miles loss is exceeding monthly bonus caps unknowingly. MaxiMile tracks cumulative category spend per card in real time, adjusts recommendations accordingly, and alerts when approaching thresholds. This feature alone justifies the product's existence for Maya.

**3. One-Tap Transaction Logging (F4)**
Designed for the point of payment: amount field pre-populated from recommendation, category pre-selected, card pre-filled. Target: <10 seconds to log. Each logged transaction improves the accuracy of future recommendations — a compounding flywheel.

**4. Maintained Card Rules Database (F5)**
Top 20 SG miles cards at MVP; 30 cards (85% market coverage) by v1.5. Rules updated within 48 hours of detected changes. Version-controlled with change history. Community-sourced verification layer. This database is the core operational asset that creates the data moat.

**5. Miles Earning Insights (F7 — v1.2)**
Monthly summary integrated directly into the Miles tab: miles earned + miles saved vs Singapore industry average (1.4 mpd baseline). Top earning card highlight. Category breakdown by miles earned. Cap utilisation bars. Makes the product's value tangible and measurable — the "receipt" for optimization.

### What Makes This Better Than Alternatives

| Dimension | MaxiMile | Blogs (MileLion) | Comparison Sites | DIY (Spreadsheet) |
|-----------|----------|-----------------|------------------|-------------------|
| Real-time at checkout | ✅ | ❌ | ❌ | ❌ |
| Personalized to my cards | ✅ | ❌ | ❌ | ✅ (manual) |
| Cap tracking automated | ✅ | ❌ | ❌ | ✅ (error-prone) |
| Proactive alerts | ✅ (v1.1) | ❌ | ❌ | ❌ |
| Setup time | <3 min | Hours of reading | 20–30 min | 2–4 hours |
| Maintenance required | None (user) | Weekly blog reading | None | Constant |
| Handles rule changes | ✅ (automated) | 24–48 hr lag | Weeks | Manual |

### Technical Feasibility Signals
- **Stack**: React Native (Expo) + Supabase (Postgres, Auth, REST API) — proven, zero novel technology risk
- **Recommendation engine**: Relational query (user cards → earn rules → spending state → ranked result) — no ML required in v1; rule-based logic is transparent and auditable
- **Card rules**: Publicly available from bank websites and T&Cs; MileLion/Suitesmile already aggregate this — sourcing is validated, not speculative
- **MVP shipped in 2-week sprint**: Architecture and data model designed; 20-card rules database seeded and validated in batch; React Native app scaffolded with Supabase backend

### Early Validation Signals
- **Community demand confirmed**: MileLion (948K monthly visits), Suitesmile, HardwareZone forums show sustained, active, unsolved demand
- **US market precedent**: Kudos raised USD 10.2M Series A (QED Investors); MaxRewards USD 3M seed — identical model validated in a comparable high-card-penetration market
- **No direct competitor in Singapore**: First-mover window is open; existing solutions are structural complements, not substitutes
- **Rule complexity accelerating**: Amex MR devaluation (Feb 2026), DBS Woman's World cap cut (Aug 2025), Maybank Horizon rate cut (Dec 2025) — volatility increases the product's value over time

---

## Slide 10: Solution Showcase — Roadmap & Path to Iteration

### MVP Definition (Months 1–3)
**F1 + F2 + F3 + F4 + F5**
A user can: add their miles cards → get instant category recommendations → track bonus caps → log transactions → receive accurate state-aware recommendations the next time.
**Success criteria**: 1,000 beta users; 70%+ transaction log rate; <5% rule error rate; 3+ cards added per user.

### Post-MVP Roadmap (Evidence-Based Sequencing)

| Phase | Features | Rationale for Sequencing |
|-------|----------|--------------------------|
| **v1.1 (Months 4–5)** | Cap approach alerts (F6) | Highest-urgency retention feature: prevents the #1 cause of user disappointment (cap breach after the fact). Requires 4+ weeks of user data first. |
| **v1.2 (Months 5–6)** | Miles Earning Insights + Portfolio Dashboard (F7, F13, F14) | Makes the product's value visible and measurable. Second-most important retention lever after alerts. Integrated into Miles tab for discoverability. |
| **v1.3 (Months 6–7)** | Redemption Logging + Goal Tracker (F15, F16) | Deepens engagement loop: users with goals are more retained. Actionable insight cards surface optimization opportunities proactively. |
| **v1.4 (Months 7–9)** | Two-Layer Miles Architecture + Transfer Partners (F18–F21) | Expands value from "earn optimizer" to "full miles ecosystem tool." Addresses advanced users (Maya) who think about bank points → airline miles transfers. |
| **v1.5 (Months 9–11)** | Card Coverage 20→30 cards (F22) + Rate Change Alerts (F23) | Increases addressable market from ~60% to ~85% of SG miles card holders. Rate alerts create a "watches out for me" trust signal — deepest defensibility. |
| **v2.0 (Months 12–16)** | Portfolio Optimizer + Promo Tracker + Bank API exploration | Data-dependent features that require 6+ months of accumulated user behavior. Premium tier launch at this stage. |

### What Is Intentionally Out of Scope in v1
- **Bank API / auto-import**: SGFinDex not available to fintechs. Manual logging is the deliberate v1 constraint. Not a weakness — it is the correct scoping decision given regulatory reality.
- **Cashback card optimization**: Miles-only positioning sharpens the value proposition. Adding cashback creates complexity without differentiation.
- **Affiliate card links**: Excluded to protect recommendation trust. Revenue follows credibility.
- **International markets**: Singapore-only ensures rule accuracy, community fit, and focused growth before regional expansion.
- **Ultra-premium invite-only cards** (DBS Insignia, Citi ULTIMA, Amex Centurion): Combined <7,500 holders in SG; rules not publicly verifiable; RICE score 125 — lowest of all considered features. Correctly deferred to v2.

---

## Slide 11: Closing — Why This Wins

### The Case in Five Points

**1. The problem is real, validated, and unsolved.**
200,000–400,000 users in Singapore are losing SGD 200–500+ in flight value per year. The community evidence is unambiguous — MileLion generates 948K visits/month, Telegram groups have 35K–50K members, HardwareZone threads document users abandoning miles optimization entirely due to complexity. No product addresses this at the point of payment.

**2. The market is structurally ready for this product.**
Contactless payment adoption is near-total in Singapore — the "no time to think" checkout moment exists at scale. US equivalents have attracted USD 13M+ in combined funding. SGFinDex is expanding. The window for a first-mover in Singapore is open now.

**3. The MVP is honest about what it is.**
The product ships five features: card setup, recommendation engine, cap tracker, transaction logging, and rules database. No AI gimmicks. No bank API promises. No affiliate conflict. It does one thing precisely — tells the user which card to tap — and does it with accuracy that no manual alternative can match.

**4. The business model compounds over time.**
The card rules database is expensive to build and maintain — which means it is expensive for a competitor to replicate. User spending state data increases switching costs. Community trust, once earned, becomes a distribution moat. Freemium monetization follows adoption; affiliate and B2B revenue follow trust. The sequence is correct.

**5. The product gets more valuable as the market gets more complex.**
Every bank rule change, every devaluation, every new card launch is a problem for the user — and a value-creation event for MaxiMile. Rate volatility is a structural tailwind, not a threat.

### Key Metrics to Watch (6-Month Targets)

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Monthly Active Users | 5,000 | Validates product-market fit |
| Monthly Active Recommendations Used (MARU) | 10,000 | North Star: are users trusting and acting on recommendations? |
| Month-1 Retention | 60% | Validates habit formation at point of payment |
| Avg cards added per user | 3+ | Validates that users with complex portfolios (the core segment) are engaging |
| Transaction log rate | 70%+ | Cap tracking accuracy; leading indicator of retention |
| NPS | 50+ | Proxy for word-of-mouth growth |

### The Risk We Are Watching Most Closely
**User fatigue from manual transaction logging.** If the <10-second log flow does not achieve 70%+ completion, cap tracking degrades, recommendations become less accurate, and trust erodes. This is the single most important behavioral hypothesis to validate in Month 1–2. Mitigation: SGFinDex integration is the v2 solution; smart defaults and friction reduction are the v1 mitigations.

### What a Win at 12 Months Looks Like
- 10,000 active users across Singapore's miles optimization community
- 10%+ freemium-to-premium conversion
- Rate change alert system active (F23) — highest defensibility feature
- Community endorsement from MileLion and Suitesmile
- Foundation for regional expansion to Malaysia and Hong Kong

---

*MaxiMile is not a "miles app." It is the infrastructure layer between complex, volatile credit card rules and the moment a user decides which card to tap. That gap has always existed. The technology to close it has always existed. The only thing missing was someone disciplined enough to build the right product for it.*

---

**PRD Reference**: `docs/PRD.md` v1.5 | **Discovery**: `docs/DISCOVERY.md` | **Market Research**: `docs/MARKET_RESEARCH.md` | **Sprint Plan**: `docs/SPRINT_PLAN.md`
