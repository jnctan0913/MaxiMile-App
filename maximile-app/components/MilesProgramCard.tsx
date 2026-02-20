import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { formatMiles, getRelativeTime } from '../lib/miles-utils';

export interface MilesProgramCardProps {
  programName: string;
  airline?: string;
  totalMiles: number;
  baselineMiles: number;
  earnedMiles: number;
  lastUpdated?: string;
  onPress: () => void;
}

export default function MilesProgramCard({
  programName,
  totalMiles,
  baselineMiles,
  earnedMiles,
  lastUpdated,
  onPress,
}: MilesProgramCardProps) {
  const breakdownParts: string[] = [];
  if (baselineMiles > 0) breakdownParts.push(`${formatMiles(baselineMiles)} baseline`);
  if (earnedMiles > 0) breakdownParts.push(`${formatMiles(earnedMiles)} earned`);
  const breakdownText =
    breakdownParts.length > 0 ? breakdownParts.join(' + ') : 'No miles yet';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${programName}, ${formatMiles(totalMiles)} miles, tap to view details`}
    >
      <View style={styles.row}>
        {/* Gold gradient icon circle */}
        <LinearGradient
          colors={['#C5A55A', '#A8893E']}
          style={styles.iconCircle}
        >
          <Ionicons name="airplane-outline" size={22} color="#FFFFFF" />
        </LinearGradient>

        {/* Middle: name, breakdown, timestamp */}
        <View style={styles.details}>
          <View style={styles.topRow}>
            <Text style={styles.programName} numberOfLines={1}>
              {programName}
            </Text>
            <Text style={styles.totalMiles}>{formatMiles(totalMiles)}</Text>
          </View>

          <Text style={styles.breakdown} numberOfLines={1}>
            {breakdownText}
          </Text>

          {lastUpdated && (
            <Text style={styles.lastUpdated}>
              Updated {getRelativeTime(lastUpdated)}
            </Text>
          )}
        </View>

        {/* Chevron */}
        <Ionicons
          name="chevron-forward"
          size={18}
          color={Colors.textTertiary}
          style={styles.chevron}
        />
      </View>
    </TouchableOpacity>
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
  row: {
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
  details: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  programName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    flexShrink: 1,
    marginRight: Spacing.sm,
  },
  totalMiles: {
    ...Typography.bodyBold,
    color: Colors.brandGold,
  },
  breakdown: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  lastUpdated: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  chevron: {
    marginLeft: Spacing.sm,
  },
});
