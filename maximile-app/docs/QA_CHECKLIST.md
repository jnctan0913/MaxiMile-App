# MaxiMile QA Checklist — Phase 4 (T4.03)

> **Tester**: Tester Agent
> **Date**: 2026-02-20
> **App Version**: 1.0.0-beta

---

## 1. Auth Flows

### Login (`app/(auth)/login.tsx`)
- [ ] Happy path: enter valid email + password → sign in → redirect to tabs
- [ ] Empty email → shows "Missing fields" alert
- [ ] Empty password → shows "Missing fields" alert
- [ ] Wrong password → shows "Invalid email or password" error
- [ ] Unregistered email → shows appropriate error
- [ ] Network offline → shows "Connection Error" alert
- [ ] Keyboard: Return key on password field submits form
- [ ] "Sign Up" link navigates to signup screen
- [ ] Loading spinner shown during sign-in

### Signup (`app/(auth)/signup.tsx`)
- [ ] Happy path: valid email + matching passwords (6+ chars) → account created alert
- [ ] Password < 6 chars → "Weak password" alert
- [ ] Passwords don't match → "Password mismatch" alert
- [ ] Empty fields → "Missing fields" alert
- [ ] Already registered email → shows user-friendly error
- [ ] Network offline → shows "Connection Error" alert
- [ ] "Sign In" link navigates back to login
- [ ] After signup, "OK" redirects to login screen
- [ ] Loading spinner shown during signup

### Session
- [ ] App restart with valid session → auto-login (no login screen flash)
- [ ] Session expiry → redirected to login screen
- [ ] Sign out from profile → redirected to login, session cleared

---

## 2. Onboarding (`app/onboarding.tsx`)

- [ ] First-time user (no cards) → redirected to onboarding
- [ ] Card list loads grouped by bank (SectionList)
- [ ] Tapping a card toggles selection (checkmark appears)
- [ ] "Continue" disabled / hidden when 0 cards selected
- [ ] Selecting 1+ cards → "Continue" enabled
- [ ] Submit → cards inserted → redirected to tabs home
- [ ] Error on card insert → shows error alert, doesn't redirect
- [ ] Network offline → shows network error alert
- [ ] Loading state while fetching cards
- [ ] All 20 SG miles cards present across banks

---

## 3. Recommend Tab (`app/(tabs)/index.tsx`)

- [ ] Shows 7 category tiles (Dining, Transport, Online, Travel, Groceries, Bills, General)
- [ ] Each tile shows correct emoji and name
- [ ] Tap tile → navigates to recommendation screen for that category
- [ ] User with 0 cards → shows empty state
- [ ] Network offline during load → shows network error alert
- [ ] Screen title shows "MaxiMile"

### Recommendation Result (`app/recommend/[category].tsx`)
- [ ] Shows ranked list of user's cards for selected category
- [ ] Top card marked as "Recommended" with visual highlight
- [ ] Each card shows: bank, name, earn rate (mpd), remaining cap, score
- [ ] GlassCard component renders correctly on iOS (blur) and Android (fallback)
- [ ] "Use this card" or tap → navigates to log screen with category pre-selected
- [ ] Empty result (no cards for category) → appropriate message
- [ ] Network error → shows error alert
- [ ] Back navigation returns to recommend home
- [ ] Analytics: `recommendation_used` event fires on successful load

---

## 4. My Cards Tab (`app/(tabs)/cards.tsx`)

- [ ] Shows FlatList of user's cards with bank logo/name
- [ ] Swipe-to-remove gesture works
- [ ] Remove confirmation dialog appears
- [ ] Confirm remove → card deleted → list updates
- [ ] Cancel remove → card stays
- [ ] Empty state when all cards removed → "Add cards" message
- [ ] Pull-to-refresh works
- [ ] Tap card → navigates to card detail screen
- [ ] Network error on load → shows error alert

### Card Detail (`app/card/[id].tsx`)
- [ ] Shows card name, bank, network
- [ ] Earn rates table (category, rate, cap)
- [ ] Cap progress bars (color-coded: green < 50%, amber 50-80%, red > 80%)
- [ ] Back navigation returns to My Cards
- [ ] Network error → shows error alert
- [ ] Remove card button works with confirmation

---

## 5. Cap Status Tab (`app/(tabs)/caps.tsx`)

- [ ] Shows cap progress for all user cards with active caps
- [ ] Progress bars color-coded (green/amber/red)
- [ ] Sorted by urgency (highest usage first)
- [ ] Shows remaining cap amount and percentage
- [ ] Reset countdown visible (days until month end)
- [ ] Empty state when user has no capped cards
- [ ] Pull-to-refresh works
- [ ] Network error → shows error alert
- [ ] Tab badge (red dot) appears when any cap >= 80%

---

## 6. Log Transaction Tab (`app/(tabs)/log.tsx`)

- [ ] Category selector shows all 7 categories
- [ ] Card picker shows user's cards (filtered by category if applicable)
- [ ] Custom numeric keypad works for amount entry
- [ ] Decimal entry (max 2 decimal places)
- [ ] Amount $0 → submit disabled / validation error
- [ ] Valid submission → success modal with glassmorphism overlay
- [ ] Transaction inserted → cap state updated (verify in cap tab)
- [ ] Network error on submit → shows error alert
- [ ] Loading state during submission
- [ ] Analytics: `transaction_logged` event fires on success
- [ ] Back/dismiss returns to default state

---

## 7. Profile Tab (`app/(tabs)/profile.tsx`)

- [ ] Shows user email
- [ ] Shows "Member since" date
- [ ] "Transaction History" → navigates to transactions screen
- [ ] "Send Feedback" → navigates to feedback screen
- [ ] "About MaxiMile" → shows modal with app description
- [ ] "Privacy Policy" → shows policy alert
- [ ] "Sign Out" → confirmation dialog → signs out
- [ ] Version number displayed at bottom

### Transaction History (`app/transactions.tsx`)
- [ ] SectionList grouped by month
- [ ] Each row shows: category emoji, category name, card name, amount, date
- [ ] Sorted by date DESC
- [ ] Pull-to-refresh works
- [ ] Empty state: "No transactions logged yet"
- [ ] Network error → shows error alert
- [ ] Back button returns to profile

### Feedback Form (`app/feedback.tsx`)
- [ ] Toggle between "Report Issue" and "Suggest Feature"
- [ ] Text input accepts message (min 10 chars)
- [ ] Submit disabled when message < 10 chars
- [ ] Character count shown (max 1000)
- [ ] Successful submit → thank you alert → navigate back
- [ ] Network error → shows error alert
- [ ] Analytics: `feedback_submitted` event fires

---

## 8. Navigation

- [ ] Tab switching works correctly between all 5 tabs
- [ ] Deep links: recommend → category → log flow works
- [ ] Back button behavior correct on all stack screens
- [ ] No duplicate screens on navigation stack
- [ ] Hardware back button (Android) works correctly

---

## 9. Error Handling

- [ ] All Supabase calls wrapped in try-catch (verify: caps, cards, index, log, onboarding, card detail, transactions, feedback)
- [ ] Network offline → consistent "Connection Error" alerts across all screens
- [ ] Empty states render correctly (no crashes) on all list screens
- [ ] Null user → no crashes (all `user?.id` checks present)
- [ ] Error-handler provides user-friendly messages (no raw Supabase errors shown)

---

## 10. Analytics

- [ ] `sign_in` event fires on successful login
- [ ] `sign_up` event fires on successful signup
- [ ] `sign_out` event fires on sign out
- [ ] `card_added` event fires during onboarding
- [ ] `card_removed` event fires on card removal
- [ ] `recommendation_used` event fires when viewing recommendations
- [ ] `transaction_logged` event fires on successful transaction
- [ ] `screen_view` events fire on cap status screen
- [ ] `feedback_submitted` event fires on feedback submit
- [ ] `onboarding_completed` event fires after card selection
- [ ] MARU counter increments on `recommendation_used`
- [ ] Analytics buffer doesn't exceed 500 events
- [ ] Analytics failures don't crash the app (silent fail)

---

## 11. UI Consistency

- [ ] All screens use `Colors.background` for safe area background
- [ ] All cards use `Shadows.sm` + `BorderRadius.md` consistently
- [ ] All screen titles use `Typography.heading` (not inline styles)
- [ ] All input labels use `Typography.captionBold`
- [ ] All body text uses `Typography.body`
- [ ] Consistent padding (`Spacing.lg`) on all screens
- [ ] Glassmorphism tab bar renders on both iOS (blur) and Android (fallback)
- [ ] Dark text on light background throughout (no contrast issues)
