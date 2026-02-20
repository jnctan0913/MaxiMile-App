# Design Requirements Document (DRD)
# MaxiMile — Credit Card Miles Optimizer

**Version**: 1.0
**Author**: UI/UX Designer Agent
**Date**: 2026-02-19
**Status**: Ready for Development
**Platform**: React Native (Expo) — iOS & Android

---

## Table of Contents

1. [Design System Foundation](#1-design-system-foundation)
2. [Navigation Architecture](#2-navigation-architecture)
3. [Screen 1: Sign Up / Login](#3-screen-1-sign-up--login)
4. [Screen 2: Onboarding — Add Cards](#4-screen-2-onboarding--add-cards)
5. [Screen 3: My Cards (Portfolio)](#5-screen-3-my-cards-portfolio)
6. [Screen 4: Recommend (Home)](#6-screen-4-recommend-home)
7. [Screen 5: Log Transaction](#7-screen-5-log-transaction)
8. [Screen 6: Cap Status Dashboard](#8-screen-6-cap-status-dashboard)
9. [Screen 7: Profile](#9-screen-7-profile)
10. [Tab Navigation Bar](#10-tab-navigation-bar)
11. [Shared Components](#11-shared-components)
12. [Full Navigation Flow Diagram](#12-full-navigation-flow-diagram)
13. [Behavioral Design Summary](#13-behavioral-design-summary)
14. [Developer Implementation Notes](#14-developer-implementation-notes)
15. [Brand Assets Reference](#15-brand-assets-reference)

---

## 1. Design System Foundation

### 1.1 Color System

| Token Name          | Hex       | Usage                                       |
|---------------------|-----------|---------------------------------------------|
| `primary`           | `#1A73E8` | Primary buttons, active tab, links, headers  |
| `primary-light`     | `#E8F0FE` | Primary tint backgrounds, selected states     |
| `success`           | `#34A853` | Cap < 80%, positive indicators, checkmarks    |
| `success-light`     | `#E6F4EA` | Success background tints                      |
| `warning`           | `#FBBC04` | Cap 80-99%, approaching limit indicators      |
| `warning-light`     | `#FEF7E0` | Warning background tints                      |
| `danger`            | `#EA4335` | Cap 100%, errors, destructive actions         |
| `danger-light`      | `#FCE8E6` | Error background tints                        |
| `bg-primary`        | `#FFFFFF` | Screen backgrounds, card surfaces             |
| `bg-secondary`      | `#F8F9FA` | Section backgrounds, input fields             |
| `bg-tertiary`       | `#E8EAED` | Dividers, disabled states                     |
| `text-primary`      | `#202124` | Headlines, body text, primary labels          |
| `text-secondary`    | `#5F6368` | Captions, timestamps, helper text             |
| `text-tertiary`     | `#9AA0A6` | Placeholders, disabled text                   |
| `text-on-primary`   | `#FFFFFF` | Text on primary-colored backgrounds           |
| `border`            | `#DADCE0` | Card borders, input borders, dividers         |
| `brand-gold`        | `#C5A55A` | Brand accent (from logo), premium highlights  |
| `brand-charcoal`    | `#2D3748` | Brand dark (from logo), premium text accents  |
| `baby-yellow`       | `#FDFD96` | Highlight backgrounds, feature callouts, recommendation badges, onboarding accents |
| `baby-yellow-light` | `#FEFED5` | Subtle highlight tint for cards and sections  |

### 1.2 Typography Scale

All typography uses the system default font: **SF Pro** on iOS, **Roboto** on Android.

| Token          | Size  | Weight    | Line Height | Usage                                   |
|----------------|-------|-----------|-------------|-----------------------------------------|
| `display`      | 32px  | Bold (700)| 40px        | Amount input on Log Transaction screen   |
| `heading-1`    | 24px  | Bold (700)| 32px        | Screen titles                            |
| `heading-2`    | 20px  | SemiBold (600) | 28px   | Section headers, card names (detail)     |
| `heading-3`    | 17px  | SemiBold (600) | 24px   | Card names (list), category tile labels  |
| `body`         | 15px  | Regular (400)  | 22px   | Body text, descriptions, list items      |
| `body-bold`    | 15px  | SemiBold (600) | 22px   | Earn rates, emphasized body text         |
| `caption`      | 13px  | Regular (400)  | 18px   | Helper text, timestamps, footnotes       |
| `caption-bold` | 13px  | SemiBold (600) | 18px   | Badges, status labels                    |
| `overline`     | 11px  | SemiBold (600) | 16px   | Category labels, tab labels              |

### 1.3 Spacing System (8px Grid)

| Token    | Value | Usage                                          |
|----------|-------|-------------------------------------------------|
| `xs`     | 4px   | Inline icon-to-text gap, tight internal padding  |
| `sm`     | 8px   | Between related elements within a component      |
| `md`     | 16px  | Standard padding, gap between components         |
| `lg`     | 24px  | Section spacing, card internal padding           |
| `xl`     | 32px  | Screen-edge horizontal padding, major sections   |
| `xxl`    | 48px  | Top-of-screen spacing, hero element padding      |

### 1.4 Component Tokens

| Token               | Value                | Usage                         |
|----------------------|----------------------|-------------------------------|
| `border-radius-sm`  | 8px                  | Buttons, inputs, small cards   |
| `border-radius-md`  | 12px                 | Cards, modals, category tiles  |
| `border-radius-lg`  | 16px                 | Bottom sheet, large cards      |
| `border-radius-full`| 999px                | Avatars, circular badges       |
| `shadow-sm`         | 0 1px 3px rgba(0,0,0,0.1) | Subtle lift (cards)     |
| `shadow-md`         | 0 2px 8px rgba(0,0,0,0.12)| Elevated cards, bottom nav |
| `shadow-lg`         | 0 4px 16px rgba(0,0,0,0.15)| Modals, overlays          |
| `tap-target-min`    | 44px                 | Minimum touch target (Apple HIG) |
| `icon-size-sm`      | 20px                 | Inline icons                   |
| `icon-size-md`      | 24px                 | Tab bar icons, action icons    |
| `icon-size-lg`      | 32px                 | Category tile emojis           |

### 1.5 Glassmorphism (Lite)

MaxiMile uses **lite glassmorphism** on select surfaces to create a premium, elegant feel that matches the gold/charcoal brand identity. Glass effects are applied sparingly — only where they add depth without hurting readability.

#### Glass Design Tokens

| Token               | Value                                          | Usage                            |
|----------------------|------------------------------------------------|----------------------------------|
| `glass-bg`          | `rgba(255, 255, 255, 0.7)`                    | Frosted glass card background     |
| `glass-bg-dark`     | `rgba(45, 55, 72, 0.6)`                       | Dark glass variant (brand-charcoal base) |
| `glass-blur`        | `20px`                                          | Backdrop blur intensity           |
| `glass-border`      | `1px solid rgba(255, 255, 255, 0.3)`          | Subtle glass edge highlight       |
| `glass-shadow`      | `0 8px 32px rgba(0, 0, 0, 0.08)`              | Soft elevation for glass cards    |

#### Where to Apply Glass

| Surface | Effect | Notes |
|---------|--------|-------|
| **Recommendation "Top Card" hero** | `glass-bg` + `glass-blur` + `glass-border` | The primary glass surface. Card name, earn rate, and cap bar float on a frosted backdrop. Makes the #1 recommendation feel premium and distinct from alternatives. |
| **Tab navigation bar** | `glass-bg` + `glass-blur` (lighter: 10px) | Frosted bottom tab bar. Content scrolls beneath it with visible blur. Use `expo-blur` `BlurView` with `intensity={30}`. |
| **Bottom sheets / modals** | `glass-bg` + `glass-blur` | Category picker, card picker, and confirmation dialogs use frosted glass overlay. |
| **Log Transaction success overlay** | `glass-bg-dark` + `glass-blur` | Dark frosted overlay showing "Logged!" confirmation with miles earned comparison. |
| **Login screen background** | Subtle gradient + `glass-bg` for the form card | Form floats on a frosted card over a brand-colored gradient background. |

#### Where NOT to Apply Glass

| Surface | Reason |
|---------|--------|
| Data-heavy lists (My Cards, Cap Status rows) | Glass reduces text contrast; readability is priority |
| Input fields | Users need clear, high-contrast inputs |
| Alternative recommendation cards | Only the top pick gets glass; alternatives stay flat to create hierarchy |
| Onboarding card list | Checkbox list needs max clarity for quick scanning |

#### Implementation (React Native)

```tsx
// Use expo-blur for glass effects
import { BlurView } from 'expo-blur';

// Glass card example (Recommendation hero)
<BlurView intensity={60} tint="light" style={styles.glassCard}>
  <View style={styles.glassContent}>
    {/* Card content */}
  </View>
</BlurView>

// Glass styles
const styles = {
  glassCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  glassContent: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // additional tint layer
  },
};
```

#### Performance Note
- Use `expo-blur` `BlurView` — optimized for React Native
- Limit blur to **max 5 surfaces visible at once** to avoid frame drops on low-end Android
- Fall back to semi-transparent solid background (`rgba(255,255,255,0.85)`) if blur is unavailable

---

### 1.6 Category Icons (Emoji, v1)

| Category        | Emoji | Category ID       |
|-----------------|-------|-------------------|
| Dining          | `\ud83c\udf7d\ufe0f`  | `dining`           |
| Transport       | `\ud83d\ude95`  | `transport`        |
| Online Shopping | `\ud83d\udcbb`  | `online_shopping`  |
| Groceries       | `\ud83d\uded2`  | `groceries`        |
| Petrol          | `\u26fd`  | `petrol`           |
| Travel / Hotels | `\u2708\ufe0f`  | `travel`           |
| General         | `\ud83d\udcb3`  | `general`          |

---

## 2. Navigation Architecture

### 2.1 Navigation Stack Overview

```
Root Navigator (Stack)
|
|-- Auth Stack (unauthenticated)
|   |-- Login Screen
|   |-- Sign Up Screen
|
|-- Onboarding Stack (first-time user, no cards added)
|   |-- Add Cards Screen
|
|-- Main Tab Navigator (authenticated, cards added)
    |-- Tab 1: Recommend (Home) Stack
    |   |-- Category Grid
    |   |-- Recommendation Result (push)
    |
    |-- Tab 2: My Cards Stack
    |   |-- Card List
    |   |-- Card Detail (push)
    |   |-- Add More Cards (push, reuses Onboarding screen)
    |
    |-- Tab 3: Cap Status Stack
    |   |-- Cap Dashboard
    |
    |-- Tab 4: Log Transaction Stack
    |   |-- Log Form
    |   |-- Log Success (modal overlay)
    |
    |-- Tab 5: Profile Stack
        |-- Profile Screen
```

### 2.2 Routing Logic

```
App Launch
    |
    v
[Is user authenticated?]
    |               |
   NO              YES
    |               |
    v               v
Auth Stack     [Has user added >= 1 card?]
                    |               |
                   NO              YES
                    |               |
                    v               v
            Onboarding Stack   Main Tab Navigator
                                (Recommend tab active)
```

---

## 3. Screen 1: Sign Up / Login

### 3.1 ASCII Wireframe

```
+------------------------------------------+
|                                          |
|              (status bar)                |
|                                          |
|                                          |
|                                          |
|            [MaxiMile Logo]               |
|         "Your Miles Expert"              |
|                                          |
|                                          |
|  +--------------------------------------+|
|  |  Email                               ||
|  +--------------------------------------+|
|                                          |
|  +--------------------------------------+|
|  |  Password                     [eye]  ||
|  +--------------------------------------+|
|                                          |
|  [========= Sign In / Sign Up =========]|
|                                          |
|         Don't have an account?           |
|             Sign Up / Sign In            |
|                                          |
|  ─ ─ ─ ─ ─ ─ ─  OR  ─ ─ ─ ─ ─ ─ ─ ─  |
|                                          |
|  +--------------------------------------+|
|  | [G]  Continue with Google            ||
|  +--------------------------------------+|
|                                          |
|                                          |
|    By continuing, you agree to our       |
|    Terms of Service & Privacy Policy     |
|                                          |
+------------------------------------------+
```

### 3.2 Component List

| # | Component              | Type                  | Content / Label                      | States                                           |
|---|------------------------|-----------------------|--------------------------------------|--------------------------------------------------|
| 1 | App Logo               | Image / Text          | "MaxiMile" wordmark + plane icon     | Static                                           |
| 2 | Tagline                | Text (`caption`)      | "Your Miles Expert"                  | Static                                           |
| 3 | Email Input            | TextInput             | Placeholder: "Email"                 | Default, Focused, Filled, Error (red border + msg)|
| 4 | Password Input         | TextInput (secure)    | Placeholder: "Password"              | Default, Focused, Filled, Error; toggle visibility |
| 5 | Eye Toggle             | IconButton            | Eye open / eye closed                | Visible (eye-off icon), Hidden (eye icon)        |
| 6 | Primary CTA            | Button (filled)       | "Sign In" or "Sign Up"              | Default, Loading (spinner), Disabled (fields empty)|
| 7 | Toggle Link            | TextButton            | "Don't have an account? Sign Up"     | Default, Pressed                                 |
| 8 | OR Divider             | Divider + Text        | "OR"                                 | Static                                           |
| 9 | Google Sign-In Button  | Button (outlined)     | "[G] Continue with Google"           | Default, Loading, Disabled                       |
| 10| Legal Text             | Text (`caption`)      | "By continuing, you agree to..."     | Static; "Terms" and "Privacy" are tappable links |

### 3.3 Information Hierarchy

1. **Primary**: App identity (logo + tagline) -- establishes trust and brand
2. **Secondary**: Email/password fields + primary CTA -- main action
3. **Tertiary**: Google sign-in -- alternative path
4. **Quaternary**: Legal text + toggle link -- required but not prominent

### 3.4 User Flow

- **Entry**: App launch (unauthenticated user)
- **Sign In path**: Fill email + password -> tap "Sign In" -> Supabase Auth -> success -> check card count -> route to Onboarding (0 cards) or Home (1+ cards)
- **Sign Up path**: Tap "Sign Up" link -> same screen toggles to Sign Up mode (CTA changes to "Sign Up") -> fill email + password -> tap "Sign Up" -> Supabase creates account -> route to Onboarding
- **Google path**: Tap "Continue with Google" -> OAuth flow -> Supabase Auth -> same routing logic
- **Error**: Invalid credentials -> inline error below relevant field; network error -> toast at top

### 3.5 Interaction Notes

- **Email field**: `keyboardType="email-address"`, `autoCapitalize="none"`, `autoComplete="email"`
- **Password field**: `secureTextEntry` toggled by eye icon; minimum 8 characters
- **Primary CTA**: Disabled (opacity 0.5) until both fields have content; shows spinner during auth call
- **Toggle animation**: Smooth crossfade between "Sign In" and "Sign Up" modes (swap CTA label and toggle text)
- **Keyboard handling**: Screen scrolls up when keyboard appears; tapping outside dismisses keyboard
- **Error display**: Red border on input + error message text below the field in `caption` / `danger` color

### 3.6 Design Tokens (Screen-Specific)

- Screen background: `bg-primary` (#FFFFFF)
- Logo area top padding: `xxl` (48px) from safe area top
- Input fields: height 48px, `border-radius-sm`, border `border` color, focus border `primary`
- Horizontal padding: `xl` (32px)
- Gap between inputs: `md` (16px)
- Primary CTA: height 48px, `border-radius-sm`, `primary` background, `text-on-primary` text
- Google button: height 48px, `border-radius-sm`, `bg-primary` background, `border` border, `text-primary` text
- Legal text: `caption`, `text-secondary`, center-aligned, bottom padding `lg`

### 3.7 Empty States

Not applicable -- this is the entry point.

### 3.8 Behavioral Design Notes

- **Reduce friction**: Default to "Sign In" mode (returning users are more common after launch)
- **Trust signals**: Clean, minimal design; no unnecessary data collection; legal text visible but unobtrusive
- **Speed**: No splash screen animation beyond a brief logo fade-in (< 500ms)

---

## 4. Screen 2: Onboarding -- Add Cards

### 4.1 ASCII Wireframe

```
+------------------------------------------+
|  (status bar)                            |
|                                          |
|  Add Your Cards                          |
|  Select the miles cards you carry.       |
|  We'll find the best one for every       |
|  purchase.                               |
|                                          |
|  3 cards added                  [Done >] |
|  ----------------------------------------|
|                                          |
|  DBS                                     |
|  +--------------------------------------+|
|  | DBS Altitude Visa            [Add]   ||
|  +--------------------------------------+|
|  | DBS Woman's World            [Add]   ||
|  +--------------------------------------+|
|  | DBS Insignia Visa          [Added /] ||
|  +--------------------------------------+|
|                                          |
|  UOB                                     |
|  +--------------------------------------+|
|  | UOB PRVI Miles Visa        [Added /] ||
|  +--------------------------------------+|
|  | UOB Lady's Card             [Add]   ||
|  +--------------------------------------+|
|                                          |
|  OCBC                                    |
|  +--------------------------------------+|
|  | OCBC 90N Visa              [Added /] ||
|  +--------------------------------------+|
|  | OCBC Voyage Visa             [Add]   ||
|  +--------------------------------------+|
|                                          |
|  (... more banks: Citi, HSBC, etc.)      |
|                                          |
|  +--------------------------------------+|
|  |                                      ||
|  | [========== Done (3) ===============]||
|  |                                      ||
|  +--------------------------------------+|
+------------------------------------------+
```

### 4.2 Component List

| # | Component               | Type                  | Content / Label                         | States                                                 |
|---|-------------------------|-----------------------|-----------------------------------------|--------------------------------------------------------|
| 1 | Screen Title            | Text (`heading-1`)    | "Add Your Cards"                        | Static                                                 |
| 2 | Subtitle                | Text (`body`)         | "Select the miles cards you carry..."   | Static                                                 |
| 3 | Running Counter         | Text (`body-bold`)    | "X cards added"                         | Updates on each add/remove; "0 cards added" initially  |
| 4 | Skip / Done Link        | TextButton            | "Done >" (top right)                    | Visible only when >= 1 card added; hidden otherwise    |
| 5 | Bank Section Header     | Text (`caption-bold`) | Bank name (e.g., "DBS")                | Static; uppercase                                      |
| 6 | Card Row                | ListItem              | Card name + Add/Added button            | Default, Added                                         |
| 7 | Card Name               | Text (`body`)         | e.g., "DBS Altitude Visa"              | Part of Card Row                                       |
| 8 | Add Button              | Button (outlined, sm) | "Add"                                   | Default (outlined, primary border + text)              |
| 9 | Added Button            | Button (filled, sm)   | "Added" + checkmark icon                | Filled primary, white text + checkmark; tappable to undo|
| 10| Done CTA (bottom)       | Button (filled, full) | "Done (3)"                              | Disabled (grey) when 0 cards; enabled (primary) when >= 1|
| 11| Bottom Safe Area        | SafeAreaView          | Padding for bottom button               | Fixed at bottom                                        |

### 4.3 Information Hierarchy

1. **Primary**: Card list with Add/Added states -- the core action
2. **Secondary**: Running counter + Done button -- progress and exit
3. **Tertiary**: Title + subtitle -- context (read once)

### 4.4 User Flow

- **Entry**: After first sign-up/login (user has 0 cards in portfolio)
- **Action**: Scroll through 20 cards grouped by bank -> tap "Add" on cards user holds -> button toggles to "Added" with checkmark -> running counter increments
- **Undo**: Tap "Added" button again -> reverts to "Add", counter decrements
- **Exit**: Tap "Done" button (bottom or top) -> API call to save user_cards -> navigate to Main Tab Navigator (Recommend tab)
- **Constraint**: Must add at least 1 card to proceed. Done button disabled at 0 cards.

### 4.5 Interaction Notes

- **Tap "Add"**: Button instantly toggles to "Added" state with a subtle scale animation (100ms). A brief haptic feedback (light impact) on iOS.
- **Scrolling**: Standard ScrollView / FlatList with section headers. No search bar needed (only 20 cards).
- **Bank grouping**: Cards grouped alphabetically by bank. Section headers are sticky on scroll.
- **Done button**: Fixed at bottom of screen above safe area. Shows count in parentheses: "Done (3)".
- **Tap target**: Each card row is a full-width tap target (height 56px minimum). The Add/Added button is 72px wide x 36px tall.
- **Performance target**: User should be able to add 3 cards in < 2 minutes. With 20 cards visible, most users will complete in < 60 seconds.

### 4.6 Design Tokens (Screen-Specific)

- Screen background: `bg-primary`
- Horizontal padding: `xl` (32px) for title; `md` (16px) for list
- Title top padding: `lg` (24px) from safe area
- Subtitle: `text-secondary`, margin-bottom `lg`
- Bank section header: `caption-bold`, `text-secondary`, uppercase, padding vertical `sm` (8px), background `bg-secondary`
- Card row: height 56px, padding horizontal `md`, border-bottom 1px `border`
- Add button: 72px wide, 36px tall, `border-radius-sm`, border 1.5px `primary`, text `primary`, `caption-bold`
- Added button: same size, `primary` background, `text-on-primary`, checkmark icon 16px left of text
- Done CTA: full width minus `xl` padding, height 48px, `border-radius-sm`, fixed bottom with `md` padding from bottom safe area
- Counter: `body-bold`, `primary` color, positioned left-aligned above list

### 4.7 Empty States

- **Initial state (0 cards)**: Title, subtitle, and full card list shown. Counter reads "0 cards added". Done button is disabled (grey, opacity 0.5). This IS the default state -- no separate empty state needed.

### 4.8 Behavioral Design Notes

- **Default effect**: Pre-selecting no cards avoids false defaults. Users must actively choose. This builds ownership ("my portfolio").
- **Progress feedback**: The running counter provides immediate reinforcement. "3 cards added" gives a sense of accomplishment.
- **Endowed progress**: Grouping by bank helps users mentally locate their cards faster, reducing search time.
- **Low commitment**: "Add" is reversible (tap again to undo). This reduces decision anxiety.
- **Target: < 2 minutes for 3 cards**: With alphabetical bank grouping and only 20 cards, visual scanning is fast. No search needed.

---

## 5. Screen 3: My Cards (Portfolio)

### 5.1 ASCII Wireframe — Card List

```
+------------------------------------------+
|  (status bar)                            |
|                                          |
|  My Cards                                |
|                                          |
|  +--------------------------------------+|
|  | DBS                                  ||
|  | Altitude Visa                        ||
|  | Best: 3.0 mpd - Online Shopping      ||
|  |                           [arrow >]  ||
|  +--------------------------------------+|
|                                          |
|  +--------------------------------------+|
|  | OCBC                                 ||
|  | 90N Visa                             ||
|  | Best: 4.0 mpd - Dining              ||
|  |                           [arrow >]  ||
|  +--------------------------------------+|
|                                          |
|  +--------------------------------------+|
|  | UOB                                  ||
|  | PRVI Miles Visa                      ||
|  | Best: 2.4 mpd - Dining              ||
|  |                           [arrow >]  ||
|  +--------------------------------------+|
|                                          |
|                                          |
|  [========= + Add More Cards ==========]|
|                                          |
|  --------- Tab Bar -------------------- |
+------------------------------------------+
```

### 5.2 ASCII Wireframe — Card Detail (Push Screen)

```
+------------------------------------------+
|  (status bar)                            |
|  [< Back]         Card Detail            |
|                                          |
|  DBS Altitude Visa                       |
|  Visa | Annual Fee: $192.60              |
|                                          |
|  Earn Rates                              |
|  ----------------------------------------|
|  | Dining          |  1.2 mpd           ||
|  ----------------------------------------|
|  | Transport        |  3.0 mpd  [BEST]  ||
|  ----------------------------------------|
|  | Online Shopping   |  3.0 mpd  [BEST]  ||
|  ----------------------------------------|
|  | Groceries        |  1.2 mpd           ||
|  ----------------------------------------|
|  | Petrol           |  1.2 mpd           ||
|  ----------------------------------------|
|  | Travel / Hotels  |  2.0 mpd           ||
|  ----------------------------------------|
|  | General          |  1.2 mpd           ||
|  ----------------------------------------|
|                                          |
|  Monthly Caps                            |
|  ----------------------------------------|
|  | Online Shopping  | $1,000/mo          ||
|  | Cap applies across all bonus cats     ||
|  ----------------------------------------|
|                                          |
|  Conditions                              |
|  Min. $500 monthly spend required for    |
|  bonus rates.                            |
|                                          |
|  Last updated: 15 Feb 2026              |
|                                          |
|  [======== Remove Card (red) ==========]|
|                                          |
+------------------------------------------+
```

### 5.3 Component List — Card List

| # | Component               | Type                | Content / Label                             | States                                       |
|---|-------------------------|---------------------|---------------------------------------------|----------------------------------------------|
| 1 | Screen Title            | Text (`heading-1`)  | "My Cards"                                  | Static                                       |
| 2 | Card Item               | Card (tappable)     | Bank, card name, best earn rate + category  | Default, Swipe-left-to-delete                |
| 3 | Bank Name               | Text (`caption-bold`)| e.g., "DBS"                                | `text-secondary`                             |
| 4 | Card Name               | Text (`heading-3`)  | e.g., "Altitude Visa"                      | `text-primary`                               |
| 5 | Best Rate Badge         | Text (`caption`)    | e.g., "Best: 3.0 mpd - Online Shopping"    | `success` color                              |
| 6 | Chevron Icon            | Icon                | Right arrow (>)                             | `text-tertiary`                              |
| 7 | Swipe Delete Action     | SwipeAction         | Red "Remove" panel revealed on swipe left   | Hidden (default), Revealed (swiped)          |
| 8 | Delete Confirmation     | Alert / BottomSheet | "Remove DBS Altitude Visa from portfolio?" | Confirm (destructive) / Cancel               |
| 9 | Add More Cards Button   | Button (outlined)   | "+ Add More Cards"                          | Default; navigates to Add Cards screen       |

### 5.4 Component List — Card Detail

| # | Component               | Type                | Content / Label                             | States                                       |
|---|-------------------------|---------------------|---------------------------------------------|----------------------------------------------|
| 1 | Back Button             | IconButton          | "< Back" or left arrow                      | Default                                      |
| 2 | Screen Title            | Text (`heading-2`)  | "Card Detail"                               | In nav header                                |
| 3 | Card Name               | Text (`heading-1`)  | e.g., "DBS Altitude Visa"                  | Static                                       |
| 4 | Card Meta               | Text (`caption`)    | "Visa | Annual Fee: $192.60"               | `text-secondary`                             |
| 5 | Earn Rates Section      | SectionHeader       | "Earn Rates"                                | Static                                       |
| 6 | Earn Rate Row           | ListItem            | Category name + mpd value                   | 7 rows; "BEST" badge on highest rate(s)      |
| 7 | BEST Badge              | Badge               | "BEST"                                      | `primary` background, `text-on-primary`, `caption-bold` |
| 8 | Monthly Caps Section    | SectionHeader       | "Monthly Caps"                              | Static; hidden if card has no caps           |
| 9 | Cap Row                 | ListItem            | Category + "$X,XXX/mo"                      | Static                                       |
| 10| Conditions Section      | SectionHeader       | "Conditions"                                | Hidden if no conditions                      |
| 11| Conditions Text         | Text (`caption`)    | Human-readable conditions from `conditions_note` | `text-secondary`                        |
| 12| Last Updated            | Text (`caption`)    | "Last updated: DD MMM YYYY"                | `text-tertiary`                              |
| 13| Remove Card Button      | Button (outlined)   | "Remove Card"                               | `danger` border + text; shows confirmation   |

### 5.5 Information Hierarchy

**Card List:**
1. **Primary**: Card name (largest, boldest text per row)
2. **Secondary**: Best earn rate + category (the quick-glance value of each card)
3. **Tertiary**: Bank name (contextual grouping)

**Card Detail:**
1. **Primary**: Earn rates table (the main reason to view card detail)
2. **Secondary**: Monthly caps (critical for spending decisions)
3. **Tertiary**: Card identity + conditions + metadata

### 5.6 User Flow

- **Entry**: Tap "My Cards" tab in bottom nav
- **Card List -> Card Detail**: Tap any card row -> push Card Detail screen
- **Card Detail -> Back**: Tap back button or swipe-back gesture -> pop to Card List
- **Swipe to Delete**: Swipe card row left -> reveals red "Remove" button -> tap -> confirmation alert -> confirm -> card removed from list, API call to delete user_card
- **Add More Cards**: Tap "+ Add More Cards" -> push to Add Cards screen (reuses Onboarding screen with "X already added" states pre-applied and a "Back" nav button instead of onboarding context)

### 5.7 Interaction Notes

- **Card row tap target**: Full width, minimum 72px tall
- **Swipe-to-delete**: Swipeable row component (e.g., `react-native-gesture-handler` Swipeable). Swipe distance threshold: 80px. Red background with white "Remove" text revealed behind the row.
- **Delete confirmation**: Native Alert dialog: title "Remove Card?", message "Remove [Card Name] from your portfolio? Your logged transactions will be kept.", buttons: "Cancel" (default), "Remove" (destructive).
- **Chevron**: Indicates navigability. Positioned right-aligned, vertically centered.
- **Card Detail scroll**: ScrollView for content. Earn rates table uses alternating row backgrounds (`bg-primary` / `bg-secondary`) for readability.
- **BEST badge**: Appears on the row(s) with the highest earn rate for that card. If multiple categories share the top rate, all get the badge.

### 5.8 Design Tokens (Screen-Specific)

- Card item: `bg-primary` background, `border-radius-md`, `shadow-sm`, margin-bottom `sm`, padding `md`
- Card list: horizontal padding `md`, vertical padding `md`
- Earn rate row: height 44px, padding horizontal `md`, alternating `bg-primary`/`bg-secondary`
- BEST badge: padding horizontal `sm`, padding vertical `xs`, `border-radius-full`, `primary` background
- Remove Card button (detail): `danger` border, `danger` text, full width, margin-top `lg`
- Add More Cards button: `primary` border, `primary` text, full width, margin-top `md`, margin-bottom `lg`

### 5.9 Empty States

**No cards added** (edge case -- user somehow reaches this tab with 0 cards):
```
+------------------------------------------+
|                                          |
|           [credit card icon]             |
|                                          |
|         No cards in your portfolio       |
|   Add your miles cards to get started.   |
|                                          |
|  [========= + Add Cards ===============]|
|                                          |
+------------------------------------------+
```
- Icon: Credit card outline icon, 64px, `text-tertiary`
- Title: `heading-3`, `text-primary`, centered
- Subtitle: `body`, `text-secondary`, centered
- CTA: Primary filled button, navigates to Add Cards screen

### 5.10 Behavioral Design Notes

- **Best rate prominence**: Showing the best earn rate + category on the card list gives users a quick mental model of each card's primary value. This reinforces their portfolio understanding.
- **Swipe-to-delete with confirmation**: Prevents accidental removal. The confirmation dialog uses loss framing: users see the card name explicitly, reinforcing what they are about to lose.
- **Card detail as reference**: Users can consult Card Detail to verify recommendation logic. Showing the full earn rate table builds trust ("I can see why the app recommended this card").

---

## 6. Screen 4: Recommend (Home)

This is the core product screen. It must feel instant, confident, and clear.

### 6.1 ASCII Wireframe — Category Grid (Default State)

```
+------------------------------------------+
|  (status bar)                            |
|                                          |
|  What are you spending on?               |
|                                          |
|  +------------------+ +------------------+
|  |                  | |                  |
|  |    [fork/knife]  | |    [taxi]        |
|  |     Dining       | |   Transport      |
|  |                  | |                  |
|  +------------------+ +------------------+
|  +------------------+ +------------------+
|  |                  | |                  |
|  |    [laptop]      | |    [cart]        |
|  |  Online Shopping | |   Groceries      |
|  |                  | |                  |
|  +------------------+ +------------------+
|  +------------------+ +------------------+
|  |                  | |                  |
|  |    [fuel]        | |    [plane]       |
|  |    Petrol        | | Travel / Hotels  |
|  |                  | |                  |
|  +------------------+ +------------------+
|  +--------------------------------------+|
|  |              [card]                  ||
|  |             General                  ||
|  +--------------------------------------+|
|                                          |
|  [suggested category highlight pulse]    |
|                                          |
|  --------- Tab Bar -------------------- |
+------------------------------------------+
```

### 6.2 ASCII Wireframe — Recommendation Result (After Category Tap)

```
+------------------------------------------+
|  (status bar)                            |
|                                          |
|  [< Back]    Dining                      |
|                                          |
|  USE THIS CARD                           |
|  +--------------------------------------+|
|  |                                      ||
|  |  OCBC                                ||
|  |  90N Visa                            ||
|  |                                      ||
|  |  4.0 mpd                             ||
|  |                                      ||
|  |  Remaining Cap                       ||
|  |  [====green==========     ] $650     ||
|  |  $350 of $1,000 used                 ||
|  |                                      ||
|  +--------------------------------------+|
|                                          |
|  [========= Log Transaction ============]|
|                                          |
|  ALTERNATIVES                            |
|  +--------------------------------------+|
|  | DBS Altitude Visa   1.2 mpd    [ok] ||
|  +--------------------------------------+|
|  | UOB PRVI Miles      2.4 mpd    [ok] ||
|  +--------------------------------------+|
|  | Citi PremierMiles   1.2 mpd  [FULL] ||
|  +--------------------------------------+|
|                                          |
|  --------- Tab Bar -------------------- |
+------------------------------------------+
```

### 6.3 Component List — Category Grid

| # | Component               | Type                | Content / Label                             | States                                       |
|---|-------------------------|---------------------|---------------------------------------------|----------------------------------------------|
| 1 | Screen Title            | Text (`heading-1`)  | "What are you spending on?"                 | Static                                       |
| 2 | Category Tile           | Card (tappable)     | Emoji icon + category name                  | Default, Pressed (scale 0.96), Suggested (subtle blue border pulse) |
| 3 | Tile Emoji              | Text (32px)         | Category emoji                              | Static                                       |
| 4 | Tile Label              | Text (`heading-3`)  | Category name                               | `text-primary`                               |
| 5 | Suggested Indicator     | Border animation    | Subtle pulsing `primary-light` border       | Active on time-of-day suggested category     |

### 6.4 Component List — Recommendation Result

| # | Component               | Type                | Content / Label                             | States                                       |
|---|-------------------------|---------------------|---------------------------------------------|----------------------------------------------|
| 1 | Back Button             | IconButton          | Left arrow                                  | Returns to category grid                     |
| 2 | Category Title          | Text (`heading-1`)  | e.g., "Dining" (with emoji)                | In header area                               |
| 3 | Section Label (Top)     | Text (`overline`)   | "USE THIS CARD"                             | `text-secondary`, uppercase                  |
| 4 | Top Card                | Card (elevated)     | Bank, card name, earn rate, cap progress    | Default; if no cards qualify, show fallback   |
| 5 | Bank Name               | Text (`caption-bold`)| e.g., "OCBC"                               | `text-secondary`                             |
| 6 | Card Name               | Text (`heading-2`)  | e.g., "90N Visa"                            | `text-primary`                               |
| 7 | Earn Rate               | Text (`display`)    | e.g., "4.0 mpd"                             | `primary`, large and prominent               |
| 8 | Cap Label               | Text (`caption`)    | "Remaining Cap"                              | `text-secondary`; hidden if no cap           |
| 9 | Cap Progress Bar        | ProgressBar         | Visual fill showing cap usage                | Green (<80%), Amber (80-99%), Red (100%)     |
| 10| Cap Amount Text         | Text (`body`)       | "$350 of $1,000 used" / "$650 remaining"    | Color matches progress bar                   |
| 11| Log Transaction CTA     | Button (filled)     | "Log Transaction"                            | Primary, full width                          |
| 12| Section Label (Alt)     | Text (`overline`)   | "ALTERNATIVES"                               | `text-secondary`, uppercase                  |
| 13| Alternative Card Row    | ListItem            | Card name, bank, mpd, cap indicator         | Default row                                  |
| 14| Alt Card Name           | Text (`body-bold`)  | e.g., "DBS Altitude Visa"                  | `text-primary`                               |
| 15| Alt MPD                 | Text (`body`)       | e.g., "1.2 mpd"                             | `text-secondary`                             |
| 16| Alt Cap Indicator       | Badge               | Icon or short label                          | Green dot (cap OK), Red "FULL" badge (cap 100%) |

### 6.5 Information Hierarchy

**Category Grid:**
1. **Primary**: Category tiles (the only interactive elements -- large, tappable)
2. **Secondary**: Screen title (context)
3. **Tertiary**: Suggested category highlight (subtle, non-blocking)

**Recommendation Result:**
1. **Primary**: Top card earn rate (the answer -- "4.0 mpd" must be the first thing the eye sees)
2. **Secondary**: Card identity (bank + name -- confirms which card to pull from wallet)
3. **Tertiary**: Cap status (progress bar + text -- reassurance that cap is still available)
4. **Quaternary**: Log Transaction CTA (action to take)
5. **Quinary**: Alternatives list (secondary info, shown if user wants to explore)

### 6.6 User Flow

- **Entry**: Default tab on Main Tab Navigator. Also accessible by tapping "Recommend" tab from any other screen.
- **Category Grid -> Recommendation**: Tap a category tile -> push or slide-right to Recommendation Result screen (pre-loaded data, must appear in < 1 second)
- **Recommendation -> Log**: Tap "Log Transaction" -> navigate to Log Transaction screen with category and card pre-filled
- **Recommendation -> Back**: Tap back arrow or swipe back -> return to category grid
- **Alternative card tap**: Tap an alternative row -> scrolls Top Card section to show that card's detail as the new "top" (or navigate to its Card Detail)
- **Time-of-day default**: On first load of category grid, the suggested category tile has a subtle highlight:
  - 11:00-14:00 -> Dining
  - 17:00-21:00 -> Dining
  - 07:00-09:00 -> Transport
  - Default (all other times) -> General (no highlight)

### 6.7 Interaction Notes

- **Category tile tap**: On press, tile scales to 0.96 with 100ms spring animation. On release, navigates to result. Haptic feedback (light) on iOS.
- **Tile grid layout**: 2-column grid with 12px gap. Last item (General) spans full width. Each tile is a square (aspect ratio 1:1) except General which is shorter (height 64px, full width).
- **Recommendation load time**: Must be < 1 second. Data should be pre-fetched and cached on app load. The recommendation engine runs locally against cached card data + user spending state.
- **Progress bar animation**: On screen appear, progress bar animates from 0 to current fill over 400ms. This draws attention to the cap status.
- **Cap color logic**:
  - `success` (#34A853): spent < 80% of cap
  - `warning` (#FBBC04): spent >= 80% and < 100%
  - `danger` (#EA4335): spent >= 100% (cap exhausted)
- **"FULL" badge on alternatives**: Red background badge, white text, appears when a card's cap for this category is 100% used. Communicates that this card will NOT earn bonus miles.
- **No cap display**: If a card has no cap for this category, the cap section is hidden and replaced with "No cap limit" in `caption` / `success` color.
- **Scroll behavior**: Top Card section is fixed/prominent at top. Alternatives list scrolls below. On short screens, entire content scrolls.

### 6.8 Design Tokens (Screen-Specific)

**Category Grid:**
- Category tile: `bg-primary`, `border-radius-md`, `shadow-sm`, border 1.5px `border`
- Suggested tile: border 2px `primary`, with opacity pulse animation (0.4 -> 1.0, 2s loop)
- Tile padding: `lg` (24px) all sides
- Tile emoji: 32px
- Tile label: `heading-3`, `text-primary`, margin-top `sm`
- Grid gap: `md` (16px) horizontal and vertical
- Screen horizontal padding: `md` (16px)

**Recommendation Result:**
- Top Card: `bg-primary`, `border-radius-lg`, `shadow-md`, padding `lg`
- Earn rate text: `display` size (32px), `primary` color, bold
- Progress bar: height 8px, `border-radius-full`, background `bg-tertiary`, fill color per cap status
- Cap text: `body`, color matches progress bar fill
- Log CTA: full width, height 48px, `primary` background, `border-radius-sm`, margin vertical `md`
- Alternative row: height 56px, border-bottom 1px `border`, padding horizontal `md`
- "FULL" badge: `danger` background, `text-on-primary`, `caption-bold`, padding `xs` horizontal `sm`, `border-radius-full`
- Green dot indicator: 8px circle, `success` color, positioned before mpd text

### 6.9 Empty States

**No cards in portfolio** (user deleted all cards):
```
+------------------------------------------+
|                                          |
|  What are you spending on?               |
|                                          |
|         [credit card icon]               |
|                                          |
|      Add cards to get recommendations    |
|                                          |
|  [=========== Add Cards ===============] |
|                                          |
+------------------------------------------+
```

**Category selected but no cards earn bonus** (all caps exhausted for this category):
```
Top Card area shows the best available card at base rate with a notice:
+--------------------------------------+
| All bonus caps reached for Dining    |
| Best available:                      |
| DBS Altitude Visa                    |
| 0.4 mpd (base rate)                 |
+--------------------------------------+
```

### 6.10 Behavioral Design Notes

- **Time-of-day defaults**: The suggested category highlight leverages the default effect. At lunch, users most likely need a Dining recommendation. The highlight draws their eye to the right tile first, reducing decision time.
- **"USE THIS CARD" framing**: Imperative, confident language. Not "We recommend..." but "USE THIS CARD." This matches the mental model of "my miles expert tells me instantly."
- **Loss aversion on cap status**: The progress bar visually communicates how much cap is left. Amber and red colors trigger urgency -- "I'm running out of bonus capacity on this card." This motivates users to log transactions diligently.
- **Earn rate prominence**: The large "4.0 mpd" number is the single most important piece of information. It answers: "How many miles will I earn?" Making it the largest text on screen ensures instant comprehension.
- **"FULL" badge on alternatives**: Uses loss framing. Seeing "FULL" next to a card reinforces why MaxiMile is valuable -- it prevents users from accidentally using a capped-out card.
- **< 1 second response**: Speed is trust. If the recommendation feels instant, users trust it more. Any perceptible delay introduces doubt.

---

## 7. Screen 5: Log Transaction

### 7.1 ASCII Wireframe — Log Form

```
+------------------------------------------+
|  (status bar)                            |
|                                          |
|  [X Close]       Log Transaction         |
|                                          |
|  AMOUNT                                  |
|                                          |
|               $ 125.80                   |
|                                          |
|  ----------------------------------------|
|                                          |
|  Category                                |
|  +--------------------------------------+|
|  | [fork]  Dining                   [v] ||
|  +--------------------------------------+|
|                                          |
|  Card                                    |
|  +--------------------------------------+|
|  | OCBC 90N Visa                    [v] ||
|  +--------------------------------------+|
|                                          |
|  Date                                    |
|  +--------------------------------------+|
|  | Today, 19 Feb 2026                   ||
|  +--------------------------------------+|
|                                          |
|  +--------------------------------------+|
|  |                                      ||
|  | [============ Confirm ==============]||
|  |                                      ||
|  +--------------------------------------+|
|                                          |
|  +------+ +------+ +------+             |
|  |  1   | |  2   | |  3   |             |
|  +------+ +------+ +------+             |
|  |  4   | |  5   | |  6   |             |
|  +------+ +------+ +------+             |
|  |  7   | |  8   | |  9   |             |
|  +------+ +------+ +------+             |
|  |  .   | |  0   | |  <x  |             |
|  +------+ +------+ +------+             |
+------------------------------------------+
```

### 7.2 ASCII Wireframe — Success State (Overlay / Modal)

```
+------------------------------------------+
|                                          |
|                                          |
|                                          |
|           +---------------------+        |
|           |                     |        |
|           |    [checkmark]      |        |
|           |                     |        |
|           |     Logged!         |        |
|           |                     |        |
|           |  $650 remaining on  |        |
|           |  OCBC 90N Visa      |        |
|           |  Dining cap         |        |
|           |                     |        |
|           |  You earned 4.0 mpd |        |
|           |  Without MaxiMile:  |        |
|           |  ~1.4 mpd           |        |
|           |                     |        |
|           |  [== Done ========] |        |
|           |                     |        |
|           +---------------------+        |
|                                          |
|                                          |
+------------------------------------------+
```

### 7.3 Component List

| # | Component               | Type                | Content / Label                             | States                                       |
|---|-------------------------|---------------------|---------------------------------------------|----------------------------------------------|
| 1 | Close Button            | IconButton          | "X" (top left)                              | Navigates back; shows discard confirmation if amount entered |
| 2 | Screen Title            | Text (`heading-2`)  | "Log Transaction"                           | In header area                               |
| 3 | Amount Label            | Text (`overline`)   | "AMOUNT"                                    | `text-secondary`, uppercase                  |
| 4 | Amount Display          | Text (`display`)    | "$ 0.00" -> user-typed value                | `text-primary`; placeholder `text-tertiary`  |
| 5 | Category Picker         | Dropdown/Selector   | Emoji + category name + chevron down        | Pre-filled (from recommendation) or selectable|
| 6 | Category Label          | Text (`caption-bold`)| "Category"                                 | `text-secondary`                             |
| 7 | Card Picker             | Dropdown/Selector   | Card name + chevron down                    | Pre-filled (from recommendation) or selectable|
| 8 | Card Label              | Text (`caption-bold`)| "Card"                                     | `text-secondary`                             |
| 9 | Date Display            | Text (`body`)       | "Today, DD MMM YYYY"                        | Read-only in v1 (always today)               |
| 10| Date Label              | Text (`caption-bold`)| "Date"                                     | `text-secondary`                             |
| 11| Confirm Button          | Button (filled)     | "Confirm"                                   | Disabled until amount > 0; Loading (spinner) during API call |
| 12| Custom Keypad           | Keypad Grid         | 0-9, ".", backspace                         | Keys: Default, Pressed (highlight)           |
| 13| Success Overlay         | Modal / BottomSheet | Checkmark + "Logged!" + cap summary + mpd  | Appears after successful log                 |
| 14| Success Checkmark       | Icon (animated)     | Green circle with white checkmark           | Scale-up + fade-in animation                 |
| 15| Success Title           | Text (`heading-2`)  | "Logged!"                                   | `success` color                              |
| 16| Cap Remaining Text      | Text (`body`)       | "$650 remaining on OCBC 90N Visa Dining cap"| `text-primary`                               |
| 17| MPD Comparison          | Text (`caption`)    | "You earned 4.0 mpd. Without MaxiMile: ~1.4 mpd" | Loss aversion nudge, `text-secondary` |
| 18| Done Button (Success)   | Button (filled)     | "Done"                                      | Dismisses overlay, returns to previous screen|

### 7.4 Information Hierarchy

**Log Form:**
1. **Primary**: Amount (largest element, first thing user inputs)
2. **Secondary**: Category + Card (pre-filled, glanceable confirmation)
3. **Tertiary**: Confirm button (action after inputs are set)
4. **Quaternary**: Date (always today, just for reference)

**Success Overlay:**
1. **Primary**: "Logged!" confirmation (immediate reassurance)
2. **Secondary**: Cap remaining info (answers "how much bonus left?")
3. **Tertiary**: MPD comparison (behavioral nudge -- value reinforcement)

### 7.5 User Flow

- **Entry A (from Recommendation)**: Tap "Log Transaction" on Recommend Result screen -> Log screen opens with Category + Card pre-filled. Amount field focused. Custom keypad shown.
- **Entry B (from Tab Nav)**: Tap "Log" tab -> Log screen opens with all fields empty (or pre-filled with time-of-day category default). Amount field focused. Custom keypad shown.
- **Logging flow**: Type amount on keypad -> confirm/change Category (tap picker if needed) -> confirm/change Card (tap picker if needed) -> tap "Confirm" -> API call -> Success overlay appears
- **Success -> Return**: Tap "Done" on success overlay -> dismiss overlay -> navigate back to previous screen (Recommend or Tab Nav)
- **Cancel**: Tap "X" close button -> if amount > 0, show discard confirmation ("Discard this transaction?"); if amount = 0, navigate back immediately
- **Target: < 10 seconds total** from screen open to "Logged!" when coming from Recommendation (category + card pre-filled, user only types amount and taps Confirm)

### 7.6 Interaction Notes

- **Custom keypad**: Built-in keypad (not system keyboard) for faster amount entry. Keys are large (minimum 64px tall). "." for decimal. Backspace icon for delete. Amount input supports max 2 decimal places and max value of $99,999.99.
- **Amount formatting**: As user types, display updates in real-time with comma separators: "1" -> "$1", "12" -> "$12", "125" -> "$125", "125." -> "$125.", "125.8" -> "$125.80", "125.80" -> "$125.80". Leading "$" always shown.
- **Category picker**: Tapping the Category row opens a bottom sheet with the 7 categories listed (emoji + name). Tap to select. Bottom sheet dismisses. Pre-filled from recommendation context.
- **Card picker**: Tapping the Card row opens a bottom sheet with user's cards listed. Each row shows: card name + bank + mpd for the selected category. Sorted by earn rate descending. Pre-filled from recommendation context.
- **Date**: Read-only "Today" in v1. Displayed but not interactive. Grey text style to indicate non-editable.
- **Confirm button**: Disabled (opacity 0.5, `bg-tertiary`) until amount > $0.00. Becomes primary-colored when valid. Shows spinner during API call (~200-500ms).
- **Success overlay**: Appears as a centered modal with semi-transparent dark backdrop. Checkmark animates in (scale from 0 to 1, 300ms spring). Auto-dismiss after 5 seconds or tap "Done".
- **Haptic feedback**: Success confirmation triggers a success haptic (notification type) on iOS.

### 7.7 Design Tokens (Screen-Specific)

- Amount display: `display` (32px), `text-primary`, center-aligned, padding vertical `lg`
- Picker row: height 56px, `bg-secondary` background, `border-radius-sm`, margin-bottom `md`, padding horizontal `md`
- Picker chevron: `text-tertiary`, right-aligned
- Confirm button: full width, height 48px, `primary` background, `border-radius-sm`
- Keypad: 3-column grid, key height 56px, `bg-secondary` background per key, `border-radius-sm`, `text-primary` text (`heading-2`), gap 8px
- Keypad backspace: icon 24px, `text-secondary`
- Success overlay: `bg-primary`, `border-radius-lg`, `shadow-lg`, padding `xl`, max-width 320px, centered
- Success checkmark circle: 64px diameter, `success` background, white checkmark icon 32px
- Backdrop: rgba(0,0,0,0.5)
- Label text: `caption-bold`, `text-secondary`, margin-bottom `xs`

### 7.8 Empty States

**No cards in portfolio**: If user reaches Log screen with 0 cards (edge case), show:
- "Add cards to your portfolio first."
- Primary button: "Add Cards" -> navigates to Add Cards screen

**Category picker empty**: Not possible (7 categories are static).

**Card picker for selected category**: If user has cards but none earn bonus for selected category, still show all cards sorted by earn rate (base rate will be shown).

### 7.9 Behavioral Design Notes

- **Pre-fill is the key to < 10 seconds**: When coming from Recommendation, category and card are already filled. User only needs to type amount (3-6 key presses) and tap Confirm. Total: ~8 seconds.
- **Custom keypad over system keyboard**: The custom keypad is purpose-built for dollar amount entry. No need for alphabetic keys, no autocorrect, no keyboard switching. This saves 2-3 seconds vs system keyboard.
- **Loss aversion on success**: "You earned 4.0 mpd. Without MaxiMile: ~1.4 mpd" directly shows the value gap. This is calculated as: (recommended card mpd) vs (average base rate across user's cards, ~1.4 mpd). This nudge reinforces app value and encourages continued logging.
- **Cap remaining on success**: Immediately after logging, showing the updated cap remaining answers the user's likely next question: "How much bonus do I have left?" This eliminates the need to navigate to Cap Status.
- **Friction to discard**: If user has typed an amount and taps Close, a confirmation prevents accidental loss. But if nothing was entered, close is instant (zero friction for backing out).

---

## 8. Screen 6: Cap Status Dashboard

### 8.1 ASCII Wireframe

```
+------------------------------------------+
|  (status bar)                            |
|                                          |
|  Cap Status                              |
|  February 2026         Resets in 9 days  |
|                                          |
|  +--------------------------------------+|
|  | OCBC 90N Visa                        ||
|  |                                      ||
|  | Dining                               ||
|  | [====green==========       ] $650    ||
|  | $350 / $1,000                        ||
|  |                                      ||
|  | Online Shopping                      ||
|  | [========amber========     ] $200    ||
|  | $800 / $1,000                        ||
|  +--------------------------------------+|
|                                          |
|  +--------------------------------------+|
|  | DBS Altitude Visa                    ||
|  |                                      ||
|  | All Categories (combined cap)        ||
|  | [===========red===========] $0       ||
|  | $2,000 / $2,000           FULL       ||
|  +--------------------------------------+|
|                                          |
|  +--------------------------------------+|
|  | UOB PRVI Miles Visa                  ||
|  |                                      ||
|  | Dining                               ||
|  | [=green=                   ] $1,500  ||
|  | $500 / $2,000                        ||
|  +--------------------------------------+|
|                                          |
|  --------- Tab Bar -------------------- |
+------------------------------------------+
```

### 8.2 Component List

| # | Component               | Type                | Content / Label                             | States                                       |
|---|-------------------------|---------------------|---------------------------------------------|----------------------------------------------|
| 1 | Screen Title            | Text (`heading-1`)  | "Cap Status"                                | Static                                       |
| 2 | Period Label            | Text (`body`)       | "February 2026"                             | `text-primary`                               |
| 3 | Reset Countdown         | Text (`caption`)    | "Resets in X days"                          | `text-secondary`; updates daily              |
| 4 | Card Cap Section        | Card (container)    | Card name + progress bars per category      | One per user card that has caps              |
| 5 | Card Name               | Text (`heading-3`)  | e.g., "OCBC 90N Visa"                      | `text-primary`                               |
| 6 | Category Label          | Text (`body`)       | e.g., "Dining"                              | `text-primary`                               |
| 7 | Progress Bar            | ProgressBar         | Horizontal fill bar                         | Green (<80%), Amber (80-99%), Red (100%)     |
| 8 | Remaining Amount        | Text (`body-bold`)  | e.g., "$650"                                | Color matches progress bar; right-aligned    |
| 9 | Spent / Cap Text        | Text (`caption`)    | e.g., "$350 / $1,000"                      | `text-secondary`                             |
| 10| FULL Badge              | Badge               | "FULL"                                      | `danger` background, `text-on-primary`; appears when 100% |
| 11| Combined Cap Label      | Text (`caption`)    | "All Categories (combined cap)"             | `text-secondary`; shown when cap is not per-category |

### 8.3 Information Hierarchy

1. **Primary**: Progress bars (visual scan of cap health across all cards)
2. **Secondary**: Remaining amounts (quick numerical reference)
3. **Tertiary**: Card names (grouping context)
4. **Quaternary**: Spent/cap text + period info (detail on demand)

### 8.4 User Flow

- **Entry**: Tap "Cap Status" tab in bottom nav
- **View**: Scroll through card sections. Each section shows all capped categories for that card.
- **No interaction needed**: This is a read-only dashboard. Users come here to check status, not to take action.
- **Related action**: If user sees a card approaching its cap, they mentally note to switch cards. The Recommend screen will handle this automatically.

### 8.5 Interaction Notes

- **Scroll**: Standard ScrollView. Cards are stacked vertically.
- **Progress bar animation**: On screen appear (or tab switch), progress bars animate from 0 to current fill over 400ms with a slight stagger (100ms delay between each bar). This creates a cascading fill effect that draws the eye.
- **Card ordering**: Cards sorted by urgency: cards with caps nearest to full (highest %) appear first. Within a card, categories sorted by % used descending.
- **Pull to refresh**: Standard pull-to-refresh gesture recalculates cap status from stored transactions.
- **No tap targets on progress bars**: This is a view-only screen. Simplicity is the point.

### 8.6 Design Tokens (Screen-Specific)

- Card section: `bg-primary`, `border-radius-md`, `shadow-sm`, padding `md`, margin-bottom `md`
- Progress bar container: height 8px, `bg-tertiary` background, `border-radius-full`
- Progress bar fill: same height, border-radius-full, color per threshold:
  - `success` (#34A853): fill% < 80
  - `warning` (#FBBC04): 80 <= fill% < 100
  - `danger` (#EA4335): fill% >= 100
- Remaining amount: `body-bold`, color matches fill, right-aligned on same line as category label
- Spent/cap text: `caption`, `text-secondary`, below progress bar, left-aligned
- FULL badge: `danger` background, white text, `caption-bold`, padding horizontal `sm`, `border-radius-full`, inline after spent/cap text
- Period label: `body`, `text-primary`, left-aligned below title
- Reset countdown: `caption`, `text-secondary`, right-aligned on same line as period
- Horizontal padding: `md` (16px), screen-level
- Category row spacing: margin-bottom `md` between categories within a card

### 8.7 Empty States

**No caps to display** (user's cards have no monthly caps):
```
+------------------------------------------+
|                                          |
|  Cap Status                              |
|                                          |
|           [shield-check icon]            |
|                                          |
|    None of your cards have monthly       |
|    bonus caps. Spend freely!             |
|                                          |
+------------------------------------------+
```
- Icon: Shield with checkmark, 64px, `success` color
- Title: `heading-3`, `text-primary`, centered
- Subtitle: `body`, `text-secondary`, centered

**No cards in portfolio**:
```
+------------------------------------------+
|                                          |
|  Cap Status                              |
|                                          |
|         [credit card icon]               |
|                                          |
|    Add cards to track your bonus caps.   |
|                                          |
|  [=========== Add Cards ===============] |
|                                          |
+------------------------------------------+
```

### 8.8 Behavioral Design Notes

- **Loss aversion through color**: Red progress bars create urgency. Seeing a card at "FULL" reinforces the cost of not switching cards. Users will learn to check this screen before spending in capped categories.
- **Urgency sorting**: Placing near-full caps at the top ensures users see the most actionable information first. They don't have to scroll to find problems.
- **Reset countdown**: "Resets in 9 days" creates a time boundary. Users know when their caps will refresh, helping them plan spending. This also creates a natural monthly engagement loop.
- **Cascading animation**: The staggered progress bar fill is not decorative -- it guides the eye down the list, ensuring users scan all caps rather than fixating on the first one.

---

## 9. Screen 7: Profile

### 9.1 ASCII Wireframe

```
+------------------------------------------+
|  (status bar)                            |
|                                          |
|  Profile                                 |
|                                          |
|  +--------------------------------------+|
|  |  [avatar circle]                     ||
|  |                                      ||
|  |  Maya Tan                            ||
|  |  maya.tan@email.com                  ||
|  +--------------------------------------+|
|                                          |
|  +--------------------------------------+|
|  | About MaxiMile                   [>] ||
|  +--------------------------------------+|
|  | Send Feedback                    [>] ||
|  +--------------------------------------+|
|  | Terms of Service                 [>] ||
|  +--------------------------------------+|
|  | Privacy Policy                   [>] ||
|  +--------------------------------------+|
|                                          |
|                                          |
|  [========= Sign Out (red) ============]|
|                                          |
|                                          |
|  v1.0.0 (build 1)                        |
|                                          |
|  --------- Tab Bar -------------------- |
+------------------------------------------+
```

### 9.2 Component List

| # | Component               | Type                | Content / Label                             | States                                       |
|---|-------------------------|---------------------|---------------------------------------------|----------------------------------------------|
| 1 | Screen Title            | Text (`heading-1`)  | "Profile"                                   | Static                                       |
| 2 | Avatar Circle           | Avatar              | User initials in colored circle             | Default (initials), Google avatar (if available) |
| 3 | User Name               | Text (`heading-2`)  | User's display name                         | `text-primary`                               |
| 4 | User Email              | Text (`body`)       | User's email address                        | `text-secondary`                             |
| 5 | Menu Row: About         | ListItem (tappable) | "About MaxiMile" + chevron                  | Opens in-app about screen or web link        |
| 6 | Menu Row: Feedback      | ListItem (tappable) | "Send Feedback" + chevron                   | Opens email compose or feedback form         |
| 7 | Menu Row: Terms         | ListItem (tappable) | "Terms of Service" + chevron                | Opens web link                               |
| 8 | Menu Row: Privacy       | ListItem (tappable) | "Privacy Policy" + chevron                  | Opens web link                               |
| 9 | Sign Out Button         | Button (outlined)   | "Sign Out"                                  | `danger` border + text; shows confirmation   |
| 10| Version Text            | Text (`caption`)    | "v1.0.0 (build 1)"                         | `text-tertiary`, center-aligned              |

### 9.3 Information Hierarchy

1. **Primary**: User identity (avatar + name + email)
2. **Secondary**: Sign Out button (main action on this screen)
3. **Tertiary**: Menu links (reference material)

### 9.4 User Flow

- **Entry**: Tap "Profile" tab in bottom nav
- **Sign Out**: Tap "Sign Out" -> confirmation alert ("Sign out of MaxiMile?") -> confirm -> Supabase sign out -> navigate to Auth Stack (Login screen)
- **Menu links**: Tap any menu row -> opens respective content (in-app webview or external browser for Terms/Privacy)

### 9.5 Interaction Notes

- **Avatar**: 64px diameter circle. Background color derived from user's name (hash to color). White initials (first letter of first + last name). If Google avatar URL exists, load that image instead.
- **Sign Out confirmation**: Native Alert: title "Sign Out?", message "You'll need to sign in again to use MaxiMile.", buttons: "Cancel" (default), "Sign Out" (destructive).
- **Menu rows**: Full width, height 48px, border-bottom 1px `border`. Chevron right icon, `text-tertiary`.

### 9.6 Design Tokens (Screen-Specific)

- User card: `bg-primary`, `border-radius-md`, `shadow-sm`, padding `lg`, center-aligned content, margin-bottom `lg`
- Avatar: 64px diameter, `border-radius-full`, `primary` background (default), white initials `heading-2`
- Menu section: `bg-primary`, `border-radius-md`, `shadow-sm`, overflow hidden
- Menu row: height 48px, padding horizontal `md`, border-bottom 1px `border`
- Sign Out button: full width, height 48px, `danger` border, `danger` text, `border-radius-sm`, margin-top `xl`
- Version: `caption`, `text-tertiary`, center-aligned, margin-top `md`

### 9.7 Empty States

Not applicable -- user must be authenticated to see this screen, so name + email are always available.

### 9.8 Behavioral Design Notes

- **Minimal v1 profile**: This screen is intentionally sparse. The product value is on the Recommend, My Cards, and Cap Status screens. Profile exists primarily for sign-out and legal compliance. Future versions can add settings, notification preferences, and account management here.
- **Sign Out friction**: Confirmation dialog prevents accidental sign-out. The word "sign in again" subtly communicates the cost of signing out.

---

## 10. Tab Navigation Bar

### 10.1 ASCII Wireframe

```
+------------------------------------------+
|  (screen content above)                  |
|                                          |
+==========================================+
| [compass] [cards] [chart] [plus]  [user]|
| Recommend MyCards CapStat  Log   Profile |
|          ^^active tab highlighted^^      |
+==========================================+
```

### 10.2 Component List

| # | Tab          | Icon (outline/filled)     | Label       | Badge                          |
|---|--------------|---------------------------|-------------|--------------------------------|
| 1 | Recommend    | Compass outline/filled     | "Recommend" | None                           |
| 2 | My Cards     | Credit card outline/filled | "My Cards"  | None                           |
| 3 | Cap Status   | Bar chart outline/filled   | "Cap Status"| Red dot if any cap >= 80%      |
| 4 | Log          | Plus-circle outline/filled | "Log"       | None                           |
| 5 | Profile      | User outline/filled        | "Profile"   | None                           |

### 10.3 States

| State     | Icon Style       | Label Color       | Background     |
|-----------|------------------|-------------------|----------------|
| Inactive  | Outline, 24px    | `text-tertiary`   | Transparent    |
| Active    | Filled, 24px     | `primary`         | Transparent    |

### 10.4 Design Tokens

- Tab bar height: 56px (content) + safe area bottom inset
- Tab bar background: `bg-primary`
- Tab bar top border: 1px `border` (hairline)
- Tab bar shadow: `shadow-md` (upward shadow for elevation)
- Icon size: `icon-size-md` (24px)
- Label: `overline` (11px), positioned 2px below icon
- Tap target: Each tab is equal width (20% of screen width), full height of tab bar
- Red dot badge: 8px diameter, `danger` background, positioned top-right of icon
- Active indicator: Icon + label use `primary` color; optional 3px `primary` dot below label

### 10.5 Interaction Notes

- **Default tab**: Recommend (first tab, active on app launch)
- **Tab switching**: Instant (no transition animation between tab screens). Each tab maintains its own navigation stack.
- **Badge on Cap Status**: A small red dot appears on the Cap Status tab icon when any card's cap for any category reaches >= 80%. This draws the user's attention to check their cap status without being intrusive.
- **Tab persistence**: Switching tabs does NOT reset navigation state. If user was on Card Detail in My Cards tab, switching to Recommend and back returns to Card Detail.
- **Safe area**: Tab bar respects bottom safe area (iPhone notch models, Android gesture nav).

### 10.6 Behavioral Design Notes

- **Recommend as home**: Positioning Recommend (the core value) as the leftmost and default tab ensures users land on the most important screen every time. This reinforces the habit: open app -> get recommendation.
- **Log in tab bar**: Having Log as a persistent tab (not hidden behind a menu) reduces the friction to log transactions. Frequent logging = accurate cap tracking = better recommendations. This is a virtuous cycle.
- **Cap Status badge**: The red dot is a subtle nudge. It does not interrupt workflow but creates curiosity: "Something needs my attention on Cap Status." This drives engagement with cap tracking.

---

## 11. Shared Components

### 11.1 Progress Bar Component

Used in: Recommend Result, Cap Status Dashboard, Card Detail

```
Props:
  - value: number (0-100, percentage filled)
  - label: string (e.g., "$350 / $1,000")
  - size: 'sm' (4px) | 'md' (8px) | 'lg' (12px)

Visual:
  +------[====fill====            ]------+

Colors (automatic based on value):
  - value < 80:  fill = success (#34A853)
  - value >= 80 && < 100: fill = warning (#FBBC04)
  - value >= 100: fill = danger (#EA4335)

Animation:
  - On mount: animate width from 0 to target over 400ms (ease-out)
```

### 11.2 Card Row Component

Used in: My Cards list, Onboarding card list, Alternative cards in Recommend

```
Props:
  - bankName: string
  - cardName: string
  - rightContent: ReactNode (Add button, mpd badge, chevron, etc.)
  - onPress: function
  - swipeable: boolean (enables swipe-to-delete)

Layout:
  +--------------------------------------+
  | [Bank Name]       caption-bold, grey |
  | [Card Name]       heading-3, black   |
  | [Subtext]         caption, grey      |
  |                          [rightSlot] |
  +--------------------------------------+

Dimensions:
  - Min height: 72px
  - Padding: md (16px) all sides
  - Background: bg-primary
  - Border radius: border-radius-md (if card style) or 0 (if list style)
```

### 11.3 Bottom Sheet Picker

Used in: Log Transaction (category picker, card picker)

```
Layout:
  +----- (backdrop: rgba(0,0,0,0.5)) -----+
  |                                        |
  |  +------------------------------------+|
  |  |  ---- handle bar ----              ||
  |  |                                    ||
  |  |  [Title]                           ||
  |  |                                    ||
  |  |  [Option 1]              [check]   ||
  |  |  [Option 2]                        ||
  |  |  [Option 3]                        ||
  |  |  ...                               ||
  |  |                                    ||
  |  +------------------------------------+|
  +----------------------------------------+

Specs:
  - Handle bar: 40px wide, 4px tall, border-radius-full, bg-tertiary, centered
  - Title: heading-2, text-primary, padding md
  - Option row: height 48px, padding horizontal md, border-bottom 1px border
  - Selected option: primary text color + checkmark icon right-aligned
  - Animation: slide up from bottom, 250ms ease-out
  - Dismiss: tap backdrop or swipe down
  - Max height: 60% of screen
  - Border radius: border-radius-lg (top corners only)
```

### 11.4 Button Component

```
Variants:
  1. Filled (Primary):
     - Background: primary
     - Text: text-on-primary, body-bold
     - Height: 48px
     - Border radius: border-radius-sm (8px)
     - States: Default, Pressed (opacity 0.9), Loading (spinner), Disabled (opacity 0.5)

  2. Outlined:
     - Background: transparent
     - Border: 1.5px [color]
     - Text: [color], body-bold
     - Height: 48px
     - Border radius: border-radius-sm
     - Colors: primary (default), danger (destructive)

  3. Text Button:
     - Background: transparent
     - Text: primary, body-bold
     - No border
     - Tap target: min 44px tall

  4. Small Button (Add/Added):
     - Height: 36px
     - Width: 72px
     - Border radius: border-radius-sm
     - Text: caption-bold
```

### 11.5 Toast / Snackbar

Used for: Error messages, network errors, non-blocking notifications

```
Layout:
  +--------------------------------------+
  | [icon]  Message text here     [X]    |
  +--------------------------------------+

Specs:
  - Position: top of screen, below status bar, with md padding
  - Height: auto (min 44px)
  - Background: text-primary (dark) for default; danger-light for errors
  - Text: text-on-primary (on dark) or danger (on light)
  - Border radius: border-radius-sm
  - Shadow: shadow-md
  - Animation: slide down from top, 200ms; auto-dismiss after 3 seconds
  - Dismiss: tap X or swipe up
```

### 11.6 Loading States

```
Skeleton Screens (preferred over spinners):
  - Card rows: grey rectangle placeholders pulsing (opacity 0.3 -> 0.7, 1s loop)
  - Progress bars: grey bar placeholder
  - Text: grey rounded rectangles matching text line heights

Spinner (used for button loading only):
  - ActivityIndicator, 20px, white (on primary buttons) or primary (on secondary)
  - Replaces button text during API call
```

---

## 12. Full Navigation Flow Diagram

```
                        +-------------+
                        |  App Launch  |
                        +------+------+
                               |
                    [Check Supabase session]
                               |
                 +-------------+-------------+
                 |                           |
           No session                   Has session
                 |                           |
                 v                           v
         +-------+-------+        +---------+---------+
         |  Login Screen  |        | Check user_cards  |
         |  (Auth Stack)  |        |   count >= 1?     |
         +-------+-------+        +---------+---------+
                 |                     |           |
            [Auth success]            NO          YES
                 |                     |           |
                 v                     v           v
         +-------+-------+    +-------+---+  +---+--------+
         | Check          |    | Onboarding |  | Main Tabs  |
         | user_cards     |    | Add Cards  |  | (Recommend)|
         | count >= 1?    |    +-------+----+  +---+--------+
         +---+--------+--+            |            |
             |        |          [Done, >=1 card]  |
            NO       YES              |            |
             |        |               +------>-----+
             v        v
      Onboarding   Main Tabs


MAIN TAB NAVIGATOR:

+==============+============+==============+===========+===========+
|  Recommend   |  My Cards  |  Cap Status  |    Log    |  Profile  |
+==============+============+==============+===========+===========+
|              |            |              |           |           |
| Category     | Card List  | Cap Dashboard| Log Form  | Profile   |
| Grid         |    |       |              |    |      | Screen    |
|    |         |    v       |              |    v      |           |
|    v         | Card Detail|              | Success   |           |
| Recommend    |    |       |              | Overlay   |           |
| Result       |    v       |              |           |           |
|    |         | Add More   |              |           |           |
|    v         | Cards      |              |           |           |
| Log Tx       |            |              |           |           |
| (push)       |            |              |           |           |
+--------------+------------+--------------+-----------+-----------+


CROSS-SCREEN FLOWS:

Recommend Result --[Log Transaction]--> Log Tx (pre-filled category + card)
Log Tx Success   --[Done]-----------> Back to Recommend Result
My Cards         --[Add More Cards]--> Add Cards Screen (reused)
Add Cards        --[Done]-----------> Back to My Cards
Profile          --[Sign Out]-------> Auth Stack (Login)
Any Screen       --[Tab tap]--------> Corresponding Tab (maintain stack)
```

---

## 13. Behavioral Design Summary

### 13.1 Time-of-Day Defaults

| Time Range    | Suggested Category | Rationale                                |
|---------------|--------------------|-----------------------------------------|
| 07:00 - 09:00| Transport          | Morning commute                          |
| 11:00 - 14:00| Dining             | Lunch                                    |
| 17:00 - 21:00| Dining             | Dinner                                   |
| All other     | General (no highlight) | No strong category signal            |

Implementation: On Recommend screen load, check device time. Apply a subtle pulsing blue border to the suggested category tile. This is a hint, not a default selection -- the user still taps to confirm.

### 13.2 Loss Aversion Cues

| Location               | Cue                                              | Purpose                                |
|------------------------|--------------------------------------------------|----------------------------------------|
| Log Success overlay    | "You earned 4.0 mpd. Without MaxiMile: ~1.4 mpd"| Show value of using the app            |
| Cap Status (red bars)  | Red "FULL" badge + progress bar                  | Fear of losing bonus miles             |
| Recommend Result       | "Cap: $200 remaining" (low amount, amber/red)    | Urgency to switch cards before cap hit |
| Recommend Alternatives | "FULL" badge next to capped cards                | Relief that app caught this for user   |

### 13.3 Speed Targets

| Flow                        | Target     | Design Decisions Supporting This                       |
|-----------------------------|------------|-------------------------------------------------------|
| App open to recommendation  | < 5 sec    | Default tab is Recommend; time-of-day highlight; 1 tap |
| Category tap to result      | < 1 sec    | Pre-cached data; local computation; no network call    |
| Log Transaction (from rec)  | < 10 sec   | Pre-filled category + card; custom keypad; 1 confirm   |
| Onboarding (3 cards)        | < 2 min    | 20 cards, bank-grouped, single-tap add                 |

### 13.4 Trust Signals

| Signal                      | Implementation                                    |
|-----------------------------|---------------------------------------------------|
| Show reasoning              | Earn rate + cap remaining on every recommendation |
| Transparency                | Card Detail shows all 7 category rates            |
| Accuracy indicator          | "Last updated: DD MMM YYYY" on Card Detail        |
| Reversibility               | Add/remove cards freely; no lock-in               |

---

## 14. Developer Implementation Notes

### 14.1 React Native Component Mapping

| Design Component       | Suggested RN Implementation                         |
|------------------------|-----------------------------------------------------|
| Tab Navigator          | `@react-navigation/bottom-tabs`                     |
| Stack Navigator        | `@react-navigation/native-stack`                     |
| Category Grid          | `FlatList` with `numColumns={2}` + footer full-width item |
| Card List              | `FlatList` with `SectionList` (bank sections)        |
| Swipe-to-Delete        | `react-native-gesture-handler` Swipeable             |
| Bottom Sheet Picker    | `@gorhom/bottom-sheet`                               |
| Progress Bar           | Custom `View` with animated width (`Animated.View`)  |
| Custom Keypad          | Custom grid of `TouchableOpacity` components         |
| Success Overlay        | `Modal` with `transparent` background                |
| Skeleton Loading       | `react-native-skeleton-placeholder` or custom pulse  |
| Safe Area              | `react-native-safe-area-context`                     |
| Haptics                | `expo-haptics`                                       |
| Icons                  | `@expo/vector-icons` (MaterialCommunityIcons set)    |

### 14.2 Data Flow Per Screen

| Screen             | Data Source                        | Write Operations               |
|--------------------|------------------------------------|--------------------------------|
| Login/Sign Up      | Supabase Auth                      | Create session                 |
| Onboarding         | `cards` table (read all active)    | Insert `user_cards` rows       |
| My Cards           | `user_cards` + `cards` + `earn_rules` | Delete `user_cards` row    |
| Card Detail        | `cards` + `earn_rules` + `caps`    | None                           |
| Recommend Grid     | `categories` table                 | None                           |
| Recommend Result   | `user_cards` + `earn_rules` + `caps` + `transactions` (aggregated) | None |
| Log Transaction    | `categories` + `user_cards`        | Insert `transactions` row      |
| Cap Status         | `user_cards` + `caps` + `transactions` (aggregated monthly) | None |
| Profile            | Supabase Auth user                 | Sign out (delete session)      |

### 14.3 Performance Requirements

- **Recommendation calculation**: Must run client-side against cached data. Do NOT make a network call when user taps a category. Cache all user_cards, earn_rules, caps, and monthly spend aggregates on app load and after each transaction log.
- **Offline support (v1 minimum)**: Recommendation screen must work offline if data is cached. Log Transaction should queue offline and sync when connected.
- **Image strategy (v1)**: No card images. Text-only card display (bank name + card name). This eliminates image loading latency.

### 14.4 Accessibility Notes (Deferred to v1.1, but build with foundation)

- All interactive elements must have `accessibilityLabel` and `accessibilityRole`
- Progress bars: `accessibilityLabel="Dining cap: 35% used, $650 remaining of $1000"`
- Minimum contrast ratio 4.5:1 for text (all specified colors meet this)
- Minimum tap target 44px (enforced in all component specs above)

### 14.5 Screen Dimension Assumptions

- Design target: iPhone 14 / Pixel 7 (390 x 844 pt / 412 x 915 dp)
- Minimum supported: iPhone SE 3rd gen (375 x 667 pt)
- All layouts must be responsive. Use flex layout, not absolute positioning.
- Category tiles should be equal width based on `(screenWidth - horizontalPadding*2 - gap) / 2`

---

## 15. Brand Assets Reference

Pre-designed logo assets are available in `public/assets/`. Use these in the app:

| File | Description | Usage |
|------|-------------|-------|
| `Logo.png` | "M" compass mark — gold compass ring, dark charcoal lettermark, airplane icons. White background. | App icon, small header logo (~32px), Profile screen |
| `Name.png` | "MaxiMile" wordmark — "Maxi" in dark charcoal, "Mile" in gold. White background. | Login screen (below logo), Onboarding header |
| `Logo_wName_Contrast.jpg` | Full horizontal lockup (compass + wordmark) on dark slate background (~#3C4858) | Splash screen |
| `Logo_Contrast.png` | "M" compass mark — white version on dark slate background (~#3C4858) | Dark-mode ready variant (future use) |

**Brand palette** (for reference — align UI accent colors where appropriate):
- Dark charcoal: #2D3748
- Gold accent: #C5A55A
- Dark slate: #3C4858
- Baby yellow: #FDFD96 — use for highlight backgrounds, recommendation badges, feature callouts, onboarding accents
- Baby yellow light: #FEFED5 — subtle tint variant for cards and sections

**Placement guide**:
- **Login screen**: `Logo.png` centered (80×80), `Name.png` below (width: 160px), then form fields
- **Tab header**: `Logo.png` (24×24) left-aligned in navigation bar
- **Profile screen**: `Logo.png` centered (64×64) above user info
- **Splash/loading**: `Logo_wName_Contrast.jpg` full-screen centered

---

*End of Design Requirements Document. This document covers all 7 MVP screens, shared components, navigation architecture, design tokens, behavioral design, developer implementation guidance, and brand asset references. A React Native developer should be able to build pixel-accurate screens from this specification alone.*
