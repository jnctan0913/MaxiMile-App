import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../constants/theme';
import { formatMiles } from '../lib/miles-utils';

export interface TransferOptionRowProps {
  airlineName: string;
  rateFrom: number;
  rateTo: number;
  resultingMiles: number;
  feeSgd?: number | null;
  transferUrl?: string | null;
}

export default function TransferOptionRow({
  airlineName,
  rateFrom,
  rateTo,
  resultingMiles,
  feeSgd,
  transferUrl,
}: TransferOptionRowProps) {
  const handleTransfer = async () => {
    if (!transferUrl) {
      Alert.alert('Transfer', `Transfer via your bank's app or website.`);
      return;
    }
    try {
      const canOpen = await Linking.canOpenURL(transferUrl);
      if (canOpen) {
        await Linking.openURL(transferUrl);
      } else {
        Alert.alert('Transfer', `Transfer via your bank's app or website.`);
      }
    } catch {
      Alert.alert('Transfer', `Transfer via your bank's app or website.`);
    }
  };

  return (
    <View style={styles.row}>
      <View style={styles.leftSection}>
        <View style={styles.nameRow}>
          <Ionicons name="airplane-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.airlineName}>{airlineName}</Text>
        </View>
        <Text style={styles.rateText}>
          {formatMiles(rateFrom)} pts → {formatMiles(rateTo)} miles
        </Text>
        <View style={styles.resultRow}>
          <Text style={styles.resultingMiles}>{formatMiles(resultingMiles)} miles</Text>
          {feeSgd != null && feeSgd > 0 && (
            <Text style={styles.fee}>Fee: S${feeSgd.toFixed(2)}</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.transferCta}
        onPress={handleTransfer}
        activeOpacity={0.7}
        accessibilityLabel={`Transfer to ${airlineName}`}
        accessibilityRole="button"
      >
        <Text style={styles.transferText}>Transfer</Text>
        <Ionicons name="open-outline" size={14} color={Colors.brandGold} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  leftSection: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  airlineName: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  rateText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  resultingMiles: {
    ...Typography.captionBold,
    color: Colors.brandGold,
  },
  fee: {
    ...Typography.caption,
    color: Colors.danger,
  },
  transferCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  transferText: {
    ...Typography.captionBold,
    color: Colors.brandGold,
  },
});
