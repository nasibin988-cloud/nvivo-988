/**
 * DRI (Dietary Reference Intakes) Type Definitions
 *
 * Local type definitions for the functions package.
 * These mirror the types in packages/shared/src/types/models/dri.ts
 * to keep the functions package self-contained for Firebase deployment.
 *
 * NOTE: If you update these types, also update packages/shared/src/types/models/dri.ts
 */

// ============================================================================
// CORE USER PROFILE TYPES
// ============================================================================

/** Biological sex for DRI calculations */
export type Sex = 'male' | 'female';

/** Physical activity level for calorie calculations */
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high' | 'athlete';

/** Life stage for special DRI adjustments */
export type LifeStage = 'non_pregnant' | 'pregnant' | 'lactating';

/** User's nutrition-related goal */
export type GoalType = 'weight_loss' | 'maintenance' | 'muscle_gain' | 'performance';

/** Health condition flags */
export interface HealthFlags {
  hypertension?: boolean;
  ckd?: boolean;
  diabetes?: boolean;
  heartDisease?: boolean;
}

/** User profile for DRI calculations */
export interface DriUserProfile {
  ageYears: number;
  sex: Sex;
  weightKg?: number;
  heightCm?: number;
  activityLevel?: ActivityLevel;
  lifeStage?: LifeStage;
  health?: HealthFlags;
  goal?: GoalType;
}

// ============================================================================
// DRI VALUE STRUCTURE TYPES
// ============================================================================

/** Age range string for DRI table lookups */
export type AgeRange = '19-30' | '31-50' | '51-70' | '70+';

/** DRI reference type */
export type DriReferenceType = 'RDA' | 'AI' | 'UL' | 'AMDR';

/** DRI values indexed by age range */
export type DriValueByAge = Record<AgeRange, number>;

/** RDA or AI values split by sex */
export interface DriRdaAiBySex {
  male: Partial<DriValueByAge>;
  female: Partial<DriValueByAge>;
}

/** Upper Limit values */
export interface DriUpperLimit {
  male?: Partial<DriValueByAge>;
  female?: Partial<DriValueByAge>;
  both?: Partial<DriValueByAge>;
}

/** Acceptable Macronutrient Distribution Range */
export interface DriAmdr {
  minPctKcal: number;
  maxPctKcal: number;
}

/** Adjustment rule for special populations */
export interface SpecialAdjustment {
  condition: 'pregnant' | 'lactating' | 'athlete' | 'hypertension' | 'ckd' | 'diabetes' | 'heartDisease';
  adjustment: {
    type: 'absolute' | 'multiplier' | 'replace';
    value: number;
    target: 'base' | 'upperLimit';
  };
}

/** Complete DRI definition for a single nutrient */
export interface NutrientDriDefinition {
  nutrientId: string;
  unit: 'kcal' | 'g' | 'mg' | 'mcg';
  rda?: DriRdaAiBySex;
  ai?: DriRdaAiBySex;
  ul?: DriUpperLimit;
  amdr?: DriAmdr;
  primaryReference?: 'RDA' | 'AI';
  specialAdjustments?: SpecialAdjustment[];
}

// ============================================================================
// EVALUATION RESULT TYPES
// ============================================================================

/** Nature of a nutrient */
export type NutrientNature = 'beneficial' | 'risk' | 'neutral';

/** Classification result for a single nutrient evaluation */
export type NutrientClassification =
  | 'beneficial_high'
  | 'beneficial_moderate'
  | 'beneficial_low'
  | 'risk_high'
  | 'risk_moderate'
  | 'risk_low'
  | 'neutral'
  | 'not_applicable'
  | 'insufficient_data';

/** Computed daily target for a specific user */
export interface DailyNutrientTarget {
  nutrientId: string;
  unit: 'kcal' | 'g' | 'mg' | 'mcg';
  referenceType: DriReferenceType;
  base?: number;
  min?: number;
  max?: number;
  upperLimit?: number;
  source: string;
}

/** Single nutrient evaluation result */
export interface NutrientEvaluation {
  nutrientId: string;
  nutrientName: string;
  amountInFood: number | null;
  unit: 'kcal' | 'g' | 'mg' | 'mcg';
  target: DailyNutrientTarget | null;
  percentOfTarget?: number;
  percentOfUpperLimit?: number;
  classification: NutrientClassification;
  nature: NutrientNature;
}

/** Complete evaluation result for a food item */
export interface FoodEvaluationResult {
  evaluations: NutrientEvaluation[];
  overallScore?: number;
  highlights: {
    beneficial: NutrientEvaluation[];
    concerns: NutrientEvaluation[];
  };
  userProfile: {
    ageRange: AgeRange;
    sex: Sex;
    calorieTarget: number;
  };
}
