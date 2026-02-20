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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import Logo from '../components/Logo';
import BrandedLoading from '../components/BrandedLoading';
import { handleAuthError } from '../lib/error-handler';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { updatePassword, clearRecovery } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleUpdatePassword = async () => {
    setErrorMsg('');

    if (!password.trim()) {
      setErrorMsg('Please enter a new password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await updatePassword(password);
      setLoading(false);

      if (error) {
        setErrorMsg(handleAuthError(error));
      } else {
        setResetSuccess(true);
      }
    } catch {
      setLoading(false);
      setErrorMsg('Unable to connect. Please check your internet.');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errorMsg) setErrorMsg('');
  };

  const handleConfirmChange = (text: string) => {
    setConfirmPassword(text);
    if (errorMsg) setErrorMsg('');
  };

  const handleContinue = () => {
    clearRecovery();
    router.replace('/(tabs)');
  };

  if (loading) {
    return <BrandedLoading message="Updating password..." />;
  }

  if (resetSuccess) {
    return (
      <ImageBackground
        source={require('../assets/background.png')}
        style={styles.gradient}
        imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Logo size="lg" />
          </View>

          <GlassCard style={styles.glassCard}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark-circle-outline" size={36} color={Colors.brandGold} />
              </View>
            </View>

            <Text style={styles.successTitle}>Password updated</Text>
            <Text style={styles.successBody}>
              Your password has been successfully changed. You can now use your new password to sign in.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </ImageBackground>
    );
  }

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
        <View style={styles.header}>
          <Logo size="lg" />
          <Text style={styles.title}>New Password</Text>
          <Text style={styles.subtitle}>
            Choose a strong new password for your account.
          </Text>
        </View>

        <GlassCard style={styles.glassCard}>
          {errorMsg !== '' && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={Colors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <Text style={styles.inputLabel}>New Password</Text>
          <View style={[styles.passwordContainer, passwordFocused && styles.inputFocused]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="At least 6 characters"
              placeholderTextColor={Colors.textTertiary}
              value={password}
              onChangeText={handlePasswordChange}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              secureTextEntry={!showPassword}
              textContentType="newPassword"
              returnKeyType="next"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Confirm New Password</Text>
          <View style={[styles.passwordContainer, confirmFocused && styles.inputFocused]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Re-enter your new password"
              placeholderTextColor={Colors.textTertiary}
              value={confirmPassword}
              onChangeText={handleConfirmChange}
              onFocus={() => setConfirmFocused(true)}
              onBlur={() => setConfirmFocused(false)}
              secureTextEntry={!showConfirmPassword}
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleUpdatePassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!password.trim() || !confirmPassword.trim()) && styles.primaryButtonDisabled,
            ]}
            onPress={handleUpdatePassword}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Update Password</Text>
          </TouchableOpacity>
        </GlassCard>
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
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    ...Typography.heading,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  glassCard: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.lg,
  },
  inputFocused: {
    borderColor: Colors.brandGold,
    borderWidth: 2,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Platform.OS === 'android' ? 0 : Spacing.md,
  },
  passwordInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    paddingVertical: Platform.OS === 'android' ? Spacing.md : 0,
    ...(Platform.OS === 'web' && { outlineStyle: 'none' as 'solid' }),
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    flex: 1,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(197, 165, 90, 0.12)',
    borderWidth: 2,
    borderColor: 'rgba(197, 165, 90, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    ...Typography.heading,
    fontSize: 22,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  successBody: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  primaryButton: {
    backgroundColor: Colors.brandGold,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
  },
});
