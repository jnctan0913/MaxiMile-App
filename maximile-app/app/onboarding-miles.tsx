import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import LoadingSpinner from '../components/LoadingSpinner';
import { showNetworkErrorAlert, handleSupabaseError } from '../lib/error-handler';
import { track } from '../lib/analytics';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MilesProgram {
  id: string;
  name: string;
  airline: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip anything that isn't a digit, enforce max 10 digits. */
function sanitizeNumericInput(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '').slice(0, 10);
  return digits;
}

/** Format a digit string with commas for display while typing. */
function formatInputDisplay(digits: string): string {
  if (!digits) return '';
  return Number(digits).toLocaleString('en-SG');
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function OnboardingMilesScreen() {
  const router = useRouter();
  const { cardIds: cardIdsParam } = useLocalSearchParams<{ cardIds?: string }>();
  const { user, completeOnboarding } = useAuth();

  const [programs, setPrograms] = useState<MilesProgram[]>([]);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // -----------------------------------------------------------------------
  // Derive unique miles programs from selected cards
  // -----------------------------------------------------------------------
  const fetchPrograms = useCallback(async () => {
    if (!cardIdsParam) {
      setLoading(false);
      return;
    }

    let cardIds: string[];
    try {
      cardIds = JSON.parse(cardIdsParam);
    } catch {
      setLoading(false);
      return;
    }

    if (cardIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cards')
        .select('id, name, miles_program_id, miles_programs!inner(id, name, airline)')
        .in('id', cardIds);

      if (error) {
        handleSupabaseError(error);
        showNetworkErrorAlert();
        setLoading(false);
        return;
      }

      // Deduplicate programs — multiple cards may map to same program
      const seen = new Set<string>();
      const unique: MilesProgram[] = [];

      for (const card of data ?? []) {
        const mp = card.miles_programs as unknown as {
          id: string;
          name: string;
          airline: string | null;
        };
        if (mp && !seen.has(mp.id)) {
          seen.add(mp.id);
          unique.push({ id: mp.id, name: mp.name, airline: mp.airline });
        }
      }

      setPrograms(unique);

      if (user) {
        track('onboarding_miles_view', { programs_count: unique.length }, user.id);
      }
    } catch {
      showNetworkErrorAlert();
    }

    setLoading(false);
  }, [cardIdsParam, user]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // -----------------------------------------------------------------------
  // Handle numeric input change
  // -----------------------------------------------------------------------
  const handleBalanceChange = (programId: string, raw: string) => {
    const digits = sanitizeNumericInput(raw);
    setBalances((prev) => ({ ...prev, [programId]: digits }));
  };

  // -----------------------------------------------------------------------
  // Save balances and proceed to main app
  // -----------------------------------------------------------------------
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const entries = programs
        .map((p) => ({
          programId: p.id,
          amount: parseInt(balances[p.id] || '0', 10),
        }))
        .filter((e) => e.amount > 0);

      // Upsert each non-zero balance via the RPC
      for (const entry of entries) {
        const { error } = await supabase.rpc('upsert_miles_balance', {
          p_user_id: user.id,
          p_program_id: entry.programId,
          p_amount: entry.amount,
        });

        if (error) {
          const msg = handleSupabaseError(error);
          Alert.alert('Error', msg || 'Failed to save balance. Please try again.');
          setSaving(false);
          return;
        }
      }

      const totalEntered = entries.reduce((sum, e) => sum + e.amount, 0);
      track(
        'onboarding_miles_save',
        { programs_with_balance: entries.length, total_entered: totalEntered },
        user.id,
      );

      completeOnboarding();
      router.replace('/(tabs)');
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  // -----------------------------------------------------------------------
  // Skip — proceed without entering balances
  // -----------------------------------------------------------------------
  const handleSkip = () => {
    if (user) {
      track('onboarding_miles_skip', {}, user.id);
    }
    completeOnboarding();
    router.replace('/(tabs)');
  };

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------
  if (loading) {
    return <LoadingSpinner message="Loading miles programs..." />;
  }

  // If no programs derived (cards have no miles_program_id), skip automatically
  if (programs.length === 0) {
    completeOnboarding();
    router.replace('/(tabs)');
    return null;
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.background}
      imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Set your current miles balances</Text>
            <Text style={styles.subtitle}>
              We'll track your earnings from here. You can update anytime.
            </Text>
          </View>

          {/* Program rows */}
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {programs.map((program, index) => {
              const rawDigits = balances[program.id] || '';
              const displayValue = formatInputDisplay(rawDigits);

              return (
                <React.Fragment key={program.id}>
                  <View
                    style={styles.programRow}
                    accessibilityLabel={`${program.name} balance input`}
                  >
                    {/* Gold gradient icon circle */}
                    <LinearGradient
                      colors={['#C5A55A', '#A8893E']}
                      style={styles.iconCircle}
                    >
                      <Ionicons name="airplane-outline" size={18} color="#FFFFFF" />
                    </LinearGradient>

                    {/* Program name */}
                    <Text style={styles.programName} numberOfLines={1}>
                      {program.name}
                    </Text>

                    {/* Numeric input */}
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.numericInput}
                        value={displayValue}
                        onChangeText={(text) => handleBalanceChange(program.id, text)}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={Colors.textTertiary}
                        returnKeyType="done"
                        maxLength={14}
                        accessibilityLabel={`${program.name} miles balance`}
                        accessibilityHint="Enter your current miles balance"
                      />
                    </View>
                  </View>

                  {/* Separator (not after last item) */}
                  {index < programs.length - 1 && <View style={styles.separator} />}
                </React.Fragment>
              );
            })}

            {/* Skip link */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Skip miles balance entry"
            >
              <Text style={styles.skipText}>I'll do this later</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Fixed footer with Save & Continue CTA */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Save balances and continue"
            >
              {saving ? (
                <ActivityIndicator size="small" color={Colors.brandCharcoal} />
              ) : (
                <Text style={styles.ctaText}>Save & Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
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
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    ...Typography.heading,
    fontSize: 26,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  programRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    marginRight: Spacing.md,
  },
  programName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    color: Colors.textPrimary,
    marginRight: Spacing.md,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    height: 36,
    width: 120,
    justifyContent: 'center',
  },
  numericInput: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'right',
    padding: 0,
    height: 36,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(197, 165, 90, 0.15)',
    marginLeft: Spacing.lg,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  skipText: {
    ...Typography.body,
    color: Colors.brandGold,
  },
  footer: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(197, 165, 90, 0.2)',
  },
  ctaButton: {
    backgroundColor: Colors.brandGold,
    borderRadius: BorderRadius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
  },
});
