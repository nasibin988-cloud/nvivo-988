/**
 * MetricCard Component
 * Displays health metric with value, trend indicator, and sparkline chart
 */

import TrendChart from './TrendChart';
import TrendLabel from './TrendLabel';
import type { MetricCardProps } from '../types';

export default function MetricCard({
  label,
  value,
  unit,
  trend,
  trendGood = true,
  sparklineData,
  color,
}: MetricCardProps): React.ReactElement {
  const isGoodTrend = trendGood
    ? trend === 'up' || trend === 'stable'
    : trend === 'down' || trend === 'stable';

  return (
    <div className="bg-surface rounded-2xl border border-border p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-semibold text-text-primary">{label}</span>
        <TrendLabel direction={trend} isGoodTrend={isGoodTrend} />
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-2xl font-bold text-text-primary">{value}</span>
        <span className="text-sm text-text-muted">{unit}</span>
      </div>

      {/* Chart - 70px height */}
      <TrendChart data={sparklineData} color={color} height={70} />
    </div>
  );
}
