# Recommendation & Category Assignment Logic Analysis

**Document Purpose:** Technical analysis of recommendation engine and category detection systems for SME review
**Last Updated:** 2026-02-27
**System Version:** MaxiMile v1.9 (Card Expansion — 29 cards across 7 banks)

---

## Executive Summary

MaxiMile implements three sophisticated systems that work together to optimize credit card usage:

1. **Recommendation Engine** - SQL-based scoring that ranks cards by effective earning rate with dynamic cap awareness
2. **Category Detection** - Hybrid approach combining user overrides, keyword matching, and Google Places API
3. **Rate Change Detection** - AI-powered classification using Gemini/Groq with confidence-based routing

---

## 1. RECOMMENDATION ENGINE

### 1.1 Core Algorithm

**Location:** `database/functions/recommend.sql`

The recommendation engine is a PostgreSQL RPC function that returns ranked credit cards for any spending category.

#### Return Columns

The `recommend()` RPC returns the following columns per row:

| Column | Type | Description |
|--------|------|-------------|
| `card_id` | UUID | Card identifier |
| `card_name` | TEXT | Display name |
| `bank` | TEXT | Issuing bank |
| `network` | TEXT | Card network (visa, mastercard, amex) |
| `earn_rate_mpd` | DECIMAL | Effective earn rate (bonus or base) |
| `remaining_cap` | DECIMAL | Dollars remaining before cap (NULL if uncapped) |
| `monthly_cap_amount` | DECIMAL | Total monthly cap (NULL if uncapped) |
| `score` | DECIMAL | Computed ranking score |
| `is_recommended` | BOOLEAN | TRUE for top-ranked card only |
| `conditions_note` | TEXT | Human-readable conditions/caveats from `earn_rules.conditions_note` (nullable) |
| `min_spend_threshold` | DECIMAL | Min monthly spend required for bonus rate (NULL if no min spend condition) |
| `min_spend_met` | BOOLEAN | Whether user's effective spend meets the min spend threshold (NULL if no condition) |
| `total_monthly_spend` | DECIMAL | User's total monthly spend (higher of actual transactions or estimated from `user_settings`) |
| `requires_contactless` | BOOLEAN | TRUE if the bonus earn rate requires contactless payment (extracted from `earn_rules.conditions` JSONB `contactless` key) |

> **Sprint 21 addition:** `conditions_note` (TEXT, nullable) is now returned alongside existing columns. The value comes from `earn_rules.conditions_note` via the bonus rule LEFT JOIN. It is NULL when no bonus rule exists for the requested category, or when the matching bonus rule has no conditions_note set. This enables the UI to display contextual information such as "Earn 4 mpd on dining (10X HSBC rewards). Capped at $1,000/month across bonus categories." directly on recommendation cards.

> **Sprint 22 addition (F31):** Three new columns (`min_spend_threshold`, `min_spend_met`, `total_monthly_spend`) support min spend condition enforcement. When `min_spend_met = FALSE`, the `earn_rate_mpd` column reflects the card's `base_rate_mpd` (not the bonus rate), and the score is computed accordingly. This prevents cards like SC X Card (3.3 mpd requiring $500/month) from being over-recommended to low spenders.

> **Sprint 22 addition (Contactless Badge):** `requires_contactless` (BOOLEAN) is extracted from `earn_rules.conditions->>'contactless'` via the bonus rule LEFT JOIN, defaulting to FALSE when not present. It is propagated through all CTEs (`user_card_rates` → `card_spending` → `scored_cards` → `ranked_cards`) to the final SELECT. This is informational only — scoring is not affected. Cards with `contactless: true` conditions are: KrisFlyer UOB Credit Card (Card 5, 2 mpd dining/transport) and UOB Visa Signature (Card 22, 4 mpd dining/transport/groceries/general — petrol does NOT require contactless). The UI shows a blue info badge on the top card and a "Contactless only" caption on alternative cards.

#### Scoring Formula

```
Effective Score = Effective Earn Rate (MPD) × Cap Ratio
```

**Components:**
- **Effective Earn Rate:** Category-specific bonus rate from `earn_rules`, falls back to `base_rate_mpd` in two cases: (1) no bonus rule exists for the category, or (2) the card has a `min_spend_monthly` condition that the user does not meet (Sprint 22 — F31)
- **Cap Ratio:** Proportion of monthly spending cap remaining (0.0 to 1.0)

#### Min Spend Enforcement (Sprint 22)

For cards with `min_spend_monthly` in their `conditions` JSONB:

```
effective_monthly_spend = GREATEST(actual_monthly_spend, estimated_monthly_spend)

IF effective_monthly_spend >= min_spend_threshold:
    earn_rate = bonus earn_rate_mpd   (min_spend_met = TRUE)
ELSE:
    earn_rate = base_rate_mpd         (min_spend_met = FALSE)
```

- `actual_monthly_spend`: Sum of all card transactions this month (from `transactions` table)
- `estimated_monthly_spend`: User's self-reported estimate (from `user_settings` table, default 0)
- Using `GREATEST` handles early-month scenarios where actual spend is low but the user expects to hit the threshold

#### Cap Ratio Calculation

| Scenario | Cap Ratio | Logic |
|----------|-----------|-------|
| Uncapped card | 1.0 | No spending limit |
| Cap not reached | `remaining / cap` | Proportional to unused cap |
| Cap exhausted | 0.0 | No earning potential |
| New user (no spending) | 1.0 | Full cap available |

#### Ranking Logic

Cards are sorted by three criteria in order:

1. **Primary:** Score DESC (highest effective earning rate wins)
2. **Secondary:** Earn Rate DESC (breaks ties when scores equal, e.g., all caps exhausted)
3. **Tertiary:** Card Name ASC (alphabetical for deterministic results)

### 1.2 Data Pipeline

```
┌─────────────────┐
│ user_cards      │ User's portfolio
├─────────────────┤
│ cards           │ Card metadata (bank, network, base rate)
├─────────────────┤
│ earn_rules      │ Category bonus rates + conditions JSONB
├─────────────────┤
│ caps            │ Monthly spending limits
├─────────────────┤
│ transactions    │ Current month spending
├─────────────────┤
│ user_settings   │ Estimated monthly spend (Sprint 22)
└─────────────────┘
        ↓
┌─────────────────────────────────┐
│ Compute remaining caps          │
│ (cap - category_spend - total)  │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ Calculate score for each card   │
│ score = earn_rate × cap_ratio   │
└─────────────────┬───────────────┘
                  ↓
┌─────────────────────────────────┐
│ Rank cards (score, rate, name)  │
│ Flag top card: is_recommended   │
└─────────────────────────────────┘
```

### 1.3 SQL Query Structure

The `recommend(p_category_id TEXT)` function executes a multi-step query:

**Step 1: Gather Card Data**
```sql
-- Joins user_cards, cards, earn_rules, caps
-- Gets earn rates (bonus or base), cap info, conditions_note, and requires_contactless
-- conditions_note sourced from earn_rules via bonus rule LEFT JOIN
-- requires_contactless extracted from earn_rules.conditions->>'contactless' (Sprint 22)
```

**Step 2: Compute Spending**
```sql
-- Aggregates transactions for current month
-- Separates category-specific vs card-wide spending
```

**Step 3: Score Cards**
```sql
-- Calculates cap_ratio based on remaining cap
-- Computes score = earn_rate_mpd × cap_ratio
```

**Step 4: Rank & Return**
```sql
-- Orders by score DESC, earn_rate_mpd DESC, card_name ASC
-- Flags top row with is_recommended = true
```

### 1.4 Performance Characteristics

- **Execution Time:** < 10ms for typical users (5-7 cards)
- **Optimization:** Multiple indexes on join keys and WHERE clauses
  - `idx_earn_rules_card_category_active`
  - `idx_transactions_user_card_category`
- **Security:** `SECURITY DEFINER` to bypass Row-Level Security for cross-user queries

### 1.5 Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| No cards in portfolio | Returns empty result set |
| All caps exhausted | Ranks by `earn_rate_mpd` only (cap_ratio = 0 for all) |
| No bonus rule for category | Uses `base_rate_mpd` from cards table |
| Mixed cap states | Properly scores both capped and uncapped cards |
| New user (zero spending) | Full cap ratio of 1.0 for all cards |
| Tied scores | Deterministic alphabetical ordering by card name |
| Min spend not met | Falls back to `base_rate_mpd`; card naturally downranked (Sprint 22) |
| No `user_settings` row | Treated as $0 estimated spend (conservative — all min-spend cards downranked) |
| Early month (low actual spend) | Uses `GREATEST(actual, estimated)` — estimated spend prevents false negatives |
| Card with no min spend condition | Unaffected — `min_spend_threshold` returns NULL, `min_spend_met` returns NULL |
| Card with contactless condition | `requires_contactless` = TRUE; scoring unaffected (informational badge only) |
| Card without contactless condition | `requires_contactless` = FALSE (default) |
| Card with `user_selectable` condition | Bonus rate shown assuming user has selected this category. Future: integrate with `user_settings` for actual selections. (Card 29 — UOB Lady's Solitaire) |

### 1.6 Exclusions

**Table:** `exclusions` in `database/seeds/all_cards.sql` (Section 5)

Exclusions define MCC-level carve-outs where a card's bonus earning does not apply. These are seeded in the `exclusions` table and are informational for the current recommendation engine (the `recommend()` function does not filter by exclusions at query time -- exclusions are documented for user awareness and future enforcement).

#### Notable Exclusions (Sprint 21)

| Card | Category | Excluded MCCs | Description |
|------|----------|---------------|-------------|
| HSBC Revolution | dining | 5814 | Fast food restaurants coded under MCC 5814 are excluded from the 4 mpd dining bonus. Per MileLion analysis, fast food (e.g., McDonald's, KFC) coded as MCC 5814 does not earn the 10X bonus rate on HSBC Revolution. Users receive the base 0.4 mpd instead. |
| Most cards (cross-card) | N/A (card-wide) | 6300, 6381, 6399 | Insurance premium payments excluded from bonus earning |
| Most cards (cross-card) | N/A (card-wide) | 9311, 9222, 9211, 9399 | Government-related transactions excluded |

> **Sprint 21 addition:** The HSBC Revolution MCC 5814 fast food exclusion was added to the exclusions table. This is particularly relevant because MCC 5814 (Fast Food Restaurants) is included in the dining category's MCC list (5811, 5812, 5813, 5814), so fast food transactions are categorized as dining but do not earn the 4 mpd bonus on HSBC Revolution.

### 1.7 Client Integration

**Primary Screen:** `app/recommend/[category].tsx`

**User Flow:**
1. User taps a spending category tile
2. App navigates to `/recommend/[category]`
3. Screen calls `supabase.rpc('recommend', { p_category_id })`
4. Top card displayed in glassmorphic card with "USE THIS CARD" label
5. If `conditions_note` is non-null, it is displayed on the top card with an info icon (Sprint 21)
6. If `min_spend_met === false` on the top card, an amber nudge is shown: "Spend $X more this month to unlock bonus rate" (Sprint 22)
7. If `min_spend_met === true` and `min_spend_threshold` exists, a green checkmark is shown: "Min spend met — earning bonus rate" (Sprint 22)
8. If `requires_contactless === true` on the top card, a blue info badge is shown: "Requires contactless payment" (Sprint 22)
9. Alternative cards shown as flat cards below, each showing `conditions_note` (if present) as a single-line caption (Sprint 21), amber warning "Min spend $X/mo not met" if applicable (Sprint 22), and blue "Contactless only" caption if `requires_contactless` (Sprint 22)
10. For the **bills** category, an insurance warning banner is displayed above the top card: "Insurance payments are excluded from bonus earning on most cards. Base rate only." This mitigates the MCC overlap between insurance MCCs (6300, 6381, 6399) in the bills category and the insurance exclusions present on most cards (Sprint 21)
11. User can tap to swap alternatives or log transaction directly

**Smart Suggestions:** `components/RecommendationMatchBanner.tsx`
- Appears during transaction logging flow
- Suggests optimal card based on detected category
- Inline swap functionality

### 1.8 Test Coverage

**File:** `tests/recommendation.test.ts`

The test suite includes 54 tests across multiple describe blocks:

**Core recommendation tests (32 tests, expanded to 46 with Sprint 23-24 additions):**
- Basic ranking (earn rate only)
- Cap-aware ranking (partially used caps)
- Exhausted caps (fallback to earn rate)
- Multiple cards, same category
- No bonus rules (base rate fallback)
- Edge cases (empty portfolio, no transactions)

**F31 — Min spend condition enforcement (6 tests, Sprint 22):**
- Downrank card to base_rate when min_spend NOT met
- Use bonus rate when min_spend IS met
- Not affect cards without min_spend conditions
- Use higher of actual vs estimated spend (early month scenario)
- Treat user with no settings as $0 estimated spend (conservative)
- Correctly rank mixed min-spend and no-min-spend cards

**Contactless badge tests (2 tests, Sprint 22):**
- Card with `contactless: true` → `requires_contactless = true` in output
- Card without contactless condition → `requires_contactless = false`

**Test Implementation:** `rankCards()` function mirrors SQL logic in TypeScript, including min spend enforcement logic (checks `min_spend_monthly`, computes `GREATEST(actual, estimated)`, falls back to `base_rate_mpd`) and contactless extraction (reads `requires_contactless` from input, defaults to `false`)

---

## 2. CATEGORY DETECTION SYSTEM

### 2.1 Architecture Overview

MaxiMile uses a **waterfall approach** with three parallel detection methods:

```
Transaction Merchant Name
         ↓
┌────────────────────────────┐
│ 1. User Override Check     │ (Highest priority)
└────────┬───────────────────┘
         ↓ (if not found)
┌────────────────────────────┐
│ 2. RPC Pattern Matching    │
│    ↓ (if RPC fails)        │
│ 3. Local Keyword Matching  │
└────────┬───────────────────┘
         ↓ (if still no match)
┌────────────────────────────┐
│ 4. Default to "General"    │
└────────────────────────────┘

(Parallel) Location-Based Detection:
┌────────────────────────────┐
│ Google Places API          │ (If GPS available)
└────────────────────────────┘
```

### 2.2 Method 1: User Override System

**Storage:** `user_merchant_overrides` table

**Function:** `saveMerchantOverride(userId, merchantPattern, categoryId)`

**File:** `lib/merchant-mapper.ts`

**Behavior:**
- Exact string match on merchant pattern
- Highest priority (overrides all other methods)
- User creates override via "Remember this merchant" UI
- Unique constraint: `(user_id, merchant_pattern)` - upsert semantics
- Confidence: Inherits from original detection (typically 0.9)

### 2.3 Method 2: Pattern Matching (RPC + Local Fallback)

**Function:** `matchMerchant(userId, merchantName)`

**File:** `lib/merchant-mapper.ts`

#### RPC Pattern Matching

**Database Function:** `match_merchant(p_user_id, p_merchant_name)`

**Process:**
1. Check user overrides first
2. Normalize merchant name (uppercase, strip special chars)
3. Match against database keyword patterns
4. Return `{categoryId, categoryName, confidence, source}`

#### Local Fallback

**Function:** `matchMerchantLocal(merchantName)`

**Keyword Dictionary (50+ merchants per category):**

**Dining:**
```
MCDONALDS, BURGER KING, KFC, PIZZA HUT, SUBWAY, STARBUCKS,
COFFEE BEAN, YA KUN, TOAST BOX, OLD TOWN, KOPITIAM, FOOD REPUBLIC,
DIN TAI FUNG, PARADISE, JUMBO, NO SIGNBOARD, CRYSTAL JADE,
RESTAURANT, CAFE, BISTRO, EATERY, KITCHEN, DINER, GRILL, ...
```

**Transport:**
```
GRAB, GOJEK, TADA, RYDE, CDG, COMFORT, SMRT, SBS TRANSIT,
EZLINK, NETS FLASHPAY, LTA, TAXI, CAB, ...
```

**Groceries:**
```
NTUC, FAIRPRICE, FAIR PRICE, COLD STORAGE, GIANT, SHENG SIONG,
DON DON DONKI, PRIME, U STARS, MARKETPLACE, SUPERMARKET, ...
```

**Petrol:**
```
SHELL, ESSO, CALTEX, SPC, SINOPEC, PETROL, FUEL, GAS STATION, ...
```

**Bills:**
```
SINGTEL, STARHUB, M1, CIRCLES.LIFE, GIGA, SP SERVICES, HDB,
IRAS, AXA, PRUDENTIAL, AIA, GREAT EASTERN, NTUC INCOME,
SINGPOWER, UTILITY, INSURANCE, TELCO, ...
```

**Travel:**
```
SINGAPORE AIRLINES, SIA, SCOOT, JETSTAR, AIRASIA, EXPEDIA,
BOOKING.COM, AGODA, AIRBNB, HOTELS.COM, CHANGI AIRPORT, ...
```

**Online:**
```
SHOPEE, LAZADA, AMAZON, QOO10, CAROUSELL, ZALORA, SEPHORA,
NETFLIX, SPOTIFY, APPLE.COM, GOOGLE PLAY, STEAM, YOUTUBE PREMIUM, ...
```

**Confidence Scoring:**

| Condition | Confidence | Rationale |
|-----------|------------|-----------|
| Keyword ≥ 6 chars | 0.9 | Less likely false positive |
| Keyword < 6 chars | 0.7 | Higher ambiguity |
| No match | 0.0 | Default to General |

**Source Tagging:**
- `user_override` - From user_merchant_overrides table
- `pattern_match` - RPC or local keyword match
- `default` - No match, assigned General category

### 2.4 Method 3: Google Places API (Location-Based)

**Function:** `detectMerchant(latitude, longitude, radius)`

**File:** `lib/merchant.ts`

**Endpoint:** Supabase Edge Function `places-nearby` (proxies Google Places API)

#### Type-to-Category Mapping

**Function:** `mapTypesToCategory(googleTypes: string[])`

**Mapping Table:**

| Google Places Types | MaxiMile Category |
|---------------------|-------------------|
| `restaurant`, `food`, `cafe`, `bakery`, `meal_delivery`, `meal_takeaway`, `bar`, `night_club` | **Dining** |
| `taxi_stand`, `transit_station`, `bus_station`, `train_station`, `subway_station`, `car_rental`, `parking` | **Transport** |
| `airport`, `hotel`, `lodging`, `travel_agency`, `tourist_attraction` | **Travel** |
| `supermarket`, `grocery_or_supermarket`, `convenience_store` | **Groceries** |
| `gas_station` | **Petrol** |
| `post_office`, `insurance_agency`, `local_government_office` | **Bills** |
| `store`, `shopping_mall`, `bank`, `atm`, `hospital`, `doctor`, `pharmacy`, `gym`, `spa`, `beauty_salon`, `clothing_store`, `electronics_store`, `department_store`, `furniture_store`, `hardware_store`, `home_goods_store`, `jewelry_store`, `shoe_store`, `book_store` | **General** |

#### Confidence Calculation

```typescript
if (matchedTypes.length >= 2) {
  confidence = 'high'    // Multiple type matches = strong signal
} else if (matchedTypes.length === 1) {
  confidence = 'medium'  // Single type match
} else {
  confidence = 'low'     // No matches, defaults to General
}
```

#### Caching Strategy

- **TTL:** 5 minutes
- **Key:** Geohash (100m grid precision)
- **Purpose:** Reduce redundant API calls for nearby locations
- **Storage:** In-memory cache (resets on app restart)

### 2.5 Category Definitions

**File:** `constants/categories.ts`

**Total Categories:** 8 (all active: dining, transport, online, groceries, petrol, bills, travel, general)
**Total Cards:** 29 (expanded from 20 — added 9 new cards including Maybank World MC, UOB Visa Signature, DBS Vantage, OCBC Voyage, SC Journey, SC Beyond, HSBC Premier MC, Maybank XL Rewards, UOB Lady's Solitaire)

| ID | Name | Icon | Emoji | Description |
|----|------|------|-------|-------------|
| `dining` | Dining | utensils | 🍽️ | Restaurants, cafes, food delivery |
| `transport` | Transport | car | 🚗 | Grab, taxis, public transport |
| `online` | Online | shopping-cart | 🛒 | E-commerce, digital services |
| `groceries` | Groceries | shopping-bag | 🛍️ | Supermarkets, wet markets |
| `petrol` | Petrol | gas-pump | ⛽ | Fuel stations |
| `bills` | Bills | file-text | 📄 | Utilities, insurance, telco |
| `travel` | Travel | plane | ✈️ | Flights, hotels, tours |
| `general` | General | credit-card | 💳 | Everything else |

#### Sprint 21 Category Notes

**Petrol:** The Google Places type `gas_station` maps to the `petrol` category (see `lib/merchant.ts` mapping). This ensures location-based merchant detection correctly routes fuel station transactions.

**Bills:** All 29 cards now have base-rate earn rules for the bills category (seeded in `all_cards.sql`). No cards have bonus rules for bills -- all cards earn their respective base rate on bills/utilities spend. This is by design: bills payments (utilities, insurance premiums, telco) rarely qualify for bonus earning on Singapore miles cards.

> **Insurance MCC overlap:** The bills category includes insurance MCCs (6300, 6381, 6399), but most cards also have insurance exclusions that prevent bonus earning on these MCCs. Since all bills earn rules are base-rate only (`is_bonus = FALSE`), the exclusions do not cause incorrect recommendations. However, users may still be surprised that insurance payments earn only base rate. This is mitigated by a UI warning banner displayed on the bills recommendation screen (see Section 1.7).

### 2.6 Data Structure: MerchantMatch

```typescript
interface MerchantMatch {
  categoryId: string;        // e.g., "dining"
  categoryName: string;      // e.g., "Dining"
  confidence: number;        // 0.0 - 1.0 scale
  source: 'user_override' | 'pattern_match' | 'default';
}
```

**Usage in UI:**

`components/MerchantCard.tsx` displays merchant with:
- Category icon + name
- Confidence badge (High/Medium/Low)
- "Remember this merchant" button (creates user override)

---

## 3. AI-POWERED RATE CHANGE DETECTION

### 3.1 System Architecture

**Location:** `maximile-app/scraper/src/ai/`

**Purpose:** Detect credit card earn rate changes from bank websites using AI classification

```
Bank Website Scraper
        ↓
   Page Change Detected (diff)
        ↓
┌──────────────────────────────┐
│ Classifier Orchestrator      │
│ classifyPageChange()         │
└──────────┬───────────────────┘
           ↓
┌──────────────────────────────────────┐
│ PRIMARY: Gemini Flash 2.0            │
│ - Function calling (tool_use)        │
│ - Structured output enforcement      │
│ - Free tier: 250 req/day             │
└──────────┬───────────────────────────┘
           ↓ (on failure)
┌──────────────────────────────────────┐
│ FALLBACK: Groq Llama 3.3 70B         │
│ - JSON mode (structured output)      │
│ - Free tier: 1,000 req/day           │
└──────────┬───────────────────────────┘
           ↓ (if both fail)
┌──────────────────────────────────────┐
│ Return "no changes detected"         │
│ with error notes for debugging       │
└──────────────────────────────────────┘
```

### 3.2 Primary Provider: Gemini Flash 2.0

**File:** `scraper/src/ai/gemini-client.ts`

**API:** Google Generative AI (`@google/generative-ai`)

**Key Features:**
- **Native Function Calling:** Uses `tool_use` mode with `RATE_CHANGE_TOOL` schema
- **Automatic Validation:** Model enforces structured output at generation time
- **Retry Logic:** Retries once with `temperature=0` on validation failure
- **Timeout:** 30 seconds
- **Rate Limits:** 250 requests/day (free tier)

**Prompt Structure:**
```
System Prompt (role definition, change types, card list, rules)
    +
Few-Shot Examples (5 real-world examples)
    +
User Prompt (OLD content, NEW content, page metadata)
```

**Tool Schema:** `RATE_CHANGE_TOOL`

Enforces structured output with fields:
- `detected_changes: array` - List of rate changes detected
- `total_changes: integer` - Count of changes
- `confidence_score: float` - Overall confidence (0.0-1.0)

### 3.3 Fallback Provider: Groq Llama 3.3 70B

**File:** `scraper/src/ai/groq-client.ts`

**API:** Groq Cloud (`groq-sdk`)

**Key Features:**
- **JSON Mode:** `response_format: { type: "json_object" }`
- **Full System Prompt:** Same prompt as Gemini, but no native tool_use
- **JSON Schema Validation:** Manual validation via Zod after generation
- **Retry Logic:** Retries once on parse/validation failure
- **Timeout:** 30 seconds
- **Rate Limits:** 1,000 requests/day (free tier)

**Why Groq as Fallback?**
- Higher rate limit than Gemini (1,000 vs 250)
- Fast inference speed (important for scraper)
- Good JSON mode support
- More lenient than Gemini (sometimes catches edge cases Gemini misses)

### 3.4 Detected Change Schema

**File:** `scraper/src/ai/schema.ts`

```typescript
interface DetectedRateChange {
  // Identification
  card_name: string;                    // e.g., "DBS Woman's World Card"
  change_type: ChangeType;              // See 3.5 below

  // Category (null if card-wide change)
  category: CategoryId | null;          // e.g., "dining", "transport"

  // Change Details
  old_value: string;                    // e.g., "4 mpd cap S$1,500/month"
  new_value: string;                    // e.g., "4 mpd cap S$1,000/month"
  effective_date: string | null;        // YYYY-MM-DD format

  // Classification
  severity: 'info' | 'warning' | 'critical';
  confidence: number;                   // 0.00-1.00

  // User-Facing Alerts
  alert_title: string;                  // Max 60 chars
  alert_body: string;                   // Max 300 chars
}
```

### 3.5 Change Types

| Type | Description | Examples |
|------|-------------|----------|
| `earn_rate_change` | Miles/points per dollar changed | 4 mpd → 2 mpd |
| `cap_adjustment` | Spending cap modified | S$1,500 → S$1,000 monthly cap |
| `program_devaluation` | Redemption value decreased | 5,000 miles → 7,500 miles for flight |
| `new_card_launch` | New card introduced | OCBC 90°N Card launch |
| `card_discontinued` | Card terminated/no longer issued | OCBC Titanium Rewards discontinued |

### 3.6 Severity Classification

**Critical** (Red Alert):
- Earn rate decreases > 20%
- Card discontinuation
- Program devaluation (miles worth less)

**Warning** (Amber):
- Earn rate decreases ≤ 20%
- Cap reductions
- Fee increases
- Benefit removals

**Info** (Green):
- Earn rate increases
- New benefits added
- New card launches
- Cap increases

### 3.7 Confidence Scoring

**File:** `scraper/src/ai/prompts.ts`

**Confidence Guidelines (from system prompt):**

| Range | Interpretation | Examples |
|-------|----------------|----------|
| **0.90-1.00** | Clear, unambiguous change with explicit numerical values | "4 mpd reduced to 2 mpd effective 1 Jan 2026" |
| **0.70-0.89** | Likely change with some ambiguity or missing info | "Earn rate may decrease from Jan 2026" (no specific numbers) |
| **0.50-0.69** | Possible change needing human verification | "Selected merchants excluded from bonus" (which merchants?) |
| **< 0.50** | Cosmetic/formatting changes, not a real change | Paragraph reordered, typo fixed, date formatting changed |

### 3.8 Few-Shot Examples

**File:** `scraper/src/ai/prompts.ts`

**5 Real-World Examples:**

1. **Amex Membership Rewards Devaluation** (Critical, 0.95)
   - Old: 1,000 points = $6.70 in vouchers
   - New: 1,000 points = $5.00 in vouchers

2. **DBS Woman's World Cap Reduction** (Warning, 0.92)
   - Old: 4 mpd cap S$2,000/month
   - New: 4 mpd cap S$1,500/month

3. **BOC Elite Miles Rate Increase** (Info, 0.88)
   - Old: 1.2 mpd on general spend
   - New: 1.4 mpd on general spend

4. **Maybank Horizon Cap + Fee Changes** (Warning, 0.85)
   - Cap reduction: S$10,000 → S$8,000
   - Annual fee increase: S$180 → S$192.60

5. **HSBC Revolution Cap Increase** (Info, 0.90)
   - Old: S$2,000 monthly cap
   - New: S$2,500 monthly cap

### 3.9 Confidence-Based Routing

**File:** `scraper/src/ai/router.ts`

**Function:** `routeDetectedChanges(changes: DetectedRateChange[])`

**Three-Tier System:**

```
┌───────────────────────────────────┐
│ Confidence ≥ 0.85                 │
│ AND                               │
│ Source = Tier-1 (bank T&C/notice) │
└──────────┬────────────────────────┘
           ↓
    ┌─────────────┐
    │ Auto-Approve │ → Insert into `rate_changes`
    └─────────────┘    (publish to users immediately)

┌───────────────────────────────────┐
│ Confidence 0.50-0.84              │
│ OR                                │
│ Confidence ≥ 0.85 but non-Tier-1  │
└──────────┬────────────────────────┘
           ↓
    ┌─────────────┐
    │ Review Queue │ → Insert into `detected_changes`
    └─────────────┘    status = 'detected'
                       (human review via admin panel)

┌───────────────────────────────────┐
│ Confidence < 0.50                 │
└──────────┬────────────────────────┘
           ↓
    ┌─────────────┐
    │ Auto-Discard │ → Insert into `detected_changes`
    └─────────────┘    status = 'rejected'
                       (logged for debugging only)
```

**Tier-1 Sources (highest trust):**
- Bank official T&C pages
- Bank press releases/announcements
- Official bank PDFs

**Non-Tier-1 Sources:**
- Community forums (HardwareZone, Reddit r/singaporefi)
- Miles/points blogs
- Facebook groups

### 3.10 Deduplication Strategy

**Fingerprinting:**
```typescript
const fingerprint = sha256(
  card_slug + "|" +
  change_type + "|" +
  normalizeValue(new_value) + "|" +
  YYYY-MM  // Month-level dedup
)
```

**Logic:**
- Same card + change type + new value within same month = duplicate
- Prevents duplicate alerts from multiple sources
- Checked before auto-approval
- Stored in `detected_changes.fingerprint` column (unique constraint)

### 3.11 Tracked Cards

**29 cards across 9 banks:**

- **DBS:** Altitude, Woman's World, Live Fresh (3)
- **OCBC:** 90°N, Titanium Rewards, VOYAGE, GREAT Eastern (4)
- **UOB:** PRVI Miles, EVOL, One, Lady's (4)
- **HSBC:** Revolution, TravelOne, Advance (3)
- **Amex:** KrisFlyer, Platinum (2)
- **BOC:** Elite Miles (1)
- **Standard Chartered:** Unlimited Cashback, Smart, Priority Banking Titanium, JustOne, Simply Cash (5)
- **Maybank:** Horizon, Family & Friends, FC Barcelona, eVibes (4)
- **Citi:** Rewards, PremierMiles (2)

**Total:** 29 cards (Singapore market focus)

### 3.12 System Prompt Structure

**File:** `scraper/src/ai/prompts.ts`

**Sections:**

1. **Role Definition**
   - You are a Singapore credit card rate change detector
   - Analyze changes to miles/points earning rates

2. **Change Types**
   - 5 types with descriptions (earn_rate_change, cap_adjustment, etc.)

3. **Tracked Cards**
   - List of 29 cards with bank names

4. **Output Format**
   - JSON structure specification
   - Field descriptions and constraints

5. **Severity Guidelines**
   - Critical: Earn rate ↓ >20%, devaluations, discontinuations
   - Warning: Earn rate ↓ ≤20%, cap reductions, fee increases
   - Info: Improvements, new launches

6. **Confidence Guidelines**
   - 0.9-1.0: Clear numerical changes
   - 0.7-0.89: Some ambiguity
   - 0.5-0.69: Needs verification
   - <0.5: Cosmetic only

7. **Important Rules**
   - NO fabrication (only detect real changes in diff)
   - Ignore cosmetic changes (formatting, typos, whitespace)
   - Singapore market only (ignore foreign currency promotions)
   - Effective dates in YYYY-MM-DD format
   - Alert title max 60 chars, body max 300 chars

---

## 4. DATA SOURCES & INPUTS

### 4.1 For Recommendations

**Primary Tables:**

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `user_cards` | User's card portfolio | user_id, card_id |
| `cards` | Card metadata | id, name, bank, network, base_rate_mpd |
| `earn_rules` | Category bonus rates + conditions | card_id, category_id, earn_rate_mpd, conditions_note, conditions (JSONB) |
| `caps` | Spending caps | card_id, category_id, monthly_cap_amount |
| `exclusions` | MCC-level exclusions from bonus earning | card_id, category_id, excluded_mccs |
| `transactions` | User spending history | user_id, card_id, category_id, amount, date |
| `user_settings` | User preferences (Sprint 22) | user_id, estimated_monthly_spend |

**Real-Time Computation:**
- Current month transactions aggregated on-the-fly via SQL
- Remaining cap: `cap - SUM(transactions.amount) WHERE date >= start_of_month`

**Optional Enhancement:**
- `spending_state` table for pre-computed monthly summaries (performance optimization)

### 4.2 For Category Detection

**Primary Sources:**

| Source | Priority | Data Type |
|--------|----------|-----------|
| `user_merchant_overrides` | 1 (Highest) | User-curated exact matches |
| Database RPC `match_merchant()` | 2 | Pattern matching via SQL |
| Local keyword dictionary | 3 (Fallback) | Hardcoded TypeScript patterns |
| Google Places API | Parallel | Location-based types |

**Keyword Dictionary Size:**
- 50+ merchants per category
- Total ~350 keywords across 7 categories
- Maintained in `lib/merchant-mapper.ts`

### 4.3 For Rate Change Detection

**Primary Sources:**

| Source | Update Frequency | Trust Level |
|--------|------------------|-------------|
| Bank T&C pages | Daily scrape | Tier-1 (auto-approve if ≥0.85 confidence) |
| Bank announcements | Daily scrape | Tier-1 |
| Community forums | Planned v1.5 | Non-Tier-1 (review queue) |
| User submissions | Planned v1.5 | Non-Tier-1 (review queue) |

**Storage:**
- Page snapshots stored in `page_snapshots` table
- Diffs computed via text comparison (removed lines, added lines)
- Detected changes in `detected_changes` table
- Approved changes in `rate_changes` table (published to users)

---

## 5. KEY FILES & FUNCTIONS

### 5.1 Recommendation System

| File | Function/Component | Responsibility |
|------|-------------------|----------------|
| `database/functions/recommend.sql` | `recommend(p_category_id)` | Core SQL ranking algorithm (with min spend enforcement) |
| `tests/recommendation.test.ts` | `rankCards()` | TypeScript mirror of SQL logic for testing |
| `app/recommend/[category].tsx` | `RecommendResultScreen` | UI screen displaying ranked cards (with min spend nudges) |
| `app/spending-settings.tsx` | `SpendingSettingsScreen` | User inputs estimated monthly spend (Sprint 22) |
| `database/migrations/020_min_spend_enforcement.sql` | — | `user_settings` table + RLS (Sprint 22) |
| `components/RecommendationMatchBanner.tsx` | `RecommendationMatchBanner` | Smart suggestion in transaction log flow |

### 5.2 Category Detection

| File | Function | Responsibility |
|------|----------|----------------|
| `lib/merchant-mapper.ts` | `matchMerchant()` | RPC call + local fallback orchestrator |
| `lib/merchant-mapper.ts` | `matchMerchantLocal()` | Keyword-based local matching |
| `lib/merchant-mapper.ts` | `saveMerchantOverride()` | Persist user overrides to database |
| `lib/merchant.ts` | `detectMerchant()` | Google Places API integration |
| `lib/merchant.ts` | `mapTypesToCategory()` | Places types → MaxiMile categories |
| `constants/categories.ts` | `CATEGORIES`, `CATEGORY_MAP` | 8 category definitions |
| `components/MerchantCard.tsx` | `MerchantCard` | Display component with confidence badge |

### 5.3 AI Classification

| File | Function/Export | Responsibility |
|------|-----------------|----------------|
| `scraper/src/ai/classifier.ts` | `classifyPageChange()` | Orchestrator (Gemini → Groq fallback) |
| `scraper/src/ai/gemini-client.ts` | `classifyWithGemini()` | Gemini Flash implementation |
| `scraper/src/ai/groq-client.ts` | `classifyWithGroq()` | Groq Llama fallback |
| `scraper/src/ai/schema.ts` | `RATE_CHANGE_TOOL`, `GROQ_RESPONSE_SCHEMA` | Zod schemas for validation |
| `scraper/src/ai/prompts.ts` | `SYSTEM_PROMPT`, `FEW_SHOT_EXAMPLES` | Prompt engineering |
| `scraper/src/ai/router.ts` | `routeDetectedChanges()` | Confidence-based routing + dedup |

---

## 6. BUSINESS RULES SUMMARY

### 6.1 Recommendation Scoring

```
Effective Score = Effective Earn Rate × Cap Ratio

Where:
  Effective Earn Rate =
    IF min_spend_monthly condition exists AND effective_spend < threshold:
      cards.base_rate_mpd  (downranked — Sprint 22)
    ELSE:
      earn_rules.earn_rate_mpd (if exists)
      OR cards.base_rate_mpd (fallback)

  effective_spend = GREATEST(actual_monthly_spend, estimated_monthly_spend)

  Cap Ratio = min((cap - spent) / cap, 1.0) if capped
              OR 1.0 if uncapped
              OR 0.0 if cap exhausted
```

**Ranking:** Score DESC → Earn Rate DESC → Card Name ASC

### 6.2 Category Assignment

**Decision Flow:**

```
1. Check user_merchant_overrides (exact match)
   → Return user override if found

2. Try RPC match_merchant()
   → Return RPC result if successful

3. Fall back to local keyword matching
   a. Normalize merchant name (uppercase, strip special chars)
   b. Search keyword lists (order matters, first match wins)
   c. Score: 0.9 if keyword ≥6 chars, 0.7 if <6 chars

4. Default to "General" (confidence 0)

(Parallel) If GPS available:
5. Call Google Places API
6. Map Places types to categories
7. Return highest-confidence result (override > RPC > Places > local)
```

### 6.3 Rate Change Detection

**Classification Flow:**

```
1. Scraper detects page change (diff OLD vs NEW)

2. Send to Gemini Flash
   - Function calling with RATE_CHANGE_TOOL
   - If success → proceed to routing
   - If fail → try Groq

3. Send to Groq Llama (fallback)
   - JSON mode with schema
   - If success → proceed to routing
   - If fail → log "no changes detected" with error

4. Route by confidence:
   - ≥0.85 + Tier-1 source → Auto-approve to rate_changes
   - 0.50-0.84 OR ≥0.85 non-Tier-1 → Review queue (detected_changes)
   - <0.50 → Auto-discard (log only)

5. Deduplicate via fingerprint (card|type|value|month)
```

---

## 7. TECHNICAL NOTES FOR SMES

### 7.1 Recommendation Engine Considerations

**Strengths:**
- Real-time cap tracking (no stale data)
- Multi-criteria ranking ensures deterministic results
- Handles edge cases gracefully
- SQL-based (leverages database indexes for performance)

**Potential Limitations:**
- Cap calculation assumes linear monthly spending (doesn't predict future spending patterns)
- No ML/AI - purely rule-based scoring
- Doesn't account for signup bonuses, annual fees, or other card economics
- Current month only (doesn't look ahead to next month's refreshed caps)

**Optimization Opportunities:**
- Pre-compute spending summaries nightly (reduce transaction table scans)
- Cache recommendations for 5 minutes (reduce RPC calls)
- Add "spending velocity" heuristic (predict if cap will be hit before month-end)

### 7.2 Category Detection Considerations

**Strengths:**
- Multi-source approach (high coverage)
- User overrides provide personalization
- Location-based detection handles new/unknown merchants
- Confidence scoring helps UX communicate certainty

**Potential Limitations:**
- Keyword lists require manual maintenance (new merchants = missed matches)
- Google Places API costs money at scale (after free tier)
- No learning/adaptation (static keyword lists)
- Singapore-centric (international merchants may not map correctly)

**Optimization Opportunities:**
- Train ML classifier on user override data (learn new patterns)
- Implement merchant name normalization (handle typos, abbreviations)
- Community-sourced merchant database (crowdsource new merchants)
- Fuzzy matching for misspellings (e.g., "GRABCAR" vs "GRAB CAR")

### 7.3 AI Classification Considerations

**Strengths:**
- Dual-provider redundancy (high uptime)
- Confidence-based routing (balances automation vs accuracy)
- Few-shot learning (good performance without fine-tuning)
- Deduplication prevents alert spam

**Potential Limitations:**
- Free tier rate limits (250 Gemini, 1,000 Groq per day)
- No fine-tuning (generic LLMs, not specialized for Singapore card market)
- Hallucination risk (AI may fabricate changes if prompted poorly)
- Requires human review for medium-confidence (0.50-0.84) detections

**Optimization Opportunities:**
- Fine-tune Gemini on 6 months of labeled rate changes (improve accuracy)
- Add source reputation scoring (bank sites > forums > social media)
- Implement change impact quantification (e.g., "costs avg user $50/year")
- Build feedback loop (admin marks false positives → retrain prompts)

### 7.4 Data Quality & Governance

**Current State:**
- Earn rules, caps: Manually entered via admin panel
- Merchant keywords: Hardcoded in TypeScript (version-controlled)
- Rate changes: AI-detected, human-reviewed (for medium confidence)

**Recommendations:**
- Implement data versioning for earn_rules/caps (audit trail for changes)
- Add data quality checks (e.g., earn_rate_mpd must be > 0, caps must be positive)
- Create admin dashboard for keyword management (CRUD for merchant patterns)
- Export merchant override data for ML training (build supervised learning dataset)

---

## 8. APPENDIX: TESTING STRATEGY

### 8.1 Recommendation Engine Tests

**File:** `tests/recommendation.test.ts`

**Coverage:**
- ✅ Basic ranking (no caps)
- ✅ Cap-aware ranking (partial cap usage)
- ✅ Exhausted caps (fallback to earn rate)
- ✅ Mixed portfolio (capped + uncapped cards)
- ✅ No bonus rules (base rate fallback)
- ✅ Empty portfolio (edge case)
- ✅ Deterministic ordering (alphabetical ties)
- ✅ Min spend enforcement — 6 tests (Sprint 22)
- ✅ Contactless badge — 2 tests (Sprint 22)
- ✅ Card 21 Maybank World MC — 1 test (petrol uncapped, no min spend)
- ✅ Card 22 UOB Visa Signature — 3 tests (contactless + min spend, petrol no contactless, online base rate)
- ✅ Card 23-29 expansion — 10 tests (Sprint 23): DBS Vantage min spend, OCBC Voyage flat rate, SC Journey transport/groceries bonus, SC Beyond flat rate, HSBC Premier flat rate, Maybank XL dining/online/travel bonus + min spend, UOB Lady's Solitaire user-selectable categories
- ✅ User-selectable condition handling — 4 tests (Sprint 24): user_selectable bonus active, user_selectable base rate fallback, mixed selectable + non-selectable cards, selectable cap tracking

**Test Implementation:**
- TypeScript function `rankCards()` mirrors SQL logic
- Uses in-memory data structures (no database required)
- Validates `is_recommended` flag assignment
- Extracts `requires_contactless` from input (defaults to `false`)

### 8.2 Category Detection Tests

**Recommended Tests (not yet implemented):**
- User override precedence
- Keyword matching (various merchant names)
- Confidence scoring (keyword length)
- Google Places type mapping
- Fallback to "General"
- Normalization edge cases (special chars, case)

### 8.3 AI Classification Tests

**Recommended Tests (not yet implemented):**
- Gemini happy path (successful classification)
- Groq fallback (Gemini failure)
- Both providers fail (error handling)
- Confidence-based routing (all three tiers)
- Deduplication (fingerprint collisions)
- Few-shot prompt effectiveness (precision/recall metrics)

---

## 9. GLOSSARY

| Term | Definition |
|------|------------|
| **MPD** | Miles Per Dollar - the rate at which credit card spending earns miles/points |
| **Cap** | Monthly spending limit for bonus earn rates (e.g., 4 mpd up to S$1,500/month) |
| **Cap Ratio** | Proportion of monthly cap remaining (0.0 = exhausted, 1.0 = full cap available) |
| **Earn Rate** | Miles/points earning rate (base rate or category-specific bonus rate) |
| **RPC** | Remote Procedure Call - Supabase function callable via `supabase.rpc()` |
| **Tier-1 Source** | High-trust data source (bank official pages) eligible for auto-approval |
| **Confidence** | AI model's certainty about a detected change (0.0-1.0 scale) |
| **Severity** | Impact classification: info (positive), warning (negative), critical (severe negative) |
| **Fingerprint** | SHA-256 hash for deduplicating detected changes |
| **Few-Shot Learning** | AI technique using 5 examples to guide model behavior without fine-tuning |
| **Function Calling** | Gemini's native structured output mode (tool_use) |
| **JSON Mode** | Groq's structured output mode (response_format: json_object) |

---

## Document Metadata

- **Author:** AI Analysis via Claude Code
- **Date:** 2026-02-26
- **Version:** 1.4 (Card Expansion — 29 cards across 7 banks)
- **Target Audience:** SMEs, Technical Reviewers, Product Managers
- **Sprint 22 Changes (F31):**
  - Added 3 new return columns: `min_spend_threshold`, `min_spend_met`, `total_monthly_spend` (Section 1.1)
  - Updated scoring formula with min spend enforcement logic (Section 1.1)
  - Added `user_settings` to data pipeline diagram (Section 1.2)
  - Added 4 new edge cases for min spend handling (Section 1.5)
  - Updated client integration with min spend nudge UI (Section 1.7)
  - Updated test coverage: 54 tests total, 6 new F31 tests (Section 1.8)
  - Added `user_settings` to data tables (Section 4.1)
  - Updated business rules scoring formula (Section 6.1)
  - Added new key files: `spending-settings.tsx`, `020_min_spend_enforcement.sql` (Section 5.1)
- **Sprint 21 Changes:**
  - Added `conditions_note` return column to recommendation engine documentation (Section 1.1)
  - Added Exclusions section (Section 1.6) with HSBC Revolution MCC 5814 fast food exclusion
  - Updated Client Integration (Section 1.7) with conditions_note display and insurance warning banner
  - Confirmed 8 active categories with bills/petrol notes (Section 2.5)
  - Updated data tables to include `exclusions` and `conditions_note` (Section 4.1)
- **Related Documents:**
  - `docs/technical/ARCHITECTURE.md` (system architecture)
  - `docs/technical/DATABASE_SCHEMA.md` (data model)
  - `docs/sprints/SPRINT_15_PLAN.md` (AI classification implementation)
