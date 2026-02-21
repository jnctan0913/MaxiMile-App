import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';
import LoadingSpinner from '../components/LoadingSpinner';
import { showNetworkErrorAlert, handleSupabaseError } from '../lib/error-handler';
import { track } from '../lib/analytics';
import type { Card } from '../lib/supabase-types';
import EligibilityBadge from '../components/EligibilityBadge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BankSection {
  title: string;
  data: Card[];
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/**
 * Onboarding screen -- Add cards to the user's portfolio.
 *
 * DRD Section 4: Shows all 20 cards grouped by bank in a SectionList.
 * Each card row has bank name header, card name + Add/Added button.
 * Running count at top, Done button at bottom (disabled until >= 1 card).
 * Batch inserts selected cards to user_cards on Done.
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const isFromCards = from === 'cards';
  const { user, completeOnboarding } = useAuth();
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [existingCardIds, setExistingCardIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // -----------------------------------------------------------------------
  // Fetch all available cards + pre-select existing user cards
  // -----------------------------------------------------------------------
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .eq('is_active', true)
          .order('bank')
          .order('name');

        if (!error && data) {
          setAllCards(data as Card[]);
        }

        // Pre-select user's existing cards when coming from My Cards
        if (isFromCards && user) {
          const { data: userCards } = await supabase
            .from('user_cards')
            .select('card_id')
            .eq('user_id', user.id);

          if (userCards) {
            const ids = new Set(userCards.map((uc) => uc.card_id));
            setSelectedIds(ids);
            setExistingCardIds(ids);
          }
        }
      } catch {
        showNetworkErrorAlert();
      }
      setLoading(false);
    };

    fetchCards();
  }, [isFromCards, user]);

  // -----------------------------------------------------------------------
  // Group cards by bank for SectionList
  // -----------------------------------------------------------------------
  const sections: BankSection[] = useMemo(() => {
    const bankGroups = allCards.reduce<Record<string, Card[]>>((acc, card) => {
      if (!acc[card.bank]) acc[card.bank] = [];
      acc[card.bank].push(card);
      return acc;
    }, {});

    return Object.keys(bankGroups)
      .sort()
      .map((bank) => ({
        title: bank,
        data: bankGroups[bank],
      }));
  }, [allCards]);

  // -----------------------------------------------------------------------
  // Toggle card selection
  // -----------------------------------------------------------------------
  const toggleCard = (cardId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  // -----------------------------------------------------------------------
  // Batch insert selected cards and navigate to main app
  // -----------------------------------------------------------------------
  const handleDone = async () => {
    if (!user) return;

    if (selectedIds.size === 0) {
      Alert.alert('No cards selected', 'Please select at least one card to continue.');
      return;
    }

    setSubmitting(true);

    // Batch insert all selected cards into user_cards
    const inserts = Array.from(selectedIds).map((card_id) => ({
      user_id: user.id,
      card_id,
    }));

    const { error } = await supabase.from('user_cards').upsert(inserts, { onConflict: 'user_id,card_id', ignoreDuplicates: true });

    setSubmitting(false);

    if (error) {
      const msg = handleSupabaseError(error);
      Alert.alert('Error', msg || 'Failed to save your cards. Please try again.');
    } else {
      // Track each newly added card
      for (const cardId of selectedIds) {
        if (!existingCardIds.has(cardId)) {
          track('card_added', { card_id: cardId }, user.id);
        }
      }

      if (isFromCards) {
        // Adding more cards from My Cards tab — go back directly
        router.back();
      } else {
        // Fresh onboarding — proceed to Step 1.5 (auto-capture setup)
        track('onboarding_completed', { cards_count: selectedIds.size }, user.id);
        router.push({
          pathname: '/onboarding-auto-capture',
          params: { cardIds: JSON.stringify(Array.from(selectedIds)) },
        });
      }
    }
  };

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  if (loading) {
    return <LoadingSpinner message="Loading available cards..." />;
  }

  const selectedCount = selectedIds.size;
  const canProceed = selectedCount >= 1;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.background}
      imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          {isFromCards && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{isFromCards ? 'Add More Cards' : 'Add Your Cards'}</Text>
          <Text style={styles.subtitle}>
            {isFromCards
              ? 'Select additional miles cards to add to your portfolio.'
              : "Select the miles cards you carry. We'll find the best one for every purchase."}
          </Text>
        </View>

        {/* Running counter + Done link row */}
        <View style={styles.counterRow}>
          <Text style={styles.counter}>
            {selectedCount} card{selectedCount !== 1 ? 's' : ''} added
          </Text>
          {canProceed && (
            <TouchableOpacity onPress={handleDone} activeOpacity={0.7}>
              <Text style={styles.doneLink}>Done {'>'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Card list grouped by bank using SectionList */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={true}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.bankName}>{title}</Text>
            </View>
          )}
          renderItem={({ item: card }) => {
            const isSelected = selectedIds.has(card.id);
            return (
              <TouchableOpacity
                style={styles.cardRow}
                onPress={() => toggleCard(card.id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{card.name}</Text>
                  {card.eligibility_criteria && (
                    <EligibilityBadge
                      eligibilityCriteria={card.eligibility_criteria}
                      size="sm"
                    />
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    isSelected && styles.addedButton,
                  ]}
                  onPress={() => toggleCard(card.id)}
                  activeOpacity={0.7}
                >
                  {isSelected ? (
                    <View style={styles.addedContent}>
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.brandCharcoal}
                        style={styles.checkIcon}
                      />
                      <Text style={styles.addedButtonText}>Added</Text>
                    </View>
                  ) : (
                    <Text style={styles.addButtonText}>Add</Text>
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        {/* Fixed bottom Done CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.doneButton,
              !canProceed && styles.doneButtonDisabled,
            ]}
            onPress={handleDone}
            activeOpacity={0.8}
            disabled={!canProceed || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={Colors.brandCharcoal} />
            ) : (
              <Text style={[
                styles.doneButtonText,
                !canProceed && styles.doneButtonTextDisabled,
              ]}>
                Done ({selectedCount})
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backText: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginLeft: Spacing.xs,
  },
  title: {
    ...Typography.heading,
    fontSize: 26,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  counter: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    color: Colors.brandGold,
  },
  doneLink: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    color: Colors.brandGold,
  },
  listContent: {
    paddingBottom: Spacing.xxxl,
  },
  sectionHeader: {
    backgroundColor: 'rgba(248, 249, 250, 0.85)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  bankName: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    minHeight: 56,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  cardInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(197, 165, 90, 0.15)',
    marginLeft: Spacing.lg,
  },
  // Add button (outlined with gold)
  addButton: {
    width: 72,
    height: 36,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.brandGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    color: Colors.brandGold,
  },
  // Added button (filled gold)
  addedButton: {
    backgroundColor: Colors.brandGold,
    borderColor: Colors.brandGold,
  },
  addedContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 4,
  },
  addedButtonText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    color: Colors.brandCharcoal,
  },
  // Footer
  footer: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(197, 165, 90, 0.2)',
  },
  doneButton: {
    backgroundColor: Colors.brandGold,
    borderRadius: BorderRadius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  doneButtonText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
  },
  doneButtonTextDisabled: {
    color: Colors.textTertiary,
  },
});
