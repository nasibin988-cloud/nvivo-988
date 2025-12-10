/**
 * Nutrition domain types - Single source of truth for food/nutrition data
 */

import type { DateString, Timestamp, BaseEntity } from './common';

/**
 * Meal type - the four main meals of the day
 */
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/**
 * Food log entry - represents a single food item or meal logged
 */
export interface FoodLog extends BaseEntity {
  mealType: MealType;
  description: string;
  time: string; // Time of day (e.g., "8:30 AM")
  date: DateString;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  sodium: number | null;
  photoUrl?: string;
  isAiAnalyzed?: boolean;
  aiConfidence?: number;
  fdcId?: string; // USDA Food Data Central ID
}

/**
 * Simplified food log for dashboard status display
 */
export interface FoodLogSummary {
  id: string;
  date: DateString;
  mealType: MealType;
  description: string;
  calories?: number;
  loggedAt: Timestamp;
}

/**
 * Daily nutrition totals
 */
export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

/**
 * Daily nutrition with targets
 */
export interface DailyNutrition {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
  fiber: { current: number; target: number };
  water: { current: number; target: number };
}

/**
 * Daily food data aggregation
 */
export interface DailyFoodData {
  date: DateString;
  meals: FoodLog[];
  totals: NutritionTotals;
}

/**
 * Nutrition targets/goals
 */
export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  water: number;
}

/**
 * Food log status for dashboard
 */
export interface FoodLogStatus {
  totalMeals: number;
  loggedMeals: number;
  pendingMeals: number;
  totalCalories: number;
  meals: Array<{
    type: MealType;
    logged: boolean;
    description?: string;
    calories?: number;
    loggedAt?: string;
  }>;
  completionPercentage: number;
}

/**
 * View modes for nutrition tab
 */
export type NutritionViewMode = 'today' | 'history';

/**
 * Time range options for history charts
 */
export type TimeRange = '1W' | '1M' | '3M';

/**
 * Time range to days mapping
 */
export const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
};

/**
 * Macro nutrient colors for consistent theming
 */
export const MACRO_COLORS = {
  protein: { from: '#ef4444', to: '#f97316' }, // red to orange
  carbs: { from: '#eab308', to: '#facc15' },   // yellow
  fat: { from: '#3b82f6', to: '#60a5fa' },     // blue
  fiber: { from: '#22c55e', to: '#4ade80' },   // green
} as const;

/**
 * Meal schedule configuration
 */
export const MEAL_SCHEDULE: Array<{ type: MealType; startHour: number; endHour: number; label: string }> = [
  { type: 'breakfast', startHour: 6, endHour: 10, label: 'Breakfast' },
  { type: 'lunch', startHour: 11, endHour: 14, label: 'Lunch' },
  { type: 'snack', startHour: 14, endHour: 17, label: 'Snack' },
  { type: 'dinner', startHour: 17, endHour: 21, label: 'Dinner' },
];
