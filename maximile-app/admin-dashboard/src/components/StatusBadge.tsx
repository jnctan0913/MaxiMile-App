// =============================================================================
// StatusBadge — Color-coded status badge (MaxiMile brand palette)
// =============================================================================

// ---------------------------------------------------------------------------
// Status types
// ---------------------------------------------------------------------------
export type SubmissionStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'merged';
export type DetectionStatus = 'detected' | 'confirmed' | 'rejected' | 'published' | 'duplicate';
export type SourceStatus = 'active' | 'paused' | 'broken' | 'retired';
export type PipelineRunStatus = 'running' | 'completed' | 'failed' | 'partial';
export type FreshnessLabel = 'recent' | 'on_schedule' | 'overdue' | 'never';

type BadgeStatus =
  | SubmissionStatus
  | DetectionStatus
  | SourceStatus
  | PipelineRunStatus
  | FreshnessLabel;

interface StatusBadgeProps {
  status: BadgeStatus;
  size?: 'sm' | 'md';
}

// ---------------------------------------------------------------------------
// Config — MaxiMile brand-aligned colors
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<string, { label: string; dot: string; classes: string }> = {
  // Community Submission
  pending:      { label: 'Pending',       dot: 'bg-[#FBBC04]', classes: 'bg-amber-50 text-amber-800 border-amber-200' },
  under_review: { label: 'Under Review',  dot: 'bg-[#1A73E8]', classes: 'bg-blue-50 text-blue-800 border-blue-200' },
  approved:     { label: 'Approved',       dot: 'bg-[#34A853]', classes: 'bg-green-50 text-green-800 border-green-200' },
  rejected:     { label: 'Rejected',       dot: 'bg-[#EA4335]', classes: 'bg-red-50 text-red-800 border-red-200' },
  merged:       { label: 'Merged',         dot: 'bg-[#C5A55A]', classes: 'bg-[#FDF8ED] text-[#8B7340] border-[#E8D9A8]' },

  // AI Detection
  detected:  { label: 'Detected',   dot: 'bg-[#FBBC04]', classes: 'bg-amber-50 text-amber-800 border-amber-200' },
  confirmed: { label: 'Confirmed',  dot: 'bg-[#1A73E8]', classes: 'bg-blue-50 text-blue-800 border-blue-200' },
  published: { label: 'Published',  dot: 'bg-[#34A853]', classes: 'bg-green-50 text-green-800 border-green-200' },
  duplicate: { label: 'Duplicate',  dot: 'bg-[#9AA0A6]', classes: 'bg-gray-50 text-gray-600 border-gray-200' },

  // Source status
  active:  { label: 'Active',  dot: 'bg-[#34A853]', classes: 'bg-green-50 text-green-800 border-green-200' },
  paused:  { label: 'Paused',  dot: 'bg-[#FBBC04]', classes: 'bg-amber-50 text-amber-800 border-amber-200' },
  broken:  { label: 'Broken',  dot: 'bg-[#EA4335]', classes: 'bg-red-50 text-red-800 border-red-200' },
  retired: { label: 'Retired', dot: 'bg-[#9AA0A6]', classes: 'bg-gray-50 text-gray-600 border-gray-200' },

  // Pipeline run
  running:   { label: 'Running',   dot: 'bg-[#1A73E8]', classes: 'bg-blue-50 text-blue-800 border-blue-200' },
  completed: { label: 'Completed', dot: 'bg-[#34A853]', classes: 'bg-green-50 text-green-800 border-green-200' },
  failed:    { label: 'Failed',    dot: 'bg-[#EA4335]', classes: 'bg-red-50 text-red-800 border-red-200' },
  partial:   { label: 'Partial',   dot: 'bg-[#FBBC04]', classes: 'bg-amber-50 text-amber-800 border-amber-200' },

  // Freshness
  recent:      { label: 'Recent',      dot: 'bg-[#34A853]', classes: 'bg-green-50 text-green-800 border-green-200' },
  on_schedule: { label: 'On Schedule', dot: 'bg-[#34A853]', classes: 'bg-green-50 text-green-800 border-green-200' },
  overdue:     { label: 'Overdue',     dot: 'bg-[#EA4335]', classes: 'bg-red-50 text-red-800 border-red-200' },
  never:       { label: 'Never',       dot: 'bg-[#9AA0A6]', classes: 'bg-gray-50 text-gray-600 border-gray-200' },
};

const FALLBACK = { label: 'Unknown', dot: 'bg-gray-400', classes: 'bg-gray-50 text-gray-600 border-gray-200' };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? FALLBACK;

  const sizeClasses =
    size === 'md'
      ? 'text-[13px] px-3 py-1 gap-1.5'
      : 'text-[11px] px-2 py-0.5 gap-1';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${config.classes} ${sizeClasses} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
