/**
 * Onboarding Notification Primer Screen
 * Sprint 19: Push Notification Foundation - S19.2
 *
 * Pre-permission primer screen that appears after card selection (Step 1)
 * and before miles entry (Step 2). Explains value proposition of push
 * notifications to improve opt-in rate.
 *
 * Flow: onboarding.tsx → onboarding-notification-primer.tsx → onboarding-miles.tsx
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { usePushNotifications } from '../lib/push-notifications';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';
import { track, trackEvent } from '../lib/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRIMER_SHOWN_KEY = '@maximile_notification_primer_shown';

// ============================================================================
// Screen Component
// ============================================================================

export default function OnboardingNotificationPrimerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    registerForPushNotifications,
    isRegistering,
    permissionStatus,
  } = usePushNotifications(user?.id || null);

  const [isProcessing, setIsProcessing] = useState(false);

  // Track when primer is shown
  useEffect(() => {
    trackEvent('notification_primer_shown', {
      platform: Platform.OS,
      source: 'onboarding',
    });

    // Mark that primer has been shown
    AsyncStorage.setItem(PRIMER_SHOWN_KEY, 'true').catch(() => {
      // Silent fail
    });
  }, []);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleEnableNotifications = async () => {
    setIsProcessing(true);

    trackEvent('notification_primer_accepted', {
      platform: Platform.OS,
    });

    const success = await registerForPushNotifications();

    if (success) {
      trackEvent('notification_permission_granted', {
        platform: Platform.OS,
        source: 'primer',
      });
    } else if (permissionStatus === 'denied') {
      trackEvent('notification_permission_denied', {
        platform: Platform.OS,
        source: 'primer',
      });
    }

    setIsProcessing(false);

    // Navigate to next step regardless of result
    router.replace('/onboarding-miles');
  };

  const handleMaybeLater = () => {
    trackEvent('notification_primer_skipped', {
      platform: Platform.OS,
    });

    router.replace('/onboarding-miles');
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Icon */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={[Colors.brandGold, Colors.brandGold]}
            style={styles.iconGradient}
          >
            <Ionicons name="notifications" size={64} color="#FFFFFF" />
          </LinearGradient>
        </View>

        {/* Title */}
        <Text style={styles.title}>Never Miss a Rate Change</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Rate changes can cost you thousands of miles. We'll alert you instantly.
        </Text>

        {/* Benefits List */}
        <View style={styles.benefitsContainer}>
          <BenefitItem
            icon="alert-circle"
            title="Critical devaluations"
            description="When your card's earn rate drops or transfer ratio changes"
          />
          <BenefitItem
            icon="trending-down"
            title="Cap reductions"
            description="When bonus caps are cut, so you can plan ahead"
          />
          <BenefitItem
            icon="bar-chart"
            title="Cap approaching alerts"
            description="When you're close to hitting your monthly limit"
          />
        </View>

        {/* Reassurance */}
        <View style={styles.reassuranceContainer}>
          <Ionicons
            name="shield-checkmark"
            size={20}
            color={Colors.textSecondary}
            style={styles.reassuranceIcon}
          />
          <Text style={styles.reassuranceText}>
            We'll only send important alerts. You can customize this anytime in Settings.
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (isProcessing || isRegistering) && styles.buttonDisabled,
            ]}
            onPress={handleEnableNotifications}
            disabled={isProcessing || isRegistering}
          >
            <LinearGradient
              colors={[Colors.brandGold, Colors.brandGold]}
              style={styles.primaryButtonGradient}
            >
              {isProcessing || isRegistering ? (
                <Text style={styles.primaryButtonText}>Enabling...</Text>
              ) : (
                <Text style={styles.primaryButtonText}>Enable Notifications</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleMaybeLater}
            disabled={isProcessing || isRegistering}
          >
            <Text style={styles.secondaryButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <Text style={styles.footerNote}>
          You can enable this later in{' '}
          <Text style={styles.footerHighlight}>Profile → Settings</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// Benefit Item Component
// ============================================================================

interface BenefitItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

function BenefitItem({ icon, title, description }: BenefitItemProps) {
  return (
    <View style={styles.benefitItem}>
      <View style={styles.benefitIconContainer}>
        <Ionicons name={icon} size={24} color={Colors.brandGold} />
      </View>
      <View style={styles.benefitTextContainer}>
        <Text style={styles.benefitTitle}>{title}</Text>
        <Text style={styles.benefitDescription}>{description}</Text>
      </View>
    </View>
  );
}

// ============================================================================
// Utility Function
// ============================================================================

/**
 * Check if notification primer has already been shown to user
 */
export async function hasShownNotificationPrimer(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(PRIMER_SHOWN_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

/**
 * Check if we should show the notification primer
 * (not shown yet AND permission not already decided)
 */
export async function shouldShowNotificationPrimer(
  permissionStatus: 'granted' | 'denied' | 'undecided' | null
): Promise<boolean> {
  // Don't show if permission already decided
  if (permissionStatus === 'granted' || permissionStatus === 'denied') {
    return false;
  }

  // Don't show if already shown
  const hasShown = await hasShownNotificationPrimer();
  return !hasShown;
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  title: {
    fontSize: Typography.heading.fontSize,
    fontWeight: Typography.heading.fontWeight,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 24,
  },
  benefitsContainer: {
    marginBottom: Spacing.xxl,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    alignItems: 'flex-start',
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.brandGold}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  benefitTextContainer: {
    flex: 1,
    paddingTop: Spacing.xs,
  },
  benefitTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.bodyBold.fontWeight,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  benefitDescription: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  reassuranceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xxl,
  },
  reassuranceIcon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  reassuranceText: {
    flex: 1,
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: Spacing.lg,
  },
  primaryButton: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.bodyBold.fontWeight,
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.textSecondary,
  },
  footerNote: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerHighlight: {
    color: Colors.brandGold,
    fontWeight: Typography.captionBold.fontWeight,
  },
});
