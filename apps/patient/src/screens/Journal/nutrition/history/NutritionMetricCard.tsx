/**
 * Nutrition Metric Card - Individual metric trend display
 * Shows average, change from previous period, and sparkline
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { NutritionTrendChart } from './NutritionTrendChart';

interface NutritionMetricCardProps {
  label: string;
  value: number;
  unit: string;
  change: number;
  changeGood: boolean;
  sparklineData: number[];
  color: string;
  target?: number;
  timeRangeLabel: string;
}

export function NutritionMetricCard({
  label,
  value,
  unit,
  change,
  changeGood,
  sparklineData,
  color,
  target,
  timeRangeLabel,
}: NutritionMetricCardProps): React.ReactElement {
  // Determine color and icon based on whether change is good
  const changeColor =
    change === 0
      ? 'text-text-muted'
      : changeGood
        ? 'text-emerald-400'
        : 'text-rose-400';

  const changeSign = change > 0 ? '+' : '';
  const changePercent = target ? Math.round((change / target) * 100) : 0;

  const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;

  return (
    <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-semibold text-text-primary">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">{timeRangeLabel} Avg:</span>
          <span className="text-xl font-bold text-text-primary">
            {value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-xs text-text-muted">{unit}</span>
        </div>
      </div>

      {/* Change indicator */}
      {change !== 0 && (
        <div className={`flex items-center gap-1 mb-2 ${changeColor}`}>
          <TrendIcon size={12} />
          <span className="text-xs font-medium">
            {changeSign}{change.toFixed(0)}{unit}
            {changePercent !== 0 && ` (${changeSign}${changePercent}%)`}
          </span>
          <span className="text-[10px] text-text-muted ml-1">vs prev period</span>
        </div>
      )}

      {/* Chart */}
      <NutritionTrendChart
        data={sparklineData}
        color={color}
        height={70}
        target={target}
        showTarget={!!target}
      />

      {/* Target indicator */}
      {target && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
          <span className="text-[10px] text-text-muted">Target: {target.toLocaleString()}{unit}</span>
          <span
            className={`text-[10px] font-medium ${
              value >= target * 0.9 && value <= target * 1.1
                ? 'text-emerald-400'
                : value >= target * 0.7
                  ? 'text-amber-400'
                  : 'text-rose-400'
            }`}
          >
            {Math.round((value / target) * 100)}% of goal
          </span>
        </div>
      )}
    </div>
  );
}
