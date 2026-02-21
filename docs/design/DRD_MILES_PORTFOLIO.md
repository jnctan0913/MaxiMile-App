# Design Requirements Document: Miles Portfolio (F13-F24)

**Version**: 4.1
**Last Updated**: 2026-02-21
**Author**: UI/UX Designer Agent
**Status**: Active
**PRD Reference**: PRD v1.5, Features F13-F24
**Parent DRD**: `docs/design/DRD_MASTER.md` — Refer to master DRD for global design system, principles, and components

---

## Important: Design System Reference

This document covers **feature-specific** design requirements for Miles Portfolio (F13-F24). For **global design system** specifications, refer to:

📘 **[DRD_MASTER.md](./DRD_MASTER.md)**

Global topics covered in master DRD:
- Design principles (Section 2)
- Design tokens (colors, typography, spacing) (Section 4)
- Component library (GlassCard, BottomSheet, Button, etc.) (Section 5)
- Interaction patterns (Section 6)
- Accessibility requirements (Section 7)
- Platform differences (iOS/Android) (Section 8)

### Changelog
| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-20 | Initial DRD covering F13-F17 (Miles Portfolio, Balance Entry, Redemptions, Goals, Insights) |
| 2.0 | 2026-02-20 | Added Two-Layer Architecture (F18), Transfer Partner Mapping (F19), Smart Transfer Nudges (F20), Expanded Programs (F21). New sections: 4.8-4.12, 5.4, updated 2.2, 2.3, 6, 10, 14 |
| 3.0 | 2026-02-20 | Added Eligibility Badge (F22), Eligibility Tooltip (F22), Rate Change Notification Banner (F23), Rate Updated Badge (F23). New sections: 4.13-4.16, 5.1c. Updated 1.2, 2.3, 6, 10, 13, 14, 15 |
| 4.0 | 2026-02-21 | Added Community Submissions UI (F24): Submission Form Bottom Sheet (T13.05), My Submissions Screen (T13.15), Contributor Badge (T13.16), Admin Review Dashboard (T13.10). New section: 16. Updated 1.2, 5.1, 6, 10, 13, 14, 15 |
| 4.1 | 2026-02-21 | Consolidated duplicate design system content into DRD_MASTER.md. Removed duplicate Design Principles, Design Tokens sections. Now references master DRD for global standards. Section 11 (Design Tokens) now shows Miles-specific usage. Section 8 (Accessibility) retains detailed implementation but references master for global requirements. |

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
| **F24** | **Community Rate Submissions** | **In-app submission form, My Submissions screen, contributor badges, admin review dashboard (web)** | **Sprint 13** |

### 1.3 Design Principles

**See [DRD_MASTER.md Section 2](./DRD_MASTER.md#2-global-design-principles) for global design principles.**

Miles Portfolio-specific principles (extend global principles):

1. **Destination-first thinking** (F18) -- Default to "My Miles" (airline programs) because users think in destinations ("Can I book SQ Tokyo?"), not sources ("What can I do with DBS Points?").
2. **Confirmed vs. Potential clarity** (F18) -- Never let users mistake transferable bank points for miles they already have. Visual distinction is mandatory (bold gold for confirmed, lighter for potential).
3. **Actionable nudges, not spam** (F20) -- Transfer nudges must be dismissible, session-scoped (max 1 per session), and only appear when genuinely useful (idle points >60 days).

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

**See [DRD_MASTER.md Section 7](./DRD_MASTER.md#7-accessibility-requirements) for global accessibility standards.** This section details Miles Portfolio-specific accessibility implementations.

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

**See [DRD_MASTER.md Section 4](./DRD_MASTER.md#4-design-tokens) for complete design system tokens** (colors, typography, spacing, shadows, glassmorphism, etc.).

### Miles Portfolio Specific Usage

All base values are sourced from `/maximile-app/constants/theme.ts`. Below are Miles-specific applications:

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
| Report a change (F24) | `flag-outline` | `flag` |
| Contributor badge (F24) | `star-outline` | `star` |
| Screenshot picker (F24) | `camera-outline` | `camera` |
| Submission pending (F24) | `time-outline` | `time` |
| Submission under review (F24) | `eye-outline` | `eye` |
| Submission approved (F24) | `checkmark-circle-outline` | `checkmark-circle` |
| Submission rejected (F24) | `close-circle-outline` | `close-circle` |
| Submission merged (F24) | `git-merge-outline` | `git-merge` |
| Change type: earn rate (F24) | `trending-up` / `trending-down` | -- |
| Change type: cap (F24) | `bar-chart-outline` | `bar-chart` |
| Change type: devaluation (F24) | `arrow-down-circle-outline` | `arrow-down-circle` |
| Change type: partner (F24) | `swap-horizontal-outline` | `swap-horizontal` |
| Change type: fee (F24) | `cash-outline` | `cash` |

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

---

## 16. Sprint 13: Community Submissions UI (F24)

**Version**: 4.0
**Sprint**: 13
**Feature**: F24 — Community-Sourced Rate Change Submissions
**Tasks**: T13.05, T13.10, T13.15, T13.16
**PRD Reference**: PRD v1.6, Feature F24
**Architecture Reference**: `docs/RATE_DETECTION_ARCHITECTURE.md`

### 16.0 Overview

This section specifies the UI for community-sourced rate change submissions. Users who discover earn rate changes, cap adjustments, devaluations, or fee changes can report them via an in-app form. Admins review submissions in a separate web dashboard (Cloudflare Pages). Users track their submission history in-app, and earn a "Verified Contributor" badge after 3+ approved submissions.

**Design philosophy**:
- **In-app screens** (submission form, My Submissions, contributor badge): Glassmorphic, gold-accented — consistent with existing app design language.
- **Admin dashboard** (web app): Clean, functional, table-based — NOT glassmorphic. Optimized for efficiency, not aesthetics.

**Data model reference** (from `RATE_DETECTION_ARCHITECTURE.md`):
- Table: `community_submissions` — user_id, card_id, change_type, old_value, new_value, evidence_url, screenshot_path, status
- Enum: `submission_status` — `'pending'`, `'under_review'`, `'approved'`, `'rejected'`, `'merged'`
- Enum: `rate_change_type` — `'earn_rate'`, `'cap_change'`, `'devaluation'`, `'partner_change'`, `'fee_change'`

---

### 16.1 Submission Form Bottom Sheet (T13.05)

**Trigger**: "Report a Change" link/button on Card Detail screen, positioned near the RateUpdatedBadge component
**Presentation**: Modal bottom sheet (reuses existing `BottomSheet` component pattern from 5.3)
**Route context**: Opened from `/cards/[cardId]` (card detail screen)

#### 16.1.1 Entry Point — "Report a Change" Link

Placed on the Card Detail screen, below the card title row, adjacent to the RateUpdatedBadge (if present).

```
Card detail header:
+--------------------------------------------------+
| < Back                       [MaxiMile Logo]     |
|                                                    |
| DBS Woman's World Card    [Rate Updated]          |
| 4 miles per dollar                                |
|                                                    |
|      [flag-outline] Report a Change               |  <-- entry point link
|                                                    |
+--------------------------------------------------+
```

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Icon | Ionicons | `flag-outline`, size 14, `Colors.brandGold` | Leading icon |
| Link text | Text | `Typography.caption`, `Colors.brandGold`, fontWeight '500' | "Report a Change" |
| Touch wrapper | TouchableOpacity | `activeOpacity: 0.7`, `flexDirection: 'row'`, `alignItems: 'center'`, `gap: Spacing.xs` | Min touch target 44x28 |
| Position | View | `marginTop: Spacing.sm`, `marginLeft: Spacing.xl` | Below card title row |

**Behavior**: Tapping opens the Submission Form Bottom Sheet with `cardId` pre-filled from the current card context.

#### 16.1.2 Bottom Sheet — Component Layout

```
+--------------------------------------------------+
|  ------  (drag handle)                            |
|                                                    |
|  Report a Rate Change                              |
|                                                    |
|  Card                                              |
|  +----------------------------------------------+ |
|  | [img] DBS Woman's World Card             [v] | |  <-- pre-filled, editable
|  +----------------------------------------------+ |
|                                                    |
|  Change Type                                       |
|  +----------------------------------------------+ |
|  | Earn Rate Change                         [v] | |  <-- dropdown
|  +----------------------------------------------+ |
|                                                    |
|  Category (optional)                               |
|  +----------------------------------------------+ |
|  | e.g. Dining, Online Shopping                 | |
|  +----------------------------------------------+ |
|                                                    |
|  Old Value                                         |
|  +----------------------------------------------+ |
|  | e.g. 4 mpd                                   | |
|  +----------------------------------------------+ |
|                                                    |
|  New Value                                         |
|  +----------------------------------------------+ |
|  | e.g. 3 mpd                                   | |
|  +----------------------------------------------+ |
|                                                    |
|  Effective Date                                    |
|  +----------------------------------------------+ |
|  | 21 Feb 2026                              [c] | |  <-- date picker
|  +----------------------------------------------+ |
|                                                    |
|  Evidence URL (optional)                           |
|  +----------------------------------------------+ |
|  | https://www.dbs.com.sg/...                   | |
|  +----------------------------------------------+ |
|                                                    |
|  Screenshot (optional)                             |
|  +----------------------------------------------+ |
|  |  [camera-outline]  Tap to add screenshot     | |  <-- image picker
|  +----------------------------------------------+ |
|                                                    |
|  Notes (optional)                                  |
|  +----------------------------------------------+ |
|  | Noticed this change on the DBS website...    | |
|  |                                              | |
|  +----------------------------------------------+ |
|                                                    |
|  [            Submit Report            ]           |
|                                                    |
|  You can track your submission in                  |
|  Profile > My Submissions                          |
+--------------------------------------------------+
```

#### 16.1.3 Component Tree

```
SubmissionFormSheet
  BottomSheet (existing component)
    DragHandle
    SheetTitle ("Report a Rate Change")
    ScrollView
      CardSelectorField
        CardPickerRow (pre-filled, tappable to change)
      ChangeTypeField
        DropdownPicker (5 options from rate_change_type)
      CategoryField
        TextInput (optional, free-text)
      OldValueField
        TextInput (required)
      NewValueField
        TextInput (required)
      EffectiveDateField
        DatePickerRow (system native picker)
      EvidenceUrlField
        TextInput (optional, URL validation)
      ScreenshotField
        ImagePickerRow (optional, camera/gallery)
      NotesField
        TextInput (multiline, optional)
      SubmitButton
        CTA button (gold, full width)
      HelperText
        Caption ("You can track your submission in Profile > My Submissions")
    SuccessState (replaces form on success)
    ErrorState (inline alert)
```

#### 16.1.4 Component Table — Field Specifications

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Drag handle | View | width 40, height 4, `Colors.border`, `BorderRadius.full`, centered | Standard bottom sheet handle |
| Sheet title | Text | `Typography.subheading`, `Colors.textPrimary` | "Report a Rate Change" |
| Field label | Text | `Typography.captionBold`, `Colors.textSecondary`, uppercase, letterSpacing 0.5 | "CARD", "CHANGE TYPE", etc. |
| Card selector | TouchableOpacity | Standard input border style, flexDirection 'row', alignItems 'center', height 48 | Pre-filled from card detail context. Shows card thumbnail (32x22) + card name. Tap opens card picker modal |
| Card picker chevron | Ionicons | `chevron-down`, size 16, `Colors.textTertiary` | Right-aligned in selector |
| Change type dropdown | TouchableOpacity | Same input style as card selector, height 48 | Tap opens ActionSheet/Picker with 5 options |
| Change type options | ActionSheet | System ActionSheet or custom picker | Options: "Earn Rate Change", "Cap Adjustment", "Program Devaluation", "Partner Change", "Fee Change" |
| Category input | TextInput | `Typography.body`, `Colors.textPrimary`, height 44 | Placeholder: "e.g. Dining, Online Shopping", max 50 chars |
| Old value input | TextInput | `Typography.body`, `Colors.textPrimary`, height 44 | Placeholder: "e.g. 4 mpd", required, max 100 chars |
| New value input | TextInput | `Typography.body`, `Colors.textPrimary`, height 44 | Placeholder: "e.g. 3 mpd", required, max 100 chars |
| Date picker row | TouchableOpacity | Same input style, with calendar icon right-aligned | Opens system date picker, defaults to today |
| Calendar icon | Ionicons | `calendar-outline`, size 18, `Colors.textTertiary` | Right edge of date input |
| Evidence URL input | TextInput | `Typography.body`, `Colors.textPrimary`, height 44 | Placeholder: "https://...", `keyboardType="url"`, `autoCapitalize="none"` |
| Screenshot picker | TouchableOpacity | Dashed border: `borderWidth: 1.5`, `borderStyle: 'dashed'`, `borderColor: Colors.border`, `borderRadius: BorderRadius.md`, height 64, centered content | Tap opens image picker (camera or gallery). After selection, shows thumbnail preview |
| Screenshot icon | Ionicons | `camera-outline`, size 20, `Colors.textTertiary` | Centered in picker area |
| Screenshot label | Text | `Typography.caption`, `Colors.textTertiary` | "Tap to add screenshot" |
| Screenshot preview | Image | width 48, height 48, `borderRadius: BorderRadius.sm` | Shown after image selected, with (X) remove button |
| Notes input | TextInput | `Typography.body`, `Colors.textPrimary`, minHeight 72, `textAlignVertical: 'top'` | `multiline: true`, placeholder: "Any additional context...", max 500 chars |
| Input border (default) | View | `borderWidth: 1`, `borderColor: Colors.border`, `borderRadius: BorderRadius.md`, height varies, `paddingHorizontal: Spacing.lg` | Default border |
| Input border (focused) | View | `borderColor: Colors.brandGold` | Focus state highlight |
| Input border (error) | View | `borderColor: Colors.danger` | Validation error state |
| Submit CTA | TouchableOpacity | `Colors.brandGold` fill, `BorderRadius.md`, height 48, full width | Disabled until required fields filled |
| Submit text | Text | `Typography.bodyBold`, `Colors.brandCharcoal` | "Submit Report" |
| Helper text | Text | `Typography.caption`, `Colors.textTertiary`, centered, `marginTop: Spacing.md` | "You can track your submission in Profile > My Submissions" |
| Field spacing | View | `marginBottom: Spacing.lg` (16px) | Between each field group |
| Sheet background | View | `Colors.surface`, `borderTopLeftRadius: BorderRadius.lg`, `borderTopRightRadius: BorderRadius.lg` | White background with rounded top |
| Backdrop | TouchableOpacity | `rgba(0, 0, 0, 0.3)`, fills screen behind sheet | Tap to dismiss (with unsaved changes confirmation) |

#### 16.1.5 Change Type Dropdown Options

| Value | Display Label | Icon | Description |
|-------|--------------|------|-------------|
| `earn_rate` | Earn Rate Change | `trending-up` / `trending-down` | Base or bonus earn rate increased or decreased |
| `cap_change` | Cap Adjustment | `bar-chart-outline` | Monthly or annual cap amount changed |
| `devaluation` | Program Devaluation | `arrow-down-circle-outline` | Transfer ratio or partner rates worsened |
| `partner_change` | Partner Change | `swap-horizontal-outline` | Transfer partner added or removed |
| `fee_change` | Fee Change | `cash-outline` | Annual fee, transfer fee, or other fee changed |

#### 16.1.6 Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Card | Required | "Please select a card" |
| Change type | Required | "Please select a change type" |
| Old value | Required, 1-100 chars | "Please enter the previous value" |
| New value | Required, 1-100 chars | "Please enter the new value" |
| Old value != New value | Values must differ | "Old and new values must be different" |
| Effective date | Required, not future (max today + 7 days) | "Date cannot be more than 7 days in the future" |
| Evidence URL | Optional; if provided, must be valid URL (starts with http:// or https://) | "Please enter a valid URL" |
| Screenshot | Optional; max file size 5 MB, formats: JPEG, PNG | "Image must be under 5 MB" |
| Notes | Optional, max 500 chars | Character counter shown at 400+ chars |
| Rate limit | Max 5 submissions per user per day | "You've reached the daily submission limit (5/day). Try again tomorrow." |

**Validation display**: Inline error text below the field in `Typography.caption`, `Colors.danger`. Field border turns red. Errors shown on Submit tap (not on blur, to avoid premature validation during typing).

#### 16.1.7 User Flow

```
[Card Detail Screen]
    |
    +--> [User taps "Report a Change" link]
              |
              v
         [Bottom Sheet slides up — form pre-filled with card context]
              |
              +--> [User fills required fields (change type, old/new values, date)]
              |    [User optionally adds category, evidence URL, screenshot, notes]
              |         |
              |         +--> [User taps "Submit Report"]
              |                   |
              |                   v
              |              [Validation passes?]
              |                   |
              |              +----+----+
              |              |         |
              |             YES        NO
              |              |         |
              |              v         v
              |         [Submit to    [Show inline
              |          Supabase]     validation errors]
              |              |
              |              v
              |         [Success state replaces form content]
              |         [Checkmark + "Submission Received!" + status info]
              |              |
              |              +--> [Auto-dismiss after 2s OR user taps "Done"]
              |                        |
              |                        v
              |                   [Sheet dismisses]
              |                   [Card detail screen refreshed]
              |
              +--> [User swipes down / taps backdrop]
                        |
                        v
                   [Unsaved changes?]
                        |
                   +----+----+
                   |         |
                  YES        NO
                   |         |
                   v         v
              [Confirm      [Dismiss sheet,
               discard       no change]
               alert]
```

#### 16.1.8 Success State

After successful submission, the bottom sheet content transitions to a success state:

```
+--------------------------------------------------+
|  ------  (drag handle)                            |
|                                                    |
|           [checkmark-circle]  (48px, gold)         |
|                                                    |
|           Submission Received!                     |
|                                                    |
|     Your report is now pending review.             |
|     We'll notify you when it's reviewed.           |
|                                                    |
|           Status: [Pending]  (amber pill)          |
|                                                    |
|  [              Done              ]                |
+--------------------------------------------------+
```

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Checkmark icon | Ionicons | `checkmark-circle`, size 48, `Colors.brandGold` | Centered, scale animation 0->1 (400ms spring) |
| Title | Text | `Typography.subheading`, `Colors.textPrimary`, centered | "Submission Received!" |
| Description | Text | `Typography.body`, `Colors.textSecondary`, centered | "Your report is now pending review..." |
| Status badge | View | Amber pill (see 16.2.3 status badges) | "Pending" |
| Done CTA | TouchableOpacity | `Colors.brandGold` fill, `BorderRadius.md`, height 48 | Dismisses sheet |

#### 16.1.9 Error State

If the submission fails (network error, rate limit exceeded):

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Error alert | View | `backgroundColor: 'rgba(234, 67, 53, 0.08)'`, `borderRadius: BorderRadius.md`, padding `Spacing.md`, `marginBottom: Spacing.md` | Red-tinted alert box above Submit button |
| Error icon | Ionicons | `alert-circle`, size 18, `Colors.danger` | Left of error text |
| Error text | Text | `Typography.caption`, `Colors.danger` | Error message (network: "Failed to submit. Please try again.", rate limit: "You've reached the daily submission limit.") |
| Retry | -- | -- | Submit button remains active for retry on network error; disabled + countdown for rate limit |

---

### 16.2 My Submissions Screen (T13.15)

**Route**: `/profile/submissions` (accessible from Profile/Settings section)
**Layout**: ScrollView with ImageBackground (background.png), Stack.Screen header
**Header**: Back arrow + "My Submissions" title

#### 16.2.1 Entry Point

Add a row in the Profile/Settings screen:

```
Profile / Settings:
+--------------------------------------------------+
|  ...existing settings rows...                     |
|                                                    |
|  +----------------------------------------------+ |
|  | [flag-outline]  My Submissions           [>] | |  <-- NEW entry point
|  |                 3 submissions                 | |
|  +----------------------------------------------+ |
|                                                    |
|  ...remaining settings rows...                    |
+--------------------------------------------------+
```

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Row container | TouchableOpacity | Glassmorphic card style, height 56 | Navigates to `/profile/submissions` |
| Icon | Ionicons | `flag-outline`, size 20, `Colors.brandGold` | Left icon in gold gradient circle (30x30) |
| Label | Text | `Typography.body`, `Colors.textPrimary` | "My Submissions" |
| Count | Text | `Typography.caption`, `Colors.textSecondary` | "{n} submissions" (or hidden if 0) |
| Chevron | Ionicons | `chevron-forward`, size 18, `Colors.textTertiary` | Right-aligned |

#### 16.2.2 Screen — Component Layout

```
+--------------------------------------------------+
|  < Back        My Submissions        [MaxiMile]  |
+--------------------------------------------------+
|                                                    |
|  [Verified Contributor]          <-- badge (if    |
|  3 approved submissions           earned, see 16.3)|
|                                                    |
|  +----------------------------------------------+ |
|  | DBS Woman's World Card                        | |
|  | Earn Rate Change — Dining                     | |
|  | 4 mpd -> 3 mpd                                | |
|  | Submitted: 15 Feb 2026         [Approved]     | |  <-- green pill
|  +----------------------------------------------+ |
|                                                    |
|  +----------------------------------------------+ |
|  | Citi PremierMiles                             | |
|  | Cap Adjustment                                | |
|  | S$10,000/yr -> S$8,000/yr                     | |
|  | Submitted: 18 Feb 2026         [Pending]      | |  <-- amber pill
|  +----------------------------------------------+ |
|                                                    |
|  +----------------------------------------------+ |
|  | OCBC 90N                                      | |
|  | Fee Change                                    | |
|  | S$192.60/yr -> S$214.00/yr                    | |
|  | Submitted: 20 Feb 2026         [Under Review] | |  <-- blue pill
|  +----------------------------------------------+ |
|                                                    |
|  +----------------------------------------------+ |
|  | UOB PRVI Miles                                | |
|  | Partner Change                                | |
|  | Added EVA Air as transfer partner             | |
|  | Submitted: 10 Feb 2026         [Rejected]     | |  <-- red pill
|  |                                                | |
|  | Reason: Unable to verify this change from     | |
|  | official sources.                              | |  <-- rejection reason
|  +----------------------------------------------+ |
|                                                    |
+--------------------------------------------------+
|  Recommend | Cards | Caps | Log | Miles           |
+--------------------------------------------------+
```

#### 16.2.3 Status Badge Variants

| Status | Label | Background | Text Color | Icon | Description |
|--------|-------|------------|------------|------|-------------|
| `pending` | "Pending" | `rgba(251, 188, 4, 0.12)` | `#FBBC04` (Colors.warning) | `time-outline` (12px) | Submission awaiting admin review |
| `under_review` | "Under Review" | `rgba(74, 144, 217, 0.12)` | `#4A90D9` (Colors.primaryLight) | `eye-outline` (12px) | Admin is actively reviewing |
| `approved` | "Approved" | `rgba(52, 168, 83, 0.12)` | `#34A853` (Colors.success) | `checkmark-circle-outline` (12px) | Verified and accepted |
| `rejected` | "Rejected" | `rgba(234, 67, 53, 0.12)` | `#EA4335` (Colors.danger) | `close-circle-outline` (12px) | Not verified or inaccurate |
| `merged` | "Merged" | `rgba(197, 165, 90, 0.12)` | `#C5A55A` (Colors.brandGold) | `git-merge-outline` (12px) | Published to rate_changes table |

**Badge styling** (same pattern as EligibilityBadge):

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Badge container | View | `flexDirection: 'row'`, `alignItems: 'center'`, `borderRadius: BorderRadius.full`, `paddingHorizontal: Spacing.sm` (8px), `paddingVertical: 2`, `height: 22` | Pill shape, background color per status |
| Badge icon | Ionicons | Status-specific, size 12, same color as text | `marginRight: 3` |
| Badge text | Text | `fontSize: 11`, `fontWeight: '600'`, `lineHeight: 16` | Color per status variant |

#### 16.2.4 Submission Card — Component Table

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Card container | View | Glassmorphic card style (same as `MilesProgramCard`) | One per submission, not tappable in v1 |
| Card name | Text | `Typography.bodyBold`, `Colors.textPrimary` | e.g. "DBS Woman's World Card" |
| Change type + category | Text | `Typography.caption`, `Colors.textSecondary` | "Earn Rate Change -- Dining" (category appended if present) |
| Value change | Text | `Typography.caption`, `Colors.textPrimary` | "{old_value} -> {new_value}" using arrow character |
| Old value in change line | Text | `Typography.caption`, `Colors.textSecondary` | The old value portion |
| Arrow | Text | `Typography.caption`, `Colors.textTertiary` | " -> " separator |
| New value in change line | Text | `Typography.captionBold`, `Colors.textPrimary` | The new value portion (bold) |
| Submitted date | Text | `Typography.caption`, `Colors.textTertiary` | "Submitted: 15 Feb 2026" |
| Status badge | StatusBadge component | See 16.2.3 | Right-aligned on date row |
| Rejection reason container | View | `backgroundColor: 'rgba(234, 67, 53, 0.05)'`, `borderRadius: BorderRadius.sm`, padding `Spacing.sm`, `marginTop: Spacing.sm` | Only shown for rejected submissions |
| Rejection reason text | Text | `Typography.caption`, `Colors.textSecondary`, `fontStyle: 'italic'` | "Reason: {admin_notes}" |
| Card separator | View | `height: Spacing.sm` (8px) | Between submission cards |

#### 16.2.5 Component Tree

```
MySubmissionsScreen
  SafeAreaView
    ImageBackground (background.png)
      Stack.Screen (header: "My Submissions")
      ScrollView (RefreshControl)
        ContributorBadgeHeader (if earned — see 16.3)
        SubmissionCardList
          SubmissionCard (one per submission)
            CardName
            ChangeTypeLabel
            ValueChangeRow (old -> new)
            SubmittedDateRow
              DateText
              StatusBadge
            RejectionReason (conditional)
        EmptyState (if no submissions)
```

#### 16.2.6 Empty State

When user has no submissions:

```
+--------------------------------------------------+
|                                                    |
|           [flag-outline]  (64px, tertiary)         |
|                                                    |
|         No submissions yet                         |
|                                                    |
|  Noticed a rate change? Report it from any         |
|  card's detail screen to help keep our             |
|  data accurate.                                    |
|                                                    |
+--------------------------------------------------+
```

| Component | Value |
|-----------|-------|
| Icon | `flag-outline` (Ionicons, size 64, `Colors.textTertiary`) |
| Title | "No submissions yet" |
| Description | "Noticed a rate change? Report it from any card's detail screen to help keep our data accurate." |

Uses inline centered text layout (same pattern as Layer 1/Layer 2 empty states), not the full-screen `EmptyState` component.

#### 16.2.7 Sorting and Loading

- **Sort order**: Newest first (`created_at` descending)
- **Pull-to-refresh**: Standard RefreshControl to refetch submission list
- **Loading state**: `LoadingSpinner` with "Loading submissions..." centered
- **Pagination**: Not needed in v1 (expect <50 submissions per user)
- **Data source**: `community_submissions` table filtered by `user_id = auth.uid()`

---

### 16.3 Contributor Badge (T13.16)

**Purpose**: Reward active community members who submit verified rate changes.
**Threshold**: Earned after 3+ submissions with status `'approved'` or `'merged'`.
**Visual**: Gold pill badge, similar to `RateUpdatedBadge` styling.

#### 16.3.1 Visual Spec

```
Badge (collapsed):
  [star-outline] Verified Contributor

Badge with count:
  [star-outline] Verified Contributor  ·  5 approved
```

#### 16.3.2 Component Table

| Component | Type | Token | Notes |
|-----------|------|-------|-------|
| Badge container | View | `flexDirection: 'row'`, `alignItems: 'center'`, `backgroundColor: 'rgba(197, 165, 90, 0.12)'`, `borderRadius: BorderRadius.full`, `paddingHorizontal: Spacing.md` (12px), `paddingVertical: Spacing.xs` (4px), `height: 28` | Gold pill — slightly taller than status badges to indicate prominence |
| Badge icon | Ionicons | `star-outline`, size 14, `Colors.brandGold` | `marginRight: Spacing.xs` (4px) |
| Badge label | Text | `fontSize: 12`, `fontWeight: '600'`, `Colors.brandGold` | "Verified Contributor" |
| Separator dot | Text | `fontSize: 12`, `Colors.brandGold`, `opacity: 0.5` | " . " between label and count |
| Approved count | Text | `fontSize: 11`, `fontWeight: '400'`, `Colors.brandGold`, `opacity: 0.7` | "{n} approved" — shown only on My Submissions screen |
| Touch wrapper | TouchableOpacity | `activeOpacity: 0.7` | Optional: tap could show tooltip explaining the badge |

#### 16.3.3 Placement

| Context | Position | Variant |
|---------|----------|---------|
| My Submissions screen | Top of screen, below header, above submission list | Full badge with count: "Verified Contributor . 5 approved" |
| Profile / Settings screen | Inline after user name or in settings row | Compact badge: "Verified Contributor" (no count) |

#### 16.3.4 Badge Logic

| Rule | Specification |
|------|---------------|
| Threshold | `COUNT(*) >= 3` from `community_submissions` WHERE `status IN ('approved', 'merged')` AND `user_id = auth.uid()` |
| Display | Badge visible only when threshold met. Below threshold: no badge shown |
| Persistence | Calculated on screen load — not cached (cheap query) |
| Edge case: Approved then reverted | If admin changes status from approved to rejected, count decreases. Badge disappears if count drops below 3 |
| First-time earn | No special animation in v1. Badge simply appears when threshold met |

#### 16.3.5 Design Tokens

```typescript
const contributorBadge = {
  backgroundColor: 'rgba(197, 165, 90, 0.12)',  // Same as RateUpdatedBadge
  borderRadius: BorderRadius.full,                // 9999
  paddingHorizontal: Spacing.md,                  // 12
  paddingVertical: Spacing.xs,                    // 4
  height: 28,
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',
};

const contributorBadgeText = {
  fontSize: 12,
  fontWeight: '600',
  color: Colors.brandGold,                        // #C5A55A
};
```

#### 16.3.6 Accessibility

- `accessibilityRole="text"` (informational, not interactive in most contexts)
- `accessibilityLabel="Verified Contributor badge — you have {n} approved submissions"`
- On My Submissions screen: announces badge + count on screen reader focus

---

### 16.4 Admin Review Dashboard — Web App (T13.10)

**Platform**: Separate web application deployed on Cloudflare Pages
**URL**: `admin.maximile.app` or `maximile-admin.pages.dev`
**Auth**: Supabase Auth — admin role check via `admin_users` table
**Design language**: Clean, functional, table-based. NOT glassmorphic. Standard web UI patterns.

**Color scheme**:
- Background: `#F8FAFC` (light gray)
- Surface: `#FFFFFF` (white cards/panels)
- Text primary: `#1E293B` (slate-900)
- Text secondary: `#64748B` (slate-500)
- Border: `#E2E8F0` (slate-200)
- Status colors: Same as in-app status badge colors (amber/blue/green/red/gold)

#### 16.4.1 List View — Component Layout

```
+-------------------------------------------------------------------+
|  [MaxiMile Admin]            Community Submissions    [admin@...]  |
+-------------------------------------------------------------------+
|                                                                     |
|  Filters:                                                          |
|  [Status: All    v]  [Card: All     v]  [Date: Last 30d   v]      |
|  [Type: All      v]  [Search: ___________________________]        |
|                                                                     |
|  Showing 24 submissions (8 pending, 3 under review)                |
|                                                                     |
|  +---------------------------------------------------------------+ |
|  | # | Card            | Type       | Old     | New     | Date   | |
|  |   |                 |            |         |         |        | |
|  |---|-----------------|------------|---------|---------|--------| |
|  |   |                 |            |         |         | Status | |
|  |---|-----------------|------------|---------|---------|--------| |
|  | 1 | DBS Woman's     | earn_rate  | 4 mpd   | 3 mpd   | 15 Feb | |
|  |   | World Card      |            |         |         |[Pending]| |
|  |---|-----------------|------------|---------|---------|--------| |
|  | 2 | Citi Premier    | cap_change | S$10k/y | S$8k/y  | 18 Feb | |
|  |   | Miles           |            |         |         |[Pending]| |
|  |---|-----------------|------------|---------|---------|--------| |
|  | 3 | OCBC 90N        | fee_change | S$192   | S$214   | 20 Feb | |
|  |   |                 |            |         |         |[Review]| |
|  |---|-----------------|------------|---------|---------|--------| |
|  | 4 | Amex KF Ascend  | devaluat.  | 1:1     | 1.5:1   | 12 Feb | |
|  |   |                 |            |         |         |[Approved]|
|  |---|-----------------|------------|---------|---------|--------| |
|  | 5 | HSBC Revolution | partner_ch | N/A     | +Qatar  | 10 Feb | |
|  |   |                 |            |         |         |[Rejected]|
|  +---------------------------------------------------------------+ |
|                                                                     |
|  [< Prev]  Page 1 of 3  [Next >]                                  |
|                                                                     |
+-------------------------------------------------------------------+
```

#### 16.4.2 List View — Component Table

| Component | Type | Style | Notes |
|-----------|------|-------|-------|
| Page header | `header` | `background: #FFFFFF`, `borderBottom: 1px solid #E2E8F0`, `padding: 16px 24px`, `display: flex`, `justifyContent: space-between` | Logo left, title center, admin email right |
| Logo | `img` | MaxiMile brand logo, height 28px | Links to dashboard home |
| Page title | `h1` | `font-size: 20px`, `font-weight: 600`, `color: #1E293B` | "Community Submissions" |
| Admin email | `span` | `font-size: 13px`, `color: #64748B` | `admin_users.email` |
| Filter bar | `div` | `display: flex`, `gap: 12px`, `padding: 16px 24px`, `background: #F8FAFC`, `flexWrap: wrap` | Contains all filter controls |
| Filter dropdown | `select` | `height: 36px`, `border: 1px solid #E2E8F0`, `borderRadius: 6px`, `padding: 0 12px`, `fontSize: 13px` | Status, Card, Date range, Type |
| Search input | `input` | Same height/border as dropdowns, `width: 240px`, `paddingLeft: 32px` | Search icon prefix. Searches card name, notes |
| Results summary | `p` | `fontSize: 13px`, `color: #64748B`, `padding: 0 24px 8px` | "Showing 24 submissions (8 pending, 3 under review)" |
| Table container | `div` | `background: #FFFFFF`, `border: 1px solid #E2E8F0`, `borderRadius: 8px`, `margin: 0 24px`, `overflow: hidden` | Wraps table |
| Table | `table` | `width: 100%`, `borderCollapse: collapse` | Standard HTML table |
| Table header | `th` | `fontSize: 12px`, `fontWeight: 600`, `color: #64748B`, `textTransform: uppercase`, `letterSpacing: 0.5px`, `padding: 12px 16px`, `borderBottom: 2px solid #E2E8F0`, `textAlign: left` | Column headers |
| Table row | `tr` | `borderBottom: 1px solid #F1F5F9`, hover: `background: #F8FAFC`, `cursor: pointer` | Click navigates to detail view |
| Table cell | `td` | `fontSize: 14px`, `color: #1E293B`, `padding: 12px 16px` | Standard cell |
| Status badge | `span` | `fontSize: 11px`, `fontWeight: 600`, `borderRadius: 9999px`, `padding: 2px 8px`, status-colored background/text | Same colors as in-app badges |
| Pagination | `div` | `display: flex`, `justifyContent: center`, `alignItems: center`, `gap: 16px`, `padding: 16px` | Prev/Next + page indicator |
| Pagination button | `button` | `fontSize: 13px`, `color: #64748B`, `border: 1px solid #E2E8F0`, `borderRadius: 6px`, `padding: 6px 12px`, disabled: `opacity: 0.5` | Prev / Next |

#### 16.4.3 List View — Filter Options

| Filter | Options | Default |
|--------|---------|---------|
| Status | All, Pending, Under Review, Approved, Rejected, Merged | Pending (show actionable items first) |
| Card | All, + dropdown of all 29 active cards | All |
| Date | Last 7 days, Last 30 days, Last 90 days, All time | Last 30 days |
| Type | All, Earn Rate Change, Cap Adjustment, Program Devaluation, Partner Change, Fee Change | All |
| Search | Free-text | Empty |

#### 16.4.4 Detail View — Component Layout

```
+-------------------------------------------------------------------+
|  [MaxiMile Admin]  < Back to List    Community Submissions         |
+-------------------------------------------------------------------+
|                                                                     |
|  Submission #17                              Status: [Pending]     |
|  Submitted by: user_abc...xyz    on 15 Feb 2026 at 14:23          |
|                                                                     |
|  +---------------------------------------------------------------+ |
|  |  SUBMISSION DETAILS                                            | |
|  |                                                                | |
|  |  Card:           DBS Woman's World Card                       | |
|  |  Change Type:    Earn Rate Change                             | |
|  |  Category:       Dining                                       | |
|  |  Old Value:      4 mpd                                        | |
|  |  New Value:      3 mpd                                        | |
|  |  Effective Date: 1 Mar 2026                                   | |
|  |  Evidence URL:   https://www.dbs.com.sg/...  [Open]           | |
|  |  Screenshot:     [thumbnail]  [View Full Size]                | |
|  |  Notes:          "Noticed this change on the DBS T&C page     | |
|  |                   effective March 2026..."                     | |
|  +---------------------------------------------------------------+ |
|                                                                     |
|  +---------------------------------------------------------------+ |
|  |  DUPLICATE CHECK                                               | |
|  |                                                                | |
|  |  [!] Possible duplicate: Submission #12 (approved, 10 Feb)    | |
|  |      Same card + change type. Old: 4 mpd -> New: 3.5 mpd     | |
|  |      [View Submission #12]                                     | |
|  |                                                                | |
|  |  No matching rate_changes record found.                        | |
|  +---------------------------------------------------------------+ |
|                                                                     |
|  +---------------------------------------------------------------+ |
|  |  ADMIN ACTIONS                                                 | |
|  |                                                                | |
|  |  Admin Notes:                                                  | |
|  |  +-----------------------------------------------------------+| |
|  |  |                                                           || |
|  |  +-----------------------------------------------------------+| |
|  |                                                                | |
|  |  [Approve]    [Edit & Approve]    [Reject]                    | |
|  |                                                                | |
|  |  Severity (for approve):  [Warning v]                         | |
|  |  Alert title:  [Rate cut: DBS Woman's World Dining_______]    | |
|  |  Alert body:   [Dining earn rate reduced from 4 to 3 mpd ]    | |
|  +---------------------------------------------------------------+ |
|                                                                     |
|  REVIEW HISTORY                                                    |
|  [No review actions yet]                                           |
|                                                                     |
+-------------------------------------------------------------------+
```

#### 16.4.5 Detail View — Component Table

| Component | Type | Style | Notes |
|-----------|------|-------|-------|
| Back link | `a` | `fontSize: 14px`, `color: #64748B`, hover: `color: #1E293B` | "< Back to List" — navigates to list view |
| Submission ID | `h2` | `fontSize: 18px`, `fontWeight: 600`, `color: #1E293B` | "Submission #17" |
| Status badge | `span` | Same as list view badges, larger: `fontSize: 13px`, `padding: 4px 12px` | Right-aligned from title |
| Submitter info | `p` | `fontSize: 13px`, `color: #64748B` | "Submitted by: {user_id truncated} on {date} at {time}" |
| Section card | `div` | `background: #FFFFFF`, `border: 1px solid #E2E8F0`, `borderRadius: 8px`, `padding: 24px`, `marginBottom: 16px` | Groups related content |
| Section title | `h3` | `fontSize: 12px`, `fontWeight: 600`, `color: #64748B`, `textTransform: uppercase`, `letterSpacing: 0.5px`, `marginBottom: 16px` | "SUBMISSION DETAILS", "ADMIN ACTIONS", etc. |
| Detail row | `div` | `display: flex`, `marginBottom: 12px` | Label + value pair |
| Detail label | `span` | `fontSize: 14px`, `color: #64748B`, `width: 140px`, `flexShrink: 0` | "Card:", "Change Type:", etc. |
| Detail value | `span` | `fontSize: 14px`, `color: #1E293B`, `fontWeight: 500` | The submitted value |
| Evidence link | `a` | `color: #3B82F6` (blue-500), `textDecoration: underline` | Opens in new tab |
| Screenshot thumbnail | `img` | `width: 80px`, `height: 80px`, `objectFit: cover`, `borderRadius: 6px`, `border: 1px solid #E2E8F0` | Clickable to full-size view |
| Duplicate alert | `div` | `background: #FFF7ED` (amber-50), `border: 1px solid #FED7AA` (amber-200), `borderRadius: 6px`, `padding: 12px` | Amber warning box for possible duplicates |
| Duplicate icon | -- | `color: #F59E0B` (amber-500) | Warning triangle icon |
| Admin notes textarea | `textarea` | `width: 100%`, `minHeight: 80px`, `border: 1px solid #E2E8F0`, `borderRadius: 6px`, `padding: 12px`, `fontSize: 14px`, focus: `borderColor: #3B82F6` | Freeform notes, saved with action |
| Approve button | `button` | `background: #34A853`, `color: #FFFFFF`, `fontWeight: 600`, `fontSize: 14px`, `borderRadius: 6px`, `padding: 8px 20px`, hover: `background: #2D9249` | Inserts into `rate_changes` table |
| Edit & Approve button | `button` | `background: #3B82F6` (blue-500), `color: #FFFFFF`, same sizing as Approve | Opens editable fields for old/new value, then approves |
| Reject button | `button` | `background: #FFFFFF`, `color: #EA4335`, `border: 1px solid #EA4335`, same sizing | Requires admin notes (reason) |
| Severity selector | `select` | Standard select, same as filter dropdowns | Options: "info", "warning", "critical". Default: "warning" |
| Alert title input | `input` | `width: 100%`, `height: 36px`, standard border style | Pre-filled from submission: "{change_type}: {card_name}" |
| Alert body input | `input` | Same style as title input | Pre-filled: "{category} {old_value} to {new_value}" |

#### 16.4.6 Admin Action Flows

**Approve**:
```
[Admin clicks "Approve"]
    |
    v
[Confirm dialog: "Approve this submission? This will create a rate_changes record
 visible to all affected users."]
    |
    +--> [Admin confirms]
    |         |
    |         v
    |    [API call: approve_submission(submission_id, severity, alert_title, alert_body, admin_notes)]
    |         |
    |         v
    |    [Backend: UPDATE community_submissions SET status = 'approved', reviewed_by, reviewed_at]
    |    [Backend: INSERT INTO rate_changes (...) -- with detection_source = 'community']
    |    [Backend: UPDATE community_submissions SET status = 'merged']
    |         |
    |         v
    |    [UI: Status badge updates to "Merged". Success toast.]
    |    [All portfolio-matched users now see the banner/badge via existing F23 components]
    |
    +--> [Admin cancels]
              |
              v
         [Dialog closes, no change]
```

**Reject**:
```
[Admin clicks "Reject"]
    |
    v
[Admin notes textarea must be non-empty (reason required)]
    |
    +--> [Notes empty?] --> [Show validation: "Please provide a reason for rejection"]
    |
    +--> [Notes provided] --> [Confirm dialog: "Reject this submission?"]
              |
              +--> [Admin confirms]
              |         |
              |         v
              |    [API call: reject_submission(submission_id, admin_notes)]
              |    [Backend: UPDATE community_submissions SET status = 'rejected', admin_notes, reviewed_by, reviewed_at]
              |    [UI: Status badge updates to "Rejected". Toast notification.]
              |
              +--> [Admin cancels] --> [No change]
```

**Edit & Approve**:
```
[Admin clicks "Edit & Approve"]
    |
    v
[Detail fields become editable: old_value, new_value, category, effective_date]
[Two additional buttons appear: "Save & Approve" / "Cancel Edit"]
    |
    +--> [Admin modifies values] --> [Clicks "Save & Approve"]
    |         |
    |         v
    |    [Same approve flow, but with modified values]
    |
    +--> [Admin clicks "Cancel Edit"]
              |
              v
         [Fields revert to read-only, original values restored]
```

#### 16.4.7 Duplicate Detection Display

The detail view shows a "Duplicate Check" section that queries for:
1. Existing `community_submissions` with same `card_id` + `change_type` within 30 days
2. Existing `rate_changes` records with same `card_id` + `change_type` within 90 days

| Scenario | Display |
|----------|---------|
| No duplicates found | "No potential duplicates detected." in green text |
| Similar submission exists | Amber warning: "Possible duplicate: Submission #{id} ({status}, {date}). Same card + change type." with link to view |
| Matching rate_change exists | Amber warning: "A matching rate change record already exists (created {date}). This submission may be redundant." with link |

#### 16.4.8 Review History

Below the admin actions section, show a log of all review actions taken:

```
REVIEW HISTORY
  [2026-02-21 10:15] admin@maximile.app — Changed status to "under_review"
  [2026-02-21 14:30] admin@maximile.app — Approved. Notes: "Verified via DBS T&C page."
```

| Component | Type | Style | Notes |
|-----------|------|-------|-------|
| History row | `div` | `fontSize: 13px`, `color: #64748B`, `padding: 8px 0`, `borderBottom: 1px solid #F1F5F9` | One per action |
| Timestamp | `span` | `fontFamily: 'monospace'`, `fontSize: 12px`, `color: #94A3B8` | ISO-ish format: YYYY-MM-DD HH:MM |
| Admin email | `span` | `fontWeight: 500`, `color: #1E293B` | Who performed the action |
| Action description | `span` | `color: #64748B` | What was done |

---

### 16.5 New Components to Build (Sprint 13)

| Component | File Path | Description |
|-----------|-----------|-------------|
| `SubmissionFormSheet` | `components/SubmissionFormSheet.tsx` | Bottom sheet with rate change submission form. Props: `visible`, `onDismiss`, `cardId?` (pre-fill), `cardName?` |
| `SubmissionStatusBadge` | `components/SubmissionStatusBadge.tsx` | Pill badge for submission status (5 variants). Props: `status: SubmissionStatus`, `size?: 'sm' | 'md'` |
| `SubmissionCard` | `components/SubmissionCard.tsx` | Glassmorphic card displaying a single submission in list view. Props: `submission: CommunitySubmission` |
| `ContributorBadge` | `components/ContributorBadge.tsx` | Gold pill badge for verified contributors. Props: `approvedCount: number`, `showCount?: boolean` |

**Existing components reused**:
| Component | Usage |
|-----------|-------|
| `BottomSheet` | Wraps submission form |
| `EmptyState` pattern | My Submissions empty state (inline variant) |
| Glassmorphic card style | Submission cards on My Submissions screen |

**Admin dashboard** (separate repo / directory):
| File | Purpose |
|------|---------|
| `admin/src/pages/submissions.tsx` | List view with table, filters, pagination |
| `admin/src/pages/submissions/[id].tsx` | Detail view with review actions |
| `admin/src/components/StatusBadge.tsx` | Web status badge (HTML/CSS) |
| `admin/src/components/SubmissionTable.tsx` | Sortable, filterable table |
| `admin/src/components/ReviewActions.tsx` | Approve/Reject/Edit action buttons + forms |

### 16.6 File Structure Update

```
maximile-app/
  app/
    profile/
      submissions.tsx              -- My Submissions screen (NEW — F24)
  components/
    SubmissionFormSheet.tsx         -- Rate change submission bottom sheet (NEW — F24)
    SubmissionStatusBadge.tsx       -- Status pill badge component (NEW — F24)
    SubmissionCard.tsx              -- Single submission card display (NEW — F24)
    ContributorBadge.tsx            -- Verified Contributor badge (NEW — F24)

admin-dashboard/                    -- SEPARATE web app (Cloudflare Pages)
  src/
    pages/
      index.tsx                    -- Dashboard home / submissions list
      submissions/
        [id].tsx                   -- Submission detail + review
    components/
      StatusBadge.tsx              -- HTML/CSS status badge
      SubmissionTable.tsx          -- Table with sorting/filtering
      ReviewActions.tsx            -- Approve/Reject/Edit buttons
      DuplicateCheck.tsx           -- Duplicate detection display
    lib/
      supabase.ts                  -- Supabase client (admin role)
```

---

### 16.7 Interaction Patterns (Sprint 13 additions)

| Interaction | Target | Behavior |
|-------------|--------|----------|
| Tap | "Report a Change" link (card detail) | Open Submission Form Bottom Sheet with card pre-filled |
| Tap | Submit Report CTA | Validate form, submit to `community_submissions`, show success state |
| Tap | Screenshot picker | Open system image picker (camera or photo library) |
| Tap | Change type dropdown | Open ActionSheet with 5 options |
| Tap | Date picker row | Open system date picker (defaults to today) |
| Swipe down | Submission form sheet | If unsaved changes: confirm discard. Otherwise: dismiss |
| Tap | Backdrop (submission form) | Same as swipe down |
| Tap | "My Submissions" in Profile | Navigate to `/profile/submissions` |
| Pull down | My Submissions ScrollView | Refresh submission list |
| Tap | "Done" on success state | Dismiss submission form sheet |
| Click | Table row (admin list) | Navigate to submission detail view |
| Click | "Approve" (admin) | Confirm dialog, then approve + insert `rate_changes` |
| Click | "Reject" (admin) | Requires notes, then confirm dialog, then reject |
| Click | "Edit & Approve" (admin) | Fields become editable, then approve with modified values |

### 16.8 Animation Specs (Sprint 13)

| Transition | Type | Duration | Easing |
|------------|------|----------|--------|
| Submission form sheet open | Slide up from bottom | 250ms | `ease-out` |
| Submission form sheet dismiss | Slide down | 200ms | `ease-in` |
| Success state checkmark | Scale 0 to 1 with bounce | 400ms | `spring` (tension 150, friction 12) |
| Success state transition | Opacity cross-fade (form -> success) | 200ms | `ease-in-out` |
| Status badge entrance | Fade in | 200ms | `ease-in` |
| Contributor badge entrance | Fade in | 200ms | `ease-in` |
| Screenshot thumbnail appear | Scale 0.8 to 1 + fade in | 150ms | `ease-out` |

### 16.9 Accessibility (Sprint 13)

| Component | Requirement |
|-----------|-------------|
| "Report a Change" link | `accessibilityRole="button"`, `accessibilityLabel="Report a rate change for {cardName}"` |
| Submission form fields | All inputs have `accessibilityLabel` matching their label text. Error states announced via `accessibilityLiveRegion="polite"` |
| Change type dropdown | `accessibilityRole="button"`, `accessibilityLabel="Change type: {selected value}"`, `accessibilityHint="Double tap to change"` |
| Screenshot picker | `accessibilityRole="button"`, `accessibilityLabel="Add screenshot evidence"`, `accessibilityHint="Opens camera or photo library"` |
| Submit button | `accessibilityRole="button"`, disabled state: `accessibilityState={{ disabled: true }}`, `accessibilityLabel="Submit rate change report"` |
| Status badges | `accessibilityRole="text"`, `accessibilityLabel="Status: {status}"` |
| Submission cards | `accessibilityRole="summary"`, `accessibilityLabel="{card name}. {change type}. {old} to {new}. Status: {status}"` |
| Contributor badge | `accessibilityRole="text"`, `accessibilityLabel="Verified Contributor — {n} approved submissions"` |
| My Submissions empty state | `accessibilityRole="text"` on combined title + description |
| Admin dashboard | Standard web accessibility: `aria-label` on controls, `role="table"` on data table, keyboard-navigable actions |

### 16.10 Edge Cases (Sprint 13)

| Scenario | Behavior |
|----------|----------|
| User not signed in | "Report a Change" link hidden. My Submissions not accessible. |
| User at daily rate limit (5 submissions) | Submit button shows error: "You've reached the daily submission limit (5/day). Try again tomorrow." |
| Card pre-fill from context not available | Card selector shows "Select a card" placeholder. Required field validation applies. |
| Very long old/new value text | Truncate with ellipsis at 100 chars. Full text visible in admin detail view. |
| User submits duplicate (same card + type within 7 days) | Allow submission (user may not know it's a duplicate). Admin dedup section flags it. |
| Screenshot upload fails | Show retry option inline. Allow submission without screenshot (it's optional). |
| Large screenshot (>5 MB) | Show validation error: "Image must be under 5 MB". Prevent upload. |
| Network failure during submit | Error alert above Submit button. Form state preserved. User can retry. |
| Admin approves but rate_changes insert fails | Transaction rollback. Status reverts to previous. Error toast shown. |
| No admin_users exist | Dashboard shows "No admin access" screen. Prevents unauthorized actions. |
| Submission for a card that was deactivated | Still visible in My Submissions. Admin can review based on historical data. |
| Zero submissions in admin dashboard | Table shows "No submissions match your filters." with clear-filters link. |
| Admin rejects without providing reason | Validation error: "Please provide a reason for rejection." Reject button stays disabled until notes are entered. |
| User has exactly 3 approved submissions | Contributor badge appears on next screen load / refresh. |
| Contributor count drops below 3 (admin reverts approval) | Badge disappears on next screen load. No notification sent. |

---

### 16.11 Acceptance Criteria — Sprint 13 (Design)

#### 16.11.1 Submission Form (T13.05)

- [ ] "Report a Change" link appears on card detail screen below the card title, adjacent to RateUpdatedBadge.
- [ ] Link uses gold `flag-outline` icon + "Report a Change" text in `Colors.brandGold`.
- [ ] Tapping link opens a bottom sheet form with the card pre-filled from context.
- [ ] Form includes all required fields: card selector, change type dropdown (5 types), old value, new value, effective date.
- [ ] Form includes all optional fields: category, evidence URL, screenshot, notes.
- [ ] Change type dropdown shows 5 options matching the `rate_change_type` enum.
- [ ] Date picker defaults to today and disallows dates more than 7 days in the future.
- [ ] Screenshot picker opens system image picker (camera/gallery) with 5 MB max file size.
- [ ] Submit CTA is disabled until all required fields are filled and validation passes.
- [ ] Inline validation errors appear below fields in red on submit attempt.
- [ ] Success state shows checkmark icon + "Submission Received!" + Pending status badge + Done button.
- [ ] Dismissing form with unsaved changes shows a confirmation dialog.
- [ ] Bottom sheet matches existing sheet pattern: drag handle, backdrop, slide animation.
- [ ] Rate limit enforced: max 5 submissions per user per day with clear error message.

#### 16.11.2 My Submissions Screen (T13.15)

- [ ] Accessible from Profile/Settings via "My Submissions" row with flag icon.
- [ ] Screen shows all user's submissions sorted newest-first.
- [ ] Each submission card displays: card name, change type (+ category), old -> new values, submitted date, status badge.
- [ ] Five status badge variants render correctly: Pending (amber), Under Review (blue), Approved (green), Rejected (red), Merged (gold).
- [ ] Rejected submissions show the admin's rejection reason in a red-tinted container.
- [ ] Empty state shows flag icon + "No submissions yet" + instructional text.
- [ ] Pull-to-refresh updates the submission list.
- [ ] Screen uses ImageBackground consistent with all other app screens.

#### 16.11.3 Contributor Badge (T13.16)

- [ ] Gold pill badge with star icon + "Verified Contributor" text.
- [ ] Badge appears only when user has 3+ approved/merged submissions.
- [ ] On My Submissions screen: badge shown with approved count (e.g., "Verified Contributor . 5 approved").
- [ ] On Profile screen: compact badge without count.
- [ ] Badge uses `Colors.brandGold` text and `rgba(197, 165, 90, 0.12)` background — consistent with RateUpdatedBadge.
- [ ] Badge has appropriate accessibility labels.

#### 16.11.4 Admin Review Dashboard (T13.10)

- [ ] Separate web app with clean, functional design (NOT glassmorphic).
- [ ] List view shows submissions in a table with columns: #, Card, Type, Old, New, Date, Status.
- [ ] Filters available: status, card, date range, type, and free-text search.
- [ ] Default filter: status = "Pending" (shows actionable items).
- [ ] Clicking a table row navigates to the detail view.
- [ ] Detail view shows all submitted data including evidence URL (linked) and screenshot (thumbnail + full-size).
- [ ] Duplicate check section flags similar submissions and existing rate_changes records.
- [ ] Three action buttons: Approve (green), Edit & Approve (blue), Reject (red outlined).
- [ ] Approve inserts a new `rate_changes` record with `detection_source = 'community'`.
- [ ] Reject requires admin notes (reason) before confirming.
- [ ] Edit & Approve makes old/new value fields editable before approving.
- [ ] Severity selector and alert title/body fields available for approve actions.
- [ ] Review history log shows timestamped actions by admin.
- [ ] Status badges use consistent colors across web and mobile (amber/blue/green/red/gold).
- [ ] Admin auth checked via `admin_users` table — unauthorized users see access denied screen.

---

### 16.12 Open Design Questions (Sprint 13)

| # | Question | Options | Recommendation | Status |
|---|----------|---------|----------------|--------|
| 15 | Should the submission form validate evidence URL reachability (HTTP check)? | (a) Yes, async validation; (b) No, just format check | (b) Format check only -- URL may be behind auth or temporary. Admin verifies manually. | Open |
| 16 | Should rejected submissions be deletable by the user? | (a) Yes, swipe-to-delete; (b) No, keep for history | (b) No -- maintains audit trail. User can ignore rejected items. | Open |
| 17 | Should the admin dashboard show user reputation score? | (a) Yes, show approved/total ratio; (b) No, keep simple for v1 | (a) Yes -- helps admin triage. Show "3/5 approved" next to submitter info. Simple to compute. | Open |
| 18 | Should the "Report a Change" entry point appear on ALL card detail screens or only cards with existing rate_changes? | (a) All cards; (b) Only cards with rate change history | (a) All cards -- users may discover changes for cards without existing records. The entry point should be universal. | Open |
| 19 | Should the admin dashboard be SSR (server-side rendered) or SPA? | (a) SPA with Supabase client; (b) SSR with Cloudflare Workers | (a) SPA -- simpler, Supabase JS client works client-side, no server logic needed. Use React + Vite on Cloudflare Pages (static). | Open |
