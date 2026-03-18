// =============================================================================
// EventHeatmap — Calendar-style Event Activity Heatmap
// =============================================================================
// GitHub contribution graph inspired visualization showing daily event density.
// Color scale: transparent → light gold → dark gold → charcoal
// =============================================================================

import { useMemo, useState } from 'react';

interface EventDaily {
  day: string;
  event: string;
  count: number;
  unique_users: number;
}

interface EventHeatmapProps {
  data: EventDaily[];
  days: number;
}

export default function EventHeatmap({ data, days }: EventHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ day: string; count: number; x: number; y: number } | null>(null);

  // Aggregate events per day
  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    const startStr = startDate.toISOString().split('T')[0];

    data.forEach(d => {
      if (d.day >= startStr) {
        totals[d.day] = (totals[d.day] || 0) + d.count;
      }
    });
    return totals;
  }, [data, days]);

  // Generate grid of days
  const grid = useMemo(() => {
    const cells: { date: string; count: number }[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      cells.push({ date: dateStr, count: dailyTotals[dateStr] || 0 });
    }
    return cells;
  }, [days, dailyTotals]);

  // Calculate color intensity
  const maxCount = Math.max(...grid.map(c => c.count), 1);

  const getColor = (count: number): string => {
    if (count === 0) return 'bg-surface-bg';
    const intensity = count / maxCount;
    if (intensity < 0.25) return 'bg-brand-gold/20';
    if (intensity < 0.5) return 'bg-brand-gold/40';
    if (intensity < 0.75) return 'bg-brand-gold/70';
    return 'bg-brand-gold';
  };

  // Calculate weeks for the grid
  const weeks = useMemo(() => {
    const result: { date: string; count: number }[][] = [];
    let currentWeek: { date: string; count: number }[] = [];

    grid.forEach((cell) => {
      const dayOfWeek = new Date(cell.date).getDay();
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        result.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(cell);
    });
    if (currentWeek.length > 0) result.push(currentWeek);
    return result;
  }, [grid]);

  const totalEvents = grid.reduce((sum, c) => sum + c.count, 0);
  const activeDays = grid.filter(c => c.count > 0).length;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <span className="text-xs text-text-tertiary">
            {totalEvents.toLocaleString()} events across {activeDays} active days
          </span>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1 text-[10px] text-text-tertiary">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-surface-bg border border-surface-border-light" />
          <div className="w-2.5 h-2.5 rounded-sm bg-brand-gold/20" />
          <div className="w-2.5 h-2.5 rounded-sm bg-brand-gold/40" />
          <div className="w-2.5 h-2.5 rounded-sm bg-brand-gold/70" />
          <div className="w-2.5 h-2.5 rounded-sm bg-brand-gold" />
          <span>More</span>
        </div>
      </div>

      {/* Grid */}
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((cell) => (
              <div
                key={cell.date}
                className={`w-3 h-3 rounded-sm ${getColor(cell.count)} transition-colors cursor-pointer hover:ring-1 hover:ring-brand-gold`}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({ day: cell.date, count: cell.count, x: rect.left, y: rect.top - 40 });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-brand-charcoal text-white text-[11px] px-2 py-1 rounded shadow-lg pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <span className="font-medium">{tooltip.count} events</span>
          <span className="text-gray-300 ml-1">on {tooltip.day}</span>
        </div>
      )}
    </div>
  );
}
