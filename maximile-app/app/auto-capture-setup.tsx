import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ImageBackground,
  Animated,
  Easing,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ExpoLinking from 'expo-linking';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  getUserCardMappings,
  saveCardMapping,
} from '../lib/card-matcher';
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
} from '../constants/theme';
import { track } from '../lib/analytics';

const SHORTCUT_URL = 'https://maximile.app/shortcut';
const TOTAL_STEPS = 4;

interface UserCard {
  cardId: string;
  cardName: string;
  bank: string;
}

interface CardMapping {
  cardId: string;
  walletName: string;
}

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
  const [step, setStep] = useState(0);

  // Step 2 state
  const [shortcutAdded, setShortcutAdded] = useState(false);

  // Step 3 state
  const [cards, setCards] = useState<UserCard[]>([]);
  const [mappings, setMappings] = useState<CardMapping[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [savingMappings, setSavingMappings] = useState(false);

  // Step 4 state
  const [testSuccess, setTestSuccess] = useState(false);

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

  // Fetch cards for Step 3
  useEffect(() => {
    if (step !== 2 || !user) return;

    const fetchData = async () => {
      setLoadingCards(true);
      try {
        const { data, error } = await supabase
          .from('user_cards')
          .select('card_id, cards!inner(id, name, bank)')
          .eq('user_id', user.id);

        if (!error && data) {
          const userCards: UserCard[] = (data as any[]).map((row) => ({
            cardId: (row as any).cards.id,
            cardName: (row as any).cards.name,
            bank: (row as any).cards.bank,
          }));
          setCards(userCards);

          const existing = await getUserCardMappings(user.id);
          const initialMappings = userCards.map((c) => {
            const found = existing.find((m) => m.cardId === c.cardId);
            return {
              cardId: c.cardId,
              walletName: found?.walletName ?? '',
            };
          });
          setMappings(initialMappings);
        }
      } catch {
        // Best-effort
      }
      setLoadingCards(false);
    };

    fetchData();
  }, [step, user]);

  // Deep link listener for Step 4 test verification
  useEffect(() => {
    if (step !== 3) return;

    const sub = ExpoLinking.addEventListener('url', ({ url }) => {
      if (url.startsWith('maximile://log')) {
        setTestSuccess(true);
        track('auto_capture_test_success' as any, { source: 'setup_wizard' }, user?.id);
      }
    });

    return () => sub.remove();
  }, [step, user?.id]);

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

  const handleDownloadShortcut = async () => {
    try {
      await Linking.openURL(SHORTCUT_URL);
      setShortcutAdded(true);
    } catch {
      // URL may fail in simulator
    }
  };

  const updateWalletName = (cardId: string, walletName: string) => {
    setMappings((prev) =>
      prev.map((m) =>
        m.cardId === cardId ? { ...m, walletName } : m,
      ),
    );
  };

  const handleSaveMappings = async () => {
    if (!user) return;
    setSavingMappings(true);
    try {
      const toSave = mappings.filter((m) => m.walletName.trim().length > 0);
      await Promise.all(
        toSave.map((m) => saveCardMapping(user.id, m.walletName.trim(), m.cardId)),
      );
      track('auto_capture_cards_mapped' as any, { count: toSave.length }, user.id);
      setStep(3);
    } catch {
      // Best-effort
    }
    setSavingMappings(false);
  };

  // ---------------------------------------------------------------------------
  // Step renderers
  // ---------------------------------------------------------------------------

  const renderStep0 = () => (
    <>
      <Text style={styles.stepTitle}>How It Works</Text>
      <Text style={styles.stepSubtitle}>
        Automatically log Apple Pay transactions in three simple steps.
      </Text>

      <View style={styles.glassCard}>
        <StepIcon
          icon="phone-portrait-outline"
          label="Pay with Apple Pay at any store"
          delay={100}
        />
        <View style={styles.connector} />
        <StepIcon
          icon="flash-outline"
          label="iOS Shortcuts auto-sends the transaction"
          delay={300}
        />
        <View style={styles.connector} />
        <StepIcon
          icon="airplane-outline"
          label="MaxiMile pre-fills your log — just confirm"
          delay={500}
        />
      </View>

      <View style={styles.requirementBadge}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
        <Text style={styles.requirementText}>Works with iOS 17+</Text>
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
          <Text style={styles.primaryButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.brandCharcoal} />
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>Download Shortcut</Text>
      <Text style={styles.stepSubtitle}>
        Tap below to download the MaxiMile Shortcut. Then add it as a Personal Automation in the Shortcuts app.
      </Text>

      <TouchableOpacity
        style={styles.downloadButton}
        activeOpacity={0.8}
        onPress={handleDownloadShortcut}
      >
        <LinearGradient
          colors={['#D4B96A', Colors.brandGold, '#B8953F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.downloadGradient}
        >
          <Ionicons name="download-outline" size={22} color={Colors.brandCharcoal} />
          <Text style={styles.downloadButtonText}>Download Shortcut</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.glassCard}>
        <Text style={styles.instructionHeader}>Setup Instructions</Text>
        {[
          'Open the downloaded Shortcut',
          'Tap "Add Automation"',
          'Select "Transaction" as the trigger',
          'Choose "When I Tap" (all cards)',
        ].map((text, i) => (
          <View key={i} style={styles.instructionRow}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>{i + 1}</Text>
            </View>
            <Text style={styles.instructionText}>{text}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.outlineButton}
        activeOpacity={0.8}
        onPress={() => setStep(2)}
      >
        <Ionicons name="checkmark-circle-outline" size={20} color={Colors.brandGold} />
        <Text style={styles.outlineButtonText}>I've added the Shortcut</Text>
      </TouchableOpacity>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.stepTitle}>Verify Your Cards</Text>
      <Text style={styles.stepSubtitle}>
        Match your MaxiMile cards to their names in Apple Wallet so transactions route correctly.
      </Text>

      {loadingCards ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brandGold} />
        </View>
      ) : cards.length === 0 ? (
        <View style={styles.glassCard}>
          <Text style={styles.emptyText}>
            No cards in your portfolio yet. Add cards first, then come back to set up auto-capture.
          </Text>
        </View>
      ) : (
        cards.map((card) => {
          const mapping = mappings.find((m) => m.cardId === card.cardId);
          return (
            <View key={card.cardId} style={styles.glassCard}>
              <Text style={styles.cardLabel}>
                {card.bank} {card.cardName}
              </Text>
              <TextInput
                style={styles.walletInput}
                value={mapping?.walletName ?? ''}
                onChangeText={(text) => updateWalletName(card.cardId, text)}
                placeholder="Name in Apple Wallet"
                placeholderTextColor={Colors.textTertiary}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          );
        })
      )}

      <TouchableOpacity
        style={[
          styles.primaryButton,
          cards.length === 0 && styles.primaryButtonDisabled,
        ]}
        activeOpacity={0.8}
        onPress={handleSaveMappings}
        disabled={cards.length === 0 || savingMappings}
      >
        {savingMappings ? (
          <View style={styles.primaryGradientFallback}>
            <ActivityIndicator size="small" color={Colors.brandCharcoal} />
          </View>
        ) : (
          <LinearGradient
            colors={['#D4B96A', Colors.brandGold, '#B8953F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryGradient}
          >
            <Text style={styles.primaryButtonText}>Save & Continue</Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.brandCharcoal} />
          </LinearGradient>
        )}
      </TouchableOpacity>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.stepTitle}>Test It</Text>

      {testSuccess ? (
        <View style={styles.successContainer}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={40} color={Colors.brandCharcoal} />
          </View>
          <Text style={styles.successTitle}>It works!</Text>
          <Text style={styles.successSubtitle}>
            Auto-capture is set up and ready to go. Every Apple Pay tap will be pre-filled for you.
          </Text>
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
        </View>
      ) : (
        <>
          <View style={styles.glassCard}>
            <Text style={styles.testDescription}>
              Make a small Apple Pay purchase to test the setup. MaxiMile should open automatically with the transaction pre-filled.
            </Text>
            <View style={styles.testWaiting}>
              <PulsingDot />
              <Text style={styles.waitingText}>Waiting for a transaction…</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.skipButton}
            activeOpacity={0.7}
            onPress={() => {
              track('auto_capture_test_skipped' as any, undefined, user?.id);
              router.replace('/(tabs)');
            }}
          >
            <Text style={styles.skipButtonText}>I'll test later</Text>
          </TouchableOpacity>
        </>
      )}
    </>
  );

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3];

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
