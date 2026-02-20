import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LogoProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show tagline below the logo */
  showTagline?: boolean;
}

// ---------------------------------------------------------------------------
// Size map
// ---------------------------------------------------------------------------

const SIZE_MAP = {
  sm: 40,
  md: 64,
  lg: 120,
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Logo({ size = 'md', showTagline = false }: LogoProps) {
  const dimension = SIZE_MAP[size];

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/Logo.png')}
        style={{ width: dimension, height: dimension }}
        resizeMode="contain"
        accessibilityLabel="MaxiMile logo"
      />
      {showTagline && (
        <Text style={styles.tagline}>Credit Card Miles Optimizer</Text>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  tagline: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
