// =============================================================================
// SubmissionList — List view with table, filters, and pagination
// =============================================================================
// DRD Section 16.4.1–16.4.3: Table with columns for Date, Card, Change Type,
// Status, and Actions. Filter dropdowns for Status, Card, Date range, Type.
// Sorted by created_at DESC by default.
// =============================================================================

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import StatusBadge, { type SubmissionStatus } from './StatusBadge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Submission {
  id: string;
  user_id: string;
  card_id: string;
  change_type: string;
  category: string | null;
  old_value: string;
  new_value: string;
  effective_date: string | null;
  evidence_url: string | null;
  screenshot_path: string | null;
  notes: string | null;
  status: SubmissionStatus;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  dedup_fingerprint: string | null;
  created_at: string;
  // Joined from cards table
  cards: { name: string; bank: string } | null;
}

interface CardOption {
  id: string;
  name: string;
  bank: string;
}

interface SubmissionListProps {
  onSelectSubmission: (submission: Submission) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'merged', label: 'Merged' },
];

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'earn_rate', label: 'Earn Rate Change' },
  { value: 'cap_change', label: 'Cap Adjustment' },
  { value: 'devaluation', label: 'Program Devaluation' },
  { value: 'partner_change', label: 'Partner Change' },
  { value: 'fee_change', label: 'Fee Change' },
];

const DATE_OPTIONS: { value: string; label: string }[] = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

const CHANGE_TYPE_LABELS: Record<string, string> = {
  earn_rate: 'Earn Rate',
  cap_change: 'Cap Adjust.',
  devaluation: 'Devaluation',
  partner_change: 'Partner Ch.',
  fee_change: 'Fee Change',
};

const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SubmissionList({ onSelectSubmission }: SubmissionListProps) {
  // State
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('30');
  const [cardFilter, setCardFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cards for filter dropdown
  const [cardOptions, setCardOptions] = useState<CardOption[]>([]);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // -------------------------------------------------------------------------
  // Fetch cards for filter dropdown
  // -------------------------------------------------------------------------
  useEffect(() => {
    const fetchCards = async () => {
      const { data } = await supabase
        .from('cards')
        .select('id, name, bank')
        .order('name');
      if (data) {
        setCardOptions(data as CardOption[]);
      }
    };
    fetchCards();
  }, []);

  // -------------------------------------------------------------------------
  // Fetch submissions
  // -------------------------------------------------------------------------
  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('community_submissions')
        .select('*, cards(name, bank)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      // Status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Type filter
      if (typeFilter !== 'all') {
        query = query.eq('change_type', typeFilter);
      }

      // Card filter
      if (cardFilter !== 'all') {
        query = query.eq('card_id', cardFilter);
      }

      // Date filter
      if (dateFilter !== 'all') {
        const daysAgo = parseInt(dateFilter, 10);
        const since = new Date();
        since.setDate(since.getDate() - daysAgo);
        query = query.gte('created_at', since.toISOString());
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        setError(fetchError.message);
        setSubmissions([]);
        setTotalCount(0);
      } else {
        const rows = (data ?? []) as unknown as Submission[];

        // Client-side search filter (card name or notes)
        const filtered = searchQuery.trim()
          ? rows.filter((s) => {
              const q = searchQuery.toLowerCase();
              const cardName = s.cards?.name?.toLowerCase() ?? '';
              const notes = s.notes?.toLowerCase() ?? '';
              return cardName.includes(q) || notes.includes(q);
            })
          : rows;

        setSubmissions(filtered);
        setTotalCount(count ?? 0);
      }
    } catch (err) {
      setError('Failed to fetch submissions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, dateFilter, cardFilter, searchQuery, page]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [statusFilter, typeFilter, dateFilter, cardFilter, searchQuery]);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const pendingCount = submissions.filter(
    (s) => s.status === 'pending'
  ).length;
  const underReviewCount = submissions.filter(
    (s) => s.status === 'under_review'
  ).length;

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

        {/* Card */}
        <select
          value={cardFilter}
          onChange={(e) => setCardFilter(e.target.value)}
          className="h-9 border border-surface-border rounded-lg px-3 text-[13px] text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
        >
          <option value="all">All Cards</option>
          {cardOptions.map((card) => (
            <option key={card.id} value={card.id}>
              {card.bank} — {card.name}
            </option>
          ))}
        </select>

        {/* Date range */}
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="h-9 border border-surface-border rounded-lg px-3 text-[13px] text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
        >
          {DATE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Type */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-9 border border-surface-border rounded-lg px-3 text-[13px] text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-2.5 top-2.5 h-4 w-4 text-text-tertiary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search card name or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 border border-surface-border rounded-lg pl-8 pr-3 text-[13px] text-text-primary bg-white w-60 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold"
          />
        </div>
      </div>

      {/* Results summary */}
      <p className="text-[13px] text-text-secondary px-6 py-2">
        Showing {submissions.length} of {totalCount} submissions
        {pendingCount > 0 && ` (${pendingCount} pending`}
        {underReviewCount > 0 && `, ${underReviewCount} under review`}
        {(pendingCount > 0 || underReviewCount > 0) && ')'}
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
                #
              </th>
              <th className="text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">
                Card
              </th>
              <th className="text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">
                Type
              </th>
              <th className="text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">
                Old
              </th>
              <th className="text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">
                New
              </th>
              <th className="text-left text-[12px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">
                Date
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
                    Loading submissions...
                  </div>
                </td>
              </tr>
            )}

            {!loading && submissions.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-text-tertiary">
                  No submissions match your filters.{' '}
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setTypeFilter('all');
                      setDateFilter('all');
                      setCardFilter('all');
                      setSearchQuery('');
                    }}
                    className="text-brand-gold hover:underline"
                  >
                    Clear filters
                  </button>
                </td>
              </tr>
            )}

            {!loading &&
              submissions.map((submission, index) => (
                <tr
                  key={submission.id}
                  onClick={() => onSelectSubmission(submission)}
                  className="border-b border-surface-border-light hover:bg-surface-bg cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {page * PAGE_SIZE + index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-text-primary">
                      {submission.cards?.name ?? 'Unknown Card'}
                    </div>
                    <div className="text-[12px] text-text-tertiary">
                      {submission.cards?.bank ?? ''}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-primary">
                    {formatChangeType(submission.change_type)}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {submission.old_value}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">
                    {submission.new_value}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {formatDate(submission.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={submission.status} />
                  </td>
                </tr>
              ))}
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
          <span className="text-[13px] text-text-secondary">
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
