/**
 * Score Calculator V2
 *
 * Advanced nutrition scoring using:
 * - Mean Adequacy Ratio (MAR) for nutrient adequacy
 * - Focus-specific weights and thresholds
 * - Fat quality scoring (unsaturated/saturated ratio)
 * - Glycemic impact assessment
 * - Dietary variety scoring
 * - Calorie balance with bidirectional penalty
 *
 * Score breakdown (default weights):
 * - 50 points: Nutrient Adequacy (MAR)
 * - 30 points: Moderation (limit nutrients + calorie balance)
 * - 20 points: Balance & Quality (macros, fat quality, variety, glycemic impact)
 */

import type { NutrientEvaluation } from '../../../types/nutrition';
import type { NutritionFocusId, NutritionFocusConfig } from '../focus';
import { getFocusConfig } from '../focus';

// =============================================================================
// Types
// =============================================================================

export interface ScoreBreakdownV2 {
  adequacy: {
    points: number;
    maxPoints: number;
    mar: number;
    nutrientNARs: Record<string, number>;
  };
  moderation: {
    points: number;
    maxPoints: number;
    details: {
      sodium: { intake: number; limit: number; score: number };
      saturatedFat: { intake: number; limit: number; score: number };
      transFat: { intake: number; limit: number; score: number };
      addedSugar: { intake: number; limit: number; score: number };
      cholesterol: { intake: number; limit: number; score: number };
      caloriePenalty: number;
    };
  };
  balance: {
    points: number;
    maxPoints: number;
    details: {
      macroBalance: number;
      fatQuality: number;
      variety: number;
      glycemicImpact?: number;
      inflammatoryIndex?: number;
    };
  };
  focus: {
    id: NutritionFocusId;
    name: string;
    appliedWeights: { adequacy: number; moderation: number; balance: number };
  };
}

export interface ScoreResultV2 {
  score: number;
  label: string;
  color: 'green' | 'yellow' | 'orange' | 'red';
  mar: number;
  breakdown: ScoreBreakdownV2;
  loggingAssessment: {
    status: 'complete' | 'possibly_incomplete' | 'likely_incomplete';
    confidence: 'high' | 'medium' | 'low';
    message: string | null;
  };
}

export interface IntakeData {
  nutrients: Record<string, number>;
  calories: number;
  calorieTarget: number;
  bmr?: number;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * All beneficial nutrients for MAR calculation
 */
const BENEFICIAL_NUTRIENTS = [
  'protein',
  'fiber',
  'vitaminA',
  'vitaminC',
  'vitaminD',
  'vitaminE',
  'vitaminK',
  'thiamin',
  'riboflavin',
  'niacin',
  'vitaminB6',
  'folate',
  'vitaminB12',
  'choline',
  'calcium',
  'iron',
  'magnesium',
  'phosphorus',
  'potassium',
  'zinc',
  'copper',
  'manganese',
  'selenium',
];

/**
 * Limit nutrients with default limits
 */
const LIMIT_NUTRIENTS = {
  sodium: 2300, // mg
  saturatedFat: 22, // g (10% of 2000 kcal)
  transFat: 2, // g (practical limit)
  addedSugar: 50, // g (10% of 2000 kcal)
  cholesterol: 300, // mg
};

/**
 * Food group indicator nutrients for variety scoring
 */
const FOOD_GROUP_INDICATORS = {
  fruits: ['vitaminC', 'potassium'],
  vegetables: ['vitaminA', 'vitaminK', 'folate'],
  wholeGrains: ['fiber', 'thiamin', 'niacin'],
  protein: ['protein', 'vitaminB12', 'iron', 'zinc'],
  dairy: ['calcium', 'vitaminD', 'riboflavin'],
  healthyFats: ['vitaminE'], // MUFA/PUFA tracked separately
};

// =============================================================================
// MAR Calculation
// =============================================================================

/**
 * Calculate Nutrient Adequacy Ratio (NAR) for a single nutrient
 * Capped at 1.0 to prevent excess from masking deficiencies
 */
function calculateNAR(intake: number, recommended: number): number {
  if (recommended <= 0) return 1.0;
  return Math.min(1.0, intake / recommended);
}

/**
 * Calculate Mean Adequacy Ratio (MAR) across all beneficial nutrients
 * with optional focus-specific emphasis multipliers
 */
function calculateMAR(
  evaluations: NutrientEvaluation[],
  focusConfig: NutritionFocusConfig
): { mar: number; nars: Record<string, number>; weightedTotal: number; totalWeight: number } {
  const nars: Record<string, number> = {};
  let weightedSum = 0;
  let totalWeight = 0;

  for (const nutrientId of BENEFICIAL_NUTRIENTS) {
    const eval_ = evaluations.find((e) => e.nutrientId === nutrientId);
    if (!eval_ || eval_.target === null || eval_.target === 0) continue;

    const nar = calculateNAR(eval_.intake, eval_.target);
    nars[nutrientId] = nar;

    // Apply focus-specific emphasis
    const emphasis = focusConfig.nutrientEmphasis[nutrientId] ?? 1.0;
    weightedSum += nar * emphasis;
    totalWeight += emphasis;
  }

  const mar = totalWeight > 0 ? weightedSum / totalWeight : 0;
  return { mar, nars, weightedTotal: weightedSum, totalWeight };
}

/**
 * Calculate adequacy score (0-50 points default)
 */
function calculateAdequacyScore(
  evaluations: NutrientEvaluation[],
  focusConfig: NutritionFocusConfig,
  maxPoints: number = 50
): { points: number; mar: number; nars: Record<string, number> } {
  const { mar, nars } = calculateMAR(evaluations, focusConfig);
  const points = Math.round(mar * maxPoints * 10) / 10;

  return { points, mar, nars };
}

// =============================================================================
// Moderation Scoring
// =============================================================================

/**
 * Calculate moderation score for a single limit nutrient
 * Lower intake = higher score
 */
function calculateLimitNutrientScore(
  intake: number,
  limit: number,
  pointsAvailable: number
): number {
  if (intake <= 0) return pointsAvailable; // No intake = full points
  if (intake >= limit * 2) return 0; // Double limit = zero

  // Linear scale: at limit = 50% of points
  if (intake <= limit) {
    // 0 to limit: 100% to 50% of points
    const ratio = intake / limit;
    return pointsAvailable * (1 - ratio * 0.5);
  } else {
    // limit to 2x limit: 50% to 0% of points
    const overRatio = (intake - limit) / limit;
    return pointsAvailable * (0.5 - overRatio * 0.5);
  }
}

/**
 * Calculate calorie balance penalty
 * Penalizes both overeating and severe undereating
 */
function calculateCaloriePenalty(
  calories: number,
  target: number,
  tolerancePercent: number = 15
): number {
  if (target <= 0) return 0;

  const ratio = calories / target;
  const tolerance = tolerancePercent / 100;

  // Severe undereating (possible incomplete logging)
  if (ratio < 0.5) {
    return 10; // Max penalty for severe under
  }

  // Moderate undereating
  if (ratio < 1 - tolerance) {
    const underAmount = (1 - tolerance) - ratio;
    return Math.min(5, underAmount * 20);
  }

  // Within tolerance
  if (ratio <= 1 + tolerance) {
    return 0;
  }

  // Overeating
  if (ratio <= 1.5) {
    const overAmount = ratio - (1 + tolerance);
    return Math.min(7, overAmount * 20);
  }

  // Significant overeating
  return 7 + Math.min(5, (ratio - 1.5) * 10);
}

/**
 * Calculate moderation score (0-30 points default)
 */
function calculateModerationScore(
  intakeData: IntakeData,
  focusConfig: NutritionFocusConfig,
  maxPoints: number = 30
): ScoreBreakdownV2['moderation'] {
  const { nutrients, calories, calorieTarget } = intakeData;

  // Point allocation for each limit nutrient
  const pointsPerNutrient = {
    sodium: 6,
    saturatedFat: 8,
    transFat: 4,
    addedSugar: 8,
    cholesterol: 4,
  };

  // Calculate effective limits with focus overrides
  const effectiveLimits = { ...LIMIT_NUTRIENTS };

  // Apply focus-specific limit overrides
  if (focusConfig.limitOverrides.sodium) {
    effectiveLimits.sodium = focusConfig.limitOverrides.sodium;
  }
  if (focusConfig.limitOverrides.saturatedFat) {
    // Stored as multiplier (0.7 = 70% of default)
    effectiveLimits.saturatedFat = Math.round(
      LIMIT_NUTRIENTS.saturatedFat * focusConfig.limitOverrides.saturatedFat
    );
  }
  if (focusConfig.limitOverrides.addedSugar) {
    effectiveLimits.addedSugar = Math.round(
      LIMIT_NUTRIENTS.addedSugar * focusConfig.limitOverrides.addedSugar
    );
  }
  if (focusConfig.limitOverrides.cholesterol) {
    effectiveLimits.cholesterol = focusConfig.limitOverrides.cholesterol;
  }

  // Calculate individual scores
  const sodiumIntake = nutrients.sodium ?? 0;
  const satFatIntake = nutrients.saturatedFat ?? 0;
  const transFatIntake = nutrients.transFat ?? 0;
  const addedSugarIntake = nutrients.addedSugar ?? nutrients.sugar ?? 0;
  const cholesterolIntake = nutrients.cholesterol ?? 0;

  const sodiumScore = calculateLimitNutrientScore(
    sodiumIntake,
    effectiveLimits.sodium,
    pointsPerNutrient.sodium
  );
  const satFatScore = calculateLimitNutrientScore(
    satFatIntake,
    effectiveLimits.saturatedFat,
    pointsPerNutrient.saturatedFat
  );
  const transFatScore = calculateLimitNutrientScore(
    transFatIntake,
    effectiveLimits.transFat,
    pointsPerNutrient.transFat
  );
  const sugarScore = calculateLimitNutrientScore(
    addedSugarIntake,
    effectiveLimits.addedSugar,
    pointsPerNutrient.addedSugar
  );
  const cholesterolScore = calculateLimitNutrientScore(
    cholesterolIntake,
    effectiveLimits.cholesterol,
    pointsPerNutrient.cholesterol
  );

  const baseScore = sodiumScore + satFatScore + transFatScore + sugarScore + cholesterolScore;

  // Calculate calorie penalty
  const caloriePenalty = calculateCaloriePenalty(
    calories,
    calorieTarget,
    focusConfig.calorieTolerancePercent
  );

  const finalPoints = Math.max(0, Math.round((baseScore - caloriePenalty) * 10) / 10);

  return {
    points: finalPoints,
    maxPoints,
    details: {
      sodium: { intake: sodiumIntake, limit: effectiveLimits.sodium, score: sodiumScore },
      saturatedFat: { intake: satFatIntake, limit: effectiveLimits.saturatedFat, score: satFatScore },
      transFat: { intake: transFatIntake, limit: effectiveLimits.transFat, score: transFatScore },
      addedSugar: { intake: addedSugarIntake, limit: effectiveLimits.addedSugar, score: sugarScore },
      cholesterol: { intake: cholesterolIntake, limit: effectiveLimits.cholesterol, score: cholesterolScore },
      caloriePenalty,
    },
  };
}

// =============================================================================
// Balance & Quality Scoring
// =============================================================================

/**
 * Calculate macronutrient balance score (0-8 points)
 * Based on AMDR compliance
 */
function calculateMacroBalance(evaluations: NutrientEvaluation[]): number {
  const protein = evaluations.find((e) => e.nutrientId === 'protein');
  const carbs = evaluations.find((e) => e.nutrientId === 'carbs' || e.nutrientId === 'carbohydrate');
  const fat = evaluations.find((e) => e.nutrientId === 'fat' || e.nutrientId === 'totalFat');

  if (!protein || !carbs || !fat) return 4; // No data, give partial credit

  let score = 8;

  // Check each macro against reasonable ranges (50-150% of target)
  const pct = protein.percentOfTarget ?? 100;
  const cct = carbs.percentOfTarget ?? 100;
  const fct = fat.percentOfTarget ?? 100;

  // Protein check
  if (pct < 50) score -= Math.min(3, (50 - pct) / 15);
  else if (pct > 200) score -= Math.min(2, (pct - 200) / 50);

  // Carbs check
  if (cct < 40) score -= Math.min(2, (40 - cct) / 20);
  else if (cct > 180) score -= Math.min(2, (cct - 180) / 40);

  // Fat check
  if (fct < 50) score -= Math.min(2, (50 - fct) / 25);
  else if (fct > 150) score -= Math.min(2, (fct - 150) / 50);

  return Math.max(0, Math.round(score * 10) / 10);
}

/**
 * Calculate fat quality score (0-6 points)
 * Based on unsaturated/saturated ratio and omega balance
 */
function calculateFatQuality(nutrients: Record<string, number>): number {
  const pufa = nutrients.polyunsaturatedFat ?? 0;
  const mufa = nutrients.monounsaturatedFat ?? 0;
  const sfa = nutrients.saturatedFat ?? 0;

  let unsatSatScore = 0;

  if (sfa === 0) {
    unsatSatScore = 4;
  } else {
    const ratio = (pufa + mufa) / sfa;
    if (ratio >= 2.0) unsatSatScore = 4;
    else if (ratio >= 1.5) unsatSatScore = 3;
    else if (ratio >= 1.0) unsatSatScore = 2;
    else if (ratio >= 0.5) unsatSatScore = 1;
  }

  // Omega-3 to Omega-6 ratio (if available)
  const omega3 = nutrients.omega3 ?? 0;
  const omega6 = nutrients.omega6 ?? 0;
  let omegaScore = 1; // Default partial credit

  if (omega6 > 0 && omega3 > 0) {
    const omegaRatio = omega3 / omega6;
    if (omegaRatio >= 0.25) omegaScore = 2;
    else if (omegaRatio >= 0.15) omegaScore = 1.5;
    else if (omegaRatio >= 0.10) omegaScore = 1;
    else omegaScore = 0.5;
  }

  return unsatSatScore + omegaScore;
}

/**
 * Calculate dietary variety score (0-6 points)
 * Based on food group representation via indicator nutrients
 */
function calculateVariety(evaluations: NutrientEvaluation[]): number {
  let foodGroupsRepresented = 0;

  // Check each food group
  for (const [, indicators] of Object.entries(FOOD_GROUP_INDICATORS)) {
    const indicatorsWithIntake = indicators.filter((nutrientId) => {
      const eval_ = evaluations.find((e) => e.nutrientId === nutrientId);
      return eval_ && (eval_.percentOfTarget ?? 0) >= 50;
    });

    // Need at least half of indicators to count the food group
    if (indicatorsWithIntake.length >= Math.ceil(indicators.length / 2)) {
      foodGroupsRepresented++;
    }
  }

  return foodGroupsRepresented; // 0-6 points
}

/**
 * Calculate glycemic impact penalty (0-4 points penalty)
 * Based on sugar-to-fiber ratio
 */
function calculateGlycemicImpact(nutrients: Record<string, number>): number {
  const addedSugar = nutrients.addedSugar ?? nutrients.sugar ?? 0;
  const fiber = nutrients.fiber ?? 0;

  if (fiber === 0) {
    return addedSugar > 10 ? 4 : 2; // Penalty if no fiber
  }

  const ratio = addedSugar / fiber;

  if (ratio <= 1.0) return 0; // Excellent
  if (ratio <= 2.0) return 1; // Good
  if (ratio <= 4.0) return 2; // Moderate
  if (ratio <= 6.0) return 3; // Poor
  return 4; // Very poor
}

/**
 * Calculate inflammatory index bonus/penalty (-4 to +4 points)
 * Simplified DII-inspired scoring
 */
function calculateInflammatoryIndex(
  evaluations: NutrientEvaluation[],
  nutrients: Record<string, number>
): number {
  let score = 0;

  // Anti-inflammatory factors (positive)
  const fiber = evaluations.find((e) => e.nutrientId === 'fiber');
  if (fiber && (fiber.percentOfTarget ?? 0) >= 100) score += 1;

  const vitC = evaluations.find((e) => e.nutrientId === 'vitaminC');
  if (vitC && (vitC.percentOfTarget ?? 0) >= 100) score += 0.5;

  const vitE = evaluations.find((e) => e.nutrientId === 'vitaminE');
  if (vitE && (vitE.percentOfTarget ?? 0) >= 100) score += 0.5;

  const selenium = evaluations.find((e) => e.nutrientId === 'selenium');
  if (selenium && (selenium.percentOfTarget ?? 0) >= 100) score += 0.5;

  const zinc = evaluations.find((e) => e.nutrientId === 'zinc');
  if (zinc && (zinc.percentOfTarget ?? 0) >= 100) score += 0.5;

  // Pro-inflammatory factors (negative)
  const satFat = nutrients.saturatedFat ?? 0;
  if (satFat > 22) score -= 1; // Over 10% of 2000 kcal
  if (satFat > 30) score -= 1; // Way over

  const addedSugar = nutrients.addedSugar ?? nutrients.sugar ?? 0;
  if (addedSugar > 50) score -= 1; // Over 10%
  if (addedSugar > 75) score -= 1; // Way over

  return Math.max(-4, Math.min(4, score));
}

/**
 * Calculate balance & quality score (0-20 points default)
 */
function calculateBalanceScore(
  evaluations: NutrientEvaluation[],
  intakeData: IntakeData,
  focusConfig: NutritionFocusConfig,
  maxPoints: number = 20
): ScoreBreakdownV2['balance'] {
  const { nutrients } = intakeData;

  const macroBalance = calculateMacroBalance(evaluations);
  const fatQuality = calculateFatQuality(nutrients);
  const variety = calculateVariety(evaluations);

  let glycemicImpact: number | undefined;
  let inflammatoryIndex: number | undefined;
  let totalPenalty = 0;

  // Focus-specific assessments
  if (focusConfig.glycemicImpactEnabled) {
    glycemicImpact = calculateGlycemicImpact(nutrients);
    totalPenalty += glycemicImpact;
  }

  if (focusConfig.inflammatoryIndexEnabled) {
    inflammatoryIndex = calculateInflammatoryIndex(evaluations, nutrients);
    // Negative index = anti-inflammatory (bonus), positive = pro-inflammatory (penalty)
    totalPenalty -= inflammatoryIndex; // Subtract because positive is good here
  }

  // Base balance score
  const baseScore = macroBalance + fatQuality + variety;
  const finalPoints = Math.max(0, Math.min(maxPoints, baseScore - totalPenalty));

  return {
    points: Math.round(finalPoints * 10) / 10,
    maxPoints,
    details: {
      macroBalance,
      fatQuality,
      variety,
      glycemicImpact,
      inflammatoryIndex,
    },
  };
}

// =============================================================================
// Logging Assessment
// =============================================================================

/**
 * Assess whether logging appears complete
 */
function assessLogging(
  calories: number,
  bmr: number | undefined
): ScoreResultV2['loggingAssessment'] {
  if (!bmr || bmr <= 0) {
    return {
      status: 'complete',
      confidence: 'medium',
      message: null,
    };
  }

  const ratio = calories / bmr;

  if (ratio < 0.5) {
    return {
      status: 'likely_incomplete',
      confidence: 'low',
      message: 'Logged intake appears very low. Some meals may be missing.',
    };
  }

  if (ratio < 0.8) {
    return {
      status: 'possibly_incomplete',
      confidence: 'medium',
      message: 'Logged intake is lower than expected. Consider if all foods were logged.',
    };
  }

  return {
    status: 'complete',
    confidence: 'high',
    message: null,
  };
}

// =============================================================================
// Main Scoring Function
// =============================================================================

/**
 * Calculate complete nutrition score with all components
 */
export function calculateScoreV2(
  evaluations: NutrientEvaluation[],
  intakeData: IntakeData,
  focusId: NutritionFocusId = 'balanced'
): ScoreResultV2 {
  const focusConfig = getFocusConfig(focusId);
  const weights = focusConfig.weights;
  const totalWeight = weights.adequacy + weights.moderation + weights.balance;

  // Calculate each component
  const adequacyResult = calculateAdequacyScore(evaluations, focusConfig, 50);
  const moderationResult = calculateModerationScore(intakeData, focusConfig, 30);
  const balanceResult = calculateBalanceScore(evaluations, intakeData, focusConfig, 20);

  // Apply focus weights and normalize to 100
  const weightedAdequacy = (adequacyResult.points / 50) * weights.adequacy;
  const weightedModeration = (moderationResult.points / 30) * weights.moderation;
  const weightedBalance = (balanceResult.points / 20) * weights.balance;

  const rawScore = weightedAdequacy + weightedModeration + weightedBalance;
  const normalizedScore = (rawScore / totalWeight) * 100;
  const finalScore = Math.min(100, Math.round(normalizedScore * 10) / 10);

  // Logging assessment
  const loggingAssessment = assessLogging(intakeData.calories, intakeData.bmr);

  return {
    score: finalScore,
    label: getScoreLabelV2(finalScore),
    color: getScoreColorV2(finalScore),
    mar: adequacyResult.mar,
    breakdown: {
      adequacy: {
        points: adequacyResult.points,
        maxPoints: 50,
        mar: adequacyResult.mar,
        nutrientNARs: adequacyResult.nars,
      },
      moderation: moderationResult,
      balance: balanceResult,
      focus: {
        id: focusId,
        name: focusConfig.name,
        appliedWeights: weights,
      },
    },
    loggingAssessment,
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get score label
 */
export function getScoreLabelV2(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Great';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Improvement';
}

/**
 * Get score color
 */
export function getScoreColorV2(score: number): 'green' | 'yellow' | 'orange' | 'red' {
  if (score >= 75) return 'green';
  if (score >= 60) return 'yellow';
  if (score >= 40) return 'orange';
  return 'red';
}

/**
 * Calculate weekly score (average of daily scores)
 */
export function calculateWeeklyScoreV2(dailyResults: ScoreResultV2[]): {
  score: number;
  label: string;
  color: 'green' | 'yellow' | 'orange' | 'red';
  averageMAR: number;
  daysLogged: number;
  consistency: number;
} {
  if (dailyResults.length === 0) {
    return {
      score: 0,
      label: 'No Data',
      color: 'red',
      averageMAR: 0,
      daysLogged: 0,
      consistency: 0,
    };
  }

  const scores = dailyResults.map((r) => r.score);
  const mars = dailyResults.map((r) => r.mar);

  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const avgMAR = mars.reduce((a, b) => a + b, 0) / mars.length;

  // Calculate consistency (inverse of standard deviation)
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  const consistency = Math.max(0, 100 - stdDev * 2); // Higher = more consistent

  return {
    score: Math.round(avgScore * 10) / 10,
    label: getScoreLabelV2(avgScore),
    color: getScoreColorV2(avgScore),
    averageMAR: Math.round(avgMAR * 1000) / 1000,
    daysLogged: dailyResults.length,
    consistency: Math.round(consistency),
  };
}

/**
 * Calculate cumulative weekly MAR (for nutrients that can be "caught up")
 */
export function calculateCumulativeWeeklyMAR(
  weeklyEvaluations: NutrientEvaluation[][],
  focusId: NutritionFocusId = 'balanced'
): number {
  if (weeklyEvaluations.length === 0) return 0;

  const focusConfig = getFocusConfig(focusId);

  // Sum intakes across all days
  const cumulativeIntakes: Record<string, number> = {};
  const cumulativeTargets: Record<string, number> = {};

  for (const dayEvals of weeklyEvaluations) {
    for (const eval_ of dayEvals) {
      if (!BENEFICIAL_NUTRIENTS.includes(eval_.nutrientId)) continue;

      cumulativeIntakes[eval_.nutrientId] =
        (cumulativeIntakes[eval_.nutrientId] ?? 0) + eval_.intake;

      if (eval_.target !== null) {
        cumulativeTargets[eval_.nutrientId] =
          (cumulativeTargets[eval_.nutrientId] ?? 0) + eval_.target;
      }
    }
  }

  // Calculate cumulative MAR
  let weightedSum = 0;
  let totalWeight = 0;

  for (const nutrientId of Object.keys(cumulativeIntakes)) {
    const intake = cumulativeIntakes[nutrientId];
    const target = cumulativeTargets[nutrientId];

    if (!target || target === 0) continue;

    const nar = Math.min(1.0, intake / target);
    const emphasis = focusConfig.nutrientEmphasis[nutrientId] ?? 1.0;

    weightedSum += nar * emphasis;
    totalWeight += emphasis;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}
