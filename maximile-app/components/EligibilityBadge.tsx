import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  AccessibilityInfo,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius } from '../constants/theme';
import type { EligibilityCriteria } from '../lib/supabase-types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EligibilityBadgeProps {
  /** Eligibility criteria JSONB from the card record. Null = unrestricted. */
  eligibilityCriteria: EligibilityCriteria | null;
  /** Callback when the badge is tapped (opens tooltip). */
  onPress?: () => void;
  /** Badge size: 'sm' for list items, 'md' for detail headers. */
  size?: 'sm' | 'md';
}

// ---------------------------------------------------------------------------
// Badge variant configuration (DRD 4.13.2)
// ---------------------------------------------------------------------------

interface BadgeVariant {
  label: string;
  backgroundColor: string;
  textColor: string;
  icon: keyof typeof Ionicons.glyphMap;
}

/**
 * Determine which badge variant to display.
 *
 * Priority order (from DRD 4.13): banking_tier > min_income > gender > age.
 * When multiple criteria exist, the badge shows the "most restrictive"
 * criterion; the tooltip (4.14) lists all.
 */
function resolveBadgeVariant(
  criteria: EligibilityCriteria,
): BadgeVariant | null {
  // Banking tier variants
  if (criteria.banking_tier) {
    const tier = criteria.banking_tier.toLowerCase();

    if (tier === 'treasures') {
      return {
        label: 'DBS Treasures',
        backgroundColor: 'rgba(197, 165, 90, 0.12)',
        textColor: '#C5A55A',
        icon: 'diamond-outline',
      };
    }
    if (tier === 'premier') {
      return {
        label: 'Premier Banking',
        backgroundColor: 'rgba(123, 97, 255, 0.12)',
        textColor: '#7B61FF',
        icon: 'shield-outline',
      };
    }
    // Default banking tier (priority_banking and any other)
    const bankingLabel =
      tier === 'priority_banking' ? 'Priority Banking' : criteria.banking_tier;
    return {
      label: bankingLabel,
      backgroundColor: 'rgba(123, 97, 255, 0.12)',
      textColor: '#7B61FF',
      icon: 'shield-outline',
    };
  }

  // Income variant
  if (criteria.min_income != null) {
    const amountK = Math.round(criteria.min_income / 1000);
    return {
      label: `Income \u2265 S$${amountK}k`,
      backgroundColor: 'rgba(197, 165, 90, 0.12)',
      textColor: '#C5A55A',
      icon: 'cash-outline',
    };
  }

  // Gender variant
  if (criteria.gender) {
    return {
      label: 'Women Only',
      backgroundColor: 'rgba(233, 30, 140, 0.12)',
      textColor: '#E91E8C',
      icon: 'female-outline',
    };
  }

  // Age variant
  if (criteria.age_min != null || criteria.age_max != null) {
    const min = criteria.age_min ?? '?';
    const max = criteria.age_max ?? '?';
    return {
      label: `Ages ${min}-${max}`,
      backgroundColor: 'rgba(74, 144, 217, 0.12)',
      textColor: '#4A90D9',
      icon: 'calendar-outline',
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * EligibilityBadge -- Pill-shaped badge for restricted cards (F22).
 *
 * DRD Section 4.13: Shows eligibility type with color-coded variants.
 * Returns null when eligibilityCriteria is null or an empty object.
 */
export default function EligibilityBadge({
  eligibilityCriteria,
  onPress,
  size = 'sm',
}: EligibilityBadgeProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const reducedMotion = useRef(false);

  // Check for reduced motion preference
  useEffect(() => {
    const checkMotion = async () => {
      try {
        const isReducedMotion = await AccessibilityInfo.isReduceMotionEnabled();
        reducedMotion.current = isReducedMotion;
      } catch {
        // Default to no reduced motion
      }
    };
    checkMotion();
  }, []);

  // Fade-in entrance animation (200ms, DRD 4.13.5)
  useEffect(() => {
    if (reducedMotion.current) {
      fadeAnim.setValue(1);
      return;
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Return null for null or empty criteria
  if (!eligibilityCriteria) return null;

  const keys = Object.keys(eligibilityCriteria);
  if (keys.length === 0) return null;

  const variant = resolveBadgeVariant(eligibilityCriteria);
  if (!variant) return null;

  const iconSize = size === 'md' ? 14 : 12;
  const fontSize = size === 'md' ? 12 : 11;
  const badgeHeight = size === 'md' ? 26 : 22;
  const paddingH = Spacing.sm; // 8px

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${variant.label} \u2014 tap for eligibility details`}
        accessibilityHint="Shows eligibility requirements for this card"
        style={[
          styles.badge,
          {
            backgroundColor: variant.backgroundColor,
            height: badgeHeight,
            paddingHorizontal: paddingH,
          },
        ]}
      >
        <Ionicons
          name={variant.icon}
          size={iconSize}
          color={variant.textColor}
          style={styles.icon}
        />
        <Text
          style={[
            styles.label,
            {
              color: variant.textColor,
              fontSize,
            },
          ]}
          numberOfLines={1}
        >
          {variant.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 3,
  },
  label: {
    fontWeight: '600',
    lineHeight: 16,
  },
});
