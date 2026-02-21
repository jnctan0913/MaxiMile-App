// =============================================================================
// DetectionDetail — Detail view for an AI-detected change
// =============================================================================
// T15.11: Source info, AI classification, confidence score, severity badge,
// AI analysis notes, and admin actions (Confirm & Publish, Reject, Edit & Publish).
// Data from: supabase.from('detected_changes')
//   .select('*, source_snapshots(source_configs(url, bank_name))')
// =============================================================================

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import StatusBadge, { type DetectionStatus } from './StatusBadge';
import type { Detection } from './DetectionList';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DetectionDetailProps {
  detection: Detection;
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

const SEVERITY_CONFIG: Record<string, { label: string; textClass: string; bgClass: string }> = {
  critical: { label: 'Critical', textClass: 'text-red-700', bgClass: 'bg-red-50 border-red-200' },
  warning: { label: 'Warning', textClass: 'text-amber-700', bgClass: 'bg-amber-50 border-amber-200' },
  info: { label: 'Info', textClass: 'text-blue-700', bgClass: 'bg-blue-50 border-blue-200' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function confidenceColor(confidence: number): string {
  if (confidence >= 85) return 'text-green-700';
  if (confidence >= 50) return 'text-amber-700';
  return 'text-red-700';
}

function confidenceBgColor(confidence: number): string {
  if (confidence >= 85) return 'bg-green-50 border-green-200';
  if (confidence >= 50) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) +
    ' at ' +
    d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DetectionDetail({
  detection: initialDetection,
  onBack,
  onActionComplete,
}: DetectionDetailProps) {
  // State
  const [detection, setDetection] = useState(initialDetection);
  const [reviewerNotes, setReviewerNotes] = useState('');

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editCardName, setEditCardName] = useState(initialDetection.card_name ?? '');
  const [editChangeType, setEditChangeType] = useState(initialDetection.change_type);
  const [editCategory, setEditCategory] = useState(initialDetection.category ?? '');
  const [editOldValue, setEditOldValue] = useState(initialDetection.old_value ?? '');
  const [editNewValue, setEditNewValue] = useState(initialDetection.new_value ?? '');
  const [editEffectiveDate, setEditEffectiveDate] = useState(
    initialDetection.effective_date ?? ''
  );
  const [editSeverity, setEditSeverity] = useState(initialDetection.severity ?? 'warning');

  // Action states
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'confirm' | 'reject' | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Derived
  const bankName =
    detection.bank_name ??
    detection.source_snapshots?.source_configs?.bank_name ??
    'Unknown';
  const sourceUrl = detection.source_snapshots?.source_configs?.url ?? null;
  const snapshotAt = detection.source_snapshots?.snapshot_at ?? null;
  const severityCfg = SEVERITY_CONFIG[detection.severity ?? ''];
  const canAct = detection.status === 'detected' || detection.status === 'confirmed';

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  const handleConfirmPublish = async () => {
    setProcessing(true);
    setActionError(null);

    try {
      // If editing, update the detection first
      const updatePayload: Record<string, unknown> = {
        status: 'published' as DetectionStatus,
        reviewer_notes: reviewerNotes.trim() || null,
        reviewed_at: new Date().toISOString(),
      };

      if (isEditing) {
        updatePayload.card_name = editCardName.trim() || null;
        updatePayload.change_type = editChangeType;
        updatePayload.category = editCategory.trim() || null;
        updatePayload.old_value = editOldValue.trim() || null;
        updatePayload.new_value = editNewValue.trim() || null;
        updatePayload.effective_date = editEffectiveDate.trim() || null;
        updatePayload.severity = editSeverity;
      }

      // Update detected_changes status to published
      const { error: updateError } = await supabase
        .from('detected_changes')
        .update(updatePayload)
        .eq('id', detection.id);

      if (updateError) {
        setActionError(`Failed to publish: ${updateError.message}`);
        setProcessing(false);
        return;
      }

      // Insert into rate_changes
      const { error: insertError } = await supabase.from('rate_changes').insert({
        card_id: detection.card_id,
        change_type: isEditing ? editChangeType : detection.change_type,
        category: isEditing
          ? editCategory.trim() || null
          : detection.category,
        old_value: isEditing
          ? editOldValue.trim() || null
          : detection.old_value,
        new_value: isEditing
          ? editNewValue.trim() || null
          : detection.new_value,
        effective_date: isEditing
          ? editEffectiveDate.trim() || null
          : detection.effective_date,
        severity: isEditing ? editSeverity : detection.severity ?? 'warning',
        detection_source: 'automated',
        alert_title: `${CHANGE_TYPE_LABELS[isEditing ? editChangeType : detection.change_type] ?? detection.change_type}: ${isEditing ? editCardName : detection.card_name ?? 'Unknown'}`,
        alert_body: `${(isEditing ? editCategory : detection.category) ? (isEditing ? editCategory : detection.category) + ' ' : ''}${isEditing ? editOldValue : detection.old_value ?? ''} to ${isEditing ? editNewValue : detection.new_value ?? ''}`,
      });

      if (insertError) {
        setActionError(`Published detection but failed to create rate_change: ${insertError.message}`);
        setProcessing(false);
        return;
      }

      setActionSuccess('Detection confirmed and published to rate_changes.');
      setDetection({
        ...detection,
        status: 'published' as DetectionStatus,
        reviewer_notes: reviewerNotes.trim() || null,
        reviewed_at: new Date().toISOString(),
        ...(isEditing
          ? {
              card_name: editCardName.trim() || null,
              change_type: editChangeType,
              category: editCategory.trim() || null,
              old_value: editOldValue.trim() || null,
              new_value: editNewValue.trim() || null,
              effective_date: editEffectiveDate.trim() || null,
              severity: editSeverity,
            }
          : {}),
      });
      setIsEditing(false);
      setTimeout(() => onActionComplete(), 1500);
    } catch (err) {
      setActionError('An unexpected error occurred.');
      console.error(err);
    } finally {
      setProcessing(false);
      setConfirmAction(null);
    }
  };

  const handleReject = async () => {
    if (!reviewerNotes.trim()) {
      setValidationError('Please provide a reason for rejection.');
      return;
    }

    setProcessing(true);
    setActionError(null);
    setValidationError(null);

    try {
      const { error } = await supabase
        .from('detected_changes')
        .update({
          status: 'rejected' as DetectionStatus,
          reviewer_notes: reviewerNotes.trim(),
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', detection.id);

      if (error) {
        setActionError(`Rejection failed: ${error.message}`);
      } else {
        setActionSuccess('Detection rejected.');
        setDetection({
          ...detection,
          status: 'rejected' as DetectionStatus,
          reviewer_notes: reviewerNotes.trim(),
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
    setEditCardName(detection.card_name ?? '');
    setEditChangeType(detection.change_type);
    setEditCategory(detection.category ?? '');
    setEditOldValue(detection.old_value ?? '');
    setEditNewValue(detection.new_value ?? '');
    setEditEffectiveDate(detection.effective_date ?? '');
    setEditSeverity(detection.severity ?? 'warning');
  };

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
          &larr; Back to Detections
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Header: Detection ID + Status */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-text-primary">
            Detection #{detection.id.slice(0, 8)}
          </h2>
          <StatusBadge status={detection.status} size="md" />
        </div>
        <p className="text-[13px] text-text-secondary mb-6">
          Detected on {formatDateTime(detection.created_at)}
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

        {/* ---- SOURCE INFO ---- */}
        <div className="bg-white border border-gold-tint rounded-xl shadow-sm p-6 mb-4">
          <h3 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-4">
            Source Information
          </h3>
          <div className="space-y-3">
            <DetailRow label="Bank" value={bankName} />
            <div className="flex">
              <span className="text-sm text-text-secondary w-[140px] flex-shrink-0">
                Source URL:
              </span>
              {sourceUrl ? (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline break-all"
                >
                  {sourceUrl}
                </a>
              ) : (
                <span className="text-sm text-text-primary font-medium">
                  N/A
                </span>
              )}
            </div>
            <DetailRow
              label="Snapshot"
              value={snapshotAt ? formatDateTime(snapshotAt) : 'N/A'}
            />
          </div>
        </div>

        {/* ---- AI CLASSIFICATION ---- */}
        <div className="bg-white border border-gold-tint rounded-xl shadow-sm p-6 mb-4">
          <h3 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-4">
            AI Classification
          </h3>

          <div className="space-y-3">
            {/* Card Name */}
            {isEditing ? (
              <EditableRow
                label="Card Name"
                value={editCardName}
                onChange={setEditCardName}
              />
            ) : (
              <DetailRow
                label="Card Name"
                value={detection.card_name ?? 'Unknown'}
              />
            )}

            {/* Change Type */}
            {isEditing ? (
              <div className="flex">
                <span className="text-sm text-text-secondary w-[140px] flex-shrink-0">
                  Change Type:
                </span>
                <select
                  value={editChangeType}
                  onChange={(e) => setEditChangeType(e.target.value)}
                  className="text-sm text-text-primary font-medium border border-surface-border rounded-lg px-2 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
                >
                  <option value="earn_rate">Earn Rate Change</option>
                  <option value="cap_change">Cap Adjustment</option>
                  <option value="devaluation">Program Devaluation</option>
                  <option value="partner_change">Partner Change</option>
                  <option value="fee_change">Fee Change</option>
                </select>
              </div>
            ) : (
              <DetailRow
                label="Change Type"
                value={CHANGE_TYPE_LABELS[detection.change_type] ?? detection.change_type}
              />
            )}

            {/* Category */}
            {isEditing ? (
              <EditableRow
                label="Category"
                value={editCategory}
                onChange={setEditCategory}
                placeholder="e.g. Dining, Online"
              />
            ) : (
              <DetailRow
                label="Category"
                value={detection.category ?? 'N/A'}
              />
            )}

            {/* Old Value */}
            {isEditing ? (
              <EditableRow
                label="Old Value"
                value={editOldValue}
                onChange={setEditOldValue}
              />
            ) : (
              <DetailRow
                label="Old Value"
                value={detection.old_value ?? 'N/A'}
              />
            )}

            {/* New Value */}
            {isEditing ? (
              <EditableRow
                label="New Value"
                value={editNewValue}
                onChange={setEditNewValue}
              />
            ) : (
              <DetailRow
                label="New Value"
                value={detection.new_value ?? 'N/A'}
              />
            )}

            {/* Effective Date */}
            {isEditing ? (
              <div className="flex">
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
                value={detection.effective_date ?? 'Not specified'}
              />
            )}
          </div>
        </div>

        {/* ---- CONFIDENCE + SEVERITY ---- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Confidence score */}
          <div
            className={`border rounded-lg p-6 text-center ${confidenceBgColor(detection.confidence)}`}
          >
            <p className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
              Confidence Score
            </p>
            <p className={`text-4xl font-bold ${confidenceColor(detection.confidence)}`}>
              {Math.round(detection.confidence)}%
            </p>
            <p className="text-[12px] text-text-tertiary mt-1">
              {detection.confidence >= 85
                ? 'High confidence — auto-approve eligible'
                : detection.confidence >= 50
                  ? 'Medium confidence — manual review recommended'
                  : 'Low confidence — manual review required'}
            </p>
          </div>

          {/* Severity badge */}
          <div
            className={`border rounded-lg p-6 text-center ${severityCfg?.bgClass ?? 'bg-surface-bg border-surface-border'}`}
          >
            <p className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
              Severity
            </p>
            {isEditing ? (
              <select
                value={editSeverity}
                onChange={(e) => setEditSeverity(e.target.value)}
                className="text-lg font-bold border border-surface-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            ) : (
              <p className={`text-2xl font-bold ${severityCfg?.textClass ?? 'text-text-secondary'}`}>
                {severityCfg?.label ?? detection.severity ?? 'Unknown'}
              </p>
            )}
          </div>
        </div>

        {/* ---- AI ANALYSIS NOTES ---- */}
        {detection.ai_notes && (
          <div className="bg-white border border-gold-tint rounded-xl shadow-sm p-6 mb-4">
            <h3 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-4">
              AI Analysis Notes
            </h3>
            <p className="text-sm text-text-primary whitespace-pre-wrap">
              {detection.ai_notes}
            </p>
          </div>
        )}

        {/* ---- ADMIN ACTIONS ---- */}
        {canAct && (
          <div className="bg-white border border-gold-tint rounded-xl shadow-sm p-6 mb-4">
            <h3 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-4">
              Admin Actions
            </h3>

            {/* Reviewer notes */}
            <label className="block text-sm text-text-secondary mb-1">
              Reviewer Notes:
            </label>
            <textarea
              value={reviewerNotes}
              onChange={(e) => {
                setReviewerNotes(e.target.value);
                setValidationError(null);
              }}
              placeholder="Add review notes..."
              className="w-full min-h-[80px] border border-surface-border rounded-lg p-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold resize-y mb-4"
            />

            {validationError && (
              <p className="text-sm text-red-600 mb-3">{validationError}</p>
            )}

            {/* Action buttons */}
            {!confirmAction && !isEditing && (
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAction('confirm')}
                  disabled={processing}
                  className="bg-[#34A853] text-white font-semibold text-sm rounded-md px-5 py-2 hover:bg-[#2D9249] transition-colors disabled:opacity-50"
                >
                  Confirm &amp; Publish
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={processing}
                  className="bg-blue-500 text-white font-semibold text-sm rounded-md px-5 py-2 hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  Edit &amp; Publish
                </button>
                <button
                  onClick={() => {
                    if (!reviewerNotes.trim()) {
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
                  onClick={() => setConfirmAction('confirm')}
                  disabled={processing}
                  className="bg-[#34A853] text-white font-semibold text-sm rounded-md px-5 py-2 hover:bg-[#2D9249] transition-colors disabled:opacity-50"
                >
                  Save &amp; Publish
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
                  {confirmAction === 'confirm'
                    ? 'Confirm and publish this detection? This will create a rate_changes record visible to all affected users.'
                    : 'Reject this detection?'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={
                      confirmAction === 'confirm'
                        ? handleConfirmPublish
                        : handleReject
                    }
                    disabled={processing}
                    className={`font-semibold text-sm rounded-md px-5 py-2 transition-colors disabled:opacity-50 ${
                      confirmAction === 'confirm'
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
                      `Yes, ${confirmAction === 'confirm' ? 'Publish' : 'Reject'}`
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
        {detection.reviewed_at && (
          <div className="bg-white border border-gold-tint rounded-xl shadow-sm p-6">
            <h3 className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-4">
              Review History
            </h3>
            <div className="py-2">
              <div className="flex items-baseline gap-2 text-[13px]">
                <span className="font-mono text-[12px] text-text-tertiary">
                  {new Date(detection.reviewed_at)
                    .toISOString()
                    .slice(0, 16)
                    .replace('T', ' ')}
                </span>
                <span className="text-text-secondary">
                  &mdash;{' '}
                  {detection.status === 'published'
                    ? 'Confirmed and published'
                    : detection.status === 'rejected'
                      ? 'Rejected'
                      : 'Reviewed'}
                  {detection.reviewer_notes
                    ? `. Notes: "${detection.reviewer_notes}"`
                    : ''}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper components
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

function EditableRow({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex">
      <span className="text-sm text-text-secondary w-[140px] flex-shrink-0">
        {label}:
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm text-text-primary font-medium border border-surface-border rounded-lg px-2 py-1 flex-1 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
        placeholder={placeholder}
      />
    </div>
  );
}
