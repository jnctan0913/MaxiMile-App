# Design Requirements Document: MaxiMile — Master Design System

**Version**: 1.0
**Last Updated**: 2026-02-21
**Author**: UI/UX Designer Agent
**Status**: Active
**Scope**: Complete MaxiMile app design system and global specifications
**PRD Reference**: PRD v1.8

---

## Table of Contents

1. [Overview](#1-overview)
2. [Global Design Principles](#2-global-design-principles)
3. [Information Architecture](#3-information-architecture)
4. [Design Tokens](#4-design-tokens)
5. [Component Library](#5-component-library)
6. [Interaction Patterns](#6-interaction-patterns)
7. [Accessibility Requirements](#7-accessibility-requirements)
8. [Responsive & Platform](#8-responsive--platform)
9. [Feature-Specific DRDs](#9-feature-specific-drds)

---

## 1. Overview

### 1.1 Product Vision

**MaxiMile** is a context-aware mobile application that helps Singapore urban professionals maximize airline miles from credit card spending. It eliminates the cognitive burden of managing complex multi-card rules by providing:

- **Real-time card recommendations** at the point of payment
- **Automated bonus cap tracking** across all cards
- **Intelligent transaction logging** with auto-capture (iOS/Android)
- **Unified miles portfolio** with transfer partner mapping
- **Community-powered** rate change detection

### 1.2 Design Philosophy

MaxiMile's design philosophy is built on three pillars:

1. **Clarity Over Complexity** — Financial optimization is complex, but the interface must be simple. Every screen has one primary action.

2. **Trust Through Transparency** — Users trust automation when they understand it. Always show the user what the system is doing and why.

3. **Delight in Details** — Premium feel through glassmorphic surfaces, brand gold accents, and micro-interactions that celebrate user success.

### 1.3 Visual Identity

**Brand Palette:**
- **Primary**: Brand Gold (#C5A55A) — Premium, aspirational, travel-focused
- **Secondary**: Brand Charcoal (#2D3748) — Sophisticated, trustworthy
- **Accent**: Baby Yellow (#FDFD96) — Highlight, celebrate milestones

**Design Language:**
- **Glassmorphism** — Frosted glass surfaces with blur effects (expo-blur)
- **Card-based layout** — All major content in elevated cards
- **Subtle gradients** — Gold gradients for CTAs and accents
- **Icon-driven** — Ionicons throughout for consistency

### 1.4 Target Platforms

- **Primary**: iOS 14+ and Android 10+ (React Native via Expo)
- **Screen sizes**: Mobile-first (375px–428px width)
- **Orientation**: Portrait only (locked)

---

## 2. Global Design Principles

These principles apply across **all features** in MaxiMile:

### 2.1 Core Principles

1. **Auto-magic First**
   Pre-fill everything possible. The user's job is to confirm, not to enter. Show calculated values immediately from existing data.

2. **Transparent Automation**
   Always show users what was captured/calculated and where it came from. No black boxes. Build trust through visibility.

3. **Graceful Degradation**
   If automation fails or captures partial data, fall back to an editable manual form seamlessly. Never block the user.

4. **Trust Through Control**
   Users can always edit, dismiss, or disable automated features. Auto-capture never forces a save. Manual override is always possible.

5. **Progressive Disclosure**
   Show the most important information first (total at top), then per-item breakdown, then detail on tap. Don't overwhelm.

6. **Celebrate Progress**
   Use brand gold (#C5A55A) for milestones, satisfying animations when goals are reached, and positive reinforcement for good behavior.

7. **Familiar Patterns**
   Reuse the glassmorphic card style, bottom sheet patterns, and brand gold accents consistently across all features.

8. **Skippable Onboarding**
   Never block the user. Every onboarding step is optional. Balance entry, auto-capture setup, etc. — all skippable.

9. **Honest Coverage**
   Never imply complete coverage. Clearly communicate what works and what doesn't (e.g., "Apple Pay only" for iOS auto-capture).

10. **Platform-Native Feel**
    iOS setup uses Shortcuts (feels Apple-native). Android uses system permission flows (feels Android-native). Respect platform conventions.

### 2.2 Feature-Specific Extensions

Additional principles are defined in feature-specific DRDs:
- **Auto-Capture**: Platform-native setup, honest coverage, transparent automation
- **Miles Portfolio**: Destination-first thinking, confirmed vs. potential clarity, actionable nudges

---

## 3. Information Architecture

### 3.1 Overall App Structure

```
MaxiMile App
│
├── Onboarding Flow (first-time only)
│   ├── Step 1: Welcome & Login (Supabase auth)
│   ├── Step 2: Add Your Cards (card portfolio setup)
│   ├── Step 3: Enable Auto-Capture (optional, platform-adaptive)
│   └── Step 4: Set Miles Balances (optional)
│
├── Main App (5 tabs in bottom navigation)
│   │
│   ├── Tab 1: My Cards
│   │   ├── Card List (glassmorphic cards)
│   │   ├── Add Card flow
│   │   └── Card Detail Screen
│   │       ├── Earn rules table
│   │       ├── Bonus caps
│   │       └── Recent transactions
│   │
│   ├── Tab 2: Cap Status
│   │   ├── Overview (all caps)
│   │   ├── Per-card cap breakdown
│   │   └── Cap approach alerts (>80% badge)
│   │
│   ├── Tab 3: Recommend (HOME — hero tab)
│   │   ├── Category Grid (7 categories)
│   │   ├── Recommendation Result
│   │   ├── Smart Pay Flow (location → merchant → recommend → wallet)
│   │   └── Quick Actions (Log, View Miles)
│   │
│   ├── Tab 4: Log Transaction
│   │   ├── Manual Transaction Form (fallback)
│   │   ├── Auto-Capture Confirmation Screen (iOS/Android)
│   │   └── Transaction History
│   │
│   └── Tab 5: Miles
│       ├── Two-Layer Architecture (My Miles / My Points)
│       ├── Program Detail Screen
│       ├── Update Balance / Log Redemption / Set Goal (bottom sheets)
│       └── Transfer Partner Mapping (bank → airline)
│
├── Settings (accessed via header icon)
│   ├── Profile
│   ├── Auto-Capture Settings
│   ├── Notifications
│   ├── Data Export
│   └── Logout
│
└── Modals & Overlays
    ├── Bottom Sheets (balance entry, redemption, goals)
    ├── Confirmation Dialogs
    └── Celebration Overlays (goal achieved, cap approach)
```

### 3.2 Navigation Patterns

| Pattern | Behavior |
|---------|----------|
| **Bottom Tab Navigation** | Primary navigation; 5 tabs (Cards, Caps, Recommend, Log, Miles) |
| **Stack Navigation** | Within tabs (e.g., Card List → Card Detail) |
| **Modal Bottom Sheets** | For forms and quick actions (Update Balance, Log Redemption, etc.) |
| **Header Right Icon** | Profile access (person-circle-outline icon in brand gold) |
| **Back Navigation** | Native platform back button (Android) or header back button (iOS) |

### 3.3 Tab Bar Design

- **Position**: Absolute, floating above content
- **Background**: LinearGradient + BlurView (iOS only, intensity 40)
- **Height**: 88px (iOS), 68px (Android)
- **Active Color**: Brand Gold (#C5A55A)
- **Inactive Color**: #9AA0A6
- **Hero Tab** (Recommend): 56x56 gold circular button with logo, elevated above bar

---

## 4. Design Tokens

All tokens are defined in `/maximile-app/constants/theme.ts` and must be used consistently.

### 4.1 Colors

#### Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `Colors.brandGold` | `#C5A55A` | CTAs, active tabs, progress bars, accents, milestones |
| `Colors.brandCharcoal` | `#2D3748` | CTA button text, dark mode surfaces |
| `Colors.babyYellow` | `#FDFD96` | Recommendation badges, onboarding highlights |
| `Colors.babyYellowLight` | `#FEFED5` | Subtle card backgrounds, nudge pills |

#### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `Colors.primary` | `#1A73E8` | Links, info states (rare use) |
| `Colors.success` | `#34A853` | Positive actions, "You used the best card!" banners, green cap status |
| `Colors.warning` | `#FBBC04` | Amber cap status (20-50% remaining), warnings |
| `Colors.danger` | `#EA4335` | Red cap status (<20%), redemptions, delete actions, errors |

#### Neutral Colors

| Token | Value | Usage |
|-------|-------|-------|
| `Colors.background` | `#F8F9FA` | Screen backgrounds |
| `Colors.surface` | `#FFFFFF` | Card backgrounds, bottom sheets, headers |
| `Colors.border` | `#E0E0E0` | Input borders, dividers |
| `Colors.borderLight` | `#F0F0F0` | Subtle dividers, progress bar tracks |

#### Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `Colors.textPrimary` | `#1A1A2E` | Headings, card names, primary labels |
| `Colors.textSecondary` | `#5F6368` | Subtitles, descriptions, helper text |
| `Colors.textTertiary` | `#9AA0A6` | Timestamps, inactive states, placeholders |
| `Colors.textInverse` | `#FFFFFF` | Text on dark backgrounds (CTAs, hero tab) |

#### Glassmorphism

| Token | Value | Usage |
|-------|-------|-------|
| `Colors.glassBg` | `rgba(255,255,255,0.7)` | Frosted glass card background |
| `Colors.glassBorder` | `rgba(255,255,255,0.3)` | Glass card edge highlight |
| `Colors.glassFallback` | `rgba(255,255,255,0.85)` | Solid fallback (Android blur not available) |

### 4.2 Typography

All typography tokens include fontSize, fontWeight, lineHeight, and letterSpacing.

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `Typography.heading` | 28 | 700 | 34 | Screen titles (overridden to 26 per app convention) |
| `Typography.subheading` | 20 | 600 | 26 | Bottom sheet titles, section headers |
| `Typography.body` | 16 | 400 | 22 | Body text, descriptions |
| `Typography.bodyBold` | 16 | 600 | 22 | Card names, balance values, CTA text |
| `Typography.caption` | 13 | 400 | 18 | Timestamps, helper text, labels |
| `Typography.captionBold` | 13 | 600 | 18 | Section headers, input labels |
| `Typography.label` | 11 | 500 | 14 | Uppercase labels, badges (all caps) |

**Custom Sizes** (not in theme.ts):
- **Hero Numbers**: 40px, weight 700 (miles totals, cap amounts)
- **Tab Bar Labels**: 10px, weight 600, letter-spacing 0.3

### 4.3 Spacing

| Token | Value | Common Usage |
|-------|-------|-------------|
| `Spacing.xs` | 4px | Micro gaps, icon padding, tight inline spacing |
| `Spacing.sm` | 8px | Card separator height, inline gaps, list row padding |
| `Spacing.md` | 12px | Card vertical padding, compact spacing |
| `Spacing.lg` | 16px | Card horizontal padding, list item spacing |
| `Spacing.xl` | 24px | Section gaps, between cards |
| `Spacing.xxl` | 32px | Screen top/bottom padding, major section breaks |
| `Spacing.xxxl` | 48px | Extra large section breaks, onboarding steps |

### 4.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `BorderRadius.sm` | 4px | Small buttons, input fields |
| `BorderRadius.md` | 8px | Standard cards, tiles |
| `BorderRadius.lg` | 12px | Bottom sheet top corners, modals |
| `BorderRadius.xl` | 16px | Glassmorphic cards (primary card radius) |
| `BorderRadius.full` | 9999px | Pills, badges, progress bars (rounded ends) |

### 4.5 Shadows

| Token | Values | Usage |
|-------|--------|-------|
| `Shadows.sm` | offset(0,1), opacity 0.08, radius 2, elevation 1 | Subtle cards, list items |
| `Shadows.md` | offset(0,2), opacity 0.12, radius 4, elevation 3 | Standard cards, buttons |
| `Shadows.lg` | offset(0,4), opacity 0.15, radius 8, elevation 5 | Prominent cards, hero tab |
| `Shadows.glass` | offset(0,8), opacity 0.08, radius 32, elevation 4 | Glassmorphic surfaces (soft elevation) |

### 4.6 Glassmorphism Constants

| Constant | Value | Usage |
|----------|-------|-------|
| `Glass.blurIntensity` | 60 | Standard glass surfaces (cards, modals) |
| `Glass.blurIntensityLight` | 30 | Tab bar (lighter blur) |
| `Glass.tint` | `'light'` | BlurView tint |
| `Glass.borderRadius` | 16px | Glass card border radius |
| `Glass.borderWidth` | 1px | Glass card border width |

**Surfaces to apply glassmorphism:**
- Recommendation hero card
- Tab bar
- Bottom sheets
- Modals
- Login form
- Auto-capture confirmation screen

**Surfaces NOT to use glassmorphism:**
- Data lists (transaction history)
- Input fields
- Alternative recommendation cards
- Onboarding list screens

---

## 5. Component Library

Global shared components used across multiple features.

### 5.1 GlassCard

**Purpose**: Reusable glassmorphic card container with blur effect.

**Variants**:
- `standard` — Frosted glass with blur (iOS), fallback solid (Android)
- `solid` — Opaque white card with shadow (no blur)

**Props**:
- `children`: ReactNode
- `style`: StyleProp<ViewStyle>
- `variant`: 'standard' | 'solid' (default: 'standard')

**States**:
- Default, Pressed (if wrapped in TouchableOpacity)

**Accessibility**:
- Inherits accessible props from parent
- Sufficient color contrast maintained (WCAG AA)

**File**: `/maximile-app/components/GlassCard.tsx`

---

### 5.2 BottomSheet

**Purpose**: Reusable modal bottom sheet for forms and quick actions.

**Props**:
- `visible`: boolean
- `onClose`: () => void
- `title`: string
- `children`: ReactNode
- `height`: number | 'auto' (default: 'auto')

**Behavior**:
- Slides up from bottom with spring animation
- Backdrop tap dismisses (calls onClose)
- Swipe down to dismiss
- Safe area insets respected (iOS)

**Layout**:
- Top border radius: 12px (BorderRadius.lg)
- Background: Colors.surface (white)
- Shadow: Shadows.lg
- Handle indicator (grey pill) at top center

**Accessibility**:
- Announced as modal dialog
- Focus trapped within sheet
- Swipe-to-dismiss announced

**File**: `/maximile-app/components/BottomSheet.tsx`

---

### 5.3 Button (Primary CTA)

**Purpose**: Brand gold primary call-to-action button.

**Variants**:
- `primary` — Solid gold background, white text
- `ghost` — Outlined, grey border, grey text
- `danger` — Red background, white text

**Props**:
- `title`: string
- `onPress`: () => void
- `variant`: 'primary' | 'ghost' | 'danger'
- `disabled`: boolean
- `loading`: boolean (shows spinner)
- `icon`: Ionicons name (optional)

**States**:
- Default, Pressed, Disabled, Loading

**Layout**:
- Height: 48px
- Border radius: 8px (BorderRadius.md)
- Horizontal padding: 24px (Spacing.xl)
- Minimum width: 120px

**Accessibility**:
- Minimum 44pt touch target
- Loading state announced ("Loading...")
- Disabled state indicated in accessible label

**File**: `/maximile-app/components/Button.tsx`

---

### 5.4 ProgressBar

**Purpose**: Brand gold progress bar for goals and cap tracking.

**Props**:
- `current`: number
- `target`: number
- `color`: string (default: Colors.brandGold)
- `height`: number (default: 8)
- `showLabel`: boolean (default: false)

**Layout**:
- Track: Colors.borderLight (grey)
- Fill: Brand gold (#C5A55A) or custom color
- Border radius: BorderRadius.full (pill shape)
- Animated fill with spring transition

**States**:
- Normal, Achieved (100%+, shows celebration animation)

**Accessibility**:
- Announced as "Progress: X of Y" (e.g., "Progress: 45,000 of 60,000 miles")
- Percentage announced ("75% complete")

**File**: `/maximile-app/components/ProgressBar.tsx`

---

### 5.5 CardRow (User Card Display)

**Purpose**: Display user's credit card in a list or detail view.

**Props**:
- `card`: UserCard object
- `onPress`: () => void (optional)
- `showEarnRate`: boolean (default: false)
- `compact`: boolean (default: false)

**Layout**:
- Card image (48x32) on left
- Card name (Typography.bodyBold)
- Earn rate (Typography.caption, grey) if showEarnRate
- Chevron icon on right if onPress provided

**States**:
- Default, Pressed (if tappable)

**Accessibility**:
- Accessible label: "Card name, earn rate X miles per dollar" (if shown)
- Tappable state indicated ("button" role)

**File**: `/maximile-app/components/CardRow.tsx`

---

### 5.6 CategoryIcon

**Purpose**: Consistent category icon display across all features.

**Props**:
- `categoryId`: string
- `size`: number (default: 24)
- `color`: string (default: Colors.brandGold)

**Mapping**:
| Category | Icon (Ionicons) |
|----------|-----------------|
| Dining | restaurant-outline |
| Groceries | cart-outline |
| Transport | car-outline |
| Online Shopping | basket-outline |
| Travel | airplane-outline |
| Utilities | flash-outline |
| General/Others | card-outline |

**File**: `/maximile-app/components/CategoryIcon.tsx`

---

### 5.7 LoadingSpinner

**Purpose**: Global loading indicator.

**Variants**:
- `fullscreen` — Centered overlay with backdrop
- `inline` — Small spinner within a component

**Props**:
- `variant`: 'fullscreen' | 'inline'
- `message`: string (optional, shown for fullscreen)

**Layout**:
- Spinner color: Colors.brandGold
- Fullscreen backdrop: rgba(0,0,0,0.3)

**Accessibility**:
- Announced as "Loading" + message
- Prevents interaction while loading

**File**: `/maximile-app/components/LoadingSpinner.tsx`

---

### 5.8 EmptyState

**Purpose**: Consistent empty state display when no data exists.

**Props**:
- `icon`: Ionicons name
- `title`: string
- `message`: string
- `actionLabel`: string (optional)
- `onAction`: () => void (optional)

**Layout**:
- Icon (size 64, Colors.textTertiary) centered
- Title (Typography.subheading, textPrimary)
- Message (Typography.body, textSecondary)
- Action button (primary variant) if provided

**Accessibility**:
- Focus on action button when present
- Announced as region with title + message

**File**: `/maximile-app/components/EmptyState.tsx`

---

## 6. Interaction Patterns

Global interaction patterns used consistently across all features.

### 6.1 Navigation Patterns

| Pattern | Behavior |
|---------|----------|
| **Tab Switch** | Instant switch (no animation), scroll resets to top |
| **Push to Stack** | Slide-in from right (iOS) or fade (Android) |
| **Modal Present** | Slide up from bottom with spring animation |
| **Back Navigation** | Slide-out to left (iOS) or fade (Android) |
| **Deep Link** | Opens relevant screen with context preserved |

### 6.2 Form Patterns

| Pattern | Behavior |
|---------|----------|
| **Input Focus** | Border color changes to brandGold, keyboard opens |
| **Input Error** | Border color changes to danger, error message below |
| **Dropdown** | Opens native picker (iOS wheel, Android dropdown) |
| **Date Picker** | Opens native date picker modal |
| **Submit** | Button shows loading spinner, disables during submission |
| **Cancel** | Dismisses form, shows "Discard changes?" if dirty |

### 6.3 Feedback Patterns

| Pattern | Behavior |
|---------|----------|
| **Success Toast** | Green checkmark + message, auto-dismisses after 2s |
| **Error Toast** | Red exclamation + message, auto-dismisses after 4s |
| **Confirmation Dialog** | Modal with title, message, Cancel/Confirm buttons |
| **Progress Indicator** | Loading spinner (inline or fullscreen) |
| **Celebration Overlay** | Confetti animation + success message (goal achieved) |

### 6.4 Data Loading Patterns

| Pattern | Behavior |
|---------|----------|
| **Initial Load** | Fullscreen spinner with brand logo |
| **Pull to Refresh** | Native RefreshControl, brandGold color |
| **Infinite Scroll** | Load more on scroll to bottom (if applicable) |
| **Skeleton Screen** | Placeholder shapes animate while loading (rare use) |
| **Error State** | EmptyState component with retry action |

### 6.5 Auto-Capture Patterns

| Pattern | Behavior |
|---------|----------|
| **Auto-capture arrival (iOS)** | App opens/foregrounds to confirmation screen |
| **Auto-capture arrival (Android)** | Notification posted, user taps to open |
| **Smart Pay handoff** | If auto-capture fires within 60s of Wallet return, skip manual entry |
| **Recommendation match** | Calls recommend() RPC, shows green "best card" or blue "tip" nudge |
| **Confirmation** | Single tap "Confirm" → 0.8s success overlay → return to Log tab |

---

## 7. Accessibility Requirements

MaxiMile complies with **WCAG 2.1 Level AA** standards.

### 7.1 Screen Reader Support

- [x] All interactive elements have accessible labels
- [x] VoiceOver (iOS) and TalkBack (Android) fully supported
- [x] Navigation announcements ("Recommend tab selected")
- [x] State changes announced ("Loading complete")
- [x] Form errors announced immediately

### 7.2 Keyboard & Focus

- [x] Logical tab order for all focusable elements
- [x] Focus indicators visible (brand gold outline, 2px)
- [x] Keyboard navigation supported (hardware keyboard on tablets)
- [x] Modal focus trap (focus cycles within bottom sheet)

### 7.3 Touch Targets

- [x] Minimum 44pt x 44pt touch targets for all interactive elements
- [x] Sufficient spacing between tappable elements (min 8px)
- [x] Hit slop provided for small icons (8px padding)

### 7.4 Color & Contrast

- [x] Text meets WCAG AA contrast ratios:
  - `textPrimary` on `surface`: 13.8:1 (AAA)
  - `textSecondary` on `surface`: 7.2:1 (AA)
  - `brandGold` on `brandCharcoal`: 4.6:1 (AA)
- [x] Color not used as sole indicator (icons + text accompany status colors)
- [x] Cap status uses both color + icon (green/amber/red + bar fill level)

### 7.5 Motion & Animation

- [x] Animations respect user's motion preferences (prefers-reduced-motion)
- [x] Critical information not conveyed solely through animation
- [x] Loading states have text labels ("Loading...") not just spinners

### 7.6 Alternative Text

- [x] All card images have alt text (e.g., "DBS Altitude Visa card logo")
- [x] Decorative images use empty alt text (aria-hidden)
- [x] Icons paired with visible text labels

---

## 8. Responsive & Platform

### 8.1 Screen Size Support

**Primary Target**: iPhone SE (375px) to iPhone 14 Pro Max (428px)

| Breakpoint | Width | Layout Adjustments |
|------------|-------|-------------------|
| Small | 375px | Base layout, single column |
| Medium | 390px–414px | Standard layout (majority of users) |
| Large | 428px | Slightly more horizontal padding |

**Orientation**: Portrait only (locked via app.json)

### 8.2 iOS vs Android Differences

| Element | iOS | Android |
|---------|-----|---------|
| **Tab Bar Height** | 88px (includes safe area) | 68px |
| **Tab Bar Blur** | BlurView (intensity 40) | LinearGradient (no blur) |
| **Navigation Transition** | Slide (left/right) | Fade |
| **Date Picker** | Native wheel picker | Calendar dropdown |
| **Status Bar** | Auto (light on dark backgrounds) | Controlled per screen |
| **Safe Area** | Respected (notch, home indicator) | Minimal (only Android gesture bar) |
| **Back Button** | Header (< icon) | Android system back |
| **Haptics** | Light impact on interactions | Vibration (limited) |

### 8.3 Platform-Specific Features

**iOS Only:**
- Apple Pay Shortcuts auto-capture (F26)
- BlurView for glassmorphism (true frosted glass)

**Android Only:**
- Notification Listener Service for auto-capture (F27)
- Battery optimization guidance (manufacturer-specific)

---

## 9. Feature-Specific DRDs

This master DRD defines the **global design system**. For detailed feature specifications, refer to:

### 9.1 DRD: Transaction Auto-Capture (F26-F27)

**File**: `docs/design/DRD_AUTO_CAPTURE.md`
**Version**: 1.1
**Features Covered**: F26 (iOS Apple Pay Shortcuts), F27 (Android Notification Auto-Capture)

**Scope**:
- iOS Shortcuts setup wizard
- Android notification permission flow
- Auto-capture confirmation screen (shared iOS/Android)
- Recommendation match indicator
- Smart Pay → Auto-Capture handoff
- Card mapping (iOS fuzzy match, Android last-4-digits)

**Key Sections**:
- Section 2: User Journey Maps (iOS/Android)
- Section 4: Screen Specifications (Confirmation Screen, Setup Wizard)
- Section 7: Design Tokens (Auto-Capture specific)

---

### 9.2 DRD: Miles Portfolio (F13-F24)

**File**: `docs/design/DRD_MILES_PORTFOLIO.md`
**Version**: 4.0
**Features Covered**: F13-F24 (Miles Portfolio, Two-Layer Architecture, Transfer Partner Mapping, Card Coverage Expansion, Rate Change Monitoring, Community Submissions)

**Scope**:
- Miles tab with two-layer architecture ("My Miles" / "My Points")
- Program detail screen
- Balance entry, redemption logging, goal tracking (bottom sheets)
- Transfer partner mapping UI
- Smart transfer nudges
- Eligibility badges for restricted cards
- Rate change notification banners
- Community submission form and admin dashboard

**Key Sections**:
- Section 4: Screen Specifications (Program cards, detail screens, bottom sheets)
- Section 11: Design Tokens Reference (Miles-specific colors, typography)
- Section 16: Community Submissions UI

---

## 10. Handover Notes for Developers

### 10.1 Design System Implementation

1. **Always use theme.ts constants** — Never hardcode colors, spacing, or typography
2. **Glassmorphism is iOS-only** — Provide solid fallback for Android (glassFallback color)
3. **Test with VoiceOver/TalkBack** — All new screens must be screen reader accessible
4. **Respect platform conventions** — Use native pickers, transitions, and patterns

### 10.2 Component Reuse

- Before creating a new component, check if a shared component exists (Section 5)
- If creating a new shared component, add it to this DRD and export from `/components`
- Keep components small and focused (single responsibility)

### 10.3 Performance

- Minimize blur surfaces (BlurView is expensive on iOS)
- Use FlatList for long lists (not ScrollView)
- Memoize expensive calculations (React.useMemo)
- Lazy load images with placeholder

### 10.4 Analytics Events

Track all user interactions for product insights:
- `screen_view` — Tab switches, screen navigation
- `button_press` — All CTA clicks
- `form_submit` — Form submissions (log transaction, update balance, etc.)
- `auto_capture_confirmed` / `auto_capture_dismissed` — Auto-capture actions
- `recommendation_used` — User taps recommended card
- `cap_alert_shown` — Cap approaching 80% alert displayed

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-21 | Initial master DRD created. Consolidated global design principles from DRD_AUTO_CAPTURE and DRD_MILES_PORTFOLIO. Defined complete design token system, component library, and interaction patterns. Added references to feature-specific DRDs. |

---

**End of Document**
