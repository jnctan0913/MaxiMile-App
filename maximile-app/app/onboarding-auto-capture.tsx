import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { track } from '../lib/analytics';
import { useAuth } from '../contexts/AuthContext';

// ---------------------------------------------------------------------------
// Step Icon Component (condensed version)
// ---------------------------------------------------------------------------

function StepIcon({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={stepIconStyles.row}>
      <View style={stepIconStyles.circle}>
        <Ionicons name={icon} size={24} color={Colors.brandGold} />
      </View>
      <Text style={stepIconStyles.label}>{label}</Text>
    </View>
  );
}

const stepIconStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(197, 165, 90, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(197, 165, 90, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
  },
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/**
 * Onboarding Step 1.5 — Auto-Capture Setup Prompt
 * 
 * Sits between card selection and miles balance entry in onboarding.
 * Platform-adaptive messaging and CTA navigation.
 */
export default function OnboardingAutoCaptureScreen() {
  const router = useRouter();
  const { cardIds } = useLocalSearchParams<{ cardIds?: string }>();
  const { user } = useAuth();

  const handleSetUp = () => {
    if (user) {
      track('onboarding_auto_capture_cta_tapped', { platform: Platform.OS }, user.id);
    }

    if (Platform.OS === 'ios') {
      // iOS: Route to Shortcuts-based auto-capture setup
      router.push({ pathname: '/auto-capture-setup', params: { skipIntro: '1' } });
    } else if (Platform.OS === 'android') {
      // Android: Route to notification-based auto-capture setup (Sprint 17)
      router.push('/android-auto-capture-setup');
    } else {
      // Fallback for other platforms (web, etc.)
      handleSkip();
    }
  };

  const handleSkip = async () => {
    if (user) {
      track('onboarding_auto_capture_skipped', { platform: Platform.OS }, user.id);
    }

    // Check if we should show notification primer before miles entry
    // Import at top of file: import { shouldShowNotificationPrimer } from './onboarding-notification-primer';
    // For now, proceed directly to onboarding-miles
    // In production, we'd check: const showPrimer = await shouldShowNotificationPrimer(null);
    // if (showPrimer) { router.push('/onboarding-notification-primer'); return; }

    // Proceed to onboarding-miles with cardIds
    router.push({
      pathname: '/onboarding-miles',
      params: { cardIds: cardIds || JSON.stringify([]) },
    });
  };

  const subtitle = Platform.OS === 'ios'
    ? 'Pay with Apple Pay, and MaxiMile logs it for you.'
    : 'MaxiMile reads your banking notifications to log transactions automatically.';

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.background}
      imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Log Without Typing</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {/* Visual: Three-step flow icons */}
        <View style={styles.visualContainer}>
          <View style={styles.glassCard}>
            <StepIcon
              icon="phone-portrait-outline"
              label="Pay with Apple Pay at any store"
            />
            <View style={styles.connector} />
            <StepIcon
              icon="flash-outline"
              label="iOS Shortcuts auto-sends the transaction"
            />
            <View style={styles.connector} />
            <StepIcon
              icon="airplane-outline"
              label="MaxiMile pre-fills your log — just confirm"
            />
          </View>
        </View>

        {/* CTA Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleSetUp}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Set Up Auto-Capture"
          >
            <LinearGradient
              colors={['#D4B96A', Colors.brandGold, '#B8953F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>Set Up Auto-Capture</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Skip link */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Skip auto-capture setup"
          >
            <Text style={styles.skipText}>I'll do this later</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    ...Typography.heading,
    fontSize: 26,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  visualContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.15)',
  },
  connector: {
    width: 2,
    height: 16,
    backgroundColor: 'rgba(197, 165, 90, 0.25)',
    marginLeft: 24,
    marginBottom: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(197, 165, 90, 0.2)',
  },
  ctaButton: {
    height: 52,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  ctaGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
    fontSize: 17,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  skipText: {
    ...Typography.body,
    color: Colors.brandGold,
    textDecorationLine: 'underline',
  },
});
