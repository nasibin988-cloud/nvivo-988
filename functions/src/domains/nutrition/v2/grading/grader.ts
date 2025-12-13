/**
 * Nutrition V2 Grading Layer
 *
 * Wrapper around the existing deterministic grading system.
 * Maps CompleteNutrition to grading input and returns v2 types.
 *
 * All grading is 100% deterministic - no AI calls.
 */

import {
  calculateDeterministicGrades,
  gradeSingleFocus,
  getNutriScore,
  type NutritionInput,
  type DeterministicGradingResult,
} from '../../deterministicGrading';
import type {
  CompleteNutrition,
  CompleteGradingResult,
  WellnessFocus,
  HealthGrade,
  FocusGradeResult,
  SatietyResult,
  InflammatoryResult,
  EnrichedNutrition,
  GIResult,
} from '../types';

/**
 * Grade food nutrition using deterministic algorithms
 * Returns comprehensive grading result
 */
export function gradeNutrition(
  nutrition: CompleteNutrition,
  servingGrams: number,
  foodGroup?: string,
  isBeverage?: boolean
): CompleteGradingResult {
  // Map CompleteNutrition to grading input
  const input = mapToGradingInput(nutrition, servingGrams, foodGroup, isBeverage);

  // Calculate all grades
  const result = calculateDeterministicGrades(input);

  // Convert to v2 result format
  return convertToV2Result(result);
}

/**
 * Grade with GI consideration (enhances blood sugar and weight management scores)
 */
export function gradeNutritionWithGI(
  nutrition: EnrichedNutrition,
  servingGrams: number,
  giResult?: GIResult,
  foodGroup?: string,
  isBeverage?: boolean
): CompleteGradingResult {
  // Start with base grading
  const baseResult = gradeNutrition(nutrition, servingGrams, foodGroup, isBeverage);

  // If we have GI data, adjust relevant scores
  if (giResult && giResult.confidence >= 0.6) {
    const giAdjustedResult = adjustForGI(baseResult, giResult);
    return giAdjustedResult;
  }

  return baseResult;
}

/**
 * Quick grade for a single wellness focus
 */
export function gradeFocus(
  nutrition: CompleteNutrition,
  servingGrams: number,
  focus: WellnessFocus,
  foodGroup?: string
): FocusGradeResult {
  const input = mapToGradingInput(nutrition, servingGrams, foodGroup);
  return gradeSingleFocus(input, focus);
}

/**
 * Get overall Nutri-Score only
 */
export function getOverallGrade(
  nutrition: CompleteNutrition,
  servingGrams: number,
  isBeverage?: boolean,
  foodGroup?: string
): { grade: HealthGrade; score: number } {
  const input = mapToGradingInput(nutrition, servingGrams, foodGroup, isBeverage);
  return getNutriScore(input);
}

/**
 * Map CompleteNutrition to the grading input format
 */
function mapToGradingInput(
  nutrition: CompleteNutrition,
  servingGrams: number,
  foodGroup?: string,
  isBeverage?: boolean
): NutritionInput {
  return {
    // Required macros
    calories: nutrition.calories,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fat: nutrition.fat,

    // Important for grading
    fiber: nutrition.fiber,
    sugar: nutrition.sugar,
    sodium: nutrition.sodium,
    saturatedFat: nutrition.saturatedFat,

    // Optional - enhance accuracy
    transFat: nutrition.transFat,
    cholesterol: nutrition.cholesterol,
    potassium: nutrition.potassium,
    calcium: nutrition.calcium,
    iron: nutrition.iron,
    magnesium: nutrition.magnesium,
    vitaminC: nutrition.vitaminC,
    vitaminD: nutrition.vitaminD,

    // Omega-3 estimation (sum of common omega-3 rich indicators)
    // CompleteNutrition doesn't have omega-3 directly, but we can add it later
    omega3: undefined,

    // Water content estimation (for satiety calculation)
    // Approximate based on food type or leave undefined
    water: undefined,

    // Metadata
    servingGrams,
    isBeverage,
    foodGroup,
  };
}

/**
 * Convert internal grading result to v2 format
 */
function convertToV2Result(result: DeterministicGradingResult): CompleteGradingResult {
  return {
    overall: {
      grade: result.overallGrade,
      score: result.overallScore,
      nutriScorePoints: result.nutriScorePoints,
    },
    focusGrades: result.focusGrades,
    satiety: categorizeSatiety(result.satietyScore),
    inflammatory: categorizeInflammatory(result.inflammatoryIndex),
    strengths: result.strengths,
    concerns: result.primaryConcerns,
  };
}

/**
 * Categorize satiety score
 */
function categorizeSatiety(score: number): SatietyResult {
  let category: SatietyResult['category'];

  if (score >= 80) category = 'very_high';
  else if (score >= 65) category = 'high';
  else if (score >= 45) category = 'moderate';
  else if (score >= 25) category = 'low';
  else category = 'very_low';

  return { score, category };
}

/**
 * Categorize inflammatory index
 */
function categorizeInflammatory(index: number): InflammatoryResult {
  let category: InflammatoryResult['category'];

  if (index <= -0.5) category = 'anti_inflammatory';
  else if (index <= 0.2) category = 'neutral';
  else if (index <= 0.7) category = 'mildly_inflammatory';
  else category = 'inflammatory';

  return { index, category };
}

/**
 * Adjust scores based on GI data
 * GI affects blood sugar and weight management scores most
 */
function adjustForGI(result: CompleteGradingResult, giResult: GIResult): CompleteGradingResult {
  const adjusted = { ...result, focusGrades: { ...result.focusGrades } };

  // Calculate GI adjustment factor (-15 to +15 points)
  const giAdjustment = calculateGIAdjustment(giResult.gi, giResult.giBand);

  // Adjust Blood Sugar Balance
  const bsb = adjusted.focusGrades.blood_sugar_balance;
  const bsbAdjustedScore = Math.max(0, Math.min(100, bsb.score + giAdjustment));
  adjusted.focusGrades.blood_sugar_balance = {
    ...bsb,
    score: bsbAdjustedScore,
    grade: scoreToGrade(bsbAdjustedScore),
    insight: updateInsightWithGI(bsb.insight, giResult),
    pros: giResult.giBand === 'low' ? [...bsb.pros, 'Low glycemic index'] : bsb.pros,
    cons: giResult.giBand === 'high' ? [...bsb.cons, 'High glycemic index'] : bsb.cons,
  };

  // Adjust Weight Management (GI affects satiety)
  const wm = adjusted.focusGrades.weight_management;
  const wmAdjustment = Math.round(giAdjustment * 0.6); // Less impact than blood sugar
  const wmAdjustedScore = Math.max(0, Math.min(100, wm.score + wmAdjustment));
  adjusted.focusGrades.weight_management = {
    ...wm,
    score: wmAdjustedScore,
    grade: scoreToGrade(wmAdjustedScore),
  };

  // Adjust Energy/Endurance (low GI = sustained energy)
  const ee = adjusted.focusGrades.energy_endurance;
  const eeAdjustment = Math.round(giAdjustment * 0.4);
  const eeAdjustedScore = Math.max(0, Math.min(100, ee.score + eeAdjustment));
  adjusted.focusGrades.energy_endurance = {
    ...ee,
    score: eeAdjustedScore,
    grade: scoreToGrade(eeAdjustedScore),
  };

  return adjusted;
}

/**
 * Calculate score adjustment based on GI
 */
function calculateGIAdjustment(gi: number, giBand: 'low' | 'medium' | 'high'): number {
  // Low GI (≤55): +5 to +15 bonus
  if (giBand === 'low') {
    return Math.round(15 - (gi / 55) * 10);
  }

  // Medium GI (56-69): -5 to +5
  if (giBand === 'medium') {
    return Math.round(5 - ((gi - 55) / 14) * 10);
  }

  // High GI (≥70): -5 to -15 penalty
  return Math.round(-5 - ((gi - 70) / 30) * 10);
}

/**
 * Convert score to grade
 */
function scoreToGrade(score: number): HealthGrade {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

/**
 * Update insight with GI information
 */
function updateInsightWithGI(originalInsight: string, giResult: GIResult): string {
  const giPrefix = giResult.giBand === 'low'
    ? 'Low GI supports stable blood sugar. '
    : giResult.giBand === 'high'
      ? 'High GI may cause blood sugar spikes. '
      : 'Moderate GI impact on blood sugar. ';

  return giPrefix + originalInsight;
}

/**
 * Batch grade multiple foods
 */
export function batchGradeNutrition(
  foods: Array<{
    nutrition: CompleteNutrition;
    servingGrams: number;
    foodGroup?: string;
    isBeverage?: boolean;
  }>
): CompleteGradingResult[] {
  return foods.map(food =>
    gradeNutrition(food.nutrition, food.servingGrams, food.foodGroup, food.isBeverage)
  );
}
