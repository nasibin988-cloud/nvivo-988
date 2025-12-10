/**
 * Activity Tab Data
 * Mock data and configuration constants
 */

import {
  Dumbbell,
  Heart,
  Waves,
  Target,
  Sparkles,
} from 'lucide-react';
import type {
  ExerciseLog,
  WeeklyStats,
  DailyActivity,
  ExerciseType,
  Intensity,
  ExerciseTypeConfig,
  IntensityConfig,
} from './types';

// Mock exercise data
export const mockExercises: ExerciseLog[] = [
  {
    id: '1',
    name: 'Morning Run',
    type: 'cardio',
    duration: 35,
    calories: 320,
    intensity: 'moderate',
    heartRateAvg: 142,
    time: '6:30 AM',
    isAutoDetected: true,
  },
  {
    id: '2',
    name: 'Strength Training',
    type: 'strength',
    duration: 45,
    calories: 280,
    intensity: 'high',
    heartRateAvg: 125,
    time: '5:00 PM',
  },
];

// Weekly stats
export const mockWeeklyStats: WeeklyStats = {
  totalMinutes: 245,
  goalMinutes: 300,
  totalCalories: 1820,
  workouts: 6,
  activeDays: 5,
  avgHeartRate: 128,
};

// Weekly activity breakdown
export const mockWeeklyData: DailyActivity[] = [
  { day: 'Mon', minutes: 45, type: 'cardio' },
  { day: 'Tue', minutes: 60, type: 'strength' },
  { day: 'Wed', minutes: 0, type: null },
  { day: 'Thu', minutes: 35, type: 'cardio' },
  { day: 'Fri', minutes: 45, type: 'strength' },
  { day: 'Sat', minutes: 60, type: 'flexibility' },
  { day: 'Sun', minutes: 0, type: null },
];

// Exercise type configuration
export const exerciseTypes: Record<ExerciseType, ExerciseTypeConfig> = {
  cardio: { label: 'Cardio', icon: Heart, color: 'rose' },
  strength: { label: 'Strength', icon: Dumbbell, color: 'blue' },
  flexibility: { label: 'Flexibility', icon: Waves, color: 'purple' },
  sports: { label: 'Sports', icon: Target, color: 'amber' },
  other: { label: 'Other', icon: Sparkles, color: 'emerald' },
};

// Intensity configuration
export const intensityConfig: Record<Intensity, IntensityConfig> = {
  low: {
    label: 'Low',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15 border-emerald-500/30',
  },
  moderate: {
    label: 'Moderate',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/15 border-amber-500/30',
  },
  high: {
    label: 'High',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/15 border-rose-500/30',
  },
};
