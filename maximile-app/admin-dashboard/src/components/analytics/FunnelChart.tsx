// =============================================================================
// FunnelChart — Conversion funnel visualization
// =============================================================================
// Placeholder — will be fully implemented in S38.6.
// =============================================================================

interface FunnelStep {
  label: string;
  value: number;
}

interface Props {
  title: string;
  steps: FunnelStep[];
}

export default function FunnelChart({ title, steps }: Props) {
  const maxValue = steps.length > 0 ? Math.max(...steps.map(s => s.value)) : 1;

  return (
    <div className="bg-white border border-gold-tint rounded-xl shadow-sm p-4">
      <h4 className="text-[13px] font-semibold text-brand-charcoal mb-3">{title}</h4>
      {steps.length === 0 ? (
        <p className="text-xs text-text-tertiary">No funnel data available</p>
      ) : (
        <div className="space-y-2">
          {steps.map((step, i) => {
            const pct = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
            return (
              <div key={i}>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-text-secondary capitalize">{step.label}</span>
                  <span className="font-medium text-brand-charcoal">{step.value.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-surface-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-gold rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
