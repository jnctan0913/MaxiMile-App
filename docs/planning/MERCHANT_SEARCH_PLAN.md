# Merchant Search — Comprehensive Implementation Plan

**Feature ID:** F35 — Merchant Search on Recommend Tab
**Date:** 2026-03-02
**Status:** Planning
**Sprint Target:** S29 (2-week sprint)

---

## Table of Contents

1. [Product Requirements (PRD)](#1-product-requirements)
2. [Design Requirements (DRD)](#2-design-requirements)
3. [Technical Architecture](#3-technical-architecture)
4. [Sprint Plan](#4-sprint-plan)

---

# 1. Product Requirements

## 1.1 Problem Statement

Users think in **merchants** ("I'm at Grab"), not **categories** ("Transport"). The current Recommend tab forces users to mentally map a merchant to one of 8 category tiles before seeing a card recommendation. This creates friction, mis-categorisation, and abandonment.

**Persona — "Category-Confused Caleb":**
Caleb is at Shake Shack and wants to know which card to use. He opens MaxiMile, sees 8 tiles, and hesitates — is Shake Shack "Dining" or "General"? He guesses "Dining" and gets the right answer, but the cognitive load means he sometimes skips the app entirely.

**Five Whys Root Cause:**
1. Why does Caleb hesitate? → He doesn't know which category Shake Shack belongs to.
2. Why doesn't the app tell him? → The Recommend tab entry point is category-based, not merchant-based.
3. Why is it category-based? → The recommendation RPC (`recommend()`) takes a `category_id`, not a merchant name.
4. Why can't it take a merchant name? → The merchant→category mapping (`merchant-mapper.ts`, `match_merchant` RPC) exists but is only wired into Smart Pay's auto-capture flow.
5. Why isn't it surfaced in the discovery UI? → It was built for background classification, not user-facing search. **← Root cause**

**Feasibility validation:** `matchMerchantLocal()` in `lib/merchant-mapper.ts` and `match_merchant` RPC already exist. The recommendation RPC is category-based and needs no modification — we just need to resolve merchant→category before calling it.

## 1.2 Goals & Success Metrics

| Metric | Target | Timeframe |
|--------|--------|-----------|
| **MARU lift** (primary) | +15% | 90 days post-launch |
| Recommendations via merchant search | 25% of all recommendation sessions | 60 days |
| Merchant match rate | ≥ 70% of search queries return ≥ 1 result | 30 days |
| Search-to-recommendation conversion | ≥ 80% of selections lead to a recommendation view | 30 days |
| P95 local search latency | < 200ms | At launch |

**Guardrail metrics** (must not regress):
- Category tile tap rate remains within ±5% of pre-launch baseline
- Smart Pay usage unaffected

## 1.3 User Stories

### MVP Stories (P0)

| ID | Story | Priority |
|----|-------|----------|
| F35-S1 | As a user, I want to type a merchant name and see matching suggestions so I don't have to guess categories | P0 |
| F35-S2 | As a user, I want to select a merchant and see the best card recommendation for it | P0 |
| F35-S3 | As a user, I want a "no results" message when my merchant isn't found so I know to try browsing categories | P0 |
| F35-S4 | As a user arriving via merchant search, I want the recommendation page to show the merchant name in the header | P1 |
| F35-S5 | As the product team, I want analytics events for search interactions to measure adoption | P1 |

### Post-MVP Stories

| ID | Story | Priority |
|----|-------|----------|
| F35-S6 | User can submit an unlisted merchant for category override (leverages existing `user_merchant_overrides`) | P2 |
| F35-S7 | Community-submitted merchant corrections (leverages `community_submissions` table) | P3 |
| F35-S8 | Recently searched merchants tray (AsyncStorage persistence) | P2 |
| F35-S9 | GPS pre-fill: detect nearby merchant via Google Places and pre-populate search | P2 |

## 1.4 Functional Requirements

### Search Bar
- FR-1: Search bar appears above the category tile grid on the Recommend home screen
- FR-2: Search bar only visible when user has ≥ 1 card in portfolio (consistent with existing empty-state guard)
- FR-3: Placeholder text: "Search merchant, e.g. Grab, Starbucks…"
- FR-4: Minimum 2 characters before triggering search
- FR-5: 250ms debounce on keystroke before filtering
- FR-6: Clear button (✕) visible when input has text

### Autocomplete & Matching
- FR-7: Return up to 10 results, display up to 5 visible before scroll
- FR-8: Match against merchant name AND aliases (case-insensitive)
- FR-9: Rank results: exact match > prefix match > contains match
- FR-10: Each result row shows: merchant name, category badge
- FR-11: Matched substring highlighted in gold (#C5A55A)

### Recommendation Routing
- FR-12: Selecting a merchant navigates to `/recommend/[categoryId]?merchantName=[name]`
- FR-13: Bills merchants include subcategory: `/recommend/bills?subcategory=telco&merchantName=Singtel`
- FR-14: Recommendation page header shows "Best card for [Merchant]" when accessed via search
- FR-15: Category context badge below header links to the parent category page

### Fallback & Error Handling
- FR-16: No results state with helpful message and category browse suggestion
- FR-17: Network error state with "Try again" CTA (for Phase 2 DB-backed search)
- FR-18: Zero-mpd merchants (e.g., SP Services for utilities) show educational message

## 1.5 Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Local search P50 latency | ≤ 150ms |
| Local search P95 latency | ≤ 200ms |
| Server-side search P95 (Phase 2) | ≤ 1.5s |
| Graceful offline degradation | Search works fully offline with static catalogue |
| Accessibility | VoiceOver/TalkBack labels on all interactive elements |
| Min touch target | 44 × 44 px |

## 1.6 Scope

**In scope:**
- Search bar UI on Recommend home
- Client-side fuzzy search over curated merchant list (~200 merchants)
- Merchant-to-category routing
- Merchant context on recommendation result page
- Analytics instrumentation (3 events)
- Bills subcategory merchant routing

**Out of scope (deferred):**
- Server-side full-text search (revisit at 500+ merchants)
- Merchant logos/images
- Recently searched history
- User-submitted merchant corrections
- GPS-based merchant pre-fill
- Voice search

## 1.7 RICE Scoring

| Component | Reach | Impact | Confidence | Effort | Score |
|-----------|-------|--------|------------|--------|-------|
| Core search MVP (S1-S3) | 80% | 2 | 70% | 1 sprint | 1,120 |
| Merchant dictionary (prerequisite) | 100% | 2 | 100% | 0.5 sprint | 2,800 |
| Result page context (S4) | 80% | 1 | 90% | 0.5 sprint | 1,280 |
| Analytics (S5) | 100% | 1 | 100% | 0.25 sprint | 4,000 |

## 1.8 Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `search_initiated` | User types ≥ 2 chars (debounce settled) | `query_length`, `results_count` |
| `merchant_selected` | User taps a merchant result | `merchant_name`, `category_id`, `query` |
| `search_abandoned` | User clears/dismisses without selecting | `query`, `results_count` |
| `recommendation_used` (existing, augmented) | Recommendation viewed | + `initiated_via: 'merchant_search' \| 'category_tile'` |

**Funnel:** `search_initiated` → `merchant_selected` → `recommendation_used` (with `initiated_via: merchant_search`)

---

# 2. Design Requirements

## 2.1 Design Principles

- **Additive, not disruptive** — search bar is a discovery accelerator; category tiles remain the primary navigation
- **Consistent visual language** — glassmorphism system (frosted glass, gold accent #C5A55A, charcoal text #2D3748)
- **Progressive disclosure** — dropdown only appears when user types; no pre-populated state
- **Keyboard-first mobile ergonomics** — 44px min touch targets, keyboard-safe layout

## 2.2 Screen Layout — Recommend Home (Idle)

```
┌──────────────────────────────────────────┐
│  Status Bar                              │
├──────────────────────────────────────────┤
│  Recommend                               │  ← screen title
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ Rate Change Alert (optional)     │   │  ← existing alert
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │  🔍  Search for a merchant...    │   │  ← NEW search bar
│  └──────────────────────────────────┘   │
│                                          │
│  ┌────────┐  ┌────────┐  ┌────────┐    │
│  │ Dining │  │Grocery │  │ Travel │    │  ← existing tiles
│  └────────┘  └────────┘  └────────┘    │
│  ┌────────┐  ┌────────┐  ┌────────┐    │
│  │Transprt│  │ Petrol │  │ Online │    │
│  └────────┘  └────────┘  └────────┘    │
└──────────────────────────────────────────┘
```

## 2.3 Search Bar Visual Spec

```
┌──────────────────────────────────────────┐
│  [search-icon]  Search for a merchant... │  [✕]
└──────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Height | 44px |
| Border radius | 12px (md token) |
| Background | `rgba(255, 255, 255, 0.65)` with BlurView `intensity=20` |
| Border (idle) | `1px solid rgba(197, 165, 90, 0.15)` |
| Border (focused) | `1px solid rgba(197, 165, 90, 0.55)` |
| Shadow | `0 2px 8px rgba(0,0,0,0.06)` |
| Left icon | Ionicons `search-outline`, 18px, `rgba(197,165,90,0.70)` |
| Clear icon | Ionicons `close-circle`, 18px, `rgba(45,55,72,0.35)`, visible when text present |
| Placeholder | 14px regular, `rgba(45,55,72,0.40)` |
| Input text | 14px regular, `#2D3748` |

## 2.4 Autocomplete Dropdown

```
┌──────────────────────────────────────────┐
│  🔍  Cold St                        [✕] │  ← search bar
└──────────────────────────────────────────┘
╔══════════════════════════════════════════╗
║  ┌──┐  Cold Storage         [Groceries] ║  ← result row
║  │🛒│  Supermarket · SG                 ║
║  └──┘                                   ║
║  ─────────────────────────────────────── ║
║  ┌──┐  Cold Brew Co.          [Dining]  ║
║  │☕│  Café · SG                        ║
║  └──┘                                   ║
╚══════════════════════════════════════════╝
```

| Property | Value |
|----------|-------|
| Background | `rgba(255, 255, 255, 0.92)` with BlurView `intensity=40` |
| Border | `1px solid rgba(197, 165, 90, 0.20)` |
| Border radius | 12px |
| Shadow | `0 4px 20px rgba(0, 0, 0, 0.12)` |
| Max visible rows | 5 (320px max height, scrollable) |
| Total max results | 10 |
| Row height | 64px |
| Row divider | `1px solid rgba(45,55,72,0.06)` |

### Result Row Layout

| Element | Spec |
|---------|------|
| Logo placeholder | 40 × 40px, radius 8px, bg `rgba(197,165,90,0.10)`, fallback icon `storefront-outline` |
| Merchant name | 14px, weight 600, `#2D3748`, matched chars bolded in `#C5A55A` |
| Descriptor | 12px, `rgba(45,55,72,0.55)` |
| Category badge | 11px, weight 600, `#C5A55A` text, `rgba(197,165,90,0.12)` bg, radius 6px |
| Press state | `backgroundColor: rgba(197,165,90,0.08)` |

## 2.5 Empty & Error States

### No Results
```
╔══════════════════════════════════════════╗
║                                          ║
║            🔍                            ║
║   No merchants found for "XYZ"           ║
║   Try a shorter name or browse           ║
║   categories below.                      ║
║                                          ║
╚══════════════════════════════════════════╝
```

### Network Error (Phase 2)
```
╔══════════════════════════════════════════╗
║                                          ║
║            ☁️                            ║
║   Search unavailable                     ║
║   Check your connection. [Try again]     ║
║                                          ║
╚══════════════════════════════════════════╝
```

## 2.6 Recommendation Page — Merchant Context

### Standard (via category tile)
```
│  ← Back          Dining                 │
│  Best cards for Dining                  │
│  Based on your cards                    │
```

### Via merchant search
```
│  ← Back          Cold Storage           │
│  Best card for Cold Storage             │  ← singular "card"
│  Groceries · Supermarket                │  ← category + context
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Showing results for Cold       │   │
│  │  Storage  [Groceries ▸]         │   │  ← tappable badge
│  └─────────────────────────────────┘   │
```

## 2.7 Keyboard Behavior

| Setting | Value |
|---------|-------|
| Auto-focus | NO (don't auto-open keyboard on tab mount) |
| `returnKeyType` | `"search"` (iOS shows "Search" button) |
| `autoCapitalize` | `"none"` |
| `autoCorrect` | `false` (prevents brand name corrections) |
| Dismiss on scroll | `keyboardDismissMode="on-drag"` |
| Tap persistence | `keyboardShouldPersistTaps="handled"` |

## 2.8 Animations

| Event | Animation |
|-------|-----------|
| Dropdown appears | `opacity` 0→1, `translateY` -4→0, 150ms ease-out |
| Dropdown closes | `opacity` 1→0, 100ms ease-in |
| Row stagger-in | 30ms delay between rows |

## 2.9 Accessibility

| Component | `accessibilityRole` | `accessibilityLabel` |
|-----------|---------------------|---------------------|
| Search bar | `"search"` | `"Search for a merchant"` |
| Clear button | `"button"` | `"Clear search"` |
| Result row | `"button"` | `"{Name}, {Category}, tap to see recommendations"` |
| Empty state | — | `"No results found for {query}"` |
| Category badge | `"link"` | `"Tap to browse all {Category} merchants"` |

---

# 3. Technical Architecture

## 3.1 Architecture Decision: Client-Side Static Catalogue (Phase 1)

**Why not server-side search?**
- Singapore merchant catalogue is < 500 items
- Client-side O(n) filter completes in < 1ms on mid-range Android
- Supabase ILIKE round-trip on cold connection: 400-800ms (exceeds 200ms target)
- Existing `MERCHANT_KEYWORDS` in `lib/merchant-mapper.ts` already encodes ~80 merchant tokens

**Decision:** Phase 1 uses a static in-memory catalogue derived from existing keyword data, extended with curated entries. No new database table required. Phase 2 adds an optional `merchants` reference table for admin-curated logos and richer metadata.

## 3.2 Data Model

### TypeScript Interfaces

```typescript
// lib/merchant-catalogue.ts

export type MerchantSource = 'static' | 'db';

export interface MerchantEntry {
  id: string;              // e.g. 'grab', 'starbucks'
  displayName: string;     // e.g. 'Grab', 'Starbucks'
  keywords: string[];      // normalised uppercase tokens for matching
  categoryId: string;      // MaxiMile category ID
  subcategory?: string;    // bills subcategory (e.g. 'telco')
  isPopular: boolean;      // show in popular tray
  logoUrl?: string;        // Phase 2 only
  source: MerchantSource;
}
```

### Phase 2 Migration (Optional)

```sql
CREATE TABLE public.merchants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  aliases       TEXT[] NOT NULL DEFAULT '{}',
  category_id   TEXT NOT NULL REFERENCES categories(id),
  subcategory   TEXT,
  logo_url      TEXT,
  is_popular    BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX merchants_name_fts_idx ON public.merchants
  USING gin(to_tsvector('simple', display_name || ' ' || array_to_string(aliases, ' ')));

ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "merchants_public_read" ON public.merchants FOR SELECT USING (TRUE);
```

## 3.3 Search Algorithm

**Normalised Prefix + Substring Ranking (runs in `useMerchantSearch`):**

```
Input: raw query string
Step 1: Normalise → UPPERCASE, strip punctuation, trim
Step 2: Score each MerchantEntry:
  a) exact match on displayName          → score 100
  b) displayName starts with query       → score 80
  c) any keyword starts with query       → score 70
  d) displayName contains query          → score 50
  e) any keyword contains query          → score 40
  f) no match                            → score 0, exclude
Step 3: Sort descending by score, then alphabetically
Step 4: Slice to maxItems (default 6)
```

**Debounce:** 120ms via `useRef<ReturnType<typeof setTimeout>>` (shorter than typical 300ms because filtering is synchronous).

**No external search libraries.** The scoring algorithm is ~30 lines of TypeScript and outperforms any library initialisation overhead for < 500 items.

## 3.4 Component Architecture

### New Files

```
maximile-app/
├── lib/
│   └── merchant-catalogue.ts          [NEW] Static MerchantEntry[] + filtering
├── hooks/
│   ├── useMerchantCatalogue.ts        [NEW] Memoised catalogue loader
│   └── useMerchantSearch.ts           [NEW] Debounced query → ranked results
├── components/
│   ├── MerchantSearchBar.tsx          [NEW] TextInput with clear button
│   ├── MerchantAutocomplete.tsx       [NEW] FlatList dropdown
│   └── MerchantSearchSheet.tsx        [NEW] BottomSheet wrapper (optional)
```

### Modified Files

```
├── app/(tabs)/
│   ├── index.tsx                      [MOD] Add search bar + MerchantSearchSheet
│   └── recommend/[category].tsx       [MOD] Accept merchantName param, adapt header
├── lib/
│   └── analytics.ts                   [MOD] Add search event types
```

### Component Interfaces

```typescript
// MerchantSearchBar
interface MerchantSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  style?: ViewStyle;
}

// MerchantAutocomplete
interface MerchantAutocompleteProps {
  results: MerchantEntry[];
  query: string;               // for bold-highlighting matched substring
  onSelect: (merchant: MerchantEntry) => void;
  loading?: boolean;
  maxItems?: number;           // default: 6
}

// useMerchantSearch hook
interface UseMerchantSearchResult {
  query: string;
  setQuery: (q: string) => void;
  results: MerchantEntry[];
  isSearching: boolean;        // true during debounce window
}
```

## 3.5 Navigation Flow

```
Recommend home (index.tsx)
 └─ Search bar → user types "Grab"
     └─ Autocomplete shows: Grab (Transport)
     └─ User taps Grab
     └─ router.push('/recommend/transport?merchantName=Grab')
         └─ [category].tsx reads merchantName param
         └─ Header: "Best card for Grab"
         └─ Recommendation RPC called with category_id='transport' (unchanged)
```

**Route params (extended):**

| Parameter | Type | Required | Source |
|-----------|------|----------|--------|
| `category` | string (segment) | yes | `MerchantEntry.categoryId` |
| `subcategory` | string (query) | no | `MerchantEntry.subcategory` |
| `merchantName` | string (query) | no (NEW) | `MerchantEntry.displayName` |

**Bills subcategory merchant routing:**
```
Singtel selected → /recommend/bills?subcategory=telco&merchantName=Singtel
```

## 3.6 Performance Strategy

| Concern | Mitigation |
|---------|------------|
| Catalogue loading | Module-scope singleton, built once at import time (~2ms) |
| Keystroke re-renders | Debounce timer in `useRef` (not state), results update only after settle |
| FlatList perf | `keyExtractor` by `id`, `getItemLayout` (fixed 56dp rows), `removeClippedSubviews` |
| Keyboard on Android | `isSearching` flag shows lightweight indicator during debounce, preventing list thrash |
| No search library needed | 30 LOC scorer < any lib init overhead for < 500 items |

## 3.7 Migration Plan

| Phase | Scope | DB Changes | Timeline |
|-------|-------|------------|----------|
| **Phase 1** | Client-side search, static catalogue | None | S29 (2 weeks) |
| **Phase 2** | Curated DB + logos | `merchants` table | S31 |
| **Phase 3** | Search analytics + personalisation | Analytics events table | S33+ |

---

# 4. Sprint Plan

## 4.1 Epic Definition

**EPIC-09 — Merchant Search**

> Enable users to search for a merchant by name on the Recommend tab, auto-match to a spend category, and land directly on the best card recommendation — bypassing the need to know which category a merchant belongs to.

## 4.2 Definition of Ready (DoR)

- [ ] Acceptance criteria in Given/When/Then format, reviewed by PO
- [ ] UI wireframe approved for all new surfaces
- [ ] Schema changes reviewed before migration is written
- [ ] Analytics event names agreed and stubbed in type union
- [ ] Story point estimate agreed by team

## 4.3 Definition of Done (DoD)

- [ ] Works on both iOS and Android in Expo Go
- [ ] No TypeScript errors (`npx tsc --noEmit` passes)
- [ ] Analytics events fire in `__DEV__` console
- [ ] All interactive elements have `accessibilityRole` and `accessibilityLabel`
- [ ] Edge cases handled: empty query, no results, Bills subcategory routing
- [ ] PR reviewed and merged to `main`

## 4.4 User Stories

### S29.1 — Merchant Catalogue Data (5 SP)

**Priority:** P0 — blocks all other stories

**As a** developer, **I want** a curated merchant catalogue with ~200 popular Singapore merchants mapped to categories, **so that** the search has accurate data to match against.

**Acceptance Criteria:**
- **Given** the catalogue is loaded, **When** I query for "grab", **Then** entries for Grab (transport), GrabFood (dining), GrabMart (groceries) are returned with correct category IDs
- **Given** the catalogue, **When** I query for "mcdonalds" (no apostrophe), **Then** McDonald's is matched via alias
- **Given** the catalogue, **When** I count entries, **Then** there are ≥ 150 merchants across all 8 categories

**Tasks:**
1. Create `lib/merchant-catalogue.ts` with `buildStaticCatalogue()` and `getMerchantCatalogue()` (3h)
2. Populate ~200 merchants: Dining (40+), Transport (10+), Online (20+), Groceries (15+), Petrol (5+), Bills/subcategories (15+), Travel (15+), General (10+) (4h)
3. Validate every `categoryId` against `CATEGORIES` constant (1h)

---

### S29.2 — useMerchantSearch Hook (3 SP)

**Priority:** P0 — blocks S29.3

**As a** developer, **I want** a `useMerchantSearch` hook with debounced fuzzy search, **so that** the search component has clean, testable logic decoupled from UI.

**Acceptance Criteria:**
- **Given** a query of `""`, **When** results are read, **Then** an empty array is returned
- **Given** a query of `"grab"`, **When** 120ms have elapsed, **Then** all merchants matching "grab" are returned, ranked by score
- **Given** rapid typing (faster than 120ms between chars), **When** results are observed, **Then** only the final stable query produces results
- **Given** component unmount, **When** a debounce timer is pending, **Then** it is cleaned up (no state update after unmount)

**Tasks:**
1. Create `hooks/useMerchantSearch.ts` with normalisation + scoring + debounce (2h)
2. Create `hooks/useMerchantCatalogue.ts` as thin wrapper over `getMerchantCatalogue()` (0.5h)

**Dependencies:** S29.1

---

### S29.3 — MerchantSearch UI Component (5 SP)

**Priority:** P0 — blocks S29.4

**As a** user on the Recommend tab, **I want** a search bar with an autocomplete dropdown, **so that** I can type a merchant name and see matching suggestions.

**Acceptance Criteria:**
- **Given** the Recommend tab with cards in portfolio, **When** the screen loads, **Then** a search bar with placeholder "Search merchant, e.g. Grab, Starbucks…" is visible above category tiles
- **Given** the user types ≥ 2 characters, **When** results are available, **Then** a dropdown shows up to 6 merchant rows with name + category badge
- **Given** the user taps outside the dropdown, **When** the touch is detected, **Then** the dropdown closes and search bar clears
- **Given** a query with no matches, **When** ≥ 2 chars typed, **Then** "No merchants found" message appears
- **Given** the user has no cards, **When** Recommend screen renders, **Then** the search bar is NOT shown

**Tasks:**
1. Create `MerchantSearchBar.tsx` — TextInput with Ionicons, glassmorphism styling (2h)
2. Create `MerchantAutocomplete.tsx` — FlatList dropdown with result rows (2h)
3. Implement close/clear and `keyboardShouldPersistTaps` handling (1h)
4. Add accessibility labels (0.5h)

**Dependencies:** S29.2

---

### S29.4 — Integrate Search into Recommend Home (3 SP)

**Priority:** P0

**As a** user, **I want** selecting a merchant to navigate me to the card recommendation for that merchant's category, **so that** I don't have to know the category myself.

**Acceptance Criteria:**
- **Given** "Starbucks" selected (dining), **When** navigation occurs, **Then** app navigates to `/recommend/dining?merchantName=Starbucks`
- **Given** "Singtel" selected (bills/telco), **When** navigation occurs, **Then** app navigates to `/recommend/bills?subcategory=telco&merchantName=Singtel`
- **Given** a merchant is selected, **When** navigation occurs, **Then** search bar is cleared and dropdown dismissed

**Tasks:**
1. Update `index.tsx`: insert MerchantSearch component, implement `handleMerchantSelect` (1.5h)
2. Test Bills merchant routing end-to-end (0.5h)
3. Ensure ScrollView wrapping doesn't break existing FAB/banner layout (0.5h)

**Dependencies:** S29.3

---

### S29.5 — Merchant Context on Result Screen (2 SP)

**Priority:** P1

**As a** user who searched for a merchant, **I want** the recommendation page to show the merchant name, **so that** I know the recommendation is for the right merchant.

**Acceptance Criteria:**
- **Given** `/recommend/dining?merchantName=Starbucks`, **When** screen mounts, **Then** header title reads "Starbucks"
- **Given** `/recommend/dining` (no merchantName), **When** screen mounts, **Then** header title reads "Dining" (no regression)
- **Given** merchantName present, **When** hero section renders, **Then** it shows "Best card for Starbucks" with category context below

**Tasks:**
1. Extend `useLocalSearchParams` to include `merchantName` (0.5h)
2. Update header title logic: `merchantName ?? subcategoryInfo?.label ?? categoryInfo?.name` (0.5h)
3. Add "Best card for [merchant]" hero label (1h)

**Dependencies:** S29.4

---

### S29.6 — Analytics Events (2 SP)

**Priority:** P1

**As the** product team, **I want** search analytics events, **so that** we can measure adoption, success, and abandonment.

**Acceptance Criteria:**
- **Given** user types ≥ 2 chars (debounce settled), **Then** `search_initiated` fires with `{ query_length, results_count }`
- **Given** user taps a result, **Then** `merchant_selected` fires with `{ merchant_name, category_id, query }`
- **Given** user clears/dismisses without selecting, **Then** `search_abandoned` fires with `{ query, results_count }`

**Tasks:**
1. Add event types to `AnalyticsEvent` union in `lib/analytics.ts` (0.5h)
2. Instrument `search_initiated` in hook (0.5h)
3. Instrument `merchant_selected` in component (0.5h)
4. Instrument `search_abandoned` with focus/blur tracking (1h)

**Dependencies:** S29.3, S29.2

## 4.5 Story Point Summary

| Story | Title | Points | Sprint |
|-------|-------|--------|--------|
| S29.1 | Merchant catalogue data | 5 | S29 |
| S29.2 | `useMerchantSearch` hook | 3 | S29 |
| S29.3 | MerchantSearch UI component | 5 | S29 |
| S29.4 | Integrate into Recommend home | 3 | S29 |
| S29.5 | Merchant context on result screen | 2 | S29 |
| S29.6 | Analytics events | 2 | S29 |
| **Total** | | **20** | **1 sprint** |

## 4.6 Sprint Schedule

```
Week 1, Days 1-2:  S29.1 (catalogue data) — unblocks everything
Week 1, Days 2-4:  S29.2 (hook) in parallel with data validation
Week 1, Day 5:     S29.3 begins (component)
Week 2, Days 1-2:  S29.3 completes + S29.4 (integration)
Week 2, Day 3:     S29.5 (result screen header)
Week 2, Day 4:     S29.6 (analytics)
Week 2, Day 5:     Buffer — QA, edge cases, PR reviews
```

## 4.7 Dependency Graph

```
S29.1 (Catalogue Data)
  └── S29.2 (Search Hook)
        └── S29.3 (UI Component)
              ├── S29.4 (Home Integration)
              │     ├── S29.5 (Result Screen Context)
              │     └── S29.6 (Analytics)
              └── S29.6 (Analytics — also depends on component)
```

## 4.8 Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| **Wrong category mappings** in seed data (e.g., GrabFood→transport instead of dining) | High | High | Validation script cross-checks every `categoryId`. Manual review of top-20 merchants. |
| **ScrollView replacement** in `index.tsx` breaks FAB or banner on Android | Medium | Medium | Test on Android Expo Go immediately after S29.4. Keep FAB outside ScrollView if needed. |
| **Bills 0-mpd merchants** (SP Services) cause confusing empty state | Medium | Medium | Show "No miles earned" note. Consider inline badge in dropdown. Track for S30 follow-up. |
| **TypeScript route param type** — `merchantName` arrives as `string \| string[]` | Low | High | Normalise with `Array.isArray()` check at top of `[category].tsx`. |
| **Scope creep** — "recently searched" or logos added mid-sprint | Medium | Medium | Explicitly out-of-scope in kickoff. Create S30 backlog items proactively. |

---

## Appendix: Merchant Catalogue — Priority Coverage

The static catalogue should include at minimum these Singapore merchants:

| Category | Merchants (examples) |
|----------|---------------------|
| **Dining** | McDonald's, KFC, Starbucks, Ya Kun, Toast Box, Hawker Chan, Tim Ho Wan, Crystal Jade, Paradise Group, Koufu, Kopitiam, GrabFood, Foodpanda, Deliveroo, Shake Shack, Din Tai Fung, Sushi Tei, Genki Sushi, Nando's, Subway |
| **Transport** | Grab, Gojek, ComfortDelGro, SMRT, SBS Transit, Zig, EasyBook |
| **Online** | Lazada, Shopee, Amazon, Qoo10, Zalora, Netflix, Spotify, Apple, Google Play, Agoda, Booking.com, Airbnb, iHerb |
| **Groceries** | NTUC FairPrice, Cold Storage, Giant, Sheng Siong, RedMart, Don Don Donki, Jasons, Little Farms, GrabMart |
| **Petrol** | Shell, Caltex, SPC, Esso, Sinopec |
| **Bills** | Singtel (telco), StarHub (telco), M1 (telco), SP Services (utilities), PUB (utilities), Great Eastern (insurance), Prudential (insurance), AIA (insurance), NUS (education), NTU (education), SGH (hospital), NUH (hospital) |
| **Travel** | Singapore Airlines, Scoot, Jetstar, Cathay Pacific, Emirates, Expedia, Klook, Changi Airport, KrisShop |
| **General** | Daiso, Uniqlo, H&M, Zara, Courts, Best Denki, Harvey Norman |
