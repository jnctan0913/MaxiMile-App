import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { CATEGORIES, CATEGORY_MAP } from '../../constants/categories';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import CapProgressBar from '../../components/CapProgressBar';
import { useAuth } from '../../contexts/AuthContext';
import { showNetworkErrorAlert, handleSupabaseError } from '../../lib/error-handler';
import { track } from '../../lib/analytics';
import type { Card, EarnRule, Cap, SpendingState, UserRateChangeResult } from '../../lib/supabase-types';
import EligibilityBadge from '../../components/EligibilityBadge';
import EligibilityTooltip from '../../components/EligibilityTooltip';
import RateUpdatedBadge from '../../components/RateUpdatedBadge';
import type { RateChangeDetail } from '../../components/RateUpdatedBadge';
import SubmissionFormSheet from '../../components/SubmissionFormSheet';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CategoryEarnInfo {
  categoryId: string;
  categoryName: string;
  emoji: string;
  icon: string;
  earnRate: number;
  isBonus: boolean;
  conditionsNote: string | null;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/**
 * Card detail screen -- Shows full details for a specific credit card.
 *
 * DRD Section 5 (Card Detail):
 * - Hero card section (card name, bank, network badge)
 * - Earn rates table: 7 categories with mpd values, BEST indicator
 * - Cap progress bars for categories with caps
 * - "Remove Card" button at bottom
 */
export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [card, setCard] = useState<Card | null>(null);
  const [earnRules, setEarnRules] = useState<EarnRule[]>([]);
  const [caps, setCaps] = useState<Cap[]>([]);
  const [spendingStates, setSpendingStates] = useState<SpendingState[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);
  const [rateChanges, setRateChanges] = useState<RateChangeDetail[]>([]);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);

  // -----------------------------------------------------------------------
  // Fetch card details, earn rules, caps, and spending state
  // Re-fetches on every screen focus so caps update after transactions
  // -----------------------------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      if (!id) return;

      const fetchCardDetails = async () => {
        try {
          // Fetch card, earn rules, and caps in parallel
          const [cardRes, rulesRes, capsRes] = await Promise.all([
            supabase.from('cards').select('*').eq('id', id).single(),
            supabase
              .from('earn_rules')
              .select('*')
              .eq('card_id', id)
              .is('effective_to', null)
              .order('category_id'),
            supabase.from('caps').select('*').eq('card_id', id),
          ]);

          if (cardRes.data) setCard(cardRes.data as Card);
          if (rulesRes.data) setEarnRules(rulesRes.data as EarnRule[]);
          if (capsRes.data) setCaps(capsRes.data as Cap[]);

          // Fetch spending state if user is authenticated
          if (user) {
            const { data: stateData } = await supabase
              .from('spending_state')
              .select('*')
              .eq('card_id', id)
              .eq('month', currentMonth);

            if (stateData) setSpendingStates(stateData as SpendingState[]);
          }

          const { data: changesData } = await supabase.rpc('get_card_rate_changes', {
            p_card_id: id,
          });
          if (changesData) {
            const changes: RateChangeDetail[] = (changesData as UserRateChangeResult[]).map((rc) => ({
              id: rc.rate_change_id,
              changeType: rc.change_type,
              category: rc.category,
              oldValue: rc.old_value,
              newValue: rc.new_value,
              effectiveDate: rc.effective_date,
              alertTitle: rc.alert_title,
              alertBody: rc.alert_body,
              severity: rc.severity as 'info' | 'warning' | 'critical',
            }));
            setRateChanges(changes);
          }

          setLoading(false);
        } catch {
          showNetworkErrorAlert();
          setLoading(false);
        }
      };

      fetchCardDetails();
    }, [id, user, currentMonth])
  );

  // -----------------------------------------------------------------------
  // Build the earn rates table for all 7 categories
  // -----------------------------------------------------------------------
  const buildEarnTable = (): CategoryEarnInfo[] => {
    if (!card) return [];

    return CATEGORIES.map((cat) => {
      const rule = earnRules.find((r) => r.category_id === cat.id);
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        emoji: cat.emoji,
        icon: cat.icon,
        earnRate: rule?.earn_rate_mpd ?? card.base_rate_mpd,
        isBonus: rule?.is_bonus ?? false,
        conditionsNote: rule?.conditions_note ?? null,
      };
    });
  };

  const earnTable = buildEarnTable();
  const maxEarnRate = earnTable.length > 0 ? Math.max(...earnTable.map((e) => e.earnRate)) : 0;

  // -----------------------------------------------------------------------
  // Remove card
  // -----------------------------------------------------------------------
  const handleRemoveCard = () => {
    if (!card) return;

    Alert.alert(
      'Remove Card?',
      `Remove ${card.name} from your portfolio? You'll lose tracking for its bonus caps.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemoving(true);
            const { error } = await supabase
              .from('user_cards')
              .delete()
              .eq('card_id', card.id);

            setRemoving(false);
            if (error) {
              const msg = handleSupabaseError(error);
              Alert.alert('Error', msg || 'Failed to remove card. Please try again.');
            } else {
              router.back();
            }
          },
        },
      ]
    );
  };

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  if (loading) {
    return <LoadingSpinner message="Loading card details..." />;
  }

  if (!card) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>Card not found.</Text>
      </SafeAreaView>
    );
  }

  const networkLabel = card.network.charAt(0).toUpperCase() + card.network.slice(1);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <>
      <Stack.Screen options={{ title: 'Card Detail', headerBackTitle: 'Back' }} />
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
          >
            {/* Hero card section */}
            <View style={styles.heroCard}>
              <Text style={styles.cardBank}>{card.bank}</Text>
              <Text style={styles.cardTitle}>{card.name}</Text>
              <Text style={styles.cardMeta}>
                {networkLabel} | Annual Fee: {card.annual_fee > 0 ? `$${card.annual_fee.toFixed(2)}` : 'No annual fee'}
              </Text>
              {card.eligibility_criteria && (
                <View style={{ marginTop: 8 }}>
                  <EligibilityBadge
                    eligibilityCriteria={card.eligibility_criteria}
                    size="md"
                    onPress={() => setTooltipVisible(!tooltipVisible)}
                  />
                  <EligibilityTooltip
                    eligibilityCriteria={card.eligibility_criteria}
                    visible={tooltipVisible}
                    onDismiss={() => setTooltipVisible(false)}
                  />
                </View>
              )}
              {rateChanges.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <RateUpdatedBadge changes={rateChanges} cardName={card.name} />
                </View>
              )}
              <TouchableOpacity
                style={styles.reportChangeLink}
                onPress={() => setShowSubmissionForm(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="flag-outline" size={14} color={Colors.brandGold} />
                <Text style={styles.reportChangeLinkText}>Report a Change</Text>
              </TouchableOpacity>
            </View>

            {/* Earn Rates section header */}
            <Text style={styles.sectionTitle}>Earn Rates</Text>

            {/* Earn rates table: 7 categories */}
            <View style={styles.earnTable}>
              {earnTable.map((entry, index) => {
                const isBest = entry.earnRate === maxEarnRate && entry.isBonus;
                const isAlternate = index % 2 === 1;

                return (
                  <View
                    key={entry.categoryId}
                    style={[
                      styles.earnRow,
                      isAlternate && styles.earnRowAlternate,
                    ]}
                  >
                    <Ionicons
                      name={entry.icon as keyof typeof Ionicons.glyphMap}
                      size={18}
                      color={Colors.brandCharcoal}
                      style={styles.earnIcon}
                    />
                    <Text style={styles.earnCatName}>{entry.categoryName}</Text>
                    <View style={styles.earnRateContainer}>
                      <Text style={[styles.earnRateValue, isBest && styles.earnRateBest]}>
                        {entry.earnRate.toFixed(1)} mpd
                      </Text>
                      {isBest && (
                        <View style={styles.bestBadge}>
                          <Text style={styles.bestBadgeText}>BEST</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Monthly Caps section */}
            {caps.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Monthly Caps</Text>
                {caps.map((cap) => {
                  const state = spendingStates.find(
                    (s) => s.category_id === cap.category_id
                  );
                  const catName = cap.category_id
                    ? CATEGORY_MAP[cap.category_id]?.name ?? cap.category_id
                    : 'All Categories';
                  const spent = state?.total_spent ?? 0;

                  return (
                    <View key={cap.id} style={styles.capSection}>
                      <CapProgressBar
                        label={catName}
                        spent={spent}
                        cap={cap.monthly_cap_amount}
                        showValues
                      />
                    </View>
                  );
                })}
              </>
            )}

            {/* Conditions section */}
            {earnRules.some((r) => r.conditions_note) && (
              <>
                <Text style={styles.sectionTitle}>Conditions</Text>
                {earnRules
                  .filter((r) => r.conditions_note)
                  .map((rule) => (
                    <Text key={rule.id} style={styles.conditionsText}>
                      {rule.conditions_note}
                    </Text>
                  ))}
              </>
            )}

            {/* Notes */}
            {card.notes && (
              <>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.notesText}>{card.notes}</Text>
              </>
            )}

            {/* Last updated */}
            <Text style={styles.lastUpdated}>
              Last updated: {new Date(card.updated_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>

            {/* Remove Card button */}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemoveCard}
              activeOpacity={0.7}
              disabled={removing}
            >
              <Text style={styles.removeButtonText}>
                {removing ? 'Removing...' : 'Remove Card'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>

      {/* Community submission form */}
      <SubmissionFormSheet
        visible={showSubmissionForm}
        onDismiss={() => setShowSubmissionForm(false)}
        cardId={id ?? ''}
        cardName={card.name}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  errorText: {
    ...Typography.body,
    color: Colors.danger,
    textAlign: 'center',
    marginTop: Spacing.xxxl,
  },

  // Hero card
  heroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    ...Shadows.glass,
  },
  cardBank: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  cardMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  // Report a change link
  reportChangeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  reportChangeLinkText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.brandGold,
  },

  // Earn rates table
  sectionTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  earnTable: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    ...Shadows.glass,
  },
  earnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  earnRowAlternate: {
    backgroundColor: 'rgba(248, 249, 250, 0.5)',
  },
  earnIcon: {
    marginRight: Spacing.sm,
    width: 24,
    textAlign: 'center',
  },
  earnCatName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  earnRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  earnRateValue: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  earnRateBest: {
    color: Colors.brandGold,
  },
  bestBadge: {
    backgroundColor: Colors.brandGold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  bestBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    color: Colors.brandCharcoal,
    textTransform: 'uppercase',
  },

  // Caps
  capSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    ...Shadows.glass,
  },

  // Conditions
  conditionsText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },

  // Notes
  notesText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // Last updated
  lastUpdated: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },

  // Remove Card button (outlined, danger)
  removeButton: {
    borderWidth: 1.5,
    borderColor: Colors.danger,
    borderRadius: BorderRadius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  removeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    color: Colors.danger,
  },
});
