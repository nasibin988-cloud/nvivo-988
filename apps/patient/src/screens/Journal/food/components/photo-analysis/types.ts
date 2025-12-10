/**
 * PhotoAnalysis Types
 * Type definitions for AI food photo analysis
 */

export interface AnalyzedFood {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  confidence: number;
}

export interface AnalysisResult {
  items: AnalyzedFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'unknown';
  eatenAt?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type AnalysisStep = 'capture' | 'analyzing' | 'review';

export interface PhotoAnalysisModalProps {
  onClose: () => void;
  onConfirm: (result: AnalysisResult) => void;
}

export interface MealTypeConfig {
  type: MealType;
  label: string;
  icon: React.ComponentType<Record<string, unknown>>;
  color: string;
}

export interface MacroConfig {
  key: keyof AnalyzedFood;
  label: string;
  borderColor: string;
  textColor: string;
}
