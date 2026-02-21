import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { CATEGORY_MAP } from '../constants/categories';
import type { RecommendResult } from '../lib/supabase-types';

interface RecommendationMatchBannerProps {
  categoryId: string;
  usedCardId: string | null;
  userId: string;
}

export default React.memo(function RecommendationMatchBanner({
  categoryId,
  usedCardId,
  userId,
}: RecommendationMatchBannerProps) {
  const [recommendation, setRecommendation] = useState<RecommendResult | null>(null);
  const [usedCardRate, setUsedCardRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (categoryId === 'general' || !usedCardId) {
      setLoading(false);
      return;
    }

    const fetchRecommendation = async () => {
      try {
        const { data, error } = await supabase.rpc('recommend', {
          p_category_id: categoryId,
        });

        if (error) {
          setLoading(false);
          return;
        }

        if (!data || data.length === 0) {
          setLoading(false);
          return;
        }

        const topRecommendation = data.find((r: RecommendResult) => r.is_recommended);
        const usedCardResult = data.find((r: RecommendResult) => r.card_id === usedCardId);

        if (topRecommendation) {
          setRecommendation(topRecommendation);
        }
        if (usedCardResult) {
          setUsedCardRate(usedCardResult.earn_rate_mpd);
        }

        setLoading(false);
      } catch {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, [categoryId, usedCardId, userId]);

  useEffect(() => {
    if (!loading && recommendation) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, recommendation, fadeAnim]);

  if (loading || !recommendation || categoryId === 'general') {
    return null;
  }

  const categoryName = CATEGORY_MAP[categoryId]?.name || categoryId;
  const isMatch = recommendation.card_id === usedCardId;

  if (isMatch) {
    return (
      <Animated.View style={[styles.banner, styles.matchBanner, { opacity: fadeAnim }]}>
        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
        <Text style={styles.bannerText}>
          Best card used! <Text style={styles.boldText}>{recommendation.card_name}</Text> earns{' '}
          <Text style={styles.boldText}>{recommendation.earn_rate_mpd} mpd</Text> for {categoryName}
        </Text>
      </Animated.View>
    );
  }

  if (usedCardRate !== null) {
    return (
      <Animated.View style={[styles.banner, styles.mismatchBanner, { opacity: fadeAnim }]}>
        <Ionicons name="bulb-outline" size={20} color="#2196F3" />
        <Text style={styles.bannerText}>
          Tip: <Text style={styles.boldText}>{recommendation.card_name}</Text> earns{' '}
          <Text style={styles.boldText}>{recommendation.earn_rate_mpd} mpd</Text> for {categoryName}{' '}
          (vs <Text style={styles.boldText}>{usedCardRate} mpd</Text> for this card)
        </Text>
      </Animated.View>
    );
  }

  return null;
});

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    borderLeftWidth: 3,
  },
  matchBanner: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderLeftColor: 'rgba(76, 175, 80, 0.8)',
  },
  mismatchBanner: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderLeftColor: 'rgba(33, 150, 243, 0.8)',
  },
  bannerText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    flex: 1,
  },
  boldText: {
    fontWeight: '600',
  },
});
