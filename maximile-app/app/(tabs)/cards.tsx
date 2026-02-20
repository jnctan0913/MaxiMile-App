import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import { CATEGORY_MAP } from '../../constants/categories';
import CardListItem from '../../components/CardListItem';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { showNetworkErrorAlert, handleSupabaseError } from '../../lib/error-handler';
import { track } from '../../lib/analytics';
import type { Card, EarnRule } from '../../lib/supabase-types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserCardWithDetails {
  card_id: string;
  added_at: string;
  cards: Card;
}

interface CardDisplay {
  card: Card;
  bestRate: number;
  bestCategory: string;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/**
 * My Cards screen -- View and manage the user's card portfolio.
 *
 * DRD Section 5: FlatList of user's cards with pull-to-refresh.
 * Each card shows: card name, bank, best earn rate + category badge.
 * Swipe-left to remove with confirmation dialog (loss framing).
 * "Add More Cards" button at bottom.
 * Tap card -> navigate to card/[id].
 */
export default function CardsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [cards, setCards] = useState<CardDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // -----------------------------------------------------------------------
  // Fetch user's cards with earn rules to find best rate per card
  // -----------------------------------------------------------------------
  const fetchCards = useCallback(async () => {
    if (!user) return;

    try {
    // Step 1: Get user's cards with card details
    const { data: userCardsData, error: ucError } = await supabase
      .from('user_cards')
      .select('card_id, added_at, cards(*)')
      .order('added_at', { ascending: false });

    if (ucError || !userCardsData) {
      if (__DEV__) console.error('user_cards fetch error:', ucError);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const typedData = userCardsData as unknown as UserCardWithDetails[];
    const cardIds = typedData.map((uc) => uc.cards.id);

    // Step 2: Get earn rules for all user's cards to find best rate
    let earnRules: EarnRule[] = [];
    if (cardIds.length > 0) {
      const { data: rulesData } = await supabase
        .from('earn_rules')
        .select('*')
        .in('card_id', cardIds)
        .is('effective_to', null);

      if (rulesData) {
        earnRules = rulesData as EarnRule[];
      }
    }

    // Step 3: Compute best earn rate and category per card
    const cardDisplayList: CardDisplay[] = typedData.map((uc) => {
      const cardRules = earnRules.filter((r) => r.card_id === uc.cards.id);
      let bestRate = uc.cards.base_rate_mpd;
      let bestCategory = 'General';

      for (const rule of cardRules) {
        if (rule.earn_rate_mpd > bestRate) {
          bestRate = rule.earn_rate_mpd;
          const cat = CATEGORY_MAP[rule.category_id];
          bestCategory = cat?.name ?? rule.category_id;
        }
      }

      return {
        card: uc.cards,
        bestRate,
        bestCategory,
      };
    });

    setCards(cardDisplayList);
    setLoading(false);
    setRefreshing(false);
    } catch (err) {
      if (__DEV__) console.error('Cards fetch error:', err);
      showNetworkErrorAlert(() => fetchCards());
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchCards();
    }, [fetchCards])
  );

  // -----------------------------------------------------------------------
  // Pull-to-refresh
  // -----------------------------------------------------------------------
  const handleRefresh = () => {
    setRefreshing(true);
    fetchCards();
  };

  // -----------------------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------------------
  const handleCardPress = (cardId: string) => {
    router.push(`/card/${cardId}`);
  };

  // -----------------------------------------------------------------------
  // Remove card with loss framing confirmation
  // -----------------------------------------------------------------------
  const handleRemoveCard = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from('user_cards')
        .delete()
        .eq('card_id', cardId);

      if (error) {
        const msg = handleSupabaseError(error);
        Alert.alert('Error', msg);
      } else {
        setCards((prev) => prev.filter((c) => c.card.id !== cardId));
        await track('card_removed', { card_id: cardId }, user?.id);
      }
    } catch {
      Alert.alert('Error', 'Failed to remove card. Please check your connection.');
    }
  };

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  if (loading) {
    return <LoadingSpinner message="Loading your cards..." />;
  }

  // -----------------------------------------------------------------------
  // Empty state
  // -----------------------------------------------------------------------
  if (cards.length === 0) {
    return (
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.background}
        imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <View style={styles.emptyContainer}>
            <Text style={styles.screenTitle}>My Cards</Text>
            <Text style={styles.screenSubtitle}>Manage your miles credit cards</Text>
            <EmptyState
              icon="card-outline"
              title="No cards in your portfolio"
              description="Add your miles cards to get started."
              ctaLabel="+ Add Cards"
              onCtaPress={() => router.push('/onboarding')}
            />
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.background}
      imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <FlatList
          data={cards}
          keyExtractor={(item) => item.card.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListHeaderComponent={
            <View>
              <Text style={styles.screenTitle}>My Cards</Text>
              <Text style={styles.screenSubtitle}>Manage your miles credit cards</Text>
            </View>
          }
          renderItem={({ item }) => (
            <CardListItem
              id={item.card.id}
              name={item.card.name}
              bank={item.card.bank}
              network={item.card.network}
              slug={item.card.slug}
              earnRate={item.bestRate}
              bestCategory={item.bestCategory}
              imageUrl={item.card.image_url}
              onPress={handleCardPress}
              onRemove={handleRemoveCard}
              showChevron
              eligibilityCriteria={item.card.eligibility_criteria}
            />
          )}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/onboarding?from=cards')}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={24} color={Colors.brandGold} />
              <Text style={styles.addButtonText}>+ Add More Cards</Text>
            </TouchableOpacity>
          }
        />
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
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl + 40,
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
  emptyContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    marginTop: Spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(197, 165, 90, 0.4)',
    borderRadius: 20,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    color: Colors.brandGold,
    marginLeft: Spacing.sm,
  },
});
