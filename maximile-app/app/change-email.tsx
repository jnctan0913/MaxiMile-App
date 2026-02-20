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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import GlassCard from '../components/GlassCard';
import { handleAuthError } from '../lib/error-handler';
import { supabase } from '../lib/supabase';

export default function ChangeEmailScreen() {
  const router = useRouter();
  const { user, changeEmail } = useAuth();

  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleUpdate = async () => {
    setErrorMsg('');

    if (!newEmail.trim()) {
      setErrorMsg('Please enter a new email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password for verification.');
      return;
    }

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

      const { error } = await changeEmail(newEmail.trim());
      setLoading(false);

      if (error) {
        setErrorMsg(handleAuthError(error));
      } else {
        setSuccess(true);
      }
    } catch {
      setLoading(false);
      setErrorMsg('Unable to connect. Please check your internet.');
    }
  };

  if (success) {
    return (
      <ImageBackground
        source={require('../assets/background.png')}
        style={styles.gradient}
        imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
      >
        <View style={styles.container}>
          <GlassCard style={styles.glassCard}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIconCircle}>
                <Ionicons name="mail-outline" size={36} color={Colors.brandGold} />
              </View>
            </View>
            <Text style={styles.successTitle}>Verification Email Sent</Text>
            <Text style={styles.successBody}>
              We've sent a confirmation link to:
            </Text>
            <Text style={styles.successEmail}>{newEmail.trim()}</Text>
            <Text style={styles.successBody}>
              Please click the link in the email to confirm your new address. Your email won't change until you verify it.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Back to Profile</Text>
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <GlassCard style={styles.glassCard}>
            {errorMsg !== '' && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={Colors.danger} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Current Email</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>{user?.email ?? 'Unknown'}</Text>
            </View>

            <Text style={styles.inputLabel}>New Email</Text>
            <TextInput
              style={[
                styles.input,
                emailFocused && styles.inputFocused,
              ]}
              placeholder="new@example.com"
              placeholderTextColor={Colors.textTertiary}
              value={newEmail}
              onChangeText={(t) => { setNewEmail(t); if (errorMsg) setErrorMsg(''); }}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
            />

            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  passwordFocused && styles.inputFocused,
                ]}
                placeholder="Verify your identity"
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
                styles.primaryButton,
                loading && styles.primaryButtonDisabled,
              ]}
              onPress={handleUpdate}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Updating...' : 'Update Email'}
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
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}),
  },
  inputFocused: {
    borderColor: Colors.brandGold,
    borderWidth: 2,
  },
  readOnlyField: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.1)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  readOnlyText: {
    ...Typography.body,
    color: Colors.textTertiary,
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
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    flex: 1,
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
});
