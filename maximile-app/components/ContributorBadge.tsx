import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ContributorBadgeProps {
  /** Number of approved submissions. Badge only renders if >= 3. */
  approvedCount: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ContributorBadge -- Gold pill badge showing "Verified Contributor" with star icon.
 *
 * DRD Section 16: Displayed on the My Submissions screen when a user has
 * 3 or more approved submissions. Follows the same pill styling pattern
 * as RateUpdatedBadge but slightly taller (28px).
 */
export default function ContributorBadge({
  approvedCount,
}: ContributorBadgeProps) {
  if (approvedCount < 3) return null;

  return (
    <View style={styles.badge}>
      <Ionicons
        name="star"
        size={14}
        color={Colors.brandGold}
        style={styles.icon}
      />
      <Text style={styles.label}>Verified Contributor</Text>
      <View style={styles.countContainer}>
        <Text style={styles.countText}>{approvedCount}</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(197, 165, 90, 0.12)',
    borderRadius: BorderRadius.full,
    height: 28,
    paddingHorizontal: Spacing.md,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.brandGold,
    lineHeight: 16,
  },
  countContainer: {
    backgroundColor: Colors.brandGold,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.brandCharcoal,
    lineHeight: 14,
  },
});
