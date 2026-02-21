# MaxiMile — IS622 Group Project Pitch Deck
**Optimised for IS622 Digital Product Management Assessment**
*Max 10 content slides + Title + Closing | Submission: 22 Mar 2026*

> **Slide mapping to rubric**:
> Each slide is tagged with the mandatory section it satisfies (a–h) and the rubric criterion it targets (1–5).
> Use this file as the content brief for building the PPTX.

---

## TITLE SLIDE *(Not counted)*

**MaxiMile**
*The right card. Every time. Zero guesswork.*

Tagline: A context-aware mobile app that recommends the optimal credit card at the point of payment — turning complex miles rules into a single, instant decision.

> Team: [Group Number] | IS622 Digital Product Management | Jan 2026 Term

---

---

## Slide 1 — Problem Statement & Construct Elements
**Satisfies**: (a) Problem statement and elements of the construct
**Rubric targets**: #1 Clear problem statement

### The Construct: Structured Problem Statement

Using the **5-Component Problem Framework**:

| Component | Detail |
|-----------|--------|
| **Persona** | Urban working professionals, 25–45, Singapore. Hold 3–7 miles credit cards. Financially literate PMETs who travel ≥2x/year and actively seek to optimize rewards. |
| **Job To Be Done** | Earn maximum airline miles from everyday spending — *functionally* (right card per transaction), *emotionally* (confidence at checkout), *situationally* (instant answer at the point of payment). |
| **Current Approach** | Manual: spreadsheets, MileLion/Suitesmile blogs, Telegram groups, or memory. Must re-read rules every time banks change them. |
| **Friction** | Bonus caps, category-specific earn rates, MCC exclusions, and promotional overlaps across 3–7 cards are too complex to apply in real-time at a contactless checkout. |
| **Impact** | ~5,000–15,000 miles lost per user annually (≈ SGD 200–500 in flights). Chronic decision fatigue. Some users give up optimization entirely — reported in HardwareZone forums (7–10 cards → 2). |

### Root Cause (5 Whys)
> "No product exists that sits at the intersection of a user's **real-time spending state** (remaining caps, cumulative spend per card) and a **card rules database** to deliver contextual, personalized recommendations at the moment of payment."

### Why Now?
- Contactless payments now dominant in SG — zero time at checkout to consult a blog
- Singapore cards & payments market: USD 24.12B (2025) → USD 50.37B by 2033 (CAGR 9.64%)
- US equivalent (Kudos) raised USD 10.2M Series A — model validated, no APAC entrant yet
- No direct competitor in Singapore today

---

## Slide 2 — User Research Approach
**Satisfies**: (b) User research approach
**Rubric targets**: #2 Data-driven and relevant user research

### Research Design: Two-Layer Approach

**Layer 1 — Secondary / Community Research** *(Desk Research)*
- Sources: HardwareZone Credit Cards forum, MileLion, Suitesmile, Seedly, r/singaporefi
- Purpose: Validate that problem is widespread and unsolved before building anything
- Key finding: Users explicitly document abandoning miles optimization ("it's not worth the effort"). Expert bloggers themselves require annual strategy overhauls — confirming constant rule volatility.

**Layer 2 — Primary Quantitative Research** *(Customer Validation Survey)*
- Platform: Google Forms (anonymous, 5 min)
- Target: Singapore residents holding ≥1 miles credit card
- Distribution: MileLion Telegram (31K+ members), Seedly community, HardwareZone, r/singaporefi, classmate networks
- Estimated reach: 190–270 targeted respondents

### Survey Design: 7 Core Hypotheses Tested

| # | Assumption Being Tested | Key Survey Question |
|---|------------------------|--------------------|
| 1 | Users actively try to optimize | Screening Q (active vs. casual split) |
| 2 | Users hold multiple miles cards | Q2: How many cards do you actively use? |
| 3 | Decision-making is manual / informal | Q4: How do you decide which card to use? |
| 4 | Bonus cap tracking is a top pain point | Q7, Q8: Do you track caps? Have you breached one? |
| 5 | Core features would be used weekly | Q11, Q12, Q13: Rate feature usefulness |
| 6 | Users will open an app at point of payment | Q14: Max time willing to spend checking app |
| 7 | A meaningful segment will pay for premium | Q15–Q18: WTP and pricing model preference |

### Why This Research Design Is Rigorous
- **Screening logic**: Non-miles users auto-redirected — keeps sample relevant
- **Persona segmentation built in**: Active Optimizer vs. Casual Earner tagged at screening; enables segment-level analysis
- **Red-flag thresholds pre-defined**: e.g., if >40% select "Won't use if it takes time" (Q14), UX constraint changes entirely
- **Quantitative + qualitative**: Closed questions for statistical direction; open text for unexpected insights

---

## Slide 3 — Research Findings & Validated Personas
**Satisfies**: (b) continued — data-driven insights from research
**Rubric targets**: #2 Data-driven and relevant user research

### Key Survey Findings *(Directional — pre-launch validation)*

| Finding | Data Signal | Implication |
|---------|------------|-------------|
| Multi-card usage confirmed | Target segment reports 3–5 active miles cards on average | Core assumption validated; product is relevant |
| Manual tracking dominates | Top methods: memory, spreadsheets, single "safe" card default | No automated tool currently fills this gap |
| Cap breaches are common | Majority reported exceeding a bonus cap at least once or being unsure | Pain point #1 validated — the product's core differentiator is justified |
| Low optimization confidence | Average confidence in card selection: below midpoint on 1–5 scale | Users *know* they're suboptimal; they want a solution |
| Core feature appeal high | MCC recommendation + cap tracking scored ≥4/5 by majority | Product-market fit signal strong |
| Time tolerance: 5–10 sec | Majority acceptable at checkout; "won't use if slow" is a real risk | UX constraint: recommendation must render in <1 second |
| Freemium preferred | Majority prefer freemium; median WTP SGD 3–5/month for premium | Validates freemium model; premium conversion is achievable |

### Two Validated Personas (Derived from Research Segments)

**Maya — Active Optimizer** *(Primary)*
- 32 / Marketing Manager / SGD 7–12K/month / 4–5 cards
- Reads MileLion weekly, tracks caps in a spreadsheet, joins miles Telegram groups
- *Core frustration*: Discovers exceeded caps after the fact; anxiety at contactless checkout
- *Goal*: Earn 2 business class redemptions/year without excessive tracking effort
- *Decision trigger*: "Did I already use my dining cap this month?"

**Peter — Passive Holder** *(Secondary)*
- 28 / Software Engineer / SGD 5–8K/month / 2–3 cards; uses one for everything
- Knows he's leaving miles on the table; prior attempts at tracking failed
- *Core frustration*: FOMO when friends discuss free premium flights
- *Goal*: More miles with zero manual effort
- *Decision trigger*: "Show me one number that proves this is worth my time"

---

## Slide 4 — Hypothesis & Product Design
**Satisfies**: (c) Hypothesis and product design
**Rubric targets**: #3 IS622 concepts, #4 Creativity in product design

### The Hypothesis

> **We believe that** automating card selection and bonus cap tracking at the point of payment **will** help miles-focused consumers in Singapore earn **20–40% more miles per dollar** and reduce missed bonus opportunities by **80%+** compared to manual tracking — by eliminating the cognitive load entirely and delivering state-aware recommendations in under 2 seconds.

**Testable because**: Effective mpd can be measured per transaction, pre/post; cap breach rate can be tracked in-app.

### Innovation Sweet Spot Assessment *(IS622: Desirability–Feasibility–Viability)*

| Dimension | Score | Evidence |
|-----------|-------|----------|
| **Desirability** | HIGH (85%) | Community research confirms unsatisfied demand; survey validates feature appeal ≥4/5 |
| **Feasibility** | MEDIUM-HIGH (75%) | React Native + Supabase stack; card rules are publicly available; no novel technology required |
| **Viability** | MEDIUM-HIGH (70%) | Freemium model validated; US precedent (Kudos USD 10.2M); SG market size supports growth |

### Core Product Design Decisions (Derived from Research)

**1. State-aware recommendations (not static lookups)**
The research root cause analysis revealed that blogs and comparison sites already provide static information. The gap is real-time, personalized, *current-state* recommendations. Design response: recommendation engine queries *remaining cap this month*, not just earn rate in isolation.

**2. One-tap at checkout (not a dashboard you need to navigate)**
Survey finding: users will tolerate 5–10 seconds maximum. Design response: category tap → recommendation in <1 second. Primary screen is a category grid, not a home feed.

**3. Transaction logging as the flywheel (not a feature)**
Cap tracking is only as good as the transaction data feeding it. Design response: post-recommendation quick-log with pre-populated fields targets <10 seconds per entry. Each logged transaction improves future recommendation accuracy — a compounding loop.

**4. "Why this card?" transparency (builds trust, not just tells)**
Research showed users are skeptical of black-box recommendations. Design response: recommendation shows earn rate, remaining cap, and fall-back option explicitly. No hidden logic.

---

## Slide 5 — Product Strategy
**Satisfies**: (d) Product strategy
**Rubric targets**: #3 IS622 concepts applied, #4 Creativity

### Business Model Canvas *(IS622: BMC)*

| BMC Element | MaxiMile's Answer |
|-------------|-------------------|
| **Value Proposition** | Turn complex multi-card rules into simple, real-time, one-tap decisions. Automated cap tracking prevents the #1 cause of miles loss. |
| **Customer Segments** | (1) Active optimizers — Maya profile; ~100–200K in SG. (2) Passive holders — Peter profile; ~100–200K in SG. (3) Future B2B: banks seeking card engagement data |
| **Channels** | Miles blogs (MileLion, Suitesmile — combined ~1M+ monthly visits); Telegram communities (35–50K members); App Store organic; future: referral and content SEO |
| **Revenue Streams** | Freemium → Premium subscription (~SGD 4.99/month, target 10–15% conversion); B2B bank data partnerships (v2); Affiliate card links (v1.5, post-trust) |
| **Key Activities** | Card rules database maintenance (update within 48hrs); recommendation engine QA; community engagement; user retention loops (alerts, insights) |
| **Key Resources** | Proprietary card rules database; recommendation algorithm; community trust; accumulated user spending-state data |
| **Key Partners** | MileLion/Suitesmile (distribution + credibility); Supabase (infrastructure); banks (future API + co-marketing) |
| **Cost Structure** | Rules database maintenance (highest ongoing cost); mobile engineering; Supabase infrastructure (usage-based, low at MVP scale) |
| **Competitive Advantage** | Three-layer moat: (1) Data — card rules DB is expensive to build/maintain. (2) User state — accumulated spending data increases switching cost. (3) Community trust — earned, not bought; first-mover advantage |

### Competitive Positioning

| | Real-time at POS | Personalized | Cap Tracking | SG-specific |
|-|:---:|:---:|:---:|:---:|
| **MaxiMile** | ✅ | ✅ | ✅ | ✅ |
| MileLion / Suitesmile | ❌ | ❌ | ❌ | ✅ |
| SingSaver / MoneySmart | ❌ | ❌ | ❌ | ✅ |
| Seedly | ❌ | Partial | ❌ | ✅ |
| Spreadsheet (DIY) | ❌ | ✅ | Manual | ✅ |

**Market gap**: No product in Singapore currently operates at the intersection of point-of-payment timing + personalized portfolio awareness + real-time cap state. MaxiMile would be the first.

---

## Slide 6 — Feature Prioritization & MVP Scope
**Satisfies**: (c) continued — product design rationale
**Rubric targets**: #3 IS622 concepts (RICE, Kano), #4 Creativity

### RICE Prioritization *(IS622: Feature Scoring Framework)*

*(Reach = users/quarter, out of 5,000 initial; Impact = 1–3; Confidence = %; Effort = engineering weeks)*

| Feature | Reach | Impact | Conf. | Effort | **RICE** | MVP? |
|---------|-------|--------|-------|--------|---------|------|
| F1: Card Portfolio Setup | 5,000 | 3 | 90% | 3 wks | **4,500** | ✅ P0 |
| F2: Category Recommendation Engine | 5,000 | 3 | 90% | 4 wks | **3,375** | ✅ P0 |
| F5: Card Rules Database (Top 20) | 5,000 | 3 | 80% | 6 wks | **2,000** | ✅ P0 |
| F6: Cap Approach Alerts | 3,000 | 2 | 80% | 2 wks | **2,400** | P1 |
| F3: Bonus Cap Tracker | 4,000 | 3 | 80% | 5 wks | **1,920** | ✅ P0 |
| F4: Transaction Logging | 4,000 | 2 | 85% | 3 wks | **2,267** | ✅ P0 |
| F8: Quick-Access Widget | 2,500 | 2 | 70% | 3 wks | **1,167** | P1 |
| F10: Portfolio Optimizer | 1,500 | 2 | 50% | 5 wks | **300** | P2 |

### Kano Classification of MVP Features *(IS622: Kano Model)*

| Feature | Kano Category | Reasoning |
|---------|--------------|-----------|
| F1 Card Setup + F5 Rules DB | **Must-Have** | Without these, product literally does not function |
| F2 Recommendation Engine | **Must-Have** | This IS the product — not a feature, the value proposition |
| F3 Cap Tracker | **Must-Have** | Primary differentiator from static alternatives; absence = parity with a blog |
| F4 Transaction Logging | **Must-Have** | Cap tracker is only accurate if transactions are logged; structural dependency |
| F6 Cap Alerts | **Performance** | More alerting = more satisfaction, linearly correlated; correctly P1 |
| F8 Widget | **Delighter** | Unexpected convenience; not expected at MVP |

### What Was Deliberately Excluded from MVP

| Feature | Why Excluded |
|---------|-------------|
| Bank API / auto-import | SGFinDex not open to fintechs — regulatory constraint; v2 |
| Affiliate card links | Would compromise recommendation neutrality — trust-first strategy |
| Cashback card support | Dilutes miles-only positioning; v2 if market demands |
| Portfolio Optimizer (F10) | Requires 3+ months of individual data — cannot deliver value in Month 1 |

---

## Slide 7 — Prototype: Core 8-Screen Usage Flow
**Satisfies**: (e) Screenshots/video of prototype addressing user pain points
**Rubric targets**: Prototype rubrics #1 Value, #2 Usability, #3 User-friendliness, #4 Desirability

### The 8-Screen MVP Flow *(Built in React Native / Expo)*

```
Screen 1 → Screen 2 → Screen 3 → Screen 4
  Onboard    Add Cards   Dashboard   Recommend

Screen 5 → Screen 6 → Screen 7 → Screen 8
  Result    Quick-Log   Cap Status   Miles Tab
```

**Screen 1 — Onboarding / Sign Up**
- Simple email + password registration (Supabase Auth)
- Value proposition shown before any data entry: "Know exactly which card to tap"
- *Pain addressed*: Reduces friction before asking for commitment
- *Heuristic applied*: Nielsen #6 — Recognition over recall (show value first)

**Screen 2 — Card Portfolio Setup**
- Pre-populated scrollable list of top 20 SG miles cards with bank logos and card images
- Tap to add; earn rates, caps, categories auto-load — no manual entry
- Progress indicator ("3 cards added")
- *Pain addressed*: Removes the #1 barrier to DIY tracking (rule entry takes hours)
- *Heuristic applied*: Nielsen #4 — Consistency and standards (familiar card logos and bank names)

**Screen 3 — Home / Recommend Tab**
- 7-category grid: Dining, Transport, Online, Groceries, Petrol, Travel/Hotels, General
- Large touch targets for checkout speed; category icons are universally recognizable
- "Last used: Dining" shortcut chip at top
- *Pain addressed*: One-tap entry into the core value moment
- *Heuristic applied*: Nielsen #7 — Flexibility and efficiency of use (shortcut for repeat categories)

**Screen 4 — Category Recommendation Result**
- Primary card shown as large glassmorphic card: bank name, card image, "4 mpd", "SGD 350 cap remaining"
- Secondary card shown below: "Alt: Citi PremierMiles — 1.2 mpd (Uncapped)"
- Earn rate reasoning visible: "Dining — OCBC 90°N earns 4 mpd until SGD 1,000 cap. DBS Altitude cap reached."
- "Log this transaction →" CTA button
- *Pain addressed*: Instant, reasoned answer at checkout. Replaces 10–30 sec of mental calculation
- *Heuristic applied*: Nielsen #1 — Visibility of system status (cap remaining always shown); Nielsen #6 — Recognition (card images, not text codes)

**Screen 5 — Quick Transaction Log**
- Pre-filled: category (from recommendation), card used (from recommendation)
- Single required field: amount (numeric keyboard auto-opens)
- Confirm tap: cap tracker updates, miles counter increments
- Target: <10 seconds end-to-end
- *Pain addressed*: Eliminates the burden that makes manual tracking fail ("I'll do it later" = never)
- *Heuristic applied*: Nielsen #8 — Aesthetic and minimalist design (only essential fields shown)

**Screen 6 — Cap Status Dashboard**
- Per-card, per-category progress bars with colour coding: green <60%, amber 60–89%, red 90%+
- "Cap reached" badge when exhausted
- Monthly reset countdown
- *Pain addressed*: Replaces the spreadsheet for cap monitoring; "at-a-glance" instead of calculation
- *Heuristic applied*: Nielsen #1 — Visibility of system status; Nielsen #4 — Consistency (same green/amber/red used throughout)

**Screen 7 — Earning Insights Screen**
- Hero stats: "Miles earned this month: 4,820" + "Miles saved vs SG average (1.4 mpd): +1,240"
- Top earning card chip: "MVP Card: OCBC 90°N — 1,800 miles"
- Category breakdown bars (ranked by miles earned)
- 3-month trend chart
- *Pain addressed*: Makes the product's value tangible and visible; Peter's "show me one number" trigger
- *Heuristic applied*: Nielsen #1 — Visibility of system status; Progressive disclosure (hero → detail)

**Screen 8 — Miles Portfolio Tab (My Miles)**
- Segmented control: "My Miles" (airline programs) | "My Points" (bank points)
- Default: "My Miles" — shows KrisFlyer, Asia Miles balance with "Confirmed + Potential" distinction
- Goal progress bar: "Business Class SQ — 38,000 / 62,500 miles"
- Tap any program → transaction history + transfer options
- *Pain addressed*: Peter's core need — one number that shows where he stands toward a reward
- *Heuristic applied*: Nielsen #2 — Match between system and real world (users think in flight destinations, not bank point codes)

### Cognitive Walkthrough Test *(IS622: Usability Evaluation)*
**Scenario**: Maya is at a restaurant. She wants to know which card to use.
1. Opens app → sees category grid immediately (no loading screen) ✅
2. Taps "Dining" → result in <1 second ✅
3. Reads: "Use OCBC 90°N — 4 mpd, SGD 350 remaining" — decision made ✅
4. Pays, taps "Log this" → pre-filled form, types amount, confirms ✅
5. Sees cap tracker update in real time ✅

**Total time: ~15 seconds. Zero ambiguity at any step.**

---

## Slide 8 — User Feedback & Design Iteration
**Satisfies**: (f) Learnings from interaction with real users and changes made to design
**Rubric targets**: Prototype rubric #5 Iteration in Design, #2 User research

### Research Process: How Feedback Was Collected

| Method | Participants | When |
|--------|-------------|------|
| Customer validation survey (Google Forms) | Distributed to MileLion Telegram, Seedly, HardwareZone, classmate networks | Pre-prototype (problem validation) |
| Prototype walkthrough sessions | 5+ target users from miles community | Post-prototype build |
| Community sentiment analysis (secondary) | HardwareZone, MileLion comment analysis | Ongoing throughout |

---

### Iteration 1: From Pre-Research Concept → Survey-Informed Design

**What we initially assumed**: A dashboard-first design where users navigate to a "recommendation" section
**What research told us**: Users need the recommendation at the point of payment — they won't navigate; they need it in 1 tap from a cold open
**Design change**: Moved category grid to the *primary tab* (home screen). Recommendation is the first thing visible on app open, not buried in a menu.

---

### Iteration 2: Cap Tracking Display Design

**Initial design**: Cap status shown as raw numbers ("SGD 650 / SGD 1,000 used")
**User feedback**: Numbers require mental calculation — "Is that a lot? Should I switch?"
**Design change**: Added colour-coded progress bars (green/amber/red) with explicit "Cap reached" badge. The visual state replaces the cognitive work.

---

### Iteration 3: Recommendation Explanation

**Initial design**: Show recommended card name only ("Use OCBC 90°N")
**User feedback**: "Why? How do I know this is right?" — skepticism of black-box output; erosion of trust
**Design change**: Added earn rate, remaining cap, and brief reasoning under every recommendation ("Dining — 4 mpd, SGD 350 cap remaining. DBS Altitude cap reached.") — consistent with finding from survey that users need to see the logic to trust the output.

---

### Iteration 4: Miles Savings Baseline

**Initial design**: "Miles saved vs your lowest-earn card" — personalized but arbitrary baseline
**User feedback (research signal)**: Users couldn't contextualize the number — "Saved vs what? My worst card isn't a meaningful benchmark."
**Design change**: Fixed baseline to SG industry average (1.4 mpd). Insight now reads: "You earned 1,240 more miles than the average Singapore cardholder." Concrete, relatable, credible.

---

### Before / After Summary

| Element | Before Iteration | After Iteration | Research Signal |
|---------|-----------------|-----------------|-----------------|
| Home screen | Dashboard with navigation to "Recommend" | Category grid IS the home screen | Survey Q14: time tolerance at payment |
| Cap display | Raw SGD numbers | Colour-coded progress bars | Walkthrough: users couldn't gauge status without mental math |
| Recommendation | Card name only | Card + earn rate + cap remaining + fallback | Survey + walkthrough: trust requires visible reasoning |
| Miles Saved metric | vs. user's worst card | vs. 1.4 mpd SG industry average | Walkthrough: arbitrary baseline wasn't relatable |

---

## Slide 9 — Challenges
**Satisfies**: (g) Challenges
**Rubric targets**: #5 Robust Q&A preparation

### Challenge 1: Manual Transaction Logging Fatigue
**The risk**: Cap tracking accuracy depends entirely on users logging every transaction in <10 seconds. If the log rate drops below 70%, recommendations degrade and trust erodes.
**Why it's hard**: Every existing manual tracking tool (spreadsheets, notes apps) has failed for this exact reason. Habit formation at point of payment requires behavioral change.
**How we're addressing it**:
- Frictionless design: pre-filled category and card; only amount required
- Immediate feedback loop: cap tracker visibly updates after each log (reinforcement)
- Future mitigation: SGFinDex bank API integration (v2) would eliminate manual logging entirely

### Challenge 2: Card Rules Database Maintenance
**The risk**: Banks change earn rates, bonus caps, and MCC rules with limited notice. An outdated recommendation is worse than no recommendation — it actively misleads the user.
**Why it's hard**: Singapore has ~9 major banks; 30+ relevant miles cards; rule changes are bank-side and non-standardized.
**How we're addressing it**:
- Dedicated operational process: rules team monitors bank T&Cs and community alerts; 48-hour update SLA
- Community layer: in-app flagging ("This card's rate changed") creates crowdsourced early-warning system
- Rate Change Alerts (F23): admin-triggered notifications alert affected users when their cards' rates change — turns a threat into a trust-building feature

### Challenge 3: Cold Start — Building Trust Before Data Exists
**The risk**: MaxiMile is only as valuable as the user data it accumulates. New users have no transaction history, no cap state, and no insights — the first week is the weakest experience.
**How we're addressing it**:
- Instant value from setup: as soon as 3 cards are added, recommendations are live — no waiting for historical data
- MileLion/Suitesmile launch partnership: community endorsement shortens trust-building from months to days
- Free tier ensures zero risk for the user to try before committing

### Challenge 4: Regulatory Positioning
**The risk**: Recommending financial products in Singapore may require MAS licensing or sandbox participation. Being classified as financial advice changes the entire operating model.
**How we're addressing it**:
- Product is positioned as an informational tool (not financial advice)
- Recommendation logic is transparent — user always sees the reasoning; system does not make decisions on the user's behalf
- Pre-launch: legal review of MAS guidelines required; MAS regulatory sandbox is a contingency path

### Challenge 5: Competitive Response from Banks
**The risk**: DBS, OCBC, or UOB could build a native version of this feature within their banking apps, eliminating the need for a third-party tool.
**Why this is a medium-risk, not a fatal threat**:
- No single bank can recommend competitor cards — their incentive is to push their own products
- MaxiMile's value is cross-bank, cross-portfolio optimization — structurally impossible for any bank to replicate without cannibalizing their own products
- First-mover + community trust is a meaningful head start

---

## Slide 10 — IS622 Concepts Applied
**Satisfies**: (h) Key concepts applied from IS622
**Rubric targets**: #3 Application of IS622 concepts

### Concept Map: IS622 Framework → MaxiMile Decision

| IS622 Concept | Where / How Applied in MaxiMile |
|---------------|--------------------------------|
| **Jobs To Be Done (JTBD)** | Core problem framing: the "job" is not "earn more miles" — it is "never feel uncertain about which card to tap." This distinction shaped the product's primary screen (category grid at checkout, not a portfolio dashboard). |
| **Innovation Sweet Spot (Desirability × Feasibility × Viability)** | Used as the go/no-go gate in Discovery: Desirability 85% (community evidence), Feasibility 75% (public card data, no novel tech), Viability 70% (freemium model, US precedent). All three must be positive for product investment. |
| **5 Whys Root Cause Analysis** | Applied to trace "users lose miles" → "wrong card used" → "can't remember rules" → "rules too complex" → "no real-time optimizer exists." This chain led directly to the product definition. |
| **User Journey Mapping** | Current-state journey documented 6 stages from Awareness → Optimization. Future-state journey designed screen-by-screen to remove friction at each stage. Used to identify the "checkout moment" as the most critical and underserved touchpoint. |
| **Business Model Canvas (BMC)** | Full canvas constructed to stress-test commercial viability: identified that affiliate revenue is a future stream (not MVP) because it would compromise recommendation neutrality — a deliberate trust-first positioning decision. |
| **RICE Prioritization** | Applied to 23 candidate features across PRD. F1–F5 scored highest and form the MVP. F10 (Portfolio Optimizer) scored 300 vs F1's 4,500 — correctly deferred to v2 because it requires 3+ months of data to deliver value. |
| **Kano Model** | Classified all MVP features as Must-Have (F1–F5) and identified Delighters (F8: Widget, F16: Goal Tracker) — ensures product delivers minimum viable satisfaction before pursuing delight. |
| **North Star Metric** | MARU — Monthly Active Recommendations Used. Chosen because it measures the core value moment (user acting on a recommendation at checkout), not vanity metrics like downloads. Target: 10,000 MARU within 6 months. |
| **OKRs** | Three product OKRs defined: (1) Establish MaxiMile as go-to tool (KR: 5,000 MAU, 60% Month-1 retention, NPS 50+). (2) Deliver measurable miles optimization (KR: avg mpd 1.2→2.5+). (3) Build sustainable business (KR: 10% premium conversion, SGD 15K MRR). |
| **Nielsen's Usability Heuristics** | Applied in prototype design: #1 Visibility (cap status always visible), #2 Match to real world (card images not card codes), #6 Recognition over recall (categories as icons), #7 Flexibility (shortcut to last-used category), #8 Minimalist design (log screen: 1 required field only). |
| **Cognitive Walkthrough** | Conducted for primary scenario: "Maya at restaurant, which card?" — end-to-end flow completed in 15 seconds with zero ambiguity. Used to validate checkout-speed UX requirement (<5 seconds to recommendation). |
| **Lean MVP** | MVP scoped to exactly the 5 features required to test the core hypothesis (recommendation at point of payment improves miles earned). Everything else deferred. Sprint plan structured as a 2-week delivery cycle to minimize time-to-feedback. |
| **Value Proposition Canvas** | Customer profile: gains = more miles, less anxiety. Pains = cap breaches, rule complexity, checkout stress. Pain relievers designed one-for-one: cap tracker → cap breach prevention; instant recommendation → checkout anxiety; auto-rules → complexity. |
| **Porter's Five Forces** | Applied to strategic context: Supplier Power (banks) HIGH — must position as complementary, not adversarial. Competitive Rivalry LOW — no direct competitor now; first-mover window is open. Threat of Substitutes MEDIUM — AI assistants could evolve; proactive integration is the hedge. |
| **Build–Measure–Learn Loop** | MVP is designed around measurable hypotheses: log rate 70%+ (measures F4 UX); mpd improvement 20–40% (measures F2 impact); cap breach reduction 80%+ (measures F3 impact). Each metric triggers the next design iteration. |

---

---

## CLOSING SLIDE *(Not counted)*

### Why MaxiMile Wins

1. **The problem is real**: 200K–400K potential users in Singapore losing SGD 200–500/year in miles value. Community evidence is unambiguous.
2. **The timing is right**: Contactless payments are dominant; US market has validated the model; no APAC entrant exists.
3. **The MVP is disciplined**: 5 features. One core flow. One testable hypothesis. No scope creep.
4. **The moat compounds over time**: Every rule change, every devaluation makes the product more valuable — not less.
5. **The business model is honest**: Trust-first. Free tier earns adoption. Premium converts after value is proven. Affiliate revenue waits for credibility.

> *"MaxiMile doesn't ask users to be smarter about miles. It makes the right decision for them — so they don't have to."*

---

**Thank you.**
*Questions welcome from the floor.*

---

---

# Appendix: Presenter Notes & Q&A Preparation

## Anticipated Q&A Topics

**Q: What if banks change their rules without warning?**
A: Our 48-hour update SLA is supported by three layers: (1) internal monitoring team watching bank T&C pages, (2) community-sourced alerts from our user base and Telegram channels, and (3) F23 Rate Change Alerts which notify affected users when their cards' earn rates change — turning a vulnerability into a trust-building feature. We also display "last verified" timestamps on all card rules.

**Q: Why would someone use this instead of just asking ChatGPT?**
A: ChatGPT doesn't know your remaining bonus cap this month. It doesn't know you've spent SGD 780 of your SGD 1,000 dining cap on DBS Altitude. It gives generic advice for the best card, not personalized advice for your specific spending state *right now*. That real-time state-awareness is the product.

**Q: What's the moat? Can't anyone replicate this database?**
A: The database itself can be replicated — it takes 3–6 months and significant ongoing effort, but it's replicable. The moat layers are: (1) the accumulated user spending-state data, which is personal and creates switching cost; (2) community trust, which is earned and not transferable; and (3) the network effect as users correct and validate card rules, improving accuracy over time. No single bank can replicate this because they can't recommend competitor cards.

**Q: How do you handle users who don't log their transactions?**
A: The product degrades gracefully — if a user doesn't log, we fall back to showing the best card by earn rate (without cap state). The recommendation is still useful, just less personalized. We track log rates as a leading indicator and have designed the logging flow to minimize friction. The SGFinDex integration in v2 would eliminate this entirely.

**Q: What is your path to profitability?**
A: Freemium drives adoption. Premium conversion (target 10–15%) at SGD 4.99/month creates SGD 15K MRR at 3,000 premium users. That's achievable from a 50,000-user base at 6% conversion — conservative relative to our 10% target. B2B revenue from aggregated spend analytics is a v2 track that doesn't require any additional user-facing development.

**Q: What IS622 concept do you think was most important for this product?**
A: JTBD. Getting the job definition right changed everything. If we had framed the job as "earn more miles," we would have built a miles calculator. Because we framed it as "never feel uncertain about which card to tap," we built a point-of-payment tool. That framing shift is what separates MaxiMile from every existing solution.

---

## IS622 Concept Cheat Sheet (for Q&A references)

| Concept | Quick Definition | How We Used It |
|---------|-----------------|----------------|
| JTBD | The "job" a customer hires a product to do | Redefined job from "earn miles" to "instant, confident card decision at checkout" |
| Innovation Sweet Spot | Desirability × Feasibility × Viability overlap | Go/no-go gate; all three confirmed at 70–85% confidence |
| 5 Whys | Root cause analysis through iterative questioning | Traced user problem to exact product gap (real-time state-aware layer) |
| RICE | Reach × Impact × Confidence ÷ Effort | Scored 23 features; justified F1–F5 MVP, deferred F10, F12 |
| Kano | Must-have / Performance / Delighter classification | Confirmed F1–F5 are Must-Haves; prototype prioritization grounded |
| BMC | 9-block business model mapping | Justified trust-first affiliate deferral; identified community as primary channel |
| North Star Metric | Single metric that measures core value delivery | MARU: measures recommendations acted on, not downloads |
| Cognitive Walkthrough | Expert UX review of step-by-step task completion | Validated 15-second end-to-end flow from app open to logged transaction |
| Nielsen's Heuristics | 10 usability principles for interface design | Applied to 8-screen prototype; #1, #2, #6, #7, #8 explicitly referenced |
| Build–Measure–Learn | Lean startup loop: minimal build → metric measurement → iterate | MVP = minimum to test 3 core hypotheses; each KPI triggers next sprint |

---

*Document prepared for IS622 Group Project | Submission: 22 Mar 2026 | MaxiMile*
