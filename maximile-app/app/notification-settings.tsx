/**
 * Notification Settings Screen
 * Sprint 20: Push Notifications - Complete System
 *
 * User controls for push notifications:
 * - Master toggle (enable/disable all)
 * - Granular severity filters (critical, warning, info)
 * - Quiet hours (start/end time pickers)
 * - Frequency mode (instant, batched, digest)
 * - Clear notification history
 * - Send test notification
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { scheduleTestNotification } from '../lib/push-notifications';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';
import { trackEvent } from '../lib/analytics';

// ============================================================================
// Types
// ============================================================================

interface NotificationPreferences {
  push_enabled: boolean;
  critical_enabled: boolean;
  warning_enabled: boolean;
  info_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  frequency_mode: 'instant' | 'batched' | 'digest';
}

// ============================================================================
// Screen Component
// ============================================================================

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    push_enabled: true,
    critical_enabled: true,
    warning_enabled: true,
    info_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    frequency_mode: 'instant',
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // -------------------------------------------------------------------------
  // Load Preferences
  // -------------------------------------------------------------------------

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    if (!user?.id) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('push_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        setPreferences({
          push_enabled: data.push_enabled ?? true,
          critical_enabled: data.critical_enabled ?? true,
          warning_enabled: data.warning_enabled ?? true,
          info_enabled: data.info_enabled ?? false,
          quiet_hours_start: data.quiet_hours_start ?? '22:00',
          quiet_hours_end: data.quiet_hours_end ?? '08:00',
          frequency_mode: (data.frequency_mode as any) ?? 'instant',
        });
      }
    } catch (error) {
      console.error('Exception loading preferences:', error);
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------------------------------------------------
  // Save Preferences
  // -------------------------------------------------------------------------

  async function savePreferences(newPrefs: Partial<NotificationPreferences>) {
    if (!user?.id) return;

    try {
      setSaving(true);

      const updated = { ...preferences, ...newPrefs };
      setPreferences(updated);

      const { error } = await supabase.rpc('update_notification_preferences', {
        p_user_id: user.id,
        p_critical_enabled: updated.critical_enabled,
        p_warning_enabled: updated.warning_enabled,
        p_info_enabled: updated.info_enabled,
        p_quiet_hours_start: updated.quiet_hours_start,
        p_quiet_hours_end: updated.quiet_hours_end,
        p_frequency_mode: updated.frequency_mode,
      });

      if (error) {
        console.error('Error saving preferences:', error);
        Alert.alert('Error', 'Failed to save preferences. Please try again.');
        return;
      }

      trackEvent('notification_settings_updated', {
        ...newPrefs,
      });
    } catch (error) {
      console.error('Exception saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  }

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleMasterToggle = async (value: boolean) => {
    if (!value) {
      Alert.alert(
        'Disable Notifications?',
        'You will no longer receive alerts about rate changes and cap limits.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              await supabase.rpc('disable_push_notifications', {
                p_user_id: user!.id,
              });
              setPreferences({ ...preferences, push_enabled: false });
              trackEvent('push_notifications_disabled');
            },
          },
        ]
      );
    } else {
      await savePreferences({ push_enabled: value });
    }
  };

  const handleCriticalToggle = (value: boolean) => {
    if (!value) {
      Alert.alert(
        'Disable Critical Alerts?',
        'Critical alerts notify you of major rate changes. We recommend keeping these on.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => savePreferences({ critical_enabled: value }),
          },
        ]
      );
    } else {
      savePreferences({ critical_enabled: value });
    }
  };

  const handleTestNotification = async () => {
    try {
      await scheduleTestNotification(
        'Test Notification',
        'This is a test notification from MaxiMile. Tap to test deep linking.',
        {
          screen: 'NotificationHistory',
          type: 'test',
          isTest: true,
        },
        2
      );

      Alert.alert('Test Sent', 'You should receive a test notification in 2 seconds.');
      trackEvent('test_notification_sent');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification.');
    }
  };

  const handleClearHistory = async () => {
    Alert.alert(
      'Clear Notification History?',
      'This will delete all notification history older than 30 days.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data, error } = await supabase.rpc('clear_notification_history', {
                p_user_id: user!.id,
                p_older_than_days: 30,
              });

              if (error) {
                Alert.alert('Error', 'Failed to clear history.');
                return;
              }

              Alert.alert('Success', `Cleared ${data || 0} notifications.`);
              trackEvent('notification_history_cleared', { count: data });
            } catch (error) {
              Alert.alert('Error', 'Failed to clear history.');
            }
          },
        },
      ]
    );
  };

  const handleQuietHoursChange = (isStart: boolean, date: Date) => {
    const timeString = date.toTimeString().substring(0, 5); // HH:MM

    if (isStart) {
      savePreferences({ quiet_hours_start: timeString });
      setShowStartPicker(false);
    } else {
      savePreferences({ quiet_hours_end: timeString });
      setShowEndPicker(false);
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Master Toggle */}
        <View style={styles.section}>
          <SettingRow
            icon="notifications"
            title="Push Notifications"
            description="Receive alerts about rate changes and caps"
            value={preferences.push_enabled}
            onValueChange={handleMasterToggle}
            disabled={saving}
          />
        </View>

        {/* Severity Filters */}
        {preferences.push_enabled && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Alert Types</Text>
            </View>

            <View style={styles.section}>
              <SettingRow
                icon="alert-circle"
                title="Critical Alerts"
                description="Major devaluations and significant changes"
                value={preferences.critical_enabled}
                onValueChange={handleCriticalToggle}
                disabled={saving}
                iconColor={Colors.danger}
              />

              <SettingRow
                icon="warning"
                title="Warning Alerts"
                description="Moderate rate changes and cap reductions"
                value={preferences.warning_enabled}
                onValueChange={(value) => savePreferences({ warning_enabled: value })}
                disabled={saving}
                iconColor={Colors.warning}
              />

              <SettingRow
                icon="information-circle"
                title="Info Alerts"
                description="Minor updates and general announcements"
                value={preferences.info_enabled}
                onValueChange={(value) => savePreferences({ info_enabled: value })}
                disabled={saving}
                iconColor={Colors.primary}
              />
            </View>

            {/* Quiet Hours */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quiet Hours</Text>
              <Text style={styles.sectionSubtitle}>
                Pause non-critical notifications during these hours
              </Text>
            </View>

            <View style={styles.section}>
              <TouchableOpacity
                style={styles.timePickerRow}
                onPress={() => setShowStartPicker(true)}
              >
                <View style={styles.timePickerLeft}>
                  <Ionicons name="moon" size={20} color={Colors.brandGold} />
                  <Text style={styles.timePickerLabel}>Start</Text>
                </View>
                <Text style={styles.timePickerValue}>{preferences.quiet_hours_start}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timePickerRow}
                onPress={() => setShowEndPicker(true)}
              >
                <View style={styles.timePickerLeft}>
                  <Ionicons name="sunny" size={20} color={Colors.brandGold} />
                  <Text style={styles.timePickerLabel}>End</Text>
                </View>
                <Text style={styles.timePickerValue}>{preferences.quiet_hours_end}</Text>
              </TouchableOpacity>
            </View>

            {/* Frequency Mode */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Delivery Frequency</Text>
            </View>

            <View style={styles.section}>
              <FrequencyOption
                title="Instant"
                description="Send notifications immediately"
                selected={preferences.frequency_mode === 'instant'}
                onPress={() => savePreferences({ frequency_mode: 'instant' })}
                disabled={saving}
              />

              <FrequencyOption
                title="Batched"
                description="Daily digest at 9 AM"
                selected={preferences.frequency_mode === 'batched'}
                onPress={() => savePreferences({ frequency_mode: 'batched' })}
                disabled={saving}
              />

              <FrequencyOption
                title="Digest"
                description="Weekly summary on Mondays"
                selected={preferences.frequency_mode === 'digest'}
                onPress={() => savePreferences({ frequency_mode: 'digest' })}
                disabled={saving}
              />
            </View>
          </>
        )}

        {/* Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Actions</Text>
        </View>

        <View style={styles.section}>
          <ActionRow
            icon="send"
            title="Send Test Notification"
            onPress={handleTestNotification}
            iconColor={Colors.primary}
          />

          <ActionRow
            icon="trash"
            title="Clear Notification History"
            onPress={handleClearHistory}
            iconColor={Colors.danger}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Time Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={parseTime(preferences.quiet_hours_start)}
          mode="time"
          is24Hour={true}
          onChange={(event: any, date?: Date) => {
            if (Platform.OS === 'android') setShowStartPicker(false);
            if (date) handleQuietHoursChange(true, date);
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={parseTime(preferences.quiet_hours_end)}
          mode="time"
          is24Hour={true}
          onChange={(event: any, date?: Date) => {
            if (Platform.OS === 'android') setShowEndPicker(false);
            if (date) handleQuietHoursChange(false, date);
          }}
        />
      )}
    </SafeAreaView>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  iconColor?: string;
}

function SettingRow({
  icon,
  title,
  description,
  value,
  onValueChange,
  disabled,
  iconColor,
}: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color={iconColor || Colors.brandGold} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: Colors.border, true: Colors.brandGold + '80' }}
        thumbColor={value ? Colors.brandGold : Colors.textTertiary}
      />
    </View>
  );
}

interface FrequencyOptionProps {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

function FrequencyOption({ title, description, selected, onPress, disabled }: FrequencyOptionProps) {
  return (
    <TouchableOpacity
      style={[styles.frequencyOption, selected && styles.frequencyOptionSelected]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.frequencyLeft}>
        <Text style={[styles.frequencyTitle, selected && styles.frequencyTitleSelected]}>
          {title}
        </Text>
        <Text style={styles.frequencyDescription}>{description}</Text>
      </View>
      {selected && <Ionicons name="checkmark-circle" size={24} color={Colors.brandGold} />}
    </TouchableOpacity>
  );
}

interface ActionRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  iconColor?: string;
}

function ActionRow({ icon, title, onPress, iconColor }: ActionRowProps) {
  return (
    <TouchableOpacity style={styles.actionRow} onPress={onPress}>
      <Ionicons name={icon} size={24} color={iconColor || Colors.textSecondary} />
      <Text style={styles.actionTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

// ============================================================================
// Utilities
// ============================================================================

function parseTime(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.subheading.fontSize,
    fontWeight: Typography.subheading.fontWeight,
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.bodyBold.fontSize,
    fontWeight: Typography.bodyBold.fontWeight,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  section: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  settingText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  settingTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.bodyBold.fontWeight,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs / 2,
  },
  settingDescription: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  timePickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.bodyBold.fontWeight,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
  },
  timePickerValue: {
    fontSize: Typography.subheading.fontSize,
    fontWeight: Typography.subheading.fontWeight,
    color: Colors.brandGold,
  },
  frequencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  frequencyOptionSelected: {
    backgroundColor: Colors.babyYellowLight,
  },
  frequencyLeft: {
    flex: 1,
  },
  frequencyTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs / 2,
  },
  frequencyTitleSelected: {
    color: Colors.brandGold,
    fontWeight: Typography.bodyBold.fontWeight,
  },
  frequencyDescription: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  actionTitle: {
    flex: 1,
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
  },
});
