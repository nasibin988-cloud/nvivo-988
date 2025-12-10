/**
 * PhotoAnalysis Data
 * Configuration and mock data
 */

import { Sun, Coffee, Sunset, Moon } from 'lucide-react';
import type { MealTypeConfig, MacroConfig, AnalysisResult } from './types';

export const MEAL_TYPES: MealTypeConfig[] = [
  { type: 'breakfast', label: 'Breakfast', icon: Sun, color: 'amber' },
  { type: 'lunch', label: 'Lunch', icon: Coffee, color: 'emerald' },
  { type: 'dinner', label: 'Dinner', icon: Sunset, color: 'violet' },
  { type: 'snack', label: 'Snack', icon: Moon, color: 'blue' },
];

export const MACRO_CONFIGS: MacroConfig[] = [
  { key: 'protein', label: 'Protein', borderColor: 'focus:border-rose-500/40', textColor: 'text-rose-400' },
  { key: 'carbs', label: 'Carbs', borderColor: 'focus:border-amber-500/40', textColor: 'text-amber-400' },
  { key: 'fat', label: 'Fat', borderColor: 'focus:border-blue-500/40', textColor: 'text-blue-400' },
  { key: 'fiber', label: 'Fiber', borderColor: 'focus:border-emerald-500/40', textColor: 'text-emerald-400' },
];

export const PORTION_PRESETS = [0.5, 1, 1.5, 2];

export function getMealTypeColor(color: string, type: 'bg' | 'border' | 'text'): string {
  const colors: Record<string, Record<string, string>> = {
    amber: {
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.4)',
      text: 'rgb(251, 191, 36)',
    },
    emerald: {
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.4)',
      text: 'rgb(52, 211, 153)',
    },
    violet: {
      bg: 'rgba(139, 92, 246, 0.15)',
      border: 'rgba(139, 92, 246, 0.4)',
      text: 'rgb(167, 139, 250)',
    },
    blue: {
      bg: 'rgba(59, 130, 246, 0.15)',
      border: 'rgba(59, 130, 246, 0.4)',
      text: 'rgb(96, 165, 250)',
    },
  };
  return colors[color]?.[type] ?? '';
}

export function getMockAnalysisResult(): AnalysisResult {
  return {
    items: [
      {
        name: 'Grilled chicken breast',
        quantity: 1,
        unit: 'piece (6 oz)',
        calories: 280,
        protein: 52,
        carbs: 0,
        fat: 6,
        fiber: 0,
        confidence: 0.92,
      },
      {
        name: 'Steamed broccoli',
        quantity: 1,
        unit: 'cup',
        calories: 55,
        protein: 4,
        carbs: 11,
        fat: 0.5,
        fiber: 5,
        confidence: 0.88,
      },
      {
        name: 'Brown rice',
        quantity: 0.5,
        unit: 'cup',
        calories: 108,
        protein: 2.5,
        carbs: 22,
        fat: 1,
        fiber: 2,
        confidence: 0.85,
      },
    ],
    totalCalories: 443,
    totalProtein: 58.5,
    totalCarbs: 33,
    totalFat: 7.5,
    mealType: 'lunch',
  };
}
