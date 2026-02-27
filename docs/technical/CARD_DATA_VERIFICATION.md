# MaxiMile — Card Data Verification Document

> **Purpose**: This document presents ALL card data, categorization logic, and earn rate information used in the MaxiMile app for **subject matter expert (SME) verification**. Each data point should be checked against the referenced bank T&Cs.
>
> **Last Updated**: 2026-02-27 (Card Expansion — 29 cards across 7 banks)
> **Data As Of**: February 2026
> **Total Cards**: 29 Singapore miles credit cards
> **Total Categories**: 8 (dining, transport, online, groceries, petrol, travel, general, bills)
> **Source Files**: `maximile-app/database/seeds/all_cards.sql` (single source of truth)

---

## Table of Contents

1. [Data Accuracy Legend](#1-data-accuracy-legend)
2. [Category Taxonomy & MCC Mappings](#2-category-taxonomy--mcc-mappings)
3. [Known Data Discrepancies](#3-known-data-discrepancies)
4. [Card-by-Card Data Sheets](#4-card-by-card-data-sheets)
5. [Database Schema Overview](#5-database-schema-overview)
6. [Sources & References](#6-sources--references)
7. [SME Verification Checklist](#7-sme-verification-checklist)

---

## 1. Data Accuracy Legend

| Tag | Meaning | SME Action |
|-----|---------|------------|
| **[VERIFIED]** | Rate sourced from official bank T&Cs | Confirm still current |
| **[ESTIMATED]** | Conservative estimate from aggregator sites (MileLion, SingSaver, Suitesmile) | **Must verify** against bank T&Cs |

**Key assumptions in v1**:
- All earn_rate_mpd values represent **TOTAL** miles per dollar (not incremental over base)
- ~~All conditions (min spend, contactless, etc.) are **assumed to be met** per PRD~~ **Updated Sprint 22**: Min spend conditions are now **enforced** in the recommendation engine. Cards with `min_spend_monthly` in their `conditions` JSONB are downranked to `base_rate_mpd` when the user's effective monthly spend (higher of actual or estimated) does not meet the threshold. Contactless conditions are now surfaced via a dedicated `requires_contactless` badge in the recommendation UI (see Section 3.4).
- Only **local (SGD) spend** rates are modeled; overseas rates noted but not used in recommendations
- Banks may change rates at any time — periodic re-validation required

---

## 2. Category Taxonomy & MCC Mappings

MaxiMile uses **8 fixed spend categories** to classify transactions. Each category maps to specific Merchant Category Codes (MCCs) defined by Visa/Mastercard.

### 2.1 Category: Dining (ID: `dining`)

| Field | Value |
|-------|-------|
| Display Order | 1 |
| Icon | utensils |
| Description | Restaurants, cafes, bars, fast food, food delivery apps (when coded as dining) |

**MCC Codes**:
| MCC | Merchant Type |
|-----|--------------|
| 5811 | Caterers |
| 5812 | Eating Places, Restaurants |
| 5813 | Drinking Places (Bars, Taverns, Nightclubs) |
| 5814 | Fast Food Restaurants |

---

### 2.2 Category: Transport (ID: `transport`)

| Field | Value |
|-------|-------|
| Display Order | 2 |
| Icon | car |
| Description | Taxis, ride-hailing (Grab/Gojek), public transport, car rentals, parking |

**MCC Codes**:
| MCC | Merchant Type |
|-----|--------------|
| 4121 | Taxicabs / Limousines (Grab, Gojek, ComfortDelGro) |
| 4131 | Bus Lines |
| 4111 | Local / Suburban Commuter Passenger Transportation (MRT/LRT) |
| 4112 | Passenger Railways (KTM, etc.) |
| 4789 | Transportation Services (not elsewhere classified) |
| 7512 | Automobile Rental (car rental / car sharing) |
| 7523 | Parking Lots, Garages |

---

### 2.3 Category: Online Shopping (ID: `online`)

| Field | Value |
|-------|-------|
| Display Order | 3 |
| Icon | globe |
| Description | E-commerce (Shopee, Lazada, Amazon), online subscriptions, digital goods |

**MCC Codes**:
| MCC | Merchant Type |
|-----|--------------|
| 5262 | Marketplaces (online retail — general) |
| 5310 | Discount Stores (Shopee, Lazada when coded here) |
| 5311 | Department Stores |
| 5399 | General Merchandise (not elsewhere classified) |
| 5944 | Jewelry Stores (online) |
| 5945 | Hobby, Toy, and Game Shops |
| 5946 | Camera and Photographic Supply Stores |
| 5947 | Gift, Card, Novelty Shops |
| 5964 | Direct Marketing — Catalog Merchant |
| 5965 | Direct Marketing — Combination Catalog and Retail |
| 5966 | Direct Marketing — Outbound Telemarketing |
| 5967 | Direct Marketing — Inbound Teleservices |
| 5968 | Direct Marketing — Continuity / Subscription |
| 5969 | Direct Marketing — Not Elsewhere Classified |
| 7372 | Computer Programming, Data Processing (SaaS/digital) |
| 5818 | Digital Goods (large digital goods merchants) |
| 5816 | Digital Goods — Games |
| 5817 | Digital Goods — Applications (excl games) |

---

### 2.4 Category: Groceries (ID: `groceries`)

| Field | Value |
|-------|-------|
| Display Order | 4 |
| Icon | shopping-cart |
| Description | Supermarkets (FairPrice, Cold Storage, Sheng Siong), bakeries, specialty food stores |

**MCC Codes**:
| MCC | Merchant Type |
|-----|--------------|
| 5411 | Grocery Stores, Supermarkets (FairPrice, Cold Storage, Sheng Siong) |
| 5422 | Freezer and Locker Meat Provisioners |
| 5441 | Candy, Nut, Confectionery Stores |
| 5451 | Dairy Products Stores |
| 5462 | Bakeries |
| 5499 | Miscellaneous Food Stores (specialty, convenience) |

---

### 2.5 Category: Petrol (ID: `petrol`)

| Field | Value |
|-------|-------|
| Display Order | 5 |
| Icon | fuel |
| Description | Petrol stations (Shell, Esso, Caltex, SPC), fuel dispensers |

**MCC Codes**:
| MCC | Merchant Type |
|-----|--------------|
| 5541 | Service Stations (with or without ancillary services) |
| 5542 | Automated Fuel Dispensers (self-service petrol stations) |
| 5983 | Fuel Dealers (non-automotive — heating oil, LPG) |

---

### 2.6 Category: Travel (ID: `travel`)

| Field | Value |
|-------|-------|
| Display Order | 6 |
| Icon | plane |
| Description | Flights, hotels, cruises, travel agencies, tour bookings |

**MCC Codes**:
| MCC | Merchant Type |
|-----|--------------|
| 3000–3299 | Airlines (entire range — major airline codes) |
| 3501–3505 | Major hotel chains (Hilton, Marriott, etc.) |
| 7011 | Lodging — Hotels, Motels, Resorts |
| 4411 | Steamship / Cruise Lines |
| 4511 | Airlines, Air Carriers (direct airline purchases) |
| 4722 | Travel Agencies / Tour Operators |
| 7991 | Tourist Attractions and Exhibits |

---

### 2.7 Category: General (ID: `general`)

| Field | Value |
|-------|-------|
| Display Order | 7 |
| Icon | circle |
| Description | All other spending not classified in the above categories |
| MCC Codes | **Empty array** — catch-all for all MCCs not mapped to other categories |

---

### 2.8 Category: Bills (ID: `bills`)

| Field | Value |
|-------|-------|
| Display Order | 8 |
| Icon | file-text |
| Description | Utility bills, telco, insurance premiums, recurring payments |

**MCC Codes**:
| MCC | Merchant Type |
|-----|--------------|
| 4812 | Telecommunication Equipment and Telephone Sales |
| 4814 | Telecommunication Services (telco, broadband) |
| 4900 | Utilities — Electric, Gas, Water, Sanitary |
| 6300 | Insurance Sales, Underwriting, and Premiums |
| 6381 | Insurance Premiums (no longer classified) |
| 6399 | Insurance — Not Elsewhere Classified |

> **Note (Sprint 21)**: Insurance MCCs (6300, 6381, 6399) are commonly excluded from bonus earning across most cards. An insurance warning banner is displayed on the Bills recommendation screen to inform users that base rate only applies for insurance payments. All 29 cards have base-rate (0.4 mpd) earn rules for bills; no cards have bonus rates for this category.

---

### 2.9 How Categories Drive Earn Rates

```
User logs a transaction with amount + card + category
       ↓
System looks up earn_rules WHERE card_id = X AND category_id = Y AND is_bonus = TRUE
       ↓
If bonus rule found → use bonus earn_rate_mpd (check cap remaining)
If no bonus rule   → fallback to card.base_rate_mpd or is_bonus=FALSE rule
       ↓
miles_earned = amount × earn_rate_mpd
```

---

## 3. Known Data Discrepancies

> **SME: Please review these inconsistencies.**

### 3.1 ~~Critical Issue~~ **[RESOLVED — Sprint 21]**: `petrol` vs `bills` Category Conflict

> **Status**: RESOLVED (2026-02-26). **Option A was implemented** — both `petrol` and `bills` coexist as 8 total categories.

**Resolution summary**:
- **8 categories** now exist in both the database and frontend: dining, transport, online, groceries, petrol, travel, general, bills.
- All 29 cards have **base-rate earn rules for `bills`** (0.4 mpd or equivalent base rate).
- `petrol` retains all existing bonus earn rules (e.g., Maybank Horizon 1.6 mpd, SC X Card 3.3 mpd).
- `gas_station` Google Places type correctly maps to `petrol` in `merchant.ts`.
- **No bills sub-categories** were created. Bills is a single flat category with an **insurance warning banner** displayed on the Bills recommendation screen (see Section 3.2 item #1).
- `bills` was added to the AI scraper schema.
- Tests updated to expect 8 categories.

<details>
<summary>Original issue description (pre-resolution)</summary>

The system previously had two competing categories occupying the same display_order=5 slot. This was the result of an evolution during development:

**Timeline of the conflict**:
1. **Initial setup** (`001_initial_schema.sql`, `all_cards.sql`): Category 5 was defined as **`petrol`** (MCC: 5541, 5542, 5983 — petrol stations). All 20 cards had earn rules for `petrol`.
2. **Frontend development** (`constants/categories.ts`): The frontend was built with **`bills`** (utilities, insurance, telco) instead of `petrol`. No `petrol` category existed in the frontend.
3. **Migration 007** (`007_add_bills_category.sql`): A migration was created to add `bills` to the database because the recommend() RPC was rejecting `bills` as an invalid category.
4. **Resolution (Sprint 21)**: Option A implemented — both categories kept, expanded to 8 categories, base-rate earn rules added for `bills` across all 20 cards.

</details>

### 3.2 Secondary Discrepancies

| # | Issue | Severity | Status (Sprint 21) | Details | Files Affected |
|---|-------|----------|---------------------|---------|---------------|
| 1 | **Insurance MCCs overlap** | Medium | **MITIGATED** | MCC codes 6300, 6381, 6399 appear in both the `bills` category definition AND as common exclusions across all cards. Insurance payments match the category but are excluded from bonus earning on most cards. **Mitigation**: An insurance warning banner now displays on the Bills recommendation screen (`app/recommend/[category].tsx`) informing users that insurance payments earn base rate only. | `007_add_bills_category.sql`, all card exclusions, `app/recommend/[category].tsx` |
| 2 | **gas_station mapped to transport** | Medium | **RESOLVED** | `gas_station` Google Places type already correctly maps to `petrol` in `merchant.ts`. No further action needed. | `lib/merchant.ts` |
| 3 | **AI scraper missing `bills`** | Low | **RESOLVED** | `bills` has been added to the AI scraper schema and prompts. Both `petrol` and `bills` are now in the category enum. | `scraper/src/ai/schema.ts`, `scraper/src/ai/prompts.ts` |
| 4 | **Earn rules assume conditions met** | Low (v1 known limitation) | **RESOLVED (Sprint 22)** | ~~v1 assumes all conditions (min spend, contactless, etc.) are met.~~ **Sprint 22 (F31)**: Min spend conditions are now **enforced** in the `recommend()` RPC. Cards with `min_spend_monthly` in `conditions` JSONB are downranked to `base_rate_mpd` when the user's effective monthly spend does not meet the threshold. A `user_settings` table stores estimated monthly spend. The UI shows amber nudges ("Spend $X more to unlock bonus rate") and green checkmarks ("Min spend met"). Contactless conditions are now surfaced via a dedicated `requires_contactless` BOOLEAN column and blue UI badge (see Section 3.4). | `database/functions/recommend.sql`, `database/migrations/020_min_spend_enforcement.sql`, `app/spending-settings.tsx`, `app/recommend/[category].tsx`, `lib/supabase-types.ts` |
| 5 | **Test suite inconsistency** | Low | **RESOLVED** | Both `petrol` and `bills` exist as categories. Both test suites pass with 8 categories. | `tests/card-rules.test.ts:317`, `tests/merchant.test.ts:7` |

### 3.3 HSBC Revolution MCC 5814 Fast Food Exclusion (Sprint 21)

> **Added**: 2026-02-26 | **Card**: HSBC Revolution Credit Card | **Source**: MileLion analysis

During Sprint 21 data refinement, an exclusion was added to the `exclusions` table for HSBC Revolution:

| Field | Value |
|-------|-------|
| Card | HSBC Revolution (`00000000-0000-0000-0001-000000000006`) |
| Category | `dining` |
| Excluded MCC | `5814` (Fast Food Restaurants) |
| Description | Fast food restaurants (MCC 5814) excluded from 10X bonus on HSBC Revolution. Per MileLion analysis, fast food coded under MCC 5814 does not earn 4 mpd. |
| Reference | F32 — Condition Transparency |

**Impact**: Users selecting HSBC Revolution for dining will earn the base rate (0.4 mpd) at fast food restaurants, not the bonus 4 mpd. This exclusion is reflected in the `conditions_note` displayed on the card in the recommendation UI. MCC 5814 remains part of the `dining` category definition (it applies to other cards that do not exclude it).

**Source file**: `maximile-app/database/seeds/all_cards.sql` (Section 5: Exclusions, Card 6)

### 3.4 `conditions_note` Surfaced in Recommendation UI (Sprint 21)

> **Added**: 2026-02-26 | **Scope**: All cards with conditions | **Files**: `recommend.sql`, `app/recommend/[category].tsx`

The `conditions_note` field from the `earn_rules` table is now returned by the `recommend()` RPC function and displayed in the recommendation UI:

**Data flow**:
```
earn_rules.conditions_note (TEXT, per card per category)
       |
recommend() RPC function (database/functions/recommend.sql)
       |  -- conditions_note included in return type and SELECT
       |
RecommendationResult type (app/recommend/[category].tsx)
       |  -- conditions_note: string | null
       |
UI display:
  - Top pick card: conditions_note shown with info icon below the rate
  - Alternative cards: conditions_note shown as a single-line caption
```

**Examples of conditions surfaced**:
- "Earn 4 mpd on dining (10X HSBC rewards). Capped at $1,000/month across bonus categories."
- "Earn 3.3 mpd with min spend $500/month. Otherwise 0.4 mpd."
- "Earn 2 mpd on contactless dining transactions. Standard 1.2 mpd for non-contactless."

This partially mitigates Secondary Discrepancy #4 (earn rules assume conditions met) by making conditions visible to users. As of Sprint 22, min spend conditions are also **enforced in scoring** (see Section 3.5).

Additionally, the `recommend()` RPC now returns a `requires_contactless` BOOLEAN column, extracted from `earn_rules.conditions->>'contactless'`. When `TRUE`, the recommendation UI displays:
- **Top card**: A blue info badge "Requires contactless payment" (with wifi icon)
- **Alternative cards**: A blue caption "Contactless only"

This is informational only — scoring is not affected. The only card with `contactless: true` conditions is the **KrisFlyer UOB Credit Card** (Card 5), which requires contactless for its 2 mpd dining and transport bonuses.

### 3.5 Min Spend Condition Enforcement (Sprint 22 — F31)

> **Added**: 2026-02-26 | **Scope**: All cards with `min_spend_monthly` in `conditions` JSONB | **Files**: `recommend.sql`, `020_min_spend_enforcement.sql`, `spending-settings.tsx`, `[category].tsx`, `supabase-types.ts`

Sprint 22 resolved Secondary Discrepancy #4 by enforcing min spend conditions in the recommendation engine's scoring formula.

**Affected cards (8 of 29)**:

| Card | Min Spend Required | Bonus Rate | Base Rate (fallback) |
|------|-------------------|------------|---------------------|
| SC X Credit Card | $500/month | 3.3 mpd | 0.4 mpd |
| UOB Preferred Platinum Visa | $600/month | 4.0 mpd | 0.4 mpd |
| Maybank Horizon Visa Signature | $300/month | 1.6 mpd | 0.4 mpd |
| Maybank FC Barcelona Visa Sig. | $300/month | 1.6 mpd | 0.4 mpd |
| UOB Visa Signature | $1,000/month | 4.0 mpd | 0.4 mpd |
| DBS Vantage Visa Infinite | $2,000/month | 1.5 mpd | 1.0 mpd | **NEW — Card 23** |
| Maybank XL Rewards | $500/month | 4.0 mpd | 0.4 mpd | **NEW — Card 28** |

**Implementation**:

1. **`user_settings` table** (`020_min_spend_enforcement.sql`): Stores user's `estimated_monthly_spend`. RLS enforced — users can only read/write their own row.
2. **`recommend()` RPC** (`recommend.sql`): Extracts `min_spend_monthly` from `earn_rules.conditions` JSONB. Computes `effective_monthly_spend = GREATEST(actual_spend, estimated_spend)`. If effective spend < threshold, falls back to `base_rate_mpd` instead of bonus rate. Three new output columns: `min_spend_threshold`, `min_spend_met`, `total_monthly_spend`.
3. **Spending Settings screen** (`spending-settings.tsx`): User inputs estimated monthly card spend. Preset chips for common amounts ($300–$2,000). Impact preview shows which card bonuses are unlocked.
4. **Recommendation UI** (`[category].tsx`): Amber nudge when min spend not met ("Spend $X more to unlock bonus rate"). Green checkmark when met ("Min spend met — earning bonus rate").

**Scoring impact**:
```
Before (Sprint 21): score = earn_rate_mpd × cap_ratio  (always uses bonus rate)
After  (Sprint 22): score = effective_earn_rate × cap_ratio
  where effective_earn_rate = bonus rate IF min_spend_met, ELSE base_rate_mpd
```

This naturally downranks cards whose conditions are not met, preventing wrong recommendations (e.g., SC X Card at 3.3 mpd for a user spending $200/month).

---

## 4. Card-by-Card Data Sheets

### Card 1: DBS Altitude Visa Signature

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | DBS | |
| **Card Name** | DBS Altitude Visa Signature | |
| **Slug** | `dbs-altitude-visa` | |
| **Network** | Visa | |
| **Annual Fee** | S$192.60 | |
| **Base Rate** | 1.2 mpd | |
| **Data Status** | **[VERIFIED]** from DBS website | |
| **Notes** | Base 1.2 mpd local, 2 mpd overseas. 10X on online travel booking via specific portals. Annual fee often waivable. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | 1.2 | No (base) | — | — |
| Transport | 1.2 | No (base) | — | — |
| Online | 1.2 | No (base) | — | — |
| Groceries | 1.2 | No (base) | — | — |
| Petrol | 1.2 | No (base) | — | — |
| Travel | **4.0** | **Yes (bonus)** | Online travel portal required | Up to 10X DBS Points (4 mpd) for online travel bookings. Standard 1.2 mpd at travel agencies. |
| General | 1.2 | No (base) | — | — |

**Monthly Caps**: None documented.

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government-related transactions do not earn bonus DBS Points. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded from DBS Points earning. |

**Source URL**: https://www.dbs.com.sg/personal/cards/credit-cards/altitude-visa-signature-card

---

### Card 2: Citi PremierMiles Visa Signature

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | Citi | |
| **Card Name** | Citi PremierMiles Visa Signature | |
| **Slug** | `citi-premiermiles-visa` | |
| **Network** | Visa | |
| **Annual Fee** | S$192.60 | |
| **Base Rate** | 1.2 mpd | |
| **Data Status** | **[VERIFIED]** from Citi website | |
| **Notes** | No miles expiry. 1.2 mpd local, 2 mpd overseas. First year waiver often available. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | 1.2 | No (base) | — | — |
| Transport | 1.2 | No (base) | — | — |
| Online | 1.2 | No (base) | — | — |
| Groceries | 1.2 | No (base) | — | — |
| Petrol | 1.2 | No (base) | — | — |
| Travel | 1.2 | No (base) | — | Overseas travel spend earns 2 mpd. Local travel agencies earn 1.2 mpd. |
| General | 1.2 | No (base) | — | — |

**Monthly Caps**: None (flat rate, no bonus categories).

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government transactions excluded from Citi Miles earning. |
| Global | 6300, 6381, 6399 | Insurance | Insurance payments excluded. |

**Source URL**: https://www.citibank.com.sg/credit-cards/premiermiles-visa-signature/

---

### Card 3: UOB PRVI Miles Visa

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | UOB | |
| **Card Name** | UOB PRVI Miles Visa | |
| **Slug** | `uob-prvi-miles-visa` | |
| **Network** | Visa | |
| **Annual Fee** | S$256.80 | |
| **Base Rate** | 1.4 mpd | |
| **Data Status** | **[VERIFIED]** from UOB website | |
| **Notes** | 1.4 mpd local, 2.4 mpd overseas. No min spend for bonus. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | 1.4 | No (base) | — | — |
| Transport | 1.4 | No (base) | — | — |
| Online | 1.4 | No (base) | — | — |
| Groceries | 1.4 | No (base) | — | — |
| Petrol | 1.4 | No (base) | — | — |
| Travel | 1.4 | No (base) | — | Overseas travel spend earns 2.4 mpd. |
| General | 1.4 | No (base) | — | — |

**Monthly Caps**: None (flat rate).

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211 | Government | Government payments excluded. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |

**Source URL**: https://www.uob.com.sg/personal/cards/credit/prvi-miles-visa.page

---

### Card 4: OCBC 90°N Visa

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | OCBC | |
| **Card Name** | OCBC 90°N Visa | |
| **Slug** | `ocbc-90n-visa` | |
| **Network** | Visa | |
| **Annual Fee** | S$192.60 | |
| **Base Rate** | 1.2 mpd | |
| **Data Status** | **[VERIFIED]** from OCBC website | |
| **Notes** | 1.2 mpd local, 2.1 mpd overseas. Auto-transfer to KrisFlyer/Asia Miles. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | 1.2 | No (base) | — | — |
| Transport | 1.2 | No (base) | — | — |
| Online | 1.2 | No (base) | — | — |
| Groceries | 1.2 | No (base) | — | — |
| Petrol | 1.2 | No (base) | — | — |
| Travel | 1.2 | No (base) | — | Overseas travel spend earns 2.1 mpd. |
| General | 1.2 | No (base) | — | — |

**Monthly Caps**: None (flat rate).

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211 | Government | Government payments excluded. |

**Source URL**: https://www.ocbc.com/personal-banking/cards/90n-card

---

### Card 5: KrisFlyer UOB Credit Card

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | UOB | |
| **Card Name** | KrisFlyer UOB Credit Card | |
| **Slug** | `krisflyer-uob` | |
| **Network** | Visa | |
| **Annual Fee** | S$194.40 | |
| **Base Rate** | 1.2 mpd | |
| **Data Status** | **[VERIFIED]** from UOB website | |
| **Notes** | Direct KrisFlyer miles. Up to 3 mpd on selected spend. Contactless bonus available. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | **2.0** | **Yes (bonus)** | Contactless required | Earn 2 mpd on contactless dining transactions. Standard 1.2 mpd for non-contactless. |
| Transport | **2.0** | **Yes (bonus)** | Contactless required | Earn 2 mpd on contactless transport (Grab, taxis). Standard 1.2 mpd otherwise. |
| Online | **2.0** | **Yes (bonus)** | — | Earn 2 mpd on online spend. |
| Groceries | 1.2 | No (base) | — | — |
| Petrol | 1.2 | No (base) | — | — |
| Travel | **3.0** | **Yes (bonus)** | SIA merchant only | Earn 3 mpd on SIA purchases (flights, SIA website). 1.2 mpd on other travel. |
| General | 1.2 | No (base) | — | — |

**Monthly Caps**:
| Scope | Cap Amount | Cap Type | Notes | Status |
|-------|-----------|----------|-------|--------|
| All bonus categories (combined) | S$1,000/month | Spend | Combined cap across all bonus categories (contactless/online). | **[ESTIMATED]** |

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government payments excluded from KrisFlyer miles earning. |
| Global | 6300, 6381, 6399 | Insurance | Insurance payments excluded. |
| Petrol | 5541, 5542 | Petrol | Petrol transactions excluded from bonus earning. **[ESTIMATED]** |

**Source URL**: https://www.uob.com.sg/personal/cards/credit/krisflyer-uob-credit-card.page

---

### Card 6: HSBC Revolution Credit Card

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | HSBC | |
| **Card Name** | HSBC Revolution Credit Card | |
| **Slug** | `hsbc-revolution` | |
| **Network** | Visa | |
| **Annual Fee** | S$0 (no annual fee) | |
| **Base Rate** | 0.4 mpd | |
| **Data Status** | **[VERIFIED]** from HSBC website | |
| **Notes** | No annual fee. 4 mpd on dining, entertainment, online. 10X rewards on selected categories. Cap of $1,000/month on bonus. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | **4.0** | **Yes (bonus)** | — | Earn 4 mpd on dining (10X HSBC rewards). Capped at $1,000/month across bonus categories. |
| Transport | 0.4 | No (base) | — | — |
| Online | **4.0** | **Yes (bonus)** | — | Earn 4 mpd on online spend (10X HSBC rewards). Capped at $1,000/month across bonus categories. |
| Groceries | 0.4 | No (base) | — | — |
| Petrol | 0.4 | No (base) | — | — |
| Travel | 0.4 | No (base) | — | — |
| General | 0.4 | No (base) | — | — |

**Monthly Caps**:
| Scope | Cap Amount | Cap Type | Notes | Status |
|-------|-----------|----------|-------|--------|
| All bonus categories (combined) | S$1,000/month | Spend | Combined cap across dining, online, and entertainment bonus categories. | **[VERIFIED]** |

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government payments excluded from bonus. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |
| Dining | 5814 | Fast Food | Fast food restaurants (MCC 5814) excluded from 10X bonus. Per MileLion analysis, fast food coded under MCC 5814 does not earn 4 mpd. **(Sprint 21 — [F32])** |
| Groceries | 5411 | Supermarket | Supermarkets typically excluded from the 10X bonus categories. **[ESTIMATED]** |

**Source URL**: https://www.hsbc.com.sg/credit-cards/products/revolution/

---

### Card 7: American Express KrisFlyer Ascend

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | Amex | |
| **Card Name** | American Express KrisFlyer Ascend | |
| **Slug** | `amex-krisflyer-ascend` | |
| **Network** | Amex | |
| **Annual Fee** | S$337.05 | |
| **Base Rate** | 1.1 mpd | |
| **Data Status** | **[VERIFIED]** from Amex website | |
| **Notes** | Direct KrisFlyer miles. 1.1 mpd base, 2 mpd on dining/travel, 3 mpd on SIA purchases. Bonus capped at $2,500/month per category. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | **2.0** | **Yes (bonus)** | — | Earn 2 KrisFlyer miles per $1 on dining. Capped at $2,500/month. |
| Transport | 1.1 | No (base) | — | — |
| Online | 1.1 | No (base) | — | — |
| Groceries | **2.0** | **Yes (bonus)** | — | Earn 2 KrisFlyer miles per $1 at supermarkets. Capped at $2,500/month. |
| Petrol | 1.1 | No (base) | — | — |
| Travel | **2.0** | **Yes (bonus)** | — | Earn 2 KrisFlyer miles per $1 on travel. 3 mpd on SIA purchases. Capped at $2,500/month. |
| General | 1.1 | No (base) | — | — |

**Monthly Caps**:
| Scope | Cap Amount | Cap Type | Notes | Status |
|-------|-----------|----------|-------|--------|
| Dining | S$2,500/month | Spend | Per-category cap. | **[VERIFIED]** |
| Groceries | S$2,500/month | Spend | Per-category cap. | **[VERIFIED]** |
| Travel | S$2,500/month | Spend | Per-category cap. | **[VERIFIED]** |

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211 | Government | Government payments excluded. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |
| Global | — | Instalment | Instalment plan payments excluded from bonus miles. |

**Source URL**: https://www.americanexpress.com/sg/credit-cards/krisflyer-ascend-card/

---

### Card 8: BOC Elite Miles World Mastercard

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | BOC (Bank of China) | |
| **Card Name** | BOC Elite Miles World Mastercard | |
| **Slug** | `boc-elite-miles-world-mc` | |
| **Network** | Mastercard | |
| **Annual Fee** | S$0 (first 2 years; then $193.50) | |
| **Base Rate** | 1.5 mpd | |
| **Data Status** | **[ESTIMATED]** — rate derived from 3X BOC points structure; verify with BOC T&Cs | |
| **Notes** | Flat 1.5 mpd on all local spend, no category restriction. Cap at $2,000/month. No annual fee first 2 years. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | 1.5 | No (base) | — | — |
| Transport | 1.5 | No (base) | — | — |
| Online | 1.5 | No (base) | — | — |
| Groceries | 1.5 | No (base) | — | — |
| Petrol | 1.5 | No (base) | — | — |
| Travel | 1.5 | No (base) | — | — |
| General | 1.5 | No (base) | — | — |

**Monthly Caps**:
| Scope | Cap Amount | Cap Type | Notes | Status |
|-------|-----------|----------|-------|--------|
| All categories (combined) | S$2,000/month | Spend | Combined cap across all categories. | **[ESTIMATED]** |

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government transactions excluded. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |

**Source URL**: https://www.bankofchina.com/sg/pbservice/pb1/201803/t20180329_11814364.html

---

### Card 9: Standard Chartered Visa Infinite

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | SC (Standard Chartered) | |
| **Card Name** | Standard Chartered Visa Infinite | |
| **Slug** | `sc-visa-infinite` | |
| **Network** | Visa | |
| **Annual Fee** | S$588.50 (waivable) | |
| **Base Rate** | 1.4 mpd | |
| **Data Status** | **[VERIFIED]** from SC website | |
| **Notes** | Premium card. 1.4 mpd local, 3 mpd overseas. Income requirement $150K. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | 1.4 | No (base) | — | — |
| Transport | 1.4 | No (base) | — | — |
| Online | 1.4 | No (base) | — | — |
| Groceries | 1.4 | No (base) | — | — |
| Petrol | 1.4 | No (base) | — | — |
| Travel | 1.4 | No (base) | — | Overseas travel spend earns 3 mpd. |
| General | 1.4 | No (base) | — | — |

**Monthly Caps**: None documented for local spend.

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government transactions excluded from 360 reward points. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |

**Source URL**: https://www.sc.com/sg/credit-cards/visa-infinite/

---

### Card 10: DBS Woman's World Card

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | DBS | |
| **Card Name** | DBS Woman's World Card | |
| **Slug** | `dbs-womans-world-card` | |
| **Network** | Mastercard | |
| **Annual Fee** | S$0 (no annual fee) | |
| **Base Rate** | 0.4 mpd | |
| **Data Status** | **[VERIFIED]** from DBS website | |
| **Notes** | No annual fee. 4 mpd on online, 10X DBS points on online spend up to $2,000/month. 0.4 mpd on other spend. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | 0.4 | No (base) | — | — |
| Transport | 0.4 | No (base) | — | — |
| Online | **4.0** | **Yes (bonus)** | — | Earn 4 mpd (10X DBS Points) on online spend. Capped at $2,000/month. |
| Groceries | 0.4 | No (base) | — | — |
| Petrol | 0.4 | No (base) | — | — |
| Travel | 0.4 | No (base) | — | — |
| General | 0.4 | No (base) | — | — |

**Monthly Caps**:
| Scope | Cap Amount | Cap Type | Notes | Status |
|-------|-----------|----------|-------|--------|
| Online | S$2,000/month | Spend | Cap on 10X bonus for online spending. | **[VERIFIED]** |

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government payments excluded from DBS Points earning. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |
| Online | — | Recurring | Recurring online payments may not qualify for 10X bonus. **[ESTIMATED]** |

**Source URL**: https://www.dbs.com.sg/personal/cards/credit-cards/womans-card

---

### Card 11: UOB Lady's Card

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | UOB | |
| **Card Name** | UOB Lady's Card | |
| **Slug** | `uob-ladys-card` | |
| **Network** | Visa | |
| **Annual Fee** | S$0 (first year waived, subsequent often waivable) | |
| **Base Rate** | 0.4 mpd | |
| **Data Status** | **[VERIFIED]** from UOB website | |
| **Notes** | No annual fee. 10X UNI$ on beauty, fashion, bags/shoes (= 4 mpd). 0.4 mpd on other categories. Capped at $1,000/month. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | 0.4 | No (base) | — | — |
| Transport | 0.4 | No (base) | — | — |
| Online | **4.0** | **Yes (bonus)** | Fashion/beauty/bags/shoes merchants only | Earn 4 mpd (10X UNI$) on online fashion, beauty, bags and shoes merchants. Other online merchants earn 0.4 mpd. |
| Groceries | 0.4 | No (base) | — | — |
| Petrol | 0.4 | No (base) | — | — |
| Travel | 0.4 | No (base) | — | — |
| General | **4.0** | **Yes (bonus)** | Fashion/beauty/bags/shoes merchants only | Earn 4 mpd (10X UNI$) on in-store fashion, beauty, bags and shoes merchants. Other general merchants earn 0.4 mpd. |

**Monthly Caps**:
| Scope | Cap Amount | Cap Type | Notes | Status |
|-------|-----------|----------|-------|--------|
| All bonus categories (combined) | S$1,000/month | Spend | Combined cap across all 10X bonus categories (beauty, fashion, bags, shoes). | **[VERIFIED]** |

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government payments excluded from UNI$ earning. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |
| Global | — | Education | Education-related payments excluded from 10X bonus. **[ESTIMATED]** |

**Source URL**: https://www.uob.com.sg/personal/cards/credit/ladys-card.page

---

### Card 12: OCBC Titanium Rewards Card

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | OCBC | |
| **Card Name** | OCBC Titanium Rewards Card | |
| **Slug** | `ocbc-titanium-rewards` | |
| **Network** | Visa | |
| **Annual Fee** | S$0 (first 2 years, then $192.60) | |
| **Base Rate** | 0.4 mpd | |
| **Data Status** | **[VERIFIED]** from OCBC website | |
| **Notes** | No annual fee first 2 years. 10X OCBC$ on dining and online shopping (= 4 mpd). 1X OCBC$ on other spend (= 0.4 mpd). Capped at $1,000/month. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | **4.0** | **Yes (bonus)** | — | Earn 4 mpd (10X OCBC$) on dining. Capped at $1,000/month across bonus categories. |
| Transport | 0.4 | No (base) | — | — |
| Online | **4.0** | **Yes (bonus)** | — | Earn 4 mpd (10X OCBC$) on online shopping. Capped at $1,000/month across bonus categories. |
| Groceries | 0.4 | No (base) | — | — |
| Petrol | 0.4 | No (base) | — | — |
| Travel | 0.4 | No (base) | — | — |
| General | 0.4 | No (base) | — | — |

**Monthly Caps**:
| Scope | Cap Amount | Cap Type | Notes | Status |
|-------|-----------|----------|-------|--------|
| All bonus categories (combined) | S$1,000/month | Spend | Combined cap across dining and online shopping 10X bonus categories. | **[VERIFIED]** |

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government payments excluded from OCBC$ earning. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |
| Groceries | 5411 | Supermarket | Supermarkets typically excluded from the 10X bonus categories. **[ESTIMATED]** |

**Source URL**: https://www.ocbc.com/personal-banking/cards/titanium-rewards-card

---

### Card 13: HSBC TravelOne Credit Card

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | HSBC | |
| **Card Name** | HSBC TravelOne Credit Card | |
| **Slug** | `hsbc-travelone` | |
| **Network** | Visa | |
| **Annual Fee** | S$192.60 (waivable) | |
| **Base Rate** | 1.0 mpd | |
| **Data Status** | **[VERIFIED]** from HSBC website | |
| **Notes** | Flat-rate travel card. 1 mpd on local spend, 2.7 mpd on overseas spend. No category bonus locally. Good for overseas spenders. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | 1.0 | No (base) | — | — |
| Transport | 1.0 | No (base) | — | — |
| Online | 1.0 | No (base) | — | — |
| Groceries | 1.0 | No (base) | — | — |
| Petrol | 1.0 | No (base) | — | — |
| Travel | 1.0 | No (base) | — | Overseas travel spend earns 2.7 mpd. Local travel agencies earn 1 mpd. |
| General | 1.0 | No (base) | — | — |

**Monthly Caps**: None documented for local flat rate.

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government payments excluded. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |

**Source URL**: https://www.hsbc.com.sg/credit-cards/products/travelone/

---

### Card 14: American Express KrisFlyer Credit Card

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | Amex | |
| **Card Name** | American Express KrisFlyer Credit Card | |
| **Slug** | `amex-krisflyer-credit-card` | |
| **Network** | Amex | |
| **Annual Fee** | S$176.55 | |
| **Base Rate** | 1.1 mpd | |
| **Data Status** | **[VERIFIED]** from Amex website | |
| **Notes** | Entry-level KrisFlyer Amex. Direct KrisFlyer miles. 1.1 mpd base, 1.5 mpd on dining, 2 mpd on SIA purchases. Lower annual fee than Ascend. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | **1.5** | **Yes (bonus)** | — | Earn 1.5 KrisFlyer miles per $1 on dining. |
| Transport | 1.1 | No (base) | — | — |
| Online | 1.1 | No (base) | — | — |
| Groceries | 1.1 | No (base) | — | — |
| Petrol | 1.1 | No (base) | — | — |
| Travel | **2.0** | **Yes (bonus)** | SIA merchant only | Earn 2 KrisFlyer miles per $1 on SIA purchases. 1.1 mpd on other travel. |
| General | 1.1 | No (base) | — | — |

**Monthly Caps**:
| Scope | Cap Amount | Cap Type | Notes | Status |
|-------|-----------|----------|-------|--------|
| Dining | S$2,000/month | Spend | Cap on dining bonus. | **[ESTIMATED]** |
| Travel | S$2,000/month | Spend | Cap on travel/SIA bonus. | **[ESTIMATED]** |

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211 | Government | Government payments excluded. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |
| Global | — | Instalment | Instalment plan payments excluded from bonus miles. **[VERIFIED]** |

**Source URL**: https://www.americanexpress.com/sg/credit-cards/krisflyer-credit-card/

---

### Card 15: Standard Chartered X Credit Card

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | SC (Standard Chartered) | |
| **Card Name** | Standard Chartered X Credit Card | |
| **Slug** | `sc-x-card` | |
| **Network** | Visa | |
| **Annual Fee** | S$0 (no annual fee) | |
| **Base Rate** | 0.4 mpd | |
| **Data Status** | **[ESTIMATED]** — 3.3 mpd is the commonly cited top rate; SC uses tiered structure | |
| **Notes** | No annual fee. Targeted at young professionals (income req $30K). Up to 3.3 mpd on selected categories. Requires min spend $500/month to unlock bonus. Capped at $2,000/month. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | **3.3** | **Yes (bonus)** | Min spend $500/month | Earn 3.3 mpd with min spend $500/month. Otherwise 0.4 mpd. Capped at $2,000/month. **[ESTIMATED]** |
| Transport | **3.3** | **Yes (bonus)** | Min spend $500/month | Earn 3.3 mpd with min spend $500/month. Otherwise 0.4 mpd. **[ESTIMATED]** |
| Online | **3.3** | **Yes (bonus)** | Min spend $500/month | Earn 3.3 mpd with min spend $500/month. Otherwise 0.4 mpd. **[ESTIMATED]** |
| Groceries | **3.3** | **Yes (bonus)** | Min spend $500/month | Earn 3.3 mpd with min spend $500/month. Otherwise 0.4 mpd. **[ESTIMATED]** |
| Petrol | **3.3** | **Yes (bonus)** | Min spend $500/month | Earn 3.3 mpd with min spend $500/month. Otherwise 0.4 mpd. **[ESTIMATED]** |
| Travel | 0.4 | No (base) | — | Travel does not earn bonus rate on SC X Card. Base 0.4 mpd. **[ESTIMATED]** |
| General | 0.4 | No (base) | — | — |

**Monthly Caps**:
| Scope | Cap Amount | Cap Type | Notes | Status |
|-------|-----------|----------|-------|--------|
| All bonus categories (combined) | S$2,000/month | Spend | Combined cap across all bonus categories (dining, transport, online, groceries, petrol). | **[ESTIMATED]** |

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government payments excluded from 360 reward points earning. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |
| Global | — | Utility | Utility bill payments excluded from bonus categories. **[ESTIMATED]** |

**Source URL**: https://www.sc.com/sg/credit-cards/x-card/

---

### Card 16: Maybank Horizon Visa Signature

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | Maybank | |
| **Card Name** | Maybank Horizon Visa Signature | |
| **Slug** | `maybank-horizon-visa` | |
| **Network** | Visa | |
| **Annual Fee** | S$0 first year, then $194.40 | |
| **Base Rate** | 0.4 mpd | |
| **Data Status** | **[ESTIMATED]** — rate depends on TreatsPoints conversion which varies | |
| **Notes** | General miles card. 0.4 mpd base. Up to 3.2 mpd on overseas spend and 1.6 mpd on local selected categories. TreatsPoints convert to KrisFlyer/Asia Miles. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | **1.6** | **Yes (bonus)** | Min spend $300/month | Earn up to 1.6 mpd on dining with min spend $300/month. 0.4 mpd otherwise. **[ESTIMATED]** |
| Transport | 0.4 | No (base) | — | — |
| Online | 0.4 | No (base) | — | — |
| Groceries | 0.4 | No (base) | — | — |
| Petrol | **1.6** | **Yes (bonus)** | Min spend $300/month | Earn up to 1.6 mpd on petrol with min spend $300/month. 0.4 mpd otherwise. **[ESTIMATED]** |
| Travel | **1.6** | **Yes (bonus)** | Min spend $300/month | Earn up to 1.6 mpd on local travel. Overseas travel up to 3.2 mpd. 0.4 mpd if conditions not met. **[ESTIMATED]** |
| General | 0.4 | No (base) | — | — |

**Monthly Caps**:
| Scope | Cap Amount | Cap Type | Notes | Status |
|-------|-----------|----------|-------|--------|
| All bonus categories (combined) | S$1,500/month | Spend | Combined cap across bonus categories. Maybank T&Cs have complex tiered caps. | **[ESTIMATED]** |

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government payments excluded from TreatsPoints earning. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |

**Source URL**: https://www.maybank.com.sg/cards/credit-cards/horizon-visa-signature/

---

### Card 17: Maybank FC Barcelona Visa Signature

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | Maybank | |
| **Card Name** | Maybank FC Barcelona Visa Signature | |
| **Slug** | `maybank-fc-barcelona` | |
| **Network** | Visa | |
| **Annual Fee** | S$0 (no annual fee) | |
| **Base Rate** | 0.4 mpd | |
| **Data Status** | **[ESTIMATED]** — limited public data; uses Horizon-equivalent rates | |
| **Notes** | Branded variant of Horizon. Same TreatsPoints structure. No annual fee. Earn TreatsPoints convertible to miles. Effectively a cashback-miles hybrid. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | **1.6** | **Yes (bonus)** | Min spend $300/month | Same structure as Horizon. **[ESTIMATED]** |
| Transport | 0.4 | No (base) | — | — |
| Online | 0.4 | No (base) | — | — |
| Groceries | 0.4 | No (base) | — | — |
| Petrol | **1.6** | **Yes (bonus)** | Min spend $300/month | Same structure as Horizon. **[ESTIMATED]** |
| Travel | **1.6** | **Yes (bonus)** | Min spend $300/month | Overseas up to 3.2 mpd. **[ESTIMATED]** |
| General | 0.4 | No (base) | — | — |

**Monthly Caps**:
| Scope | Cap Amount | Cap Type | Notes | Status |
|-------|-----------|----------|-------|--------|
| All bonus categories (combined) | S$1,500/month | Spend | Combined cap across bonus categories. Same as Horizon. | **[ESTIMATED]** |

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government payments excluded from TreatsPoints earning. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |

**Source URL**: https://www.maybank.com.sg/cards/credit-cards/fc-barcelona-visa-signature/

---

### Card 18: Citi Rewards Card

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | Citi | |
| **Card Name** | Citi Rewards Card | |
| **Slug** | `citi-rewards` | |
| **Network** | Visa | |
| **Annual Fee** | S$0 (waived) | |
| **Base Rate** | 0.4 mpd | |
| **Data Status** | **[VERIFIED]** from Citi website | |
| **Notes** | No annual fee. 10X Citi ThankYou Points on shopping and online (= 4 mpd). 1X on other spend (= 0.4 mpd). Capped at $1,000/month on bonus categories. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | 0.4 | No (base) | — | — |
| Transport | 0.4 | No (base) | — | — |
| Online | **4.0** | **Yes (bonus)** | — | Earn 4 mpd (10X Citi ThankYou Points) on online shopping. Capped at $1,000/month. |
| Groceries | 0.4 | No (base) | — | — |
| Petrol | 0.4 | No (base) | — | — |
| Travel | 0.4 | No (base) | — | — |
| General | **4.0** | **Yes (bonus)** | — | Earn 4 mpd (10X Citi ThankYou Points) on in-store shopping (department stores, fashion). Capped at $1,000/month combined with online. |

**Monthly Caps**:
| Scope | Cap Amount | Cap Type | Notes | Status |
|-------|-----------|----------|-------|--------|
| All bonus categories (combined) | S$1,000/month | Spend | Combined cap across online shopping and in-store shopping 10X bonus categories. | **[VERIFIED]** |

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government payments excluded from ThankYou Points earning. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |
| Groceries | 5411 | Supermarket | Supermarkets excluded from 10X bonus. Only department stores and fashion/retail qualify. **[ESTIMATED]** |

**Source URL**: https://www.citibank.com.sg/credit-cards/citi-rewards-card/

---

### Card 19: POSB Everyday Card

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | DBS/POSB | |
| **Card Name** | POSB Everyday Card | |
| **Slug** | `posb-everyday-card` | |
| **Network** | Visa | |
| **Annual Fee** | S$0 (no annual fee) | |
| **Base Rate** | 0.4 mpd | |
| **Data Status** | **[ESTIMATED]** — miles path is secondary to cashback on this card | |
| **Notes** | Entry-level DBS/POSB card. Primarily a cashback card (up to 5% cashback on specific categories) but DBS Points can be converted to miles at 5000 points = 2000 miles (= 0.4 mpd). Very low miles earning — included for completeness. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | 0.4 | No (base) | — | — |
| Transport | 0.4 | No (base) | — | — |
| Online | 0.4 | No (base) | — | — |
| Groceries | 0.4 | No (base) | — | — |
| Petrol | 0.4 | No (base) | — | — |
| Travel | 0.4 | No (base) | — | — |
| General | 0.4 | No (base) | — | Flat 0.4 mpd across all categories. Miles conversion is secondary to cashback. **[ESTIMATED]** |

**Monthly Caps**: None (flat rate, no bonus categories).

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government payments excluded from DBS Points earning. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |

**Source URL**: https://www.posb.com.sg/personal/cards/credit-cards/everyday-card

---

### Card 20: UOB Preferred Platinum Visa

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | UOB | |
| **Card Name** | UOB Preferred Platinum Visa | |
| **Slug** | `uob-preferred-platinum` | |
| **Network** | Visa | |
| **Annual Fee** | S$0 (no annual fee) | |
| **Base Rate** | 0.4 mpd | |
| **Data Status** | **[VERIFIED]** from UOB website | |
| **Notes** | No annual fee. 10X UNI$ on dining (= 4 mpd). 0.4 mpd on other spend. Capped at $1,000/month on bonus. Minimum spend $600/month to qualify for 10X. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | **4.0** | **Yes (bonus)** | Min spend $600/month | Earn 4 mpd (10X UNI$) on dining with min spend $600/month. Otherwise base 0.4 mpd. Capped at $1,000/month. |
| Transport | 0.4 | No (base) | — | — |
| Online | 0.4 | No (base) | — | — |
| Groceries | 0.4 | No (base) | — | — |
| Petrol | 0.4 | No (base) | — | — |
| Travel | 0.4 | No (base) | — | — |
| General | 0.4 | No (base) | — | — |

**Monthly Caps**:
| Scope | Cap Amount | Cap Type | Notes | Status |
|-------|-----------|----------|-------|--------|
| Dining | S$1,000/month | Spend | Cap on 10X dining bonus. Min spend $600/month to qualify for 10X. | **[VERIFIED]** |

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government payments excluded from UNI$ earning. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |
| Dining | — | Fast food delivery | Fast food delivery apps may not always code as dining MCC. Bonus may not apply. **[ESTIMATED]** |

**Source URL**: https://www.uob.com.sg/personal/cards/credit/preferred-platinum.page

---

### Card 21: Maybank World Mastercard

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | Maybank | |
| **Card Name** | Maybank World Mastercard | |
| **Slug** | `maybank-world-mastercard` | |
| **Network** | Mastercard | First Mastercard in our database |
| **Annual Fee** | S$261.60 (1st year waived) | |
| **Base Rate** | 0.4 mpd | |
| **Min Income** | S$80,000 | |
| **Data Status** | **[VERIFIED]** from Maybank website + SingSaver | |
| **Notes** | #1 petrol card — uncapped 4 mpd on petrol, no min spend. 4 mpd at selected dining merchants (Paradise Group, Imperial Treasure, Les Amis, RWS) — merchant-specific, NOT modeled as category bonus. 3.2 mpd overseas (FCY, out of scope). | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | 0.4 | No (base) | — | 4 mpd at selected merchants only (Paradise Group, etc.). Not category-wide bonus. |
| Transport | 0.4 | No (base) | — | — |
| Online | 0.4 | No (base) | — | — |
| Groceries | 0.4 | No (base) | — | — |
| Petrol | **4.0** | **Yes (bonus)** | **None (uncapped, no min spend)** | Earn 4 mpd on petrol (MCC 5541). Uncapped, no min spend. Key differentiator. **[VERIFIED]** |
| Bills | 0.4 | No (base) | — | Base rate on bills/utilities. |
| Travel | 0.4 | No (base) | — | 3.2 mpd on overseas travel (FCY). 0.4 mpd on local travel. **[VERIFIED]** |
| General | 0.4 | No (base) | — | — |

**Monthly Caps**: None — uncapped petrol is the key differentiator vs Horizon/Barcelona ($300 min spend, $1,500 cap).

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government payments excluded from TreatsPoints earning. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |

**Source URL**: https://www.maybank2u.com.sg/en/personal/cards/credit/maybank-world-mastercard.page

---

### Card 22: UOB Visa Signature

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | UOB | |
| **Card Name** | UOB Visa Signature | |
| **Slug** | `uob-visa-signature` | |
| **Network** | Visa | |
| **Annual Fee** | S$218.00 (1st year waived) | |
| **Base Rate** | 0.4 mpd | |
| **Data Status** | **[VERIFIED]** from UOB website | |
| **Notes** | Strong general/contactless card. 4 mpd on contactless + petrol. Requires $1,000/month min spend. Cap $1,200/month shared. First card with dual conditions (contactless + min spend). | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | **4.0** | **Yes (bonus)** | Contactless + Min spend $1,000/month | Earn 4 mpd on contactless dining. Cap $1,200/month shared. **[VERIFIED]** |
| Transport | **4.0** | **Yes (bonus)** | Contactless + Min spend $1,000/month | Earn 4 mpd on contactless transport incl. SimplyGo. **[VERIFIED]** |
| Online | 0.4 | No (base) | — | Mobile contactless in-app payments classified as online, not contactless. **[VERIFIED from UOB T&Cs]** |
| Groceries | **4.0** | **Yes (bonus)** | Contactless + Min spend $1,000/month | Earn 4 mpd on contactless groceries. **[VERIFIED]** |
| Petrol | **4.0** | **Yes (bonus)** | Min spend $1,000/month (no contactless) | Earn 4 mpd on petrol. No contactless required for petrol. **[VERIFIED]** |
| Bills | 0.4 | No (base) | — | Utilities excluded from bonus earning. **[VERIFIED from UOB T&Cs]** |
| Travel | 0.4 | No (base) | — | 4 mpd on overseas travel (FCY, out of scope). 0.4 mpd local. **[VERIFIED]** |
| General | **4.0** | **Yes (bonus)** | Contactless + Min spend $1,000/month | Earn 4 mpd on contactless spend. **[VERIFIED]** |

**Monthly Caps**:
| Scope | Cap Amount | Cap Type | Notes | Status |
|-------|-----------|----------|-------|--------|
| All bonus categories (combined) | S$1,200/month | Spend | Shared across all bonus categories (petrol + contactless). Same pattern as HSBC Revolution combined cap. | **[VERIFIED]** |

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government payments excluded from UNI$ earning. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |

**Source URL**: https://www.uob.com.sg/personal/cards/rewards/visa-signature-card.page

---

### Card 23: DBS Vantage Visa Infinite

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | DBS | |
| **Card Name** | DBS Vantage Visa Infinite | |
| **Slug** | `dbs-vantage-visa-infinite` | |
| **Network** | Visa | |
| **Annual Fee** | S$599.50 (non-waivable year 1) | |
| **Base Rate** | 1.0 mpd (without min spend) | |
| **Data Status** | **[VERIFIED]** from DBS website | |
| **Notes** | Flat 1.5 mpd all local spend with $2,000/month min spend. 1.0 mpd without min spend. No bonus categories. Annual fee $599.50. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | **1.5** | **Yes (bonus)** | Min spend $2,000/month | Earn 1.5 mpd on all local spend. 1.0 mpd without min spend. **[VERIFIED]** |
| Transport | **1.5** | **Yes (bonus)** | Min spend $2,000/month | Same as above. **[VERIFIED]** |
| Online | **1.5** | **Yes (bonus)** | Min spend $2,000/month | Same as above. **[VERIFIED]** |
| Groceries | **1.5** | **Yes (bonus)** | Min spend $2,000/month | Same as above. **[VERIFIED]** |
| Petrol | **1.5** | **Yes (bonus)** | Min spend $2,000/month | Same as above. **[VERIFIED]** |
| Bills | **1.5** | **Yes (bonus)** | Min spend $2,000/month | Same as above. **[VERIFIED]** |
| Travel | **1.5** | **Yes (bonus)** | Min spend $2,000/month | Same as above. **[VERIFIED]** |
| General | **1.5** | **Yes (bonus)** | Min spend $2,000/month | Same as above. **[VERIFIED]** |

**Monthly Caps**: None (flat rate with min spend condition).

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government payments excluded from DBS Points earning. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |

**Source URL**: https://www.dbs.com.sg/personal/cards/credit-cards/vantage-card

---

### Card 24: OCBC Voyage Card

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | OCBC | |
| **Card Name** | OCBC Voyage Card | |
| **Slug** | `ocbc-voyage-card` | |
| **Network** | Visa | |
| **Annual Fee** | S$497.06 | |
| **Base Rate** | 1.3 mpd | |
| **Data Status** | **[VERIFIED]** from OCBC website | |
| **Notes** | Flat 1.3 mpd all local spend. No caps, no min spend. VOYAGE Miles do not expire. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | 1.3 | No (base) | — | — |
| Transport | 1.3 | No (base) | — | — |
| Online | 1.3 | No (base) | — | — |
| Groceries | 1.3 | No (base) | — | — |
| Petrol | 1.3 | No (base) | — | — |
| Bills | 1.3 | No (base) | — | — |
| Travel | 1.3 | No (base) | — | — |
| General | 1.3 | No (base) | — | — |

**Monthly Caps**: None (flat rate).

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government payments excluded from VOYAGE Miles earning. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |

**Source URL**: https://www.ocbc.com/personal-banking/cards/voyage-card

---

### Card 25: SC Journey Card

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | SC | |
| **Card Name** | SC Journey Card | |
| **Slug** | `sc-journey-card` | |
| **Network** | Visa | |
| **Annual Fee** | S$196.20 | |
| **Base Rate** | 1.2 mpd | |
| **Data Status** | **[VERIFIED]** from SC website | |
| **Notes** | 3 mpd on online transport/food delivery and online grocery delivery. 1.2 mpd base on all other spend. Cap $1,000/month shared. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | 1.2 | No (base) | — | — |
| Transport | **3.0** | **Yes (bonus)** | — | Earn 3 mpd on online transport and food delivery (Grab, foodpanda, Deliveroo). In-store transport earns 1.2 mpd base rate. Cap $1,000/month shared. **[VERIFIED]** |
| Online | 1.2 | No (base) | — | — |
| Groceries | **3.0** | **Yes (bonus)** | — | Earn 3 mpd on online grocery delivery. In-store groceries earn 1.2 mpd base rate. Cap $1,000/month shared. **[VERIFIED]** |
| Petrol | 1.2 | No (base) | — | — |
| Bills | 1.2 | No (base) | — | — |
| Travel | 1.2 | No (base) | — | — |
| General | 1.2 | No (base) | — | — |

**Monthly Caps**:
| Scope | Cap Amount | Cap Type | Notes | Status |
|-------|-----------|----------|-------|--------|
| All bonus categories (combined) | S$1,000/month | Spend | Combined cap across online transport and grocery delivery. | **[VERIFIED]** |

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government payments excluded from 360 reward points earning. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |

**Source URL**: https://www.sc.com/sg/credit-cards/journey-card/

---

### Card 26: SC Beyond Card

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | SC | |
| **Card Name** | SC Beyond Card | |
| **Slug** | `sc-beyond-card` | |
| **Network** | Mastercard | |
| **Annual Fee** | S$1,635.00 (non-waivable) | |
| **Base Rate** | 1.5 mpd | |
| **Data Status** | **[VERIFIED]** from SC website | |
| **Notes** | Flat 1.5 mpd all local spend. No caps, no min spend. Premium card. Priority Banking: 2.0 mpd (not modeled). | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | 1.5 | No (base) | — | — |
| Transport | 1.5 | No (base) | — | — |
| Online | 1.5 | No (base) | — | — |
| Groceries | 1.5 | No (base) | — | — |
| Petrol | 1.5 | No (base) | — | — |
| Bills | 1.5 | No (base) | — | — |
| Travel | 1.5 | No (base) | — | — |
| General | 1.5 | No (base) | — | — |

**Monthly Caps**: None (flat rate).

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government payments excluded from 360 reward points earning. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |

**Source URL**: https://www.sc.com/sg/credit-cards/beyond-card/

---

### Card 27: HSBC Premier Mastercard

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | HSBC | |
| **Card Name** | HSBC Premier Mastercard | |
| **Slug** | `hsbc-premier-mc` | |
| **Network** | Mastercard | |
| **Annual Fee** | S$708.50 (waived for Premier customers with $200K TRB) | |
| **Base Rate** | 1.4 mpd (KrisFlyer rate) | |
| **Data Status** | **[VERIFIED]** from HSBC website | |
| **Notes** | Flat 1.4 mpd all local spend (KrisFlyer rate). Uncapped, no min spend. Transfer fee waived. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | 1.4 | No (base) | — | — |
| Transport | 1.4 | No (base) | — | — |
| Online | 1.4 | No (base) | — | — |
| Groceries | 1.4 | No (base) | — | — |
| Petrol | 1.4 | No (base) | — | — |
| Bills | 1.4 | No (base) | — | — |
| Travel | 1.4 | No (base) | — | — |
| General | 1.4 | No (base) | — | — |

**Monthly Caps**: None (flat rate).

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government payments excluded from HSBC rewards earning. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |

**Source URL**: https://www.hsbc.com.sg/credit-cards/products/premier-mastercard/

---

### Card 28: Maybank XL Rewards

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | Maybank | |
| **Card Name** | Maybank XL Rewards | |
| **Slug** | `maybank-xl-rewards` | |
| **Network** | Mastercard | |
| **Annual Fee** | S$87.20 | |
| **Base Rate** | 0.4 mpd | |
| **Data Status** | **[VERIFIED]** from Maybank website | |
| **Notes** | 4 mpd on dining, online shopping, travel. Base 0.4 mpd. Min spend $500/month. Cap $1,000/month shared. Age 21-39 only. 1-year points expiry. $27.25 transfer fee. | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | **4.0** | **Yes (bonus)** | Min spend $500/month | Earn 4 mpd on dining (restaurants + food delivery). Cap $1,000/month shared. Age 21-39 only. **[VERIFIED]** |
| Transport | 0.4 | No (base) | — | — |
| Online | **4.0** | **Yes (bonus)** | Min spend $500/month | Earn 4 mpd on online shopping. Cap $1,000/month shared. **[VERIFIED]** |
| Groceries | 0.4 | No (base) | — | — |
| Petrol | 0.4 | No (base) | — | — |
| Bills | 0.4 | No (base) | — | — |
| Travel | **4.0** | **Yes (bonus)** | Min spend $500/month | Earn 4 mpd on travel (flights, hotels). Cap $1,000/month shared. **[VERIFIED]** |
| General | 0.4 | No (base) | — | — |

**Monthly Caps**:
| Scope | Cap Amount | Cap Type | Notes | Status |
|-------|-----------|----------|-------|--------|
| All bonus categories (combined) | S$1,000/month | Spend | Combined cap across dining, online shopping, and travel. Age 21-39 only. | **[VERIFIED]** |

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government payments excluded from TreatsPoints earning. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |

**Source URL**: https://www.maybank.com.sg/cards/credit-cards/xl-rewards/

---

### Card 29: UOB Lady's Solitaire

| Field | Value | Status |
|-------|-------|--------|
| **Bank** | UOB | |
| **Card Name** | UOB Lady's Solitaire | |
| **Slug** | `uob-ladys-solitaire` | |
| **Network** | Mastercard | |
| **Annual Fee** | S$414.20 | |
| **Base Rate** | 0.4 mpd | |
| **Data Status** | **[VERIFIED]** from UOB website | |
| **Notes** | Choose 2 of 7 bonus categories for 4 mpd (10X UNI$). Base 0.4 mpd. Cap $1,500/month shared ($750 per category). No min spend. Categories: Fashion, Dining, Travel, Beauty & Wellness, Family (groceries), Transport, Entertainment. Re-selectable quarterly. **Special: `user_selectable` condition type.** | |

**Earn Rates by Category**:

| Category | Rate (mpd) | Bonus? | Conditions | Notes |
|----------|-----------|--------|------------|-------|
| Dining | **4.0** | **Yes (bonus)** | `user_selectable` | Earn 4 mpd if Dining selected as bonus category. Choose 2 of 7. Cap $750/month per category. **[VERIFIED]** |
| Transport | **4.0** | **Yes (bonus)** | `user_selectable` | Earn 4 mpd if Transport selected as bonus category. Choose 2 of 7. Cap $750/month per category. **[VERIFIED]** |
| Online | 0.4 | No (base) | — | Online is not one of the 7 selectable UOB categories. |
| Groceries | **4.0** | **Yes (bonus)** | `user_selectable` | Earn 4 mpd if Family (groceries) selected as bonus category. Choose 2 of 7. Cap $750/month per category. **[VERIFIED]** |
| Petrol | 0.4 | No (base) | — | Petrol is not one of the 7 selectable UOB categories. |
| Bills | 0.4 | No (base) | — | — |
| Travel | **4.0** | **Yes (bonus)** | `user_selectable` | Earn 4 mpd if Travel selected as bonus category. Choose 2 of 7. Cap $750/month per category. **[VERIFIED]** |
| General | **4.0** | **Yes (bonus)** | `user_selectable` | Earn 4 mpd if Fashion, Beauty & Wellness, or Entertainment selected (mapped to general). Choose 2 of 7. Cap $750/month per category. **[VERIFIED]** |

**Monthly Caps**:
| Scope | Cap Amount | Cap Type | Notes | Status |
|-------|-----------|----------|-------|--------|
| All bonus categories (combined) | S$1,500/month | Spend | Combined cap across 2 chosen bonus categories ($750 per category). | **[VERIFIED]** |

**Exclusions**:
| Scope | Excluded MCCs | Type | Description |
|-------|--------------|------|-------------|
| Global | 9311, 9222, 9211, 9399 | Government | Government payments excluded from UNI$ earning. |
| Global | 6300, 6381, 6399 | Insurance | Insurance premium payments excluded. |

> **Special case: `user_selectable` condition type.** UOB Lady's Solitaire uses a `{"user_selectable": true}` condition in the `conditions` JSONB. This indicates that the bonus rate is only active if the user has selected this category as one of their 2 chosen bonus categories. The recommendation engine currently treats all `user_selectable` categories as active (assumes user has selected them). A future enhancement could allow users to specify their selected categories in `user_settings`.

**Source URL**: https://www.uob.com.sg/personal/cards/credit/ladys-solitaire-card.page

---

## 5. Database Schema Overview

The card data is stored across 6 PostgreSQL tables in Supabase:

### 5.1 `categories` — Spend Category Taxonomy
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | Lowercase slug: `dining`, `transport`, etc. |
| name | TEXT | Display name |
| display_order | INT | UI sort order (ascending) |
| icon | TEXT | Icon name for UI |
| mccs | TEXT[] | Array of MCC codes mapped to this category |
| description | TEXT | Short user-facing description |

### 5.2 `cards` — Credit Card Metadata
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated UUID |
| bank | TEXT | Issuing bank (e.g., DBS, UOB) |
| name | TEXT | Full card name |
| slug | TEXT (unique) | URL-safe identifier |
| network | TEXT | `visa`, `mastercard`, or `amex` |
| annual_fee | DECIMAL(8,2) | Annual fee in SGD (0 = no fee) |
| base_rate_mpd | DECIMAL(5,2) | Base miles per dollar (non-bonus) |
| is_active | BOOLEAN | TRUE = available for selection |
| notes | TEXT | Admin notes / caveats |

### 5.3 `earn_rules` — Miles Earn Rates per Card per Category
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| card_id | UUID (FK → cards) | Which card |
| category_id | TEXT (FK → categories) | Which category |
| earn_rate_mpd | DECIMAL(5,2) | **TOTAL** miles per dollar (not incremental) |
| is_bonus | BOOLEAN | TRUE = bonus/accelerated rate; FALSE = base rate |
| conditions | JSONB | Machine-readable conditions (e.g., `{"min_spend_monthly": 500}`) |
| conditions_note | TEXT | Human-readable condition summary |
| effective_from | DATE | Start date (default: today) |
| effective_to | DATE | End date (NULL = currently active) |
| source_url | TEXT | Bank T&C URL used for this data |

### 5.4 `caps` — Monthly Bonus Spending Caps
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| card_id | UUID (FK → cards) | Which card |
| category_id | TEXT (FK → categories) | Which category (NULL = all categories combined) |
| monthly_cap_amount | DECIMAL(10,2) | SGD cap per month |
| cap_type | TEXT | `spend` (cap on SGD amount) or `miles` (cap on miles earned) |
| notes | TEXT | Details and verification status |

### 5.5 `user_settings` — User Preferences (Sprint 22)
| Column | Type | Description |
|--------|------|-------------|
| user_id | UUID (PK, FK → auth.users) | One row per user |
| estimated_monthly_spend | DECIMAL | User's estimated total monthly card spend in SGD |
| created_at | TIMESTAMPTZ | Row creation time |
| updated_at | TIMESTAMPTZ | Auto-updated via trigger |

> Used by the `recommend()` RPC to determine if min spend conditions are met. RLS enforced — users can only access their own row.

### 5.6 `exclusions` — MCC / Condition-Based Exclusions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| card_id | UUID (FK → cards) | Which card |
| category_id | TEXT (FK → categories) | Which category (NULL = global exclusion) |
| excluded_mccs | TEXT[] | Array of MCC codes excluded from bonus |
| conditions | JSONB | Exclusion conditions (e.g., `{"payment_type": "government"}`) |
| description | TEXT | Human-readable explanation |

---

## 6. Sources & References

### 6.1 Primary Sources (Official Bank Websites)

| Bank | Card(s) | T&C URL |
|------|---------|---------|
| DBS | Altitude Visa | https://www.dbs.com.sg/personal/cards/credit-cards/altitude-visa-signature-card |
| DBS | Woman's World Card | https://www.dbs.com.sg/personal/cards/credit-cards/womans-card |
| DBS/POSB | Everyday Card | https://www.posb.com.sg/personal/cards/credit-cards/everyday-card |
| Citi | PremierMiles Visa | https://www.citibank.com.sg/credit-cards/premiermiles-visa-signature/ |
| Citi | Rewards Card | https://www.citibank.com.sg/credit-cards/citi-rewards-card/ |
| UOB | PRVI Miles Visa | https://www.uob.com.sg/personal/cards/credit/prvi-miles-visa.page |
| UOB | KrisFlyer UOB | https://www.uob.com.sg/personal/cards/credit/krisflyer-uob-credit-card.page |
| UOB | Lady's Card | https://www.uob.com.sg/personal/cards/credit/ladys-card.page |
| UOB | Preferred Platinum | https://www.uob.com.sg/personal/cards/credit/preferred-platinum.page |
| OCBC | 90°N Visa | https://www.ocbc.com/personal-banking/cards/90n-card |
| OCBC | Titanium Rewards | https://www.ocbc.com/personal-banking/cards/titanium-rewards-card |
| HSBC | Revolution | https://www.hsbc.com.sg/credit-cards/products/revolution/ |
| HSBC | TravelOne | https://www.hsbc.com.sg/credit-cards/products/travelone/ |
| Amex | KrisFlyer Ascend | https://www.americanexpress.com/sg/credit-cards/krisflyer-ascend-card/ |
| Amex | KrisFlyer Credit | https://www.americanexpress.com/sg/credit-cards/krisflyer-credit-card/ |
| BOC | Elite Miles World MC | https://www.bankofchina.com/sg/pbservice/pb1/201803/t20180329_11814364.html |
| SC | Visa Infinite | https://www.sc.com/sg/credit-cards/visa-infinite/ |
| SC | X Card | https://www.sc.com/sg/credit-cards/x-card/ |
| Maybank | Horizon Visa | https://www.maybank.com.sg/cards/credit-cards/horizon-visa-signature/ |
| Maybank | FC Barcelona Visa | https://www.maybank.com.sg/cards/credit-cards/fc-barcelona-visa-signature/ |
| DBS | Vantage Visa Infinite | https://www.dbs.com.sg/personal/cards/credit-cards/vantage-card |
| OCBC | Voyage Card | https://www.ocbc.com/personal-banking/cards/voyage-card |
| SC | Journey Card | https://www.sc.com/sg/credit-cards/journey-card/ |
| SC | Beyond Card | https://www.sc.com/sg/credit-cards/beyond-card/ |
| HSBC | Premier Mastercard | https://www.hsbc.com.sg/credit-cards/products/premier-mastercard/ |
| Maybank | XL Rewards | https://www.maybank.com.sg/cards/credit-cards/xl-rewards/ |
| UOB | Lady's Solitaire | https://www.uob.com.sg/personal/cards/credit/ladys-solitaire-card.page |

### 6.2 Cross-Reference Sources

| Source | URL | Usage |
|--------|-----|-------|
| MileLion | https://milelion.com | Cross-reference for earn rates and card reviews |
| SingSaver | https://www.singsaver.com.sg | Cross-reference for card comparisons and rates |
| Suitesmile | https://suitesmile.com | Cross-reference for miles earning rates |

### 6.3 MCC Code Sources
- Visa Merchant Category Code list
- Mastercard Merchant Category Code list
- Singapore bank T&Cs (merchant classification sections)

---

## 7. SME Verification Checklist

Instructions: For each card, verify the data against the bank's current T&Cs using the source URL provided. Mark each field as correct or flag corrections needed.

### Quick Summary Table

| # | Card Name | Bank | Data Status | Annual Fee | Base MPD | Has Bonus? | Has Cap? | SME Verified? |
|---|-----------|------|-------------|------------|----------|------------|----------|---------------|
| 1 | DBS Altitude Visa Signature | DBS | VERIFIED | $192.60 | 1.2 | Yes (travel) | No | [ ] |
| 2 | Citi PremierMiles Visa Signature | Citi | VERIFIED | $192.60 | 1.2 | No | No | [ ] |
| 3 | UOB PRVI Miles Visa | UOB | VERIFIED | $256.80 | 1.4 | No | No | [ ] |
| 4 | OCBC 90°N Visa | OCBC | VERIFIED | $192.60 | 1.2 | No | No | [ ] |
| 5 | KrisFlyer UOB Credit Card | UOB | VERIFIED | $194.40 | 1.2 | Yes (dining, transport, online, travel) | Yes ($1,000 combined) | [ ] |
| 6 | HSBC Revolution Credit Card | HSBC | VERIFIED | $0 | 0.4 | Yes (dining, online) | Yes ($1,000 combined) | [ ] |
| 7 | Amex KrisFlyer Ascend | Amex | VERIFIED | $337.05 | 1.1 | Yes (dining, groceries, travel) | Yes ($2,500/cat) | [ ] |
| 8 | BOC Elite Miles World MC | BOC | **ESTIMATED** | $0* | 1.5 | No | Yes ($2,000 combined) | [ ] |
| 9 | SC Visa Infinite | SC | VERIFIED | $588.50 | 1.4 | No | No | [ ] |
| 10 | DBS Woman's World Card | DBS | VERIFIED | $0 | 0.4 | Yes (online) | Yes ($2,000 online) | [ ] |
| 11 | UOB Lady's Card | UOB | VERIFIED | $0 | 0.4 | Yes (online*, general*) | Yes ($1,000 combined) | [ ] |
| 12 | OCBC Titanium Rewards Card | OCBC | VERIFIED | $0* | 0.4 | Yes (dining, online) | Yes ($1,000 combined) | [ ] |
| 13 | HSBC TravelOne Credit Card | HSBC | VERIFIED | $192.60 | 1.0 | No | No | [ ] |
| 14 | Amex KrisFlyer Credit Card | Amex | VERIFIED | $176.55 | 1.1 | Yes (dining, travel) | Yes ($2,000/cat) | [ ] |
| 15 | SC X Credit Card | SC | **ESTIMATED** | $0 | 0.4 | Yes (5 categories) | Yes ($2,000 combined) | [ ] |
| 16 | Maybank Horizon Visa Signature | Maybank | **ESTIMATED** | $0* | 0.4 | Yes (dining, petrol, travel) | Yes ($1,500 combined) | [ ] |
| 17 | Maybank FC Barcelona Visa Sig. | Maybank | **ESTIMATED** | $0 | 0.4 | Yes (dining, petrol, travel) | Yes ($1,500 combined) | [ ] |
| 18 | Citi Rewards Card | Citi | VERIFIED | $0 | 0.4 | Yes (online, general) | Yes ($1,000 combined) | [ ] |
| 19 | POSB Everyday Card | DBS/POSB | **ESTIMATED** | $0 | 0.4 | No | No | [ ] |
| 20 | UOB Preferred Platinum Visa | UOB | VERIFIED | $0 | 0.4 | Yes (dining) | Yes ($1,000 dining) | [ ] |
| 21 | Maybank World Mastercard | Maybank | VERIFIED | $261.60* | 0.4 | Yes (petrol) | No (uncapped) | [ ] |
| 22 | UOB Visa Signature | UOB | VERIFIED | $218.00* | 0.4 | Yes (5 categories) | Yes ($1,200 combined) | [ ] |
| 23 | DBS Vantage Visa Infinite | DBS | VERIFIED | $599.50 | 1.0 | Yes (all, min spend) | No | [ ] |
| 24 | OCBC Voyage Card | OCBC | VERIFIED | $497.06 | 1.3 | No | No | [ ] |
| 25 | SC Journey Card | SC | VERIFIED | $196.20 | 1.2 | Yes (transport, groceries) | Yes ($1,000 combined) | [ ] |
| 26 | SC Beyond Card | SC | VERIFIED | $1,635.00 | 1.5 | No | No | [ ] |
| 27 | HSBC Premier Mastercard | HSBC | VERIFIED | $708.50* | 1.4 | No | No | [ ] |
| 28 | Maybank XL Rewards | Maybank | VERIFIED | $87.20 | 0.4 | Yes (dining, online, travel) | Yes ($1,000 combined) | [ ] |
| 29 | UOB Lady's Solitaire | UOB | VERIFIED | $414.20 | 0.4 | Yes (user-selectable) | Yes ($1,500 combined) | [ ] |

> `*` = conditional fee (e.g., first year free, then fee applies)
> `*` in bonus column = bonus restricted to specific merchant sub-types (e.g., fashion/beauty only)

### Per-Card Verification Form

For each card, the SME should verify:

- [ ] **Card 1 — DBS Altitude Visa Signature**
  - [ ] Annual fee: S$192.60
  - [ ] Base rate: 1.2 mpd local
  - [ ] Travel bonus: 4.0 mpd (online travel portal)
  - [ ] No monthly cap on local earn
  - [ ] Exclusions: Government (MCC 9311/9222/9211/9399), Insurance (MCC 6300/6381/6399)
  - [ ] Corrections: _______________

- [ ] **Card 2 — Citi PremierMiles Visa Signature**
  - [ ] Annual fee: S$192.60
  - [ ] Flat rate: 1.2 mpd local, 2 mpd overseas
  - [ ] No bonus categories locally
  - [ ] Miles never expire
  - [ ] Exclusions: Government, Insurance
  - [ ] Corrections: _______________

- [ ] **Card 3 — UOB PRVI Miles Visa**
  - [ ] Annual fee: S$256.80
  - [ ] Flat rate: 1.4 mpd local, 2.4 mpd overseas
  - [ ] No bonus categories locally
  - [ ] Exclusions: Government, Insurance
  - [ ] Corrections: _______________

- [ ] **Card 4 — OCBC 90°N Visa**
  - [ ] Annual fee: S$192.60
  - [ ] Flat rate: 1.2 mpd local, 2.1 mpd overseas
  - [ ] Auto-transfer to KrisFlyer/Asia Miles
  - [ ] Exclusions: Government
  - [ ] Corrections: _______________

- [ ] **Card 5 — KrisFlyer UOB Credit Card**
  - [ ] Annual fee: S$194.40
  - [ ] Base rate: 1.2 mpd
  - [ ] Dining/Transport bonus: 2.0 mpd (contactless required?)
  - [ ] Online bonus: 2.0 mpd
  - [ ] Travel bonus: 3.0 mpd (SIA only?)
  - [ ] Combined cap: S$1,000/month [ESTIMATED — verify]
  - [ ] Petrol exclusion from bonus [ESTIMATED — verify]
  - [ ] Corrections: _______________

- [ ] **Card 6 — HSBC Revolution Credit Card**
  - [ ] Annual fee: S$0
  - [ ] Base rate: 0.4 mpd
  - [ ] Dining bonus: 4.0 mpd
  - [ ] Online bonus: 4.0 mpd
  - [ ] Combined cap: S$1,000/month
  - [ ] Fast food (MCC 5814) excluded from 10X dining bonus [Sprint 21 — verify per HSBC T&Cs]
  - [ ] Supermarket (MCC 5411) excluded from 10X [ESTIMATED — verify]
  - [ ] Corrections: _______________

- [ ] **Card 7 — Amex KrisFlyer Ascend**
  - [ ] Annual fee: S$337.05
  - [ ] Base rate: 1.1 mpd
  - [ ] Dining bonus: 2.0 mpd (cap $2,500/month)
  - [ ] Groceries bonus: 2.0 mpd (cap $2,500/month)
  - [ ] Travel bonus: 2.0 mpd (cap $2,500/month), 3 mpd on SIA
  - [ ] Instalment exclusion
  - [ ] Corrections: _______________

- [ ] **Card 8 — BOC Elite Miles World Mastercard** [ESTIMATED — PRIORITY VERIFY]
  - [ ] Annual fee: S$0 first 2 years, then $193.50
  - [ ] Flat rate: 1.5 mpd on all local spend
  - [ ] Combined cap: S$2,000/month [ESTIMATED]
  - [ ] 3X BOC points structure → verify 1.5 mpd conversion
  - [ ] Corrections: _______________

- [ ] **Card 9 — SC Visa Infinite**
  - [ ] Annual fee: S$588.50
  - [ ] Flat rate: 1.4 mpd local, 3 mpd overseas
  - [ ] Income requirement: S$150K
  - [ ] No monthly cap on local
  - [ ] Corrections: _______________

- [ ] **Card 10 — DBS Woman's World Card**
  - [ ] Annual fee: S$0
  - [ ] Base rate: 0.4 mpd
  - [ ] Online bonus: 4.0 mpd (10X DBS Points)
  - [ ] Online cap: S$2,000/month
  - [ ] Recurring payments excluded from 10X [ESTIMATED — verify]
  - [ ] Corrections: _______________

- [ ] **Card 11 — UOB Lady's Card**
  - [ ] Annual fee: S$0
  - [ ] Base rate: 0.4 mpd
  - [ ] Bonus: 4.0 mpd on fashion/beauty/bags/shoes only (10X UNI$)
  - [ ] Mapped to online + general categories (verify appropriateness)
  - [ ] Combined cap: S$1,000/month
  - [ ] Education exclusion [ESTIMATED — verify]
  - [ ] Corrections: _______________

- [ ] **Card 12 — OCBC Titanium Rewards Card**
  - [ ] Annual fee: S$0 first 2 years, then $192.60
  - [ ] Base rate: 0.4 mpd
  - [ ] Dining bonus: 4.0 mpd (10X OCBC$)
  - [ ] Online bonus: 4.0 mpd (10X OCBC$)
  - [ ] Combined cap: S$1,000/month
  - [ ] Supermarket excluded from 10X [ESTIMATED — verify]
  - [ ] Corrections: _______________

- [ ] **Card 13 — HSBC TravelOne Credit Card**
  - [ ] Annual fee: S$192.60
  - [ ] Flat rate: 1.0 mpd local, 2.7 mpd overseas
  - [ ] No bonus categories locally
  - [ ] Corrections: _______________

- [ ] **Card 14 — Amex KrisFlyer Credit Card**
  - [ ] Annual fee: S$176.55
  - [ ] Base rate: 1.1 mpd
  - [ ] Dining bonus: 1.5 mpd
  - [ ] Travel bonus: 2.0 mpd (SIA only)
  - [ ] Dining cap: S$2,000/month [ESTIMATED — verify]
  - [ ] Travel cap: S$2,000/month [ESTIMATED — verify]
  - [ ] Instalment exclusion
  - [ ] Corrections: _______________

- [ ] **Card 15 — SC X Credit Card** [ESTIMATED — PRIORITY VERIFY]
  - [ ] Annual fee: S$0
  - [ ] Base rate: 0.4 mpd
  - [ ] Bonus: 3.3 mpd on dining, transport, online, groceries, petrol
  - [ ] Min spend: $500/month required for bonus
  - [ ] Combined cap: S$2,000/month [ESTIMATED]
  - [ ] Travel does NOT earn bonus (0.4 mpd) — verify
  - [ ] Utility exclusion [ESTIMATED — verify]
  - [ ] Corrections: _______________

- [ ] **Card 16 — Maybank Horizon Visa Signature** [ESTIMATED — PRIORITY VERIFY]
  - [ ] Annual fee: S$0 first year, then $194.40
  - [ ] Base rate: 0.4 mpd
  - [ ] Dining bonus: 1.6 mpd (min spend $300/month)
  - [ ] Petrol bonus: 1.6 mpd (min spend $300/month)
  - [ ] Travel bonus: 1.6 mpd local, 3.2 mpd overseas
  - [ ] Combined cap: S$1,500/month [ESTIMATED]
  - [ ] TreatsPoints conversion: 3000 TP = 1000 miles — verify
  - [ ] Corrections: _______________

- [ ] **Card 17 — Maybank FC Barcelona Visa Signature** [ESTIMATED — PRIORITY VERIFY]
  - [ ] Annual fee: S$0
  - [ ] Same earn structure as Horizon — verify independently
  - [ ] Corrections: _______________

- [ ] **Card 18 — Citi Rewards Card**
  - [ ] Annual fee: S$0
  - [ ] Base rate: 0.4 mpd
  - [ ] Online bonus: 4.0 mpd (10X ThankYou Points)
  - [ ] In-store shopping bonus: 4.0 mpd (mapped to General category)
  - [ ] Combined cap: S$1,000/month
  - [ ] Supermarket excluded from 10X [ESTIMATED — verify]
  - [ ] Corrections: _______________

- [ ] **Card 19 — POSB Everyday Card** [ESTIMATED — PRIORITY VERIFY]
  - [ ] Annual fee: S$0
  - [ ] Flat rate: 0.4 mpd (conversion: 5000 DBS Points = 2000 miles)
  - [ ] Primarily cashback card — verify miles conversion path is correct
  - [ ] Corrections: _______________

- [ ] **Card 20 — UOB Preferred Platinum Visa**
  - [ ] Annual fee: S$0
  - [ ] Base rate: 0.4 mpd
  - [ ] Dining bonus: 4.0 mpd (10X UNI$, min spend $600/month)
  - [ ] Dining cap: S$1,000/month
  - [ ] Fast food delivery exclusion [ESTIMATED — verify]
  - [ ] Corrections: _______________

- [ ] **Card 21 — Maybank World Mastercard**
  - [ ] Annual fee: S$261.60 (1st year waived)
  - [ ] Base rate: 0.4 mpd
  - [ ] Petrol bonus: 4.0 mpd (uncapped, no min spend)
  - [ ] Min income: S$80,000
  - [ ] Dining 4 mpd at selected merchants only (not category-wide) — verify merchant list
  - [ ] FCY 3.2 mpd — verify (out of scope for recommendations)
  - [ ] Corrections: _______________

- [ ] **Card 22 — UOB Visa Signature**
  - [ ] Annual fee: S$218.00 (1st year waived)
  - [ ] Base rate: 0.4 mpd
  - [ ] Contactless bonus: 4.0 mpd on dining, transport, groceries, general (contactless required)
  - [ ] Petrol bonus: 4.0 mpd (NO contactless required)
  - [ ] Min spend: $1,000/month (across petrol & contactless)
  - [ ] Combined cap: S$1,200/month (shared across all bonus categories)
  - [ ] Online: 0.4 mpd (mobile in-app != contactless) — verify per UOB T&Cs
  - [ ] Bills: 0.4 mpd (utilities excluded from bonus) — verify
  - [ ] Corrections: _______________

- [ ] **Card 23 — DBS Vantage Visa Infinite**
  - [ ] Annual fee: S$599.50 (non-waivable year 1)
  - [ ] Base rate: 1.0 mpd (without min spend)
  - [ ] Bonus: 1.5 mpd all local spend (with $2,000/month min spend)
  - [ ] No monthly cap
  - [ ] Exclusions: Government, Insurance
  - [ ] Corrections: _______________

- [ ] **Card 24 — OCBC Voyage Card**
  - [ ] Annual fee: S$497.06
  - [ ] Flat rate: 1.3 mpd all local spend
  - [ ] VOYAGE Miles do not expire
  - [ ] No caps, no min spend
  - [ ] Exclusions: Government, Insurance
  - [ ] Corrections: _______________

- [ ] **Card 25 — SC Journey Card**
  - [ ] Annual fee: S$196.20
  - [ ] Base rate: 1.2 mpd
  - [ ] Transport bonus: 3.0 mpd (online transport/food delivery only)
  - [ ] Groceries bonus: 3.0 mpd (online grocery delivery only)
  - [ ] Combined cap: S$1,000/month
  - [ ] Exclusions: Government, Insurance
  - [ ] Corrections: _______________

- [ ] **Card 26 — SC Beyond Card**
  - [ ] Annual fee: S$1,635.00 (non-waivable)
  - [ ] Flat rate: 1.5 mpd all local spend
  - [ ] Priority Banking: 2.0 mpd (not modeled) — verify
  - [ ] No caps, no min spend
  - [ ] Exclusions: Government, Insurance
  - [ ] Corrections: _______________

- [ ] **Card 27 — HSBC Premier Mastercard**
  - [ ] Annual fee: S$708.50 (waived for Premier with $200K TRB)
  - [ ] Flat rate: 1.4 mpd all local spend (KrisFlyer rate)
  - [ ] Uncapped, no min spend
  - [ ] Transfer fee waived for Premier customers — verify
  - [ ] Exclusions: Government, Insurance
  - [ ] Corrections: _______________

- [ ] **Card 28 — Maybank XL Rewards**
  - [ ] Annual fee: S$87.20
  - [ ] Base rate: 0.4 mpd
  - [ ] Dining bonus: 4.0 mpd (min spend $500/month)
  - [ ] Online bonus: 4.0 mpd (min spend $500/month)
  - [ ] Travel bonus: 4.0 mpd (min spend $500/month)
  - [ ] Combined cap: S$1,000/month
  - [ ] Age 21-39 only — verify eligibility restriction
  - [ ] 1-year points expiry — verify
  - [ ] Corrections: _______________

- [ ] **Card 29 — UOB Lady's Solitaire**
  - [ ] Annual fee: S$414.20
  - [ ] Base rate: 0.4 mpd
  - [ ] Bonus: 4.0 mpd on 2 chosen categories (10X UNI$)
  - [ ] 7 selectable categories: Fashion, Dining, Travel, Beauty & Wellness, Family, Transport, Entertainment
  - [ ] Combined cap: S$1,500/month ($750 per category)
  - [ ] No min spend
  - [ ] Re-selectable quarterly — verify frequency
  - [ ] Uses `user_selectable` condition type — special case
  - [ ] Corrections: _______________

---

### Category Mapping Verification

- [ ] **Dining MCC codes** (5811, 5812, 5813, 5814) — Are these complete for SG?
- [ ] **Transport MCC codes** — Does Grab/Gojek actually code as 4121?
- [ ] **Online MCC codes** — Are Shopee/Lazada classified under these MCCs?
- [ ] **Groceries MCC codes** — Are FairPrice/Cold Storage/Sheng Siong under 5411?
- [ ] **Petrol MCC codes** (5541, 5542, 5983) — Shell/Esso/Caltex/SPC under these?
- [ ] **Travel MCC codes** — Is the 3000-3299 airline range correct?
- [ ] **Bills MCC codes** (4812, 4814, 4900, 6300, 6381, 6399) — Are telco/utility/insurance MCCs complete for SG? Note: insurance MCCs overlap with common exclusions (see Section 3.2 item #1).
- [ ] **General** — Catch-all with empty MCC array; any concerns?

### Data Discrepancy Resolution

- [x] **Resolve category 5**: Should it be `petrol` or `bills`? **RESOLVED (Sprint 21)** — Both kept. 8 categories total. `petrol` (display_order=5) and `bills` (display_order=8) coexist. All 29 cards have base-rate earn rules for `bills`. Insurance warning banner shown on Bills screen.
- [ ] **Verify HSBC Revolution MCC 5814 exclusion**: Fast food excluded from 10X bonus — confirm with HSBC T&Cs (Sprint 21 addition based on MileLion analysis)

---

> **SME Sign-off**
>
> Reviewed by: _______________
> Date: _______________
> Overall assessment: [ ] All data verified  [ ] Corrections needed (see above)
> Next review date: _______________
