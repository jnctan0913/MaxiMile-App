import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CapProgressBarProps {
  /** Amount spent so far (SGD) */
  spent: number;
  /** Total cap amount (SGD) */
  cap: number;
  /** Optional label shown above the bar (e.g. category name) */
  label?: string;
  /** Whether to show the numeric values below the bar */
  showValues?: boolean;
  /** Override the bar height (default: 8) */
  height?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Determine the bar color based on remaining cap percentage.
 * - Green:  > 50% remaining
 * - Amber:  20-50% remaining
 * - Red:    > 0% but < 20% remaining
 * - Grey:   0% remaining (exhausted)
 */
export function getCapColor(spent: number, cap: number): string {
  if (cap <= 0) return Colors.capExhausted;
  const remaining = Math.max(0, cap - spent);
  const pct = remaining / cap;

  if (pct <= 0) return Colors.capExhausted;
  if (pct < 0.2) return Colors.capRed;
  if (pct < 0.5) return Colors.capAmber;
  return Colors.capGreen;
}

function getCapStatusText(spent: number, cap: number): string {
  const remaining = Math.max(0, cap - spent);
  if (remaining <= 0) return 'Cap exhausted';
  const pct = Math.round((remaining / cap) * 100);
  return `$${remaining.toLocaleString()} left (${pct}%)`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CapProgressBar({
  spent,
  cap,
  label,
  showValues = true,
  height = 8,
}: CapProgressBarProps) {
  const progress = cap > 0 ? Math.min(spent / cap, 1) : 1;
  const barColor = getCapColor(spent, cap);

  return (
    <View style={styles.container}>
      {/* Label row */}
      {(label || showValues) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showValues && (
            <Text style={[styles.statusText, { color: barColor }]}>
              {getCapStatusText(spent, cap)}
            </Text>
          )}
        </View>
      )}

      {/* Progress bar track */}
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${progress * 100}%`,
              backgroundColor: barColor,
              height,
            },
          ]}
        />
      </View>

      {/* Value labels */}
      {showValues && (
        <View style={styles.valueRow}>
          <Text style={styles.valueText}>${spent.toLocaleString()} spent</Text>
          <Text style={styles.valueText}>${cap.toLocaleString()} cap</Text>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  statusText: {
    ...Typography.caption,
  },
  track: {
    width: '100%',
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BorderRadius.full,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  valueText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
});
