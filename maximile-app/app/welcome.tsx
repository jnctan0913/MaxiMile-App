import React from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import GlassCard from '../components/GlassCard';

// ---------------------------------------------------------------------------
// Benefit data
// ---------------------------------------------------------------------------

const BENEFITS = [
  {
    icon: 'compass-outline' as const,
    title: 'Smart Recommendations',
    description: 'Know the best card for every purchase',
  },
  {
    icon: 'bar-chart-outline' as const,
    title: 'Cap Tracking',
    description: 'Never miss a bonus mile cap again',
  },
  {
    icon: 'card-outline' as const,
    title: 'Card Portfolio',
    description: 'All your miles cards in one place',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.gradient}
      imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo + heading */}
        <View style={styles.header}>
          <Image
            source={require('../assets/logo_wName_b.png')}
            style={styles.heroLogo}
            resizeMode="contain"
            accessibilityLabel="MaxiMile logo"
          />
          <Text style={styles.heading}>Welcome to MaxiMile</Text>
          <Text style={styles.tagline}>
            Don't just spend.{' '}
            <Text style={styles.taglineGold}>Maximise.</Text>
          </Text>
        </View>

        {/* Value proposition card */}
        <GlassCard style={styles.glassCard}>
          {BENEFITS.map((benefit, index) => (
            <View
              key={benefit.icon}
              style={[
                styles.benefitRow,
                index < BENEFITS.length - 1 && styles.benefitRowBorder,
              ]}
            >
              <View style={styles.iconCircle}>
                <Ionicons
                  name={benefit.icon}
                  size={24}
                  color={Colors.brandGold}
                />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDescription}>
                  {benefit.description}
                </Text>
              </View>
            </View>
          ))}
        </GlassCard>

        {/* CTA */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/onboarding')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  heroLogo: {
    width: 200,
    height: 200,
  },
  heading: {
    ...Typography.heading,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  tagline: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  taglineGold: {
    color: Colors.brandGold,
    fontWeight: '700',
  },
  glassCard: {
    marginBottom: Spacing.xl,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  benefitRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 165, 90, 0.15)',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(197, 165, 90, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  benefitDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  primaryButton: {
    backgroundColor: Colors.brandGold,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
  },
});
