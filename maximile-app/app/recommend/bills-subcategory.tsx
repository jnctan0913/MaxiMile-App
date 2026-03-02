import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { BILLS_SUBCATEGORIES } from '../../constants/categories';
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
} from '../../constants/theme';
import { track } from '../../lib/analytics';
import { useAuth } from '../../contexts/AuthContext';

// ---------------------------------------------------------------------------
// Per-subcategory gradient palettes (matching bills lilac base)
// ---------------------------------------------------------------------------

const SUBCATEGORY_PALETTES: Record<string, [string, string]> = {
  utilities:  ['#E8967A', '#D4775E'],  // warm peach — energy / power
  telco:      ['#7EC8E3', '#5EB0D0'],  // baby blue — connectivity
  insurance:  ['#A78BDA', '#8B6FC0'],  // lilac — security / protection
  education:  ['#5BAD7A', '#3D8F5C'],  // sage green — growth
  hospital:   ['#E87A7A', '#D45E5E'],  // soft red — hospital
  pharmacy:   ['#C5A55A', '#A8893E'],  // brand gold — care
};

const DEFAULT_PALETTE: [string, string] = ['#A78BDA', '#8B6FC0'];

// ---------------------------------------------------------------------------
// SubcategoryTile component
// ---------------------------------------------------------------------------

interface SubcategoryTileProps {
  id: string;
  emoji: string;
  label: string;
  onPress: (id: string) => void;
}

function SubcategoryTile({ id, emoji, label, onPress }: SubcategoryTileProps) {
  const gradient = SUBCATEGORY_PALETTES[id] ?? DEFAULT_PALETTE;

  return (
    <TouchableOpacity
      style={styles.tileWrapper}
      onPress={() => onPress(id)}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${label} bills subcategory`}
    >
      <View style={styles.tileOuter}>
        {/* Frosted glass background */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.4)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
        />
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={40}
            tint="light"
            style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
          />
        )}
        {/* Top highlight for 3D glass bevel */}
        <View style={styles.tileHighlight} />

        {/* Content */}
        <View style={styles.tileContent}>
          {/* Gradient emoji circle */}
          <View style={styles.iconOuter}>
            <View style={styles.iconShadow} />
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconCircle}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </LinearGradient>
          </View>
          <Text style={styles.tileLabel} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/**
 * Bills Subcategory Picker — Sprint 28 (S28.2 + S28.3)
 *
 * Shown when the user taps "Bills" from the category grid.
 * Presents 6 subcategory tiles; tapping one navigates to the
 * recommendation result screen filtered by that subcategory.
 */
export default function BillsSubcategoryScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSubcategoryPress = (subcategoryId: string) => {
    track('bills_subcategory_selected', { subcategory: subcategoryId }, user?.id);
    router.push(`/recommend/bills?subcategory=${subcategoryId}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Bills',
          headerBackTitle: 'Back',
        }}
      />
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.background}
        imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>What type of bill?</Text>
              <Text style={styles.headerSubtitle}>
                Select the bill type to get the right card recommendation
              </Text>
            </View>

            {/* 2-column subcategory grid */}
            <View style={styles.grid}>
              {BILLS_SUBCATEGORIES.map((sub) => (
                <SubcategoryTile
                  key={sub.id}
                  id={sub.id}
                  emoji={sub.emoji}
                  label={sub.label}
                  onPress={handleSubcategoryPress}
                />
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl + 40,
  },

  // Header
  header: {
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // 2-column grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },

  // Each tile occupies ~half the width minus gap
  tileWrapper: {
    width: '47%',
  },

  // Tile outer — glass card (mirrors CategoryTile.tsx)
  tileOuter: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 6,
  },

  // Top highlight for 3D bevel
  tileHighlight: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: 'rgba(197, 165, 90, 0.15)',
    borderRadius: 1,
  },

  tileContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },

  // Icon gradient circle (mirrors CategoryTile)
  iconOuter: {
    position: 'relative',
    marginBottom: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  emoji: {
    fontSize: 22,
  },

  tileLabel: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});
