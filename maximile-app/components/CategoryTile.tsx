import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows, Glass } from '../constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CategoryTileProps {
  id: string;
  name: string;
  emoji: string;
  icon?: string;
  iconFilled?: string;
  isSelected?: boolean;
  isSuggested?: boolean;
  isFullWidth?: boolean;
  onPress?: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Per-category icon gradients — brand-rooted with tonal variation
// ---------------------------------------------------------------------------

const ICON_PALETTES: Record<string, [string, string]> = {
  dining:    ['#C5A55A', '#A8893E'],   // brand gold
  transport: ['#E8967A', '#D4775E'],   // soft peach
  online:    ['#7EC8E3', '#5EB0D0'],   // baby blue
  travel:    ['#3D7A8B', '#2D5E6A'],   // teal (charcoal-blue blend)
  groceries: ['#5BAD7A', '#3D8F5C'],   // sage green
  bills:     ['#A78BDA', '#8B6FC0'],   // lilac
  general:   ['#5F6D7E', '#4A5568'],   // slate grey
};

const DEFAULT_ICON: [string, string] = ['#C5A55A', '#A8893E'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CategoryTile({
  id,
  name,
  emoji,
  icon,
  iconFilled,
  isSelected = false,
  isSuggested = false,
  isFullWidth = false,
  onPress,
}: CategoryTileProps) {
  const iconGradient = ICON_PALETTES[id] ?? DEFAULT_ICON;

  // Pulsing glow animation for suggested category
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!isSuggested) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [isSuggested, pulseAnim]);

  const animatedBorderColor = isSuggested
    ? pulseAnim.interpolate({
        inputRange: [0.3, 0.9],
        outputRange: ['rgba(26, 115, 232, 0.3)', 'rgba(26, 115, 232, 0.9)'],
      })
    : undefined;

  // Bouncy press animation (Pixar-style squish)
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.93,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 10,
    }).start();
  };

  const iconName = isSelected && iconFilled ? iconFilled : icon;

  // Glass card inner content
  const cardContent = (
    <>
      {iconName ? (
        <View style={[styles.iconOuter, isFullWidth && styles.iconOuterInline]}>
          {/* 3D shadow layer under icon */}
          <View style={styles.iconShadow} />
          <LinearGradient
            colors={iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.iconCircle, isFullWidth && styles.iconCircleInline]}
          >
            <Ionicons
              name={iconName as keyof typeof Ionicons.glyphMap}
              size={isFullWidth ? 22 : 24}
              color="#FFFFFF"
            />
          </LinearGradient>
        </View>
      ) : (
        <Text style={[styles.emoji, isFullWidth && styles.emojiInline]}>{emoji}</Text>
      )}
      <Text
        style={[
          styles.name,
          isFullWidth && styles.nameInline,
          isSelected && styles.nameSelected,
        ]}
        numberOfLines={1}
      >
        {name}
      </Text>
    </>
  );

  const animatedBorderStyle = isSuggested
    ? { borderColor: animatedBorderColor, borderWidth: 2 }
    : {};

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={() => onPress?.(id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`${name} category`}
        accessibilityState={{ selected: isSelected }}
      >
        <Animated.View
          style={[
            styles.glassOuter,
            isFullWidth && styles.glassOuterFullWidth,
            isSelected && styles.glassOuterSelected,
            animatedBorderStyle,
          ]}
        >
          {/* Gradient tinted glass background */}
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.4)',
              'rgba(255, 255, 255, 0.4)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
          />

          {/* Blur overlay for frosted glass (iOS only) */}
          {Platform.OS === 'ios' && (
            <BlurView
              intensity={40}
              tint="light"
              style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
            />
          )}

          {/* Top highlight line for 3D glass effect */}
          <View style={styles.glassHighlight} />

          {/* Content */}
          <View style={[styles.contentWrap, isFullWidth && styles.contentWrapFullWidth]}>
            {cardContent}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // Glass card outer container
  glassOuter: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    overflow: 'hidden',
    // 3D depth shadow (Pixar-style soft, elevated)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 6,
  },
  glassOuterFullWidth: {
    // same
  },
  glassOuterSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },

  // Top highlight for glass 3D bevel effect
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: 'rgba(197, 165, 90, 0.15)',
    borderRadius: 1,
  },

  // Content wrapper
  contentWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  contentWrapFullWidth: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },

  // Icon outer (for shadow positioning)
  iconOuter: {
    position: 'relative',
    marginBottom: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOuterInline: {
    marginBottom: 0,
  },

  // 3D shadow under icon circle
  iconShadow: {
    position: 'absolute',
    bottom: -3,
    width: 36,
    height: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.10)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: { elevation: 0 },
    }),
  },

  // Gradient icon circle
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    // Inner highlight for 3D globe look
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  iconCircleInline: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },

  emoji: {
    fontSize: 36,
    marginBottom: Spacing.md,
  },
  emojiInline: {
    marginBottom: 0,
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  nameInline: {
    textAlign: 'left',
  },
  nameSelected: {
    color: Colors.primary,
  },
});
