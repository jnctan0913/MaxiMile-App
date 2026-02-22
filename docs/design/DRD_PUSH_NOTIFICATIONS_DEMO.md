# Design Requirements Document: Push Notification Preview (Demo Mode Only)

**Version**: 1.0
**Date**: 2026-02-22
**Status**: Draft for Review
**Designer**: UI/UX Designer
**Related Documents**: PRD_DEMO_MODE.md, PUSH_NOTIFICATIONS_EVALUATION.md

---

## Executive Summary

This document specifies the design for a **demo mode only** notification preview system that simulates native iOS/Android push notifications within the app. This component is strictly for demos and presentations to showcase what production push notifications will look like, without requiring real push notification infrastructure during demos.

**Key Principle**: This is ONLY for demo mode (`EXPO_PUBLIC_DEMO_MODE=true`). Production push notifications use the native OS notification system.

---

## 1. Problem Statement

### Current Situation
MaxiMile currently uses in-app banners (`RateChangeBanner`, `RateUpdatedBadge`) to display rate change alerts. While functional, these components:
- Don't look like real push notifications
- Aren't suitable for showcasing the push notification experience
- Don't demonstrate the "proactive alert" value proposition effectively

### User Need
**Demo presenters** need a professional, realistic way to showcase what push notifications look like during client presentations, investor demos, and stakeholder reviews **without requiring real push notification infrastructure**.

### Solution Scope
Design a native-looking notification preview component that:
1. Only appears in demo mode
2. Looks identical to iOS/Android native push notifications
3. Can be triggered on-demand for demos
4. Demonstrates notification content beautifully
5. Supports different notification types (critical, warning, info)

---

## 2. Design Specifications

### 2.1 Component Overview

**Component Name**: `DemoNotificationPreview`

**Purpose**: Simulate native iOS/Android push notification appearance within the app for demo presentations.

**Scope**: Demo mode only (`EXPO_PUBLIC_DEMO_MODE=true`)

**File Location**: `/maximile-app/components/DemoNotificationPreview.tsx`

---

### 2.2 Visual Design

#### 2.2.1 iOS Notification Style (Primary Reference)

The component mimics iOS notification banners that slide down from the top of the screen.

**Layout Structure**:
```
┌─────────────────────────────────────────────────┐
│  🔶 MaxiMile                          now       │  ← Header (app icon + name + time)
│  ⚠️ Your Amex KrisFlyer: Major Change          │  ← Title (bold, severity icon)
│  Transfer rate to KrisFlyer dropped 33%.       │  ← Body (2 lines max)
│  Tap to see better alternatives.               │
└─────────────────────────────────────────────────┘
```

**Dimensions**:
- Width: Screen width - 16px margins (8px each side)
- Height: Dynamic (min 88px, max 120px depending on text)
- Border Radius: 14px (iOS style)
- Shadow: iOS-style drop shadow (blur 20px, opacity 0.3)

**Colors**:
- Background: `rgba(255, 255, 255, 0.95)` with backdrop blur
- Header Text: `#8E8E93` (iOS gray)
- Title: `#000000` (bold, 15px)
- Body: `#3C3C43` (regular, 14px)
- Border: 1px `rgba(0, 0, 0, 0.08)`

**Typography**:
- Header: SF Pro Display, 13px, Regular, letterspacing -0.08
- Title: SF Pro Display, 15px, Semibold, letterspacing -0.24
- Body: SF Pro Text, 14px, Regular, letterspacing -0.15

**App Icon**:
- Size: 20x20px
- Corner radius: 4.5px (iOS app icon style)
- Source: MaxiMile app icon (brand gold gradient)

---

#### 2.2.2 Android Notification Style (Alternative)

For Android demos, a slightly different style can be used (though iOS style works universally).

**Layout Structure**:
```
┌─────────────────────────────────────────────────┐
│ 🔶 MaxiMile • now                               │  ← Header (app icon + name + time)
│ ⚠️ Your Amex KrisFlyer: Major Change           │  ← Title (bold)
│ Transfer rate to KrisFlyer dropped 33%.        │  ← Body (expandable)
│ Tap to see better alternatives.                │
└─────────────────────────────────────────────────┘
```

**Key Differences from iOS**:
- Flatter shadow (elevation 4dp)
- Border radius: 8px (Android material style)
- Slightly different spacing (16dp padding vs 12pt)
- Time shown as "now" vs "just now"

**Recommendation**: Use iOS style for all demos (universally recognized, more polished).

---

### 2.3 Animation Behavior

#### 2.3.1 Entrance Animation

**Trigger**: Component mounts or demo notification triggered

**Animation Sequence**:
1. **Slide Down** (0-400ms)
   - Start position: `translateY(-120)` (above screen)
   - End position: `translateY(0)` (visible at top)
   - Easing: `spring` with tension 150, friction 15
   - Accompanies: Subtle scale from 0.95 to 1.0

2. **Bounce In** (400-600ms)
   - Slight overshoot at end of slide
   - Natural spring physics (iOS native feel)

3. **Pause** (600ms-4600ms)
   - Notification stays visible for 4 seconds
   - User can interact during this time

**Visual Feedback**:
- Shadow fades in from 0 to full opacity
- Backdrop blur activates (iOS glassmorphism)

**Code Reference**:
```typescript
// Entrance animation (iOS spring)
Animated.spring(slideAnim, {
  toValue: 0,
  tension: 150,
  friction: 15,
  useNativeDriver: true,
}).start();
```

---

#### 2.3.2 Exit Animation

**Triggers**:
- Auto-dismiss after 4 seconds
- User taps notification (navigates + dismisses)
- User swipes up to dismiss

**Animation Sequence**:
1. **Slide Up** (0-300ms)
   - Start: `translateY(0)`
   - End: `translateY(-120)` (above screen)
   - Easing: `easeOut` curve
   - Accompanies: Scale from 1.0 to 0.95

2. **Fade Out** (0-300ms)
   - Opacity: 1.0 → 0.0
   - Shadow fades simultaneously

**Swipe Dismiss**:
- User can swipe up on notification
- Follows finger (gesture-driven animation)
- Velocity threshold: 800px/s to trigger dismiss

---

#### 2.3.3 Timing Specifications

| Event | Timing | Behavior |
|-------|--------|----------|
| Notification appears | 0ms | Slide down animation starts |
| Fully visible | 600ms | Animation complete, notification readable |
| Auto-dismiss starts | 4600ms | Slide up animation starts |
| Fully dismissed | 5000ms | Component unmounts |

**User Interaction Timing**:
- Tap during visible period (600ms-4600ms) → Navigate to relevant screen
- Swipe up anytime → Immediate dismiss
- No interaction → Auto-dismiss at 4600ms

---

### 2.4 Notification Content Types

The component supports different notification types matching the production push notification system (see PUSH_NOTIFICATIONS_EVALUATION.md).

#### 2.4.1 Critical Rate Change

**Use Case**: Major devaluations, significant earn rate cuts

**Visual Markers**:
- Severity Icon: ⚠️ (warning triangle emoji, red/orange)
- Title Text Color: Default black (urgency conveyed by icon + content)

**Example Content**:
```
Header: 🔶 MaxiMile • now
Title:  ⚠️ Your Amex KrisFlyer: Major Change
Body:   Transfer rate to KrisFlyer dropped 33%.
        Tap to see better alternatives.
```

**Tap Behavior**: Navigate to card detail screen with rate change expanded

---

#### 2.4.2 Warning Rate Change

**Use Case**: Cap reductions, moderate earn rate cuts

**Visual Markers**:
- Severity Icon: ⚠️ (warning triangle, amber)
- Slightly less urgent tone in copy

**Example Content**:
```
Header: 🔶 MaxiMile • now
Title:  ⚠️ DBS Woman's World: Cap Reduced
Body:   Bonus cap cut from $2,000 to $1,000/month
        starting Aug 1. Review your strategy.
```

**Tap Behavior**: Navigate to card detail screen

---

#### 2.4.3 Positive Rate Change

**Use Case**: Cap increases, fee reductions, beneficial changes

**Visual Markers**:
- Severity Icon: ✨ (sparkles emoji, positive vibe)
- Encouraging tone

**Example Content**:
```
Header: 🔶 MaxiMile • now
Title:  ✨ HSBC Revolution: Cap Increased
Body:   Great news! Monthly bonus cap boosted to
        $1,500. You can now earn 4 mpd on 50% more.
```

**Tap Behavior**: Navigate to card detail screen

---

#### 2.4.4 Multiple Rate Changes

**Use Case**: Batched summary when 3+ changes occur within 7 days

**Visual Markers**:
- Severity Icon: 📢 (megaphone emoji)
- Count-based title

**Example Content**:
```
Header: 🔶 MaxiMile • now
Title:  📢 3 Rate Changes This Week
Body:   DBS, OCBC, and Citi changed earn rates.
        Review changes to keep maximizing miles.
```

**Tap Behavior**: Navigate to rate changes list screen

---

#### 2.4.5 Cap Approaching Alert (Future F6)

**Use Case**: User reaches 80% of monthly bonus cap

**Visual Markers**:
- Severity Icon: 📊 (chart emoji)
- Data-focused content

**Example Content**:
```
Header: 🔶 MaxiMile • now
Title:  📊 DBS WWC Cap Alert
Body:   You've used $800 of your $1,000 bonus cap.
        Switch cards after $1,000 to keep earning.
```

**Tap Behavior**: Navigate to cap status screen

---

### 2.5 Component Props & API

```typescript
export interface DemoNotificationPreviewProps {
  /**
   * Notification type determines icon, styling, and content
   */
  type: 'critical' | 'warning' | 'positive' | 'multiple' | 'cap_approaching';

  /**
   * Notification title (bold text)
   * Max 60 characters recommended
   */
  title: string;

  /**
   * Notification body (regular text)
   * Max 2 lines (~100 characters)
   */
  body: string;

  /**
   * Card name or ID for navigation context
   * Optional - used when user taps notification
   */
  cardId?: string;

  /**
   * Screen to navigate to when tapped
   * Default: 'CardDetail'
   */
  targetScreen?: 'CardDetail' | 'RateChangesList' | 'CapStatus';

  /**
   * Auto-dismiss duration in milliseconds
   * Default: 4000ms (4 seconds)
   */
  duration?: number;

  /**
   * Callback when notification is tapped
   */
  onTap?: () => void;

  /**
   * Callback when notification is dismissed (auto or manual)
   */
  onDismiss?: () => void;

  /**
   * Platform style to mimic
   * Default: 'ios' (recommended for all demos)
   */
  platform?: 'ios' | 'android';

  /**
   * Disable animations (for accessibility or testing)
   * Default: false
   */
  disableAnimations?: boolean;
}
```

---

### 2.6 Usage Examples

#### Example 1: Trigger on Test Button Tap

```typescript
// In onboarding-auto-capture.tsx
const [showDemoNotification, setShowDemoNotification] = useState(false);

const handleTestSetup = () => {
  if (isDemoMode()) {
    // Show demo notification preview
    setShowDemoNotification(true);
  } else {
    // Production: validate URL scheme only
    Linking.openURL('maximile://log');
  }
};

return (
  <>
    <Button onPress={handleTestSetup}>Test Setup</Button>

    {showDemoNotification && (
      <DemoNotificationPreview
        type="critical"
        title="⚠️ Your Amex KrisFlyer: Major Change"
        body="Transfer rate to KrisFlyer dropped 33%. Tap to see better alternatives."
        cardId="amex-krisflyer"
        onTap={() => {
          navigation.navigate('CardDetail', { cardId: 'amex-krisflyer' });
          setShowDemoNotification(false);
        }}
        onDismiss={() => setShowDemoNotification(false)}
      />
    )}
  </>
);
```

---

#### Example 2: Auto-Trigger on First Miles Tab Visit (Demo Mode)

```typescript
// In app/(tabs)/miles.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_NOTIF_KEY = 'demo_notification_shown';

useEffect(() => {
  async function checkAndShowDemoNotif() {
    if (!isDemoMode()) return;

    // Check if we've already shown the demo notification
    const hasShown = await AsyncStorage.getItem(DEMO_NOTIF_KEY);

    if (!hasShown) {
      // Show notification 1 second after Miles tab loads
      setTimeout(() => {
        setShowDemoNotification({
          type: 'critical',
          title: '⚠️ Your Amex KrisFlyer card',
          body: 'Transfer rate dropped 33%. Tap to see alternatives.',
          cardId: 'demo-card-id',
        });

        // Mark as shown so it doesn't trigger again
        AsyncStorage.setItem(DEMO_NOTIF_KEY, 'true');
      }, 1000);
    }
  }

  checkAndShowDemoNotif();
}, []);
```

---

#### Example 3: Demo Notification Queue (Multiple Notifications)

```typescript
// Demo helper for showcasing multiple notification types
const DEMO_NOTIFICATIONS = [
  {
    type: 'critical',
    title: '⚠️ Your Amex KrisFlyer: Major Change',
    body: 'Transfer rate dropped 33%. See alternatives.',
    delay: 0,
  },
  {
    type: 'warning',
    title: '⚠️ DBS Woman\'s World: Cap Reduced',
    body: 'Bonus cap cut to $1,000/month. Review strategy.',
    delay: 6000, // 6 seconds after first
  },
  {
    type: 'positive',
    title: '✨ HSBC Revolution: Cap Increased',
    body: 'Monthly cap boosted to $1,500. Earn more!',
    delay: 12000, // 12 seconds after first
  },
];

function playDemoNotificationSequence() {
  DEMO_NOTIFICATIONS.forEach((notif) => {
    setTimeout(() => {
      setCurrentNotification(notif);
    }, notif.delay);
  });
}
```

---

### 2.7 Integration with Demo Mode

#### 2.7.1 Demo Mode Indicator Context

The notification preview integrates with the existing `DemoModeIndicator` component to help presenters know they're in demo mode.

**Relationship**:
- `DemoModeIndicator`: Persistent badge in navigation header
- `DemoNotificationPreview`: Temporary notification overlay

**Visual Hierarchy**:
```
┌─────────────────────────────────────────┐
│  Demo Notification Preview              │  ← z-index 1000 (top layer)
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  [DEMO] Badge (header)                  │  ← z-index 100 (header layer)
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  Main App Content                       │  ← z-index 1 (base layer)
└─────────────────────────────────────────┘
```

---

#### 2.7.2 Demo Build Trigger Mechanism

**Option A: Manual Trigger Button (Recommended)**

Add a hidden trigger mechanism for presenters:

1. **Settings Tab → Demo Controls** (only visible in demo builds)
   ```
   ┌─────────────────────────────────────────┐
   │  Demo Controls                          │
   │  ────────────────────────────────────   │
   │  Preview Notifications                  │
   │    🔔 Critical Rate Change        [▶]  │  ← Tap to preview
   │    🔔 Warning Rate Change         [▶]  │
   │    🔔 Positive Rate Change        [▶]  │
   │    🔔 Multiple Changes            [▶]  │
   │    🔔 Cap Approaching             [▶]  │
   └─────────────────────────────────────────┘
   ```

2. **Dev Menu Integration**
   - Long-press on `DemoModeIndicator` badge → Opens demo controls modal
   - Select notification type to preview
   - Presenter can trigger on-demand during demos

---

**Option B: Automatic Trigger on Deep Link** (For Auto-Capture Demo)

When presenter triggers the auto-capture shortcut in demo mode:

1. Shortcut runs: `maximile://log`
2. Deep link handler detects demo mode
3. Shows `DemoNotificationPreview` simulating "Transaction captured" alert
4. After 4 seconds (or user tap), shows auto-capture flow screen

**Flow**:
```
User taps shortcut
     ↓
App opens via deep link
     ↓
Demo mode detected
     ↓
DemoNotificationPreview appears
     ↓
Auto-dismiss after 4s OR user taps
     ↓
Navigate to auto-capture flow screen
```

---

**Option C: Hybrid Approach (Best for Comprehensive Demos)**

Combine both:
- **Auto-trigger** for auto-capture demo flow (realistic simulation)
- **Manual trigger** in Settings for showcasing push notification variety

---

### 2.8 Accessibility Considerations

#### 2.8.1 Screen Reader Support

**Accessibility Labels**:
```typescript
<View
  accessible={true}
  accessibilityRole="alert"
  accessibilityLabel={`Notification: ${title}. ${body}`}
  accessibilityLiveRegion="polite"
>
  {/* Notification content */}
</View>
```

**Announcement Behavior**:
- When notification appears, screen reader announces: "Notification: [title]. [body]"
- User can swipe to dismiss or double-tap to navigate

---

#### 2.8.2 Reduced Motion

Respect user's reduced motion preference:

```typescript
const reducedMotion = useReducedMotion();

if (reducedMotion) {
  // No slide animation - just fade in/out
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 200,
    useNativeDriver: true,
  }).start();
} else {
  // Full slide + spring animation
  Animated.spring(slideAnim, {
    toValue: 0,
    tension: 150,
    friction: 15,
    useNativeDriver: true,
  }).start();
}
```

---

#### 2.8.3 High Contrast Mode

Support high contrast accessibility settings:

**High Contrast Colors**:
- Background: `#FFFFFF` (pure white, no blur)
- Border: `#000000` (pure black, 2px)
- Text: `#000000` (maximum contrast)
- Icon: Platform-standard high contrast icons

**Implementation**:
```typescript
const isHighContrast = useColorScheme() === 'high-contrast';

const backgroundColor = isHighContrast
  ? '#FFFFFF'
  : 'rgba(255, 255, 255, 0.95)';

const borderColor = isHighContrast
  ? '#000000'
  : 'rgba(0, 0, 0, 0.08)';
```

---

### 2.9 Platform Considerations

#### 2.9.1 iOS Safe Area

Notification must appear below the status bar and notch/Dynamic Island.

**Safe Area Handling**:
```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function DemoNotificationPreview() {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      style={[
        styles.notification,
        {
          top: insets.top + 8, // 8px below status bar
          marginHorizontal: 8,
        },
      ]}
    >
      {/* Notification content */}
    </Animated.View>
  );
}
```

**Notch/Dynamic Island Clearance**:
- iPhone 14 Pro+: Top inset ~59px
- Standard iPhone: Top inset ~44px
- Notification appears 8px below status bar (safe)

---

#### 2.9.2 Android Status Bar

**Behavior**:
- Notification appears below Android status bar
- Respects system navigation gestures (edge swipes)
- Uses Material Design elevation (4dp shadow)

**Safe Area**:
```typescript
// Android safe area (status bar height)
const statusBarHeight = Platform.OS === 'android'
  ? StatusBar.currentHeight || 24
  : insets.top;

const notificationTop = statusBarHeight + 8;
```

---

#### 2.9.3 Landscape Orientation

**Challenge**: Notifications appear at top in portrait, but might overlap content in landscape.

**Solution**: Use smaller notification height in landscape

```typescript
const isLandscape = useOrientation() === 'landscape';

const notificationHeight = isLandscape ? 72 : 88;
const titleFontSize = isLandscape ? 14 : 15;
const bodyLines = isLandscape ? 1 : 2; // Single line in landscape
```

---

### 2.10 Edge Cases & Error Handling

#### 2.10.1 Overlapping Notifications

**Problem**: What if two notifications trigger simultaneously?

**Solution**: Queue system
```typescript
const [notificationQueue, setNotificationQueue] = useState<Notification[]>([]);
const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

// When new notification arrives
function showNotification(notification: Notification) {
  if (currentNotification) {
    // Queue it
    setNotificationQueue([...notificationQueue, notification]);
  } else {
    // Show immediately
    setCurrentNotification(notification);
  }
}

// When notification dismisses
function handleDismiss() {
  setCurrentNotification(null);

  // Show next in queue after 1 second delay
  setTimeout(() => {
    if (notificationQueue.length > 0) {
      const next = notificationQueue[0];
      setNotificationQueue(notificationQueue.slice(1));
      setCurrentNotification(next);
    }
  }, 1000);
}
```

---

#### 2.10.2 Long Text Truncation

**Problem**: Title or body text exceeds 2 lines

**Solution**: Truncate with ellipsis
```typescript
<Text
  style={styles.title}
  numberOfLines={1}
  ellipsizeMode="tail"
>
  {title}
</Text>

<Text
  style={styles.body}
  numberOfLines={2}
  ellipsizeMode="tail"
>
  {body}
</Text>
```

**Character Limits**:
- Title: Max 60 characters (1 line)
- Body: Max 100 characters (2 lines)

---

#### 2.10.3 Production Mode Safety

**Critical**: Ensure this component NEVER appears in production builds.

**Safety Guard**:
```typescript
export default function DemoNotificationPreview(props: DemoNotificationPreviewProps) {
  // Safety check: Never render in production
  if (!isDemoMode()) {
    console.warn('[DemoNotificationPreview] Attempted to render in production mode - blocked');
    return null;
  }

  // Render notification
  return <NotificationContent {...props} />;
}
```

**Build-Time Check**:
```typescript
// In package.json build script
if (process.env.EXPO_PUBLIC_DEMO_MODE !== 'true') {
  // Strip DemoNotificationPreview from production bundle
  // (Metro bundler tree-shaking)
}
```

---

## 3. Demo Notification Content Library

Pre-defined notification content for easy demo triggering.

### 3.1 Rate Change Notifications

```typescript
export const DEMO_NOTIFICATIONS = {
  rateChange: {
    critical: {
      title: '⚠️ Your Amex KrisFlyer: Major Change',
      body: 'Transfer rate to KrisFlyer dropped 33%. Tap to see better alternatives.',
      cardId: 'amex-krisflyer',
      targetScreen: 'CardDetail',
    },
    warning: {
      title: '⚠️ DBS Woman\'s World: Cap Reduced',
      body: 'Bonus cap cut from $2,000 to $1,000/month starting Aug 1. Review your strategy.',
      cardId: 'dbs-womans-world',
      targetScreen: 'CardDetail',
    },
    positive: {
      title: '✨ HSBC Revolution: Cap Increased',
      body: 'Great news! Monthly bonus cap boosted to $1,500. You can now earn 4 mpd on 50% more.',
      cardId: 'hsbc-revolution',
      targetScreen: 'CardDetail',
    },
    multiple: {
      title: '📢 3 Rate Changes This Week',
      body: 'DBS, OCBC, and Citi changed earn rates. Review changes to keep maximizing miles.',
      targetScreen: 'RateChangesList',
    },
  },

  capApproaching: {
    title: '📊 DBS WWC Cap Alert',
    body: 'You\'ve used $800 of your $1,000 bonus cap. Switch cards after $1,000 to keep earning.',
    cardId: 'dbs-womans-world',
    targetScreen: 'CapStatus',
  },

  autoCapture: {
    title: '🔔 Transaction Captured',
    body: 'Starbucks $5.47 logged. Review and confirm to earn miles.',
    targetScreen: 'AutoCaptureReview',
  },
};
```

---

### 3.2 Demo Sequence for Presentations

**Scenario 1: Full Feature Showcase** (5 notifications, 30 seconds total)

```typescript
const FEATURE_SHOWCASE_SEQUENCE = [
  { ...DEMO_NOTIFICATIONS.rateChange.critical, delay: 0 },
  { ...DEMO_NOTIFICATIONS.capApproaching, delay: 6000 },
  { ...DEMO_NOTIFICATIONS.rateChange.warning, delay: 12000 },
  { ...DEMO_NOTIFICATIONS.autoCapture, delay: 18000 },
  { ...DEMO_NOTIFICATIONS.rateChange.positive, delay: 24000 },
];
```

**Scenario 2: Auto-Capture Demo** (1 notification)

```typescript
const AUTO_CAPTURE_DEMO = [
  { ...DEMO_NOTIFICATIONS.autoCapture, delay: 0 },
];
```

**Scenario 3: Rate Change Demo** (3 notifications, severity progression)

```typescript
const RATE_CHANGE_DEMO = [
  { ...DEMO_NOTIFICATIONS.rateChange.critical, delay: 0 },
  { ...DEMO_NOTIFICATIONS.rateChange.warning, delay: 6000 },
  { ...DEMO_NOTIFICATIONS.rateChange.positive, delay: 12000 },
];
```

---

## 4. Implementation Checklist

### 4.1 Component Development

- [ ] Create `DemoNotificationPreview.tsx` component
- [ ] Implement iOS notification styling (primary)
- [ ] Implement Android notification styling (optional)
- [ ] Add slide-down entrance animation
- [ ] Add slide-up exit animation
- [ ] Add swipe-to-dismiss gesture
- [ ] Implement auto-dismiss timer (4 seconds default)
- [ ] Add tap navigation handler
- [ ] Add notification queue system
- [ ] Implement accessibility labels
- [ ] Add reduced motion support
- [ ] Add high contrast mode support
- [ ] Handle safe area insets (iOS notch/Dynamic Island)
- [ ] Add production mode safety guard

### 4.2 Integration

- [ ] Add demo controls to Settings tab (demo builds only)
- [ ] Integrate with auto-capture deep link handler
- [ ] Add demo notification content library
- [ ] Create demo sequence presets
- [ ] Add dev menu trigger (long-press demo badge)
- [ ] Test on iOS (iPhone 14 Pro, iPhone SE)
- [ ] Test on Android (Pixel 7, Samsung S23)
- [ ] Test landscape orientation
- [ ] Test with screen reader (VoiceOver/TalkBack)
- [ ] Test with reduced motion enabled

### 4.3 Documentation

- [ ] Document usage examples in code comments
- [ ] Add Storybook stories (if using Storybook)
- [ ] Create presenter guide (how to trigger notifications during demos)
- [ ] Add to demo mode onboarding guide

---

## 5. Future Enhancements (Out of Scope for v1.0)

### 5.1 Interactive Actions (iOS Rich Notifications)

iOS supports notification action buttons. Could add in future:

```
┌─────────────────────────────────────────┐
│  🔶 MaxiMile • now                      │
│  ⚠️ Your Amex KrisFlyer: Major Change  │
│  Transfer rate dropped 33%.            │
│  [View Card]  [Dismiss]                │  ← Action buttons
└─────────────────────────────────────────┘
```

**Scope**: v1.1+ (requires more complex interaction model)

---

### 5.2 Sound/Haptic Feedback

Real push notifications have sound/haptics. Could simulate:

```typescript
// When notification appears
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
```

**Scope**: v1.1+ (nice-to-have, not critical for visual demos)

---

### 5.3 Expanded Notification (iOS Long Press)

iOS allows expanding notifications for more content:

```
┌─────────────────────────────────────────┐
│  🔶 MaxiMile • 2 min ago                │
│  ⚠️ Your Amex KrisFlyer: Major Change  │
│  Transfer rate to KrisFlyer dropped    │
│  from 1:1 to 1.5:1 (33% devaluation).  │
│                                         │
│  Impact on your earning:                │
│  • Old: 1.2 mpd effective               │
│  • New: 0.8 mpd effective               │
│                                         │
│  Recommended alternatives:              │
│  • Citi PremierMiles (1.2 mpd)         │
│  • DBS Altitude (1.3 mpd travel)       │
│                                         │
│  [View All Cards]  [Dismiss]            │
└─────────────────────────────────────────┘
```

**Scope**: v2.0+ (complex, requires significant design work)

---

## 6. Success Metrics

### 6.1 Demo Effectiveness

**Qualitative**:
- Presenters report component looks "realistic" (target: 9/10 realism score)
- Demo audiences understand push notification value prop immediately
- No confusion between demo preview vs real notification

**Quantitative** (via presenter feedback survey):
- 100% of presenters can trigger demo notifications successfully
- <5% of demo audiences ask "Is that real?" (indicator of authenticity)
- 0 production builds with demo notification component visible

---

### 6.2 Technical Performance

**Performance Targets**:
- Animation frame rate: 60fps (no jank)
- Render time: <16ms (single frame)
- Memory overhead: <1MB
- No ANR (Application Not Responding) on Android

**Measurement**:
```typescript
// Performance monitoring (dev only)
const startTime = performance.now();
// ... component renders
const endTime = performance.now();
console.log(`[DemoNotification] Render time: ${endTime - startTime}ms`);
```

---

## 7. Appendix

### 7.1 iOS Notification Anatomy Reference

Based on iOS Human Interface Guidelines (HIG):

**Spacing**:
- Top margin: 8pt (from safe area)
- Left/right margins: 8pt
- Internal padding: 12pt all sides
- Icon-to-text spacing: 10pt
- Title-to-body spacing: 4pt

**Colors (Light Mode)**:
- Background: `rgba(255, 255, 255, 0.95)` + backdrop blur
- Border: `rgba(0, 0, 0, 0.08)`
- Header text: `#8E8E93` (iOS secondary label)
- Title text: `#000000` (iOS label)
- Body text: `#3C3C43` (iOS secondary label)

**Shadows**:
- Blur: 20pt
- Offset: (0, 4)
- Color: `rgba(0, 0, 0, 0.3)`

---

### 7.2 Notification Copy Best Practices

**Guiding Principles**:
1. **Clarity**: User understands in <3 seconds
2. **Urgency**: Severity matches content (critical = urgent, positive = celebratory)
3. **Personalization**: Mention card by name
4. **Actionability**: Clear CTA ("Tap to...", "Review...", "See...")
5. **Brevity**: Title <60 chars, body <100 chars

**Good Examples**:
- ✅ "⚠️ Your Amex KrisFlyer: Major Change" (personal, urgent)
- ✅ "Transfer rate dropped 33%. See alternatives." (clear impact + CTA)
- ✅ "✨ HSBC Revolution: Cap Increased" (positive, specific)

**Bad Examples**:
- ❌ "Rate change detected" (vague, not personal)
- ❌ "Important update about your credit card" (sounds like phishing)
- ❌ "Amex Membership Rewards Program Transfer Ratio Adjustment" (too corporate, too long)

---

### 7.3 References

**Design Inspiration**:
- iOS Human Interface Guidelines: Notifications
  https://developer.apple.com/design/human-interface-guidelines/notifications
- Material Design: Notifications
  https://m3.material.io/components/notifications
- React Native Reanimated: Gestures
  https://docs.swmansion.com/react-native-reanimated/

**Code References**:
- Existing `RateChangeBanner.tsx`: `/maximile-app/components/RateChangeBanner.tsx`
- Existing `DemoModeIndicator.tsx`: `/maximile-app/components/DemoModeIndicator.tsx`
- Demo data generator: `/maximile-app/lib/demo-data.ts`

**Product Documents**:
- PRD Demo Mode: `/docs/planning/PRD_DEMO_MODE.md`
- Push Notifications Evaluation: `/docs/PUSH_NOTIFICATIONS_EVALUATION.md`

---

## 8. Design Sign-Off

**Designer**: UI/UX Designer
**Date**: 2026-02-22
**Status**: Draft for Review

**Next Steps**:
1. Review with Product Manager (validate alignment with demo mode goals)
2. Review with Tech Lead (validate technical feasibility)
3. Create Figma mockups (visual reference for implementation)
4. Implement component in Sprint 14
5. Test with demo presenters before investor demo

---

**Document End**
