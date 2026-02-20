// =============================================================================
// MaxiMile — Design System / Theme Constants
// =============================================================================

export const Colors = {
  // Primary brand
  primary: '#1A73E8',
  primaryLight: '#4A90D9',
  primaryDark: '#1557B0',

  // Semantic
  success: '#34A853',
  warning: '#FBBC04',
  danger: '#EA4335',

  // Neutrals
  background: '#F8F9FA',
  surface: '#FFFFFF',
  border: '#E0E0E0',
  borderLight: '#F0F0F0',

  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#5F6368',
  textTertiary: '#9AA0A6',
  textInverse: '#FFFFFF',
  textLink: '#1A73E8',

  // Brand palette (from logo + brand identity)
  brandGold: '#C5A55A',        // Logo gold accent
  brandCharcoal: '#2D3748',    // Logo dark charcoal
  babyYellow: '#FDFD96',       // Highlight backgrounds, recommendation badges, onboarding accents
  babyYellowLight: '#FEFED5',  // Subtle highlight tint for cards and sections

  // Glassmorphism (lite — applied to select premium surfaces)
  glassBg: 'rgba(255, 255, 255, 0.7)',          // Frosted glass card background
  glassBgDark: 'rgba(45, 55, 72, 0.6)',         // Dark glass variant (brand charcoal base)
  glassBorder: 'rgba(255, 255, 255, 0.3)',       // Subtle glass edge highlight
  glassFallback: 'rgba(255, 255, 255, 0.85)',    // Solid fallback when blur unavailable

  // Cap status colors
  capGreen: '#34A853',   // > 50% remaining
  capAmber: '#FBBC04',   // 20–50% remaining
  capRed: '#EA4335',     // < 20% remaining
  capExhausted: '#9AA0A6', // 0% remaining (greyed out)
} as const;

export const Spacing = {
  /** 4px — Micro spacing (icon padding, tight gaps) */
  xs: 4,
  /** 8px — Base unit (inline element spacing) */
  sm: 8,
  /** 12px — Compact spacing (between related items) */
  md: 12,
  /** 16px — Standard spacing (section padding, list items) */
  lg: 16,
  /** 24px — Generous spacing (between sections) */
  xl: 24,
  /** 32px — Large spacing (screen padding top/bottom) */
  xxl: 32,
  /** 48px — Extra large (major section breaks) */
  xxxl: 48,
} as const;

export const Typography = {
  heading: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: 0,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  captionBold: {
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  label: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
} as const;

export const BorderRadius = {
  /** 4px — Subtle rounding (buttons, inputs) */
  sm: 4,
  /** 8px — Standard rounding (cards, tiles) */
  md: 8,
  /** 12px — Generous rounding (modals, sheets) */
  lg: 12,
  /** 16px — Large rounding (prominent cards) */
  xl: 16,
  /** 9999px — Pill shape (badges, chips) */
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  /** Soft glass elevation — use with glassmorphism surfaces */
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 4,
  },
} as const;

/** Glassmorphism constants — use with expo-blur BlurView */
export const Glass = {
  /** BlurView intensity for standard glass surfaces */
  blurIntensity: 60,
  /** BlurView intensity for tab bar (lighter) */
  blurIntensityLight: 30,
  /** BlurView tint */
  tint: 'light' as const,
  /** Glass card border radius */
  borderRadius: BorderRadius.xl,
  /** Glass card border width */
  borderWidth: 1,
  /** Surfaces to apply glass: recommendation hero, tab bar, bottom sheets, modals, login form */
  // NOT on: data lists, inputs, alternative cards, onboarding list
} as const;

const Theme = {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
  Glass,
} as const;

export default Theme;
