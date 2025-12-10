/**
 * Metric Configurations for Health Trends
 * Organized by category: sleep, cardio, cognitive, metabolic, activity, biomarkers
 */

import type { MetricConfig } from './types';

// Sleep metrics
export const sleepMetricConfigs: MetricConfig[] = [
  { id: 'sleep_duration', label: 'Sleep Duration', unit: 'hrs', color: '#6366f1', trendGood: true, decimals: 1, fallbackBase: 7.2, fallbackVariance: 0.8, fallbackTrend: 'up' },
  { id: 'sleep_score', label: 'Sleep Quality', unit: '%', color: '#8b5cf6', trendGood: true, fallbackBase: 78, fallbackVariance: 8, fallbackTrend: 'up' },
  { id: 'deep_sleep', label: 'Deep Sleep', unit: 'hrs', color: '#3b82f6', trendGood: true, decimals: 1, fallbackBase: 1.4, fallbackVariance: 0.3, fallbackTrend: 'up' },
  { id: 'rem_sleep', label: 'REM Sleep', unit: 'hrs', color: '#a855f7', trendGood: true, decimals: 1, fallbackBase: 1.8, fallbackVariance: 0.4, fallbackTrend: 'stable' },
  { id: 'sleep_latency', label: 'Time to Sleep', unit: 'min', color: '#f59e0b', trendGood: false, fallbackBase: 12, fallbackVariance: 5, fallbackTrend: 'down' },
  { id: 'sleep_efficiency', label: 'Efficiency', unit: '%', color: '#10b981', trendGood: true, fallbackBase: 91, fallbackVariance: 4, fallbackTrend: 'up' },
];

// Cardio metrics (includes CCTA imaging data)
export const cardioMetricConfigs: MetricConfig[] = [
  { id: 'rhr', label: 'Resting Heart Rate', unit: 'bpm', color: '#f43f5e', trendGood: false, fallbackBase: 65, fallbackVariance: 5, fallbackTrend: 'down' },
  { id: 'hrv', label: 'Heart Rate Variability', unit: 'ms', color: '#8b5cf6', trendGood: true, fallbackBase: 43, fallbackVariance: 8, fallbackTrend: 'up' },
  { id: 'bp_systolic', label: 'BP Systolic', unit: 'mmHg', color: '#3b82f6', trendGood: false, fallbackBase: 118, fallbackVariance: 6, fallbackTrend: 'stable' },
  { id: 'bp_diastolic', label: 'BP Diastolic', unit: 'mmHg', color: '#06b6d4', trendGood: false, fallbackBase: 78, fallbackVariance: 4, fallbackTrend: 'down' },
  // CCTA Imaging Metrics (3 scans over past year)
  { id: 'ffr_ct', label: 'FFR-CT', unit: '', color: '#ec4899', trendGood: true, decimals: 2, sparseData: [0.82, 0.85, 0.88] },
  { id: 'plaque_volume', label: 'Plaque Volume', unit: 'mm³', color: '#fb923c', trendGood: false, sparseData: [168, 155, 142] },
  { id: 'lrnc_volume', label: 'LRNC Volume', unit: 'mm³', color: '#fbbf24', trendGood: false, decimals: 1, sparseData: [12.5, 10.2, 8.2] },
];

// Cognitive metrics
export const cognitiveMetricConfigs: MetricConfig[] = [
  { id: 'memory_score', label: 'Memory Score', unit: '%', color: '#8b5cf6', trendGood: true, fallbackBase: 88, fallbackVariance: 5, fallbackTrend: 'up' },
  { id: 'processing_speed', label: 'Processing Speed', unit: '%', color: '#f59e0b', trendGood: true, fallbackBase: 86, fallbackVariance: 4, fallbackTrend: 'stable' },
  { id: 'focus_score', label: 'Focus Score', unit: '%', color: '#10b981', trendGood: true, fallbackBase: 72, fallbackVariance: 8, fallbackTrend: 'up' },
  { id: 'cognitive_age', label: 'Cognitive Age', unit: 'yrs', color: '#ec4899', trendGood: false, fallbackBase: 40, fallbackVariance: 2, fallbackTrend: 'down' },
];

// Metabolic metrics
export const metabolicMetricConfigs: MetricConfig[] = [
  { id: 'fasting_glucose', label: 'Fasting Glucose', unit: 'mg/dL', color: '#f59e0b', trendGood: false, fallbackBase: 98, fallbackVariance: 8, fallbackTrend: 'down' },
  { id: 'hba1c', label: 'HbA1c', unit: '%', color: '#ef4444', trendGood: false, decimals: 1, fallbackBase: 5.4, fallbackVariance: 0.2, fallbackTrend: 'stable' },
  { id: 'weight', label: 'Weight', unit: 'lbs', color: '#3b82f6', trendGood: false, decimals: 1, fallbackBase: 171, fallbackVariance: 4, fallbackTrend: 'down' },
  { id: 'bmi', label: 'BMI', unit: '', color: '#f97316', trendGood: false, decimals: 1, fallbackBase: 24.6, fallbackVariance: 0.5, fallbackTrend: 'down' },
];

// Activity metrics
export const activityMetricConfigs: MetricConfig[] = [
  { id: 'steps', label: 'Daily Steps', unit: '', color: '#10b981', trendGood: true, fallbackBase: 7200, fallbackVariance: 1500, fallbackTrend: 'up' },
  { id: 'active_minutes', label: 'Active Minutes', unit: 'min', color: '#3b82f6', trendGood: true, fallbackBase: 45, fallbackVariance: 15, fallbackTrend: 'up' },
  { id: 'calories_burned', label: 'Calories Burned', unit: 'kcal', color: '#f97316', trendGood: true, fallbackBase: 2100, fallbackVariance: 300, fallbackTrend: 'up' },
  { id: 'exercise_minutes', label: 'Weekly Exercise', unit: 'min/wk', color: '#8b5cf6', trendGood: true, fallbackBase: 180, fallbackVariance: 45, fallbackTrend: 'up' },
];

// Biomarker metrics
export const biomarkerMetricConfigs: MetricConfig[] = [
  { id: 'ldl', label: 'LDL Cholesterol', unit: 'mg/dL', color: '#ef4444', trendGood: false, fallbackBase: 110, fallbackVariance: 15, fallbackTrend: 'down' },
  { id: 'hdl', label: 'HDL Cholesterol', unit: 'mg/dL', color: '#22c55e', trendGood: true, fallbackBase: 54, fallbackVariance: 5, fallbackTrend: 'up' },
  { id: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL', color: '#f59e0b', trendGood: false, fallbackBase: 142, fallbackVariance: 20, fallbackTrend: 'down' },
  { id: 'vitamin_d', label: 'Vitamin D', unit: 'ng/mL', color: '#fbbf24', trendGood: true, fallbackBase: 42, fallbackVariance: 10, fallbackTrend: 'up' },
];
