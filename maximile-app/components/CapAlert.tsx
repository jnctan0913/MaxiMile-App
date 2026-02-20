import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';

export interface CapAlertProps {
  cardName: string;
  categoryName: string;
  percentUsed: number;
  remainingAmount: number;
  alternativeCard?: string;
  onDismiss: () => void;
}

type Severity = 'warning' | 'danger';

function getSeverity(percentUsed: number): Severity {
  return percentUsed >= 95 ? 'danger' : 'warning';
}

const SEVERITY_CONFIG: Record<Severity, { bg: string; accent: string; icon: string }> = {
  warning: {
    bg: 'rgba(251, 188, 4, 0.12)',
    accent: Colors.warning,
    icon: 'alert-circle',
  },
  danger: {
    bg: 'rgba(234, 67, 53, 0.12)',
    accent: Colors.danger,
    icon: 'warning',
  },
};

export default function CapAlert({
  cardName,
  categoryName,
  percentUsed,
  remainingAmount,
  alternativeCard,
  onDismiss,
}: CapAlertProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  const severity = getSeverity(percentUsed);
  const config = SEVERITY_CONFIG[severity];
  const roundedPct = Math.round(percentUsed);

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: config.bg },
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: config.accent }]} />

      <View style={styles.iconContainer}>
        <Ionicons
          name={config.icon as keyof typeof Ionicons.glyphMap}
          size={20}
          color={config.accent}
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.mainText}>
          {cardName} — {categoryName} cap at {roundedPct}%.{' '}
          ${remainingAmount.toLocaleString()} remaining.
        </Text>
        {alternativeCard && (
          <Text style={styles.alternativeText}>
            Consider using {alternativeCard} instead.
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.dismissButton}
        onPress={handleDismiss}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close" size={18} color={Colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  iconContainer: {
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
  },
  textContainer: {
    flex: 1,
    paddingVertical: Spacing.md,
  },
  mainText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  alternativeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  dismissButton: {
    padding: Spacing.md,
  },
});
