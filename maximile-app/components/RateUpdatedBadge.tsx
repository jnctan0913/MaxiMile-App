import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  AccessibilityInfo,
  Easing,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RateChangeDetail {
  id: string;
  changeType: string;
  category: string | null;
  oldValue: string;
  newValue: string;
  effectiveDate: string;
  alertTitle: string;
  alertBody: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface RateUpdatedBadgeProps {
  changes: RateChangeDetail[];
  cardName: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CHANGE_TYPE_LABELS: Record<string, string> = {
  earn_rate: 'Earn Rate Change',
  cap_change: 'Cap Adjustment',
  devaluation: 'Program Devaluation',
  partner_change: 'Partner Change',
  fee_change: 'Fee Change',
};

function formatChangeType(type: string): string {
  return (
    CHANGE_TYPE_LABELS[type] ??
    type
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  );
}

function formatEffectiveDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `Effective ${date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * RateUpdatedBadge — Gold pill badge with expandable change detail card (F23).
 *
 * DRD Section 4.16: Collapsed state shows a "Rate Updated" gold pill badge.
 * Tapping expands a glassmorphic detail card listing each rate change with
 * old → new values, effective dates, and impact text.
 */
export default function RateUpdatedBadge({
  changes,
  cardName,
}: RateUpdatedBadgeProps) {
  const [expanded, setExpanded] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [measuredHeight, setMeasuredHeight] = useState(0);

  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceTranslateX = useRef(new Animated.Value(20)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
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

  // Badge entrance: slide-in from right (DRD 4.16)
  useEffect(() => {
    if (reducedMotion.current) {
      entranceOpacity.setValue(1);
      entranceTranslateX.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.spring(entranceOpacity, {
        toValue: 1,
        tension: 120,
        friction: 14,
        useNativeDriver: true,
      }),
      Animated.spring(entranceTranslateX, {
        toValue: 0,
        tension: 120,
        friction: 14,
        useNativeDriver: true,
      }),
    ]).start();
  }, [entranceOpacity, entranceTranslateX]);

  const handleMeasure = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0 && measuredHeight === 0) {
      setMeasuredHeight(h);
    }
  };

  const toggleExpand = () => {
    if (!expanded) {
      setExpanded(true);
      setDetailVisible(true);

      if (reducedMotion.current) {
        expandAnim.setValue(1);
        return;
      }

      Animated.spring(expandAnim, {
        toValue: 1,
        tension: 150,
        friction: 15,
        useNativeDriver: false,
      }).start();
    } else {
      setExpanded(false);

      if (reducedMotion.current) {
        expandAnim.setValue(0);
        setDetailVisible(false);
        return;
      }

      Animated.timing(expandAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start(() => setDetailVisible(false));
    }
  };

  if (changes.length === 0) return null;

  const targetHeight = measuredHeight > 0 ? measuredHeight : 500;

  const renderChangeItems = () =>
    changes.map((change, index) => (
      <React.Fragment key={change.id}>
        {index > 0 && <View style={styles.separator} />}
        <View style={styles.changeItem}>
          <View style={styles.changeHeader}>
            <Text style={styles.changeType}>
              {formatChangeType(change.changeType)}
            </Text>
            <Text style={styles.effectiveDate}>
              {formatEffectiveDate(change.effectiveDate)}
            </Text>
          </View>
          <View style={styles.valueRow}>
            <Text style={styles.oldValue}>{change.oldValue}</Text>
            <Text style={styles.arrow}>{' → '}</Text>
            <Text style={styles.newValue}>{change.newValue}</Text>
          </View>
          {change.alertBody ? (
            <Text style={styles.impact}>{change.alertBody}</Text>
          ) : null}
        </View>
      </React.Fragment>
    ));

  return (
    <View>
      {/* Off-screen measurer for detail card height */}
      {measuredHeight === 0 && (
        <View
          style={styles.measurer}
          pointerEvents="none"
          onLayout={handleMeasure}
        >
          <View style={styles.detailCard}>{renderChangeItems()}</View>
        </View>
      )}

      {/* Badge pill */}
      <Animated.View
        style={{
          opacity: entranceOpacity,
          transform: [{ translateX: entranceTranslateX }],
        }}
      >
        <TouchableOpacity
          onPress={toggleExpand}
          activeOpacity={0.7}
          style={styles.badge}
          accessibilityRole="button"
          accessibilityLabel="Rate updated — tap to see recent changes"
        >
          <Ionicons
            name="notifications-outline"
            size={12}
            color={Colors.brandGold}
            style={styles.badgeIcon}
          />
          <Text style={styles.badgeLabel}>Rate Updated</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Expandable detail card */}
      {detailVisible && (
        <Animated.View
          style={[
            styles.detailWrapper,
            {
              maxHeight: expandAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, targetHeight],
                extrapolate: 'clamp',
              }),
              opacity: expandAnim,
            },
          ]}
        >
          <View style={styles.detailCard} accessibilityRole="summary">
            {renderChangeItems()}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  measurer: {
    position: 'absolute',
    opacity: 0,
    left: 0,
    right: 0,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(197, 165, 90, 0.12)',
    borderRadius: BorderRadius.full,
    height: 22,
    paddingHorizontal: Spacing.sm,
    alignSelf: 'flex-start',
  },
  badgeIcon: {
    marginRight: 3,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.brandGold,
  },
  detailWrapper: {
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  detailCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    padding: Spacing.lg,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  changeItem: {},
  changeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  changeType: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  effectiveDate: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  oldValue: {
    ...Typography.caption,
    color: Colors.danger,
    textDecorationLine: 'line-through',
  },
  arrow: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  newValue: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },
  impact: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});
