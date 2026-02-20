# MaxiMile Test Plan — Phase 4 (T4.03)

> **Date**: 2026-02-20
> **Framework**: Jest + React Native Testing Library
> **Target Coverage**: 80% for lib/, 60% for screens

---

## 1. Testing Stack

| Tool | Purpose |
|------|---------|
| **Jest** (v29.7) | Test runner, assertions, mocking |
| **React Native Testing Library** | Component rendering and interaction testing |
| **@testing-library/jest-native** | Custom matchers for React Native |
| **Detox** (future) | E2E testing on simulators/devices |

---

## 2. Unit Tests — `lib/` Modules

### 2.1 `lib/analytics.ts`

| Test Case | Type | Priority |
|-----------|------|----------|
| `track()` stores event in AsyncStorage buffer | Unit | P0 |
| `track()` increments MARU on `recommendation_used` | Unit | P0 |
| `track()` caps buffer at 500 events | Unit | P1 |
| `track()` silently fails on AsyncStorage error | Unit | P1 |
| `getMARU()` returns current month count | Unit | P0 |
| `getMARU()` returns 0 for new month (auto-reset) | Unit | P1 |
| `getBufferedEvents()` returns stored events | Unit | P1 |
| `clearBuffer()` removes all events | Unit | P1 |
| `getBufferCount()` returns correct count | Unit | P2 |

### 2.2 `lib/error-handler.ts`

| Test Case | Type | Priority |
|-----------|------|----------|
| `handleSupabaseError()` returns empty string for null | Unit | P0 |
| `handleSupabaseError()` classifies network errors | Unit | P0 |
| `handleSupabaseError()` classifies RLS violations (42501) | Unit | P0 |
| `handleSupabaseError()` classifies unique constraint (23505) | Unit | P0 |
| `handleSupabaseError()` classifies FK violation (23503) | Unit | P1 |
| `handleSupabaseError()` classifies check constraint (23514) | Unit | P1 |
| `handleAuthError()` classifies expired session | Unit | P0 |
| `handleAuthError()` classifies invalid credentials | Unit | P0 |
| `handleAuthError()` classifies duplicate email | Unit | P1 |
| `handleAuthError()` classifies rate limit | Unit | P1 |
| `handleGenericError()` handles TypeError (network) | Unit | P1 |
| `handleGenericError()` handles unknown error types | Unit | P2 |
| `showNetworkErrorAlert()` calls Alert.alert with retry | Unit | P1 |

### 2.3 `lib/supabase.ts`

| Test Case | Type | Priority |
|-----------|------|----------|
| Client created with correct env vars | Unit | P0 |
| Throws if env vars missing | Unit | P0 |
| Auth config has correct settings | Unit | P1 |

---

## 3. Component Tests

### 3.1 `components/CapProgressBar.tsx`

| Test Case | Priority |
|-----------|----------|
| Renders with 0% (green, empty bar) | P0 |
| Renders with 50% (amber threshold) | P0 |
| Renders with 80% (red threshold) | P0 |
| Renders with 100% (full bar, red) | P0 |
| Renders with > 100% (clamped to 100%) | P1 |
| Displays correct percentage text | P1 |

### 3.2 `components/GlassCard.tsx`

| Test Case | Priority |
|-----------|----------|
| Renders children correctly | P0 |
| Uses BlurView on iOS | P1 |
| Uses fallback View on Android | P1 |

### 3.3 `components/EmptyState.tsx`

| Test Case | Priority |
|-----------|----------|
| Renders icon, title, description | P0 |
| Renders without optional props | P1 |

### 3.4 `components/CategoryTile.tsx`

| Test Case | Priority |
|-----------|----------|
| Renders emoji and category name | P0 |
| Calls onPress when tapped | P0 |

---

## 4. Screen Tests (Integration)

### 4.1 Auth Screens

| Test Case | Priority |
|-----------|----------|
| Login: renders email and password inputs | P0 |
| Login: shows alert on empty fields | P0 |
| Login: calls signIn on valid submit | P0 |
| Login: shows error on auth failure | P0 |
| Login: navigates to signup | P1 |
| Signup: validates password length | P0 |
| Signup: validates password match | P0 |
| Signup: calls signUp on valid submit | P0 |
| Signup: shows success alert and redirects | P0 |

### 4.2 Onboarding Screen

| Test Case | Priority |
|-----------|----------|
| Renders card list grouped by bank | P0 |
| Toggling card updates selection state | P0 |
| Continue button disabled with 0 selections | P0 |
| Submitting inserts user_cards | P0 |
| Error handling on insert failure | P1 |

### 4.3 Recommend Flow

| Test Case | Priority |
|-----------|----------|
| Home shows 7 category tiles | P0 |
| Tapping category navigates to results | P0 |
| Results show ranked cards with scores | P0 |
| Top card has is_recommended = true | P0 |
| Empty state for no cards | P1 |

### 4.4 Transaction Logging

| Test Case | Priority |
|-----------|----------|
| Renders category selector and keypad | P0 |
| Keypad updates amount correctly | P0 |
| Decimal handling (max 2 places) | P0 |
| Submit inserts transaction | P0 |
| Success modal shows after insert | P0 |
| Error handling on insert failure | P1 |

---

## 5. E2E Test Scenarios (Detox — Future)

### Critical User Journeys

| # | Journey | Steps | Priority |
|---|---------|-------|----------|
| 1 | **New User Flow** | Sign up → verify email → sign in → onboarding → select cards → home | P0 |
| 2 | **Get Recommendation** | Home → tap Dining → view ranked cards → note top card | P0 |
| 3 | **Log Transaction** | Home → tap Dining → tap "Use this card" → enter $50 → submit → success | P0 |
| 4 | **Check Cap Status** | Log tx → go to Cap Status → verify cap updated → check badge | P0 |
| 5 | **View History** | Profile → Transaction History → verify recent tx appears | P1 |
| 6 | **Remove Card** | My Cards → swipe card → confirm remove → verify removed | P1 |
| 7 | **Send Feedback** | Profile → Send Feedback → type message → submit | P2 |
| 8 | **Sign Out & Back In** | Profile → Sign Out → confirm → sign in again | P1 |

### E2E Setup (when ready)

```bash
# Install Detox
npm install -g detox-cli
npm install --save-dev detox @types/detox

# iOS
detox build --configuration ios.sim.debug
detox test --configuration ios.sim.debug

# Android
detox build --configuration android.emu.debug
detox test --configuration android.emu.debug
```

---

## 6. Mocking Strategy

| Dependency | Mock Approach |
|------------|---------------|
| `@supabase/supabase-js` | Jest mock module returning controlled responses |
| `AsyncStorage` | `@react-native-async-storage/async-storage/jest/async-storage-mock` |
| `expo-router` | Mock `useRouter`, `useLocalSearchParams`, `useSegments` |
| `expo-blur` | Auto-mock (renders as View) |
| `@expo/vector-icons` | Auto-mock (renders as Text) |
| `Alert` | Jest spy on `Alert.alert` to verify calls |

---

## 7. Running Tests

```bash
# Run all tests
npx jest

# Run with coverage
npx jest --coverage

# Run specific test file
npx jest lib/analytics.test.ts

# Run in watch mode
npx jest --watch
```

---

## 8. Coverage Targets

| Module | Target | Rationale |
|--------|--------|-----------|
| `lib/analytics.ts` | 90% | Core metric tracking, must be reliable |
| `lib/error-handler.ts` | 90% | User-facing error messages, must be correct |
| `lib/supabase.ts` | 80% | Initialization logic |
| `components/` | 70% | UI components with defined behavior |
| `app/` screens | 60% | Integration-level, harder to isolate |
| **Overall** | **70%** | Beta-appropriate coverage |
