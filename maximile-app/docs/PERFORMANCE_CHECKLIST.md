# MaxiMile Performance Checklist — Phase 4 (T4.03)

> **Date**: 2026-02-20
> **Target**: 60fps scrolling, < 2s screen load, < 100ms recommendation response

---

## 1. List Optimization

### FlatList / SectionList
- [ ] All FlatLists have `keyExtractor` returning unique string IDs
- [ ] `cards.tsx`: FlatList with `keyExtractor={(item) => item.card_id}`
- [ ] `transactions.tsx`: SectionList with `keyExtractor={(item) => item.id}`
- [ ] `caps.tsx`: ScrollView (acceptable — typical user has 5-7 cards, < 20 cap items)
- [ ] `onboarding.tsx`: SectionList with `keyExtractor` for card selection
- [ ] `recommend/[category].tsx`: FlatList for ranked results (typically 3-7 items)
- [ ] Consider `getItemLayout` for fixed-height rows in transactions list (future optimization)
- [ ] `ItemSeparatorComponent` used instead of margin hacks

### Re-render Prevention
- [ ] `useCallback` used for all event handlers passed as props (fetchCards, handleRefresh, etc.)
- [ ] `useMemo` used for computed data (category filtering, card grouping)
- [ ] Tab layout `checkCapBadge` wrapped in `useCallback` with `[user]` dependency
- [ ] Inline arrow functions in `renderItem` are acceptable (React Native optimizes these)

---

## 2. Network Efficiency

### Query Optimization
- [ ] `recommend()` RPC is a single database round-trip (all joins server-side)
- [ ] `transactions.tsx` limits results to 200 rows (`.limit(200)`)
- [ ] `caps.tsx` uses `Promise.all` for parallel cap + spending_state fetches
- [ ] `_layout.tsx` cap badge check uses parallel `Promise.all`
- [ ] Card detail page fetches earn_rules and spending_state in parallel

### Caching Strategy
- [ ] Auth session cached in AsyncStorage (auto-refresh by Supabase)
- [ ] No redundant fetches on tab switch (data loaded in `useEffect` on mount)
- [ ] Pull-to-refresh available on list screens for manual refresh
- [ ] Consider SWR/React Query caching for v1.1 (not needed for MVP with < 1000 users)

### Data Transfer
- [ ] All queries use explicit `.select()` columns (no `SELECT *` patterns)
- [ ] Joined data uses minimal columns (e.g., `cards(bank, name)` not full card objects)
- [ ] Analytics events buffered locally in AsyncStorage, not sent per-event

---

## 3. AsyncStorage Usage

- [ ] Analytics buffer capped at 500 events (prevents storage bloat)
- [ ] MARU data is a single small JSON object (month + count)
- [ ] Auth session stored by Supabase SDK (managed automatically)
- [ ] No large objects stored in AsyncStorage
- [ ] `JSON.parse`/`JSON.stringify` used safely with try-catch in analytics

---

## 4. Rendering Performance

### Component Complexity
- [ ] GlassCard uses `expo-blur` BlurView (hardware-accelerated on iOS)
- [ ] Android fallback uses solid background instead of blur (performance-safe)
- [ ] CapProgressBar is a simple View with width animation (lightweight)
- [ ] No deep component nesting (max 4-5 levels)
- [ ] Modals use `animationType="fade"` (smoother than slide on low-end devices)

### Image/Asset Optimization
- [ ] No image assets used (text-based UI with Ionicons)
- [ ] Ionicons loaded from `@expo/vector-icons` (bundled, no network fetch)
- [ ] Category tiles use emoji (text rendering, no image decode)

---

## 5. Bundle Size

- [ ] Core dependencies are minimal:
  - `@supabase/supabase-js` (~50KB gzipped)
  - `expo-blur` (platform native, minimal JS)
  - `@react-native-async-storage/async-storage` (platform native)
  - `react-native-safe-area-context` (platform native)
  - `expo-router` (file-based routing)
- [ ] No unnecessary large libraries (no moment.js, lodash, etc.)
- [ ] Date formatting uses native `Intl.DateTimeFormat` via `toLocaleDateString`
- [ ] No unused imports or dead code

---

## 6. Startup Performance

- [ ] SplashScreen managed by Expo (shown until auth state resolves)
- [ ] Auth state check is a single `getSession()` call
- [ ] Onboarding check (`user_cards` count) is a lightweight `HEAD` query
- [ ] No waterfall loading — auth + onboarding check are sequential but fast
- [ ] Target: app usable within 2 seconds of launch

---

## 7. Known Limitations (Acceptable for Beta)

| Item | Status | Notes |
|------|--------|-------|
| No offline mode | Accepted | All screens require network; clear error messages shown |
| No data caching | Accepted | Fresh fetch on each screen mount; adequate for < 1000 users |
| No virtualized cap list | Accepted | ScrollView for < 20 items; FlatList not needed |
| No image caching | N/A | App uses no remote images |
| Analytics sync to server | Deferred | Events buffered locally; server sync in v1.1 |
