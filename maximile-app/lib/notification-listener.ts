// =============================================================================
// MaxiMile — Android NotificationListenerService Wrapper (S17.1)
// =============================================================================
// Listens for banking app notifications and forwards them for parsing.
// Uses react-native-notification-listener package.
// =============================================================================

import { Platform } from 'react-native';
import RNNotificationListener from 'react-native-notification-listener';

// =============================================================================
// Banking App Package Whitelist
// =============================================================================

/**
 * Whitelist of Singapore banking app package names.
 * Only notifications from these apps will be processed.
 */
const BANKING_APP_PACKAGES = [
  // DBS / POSB
  'com.dbs.sg.dbsmbanking',
  'com.dbs.sg.posb',

  // OCBC
  'com.ocbc.mobile',

  // UOB
  'com.uob.mightymobile',

  // Citibank
  'com.citi.citimobilesg',

  // American Express
  'com.americanexpress.android.acctsvcs.sg',

  // Google Pay
  'com.google.android.apps.walletnfcrel',

  // Samsung Pay
  'com.samsung.android.spay',
];

// =============================================================================
// Notification Data Interface
// =============================================================================

export interface BankingNotification {
  /** Package name of the app that sent the notification */
  packageName: string;

  /** Notification title */
  title: string;

  /** Notification main text */
  text: string;

  /** Notification sub-text (optional) */
  subText?: string;

  /** Big text (expanded notification) */
  bigText?: string;

  /** Timestamp when notification was received */
  timestamp: number;
}

// =============================================================================
// Notification Listener Service
// =============================================================================

export class NotificationListenerService {
  private isListening: boolean = false;
  private listener: any = null;

  /**
   * Check if the app has notification listener permission.
   */
  async hasPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      const status = await RNNotificationListener.getPermissionStatus();
      return status === 'authorized';
    } catch (error) {
      console.error('[NotificationListener] Error checking permission:', error);
      return false;
    }
  }

  /**
   * Request notification listener permission.
   * Opens Android Settings for the user to grant access.
   */
  async requestPermission(): Promise<void> {
    if (Platform.OS !== 'android') {
      throw new Error('NotificationListener is only available on Android');
    }

    try {
      await RNNotificationListener.requestPermission();
    } catch (error) {
      console.error('[NotificationListener] Error requesting permission:', error);
      throw error;
    }
  }

  /**
   * Start listening for banking app notifications.
   *
   * @param onNotification - Callback function called when a banking notification is received
   */
  async startListening(onNotification: (notification: BankingNotification) => void): Promise<void> {
    if (Platform.OS !== 'android') {
      console.warn('[NotificationListener] Not available on this platform');
      return;
    }

    if (this.isListening) {
      console.warn('[NotificationListener] Already listening');
      return;
    }

    const hasPermission = await this.hasPermission();
    if (!hasPermission) {
      throw new Error('Notification listener permission not granted');
    }

    try {
      // Start listening for notifications
      this.listener = RNNotificationListener.onNotificationReceived((notification: any) => {
        // Filter: Only process notifications from whitelisted banking apps
        if (!BANKING_APP_PACKAGES.includes(notification.package)) {
          return; // Ignore non-banking apps
        }

        // Extract notification data
        const bankingNotification: BankingNotification = {
          packageName: notification.package,
          title: notification.title || '',
          text: notification.text || '',
          subText: notification.subText,
          bigText: notification.bigText,
          timestamp: Date.now(),
        };

        // Forward to callback for parsing
        onNotification(bankingNotification);
      });

      this.isListening = true;
      console.log('[NotificationListener] Started listening for banking notifications');
    } catch (error) {
      console.error('[NotificationListener] Error starting listener:', error);
      throw error;
    }
  }

  /**
   * Stop listening for notifications.
   */
  stopListening(): void {
    if (!this.isListening) {
      return;
    }

    if (this.listener) {
      this.listener.remove();
      this.listener = null;
    }

    this.isListening = false;
    console.log('[NotificationListener] Stopped listening');
  }

  /**
   * Check if the service is currently listening.
   */
  isActive(): boolean {
    return this.isListening;
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

export const notificationListener = new NotificationListenerService();
