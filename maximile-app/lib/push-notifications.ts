/**
 * Push Notifications Library
 * Sprint 19: Push Notification Foundation
 *
 * Handles device push token registration, permission management,
 * and notification handling for Expo push notifications.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from './supabase';
import { trackEvent } from './analytics';

// ============================================================================
// Types
// ============================================================================

export interface PushToken {
  token: string;
  enabled: boolean;
  permissionStatus: 'granted' | 'denied' | 'undecided';
}

export interface PushNotificationData {
  screen?: string;
  cardId?: string;
  rateChangeId?: string;
  type?: string;
  [key: string]: any;
}

// ============================================================================
// Configuration
// ============================================================================

// Configure how notifications are presented when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Show notification banner
    shouldPlaySound: false, // Silent by default (configurable in future)
    shouldSetBadge: true, // Update app icon badge
  }),
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if we're running in demo mode
 */
function isDemoMode(): boolean {
  return process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
}

/**
 * Check if device supports push notifications
 */
export function isPushNotificationSupported(): boolean {
  // For now, assume all devices support push
  // In production, we'd check Device.isDevice to exclude emulators
  // but for development/testing we'll allow it
  return true;
}

/**
 * Request push notification permissions from the OS
 */
async function requestPermissions(): Promise<Notifications.PermissionStatus> {
  // In demo mode, don't request real permissions
  if (isDemoMode()) {
    console.log('[Demo Mode] Skipping real push permission request');
    return 'undetermined';
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus;
}

/**
 * Get Expo push token for this device
 */
async function getExpoPushToken(): Promise<string | null> {
  // In demo mode, return a fake token
  if (isDemoMode()) {
    console.log('[Demo Mode] Returning fake push token');
    return 'ExponentPushToken[DEMO-MODE-TOKEN]';
  }

  if (!isPushNotificationSupported()) {
    console.warn('Push notifications are not supported on this device');
    return null;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return token.data;
  } catch (error) {
    console.error('Failed to get push token:', error);
    return null;
  }
}

/**
 * Save push token to Supabase
 */
async function savePushToken(
  userId: string,
  token: string,
  permissionStatus: 'granted' | 'denied' | 'undecided'
): Promise<boolean> {
  try {
    const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';

    const { error } = await supabase.rpc('upsert_push_token', {
      p_user_id: userId,
      p_push_token: token,
      p_device_type: deviceType,
      p_push_enabled: permissionStatus === 'granted',
      p_permission_status: permissionStatus,
    });

    if (error) {
      console.error('Failed to save push token:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception saving push token:', error);
    return false;
  }
}

// ============================================================================
// Main Hook
// ============================================================================

export interface UsePushNotificationsResult {
  /** Current push token (null if not registered) */
  pushToken: string | null;
  /** Whether push notifications are enabled */
  isEnabled: boolean;
  /** Current permission status */
  permissionStatus: Notifications.PermissionStatus | null;
  /** Whether we're currently registering */
  isRegistering: boolean;
  /** Register for push notifications (request permission + get token) */
  registerForPushNotifications: () => Promise<boolean>;
  /** Disable push notifications */
  disablePushNotifications: () => Promise<void>;
  /** Re-check and update token if changed */
  refreshToken: () => Promise<void>;
}

/**
 * Hook for managing push notification registration and token handling
 *
 * @param userId - The current user's ID (required for saving token)
 * @param autoRegister - Whether to automatically register on mount (default: false)
 */
export function usePushNotifications(
  userId: string | null,
  autoRegister = false
): UsePushNotificationsResult {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Track if we've already auto-registered to prevent duplicate calls
  const hasAutoRegistered = useRef(false);

  /**
   * Main registration function
   */
  const registerForPushNotifications = useCallback(async (): Promise<boolean> => {
    if (!userId) {
      console.warn('Cannot register for push notifications without userId');
      return false;
    }

    if (isRegistering) {
      console.log('Registration already in progress');
      return false;
    }

    setIsRegistering(true);

    try {
      // Track analytics event
      trackEvent('push_permission_requested', {
        platform: Platform.OS,
        demo_mode: isDemoMode(),
      });

      // Step 1: Request permissions
      const status = await requestPermissions();
      setPermissionStatus(status);

      if (status !== 'granted') {
        trackEvent('push_permission_denied', {
          status,
          platform: Platform.OS,
        });

        // Save the denial status
        if (!isDemoMode()) {
          await savePushToken(userId, '', 'denied');
        }

        setIsRegistering(false);
        return false;
      }

      // Step 2: Get Expo push token
      const token = await getExpoPushToken();

      if (!token) {
        console.error('Failed to get push token');
        setIsRegistering(false);
        return false;
      }

      setPushToken(token);
      setIsEnabled(true);

      // Step 3: Save to database (skip in demo mode)
      if (!isDemoMode()) {
        const saved = await savePushToken(userId, token, 'granted');

        if (saved) {
          trackEvent('push_token_registered', {
            platform: Platform.OS,
            token_length: token.length,
          });
        } else {
          trackEvent('push_token_save_failed', {
            platform: Platform.OS,
          });
        }
      } else {
        trackEvent('push_token_registered', {
          platform: Platform.OS,
          demo_mode: true,
        });
      }

      setIsRegistering(false);
      return true;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      trackEvent('push_registration_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        platform: Platform.OS,
      });
      setIsRegistering(false);
      return false;
    }
  }, [userId, isRegistering]);

  /**
   * Disable push notifications
   */
  const disablePushNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      // Don't actually disable in demo mode
      if (!isDemoMode()) {
        await supabase.rpc('disable_push_notifications', {
          p_user_id: userId,
        });
      }

      setIsEnabled(false);
      setPushToken(null);

      trackEvent('push_notifications_disabled', {
        platform: Platform.OS,
        demo_mode: isDemoMode(),
      });
    } catch (error) {
      console.error('Error disabling push notifications:', error);
    }
  }, [userId]);

  /**
   * Refresh token (check if it changed and update if needed)
   */
  const refreshToken = useCallback(async () => {
    if (!userId || !isEnabled) return;

    try {
      const newToken = await getExpoPushToken();

      if (newToken && newToken !== pushToken) {
        setPushToken(newToken);

        if (!isDemoMode()) {
          await savePushToken(userId, newToken, 'granted');
        }

        trackEvent('push_token_refreshed', {
          platform: Platform.OS,
          demo_mode: isDemoMode(),
        });
      }
    } catch (error) {
      console.error('Error refreshing push token:', error);
    }
  }, [userId, isEnabled, pushToken]);

  /**
   * Auto-register on mount if requested
   */
  useEffect(() => {
    if (autoRegister && userId && !hasAutoRegistered.current) {
      hasAutoRegistered.current = true;
      registerForPushNotifications();
    }
  }, [autoRegister, userId, registerForPushNotifications]);

  /**
   * Refresh token when app resumes (in case it changed)
   */
  useEffect(() => {
    if (!userId) return;

    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      refreshToken();
    });

    return () => subscription.remove();
  }, [userId, refreshToken]);

  return {
    pushToken,
    isEnabled,
    permissionStatus,
    isRegistering,
    registerForPushNotifications,
    disablePushNotifications,
    refreshToken,
  };
}

// ============================================================================
// Notification Handlers
// ============================================================================

/**
 * Set up notification received listener (in-app)
 */
export function setupNotificationReceivedListener(
  handler: (notification: Notifications.Notification) => void
): () => void {
  const subscription = Notifications.addNotificationReceivedListener(handler);
  return () => subscription.remove();
}

/**
 * Set up notification response listener (user tapped notification)
 */
export function setupNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void
): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(handler);
  return () => subscription.remove();
}

/**
 * Get notification data from response
 */
export function getNotificationData(
  response: Notifications.NotificationResponse
): PushNotificationData {
  return response.notification.request.content.data as PushNotificationData;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Schedule a local notification (useful for testing)
 */
export async function scheduleTestNotification(
  title: string,
  body: string,
  data?: PushNotificationData,
  delaySeconds = 1
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: false,
    },
    trigger: {
      seconds: delaySeconds,
    },
  });

  return notificationId;
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear badge
 */
export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}
