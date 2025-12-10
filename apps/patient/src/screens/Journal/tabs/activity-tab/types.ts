/**
 * Activity Tab Types
 */

export type ExerciseType = 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
export type Intensity = 'low' | 'moderate' | 'high';
export type ViewMode = 'today' | 'week';

export interface ExerciseLog {
  id: string;
  name: string;
  type: ExerciseType;
  duration: number; // minutes
  calories: number;
  intensity: Intensity;
  heartRateAvg?: number;
  time: string;
  isAutoDetected?: boolean;
}

export interface WeeklyStats {
  totalMinutes: number;
  goalMinutes: number;
  totalCalories: number;
  workouts: number;
  activeDays: number;
  avgHeartRate: number;
}

export interface DailyActivity {
  day: string;
  minutes: number;
  type: ExerciseType | null;
}

export interface ExerciseTypeConfig {
  label: string;
  icon: React.ComponentType<Record<string, unknown>>;
  color: string;
}

export interface IntensityConfig {
  label: string;
  color: string;
  bgColor: string;
}
