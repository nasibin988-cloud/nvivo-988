/**
 * Health Trends Types & Configuration
 * Types, metric configs, and category settings
 */

import { Heart, Moon, Brain, Flame, Footprints, Droplet, FileText, LucideIcon } from 'lucide-react';

// SubTab types
export type SubTab = 'sleep' | 'cardio' | 'cognitive' | 'metabolic' | 'activity' | 'biomarkers' | 'labs';
export type TrendDirection = 'up' | 'down' | 'stable';

// Subtab configuration
export interface SubTabConfig {
  id: SubTab;
  label: string;
  icon: LucideIcon;
}

export const subtabs: SubTabConfig[] = [
  { id: 'sleep', label: 'Sleep', icon: Moon },
  { id: 'cardio', label: 'Cardio', icon: Heart },
  { id: 'cognitive', label: 'Brain', icon: Brain },
  { id: 'metabolic', label: 'Metabolic', icon: Flame },
  { id: 'activity', label: 'Activity', icon: Footprints },
  { id: 'biomarkers', label: 'Bio', icon: Droplet },
  { id: 'labs', label: 'Labs', icon: FileText },
];

// Category colors
export const categoryColors: Record<SubTab, string> = {
  sleep: '#6366f1',
  cardio: '#f43f5e',
  cognitive: '#8b5cf6',
  metabolic: '#f59e0b',
  activity: '#10b981',
  biomarkers: '#3b82f6',
  labs: '#64748b',
};

// NVIVO Insights by category
export interface CategoryInsight {
  insight: string;
  recommendation: string;
}

export const insightsByCategory: Record<SubTab, CategoryInsight> = {
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
    insight: "You've hit your step goal 6 out of 7 days. Active minutes up 15% compared to last month.",
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

// Metric configuration
export interface MetricConfig {
  id: string;
  label: string;
  unit: string;
  color: string;
  trendGood?: boolean;
  decimals?: number;
  fallbackBase?: number;
  fallbackVariance?: number;
  fallbackTrend?: TrendDirection;
  sparseData?: number[];
}

// Metric card props
export interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
  trend: TrendDirection;
  trendGood?: boolean;
  sparklineData: number[];
  color: string;
}

// Chart display settings
export const CHART_DISPLAY_POINTS = 30;
export const TEST_PATIENT_ID = 'sarah-mitchell-test';
