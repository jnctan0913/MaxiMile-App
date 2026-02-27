import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getCategoryById } from '../../constants/categories';
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
  Glass,
} from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../components/GlassCard';
import CapProgressBar from '../../components/CapProgressBar';
import EmptyState from '../../components/EmptyState';
import { track } from '../../lib/analytics';
import { getCardImage } from '../../constants/cardImages';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RecommendRow {
  card_id: string;
  card_name: string;
  bank: string;
  earn_rate_mpd: number;
  remaining_cap: number | null;
  monthly_cap_amount: number | null;
  is_recommended: boolean;
  conditions_note: string | null;
  min_spend_threshold: number | null;
  min_spend_met: boolean | null;
  total_monthly_spend: number;
  requires_contactless: boolean;
}

// ---------------------------------------------------------------------------
// Skeleton loader component
// ---------------------------------------------------------------------------

function SkeletonLoader() {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View style={skeletonStyles.container}>
      {/* Top card skeleton */}
      <Animated.View style={[skeletonStyles.topCard, { opacity: pulseAnim }]}>
        <View style={skeletonStyles.line120} />
        <View style={skeletonStyles.line200} />
        <View style={skeletonStyles.lineLarge} />
        <View style={skeletonStyles.lineBar} />
      </Animated.View>

      {/* Button skeleton */}
      <Animated.View style={[skeletonStyles.button, { opacity: pulseAnim }]} />

      {/* Alternatives skeleton */}
      <View style={skeletonStyles.labelLine} />
      <Animated.View style={[skeletonStyles.altRow, { opacity: pulseAnim }]} />
      <Animated.View style={[skeletonStyles.altRow, { opacity: pulseAnim }]} />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  container: { padding: Spacing.lg },
  topCard: {
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    height: 220,
  },
  line120: {
    width: 120,
    height: 14,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 12,
  },
  line200: {
    width: 200,
    height: 20,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 16,
  },
  lineLarge: {
    width: 100,
    height: 32,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 20,
  },
  lineBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
  },
  button: {
    height: 48,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
  },
  labelLine: {
    width: 120,
    height: 12,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    marginBottom: Spacing.sm,
  },
  altRow: {
    height: 56,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/**
 * Recommendation result screen -- Shows the best card for a specific category.
 *
 * DRD Section 6 (Recommendation Result):
 * - Calls supabase.rpc('recommend', { p_category_id })
 * - Top card with GLASSMORPHISM: BlurView with Glass tokens from theme
 * - Alternatives as flat cards below (NO glass)
 * - Loading state: skeleton screen
 * - Empty state: "Add cards to get recommendations"
 * - Edge case: all caps exhausted
 */
export default function RecommendResultScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [results, setResults] = useState<RecommendRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardImages, setCardImages] = useState<Record<string, ImageSourcePropType | { uri: string }>>({});

  const categoryInfo = category ? getCategoryById(category) : undefined;

  // Progress bar animation
  const progressAnim = useRef(new Animated.Value(0)).current;

  // -----------------------------------------------------------------------
  // Fetch recommendation via RPC
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!user || !category) return;

    const fetchRecommendation = async () => {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('recommend', {
        p_category_id: category,
      });

      if (rpcError) {
        console.error('Recommendation RPC error:', rpcError);
        setError('Unable to load recommendations. Please try again.');
      } else if (data) {
        setResults(data as RecommendRow[]);
        // Track MARU — north star metric
        track('recommendation_used', {
          category: category,
          results_count: (data as RecommendRow[]).length,
          top_card: (data as RecommendRow[])[0]?.card_name ?? 'none',
        }, user.id);
        // Animate progress bar
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();
      }

      setLoading(false);
    };

    fetchRecommendation();
  }, [user, category]);

  // -----------------------------------------------------------------------
  // Fetch card images when results change
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (results.length === 0) return;

    const cardIds = results.map((r) => r.card_id);

    const fetchCardImages = async () => {
      const { data } = await supabase
        .from('cards')
        .select('id, slug, image_url')
        .in('id', cardIds);

      if (!data) return;

      const imageMap: Record<string, ImageSourcePropType | { uri: string }> = {};
      for (const card of data as { id: string; slug: string; image_url: string | null }[]) {
        const localImage = card.slug ? getCardImage(card.slug) : undefined;
        if (card.image_url) {
          imageMap[card.id] = { uri: card.image_url };
        } else if (localImage) {
          imageMap[card.id] = localImage;
        }
      }
      setCardImages(imageMap);
    };

    fetchCardImages();
  }, [results]);

  // -----------------------------------------------------------------------
  // Swap alternative to top position
  // -----------------------------------------------------------------------
  const handleSelectAlternative = useCallback((alt: RecommendRow) => {
    setResults((prev) => {
      const topIdx = prev.findIndex((r) => r.is_recommended);
      const altIdx = prev.findIndex((r) => r.card_id === alt.card_id);
      if (topIdx === -1 || altIdx === -1) return prev;

      const next = [...prev];
      next[topIdx] = { ...next[topIdx], is_recommended: false };
      next[altIdx] = { ...next[altIdx], is_recommended: true };
      return next;
    });
  }, []);

  // -----------------------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------------------
  const handleLogTransaction = () => {
    // Navigate to log transaction screen with pre-filled category + card
    const topCard = results.find((r) => r.is_recommended) ?? results[0];
    if (topCard) {
      router.push(`/(tabs)/log?category=${category}&card=${topCard.card_id}`);
    } else {
      router.push(`/(tabs)/log?category=${category}`);
    }
  };

  // -----------------------------------------------------------------------
  // Loading state: skeleton screen
  // -----------------------------------------------------------------------
  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{ title: categoryInfo?.name ?? 'Recommendation', headerBackTitle: 'Back' }}
        />
        <ImageBackground
          source={require('../../assets/background.png')}
          style={styles.background}
          imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
        >
          <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <SkeletonLoader />
          </SafeAreaView>
        </ImageBackground>
      </>
    );
  }

  // -----------------------------------------------------------------------
  // Error state
  // -----------------------------------------------------------------------
  if (error) {
    return (
      <>
        <Stack.Screen
          options={{ title: categoryInfo?.name ?? 'Recommendation', headerBackTitle: 'Back' }}
        />
        <ImageBackground
          source={require('../../assets/background.png')}
          style={styles.background}
          imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
        >
          <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <EmptyState
              icon="alert-circle-outline"
              title="Something went wrong"
              description={error}
              ctaLabel="Try Again"
              onCtaPress={() => {
                setLoading(true);
                setError(null);
                router.replace(`/recommend/${category}`);
              }}
            />
          </SafeAreaView>
        </ImageBackground>
      </>
    );
  }

  // -----------------------------------------------------------------------
  // Empty state: no cards
  // -----------------------------------------------------------------------
  if (results.length === 0) {
    return (
      <>
        <Stack.Screen
          options={{ title: categoryInfo?.name ?? 'Recommendation', headerBackTitle: 'Back' }}
        />
        <ImageBackground
          source={require('../../assets/background.png')}
          style={styles.background}
          imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
        >
          <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <EmptyState
              icon="card-outline"
              title="No cards available"
              description="Add cards to get recommendations for this category."
              ctaLabel="Add Cards"
              onCtaPress={() => router.push('/onboarding')}
            />
          </SafeAreaView>
        </ImageBackground>
      </>
    );
  }

  // -----------------------------------------------------------------------
  // Parse results
  // -----------------------------------------------------------------------
  const topPick = results.find((r) => r.is_recommended) ?? results[0];
  const alternatives = results
    .filter((r) => r.card_id !== topPick.card_id)
    .filter((r, i, arr) => arr.findIndex((x) => x.card_id === r.card_id) === i);

  // Check if all caps are exhausted
  const allCapsExhausted =
    topPick.remaining_cap !== null && topPick.remaining_cap <= 0;

  // Cap progress calculations for top card
  const hasTopCap =
    topPick.monthly_cap_amount !== null && topPick.monthly_cap_amount > 0;
  const topCapRemaining = topPick.remaining_cap ?? 0;
  const topCapTotal = topPick.monthly_cap_amount ?? 0;
  const topCapSpent = hasTopCap ? topCapTotal - topCapRemaining : 0;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <>
      <Stack.Screen
        options={{
          title: categoryInfo?.name ?? category,
          headerBackTitle: 'Back',
        }}
      />
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.background}
        imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
      >
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <FlatList
          data={alternatives}
          keyExtractor={(item, index) => `${item.card_id}-${index}`}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              {/* Insurance warning banner for Bills category */}
              {category === 'bills' && (
                <View style={styles.insuranceWarning}>
                  <Ionicons name="warning-outline" size={18} color="#F59E0B" />
                  <Text style={styles.insuranceWarningText}>
                    Insurance payments are excluded from bonus earning on most cards. Base rate only.
                  </Text>
                </View>
              )}

              {/* "USE THIS CARD" overline label */}
              <Text style={styles.overlineLabel}>USE THIS CARD</Text>

              {/* Top card with glassmorphism */}
              <GlassCard>
                {/* All caps exhausted notice */}
                {allCapsExhausted && (
                  <View style={styles.exhaustedNotice}>
                    <Text style={styles.exhaustedText}>
                      All bonus caps reached for {categoryInfo?.name ?? category}
                    </Text>
                    <Text style={styles.exhaustedSubtext}>Best available:</Text>
                  </View>
                )}

                <View style={styles.topCardRow}>
                  {cardImages[topPick.card_id] ? (
                    <Image
                      source={cardImages[topPick.card_id]}
                      style={styles.topCardImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.topCardImagePlaceholder}>
                      <Text style={styles.topCardPlaceholderText}>
                        {topPick.bank.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.topCardDetails}>
                    <Text style={styles.topCardBank}>{topPick.bank}</Text>
                    <Text style={styles.topCardName}>{topPick.card_name}</Text>
                    <Text style={styles.topCardRate}>
                      {topPick.earn_rate_mpd.toFixed(1)} mpd
                    </Text>
                    {topPick.conditions_note && (
                      <View style={styles.conditionsRow}>
                        <Ionicons name="information-circle-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.conditionsText}>{topPick.conditions_note}</Text>
                      </View>
                    )}
                    {topPick.min_spend_met === false && topPick.min_spend_threshold != null && (
                      <View style={styles.minSpendNudge}>
                        <Ionicons name="alert-circle" size={14} color="#F59E0B" />
                        <Text style={styles.minSpendNudgeText}>
                          Spend ${Math.ceil(topPick.min_spend_threshold - topPick.total_monthly_spend).toLocaleString()} more this month to unlock bonus rate
                        </Text>
                      </View>
                    )}
                    {topPick.min_spend_met === true && topPick.min_spend_threshold != null && (
                      <View style={styles.minSpendMet}>
                        <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                        <Text style={styles.minSpendMetText}>Min spend met — earning bonus rate</Text>
                      </View>
                    )}
                    {topPick.requires_contactless && (
                      <View style={styles.contactlessBadge}>
                        <Ionicons name="wifi" size={14} color="#3B82F6" />
                        <Text style={styles.contactlessBadgeText}>Requires contactless payment</Text>
                      </View>
                    )}
                    {hasTopCap ? (
                      <View style={styles.topCapSection}>
                        <Text style={styles.topCapLabel}>Remaining Cap</Text>
                        <CapProgressBar
                          spent={topCapSpent}
                          cap={topCapTotal}
                          showValues
                          height={8}
                        />
                      </View>
                    ) : (
                      <Text style={styles.noCap}>No cap limit</Text>
                    )}
                  </View>
                </View>
              </GlassCard>

              {/* Log Transaction CTA */}
              <TouchableOpacity
                style={styles.logCta}
                onPress={handleLogTransaction}
                activeOpacity={0.8}
              >
                <Text style={styles.logCtaText}>Log Transaction</Text>
              </TouchableOpacity>

              {/* Smart Pay CTA */}
              <TouchableOpacity
                style={styles.smartPayCta}
                onPress={() => router.push(`/pay?source=recommend_cta&category=${category}`)}
                activeOpacity={0.8}
              >
                <Ionicons name="flash" size={18} color={Colors.brandGold} />
                <Text style={styles.smartPayCtaText}>Smart Pay</Text>
              </TouchableOpacity>

              {/* Alternatives header */}
              {alternatives.length > 0 && (
                <Text style={styles.overlineLabel}>ALTERNATIVES</Text>
              )}
            </View>
          }
          renderItem={({ item }) => {
            const isCapExhausted =
              item.remaining_cap !== null && item.remaining_cap <= 0;
            const hasItemCap =
              item.monthly_cap_amount !== null && item.monthly_cap_amount > 0;

            return (
              <TouchableOpacity
                style={styles.altRow}
                onPress={() => handleSelectAlternative(item)}
                activeOpacity={0.7}
              >
                {cardImages[item.card_id] ? (
                  <Image
                    source={cardImages[item.card_id]}
                    style={styles.altCardImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.altCardImagePlaceholder}>
                    <Text style={styles.altPlaceholderText}>
                      {item.bank.charAt(0)}
                    </Text>
                  </View>
                )}
                <View style={styles.altInfo}>
                  <Text style={styles.altCardName}>{item.card_name}</Text>
                  <Text style={styles.altBank}>{item.bank}</Text>
                  {item.conditions_note && (
                    <Text style={styles.altConditions} numberOfLines={1}>{item.conditions_note}</Text>
                  )}
                  {item.min_spend_met === false && item.min_spend_threshold != null && (
                    <Text style={styles.altMinSpendWarning} numberOfLines={1}>
                      Min spend ${item.min_spend_threshold.toLocaleString()}/mo not met
                    </Text>
                  )}
                  {item.requires_contactless && (
                    <Text style={styles.altContactless} numberOfLines={1}>
                      Contactless only
                    </Text>
                  )}
                </View>
                <Text style={styles.altRate}>
                  {item.earn_rate_mpd.toFixed(1)} mpd
                </Text>
                {isCapExhausted ? (
                  <View style={styles.fullBadge}>
                    <Text style={styles.fullBadgeText}>FULL</Text>
                  </View>
                ) : hasItemCap ? (
                  <View style={styles.okDot} />
                ) : null}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.noAlternatives}>
              This is the only card in your wallet for this category.
            </Text>
          }
        />
      </SafeAreaView>
      </ImageBackground>
    </>
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
  listContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl + 40,
  },

  // Overline labels
  overlineLabel: {
    ...Typography.captionBold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },

  // Top card (inside GlassCard)
  exhaustedNotice: {
    marginBottom: Spacing.md,
  },
  exhaustedText: {
    ...Typography.captionBold,
    color: Colors.danger,
    marginBottom: 4,
  },
  exhaustedSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  topCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  topCardImage: {
    width: 120,
    height: 76,
    borderRadius: 6,
  },
  topCardImagePlaceholder: {
    width: 120,
    height: 76,
    borderRadius: 6,
    backgroundColor: 'rgba(197, 165, 90, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
  },
  topCardPlaceholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.brandGold,
    opacity: 0.5,
  },
  topCardDetails: {
    flex: 1,
  },
  topCardBank: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topCardName: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
    marginBottom: 2,
  },
  topCardRate: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    color: Colors.brandGold,
    marginBottom: Spacing.xs,
  },
  topCapSection: {
    marginTop: Spacing.sm,
  },
  topCapLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  noCap: {
    ...Typography.caption,
    color: Colors.success,
    marginTop: Spacing.sm,
  },

  // Log Transaction CTA — gold to match auth pages
  logCta: {
    backgroundColor: Colors.brandGold,
    borderRadius: 20,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  logCtaText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
  },
  smartPayCta: {
    borderRadius: 20,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.brandGold,
    gap: Spacing.xs,
  },
  smartPayCtaText: {
    ...Typography.bodyBold,
    color: Colors.brandGold,
  },

  // Alternative card rows — rounded glass container
  altRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  altCardImage: {
    width: 64,
    height: 40,
    borderRadius: 4,
  },
  altCardImagePlaceholder: {
    width: 64,
    height: 40,
    borderRadius: 4,
    backgroundColor: 'rgba(197, 165, 90, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
  },
  altPlaceholderText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.brandGold,
    opacity: 0.5,
  },
  altInfo: {
    flex: 1,
  },
  altCardName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  altBank: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  altRate: {
    ...Typography.body,
    color: Colors.brandGold,
    fontWeight: '600',
    marginRight: Spacing.sm,
  },

  // Cap indicators for alternatives
  fullBadge: {
    backgroundColor: Colors.danger,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  fullBadgeText: {
    ...Typography.label,
    color: Colors.textInverse,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  okDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },

  noAlternatives: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },

  // Insurance warning banner (Bills category)
  insuranceWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  insuranceWarningText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    flex: 1,
  },

  // Conditions note (top card)
  conditionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    marginBottom: Spacing.xs,
  },
  conditionsText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
  },

  // Conditions note (alt cards)
  altConditions: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },

  // Min spend nudge (top card — not met)
  minSpendNudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  minSpendNudgeText: {
    ...Typography.caption,
    color: '#92400E',
    flex: 1,
    fontSize: 12,
  },

  // Min spend met (top card — met)
  minSpendMet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  minSpendMetText: {
    ...Typography.caption,
    color: Colors.success,
    fontSize: 12,
  },

  // Contactless badge (top card)
  contactlessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  contactlessBadgeText: {
    ...Typography.caption,
    color: '#1E40AF',
    flex: 1,
    fontSize: 12,
  },

  // Contactless caption (alt cards)
  altContactless: {
    ...Typography.caption,
    color: '#3B82F6',
    fontSize: 11,
    marginTop: 2,
  },

  // Min spend warning (alt cards)
  altMinSpendWarning: {
    ...Typography.caption,
    color: '#D97706',
    fontSize: 11,
    marginTop: 2,
  },
});
