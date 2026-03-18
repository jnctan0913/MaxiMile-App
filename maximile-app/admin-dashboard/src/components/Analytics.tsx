// =============================================================================
// Analytics — Product Analytics Dashboard
// =============================================================================
// Sprint 38 (F46): Analytics tab for the admin dashboard.
// Queries Supabase analytics_events via service_role to display:
// - North Star MARU metric + KPI cards
// - Conversion funnels (onboarding, Smart Pay, notifications)
// - Feature adoption rates + event heatmap
// - Active users chart (DAU/WAU/MAU)
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Sub-components
import NorthStarCard from './analytics/NorthStarCard';
import MetricCard from './analytics/MetricCard';
import FunnelChart from './analytics/FunnelChart';
import ActiveUsersChart from './analytics/ActiveUsersChart';
import EventHeatmap from './analytics/EventHeatmap';

// Types
interface DateRange {
  label: string;
  days: number;
}

const DATE_RANGES: DateRange[] = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

interface MaruMonthly {
  month: string;
  total_recommendations: number;
  unique_users: number;
}

interface EventDaily {
  day: string;
  event: string;
  count: number;
  unique_users: number;
}

interface ActiveUserDay {
  day: string;
  dau: number;
}

interface FunnelStep {
  step_order: number;
  step: string;
  users: number;
}

export default function Analytics() {
  const [selectedRange, setSelectedRange] = useState<DateRange>(DATE_RANGES[1]); // Default 30d
  const [loading, setLoading] = useState(true);

  // Data state
  const [maruData, setMaruData] = useState<MaruMonthly[]>([]);
  const [eventDaily, setEventDaily] = useState<EventDaily[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUserDay[]>([]);
  const [onboardingFunnel, setOnboardingFunnel] = useState<FunnelStep[]>([]);
  const [smartPayFunnel, setSmartPayFunnel] = useState<FunnelStep[]>([]);
  const [notificationFunnel, setNotificationFunnel] = useState<FunnelStep[]>([]);

  // Computed metrics
  const [metrics, setMetrics] = useState({
    maru: 0,
    maruPrev: 0,
    dau: 0,
    dauPrev: 0,
    mau: 0,
    mauPrev: 0,
    transactions: 0,
    transactionsPrev: 0,
    churn: 0,
    churnPrev: 0,
    capBreaches: 0,
    capBreachesPrev: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - selectedRange.days);
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - selectedRange.days);

    const startStr = startDate.toISOString().split('T')[0];
    const prevStartStr = prevStartDate.toISOString().split('T')[0];

    try {
      const [maruRes, eventRes, activeRes, onboardRes, payRes, notifRes] = await Promise.all([
        supabase.from('maru_monthly').select('*').order('month', { ascending: false }).limit(12),
        supabase.from('v_event_daily').select('*').gte('day', prevStartStr),
        supabase.from('v_active_users').select('*').gte('day', prevStartStr),
        supabase.from('v_onboarding_funnel').select('*'),
        supabase.from('v_smart_pay_funnel').select('*'),
        supabase.from('v_notification_funnel').select('*'),
      ]);

      if (maruRes.data) setMaruData(maruRes.data as MaruMonthly[]);
      if (eventRes.data) setEventDaily(eventRes.data as EventDaily[]);
      if (activeRes.data) setActiveUsers(activeRes.data as ActiveUserDay[]);
      if (onboardRes.data) setOnboardingFunnel(onboardRes.data as FunnelStep[]);
      if (payRes.data) setSmartPayFunnel(payRes.data as FunnelStep[]);
      if (notifRes.data) setNotificationFunnel(notifRes.data as FunnelStep[]);

      // Calculate metrics from fetched data
      const currentEvents = (eventRes.data || []).filter((e: EventDaily) => e.day >= startStr);
      const prevEvents = (eventRes.data || []).filter((e: EventDaily) => e.day >= prevStartStr && e.day < startStr);

      const currentActive = (activeRes.data || []).filter((d: ActiveUserDay) => d.day >= startStr);
      const prevActive = (activeRes.data || []).filter((d: ActiveUserDay) => d.day >= prevStartStr && d.day < startStr);

      const sumEvents = (events: EventDaily[], eventName: string) =>
        events.filter(e => e.event === eventName).reduce((sum, e) => sum + e.count, 0);

      const avgDau = (days: ActiveUserDay[]) =>
        days.length > 0 ? Math.round(days.reduce((sum, d) => sum + d.dau, 0) / days.length) : 0;

      // Unique users in the period (MAU approximation)
      const uniqueUsersInPeriod = (days: ActiveUserDay[]) =>
        days.reduce((sum, d) => sum + d.dau, 0); // Approximation since we can't deduplicate across days from this view

      setMetrics({
        maru: maruRes.data?.[0]?.total_recommendations ?? 0,
        maruPrev: maruRes.data?.[1]?.total_recommendations ?? 0,
        dau: avgDau(currentActive),
        dauPrev: avgDau(prevActive),
        mau: uniqueUsersInPeriod(currentActive),
        mauPrev: uniqueUsersInPeriod(prevActive),
        transactions: sumEvents(currentEvents, 'transaction_logged'),
        transactionsPrev: sumEvents(prevEvents, 'transaction_logged'),
        churn: sumEvents(currentEvents, 'account_deleted'),
        churnPrev: sumEvents(prevEvents, 'account_deleted'),
        capBreaches: sumEvents(currentEvents, 'cap_breached'),
        capBreachesPrev: sumEvents(prevEvents, 'cap_breached'),
      });

    } catch (err) {
      console.error('[Analytics] Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-2 text-text-tertiary">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Date Range Picker */}
      <div className="px-6 py-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Product Analytics
        </h2>
        <div className="flex gap-1 bg-white border border-gold-tint rounded-lg p-1">
          {DATE_RANGES.map((range) => (
            <button
              key={range.label}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                selectedRange.label === range.label
                  ? 'bg-brand-gold text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-bg'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* North Star + KPI Cards */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <NorthStarCard
            value={metrics.maru}
            previousValue={metrics.maruPrev}
            data={maruData}
          />
          <MetricCard label="Avg DAU" value={metrics.dau} previousValue={metrics.dauPrev} />
          <MetricCard label="Total Sessions" value={metrics.mau} previousValue={metrics.mauPrev} />
          <MetricCard label="Transactions" value={metrics.transactions} previousValue={metrics.transactionsPrev} />
          <MetricCard label="Churn" value={metrics.churn} previousValue={metrics.churnPrev} invertTrend />
          <MetricCard label="Cap Breaches" value={metrics.capBreaches} previousValue={metrics.capBreachesPrev} invertTrend />
        </div>
      </div>

      {/* Funnels Row */}
      <div className="px-6 mb-6">
        <h3 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Conversion Funnels
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <FunnelChart
            title="Onboarding"
            steps={onboardingFunnel.map(s => ({ label: s.step.replace(/_/g, ' '), value: s.users }))}
          />
          <FunnelChart
            title="Smart Pay"
            steps={smartPayFunnel.map(s => ({ label: s.step.replace(/_/g, ' '), value: s.users }))}
          />
          <FunnelChart
            title="Notification Opt-in"
            steps={notificationFunnel.map(s => ({ label: s.step.replace(/_/g, ' '), value: s.users }))}
          />
        </div>
      </div>

      {/* Active Users Chart */}
      <div className="px-6 mb-6">
        <h3 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Active Users
        </h3>
        <div className="bg-white border border-gold-tint rounded-xl shadow-sm p-4">
          <ActiveUsersChart
            data={activeUsers.filter(d => d.day >= new Date(Date.now() - selectedRange.days * 86400000).toISOString().split('T')[0])}
          />
        </div>
      </div>

      {/* Event Heatmap */}
      <div className="px-6 mb-6">
        <h3 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Event Activity
        </h3>
        <div className="bg-white border border-gold-tint rounded-xl shadow-sm p-4">
          <EventHeatmap data={eventDaily} days={selectedRange.days} />
        </div>
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
