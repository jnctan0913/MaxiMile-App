# Product Discovery: MaxiMile — Credit Card Miles Optimizer

**Date**: 2026-02-14
**Author**: PM Agent
**Tier**: FULL

---

## 1. Problem Validation Screening

### Problems to Avoid Checklist

| Criterion | Pass? | Rationale |
|-----------|-------|-----------|
| **Not too broad or unclear** | Yes | Specific problem: optimizing airline miles from credit card spend in Singapore. Clear persona, measurable friction. |
| **Outcomes are measurable** | Yes | Miles earned per dollar, missed bonus opportunities, time spent managing cards — all quantifiable. |
| **Solution isn't already well-known** | Yes | Existing solutions are static/informational (blogs, comparison sites). No real-time, context-aware optimizer exists in Singapore. |
| **Does not require hardware** | Yes | Purely a mobile software application. No hardware dependency. |
| **Not a marketplace** | Yes | Single-sided product serving the card holder. No supply-demand matching needed. |
| **Friction is not purely personal** | Yes | Friction is systemic (complex rules, multiple banks, changing caps) — not a behavioral/willpower issue. Product can directly remove the friction. |

**Verdict**: Problem passes all screening criteria. Proceed with full discovery.

---

## 2. Structured Problem Statement

### 2.1 The Five Components

| Component | Detail |
|-----------|--------|
| **Persona** | Urban working professionals, aged 25–45, in Singapore who actively use multiple credit cards (3–7 cards) to earn airline miles. Financially literate, travel at least once a year, value efficiency and rewards optimization. |
| **Goal (JTBD)** | Maximize airline miles earned from everyday spending by always using the right card for the right purchase — functionally, emotionally (confidence they're not missing out), and situationally (instant clarity at point of payment). |
| **Current Approach / Mental Model** | Users manually track card rules via spreadsheets, notes apps, mileage blogs (MileLion, Suitesmile), and Telegram groups. They assume spending categories are static, mentally track bonus caps, and default to a "safe" card when unsure. |
| **Friction** | Users frequently forget bonus caps, misclassify transactions (e.g., online vs in-store), or exceed monthly limits unknowingly — leading to lost miles. Tracking across 3–7 cards is cognitively taxing. Real-time decisions at checkout are stressful, especially for contactless/mobile payments where there's no time to look up rules. |
| **Impact** | Miles optimization errors cost users thousands of miles annually (equivalent to SGD 200–500+ in flight value). Beyond financial loss, users experience decision fatigue and anxiety. At scale, this inefficiency discourages engagement with reward programs, reducing perceived value of premium credit cards and weakening long-term customer loyalty for banks. |

### 2.2 Full Problem Statement

> An **urban working professional in Singapore** struggles with **manually tracking credit card rules across spreadsheets, blogs, and memory** to **maximize airline miles earned from everyday spending** but cannot do so effectively because **bonus caps, category rules, and exclusions across multiple cards are too complex to track in real-time at the point of payment**, which leads to **thousands of lost miles annually (worth SGD 200–500+ in flights), chronic decision fatigue, and eroding trust in their own optimization strategy**.

### 2.3 Persona Depth

**Primary Persona: "Miles-Maximizing Maya"**

| Attribute | Detail |
|-----------|--------|
| **Name/Archetype** | Miles-Maximizing Maya |
| **Age** | 32 |
| **Occupation** | Marketing Manager at an MNC |
| **Income** | SGD 7,000–12,000/month |
| **Digital Literacy** | High — uses mobile banking, e-wallets, and fintech apps daily |
| **Cards Held** | 4–5 miles-earning cards (Citi PremierMiles, DBS Altitude, UOB PRVI Miles, OCBC 90°N, KrisFlyer UOB) |
| **Travel Frequency** | 2–3 trips/year, mix of leisure and work |
| **Behavioral Traits** | Reads MileLion/Suitesmile weekly, participates in Telegram miles chat groups, maintains a spreadsheet of card rules, checks blogs when card T&Cs change |
| **Emotional Factors** | Feels anxiety when unsure which card to tap, frustration when discovering she exceeded a bonus cap, satisfaction ("winning") when she optimizes correctly |
| **Pain Triggers** | Standing at checkout trying to recall which card earns bonus miles for this merchant; discovering at month-end she exceeded the $1,000 bonus cap on dining 2 weeks ago |
| **Goals** | Earn enough miles for 1–2 business class redemptions per year without dedicating excessive time to tracking |

**Secondary Persona: "Passive Peter"**

| Attribute | Detail |
|-----------|--------|
| **Name/Archetype** | Passive Peter |
| **Age** | 28 |
| **Occupation** | Software Engineer |
| **Cards Held** | 2–3 miles cards |
| **Behavioral Traits** | Knows he should optimize but finds it too tedious. Uses one "safe" card for everything. Occasionally reads a miles blog but doesn't maintain a spreadsheet. |
| **Emotional Factors** | FOMO about missed miles but not motivated enough to manually track. Would engage with an automated solution. |
| **Pain Triggers** | Hearing friends talk about free business class flights while he earns miles at sub-optimal rates |

---

## 3. Root Cause Analysis (5 Whys)

**Why do users lose miles from credit card spending?**

1. **Why?** — Because they use the wrong card for certain transactions.
2. **Why?** — Because they can't remember which card earns the best rate for each merchant/category.
3. **Why?** — Because card rules are complex (category-specific earn rates, monthly caps, MCC exclusions, promotional periods) and differ across 4–7 cards from different banks.
4. **Why?** — Because banks design reward structures to be competitively differentiated, creating a fragmented landscape that no single information source consolidates in real-time.
5. **Why?** — Because no product exists that sits at the intersection of the user's real-time spending state (remaining caps, cumulative spend) and the card rules database to deliver contextual, personalized recommendations at the moment of payment.

**Root Cause**: The fundamental gap is the absence of a **real-time, state-aware recommendation layer** between the user's multi-card portfolio and the point-of-payment decision.

---

## 4. Value Creation Analysis

### 4.1 Value Frameworks

**Maslow's Hierarchy Mapping**:
- **Safety/Security** (Level 2): Financial security — not losing money/value through suboptimal card usage
- **Esteem** (Level 4): Feeling smart/competent about financial decisions; social validation when redeeming miles for premium travel
- **Self-Actualization** (Level 5): Mastering the "miles game" with minimal effort

**Bain's 30 Elements of Value**:
| Element | Category | How We Deliver |
|---------|----------|----------------|
| **Saves time** | Functional | Eliminates manual research and tracking |
| **Simplifies** | Functional | Turns complex multi-card rules into one recommendation |
| **Reduces cost** | Functional | More miles = more free flights |
| **Reduces effort** | Functional | Automated cap tracking and card selection |
| **Avoids hassles** | Functional | No more spreadsheets or blog lookups |
| **Reduces anxiety** | Emotional | Confidence at every checkout |
| **Rewards me** | Emotional | Tangible miles gain, gamification of optimization |
| **Informs** | Functional | Real-time visibility into spending state across cards |

### 4.2 Measuring Value Created

| Metric Type | Metric | Current State | Target State |
|-------------|--------|---------------|--------------|
| **Better** | Miles earned per dollar (effective rate) | ~1.2 mpd (suboptimal card usage) | ~2.5–4.0 mpd (optimal card per transaction) |
| **Faster** | Time to decide which card at checkout | 10–30 seconds (or default to "safe" card) | <2 seconds (instant recommendation) |
| **Cheaper** | Annual miles lost to errors | ~5,000–15,000 miles (SGD 200–600 value) | <500 miles lost |
| **Subjective** | Confidence at checkout | Low–Medium (anxiety, uncertainty) | High (trust in system) |

### 4.3 Value vs Impact

| Dimension | Assessment |
|-----------|------------|
| **Value to User** | HIGH — directly removes the core friction (wrong card selection, missed caps), saves time, earns more miles |
| **Impact on System** | MEDIUM-HIGH — for banks: increased category-aligned spending, better card engagement, reduced churn from premium miles cards. For ecosystem: could grow overall miles earning awareness |
| **Time Horizon** | Short-term value (immediate miles gain); medium-term impact (behavioral shift, card portfolio optimization) |

---

## 5. User Research Insights (Community-Sourced)

### 5.1 Pain Points Validated by Community

Based on analysis of HardwareZone forums, MileLion, Suitesmile, and community discussions:

| Source | Insight | Implication |
|--------|---------|-------------|
| [HardwareZone](https://forums.hardwarezone.com.sg/threads/who-gave-up-miles-chasing-via-credit-card.7187086/) | Many users have given up miles chasing due to complexity — some went from 7–10 cards to just 2 | Validates that manual tracking is unsustainable; automated solution could re-engage this segment |
| [HardwareZone](https://forums.hardwarezone.com.sg/threads/best-order-for-using-singapore-air-miles-credit-cards-and-avoiding-orphan-miles.6907785/) | Users actively seek help on "best order" for using miles cards, orphan miles avoidance | Confirms confusion around multi-card strategy; sequencing/prioritization is a real need |
| [MileLion 2026 Strategy](https://milelion.com/2026/01/10/the-milelions-2026-credit-card-strategy/) | Even expert bloggers update their card strategy annually, reflecting constant rule changes | If experts need annual reviews, casual users are certainly struggling |
| [Suitesmile 2026](https://suitesmile.com/blog/2026/01/03/miles-credit-card-strategy-singapore/) | Detailed guides needed for each spending category (dining, transport, online) | Category-specific optimization is the core complexity users face |
| Community sentiment | Miles described as "imaginary coins subject to spontaneous devaluation" | Trust/value perception is fragile — product must demonstrate tangible value clearly |

### 5.2 The 1-2-3 Framework Validation

| Level | Analysis |
|-------|----------|
| **1st Principle Need** | Financial optimization (Safety in Maslow's hierarchy) — people fundamentally want to get maximum value from their spending. This need is timeless. |
| **2nd Order Thinking** | Beneath the surface: users don't just want miles — they want the **feeling of being smart with money** and **not leaving value on the table**. The anxiety of "missing out" is the emotional iceberg beneath the functional task of card selection. |
| **3rd Person Perspective** | Market data validates this: Singapore has one of the highest credit card penetration rates in Asia; the cards and payments market is projected to reach USD 50.37B by 2033. MileLion, Suitesmile, and HardwareZone forums show sustained, active communities seeking optimization help — confirming this is not a niche concern. |

---

## 6. Market Context

### 6.1 Singapore Market Data

| Metric | Value | Source |
|--------|-------|--------|
| Cards & Payments Market (2025) | USD 24.12 billion | [Market Data Forecast](https://www.marketdataforecast.com/market-reports/Singapore-Cards-and-Payments-Market) |
| Projected Market (2033) | USD 50.37 billion (CAGR 9.64%) | [Market Data Forecast](https://www.marketdataforecast.com/market-reports/Singapore-Cards-and-Payments-Market) |
| Resident Population | 4.20 million (June 2025) | [Population.gov.sg](https://www.population.gov.sg/our-population/population-trends/overall-population/) |
| Labour Force Participation (25–64) | 80.5% female, 91.8% male | [MOM Labour Force 2025](https://stats.mom.gov.sg/iMAS_PdfLibrary/mrsd-labour-force-in-singapore-advance-release-2025.pdf) |
| Estimated Target Segment (25–45, professionals, miles-focused) | ~200,000–400,000 individuals | Estimated: ~1.2M residents aged 25–45 × ~30% holding premium miles cards |
| Key Miles Programs | KrisFlyer (SIA), Asia Miles (Cathay), Velocity (Virgin) | Industry knowledge |
| Popular Miles Cards | Citi PremierMiles, DBS Altitude, UOB PRVI Miles, OCBC 90°N, KrisFlyer UOB, HSBC Revolution | [SingSaver](https://www.singsaver.com.sg/credit-card/comparison/best-air-miles-credit-cards), [Suitesmile](https://suitesmile.com/best-miles-credit-cards-singapore/) |

### 6.2 Enabling Infrastructure

| Factor | Status | Relevance |
|--------|--------|-----------|
| **SGFinDex** | Live with 15 financial institutions | Could enable secure credit card data retrieval; however, fintech players currently not in the ecosystem |
| **Contactless Payments** | Dominant in SG (Apple Pay, Google Pay, Samsung Pay) | Creates the "no time to think" moment where users need instant card recommendations |
| **Open Banking Trend** | MAS actively pushing; evolving regulations | Future opportunity for direct bank integrations |
| **Super Apps / Embedded Finance** | Growing (GrabPay, Shopee, etc.) | Competitive threat but also partnership opportunity |

---

## 7. Existing Solutions Analysis

### 7.1 Current Alternatives

| Solution | Type | What It Does | Gaps |
|----------|------|-------------|------|
| **MileLion** | Blog/Content | Expert guides on card strategy, annual reviews, "What card do I use for..." guides | Static content; requires user to read, interpret, and remember. No real-time tracking. |
| **Suitesmile** | Blog/Content | Miles credit card news, earn rate comparisons, strategy guides | Same as above — informational, not actionable at point of payment |
| **SingSaver** | Comparison Site | Compare credit cards, apply online. "Best miles cards" rankings | Focused on card acquisition, not ongoing spend optimization. No cap tracking. |
| **MoneySmart** | Comparison Site | Card comparison, financial calculators, "best way to collect miles" guides | Same as SingSaver — selection tool, not usage optimization tool |
| **Spreadsheets / Notes** | DIY Tool | Users manually track earn rates, caps, rules | High cognitive load, error-prone, not real-time, requires constant manual updates |
| **Telegram Groups** | Community | Crowdsourced tips, deal alerts, rule change notifications | Noisy, unstructured, not personalized to user's card portfolio |
| **AwardWallet** (US-centric) | Rewards Tracker | Tracks loyalty program balances across airlines/hotels | Balance tracking only; doesn't recommend which card to use; limited SG support |

### 7.2 Gap Summary

**No existing solution in Singapore operates at the point of spend or accounts for a user's real-time spending state (remaining monthly bonus limits, cumulative category spend).**

The market gap is clear:
- **Content sites** (MileLion, Suitesmile) → Inform but don't act
- **Comparison sites** (SingSaver, MoneySmart) → Help choose a card, not use it optimally
- **DIY tools** (spreadsheets) → Require the effort the user wants to eliminate
- **Community** (Telegram, HardwareZone) → Crowdsourced but not personalized

---

## 8. Hypothesis & Differentiation

### 8.1 Hypothesis (Proposed Solution)

A **context-aware mobile application** that automatically recommends the optimal credit card at the point of payment based on:
- Spend category (dining, transport, online, etc.)
- Remaining bonus cap for each card (real-time tracking)
- User preferences and card portfolio
- Merchant-specific rules and exclusions

The system continuously tracks cumulative spending across cards and updates recommendations in real-time.

**Testable Hypothesis**: We believe that **automating card selection and cap tracking at the point of payment** will help miles-focused consumers in Singapore **earn 20–40% more miles per dollar** and **reduce missed bonus opportunities by 80%+**, compared to manual search or memory-based approaches.

### 8.2 Differentiation vs Existing Alternatives

| Our Approach | Existing Alternatives | Why Ours Is Better |
|--------------|----------------------|-------------------|
| Real-time, state-aware recommendations at point of payment | Static information requiring user lookup | Eliminates the cognitive load entirely; acts when the user needs it most |
| Automated cap tracking across all user's cards | Manual spreadsheet tracking or no tracking at all | Prevents the #1 cause of lost miles (exceeding caps unknowingly) |
| Personalized to user's actual card portfolio | Generic "best cards" lists for everyone | Relevant to what the user actually holds, not aspirational |
| Proactive alerts (approaching cap, better card available) | Reactive — user must seek information | Shifts from user-pull to system-push model |
| Quantifies miles saved/earned with a personal dashboard | No visibility into optimization performance | Provides tangible proof of value, reinforcing engagement |

---

## 9. Innovation Sweet Spot Validation

| Dimension | Assessment | Confidence |
|-----------|------------|------------|
| **Desirability** (Users want this) | HIGH — Community forums show users spending significant effort on manual tracking; many give up entirely. Clear demand for automation. | 85% |
| **Feasibility** (Can we build this) | MEDIUM-HIGH — Credit card rule databases can be built/maintained; spending tracking requires user input or bank API integration (SGFinDex potential). No novel technology required, but data maintenance is ongoing work. | 75% |
| **Viability** (Business model works) | MEDIUM-HIGH — Freemium model (basic free, premium for real-time alerts + full portfolio tracking). Potential B2B revenue from banks (referral fees, card engagement data). Singapore market is compact but high-value. | 70% |

**Conclusion**: The product sits solidly within the Innovation Sweet Spot. The primary risk is in ongoing data maintenance (card rules change frequently) and user onboarding friction (inputting card portfolio and spending data).

---

## 10. Customer Journey Map

### 10.1 Current State (Without MaxiMile)

| Stage | User Action | Pain Point | Emotion |
|-------|-------------|------------|---------|
| **Awareness** | Discovers miles cards via blogs, friends, or bank marketing | Overwhelmed by options; doesn't know which cards complement each other | Curious but confused |
| **Research** | Reads MileLion, SingSaver, HardwareZone threads | Information overload; conflicting advice; rules change frequently | Frustrated, uncertain |
| **Setup** | Creates spreadsheet/notes of earn rates and caps per card | Time-consuming; quickly becomes outdated | Determined but annoyed |
| **Daily Use** | At checkout: tries to recall which card earns bonus miles for this category | Forgets rules, defaults to "safe" card, misses bonus opportunities | Anxious, rushed |
| **Tracking** | End of month: manually reconciles spending against caps | Discovers exceeded caps or missed opportunities after the fact | Disappointed, regretful |
| **Optimization** | Adjusts strategy based on what went wrong | Cycle repeats; fatigue builds; some users give up entirely | Fatigued, considering giving up |

### 10.2 Future State (With MaxiMile)

| Stage | User Action | Our Solution | Emotion |
|-------|-------------|--------------|---------|
| **Onboarding** | Inputs card portfolio (card names, types) | Guided setup with auto-populated card rules | Easy, promising |
| **Daily Use** | Opens app before/during checkout | Instant recommendation: "Use [Card X] for this purchase — earns 4 mpd, $350 cap remaining" | Confident, empowered |
| **Tracking** | Logs transaction (manual or eventually automated) | Auto-updates remaining caps, cumulative category spend | Effortless, informed |
| **Alerts** | Receives notification | "Your DBS Altitude dining cap is 80% used — switch to OCBC 90°N for dining this week" | Grateful, proactive |
| **Review** | Monthly dashboard | "This month: 12,450 miles earned, 2,100 bonus miles saved vs default card" | Satisfied, validated |
| **Optimization** | System suggests portfolio improvements | "Adding [Card Y] could earn you 5,000 more miles/year based on your spending pattern" | Delighted, loyal |

---

## Discovery Summary

### Key Findings
1. **Problem is real and validated**: Community forums show users spending significant effort on manual tracking, many abandoning miles optimization entirely due to complexity.
2. **Market gap is clear**: No existing Singapore solution provides real-time, state-aware card recommendations at the point of payment.
3. **Target segment is sizable**: Estimated 200,000–400,000 potential users in Singapore's miles-focused professional segment.
4. **Value proposition is strong**: Quantifiable value (more miles, less effort), emotional value (confidence, reduced anxiety), and system value (better card engagement for banks).
5. **Feasibility is achievable**: No novel technology required; primary challenge is data maintenance and user onboarding.

### Recommendation
**Proceed to full product strategy and PRD.** The problem passes all validation criteria, the market gap is substantiated, and the Innovation Sweet Spot is confirmed across desirability, feasibility, and viability.
