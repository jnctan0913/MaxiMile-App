import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  SectionList,
  StyleSheet,
  ImageBackground,
  Platform,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Animated,
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CATEGORY_MAP } from '../constants/categories';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { showNetworkErrorAlert } from '../lib/error-handler';
import EditTransactionSheet, { type EditableTransaction } from '../components/EditTransactionSheet';
import { updateTransaction, deleteTransaction, reinsertTransaction, type TransactionUpdate } from '../lib/transactions';
import { track } from '../lib/analytics';

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

interface UndoState {
  user_id: string;
  card_id: string;
  category_id: string;
  amount: number;
  transaction_date: string;
  cardName: string;
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

  // Edit sheet
  const [editTarget, setEditTarget] = useState<EditableTransaction | null>(null);

  // Undo snackbar
  const [undoData, setUndoData] = useState<UndoState | null>(null);
  const undoAnim = useRef(new Animated.Value(0)).current;
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track the currently open swipeable so we can close it when another opens
  const openSwipeableRef = useRef<Swipeable | null>(null);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Undo snackbar helpers
  // ---------------------------------------------------------------------------

  const showUndo = useCallback((data: UndoState) => {
    setUndoData(data);
    Animated.spring(undoAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();

    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => {
      dismissUndo();
    }, 5000);
  }, [undoAnim]);

  const dismissUndo = useCallback(() => {
    Animated.timing(undoAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setUndoData(null));
    if (undoTimer.current) {
      clearTimeout(undoTimer.current);
      undoTimer.current = null;
    }
  }, [undoAnim]);

  const handleUndo = useCallback(async () => {
    if (!undoData) return;
    dismissUndo();
    const { error } = await reinsertTransaction(undoData);
    if (!error) {
      fetchTransactions();
    }
  }, [undoData, dismissUndo, fetchTransactions]);

  useEffect(() => {
    return () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Edit handler
  // ---------------------------------------------------------------------------

  const handleEditOpen = useCallback((item: TransactionRow) => {
    openSwipeableRef.current?.close();
    openSwipeableRef.current = null;
    setEditTarget({
      id: item.id,
      card_id: item.card_id,
      category_id: item.category_id,
      amount: item.amount,
      transaction_date: item.transaction_date,
      cards: item.cards,
    });
  }, []);

  const handleSaveEdit = useCallback(
    async (id: string, oldTx: EditableTransaction, update: TransactionUpdate) => {
      if (!user) return;

      const { error } = await updateTransaction(
        id,
        { card_id: oldTx.card_id, category_id: oldTx.category_id, transaction_date: oldTx.transaction_date },
        update,
        user.id,
      );

      if (error) throw new Error(error); // sheet stays open and shows error

      // Track changed fields for analytics
      const changedFields: string[] = [];
      if (update.amount !== oldTx.amount) changedFields.push('amount');
      if (update.category_id !== oldTx.category_id) changedFields.push('category');
      if (update.card_id !== oldTx.card_id) changedFields.push('card');
      if (update.transaction_date !== oldTx.transaction_date) changedFields.push('date');

      track('transaction_edited', {
        changed_fields: changedFields.join(','),
        category_changed: update.category_id !== oldTx.category_id,
        card_changed: update.card_id !== oldTx.card_id,
      }, user.id);

      // Close sheet immediately
      setEditTarget(null);

      // Optimistic update — re-apply changes to local state so the list
      // reflects the edit instantly without waiting for the network round-trip.
      // Re-sorts and re-groups so date changes move rows to the correct section.
      setSections((prev) => {
        const allTx = prev.flatMap((s) => s.data);
        const updatedTx = allTx.map((t) => {
          if (t.id !== id) return t;
          return {
            ...t,
            amount: update.amount,
            transaction_date: update.transaction_date,
            category_id: update.category_id,
            card_id: update.card_id,
            // Resolve category name from local map; fall back to old value
            categories: { name: CATEGORY_MAP[update.category_id]?.name ?? t.categories?.name ?? '' },
            // Keep existing card name if card unchanged; re-fetch will correct it if changed
            cards: update.card_id === t.card_id ? t.cards : t.cards,
          };
        });
        // Re-sort descending by date then logged_at (mirrors the Supabase query order)
        updatedTx.sort((a, b) => {
          const dateCmp = b.transaction_date.localeCompare(a.transaction_date);
          return dateCmp !== 0 ? dateCmp : b.logged_at.localeCompare(a.logged_at);
        });
        return groupByMonth(updatedTx);
      });

      // Background re-fetch to sync card names and any server-side changes
      fetchTransactions();
    },
    [user, fetchTransactions],
  );

  // ---------------------------------------------------------------------------
  // Delete handler
  // ---------------------------------------------------------------------------

  const handleDeleteConfirm = useCallback(
    (item: TransactionRow) => {
      openSwipeableRef.current?.close();
      openSwipeableRef.current = null;

      const cardName = item.cards?.name ?? 'Unknown card';

      const doDelete = async () => {
        if (!user) return;

        const { error } = await deleteTransaction(
          item.id,
          { card_id: item.card_id, category_id: item.category_id, transaction_date: item.transaction_date },
          user.id,
        );

        if (error) {
          if (Platform.OS === 'web') {
            window.alert('Could not delete transaction. Please try again.');
          } else {
            Alert.alert('Error', 'Could not delete transaction. Please try again.');
          }
          return;
        }

        track('transaction_deleted', { had_undo: true }, user.id);

        // Remove from local state immediately for instant feedback
        setSections((prev) =>
          prev
            .map((section) => ({
              ...section,
              data: section.data.filter((t) => t.id !== item.id),
            }))
            .filter((section) => section.data.length > 0),
        );

        showUndo({
          user_id: user.id,
          card_id: item.card_id,
          category_id: item.category_id,
          amount: item.amount,
          transaction_date: item.transaction_date,
          cardName,
        });
      };

      if (Platform.OS === 'web') {
        if (window.confirm(`Delete Transaction?\n\nThis will adjust your cap tracking for ${cardName}.`)) {
          doDelete();
        }
      } else {
        Alert.alert(
          'Delete Transaction?',
          `This will adjust your cap tracking for ${cardName}.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: doDelete },
          ],
        );
      }
    },
    [user, showUndo],
  );

  // ---------------------------------------------------------------------------
  // Long-press handler (alternative to swipe)
  // ---------------------------------------------------------------------------

  const handleLongPress = useCallback(
    (item: TransactionRow) => {
      openSwipeableRef.current?.close();
      openSwipeableRef.current = null;

      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Edit', 'Delete', 'Cancel'],
            destructiveButtonIndex: 1,
            cancelButtonIndex: 2,
          },
          (buttonIndex) => {
            if (buttonIndex === 0) handleEditOpen(item);
            if (buttonIndex === 1) handleDeleteConfirm(item);
          },
        );
      } else {
        Alert.alert(
          'Transaction',
          undefined,
          [
            { text: 'Edit', onPress: () => handleEditOpen(item) },
            { text: 'Delete', style: 'destructive', onPress: () => handleDeleteConfirm(item) },
            { text: 'Cancel', style: 'cancel' },
          ],
        );
      }
    },
    [handleEditOpen, handleDeleteConfirm],
  );

  // ---------------------------------------------------------------------------
  // Swipe action renderer
  // ---------------------------------------------------------------------------

  const renderRightActions = useCallback(
    (item: TransactionRow, _progress: Animated.AnimatedInterpolation<number>) => (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={styles.editAction}
          onPress={() => handleEditOpen(item)}
          activeOpacity={0.8}
        >
          <Ionicons name="pencil" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => handleDeleteConfirm(item)}
          activeOpacity={0.8}
        >
          <Ionicons name="trash" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    ),
    [handleEditOpen, handleDeleteConfirm],
  );

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

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

  // Undo snackbar slide translation
  const undoTranslateY = undoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 0],
  });

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
                  <Text style={styles.swipeHint}>
                    Long-press or swipe left to edit or delete
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

                const rowContent = (
                  <TouchableOpacity
                    style={styles.transactionRow}
                    onLongPress={() => handleLongPress(item)}
                    activeOpacity={0.8}
                    delayLongPress={400}
                  >
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
                  </TouchableOpacity>
                );

                return (
                  <Swipeable
                    ref={(ref) => {
                      // No-op: we only track the currently open one via onSwipeableOpen
                    }}
                    renderRightActions={(progress) => renderRightActions(item, progress)}
                    onSwipeableOpen={(direction) => {
                      if (direction === 'right') {
                        // Another row was already open — close it
                        // (handled via ref below)
                      }
                    }}
                    onSwipeableWillOpen={() => {
                      // Close any previously open swipeable
                      if (openSwipeableRef.current) {
                        openSwipeableRef.current.close();
                      }
                    }}
                    friction={2}
                    rightThreshold={40}
                    containerStyle={styles.swipeableContainer}
                    childrenContainerStyle={styles.swipeableChildContainer}
                  >
                    {rowContent}
                  </Swipeable>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}

          {/* Undo snackbar */}
          {undoData && (
            <Animated.View
              style={[
                styles.undoSnackbar,
                { transform: [{ translateY: undoTranslateY }], opacity: undoAnim },
              ]}
            >
              <Text style={styles.undoText}>Transaction deleted.</Text>
              <TouchableOpacity onPress={handleUndo} activeOpacity={0.7}>
                <Text style={styles.undoButton}>Undo</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </SafeAreaView>
      </ImageBackground>

      {/* Edit sheet */}
      <EditTransactionSheet
        visible={editTarget !== null}
        transaction={editTarget}
        userId={user?.id ?? ''}
        onSave={handleSaveEdit}
        onDismiss={() => setEditTarget(null)}
      />
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
    marginBottom: Spacing.xs,
  },
  swipeHint: {
    ...Typography.caption,
    color: Colors.textTertiary,
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

  // Swipeable wrapper — must not clip the row shadow
  swipeableContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  swipeableChildContainer: {
    borderRadius: 16,
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

  // Swipe action buttons
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
    gap: Spacing.xs,
  },
  editAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.brandGold,
  },
  deleteAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E53E3E',
  },

  // Undo snackbar
  undoSnackbar: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.xl,
    right: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.brandCharcoal,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  undoText: {
    ...Typography.caption,
    color: Colors.textInverse,
  },
  undoButton: {
    ...Typography.captionBold,
    color: Colors.brandGold,
  },
});
