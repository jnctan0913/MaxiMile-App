import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from './BottomSheet';
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

export interface SubmissionFormSheetProps {
  visible: boolean;
  onDismiss: () => void;
  cardId: string;
  cardName: string;
  onSubmitSuccess?: () => void;
}

type ChangeType = 'earn_rate' | 'cap_change' | 'devaluation' | 'partner_change' | 'fee_change';

interface ChangeTypeOption {
  value: ChangeType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const CHANGE_TYPE_OPTIONS: ChangeTypeOption[] = [
  { value: 'earn_rate', label: 'Earn Rate Change', icon: 'trending-up-outline' },
  { value: 'cap_change', label: 'Cap Adjustment', icon: 'pie-chart-outline' },
  { value: 'devaluation', label: 'Program Devaluation', icon: 'trending-down-outline' },
  { value: 'partner_change', label: 'New Card Launch', icon: 'add-circle-outline' },
  { value: 'fee_change', label: 'Card Discontinued', icon: 'close-circle-outline' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * SubmissionFormSheet -- Bottom sheet for submitting rate change reports.
 *
 * DRD Section 16: Community-sourced rate change submissions.
 * Uses the existing BottomSheet component pattern with form fields
 * matching the feedback.tsx layout conventions.
 */
export default function SubmissionFormSheet({
  visible,
  onDismiss,
  cardId,
  cardName,
  onSubmitSuccess,
}: SubmissionFormSheetProps) {
  const { user } = useAuth();

  const [changeType, setChangeType] = useState<ChangeType>('earn_rate');
  const [category, setCategory] = useState('');
  const [oldValue, setOldValue] = useState('');
  const [newValue, setNewValue] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = oldValue.trim().length > 0 && newValue.trim().length > 0;

  // Track when the submission form is opened
  useEffect(() => {
    if (visible) {
      track('submission_form_opened', { card_id: cardId, source: 'card_detail' }, user?.id);
    }
  }, [visible, cardId, user?.id]);

  const resetForm = () => {
    setChangeType('earn_rate');
    setCategory('');
    setOldValue('');
    setNewValue('');
    setEffectiveDate('');
    setEvidenceUrl('');
    setNotes('');
  };

  const handleSubmit = async () => {
    if (!canSubmit || !user) return;

    setSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('submit_rate_change', {
        p_card_id: cardId,
        p_change_type: changeType,
        p_category: category.trim() || null,
        p_old_value: oldValue.trim(),
        p_new_value: newValue.trim(),
        p_effective_date: effectiveDate.trim() || null,
        p_evidence_url: evidenceUrl.trim() || null,
        p_screenshot_path: null,
        p_notes: notes.trim() || null,
      });

      if (error) {
        const userMsg = handleSupabaseError(error);
        if (__DEV__) console.warn('Submission RPC error:', userMsg);
        setSubmitting(false);
        Alert.alert('Submission Failed', userMsg || 'Could not submit your report. Please try again.');
        return;
      }

      await track('rate_change_submitted', {
        card_id: cardId,
        change_type: changeType,
        has_evidence: evidenceUrl.trim().length > 0,
      }, user.id);

      setSubmitting(false);
      resetForm();
      Alert.alert(
        'Thank you!',
        'Your rate change report has been submitted. Our team will review it shortly.',
        [{ text: 'Done', onPress: () => {
          onDismiss();
          onSubmitSuccess?.();
        }}]
      );
    } catch {
      setSubmitting(false);
      Alert.alert(
        'Submission Error',
        'Something went wrong. Please try again later.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onDismiss={onDismiss}
      title="Report a Change"
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Card name (read-only) */}
        <Text style={styles.sectionLabel}>CARD</Text>
        <View style={styles.cardNameDisplay}>
          <Ionicons name="card-outline" size={18} color={Colors.brandGold} />
          <Text style={styles.cardNameText} numberOfLines={1}>{cardName}</Text>
        </View>

        {/* Change type picker */}
        <Text style={styles.sectionLabel}>TYPE OF CHANGE</Text>
        <View style={styles.typeGrid}>
          {CHANGE_TYPE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.typeChip,
                changeType === option.value && styles.typeChipActive,
              ]}
              onPress={() => setChangeType(option.value)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={option.icon}
                size={16}
                color={
                  changeType === option.value
                    ? Colors.brandCharcoal
                    : Colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.typeChipText,
                  changeType === option.value && styles.typeChipTextActive,
                ]}
                numberOfLines={1}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category (optional) */}
        <Text style={styles.sectionLabel}>CATEGORY (OPTIONAL)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Dining, Online, Transport"
          placeholderTextColor={Colors.textTertiary}
          value={category}
          onChangeText={setCategory}
          maxLength={100}
        />

        {/* Old value (required) */}
        <Text style={styles.sectionLabel}>OLD VALUE *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. 4 mpd"
          placeholderTextColor={Colors.textTertiary}
          value={oldValue}
          onChangeText={setOldValue}
          maxLength={200}
        />

        {/* New value (required) */}
        <Text style={styles.sectionLabel}>NEW VALUE *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. 3 mpd"
          placeholderTextColor={Colors.textTertiary}
          value={newValue}
          onChangeText={setNewValue}
          maxLength={200}
        />

        {/* Effective date (optional) */}
        <Text style={styles.sectionLabel}>EFFECTIVE DATE (OPTIONAL)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={Colors.textTertiary}
          value={effectiveDate}
          onChangeText={setEffectiveDate}
          maxLength={10}
          keyboardType="numbers-and-punctuation"
        />

        {/* Evidence URL (optional) */}
        <Text style={styles.sectionLabel}>EVIDENCE URL (OPTIONAL)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="https://bank.com/terms..."
          placeholderTextColor={Colors.textTertiary}
          value={evidenceUrl}
          onChangeText={setEvidenceUrl}
          maxLength={500}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Notes (optional) */}
        <Text style={styles.sectionLabel}>NOTES (OPTIONAL)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Any additional context or details..."
          placeholderTextColor={Colors.textTertiary}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          maxLength={500}
        />

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
            <Text style={styles.submitButtonText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </BottomSheet>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 480,
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
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

  // Card name display
  cardNameDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(197, 165, 90, 0.08)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  cardNameText: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    flex: 1,
  },

  // Change type picker — chip grid
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.15)',
  },
  typeChipActive: {
    backgroundColor: Colors.brandGold,
    borderColor: Colors.brandGold,
  },
  typeChipText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeChipTextActive: {
    color: Colors.brandCharcoal,
  },

  // Text input — glass card style
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.15)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.textPrimary,
    height: 44,
  },

  // Text area — multiline
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.15)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.textPrimary,
    minHeight: 80,
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
