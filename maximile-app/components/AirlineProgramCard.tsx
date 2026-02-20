import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  LayoutAnimation,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { formatMiles } from '../lib/miles-utils';

export interface PotentialSource {
  source_program_name: string;
  source_balance: number;
  conversion_rate_from: number;
  conversion_rate_to: number;
  potential_miles: number;
}

export interface AirlineProgramCardProps {
  programName: string;
  airline?: string;
  confirmedMiles: number;
  potentialMiles: number;
  potentialBreakdown: PotentialSource[];
  onPress: () => void;
}

export default function AirlineProgramCard({
  programName,
  airline,
  confirmedMiles,
  potentialMiles,
  potentialBreakdown,
  onPress,
}: AirlineProgramCardProps) {
  const [expanded, setExpanded] = useState(false);
  const total = confirmedMiles + potentialMiles;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${programName}, ${formatMiles(total)} total miles, tap to view details`}
    >
      <View style={styles.header}>
        <LinearGradient colors={['#C5A55A', '#A8893E']} style={styles.iconCircle}>
          <Ionicons name="airplane-outline" size={22} color="#FFFFFF" />
        </LinearGradient>

        <View style={styles.headerText}>
          <Text style={styles.programName} numberOfLines={1}>
            {programName}
          </Text>
          {airline && (
            <Text style={styles.airline} numberOfLines={1}>
              {airline}
            </Text>
          )}
        </View>

        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </View>

      {/* Balance breakdown */}
      <View style={styles.breakdown}>
        {/* Confirmed */}
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Confirmed</Text>
          <Text style={styles.confirmedValue}>{formatMiles(confirmedMiles)}</Text>
        </View>

        {/* Potential */}
        {potentialMiles > 0 && (
          <>
            <TouchableOpacity
              style={styles.potentialRow}
              onPress={(e) => {
                e.stopPropagation?.();
                toggleExpand();
              }}
              activeOpacity={0.7}
              accessibilityLabel={`${formatMiles(potentialMiles)} potential miles from bank points, tap to ${expanded ? 'collapse' : 'expand'} breakdown`}
            >
              <View style={styles.potentialLeft}>
                <Text style={styles.potentialLabel}>Potential</Text>
                <View style={styles.potentialTag}>
                  <Text style={styles.potentialTagText}>POTENTIAL</Text>
                </View>
              </View>
              <Text style={styles.potentialValue}>+{formatMiles(potentialMiles)}</Text>
            </TouchableOpacity>

            {/* Expanded breakdown */}
            {expanded && potentialBreakdown.length > 0 && (
              <View style={styles.expansionContainer}>
                {potentialBreakdown.map((src, i) => (
                  <View key={src.source_program_name} style={styles.sourceRow}>
                    <Text style={styles.sourcePrefix}>
                      {i === potentialBreakdown.length - 1 ? '└─' : '├─'}
                    </Text>
                    <Text style={styles.sourceName}>{src.source_program_name}: </Text>
                    <Text style={styles.sourceMath}>
                      {formatMiles(src.source_balance)} x {src.conversion_rate_to}/
                      {src.conversion_rate_from} = {formatMiles(src.potential_miles)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Divider + Total */}
        {potentialMiles > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.balanceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatMiles(total)}</Text>
            </View>
          </>
        )}
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
  airline: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  breakdown: {
    marginTop: Spacing.sm,
    paddingLeft: 50, // align with text after icon circle
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  balanceLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  confirmedValue: {
    ...Typography.bodyBold,
    color: Colors.brandGold,
  },
  potentialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(197, 165, 90, 0.3)',
    paddingLeft: Spacing.sm,
    marginBottom: 2,
  },
  potentialLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  potentialLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  potentialTag: {
    backgroundColor: 'rgba(197, 165, 90, 0.12)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  potentialTagText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: Colors.brandGold,
  },
  potentialValue: {
    ...Typography.body,
    color: Colors.brandGold,
    opacity: 0.7,
  },
  expansionContainer: {
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(197, 165, 90, 0.3)',
    paddingLeft: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.sm,
    marginTop: 2,
  },
  sourcePrefix: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginRight: 4,
  },
  sourceName: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  sourceMath: {
    ...Typography.caption,
    color: Colors.textTertiary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.xs,
  },
  totalLabel: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  totalValue: {
    ...Typography.bodyBold,
    color: Colors.brandGold,
  },
});
