/**
 * Wellness Trends Section - 4 individual metric cards with time range selection
 */

import { useState } from 'react';
import { HistoryLog } from '../../components/history/types';
import { WellnessMetricCard } from './WellnessMetricCard';

// Time range options
type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y';

const TIME_RANGES: TimeRange[] = ['1W', '1M', '3M', '6M', '1Y'];

const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
};

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  '1W': 'Weekly',
  '1M': 'Monthly',
  '3M': '3-Month',
  '6M': '6-Month',
  '1Y': 'Yearly',
};

// Helper to extract metric data for a time range
function getMetricSparkline(
  history: Record<string, HistoryLog>,
  metric: keyof Pick<HistoryLog, 'mood' | 'energy' | 'stress' | 'sleepQuality'>,
  days: number
): number[] {
  const data: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const log = history[dateStr];
    if (log) {
      data.push(log[metric]);
    }
  }
  return data;
}

// Downsample to fixed points for smooth display
function downsampleData(data: number[], targetPoints: number = 30): number[] {
  if (data.length <= targetPoints) return data;

  const chunkSize = data.length / targetPoints;
  const result: number[] = [];

  for (let i = 0; i < targetPoints; i++) {
    const start = Math.floor(i * chunkSize);
    const end = Math.floor((i + 1) * chunkSize);
    const chunk = data.slice(start, end);
    const avg = chunk.reduce((sum, val) => sum + val, 0) / chunk.length;
    result.push(avg);
  }

  return result;
}

// Calculate average of an array
function calculateAverage(data: number[]): number {
  if (data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
}

// Calculate percentage change between current and previous period
function calculatePeriodChange(
  history: Record<string, HistoryLog>,
  metric: keyof Pick<HistoryLog, 'mood' | 'energy' | 'stress' | 'sleepQuality'>,
  days: number
): { currentAvg: number; change: number } {
  // Get current period data
  const currentData = getMetricSparkline(history, metric, days);
  const currentAvg = calculateAverage(currentData);

  // Get previous period data (same length, starting from end of current period)
  const previousData: number[] = [];
  for (let i = days * 2 - 1; i >= days; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const log = history[dateStr];
    if (log) {
      previousData.push(log[metric]);
    }
  }
  const previousAvg = calculateAverage(previousData);

  // Calculate point change (difference between current and previous average)
  const change = currentAvg - previousAvg;

  return { currentAvg, change };
}

interface WellnessTrendsProps {
  history: Record<string, HistoryLog>;
}

export function WellnessTrends({ history }: WellnessTrendsProps): React.ReactElement {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const days = TIME_RANGE_DAYS[timeRange];
  const timeRangeLabel = TIME_RANGE_LABELS[timeRange];

  // Extract and downsample data for sparklines
  const moodData = downsampleData(getMetricSparkline(history, 'mood', days));
  const energyData = downsampleData(getMetricSparkline(history, 'energy', days));
  const stressData = downsampleData(getMetricSparkline(history, 'stress', days));
  const sleepData = downsampleData(getMetricSparkline(history, 'sleepQuality', days));

  // Calculate period averages and changes
  const moodStats = calculatePeriodChange(history, 'mood', days);
  const energyStats = calculatePeriodChange(history, 'energy', days);
  const stressStats = calculatePeriodChange(history, 'stress', days);
  const sleepStats = calculatePeriodChange(history, 'sleepQuality', days);

  // Determine if change is good (for coloring)
  // Mood up = good, Energy up = good, Stress down = good, Sleep up = good
  const moodChangeGood = moodStats.change >= 0;
  const energyChangeGood = energyStats.change >= 0;
  const stressChangeGood = stressStats.change <= 0; // Stress decreasing is GOOD
  const sleepChangeGood = sleepStats.change >= 0;

  return (
    <div className="space-y-4">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-primary">
          Wellness Trends
        </h3>
        <div className="flex gap-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                timeRange === range
                  ? 'bg-white/10 text-text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Metric Cards in vertical stack */}
      <div className="space-y-3">
        <WellnessMetricCard
          label="Mood"
          value={moodStats.currentAvg.toFixed(1)}
          unit="/10"
          change={moodStats.change}
          changeGood={moodChangeGood}
          sparklineData={moodData}
          color="#10b981"
          timeRangeLabel={timeRangeLabel}
        />
        <WellnessMetricCard
          label="Energy"
          value={energyStats.currentAvg.toFixed(1)}
          unit="/10"
          change={energyStats.change}
          changeGood={energyChangeGood}
          sparklineData={energyData}
          color="#f59e0b"
          timeRangeLabel={timeRangeLabel}
        />
        <WellnessMetricCard
          label="Stress"
          value={stressStats.currentAvg.toFixed(1)}
          unit="/10"
          change={stressStats.change}
          changeGood={stressChangeGood}
          sparklineData={stressData}
          color="#f43f5e"
          timeRangeLabel={timeRangeLabel}
        />
        <WellnessMetricCard
          label="Sleep Quality"
          value={sleepStats.currentAvg.toFixed(1)}
          unit="/10"
          change={sleepStats.change}
          changeGood={sleepChangeGood}
          sparklineData={sleepData}
          color="#8b5cf6"
          timeRangeLabel={timeRangeLabel}
        />
      </div>
    </div>
  );
}
