import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Glass, Colors, BorderRadius, Shadows } from '../constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GlassCardProps {
  /** BlurView intensity (default: Glass.blurIntensity = 60) */
  intensity?: number;
  /** BlurView tint: 'light' | 'dark' | 'default' */
  tint?: 'light' | 'dark' | 'default';
  /** Additional styles applied to the outer wrapper */
  style?: ViewStyle;
  /** Content rendered inside the glass card */
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Reusable glassmorphism card wrapper.
 *
 * Uses `expo-blur` BlurView for the frosted glass effect on iOS.
 * Uses CSS backdrop-filter on web.
 * Falls back to a solid semi-transparent background on Android.
 */
export default function GlassCard({
  intensity = Glass.blurIntensity,
  tint = Glass.tint,
  style,
  children,
}: GlassCardProps) {
  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.outerWrapper, style]}>
        <BlurView
          intensity={intensity}
          tint={tint}
          style={styles.blurView}
        >
          <View style={styles.glassContent}>
            {children}
          </View>
        </BlurView>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.outerWrapper, styles.webGlass, style]}>
        <View style={styles.glassContent}>
          {children}
        </View>
      </View>
    );
  }

  // Fallback for Android: solid semi-transparent background
  return (
    <View style={[styles.outerWrapper, styles.fallbackBg, style]}>
      <View style={styles.glassContent}>
        {children}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  outerWrapper: {
    borderRadius: Glass.borderRadius,
    overflow: 'hidden',
    borderWidth: Glass.borderWidth,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    } : Shadows.glass),
  },
  blurView: {
    // Ensure blur layer always fills the wrapper regardless of parent alignItems
    alignSelf: 'stretch',
  },
  glassContent: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  webGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    ...(Platform.OS === 'web' ? {
      // @ts-ignore — web-only CSS property
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    } : {}),
  },
  fallbackBg: {
    backgroundColor: Colors.glassFallback,
  },
});
