import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { formatMiles } from '../lib/miles-utils';

export interface TransferNudgeCardProps {
  bankName: string;
  bankBalance: number;
  airlineName: string;
  potentialMiles: number;
  onViewOptions: () => void;
  onDismiss: () => void;
}

export default function TransferNudgeCard({
  bankName,
  bankBalance,
  airlineName,
  potentialMiles,
  onViewOptions,
  onDismiss,
}: TransferNudgeCardProps) {
  return (
    <View style={styles.card} accessibilityRole="alert">
      {/* Header row: lightbulb + dismiss */}
      <View style={styles.headerRow}>
        <Ionicons name="bulb-outline" size={24} color={Colors.brandGold} />
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Dismiss transfer suggestion"
          accessibilityRole="button"
        >
          <Ionicons name="close-outline" size={20} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Message */}
      <Text style={styles.message}>
        Your{' '}
        <Text style={styles.highlight}>{formatMiles(bankBalance)} {bankName}</Text>
        {' '}could become{' '}
        <Text style={styles.highlight}>{formatMiles(potentialMiles)} {airlineName}</Text>
        {' '}miles
      </Text>

      {/* CTA */}
      <TouchableOpacity
        style={styles.cta}
        onPress={onViewOptions}
        activeOpacity={0.7}
        accessibilityLabel={`View transfer options for ${bankName}`}
        accessibilityRole="button"
      >
        <Text style={styles.ctaText}>View Options</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.3)',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  highlight: {
    ...Typography.bodyBold,
    color: Colors.brandGold,
  },
  cta: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: Colors.brandGold,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  ctaText: {
    ...Typography.captionBold,
    color: Colors.brandGold,
  },
});
