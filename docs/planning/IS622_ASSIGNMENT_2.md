# IS622 Assignment 2 — Product Strategy (MaxiMile)

> Each answer ≤ 100 words. Aligned to scoring rubric (4–5 mark criteria).

---

## Q1. What is your product's vision?

Make every transaction count for miles chasers, so no mile is left behind, no cap goes untracked, and no reward goes unclaimed. We believe earning miles should feel effortless, not exhausting. MaxiMile will become the indispensable companion that answers "which card should I use?" for miles-focused consumers in Singapore, turning the complexity of reward programmes into automatic, optimised decisions that help users earn up to 3x more miles from the same everyday spending, without thinking twice.

**(76 words)**

---

## Q2. What is your product's key value proposition?

MaxiMile eliminates the guesswork from credit card miles optimisation. Instead of juggling spreadsheets, memorising cap limits, and second-guessing every tap, users get one intelligent companion that continuously learns their spending, adapts to their card portfolio, and ensures the right card is used at the right moment every time. The result: users recover the 5,000–15,000 miles (worth SGD 200–500 in flights) they currently lose each year to suboptimal decisions, while the recommendation gets more relevant with every transaction. MaxiMile doesn't just recommend cards, it ensures users compound miles effortlessly.

**(83 words)**

---

## Q3. What are your target market segment(s)?

We target Singapore's ~400K miles-focused cardholders (TAM), derived from ~618K Professionals, Managers, Executives and Technicians aged 25-45 (~65% with credit cards, ~40% holding miles cards). Our survey confirmed a 1:2 split, shaping a two-phase go-to-market:

**Beachhead - Active Optimisers (~130K)**: Hold 3-7 miles cards, actively track rules via spreadsheets and blogs. Prioritised first because they serve as credibility validators and seed word-of-mouth. They are our classic crossing the chasm entry point.

**Scale - Casual Earners (~270K)**: Default to one card due to complexity. A 2x larger market with frictionless transaction capturing built to serve them, but unlocked by the social proof and advocacy.

**Year 1 SOM**: 20K-50K (10-15% of ~200K SAM) via community-driven product-led growth.

---

## Q4. What is the timeframe you are setting for your product strategy? Explain your choice.

We set a 12-month strategic horizon — the product is built, the time is for building what's hard to copy. Three dependencies drive this: (1) **trust**: miles community endorsement requires months of proven accuracy; (2) **data moat**: 12 months captures one full annual spending cycle to train seasonal patterns (CNY, GSS, year-end promos); (3) **competitive urgency**: direct competitor HeyMax's US$11M Series A funds Mastercard/Amex expansion, narrowing our all-network differentiation window.

Our plan: **Phase 1 - Earn trust (Months 1-6)**: Validate accuracy across cards, achieve 60%+ retention, earn community endorsement. **Phase 2 - Monetise (Months 7-12)**: Launch premium tier, activate affiliate partnerships, compound the data moat.

### Supporting Analysis (Not for submission — timeframe reasoning notes)

**Why 12 months is the right horizon:**

| Dependency | Fits in 12 months? | Reasoning |
|-----------|-------------------|-----------|
| Community trust & MileLion endorsement | Yes (6-9 months) | Accuracy proven over multiple bank rule changes; community observes consistency |
| Full annual spending cycle | Yes (exactly 12 months) | Captures CNY, GSS, year-end promos — complete seasonal data for recommendation training |
| Affiliate partner readiness (SingSaver) | Yes (9-12 months) | Partners need 5-10K users + 3 months engagement data; achievable by Month 9 |
| Premium tier validation | Yes (6-9 months) | Free users need enough value experience before conversion; launch premium at Month 7 |

**Why not shorter (6 months)?**

| Concern | Detail |
|---------|--------|
| Incomplete spending cycle | Misses seasonal patterns (CNY, GSS, year-end) — recommendations trained on partial data |
| Insufficient trust-building | Community needs to see accuracy through multiple bank rule changes |
| Revenue premature | Partners won't sign with <5K users |

**Why not longer (18-24 months)?**

| Risk | Detail |
|------|--------|
| HeyMax closing the gap | US$11M Series A funds Mastercard/Amex expansion — likely within 12 months |
| Features already built | Product is ready; longer horizon creates false sense of time |
| Over-planning rigidity | Market conditions shift; quarterly OKRs provide agility |
| SG TAM ceiling | ~400K users means prove the model fast, then expand |

**SG/SEA Fintech Benchmarks:**

| Company | Milestone | Timeframe |
|---------|-----------|-----------|
| HeyMax | Seed → Series A (US$6M ARR, 150K users) | 18 months |
| Syfe | Launch → Series A | 14 months |
| Endowus | Launch → S$1B AUM | 20 months |
| Funding Societies | Launch → Series A | 14 months |

12 months is tighter than all benchmarks — justified because our product is already built, unlike these companies who spent 6-12 months building before proving.

Source: `docs/research/PRODUCT_STRATEGY_TIMEFRAMES.md`

---

## Q5. What is the key challenge now for your product to move towards your product vision?

**Getting users to open MaxiMile during the 2-3 second contactless payment moment — and making it a habit.** We evaluated three challenges — data accuracy, competitive timing, and habit formation — and habit formation is the hardest because the other two can be solved with better code, but changing user behaviour cannot be forced. If users forget to check MaxiMile before tapping their card, recommendations go unused, spending cap data becomes stale, and the product loses its core value loop.

Our approach uses BJ Fogg's Behaviour Model: strengthen **Motivation** (show miles saved after each use), lower **Effort** (auto-capture already removes manual logging), and add **Prompts** (timely push notifications when approaching spending caps or entering high-spend categories).

### Supporting Analysis (Not for submission — consultant reasoning notes)

**Why habit formation over other candidates:**

| Candidate Challenge | Severity | Solvability | Why Not #1 |
|---------------------|----------|-------------|------------|
| Data accuracy (card rules) | High | Engineering-solvable | Community submissions + MileLion audit pipeline already mitigate. Correctible without user behaviour change. |
| Competitive timing (HeyMax) | Medium | Partially controllable | HeyMax is Visa-only, no Mastercard/Amex. Our all-network coverage is a 6-12 month structural lead. |
| **Habit formation at POS** | **Critical** | **Requires behavioural change** | **Cannot be solved by code alone. If users don't open the app, every other capability is wasted.** |
| Monetisation | Medium | Sequencing-dependent | Premature to monetise without proven retention. Trust-first strategy is correct. |

**The Behavioural Science Case:**

Nir Eyal's Hooked Model maps directly to MaxiMile's challenge:
1. **Trigger** (External → Internal): Push notification at merchant → evolves to internal habit ("which card?")
2. **Action**: Open app, tap category, see recommendation
3. **Variable Reward**: "You saved 2.4x more miles than average" — the variability keeps engagement
4. **Investment**: Each logged transaction improves cap accuracy, making future recommendations better (stored value)

The critical gap today: **Step 1 (Trigger) is weak.** Without auto-capture or location-aware prompts, the trigger relies entirely on user memory — the least reliable mechanism.

**Evidence from analogues:**
- **CardPointers (US)**: Solved this with Apple Wallet integration — card recommendations surface *inside* the payment flow. Downloads grew 3x after this feature.
- **Kudos (US)**: Browser extension intercepts online checkout — zero friction at payment moment. $10M+ raised on this insight.
- Both prove that reducing the action gap between "decide" and "pay" is the single biggest growth lever.

**Measurable validation gates:**
- **Month 1**: ≥60% of onboarded users open app ≥1x/week
- **Month 3**: ≥40% check recommendations 3+/week (habit threshold)
- **Month 6**: D30 retention ≥45% (vs. 60% stretch target)
- **Fail-fast trigger**: If Month 3 gate misses by >50%, reprioritise auto-capture to immediate sprint

---

## Q6. What are the capabilities you need to build? And by when do you need to achieve them?

We used RICE scoring (Reach, Impact, Confidence, Effort) to rank capabilities into three priority tiers, and this ranking directly drove our delivery sequence in vibe coding — highest-priority capabilities were built first.

**Priority 1 — Accuracy foundation (highest RICE, delivered)**: Card rules database covering 29 Singapore miles cards with earn rates, caps, and exclusions; recommendation engine matching spend categories to optimal card; real-time cap tracking with automated alerts.

**Priority 2 — Habit and retention (mid RICE, delivered)**: Auto-capture via Apple Pay Shortcuts and Android notifications to eliminate manual logging; miles portfolio dashboard with transfer partner mapping; merchant search so users think in merchants, not categories.

**Priority 3 — Ecosystem and monetisation (lower RICE, by Month 12)**: Community-sourced rate change submissions; AI-powered rate detection pipeline; premium tier billing infrastructure; affiliate partnership integrations.

Priority 3 must be achieved by Month 12 — before HeyMax closes the all-network gap — and each tier gates the next: accuracy builds trust, trust enables habits, habits justify monetisation.

### Supporting Analysis (Not for submission — RICE-backed capability reasoning)

**RICE Scores Driving the Sequencing:**

| Phase | Feature | RICE Score | Why This Phase |
|-------|---------|------------|----------------|
| **Month 1-3** | F36 Earn Rate Data Refresh | 14,250 | Incorrect data = wrong recommendations = zero trust |
| | F30 Petrol/Bills Resolution | 9,500 | Category confusion causes incorrect card picks |
| | F32 Condition Transparency | 4,800 | Users need to see the "why" behind recommendations |
| | F1-F5 Core MVP (Portfolio, Recommend, Caps, Logging, DB) | 2,000-4,500 | Foundation everything else depends on |
| **Month 4-6** | F41 Navigation Restructure | 19,000 | Highest RICE score — surfaces transactions at top level |
| | F40 Auto-Capture Setup Carousel | 6,300 | Reduces shortcut setup drop-off (habit gate) |
| | F42 Merchant Search | 3,200 | Users think "Starbucks" not "dining" — reduces category confusion |
| | F26/F27 Auto-Capture | 2,975/1,575 | Already shipped — eliminates manual logging friction |
| | F13 Miles Portfolio | 2,267 | Tangible proof that optimisation is working |
| **Month 7-12** | F24 Community Rate Submissions | 2,560 | Crowdsourced data keeps rules current at scale |
| | F25 Automated Rate Detection | 875 | Lower confidence (50%) — AI pipeline needs validation |
| | Premium tier + affiliate billing | N/A | Revenue infrastructure — must follow proven retention |

**Why accuracy before habit before monetisation:**

```
Month 1-3: Accuracy → "Can I trust this app?"
   ↓ YES → proceed
Month 4-6: Habit → "Do I use it every day?"
   ↓ YES → proceed
Month 7-12: Monetise → "Will I pay for this?"
```

Each phase gates the next. Monetising before trust is proven destroys retention. Building habit features on inaccurate data produces confident-but-wrong recommendations — worse than no app at all.

**What we are NOT building (and why):**

| Deferred Capability | RICE Score | Reason |
|---------------------|------------|--------|
| F10 Portfolio Optimizer | 300 | Needs 3+ months of data; premature in Year 1 |
| F12 Social/Community | 67 | Lowest RICE; distraction from core value loop |
| F38 SC Smart Card Bonus Tiers | 667 | Cashback card — doesn't fit miles-only positioning |
| F37 DBS yuu Card Integration | 1,575 | Complex merchant-specific logic; deferred to post-Month 12 |

---

## Q7. What are your success metrics? How are you going to implement the measurement?

**North Star Metric**: Monthly Active Recommendations Used (MARU)
- Recommendations users act on per month (target: 10,000 per month by Month 6)

**Leading indicators**:
- New users who act on a recommendation within 7 days of signup (target 40%)
- Recommendation check frequency (target 3+ per week)
- Transaction logging rate (target 80%)

**Lagging indicators**:
- Cap breach rate (target below 5%)
- Day-30 retention (target 15%, stretch 25%)
- Monthly churn (target below 10%)
- Net Promoter Score (target 40+)

**Implementation**:
- PostHog for event tracking and funnel analysis
- Supabase for server-side cohort queries and cap breach computation
- Four key events: recommendation acted, transaction logged, cap breach, onboarding completed
- Funnel: onboarding → first recommendation → first transaction → Day-7 return
- NPS via quarterly in-app surveys

### Supporting Legend (Not for submission — what each indicator means)

| Indicator | What It Measures | Why It Matters | How It's Computed |
|-----------|-----------------|----------------|-------------------|
| **MARU** (North Star) | Number of times users follow a card recommendation per month | Directly measures whether users trust and act on MaxiMile's core value — the right card at checkout | Count of `recommendation_acted` events per calendar month |
| **Activation rate** (Leading) | Percentage of new users who act on their first recommendation within 7 days of signup | Early activation is the strongest predictor of long-term retention — users who get value on Day 1 stay | `(users with first recommendation_acted within 7 days) / new signups` |
| **Recommendation check frequency** (Leading) | How often users open the recommend screen per week | Proxy for habit formation (Q5 challenge) — 3 or more per week indicates the app is part of the payment routine | Count of `recommendation_viewed` events per user per week |
| **Transaction logging rate** (Leading) | Percentage of estimated transactions that users actually log | Cap tracking accuracy depends on logged data — below 60% means caps become stale and recommendations go wrong | `logged transactions / estimated transactions` (estimated from average spend frequency) |
| **Cap breach rate** (Lagging) | Percentage of transactions where the user exceeded a bonus cap | Measures whether MaxiMile is actually preventing the core pain point — wasted spend on maxed-out cards. 60% baseline is the estimated breach rate without any tool | `cap_breach_events / total_transactions` (server-side computed) |
| **Day-30 retention** (Lagging) | Percentage of users who are still active 30 days after signup | Confirms the product delivers sustained value beyond novelty — users who stay past Day 30 are likely long-term | Standard retention cohort: `(users active on Day 30) / (users who signed up 30 days ago)` |
| **Monthly churn** (Lagging) | Percentage of active users who stop using the app each month | Inverse of retention — directly threatens MARU growth. Below 10% means the user base compounds over time | `(users active last month but not this month) / users active last month` |
| **Net Promoter Score** (Lagging) | User satisfaction and likelihood to recommend MaxiMile to others | Word-of-mouth is our primary growth channel (Q10) — NPS predicts organic referral volume | Standard NPS survey (0-10 scale), collected quarterly in-app |

### Supporting Analysis (Not for submission — metrics reasoning)

**Why MARU over MAU as North Star:**

MAU tells you how many people opened the app. MARU tells you how many people *trusted* a recommendation enough to act on it. For a product whose entire value proposition is "use the right card at checkout", the moment of truth is whether the user follows the recommendation — not whether they logged in.

**MARU Decomposition:**

```
MARU = MAU × Reach Rate × Act Rate
     = 5,000 × 50% × 40%
     = 1,000 acting users × 10 avg interactions
     = 10,000 MARU target
```

This decomposition is diagnostic: if MARU is low, is it because users aren't opening the recommendation screen (reach problem = habit challenge from Q5) or because they see recommendations but don't follow them (trust problem = accuracy challenge)?

**Why these leading vs lagging indicators:**

| Metric | Type | Why It Matters |
|--------|------|----------------|
| Activation rate (Day 7) | Leading | Users who act on a recommendation within 7 days are 3x more likely to retain at Day 30 |
| Recommendation frequency (3+/week) | Leading | Directly feeds MARU; proxy for habit formation (Q5 challenge) |
| Transaction log rate (70%+) | Leading | Accurate cap tracking depends on logged transactions; below 60% = stale data = wrong recommendations |
| Day-30 retention (20%+) | Lagging | Confirms the product delivers sustained value, not just novelty |
| Cap breach rate (<5%) | Lagging | Measures recommendation accuracy — if users still breach caps, the engine is failing |
| NPS (40+) | Lagging | Word-of-mouth proxy — critical for community-driven growth strategy (Q10) |

**What we are deliberately NOT measuring:**

| Metric | Why Excluded |
|--------|-------------|
| Time in app | MaxiMile is designed for 2-3 second use — long sessions signal confusion, not engagement |
| Total page views | Vanity metric — doesn't indicate value delivery |
| Cards added count | Useful for onboarding funnel only, misleading as standalone KPI |
| Revenue (v1) | Free tier at launch; premature to track before retention is proven |

**Implementation architecture:**

```
User action → Analytics event → Two destinations:
  1. Analytics tool (PostHog/Mixpanel) → real-time dashboards, funnel analysis
  2. Supabase → cohort queries, cap breach computation via RPCs
```

Key events instrumented:
- `recommendation_viewed` — user opened a category recommendation
- `recommendation_acted` — user confirmed they used the recommended card (MARU event)
- `transaction_logged` — manual or auto-captured transaction recorded
- `cap_breach` — user exceeded a bonus cap (server-side computed)
- `onboarding_completed` — all setup steps finished
- `app_opened` — session start (for retention cohorts)

---

## Q8. What are you trading off to reach your goals?

**Miles-only over cashback**: Excludes ~60% of cardholders, but miles and cashback have entirely different earn mechanics, cap logic, and redemption models. Our problem statement targets miles optimisation — cashback is a separate problem requiring a separate rules engine.

**Notification-based capture over bank API**: SGFinDex restricts access to licensed financial institutions, and direct bank partnerships require 6+ months each with regulatory compliance. We built auto-capture via Apple Pay Shortcuts and Android notification parsing instead — already shipped, achieving near-zero friction without bank dependencies.

**Free core product over early monetisation**: Forgoing affiliate commissions (SGD 50-300 per approval) to keep recommendations unbiased. Trust first, monetise in Phase 2.

**Singapore-only over regional expansion**: Constrains TAM to ~400K but enables deep localisation across 29 cards. Prove the model locally before expanding.

### Supporting Analysis (Not for submission — trade-off reasoning)

**The trade-off framework:**

Each trade-off follows the same logic: *sacrifice short-term revenue or reach to protect the trust loop that makes the product work.*

| Trade-off | What We Sacrifice | What We Gain | Reversible? |
|-----------|-------------------|-------------|-------------|
| Miles-only | ~60% of cardholders (cashback users) | Clear positioning, simpler engine, community credibility | Yes — v2 can add cashback |
| Manual logging (v1) | Frictionless onboarding | Feasibility without bank API dependency | Already mitigated — auto-capture shipped |
| Free core product | SGD 50-300/approval affiliate revenue, subscription MRR | Unbiased recommendations = trust = retention | Yes — premium tier planned Month 7+ |
| Singapore-only | Regional TAM (MY, HK, TW have similar miles cultures) | Deep localisation (29 cards, SG-specific MCCs, local blogs) | Yes — expand after model proven |

**Why trust is the common thread:**

All four trade-offs protect the same thing — user trust in recommendations. If users suspect MaxiMile earns commissions from recommending certain cards, the entire value proposition collapses. This is why we defer monetisation until Phase 2 (Q4), after retention proves the product works.

**What we considered but rejected as trade-offs:**

| Rejected Trade-off | Why We Didn't Make It |
|--------------------|-----------------------|
| Accuracy over speed | We refused to trade this — inaccurate data is worse than no product (Q6 Priority 1) |
| Community-only launch over broad marketing | Not a real trade-off — community IS the optimal channel (Q10), not a constraint |

---

## Q9. What is your product's competitive advantage?

**Structured data moat**: A Singapore-specific card rules database covering 30 miles cards with category-level earn rates, bonus caps, and MCC exclusions. This is modelled as structured, queryable data, not static blog content. Competitors either cover Visa-only (HeyMax) or present rules editorially (MileLion, Suitesmile).

**Compounding data flywheel**: Each transaction strengthens the system (Recommend → Pay → Auto-capture → Cap update → Better recommendation). More usage means more accurate recommendations, increasing switching costs. Community-sourced rate submissions and backend auto-scraping system make this self-updating.

**All-network coverage**: MaxiMile supports Visa, Mastercard, and Amex. HeyMax (our closest funded competitor, US$11M Series A) currently covers Visa only, giving us a structural lead while they expand.

### Supporting Analysis (Not for submission — competitive advantage reasoning)

**Why each advantage is defensible:**

| Advantage | Easy to Copy? | Time to Replicate | Why It's Defensible |
|-----------|--------------|-------------------|---------------------|
| 29-card structured database | Medium | 3-6 months | Data entry is feasible, but ongoing maintenance (rate changes, cap adjustments, MCC exclusion updates) requires continuous effort + community pipeline |
| Data flywheel | Hard | 12+ months | Requires active user base generating transaction data — chicken-and-egg problem for new entrants |
| All-network coverage | Medium | 6-12 months | Engineering feasible, but each network has different data formats and merchant classification systems |
| Community trust (MileLion endorsement) | Hard | 12+ months | Trust is earned over time through proven accuracy — cannot be bought or fast-tracked |
| Auto-capture (shipped) | Medium | 2-3 months | Technically replicable, but requires platform-specific work (iOS Shortcuts, Android notification parsing) |

**Competitive positioning map:**

```
                    Static Content ←————————→ Real-Time Recommendations
                         |                            |
Card Selection      SingSaver                    dtenAI (early)
(which card          MoneySmart
 to GET)                |                            |
                        |                            |
Card Usage           MileLion                    MaxiMile ← YOU ARE HERE
(which card          Suitesmile                  HeyMax (Visa-only)
 to USE)             Telegram groups              CardPointers (US-only)
```

MaxiMile occupies the only empty quadrant in Singapore: **real-time recommendations for card usage optimisation**.

**Against each competitor:**

| Competitor | Their Strength | MaxiMile's Advantage |
|------------|---------------|---------------------|
| **HeyMax** (US$11M funded) | Visa cap tracking, free, well-funded | All-network (Visa + MC + Amex), deeper recommendation logic, category-level not just card-level |
| **MileLion** | Trusted authority, 948K monthly visits | Structured data vs editorial content; real-time vs annual strategy guides; complementary not competitive |
| **SingSaver/MoneySmart** | High traffic, bank partnerships | They help users GET cards; we help users USE cards. Complementary — potential partnership |
| **dtenAI** | SG-specific, AI-driven | No evidence of traction, app store presence, or funding. Appears to be early-stage/side project |
| **CardPointers/MaxRewards** (US) | Proven model, funded | US-only. No SG card support. Validates the category for us |

---

## Q10. How do you plan to launch and grow your product's adoption?

**Launch (Month 1-3)**: Community-seeded product-led growth via MileLion partnership (948K monthly visits, 31K Telegram members) — near-zero acquisition cost. Beta with 50 active optimisers for accuracy validation. Co-branded review article and social media demos ("tap the right card in 2 seconds") drive awareness.

**Growth (Month 4-8)**: Free tier drives organic word-of-mouth — users share "miles saved" results within miles communities and on social media. Referral program (invite a friend, both get 1 month free Premium) compounds growth. Content partnerships with Suitesmile and financial micro-influencers amplify reach.

**Monetise (Month 9-12)**: Premium tier (SGD 4.99/month) for power users. Complementary positioning with SingSaver/MoneySmart — they drive card acquisition, we drive card usage optimisation.

### Supporting Analysis (Not for submission — GTM reasoning)

**Why community-led PLG over paid acquisition:**

| Strategy | CAC | Trust | Fit for MaxiMile |
|----------|-----|-------|------------------|
| Paid ads (Facebook/Google) | SGD 15-30/install | Low — users sceptical of fintech ads | Poor — SG fintech CAC rose 40-60% in 2024 |
| Influencer marketing | SGD 5-15/install | Medium | Medium — one-off spikes, not sustained |
| Community seeding (MileLion) | Near-zero | High — endorsed by trusted authority | Best — miles community is tight-knit, endorsement-driven |
| App Store Optimisation | SGD 1-3/install | Medium | Good secondary channel — captures intent-driven search |

Community-led is the only strategy that simultaneously solves acquisition AND trust — which is critical for a product that asks users to follow financial recommendations.

**The PLG flywheel:**

```
Free tier → User gets value (miles saved) → Shares with miles community
    ↓                                              ↓
Organic growth ← New user joins ← Word-of-mouth / MileLion endorsement
    ↓
Power users hit free tier limits → Premium conversion (Month 9+)
```

**Why MileLion is the single highest-leverage channel:**

- 948K monthly visits — largest miles-focused audience in SG
- 31K Telegram members — highly engaged, real-time community
- Aaron Wong (founder) is the trusted authority — his endorsement is worth more than any paid campaign
- MileLion readers ARE our target persona (Active Optimisers holding 3-7 miles cards)
- A single co-branded review article ("MaxiMile Review — Does It Actually Earn You More Miles?") reaches the exact audience with built-in credibility

**Phase-by-phase metrics:**

| Phase | Key Metric | Target |
|-------|-----------|--------|
| Launch (Month 1-3) | Beta users, accuracy validation | 50 beta → 2,000 installs |
| Growth (Month 4-8) | MAU, activation rate | 5,000 MAU, 40% activation |
| Monetise (Month 9-12) | Premium conversion, MRR | 10-15% conversion, SGD 2,500-7,500 MRR |

---

## Q11. Bonus: What are your assumptions about this product strategy? How do you validate them?

**Key assumptions and validation**:

1. **Miles community will drive early adoption** (validated): MileLion is the top source (43% of survey), 89% lack cap tracking. Falsification: fewer than 500 organic installs by Month 3.

2. **Users will form the checkout habit** (requires validation): track recommendation frequency weekly. Falsification: below 3 times per week by Month 3.

3. **Power users will pay** (requires validation): survey willingness to pay SGD 3-5 per month. Falsification: free-to-premium conversion below 5% by Month 10.

4. **Card rules stay accurate** (requires ongoing validation): auto-scraping and community submissions operational. Validate via detection lag (under 7 days) and error rate (under 5%, quarterly cross-audits).

### Supporting Analysis (Not for submission — assumption reasoning)

**Why these four assumptions and not others:**

Each assumption maps to a critical link in the value chain. If any one breaks, the strategy fails:

```
Community adoption (A1) → Habit formation (A2) → Monetisation (A3)
         ↑                        ↑                       ↑
    Data accuracy (A4) ──────────────────────────────────────
```

**Assumption validation matrix:**

| # | Assumption | Status | Evidence | Falsification Trigger |
|---|-----------|--------|----------|----------------------|
| A1 | Community drives adoption | Partially validated | Survey: MileLion #1 source (43%); 89% no cap tracking; 0% use a dedicated app today | Month 3: fewer than 500 organic installs from community channels |
| A2 | Users form checkout habit | Unvalidated (biggest risk) | Maps to Q5 key challenge. No behavioural data yet. Auto-capture reduces friction but doesn't guarantee habit | Month 3: fewer than 40% check recommendations 3+/week |
| A3 | Power users will pay | Partially validated | Survey: median WTP SGD 3-5/month; US analogues charge US$45-90/year successfully | Month 10: free-to-premium conversion below 5% |
| A4 | Data stays accurate | Validated | Community submissions (F24) + auto-scraping (F25) + MileLion audit pipeline operational. 30 cards maintained through 3 bank rule changes | Rate change detection lag exceeds 14 days consistently |

**Previously held assumptions now resolved:**

| Old Assumption | Status | How Resolved |
|----------------|--------|-------------|
| "Users will manually log transactions" | Resolved | Auto-capture shipped (F26/F27) — logging effort reduced by 90-95% |
| "Users hold 3+ miles cards" | Partially validated | Survey: 48.6% hold 3+, 81.1% hold 2+. Product works with 2+ cards. Reframed as "multi-card users" not "3+ cards" |
