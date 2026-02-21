# MaxiMile — Card Data Verification Document

> **Purpose**: This document presents ALL card data, categorization logic, and earn rate information used in the MaxiMile app for **subject matter expert (SME) verification**. Each data point should be checked against the referenced bank T&Cs.
>
> **Last Updated**: 2026-02-21
> **Data As Of**: February 2026
> **Total Cards**: 20 Singapore miles credit cards
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
- All conditions (min spend, contactless, etc.) are **assumed to be met** per PRD
- Only **local (SGD) spend** rates are modeled; overseas rates noted but not used in recommendations
- Banks may change rates at any time — periodic re-validation required

---

## 2. Category Taxonomy & MCC Mappings

MaxiMile uses **7 fixed spend categories** to classify transactions. Each category maps to specific Merchant Category Codes (MCCs) defined by Visa/Mastercard.

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

### 2.8 How Categories Drive Earn Rates

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

### 3.1 Critical Issue: `petrol` vs `bills` Category Conflict

The system currently has **two competing categories** occupying the same display_order=5 slot. This is the result of an evolution during development:

**Timeline of the conflict**:
1. **Initial setup** (`001_initial_schema.sql`, `all_cards.sql`): Category 5 was defined as **`petrol`** (MCC: 5541, 5542, 5983 — petrol stations). All 20 cards have earn rules for `petrol`.
2. **Frontend development** (`constants/categories.ts`): The frontend was built with **`bills`** (utilities, insurance, telco) instead of `petrol`. No `petrol` category exists in the frontend.
3. **Migration 007** (`007_add_bills_category.sql`): A migration was created to add `bills` to the database because the recommend() RPC was rejecting `bills` as an invalid category. The migration comment explicitly states: *"The app defines 'bills' as a spend category but the database only had 'petrol'."*
4. **Current state**: The database has **BOTH** `petrol` and `bills` as valid categories. All 20 cards have earn rules for `petrol` but **no cards have earn rules for `bills`**.

**Where each is used**:

| Location | Uses `petrol` | Uses `bills` |
|----------|:---:|:---:|
| `all_cards.sql` (source of truth for seed data) | Yes | No |
| `batch1_cards.sql` (10 cards, 70 earn rules) | Yes | No |
| `batch2_cards.sql` (10 cards, 70 earn rules) | Yes | No |
| `seed.mjs` (JS seed script) | Yes | No |
| `categories.sql` (standalone seed) | Yes | Yes (both defined) |
| `constants/categories.ts` (frontend) | **No** | Yes |
| `lib/merchant.ts` (merchant detection) | **No** | Yes |
| `007_add_bills_category.sql` (migration) | No | Yes |
| `tests/mocks/test-data.ts` | Yes | No |

**Impact**:
- When a user selects "Bills" in the app UI, the recommend() RPC can now accept it (post-migration 007), but it will return **no earn rules** because no card has bonus or base rules for `bills`.
- All earn rate data exists only for `petrol`, which the user **cannot select** in the frontend.
- This means petrol-related earn rates are invisible to users, and bills-related spend gets no optimized recommendations.

**Resolution needed (for SME and Product Owner)**:

#### Recommended Resolution: Support BOTH categories (expand to 8 categories)

Based on analysis, **petrol** and **bills** serve genuinely different user needs:
- **Petrol** — Singapore drivers optimizing fuel spend (Shell, Esso, Caltex, SPC). The PRD specifically highlights Maybank World MC's "4 mpd petrol UNCAPPED" as a key recommendation scenario. Multiple cards have differentiated petrol earn rates.
- **Bills** — Recurring utility/telco/insurance payments. A common spending category for all users, but most cards earn only base rate (and insurance MCCs are commonly excluded).

| Option | Description | Effort | Recommendation |
|--------|-------------|--------|----------------|
| **A. Keep both (8 categories)** | Add `petrol` to frontend alongside existing `bills`. Add base-rate earn rules for `bills` across all 20 cards. | Medium | **Recommended** — preserves all existing data, matches PRD intent, adds user value |
| B. Replace `bills` with `petrol` | Remove `bills` from frontend, replace with `petrol`. Drop migration 007 data. | Low | Loses bills utility for non-drivers |
| C. Replace `petrol` with `bills` | Migrate all `petrol` earn rules to `bills`. Update all seed files. | High | Destroys petrol-specific rate data that the PRD emphasizes |
| D. Keep only 7 with `petrol` | Revert frontend to `petrol`, remove `bills` entirely | Low | Loses bills utility |

**If Option A is chosen, the following changes are needed**:
1. Add `petrol` category to `constants/categories.ts` (frontend)
2. Add `petrol` color/icon to `CategoryTile.tsx`, `MerchantCard.tsx`, `transactions.tsx`, `card-transactions/[cardId].tsx`
3. Map `gas_station` Google Places type to `petrol` instead of `transport` in `merchant.ts`
4. Add base-rate earn rules (0.4 mpd) for `bills` category across all 20 cards
5. Add `bills` to AI scraper schema (`scraper/src/ai/schema.ts` and `prompts.ts`)
6. Update tests to expect 8 categories

**Decision required**:
- [ ] **Option A**: Keep both `petrol` and `bills` (8 categories) — **Recommended**
- [ ] **Option B**: Replace `bills` with `petrol` (7 categories)
- [ ] **Option C**: Replace `petrol` with `bills` (7 categories)
- [ ] **Option D**: Keep only `petrol`, remove `bills` (7 categories)

### 3.2 Secondary Discrepancies

| # | Issue | Severity | Details | Files Affected |
|---|-------|----------|---------|---------------|
| 1 | **Insurance MCCs overlap** | Medium | MCC codes 6300, 6381, 6399 appear in both the `bills` category definition AND as common exclusions across all cards. If `bills` is kept, insurance payments would match the category but be excluded from earning — effectively earning 0 mpd on insurance spend even though the user selected `bills`. | `007_add_bills_category.sql`, all card exclusions |
| 2 | **gas_station mapped to transport** | Medium | In `merchant.ts`, Google Places type `gas_station` is mapped to `transport`, not `petrol`. Petrol station detection routes to the wrong category. | `lib/merchant.ts` line 57 |
| 3 | **AI scraper missing `bills`** | Low | The Gemini AI schema (`scraper/src/ai/schema.ts`) and prompts (`prompts.ts`) only list `petrol` in the category enum. Rate change submissions for `bills` would fail schema validation. | `scraper/src/ai/schema.ts`, `scraper/src/ai/prompts.ts` |
| 4 | **Earn rules assume conditions met** | Low (v1 known limitation) | v1 assumes all conditions (min spend, contactless, etc.) are met. This inflates effective rates for cards like SC X Card (requires $500/month min spend) and UOB Preferred Platinum (requires $600/month min spend). | All earn rules with conditions |
| 5 | **Test suite inconsistency** | Low | `tests/card-rules.test.ts` expects `petrol` in category list. `tests/merchant.test.ts` tests `bills` mappings. If both categories exist, both tests should pass; if either is removed, corresponding tests will fail. | `tests/card-rules.test.ts:317`, `tests/merchant.test.ts:7` |

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

## 5. Database Schema Overview

The card data is stored across 5 PostgreSQL tables in Supabase:

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

### 5.5 `exclusions` — MCC / Condition-Based Exclusions
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

---

### Category Mapping Verification

- [ ] **Dining MCC codes** (5811, 5812, 5813, 5814) — Are these complete for SG?
- [ ] **Transport MCC codes** — Does Grab/Gojek actually code as 4121?
- [ ] **Online MCC codes** — Are Shopee/Lazada classified under these MCCs?
- [ ] **Groceries MCC codes** — Are FairPrice/Cold Storage/Sheng Siong under 5411?
- [ ] **Petrol MCC codes** (5541, 5542, 5983) — Shell/Esso/Caltex/SPC under these?
- [ ] **Travel MCC codes** — Is the 3000-3299 airline range correct?
- [ ] **General** — Catch-all with empty MCC array; any concerns?

### Data Discrepancy Resolution

- [ ] **Resolve category 5**: Should it be `petrol` or `bills`?
  - Database earn rules reference `petrol`
  - Frontend code uses `bills`
  - Which is correct for the product?

---

> **SME Sign-off**
>
> Reviewed by: _______________
> Date: _______________
> Overall assessment: [ ] All data verified  [ ] Corrections needed (see above)
> Next review date: _______________
