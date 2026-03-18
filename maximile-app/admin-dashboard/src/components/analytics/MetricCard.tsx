// =============================================================================
// MetricCard — Generic KPI metric card
// =============================================================================
// Placeholder — will be fully implemented in S38.6.
// =============================================================================

interface Props {
  label: string;
  value: number;
  previousValue: number;
  invertTrend?: boolean;
}

export default function MetricCard({ label, value, previousValue, invertTrend }: Props) {
  const delta = previousValue > 0 ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositive = invertTrend ? delta <= 0 : delta >= 0;

  return (
    <div className="bg-white border border-gold-tint rounded-xl shadow-sm p-4">
      <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-xl font-bold text-brand-charcoal">{value.toLocaleString()}</p>
      <p className={`text-xs mt-1 ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
        {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
      </p>
    </div>
  );
}
