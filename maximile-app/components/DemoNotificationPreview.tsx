// =============================================================================
// MaxiMile — Demo Notification Preview Component
// =============================================================================
// Simulates native iOS push notification appearance within the app
// ONLY renders in demo mode (EXPO_PUBLIC_DEMO_MODE=true)
// =============================================================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Colors, Typography, BorderRadius, Spacing } from '../constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DemoNotificationPreviewProps {
  /** Notification type determines icon and styling */
  type: 'critical' | 'warning' | 'positive' | 'multiple' | 'cap_approaching';

  /** Notification title (bold text) - max 60 characters recommended */
  title: string;

  /** Notification body (regular text) - max 100 characters, 2 lines */
  body: string;

  /** Callback when notification is tapped */
  onTap?: () => void;

  /** Callback when notification is dismissed (auto or manual) */
  onDismiss?: () => void;

  /** Auto-dismiss duration in milliseconds (default: 4000ms) */
  duration?: number;

  /** Disable animations (for accessibility or testing) */
  disableAnimations?: boolean;
}

// ---------------------------------------------------------------------------
// Helper: Check if demo mode
// ---------------------------------------------------------------------------

function isDemoMode(): boolean {
  return process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
}

// ---------------------------------------------------------------------------
// Helper: Get icon for notification type
// ---------------------------------------------------------------------------

function getTypeIcon(type: DemoNotificationPreviewProps['type']): string {
  switch (type) {
    case 'critical':
      return '⚠️';
    case 'warning':
      return '⚠️';
    case 'positive':
      return '✨';
    case 'multiple':
      return '📢';
    case 'cap_approaching':
      return '📊';
    default:
      return '🔔';
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DemoNotificationPreview(props: DemoNotificationPreviewProps) {
  const {
    type,
    title,
    body,
    onTap,
    onDismiss,
    duration = 4000,
    disableAnimations = false,
  } = props;

  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Safety check: Never render in production
  if (!isDemoMode()) {
    if (__DEV__) {
      console.warn('[DemoNotificationPreview] Attempted to render in production mode - blocked');
    }
    return null;
  }

  // -------------------------------------------------------------------------
  // Entrance animation
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (disableAnimations) {
      slideAnim.setValue(0);
      opacityAnim.setValue(1);
    } else {
      // Slide down with spring physics (iOS native feel)
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 150,
          friction: 15,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  // -------------------------------------------------------------------------
  // Dismiss animation
  // -------------------------------------------------------------------------
  const handleDismiss = () => {
    if (disableAnimations) {
      onDismiss?.();
      return;
    }

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  // -------------------------------------------------------------------------
  // Swipe-to-dismiss gesture
  // -------------------------------------------------------------------------
  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: slideAnim } }],
    { useNativeDriver: true }
  );

  const handleGestureStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY, velocityY } = event.nativeEvent;

      // If swiped up enough or fast enough, dismiss
      if (translationY < -50 || velocityY < -800) {
        handleDismiss();
      } else {
        // Otherwise, spring back to original position
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 150,
          friction: 15,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  // -------------------------------------------------------------------------
  // Tap handler
  // -------------------------------------------------------------------------
  const handlePress = () => {
    onTap?.();
    handleDismiss();
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const icon = getTypeIcon(type);
  const screenWidth = Dimensions.get('window').width;
  const notificationTop = insets.top + 8;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: notificationTop,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleGestureStateChange}
      >
        <Animated.View>
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={handlePress}
            style={[styles.touchable, { width: screenWidth - 16 }]}
          >
            <BlurView intensity={80} tint="light" style={styles.blurContainer}>
              <View style={styles.content}>
                {/* Header: App icon + name + time */}
                <View style={styles.header}>
                  <View style={styles.appIconContainer}>
                    <Text style={styles.appIcon}>🔶</Text>
                  </View>
                  <Text style={styles.appName}>MaxiMile</Text>
                  <View style={styles.spacer} />
                  <Text style={styles.timestamp}>now</Text>
                </View>

                {/* Title + Body */}
                <View style={styles.bodyContainer}>
                  <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                    {icon} {title}
                  </Text>
                  <Text style={styles.body} numberOfLines={2} ellipsizeMode="tail">
                    {body}
                  </Text>
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 8,
    right: 8,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  touchable: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  blurContainer: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  appIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 4.5,
    backgroundColor: Colors.brandGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  appIcon: {
    fontSize: 12,
  },
  appName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: -0.08,
  },
  spacer: {
    flex: 1,
  },
  timestamp: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8E8E93',
    letterSpacing: -0.08,
  },
  bodyContainer: {
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.24,
    lineHeight: 18,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    color: '#3C3C43',
    letterSpacing: -0.15,
    lineHeight: 18,
  },
});
