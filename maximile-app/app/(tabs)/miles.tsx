import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import MilesHeroSection from '../../components/MilesHeroSection';
import MilesProgramCard from '../../components/MilesProgramCard';
import SegmentedControl from '../../components/SegmentedControl';
import AirlineProgramCard, { PotentialSource } from '../../components/AirlineProgramCard';
import BankPointsCard, { TransferOption } from '../../components/BankPointsCard';
import TransferNudgeCard from '../../components/TransferNudgeCard';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import BottomSheet from '../../components/BottomSheet';
import { showNetworkErrorAlert } from '../../lib/error-handler';
import { track } from '../../lib/analytics';
import { useDemoNotification } from '../../contexts/DemoNotificationContext';
import { DEMO_NOTIFICATIONS } from '../../lib/demo-notifications';

// ---------------------------------------------------------------------------
// Session-based flag for demo notification (resets on app restart)
// ---------------------------------------------------------------------------
let demoNotificationShownThisSession = false;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MilesProgram {
  program_id: string;
  program_name: string;
  airline: string | null;
  program_type: string | null;
  icon_url: string | null;
  manual_balance: number;
  auto_earned: number;
  total_redeemed: number;
  display_total: number;
  last_updated: string | null;
  contributing_cards: Array<{ card_id: string; name: string; bank: string }>;
}

interface EarningInsights {
  total_miles_earned: number;
  miles_saved: number;
  transaction_count: number;
  trend_months: Array<{ label: string; miles: number }>;
  top_card_name?: string;
}

interface PotentialMilesRow {
  source_program_id: string;
  source_program_name: string;
  source_balance: number;
  conversion_rate_from: number;
  conversion_rate_to: number;
  transfer_fee_sgd: number | null;
  potential_miles: number;
  total_potential: number;
}

interface TransferOptionRaw {
  transfer_id: string;
  destination_id: string;
  destination_name: string;
  destination_airline: string;
  destination_icon: string;
  conversion_rate_from: number;
  conversion_rate_to: number;
  points_per_mile: number;
  transfer_fee_sgd: number | null;
  min_transfer_amount: number | null;
  last_verified_at: string;
}

interface NudgeSuggestion {
  bankName: string;
  bankBalance: number;
  bankProgramId: string;
  airlineName: string;
  potentialMiles: number;
}

interface AvailableProgram {
  id: string;
  name: string;
  airline: string | null;
  program_type: string;
}

// ---------------------------------------------------------------------------
// Segment indices
// ---------------------------------------------------------------------------
const SEGMENTS = ['My Miles', 'My Points'];
const MY_MILES = 0;
const MY_POINTS = 1;

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function MilesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { showDemoNotification } = useDemoNotification();

  const [activeSegment, setActiveSegment] = useState(MY_MILES);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasCards, setHasCards] = useState<boolean | null>(null);

  // Layer 1 data
  const [airlinePrograms, setAirlinePrograms] = useState<MilesProgram[]>([]);
  const [potentialByAirline, setPotentialByAirline] = useState<
    Record<string, PotentialMilesRow[]>
  >({});

  // Layer 2 data
  const [bankPrograms, setBankPrograms] = useState<MilesProgram[]>([]);
  const [transfersByBank, setTransfersByBank] = useState<
    Record<string, TransferOptionRaw[]>
  >({});

  // Shared
  const [insightsData, setInsightsData] = useState<EarningInsights | null>(null);
  const [nudge, setNudge] = useState<NudgeSuggestion | null>(null);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  // Track card positions for "View Options" scroll
  const bankCardOffsets = useRef<Record<string, number>>({});

  // Add Program feature state
  const [addProgramSheetVisible, setAddProgramSheetVisible] = useState(false);
  const [availablePrograms, setAvailablePrograms] = useState<AvailableProgram[]>([]);
  const [selectedNewProgram, setSelectedNewProgram] = useState<AvailableProgram | null>(null);
  const [newProgramBalance, setNewProgramBalance] = useState('');
  const [savingNewProgram, setSavingNewProgram] = useState(false);

  // -------------------------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------------------------
  const fetchMilesPortfolio = useCallback(async () => {
    if (!user) return;

    try {
      // Check card count
      const { count: cardCount } = await supabase
        .from('user_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const userHasCards = (cardCount ?? 0) > 0;
      setHasCards(userHasCards);

      if (!userHasCards) {
        setAirlinePrograms([]);
        setBankPrograms([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Fetch all data in parallel
      const [airlineRes, bankRes, insightsRes] = await Promise.all([
        supabase.rpc('get_miles_portfolio', {
          p_user_id: user.id,
          p_program_type: 'airline',
        }),
        supabase.rpc('get_miles_portfolio', {
          p_user_id: user.id,
          p_program_type: 'bank_points',
        }),
        supabase.rpc('get_monthly_earning_insights', { p_user_id: user.id }),
      ]);

      if (airlineRes.error || bankRes.error) {
        if (__DEV__) {
          console.error('Miles portfolio RPC error:', airlineRes.error || bankRes.error);
        }
        showNetworkErrorAlert(() => fetchMilesPortfolio());
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const airlines = (airlineRes.data ?? []) as MilesProgram[];
      const banks = (bankRes.data ?? []) as MilesProgram[];

      setAirlinePrograms(airlines);
      setBankPrograms(banks);

      // Fetch potential miles for each airline program
      const potentialResults: Record<string, PotentialMilesRow[]> = {};
      await Promise.all(
        airlines.map(async (ap) => {
          const { data } = await supabase.rpc('get_potential_miles', {
            p_user_id: user.id,
            p_destination_program_id: ap.program_id,
          });
          if (data && data.length > 0) {
            potentialResults[ap.program_id] = data as PotentialMilesRow[];
          }
        })
      );
      setPotentialByAirline(potentialResults);

      // Also include airline programs the user doesn't directly earn
      // but CAN reach via bank point transfers (potential > 0, no direct card)
      // These are already included if get_miles_portfolio returns them via
      // the card→program mapping. For airlines only reachable via transfer,
      // we'd need a separate query. For v1, we rely on the airline programs
      // the user has cards mapped to (direct earn cards like KrisFlyer co-brands).

      // Fetch transfer options for each bank program
      const transferResults: Record<string, TransferOptionRaw[]> = {};
      await Promise.all(
        banks.map(async (bp) => {
          const { data } = await supabase.rpc('get_transfer_options', {
            p_program_id: bp.program_id,
          });
          if (data) {
            // Calculate resulting miles based on user's balance
            const options = (data as TransferOptionRaw[]).map((opt) => ({
              ...opt,
              resulting_miles: Math.floor(
                (bp.display_total * opt.conversion_rate_to) / opt.conversion_rate_from
              ),
            }));
            transferResults[bp.program_id] = options;
          }
        })
      );
      setTransfersByBank(transferResults);

      // Build nudge suggestion: pick bank with highest balance
      if (banks.length > 0) {
        const topBank = banks.reduce((a, b) =>
          b.display_total > a.display_total ? b : a
        );
        if (topBank.display_total > 0) {
          const bankTransfers = transferResults[topBank.program_id] || [];
          if (bankTransfers.length > 0) {
            // Pick the airline with highest resulting miles
            const bestTransfer = bankTransfers.reduce((a, b) =>
              (b as any).resulting_miles > (a as any).resulting_miles ? b : a
            );
            setNudge({
              bankName: topBank.program_name,
              bankBalance: topBank.display_total,
              bankProgramId: topBank.program_id,
              airlineName: bestTransfer.destination_name,
              potentialMiles: (bestTransfer as any).resulting_miles || 0,
            });
          }
        }
      }

      // Insights
      if (!insightsRes.error && insightsRes.data && insightsRes.data.length > 0) {
        setInsightsData(insightsRes.data[0] as EarningInsights);
      }

      await track('screen_view', { screen: 'miles_portfolio' }, user.id);
    } catch (err) {
      if (__DEV__) console.error('Miles portfolio fetch error:', err);
      showNetworkErrorAlert(() => fetchMilesPortfolio());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchMilesPortfolio();
    }, [fetchMilesPortfolio])
  );

  // -------------------------------------------------------------------------
  // Demo Mode: Auto-trigger notification on first visit per session
  // -------------------------------------------------------------------------
  useEffect(() => {
    function checkAndShowDemoNotif() {
      const isDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
      if (!isDemoMode) return;

      // Only show once per app session (resets when app is closed/reopened)
      if (!demoNotificationShownThisSession) {
        // Show notification 1 second after Miles tab loads
        setTimeout(() => {
          showDemoNotification({
            type: DEMO_NOTIFICATIONS.rateChange.critical.type,
            title: DEMO_NOTIFICATIONS.rateChange.critical.title,
            body: DEMO_NOTIFICATIONS.rateChange.critical.body,
          });

          // Mark as shown for this session
          demoNotificationShownThisSession = true;
        }, 1000);
      }
    }

    checkAndShowDemoNotif();
  }, [showDemoNotification]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMilesPortfolio();
  };

  const handleSegmentChange = (index: number) => {
    setActiveSegment(index);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleProgramPress = (programId: string) => {
    router.push(`/miles/${programId}`);
  };

  // -------------------------------------------------------------------------
  // Add Program handlers
  // -------------------------------------------------------------------------
  const handleOpenAddProgramSheet = async () => {
    if (!user) return;

    try {
      // Determine program type based on active segment
      const programType = activeSegment === MY_MILES ? 'airline' : 'bank_points';

      // Fetch all programs of this type
      const { data: allPrograms, error: programsError } = await supabase
        .from('miles_programs')
        .select('id, name, airline, program_type')
        .eq('program_type', programType === 'bank_points' ? 'bank_points' : 'airline')
        .order('name');

      if (programsError) {
        if (__DEV__) console.error('Fetch programs error:', programsError);
        Alert.alert('Error', 'Failed to load programs. Please try again.');
        return;
      }

      // Get IDs of programs already in portfolio
      const existingIds = activeSegment === MY_MILES
        ? airlinePrograms.map((p) => p.program_id)
        : bankPrograms.map((p) => p.program_id);

      // Filter out programs already tracked
      const available = (allPrograms ?? [])
        .filter((p) => !existingIds.includes(p.id))
        .map((p) => ({
          id: p.id,
          name: p.name,
          airline: p.airline,
          program_type: p.program_type,
        }));

      setAvailablePrograms(available);
      setAddProgramSheetVisible(true);

      await track('add_program_sheet_opened', { program_type: programType }, user.id);
    } catch (err) {
      if (__DEV__) console.error('Open add program sheet error:', err);
      Alert.alert('Error', 'Failed to load programs. Please try again.');
    }
  };

  const handleDismissAddProgramSheet = () => {
    setAddProgramSheetVisible(false);
    setAvailablePrograms([]);
    setSelectedNewProgram(null);
    setNewProgramBalance('');
  };

  const handleSelectProgram = (program: AvailableProgram) => {
    setSelectedNewProgram(program);
    setNewProgramBalance('');
  };

  const handleSaveNewProgram = async () => {
    if (!user || !selectedNewProgram) return;

    const parsed = parseInt(newProgramBalance, 10);
    if (isNaN(parsed) || parsed < 0 || parsed > 10_000_000) {
      Alert.alert('Invalid Amount', 'Balance must be between 0 and 10,000,000.');
      return;
    }

    setSavingNewProgram(true);
    try {
      const { error } = await supabase.rpc('upsert_miles_balance', {
        p_user_id: user.id,
        p_program_id: selectedNewProgram.id,
        p_amount: parsed,
      });

      if (error) {
        if (__DEV__) console.error('Save new program error:', error);
        Alert.alert('Error', 'Failed to add program. Please try again.');
        setSavingNewProgram(false);
        return;
      }

      await track('program_added_manually', {
        program_id: selectedNewProgram.id,
        program_name: selectedNewProgram.name,
        initial_balance: parsed,
      }, user.id);

      handleDismissAddProgramSheet();
      setLoading(true);
      await fetchMilesPortfolio();
    } catch (err) {
      if (__DEV__) console.error('Save new program error:', err);
      Alert.alert('Error', 'Failed to add program. Please try again.');
    } finally {
      setSavingNewProgram(false);
    }
  };

  const parsedNewBalance = parseInt(newProgramBalance, 10);
  const isSaveNewProgramDisabled =
    savingNewProgram ||
    !selectedNewProgram ||
    newProgramBalance.trim() === '' ||
    isNaN(parsedNewBalance) ||
    parsedNewBalance < 0 ||
    parsedNewBalance > 10_000_000;

  // -------------------------------------------------------------------------
  // Derived data
  // -------------------------------------------------------------------------
  const totalAirlineMiles = airlinePrograms.reduce((sum, p) => {
    const potential = potentialByAirline[p.program_id]?.[0]?.total_potential ?? 0;
    return sum + p.display_total + potential;
  }, 0);

  const totalBankPoints = bankPrograms.reduce((sum, p) => sum + p.display_total, 0);

  const heroTotal = activeSegment === MY_MILES ? totalAirlineMiles : totalBankPoints;
  const heroCount =
    activeSegment === MY_MILES ? airlinePrograms.length : bankPrograms.length;
  const heroUnit = activeSegment === MY_MILES ? 'miles' : 'points';
  const heroType = activeSegment === MY_MILES ? 'airline' : 'bank';

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------
  if (loading) {
    return <LoadingSpinner message="Loading miles..." />;
  }

  // -------------------------------------------------------------------------
  // Empty state: no cards at all
  // -------------------------------------------------------------------------
  if (hasCards === false) {
    return (
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.background}
        imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <View style={styles.emptyContainer}>
            <Text style={styles.screenTitle}>Miles Portfolio</Text>
            <EmptyState
              icon="airplane-outline"
              title="Track your miles"
              description="Add your credit cards to see your miles balances across loyalty programs."
              ctaLabel="Add Cards"
              onCtaPress={() => router.push('/onboarding')}
            />
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  // -------------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------------
  return (
    <>
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.background}
        imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <ScrollView
            ref={scrollRef}
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
          {/* Header */}
          <Text style={styles.screenTitle}>Miles Portfolio</Text>
          <Text style={styles.screenSubtitle}>Your loyalty program balances</Text>

          {/* Segmented Control */}
          <SegmentedControl
            segments={SEGMENTS}
            activeIndex={activeSegment}
            onSegmentChange={handleSegmentChange}
          />

          {/* Hero */}
          <MilesHeroSection
            totalMiles={heroTotal}
            programCount={heroCount}
            monthlyEarned={insightsData?.total_miles_earned}
            milesSaved={activeSegment === MY_MILES ? insightsData?.miles_saved : undefined}
            topCardName={insightsData?.top_card_name}
            subtitleOverride={
              activeSegment === MY_MILES
                ? `total miles across ${heroCount} airline program${heroCount === 1 ? '' : 's'}`
                : `total points across ${heroCount} bank program${heroCount === 1 ? '' : 's'}`
            }
          />

          {/* Insights link */}
          {insightsData && activeSegment === MY_MILES && (
            <TouchableOpacity
              style={styles.insightsLink}
              onPress={() => router.push('/earning-insights')}
              activeOpacity={0.7}
            >
              <Ionicons name="analytics-outline" size={16} color={Colors.brandGold} />
              <Text style={styles.insightsLinkText}>View full earning insights</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.brandGold} />
            </TouchableOpacity>
          )}

          {/* =============================================================== */}
          {/* Layer 1: My Miles (Airline Programs) */}
          {/* =============================================================== */}
          {activeSegment === MY_MILES && (
            <>
              {airlinePrograms.length === 0 && (
                <View style={styles.inlineEmpty}>
                  <Ionicons
                    name="airplane-outline"
                    size={48}
                    color={Colors.textTertiary}
                  />
                  <Text style={styles.inlineEmptyTitle}>No airline programs yet</Text>
                  <Text style={styles.inlineEmptyDesc}>
                    Add cards to see which airlines your points can reach.
                  </Text>
                </View>
              )}

              {airlinePrograms.map((program) => {
                const potentialRows = potentialByAirline[program.program_id] || [];
                const totalPotential = potentialRows[0]?.total_potential ?? 0;

                return (
                  <AirlineProgramCard
                    key={program.program_id}
                    programName={program.program_name}
                    airline={program.airline ?? undefined}
                    confirmedMiles={program.display_total}
                    potentialMiles={totalPotential}
                    potentialBreakdown={potentialRows.map((r) => ({
                      source_program_name: r.source_program_name,
                      source_balance: r.source_balance,
                      conversion_rate_from: r.conversion_rate_from,
                      conversion_rate_to: r.conversion_rate_to,
                      potential_miles: r.potential_miles,
                    }))}
                    onPress={() => handleProgramPress(program.program_id)}
                  />
                );
              })}

              {/* Add Program Button */}
              <TouchableOpacity
                style={styles.addProgramButton}
                onPress={handleOpenAddProgramSheet}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Track new airline program"
              >
                <Ionicons name="add-circle-outline" size={20} color={Colors.brandGold} />
                <Text style={styles.addProgramButtonText}>Track New Airline Program</Text>
              </TouchableOpacity>
            </>
          )}

          {/* =============================================================== */}
          {/* Layer 2: My Points (Bank Programs) */}
          {/* =============================================================== */}
          {activeSegment === MY_POINTS && (
            <>
              {/* Transfer nudge */}
              {nudge && !nudgeDismissed && nudge.potentialMiles > 0 && (
                <TransferNudgeCard
                  bankName={nudge.bankName}
                  bankBalance={nudge.bankBalance}
                  airlineName={nudge.airlineName}
                  potentialMiles={nudge.potentialMiles}
                  onDismiss={() => setNudgeDismissed(true)}
                  onViewOptions={() => {
                    const offset = bankCardOffsets.current[nudge.bankProgramId];
                    if (offset != null && scrollRef.current) {
                      scrollRef.current.scrollTo({ y: offset, animated: true });
                    }
                  }}
                />
              )}

              {bankPrograms.length === 0 && (
                <View style={styles.inlineEmpty}>
                  <Ionicons
                    name="card-outline"
                    size={48}
                    color={Colors.textTertiary}
                  />
                  <Text style={styles.inlineEmptyTitle}>No bank points programs</Text>
                  <Text style={styles.inlineEmptyDesc}>
                    Add cards to see your bank reward point balances and transfer options.
                  </Text>
                </View>
              )}

              {bankPrograms.map((program) => {
                const options = (transfersByBank[program.program_id] || []).map(
                  (opt) => ({
                    transfer_id: opt.transfer_id,
                    destination_name: opt.destination_name,
                    destination_airline: opt.destination_airline,
                    conversion_rate_from: opt.conversion_rate_from,
                    conversion_rate_to: opt.conversion_rate_to,
                    resulting_miles: Math.floor(
                      (program.display_total * opt.conversion_rate_to) /
                        opt.conversion_rate_from
                    ),
                    transfer_fee_sgd: opt.transfer_fee_sgd,
                    transfer_url: null, // transfer_url not returned by RPC; can add later
                  })
                );

                return (
                  <View
                    key={program.program_id}
                    onLayout={(e) => {
                      bankCardOffsets.current[program.program_id] =
                        e.nativeEvent.layout.y;
                    }}
                  >
                    <BankPointsCard
                      programName={program.program_name}
                      balance={program.display_total}
                      transferOptions={options}
                      onHeaderPress={() => handleProgramPress(program.program_id)}
                    />
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>

    {/* Add Program Bottom Sheet */}
    <BottomSheet
      visible={addProgramSheetVisible}
      onDismiss={handleDismissAddProgramSheet}
      title={activeSegment === MY_MILES ? 'Track Airline Program' : 'Track Bank Program'}
    >
      {!selectedNewProgram ? (
        <>
          <Text style={styles.sheetDescription}>
            Select a program to track manually. You can add your current balance.
          </Text>

          {availablePrograms.length === 0 ? (
            <Text style={styles.noPrograms}>
              All {activeSegment === MY_MILES ? 'airline' : 'bank'} programs are already tracked.
            </Text>
          ) : (
            <ScrollView style={styles.programList} showsVerticalScrollIndicator={false}>
              {availablePrograms.map((program) => (
                <TouchableOpacity
                  key={program.id}
                  style={styles.programOption}
                  onPress={() => handleSelectProgram(program)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${program.name}`}
                >
                  <View style={styles.programOptionContent}>
                    <Ionicons
                      name={activeSegment === MY_MILES ? 'airplane-outline' : 'card-outline'}
                      size={20}
                      color={Colors.brandGold}
                    />
                    <Text style={styles.programOptionName}>{program.name}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      ) : (
        <>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedNewProgram(null)}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.brandGold} />
            <Text style={styles.backButtonText}>Change program</Text>
          </TouchableOpacity>

          <Text style={styles.selectedProgramName}>{selectedNewProgram.name}</Text>

          <Text style={styles.inputLabel}>CURRENT BALANCE</Text>
          <View style={styles.inputBorder}>
            <TextInput
              style={styles.numericInput}
              value={newProgramBalance}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, '');
                setNewProgramBalance(cleaned);
              }}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={Colors.textTertiary}
              autoFocus
              accessibilityLabel="Program balance"
            />
          </View>

          <Text style={styles.helperText}>
            Enter your current balance. You can update this anytime.
          </Text>

          <TouchableOpacity
            style={[styles.saveCta, isSaveNewProgramDisabled && styles.saveCtaDisabled]}
            activeOpacity={0.7}
            onPress={handleSaveNewProgram}
            disabled={isSaveNewProgramDisabled}
            accessibilityRole="button"
            accessibilityLabel="Save program"
          >
            {savingNewProgram ? (
              <ActivityIndicator size="small" color={Colors.brandCharcoal} />
            ) : (
              <Text
                style={[
                  styles.saveCtaText,
                  isSaveNewProgramDisabled && styles.saveCtaTextDisabled,
                ]}
              >
                Add Program
              </Text>
            )}
          </TouchableOpacity>
        </>
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
  insightsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  insightsLinkText: {
    ...Typography.caption,
    color: Colors.brandGold,
    fontWeight: '600',
  },
  inlineEmpty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  inlineEmptyTitle: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  inlineEmptyDesc: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },

  // Add Program Button
  addProgramButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.brandGold,
    borderRadius: BorderRadius.xl,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(197, 165, 90, 0.05)',
    marginTop: Spacing.md,
  },
  addProgramButtonText: {
    ...Typography.bodyBold,
    color: Colors.brandGold,
    fontSize: 15,
  },

  // Bottom Sheet Styles
  sheetDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  noPrograms: {
    ...Typography.body,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  programList: {
    maxHeight: 400,
  },
  programOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  programOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  programOptionName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  backButtonText: {
    ...Typography.body,
    color: Colors.brandGold,
  },
  selectedProgramName: {
    ...Typography.heading,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
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
  numericInput: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginBottom: Spacing.xl,
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
});
