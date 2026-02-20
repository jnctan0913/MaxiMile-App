# Design Requirements Document: Miles Portfolio (F13-F23)

**Version**: 3.0
**Last Updated**: 2026-02-20
**Author**: UI/UX Designer Agent
**Status**: Draft
**PRD Reference**: PRD v1.5, Features F13-F23

### Changelog
| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-20 | Initial DRD covering F13-F17 (Miles Portfolio, Balance Entry, Redemptions, Goals, Insights) |
| 2.0 | 2026-02-20 | Added Two-Layer Architecture (F18), Transfer Partner Mapping (F19), Smart Transfer Nudges (F20), Expanded Programs (F21). New sections: 4.8-4.12, 5.4, updated 2.2, 2.3, 6, 10, 14 |
| 3.0 | 2026-02-20 | Added Eligibility Badge (F22), Eligibility Tooltip (F22), Rate Change Notification Banner (F23), Rate Updated Badge (F23). New sections: 4.13-4.16, 5.1c. Updated 1.2, 2.3, 6, 10, 13, 14, 15 |

---

## 1. Overview

### 1.1 Purpose

This document specifies the design requirements for the Miles Portfolio feature set (F13-F23) in the MaxiMile app. These features introduce a "Miles" tab with a two-layer architecture: **Layer 1 "My Miles"** (airline FFP destination view) and **Layer 2 "My Points"** (bank reward points source view), connected by a transfer partner mapping system. Additionally, it covers **Card Coverage Expansion (F22)** with eligibility badges for restricted cards, and **Rate Change Monitoring (F23)** with notification banners and card detail badges. The design must integrate seamlessly with the existing app's glassmorphic, gold-accented visual language.

### 1.2 Scope

| Feature | Name | Description | Sprint |
|---------|------|-------------|--------|
| F13 | Miles Portfolio Dashboard | Miles tab showing total miles per loyalty program | Sprint 7 (Shipped) |
| F14 | Manual Miles Balance Entry | Users set a baseline balance per program | Sprint 7 (Shipped) |
| F15 | Miles Redemption Logging | Users log miles used for flights/upgrades | Sprint 8 (Shipped) |
| F16 | Miles Goal Tracker | Users set miles targets with progress tracking | Sprint 8 (Shipped) |
| F17 | Miles Earning Insights | Monthly earning trend summary | Sprint 8 (Shipped) |
| **F18** | **Two-Layer Miles Architecture** | **Segmented control: "My Miles" (airline) + "My Points" (bank)** | **Sprint 10** |
| **F19** | **Transfer Partner Mapping** | **Bank→airline transfer rates, fees, conversion calculations** | **Sprint 9 (DB shipped)** |
| **F20** | **Smart Transfer Nudges** | **Contextual suggestions for idle bank points** | **Sprint 10** |
| **F21** | **Expanded Miles Programs** | **7→16 programs: 10 bank/transferable + 7 airline FFPs** | **Sprint 9 (DB shipped)** |
| **F22** | **Card Coverage Expansion** | **20→29 miles cards, eligibility badges for restricted cards** | **Sprint 11** |
| **F23** | **Rate Change Monitoring** | **Rate change alerts, notification banners, card detail badges** | **Sprint 12** |

### 1.3 Design Principles

These principles are derived from the PRD Section 16 and the existing codebase patterns:

1. **Auto-magic first** -- Show calculated miles immediately from existing transaction data; do not gate behind manual entry.
2. **Progressive disclosure** -- Total at top, then per-program breakdown, then detail on tap.
3. **Celebrate progress** -- Brand gold (#C5A55A) for milestones; satisfying animation when goals are reached.
4. **Familiar patterns** -- Reuse glassmorphic card style from transaction rows; consistent with existing app design language.
5. **Skippable onboarding** -- Never block the user; balance entry is always optional.
6. **Destination-first thinking** (NEW — F18) -- Default to "My Miles" (airline programs) because users think in destinations ("Can I book SQ Tokyo?"), not sources ("What can I do with DBS Points?").
7. **Confirmed vs. Potential clarity** (NEW — F18) -- Never let users mistake transferable bank points for miles they already have. Visual distinction is mandatory.
8. **Actionable nudges, not spam** (NEW — F20) -- Transfer nudges must be dismissible, session-scoped (max 1), and only appear when genuinely useful.

---

## 2. Information Architecture

### 2.1 Navigation Structure

The Miles tab is inserted as the 5th tab in the bottom navigation bar, replacing the current Profile tab position. Profile moves to a header icon or remains as the 5th tab with Miles inserted at position 4 (between Log and Profile). Based on the PRD guidance that this is a "core value feature that deserves top-level access," the recommended placement is:

```
Tab Bar (5 tabs):
  1. Recommend  (compass icon)       -- existing
  2. My Cards   (card icon)          -- existing
  3. Cap Status (bar-chart icon)     -- existing
  4. Log        (add-circle icon)    -- existing
  5. Miles      (airplane icon)      -- NEW (replaces Profile position)

Profile access: moved to header-right icon on all screens
```

**Rationale**: The PRD explicitly states "New 'Miles' tab in bottom navigation (5th tab). This is a core value feature that deserves top-level access -- drives daily check-in habit." Profile is accessed less frequently and can move to a header position, consistent with many finance apps.

### 2.2 Screen Hierarchy

```
Miles Tab (Portfolio Overview)                    -- F13 + F18
  |-- Hero: Context-aware total (updates per segment)
  |-- Segmented Control: "My Miles" | "My Points"  -- F18
  |
  |-- [My Miles active — Layer 1]                  -- F18
  |     |-- Airline FFP program cards
  |     |     |-- Confirmed miles (bold gold)
  |     |     |-- Potential miles (from bank points, lighter style)
  |     |     |-- Total = confirmed + potential
  |     |     +-- Tap --> Program Detail Screen
  |     +-- Empty state (no airline programs)
  |
  |-- [My Points active — Layer 2]                 -- F18
  |     |-- Transfer Nudge Card (max 1)             -- F20
  |     |-- Bank reward points cards
  |     |     |-- Bank balance (bold gold)
  |     |     |-- Transfer options list
  |     |     |     |-- Airline destination + rate + resulting miles
  |     |     |     +-- "Transfer" CTA → bank URL
  |     |     +-- Tap card header → Program Detail Screen
  |     +-- Empty state (no bank programs)
  |
  +-- Empty State (no cards at all)

Program Detail Screen                             -- F13/F14/F15/F16
  |-- Balance breakdown section
  |     |-- Manual baseline
  |     |-- Auto-earned this month
  |     +-- Total balance
  |-- Cards contributing to this program
  |-- "Update Balance" button --> Bottom Sheet     -- F14
  |-- "Log Redemption" button --> Bottom Sheet     -- F15
  |-- Redemption history list
  +-- Goal section                                 -- F16
        |-- Set Goal button --> Bottom Sheet
        |-- Progress bar (brand gold fill)
        +-- Projected date

Onboarding Step 2 (Miles Balance Entry)           -- F14
  |-- Title: "Set your current miles balances"
  |-- Per-program rows (derived from selected cards)
  |     |-- Program icon + name + numeric input
  |-- "I'll do this later" skip link
  +-- "Save & Continue" CTA

Bottom Sheets:
  |-- Update Balance Sheet                         -- F14
  |-- Log Redemption Sheet                         -- F15
  +-- Set Goal Sheet                               -- F16
```

### 2.3 Cards-to-Programs Mapping (Reference Data)

This mapping is seeded in the `miles_programs` table and determines which programs appear for each user based on their card portfolio.

#### Bank Points / Transferable Programs (Layer 2 — "My Points")

| Program | Type | Cards | Transfer Partners |
|---------|------|-------|-------------------|
| KrisFlyer (direct earn) | airline | Amex KrisFlyer Ascend, Amex KrisFlyer Credit, DBS Altitude, UOB PRVI Miles, OCBC 90N, KrisFlyer UOB, SC Visa Infinite | N/A (direct earn) |
| Citi Miles | bank_points | Citi PremierMiles, Citi Rewards | 7 airlines (1:1 — best rates in SG) |
| UNI$ (UOB) | bank_points | UOB Lady's, UOB Preferred Platinum | 2 airlines (2.5:1) |
| OCBC$ | bank_points | OCBC Titanium Rewards | 5 airlines (2.5:1) |
| 360 Rewards (SC) | bank_points | SC X Credit Card | 2 airlines (2.5:1) |
| TreatsPoints (Maybank) | bank_points | Maybank Horizon, Maybank FC Barcelona | 3 airlines (2.5:1) |
| DBS Points | bank_points | POSB Everyday | 3 airlines (5:2) |
| **HSBC Reward Points** | bank_points | **HSBC Revolution, HSBC TravelOne** | **6 airlines (2.5:1 to 3.5:1)** |
| **Amex Membership Rewards** | transferable | **(no cards in our DB yet)** | **6 airlines (post-devaluation rate)** |
| **BOC Points** | bank_points | **BOC Elite Miles** | **1 airline (5:1, S$30.56 fee)** |

#### Airline FFP Programs (Layer 1 — "My Miles")

| Program | Airline | Accessible From (Banks) |
|---------|---------|------------------------|
| KrisFlyer | Singapore Airlines | All 9 banks + direct earn cards |
| **Asia Miles** | Cathay Pacific | Citi, DBS, UOB, OCBC, SC, Maybank, HSBC, Amex |
| **British Airways Avios** | British Airways | Citi, OCBC, HSBC, Amex |
| **Qantas Frequent Flyer** | Qantas | Citi, DBS, OCBC, HSBC, Amex |
| **Qatar Privilege Club** | Qatar Airways | Citi, HSBC |
| **Flying Blue** | Air France-KLM | Citi, OCBC, HSBC, Amex |
| **Malaysia Airlines Enrich** | Malaysia Airlines | Citi, Maybank, Amex |

---

## 3. User Flows

### 3.1 Flow A -- First-Time User (Onboarding with Miles Balance Entry)

```
[User completes card selection (Step 1)]
    |
    v
[Step 2: "Set your current miles balances"]
    |-- System derives programs from selected cards
    |-- Shows program rows with numeric input fields
    |
    +--> [User enters balances] --> [Tap "Save & Continue"]
    |         |
    |         v
    |    [Balances saved to miles_balances table]
    |         |
    |         v
    |    [Navigate to main app -- Miles tab shows balances]
    |
    +--> [User taps "I'll do this later"]
              |
              v
         [Navigate to main app -- Miles tab shows 0 + auto-earned only]
```

### 3.2 Flow B -- Viewing Miles Portfolio

```
[User taps "Miles" tab]
    |
    v
[Miles Portfolio Overview loads]
    |-- Fetches: miles_balances, miles_transactions, transactions + earn_rules
    |-- Calculates: manual_baseline + auto_earned - redemptions = total per program
    |-- Renders: hero total + per-program cards
    |
    +--> [User pulls to refresh] --> [Refetch all data, recalculate]
    |
    +--> [User taps a program card]
              |
              v
         [Program Detail Screen]
```

### 3.3 Flow C -- Updating Manual Balance

```
[Program Detail Screen]
    |
    +--> [User taps "Update Balance"]
              |
              v
         [Bottom Sheet slides up]
              |-- Current balance pre-filled
              |-- Numeric input field
              |-- "Save" CTA
              |
              +--> [User enters new balance] --> [Tap "Save"]
              |         |
              |         v
              |    [Upsert to miles_balances, update timestamp]
              |    [Dismiss sheet, refresh program detail]
              |
              +--> [User swipes down / taps backdrop]
                        |
                        v
                   [Dismiss sheet, no change]
```

### 3.4 Flow D -- Logging a Redemption

```
[Program Detail Screen]
    |
    +--> [User taps "Log Redemption"]
              |
              v
         [Bottom Sheet slides up]
              |-- Miles amount input (numeric)
              |-- Description field (text, e.g. "SIN to NRT Business")
              |-- Date picker (defaults to today)
              |-- "Log Redemption" CTA
              |
              +--> [User fills fields] --> [Tap "Log Redemption"]
              |         |
              |         v
              |    [Insert to miles_transactions (type: redeem)]
              |    [Celebration animation (confetti/sparkle)]
              |    [Dismiss sheet, refresh program detail]
              |    [Balance reduced by redemption amount]
              |
              +--> [User swipes down / taps backdrop]
                        |
                        v
                   [Dismiss sheet, no change]
```

### 3.5 Flow E -- Setting a Miles Goal

```
[Program Detail Screen]
    |
    +--> [User taps "Set Goal" / "Edit Goal"]
              |
              v
         [Bottom Sheet slides up]
              |-- Target miles input (numeric)
              |-- Description field (e.g. "Tokyo Business Class")
              |-- "Save Goal" CTA
              |-- "Delete Goal" link (if editing existing)
              |
              +--> [User sets target] --> [Tap "Save Goal"]
              |         |
              |         v
              |    [Insert/update miles_goals table]
              |    [Dismiss sheet]
              |    [Progress bar + projected date now visible]
              |
              +--> [Goal achieved (balance >= target)]
                        |
                        v
                   [Celebration state: gold confetti animation]
                   ["Goal Achieved!" badge on progress bar]
```

### 3.6 Flow F -- Switching Between Miles Layers (F18)

```
[User on Miles tab (Layer 1 "My Miles" is default)]
    |
    +--> [User taps "My Points" segment]
              |
              v
         [Layer 2 activates]
              |-- Hero updates: shows total bank points, subtitle changes
              |-- Content switches: bank program cards with transfer options
              |-- Scroll resets to top
              |-- Transfer nudge card appears (if applicable — F20)
              |
              +--> [User taps "My Miles" segment]
                        |
                        v
                   [Layer 1 reactivates]
                        |-- Hero updates: shows total airline miles (confirmed + potential)
                        |-- Content switches: airline program cards
                        |-- Scroll resets to top
```

### 3.7 Flow G -- Viewing Transfer Options (F18/F19)

```
[User on Layer 2 "My Points"]
    |
    +--> [Views bank program card (e.g., DBS Points: 50,000)]
              |
              v
         [Transfer Options section visible below balance]
              |-- Shows: KrisFlyer (5:2 = 20,000 miles), Asia Miles (5:2 = 20,000), etc.
              |-- Sorted by best rate (lowest points-per-mile first)
              |
              +--> [User taps "Transfer" CTA on KrisFlyer option]
                        |
                        v
                   [Opens bank transfer URL in external browser via Linking.openURL]
```

### 3.8 Flow H -- Smart Transfer Nudge Interaction (F20)

```
[User switches to Layer 2 "My Points"]
    |
    v
[System checks: does user have bank points > 0 AND no transfer in 30 days?]
    |
    +--> [Yes] --> [Show nudge card at top of Layer 2]
    |                |-- "Your 50,000 DBS Points could become 20,000 KrisFlyer miles"
    |                |-- [View Options] CTA
    |                |-- [X] Dismiss button
    |                |
    |                +--> [User taps "View Options"]
    |                |         |
    |                |         v
    |                |    [Auto-scroll to DBS Points card's transfer options]
    |                |
    |                +--> [User taps Dismiss (X)]
    |                          |
    |                          v
    |                     [Nudge hidden for this session]
    |
    +--> [No bank points or recent transfer] --> [No nudge shown]
```

---

## 4. Screen Specifications

### 4.1 Miles Tab -- Portfolio Overview

**Route**: `/(tabs)/miles`
**Layout**: ScrollView with RefreshControl, ImageBackground (background.png)
**SafeAreaView edges**: `['bottom']`

#### 4.1.1 Component Layout

```
+-----------------------------------------------+
|  [Header: MaxiMile logo]          [Profile icon]|
+-----------------------------------------------+
|                                                 |
|  Miles Portfolio              <-- screen title  |
|  Your loyalty program balances  <-- subtitle    |
|                                                 |
|  +-------------------------------------------+ |
|  |          HERO SECTION                      | |
|  |                                            | |
|  |        142,850                             | |
|  |     total miles across 3 programs          | |
|  +-------------------------------------------+ |
|                                                 |
|  +-------------------------------------------+ |
|  | [Airplane] KrisFlyer              30,950 > | |
|  | 28,500 baseline + 2,450 earned             | |
|  | Updated 2 days ago                         | |
|  +-------------------------------------------+ |
|                                                 |
|  +-------------------------------------------+ |
|  | [Airplane] Citi Miles             98,200 > | |
|  | 95,000 baseline + 3,200 earned             | |
|  | Updated 5 days ago                         | |
|  +-------------------------------------------+ |
|                                                 |
|  +-------------------------------------------+ |
|  | [Airplane] UNI$ (UOB)            13,700 > | |
|  | 12,000 baseline + 1,700 earned             | |
|  | Updated 1 week ago                         | |
|  +-------------------------------------------+ |
|                                                 |
+-----------------------------------------------+
|  Recommend | Cards | Caps | Log | Miles        |
+-----------------------------------------------+
```

#### 4.1.2 Component Table

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Screen background | ImageBackground | `background.png` | Same as all existing screens |
| Screen title | Text | `Typography.heading`, fontSize 26, `Colors.textPrimary` | "Miles Portfolio" |
| Screen subtitle | Text | `Typography.body`, fontSize 15, `Colors.textSecondary` | "Your loyalty program balances" |
| Hero total number | Text | fontSize 40, fontWeight '700', `Colors.brandGold` | Large gold number, comma-formatted |
| Hero subtitle | Text | `Typography.caption`, `Colors.textSecondary` | "total miles across N programs" |
| Hero container | View | `marginBottom: Spacing.xl`, centered alignment | Centered text block, no card wrapper |
| Program card | TouchableOpacity | Glassmorphic style (see 4.1.3) | One per program; tappable |
| Program icon | Ionicons | `airplane-outline`, size 22, inside LinearGradient circle (38x38) | Gradient: `['#C5A55A', '#A8893E']` (brand gold) |
| Program name | Text | `Typography.bodyBold`, `Colors.textPrimary` | e.g. "KrisFlyer" |
| Program total | Text | `Typography.bodyBold`, `Colors.brandGold` | Right-aligned, comma-formatted |
| Balance breakdown | Text | `Typography.caption`, `Colors.textSecondary` | "28,500 baseline + 2,450 earned" |
| Last updated | Text | `Typography.caption`, `Colors.textTertiary` | Relative time: "Updated 2 days ago" |
| Chevron icon | Ionicons | `chevron-forward`, size 18, `Colors.textTertiary` | Right edge of card |
| Card separator | View | `height: Spacing.sm` (8px) | Between program cards |
| Pull-to-refresh | RefreshControl | System default | Standard iOS/Android refresh |
| ScrollView bottom padding | -- | `Spacing.xxxl + 40` (88px) | Clears tab bar |

#### 4.1.3 Glassmorphic Program Card Style

Reuse the exact style from `transactions.tsx` transactionRow:

```typescript
programCard: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'rgba(255, 255, 255, 0.65)',
  borderRadius: 16,                              // BorderRadius.xl
  borderWidth: 1,
  borderColor: 'rgba(197, 165, 90, 0.15)',       // Gold border tint
  paddingHorizontal: Spacing.lg,                  // 16
  paddingVertical: Spacing.md,                    // 12
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
    },
    android: { elevation: 2 },
  }),
}
```

This matches the transaction row cards and GlassCard component patterns already established in the codebase.

#### 4.1.4 Empty State

Displayed when the user has no cards added (and therefore no miles programs):

| Component | Value |
|-----------|-------|
| Icon | `airplane-outline` (Ionicons, size 64, `Colors.textTertiary`) |
| Title | "Track your miles" |
| Description | "Add your credit cards to see your miles balances across loyalty programs." |
| CTA Label | "Add Cards" |
| CTA Action | Navigate to `/onboarding` |

Uses the existing `EmptyState` component (`/components/EmptyState.tsx`).

**Zero-balance state** (cards added but no balances entered and no transactions): Show the program cards with "0" balances and a subtle inline prompt: "Tap a program to set your starting balance."

---

### 4.2 Program Detail Screen

**Route**: `/miles/[programId]`
**Layout**: ScrollView with ImageBackground, Stack.Screen header
**Header**: Back arrow + MaxiMile logo (consistent with `transactions.tsx`)

#### 4.2.1 Component Layout

```
+-----------------------------------------------+
|  < Back      [MaxiMile Logo]                   |
+-----------------------------------------------+
|                                                 |
|  KrisFlyer                     <-- program name |
|  Singapore Airlines            <-- airline name |
|                                                 |
|  +-------------------------------------------+ |
|  |  BALANCE BREAKDOWN                         | |
|  |                                            | |
|  |  Manual Baseline         28,500            | |
|  |  Auto-Earned (Feb)     +  2,450            | |
|  |  Redemptions           -      0            | |
|  |  ─────────────────────────────             | |
|  |  Estimated Total         30,950            | |
|  |                                            | |
|  |  Last updated: 18 Feb 2026                 | |
|  +-------------------------------------------+ |
|                                                 |
|  +---[Update Balance]---+--[Log Redemption]---+ |
|                                                 |
|  Contributing Cards                             |
|  +-------------------------------------------+ |
|  | [img] DBS Altitude        4.0 mpd dining   | |
|  +-------------------------------------------+ |
|  | [img] OCBC 90N            2.4 mpd general  | |
|  +-------------------------------------------+ |
|                                                 |
|  Goal: Tokyo Business Class          [Edit]     |
|  +-------------------------------------------+ |
|  | [==============================---] 73%    | |
|  | 30,950 / 42,000 miles                      | |
|  | Projected: May 2026                        | |
|  +-------------------------------------------+ |
|  (or "Set a Goal" button if no goal)            |
|                                                 |
|  Redemption History                             |
|  +-------------------------------------------+ |
|  | (empty: "No redemptions yet. When you      | |
|  |  redeem miles, they'll appear here.")       | |
|  +-------------------------------------------+ |
|                                                 |
+-----------------------------------------------+
```

#### 4.2.2 Component Table

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Program name | Text | `Typography.heading`, fontSize 26, `Colors.textPrimary` | e.g. "KrisFlyer" |
| Airline name | Text | `Typography.body`, fontSize 15, `Colors.textSecondary` | e.g. "Singapore Airlines" |
| Balance card | GlassCard | Existing `GlassCard` component | Contains breakdown rows |
| Breakdown label | Text | `Typography.body`, `Colors.textSecondary` | "Manual Baseline", "Auto-Earned (Feb)", "Redemptions" |
| Breakdown value | Text | `Typography.bodyBold`, `Colors.textPrimary` | Right-aligned, comma-formatted. "+" prefix for earned, "-" prefix for redemptions |
| Total divider | View | height 1, `Colors.border` | Horizontal rule above total |
| Total label | Text | `Typography.bodyBold`, `Colors.textPrimary` | "Estimated Total" |
| Total value | Text | fontSize 20, fontWeight '700', `Colors.brandGold` | Prominent gold number |
| Last updated | Text | `Typography.caption`, `Colors.textTertiary` | "Last updated: 18 Feb 2026" |
| Update Balance button | TouchableOpacity | `Colors.brandGold` fill, `BorderRadius.md`, height 44 | Left button, 48% width |
| Log Redemption button | TouchableOpacity | Outlined: `Colors.brandGold` border, transparent fill, height 44 | Right button, 48% width |
| Section header | Text | `Typography.captionBold`, `Colors.textSecondary`, uppercase, letterSpacing 0.5 | "CONTRIBUTING CARDS", "REDEMPTION HISTORY" |
| Card row | View | Same glassmorphic style as program cards | Shows card image (48x32) + name + base earn rate |
| Goal section | View | GlassCard wrapper | Contains progress bar, projection, edit button |
| Goal progress bar | View | Track: `Colors.borderLight`, Fill: `Colors.brandGold`, height 10, `BorderRadius.full` | Percentage-filled bar |
| Goal percentage | Text | `Typography.bodyBold`, `Colors.brandGold` | "73%" right of bar |
| Goal projection | Text | `Typography.caption`, `Colors.textSecondary` | "Projected: May 2026" |
| Set Goal button | TouchableOpacity | Outlined gold, full width, height 44 | Shown when no goal exists |
| Redemption row | View | Glassmorphic row style | Description + miles amount + date |
| Redemption empty | Text | `Typography.body`, `Colors.textTertiary`, centered | Inline message, no EmptyState component |

#### 4.2.3 Disclaimer

Below the balance breakdown card, display a subtle disclaimer:

- **Text**: "Estimated based on logged transactions. Actual balance may differ."
- **Style**: `Typography.caption`, `Colors.textTertiary`, italic
- **Purpose**: Manages expectations per PRD risk "Auto-calculated miles don't match bank statement"

---

### 4.3 Onboarding Step 2 -- Miles Balance Entry

**Route**: `/onboarding-miles` (or integrated as step 2 within existing `/onboarding`)
**Layout**: SafeAreaView, ImageBackground, fixed footer
**Trigger**: Shown immediately after "Done" on card selection (Step 1), before navigating to main app

#### 4.3.1 Component Layout

```
+-----------------------------------------------+
|                                                 |
|  Set your current miles balances   <-- title    |
|  We'll track your earnings from    <-- subtitle |
|  here. You can update anytime.                  |
|                                                 |
|  +-------------------------------------------+ |
|  | [Airplane] KrisFlyer          [  28,500 ] | |
|  +-------------------------------------------+ |
|  | [Airplane] Citi Miles         [       0 ] | |
|  +-------------------------------------------+ |
|  | [Airplane] UNI$ (UOB)        [  12,000 ] | |
|  +-------------------------------------------+ |
|                                                 |
|                                                 |
|            I'll do this later                   |
|                                                 |
+-----------------------------------------------+
|  [         Save & Continue          ]           |
+-----------------------------------------------+
```

#### 4.3.2 Component Table

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Title | Text | `Typography.heading`, fontSize 26, `Colors.textPrimary` | "Set your current miles balances" |
| Subtitle | Text | `Typography.body`, fontSize 15, `Colors.textSecondary` | "We'll track your earnings from here. You can update anytime." |
| Program row container | View | backgroundColor `rgba(255, 255, 255, 0.85)`, height 56, paddingHorizontal `Spacing.lg` | Matches onboarding card row style |
| Program icon | Ionicons in LinearGradient circle | `airplane-outline`, size 18, white, circle 38x38 | Gold gradient `['#C5A55A', '#A8893E']` |
| Program name | Text | fontSize 15, fontWeight '400', `Colors.textPrimary` | e.g. "KrisFlyer" |
| Numeric input | TextInput | fontSize 16, fontWeight '600', `Colors.textPrimary`, textAlign 'right' | `keyboardType="numeric"`, placeholder "0", width 120 |
| Input container | View | `borderWidth: 1`, `borderColor: Colors.border`, `borderRadius: BorderRadius.sm`, paddingHorizontal `Spacing.sm`, height 36 | Right-aligned in row |
| Row separator | View | height 1, `rgba(197, 165, 90, 0.15)`, marginLeft `Spacing.lg` | Matches onboarding separator |
| Skip link | TouchableOpacity | Centered, `Typography.body`, `Colors.brandGold` | "I'll do this later" -- always visible below list |
| Save & Continue CTA | TouchableOpacity | `Colors.brandGold` fill, `BorderRadius.md`, height 48 | Fixed footer, matches onboarding "Done" button |
| CTA text | Text | `Typography.bodyBold`, `Colors.brandCharcoal` | "Save & Continue" |
| Footer container | View | Same as onboarding footer: `rgba(255, 255, 255, 0.7)`, borderTop `rgba(197, 165, 90, 0.2)` | Fixed at bottom |

#### 4.3.3 Behavior

- **Program list**: Only programs derived from cards selected in Step 1 appear. If user selected DBS Altitude and Citi PremierMiles, show KrisFlyer and Citi Miles only.
- **Input validation**: Numeric only; no decimals (miles are integers); max 10 digits; commas auto-inserted as user types (display-only, stored as integer).
- **Default values**: All fields default to 0 (placeholder text).
- **Skip behavior**: Tapping "I'll do this later" calls `completeOnboarding()` and navigates to `/(tabs)`. Balances default to 0 in `miles_balances`.
- **Save behavior**: Tapping "Save & Continue" upserts all non-zero values to `miles_balances`, calls `completeOnboarding()`, and navigates to `/(tabs)`.
- **Keyboard handling**: ScrollView adjusts for keyboard. "Done" on keyboard dismisses and advances to next field.

---

### 4.4 Update Balance Bottom Sheet (F14)

**Trigger**: "Update Balance" button on Program Detail Screen
**Presentation**: Modal bottom sheet, slides up from bottom

#### 4.4.1 Component Layout

```
+-----------------------------------------------+
|  ──────  (drag handle)                          |
|                                                 |
|  Update KrisFlyer Balance                       |
|                                                 |
|  Current balance: 28,500                        |
|                                                 |
|  New balance                                    |
|  +-------------------------------------------+ |
|  |                              30,950       | |
|  +-------------------------------------------+ |
|                                                 |
|  This replaces your manual baseline.            |
|  Auto-earned miles are added on top.            |
|                                                 |
|  [              Save              ]             |
+-----------------------------------------------+
```

#### 4.4.2 Component Table

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Drag handle | View | width 40, height 4, `Colors.border`, `BorderRadius.full`, centered | Standard bottom sheet handle |
| Sheet title | Text | `Typography.subheading`, `Colors.textPrimary` | "Update [Program] Balance" |
| Current balance | Text | `Typography.body`, `Colors.textSecondary` | "Current balance: 28,500" |
| Input label | Text | `Typography.captionBold`, `Colors.textSecondary`, uppercase | "New balance" |
| Numeric input | TextInput | fontSize 20, fontWeight '600', `Colors.textPrimary`, textAlign 'right' | `keyboardType="numeric"`, auto-focus |
| Input border | View | `borderWidth: 1`, `borderColor: Colors.border`, `borderRadius: BorderRadius.md`, height 48, paddingHorizontal `Spacing.lg` | Focused state: `borderColor: Colors.brandGold` |
| Helper text | Text | `Typography.caption`, `Colors.textTertiary` | "This replaces your manual baseline. Auto-earned miles are added on top." |
| Save CTA | TouchableOpacity | `Colors.brandGold` fill, `BorderRadius.md`, height 48, full width | Disabled if input is empty or unchanged |
| Save text | Text | `Typography.bodyBold`, `Colors.brandCharcoal` | "Save" |
| Sheet background | View | `Colors.surface`, `borderTopLeftRadius: BorderRadius.lg`, `borderTopRightRadius: BorderRadius.lg` | White background with rounded top corners |
| Backdrop | TouchableOpacity | `rgba(0, 0, 0, 0.3)`, fills screen behind sheet | Tap to dismiss |

---

### 4.5 Log Redemption Bottom Sheet (F15)

**Trigger**: "Log Redemption" button on Program Detail Screen
**Presentation**: Modal bottom sheet

#### 4.5.1 Component Layout

```
+-----------------------------------------------+
|  ──────  (drag handle)                          |
|                                                 |
|  Log KrisFlyer Redemption                       |
|                                                 |
|  Miles redeemed                                 |
|  +-------------------------------------------+ |
|  |                              42,000       | |
|  +-------------------------------------------+ |
|                                                 |
|  What did you redeem for?                       |
|  +-------------------------------------------+ |
|  |  SIN to NRT Business Class                | |
|  +-------------------------------------------+ |
|                                                 |
|  Date                                           |
|  +-------------------------------------------+ |
|  |  20 Feb 2026                          [v] | |
|  +-------------------------------------------+ |
|                                                 |
|  [          Log Redemption          ]           |
+-----------------------------------------------+
```

#### 4.5.2 Component Table

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Sheet title | Text | `Typography.subheading`, `Colors.textPrimary` | "Log [Program] Redemption" |
| Miles input label | Text | `Typography.captionBold`, `Colors.textSecondary`, uppercase | "Miles redeemed" |
| Miles input | TextInput | Same style as Update Balance input | `keyboardType="numeric"`, required |
| Description label | Text | `Typography.captionBold`, `Colors.textSecondary`, uppercase | "What did you redeem for?" |
| Description input | TextInput | `Typography.body`, `Colors.textPrimary`, height 44 | Placeholder: "e.g. SIN to NRT Business Class", max 100 chars |
| Date label | Text | `Typography.captionBold`, `Colors.textSecondary`, uppercase | "Date" |
| Date picker | TouchableOpacity | Same input border style, with calendar icon right-aligned | Opens system date picker; defaults to today |
| Calendar icon | Ionicons | `calendar-outline`, size 18, `Colors.textTertiary` | Right edge of date input |
| Log CTA | TouchableOpacity | `Colors.brandGold` fill, `BorderRadius.md`, height 48 | Disabled until miles amount > 0 |
| CTA text | Text | `Typography.bodyBold`, `Colors.brandCharcoal` | "Log Redemption" |
| Validation error | Text | `Typography.caption`, `Colors.danger` | "Miles amount cannot exceed your current balance" |

#### 4.5.3 Celebration State

After successfully logging a redemption:

1. **Haptic feedback**: Light impact (iOS) / vibration (Android).
2. **Confetti animation**: Brief gold-tinted confetti burst (300ms) using `react-native-reanimated` or a lightweight confetti library.
3. **Success message**: Bottom sheet content replaces with centered checkmark icon (`checkmark-circle`, size 48, `Colors.brandGold`) + "Redemption logged!" text + balance after deduction.
4. **Auto-dismiss**: Sheet dismisses after 1.5 seconds, or user taps to dismiss immediately.

---

### 4.6 Set Goal Bottom Sheet (F16)

**Trigger**: "Set a Goal" button or "Edit" button on Program Detail Screen
**Presentation**: Modal bottom sheet

#### 4.6.1 Component Layout

```
+-----------------------------------------------+
|  ──────  (drag handle)                          |
|                                                 |
|  Set KrisFlyer Goal                             |
|                                                 |
|  Target miles                                   |
|  +-------------------------------------------+ |
|  |                              63,000       | |
|  +-------------------------------------------+ |
|                                                 |
|  What's this goal for?                          |
|  +-------------------------------------------+ |
|  |  Tokyo Business Class                     | |
|  +-------------------------------------------+ |
|                                                 |
|  [            Save Goal             ]           |
|                                                 |
|  [Delete Goal]         (only if editing)        |
+-----------------------------------------------+
```

#### 4.6.2 Component Table

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Sheet title | Text | `Typography.subheading`, `Colors.textPrimary` | "Set [Program] Goal" or "Edit [Program] Goal" |
| Target input label | Text | `Typography.captionBold`, `Colors.textSecondary`, uppercase | "Target miles" |
| Target input | TextInput | Same style as other numeric inputs | `keyboardType="numeric"`, required, min 1,000 |
| Description label | Text | `Typography.captionBold`, `Colors.textSecondary`, uppercase | "What's this goal for?" |
| Description input | TextInput | `Typography.body`, height 44 | Placeholder: "e.g. Tokyo Business Class", max 80 chars |
| Save CTA | TouchableOpacity | `Colors.brandGold` fill, height 48 | Disabled until target > current balance |
| Delete link | TouchableOpacity | `Typography.body`, `Colors.danger`, centered | Shows confirmation alert before deleting |

#### 4.6.3 Goal Progress Display (on Program Detail Screen)

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Goal container | GlassCard | Standard GlassCard wrapper | Contains all goal elements |
| Goal title | Text | `Typography.bodyBold`, `Colors.textPrimary` | e.g. "Tokyo Business Class" |
| Edit button | TouchableOpacity | `Typography.caption`, `Colors.brandGold` | "Edit" -- right-aligned in title row |
| Progress bar track | View | height 10, `Colors.borderLight`, `BorderRadius.full` | Full width |
| Progress bar fill | View | height 10, `Colors.brandGold`, `BorderRadius.full` | Width = `(balance / target) * 100%`, max 100% |
| Progress text | Text | `Typography.caption`, `Colors.textSecondary` | "30,950 / 42,000 miles" |
| Percentage badge | Text | `Typography.captionBold`, `Colors.brandGold` | "73%" right of progress bar |
| Projected date | View | Ionicons `time-outline` size 14 + `Typography.caption`, `Colors.textSecondary` | "Projected: May 2026" |
| Projection method | -- | -- | Based on 3-month average earning velocity: `(target - balance) / avg_monthly_earned`. If < 1 month of data, show "Need more data to project." |

#### 4.6.4 Goal Achieved Celebration State

When `balance >= target`:

- Progress bar fill becomes 100% with a subtle pulsing animation (opacity oscillates 0.8 - 1.0).
- Text changes to "Goal Achieved!" in `Colors.brandGold`, `Typography.bodyBold`.
- Checkmark circle icon (`checkmark-circle`, size 24, `Colors.brandGold`) appears left of text.
- One-time celebration: gold confetti burst on first render where achieved.
- The goal card gets a subtle gold shimmer border: `borderColor: 'rgba(197, 165, 90, 0.4)'`.

---

### 4.7 Miles Tab Icon & Tab Bar Update

The tab bar in `_layout.tsx` must be updated to include the Miles tab.

#### 4.7.1 Tab Configuration

```typescript
<Tabs.Screen
  name="miles"
  options={{
    title: 'Miles',
    headerTitle: () => (
      <Image
        source={require('../../assets/Name.png')}
        style={{ height: 28, width: 120 }}
        resizeMode="contain"
      />
    ),
    tabBarIcon: ({ color, size, focused }) => (
      <Ionicons
        name={focused ? 'airplane' : 'airplane-outline'}
        size={size}
        color={color}
      />
    ),
  }}
/>
```

#### 4.7.2 Tab Order

| Position | Tab | Icon (active / inactive) |
|----------|-----|-------------------------|
| 1 | Recommend | `compass` / `compass-outline` |
| 2 | My Cards | `card` / `card-outline` |
| 3 | Cap Status | `bar-chart` / `bar-chart-outline` |
| 4 | Log | `add-circle` / `add-circle-outline` |
| 5 | Miles | `airplane` / `airplane-outline` |

Profile access moves to a header-right icon (`person-circle-outline`) consistent across all screens. Alternatively, if 6 tabs is acceptable, Profile remains and Miles is inserted at position 5 with Profile at position 6. The final decision should be validated through user testing (see Section 8).

---

### 4.8 Segmented Control — "My Miles" | "My Points" (F18)

**Position**: Below screen title and subtitle, above hero section
**Behavior**: Switches between Layer 1 (airline programs) and Layer 2 (bank programs)

#### 4.8.1 Component Layout

```
+-----------------------------------------------+
|                                                 |
|  Miles Portfolio              <-- screen title  |
|  Your loyalty program balances  <-- subtitle    |
|                                                 |
|  +-------------------------------------------+ |
|  | [  My Miles  ] [  My Points  ]            | |  <-- Segmented Control
|  +-------------------------------------------+ |
|                                                 |
|  +-------------------------------------------+ |
|  |          HERO SECTION                      | |  <-- Updates per segment
|  |        142,850                             | |
|  |  total miles across 4 airline programs     | |
|  +-------------------------------------------+ |
|                                                 |
|  [Layer-specific content below...]              |
|                                                 |
+-----------------------------------------------+
```

#### 4.8.2 Component Table

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Control container | View | `backgroundColor: 'rgba(255, 255, 255, 0.65)'`, `borderRadius: BorderRadius.full` (pill), `borderWidth: 1`, `borderColor: 'rgba(197, 165, 90, 0.15)'`, height 40, padding 3 | Glassmorphic pill container |
| Active segment | View | `backgroundColor: Colors.brandGold`, `borderRadius: BorderRadius.full`, height 34 | Gold pill background behind active text |
| Active text | Text | `Typography.captionBold`, `Colors.brandCharcoal` (#2D3748) | White on gold is low contrast; use charcoal |
| Inactive text | Text | `Typography.captionBold`, `Colors.textSecondary` | Tappable; 44px minimum touch height (container provides this) |
| Segment switch animation | Animated.View | 200ms spring transition, `useNativeDriver: true` | Gold pill slides horizontally to active segment |
| Container spacing | View | `marginBottom: Spacing.lg` (16px) | Gap between control and hero |

#### 4.8.3 Behavior

- **Default state**: "My Miles" active on first load
- **Segment persistence**: Active segment remembered within session (via `useState`). Resets to "My Miles" on app relaunch.
- **Scroll reset**: Content ScrollView scrolls to top (offset 0) on segment switch
- **Hero update**: Hero section totals and subtitle text update immediately on switch:
  - "My Miles": `{totalAirlineMiles} total miles across {n} airline programs`
  - "My Points": `{totalBankPoints} total points across {n} bank programs`
- **Data fetch**: Both layers share the same `useFocusEffect` data fetch. Layer 1 filters `program_type = 'airline'`; Layer 2 filters `program_type IN ('bank_points', 'transferable')`. Use `get_miles_portfolio(user_id, type_filter)` RPC.
- **Lazy rendering**: Only render the active layer's content. Use conditional rendering (`activeSegment === 'miles' ? <Layer1/> : <Layer2/>`), not tab-based navigation.

#### 4.8.4 Accessibility

- `accessibilityRole="tablist"` on container
- Each segment: `accessibilityRole="tab"`, `accessibilityState={{ selected: isActive }}`
- `accessibilityLabel="My Miles, {n} airline programs"` / `"My Points, {n} bank programs"`
- Minimum touch target: entire segment area is 44pt tall (container height 40 + padding)

---

### 4.9 Layer 1 — "My Miles" Airline Program Cards (F18)

**Active when**: "My Miles" segment selected (default)
**Data source**: `get_miles_portfolio(user_id, 'airline')` + `get_potential_miles(user_id, program_id)` per airline

#### 4.9.1 Component Layout

```
+-----------------------------------------------+
|                                                 |
|  +-------------------------------------------+ |
|  | [Airplane] KrisFlyer                       | |
|  |   Singapore Airlines                       | |
|  |                                            | |
|  |   Confirmed    30,950          [gold bold] | |
|  |   ┆ Potential  +20,000         [lighter]   | |  <-- dashed left border
|  |   ─────────────────────                    | |
|  |   Total         50,950         [gold bold] | |
|  |                                          > | |
|  +-------------------------------------------+ |
|                                                 |
|  +-------------------------------------------+ |
|  | [Airplane] Asia Miles                      | |
|  |   Cathay Pacific                           | |
|  |                                            | |
|  |   Confirmed    12,000          [gold bold] | |
|  |   ┆ Potential  +14,000         [lighter]   | |
|  |   ─────────────────────                    | |
|  |   Total         26,000         [gold bold] | |
|  |                                          > | |
|  +-------------------------------------------+ |
|                                                 |
+-----------------------------------------------+
```

#### 4.9.2 Airline Program Card — Component Table

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Card container | TouchableOpacity | Same glassmorphic style as existing MilesProgramCard | Tappable → navigates to Program Detail |
| Icon circle | LinearGradient | `['#C5A55A', '#A8893E']`, 38x38, `airplane-outline` size 22 white | Same as existing |
| Program name | Text | `Typography.bodyBold`, `Colors.textPrimary` | "KrisFlyer" |
| Airline name | Text | `Typography.caption`, `Colors.textSecondary` | "Singapore Airlines" — shown below program name |
| Confirmed miles label | Text | `Typography.caption`, `Colors.textSecondary` | "Confirmed" — left aligned |
| Confirmed miles value | Text | `Typography.bodyBold`, `Colors.brandGold` | Comma-formatted. This is `display_total` from get_miles_portfolio |
| Potential miles container | View | `borderLeftWidth: 2`, `borderLeftColor: 'rgba(197, 165, 90, 0.3)'` (dashed gold), `paddingLeft: Spacing.sm`, `opacity: 0.75` | Visual distinction for "not yet transferred" |
| Potential miles label | Text | `Typography.caption`, `Colors.textSecondary` | "Potential" |
| Potential miles value | Text | `Typography.body`, `Colors.brandGold`, `opacity: 0.7` | "+20,000" with plus prefix. From `get_potential_miles` total |
| "potential" tag | View | `backgroundColor: 'rgba(197, 165, 90, 0.12)'`, `borderRadius: BorderRadius.full`, paddingHorizontal 6, paddingVertical 2 | Inline pill tag next to potential value |
| "potential" tag text | Text | `Typography.label`, fontSize 10, `Colors.brandGold` | "POTENTIAL" |
| Divider | View | height 1, `Colors.borderLight`, marginVertical `Spacing.xs` | Between potential and total |
| Total miles label | Text | `Typography.captionBold`, `Colors.textPrimary` | "Total" |
| Total miles value | Text | `Typography.bodyBold`, `Colors.brandGold` | confirmed + potential, comma-formatted |
| Chevron | Ionicons | `chevron-forward`, 18, `Colors.textTertiary` | Right edge |

#### 4.9.3 Potential Miles Expansion (Tap to Reveal)

When user taps the "Potential" line, an expansion reveals the breakdown:

```
   ┆ Potential  +20,000  [POTENTIAL]     [tap to expand]
   ┆   ├─ DBS Points: 50,000 × 2/5 = 20,000 miles
   ┆   └─ HSBC Rewards: 30,000 × 10/30 = 10,000 miles
```

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Expansion container | Animated.View | Height animates from 0 to content height, 200ms | Smooth reveal |
| Source row | View | `paddingLeft: Spacing.xl`, flexDirection 'row' | Indented under potential |
| Source name | Text | `Typography.caption`, `Colors.textSecondary` | "DBS Points:" |
| Conversion math | Text | `Typography.caption`, `Colors.textTertiary` | "50,000 × 2/5 = 20,000 miles" |
| Tree lines | Text | `Typography.caption`, `Colors.textTertiary` | "├─" and "└─" for visual hierarchy |

#### 4.9.4 Card Visibility Rules

- Show airline program if user has **any** of:
  - Manual balance > 0 for this airline program
  - Auto-earned > 0 (has cards that directly earn this airline's miles)
  - Potential miles > 0 (has bank points that can transfer to this airline)
- Do NOT show an airline if user has zero connection to it
- If confirmed = 0 but potential > 0, still show the card (user can transfer to reach this airline)
- Cards sorted by total (confirmed + potential) descending

#### 4.9.5 Empty State (Layer 1)

When no airline programs are visible:

| Component | Value |
|-----------|-------|
| Icon | `airplane-outline`, size 48, `Colors.textTertiary` |
| Title | "No airline programs yet" |
| Description | "Add cards to see which airlines your points can reach." |

Uses inline empty state (Text elements centered in content area), not the full-screen `EmptyState` component.

---

### 4.10 Layer 2 — "My Points" Bank Program Cards (F18/F19)

**Active when**: "My Points" segment selected
**Data source**: `get_miles_portfolio(user_id, 'bank_points')` + `get_transfer_options(program_id)` per bank

#### 4.10.1 Component Layout

```
+-----------------------------------------------+
|                                                 |
|  +-------------------------------------------+ |
|  | [Lightbulb] Your 50,000 DBS Points could  | |  <-- Transfer Nudge (F20)
|  | become 20,000 KrisFlyer miles              | |
|  |                [View Options]          [X] | |
|  +-------------------------------------------+ |
|                                                 |
|  +-------------------------------------------+ |
|  | [Card] DBS Points                 50,000  >| |
|  |                                            | |
|  |  Transfer Options                          | |
|  |  +---------------------------------------+| |
|  |  | [Airplane] KrisFlyer                   || |
|  |  | 5 pts → 2 miles · 20,000 miles         || |
|  |  |                         [Transfer >]   || |
|  |  +---------------------------------------+| |
|  |  | [Airplane] Asia Miles                  || |
|  |  | 5 pts → 2 miles · 20,000 miles         || |
|  |  |                         [Transfer >]   || |
|  |  +---------------------------------------+| |
|  |  | [Airplane] Qantas FF                   || |
|  |  | 5 pts → 2 miles · 20,000 miles         || |
|  |  |                         [Transfer >]   || |
|  |  +---------------------------------------+| |
|  +-------------------------------------------+ |
|                                                 |
|  +-------------------------------------------+ |
|  | [Card] BOC Points                 15,000  >| |
|  |                                            | |
|  |  Transfer Options                          | |
|  |  +---------------------------------------+| |
|  |  | [Airplane] KrisFlyer                   || |
|  |  | 5 pts → 1 mile · 3,000 miles           || |
|  |  | Fee: S$30.56                           || |
|  |  |                         [Transfer >]   || |
|  |  +---------------------------------------+| |
|  +-------------------------------------------+ |
|                                                 |
+-----------------------------------------------+
```

#### 4.10.2 Bank Points Card — Component Table

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Card container | View | Same glassmorphic card style, but taller to accommodate transfer list | Not the whole card is tappable — header area taps to detail, options have own CTAs |
| Card header area | TouchableOpacity | flexDirection 'row', alignItems 'center', paddingBottom `Spacing.sm` | Taps to Program Detail screen |
| Icon circle | LinearGradient | `['#C5A55A', '#A8893E']`, 38x38, **`card-outline`** size 22 white | Card icon (not airplane) for bank programs |
| Program name | Text | `Typography.bodyBold`, `Colors.textPrimary` | "DBS Points" |
| Balance | Text | `Typography.bodyBold`, `Colors.brandGold` | Right-aligned, comma-formatted |
| Chevron | Ionicons | `chevron-forward`, 18, `Colors.textTertiary` | On header row only |
| Section label | Text | `Typography.captionBold`, `Colors.textSecondary`, uppercase, letterSpacing 0.5 | "TRANSFER OPTIONS" |
| Transfer option row | View | `paddingVertical: Spacing.sm`, `borderTopWidth: 1`, `borderTopColor: Colors.borderLight` | One per destination airline |
| Destination icon | Ionicons | `airplane-outline`, size 16, `Colors.textSecondary` | Left of airline name |
| Destination name | Text | `Typography.body`, `Colors.textPrimary` | "KrisFlyer" |
| Rate display | Text | `Typography.caption`, `Colors.textSecondary` | "5 pts → 2 miles" — uses arrow character (→) |
| Resulting miles | Text | `Typography.captionBold`, `Colors.brandGold` | Calculated: `FLOOR(balance * rate_to / rate_from)` |
| Transfer fee | Text | `Typography.caption`, `Colors.danger` | "Fee: S$30.56" — only shown when `transfer_fee_sgd` is not null |
| Transfer CTA | TouchableOpacity | `Typography.captionBold`, `Colors.brandGold`, flexDirection 'row', alignItems 'center' | "Transfer >" — opens bank URL via `Linking.openURL` |
| No transfer options | Text | `Typography.caption`, `Colors.textTertiary`, italic | "No transfer options available" — shown if bank has 0 partners |

#### 4.10.3 Transfer Options Sorting

- Sorted by **points-per-mile ratio** ascending (best value first): `conversion_rate_from / conversion_rate_to`
- If tied, sort alphabetically by destination airline name
- Show all seeded transfer partners (no limit in v1)

#### 4.10.4 Card Sorting

- Bank program cards sorted by **total balance** descending (highest points first)
- Zero-balance bank programs that the user has cards for still appear (with "0" balance)

#### 4.10.5 Empty State (Layer 2)

When no bank programs are visible:

| Component | Value |
|-----------|-------|
| Icon | `card-outline`, size 48, `Colors.textTertiary` |
| Title | "No bank points programs" |
| Description | "Add cards to see your bank reward point balances and transfer options." |

---

### 4.11 Transfer Nudge Card (F20)

**Position**: Top of Layer 2 "My Points" content, above first bank program card
**Visibility**: Only when Layer 2 is active AND conditions met

#### 4.11.1 Component Layout

```
+-----------------------------------------------+
| [Lightbulb]                               [X] |
|                                                |
| Your 50,000 DBS Points could become            |
| 20,000 KrisFlyer miles                         |
|                                                |
|              [View Options]                    |
+-----------------------------------------------+
```

#### 4.11.2 Component Table

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Card container | View | `backgroundColor: 'rgba(255, 255, 255, 0.75)'`, `borderRadius: BorderRadius.xl`, `borderWidth: 1`, `borderColor: 'rgba(197, 165, 90, 0.3)'` (stronger gold border), padding `Spacing.lg`, `marginBottom: Spacing.md` | Slightly more prominent than standard cards |
| Lightbulb icon | Ionicons | `bulb-outline`, size 24, `Colors.brandGold` | Top-left, conveys "suggestion" |
| Dismiss button | TouchableOpacity | `close-outline`, size 20, `Colors.textTertiary`, 44x44 touch target | Top-right. Hides nudge for session |
| Message text | Text | `Typography.body`, `Colors.textPrimary` | "Your {balance} {program} could become {potential} {airline} miles" |
| Balance highlight | Text | `Typography.bodyBold`, `Colors.brandGold` | Inline bold for the numbers within message |
| "View Options" CTA | TouchableOpacity | `Typography.captionBold`, `Colors.brandGold`, `borderWidth: 1`, `borderColor: Colors.brandGold`, `borderRadius: BorderRadius.full`, paddingHorizontal `Spacing.lg`, paddingVertical `Spacing.sm` | Outlined gold pill button. Scrolls to relevant bank card |

#### 4.11.3 Nudge Logic

| Rule | Specification |
|------|---------------|
| Trigger | User has bank points balance > 0 in any program |
| Suggestion selection | Pick the bank program with the highest balance. For destination, prefer airline where user has highest existing balance or most active goals; fallback to best conversion rate |
| Frequency | Max 1 nudge per session (app launch / tab focus). If dismissed, stays hidden until next session |
| Dismiss behavior | `useState(false)` flag — not persisted to DB. Resets on app relaunch |
| "View Options" action | `scrollViewRef.current.scrollTo({ y: targetCardOffset, animated: true })` — scrolls to the bank program card that was mentioned in the nudge |
| No nudge scenarios | User has 0 bank points; User has no bank programs; nudge already dismissed this session |

#### 4.11.4 Accessibility

- `accessibilityRole="alert"` on container (announces as important information)
- Dismiss button: `accessibilityLabel="Dismiss transfer suggestion"`
- View Options: `accessibilityLabel="View transfer options for {program}"`

---

### 4.12 Updated Hero Section Behavior (F18)

The existing `MilesHeroSection` component gains context-awareness per active segment.

#### 4.12.1 Hero States

| Active Segment | Total Value | Subtitle | Chips |
|----------------|-------------|----------|-------|
| "My Miles" | Sum of (confirmed + potential) across all visible airline programs | "total miles across {n} airline program{s}" | Same as existing: monthly earned, miles saved, top card |
| "My Points" | Sum of all bank points balances | "total points across {n} bank program{s}" | Simplified: only show monthly earned chip (no "miles saved" — less meaningful for bank points) |

#### 4.12.2 Transition

- Number animates between values using a 400ms count-up/count-down animation (Animated.Value interpolation)
- Subtitle text changes immediately (no animation)
- Respect `isReduceMotionEnabled` — skip number animation if true

### 4.13 Eligibility Badge Component (F22)

**Purpose**: Visual indicator for restricted cards (gender, age, income, banking-tier requirements).
**Position**: Inline within card list items (card browser, recommendation results) and card detail header.
**Visibility**: Only on cards with non-NULL `eligibility_criteria` JSONB. Unrestricted cards show no badge.

#### 4.13.1 Component Layout

```
Card list item:
+--------------------------------------------------+
| [icon] DBS Vantage Visa Infinite                  |
| 1.5 / 2.2 mpd          [Income ≥ S$120k]         |  ← gold pill badge, right-aligned
| Annual Fee: S$600                                 |
+--------------------------------------------------+

Card detail header:
+--------------------------------------------------+
| ← Back                       [MaxiMile Logo]     |
|                                                    |
| DBS Vantage Visa Infinite  [Income ≥ S$120k]     |  ← badge inline with title
| 1.5 / 2.2 mpd (uncapped)                         |
+--------------------------------------------------+
```

#### 4.13.2 Badge Variants

| Variant | Label | Background | Text Color | Icon | Criteria Source |
|---------|-------|------------|------------|------|-----------------|
| Gender | "Women Only" | `rgba(233, 30, 140, 0.12)` | `#E91E8C` | `female-outline` (size 12) | `{"gender": "female"}` |
| Age | "Ages 21-39" | `rgba(74, 144, 217, 0.12)` | `#4A90D9` (Colors.primaryLight) | `calendar-outline` (size 12) | `{"age_min": 21, "age_max": 39}` |
| Income | "Income ≥ S$120k" | `rgba(197, 165, 90, 0.12)` | `#C5A55A` (Colors.brandGold) | `cash-outline` (size 12) | `{"min_income": 120000}` |
| Banking | "Priority Banking" | `rgba(123, 97, 255, 0.12)` | `#7B61FF` | `shield-outline` (size 12) | `{"banking_tier": "priority_banking"}` |
| Banking (Premier) | "Premier Banking" | `rgba(123, 97, 255, 0.12)` | `#7B61FF` | `shield-outline` (size 12) | `{"banking_tier": "premier"}` |
| Banking (Treasures) | "DBS Treasures" | `rgba(197, 165, 90, 0.12)` | `#C5A55A` | `diamond-outline` (size 12) | `{"banking_tier": "treasures"}` |

#### 4.13.3 Component Table

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Badge container | View | `flexDirection: 'row'`, `alignItems: 'center'`, `borderRadius: BorderRadius.full`, `paddingHorizontal: Spacing.sm` (8px), `paddingVertical: 2`, `alignSelf: 'flex-start'` | Pill shape. Background color varies per variant |
| Badge icon | Ionicons | Variant-specific, size 12, same color as text | Leading icon, `marginRight: 3` |
| Badge text | Text | `fontSize: 11`, `fontWeight: '600'`, `lineHeight: 16` | Color matches variant. No wrapping — single line |
| Touch wrapper | TouchableOpacity | `activeOpacity: 0.7`, min touch target 44x22 | Wraps badge. Tap opens tooltip (4.14) |
| Height | — | 22px total | Fixed height for consistent alignment |

#### 4.13.4 Placement Rules

| Context | Position | Alignment |
|---------|----------|-----------|
| Card list item (card browser) | Right side of subtitle row, vertically centered with earn rate text | `position: 'absolute', right: Spacing.lg, top: '50%', transform: [{translateY: -11}]` or flexbox `alignItems: 'center'` in row |
| Card detail header | Inline after card name, same row | `marginLeft: Spacing.sm`, wrapped in `flexDirection: 'row', flexWrap: 'wrap'` with title |
| Recommendation result card | Below card name, before earn rate | `marginTop: Spacing.xs` |
| No restriction | No badge rendered | Component returns `null` |

#### 4.13.5 Animation

- **Entrance**: `fadeIn` 200ms on mount (Animated.timing, `useNativeDriver: true`)
- **Reduced motion**: No animation, render immediately

#### 4.13.6 Accessibility

- `accessibilityRole="button"` (tappable)
- `accessibilityLabel="{variant label} — tap for eligibility details"`
- `accessibilityHint="Shows eligibility requirements for this card"`

---

### 4.14 Eligibility Tooltip (F22)

**Purpose**: Expandable detail overlay shown when user taps an eligibility badge.
**Trigger**: Tap on any EligibilityBadge component.
**Dismiss**: Tap outside tooltip, tap badge again, or scroll.

#### 4.14.1 Component Layout

```
Badge tapped:
    [Income ≥ S$120k]  ← badge (tapped, highlighted)
    ┌─────────────────────────────────────────┐
    │ Eligibility Requirements                │
    │                                          │
    │ • Minimum annual income: S$120,000       │
    │ • DBS Treasures banking tier recommended │
    │                                          │
    │ This card may require a banking          │
    │ relationship with the issuer.            │
    └─────────────────────────────────────────┘

Multiple criteria (e.g., SC Beyond):
    [Priority Banking]  ← badge
    ┌─────────────────────────────────────────┐
    │ Eligibility Requirements                │
    │                                          │
    │ • Standard Chartered Priority Banking    │
    │   relationship required                  │
    │ • Higher earn rates available for        │
    │   Priority Banking customers             │
    └─────────────────────────────────────────┘
```

#### 4.14.2 Component Table

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Tooltip container | Animated.View | `backgroundColor: 'rgba(255, 255, 255, 0.85)'`, `borderRadius: BorderRadius.xl` (16px), `borderWidth: 1`, `borderColor: 'rgba(197, 165, 90, 0.2)'`, padding `Spacing.lg`, `shadowOpacity: 0.1`, `shadowRadius: 16`, `elevation: 4`, `maxWidth: 280` | Glassmorphic card. Positioned below badge (or above if near screen bottom) |
| Backdrop | TouchableOpacity | `position: 'absolute'`, fullscreen, `backgroundColor: 'transparent'` | Invisible overlay. Tap dismisses tooltip |
| Title text | Text | `Typography.captionBold`, `Colors.textPrimary`, `marginBottom: Spacing.sm` | "Eligibility Requirements" |
| Bullet row | View | `flexDirection: 'row'`, `marginBottom: Spacing.xs` | Each requirement as a bullet |
| Bullet dot | Text | `Typography.caption`, `Colors.textSecondary`, `marginRight: Spacing.sm` | "•" character |
| Bullet text | Text | `Typography.caption`, `Colors.textSecondary`, `flex: 1` | Wrapping text for requirement detail |
| Footer note | Text | `Typography.caption`, `Colors.textTertiary`, `marginTop: Spacing.sm`, `fontStyle: 'italic'` | Optional contextual note (e.g., "This card may require...") |

#### 4.14.3 Tooltip Content per Variant

| Variant | Bullet Points | Footer Note |
|---------|--------------|-------------|
| Gender ("Women Only") | "This card is exclusively available to female applicants" | "Application requires gender verification" |
| Age ("Ages 21-39") | "Applicant must be between 21 and 39 years old at time of application" | "Age eligibility is verified during application" |
| Income ("Income ≥ S$120k") | "Minimum annual income: S${amount}", "Banking tier: {tier} (if applicable)" | "Income verification required during application" |
| Banking ("Priority Banking") | "{Bank} Priority Banking relationship required", "Higher earn rates available for Priority Banking customers" | "Contact your bank for Priority Banking eligibility" |
| Banking ("Premier") | "HSBC Premier banking relationship required", "Annual fee typically waived for Premier customers" | "Premier banking requires minimum AUM" |
| Banking ("Treasures") | "DBS Treasures banking tier required", "Minimum assets under management apply" | "Contact DBS for Treasures eligibility" |

#### 4.14.4 Positioning Logic

```
1. Measure badge position on screen (onLayout / measure)
2. Calculate available space below badge
3. If space > tooltip height + 8px → position BELOW badge
4. Else → position ABOVE badge
5. Horizontal: align left edge with badge, clamped to screen bounds (Spacing.lg from edges)
```

#### 4.14.5 Animation

- **Enter**: `Animated.parallel([fadeIn(200ms), translateY(8→0, 200ms)])` — fade + slight slide
- **Exit**: `Animated.parallel([fadeOut(150ms), translateY(0→4, 150ms)])`
- **Reduced motion**: Instant show/hide, no animation

#### 4.14.6 Accessibility

- `accessibilityRole="tooltip"`
- `accessibilityLiveRegion="polite"` (announces content on appearance)
- `accessibilityLabel="Eligibility requirements: {all bullet text concatenated}"`
- Dismiss: `accessibilityHint="Tap anywhere to dismiss"`

---

### 4.15 Rate Change Notification Banner (F23)

**Purpose**: Alert users about rate changes (devaluations, cap adjustments, positive changes) that affect their cards.
**Position**: Top of home screen (Recommend tab), below header, above category tiles.
**Visibility**: Only when unread rate changes exist that affect at least one of the user's active cards.

#### 4.15.1 Component Layout — Single Alert

```
Critical (devaluation):
┌─────────────────────────────────────────────┐
│ ▌ [⚠] Rate Alert: Amex MR Devaluation      │
│ ▌     Transfer rates increased 22-50%       │
│ ▌     [View Details]          [Dismiss ✕]   │
└─────────────────────────────────────────────┘
  ↑ 4px red left border

Warning (cap adjustment):
┌─────────────────────────────────────────────┐
│ ▌ [⚡] Cap Change: DBS Woman's World Card   │
│ ▌     4 mpd cap reduced S$1,500 → S$1,000  │
│ ▌     [View Details]          [Dismiss ✕]   │
└─────────────────────────────────────────────┘
  ↑ 4px amber left border

Info (positive change):
┌─────────────────────────────────────────────┐
│ ▌ [ℹ] HSBC Revolution: Bonus cap boosted   │
│ ▌     Monthly cap increased to S$1,500      │
│ ▌     [View Details]          [Dismiss ✕]   │
└─────────────────────────────────────────────┘
  ↑ 4px blue left border
```

#### 4.15.2 Component Layout — Multiple Alerts

```
┌─────────────────────────────────────────────┐
│ ▌ [🔔] 3 rate changes affect your cards     │
│ ▌     [View All]              [Dismiss ✕]   │
└─────────────────────────────────────────────┘
  ↑ 4px amber left border (default for multi)
```
- Threshold: ≥3 unread alerts → collapse into multi-alert banner
- "View All" navigates to a rate changes list screen
- Dismiss marks all as read

#### 4.15.3 Severity Variants

| Severity | Left Border | Icon | Icon Color | Use Case |
|----------|-------------|------|------------|----------|
| `critical` | `#EA4335` (Colors.danger) | `alert-circle` (filled) | `#EA4335` | Devaluations, rate cuts, program terminations |
| `warning` | `#FBBC04` (Colors.warning) | `warning` (filled) | `#FBBC04` | Cap adjustments, condition changes |
| `info` | `#4A90D9` (Colors.primaryLight) | `information-circle` (filled) | `#4A90D9` | Rate improvements, new bonuses |

#### 4.15.4 Component Table

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Banner container | Animated.View | `backgroundColor: 'rgba(255, 255, 255, 0.75)'`, `borderRadius: BorderRadius.xl` (16px), `borderWidth: 1`, `borderColor: 'rgba(197, 165, 90, 0.15)'`, `borderLeftWidth: 4`, `borderLeftColor: {severity color}`, padding `Spacing.md` (12px), `marginHorizontal: Spacing.xl` (24px), `marginBottom: Spacing.md` | Glassmorphic card with colored left border |
| Severity icon | Ionicons | Variant-specific, size 20 | `marginRight: Spacing.sm`, color matches severity |
| Title text | Text | `Typography.bodyBold`, `Colors.textPrimary` | "Rate Alert: {card/program name}" or "3 rate changes affect your cards" |
| Detail text | Text | `Typography.caption`, `Colors.textSecondary`, `marginTop: 2` | Single-line summary of the change |
| "View Details" CTA | TouchableOpacity | `Typography.captionBold`, severity color, `borderWidth: 1`, `borderColor: {severity}`, `borderRadius: BorderRadius.full`, `paddingHorizontal: Spacing.md`, `paddingVertical: Spacing.xs` | Outlined pill. Navigates to card detail (single) or list (multi) |
| "Dismiss" button | TouchableOpacity | `close-outline`, size 18, `Colors.textTertiary`, min 44x44 touch target | Marks alert as read. `accessibilityLabel="Dismiss alert"` |
| Content row | View | `flexDirection: 'row'`, `alignItems: 'flex-start'` | Icon + text group |
| Actions row | View | `flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'center'`, `marginTop: Spacing.sm` | CTA left, dismiss right |

#### 4.15.5 Animation

- **Entrance**: Slide down from top, 300ms spring animation (`Animated.spring({ tension: 100, friction: 12 })`)
- **Exit (dismiss)**: Slide up + fade out, 200ms ease-out
- **Multi-alert stacking**: Latest alert slides in as previous slides out (cross-fade, 250ms)
- **Reduced motion**: Instant show/hide, no slide

#### 4.15.6 Banner Logic

| Rule | Specification |
|------|---------------|
| Trigger | Unread rate changes exist where `card_id IN user's active cards` AND `read_at IS NULL` |
| Multi-alert threshold | ≥3 unread alerts → show collapsed "N rate changes" banner |
| <3 alerts | Show most severe unread alert as single banner |
| Dismiss (single) | Mark this `rate_change.id` as read. If more unread remain, show next |
| Dismiss (multi) | Mark all as read. Banner disappears |
| "View Details" | Navigate to `/(tabs)/cards/[cardId]` with rate change section expanded |
| "View All" | Navigate to rate changes list screen (future — for v1, scroll to first affected card in card browser) |
| Priority order | Critical → Warning → Info. Show highest severity first |
| Auto-expire | Alerts older than 90 days auto-hidden (filtered in query) |
| Max display | 1 banner at a time on home screen |

#### 4.15.7 Accessibility

- `accessibilityRole="alert"` (auto-announces for screen readers)
- `accessibilityLiveRegion="assertive"` for critical, `"polite"` for warning/info
- `accessibilityLabel="Rate alert: {title}. {detail}. Tap View Details or Dismiss."`
- All touch targets ≥ 44x44pt

---

### 4.16 Card Detail "Rate Updated" Badge (F23)

**Purpose**: Contextual indicator on card detail screen showing recent rate changes.
**Position**: Inline with card title on the card detail screen.
**Visibility**: Only when the card has rate changes within the last 90 days.

#### 4.16.1 Component Layout

```
Card detail header (collapsed):
+--------------------------------------------------+
| ← Back                       [MaxiMile Logo]     |
|                                                    |
| DBS Woman's World Card    [Rate Updated 🔔]      |  ← gold pill badge
| 4 miles per dollar                                |
+--------------------------------------------------+

Card detail header (expanded — after badge tap):
+--------------------------------------------------+
| ← Back                       [MaxiMile Logo]     |
|                                                    |
| DBS Woman's World Card    [Rate Updated 🔔]      |
| 4 miles per dollar                                |
|                                                    |
| ┌─ Rate Change ─────────────────────────────────┐ |
| │                                                │ |
| │ Cap Adjustment — Effective Aug 2025            │ |
| │                                                │ |
| │ 4 mpd monthly cap:                            │ |
| │   S$1,500/month  →  S$1,000/month             │ |
| │                                                │ |
| │ Impact: 33% less bonus spend capacity          │ |
| │                                                │ |
| │ Multiple changes? (stacked):                   │ |
| │ ─────────────────────────────────              │ |
| │ Earn Rate Cut — Effective Dec 2025             │ |
| │ Selected categories:                           │ |
| │   0.24 mpd  →  0.16 mpd                       │ |
| │ Impact: Lower base earn on selected spend      │ |
| └────────────────────────────────────────────────┘ |
+--------------------------------------------------+
```

#### 4.16.2 Badge Component Table

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Badge container | Animated.View | `flexDirection: 'row'`, `alignItems: 'center'`, `backgroundColor: 'rgba(197, 165, 90, 0.12)'`, `borderRadius: BorderRadius.full`, `paddingHorizontal: Spacing.sm` (8px), `paddingVertical: 2`, `height: 22` | Gold pill, same size as eligibility badge |
| Badge icon | Ionicons | `notifications-outline`, size 12, `Colors.brandGold` | `marginRight: 3` |
| Badge text | Text | `fontSize: 11`, `fontWeight: '600'`, `lineHeight: 16`, `Colors.brandGold` | "Rate Updated" |
| Touch wrapper | TouchableOpacity | `activeOpacity: 0.7` | Toggles expansion of change detail card |

#### 4.16.3 Change Detail Card — Component Table

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Detail container | Animated.View | `backgroundColor: 'rgba(255, 255, 255, 0.75)'`, `borderRadius: BorderRadius.xl`, `borderWidth: 1`, `borderColor: 'rgba(197, 165, 90, 0.2)'`, padding `Spacing.lg`, `marginTop: Spacing.sm`, `marginHorizontal: Spacing.xl` | Glassmorphic card below title |
| Change type label | Text | `Typography.captionBold`, `Colors.textPrimary` | "Cap Adjustment", "Earn Rate Cut", "Program Devaluation" |
| Effective date | Text | `Typography.caption`, `Colors.textTertiary`, `marginLeft: Spacing.sm` | "Effective Aug 2025" — inline with type |
| Change description | Text | `Typography.caption`, `Colors.textSecondary`, `marginTop: Spacing.sm` | "4 mpd monthly cap:" |
| Old value | Text | `Typography.caption`, `Colors.danger`, `textDecorationLine: 'line-through'` | Struck-through old value |
| Arrow | Text | `Typography.caption`, `Colors.textTertiary` | " → " separator |
| New value | Text | `Typography.captionBold`, `Colors.textPrimary` | New value (bold to draw attention) |
| Impact text | Text | `Typography.caption`, `Colors.textSecondary`, `marginTop: Spacing.sm`, `fontStyle: 'italic'` | "Impact: 33% less bonus spend capacity" |
| Separator | View | `height: 1`, `backgroundColor: Colors.borderLight`, `marginVertical: Spacing.md` | Between stacked changes |

#### 4.16.4 Animation

- **Badge entrance**: Slide-in from right, 300ms spring (`translateX: 20 → 0`, `opacity: 0 → 1`)
- **Detail expand**: `Animated.spring({ height: 0 → measured, opacity: 0 → 1 })`, 250ms
- **Detail collapse**: `Animated.timing({ height: measured → 0, opacity: 1 → 0 })`, 200ms ease-out
- **Reduced motion**: Instant show/hide, no slide or spring

#### 4.16.5 Badge Logic

| Rule | Specification |
|------|---------------|
| Visibility | Card has ≥1 rate change with `effective_date` within last 90 days |
| Auto-hide | Badge disappears after 90 days from most recent change `effective_date` |
| Multiple changes | Detail card stacks changes vertically with separator (newest first) |
| "Read" state | First tap expands detail. Badge stays visible until 90-day expiry (not dismissible — informational, not actionable) |
| Data source | `rate_changes` table filtered by `card_id` and `effective_date > NOW() - INTERVAL '90 days'` |

#### 4.16.6 Accessibility

- Badge: `accessibilityRole="button"`, `accessibilityLabel="Rate updated — tap to see recent changes"`
- Detail card: `accessibilityRole="summary"`, `accessibilityLabel="Rate change: {type}. {old} changed to {new}. Effective {date}. Impact: {impact}"`
- Old value: `accessibilityLabel="Previous: {old value}"`
- New value: `accessibilityLabel="New: {new value}"`

---

## 5. Component Specifications

### 5.1 New Components to Build

| Component | File Path | Description |
|-----------|-----------|-------------|
| `MilesProgramCard` | `components/MilesProgramCard.tsx` | Glassmorphic card for per-program display on Miles tab. Props: `programName`, `programIcon`, `totalMiles`, `baselineMiles`, `earnedMiles`, `lastUpdated`, `onPress` |
| `MilesProgressBar` | `components/MilesProgressBar.tsx` | Gold-filled progress bar for goals. Props: `current`, `target`, `label`, `showProjection`, `projectedDate` |
| `BalanceBreakdown` | `components/BalanceBreakdown.tsx` | Table-style breakdown of manual + earned - redeemed = total. Props: `baseline`, `earned`, `redeemed`, `total`, `lastUpdated` |
| `BottomSheet` | `components/BottomSheet.tsx` | Generic modal bottom sheet with drag handle, backdrop, slide animation. Props: `visible`, `onDismiss`, `children`, `title` |
| `MilesHeroSection` | `components/MilesHeroSection.tsx` | Hero total display. Props: `totalMiles`, `programCount` |
| `CelebrationOverlay` | `components/CelebrationOverlay.tsx` | Gold confetti/sparkle animation overlay. Props: `visible`, `onComplete`, `type: 'redemption' | 'goal'` |

### 5.1b New Components — v2.0 (F18/F19/F20)

| Component | File Path | Description |
|-----------|-----------|-------------|
| `SegmentedControl` | `components/SegmentedControl.tsx` | Glassmorphic pill segmented control. Props: `segments: string[]`, `activeIndex: number`, `onSegmentChange: (index: number) => void` |
| `AirlineProgramCard` | `components/AirlineProgramCard.tsx` | Layer 1 airline card with confirmed + potential miles. Props: `programName`, `airline`, `confirmedMiles`, `potentialMiles`, `potentialBreakdown`, `onPress` |
| `BankPointsCard` | `components/BankPointsCard.tsx` | Layer 2 bank card with transfer options list. Props: `programName`, `balance`, `transferOptions`, `onHeaderPress`, `onTransferPress` |
| `TransferOptionRow` | `components/TransferOptionRow.tsx` | Single transfer destination row. Props: `airlineName`, `rateFrom`, `rateTo`, `resultingMiles`, `feeSgd`, `transferUrl` |
| `TransferNudgeCard` | `components/TransferNudgeCard.tsx` | Smart nudge for idle bank points. Props: `bankName`, `bankBalance`, `airlineName`, `potentialMiles`, `onViewOptions`, `onDismiss` |

### 5.1c New Components — v3.0 (F22/F23)

| Component | File Path | Description |
|-----------|-----------|-------------|
| `EligibilityBadge` | `components/EligibilityBadge.tsx` | Pill-shaped badge for restricted cards. Props: `eligibilityCriteria: object`, `size?: 'sm' | 'md'`, `onPress: () => void` |
| `EligibilityTooltip` | `components/EligibilityTooltip.tsx` | Expandable tooltip overlay with eligibility details. Props: `eligibilityCriteria: object`, `visible: boolean`, `anchorPosition: {x, y}`, `onDismiss: () => void` |
| `RateChangeBanner` | `components/RateChangeBanner.tsx` | Notification banner for rate changes (3 severity variants). Props: `alerts: RateAlert[]`, `onViewDetails: (alertId) => void`, `onDismiss: (alertId) => void`, `onViewAll: () => void` |
| `RateUpdatedBadge` | `components/RateUpdatedBadge.tsx` | Gold pill badge for card detail screen with expandable change details. Props: `changes: RateChange[]`, `cardName: string` |

### 5.2 Existing Components to Reuse

| Component | Usage in Miles Portfolio |
|-----------|------------------------|
| `EmptyState` | Miles tab when no cards added |
| `GlassCard` | Program detail balance breakdown, goal section |
| `LoadingSpinner` | All loading states |
| `CapProgressBar` | Adapt pattern for `MilesProgressBar` (different color: gold instead of status colors) |

### 5.3 Shared Style Patterns

#### Glassmorphic Card (reused from transactions.tsx)

```typescript
const glassmorphicCard = {
  backgroundColor: 'rgba(255, 255, 255, 0.65)',
  borderRadius: 16,
  borderWidth: 1,
  borderColor: 'rgba(197, 165, 90, 0.15)',
  paddingHorizontal: 16,   // Spacing.lg
  paddingVertical: 12,      // Spacing.md
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
    },
    android: { elevation: 2 },
  }),
};
```

#### Icon Circle (reused from transactions.tsx)

```typescript
const iconCircle = {
  width: 38,
  height: 38,
  borderRadius: 19,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.35)',
};
// Wrapped in LinearGradient with colors: ['#C5A55A', '#A8893E']
```

#### Bottom Sheet Standard

```typescript
const bottomSheet = {
  backgroundColor: Colors.surface,       // '#FFFFFF'
  borderTopLeftRadius: BorderRadius.lg,   // 12
  borderTopRightRadius: BorderRadius.lg,
  paddingHorizontal: Spacing.xl,          // 24
  paddingTop: Spacing.md,                 // 12
  paddingBottom: Spacing.xxl,             // 32
};
```

#### CTA Button (Gold, Full Width)

```typescript
const ctaButton = {
  backgroundColor: Colors.brandGold,      // '#C5A55A'
  borderRadius: BorderRadius.md,          // 8
  height: 48,
  alignItems: 'center',
  justifyContent: 'center',
};

const ctaButtonText = {
  ...Typography.bodyBold,                 // fontSize 16, fontWeight '600'
  color: Colors.brandCharcoal,            // '#2D3748'
};
```

#### Outlined Button (Gold Border)

```typescript
const outlinedButton = {
  borderWidth: 1.5,
  borderColor: Colors.brandGold,
  borderRadius: BorderRadius.md,
  height: 44,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent',
};

const outlinedButtonText = {
  ...Typography.bodyBold,
  color: Colors.brandGold,
};
```

---

## 6. Interaction Patterns

### 6.1 Gestures & Touch

| Interaction | Target | Behavior |
|-------------|--------|----------|
| Tap | Program card | Navigate to Program Detail screen via `router.push('/miles/[programId]')` |
| Tap | "Update Balance" button | Open Update Balance bottom sheet |
| Tap | "Log Redemption" button | Open Log Redemption bottom sheet |
| Tap | "Set a Goal" / "Edit" | Open Set Goal bottom sheet |
| Tap | Bottom sheet backdrop | Dismiss sheet (no save) |
| Swipe down | Bottom sheet | Dismiss sheet (no save) |
| Pull down | Miles tab ScrollView | Trigger RefreshControl, refetch all data |
| Tap | "I'll do this later" link (onboarding) | Skip balance entry, navigate to main app |
| Tap | Card row in Program Detail | Navigate to card-transactions screen (existing route) |
| Long press | Redemption row | Future: show delete option (not in v1) |
| Tap | Segmented control segment | Switch between Layer 1 and Layer 2; scroll resets to top (F18) |
| Tap | "Transfer" CTA in Layer 2 | Open bank transfer URL via `Linking.openURL(transferUrl)` (F19) |
| Tap | "View Options" on nudge card | Auto-scroll to relevant bank program card in Layer 2 (F20) |
| Tap | Dismiss (X) on nudge card | Hide nudge for current session (F20) |
| Tap | Potential miles line in Layer 1 | Expand/collapse source breakdown (F18) |

### 6.2 Transitions & Animations

| Transition | Type | Duration | Easing |
|------------|------|----------|--------|
| Navigate to Program Detail | Push (right-to-left slide) | 300ms | `ease-in-out` (system default) |
| Bottom sheet open | Slide up from bottom | 250ms | `ease-out` |
| Bottom sheet dismiss | Slide down | 200ms | `ease-in` |
| Backdrop fade in | Opacity 0 to 0.3 | 250ms | `linear` |
| Backdrop fade out | Opacity 0.3 to 0 | 200ms | `linear` |
| Goal progress bar fill | Width animation on mount | 600ms | `ease-out` |
| Celebration confetti | Particle animation | 1500ms | -- |
| Hero number count-up | Incremental number display on first load | 800ms | `ease-out` |
| Redemption success checkmark | Scale 0 to 1 with bounce | 400ms | `spring` |
| Segmented control pill slide | TranslateX to active segment | 200ms | `spring` (F18) |
| Layer content switch | Opacity cross-fade (old 1→0, new 0→1) | 150ms | `ease-in-out` (F18) |
| Hero number transition | Count up/down between segment values | 400ms | `ease-out` (F18) |
| Potential miles expand | Height 0 → content height | 200ms | `ease-out` (F18) |
| Nudge card dismiss | Opacity 1→0 + height collapse | 200ms | `ease-in` (F20) |
| Scroll to bank card | ScrollView.scrollTo with animated | 300ms | System default (F20) |

### 6.3 Loading States

| Screen | Loading State |
|--------|---------------|
| Miles Tab | `LoadingSpinner` with message "Loading miles..." (full screen, centered) |
| Program Detail | `LoadingSpinner` with message "Loading program details..." |
| Bottom sheet save | `ActivityIndicator` inside CTA button (replaces text), button disabled |
| Pull-to-refresh | System `RefreshControl` (iOS/Android native spinner) |

### 6.4 Error States

| Error | Handling |
|-------|----------|
| Network failure on load | `showNetworkErrorAlert()` with retry callback (existing pattern) |
| Save balance failure | Alert with "Failed to save balance. Please try again." and retry option |
| Save redemption failure | Alert with "Failed to log redemption. Please try again." |
| Save goal failure | Alert with "Failed to save goal. Please try again." |
| Redemption exceeds balance | Inline validation: red text below input, CTA disabled |
| Goal target <= current balance | Inline validation: "Target must be greater than your current balance" |

---

## 7. Data Display Formatting

### 7.1 Miles Numbers

- **Format**: Comma-separated integers (no decimals). E.g., `30,950` not `30950` or `30,950.00`.
- **Method**: `miles.toLocaleString('en-SG')` or `miles.toLocaleString()`.
- **Zero**: Display as `0`, not empty or `--`.
- **Large numbers**: No abbreviation in v1. Show full number (e.g., `1,250,000`).

### 7.2 Dates

- **Last updated (relative)**: "Updated just now", "Updated 2 hours ago", "Updated 3 days ago", "Updated 2 weeks ago".
- **Last updated (absolute, in detail)**: "Last updated: 18 Feb 2026" using `toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })`.
- **Projected date**: "Projected: May 2026" (month + year only).
- **Redemption date**: "18 Feb 2026" (day + month + year).

### 7.3 Balance Breakdown

```
Manual Baseline               28,500
Auto-Earned (Feb 2026)      +  2,450
Redemptions                 -      0
---------------------------------------
Estimated Total               30,950
```

- Positive additions use `+` prefix in `Colors.success` (#34A853).
- Deductions use `-` prefix in `Colors.danger` (#EA4335).
- Zero redemptions show `0` (not hidden).
- Total line in `Colors.brandGold`, larger font.

---

## 8. Accessibility Requirements

### 8.1 WCAG 2.1 AA Compliance

| Requirement | Implementation |
|-------------|----------------|
| Color contrast | All text meets 4.5:1 ratio. `Colors.textPrimary` (#1A1A2E) on white/glass bg exceeds 4.5:1. `Colors.brandGold` (#C5A55A) on white = 2.9:1 -- used only for decorative accents and large text (28px+), which requires 3:1. For body text, gold is never the sole color indicator. |
| Touch targets | Minimum 44x44pt for all interactive elements. Program cards have full-width tap area. Bottom sheet buttons are 48pt height. |
| Screen reader | All interactive elements have `accessibilityLabel` and `accessibilityRole`. Program cards: `accessibilityLabel="KrisFlyer, 30,950 miles, tap to view details"`. Progress bar: `accessibilityLabel="Goal progress, 73 percent, 30,950 of 42,000 miles"`. |
| Focus order | Logical top-to-bottom, left-to-right flow. Bottom sheet traps focus when open. |
| Reduced motion | Respect `AccessibilityInfo.isReduceMotionEnabled`. Skip confetti and count-up animations. Progress bar renders at final width without animation. |
| Dynamic type | Support iOS Dynamic Type scaling for all text. Test at largest accessibility size. |
| VoiceOver navigation | Group program cards as single tappable units. Balance breakdown rows announced as pairs: "Manual baseline, 28,500 miles." |

### 8.2 Keyboard Accessibility (Web)

- All interactive elements reachable via Tab key.
- Bottom sheets closable via Escape key.
- Numeric inputs accept keyboard input.
- Focus visible indicator on all focusable elements.

### 8.3 Inclusive Design Considerations

| Consideration | Implementation |
|---------------|----------------|
| Jargon avoidance | Use "miles" not "points" consistently. Tooltip for "mpd" on first encounter: "miles per dollar spent". |
| Color-blind safe | Never use color as the sole indicator. Progress bars include numeric percentage. Cap status uses icon + color. |
| Low-vision | High contrast mode respected. Gold numbers remain legible against both white and glass backgrounds. |
| Motor accessibility | Generous tap targets (48pt minimum for CTA buttons). Bottom sheets dismissible via button (not just swipe). |

---

## 9. State Management

### 9.1 Data Flow

```
[Supabase Tables]
    |
    |-- miles_balances (user_id, program_id, balance, updated_at)
    |-- miles_transactions (id, user_id, program_id, type, amount, description, date)
    |-- miles_goals (id, user_id, program_id, target, description, achieved_at)
    |-- transactions (existing) + earn_rules (existing) + cards.miles_program_id
    |
    v
[Fetch on screen mount / pull-to-refresh / useFocusEffect]
    |
    v
[Calculate per program]:
    auto_earned = SUM(transactions.amount * earn_rules.earn_rate_mpd)
                  WHERE card.miles_program_id = program.id
                  AND transaction_date IN current month

    total_balance = miles_balances.balance
                  + auto_earned (all time)
                  - SUM(miles_transactions.amount WHERE type = 'redeem')

    v
[Local state: useState hooks]
    |-- programs: MilesProgram[]
    |-- loading: boolean
    |-- refreshing: boolean
```

### 9.2 Optimistic Updates

- **Update Balance**: Immediately update local state; revert on error.
- **Log Redemption**: Immediately deduct from displayed balance; revert on error.
- **Set Goal**: Immediately show goal UI; revert on error.

### 9.3 Cache & Freshness

- Data refetched on every `useFocusEffect` (when tab gains focus).
- Pull-to-refresh forces complete refetch.
- "Last updated" timestamp reflects the `miles_balances.updated_at` column.
- Stale balance nudge: If `updated_at` > 30 days ago, show amber pill: "Balance may be outdated. Tap to update."

---

## 10. Edge Cases

| Scenario | Behavior |
|----------|----------|
| User has cards but no transactions | Show program cards with balance = manual baseline only. Auto-earned shows 0. |
| User skipped onboarding Step 2 | All balances default to 0. Programs still derived from cards. |
| User removes all cards for a program | Program card disappears from Miles tab. Balance data retained in DB (in case cards re-added). |
| User has no cards at all | Show EmptyState: "Track your miles -- Add your credit cards..." |
| Program has 0 balance and 0 earned | Show card with "0" balance. Do not hide. |
| Auto-earned exceeds manual balance + earned | Display the computed total. No cap on display. |
| Redemption amount > current balance | Validation error: "Miles amount cannot exceed your current balance." CTA disabled. |
| Goal target <= current balance | If set when target was higher but balance grew to exceed: mark as achieved. If user tries to set target <= balance: validation error. |
| 3+ goals per program | PRD specifies max 3 goals per program. Show "Maximum 3 goals reached" and disable "Set Goal." |
| Multiple cards map to same program | Single program card on Miles tab, aggregating earned miles from all contributing cards. |
| User has > 7 programs | Scrollable list, no pagination. |
| Network failure during save | Show error alert with retry. Do not dismiss bottom sheet. |
| Rapid pull-to-refresh | Debounce: ignore refresh if already refreshing. |
| **Two-Layer Edge Cases (F18/F19/F20)** | |
| User has airline cards (direct earn) but no bank points programs | Layer 1 shows airline cards normally. Layer 2 shows empty state "No bank points programs." Segmented control still visible. |
| User has bank points but no airline programs linked | Layer 2 shows bank cards with transfer options. Layer 1 shows airline programs IF user has potential miles from bank transfers. |
| Transfer rate data is stale (>90 days old) | Show amber pill on transfer option: "Rate last verified {date}." Still show the rate — stale data is better than no data. |
| Bank transfer URL is invalid/broken | `Linking.openURL` fails gracefully with Alert: "Transfer via {bank} app or website." No crash. |
| User rapidly switches segments | Debounce segment switch (ignore taps within 200ms of last switch). Prevent double-render. |
| Potential miles calculation results in 0 (balance too low for minimum transfer) | Show "Below minimum transfer" instead of "0 miles" in Layer 1 potential line. |
| User has cards remapped after migration 011 (HSBC, BOC) | HSBC cards now appear under HSBC Reward Points (Layer 2) instead of KrisFlyer (Layer 1). KrisFlyer still appears in Layer 1 via transfer partner mapping. |
| Nudge card references a bank program that user scrolled past | "View Options" CTA scrolls back up to that card. If card is above viewport, scroll up. |
| User has only 1 bank program with 1 transfer option | Nudge still shows if balance > 0. Transfer options section shows single row. |
| **Eligibility Badge Edge Cases (F22)** | |
| Card has multiple eligibility criteria (e.g., income + banking tier) | Show badge for the most restrictive criterion. Tooltip shows ALL criteria as separate bullet points. |
| Card has NULL eligibility_criteria | No badge rendered. Component returns `null`. |
| POSB Everyday Card (is_active = false) | Card excluded from all lists — badge never shown. Existing user data preserved. |
| User does not meet eligibility (e.g., male user seeing "Women Only" badge) | Badge still shown — it's informational. We don't filter cards by eligibility (user may already hold the card). |
| Badge text too long for card list row | Text truncated with ellipsis. Full text shown in tooltip on tap. Max badge width: 140px. |
| Badge tapped near screen edge | Tooltip positioning logic clamps to screen bounds (Spacing.lg from edges). Tooltip appears above badge if insufficient space below. |
| **Rate Change Notification Edge Cases (F23)** | |
| No rate changes exist for user's cards | No banner shown. Component returns `null`. |
| All rate changes are read (dismissed) | No banner shown. |
| Rate change older than 90 days | Auto-filtered from query. Badge and banner disappear. |
| Multiple rate changes for same card | Card detail badge shows stacked changes (newest first) with separators. Banner shows most severe unread. |
| User has no cards (empty state) | No rate changes possible. No banner shown. |
| Rate change affects a card user removed | Alert not shown (query filters by user's active cards). |
| Critical devaluation for a card user doesn't hold | Alert not shown — filtered to user's cards only. |
| Rapid dismiss of multiple alerts | Each dismiss updates DB independently. UI optimistically removes banner, reverts on error. |
| Network failure during dismiss | Show error toast "Couldn't dismiss alert. Try again." Banner remains visible. |

---

## 11. Design Tokens Reference

All values sourced from `/maximile-app/constants/theme.ts`:

### Colors Used in Miles Portfolio

| Token | Value | Usage |
|-------|-------|-------|
| `Colors.brandGold` | `#C5A55A` | Hero number, progress bar fill, CTA buttons, tab active color, accents |
| `Colors.brandCharcoal` | `#2D3748` | CTA button text |
| `Colors.textPrimary` | `#1A1A2E` | Screen titles, program names, balance values |
| `Colors.textSecondary` | `#5F6368` | Subtitles, labels, breakdown labels |
| `Colors.textTertiary` | `#9AA0A6` | Timestamps, helper text, chevron icons |
| `Colors.surface` | `#FFFFFF` | Bottom sheet background |
| `Colors.background` | `#F8F9FA` | Header background |
| `Colors.border` | `#E0E0E0` | Input borders (default state) |
| `Colors.borderLight` | `#F0F0F0` | Progress bar track background |
| `Colors.success` | `#34A853` | Positive additions in breakdown |
| `Colors.danger` | `#EA4335` | Redemption deductions, validation errors, delete link |
| `Colors.babyYellowLight` | `#FEFED5` | Stale balance nudge pill background |

### Typography

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `Typography.heading` | 28/34 | 700 | Screen titles (overridden to 26 per app convention) |
| `Typography.subheading` | 20/26 | 600 | Bottom sheet titles, program detail name |
| `Typography.body` | 16/22 | 400 | Body text, descriptions |
| `Typography.bodyBold` | 16/22 | 600 | Program names in cards, balance values, CTA text |
| `Typography.caption` | 13/18 | 400 | Timestamps, helper text, breakdown labels |
| `Typography.captionBold` | 13/18 | 600 | Section headers, input labels |
| `Typography.label` | 11/14 | 500 | Uppercase labels |
| Custom: Hero number | 40 | 700 | Total miles hero display |

### Spacing

| Token | Value | Common Usage |
|-------|-------|-------------|
| `Spacing.xs` | 4px | Micro gaps, icon padding |
| `Spacing.sm` | 8px | Card separator height, inline gaps |
| `Spacing.md` | 12px | Card vertical padding, compact spacing |
| `Spacing.lg` | 16px | Card horizontal padding, section padding |
| `Spacing.xl` | 24px | Screen padding, section breaks |
| `Spacing.xxl` | 32px | Screen top/bottom padding |
| `Spacing.xxxl` | 48px | Major section breaks |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `BorderRadius.sm` | 4px | Input fields, small buttons |
| `BorderRadius.md` | 8px | CTA buttons, standard cards |
| `BorderRadius.lg` | 12px | Bottom sheet top corners |
| `BorderRadius.xl` | 16px | Glassmorphic cards (primary card radius) |
| `BorderRadius.full` | 9999px | Progress bars, pills, badges |

---

## 12. Technical Implementation Notes

### 12.1 File Structure

```
maximile-app/
  app/
    (tabs)/
      miles.tsx                  -- Miles Portfolio Overview (F13 + F18 two-layer)
      _layout.tsx                -- Updated to include Miles tab
    miles/
      [programId].tsx            -- Program Detail Screen (F13/F14/F15/F16)
    onboarding.tsx               -- Updated to include optional Step 2 (F14)
    onboarding-miles.tsx         -- Alternative: separate file for Step 2
  components/
    MilesProgramCard.tsx         -- Per-program card component (Layer 1 — existing)
    AirlineProgramCard.tsx       -- Layer 1 airline card with confirmed + potential (NEW — F18)
    BankPointsCard.tsx           -- Layer 2 bank card with transfer options (NEW — F18)
    TransferOptionRow.tsx        -- Single transfer option row (NEW — F19)
    TransferNudgeCard.tsx        -- Smart transfer nudge (NEW — F20)
    SegmentedControl.tsx         -- Glassmorphic segmented control (NEW — F18)
    MilesProgressBar.tsx         -- Gold progress bar for goals
    BalanceBreakdown.tsx         -- Balance table component
    BottomSheet.tsx              -- Reusable bottom sheet
    MilesHeroSection.tsx         -- Hero total display (updated for segment context)
    CelebrationOverlay.tsx       -- Confetti/sparkle animation
    EligibilityBadge.tsx         -- Pill badge for restricted cards (NEW — F22)
    EligibilityTooltip.tsx       -- Expandable eligibility details (NEW — F22)
    RateChangeBanner.tsx         -- Home screen rate alert banner (NEW — F23)
    RateUpdatedBadge.tsx         -- Card detail rate change badge (NEW — F23)
```

### 12.2 Dependencies

| Package | Purpose | Status |
|---------|---------|--------|
| `expo-router` | Navigation (push, back) | Already installed |
| `expo-blur` | GlassCard blur effect | Already installed |
| `expo-linear-gradient` | Icon gradient circles | Already installed |
| `@expo/vector-icons` (Ionicons) | All icons | Already installed |
| `react-native-reanimated` | Animations (celebration, progress bar) | Already installed |
| `@react-native-community/datetimepicker` | Date picker for redemption | May need installation |

### 12.3 Supabase Table Schema (for reference)

```sql
-- New tables needed (from PRD Section 16):

CREATE TABLE miles_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,           -- e.g. 'KrisFlyer'
  airline TEXT,                  -- e.g. 'Singapore Airlines'
  icon TEXT DEFAULT 'airplane-outline',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- New FK column on existing cards table:
ALTER TABLE cards ADD COLUMN miles_program_id UUID REFERENCES miles_programs(id);

CREATE TABLE miles_balances (
  user_id UUID REFERENCES auth.users(id),
  miles_program_id UUID REFERENCES miles_programs(id),
  balance INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, miles_program_id)
);

CREATE TABLE miles_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  miles_program_id UUID REFERENCES miles_programs(id),
  type TEXT NOT NULL CHECK (type IN ('redeem', 'transfer_out', 'transfer_in', 'adjust')),
  amount INTEGER NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE miles_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  miles_program_id UUID REFERENCES miles_programs(id),
  target_miles INTEGER NOT NULL,
  description TEXT,
  achieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 13. Acceptance Criteria (Design)

### 13.1 Miles Tab (F13)

- [ ] Hero section displays total miles across all programs in large gold (`#C5A55A`) text, fontSize 40.
- [ ] Per-program glassmorphic cards show: program icon in gold gradient circle, program name, total balance (gold, bold), breakdown text (baseline + earned), last updated timestamp.
- [ ] Each program card is tappable and navigates to the Program Detail screen.
- [ ] Pull-to-refresh recalculates all balances.
- [ ] Empty state uses existing `EmptyState` component with airplane icon and "Add Cards" CTA.
- [ ] Zero-balance state shows program cards with "0" and inline prompt.
- [ ] Screen uses `ImageBackground` with `background.png`, consistent with all other screens.
- [ ] Tab bar updated with airplane icon for Miles tab.

### 13.2 Program Detail (F13 + F14 + F15 + F16)

- [ ] Balance breakdown shows manual baseline, auto-earned (current month label), redemptions, and estimated total.
- [ ] "Update Balance" and "Log Redemption" buttons are side-by-side below the breakdown.
- [ ] Contributing cards section lists all cards mapped to this program with card images.
- [ ] Goal section shows progress bar (gold fill), percentage, miles fraction, and projected date.
- [ ] Goal achieved state shows celebration animation and "Goal Achieved!" badge.
- [ ] Redemption history lists past redemptions with description, miles, and date.
- [ ] Disclaimer text appears below balance breakdown.

### 13.3 Onboarding Step 2 (F14)

- [ ] Appears after card selection "Done" press, before navigating to main app.
- [ ] Shows only programs derived from selected cards.
- [ ] Each row has program icon (gold gradient circle), name, and right-aligned numeric input.
- [ ] "I'll do this later" skip link is always visible and navigates to main app with 0 balances.
- [ ] "Save & Continue" CTA saves non-zero values and navigates to main app.
- [ ] Numeric input accepts integers only, shows comma formatting.
- [ ] Visual style matches existing onboarding screen (card rows, section styling, footer CTA).

### 13.4 Bottom Sheets (F14 + F15 + F16)

- [ ] All bottom sheets have drag handle, backdrop, slide-up animation.
- [ ] Update Balance sheet: pre-fills current balance, numeric input, helper text, Save CTA.
- [ ] Log Redemption sheet: miles input, description input, date picker, Log CTA, validation.
- [ ] Set Goal sheet: target input, description input, Save Goal CTA, Delete Goal link (edit mode).
- [ ] Redemption celebration: haptic + confetti + success message + auto-dismiss.
- [ ] All CTAs disabled until valid input provided.

### 13.5 Segmented Control & Two-Layer Architecture (F18)

- [ ] Segmented control with "My Miles" (default) and "My Points" appears below title/subtitle.
- [ ] Active segment has gold pill background with charcoal text; inactive has secondary text color.
- [ ] Gold pill slides smoothly (200ms spring) between segments.
- [ ] "My Miles" shows airline program cards with confirmed + potential miles breakdown.
- [ ] "My Points" shows bank points cards with transfer options list.
- [ ] Hero section updates total and subtitle text per active segment.
- [ ] Scroll position resets to top on segment switch.
- [ ] Segment selection persists within session (not across app relaunches).
- [ ] Both layers load within 2 seconds; segment switch feels instant (<300ms).

### 13.6 Layer 1 — Airline Cards with Potential Miles (F18/F19)

- [ ] Each airline card shows: program name, airline name, confirmed miles (gold bold), potential miles (lighter with dashed border + "POTENTIAL" tag).
- [ ] Total = confirmed + potential, displayed below a divider.
- [ ] Tapping potential line expands to show source breakdown (bank name, balance, conversion math).
- [ ] Cards only appear for airlines the user has a connection to (balance, cards, or potential).
- [ ] Cards sorted by total (confirmed + potential) descending.
- [ ] If user has 0 confirmed but potential > 0 for an airline, card still appears.

### 13.7 Layer 2 — Bank Cards with Transfer Options (F18/F19)

- [ ] Each bank card shows: program name, balance (gold bold), and "TRANSFER OPTIONS" section.
- [ ] Transfer options show: airline name, rate ("5 pts → 2 miles"), resulting miles, fee (if any), and "Transfer >" CTA.
- [ ] Transfer options sorted by best rate (lowest points-per-mile first).
- [ ] "Transfer" CTA opens bank URL in external browser via `Linking.openURL`.
- [ ] Transfer fee shown in red (`Colors.danger`) when applicable (e.g., "Fee: S$30.56").
- [ ] Bank cards sorted by total balance descending.
- [ ] Bank programs use `card-outline` icon (not airplane) in gold gradient circle.

### 13.8 Smart Transfer Nudges (F20)

- [ ] Nudge card appears at top of Layer 2 when user has idle bank points.
- [ ] Nudge message: "Your {balance} {program} could become {potential} {airline} miles".
- [ ] Lightbulb icon top-left; dismiss (X) button top-right.
- [ ] "View Options" CTA scrolls to relevant bank card.
- [ ] Dismiss hides nudge for current session only.
- [ ] Maximum 1 nudge per session.
- [ ] No nudge shown when user has 0 bank points.

### 13.9 Eligibility Badges (F22)

- [ ] Cards with non-NULL `eligibility_criteria` show a colored pill badge on card list items and card detail header.
- [ ] Badge variant matches eligibility type: pink for gender, blue for age, gold for income, purple for banking tier.
- [ ] Tapping badge opens glassmorphic tooltip with full eligibility requirements.
- [ ] Tooltip dismisses on tap outside, tap badge again, or scroll.
- [ ] Tooltip positioned below badge (or above if near screen bottom).
- [ ] Tooltip enters with 200ms fade + slight slide animation.
- [ ] Cards with NULL eligibility_criteria show no badge.
- [ ] POSB Everyday Card (is_active = false) does not appear in any card list.
- [ ] All 29 active cards render correctly — 5 with badges, 24 without.
- [ ] Badge has `accessibilityRole="button"` with descriptive label.

### 13.10 Rate Change Notification Banner (F23)

- [ ] Banner appears at top of home screen when unread rate changes affect user's cards.
- [ ] Three severity variants render correctly: critical (red), warning (amber), info (blue).
- [ ] Severity-colored left border (4px) distinguishes variants.
- [ ] "View Details" navigates to affected card's detail screen.
- [ ] "Dismiss" marks alert as read and removes banner.
- [ ] ≥3 unread alerts collapse into "N rate changes affect your cards" multi-alert banner.
- [ ] Banner enters with 300ms spring slide-down animation.
- [ ] Banner exits with 200ms slide-up + fade-out on dismiss.
- [ ] No banner when all alerts are read or no rate changes exist.
- [ ] `accessibilityRole="alert"` announces banner for screen readers.

### 13.11 Card Detail Rate Updated Badge (F23)

- [ ] Gold "Rate Updated" pill badge appears inline with card title when card has rate changes within 90 days.
- [ ] Badge enters with 300ms slide-in from right animation.
- [ ] Tapping badge expands glassmorphic detail card below title.
- [ ] Detail card shows: change type, old value (struck-through), arrow, new value (bold), effective date, impact text.
- [ ] Multiple changes stack vertically with separator (newest first).
- [ ] Badge auto-hides after 90 days from most recent change effective date.
- [ ] Detail card expand/collapse animates smoothly (250ms spring / 200ms ease-out).
- [ ] `accessibilityRole="button"` on badge with descriptive label.

### 13.12 Accessibility

- [ ] All interactive elements have `accessibilityLabel` and `accessibilityRole`.
- [ ] Touch targets minimum 44x44pt.
- [ ] Progress bar has meaningful `accessibilityLabel` with percentage and numbers.
- [ ] Animations respect `isReduceMotionEnabled`.
- [ ] Color contrast meets WCAG 2.1 AA for all text.

---

## 14. Open Design Questions

| # | Question | Options | Recommendation | Status |
|---|----------|---------|----------------|--------|
| 1 | Should Profile tab remain as 6th tab or move to header? | (a) 5 tabs, Profile to header icon; (b) 6 tabs | (a) 5 tabs -- keeps nav clean; Profile is low-frequency | Open |
| 2 | Should hero number animate (count up) on first load? | (a) Yes, 800ms count-up; (b) Static display | (a) Count-up -- adds delight, only on first render per session | Open |
| 3 | Should onboarding Step 2 be a separate screen or inline in existing onboarding? | (a) Separate route `/onboarding-miles`; (b) Integrated as step in existing `/onboarding` | (a) Separate -- cleaner separation, easier to maintain | Open |
| 4 | Should the Miles tab show a "total value in SGD" estimate based on average cpp? | (a) Yes, subtle caption "approx. SGD X"; (b) No, too speculative | (b) No -- valuation is subjective and program-dependent; risks misleading users | Open |
| 5 | Should redemption rows be deletable? | (a) Yes, swipe-to-delete; (b) No, log only | (b) No for v1 -- prevents accidental data loss; add in v1.1 | Open |
| 6 | Date picker style for redemption logging? | (a) System native picker; (b) Custom calendar component | (a) System native -- consistent, accessible, no build cost | Open |
| **7** | **Should potential miles in Layer 1 be expanded by default or collapsed?** | (a) Collapsed — tap to reveal breakdown; (b) Expanded — always show breakdown | **(a) Collapsed** -- less visual noise; user can tap when curious. Expansion animates smoothly. | Open |
| **8** | **How to handle transfer URL failures?** | (a) Show "Open {bank} app" fallback; (b) Show inline error in card; (c) Toast notification | **(a) Fallback message** -- Alert with "Transfer via {bank name} app or website" if URL can't open | Open |
| **9** | **Should nudge frequency be session-scoped or time-scoped?** | (a) Session-scoped (reappears each launch); (b) 24-hour cooldown; (c) Weekly | **(a) Session-scoped** for v1 — simple to implement; can tighten if users complain. | Open |
| **10** | **Should Layer 2 show all transfer partners or limit to top 5?** | (a) Show all seeded partners; (b) Show top 5 + "See all" link | **(a) Show all** for v1 — most banks have ≤7 partners. HSBC has 6 seeded. No pagination needed. | Open |
| **11** | **Eligibility badge color scheme — distinct colors per type or all brand gold?** | (a) Distinct colors for quick scanning; (b) All brand gold for consistency | **(a) Distinct colors** — pink/blue/gold/purple provide instant visual differentiation. Users scan badge colors before reading text. | Resolved |
| **12** | **Rate change banner position — home screen top or within affected card tab?** | (a) Home screen top for visibility; (b) Card browser tab only; (c) Both | **(a) Home screen top** — rate changes are urgent and time-sensitive. Card detail badge provides contextual detail. Both locations serve different purposes. | Resolved |
| **13** | **Should eligibility badges filter recommendations (hide ineligible cards)?** | (a) Yes — only show eligible cards; (b) No — show all with badge, let user decide | **(b) No filtering** for v1 — user may already hold the card. Filtering requires profile data (age, gender, income) we don't collect. Badge is informational only. | Resolved |
| **14** | **Rate change "View All" destination — new screen or card browser with filter?** | (a) New dedicated rate changes list screen; (b) Card browser with "Recently Changed" filter | **(b) Card browser with filter** for v1 — avoids building a new screen. Use query param to filter. New screen in v2 if needed. | Open |

---

## 15. Appendix

### A. Ionicons Reference for Miles Portfolio

| Usage | Icon Name (outline) | Icon Name (filled) |
|-------|---------------------|---------------------|
| Miles tab | `airplane-outline` | `airplane` |
| Program icon (generic) | `airplane-outline` | `airplane` |
| Chevron forward | `chevron-forward` | -- |
| Update balance | `create-outline` | -- |
| Log redemption | `gift-outline` | -- |
| Set goal | `flag-outline` | `flag` |
| Calendar | `calendar-outline` | -- |
| Checkmark (success) | `checkmark-circle` | `checkmark-circle` |
| Time / projection | `time-outline` | -- |
| Back navigation | `chevron-back` | -- |
| Close sheet | `close` | -- |
| Profile (header) | `person-circle-outline` | `person-circle` |
| Bank card icon (Layer 2) | `card-outline` | `card` |
| Transfer nudge icon | `bulb-outline` | `bulb` |
| Dismiss nudge | `close-outline` | -- |
| Transfer CTA arrow | `open-outline` | -- |
| Star icon (Amex MR) | `star-outline` | `star` |
| Eligibility: gender | `female-outline` | `female` |
| Eligibility: age | `calendar-outline` | `calendar` |
| Eligibility: income | `cash-outline` | `cash` |
| Eligibility: banking | `shield-outline` | `shield` |
| Eligibility: premium | `diamond-outline` | `diamond` |
| Rate alert: critical | `alert-circle-outline` | `alert-circle` |
| Rate alert: warning | `warning-outline` | `warning` |
| Rate alert: info | `information-circle-outline` | `information-circle` |
| Rate updated badge | `notifications-outline` | `notifications` |

### B. Color Palette Visual Reference

```
Brand Gold:      #C5A55A  ████████  (hero numbers, progress, CTAs)
Brand Charcoal:  #2D3748  ████████  (CTA text on gold)
Text Primary:    #1A1A2E  ████████  (titles, body text)
Text Secondary:  #5F6368  ████████  (subtitles, labels)
Text Tertiary:   #9AA0A6  ████████  (timestamps, hints)
Surface:         #FFFFFF  ████████  (bottom sheets, card bg)
Background:      #F8F9FA  ████████  (screen bg)
Glass BG:        rgba(255,255,255,0.65)  (glassmorphic cards)
Glass Border:    rgba(197,165,90,0.15)   (card border)
Success:         #34A853  ████████  (positive additions)
Danger:          #EA4335  ████████  (deductions, errors, critical alerts)
Warning:         #FBBC04  ████████  (warning alerts, cap changes)
Primary Light:   #4A90D9  ████████  (info alerts, age badge)
Badge Pink:      #E91E8C  ████████  (gender eligibility badge)
Badge Purple:    #7B61FF  ████████  (banking tier eligibility badge)
Border Light:    #F0F0F0  ████████  (progress track)
```

### C. Screen Dimensions & Safe Areas

- Design for 375pt width (iPhone SE/8) as minimum.
- Tab bar height: 88pt (iOS) / 68pt (Android).
- Bottom padding for content: `Spacing.xxxl + 40` (88px) to clear tab bar.
- SafeAreaView edges: `['bottom']` for tab screens, full edges for modal screens.
- Keyboard-aware: Use `KeyboardAvoidingView` or ScrollView keyboard dismiss for bottom sheets.
