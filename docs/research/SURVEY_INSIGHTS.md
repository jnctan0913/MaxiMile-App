# CC Reward Survey — Analysis, Insights & Implications

**Version**: 2.0
**Date**: 2026-03-01
**Analyst**: PM Agent
**Source data**: `docs/research/CC Reward Survey 3.csv`
**Survey instrument**: `docs/research/CUSTOMER_SURVEY.md`
**Purpose**: Supplement user research; validate product-market fit assumptions; inform prioritisation and monetisation strategy

---

## 1. Response Overview

| Segment | Count | % of Total |
|---------|-------|------------|
| Total responses received | 50 | 100% |
| Screen-outs (no miles card usage) | 13 | 26.0% |
| **Qualified respondents (miles users)** | **37** | **74.0%** |
| — Active Optimizers | 12 | 32.4% of qualified |
| — Casual Earners | 25 | 67.6% of qualified |

> **Note on sample size**: With n=37, margin of error is ~16% at 95% confidence. All findings are directional and should be triangulated with user research interviews before committing to major pivots. They are sufficient to validate/invalidate order-of-magnitude assumptions.

---

## 2. Demographics (n=37 qualified)

### 2.1 Age Distribution

| Age Range | Count | % |
|-----------|-------|---|
| 21–29 | 13 | 35.1% |
| 30–39 | 16 | 43.2% |
| 40–49 | 8 | 21.6% |
| 50+ | 0 | 0% |

**Insight**: 78.4% of respondents are aged 21–39 — squarely the digital-native working professional segment. The 40–49 bracket has grown to 21.6% (up from 12.5% in v1), broadening the validated persona age range. The 50+ segment remains absent, confirming organic channel skew toward younger professionals.

### 2.2 Card Portfolio Size

| Cards Held | Count | % |
|------------|-------|---|
| 1 card | 7 | 18.9% |
| 2 cards | 12 | 32.4% |
| 3 cards | 8 | 21.6% |
| 4 cards | 3 | 8.1% |
| 5 cards | 6 | 16.2% |
| > 10 cards | 1 | 2.7% |

- **2+ cards**: 30/37 (81.1%)
- **3+ cards**: 18/37 (48.6%)

The 60% threshold for 3+ cards remains a marginal miss, but 81.1% holding 2+ cards confirms multi-card complexity is the norm for this audience.

### 2.3 Most Held Cards (Top 10)

| Card | Holders |
|------|---------|
| Citi Rewards | 11 |
| Citi PremierMiles | 10 |
| HSBC Revolution | 8 |
| DBS Altitude | 8 |
| UOB Preferred Platinum | 7 |
| DBS Woman's World Card | 6 |
| UOB KrisFlyer | 6 |
| Citi Prestige | 5 |
| AMEX KrisFlyer | 5 |
| UOB PRVI Miles | 4 |

**Implication**: Citi Rewards, HSBC Revolution, and UOB Preferred Platinum (all MCC-sensitive 4 mpd category cards) dominate. These cards' value hinges entirely on correct MCC classification. This validates building MCC logic for these cards first in the MVP.

**New entrants observed**: Heymax, Mainly Miles, Seedly, and StanChart Journey card — signals a slightly more diverse card ecosystem than v1. Card rule coverage should account for these.

---

## 3. Current Behaviour (How Users Decide & Track)

### 3.1 Card Selection Method at Point of Purchase

| Method | Count | % |
|--------|-------|---|
| Use one main card for all purchases | 18 | 48.6% |
| Memorise the rules | 10 | 27.0% |
| Refer to a blog or website | 4 | 10.8% |
| Check a spreadsheet | 3 | 8.1% |
| Choose randomly | 2 | 5.4% |

**0 respondents use a dedicated app to decide.** The market remains entirely unserved by a dedicated optimisation tool at the moment of decision. Nearly half default to one card, sacrificing miles for convenience.

### 3.2 Confidence in Optimal Card Usage

- **Mean confidence score: 3.11 / 5** (down from 3.31 in v1 — pain signal strengthened ✅)
- Active Optimizers: mean ~3.7 (engaged but still uncertain)
- Casual Earners: mean ~2.9 (notably low — large optimisation gap)

**Insight**: Confidence has *decreased* with the larger sample. Even active optimizers feel only moderately confident. This strengthens the case for an authoritative, real-time recommendation system.

### 3.3 How Users Stay Updated on Earning Rules

| Source | Count | % |
|--------|-------|---|
| The MileLion | 16 | 43.2% |
| SingSaver | 13 | 35.1% |
| Friends / Word of mouth | 13 | 35.1% |
| MoneySmart | 12 | 32.4% |
| **I do not track** | **10** | **27.0%** |
| Telegram / Online communities | 8 | 21.6% |
| Bank websites / T&Cs | 5 | 13.5% |
| Reddit | 3 | 8.1% |
| Seedly | 3 | 8.1% |
| Suitesmile | 3 | 8.1% |
| Sethisfy | 2 | 5.4% |
| Mainly Miles | 2 | 5.4% |
| Heymax | 1 | 2.7% |

**Insight**: More than a quarter of qualified respondents don't track rule changes at all. Even those who do rely on 4–5 fragmented external sources with no single authoritative tool.

**Go-to-market implication**: The MileLion now overtakes SingSaver as the #1 channel (43.2%). Combined with Telegram (21.6%), this confirms: MileLion + Telegram are the primary organic launch channels. SingSaver and friends/word-of-mouth round out a four-channel reach strategy.

### 3.4 Bonus Cap Tracking Behaviour

| Tracking Method | Count | % |
|-----------------|-------|---|
| Yes — carefully (spreadsheet / app) | 4 | 10.8% |
| Yes — roughly in my head | 8 | 21.6% |
| I try to but often forget or lose track | 3 | 8.1% |
| **No, I don't track** | **19** | **51.4%** |
| Not aware my cards have bonus caps | 3 | 8.1% |

- **Not tracking carefully** (rough + forget + no + unaware): **33/37 = 89.2%** ✅ (threshold was 50%)
- **No tracking at all** (forget + no + unaware): **25/37 = 67.6%**

**Insight**: Even stronger than v1. The real-time spending cap tracker is not replacing an existing habit — it is creating an entirely new one for 89% of users who have no systematic tracking in place.

### 3.5 MCC Uncertainty Frequency

On the question "How often are you unsure how a merchant will be categorised?" (1 = never, 5 = always):

- **Mean: 3.24 / 5** (up from 3.1 in v1 — uncertainty is pervasive)
- High uncertainty (4–5): 16/37 (43.2%)
- Moderate (3): 12/37 (32.4%)
- Low (1–2): 9/37 (24.3%)

**75.7% of users experience moderate to frequent MCC uncertainty.** This is an ambient, recurring friction encountered across every card that uses MCC-based bonus categories.

---

## 4. Pain Points

### 4.1 Cap Breach Frequency (Past 6 Months)

| Experience | Count | % |
|------------|-------|---|
| Yes — multiple times | 6 | 16.2% |
| Once or twice | 9 | 24.3% |
| No | 8 | 21.6% |
| **Not sure** | **14** | **37.8%** |

- **Confirmed breach + unsure**: 29/37 = **78.4%** ✅ (threshold was 40%)
- The 37.8% "not sure" is itself the sharpest pain signal — users don't know if they've been losing miles. That uncertainty is the core anxiety MaxiMile resolves.

### 4.2 Top Pain Point Ranking (Top 3 picks, n=37)

| Pain Point | Count | % of Respondents |
|------------|-------|------------------|
| 🥇 Keeping up with rule changes across multiple cards | 23 | **62.2%** |
| 🥇 Time and effort required to research / maintain strategy | 23 | **62.2%** |
| 🥉 Not knowing which card earns the best rate for a specific merchant | 21 | **56.8%** |
| 4. MCC uncertainty (unsure how merchant categorised) | 15 | 40.5% |
| 5. Feeling like I'm leaving miles on the table | 12 | 32.4% |
| 6. Managing annual fee waivers and card renewals | 11 | 29.7% |
| 7. Accidentally exceeding monthly bonus caps | 6 | 16.2% |

#### Segmented by engagement level:

| Pain Point | Active (n=12) | Casual (n=25) |
|------------|---------------|---------------|
| Keeping up with rule changes | 66.7% | 60.0% |
| Time & effort | 41.7% | 72.0% |
| Not knowing best rate | 50.0% | 60.0% |
| MCC uncertainty | **58.3%** | 32.0% |
| Accidentally exceeding caps | **41.7%** | 4.0% |
| Feeling like leaving miles | 16.7% | 40.0% |
| Managing annual fees | 25.0% | 32.0% |

**Key insight — segmentation divergence (consistent with v1)**:
- Casual earners: most pained by **time/effort** (72%) and **not knowing the right card** — they want a frictionless answer, fast.
- Active optimizers: most pained by **MCC uncertainty** (58%) and **accidentally exceeding caps** (42%) — they invest effort but still fail due to system complexity.
- **Rule changes top both segments** — universal pain at 62–67%, regardless of engagement level.

### 4.3 Self-Assessed Transaction Optimisation Gap

| Estimate | Count | % |
|----------|-------|---|
| < 50% optimal | 15 | 40.5% |
| 50–70% optimal | 15 | 40.5% |
| 70–85% optimal | 6 | 16.2% |
| 85%+ optimal | 1 | 2.7% |

- **97.3% believe < 85% of their transactions are optimally selected.**
- **81.1% believe < 70% are optimal** — users acknowledge they're leaving substantial value on the table every month.

**Implication**: The ROI narrative ("MaxiMile users save average $X/year") is highly credible — users already believe they're losing miles. The product just needs to quantify and close the gap.

---

## 5. Product-Market Fit Signal

### 5.1 Core Feature Appeal Scores

| Feature | Mean Score | n | Threshold | Status |
|---------|------------|---|-----------|--------|
| App recommending best card by MCC | **4.46 / 5** | 37 | ≥ 3.5 | ✅ Strong validation |
| App tracking spending cap per card | **4.43 / 5** | 37 | ≥ 3.5 | ✅ Strong validation |

Both scores remain exceptionally high and near-identical, confirming dual-core product value.

Score distributions:
- MCC Recommendation: 5-stars = 59.5%, 4-stars = 29.7%, 3-stars = 8.1%, 2-stars = 2.7%, 1-star = 0%
- Cap Tracker: 5-stars = 56.8%, 4-stars = 29.7%, 3-stars = 13.5%, 2-stars = 0%, 1-star = 0%

### 5.2 Weekly Feature Usage Intent

| Feature | Would Use Weekly | % |
|---------|-----------------|---|
| 🥇 "Best card" recommendation based on current caps | 33 | **89.2%** |
| 🥈 Real-time spending cap tracker | 27 | **73.0%** |
| 🥉 Transaction history (correct vs incorrect choices) | 20 | **54.1%** |
| 4. Merchant MCC lookup (search before payment) | 19 | **51.4%** |
| 5. Notifications when 80% of cap reached | 16 | 43.2% |
| 6. Community-verified merchant MCC database | 10 | 27.0% |

**Key insight**: "Best card recommendation" remains the near-universal hook at 89.2%. The gap between rank 1 and rank 2 (~16pp) confirms this is the hero feature that justifies the app's existence.

**Notable shift**: Transaction history (54.1%) now *outranks* MCC lookup (51.4%) for weekly usage intent — users want accountability and learning, not just recommendations. This elevates transaction history from a nice-to-have to a near-MVP feature for habit formation and retention.

### 5.3 Time Tolerance at Point of Payment

| Max Time Willing | Count | % |
|-----------------|-------|---|
| Under 5 seconds | 7 | 18.9% |
| 5–10 seconds | 17 | 45.9% |
| 10–20 seconds | 7 | 18.9% |
| 20–30 seconds | 4 | 10.8% |
| Won't use if it takes time | 2 | 5.4% |

- **94.6% are willing to spend some time** checking the app ✅ (threshold: < 40% selecting "won't use")
- **64.9% expect response in ≤ 10 seconds** — the primary UX design target
- Only 5.4% are time-intolerant (well below the 40% red flag threshold)

**Design implication**: The 5–10 second window is the sweet spot for the majority. The existing PRD target of < 2 seconds for the recommendation API response leaves substantial UX rendering margin.

---

## 6. Monetisation Findings

### 6.1 Current Willingness to Pay for Financial Tools

- Currently paying for any tool: **2/37 (5.4%)**
- The space remains essentially unmonetised from users' perspective — a baseline to build from.

### 6.2 Value Drivers for Payment

| Driver | Count | % |
|--------|-------|---|
| Saves me time deciding | 15 | 40.5% |
| **Nothing — wouldn't pay regardless** | **15** | **40.5%** |
| Prevents me from losing miles/rewards | 12 | 32.4% |
| Automatic cap tracking | 12 | 32.4% |
| Proven track record ("saves $X/year") | 10 | 27.0% |
| Verified MCC data I can trust | 6 | 16.2% |
| Other (gamification, smart wallet concept) | 2 | 5.4% |

**Amber flag**: 40.5% express absolute price resistance — a significant minority who will never convert to paid. Still below the 60% red flag threshold; the freemium model must serve these users genuinely via the free tier.

**Positive signal**: The top three value propositions driving WTP (time savings, preventing loss, automatic tracking) are all core MaxiMile features. The messaging is structurally correct — it just needs quantification ("saves 15 mins/month", "prevents losing 2,000+ miles/year on average").

**New signal**: Two "Other" responses surfaced novel WTP framing — "gamification" and "an intermediate wallet that automatically links to the best card." Both indicate appetite for deeper product integration beyond a lookup tool.

### 6.3 Pricing Model Preference

| Model | Count | % |
|-------|-------|---|
| Free with ads | 18 | **48.6%** |
| Freemium (basic free, premium paid) | 13 | **35.1%** |
| One-time purchase | 5 | 13.5% |
| Pay-per-optimization | 1 | 2.7% |
| Monthly subscription | 0 | 0% |

- **Free baseline preference**: Free with ads + Freemium = **83.8%** ✅ (validates freemium model)
- Monthly subscription maintains **zero** support — must be wrapped in freemium structure.
- One-time purchase preference (13.5%) is meaningful — consider a lifetime deal tier for early adopters.

### 6.4 Price Point Sensitivity

| Price Bracket | Count | % | Cumulative willing to pay ≥ |
|---------------|-------|---|---|
| $0 (must be free) | 18 | 48.6% | — |
| $1–3/month | 9 | 24.3% | 51.4% willing to pay $1+ |
| $3–5/month | 5 | 13.5% | 27.0% willing to pay $3+ |
| $5–8/month | 4 | 10.8% | 13.5% willing to pay $5+ |
| $8–12/month | 1 | 2.7% | 2.7% willing to pay $8+ |

**Segmented WTP — Active vs Casual:**

| Segment | WTP $0 | WTP $1+ | WTP $3+ | WTP $5+ |
|---------|--------|---------|---------|---------|
| Active Optimizers (n=12) | 33.3% | **66.7%** | 33.3% | **25.0%** |
| Casual Earners (n=25) | 56.0% | 44.0% | 24.0% | 8.0% |

**Key monetisation insight**: The $1–3/month price point captures the largest incremental paying segment. The $0 cohort has grown slightly vs v1 (48.6% vs 43.8%), and $1+ has softened (51.4% vs 56.3%). The freemium model must deliver genuine free-tier value to convert this growing price-resistant segment over time. The sweet spot for premium pricing remains **SGD 2.99–4.99/month**.

---

## 7. Validated and Invalidated Assumptions

### ✅ Fully Validated

| Assumption | Evidence | Confidence |
|------------|---------|------------|
| Target users rely on manual/informal methods | 100% use memory, single card, blog lookup, or spreadsheet — zero use an app | High |
| Bonus cap tracking is a major pain | 89.2% not tracking carefully; 78.4% unsure or have breached cap | High |
| Feature appeal for both core features is strong | MCC reco 4.46/5; Cap tracker 4.43/5 — both well above 3.5 threshold | High |
| Users willing to check app before payment | 94.6% will tolerate some time; only 5.4% time-intolerant | High |
| Freemium model is appropriate | 83.8% want a free baseline; 0% want subscription-only | High |
| Rule changes are a top friction | #1 pain point at 62.2% — universal across engagement levels | High |
| Optimisation gap is real | 97.3% believe <85% of transactions are optimal | High |
| The MileLion / SingSaver / Telegram are GTM channels | #1, #2, and #5 information sources by count | High |

### ⚠️ Partially Validated (with nuance)

| Assumption | Evidence | Nuance |
|------------|---------|--------|
| 60%+ hold 3+ cards | Only 48.6% hold 3+ cards (below threshold) | 81.1% hold 2+ — multi-card complexity is real at lower card counts than expected |
| MCC uncertainty is top pain | It's 4th (40.5%), not top 3 | Rule changes & time/effort ranked higher; MCC is significant for active optimizers (58%) but not the universal pain |
| Meaningful segment will pay | 51.4% willing to pay $1+ | 40.5% won't pay at all; freemium structure is required; $0 cohort has grown slightly vs v1 |
| Friends/word-of-mouth is secondary channel | 35.1% rely on it — tied #2 with SingSaver | Referral mechanics and shareability should be a Day 1 design consideration |

### ❌ Invalidated / Needs Revision

| Assumption | Expected | Reality | Implication |
|------------|---------|---------|-------------|
| "Accidentally exceeding caps" is a top 3 pain | Expected high frequency | Only 7th at 16.2%; well below rule changes and time/effort | Messaging should lead with rule-change fatigue and time cost, not cap overflow |
| Monthly subscription is a viable model | Some expected support | 0% support for pure subscription (confirmed in both v1 and v3) | Must structure as freemium — non-negotiable |
| Transaction history is a secondary feature | Not in original MVP scope | 54.1% weekly usage intent — outranks MCC lookup | Elevate to near-MVP or Sprint 2; it drives habit formation |
| Annual fee management is niche | Not in MVP feature set | 6th most-cited pain at 29.7%; consistent across both segments | Add to future backlog; potentially a premium feature to revisit post-MVP |
| Confidence level is moderate | Expected ~3.5 | Mean dropped to 3.11 in v3 (was 3.31 in v1) — users are *less* confident with more exposure | Confidence gap is deeper than originally modelled; the emotional payoff of "knowing the right card" is higher than estimated |

---

## 8. Segment Profiles

### Segment A: Active Optimizer (32% of qualified users)
- Age: 21–49, typically 3–10+ cards
- Pain: MCC uncertainty (58%), keeping up with rule changes (67%), accidentally exceeding caps (42%)
- WTP: 67% willing to pay; 25% willing to pay $5+
- Feature demand: MCC lookup, cap tracker, full portfolio coverage — wants precision
- Time tolerance: Moderate (up to 20 seconds); willing to invest time if value is clear
- **Strategic role**: Early adopters, premium converters, community MCC contributors, NPS advocates

### Segment B: Casual Earner (68% of qualified users)
- Age: Predominantly 21–39, 1–3 cards
- Pain: Time/effort (72%), not knowing the right card (60%), rule change overwhelm (60%)
- WTP: 44% willing to pay $1+; price sensitive; 56% want free only
- Feature demand: Best card recommendation overwhelmingly (#1); cap tracker secondary
- Time tolerance: Strongly prefers ≤ 10 seconds; 2 respondents will not use if it takes time
- **Strategic role**: Volume users, free-tier MAU base, MARU drivers, secondary monetisation via ads/affiliate

---

## 9. Key Implications for Product & Strategy

### 9.1 Product Prioritisation

| Implication | Action |
|-------------|--------|
| Best card recommendation is the near-universal hook | Do not ship without this feature; it is the reason users download the app |
| Cap tracker is the #2 most-demanded feature | Must be in MVP; visualising caps delivers the "aha moment" |
| Transaction history (54.1% weekly intent) outranks MCC lookup | Elevate to Sprint 2–3; it drives habit formation and return visits |
| Rule change notifications matter most to both segments | Push notification feature should be elevated in roadmap priority |
| Confidence mean has dropped (3.11) | The emotional payoff of "knowing the right card" is even more valuable than modelled — lean into the confidence/anxiety framing |
| Annual fee management is an unserved pain (29.7%) | Add to future backlog; validate as a premium feature candidate |

### 9.2 Messaging & Positioning

| Insight | Messaging Implication |
|---------|-----------------------|
| Time/effort is #1 pain (tied, 62.2%) | Lead with "Know the right card in seconds" — time savings message is primary |
| Rule changes top both segments (62.2%) | "Always up to date — we track rule changes so you don't have to" |
| Proven track record drives WTP (27%) | Build social proof engine early: "Users earn an avg of X more miles per month" |
| 78.4% unsure/breached caps | Use anxiety-resolution framing: "Stop wondering if you've already missed out" |
| Confidence dropped to 3.11 | Position MaxiMile as the confidence layer — "Finally, be sure you're using the right card" |
| MCC is #4 pain but #1 for active optimizers | Position MCC accuracy as a trust pillar for power users, not the hero message for casual earners |

### 9.3 Monetisation Strategy

| Finding | Recommendation |
|---------|----------------|
| 83.8% want free baseline | Launch with robust free tier — do not paywall best card recommendation |
| 40.5% won't pay regardless | Design free tier to be genuinely useful; convert through demonstrated value over time |
| $1–3 sweet spot for largest paying segment | Set premium price at **SGD 2.99/month** or $29/year |
| Active optimizers are the paying segment | Target premium upsell to users who have added 3+ cards and acted on 5+ recommendations |
| One-time purchase preferred by 13.5% | Offer lifetime deal at ~$29–39 as early adopter option |
| 0% support for pure subscription | Freemium with clear free/paid split is the only viable model |

### 9.4 Go-to-Market

| Channel | Evidence | Action |
|---------|---------|--------|
| The MileLion | #1 source at 43.2%; especially used by active optimizers | Priority partnership / content placement |
| SingSaver | #2 at 35.1% | SEO and content play; consider sponsored review |
| Friends / Word of mouth | #2 (tied) at 35.1% | NPS + referral program from Day 1; design for shareability |
| MoneySmart | 32.4% | Complementary content/SEO channel |
| Telegram communities | 21.6% | Soft launch in targeted groups first; active optimizers cluster here |
| Reddit (r/singaporefi) | 8.1% — small but tech-savvy | Product Hunt-style launch thread |

### 9.5 User Research Follow-Ups

These survey signals require qualitative validation before acting:

1. **Confidence drop (3.11 mean)**: Is declining confidence driven by portfolio complexity growth, rule change frequency, or recall failure at POS? 3–5 interviews needed to identify the primary trigger.
2. **Transaction history demand (54.1%)**: What exactly do users want — hindsight learning, audit trail, or gamification/streaks? 3–5 interviews needed before spec-ing the feature.
3. **40.5% price resistance**: Is this category disbelief ("financial tools should be free"), price anchor, or genuine free-rider preference? 5 interviews to inform premium conversion strategy.
4. **Annual fee management pain (29.7%)**: Is this a product feature request, a reminder app, or a card portfolio advisor? Needs 3 interviews to scope.
5. **Gamification & smart wallet concepts**: Two respondents surfaced these unprompted. Worth a dedicated 2–3 exploratory interviews to understand if this is a fringe view or an underserved opportunity.

---

## 10. Red Flag Assessment

| Red Flag | Threshold | Actual | Status |
|----------|-----------|--------|--------|
| Low feature appeal (<3.0 mean on MCC/Cap features) | < 3.0 | 4.46 / 4.43 | ✅ No red flag |
| Time intolerance (40%+ won't use if takes time) | 40% | 5.4% | ✅ No red flag |
| No WTP (60%+ select "Nothing") | 60% | 40.5% | ✅ Below threshold — but watch |
| Price resistance ($0 only, 50%+) | 50% | 48.6% | ⚠️ Borderline — trending closer to threshold vs v1 |
| Small card portfolios (60%+ with 1–2 cards) | 60% | 51.4% | ✅ No red flag |
| Low cap breach awareness (50%+ unaware) | 50% | 37.8% not sure | ✅ Marginal — latent pain exists |
| Confidence above pain threshold (mean ≥ 3.5) | ≥ 3.5 | 3.11 | ✅ Below 3.5 — pain confirmed, getting stronger |

**Overall assessment**: No hard red flags. One amber (price resistance at 48.6%, trending up). The $0 cohort growth from v1 (43.8%) to v3 (48.6%) warrants monitoring — if this exceeds 50%, the freemium conversion strategy needs to be re-evaluated. Product-market fit signal remains strong across feature appeal, usage intent, and pain validation.

---

## 11. Version Comparison: v1 (n=32) vs v3 (n=37)

| Metric | v1 (n=32) | v3 (n=37) | Change |
|--------|-----------|-----------|--------|
| Total responses | 44 | 50 | +6 |
| Qualified respondents | 32 | 37 | +5 |
| Active Optimizers | 31.3% | 32.4% | ≈ stable |
| Mean confidence score | 3.31 | 3.11 | ↓ Pain deepening |
| Not tracking caps carefully | 87.5% | 89.2% | ↑ Stronger signal |
| Cap breach confirmed+unsure | 78.1% | 78.4% | ≈ stable |
| #1 pain (rule changes) | 65.6% | 62.2% | ↓ Slight drop |
| #2 pain (time & effort) | 59.4% | 62.2% | ↑ Now tied #1 |
| <85% optimal | 96.9% | 97.3% | ≈ stable |
| MCC feature mean | 4.50 | 4.46 | ≈ stable |
| Cap tracker feature mean | 4.40 | 4.43 | ≈ stable |
| Best card reco weekly intent | 90.6% | 89.2% | ≈ stable |
| ≤10 second tolerance | 62.5% | 64.9% | ↑ Slightly more patient |
| $0 must-be-free | 43.8% | 48.6% | ↑ Watch closely |
| $1+ willing to pay | 56.3% | 51.4% | ↓ Slight softening |
| Free baseline (ads+freemium) | 81.3% | 83.8% | ↑ Freemium model confirmed |

---

## 12. Methodology Notes

- **Sampling bias**: Survey distributed through digital channels (Telegram, Reddit, online communities) and classmate networks. Likely overrepresents tech-savvy, digitally-active miles chasers. 40–49 age bracket has grown to 21.6%, reducing this bias slightly.
- **Response size**: n=37 qualified respondents is below the 200–300 target for statistical representativeness. Findings are directional, not definitive.
- **Social desirability**: Feature interest ratings (MCC/Cap questions) may be inflated — stated intent ≠ actual use. Behavioural validation post-launch is essential.
- **Top 3 pain point question**: Respondents may have been anchored by option order. Absolute ranking is valid directionally; relative differences between adjacent items may not be significant.

---

## Document History

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-02-28 | Initial analysis from CC Reward Survey.csv (n=32 qualified) |
| 2.0 | 2026-03-01 | Updated from CC Reward Survey 3.csv (n=37 qualified); added version comparison, new card/channel data, updated all metrics |
