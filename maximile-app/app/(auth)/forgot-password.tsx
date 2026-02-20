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
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import GlassCard from '../../components/GlassCard';
import Logo from '../../components/Logo';
import BrandedLoading from '../../components/BrandedLoading';
import { handleAuthError } from '../../lib/error-handler';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleResetRequest = async () => {
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await resetPassword(email.trim());
      setLoading(false);

      if (error) {
        setErrorMsg(handleAuthError(error));
      } else {
        setEmailSent(true);
      }
    } catch {
      setLoading(false);
      setErrorMsg('Unable to connect. Please check your internet.');
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errorMsg) setErrorMsg('');
  };

  if (loading) {
    return <BrandedLoading message="Sending reset link..." />;
  }

  if (emailSent) {
    return (
      <ImageBackground
        source={require('../../assets/background.png')}
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
                <Ionicons name="mail-outline" size={36} color={Colors.brandGold} />
              </View>
            </View>

            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successBody}>
              We've sent a password reset link to:
            </Text>
            <Text style={styles.successEmail}>{email.trim()}</Text>
            <Text style={styles.successBody}>
              Click the link in the email to set a new password.
            </Text>

            <View style={styles.stepsContainer}>
              <View style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>Open your email inbox</Text>
              </View>
              <View style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>Click the reset password link</Text>
              </View>
              <View style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>Choose a new password</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.replace('/(auth)/login')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Back to Sign In</Text>
            </TouchableOpacity>
          </GlassCard>

          <Text style={styles.hintText}>
            Didn't receive the email? Check your spam folder.
          </Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.gradient}
      imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Logo size="lg" />
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a link to reset your password.
          </Text>
        </View>

        <GlassCard style={styles.glassCard}>
          {errorMsg !== '' && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={Colors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={[
              styles.input,
              emailFocused && styles.inputFocused,
              errorMsg !== '' && styles.inputError,
            ]}
            placeholder="you@example.com"
            placeholderTextColor={Colors.textTertiary}
            value={email}
            onChangeText={handleEmailChange}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="done"
            onSubmitEditing={handleResetRequest}
          />

          <TouchableOpacity
            style={[
              styles.primaryButton,
              !email.trim() && styles.primaryButtonDisabled,
            ]}
            onPress={handleResetRequest}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Send Reset Link</Text>
          </TouchableOpacity>
        </GlassCard>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Remember your password?</Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.footerLink}> Sign In</Text>
          </TouchableOpacity>
        </View>
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
  input: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.textPrimary,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  inputFocused: {
    borderColor: Colors.brandGold,
    borderWidth: 2,
  },
  inputError: {
    borderColor: 'rgba(220, 38, 38, 0.4)',
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
  successEmail: {
    ...Typography.bodyBold,
    color: Colors.brandGold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  stepsContainer: {
    backgroundColor: 'rgba(197, 165, 90, 0.06)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.15)',
    padding: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.brandGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    ...Typography.captionBold,
    color: Colors.brandCharcoal,
    fontSize: 12,
  },
  stepText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  hintText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.lg,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  footerLink: {
    ...Typography.bodyBold,
    color: Colors.brandGold,
  },
});
