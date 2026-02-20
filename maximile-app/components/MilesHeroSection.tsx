import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { formatMiles } from '../lib/miles-utils';

export interface MilesHeroSectionProps {
  totalMiles: number;
  programCount: number;
  monthlyEarned?: number;
  milesSaved?: number;
  topCardName?: string;
  /** Override the default subtitle text (e.g., for "My Points" segment) */
  subtitleOverride?: string;
}

export default function MilesHeroSection({
  totalMiles,
  programCount,
  monthlyEarned,
  milesSaved,
  topCardName,
  subtitleOverride,
}: MilesHeroSectionProps) {
  const showChips = monthlyEarned !== undefined;
  const subtitle =
    subtitleOverride ??
    `total miles across ${programCount} program${programCount === 1 ? '' : 's'}`;

  return (
    <View
      style={styles.container}
      accessibilityRole="summary"
      accessibilityLabel={`${formatMiles(totalMiles)} ${subtitle}`}
    >
      <Text style={styles.totalMiles}>{formatMiles(totalMiles)}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {showChips && (
        <>
          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <Ionicons name="airplane" size={14} color={Colors.brandGold} />
              <Text style={[styles.chipValue, { color: Colors.brandGold }]}>
                +{(monthlyEarned ?? 0).toLocaleString()}
              </Text>
              <Text style={styles.chipLabel}>earned this month</Text>
            </View>
            {milesSaved !== undefined && (
              <View style={styles.chip}>
                <Ionicons name="trending-up" size={14} color="#34C759" />
                <Text style={[styles.chipValue, { color: '#34C759' }]}>
                  +{(milesSaved ?? 0).toLocaleString()}
                </Text>
                <Text style={styles.chipLabel}>miles saved</Text>
              </View>
            )}
          </View>
          {topCardName && (
            <View style={styles.topCardChip}>
              <Ionicons name="trophy" size={14} color={Colors.brandGold} />
              <Text style={styles.topCardLabel} numberOfLines={1}>
                Top card: <Text style={styles.topCardName}>{topCardName}</Text>
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  totalMiles: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.brandGold,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    width: '100%',
  },
  chip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    padding: Spacing.md,
    alignItems: 'center',
  },
  chipValue: {
    ...Typography.bodyBold,
    marginTop: Spacing.xs,
  },
  chipLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  topCardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  topCardLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  topCardName: {
    fontWeight: '600',
    color: Colors.brandGold,
  },
});
