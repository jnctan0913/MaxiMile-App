# Market Research: MaxiMile Business Model & Revenue Strategy

**Version**: 1.0
**Date**: 2026-03-08
**Author**: Market Researcher Agent
**Scope**: Business model design, revenue model analysis, competitive benchmarking
**Primary Reference**: HeyMax (Singapore), with global comparables (CardPointers, MaxRewards, Kudos, CRED)

---

## Executive Summary

MaxiMile currently has **no defined revenue model**. The PRD explicitly states: "Will NOT be a card comparison/application site (no affiliate revenue from card signups in v1)." This leaves a critical gap as the product matures.

After analyzing HeyMax (the closest SG competitor), global rewards optimizer apps, and Singapore fintech monetization patterns, we recommend a **hybrid model**: (1) **Freemium subscription** for power users, and (2) **Partnership/affiliate revenue** from merchants, card issuers, and travel platforms. This mirrors the proven playbook across the competitive landscape while respecting MaxiMile's positioning as a miles-first utility, not a card comparison site.

**Key finding**: HeyMax — the most relevant competitor — gives away its Card Maximiser (recommendation + cap tracking) for free because it monetizes via merchant commissions on shopping. MaxiMile lacks a shopping layer, which means it **cannot copy HeyMax's model directly** and must find alternative revenue paths.

---

## 1. Competitive Business Model Analysis

### 1.1 HeyMax (Singapore) — Primary Reference

| Dimension | Detail |
|-----------|--------|
| **Founded** | 2023 (by ex-Meta engineers) |
| **Funding** | US$13.6M total (US$2.6M seed Jul 2024 + US$11M Series A Jan 2026) |
| **Investors** | Peak XV Partners (lead), Betatron Venture Group, January Capital, Tenity |
| **Revenue** | US$6M annualized (May 2025), 5x YoY growth |
| **Users** | Target 1M users by end 2026 |
| **GMV** | US$200M+ total transaction volume processed |
| **Geography** | Singapore, Hong Kong; expanding to Japan, Taiwan, Australia by 2026 |

**Revenue Model**:
HeyMax operates as an **affiliate/commission marketplace** [1][2]:
1. **Merchant commissions (primary)**: When users shop via "Shop with Max" at 800+ partner brands (Amazon.sg, Shopee, Trip.com, Starbucks, Nike, Lululemon), the merchant pays HeyMax a commission (typically 3-8% of transaction value). HeyMax converts most of this into Max Miles for the user and keeps a margin.
2. **Travel bookings**: Revenue from hotel/flight bookings and travel insurance through the platform.
3. **Visa partnership**: Co-branded Card Maximiser feature backed by Visa data partnership — Visa shares transaction data for linked cards, enabling automatic cap tracking.

**What HeyMax gives away for FREE** (critical for MaxiMile):
- Card Maximiser: auto-tracking of spending, bonus caps, and "which card to use" recommendations — **exactly what MaxiMile charges nothing for AND has no alternative revenue from**.
- Max Miles earning on linked card spending
- 1:1 transfer to 28+ airline/hotel loyalty programs

**Why HeyMax can afford this**: The free Card Maximiser drives user engagement and card linking, which feeds the shopping commission flywheel. Users who track their cards on HeyMax are more likely to shop through HeyMax's merchant links.

**Source**: [HeyMax Blog — Revenue Growth](https://blog.heymax.ai/blog/heymax-reports-5x-y-o-y-revenue-growth-annualized-revenue-reaches-us-6m-with-apac-expansion-ahead) [1], [DollarsAndSense Guide](https://dollarsandsense.sg/guide-using-heymax-app-hopes-give-free-vacation-every-year/) [2], [MileLion — Card Maximiser Review](https://milelion.com/2025/09/18/heymax-card-maximiser-auto-tracking-of-credit-card-points-and-bonus-caps/) [3]

---

### 1.2 CardPointers (US) — Premium Subscription Model

| Dimension | Detail |
|-----------|--------|
| **Model** | Freemium subscription |
| **Free tier** | Add cards, see basic recommendations |
| **Premium (CardPointers+)** | US$72/year (or US$40/year Pro tier) |
| **Lifetime** | US$240 (often discounted to US$168) |
| **Premium features** | Location-based reminders, auto-Amex/Chase/Citi offer activation, browser extension, automated online card recommendations |
| **Revenue approach** | Subscription-first (uses Stripe to avoid Apple's 30% cut via Small Business program) |
| **Claim** | "Most members save over $750/year" (18x ROI on subscription) |

**Key insight**: CardPointers proves that card reward optimization can sustain a **subscription-only business** without affiliate revenue — but it operates in the US where the TAM is 50-100x larger than Singapore.

**Source**: [CardPointers Pro](https://cardpointers.com/pro/) [4], [CardPointers Help Center — Pricing](https://help.cardpointers.com/article/43-how-much-does-cardpointers-cost) [5], [RevenueCat Case Study](https://www.revenuecat.com/customers/cardpointers/) [6]

---

### 1.3 MaxRewards (US) — Premium Subscription Model

| Dimension | Detail |
|-----------|--------|
| **Model** | Freemium subscription |
| **Free tier** | Core card management and basic recommendations |
| **Premium (MaxRewards Gold)** | US$108/year (US$9/month billed annually) |
| **Premium features** | Auto-activation of Amex/Chase/Citi/BofA offers, Card Value tracker (ROI on annual fees), AI-powered merchant-specific recommendations |
| **Users** | 800,000+ members |
| **Data policy** | "We do not sell user data" — revenue from Gold subscriptions only |

**Key insight**: MaxRewards demonstrates that **even without selling data**, a large enough premium subscriber base can sustain the business. At 5% conversion of 800K users = 40K Gold subscribers = ~US$4.3M ARR.

**Source**: [MaxRewards Help Center — Pricing](https://help.maxrewards.com/en/articles/12747576-what-are-the-maxrewards-subscription-tiers) [7], [MaxRewards — How We Make Money](https://help.maxrewards.com/en/articles/3705925-is-maxrewards-free-how-do-you-make-money) [8]

---

### 1.4 Kudos (US) — Affiliate-Only (Free App)

| Dimension | Detail |
|-----------|--------|
| **Model** | Completely free app; affiliate revenue |
| **Funding** | US$10M (2024) |
| **Revenue streams** | (1) Affiliate commissions from 15,000+ merchant partners (5-7% of transaction value via browser extension checkout), (2) Credit card application referrals (hundreds to thousands of dollars per approved application) |
| **Key feature** | AI smart wallet — automatically picks best card at online checkout |

**Key insight**: Kudos proves a **free app can be viable** with affiliate revenue alone, but requires massive merchant partner network and browser extension adoption. Credit card application referrals are the highest-value revenue stream (US$50-300+ per approval).

**Source**: [TechCrunch — Kudos $10M](https://techcrunch.com/2024/05/17/kudos-ai-smart-wallet-10m-credit-card/) [9], [Kudos vs CardPointers](https://www.joinkudos.com/blog/kudos-vs-cardpointers-which-app-maximizes-your-rewards-better-2025) [10]

---

### 1.5 CRED (India) — Premium User Data Monetization

| Dimension | Detail |
|-----------|--------|
| **Model** | Credit card bill payments + lending + brand advertising |
| **Revenue** | INR 1,484 crore (~US$178M) in FY23 |
| **Users** | 13M MAU; requires 750+ credit score for entry |
| **Revenue streams** | (1) Banks pay CRED to promote cards and drive usage, (2) Referral fees from lending partners, (3) Premium brand advertising to curated high-income audience, (4) Fintech services (CRED Cash, insurance) |

**Key insight**: CRED demonstrates that a **curated high-income user base is itself a monetizable asset**. Banks and luxury brands pay premium rates to reach verified high-credit-score consumers. MaxiMile's target audience (3-7 card miles optimizers in Singapore) is similarly high-value.

**Source**: [CRED Business Model — GrowthX](https://growthx.club/blog/cred-business-model) [11], [StartupTalky — CRED Revenue](https://startuptalky.com/cred-business-model/) [12]

---

### 1.6 SingSaver / MoneySmart (Singapore) — Affiliate Comparison

| Dimension | Detail |
|-----------|--------|
| **Model** | Financial product comparison + affiliate commissions |
| **Parent** | MoneyHero Group (publicly listed) |
| **Revenue** | 37% growth H1 2023; SingSaver estimated ~SGD 25M revenue |
| **Revenue streams** | Credit card application referrals, insurance/loan lead generation |
| **Reach** | 9.8M consumers/month across MoneyHero Group |

**Key insight**: SingSaver's revenue is dominated by **credit card application referrals** — the highest-margin activity in SG fintech. This is the revenue stream MaxiMile's PRD explicitly excludes ("no affiliate revenue from card signups in v1"). Reconsidering this decision could unlock significant revenue.

**Source**: [SingSaver About](https://www.singsaver.com.sg/page/singsaver-about-us) [13], [CB Insights — SingSaver](https://www.cbinsights.com/company/singsaver) [14]

---

## 2. Competitive Positioning Map

```
                    HIGH VALUE TO USER
                         |
    MaxiMile (proposed)  |   HeyMax
    CardPointers         |   (Free + merchant commissions)
    MaxRewards           |
    (Subscription)       |
                         |
  ───────────────────────+──────────────────────
                         |
    MileLion/Suitesmile  |   SingSaver / MoneySmart
    (Content/Affiliate)  |   (Comparison / Affiliate)
                         |
                    LOW VALUE TO USER
    FREE TO USER ──────────────────── PAID BY USER
```

**MaxiMile's dilemma**: It sits in the top-left quadrant (high value, paid by user) — a viable but smaller market. Moving toward the top-right (high value, free to user, paid by partners) would maximize adoption but requires partnership infrastructure.

---

## 3. Recommended Business Model for MaxiMile

### 3.1 Revenue Architecture: Hybrid Model

We recommend a **three-layer revenue model**, phased over 12-18 months:

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 3: DATA & INSIGHTS (Future — Year 2+)            │
│  Anonymized spending insights for banks/brands           │
│  Est. revenue: SGD 50-100K/year                          │
├─────────────────────────────────────────────────────────┤
│  LAYER 2: PARTNERSHIPS & AFFILIATE (Launch + 6 months)  │
│  Card application referrals, merchant deals, travel      │
│  Est. revenue: SGD 100-300K/year                         │
├─────────────────────────────────────────────────────────┤
│  LAYER 1: FREEMIUM SUBSCRIPTION (Launch)                │
│  Free core + Premium features                            │
│  Est. revenue: SGD 50-150K/year                          │
└─────────────────────────────────────────────────────────┘
```

---

### 3.2 Layer 1: Freemium Subscription

#### Free Tier (Core — drives adoption)
| Feature | Rationale |
|---------|-----------|
| Card recommendations (category-based) | Core value prop — must be free to drive adoption |
| Basic cap tracking (view-only) | Enough to demonstrate value |
| Transaction logging (manual) | Required for cap tracking accuracy |
| Up to 5 cards in portfolio | Generous enough for casual users |
| Miles portfolio (view balances) | Engagement driver |

#### Premium Tier: "MaxiMile Pro" — SGD 5.99/month or SGD 49.99/year (~US$37)
| Feature | Rationale | Comparable |
|---------|-----------|------------|
| **Unlimited cards** in portfolio | Power users hold 5-10 cards | CardPointers+ |
| **Smart notifications**: Cap approach alerts (80%, 95%), rate change push alerts | Proactive value — users pay to never miss a cap breach | MaxRewards Gold |
| **Advanced insights**: Monthly earning performance, miles saved vs industry avg, top earning card, category breakdown | Gamification + proof of value | MaxRewards Gold |
| **Auto-capture priority**: Faster processing, richer transaction detail | Reward engaged users | — |
| **Goal projections**: "At this rate, you'll reach Tokyo in 3 months" | Emotional hook — connects daily spending to dream trips | — |
| **Export & reports**: Monthly CSV export of transactions and miles earned | Utility for expense-conscious users | CardPointers+ |
| **Priority rate change alerts**: Get notified of rate changes before free users (e.g., 24-hour early access) | Exclusivity driver | — |

#### Pricing Rationale
- CardPointers charges US$72/year in the US market. Singapore's TAM is ~50x smaller but users are wealthier.
- SGD 49.99/year (~SGD 4.17/month) is well below the value of miles saved. If MaxiMile saves even 2,000 extra miles/year = SGD 80-100 in flight value = **2x ROI** on subscription.
- At 200K SAM, even 2% conversion = 4,000 subscribers = **SGD 200K ARR**.
- Conservative target: 1,000-2,000 Pro subscribers in Year 1 = SGD 50-100K ARR.

---

### 3.3 Layer 2: Partnerships & Affiliate Revenue

This is where the real money is. Three sub-streams:

#### A. Credit Card Application Referrals (Highest Value)
**Revisit the v1 "no affiliate" decision.** The PRD says "no affiliate revenue from card signups in v1" — we recommend adding this in v1.1.

| Mechanism | Detail |
|-----------|--------|
| **How it works** | When MaxiMile recommends a card the user doesn't own (e.g., "You'd earn 4 mpd on dining with HSBC Revolution — you don't have this card yet"), include an "Apply Now" link to SingSaver/bank |
| **Revenue per lead** | SGD 50-200 per approved credit card application (SingSaver/MoneySmart pay this to affiliates) |
| **User value** | Genuinely helpful — if the algorithm identifies a card that would improve their portfolio, suggesting it is a service, not an ad |
| **Volume estimate** | 500-2,000 applications/year at SGD 100 avg = **SGD 50-200K/year** |
| **Key partner** | SingSaver (owned by MoneyHero Group, publicly listed, established affiliate program) |
| **Integration** | Non-intrusive: only surface in "Portfolio Optimizer" feature or when recommendation identifies a gap |

**Why this works for MaxiMile specifically**: Unlike SingSaver (which compares all cards generically), MaxiMile can make **personalized, data-driven card recommendations** based on the user's actual spending patterns. "Based on your spending, adding HSBC Revolution would earn you 3,200 more miles/year on dining" is far more compelling than a generic comparison table. This is a **higher-conversion referral** than SingSaver's organic traffic.

#### B. Merchant & Travel Partner Deals (HeyMax Model Lite)
| Mechanism | Detail |
|-----------|--------|
| **How it works** | Partner with travel-adjacent brands (airlines, hotels, travel insurance, airport lounges) to offer exclusive deals to MaxiMile users |
| **Revenue** | Commission on bookings/purchases (5-15% of transaction value) |
| **User value** | Miles-focused users are frequent travelers — travel deals are highly relevant |
| **Initial partners** | Trip.com, Klook, travel insurance (FWD, MSIG), airport lounge programs |
| **Integration** | "Miles Marketplace" section in Miles tab — curated deals that earn extra miles |
| **Volume estimate** | SGD 500K GMV/year at 8% take rate = **SGD 40K/year** (grows with user base) |

#### C. Bank Partnerships (CRED Model)
| Mechanism | Detail |
|-----------|--------|
| **How it works** | Banks pay MaxiMile for access to its engaged, high-value user base for card promotions, usage incentives, and spending insights |
| **Revenue** | Sponsored card promotions, featured placement in recommendations, co-branded campaigns |
| **User value** | Exclusive promotions and bonus miles from bank partners |
| **Why banks would pay** | MaxiMile users are exactly who banks want to reach — active multi-card holders who optimize spending. Banks pay CRED for similar access in India. |
| **Volume estimate** | 2-4 bank partnerships at SGD 20-50K/year = **SGD 40-200K/year** |
| **Integrity safeguard** | Sponsored cards labeled "Sponsored" but never override the honest recommendation algorithm. Trust is MaxiMile's moat — compromising it for short-term revenue destroys the product. |

---

### 3.4 Layer 3: Anonymized Data & Insights (Future)

| Mechanism | Detail |
|-----------|--------|
| **How it works** | Aggregate, anonymized spending pattern data sold to banks, market researchers, and brands |
| **Examples** | "Miles optimizers in SG spend 35% of dining budget at Japanese restaurants" or "HSBC Revolution users breach dining caps by Day 18 on average" |
| **Revenue** | SGD 50-100K/year from 3-5 data clients |
| **Privacy** | Strictly anonymized, aggregated, with explicit user consent. Never sell individual data. |
| **Timing** | Requires 10K+ active users with 6+ months of data — Year 2 earliest |

---

## 4. Revenue Projection Summary

### Year 1 (Launch + 12 months)

| Revenue Stream | Conservative | Moderate | Optimistic |
|----------------|-------------|----------|------------|
| **Premium subscriptions** (2-5% of 10K users) | SGD 50K | SGD 100K | SGD 150K |
| **Card application referrals** | SGD 30K | SGD 100K | SGD 200K |
| **Merchant/travel deals** | SGD 10K | SGD 30K | SGD 50K |
| **Bank partnerships** | SGD 0 | SGD 40K | SGD 100K |
| **Data insights** | SGD 0 | SGD 0 | SGD 0 |
| **Total Year 1** | **SGD 90K** | **SGD 270K** | **SGD 500K** |

### Year 2 (Established)

| Revenue Stream | Conservative | Moderate | Optimistic |
|----------------|-------------|----------|------------|
| **Premium subscriptions** (3-7% of 30K users) | SGD 150K | SGD 350K | SGD 500K |
| **Card application referrals** | SGD 100K | SGD 250K | SGD 400K |
| **Merchant/travel deals** | SGD 40K | SGD 100K | SGD 200K |
| **Bank partnerships** | SGD 50K | SGD 150K | SGD 300K |
| **Data insights** | SGD 30K | SGD 70K | SGD 100K |
| **Total Year 2** | **SGD 370K** | **SGD 920K** | **SGD 1.5M** |

---

## 5. Competitive Threat Assessment: HeyMax

HeyMax is MaxiMile's **most direct and dangerous competitor** in Singapore. Critical analysis:

### Where HeyMax Wins
| Dimension | HeyMax | MaxiMile |
|-----------|--------|----------|
| **Automatic transaction tracking** | Yes — Visa data partnership, real-time | Manual logging (or Apple Pay shortcut) |
| **Revenue model** | Proven — US$6M ARR, 5x growth | None yet |
| **Funding** | US$13.6M raised | Bootstrapped |
| **Card coverage** | Almost every Visa card (auto-tracked) | 29 miles cards (manual rules DB) |
| **Merchant ecosystem** | 800+ brands for earning Max Miles | None |
| **Transfer partners** | 28+ airline/hotel programs at 1:1 | View-only miles tracking |

### Where MaxiMile Wins (Defensible Advantages)
| Dimension | MaxiMile | HeyMax |
|-----------|----------|--------|
| **Recommendation depth** | Full category-aware algorithm with cap deductions, min spend enforcement, condition transparency | Basic "best card for MCC" suggestion |
| **All card networks** | Visa + Mastercard + Amex | **Visa only** (major gap — excludes Amex KrisFlyer Ascend, OCBC 90N Mastercard, etc.) |
| **Miles-specific focus** | Purpose-built for miles optimization | Generic rewards platform (shopping + miles) |
| **Cap tracking granularity** | Per-category progress bars, alerts at 80%/95%, alternative card suggestions | Basic cap tracking |
| **Community-sourced accuracy** | Rate change submissions, AI detection pipeline | Relies on Visa data only |
| **Offline utility** | Works at physical POS (recommendation before payment) | Primarily online shopping focus |

### Strategic Implications
1. **HeyMax's Visa-only limitation is MaxiMile's biggest opening**. Many top SG miles cards are Mastercard (OCBC 90N, HSBC Premier MC, Maybank World MC) or Amex (KrisFlyer Ascend, KrisFlyer CC). HeyMax cannot track these.
2. **HeyMax's Card Maximiser is free**. MaxiMile cannot charge for basic recommendations + cap tracking if HeyMax gives it away. The free tier must match HeyMax's free offering.
3. **MaxiMile's premium must offer things HeyMax doesn't**: advanced insights, proactive alerts, goal projections, portfolio optimization recommendations — these justify a subscription on top of the free base.

---

## 6. Strategic Recommendations

| # | Recommendation | Rationale | Priority | Confidence |
|---|---------------|-----------|----------|------------|
| 1 | **Launch with generous free tier** matching HeyMax's Card Maximiser capabilities | HeyMax gives recommendations + cap tracking for free. Charging for these would kill adoption. | Must-act | High |
| 2 | **Add Premium tier at SGD 49.99/year** with alerts, insights, unlimited cards, goal projections | Proven model (CardPointers, MaxRewards). Even 2% conversion = viable revenue. | Must-act | High |
| 3 | **Add credit card application referrals in v1.1** via SingSaver partnership | Highest-value revenue stream in SG fintech. MaxiMile's personalized recommendations = higher conversion than generic comparison sites. Revisit the "no affiliate in v1" PRD decision. | Must-act | High |
| 4 | **Build "Miles Marketplace"** with travel partner deals (Klook, Trip.com, travel insurance) | Natural extension for miles-focused users. HeyMax model proves merchant commission works in SG. Start small with 5-10 travel partners. | Should-act | Medium |
| 5 | **Pitch bank partnerships** after reaching 10K users | Banks want access to verified multi-card optimizers. CRED proves banks pay for curated audiences. Need user base first. | Should-act | Medium |
| 6 | **Differentiate on all-network support** (Visa + MC + Amex) as key marketing message vs HeyMax | HeyMax's Visa-only limitation is a real user pain point. "Works with ALL your cards" is a compelling differentiator. | Must-act | High |
| 7 | **Do NOT sell individual user data** — ever | Trust is the moat. Miles community is tight-knit and vocal. One data scandal = permanent brand death. Anonymized, aggregated insights only, with consent. | Must-act | High |

---

## 7. Recommended Premium Feature Gating

### What stays FREE (acquisition drivers)
- Category-based card recommendations
- Basic cap tracking (progress bars)
- Manual transaction logging
- Up to 5 cards in portfolio
- Miles balance viewing
- Rate change notifications (in-app, basic)

### What goes PREMIUM (conversion drivers)
- Unlimited cards in portfolio (power users need 5-10)
- Push notification alerts (cap 80%/95%, rate changes)
- Monthly earning insights & miles saved report
- Goal projections ("Tokyo by July at this rate")
- Portfolio optimizer ("Add HSBC Revolution to earn 3,200 more miles/year")
- Transaction export (CSV)
- Priority rate change alerts (24-hour early access)
- Ad-free experience (if ads are added to free tier later)

---

## 8. Data Gaps & Next Steps

| Gap | Impact | Recommended Action |
|-----|--------|-------------------|
| User willingness to pay for premium in SG | High — determines subscription pricing | Survey existing beta users: "Would you pay SGD 4.99/month for [premium features]?" |
| SingSaver affiliate commission rates for in-app referrals | Medium — affects revenue projections | Contact SingSaver partnership team for affiliate rate card |
| Bank partnership pricing in SG market | Medium — affects Layer 2 revenue estimates | Research CRED's bank partnership pricing; approach DBS/UOB business development |
| HeyMax's roadmap for non-Visa card support | High — could erode MaxiMile's key differentiator | Monitor HeyMax blog and MileLion coverage for Mastercard/Amex announcements |

---

## References

[1] HeyMax Blog. "HeyMax Reports 5x Y-o-Y Revenue Growth." May 2025. https://blog.heymax.ai/blog/heymax-reports-5x-y-o-y-revenue-growth-annualized-revenue-reaches-us-6m-with-apac-expansion-ahead

[2] DollarsAndSense. "Guide To Using heymax." 2025. https://dollarsandsense.sg/guide-using-heymax-app-hopes-give-free-vacation-every-year/

[3] The MileLion. "HeyMax Card Maximiser: Auto-tracking of credit card points and bonus caps." Sep 2025. https://milelion.com/2025/09/18/heymax-card-maximiser-auto-tracking-of-credit-card-points-and-bonus-caps/

[4] CardPointers. "CardPointers+ Features." 2026. https://cardpointers.com/pro/

[5] CardPointers Help Center. "How much does CardPointers cost?" https://help.cardpointers.com/article/43-how-much-does-cardpointers-cost

[6] RevenueCat. "CardPointers Case Study." https://www.revenuecat.com/customers/cardpointers/

[7] MaxRewards Help Center. "What Are the MaxRewards Subscription Tiers?" https://help.maxrewards.com/en/articles/12747576-what-are-the-maxrewards-subscription-tiers

[8] MaxRewards Help Center. "Is MaxRewards free? How do you make money?" https://help.maxrewards.com/en/articles/3705925-is-maxrewards-free-how-do-you-make-money

[9] TechCrunch. "Kudos lands $10M for an AI smart wallet." May 2024. https://techcrunch.com/2024/05/17/kudos-ai-smart-wallet-10m-credit-card/

[10] Kudos. "CardPointers vs Kudos comparison." 2025. https://www.joinkudos.com/blog/kudos-vs-cardpointers-which-app-maximizes-your-rewards-better-2025

[11] GrowthX. "CRED Business Model Deep Dive." https://growthx.club/blog/cred-business-model

[12] StartupTalky. "CRED Business Model | How CRED Makes Money." https://startuptalky.com/cred-business-model/

[13] SingSaver. "About Us." https://www.singsaver.com.sg/page/singsaver-about-us

[14] CB Insights. "SingSaver Financial Data." https://www.cbinsights.com/company/singsaver

[15] TNGlobal. "Singapore's HeyMax secures $11M Series A." Jan 2026. https://technode.global/2026/01/28/singapores-heymax-secures-11m-series-a-led-by-peak-xv-partners/

[16] HeyMax Blog. "HeyMax Series A." Jan 2026. https://blog.heymax.ai/blog/heymax-series-a-11-million-funding

[17] The MileLion. "HeyMax Card Maximiser now tracks minimum spend." Dec 2025. https://milelion.com/2025/12/17/heymax-card-maximiser-now-tracks-minimum-spend/

[18] The Peak Magazine. "heymax partners with Visa to launch Card Maximiser." https://www.thepeakmagazine.com.sg/people/heymax-card-maximiser
