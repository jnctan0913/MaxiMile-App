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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleAuthError } from '../../lib/error-handler';
import { track } from '../../lib/analytics';

/**
 * Signup screen — glassmorphism redesign with charcoal gradient,
 * gold CTA, and password visibility toggles.
 * After successful signup, shows a confirmation state prompting
 * the user to verify their email before signing in.
 */
export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);

  const PENDING_CONSENT_KEY = '@maximile_pending_consent';

  const handleSignUp = async () => {
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please try again.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (!consentChecked) {
      setErrorMsg('Please agree to the Privacy Policy to continue.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email.trim(), password);
      setLoading(false);

      if (error) {
        const msg = handleAuthError(error);
        setErrorMsg(msg);
      } else {
        track('sign_up', { method: 'email' });
        setRegisteredEmail(email.trim());
        setSignUpSuccess(true);
        // Store consent intent for flushing after email verification
        try {
          await AsyncStorage.setItem(
            PENDING_CONSENT_KEY,
            JSON.stringify({
              policyVersion: '1.0',
              consentedAt: new Date().toISOString(),
              platform: Platform.OS,
              appVersion: '1.0.0-beta',
            })
          );
        } catch {
          // Non-critical — consent was captured in UI
        }
      }
    } catch {
      setLoading(false);
      setErrorMsg('Unable to connect. Please check your internet.');
    }
  };

  // Clear error when user starts typing
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errorMsg) setErrorMsg('');
  };
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errorMsg) setErrorMsg('');
  };
  const handleConfirmChange = (text: string) => {
    setConfirmPassword(text);
    if (errorMsg) setErrorMsg('');
  };

  if (loading) {
    return <BrandedLoading message="Creating account..." />;
  }

  // ---------------------------------------------------------------------------
  // Success state: email verification prompt
  // ---------------------------------------------------------------------------
  if (signUpSuccess) {
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
            {/* Success icon */}
            <View style={styles.successIconContainer}>
              <View style={styles.successIconCircle}>
                <Ionicons name="mail-outline" size={36} color={Colors.brandGold} />
              </View>
            </View>

            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successBody}>
              We've sent a verification link to:
            </Text>
            <Text style={styles.successEmail}>{registeredEmail}</Text>
            <Text style={styles.successBody}>
              Click the link in the email to activate your account, then come back here to sign in.
            </Text>

            {/* Steps */}
            <View style={styles.stepsContainer}>
              <View style={styles.stepRow}>
                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
                <Text style={styles.stepText}>Open your email inbox</Text>
              </View>
              <View style={styles.stepRow}>
                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
                <Text style={styles.stepText}>Click the verification link</Text>
              </View>
              <View style={styles.stepRow}>
                <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
                <Text style={styles.stepText}>Come back and sign in</Text>
              </View>
            </View>

            {/* Go to Sign In */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.replace('/(auth)/login')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Go to Sign In</Text>
            </TouchableOpacity>
          </GlassCard>

          {/* Hint */}
          <Text style={styles.hintText}>
            Didn't receive the email? Check your spam folder.
          </Text>
        </View>
      </ImageBackground>
    );
  }

  // ---------------------------------------------------------------------------
  // Sign up form
  // ---------------------------------------------------------------------------
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
        {/* Header */}
        <View style={styles.header}>
          <Logo size="lg" />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join MaxiMile to start earning more miles on every purchase.
          </Text>
        </View>

        {/* Glass form card */}
        <GlassCard style={styles.glassCard}>
          {/* Inline error banner */}
          {errorMsg !== '' && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={Colors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={[styles.input, emailFocused && styles.inputFocused, errorMsg !== '' && styles.inputError]}
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
            returnKeyType="next"
          />

          <Text style={styles.inputLabel}>Password</Text>
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

          <Text style={styles.inputLabel}>Confirm Password</Text>
          <View style={[styles.passwordContainer, confirmFocused && styles.inputFocused]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Re-enter your password"
              placeholderTextColor={Colors.textTertiary}
              value={confirmPassword}
              onChangeText={handleConfirmChange}
              onFocus={() => setConfirmFocused(true)}
              onBlur={() => setConfirmFocused(false)}
              secureTextEntry={!showConfirmPassword}
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
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

          {/* Privacy Policy consent */}
          <TouchableOpacity
            style={styles.consentRow}
            onPress={() => setConsentChecked(!consentChecked)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, consentChecked && styles.checkboxChecked]}>
              {consentChecked && (
                <Ionicons name="checkmark" size={14} color={Colors.brandCharcoal} />
              )}
            </View>
            <Text style={styles.consentText}>
              I agree to the{' '}
              <Text
                style={styles.consentLink}
                onPress={() => router.push('/privacy-policy')}
              >
                Privacy Policy
              </Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, (!email.trim() || !password.trim() || !consentChecked) && styles.primaryButtonDisabled]}
            onPress={handleSignUp}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.footerLink}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  // Error states
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
  inputError: {
    borderColor: 'rgba(220, 38, 38, 0.4)',
  },
  // Success state
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
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(197, 165, 90, 0.4)',
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.brandGold,
    borderColor: Colors.brandGold,
  },
  consentText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
  },
  consentLink: {
    ...Typography.captionBold,
    color: Colors.brandGold,
    textDecorationLine: 'underline',
  },
});
