import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
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
import { handleSupabaseError } from '../lib/error-handler';
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
} from '../constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FeedbackType = 'bug' | 'feature';

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function FeedbackScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = message.trim().length >= 10;

  const handleSubmit = async () => {
    if (!canSubmit || !user) return;

    setSubmitting(true);

    try {
      const { error } = await supabase.from('feedback').insert({
        user_id: user.id,
        type: feedbackType,
        message: message.trim(),
        app_version: '1.0.0-beta',
        platform: Platform.OS,
      });

      if (error) {
        const userMsg = handleSupabaseError(error);
        if (__DEV__) console.warn('Feedback insert error:', userMsg);
      }

      await track('feedback_submitted', { type: feedbackType }, user.id);

      setSubmitting(false);
      Alert.alert(
        'Thank you!',
        'Your feedback has been received. We appreciate you helping us improve MaxiMile.',
        [{ text: 'Done', onPress: () => router.back() }]
      );
    } catch {
      setSubmitting(false);
      Alert.alert(
        'Thank you!',
        'Your feedback has been noted. We\'ll review it soon.',
        [{ text: 'Done', onPress: () => router.back() }]
      );
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <Image
              source={require('../assets/Name.png')}
              style={{ height: 28, width: 120 }}
              resizeMode="contain"
            />
          ),
          headerBackTitle: 'Back',
          headerTintColor: Colors.brandGold,
          headerStyle: { backgroundColor: Colors.background },
        }}
      />
      <ImageBackground
        source={require('../assets/background.png')}
        style={styles.background}
        imageStyle={{ width: '100%', height: '100%', resizeMode: 'stretch' }}
      >
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              {/* Page title */}
              <Text style={styles.screenTitle}>Send Feedback</Text>
              <Text style={styles.screenSubtitle}>
                Help us improve MaxiMile
              </Text>

              {/* Type toggle */}
              <Text style={styles.sectionLabel}>WHAT TYPE OF FEEDBACK?</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    feedbackType === 'bug' && styles.typeButtonActive,
                  ]}
                  onPress={() => setFeedbackType('bug')}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="bug-outline"
                    size={20}
                    color={
                      feedbackType === 'bug'
                        ? Colors.brandCharcoal
                        : Colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      feedbackType === 'bug' && styles.typeButtonTextActive,
                    ]}
                  >
                    Report Issue
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    feedbackType === 'feature' && styles.typeButtonActive,
                  ]}
                  onPress={() => setFeedbackType('feature')}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="bulb-outline"
                    size={20}
                    color={
                      feedbackType === 'feature'
                        ? Colors.brandCharcoal
                        : Colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      feedbackType === 'feature' && styles.typeButtonTextActive,
                    ]}
                  >
                    Suggest Feature
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Message input */}
              <Text style={styles.sectionLabel}>
                {feedbackType === 'bug'
                  ? 'DESCRIBE THE ISSUE'
                  : 'DESCRIBE YOUR IDEA'}
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder={
                  feedbackType === 'bug'
                    ? 'What happened? What did you expect to happen?'
                    : 'What feature would you like to see?'
                }
                placeholderTextColor={Colors.textTertiary}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={1000}
              />
              <Text style={styles.charCount}>
                {message.length}/1000
                {message.length > 0 && message.length < 10
                  ? ' (minimum 10 characters)'
                  : ''}
              </Text>

              {/* Submit button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !canSubmit && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={!canSubmit || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={Colors.brandCharcoal} />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Feedback</Text>
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
  scrollView: {
    flex: 1,
  },
  content: {
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
    marginBottom: Spacing.sm,
  },

  // Section labels
  sectionLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },

  // Type toggle — glass card style
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 16,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.15)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
    }),
  },
  typeButtonActive: {
    backgroundColor: Colors.brandGold,
    borderColor: Colors.brandGold,
  },
  typeButtonText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  typeButtonTextActive: {
    color: Colors.brandCharcoal,
  },

  // Text area — glass card style
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.15)',
    borderRadius: 16,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.textPrimary,
    minHeight: 140,
  },
  charCount: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },

  // Submit — gold button
  submitButton: {
    backgroundColor: Colors.brandGold,
    borderRadius: BorderRadius.full,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
  },
});
