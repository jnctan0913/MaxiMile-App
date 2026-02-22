# CRITICAL FIXES REQUIRED - DO NOT PUSH UNTIL RESOLVED

**Status:** 🔴 BLOCKING ISSUES FOUND
**Date:** 2026-02-22
**Estimated Fix Time:** 4-6 hours

---

## TL;DR

**73 TypeScript errors** prevent the app from building. Fix these before pushing to GitHub.

---

## Fix #1: Install Missing Dependency (5 minutes)

**Error:**
```
app/notification-settings.tsx(28,28): error TS2307: Cannot find module '@react-native-community/datetimepicker'
```

**Fix:**
```bash
cd maximile-app
npm install @react-native-community/datetimepicker
npm install --save-dev @types/react-native-community__datetimepicker
```

**Verify:**
```bash
npm list @react-native-community/datetimepicker
```

---

## Fix #2: Typography Property Access Errors (30 minutes)

**Error Pattern:**
```
Property 'fontSize' does not exist on type Typography
```

**Root Cause:** Typography is a nested object structure, not flat.

**Wrong:**
```typescript
fontSize: Typography.fontSize  // ❌ WRONG
fontWeight: Typography.fontWeight  // ❌ WRONG
```

**Correct:**
```typescript
fontSize: Typography.body.fontSize  // ✅ CORRECT
fontWeight: Typography.body.fontWeight  // ✅ CORRECT
```

**Files to Fix:**
1. `app/notification-settings.tsx` - 18 occurrences
2. `app/notification-history.tsx` - 12 occurrences
3. `app/onboarding-notification-primer.tsx` - 4 occurrences

**Search/Replace Script:**
```bash
# Find all Typography errors
grep -n "Typography\\." app/notification-settings.tsx app/notification-history.tsx app/onboarding-notification-primer.tsx | grep -v "Typography\\.[a-z]*\\."

# Manual fix required - each needs context to determine body/heading/caption
```

**Manual Fix Example for notification-settings.tsx:**

**Line 574** (Section Header):
```typescript
// Before:
fontSize: Typography.fontSize,

// After (use subheading for section headers):
fontSize: Typography.subheading.fontSize,
fontWeight: Typography.subheading.fontWeight,
```

**Line 590-591** (Setting Label):
```typescript
// Before:
fontSize: Typography.fontSize,
fontWeight: Typography.fontWeight,

// After (use body for labels):
fontSize: Typography.body.fontSize,
fontWeight: Typography.body.fontWeight,
```

**Repeat for all occurrences in each file.**

---

## Fix #3: Missing Color Properties (15 minutes)

**Error:**
```
Property 'gold' does not exist on type Colors
Property 'goldDark' does not exist on type Colors
Property 'text' does not exist on type Colors
```

**File:** `app/onboarding-notification-primer.tsx`

**Fix:**

**Lines 113, 171, 215:**
```typescript
// Before:
Colors.gold, Colors.goldDark

// After:
Colors.brandGold, Colors.brandGold  // Use brandGold for both
// OR add goldDark to theme.ts: goldDark: '#A68B47'
```

**Line 288:**
```typescript
// Before:
color: Colors.text

// After:
color: Colors.textPrimary
```

**Line 283:**
```typescript
// Before:
...Shadows.medium

// After:
...Shadows.md  // Use existing shadow constant
```

---

## Fix #4: Missing Analytics Events (10 minutes)

**Error:**
```
Argument of type '"add_program_sheet_opened"' is not assignable to parameter of type 'AnalyticsEvent'
```

**File:** `lib/analytics.ts`

**Fix:** Add missing events to the AnalyticsEvent union type (around line 43):

```typescript
export type AnalyticsEvent =
  | 'card_added'
  | 'card_removed'
  // ... existing events ...
  | 'test_notification_sent'
  // ADD THESE:
  | 'add_program_sheet_opened'
  | 'program_added_manually'
  | 'onboarding_auto_capture_cta_tapped'
  | 'onboarding_auto_capture_skipped'
```

---

## Fix #5: Demo Controls Type Errors (30 minutes)

**Error:**
```
Argument of type '{ type: "warning"; ... }' is not assignable to parameter of type '{ type: "critical"; ... }'
```

**File:** `app/demo-controls.tsx`

**Root Cause:** `showDemoNotification` function signature is too restrictive.

**Fix Option A (Preferred): Update function signature in DemoNotificationContext**

**File:** `contexts/DemoNotificationContext.tsx`

```typescript
// Before (line 18-25):
interface NotificationConfig {
  id: string;
  type: DemoNotificationPreviewProps['type'];  // This is the issue
  title: string;
  body: string;
  onTap?: () => void;
  duration?: number;
}

// After:
interface NotificationConfig {
  id: string;
  type: 'critical' | 'warning' | 'positive' | 'multiple' | 'cap_approaching';  // Explicit union
  title: string;
  body: string;
  onTap?: () => void;
  duration?: number;
}
```

**Fix Option B: Update demo-controls.tsx calls**

If you can't change the context, update each call:

```typescript
// Lines 157, 172, 187, 202, 217 - explicitly cast the type:
showDemoNotification({
  type: notification.type as any,  // Temporary workaround
  title: notification.title,
  body: notification.body,
});
```

---

## Fix #6: Event Handler Type Errors (5 minutes)

**Error:**
```
Parameter 'event' implicitly has an 'any' type
Parameter 'date' implicitly has an 'any' type
```

**File:** `app/notification-settings.tsx`

**Lines 440, 452:**

```typescript
// Before:
const handleStartTimeChange = (event, date) => {

// After:
const handleStartTimeChange = (event: any, date?: Date) => {
```

---

## Verification Checklist

After applying all fixes, run these commands:

```bash
# 1. TypeScript compilation
cd maximile-app
npx tsc --noEmit

# Expected: 0 errors (down from 73)

# 2. Build test (iOS)
npx expo run:ios --configuration Debug

# 3. Build test (Android)
npx expo run:android --variant debug

# 4. Start dev server
npx expo start

# 5. Open app on device
# Press 'i' for iOS or 'a' for Android
# Navigate to notification settings screen
# Verify no crashes
```

---

## Testing After Fixes

### Smoke Test (10 minutes)

1. **Build & Launch:**
   - [ ] App builds without errors
   - [ ] App launches successfully
   - [ ] No immediate crashes

2. **Navigate to New Screens:**
   - [ ] Open Notification Settings (`/notification-settings`)
   - [ ] Toggle a switch (verify no crash)
   - [ ] Open Notification History (`/notification-history`)
   - [ ] View onboarding notification primer
   - [ ] Open Demo Controls (if demo mode enabled)

3. **Trigger Demo Notification:**
   - [ ] Set `EXPO_PUBLIC_DEMO_MODE=true`
   - [ ] Open demo controls
   - [ ] Tap "Critical Rate Change"
   - [ ] Verify notification appears
   - [ ] Dismiss notification

4. **Check Console:**
   - [ ] No TypeScript errors in console
   - [ ] No runtime errors
   - [ ] No warning about missing imports

---

## Common Pitfalls

### ❌ Don't Do This:
```typescript
// Using 'any' everywhere to silence errors
const foo: any = Typography.fontSize;  // BAD
```

### ✅ Do This:
```typescript
// Fix the root cause
const foo = Typography.body.fontSize;  // GOOD
```

---

### ❌ Don't Do This:
```typescript
// @ts-ignore to skip errors
// @ts-ignore
fontSize: Typography.fontSize;  // BAD
```

### ✅ Do This:
```typescript
// Understand and fix the error
fontSize: Typography.body.fontSize;  // GOOD
```

---

## If You Get Stuck

### Typography Errors Not Resolving?

**Check theme.ts structure:**
```bash
grep -A 20 "export const Typography" constants/theme.ts
```

**Verify it looks like this:**
```typescript
export const Typography = {
  heading: { fontSize: 28, fontWeight: '700', ... },
  subheading: { fontSize: 20, fontWeight: '600', ... },
  body: { fontSize: 16, fontWeight: '400', ... },
  bodyBold: { fontSize: 16, fontWeight: '600', ... },
  caption: { fontSize: 13, fontWeight: '400', ... },
  captionBold: { fontSize: 13, fontWeight: '600', ... },
  label: { fontSize: 14, fontWeight: '500', ... },
} as const;
```

If structure is different, update your fixes accordingly.

---

### Colors Errors Not Resolving?

**Check available colors:**
```bash
grep "^  [a-zA-Z]*:" constants/theme.ts | head -30
```

**Use existing colors:**
- `Colors.brandGold` ✅ (exists)
- `Colors.gold` ❌ (doesn't exist)
- `Colors.textPrimary` ✅ (exists)
- `Colors.text` ❌ (doesn't exist)

---

## Post-Fix Checklist

- [ ] All TypeScript errors resolved (0 errors)
- [ ] App builds successfully on iOS
- [ ] App builds successfully on Android
- [ ] All new screens open without crashing
- [ ] Demo notifications work (if demo mode)
- [ ] No console errors or warnings
- [ ] Git commit with message: "fix: resolve TypeScript errors in push notification implementation"
- [ ] Ready to push to GitHub

---

## Time Estimates by Fix

| Fix | Estimated Time | Complexity |
|-----|----------------|------------|
| #1 Install dependency | 5 min | Easy |
| #2 Typography errors | 30 min | Medium |
| #3 Missing colors | 15 min | Easy |
| #4 Analytics events | 10 min | Easy |
| #5 Demo controls types | 30 min | Medium |
| #6 Event handler types | 5 min | Easy |
| **Testing & Verification** | **60 min** | - |
| **TOTAL** | **~2.5 hours** | - |

---

**REMEMBER:** DO NOT push to GitHub until `npx tsc --noEmit` returns 0 errors!
