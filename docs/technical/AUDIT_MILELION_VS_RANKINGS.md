# Audit Report: RECOMMENDATION_RANKINGS.md vs MileLion's Guide

> **Audit date:** 2026-03-03
> **Auditor:** Market Research Analyst
> **Sources:** RECOMMENDATION_RANKINGS.md (internal), MileLion.com 2026 credit card guides
> **Scope:** All 8 spending categories, 30 tracked cards, earn rates, caps, and conditions

---

## 1. Executive Summary

- **Our rankings broadly agree with MileLion on the top-tier 4 mpd cards** for dining, online shopping, petrol, and utilities (universal exclusion). The core "starter 4-card combo" (Citi Rewards + DBS Woman's World + UOB Preferred Platinum + UOB Visa Signature) is well-represented in our data.
- **Two critical omissions exist: the DBS yuu Card (10 mpd at FairPrice/yuu merchants) and SC Smart Card bonus tiers (5.6-9.28 mpd on transport/fast food).** These are among MileLion's most-recommended cards and are either missing or severely undervalued in our system.
- **Several earn rate caps and conditions are stale.** HSBC Revolution's bonus cap was boosted from $1,000/mo to $1,500/mo, DBS Woman's World cap was cut from $2,000/mo to $1,000/mo, and DBS Altitude's 4 mpd travel bonus appears to have been removed entirely.
- **We do not account for points currency quality**, which MileLion considers a key differentiator. Two cards at "4 mpd" can have very different real-world value depending on the rewards currency.

---

## 2. Compatibility Matrix

Areas where our rankings **agree** with MileLion's publicly known recommendations.

| Category | Finding | Status |
|---|---|---|
| **Dining** | UOB Preferred Platinum at 4 mpd | AGREE |
| **Dining** | UOB Visa Signature at 4 mpd (contactless + min spend) | AGREE |
| **Dining** | HSBC Revolution 4 mpd with MCC 5814 fast food exclusion | AGREE |
| **Dining** | OCBC Titanium 4 mpd | AGREE |
| **Dining** | Maybank XL Rewards 4 mpd (category selectable) | AGREE |
| **Online Shopping** | Citi Rewards 4 mpd, $1,000/mo shared cap | AGREE |
| **Online Shopping** | HSBC Revolution 4 mpd | AGREE |
| **Petrol** | Maybank World Mastercard: uncapped 4 mpd, no min spend, best petrol card | AGREE |
| **Petrol** | UOB Visa Signature 4 mpd (with min spend) | AGREE |
| **Transport** | UOB Visa Signature 4 mpd (contactless, SimplyGo) | AGREE |
| **Transport** | UOB Preferred Platinum 4 mpd (SimplyGo contactless) | AGREE (but we don't list UOB PP for transport) |
| **Travel** | KrisFlyer UOB 3 mpd on SIA | AGREE |
| **Utilities** | All cards 0 mpd -- universally excluded | AGREE |
| **Education** | Nearly universally excluded; Maybank token 0.16 mpd | AGREE (MileLion doesn't explicitly cover this) |
| **General strategy** | 4-card combo approach for covering all categories | AGREE |

---

## 3. Discrepancies Found

| # | Category | Issue | Severity | Our Data | MileLion's Data | Recommended Action |
|--:|---|---|---|---|---|---|
| 1 | **Groceries** | DBS yuu Card missing entirely | **CRITICAL** | Not tracked | 10 mpd at yuu merchants (FairPrice, 7-Eleven), $800/mo cap, min $800/mo spend | Add DBS yuu AMEX and DBS yuu Visa as card #31-32. Add 10 mpd grocery bonus rule. |
| 2 | **Transport** | SC Smart Card listed at 0.4 mpd (base only) | **CRITICAL** | 0.4 mpd, no bonus categories | 5.6 mpd (cashback equiv.) on public transport, fast food, streaming, EV charging. Tiered: 7.42 mpd at $800-$1,500/mo total spend; 9.28 mpd at $1,500+ | Add SC Smart Card bonus tiers for transport, fast food, streaming, EV charging. |
| 3 | **Travel** | DBS Altitude listed at 4 mpd for online travel | **CRITICAL** | 4.0 mpd via online travel portal (Rank #1 in Travel) | MileLion says the old 6 mpd Expedia and 3 mpd online travel bonuses were **removed**. Current rate is ~1.2 mpd base only. | Verify with DBS T&C. If confirmed removed, downgrade DBS Altitude to 1.2 mpd for Travel and remove from Travel top 3. |
| 4 | **Online Shopping** | DBS Woman's World cap is wrong | **MAJOR** | $2,000/mo | Cut to $1,500/mo in 2024, then **$1,000/mo in August 2025** | Update cap to $1,000/mo in earn_rules table. |
| 5 | **Dining** | HSBC Revolution cap is wrong | **MAJOR** | $1,000/mo shared | Boosted to **$1,500/mo** | Update cap to $1,500/mo in earn_rules table. |
| 6 | **Dining** | DBS yuu Card missing for food delivery | **MAJOR** | Not tracked | 10 mpd on Deliveroo, GrabFood, Foodpanda | Add DBS yuu Card with 10 mpd food delivery bonus rule. |
| 7 | **Transport** | UOB Preferred Platinum not listed for transport | **MAJOR** | Not in transport rankings | MileLion lists UOB PP at 4 mpd for SimplyGo (contactless = transport) | Add UOB Preferred Platinum 4 mpd bonus rule for transport (contactless). |
| 8 | **Transport** | KrisFlyer UOB listed at 2.0 mpd for transport | **MAJOR** | 2.0 mpd (contactless required) | MileLion says **2.4 mpd** uncapped on public transport (with $1,000/year SIA spend condition) | Verify and update to 2.4 mpd if confirmed. Add SIA spend condition. |
| 9 | **Petrol** | UOB Lady's Card not listed for petrol | **MAJOR** | Not in petrol rankings | MileLion recommends UOB Lady's Card for petrol (Shell, Sinopec) | Add UOB Lady's Card petrol bonus rule if MCC 5541/5542 qualifies under Beauty & Wellness or user-selectable. |
| 10 | **Groceries** | UOB Lady's Card not listed for groceries | **MAJOR** | Not in grocery rankings | MileLion lists UOB Lady's Card at 4 mpd on supermarkets | Add UOB Lady's Card 4 mpd grocery bonus rule. |
| 11 | **Travel** | HSBC Revolution not listed for travel | **MINOR** | Not in travel top cards | MileLion says HSBC Revolution earns 4 mpd on airlines, car rental, hotels, cruise lines (contactless). BUT online travel agencies NOT eligible. | Add HSBC Revolution 4 mpd travel bonus (direct airline/hotel bookings only, not OTAs). |
| 12 | **Online Shopping** | HSBC Revolution cap is wrong | **MAJOR** | $1,000/mo shared | Boosted to **$1,500/mo** (same as dining) | Update cap to $1,500/mo in earn_rules table. |
| 13 | **Hospital** | DBS Woman's World cap listed as $2,000/mo | **MINOR** | $2,000/mo | Should be $1,000/mo (same cap reduction as online shopping, since HealthHub pays as online) | Verify whether hospital/HealthHub payments share the online cap of $1,000/mo. |

---

## 4. Missing Cards

Cards that MileLion covers or recommends but are **not in our 30-card set**.

| Card | Bank | Network | Why It Matters | MileLion's Rating | Priority |
|---|---|---|---|---|---|
| **DBS yuu AMEX** | DBS | AMEX | 10 mpd at FairPrice, 7-Eleven, Giant, and all yuu merchants. Dominant grocery card. | Top pick for groceries | **P0 -- must add** |
| **DBS yuu Visa** | DBS | Visa | Visa variant of DBS yuu for merchants that don't accept AMEX | Alternate for non-AMEX merchants | **P0 -- must add** |
| **Citi Rewards Mastercard** | Citi | Mastercard | MileLion distinguishes between Visa and MC variants. MC variant may have different merchant acceptance or bonus rules. | Mentioned separately | **P2 -- investigate** |

### Impact of Missing DBS yuu Card

The DBS yuu Card would rank **#1 in Groceries** at 10 mpd, displacing UOB Visa Signature (4 mpd) by 2.5x. It would also rank **#1 in Dining (food delivery)** at 10 mpd, displacing all current 4 mpd cards. This is the single largest gap in our recommendation engine.

---

## 5. Earn Rate Discrepancies

Specific miles-per-dollar or cap values where our data differs from MileLion.

| Card | Category | Our MPD | MileLion MPD | Our Cap | MileLion Cap | Delta |
|---|---|---:|---:|---|---|---|
| **SC Smart Card** | Transport | 0.4 | **5.6** (cashback equiv.) | None | Tiered by total spend | **+5.2 mpd** -- we are massively understating this card |
| **SC Smart Card** | Fast food | 0.4 | **5.6** (cashback equiv.) | None | Tiered by total spend | **+5.2 mpd** -- not modeled at all |
| **DBS Altitude** | Travel | 4.0 | **1.2** (bonus removed) | None documented | N/A | **-2.8 mpd** -- we are overstating this card |
| **HSBC Revolution** | Dining | 4.0 | 4.0 | $1,000/mo | **$1,500/mo** | Cap +$500/mo -- our cap is too restrictive |
| **HSBC Revolution** | Online | 4.0 | 4.0 | $1,000/mo | **$1,500/mo** | Cap +$500/mo -- our cap is too restrictive |
| **DBS Woman's World** | Online | 4.0 | 4.0 | $2,000/mo | **$1,000/mo** | Cap -$1,000/mo -- our cap is too generous |
| **KrisFlyer UOB** | Transport | 2.0 | **2.4** | $1,000/mo | Uncapped (with condition) | +0.4 mpd and cap difference |
| **DBS yuu Card** | Groceries | N/A | **10.0** | N/A | $800/mo | Card missing entirely |
| **DBS yuu Card** | Dining (delivery) | N/A | **10.0** | N/A | Per merchant | Card missing entirely |

---

## 6. Points Currency Quality

MileLion explicitly argues that **not all 4 mpd are created equal**. Our ranking system treats 4 mpd from any card as equivalent, but MileLion highlights significant differences in the underlying rewards currencies.

### MileLion's Currency Tier List

| Tier | Currency | Cards | Why |
|---|---|---|---|
| **Tier 1 (Best)** | AMEX Membership Rewards | Amex KrisFlyer Ascend, Amex KrisFlyer | Flexible transfer to 16+ airline partners. No expiry. |
| **Tier 1 (Best)** | Citi ThankYou Points | Citi Rewards, Citi PremierMiles | Transfer to KrisFlyer + other partners. 5-year expiry. |
| **Tier 1 (Best)** | HSBC Rewards Points | HSBC Revolution, HSBC TravelOne, HSBC Premier MC | Transfer to KrisFlyer + others. No expiry (with activity). |
| **Tier 2** | UOB UNI$ | UOB Visa Sig, UOB Lady's, UOB PRVI Miles | Transfer to KrisFlyer only. Points expire. |
| **Tier 2** | KrisFlyer Miles (direct) | KrisFlyer UOB | Direct to KrisFlyer. 3-year expiry. |
| **Tier 3 (Worst)** | DBS Points | DBS Woman's World, DBS Altitude | Transfer to KrisFlyer only. **1-year expiry** (DBS WWC). |
| **Tier 3** | OCBC$ | OCBC Titanium, OCBC 90N | Limited transfer partners. |
| **Tier 3** | Maybank TreatsPoints | All Maybank cards | KrisFlyer transfer ratio is poor. |

### Impact on Our Rankings

Our system shows DBS Woman's World and HSBC Revolution as equivalent at 4 mpd for online shopping. But MileLion would rank HSBC Revolution **higher** because:
1. HSBC points have no expiry (vs DBS Points 1-year expiry)
2. HSBC points transfer to more airline partners
3. HSBC Revolution now has a higher cap ($1,500 vs $1,000)

**Recommendation:** Add a `currency_quality` field (1-3) to the cards table and use it as a tiebreaker when earn rates are equal. This would reorder cards within the same mpd tier to favor Citi/HSBC/Amex currencies.

---

## 7. Recommendations

Prioritized list of changes to bring our rankings in line with MileLion's authoritative guidance.

### P0 -- Critical (do immediately)

| # | Action | Affected Category | Effort |
|--:|---|---|---|
| 1 | **Add DBS yuu AMEX and DBS yuu Visa** to the card set. Create earn_rules: 10 mpd for groceries (yuu merchants, cap $800/mo, min spend $800/mo) and 10 mpd for dining/food delivery (Deliveroo, GrabFood, Foodpanda). | Groceries, Dining | Medium -- new card + migration |
| 2 | **Add SC Smart Card bonus tiers.** Transport/fast food/streaming/EV charging at 5.6 mpd base tier. Model the tiered total-spend thresholds ($800-$1,500 = 7.42 mpd; $1,500+ = 9.28 mpd). Currently listed at 0.4 mpd which is wrong. | Transport, Dining (fast food) | Medium -- new earn_rules + tiered logic |
| 3 | **Verify and likely remove DBS Altitude 4 mpd travel bonus.** MileLion says the 6 mpd Expedia / 3 mpd online travel bonuses were removed. If confirmed, downgrade to 1.2 mpd base and remove from Travel top 3. | Travel | Small -- update earn_rule |

### P1 -- Major (do this sprint)

| # | Action | Affected Category | Effort |
|--:|---|---|---|
| 4 | **Update HSBC Revolution cap from $1,000/mo to $1,500/mo** across all bonus categories (dining, online, pharmacy, hospital via HealthHub). | Dining, Online, Pharmacy, Hospital | Small -- update 4 earn_rules |
| 5 | **Update DBS Woman's World cap from $2,000/mo to $1,000/mo** for online shopping. Verify whether hospital/HealthHub shares this reduced cap. | Online, Hospital | Small -- update 1-2 earn_rules |
| 6 | **Add UOB Preferred Platinum to transport** at 4 mpd (SimplyGo contactless triggers the bonus). Currently missing from transport rankings. | Transport | Small -- add earn_rule |
| 7 | **Add UOB Lady's Card to groceries** at 4 mpd (supermarkets). MileLion lists it; we don't. | Groceries | Small -- add earn_rule |
| 8 | **Update KrisFlyer UOB transport rate from 2.0 to 2.4 mpd.** Add condition: requires $1,000/year SIA spend. | Transport | Small -- update earn_rule |
| 9 | **Add HSBC Revolution to travel** at 4 mpd for direct airline/hotel/car rental bookings (contactless). Exclude online travel agencies (Airbnb, Expedia). Add conditions_note. | Travel | Small -- add earn_rule |

### P2 -- Minor (backlog)

| # | Action | Affected Category | Effort |
|--:|---|---|---|
| 10 | **Add `currency_quality` field to cards table** (1=best, 3=worst). Use as tiebreaker in scoring formula when earn_rate_mpd is equal. | All | Medium -- schema change + ranking logic |
| 11 | **Investigate Citi Rewards Visa vs Mastercard variants.** MileLion distinguishes them. Verify if bonus rules differ by network. | All Citi Rewards categories | Small -- research |
| 12 | **Add Amaze + Citi Rewards dining combo.** MileLion mentions using Amaze app with Citi Rewards for 4 mpd dining. We list Citi Rewards for online/general but not dining. | Dining | Small -- add earn_rule if confirmed |
| 13 | **Add UOB Lady's Card for petrol.** MileLion suggests it for Shell/Sinopec. Verify which user-selectable category covers petrol MCCs. | Petrol | Small -- verify and add |
| 14 | **Model SC Smart Card cashback-to-miles equivalence.** SC Smart Card earns cashback, not miles. We need a policy decision: do we show cashback cards in a miles ranking, and if so, how do we convert? MileLion uses a 1 cpp = X mpd equivalence. | Transport, Fast food | Medium -- policy + logic |
| 15 | **Add points expiry data to card metadata.** MileLion emphasizes this (e.g., DBS Points 1-year expiry is a major downside). Surface it in the UI as a warning. | All | Medium -- schema + UI |

---

## Appendix A: Category-by-Category Summary

| Category | Agreement Level | Key Gap |
|---|---|---|
| Dining | **High** | Missing DBS yuu Card (10 mpd food delivery). HSBC cap stale. |
| Transport | **Low** | SC Smart Card massively undervalued. UOB PP missing. KrisFlyer UOB rate wrong. |
| Online Shopping | **Medium** | DBS WWC cap is wrong ($2K should be $1K). HSBC cap stale. |
| Groceries | **Low** | Missing DBS yuu Card (10 mpd). Missing UOB Lady's Card (4 mpd). |
| Petrol | **High** | Minor: missing UOB Lady's Card. |
| Travel | **Low** | DBS Altitude 4 mpd likely removed. Missing HSBC Revolution. |
| General | **High** | No major gaps. |
| Bills | **High** | Caps may need updating (DBS WWC, HSBC Rev). |

---

## Appendix B: MileLion's Recommended 4-Card Starter Combo

MileLion's recommended starter setup for maximizing 4 mpd coverage:

| Card | Covers | Why |
|---|---|---|
| **Citi Rewards** | Online shopping, department stores, fashion | 4 mpd. Best currency (ThankYou Points, 5-year expiry). |
| **DBS Woman's World** | Online shopping overflow, telco bills | 4 mpd. Backup when Citi cap exhausted. |
| **UOB Preferred Platinum Visa** | Dining, transport (SimplyGo) | 4 mpd. Lower min spend ($600/mo) than UOB Visa Sig ($1,000/mo). |
| **UOB Visa Signature** | Everything else (contactless) | 4 mpd. Broadest category coverage via contactless trigger. |

**Our system supports this combo** -- all four cards are in our 30-card set and their core bonus rules are correctly modeled (with the cap corrections noted above).

---

*End of audit report.*
