import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Platform,
  Alert,
  Image,
  ImageBackground,
  AppState,
  AppStateStatus,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getCurrentLocation, isAccuracyAcceptable } from '../../lib/location';
import { detectTopMerchant } from '../../lib/merchant';
import { openWallet, showWalletFallback, isWalletAvailable } from '../../lib/wallet';
import { CATEGORIES, CATEGORY_MAP } from '../../constants/categories';
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
  Glass,
} from '../../constants/theme';
import GlassCard from '../../components/GlassCard';
import MerchantCard from '../../components/MerchantCard';
import CapProgressBar from '../../components/CapProgressBar';
import { track } from '../../lib/analytics';
import { getCardImage } from '../../constants/cardImages';
import type { RecommendResult } from '../../lib/supabase-types';
import type { LocationResult, LocationError } from '../../lib/location';
import type { MerchantResult, MerchantError } from '../../lib/merchant';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PayState =
  | 'detecting'     // Finding user's GPS location
  | 'identifying'   // Calling Google Places to identify merchant
  | 'confirming'    // Showing merchant + category for user confirmation
  | 'recommending'  // Fetching best card recommendation via RPC
  | 'result'        // Showing card recommendation
  | 'wallet'        // User went to wallet; waiting for return
  | 'logging'       // Transaction logging prompt
  | 'success';      // Transaction logged successfully

interface SuccessData {
  amount: number;
  cardName: string;
  bankName: string;
  earnRate: number;
  baseRate: number;
  remainingCap: number | null;
  capAmount: number | null;
  categoryName: string;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function PayScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ source?: string }>();

  // State machine
  const [state, setState] = useState<PayState>('detecting');
  const [error, setError] = useState<string | null>(null);

  // Location
  const [location, setLocation] = useState<LocationResult | null>(null);

  // Merchant
  const [merchant, setMerchant] = useState<MerchantResult | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Recommendation
  const [recommendation, setRecommendation] = useState<RecommendResult | null>(null);
  const [alternatives, setAlternatives] = useState<RecommendResult[]>([]);

  // Wallet
  const [walletAvailable, setWalletAvailable] = useState(false);
  const walletOpenTime = useRef<number>(0);

  // Transaction logging
  const [amountStr, setAmountStr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  // Card images (card_id → ImageSource)
  const [cardImages, setCardImages] = useState<Record<string, ImageSourcePropType | { uri: string }>>({});

  // Category override
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Mount timestamp for flow duration tracking
  const mountTime = useRef(Date.now());

  // -------------------------------------------------------------------------
  // Track flow start
  // -------------------------------------------------------------------------
  useEffect(() => {
    track('pay_flow_started', {
      source: params.source ?? 'direct',
    }, user?.id);
  }, []);

  // -------------------------------------------------------------------------
  // Check wallet availability on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    isWalletAvailable().then(setWalletAvailable);
  }, []);

  // -------------------------------------------------------------------------
  // State 1: Detect location
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (state !== 'detecting') return;

    let cancelled = false;
    const detect = async () => {
      try {
        const loc = await getCurrentLocation();
        if (cancelled) return;

        setLocation(loc);
        track('location_detected', {
          accuracy: loc.accuracy ?? -1,
          duration_ms: Date.now() - mountTime.current,
          cached: loc.cached,
        }, user?.id);

        if (!isAccuracyAcceptable(loc.accuracy)) {
          setError('GPS accuracy is too low. You may be indoors.');
          return;
        }

        setState('identifying');
      } catch (err: unknown) {
        if (cancelled) return;
        const locErr = err as LocationError;
        setError(locErr.message);
        track('pay_flow_error', {
          state: 'detecting',
          error_type: locErr.type,
          message: locErr.message,
        }, user?.id);
      }
    };

    detect();
    return () => { cancelled = true; };
  }, [state]);

  // -------------------------------------------------------------------------
  // State 2: Identify merchant
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (state !== 'identifying' || !location) return;

    let cancelled = false;
    const identify = async () => {
      try {
        const result = await detectTopMerchant(
          location.latitude,
          location.longitude,
          location.accuracy && location.accuracy > 30 ? 100 : 50,
        );
        if (cancelled) return;

        setMerchant(result);
        setSelectedCategoryId(result.category);
        track('merchant_detected', {
          name: result.name,
          category: result.category,
          confidence: result.confidence,
          place_id: result.placeId,
        }, user?.id);

        setState('confirming');

        // Auto-fetch recommendation
        try {
          const { data: recData, error: rpcError } = await supabase.rpc('recommend', {
            p_category_id: result.category,
          });

          if (!rpcError && recData && (recData as RecommendResult[]).length > 0) {
            const results = recData as RecommendResult[];
            const topPick = results.find((r) => r.is_recommended) ?? results[0];
            setRecommendation(topPick);
            setAlternatives(results.filter((r) => r.card_id !== topPick.card_id));

            track('recommendation_used', {
              category: result.category,
              results_count: results.length,
              top_card: topPick.card_name,
              via: 'smart_pay',
            }, user?.id);
          }
        } catch {
          // Non-blocking: recommendation will just not show
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const merchErr = err as MerchantError;
        // No merchant found: fall back to manual category
        setError(merchErr.message);
        track('pay_flow_error', {
          state: 'identifying',
          error_type: merchErr.type,
          message: merchErr.message,
        }, user?.id);
      }
    };

    identify();
    return () => { cancelled = true; };
  }, [state, location]);

  // -------------------------------------------------------------------------
  // Fetch card images when recommendations change
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!recommendation) return;

    const cardIds = [recommendation.card_id, ...alternatives.map((a) => a.card_id)];

    const fetchCardImages = async () => {
      const { data } = await supabase
        .from('cards')
        .select('id, slug, image_url')
        .in('id', cardIds);

      if (!data) return;

      const imageMap: Record<string, ImageSourcePropType | { uri: string }> = {};
      for (const card of data as { id: string; slug: string; image_url: string | null }[]) {
        const localImage = card.slug ? getCardImage(card.slug) : undefined;
        if (card.image_url) {
          imageMap[card.id] = { uri: card.image_url };
        } else if (localImage) {
          imageMap[card.id] = localImage;
        }
      }
      setCardImages(imageMap);
    };

    fetchCardImages();
  }, [recommendation, alternatives]);

  // -------------------------------------------------------------------------
  // State 3→4: Confirm & Recommend
  // -------------------------------------------------------------------------
  const handleConfirmMerchant = useCallback(async () => {
    if (!selectedCategoryId) return;

    track('merchant_confirmed', {
      category: selectedCategoryId,
      changed: selectedCategoryId !== merchant?.category,
      original_category: merchant?.category ?? 'unknown',
    }, user?.id);

    setState('recommending');

    try {
      const { data, error: rpcError } = await supabase.rpc('recommend', {
        p_category_id: selectedCategoryId,
      });

      if (rpcError || !data || (data as RecommendResult[]).length === 0) {
        setError('No card recommendations available. Please add cards first.');
        track('pay_flow_error', {
          state: 'recommending',
          error_type: 'no_results',
          message: rpcError?.message ?? 'No results',
        }, user?.id);
        return;
      }

      const results = data as RecommendResult[];
      const topPick = results.find((r) => r.is_recommended) ?? results[0];
      setRecommendation(topPick);
      setAlternatives(results.filter((r) => r.card_id !== topPick.card_id));

      // Track MARU
      track('recommendation_used', {
        category: selectedCategoryId,
        results_count: results.length,
        top_card: topPick.card_name,
        via: 'smart_pay',
      }, user?.id);

      setState('result');
    } catch {
      setError('Failed to get recommendations. Please try again.');
    }
  }, [selectedCategoryId, merchant, user]);

  // -------------------------------------------------------------------------
  // State 5: Open Wallet
  // -------------------------------------------------------------------------
  const handleOpenWallet = useCallback(async () => {
    walletOpenTime.current = Date.now();
    setState('wallet');

    const result = await openWallet();
    track('wallet_opened', {
      platform: result.platform,
      success: result.success,
    }, user?.id);

    if (!result.success) {
      showWalletFallback(recommendation?.card_name);
    }
  }, [recommendation, user]);

  // -------------------------------------------------------------------------
  // State 5→6: Return from wallet (AppState listener)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (state !== 'wallet') return;

    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active' && walletOpenTime.current > 0) {
        const elapsed = Date.now() - walletOpenTime.current;
        // Only treat as wallet return if within 60s
        if (elapsed < 60_000) {
          setState('logging');
        }
        walletOpenTime.current = 0;
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [state]);

  // -------------------------------------------------------------------------
  // State 6: Log transaction
  // -------------------------------------------------------------------------
  const handleKeyPress = useCallback((key: string) => {
    setAmountStr((prev) => {
      if (key === 'backspace') return prev.slice(0, -1);
      if (key === '.') {
        if (prev.includes('.')) return prev;
        if (prev === '') return '0.';
        return prev + '.';
      }
      const dotIndex = prev.indexOf('.');
      if (dotIndex !== -1 && prev.length - dotIndex > 2) return prev;
      const candidate = prev + key;
      const parsed = parseFloat(candidate);
      if (parsed > 99999.99) return prev;
      return candidate;
    });
  }, []);

  const parsedAmount = parseFloat(amountStr) || 0;

  const handleLogTransaction = useCallback(async () => {
    if (!user || !recommendation || !selectedCategoryId || parsedAmount <= 0) return;

    setSubmitting(true);
    const today = new Date().toISOString().slice(0, 10);

    const { error: insertError } = await supabase.from('transactions').insert({
      user_id: user.id,
      card_id: recommendation.card_id,
      category_id: selectedCategoryId,
      amount: parsedAmount,
      transaction_date: today,
      notes: null,
      merchant_name: merchant?.name ?? null,
      merchant_mcc: null,
    });

    if (insertError) {
      setSubmitting(false);
      Alert.alert('Error', 'Failed to log transaction. Please try again.');
      return;
    }

    // Compute remaining cap from transactions directly (trigger may not exist)
    const payNow = new Date();
    const currentMonth = payNow.toISOString().slice(0, 7);
    const monthStart = `${currentMonth}-01`;
    const nextMonthDate = new Date(payNow.getFullYear(), payNow.getMonth() + 1, 1);
    const nextMonthStr = nextMonthDate.toISOString().slice(0, 10);
    let remainingCap: number | null = null;
    let capAmount: number | null = null;

    const { data: capData } = await supabase
      .from('caps')
      .select('monthly_cap_amount, category_id')
      .eq('card_id', recommendation.card_id)
      .or(`category_id.eq.${selectedCategoryId},category_id.is.null`)
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
            .eq('card_id', recommendation.card_id)
            .eq('category_id', selectedCategoryId)
            .gte('transaction_date', monthStart)
            .lt('transaction_date', nextMonthStr)
        : await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', user.id)
            .eq('card_id', recommendation.card_id)
            .gte('transaction_date', monthStart)
            .lt('transaction_date', nextMonthStr);

      const totalSpent = (txnData ?? []).reduce(
        (sum, t) => sum + ((t as { amount: number }).amount ?? 0),
        0,
      );
      remainingCap = Math.max(capAmount - totalSpent, 0);
    }

    const categoryName = CATEGORY_MAP[selectedCategoryId]?.name ?? selectedCategoryId;

    track('pay_transaction_logged', {
      amount: parsedAmount,
      category: selectedCategoryId,
      card_id: recommendation.card_id,
      merchant_name: merchant?.name ?? 'unknown',
    }, user.id);

    setSubmitting(false);
    setSuccessData({
      amount: parsedAmount,
      cardName: recommendation.card_name,
      bankName: recommendation.bank,
      earnRate: recommendation.earn_rate_mpd,
      baseRate: recommendation.base_rate_mpd,
      remainingCap,
      capAmount,
      categoryName,
    });
    setShowSuccess(true);
    setState('success');
  }, [user, recommendation, selectedCategoryId, parsedAmount, merchant]);

  const handleSelectAlternative = useCallback((alt: RecommendResult) => {
    if (!recommendation) return;
    const prevTop = recommendation;
    setRecommendation(alt);
    setAlternatives((prev) =>
      prev.map((a) => (a.card_id === alt.card_id ? prevTop : a))
    );
  }, [recommendation]);

  const handleSkipLog = useCallback(() => {
    track('pay_flow_abandoned', {
      state: 'logging',
      duration_ms: Date.now() - mountTime.current,
    }, user?.id);
    router.back();
  }, [user, router]);

  // -------------------------------------------------------------------------
  // Category override
  // -------------------------------------------------------------------------
  const handleCategoryChange = useCallback(async (catId: string) => {
    setSelectedCategoryId(catId);
    setShowCategoryPicker(false);

    try {
      const { data, error: rpcError } = await supabase.rpc('recommend', {
        p_category_id: catId,
      });

      if (!rpcError && data && (data as RecommendResult[]).length > 0) {
        const results = data as RecommendResult[];
        const topPick = results.find((r) => r.is_recommended) ?? results[0];
        setRecommendation(topPick);
        setAlternatives(results.filter((r) => r.card_id !== topPick.card_id));

        track('recommendation_used', {
          category: catId,
          results_count: results.length,
          top_card: topPick.card_name,
          via: 'smart_pay_category_change',
        }, user?.id);
      } else {
        setRecommendation(null);
        setAlternatives([]);
      }
    } catch {
      setRecommendation(null);
      setAlternatives([]);
    }
  }, [user]);

  // -------------------------------------------------------------------------
  // Retry / Fallback
  // -------------------------------------------------------------------------
  const handleRetry = useCallback(() => {
    setError(null);
    setLocation(null);
    setMerchant(null);
    setState('detecting');
  }, []);

  const handleChooseManually = useCallback(() => {
    track('pay_flow_abandoned', {
      state,
      duration_ms: Date.now() - mountTime.current,
    }, user?.id);
    router.replace('/(tabs)');
  }, [state, user, router]);

  // -------------------------------------------------------------------------
  // Done handler
  // -------------------------------------------------------------------------
  const handleDone = useCallback(() => {
    setShowSuccess(false);
    router.back();
  }, [router]);

  // -------------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------------

  const categoryName = selectedCategoryId
    ? CATEGORY_MAP[selectedCategoryId]?.name ?? selectedCategoryId
    : '';

  // Top card cap info
  const hasTopCap = recommendation?.monthly_cap_amount != null &&
    recommendation.monthly_cap_amount > 0;
  const topCapRemaining = recommendation?.remaining_cap ?? 0;
  const topCapTotal = recommendation?.monthly_cap_amount ?? 0;
  const topCapSpent = hasTopCap ? topCapTotal - topCapRemaining : 0;

  const displayAmount = amountStr === '' ? '0.00' : amountStr;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Smart Pay',
          headerBackTitle: 'Back',
          headerTintColor: Colors.brandGold,
          headerStyle: { backgroundColor: Colors.background },
          headerTitleStyle: { fontWeight: '600', color: Colors.textPrimary },
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
            {/* ============================================================= */}
            {/* Error State */}
            {/* ============================================================= */}
            {error ? (
              <View style={styles.centeredSection}>
                <View style={styles.errorIcon}>
                  <Ionicons name="location-outline" size={48} color={Colors.textSecondary} />
                </View>
                <Text style={styles.errorTitle}>
                  {state === 'detecting' ? 'Could not detect location' : 'No merchant found'}
                </Text>
                <Text style={styles.errorMessage}>{error}</Text>
                <View style={styles.errorButtons}>
                  <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.manualButton} onPress={handleChooseManually}>
                    <Text style={styles.manualButtonText}>Choose Manually</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {/* ============================================================= */}
            {/* State 1: Detecting Location */}
            {/* ============================================================= */}
            {!error && state === 'detecting' ? (
              <View style={styles.centeredSection}>
                <ActivityIndicator size="large" color={Colors.brandGold} />
                <Text style={styles.progressTitle}>Finding your location...</Text>
                <Text style={styles.progressSubtitle}>
                  This may take a few seconds
                </Text>
              </View>
            ) : null}

            {/* ============================================================= */}
            {/* State 2: Identifying Merchant */}
            {/* ============================================================= */}
            {!error && state === 'identifying' ? (
              <View style={styles.centeredSection}>
                <ActivityIndicator size="large" color={Colors.brandGold} />
                <Text style={styles.progressTitle}>Identifying merchant...</Text>
                <Text style={styles.progressSubtitle}>
                  Searching for nearby businesses
                </Text>
              </View>
            ) : null}

            {/* ============================================================= */}
            {/* State 3: Confirming Merchant & Category */}
            {/* ============================================================= */}
            {!error && (state === 'confirming' || state === 'result') && merchant ? (
              <View>
                <Text style={styles.overlineLabel}>DETECTED MERCHANT</Text>
                <MerchantCard
                  merchantName={merchant.name}
                  category={CATEGORY_MAP[selectedCategoryId ?? 'general']?.name ?? 'General'}
                  categoryId={selectedCategoryId ?? 'general'}
                  confidence={merchant.confidence}
                  address={merchant.address}
                  onChangeCategory={() => setShowCategoryPicker(true)}
                />

                {/* Inline recommendation */}
                {recommendation ? (
                  <>
                    <Text style={styles.overlineLabel}>USE THIS CARD</Text>
                    <GlassCard>
                      <View style={styles.topCardRow}>
                        {cardImages[recommendation.card_id] ? (
                          <Image
                            source={cardImages[recommendation.card_id]}
                            style={styles.topCardImage}
                            resizeMode="contain"
                          />
                        ) : (
                          <View style={styles.topCardImagePlaceholder}>
                            <Text style={styles.topCardPlaceholderText}>
                              {recommendation.bank.charAt(0)}
                            </Text>
                          </View>
                        )}
                        <View style={styles.topCardDetails}>
                          <Text style={styles.topCardName}>{recommendation.card_name}</Text>
                          <Text style={styles.topCardRate}>
                            {recommendation.earn_rate_mpd.toFixed(1)} mpd
                          </Text>
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
                          {recommendation.conditions_note ? (
                            <Text style={styles.conditionsNote}>
                              {recommendation.conditions_note}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </GlassCard>

                    {/* Smart Pay + Log actions */}
                    <TouchableOpacity
                      style={styles.walletButton}
                      onPress={handleOpenWallet}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="flash" size={20} color={Colors.brandCharcoal} />
                      <Text style={styles.walletButtonText}>Smart Pay</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.skipWalletButton}
                      onPress={() => setState('logging')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.skipWalletText}>Log Transaction</Text>
                    </TouchableOpacity>

                    {/* Alternatives */}
                    {alternatives.length > 0 ? (
                      <>
                        <Text style={styles.overlineLabel}>ALTERNATIVES</Text>
                        {alternatives.map((alt) => (
                          <TouchableOpacity
                            key={alt.card_id}
                            style={styles.altRow}
                            onPress={() => handleSelectAlternative(alt)}
                            activeOpacity={0.7}
                          >
                            {cardImages[alt.card_id] ? (
                              <Image
                                source={cardImages[alt.card_id]}
                                style={styles.altCardImage}
                                resizeMode="contain"
                              />
                            ) : (
                              <View style={styles.altCardImagePlaceholder}>
                                <Text style={styles.altPlaceholderText}>
                                  {alt.bank.charAt(0)}
                                </Text>
                              </View>
                            )}
                            <View style={styles.altInfo}>
                              <Text style={styles.altCardName}>{alt.card_name}</Text>
                            </View>
                            <Text style={styles.altRate}>
                              {alt.earn_rate_mpd.toFixed(1)} mpd
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </>
                    ) : null}
                  </>
                ) : (
                  <View style={styles.loadingRecommendation}>
                    <ActivityIndicator size="small" color={Colors.brandGold} />
                    <Text style={styles.loadingRecText}>Finding your best card...</Text>
                  </View>
                )}
              </View>
            ) : null}


            {/* ============================================================= */}
            {/* State 6: Waiting for return from Wallet */}
            {/* ============================================================= */}
            {!error && state === 'wallet' ? (
              <View style={styles.centeredSection}>
                <Ionicons name="wallet" size={48} color={Colors.brandGold} />
                <Text style={styles.progressTitle}>Switching to Wallet...</Text>
                <Text style={styles.progressSubtitle}>
                  Come back after setting your card
                </Text>
                <TouchableOpacity
                  style={[styles.retryButton, { marginTop: Spacing.xl }]}
                  onPress={() => setState('logging')}
                >
                  <Text style={styles.retryButtonText}>I'm Back — Log Transaction</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* ============================================================= */}
            {/* State 7: Log Transaction */}
            {/* ============================================================= */}
            {!error && state === 'logging' && recommendation ? (
              <View>
                <Text style={styles.logPromptTitle}>Log This Transaction?</Text>
                <Text style={styles.logPromptSubtitle}>
                  {recommendation.bank} {recommendation.card_name} — {categoryName}
                </Text>

                {/* Amount display */}
                <Text style={styles.sectionLabel}>AMOUNT</Text>
                <View style={styles.amountDisplay}>
                  <Text style={styles.amountText}>${displayAmount}</Text>
                </View>

                {/* Keypad */}
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
                          style={styles.keypadKey}
                          onPress={() => handleKeyPress(key)}
                          activeOpacity={0.6}
                        >
                          {key === 'backspace' ? (
                            <Ionicons
                              name="backspace-outline"
                              size={24}
                              color={Colors.textSecondary}
                            />
                          ) : (
                            <Text style={styles.keypadKeyText}>{key}</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </View>

                {/* Confirm & Skip */}
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    parsedAmount <= 0 && styles.confirmButtonDisabled,
                  ]}
                  onPress={handleLogTransaction}
                  activeOpacity={0.8}
                  disabled={parsedAmount <= 0 || submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={Colors.brandCharcoal} />
                  ) : (
                    <Text style={styles.confirmButtonText}>Log Transaction</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkipLog}
                  activeOpacity={0.7}
                >
                  <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </ScrollView>

          {/* =============================================================== */}
          {/* Category Picker Modal */}
          {/* =============================================================== */}
          <Modal
            visible={showCategoryPicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowCategoryPicker(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Choose Category</Text>
                <View style={styles.chipWrap}>
                  {CATEGORIES.map((cat) => {
                    const isActive = selectedCategoryId === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                        onPress={() => handleCategoryChange(cat.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={
                            (isActive ? cat.iconFilled : cat.icon) as keyof typeof Ionicons.glyphMap
                          }
                          size={16}
                          color={isActive ? Colors.brandGold : Colors.brandCharcoal}
                        />
                        <Text
                          style={[
                            styles.categoryChipText,
                            isActive && styles.categoryChipTextActive,
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() => setShowCategoryPicker(false)}
                >
                  <Text style={styles.modalCloseText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* =============================================================== */}
          {/* Success Overlay */}
          {/* =============================================================== */}
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
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: Colors.glassBgDark },
                  ]}
                />
              )}
              <View style={styles.overlayContent}>
                <View style={styles.successCheckCircle}>
                  <Ionicons name="checkmark" size={32} color={Colors.brandCharcoal} />
                </View>
                <Text style={styles.successTitle}>Logged!</Text>

                {successData ? (
                  <>
                    <Text style={styles.successAmount}>
                      ${successData.amount.toFixed(2)} {successData.categoryName}
                    </Text>
                    <Text style={styles.successCard}>
                      {successData.cardName}
                    </Text>
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
                    {successData.remainingCap !== null &&
                    successData.capAmount !== null ? (
                      <Text style={styles.capRemaining}>
                        ${Math.max(0, successData.remainingCap).toLocaleString()}{' '}
                        remaining on {successData.cardName}{' '}
                        {successData.categoryName} cap
                      </Text>
                    ) : null}
                  </>
                ) : null}

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

  // Centered sections (loading, error)
  centeredSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl * 2,
  },
  progressTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  progressSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },

  // Error state
  errorIcon: {
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  errorButtons: {
    gap: Spacing.md,
    width: '100%',
    paddingHorizontal: Spacing.xl,
  },
  retryButton: {
    backgroundColor: Colors.brandGold,
    borderRadius: BorderRadius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
  },
  manualButton: {
    borderRadius: BorderRadius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.brandGold,
  },
  manualButtonText: {
    ...Typography.bodyBold,
    color: Colors.brandGold,
  },

  // Overline labels
  overlineLabel: {
    ...Typography.captionBold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },

  // Confirm button
  confirmButton: {
    backgroundColor: Colors.brandGold,
    borderRadius: 20,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  confirmButtonText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
  },

  // Loading recommendation inline
  loadingRecommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  loadingRecText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  // Merchant context
  merchantContext: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  merchantContextText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },

  // Top card
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
  topCardName: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    color: Colors.textPrimary,
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
  conditionsNote: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },

  // Wallet button
  walletButton: {
    backgroundColor: Colors.brandGold,
    borderRadius: 20,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  walletButtonText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
  },
  walletHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  skipWalletButton: {
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  skipWalletText: {
    ...Typography.captionBold,
    color: Colors.textLink,
  },

  // Alternatives
  altRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.15)',
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
  altRate: {
    ...Typography.body,
    color: Colors.brandGold,
    fontWeight: '600',
  },

  // Log transaction
  logPromptTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  logPromptSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    marginTop: Spacing.lg,
  },
  amountDisplay: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  amountText: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    color: Colors.textPrimary,
  },

  // Keypad
  keypad: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  keypadKey: {
    flex: 1,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadKeyText: {
    ...Typography.subheading,
    color: Colors.textPrimary,
  },

  // Skip
  skipButton: {
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  skipButtonText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },

  // Category picker modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  modalTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
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
    borderWidth: 1.5,
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
  modalClose: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  modalCloseText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
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
    borderColor: 'rgba(197, 165, 90, 0.15)',
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
