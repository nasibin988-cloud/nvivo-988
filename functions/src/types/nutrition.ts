/**
 * Nutrition Types for Functions
 *
 * These types are used by the nutrition domain in Cloud Functions.
 * They mirror the types in packages/shared/src/types/nutrition.ts
 */

// =============================================================================
// Core Enums and Literals
// =============================================================================

export type Sex = 'male' | 'female';

export type LifeStageGroup =
  | 'infants_0_6mo'
  | 'infants_7_12mo'
  | 'children_1_3'
  | 'children_4_8'
  | 'children_9_13'
  | 'adolescents_14_18'
  | 'adults_19_30'
  | 'adults_31_50'
  | 'adults_51_70'
  | 'adults_70_plus'
  | 'pregnancy_14_18'
  | 'pregnancy_19_30'
  | 'pregnancy_31_50'
  | 'lactation_14_18'
  | 'lactation_19_30'
  | 'lactation_31_50';

export type DriType = 'RDA' | 'AI' | 'UL' | 'AMDR' | 'CDRR' | 'EAR';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high' | 'athlete';

export type NutritionGoal =
  | 'weight_loss'
  | 'maintenance'
  | 'weight_gain'
  | 'muscle_gain'
  | 'performance';

export type NutrientClassification = 'beneficial' | 'limit' | 'risk' | 'neutral' | 'context_dependent';

export type BeneficialStatus = 'excellent' | 'good' | 'below_target' | 'low';

export type LimitStatus = 'well_within' | 'moderate' | 'approaching_limit' | 'exceeds_limit';

export type EvaluationStatus = BeneficialStatus | LimitStatus | 'adequate' | 'unknown';

// =============================================================================
// User Profile Types
// =============================================================================

export interface NutritionUserProfile {
  userId: string;
  dateOfBirth: string;
  sex: Sex;
  weightKg?: number;
  heightCm?: number;
  activityLevel: ActivityLevel;
  goal: NutritionGoal;
  isPregnant?: boolean;
  isLactating?: boolean;
  conditions?: string[];
}

export interface EnergyCalculation {
  bmr: number;
  tdee: number;
  targetCalories: number;
  activityMultiplier: number;
  goalAdjustment: number;
  method: 'mifflin_st_jeor' | 'default';
}

// =============================================================================
// Target Types
// =============================================================================

export interface NutrientTarget {
  nutrientId: string;
  displayName: string;
  unit: string;
  target?: number;
  targetType?: 'RDA' | 'AI';
  upperLimit?: number;
  cdrrLimit?: number;
  dailyValue?: number;
  amdrMin?: number;
  amdrMax?: number;
  amdrMinPercent?: number;
  amdrMaxPercent?: number;
  source: string;
}

export interface UserNutritionTargets {
  calories: number;
  nutrients: Record<string, NutrientTarget>;
  profile: {
    ageYears: number;
    sex: Sex;
    lifeStageGroup: LifeStageGroup;
    activityLevel: ActivityLevel;
    goal: NutritionGoal;
  };
  computedAt: string;
}

// =============================================================================
// Intake and Evaluation Types
// =============================================================================

export interface NutrientIntake {
  nutrientId: string;
  amount: number;
  unit: string;
}

export interface FoodIntake {
  foodId?: string;
  name: string;
  servingSize?: string;
  nutrients: NutrientIntake[];
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  loggedAt: string;
}

export interface DailyIntake {
  date: string;
  foods: FoodIntake[];
  totals: Record<string, number>;
}

export interface NutrientEvaluation {
  nutrientId: string;
  displayName: string;
  intake: number;
  target: number | null;
  upperLimit: number | null;
  unit: string;
  percentOfTarget: number | null;
  percentOfLimit: number | null;
  classification: NutrientClassification;
  status: EvaluationStatus;
  statusLabel: string;
  statusColor: 'green' | 'yellow' | 'orange' | 'red' | 'gray';
}

export interface ScoreBreakdown {
  beneficial: number;
  limit: number;
  balance: number;
}

export interface DayEvaluation {
  date: string;
  score: number;
  scoreLabel: string;
  scoreColor: 'green' | 'yellow' | 'orange' | 'red';
  breakdown: ScoreBreakdown;
  nutrients: NutrientEvaluation[];
  highlights: string[];
  gaps: string[];
  summary: string;
}

// =============================================================================
// Insight Types
// =============================================================================

export interface NutrientGap {
  nutrientId: string;
  displayName: string;
  intake: number;
  target: number;
  percentOfTarget: number;
  unit: string;
  suggestion: string;
}

export interface DailySummary {
  score: number;
  caloriesConsumed: number;
  calorieTarget: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  sodiumMg: number;
  topHighlights: string[];
  topGaps: string[];
}

// =============================================================================
// Gamification Types
// =============================================================================

export interface StreakInfo {
  currentLoggingStreak: number;
  longestLoggingStreak: number;
  currentScoreStreak: number;
  lastLogDate: string | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'score' | 'milestone' | 'discovery';
  requirement: string;
  unlockedAt?: string;
}
