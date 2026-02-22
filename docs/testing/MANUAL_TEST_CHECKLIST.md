# Push Notification System - Manual Test Checklist

**Purpose:** Comprehensive manual testing guide for push notification implementation
**Test Environment:** Staging/Development
**Prerequisites:** All TypeScript errors resolved, app builds successfully

---

## Setup Instructions

### Environment Setup

**1. Demo Mode Build:**
```bash
# Set environment variable
export EXPO_PUBLIC_DEMO_MODE=true

# Build and run
cd maximile-app
npx expo start
```

**2. Production Mode Build:**
```bash
# Set environment variable
export EXPO_PUBLIC_DEMO_MODE=false

# Build and run
npx expo start
```

**3. Feature Flags (Supabase):**
```sql
-- Enable push notifications in staging
UPDATE feature_flags
SET enabled = true
WHERE flag_name = 'push_notifications_enabled';

-- Enable cap alerts
UPDATE feature_flags
SET enabled = true
WHERE flag_name = 'push_cap_alerts_enabled';
```

---

## Test Suite

### Section 1: Token Registration (Sprint 19)

#### Test 1.1: First-Time Registration (Production Mode)

**Setup:**
- Fresh app install OR cleared app data
- `EXPO_PUBLIC_DEMO_MODE=false`
- User not logged in

**Steps:**
1. Launch app
2. Complete sign-up flow
3. Navigate to notification onboarding primer screen
4. Tap "Enable Notifications" button
5. **iOS:** Grant permission in system prompt
6. **Android:** Grant permission in system prompt

**Expected Results:**
- [ ] System permission prompt appears
- [ ] After granting: "Notifications enabled" confirmation shown
- [ ] In Supabase `push_tokens` table:
  - [ ] New row created for user
  - [ ] `push_token` is valid ExponentPushToken format
  - [ ] `push_enabled = true`
  - [ ] `push_permission_status = 'granted'`
  - [ ] `device_type` is 'ios' or 'android'
- [ ] Analytics event `push_token_registered` tracked
- [ ] No errors in console

**Failure Criteria:**
- App crashes
- Permission prompt doesn't appear
- Token not saved to database

---

#### Test 1.2: Permission Denied

**Steps:**
1. Launch app (fresh install)
2. Navigate to notification primer
3. Tap "Enable Notifications"
4. **Deny** permission in system prompt

**Expected Results:**
- [ ] App doesn't crash
- [ ] UI shows "Enable in iOS Settings" message
- [ ] In Supabase `push_tokens` table:
  - [ ] Row exists with `push_enabled = false`
  - [ ] `push_permission_status = 'denied'`
- [ ] Analytics event `push_permission_denied` tracked
- [ ] User can continue using app normally

---

#### Test 1.3: Demo Mode Token

**Setup:**
- `EXPO_PUBLIC_DEMO_MODE=true`

**Steps:**
1. Launch app
2. Navigate to notification primer
3. Tap "Enable Notifications"

**Expected Results:**
- [ ] Console log: "[Demo Mode] Skipping real push permission request"
- [ ] Console log: "[Demo Mode] Returning fake push token"
- [ ] Token value is `ExponentPushToken[DEMO-MODE-TOKEN]`
- [ ] Token is NOT saved to Supabase database
- [ ] No system permission prompt appears
- [ ] App continues to function normally

---

### Section 2: Notification Settings UI (Sprint 20)

#### Test 2.1: Load User Preferences

**Setup:**
- User logged in
- Push token registered

**Steps:**
1. Navigate to Settings → Notification Settings
2. Observe loaded values

**Expected Results:**
- [ ] Screen loads without crashing
- [ ] Master toggle shows current state (ON if registered)
- [ ] Severity toggles show:
  - [ ] Critical: ON (default)
  - [ ] Warning: ON (default)
  - [ ] Info: OFF (default)
- [ ] Quiet hours show 22:00 - 08:00 (default)
- [ ] Frequency mode shows "Instant" (default)

---

#### Test 2.2: Toggle Master Switch OFF

**Steps:**
1. Toggle "Enable Push Notifications" to OFF
2. Confirm in alert dialog

**Expected Results:**
- [ ] Alert asks "Disable Notifications?"
- [ ] After confirming:
  - [ ] Toggle switches to OFF
  - [ ] All other controls become disabled/grayed
  - [ ] Database updated: `push_enabled = false`
- [ ] Analytics event `push_notifications_disabled` tracked

---

#### Test 2.3: Toggle Critical Alerts OFF

**Steps:**
1. Toggle "Critical Alerts" to OFF
2. Read alert message
3. Confirm disable

**Expected Results:**
- [ ] Alert warns: "We recommend keeping these on"
- [ ] After confirming:
  - [ ] Toggle switches to OFF
  - [ ] Database updated: `critical_enabled = false`
- [ ] Analytics event `notification_settings_updated` tracked

---

#### Test 2.4: Update Quiet Hours

**Steps:**
1. Tap "Quiet Hours Start" (currently 22:00)
2. Change to 21:00 in picker
3. Tap "Done"
4. Tap "Quiet Hours End" (currently 08:00)
5. Change to 07:00 in picker
6. Tap "Done"

**Expected Results:**
- [ ] **iOS:** Native time picker modal appears
- [ ] **Android:** Native time picker dialog appears
- [ ] After selecting time:
  - [ ] Display updates to show new time
  - [ ] Database updated: `quiet_hours_start = '21:00'`
  - [ ] Database updated: `quiet_hours_end = '07:00'`
- [ ] No crashes on either platform

**Note:** This test verifies the DateTimePicker dependency is installed correctly.

---

#### Test 2.5: Change Frequency Mode

**Steps:**
1. Tap "Frequency Mode" section
2. Select "Batched (9 AM Daily)"
3. Observe change

**Expected Results:**
- [ ] Selection updates immediately
- [ ] Database updated: `frequency_mode = 'batched'`
- [ ] Help text explains: "Non-critical notifications will be sent at 9 AM"

---

### Section 3: Notification Triggering (Sprint 20)

#### Test 3.1: Critical Notification (Immediate Send)

**Setup:**
- User has push enabled
- All severity levels enabled
- Feature flag `push_notifications_enabled = true`

**Steps:**
1. Use Supabase SQL editor or backend script to trigger:
   ```typescript
   import { triggerNotification } from './lib/notification-triggers';

   await triggerNotification({
     userId: 'test-user-id',
     notificationType: 'rate_change',
     severity: 'critical',
     title: '⚠️ Test: Major Rate Change',
     body: 'Your card rate dropped 50%. This is a test notification.',
     data: { screen: 'CardDetail', cardId: 'test-card' }
   });
   ```

**Expected Results:**
- [ ] Notification appears on device immediately
- [ ] Sound plays (if device not on silent)
- [ ] Badge count increases
- [ ] In `push_notification_log`:
  - [ ] Entry created with `notification_type = 'rate_change'`
  - [ ] `severity = 'critical'`
  - [ ] `delivered = true`
  - [ ] `expo_ticket_id` populated
- [ ] Analytics event `push_critical_sent` tracked
- [ ] Notification bypasses quiet hours (test during quiet hours to verify)

---

#### Test 3.2: Warning During Quiet Hours

**Setup:**
- User has quiet hours: 22:00 - 08:00
- Current time is 23:00 (within quiet hours)
- Frequency mode: Instant

**Steps:**
1. Trigger a warning notification at 23:00:
   ```typescript
   await triggerNotification({
     userId: 'test-user-id',
     notificationType: 'rate_change',
     severity: 'warning',
     title: '⚠️ Test: Rate Change',
     body: 'This should be queued, not sent immediately.',
     data: {}
   });
   ```

**Expected Results:**
- [ ] Notification does NOT appear immediately
- [ ] In `notification_queue` table:
  - [ ] Entry created with `status = 'pending'`
  - [ ] `scheduled_for` is set to 08:00 next morning
- [ ] Console log: "[Push] In quiet hours, queuing for later"
- [ ] Analytics event `push_queued_quiet_hours` tracked

**Verification (next morning at 08:00):**
- [ ] Background job sends queued notification
- [ ] Notification appears on device
- [ ] Queue entry updated: `status = 'sent'`

---

#### Test 3.3: Batched Mode

**Setup:**
- User has `frequency_mode = 'batched'`
- Current time is 15:00 (afternoon)

**Steps:**
1. Trigger 3 warning notifications:
   ```typescript
   for (let i = 1; i <= 3; i++) {
     await triggerNotification({
       userId: 'test-user-id',
       notificationType: 'rate_change',
       severity: 'warning',
       title: `Warning ${i}`,
       body: `Test notification ${i}`,
       data: {}
     });
   }
   ```

**Expected Results:**
- [ ] None of the 3 notifications appear immediately
- [ ] In `notification_queue`:
  - [ ] 3 entries created
  - [ ] All have `scheduled_for` set to 09:00 next day
  - [ ] All have `status = 'pending'`
- [ ] Analytics events `push_queued_batched` tracked (3 times)

**Verification (next day at 09:00):**
- [ ] All 3 notifications delivered together
- [ ] All queue entries updated to `status = 'sent'`

---

#### Test 3.4: Severity Filter Blocks Notification

**Setup:**
- User has `info_enabled = false`
- User has `warning_enabled = true`

**Steps:**
1. Trigger an info notification:
   ```typescript
   await triggerNotification({
     userId: 'test-user-id',
     notificationType: 'rate_change',
     severity: 'info',
     title: 'Info Alert',
     body: 'This should be blocked by user preference.',
     data: {}
   });
   ```

**Expected Results:**
- [ ] Notification is NOT sent
- [ ] Notification is NOT queued
- [ ] Console log: "[Push] User disabled info notifications"
- [ ] No entry in `push_notification_log`
- [ ] No entry in `notification_queue`

---

### Section 4: Cap Approaching Alerts (Sprint 20 - F6)

#### Test 4.1: 80% Threshold Triggered

**Setup:**
- User has DBS Woman's World card
- Card has $1,000 monthly cap for groceries
- Current period: February 2026

**Steps:**
1. Log grocery transactions totaling $800:
   ```sql
   INSERT INTO transactions (user_id, card_id, category_id, amount, transaction_date)
   VALUES
     ('user-id', 'dbs-womans-world-id', 'groceries-id', 400, '2026-02-15'),
     ('user-id', 'dbs-womans-world-id', 'groceries-id', 400, '2026-02-18');
   ```

2. Run cap alert check:
   ```typescript
   import { checkCapAlerts } from './lib/cap-alerts';
   await checkCapAlerts('user-id');
   ```

**Expected Results:**
- [ ] Notification appears: "📊 DBS Woman's World: Cap Alert"
- [ ] Body shows: "You've used $800 of $1,000 (80%) for Groceries. Consider switching cards."
- [ ] In `cap_alert_tracking`:
  - [ ] Entry created with `alert_threshold = 80`
  - [ ] `period_start = '2026-02-01'`
  - [ ] `usage_at_alert = 800`
  - [ ] `cap_limit = 1000`
- [ ] Analytics event `cap_alert_sent` tracked

---

#### Test 4.2: No Duplicate Alert

**Setup:**
- Continuing from Test 4.1 (80% alert already sent)

**Steps:**
1. Log additional $50 transaction (now $850 total):
   ```sql
   INSERT INTO transactions (user_id, card_id, category_id, amount, transaction_date)
   VALUES ('user-id', 'dbs-womans-world-id', 'groceries-id', 50, '2026-02-19');
   ```

2. Run cap alert check again:
   ```typescript
   await checkCapAlerts('user-id');
   ```

**Expected Results:**
- [ ] No notification sent (de-duplication works)
- [ ] Console log: Alert already sent for this threshold
- [ ] No new entry in `cap_alert_tracking`
- [ ] No new entry in `push_notification_log`

---

#### Test 4.3: Alternative Card Suggestions

**Setup:**
- User has:
  - DBS Woman's World (cap reached for groceries)
  - HSBC Revolution (no cap, 4 mpd for groceries)
  - Citi Rewards (cap not reached, 2 mpd)

**Steps:**
1. Trigger 80% cap alert for DBS Woman's World

**Expected Results:**
- [ ] Notification body includes: "Try HSBC Revolution instead (4x)"
- [ ] Notification data includes `alternatives` array:
  ```json
  {
    "alternatives": [
      { "id": "hsbc-revolution-id", "name": "HSBC Revolution", "rate": 4 },
      { "id": "citi-rewards-id", "name": "Citi Rewards", "rate": 2 }
    ]
  }
  ```
- [ ] Tapping notification navigates to Caps tab

---

### Section 5: Deep Linking (Sprint 20)

#### Test 5.1: Rate Change → Card Detail

**Steps:**
1. Send rate change notification with card ID:
   ```typescript
   await triggerNotification({
     userId: 'user-id',
     notificationType: 'rate_change',
     severity: 'critical',
     title: 'DBS Card Changed',
     body: 'Rate dropped from 4 mpd to 2 mpd',
     data: {
       screen: 'CardDetail',
       cardId: 'dbs-womans-world-id',
       rateChangeId: 'rate-change-123'
     }
   });
   ```

2. Wait for notification to appear
3. Tap notification

**Expected Results:**
- [ ] App opens (if in background)
- [ ] App navigates to `/card/[id]` with correct card ID
- [ ] Card detail screen opens showing DBS Woman's World
- [ ] Badge count decreases by 1
- [ ] Analytics event `notification_tap_card_detail` tracked with:
  - `card_id = 'dbs-womans-world-id'`
  - `rate_change_id = 'rate-change-123'`

---

#### Test 5.2: Cap Alert → Cap Status

**Steps:**
1. Send cap alert notification
2. Tap notification

**Expected Results:**
- [ ] App navigates to `/(tabs)/caps`
- [ ] Caps tab is active
- [ ] Badge count decreases
- [ ] Analytics event `notification_tap_cap_status` tracked

---

#### Test 5.3: Invalid Deep Link (Error Handling)

**Steps:**
1. Send notification with invalid screen:
   ```typescript
   data: { screen: 'InvalidScreen', cardId: 'test' }
   ```
2. Tap notification

**Expected Results:**
- [ ] App doesn't crash
- [ ] App navigates to home screen `/(tabs)`
- [ ] Console log: "[Deep Link] No specific route, navigating to home"
- [ ] Analytics event `notification_deep_link_error` NOT tracked (graceful fallback)

---

### Section 6: Demo Mode (Sprint 20)

#### Test 6.1: Auto-Trigger on Miles Tab (First Visit)

**Setup:**
- `EXPO_PUBLIC_DEMO_MODE=true`
- Fresh app install OR demo state reset

**Steps:**
1. Launch app
2. Navigate to Miles tab for the first time
3. Wait 2 seconds

**Expected Results:**
- [ ] Demo notification appears after 2-second delay
- [ ] Notification type: Critical rate change
- [ ] Notification slides down with animation
- [ ] Console log: "[Demo Mode] Auto-triggering notification"
- [ ] AsyncStorage flag set: `demo_miles_notification_shown = true`

---

#### Test 6.2: No Auto-Trigger on Subsequent Visits

**Setup:**
- Continuing from Test 6.1 (flag already set)

**Steps:**
1. Navigate away from Miles tab
2. Navigate back to Miles tab
3. Wait 2 seconds

**Expected Results:**
- [ ] No notification appears (already shown once)
- [ ] Console log: "[Demo Mode] Notification already shown, skipping"

---

#### Test 6.3: Manual Demo Triggers

**Steps:**
1. Navigate to Demo Controls screen (`/demo-controls`)
2. Tap "Critical Rate Change" button
3. Wait for notification to appear
4. Swipe up to dismiss
5. Tap "Warning: Cap Reduced" button
6. Wait for notification to appear
7. Tap notification to dismiss

**Expected Results:**
- [ ] Each notification appears correctly:
  - [ ] Critical: ⚠️ icon, red accent
  - [ ] Warning: ⚠️ icon, amber accent
- [ ] Swipe up gesture dismisses notification
- [ ] Tap gesture dismisses notification
- [ ] Notifications don't overlap (queue system works)
- [ ] Each notification auto-dismisses after 4 seconds

---

#### Test 6.4: Demo Notification Sequence

**Steps:**
1. In Demo Controls screen
2. Tap "Play Feature Showcase Sequence"
3. Confirm in alert dialog

**Expected Results:**
- [ ] Alert shows: "This will show 5 notifications over 24 seconds"
- [ ] After confirming:
  - [ ] 1st notification appears immediately
  - [ ] 2nd notification appears 6 seconds later
  - [ ] 3rd notification appears 12 seconds later
  - [ ] 4th notification appears 18 seconds later
  - [ ] 5th notification appears 24 seconds later
- [ ] Each notification auto-dismisses
- [ ] No overlapping notifications
- [ ] Sequence completes successfully

---

#### Test 6.5: Demo Mode Safety (CRITICAL)

**Setup:**
- `EXPO_PUBLIC_DEMO_MODE=false` (production build)

**Steps:**
1. Build production app
2. Try to navigate to `/demo-controls`
3. Try to trigger demo notification (via code injection)

**Expected Results:**
- [ ] Demo Controls screen shows: "Demo controls are only available in demo builds"
- [ ] No demo notification rendering (returns null)
- [ ] Console log: "[DemoNotificationPreview] Attempted to render in production mode - blocked"
- [ ] App continues to function normally
- [ ] No crashes or errors

**Verification:**
```typescript
// Check in code:
process.env.EXPO_PUBLIC_DEMO_MODE === 'false'  // ✓ Confirmed
```

---

### Section 7: Notification History (Sprint 20)

#### Test 7.1: View Notification History

**Setup:**
- User has received 5+ notifications

**Steps:**
1. Navigate to Settings → Notification History
2. Scroll through list

**Expected Results:**
- [ ] Screen loads without crashing
- [ ] Notifications displayed in reverse chronological order (newest first)
- [ ] Each notification shows:
  - [ ] Icon based on type
  - [ ] Title
  - [ ] Body (truncated if long)
  - [ ] Timestamp (relative: "2 hours ago")
- [ ] Tapping a notification item navigates to relevant screen

---

#### Test 7.2: Empty State

**Setup:**
- User has never received notifications

**Steps:**
1. Navigate to Notification History

**Expected Results:**
- [ ] Empty state message: "No notifications yet"
- [ ] Helpful text: "Rate change alerts will appear here"

---

#### Test 7.3: Clear History

**Steps:**
1. In Notification History screen
2. Tap "Clear All" button
3. Confirm in alert dialog

**Expected Results:**
- [ ] Alert asks: "Clear all notification history?"
- [ ] After confirming:
  - [ ] All notifications removed from view
  - [ ] Database cleared (but only for this user)
  - [ ] Empty state appears
- [ ] Analytics event `notification_history_cleared` tracked

---

### Section 8: Edge Cases & Error Handling

#### Test 8.1: Network Offline (Notification Send)

**Steps:**
1. Turn off device WiFi and cellular
2. Trigger notification
3. Wait 10 seconds
4. Turn network back on

**Expected Results:**
- [ ] Notification attempt logged with error
- [ ] Edge Function retries (if retry logic implemented)
- [ ] User doesn't see error message
- [ ] App continues to function

---

#### Test 8.2: Invalid Push Token

**Setup:**
- Manually corrupt push token in database:
  ```sql
  UPDATE push_tokens
  SET push_token = 'invalid-token-12345'
  WHERE user_id = 'test-user-id';
  ```

**Steps:**
1. Trigger notification for this user

**Expected Results:**
- [ ] Expo API returns error: "DeviceNotRegistered"
- [ ] Error logged in `push_notification_log` with `delivered = false`
- [ ] Error message recorded
- [ ] App prompts user to re-register (optional)

---

#### Test 8.3: Rate Limit Exceeded

**Steps:**
1. Send 101 notifications to the same user in 24 hours

**Expected Results:**
- [ ] First 100 notifications succeed
- [ ] 101st notification is blocked
- [ ] Edge Function returns 429 status
- [ ] Error message: "Daily notification limit exceeded"
- [ ] User doesn't see error (silent fail)

---

## Test Results Template

Use this template to record test results:

```
Test ID: [e.g., 3.1]
Test Name: [e.g., Critical Notification - Immediate Send]
Date: [e.g., 2026-02-22]
Tester: [Your Name]
Environment: [Staging / Development]
Device: [e.g., iPhone 15 Pro, iOS 17.2]

PASS / FAIL / BLOCKED

Notes:
- [Any observations]
- [Issues found]
- [Screenshots attached: Yes/No]

Defects Filed:
- [Link to bug report if any]
```

---

## Appendix: Quick Commands

### Trigger Test Notification (Supabase SQL Editor)

```sql
-- Insert test rate change
INSERT INTO rate_changes (
  id, card_id, old_rate, new_rate, change_type,
  change_summary, severity, effective_date
)
VALUES (
  gen_random_uuid(),
  '[your-card-id]',
  4.0,
  2.0,
  'rate_decrease',
  'Earn rate dropped from 4 mpd to 2 mpd',
  'critical',
  NOW()
);

-- Call Edge Function to send notification
-- (Use HTTP client like Postman or curl)
```

### Reset Demo State

```bash
# Clear AsyncStorage demo flags
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.removeItem('demo_miles_notification_shown');
await AsyncStorage.removeItem('demo_auto_capture_notification_shown');
```

### Check Feature Flags

```sql
SELECT flag_name, enabled
FROM feature_flags
WHERE flag_name LIKE 'push%';
```

### View Recent Notifications

```sql
SELECT
  notification_type,
  severity,
  title,
  body,
  delivered,
  sent_at
FROM push_notification_log
WHERE user_id = '[your-user-id]'
ORDER BY sent_at DESC
LIMIT 10;
```

---

## Sign-Off

**Tester Name:** _________________

**Date:** _________________

**Tests Passed:** _____ / _____

**Tests Failed:** _____ / _____

**Ready for Production:** YES / NO

**Notes:**

---
