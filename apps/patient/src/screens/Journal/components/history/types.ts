/**
 * Shared types for history components across Journal tabs
 *
 * The history components use a generic scoring system that can be
 * adapted to different data types (wellness, nutrition, activity, etc.)
 */

/**
 * Base interface for any log entry that can be displayed in history
 */
export interface BaseHistoryEntry {
  id: string;
  date: string;
  createdAt: string;
}

/**
 * Interface for entries that can be scored on a 0-10 scale
 */
export interface ScoredEntry extends BaseHistoryEntry {
  score?: number; // Pre-calculated score 0-10
}

/**
 * Calculator function type for computing scores from arbitrary data
 */
export type ScoreCalculator<T extends BaseHistoryEntry> = (entry: T) => number;

/**
 * Wellness-specific log (the original implementation)
 */
export interface HistoryLog extends BaseHistoryEntry {
  mood: number; // 1-10
  energy: number; // 1-10
  stress: number; // 1-10
  sleepQuality: number; // 1-10
  sleepHours: number;
  symptoms: string[];
  notes: string;
  voiceNoteUrl?: string;
  tags: string[];
}

/**
 * Nutrition history entry
 */
export interface NutritionHistoryEntry extends BaseHistoryEntry {
  totalCalories: number;
  targetCalories: number;
  mealsLogged: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Activity history entry
 */
export interface ActivityHistoryEntry extends BaseHistoryEntry {
  totalMinutes: number;
  targetMinutes: number;
  caloriesBurned: number;
  workouts: number;
}

/**
 * Medication adherence history entry
 */
export interface MedicationHistoryEntry extends BaseHistoryEntry {
  taken: number;
  total: number;
  adherencePercent: number;
}

/**
 * Streak data for gamification
 */
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

/**
 * Generic history record type
 */
export type HistoryRecord<T extends BaseHistoryEntry> = Record<string, T>;
