// =============================================================================
// ActiveUsersChart — DAU/WAU/MAU Line Chart
// =============================================================================
// Shows active user trends over time with toggleable series.
// Uses recharts for rendering. Gold/charcoal theme.
// =============================================================================

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ActiveUserDay {
  day: string;
  dau: number;
}

interface ActiveUsersChartProps {
  data: ActiveUserDay[];
}

interface ChartDataPoint {
  date: string;
  dau: number;
  wau: number;
  mau: number;
}

export default function ActiveUsersChart({ data }: ActiveUsersChartProps) {
  const [showDau, setShowDau] = useState(true);
  const [showWau, setShowWau] = useState(true);
  const [showMau, setShowMau] = useState(false);

  // Sort data ascending and compute WAU/MAU rolling averages
  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.day.localeCompare(b.day));

    return sorted.map((item, index): ChartDataPoint => {
      // WAU: sum of last 7 days DAU (approximation of weekly unique users)
      const wauSlice = sorted.slice(Math.max(0, index - 6), index + 1);
      const wau = Math.round(wauSlice.reduce((sum, d) => sum + d.dau, 0) / wauSlice.length);

      // MAU: sum of last 30 days DAU (approximation)
      const mauSlice = sorted.slice(Math.max(0, index - 29), index + 1);
      const mau = Math.round(mauSlice.reduce((sum, d) => sum + d.dau, 0) / mauSlice.length);

      return {
        date: item.day,
        dau: item.dau,
        wau,
        mau,
      };
    });
  }, [data]);

  if (data.length === 0) {
    return (
      <p className="text-sm text-text-tertiary text-center py-8">
        No active user data available for this period
      </p>
    );
  }

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const series = [
    { key: 'dau', label: 'DAU', color: '#C5A55A', show: showDau, toggle: setShowDau },
    { key: 'wau', label: 'WAU (7d avg)', color: '#34A853', show: showWau, toggle: setShowWau },
    { key: 'mau', label: 'MAU (30d avg)', color: '#4A90D9', show: showMau, toggle: setShowMau },
  ];

  return (
    <div>
      {/* Toggle buttons */}
      <div className="flex gap-2 mb-3">
        {series.map(s => (
          <button
            key={s.key}
            onClick={() => s.toggle(!s.show)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
              s.show
                ? 'border-current bg-white shadow-sm'
                : 'border-surface-border-light text-text-tertiary hover:text-text-secondary'
            }`}
            style={s.show ? { color: s.color, borderColor: s.color } : {}}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: s.show ? s.color : '#9AA0A6' }}
            />
            {s.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(197, 165, 90, 0.1)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: '#9AA0A6' }}
            axisLine={{ stroke: 'rgba(197, 165, 90, 0.15)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9AA0A6' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: '#2D3748',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'white',
            }}
            labelFormatter={(label) => formatDate(String(label))}
          />
          {showDau && (
            <Line
              type="monotone"
              dataKey="dau"
              name="DAU"
              stroke="#C5A55A"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#C5A55A' }}
            />
          )}
          {showWau && (
            <Line
              type="monotone"
              dataKey="wau"
              name="WAU (7d avg)"
              stroke="#34A853"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
              activeDot={{ r: 4, fill: '#34A853' }}
            />
          )}
          {showMau && (
            <Line
              type="monotone"
              dataKey="mau"
              name="MAU (30d avg)"
              stroke="#4A90D9"
              strokeWidth={2}
              dot={false}
              strokeDasharray="2 2"
              activeDot={{ r: 4, fill: '#4A90D9' }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
