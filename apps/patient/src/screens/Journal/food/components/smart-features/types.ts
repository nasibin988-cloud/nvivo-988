/**
 * Smart Features Types
 * Types for barcode scanning, favorites, recurring meals, and suggestions
 */

export interface FavoriteFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  barcode?: string;
  brand?: string;
  servingSize?: string;
  usageCount: number;
  lastUsed: string;
  createdAt: string;
}

export interface RecurringMeal {
  id: string;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FavoriteFood[];
  schedule: RecurringSchedule;
  isActive: boolean;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: string;
}

export interface RecurringSchedule {
  type: 'daily' | 'weekly' | 'custom';
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  time: string; // HH:mm format
  reminderEnabled: boolean;
}

export interface BarcodeProduct {
  barcode: string;
  name: string;
  brand?: string;
  servingSize?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  imageUrl?: string;
  source: 'openfoodfacts' | 'usda' | 'manual';
}

export interface MealSuggestion {
  id: string;
  type: 'macro_balance' | 'time_based' | 'variety' | 'goal_completion';
  title: string;
  description: string;
  foods: SuggestedFood[];
  reason: string;
  confidence: number;
  priority: number;
}

export interface SuggestedFood {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  benefit: string;
  isFavorite?: boolean;
}

export interface NutritionGap {
  nutrient: 'protein' | 'carbs' | 'fat' | 'fiber' | 'calories';
  current: number;
  target: number;
  deficit: number;
  percentage: number;
}

export type SmartFeatureView = 'favorites' | 'recurring' | 'suggestions';
