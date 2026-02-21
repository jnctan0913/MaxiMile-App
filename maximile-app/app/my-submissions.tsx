import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { track } from '../lib/analytics';
import { handleSupabaseError } from '../lib/error-handler';
import ContributorBadge from '../components/ContributorBadge';
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
} from '../constants/theme';
import type { SubmissionStatus } from '../lib/supabase-types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SubmissionRow {
  id: string;
  change_type: string;
  category: string | null;
  old_value: string;
  new_value: string;
  effective_date: string | null;
  status: SubmissionStatus;
  reviewer_notes: string | null;
  created_at: string;
  cards: {
    name: string;
    bank: string;
  } | null;
}

// ---------------------------------------------------------------------------
// Status badge config
// ---------------------------------------------------------------------------

interface StatusConfig {
  label: string;
  backgroundColor: string;
  textColor: string;
}

const STATUS_CONFIG: Record<SubmissionStatus, StatusConfig> = {
  pending: {
    label: 'Pending',
    backgroundColor: 'rgba(251, 188, 4, 0.12)',
    textColor: '#FBBC04',
  },
  under_review: {
    label: 'Under Review',
    backgroundColor: 'rgba(74, 144, 217, 0.12)',
    textColor: '#4A90D9',
  },
  approved: {
    label: 'Approved',
    backgroundColor: 'rgba(52, 168, 83, 0.12)',
    textColor: '#34A853',
  },
  rejected: {
    label: 'Rejected',
    backgroundColor: 'rgba(234, 67, 53, 0.12)',
    textColor: '#EA4335',
  },
  merged: {
    label: 'Merged',
    backgroundColor: 'rgba(197, 165, 90, 0.12)',
    textColor: '#C5A55A',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CHANGE_TYPE_LABELS: Record<string, string> = {
  earn_rate: 'Earn Rate Change',
  cap_change: 'Cap Adjustment',
  devaluation: 'Program Devaluation',
  partner_change: 'New Card Launch',
  fee_change: 'Card Discontinued',
};

function formatChangeType(type: string): string {
  return (
    CHANGE_TYPE_LABELS[type] ??
    type
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/**
 * MySubmissionsScreen -- Full screen showing user's rate change submissions.
 *
 * DRD Section 16: Displays a list of community submissions with status badges,
 * empty state, and contributor badge for users with 3+ approved submissions.
 * Follows the same full-screen pattern as feedback.tsx.
 */
export default function MySubmissionsScreen() {
  const { user } = useAuth();

  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvedCount, setApprovedCount] = useState(0);

  // -----------------------------------------------------------------------
  // Fetch submissions on focus
  // -----------------------------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      const fetchSubmissions = async () => {
        try {
          const { data, error } = await supabase
            .from('community_submissions')
            .select('*, cards(name, bank)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) {
            const msg = handleSupabaseError(error);
            if (__DEV__) console.warn('Submissions fetch error:', msg);
          }

          if (data) {
            const rows = data as unknown as SubmissionRow[];
            setSubmissions(rows);
            setApprovedCount(
              rows.filter((s) => s.status === 'approved' || s.status === 'merged').length
            );

            // Track screen view with submission count
            track('my_submissions_viewed', { submission_count: rows.length }, user.id);
          }

          setLoading(false);
        } catch {
          setLoading(false);
          if (__DEV__) console.warn('Submissions fetch failed');
        }
      };

      fetchSubmissions();
    }, [user])
  );

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
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
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Page title */}
            <Text style={styles.screenTitle}>My Submissions</Text>
            <Text style={styles.screenSubtitle}>
              Track your rate change reports
            </Text>

            {/* Contributor badge */}
            {approvedCount >= 3 && (
              <View style={styles.contributorRow}>
                <ContributorBadge approvedCount={approvedCount} />
              </View>
            )}

            {/* Loading state */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.brandGold} />
              </View>
            )}

            {/* Empty state */}
            {!loading && submissions.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons
                  name="flag-outline"
                  size={48}
                  color={Colors.textTertiary}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>No submissions yet</Text>
                <Text style={styles.emptySubtitle}>
                  Report rate changes you discover to help the community
                </Text>
              </View>
            )}

            {/* Submission cards */}
            {!loading &&
              submissions.map((submission) => {
                const statusConfig = STATUS_CONFIG[submission.status] ?? STATUS_CONFIG.pending;
                return (
                  <View key={submission.id} style={styles.submissionCard}>
                    {/* Card name + status badge row */}
                    <View style={styles.cardHeader}>
                      <View style={styles.cardNameBlock}>
                        <Text style={styles.cardBank}>
                          {submission.cards?.bank ?? 'Unknown Bank'}
                        </Text>
                        <Text style={styles.cardName} numberOfLines={1}>
                          {submission.cards?.name ?? 'Unknown Card'}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusConfig.backgroundColor },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            { color: statusConfig.textColor },
                          ]}
                        >
                          {statusConfig.label}
                        </Text>
                      </View>
                    </View>

                    {/* Change type */}
                    <Text style={styles.changeType}>
                      {formatChangeType(submission.change_type)}
                      {submission.category ? ` \u2022 ${submission.category}` : ''}
                    </Text>

                    {/* Old -> New values */}
                    <View style={styles.valueRow}>
                      <Text style={styles.oldValue}>{submission.old_value}</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={14}
                        color={Colors.textSecondary}
                        style={styles.arrowIcon}
                      />
                      <Text style={styles.newValue}>{submission.new_value}</Text>
                    </View>

                    {/* Date */}
                    <Text style={styles.dateText}>
                      Submitted {formatDate(submission.created_at)}
                    </Text>

                    {/* Reviewer notes (shown on rejection) */}
                    {submission.status === 'rejected' && submission.reviewer_notes && (
                      <View style={styles.reviewerNotesContainer}>
                        <Ionicons
                          name="information-circle-outline"
                          size={14}
                          color={Colors.danger}
                          style={styles.reviewerNotesIcon}
                        />
                        <Text style={styles.reviewerNotesText}>
                          {submission.reviewer_notes}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
          </ScrollView>
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

  // Contributor badge
  contributorRow: {
    marginBottom: Spacing.lg,
  },

  // Loading
  loadingContainer: {
    paddingVertical: Spacing.xxxl,
    alignItems: 'center',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.subheading,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Submission card
  submissionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(197, 165, 90, 0.2)',
    ...Shadows.glass,
  },

  // Card header (name + status)
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cardNameBlock: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  cardBank: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },

  // Status badge — pill shape like EligibilityBadge
  statusBadge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    height: 22,
    justifyContent: 'center',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },

  // Change type
  changeType: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },

  // Value row (old -> new)
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  oldValue: {
    ...Typography.caption,
    color: Colors.danger,
    textDecorationLine: 'line-through',
  },
  arrowIcon: {
    marginHorizontal: Spacing.sm,
  },
  newValue: {
    ...Typography.captionBold,
    color: Colors.textPrimary,
  },

  // Date
  dateText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },

  // Reviewer notes
  reviewerNotesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  reviewerNotesIcon: {
    marginRight: Spacing.xs,
    marginTop: 2,
  },
  reviewerNotesText: {
    ...Typography.caption,
    color: Colors.danger,
    flex: 1,
    fontStyle: 'italic',
  },
});
