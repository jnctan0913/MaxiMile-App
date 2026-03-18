import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/theme';

interface OnboardingStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingStepIndicator({ currentStep, totalSteps }: OnboardingStepIndicatorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Step {currentStep} of {totalSteps}</Text>
      <View style={styles.track}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              i < currentStep ? styles.segmentActive : styles.segmentInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.xs,
  },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  track: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
  },
  segmentActive: {
    backgroundColor: Colors.brandGold,
  },
  segmentInactive: {
    backgroundColor: 'rgba(197, 165, 90, 0.2)',
  },
});
