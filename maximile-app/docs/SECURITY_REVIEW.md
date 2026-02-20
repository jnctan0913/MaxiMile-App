# MaxiMile Security Review — Phase 4 (T4.05)

> **Reviewer**: Software Engineer Agent
> **Date**: 2026-02-20
> **Scope**: RLS policies, auth flows, data isolation, API key handling

---

## 1. Row Level Security (RLS) Assessment

### 1.1 Reference Tables (Read-Only)

| Table | RLS Enabled | Policy | Roles | Verdict |
|-------|-------------|--------|-------|---------|
| `cards` | Yes | `cards_select_public` — SELECT only | anon, authenticated | **PASS** |
| `categories` | Yes | `categories_select_public` — SELECT only | anon, authenticated | **PASS** |
| `earn_rules` | Yes | `earn_rules_select_public` — SELECT only | anon, authenticated | **PASS** |
| `caps` | Yes | `caps_select_public` — SELECT only | anon, authenticated | **PASS** |
| `exclusions` | Yes | `exclusions_select_public` — SELECT only | anon, authenticated | **PASS** |

No INSERT/UPDATE/DELETE policies exist for reference tables. Only `service_role` can modify them. **Correct.**

### 1.2 User-Owned Tables

| Table | RLS Enabled | SELECT | INSERT | UPDATE | DELETE | Verdict |
|-------|-------------|--------|--------|--------|--------|---------|
| `user_cards` | Yes | Own (`user_id = auth.uid()`) | Own (`WITH CHECK`) | None (by design) | Own | **PASS** |
| `transactions` | Yes | Own | Own | None (immutable) | None (immutable) | **PASS** |
| `spending_state` | Yes | Own | None (trigger only) | None (trigger only) | None | **PASS** |
| `feedback` | Yes | Own | Own | None | None | **PASS** |
| `analytics_events` | Yes | None (admin only) | Own | None | None | **PASS** |

### 1.3 Key Security Patterns

- **`spending_state`**: No direct INSERT/UPDATE/DELETE for authenticated users. All writes happen via `update_spending_state()` trigger which is `SECURITY DEFINER`. This prevents users from manipulating their cap state. **Excellent.**
- **`transactions`**: Immutable (no UPDATE/DELETE). Corrections use offsetting entries. **Correct.**
- **`analytics_events`**: Users can INSERT but not SELECT their own events. Analytics data is admin/service-role only. **Correct.**
- **`user_id` column defaults**: `user_cards`, `transactions`, `feedback`, `analytics_events` all have `DEFAULT auth.uid()`. Clients don't need to send `user_id`, and the `WITH CHECK` policies enforce it matches the JWT. **Correct.**

### 1.4 SECURITY DEFINER Functions

| Function | SECURITY DEFINER | `search_path = public` | Access Control |
|----------|:---:|:---:|---|
| `recommend()` | Yes | Yes | GRANT to `authenticated`, REVOKE from `anon` |
| `update_spending_state()` | Yes | Yes | Trigger-only (no direct EXECUTE needed) |
| `update_spending_state_on_delete()` | Yes | Yes | Trigger-only |
| `reset_caps_for_month()` | Yes | Yes | REVOKE from all (`PUBLIC`, `authenticated`, `anon`) |
| `purge_old_spending_state()` | Yes | Yes | REVOKE from all |

All SECURITY DEFINER functions explicitly set `search_path = public` to prevent search_path injection. Admin utility functions are properly restricted to `service_role` only. **Correct.**

---

## 2. Authentication Flow Assessment

### 2.1 Supabase Client (`lib/supabase.ts`)

- API keys loaded from environment variables (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`). **No hardcoded keys. PASS.**
- Runtime check throws if env vars are missing. **PASS.**
- Uses `anon` key only (not `service_role`). **PASS.**
- Session persistence via `AsyncStorage`. Auto-refresh enabled. `detectSessionInUrl: false` for React Native compatibility. **PASS.**

### 2.2 Auth Context (`contexts/AuthContext.tsx`)

- Passwords are passed directly to `supabase.auth.signInWithPassword()` / `signUp()` and never stored in state, logged, or exposed. **PASS.**
- Auth state listener properly unsubscribes on unmount. **PASS.**
- Redirect logic: unauthenticated → login, no cards → onboarding, has cards → tabs. Checked on every segment change. **PASS.**
- `checkOnboardingStatus` queries `user_cards` filtered by `user_id` via RLS. **PASS.**

### 2.3 Login/Signup Screens

- `login.tsx`: Uses `handleAuthError()` for user-friendly messages. No password logging. `secureTextEntry` on password field. `textContentType="password"` for iOS autofill. **PASS.**
- `signup.tsx`: Password validation (min 6 chars, confirm match). `textContentType="newPassword"`. Uses `handleAuthError()`. **PASS.**
- Both screens wrapped in try-catch for network failures. **PASS.**

---

## 3. Data Isolation Verification

All Supabase queries from the client filter by authenticated user:

| Screen | Query | Filter | Verdict |
|--------|-------|--------|---------|
| `index.tsx` | `user_cards.select()` | `.eq('user_id', user.id)` | **PASS** |
| `cards.tsx` | `user_cards.select()` + `delete()` | `.eq('user_id', user.id)` | **PASS** |
| `caps.tsx` | `user_cards`, `spending_state` | `.eq('user_id', user.id)` | **PASS** |
| `log.tsx` | `user_cards.select()`, `transactions.insert()` | `.eq('user_id', user.id)` / RLS default | **PASS** |
| `recommend/[category].tsx` | `recommend()` RPC | `auth.uid()` inside function | **PASS** |
| `onboarding.tsx` | `user_cards.insert()` | RLS `WITH CHECK` / `auth.uid()` default | **PASS** |
| `card/[id].tsx` | `user_cards`, `spending_state` | `.eq('user_id', user.id)` | **PASS** |
| `transactions.tsx` | `transactions.select()` | `.eq('user_id', user.id)` | **PASS** |
| `profile.tsx` | User info from `auth.users` (session) | Session-scoped | **PASS** |
| `feedback.tsx` | `feedback.insert()` | RLS `WITH CHECK` / `auth.uid()` default | **PASS** |
| `_layout.tsx` (tabs) | `user_cards`, `caps`, `spending_state` | `.eq('user_id', user.id)` | **PASS** |

Even if a client tried to override `user_id` in an INSERT, the RLS `WITH CHECK (user_id = auth.uid())` policy would reject it. Double protection via both client-side filtering and server-side RLS. **Correct.**

---

## 4. Issues Found

### P2 — Low Severity

| # | Issue | Location | Recommendation |
|---|-------|----------|----------------|
| 1 | `EXPO_PUBLIC_*` env vars are embedded in the JS bundle at build time and visible to anyone who decompiles the app. | `lib/supabase.ts` | This is expected for Supabase `anon` keys (they are designed to be public, with RLS enforcing security). However, document this in the README so developers don't accidentally put `service_role` keys in `EXPO_PUBLIC_*` vars. |
| 2 | No rate limiting on client-side sign-in attempts. | `login.tsx` | Supabase has server-side rate limiting. Consider adding client-side throttling (e.g., disable button for 30s after 3 failed attempts) in v1.1 for better UX. |
| 3 | `anon` role can SELECT reference tables. | `002_rls_and_functions.sql` | Acceptable for public card data. If card rules become proprietary in future, restrict to `authenticated` only. |
| 4 | No email verification enforcement before accessing app. | `AuthContext.tsx` | Signup shows "check your email" alert but doesn't block unverified users from signing in. Consider checking `user.email_confirmed_at` in v1.1. |

### No P0 or P1 Issues Found

The codebase demonstrates solid security practices:
- All tables have RLS enabled
- All user-owned data is properly scoped with `auth.uid()`
- SECURITY DEFINER functions have explicit `search_path`
- Admin functions are properly restricted
- No hardcoded secrets
- No SQL injection vectors (all queries use parameterized Supabase client)
- Password handling is clean (no logging, no exposure)

---

## 5. Summary

| Area | Status |
|------|--------|
| RLS Policies | **All 8 tables protected. No gaps.** |
| Auth Flows | **Clean. No password exposure. Proper session management.** |
| Data Isolation | **All queries scoped to authenticated user. Double protection (client + RLS).** |
| API Keys | **Environment variables only. No hardcoded secrets.** |
| SECURITY DEFINER | **All functions set search_path. Admin functions restricted.** |
| Overall | **PASS — Ready for beta** |

No P0/P1 issues. 4 P2 recommendations for v1.1 hardening.
