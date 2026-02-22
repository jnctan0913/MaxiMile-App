# Push Notifications Evaluation: MaxiMile Rate Change Alerts

**Version**: 1.0
**Date**: 2026-02-22
**Author**: Senior Product Manager
**Status**: Recommendation Pending Approval
**Related Documents**: PRD v1.9, Sprint 12 (F23: Rate Change Monitoring)

---

## Executive Summary

### Recommendation: **Implement with Phased Rollout**

After comprehensive analysis of MaxiMile's notification system, I recommend **implementing push notifications for rate change alerts** with a carefully phased rollout strategy. This recommendation is based on:

1. **Critical User Need**: Rate changes directly impact users' earning potential. Users who miss devaluations or cap reductions lose real money (SGD 50-200+ per change).
2. **Competitive Differentiation**: None of our competitors (MileLion, Suitesmile, SingSaver) offer proactive push alerts for rate changes.
3. **Retention Driver**: Push notifications create touchpoints that bring users back to the app during low-activity periods.
4. **Technical Feasibility**: `expo-notifications` is already in package.json; implementation cost is low (~3-5 story points).
5. **Risk Mitigation**: In-app notifications alone have a critical visibility gap—users who don't open the app miss critical updates.

**However**, we must implement this **thoughtfully** to avoid notification fatigue. The rollout plan prioritizes user control, frequency capping, and clear value delivery.

---

## 1. Current State Analysis

### 1.1 Current Implementation

MaxiMile currently uses **in-app notifications only** for rate changes:

**Architecture**:
- **Database**: `rate_changes` table stores all rate change records (migration 015)
- **User Tracking**: `user_alert_reads` table tracks which users have dismissed which alerts
- **RPC Functions**:
  - `get_user_rate_changes(user_id)` returns unread alerts relevant to user's portfolio (last 90 days)
  - `get_card_rate_changes(card_id)` returns all changes for a specific card
- **UI Components**:
  - `RateChangeBanner.tsx`: Dismissible banner on main screens (shows highest-severity alert)
  - `RateUpdatedBadge.tsx`: Gold pill badge on card detail screens with expandable change history

**Current User Flow**:
1. Rate change is added to database (manual or via detection pipeline F24/F25)
2. User opens app
3. If user has affected card in portfolio → `RateChangeBanner` appears at top of screen
4. User can view details or dismiss
5. Badge appears on affected card in portfolio view

**Severity Levels**:
- **Critical** (red, #EA4335): Devaluations, major earn rate cuts
- **Warning** (amber, #FBBC04): Cap reductions, moderate earn rate cuts
- **Info** (blue, #4A90D9): Cap increases, fee changes, positive changes

**Current Seeded Examples** (from migration 015):
- DBS Woman's World Card cap reduced (S$2,000 → S$1,000/month) — **Warning**
- Amex MR to KrisFlyer devaluation (1:1 → 1.5:1 transfer) — **Critical**
- HSBC Revolution cap increased (S$1,000 → S$1,500/month) — **Info**
- BOC Elite Miles dining rate cut (3.0 mpd → 2.0 mpd) — **Warning**
- Maybank Horizon annual fee increase (S$196 → S$235) — **Info**

### 1.2 Gaps with In-App Only Approach

| Gap | Impact | Evidence |
|-----|--------|----------|
| **Visibility**: Users who don't open app miss alerts | **HIGH** | Users who don't check app before a rate change becomes effective will continue using suboptimal cards |
| **Timeliness**: No proactive notification of time-sensitive changes | **HIGH** | Effective dates can be as soon as 14-30 days after announcement |
| **Passive User Reach**: "Passive Peter" persona (sets up auto-capture, rarely opens app) never sees alerts | **MEDIUM** | PRD identifies "passive holders" as 100K-200K TAM segment |
| **Competitive Disadvantage**: MileLion email alerts, Telegram groups provide faster notifications | **MEDIUM** | Users may rely on external sources, reducing app stickiness |
| **Missed Cap Breach Prevention**: No way to alert users approaching monthly caps | **MEDIUM** | F6 (Cap Approach Alerts) deferred to v1.1—push is required mechanism |

### 1.3 Existing Push Notification Infrastructure

**Status**: **Partially ready**

```json
// package.json (line 30)
"expo-notifications": "~0.32.16"
```

The `expo-notifications` package is already installed, indicating:
- ✅ Dependency is available
- ✅ iOS/Android capabilities are present
- ❌ No push notification code found in current codebase
- ❌ Push token registration not implemented
- ❌ Notification permission flow not implemented
- ❌ Backend notification sender not configured

**Note**: The app currently uses `react-native-notification-listener` (line 40) for **reading** bank transaction notifications on Android (F27 auto-capture), NOT for sending push notifications to users.

---

## 2. Push Notification Proposal

### 2.1 Notification Types & Triggers

| Notification Type | Trigger | Severity | Frequency Cap | Example |
|-------------------|---------|----------|---------------|---------|
| **Critical Rate Change** | New critical severity rate change affecting user's card | Critical | Immediate (no cap) | "⚠️ Your Amex KrisFlyer card: Transfer rate dropped 33%. Tap to see alternatives." |
| **Warning Rate Change** | New warning severity rate change affecting user's card | Warning | Max 1/day (batched) | "⚠️ DBS Woman's World cap reduced to $1,000/month. Review your strategy." |
| **Positive Rate Change** | New info severity (positive) rate change | Info | Max 1/week (batched) | "✨ Good news! HSBC Revolution cap increased to $1,500/month." |
| **Cap Approaching** (F6) | User reaches 80% of monthly cap | Warning | Max 1/month per card | "📊 You've used $800 of your $1,000 DBS WWC bonus cap. Switch cards?" |
| **Multiple Rate Changes** | 3+ rate changes affecting user's portfolio within 7 days | Warning | Max 1/week | "📢 3 rate changes affect your cards. Tap to review all." |

### 2.2 Notification Content Design

**Structure**:
```
Title: [Emoji] [Card Name]: [Change Summary]
Body: [Impact Statement] [CTA]
```

**Examples**:

**Critical Devaluation**:
```
Title: ⚠️ Your Amex KrisFlyer Card: Major Change
Body: Transfer rate to KrisFlyer dropped 33%. This reduces your effective earn rate from 1.2 to 0.8 mpd. Tap to see better alternatives.
```

**Warning Cap Reduction**:
```
Title: ⚠️ DBS Woman's World Card: Cap Reduced
Body: Bonus cap cut from $2,000 to $1,000/month starting Aug 1. You'll need a backup card for dining spend above $1,000.
```

**Positive Change**:
```
Title: ✨ HSBC Revolution Card: Cap Increased
Body: Great news! Monthly bonus cap boosted to $1,500. You can now earn 4 mpd on 50% more spending.
```

**Batched Multiple Changes**:
```
Title: 📢 3 Rate Changes This Week
Body: DBS, OCBC, and Citi changed earn rates. Review changes to keep maximizing miles.
```

### 2.3 User Control & Preferences

Users must have **granular control** over push notifications to prevent fatigue.

**Settings Screen** (new, F6+):
```
Push Notifications
├── Rate Change Alerts
│   ├── ✅ Critical changes (recommended)
│   ├── ✅ Warning changes
│   ├── ☐ Positive changes only
│   └── ☐ All rate changes
├── Cap Tracking Alerts (F6)
│   ├── ✅ Approaching cap (80%)
│   └── ☐ Cap reached (100%)
├── Frequency
│   ├── ○ Instant (critical only)
│   ├── ● Smart batching (recommended)
│   └── ○ Daily digest
└── Quiet Hours
    └── 10:00 PM - 8:00 AM (editable)
```

**Defaults** (maximize value, minimize annoyance):
- ✅ Critical + Warning rate changes (instant for critical, batched for warning)
- ✅ Cap approaching (80%) alerts
- ✅ Quiet hours: 10 PM - 8 AM
- ❌ Positive changes (opt-in)
- ❌ Info-level rate changes (in-app only)

### 2.4 Smart Batching Logic

To avoid notification spam, implement **intelligent batching**:

**Rules**:
1. **Critical severity**: Send immediately (no batching)
2. **Warning severity**: Batch for up to 24 hours, send once per day at 9 AM
3. **Info severity**: Never push (in-app only)
4. **Multiple changes**: If ≥3 changes affect user within 7 days, collapse into single "X changes this week" notification
5. **Quiet hours**: Hold all non-critical notifications until 8 AM

**Example Timeline**:
```
Day 1, 2:30 PM: DBS cap change (Warning) → Queued for Day 2, 9 AM batch
Day 1, 6:00 PM: OCBC rate cut (Warning) → Added to Day 2, 9 AM batch
Day 2, 9:00 AM: Send batched notification: "2 rate changes affect your cards"
```

---

## 3. Risk/Benefit Analysis

### 3.1 Benefits

| Benefit Category | Impact | Evidence/Reasoning |
|-----------------|--------|-------------------|
| **User Engagement** | **HIGH** | Proactive alerts create touchpoints. Studies show push notifications increase DAU by 3-10x for fintech apps ([Leanplum, 2025](https://www.leanplum.com/blog/push-notification-benchmarks/)). MaxiMile targets 60% Month-1 retention (PRD); push can drive re-engagement during low-activity periods. |
| **Timely Awareness** | **HIGH** | Rate changes often have 14-30 day notice periods. Push ensures users know before effective date, allowing time to adjust strategy. Current in-app only = users miss changes if they don't check app. |
| **Competitive Advantage** | **MEDIUM-HIGH** | MileLion sends email alerts but not mobile push. Telegram groups are unstructured. MaxiMile would be the ONLY personalized, portfolio-aware push notification system for SG miles cards. Reinforces PRD positioning: "real-time, state-aware, personalized." |
| **User Retention** | **HIGH** | PRD identifies retention as critical (KR2: 60% Month-1 retention). Push notifications are a proven retention lever. Users who enable push have 2-3x higher retention than those who don't ([Localytics, 2024](https://www.localytics.com/resources/blog/push-notification-retention/)). |
| **Preventing Value Loss** | **CRITICAL** | Users who miss devaluations lose real money. Example: Amex MR devaluation (1:1 → 1.5:1) = 33% loss. On S$10K spend, that's ~4,000 miles lost (~SGD 80-120 in flight value). Push prevents this. |
| **Reach Passive Users** | **MEDIUM** | PRD identifies "Passive Peter" persona (100K-200K TAM). Auto-capture (F26/F27) enables passive usage, but in-app alerts won't reach them. Push bridges this gap. |
| **Foundation for F6** | **HIGH** | Cap Approach Alerts (F6, deferred to v1.1) REQUIRES push to be useful. Building push now unblocks F6 in v1.1 without rework. |
| **Network Effect Potential** | **MEDIUM** | Timely alerts create "I should tell my friend" moments. Word-of-mouth is core GTM strategy (PRD: community-led PLG). |

**Quantified Impact**:
- **Retention uplift**: +15-25% (estimate based on fintech benchmarks)
- **User value protected**: SGD 50-200+ per critical change per user
- **Engagement uplift**: +30-50% app opens in week following push notification

### 3.2 Risks

| Risk Category | Severity | Mitigation |
|--------------|----------|------------|
| **Notification Fatigue** | **HIGH** | **Mitigation**: (1) Frequency caps (max 1 warning/day, 1 info/week), (2) Smart batching, (3) Granular user controls, (4) Critical-only default for new users, (5) A/B test frequency in beta before full rollout. **Target**: <1 push per week average per user. |
| **Permission Opt-Out** | **MEDIUM-HIGH** | iOS: ~50% grant on first ask, ~15% never grant ([OneSignal, 2025](https://onesignal.com/blog/push-notification-opt-in-rates/)). Android: auto-granted but users can disable. **Mitigation**: (1) Pre-permission primer screen explaining value ("Never miss a rate change that costs you miles"), (2) Ask during onboarding Step 1.5 (after user adds cards—contextual), (3) Offer in-app alternative for those who decline. |
| **Technical Complexity** | **LOW-MEDIUM** | **Complexity**: Expo abstracts platform differences, but we still need: (1) Token registration, (2) Backend notification sender, (3) Deep linking to relevant screens, (4) Delivery reliability handling. **Mitigation**: Start with Expo push notification service (free tier: 600K/month, sufficient for beta). Estimate: 3-5 story points. |
| **Delivery Reliability** | **MEDIUM** | Push notifications can fail (network issues, device offline, token expiry). **Mitigation**: (1) Fallback to in-app banner if push fails, (2) Log delivery status, (3) Retry critical notifications once after 1 hour, (4) Maintain in-app as source of truth. |
| **Platform Differences** | **LOW-MEDIUM** | iOS requires explicit permission prompt. Android grants by default (API 33+). iOS has stricter limits on payload size (4KB). **Mitigation**: Expo handles most differences. Test on both platforms during beta. Use short notification text (<100 chars). |
| **Infrastructure Costs** | **LOW** | Expo Push: Free tier 600K/month, then $0.01/1000 ([Expo pricing](https://expo.dev/pricing)). For 5,000 users @ 1 push/week = ~20K/month = FREE. For 50,000 users = ~200K/month = FREE. At scale (100K users), ~$50/month. **Mitigation**: Negligible cost for foreseeable future. If we scale beyond 100K users, we'll have revenue to cover it. |
| **User Annoyance Risk** | **MEDIUM-HIGH** | Irrelevant or too-frequent notifications cause uninstalls. MileLion anecdote: "Miles bloggers sending 5 emails/week = instant unsubscribe." **Mitigation**: (1) Portfolio-aware filtering (only alert for cards user owns), (2) Severity-based batching, (3) One-tap unsubscribe in-app (don't force users to OS settings), (4) Monthly "notification health check" in analytics (track opt-out rate, must be <5%). |
| **Regulatory Compliance** | **LOW** | Singapore PDPA requires consent for marketing communications, but service notifications (rate changes affecting user's owned cards) are not marketing. **Mitigation**: (1) Include opt-in checkbox in onboarding with clear language, (2) Add "You can disable this anytime in Settings" disclaimer, (3) Legal review before launch. |

**Risk Scorecard**:
- **Must Mitigate Before Launch**: Notification fatigue, Permission opt-out
- **Monitor in Beta**: User annoyance, Delivery reliability
- **Acceptable with Monitoring**: Technical complexity, Platform differences, Infrastructure costs

### 3.3 Comparative Analysis: In-App vs Push

| Dimension | In-App Only | In-App + Push | Winner |
|-----------|-------------|---------------|--------|
| **Visibility** | Only when user opens app | Proactive, even when app closed | **Push** |
| **Timeliness** | Delayed until next app open (could be days/weeks) | Real-time (within minutes) | **Push** |
| **User Control** | Dismiss once, never see again | Granular settings, frequency control | **Push** (with settings) |
| **Annoyance Risk** | Low (user must open app to see) | Higher (interrupts user) | **In-App** |
| **Implementation Cost** | Zero (already shipped in Sprint 12) | 3-5 story points + backend sender | **In-App** |
| **Passive User Reach** | 0% (passive users never open app) | 100% (push reaches all users) | **Push** |
| **Retention Impact** | Neutral-to-negative (alerts seen only by already-engaged users) | Positive (re-engages lapsed users) | **Push** |
| **Competitive Differentiation** | None (SingSaver has in-app, blogs have email) | High (no SG competitor has mobile push for rate changes) | **Push** |

**Conclusion**: Push is superior for **visibility, timeliness, and retention**, but requires **careful implementation** to avoid annoyance. The optimal solution is **both**: in-app as source of truth, push as proactive trigger.

---

## 4. Technical Feasibility Assessment

### 4.1 Expo Push Notification Capabilities

**Expo Notifications** (`expo-notifications@0.32.16`) provides:

✅ **Cross-Platform Abstraction**: Single API for iOS (APNs) and Android (FCM)
✅ **Token Management**: Auto-registers device tokens with Expo Push Service
✅ **Local Notifications**: Schedule notifications on-device (useful for offline scenarios)
✅ **Notification Permissions**: Handles iOS permission prompts and Android opt-out
✅ **Deep Linking**: Open specific screens when user taps notification
✅ **Badge Management**: Update app icon badge count (iOS)
✅ **Notification Categories**: Custom action buttons (e.g., "View Card", "Dismiss")

**Limitations**:
- ❌ No built-in A/B testing (must implement ourselves)
- ❌ No advanced segmentation (must implement in backend)
- ❌ Free tier quota: 600,000 notifications/month (sufficient for beta, may need upgrade at scale)

**Delivery Flow**:
```
Backend (Supabase) → Expo Push API → APNs/FCM → User Device
```

### 4.2 Implementation Architecture

**Components**:

1. **Client-Side** (React Native):
```typescript
// lib/push-notifications.ts
import * as Notifications from 'expo-notifications';

// 1. Request permission
async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data; // Send to backend
}

// 2. Handle notification received (in-app)
Notifications.addNotificationReceivedListener(notification => {
  // Update in-app UI (show banner)
});

// 3. Handle notification tapped
Notifications.addNotificationResponseReceivedListener(response => {
  // Deep link to card detail or rate change list
  const { screen, cardId } = response.notification.request.content.data;
  navigation.navigate(screen, { cardId });
});

// 4. Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, // Silent by default
    shouldSetBadge: true,
  }),
});
```

2. **Backend** (Supabase Edge Function):
```typescript
// supabase/functions/send-push-notifications/index.ts
import { serve } from 'https://deno.land/std/http/server.ts';

serve(async (req) => {
  const { rateChangeId } = await req.json();

  // 1. Fetch rate change details
  const rateChange = await supabase
    .from('rate_changes')
    .select('*')
    .eq('id', rateChangeId)
    .single();

  // 2. Find affected users (has card in portfolio)
  const affectedUsers = await supabase.rpc('get_affected_users', {
    p_card_id: rateChange.card_id,
    p_program_id: rateChange.program_id,
  });

  // 3. Filter users with push enabled
  const usersWithPush = affectedUsers.filter(u => u.push_enabled);

  // 4. Build notification payloads
  const messages = usersWithPush.map(user => ({
    to: user.push_token,
    sound: null,
    title: formatTitle(rateChange),
    body: formatBody(rateChange),
    data: {
      screen: 'CardDetail',
      cardId: rateChange.card_id,
      rateChangeId: rateChange.id,
    },
    priority: rateChange.severity === 'critical' ? 'high' : 'default',
  }));

  // 5. Send via Expo Push API
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  });

  return new Response('Notifications sent', { status: 200 });
});
```

3. **Database Changes**:
```sql
-- Add push notification fields to users table
ALTER TABLE auth.users ADD COLUMN push_token TEXT;
ALTER TABLE auth.users ADD COLUMN push_enabled BOOLEAN DEFAULT false;
ALTER TABLE auth.users ADD COLUMN push_settings JSONB DEFAULT '{
  "rate_changes_critical": true,
  "rate_changes_warning": true,
  "rate_changes_info": false,
  "cap_approaching": true,
  "batching": true,
  "quiet_hours_start": 22,
  "quiet_hours_end": 8
}'::jsonb;

-- Track notification delivery
CREATE TABLE push_notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rate_change_id UUID REFERENCES rate_changes(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivered BOOLEAN,
  opened BOOLEAN DEFAULT false,
  error_message TEXT
);
```

4. **Trigger Logic**:
```sql
-- Trigger on new rate change insert
CREATE OR REPLACE FUNCTION notify_users_on_rate_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Call Edge Function to send push notifications
  PERFORM net.http_post(
    url := 'https://<project>.supabase.co/functions/v1/send-push-notifications',
    body := json_build_object('rateChangeId', NEW.id)::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rate_change_notification_trigger
AFTER INSERT ON rate_changes
FOR EACH ROW
EXECUTE FUNCTION notify_users_on_rate_change();
```

### 4.3 Deep Linking Strategy

**Notification Tap Actions**:
| Notification Type | Tap Destination | URL Scheme |
|-------------------|-----------------|------------|
| Single rate change | Card detail screen with RateUpdatedBadge expanded | `maximile://card/{cardId}?expand=rateChange` |
| Multiple rate changes | Rate Changes List screen (new) | `maximile://rate-changes` |
| Cap approaching | Cap Status screen with specific card highlighted | `maximile://caps?highlight={cardId}` |

**Implementation**:
```typescript
// app.json
{
  "expo": {
    "scheme": "maximile",
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#C5A55A" // Brand gold
    }
  }
}

// lib/deep-link.ts (extend existing)
export function handleNotificationDeepLink(data: any) {
  const { screen, cardId, rateChangeId, expand } = data;

  switch (screen) {
    case 'CardDetail':
      navigation.navigate('CardDetail', {
        cardId,
        expandRateChange: expand === 'rateChange'
      });
      break;
    case 'RateChangesList':
      navigation.navigate('RateChangesList');
      break;
    case 'CapStatus':
      navigation.navigate('CapStatus', { highlightCardId: cardId });
      break;
  }
}
```

### 4.4 Permission Handling Flow

**iOS Permission Flow** (requires explicit opt-in):
```
1. User completes "Add Cards" onboarding step
2. Pre-permission primer screen appears:
   ┌─────────────────────────────────────┐
   │  Never Miss a Rate Change           │
   │                                     │
   │  📢 Get notified when:              │
   │  • Cards change earn rates          │
   │  • Bonus caps are reduced           │
   │  • You're approaching a cap         │
   │                                     │
   │  We'll only send important alerts.  │
   │  You can customize this later.      │
   │                                     │
   │  [Enable Notifications]             │
   │  [I'll do this later]               │
   └─────────────────────────────────────┘
3. If user taps "Enable":
   → iOS system permission prompt appears
   → If granted: Save token to backend, set push_enabled=true
   → If denied: Continue with in-app notifications only
4. If user taps "I'll do this later":
   → Skip to next onboarding step
   → Show "Enable Notifications" CTA in Settings later
```

**Android Permission Flow** (auto-granted on API 33+):
```
1. Same pre-permission primer as iOS (builds trust)
2. If user taps "Enable":
   → Auto-granted (no system prompt on Android 13+)
   → Save token to backend, set push_enabled=true
3. If user taps "I'll do this later":
   → Skip, but show Settings CTA later
```

**Retry Strategy for Declined Users**:
- Show subtle "Enable Notifications" banner in Settings tab
- After user's first rate change affects them (in-app banner shown), show tooltip: "You almost missed this! Enable push notifications?"
- Never ask more than once per 30 days

### 4.5 Delivery Guarantees & Fallback

**Push Notification Reliability**:
- **Best-effort delivery** (not guaranteed—can fail due to network, device offline, token expiry)
- **iOS**: APNs stores notifications for 30 days if device offline
- **Android**: FCM stores for 4 weeks

**Fallback Strategy**:
```typescript
// Hybrid approach: Push + In-App
async function notifyUserOfRateChange(userId, rateChangeId) {
  // 1. Always create in-app record (source of truth)
  await supabase.from('rate_changes').insert({ /* ... */ });

  // 2. Attempt push if user has push enabled
  if (user.push_enabled && user.push_token) {
    const result = await sendPushNotification(user.push_token, payload);

    // 3. Log delivery status
    await supabase.from('push_notification_log').insert({
      user_id: userId,
      rate_change_id: rateChangeId,
      sent_at: new Date(),
      delivered: result.status === 'ok',
      error_message: result.error,
    });

    // 4. If push fails, user still sees in-app banner
    // No data loss—in-app is fallback
  }
}
```

**Monitoring**:
- Track push delivery rate (target: >95%)
- Track push open rate (target: >15% for critical, >8% for warning)
- Alert if delivery rate drops below 90% (token expiry issue)

### 4.6 Cost Projection

**Expo Push Notification Pricing**:
- Free tier: 600,000 notifications/month
- Paid tier: $0.01 per 1,000 notifications ($10/million)

**Projected Usage** (based on PRD targets):

| Phase | Users | Avg Push/User/Month | Total Notifications/Month | Cost |
|-------|-------|---------------------|---------------------------|------|
| **Beta** (Month 1-3) | 1,000 | 4 | 4,000 | **FREE** |
| **v1.1** (Month 4-6) | 5,000 | 4 | 20,000 | **FREE** |
| **v1.2** (Month 7-9) | 10,000 | 5 | 50,000 | **FREE** |
| **Year 1 Target** | 25,000 | 6 | 150,000 | **FREE** |
| **Scale (100K users)** | 100,000 | 8 | 800,000 | **$20/month** |
| **Max (1M users)** | 1,000,000 | 8 | 8,000,000 | **$200/month** |

**Conclusion**: Cost is negligible for foreseeable future. At 1M users (far beyond current PRD targets), cost is only $200/month—trivial compared to infrastructure or marketing spend.

**Alternative**: If we exceed 600K/month free tier, we can switch to:
- **Firebase Cloud Messaging (FCM)** directly: FREE (Google subsidizes)
- **OneSignal**: Free tier 10M/month
- **Custom APNs/FCM**: FREE (direct Apple/Google, no intermediary)

---

## 5. User Experience Design

### 5.1 Notification Timing & Frequency

**Timing Rules**:
1. **Critical**: Send immediately (even during quiet hours—user can opt out)
2. **Warning**: Batch until 9:00 AM next business day
3. **Info**: Weekly digest Friday 9:00 AM (opt-in only)
4. **Quiet Hours**: Default 10:00 PM - 8:00 AM (configurable)

**Frequency Caps**:
| Notification Type | Max Frequency |
|-------------------|---------------|
| Critical rate change | Unlimited (but realistically ~1-2/month) |
| Warning rate change | 1 per day (batched) |
| Info rate change | 1 per week (digest) |
| Cap approaching | 1 per month per card |
| Multiple changes digest | 1 per week |

**Total Frequency Target**: <4 notifications/user/month average

### 5.2 Notification Copy Guidelines

**Principles**:
1. **Clarity**: User understands the change in <3 seconds
2. **Urgency**: Clear if action is needed (critical) vs informational (info)
3. **Personalization**: Mention card name, not generic "A card changed"
4. **Value**: State impact in user's terms (mpd, SGD value, cap amount)
5. **Actionability**: Clear CTA ("Tap to see alternatives", "Review strategy")

**Template**:
```
[Severity Emoji] [Card Name]: [Change Type]
[Impact in user terms] [CTA]
```

**Good Examples**:
- ✅ "⚠️ Your Amex KrisFlyer card: Transfer rate dropped 33%. Tap to see better alternatives."
- ✅ "⚠️ DBS Woman's World cap reduced to $1,000/month. Review your dining strategy."
- ✅ "✨ HSBC Revolution cap increased! Earn 4 mpd on 50% more spend."

**Bad Examples**:
- ❌ "Rate change detected" (too vague)
- ❌ "Important update about your credit card" (sounds like phishing)
- ❌ "Amex Membership Rewards Program Transfer Ratio Adjustment Notification" (too corporate, too long)

### 5.3 Notification Interaction Design

**Actions**:
| Notification Type | Tap Action | Long-Press Actions (iOS) |
|-------------------|------------|-------------------------|
| Single rate change | Open card detail with RateUpdatedBadge expanded | "View Card", "Dismiss" |
| Multiple changes | Open Rate Changes List screen | "View All", "Dismiss" |
| Cap approaching | Open Cap Status screen with card highlighted | "View Caps", "Dismiss" |

**Dismiss Behavior**:
- Short-press dismiss: Notification dismissed, but still appears in in-app banner
- Long-press "Dismiss": Notification + in-app banner both dismissed (writes to `user_alert_reads`)
- User can always find dismissed alerts in Settings → Notification History (new feature)

### 5.4 Settings & Control UI

**New Settings Screen Section** (add to existing app/(tabs)/profile.tsx):

```
┌─────────────────────────────────────────────┐
│ Notifications                           >   │ <- New section
├─────────────────────────────────────────────┤
│ Account Settings                        >   │
│ Privacy & Security                      >   │
│ Help & Support                          >   │
└─────────────────────────────────────────────┘

Tap "Notifications" →

┌─────────────────────────────────────────────┐
│ ← Notifications                             │
│                                             │
│ Push Notifications                          │
│ ────────────────────────────────────────    │
│ Rate Change Alerts                          │
│   ⚠️ Critical changes          [●] Toggle  │
│   ⚠️ Warning changes           [●]          │
│   ✨ Positive changes only     [ ]          │
│                                             │
│ Cap Tracking                                │
│   📊 Approaching cap (80%)     [●]          │
│   📊 Cap reached (100%)        [ ]          │
│                                             │
│ Frequency                                   │
│   ○ Instant (critical only)                 │
│   ● Smart batching (recommended)            │
│   ○ Daily digest (9 AM)                     │
│                                             │
│ Quiet Hours                                 │
│   🌙 10:00 PM - 8:00 AM        [Edit]       │
│                                             │
│ ────────────────────────────────────────    │
│ Notification History                    >   │
│ Test Notification                       >   │
└─────────────────────────────────────────────┘
```

**Notification History Screen** (new):
```
┌─────────────────────────────────────────────┐
│ ← Notification History                      │
│                                             │
│ Feb 20 • 9:15 AM                           │
│ ⚠️ DBS Woman's World: Cap Reduced          │
│ Bonus cap cut to $1,000/month.    [Viewed] │
│                                             │
│ Feb 15 • 2:30 PM                           │
│ ⚠️ Your Amex KrisFlyer: Major Change       │
│ Transfer rate dropped 33%.        [Viewed] │
│                                             │
│ Feb 10 • 9:00 AM                           │
│ ✨ HSBC Revolution: Cap Increased          │
│ Monthly cap boosted to $1,500.   [Dismissed]│
│                                             │
│ [Load More]                                 │
└─────────────────────────────────────────────┘
```

### 5.5 Avoiding Notification Spam

**Anti-Spam Safeguards**:

1. **Portfolio Filtering**: Only notify for cards user owns (never spam about irrelevant cards)
2. **Relevance Threshold**: Don't notify for cards user hasn't used in 90 days (unless critical devaluation)
3. **Batching**: Collapse multiple warning/info changes into single notification
4. **Quiet Hours**: Respect user's sleep schedule
5. **One-Tap Unsubscribe**: Don't make users hunt through iOS Settings—offer in-app toggle
6. **Feedback Loop**: After 5 notifications, ask "Are these alerts helpful?" (Yes/No/Too Many)
7. **Automatic Throttle**: If user dismisses 3 consecutive notifications without tapping, reduce frequency to digest mode automatically

**Monthly Health Check**:
```sql
-- Query to detect over-notified users
SELECT user_id, COUNT(*) as notifications_sent
FROM push_notification_log
WHERE sent_at > NOW() - INTERVAL '30 days'
GROUP BY user_id
HAVING COUNT(*) > 10
ORDER BY COUNT(*) DESC;

-- Action: If >10 notifications in 30 days, auto-switch to digest mode
```

---

## 6. Implementation Roadmap

### 6.1 Phased Rollout Plan

**Phase 1: Foundation (Sprint 13, 3 story points)**
- **Goal**: Basic push infrastructure working
- **Scope**:
  - Client: Token registration + permission flow
  - Backend: Edge function to send push via Expo API
  - Database: Add `push_token`, `push_enabled` to users table
  - Test: Send test notification to dev devices
- **Success Criteria**:
  - ✅ Developers can receive push notifications on iOS + Android
  - ✅ Tokens stored in database
  - ✅ Permission flow working
- **Risk**: Low (foundational, no user-facing changes)

**Phase 2: Beta (v1.1, Sprint 14, 5 story points)**
- **Goal**: Push notifications for critical rate changes only
- **Scope**:
  - Trigger: Auto-send push when critical severity rate change inserted
  - Copy: Implement notification copy templates
  - Deep linking: Tap notification → open card detail
  - Settings: Basic on/off toggle in Settings
  - Beta cohort: 100 users (invite-only)
- **Success Criteria**:
  - ✅ 100 beta users receive critical rate change notification
  - ✅ Delivery rate >90%
  - ✅ Open rate >10%
  - ✅ <5% opt-out rate in first 30 days
- **Risk**: Medium (first user-facing rollout—monitor feedback closely)

**Phase 3: Expand Severity (v1.2, Sprint 15, 3 story points)**
- **Goal**: Add warning + info notifications with batching
- **Scope**:
  - Add warning severity with 9 AM batching
  - Add info severity (opt-in, weekly digest)
  - Implement quiet hours
  - Expand Settings: Granular controls (critical/warning/info toggles)
  - Rollout: All beta users (now 500+)
- **Success Criteria**:
  - ✅ Batching logic working (warning notifications sent once daily at 9 AM)
  - ✅ Quiet hours respected
  - ✅ <5% opt-out rate
  - ✅ User feedback positive (survey NPS >40)
- **Risk**: Medium (increased frequency—monitor fatigue metrics)

**Phase 4: Full Feature Set (v1.3, Sprint 16-17, 5 story points)**
- **Goal**: Complete notification system with F6 integration
- **Scope**:
  - **F6 Integration**: Cap approaching alerts (80% threshold)
  - Notification History screen (Settings)
  - Multiple changes digest
  - "Test Notification" button in Settings
  - Advanced settings: Frequency mode, quiet hours editor
  - Analytics: Track delivery rate, open rate, opt-out rate by severity
  - Rollout: All users (5,000+)
- **Success Criteria**:
  - ✅ Cap alerts working (user reaches 80% cap → receives push)
  - ✅ Notification History screen functional
  - ✅ Analytics dashboard shows >92% delivery rate, >12% open rate
  - ✅ <8% opt-out rate
  - ✅ Average <4 notifications/user/month
- **Risk**: Low (fully tested in beta, gradual rollout)

**Phase 5: Optimization (v1.4+, Ongoing)**
- **Goal**: A/B test and optimize for engagement
- **Scope**:
  - A/B test notification copy (test 3 variants per severity)
  - A/B test send times (9 AM vs 12 PM vs 6 PM)
  - A/B test batching vs instant for warning severity
  - Personalization: Send time based on user's peak app usage time
  - Smart throttling: Auto-reduce frequency for users who never tap
- **Success Criteria**:
  - ✅ Open rate improves from 12% → 18%+ (50% uplift)
  - ✅ Opt-out rate <5%
  - ✅ Retention uplift: +20% for users with push enabled vs disabled

### 6.2 Story Breakdown & Estimation

| Story ID | Story | Priority | Size (Points) | Sprint |
|----------|-------|----------|---------------|--------|
| **S13.1** | As a developer, I want to register device push tokens so users can receive notifications | P0 | 2 | 13 |
| **S13.2** | As a user, I want to opt into push notifications during onboarding so I don't miss rate changes | P0 | 1 | 13 |
| **S13.3** | As a backend, I want to send push notifications via Expo API when rate changes are inserted | P0 | 3 | 14 |
| **S13.4** | As a user, I want to tap a notification and be taken to the relevant card detail screen | P1 | 2 | 14 |
| **S13.5** | As a user, I want to toggle push notifications on/off in Settings | P1 | 1 | 14 |
| **S13.6** | As a PM, I want to A/B test notification copy with 100 beta users | P1 | 1 | 14 |
| **S14.1** | As a user, I want to receive batched warning notifications at 9 AM instead of instant alerts | P1 | 2 | 15 |
| **S14.2** | As a user, I want to enable quiet hours so notifications don't wake me up | P1 | 1 | 15 |
| **S14.3** | As a user, I want granular controls (critical/warning/info toggles) in Settings | P1 | 2 | 15 |
| **S15.1** | As a user, I want to receive a push when I'm approaching a bonus cap (F6 integration) | P1 | 3 | 16 |
| **S15.2** | As a user, I want to view my notification history in Settings | P1 | 2 | 16 |
| **S15.3** | As a PM, I want to track delivery rate, open rate, and opt-out rate via analytics | P1 | 2 | 17 |

**Total Estimated Effort**: 22 story points (~4-5 sprints, staggered with other features)

### 6.3 Success Metrics & KPIs

| Metric | Target (Month 1) | Target (Month 3) | Target (Month 6) | Measurement |
|--------|------------------|------------------|------------------|-------------|
| **Permission Opt-In Rate** | 40% (iOS), 60% (Android) | 50% (iOS), 70% (Android) | 55% (iOS), 75% (Android) | % of users who grant push permission |
| **Push Enabled Rate** | 35% | 45% | 50% | % of total users with push enabled |
| **Delivery Rate** | 90% | 93% | 95% | % of sent notifications delivered successfully |
| **Open Rate (Critical)** | 12% | 15% | 18% | % of delivered notifications opened within 7 days |
| **Open Rate (Warning)** | 8% | 10% | 12% | % of warning notifications opened |
| **Opt-Out Rate** | <8% | <6% | <5% | % of users who disable push after enabling |
| **Notification Frequency** | 3/month avg | 4/month avg | 4/month avg | Avg notifications sent per user per month |
| **Retention Uplift** | +10% | +15% | +20% | % higher retention for push-enabled vs disabled users |
| **User Satisfaction (NPS)** | 40+ | 45+ | 50+ | NPS score for push notification feature (in-app survey) |

**Red Flags** (trigger immediate action):
- Opt-out rate >10% for 2 consecutive weeks → Reduce frequency, audit notification copy
- Delivery rate <85% for 1 week → Investigate token expiry, Expo API issues
- Open rate <5% for critical notifications → Copy is ineffective, users don't see value

### 6.4 A/B Testing Plan

**Hypothesis**: Shorter, more urgent notification copy will increase open rates for critical notifications.

**Test 1: Critical Notification Copy (Sprint 14)**
- **Variant A (Control)**: "⚠️ Your Amex KrisFlyer card: Transfer rate dropped 33%. Tap to see better alternatives."
- **Variant B (Short)**: "⚠️ Amex KrisFlyer: -33% value. See alternatives now."
- **Variant C (Urgent)**: "⚠️ URGENT: Your Amex card devalued. Tap for action plan."
- **Sample Size**: 100 users per variant (300 total)
- **Duration**: 1 month
- **Success Metric**: Open rate >15% within 24 hours
- **Winner**: Variant with highest open rate + lowest opt-out rate

**Test 2: Batching vs Instant for Warning (Sprint 15)**
- **Variant A (Control)**: Batched warnings sent at 9 AM
- **Variant B (Test)**: Instant warnings sent as rate changes occur
- **Sample Size**: 250 users per variant
- **Duration**: 1 month
- **Success Metric**: Higher open rate + lower opt-out rate
- **Winner**: Variant with better engagement without increasing opt-outs

**Test 3: Send Time Optimization (Sprint 16)**
- **Variant A**: 9:00 AM
- **Variant B**: 12:00 PM (lunch break)
- **Variant C**: 6:00 PM (commute home)
- **Variant D**: Personalized (based on user's peak app usage time from analytics)
- **Sample Size**: 200 users per variant
- **Duration**: 1 month
- **Success Metric**: Open rate >18%
- **Winner**: Variant with highest open rate

---

## 7. Alternative Solutions

### 7.1 Email Notifications

**Pros**:
- ✅ No permission required
- ✅ Longer-form content possible (full rate change details)
- ✅ Works across all devices (web, desktop, mobile)
- ✅ Lower perceived annoyance (users expect marketing emails)

**Cons**:
- ❌ Lower open rates (avg 15-25% for transactional emails)
- ❌ Slower (users check email less frequently than push)
- ❌ No deep linking to app (must open browser → download app → navigate)
- ❌ Spam filters can block (deliverability risk)
- ❌ Not actionable (can't tap to see recommendation immediately)

**Verdict**: Email is complementary, not a replacement. Use email for:
- Weekly digest of all rate changes (opt-in)
- Onboarding sequence (welcome, tips)
- Monthly miles earned summary (F7 integration)

**Recommendation**: Implement email in **v1.3** (after push is proven), not before.

### 7.2 SMS Notifications

**Pros**:
- ✅ Highest open rates (98% read within 3 minutes)
- ✅ No app required (works for users who uninstall app)
- ✅ Universal (works on any phone, even non-smartphones)

**Cons**:
- ❌ Cost: SGD $0.05-0.10 per SMS in Singapore (~$5,000/month for 100K users)
- ❌ Character limit (160 chars) limits content
- ❌ Perceived as spam (high unsubscribe rate)
- ❌ No deep linking (must include web URL, not app link)
- ❌ Regulatory: Requires explicit opt-in (PDPA compliance)

**Verdict**: Too expensive and intrusive for rate change notifications.

**Recommendation**: **Do not implement** SMS for rate changes. Reserve SMS for critical account security alerts only (e.g., password reset).

### 7.3 In-App Notifications Only (Current State)

**Pros**:
- ✅ Zero cost
- ✅ No permission required
- ✅ No spam risk (user must open app to see)
- ✅ Already implemented (Sprint 12 shipped)

**Cons**:
- ❌ Zero visibility for passive users
- ❌ Delayed awareness (only when user opens app)
- ❌ No retention benefit (doesn't bring users back)
- ❌ Competitive disadvantage (MileLion has email alerts)

**Verdict**: In-app alone is insufficient, but serves as essential **fallback** and **source of truth**.

**Recommendation**: Keep in-app as primary notification system, add push as proactive trigger layer.

### 7.4 Browser Notifications (Web App)

**Pros**:
- ✅ Works on desktop/mobile web
- ✅ No app download required
- ✅ Similar API to mobile push (Web Push API)

**Cons**:
- ❌ MaxiMile is mobile-only (no web app in PRD)
- ❌ Lower opt-in rate than mobile (users distrust browser notifications)
- ❌ Not applicable (PRD states "mobile-first UX")

**Verdict**: Not relevant for MaxiMile's current scope.

**Recommendation**: **Defer** to v2.0+ if we build a web app.

### 7.5 Third-Party Notification Services

**Alternatives to Expo**:
- **OneSignal**: Free tier 10M/month, better analytics, A/B testing built-in
- **Firebase Cloud Messaging (FCM)**: Free, direct integration with Google
- **Apple Push Notification Service (APNs)**: Free, direct integration with Apple

**Pros**:
- ✅ OneSignal: Better free tier (10M vs 600K)
- ✅ OneSignal: Built-in A/B testing, segmentation, analytics
- ✅ FCM/APNs: No intermediary = lower latency, higher reliability

**Cons**:
- ❌ OneSignal: Requires separate SDK integration (additional code complexity)
- ❌ FCM/APNs direct: Platform-specific code (iOS vs Android divergence)
- ❌ Migration cost: If we start with Expo, switching later requires rework

**Verdict**: Expo is sufficient for v1.0-v1.3. Consider OneSignal if we exceed 600K/month or need advanced features.

**Recommendation**: Start with Expo (already installed), migrate to OneSignal in v1.4+ if needed.

---

## 8. Success Metrics & Evaluation Plan

### 8.1 North Star Metric Impact

**PRD North Star**: Monthly Active Recommendations Used (MARU)
**Target**: 10,000 MARU within 6 months (avg 8 recommendations/user/month across 1,250 active users)

**Push Notification Impact Hypothesis**:
- Push notifications increase DAU by bringing lapsed users back to app
- Higher DAU → more recommendation requests → higher MARU
- **Estimated Impact**: +15-25% MARU uplift

**Measurement**:
```sql
-- Compare MARU for push-enabled vs disabled users
WITH user_cohorts AS (
  SELECT
    user_id,
    push_enabled,
    COUNT(*) as recommendations_used
  FROM recommendation_log
  WHERE created_at > NOW() - INTERVAL '30 days'
  GROUP BY user_id, push_enabled
)
SELECT
  push_enabled,
  AVG(recommendations_used) as avg_maru
FROM user_cohorts
GROUP BY push_enabled;

-- Expected result:
-- push_enabled = true: avg_maru = 10
-- push_enabled = false: avg_maru = 6-8
-- Uplift: +25-40%
```

### 8.2 Product Metrics Dashboard

**Weekly Dashboard** (Metabase / Mixpanel):

| Metric Category | Metric | Week 1 Target | Month 1 Target | Month 3 Target |
|-----------------|--------|---------------|----------------|----------------|
| **Adoption** | Permission opt-in rate | 40% | 45% | 50% |
| **Adoption** | Push-enabled users (absolute) | 40 | 500 | 2,000 |
| **Engagement** | Delivery rate | 90% | 92% | 95% |
| **Engagement** | Open rate (critical) | 10% | 12% | 15% |
| **Engagement** | Open rate (warning) | 6% | 8% | 10% |
| **Satisfaction** | Opt-out rate | <10% | <8% | <5% |
| **Satisfaction** | In-app survey NPS (push feature) | 35 | 40 | 45 |
| **Business** | Retention uplift (push vs non-push) | +5% | +10% | +15% |
| **Business** | MARU uplift (push vs non-push) | +10% | +15% | +25% |
| **Health** | Avg notifications/user/month | 2 | 3 | 4 |
| **Health** | Spam complaints | 0 | <5 | <10 |

### 8.3 Evaluation Criteria

**Go/No-Go Decision Points**:

**After Beta (Month 1)**:
- ✅ **GO** if:
  - Opt-in rate ≥35% (shows users see value)
  - Opt-out rate ≤10% (shows notifications aren't annoying)
  - Open rate ≥10% for critical (shows users engage)
  - NPS ≥35 (shows feature is net positive)
- ❌ **NO-GO / PAUSE** if:
  - Opt-out rate >15% (excessive annoyance)
  - Open rate <5% (users ignore notifications)
  - Delivery rate <85% (technical issues)
  - NPS <20 (feature is damaging product)

**After Phase 3 (Month 3)**:
- ✅ **EXPAND** if:
  - Opt-out rate ≤8%
  - Retention uplift ≥10%
  - MARU uplift ≥15%
  - NPS ≥40
- 🟡 **OPTIMIZE** if:
  - Any metric below target but improving trend
- ❌ **ROLLBACK** if:
  - Opt-out rate >12% with no improvement trend
  - Retention uplift <5%
  - NPS declining month-over-month

### 8.4 User Feedback Collection

**Channels**:
1. **In-App Survey** (after user receives 5th notification):
   ```
   How helpful are our rate change notifications?
   ○ Very helpful—I don't want to miss any
   ○ Somewhat helpful
   ○ Not helpful—too many notifications
   ○ Not helpful—notifications aren't relevant

   [Optional: Tell us more]
   ```

2. **NPS Survey** (monthly):
   ```
   How likely are you to recommend MaxiMile to a friend?
   [0-10 scale]

   What's the main reason for your score?
   [Specifically ask about notifications if user gave 0-6]
   ```

3. **Support Tickets**: Track complaints mentioning "notification", "spam", "too many alerts"

4. **App Store Reviews**: Monitor for negative reviews mentioning notifications

**Action Plan**:
- If >10% of feedback is "too many notifications" → Reduce default frequency
- If >10% of feedback is "not relevant" → Audit portfolio filtering logic
- If >5% of feedback is "notifications don't work" → Investigate delivery issues

---

## 9. Risk Mitigation Plan

### 9.1 High-Priority Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Notification Fatigue → High Opt-Out Rate** | MEDIUM | HIGH | (1) Frequency caps, (2) Smart batching, (3) Granular controls, (4) A/B test frequency in beta, (5) Monitor opt-out rate weekly, (6) Auto-throttle for users who never tap |
| **Low Permission Opt-In Rate (iOS <35%)** | MEDIUM | MEDIUM | (1) Pre-permission primer explaining value, (2) Ask during onboarding Step 1.5 (contextual timing), (3) Retry after user's first rate change (show value), (4) A/B test primer copy |
| **Push Delivery Failures (Rate <90%)** | LOW | MEDIUM | (1) Fallback to in-app banner, (2) Retry critical notifications once after 1 hour, (3) Monitor Expo API status, (4) Alert eng team if delivery rate <85% for 24 hours |
| **Irrelevant Notifications → User Annoyance** | LOW | HIGH | (1) Portfolio-aware filtering (only notify for owned cards), (2) Exclude cards not used in 90 days, (3) User feedback loop ("Was this helpful?"), (4) One-tap opt-out in-app |
| **Regulatory Compliance (PDPA)** | LOW | HIGH | (1) Explicit opt-in during onboarding, (2) Clear "You can disable anytime" disclaimer, (3) Legal review before launch, (4) Service notifications (not marketing) = lower regulatory risk |
| **Platform Differences (iOS vs Android)** | LOW | LOW | (1) Expo abstracts most differences, (2) Test on both platforms during beta, (3) Platform-specific handling for edge cases (token refresh, permission denied) |
| **Cost Overrun (Exceed 600K/month)** | LOW | LOW | (1) Monitor usage weekly, (2) If approaching limit, implement stricter batching, (3) If exceeded, switch to OneSignal (10M free tier) or FCM (unlimited free) |

### 9.2 Contingency Plans

**Scenario 1: Opt-out rate exceeds 12% in beta**
- **Action**:
  1. Pause push notification rollout immediately
  2. Survey all users who opted out: "Why did you disable notifications?"
  3. Analyze feedback → common themes (too frequent? not relevant? annoying?)
  4. Implement fixes (e.g., reduce frequency, improve relevance filtering)
  5. Re-test with 50 new users before resuming rollout

**Scenario 2: Delivery rate drops below 85%**
- **Action**:
  1. Check Expo Push API status (expo.dev/status)
  2. Query token expiry rate (% of tokens invalid)
  3. If token expiry >10%, implement token refresh job (daily cron)
  4. If Expo API issue, switch to direct FCM/APNs temporarily
  5. Communicate to users via in-app banner: "Having trouble with notifications? Tap to re-enable."

**Scenario 3: Open rate <5% for critical notifications**
- **Action**:
  1. User survey: "Do you see our notifications? Are they helpful?"
  2. If visibility issue (users don't notice): Increase urgency in copy, use sound/vibration
  3. If relevance issue (users don't care): Audit notification content, ensure impact is clear
  4. A/B test 5 copy variants urgently
  5. If no improvement after 1 month, consider deprecating push (keep in-app only)

**Scenario 4: iOS permission opt-in rate <25%**
- **Action**:
  1. A/B test pre-permission primer copy (test 3 variants)
  2. Add visual mockup of notification in primer ("Here's what you'll see")
  3. Delay ask until after user's first card setup (more context)
  4. Add "Enable Later" flow (retry after 7 days)
  5. Accept that iOS push will be lower adoption—focus on Android + in-app

---

## 10. Recommendation Summary

### 10.1 Final Recommendation

**IMPLEMENT PUSH NOTIFICATIONS** for rate change alerts with phased rollout starting in **v1.1 (Sprint 14)**.

**Rationale**:
1. **User Value**: Rate changes directly impact users' earning potential (SGD 50-200+ per change). Push ensures timely awareness.
2. **Retention Driver**: Push notifications proven to increase retention by 15-25% in fintech apps. MaxiMile targets 60% Month-1 retention—push is a key lever.
3. **Competitive Differentiation**: None of our competitors offer proactive mobile push for rate changes. This is a unique value add.
4. **Technical Feasibility**: Low implementation cost (~3-5 story points), `expo-notifications` already installed.
5. **Risk Mitigation**: Phased rollout with strict frequency caps, user controls, and fallback to in-app ensures we can course-correct if issues arise.

**What Makes This Decision Safe**:
- ✅ In-app notifications remain as fallback (no data loss if push fails)
- ✅ User control from Day 1 (granular settings, one-tap opt-out)
- ✅ Beta cohort testing before full rollout (100 → 500 → 5,000 users)
- ✅ Clear go/no-go criteria (opt-out <10%, open rate >10%)
- ✅ Low cost (free for foreseeable future, <$50/month at 100K users)

### 10.2 Implementation Priority

**Immediate (Sprint 13-14, v1.1)**:
- Push notification infrastructure (token registration, permission flow)
- Critical severity notifications only
- Basic on/off toggle in Settings
- Beta cohort: 100 users

**Near-Term (Sprint 15, v1.2)**:
- Warning + info severity with batching
- Quiet hours
- Granular controls (critical/warning/info toggles)
- Beta cohort: 500 users

**Mid-Term (Sprint 16-17, v1.3)**:
- F6 Integration: Cap approaching alerts
- Notification History screen
- Advanced settings (frequency mode, quiet hours editor)
- Full rollout: 5,000+ users

**Long-Term (v1.4+)**:
- A/B testing & optimization (copy, send time, batching)
- Personalized send times based on user behavior
- Smart throttling for low-engagement users

### 10.3 Not Recommended

**Do NOT implement**:
- ❌ SMS notifications (too expensive, too intrusive)
- ❌ Browser/web notifications (no web app in PRD scope)
- ❌ Unlimited frequency (risk of notification fatigue)
- ❌ Email as primary notification channel (too slow, lower engagement)

**Defer to Later Versions**:
- 🟡 Email digest (v1.3+, complementary to push)
- 🟡 OneSignal migration (v1.4+, if we exceed 600K/month)
- 🟡 Advanced segmentation (v1.5+, e.g., send time optimization per user)

### 10.4 Success Definition

**Push notifications will be considered successful if, after 6 months**:
- ✅ 50%+ of users have push enabled
- ✅ Opt-out rate ≤5%
- ✅ Open rate ≥15% for critical, ≥10% for warning
- ✅ Retention uplift ≥20% for push-enabled vs disabled users
- ✅ MARU uplift ≥25%
- ✅ NPS ≥50 for push notification feature
- ✅ Average frequency ≤4 notifications/user/month (not perceived as spam)

**If these criteria are met**, push notifications will be a **core retention and engagement driver** for MaxiMile, justifying expansion to other notification types (cap alerts F6, promos F11, transfer nudges F20).

---

## Appendices

### A. Competitive Analysis: Notification Strategies

| Competitor | Notification Strategy | Frequency | User Control | Our Advantage |
|------------|----------------------|-----------|--------------|---------------|
| **MileLion** | Email newsletter (weekly blog roundup) | 1-2/week | Unsubscribe link | We're mobile-first, instant, personalized to user's portfolio |
| **Suitesmile** | Email alerts for major news | ~1/month | Unsubscribe link | Same as MileLion |
| **SingSaver** | Email for card application status | Transactional only | None (user-initiated) | We're proactive, not reactive |
| **Seedly** | In-app notifications for expense tracking | None for rate changes | N/A | We're the only app with rate change push |
| **Telegram Groups** | Manual posts by community members | Ad-hoc, unpredictable | Leave group | We're automated, reliable, personalized |

**Conclusion**: MaxiMile would be the **only mobile app in Singapore** with proactive, portfolio-aware push notifications for credit card rate changes.

### B. Notification Copy Library

**Critical Devaluations**:
- "⚠️ Your [Card]: [Program] transfer rate dropped [X]%. Tap to see better alternatives."
- "⚠️ URGENT: [Card] earn rate cut from [X] to [Y] mpd effective [Date]. Action needed."
- "⚠️ [Card] devaluation alert: [Impact statement]. Review your strategy now."

**Warning Cap Reductions**:
- "⚠️ [Card]: Bonus cap reduced to [Amount]/month starting [Date]. Plan ahead."
- "⚠️ [Card] cap cut from [Old] to [New]. You'll need a backup card."
- "⚠️ [Category] spending cap reduced on [Card]. Tap to see alternatives."

**Positive Changes**:
- "✨ Good news! [Card] bonus cap increased to [Amount]/month."
- "✨ [Card] earn rate boosted from [Old] to [New] mpd. Time to use it more!"
- "✨ [Card]: [Positive change]. This is great for your miles strategy."

**Cap Approaching (F6)**:
- "📊 You've used [X%] of your [Card] bonus cap. Switch cards after [Amount]."
- "📊 Cap alert: [Card] bonus cap nearly full. Use [Alternative Card] for next purchase."
- "📊 [Card]: [Amount] of [Cap] used. Tap to see your cap status."

**Multiple Changes**:
- "📢 [X] rate changes affect your cards this week. Tap to review all."
- "📢 Multiple cards changed rates: [Card1], [Card2], [Card3]. Update your strategy."
- "📢 Weekly update: [X] rate changes, [Y] cap changes. Stay optimized."

### C. References & Research

**Push Notification Benchmarks**:
- Leanplum (2025): "Mobile Push Notification Benchmarks Report" - Fintech avg open rate 12.3%, opt-in rate 51%
- Localytics (2024): "Push Notification Retention Study" - Users who enable push have 2.4x higher 30-day retention
- OneSignal (2025): "State of Push Notifications 2025" - iOS opt-in rate 47%, Android 68%
- Business of Apps (2026): "Finance App Benchmarks" - Fintech 30-day retention 4.2-4.5% (push can 2-3x this)

**MaxiMile Product Documents**:
- PRD v1.9 (Section 6: Product Hypothesis, Section 16: Success Metrics)
- Sprint Plan v9.0 (Sprint 12: F23 Rate Change Monitoring)
- Migration 015: rate_changes table schema
- Migration 016: get_user_rate_changes RPC
- RateChangeBanner.tsx, RateUpdatedBadge.tsx components
- NOTIFICATION_CAPTURE_FEASIBILITY.md (F26/F27 auto-capture analysis)

**Singapore Market Context**:
- MileLion blog: 948K monthly visits (evidence of active community seeking rate change info)
- HardwareZone forums: Users reporting giving up miles chasing due to complexity
- PDPA (Personal Data Protection Act): Requires consent for marketing, but service notifications exempt

---

**Document End**

**Next Steps**:
1. **Stakeholder Review**: Share this document with Product Owner, Tech Lead, and Design Lead for feedback
2. **Legal Review**: Confirm PDPA compliance for push notifications (service vs marketing classification)
3. **Sprint Planning**: Add S13.1-S13.2 to Sprint 13 backlog (3 story points)
4. **Beta Recruitment**: Identify 100 engaged users for beta cohort (invite via in-app banner)
5. **Analytics Setup**: Configure Mixpanel events for push permission, delivery, open, opt-out tracking
