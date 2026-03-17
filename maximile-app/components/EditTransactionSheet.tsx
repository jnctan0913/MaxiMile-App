// =============================================================================
// EditTransactionSheet — F43 Transaction Entry Correction
// =============================================================================
// Pre-filled bottom sheet that lets users correct a logged transaction.
// All four fields are editable: amount, category, card, date.
// Saving calls the parent's onSave handler which writes to Supabase.
// =============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { CATEGORIES } from '../constants/categories';
import { getCardImage } from '../constants/cardImages';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';
import type { TransactionUpdate } from '../lib/transactions';
import { Image } from 'react-native';

// DateTimePicker is native-only; we gracefully fall back on web
let DateTimePicker: React.ComponentType<{
  value: Date;
  mode: 'date';
  display?: string;
  onChange: (event: unknown, date?: Date) => void;
  maximumDate?: Date;
}> | null = null;

if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EditableTransaction {
  id: string;
  card_id: string;
  category_id: string;
  amount: number;
  transaction_date: string; // YYYY-MM-DD
  cards: { bank: string; name: string } | null;
}

interface UserCardOption {
  card_id: string;
  card: {
    id: string;
    bank: string;
    name: string;
    slug: string;
    image_url: string | null;
  };
}

interface EditTransactionSheetProps {
  visible: boolean;
  transaction: EditableTransaction | null;
  userId: string;
  onSave: (id: string, oldTx: EditableTransaction, update: TransactionUpdate) => Promise<void>;
  onDismiss: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EditTransactionSheet({
  visible,
  transaction,
  userId,
  onSave,
  onDismiss,
}: EditTransactionSheetProps) {
  // Form state
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [cardId, setCardId] = useState('');
  const [txDate, setTxDate] = useState(new Date());

  // Date picker state (Android: show/hide dialog; iOS: always shown inline)
  const [showDatePicker, setShowDatePicker] = useState(false);
  // Web: show date as editable text YYYY-MM-DD
  const [dateText, setDateText] = useState('');

  // Data
  const [userCards, setUserCards] = useState<UserCardOption[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Slide-up animation
  const slideAnim = useRef(new Animated.Value(300)).current;

  // Pre-fill form when a transaction is passed in
  useEffect(() => {
    if (transaction && visible) {
      setAmountStr(transaction.amount.toFixed(2));
      setCategoryId(transaction.category_id);
      setCardId(transaction.card_id);
      const d = new Date(transaction.transaction_date);
      setTxDate(d);
      setDateText(transaction.transaction_date);
      setErrorMsg(null);
      setShowDatePicker(false);
    }
  }, [transaction, visible]);

  // Slide in when visible
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      slideAnim.setValue(300);
    }
  }, [visible, slideAnim]);

  // Fetch user's cards once when sheet opens
  useEffect(() => {
    if (!visible || !userId) return;
    setLoadingCards(true);
    supabase
      .from('user_cards')
      .select('card_id, card:cards(id, bank, name, slug, image_url)')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) setUserCards(data as unknown as UserCardOption[]);
        setLoadingCards(false);
      });
  }, [visible, userId]);

  const parsedAmount = parseFloat(amountStr);
  const canSave =
    !saving &&
    !isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    categoryId !== '' &&
    cardId !== '';

  const handleSave = useCallback(async () => {
    if (!transaction || !canSave) return;
    setSaving(true);
    setErrorMsg(null);

    // Resolve date: native uses txDate object; web uses dateText string
    let resolvedDate: string;
    if (Platform.OS === 'web') {
      resolvedDate = dateText || transaction.transaction_date;
    } else {
      resolvedDate = txDate.toISOString().slice(0, 10);
    }

    try {
      await onSave(transaction.id, transaction, {
        card_id: cardId,
        category_id: categoryId,
        amount: parsedAmount,
        transaction_date: resolvedDate,
      });
    } catch {
      setErrorMsg('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [transaction, canSave, cardId, categoryId, parsedAmount, txDate, dateText, onSave]);

  const handleDateChange = (_: unknown, selected?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selected) {
      setTxDate(selected);
      setDateText(selected.toISOString().slice(0, 10));
    }
  };

  const formattedDateLabel = txDate.toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Drag handle */}
        <View style={styles.handle} />

        <Text style={styles.title}>Edit Transaction</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Amount */}
          <Text style={styles.fieldLabel}>AMOUNT</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencySign}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amountStr}
              onChangeText={(v) => {
                // Allow only valid decimal numbers
                if (/^\d*\.?\d{0,2}$/.test(v)) setAmountStr(v);
              }}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={Colors.textTertiary}
              autoFocus={false}
            />
          </View>

          {/* Category */}
          <Text style={styles.fieldLabel}>CATEGORY</Text>
          <View style={styles.chipWrap}>
            {CATEGORIES.map((cat) => {
              const isActive = categoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setCategoryId(cat.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      (isActive ? cat.iconFilled : cat.icon) as keyof typeof Ionicons.glyphMap
                    }
                    size={14}
                    color={isActive ? Colors.brandGold : Colors.textSecondary}
                  />
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Card */}
          <Text style={styles.fieldLabel}>CARD</Text>
          {loadingCards ? (
            <ActivityIndicator size="small" color={Colors.brandGold} style={styles.loadingCards} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardScrollContent}
            >
              {userCards.map((uc) => {
                const isActive = cardId === uc.card.id;
                const localImg = getCardImage(uc.card.slug);
                const imgSource = uc.card.image_url
                  ? { uri: uc.card.image_url }
                  : localImg;
                return (
                  <TouchableOpacity
                    key={uc.card_id}
                    style={[styles.cardChip, isActive && styles.cardChipActive]}
                    onPress={() => setCardId(uc.card.id)}
                    activeOpacity={0.7}
                  >
                    {imgSource ? (
                      <Image
                        source={imgSource}
                        style={styles.cardImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.cardImagePlaceholder}>
                        <Text style={styles.cardImagePlaceholderText}>
                          {uc.card.bank.charAt(0)}
                        </Text>
                      </View>
                    )}
                    <Text
                      style={[styles.cardBank, isActive && styles.cardBankActive]}
                      numberOfLines={1}
                    >
                      {uc.card.bank}
                    </Text>
                    <Text
                      style={[styles.cardName, isActive && styles.cardNameActive]}
                      numberOfLines={1}
                    >
                      {uc.card.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Date */}
          <Text style={styles.fieldLabel}>DATE</Text>
          {Platform.OS === 'web' ? (
            <TextInput
              style={styles.dateTextInput}
              value={dateText}
              onChangeText={setDateText}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textTertiary}
              maxLength={10}
            />
          ) : Platform.OS === 'ios' && DateTimePicker ? (
            // iOS: inline compact picker
            <View style={styles.iosDateRow}>
              <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
              <DateTimePicker
                value={txDate}
                mode="date"
                display="compact"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            </View>
          ) : DateTimePicker ? (
            // Android: button + dialog
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.dateButtonText}>{formattedDateLabel}</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.textTertiary} />
            </TouchableOpacity>
          ) : null}

          {/* Android DateTimePicker dialog */}
          {Platform.OS === 'android' && showDatePicker && DateTimePicker && (
            <DateTimePicker
              value={txDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* Error message */}
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        </ScrollView>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!canSave}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color={Colors.brandCharcoal} />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.xl,
    maxHeight: '90%',
    ...Shadows.glass,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  scrollContent: {
    paddingBottom: Spacing.md,
  },

  // Amount
  fieldLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(197, 165, 90, 0.06)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.25)',
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  currencySign: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  amountInput: {
    flex: 1,
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    padding: 0,
  },

  // Category chips
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    flexGrow: 1,
    flexBasis: '28%',
    justifyContent: 'center',
  },
  chipActive: {
    borderColor: Colors.brandGold,
    backgroundColor: 'rgba(197, 165, 90, 0.1)',
  },
  chipText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.brandGold,
  },

  // Card picker
  loadingCards: {
    marginTop: Spacing.sm,
  },
  cardScrollContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  cardChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    minWidth: 96,
    alignItems: 'center',
  },
  cardChipActive: {
    borderColor: Colors.brandGold,
    backgroundColor: 'rgba(197, 165, 90, 0.1)',
  },
  cardImage: {
    width: 60,
    height: 38,
    marginBottom: 4,
    borderRadius: 4,
  },
  cardImagePlaceholder: {
    width: 60,
    height: 38,
    marginBottom: 4,
    borderRadius: 4,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImagePlaceholderText: {
    ...Typography.bodyBold,
    color: Colors.textTertiary,
    fontSize: 14,
  },
  cardBank: {
    ...Typography.label,
    color: Colors.textSecondary,
    fontSize: 10,
    lineHeight: 12,
    marginBottom: 1,
  },
  cardBankActive: { color: Colors.brandGold },
  cardName: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
    lineHeight: 15,
  },
  cardNameActive: { color: Colors.brandCharcoal },

  // Date
  iosDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    alignSelf: 'flex-start',
  },
  dateButtonText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  dateTextInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Typography.caption,
    color: Colors.textPrimary,
  },

  // Error
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    marginTop: Spacing.sm,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 2,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.brandGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveButtonText: {
    ...Typography.bodyBold,
    color: Colors.brandCharcoal,
  },
});
