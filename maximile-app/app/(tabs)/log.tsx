import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Platform,
  Alert,
  ImageBackground,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CATEGORIES, CATEGORY_MAP } from '../../constants/categories';
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
  Glass,
} from '../../constants/theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import CapAlert from '../../components/CapAlert';
import { useCapAlerts } from '../../hooks/useCapAlerts';
import { handleSupabaseError, showNetworkErrorAlert } from '../../lib/error-handler';
import { track } from '../../lib/analytics';
import { getCardImage } from '../../constants/cardImages';
import type { Card, UserCard, Cap, SpendingState } from '../../lib/supabase-types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserCardWithDetails extends UserCard {
  card: Card;
}

interface SuccessData {
  amount: number;
  categoryId: string;
  cardName: string;
  bankName: string;
  earnRate: number;
  baseRate: number;
  remainingCap: number | null;
  capAmount: number | null;
}

// ---------------------------------------------------------------------------
// Time-of-day default category
// ---------------------------------------------------------------------------

function getDefaultCategory(): string {
  const hour = new Date().getHours();
  if (hour >= 11 && hour < 14) return 'dining';
  if (hour >= 17 && hour < 21) return 'dining';
  if (hour >= 7 && hour < 9) return 'transport';
  return 'general';
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/**
 * Log Transaction screen (DRD Section 7)
 *
 * Custom keypad, category/card chip selectors, pre-fill from recommendation,
 * success overlay with loss aversion nudge. Target: < 10 seconds.
 */
export default function LogScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; card?: string }>();

  // Form state
  const [amountStr, setAmountStr] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Data
  const [cards, setCards] = useState<UserCardWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Success overlay
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  // Cap alerts after transaction
  const { alerts: capAlerts, fetchAlerts } = useCapAlerts(user?.id);
  const [postTxnAlert, setPostTxnAlert] = useState<typeof capAlerts[number] | null>(null);
  const autoDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardScrollRef = useRef<ScrollView>(null);

  // Layout
  const { height: windowHeight } = useWindowDimensions();
  const isCompact = windowHeight < 750;

  // -------------------------------------------------------------------------
  // Fetch user cards on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!user) return;

    const fetchCards = async () => {
      try {
        const { data, error } = await supabase
          .from('user_cards')
          .select('*, card:cards(*)')
          .eq('user_id', user.id);

        if (!error && data) {
          setCards(data as unknown as UserCardWithDetails[]);
        }
      } catch {
        showNetworkErrorAlert();
      }
      setLoading(false);
    };

    fetchCards();
  }, [user]);

  // -------------------------------------------------------------------------
  // Pre-fill from route params (recommendation context) or time-of-day
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category);
    } else if (!selectedCategory) {
      setSelectedCategory(getDefaultCategory());
    }
  }, [params.category]);

  useEffect(() => {
    if (params.card && cards.length > 0) {
      const found = cards.find((uc) => uc.card.id === params.card);
      if (found) {
        setSelectedCardId(params.card);
      }
    }
  }, [params.card, cards]);

  useEffect(() => {
    if (showSuccess && capAlerts.length > 0 && !postTxnAlert) {
      const relevant = capAlerts.find(
        (a) => a.cardId === selectedCardId && (a.categoryId === selectedCategory || a.categoryId === null),
      ) ?? capAlerts[0];

      if (relevant) {
        setPostTxnAlert(relevant);
        autoDismissTimer.current = setTimeout(() => {
          setPostTxnAlert(null);
        }, 5000);
      }
    }
  }, [capAlerts, showSuccess, postTxnAlert, selectedCardId, selectedCategory]);

  useEffect(() => {
    return () => {
      if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
    };
  }, []);

  // -------------------------------------------------------------------------
  // Custom keypad input handler
  // -------------------------------------------------------------------------
  const handleKeyPress = useCallback((key: string) => {
    setAmountStr((prev) => {
      if (key === 'backspace') {
        return prev.slice(0, -1);
      }

      if (key === '.') {
        // Only one decimal allowed
        if (prev.includes('.')) return prev;
        // If empty, start with "0."
        if (prev === '') return '0.';
        return prev + '.';
      }

      // Digit 0-9
      // Max 2 decimal places
      const dotIndex = prev.indexOf('.');
      if (dotIndex !== -1 && prev.length - dotIndex > 2) return prev;

      // Max value guard: $99,999.99
      const candidate = prev + key;
      const parsed = parseFloat(candidate);
      if (parsed > 99999.99) return prev;

      return candidate;
    });
  }, []);

  // -------------------------------------------------------------------------
  // Format display amount
  // -------------------------------------------------------------------------
  const displayAmount = amountStr === '' ? '0.00' : amountStr;
  const parsedAmount = parseFloat(amountStr) || 0;

  // -------------------------------------------------------------------------
  // Cards sorted with selected first
  // -------------------------------------------------------------------------
  const sortedCards = useMemo(() => {
    if (!selectedCardId) return cards;
    return [...cards].sort((a, b) => {
      if (a.card.id === selectedCardId) return -1;
      if (b.card.id === selectedCardId) return 1;
      return 0;
    });
  }, [cards, selectedCardId]);

  // -------------------------------------------------------------------------
  // Confirm button enabled
  // -------------------------------------------------------------------------
  const canSubmit = parsedAmount > 0 && selectedCategory !== null && selectedCardId !== null;

  // -------------------------------------------------------------------------
  // Submit transaction
  // -------------------------------------------------------------------------
  const handleConfirm = async () => {
    if (!user || !canSubmit) return;

    setSubmitting(true);

    const today = new Date().toISOString().slice(0, 10);

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      card_id: selectedCardId!,
      category_id: selectedCategory!,
      amount: parsedAmount,
      transaction_date: today,
      notes: null,
    });

    if (error) {
      setSubmitting(false);
      const msg = handleSupabaseError(error);
      Alert.alert('Error', msg || 'Failed to log transaction. Please try again.');
      return;
    }

    // Fetch earn rate for this card + category
    const selectedCard = cards.find((uc) => uc.card.id === selectedCardId)?.card;
    let earnRate = selectedCard?.base_rate_mpd ?? 1.4;

    const { data: earnRules } = await supabase
      .from('earn_rules')
      .select('earn_rate_mpd')
      .eq('card_id', selectedCardId!)
      .eq('category_id', selectedCategory!)
      .is('effective_to', null)
      .limit(1);

    if (earnRules && earnRules.length > 0) {
      earnRate = earnRules[0].earn_rate_mpd;
    }

    // Compute remaining cap from transactions directly (trigger may not exist)
    const logNow = new Date();
    const currentMonth = logNow.toISOString().slice(0, 7);
    const monthStart = `${currentMonth}-01`;
    const nextMonthDate = new Date(logNow.getFullYear(), logNow.getMonth() + 1, 1);
    const nextMonthStr = nextMonthDate.toISOString().slice(0, 10);
    let remainingCap: number | null = null;
    let capAmount: number | null = null;

    const { data: capData } = await supabase
      .from('caps')
      .select('monthly_cap_amount, category_id')
      .eq('card_id', selectedCardId!)
      .or(`category_id.eq.${selectedCategory!},category_id.is.null`)
      .order('category_id', { nullsFirst: false })
      .limit(1);

    if (capData && capData.length > 0) {
      const cap = capData[0] as { monthly_cap_amount: number; category_id: string | null };
      capAmount = cap.monthly_cap_amount;

      // Sum transactions for this card+category this month
      const { data: txnData } = cap.category_id
        ? await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', user.id)
            .eq('card_id', selectedCardId!)
            .eq('category_id', selectedCategory!)
            .gte('transaction_date', monthStart)
            .lt('transaction_date', nextMonthStr)
        : await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', user.id)
            .eq('card_id', selectedCardId!)
            .gte('transaction_date', monthStart)
            .lt('transaction_date', nextMonthStr);

      const totalSpent = (txnData ?? []).reduce(
        (sum, t) => sum + ((t as { amount: number }).amount ?? 0),
        0,
      );
      remainingCap = Math.max(capAmount - totalSpent, 0);
    }

    setSubmitting(false);
    setSuccessData({
      amount: parsedAmount,
      categoryId: selectedCategory!,
      cardName: selectedCard?.name ?? 'Card',
      bankName: selectedCard?.bank ?? '',
      earnRate,
      baseRate: selectedCard?.base_rate_mpd ?? 1.4,
      remainingCap,
      capAmount,
    });
    setShowSuccess(true);

    // Check if any cap thresholds were crossed after this transaction
    await fetchAlerts();

    track('transaction_logged', {
      amount: parsedAmount,
      category: selectedCategory!,
      card_id: selectedCardId!,
      earn_rate: earnRate,
    }, user.id);
  };

  // -------------------------------------------------------------------------
  // Dismiss success overlay
  // -------------------------------------------------------------------------
  const handleDone = () => {
    setShowSuccess(false);
    setSuccessData(null);
    setPostTxnAlert(null);
    if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
    setAmountStr('');
  };

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------
  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  // -------------------------------------------------------------------------
  // Today's date display
  // -------------------------------------------------------------------------
  const todayStr = new Date().toLocaleDateString('en-SG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.background}
      imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
    >
      <SafeAreaView style={styles.safeArea} edges={[]}>
        <View style={styles.content}>
          {/* Amount Display */}
          <View style={styles.amountDisplay}>
            <Text style={styles.sectionLabel}>AMOUNT</Text>
            <Text style={styles.amountText}>
              ${displayAmount}
            </Text>
          </View>

          {/* Category Selector — Wrap chips */}
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.chipWrap}>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, isActive && styles.categoryChipActive, isCompact && styles.categoryChipCompact]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={(isActive ? cat.iconFilled : cat.icon) as keyof typeof Ionicons.glyphMap}
                    size={isCompact ? 14 : 16}
                    color={isActive ? Colors.brandGold : Colors.brandCharcoal}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      isActive && styles.categoryChipTextActive,
                      isCompact && styles.categoryChipTextCompact,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Card Selector — Horizontal scroll, selected always first */}
          <Text style={styles.sectionLabel}>Card</Text>
          <ScrollView
            ref={cardScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.cardScroll}
            contentContainerStyle={styles.cardScrollContent}
          >
            {sortedCards.map((uc) => {
              const isActive = selectedCardId === uc.card.id;
              const localImg = getCardImage(uc.card.slug);
              const imgSource = uc.card.image_url
                ? { uri: uc.card.image_url }
                : localImg;
              return (
                <TouchableOpacity
                  key={uc.card_id}
                  style={[styles.cardChip, isActive && styles.cardChipActive]}
                  onPress={() => {
                    setSelectedCardId(uc.card.id);
                    cardScrollRef.current?.scrollTo({ x: 0, animated: true });
                  }}
                  activeOpacity={0.7}
                >
                  {imgSource ? (
                    <Image source={imgSource} style={styles.cardChipImage} resizeMode="contain" />
                  ) : (
                    <View style={styles.cardChipImagePlaceholder}>
                      <Text style={styles.cardChipImagePlaceholderText}>
                        {uc.card.bank.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <Text
                    style={[
                      styles.cardChipBank,
                      isActive && styles.cardChipBankActive,
                    ]}
                    numberOfLines={1}
                  >
                    {uc.card.bank}
                  </Text>
                  <Text
                    style={[
                      styles.cardChipName,
                      isActive && styles.cardChipNameActive,
                    ]}
                    numberOfLines={1}
                  >
                    {uc.card.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Date + Confirm row */}
          <View style={styles.dateConfirmRow}>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.dateText}>{todayStr}</Text>
            </View>
            <TouchableOpacity
              style={[styles.confirmButton, !canSubmit && styles.confirmButtonDisabled]}
              onPress={handleConfirm}
              activeOpacity={0.8}
              disabled={!canSubmit || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={Colors.brandCharcoal} />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Custom Keypad */}
          <View style={styles.keypad}>
            {[
              ['1', '2', '3'],
              ['4', '5', '6'],
              ['7', '8', '9'],
              ['.', '0', 'backspace'],
            ].map((row, rowIdx) => (
              <View key={rowIdx} style={styles.keypadRow}>
                {row.map((key) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.keypadKey, isCompact && styles.keypadKeyCompact]}
                    onPress={() => handleKeyPress(key)}
                    activeOpacity={0.6}
                  >
                    {key === 'backspace' ? (
                      <Ionicons name="backspace-outline" size={22} color={Colors.textSecondary} />
                    ) : (
                      <Text style={styles.keypadKeyText}>{key}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* Success Overlay */}
        <Modal
          visible={showSuccess}
          transparent
          animationType="fade"
          onRequestClose={handleDone}
        >
          <View style={styles.overlayBackdrop}>
            {Platform.OS === 'ios' ? (
              <BlurView
                intensity={60}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.glassBgDark }]} />
            )}
            <View style={styles.overlayContent}>
              {/* Checkmark */}
              <View style={styles.successCheckCircle}>
                <Ionicons name="checkmark" size={32} color={Colors.brandCharcoal} />
              </View>

              {/* Title */}
              <Text style={styles.successTitle}>Logged!</Text>

              {/* Summary */}
              {successData && (
                <>
                  <Text style={styles.successAmount}>
                    ${successData.amount.toFixed(2)}{' '}
                    {CATEGORY_MAP[successData.categoryId]?.name}
                  </Text>
                  <Text style={styles.successCard}>
                    {successData.cardName}
                  </Text>

                  {/* MPD earned */}
                  {successData.earnRate > successData.baseRate ? (
                    <View style={styles.mpdSection}>
                      <Text style={styles.mpdEarned}>
                        You earned {successData.earnRate.toFixed(1)} mpd
                      </Text>
                      <Text style={styles.mpdComparison}>
                        Base rate: {successData.baseRate.toFixed(1)} mpd
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.mpdSection}>
                      <Text style={styles.mpdEarned}>
                        {successData.earnRate.toFixed(1)} mpd earned
                      </Text>
                    </View>
                  )}

                  {/* Remaining cap */}
                  {successData.remainingCap !== null && successData.capAmount !== null && (
                    <Text style={styles.capRemaining}>
                      ${Math.max(0, successData.remainingCap).toLocaleString()} remaining on{' '}
                      {successData.cardName}{' '}
                      {CATEGORY_MAP[successData.categoryId]?.name} cap
                    </Text>
                  )}
                </>
              )}

              {postTxnAlert && (
                <View style={styles.postTxnAlertWrapper}>
                  <CapAlert
                    cardName={postTxnAlert.cardName}
                    categoryName={postTxnAlert.categoryName}
                    percentUsed={postTxnAlert.percentUsed}
                    remainingAmount={postTxnAlert.remainingAmount}
                    alternativeCard={postTxnAlert.alternativeCard}
                    onDismiss={() => {
                      setPostTxnAlert(null);
                      if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
                    }}
                  />
                </View>
              )}

              {/* Done button */}
              <TouchableOpacity
                style={styles.doneButton}
                onPress={handleDone}
                activeOpacity={0.8}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    paddingTop: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 116 : 96,
  },

  // Section labels
  sectionLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },

  // Amount display
  amountDisplay: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  amountText: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    color: Colors.textPrimary,
  },

  // Category chips
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    flexGrow: 1,
    flexBasis: '28%',
    gap: Spacing.xs,
  },
  categoryChipActive: {
    borderColor: Colors.brandGold,
    backgroundColor: 'rgba(197, 165, 90, 0.12)',
  },
  categoryChipCompact: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  categoryChipText: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  categoryChipTextActive: {
    color: Colors.brandCharcoal,
  },
  categoryChipTextCompact: {
    fontSize: 11,
  },

  // Card scroll
  cardScroll: {
    flexGrow: 0,
    marginVertical: Spacing.xs,
  },
  cardScrollContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },

  // Card chips
  cardChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    minWidth: 100,
    alignItems: 'center',
  },
  cardChipImage: {
    width: 64,
    height: 40,
    marginBottom: 4,
    borderRadius: 4,
  },
  cardChipImagePlaceholder: {
    width: 64,
    height: 40,
    marginBottom: 4,
    borderRadius: 4,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardChipImagePlaceholderText: {
    ...Typography.bodyBold,
    color: Colors.textTertiary,
    fontSize: 14,
  },
  cardChipActive: {
    borderColor: Colors.brandGold,
    backgroundColor: 'rgba(197, 165, 90, 0.12)',
  },
  cardChipBank: {
    ...Typography.label,
    color: Colors.textSecondary,
    fontSize: 10,
    lineHeight: 12,
    marginBottom: 1,
  },
  cardChipBankActive: {
    color: Colors.brandGold,
  },
  cardChipName: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    lineHeight: 16,
  },
  cardChipNameActive: {
    color: Colors.brandCharcoal,
  },

  // Date + Confirm row
  dateConfirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    gap: Spacing.sm,
  },
  dateText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  // Confirm button
  confirmButton: {
    flex: 1,
    backgroundColor: Colors.brandGold,
    borderRadius: BorderRadius.md,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  confirmButtonText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
  },

  // Custom keypad
  keypad: {
    flex: 1,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  keypadRow: {
    flexDirection: 'row',
    flex: 1,
    gap: Spacing.sm,
  },
  keypadKey: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadKeyCompact: {
    borderRadius: BorderRadius.sm,
  },
  keypadKeyText: {
    ...Typography.subheading,
    color: Colors.textPrimary,
  },

  // Success overlay
  overlayBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginHorizontal: Spacing.xl,
    alignItems: 'center',
    maxWidth: 320,
    width: '85%',
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    ...Shadows.glass,
  },
  successCheckCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.brandGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successTitle: {
    ...Typography.subheading,
    color: Colors.brandGold,
    marginBottom: Spacing.md,
  },
  successAmount: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  successCard: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  mpdSection: {
    backgroundColor: 'rgba(197, 165, 90, 0.08)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
  },
  mpdEarned: {
    ...Typography.bodyBold,
    color: Colors.brandGold,
    marginBottom: Spacing.xs,
  },
  mpdComparison: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  capRemaining: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  postTxnAlertWrapper: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  doneButton: {
    backgroundColor: Colors.brandGold,
    borderRadius: BorderRadius.md,
    height: 48,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
  },
});
