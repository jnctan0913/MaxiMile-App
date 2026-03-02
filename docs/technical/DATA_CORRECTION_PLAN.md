# Data Correction Plan — MaxiMile Earn Rules

**Document Type:** Technical Correction Plan
**Created:** 2026-03-01
**Author:** Analytics Advisor + PM review
**Status:** APPROVED FOR IMPLEMENTATION
**Triggered by:** MileLion 2026 gap analysis + base rate logic review

---

## Background

A full cross-verification of all 29 cards × 8 categories against MileLion's 2026 guide revealed two classes of errors:

1. **Data errors** — wrong earn rates that cause the recommendation engine to confidently recommend the wrong card
2. **Architectural gaps** — categories that are too coarsely modeled (bills bundles incompatible MCCs; missing education/medical/pharmacy)

---

## Base Rate Logic: Ground Truth

This is the correct mental model, established via MileLion research (2026):

| Scenario | Earn Rate | Notes |
|---|---|---|
| Standard category, bonus card, category IS in bonus list | Bonus rate (e.g., 4 mpd) | e.g., HSBC Rev on dining |
| Standard category, bonus card, category NOT in bonus list | Base rate (e.g., 0.4 mpd) | NOT zero — still earns base |
| Standard category, flat-rate card | Base rate (e.g., 1.2 mpd) | All eligible spend = flat rate |
| Explicitly excluded MCC | **0 mpd** | No points earned at all |

**The critical distinction: "not a bonus category" ≠ "excluded". Excluded means 0 mpd.**

### Universally Excluded MCCs (all major banks: DBS, Citi, UOB, OCBC, HSBC, SC, Amex)

| MCC | Category | Earn Rate |
|---|---|---|
| 4900 | Utilities (electricity, water, gas) | **0 mpd** |
| 6300, 6381, 6399 | Insurance premiums | **0 mpd** |
| 9211, 9222, 9311, 9399 | Government payments | **0 mpd** |
| 8211, 8220, 8249, 8299 | Education / school fees | **0 mpd** (all banks except Maybank) |
| 8062, 8011, 8021, 8099 | Hospitals / medical | **0 mpd** (DBS, UOB, Citi, SC, OCBC; HSBC/Amex/Maybank still earn) |

### Pharmacy Exception

MCC 5912 (Guardian, Watsons, Unity standalone) is **NOT excluded** by most banks — earns base rate.
Exception: Hospital-linked pharmacies (SingHealth, NHG) code as MCC 9399 (Government) = **0 mpd**.

---

## Part 1: P0 Data Corrections (Wrong Recommendations)

These errors directly cause the engine to recommend the wrong card. **Fix before next release.**

---

### Fix 1: Bills/Utilities — All 29 Cards

**Current state:** All 29 cards have `bills` earn_rate_mpd = their base_rate_mpd (e.g., BOC 1.5, SC Beyond 1.5, OCBC Voyage 1.3)
**Reality:** Utilities (MCC 4900) earns **0 mpd** on all major bank cards
**Impact:** Engine recommends "use BOC Elite for 1.5 mpd on bills" when user paying SP Services bill earns 0 mpd

**Correction:**
- Set bills `earn_rate_mpd = 0` for all 29 cards where utilities are confirmed excluded
- Add MCC 4900 to each card's exclusions table entry
- Update `conditions_note` to say: "Utilities (electricity, water) earn 0 mpd — excluded by bank. See subcategory for telco rates."

**Cards affected:** All 29 cards
**Exception:** Maybank Horizon (Card 16) may earn 0.16 mpd on utilities — needs confirmation before changing.

---

### Fix 2: Card 5 — KrisFlyer UOB Credit Card

**Current state:**
```
dining:    2.0 mpd, is_bonus=TRUE,  {"contactless": true}
transport: 2.0 mpd, is_bonus=TRUE,  {"contactless": true}
online:    2.0 mpd, is_bonus=TRUE,  {}
```

**Reality (MileLion):** KrisFlyer UOB earns **1.2 mpd flat** on all local spend EXCEPT SIA Group (3 mpd). There is NO 2 mpd contactless bonus for dining/transport/online on this card. This is specific to UOB Visa Signature (Card 22) and was incorrectly applied to Card 5.

**Correction:**
```
dining:    1.2 mpd, is_bonus=FALSE, {}
transport: 1.2 mpd, is_bonus=FALSE, {}
online:    1.2 mpd, is_bonus=FALSE, {}
```

**Cards affected:** Card 5 only
**Severity:** Critical — Card 5 is being over-recommended for dining, transport, online at 2 mpd vs its true 1.2 mpd

---

### Fix 3: Card 20 — UOB Preferred Platinum Visa (PPV)

**Current state:**
```
dining:    4.0 mpd, is_bonus=TRUE,  {"min_spend_monthly": 600}  ← correct
transport: 0.4 mpd, is_bonus=FALSE  ← WRONG
online:    0.4 mpd, is_bonus=FALSE  ← WRONG
```

**Reality (MileLion):** UOB PPV earns 10X UNI$ on ALL mobile contactless and online spend:
- Dining (contactless + online): 4 mpd ✓ (already in DB)
- **Transport via SimplyGo (contactless):** 4 mpd — MISSING
- **Online shopping:** 4 mpd — MISSING
- All under a combined $1,000/month cap with min spend $600/month

**Correction:**
```sql
-- Add transport bonus rule
('card-20', 'transport', 4.0, TRUE, '{"min_spend_monthly": 600, "contactless": true}',
 'Earn 4 mpd (10X UNI$) on mobile contactless transport incl. SimplyGo. Min spend $600/month. Cap $1,000/month shared with dining and online.', NULL),

-- Add online bonus rule
('card-20', 'online', 4.0, TRUE, '{"min_spend_monthly": 600}',
 'Earn 4 mpd (10X UNI$) on online spend. Min spend $600/month. Cap $1,000/month shared with dining and transport.', NULL),
```

Also update cap: dining cap entry from `dining` to `NULL` (combined cap across dining, transport, online)

**Cards affected:** Card 20 only
**Severity:** Critical — Card 20 being severely under-recommended for transport and online

---

### Fix 4: Card 6 — HSBC Revolution

**Issue A — Missing transport bonus (Revo Up promo):**

**Current state:** `transport: 0.4 mpd, is_bonus=FALSE`
**Reality:** Under Revo Up promo (extended to 31 March 2026), contactless transport earns 4 mpd.

```sql
-- Update transport to bonus rate
('card-06', 'transport', 4.0, TRUE, '{"contactless": true}',
 'Earn 4 mpd on contactless transport (Revo Up promo, valid to 31 Mar 2026). Cap $1,500/month shared. Reverts to 0.4 mpd after promo ends.', NULL),
```

**Issue B — Wrong cap amount:**

**Current state:** Cap = $1,000/month
**Reality:** Revo Up promo raised cap to $1,500/month (valid to 31 Mar 2026)

```sql
-- Update cap from $1,000 to $1,500
UPDATE caps SET monthly_cap_amount = 1500.00,
  notes = 'Revo Up promo cap $1,500/month across dining, online, transport bonus categories. Valid to 31 Mar 2026. Reverts to $1,000 after.'
WHERE card_id = 'card-06';
```

**NOTE:** Both fixes should be set with an expiry flag or reminder for April 2026 when the Revo Up promo ends.

---

### Fix 5: Card 7 — Amex KrisFlyer Ascend

**Current state:** `groceries: 2.0 mpd, is_bonus=TRUE`
**Reality:** Amex KrisFlyer Ascend earns **1.1 mpd (base rate)** at supermarkets. The 2 mpd bonus applies to **dining and travel only**.

```sql
-- Correct groceries to base rate
('card-07', 'groceries', 1.1, FALSE, '{}', NULL, NULL),
```

**Cards affected:** Card 7 only
**Severity:** Critical — Card 7 being over-recommended for groceries

---

## Part 2: P1 Corrections (Missing Data, Not Causing Wrong Winner)

---

### Fix 6: Telco Bonus Rules — Cards 6, 10, 18, 20

Cards that earn 4 mpd on **one-off online telco payments** (Singtel, StarHub, M1 billed directly to card — NOT recurring GIRO):

| Card | Current bills rate | Correct telco rate |
|---|---|---|
| Card 6: HSBC Revolution | 0.4 mpd base | **4 mpd** on one-off online telco |
| Card 10: DBS WWMC | 0.4 mpd base | **4 mpd** on one-off online telco |
| Card 18: Citi Rewards | 0.4 mpd base | **4 mpd** on one-off online telco |
| Card 20: UOB PPV | 0.4 mpd base | **4 mpd** on one-off online telco |

Implementation: Add a second earn_rule row for bills with `is_bonus=TRUE`:
```sql
('card-XX', 'bills', 4.0, TRUE, '{"telco_online": true, "recurring_excluded": true}',
 'Earn 4 mpd on one-off online telco payments (Singtel, StarHub, M1). Recurring GIRO/auto-debit excluded.', NULL),
```

---

## Part 3: Architectural Change — Bills Subcategory Expansion

### Current State (Problems)

The `bills` category bundles MCCs with fundamentally different earn behaviors:

```
Current bills MCCs: 4812, 4814, 4899, 4900, 6300, 6381, 6399, 4816
All earn: base_rate_mpd (WRONG)
```

### Proposed Bills Subcategories

Expand the `bills` category to include education, medical, and pharmacy MCCs. Add a subcategory picker in the UI so users select the specific bill type before getting a recommendation.

| Subcategory | MCCs | True earn on most cards | Exception |
|---|---|---|---|
| **Utilities** | 4900 | **0 mpd** | Maybank Horizon: 0.16 mpd |
| **Telco & Internet** | 4812, 4814, 4816, 4899 | Base rate / **4 mpd** (4 cards, one-off only) | — |
| **Insurance** | 6300, 6381, 6399 | **0 mpd** | — |
| **Education** | 8211, 8220, 8249, 8299 | **0 mpd** (DBS, Citi, UOB, OCBC, HSBC, SC, Amex) | Maybank Horizon: 0.16 mpd |
| **Medical / Hospital** | 8011, 8021, 8062, 8099 | **0 mpd** (DBS, UOB, Citi, SC, OCBC) | HSBC/Amex: base rate (private); Maybank: 0.16 mpd |
| **Pharmacy** | 5912 | **Base rate** (not excluded by most banks) | Hospital pharmacies (9399) = 0 mpd |

### Implementation Approach (Phase 1 — minimal code change)

1. **Expand MCCs** in the `bills` category definition:
   ```typescript
   // Add to bills MCCs in categories.ts:
   '8211', '8220', '8249', '8299',  // Education
   '8011', '8021', '8062', '8099',  // Medical/Hospital
   '5912',                           // Pharmacy (standalone)
   ```

2. **Add `subcategory` field** to earn_rules conditions JSONB:
   ```json
   { "subcategory": "utilities" }
   { "subcategory": "telco" }
   { "subcategory": "education" }
   { "subcategory": "medical" }
   { "subcategory": "pharmacy" }
   ```

3. **Add subcategory picker UI** to the bills recommendation screen:
   - Before showing recommendations, user selects bill type
   - UI routes to earn rules matching that subcategory
   - Each subcategory shows the correct earn rate

4. **Add earn rules per subcategory** for all 29 cards:
   - Utilities: 0 mpd for most cards
   - Education: 0 mpd for DBS/Citi/UOB/OCBC/HSBC/SC/Amex; 0.16 mpd Maybank Horizon
   - Medical: 0 mpd for DBS/UOB/Citi/SC/OCBC; base rate for HSBC/Amex (private); 0.16 mpd Maybank
   - Pharmacy: base_rate_mpd for all cards (not excluded)
   - Telco: base rate / 4 mpd on 4 cards for one-off online

### Bills Subcategory UI Wireframe

```
Bills
──────────────────────────────
What type of bill are you paying?

  [Utilities]  [Telco]  [Insurance]
  [Education]  [Medical]  [Pharmacy]

──────────────────────────────
Selected: Utilities

⚠️ Most banks exclude utility payments.
All cards earn 0 mpd on SP Services,
Geneco, and other utility providers.

No recommendation available — any card
earns the same (0 mpd) on utilities.

Exception: Maybank Horizon earns 0.16 mpd
(capped at 480 miles/month).
```

### Key Medical Sub-logic

For **Medical/Hospital** subcategory, note the MCC 8099 trick:
- Paying hospital bills via HealthHub, Health Buddy, or OneNUHS app → MCC 8099 (not 8062)
- MCC 8099 is treated as "online shopping" by Citi Rewards and DBS WWMC → **4 mpd**
- This should be surfaced as a tip in the Medical subcategory recommendation

---

## Implementation Sequence

| Phase | Sprint | Items | Effort | Status |
|---|---|---|---|---|
| **Phase 1** | Sprint 25 | Fix 1–5 (P0 data corrections) | 1–2 days SQL only | ✅ APPLIED in v1.4.0 |
| **Phase 1b** | Sprint 25 | Exclusions audit (Phase 2 of EXCLUSIONS_AUDIT.md) | 1 day | ✅ APPLIED in v1.5.0 |
| **Phase 2** | Sprint 26 | Fix 6 (telco bonus rules) | 1 day | ✅ APPLIED in v1.6.0 |
| **Phase 3** | Sprint 27 | Bills subcategory expansion (MCCs + earn rules) | 3–5 days | ✅ APPLIED in v1.7.0 |
| **Phase 4** | Sprint 28 | Bills subcategory UI picker + routing | 3–5 days | ⏳ Pending |

---

## Verification Checklist (Post-Fix)

After each phase, verify:
- [x] Bills recommendation returns 0 mpd (or near-0) for a test user paying utilities *(v1.4.0)*
- [x] Card 5 KrisFlyer UOB no longer appears top-3 for dining (should be ~1.2 mpd, beaten by 4 mpd cards) *(v1.4.0)*
- [x] Card 20 UOB PPV appears in top-3 for transport and online (4 mpd, was missing) *(v1.4.0)*
- [x] Card 6 HSBC Revolution appears in top-3 for transport (4 mpd contactless, Revo Up promo) *(v1.4.0)*
- [x] Card 7 Amex Ascend no longer top for groceries (should be 1.1 mpd) *(v1.4.0)*
- [x] Cards 6, 10, 18, 20 appear in top-3 for telco bills subcategory (4 mpd one-off online) *(v1.7.0 — subcategory data seeded; UI pending Sprint 28)*
- [x] Pharmacy subcategory returns base rate recommendations (not 0) *(v1.7.0)*
- [x] Education subcategory returns 0 mpd for DBS/Citi/UOB; 0.16 mpd for Maybank Horizon *(v1.7.0)*

---

## Related Documents

- `maximile-app/database/seeds/all_cards.sql` — source of truth to be corrected
- `docs/technical/RECOMMENDATION_AND_CATEGORY_LOGIC.md` — recommendation engine logic
- `maximile-app/constants/categories.ts` — category MCC definitions
- `docs/planning/ANALYTICS_PLAN.md` — tracks data quality as a KPI

---

*Document version: 1.2 | Last updated: 2026-03-01 | Phases 1, 1b, 2, 3 applied (v1.4.0–v1.7.0) | Phase 4 pending Sprint 28*
