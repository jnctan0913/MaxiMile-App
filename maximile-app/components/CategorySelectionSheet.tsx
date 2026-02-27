import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from './BottomSheet';
import { CATEGORIES, getCategoryById } from '../constants/categories';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CategorySelectionSheetProps {
  visible: boolean;
  onDismiss: () => void;
  cardId: string;
  cardName: string;
  currentSelections: string[]; // currently selected category IDs
  maxSelections: number;       // default 2
  onSave: (selectedCategories: string[]) => void;
}

// The 5 selectable bonus categories for UOB Lady's Solitaire (MaxiMile IDs)
const SELECTABLE_CATEGORIES = ['dining', 'transport', 'groceries', 'travel', 'general'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CategorySelectionSheet({
  visible,
  onDismiss,
  cardId,
  cardName,
  currentSelections,
  maxSelections = 2,
  onSave,
}: CategorySelectionSheetProps) {
  const [selected, setSelected] = useState<string[]>(currentSelections);

  // Sync internal state when currentSelections prop changes
  useEffect(() => {
    setSelected(currentSelections);
  }, [currentSelections]);

  // Reset state when sheet opens
  useEffect(() => {
    if (visible) {
      setSelected(currentSelections);
    }
  }, [visible, currentSelections]);

  const handleToggle = (categoryId: string) => {
    if (selected.includes(categoryId)) {
      // Deselect
      setSelected((prev) => prev.filter((id) => id !== categoryId));
    } else {
      // Check max limit
      if (selected.length >= maxSelections) {
        Alert.alert(
          'Selection Limit',
          `You can only select ${maxSelections} categories. Deselect one first.`,
        );
        return;
      }
      setSelected((prev) => [...prev, categoryId]);
    }
  };

  const canSave = selected.length === maxSelections;

  const handleSave = () => {
    if (!canSave) return;
    onSave(selected);
  };

  return (
    <BottomSheet
      visible={visible}
      onDismiss={onDismiss}
      title={`Choose ${maxSelections} Bonus Categories`}
    >
      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Select which categories earn 4 mpd on your {cardName}
      </Text>

      {/* Category chips */}
      <View style={styles.chipWrap}>
        {SELECTABLE_CATEGORIES.map((catId) => {
          const cat = getCategoryById(catId);
          if (!cat) return null;

          const isActive = selected.includes(catId);

          return (
            <TouchableOpacity
              key={catId}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              onPress={() => handleToggle(catId)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={(isActive ? cat.iconFilled : cat.icon) as keyof typeof Ionicons.glyphMap}
                size={16}
                color={isActive ? Colors.brandGold : Colors.brandCharcoal}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  isActive && styles.categoryChipTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Info text */}
      <Text style={styles.infoText}>
        You can change your selections anytime. UOB allows quarterly re-selection.
      </Text>

      {/* Save button */}
      <TouchableOpacity
        style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
        onPress={handleSave}
        activeOpacity={0.8}
        disabled={!canSave}
      >
        <Text style={[styles.saveButtonText, !canSave && styles.saveButtonTextDisabled]}>
          {canSave
            ? 'Save Selections'
            : `Select ${maxSelections - selected.length} more`}
        </Text>
      </TouchableOpacity>
    </BottomSheet>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },

  // Category chips — flex-wrap grid (same pattern as log.tsx)
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    flexGrow: 1,
    flexBasis: '28%',
    gap: Spacing.xs,
  },
  categoryChipActive: {
    borderColor: Colors.brandGold,
    backgroundColor: 'rgba(197, 165, 90, 0.12)',
  },
  categoryChipText: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  categoryChipTextActive: {
    color: Colors.brandCharcoal,
  },

  // Info text
  infoText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },

  // Save button
  saveButton: {
    backgroundColor: Colors.brandGold,
    borderRadius: BorderRadius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  saveButtonText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
  },
  saveButtonTextDisabled: {
    color: Colors.textSecondary,
  },
});
