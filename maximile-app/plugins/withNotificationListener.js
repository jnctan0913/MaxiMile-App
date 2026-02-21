// =============================================================================
// MaxiMile — Expo Config Plugin for Android NotificationListenerService
// =============================================================================
// Adds the BIND_NOTIFICATION_LISTENER_SERVICE permission to AndroidManifest.xml
// Required for S17.1 (Android Auto-Capture)
// =============================================================================

const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo config plugin to add NotificationListenerService permissions
 * to AndroidManifest.xml for auto-capture functionality.
 */
const withNotificationListener = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    // Add BIND_NOTIFICATION_LISTENER_SERVICE permission
    if (!androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = [];
    }

    const notificationPermission = {
      $: {
        'android:name': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
      },
    };

    // Check if permission already exists
    const hasPermission = androidManifest['uses-permission'].some(
      (perm) =>
        perm.$['android:name'] === 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE'
    );

    if (!hasPermission) {
      androidManifest['uses-permission'].push(notificationPermission);
    }

    // Note: The react-native-notification-listener package will handle
    // adding the actual <service> declaration to the manifest via its own
    // native module configuration. We only need to ensure the permission is present.

    return config;
  });
};

module.exports = withNotificationListener;
