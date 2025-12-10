/**
 * Wellness Metric Card Component - Redesigned layout
 */

import { TrendChart } from './TrendChart';

interface WellnessMetricCardProps {
  label: string;
  value: string;
  unit: string;
  change: number; // Point change from previous period
  changeGood: boolean; // Whether this change direction is good for this metric
  sparklineData: number[];
  color: string;
  timeRangeLabel: string;
}

export function WellnessMetricCard({
  label,
  value,
  unit,
  change,
  changeGood,
  sparklineData,
  color,
  timeRangeLabel,
}: WellnessMetricCardProps): React.ReactElement {
  // Determine color based on whether change is good
  const changeColor = change === 0
    ? 'text-text-muted'
    : changeGood
      ? 'text-emerald-400'
      : 'text-rose-400';

  const changeSign = change > 0 ? '+' : '';

  return (
    <div className="bg-surface rounded-2xl border border-border p-4">
      {/* Header - Label on left, Avg label + Score on right */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-text-primary">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">{timeRangeLabel} Avg:</span>
          <span className="text-xl font-bold text-text-primary">{value}</span>
          <span className="text-xs text-text-muted">{unit}</span>
          {change !== 0 && (
            <span className={`text-xs font-medium ${changeColor}`}>
              {changeSign}{change.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Chart - Increased height */}
      <TrendChart data={sparklineData} color={color} height={100} />
    </div>
  );
}
