import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  AccessibilityInfo,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import type { EligibilityCriteria } from '../lib/supabase-types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EligibilityTooltipProps {
  /** Eligibility criteria JSONB from the card record. */
  eligibilityCriteria: EligibilityCriteria;
  /** Whether the tooltip is visible. */
  visible: boolean;
  /** Callback to dismiss the tooltip. */
  onDismiss: () => void;
}

// ---------------------------------------------------------------------------
// Content mapping (DRD 4.14.3)
// ---------------------------------------------------------------------------

interface TooltipContent {
  bullets: string[];
  footer: string;
}

/**
 * Build the tooltip content (bullet points + footer) from eligibility criteria.
 * Multiple criteria result in multiple bullets (DRD 4.14.3).
 */
function buildTooltipContent(criteria: EligibilityCriteria): TooltipContent {
  const bullets: string[] = [];
  let footer = '';

  // Gender
  if (criteria.gender) {
    bullets.push('This card is exclusively available to female applicants');
    footer = 'Application requires gender verification';
  }

  // Age
  if (criteria.age_min != null || criteria.age_max != null) {
    const min = criteria.age_min ?? '?';
    const max = criteria.age_max ?? '?';
    bullets.push(
      `Applicant must be between ${min} and ${max} years old at time of application`,
    );
    if (!footer) {
      footer = 'Age eligibility is verified during application';
    }
  }

  // Income
  if (criteria.min_income != null) {
    const formatted = criteria.min_income.toLocaleString('en-SG');
    bullets.push(`Minimum annual income: S$${formatted}`);

    // If banking tier is also present, add it as a sub-point
    if (criteria.banking_tier) {
      const tierLabel = formatBankingTier(criteria.banking_tier);
      bullets.push(`Banking tier: ${tierLabel} (if applicable)`);
    }

    if (!footer) {
      footer = 'Income verification required during application';
    }
  } else if (criteria.banking_tier) {
    // Banking tier without income
    const tier = criteria.banking_tier.toLowerCase();

    if (tier === 'treasures') {
      bullets.push('DBS Treasures banking tier required');
      bullets.push('Minimum assets under management apply');
      footer = 'Contact DBS for Treasures eligibility';
    } else if (tier === 'premier') {
      bullets.push('HSBC Premier banking relationship required');
      bullets.push('Annual fee typically waived for Premier customers');
      footer = 'Premier banking requires minimum AUM';
    } else {
      // priority_banking or other
      const tierLabel = formatBankingTier(criteria.banking_tier);
      bullets.push(`${tierLabel} relationship required`);
      bullets.push(
        `Higher earn rates available for ${tierLabel} customers`,
      );
      footer = `Contact your bank for ${tierLabel} eligibility`;
    }
  }

  return { bullets, footer };
}

/** Format banking_tier slug into display label */
function formatBankingTier(tier: string): string {
  switch (tier.toLowerCase()) {
    case 'priority_banking':
      return 'Priority Banking';
    case 'premier':
      return 'Premier Banking';
    case 'treasures':
      return 'DBS Treasures';
    default:
      return tier
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * EligibilityTooltip -- Glassmorphic tooltip shown below the EligibilityBadge
 * when the user taps it (F22).
 *
 * DRD Section 4.14: Expandable detail overlay with bullet points per criterion.
 * Animation: 200ms fade + translateY(8->0) on enter, 150ms reverse on exit.
 */
export default function EligibilityTooltip({
  eligibilityCriteria,
  visible,
  onDismiss,
}: EligibilityTooltipProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(8)).current;
  const reducedMotion = useRef(false);
  const isShowing = useRef(false);

  // Check reduced motion preference
  useEffect(() => {
    const check = async () => {
      try {
        const result = await AccessibilityInfo.isReduceMotionEnabled();
        reducedMotion.current = result;
      } catch {
        // Default to animations enabled
      }
    };
    check();
  }, []);

  // Enter / exit animation (DRD 4.14.5)
  useEffect(() => {
    if (visible && !isShowing.current) {
      isShowing.current = true;

      if (reducedMotion.current) {
        fadeAnim.setValue(1);
        translateAnim.setValue(0);
        return;
      }

      fadeAnim.setValue(0);
      translateAnim.setValue(8);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!visible && isShowing.current) {
      isShowing.current = false;

      if (reducedMotion.current) {
        fadeAnim.setValue(0);
        translateAnim.setValue(8);
        return;
      }

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 4,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, translateAnim]);

  // Don't render when hidden (after exit animation completes)
  if (!visible && !isShowing.current) return null;

  const { bullets, footer } = buildTooltipContent(eligibilityCriteria);

  // Build the full accessibility label
  const allBullets = bullets.join('. ');

  return (
    <View style={styles.wrapper}>
      {/* Invisible backdrop to dismiss on tap outside */}
      <TouchableOpacity
        style={styles.backdrop}
        onPress={onDismiss}
        activeOpacity={1}
        accessibilityHint="Tap anywhere to dismiss"
      />

      <Animated.View
        style={[
          styles.tooltip,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim }],
          },
        ]}
        accessibilityRole="summary"
        accessibilityLiveRegion="polite"
        accessibilityLabel={`Eligibility requirements: ${allBullets}`}
      >
        {/* Title */}
        <Text style={styles.title}>Eligibility Requirements</Text>

        {/* Bullet points */}
        {bullets.map((bullet, index) => (
          <View key={index} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>{'\u2022'}</Text>
            <Text style={styles.bulletText}>{bullet}</Text>
          </View>
        ))}

        {/* Footer note */}
        {footer ? <Text style={styles.footer}>{footer}</Text> : null}
      </Animated.View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 100,
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'transparent',
  },
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    padding: Spacing.lg,
    maxWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    marginTop: Spacing.sm,
  },
  title: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  bulletDot: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
    lineHeight: 18,
  },
  bulletText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
});
