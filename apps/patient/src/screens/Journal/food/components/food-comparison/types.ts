/**
 * Food Comparison Types
 * Type definitions for food health grades and wellness focus impacts
 */

import type { FoodIntelligence } from '../photo-analysis/types';

export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'F';

// ============================================
// Wellness Focus (replaces medical conditions)
// ============================================

export type WellnessFocus =
  | 'muscle_building'
  | 'heart_health'
  | 'energy_endurance'
  | 'weight_management'
  | 'brain_focus'
  | 'gut_health'
  | 'blood_sugar_balance'
  | 'bone_joint_support'
  | 'anti_inflammatory'
  | 'balanced';

/** @deprecated Use WellnessFocus instead */
export type UserCondition =
  | 'diabetes'
  | 'hypertension'
  | 'heart_disease'
  | 'obesity'
  | 'high_cholesterol'
  | 'kidney_disease'
  | 'celiac'
  | 'none';

// ============================================
// Extended Nutrition Data
// ============================================

export interface FoodNutritionData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export interface ExtendedNutritionData extends FoodNutritionData {
  // Carbs breakdown
  addedSugar?: number;
  starch?: number;

  // Fat breakdown
  saturatedFat?: number;
  transFat?: number;
  monounsaturatedFat?: number;
  polyunsaturatedFat?: number;
  cholesterol?: number;

  // Fatty acids
  omega3?: number;         // ALA (plant omega-3) in g
  omega6?: number;
  epaDha?: number;         // EPA + DHA (fish oil omega-3) in mg

  // === MINERALS ===
  // Electrolytes
  potassium?: number;
  calcium?: number;
  magnesium?: number;
  phosphorus?: number;

  // Trace minerals
  iron?: number;
  zinc?: number;
  copper?: number;
  manganese?: number;
  selenium?: number;
  iodine?: number;
  chromium?: number;
  molybdenum?: number;
  fluoride?: number;

  // === VITAMINS ===
  // Fat-soluble
  vitaminA?: number;        // mcg RAE
  vitaminD?: number;        // mcg
  vitaminE?: number;        // mg
  vitaminK?: number;        // mcg

  // Water-soluble
  vitaminC?: number;        // mg
  thiamin?: number;         // B1 mg
  riboflavin?: number;      // B2 mg
  niacin?: number;          // B3 mg
  pantothenicAcid?: number; // B5 mg
  vitaminB6?: number;       // mg
  biotin?: number;          // mcg
  folate?: number;          // mcg DFE
  vitaminB12?: number;      // mcg
  choline?: number;         // mg

  // === OTHER BIOACTIVE ===
  caffeine?: number;        // mg
  alcohol?: number;         // g
  water?: number;           // ml
  lycopene?: number;        // mcg
  lutein?: number;          // mcg
  betaCarotene?: number;    // mcg

  // === METADATA ===
  glycemicIndex?: number;
  glycemicLoad?: number;
  novaClass?: 1 | 2 | 3 | 4;
}

// ============================================
// Scoring Types
// ============================================

export interface NutrientScore {
  name: string;
  score: number; // 0-100
  impact: 'positive' | 'negative' | 'neutral';
  reason: string;
}

export interface FocusImpact {
  focus: WellnessFocus;
  focusLabel: string;
  score: number; // 0-100
  rating: 'excellent' | 'good' | 'moderate' | 'poor';
  highlights: string[];
  concerns: string[];
}

/** @deprecated Use FocusImpact instead */
export interface ConditionImpact {
  condition: string;
  impact: 'beneficial' | 'moderate' | 'caution' | 'avoid';
  reason: string;
  recommendation?: string;
}

// ============================================
// Health Profile
// ============================================

export interface FoodHealthProfile extends ExtendedNutritionData {
  // AI Grading (when available)
  aiGrading?: AIGradingResult;
  // Scoring (fallback when AI not available)
  healthGrade: HealthGrade;
  gradeReason: string;
  overallScore: number; // 0-100
  nutrientScores: NutrientScore[];
  focusScores: Record<WellnessFocus, number>;
  focusImpacts: FocusImpact[];
  /** @deprecated Use focusImpacts instead */
  conditionImpacts: ConditionImpact[];
  aiRecommendation?: string;
  alternatives?: FoodAlternative[];
  /** Food intelligence data for contextual insights */
  intelligence?: FoodIntelligence;
}

export interface FoodAlternative {
  name: string;
  calories: number;
  healthGrade: HealthGrade;
  benefit: string;
  calorieReduction?: number;
  proteinIncrease?: number;
}

// ============================================
// AI Grading Result
// ============================================

export interface AIGradingResult {
  focusGrades: Record<WellnessFocus, HealthGrade>;
  overallGrade: HealthGrade;
  primaryConcerns: string[];
  strengths: string[];
}

// ============================================
// AI Comparison Insight
// ============================================

export interface AIComparisonInsight {
  verdict: string;
  winnerIndex: number | null;
  contextualAnalysis: string;
  focusInsights: Partial<Record<WellnessFocus, string>>;
  surprises: string[];
  recommendation?: string;
}

// ============================================
// Comparison Results
// ============================================

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

export interface MultiComparisonResult {
  items: FoodHealthProfile[];
  rankings: {
    index: number;
    rank: number;
    name: string;
    grade: HealthGrade;
    score: number;
  }[];
  categoryComparisons: {
    category: string;
    bestIndex: number;
    values: { index: number; value: number; unit: string }[];
  }[];
  aiInsight?: AIComparisonInsight;
}

// ============================================
// Input Types
// ============================================

export type InputMethod = 'photo' | 'text' | 'manual' | null;

export interface FoodInputItem {
  id: string;
  inputMethod: InputMethod;
  imageData?: string;
  textDescription?: string;
  nutritionData?: ExtendedNutritionData;
  status: 'empty' | 'pending' | 'analyzing' | 'ready' | 'error';
  error?: string;
  healthProfile?: FoodHealthProfile;
}

/** Food item data for adding to food log */
export interface FoodLogItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
}

export interface FoodComparisonModalProps {
  onClose: () => void;
  /** Callback when user wants to add selected foods to their food log */
  onAddToLog?: (items: FoodLogItem[]) => void;
}
