import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
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
import { track } from '../../lib/analytics';

/**
 * Login screen — glassmorphism redesign with charcoal gradient,
 * gold CTA, and password visibility toggle.
 */
export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isInvalidCredentials, setIsInvalidCredentials] = useState(false);

  const handleSignIn = async () => {
    // Clear previous error
    setErrorMsg('');
    setIsInvalidCredentials(false);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email.trim(), password);
      setLoading(false);

      if (error) {
        const msg = handleAuthError(error);
        const lowerMsg = error.message?.toLowerCase() ?? '';
        const isInvalid =
          lowerMsg.includes('invalid login') ||
          lowerMsg.includes('invalid password') ||
          lowerMsg.includes('invalid email') ||
          lowerMsg.includes('no user found');

        setErrorMsg(msg);
        setIsInvalidCredentials(isInvalid);
        setPassword(''); // Clear password on failure
      } else {
        track('sign_in', { method: 'email' });
      }
    } catch {
      setLoading(false);
      setErrorMsg('Unable to connect. Please check your internet.');
    }
  };

  // Clear error when user starts typing
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errorMsg) { setErrorMsg(''); setIsInvalidCredentials(false); }
  };
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errorMsg) { setErrorMsg(''); setIsInvalidCredentials(false); }
  };

  if (loading) {
    return <BrandedLoading message="Signing in..." />;
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
        {/* Logo */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo_wName_b.png')}
            style={styles.heroLogo}
            resizeMode="contain"
            accessibilityLabel="MaxiMile logo"
          />
          <Text style={styles.tagline}>Don't just spend. <Text style={styles.taglineGold}>Maximise.</Text>
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
          <View style={[styles.passwordContainer, passwordFocused && styles.inputFocused, errorMsg !== '' && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Your password"
              placeholderTextColor={Colors.textTertiary}
              value={password}
              onChangeText={handlePasswordChange}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              secureTextEntry={!showPassword}
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
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

          {/* Forgot password */}
          <TouchableOpacity
            style={styles.forgotPasswordRow}
            onPress={() => router.push('/(auth)/forgot-password')}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, (!email.trim() || !password.trim()) && styles.primaryButtonDisabled]}
            onPress={handleSignIn}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>

          {/* Nudge to sign up when credentials are invalid */}
          {isInvalidCredentials && (
            <TouchableOpacity
              style={styles.signUpNudge}
              onPress={() => router.push('/(auth)/signup')}
              activeOpacity={0.7}
            >
              <Text style={styles.signUpNudgeText}>
                Don't have an account?{' '}
                <Text style={styles.signUpNudgeLink}>Create one now</Text>
              </Text>
            </TouchableOpacity>
          )}
        </GlassCard>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.footerLink}> Sign Up</Text>
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
  heroLogo: {
    width: 200,
    height: 200,
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
  // Sign up nudge (shown after invalid credentials)
  signUpNudge: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
    backgroundColor: 'rgba(197, 165, 90, 0.1)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.25)',
  },
  signUpNudgeText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  signUpNudgeLink: {
    ...Typography.captionBold,
    color: Colors.brandGold,
  },
  forgotPasswordRow: {
    alignSelf: 'flex-end',
    marginTop: Spacing.md,
  },
  forgotPasswordText: {
    ...Typography.caption,
    color: Colors.brandGold,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: Colors.brandGold,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
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
