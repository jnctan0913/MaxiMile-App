import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import GlassCard from '../../components/GlassCard';
import BalanceBreakdown from '../../components/BalanceBreakdown';
import BottomSheet from '../../components/BottomSheet';
import GoalProgressCard from '../../components/GoalProgressCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showNetworkErrorAlert } from '../../lib/error-handler';
import { formatMiles } from '../../lib/miles-utils';
import { track } from '../../lib/analytics';
import { getCardImage } from '../../constants/cardImages';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProgramInfo {
  id: string;
  name: string;
  airline: string | null;
  icon_url: string | null;
}

interface BalanceInfo {
  manual_balance: number;
  updated_at: string | null;
}

interface ContributingCard {
  card_id: string;
  name: string;
  bank: string;
  slug?: string;
  base_rate_mpd?: number;
}

interface PortfolioProgram {
  program_id: string;
  program_name: string;
  manual_balance: number;
  auto_earned: number;
  total_redeemed: number;
  display_total: number;
  last_updated: string | null;
  contributing_cards: ContributingCard[];
}

interface Goal {
  goal_id: string;
  target_miles: number;
  description: string;
  achieved_at: string | null;
  created_at: string;
}

interface Redemption {
  transaction_id: string;
  amount: number;
  description: string | null;
  transaction_date: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function ProgramDetailScreen() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const { user } = useAuth();

  const [program, setProgram] = useState<ProgramInfo | null>(null);
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [autoEarned, setAutoEarned] = useState(0);
  const [totalRedeemed, setTotalRedeemed] = useState(0);
  const [displayTotal, setDisplayTotal] = useState(0);
  const [contributingCards, setContributingCards] = useState<ContributingCard[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  // Update Balance sheet state
  const [sheetVisible, setSheetVisible] = useState(false);
  const [newBalance, setNewBalance] = useState('');
  const [saving, setSaving] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  // Redemption sheet state
  const [redemptionSheetVisible, setRedemptionSheetVisible] = useState(false);
  const [redemptionAmount, setRedemptionAmount] = useState('');
  const [redemptionDesc, setRedemptionDesc] = useState('');
  const [redemptionSaving, setRedemptionSaving] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState(false);
  const [redemptionInputFocused, setRedemptionInputFocused] = useState(false);
  const successScaleAnim = useRef(new Animated.Value(0)).current;

  // Goal sheet state
  const [goalSheetVisible, setGoalSheetVisible] = useState(false);
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalSaving, setGoalSaving] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalInputFocused, setGoalInputFocused] = useState(false);

  // -------------------------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    if (!user || !programId) return;

    try {
      const [programRes, portfolioRes, goalsRes, redemptionsRes] = await Promise.all([
        supabase
          .from('miles_programs')
          .select('id, name, airline, icon_url')
          .eq('id', programId)
          .single(),
        supabase.rpc('get_miles_portfolio', { p_user_id: user.id }),
        supabase.rpc('get_program_goals', {
          p_user_id: user.id,
          p_program_id: programId,
        }),
        supabase.rpc('get_redemption_history', {
          p_user_id: user.id,
          p_program_id: programId,
          p_limit: 20,
        }),
      ]);

      if (programRes.error) {
        if (__DEV__) console.error('Program fetch error:', programRes.error);
        showNetworkErrorAlert(() => fetchData());
        setLoading(false);
        return;
      }

      setProgram(programRes.data as ProgramInfo);

      const rows = (portfolioRes.data ?? []) as PortfolioProgram[];
      const match = rows.find((p) => p.program_id === programId);

      if (match) {
        setBalance({
          manual_balance: match.manual_balance,
          updated_at: match.last_updated,
        });
        setAutoEarned(match.auto_earned);
        setTotalRedeemed(match.total_redeemed ?? 0);
        setDisplayTotal(match.display_total);
        setContributingCards(match.contributing_cards ?? []);
      } else {
        setBalance(null);
        setAutoEarned(0);
        setTotalRedeemed(0);
        setDisplayTotal(0);
        setContributingCards([]);
      }

      if (!goalsRes.error) {
        setGoals((goalsRes.data ?? []) as Goal[]);
      }

      if (!redemptionsRes.error) {
        setRedemptions((redemptionsRes.data ?? []) as Redemption[]);
      }

      await track('screen_view', { screen: 'program_detail', program_id: programId }, user.id);
    } catch (err) {
      if (__DEV__) console.error('Program detail fetch error:', err);
      showNetworkErrorAlert(() => fetchData());
    } finally {
      setLoading(false);
    }
  }, [user, programId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // -------------------------------------------------------------------------
  // Update Balance handlers
  // -------------------------------------------------------------------------
  const handleOpenSheet = () => {
    setNewBalance(String(balance?.manual_balance ?? 0));
    setSheetVisible(true);
  };

  const handleDismissSheet = () => {
    setSheetVisible(false);
    setNewBalance('');
  };

  const handleSaveBalance = async () => {
    if (!user || !programId) return;

    const parsed = parseInt(newBalance, 10);
    if (isNaN(parsed) || parsed < 0 || parsed > 10_000_000) {
      Alert.alert('Invalid Amount', 'Balance must be between 0 and 10,000,000.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.rpc('upsert_miles_balance', {
        p_user_id: user.id,
        p_program_id: programId,
        p_amount: parsed,
      });

      if (error) {
        if (__DEV__) console.error('Upsert balance error:', error);
        Alert.alert('Error', 'Failed to save balance. Please try again.');
        setSaving(false);
        return;
      }

      await track('screen_view', { screen: 'balance_updated', program_id: programId, amount: parsed }, user.id);

      handleDismissSheet();
      setLoading(true);
      await fetchData();
    } catch (err) {
      if (__DEV__) console.error('Save balance error:', err);
      Alert.alert('Error', 'Failed to save balance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const parsedNewBalance = parseInt(newBalance, 10);
  const isSaveDisabled =
    saving ||
    newBalance.trim() === '' ||
    isNaN(parsedNewBalance) ||
    parsedNewBalance < 0 ||
    parsedNewBalance > 10_000_000 ||
    parsedNewBalance === (balance?.manual_balance ?? 0);

  // -------------------------------------------------------------------------
  // Redemption handlers
  // -------------------------------------------------------------------------
  const handleOpenRedemptionSheet = () => {
    setRedemptionAmount('');
    setRedemptionDesc('');
    setRedemptionSuccess(false);
    setRedemptionSheetVisible(true);
  };

  const handleDismissRedemptionSheet = () => {
    setRedemptionSheetVisible(false);
    setRedemptionAmount('');
    setRedemptionDesc('');
    setRedemptionSuccess(false);
  };

  const handleLogRedemption = async () => {
    if (!user || !programId) return;

    const parsed = parseInt(redemptionAmount, 10);
    if (isNaN(parsed) || parsed <= 0 || parsed > 10_000_000) {
      Alert.alert('Invalid Amount', 'Please enter a valid miles amount.');
      return;
    }

    if (parsed > displayTotal) {
      Alert.alert(
        'Exceeds Balance',
        `This exceeds your current balance of ${formatMiles(displayTotal)} miles. Save anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save Anyway', onPress: () => executeLogRedemption(parsed) },
        ]
      );
      return;
    }

    await executeLogRedemption(parsed);
  };

  const executeLogRedemption = async (amount: number) => {
    if (!user || !programId) return;

    setRedemptionSaving(true);
    try {
      const { error } = await supabase.rpc('log_miles_redemption', {
        p_user_id: user.id,
        p_program_id: programId,
        p_amount: amount,
        p_description: redemptionDesc.trim() || null,
        p_date: new Date().toISOString().split('T')[0],
      });

      if (error) {
        if (__DEV__) console.error('Log redemption error:', error);
        Alert.alert('Error', 'Failed to log redemption. Please try again.');
        setRedemptionSaving(false);
        return;
      }

      await track('redemption_logged', { program_id: programId, amount }, user.id);

      setRedemptionSuccess(true);
      successScaleAnim.setValue(0);
      Animated.spring(successScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();

      setTimeout(() => {
        handleDismissRedemptionSheet();
        setLoading(true);
        fetchData();
      }, 1500);
    } catch (err) {
      if (__DEV__) console.error('Log redemption error:', err);
      Alert.alert('Error', 'Failed to log redemption. Please try again.');
    } finally {
      setRedemptionSaving(false);
    }
  };

  const parsedRedemption = parseInt(redemptionAmount, 10);
  const isRedemptionDisabled =
    redemptionSaving ||
    redemptionAmount.trim() === '' ||
    isNaN(parsedRedemption) ||
    parsedRedemption <= 0;

  // -------------------------------------------------------------------------
  // Goal handlers
  // -------------------------------------------------------------------------
  const handleOpenGoalSheet = (existingGoal?: Goal) => {
    if (existingGoal) {
      setEditingGoal(existingGoal);
      setGoalTarget(String(existingGoal.target_miles));
      setGoalDesc(existingGoal.description);
    } else {
      setEditingGoal(null);
      setGoalTarget('');
      setGoalDesc('');
    }
    setGoalSheetVisible(true);
  };

  const handleDismissGoalSheet = () => {
    setGoalSheetVisible(false);
    setGoalTarget('');
    setGoalDesc('');
    setEditingGoal(null);
  };

  const handleSaveGoal = async () => {
    if (!user || !programId) return;

    const parsed = parseInt(goalTarget, 10);
    if (isNaN(parsed) || parsed < 1000) {
      Alert.alert('Invalid Target', 'Target must be at least 1,000 miles.');
      return;
    }

    setGoalSaving(true);
    try {
      if (editingGoal) {
        await supabase.rpc('delete_miles_goal', {
          p_user_id: user.id,
          p_goal_id: editingGoal.goal_id,
        });
      }

      const { error } = await supabase.rpc('create_miles_goal', {
        p_user_id: user.id,
        p_program_id: programId,
        p_target: parsed,
        p_description: goalDesc.trim(),
      });

      if (error) {
        if (__DEV__) console.error('Save goal error:', error);
        const msg = error.message?.includes('3 active')
          ? 'Maximum 3 goals reached for this program.'
          : 'Failed to save goal. Please try again.';
        Alert.alert('Error', msg);
        setGoalSaving(false);
        return;
      }

      await track('goal_created', { program_id: programId, target: parsed }, user.id);

      handleDismissGoalSheet();
      setLoading(true);
      await fetchData();
    } catch (err) {
      if (__DEV__) console.error('Save goal error:', err);
      Alert.alert('Error', 'Failed to save goal. Please try again.');
    } finally {
      setGoalSaving(false);
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            try {
              const { error } = await supabase.rpc('delete_miles_goal', {
                p_user_id: user.id,
                p_goal_id: goalId,
              });
              if (error) {
                Alert.alert('Error', 'Failed to delete goal.');
                return;
              }
              await track('goal_deleted', { program_id: programId, goal_id: goalId }, user.id);
              setLoading(true);
              await fetchData();
            } catch {
              Alert.alert('Error', 'Failed to delete goal.');
            }
          },
        },
      ]
    );
  };

  const parsedGoalTarget = parseInt(goalTarget, 10);
  const isGoalDisabled =
    goalSaving ||
    goalTarget.trim() === '' ||
    goalDesc.trim() === '' ||
    isNaN(parsedGoalTarget) ||
    parsedGoalTarget < 1000;

  const activeGoals = goals.filter((g) => g.achieved_at === null);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  const todayFormatted = new Date().toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formatRedemptionDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-SG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Program Detail',
            headerBackTitle: 'Back',
            headerTintColor: Colors.brandGold,
            headerStyle: { backgroundColor: Colors.background },
            headerTitleStyle: { fontWeight: '600', color: Colors.textPrimary },
          }}
        />
        <LoadingSpinner message="Loading program details..." />
      </>
    );
  }

  if (!program) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: 'Program Detail',
            headerBackTitle: 'Back',
            headerTintColor: Colors.brandGold,
            headerStyle: { backgroundColor: Colors.background },
            headerTitleStyle: { fontWeight: '600', color: Colors.textPrimary },
          }}
        />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Program not found.</Text>
        </View>
      </>
    );
  }

  const manualBalance = balance?.manual_balance ?? 0;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <Image
              source={require('../../assets/Name.png')}
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
        source={require('../../assets/background.png')}
        style={styles.background}
        imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Program name + airline */}
            <Text style={styles.programName}>{program.name}</Text>
            {program.airline && (
              <Text style={styles.airlineName}>{program.airline}</Text>
            )}

            {/* Balance Breakdown */}
            <GlassCard style={styles.breakdownCard}>
              <BalanceBreakdown
                baseline={manualBalance}
                earned={autoEarned}
                redeemed={totalRedeemed}
                total={displayTotal}
                lastUpdated={balance?.updated_at ?? undefined}
              />
            </GlassCard>

            {/* Disclaimer */}
            <Text style={styles.disclaimer}>
              Estimated based on logged transactions. Actual balance may differ.
            </Text>

            {/* Action buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.7}
                onPress={handleOpenSheet}
                accessibilityRole="button"
                accessibilityLabel="Update balance"
              >
                <Text style={styles.primaryButtonText}>Update Balance</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.outlinedButton}
                activeOpacity={0.7}
                onPress={handleOpenRedemptionSheet}
                accessibilityRole="button"
                accessibilityLabel="Log redemption"
              >
                <Text style={styles.outlinedButtonText}>Log Redemption</Text>
              </TouchableOpacity>
            </View>

            {/* Contributing Cards */}
            <Text style={styles.sectionHeader}>CONTRIBUTING CARDS</Text>
            {contributingCards.length === 0 ? (
              <Text style={styles.emptyText}>
                No cards linked to this program yet.
              </Text>
            ) : (
              contributingCards.map((card) => {
                const localImg = getCardImage(card.slug ?? '');
                return (
                  <View key={card.card_id} style={styles.cardRow}>
                    <View style={styles.cardImageContainer}>
                      {localImg ? (
                        <Image
                          source={localImg}
                          style={styles.cardImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.cardImagePlaceholder}>
                          <Text style={styles.placeholderText}>
                            {card.bank.charAt(0)}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardName} numberOfLines={1}>
                        {card.name}
                      </Text>
                      <Text style={styles.cardBank}>{card.bank}</Text>
                    </View>
                  </View>
                );
              })
            )}

            {/* Goal section */}
            <Text style={styles.sectionHeader}>GOALS</Text>
            {goals.length > 0 ? (
              <>
                {goals.map((goal) => (
                  <GoalProgressCard
                    key={goal.goal_id}
                    goalId={goal.goal_id}
                    description={goal.description}
                    targetMiles={goal.target_miles}
                    currentBalance={displayTotal}
                    achievedAt={goal.achieved_at}
                    onEdit={(id) => {
                      const g = goals.find((x) => x.goal_id === id);
                      if (g) handleOpenGoalSheet(g);
                    }}
                    onDelete={handleDeleteGoal}
                  />
                ))}
                {activeGoals.length < 3 && (
                  <TouchableOpacity
                    style={styles.outlinedButtonFull}
                    activeOpacity={0.7}
                    onPress={() => handleOpenGoalSheet()}
                    accessibilityRole="button"
                    accessibilityLabel="Set a new goal"
                  >
                    <Ionicons
                      name="flag-outline"
                      size={18}
                      color={Colors.brandGold}
                      style={{ marginRight: Spacing.sm }}
                    />
                    <Text style={styles.outlinedButtonText}>Add Another Goal</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <TouchableOpacity
                style={styles.outlinedButtonFull}
                activeOpacity={0.7}
                onPress={() => handleOpenGoalSheet()}
                accessibilityRole="button"
                accessibilityLabel="Set a goal"
              >
                <Ionicons
                  name="flag-outline"
                  size={18}
                  color={Colors.brandGold}
                  style={{ marginRight: Spacing.sm }}
                />
                <Text style={styles.outlinedButtonText}>Set a Goal</Text>
              </TouchableOpacity>
            )}

            {/* Redemption History */}
            <Text style={styles.sectionHeader}>REDEMPTION HISTORY</Text>
            {redemptions.length > 0 ? (
              redemptions.map((r) => (
                <View key={r.transaction_id} style={styles.redemptionRow}>
                  <View style={styles.redemptionInfo}>
                    <Text style={styles.redemptionDesc} numberOfLines={1}>
                      {r.description || 'Redemption'}
                    </Text>
                    <Text style={styles.redemptionDate}>
                      {formatRedemptionDate(r.transaction_date)}
                    </Text>
                  </View>
                  <Text style={styles.redemptionAmount}>
                    -{formatMiles(r.amount)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>
                No redemptions yet. When you redeem miles, they'll appear here.
              </Text>
            )}
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>

      {/* Update Balance Bottom Sheet */}
      <BottomSheet
        visible={sheetVisible}
        onDismiss={handleDismissSheet}
        title={`Update ${program.name} Balance`}
      >
        <Text style={styles.sheetCurrentBalance}>
          Current balance: {formatMiles(manualBalance)}
        </Text>

        <Text style={styles.inputLabel}>NEW BALANCE</Text>
        <View
          style={[
            styles.inputBorder,
            inputFocused && styles.inputBorderFocused,
          ]}
        >
          <TextInput
            style={styles.numericInput}
            value={newBalance}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, '');
              setNewBalance(cleaned);
            }}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={Colors.textTertiary}
            autoFocus
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            accessibilityLabel="New balance amount"
          />
        </View>

        <Text style={styles.helperText}>
          This replaces your manual baseline. Auto-earned miles are added on top.
        </Text>

        <TouchableOpacity
          style={[styles.saveCta, isSaveDisabled && styles.saveCtaDisabled]}
          activeOpacity={0.7}
          onPress={handleSaveBalance}
          disabled={isSaveDisabled}
          accessibilityRole="button"
          accessibilityLabel="Save balance"
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.brandCharcoal} />
          ) : (
            <Text
              style={[
                styles.saveCtaText,
                isSaveDisabled && styles.saveCtaTextDisabled,
              ]}
            >
              Save
            </Text>
          )}
        </TouchableOpacity>
      </BottomSheet>

      {/* Log Redemption Bottom Sheet */}
      <BottomSheet
        visible={redemptionSheetVisible}
        onDismiss={handleDismissRedemptionSheet}
        title={`Log ${program.name} Redemption`}
      >
        {redemptionSuccess ? (
          <Animated.View
            style={[
              styles.celebrationContainer,
              { transform: [{ scale: successScaleAnim }] },
            ]}
          >
            <Ionicons name="checkmark-circle" size={48} color={Colors.brandGold} />
            <Text style={styles.celebrationTitle}>Redemption logged!</Text>
            <Text style={styles.celebrationSubtitle}>
              Balance: {formatMiles(displayTotal - (parseInt(redemptionAmount, 10) || 0))}
            </Text>
          </Animated.View>
        ) : (
          <>
            <Text style={styles.inputLabel}>MILES REDEEMED</Text>
            <View
              style={[
                styles.inputBorder,
                redemptionInputFocused && styles.inputBorderFocused,
              ]}
            >
              <TextInput
                style={styles.numericInput}
                value={redemptionAmount}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setRedemptionAmount(cleaned);
                }}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={Colors.textTertiary}
                autoFocus
                onFocus={() => setRedemptionInputFocused(true)}
                onBlur={() => setRedemptionInputFocused(false)}
                accessibilityLabel="Miles redeemed"
              />
            </View>

            <Text style={styles.inputLabel}>WHAT DID YOU REDEEM FOR?</Text>
            <View style={styles.inputBorder}>
              <TextInput
                style={styles.textInputField}
                value={redemptionDesc}
                onChangeText={(text) => setRedemptionDesc(text.slice(0, 100))}
                placeholder="e.g. SIN to NRT Business Class"
                placeholderTextColor={Colors.textTertiary}
                maxLength={100}
                accessibilityLabel="Redemption description"
              />
            </View>

            <Text style={styles.inputLabel}>DATE</Text>
            <View style={styles.dateDisplay}>
              <Text style={styles.dateText}>{todayFormatted}</Text>
              <Ionicons name="calendar-outline" size={18} color={Colors.textTertiary} />
            </View>

            <TouchableOpacity
              style={[styles.saveCta, isRedemptionDisabled && styles.saveCtaDisabled]}
              activeOpacity={0.7}
              onPress={handleLogRedemption}
              disabled={isRedemptionDisabled}
              accessibilityRole="button"
              accessibilityLabel="Log redemption"
            >
              {redemptionSaving ? (
                <ActivityIndicator size="small" color={Colors.brandCharcoal} />
              ) : (
                <Text
                  style={[
                    styles.saveCtaText,
                    isRedemptionDisabled && styles.saveCtaTextDisabled,
                  ]}
                >
                  Log Redemption
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </BottomSheet>

      {/* Set / Edit Goal Bottom Sheet */}
      <BottomSheet
        visible={goalSheetVisible}
        onDismiss={handleDismissGoalSheet}
        title={editingGoal ? `Edit ${program.name} Goal` : `Set ${program.name} Goal`}
      >
        <Text style={styles.inputLabel}>TARGET MILES</Text>
        <View
          style={[
            styles.inputBorder,
            goalInputFocused && styles.inputBorderFocused,
          ]}
        >
          <TextInput
            style={styles.numericInput}
            value={goalTarget}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, '');
              setGoalTarget(cleaned);
            }}
            keyboardType="numeric"
            placeholder="e.g. 42000"
            placeholderTextColor={Colors.textTertiary}
            autoFocus
            onFocus={() => setGoalInputFocused(true)}
            onBlur={() => setGoalInputFocused(false)}
            accessibilityLabel="Target miles"
          />
        </View>
        {goalTarget.trim() !== '' && !isNaN(parseInt(goalTarget, 10)) && parseInt(goalTarget, 10) < 1000 && (
          <Text style={styles.validationError}>Minimum target is 1,000 miles</Text>
        )}

        <Text style={styles.inputLabel}>WHAT'S THIS GOAL FOR?</Text>
        <View style={styles.inputBorder}>
          <TextInput
            style={styles.textInputField}
            value={goalDesc}
            onChangeText={(text) => setGoalDesc(text.slice(0, 80))}
            placeholder="e.g. Tokyo Business Class"
            placeholderTextColor={Colors.textTertiary}
            maxLength={80}
            accessibilityLabel="Goal description"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveCta, isGoalDisabled && styles.saveCtaDisabled]}
          activeOpacity={0.7}
          onPress={handleSaveGoal}
          disabled={isGoalDisabled}
          accessibilityRole="button"
          accessibilityLabel="Save goal"
        >
          {goalSaving ? (
            <ActivityIndicator size="small" color={Colors.brandCharcoal} />
          ) : (
            <Text
              style={[
                styles.saveCtaText,
                isGoalDisabled && styles.saveCtaTextDisabled,
              ]}
            >
              Save Goal
            </Text>
          )}
        </TouchableOpacity>

        {editingGoal && (
          <TouchableOpacity
            style={styles.deleteGoalLink}
            onPress={() => {
              handleDismissGoalSheet();
              handleDeleteGoal(editingGoal.goal_id);
            }}
            accessibilityRole="button"
            accessibilityLabel="Delete goal"
          >
            <Text style={styles.deleteGoalText}>Delete Goal</Text>
          </TouchableOpacity>
        )}
      </BottomSheet>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl + 40,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },

  programName: {
    ...Typography.heading,
    fontSize: 26,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  airlineName: {
    ...Typography.body,
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },

  breakdownCard: {
    marginBottom: Spacing.sm,
  },
  disclaimer: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontStyle: 'italic',
    marginBottom: Spacing.xl,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.brandGold,
    borderRadius: BorderRadius.md,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
  },
  outlinedButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.brandGold,
    borderRadius: BorderRadius.md,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  outlinedButtonText: {
    ...Typography.bodyBold,
    color: Colors.brandGold,
  },
  outlinedButtonFull: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Colors.brandGold,
    borderRadius: BorderRadius.md,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: Spacing.xxl,
  },

  sectionHeader: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    paddingVertical: Spacing.lg,
  },

  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.15)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
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
  cardInfo: {
    flex: 1,
  },
  cardName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  cardBank: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  // Redemption history rows
  redemptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.15)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
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
  redemptionInfo: {
    flex: 1,
  },
  redemptionDesc: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  redemptionDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  redemptionAmount: {
    ...Typography.bodyBold,
    color: Colors.danger,
    marginLeft: Spacing.sm,
  },

  // Bottom sheet shared styles
  sheetCurrentBalance: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  inputBorder: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    height: 48,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  inputBorderFocused: {
    borderColor: Colors.brandGold,
  },
  numericInput: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  textInputField: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginBottom: Spacing.xl,
  },
  validationError: {
    ...Typography.caption,
    color: Colors.danger,
    marginBottom: Spacing.sm,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    height: 48,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  dateText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  saveCta: {
    backgroundColor: Colors.brandGold,
    borderRadius: BorderRadius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  saveCtaDisabled: {
    opacity: 0.4,
  },
  saveCtaText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
  },
  saveCtaTextDisabled: {
    color: Colors.brandCharcoal,
  },

  // Celebration state
  celebrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  celebrationTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  celebrationSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  // Delete goal
  deleteGoalLink: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  deleteGoalText: {
    ...Typography.body,
    color: Colors.danger,
  },
});
