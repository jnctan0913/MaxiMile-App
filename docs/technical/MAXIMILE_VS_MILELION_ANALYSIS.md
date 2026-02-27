# MaxiMile vs MileLion: Recommendation Strategy & Category Comparison

**Document Purpose:** Comparative analysis of MaxiMile's recommendation engine against MileLion's credit card guide to identify gaps, risks, and improvement priorities.
**Last Updated:** 2026-02-27 (Card Expansion — 29 cards across 7 banks)
**Reference:** [MileLion Credit Card Guide](https://milelion.com/credit-cards/guide/)

### Changelog

| Date | Sprint | Changes |
|---|---|---|
| 2026-02-26 | Sprint 22 | **F31 Min Spend Condition Enforcement**: `recommend()` RPC now checks `min_spend_monthly` from `conditions` JSONB and falls back to `base_rate_mpd` when threshold not met. New `user_settings` table stores estimated monthly spend. UI shows amber nudge/green checkmark for min spend status. 3 new return columns: `min_spend_threshold`, `min_spend_met`, `total_monthly_spend`. 6 new tests. P1 gap #1 status updated to COMPLETED. **Contactless Badge**: New `requires_contactless` BOOLEAN column added to `recommend()` RPC, extracted from `earn_rules.conditions->>'contactless'`. Blue info badge shown on recommendation cards for KrisFlyer UOB dining/transport. Gap #2 marked COMPLETED. 2 new tests. |
| 2026-02-26 | Sprint 21 | HSBC Revolution MCC 5814 exclusion added to `exclusions` table. `conditions_note` now returned by `recommend()` RPC and surfaced on recommendation cards (top card + alternatives). Insurance warning banner added to Bills recommendation screen. Petrol/bills conflict resolved -- both categories exist with earn rules for all 29 cards. Priority action statuses updated throughout. |
| 2026-02-26 | -- | Initial document created. |

---

## 1. Executive Summary

MaxiMile's 8-category taxonomy is a reasonable simplification of MileLion's 12+ categories. The core `score = earn_rate × cap_ratio` algorithm is sound — and MaxiMile's real-time cap tracking is genuinely better than MileLion's manual editorial approach. **Card count expanded to 29** (from 20) with the addition of 9 new cards including Maybank World Mastercard (#1 petrol card), UOB Visa Signature (strong contactless card), DBS Vantage, OCBC Voyage, SC Journey, SC Beyond, HSBC Premier MC, Maybank XL Rewards, and UOB Lady's Solitaire.

The main gaps are **not** about missing categories or wrong algorithms. They are about:
1. ~~**Conditions (min spend, contactless) not being enforced** in scoring — leading to wrong recommendations for ~8 of 29 cards~~ **RESOLVED in Sprint 22** — min spend conditions now enforced in `recommend()` RPC; cards downranked to base rate when threshold not met. Contactless now surfaced via dedicated blue badge ("Requires contactless payment") extracted from `conditions` JSONB.
2. ~~**Conditions not being surfaced** in the UI — users don't see fine print like "SIA bookings only" or "requires contactless"~~ **RESOLVED in Sprint 21** — `conditions_note` is now returned by the `recommend()` RPC and displayed on recommendation cards
3. ~~**The petrol/bills data conflict** — 140 earn rules sitting unused~~ **RESOLVED in Sprint 21** — both `petrol` and `bills` categories exist with earn rules for all 29 cards

**Approach decision:** We are going "just enough" (accurate recommendations for a working app), NOT "holy bible" (comprehensive consumer education guide like MileLion). This means we focus on data accuracy and condition enforcement, not on adding categories, card stacking strategies, or FCY support.

---

## 2. Recommendation Logic Comparison

### 2.1 What's Similar (We're Already Doing Right)

| Factor | MaxiMile | MileLion | Assessment |
|---|---|---|---|
| **Primary metric: MPD** | `score = earn_rate × cap_ratio` | Effective MPD per category | Same core approach |
| **Cap tracking** | Real-time remaining cap ratio (0.0–1.0) via SQL | Manual tracking, discussed qualitatively | **MaxiMile is better** — dynamic cap awareness is our core value prop |
| **Cap exhaustion fallback** | Falls back to ranking by `earn_rate_mpd` | "Switch to next card" | Same intent |
| **Category-based recommendations** | 8 categories with MCC mappings | 12+ categories | Same fundamental structure |
| **Exclusion tracking** | Stored in `exclusions` table per card | Discussed narratively per card | Same data, different format |
| **Time-bound rates** | `effective_from`/`effective_to` in earn_rules | Tracked with expiry dates | Same approach |

### 2.2 What's Different (The Gaps)

| # | Gap | MileLion Approach | MaxiMile Current State | Risk of Ignoring | Effort to Fix | Benefit |
|---|---|---|---|---|---|---|
| **1** | ~~**Min spend not enforced**~~ | "If you can't hit $500/month, use a blacklist card instead" | **RESOLVED (Sprint 22)** — `recommend()` RPC now extracts `min_spend_monthly` from `conditions` JSONB and falls back to `base_rate_mpd` when `GREATEST(actual_spend, estimated_spend) < threshold`. New `user_settings` table stores estimated monthly spend. UI shows amber nudge/green checkmark. | ~~**HIGH**~~ **CLOSED** | ~~**Medium**~~ Done | ~~**High**~~ Done |
| **2** | ~~**Contactless not enforced**~~ | Flags contactless-only bonuses explicitly | **RESOLVED** — `requires_contactless` badge shown on recommendation cards | ~~**MEDIUM**~~ **CLOSED** | ~~**Low**~~ Done | ~~**Medium**~~ Done |
| **3** | ~~**MCC sub-category granularity**~~ | HSBC Revolution excludes MCC 5814 (fast food) from dining bonus | **CLOSED (Sprint 21)** — HSBC Revolution MCC 5814 exclusion added to `exclusions` table | ~~LOW-MEDIUM~~ **RESOLVED** | ~~High~~ Done | ~~Low~~ Done |
| **4** | **Points currency quality** | Ranks points currencies (AMEX MR > Citi ThankYou > HSBC) | Not considered — all MPD treated equal | **LOW** — Only matters when comparing cards with identical MPD | **Medium** — Add `points_quality_score` multiplier per bank | **Low** — Marginal improvement |
| **5** | **Card stacking/combos** | Recommends complementary card portfolios (12+ card rotation) | Not supported | **LOW** — Portfolio advice, not transaction-level recommendation. Different product scope. | **Very High** — Entirely new feature | **Low for v1** |
| **6** | **MCC switching (HeyMax, Atome)** | Major strategy pillar — converting unfavorable MCCs into bonus-earning ones | Not supported | **LOW** — Power-user strategy, not core recommendation | **Very High** — New concept entirely | **Low for v1** |
| **7** | **Overseas/FCY** | Major category with dedicated articles, FCY fee analysis, card pairing strategies | Intentionally excluded (PRD scopes to local SGD only) | **None for v1** — Intentional scope decision | **Very High** | **Out of scope** |
| **8** | **Sub-caps (UOB style)** | Tracks sub-caps within categories (e.g., UOB $600/$750 across sub-categories) | Single cap per card/category | **LOW** — Minor accuracy impact | **Medium** | **Low** |

### 2.3 Cards in MileLion Not in MaxiMile (29-card set)

MileLion recommends several cards not in MaxiMile's original 20-card database. Status updated to reflect 29-card expansion:

| Card | MileLion Context | Why It Matters | Add to MaxiMile? |
|---|---|---|---|
| **DBS yuu Card (AMEX/Visa)** | 10 mpd at yuu merchants (Cold Storage, Giant, SimplyGo) | #1 grocery/transit card | Not yet — complex conditions ($800 min spend + 4 merchants) would give wrong recommendations without condition enforcement |
| **Maybank World Mastercard** | Uncapped 4 mpd on petrol, no min spend | #1 petrol card | **ADDED (Card 21)** — 4 mpd petrol uncapped, no min spend. First Mastercard in database. |
| **UOB Visa Signature** | 4 mpd contactless, $1,200/month cap | Strong general card | **ADDED (Card 22)** — 4 mpd contactless + petrol. Dual conditions (contactless + $1,000/month min spend). $1,200 cap shared. |
| **Maybank XL Rewards** | 4 mpd on dining, shopping, travel, streaming, hotels | Broad bonus coverage | **ADDED (Card 28)** — 4 mpd dining/online/travel. Min spend $500/month. Cap $1,000/month shared. Age 21-39 only. |
| **DBS Vantage Visa Infinite** | 1.5 mpd flat with $2,000 min spend | Strong flat-rate card for high spenders | **ADDED (Card 23)** — 1.5 mpd all categories with $2,000/month min spend. 1.0 mpd base without. |
| **OCBC Voyage Card** | 1.3 mpd flat, no caps, miles never expire | Reliable flat-rate card | **ADDED (Card 24)** — 1.3 mpd flat, no caps, no min spend. VOYAGE Miles do not expire. |
| **SC Journey Card** | 3 mpd on online transport/grocery delivery | Niche delivery card | **ADDED (Card 25)** — 3 mpd transport/groceries (online delivery only). Cap $1,000/month shared. |
| **SC Beyond Card** | 1.5 mpd flat, premium card | High flat-rate for premium segment | **ADDED (Card 26)** — 1.5 mpd flat, no caps, no min spend. $1,635 annual fee. |
| **HSBC Premier Mastercard** | 1.4 mpd flat (KrisFlyer rate) | Solid flat-rate for Premier customers | **ADDED (Card 27)** — 1.4 mpd flat, uncapped, no min spend. Waived for Premier ($200K TRB). |
| **UOB Lady's Solitaire** | 4 mpd on 2 chosen categories (10X UNI$) | Flexible user-selectable bonus | **ADDED (Card 29)** — 4 mpd on 2 of 7 selectable categories. Cap $1,500/month. New `user_selectable` condition type. |
| **SC Smart Card** | 1.5% cashback on all spend | Cashback card | **DEFERRED (P3)** — cashback card, not miles. Out of scope for miles recommendation engine. |
| **Instarem Amaze Card** | FCY pairing strategy with Citi Rewards | FCY optimization | Out of scope (no FCY support) |
| **Mari Credit Card** | 1.5% cashback on FCY, no min spend | FCY optimization | Out of scope |
| **Chocolate Visa Debit** | 1 mpd on utilities (100 miles/month cap) | Only viable utilities card | Low priority — debit card, not credit |

---

## 3. Category Comparison

### 3.1 Side-by-Side Overview

| # | MileLion Category | MaxiMile Equivalent | Match Level | Notes |
|---|---|---|---|---|
| 1 | Dining (restaurants + food delivery) | `dining` | **98%** | Same MCCs. HSBC Revolution MCC 5814 (fast food) exclusion **now in exclusions table (Sprint 21)**. |
| 2 | Supermarkets / Groceries | `groceries` | **90%** | Same scope. MileLion heavily features DBS yuu (not in our set). |
| 3 | Online Shopping | `online` | **98%** | MaxiMile has 17 MCCs — more comprehensive than MileLion's explicit list. |
| 4 | Public Transport (SimplyGo) | `transport` (combined) | **90%** | MileLion splits this out; same earn rates in practice. |
| 5 | Ride-hailing (Grab/Gojek) | `transport` (combined) | **90%** | Combined works fine — same MCC 4121. |
| 6 | Petrol | `petrol` | **95%** | Earn rules for all 29 cards seeded. Petrol/bills conflict **resolved (Sprint 21)**. Maybank World MC added (Card 21, uncapped 4 mpd). |
| 7 | Air Tickets | `travel` (combined) | **90%** | MileLion distinguishes SIA direct (3 mpd) from OTA bookings (1.2 mpd). `conditions_note` now surfaced **(Sprint 21)**. |
| 8 | Hotels | `travel` (combined) | **85%** | Combined is fine — same earn rules apply to all travel MCCs per card. |
| 9 | Overseas / FCY Spend | None | **0%** | Intentionally out of scope. |
| 10 | Insurance Premiums | `bills` (combined) | **50%** | Insurance MCCs (6300/6381/6399) are in `bills` and excluded by nearly every card. **Insurance warning banner now shown (Sprint 21)**. |
| 11 | Utilities / Telco | `bills` (combined) | **70%** | MCC 4900. Base rate earn rules seeded for all 29 cards **(Sprint 21)**. `conditions_note` surfaced. |
| 12 | Entertainment / Streaming | `online` (absorbed) | **90%** | Streaming codes as digital goods MCCs already in `online`. |
| 13 | General / "Blacklist" spend | `general` | **100%** | Same concept. Algorithm correctly falls back to `base_rate_mpd`. |

### 3.2 Category Deep Dives

#### DINING — 95% Match

| Aspect | MaxiMile | MileLion |
|---|---|---|
| MCCs | 5811, 5812, 5813, 5814 | Same core MCCs |
| Scope | Restaurants, cafes, bars, fast food | Same + food delivery apps + hawker centres |
| Key nuance missed | ~~None~~ | ~~**HSBC Revolution excludes MCC 5814 (fast food)** from its 4 mpd bonus~~ **RESOLVED (Sprint 21)** — exclusion row added in `all_cards.sql` |

- ~~**Risk of ignoring:** Medium~~ **CLOSED** — HSBC Revolution MCC 5814 exclusion now exists in the `exclusions` table (`all_cards.sql` line ~997-1000). The recommendation engine will correctly exclude fast food from HSBC Revolution's 4 mpd bonus.
- **No further action needed.**

#### GROCERIES — 90% Match

| Aspect | MaxiMile | MileLion |
|---|---|---|
| MCCs | 5411, 5422, 5441, 5451, 5462, 5499 | Primarily 5411 |
| Scope | Supermarkets, bakeries, specialty food | Same + wet markets + convenience stores |
| Key nuance missed | None at MCC level | MileLion heavily recommends **DBS yuu Card (10 mpd at Cold Storage/Giant)** — not in MaxiMile's 29-card set. Also recommends HeyMax voucher strategy (MCC switching). |

- **Risk of ignoring:** Low — DBS yuu's conditions are so complex ($800 min spend + 4 merchants) that recommending it without condition enforcement could do more harm than good. HeyMax is a power-user strategy.
- **Effort to fix:** Medium (adding DBS yuu = new card data + complex condition modeling).
- **Benefit:** Low for v1 scope.

#### ONLINE SHOPPING — 98% Match

| Aspect | MaxiMile | MileLion |
|---|---|---|
| MCCs | 17 MCCs (5262, 5310, 5311, 5399, 5944-5947, 5964-5969, 7372, 5816-5818) | Similar but fewer explicitly listed |
| Scope | E-commerce, subscriptions, digital goods | Same + streaming |
| Key nuance | **MCC 5311 (Department Stores)** is included — this is the most universally whitelisted bonus MCC | MileLion confirms MCC 5311 is the key "MCC switching" target |

- **Risk of ignoring:** None — MaxiMile's online MCC coverage is comprehensive. This is a strength.
- **No action needed.**

#### TRANSPORT — 90% Match (Combined)

MileLion splits into: Public Transport (SimplyGo), Ride-hailing, Parking, Car rental.

| Sub-category | MileLion | MaxiMile |
|---|---|---|
| Public Transport (SimplyGo) | Dedicated article. Contactless tap codes differently. | Combined into `transport` (MCC 4111, 4131) |
| Ride-hailing (Grab/Gojek) | MCC 4121 | Combined into `transport` (MCC 4121) |
| Parking | MCC 7523 | Combined into `transport` (MCC 7523) |
| Car rental | MCC 7512 | Combined into `transport` (MCC 7512) |

- **Risk of ignoring the split:** Low — same cards earn the same rate across all transport MCCs. The split only matters for editorial guidance ("use contactless for SimplyGo"), not algorithm logic.
- ~~**Effort to fix:** N/A — no algorithm change needed. Could add a UI note about contactless.~~ **RESOLVED (Sprint 22)** — `requires_contactless` badge now shown on recommendation cards. KrisFlyer UOB transport shows "Requires contactless payment" badge.
- **No action needed** for the algorithm.

#### PETROL — 80% Match

| Aspect | MaxiMile | MileLion |
|---|---|---|
| MCCs | 5541, 5542, 5983 | 5541, 5542 |
| Scope | Petrol stations, fuel | Same |
| Key nuances | ~~**petrol/bills conflict**~~ **RESOLVED (Sprint 21)** — both `petrol` and `bills` categories seeded with earn rules for all 29 cards in `all_cards.sql`. | **Maybank World MC (uncapped 4 mpd, no min spend)** is #1 petrol pick — **ADDED as Card 21**. Also recommends Kris+ stacking at Esso (+3 mpd). |

- ~~**Risk of ignoring:** HIGH for petrol/bills conflict (P0).~~ **CLOSED** — Petrol earn rules exist for all 29 cards. Bills earn rules (base rate) also seeded for all 29 cards. Both categories are functional in the recommendation engine.
- ~~**Remaining gap:** Maybank World MC (uncapped 4 mpd) not in MaxiMile's 29-card set.~~ **CLOSED** — Maybank World MC added as Card 21 (uncapped 4 mpd petrol, no min spend).
- **Benefit realized:** All 232 earn rules (8 categories x 29 cards) now active.

#### TRAVEL — 85% Match (Combined)

MileLion splits into: Air Tickets, Hotels, Travel Agencies/Tours.

| Sub-category | MileLion | MaxiMile |
|---|---|---|
| Air Tickets | Distinguishes direct airline bookings (MCC 3000-3299, 4511) from OTA bookings (MCC 4722). **KrisFlyer UOB: uncapped 3 mpd on SIA/Scoot.** | Combined into `travel` |
| Hotels | MCC 7011, 3501-3999. Amex KrisFlyer Ascend: 2 mpd capped at $2,500/month. | Combined into `travel` |
| Travel agencies | MCC 4722. Usually base rate only. | Combined into `travel` |

- ~~**Risk of ignoring the split:** Medium~~ **MITIGATED (Sprint 21)** — `conditions_note` is now surfaced on recommendation cards. KrisFlyer UOB's travel rule includes the note "Earn 3 mpd on SIA purchases. 1.2 mpd on other travel." which is now visible to users in the UI (`[category].tsx` lines ~452-457 for top card, line ~529 for alternatives).
- **No category split needed.** The `conditions_note` approach works: users see the fine print inline without restructuring categories.
- **Remaining nuance:** The score still uses 3.0 mpd for ranking, which may over-rank KrisFlyer UOB for non-SIA travel. True fix requires condition enforcement in scoring (Sprint 22 scope).

#### BILLS — 70% Match (Combined)

MileLion splits into: Insurance Premiums, Utilities/Telco.

| Sub-category | MileLion | MaxiMile |
|---|---|---|
| Insurance Premiums | Dedicated article. **MCC 6300/6381/6399 excluded by almost every card.** Best: Maybank Visa Infinite 1.2 mpd (not in MaxiMile's set). Most cards: 0 mpd. | Combined into `bills` |
| Utilities / Telco | MCC 4900. **Nearly universally excluded from bonus.** Best: Chocolate Visa Debit 1 mpd (100 miles/month cap). | Combined into `bills` |

- ~~**Risk of ignoring the split:** Low for the split itself. **Medium for the data integrity issue**~~ **MITIGATED (Sprint 21)** — Insurance warning banner now displays on the Bills recommendation screen (`[category].tsx` lines ~407-415): "Insurance payments are excluded from bonus earning on most cards. Base rate only." Additionally, `conditions_note` values like "Base rate on bills/utilities." are surfaced on each card in the bills results.
- **Bills earn rules:** All 29 cards now have `bills` category earn rules seeded in `all_cards.sql` (base rate for each card).
- **Remaining gap:** Insurance exclusions are tracked in the `exclusions` table but not yet factored into the scoring formula itself. A user paying insurance will see base-rate recommendations with the warning banner, which is acceptable for v1.

#### OVERSEAS / FCY — 0% Match (Intentional)

| Aspect | MaxiMile | MileLion |
|---|---|---|
| Coverage | None — scoped out in PRD | Major category: dedicated articles, FCY fee analysis, card pairing (Instarem Amaze), rate comparisons |

- **Risk of ignoring:** None for v1 — intentional scope decision.
- **Effort to fix:** Very High (new data model for FCY rates, fees, pairing logic).
- **No action needed.** Acknowledge as future feature if desired.

#### ENTERTAINMENT / STREAMING — 90% Match

- Streaming services (Netflix, Spotify) code under digital goods MCCs (5968, 7372) already in MaxiMile's `online` category.
- MileLion discusses within shopping articles; Maybank XL Rewards earns 4 mpd on streaming specifically.
- **No action needed** — current mapping works.

#### GENERAL / "BLACKLIST" — 100% Match

- Both use as catch-all for spend that doesn't qualify for any bonus category.
- MileLion recommends high-base-rate cards: UOB PRVI Miles (1.4 mpd), SC Visa Infinite (1.4 mpd), BOC Elite Miles (1.5 mpd).
- MaxiMile's algorithm already handles this correctly — ranks by `base_rate_mpd` when no bonus exists. BOC Elite Miles (1.5 mpd) correctly ranks #1.
- **No action needed.**

---

## 4. Priority Actions

### P0 — Must Fix (High Impact, Data Already Exists)

| Action | Why | Effort | Status |
|---|---|---|---|
| ~~**Resolve petrol/bills conflict**~~ | ~~140 earn rules for `petrol` sitting unused.~~ Both `petrol` and `bills` categories now have earn rules for all 29 cards in `all_cards.sql`. | ~~Medium~~ Done | **COMPLETED (Sprint 21)** |

### P1 — Should Fix (Prevents Wrong Recommendations)

| Action | Why | Effort | Status |
|---|---|---|---|
| ~~**Enforce min spend conditions in scoring**~~ | SC X Card (3.3 mpd @ $500 min), UOB Preferred Platinum (4 mpd @ $600 min), Maybank cards ($300 min) — now correctly downranked to base rate for users who don't meet thresholds. | ~~Medium~~ Done | **COMPLETED (Sprint 22)** — `recommend()` RPC enforces min spend via `conditions` JSONB. `user_settings` table + spending settings screen + min spend nudge UI. 6 new tests passing. |

### P2 — Quick Wins (Better UX, Low Effort)

| Action | Why | Effort | Status |
|---|---|---|---|
| ~~**Surface `conditions_note` on recommendation cards**~~ | Shows "SIA bookings only", "Requires contactless", "Min spend $500/month" | ~~Low~~ Done | **COMPLETED (Sprint 21)** — `recommend()` RPC returns `conditions_note`; displayed on top card and alternative cards in `[category].tsx` |
| ~~**Add HSBC Revolution MCC 5814 exclusion**~~ | Prevents wrong dining recommendation for fast food | ~~Low~~ Done | **COMPLETED (Sprint 21)** — exclusion row added in `all_cards.sql` Section 5 |
| ~~**Add insurance warning on Bills screen**~~ | Insurance MCCs excluded by most cards despite being in `bills` category | ~~Low~~ Done | **COMPLETED (Sprint 21)** — warning banner shown when `category === 'bills'` in `[category].tsx` |

### P3 — Nice to Have (Low Priority for v1)

| Action | Why | Effort |
|---|---|---|
| Add points currency quality scoring | Not all "4 mpd" is equal | Medium |
| Add DBS yuu Card to database | #1 grocery card but complex conditions | Medium |
| ~~Add Maybank World MC to database~~ | ~~#1 petrol card (uncapped 4 mpd)~~ | ~~Low-Medium~~ **COMPLETED** — Added as Card 21 |
| ~~Add Maybank XL Rewards to database~~ | ~~Broad 4 mpd coverage (dining/online/travel)~~ | ~~Low-Medium~~ **COMPLETED** — Added as Card 28 |
| Split travel into Air/Hotels sub-categories | Minor accuracy gain | Medium-High |

### Can Safely Ignore for v1

| Gap | Why It's OK to Skip |
|---|---|
| MCC switching (HeyMax, Atome) | Power-user strategy, not core recommendation |
| Card stacking/combo recommendations | Different product scope (portfolio advisor vs transaction recommender) |
| Overseas/FCY support | Intentionally scoped out in PRD |
| Transport sub-category split | Same earn rates across all transport MCCs — no algorithm impact |
| Entertainment as separate category | Already covered by `online` MCCs |

---

## 5. Key Insight

MaxiMile and MileLion serve fundamentally different purposes:

| | MaxiMile | MileLion |
|---|---|---|
| **Purpose** | Decision-execution tool ("use this card now") | Consumer education resource ("which card to apply for") |
| **User state** | Already has cards in wallet | Deciding which cards to get |
| **Depth needed** | Accurate per-transaction recommendation | Comprehensive market coverage |
| **Strength** | Real-time cap tracking, instant recommendation | Nuanced editorial analysis, condition caveats |
| **Weakness** | ~~Conditions not enforced/surfaced~~ Conditions now surfaced (Sprint 21), min spend enforced in scoring (Sprint 22), contactless badge added (Sprint 22). | Manual tracking, no automation |

The goal is not to replicate MileLion's editorial depth, but to ensure MaxiMile's automated recommendations are **as accurate as MileLion's manual ones** for the cards in our database. As of Sprint 22+, **all priorities are resolved**: P0 (petrol/bills data — Sprint 21), P1 (min spend condition enforcement — Sprint 22), P2 (condition transparency — Sprint 21), contactless badge (Sprint 22), and **card expansion** (29 cards total — 9 new cards added including all 7 MileLion gap cards except DBS yuu). The remaining gaps (points currency quality, card stacking, DBS yuu) are P3/deferred.

---

## 6. MileLion Sources Referenced

- [MileLion 2026 Credit Card Strategy](https://milelion.com/2026/01/10/the-milelions-2026-credit-card-strategy/)
- [What card do I use for... (Guide)](https://milelion.com/credit-cards/guide/)
- [Which credit card covers the most bonus MCCs?](https://milelion.com/2025/12/23/which-credit-card-covers-the-most-bonus-mccs/)
- [2026: Best Credit Cards for Supermarkets](https://milelion.com/2026/01/18/best-credit-cards-for-supermarkets/)
- [2026: Best Credit Cards for Air Tickets](https://milelion.com/2026/02/11/best-credit-cards-for-airline-tickets/)
- [2026: Best Credit Cards for Hotels](https://milelion.com/2026/02/25/best-credit-cards-for-hotels/)
- [2026: Best Credit Cards for SimplyGo / Public Transport](https://milelion.com/2026/02/15/whats-the-best-credit-card-to-use-for-simplygo-and-public-transport/)
- [2026: Best Credit Cards for Utilities](https://milelion.com/2026/01/16/whats-the-best-credit-card-to-use-for-electricity-utilities-bills/)
- [2026: Best Credit Cards for Insurance Premiums](https://milelion.com/2026/01/05/whats-the-best-credit-card-for-paying-insurance-premiums/)
- [2025: Best Cards for Overseas Spending](https://milelion.com/2025/09/24/best-cards-for-overseas-spending/)
- [2025: Best Credit Cards for Shopping](https://milelion.com/2025/11/23/2025-edition-best-credit-cards-for-shopping/)
- [Head-to-head: Citi Rewards vs DBS Woman's World](https://milelion.com/2025/11/07/head-to-head-citi-rewards-card-vs-dbs-womans-world-card/)
- [Code-switching: How to change MCCs](https://milelion.com/2025/05/28/how-to-change-mccs-to-earn-more-credit-card-rewards/)
- [Which bank offers the best points currency?](https://milelion.com/2026/02/25/which-bank-offers-the-best-points-currency/)

---

## Document Metadata

- **Author:** AI Analysis via Claude Code
- **Date:** 2026-02-26
- **Version:** 1.5 (Card Expansion — 29 cards across 7 banks)
- **Target Audience:** SME reviewers, Product Owner, development team
- **Related Documents:**
  - `docs/technical/RECOMMENDATION_AND_CATEGORY_LOGIC.md` (current system analysis)
  - `docs/technical/CARD_DATA_VERIFICATION.md` (card data for SME review)
