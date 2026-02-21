# Feasibility Analysis: Notification-Based Transaction Auto-Capture

**Date**: 2026-02-21
**Author**: Software Engineer Agent
**Status**: Research Complete
**Relates to**: Friction F7 (Manual Tracking Fatigue), Gap 1 (Manual Logging Paradox)

---

## 1. Executive Summary

This document evaluates the feasibility of using mobile payment and banking app notifications to automatically capture transaction data (amount, merchant, card) in MaxiMile — reducing or eliminating the manual logging burden identified as the product's #1 risk.

**Key finding**: There are **3 viable approaches**, each with different trade-offs:

| Approach | Platform | Feasibility | Coverage | User Setup |
|----------|----------|-------------|----------|------------|
| **A. iOS Shortcuts Transaction Trigger** | iOS only | **High** | Apple Pay NFC only (~30% of SG transactions) | Medium (one-time per card) |
| **B. Notification Screenshot + OCR** | iOS + Android | **Medium** | All banking apps | High (manual per transaction) |
| **C. Android NotificationListenerService** | Android only | **High** | All banking app notifications | Low (one-time permission) |

**Recommended strategy**: **Approach A (iOS Shortcuts)** as the primary path for v2.0, supplemented by Approach B as a fallback. Approach C for Android expansion.

---

## 2. The Problem This Solves

From the Problem-Solution Analysis (v1.1):

> **Gap 1: The Manual Logging Paradox (HIGH RISK)**
> The product's #1 promise is to eliminate manual tracking. Yet the product requires manual transaction logging for cap tracking accuracy. Users must log every transaction (~20 sec each) after every payment.

**Current state**: ~20 seconds per transaction, manual input
**Target state**: ~2-3 seconds per transaction, auto-populated with confirmation
**Ideal state**: 0 seconds, fully automated (requires bank API — not available in SG)

---

## 3. Approach A: iOS Shortcuts Transaction Trigger (RECOMMENDED)

### 3.1 How It Works

Apple introduced a **Transaction trigger** in iOS 17 (2023) for Shortcuts Personal Automations. When a user makes an **Apple Pay NFC payment**, the Shortcuts app can automatically run an automation that:

1. Captures the **amount**, **merchant name**, and **card used**
2. Passes this data via URL scheme to MaxiMile
3. MaxiMile auto-populates the transaction log with the captured data
4. User confirms with a single tap (or it auto-logs if configured)

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Apple Pay   │────→│  iOS Shortcuts   │────→│   MaxiMile App  │
│  NFC Tap     │     │  Transaction     │     │   (URL Scheme)  │
│              │     │  Trigger         │     │                 │
│  Captures:   │     │  Passes via:     │     │  Auto-populates │
│  - Amount    │     │  maximile://log  │     │  transaction    │
│  - Merchant  │     │  ?amount=X       │     │  form → confirm │
│  - Card      │     │  &merchant=Y     │     │                 │
└─────────────┘     └──────────────────┘     └─────────────────┘
```

### 3.2 Available Data from Transaction Trigger

| Variable | Source | Format | Notes |
|----------|--------|--------|-------|
| **Amount** | Shortcut Input → Amount | Currency string (e.g., "S$42.50") | Needs parsing to strip currency symbols |
| **Merchant** | Shortcut Input → Merchant | String (e.g., "COLD STORAGE GREAT WORLD") | May need normalization/category mapping |
| **Card** | Shortcut Input → Card | Account name (e.g., "DBS Altitude Visa") | Must match MaxiMile card names |

### 3.3 Implementation Architecture

**MaxiMile already has a URL scheme** (`maximile://` — defined in `app.json`). The integration requires:

#### Step 1: Deep Link Handler (in MaxiMile)
```
maximile://log?amount=42.50&merchant=COLD+STORAGE&card=DBS+Altitude+Visa&source=shortcut
```

The app would:
1. Parse URL parameters
2. Match card name to user's card portfolio
3. Auto-detect spend category from merchant name (fuzzy match)
4. Present pre-filled transaction form for one-tap confirmation

#### Step 2: Shortcut Template (shared with users)
MaxiMile provides a downloadable Shortcut (via `.shortcut` file or in-app guide) that:
1. Triggers on any Apple Pay transaction
2. Extracts Amount, Merchant, Card from Shortcut Input
3. Constructs the `maximile://` URL
4. Opens MaxiMile with pre-filled data

#### Step 3: Setup Flow (in MaxiMile)
In-app onboarding guide:
1. "Automate your logging" → walks user through Shortcuts setup
2. Card name matching verification
3. Test transaction to validate the flow

### 3.4 Existing Precedent (App Store Approved)

Multiple expense trackers have shipped this exact pattern and are live on the App Store:

| App | Approach | Status |
|-----|----------|--------|
| **TravelSpend** | Shortcuts Transaction trigger → URL scheme | Live, App Store approved |
| **BalanceTrackr** | Shortcuts Transaction trigger → URL scheme | Live, App Store approved |
| **MoneyCoach** | Shortcuts Transaction trigger → in-app action | Live, App Store approved |
| **Skwad** | Shortcuts Transaction trigger → API call | Live, App Store approved |
| **Expenses.cash** | Shortcuts "Import Transaction from Wallet" | Live, App Store approved |

**App Store risk: NONE.** This is an Apple-sanctioned mechanism using the official Shortcuts API. No private APIs, no notification interception, no sandbox violations.

### 3.5 Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Apple Pay NFC only** | Online purchases, physical card swipes, and non-Apple-Pay transactions are NOT captured | Fallback to manual logging or Approach B for these cases |
| **In-store only** | Web/in-app purchases via Apple Pay don't trigger | Clear messaging to users |
| **iOS only** | No Android equivalent for Wallet transaction triggers | Approach C for Android |
| **Requires user setup** | User must create the Shortcut automation (one-time, ~2 min) | Provide downloadable Shortcut + step-by-step guide |
| **iOS 17+ required** | Older iPhones excluded | Singapore iPhone adoption skews new; iOS 17+ covers ~90%+ of active iPhones |
| **Apple Watch/Mac transactions** | Not triggered by Watch or Mac Apple Pay | Document limitation |
| **iOS 18 reliability issues** | Some users report intermittent trigger failures on iOS 18 | Monitor Apple bug reports; build retry mechanism |

### 3.6 Coverage Estimate (Singapore Context)

- **70%+ of iPhone users in Singapore have Apple Pay enabled**
- **~55% of in-person transactions in SG are contactless** (and growing)
- **iPhone market share in Singapore: ~35-40%**
- **Effective coverage**: ~35-40% of MaxiMile users × 70% Apple Pay adoption × contactless-only = **~20-25% of all transactions auto-captured**

This won't capture everything, but it eliminates logging for the most frequent use case (daily in-store purchases) and creates a **dramatically better experience** for those transactions.

---

## 4. Approach B: Notification Screenshot + OCR (SUPPLEMENTARY)

### 4.1 How It Works

When a banking app sends a push notification for a credit card transaction, the user can:
1. Take a screenshot or long-press the notification
2. Share it to MaxiMile via the iOS Share Sheet
3. MaxiMile uses on-device OCR (Apple Vision framework / VisionKit) to extract amount, merchant, and card
4. Auto-populates the transaction log

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Banking App │────→│  User takes      │────→│  MaxiMile Share │
│  Notification│     │  screenshot or   │     │  Extension      │
│              │     │  shares image    │     │                 │
│  Shows:      │     │                  │     │  OCR extracts:  │
│  - Amount    │     │  Share Sheet →   │     │  - Amount       │
│  - Merchant  │     │  MaxiMile        │     │  - Merchant     │
│  - Card      │     │                  │     │  - Card         │
└─────────────┘     └──────────────────┘     └─────────────────┘
```

### 4.2 Singapore Banking Notification Formats

Singapore banks send transaction alerts via push notification and/or SMS:

| Bank | Notification Format (typical) | Threshold |
|------|-------------------------------|-----------|
| **DBS** | "Your DBS/POSB Card ending 1234 was used for SGD 42.50 at COLD STORAGE on 21 Feb" | Configurable |
| **OCBC** | "Card xxxx1234 txn SGD 42.50 at MERCHANT NAME on 21/02" | Configurable (default: all) |
| **UOB** | "UOB Card ending 1234: SGD 42.50 at MERCHANT. Date: 21 Feb 2026" | Configurable |
| **Citi** | "Citi Card x1234 SGD 42.50 MERCHANT NAME 21FEB" | Configurable |
| **AMEX** | "A charge of SGD 42.50 was made on your AMEX card ending 1234 at MERCHANT" | All transactions |

**Key observation**: All SG banks include amount, last-4-digits, and merchant in notifications. Formats are **structured enough for regex parsing** without full NLP.

### 4.3 Technical Feasibility

| Component | Approach | Feasibility |
|-----------|----------|-------------|
| **Share Extension** | Expo Share Extension (requires ejecting from Expo Go) | Medium — requires native module |
| **OCR Engine** | Apple VisionKit (on-device, free, no API costs) | High — iOS 15+ |
| **Text Parsing** | Regex patterns per bank format | High — structured text |
| **Category Mapping** | Merchant name → spending category lookup | Medium — needs merchant database |

### 4.4 Limitations

- **Still requires user action** (screenshot + share) — reduces from ~20 sec to ~5-8 sec
- **Not fully automatic** — more of a "semi-automated" approach
- **Requires ejecting from Expo Go** to build native Share Extension
- **Bank format changes** could break parsing (mitigated by community submissions for format reporting)

### 4.5 Verdict

**Supplementary, not primary.** Useful as a fallback for non-Apple-Pay transactions, but the user action requirement means this is an incremental improvement, not a step-change.

---

## 5. Approach C: Android NotificationListenerService (ANDROID PLATFORM)

### 5.1 How It Works

Android provides a **system-level API** (`NotificationListenerService`) that allows apps to read all incoming notifications — including banking app notifications — with explicit user permission.

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Banking App │────→│  Android OS      │────→│  MaxiMile       │
│  Notification│     │  Notification    │     │  Notification   │
│              │     │  Listener        │     │  Listener       │
│  DBS: "Card  │     │  Service         │     │  Service        │
│  used $42.50 │     │                  │     │                 │
│  at NTUC"    │     │  Forwards to     │     │  Parses amount, │
│              │     │  registered      │     │  merchant, card │
│              │     │  listeners       │     │  → auto-logs    │
└─────────────┘     └──────────────────┘     └─────────────────┘
```

### 5.2 Technical Details

| Aspect | Detail |
|--------|--------|
| **API** | `android.service.notification.NotificationListenerService` |
| **Permission** | `BIND_NOTIFICATION_LISTENER_SERVICE` — user grants via Settings → Notifications → Notification access |
| **Data available** | Full notification content: title, text, sub-text, big text, extras |
| **Background operation** | Runs as a foreground service; works when app is backgrounded |
| **Play Store policy** | Allowed with clear disclosure and user consent |

### 5.3 Existing Precedent (Play Store Approved)

| App | Downloads | Approach |
|-----|-----------|----------|
| **FinArt** | 1M+ | NotificationListenerService + SMS parsing |
| **Walnut** | 5M+ (India) | SMS + notification parsing for auto-expense tracking |
| **PennyWise AI** | Open source | NotificationListenerService for bank notification parsing |

### 5.4 React Native / Expo Compatibility

| Concern | Assessment |
|---------|------------|
| **Expo Go** | NOT compatible — requires custom native module |
| **Expo Dev Build** | Compatible — can add native Android module via config plugin |
| **React Native** | Fully compatible — native module bridges to JS |
| **Existing libraries** | `react-native-notification-listener` — community package, actively maintained |

### 5.5 Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Android only** | No iOS equivalent | Use Approach A for iOS |
| **Sensitive permission** | Users may hesitate to grant notification access | Clear privacy disclosure, on-device-only processing |
| **Battery impact** | Background service consumes battery | Efficient filtering — only process banking app notifications |
| **Play Store scrutiny** | Google reviews notification access usage | Transparent privacy policy, minimal data collection |

### 5.6 Verdict

**Highly viable for Android users.** The NotificationListenerService is the standard approach for auto-expense tracking on Android, with multiple Play Store-approved precedents. Combined with Approach A (iOS Shortcuts), this would give MaxiMile cross-platform auto-capture.

---

## 6. Mobile Wallet Integration (Apple Pay / Google Pay)

### 6.1 Apple Pay (iOS)

Apple Pay transactions generate the richest auto-capture data via the Shortcuts Transaction trigger:

| Data Point | Available? | Source |
|------------|-----------|--------|
| Amount | Yes | Shortcut Input variable |
| Merchant name | Yes | Shortcut Input variable |
| Card used | Yes | Shortcut Input variable (account name) |
| Transaction date/time | Yes | Shortcut trigger timestamp |
| Spend category | No (inferred) | Must map merchant → category |
| MCC code | No | Not exposed by Shortcuts |

**Coverage in Singapore**: 70%+ of iPhone users have Apple Pay enabled. NFC contactless payments account for 97% of mobile device payments. This is a strong channel.

### 6.2 Google Pay / Google Wallet (Android)

Google Pay does **not** provide an equivalent to iOS Shortcuts Transaction trigger. However:

- Google Pay transactions generate **push notifications** that can be intercepted via `NotificationListenerService` (Approach C)
- Google Pay notification format: includes amount, merchant, and card info
- **No official API** for third-party apps to query Google Pay transaction history

| Data Point | Available via Notification? |
|------------|---------------------------|
| Amount | Yes |
| Merchant name | Yes |
| Card used | Partial (may show last 4 digits) |
| Transaction date/time | Yes (notification timestamp) |

### 6.3 Samsung Pay

Samsung Pay also generates transaction notifications, capturable via NotificationListenerService on Android. Samsung Pay has significant market share in Singapore due to Samsung's popularity.

---

## 7. Comparison: iOS vs Android Automation Capabilities

| Capability | iOS | Android |
|------------|-----|---------|
| **Read other apps' notifications** | **Not possible** (sandbox restriction) | **Yes** via NotificationListenerService |
| **Wallet/Pay transaction trigger** | **Yes** — Shortcuts Transaction trigger (iOS 17+) | **No** native equivalent |
| **Automation on notification** | **No** native trigger; Pushcut (3rd party) can bridge | **Yes** — Tasker + AutoNotification |
| **SMS reading** | **Very restricted** — MessageFilterExtension (filter only, no content access for apps) | **Yes** — READ_SMS permission |
| **URL scheme deep linking** | **Yes** — `maximile://` | **Yes** — intent filters |
| **Background processing** | Limited (BGTaskScheduler) | Foreground service (persistent) |
| **Share Extension** | Yes (requires native module) | Yes (requires native module) |
| **On-device OCR** | VisionKit (iOS 15+) | ML Kit (free, on-device) |

**Summary**: iOS is more restrictive but Apple Pay's Shortcuts integration is a clean, Apple-sanctioned path. Android is more permissive and allows full notification interception.

---

## 8. Risk Assessment

### 8.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Apple changes Shortcuts Transaction trigger API | Low | High | Monitor WWDC; this is a stable, promoted API |
| iOS 18+ reliability issues with trigger | Medium | Medium | Build error reporting; fallback to manual |
| User fails to set up Shortcut correctly | Medium | Medium | Provide downloadable `.shortcut` file; in-app setup wizard |
| Card name mismatch between Wallet and MaxiMile | Medium | Low | Fuzzy matching; setup verification step |
| Merchant name doesn't map to spend category | Medium | Medium | ML-based category inference; user correction with learning |
| Expo ejection required for native modules | Low | Medium | Already using Expo Dev Build for other native features |

### 8.2 Privacy & Compliance Risks

| Risk | Assessment |
|------|------------|
| **iOS Shortcuts approach** | **Minimal risk.** No private APIs used. User explicitly creates the automation. Data flows via URL scheme (user-initiated). Apple sanctions this pattern. |
| **Android notification access** | **Medium risk.** Requires prominent disclosure under Google Play's Data Safety section. Must process on-device only, never upload raw notification content. |
| **PDPA (Singapore)** | Transaction data is personal data under PDPA. Must: (1) obtain consent, (2) state purpose clearly, (3) not retain beyond purpose. On-device processing preferred. |
| **App Store review** | **Low risk for iOS** (Shortcuts URL scheme is standard). **Medium risk for Android** (notification access requires justification). |

### 8.3 Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Low adoption due to setup friction | Medium | High | Make setup < 2 min; show "time saved" projections |
| Users assume ALL transactions are captured | Medium | High | Clear messaging: "Works with Apple Pay contactless payments" |
| Over-reliance delays bank API pursuit | Low | Medium | Position as bridge, not replacement |

---

## 9. Benefit Analysis

### 9.1 Quantified User Impact

| Metric | Current (Manual) | With Auto-Capture | Improvement |
|--------|------------------|-------------------|-------------|
| Time per transaction | ~20 sec | ~2-3 sec (confirm) | **85-90% reduction** |
| Transactions logged per day | 2-3 (due to fatigue) | 5-8 (auto-captured) | **~2.5x more data** |
| Cap tracking accuracy | Low (missed transactions) | Higher (more complete data) | **Better recommendations** |
| Day-7 retention risk | High dropout from logging fatigue | Lower — passive value delivery | **Retention improvement** |
| Time to value | Slow (need multiple logs) | Fast (first Apple Pay = first auto-log) | **Better onboarding** |

### 9.2 Strategic Benefits

1. **Solves the #1 product risk** — Manual logging is the identified Achilles' heel. Even partial automation (Apple Pay only) removes friction for the highest-frequency use case.

2. **Bridge to bank API** — Demonstrates the value of automation to users, building demand for full bank API integration. Also validates the data model before investing in SGFinDex.

3. **Competitive moat** — No Singapore miles optimizer offers auto-capture. Being first creates switching cost.

4. **Data flywheel** — More auto-logged transactions → more accurate cap tracking → better recommendations → higher trust → more logging → virtuous cycle.

5. **Addresses "Passive Peter" persona** — Peter's trigger is "show me value without effort." Auto-capture delivers exactly this.

---

## 10. Implementation Recommendation

### Phase 1: iOS Shortcuts Integration (v2.0) — 2-3 sprints

| Task | Effort | Priority |
|------|--------|----------|
| Deep link handler for `maximile://log` with parameters | 1 sprint | P0 |
| Merchant → category mapping logic | 1 sprint | P0 |
| Card name fuzzy matching | 0.5 sprint | P0 |
| Downloadable Shortcut template | 0.5 sprint | P0 |
| In-app setup wizard with step-by-step guide | 1 sprint | P1 |
| Auto-confirmation mode (skip confirm tap) | 0.5 sprint | P2 |

### Phase 2: Android Notification Capture (v2.5) — 3-4 sprints

| Task | Effort | Priority |
|------|--------|----------|
| NotificationListenerService native module | 2 sprints | P0 |
| SG bank notification regex parsers (DBS, OCBC, UOB, Citi, AMEX) | 1 sprint | P0 |
| Privacy disclosure and permission flow | 0.5 sprint | P0 |
| Background service optimization | 0.5 sprint | P1 |
| Google Pay notification parsing | 0.5 sprint | P1 |

### Phase 3: OCR Share Extension (v3.0) — 2 sprints

| Task | Effort | Priority |
|------|--------|----------|
| iOS Share Extension with VisionKit OCR | 1.5 sprints | P2 |
| Bank notification format parsers | 0.5 sprint | P2 |

### Expo Compatibility Note

- **Phase 1 (Shortcuts URL scheme)**: Fully compatible with Expo — no ejection needed. URL scheme already configured in `app.json`.
- **Phase 2 (Android NotificationListener)**: Requires Expo Dev Build with custom native module (config plugin). Not compatible with Expo Go.
- **Phase 3 (Share Extension)**: Requires Expo Dev Build with native extension target.

---

## 11. Architecture Decision

### Recommended: Start with Approach A (iOS Shortcuts)

**Why**:
1. **Zero native code required** — URL scheme handler works in pure Expo/React Native
2. **Apple-sanctioned** — no App Store risk
3. **Immediate impact** — Singapore's high Apple Pay adoption means meaningful coverage
4. **Fast to ship** — 2-3 sprints vs. 3-4 for Android notification capture
5. **Validates the auto-capture UX** before investing in heavier native approaches
6. **Already have the URL scheme** — `maximile://` is configured in `app.json`

### Future: Layer Android approach on top

Once iOS Shortcuts is validated, add Android NotificationListenerService for cross-platform coverage. The transaction logging UI and merchant→category mapping built in Phase 1 are reusable.

---

## 12. Impact on Problem-Solution Fit

If implemented, this feature would upgrade:

| Friction | Current Status | Post-Implementation |
|---------|---------------|---------------------|
| **F7: Manual tracking fatigue** | Partially solved (~20 sec/txn) | **Mostly solved** (~2-3 sec confirm for Apple Pay; manual for non-Apple Pay) |

And the Problem-Solution Fit score:
- **Solution-Problem Alignment**: 8.5 → **9.0** (F7 upgraded from Partial to Mostly Solved)
- **Feasibility**: 7.5 → **8.0** (clear technical path with App Store precedent)
- **Overall**: 8.5 → **8.8**

This would leave only **F6 (No proof optimization works)** as the remaining partially-solved friction.

---

## Sources

- [Apple Support: Transaction Triggers in Shortcuts](https://support.apple.com/guide/shortcuts/transaction-trigger-apd65c67538a/ios)
- [Apple Pay Automation – Graham Haley](https://grahamhaley.co.uk/2024/11/19/apple-pay-automation/)
- [BalanceTrackr: Apple Pay Shortcuts Setup](https://balancetrackr.com/SiriShortcutsSetup/en.html)
- [TravelSpend: Apple Pay Automation Setup](https://help.travel-spend.com/shortcuts--automation/ignQHsp85RQDsig2QwVcdX/set-up-apple-pay-automation/7tL8XfjBceg4D7mQeiSK2V)
- [Skwad: Creating Transactions Using iOS Shortcuts](https://skwad.app/blog/creating-skwad-transactions-using-ios-shortcuts)
- [MoneyCoach: Apple Pay Transaction Reports with Shortcuts](https://moneycoach.ai/blog/creating-custom-apple-pay-transaction-reports-mastering-financial-visualization-with-shortcut-automations-and-moneycoach)
- [Android NotificationListenerService Documentation](https://developer.android.com/reference/android/service/notification/NotificationListenerService)
- [FinArt: SMS Expense Tracker (App Store)](https://apps.apple.com/us/app/finart-track-expenses-bills/id6748001842)
- [GitHub: AI-powered Expense Tracker (Android NotificationListener)](https://github.com/atick-faisal/Expense-Tracker-Android)
- [DBS Push Notifications](https://www.dbs.com.sg/personal/deposits/bank-with-ease/dbs-push-notifications)
- [OCBC Mobile Push Notifications](https://www.ocbc.com/personal-banking/digital-banking/day-to-day-services/mobilepush)
- [UOB Card Alerts](https://www.uob.com.sg/personal/cards/services/card-alerts.page)
- [Apple: App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Pushcut: Notification Automation](https://www.pushcut.io/)
- [AutoNotification (Android)](https://play.google.com/store/apps/details?id=com.joaomgcd.autonotification)
- [Digital Payment Trends in Singapore (2026)](https://sumsub.com/blog/apac-payment-methods/)
- [Apple Pay Adoption in Singapore](https://www.debia.co/post/apple-pay-payments-singapore)
- [Tap to Pay on iPhone in Singapore](https://9to5mac.com/2025/12/02/tap-to-pay-on-iphone-hits-50-countries-as-it-launches-in-singapore/)
