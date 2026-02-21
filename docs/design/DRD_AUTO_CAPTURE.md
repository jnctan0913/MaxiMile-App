# Design Requirements Document: Transaction Auto-Capture (F26-F27)

**Version**: 1.2
**Last Updated**: 2026-02-21
**Author**: UI/UX Designer Agent
**Status**: Active
**PRD Reference**: PRD v1.7, Features F26-F27
**Feasibility Reference**: `docs/technical/NOTIFICATION_CAPTURE_FEASIBILITY.md`
**Parent DRD**: `docs/design/DRD_MASTER.md` — Refer to master DRD for global design system, principles, and components

**Changelog v1.2**: Consolidated duplicate design system content into DRD_MASTER.md. Removed duplicate Design Principles, Design Tokens, and Accessibility sections. Now references master DRD for global standards. Added auto-capture-specific tokens and accessibility requirements that extend the global system.

---

## Important: Design System Reference

This document covers **feature-specific** design requirements for Transaction Auto-Capture (F26-F27). For **global design system** specifications, refer to:

📘 **[DRD_MASTER.md](./DRD_MASTER.md)**

Global topics covered in master DRD:
- Design principles (Section 2)
- Design tokens (colors, typography, spacing) (Section 4)
- Component library (GlassCard, BottomSheet, Button, etc.) (Section 5)
- Interaction patterns (Section 6)
- Accessibility requirements (Section 7)
- Platform differences (iOS/Android) (Section 8)

---

## 1. Overview

### 1.1 Purpose

This document specifies the design requirements for the Transaction Auto-Capture feature set (F26-F27) in MaxiMile. These features transform the transaction logging experience from a fully manual ~20-second input process to a ~2-3 second one-tap confirmation, by automatically capturing transaction data from:
- **iOS**: Apple Pay NFC payments via iOS Shortcuts Transaction trigger (F26)
- **Android**: Banking app push notifications via NotificationListenerService (F27)

### 1.2 Scope

| Feature | Name | Platform | Description | Sprint |
|---------|------|----------|-------------|--------|
| F26 | Apple Pay Shortcuts Auto-Capture | iOS | iOS Shortcuts Transaction trigger sends amount, merchant, card to MaxiMile via `maximile://log` URL scheme | Sprint 16 |
| F27 | Android Notification Auto-Capture | Android | NotificationListenerService reads banking app notifications and extracts transaction data | Sprint 17 |

### 1.3 Design Principles

**See [DRD_MASTER.md Section 2](./DRD_MASTER.md#2-global-design-principles) for global design principles.**

Auto-capture-specific principles (extend global principles):

1. **Transparent automation** -- Always show the user what was captured and where it came from. No black boxes.
2. **Graceful degradation** -- If auto-capture fails or captures partially, fall back to an editable manual form seamlessly.
3. **Honest coverage** -- Never imply all transactions are captured. Clearly communicate what works and what doesn't (e.g., "Apple Pay only" for iOS).
4. **Platform-native setup** -- iOS setup uses Shortcuts (feels Apple-native). Android setup uses system permission flows (feels Android-native).

### 1.4 iOS Shortcut Setup: Platform Constraint

**Can the iOS Shortcut be installed automatically without user action?**

**No.** Apple does not allow apps to programmatically create or install Personal Automations. This is a hard iOS platform constraint — no app can bypass it. The user must:
1. Download the pre-built `.shortcut` file (we provide this)
2. Tap "Add Automation" in the iOS Shortcuts app (Apple requires this manual step)

**What we CAN do to minimize friction:**
- Provide a fully pre-configured `.shortcut` file — user doesn't need to build anything
- The Shortcut auto-detects the Transaction trigger, URL construction, and all parameters
- User taps one button to download, one button to add — total ~30 seconds of active setup
- Card name verification is the only step requiring thought

**What we CANNOT do:**
- Silently install the Shortcut in the background
- Skip the Shortcuts app entirely
- Auto-create Personal Automations via API

This is why the setup wizard exists: to make the unavoidable manual step as frictionless as possible.

---

## 2. User Journey Maps

### 2.1 iOS User Journey (F26 — Apple Pay Shortcuts Auto-Capture)

#### Phase A: Discovery & Setup — Onboarding Path (One-Time, ~2 minutes)

The auto-capture setup is offered during onboarding (after adding cards) AND remains accessible later via Settings. This ensures maximum adoption while keeping it skippable.

**Current onboarding flow:**
Step 1: Add Your Cards → Step 2: Set Miles Balances → Main App

**Updated onboarding flow:**
Step 1: Add Your Cards → **Step 1.5: Enable Auto-Capture (NEW)** → Step 2: Set Miles Balances → Main App

```
STEP    USER ACTION                    SYSTEM RESPONSE                         EMOTION         SCREEN
─────────────────────────────────────────────────────────────────────────────────────────────────────────
A0      Completes Step 1               Onboarding navigates to NEW             Momentum        Onboarding
        (Add Your Cards) in            Step 1.5: "Log Without Typing"          (still in       Step 1.5
        onboarding                                                             setup mode)
                                       ┌──────────────────────────────┐
                                       │  ⚡ Log Without Typing        │
                                       │                              │
                                       │  Pay with Apple Pay, and     │
                                       │  MaxiMile logs it for you.   │
                                       │                              │
                                       │  [visual: phone tap → auto   │
                                       │   transaction appears]       │
                                       │                              │
                                       │  Works with Apple Pay        │
                                       │  contactless payments at     │
                                       │  stores.                     │
                                       │                              │
                                       │  ┌────────────────────────┐  │
                                       │  │ Set Up Auto-Capture    │  │  ← Primary CTA
                                       │  └────────────────────────┘  │
                                       │  ┌────────────────────────┐  │
                                       │  │ I'll do this later     │  │  ← Ghost, skippable
                                       │  └────────────────────────┘  │
                                       └──────────────────────────────┘

                                       Android variant: same screen but
                                       text reads "MaxiMile reads your
                                       banking notifications to log
                                       transactions automatically."
                                       CTA: "Enable Auto-Capture"

A1      Taps "Set Up Auto-Capture"     Setup Wizard opens (inline within       Interested      Setup Wizard
        (or user later taps            onboarding, or as modal flow)                           Step 1
        Settings → Auto-Capture)       Step 1/4: "How It Works"                                (within
                                                                                               onboarding)

A2      Views Step 1                   Setup Wizard opens                      Interested      Setup Wizard
                                       Step 1/4: "How It Works"                                Step 1
                                       Visual diagram:
                                       📱 Apple Pay tap
                                           ↓
                                       ⚡ iOS Shortcut (runs automatically)
                                           ↓
                                       📊 MaxiMile (pre-filled, one tap)

                                       "When you pay with Apple Pay,
                                       your transaction details flow
                                       directly into MaxiMile."

                                       [Next →]

A3      Taps "Next"                    Step 2/4: "Download Shortcut"           Slightly        Setup Wizard
                                       Instruction text + visual:              anxious         Step 2
                                       "Tap the button below to download       (new process)
                                       a pre-built iOS Shortcut."

                                       [Download MaxiMile Shortcut]

                                       "After downloading, the Shortcuts
                                       app will open. Tap 'Add Automation'
                                       to install it."

                                       Small note: "Requires iOS 17+"
                                       [I need help →]

A4      Taps "Download"                .shortcut file downloads;               Focused         iOS Shortcuts
                                       iOS Shortcuts app opens with                            App
                                       import prompt showing the
                                       pre-built automation:
                                       Trigger: "When I tap [Any Card]"
                                       Actions: Open maximile://log URL
                                       with amount, merchant, card

A5      Taps "Add Automation"          Returns to MaxiMile                     Satisfied       Setup Wizard
        in Shortcuts app               Step 3/4: "Verify Your Cards"           (that was easy) Step 3

                                       Shows card mapping table:
                                       ┌─────────────────────────────────┐
                                       │ APPLE WALLET       MAXIMILE     │
                                       │ ─────────────      ─────────    │
                                       │ DBS Altitude Visa → DBS Altitude │ ✅
                                       │ OCBC 90°N Visa   → OCBC 90N     │ ✅
                                       │ Amex KF Ascend   → KF Ascend    │ ✅
                                       │ Citi PM Visa Sig → [Select ▼]   │ ⚠️
                                       └─────────────────────────────────┘

                                       Cards with <50% fuzzy match
                                       confidence show a dropdown for
                                       manual selection.

A6      Selects "Citi PremierMiles"    Mapping saved. All cards show ✅        Confident       Setup Wizard
        from dropdown for the          [Next →]                                                Step 3
        unmatched card

A7      Taps "Next"                    Step 4/4: "Test It Out"                 Eager           Setup Wizard
                                       "Make a small Apple Pay purchase                        Step 4
                                       (or tap your phone on any NFC
                                       reader) to test the flow."

                                       Animated waiting state:
                                       "Listening for your first
                                       auto-captured transaction..."

                                       [Skip Test — I'll try it later]

A8a     Makes an Apple Pay             MaxiMile opens with pre-filled          Delighted!      Confirmation
        payment at a store             confirmation screen (see Phase B)       "It works!"     Screen
                                       Setup wizard shows: ✅ "Success!
                                       Auto-capture is working."

                                       [Done — Start Using Auto-Capture]

A8b     Taps "Skip Test"              Setup complete message:                  Okay,           Setup Wizard
        (alternative)                  "You're all set! Your next Apple        I'll see        Complete
                                       Pay purchase will be auto-captured."

                                       Settings now shows:
                                       "Auto-Capture: Active (iOS)"
```

#### Phase B: Recurring Transaction Flow (~2-3 seconds per transaction)

```
STEP    USER ACTION                    SYSTEM RESPONSE                         EMOTION         SCREEN
─────────────────────────────────────────────────────────────────────────────────────────────────────────
B1      Taps phone to pay with         Payment completes normally              Normal          Store / POS
        Apple Pay at store             (Apple Pay confirmation ✓)              (no change)     Terminal
        (e.g., Cold Storage)

B2      (Automatic — no user           iOS Shortcuts automation fires:         —               Background
        action required)               Extracts amount ($42.50),                               (iOS
                                       merchant (COLD STORAGE),                                Shortcuts)
                                       card (DBS Altitude Visa)
                                       Constructs URL:
                                       maximile://log?amount=42.50
                                       &merchant=COLD+STORAGE
                                       &card=DBS+Altitude+Visa
                                       &source=shortcut

B3      MaxiMile opens                 Auto-Capture Confirmation Screen:       Pleased         Confirmation
        automatically                                                          ("this is       Screen
        (or user taps the              ┌──────────────────────────────┐        so easy")
        Shortcuts notification)        │    ⚡ Via Apple Pay           │
                                       │                              │
                                       │  💰 Amount     $42.50        │
                                       │  🏪 Merchant   Cold Storage   │
                                       │  🏷️ Category   Groceries  ✏️  │
                                       │  💳 Card       DBS Altitude ✏️│
                                       │                              │
                                       │  ┌──────────┐ ┌──────────┐  │
                                       │  │ Dismiss  │ │ Confirm ✓│  │
                                       │  └──────────┘ └──────────┘  │
                                       └──────────────────────────────┘

                                       Category auto-inferred from
                                       merchant name (fuzzy match).
                                       Card matched via verified mapping
                                       from setup wizard.

B4a     Taps "Confirm"                 Transaction logged instantly.           Satisfied       Log Tab
        (happy path —                  Success feedback:                       ("3 seconds,    (brief
        everything correct)            "Logged! Cap: $458/$500 remaining"      done")          overlay)
                                       Cap progress updates immediately.
                                       Spending state recalculated.

B4b     Taps category to edit          Category picker opens (same as          Neutral         Confirmation
        (category wrong)               manual logging flow).                   ("easy fix")    Screen
                                       User selects correct category.                          (edited)
                                       Note: "We'll remember this for
                                       future Cold Storage transactions."
                                       User override saved for this
                                       merchant → future auto-captures
                                       use corrected category.

B4c     Taps "Dismiss"                 Transaction discarded. No data          Neutral         Returns to
        (don't want to log)            saved. Brief toast:                                     previous
                                       "Transaction not logged."                               screen

B5      Continues shopping /           App returns to background.              Content         —
        puts phone away                No further action needed until          ("I don't even
                                       next Apple Pay payment.                 think about
                                                                               logging anymore")
```

#### Phase C: Edge Cases & Error Paths

```
STEP    SCENARIO                       SYSTEM RESPONSE                         EMOTION         SCREEN
─────────────────────────────────────────────────────────────────────────────────────────────────────────
C1      Card name from Apple           Confirmation screen shows:              Minor           Confirmation
        Wallet doesn't match           Card field as dropdown with             friction        Screen
        any portfolio card             user's cards listed.
        (new card, not in              "Which card did you use?"
        MaxiMile yet)                  + link: "Add new card →"

C2      Merchant name not              Category shows "General/Others"         Neutral         Confirmation
        recognized (can't              with edit pencil icon.                                  Screen
        infer category)                "We couldn't identify this
                                       category. Please select one."
                                       User correction saved for future.

C3      Shortcut didn't fire           Nothing happens (user paid with         Confused        —
        (physical card swipe,          physical card, not Apple Pay).          (first time)
        not Apple Pay)                 No error — the Shortcut only
                                       triggers on Apple Pay NFC.

                                       Mitigation: Log tab shows subtle
                                       reminder: "Paid with a physical
                                       card? Log it manually →"

C4      Shortcut fired but             MaxiMile opens with partial data.       Slight          Confirmation
        data is incomplete             Missing fields are editable.            annoyance       Screen
        (iOS bug / timeout)            Banner: "Some data couldn't be
                                       captured. Please fill in the rest."

C5      User hasn't set up             Feature discovery prompt appears         Curious         Log Tab
        auto-capture yet               periodically (max once per week):
        (ongoing nudge)                "Log faster with Apple Pay
                                       auto-capture → Set up in 3 min"

C6      iOS version < 17               Setup wizard Step 2 shows:             Disappointed    Setup Wizard
        (not supported)                "Auto-capture requires iOS 17           (but            Step 2
                                       or later. You're on iOS 16.x."         informed)
                                       [Check for iOS Updates]
                                       [Continue Manual Logging]

C7      User wants to disable          Settings → Auto-Capture →              In control      Settings
        auto-capture                   Toggle OFF.
                                       "Auto-capture disabled. Delete
                                       the Shortcut in the Shortcuts
                                       app to fully remove it."
                                       Link: [Open Shortcuts App]
```

---

### 2.2 Android User Journey (F27 — Notification Auto-Capture)

#### Phase A: Discovery & Setup — Onboarding Path (One-Time, ~1 minute)

Same as iOS, the auto-capture setup is offered during onboarding Step 1.5 ("Log Without Typing"). The Android variant shows notification-based messaging instead of Apple Pay.

```
STEP    USER ACTION                    SYSTEM RESPONSE                         EMOTION         SCREEN
─────────────────────────────────────────────────────────────────────────────────────────────────────────
A0      Completes Step 1               Onboarding Step 1.5 appears:           Momentum        Onboarding
        (Add Your Cards) in            "Log Without Typing"                    (still in       Step 1.5
        onboarding                     Text: "MaxiMile reads your bank        setup mode)
                                       notifications to log transactions
                                       automatically. Works with DBS,
                                       OCBC, UOB, Citi, AMEX."
                                       [Enable Auto-Capture]
                                       [I'll do this later]

A1      Taps "Enable Auto-Capture"     Privacy Disclosure Screen:
        (onboarding or later
        via Settings → Auto-Capture)

A2      Views disclosure               Privacy Disclosure Screen:              Cautious        Privacy
                                                                               (sensitive      Disclosure
                                       ┌──────────────────────────────┐        permission)     Screen
                                       │  🔒 How Auto-Capture Works   │
                                       │                              │
                                       │  MaxiMile will read your     │
                                       │  banking app notifications   │
                                       │  to detect transactions.     │
                                       │                              │
                                       │  ✅ What we access:          │
                                       │  • Notification text from    │
                                       │    DBS, OCBC, UOB, Citi,     │
                                       │    AMEX, Google Pay only      │
                                       │                              │
                                       │  ✅ What we extract:         │
                                       │  • Amount, merchant, card    │
                                       │    (last 4 digits)           │
                                       │                              │
                                       │  🔐 Privacy guarantees:      │
                                       │  • All processing on-device  │
                                       │  • No notification content   │
                                       │    uploaded to any server     │
                                       │  • No non-banking notifs     │
                                       │    are ever read             │
                                       │  • You can revoke anytime    │
                                       │                              │
                                       │  [Grant Notification Access] │
                                       │  [No Thanks]                 │
                                       └──────────────────────────────┘

A3      Taps "Grant Notification       Android System Settings opens to        Focused         Android
        Access"                        the Notification Access screen.                         Settings
                                       MaxiMile is listed.                                     Screen
                                       System warning dialog:
                                       "Allow MaxiMile to read
                                       notifications?"
                                       [Allow]  [Deny]

A4a     Taps "Allow"                   Returns to MaxiMile.                    Relieved        Setup
                                       Confirmation screen:                    ("that was      Complete
                                                                               quick")         Screen
                                       ┌──────────────────────────────┐
                                       │  ✅ Auto-Capture Active      │
                                       │                              │
                                       │  Your banking notifications  │
                                       │  will now auto-log           │
                                       │  transactions.               │
                                       │                              │
                                       │  Supported banks:            │
                                       │  DBS ✓  OCBC ✓  UOB ✓       │
                                       │  Citi ✓  AMEX ✓             │
                                       │  Google Pay ✓               │
                                       │                              │
                                       │  Your cards:                 │
                                       │  •1234 → DBS Altitude    ✓  │
                                       │  •5678 → OCBC 90N        ✓  │
                                       │  •9012 → Citi PM         ✓  │
                                       │                              │
                                       │  [Done]                      │
                                       └──────────────────────────────┘

                                       Card matching uses last-4-digits
                                       + bank name to map to portfolio.

A4b     Taps "Deny"                    Returns to MaxiMile.                    Neutral         Log Tab
        (alternative)                  Graceful message:
                                       "No problem! You can log
                                       transactions manually. Enable
                                       auto-capture anytime in Settings."
                                       Manual logging continues normally.
```

#### Phase B: Recurring Transaction Flow (~2-3 seconds per transaction)

```
STEP    USER ACTION                    SYSTEM RESPONSE                         EMOTION         SCREEN
─────────────────────────────────────────────────────────────────────────────────────────────────────────
B1      Uses credit card at            Payment completes normally.             Normal          Store / POS
        store (any method:             Banking app sends push                  (no change)     Terminal
        tap, swipe, insert,            notification:
        online, Apple/Google           "Your DBS Card ending 1234
        Pay)                           was used for SGD 42.50 at
                                       COLD STORAGE on 21 Feb"

B2      (Automatic — no user           MaxiMile's NotificationListener         —               Background
        action required)               Service intercepts the notification.                    Service
                                       Checks package name against
                                       whitelist (DBS digibank ✓).
                                       Extracts via regex:
                                       • amount = 42.50
                                       • merchant = "COLD STORAGE"
                                       • card_last4 = "1234"
                                       • bank = "DBS"
                                       Matches card_last4 + bank to
                                       portfolio → DBS Altitude.
                                       Maps merchant → category:
                                       "COLD STORAGE" → Groceries.

B3      Sees MaxiMile                  MaxiMile notification:                  Pleased         Notification
        notification appear            "Transaction detected: $42.50           ("it just       Shade
        (alongside the                 at Cold Storage (DBS Altitude).         works!")
        banking notification)          Tap to confirm."

                                       ┌─────────────────────────────────┐
                                       │ MaxiMile                    now │
                                       │ 💳 $42.50 at Cold Storage       │
                                       │ DBS Altitude · Groceries        │
                                       │ Tap to confirm or edit          │
                                       └─────────────────────────────────┘

B4      Taps the MaxiMile              App opens to Confirmation Screen:       Pleased         Confirmation
        notification                                                                           Screen
                                       ┌──────────────────────────────┐
                                       │    📱 Via Bank Notification   │
                                       │                              │
                                       │  💰 Amount     $42.50        │
                                       │  🏪 Merchant   Cold Storage   │
                                       │  🏷️ Category   Groceries  ✏️  │
                                       │  💳 Card       DBS Altitude ✏️│
                                       │                              │
                                       │  ┌──────────┐ ┌──────────┐  │
                                       │  │ Dismiss  │ │ Confirm ✓│  │
                                       │  └──────────┘ └──────────┘  │
                                       └──────────────────────────────┘

                                       Same confirmation screen as iOS
                                       (shared component), but source
                                       badge reads "Via Bank Notification"
                                       instead of "Via Apple Pay."

B5a     Taps "Confirm"                 Transaction logged instantly.           Satisfied       Log Tab
        (happy path)                   "Logged! Cap: $458/$500 remaining"      ("3 seconds,    (brief
                                       MaxiMile notification dismissed.        done")          overlay)
                                       Cap and spending state updated.

B5b     Edits category/card            Same correction flow as iOS.            Neutral         Confirmation
        before confirming              Corrections persisted for future.       ("easy fix")    Screen

B5c     Taps "Dismiss"                 Transaction discarded.                  Neutral         Returns to
                                       MaxiMile notification dismissed.                        previous
                                       "Transaction not logged."                               screen

B6      Does nothing                   Notification persists in shade          —               Notification
        (ignores notification)         for standard Android duration.                          Shade
                                       Transaction NOT auto-saved.
                                       (Never auto-save without user
                                       confirmation.)
```

#### Phase C: Edge Cases & Error Paths

```
STEP    SCENARIO                       SYSTEM RESPONSE                         EMOTION         SCREEN
─────────────────────────────────────────────────────────────────────────────────────────────────────────
C1      Google Pay AND banking         Both notifications received.            Normal          Notification
        app both send                  MaxiMile deduplicates:                  (user sees      Shade
        notifications for the         • Compares amount + timestamp            only one
        same transaction               within 60-second window                MaxiMile
                                      • Shows only ONE MaxiMile               notification)
                                       notification (prefers the one
                                       with more complete data — usually
                                       banking app has merchant name)

C2      Notification from an           NotificationListener silently           —               —
        unrecognized bank              ignores. No action taken.
        (e.g., HSBC, Maybank)          User logs manually as before.

                                       Backend logs the unrecognized
                                       package for future parser
                                       development.

C3      Notification format            Regex parser fails to extract.          —               —
        changed by bank               Notification silently ignored.
        (parser can't extract)         Logged for format analysis.
                                       User receives no broken/partial
                                       notification from MaxiMile.

C4      Card last-4-digits             MaxiMile notification still shows       Minor           Confirmation
        don't match any                but card field is a dropdown:           friction        Screen
        portfolio card                 "Which card ending in 1234?"
        (new/unregistered card)        Portfolio cards listed + "Add
                                       new card →" link.

C5      User revokes notification      MaxiMile detects permission lost.       In control      Settings
        access via Android             Settings updated:
        Settings                       "Auto-Capture: Inactive"
                                       Prompt to re-enable available.
                                       Manual logging continues normally.

C6      Battery optimization           Setup guidance includes:                Informed        Setup
        kills background               "For reliable auto-capture,                             Screen
        service                        disable battery optimization for
                                       MaxiMile."
                                       Link: [Open Battery Settings]
                                       Specific instructions per
                                       manufacturer (Samsung, Xiaomi,
                                       Pixel — known aggressive killers).

C7      Multiple transactions          Each generates a separate               Normal          Notification
        in rapid succession            MaxiMile notification.                  (may batch      Shade
        (e.g., shopping spree)         Notifications stack in shade.           confirm later)
                                       User can confirm each individually.
                                       Order: newest first.

C8      Foreign currency               Parser extracts currency code           Minor           Confirmation
        transaction                    (e.g., "USD 25.00").                    surprise        Screen
        (overseas / online)            Confirmation shows original
                                       currency. Amount field editable
                                       if user wants to log SGD
                                       equivalent instead.
```

---

## 3. Information Architecture

### 3.1 New Screens & Entry Points

```
Onboarding (UPDATED)
├── Step 1: Add Your Cards (existing)
├── Step 1.5: Log Without Typing (NEW — F26/F27)
│     ├── Platform-adaptive pitch (Apple Pay for iOS, Notifications for Android)
│     ├── [Set Up Auto-Capture] → Setup Wizard inline
│     └── [I'll do this later] → Skip to Step 2
├── Step 2: Set Miles Balances (existing)
└── → Main App

Existing App
├── Tab: Recommend
│     ├── Category Grid → Recommendation → "Log Transaction" (existing)
│     ├── Smart Pay FAB → Location detect → Merchant → Recommendation (existing)
│     │     └── After wallet step → Auto-capture confirmation (NEW integration)
│     └── Recommendation-aware confirmation (NEW — see Section 3.3)
├── Tab: My Cards
├── Tab: Cap Status
├── Tab: Log
│     ├── Manual Transaction Form (existing)
│     ├── Auto-Capture Confirmation Screen (NEW — F26/F27)
│     │     ├── Source badge: "Via Apple Pay" / "Via Bank Notification"
│     │     ├── Pre-filled fields: amount, merchant, category, card
│     │     ├── Recommendation match indicator (NEW — see Section 3.3)
│     │     ├── Edit capability for each field
│     │     └── Confirm / Dismiss actions
│     └── Auto-Capture Discovery Prompt (NEW — fallback if skipped onboarding)
│           └── "Set up auto-capture →" periodic nudge
├── Tab: Miles
├── Settings (header icon)
│     └── Auto-Capture Settings (NEW)
│           ├── Status: Active / Inactive
│           ├── Platform info: "iOS Shortcuts" or "Android Notifications"
│           ├── Supported banks list (Android only)
│           ├── Card mappings (view/edit verified mappings)
│           ├── Auto-confirm toggle (P2 — future)
│           ├── Setup Wizard (re-run)
│           └── Disable / Remove auto-capture
└── Setup Wizard (NEW — F26/F27)
      ├── Step 1: How It Works (visual diagram)
      ├── Step 2: Download Shortcut (iOS) / Grant Permission (Android)
      ├── Step 3: Verify Card Mappings (iOS) / Auto-matched (Android)
      └── Step 4: Test Transaction
```

### 3.2 Integration with Recommend & Smart Pay Flow

Auto-capture does NOT exist in isolation. It connects to the existing recommendation and Smart Pay flows to close the loop: **recommend → pay → auto-log → update cap → better next recommendation.**

#### 3.2.1 Current Flow (Without Auto-Capture)

```
RECOMMEND TAB                          LOG TAB                     CAP TRACKING
─────────────                          ───────                     ────────────
Category Grid                          Manual keypad               Recalculated
    │                                      ↑                       after manual
    ▼                                      │                       save
Recommendation                    User manually enters
(best card shown)                 amount, selects category,
    │                             selects card
    ├─→ "Log Transaction" ────────────→ Pre-filled (category + card)
    │                                  but amount still manual
    └─→ Smart Pay ──→ Detect merchant ──→ Recommend card
                      ──→ Open Wallet ──→ User pays
                      ──→ Log step ────→ Manual amount entry ──→ Save
                                         (category + card pre-filled)

PROBLEM: After Smart Pay guides user to the right card and opens Wallet,
         the user pays... then must COME BACK and manually enter the amount.
         Many users don't return. The loop breaks.
```

#### 3.2.2 Updated Flow (With Auto-Capture)

```
RECOMMEND TAB                          AUTO-CAPTURE                CAP TRACKING
─────────────                          ────────────                ────────────
Category Grid                          Automatic!                  Recalculated
    │                                      ↑                       instantly on
    ▼                                      │                       confirm
Recommendation                    iOS: Shortcut fires with
(best card shown)                 amount + merchant + card
    │                             Android: Bank notification
    ├─→ "Log Transaction" ──→ Pre-filled confirmation ──→ One tap ──→ Done
    │                         (amount auto-captured!)
    └─→ Smart Pay ──→ Detect merchant ──→ Recommend card
                      ──→ Open Wallet ──→ User pays with recommended card
                      ──→ AUTO-CAPTURE FIRES ──→ Confirmation screen
                         (amount, merchant, card all pre-filled)
                         ──→ One tap confirm ──→ Done

THE LOOP NOW CLOSES: Recommend → Pay → Auto-log → Cap updates → Better next recommendation
```

#### 3.2.3 Recommendation Match Indicator

When an auto-captured transaction uses the **same card that MaxiMile recommended** for that category, the confirmation screen shows a positive reinforcement:

```
┌──────────────────────────────────────┐
│         ⚡ Via Apple Pay              │
│                                      │
│  💰 Amount     $42.50                │
│  🏪 Merchant   Cold Storage          │
│  🏷️ Category   Groceries          ✏️  │
│  💳 Card       DBS Altitude       ✏️  │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ ✅ You used the best card!   │    │  ← Recommendation match banner
│  │ DBS Altitude earns 2.5 mpd  │    │     Only shows when card matches
│  │ for Groceries (vs 1.4 avg)  │    │     the current top recommendation
│  └──────────────────────────────┘    │     for the inferred category.
│                                      │
│  ┌────────────┐  ┌────────────────┐  │
│  │  Dismiss   │  │  Confirm ✓    │  │
│  └────────────┘  └────────────────┘  │
└──────────────────────────────────────┘
```

**When card does NOT match the recommendation:**

```
┌──────────────────────────────────────┐
│         ⚡ Via Apple Pay              │
│                                      │
│  💰 Amount     $42.50                │
│  🏪 Merchant   Cold Storage          │
│  🏷️ Category   Groceries          ✏️  │
│  💳 Card       Citi PremierMiles  ✏️  │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ 💡 Tip: DBS Altitude earns   │    │  ← Gentle nudge (not aggressive)
│  │ 2.5 mpd for Groceries       │    │     "Next time" framing
│  │ (vs 1.0 for this card).     │    │     Dismissible, not blocking
│  │ Try it next time!           │    │
│  └──────────────────────────────┘    │
│                                      │
│  ┌────────────┐  ┌────────────────┐  │
│  │  Dismiss   │  │  Confirm ✓    │  │
│  └────────────┘  └────────────────┘  │
└──────────────────────────────────────┘
```

**Logic:**
1. On auto-capture, infer category from merchant name
2. Call `recommend(category)` RPC to get the top card for that category
3. Compare auto-captured card with recommended card
4. If match → show green "You used the best card!" banner (celebrates good behavior)
5. If no match → show gentle blue "Tip" nudge with the better card (educates, not shames)
6. If cap is exhausted on the recommended card → no nudge (recommendation would have changed anyway)
7. Nudge is dismissible and doesn't block confirmation

**Why this matters:**
- Turns every auto-captured transaction into a **micro-learning moment**
- Users gradually learn which cards to use without consulting the Recommend tab
- Reinforces the core value prop ("you're earning more miles because of MaxiMile")
- Directly addresses **Friction F6** (no proof optimization works) — users see proof on every transaction

#### 3.2.4 Smart Pay → Auto-Capture Handoff

The Smart Pay flow currently has an awkward handoff after the Wallet step:

| Step | Current (Manual) | Updated (Auto-Capture) |
|------|------------------|------------------------|
| 1. Detect merchant | Same | Same |
| 2. Recommend card | Same | Same |
| 3. Open Wallet | Same | Same |
| 4. User pays | Same | Same |
| 5. Return to app | **Manual keypad appears** — user must enter amount | **Auto-capture confirmation appears** — amount, merchant, card pre-filled |
| 6. Log | User types amount + confirms | **One-tap confirm** |

When the Smart Pay flow detects the user returning from Wallet AND an auto-capture deep link / notification arrives within 60 seconds, the Smart Pay flow should:
1. Skip its own manual logging step (State 6)
2. Yield to the auto-capture confirmation screen instead
3. Pre-populate the recommendation match indicator (since we know which card was recommended)

If no auto-capture fires within 60 seconds (user paid with physical card, or notification delayed), fall back to the existing manual logging step.

### 3.3 Transaction Source Differentiation

All transaction records now carry a `source` field for analytics and UI:

| Source Value | Badge Text | Badge Style | When |
|--------------|-----------|-------------|------|
| `manual` | (none) | N/A | User logged manually via existing form |
| `shortcut` | "Via Apple Pay" | Blue pill badge | iOS Shortcuts auto-capture |
| `notification` | "Via Bank Notification" | Blue pill badge | Android notification auto-capture |
| `smart_pay` | "Via Smart Pay" | Gold pill badge | Logged through Smart Pay flow (existing) |
| `shortcut_smart_pay` | "Via Apple Pay" + "Smart Pay" | Blue + Gold badges | Auto-captured after Smart Pay-guided payment |

---

## 4. Screen Specifications

### 4.1 Auto-Capture Confirmation Screen

**Purpose**: Present auto-captured transaction data for user review and one-tap confirmation. Optionally shows recommendation match indicator to reinforce good card choices.
**Entry Points**: Deep link (`maximile://log?...`) from iOS Shortcuts; MaxiMile notification tap from Android; Smart Pay flow handoff after Wallet return.
**Exit Points**: Confirm → Log Tab (with success overlay); Dismiss → previous screen.

**Shared across iOS and Android** — only the source badge differs. Recommendation match indicator is shared.

#### Layout

```
┌──────────────────────────────────────┐
│                                      │
│         ⚡ Via Apple Pay              │  ← Source badge (platform-specific)
│         (or 📱 Via Bank Notification) │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  Amount                      │    │
│  │  $42.50                      │    │  ← Large, bold, brand gold
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  Merchant                    │    │
│  │  Cold Storage            ✏️  │    │  ← Tappable to edit
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  Category                    │    │
│  │  🛒 Groceries             ✏️  │    │  ← Auto-inferred; tappable to change
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  Card                        │    │
│  │  💳 DBS Altitude           ✏️  │    │  ← Matched from Wallet/notification
│  └──────────────────────────────┘    │
│                                      │
│  ┌────────────┐  ┌────────────────┐  │
│  │  Dismiss   │  │  Confirm ✓    │  │  ← Primary CTA: Confirm
│  │  (ghost)   │  │  (filled,gold)│  │     Secondary: Dismiss (ghost style)
│  └────────────┘  └────────────────┘  │
│                                      │
└──────────────────────────────────────┘
```

#### Component Details

| Component | Type | Behavior | States |
|-----------|------|----------|--------|
| Source Badge | Pill/chip | Non-interactive display | "Via Apple Pay" (iOS) / "Via Bank Notification" (Android) |
| Amount | Display field | Editable on tap (rare case) | Default (gold, large), Editing (text input) |
| Merchant | Display field | Editable on tap | Default (pre-filled), Editing (text input) |
| Category | Selector field | Tap opens category picker (7 categories) | Auto-inferred (with icon), Unrecognized (shows "General/Others" + prompt), User-corrected |
| Card | Selector field | Tap opens card picker (user's portfolio) | Matched (shows card name), Unmatched (shows dropdown prompt) |
| Recommendation Match Banner | Info card | Non-interactive; contextual | Green "You used the best card!" (card matches recommendation), Blue "Tip" nudge (card doesn't match; shows better option), Hidden (cap exhausted or category unclear) |
| Confirm Button | CTA | Saves transaction, updates cap, shows success overlay | Default (brand gold, filled), Loading (spinner), Success (checkmark) |
| Dismiss Button | Ghost CTA | Discards transaction, returns to previous screen | Default (outlined, grey) |

#### Accessibility

- All fields have accessible labels (e.g., "Amount: forty-two dollars and fifty cents")
- Source badge is announced by screen reader ("Transaction captured via Apple Pay")
- Confirm and Dismiss buttons have minimum 44pt touch targets
- Category and Card edit icons have "Edit category" / "Edit card" accessible hints
- Color contrast meets WCAG 2.1 AA for all text

### 4.2 Setup Wizard — iOS (F26)

**Purpose**: Guide users through one-time Apple Pay auto-capture configuration.
**Entry Points**: Onboarding Step 1.5 (primary); Settings → Auto-Capture → Set Up (re-run); Discovery prompt on Log tab (fallback for users who skipped onboarding).
**Exit Points**: Completion → continues to next onboarding step or returns to Settings with active status; Skip → continues without enabling.

#### Step Screens

| Step | Title | Key Element | CTA |
|------|-------|-------------|-----|
| 1/4 | How It Works | Animated diagram: Apple Pay → Shortcut → MaxiMile | Next → |
| 2/4 | Download Shortcut | "Download MaxiMile Shortcut" button; iOS version check | Download (opens Shortcuts app) |
| 3/4 | Verify Your Cards | Wallet ↔ MaxiMile card mapping table with match indicators | Next → (all cards mapped) |
| 4/4 | Test It Out | Animated waiting state; listens for first deep link | Skip Test / (auto-completes on success) |

#### Step 3 — Card Verification Table Component

```
┌─────────────────────────────────────────────────┐
│  APPLE WALLET NAME          MAXIMILE CARD        │
│  ──────────────────         ─────────────        │
│  DBS Altitude Visa      →   DBS Altitude    ✅   │  ← High confidence match
│  OCBC 90°N Visa         →   OCBC 90N        ✅   │
│  Amex KrisFlyer Ascend  →   KF Ascend       ✅   │
│  Citi PM Visa Signature →   [Select ▼]      ⚠️   │  ← Low confidence; dropdown
│                                                   │
│  Can't find your card? [Add new card →]          │
└─────────────────────────────────────────────────┘
```

- ✅ = Fuzzy match confidence >80% (auto-matched, user can override)
- ⚠️ = Confidence <50% (user must select from dropdown)
- 50-80% = Auto-matched but highlighted for review

### 4.3 Setup Flow — Android (F27)

**Purpose**: Obtain notification access permission with clear privacy disclosure.
**Entry Points**: Onboarding Step 1.5 (primary); Settings → Auto-Capture → Enable (re-run); Discovery prompt on Log tab (fallback).
**Exit Points**: Permission granted → continues to next onboarding step or returns to Settings; Permission denied → graceful fallback, continues onboarding.

#### Privacy Disclosure Screen

The privacy disclosure screen is the primary differentiator from the iOS flow. Android's notification access is a sensitive permission, so the screen must build trust before sending the user to system settings.

| Section | Content |
|---------|---------|
| Header | "How Auto-Capture Works" with lock icon |
| What we access | "Notification text from DBS, OCBC, UOB, Citi, AMEX, and Google Pay only" |
| What we extract | "Amount, merchant name, card (last 4 digits)" |
| Privacy guarantees | Bullet list: on-device only, no upload, no non-banking notifs, revocable anytime |
| CTA | "Grant Notification Access" (brand gold, filled) |
| Secondary | "No Thanks" (ghost) |

#### Post-Permission Confirmation

After the user grants permission and returns to MaxiMile:

```
┌──────────────────────────────────────┐
│         ✅ Auto-Capture Active        │
│                                      │
│  Your banking notifications will     │
│  now auto-log transactions.          │
│                                      │
│  Supported banks:                    │
│  DBS ✓  OCBC ✓  UOB ✓              │
│  Citi ✓  AMEX ✓  Google Pay ✓       │
│                                      │
│  Your cards:                         │
│  • ••1234 → DBS Altitude         ✓  │
│  • ••5678 → OCBC 90N            ✓  │
│  • ••9012 → Citi PremierMiles    ✓  │
│                                      │
│  [Done]                              │
└──────────────────────────────────────┘
```

Card matching is done automatically by bank + last-4-digits (from card portfolio data). No manual verification step needed (unlike iOS, where Wallet names require fuzzy matching).

### 4.4 Auto-Capture Settings Screen

**Purpose**: View status, manage card mappings, and enable/disable auto-capture.
**Entry Point**: Settings → Auto-Capture.

```
┌──────────────────────────────────────┐
│  Auto-Capture                        │
│                                      │
│  Status: ● Active                    │  ← Green dot when active
│  Method: iOS Shortcuts               │     (or "Android Notifications")
│                                      │
│  ─────────────────────────────────── │
│                                      │
│  Card Mappings                       │
│  DBS Altitude Visa → DBS Altitude    │
│  OCBC 90°N Visa   → OCBC 90N        │
│  [Edit Mappings →]                   │
│                                      │
│  ─────────────────────────────────── │
│                                      │
│  Stats                               │
│  Auto-captured this month: 23        │
│  Manual this month: 8                │
│  Time saved: ~7 minutes              │
│                                      │
│  ─────────────────────────────────── │
│                                      │
│  [Re-run Setup Wizard]               │
│  [Disable Auto-Capture]              │  ← Red text, requires confirmation
│                                      │
└──────────────────────────────────────┘
```

The **"Time saved" stat** directly addresses Friction F6 (no proof optimization works) by showing tangible value from auto-capture.

### 4.5 MaxiMile Notification (Android Only)

**Purpose**: Alert user that a transaction was detected; allow one-tap access to confirmation.
**Trigger**: NotificationListenerService detects a banking app transaction notification.

```
┌─────────────────────────────────────────────┐
│ MaxiMile                               now  │
│ 💳 $42.50 at Cold Storage                    │
│ DBS Altitude · Groceries                    │
│ Tap to confirm or edit                      │
└─────────────────────────────────────────────┘
```

- Uses Android notification channel "Transaction Alerts" (user can mute independently)
- Notification is auto-dismissed after user confirms or dismisses in-app
- If user ignores, notification persists for standard Android duration, then cleared
- **Never auto-saves** — notification is informational, not a saved record

---

## 5. Interaction Patterns

| Pattern | Behavior |
|---------|----------|
| **Onboarding setup** | Step 1.5 between Add Cards and Miles Balances. Skippable. Platform-adaptive (Apple Pay pitch on iOS, Notification pitch on Android). |
| **Auto-capture arrival** (iOS) | App opens/foregrounds to confirmation screen. If app was open, navigates to confirmation. |
| **Auto-capture arrival** (Android) | Notification posted. App does NOT foreground automatically. User taps notification to open confirmation. |
| **Smart Pay handoff** | If auto-capture fires within 60s of returning from Wallet, Smart Pay yields to auto-capture confirmation (skips manual amount entry). |
| **Recommendation match** | On confirm screen, calls `recommend(category)` to compare auto-captured card vs. best card. Shows green "best card" banner or blue "tip" nudge. |
| **Confirmation** | Single tap on "Confirm" → success overlay (0.8s) → return to Log tab. |
| **Edit flow** | Tap pencil icon → inline edit (amount, merchant) or picker (category, card) → confirm. |
| **Dismiss** | Tap "Dismiss" → no confirmation dialog (low-risk action) → brief toast "Not logged" → return. |
| **Duplicate detection** (Android) | If Google Pay + banking app both fire within 60s for same amount, only one MaxiMile notification shown. |
| **Discovery nudge** | Non-intrusive card on Log tab. Appears after 5+ manual logs if auto-capture not set up. Max 1x per week. Dismissible with "Don't show again." |
| **Error recovery** | Partial data → show editable form with filled fields. No data → fall back to standard manual form. |

---

## 6. Platform Comparison Summary

| Aspect | iOS (F26) | Android (F27) |
|--------|-----------|---------------|
| **Trigger** | Apple Pay NFC tap → Shortcuts automation | Banking app push notification |
| **Coverage** | Apple Pay in-store only | All card transactions (in-store, online, physical, mobile wallet) |
| **User setup** | ~3 min wizard + Shortcut download | ~1 min permission grant |
| **Ongoing effort** | Zero (Shortcut runs silently) | Zero (service runs in background) |
| **How user is notified** | App opens automatically | MaxiMile notification appears |
| **Card matching** | Fuzzy match on Wallet name (setup verification) | Last-4-digits + bank name (automatic) |
| **Privacy model** | No special permissions (URL scheme) | Notification access permission required |
| **App Store risk** | None (Apple-sanctioned) | Low (Google Play requires disclosure) |
| **Confirmation UX** | Identical screen (shared component) | Identical screen (shared component) |

---

## 7. Design Tokens

**See [DRD_MASTER.md Section 4](./DRD_MASTER.md#4-design-tokens) for complete design system tokens** (colors, typography, spacing, shadows, etc.).

### Auto-Capture Specific Tokens

Additional tokens specific to auto-capture features:

```
/* Source Badges */
--source-badge-bg:       #E8F0FE       /* Light blue pill background */
--source-badge-text:     #1A73E8       /* Blue text for "Via Apple Pay" / "Via Bank Notification" */

/* Confirmation Screen States */
--success-banner-bg:     rgba(52, 168, 83, 0.1)   /* Green background for "best card" match */
--success-banner-text:   #1E8E3E                   /* Dark green text */
--tip-banner-bg:         rgba(26, 115, 232, 0.1)  /* Blue background for "tip" nudge */
--tip-banner-text:       #1557B0                   /* Dark blue text */

/* Card Matching (iOS Setup) */
--match-confidence-high:  #34A853    /* Green checkmark (>80% confidence) */
--match-confidence-low:   #FBBC04    /* Amber warning (< 50% confidence) */
```

**Reused from global system:**
- `Colors.brandGold` (#C5A55A) — Confirm button, active states
- `Colors.textPrimary` (#1A1A2E) — Amount, merchant name
- `Colors.textSecondary` (#5F6368) — Labels, helper text
- `Colors.success` (#34A853) — "Best card" banner
- `Colors.danger` (#EA4335) — Error states
- `BorderRadius.xl` (16px) — Confirmation screen card
- `Shadows.glass` — Glassmorphic surfaces

---

## 8. Accessibility Requirements

**See [DRD_MASTER.md Section 7](./DRD_MASTER.md#7-accessibility-requirements) for global accessibility standards** (WCAG 2.1 AA, screen reader support, touch targets, color contrast, etc.).

### Auto-Capture Specific Accessibility

- [x] **Source badge announced**: "Transaction captured via Apple Pay" / "via bank notification"
- [x] **Recommendation match banner announced**: "You used the best card, DBS Altitude earns 2.5 miles per dollar" or "Tip: DBS Altitude earns..."
- [x] **Editable fields** have clear accessible labels and edit hints ("Edit category" / "Edit card")
- [x] **Setup wizard** navigable via accessibility gestures (swipe between steps 1-4)
- [x] **Privacy disclosure** (Android) fully readable by screen reader with clear permission explanation
- [x] **Card mapping table** (iOS) rows announced as "DBS Altitude Visa maps to DBS Altitude, verified" or "Requires selection"

---

## 9. Open Design Questions

- [ ] **Auto-confirm mode (P2)**: Should there be a toggle to skip the confirmation screen entirely and auto-save? Risk: incorrect data logged silently. Recommendation: defer to v2.1 after observing correction rates.
- [ ] **Batch confirmation**: If Android user has 5 pending notifications, should there be a "Confirm All" batch action? Recommendation: yes, add in Sprint 17 if time permits.
- [ ] **Notification grouping**: Should multiple pending MaxiMile notifications be grouped on Android? Recommendation: yes, use Android notification groups with summary.
- [ ] **Offline handling**: What happens if auto-capture fires but device is offline? Recommendation: queue locally, sync when online. Same as existing manual logging behavior.
- [ ] **Apple Watch**: iOS Shortcuts Transaction trigger doesn't fire for Watch payments. Should we document this limitation in the setup wizard? Recommendation: yes, add a small note.

---

## 10. Handover Notes for Developer

### Key Implementation Details

1. **Shared Confirmation Screen**: Build as a single reusable component. Only the source badge and entry animation differ between iOS and Android. Recommendation match indicator is shared.

2. **Onboarding Integration**: Insert new Step 1.5 between existing Step 1 (Add Cards) and Step 2 (Miles Balances) in `onboarding.tsx`. Platform-detect to show iOS (Apple Pay) or Android (Notifications) variant. Pass auto-capture status to Step 2 via route params (same pattern as `cardIds`).

3. **Deep Link Handler** (iOS): The URL scheme `maximile://` is already configured in `app.json`. Handle the `/log` path with query params: `amount`, `merchant`, `card`, `source`.

4. **MaxiMile Notification** (Android): Use a dedicated notification channel "Transaction Alerts" so users can independently control these notifications without affecting other app notifications.

5. **Merchant → Category Mapping**: Seed with 200+ common SG merchants. Use keyword-based fuzzy matching (not exact). Store user corrections at the user level for personalization.

6. **Card Matching**:
   - iOS: Fuzzy string match (Levenshtein distance or similar). Store verified mappings from setup wizard.
   - Android: Exact match on bank + last-4-digits against `user_cards` table.

7. **Recommendation Match on Confirmation**: When auto-capture fires, call `recommend(inferred_category)` RPC to get top card. Compare with auto-captured card. Show green match banner or blue tip nudge. Reuse existing `recommend()` RPC — no new endpoint needed.

8. **Smart Pay Handoff**: In `pay/index.tsx` State 5→6 transition, listen for incoming deep link / notification within 60-second window. If auto-capture data arrives, skip State 6 (manual logging) and navigate to auto-capture confirmation screen instead. If no auto-capture within 60s, fall back to existing manual flow.

9. **iOS Shortcut Limitation**: The Shortcut CANNOT be installed programmatically. The setup wizard's Step 2 must send the user to the Shortcuts app. The `.shortcut` file pre-configures everything so user only taps "Add Automation." This is a hard Apple platform constraint — document clearly in the wizard.

10. **Discovery Nudge Logic**: Show on Log tab after user has logged 5+ manual transactions AND has not completed auto-capture setup. Max frequency: once per week. Dismissible with "Don't show again" (persisted in AsyncStorage). Not shown if auto-capture already active.

11. **Analytics Events**: Track `auto_capture_setup_started`, `auto_capture_setup_completed`, `auto_capture_setup_skipped_onboarding`, `auto_capture_confirmed`, `auto_capture_dismissed`, `auto_capture_edited` (with field name), `auto_capture_card_mismatch`, `auto_capture_recommendation_match`, `auto_capture_recommendation_nudge_shown`, `smart_pay_auto_capture_handoff`.
