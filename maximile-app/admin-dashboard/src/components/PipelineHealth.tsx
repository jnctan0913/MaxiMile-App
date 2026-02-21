// =============================================================================
// PipelineHealth — Pipeline health monitoring dashboard
// =============================================================================
// T15.12: Shows pipeline health metrics including:
// - Summary header: active sources, broken sources, last run time/status
// - Source health table from v_pipeline_health view
// - Pipeline runs log (last 10) from pipeline_runs table
// DRD Section 16.4: MaxiMile brand design with color-coded statuses.
// =============================================================================

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import StatusBadge, {
  type SourceStatus,
  type PipelineRunStatus,
  type FreshnessLabel,
} from './StatusBadge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PipelineSummary {
  active_sources: number;
  broken_sources: number;
  paused_sources: number;
  total_sources: number;
  last_run_at: string | null;
  last_run_status: PipelineRunStatus | null;
}

interface SourceHealth {
  source_id: string;
  bank_name: string;
  url: string;
  source_status: SourceStatus;
  uptime_pct_30d: number | null;
  last_checked_at: string | null;
  consecutive_failures: number;
  check_freshness: FreshnessLabel;
  check_interval: string | null;
}

interface PipelineRun {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: PipelineRunStatus;
  sources_checked: number;
  changes_detected: number;
  auto_approved: number;
  queued_for_review: number;
  duration_ms: number | null;
  errors: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) +
    ' ' +
    d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })
  );
}

function formatDuration(ms: number | null): string {
  if (ms === null) return '--';
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remainSecs = secs % 60;
  return `${mins}m ${remainSecs}s`;
}

function truncateUrl(url: string, maxLen = 40): string {
  if (url.length <= maxLen) return url;
  // Remove protocol
  const short = url.replace(/^https?:\/\//, '');
  if (short.length <= maxLen) return short;
  return short.slice(0, maxLen - 3) + '...';
}

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PipelineHealth() {
  // State
  const [summary, setSummary] = useState<PipelineSummary | null>(null);
  const [sources, setSources] = useState<SourceHealth[]>([]);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Fetch all pipeline health data
  // -------------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all three data sources in parallel
      const [summaryRes, sourcesRes, runsRes] = await Promise.all([
        supabase.from('v_pipeline_summary').select('*').single(),
        supabase.from('v_pipeline_health').select('*'),
        supabase
          .from('pipeline_runs')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(10),
      ]);

      // Summary — may not exist yet if pipeline hasn't run
      if (summaryRes.error && summaryRes.error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is acceptable
        console.warn('Pipeline summary not available:', summaryRes.error.message);
      }
      if (summaryRes.data) {
        setSummary(summaryRes.data as unknown as PipelineSummary);
      }

      // Sources
      if (sourcesRes.error) {
        console.warn('Pipeline health view not available:', sourcesRes.error.message);
      }
      if (sourcesRes.data) {
        setSources(sourcesRes.data as unknown as SourceHealth[]);
      }

      // Runs
      if (runsRes.error) {
        console.warn('Pipeline runs not available:', runsRes.error.message);
      }
      if (runsRes.data) {
        setRuns(runsRes.data as unknown as PipelineRun[]);
      }
    } catch (err) {
      setError('Failed to fetch pipeline health data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-2 text-text-tertiary">
          <svg
            className="animate-spin h-5 w-5"
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
          Loading pipeline health...
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen pb-12">
      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* ---- SUMMARY HEADER ---- */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Active Sources */}
          <SummaryCard
            label="Active Sources"
            value={summary?.active_sources ?? 0}
            color="text-green-700"
            bgColor="bg-green-50 border-green-200"
          />
          {/* Broken Sources */}
          <SummaryCard
            label="Broken Sources"
            value={summary?.broken_sources ?? 0}
            color={
              (summary?.broken_sources ?? 0) > 0
                ? 'text-red-700'
                : 'text-text-secondary'
            }
            bgColor={
              (summary?.broken_sources ?? 0) > 0
                ? 'bg-red-50 border-red-200'
                : 'bg-surface-bg border-gold-tint'
            }
          />
          {/* Last Run Time */}
          <div className="border border-gold-tint rounded-xl p-4 shadow-sm bg-white border-gold-tint">
            <p className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
              Last Run
            </p>
            <p className="text-lg font-bold text-text-primary">
              {summary?.last_run_at
                ? timeAgo(summary.last_run_at)
                : 'Never'}
            </p>
            {summary?.last_run_at && (
              <p className="text-[11px] text-text-tertiary mt-0.5">
                {formatDateTime(summary.last_run_at)}
              </p>
            )}
          </div>
          {/* Last Run Status */}
          <div className="border border-gold-tint rounded-xl p-4 shadow-sm bg-white border-gold-tint">
            <p className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
              Last Run Status
            </p>
            <div className="mt-1">
              {summary?.last_run_status ? (
                <StatusBadge status={summary.last_run_status} size="md" />
              ) : (
                <span className="text-lg font-bold text-text-tertiary">--</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---- SOURCE HEALTH TABLE ---- */}
      <div className="px-6 mb-6">
        <h3 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Source Health
        </h3>

        {sources.length === 0 ? (
          <div className="bg-white border border-gold-tint rounded-xl shadow-sm p-8 text-center text-text-tertiary text-sm">
            No source configurations found. The pipeline has not been configured yet.
          </div>
        ) : (
          <div className="bg-white border border-gold-tint rounded-xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gold-tint">
                  <th className="text-left text-[12px] font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                    Bank
                  </th>
                  <th className="text-left text-[12px] font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                    URL
                  </th>
                  <th className="text-left text-[12px] font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-[12px] font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                    Uptime (30d)
                  </th>
                  <th className="text-left text-[12px] font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                    Last Check
                  </th>
                  <th className="text-left text-[12px] font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                    Failures
                  </th>
                  <th className="text-left text-[12px] font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                    Freshness
                  </th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <tr
                    key={source.source_id}
                    className="border-b border-surface-border-light hover:bg-surface-bg transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">
                      {source.bank_name}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                        title={source.url}
                      >
                        {truncateUrl(source.url)}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={source.source_status} />
                    </td>
                    <td className="px-4 py-3">
                      {source.uptime_pct_30d !== null ? (
                        <span
                          className={`text-sm font-medium ${
                            source.uptime_pct_30d >= 95
                              ? 'text-green-700'
                              : source.uptime_pct_30d >= 80
                                ? 'text-amber-700'
                                : 'text-red-700'
                          }`}
                        >
                          {source.uptime_pct_30d.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-sm text-text-tertiary">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {source.last_checked_at
                        ? timeAgo(source.last_checked_at)
                        : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-medium ${
                          source.consecutive_failures > 0
                            ? 'text-red-700'
                            : 'text-text-secondary'
                        }`}
                      >
                        {source.consecutive_failures}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={source.check_freshness} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---- PIPELINE RUNS LOG ---- */}
      <div className="px-6 mb-6">
        <h3 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Pipeline Runs (Last 10)
        </h3>

        {runs.length === 0 ? (
          <div className="bg-white border border-gold-tint rounded-xl shadow-sm p-8 text-center text-text-tertiary text-sm">
            No pipeline runs recorded yet.
          </div>
        ) : (
          <div className="bg-white border border-gold-tint rounded-xl shadow-sm overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gold-tint">
                  <th className="text-left text-[12px] font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                    Date
                  </th>
                  <th className="text-left text-[12px] font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-[12px] font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                    Sources
                  </th>
                  <th className="text-left text-[12px] font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                    Changes
                  </th>
                  <th className="text-left text-[12px] font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                    Auto-Approved
                  </th>
                  <th className="text-left text-[12px] font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                    Queued
                  </th>
                  <th className="text-left text-[12px] font-semibold text-text-secondary uppercase tracking-wider px-4 py-3">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr
                    key={run.id}
                    className="border-b border-surface-border-light hover:bg-surface-bg transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {formatDateTime(run.started_at)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {run.sources_checked}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {run.changes_detected}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {run.auto_approved}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {run.queued_for_review}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {formatDuration(run.duration_ms)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refresh button */}
      <div className="px-6">
        <button
          onClick={fetchData}
          className="text-[13px] text-text-secondary border border-gold-tint rounded-xl px-4 py-2 hover:bg-surface-bg transition-colors"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SummaryCard helper component
// ---------------------------------------------------------------------------

function SummaryCard({
  label,
  value,
  color,
  bgColor,
}: {
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`border border-gold-tint rounded-xl p-4 shadow-sm ${bgColor}`}>
      <p className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
