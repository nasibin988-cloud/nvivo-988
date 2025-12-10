/**
 * Food Comparison Types
 * Type definitions for food health grades and condition impacts
 */

export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface NutrientScore {
  name: string;
  score: number; // 0-100
  impact: 'positive' | 'negative' | 'neutral';
  reason: string;
}

export interface ConditionImpact {
  condition: string;
  impact: 'beneficial' | 'moderate' | 'caution' | 'avoid';
  reason: string;
  recommendation?: string;
}

export interface FoodHealthProfile {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  healthGrade: HealthGrade;
  gradeReason: string;
  nutrientScores: NutrientScore[];
  conditionImpacts: ConditionImpact[];
  aiRecommendation?: string;
  alternatives?: FoodAlternative[];
}

export interface FoodAlternative {
  name: string;
  calories: number;
  healthGrade: HealthGrade;
  benefit: string;
  calorieReduction?: number;
  proteinIncrease?: number;
}

export interface FoodComparisonResult {
  food1: FoodHealthProfile;
  food2: FoodHealthProfile;
  winner: 'food1' | 'food2' | 'tie';
  comparison: {
    category: string;
    food1Better: boolean;
    difference: string;
  }[];
}

export interface FoodComparisonModalProps {
  onClose: () => void;
}

export type UserCondition =
  | 'diabetes'
  | 'hypertension'
  | 'heart_disease'
  | 'obesity'
  | 'high_cholesterol'
  | 'kidney_disease'
  | 'celiac'
  | 'none';
