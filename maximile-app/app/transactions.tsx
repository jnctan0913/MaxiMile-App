import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  SectionList,
  StyleSheet,
  ImageBackground,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CATEGORY_MAP } from '../constants/categories';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { showNetworkErrorAlert } from '../lib/error-handler';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TransactionRow {
  id: string;
  card_id: string;
  category_id: string;
  amount: number;
  transaction_date: string;
  logged_at: string;
  cards: { bank: string; name: string } | null;
  categories: { name: string } | null;
}

interface TransactionSection {
  title: string; // e.g. "February 2026"
  data: TransactionRow[];
}

// ---------------------------------------------------------------------------
// Per-category icon gradients (same as CategoryTile)
// ---------------------------------------------------------------------------

const ICON_PALETTES: Record<string, [string, string]> = {
  dining:    ['#C5A55A', '#A8893E'],
  transport: ['#E8967A', '#D4775E'],
  online:    ['#7EC8E3', '#5EB0D0'],
  travel:    ['#3D7A8B', '#2D5E6A'],
  groceries: ['#5BAD7A', '#3D8F5C'],
  petrol:    ['#E8A44D', '#D08A2D'],
  bills:     ['#A78BDA', '#8B6FC0'],
  general:   ['#5F6D7E', '#4A5568'],
};

const DEFAULT_GRADIENT: [string, string] = ['#C5A55A', '#A8893E'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function groupByMonth(transactions: TransactionRow[]): TransactionSection[] {
  const groups = new Map<string, TransactionRow[]>();

  for (const tx of transactions) {
    const date = new Date(tx.transaction_date);
    const key = date.toLocaleDateString('en-SG', {
      month: 'long',
      year: 'numeric',
    });

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(tx);
  }

  return Array.from(groups.entries()).map(([title, data]) => ({
    title,
    data,
  }));
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function TransactionsScreen() {
  const { user } = useAuth();
  const [sections, setSections] = useState<TransactionSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, card_id, category_id, amount, transaction_date, logged_at, cards(bank, name), categories(name)')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })
        .order('logged_at', { ascending: false })
        .limit(200);

      if (!error && data) {
        const grouped = groupByMonth(data as unknown as TransactionRow[]);
        setSections(grouped);
      }
    } catch {
      showNetworkErrorAlert(() => fetchTransactions());
    }

    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: () => (
              <Image
                source={require('../assets/Name.png')}
                style={{ height: 28, width: 120 }}
                resizeMode="contain"
              />
            ),
            headerBackTitle: 'Back',
            headerTintColor: Colors.brandGold,
            headerStyle: { backgroundColor: Colors.background },
          }}
        />
        <LoadingSpinner message="Loading transactions..." />
      </>
    );
  }

  // Count total transactions
  const totalCount = sections.reduce((sum, s) => sum + s.data.length, 0);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <Image
              source={require('../assets/Name.png')}
              style={{ height: 28, width: 120 }}
              resizeMode="contain"
            />
          ),
          headerBackTitle: 'Back',
          headerTintColor: Colors.brandGold,
          headerStyle: { backgroundColor: Colors.background },
        }}
      />
      <ImageBackground
        source={require('../assets/background.png')}
        style={styles.background}
        imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          {sections.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.screenTitle}>Transaction History</Text>
              <EmptyState
                icon="document-text-outline"
                title="No transactions logged yet"
                description="Log your first transaction from the Log tab to see your history here."
              />
            </View>
          ) : (
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              stickySectionHeadersEnabled={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              ListHeaderComponent={
                <View style={styles.listHeader}>
                  <Text style={styles.screenTitle}>Transaction History</Text>
                  <Text style={styles.screenSubtitle}>
                    {totalCount} transaction{totalCount !== 1 ? 's' : ''}
                  </Text>
                </View>
              }
              renderSectionHeader={({ section }) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{section.title}</Text>
                </View>
              )}
              renderItem={({ item }) => {
                const categoryInfo = CATEGORY_MAP[item.category_id];
                const iconName = categoryInfo?.icon ?? 'wallet-outline';
                const categoryName = item.categories?.name ?? categoryInfo?.name ?? item.category_id;
                const cardLabel = item.cards?.name ?? 'Unknown card';
                const gradient = ICON_PALETTES[item.category_id] ?? DEFAULT_GRADIENT;

                return (
                  <View style={styles.transactionRow}>
                    <View style={styles.rowLeft}>
                      <LinearGradient
                        colors={gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.rowIconCircle}
                      >
                        <Ionicons
                          name={iconName as keyof typeof Ionicons.glyphMap}
                          size={18}
                          color="#FFFFFF"
                        />
                      </LinearGradient>
                      <View style={styles.rowDetails}>
                        <Text style={styles.rowCategory}>{categoryName}</Text>
                        <Text style={styles.rowCard} numberOfLines={1}>
                          {cardLabel}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.rowRight}>
                      <Text style={styles.rowAmount}>
                        ${item.amount.toFixed(2)}
                      </Text>
                      <Text style={styles.rowDate}>
                        {formatDate(item.transaction_date)}
                      </Text>
                    </View>
                  </View>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
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
  emptyContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl + 40,
  },

  // Header
  listHeader: {
    marginBottom: Spacing.sm,
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

  // Section headers
  sectionHeader: {
    paddingVertical: Spacing.sm,
    paddingTop: Spacing.lg,
  },
  sectionHeaderText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Transaction rows — glass card style
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.15)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
    }),
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  rowDetails: {
    flex: 1,
  },
  rowCategory: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  rowCard: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  rowRight: {
    alignItems: 'flex-end',
    marginLeft: Spacing.md,
  },
  rowAmount: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  rowDate: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  separator: {
    height: Spacing.sm,
  },
});
