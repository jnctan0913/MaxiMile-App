import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';

export default function DeleteAccountScreen() {
  const { user, deleteAccount } = useAuth();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);

  const confirmAndDelete = () => {
    setErrorMsg('');

    if (!password.trim()) {
      setErrorMsg('Please enter your password to confirm.');
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Are you sure?\n\nThis action is irreversible. All your data, cards, and transaction history will be permanently deleted.'
      );
      if (confirmed) {
        performDelete();
      }
      return;
    }

    Alert.alert(
      'Delete Account?',
      'This action is irreversible. All your data, cards, and transaction history will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: performDelete,
        },
      ]
    );
  };

  const performDelete = async () => {
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email ?? '',
        password,
      });

      if (signInError) {
        setLoading(false);
        setErrorMsg('Password is incorrect.');
        return;
      }

      const { error } = await deleteAccount();
      setLoading(false);

      if (error) {
        setErrorMsg(error.message || 'Failed to delete account. Please try again.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Unable to connect. Please check your internet.');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.gradient}
      imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <GlassCard style={styles.glassCard}>
            <View style={styles.warningIconContainer}>
              <View style={styles.warningIconCircle}>
                <Ionicons name="warning-outline" size={36} color={Colors.danger} />
              </View>
            </View>

            <Text style={styles.warningTitle}>Delete Account</Text>
            <Text style={styles.warningBody}>
              This action is permanent and cannot be undone. The following will be deleted:
            </Text>

            <View style={styles.deleteList}>
              <View style={styles.deleteListItem}>
                <Ionicons name="close-circle" size={18} color={Colors.danger} />
                <Text style={styles.deleteListText}>Your account and profile</Text>
              </View>
              <View style={styles.deleteListItem}>
                <Ionicons name="close-circle" size={18} color={Colors.danger} />
                <Text style={styles.deleteListText}>All saved cards and preferences</Text>
              </View>
              <View style={styles.deleteListItem}>
                <Ionicons name="close-circle" size={18} color={Colors.danger} />
                <Text style={styles.deleteListText}>Transaction history and analytics</Text>
              </View>
              <View style={styles.deleteListItem}>
                <Ionicons name="close-circle" size={18} color={Colors.danger} />
                <Text style={styles.deleteListText}>Recommendation data and cap tracking</Text>
              </View>
            </View>

            {errorMsg !== '' && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={Colors.danger} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Enter your password to confirm</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  passwordFocused && styles.inputFocused,
                ]}
                placeholder="Your password"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={(t) => { setPassword(t); if (errorMsg) setErrorMsg(''); }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                textContentType="password"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textTertiary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.dangerButton,
                loading && styles.dangerButtonDisabled,
              ]}
              onPress={confirmAndDelete}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.textInverse} style={{ marginRight: Spacing.sm }} />
              <Text style={styles.dangerButtonText}>
                {loading ? 'Processing...' : 'Delete Account'}
              </Text>
            </TouchableOpacity>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  glassCard: {
    marginBottom: Spacing.xl,
  },
  warningIconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  warningIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(234, 67, 53, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(234, 67, 53, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningTitle: {
    ...Typography.heading,
    fontSize: 22,
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  warningBody: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  deleteList: {
    backgroundColor: 'rgba(234, 67, 53, 0.05)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(234, 67, 53, 0.12)',
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  deleteListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  deleteListText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
    fontSize: 14,
  },
  inputLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.textPrimary,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}),
  },
  inputFocused: {
    borderColor: Colors.brandGold,
    borderWidth: 2,
  },
  passwordRow: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    flex: 1,
  },
  dangerButton: {
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  dangerButtonDisabled: {
    opacity: 0.5,
  },
  dangerButtonText: {
    ...Typography.bodyBold,
    color: Colors.textInverse,
  },
});
