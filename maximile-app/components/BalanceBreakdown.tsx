import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/theme';
import { formatMiles } from '../lib/miles-utils';

export interface BalanceBreakdownProps {
  baseline: number;
  earned: number;
  redeemed?: number;
  total: number;
  lastUpdated?: string;
}

export default function BalanceBreakdown({
  baseline,
  earned,
  redeemed = 0,
  total,
  lastUpdated,
}: BalanceBreakdownProps) {
  const currentMonth = new Date().toLocaleDateString('en-SG', {
    month: 'short',
    year: 'numeric',
  });

  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString('en-SG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <View>
      {/* Manual Baseline */}
      <View style={styles.row}>
        <Text style={styles.label}>Manual Baseline</Text>
        <Text style={styles.value}>{formatMiles(baseline)}</Text>
      </View>

      {/* Auto-Earned */}
      <View style={styles.row}>
        <Text style={styles.label}>Auto-Earned ({currentMonth})</Text>
        <Text style={[styles.value, styles.earnedValue]}>
          + {formatMiles(earned)}
        </Text>
      </View>

      {/* Redemptions */}
      <View style={styles.row}>
        <Text style={styles.label}>Redemptions</Text>
        <Text style={[styles.value, styles.redeemedValue]}>
          - {formatMiles(redeemed)}
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Total */}
      <View style={styles.row}>
        <Text style={styles.totalLabel}>Estimated Total</Text>
        <Text style={styles.totalValue}>{formatMiles(total)}</Text>
      </View>

      {/* Last updated */}
      {formattedLastUpdated && (
        <Text style={styles.lastUpdated}>
          Last updated: {formattedLastUpdated}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
  },
  label: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  value: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  earnedValue: {
    color: Colors.success,
  },
  redeemedValue: {
    color: Colors.danger,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  totalLabel: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.brandGold,
  },
  lastUpdated: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
});
