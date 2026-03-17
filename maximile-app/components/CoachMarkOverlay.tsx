import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, Animated, Dimensions, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';

interface CoachMarkOverlayProps {
  step: number;
  spotRect: { x: number; y: number; width: number; height: number };
  onNext: () => void;
  onSkip: () => void;
}

const STEPS = [
  {
    title: "Know where you're spending?",
    description: 'Type a merchant like "Starbucks" or "Grab" — we find the right card instantly.',
  },
  {
    title: 'Spending by category?',
    description: 'Tap Dining, Transport, Shopping and more to see your best card for each type.',
  },
  {
    title: 'At the checkout?',
    description: 'Tap Flash Pay — we detect where you are and open your best card automatically.',
  },
];

const PAD = 8;

export default function CoachMarkOverlay({ step, spotRect, onNext, onSkip }: CoachMarkOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { height: screenHeight } = Dimensions.get('window');

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [step]);

  const isBottomHalf = spotRect.y > screenHeight / 2;

  const tooltipPosition = isBottomHalf
    ? { bottom: screenHeight - spotRect.y + PAD + 16, left: 16, right: 16 }
    : { top: spotRect.y + spotRect.height + PAD + 16, left: 16, right: 16 };

  const currentStep = STEPS[step];

  return (
    <Modal
      transparent={true}
      statusBarTranslucent={true}
      animationType="none"
      onRequestClose={onSkip}
      visible={true}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Top dim */}
        <View
          style={[
            styles.dimRect,
            {
              top: 0,
              left: 0,
              right: 0,
              height: spotRect.y - PAD,
            },
          ]}
        />
        {/* Bottom dim */}
        <View
          style={[
            styles.dimRect,
            {
              top: spotRect.y + spotRect.height + PAD,
              left: 0,
              right: 0,
              bottom: 0,
            },
          ]}
        />
        {/* Left dim */}
        <View
          style={[
            styles.dimRect,
            {
              top: spotRect.y - PAD,
              left: 0,
              width: spotRect.x - PAD,
              height: spotRect.height + PAD * 2,
            },
          ]}
        />
        {/* Right dim */}
        <View
          style={[
            styles.dimRect,
            {
              top: spotRect.y - PAD,
              left: spotRect.x + spotRect.width + PAD,
              right: 0,
              height: spotRect.height + PAD * 2,
            },
          ]}
        />
        {/* Gold ring */}
        <View
          style={[
            styles.goldRing,
            {
              top: spotRect.y - PAD,
              left: spotRect.x - PAD,
              width: spotRect.width + PAD * 2,
              height: spotRect.height + PAD * 2,
            },
          ]}
        />
        {/* Tooltip */}
        <View style={[styles.tooltip, tooltipPosition]}>
          {/* Step dots */}
          <View style={styles.dotsRow}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === step ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.tooltipTitle}>{currentStep.title}</Text>
          <Text style={styles.tooltipDescription}>{currentStep.description}</Text>
          <View style={styles.tooltipFooter}>
            <TouchableOpacity onPress={onSkip} activeOpacity={0.7}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={onNext}
              activeOpacity={0.85}
            >
              <Text style={styles.nextButtonText}>{step < 2 ? 'Next' : 'Got it'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dimRect: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  goldRing: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.brandGold,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.brandGold,
  },
  dotInactive: {
    width: 8,
    backgroundColor: Colors.textSecondary,
    opacity: 0.3,
  },
  tooltipTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  tooltipDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.xs + 2,
    lineHeight: 20,
  },
  tooltipFooter: {
    marginTop: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  nextButton: {
    backgroundColor: Colors.brandGold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  nextButtonText: {
    color: Colors.brandCharcoal,
    fontWeight: '600',
  },
});
