// =============================================================================
// NorthStarCard — MARU North Star metric card
// =============================================================================
// Placeholder — will be fully implemented in S38.6.
// =============================================================================

interface MaruMonthly {
  month: string;
  total_recommendations: number;
  unique_users: number;
}

interface Props {
  value: number;
  previousValue: number;
  data: MaruMonthly[];
}

export default function NorthStarCard({ value, previousValue }: Props) {
  const delta = previousValue > 0 ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositive = delta >= 0;

  return (
    <div className="bg-white border border-gold-tint rounded-xl shadow-sm p-4 col-span-2 md:col-span-1">
      <p className="text-[11px] font-semibold text-brand-gold uppercase tracking-wider mb-1">
        North Star — MARU
      </p>
      <p className="text-2xl font-bold text-brand-charcoal">{value.toLocaleString()}</p>
      <p className={`text-xs mt-1 ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
        {isPositive ? '+' : ''}{delta.toFixed(1)}% vs prev
      </p>
    </div>
  );
}
