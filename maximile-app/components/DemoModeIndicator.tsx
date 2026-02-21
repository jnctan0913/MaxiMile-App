// =============================================================================
// MaxiMile — Demo Mode Indicator
// =============================================================================
// Visual indicator shown ONLY in demo builds
// Helps presenters know they're using mock data
// =============================================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Demo Mode Indicator
 * Shows a small badge when EXPO_PUBLIC_DEMO_MODE=true
 * Hidden in production builds
 *
 * Can be used:
 * - In navigation header (via headerRight)
 * - As overlay on screen content
 */
export function DemoModeIndicator() {
  const isDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';

  // Hide in production
  if (!isDemoMode) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Ionicons name="flask-outline" size={11} color="#FF9500" />
      <Text style={styles.text}>DEMO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.4)',
    gap: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF9500',
    letterSpacing: 0.5,
  },
});
