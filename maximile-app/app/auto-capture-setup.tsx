import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Animated,
  Easing,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ExpoLinking from 'expo-linking';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';
import { useAuth } from '../contexts/AuthContext';
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
} from '../constants/theme';
import { track } from '../lib/analytics';

// Bundled shortcut file — create once on iPhone/iPad, then bundle with app
// See BUNDLE_SHORTCUT_FILE.md for instructions on creating the file
const SHORTCUT_ASSET = require('../assets/MaxiMile.shortcut');
const TOTAL_STEPS = 2;

// ---------------------------------------------------------------------------
// Progress Dots
// ---------------------------------------------------------------------------

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <View style={dotStyles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            dotStyles.dot,
            i <= current ? dotStyles.dotActive : dotStyles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

const dotStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: Colors.brandGold,
  },
  dotInactive: {
    backgroundColor: Colors.border,
  },
});

// ---------------------------------------------------------------------------
// Step Icon Row
// ---------------------------------------------------------------------------

function StepIcon({
  icon,
  label,
  delay,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  delay: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View
      style={[
        stepIconStyles.row,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <View style={stepIconStyles.circle}>
        <Ionicons name={icon} size={26} color={Colors.brandGold} />
      </View>
      <Text style={stepIconStyles.label}>{label}</Text>
    </Animated.View>
  );
}

const stepIconStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  circle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(197, 165, 90, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(197, 165, 90, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },
});

// ---------------------------------------------------------------------------
// Pulsing Dot
// ---------------------------------------------------------------------------

function PulsingDot() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.8,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 1000,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [scale, opacity]);

  return (
    <View style={pulseStyles.container}>
      <Animated.View
        style={[
          pulseStyles.ring,
          { transform: [{ scale }], opacity },
        ]}
      />
      <View style={pulseStyles.core} />
    </View>
  );
}

const pulseStyles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xl,
  },
  ring: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.brandGold,
  },
  core: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.brandGold,
  },
});

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function AutoCaptureSetupScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { skipIntro } = useLocalSearchParams<{ skipIntro?: string }>();
  const [step, setStep] = useState(skipIntro === '1' ? 1 : 0);

  // Step 2 state
  const [shortcutAdded, setShortcutAdded] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    animateIn();
  }, [step, animateIn]);

  // Track setup start
  useEffect(() => {
    track('screen_view', { screen: 'auto_capture_setup' }, user?.id);
  }, [user?.id]);

  const handleGoBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      handleSetUpLater();
    }
  };

  const handleSetUpLater = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownloadShortcut = async () => {
    setDownloading(true);
    try {
      // Load the bundled .shortcut file
      // This file is created once on iPhone/iPad and bundled with the app
      const [asset] = await Asset.loadAsync(SHORTCUT_ASSET);

      // Copy to cache directory so it can be shared
      const destUri = FileSystem.cacheDirectory + 'MaxiMile.shortcut';
      await FileSystem.downloadAsync(asset.uri, destUri);

      // Share the file — iOS shows native share sheet with "Add to Shortcuts" option
      await Sharing.shareAsync(destUri, {
        mimeType: 'application/x-apple-shortcuts',
        UTI: 'com.apple.shortcuts.shortcut',
        dialogTitle: 'Add MaxiMile to Shortcuts',
      });

      setShortcutAdded(true);
      track('shortcut_downloaded' as any, { method: 'file_sharing' }, user?.id);
    } catch (err) {
      Alert.alert(
        'Could Not Share Shortcut',
        'Please make sure the Shortcuts app is installed and try again.\n\n' +
        'Error: ' + (err instanceof Error ? err.message : 'Unknown error'),
        [{ text: 'OK' }],
      );
    } finally {
      setDownloading(false);
    }
  };

  // Note: Demo mode testing handled automatically by deep link handler.
  // When EXPO_PUBLIC_DEMO_MODE=true, any trigger of maximile://log will
  // inject mock transaction data via lib/deep-link.ts injectMockData().

  // ---------------------------------------------------------------------------
  // Step renderers
  // ---------------------------------------------------------------------------

  const renderStep0 = () => (
    <>
      <Text style={styles.stepTitle}>Set Up Auto-Capture</Text>
      <Text style={styles.stepSubtitle}>
        Pay with Apple Pay → MaxiMile opens automatically with the transaction pre-filled.
      </Text>

      {/* Download button */}
      <TouchableOpacity
        style={[styles.downloadButton, downloading && { opacity: 0.7 }]}
        activeOpacity={0.8}
        onPress={handleDownloadShortcut}
        disabled={downloading}
      >
        <LinearGradient
          colors={['#D4B96A', Colors.brandGold, '#B8953F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.downloadGradient}
        >
          {downloading
            ? <ActivityIndicator size="small" color={Colors.brandCharcoal} />
            : <Ionicons name="download-outline" size={22} color={Colors.brandCharcoal} />
          }
          <Text style={styles.downloadButtonText}>
            {downloading ? 'Opening…' : 'Add Shortcut'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Simplified Instructions */}
      <View style={styles.glassCard}>
        <Text style={styles.instructionHeader}>Quick setup:</Text>
        {[
          'Tap "Add Shortcut" above → Select "Shortcuts"',
          'In Shortcuts app → tap "+ Add Shortcut"',
          'Open Automation tab → tap "+"',
          'Choose: "When I tap a Wallet Card or Pass"',
          'Under "My Shortcuts", tap "MaxiMile"',
          'Set Automation to "Run Immediately" → tap "Done"',
        ].map((text, i) => (
          <View key={i} style={styles.instructionRow}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>{i + 1}</Text>
            </View>
            <Text style={styles.instructionText}>{text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.requirementBadge}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
        <Text style={styles.requirementText}>Requires iOS 17+</Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        activeOpacity={0.8}
        onPress={() => setStep(1)}
      >
        <LinearGradient
          colors={['#D4B96A', Colors.brandGold, '#B8953F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primaryGradient}
        >
          <Text style={styles.primaryButtonText}>I've set this up</Text>
          <Ionicons name="checkmark-circle" size={18} color={Colors.brandCharcoal} />
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  const renderStep1 = () => (
    <>
      <View style={styles.successContainer}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={40} color={Colors.brandCharcoal} />
        </View>
        <Text style={styles.successTitle}>All Set!</Text>
        <Text style={styles.successSubtitle}>
          Auto-capture is ready. Next time you tap to pay with Apple Pay, MaxiMile will open automatically with your transaction pre-filled.
        </Text>
      </View>

      <View style={styles.glassCard}>
        <StepIcon
          icon="card-outline"
          label="Tap to pay with Apple Pay"
          delay={100}
        />
        <View style={styles.connector} />
        <StepIcon
          icon="flash-outline"
          label="MaxiMile opens automatically"
          delay={300}
        />
        <View style={styles.connector} />
        <StepIcon
          icon="checkmark-circle-outline"
          label="Review and confirm to log"
          delay={500}
        />
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        activeOpacity={0.8}
        onPress={() => router.replace('/(tabs)')}
      >
        <LinearGradient
          colors={['#D4B96A', Colors.brandGold, '#B8953F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primaryGradient}
        >
          <Text style={styles.primaryButtonText}>Done</Text>
          <Ionicons name="checkmark-circle" size={18} color={Colors.brandCharcoal} />
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  const stepRenderers = [renderStep0, renderStep1];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.background}
      imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Top bar */}
          <View style={styles.topBar}>
            {step > 0 ? (
              <TouchableOpacity
                onPress={handleGoBack}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 24 }} />
            )}

            <ProgressDots current={step} total={TOTAL_STEPS} />

            <TouchableOpacity
              onPress={handleSetUpLater}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Step content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {stepRenderers[step]()}
          </ScrollView>

          {/* Set up later link */}
          <TouchableOpacity
            style={styles.laterLink}
            onPress={handleSetUpLater}
            activeOpacity={0.6}
          >
            <Text style={styles.laterLinkText}>Set up later</Text>
          </TouchableOpacity>
        </Animated.View>
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
  content: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },

  // Step header
  stepTitle: {
    ...Typography.heading,
    color: Colors.brandCharcoal,
    marginBottom: Spacing.sm,
  },
  stepSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },

  // Glass card
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.15)',
    ...Shadows.glass,
  },

  // Connector line between step icons
  connector: {
    width: 2,
    height: 20,
    backgroundColor: 'rgba(197, 165, 90, 0.25)',
    marginLeft: 25,
    marginBottom: Spacing.sm,
  },

  // iOS requirement badge
  requirementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  requirementText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  // Primary button (gold, filled)
  primaryButton: {
    height: 52,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  primaryGradientFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brandGold,
    borderRadius: BorderRadius.lg,
  },
  primaryButtonText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
  },

  // Download button (step 2)
  downloadButton: {
    height: 56,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  downloadGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  downloadButtonText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
    fontSize: 17,
  },

  // Instructions
  instructionHeader: {
    ...Typography.captionBold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(197, 165, 90, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionNumberText: {
    ...Typography.captionBold,
    color: Colors.brandGold,
  },
  instructionText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },

  // Outline button
  outlineButton: {
    height: 52,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.brandGold,
    backgroundColor: 'rgba(197, 165, 90, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  outlineButtonText: {
    ...Typography.bodyBold,
    color: Colors.brandGold,
  },

  // Step 3: Card mapping
  cardLabel: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
    marginBottom: Spacing.sm,
  },
  walletInput: {
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  loadingContainer: {
    paddingVertical: Spacing.xxxl,
    alignItems: 'center',
  },

  // Step 4: Test
  testDescription: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  testWaiting: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  waitingText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  skipButtonText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },

  // Success state
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.brandGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successTitle: {
    ...Typography.heading,
    color: Colors.brandGold,
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },

  // Set up later link
  laterLink: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Spacing.sm : Spacing.md,
  },
  laterLinkText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textDecorationLine: 'underline',
  },
});
