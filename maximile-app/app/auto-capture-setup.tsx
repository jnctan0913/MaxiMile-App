import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Dimensions,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
} from '../constants/theme';
import { track } from '../lib/analytics';

/** AsyncStorage key indicating the user has completed shortcut setup */
export const SHORTCUT_SETUP_COMPLETE_KEY = 'auto_capture_shortcut_setup_complete';

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
// Setup Carousel Data
// ---------------------------------------------------------------------------

interface SetupSlide {
  id: string;
  stepNumber: number;
  icon: keyof typeof Ionicons.glyphMap;
  secondaryIcon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const SETUP_SLIDES: SetupSlide[] = [
  {
    id: 'step-1',
    stepNumber: 1,
    icon: 'download-outline',
    secondaryIcon: 'open-outline',
    title: 'Download & Open',
    description: 'Tap "Add Shortcut" above, then open the downloaded file.',
  },
  {
    id: 'step-2',
    stepNumber: 2,
    icon: 'add-circle-outline',
    title: 'Add the Shortcut',
    description: 'In the Shortcuts app, tap "+ Add Shortcut" to install it.',
  },
  {
    id: 'step-3',
    stepNumber: 3,
    icon: 'git-branch-outline',
    secondaryIcon: 'add-outline',
    title: 'Create Automation',
    description: 'Open the Automation tab and tap "+" to create a new one.',
  },
  {
    id: 'step-4',
    stepNumber: 4,
    icon: 'wallet-outline',
    secondaryIcon: 'hand-left-outline',
    title: 'Set Trigger',
    description: 'Choose "When I tap a Wallet Card or Pass" as the trigger.',
  },
  {
    id: 'step-5',
    stepNumber: 5,
    icon: 'search-outline',
    title: 'Select MaxiMile',
    description: 'Under "My Shortcuts", find and tap "MaxiMile".',
  },
  {
    id: 'step-6',
    stepNumber: 6,
    icon: 'flash-outline',
    secondaryIcon: 'checkmark-circle-outline',
    title: 'Run Immediately',
    description: 'Set the automation to "Run Immediately", then tap "Done".',
  },
];

// Slide width = glassCard inner width (screen - scrollContent padding - glassCard padding - glassCard border)
const CAROUSEL_SLIDE_WIDTH =
  Dimensions.get('window').width - 2 * Spacing.xl - 2 * Spacing.lg - 2;

// ---------------------------------------------------------------------------
// Carousel Slide
// ---------------------------------------------------------------------------

function CarouselSlide({ item }: { item: SetupSlide }) {
  return (
    <View style={carouselStyles.slide}>
      {/* Step badge */}
      <View style={carouselStyles.stepBadge}>
        <Text style={carouselStyles.stepBadgeText}>Step {item.stepNumber}</Text>
      </View>

      {/* Icon circle with optional secondary icon */}
      <View style={carouselStyles.iconWrapper}>
        <View style={carouselStyles.iconCircle}>
          <Ionicons name={item.icon} size={36} color={Colors.brandGold} />
        </View>
        {item.secondaryIcon && (
          <View style={carouselStyles.secondaryIconBadge}>
            <Ionicons name={item.secondaryIcon} size={16} color={Colors.brandGold} />
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={carouselStyles.slideTitle}>{item.title}</Text>

      {/* Description */}
      <Text style={carouselStyles.slideDescription}>{item.description}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Carousel Pagination
// ---------------------------------------------------------------------------

function CarouselPagination({ activeIndex, total }: { activeIndex: number; total: number }) {
  return (
    <View style={carouselStyles.paginationRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            carouselStyles.paginationDot,
            i === activeIndex
              ? carouselStyles.paginationDotActive
              : carouselStyles.paginationDotInactive,
          ]}
        />
      ))}
    </View>
  );
}

const carouselStyles = StyleSheet.create({
  slide: {
    width: CAROUSEL_SLIDE_WIDTH,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  stepBadge: {
    backgroundColor: Colors.brandGold,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    marginBottom: Spacing.lg,
  },
  stepBadgeText: {
    ...Typography.captionBold,
    color: Colors.brandCharcoal,
    fontSize: 12,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(197, 165, 90, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(197, 165, 90, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(197, 165, 90, 0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(197, 165, 90, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    fontSize: 17,
  },
  slideDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.sm,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  paginationDot: {},
  paginationDotActive: {
    width: 20,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.brandGold,
  },
  paginationDotInactive: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.border,
  },
});

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function AutoCaptureSetupScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { skipIntro, cardIds } = useLocalSearchParams<{ skipIntro?: string; cardIds?: string }>();
  const [step, setStep] = useState(0);

  // Carousel state
  const [activeSlide, setActiveSlide] = useState(0);
  const flatListRef = useRef<FlatList<SetupSlide>>(null);
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveSlide(viewableItems[0].index);
      }
    },
  ).current;

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
    // Skip shortcut setup, continue onboarding flow to miles entry
    router.replace({
      pathname: '/onboarding-miles',
      params: { cardIds: cardIds || JSON.stringify([]) },
    });
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownloadShortcut = async () => {
    setDownloading(true);
    try {
      if (Platform.OS === 'web') {
        // Web: trigger a direct download so Safari shows the native
        // "Open in Shortcuts" banner. navigator.share() with File objects
        // shows the share sheet but iOS Shortcuts doesn't register as a
        // share target — only direct downloads work reliably.
        const [asset] = await Asset.loadAsync(SHORTCUT_ASSET);
        const response = await fetch(asset.uri);
        const blob = await response.blob();

        const blobUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = 'MaxiMile.shortcut';
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();

        // Clean up after a short delay to allow download to start
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
          document.body.removeChild(anchor);
        }, 1000);

        setShortcutAdded(true);
        track('shortcut_downloaded' as any, { method: 'web_download' }, user?.id);
      } else {
        // iOS native: share via system share sheet
        const [asset] = await Asset.loadAsync(SHORTCUT_ASSET);
        const destUri = FileSystem.cacheDirectory + 'MaxiMile.shortcut';
        await FileSystem.downloadAsync(asset.uri, destUri);
        await Sharing.shareAsync(destUri, {
          mimeType: 'application/x-apple-shortcuts',
          UTI: 'com.apple.shortcuts.shortcut',
          dialogTitle: 'Add MaxiMile to Shortcuts',
        });
        setShortcutAdded(true);
        track('shortcut_downloaded' as any, { method: 'file_sharing' }, user?.id);
      }
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

      {/* Visual Setup Carousel */}
      <Text style={styles.carouselHeader}>Quick setup:</Text>
      <View style={styles.glassCard}>
        <FlatList
          ref={flatListRef}
          data={SETUP_SLIDES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CarouselSlide item={item} />}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: CAROUSEL_SLIDE_WIDTH,
            offset: CAROUSEL_SLIDE_WIDTH * index,
            index,
          })}
        />
        <CarouselPagination activeIndex={activeSlide} total={SETUP_SLIDES.length} />
      </View>

      <View style={styles.requirementBadge}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
        <Text style={styles.requirementText}>Requires iOS 17+</Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        activeOpacity={0.8}
        onPress={() => {
          AsyncStorage.setItem(SHORTCUT_SETUP_COMPLETE_KEY, 'true').catch(() => {});
          track('shortcut_setup_confirmed' as any, {}, user?.id);
          setStep(1);
        }}
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
        onPress={() => {
          // Continue onboarding flow to miles entry
          router.replace({
            pathname: '/onboarding-miles',
            params: { cardIds: cardIds || JSON.stringify([]) },
          });
        }}
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

  // Carousel header
  carouselHeader: {
    ...Typography.captionBold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
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
