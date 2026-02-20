import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform, LayoutChangeEvent } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

export interface SegmentedControlProps {
  segments: string[];
  activeIndex: number;
  onSegmentChange: (index: number) => void;
}

export default function SegmentedControl({
  segments,
  activeIndex,
  onSegmentChange,
}: SegmentedControlProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  const padding = 3;
  const segmentCount = segments.length;
  const segmentWidth = containerWidth > 0 ? (containerWidth - padding * 2) / segmentCount : 0;

  useEffect(() => {
    if (containerWidth === 0) return;
    Animated.spring(slideAnim, {
      toValue: activeIndex * segmentWidth,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  }, [activeIndex, segmentWidth, containerWidth]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
      // Jump to correct position immediately on first layout
      slideAnim.setValue(activeIndex * ((width - padding * 2) / segmentCount));
    }
  };

  return (
    <View style={styles.container} accessibilityRole="tablist" onLayout={handleLayout}>
      {/* Animated gold pill indicator */}
      {containerWidth > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            {
              width: segmentWidth,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        />
      )}

      {segments.map((label, index) => (
        <TouchableOpacity
          key={label}
          style={styles.segment}
          activeOpacity={0.7}
          onPress={() => onSegmentChange(index)}
          accessibilityRole="tab"
          accessibilityState={{ selected: index === activeIndex }}
          accessibilityLabel={label}
        >
          <Text
            style={[
              styles.segmentText,
              index === activeIndex && styles.activeText,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.15)',
    height: 40,
    padding: 3,
    marginBottom: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
    }),
  },
  indicator: {
    position: 'absolute',
    top: 3,
    left: 3,
    bottom: 3,
    backgroundColor: Colors.brandGold,
    borderRadius: BorderRadius.full,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    minHeight: 34,
  },
  segmentText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  activeText: {
    color: Colors.brandCharcoal,
  },
});
