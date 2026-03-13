// =============================================================================
// MaxiMile — MerchantAutocomplete (Sprint 34 — F42 Merchant Search)
// =============================================================================
// Dropdown FlatList showing up to 6 merchant search results with category
// badges. Shows "No merchants found" when query >= 2 chars but no results.
// =============================================================================

import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '../constants/theme';
import { CATEGORY_MAP } from '../constants/categories';
import type { MerchantEntry } from '../lib/merchant-catalogue';

interface MerchantAutocompleteProps {
  results: MerchantEntry[];
  visible: boolean;
  onSelect: (merchant: MerchantEntry) => void;
  query: string;
}

export default function MerchantAutocomplete({
  results,
  visible,
  onSelect,
  query,
}: MerchantAutocompleteProps) {
  if (!visible) return null;

  const trimmedQuery = query.trim();
  const showEmpty = trimmedQuery.length >= 2 && results.length === 0;

  if (!showEmpty && results.length === 0) return null;

  return (
    <View style={styles.container}>
      {showEmpty ? (
        <View style={styles.emptyRow}>
          <Text style={styles.emptyText}>No merchants found</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.name}-${item.categoryId}`}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={false}
          renderItem={({ item }) => {
            const category = CATEGORY_MAP[item.categoryId];
            return (
              <TouchableOpacity
                style={styles.row}
                onPress={() => onSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.merchantName} numberOfLines={1}>
                  {item.name}
                </Text>
                {category && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>
                      {category.name}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadows.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  merchantName: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: 'rgba(197, 165, 90, 0.12)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
  categoryBadgeText: {
    ...Typography.label,
    color: Colors.brandGold,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  emptyRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
