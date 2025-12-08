/**
 * Health Trends Tab
 * Categories: Sleep, Cardio, Cognitive, Metabolic, Activity, Biomarkers, Labs
 */

import { useState, useMemo } from 'react';
import {
  Heart,
  Brain,
  Flame,
  Droplet,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Moon,
  Footprints,
  ChevronRight,
  Loader2,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  useHealthTrends,
  getSparklineData,
  calculateTrendChange,
  type TimeRange,
  type HealthTrendsData,
} from '../../../hooks/dashboard';

type SubTab = 'sleep' | 'cardio' | 'cognitive' | 'metabolic' | 'activity' | 'biomarkers' | 'labs';
type TrendDirection = 'up' | 'down' | 'stable';

const TEST_PATIENT_ID = 'sarah-mitchell-test';

const subtabs: { id: SubTab; label: string; icon: typeof Heart }[] = [
  { id: 'sleep', label: 'Sleep', icon: Moon },
  { id: 'cardio', label: 'Cardio', icon: Heart },
  { id: 'cognitive', label: 'Brain', icon: Brain },
  { id: 'metabolic', label: 'Metabolic', icon: Flame },
  { id: 'activity', label: 'Activity', icon: Footprints },
  { id: 'biomarkers', label: 'Bio', icon: Droplet },
  { id: 'labs', label: 'Labs', icon: FileText },
];

const timeRanges: TimeRange[] = ['1W', '1M', '3M', '6M', '1Y'];

// Category colors
const categoryColors: Record<SubTab, string> = {
  sleep: '#6366f1',
  cardio: '#f43f5e',
  cognitive: '#8b5cf6',
  metabolic: '#f59e0b',
  activity: '#10b981',
  biomarkers: '#3b82f6',
  labs: '#64748b',
};

// NVIVO Insights
const insightsByCategory: Record<SubTab, { insight: string; recommendation: string }> = {
  sleep: {
    insight: 'Your sleep efficiency has improved 8% this month. Deep sleep duration is now within optimal range at 1.5 hours average.',
    recommendation: 'Maintain your consistent bedtime routine. Consider reducing screen time 1 hour before bed.',
  },
  cardio: {
    insight: 'CCTA shows plaque regression with FFR-CT improving from 0.82 to 0.88. Resting heart rate decreased 5%, indicating improved cardiovascular fitness.',
    recommendation: 'Continue statin therapy and current exercise routine. Follow-up CCTA in 12-18 months.',
  },
  cognitive: {
    insight: 'Memory and focus scores trending upward. Cognitive age estimated 4 years younger than biological age.',
    recommendation: 'Sleep consistency is helping. Try adding omega-3 rich foods for additional support.',
  },
  metabolic: {
    insight: 'Fasting glucose within optimal range. Weight trend shows steady progress toward your goal.',
    recommendation: 'Maintain current eating window. Consider tracking post-meal glucose for more insights.',
  },
  activity: {
    insight: 'You\'ve hit your step goal 6 out of 7 days. Active minutes up 15% compared to last month.',
    recommendation: 'Great momentum! Try adding one strength training session per week.',
  },
  biomarkers: {
    insight: 'LDL cholesterol dropped 15 points since starting. Vitamin D now in optimal range at 42 ng/mL.',
    recommendation: 'Continue supplements. Schedule follow-up lipid panel in 3 months.',
  },
  labs: {
    insight: 'All key markers within normal ranges. Metabolic panel shows excellent kidney and liver function.',
    recommendation: 'Maintain annual comprehensive panels. Consider adding inflammatory markers next time.',
  },
};

// NVIVO Insight Component
function NvivoInsight({ category, color }: { category: SubTab; color: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const insight = insightsByCategory[category];

  return (
    <div
      className="bg-gradient-to-br from-surface to-surface/50 rounded-2xl border border-white/[0.06] p-4 mt-4"
      style={{ borderColor: `${color}20` }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}15` }}>
            <Sparkles size={14} style={{ color }} />
          </div>
          <span className="text-sm font-medium text-text-primary">NVIVO Insight</span>
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className="text-text-muted" />
        ) : (
          <ChevronDown size={16} className="text-text-muted" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-white/[0.04] space-y-3">
          <p className="text-xs text-text-secondary leading-relaxed">{insight.insight}</p>
          <div className="bg-white/[0.02] rounded-xl p-3">
            <span className="text-[10px] text-text-muted uppercase tracking-wide">Recommendation</span>
            <p className="text-xs text-text-primary mt-1">{insight.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple Line Chart Component - basic polyline approach
interface TrendChartProps {
  data: number[];
  color: string;
  height?: number;
}

function TrendChart({ data, color, height = 70 }: TrendChartProps) {
  if (data.length < 2) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-text-muted text-xs">
        No data
      </div>
    );
  }

  const padding = 4;
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;

  // Generate polyline points string
  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (100 - padding * 2);
    const y = padding + (1 - (val - minVal) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  // Generate area polygon points (for fill)
  const areaPoints = [
    `${padding},${height - padding}`,
    ...data.map((val, i) => {
      const x = padding + (i / (data.length - 1)) * (100 - padding * 2);
      const y = padding + (1 - (val - minVal) / range) * (height - padding * 2);
      return `${x},${y}`;
    }),
    `${100 - padding},${height - padding}`,
  ].join(' ');

  const displayMin = Math.round(minVal);
  const displayMax = Math.round(maxVal);

  return (
    <div className="relative" style={{ height }}>
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none z-10" style={{ paddingTop: padding, paddingBottom: padding }}>
        <span className="text-[9px] text-text-muted/50 leading-none">{displayMax}</span>
        <span className="text-[9px] text-text-muted/50 leading-none">{displayMin}</span>
      </div>

      <svg
        width="100%"
        height={height}
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
      >
        {/* Subtle gradient fill */}
        <defs>
          <linearGradient id={`fill-${color.slice(1)}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <polygon
          points={areaPoints}
          fill={`url(#fill-${color.slice(1)})`}
        />

        {/* Main line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

// Trend Label Component
function TrendLabel({ direction, isGoodTrend = true }: { direction: TrendDirection; isGoodTrend?: boolean }) {
  const config: Record<TrendDirection, { icon: typeof TrendingUp; label: string }> = {
    up: { icon: TrendingUp, label: 'Increasing' },
    down: { icon: TrendingDown, label: 'Decreasing' },
    stable: { icon: Minus, label: 'Stable' },
  };

  const { icon: Icon, label } = config[direction];

  let colorClass = 'text-text-muted';
  if (direction !== 'stable') {
    const isPositive = (direction === 'up' && isGoodTrend) || (direction === 'down' && !isGoodTrend);
    colorClass = isPositive ? 'text-emerald-400' : 'text-amber-400';
  }

  return (
    <div className={`flex items-center gap-1 ${colorClass}`}>
      <Icon size={12} />
      <span className="text-[11px] font-medium">{label}</span>
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
  trend: TrendDirection;
  trendGood?: boolean;
  sparklineData: number[];
  color: string;
}

function MetricCard({
  label,
  value,
  unit,
  trend,
  trendGood = true,
  sparklineData,
  color,
}: MetricCardProps) {
  const isGoodTrend = trendGood
    ? (trend === 'up' || trend === 'stable')
    : (trend === 'down' || trend === 'stable');

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

      {/* Chart - 70px height (15% taller than 60px) */}
      <TrendChart data={sparklineData} color={color} height={70} />
    </div>
  );
}

// Metric configurations
interface MetricConfig {
  id: string;
  label: string;
  unit: string;
  color: string;
  trendGood?: boolean;
  decimals?: number;
  fallbackBase?: number;
  fallbackVariance?: number;
  fallbackTrend?: TrendDirection;
  sparseData?: number[]; // For imaging metrics with only a few data points (e.g., 3 CCTA scans)
}

// Sleep metrics
const sleepMetricConfigs: MetricConfig[] = [
  { id: 'sleep_duration', label: 'Sleep Duration', unit: 'hrs', color: '#6366f1', trendGood: true, decimals: 1, fallbackBase: 7.2, fallbackVariance: 0.8, fallbackTrend: 'up' },
  { id: 'sleep_score', label: 'Sleep Quality', unit: '%', color: '#8b5cf6', trendGood: true, fallbackBase: 78, fallbackVariance: 8, fallbackTrend: 'up' },
  { id: 'deep_sleep', label: 'Deep Sleep', unit: 'hrs', color: '#3b82f6', trendGood: true, decimals: 1, fallbackBase: 1.4, fallbackVariance: 0.3, fallbackTrend: 'up' },
  { id: 'rem_sleep', label: 'REM Sleep', unit: 'hrs', color: '#a855f7', trendGood: true, decimals: 1, fallbackBase: 1.8, fallbackVariance: 0.4, fallbackTrend: 'stable' },
  { id: 'sleep_latency', label: 'Time to Sleep', unit: 'min', color: '#f59e0b', trendGood: false, fallbackBase: 12, fallbackVariance: 5, fallbackTrend: 'down' },
  { id: 'sleep_efficiency', label: 'Efficiency', unit: '%', color: '#10b981', trendGood: true, fallbackBase: 91, fallbackVariance: 4, fallbackTrend: 'up' },
];

// Cardio metrics (includes CCTA imaging data)
const cardioMetricConfigs: MetricConfig[] = [
  { id: 'rhr', label: 'Resting Heart Rate', unit: 'bpm', color: '#f43f5e', trendGood: false, fallbackBase: 65, fallbackVariance: 5, fallbackTrend: 'down' },
  { id: 'hrv', label: 'Heart Rate Variability', unit: 'ms', color: '#8b5cf6', trendGood: true, fallbackBase: 43, fallbackVariance: 8, fallbackTrend: 'up' },
  { id: 'bp_systolic', label: 'BP Systolic', unit: 'mmHg', color: '#3b82f6', trendGood: false, fallbackBase: 118, fallbackVariance: 6, fallbackTrend: 'stable' },
  { id: 'bp_diastolic', label: 'BP Diastolic', unit: 'mmHg', color: '#06b6d4', trendGood: false, fallbackBase: 78, fallbackVariance: 4, fallbackTrend: 'down' },
  // CCTA Imaging Metrics (3 scans over past year: Dec 2023, Jun 2024, Oct 2024)
  { id: 'ffr_ct', label: 'FFR-CT', unit: '', color: '#ec4899', trendGood: true, decimals: 2, sparseData: [0.82, 0.85, 0.88] },
  { id: 'plaque_volume', label: 'Plaque Volume', unit: 'mm³', color: '#fb923c', trendGood: false, sparseData: [168, 155, 142] },
  { id: 'lrnc_volume', label: 'LRNC Volume', unit: 'mm³', color: '#fbbf24', trendGood: false, decimals: 1, sparseData: [12.5, 10.2, 8.2] },
];

// Cognitive metrics
const cognitiveMetricConfigs: MetricConfig[] = [
  { id: 'memory_score', label: 'Memory Score', unit: '%', color: '#8b5cf6', trendGood: true, fallbackBase: 88, fallbackVariance: 5, fallbackTrend: 'up' },
  { id: 'processing_speed', label: 'Processing Speed', unit: '%', color: '#f59e0b', trendGood: true, fallbackBase: 86, fallbackVariance: 4, fallbackTrend: 'stable' },
  { id: 'focus_score', label: 'Focus Score', unit: '%', color: '#10b981', trendGood: true, fallbackBase: 72, fallbackVariance: 8, fallbackTrend: 'up' },
  { id: 'cognitive_age', label: 'Cognitive Age', unit: 'yrs', color: '#ec4899', trendGood: false, fallbackBase: 40, fallbackVariance: 2, fallbackTrend: 'down' },
];

// Metabolic metrics
const metabolicMetricConfigs: MetricConfig[] = [
  { id: 'fasting_glucose', label: 'Fasting Glucose', unit: 'mg/dL', color: '#f59e0b', trendGood: false, fallbackBase: 98, fallbackVariance: 8, fallbackTrend: 'down' },
  { id: 'hba1c', label: 'HbA1c', unit: '%', color: '#ef4444', trendGood: false, decimals: 1, fallbackBase: 5.4, fallbackVariance: 0.2, fallbackTrend: 'stable' },
  { id: 'weight', label: 'Weight', unit: 'lbs', color: '#3b82f6', trendGood: false, decimals: 1, fallbackBase: 171, fallbackVariance: 4, fallbackTrend: 'down' },
  { id: 'bmi', label: 'BMI', unit: '', color: '#f97316', trendGood: false, decimals: 1, fallbackBase: 24.6, fallbackVariance: 0.5, fallbackTrend: 'down' },
];

// Activity metrics
const activityMetricConfigs: MetricConfig[] = [
  { id: 'steps', label: 'Daily Steps', unit: '', color: '#10b981', trendGood: true, fallbackBase: 7200, fallbackVariance: 1500, fallbackTrend: 'up' },
  { id: 'active_minutes', label: 'Active Minutes', unit: 'min', color: '#3b82f6', trendGood: true, fallbackBase: 45, fallbackVariance: 15, fallbackTrend: 'up' },
  { id: 'calories_burned', label: 'Calories Burned', unit: 'kcal', color: '#f97316', trendGood: true, fallbackBase: 2100, fallbackVariance: 300, fallbackTrend: 'up' },
  { id: 'exercise_minutes', label: 'Weekly Exercise', unit: 'min/wk', color: '#8b5cf6', trendGood: true, fallbackBase: 180, fallbackVariance: 45, fallbackTrend: 'up' },
];

// Biomarker metrics
const biomarkerMetricConfigs: MetricConfig[] = [
  { id: 'ldl', label: 'LDL Cholesterol', unit: 'mg/dL', color: '#ef4444', trendGood: false, fallbackBase: 110, fallbackVariance: 15, fallbackTrend: 'down' },
  { id: 'hdl', label: 'HDL Cholesterol', unit: 'mg/dL', color: '#22c55e', trendGood: true, fallbackBase: 54, fallbackVariance: 5, fallbackTrend: 'up' },
  { id: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL', color: '#f59e0b', trendGood: false, fallbackBase: 142, fallbackVariance: 20, fallbackTrend: 'down' },
  { id: 'vitamin_d', label: 'Vitamin D', unit: 'ng/mL', color: '#fbbf24', trendGood: true, fallbackBase: 42, fallbackVariance: 10, fallbackTrend: 'up' },
];

// Fixed number of display points for consistent smooth charts
const CHART_DISPLAY_POINTS = 30;

// Generate fallback sparkline
function generateFallbackSparkline(base: number, variance: number, trend: TrendDirection, points: number = CHART_DISPLAY_POINTS): number[] {
  const data: number[] = [];
  let current = base - (trend === 'up' ? variance : trend === 'down' ? -variance : 0);
  for (let i = 0; i < points; i++) {
    const noise = (Math.random() - 0.5) * variance * 0.4;
    const trendAdjust = trend === 'up' ? (variance * 2 / points) : trend === 'down' ? (-variance * 2 / points) : 0;
    current = current + trendAdjust + noise;
    data.push(Math.round(current * 100) / 100);
  }
  return data;
}

/**
 * Downsample data by averaging chunks for smooth display
 * This ensures charts look consistent regardless of time range
 */
function downsampleWithAveraging(data: number[], targetPoints: number): number[] {
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

// Build metric props
function buildMetricProps(config: MetricConfig, trendsData: HealthTrendsData | undefined, timeRange: TimeRange): MetricCardProps {
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
    const formattedValue = decimals > 0 ? currentValue.toFixed(decimals) : Math.round(currentValue).toLocaleString();

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
  const rawSparklineData = getSparklineData(trendsData, config.id, 365); // Get all available data
  const trendChange = calculateTrendChange(trendsData, config.id);
  const latestMetric = trendsData?.latest?.[config.id];

  const hasData = rawSparklineData.length > 2;
  const currentValue = hasData ? rawSparklineData[rawSparklineData.length - 1] : config.fallbackBase ?? 0;

  // Downsample to fixed points for consistent smooth display
  let finalSparkline: number[];
  if (hasData) {
    finalSparkline = downsampleWithAveraging(rawSparklineData, CHART_DISPLAY_POINTS);
  } else {
    finalSparkline = generateFallbackSparkline(config.fallbackBase ?? 50, config.fallbackVariance ?? 5, config.fallbackTrend ?? 'stable', CHART_DISPLAY_POINTS);
  }

  const trendDirection = hasData
    ? trendChange.direction
    : (latestMetric?.trend as TrendDirection ?? config.fallbackTrend ?? 'stable');

  const decimals = config.decimals ?? 0;
  const formattedValue = decimals > 0 ? currentValue.toFixed(decimals) : Math.round(currentValue).toLocaleString();

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

// Lab Test Interface
interface LabTest {
  name: string;
  value: string;
  unit: string;
  target: string;
  status: 'normal' | 'low' | 'high';
}

// Lab Panel Interface
interface LabPanel {
  id: string;
  name: string;
  date: string; // mm/dd/yy format
  tests: LabTest[];
  overallStatus: 'All Normal' | string;
}

// All Lab Panels Data - Current (latest) results shown on main Labs tab
const currentLabPanels: LabPanel[] = [
  {
    id: 'lipid-2024-12-01',
    name: 'Lipid Panel',
    date: '12/01/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'Total Cholesterol', value: '186', unit: 'mg/dL', target: '<200', status: 'normal' },
      { name: 'LDL Cholesterol', value: '108', unit: 'mg/dL', target: '<100', status: 'high' },
      { name: 'HDL Cholesterol', value: '56', unit: 'mg/dL', target: '>40', status: 'normal' },
      { name: 'Triglycerides', value: '142', unit: 'mg/dL', target: '<150', status: 'normal' },
      { name: 'VLDL Cholesterol', value: '28', unit: 'mg/dL', target: '<30', status: 'normal' },
      { name: 'Total/HDL Ratio', value: '3.3', unit: '', target: '<5.0', status: 'normal' },
    ],
  },
  {
    id: 'cbc-2024-12-01',
    name: 'Complete Blood Count',
    date: '12/01/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'Hemoglobin', value: '14.2', unit: 'g/dL', target: '12-16', status: 'normal' },
      { name: 'Hematocrit', value: '42.1', unit: '%', target: '36-48', status: 'normal' },
      { name: 'White Blood Cells', value: '6.8', unit: 'K/uL', target: '4.5-11', status: 'normal' },
      { name: 'Red Blood Cells', value: '4.72', unit: 'M/uL', target: '4.0-5.5', status: 'normal' },
      { name: 'Platelets', value: '245', unit: 'K/uL', target: '150-400', status: 'normal' },
      { name: 'MCV', value: '89.2', unit: 'fL', target: '80-100', status: 'normal' },
      { name: 'MCH', value: '30.1', unit: 'pg', target: '27-33', status: 'normal' },
      { name: 'MCHC', value: '33.7', unit: 'g/dL', target: '32-36', status: 'normal' },
    ],
  },
  {
    id: 'cmp-2024-12-01',
    name: 'Comprehensive Metabolic Panel',
    date: '12/01/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'Glucose, Fasting', value: '94', unit: 'mg/dL', target: '70-100', status: 'normal' },
      { name: 'BUN', value: '15', unit: 'mg/dL', target: '7-20', status: 'normal' },
      { name: 'Creatinine', value: '0.9', unit: 'mg/dL', target: '0.6-1.2', status: 'normal' },
      { name: 'eGFR', value: '95', unit: 'mL/min', target: '>60', status: 'normal' },
      { name: 'Sodium', value: '140', unit: 'mEq/L', target: '136-145', status: 'normal' },
      { name: 'Potassium', value: '4.2', unit: 'mEq/L', target: '3.5-5.0', status: 'normal' },
      { name: 'Chloride', value: '101', unit: 'mEq/L', target: '98-106', status: 'normal' },
      { name: 'CO2', value: '24', unit: 'mEq/L', target: '22-29', status: 'normal' },
      { name: 'Calcium', value: '9.4', unit: 'mg/dL', target: '8.5-10.5', status: 'normal' },
      { name: 'Total Protein', value: '7.0', unit: 'g/dL', target: '6.0-8.3', status: 'normal' },
      { name: 'Albumin', value: '4.2', unit: 'g/dL', target: '3.5-5.0', status: 'normal' },
      { name: 'Bilirubin, Total', value: '0.8', unit: 'mg/dL', target: '0.1-1.2', status: 'normal' },
      { name: 'AST (SGOT)', value: '24', unit: 'U/L', target: '10-40', status: 'normal' },
      { name: 'ALT (SGPT)', value: '28', unit: 'U/L', target: '7-56', status: 'normal' },
    ],
  },
  {
    id: 'hba1c-2024-12-01',
    name: 'Hemoglobin A1c',
    date: '12/01/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'HbA1c', value: '5.4', unit: '%', target: '<5.7', status: 'normal' },
      { name: 'Est. Avg Glucose', value: '108', unit: 'mg/dL', target: '<117', status: 'normal' },
    ],
  },
  {
    id: 'thyroid-2024-12-01',
    name: 'Thyroid Panel',
    date: '12/01/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'TSH', value: '2.1', unit: 'mIU/L', target: '0.4-4.0', status: 'normal' },
      { name: 'Free T4', value: '1.2', unit: 'ng/dL', target: '0.8-1.8', status: 'normal' },
      { name: 'Free T3', value: '3.1', unit: 'pg/mL', target: '2.3-4.2', status: 'normal' },
    ],
  },
  {
    id: 'vitamin-2024-12-01',
    name: 'Vitamin Panel',
    date: '12/01/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'Vitamin D, 25-OH', value: '42', unit: 'ng/mL', target: '30-100', status: 'normal' },
      { name: 'Vitamin B12', value: '510', unit: 'pg/mL', target: '200-900', status: 'normal' },
      { name: 'Folate', value: '14.2', unit: 'ng/mL', target: '>3.0', status: 'normal' },
      { name: 'Ferritin', value: '82', unit: 'ng/mL', target: '20-200', status: 'normal' },
      { name: 'Iron, Total', value: '98', unit: 'mcg/dL', target: '60-170', status: 'normal' },
    ],
  },
  {
    id: 'inflammation-2024-12-01',
    name: 'Inflammatory Markers',
    date: '12/01/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'hs-CRP', value: '0.9', unit: 'mg/L', target: '<1.0', status: 'normal' },
      { name: 'ESR', value: '8', unit: 'mm/hr', target: '0-20', status: 'normal' },
      { name: 'Homocysteine', value: '8.2', unit: 'umol/L', target: '<15', status: 'normal' },
    ],
  },
];

// Complete lab history with all past results
const allLabHistory: LabPanel[] = [
  // December 2024 (Latest)
  ...currentLabPanels,

  // September 2024
  {
    id: 'lipid-2024-09-15',
    name: 'Lipid Panel',
    date: '09/15/24',
    overallStatus: '1 High',
    tests: [
      { name: 'Total Cholesterol', value: '198', unit: 'mg/dL', target: '<200', status: 'normal' },
      { name: 'LDL Cholesterol', value: '118', unit: 'mg/dL', target: '<100', status: 'high' },
      { name: 'HDL Cholesterol', value: '52', unit: 'mg/dL', target: '>40', status: 'normal' },
      { name: 'Triglycerides', value: '158', unit: 'mg/dL', target: '<150', status: 'high' },
      { name: 'VLDL Cholesterol', value: '32', unit: 'mg/dL', target: '<30', status: 'high' },
      { name: 'Total/HDL Ratio', value: '3.8', unit: '', target: '<5.0', status: 'normal' },
    ],
  },
  {
    id: 'cbc-2024-09-15',
    name: 'Complete Blood Count',
    date: '09/15/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'Hemoglobin', value: '13.8', unit: 'g/dL', target: '12-16', status: 'normal' },
      { name: 'Hematocrit', value: '41.2', unit: '%', target: '36-48', status: 'normal' },
      { name: 'White Blood Cells', value: '7.1', unit: 'K/uL', target: '4.5-11', status: 'normal' },
      { name: 'Red Blood Cells', value: '4.65', unit: 'M/uL', target: '4.0-5.5', status: 'normal' },
      { name: 'Platelets', value: '238', unit: 'K/uL', target: '150-400', status: 'normal' },
      { name: 'MCV', value: '88.6', unit: 'fL', target: '80-100', status: 'normal' },
      { name: 'MCH', value: '29.7', unit: 'pg', target: '27-33', status: 'normal' },
      { name: 'MCHC', value: '33.5', unit: 'g/dL', target: '32-36', status: 'normal' },
    ],
  },
  {
    id: 'cmp-2024-09-15',
    name: 'Comprehensive Metabolic Panel',
    date: '09/15/24',
    overallStatus: '1 High',
    tests: [
      { name: 'Glucose, Fasting', value: '102', unit: 'mg/dL', target: '70-100', status: 'high' },
      { name: 'BUN', value: '16', unit: 'mg/dL', target: '7-20', status: 'normal' },
      { name: 'Creatinine', value: '0.9', unit: 'mg/dL', target: '0.6-1.2', status: 'normal' },
      { name: 'eGFR', value: '92', unit: 'mL/min', target: '>60', status: 'normal' },
      { name: 'Sodium', value: '139', unit: 'mEq/L', target: '136-145', status: 'normal' },
      { name: 'Potassium', value: '4.1', unit: 'mEq/L', target: '3.5-5.0', status: 'normal' },
      { name: 'Chloride', value: '100', unit: 'mEq/L', target: '98-106', status: 'normal' },
      { name: 'CO2', value: '25', unit: 'mEq/L', target: '22-29', status: 'normal' },
      { name: 'Calcium', value: '9.3', unit: 'mg/dL', target: '8.5-10.5', status: 'normal' },
      { name: 'Total Protein', value: '6.9', unit: 'g/dL', target: '6.0-8.3', status: 'normal' },
      { name: 'Albumin', value: '4.1', unit: 'g/dL', target: '3.5-5.0', status: 'normal' },
      { name: 'Bilirubin, Total', value: '0.7', unit: 'mg/dL', target: '0.1-1.2', status: 'normal' },
      { name: 'AST (SGOT)', value: '26', unit: 'U/L', target: '10-40', status: 'normal' },
      { name: 'ALT (SGPT)', value: '32', unit: 'U/L', target: '7-56', status: 'normal' },
    ],
  },
  {
    id: 'hba1c-2024-09-15',
    name: 'Hemoglobin A1c',
    date: '09/15/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'HbA1c', value: '5.6', unit: '%', target: '<5.7', status: 'normal' },
      { name: 'Est. Avg Glucose', value: '114', unit: 'mg/dL', target: '<117', status: 'normal' },
    ],
  },
  {
    id: 'vitamin-2024-09-15',
    name: 'Vitamin Panel',
    date: '09/15/24',
    overallStatus: '1 Low',
    tests: [
      { name: 'Vitamin D, 25-OH', value: '28', unit: 'ng/mL', target: '30-100', status: 'low' },
      { name: 'Vitamin B12', value: '485', unit: 'pg/mL', target: '200-900', status: 'normal' },
      { name: 'Folate', value: '12.5', unit: 'ng/mL', target: '>3.0', status: 'normal' },
      { name: 'Ferritin', value: '78', unit: 'ng/mL', target: '20-200', status: 'normal' },
      { name: 'Iron, Total', value: '95', unit: 'mcg/dL', target: '60-170', status: 'normal' },
    ],
  },

  // June 2024
  {
    id: 'lipid-2024-06-10',
    name: 'Lipid Panel',
    date: '06/10/24',
    overallStatus: '2 High',
    tests: [
      { name: 'Total Cholesterol', value: '212', unit: 'mg/dL', target: '<200', status: 'high' },
      { name: 'LDL Cholesterol', value: '132', unit: 'mg/dL', target: '<100', status: 'high' },
      { name: 'HDL Cholesterol', value: '48', unit: 'mg/dL', target: '>40', status: 'normal' },
      { name: 'Triglycerides', value: '172', unit: 'mg/dL', target: '<150', status: 'high' },
      { name: 'VLDL Cholesterol', value: '34', unit: 'mg/dL', target: '<30', status: 'high' },
      { name: 'Total/HDL Ratio', value: '4.4', unit: '', target: '<5.0', status: 'normal' },
    ],
  },
  {
    id: 'cmp-2024-06-10',
    name: 'Comprehensive Metabolic Panel',
    date: '06/10/24',
    overallStatus: '1 High',
    tests: [
      { name: 'Glucose, Fasting', value: '108', unit: 'mg/dL', target: '70-100', status: 'high' },
      { name: 'BUN', value: '17', unit: 'mg/dL', target: '7-20', status: 'normal' },
      { name: 'Creatinine', value: '1.0', unit: 'mg/dL', target: '0.6-1.2', status: 'normal' },
      { name: 'eGFR', value: '88', unit: 'mL/min', target: '>60', status: 'normal' },
      { name: 'Sodium', value: '141', unit: 'mEq/L', target: '136-145', status: 'normal' },
      { name: 'Potassium', value: '4.3', unit: 'mEq/L', target: '3.5-5.0', status: 'normal' },
      { name: 'Chloride', value: '102', unit: 'mEq/L', target: '98-106', status: 'normal' },
      { name: 'CO2', value: '23', unit: 'mEq/L', target: '22-29', status: 'normal' },
      { name: 'Calcium', value: '9.5', unit: 'mg/dL', target: '8.5-10.5', status: 'normal' },
      { name: 'Total Protein', value: '7.1', unit: 'g/dL', target: '6.0-8.3', status: 'normal' },
      { name: 'Albumin', value: '4.0', unit: 'g/dL', target: '3.5-5.0', status: 'normal' },
      { name: 'Bilirubin, Total', value: '0.9', unit: 'mg/dL', target: '0.1-1.2', status: 'normal' },
      { name: 'AST (SGOT)', value: '28', unit: 'U/L', target: '10-40', status: 'normal' },
      { name: 'ALT (SGPT)', value: '35', unit: 'U/L', target: '7-56', status: 'normal' },
    ],
  },
  {
    id: 'hba1c-2024-06-10',
    name: 'Hemoglobin A1c',
    date: '06/10/24',
    overallStatus: '1 High',
    tests: [
      { name: 'HbA1c', value: '5.8', unit: '%', target: '<5.7', status: 'high' },
      { name: 'Est. Avg Glucose', value: '120', unit: 'mg/dL', target: '<117', status: 'high' },
    ],
  },
  {
    id: 'thyroid-2024-06-10',
    name: 'Thyroid Panel',
    date: '06/10/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'TSH', value: '2.4', unit: 'mIU/L', target: '0.4-4.0', status: 'normal' },
      { name: 'Free T4', value: '1.1', unit: 'ng/dL', target: '0.8-1.8', status: 'normal' },
      { name: 'Free T3', value: '2.9', unit: 'pg/mL', target: '2.3-4.2', status: 'normal' },
    ],
  },

  // March 2024
  {
    id: 'lipid-2024-03-05',
    name: 'Lipid Panel',
    date: '03/05/24',
    overallStatus: '2 High',
    tests: [
      { name: 'Total Cholesterol', value: '225', unit: 'mg/dL', target: '<200', status: 'high' },
      { name: 'LDL Cholesterol', value: '145', unit: 'mg/dL', target: '<100', status: 'high' },
      { name: 'HDL Cholesterol', value: '45', unit: 'mg/dL', target: '>40', status: 'normal' },
      { name: 'Triglycerides', value: '185', unit: 'mg/dL', target: '<150', status: 'high' },
      { name: 'VLDL Cholesterol', value: '37', unit: 'mg/dL', target: '<30', status: 'high' },
      { name: 'Total/HDL Ratio', value: '5.0', unit: '', target: '<5.0', status: 'normal' },
    ],
  },
  {
    id: 'cbc-2024-03-05',
    name: 'Complete Blood Count',
    date: '03/05/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'Hemoglobin', value: '13.5', unit: 'g/dL', target: '12-16', status: 'normal' },
      { name: 'Hematocrit', value: '40.5', unit: '%', target: '36-48', status: 'normal' },
      { name: 'White Blood Cells', value: '6.5', unit: 'K/uL', target: '4.5-11', status: 'normal' },
      { name: 'Red Blood Cells', value: '4.58', unit: 'M/uL', target: '4.0-5.5', status: 'normal' },
      { name: 'Platelets', value: '232', unit: 'K/uL', target: '150-400', status: 'normal' },
      { name: 'MCV', value: '88.4', unit: 'fL', target: '80-100', status: 'normal' },
      { name: 'MCH', value: '29.5', unit: 'pg', target: '27-33', status: 'normal' },
      { name: 'MCHC', value: '33.3', unit: 'g/dL', target: '32-36', status: 'normal' },
    ],
  },
  {
    id: 'cmp-2024-03-05',
    name: 'Comprehensive Metabolic Panel',
    date: '03/05/24',
    overallStatus: '1 High',
    tests: [
      { name: 'Glucose, Fasting', value: '112', unit: 'mg/dL', target: '70-100', status: 'high' },
      { name: 'BUN', value: '18', unit: 'mg/dL', target: '7-20', status: 'normal' },
      { name: 'Creatinine', value: '1.0', unit: 'mg/dL', target: '0.6-1.2', status: 'normal' },
      { name: 'eGFR', value: '85', unit: 'mL/min', target: '>60', status: 'normal' },
      { name: 'Sodium', value: '138', unit: 'mEq/L', target: '136-145', status: 'normal' },
      { name: 'Potassium', value: '4.4', unit: 'mEq/L', target: '3.5-5.0', status: 'normal' },
      { name: 'Chloride', value: '103', unit: 'mEq/L', target: '98-106', status: 'normal' },
      { name: 'CO2', value: '24', unit: 'mEq/L', target: '22-29', status: 'normal' },
      { name: 'Calcium', value: '9.2', unit: 'mg/dL', target: '8.5-10.5', status: 'normal' },
      { name: 'Total Protein', value: '6.8', unit: 'g/dL', target: '6.0-8.3', status: 'normal' },
      { name: 'Albumin', value: '3.9', unit: 'g/dL', target: '3.5-5.0', status: 'normal' },
      { name: 'Bilirubin, Total', value: '0.8', unit: 'mg/dL', target: '0.1-1.2', status: 'normal' },
      { name: 'AST (SGOT)', value: '30', unit: 'U/L', target: '10-40', status: 'normal' },
      { name: 'ALT (SGPT)', value: '38', unit: 'U/L', target: '7-56', status: 'normal' },
    ],
  },

  // December 2023 (Annual)
  {
    id: 'lipid-2023-12-12',
    name: 'Lipid Panel',
    date: '12/12/23',
    overallStatus: '3 High',
    tests: [
      { name: 'Total Cholesterol', value: '238', unit: 'mg/dL', target: '<200', status: 'high' },
      { name: 'LDL Cholesterol', value: '158', unit: 'mg/dL', target: '<100', status: 'high' },
      { name: 'HDL Cholesterol', value: '42', unit: 'mg/dL', target: '>40', status: 'normal' },
      { name: 'Triglycerides', value: '198', unit: 'mg/dL', target: '<150', status: 'high' },
      { name: 'VLDL Cholesterol', value: '40', unit: 'mg/dL', target: '<30', status: 'high' },
      { name: 'Total/HDL Ratio', value: '5.7', unit: '', target: '<5.0', status: 'high' },
    ],
  },
  {
    id: 'cbc-2023-12-12',
    name: 'Complete Blood Count',
    date: '12/12/23',
    overallStatus: 'All Normal',
    tests: [
      { name: 'Hemoglobin', value: '13.2', unit: 'g/dL', target: '12-16', status: 'normal' },
      { name: 'Hematocrit', value: '39.8', unit: '%', target: '36-48', status: 'normal' },
      { name: 'White Blood Cells', value: '7.2', unit: 'K/uL', target: '4.5-11', status: 'normal' },
      { name: 'Red Blood Cells', value: '4.52', unit: 'M/uL', target: '4.0-5.5', status: 'normal' },
      { name: 'Platelets', value: '228', unit: 'K/uL', target: '150-400', status: 'normal' },
      { name: 'MCV', value: '88.1', unit: 'fL', target: '80-100', status: 'normal' },
      { name: 'MCH', value: '29.2', unit: 'pg', target: '27-33', status: 'normal' },
      { name: 'MCHC', value: '33.2', unit: 'g/dL', target: '32-36', status: 'normal' },
    ],
  },
  {
    id: 'cmp-2023-12-12',
    name: 'Comprehensive Metabolic Panel',
    date: '12/12/23',
    overallStatus: '2 High',
    tests: [
      { name: 'Glucose, Fasting', value: '118', unit: 'mg/dL', target: '70-100', status: 'high' },
      { name: 'BUN', value: '19', unit: 'mg/dL', target: '7-20', status: 'normal' },
      { name: 'Creatinine', value: '1.1', unit: 'mg/dL', target: '0.6-1.2', status: 'normal' },
      { name: 'eGFR', value: '82', unit: 'mL/min', target: '>60', status: 'normal' },
      { name: 'Sodium', value: '137', unit: 'mEq/L', target: '136-145', status: 'normal' },
      { name: 'Potassium', value: '4.5', unit: 'mEq/L', target: '3.5-5.0', status: 'normal' },
      { name: 'Chloride', value: '104', unit: 'mEq/L', target: '98-106', status: 'normal' },
      { name: 'CO2', value: '23', unit: 'mEq/L', target: '22-29', status: 'normal' },
      { name: 'Calcium', value: '9.1', unit: 'mg/dL', target: '8.5-10.5', status: 'normal' },
      { name: 'Total Protein', value: '6.7', unit: 'g/dL', target: '6.0-8.3', status: 'normal' },
      { name: 'Albumin', value: '3.8', unit: 'g/dL', target: '3.5-5.0', status: 'normal' },
      { name: 'Bilirubin, Total', value: '1.0', unit: 'mg/dL', target: '0.1-1.2', status: 'normal' },
      { name: 'AST (SGOT)', value: '32', unit: 'U/L', target: '10-40', status: 'normal' },
      { name: 'ALT (SGPT)', value: '42', unit: 'U/L', target: '7-56', status: 'normal' },
    ],
  },
  {
    id: 'hba1c-2023-12-12',
    name: 'Hemoglobin A1c',
    date: '12/12/23',
    overallStatus: '1 High',
    tests: [
      { name: 'HbA1c', value: '6.1', unit: '%', target: '<5.7', status: 'high' },
      { name: 'Est. Avg Glucose', value: '128', unit: 'mg/dL', target: '<117', status: 'high' },
    ],
  },
  {
    id: 'thyroid-2023-12-12',
    name: 'Thyroid Panel',
    date: '12/12/23',
    overallStatus: 'All Normal',
    tests: [
      { name: 'TSH', value: '2.8', unit: 'mIU/L', target: '0.4-4.0', status: 'normal' },
      { name: 'Free T4', value: '1.0', unit: 'ng/dL', target: '0.8-1.8', status: 'normal' },
      { name: 'Free T3', value: '2.7', unit: 'pg/mL', target: '2.3-4.2', status: 'normal' },
    ],
  },
  {
    id: 'vitamin-2023-12-12',
    name: 'Vitamin Panel',
    date: '12/12/23',
    overallStatus: '1 Low',
    tests: [
      { name: 'Vitamin D, 25-OH', value: '22', unit: 'ng/mL', target: '30-100', status: 'low' },
      { name: 'Vitamin B12', value: '420', unit: 'pg/mL', target: '200-900', status: 'normal' },
      { name: 'Folate', value: '10.8', unit: 'ng/mL', target: '>3.0', status: 'normal' },
      { name: 'Ferritin', value: '65', unit: 'ng/mL', target: '20-200', status: 'normal' },
      { name: 'Iron, Total', value: '85', unit: 'mcg/dL', target: '60-170', status: 'normal' },
    ],
  },
];

// Group history by date for display
function getLabHistoryByDate(): { date: string; label: string; panels: LabPanel[] }[] {
  const dateMap = new Map<string, LabPanel[]>();

  allLabHistory.forEach(panel => {
    const existing = dateMap.get(panel.date) || [];
    dateMap.set(panel.date, [...existing, panel]);
  });

  const dateLabels: Record<string, string> = {
    '12/01/24': 'December 2024',
    '09/15/24': 'September 2024',
    '06/10/24': 'June 2024',
    '03/05/24': 'March 2024',
    '12/12/23': 'December 2023',
  };

  return Array.from(dateMap.entries())
    .sort((a, b) => {
      const [ma, da, ya] = a[0].split('/').map(Number);
      const [mb, db, yb] = b[0].split('/').map(Number);
      const dateA = new Date(2000 + ya, ma - 1, da);
      const dateB = new Date(2000 + yb, mb - 1, db);
      return dateB.getTime() - dateA.getTime();
    })
    .map(([date, panels]) => ({
      date,
      label: dateLabels[date] || date,
      panels,
    }));
}

// Lab Test Row Component
function LabTestRow({ test }: { test: LabTest }) {
  const statusStyles = {
    normal: 'text-emerald-400',
    low: 'text-amber-400',
    high: 'text-rose-400',
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
      <span className="text-xs text-text-secondary flex-1">{test.name}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-text-muted w-20 text-right">{test.target}</span>
        <span className={`text-xs font-medium w-20 text-right ${statusStyles[test.status]}`}>
          {test.value} {test.unit}
        </span>
      </div>
    </div>
  );
}

// Lab Panel Card Component
function LabPanelCard({ panel, onViewDetails }: { panel: LabPanel; onViewDetails: () => void }) {
  const abnormalCount = panel.tests.filter(t => t.status !== 'normal').length;

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 border-b border-white/[0.04]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{panel.name}</h3>
            <p className="text-xs text-text-muted mt-0.5">{panel.date}</p>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            abnormalCount === 0
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-amber-400 bg-amber-500/10'
          }`}>
            {abnormalCount === 0 ? 'All Normal' : `${abnormalCount} Outside Range`}
          </span>
        </div>
      </div>

      {/* Tests Header */}
      <div className="px-4 py-2 bg-white/[0.02] flex items-center justify-between text-[10px] text-text-muted uppercase tracking-wide">
        <span>Test</span>
        <div className="flex items-center gap-3">
          <span className="w-20 text-right">Target</span>
          <span className="w-20 text-right">Result</span>
        </div>
      </div>

      {/* Tests */}
      <div className="px-4">
        {panel.tests.map((test, i) => (
          <LabTestRow key={i} test={test} />
        ))}
      </div>

      {/* View Details */}
      <button
        onClick={onViewDetails}
        className="w-full py-3 border-t border-white/[0.04] flex items-center justify-center gap-1 text-xs text-text-muted hover:text-text-secondary hover:bg-white/[0.02] transition-colors"
      >
        View full details
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

// Lab Detail Modal
function LabDetailModal({
  isOpen,
  onClose,
  panel
}: {
  isOpen: boolean;
  onClose: () => void;
  panel: LabPanel | null;
}) {
  if (!isOpen || !panel) return null;

  const abnormalCount = panel.tests.filter(t => t.status !== 'normal').length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-surface w-full max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-white/[0.06] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{panel.name}</h2>
              <p className="text-xs text-text-muted mt-0.5">Collected: {panel.date}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.06]">
              <X size={20} className="text-text-muted" />
            </button>
          </div>

          {/* Status Summary */}
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${
              abnormalCount === 0
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-amber-400 bg-amber-500/10'
            }`}>
              {abnormalCount === 0 ? '✓ All results within normal range' : `${abnormalCount} result(s) outside normal range`}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-4">
          <div className="space-y-2">
            {/* Column Headers */}
            <div className="flex items-center justify-between px-3 py-2 text-[10px] text-text-muted uppercase tracking-wide">
              <span className="flex-1">Test Name</span>
              <span className="w-24 text-center">Target</span>
              <span className="w-24 text-right">Result</span>
            </div>

            {/* Test Rows */}
            {panel.tests.map((test, i) => {
              const statusStyles = {
                normal: { text: 'text-emerald-400', bg: 'bg-emerald-500/5' },
                low: { text: 'text-amber-400', bg: 'bg-amber-500/5' },
                high: { text: 'text-rose-400', bg: 'bg-rose-500/5' },
              };
              const style = statusStyles[test.status];

              return (
                <div
                  key={i}
                  className={`flex items-center justify-between px-3 py-3 rounded-lg ${style.bg} border border-white/[0.03]`}
                >
                  <div className="flex-1">
                    <span className="text-sm text-text-primary">{test.name}</span>
                    {test.status !== 'normal' && (
                      <span className={`ml-2 text-[10px] ${style.text}`}>
                        ({test.status === 'low' ? '↓ Low' : '↑ High'})
                      </span>
                    )}
                  </div>
                  <span className="w-24 text-center text-xs text-text-muted">{test.target}</span>
                  <span className={`w-24 text-right text-sm font-medium ${style.text}`}>
                    {test.value} {test.unit}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Notes Section */}
          <div className="mt-6 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">Notes</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              {abnormalCount === 0
                ? 'All values are within the expected reference ranges. Continue current health regimen and schedule follow-up testing as recommended.'
                : `${abnormalCount} value(s) are outside the normal reference range. Discuss these results with your healthcare provider at your next visit.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Lab History Modal
function LabHistoryModal({
  isOpen,
  onClose,
  onSelectPanel,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectPanel: (panel: LabPanel) => void;
}) {
  const labHistory = useMemo(() => getLabHistoryByDate(), []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-surface w-full max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-white/[0.06] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Lab History</h2>
              <p className="text-xs text-text-muted mt-0.5">{labHistory.length} visits • {allLabHistory.length} total panels</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.06]">
              <X size={20} className="text-text-muted" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-4 space-y-6">
          {labHistory.map((entry, i) => {
            // Calculate total abnormals for this date
            const totalAbnormal = entry.panels.reduce(
              (sum, panel) => sum + panel.tests.filter(t => t.status !== 'normal').length,
              0
            );

            return (
              <div key={i}>
                {/* Date header with summary */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-400" />
                    <h3 className="text-sm font-medium text-text-primary">{entry.label}</h3>
                  </div>
                  <span className={`text-xs ${totalAbnormal === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {totalAbnormal === 0 ? 'All Normal' : `${totalAbnormal} Outside Range`}
                  </span>
                </div>

                {/* Panels for this date */}
                <div className="space-y-2 pl-4 border-l-2 border-white/[0.06]">
                  {entry.panels.map((panel) => {
                    const abnormalCount = panel.tests.filter(t => t.status !== 'normal').length;
                    const hasAbnormal = abnormalCount > 0;

                    return (
                      <button
                        key={panel.id}
                        onClick={() => {
                          onClose();
                          onSelectPanel(panel);
                        }}
                        className={`w-full rounded-xl p-3 border transition-all text-left ${
                          hasAbnormal
                            ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                            : 'bg-white/[0.02] border-white/[0.04] hover:border-white/[0.08]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              hasAbnormal ? 'bg-amber-500/10' : 'bg-emerald-500/10'
                            }`}>
                              <FileText size={14} className={hasAbnormal ? 'text-amber-400' : 'text-emerald-400'} />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-text-primary">{panel.name}</h4>
                              <p className="text-[11px] text-text-muted">{panel.tests.length} tests</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {hasAbnormal ? (
                              <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                {abnormalCount} flag{abnormalCount > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="text-xs text-emerald-400">✓</span>
                            )}
                            <ChevronRight size={14} className="text-text-muted" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Timeline legend */}
          <div className="mt-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Showing {labHistory.length} lab visits</span>
              <span>Dec 2023 — Dec 2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function TrendsTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('sleep');
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [showLabHistory, setShowLabHistory] = useState(false);
  const [selectedLabPanel, setSelectedLabPanel] = useState<LabPanel | null>(null);

  const { data: trendsData, isLoading } = useHealthTrends(TEST_PATIENT_ID, timeRange);

  // Build metrics - pass timeRange to get appropriate data point count
  const sleepMetrics = useMemo(() => sleepMetricConfigs.map((c) => buildMetricProps(c, trendsData, timeRange)), [trendsData, timeRange]);
  const cardioMetrics = useMemo(() => cardioMetricConfigs.map((c) => buildMetricProps(c, trendsData, timeRange)), [trendsData, timeRange]);
  const cognitiveMetrics = useMemo(() => cognitiveMetricConfigs.map((c) => buildMetricProps(c, trendsData, timeRange)), [trendsData, timeRange]);
  const metabolicMetrics = useMemo(() => metabolicMetricConfigs.map((c) => buildMetricProps(c, trendsData, timeRange)), [trendsData, timeRange]);
  const activityMetrics = useMemo(() => activityMetricConfigs.map((c) => buildMetricProps(c, trendsData, timeRange)), [trendsData, timeRange]);
  const biomarkerMetrics = useMemo(() => biomarkerMetricConfigs.map((c) => buildMetricProps(c, trendsData, timeRange)), [trendsData, timeRange]);

  const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-surface/50 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
      <Loader2 size={20} className="animate-spin text-text-muted" />
    </div>
  );

  const renderMetrics = (metrics: MetricCardProps[]) => (
    <div className="space-y-3">
      <div className="relative">
        {isLoading && <LoadingOverlay />}
        <div className="space-y-3">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </div>
      <NvivoInsight category={activeSubTab} color={categoryColors[activeSubTab]} />
    </div>
  );

  const renderContent = () => {
    switch (activeSubTab) {
      case 'sleep': return renderMetrics(sleepMetrics);
      case 'cardio': return renderMetrics(cardioMetrics);
      case 'cognitive': return renderMetrics(cognitiveMetrics);
      case 'metabolic': return renderMetrics(metabolicMetrics);
      case 'activity': return renderMetrics(activityMetrics);
      case 'biomarkers': return renderMetrics(biomarkerMetrics);
      case 'labs':
        return (
          <div className="space-y-4">
            {/* Lab Panels - show latest of each type */}
            {currentLabPanels.map((panel) => (
              <LabPanelCard
                key={panel.id}
                panel={panel}
                onViewDetails={() => setSelectedLabPanel(panel)}
              />
            ))}

            {/* View History Button */}
            <button
              onClick={() => setShowLabHistory(true)}
              className="w-full py-3 bg-transparent border border-border hover:border-text-muted text-text-secondary text-sm font-medium rounded-xl flex items-center justify-center gap-2"
            >
              <FileText size={16} />
              View Full Lab History
              <ChevronRight size={16} />
            </button>

            <NvivoInsight category="labs" color={categoryColors.labs} />
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Subtab Navigation - Full width grid */}
      <div className="grid grid-cols-7 gap-1 p-1 bg-surface/50 rounded-xl border border-border">
        {subtabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-[10px] font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-text-muted hover:text-text-secondary hover:bg-surface border border-transparent'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Time Range Selector - hidden on Labs tab */}
      {activeSubTab !== 'labs' && (
        <>
          <div className="flex justify-center gap-1">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  timeRange === range
                    ? 'bg-white/10 text-text-primary'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Live data indicator */}
          {trendsData?.hasData && (
            <div className="flex justify-center">
              <span className="text-[10px] text-emerald-400/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live data
              </span>
            </div>
          )}
        </>
      )}

      {/* Content */}
      {renderContent()}

      {/* Lab History Modal */}
      <LabHistoryModal
        isOpen={showLabHistory}
        onClose={() => setShowLabHistory(false)}
        onSelectPanel={(panel) => setSelectedLabPanel(panel)}
      />

      {/* Lab Detail Modal */}
      <LabDetailModal
        isOpen={!!selectedLabPanel}
        onClose={() => setSelectedLabPanel(null)}
        panel={selectedLabPanel}
      />
    </div>
  );
}
