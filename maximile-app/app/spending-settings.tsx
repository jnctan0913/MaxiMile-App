import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { track } from '../lib/analytics';
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
} from '../constants/theme';

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function SpendingSettingsScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch existing setting on mount
  useEffect(() => {
    if (!user) return;

    const fetchSettings = async () => {
      const { data } = await supabase
        .from('user_settings')
        .select('estimated_monthly_spend')
        .eq('user_id', user.id)
        .single();

      if (data && data.estimated_monthly_spend > 0) {
        setAmount(String(data.estimated_monthly_spend));
      }
      setLoading(false);
    };

    fetchSettings();
  }, [user]);

  const parsedAmount = parseFloat(amount) || 0;
  const canSave = parsedAmount >= 0;

  const handleSave = async () => {
    if (!canSave || !user) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          estimated_monthly_spend: parsedAmount,
        }, { onConflict: 'user_id' });

      if (error) {
        if (__DEV__) console.warn('Settings save error:', error.message);
        Alert.alert('Error', 'Failed to save settings. Please try again.');
        setSaving(false);
        return;
      }

      await track('spending_settings_updated', {
        estimated_monthly_spend: parsedAmount,
      }, user.id);

      setSaving(false);

      if (Platform.OS === 'web') {
        window.alert('Your monthly spend estimate has been saved.');
        router.back();
      } else {
        Alert.alert(
          'Saved',
          'Your monthly spend estimate has been saved. Recommendations will now factor this in.',
          [{ text: 'Done', onPress: () => router.back() }]
        );
      }
    } catch {
      setSaving(false);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Monthly Spend Estimate', headerBackTitle: 'Back' }} />
      <ImageBackground
        source={require('../assets/background.png')}
        style={styles.background}
        imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.flex}
          >
            <ScrollView
              style={styles.flex}
              contentContainerStyle={styles.container}
              keyboardShouldPersistTaps="handled"
            >
              {/* Explanation */}
              <View style={styles.infoCard}>
                <Ionicons name="information-circle-outline" size={22} color={Colors.brandGold} />
                <Text style={styles.infoText}>
                  Some cards require minimum monthly spending to unlock bonus miles rates.
                  Setting your estimate helps us recommend cards you can actually maximize.
                </Text>
              </View>

              {/* Input */}
              <Text style={styles.label}>Estimated Monthly Card Spend</Text>
              <View style={styles.inputRow}>
                <Text style={styles.currency}>S$</Text>
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.brandGold} style={styles.inputLoader} />
                ) : (
                  <TextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                    returnKeyType="done"
                    selectTextOnFocus
                  />
                )}
              </View>
              <Text style={styles.hint}>
                Total across all your credit cards per month
              </Text>

              {/* Quick select presets */}
              <View style={styles.presets}>
                {[300, 500, 800, 1000, 1500, 2000].map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[
                      styles.presetChip,
                      parsedAmount === val && styles.presetChipActive,
                    ]}
                    onPress={() => setAmount(String(val))}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        parsedAmount === val && styles.presetTextActive,
                      ]}
                    >
                      ${val.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Impact preview */}
              {parsedAmount > 0 && (
                <View style={styles.impactCard}>
                  <Text style={styles.impactTitle}>Impact on Recommendations</Text>
                  {parsedAmount >= 1000 && (
                    <Text style={styles.impactRow}>
                      <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                      {' '}UOB Visa Signature bonus unlocked ($1,000 min)
                    </Text>
                  )}
                  {parsedAmount >= 600 && (
                    <Text style={styles.impactRow}>
                      <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                      {' '}UOB Preferred Platinum bonus unlocked ($600 min)
                    </Text>
                  )}
                  {parsedAmount >= 500 && (
                    <Text style={styles.impactRow}>
                      <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                      {' '}SC X Card bonus unlocked ($500 min)
                    </Text>
                  )}
                  {parsedAmount >= 300 && (
                    <Text style={styles.impactRow}>
                      <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                      {' '}Maybank Horizon/Barcelona bonus unlocked ($300 min)
                    </Text>
                  )}
                  {parsedAmount < 300 && (
                    <Text style={styles.impactRow}>
                      <Ionicons name="alert-circle" size={14} color="#F59E0B" />
                      {' '}Below all min spend thresholds — cards with conditions will show base rates
                    </Text>
                  )}
                </View>
              )}

              {/* Save button */}
              <TouchableOpacity
                style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
                onPress={handleSave}
                activeOpacity={0.8}
                disabled={!canSave || saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={Colors.brandCharcoal} />
                ) : (
                  <Text style={styles.saveButtonText}>Save Estimate</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </>
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
  container: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl + 40,
  },

  // Info card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(197, 165, 90, 0.08)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.brandGold,
  },
  infoText: {
    ...Typography.body,
    color: Colors.textSecondary,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  // Input
  label: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.3)',
    paddingHorizontal: Spacing.lg,
    height: 56,
    marginBottom: Spacing.xs,
  },
  currency: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
    padding: 0,
  },
  inputLoader: {
    flex: 1,
    alignSelf: 'center',
  },
  hint: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginBottom: Spacing.lg,
  },

  // Presets
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  presetChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
  },
  presetChipActive: {
    backgroundColor: Colors.brandGold,
    borderColor: Colors.brandGold,
  },
  presetText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  presetTextActive: {
    color: Colors.brandCharcoal,
  },

  // Impact preview
  impactCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
  },
  impactTitle: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  impactRow: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: Spacing.xs,
  },

  // Save button
  saveButton: {
    backgroundColor: Colors.brandGold,
    borderRadius: 20,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
  },
});
