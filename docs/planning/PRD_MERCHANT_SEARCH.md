# PRD Section: Merchant Search
## MaxiMile — Feature F35

**Version**: 1.0
**Date**: 2026-03-02
**Author**: PM Agent (FULL Tier)
**Status**: Draft
**Parent PRD**: `docs/planning/PRD.md` v2.5
**Epic**: Epic 15 — Merchant-Driven Discovery

---

## Table of Contents

1. [Problem Statement & User Pain Point](#1-problem-statement--user-pain-point)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [User Stories](#3-user-stories)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Scope & Out of Scope](#6-scope--out-of-scope)
7. [RICE Scoring](#7-rice-scoring)
8. [Dependencies & Risks](#8-dependencies--risks)
9. [Analytics Events](#9-analytics-events)

---

## 1. Problem Statement & User Pain Point

### 1.1 Structured Problem Statement

**Persona**: "Category-Confused Caleb" — a Singapore urban professional aged 28–42, holding 3–7 credit cards, who is motivated to optimize miles but encounters a UX dead-end at the point of intent. Caleb is mid-proficiency: he knows he should be optimizing, he wants to use MaxiMile, but he freezes when confronted with an abstract category grid that doesn't map cleanly onto the physical world he lives in.

**Goal / Job-to-be-Done**: At the moment Caleb decides to pay, he needs to know — instantly and with confidence — which card to tap. He thinks in merchants ("I'm at Shake Shack"), not categories ("Is this Dining? General? Online?").

**Mental Model (Current Approach)**: Caleb opens MaxiMile's home screen and sees 8 category tiles. He mentally translates his real-world context ("I'm buying a Grab ride") into an abstract category ("Transport"). This translation works for common cases. It breaks down for:
- Ambiguous merchants (is Shopee "Online" or "General"?),
- Multi-category merchants (Takashimaya Food Hall — Dining or General?),
- Singapore-specific edge cases (Redmart as Groceries, though it is owned by Grab and feels "online"),
- Specialty merchants the user has never categorized before.

**Friction**: Users who know WHERE they're spending but not WHICH CATEGORY it maps to have no way to ask MaxiMile. They must:
1. Guess a category tile and hope they chose correctly, or
2. Leave the app and check an external source (MileLion blog, bank T&C), or
3. Skip optimization entirely and default to their "safe" fallback card.

All three outcomes represent a failure of the core product promise.

**Impact**:
- Lost recommendations: Each category mis-guess routes users to a wrong recommendation, potentially costing 1–3 mpd per transaction. At SGD 80 average transaction value, a 1.5 mpd delta = 120 miles lost per transaction, 52 times a year = **6,240 miles lost annually** on guessing errors alone.
- Abandonment: Users who cannot find their merchant quickly learn the category grid doesn't speak their language. They stop consulting MaxiMile and default to a single card — reversing the entire value proposition.
- Trust erosion: A wrong recommendation is worse than no recommendation. If Caleb picks "Dining" for his Shopee transaction, the recommendation card may not earn the promised rate, damaging his trust in the app.

**Full Problem Statement**:

> A **Singapore credit card miles optimizer** who **thinks in merchant names, not spend categories**, needs to **instantly know which card to use when at a specific merchant** but cannot do so effectively because **MaxiMile only exposes an 8-tile category grid that requires manual mental translation from merchant to category**, leading to **guessing errors, recommendation distrust, and quiet abandonment of the app at the moment of highest intent**.

### 1.2 Five Whys Root Cause Analysis

| Why # | Question | Answer |
|-------|----------|--------|
| 1 | Why don't users find the right recommendation? | They pick the wrong category tile |
| 2 | Why do they pick the wrong tile? | They don't know which category their merchant maps to |
| 3 | Why don't they know the mapping? | The app speaks categories; users speak merchants |
| 4 | Why does the app speak categories? | The data model is built on category × earn rule; there was no merchant layer at launch |
| 5 | Why is there no merchant layer? | Merchant→category mapping existed only in `lib/merchant-mapper.ts` for the auto-capture flow, not exposed in the discovery UI |

**Root Cause**: The discovery UI (home screen) was designed around the data model (categories), not the user's mental model (merchants). The merchant-mapping infrastructure already exists — it simply isn't surfaced.

### 1.3 Innovation Sweet Spot Validation

| Dimension | Assessment | Verdict |
|-----------|------------|---------|
| **Desirability** | Users search by merchant name in every comparable app (Google Maps, Yelp, Grab). This is the dominant mental model for place-based spending decisions. High user pull. | Pass |
| **Feasibility** | `lib/merchant-mapper.ts` (128 lines, ~60 merchants) and `supabase RPC match_merchant` already exist. The recommendation engine (`rpc('recommend', { p_category_id })`) only needs a category to run. The bridge between search and recommendation is architecturally trivial. | Pass |
| **Viability** | Merchant search increases recommendation surface coverage. More accurate recommendations → higher MARU → stronger retention → premium subscription upsell potential. No marginal infrastructure cost. | Pass |

---

## 2. Goals & Success Metrics

### 2.1 Feature Goal

Enable users to reach the correct card recommendation in under 10 seconds by searching for a merchant name — without needing to know or guess the spend category.

### 2.2 Alignment with North Star Metric

**North Star**: Monthly Active Recommendation Users (MARU) — the count of distinct users who receive at least one card recommendation in a given month.

Merchant Search expands MARU by:
1. Recovering users who currently bounce off the category grid without getting a recommendation.
2. Increasing recommendation frequency for existing MARU users who previously guessed wrong or skipped ambiguous merchants.
3. Reducing recommendation-to-wrong-category events that erode trust and suppress future sessions.

### 2.3 Success Metrics

#### Primary Metric (MARU-linked)
| Metric | Baseline (Estimated) | Target (90 days post-launch) | Measurement Method |
|--------|---------------------|------------------------------|--------------------|
| Monthly Active Recommendation Users (MARU) | Current cohort | +15% lift vs control | Analytics: `recommendation_used` events, distinct user_id per month |

#### Feature-Specific Metrics
| Metric | Definition | Target |
|--------|------------|--------|
| **Merchant Search Adoption Rate** | % of recommendation sessions initiated via merchant search (vs category tile) | 25% of sessions within 60 days |
| **Merchant Match Rate** | % of merchant search queries that return a non-default (non-"General") category match | ≥ 70% of searches |
| **Search-to-Recommendation Conversion** | % of merchant search initiations that result in a `recommendation_used` event | ≥ 80% |
| **Category Override Rate** | % of matched results where user manually overrides the auto-detected category | < 15% (proxy for matching accuracy) |
| **Search Abandonment Rate** | % of sessions where user opens search, types, but navigates away without selecting | < 20% |
| **P50 Local Search Latency** | Time from keystroke stop to dropdown render (local path) | < 150ms |
| **P95 Local Search Latency** | | < 200ms |

#### Guardrail Metrics (Must Not Regress)
| Metric | Guardrail |
|--------|-----------|
| Category tile click-through rate | Must not drop > 10% (search supplements, not replaces, tile UX) |
| Recommendation result satisfaction (inferred by Log Transaction CTA tap) | Must not drop |
| App crash rate | Zero new crashes attributable to search component |

### 2.4 OKR Alignment

**Objective**: Make MaxiMile the default tool Singapore miles optimizers reach for at the point of payment.

| Key Result | How Merchant Search Contributes |
|------------|--------------------------------|
| KR1: Grow MARU by 30% in Q1 2026 | Search recovers bounced users and increases per-user recommendation frequency |
| KR2: Achieve ≥ 3 recommendation sessions per MARU user per month | Search enables recommendations for previously ambiguous spending occasions |
| KR3: Reduce time-to-recommendation to < 10 seconds | Search eliminates the category-guessing step (currently estimated 15–30 seconds for ambiguous cases) |

---

## 3. User Stories

### Epic: Merchant-Driven Discovery (F35)

#### Core Stories (MVP)

**F35-S1 — Merchant Search Entry**
> As a user who is about to pay at a specific merchant, I want to type the merchant name in a search bar on the home screen, so that I can get a card recommendation without having to figure out which category it belongs to.

Acceptance Criteria:
- A search bar is visible and accessible from the home screen (Recommend tab) without any additional taps
- The search bar has a placeholder text: "Search merchant (e.g. Shake Shack, Shopee)"
- Tapping the search bar does not navigate away from the home screen; results appear inline below the search bar
- The existing 8 category tiles remain visible and tappable when the search bar is empty (no regression)

---

**F35-S2 — Live Autocomplete Dropdown**
> As a user typing a merchant name, I want to see matching merchant suggestions appear as I type, so that I can quickly select without finishing the full spelling.

Acceptance Criteria:
- Suggestions appear after the user types ≥ 2 characters (debounced at 300ms)
- Each suggestion row shows: merchant name, inferred category name, and category icon
- Maximum 5 suggestions shown; list is scrollable if needed
- Matching is case-insensitive and handles partial strings (e.g., "NTUC" matches "NTUC FairPrice", "Fair" matches "FairPrice")
- Suggestions are sorted: exact-prefix matches first, then partial matches
- The category shown is derived from `matchMerchantLocal()` for instant local results; upgraded to `matchMerchant()` (RPC) if the local result returns `source: 'default'`

---

**F35-S3 — Merchant Selection and Recommendation Routing**
> As a user, when I select a merchant from the dropdown, I want to be immediately taken to the card recommendation for the correct category, so that I know which card to use.

Acceptance Criteria:
- Selecting a suggestion routes the user to `/recommend/[category]` with the matched `category_id`
- If the matched category has subcategories (e.g., Bills → subcategory selection screen), the user is routed through the existing subcategory flow
- The recommendation result screen shows a contextual label: "Best card for [Merchant Name]" rather than only the category name in the header
- The existing recommendation display (top card, alternatives, Log Transaction CTA, Smart Pay CTA) is unchanged

---

**F35-S4 — No-Match Graceful Fallback**
> As a user whose merchant isn't recognized, I want to be guided to pick a category manually, so that I still get a recommendation rather than a dead end.

Acceptance Criteria:
- When the search returns `source: 'default'` (General fallback with confidence 0), the dropdown shows a row: "[Merchant name] — Category unknown" with a "Pick category manually" sub-label
- Selecting this row keeps the user on the home screen with the 8 category tiles highlighted (scroll into view), with a toast message: "We couldn't match '[merchant]' — pick a category below"
- The unmatched merchant name is captured in an analytics event for merchant dictionary expansion prioritization
- No error state, spinner freeze, or empty screen is shown

---

**F35-S5 — Category Correction (User Override)**
> As a user who knows that the auto-matched category is wrong for this merchant, I want to be able to correct it, so that I get an accurate recommendation.

Acceptance Criteria:
- On the recommendation result screen reached via merchant search, a discrete "Wrong category? Change it" link appears below the card recommendation
- Tapping it navigates back to the home screen with the merchant name pre-populated in the search bar and the category tiles exposed for manual selection
- The correction is captured in analytics (merchant_category_override event)
- Correction is NOT persisted as a user override in this MVP (deferred to F35-S6)

---

#### Enhancement Stories (Post-MVP)

**F35-S6 — User Merchant Override Persistence**
> As a user who has corrected a merchant's category before, I want my correction to be remembered, so that the same merchant always routes to the right recommendation next time.
>
> *Note: `saveMerchantOverride()` in `lib/merchant-mapper.ts` and the `user_merchant_overrides` table already exist — this is a UI/UX integration story, not a data engineering story.*

**F35-S7 — Community Merchant Submissions**
> As a user who regularly shops at a local Singapore merchant not in the database, I want to suggest it be added, so that other users benefit from my local knowledge.
>
> *Note: `community_submissions` table already exists (migration 20260221060000). This story wires the search no-match flow into the community submission pipeline.*

**F35-S8 — Smart Merchant Context from Transaction History**
> As a returning user, I want frequently visited merchants to appear at the top of my search suggestions (based on my past transactions), so that I can tap rather than type for habitual spend.

**F35-S9 — Location-Assisted Merchant Pre-fill**
> As a user with location permissions granted, I want the search bar to auto-suggest the nearest merchant based on my GPS location (via the existing `detectMerchant()` in `lib/merchant.ts`), so that I don't need to type anything for common nearby spending occasions.
>
> *Note: `detectMerchant()` and the Supabase Edge Function proxy for Google Places API already exist. This story surfaces that capability in the search bar, not a new build.*

---

## 4. Functional Requirements

### 4.1 Search Bar Component

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| FR-01 | A TextInput-based search bar is rendered at the top of the Recommend home screen (index.tsx), above the category tile grid | Must Have |
| FR-02 | Search bar is always visible on the home screen without any tap to reveal it; it is not hidden behind a modal or secondary navigation | Must Have |
| FR-03 | Search bar placeholder text reads: "Search merchant (e.g. Shake Shack, Shopee…)" | Must Have |
| FR-04 | Tapping the search bar does not push a new navigation stack; the autocomplete dropdown renders inline within the same screen | Must Have |
| FR-05 | A clear (×) button appears inside the search bar when input is non-empty; tapping it clears the input and collapses the dropdown, restoring the category tile grid | Must Have |
| FR-06 | The search bar is styled consistently with the existing MaxiMile glassmorphism design system (Colors.borderLight, BorderRadius.xl, matching the GlassCard aesthetic) | Should Have |

### 4.2 Autocomplete / Merchant Matching

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| FR-07 | Autocomplete triggers after ≥ 2 characters of input, debounced at 300ms to avoid unnecessary computations on every keystroke | Must Have |
| FR-08 | Local matching is performed first using the existing `matchMerchantLocal()` function from `lib/merchant-mapper.ts`; the RPC `match_merchant` is called only when local matching returns `source: 'default'` (confidence = 0) | Must Have |
| FR-09 | The dropdown renders up to 5 suggestions ranked: (1) exact-prefix matches, (2) partial-string matches, (3) keyword matches from MERCHANT_KEYWORDS | Must Have |
| FR-10 | Each dropdown row displays: merchant display name, inferred category name, and a category icon (using the same Ionicons set as category tiles) | Must Have |
| FR-11 | Matching is case-insensitive; normalization strips special characters consistent with `normalizeMerchantName()` already implemented | Must Have |
| FR-12 | When no match is found (confidence = 0 after both local and RPC paths), a single "fallback row" is shown: "[Query] — Category not found. Pick manually ↓" | Must Have |
| FR-13 | The existing `MERCHANT_KEYWORDS` dictionary in `merchant-mapper.ts` must be expanded with at minimum 50 additional Singapore-specific merchants before launch (see Dependencies) | Must Have |
| FR-14 | The dropdown closes automatically when: (a) the user selects a suggestion, (b) the user taps the clear button, (c) the user taps outside the search input | Must Have |
| FR-15 | Singapore-specific chain variants are normalized: "NTUC" = "NTUC FairPrice" = "Fair Price"; "McD" = "McDonalds"; "Don Don Donki" = "DONKI" | Should Have |

### 4.3 Recommendation Routing

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| FR-16 | Selecting a matched merchant navigates to `/recommend/[category_id]` using the matched `categoryId` from `MerchantMatch` | Must Have |
| FR-17 | For the Bills category, selecting a matched merchant (e.g., "Singtel") navigates to the bills-subcategory screen, not directly to the recommendation, maintaining parity with the category tile Bills flow | Must Have |
| FR-18 | The recommendation screen header (`Stack.Screen title`) displays "[Merchant Name] — [Category Name]" (e.g., "Shake Shack — Dining") when reached via merchant search | Should Have |
| FR-19 | The recommendation result screen is otherwise identical to the category-tile-initiated flow; no functional difference in card ranking, cap display, Log Transaction CTA, or Smart Pay CTA | Must Have |
| FR-20 | When the user taps "Wrong category? Change it" on the recommendation screen (reached via search), they are navigated back to the home screen with the search bar pre-populated with the same merchant name | Should Have |

### 4.4 Fallback & Error Handling

| Req ID | Requirement | Priority |
|--------|-------------|----------|
| FR-21 | If the RPC `match_merchant` is unavailable (network error or Supabase offline), the system silently falls back to `matchMerchantLocal()` — consistent with existing behavior in `merchant-mapper.ts` | Must Have |
| FR-22 | If `matchMerchantLocal()` returns `source: 'default'`, the UI shows the fallback row (FR-12); the user is never shown a spinner or error state for an empty search result | Must Have |
| FR-23 | Unmatched search queries are captured in an analytics event `merchant_search_no_match` with the normalized query string, for merchant dictionary prioritization | Must Have |
| FR-24 | If the user selects the fallback row, the home screen scrolls to and briefly highlights the category tile grid with a toast: "We couldn't match '[merchant]' — pick a category below" | Should Have |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Req ID | Requirement | Measurement |
|--------|-------------|-------------|
| NFR-01 | Local search (MERCHANT_KEYWORDS lookup via `matchMerchantLocal()`) must render the dropdown in ≤ 150ms P50, ≤ 200ms P95, measured from keystroke debounce completion to first dropdown render | Client-side timing event |
| NFR-02 | RPC-augmented search (when local returns no match) must complete and update the dropdown in ≤ 1.5 seconds P95; a loading indicator (small spinner in the search bar right-side) is shown only during this network hop | Client-side timing event + Supabase function execution log |
| NFR-03 | The search component must not cause jank on the home screen; category tile scroll must not stutter when the dropdown is open. Target: 60fps on iPhone 12 and equivalent Android mid-range | Manual QA + Flipper profiler |
| NFR-04 | The search bar and dropdown must not introduce noticeable increase to home screen Time-to-Interactive. The search component should be code-split or lazily initialized | Bundle size audit |

### 5.2 Reliability & Graceful Degradation

| Req ID | Requirement |
|--------|-------------|
| NFR-05 | The feature must degrade gracefully when offline: local matching works fully offline; RPC path is skipped with no user-visible error; a toast "Offline — showing local results only" may be shown (optional) |
| NFR-06 | If the `match_merchant` RPC returns an unexpected schema (e.g., after a migration), the client must catch the error and fall through to `matchMerchantLocal()` — the same try/catch pattern already present in `merchant-mapper.ts` |
| NFR-07 | The feature must not block the recommendation flow; if the merchant-to-category resolution fails at any point, the user can always dismiss the search and use category tiles |

### 5.3 Accessibility

| Req ID | Requirement |
|--------|-------------|
| NFR-08 | The search bar must have `accessibilityLabel="Search merchant"` and `accessibilityRole="search"` |
| NFR-09 | Dropdown rows must be navigable with VoiceOver/TalkBack; each row reads: "[Merchant name], [Category name], double tap to select" |
| NFR-10 | The clear button must have `accessibilityLabel="Clear search"` |

### 5.4 Privacy & Data

| Req ID | Requirement |
|--------|-------------|
| NFR-11 | Merchant search queries that are sent to the RPC are associated with `user_id`; users who have not consented to analytics must not have their queries logged. The existing `privacy_consents` table and consent gate (migration 20260221100000) must be respected |
| NFR-12 | Unmatched query strings stored for merchant dictionary expansion must be anonymized (no user_id linkage) at the point of storage |

---

## 6. Scope & Out of Scope

### 6.1 In Scope (MVP — F35 v1.0)

| # | In Scope |
|---|----------|
| 1 | Search bar UI component on the Recommend home screen |
| 2 | Live autocomplete dropdown with local matching (MERCHANT_KEYWORDS) |
| 3 | RPC-augmented matching (`match_merchant`) for queries with no local result |
| 4 | Routing to the correct recommendation screen on merchant selection |
| 5 | Bills subcategory routing for matched bill merchants (Singtel, StarHub, etc.) |
| 6 | Fallback row for unmatched queries with manual category selection guidance |
| 7 | "Wrong category?" override link on recommendation screen |
| 8 | Analytics instrumentation for search events (see Section 9) |
| 9 | MERCHANT_KEYWORDS dictionary expansion (+50 Singapore merchants minimum) |
| 10 | Graceful degradation for offline and RPC-failure scenarios |

### 6.2 Out of Scope (MVP)

| # | Out of Scope | Rationale / Future Consideration |
|---|-------------|-----------------------------------|
| 1 | User-persisted merchant overrides (`saveMerchantOverride()`) | Data model exists; UX integration deferred to F35-S6 post-MVP |
| 2 | GPS-based merchant auto-detection on the home screen | `detectMerchant()` exists; surfaces as F35-S9; requires location permission UX design |
| 3 | Community merchant submissions via search no-match flow | `community_submissions` table exists; wiring deferred to F35-S7 |
| 4 | Transaction-history-based suggestion ranking | Requires transaction data aggregation query; deferred to F35-S8 |
| 5 | Fuzzy matching / spell correction (e.g., "Starbux" → "Starbucks") | Nice-to-have; increases matching complexity; evaluated post-launch based on no-match analytics |
| 6 | Google Places API live merchant search (typed name → Places API lookup) | `lib/merchant.ts` is GPS-based; text-based Places search is a different API call; cost and latency tradeoffs need evaluation |
| 7 | MCC display in the dropdown or recommendation screen | Technical detail; adds noise for most users; consider for power-user mode only |
| 8 | Merchant logos in the dropdown | Requires a logo CDN or Google Places photo integration; visual scope for a future design sprint |
| 9 | Search within the Log Transaction screen | Different use case; that screen already has a category picker; separate feature request |
| 10 | Admin dashboard for merchant dictionary management | Internal tooling; prioritized after launch when unmatched query volume justifies investment |

---

## 7. RICE Scoring

### 7.1 Funnel Context

The current recommendation funnel:

```
Home Screen → [Category Tile Tap] → Recommendation Result → Log Transaction

100%            ~65% tap a tile         ~80% of tapped tile    ~40% log
(open app)      (35% bounce or          sessions render a      transaction
                skip without            result
                recommendation)
```

**Biggest drop-off**: Home Screen → Category Tile selection (estimated 35% of sessions end without any recommendation). Merchant Search directly addresses this drop-off by offering an alternative, lower-friction entry point for users who are merchant-oriented rather than category-oriented.

### 7.2 RICE Scoring — Feature Components

**Scoring Guide**:
- Reach: Estimated Singapore MAU base = 2,000 users (early growth stage). Reach expressed as users impacted per quarter.
- Impact: 3=Massive, 2=High, 1=Medium, 0.5=Low, 0.25=Minimal
- Confidence: 100%=High evidence, 80%=Medium, 50%=Low
- Effort: Person-weeks

| Feature Component | Reach | Impact | Confidence | Effort (pw) | RICE Score | Priority |
|-------------------|-------|--------|------------|-------------|------------|----------|
| **F35-S1/S2/S3**: Search bar + autocomplete + recommendation routing (core MVP) | 1,400 | 3 | 80% | 3 | **1,120** | P0 |
| **FR-13**: MERCHANT_KEYWORDS dictionary expansion (+50 SG merchants) | 1,400 | 2 | 100% | 1 | **2,800** | P0 (prerequisite) |
| **F35-S4**: No-match fallback row + toast guidance | 1,400 | 1 | 100% | 0.5 | **2,800** | P0 (must ship with core) |
| **F35-S5**: Category override link on recommendation screen | 800 | 1 | 80% | 0.5 | **1,280** | P1 |
| **F35-S6**: User merchant override persistence | 600 | 1 | 80% | 2 | **240** | P2 |
| **F35-S9**: GPS-based merchant pre-fill on home screen | 1,000 | 2 | 50% | 3 | **333** | P2 |
| **F35-S7**: Community merchant submission via no-match | 400 | 0.5 | 50% | 2 | **50** | P3 |
| **F35-S8**: Transaction-history-based suggestion ranking | 700 | 1 | 50% | 3 | **117** | P3 |

**Formula**: Score = (Reach × Impact × Confidence) / Effort

### 7.3 Priority Tiers Summary

| Priority | Components | Rationale |
|----------|------------|-----------|
| **P0 — Must Have (MVP)** | Dictionary expansion, Search bar + autocomplete + routing, No-match fallback | Minimum viable feature; nothing ships without these three |
| **P1 — Should Have (Sprint +1)** | Category override link | Low effort, meaningful accuracy signal, required for user trust |
| **P2 — Could Have (Sprint +2)** | User override persistence, GPS merchant pre-fill | High RICE relative to effort once P0/P1 foundations exist |
| **P3 — Won't Have (This Cycle)** | Community submissions via search, History-based ranking | Good ideas but low urgency; revisit after launch data available |

---

## 8. Dependencies & Risks

### 8.1 Technical Dependencies

| Dependency | Owner | Status | Impact if Blocked |
|------------|-------|--------|-------------------|
| `lib/merchant-mapper.ts` — `matchMerchantLocal()` | Engineering | Exists and tested | None — already in production |
| `lib/merchant-mapper.ts` — `matchMerchant()` RPC path | Engineering | Exists; RPC `match_merchant` deployed | Low — local fallback is sufficient for MVP |
| Supabase RPC `recommend(p_category_id, p_subcategory)` | Engineering | Exists; used by current category tile flow | None — recommendation engine unchanged |
| Bills subcategory routing (`bills-subcategory` screen) | Engineering | Exists (Sprint 28) | Low — Bills merchants use existing sub-flow |
| MERCHANT_KEYWORDS dictionary expansion | Product/Engineering | Not started — **critical path** | High — search quality depends on dictionary breadth |
| `track()` analytics function (`lib/analytics.ts`) | Engineering | Exists; used in recommendation screen | None — instrumentation follows existing pattern |

### 8.2 Data Dependencies

| Dependency | Status | Action Required |
|------------|--------|-----------------|
| MERCHANT_KEYWORDS must cover top Singapore merchants by spend category | Current: ~60 keywords across 8 categories | **Action**: Research and add 50+ merchants before launch. Priority: Dining (Hawker centres, local chains: Ya Kun, Toast Box, Old Chang Kee, Bengawan Solo), Transport (Tada, BlueSG), Groceries (Sheng Siong, Prime Supermarket), Online (Lazada, Carousell, Qoo10, Razer Pay), Travel (Airpaz, Trip.com, Pelago), Bills (Starhub broadband, M1 postpaid, PUB, Town Council). |
| RPC `match_merchant` must handle empty/null inputs gracefully | Unknown | **Action**: Engineering to test RPC with edge-case inputs (empty string, single character, emoji, special characters) before launch |

### 8.3 UX Dependencies

| Dependency | Status | Action Required |
|------------|--------|-----------------|
| Search bar must not displace or compete with the time-of-day category suggestion highlight (index.tsx `getSuggestedCategory()`) | Design conflict not yet evaluated | **Action**: Designer to resolve layout — proposed solution: search bar above tiles; highlighted suggestion tile remains; search takes visual priority only when user actively types |
| Recommendation screen header must support contextual merchant name display (FR-18) | Current header only shows category name | **Action**: Engineering to accept an optional `merchantName` route param on `/recommend/[category]` |

### 8.4 Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Dictionary coverage gap at launch** — search returns "Category not found" for too many common Singapore merchants, making the feature feel broken | High | High | Ship a minimum of 120 total keywords (current ~60 + 50 new + buffer). Track `merchant_search_no_match` analytics from day 1 and run weekly dictionary expansion sprints for the first month post-launch |
| **Matching false positives** — a partial keyword match routes the user to the wrong category (e.g., "grab" matching "grabfood" in dining when user means a Grab ride) | Medium | High | Enforce longer keyword minimum length (≥ 6 chars for confidence 0.9); add a "GRAB RIDE" explicit keyword for transport that scores higher than the "GRAB" dining keyword. Review all keywords with length < 6 for ambiguity before launch |
| **RPC latency spikes** — `match_merchant` RPC runs slowly under load, causing the dropdown to feel sluggish | Low | Medium | NFR-02 target ≤ 1.5s P95; implement client-side timeout of 2 seconds after which the local result is displayed as final. Monitor Supabase function execution time |
| **User confusion: search vs category tiles** — users don't understand the new search bar and ignore it, leading to no adoption | Medium | Medium | UI copy and placeholder text must be highly specific ("Search merchant e.g. NTUC, Grab, Shopee"). Consider a one-time coach mark tooltip on first launch post-feature. Track search bar tap rate vs impression |
| **Bills subcategory routing complexity** — when a Bills merchant is matched (e.g., "Singtel"), routing to the bills-subcategory screen mid-search flow may feel jarring | Low | Medium | Design a smooth transition: searching "Singtel" → suggests "Singtel — Bills: Telecoms" in dropdown → routes directly to `/recommend/bills?subcategory=telecoms`, bypassing the bills-subcategory selection screen for merchants with unambiguous subcategory mapping |
| **Privacy — query logging** — unmatched queries captured for dictionary expansion could inadvertently reveal sensitive merchant context | Low | Low | Anonymize queries (no user_id) before storage; implement at the analytics event level, not the RPC level |

---

## 9. Analytics Events

All events follow the existing `track(eventName, properties, userId)` pattern from `lib/analytics.ts`. Events are sent on authenticated sessions only; users without analytics consent (per `privacy_consents` table) are excluded.

### 9.1 Event Definitions

| Event Name | Trigger | Properties | Purpose |
|------------|---------|------------|---------|
| `merchant_search_opened` | User taps search bar (focus event) | `{ source: 'home_screen', session_id }` | Track search bar adoption rate; % of home screen visits where search is attempted |
| `merchant_search_typed` | User has typed ≥ 2 characters and debounce fires | `{ query_length: number, has_results: boolean }` | Understand query depth; detect if users type short queries and abandon |
| `merchant_search_result_shown` | Dropdown renders with ≥ 1 result | `{ result_count: number, top_match_category: string, top_match_confidence: number, match_source: 'pattern_match' \| 'user_override' \| 'default', query_length: number }` | Measure match quality; track confidence distribution; identify low-confidence categories |
| `merchant_search_no_match` | Dropdown renders with 0 keyword matches (confidence = 0 from both local and RPC) | `{ query_normalized: string }` (no user_id) | Merchant dictionary expansion prioritization; identify highest-frequency unmatched merchants |
| `merchant_search_selected` | User taps a suggestion row | `{ merchant_display_name: string, matched_category_id: string, match_source: 'pattern_match' \| 'user_override' \| 'default', match_confidence: number, result_position: number }` | Conversion funnel; understand which merchants are most searched; validate routing accuracy |
| `merchant_search_fallback_selected` | User taps the no-match fallback row | `{ query_normalized: string }` (no user_id) | Measure fallback rate; high rate = dictionary needs urgent expansion |
| `merchant_search_cleared` | User taps the clear (×) button | `{ had_results: boolean, typed_length: number }` | Understand abandonment vs intentional clear; distinguish between "found what I needed" vs "gave up" |
| `merchant_category_override` | User taps "Wrong category? Change it" on recommendation screen | `{ merchant_name: string, original_category_id: string, session_id: string }` | Measure matching accuracy; high rate on specific merchants = keyword correction needed |
| `recommendation_used` (existing event, augmented) | Recommendation result renders (existing event in `[category].tsx`) | **Add**: `{ initiated_via: 'merchant_search' \| 'category_tile' \| 'bills_subcategory', merchant_name: string \| null }` to existing properties | Allows MARU segmentation by entry path; quantify % of MARU driven by merchant search vs tiles |

### 9.2 Key Funnels to Monitor

**Merchant Search Conversion Funnel**:
```
merchant_search_opened
  → merchant_search_typed (≥ 2 chars)
    → merchant_search_result_shown (match found)
      → merchant_search_selected
        → recommendation_used { initiated_via: 'merchant_search' }
          → log_transaction_tapped (existing)
```

**No-Match Recovery Funnel**:
```
merchant_search_opened
  → merchant_search_typed
    → merchant_search_no_match (logged anonymously)
      → merchant_search_fallback_selected
        → category_tile_tapped (existing)
          → recommendation_used { initiated_via: 'category_tile' }
```

### 9.3 Dashboard / Reporting Requirements

The following views should be available in the analytics dashboard within 2 weeks of launch:

| Dashboard View | Metrics Shown |
|----------------|---------------|
| **Merchant Search Overview** | Daily/weekly: search_opened, typed, result_shown, selected, no_match. Funnel conversion step-by-step. |
| **Top Searched Merchants** | Ranked list of `merchant_display_name` from `merchant_search_selected` events (past 30 days) |
| **Top Unmatched Queries** | Ranked list of `query_normalized` from `merchant_search_no_match` (past 7 days) — used for weekly dictionary expansion sprints |
| **Category Override Leaderboard** | Merchants with highest `merchant_category_override` rate — identifies systematic keyword errors |
| **MARU Attribution** | % of monthly `recommendation_used` events with `initiated_via: 'merchant_search'` vs `'category_tile'` |

---

## Appendix A: Merchant Dictionary Expansion Priority List

The following merchants are confirmed high-priority additions to `MERCHANT_KEYWORDS` before launch, based on Singapore spending patterns and current gaps in the dictionary:

**Dining (additions)**:
`BENGAWAN SOLO`, `BENGAWAN`, `BREADTALK`, `BREAD TALK`, `BENGAWAN`, `FOUR LEAVES`, `CEDELE`, `SOUP RESTAURANT`, `JUMBO`, `LONG BEACH`, `IMPERIAL TREASURE`, `PARADISE`, `SWATOW`, `HAWKER CHAN`, `ODETTE`, `BURNT ENDS`, `ATLAS`, `PS CAFE`, `PS.CAFE`, `WINGSTOP`, `FIVE GUYS`, `SHAKE SHACK`, `STUFF'D`, `PENANG KITCHEN`, `HOLLAND V`

**Transport (additions)**:
`TADA`, `RYDE`, `BLUESG`, `BLUE SG`, `KINGSMEN`, `ZIPCAR`, `SINGABUS`, `COMFORT DELGRO`, `COMFORTDELGRO`, `TRANSIT LINK`, `TRANSITLINK`

**Groceries (additions)**:
`PRIME SUPERMARKET`, `PRIME SUPER`, `JASON'S`, `JASONS`, `MEIDI-YA`, `MEIDI YA`, `THREE SIXTY`, `THREE60`, `EMPORIUM`, `MARKETPLACE`, `COLONY`

**Online (additions)**:
`CAROUSELL`, `QOO10`, `ZALORA`, `TEMU`, `REEBONZ`, `CHALLENGER`, `HARVEY NORMAN`, `HARVEY`, `COURTS`, `GAIN CITY`, `GAIN`, `BEST DENKI`

**Travel (additions)**:
`TRIP.COM`, `TRIPCOM`, `PELAGO`, `PELAGO SG`, `REZPAY`, `NATAS`, `AIRPAZ`, `MALAYSIA AIRLINES`, `MAS`, `THAI AIRWAYS`, `CATHAY`, `CATHAY PACIFIC`

**Petrol (additions)**:
`PETRONAS`, `KIOSK`, `BP`

**Bills (additions — map to specific subcategory)**:
`STARHUB`, `M1 MOBILE`, `M1 POSTPAID`, `PUB BOARD`, `HDB ESTATE`, `MEDIASHIELD`, `GREAT EASTERN`, `NTUC INCOME`, `TOKIO MARINE`, `AXA`, `MANULIFE`, `RAFFLES MEDICAL`, `RAFFLES HOSPITAL`, `PARKWAY`, `MOUNT E`, `MOUNT ELIZABETH`, `GLENEAGLES`, `NUH`, `SGH`, `KKH`, `CGH`, `TTSH`, `ALEXANDRA HOSPITAL`, `CHANGI GENERAL`

---

## Appendix B: Technical Implementation Notes

### B.1 Component Architecture

The Merchant Search feature introduces one new component and modifies two existing files:

**New**: `components/MerchantSearchBar.tsx`
- Props: `onMerchantSelected(match: MerchantMatch, displayName: string): void`
- Props: `onNoMatch(query: string): void`
- Internal: `TextInput`, debounced `useEffect` calling `matchMerchantLocal()` and conditionally `matchMerchant()`, `FlatList` dropdown

**Modified**: `app/(tabs)/index.tsx`
- Import and render `<MerchantSearchBar>` above the category tile grid
- Handle `onMerchantSelected` → `router.push('/recommend/' + match.categoryId)` with optional `merchantName` param
- Handle `onNoMatch` → scroll category tiles into view + show toast

**Modified**: `app/(tabs)/recommend/[category].tsx`
- Accept optional `merchantName` route param
- Render "Best card for [Merchant Name]" in `Stack.Screen title` when param is present
- Render "Wrong category? Change it" link when `merchantName` param is present

### B.2 Route Param Design

```
/recommend/dining?merchantName=Shake+Shack
/recommend/bills/telecoms?merchantName=Singtel   (Bills: direct subcategory routing)
```

The `merchantName` param is display-only; it does not alter the recommendation logic. It is passed through to the `recommendation_used` analytics event as `merchant_name`.

### B.3 Dictionary Expansion Workflow

The `MERCHANT_KEYWORDS` constant in `lib/merchant-mapper.ts` is the single source of truth for local matching. Post-launch, the weekly dictionary expansion process is:

1. Pull top 20 queries from `merchant_search_no_match` analytics event (anonymized)
2. PM/Data team manually classifies each into a category
3. Engineering adds keywords via a PR to `merchant-mapper.ts`
4. Threshold for RPC-based merchant learning (F35-S6) evaluated at 90-day mark

---

*End of PRD Section: Merchant Search (F35)*
