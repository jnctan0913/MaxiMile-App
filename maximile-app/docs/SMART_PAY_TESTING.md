# Smart Pay Advisor -- Physical Device Testing Checklist

This checklist covers manual testing scenarios for the Smart Pay Advisor feature on physical devices. All tests should be performed on real hardware to validate GPS, wallet deep-links, and native behavior that cannot be reliably tested in simulators or emulators.

---

## Pre-Testing Setup

- Physical iOS device available (iPhone running iOS 16+)
- Physical Android device available (optional, running Android 12+)
- Google Places API key configured in Supabase Edge Function
- Test user account with 2+ cards in portfolio
- Known test locations identified: restaurant, supermarket, MRT station
- Network connectivity confirmed (4G / Wi-Fi)
- App installed from latest build

---

## 1. GPS / Location Tests

- [ ] Tap Smart Pay outdoors -- GPS fix obtained within 10 seconds
- [ ] Tap Smart Pay indoors (mall) -- observe accuracy, expect possible fallback
- [ ] Deny location permission -- see "Could not detect location" with Try Again / Choose Manually options
- [ ] Revoke permission mid-flow -- graceful error handling, no crash
- [ ] Airplane mode -- "Could not detect location" error displayed
- [ ] GPS accuracy > 100m -- warning message shown to user

---

## 2. Merchant Detection Tests

- [ ] At a known restaurant -- detects restaurant, maps to "Dining"
- [ ] At a supermarket -- detects store, maps to "Groceries"
- [ ] At a transit station -- maps to "Transport"
- [ ] In empty area (park) -- "No merchant found" fallback displayed
- [ ] Multiple merchants nearby -- shows top result based on proximity
- [ ] Confidence badge: high/medium/low displayed correctly based on detection quality

---

## 3. Category Override Tests

- [ ] Tap "Change" on detected category -- category picker modal opens
- [ ] Select different category -- re-runs recommendation with new category
- [ ] Original category preserved in analytics (merchant_confirmed event includes changed flag)

---

## 4. Card Recommendation Tests

- [ ] Best card displayed with correct earn rate for the detected category
- [ ] Cap progress bar shown for capped cards (reflects current spend against cap)
- [ ] "No cap limit" shown for uncapped cards
- [ ] Alternative cards listed below the top pick
- [ ] Conditions note displayed if present (e.g., minimum spend, exclusions)

---

## 5. Wallet Deep-Link Tests

- [ ] iOS: "Open Wallet" button opens Apple Wallet (shoebox://)
- [ ] iOS: Return from Wallet triggers "Log Transaction" prompt
- [ ] Android: "Open Wallet" opens Google Pay
- [ ] Wallet not installed -- fallback alert shown with instructions
- [ ] Web: wallet button not shown (hidden on non-native platforms)

---

## 6. Transaction Logging Tests

- [ ] Amount keypad works correctly (digits, decimal point, backspace)
- [ ] Card and category pre-filled from recommendation context
- [ ] Merchant name saved in transaction record
- [ ] "Skip" button navigates back without logging a transaction
- [ ] Success overlay shows correct miles earned and remaining cap
- [ ] "Done" button dismisses overlay and navigates back to previous screen

---

## 7. Integration Tests

- [ ] FAB visible on Recommend home screen (gold color, bottom-right position)
- [ ] FAB navigates to /pay with source=fab
- [ ] "Smart Pay" CTA on recommendation result screen is visible
- [ ] CTA navigates to /pay with source=recommend_cta
- [ ] Back button from pay screen returns to previous screen correctly
- [ ] State preserved when returning from Wallet app (no data loss)

---

## 8. Performance Tests

- [ ] Tap to recommendation displayed in < 5 seconds on 4G connection
- [ ] No blank screen -- progressive loading states visible throughout the flow
- [ ] Cache: second tap at same location is instant (< 1 second response)
- [ ] No crashes during any flow (location, detection, recommendation, logging)

---

## 9. Analytics Verification

- [ ] pay_flow_started fires on screen mount
- [ ] location_detected fires with accuracy and duration properties
- [ ] merchant_detected fires with name, category, and confidence properties
- [ ] merchant_confirmed fires with changed flag (true if user overrode category)
- [ ] wallet_opened fires with platform and success properties
- [ ] pay_transaction_logged fires with amount, category, and card properties
- [ ] pay_flow_error fires on any error encountered during the flow
- [ ] pay_flow_abandoned fires on back navigation or skip action

---

## 10. Edge Cases

- [ ] User with 0 cards -- error message shown prompting user to add cards
- [ ] API rate limit exceeded -- graceful error with retry guidance
- [ ] Network timeout -- error displayed with retry option
- [ ] App killed while in Wallet -- transaction state recoverable on relaunch
- [ ] Rapid taps on Smart Pay FAB -- no duplicate screens created

---

## Pass/Fail Criteria

| Metric                  | Target                                     |
|-------------------------|--------------------------------------------|
| Location success rate   | > 80% outdoors                             |
| Merchant detection      | > 50% at known commercial locations        |
| Category accuracy       | > 70% confirmed without user override      |
| Flow completion         | > 60% of sessions reach success state      |
| Crash rate              | 0 crashes across all test scenarios        |
| Error rate              | < 5% unrecoverable errors                  |

---

## Test Execution Log

| Date | Tester | Device | OS Version | Build | Pass/Fail | Notes |
|------|--------|--------|------------|-------|-----------|-------|
|      |        |        |            |       |           |       |

---

## Notes

- All tests should be repeated on both iOS and Android when both devices are available.
- Record exact device model, OS version, and app build number before starting.
- For location tests, note the actual GPS coordinates and accuracy reported by the device.
- Screenshots or screen recordings should be captured for any failed test case.
- File bugs with the test case number, device info, and reproduction steps.
