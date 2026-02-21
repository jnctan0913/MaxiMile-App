import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, useSegments, useGlobalSearchParams } from 'expo-router';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const PENDING_CONSENT_KEY = '@maximile_pending_consent';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** Whether this is a first-time user who needs onboarding (has no cards). */
  needsOnboarding: boolean;
  /** Whether the user arrived via a password recovery deep link. */
  isRecovery: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  completeOnboarding: () => void;
  clearRecovery: () => void;
  changeEmail: (newEmail: string) => Promise<{ error: AuthError | null }>;
  changePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  deleteAccount: () => Promise<{ error: Error | null }>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    needsOnboarding: false,
    isRecovery: false,
  });

  const router = useRouter();
  const segments = useSegments();
  const globalParams = useGlobalSearchParams<{ from?: string }>();

  // -------------------------------------------------------------------------
  // Check if user has cards (for onboarding redirect)
  // -------------------------------------------------------------------------
  const checkOnboardingStatus = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { count, error } = await supabase
        .from('user_cards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.error('Error checking onboarding status:', error);
        return false; // Default to not needing onboarding on error
      }

      return (count ?? 0) === 0; // Needs onboarding if zero cards
    } catch {
      return false;
    }
  }, []);

  // -------------------------------------------------------------------------
  // Flush pending privacy consent to database on first login
  // -------------------------------------------------------------------------
  const flushPendingConsent = useCallback(async (userId: string) => {
    try {
      const raw = await AsyncStorage.getItem(PENDING_CONSENT_KEY);
      if (!raw) return;

      const pending = JSON.parse(raw) as {
        policyVersion: string;
        consentedAt: string;
        platform: string;
        appVersion: string;
      };

      const { error } = await supabase.from('privacy_consents').insert({
        user_id: userId,
        policy_version: pending.policyVersion,
        consented_at: pending.consentedAt,
        platform: pending.platform,
        app_version: pending.appVersion,
      });

      if (!error) {
        await AsyncStorage.removeItem(PENDING_CONSENT_KEY);
      }
    } catch {
      // Silent fail — consent was captured in the UI; DB record is best-effort
    }
  }, []);

  // -------------------------------------------------------------------------
  // Listen for auth state changes
  // -------------------------------------------------------------------------
  useEffect(() => {
    // Get the initial session — handle stale/invalid refresh tokens gracefully
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.warn('Session recovery failed, signing out:', error.message);
        await supabase.auth.signOut();
        setState({
          user: null,
          session: null,
          loading: false,
          needsOnboarding: false,
          isRecovery: false,
        });
        return;
      }

      let needsOnboarding = false;
      if (session?.user) {
        needsOnboarding = await checkOnboardingStatus(session.user.id);
        await flushPendingConsent(session.user.id);
      }
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
        needsOnboarding,
      });
    }).catch(async () => {
      await supabase.auth.signOut();
      setState({
        user: null,
        session: null,
        loading: false,
        needsOnboarding: false,
        isRecovery: false,
      });
    });

    // Subscribe to future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED' && !session) {
          await supabase.auth.signOut();
          setState({
            user: null,
            session: null,
            loading: false,
            needsOnboarding: false,
            isRecovery: false,
          });
          return;
        }

        let needsOnboarding = false;
        if (session?.user) {
          needsOnboarding = await checkOnboardingStatus(session.user.id);
          await flushPendingConsent(session.user.id);
        }
        setState((prev) => ({
          user: session?.user ?? null,
          session,
          loading: false,
          needsOnboarding,
          isRecovery: event === 'PASSWORD_RECOVERY' ? true : prev.isRecovery,
        }));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [checkOnboardingStatus, flushPendingConsent]);

  // -------------------------------------------------------------------------
  // Auto-redirect based on auth state
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (state.loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    const inOnboardingAutoCapture = segments[0] === 'onboarding-auto-capture';
    const inOnboardingMiles = segments[0] === 'onboarding-miles';
    const inWelcome = segments[0] === 'welcome';
    const inPrivacyPolicy = segments[0] === 'privacy-policy';
    const inResetPassword = segments[0] === 'reset-password';

    // Recovery flow takes priority — navigate to reset-password screen
    if (state.isRecovery && state.session) {
      if (!inResetPassword) {
        router.replace('/reset-password');
      }
      return;
    }

    if (!state.session) {
      // Not authenticated -> redirect to login (but allow public pages)
      if (!inAuthGroup && !inPrivacyPolicy) {
        router.replace('/(auth)/login');
      }
    } else if (state.needsOnboarding) {
      // Authenticated but no cards -> redirect to welcome (then onboarding)
      // Allow onboarding-auto-capture (Step 1.5) and onboarding-miles (Step 2) since cards are saved before navigating there
      if (!inOnboarding && !inOnboardingAutoCapture && !inOnboardingMiles && !inWelcome) {
        router.replace('/welcome');
      }
    } else {
      // Authenticated with cards -> redirect to home (if in auth/onboarding group)
      // But allow onboarding access when user is adding more cards (from=cards)
      if (inAuthGroup) {
        router.replace('/(tabs)');
      } else if (inOnboarding && globalParams.from !== 'cards') {
        router.replace('/(tabs)');
      }
    }
  }, [state.session, state.loading, state.needsOnboarding, state.isRecovery, segments, router, globalParams.from]);

  // -------------------------------------------------------------------------
  // Auth methods
  // -------------------------------------------------------------------------
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const redirectUrl = Platform.OS === 'web'
      ? `${window.location.origin}/reset-password`
      : 'maximile://reset-password';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error: error as AuthError | null };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) {
      setState((prev) => ({ ...prev, isRecovery: false }));
    }
    return { error: error as AuthError | null };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Force-clear local state even if the server-side sign-out fails
      // (e.g., expired/invalid refresh token)
    }
    setState({
      user: null,
      session: null,
      loading: false,
      needsOnboarding: false,
      isRecovery: false,
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    setState((prev) => ({ ...prev, needsOnboarding: false }));
  }, []);

  const clearRecovery = useCallback(() => {
    setState((prev) => ({ ...prev, isRecovery: false }));
  }, []);

  const changeEmail = useCallback(async (newEmail: string) => {
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    return { error: error as AuthError | null };
  }, []);

  const changePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error as AuthError | null };
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Failed to process account deletion') };
    }
  }, []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const value: AuthContextValue = {
    ...state,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    signOut,
    completeOnboarding,
    clearRecovery,
    changeEmail,
    changePassword,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Access the current auth state and methods.
 * Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
