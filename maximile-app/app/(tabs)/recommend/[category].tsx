import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { getCategoryById, BILLS_SUBCATEGORIES } from '../../../constants/categories';
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
  Glass,
} from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../../components/GlassCard';
import CapProgressBar from '../../../components/CapProgressBar';
import EmptyState from '../../../components/EmptyState';
import { track } from '../../../lib/analytics';
import { getCardImage } from '../../../constants/cardImages';

// ---------------------------------------------------------------------------
// HealthHub-eligible cards (static map — no DB changes needed)
// ---------------------------------------------------------------------------

interface HealthHubCard {
  slug: string;
  earnRate: number;
  capDescription: string;
  steps: string[];
}

const HEALTHHUB_ELIGIBLE: Record<string, HealthHubCard> = {
  'citi-rewards': {
    slug: 'citi-rewards',
    earnRate: 4.0,
    capDescription: '$1,000/mo shared with online',
    steps: [
      'Download the HealthHub app from the App Store or Google Play.',
      'Log in with your Singpass and navigate to "Pay Hospital Bills".',
      'Select the hospital and enter your bill reference number.',
      'Pay with your Citi Rewards card — charges as MCC 8099 (online), earning 4 mpd.',
    ],
  },
  'dbs-womans-world-card': {
    slug: 'dbs-womans-world-card',
    earnRate: 4.0,
    capDescription: '$2,000/mo',
    steps: [
      'Download the HealthHub app from the App Store or Google Play.',
      'Log in with your Singpass and navigate to "Pay Hospital Bills".',
      'Select the hospital and enter your bill reference number.',
      'Pay with your DBS Woman\'s World Card — charges as MCC 8099 (online), earning 4 mpd.',
    ],
  },
  'hsbc-revolution': {
    slug: 'hsbc-revolution',
    earnRate: 4.0,
    capDescription: '$1,000/mo shared across bonus categories',
    steps: [
      'Download the HealthHub app from the App Store or Google Play.',
      'Log in with your Singpass and navigate to "Pay Hospital Bills".',
      'Select the hospital and enter your bill reference number.',
      'Pay with your HSBC Revolution card — charges as MCC 8099 (online), earning 4 mpd.',
    ],
  },
};

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
  const { category, subcategory } = useLocalSearchParams<{ category: string; subcategory?: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [results, setResults] = useState<RecommendRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardImages, setCardImages] = useState<Record<string, ImageSourcePropType | { uri: string }>>({});
  const [cardSlugs, setCardSlugs] = useState<Record<string, string>>({});
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  const categoryInfo = category ? getCategoryById(category) : undefined;

  // Sprint 28 — subcategory metadata
  const subcategoryInfo = subcategory
    ? BILLS_SUBCATEGORIES.find((s) => s.id === subcategory)
    : undefined;

  // Progress bar animation
  const progressAnim = useRef(new Animated.Value(0)).current;

  // -----------------------------------------------------------------------
  // Fetch recommendation via RPC
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!user || !category) return;

    // Sprint 28 (S28.4) — zero-mpd subcategories skip the RPC entirely
    if (subcategoryInfo?.zeroMpd) {
      setLoading(false);
      return;
    }

    const fetchRecommendation = async () => {
      setLoading(true);
      setError(null);

      // Sprint 28 (S28.3) — pass subcategory to RPC when present
      const rpcParams: { p_category_id: string; p_subcategory?: string } = {
        p_category_id: category,
      };
      if (subcategory) {
        rpcParams.p_subcategory = subcategory;
      }

      const { data, error: rpcError } = await supabase.rpc('recommend', rpcParams);

      if (rpcError) {
        console.error('Recommendation RPC error:', rpcError);
        setError('Unable to load recommendations. Please try again.');
      } else if (data) {
        setResults(data as RecommendRow[]);
        // Track MARU — north star metric
        track('recommendation_used', {
          category: category,
          subcategory: subcategory ?? null,
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
  }, [user, category, subcategory, subcategoryInfo]);

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
      const slugMap: Record<string, string> = {};
      for (const card of data as { id: string; slug: string; image_url: string | null }[]) {
        if (card.slug) slugMap[card.id] = card.slug;
        const localImage = card.slug ? getCardImage(card.slug) : undefined;
        if (card.image_url) {
          imageMap[card.id] = { uri: card.image_url };
        } else if (localImage) {
          imageMap[card.id] = localImage;
        }
      }
      setCardImages(imageMap);
      setCardSlugs(slugMap);
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
  // HealthHub personalization (Part 2)
  // -----------------------------------------------------------------------
  const healthHubMatches = useMemo(() => {
    if (subcategory !== 'hospital') return [];
    return results
      .filter((r) => {
        const slug = cardSlugs[r.card_id];
        return slug && slug in HEALTHHUB_ELIGIBLE;
      })
      .map((r) => ({
        ...r,
        healthHub: HEALTHHUB_ELIGIBLE[cardSlugs[r.card_id]],
      }));
  }, [subcategory, results, cardSlugs]);

  // Quick lookup: card_id → HealthHub info (for inline badges)
  const healthHubByCardId = useMemo(() => {
    const map = new Map<string, HealthHubCard>();
    if (subcategory !== 'hospital') return map;
    for (const r of results) {
      const slug = cardSlugs[r.card_id];
      if (slug && slug in HEALTHHUB_ELIGIBLE) {
        map.set(r.card_id, HEALTHHUB_ELIGIBLE[slug]);
      }
    }
    return map;
  }, [subcategory, results, cardSlugs]);

  const toggleSteps = useCallback((cardId: string) => {
    setExpandedSteps((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
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
          source={require('../../../assets/background.png')}
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
          source={require('../../../assets/background.png')}
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
  // Sprint 28 (S28.4) — 0-mpd empty state for Utilities and Insurance
  // -----------------------------------------------------------------------
  if (subcategoryInfo?.zeroMpd) {
    const isUtilities = subcategory === 'utilities';
    const isEducation = subcategory === 'education';
    return (
      <>
        <Stack.Screen
          options={{
            title: subcategoryInfo.label,
            headerBackTitle: 'Bills',
          }}
        />
        <ImageBackground
          source={require('../../../assets/background.png')}
          style={styles.background}
          imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
        >
          <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <View style={styles.zeroMpdContainer}>
              <Ionicons name={subcategoryInfo.icon as any} size={48} color={Colors.brandGold} style={styles.zeroMpdIcon} />
              <Text style={styles.zeroMpdTitle}>{subcategoryInfo.label} Payments</Text>
              {isUtilities ? (
                <>
                  <View style={styles.zeroMpdCard}>
                    <Text style={styles.zeroMpdBody}>
                      Most banks exclude utility payments (SP Services, Geneco, City Energy).
                    </Text>
                    <Text style={[styles.zeroMpdBody, styles.zeroMpdBodyBold]}>
                      All cards earn 0 miles on utilities.
                    </Text>
                    <Text style={styles.zeroMpdBody}>No recommendation available.</Text>
                  </View>
                </>
              ) : isEducation ? (
                <>
                  <View style={styles.zeroMpdCard}>
                    <Text style={styles.zeroMpdBody}>
                      School fees (MCCs 8211/8220) earn 0 miles on all major bank cards — DBS, Citi, UOB, OCBC, HSBC, SC, Amex, and BOC all exclude education MCCs.
                    </Text>
                    <Text style={[styles.zeroMpdBody, styles.zeroMpdBodyBold]}>
                      No direct recommendation available.
                    </Text>
                  </View>
                  <View style={styles.zeroMpdException}>
                    <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.zeroMpdExceptionText}>
                      Workaround: Pay via Atome (codes as MCC 5999) to earn 4 mpd on Citi Rewards, DBS Woman's World, or HSBC Revolution. CardUp also accepts school fees for miles at a small admin fee.
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.zeroMpdCard}>
                  <Text style={styles.zeroMpdBody}>
                    Insurance premium payments earn 0 miles on all major bank cards.
                  </Text>
                  <Text style={[styles.zeroMpdBody, styles.zeroMpdBodyBold]}>
                    No recommendation available.
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.zeroMpdBackBtn}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Text style={styles.zeroMpdBackBtnText}>Choose Another Bill Type</Text>
              </TouchableOpacity>
            </View>
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
          source={require('../../../assets/background.png')}
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
          // Sprint 28: when a subcategory is selected, title shows the subcategory name
          title: subcategoryInfo?.label ?? categoryInfo?.name ?? category,
          headerBackTitle: subcategory ? 'Bills' : 'Back',
        }}
      />
      <ImageBackground
        source={require('../../../assets/background.png')}
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
              {/* HealthHub tip for Hospital subcategory (no eligible cards) */}
              {false && subcategory === 'hospital' && healthHubMatches.length > 0 && (
                <>
                  {healthHubMatches.map((match) => (
                    <View key={`hh-${match.card_id}`} style={styles.healthHubCard}>
                      <View style={styles.healthHubCardHeader}>
                        <Ionicons name="medkit" size={16} color={Colors.brandGold} />
                        <Text style={styles.healthHubCardTitle}>
                          {match.card_name}
                        </Text>
                        <Text style={styles.healthHubCardBank}>{match.bank}</Text>
                      </View>
                      <View style={styles.healthHubRateRow}>
                        <Text style={styles.healthHubRateOld}>0 mpd direct</Text>
                        <Ionicons name="arrow-forward" size={14} color={Colors.textSecondary} />
                        <Text style={styles.healthHubRateNew}>
                          {match.healthHub.earnRate} mpd via HealthHub
                        </Text>
                      </View>
                      <Text style={styles.healthHubCapText}>
                        Cap: {match.healthHub.capDescription}
                      </Text>
                      <TouchableOpacity
                        style={styles.healthHubStepsToggle}
                        onPress={() => toggleSteps(match.card_id)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.healthHubStepsToggleText}>
                          How to pay via HealthHub
                        </Text>
                        <Ionicons
                          name={expandedSteps[match.card_id] ? 'chevron-up' : 'chevron-down'}
                          size={16}
                          color={Colors.brandGold}
                        />
                      </TouchableOpacity>
                      {expandedSteps[match.card_id] && (
                        <View style={styles.healthHubStepsList}>
                          {match.healthHub.steps.map((step, idx) => (
                            <View key={idx} style={styles.healthHubStepRow}>
                              <Text style={styles.healthHubStepNumber}>{idx + 1}</Text>
                              <Text style={styles.healthHubStepText}>{step}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </>
              )}
              {subcategory === 'hospital' && healthHubMatches.length === 0 && (
                <View style={styles.healthHubTip}>
                  <View style={styles.healthHubTipHeader}>
                    <Ionicons name="bulb-outline" size={16} color="#1557B0" />
                    <Text style={styles.healthHubTipTitle}>Did you know?</Text>
                  </View>
                  <Text style={styles.healthHubTipBody}>
                    Some cards earn 4 mpd on hospital bills when paid via the HealthHub app (MCC changes from 8062 to 8099). Eligible cards: Citi Rewards, DBS Woman's World Card, HSBC Revolution.
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
                    {subcategory === 'hospital' && topPick.conditions_note?.includes('Private hospital only') && (
                      <View style={styles.privateHospitalBadge}>
                        <Ionicons name="business" size={14} color="#8B5CF6" />
                        <Text style={styles.privateHospitalText}>Private hospital only</Text>
                      </View>
                    )}
                    {subcategory === 'telco' && topPick.conditions_note?.includes('via app') && (
                      <View style={styles.paidOnlineBadge}>
                        <Ionicons name="phone-portrait-outline" size={14} color="#D97706" />
                        <Text style={styles.paidOnlineText}>Pay online / in app</Text>
                      </View>
                    )}
                    {healthHubByCardId.has(topPick.card_id) && (
                      <View style={styles.healthHubBadge}>
                        <Ionicons name="medkit" size={14} color="#10B981" />
                        <Text style={styles.healthHubBadgeText}>
                          Pay via HealthHub → {healthHubByCardId.get(topPick.card_id)!.earnRate} mpd
                        </Text>
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
                  {subcategory === 'hospital' && item.conditions_note?.includes('Private hospital only') && (
                    <Text style={styles.altPrivateHospital} numberOfLines={1}>
                      Private hospital only
                    </Text>
                  )}
                  {subcategory === 'telco' && item.conditions_note?.includes('via app') && (
                    <Text style={styles.altPaidOnline} numberOfLines={1}>
                      Pay online / in app
                    </Text>
                  )}
                  {healthHubByCardId.has(item.card_id) && (
                    <View style={styles.healthHubBadgeInline}>
                      <Ionicons name="medkit" size={12} color="#10B981" />
                      <Text style={styles.healthHubBadgeInlineText}>
                        HealthHub → {healthHubByCardId.get(item.card_id)!.earnRate} mpd
                      </Text>
                    </View>
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

  // Sprint 28 (S28.4) — 0-mpd empty state (Utilities / Insurance)
  zeroMpdContainer: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.xxxl,
  },
  zeroMpdIcon: {
    marginBottom: Spacing.md,
  },
  zeroMpdTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  zeroMpdCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
    width: '100%',
    ...Shadows.sm,
  },
  zeroMpdBody: {
    ...Typography.body,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  zeroMpdBodyBold: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  zeroMpdException: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xl,
    width: '100%',
    borderLeftWidth: 3,
    borderLeftColor: Colors.textTertiary,
  },
  zeroMpdExceptionText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  zeroMpdBackBtn: {
    borderRadius: 20,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.brandGold,
    paddingHorizontal: Spacing.xl,
  },
  zeroMpdBackBtnText: {
    ...Typography.bodyBold,
    color: Colors.brandGold,
  },

  // HealthHub personalized card (Hospital subcategory)
  healthHubCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.brandGold,
    ...Shadows.sm,
  },
  healthHubCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  healthHubCardTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    flex: 1,
  },
  healthHubCardBank: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  healthHubRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  healthHubRateOld: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  healthHubRateNew: {
    ...Typography.captionBold,
    color: '#16A34A',
  },
  healthHubCapText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  healthHubStepsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  healthHubStepsToggleText: {
    ...Typography.captionBold,
    color: Colors.brandGold,
  },
  healthHubStepsList: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  healthHubStepRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  healthHubStepNumber: {
    ...Typography.captionBold,
    color: Colors.brandGold,
    width: 16,
  },
  healthHubStepText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },

  // HealthHub educational tip (user doesn't own eligible cards)
  healthHubTip: {
    backgroundColor: 'rgba(26, 115, 232, 0.08)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  healthHubTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  healthHubTipTitle: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  healthHubTipBody: {
    ...Typography.caption,
    color: Colors.textPrimary,
    lineHeight: 18,
  },

  // Private hospital badge (on top pick card)
  privateHospitalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: Spacing.xs,
    alignSelf: 'flex-start',
  },
  privateHospitalText: {
    ...Typography.caption,
    color: '#7C3AED',
    fontWeight: '600',
    fontSize: 12,
  },

  // Private hospital caption (alt cards)
  altPrivateHospital: {
    ...Typography.caption,
    color: '#8B5CF6',
    fontSize: 11,
    marginTop: 2,
  },

  // HealthHub inline badge (on top pick card)
  healthHubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: Spacing.xs,
    alignSelf: 'flex-start',
  },
  healthHubBadgeText: {
    ...Typography.caption,
    color: '#059669',
    fontWeight: '600',
  },

  // "Pay online / in app" badge (top card — telco)
  paidOnlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: Spacing.xs,
    alignSelf: 'flex-start',
  },
  paidOnlineText: {
    ...Typography.caption,
    color: '#D97706',
    fontWeight: '600',
    fontSize: 12,
  },

  // "Pay online / in app" caption (alt cards — telco)
  altPaidOnline: {
    ...Typography.caption,
    color: '#D97706',
    fontSize: 11,
    marginTop: 2,
  },

  // HealthHub inline badge (on alternative rows)
  healthHubBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  healthHubBadgeInlineText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
  },
});
