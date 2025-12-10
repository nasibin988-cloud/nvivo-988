/**
 * PhotoAnalysis Data
 * Configuration constants for nutrition display
 * NOTE: No mock data - all food analysis comes from AI
 */

import { Sun, Coffee, Sunset, Moon } from 'lucide-react';
import type { MealTypeConfig, MacroConfig } from './types';

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

/**
 * Nutrient display configuration for the UI
 * Maps nutrient keys to display labels, units, colors, and FDA daily values
 */
export const NUTRIENT_DISPLAY_CONFIG = {
  // Macros
  calories: { label: 'Calories', unit: 'kcal', color: '#fbbf24', dailyValue: 2000 },
  protein: { label: 'Protein', unit: 'g', color: '#fb7185', dailyValue: 50 },
  carbs: { label: 'Carbs', unit: 'g', color: '#c084fc', dailyValue: 275 },
  fat: { label: 'Fat', unit: 'g', color: '#60a5fa', dailyValue: 78 },
  fiber: { label: 'Fiber', unit: 'g', color: '#34d399', dailyValue: 28 },
  sugar: { label: 'Sugar', unit: 'g', color: '#f472b6', dailyValue: 50 },
  addedSugar: { label: 'Added Sugar', unit: 'g', color: '#fb923c', dailyValue: 25 },

  // Fat breakdown
  saturatedFat: { label: 'Saturated Fat', unit: 'g', color: '#f97316', dailyValue: 20 },
  monounsaturatedFat: { label: 'Monounsat. Fat', unit: 'g', color: '#84cc16', dailyValue: undefined },
  polyunsaturatedFat: { label: 'Polyunsat. Fat', unit: 'g', color: '#22d3ee', dailyValue: undefined },
  transFat: { label: 'Trans Fat', unit: 'g', color: '#ef4444', dailyValue: 0 },
  omega3: { label: 'Omega-3', unit: 'g', color: '#06b6d4', dailyValue: 1.6 },
  omega6: { label: 'Omega-6', unit: 'g', color: '#8b5cf6', dailyValue: 17 },
  cholesterol: { label: 'Cholesterol', unit: 'mg', color: '#dc2626', dailyValue: 300 },

  // Minerals
  sodium: { label: 'Sodium', unit: 'mg', color: '#fbbf24', dailyValue: 2300 },
  potassium: { label: 'Potassium', unit: 'mg', color: '#a78bfa', dailyValue: 4700 },
  calcium: { label: 'Calcium', unit: 'mg', color: '#f5f5f4', dailyValue: 1300 },
  magnesium: { label: 'Magnesium', unit: 'mg', color: '#2dd4bf', dailyValue: 420 },
  phosphorus: { label: 'Phosphorus', unit: 'mg', color: '#fcd34d', dailyValue: 1250 },
  iron: { label: 'Iron', unit: 'mg', color: '#dc2626', dailyValue: 18 },
  zinc: { label: 'Zinc', unit: 'mg', color: '#94a3b8', dailyValue: 11 },
  copper: { label: 'Copper', unit: 'mg', color: '#d97706', dailyValue: 0.9 },
  manganese: { label: 'Manganese', unit: 'mg', color: '#7c3aed', dailyValue: 2.3 },
  selenium: { label: 'Selenium', unit: 'mcg', color: '#eab308', dailyValue: 55 },
  iodine: { label: 'Iodine', unit: 'mcg', color: '#a855f7', dailyValue: 150 },
  chromium: { label: 'Chromium', unit: 'mcg', color: '#6366f1', dailyValue: 35 },
  molybdenum: { label: 'Molybdenum', unit: 'mcg', color: '#8b5cf6', dailyValue: 45 },
  fluoride: { label: 'Fluoride', unit: 'mg', color: '#14b8a6', dailyValue: 4 },

  // Fat-soluble vitamins
  vitaminA: { label: 'Vitamin A', unit: 'mcg', color: '#fb923c', dailyValue: 900 },
  vitaminD: { label: 'Vitamin D', unit: 'mcg', color: '#fde047', dailyValue: 20 },
  vitaminE: { label: 'Vitamin E', unit: 'mg', color: '#86efac', dailyValue: 15 },
  vitaminK: { label: 'Vitamin K', unit: 'mcg', color: '#4ade80', dailyValue: 120 },

  // Water-soluble vitamins
  vitaminC: { label: 'Vitamin C', unit: 'mg', color: '#fb923c', dailyValue: 90 },
  thiamin: { label: 'Thiamin (B1)', unit: 'mg', color: '#fcd34d', dailyValue: 1.2 },
  riboflavin: { label: 'Riboflavin (B2)', unit: 'mg', color: '#fde047', dailyValue: 1.3 },
  niacin: { label: 'Niacin (B3)', unit: 'mg', color: '#bef264', dailyValue: 16 },
  pantothenicAcid: { label: 'Pantothenic Acid (B5)', unit: 'mg', color: '#a3e635', dailyValue: 5 },
  vitaminB6: { label: 'Vitamin B6', unit: 'mg', color: '#a3e635', dailyValue: 1.7 },
  biotin: { label: 'Biotin (B7)', unit: 'mcg', color: '#84cc16', dailyValue: 30 },
  folate: { label: 'Folate (B9)', unit: 'mcg', color: '#4ade80', dailyValue: 400 },
  vitaminB12: { label: 'Vitamin B12', unit: 'mcg', color: '#f87171', dailyValue: 2.4 },
  choline: { label: 'Choline', unit: 'mg', color: '#c084fc', dailyValue: 550 },

  // Other bioactive
  caffeine: { label: 'Caffeine', unit: 'mg', color: '#78716c', dailyValue: 400 },
  alcohol: { label: 'Alcohol', unit: 'g', color: '#dc2626', dailyValue: undefined },
  water: { label: 'Water', unit: 'ml', color: '#38bdf8', dailyValue: 3700 },
  lycopene: { label: 'Lycopene', unit: 'mcg', color: '#ef4444', dailyValue: undefined },
  lutein: { label: 'Lutein', unit: 'mcg', color: '#84cc16', dailyValue: undefined },
  betaCarotene: { label: 'Beta-Carotene', unit: 'mcg', color: '#fb923c', dailyValue: undefined },

  // Metadata
  glycemicIndex: { label: 'Glycemic Index', unit: '', color: '#f97316', dailyValue: undefined },
  glycemicLoad: { label: 'Glycemic Load', unit: '', color: '#fb923c', dailyValue: undefined },
} as const;

/**
 * Nutrient groups for tiered display
 */
export const ESSENTIAL_NUTRIENT_KEYS = [
  'calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium'
] as const;

export const EXTENDED_NUTRIENT_KEYS = [
  ...ESSENTIAL_NUTRIENT_KEYS,
  'saturatedFat', 'transFat', 'cholesterol',
  'potassium', 'calcium', 'iron', 'magnesium', 'zinc',
  'vitaminA', 'vitaminC', 'vitaminD'
] as const;

export const COMPLETE_NUTRIENT_KEYS = [
  ...EXTENDED_NUTRIENT_KEYS,
  'monounsaturatedFat', 'polyunsaturatedFat', 'omega3', 'omega6',
  'addedSugar', 'phosphorus', 'copper', 'manganese', 'selenium',
  'vitaminE', 'vitaminK', 'thiamin', 'riboflavin', 'niacin',
  'vitaminB6', 'folate', 'vitaminB12', 'choline',
  'caffeine', 'water', 'glycemicIndex', 'glycemicLoad'
] as const;
