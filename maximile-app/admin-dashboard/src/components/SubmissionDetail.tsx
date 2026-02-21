// =============================================================================
// SubmissionDetail — Detail view with review actions
// =============================================================================
// DRD Section 16.4.4–16.4.8: Full submission data display with approve,
// reject, and edit-and-approve actions. Duplicate detection display.
// Review history log.
// =============================================================================

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import StatusBadge, { type SubmissionStatus } from './StatusBadge';
import type { Submission } from './SubmissionList';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DuplicateSubmission {
  id: string;
  status: SubmissionStatus;
  created_at: string;
  old_value: string;
  new_value: string;
}

interface DuplicateRateChange {
  id: string;
  created_at: string;
  change_type: string;
}

interface ReviewHistoryEntry {
  timestamp: string;
  action: string;
  notes: string | null;
}

interface SubmissionDetailProps {
  submission: Submission;
  onBack: () => void;
  onActionComplete: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CHANGE_TYPE_LABELS: Record<string, string> = {
  earn_rate: 'Earn Rate Change',
  cap_change: 'Cap Adjustment',
  devaluation: 'Program Devaluation',
  partner_change: 'Partner Change',
  fee_change: 'Fee Change',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SubmissionDetail({
  submission: initialSubmission,
  onBack,
  onActionComplete,
}: SubmissionDetailProps) {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const [submission, setSubmission] = useState(initialSubmission);
  const [adminNotes, setAdminNotes] = useState('');
  const [severity, setSeverity] = useState('warning');
  const [alertTitle, setAlertTitle] = useState(
    `${CHANGE_TYPE_LABELS[initialSubmission.change_type] ?? initialSubmission.change_type}: ${initialSubmission.cards?.name ?? 'Unknown'}`
  );
  const [alertBody, setAlertBody] = useState(
    `${initialSubmission.category ? initialSubmission.category + ' ' : ''}${initialSubmission.old_value} to ${initialSubmission.new_value}`
  );

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editOldValue, setEditOldValue] = useState(initialSubmission.old_value);
  const [editNewValue, setEditNewValue] = useState(initialSubmission.new_value);
  const [editCategory, setEditCategory] = useState(initialSubmission.category ?? '');
  const [editEffectiveDate, setEditEffectiveDate] = useState(
    initialSubmission.effective_date ?? ''
  );

  // Duplicates
  const [duplicateSubmissions, setDuplicateSubmissions] = useState<DuplicateSubmission[]>([]);
  const [duplicateRateChanges, setDuplicateRateChanges] = useState<DuplicateRateChange[]>([]);

  // Review history
  const [reviewHistory, setReviewHistory] = useState<ReviewHistoryEntry[]>([]);

  // Action states
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Fetch duplicates on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    const fetchDuplicates = async () => {
      // Find similar submissions (same card + change type within 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: dupSubs } = await supabase
        .from('community_submissions')
        .select('id, status, created_at, old_value, new_value')
        .eq('card_id', submission.card_id)
        .eq('change_type', submission.change_type)
        .neq('id', submission.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (dupSubs) {
        setDuplicateSubmissions(dupSubs as DuplicateSubmission[]);
      }

      // Find matching rate_changes (same card + change type within 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: dupChanges } = await supabase
        .from('rate_changes')
        .select('id, created_at, change_type')
        .eq('card_id', submission.card_id)
        .eq('change_type', submission.change_type)
        .gte('created_at', ninetyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (dupChanges) {
        setDuplicateRateChanges(dupChanges as DuplicateRateChange[]);
      }
    };

    fetchDuplicates();
  }, [submission.id, submission.card_id, submission.change_type]);

  // -------------------------------------------------------------------------
  // Build review history from submission data
  // -------------------------------------------------------------------------
  useEffect(() => {
    const history: ReviewHistoryEntry[] = [];

    if (submission.status !== 'pending') {
      // If under_review, approved, rejected, or merged, there was at least one action
      if (submission.reviewed_at) {
        const action =
          submission.status === 'rejected'
            ? 'Rejected'
            : submission.status === 'approved'
              ? 'Approved'
              : submission.status === 'merged'
                ? 'Approved and merged'
                : 'Changed status to "under_review"';

        history.push({
          timestamp: submission.reviewed_at,
          action,
          notes: submission.reviewer_notes,
        });
      }
    }

    setReviewHistory(history);
  }, [submission]);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  function formatDateTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + ' at ' + d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatDateShort(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  function truncateUserId(userId: string): string {
    if (userId.length <= 12) return userId;
    return userId.slice(0, 6) + '...' + userId.slice(-6);
  }

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  const handleApprove = async () => {
    setProcessing(true);
    setActionError(null);

    try {
      // If editing, update the submission first
      if (isEditing) {
        const { error: updateError } = await supabase
          .from('community_submissions')
          .update({
            old_value: editOldValue,
            new_value: editNewValue,
            category: editCategory.trim() || null,
            effective_date: editEffectiveDate.trim() || null,
          })
          .eq('id', submission.id);

        if (updateError) {
          setActionError(`Failed to update submission: ${updateError.message}`);
          setProcessing(false);
          return;
        }
      }

      // Call the review_submission RPC
      const { error } = await supabase.rpc('review_submission', {
        p_submission_id: submission.id,
        p_action: 'approve',
        p_reviewer_notes: adminNotes.trim() || null,
      });

      if (error) {
        setActionError(`Approval failed: ${error.message}`);
      } else {
        setActionSuccess('Submission approved and merged successfully.');
        // Update local state
        setSubmission({
          ...submission,
          status: 'merged' as SubmissionStatus,
          reviewer_notes: adminNotes.trim() || null,
          reviewed_at: new Date().toISOString(),
          ...(isEditing
            ? {
                old_value: editOldValue,
                new_value: editNewValue,
                category: editCategory.trim() || null,
                effective_date: editEffectiveDate.trim() || null,
              }
            : {}),
        });
        setIsEditing(false);
        // Notify parent to refresh list
        setTimeout(() => onActionComplete(), 1500);
      }
    } catch (err) {
      setActionError('An unexpected error occurred.');
      console.error(err);
    } finally {
      setProcessing(false);
      setConfirmAction(null);
    }
  };

  const handleReject = async () => {
    if (!adminNotes.trim()) {
      setValidationError('Please provide a reason for rejection.');
      return;
    }

    setProcessing(true);
    setActionError(null);
    setValidationError(null);

    try {
      const { error } = await supabase.rpc('review_submission', {
        p_submission_id: submission.id,
        p_action: 'reject',
        p_reviewer_notes: adminNotes.trim(),
      });

      if (error) {
        setActionError(`Rejection failed: ${error.message}`);
      } else {
        setActionSuccess('Submission rejected.');
        setSubmission({
          ...submission,
          status: 'rejected' as SubmissionStatus,
          reviewer_notes: adminNotes.trim(),
          reviewed_at: new Date().toISOString(),
        });
        setTimeout(() => onActionComplete(), 1500);
      }
    } catch (err) {
      setActionError('An unexpected error occurred.');
      console.error(err);
    } finally {
      setProcessing(false);
      setConfirmAction(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditOldValue(submission.old_value);
    setEditNewValue(submission.new_value);
    setEditCategory(submission.category ?? '');
    setEditEffectiveDate(submission.effective_date ?? '');
  };

  // Can take actions only on pending or under_review submissions
  const canAct =
    submission.status === 'pending' || submission.status === 'under_review';

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen pb-12">
      {/* Back button */}
      <div className="px-6 py-4 border-b border-gold-tint glass">
        <button
          onClick={onBack}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          &larr; Back to List
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Header: Submission ID + Status */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-text-primary">
            Submission #{submission.id.slice(0, 8)}
          </h2>
          <StatusBadge status={submission.status} size="md" />
        </div>
        <p className="text-[13px] text-text-secondary mb-6">
          Submitted by: {truncateUserId(submission.user_id)} on{' '}
          {formatDateTime(submission.created_at)}
        </p>

        {/* Success / Error toasts */}
        {actionSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            {actionSuccess}
          </div>
        )}
        {actionError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {actionError}
          </div>
        )}

        {/* ---- SUBMISSION DETAILS ---- */}
        <div className="bg-white border border-gold-tint rounded-xl shadow-sm p-6 mb-4">
          <h3 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-4">
            Submission Details
          </h3>

          <div className="space-y-3">
            <DetailRow
              label="Card"
              value={`${submission.cards?.name ?? 'Unknown'} (${submission.cards?.bank ?? ''})`}
            />
            <DetailRow
              label="Change Type"
              value={CHANGE_TYPE_LABELS[submission.change_type] ?? submission.change_type}
            />

            {/* Category -- editable in edit mode */}
            {isEditing ? (
              <div className="flex mb-3">
                <span className="text-sm text-text-secondary w-[140px] flex-shrink-0">
                  Category:
                </span>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="text-sm text-text-primary font-medium border border-surface-border rounded-lg px-2 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
                  placeholder="e.g. Dining, Online"
                />
              </div>
            ) : (
              <DetailRow
                label="Category"
                value={submission.category ?? 'N/A'}
              />
            )}

            {/* Old Value -- editable */}
            {isEditing ? (
              <div className="flex mb-3">
                <span className="text-sm text-text-secondary w-[140px] flex-shrink-0">
                  Old Value:
                </span>
                <input
                  type="text"
                  value={editOldValue}
                  onChange={(e) => setEditOldValue(e.target.value)}
                  className="text-sm text-text-primary font-medium border border-surface-border rounded-lg px-2 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
                />
              </div>
            ) : (
              <DetailRow label="Old Value" value={submission.old_value} />
            )}

            {/* New Value -- editable */}
            {isEditing ? (
              <div className="flex mb-3">
                <span className="text-sm text-text-secondary w-[140px] flex-shrink-0">
                  New Value:
                </span>
                <input
                  type="text"
                  value={editNewValue}
                  onChange={(e) => setEditNewValue(e.target.value)}
                  className="text-sm text-text-primary font-medium border border-surface-border rounded-lg px-2 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
                />
              </div>
            ) : (
              <DetailRow label="New Value" value={submission.new_value} />
            )}

            {/* Effective Date -- editable */}
            {isEditing ? (
              <div className="flex mb-3">
                <span className="text-sm text-text-secondary w-[140px] flex-shrink-0">
                  Effective Date:
                </span>
                <input
                  type="date"
                  value={editEffectiveDate}
                  onChange={(e) => setEditEffectiveDate(e.target.value)}
                  className="text-sm text-text-primary font-medium border border-surface-border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
                />
              </div>
            ) : (
              <DetailRow
                label="Effective Date"
                value={submission.effective_date ?? 'Not specified'}
              />
            )}

            {/* Evidence URL */}
            <div className="flex">
              <span className="text-sm text-text-secondary w-[140px] flex-shrink-0">
                Evidence URL:
              </span>
              {submission.evidence_url ? (
                <a
                  href={submission.evidence_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline break-all"
                >
                  {submission.evidence_url}
                </a>
              ) : (
                <span className="text-sm text-text-primary font-medium">
                  None provided
                </span>
              )}
            </div>

            {/* Screenshot */}
            {submission.screenshot_path && (
              <div className="flex">
                <span className="text-sm text-text-secondary w-[140px] flex-shrink-0">
                  Screenshot:
                </span>
                <div>
                  <img
                    src={submission.screenshot_path}
                    alt="Evidence screenshot"
                    className="w-20 h-20 object-cover rounded-md border border-surface-border cursor-pointer"
                    onClick={() => window.open(submission.screenshot_path!, '_blank')}
                  />
                  <button
                    onClick={() => window.open(submission.screenshot_path!, '_blank')}
                    className="text-xs text-primary hover:underline mt-1 block"
                  >
                    View Full Size
                  </button>
                </div>
              </div>
            )}

            {/* Notes */}
            <DetailRow
              label="Notes"
              value={submission.notes ?? 'None'}
            />
          </div>
        </div>

        {/* ---- DUPLICATE CHECK ---- */}
        <div className="bg-white border border-gold-tint rounded-xl shadow-sm p-6 mb-4">
          <h3 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-4">
            Duplicate Check
          </h3>

          {duplicateSubmissions.length === 0 && duplicateRateChanges.length === 0 && (
            <p className="text-sm text-green-600">
              No potential duplicates detected.
            </p>
          )}

          {duplicateSubmissions.map((dup) => (
            <div
              key={dup.id}
              className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-2"
            >
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-amber-800">
                  <strong>Possible duplicate:</strong> Submission #
                  {dup.id.slice(0, 8)} ({dup.status},{' '}
                  {formatDateShort(dup.created_at)}). Same card + change type.
                  Old: {dup.old_value} &rarr; New: {dup.new_value}
                </div>
              </div>
            </div>
          ))}

          {duplicateRateChanges.map((dup) => (
            <div
              key={dup.id}
              className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-2"
            >
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-amber-800">
                  A matching rate change record already exists (created{' '}
                  {formatDateShort(dup.created_at)}). This submission may be
                  redundant.
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ---- ADMIN ACTIONS ---- */}
        {canAct && (
          <div className="bg-white border border-gold-tint rounded-xl shadow-sm p-6 mb-4">
            <h3 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-4">
              Admin Actions
            </h3>

            {/* Admin notes */}
            <label className="block text-sm text-text-secondary mb-1">
              Admin Notes:
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => {
                setAdminNotes(e.target.value);
                setValidationError(null);
              }}
              placeholder="Add review notes..."
              className="w-full min-h-[80px] border border-surface-border rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold resize-y mb-4"
            />

            {validationError && (
              <p className="text-sm text-red-600 mb-3">{validationError}</p>
            )}

            {/* Severity + Alert fields (for approve) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  Severity (for approve):
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full h-9 border border-surface-border rounded-lg px-3 text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  Alert title:
                </label>
                <input
                  type="text"
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  className="w-full h-9 border border-surface-border rounded-lg px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  Alert body:
                </label>
                <input
                  type="text"
                  value={alertBody}
                  onChange={(e) => setAlertBody(e.target.value)}
                  className="w-full h-9 border border-surface-border rounded-lg px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
                />
              </div>
            </div>

            {/* Action buttons */}
            {!confirmAction && !isEditing && (
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAction('approve')}
                  disabled={processing}
                  className="bg-[#34A853] text-white font-semibold text-sm rounded-md px-5 py-2 hover:bg-[#2D9249] transition-colors disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={processing}
                  className="bg-blue-500 text-white font-semibold text-sm rounded-md px-5 py-2 hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  Edit &amp; Approve
                </button>
                <button
                  onClick={() => {
                    if (!adminNotes.trim()) {
                      setValidationError(
                        'Please provide a reason for rejection.'
                      );
                      return;
                    }
                    setConfirmAction('reject');
                  }}
                  disabled={processing}
                  className="bg-white text-[#EA4335] border border-[#EA4335] font-semibold text-sm rounded-md px-5 py-2 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            )}

            {/* Edit mode buttons */}
            {isEditing && !confirmAction && (
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAction('approve')}
                  disabled={processing}
                  className="bg-[#34A853] text-white font-semibold text-sm rounded-md px-5 py-2 hover:bg-[#2D9249] transition-colors disabled:opacity-50"
                >
                  Save &amp; Approve
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={processing}
                  className="bg-white text-text-secondary border border-surface-border font-semibold text-sm rounded-md px-5 py-2 hover:bg-surface-bg transition-colors disabled:opacity-50"
                >
                  Cancel Edit
                </button>
              </div>
            )}

            {/* Confirm dialog */}
            {confirmAction && (
              <div className="bg-surface-bg border border-gold-tint rounded-xl p-4 mt-3">
                <p className="text-sm text-text-primary mb-3">
                  {confirmAction === 'approve'
                    ? 'Approve this submission? This will create a rate_changes record visible to all affected users.'
                    : 'Reject this submission?'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={
                      confirmAction === 'approve' ? handleApprove : handleReject
                    }
                    disabled={processing}
                    className={`font-semibold text-sm rounded-md px-5 py-2 transition-colors disabled:opacity-50 ${
                      confirmAction === 'approve'
                        ? 'bg-[#34A853] text-white hover:bg-[#2D9249]'
                        : 'bg-[#EA4335] text-white hover:bg-red-600'
                    }`}
                  >
                    {processing ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      `Yes, ${confirmAction === 'approve' ? 'Approve' : 'Reject'}`
                    )}
                  </button>
                  <button
                    onClick={() => setConfirmAction(null)}
                    disabled={processing}
                    className="bg-white text-text-secondary border border-surface-border font-semibold text-sm rounded-md px-5 py-2 hover:bg-surface-bg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---- REVIEW HISTORY ---- */}
        <div className="bg-white border border-gold-tint rounded-xl shadow-sm p-6">
          <h3 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-4">
            Review History
          </h3>

          {reviewHistory.length === 0 && (
            <p className="text-sm text-text-tertiary">No review actions yet.</p>
          )}

          {reviewHistory.map((entry, idx) => (
            <div
              key={idx}
              className="py-2 border-b border-surface-border-light last:border-b-0"
            >
              <div className="flex items-baseline gap-2 text-[13px]">
                <span className="font-mono text-[12px] text-text-tertiary">
                  {new Date(entry.timestamp).toISOString().slice(0, 16).replace('T', ' ')}
                </span>
                <span className="text-text-secondary">
                  &mdash; {entry.action}
                  {entry.notes ? `. Notes: "${entry.notes}"` : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DetailRow helper component
// ---------------------------------------------------------------------------

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex">
      <span className="text-sm text-text-secondary w-[140px] flex-shrink-0">
        {label}:
      </span>
      <span className="text-sm text-text-primary font-medium">{value}</span>
    </div>
  );
}
