/**
 * Nutrition Trends Section - Multiple metric cards with time range selection
 * Shows calories, protein, fiber, sodium, sugar, water trends
 */

import { useState, useMemo } from 'react';
import type { DailyFoodData } from '../../../../hooks/nutrition';
import { NutritionMetricCard } from './NutritionMetricCard';

// Time range options
type TimeRange = '1W' | '1M' | '3M' | '6M';

const TIME_RANGES: TimeRange[] = ['1W', '1M', '3M', '6M'];

const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
};

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  '1W': 'Weekly',
  '1M': 'Monthly',
  '3M': '3-Month',
  '6M': '6-Month',
};

// Metric configuration
interface MetricConfig {
  key: keyof DailyFoodData['totals'];
  label: string;
  unit: string;
  color: string;
  goodDirection: 'up' | 'down' | 'stable';
  targetKey?: keyof NutritionTargets;
}

interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  water: number;
}

const METRICS: MetricConfig[] = [
  { key: 'calories', label: 'Calories', unit: 'cal', color: '#f59e0b', goodDirection: 'stable', targetKey: 'calories' },
  { key: 'protein', label: 'Protein', unit: 'g', color: '#f43f5e', goodDirection: 'up', targetKey: 'protein' },
  { key: 'fiber', label: 'Fiber', unit: 'g', color: '#10b981', goodDirection: 'up', targetKey: 'fiber' },
  { key: 'sodium', label: 'Sodium', unit: 'mg', color: '#ef4444', goodDirection: 'down', targetKey: 'sodium' },
];

// Helper to extract metric data for a time range
function getMetricSparkline(
  history: DailyFoodData[],
  metric: keyof DailyFoodData['totals'],
  days: number
): number[] {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return history
    .filter((d) => {
      const date = new Date(d.date);
      return date >= startDate && date <= endDate;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((d) => d.totals[metric] || 0);
}

// Downsample data for smooth display
function downsampleData(data: number[], targetPoints: number = 30): number[] {
  if (data.length <= targetPoints) return data;

  const chunkSize = data.length / targetPoints;
  const result: number[] = [];

  for (let i = 0; i < targetPoints; i++) {
    const start = Math.floor(i * chunkSize);
    const end = Math.floor((i + 1) * chunkSize);
    const chunk = data.slice(start, end);
    const avg = chunk.length > 0 ? chunk.reduce((sum, val) => sum + val, 0) / chunk.length : 0;
    result.push(avg);
  }

  return result;
}

// Calculate average
function calculateAverage(data: number[]): number {
  if (data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
}

// Calculate period change
function calculatePeriodChange(
  history: DailyFoodData[],
  metric: keyof DailyFoodData['totals'],
  days: number
): { currentAvg: number; change: number } {
  const currentData = getMetricSparkline(history, metric, days);
  const currentAvg = calculateAverage(currentData);

  // Get previous period data
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - days);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days * 2);

  const previousData = history
    .filter((d) => {
      const date = new Date(d.date);
      return date >= startDate && date < endDate;
    })
    .map((d) => d.totals[metric] || 0);

  const previousAvg = calculateAverage(previousData);
  const change = currentAvg - previousAvg;

  return { currentAvg, change };
}

interface NutritionTrendsProps {
  history: DailyFoodData[];
  targets: NutritionTargets;
}

export function NutritionTrends({ history, targets }: NutritionTrendsProps): React.ReactElement {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const days = TIME_RANGE_DAYS[timeRange];
  const timeRangeLabel = TIME_RANGE_LABELS[timeRange];

  // Calculate metrics for each card
  const metricsData = useMemo(() => {
    return METRICS.map((metric) => {
      const sparklineData = downsampleData(getMetricSparkline(history, metric.key, days));
      const { currentAvg, change } = calculatePeriodChange(history, metric.key, days);

      // Determine if change is good based on metric direction
      let changeGood = false;
      if (metric.goodDirection === 'up') changeGood = change >= 0;
      else if (metric.goodDirection === 'down') changeGood = change <= 0;
      else {
        // Stable - good if close to target
        const target = metric.targetKey ? targets[metric.targetKey] : 0;
        const prevRatio = (currentAvg - change) / target;
        const currRatio = currentAvg / target;
        changeGood = Math.abs(currRatio - 1) <= Math.abs(prevRatio - 1);
      }

      return {
        ...metric,
        sparklineData,
        currentAvg,
        change,
        changeGood,
        target: metric.targetKey ? targets[metric.targetKey] : undefined,
      };
    });
  }, [history, days, targets]);

  return (
    <div className="space-y-4">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-primary">Nutrition Trends</h3>
        <div className="flex gap-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                timeRange === range
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="space-y-3">
        {metricsData.map((metric) => (
          <NutritionMetricCard
            key={metric.key}
            label={metric.label}
            value={metric.currentAvg}
            unit={metric.unit}
            change={metric.change}
            changeGood={metric.changeGood}
            sparklineData={metric.sparklineData}
            color={metric.color}
            target={metric.target}
            timeRangeLabel={timeRangeLabel}
          />
        ))}
      </div>
    </div>
  );
}
