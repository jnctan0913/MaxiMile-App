import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { formatMiles } from '../lib/miles-utils';
import TransferOptionRow, { TransferOptionRowProps } from './TransferOptionRow';

export interface TransferOption {
  transfer_id: string;
  destination_name: string;
  destination_airline: string;
  conversion_rate_from: number;
  conversion_rate_to: number;
  resulting_miles: number;
  transfer_fee_sgd: number | null;
  transfer_url: string | null;
}

export interface BankPointsCardProps {
  programName: string;
  balance: number;
  transferOptions: TransferOption[];
  onHeaderPress: () => void;
}

export default function BankPointsCard({
  programName,
  balance,
  transferOptions,
  onHeaderPress,
}: BankPointsCardProps) {
  return (
    <View style={styles.card}>
      {/* Tappable header */}
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.7}
        onPress={onHeaderPress}
        accessibilityRole="button"
        accessibilityLabel={`${programName}, ${formatMiles(balance)} points, tap to view details`}
      >
        <LinearGradient colors={['#C5A55A', '#A8893E']} style={styles.iconCircle}>
          <Ionicons name="card-outline" size={22} color="#FFFFFF" />
        </LinearGradient>

        <View style={styles.headerText}>
          <Text style={styles.programName} numberOfLines={1}>
            {programName}
          </Text>
        </View>

        <Text style={styles.balance}>{formatMiles(balance)}</Text>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={Colors.textTertiary}
          style={{ marginLeft: Spacing.sm }}
        />
      </TouchableOpacity>

      {/* Transfer options section */}
      {transferOptions.length > 0 && (
        <View style={styles.transferSection}>
          <Text style={styles.sectionLabel}>TRANSFER OPTIONS</Text>
          {transferOptions.map((opt) => (
            <TransferOptionRow
              key={opt.transfer_id}
              airlineName={opt.destination_name}
              rateFrom={opt.conversion_rate_from}
              rateTo={opt.conversion_rate_to}
              resultingMiles={opt.resulting_miles}
              feeSgd={opt.transfer_fee_sgd}
              transferUrl={opt.transfer_url}
            />
          ))}
        </View>
      )}

      {transferOptions.length === 0 && (
        <View style={styles.transferSection}>
          <Text style={styles.noTransfers}>No transfer options available</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    marginRight: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  programName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  balance: {
    ...Typography.bodyBold,
    color: Colors.brandGold,
  },
  transferSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  noTransfers: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
});
