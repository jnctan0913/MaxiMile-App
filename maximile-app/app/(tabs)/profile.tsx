import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { track } from '../../lib/analytics';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';

/**
 * Profile screen (DRD Section 9)
 *
 * - Logo at top
 * - User info: email, member since date
 * - Menu items: Transaction History, About MaxiMile, Privacy Policy
 * - Sign out button (outlined danger)
 * - Version number at bottom
 */
export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [showAboutModal, setShowAboutModal] = useState(false);

  const handleSignOut = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Sign Out?\n\nYou'll need to sign in again to use MaxiMile.");
      if (confirmed) {
        await track('sign_out', {}, user?.id);
        signOut();
      }
      return;
    }
    Alert.alert(
      'Sign Out?',
      "You'll need to sign in again to use MaxiMile.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await track('sign_out', {}, user?.id);
            signOut();
          },
        },
      ]
    );
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-SG', {
        month: 'long',
        year: 'numeric',
      })
    : 'N/A';

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.background}
      imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
    >
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.screenTitle}>Profile</Text>
        <Text style={styles.screenSubtitle}>Your account and settings</Text>

        {/* User info card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={Colors.textInverse} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.email} numberOfLines={1}>
              {user?.email ?? 'Unknown'}
            </Text>
            <Text style={styles.memberSince}>
              Member since {memberSince}
            </Text>
          </View>
        </View>

        {/* Menu items */}
        <View style={styles.menuSection}>
          <MenuItem
            icon="receipt-outline"
            label="Transaction History"
            onPress={() => router.push('/transactions')}
          />
          <MenuItem
            icon="chatbubble-ellipses-outline"
            label="Send Feedback"
            onPress={() => router.push('/feedback')}
          />
          <MenuItem
            icon="flag-outline"
            label="Report Rate Changes"
            onPress={() => router.push('/my-submissions')}
          />
          <MenuItem
            icon="information-circle-outline"
            label="About MaxiMile"
            onPress={() => setShowAboutModal(true)}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            onPress={() => router.push('/privacy-policy')}
            isLast
          />
        </View>

        {/* Account management */}
        <View style={styles.menuSection}>
          <MenuItem
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => router.push('/change-password')}
          />
          <MenuItem
            icon="mail-outline"
            label="Change Email"
            onPress={() => router.push('/change-email')}
          />
          <MenuItem
            icon="trash-outline"
            label="Delete Account"
            onPress={() => router.push('/delete-account')}
            isLast
            danger
          />
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.versionText}>v1.0.0-beta</Text>
      </ScrollView>

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalBackdrop}>
          {Platform.OS === 'ios' && (
            <BlurView
              intensity={60}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          )}
          <View style={styles.modalContent}>
            {/* Gold accent line at top */}
            <LinearGradient
              colors={['rgba(197, 165, 90, 0)', 'rgba(197, 165, 90, 0.4)', 'rgba(197, 165, 90, 0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalAccentLine}
            />

            {/* Logo */}
            <Image
              source={require('../../assets/logo_wName_b.png')}
              style={styles.modalLogo}
              resizeMode="contain"
            />

            {/* Tagline */}
            <Text style={styles.modalTagline}>
              Don't just spend. <Text style={styles.modalTaglineGold}>Maximise.</Text>
            </Text>

            {/* Feature rows */}
            <View style={styles.modalFeatures}>
              <View style={styles.modalFeatureRow}>
                <LinearGradient
                  colors={['#C5A55A', '#A8893E']}
                  style={styles.modalFeatureIcon}
                >
                  <Ionicons name="compass-outline" size={18} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.modalFeatureText}>
                  <Text style={styles.modalFeatureTitle}>Smart Recommendations</Text>
                  <Text style={styles.modalFeatureDesc}>Best card for every purchase</Text>
                </View>
              </View>
              <View style={styles.modalFeatureRow}>
                <LinearGradient
                  colors={['#C5A55A', '#A8893E']}
                  style={styles.modalFeatureIcon}
                >
                  <Ionicons name="bar-chart-outline" size={18} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.modalFeatureText}>
                  <Text style={styles.modalFeatureTitle}>Cap Tracking</Text>
                  <Text style={styles.modalFeatureDesc}>Never miss a bonus mile cap</Text>
                </View>
              </View>
              <View style={styles.modalFeatureRow}>
                <LinearGradient
                  colors={['#C5A55A', '#A8893E']}
                  style={styles.modalFeatureIcon}
                >
                  <Ionicons name="flash-outline" size={18} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.modalFeatureText}>
                  <Text style={styles.modalFeatureTitle}>Smart Pay</Text>
                  <Text style={styles.modalFeatureDesc}>Location-based card suggestions</Text>
                </View>
              </View>
            </View>

            <Text style={styles.modalVersion}>Version 1.0.0-beta</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowAboutModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </ImageBackground>
  );
}

// ---------------------------------------------------------------------------
// Menu Item sub-component
// ---------------------------------------------------------------------------

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  isLast?: boolean;
  danger?: boolean;
}

function MenuItem({ icon, label, onPress, isLast = false, danger = false }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, isLast && styles.menuItemLast]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={22} color={danger ? Colors.danger : Colors.textSecondary} />
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={danger ? Colors.danger : Colors.textTertiary} />
    </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  container: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl + 40,
  },

  // Header
  screenTitle: {
    ...Typography.heading,
    fontSize: 26,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  screenSubtitle: {
    ...Typography.body,
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl + 4,
  },

  // User card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    borderTopWidth: 3,
    borderTopColor: Colors.brandGold,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 6,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brandCharcoal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  userInfo: {
    flex: 1,
  },
  email: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  memberSince: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  // Menu
  menuSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 24,
    elevation: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
    marginLeft: Spacing.md,
  },
  menuLabelDanger: {
    color: Colors.danger,
  },

  // Sign out
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.danger,
    marginBottom: Spacing.lg,
  },
  signOutText: {
    ...Typography.bodyBold,
    color: Colors.danger,
    marginLeft: Spacing.sm,
  },

  // Version
  versionText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },

  // About modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.xl,
    marginHorizontal: Spacing.xl,
    maxWidth: 340,
    width: '85%',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: { elevation: 12 },
    }),
  },
  modalAccentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  modalLogo: {
    width: 120,
    height: 120,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  modalTagline: {
    ...Typography.body,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  modalTaglineGold: {
    color: Colors.brandGold,
    fontWeight: '700',
  },
  modalFeatures: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  modalFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  modalFeatureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  modalFeatureText: {
    flex: 1,
  },
  modalFeatureTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    fontSize: 14,
    marginBottom: 1,
  },
  modalFeatureDesc: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  modalVersion: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
  },
  modalButton: {
    backgroundColor: Colors.brandGold,
    borderRadius: BorderRadius.full,
    height: 44,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
  },
});
