import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  AccessibilityInfo,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RateAlert {
  id: string;
  alertTitle: string;
  alertBody: string;
  severity: 'info' | 'warning' | 'critical';
  cardId: string | null;
  cardName: string | null;
  effectiveDate: string;
  changeType: string;
}

export interface RateChangeBannerProps {
  alerts: RateAlert[];
  onViewDetails: (alert: RateAlert) => void;
  onDismiss: (alertId: string) => void;
  onViewAll?: () => void;
}

// ---------------------------------------------------------------------------
// Severity configuration (DRD 4.15)
// ---------------------------------------------------------------------------

const SEVERITY_PRIORITY: Record<RateAlert['severity'], number> = {
  critical: 3,
  warning: 2,
  info: 1,
};

const SEVERITY_COLORS: Record<RateAlert['severity'], string> = {
  critical: '#EA4335',
  warning: '#FBBC04',
  info: '#4A90D9',
};

const SEVERITY_ICONS: Record<
  RateAlert['severity'],
  keyof typeof Ionicons.glyphMap
> = {
  critical: 'alert-circle',
  warning: 'warning',
  info: 'information-circle',
};

function getTopAlert(alerts: RateAlert[]): RateAlert {
  return [...alerts].sort(
    (a, b) => SEVERITY_PRIORITY[b.severity] - SEVERITY_PRIORITY[a.severity],
  )[0];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * RateChangeBanner — Dismissible notification banner for rate change alerts (F23).
 *
 * DRD Section 4.15: Single-alert layout (< 3 alerts) shows highest-severity
 * alert with a glassmorphic card. Multi-alert layout (>= 3) shows a collapsed
 * summary with a "View All" CTA.
 */
export default function RateChangeBanner({
  alerts,
  onViewDetails,
  onDismiss,
  onViewAll,
}: RateChangeBannerProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const reducedMotion = useRef(false);

  useEffect(() => {
    const check = async () => {
      try {
        reducedMotion.current =
          await AccessibilityInfo.isReduceMotionEnabled();
      } catch {
        // Default to animations enabled
      }
    };
    check();
  }, []);

  // Entrance animation — slide down from top (DRD 4.15.5)
  useEffect(() => {
    if (alerts.length === 0) return;

    if (reducedMotion.current) {
      slideAnim.setValue(0);
      fadeAnim.setValue(1);
      return;
    }

    slideAnim.setValue(-100);
    fadeAnim.setValue(1);

    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 100,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [alerts.length, slideAnim, fadeAnim]);

  const handleDismiss = (alertId: string) => {
    if (reducedMotion.current) {
      onDismiss(alertId);
      return;
    }

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss(alertId));
  };

  if (alerts.length === 0) return null;

  const isMulti = alerts.length >= 3;
  const topAlert = getTopAlert(alerts);
  const borderColor = isMulti
    ? SEVERITY_COLORS.warning
    : SEVERITY_COLORS[topAlert.severity];
  const liveRegion: 'assertive' | 'polite' =
    !isMulti && topAlert.severity === 'critical' ? 'assertive' : 'polite';

  // Multi-alert collapsed layout (DRD 4.15)
  if (isMulti) {
    return (
      <Animated.View
        style={[
          styles.container,
          {
            borderLeftColor: borderColor,
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
        accessibilityRole="alert"
        accessibilityLiveRegion={liveRegion}
      >
        <View style={styles.row}>
          <Ionicons
            name="notifications"
            size={18}
            color={Colors.brandGold}
            style={styles.icon}
          />
          <Text style={[styles.title, styles.flexOne]} numberOfLines={1}>
            {alerts.length} rate changes affect your cards
          </Text>
          {onViewAll && (
            <TouchableOpacity
              onPress={onViewAll}
              style={[styles.cta, { borderColor }]}
              accessibilityRole="button"
              accessibilityLabel="View all rate changes"
            >
              <Text style={[styles.ctaLabel, { color: borderColor }]}>
                View All
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => handleDismiss(topAlert.id)}
            style={styles.dismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss rate change notification"
          >
            <Ionicons
              name="close-outline"
              size={18}
              color={Colors.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  // Single-alert layout (DRD 4.15)
  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderLeftColor: borderColor,
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion={liveRegion}
    >
      <View style={styles.row}>
        <Ionicons
          name={SEVERITY_ICONS[topAlert.severity]}
          size={18}
          color={SEVERITY_COLORS[topAlert.severity]}
          style={styles.icon}
        />
        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {topAlert.alertTitle}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {topAlert.alertBody}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onViewDetails(topAlert)}
          style={[
            styles.cta,
            { borderColor: SEVERITY_COLORS[topAlert.severity] },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`View details for ${topAlert.alertTitle}`}
        >
          <Text
            style={[
              styles.ctaLabel,
              { color: SEVERITY_COLORS[topAlert.severity] },
            ]}
          >
            View Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDismiss(topAlert.id)}
          style={styles.dismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss rate change notification"
        >
          <Ionicons
            name="close-outline"
            size={18}
            color={Colors.textTertiary}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.15)',
    borderLeftWidth: 4,
    padding: Spacing.md,
    marginHorizontal: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexOne: {
    flex: 1,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  textBlock: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  body: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cta: {
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  ctaLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  dismiss: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
