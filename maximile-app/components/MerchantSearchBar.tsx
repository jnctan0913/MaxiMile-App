// =============================================================================
// MaxiMile — MerchantSearchBar (Sprint 34 — F42 Merchant Search)
// =============================================================================
// TextInput with search icon, clear button, and glassmorphism styling.
// =============================================================================

import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows, WebInputStyle } from '../constants/theme';

interface MerchantSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
}

export default function MerchantSearchBar({
  value,
  onChangeText,
  onFocus,
  onBlur,
  onClear,
}: MerchantSearchBarProps) {
  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View style={styles.container} accessibilityRole="search">
      <Ionicons
        name="search-outline"
        size={18}
        color={Colors.textTertiary}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="Search merchant, e.g. Grab, Starbucks..."
        placeholderTextColor={Colors.textTertiary}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Clear search"
        >
          <Ionicons
            name="close-circle"
            size={18}
            color={Colors.textTertiary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    paddingHorizontal: Spacing.md,
    height: 44,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 0,
    ...WebInputStyle,
  },
});
