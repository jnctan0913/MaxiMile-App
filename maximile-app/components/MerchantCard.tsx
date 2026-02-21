import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from './GlassCard';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MerchantCardProps {
  merchantName: string;
  category: string;
  categoryId: string;
  confidence: 'high' | 'medium' | 'low';
  address?: string;
  onChangeCategory?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CATEGORY_ICONS: Record<string, string> = {
  dining: 'restaurant',
  transport: 'car',
  online: 'laptop',
  travel: 'airplane',
  groceries: 'cart',
  petrol: 'speedometer',
  bills: 'receipt',
  general: 'wallet',
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: Colors.success,
  medium: Colors.warning,
  low: Colors.danger,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MerchantCard({
  merchantName,
  category,
  categoryId,
  confidence,
  address,
  onChangeCategory,
}: MerchantCardProps) {
  const iconName = CATEGORY_ICONS[categoryId] ?? 'wallet';
  const badgeColor = CONFIDENCE_COLORS[confidence];

  return (
    <GlassCard>
      <Text style={styles.merchantName}>{merchantName}</Text>

      {address ? (
        <Text style={styles.address} numberOfLines={2}>
          {address}
        </Text>
      ) : null}

      <View style={styles.categoryRow}>
        <Ionicons
          name={iconName as keyof typeof Ionicons.glyphMap}
          size={20}
          color={Colors.brandGold}
        />
        <Text style={styles.categoryText}>{category}</Text>

        <View style={[styles.confidenceBadge, { backgroundColor: badgeColor }]}>
          <Text style={styles.confidenceText}>
            {confidence.toUpperCase()}
          </Text>
        </View>

        {onChangeCategory ? (
          <TouchableOpacity
            onPress={onChangeCategory}
            style={styles.changeLink}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.changeLinkText}>Change</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </GlassCard>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  merchantName: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  address: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  categoryText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  confidenceBadge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
  },
  confidenceText: {
    ...Typography.label,
    color: Colors.textInverse,
    fontSize: 9,
  },
  changeLink: {
    marginLeft: 'auto',
  },
  changeLinkText: {
    ...Typography.captionBold,
    color: Colors.textLink,
  },
});
