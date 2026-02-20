import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EmptyStateProps {
  /** Ionicon name displayed prominently */
  icon: string;
  /** Primary message (e.g. "No cards yet") */
  title: string;
  /** Secondary message with more context */
  description?: string;
  /** CTA button label (e.g. "Add Your First Card") */
  ctaLabel?: string;
  /** Called when the CTA button is tapped */
  onCtaPress?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  onCtaPress,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons
        name={icon as keyof typeof Ionicons.glyphMap}
        size={64}
        color={Colors.textTertiary}
      />
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {ctaLabel && onCtaPress && (
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={onCtaPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}
        >
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  title: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    maxWidth: 280,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  ctaText: {
    ...Typography.bodyBold,
    color: Colors.textInverse,
  },
});
