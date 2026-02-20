import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ImageBackground,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CATEGORY_MAP } from '../../constants/categories';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import CapProgressBar from '../../components/CapProgressBar';
import CapAlert from '../../components/CapAlert';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showNetworkErrorAlert } from '../../lib/error-handler';
import { track } from '../../lib/analytics';
import { getCardImage } from '../../constants/cardImages';
import { useCapAlerts } from '../../hooks/useCapAlerts';
import type { SpendingState, Card, Cap } from '../../lib/supabase-types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CapCategoryRow {
  cap: Cap;
  spendingState: SpendingState | null;
}

interface CardCapGroup {
  card: Card;
  hasCaps: boolean;
  categories: CapCategoryRow[];
  /** Max usage percentage across all categories for sorting */
  maxUsagePct: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getMonthLabel(): string {
  return new Date().toLocaleDateString('en-SG', {
    month: 'long',
    year: 'numeric',
  });
}

function getDaysUntilReset(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate();
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/**
 * Cap Status Dashboard (DRD Section 8)
 *
 * Shows bonus cap usage across all user cards, sorted by urgency.
 * Cards with caps nearest to exhaustion appear first.
 * Pull-to-refresh supported.
 */
export default function CapsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [cardGroups, setCardGroups] = useState<CardCapGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dismissedAlertKeys, setDismissedAlertKeys] = useState<Set<string>>(new Set());

  const { alerts: capAlerts, fetchAlerts } = useCapAlerts(user?.id);

  const visibleAlerts = capAlerts.filter(
    (a) => !dismissedAlertKeys.has(`${a.cardId}:${a.categoryId}`),
  );

  const handleDismissAlert = (cardId: string, categoryId: string | null) => {
    setDismissedAlertKeys((prev) => {
      const next = new Set(prev);
      next.add(`${cardId}:${categoryId}`);
      return next;
    });
  };

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthLabel = getMonthLabel();
  const daysUntilReset = getDaysUntilReset();

  const fetchCapStatus = useCallback(async () => {
    if (!user) return;

    try {
    // Fetch user's cards
    const { data: userCards, error: ucError } = await supabase
      .from('user_cards')
      .select('card_id')
      .eq('user_id', user.id);

    if (ucError || !userCards || userCards.length === 0) {
      setCardGroups([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const cardIds = userCards.map((uc) => uc.card_id);

    // Fetch cards, caps, and transactions in parallel
    const now = new Date();
    const monthStart = `${currentMonth}-01`;
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthStr = nextMonthDate.toISOString().slice(0, 10); // e.g. '2026-03-01'

    const [cardsRes, capsRes, txnRes] = await Promise.all([
      supabase.from('cards').select('*').in('id', cardIds),
      supabase.from('caps').select('*').in('card_id', cardIds),
      supabase
        .from('transactions')
        .select('card_id, category_id, amount')
        .eq('user_id', user.id)
        .gte('transaction_date', monthStart)
        .lt('transaction_date', nextMonthStr)
        .in('card_id', cardIds),
    ]);

    const cards = (cardsRes.data ?? []) as Card[];
    const caps = (capsRes.data ?? []) as Cap[];
    const txns = (txnRes.data ?? []) as { card_id: string; category_id: string; amount: number }[];

    // Compute spending per card+category from transactions
    const txnSpending = new Map<string, number>();
    // Also compute total per card (for global caps with category_id = NULL)
    const txnCardTotal = new Map<string, number>();
    for (const txn of txns) {
      const key = `${txn.card_id}:${txn.category_id}`;
      txnSpending.set(key, (txnSpending.get(key) ?? 0) + txn.amount);
      txnCardTotal.set(txn.card_id, (txnCardTotal.get(txn.card_id) ?? 0) + txn.amount);
    }

    // Group by card
    const groupMap = new Map<string, CardCapGroup>();

    // Initialize all cards
    for (const card of cards) {
      groupMap.set(card.id, {
        card,
        hasCaps: false,
        categories: [],
        maxUsagePct: 0,
      });
    }

    // Deduplicate caps by (card_id, category_id) — keep first occurrence only.
    // Duplicates can occur when category_id is NULL because PostgreSQL
    // treats NULL != NULL in unique constraints.
    const seenCapKeys = new Set<string>();
    const uniqueCaps = caps.filter((cap) => {
      const key = `${cap.card_id}:${cap.category_id ?? '__null__'}`;
      if (seenCapKeys.has(key)) return false;
      seenCapKeys.add(key);
      return true;
    });

    // Assign caps to card groups
    for (const cap of uniqueCaps) {
      const group = groupMap.get(cap.card_id);
      if (!group) continue;

      group.hasCaps = true;

      // Compute spent from transactions directly
      const spent = cap.category_id
        ? txnSpending.get(`${cap.card_id}:${cap.category_id}`) ?? 0
        : txnCardTotal.get(cap.card_id) ?? 0;

      const remaining = cap.monthly_cap_amount > 0
        ? Math.max(cap.monthly_cap_amount - spent, 0)
        : null;

      const synthState: SpendingState = {
        id: '',
        user_id: user.id,
        card_id: cap.card_id,
        category_id: cap.category_id ?? '',
        month: currentMonth,
        total_spent: spent,
        remaining_cap: remaining ?? 0,
        created_at: '',
        updated_at: '',
      };

      const usagePct = cap.monthly_cap_amount > 0 ? (spent / cap.monthly_cap_amount) * 100 : 0;

      if (usagePct > group.maxUsagePct) {
        group.maxUsagePct = usagePct;
      }

      group.categories.push({ cap, spendingState: synthState });
    }

    // Sort categories within each card by usage % descending
    for (const group of groupMap.values()) {
      group.categories.sort((a, b) => {
        const aSpent = a.spendingState?.total_spent ?? 0;
        const bSpent = b.spendingState?.total_spent ?? 0;
        const aPct = a.cap.monthly_cap_amount > 0 ? aSpent / a.cap.monthly_cap_amount : 0;
        const bPct = b.cap.monthly_cap_amount > 0 ? bSpent / b.cap.monthly_cap_amount : 0;
        return bPct - aPct;
      });
    }

    // Convert to sorted array: capped cards sorted by urgency first, then uncapped
    const groups = Array.from(groupMap.values());
    groups.sort((a, b) => {
      // Cards with caps come first
      if (a.hasCaps && !b.hasCaps) return -1;
      if (!a.hasCaps && b.hasCaps) return 1;
      // Among capped cards, sort by max usage descending (most urgent first)
      return b.maxUsagePct - a.maxUsagePct;
    });

    setCardGroups(groups);
    setLoading(false);
    setRefreshing(false);

    await track('screen_view', { screen: 'cap_status' }, user.id);
    } catch (err) {
      if (__DEV__) console.error('Cap status fetch error:', err);
      showNetworkErrorAlert(() => fetchCapStatus());
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, currentMonth]);

  useFocusEffect(
    useCallback(() => {
      fetchCapStatus();
      fetchAlerts();
    }, [fetchCapStatus, fetchAlerts])
  );

  const handleCardPress = (card: Card) => {
    router.push(`/card-transactions/${card.id}?cardName=${encodeURIComponent(card.name)}`);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCapStatus();
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner message="Loading cap status..." />;
  }

  // Empty state: no cards at all
  if (cardGroups.length === 0) {
    return (
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.background}
        imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <View style={styles.emptyContainer}>
            <Text style={styles.screenTitle}>Cap Status</Text>
            <EmptyState
              icon="analytics-outline"
              title="No bonus caps to track"
              description="Add cards with bonus caps to see your spending progress here."
            />
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  // Check if any card has caps
  const anyCaps = cardGroups.some((g) => g.hasCaps);

  if (!anyCaps) {
    return (
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.background}
        imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <View style={styles.emptyContainer}>
            <Text style={styles.screenTitle}>Cap Status</Text>
            <Text style={styles.screenSubtitle}>{monthLabel}</Text>
            <EmptyState
              icon="shield-checkmark-outline"
              title="No monthly bonus caps"
              description="None of your cards have monthly bonus caps. Spend freely!"
            />
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.background}
      imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Header */}
          <Text style={styles.screenTitle}>Cap Status</Text>
          <Text style={styles.screenSubtitle}>Track your monthly bonus cap usage</Text>

          {visibleAlerts.length > 0 && (
            <View style={styles.alertsContainer}>
              {visibleAlerts.map((alert) => (
                <CapAlert
                  key={`${alert.cardId}:${alert.categoryId}`}
                  cardName={alert.cardName}
                  categoryName={alert.categoryName}
                  percentUsed={alert.percentUsed}
                  remainingAmount={alert.remainingAmount}
                  alternativeCard={alert.alternativeCard}
                  onDismiss={() => handleDismissAlert(alert.cardId, alert.categoryId)}
                />
              ))}
            </View>
          )}

          <View style={styles.periodRow}>
            <Text style={styles.periodLabel}>{monthLabel}</Text>
            <Text style={styles.resetLabel}>Resets in {daysUntilReset} days</Text>
          </View>

          {/* Card sections */}
          {cardGroups.map((group) => {
            if (!group.hasCaps) {
              // Card with no caps — tappable, full opacity, with pill badge
              return (
                <TouchableOpacity
                  key={group.card.id}
                  style={styles.noCapsCard}
                  activeOpacity={0.7}
                  onPress={() => handleCardPress(group.card)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardImageContainer}>
                      {(() => {
                        const localImg = getCardImage(group.card.slug);
                        const imgSource = group.card.image_url
                          ? { uri: group.card.image_url }
                          : localImg;
                        return imgSource ? (
                          <Image source={imgSource} style={styles.cardImage} resizeMode="contain" />
                        ) : (
                          <View style={styles.cardImagePlaceholder}>
                            <Text style={styles.placeholderText}>{group.card.bank.charAt(0)}</Text>
                          </View>
                        );
                      })()}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.noCapsCardName} numberOfLines={1}>{group.card.name}</Text>
                      <View style={styles.noCapPill}>
                        <Text style={styles.noCapPillText}>No bonus cap</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
                  </View>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={group.card.id}
                style={styles.capCard}
                activeOpacity={0.7}
                onPress={() => handleCardPress(group.card)}
              >
                {/* Card header with image */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardImageContainer}>
                    {(() => {
                      const localImg = getCardImage(group.card.slug);
                      const imgSource = group.card.image_url
                        ? { uri: group.card.image_url }
                        : localImg;
                      return imgSource ? (
                        <Image source={imgSource} style={styles.cardImage} resizeMode="contain" />
                      ) : (
                        <View style={styles.cardImagePlaceholder}>
                          <Text style={styles.placeholderText}>{group.card.bank.charAt(0)}</Text>
                        </View>
                      );
                    })()}
                  </View>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {group.card.name}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
                </View>

                {/* Per-category progress bars */}
                {group.categories.map((row) => {
                  const categoryInfo = row.cap.category_id
                    ? CATEGORY_MAP[row.cap.category_id]
                    : null;
                  const categoryLabel = row.cap.category_id
                    ? categoryInfo
                      ? categoryInfo.name
                      : row.cap.category_id
                    : 'All Categories';
                  const categoryIcon = categoryInfo?.icon;
                  const spent = row.spendingState?.total_spent ?? 0;
                  const cap = row.cap.monthly_cap_amount;
                  const remaining = Math.max(0, cap - spent);
                  const usedPct = cap > 0 ? (spent / cap) * 100 : 0;

                  return (
                    <View key={row.cap.id} style={styles.categorySection}>
                      <View style={styles.categoryHeader}>
                        <View style={styles.categoryLabelRow}>
                          {categoryIcon && (
                            <Ionicons
                              name={categoryIcon as keyof typeof Ionicons.glyphMap}
                              size={18}
                              color={Colors.brandCharcoal}
                              style={styles.categoryIcon}
                            />
                          )}
                          <Text style={styles.categoryLabel}>{categoryLabel}</Text>
                        </View>
                        <Text
                          style={[
                            styles.remainingAmount,
                            {
                              color:
                                usedPct >= 100
                                  ? Colors.capRed
                                  : usedPct >= 80
                                  ? Colors.capAmber
                                  : Colors.capGreen,
                            },
                          ]}
                        >
                          ${remaining.toLocaleString()}
                        </Text>
                      </View>

                      <CapProgressBar
                        spent={spent}
                        cap={cap}
                        showValues
                        height={8}
                      />
                    </View>
                  );
                })}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl + 40,
  },

  // Header
  emptyContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
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
    marginBottom: Spacing.xl + 4,
  },
  alertsContainer: {
    marginBottom: Spacing.md,
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  periodLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  resetLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  // Card with caps
  capCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  cardImageContainer: {
    width: 48,
    height: 32,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
  },
  placeholderText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
  cardName: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    flex: 1,
  },
  categorySection: {
    marginBottom: Spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    marginRight: Spacing.sm,
  },
  categoryLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  remainingAmount: {
    ...Typography.bodyBold,
  },

  // Card with no caps
  noCapsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 6,
  },
  noCapsCardName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  noCapPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.babyYellowLight,
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  noCapPillText: {
    ...Typography.caption,
    color: Colors.brandGold,
    fontWeight: '600',
  },
});
