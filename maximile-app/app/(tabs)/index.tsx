import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CATEGORIES } from '../../constants/categories';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import CategoryTile from '../../components/CategoryTile';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showNetworkErrorAlert } from '../../lib/error-handler';
import { track } from '../../lib/analytics';
import RateChangeBanner from '../../components/RateChangeBanner';
import type { RateAlert } from '../../components/RateChangeBanner';
import type { UserCard, UserRateChangeResult } from '../../lib/supabase-types';

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
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [rateAlerts, setRateAlerts] = useState<RateAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const suggestedCategory = useMemo(() => getSuggestedCategory(), []);

  // -----------------------------------------------------------------------
  // Fetch user cards on every screen focus (so new cards appear immediately)
  // -----------------------------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      if (!user) return;

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
  // Navigation
  // -----------------------------------------------------------------------
  const handleCategoryPress = (categoryId: string) => {
    track('screen_view', { screen: 'recommend', category: categoryId }, user?.id);
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
  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.background}
      imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
    >
      <SafeAreaView style={styles.safeArea} edges={[]}>
        <View style={styles.content}>
          {/* Screen title */}
          <Text style={styles.screenTitle}>What are you spending on?</Text>
          <Text style={styles.screenSubtitle}>
            Tap a category to find your best card
          </Text>

          {rateAlerts.length > 0 && (
            <RateChangeBanner
              alerts={rateAlerts}
              onViewDetails={handleViewDetails}
              onDismiss={handleDismissAlert}
            />
          )}

          {/* 2-column grid for all 8 categories */}
          <View style={styles.categoryGrid}>
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

          {/* Smart Pay */}
          <View style={styles.fabRow}>
            <TouchableOpacity
              style={styles.fab}
              onPress={() => router.push('/pay?source=fab')}
              activeOpacity={0.85}
            >
              <Ionicons name="flash" size={24} color={Colors.brandCharcoal} />
              <Text style={styles.fabText}>Smart Pay</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 88 : 72,
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
    marginBottom: Spacing.lg,
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
    marginBottom: Spacing.sm,
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
