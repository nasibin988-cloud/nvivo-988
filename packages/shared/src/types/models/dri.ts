/**
 * DRI (Dietary Reference Intakes) Type Definitions
 *
 * This module contains all types for the DRI-based nutrient evaluation system.
 * Single source of truth for user profiles, DRI values, and evaluation results.
 *
 * References:
 * - NIH Office of Dietary Supplements: https://ods.od.nih.gov/
 * - USDA Dietary Guidelines 2020-2025: https://www.dietaryguidelines.gov/
 * - National Academies DRI Tables: https://www.nationalacademies.org/
 */

// ============================================================================
// STEP 1.1: CORE USER PROFILE TYPES
// ============================================================================

/**
 * Biological sex for DRI calculations.
 * DRI values differ significantly between males and females for many nutrients.
 */
export type Sex = 'male' | 'female';

/**
 * Physical activity level for calorie and macronutrient calculations.
 * Based on PAL (Physical Activity Level) multipliers from IOM.
 */
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high' | 'athlete';

/**
 * Life stage for special DRI adjustments.
 * Pregnancy and lactation significantly increase requirements for many nutrients.
 */
export type LifeStage = 'non_pregnant' | 'pregnant' | 'lactating';

/**
 * User's nutrition-related goal.
 * Affects calorie target and potentially macronutrient distribution.
 */
export type GoalType = 'weight_loss' | 'maintenance' | 'muscle_gain' | 'performance';

/**
 * Health condition flags that affect DRI recommendations.
 * Each condition may trigger special adjustments to nutrient targets or limits.
 */
export interface HealthFlags {
  /** High blood pressure - reduces sodium UL to 1500mg */
  hypertension?: boolean;
  /** Chronic kidney disease - affects potassium, phosphorus limits */
  ckd?: boolean;
  /** Diabetes - may affect carbohydrate recommendations */
  diabetes?: boolean;
  /** Cardiovascular disease - reduces cholesterol UL */
  heartDisease?: boolean;
}

/**
 * User profile for DRI calculations.
 * Contains all demographic and health data needed for personalized targets.
 */
export interface DriUserProfile {
  /** User's age in years (required for age-range lookup) */
  ageYears: number;
  /** Biological sex (required - affects most DRI values) */
  sex: Sex;
  /** Weight in kilograms (optional, used for protein/calorie calculations) */
  weightKg?: number;
  /** Height in centimeters (optional, used for calorie calculations) */
  heightCm?: number;
  /** Activity level (optional, defaults to 'moderate') */
  activityLevel?: ActivityLevel;
  /** Life stage (optional, for pregnancy/lactation adjustments) */
  lifeStage?: LifeStage;
  /** Health conditions (optional, triggers special adjustments) */
  health?: HealthFlags;
  /** Nutrition goal (optional, affects calorie target) */
  goal?: GoalType;
}

// ============================================================================
// STEP 1.2: DRI VALUE STRUCTURE TYPES
// ============================================================================

/**
 * Age range string for DRI table lookups.
 * Adults only for now (pediatric DRI to be added later).
 */
export type AgeRange = '19-30' | '31-50' | '51-70' | '70+';

/**
 * DRI reference type - which standard we're using for a nutrient.
 * - RDA: Recommended Dietary Allowance (covers 97-98% of healthy individuals)
 * - AI: Adequate Intake (used when RDA cannot be determined)
 * - UL: Tolerable Upper Intake Level (max safe intake)
 * - AMDR: Acceptable Macronutrient Distribution Range (% of calories)
 */
export type DriReferenceType = 'RDA' | 'AI' | 'UL' | 'AMDR';

/**
 * DRI values indexed by age range.
 * Partial because not all age ranges may be defined for every nutrient.
 */
export type DriValueByAge = Record<AgeRange, number>;

/**
 * RDA or AI values split by sex.
 * Most micronutrients have different requirements for males vs females.
 */
export interface DriRdaAiBySex {
  male: Partial<DriValueByAge>;
  female: Partial<DriValueByAge>;
}

/**
 * Upper Limit values.
 * Some ULs are the same for both sexes ('both'), others differ by sex.
 */
export interface DriUpperLimit {
  male?: Partial<DriValueByAge>;
  female?: Partial<DriValueByAge>;
  /** Used when UL is identical for both sexes */
  both?: Partial<DriValueByAge>;
}

/**
 * Acceptable Macronutrient Distribution Range.
 * Expressed as percentage of total calorie intake.
 */
export interface DriAmdr {
  /** Minimum percent of calories from this macronutrient */
  minPctKcal: number;
  /** Maximum percent of calories from this macronutrient */
  maxPctKcal: number;
}

/**
 * Adjustment rule for special populations.
 * Allows modifying base values or upper limits for specific conditions.
 */
export interface SpecialAdjustment {
  /** Condition that triggers this adjustment */
  condition: 'pregnant' | 'lactating' | 'athlete' | 'hypertension' | 'ckd' | 'diabetes' | 'heartDisease';
  /** How to apply the adjustment */
  adjustment: {
    /** Type of adjustment: add to value, multiply, or replace entirely */
    type: 'absolute' | 'multiplier' | 'replace';
    /** The adjustment value */
    value: number;
    /** Which target to adjust */
    target: 'base' | 'upperLimit';
  };
}

/**
 * Complete DRI definition for a single nutrient.
 * Contains all reference values and adjustment rules.
 */
export interface NutrientDriDefinition {
  /** Nutrient identifier (maps to nutrition.ts keys) */
  nutrientId: string;
  /** Unit of measurement */
  unit: 'kcal' | 'g' | 'mg' | 'mcg';
  /** Recommended Dietary Allowance by sex and age */
  rda?: DriRdaAiBySex;
  /** Adequate Intake (when RDA unavailable) */
  ai?: DriRdaAiBySex;
  /** Tolerable Upper Intake Level */
  ul?: DriUpperLimit;
  /** Acceptable Macronutrient Distribution Range */
  amdr?: DriAmdr;
  /** Which reference to prefer when both RDA and AI exist */
  primaryReference?: 'RDA' | 'AI';
  /** Special adjustments for health conditions */
  specialAdjustments?: SpecialAdjustment[];
}

// ============================================================================
// STEP 1.3: EVALUATION RESULT TYPES
// ============================================================================

/**
 * Nature of a nutrient - determines classification direction.
 * - beneficial: Higher is better (protein, fiber, vitamins)
 * - risk: Lower is better (sodium, saturated fat, trans fat)
 * - neutral: Context-dependent (calories, total fat, carbs)
 */
export type NutrientNature = 'beneficial' | 'risk' | 'neutral';

/**
 * Classification result for a single nutrient evaluation.
 * Used to display color-coded feedback in the UI.
 */
export type NutrientClassification =
  | 'beneficial_high'      // Good nutrient, high amount (green)
  | 'beneficial_moderate'  // Good nutrient, moderate amount (light green)
  | 'beneficial_low'       // Good nutrient, low amount (gray)
  | 'risk_high'            // Bad nutrient, high amount (red warning)
  | 'risk_moderate'        // Bad nutrient, moderate amount (orange)
  | 'risk_low'             // Bad nutrient, low amount (yellow/safe)
  | 'neutral'              // Nutrient is neither good nor bad
  | 'not_applicable'       // No DRI reference available for this nutrient
  | 'insufficient_data';   // Missing food nutrition data

/**
 * Computed daily target for a specific user.
 * Contains the personalized reference values after all adjustments.
 */
export interface DailyNutrientTarget {
  /** Nutrient identifier */
  nutrientId: string;
  /** Unit of measurement */
  unit: 'kcal' | 'g' | 'mg' | 'mcg';
  /** Which DRI reference type this target is based on */
  referenceType: DriReferenceType;
  /** RDA/AI target value (aim for this amount) */
  base?: number;
  /** AMDR minimum in grams (don't go below) */
  min?: number;
  /** AMDR maximum in grams (don't exceed) */
  max?: number;
  /** UL - Tolerable Upper Limit (never exceed) */
  upperLimit?: number;
  /** Debug info: source of this target (e.g., "RDA male 19-30") */
  source: string;
}

/**
 * Single nutrient evaluation result.
 * Contains all information needed to display the evaluation in the UI.
 */
export interface NutrientEvaluation {
  /** Nutrient identifier */
  nutrientId: string;
  /** Human-readable nutrient name */
  nutrientName: string;
  /** Amount of this nutrient in the food (null if not available) */
  amountInFood: number | null;
  /** Unit of measurement */
  unit: 'kcal' | 'g' | 'mg' | 'mcg';
  /** User's personalized target for this nutrient */
  target: DailyNutrientTarget | null;
  /** Percent of RDA/AI this food provides */
  percentOfTarget?: number;
  /** Percent of UL this food uses up */
  percentOfUpperLimit?: number;
  /** Final classification for UI display */
  classification: NutrientClassification;
  /** Nature of this nutrient (beneficial/risk/neutral) */
  nature: NutrientNature;
}

/**
 * Complete evaluation result for a food item.
 * Contains all nutrient evaluations plus summary highlights.
 */
export interface FoodEvaluationResult {
  /** All nutrient evaluations */
  evaluations: NutrientEvaluation[];
  /** Optional overall health score (0-100) */
  overallScore?: number;
  /** Highlighted nutrients for quick summary */
  highlights: {
    /** Top nutrients where this food excels */
    beneficial: NutrientEvaluation[];
    /** Nutrients to be aware of (high risk values) */
    concerns: NutrientEvaluation[];
  };
  /** User profile summary used for this evaluation */
  userProfile: {
    ageRange: AgeRange;
    sex: Sex;
    calorieTarget: number;
  };
}
