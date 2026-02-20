import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { showNetworkErrorAlert } from '../lib/error-handler';
import { track } from '../lib/analytics';
import type { Card, Category, EarnRule } from '../lib/supabase-types';
import { CATEGORY_MAP } from '../constants/categories';

/** Singapore industry average miles per dollar — used as baseline for "Miles Saved" */
const BASELINE_MPD = 1.4;

interface TrendMonth {
  label: string;
  miles: number;
}

interface TopEarningCard {
  cardName: string;
  bank: string;
  milesEarned: number;
}

interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  icon: string | null;
  milesEarned: number;
  totalSpend: number;
  transactionCount: number;
  percentage: number;
}

interface DashboardData {
  totalMiles: number;
  milesSaved: number;
  transactionCount: number;
  trend: TrendMonth[];
  topEarningCard: TopEarningCard | null;
  categoryBreakdown: CategoryBreakdownItem[];
}

function getMonthBounds(date: Date): { start: string; end: string } {
  const y = date.getFullYear();
  const m = date.getMonth();
  const start = `${y}-${String(m + 1).padStart(2, '0')}-01`;
  const nextMonth = new Date(y, m + 1, 1);
  const end = nextMonth.toISOString().slice(0, 10);
  return { start, end };
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-SG', { month: 'long', year: 'numeric' });
}

function shortMonthLabel(dateStr: string): string {
  const [y, m] = dateStr.split('-');
  const d = new Date(Number(y), Number(m) - 1);
  return d.toLocaleDateString('en-SG', { month: 'short' });
}

function shiftMonth(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function buildEarnRateKey(cardId: string, categoryId: string): string {
  return `${cardId}:${categoryId}`;
}

function computeMilesForTransaction(
  amount: number,
  cardId: string,
  categoryId: string,
  earnLookup: Map<string, number>,
  baseRateLookup: Map<string, number>,
): number {
  const specific = earnLookup.get(buildEarnRateKey(cardId, categoryId));
  if (specific !== undefined) return amount * specific;
  return amount * (baseRateLookup.get(cardId) ?? 0);
}

export default function EarningInsightsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const canGoForward = useMemo(() => {
    const now = new Date();
    return (
      selectedDate.getFullYear() < now.getFullYear() ||
      (selectedDate.getFullYear() === now.getFullYear() &&
        selectedDate.getMonth() < now.getMonth())
    );
  }, [selectedDate]);

  const fetchDashboard = useCallback(async () => {
    if (!user) return;

    try {
      const { start: monthStart, end: monthEnd } = getMonthBounds(selectedDate);

      const trendStart = shiftMonth(selectedDate, -2);
      const { start: trendMonthStart } = getMonthBounds(trendStart);

      const { data: userCards, error: ucError } = await supabase
        .from('user_cards')
        .select('card_id')
        .eq('user_id', user.id);

      if (ucError || !userCards || userCards.length === 0) {
        setData(null);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const cardIds = userCards.map((uc) => uc.card_id);

      const [cardsRes, earnRes, txnRes, trendTxnRes, categoriesRes] = await Promise.all([
        supabase.from('cards').select('*').in('id', cardIds),
        supabase
          .from('earn_rules')
          .select('card_id, category_id, earn_rate_mpd, effective_to')
          .in('card_id', cardIds),
        supabase
          .from('transactions')
          .select('amount, category_id, card_id')
          .eq('user_id', user.id)
          .gte('transaction_date', monthStart)
          .lt('transaction_date', monthEnd),
        supabase
          .from('transactions')
          .select('amount, category_id, card_id, transaction_date')
          .eq('user_id', user.id)
          .gte('transaction_date', trendMonthStart)
          .lt('transaction_date', monthEnd),
        supabase.from('categories').select('id, name, icon'),
      ]);

      const cards = (cardsRes.data ?? []) as Card[];
      const earnRules = (earnRes.data ?? []) as Pick<
        EarnRule,
        'card_id' | 'category_id' | 'earn_rate_mpd' | 'effective_to'
      >[];
      const txns = (txnRes.data ?? []) as {
        amount: number;
        category_id: string;
        card_id: string;
      }[];
      const trendTxns = (trendTxnRes.data ?? []) as {
        amount: number;
        category_id: string;
        card_id: string;
        transaction_date: string;
      }[];
      const categories = (categoriesRes.data ?? []) as Pick<Category, 'id' | 'name' | 'icon'>[];

      const categoryLookup = new Map<string, { name: string; icon: string | null }>();
      for (const cat of categories) {
        categoryLookup.set(cat.id, { name: cat.name, icon: cat.icon });
      }

      const cardLookup = new Map<string, { name: string; bank: string }>();
      for (const card of cards) {
        cardLookup.set(card.id, { name: card.name, bank: card.bank });
      }

      const earnLookup = new Map<string, number>();
      for (const rule of earnRules) {
        if (rule.effective_to !== null) continue;
        const key = buildEarnRateKey(rule.card_id, rule.category_id);
        const existing = earnLookup.get(key);
        if (existing === undefined || rule.earn_rate_mpd > existing) {
          earnLookup.set(key, rule.earn_rate_mpd);
        }
      }

      const baseRateLookup = new Map<string, number>();
      for (const card of cards) {
        baseRateLookup.set(card.id, card.base_rate_mpd);
      }

      let totalMiles = 0;
      let totalSpend = 0;
      const perCardMiles = new Map<string, number>();
      const perCategoryAgg = new Map<string, { miles: number; spend: number; count: number }>();

      for (const txn of txns) {
        const miles = computeMilesForTransaction(
          txn.amount,
          txn.card_id,
          txn.category_id,
          earnLookup,
          baseRateLookup,
        );
        totalMiles += miles;
        totalSpend += txn.amount;

        // Per-card aggregation
        perCardMiles.set(txn.card_id, (perCardMiles.get(txn.card_id) ?? 0) + miles);

        // Per-category aggregation
        const catAgg = perCategoryAgg.get(txn.category_id);
        if (catAgg) {
          catAgg.miles += miles;
          catAgg.spend += txn.amount;
          catAgg.count += 1;
        } else {
          perCategoryAgg.set(txn.category_id, { miles, spend: txn.amount, count: 1 });
        }
      }

      const baselineMiles = totalSpend * BASELINE_MPD;
      const milesSaved = Math.max(0, totalMiles - baselineMiles);

      // Top earning card
      let topEarningCard: TopEarningCard | null = null;
      if (perCardMiles.size > 0) {
        let bestCardId = '';
        let bestMiles = 0;
        for (const [cardId, miles] of perCardMiles) {
          if (miles > bestMiles) {
            bestCardId = cardId;
            bestMiles = miles;
          }
        }
        const cardInfo = cardLookup.get(bestCardId);
        if (cardInfo) {
          topEarningCard = {
            cardName: cardInfo.name,
            bank: cardInfo.bank,
            milesEarned: Math.round(bestMiles),
          };
        }
      }

      // Category breakdown
      const categoryBreakdown: CategoryBreakdownItem[] = [];
      for (const [catId, agg] of perCategoryAgg) {
        const catInfo = categoryLookup.get(catId);
        categoryBreakdown.push({
          categoryId: catId,
          categoryName: catInfo?.name ?? catId,
          icon: CATEGORY_MAP[catId]?.icon ?? catInfo?.icon ?? null,
          milesEarned: Math.round(agg.miles),
          totalSpend: Math.round(agg.spend),
          transactionCount: agg.count,
          percentage: totalMiles > 0 ? Math.round((agg.miles / totalMiles) * 100) : 0,
        });
      }
      categoryBreakdown.sort((a, b) => b.milesEarned - a.milesEarned);

      const trendMap = new Map<string, number>();
      for (const txn of trendTxns) {
        const ym = txn.transaction_date.slice(0, 7);
        const miles = computeMilesForTransaction(
          txn.amount,
          txn.card_id,
          txn.category_id,
          earnLookup,
          baseRateLookup,
        );
        trendMap.set(ym, (trendMap.get(ym) ?? 0) + miles);
      }

      const trend: TrendMonth[] = [];
      for (let i = -2; i <= 0; i++) {
        const d = shiftMonth(selectedDate, i);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        trend.push({
          label: shortMonthLabel(ym),
          miles: trendMap.get(ym) ?? 0,
        });
      }

      setData({
        totalMiles: Math.round(totalMiles),
        milesSaved: Math.round(milesSaved),
        transactionCount: txns.length,
        trend,
        topEarningCard,
        categoryBreakdown,
      });
      setLoading(false);
      setRefreshing(false);

      await track('screen_view', { screen: 'earning_insights' }, user.id);
    } catch (err) {
      if (__DEV__) console.error('Earning insights fetch error:', err);
      showNetworkErrorAlert(() => fetchDashboard());
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, selectedDate]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard]),
  );

  const handlePrevMonth = () => setSelectedDate((d) => shiftMonth(d, -1));
  const handleNextMonth = () => {
    if (canGoForward) setSelectedDate((d) => shiftMonth(d, 1));
  };
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return <LoadingSpinner message="Loading insights..." />;
  }

  if (!data) {
    return (
      <ImageBackground
        source={require('../assets/background.png')}
        style={styles.background}
        imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <View style={styles.emptyContainer}>
            <Text style={styles.screenTitle}>Earning Insights</Text>
            <EmptyState
              icon="analytics-outline"
              title="No data yet"
              description="Add cards and log transactions to see your earning insights."
            />
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  const trendMax = Math.max(...data.trend.map((t) => t.miles), 1);

  return (
    <ImageBackground
      source={require('../assets/background.png')}
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
          <Text style={styles.screenTitle}>Earning Insights</Text>
          <Text style={styles.screenSubtitle}>
            Track your miles earning performance
          </Text>

          {/* Month selector */}
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={handlePrevMonth} hitSlop={12}>
              <Ionicons
                name="chevron-back"
                size={24}
                color={Colors.brandCharcoal}
              />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>
              {formatMonthLabel(selectedDate)}
            </Text>
            <TouchableOpacity
              onPress={handleNextMonth}
              hitSlop={12}
              disabled={!canGoForward}
            >
              <Ionicons
                name="chevron-forward"
                size={24}
                color={canGoForward ? Colors.brandCharcoal : Colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          {/* Stats cards */}
          <View style={styles.statsRow}>
            <GlassCard style={styles.statCard}>
              <Ionicons name="airplane" size={22} color={Colors.brandGold} />
              <Text style={styles.statValue}>
                {data.totalMiles.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Miles Earned</Text>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <Ionicons name="trending-up" size={22} color={Colors.success} />
              <Text style={[styles.statValue, { color: Colors.success }]}>
                +{data.milesSaved.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Miles Saved</Text>
            </GlassCard>
          </View>

          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/transactions')}>
            <GlassCard style={styles.txnCard}>
              <View style={styles.txnCardInner}>
                <View style={styles.txnIconWrap}>
                  <Ionicons
                    name="receipt-outline"
                    size={20}
                    color={Colors.brandGold}
                  />
                </View>
                <View style={styles.txnTextWrap}>
                  <Text style={styles.txnValue}>{data.transactionCount}</Text>
                  <Text style={styles.txnLabel}>
                    Transaction{data.transactionCount !== 1 ? 's' : ''} Logged
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
              </View>
            </GlassCard>
          </TouchableOpacity>

          {/* MVP Card of the Month */}
          {data.topEarningCard && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>MVP Card of the Month</Text>
              <GlassCard style={styles.mvpCard}>
                <View style={styles.mvpCardInner}>
                  <View style={styles.mvpIconWrap}>
                    <Ionicons name="trophy" size={24} color={Colors.brandGold} />
                  </View>
                  <View style={styles.mvpTextWrap}>
                    <Text style={styles.mvpCardName} numberOfLines={1}>
                      {data.topEarningCard.cardName}
                    </Text>
                    <Text style={styles.mvpBank}>{data.topEarningCard.bank}</Text>
                  </View>
                  <View style={styles.mvpMilesWrap}>
                    <Text style={styles.mvpMilesValue}>
                      {data.topEarningCard.milesEarned.toLocaleString()}
                    </Text>
                    <Text style={styles.mvpMilesLabel}>miles</Text>
                  </View>
                </View>
              </GlassCard>
            </View>
          )}

          {/* Monthly Trend */}
          {data.trend.some((t) => t.miles > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Monthly Trend</Text>
              <View style={styles.trendCard}>
                <View style={styles.trendBars}>
                  {data.trend.map((month, idx) => {
                    const heightPct = trendMax > 0 ? (month.miles / trendMax) * 100 : 0;
                    const isCurrentSelection = idx === data.trend.length - 1;

                    return (
                      <View key={idx} style={styles.trendColumn}>
                        <Text style={styles.trendMiles}>
                          {month.miles > 0
                            ? month.miles.toLocaleString()
                            : '-'}
                        </Text>
                        <View style={styles.trendBarTrack}>
                          <View
                            style={[
                              styles.trendBarFill,
                              {
                                height: `${Math.max(heightPct, 4)}%`,
                                backgroundColor: isCurrentSelection
                                  ? Colors.brandGold
                                  : Colors.textTertiary,
                                opacity: isCurrentSelection ? 1 : 0.4,
                              },
                            ]}
                          />
                        </View>
                        <Text
                          style={[
                            styles.trendLabel,
                            isCurrentSelection && styles.trendLabelActive,
                          ]}
                        >
                          {month.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {/* Category Breakdown */}
          {data.categoryBreakdown.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Earning by Category</Text>
              <View style={styles.categoryCard}>
                {data.categoryBreakdown.map((cat, idx) => {
                  const barWidth = data.categoryBreakdown[0].milesEarned > 0
                    ? (cat.milesEarned / data.categoryBreakdown[0].milesEarned) * 100
                    : 0;
                  return (
                    <View
                      key={cat.categoryId}
                      style={[
                        styles.categoryRow,
                        idx < data.categoryBreakdown.length - 1 && styles.categoryRowBorder,
                      ]}
                      accessibilityLabel={`${cat.categoryName} earned ${cat.milesEarned.toLocaleString()} miles, ${cat.percentage}% of total`}
                    >
                      <View style={styles.categoryLeft}>
                        {cat.icon && (
                          <Ionicons
                            name={cat.icon as keyof typeof Ionicons.glyphMap}
                            size={18}
                            color={Colors.brandCharcoal}
                            style={styles.categoryIconStyle}
                          />
                        )}
                        <Text style={styles.categoryName} numberOfLines={1}>
                          {cat.categoryName}
                        </Text>
                      </View>
                      <View style={styles.categoryRight}>
                        <View style={styles.categoryBarTrack}>
                          <View
                            style={[
                              styles.categoryBarFill,
                              { width: `${Math.max(barWidth, 4)}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.categoryMiles}>
                          {cat.milesEarned.toLocaleString()}
                        </Text>
                        <Text style={styles.categoryPct}>{cat.percentage}%</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Miles saved explanation */}
          {data.milesSaved > 0 && (
            <View style={styles.insightCard}>
              <Ionicons
                name="bulb-outline"
                size={18}
                color={Colors.brandGold}
                style={styles.insightIcon}
              />
              <Text style={styles.insightText}>
                By using the right card for each purchase, you earned{' '}
                <Text style={styles.insightBold}>
                  {data.milesSaved.toLocaleString()} more miles
                </Text>{' '}
                compared to the Singapore average of 1.4 miles per dollar.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const TREND_BAR_HEIGHT = 100;

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
    marginBottom: Spacing.lg,
  },

  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  monthLabel: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },

  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.heading,
    fontSize: 24,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  txnCard: {
    marginBottom: Spacing.xl,
  },
  txnCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txnIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.babyYellowLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  txnTextWrap: {
    flex: 1,
  },
  txnValue: {
    ...Typography.subheading,
    color: Colors.textPrimary,
  },
  txnLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.subheading,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  trendCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  trendBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  trendColumn: {
    alignItems: 'center',
    flex: 1,
  },
  trendMiles: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    fontSize: 12,
  },
  trendBarTrack: {
    width: 32,
    height: TREND_BAR_HEIGHT,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  trendBarFill: {
    width: '100%',
    borderRadius: BorderRadius.sm,
  },
  trendLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  trendLabelActive: {
    color: Colors.brandGold,
    fontWeight: '600',
  },

  insightCard: {
    flexDirection: 'row',
    backgroundColor: Colors.babyYellowLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.brandGold,
  },
  insightIcon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  insightText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  insightBold: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  // MVP Card of the Month
  mvpCard: {
    // GlassCard wrapper
  },
  mvpCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mvpIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.babyYellowLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  mvpTextWrap: {
    flex: 1,
  },
  mvpCardName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  mvpBank: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  mvpMilesWrap: {
    alignItems: 'flex-end',
  },
  mvpMilesValue: {
    ...Typography.subheading,
    color: Colors.brandGold,
  },
  mvpMilesLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  // Category Breakdown
  categoryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
  },
  categoryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 110,
  },
  categoryIconStyle: {
    marginRight: Spacing.sm,
  },
  categoryName: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  categoryRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    backgroundColor: Colors.brandGold,
    borderRadius: 4,
  },
  categoryMiles: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    width: 50,
    textAlign: 'right',
  },
  categoryPct: {
    ...Typography.caption,
    color: Colors.textTertiary,
    width: 32,
    textAlign: 'right',
  },
});
