/**
 * Notification History Screen
 * Sprint 20: Push Notifications - Complete System
 *
 * Displays all past push notifications sent to the user.
 * Features:
 * - Grouped by date (Today, Yesterday, This Week, Older)
 * - Tap to navigate to original screen
 * - Clear all / Clear old (>30 days)
 * - Visual severity indicators
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { handleNotificationDeepLink } from '../lib/notification-deep-linking';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';
import { trackEvent } from '../lib/analytics';

// ============================================================================
// Types
// ============================================================================

interface Notification {
  id: string;
  notification_type: string;
  severity: string | null;
  title: string;
  body: string;
  data: any;
  sent_at: string;
  delivered: boolean;
  opened: boolean;
}

interface GroupedNotifications {
  title: string;
  data: Notification[];
}

// ============================================================================
// Screen Component
// ============================================================================

export default function NotificationHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groupedNotifications, setGroupedNotifications] = useState<GroupedNotifications[]>([]);

  // -------------------------------------------------------------------------
  // Load Notifications
  // -------------------------------------------------------------------------

  const loadNotifications = async (showLoading = true) => {
    if (!user?.id) return;

    try {
      if (showLoading) setLoading(true);

      const { data, error } = await supabase
        .from('push_notification_log')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading notifications:', error);
        Alert.alert('Error', 'Failed to load notification history.');
        return;
      }

      setNotifications(data || []);
      groupNotificationsByDate(data || []);
    } catch (error) {
      console.error('Exception loading notifications:', error);
      Alert.alert('Error', 'Failed to load notification history.');
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications(false);
    }, [])
  );

  // -------------------------------------------------------------------------
  // Group Notifications by Date
  // -------------------------------------------------------------------------

  const groupNotificationsByDate = (items: Notification[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const groups: { [key: string]: Notification[] } = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      Older: [],
    };

    items.forEach((notification) => {
      const sentDate = new Date(notification.sent_at);
      const sentDay = new Date(sentDate.getFullYear(), sentDate.getMonth(), sentDate.getDate());

      if (sentDay.getTime() === today.getTime()) {
        groups.Today.push(notification);
      } else if (sentDay.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(notification);
      } else if (sentDate >= thisWeek) {
        groups['This Week'].push(notification);
      } else {
        groups.Older.push(notification);
      }
    });

    const grouped: GroupedNotifications[] = [];
    if (groups.Today.length > 0) grouped.push({ title: 'Today', data: groups.Today });
    if (groups.Yesterday.length > 0) grouped.push({ title: 'Yesterday', data: groups.Yesterday });
    if (groups['This Week'].length > 0)
      grouped.push({ title: 'This Week', data: groups['This Week'] });
    if (groups.Older.length > 0) grouped.push({ title: 'Older', data: groups.Older });

    setGroupedNotifications(grouped);
  };

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleNotificationTap = (notification: Notification) => {
    trackEvent('notification_history_tapped', {
      notification_id: notification.id,
      type: notification.notification_type,
    });

    // Mark as opened
    markAsOpened(notification.id);

    // Navigate to appropriate screen
    if (notification.data) {
      handleNotificationDeepLink(notification.data);
    }
  };

  const markAsOpened = async (notificationId: string) => {
    try {
      await supabase
        .from('push_notification_log')
        .update({ opened: true })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Error marking notification as opened:', error);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All History?',
      'This will permanently delete all notification history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('push_notification_log')
                .delete()
                .eq('user_id', user!.id);

              if (error) {
                Alert.alert('Error', 'Failed to clear history.');
                return;
              }

              setNotifications([]);
              setGroupedNotifications([]);
              trackEvent('notification_history_cleared_all');
              Alert.alert('Success', 'Notification history cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear history.');
            }
          },
        },
      ]
    );
  };

  const handleClearOld = () => {
    Alert.alert(
      'Clear Old Notifications?',
      'This will delete notifications older than 30 days.',
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
                Alert.alert('Error', 'Failed to clear old notifications.');
                return;
              }

              await loadNotifications(false);
              trackEvent('notification_history_cleared_old', { count: data });
              Alert.alert('Success', `Cleared ${data || 0} old notifications.`);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear old notifications.');
            }
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications(false);
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading notifications...</Text>
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
        <Text style={styles.headerTitle}>Notification History</Text>
        <TouchableOpacity onPress={handleClearOld} style={styles.headerAction}>
          <Ionicons name="trash-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* List */}
      {groupedNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyDescription}>
            You'll see your notification history here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={groupedNotifications}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) => (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{item.title}</Text>
              </View>
              {item.data.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onPress={() => handleNotificationTap(notification)}
                />
              ))}
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.brandGold}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Clear All Button */}
      {notifications.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.clearAllButton} onPress={handleClearAll}>
            <Ionicons name="trash" size={20} color={Colors.danger} />
            <Text style={styles.clearAllText}>Clear All History</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const icon = getNotificationIcon(notification.notification_type, notification.severity);
  const iconColor = getSeverityColor(notification.severity);
  const time = formatTime(notification.sent_at);

  return (
    <TouchableOpacity
      style={[styles.notificationItem, !notification.opened && styles.notificationItemUnread]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>

      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle} numberOfLines={1}>
          {notification.title}
        </Text>
        <Text style={styles.notificationBody} numberOfLines={2}>
          {notification.body}
        </Text>
        <View style={styles.notificationFooter}>
          <Text style={styles.notificationTime}>{time}</Text>
          {!notification.delivered && (
            <View style={styles.failedBadge}>
              <Text style={styles.failedText}>Failed</Text>
            </View>
          )}
        </View>
      </View>

      {!notification.opened && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

// ============================================================================
// Utilities
// ============================================================================

function getNotificationIcon(type: string, severity: string | null): keyof typeof Ionicons.glyphMap {
  if (type === 'cap_approaching') return 'trending-up';
  if (type === 'digest') return 'list';

  if (severity === 'critical') return 'alert-circle';
  if (severity === 'warning') return 'warning';
  return 'information-circle';
}

function getSeverityColor(severity: string | null): string {
  if (severity === 'critical') return Colors.danger;
  if (severity === 'warning') return Colors.warning;
  return Colors.primary;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) {
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return date.toLocaleDateString();
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
    flex: 1,
    textAlign: 'center',
  },
  headerAction: {
    padding: Spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.subheading.fontSize,
    fontWeight: Typography.subheading.fontWeight,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: Typography.body.fontSize,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
  },
  sectionTitle: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.captionBold.fontWeight,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  notificationItemUnread: {
    backgroundColor: Colors.babyYellowLight,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.bodyBold.fontWeight,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  notificationBody: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTime: {
    fontSize: Typography.caption.fontSize,
    color: Colors.textTertiary,
  },
  failedBadge: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    backgroundColor: Colors.danger + '20',
    borderRadius: BorderRadius.sm,
  },
  failedText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.danger,
    fontWeight: Typography.captionBold.fontWeight,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brandGold,
    marginLeft: Spacing.sm,
    marginTop: Spacing.xs,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  clearAllText: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.bodyBold.fontWeight,
    color: Colors.danger,
    marginLeft: Spacing.sm,
  },
});
