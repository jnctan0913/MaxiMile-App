/**
 * Notification Deep Linking
 * Sprint 20: Push Notifications - Complete System
 *
 * Handles navigation when user taps on a push notification.
 * Routes to appropriate screens based on notification type and data.
 *
 * Supported deep links:
 * - Rate Change → Card Detail Screen
 * - Cap Approaching → Cap Status Screen
 * - Multiple Changes → Rate Changes List
 * - Digest → Notification History
 */

import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { trackEvent } from './analytics';
import { clearBadge } from './push-notifications';

// ============================================================================
// Types
// ============================================================================

export interface NotificationData {
  screen?: string;
  cardId?: string;
  rateChangeId?: string;
  categoryId?: string;
  type?: string;
  isTest?: boolean;
  [key: string]: any;
}

// ============================================================================
// Navigation Handlers
// ============================================================================

/**
 * Navigate to Card Detail screen
 */
function navigateToCardDetail(cardId: string, rateChangeId?: string): void {
  trackEvent('notification_tap_card_detail', {
    card_id: cardId,
    rate_change_id: rateChangeId,
  });

  router.push({
    pathname: '/card/[id]',
    params: {
      id: cardId,
      highlight: rateChangeId || '',
    },
  });
}

/**
 * Navigate to Cap Status screen
 */
function navigateToCapStatus(cardId?: string): void {
  trackEvent('notification_tap_cap_status', {
    card_id: cardId,
  });

  // Navigate to caps tab
  router.push('/(tabs)/caps');
}

/**
 * Navigate to Notification History screen
 */
function navigateToNotificationHistory(): void {
  trackEvent('notification_tap_history');

  router.push('/notification-history');
}

/**
 * Navigate to Rate Changes List
 * (Future: when we have a dedicated rate changes screen)
 */
function navigateToRateChanges(): void {
  trackEvent('notification_tap_rate_changes');

  // For now, navigate to home (cards tab)
  // In future, create a dedicated rate changes screen
  router.push('/(tabs)/cards');
}

// ============================================================================
// Deep Link Parser
// ============================================================================

/**
 * Parse notification data and navigate to appropriate screen
 */
export function handleNotificationDeepLink(data: NotificationData): void {
  try {
    console.log('[Deep Link] Handling notification tap:', data);

    // Track the notification tap
    trackEvent('notification_tapped', {
      type: data.type || 'unknown',
      screen: data.screen || 'unknown',
      is_test: data.isTest || false,
    });

    // Clear badge when user interacts with notification
    clearBadge();

    // Route based on screen or type
    const screen = data.screen || '';
    const type = data.type || '';

    // Card Detail
    if (screen === 'CardDetail' || type === 'rate_change') {
      if (data.cardId) {
        navigateToCardDetail(data.cardId, data.rateChangeId);
        return;
      }
    }

    // Cap Status
    if (screen === 'CapStatus' || type === 'cap_approaching') {
      navigateToCapStatus(data.cardId);
      return;
    }

    // Rate Changes List
    if (screen === 'RateChanges' || type === 'multiple_changes') {
      navigateToRateChanges();
      return;
    }

    // Notification History / Digest
    if (screen === 'NotificationHistory' || type === 'digest') {
      navigateToNotificationHistory();
      return;
    }

    // Default: navigate to home if no specific screen
    console.log('[Deep Link] No specific route, navigating to home');
    router.push('/(tabs)');
  } catch (error) {
    console.error('[Deep Link] Error handling notification:', error);
    trackEvent('notification_deep_link_error', {
      error: error instanceof Error ? error.message : 'Unknown',
    });

    // Fallback to home on error
    router.push('/(tabs)');
  }
}

// ============================================================================
// Notification Response Listener Setup
// ============================================================================

/**
 * Set up listener for notification taps
 * Call this once in your root layout
 */
export function setupNotificationResponseListener(): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data as NotificationData;

      // Small delay to ensure app is ready for navigation
      setTimeout(() => {
        handleNotificationDeepLink(data);
      }, 100);
    }
  );

  return () => subscription.remove();
}

// ============================================================================
// Foreground Notification Handler
// ============================================================================

/**
 * Handle notification received while app is in foreground
 * Can optionally show an in-app banner instead of system notification
 */
export function handleForegroundNotification(
  notification: Notifications.Notification
): void {
  const data = notification.request.content.data as NotificationData;

  trackEvent('notification_received_foreground', {
    type: data.type || 'unknown',
  });

  console.log('[Foreground Notification]', {
    title: notification.request.content.title,
    body: notification.request.content.body,
    data,
  });

  // For critical notifications, could show a custom in-app alert
  // For now, we let the default handler show the system notification
}

/**
 * Set up listener for foreground notifications
 */
export function setupForegroundNotificationListener(): () => void {
  const subscription = Notifications.addNotificationReceivedListener(
    handleForegroundNotification
  );

  return () => subscription.remove();
}

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Simulate a notification tap (for testing deep links)
 */
export function simulateNotificationTap(data: NotificationData): void {
  console.log('[Test] Simulating notification tap:', data);
  handleNotificationDeepLink(data);
}

/**
 * Test deep link for rate change notification
 */
export function testRateChangeDeepLink(cardId: string, rateChangeId: string): void {
  simulateNotificationTap({
    screen: 'CardDetail',
    cardId,
    rateChangeId,
    type: 'rate_change',
    isTest: true,
  });
}

/**
 * Test deep link for cap approaching notification
 */
export function testCapApproachingDeepLink(cardId: string): void {
  simulateNotificationTap({
    screen: 'CapStatus',
    cardId,
    type: 'cap_approaching',
    isTest: true,
  });
}
