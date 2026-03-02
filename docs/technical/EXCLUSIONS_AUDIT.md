# Exclusions Audit — MaxiMile Card Database

**Document Type:** Data Quality Audit
**Created:** 2026-03-01
**Source:** MileLion 2026 + official bank T&Cs cross-verification
**Status:** Phase 1 ✅ APPLIED v1.5.0 | Phase 2 ✅ APPLIED v1.7.0

---

## What the Exclusions Table Does

The `exclusions` table is **informational only** — the `recommend()` function does not filter by exclusions at query time. Exclusions serve three purposes:
1. UI warning banners (e.g., "Insurance payments excluded on most cards")
2. Future enforcement (planned: recommend() to check exclusions before scoring)
3. Data documentation / audit trail

Since we fixed earn_rates to 0 in v1.4.0 for utilities, the earn_rules table is now the enforcement layer. The exclusions table should reflect the same truth but is not redundant — it drives UI messaging.

---

## Current State vs. Correct State

### What Every Card Currently Has
- Government MCCs: `9311, 9222, 9211, 9399`
- Insurance MCCs: `6300, 6381, 6399`

### What's Missing From Every Card

| MCC(s) | Category | Confirmed Excluded By | Date |
|---|---|---|---|
| **4900** | Utilities (SP Services, Geneco) | DBS, Citi, UOB, OCBC, HSBC, SC, BOC, Maybank | Various (all by Dec 2025) |
| **8062** | Hospitals | DBS (Dec 25), Citi (Jan 24), UOB (Feb 21), OCBC (Apr 21), SC (Sep 24), BOC, HSBC | Various |
| **8211, 8220, 8241, 8244, 8249, 8299** | Education (all schools) | DBS, Citi, UOB, OCBC, HSBC, SC, BOC | Pre-2020 for most |
| **6540** | Stored Value / GrabPay top-ups | All banks | Pre-2022 |
| **6529, 6530, 6534** | Quasi-cash (remote stored value, money transfer) | All banks | Various 2024-2025 |
| **4829** | Wire Transfer / Money Orders | DBS, Citi, UOB, OCBC, HSBC, SC, BOC | Pre-2020 |
| **7523** | Parking (ERP, HDB parking) | UOB (Feb 21), DBS (Dec 25), Citi, OCBC, HSBC, SC, BOC (Jul 25), Maybank (Jul 25) | Various |
| **7995** | Gambling (casino, lottery) | UOB, OCBC, HSBC, SC, BOC | Pre-2020 |
| **7349** | Cleaning/Janitorial (Urban Company, Helpling) | DBS (Dec 25), UOB, OCBC, HSBC, SC, Maybank (Dec 25), BOC (Jul 25) | Various |
| **5199** | Nondurable Goods NEC | DBS, Citi, UOB, OCBC, HSBC, SC, BOC | Pre-2022 |
| **8398** | Charitable Organizations | DBS, Citi, UOB, OCBC, HSBC, SC, BOC, Maybank | Pre-2020 |
| **8651, 8661** | Political/Religious Organizations | All banks | Pre-2020 |
| **6050, 6051** | Quasi-cash (financial institutions, crypto) | All banks | Pre-2020 |
| **6211** | Security Brokers/Dealers | DBS, Citi, UOB, OCBC, SC, BOC | Pre-2020 |
| **6513** | Real Estate Agents | DBS, Citi, UOB, OCBC, SC, BOC | Pre-2020 |
| **5960** | Direct Marketing — Insurance | DBS, Citi, HSBC, BOC, Maybank | Pre-2020 |

### What's Incorrect / Needs Fixing

| Card | Issue | Correction |
|---|---|---|
| Card 3 (UOB PRVI) | Govt MCCs missing `9399` | Add 9399 |
| Card 4 (OCBC 90N) | Govt MCCs missing `9399` | Add 9399 |
| Card 5 (KrisFlyer UOB) | Petrol (5541, 5542) exclusion is `[ESTIMATED]` — not confirmed by UOB T&Cs. KrisFlyer UOB earns base rate on petrol, it doesn't have petrol in bonus, so no need to exclude. | Remove or remark as [UNCONFIRMED] |
| Card 6 (HSBC Rev) | Groceries exclusion (5411) marked `[ESTIMATED]` — but confirmed by HSBC from May 2024 | Update to [VERIFIED] |
| Card 11 (UOB Lady's) | Education exclusion has empty MCC array `ARRAY[]::TEXT[]` | Add proper MCCs: 8211, 8220, 8241, 8244, 8249, 8299 |
| Card 15 (SC X) | Utility exclusion has empty MCC array `ARRAY[]::TEXT[]` | Add proper MCCs: 4900 (consolidate with general utility exclusion) |
| Card 20 (UOB PPV) | Fast food delivery exclusion is empty MCC array — no known MCC for this | Remove or change to informational note only |

### Bank-Specific Exceptions (Must Preserve)

| Card | Exception | Notes |
|---|---|---|
| Cards 7, 14 (Amex) | Hospitals (8062): **public hospitals excluded, private hospitals still earn** | Add 8062 to exclusions but with note about private hospital exception |
| Card 24 (OCBC Voyage) | Hospitals (8062): **private hospitals still earn** | Add 8062 but with exception note |
| Card 16 (Maybank Horizon) | Insurance MCCs: still earns on 6300/6381/6399 for some products | Do NOT add insurance to Maybank exclusions without verifying card-by-card |
| Cards 16, 21 (Maybank) | Education, hospitals: Maybank has shorter exclusion list — verify before adding | Mark as [UNVERIFIED] |
| HSBC Revolution | MCC 5411, 5499 excluded from **bonus only** — still earns 0.4 mpd base rate | These are bonus exclusions, not total exclusions. Keep category-specific, not card-wide. |

---

## Parking (MCC 7523) — Important Note

MCC 7523 covers parking lots and garages. We currently have transport category MCCs including 7523 in the categories table. However:
- UOB excluded parking from UNI$ earning from 1 Feb 2021
- DBS excluded from 1 Dec 2025
- Citi, OCBC, HSBC, SC, BOC all exclude

**But:** ERP/HDB parking codes as MCC 7523 AND as a government service sometimes. For transport category, this means the `transport` earn_rules for UOB/DBS cards that earn on transport would NOT apply to parking. This is a relevant distinction for recommendation accuracy.

---

## Critical Missing: Quasi-Cash (GrabPay Top-Ups)

GrabPay top-ups (MCC 6540) are excluded by ALL banks. This is one of the most common exclusion surprises for users — they tap GrabPay expecting to earn miles but earn 0 because it's a wallet top-up (6540), not a transaction. The actual GrabPay spend downstream earns miles through the merchant's MCC.

This is the highest-priority UX awareness item not currently in our exclusions table.

---

## Correction Phases

### Phase 1 (Immediate — applied in v1.5.0)
These are the most impactful for user awareness and UI messaging:

1. Add MCC 4900 (utilities) to exclusions for all cards with earn_rate=0
2. Add MCC 8062 (hospitals) to all applicable cards
3. Add education MCCs (8211, 8220, 8241, 8244, 8249, 8299) to all confirmed-excluding cards
4. Add quasi-cash MCCs (6540, 6529, 6530, 6534) to all cards
5. Add parking MCC 7523 to confirmed-excluding cards
6. Fix Cards 3 and 4: add 9399 to government list
7. Fix Card 5: remove unconfirmed petrol exclusion
8. Fix Card 11: add proper MCCs to education exclusion
9. Fix Card 15: consolidate empty utility exclusion
10. Fix Card 6 HSBC Rev groceries: change [ESTIMATED] to [VERIFIED]

### Phase 2 (✅ APPLIED in v1.7.0)
Lower-priority completeness items — all applied in EXCLUSIONS section of all_cards.sql v1.7.0:
- [x] Add wire transfers (4829): DBS, Citi, UOB, OCBC, HSBC, SC, BOC — cards 1-15, 18-20, 22-27, 29
- [x] Add real estate (6513): DBS, Citi, UOB, OCBC, SC, BOC — cards 1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 18, 19, 20, 22, 23, 24, 25, 26, 29
- [x] Add quasi-cash financial (6050, 6051): all 29 cards
- [x] Add securities (6211): DBS, Citi, UOB, OCBC, SC, BOC — same card list as real estate
- [x] Add charitable/religious/political orgs (8398, 8651, 8661): all 29 cards
- [x] Add gambling (7995): UOB, OCBC, HSBC, SC, BOC confirmed — Amex/DBS/Citi/Maybank omitted (unconfirmed)
- [x] Add cleaning/janitorial (7349): DBS (Dec 2025), UOB, OCBC, HSBC, SC, Maybank (Dec 2025), BOC (Jul 2025)
- [x] Add direct marketing insurance (5960): DBS, Citi, HSBC, BOC, Maybank

---

## Post-Correction: Recommended UI Messaging Per Subcategory

| Bills Subcategory | UI Message |
|---|---|
| Utilities | "Utility payments (SP Services, Geneco) earn 0 miles on all major bank cards. No recommendation available." |
| Education | "School fee payments earn 0 miles on DBS, Citi, UOB, OCBC, HSBC, SC, and BOC cards." |
| Hospitals | "Hospital bill payments earn 0 miles on most cards. HSBC and Amex cards earn base rate at private hospitals." |
| Insurance | "Insurance premiums earn 0 miles on all cards." |
| Parking | "Parking payments (MCC 7523) earn 0 miles on most cards including UOB, DBS, Citi, OCBC, HSBC, SC." |
| Pharmacy | "Standalone pharmacies (Guardian, Watsons, Unity) earn base rate miles. Hospital pharmacies (SingHealth, NHG) earn 0 miles." |
| GrabPay top-up | "GrabPay wallet top-ups earn 0 miles. Only the downstream merchant spend earns miles." |

---

*Document version: 1.1 | Phase 1 applied in v1.5.0 | Phase 2 applied in v1.7.0 (2026-03-01) | Related: DATA_CORRECTION_PLAN.md, all_cards.sql*
