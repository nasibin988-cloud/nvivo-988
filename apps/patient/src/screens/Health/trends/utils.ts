/**
 * Health Trends Utility Functions
 * Data processing and metric building utilities
 */

import {
  getSparklineData,
  calculateTrendChange,
  type TimeRange,
  type HealthTrendsData,
} from '../../../hooks/dashboard';
import { CHART_DISPLAY_POINTS, type TrendDirection, type MetricConfig, type MetricCardProps } from './types';

/**
 * Generate fallback sparkline data for demo/offline mode
 */
export function generateFallbackSparkline(
  base: number,
  variance: number,
  trend: TrendDirection,
  points: number = CHART_DISPLAY_POINTS
): number[] {
  const data: number[] = [];
  let current = base - (trend === 'up' ? variance : trend === 'down' ? -variance : 0);

  for (let i = 0; i < points; i++) {
    const noise = (Math.random() - 0.5) * variance * 0.4;
    const trendAdjust = trend === 'up' ? (variance * 2) / points : trend === 'down' ? (-variance * 2) / points : 0;
    current = current + trendAdjust + noise;
    data.push(Math.round(current * 100) / 100);
  }

  return data;
}

/**
 * Downsample data by averaging chunks for smooth display
 * Ensures charts look consistent regardless of time range
 */
export function downsampleWithAveraging(data: number[], targetPoints: number): number[] {
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

/**
 * Build metric card props from configuration and data
 */
export function buildMetricProps(
  config: MetricConfig,
  trendsData: HealthTrendsData | undefined,
  _timeRange: TimeRange
): MetricCardProps {
  // Handle sparse data (imaging metrics with few data points)
  if (config.sparseData) {
    const currentValue = config.sparseData[config.sparseData.length - 1];
    const firstValue = config.sparseData[0];
    const diff = currentValue - firstValue;
    const percentChange = Math.abs(diff / firstValue) * 100;

    let trendDirection: TrendDirection = 'stable';
    if (percentChange >= 2) {
      trendDirection = diff > 0 ? 'up' : 'down';
    }

    const decimals = config.decimals ?? 0;
    const formattedValue =
      decimals > 0 ? currentValue.toFixed(decimals) : Math.round(currentValue).toLocaleString();

    return {
      label: config.label,
      value: formattedValue,
      unit: config.unit,
      trend: trendDirection,
      trendGood: config.trendGood,
      sparklineData: config.sparseData,
      color: config.color,
    };
  }

  // Get all data for the time range (continuous metrics)
  const rawSparklineData = getSparklineData(trendsData, config.id, 365);
  const trendChange = calculateTrendChange(trendsData, config.id);
  const latestMetric = trendsData?.latest?.[config.id];

  const hasData = rawSparklineData.length > 2;
  const currentValue = hasData
    ? rawSparklineData[rawSparklineData.length - 1]
    : (config.fallbackBase ?? 0);

  // Downsample to fixed points for consistent smooth display
  let finalSparkline: number[];
  if (hasData) {
    finalSparkline = downsampleWithAveraging(rawSparklineData, CHART_DISPLAY_POINTS);
  } else {
    finalSparkline = generateFallbackSparkline(
      config.fallbackBase ?? 50,
      config.fallbackVariance ?? 5,
      config.fallbackTrend ?? 'stable',
      CHART_DISPLAY_POINTS
    );
  }

  const trendDirection = hasData
    ? trendChange.direction
    : ((latestMetric?.trend as TrendDirection) ?? config.fallbackTrend ?? 'stable');

  const decimals = config.decimals ?? 0;
  const formattedValue =
    decimals > 0 ? currentValue.toFixed(decimals) : Math.round(currentValue).toLocaleString();

  return {
    label: config.label,
    value: formattedValue,
    unit: config.unit,
    trend: trendDirection,
    trendGood: config.trendGood,
    sparklineData: finalSparkline,
    color: config.color,
  };
}
