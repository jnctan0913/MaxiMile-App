import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { getUserCardMappings } from '../lib/card-matcher';
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
} from '../constants/theme';
import { track } from '../lib/analytics';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AutoCaptureSettingsScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [mappedCount, setMappedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const isActive = mappedCount > 0;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (!user) return;

    const fetchMappings = async () => {
      try {
        const mappings = await getUserCardMappings(user.id);
        setMappedCount(mappings.length);
      } catch {
        setMappedCount(0);
      }
      setLoading(false);
    };

    fetchMappings();
    track('screen_view', { screen: 'auto_capture_settings' }, user.id);
  }, [user]);

  const toggleHowItWorks = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setHowItWorksOpen((prev) => !prev);
  }, []);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  };

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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleGoBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Auto-Capture</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Status card */}
          <View style={styles.glassCard}>
            {loading ? (
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, styles.statusDotGray]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusLabel}>Loading…</Text>
                </View>
              </View>
            ) : isActive ? (
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, styles.statusDotGreen]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusLabel}>Active — iOS Shortcuts</Text>
                  <Text style={styles.statusDetail}>
                    {mappedCount} card{mappedCount !== 1 ? 's' : ''} mapped
                  </Text>
                </View>
                <View style={styles.activeBadge}>
                  <Ionicons name="flash" size={14} color={Colors.brandGold} />
                </View>
              </View>
            ) : (
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, styles.statusDotGray]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusLabel}>Not set up</Text>
                  <Text style={styles.statusDetail}>
                    Automatically log Apple Pay transactions
                  </Text>
                </View>
              </View>
            )}

            {!loading && !isActive && (
              <TouchableOpacity
                style={styles.setupCta}
                activeOpacity={0.8}
                onPress={() => router.push('/auto-capture-setup')}
              >
                <LinearGradient
                  colors={['#D4B96A', Colors.brandGold, '#B8953F']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.setupCtaGradient}
                >
                  <Ionicons name="flash-outline" size={18} color={Colors.brandCharcoal} />
                  <Text style={styles.setupCtaText}>Set up now</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Reconfigure button */}
          {isActive && (
            <TouchableOpacity
              style={styles.reconfigureButton}
              activeOpacity={0.8}
              onPress={() => router.push('/auto-capture-setup')}
            >
              <Ionicons name="settings-outline" size={18} color={Colors.brandGold} />
              <Text style={styles.reconfigureText}>Reconfigure</Text>
            </TouchableOpacity>
          )}

          {/* How it works collapsible */}
          <TouchableOpacity
            style={styles.collapsibleHeader}
            activeOpacity={0.7}
            onPress={toggleHowItWorks}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={Colors.textSecondary}
            />
            <Text style={styles.collapsibleTitle}>How it works</Text>
            <Ionicons
              name={howItWorksOpen ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={Colors.textTertiary}
            />
          </TouchableOpacity>

          {howItWorksOpen && (
            <View style={styles.collapsibleBody}>
              {[
                {
                  icon: 'phone-portrait-outline' as const,
                  text: 'Pay with Apple Pay at any store',
                },
                {
                  icon: 'flash-outline' as const,
                  text: 'An iOS Shortcut detects the transaction and sends it to MaxiMile',
                },
                {
                  icon: 'airplane-outline' as const,
                  text: 'MaxiMile opens with the amount, merchant, and card pre-filled — just tap Confirm',
                },
              ].map((item, i) => (
                <View key={i} style={styles.howRow}>
                  <View style={styles.howIcon}>
                    <Ionicons name={item.icon} size={18} color={Colors.brandGold} />
                  </View>
                  <Text style={styles.howText}>{item.text}</Text>
                </View>
              ))}
              <View style={styles.howNote}>
                <Ionicons name="logo-apple" size={14} color={Colors.textTertiary} />
                <Text style={styles.howNoteText}>Requires iOS 17+ and Apple Pay</Text>
              </View>
            </View>
          )}
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
    paddingHorizontal: Spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
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

  // Status
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusDotGreen: {
    backgroundColor: Colors.success,
  },
  statusDotGray: {
    backgroundColor: Colors.textTertiary,
  },
  statusLabel: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  statusDetail: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(197, 165, 90, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Setup CTA
  setupCta: {
    height: 48,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.lg,
  },
  setupCtaGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  setupCtaText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
  },

  // Reconfigure
  reconfigureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 48,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.brandGold,
    backgroundColor: 'rgba(197, 165, 90, 0.06)',
    marginBottom: Spacing.lg,
  },
  reconfigureText: {
    ...Typography.bodyBold,
    color: Colors.brandGold,
  },

  // Collapsible
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.1)',
    ...Shadows.sm,
  },
  collapsibleTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    flex: 1,
  },
  collapsibleBody: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
    marginTop: -1,
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: 'rgba(197, 165, 90, 0.1)',
  },
  howRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  howIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(197, 165, 90, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  howText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  howNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  howNoteText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
});
