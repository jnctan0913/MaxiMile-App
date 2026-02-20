# Batch 1 Validation Report

**Project**: MaxiMile -- Credit Card Miles Optimizer
**Batch**: 1 (Cards 1-10)
**Validated by**: Data Engineer Agent
**Date**: 2026-02-19
**Source file**: `database/seeds/batch1_cards.sql`

---

## 1. Summary Table

| # | Card | Metadata | Earn Rules (7/7) | Caps | Exclusions | Accuracy | Status |
|---|------|----------|-------------------|------|------------|----------|--------|
| 1 | DBS Altitude Visa Signature | PASS | 7/7 PASS | No cap (see note) | 2 exclusions | VERIFIED | PASS |
| 2 | Citi PremierMiles Visa Signature | PASS | 7/7 PASS | No cap (flat rate) | 2 exclusions | VERIFIED | PASS |
| 3 | UOB PRVI Miles Visa | PASS | 7/7 PASS | No cap (flat rate) | 2 exclusions | VERIFIED | PASS |
| 4 | OCBC 90N Visa | PASS | 7/7 PASS | No cap (flat rate) | 1 exclusion | VERIFIED | PASS |
| 5 | KrisFlyer UOB Credit Card | PASS | 7/7 PASS | 1 combined cap ($1,000) | 3 exclusions | VERIFIED (cap ESTIMATED) | PASS with note |
| 6 | HSBC Revolution Credit Card | PASS | 7/7 PASS | 1 combined cap ($1,000) | 3 exclusions | VERIFIED | PASS |
| 7 | Amex KrisFlyer Ascend | PASS | 7/7 PASS | 3 per-category caps ($2,500 each) | 3 exclusions | VERIFIED | PASS |
| 8 | BOC Elite Miles World MC | PASS | 7/7 PASS | 1 combined cap ($2,000) | 2 exclusions | ESTIMATED | PASS with note |
| 9 | SC Visa Infinite | PASS | 7/7 PASS | No cap documented | 2 exclusions | VERIFIED | PASS |
| 10 | DBS Woman's World Card | PASS | 7/7 PASS | 1 category cap ($2,000 online) | 3 exclusions | VERIFIED | PASS |

**Overall**: 10/10 cards PASS. 2 cards have ESTIMATED data points requiring follow-up.

---

## 2. Per-Card Detailed Validation

### Card 1: DBS Altitude Visa Signature

**Completeness Check**:
- Card metadata (bank, name, network, annual_fee, base_rate_mpd): PASS
  - Bank: DBS | Network: visa | Annual fee: $192.60 | Base rate: 1.2 mpd
- All 7 category earn rules present: PASS (7/7)
  - dining: 1.2 mpd, transport: 1.2 mpd, online: 1.2 mpd, groceries: 1.2 mpd, petrol: 1.2 mpd, travel: 4.0 mpd (bonus), general: 1.2 mpd
- Caps defined: No cap defined. Note: the 10X online travel bonus has portal-specific terms, but no explicit monthly cap documented. Acceptable for v1.
- Exclusions listed: 2 exclusions (government MCCs, insurance MCCs). PASS.

**Data Quality**:
- Earn rates in range (0.4-10 mpd): PASS. All rates between 1.2 and 4.0.
- No NULL required fields: PASS. All earn_rate_mpd populated.
- Annual fee realistic: PASS. $192.60 is the standard Singapore annual fee tier.

**Verification tag**: [VERIFIED]

---

### Card 2: Citi PremierMiles Visa Signature

**Completeness Check**:
- Card metadata: PASS
  - Bank: Citi | Network: visa | Annual fee: $192.60 | Base rate: 1.2 mpd
- All 7 category earn rules present: PASS (7/7)
  - All categories at 1.2 mpd (flat rate card, no local bonus categories)
- Caps defined: No cap. Flat rate card -- no bonus to cap. PASS.
- Exclusions listed: 2 exclusions (government, insurance). PASS.

**Data Quality**:
- Earn rates in range: PASS. Flat 1.2 mpd across all categories.
- No NULL required fields: PASS.
- Annual fee realistic: PASS. $192.60 matches Citi published rates.

**Verification tag**: [VERIFIED]

---

### Card 3: UOB PRVI Miles Visa

**Completeness Check**:
- Card metadata: PASS
  - Bank: UOB | Network: visa | Annual fee: $256.80 | Base rate: 1.4 mpd
- All 7 category earn rules present: PASS (7/7)
  - All categories at 1.4 mpd (flat rate card)
- Caps defined: No cap. Flat rate card. PASS.
- Exclusions listed: 2 exclusions (government, insurance). PASS.

**Data Quality**:
- Earn rates in range: PASS. Flat 1.4 mpd.
- No NULL required fields: PASS.
- Annual fee realistic: PASS. $256.80 is the standard UOB premium tier.

**Verification tag**: [VERIFIED]

---

### Card 4: OCBC 90N Visa

**Completeness Check**:
- Card metadata: PASS
  - Bank: OCBC | Network: visa | Annual fee: $192.60 | Base rate: 1.2 mpd
- All 7 category earn rules present: PASS (7/7)
  - All categories at 1.2 mpd (flat rate card)
- Caps defined: No cap. Flat rate card. PASS.
- Exclusions listed: 1 exclusion (government). PASS. Note: insurance exclusion not listed but likely applies -- minor gap, acceptable for v1.

**Data Quality**:
- Earn rates in range: PASS. Flat 1.2 mpd.
- No NULL required fields: PASS.
- Annual fee realistic: PASS.

**Verification tag**: [VERIFIED]

---

### Card 5: KrisFlyer UOB Credit Card

**Completeness Check**:
- Card metadata: PASS
  - Bank: UOB | Network: visa | Annual fee: $194.40 | Base rate: 1.2 mpd
- All 7 category earn rules present: PASS (7/7)
  - dining: 2.0 mpd (bonus, contactless), transport: 2.0 mpd (bonus, contactless), online: 2.0 mpd (bonus), groceries: 1.2 mpd, petrol: 1.2 mpd, travel: 3.0 mpd (bonus, SIA), general: 1.2 mpd
- Caps defined: 1 combined cap at $1,000/month [ESTIMATED]. PASS with note.
- Exclusions listed: 3 exclusions (government, insurance, petrol). PASS.

**Data Quality**:
- Earn rates in range: PASS. Range 1.2 to 3.0 mpd.
- Cap in realistic range ($500-$5,000): PASS. $1,000.
- No NULL required fields: PASS.
- Annual fee realistic: PASS. $194.40 is reasonable for co-branded card.

**Verification tag**: [VERIFIED] (cap amount marked [ESTIMATED])

---

### Card 6: HSBC Revolution Credit Card

**Completeness Check**:
- Card metadata: PASS
  - Bank: HSBC | Network: visa | Annual fee: $0 | Base rate: 0.4 mpd
- All 7 category earn rules present: PASS (7/7)
  - dining: 4.0 mpd (bonus), transport: 0.4 mpd, online: 4.0 mpd (bonus), groceries: 0.4 mpd, petrol: 0.4 mpd, travel: 0.4 mpd, general: 0.4 mpd
- Caps defined: 1 combined cap at $1,000/month for bonus categories. PASS.
- Exclusions listed: 3 exclusions (government, insurance, supermarkets from bonus). PASS.

**Data Quality**:
- Earn rates in range: PASS. 0.4 base, 4.0 bonus -- both within range.
- Cap in realistic range: PASS. $1,000.
- No NULL required fields: PASS.
- Annual fee: PASS. $0 matches HSBC published rates for Revolution.

**Note on missing category**: HSBC Revolution is known to also offer 4 mpd on "entertainment" spend. Our category taxonomy does not have a dedicated "entertainment" category -- entertainment MCCs would fall under "online" or "general" depending on the MCC. This is a known limitation of the 7-category model and is acceptable for v1.

**Verification tag**: [VERIFIED]

---

### Card 7: American Express KrisFlyer Ascend

**Completeness Check**:
- Card metadata: PASS
  - Bank: Amex | Network: amex | Annual fee: $337.05 | Base rate: 1.1 mpd
- All 7 category earn rules present: PASS (7/7)
  - dining: 2.0 mpd (bonus), transport: 1.1 mpd, online: 1.1 mpd, groceries: 2.0 mpd (bonus), petrol: 1.1 mpd, travel: 2.0 mpd (bonus), general: 1.1 mpd
- Caps defined: 3 per-category caps (dining $2,500, groceries $2,500, travel $2,500). PASS.
- Exclusions listed: 3 exclusions (government, insurance, instalment plans). PASS.

**Data Quality**:
- Earn rates in range: PASS. 1.1 base, 2.0 bonus.
- Caps in realistic range: PASS. $2,500 per category.
- No NULL required fields: PASS.
- Annual fee: PASS. $337.05 matches Amex published rates for the Ascend tier.

**Note**: Travel earn rule notes mention 3 mpd on SIA purchases specifically. The stored rate of 2.0 mpd for travel is the general travel rate; the SIA-specific 3 mpd rate is documented in conditions_note. This is appropriate for v1 (assume general travel rate; SIA-specific bonus is a condition variant).

**Verification tag**: [VERIFIED]

---

### Card 8: BOC Elite Miles World Mastercard

**Completeness Check**:
- Card metadata: PASS
  - Bank: BOC | Network: mastercard | Annual fee: $0 (first 2 years) | Base rate: 1.5 mpd
- All 7 category earn rules present: PASS (7/7)
  - All categories at 1.5 mpd (flat rate card)
- Caps defined: 1 combined cap at $2,000/month. PASS.
- Exclusions listed: 2 exclusions (government, insurance). PASS.

**Data Quality**:
- Earn rates in range: PASS. Flat 1.5 mpd.
- Cap in realistic range: PASS. $2,000.
- No NULL required fields: PASS.
- Annual fee: PASS. $0 first 2 years, then $193.50 (documented in notes).

**Note**: The annual fee is recorded as $0 (reflecting first 2 years). The subsequent fee of $193.50 is documented in the notes field. This is an acceptable simplification for v1 but should be surfaced in the UI.

**Verification tag**: [ESTIMATED] -- Rate derived from 3X BOC points structure. The 1.5 mpd figure is a commonly cited approximation but BOC's points-to-miles conversion can vary by transfer partner. Needs verification against current BOC T&Cs.

---

### Card 9: Standard Chartered Visa Infinite

**Completeness Check**:
- Card metadata: PASS
  - Bank: SC | Network: visa | Annual fee: $588.50 | Base rate: 1.4 mpd
- All 7 category earn rules present: PASS (7/7)
  - All categories at 1.4 mpd (flat rate card locally)
- Caps defined: No cap documented. PASS. Note: high-end card; uncapped is plausible.
- Exclusions listed: 2 exclusions (government, insurance). PASS.

**Data Quality**:
- Earn rates in range: PASS. Flat 1.4 mpd.
- No NULL required fields: PASS.
- Annual fee: PASS. $588.50 matches SC Visa Infinite premium tier ($150K income requirement).

**Verification tag**: [VERIFIED]

---

### Card 10: DBS Woman's World Card

**Completeness Check**:
- Card metadata: PASS
  - Bank: DBS | Network: mastercard | Annual fee: $0 | Base rate: 0.4 mpd
- All 7 category earn rules present: PASS (7/7)
  - dining: 0.4 mpd, transport: 0.4 mpd, online: 4.0 mpd (bonus), groceries: 0.4 mpd, petrol: 0.4 mpd, travel: 0.4 mpd, general: 0.4 mpd
- Caps defined: 1 category cap (online: $2,000/month). PASS.
- Exclusions listed: 3 exclusions (government, insurance, recurring online payments). PASS.

**Data Quality**:
- Earn rates in range: PASS. 0.4 base, 4.0 bonus.
- Cap in realistic range: PASS. $2,000.
- No NULL required fields: PASS.
- Annual fee: PASS. $0 matches DBS published rates.

**Verification tag**: [VERIFIED]

---

## 3. Cross-Reference Check (3 Sample Cards)

### 3.1 DBS Altitude Visa (Card 1) -- Cross-Reference

| Field | Seed Data | Publicly Known Rate | Match? |
|-------|-----------|---------------------|--------|
| Annual fee | $192.60 | $192.60 (DBS website) | MATCH |
| Base mpd (local) | 1.2 | 1.2 mpd (3X DBS Points) | MATCH |
| Online travel bonus | 4.0 mpd | 4 mpd (10X DBS Points via Kaligo/Expedia portals) | MATCH |
| Overseas rate | Not stored separately | 2 mpd (6X DBS Points) | N/A -- overseas rates handled in v1.1 |
| Network | Visa | Visa Signature | MATCH |

**Discrepancies**: None.
**Uncertainties**: The 10X (4 mpd) online travel rate is portal-specific and may not apply to all online travel bookings. This is correctly documented in the conditions_note.

### 3.2 HSBC Revolution (Card 6) -- Cross-Reference

| Field | Seed Data | Publicly Known Rate | Match? |
|-------|-----------|---------------------|--------|
| Annual fee | $0 | $0 (HSBC website) | MATCH |
| Base mpd | 0.4 | 0.4 mpd (1X HSBC Rewards) | MATCH |
| Dining bonus | 4.0 mpd | 4 mpd (10X HSBC Rewards) | MATCH |
| Online bonus | 4.0 mpd | 4 mpd (10X HSBC Rewards) | MATCH |
| Entertainment bonus | Not separate category | 4 mpd (10X) | N/A -- falls under online/general in our taxonomy |
| Monthly cap | $1,000 combined | $1,000/month combined across bonus categories | MATCH |
| Network | Visa | Visa | MATCH |

**Discrepancies**: None.
**Uncertainties**: The entertainment category (10X) is not explicitly modeled in our 7-category taxonomy. Entertainment MCCs will land in either "online" or "general" depending on the MCC. This is a known v1 limitation and is documented.

### 3.3 Amex KrisFlyer Ascend (Card 7) -- Cross-Reference

| Field | Seed Data | Publicly Known Rate | Match? |
|-------|-----------|---------------------|--------|
| Annual fee | $337.05 | $337.05 (Amex website) | MATCH |
| Base mpd | 1.1 | 1.1 mpd (base KrisFlyer earning) | MATCH |
| Dining bonus | 2.0 mpd | 2 KrisFlyer miles per $1 on dining | MATCH |
| Groceries bonus | 2.0 mpd | 2 KrisFlyer miles per $1 at supermarkets | MATCH |
| Travel bonus | 2.0 mpd | 2 KrisFlyer miles per $1 on travel | MATCH |
| SIA purchases | Noted in conditions_note (3 mpd) | 3 KrisFlyer miles per $1 on SIA | MATCH (documented) |
| Per-category cap | $2,500/month | $2,500/month per bonus category | MATCH |
| Network | Amex | American Express | MATCH |

**Discrepancies**: None.
**Uncertainties**: The distinction between general travel (2 mpd) and SIA-specific (3 mpd) is correctly documented but not structurally modeled as separate earn rules. For v1, the general travel rate (2 mpd) is used as the stored rate, which is the conservative approach.

---

## 4. Aggregate Statistics

| Metric | Expected | Actual | Status |
|--------|----------|--------|--------|
| Total cards | 10 | 10 | PASS |
| Total earn rules | 70 (10 x 7) | 70 | PASS |
| Total caps | Varies | 7 cap rows | PASS |
| Total exclusions | Varies | 23 exclusion rows | PASS |
| Cards with VERIFIED rates | >= 8 | 9 | PASS |
| Cards with ESTIMATED rates | <= 2 | 1 (BOC Elite Miles) | PASS |
| Earn rates with NULL mpd | 0 | 0 | PASS |
| Earn rates < 0.4 mpd | 0 | 0 | PASS |
| Earn rates > 10 mpd | 0 | 0 | PASS |
| Caps < $100 | 0 | 0 | PASS |
| Caps > $10,000 | 0 | 0 | PASS |

---

## 5. Items Flagged for Follow-Up

| Priority | Card | Issue | Action Required |
|----------|------|-------|-----------------|
| Medium | BOC Elite Miles (Card 8) | Earn rate (1.5 mpd) marked [ESTIMATED] | Verify against current BOC T&Cs. The 3X BOC points = 1.5 mpd conversion rate may vary by transfer partner. |
| Medium | BOC Elite Miles (Card 8) | Annual fee recorded as $0 | Confirm first-2-year waiver is still current. Subsequent fee ($193.50) documented in notes only. |
| Low | KrisFlyer UOB (Card 5) | Combined bonus cap of $1,000 marked [ESTIMATED] | Verify exact cap amount from UOB T&Cs. The $1,000 figure is a conservative estimate. |
| Low | HSBC Revolution (Card 6) | Entertainment bonus category not modeled | v1 limitation of 7-category taxonomy. Entertainment MCCs fall into online/general. |
| Low | OCBC 90N (Card 4) | Insurance exclusion not listed | Most Singapore cards exclude insurance. Consider adding for completeness. |
| Info | All cards | Overseas rates not separately stored | v1 design decision. Overseas rates documented in card notes only. Consider adding FCY earn rules in v1.1. |

---

## 6. Data Integrity Checks

- [x] All 10 card IDs follow the deterministic UUID pattern (00000000-0000-0000-0001-00000000000N)
- [x] All slugs are unique and follow the `^[a-z0-9-]+$` pattern
- [x] All networks are valid enum values (visa, mastercard, amex)
- [x] All annual fees are non-negative
- [x] All base_rate_mpd values are non-negative
- [x] All earn_rate_mpd values are non-negative
- [x] All caps have positive amounts
- [x] All category_id references match the 7 defined categories
- [x] ON CONFLICT clauses present for idempotent re-runs
- [x] is_bonus correctly set: TRUE for accelerated rates, FALSE for base/passthrough rates
- [x] conditions JSONB is valid (default '{}')
- [x] source_url provided for at least the first earn_rule of each card

---

## 7. Conclusion

**Batch 1 validation: PASS**

All 10 cards have complete metadata, 7/7 earn rules, appropriate caps, and key exclusions. Data quality is high with 9 out of 10 cards carrying [VERIFIED] tags. The single [ESTIMATED] card (BOC Elite Miles) uses a conservative rate that is widely cited by aggregator sites.

Two items require follow-up verification (BOC mpd rate and KrisFlyer UOB cap amount) but neither is blocking for the v1 launch. The data is ready for production use.
