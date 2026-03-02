# Card Recommendation Rankings by Category

> Last updated: 2026-03-03 (MileLion March 2026 Audit — Sprint 29) | Source of truth: Supabase `earn_rules` table + `recommend()` RPC
> Total cards: 30 (29 unique + SC Smart Card) | Total categories: 8 | Bills subcategories: 6

---

## Quick Reference: Best Card Per Category

| Category | Best Card(s) | Best MPD | Conditions |
|---|---|---:|---|
| **Dining** | HSBC Revolution / OCBC Titanium / UOB Visa Signature / UOB Preferred Platinum / UOB Lady's Solitaire / Maybank XL Rewards | 4.0 | Various caps and conditions. HSBC cap: $1,500/mo |
| **Transport** | UOB Visa Signature / UOB Preferred Platinum | 4.0 | Contactless + min spend $1,000/mo (Visa Sig) / min spend $600/mo (PP) |
| **Online** | HSBC Revolution / DBS Woman's World / OCBC Titanium / Citi Rewards / UOB Lady's Card / Maybank XL Rewards | 4.0 | HSBC cap: $1,500/mo. DBS WWC cap: $1,000/mo |
| **Groceries** | UOB Visa Signature / UOB Lady's Solitaire / UOB Lady's Card | 4.0 | Contactless + min spend $1,000/mo (Visa Sig) / user-selectable (Solitaire/Lady's) |
| **Petrol** | Maybank World Mastercard / UOB Visa Signature / UOB Lady's Solitaire | 4.0 | Uncapped, no min spend (Maybank) / min spend $1,000/mo (UOB) / user-selectable Transport (Solitaire) |
| **Travel** | HSBC Revolution / Maybank XL Rewards / UOB Lady's Solitaire | 4.0 | Direct booking only (HSBC, cap $1,500/mo) / min spend $500/mo (Maybank XL) / user-selectable (Solitaire) |
| **General** | UOB Visa Signature / Citi Rewards / UOB Lady's Card / UOB Lady's Solitaire | 4.0 | Contactless + min spend (Visa Sig) / various |
| **Bills > Telco** | DBS Woman's World / Citi Rewards | 4.0 | Pay online / in app (not recurring). DBS WWC cap: $1,000/mo |
| **Bills > Pharmacy** | HSBC Revolution / OCBC Titanium / UOB Lady's Card | 4.0 | Contactless (HSBC, cap $1,500/mo) / user-selectable (UOB) |
| **Bills > Hospital** | Citi Rewards / DBS Woman's World / HSBC Revolution (via HealthHub) | 4.0 | Pay via HealthHub app. DBS WWC cap: $1,000/mo. HSBC cap: $1,500/mo |
| **Bills > Utilities** | None -- all excluded | 0.0 | Universal exclusion |
| **Bills > Education** | Maybank cards (4) | 0.16 | TreatsPoints conversion |
| **Bills > Insurance** | Not yet modeled | -- | -- |

---

## 1. Dining

Top cards ranked by miles per dollar (mpd) for restaurant, cafe, food delivery, and bar spending (MCCs 5811-5814).

| Rank | Card | Bank | MPD | Conditions | Cap |
|---:|---|---|---:|---|---|
| 1 | HSBC Revolution Credit Card | HSBC | 4.0 | 10X HSBC rewards. MCC 5814 (fast food) excluded. | $1,500/mo shared |
| 2 | OCBC Titanium Rewards Card | OCBC | 4.0 | 10X OCBC$ | $1,000/mo shared |
| 3 | UOB Visa Signature | UOB | 4.0 | Contactless + min spend $1,000/mo | $1,200/mo shared |
| 4 | UOB Preferred Platinum Visa | UOB | 4.0 | Min spend $600/mo | $1,000/mo |
| 5 | UOB Lady's Solitaire | UOB | 4.0 | User-selectable (choose 2 of 7 categories) | $750/mo per category |
| 6 | Maybank XL Rewards | Maybank | 4.0 | Min spend $500/mo. Age 21-39 only. | $1,000/mo shared |
| 7 | SC X Credit Card | SC | 3.3 | Min spend $500/mo | $2,000/mo shared |
| 8 | Amex KrisFlyer Ascend | Amex | 2.0 | -- | $2,500/mo |
| 9 | KrisFlyer UOB Credit Card | UOB | 2.0 | Contactless required | $1,000/mo shared |
| 10 | Maybank Horizon Visa Signature | Maybank | 1.6 | Min spend $300/mo | $1,500/mo shared |
| 11 | Maybank FC Barcelona Visa Sig. | Maybank | 1.6 | Min spend $300/mo | $1,500/mo shared |
| 12 | BOC Elite Miles World Mastercard | BOC | 1.5 | Base rate | $2,000/mo |
| 13 | DBS Vantage Visa Infinite | DBS | 1.5 | Min spend $2,000/mo (else 1.0 mpd) | None |
| 14 | SC Beyond Card | SC | 1.5 | Base rate | None |
| 15 | Amex KrisFlyer Credit Card | Amex | 1.5 | -- | $2,000/mo |
| 16 | HSBC Premier Mastercard | HSBC | 1.4 | Base rate | None |
| 17 | SC Visa Infinite | SC | 1.4 | Base rate | None |
| 18 | UOB PRVI Miles Visa | UOB | 1.4 | Base rate | None |
| 19 | OCBC Voyage Card | OCBC | 1.3 | Base rate | None |
| 20 | Citi PremierMiles Visa Signature | Citi | 1.2 | Base rate | None |
| 21 | DBS Altitude Visa Signature | DBS | 1.2 | Base rate | None |
| 22 | OCBC 90N Visa | OCBC | 1.2 | Base rate | None |
| 23 | SC Journey Card | SC | 1.2 | Base rate | None |
| 24 | KrisFlyer UOB Credit Card | UOB | 1.2 | Non-contactless fallback | None |
| 25 | HSBC TravelOne Credit Card | HSBC | 1.0 | Base rate | None |
| 26-30 | Remaining cards | Various | 0.4 | Base rate | None |

---

## 2. Transport

Top cards for taxis, ride-hailing (Grab/Gojek), public transport, parking (MCCs 4111-4789, 7512, 7523).

| Rank | Card | Bank | MPD | Conditions | Cap |
|---:|---|---|---:|---|---|
| 1 | UOB Visa Signature | UOB | 4.0 | Contactless + min spend $1,000/mo | $1,200/mo shared |
| 2 | UOB Preferred Platinum Visa | UOB | 4.0 | Contactless (SimplyGo) + min spend $600/mo | $1,000/mo shared |
| 3 | UOB Lady's Solitaire | UOB | 4.0 | User-selectable | $750/mo per category |
| 4 | SC X Credit Card | SC | 3.3 | Min spend $500/mo | $2,000/mo shared |
| 5 | SC Journey Card | SC | 3.0 | Online transport/food delivery only (Grab, foodpanda) | $1,000/mo shared |
| 6 | KrisFlyer UOB Credit Card | UOB | 2.4 | Contactless/SimplyGo. Requires $1,000/yr SIA spend. | Uncapped |
| 6 | BOC Elite Miles World Mastercard | BOC | 1.5 | Base rate | $2,000/mo |
| 7 | DBS Vantage Visa Infinite | DBS | 1.5 | Min spend $2,000/mo | None |
| 8 | SC Beyond Card | SC | 1.5 | Base rate | None |
| 9 | HSBC Premier Mastercard | HSBC | 1.4 | Base rate | None |
| 10 | SC Visa Infinite | SC | 1.4 | Base rate | None |
| 11 | UOB PRVI Miles Visa | UOB | 1.4 | Base rate | None |
| 12 | OCBC Voyage Card | OCBC | 1.3 | Base rate | None |
| 13-18 | Various (1.1-1.2 mpd base) | Various | 1.1-1.2 | Base rate | Various |
| 19-30 | Remaining cards | Various | 0.4 | Base rate | None |

---

## 3. Online Shopping

Top cards for e-commerce, subscriptions, digital goods (MCCs 5262-5969, 7372, 5816-5818).

| Rank | Card | Bank | MPD | Conditions | Cap |
|---:|---|---|---:|---|---|
| 1 | HSBC Revolution Credit Card | HSBC | 4.0 | 10X HSBC rewards | $1,500/mo shared |
| 2 | DBS Woman's World Card | DBS | 4.0 | 10X DBS Points | $1,000/mo |
| 3 | OCBC Titanium Rewards Card | OCBC | 4.0 | 10X OCBC$ | $1,000/mo shared |
| 4 | Citi Rewards Card | Citi | 4.0 | 10X ThankYou Points | $1,000/mo shared |
| 5 | UOB Lady's Card | UOB | 4.0 | Fashion/beauty/bags/shoes merchants only | $1,000/mo shared |
| 6 | Maybank XL Rewards | Maybank | 4.0 | Min spend $500/mo. Age 21-39 only. | $1,000/mo shared |
| 7 | SC X Credit Card | SC | 3.3 | Min spend $500/mo | $2,000/mo shared |
| 8 | KrisFlyer UOB Credit Card | UOB | 2.0 | -- | $1,000/mo shared |
| 9 | BOC Elite Miles World Mastercard | BOC | 1.5 | Base rate | $2,000/mo |
| 10 | DBS Vantage Visa Infinite | DBS | 1.5 | Min spend $2,000/mo | None |
| 11 | SC Beyond Card | SC | 1.5 | Base rate | None |
| 12 | HSBC Premier Mastercard | HSBC | 1.4 | Base rate | None |
| 13 | SC Visa Infinite | SC | 1.4 | Base rate | None |
| 14 | UOB PRVI Miles Visa | UOB | 1.4 | Base rate | None |
| 15 | OCBC Voyage Card | OCBC | 1.3 | Base rate | None |
| 16-20 | Various (1.0-1.2 mpd base) | Various | 1.0-1.2 | Base rate | Various |
| 21-30 | Remaining cards | Various | 0.4 | Base rate | None |

---

## 4. Groceries

Top cards for supermarkets, convenience stores (MCCs 5411-5499).

| Rank | Card | Bank | MPD | Conditions | Cap |
|---:|---|---|---:|---|---|
| 1 | UOB Visa Signature | UOB | 4.0 | Contactless + min spend $1,000/mo | $1,200/mo shared |
| 2 | UOB Lady's Solitaire | UOB | 4.0 | User-selectable (Family category) | $750/mo per category |
| 3 | UOB Lady's Card | UOB | 4.0 | User-selectable (Beauty & Wellness covers grocery MCCs) | $1,000/mo shared |
| 4 | SC X Credit Card | SC | 3.3 | Min spend $500/mo | $2,000/mo shared |
| 5 | SC Journey Card | SC | 3.0 | Online grocery delivery only | $1,000/mo shared |
| 6 | Amex KrisFlyer Ascend | Amex | 2.0 | -- | $2,500/mo |
| 6 | BOC Elite Miles World Mastercard | BOC | 1.5 | Base rate | $2,000/mo |
| 7 | DBS Vantage Visa Infinite | DBS | 1.5 | Min spend $2,000/mo | None |
| 8 | SC Beyond Card | SC | 1.5 | Base rate | None |
| 9 | HSBC Premier Mastercard | HSBC | 1.4 | Base rate | None |
| 10 | SC Visa Infinite | SC | 1.4 | Base rate | None |
| 11 | UOB PRVI Miles Visa | UOB | 1.4 | Base rate | None |
| 12 | OCBC Voyage Card | OCBC | 1.3 | Base rate | None |
| 13-18 | Various (1.0-1.2 mpd base) | Various | 1.0-1.2 | Base rate | Various |
| 19-30 | Remaining cards | Various | 0.4 | Base rate | None |

---

## 5. Petrol

Top cards for petrol stations (MCCs 5541, 5542, 5983).

| Rank | Card | Bank | MPD | Conditions | Cap |
|---:|---|---|---:|---|---|
| 1 | Maybank World Mastercard | Maybank | 4.0 | **Uncapped, no min spend** -- best petrol card | None |
| 2 | UOB Visa Signature | UOB | 4.0 | Min spend $1,000/mo (no contactless needed for petrol) | $1,200/mo shared |
| 3 | UOB Lady's Solitaire | UOB | 4.0 | User-selectable (Transport category includes petrol MCCs) | $750/mo per category |
| 4 | SC X Credit Card | SC | 3.3 | Min spend $500/mo | $2,000/mo shared |
| 4 | Maybank Horizon Visa Signature | Maybank | 1.6 | Min spend $300/mo | $1,500/mo shared |
| 5 | Maybank FC Barcelona Visa Sig. | Maybank | 1.6 | Min spend $300/mo | $1,500/mo shared |
| 6 | BOC Elite Miles World Mastercard | BOC | 1.5 | Base rate | $2,000/mo |
| 7 | DBS Vantage Visa Infinite | DBS | 1.5 | Min spend $2,000/mo | None |
| 8 | SC Beyond Card | SC | 1.5 | Base rate | None |
| 9 | HSBC Premier Mastercard | HSBC | 1.4 | Base rate | None |
| 10 | SC Visa Infinite | SC | 1.4 | Base rate | None |
| 11 | UOB PRVI Miles Visa | UOB | 1.4 | Base rate | None |
| 12 | OCBC Voyage Card | OCBC | 1.3 | Base rate | None |
| 13-18 | Various (1.0-1.2 mpd base) | Various | 1.0-1.2 | Base rate | Various |
| 19-30 | Remaining cards | Various | 0.4 | Base rate | None |

---

## 6. Travel

Top cards for airlines, hotels, travel agencies (MCCs 3000-3299, 3501-3505, 4411, 4511, 4722, 7011, 7991).

| Rank | Card | Bank | MPD | Conditions | Cap |
|---:|---|---|---:|---|---|
| 1 | HSBC Revolution Credit Card | HSBC | 4.0 | Direct airline/hotel/car rental/cruise bookings only (contactless). OTAs (Expedia, Airbnb) NOT eligible. | $1,500/mo shared |
| 2 | Maybank XL Rewards | Maybank | 4.0 | Min spend $500/mo. Age 21-39 only. | $1,000/mo shared |
| 3 | UOB Lady's Solitaire | UOB | 4.0 | User-selectable | $750/mo per category |
| 4 | KrisFlyer UOB Credit Card | UOB | 3.0 | SIA merchant only | $1,000/mo shared |
| 5 | Amex KrisFlyer Ascend | Amex | 2.0 | -- (3 mpd on SIA) | $2,500/mo |
| 6 | Amex KrisFlyer Credit Card | Amex | 2.0 | SIA merchant only (1.1 on other travel) | $2,000/mo |
| 7 | Maybank Horizon Visa Signature | Maybank | 1.6 | Min spend $300/mo | $1,500/mo shared |
| 8 | Maybank FC Barcelona Visa Sig. | Maybank | 1.6 | Min spend $300/mo | $1,500/mo shared |
| 9 | BOC Elite Miles World Mastercard | BOC | 1.5 | Base rate | $2,000/mo |
| 10 | DBS Vantage Visa Infinite | DBS | 1.5 | Min spend $2,000/mo | None |
| 11 | SC Beyond Card | SC | 1.5 | Base rate | None |
| 12 | HSBC Premier Mastercard | HSBC | 1.4 | Base rate | None |
| 13 | SC Visa Infinite | SC | 1.4 | Base rate | None |
| 14 | UOB PRVI Miles Visa | UOB | 1.4 | Base rate | None |
| 15 | OCBC Voyage Card | OCBC | 1.3 | Base rate | None |
| 16 | DBS Altitude Visa Signature | DBS | 1.2 | Base rate (travel bonus removed — previously 4 mpd via online portal) | None |
| 17-20 | Various (1.0-1.2 mpd base) | Various | 1.0-1.2 | Base rate | Various |
| 21-30 | Remaining cards | Various | 0.4 | Base rate | None |

---

## 7. General

Top cards for all other spending not covered by specific categories.

| Rank | Card | Bank | MPD | Conditions | Cap |
|---:|---|---|---:|---|---|
| 1 | UOB Visa Signature | UOB | 4.0 | Contactless + min spend $1,000/mo | $1,200/mo shared |
| 2 | Citi Rewards Card | Citi | 4.0 | Department stores, fashion/retail only | $1,000/mo shared |
| 3 | UOB Lady's Card | UOB | 4.0 | Fashion/beauty/bags/shoes only | $1,000/mo shared |
| 4 | UOB Lady's Solitaire | UOB | 4.0 | User-selectable (Fashion, Beauty & Wellness, Entertainment) | $750/mo per category |
| 5 | BOC Elite Miles World Mastercard | BOC | 1.5 | Base rate | $2,000/mo |
| 6 | DBS Vantage Visa Infinite | DBS | 1.5 | Min spend $2,000/mo | None |
| 7 | SC Beyond Card | SC | 1.5 | Base rate | None |
| 8 | HSBC Premier Mastercard | HSBC | 1.4 | Base rate | None |
| 9 | SC Visa Infinite | SC | 1.4 | Base rate | None |
| 10 | UOB PRVI Miles Visa | UOB | 1.4 | Base rate | None |
| 11 | OCBC Voyage Card | OCBC | 1.3 | Base rate | None |
| 12-18 | Various (1.0-1.2 mpd base) | Various | 1.0-1.2 | Base rate | Various |
| 19-30 | Remaining cards | Various | 0.4 | Base rate | None |

---

## 8. Bills

Bills is a parent category with 6 subcategories. When a user selects Bills, the app shows subcategory tiles. Each subcategory has its own earn rules.

### How Bills Subcategory Recommendations Work

When a user selects a bills subcategory (e.g., Hospital), the app calls:

```sql
SELECT * FROM recommend('bills', 'hospital');
```

The `recommend()` function uses a **subcategory-aware base rate** for each card:

1. **`subcategory_base` CTE** -- looks up `earn_rules` where `category_id = 'bills'`, `is_bonus = FALSE`, and `conditions->>'subcategory' = <subcategory>`. This finds the subcategory-specific earn rate (e.g., 0.0 mpd for hospital exclusion).

2. **`COALESCE(sb.subcategory_base_rate, c.base_rate_mpd)`** -- if a subcategory rule exists, use it; otherwise fall back to the card's global base rate.

3. **Bonus rule filtering** -- only bonus rules matching the exact subcategory are considered (strict `CASE WHEN` matching prevents leakage from generic bills bonuses).

4. **Scoring** -- `score = earn_rate_mpd * cap_ratio`. Cards with 0.0 mpd (excluded) get score 0 and rank last.

### Key SQL (from `recommend.sql`)

```sql
-- Subcategory-specific base rate lookup
WITH subcategory_base AS (
  SELECT er.card_id, er.earn_rate_mpd AS subcategory_base_rate
  FROM earn_rules er
  WHERE er.category_id = p_category_id
    AND er.is_bonus = FALSE
    AND er.effective_to IS NULL
    AND (
      CASE WHEN p_subcategory IS NOT NULL
        THEN er.conditions->>'subcategory' = p_subcategory
        ELSE er.conditions->>'subcategory' IS NULL
      END
    )
)
-- Used in earn_rate_mpd calculation:
COALESCE(sb.subcategory_base_rate, c.base_rate_mpd)
```

---

### 8.1 Utilities (SP Group, Geneco, City Energy)

**Summary:** All 30 cards earn 0.0 mpd. Utility payments are universally excluded by every bank in Singapore. No credit card is recommended for utility bill payments from a miles perspective.

| Rank | Card | Bank | MPD |
|---:|---|---|---:|
| 1-30 | All cards | All banks | 0.0 |

**Recommendation shown to user:** "No card earns miles on utility payments. Consider paying via GIRO to avoid missing payment dates."

---

### 8.2 Telco (Singtel, StarHub, M1)

**Summary:** Two cards earn 4.0 mpd on telco bills when paid online or via app (not as recurring CC payment). Otherwise, base rates apply (best: 1.5 mpd).

**Important caveat:** Both bonus cards require payment via the telco provider's app or website. Setting up a recurring credit card payment will **not** earn 4 mpd — only one-off payments via app/online qualify.

#### Bonus cards (pay online / in app)

| Rank | Card | Bank | MPD | Note |
|---:|---|---|---:|---|
| 1 | DBS Woman's World Card | DBS | 4.0 | **Pay via app (not recurring).** Cap: $1,000/mo (shared with online) |
| 2 | Citi Rewards Card | Citi | 4.0 | **Pay online or via app (not recurring).** Cap: $1,000/mo shared with online |

#### Base rate cards

| Rank | Card | Bank | MPD | Note |
|---:|---|---|---:|---|
| 3 | BOC Elite Miles World Mastercard | BOC | 1.5 | Base rate |
| 4 | DBS Vantage Visa Infinite | DBS | 1.5 | Base rate |
| 5 | Standard Chartered Beyond Card | SC | 1.5 | Base rate |
| 6 | HSBC Premier Mastercard | HSBC | 1.4 | Base rate |
| 7 | Standard Chartered Visa Infinite | SC | 1.4 | Base rate |
| 8 | UOB PRVI Miles Visa | UOB | 1.4 | Base rate |
| 9 | OCBC VOYAGE Card | OCBC | 1.3 | Base rate |
| 10 | Citi PremierMiles Visa Signature | Citi | 1.2 | Base rate |
| 11 | DBS Altitude Visa Signature | DBS | 1.2 | Base rate |
| 12 | KrisFlyer UOB Credit Card | UOB | 1.2 | Base rate |
| 13 | OCBC 90N Visa | OCBC | 1.2 | Base rate |
| 14 | Standard Chartered Journey Card | SC | 1.2 | Base rate |
| 15 | Amex KrisFlyer Ascend | Amex | 1.1 | Base rate |
| 16 | Amex KrisFlyer Credit Card | Amex | 1.1 | Base rate |
| 17 | HSBC TravelOne Credit Card | HSBC | 1.0 | Base rate |
| 18-30 | Remaining 13 cards | Various | 0.4 | Base rate |

---

### 8.3 Pharmacy (Guardian, Watsons, Unity -- MCC 5912)

**Summary:** Several cards earn bonus rates on pharmacy purchases via contactless or category selection. HSBC Revolution, OCBC Titanium Rewards, and UOB Lady's Card all earn 4.0 mpd. Otherwise, base rates apply (best: 1.5 mpd).

**Important caveat:** Hospital-linked pharmacies (e.g., dispensary inside a hospital) code as MCC 9399 and earn 0 mpd. Only standalone pharmacies at MCC 5912 earn miles.

| Rank | Card | Bank | MPD | Note |
|---:|---|---|---:|---|
| 1 | HSBC Revolution Credit Card | HSBC | 4.0 | **Contactless only.** Cap: $1,500/mo shared |
| 2 | OCBC Titanium Rewards Card | OCBC | 4.0 | Cap: $1,000/mo shared |
| 3 | UOB Lady's Card | UOB | 4.0 | **User-selectable:** select Beauty & Wellness category. Cap: $1,000/mo |
| 4 | UOB Lady's Solitaire | UOB | 4.0 | **User-selectable:** select Beauty & Wellness category. Cap: $750/mo |
| 5 | BOC Elite Miles World Mastercard | BOC | 1.5 | Base rate |
| 6 | DBS Vantage Visa Infinite | DBS | 1.5 | Base rate |
| 7 | Standard Chartered Beyond Card | SC | 1.5 | Base rate |
| 8 | HSBC Premier Mastercard | HSBC | 1.4 | Base rate |
| 9-30 | Remaining cards | Various | 0.4-1.4 | Base rate |

---

### 8.4 Education (School fees -- MCCs 8211/8220/8241/8249/8299)

**Summary:** Nearly universally excluded. Only 4 Maybank cards earn a token 0.16 mpd via TreatsPoints conversion. All other banks exclude school fee payments entirely.

| Rank | Card | Bank | MPD | Note |
|---:|---|---|---:|---|
| 1 | Maybank FC Barcelona Visa Signature | Maybank | 0.16 | TreatsPoints conversion |
| 2 | Maybank Horizon Visa Signature | Maybank | 0.16 | TreatsPoints conversion |
| 3 | Maybank World Mastercard | Maybank | 0.16 | TreatsPoints conversion |
| 4 | Maybank XL Rewards Card | Maybank | 0.16 | TreatsPoints conversion |
| 5-30 | All other 26 cards | All other banks | 0.0 | Excluded |

---

### 8.5 Hospital (Hospital bills -- MCC 8062)

**Summary:** Most banks exclude hospital bill payments. Three cards earn 4.0 mpd via the HealthHub app (pays as MCC 8099 online). For private hospitals, HSBC and Amex cards earn their base rate directly.

#### Bonus cards (via HealthHub app -- public and private hospitals)

| Rank | Card | Bank | MPD | Note |
|---:|---|---|---:|---|
| 1 | Citi Rewards Card | Citi | 4.0 | Via HealthHub app. Cap: $1,000/mo shared with online |
| 2 | DBS Woman's World Card | DBS | 4.0 | Via HealthHub app. Cap: $1,000/mo (shared with online) |
| 3 | HSBC Revolution Credit Card | HSBC | 4.0 | Via HealthHub app. Cap: $1,500/mo shared |

#### Base rate cards (private hospitals only)

| Rank | Card | Bank | MPD | Note |
|---:|---|---|---:|---|
| 4 | HSBC Premier Mastercard | HSBC | 1.4 | **Private hospital only** |
| 5 | Amex KrisFlyer Ascend | Amex | 1.1 | **Private hospital only** |
| 6 | Amex KrisFlyer Credit Card | Amex | 1.1 | **Private hospital only** |
| 7 | HSBC TravelOne Credit Card | HSBC | 1.0 | **Private hospital only** |
| 8 | HSBC Revolution Credit Card | HSBC | 0.4 | **Private hospital only** (base rate) |
| 9-12 | Maybank cards (4) | Maybank | 0.16 | Unverified |
| 13-30 | All other 21 cards | DBS, Citi, UOB, OCBC, SC, BOC | 0.0 | Excluded |

**HealthHub app workflow:** Download HealthHub -> log in with Singpass -> "Pay Hospital Bills" -> select hospital + enter bill ref -> pay with eligible card. Transaction codes as MCC 8099 (online), bypassing the MCC 8062 hospital exclusion.

---

### 8.6 Insurance

**Status:** Not yet modeled in the database. No subcategory-specific earn_rules exist. When queried, all cards fall back to their generic "bills" category rate (most cards earn 0.0 mpd on generic bills).

---

## Data Model

Subcategory earn rates are stored in the `earn_rules` table:

```
earn_rules
+-- card_id          UUID (FK -> cards.id)
+-- category_id      TEXT = 'bills'
+-- earn_rate_mpd    DECIMAL (e.g., 0.0 for excluded, 1.4 for HSBC Premier)
+-- is_bonus         BOOLEAN (FALSE = base-rate override, TRUE = bonus rule e.g. pharmacy/hospital)
+-- conditions       JSONB = {"subcategory": "hospital"}
+-- conditions_note  TEXT (human-readable explanation)
+-- effective_from   DATE
+-- effective_to     DATE (NULL = currently active)
```

Each card has up to 5 subcategory rows (utilities, telco, education, hospital, pharmacy) plus one generic bills row (no subcategory in conditions).

Bonus earn_rules (is_bonus = TRUE) are used for:
- **Telco:** DBS Woman's World (pay via app), Citi Rewards (pay online/via app)
- **Pharmacy:** HSBC Revolution (contactless), OCBC Titanium, UOB Lady's Card (user-selectable), UOB Lady's Solitaire (user-selectable)
- **User-selectable (Solitaire):** Dining, General, Groceries, Petrol, Transport, Travel — all 4.0 mpd, choose 2 of 7 UOB categories (Beauty & Wellness, Dining, Entertainment, Family, Fashion, Transport, Travel). Cap: $750/mo per category. Pharmacy gated by Beauty & Wellness selection.
- **Hospital:** Citi Rewards, DBS Woman's World, HSBC Revolution (via HealthHub)

Non-bills categories use standard earn_rules with `is_bonus = TRUE` for bonus rates and the card's `base_rate_mpd` as fallback.

---

## Scoring Formula

```
score = effective_earn_rate * cap_ratio

where:
  effective_earn_rate =
    bonus_rate       if bonus rule matches AND min_spend met AND user_selectable confirmed
    base_rate_mpd    otherwise (fallback)

  cap_ratio =
    1.0              if uncapped
    remaining / cap  if cap defined and partially used
    0.0              if cap exhausted
```

Cards are ranked by: score DESC, earn_rate_mpd DESC, card_name ASC.

---

## Migration History

| Migration | Description |
|---|---|
| `20260221080000` | Add 'bills' category and base-rate earn rules for all 20 cards |
| `20260301000000` | Bills subcategory expansion: utilities, education, medical, pharmacy, telco rules for all 29 cards |
| `20260302000002` | Fix recommend() COALESCE -- use subcategory base rate in CASE fallbacks |
| `20260302000003` | Remove user_settings dependency (accidentally overwrote COALESCE fix) |
| `20260303000000` | Rename 'medical' subcategory to 'hospital' |
| `20260303000001` | Add missing SC Smart Card (card 26) subcategory rules |
| `20260303000002` | Re-apply COALESCE fix overwritten by 20260302000003 |
| `20260303000003` | Fix Maybank Horizon utilities (0.40 -> 0.0), delete 32 duplicate bonus rules |
| `20260303000004` | Pharmacy bonus rules (4.0 mpd), hospital HealthHub bonus rules (4.0 mpd), "Private hospital only" tags |
| `20260303000005` | Telco bonus rules: DBS Woman's World + Citi Rewards at 4.0 mpd (pay online/via app) |
| `20260303000006` | Fix UOB Lady's Solitaire: condition key `selectable_category` → `user_selectable`, add missing groceries/transport/travel bonus rules, delete duplicate UOB Preferred Platinum groceries base row |
| `20260303000007` | Fix Solitaire pharmacy: remove user_selectable from pharmacy (later reverted by 000008) |
| `20260303000008` | Remap Solitaire to official UOB categories: revert pharmacy to user_selectable (Beauty & Wellness), delete online bonus, add petrol bonus (Transport includes petrol MCCs), update recommend() with UOB category name mapping |
| `20260303000009` | MileLion March 2026 Audit: Remove DBS Altitude travel bonus (4→1.2), update HSBC Rev cap notes ($1,500), update DBS WWC cap ($1,000), add UOB Lady's Card groceries (4 mpd), add HSBC Rev travel (4 mpd), add KrisFlyer UOB transport (2.4 mpd) |

---

## Card Reference (All 30 Cards)

| # | Card Name | Bank | Network | Base MPD | Annual Fee |
|---:|---|---|---|---:|---|
| 1 | DBS Altitude Visa Signature | DBS | Visa | 1.2 | $192.60 |
| 2 | Citi PremierMiles Visa Signature | Citi | Visa | 1.2 | $192.60 |
| 3 | UOB PRVI Miles Visa | UOB | Visa | 1.4 | $256.80 |
| 4 | OCBC 90N Visa | OCBC | Visa | 1.2 | $192.60 |
| 5 | KrisFlyer UOB Credit Card | UOB | Visa | 1.2 | $194.40 |
| 6 | HSBC Revolution Credit Card | HSBC | Visa | 0.4 | $0 |
| 7 | Amex KrisFlyer Ascend | Amex | Amex | 1.1 | $337.05 |
| 8 | BOC Elite Miles World Mastercard | BOC | Mastercard | 1.5 | $0 (2 yrs) |
| 9 | SC Visa Infinite | SC | Visa | 1.4 | $588.50 |
| 10 | DBS Woman's World Card | DBS | Mastercard | 0.4 | $0 |
| 11 | UOB Lady's Card | UOB | Visa | 0.4 | $0 |
| 12 | OCBC Titanium Rewards Card | OCBC | Visa | 0.4 | $0 (2 yrs) |
| 13 | HSBC TravelOne Credit Card | HSBC | Visa | 1.0 | $192.60 |
| 14 | Amex KrisFlyer Credit Card | Amex | Amex | 1.1 | $176.55 |
| 15 | SC X Credit Card | SC | Visa | 0.4 | $0 |
| 16 | Maybank Horizon Visa Signature | Maybank | Visa | 0.4 | $0 (1st yr) |
| 17 | Maybank FC Barcelona Visa Signature | Maybank | Visa | 0.4 | $0 |
| 18 | Citi Rewards Card | Citi | Visa | 0.4 | $0 |
| 19 | POSB Everyday Card | DBS/POSB | Visa | 0.4 | $0 |
| 20 | UOB Preferred Platinum Visa | UOB | Visa | 0.4 | $0 |
| 21 | Maybank World Mastercard | Maybank | Mastercard | 0.4 | $261.60 |
| 22 | UOB Visa Signature | UOB | Visa | 0.4 | $218.00 |
| 23 | DBS Vantage Visa Infinite | DBS | Visa | 1.0 | $599.50 |
| 24 | OCBC Voyage Card | OCBC | Visa | 1.3 | $497.06 |
| 25 | SC Journey Card | SC | Visa | 1.2 | $196.20 |
| 26 | SC Beyond Card | SC | Mastercard | 1.5 | $1,635.00 |
| 27 | HSBC Premier Mastercard | HSBC | Mastercard | 1.4 | $708.50 |
| 28 | Maybank XL Rewards | Maybank | Mastercard | 0.4 | $87.20 |
| 29 | UOB Lady's Solitaire | UOB | Mastercard | 0.4 | $414.20 |
| 30 | SC Smart Card | SC | Visa | 0.4 | $0 |
