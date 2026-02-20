import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import GlassCard from './GlassCard';
import { formatMiles } from '../lib/miles-utils';

export interface GoalProgressCardProps {
  goalId: string;
  description: string;
  targetMiles: number;
  currentBalance: number;
  achievedAt: string | null;
  onEdit: (goalId: string) => void;
  onDelete: (goalId: string) => void;
}

export default function GoalProgressCard({
  goalId,
  description,
  targetMiles,
  currentBalance,
  achievedAt,
  onEdit,
}: GoalProgressCardProps) {
  const isAchieved = achievedAt !== null || currentBalance >= targetMiles;
  const rawPercent = targetMiles > 0 ? (currentBalance / targetMiles) * 100 : 0;
  const percent = Math.min(Math.round(rawPercent), 100);
  const fillWidth = Math.min(rawPercent, 100);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: fillWidth,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [fillWidth, barAnim]);

  useEffect(() => {
    if (isAchieved) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.8,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isAchieved, pulseAnim]);

  const animatedWidth = barAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <GlassCard
      style={[
        styles.card,
        isAchieved && styles.achievedCard,
      ]}
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        <TouchableOpacity
          onPress={() => onEdit(goalId)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={`Edit goal: ${description}`}
        >
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.barContainer}>
        <View style={styles.barTrack}>
          <Animated.View
            style={[
              styles.barFill,
              { width: animatedWidth },
              isAchieved && { opacity: pulseAnim },
            ]}
          />
        </View>
        <Text style={styles.percentText}>{percent}%</Text>
      </View>

      {/* Miles fraction */}
      <Text style={styles.milesText}>
        {formatMiles(Math.min(currentBalance, targetMiles))} / {formatMiles(targetMiles)} miles
      </Text>

      {/* Achievement or projection */}
      {isAchieved ? (
        <View style={styles.achievedRow}>
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={Colors.brandGold}
          />
          <Text style={styles.achievedText}>Goal Achieved!</Text>
        </View>
      ) : (
        <View style={styles.projectionRow}>
          <Ionicons
            name="time-outline"
            size={14}
            color={Colors.textTertiary}
          />
          <Text style={styles.projectionText}>
            Keep logging to see projection
          </Text>
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm,
  },
  achievedCard: {
    borderColor: 'rgba(197, 165, 90, 0.4)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  editText: {
    ...Typography.caption,
    color: Colors.brandGold,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginRight: Spacing.sm,
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.brandGold,
    borderRadius: BorderRadius.full,
  },
  percentText: {
    ...Typography.captionBold,
    color: Colors.brandGold,
    minWidth: 36,
    textAlign: 'right',
  },
  milesText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  achievedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  achievedText: {
    ...Typography.bodyBold,
    color: Colors.brandGold,
  },
  projectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  projectionText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
});
