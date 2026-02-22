/**
 * Notification Triggering System
 * Sprint 20: Push Notifications - Complete System
 *
 * Monitors database for events that should trigger push notifications:
 * - Rate changes (critical, warning, info)
 * - Cap approaching (80% threshold)
 * - Daily digest summaries
 *
 * Implements smart features:
 * - Severity-based filtering
 * - Quiet hours (10 PM - 8 AM)
 * - Batching (9 AM digest for warnings)
 * - User preference respect
 * - Feature flag gating
 */

import { supabase } from './supabase';
import { trackEvent } from './analytics';

// ============================================================================
// Types
// ============================================================================

export type NotificationSeverity = 'critical' | 'warning' | 'info';
export type NotificationType = 'rate_change' | 'cap_approaching' | 'digest';

export interface RateChange {
  id: string;
  card_id: string;
  card_name: string;
  category_name: string;
  old_rate: number;
  new_rate: number;
  change_type: string;
  change_summary: string;
  severity: NotificationSeverity;
  effective_date: string;
  detected_at: string;
}

export interface NotificationPayload {
  userId: string;
  notificationType: NotificationType;
  severity: NotificationSeverity;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface UserNotificationPreferences {
  push_enabled: boolean;
  push_permission_status: string;
  critical_enabled: boolean;
  warning_enabled: boolean;
  info_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  frequency_mode: 'instant' | 'batched' | 'digest';
}

// ============================================================================
// Configuration
// ============================================================================

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/send-push-notification`;

const DIGEST_HOUR = 9; // 9 AM daily digest

// ============================================================================
// Feature Flag Check
// ============================================================================

/**
 * Check if push notifications are enabled globally
 */
export async function isPushNotificationsEnabled(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_feature_enabled', {
      p_flag_name: 'push_notifications_enabled',
    });

    if (error) {
      console.error('Error checking feature flag:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Exception checking feature flag:', error);
    return false;
  }
}

// ============================================================================
// User Preference Checking
// ============================================================================

/**
 * Get user's notification preferences
 */
export async function getUserNotificationPreferences(
  userId: string
): Promise<UserNotificationPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('push_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      push_enabled: data.push_enabled,
      push_permission_status: data.push_permission_status,
      critical_enabled: data.critical_enabled ?? true,
      warning_enabled: data.warning_enabled ?? true,
      info_enabled: data.info_enabled ?? false,
      quiet_hours_start: data.quiet_hours_start ?? '22:00',
      quiet_hours_end: data.quiet_hours_end ?? '08:00',
      frequency_mode: (data.frequency_mode as any) ?? 'instant',
    };
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
}

/**
 * Check if user wants to receive this severity of notification
 */
export function shouldNotifyBySeverity(
  prefs: UserNotificationPreferences,
  severity: NotificationSeverity
): boolean {
  switch (severity) {
    case 'critical':
      return prefs.critical_enabled; // Critical always on by default
    case 'warning':
      return prefs.warning_enabled;
    case 'info':
      return prefs.info_enabled;
    default:
      return false;
  }
}

/**
 * Check if current time is within user's quiet hours
 */
export function isInQuietHours(
  prefs: UserNotificationPreferences,
  checkTime: Date = new Date()
): boolean {
  const currentHour = checkTime.getHours();
  const currentMinute = checkTime.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  // Parse quiet hours
  const [startHour, startMinute] = prefs.quiet_hours_start.split(':').map(Number);
  const [endHour, endMinute] = prefs.quiet_hours_end.split(':').map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  // Handle overnight quiet hours (e.g., 22:00 - 08:00)
  if (startMinutes > endMinutes) {
    return currentTimeMinutes >= startMinutes || currentTimeMinutes < endMinutes;
  } else {
    return currentTimeMinutes >= startMinutes && currentTimeMinutes < endMinutes;
  }
}

// ============================================================================
// Notification Sending
// ============================================================================

/**
 * Send notification via Edge Function
 */
export async function sendNotification(
  payload: NotificationPayload
): Promise<boolean> {
  try {
    // Get current session for auth
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      console.error('No auth token available');
      return false;
    }

    // Call Edge Function
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: payload.userId,
        notification_type: payload.notificationType,
        severity: payload.severity,
        title: payload.title,
        body: payload.body,
        data: payload.data,
      }),
    });

    if (!response.ok) {
      console.error('Edge function error:', response.status, await response.text());
      return false;
    }

    const result = await response.json();
    return result.sent > 0;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

/**
 * Queue notification for later delivery (batched/digest mode)
 */
export async function queueNotification(
  payload: NotificationPayload,
  scheduledFor: Date
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('queue_notification', {
      p_user_id: payload.userId,
      p_notification_type: payload.notificationType,
      p_severity: payload.severity,
      p_title: payload.title,
      p_body: payload.body,
      p_data: payload.data || null,
      p_scheduled_for: scheduledFor.toISOString(),
    });

    if (error) {
      console.error('Error queuing notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception queuing notification:', error);
    return false;
  }
}

// ============================================================================
// Smart Notification Delivery
// ============================================================================

/**
 * Trigger notification with smart delivery logic
 * - Respects user preferences
 * - Handles quiet hours
 * - Implements batching
 */
export async function triggerNotification(
  payload: NotificationPayload
): Promise<boolean> {
  try {
    // Check global feature flag
    const enabled = await isPushNotificationsEnabled();
    if (!enabled) {
      console.log('[Push] Feature disabled, skipping notification');
      return false;
    }

    // Get user preferences
    const prefs = await getUserNotificationPreferences(payload.userId);
    if (!prefs) {
      console.log('[Push] No preferences found for user');
      return false;
    }

    // Check if push is enabled for user
    if (!prefs.push_enabled || prefs.push_permission_status !== 'granted') {
      console.log('[Push] Push disabled or not granted for user');
      return false;
    }

    // Check severity filter
    if (!shouldNotifyBySeverity(prefs, payload.severity)) {
      console.log(`[Push] User disabled ${payload.severity} notifications`);
      return false;
    }

    // Critical notifications bypass quiet hours and batching
    if (payload.severity === 'critical') {
      trackEvent('push_critical_sent', {
        type: payload.notificationType,
        user_id: payload.userId,
      });
      return await sendNotification(payload);
    }

    // Check quiet hours
    if (isInQuietHours(prefs)) {
      console.log('[Push] In quiet hours, queuing for later');
      // Schedule for end of quiet hours
      const scheduledTime = getEndOfQuietHours(prefs);
      trackEvent('push_queued_quiet_hours', {
        type: payload.notificationType,
        severity: payload.severity,
      });
      return await queueNotification(payload, scheduledTime);
    }

    // Handle frequency mode
    if (prefs.frequency_mode === 'batched' && payload.severity !== 'critical') {
      // Queue for 9 AM digest
      const digestTime = getNextDigestTime();
      trackEvent('push_queued_batched', {
        type: payload.notificationType,
        severity: payload.severity,
      });
      return await queueNotification(payload, digestTime);
    }

    if (prefs.frequency_mode === 'digest') {
      // Queue for daily digest
      const digestTime = getNextDigestTime();
      trackEvent('push_queued_digest', {
        type: payload.notificationType,
        severity: payload.severity,
      });
      return await queueNotification(payload, digestTime);
    }

    // Instant delivery
    trackEvent('push_sent_instant', {
      type: payload.notificationType,
      severity: payload.severity,
    });
    return await sendNotification(payload);
  } catch (error) {
    console.error('Error triggering notification:', error);
    trackEvent('push_trigger_error', {
      error: error instanceof Error ? error.message : 'Unknown',
    });
    return false;
  }
}

// ============================================================================
// Notification Builders
// ============================================================================

/**
 * Build notification payload for rate change
 */
export function buildRateChangeNotification(
  userId: string,
  rateChange: RateChange
): NotificationPayload {
  let title: string;
  let body: string;

  if (rateChange.severity === 'critical') {
    title = `⚠️ ${rateChange.card_name}: Major Change`;
    body = `${rateChange.change_summary}. Tap to see alternatives.`;
  } else if (rateChange.severity === 'warning') {
    title = `⚠️ ${rateChange.card_name}: Rate Change`;
    body = `${rateChange.change_summary}. Review your strategy.`;
  } else {
    title = `✨ ${rateChange.card_name}: Update`;
    body = rateChange.change_summary;
  }

  return {
    userId,
    notificationType: 'rate_change',
    severity: rateChange.severity,
    title,
    body,
    data: {
      screen: 'CardDetail',
      cardId: rateChange.card_id,
      rateChangeId: rateChange.id,
      type: 'rate_change',
    },
  };
}

/**
 * Build notification payload for cap approaching
 */
export function buildCapApproachingNotification(
  userId: string,
  cardName: string,
  cardId: string,
  categoryName: string,
  usage: number,
  limit: number,
  percentage: number
): NotificationPayload {
  const title = `💳 ${cardName}: Cap Alert`;
  const body = `You've used $${usage.toFixed(0)} of $${limit.toFixed(0)} (${percentage}%) for ${categoryName}. Consider switching cards.`;

  return {
    userId,
    notificationType: 'cap_approaching',
    severity: percentage >= 90 ? 'warning' : 'info',
    title,
    body,
    data: {
      screen: 'CapStatus',
      cardId,
      type: 'cap_approaching',
    },
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the end of current quiet hours
 */
function getEndOfQuietHours(prefs: UserNotificationPreferences): Date {
  const now = new Date();
  const [endHour, endMinute] = prefs.quiet_hours_end.split(':').map(Number);

  const endTime = new Date(now);
  endTime.setHours(endHour, endMinute, 0, 0);

  // If end time is before now, it's tomorrow
  if (endTime <= now) {
    endTime.setDate(endTime.getDate() + 1);
  }

  return endTime;
}

/**
 * Get the next digest delivery time (9 AM)
 */
function getNextDigestTime(): Date {
  const now = new Date();
  const digestTime = new Date(now);
  digestTime.setHours(DIGEST_HOUR, 0, 0, 0);

  // If 9 AM already passed today, schedule for tomorrow
  if (digestTime <= now) {
    digestTime.setDate(digestTime.getDate() + 1);
  }

  return digestTime;
}

// ============================================================================
// Rate Change Monitoring
// ============================================================================

/**
 * Monitor for new rate changes and trigger notifications
 * This should be called by a background job or webhook
 */
export async function checkForRateChanges(userId: string): Promise<void> {
  try {
    // Get rate changes from last 24 hours that haven't been notified
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: rateChanges, error } = await supabase
      .from('rate_changes')
      .select(`
        id,
        card_id,
        old_rate,
        new_rate,
        change_type,
        change_summary,
        severity,
        effective_date,
        detected_at,
        cards!inner(id, name, user_id),
        categories!inner(id, name)
      `)
      .eq('cards.user_id', userId)
      .gte('detected_at', oneDayAgo.toISOString())
      .is('notified_at', null)
      .order('detected_at', { ascending: false });

    if (error) {
      console.error('Error fetching rate changes:', error);
      return;
    }

    if (!rateChanges || rateChanges.length === 0) {
      return;
    }

    // Trigger notification for each rate change
    for (const change of rateChanges) {
      const rateChange: RateChange = {
        id: change.id,
        card_id: change.card_id,
        card_name: (change.cards as any).name,
        category_name: (change.categories as any).name,
        old_rate: change.old_rate,
        new_rate: change.new_rate,
        change_type: change.change_type,
        change_summary: change.change_summary,
        severity: change.severity as NotificationSeverity,
        effective_date: change.effective_date,
        detected_at: change.detected_at,
      };

      const payload = buildRateChangeNotification(userId, rateChange);
      const sent = await triggerNotification(payload);

      // Mark as notified
      if (sent) {
        await supabase
          .from('rate_changes')
          .update({ notified_at: new Date().toISOString() })
          .eq('id', change.id);
      }
    }
  } catch (error) {
    console.error('Error checking rate changes:', error);
  }
}
