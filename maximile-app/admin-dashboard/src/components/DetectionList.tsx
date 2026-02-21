// =============================================================================
// DetectionList — List view for AI-detected changes
// =============================================================================
// T15.11: Table with columns for Date, Bank, Card, Change Type, Confidence,
// Severity, Status, Actions. Filter by status, bank, confidence range.
// Sorted by confidence DESC (default), created_at DESC.
// =============================================================================

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import StatusBadge, { type DetectionStatus } from './StatusBadge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Detection {
  id: string;
  source_snapshot_id: string | null;
  card_id: string | null;
  card_name: string | null;
  bank_name: string | null;
  change_type: string;
  category: string | null;
  old_value: string | null;
  new_value: string | null;
  effective_date: string | null;
  confidence: number;
  severity: string | null;
  status: DetectionStatus;
  ai_notes: string | null;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  // Joined from source_snapshots -> source_configs
  source_snapshots: {
    snapshot_at: string | null;
    source_configs: {
      url: string;
      bank_name: string;
    } | null;
  } | null;
}

interface DetectionListProps {
  onSelectDetection: (detection: Detection) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'detected', label: 'Detected' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'published', label: 'Published' },
  { value: 'duplicate', label: 'Duplicate' },
];

const CONFIDENCE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Confidence' },
  { value: 'high', label: 'High (>= 85%)' },
  { value: 'medium', label: 'Medium (50-84%)' },
  { value: 'low', label: 'Low (< 50%)' },
];

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'confidence', label: 'Confidence (High first)' },
  { value: 'created_at', label: 'Date (Newest first)' },
];

const CHANGE_TYPE_LABELS: Record<string, string> = {
  earn_rate: 'Earn Rate',
  cap_change: 'Cap Adjust.',
  devaluation: 'Devaluation',
  partner_change: 'Partner Ch.',
  fee_change: 'Fee Change',
};

const SEVERITY_CONFIG: Record<string, { label: string; classes: string }> = {
  critical: { label: 'Critical', classes: 'text-red-700 bg-red-50' },
  warning: { label: 'Warning', classes: 'text-amber-700 bg-amber-50' },
  info: { label: 'Info', classes: 'text-blue-700 bg-blue-50' },
};

const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function confidenceColor(confidence: number): string {
  if (confidence >= 85) return 'text-green-700 bg-green-50';
  if (confidence >= 50) return 'text-amber-700 bg-amber-50';
  return 'text-red-700 bg-red-50';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

function formatChangeType(type: string): string {
  return CHANGE_TYPE_LABELS[type] ?? type;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DetectionList({ onSelectDetection }: DetectionListProps) {
  // State
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('detected');
  const [bankFilter, setBankFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('confidence');

  // Bank options for filter dropdown
  const [bankOptions, setBankOptions] = useState<string[]>([]);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // -------------------------------------------------------------------------
  // Fetch unique banks for filter dropdown
  // -------------------------------------------------------------------------
  useEffect(() => {
    const fetchBanks = async () => {
      const { data } = await supabase
        .from('detected_changes')
        .select('bank_name');
      if (data) {
        const banks = [...new Set(
          (data as { bank_name: string | null }[])
            .map((d) => d.bank_name)
            .filter((b): b is string => b !== null)
        )].sort();
        setBankOptions(banks);
      }
    };
    fetchBanks();
  }, []);

  // -------------------------------------------------------------------------
  // Fetch detections
  // -------------------------------------------------------------------------
  const fetchDetections = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const orderColumn = sortBy === 'confidence' ? 'confidence' : 'created_at';
      const ascending = false;

      let query = supabase
        .from('detected_changes')
        .select('*, source_snapshots(snapshot_at, source_configs(url, bank_name))', { count: 'exact' })
        .order(orderColumn, { ascending })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      // Status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Bank filter
      if (bankFilter !== 'all') {
        query = query.eq('bank_name', bankFilter);
      }

      // Confidence filter
      if (confidenceFilter === 'high') {
        query = query.gte('confidence', 85);
      } else if (confidenceFilter === 'medium') {
        query = query.gte('confidence', 50).lt('confidence', 85);
      } else if (confidenceFilter === 'low') {
        query = query.lt('confidence', 50);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        setError(fetchError.message);
        setDetections([]);
        setTotalCount(0);
      } else {
        setDetections((data ?? []) as unknown as Detection[]);
        setTotalCount(count ?? 0);
      }
    } catch (err) {
      setError('Failed to fetch detections');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, bankFilter, confidenceFilter, sortBy, page]);

  useEffect(() => {
    fetchDetections();
  }, [fetchDetections]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [statusFilter, bankFilter, confidenceFilter, sortBy]);

  // -------------------------------------------------------------------------
  // Derived
  // -------------------------------------------------------------------------
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const detectedCount = detections.filter((d) => d.status === 'detected').length;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 px-6 py-4 glass border-b border-gold-tint">
        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 border border-surface-border rounded-lg px-3 text-[13px] text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Bank */}
        <select
          value={bankFilter}
          onChange={(e) => setBankFilter(e.target.value)}
          className="h-9 border border-surface-border rounded-lg px-3 text-[13px] text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
        >
          <option value="all">All Banks</option>
          {bankOptions.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </select>

        {/* Confidence Range */}
        <select
          value={confidenceFilter}
          onChange={(e) => setConfidenceFilter(e.target.value)}
          className="h-9 border border-surface-border rounded-lg px-3 text-[13px] text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
        >
          {CONFIDENCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-9 border border-surface-border rounded-lg px-3 text-[13px] text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results summary */}
      <p className="text-[13px] text-text-secondary px-6 py-2">
        Showing {detections.length} of {totalCount} detections
        {detectedCount > 0 && ` (${detectedCount} awaiting review)`}
      </p>

      {/* Error state */}
      {error && (
        <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="mx-6 bg-white border border-gold-tint rounded-xl overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-surface-border">
              <th className="text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">
                Date
              </th>
              <th className="text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">
                Bank
              </th>
              <th className="text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">
                Card
              </th>
              <th className="text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">
                Type
              </th>
              <th className="text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">
                Confidence
              </th>
              <th className="text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">
                Severity
              </th>
              <th className="text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-text-tertiary">
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-text-tertiary"
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
                    Loading detections...
                  </div>
                </td>
              </tr>
            )}

            {!loading && detections.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-text-tertiary">
                  No detections match your filters.{' '}
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setBankFilter('all');
                      setConfidenceFilter('all');
                    }}
                    className="text-brand-gold hover:underline"
                  >
                    Clear filters
                  </button>
                </td>
              </tr>
            )}

            {!loading &&
              detections.map((detection) => {
                const bankName =
                  detection.bank_name ??
                  detection.source_snapshots?.source_configs?.bank_name ??
                  'Unknown';
                const severityCfg = SEVERITY_CONFIG[detection.severity ?? ''];

                return (
                  <tr
                    key={detection.id}
                    onClick={() => onSelectDetection(detection)}
                    className="border-b border-surface-border-light hover:bg-surface-bg cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {formatDate(detection.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {bankName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-text-primary">
                        {detection.card_name ?? 'Unknown Card'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {formatChangeType(detection.change_type)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center text-[12px] font-semibold px-2 py-0.5 rounded ${confidenceColor(detection.confidence)}`}
                      >
                        {Math.round(detection.confidence)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {severityCfg ? (
                        <span
                          className={`inline-flex items-center text-[12px] font-semibold px-2 py-0.5 rounded ${severityCfg.classes}`}
                        >
                          {severityCfg.label}
                        </span>
                      ) : (
                        <span className="text-sm text-text-tertiary">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={detection.status} />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-[13px] text-text-secondary border border-surface-border rounded-lg px-3 py-1.5 disabled:opacity-50 hover:bg-surface-bg transition-colors"
          >
            Prev
          </button>
          <span className="text-[13px] text-slate-500">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="text-[13px] text-text-secondary border border-surface-border rounded-lg px-3 py-1.5 disabled:opacity-50 hover:bg-surface-bg transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
