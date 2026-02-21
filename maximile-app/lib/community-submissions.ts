// =============================================================================
// MaxiMile — Community Submissions Service Layer (F24 — Sprint 13)
// =============================================================================
// Provides functions for submitting, querying, and reviewing community rate
// change reports. Used by the mobile app (user-facing) and the admin dashboard
// (review workflow).
//
// All functions use the shared Supabase client and follow the project's
// error-handling pattern: try-catch with console.warn in __DEV__.
// =============================================================================

import { supabase } from './supabase';
import type {
  CommunitySubmission,
  SubmitRateChangeParams,
  SubmitRateChangeResult,
  PendingSubmission,
  ReviewSubmissionResult,
} from './supabase-types';

// ---------------------------------------------------------------------------
// User-facing functions
// ---------------------------------------------------------------------------

/**
 * Submit a rate change report via the submit_rate_change RPC.
 *
 * The RPC handles validation, rate limiting (5/day), and dedup checks.
 * Returns { success, submission_id } on success or { success: false, error } on failure.
 */
export async function submitRateChange(
  params: SubmitRateChangeParams
): Promise<SubmitRateChangeResult> {
  try {
    const { data, error } = await supabase.rpc('submit_rate_change', {
      p_card_id: params.p_card_id,
      p_change_type: params.p_change_type,
      p_category: params.p_category ?? null,
      p_old_value: params.p_old_value,
      p_new_value: params.p_new_value,
      p_effective_date: params.p_effective_date ?? null,
      p_evidence_url: params.p_evidence_url ?? null,
      p_screenshot_path: params.p_screenshot_path ?? null,
      p_notes: params.p_notes ?? null,
    });

    if (error) {
      if (__DEV__) {
        console.warn('[community-submissions] submitRateChange error:', error.message);
      }
      return { success: false, submission_id: null, error: error.message };
    }

    return { success: true, submission_id: data as string };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (__DEV__) {
      console.warn('[community-submissions] submitRateChange exception:', message);
    }
    return { success: false, submission_id: null, error: message };
  }
}

/**
 * Get the current user's submissions, ordered by created_at DESC (newest first).
 *
 * Relies on RLS — the community_submissions_select_own policy ensures only
 * the authenticated user's rows are returned.
 */
export async function getMySubmissions(): Promise<CommunitySubmission[]> {
  try {
    const { data, error } = await supabase
      .from('community_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (__DEV__) {
        console.warn('[community-submissions] getMySubmissions error:', error.message);
      }
      return [];
    }

    return (data ?? []) as CommunitySubmission[];
  } catch (err) {
    if (__DEV__) {
      console.warn('[community-submissions] getMySubmissions exception:', err);
    }
    return [];
  }
}

/**
 * Get the count of approved or merged submissions for the current user.
 *
 * Used for the "Contributor" badge threshold: users with 3+ approved/merged
 * submissions earn contributor status.
 */
export async function getApprovedSubmissionCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('community_submissions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['approved', 'merged']);

    if (error) {
      if (__DEV__) {
        console.warn('[community-submissions] getApprovedSubmissionCount error:', error.message);
      }
      return 0;
    }

    return count ?? 0;
  } catch (err) {
    if (__DEV__) {
      console.warn('[community-submissions] getApprovedSubmissionCount exception:', err);
    }
    return 0;
  }
}

/**
 * Client-side dedup warning: check if a similar submission exists within 30 days.
 *
 * Queries community_submissions for rows matching the same card_id and
 * change_type created in the last 30 days that are not rejected.
 * This is a soft check for UX — the RPC enforces dedup via fingerprint.
 */
export async function checkDuplicateSubmission(
  cardId: string,
  changeType: string
): Promise<CommunitySubmission[]> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoff = thirtyDaysAgo.toISOString();

    const { data, error } = await supabase
      .from('community_submissions')
      .select('*')
      .eq('card_id', cardId)
      .eq('change_type', changeType)
      .neq('status', 'rejected')
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false });

    if (error) {
      if (__DEV__) {
        console.warn('[community-submissions] checkDuplicateSubmission error:', error.message);
      }
      return [];
    }

    return (data ?? []) as CommunitySubmission[];
  } catch (err) {
    if (__DEV__) {
      console.warn('[community-submissions] checkDuplicateSubmission exception:', err);
    }
    return [];
  }
}

/**
 * Upload a screenshot to Supabase Storage bucket 'submission-screenshots'.
 *
 * Reads the file from the given local URI (e.g. from expo-image-picker),
 * uploads it to `submission-screenshots/<filename>`, and returns the
 * storage path on success or null on failure.
 *
 * @param uri   - Local file URI (e.g. file:///path/to/image.jpg)
 * @param filename - Desired filename in storage (e.g. '<uuid>/screenshot.png')
 * @returns Storage path string (e.g. '<uuid>/screenshot.png') or null on error
 */
export async function uploadSubmissionScreenshot(
  uri: string,
  filename: string
): Promise<string | null> {
  try {
    // Fetch the file from the local URI and convert to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    const storagePath = filename;

    const { error } = await supabase.storage
      .from('submission-screenshots')
      .upload(storagePath, blob, {
        contentType: blob.type || 'image/jpeg',
        upsert: false,
      });

    if (error) {
      if (__DEV__) {
        console.warn('[community-submissions] uploadSubmissionScreenshot error:', error.message);
      }
      return null;
    }

    return storagePath;
  } catch (err) {
    if (__DEV__) {
      console.warn('[community-submissions] uploadSubmissionScreenshot exception:', err);
    }
    return null;
  }
}

// ---------------------------------------------------------------------------
// Admin functions (for admin dashboard web app)
// ---------------------------------------------------------------------------

/**
 * Get all pending and under_review submissions via the get_pending_submissions RPC.
 *
 * Returns submissions joined with card name and bank, ordered by created_at ASC
 * (oldest first — FIFO review queue).
 *
 * NOTE: Access control for admin functions should be enforced at the
 * application layer (check user role before calling).
 */
export async function getPendingSubmissions(): Promise<PendingSubmission[]> {
  try {
    const { data, error } = await supabase.rpc('get_pending_submissions');

    if (error) {
      if (__DEV__) {
        console.warn('[community-submissions] getPendingSubmissions error:', error.message);
      }
      return [];
    }

    // Map the RPC result to PendingSubmission shape
    // The RPC returns submission_id instead of id, so we remap
    const submissions: PendingSubmission[] = ((data as any[]) ?? []).map((row) => ({
      id: row.submission_id,
      user_id: row.user_id,
      card_id: row.card_id,
      change_type: row.change_type,
      category: row.category,
      old_value: row.old_value,
      new_value: row.new_value,
      effective_date: row.effective_date,
      evidence_url: row.evidence_url,
      screenshot_path: row.screenshot_path,
      notes: row.notes,
      status: row.status,
      reviewer_notes: null,
      reviewed_at: null,
      dedup_fingerprint: row.dedup_fingerprint,
      created_at: row.created_at,
      card_name: row.card_name,
      card_bank: row.card_bank,
    }));

    return submissions;
  } catch (err) {
    if (__DEV__) {
      console.warn('[community-submissions] getPendingSubmissions exception:', err);
    }
    return [];
  }
}

/**
 * Approve or reject a submission via the review_submission RPC.
 *
 * On approval, the RPC inserts a new row into rate_changes with
 * detection_source = 'community' and returns the rate_change_id.
 *
 * @param submissionId  - UUID of the submission to review
 * @param action        - 'approve' or 'reject'
 * @param reviewerNotes - Optional notes from the reviewer
 */
export async function reviewSubmission(
  submissionId: string,
  action: 'approve' | 'reject',
  reviewerNotes?: string
): Promise<ReviewSubmissionResult> {
  try {
    const { data, error } = await supabase.rpc('review_submission', {
      p_submission_id: submissionId,
      p_action: action,
      p_reviewer_notes: reviewerNotes ?? null,
    });

    if (error) {
      if (__DEV__) {
        console.warn('[community-submissions] reviewSubmission error:', error.message);
      }
      return {
        success: false,
        action: action === 'approve' ? 'approved' : 'rejected',
        submission_id: submissionId,
        error: error.message,
      };
    }

    // The RPC returns JSONB — parse the result
    const result = data as Record<string, unknown>;

    return {
      success: result.success as boolean,
      action: result.action as 'approved' | 'rejected',
      submission_id: result.submission_id as string,
      rate_change_id: result.rate_change_id as string | undefined,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (__DEV__) {
      console.warn('[community-submissions] reviewSubmission exception:', message);
    }
    return {
      success: false,
      action: action === 'approve' ? 'approved' : 'rejected',
      submission_id: submissionId,
      error: message,
    };
  }
}
