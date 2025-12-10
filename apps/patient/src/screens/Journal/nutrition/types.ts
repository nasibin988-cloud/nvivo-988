/**
 * Nutrition Types and Constants
 * Shared types, meal configuration, and time range utilities
 */

import { Coffee, Sun, Moon, Cookie } from 'lucide-react';
import type { MealType } from '../../../hooks/nutrition';

// ============================================================================
// VIEW & TIME TYPES
// ============================================================================

export type ViewMode = 'today' | 'history';
export type TimeRange = '1W' | '1M' | '3M';

export const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
};

// ============================================================================
// MEAL CONFIGURATION
// ============================================================================

export interface MealConfig {
  label: string;
  icon: typeof Coffee;
  gradient: string;
  time: string;
  bgGlow: string;
}

export const mealConfig: Record<MealType, MealConfig> = {
  breakfast: {
    label: 'Breakfast',
    icon: Coffee,
    gradient: 'from-amber-500 to-orange-500',
    time: '6-10 AM',
    bgGlow: 'bg-amber-500/20',
  },
  lunch: {
    label: 'Lunch',
    icon: Sun,
    gradient: 'from-blue-500 to-cyan-500',
    time: '11 AM-2 PM',
    bgGlow: 'bg-blue-500/20',
  },
  snack: {
    label: 'Snack',
    icon: Cookie,
    gradient: 'from-emerald-500 to-teal-500',
    time: '2-5 PM',
    bgGlow: 'bg-emerald-500/20',
  },
  dinner: {
    label: 'Dinner',
    icon: Moon,
    gradient: 'from-purple-500 to-pink-500',
    time: '5-9 PM',
    bgGlow: 'bg-purple-500/20',
  },
};

// ============================================================================
// MACRO COLORS
// ============================================================================

export const MACRO_COLORS = {
  protein: '#f43f5e',  // Rose
  carbs: '#f59e0b',    // Amber
  fat: '#3b82f6',      // Blue
  fiber: '#10b981',    // Emerald
  calories: '#10b981', // Emerald
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the accent color for a meal type based on its gradient
 */
export function getMealAccentColor(mealType: MealType): string {
  const config = mealConfig[mealType];
  if (config.gradient.includes('amber')) return 'text-amber-400';
  if (config.gradient.includes('blue')) return 'text-blue-400';
  if (config.gradient.includes('emerald')) return 'text-emerald-400';
  return 'text-purple-400';
}

/**
 * Parse time string to minutes since midnight
 */
export function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const mins = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + mins;
}

/**
 * Calculate time difference between two meal times
 */
export function getTimeSinceMeal(currentTime: string, previousTime: string): string | null {
  const current = parseTimeToMinutes(currentTime);
  const previous = parseTimeToMinutes(previousTime);
  const diff = current - previous;

  if (diff <= 0 || diff > 600) return null;

  const hours = Math.floor(diff / 60);
  const mins = diff % 60;

  if (hours > 0) return `${hours}h ${mins}m since last meal`;
  return `${mins}m since last meal`;
}
