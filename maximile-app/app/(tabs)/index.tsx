import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CATEGORIES } from '../../constants/categories';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import CategoryTile from '../../components/CategoryTile';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import MerchantSearchBar from '../../components/MerchantSearchBar';
import MerchantAutocomplete from '../../components/MerchantAutocomplete';
import { useMerchantSearch } from '../../hooks/useMerchantSearch';
import CoachMarkOverlay from '../../components/CoachMarkOverlay';
import { useCoachMark } from '../../hooks/useCoachMark';
import { showNetworkErrorAlert } from '../../lib/error-handler';
import { track } from '../../lib/analytics';
import RateChangeBanner from '../../components/RateChangeBanner';
import type { RateAlert } from '../../components/RateChangeBanner';
import type { UserCard, UserRateChangeResult } from '../../lib/supabase-types';
import type { MerchantEntry } from '../../lib/merchant-catalogue';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Determine which category to highlight based on time of day.
 * DRD Section 6.6:
 *   - 11:00-14:00 -> Dining
 *   - 17:00-21:00 -> Dining
 *   - 07:00-09:00 -> Transport
 *   - Default (all other times) -> null (no highlight)
 */
function getSuggestedCategory(): string | null {
  const hour = new Date().getHours();

  if (hour >= 11 && hour < 14) return 'dining';
  if (hour >= 17 && hour < 21) return 'dining';
  if (hour >= 7 && hour < 9) return 'transport';

  return null;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function RecommendScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [rateAlerts, setRateAlerts] = useState<RateAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Merchant search state (Sprint 34 — F42)
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { results: searchResults, isSearching } = useMerchantSearch(searchQuery);
  const prevResultsLengthRef = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const searchBarRef = useRef<View>(null);
  const categoryGridRef = useRef<View>(null);
  const fabRef = useRef<View>(null);

  const suggestedCategory = useMemo(() => getSuggestedCategory(), []);

  const { coachMarkVisible, currentStep, spotRect, advance, dismiss } = useCoachMark({
    enabled: !loading && userCards.length > 0,
    refs: [searchBarRef, categoryGridRef, fabRef],
    scrollViewRef,
    scrollOffsets: [0, 0, 99999],
  });

  // -----------------------------------------------------------------------
  // Fetch user cards on every screen focus (so new cards appear immediately)
  // -----------------------------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setLoading(false);
        return;
      }

      const fetchUserCards = async () => {
        try {
          const { data, error } = await supabase
            .from('user_cards')
            .select('*');

          if (!error && data) {
            setUserCards(data as UserCard[]);
          }
          setLoading(false);
        } catch {
          setLoading(false);
          showNetworkErrorAlert();
        }
      };

      fetchUserCards();
    }, [user])
  );

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase.rpc('get_user_rate_changes', {
          p_user_id: user.id,
        });
        if (!error && data) {
          const alerts: RateAlert[] = (data as UserRateChangeResult[]).map((rc) => ({
            id: rc.rate_change_id,
            alertTitle: rc.alert_title,
            alertBody: rc.alert_body,
            severity: rc.severity as 'info' | 'warning' | 'critical',
            cardId: rc.card_id,
            cardName: rc.card_name,
            effectiveDate: rc.effective_date,
            changeType: rc.change_type,
          }));
          setRateAlerts(alerts);
        }
      } catch {
        // Silently fail — alerts are non-critical
      }
    };
    fetchAlerts();
  }, [user]);

  // -----------------------------------------------------------------------
  // Merchant search analytics (Sprint 34 — F42)
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (searchResults.length > 0 && prevResultsLengthRef.current === 0) {
      track('search_initiated', { query: searchQuery.trim() }, user?.id);
    }
    prevResultsLengthRef.current = searchResults.length;
  }, [searchResults, searchQuery, user?.id]);

  const handleMerchantSelect = useCallback(
    (merchant: MerchantEntry) => {
      track('merchant_selected', {
        merchant_name: merchant.name,
        category: merchant.categoryId,
        subcategory: merchant.subcategory ?? '',
      }, user?.id);

      // Clear search and dismiss keyboard
      setSearchQuery('');
      setIsSearchFocused(false);
      Keyboard.dismiss();

      // Route based on category and subcategory
      if (merchant.categoryId === 'bills' && merchant.subcategory) {
        router.push(
          `/recommend/${merchant.categoryId}?subcategory=${merchant.subcategory}&merchantName=${encodeURIComponent(merchant.name)}`
        );
      } else if (merchant.categoryId === 'bills') {
        router.push('/(tabs)/bills-subcategory');
      } else {
        router.push(
          `/recommend/${merchant.categoryId}?merchantName=${encodeURIComponent(merchant.name)}`
        );
      }
    },
    [router, user?.id]
  );

  const handleSearchClear = useCallback(() => {
    if (searchQuery.trim().length >= 2) {
      track('search_abandoned', { query: searchQuery.trim() }, user?.id);
    }
    setSearchQuery('');
  }, [searchQuery, user?.id]);

  const handleSearchBlur = useCallback(() => {
    // Delay hiding autocomplete so onSelect has time to fire
    setTimeout(() => setIsSearchFocused(false), 150);
  }, []);

  // -----------------------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------------------
  const handleCategoryPress = (categoryId: string) => {
    track('screen_view', { screen: 'recommend', category: categoryId }, user?.id);
    // Bills routes to the subcategory picker first (Sprint 28 — S28.2)
    if (categoryId === 'bills') {
      router.push('/(tabs)/bills-subcategory');
      return;
    }
    router.push(`/recommend/${categoryId}`);
  };

  const handleDismissAlert = async (alertId: string) => {
    if (!user) return;
    const dismissed = rateAlerts.find((a) => a.id === alertId);
    setRateAlerts((prev) => prev.filter((a) => a.id !== alertId));
    track('rate_alert_dismissed', { alert_id: alertId, severity: dismissed?.severity ?? 'info' }, user.id);
    try {
      await supabase.from('user_alert_reads').insert({
        user_id: user.id,
        rate_change_id: alertId,
      });
    } catch {
      // Best-effort write
    }
  };

  const handleViewDetails = (alert: RateAlert) => {
    track('rate_alert_viewed', { alert_id: alert.id, card_id: alert.cardId ?? '' }, user?.id);
    if (alert.cardId) {
      router.push(`/card/${alert.cardId}`);
    }
  };

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  // -----------------------------------------------------------------------
  // Empty state: no cards in portfolio
  // -----------------------------------------------------------------------
  if (userCards.length === 0) {
    return (
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.background}
        imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <View style={styles.emptyContainer}>
            <Text style={styles.screenTitle}>What are you spending on?</Text>
            <EmptyState
              icon="wallet-outline"
              title="Add cards to get recommendations"
              description="Add your miles credit cards to get personalized recommendations."
              ctaLabel="Add Cards"
              onCtaPress={() => router.push('/onboarding')}
            />
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  const showAutocomplete = isSearchFocused && (searchResults.length > 0 || searchQuery.trim().length >= 2);

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.background}
      imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
    >
      <SafeAreaView style={styles.safeArea} edges={[]}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + Spacing.md }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Screen title */}
          <Text style={styles.screenTitle}>What are you spending on?</Text>
          <Text style={styles.screenSubtitle}>
            Search a merchant or tap a category
          </Text>

          {/* Merchant search bar (Sprint 34 — F42) */}
          <View ref={searchBarRef}>
            <MerchantSearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={handleSearchBlur}
              onClear={handleSearchClear}
            />
          </View>

          {/* Autocomplete dropdown */}
          <MerchantAutocomplete
            results={searchResults}
            visible={showAutocomplete}
            onSelect={handleMerchantSelect}
            query={searchQuery}
          />

          {/* 2-column grid for all 8 categories */}
          <View ref={categoryGridRef} style={styles.categoryGrid}>
            {CATEGORIES.map((category) => (
              <View key={category.id} style={styles.categoryTileWrapper}>
                <CategoryTile
                  id={category.id}
                  name={category.name}
                  emoji={category.emoji}
                  icon={category.icon}
                  iconFilled={category.iconFilled}
                  onPress={handleCategoryPress}
                />
              </View>
            ))}
          </View>

          {/* Quick Pick */}
          <View ref={fabRef} style={styles.fabRow}>
            <TouchableOpacity
              style={styles.fab}
              onPress={() => router.push('/pay?source=fab')}
              activeOpacity={0.85}
            >
              <Ionicons name="flash" size={24} color={Colors.brandCharcoal} />
              <Text style={styles.fabText}>Quick Pick</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
      {coachMarkVisible && spotRect && (
        <CoachMarkOverlay
          step={currentStep}
          spotRect={spotRect}
          onNext={advance}
          onSkip={dismiss}
        />
      )}
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
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  screenTitle: {
    ...Typography.heading,
    fontSize: 26,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  screenSubtitle: {
    ...Typography.body,
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  // 2-column grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -(Spacing.xs),
  },
  categoryTileWrapper: {
    width: '50%',
    paddingHorizontal: Spacing.xs,
    marginBottom: 4,
  },
  // Empty state wrapper
  emptyContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  // Smart Pay
  fabRow: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  fab: {
    backgroundColor: Colors.brandGold,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
  },
});
