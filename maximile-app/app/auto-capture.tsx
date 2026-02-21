import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Platform,
  Alert,
  ImageBackground,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CATEGORIES, CATEGORY_MAP } from '../constants/categories';
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
} from '../constants/theme';
import { matchMerchant, saveMerchantOverride } from '../lib/merchant-mapper';
import { matchCard, saveCardMapping } from '../lib/card-matcher';
import type { AutoCaptureParams } from '../lib/deep-link';
import { handleSupabaseError, showNetworkErrorAlert } from '../lib/error-handler';
import { track } from '../lib/analytics';
import { getCardImage } from '../constants/cardImages';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserCardWithDetails {
  card_id: string;
  card: {
    id: string;
    name: string;
    bank: string;
    slug: string;
    image_url: string | null;
    base_rate_mpd: number;
  };
}

const SOURCE_LABELS: Record<string, { label: string; icon: string }> = {
  shortcut: { label: 'Via Apple Shortcut', icon: 'flash' },
  notification: { label: 'Via Notification', icon: 'notifications' },
  manual: { label: 'Manual Entry', icon: 'create' },
};

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function AutoCaptureScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{
    amount?: string;
    merchant?: string;
    card?: string;
    source?: string;
  }>();

  // Form state
  const [amount, setAmount] = useState(params.amount || '');
  const [merchantName, setMerchantName] = useState(params.merchant || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState(false);

  // Original values for detecting overrides
  const [originalCategoryId, setOriginalCategoryId] = useState<string | null>(null);
  const [originalCardId, setOriginalCardId] = useState<string | null>(null);

  // Data
  const [cards, setCards] = useState<UserCardWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Success overlay
  const [showSuccess, setShowSuccess] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardScrollRef = useRef<ScrollView>(null);
  const amountInputRef = useRef<TextInput>(null);

  const source = (params.source as AutoCaptureParams['source']) || 'manual';
  const sourceInfo = SOURCE_LABELS[source] || SOURCE_LABELS.manual;

  // -------------------------------------------------------------------------
  // Entrance animation
  // -------------------------------------------------------------------------
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // -------------------------------------------------------------------------
  // Fetch user cards
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
  // Auto-match merchant → category
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!user || !merchantName) return;

    const doMatch = async () => {
      const result = await matchMerchant(user.id, merchantName);
      if (result.categoryId) {
        setSelectedCategory(result.categoryId);
        setOriginalCategoryId(result.categoryId);
      }
    };

    doMatch();
  }, [user, merchantName]);

  // -------------------------------------------------------------------------
  // Auto-match card name → user card
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!user || !params.card || cards.length === 0) return;

    const doMatch = async () => {
      const result = await matchCard(user.id, params.card!);
      if (result) {
        setSelectedCardId(result.cardId);
        setOriginalCardId(result.cardId);
      }
    };

    doMatch();
  }, [user, params.card, cards]);

  // -------------------------------------------------------------------------
  // Parsed amount
  // -------------------------------------------------------------------------
  const parsedAmount = parseFloat(amount) || 0;
  const displayAmount = parsedAmount > 0 ? parsedAmount.toFixed(2) : '0.00';
  const canSubmit = parsedAmount > 0 && selectedCategory !== null && selectedCardId !== null;

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
  // Confirm transaction
  // -------------------------------------------------------------------------
  const handleConfirm = useCallback(async () => {
    if (!user || !canSubmit) return;

    setSubmitting(true);
    Keyboard.dismiss();

    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      card_id: selectedCardId!,
      category_id: selectedCategory!,
      amount: parsedAmount,
      transaction_date: today,
      merchant_name: merchantName || null,
      source: source === 'manual' ? 'manual' : 'auto_capture',
      notes: null,
    });

    if (error) {
      setSubmitting(false);
      const msg = handleSupabaseError(error);
      Alert.alert('Error', msg || 'Failed to log transaction. Please try again.');
      return;
    }

    // Save overrides if user changed the auto-matched values
    try {
      if (merchantName && selectedCategory && selectedCategory !== originalCategoryId) {
        await saveMerchantOverride(user.id, merchantName, selectedCategory);
      }
      if (params.card && selectedCardId && selectedCardId !== originalCardId) {
        await saveCardMapping(user.id, params.card, selectedCardId);
      }
    } catch {
      // Override saves are best-effort
    }

    track('transaction_logged', {
      amount: parsedAmount,
      category: selectedCategory!,
      card_id: selectedCardId!,
      source,
      auto_captured: true,
    }, user.id);

    setSubmitting(false);
    setShowSuccess(true);
  }, [
    user, canSubmit, selectedCardId, selectedCategory, parsedAmount,
    merchantName, source, originalCategoryId, originalCardId, params.card,
  ]);

  // -------------------------------------------------------------------------
  // Dismiss / Done
  // -------------------------------------------------------------------------
  const handleDismiss = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, [router]);

  const handleDone = useCallback(() => {
    setShowSuccess(false);
    router.replace('/(tabs)');
  }, [router]);

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <ImageBackground
        source={require('../assets/background.png')}
        style={styles.background}
        imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.brandGold} />
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.background}
      imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Animated.View
            style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={handleDismiss} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <Ionicons name="close" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Confirm Transaction</Text>
                <View style={{ width: 24 }} />
              </View>

              {/* Source badge */}
              <View style={styles.badgeRow}>
                <View style={styles.sourceBadge}>
                  <Ionicons
                    name={sourceInfo.icon as keyof typeof Ionicons.glyphMap}
                    size={14}
                    color={Colors.brandGold}
                  />
                  <Text style={styles.sourceBadgeText}>{sourceInfo.label}</Text>
                </View>
              </View>

              {/* Amount card */}
              <View style={styles.glassCard}>
                <Text style={styles.fieldLabel}>AMOUNT</Text>
                {editingAmount ? (
                  <View style={styles.amountEditRow}>
                    <Text style={styles.amountCurrency}>$</Text>
                    <TextInput
                      ref={amountInputRef}
                      style={styles.amountInput}
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="decimal-pad"
                      autoFocus
                      onBlur={() => setEditingAmount(false)}
                      selectTextOnFocus
                      maxLength={10}
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      setEditingAmount(true);
                      setTimeout(() => amountInputRef.current?.focus(), 100);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.amountDisplay}>${displayAmount}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Merchant card */}
              <View style={styles.glassCard}>
                <Text style={styles.fieldLabel}>MERCHANT</Text>
                {editingMerchant ? (
                  <TextInput
                    style={styles.merchantInput}
                    value={merchantName}
                    onChangeText={setMerchantName}
                    autoFocus
                    onBlur={() => setEditingMerchant(false)}
                    placeholder="Enter merchant name"
                    placeholderTextColor={Colors.textTertiary}
                    maxLength={100}
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => setEditingMerchant(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.merchantDisplay,
                      !merchantName && styles.merchantPlaceholder,
                    ]}>
                      {merchantName || 'Tap to add merchant'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Category selector */}
              <View style={styles.glassCard}>
                <Text style={styles.fieldLabel}>CATEGORY</Text>
                <View style={styles.chipWrap}>
                  {CATEGORIES.map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                        onPress={() => setSelectedCategory(cat.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={(isActive ? cat.iconFilled : cat.icon) as keyof typeof Ionicons.glyphMap}
                          size={15}
                          color={isActive ? Colors.brandGold : Colors.textSecondary}
                        />
                        <Text style={[
                          styles.categoryChipText,
                          isActive && styles.categoryChipTextActive,
                        ]}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Card selector */}
              <View style={styles.glassCard}>
                <Text style={styles.fieldLabel}>CARD</Text>
                <ScrollView
                  ref={cardScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
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
                            <Text style={styles.cardChipPlaceholderText}>
                              {uc.card.bank.charAt(0)}
                            </Text>
                          </View>
                        )}
                        <Text
                          style={[styles.cardChipBank, isActive && styles.cardChipBankActive]}
                          numberOfLines={1}
                        >
                          {uc.card.bank}
                        </Text>
                        <Text
                          style={[styles.cardChipName, isActive && styles.cardChipNameActive]}
                          numberOfLines={1}
                        >
                          {uc.card.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {cards.length === 0 && (
                    <Text style={styles.noCardsText}>No cards in your portfolio</Text>
                  )}
                </ScrollView>
              </View>

              {/* Date display */}
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.dateText}>
                  {new Date().toLocaleDateString('en-SG', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </ScrollView>

            {/* Bottom buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={handleDismiss}
                activeOpacity={0.7}
              >
                <Text style={styles.dismissButtonText}>Dismiss</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, !canSubmit && styles.confirmButtonDisabled]}
                onPress={handleConfirm}
                activeOpacity={0.8}
                disabled={!canSubmit || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={Colors.brandCharcoal} />
                ) : (
                  <LinearGradient
                    colors={['#D4B96A', Colors.brandGold, '#B8953F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.confirmGradient}
                  >
                    <Ionicons name="checkmark-circle" size={20} color={Colors.brandCharcoal} />
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>

        {/* Success Overlay */}
        <Modal
          visible={showSuccess}
          transparent
          animationType="fade"
          onRequestClose={handleDone}
        >
          <View style={styles.overlayBackdrop}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.glassBgDark }]} />
            )}
            <View style={styles.overlayContent}>
              <View style={styles.successCheckCircle}>
                <Ionicons name="checkmark" size={32} color={Colors.brandCharcoal} />
              </View>
              <Text style={styles.successTitle}>Logged!</Text>
              <Text style={styles.successAmount}>
                ${parsedAmount.toFixed(2)}{' '}
                {selectedCategory ? CATEGORY_MAP[selectedCategory]?.name : ''}
              </Text>
              {merchantName ? (
                <Text style={styles.successMerchant}>{merchantName}</Text>
              ) : null}
              <Text style={styles.successCard}>
                {cards.find((c) => c.card.id === selectedCardId)?.card.name ?? 'Card'}
              </Text>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 54 : 24,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
  },

  // Source badge
  badgeRow: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.brandGold,
    backgroundColor: 'rgba(197, 165, 90, 0.08)',
  },
  sourceBadgeText: {
    ...Typography.captionBold,
    color: Colors.brandGold,
  },

  // Glass cards
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.15)',
    ...Shadows.glass,
  },
  fieldLabel: {
    ...Typography.label,
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
  },

  // Amount
  amountDisplay: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.brandGold,
    letterSpacing: -0.5,
  },
  amountEditRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amountCurrency: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.brandGold,
  },
  amountInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: '700',
    color: Colors.brandGold,
    paddingVertical: 0,
    marginLeft: Spacing.xs,
  },

  // Merchant
  merchantDisplay: {
    ...Typography.subheading,
    color: Colors.textPrimary,
  },
  merchantPlaceholder: {
    color: Colors.textTertiary,
  },
  merchantInput: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    paddingVertical: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.brandGold,
  },

  // Category chips
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
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
  categoryChipText: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  categoryChipTextActive: {
    color: Colors.brandCharcoal,
  },

  // Card scroll
  cardScrollContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
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
  cardChipActive: {
    borderColor: Colors.brandGold,
    backgroundColor: 'rgba(197, 165, 90, 0.12)',
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
  cardChipPlaceholderText: {
    ...Typography.bodyBold,
    color: Colors.textTertiary,
    fontSize: 14,
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
  noCardsText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    paddingVertical: Spacing.md,
  },

  // Date
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  dateText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  // Bottom buttons
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.lg,
  },
  dismissButton: {
    flex: 1,
    height: 52,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  dismissButtonText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
  confirmButton: {
    flex: 2,
    height: 52,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.brandGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  confirmGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: Spacing.sm,
  },
  confirmButtonText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
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
  successMerchant: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  successCard: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
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
