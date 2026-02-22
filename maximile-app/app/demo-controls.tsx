// =============================================================================
// MaxiMile — Demo Controls Screen
// =============================================================================
// Manual trigger controls for demo notifications and demo features
// ONLY accessible in demo builds
// =============================================================================

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { useDemoNotification } from '../contexts/DemoNotificationContext';
import {
  DEMO_NOTIFICATIONS,
  FEATURE_SHOWCASE_SEQUENCE,
  RATE_CHANGE_DEMO_SEQUENCE,
  AUTO_CAPTURE_DEMO_SEQUENCE,
  playNotificationSequence,
} from '../lib/demo-notifications';

// ---------------------------------------------------------------------------
// Helper: Check if demo mode
// ---------------------------------------------------------------------------

function isDemoMode(): boolean {
  return process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DemoControlsScreen() {
  const router = useRouter();
  const { showDemoNotification } = useDemoNotification();

  // Safety check: Never render in production
  if (!isDemoMode()) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.container}>
          <Text style={styles.errorText}>Demo controls are only available in demo builds.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const handleShowNotification = (notification: { type: string; title: string; body: string; [key: string]: any }) => {
    showDemoNotification({
      type: notification.type as any,
      title: notification.title,
      body: notification.body,
    });
  };

  const handlePlaySequence = (
    sequence: typeof FEATURE_SHOWCASE_SEQUENCE,
    name: string
  ) => {
    Alert.alert(
      'Play Demo Sequence',
      `This will show ${sequence.length} notifications over ${sequence[sequence.length - 1].delay / 1000} seconds.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Play',
          onPress: () => {
            playNotificationSequence(sequence, (notification) => {
              showDemoNotification({
                type: notification.type,
                title: notification.title,
                body: notification.body,
              });
            });

            Alert.alert('Sequence Started', `${name} sequence is now playing.`);
          },
        },
      ]
    );
  };

  const handleResetDemoState = async () => {
    Alert.alert(
      'Reset Demo State',
      'This will clear all demo-related AsyncStorage flags (notification shown flags, etc.). The app will behave as if it\'s a fresh install.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('demo_notification_shown');
              await AsyncStorage.removeItem('demo_auto_capture_onboarding_shown');
              Alert.alert('Success', 'Demo state has been reset.');
            } catch (err) {
              Alert.alert('Error', 'Failed to reset demo state.');
            }
          },
        },
      ]
    );
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.brandGold} />
          </TouchableOpacity>
          <Text style={styles.title}>Demo Controls</Text>
        </View>

        {/* Section: Individual Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Individual Notifications</Text>
          <Text style={styles.sectionDescription}>
            Tap a button to show a single demo notification
          </Text>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleShowNotification(DEMO_NOTIFICATIONS.rateChange.critical)}
            activeOpacity={0.7}
          >
            <View style={styles.controlButtonContent}>
              <Text style={styles.controlButtonIcon}>⚠️</Text>
              <View style={styles.controlButtonText}>
                <Text style={styles.controlButtonTitle}>Critical Rate Change</Text>
                <Text style={styles.controlButtonSubtitle}>Amex KrisFlyer rate dropped 33%</Text>
              </View>
            </View>
            <Ionicons name="play-circle-outline" size={24} color={Colors.brandGold} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleShowNotification(DEMO_NOTIFICATIONS.rateChange.warning)}
            activeOpacity={0.7}
          >
            <View style={styles.controlButtonContent}>
              <Text style={styles.controlButtonIcon}>⚠️</Text>
              <View style={styles.controlButtonText}>
                <Text style={styles.controlButtonTitle}>Warning Rate Change</Text>
                <Text style={styles.controlButtonSubtitle}>DBS WWC cap reduced</Text>
              </View>
            </View>
            <Ionicons name="play-circle-outline" size={24} color={Colors.brandGold} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleShowNotification(DEMO_NOTIFICATIONS.rateChange.positive)}
            activeOpacity={0.7}
          >
            <View style={styles.controlButtonContent}>
              <Text style={styles.controlButtonIcon}>✨</Text>
              <View style={styles.controlButtonText}>
                <Text style={styles.controlButtonTitle}>Positive Rate Change</Text>
                <Text style={styles.controlButtonSubtitle}>HSBC Revolution cap increased</Text>
              </View>
            </View>
            <Ionicons name="play-circle-outline" size={24} color={Colors.brandGold} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleShowNotification(DEMO_NOTIFICATIONS.rateChange.multiple)}
            activeOpacity={0.7}
          >
            <View style={styles.controlButtonContent}>
              <Text style={styles.controlButtonIcon}>📢</Text>
              <View style={styles.controlButtonText}>
                <Text style={styles.controlButtonTitle}>Multiple Changes</Text>
                <Text style={styles.controlButtonSubtitle}>3 rate changes this week</Text>
              </View>
            </View>
            <Ionicons name="play-circle-outline" size={24} color={Colors.brandGold} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleShowNotification(DEMO_NOTIFICATIONS.capApproaching)}
            activeOpacity={0.7}
          >
            <View style={styles.controlButtonContent}>
              <Text style={styles.controlButtonIcon}>📊</Text>
              <View style={styles.controlButtonText}>
                <Text style={styles.controlButtonTitle}>Cap Approaching</Text>
                <Text style={styles.controlButtonSubtitle}>Groceries cap 80% used</Text>
              </View>
            </View>
            <Ionicons name="play-circle-outline" size={24} color={Colors.brandGold} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handleShowNotification(DEMO_NOTIFICATIONS.autoCapture)}
            activeOpacity={0.7}
          >
            <View style={styles.controlButtonContent}>
              <Text style={styles.controlButtonIcon}>🔔</Text>
              <View style={styles.controlButtonText}>
                <Text style={styles.controlButtonTitle}>Auto-Capture Alert</Text>
                <Text style={styles.controlButtonSubtitle}>Starbucks transaction logged</Text>
              </View>
            </View>
            <Ionicons name="play-circle-outline" size={24} color={Colors.brandGold} />
          </TouchableOpacity>
        </View>

        {/* Section: Demo Sequences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demo Sequences</Text>
          <Text style={styles.sectionDescription}>
            Play multiple notifications in sequence
          </Text>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() =>
              handlePlaySequence(FEATURE_SHOWCASE_SEQUENCE, 'Full Feature Showcase')
            }
            activeOpacity={0.7}
          >
            <View style={styles.controlButtonContent}>
              <Ionicons name="play-outline" size={24} color={Colors.brandGold} />
              <View style={styles.controlButtonText}>
                <Text style={styles.controlButtonTitle}>Full Feature Showcase</Text>
                <Text style={styles.controlButtonSubtitle}>5 notifications over 30 seconds</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => handlePlaySequence(RATE_CHANGE_DEMO_SEQUENCE, 'Rate Change Demo')}
            activeOpacity={0.7}
          >
            <View style={styles.controlButtonContent}>
              <Ionicons name="play-outline" size={24} color={Colors.brandGold} />
              <View style={styles.controlButtonText}>
                <Text style={styles.controlButtonTitle}>Rate Change Demo</Text>
                <Text style={styles.controlButtonSubtitle}>3 notifications over 18 seconds</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() =>
              handlePlaySequence(AUTO_CAPTURE_DEMO_SEQUENCE, 'Auto-Capture Demo')
            }
            activeOpacity={0.7}
          >
            <View style={styles.controlButtonContent}>
              <Ionicons name="play-outline" size={24} color={Colors.brandGold} />
              <View style={styles.controlButtonText}>
                <Text style={styles.controlButtonTitle}>Auto-Capture Demo</Text>
                <Text style={styles.controlButtonSubtitle}>2 notifications over 12 seconds</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Section: Reset Demo State */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demo State</Text>
          <Text style={styles.sectionDescription}>
            Reset demo-related flags to simulate a fresh install
          </Text>

          <TouchableOpacity
            style={[styles.controlButton, styles.dangerButton]}
            onPress={handleResetDemoState}
            activeOpacity={0.7}
          >
            <View style={styles.controlButtonContent}>
              <Ionicons name="refresh-outline" size={24} color={Colors.danger} />
              <View style={styles.controlButtonText}>
                <Text style={[styles.controlButtonTitle, styles.dangerText]}>
                  Reset Demo State
                </Text>
                <Text style={styles.controlButtonSubtitle}>
                  Clear all demo AsyncStorage flags
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Footer note */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            These controls are only visible in demo builds. They will not appear in production.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  title: {
    ...Typography.heading,
    fontSize: 26,
    color: Colors.textPrimary,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    ...Typography.subheading,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  controlButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  controlButtonIcon: {
    fontSize: 24,
  },
  controlButtonText: {
    flex: 1,
  },
  controlButtonTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  controlButtonSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  dangerButton: {
    borderColor: Colors.danger,
    backgroundColor: 'rgba(234, 67, 53, 0.05)',
  },
  dangerText: {
    color: Colors.danger,
  },
  footer: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.babyYellowLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.babyYellow,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
