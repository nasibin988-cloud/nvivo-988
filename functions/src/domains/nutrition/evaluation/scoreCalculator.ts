/**
 * Score Calculator
 *
 * Calculates an overall nutrition score (0-100) for a day's intake.
 *
 * Score breakdown:
 * - 40 points: Beneficial nutrients (meeting targets)
 * - 40 points: Limit nutrients (staying within limits)
 * - 20 points: Balance (variety and macro balance)
 */

import type { NutrientEvaluation, ScoreBreakdown } from '../../../types/nutrition';

/**
 * Key beneficial nutrients to score
 */
const KEY_BENEFICIAL_NUTRIENTS = [
  'protein',
  'fiber',
  'vitamin_a',
  'vitamin_c',
  'vitamin_d',
  'calcium',
  'iron',
  'potassium',
  'magnesium',
  'zinc',
];

/**
 * Key limit nutrients to score
 */
const KEY_LIMIT_NUTRIENTS = [
  'sodium',
  'saturated_fat',
  'added_sugars',
  'trans_fat',
];

/**
 * Calculate beneficial nutrients score (0-40 points)
 *
 * Each key beneficial nutrient contributes proportionally.
 * Score is based on % of target met, capped at 100%.
 */
function calculateBeneficialScore(evaluations: NutrientEvaluation[]): number {
  const beneficialEvals = evaluations.filter(
    (e) => KEY_BENEFICIAL_NUTRIENTS.includes(e.nutrientId) && e.percentOfTarget !== null
  );

  if (beneficialEvals.length === 0) return 0;

  // Calculate average percentage of targets met (capped at 100%)
  const totalPercent = beneficialEvals.reduce((sum, e) => {
    const percent = Math.min(e.percentOfTarget ?? 0, 100);
    return sum + percent;
  }, 0);

  const averagePercent = totalPercent / KEY_BENEFICIAL_NUTRIENTS.length;

  // Convert to 0-40 scale
  return Math.round((averagePercent / 100) * 40);
}

/**
 * Calculate limit nutrients score (0-40 points)
 *
 * Score decreases as intake approaches/exceeds limits.
 * Full points for <50% of limit, partial for 50-100%, low for >100%
 */
function calculateLimitScore(evaluations: NutrientEvaluation[]): number {
  const limitEvals = evaluations.filter(
    (e) =>
      KEY_LIMIT_NUTRIENTS.includes(e.nutrientId) &&
      (e.percentOfLimit !== null || e.percentOfTarget !== null)
  );

  if (limitEvals.length === 0) return 40; // No limit data = full points

  let totalScore = 0;
  const pointsPerNutrient = 40 / KEY_LIMIT_NUTRIENTS.length;

  for (const nutrientId of KEY_LIMIT_NUTRIENTS) {
    const evalResult = limitEvals.find((e) => e.nutrientId === nutrientId);

    if (!evalResult) {
      // No data for this nutrient - give partial credit
      totalScore += pointsPerNutrient * 0.5;
      continue;
    }

    const percentOfLimit = evalResult.percentOfLimit ?? evalResult.percentOfTarget ?? 0;

    if (percentOfLimit < 50) {
      // Well under limit - full points
      totalScore += pointsPerNutrient;
    } else if (percentOfLimit < 80) {
      // Moderate - 75% of points
      totalScore += pointsPerNutrient * 0.75;
    } else if (percentOfLimit < 100) {
      // Approaching limit - 50% of points
      totalScore += pointsPerNutrient * 0.5;
    } else if (percentOfLimit < 150) {
      // Over limit but not extreme - 25% of points
      totalScore += pointsPerNutrient * 0.25;
    }
    // >150% of limit = 0 points
  }

  return Math.round(totalScore);
}

/**
 * Calculate balance score (0-20 points)
 *
 * Based on:
 * - Macro balance (carbs, protein, fat in reasonable ranges)
 * - Variety (number of nutrients with some intake)
 */
function calculateBalanceScore(evaluations: NutrientEvaluation[]): number {
  let score = 0;

  // Macro balance (10 points)
  const protein = evaluations.find((e) => e.nutrientId === 'protein');
  const carbs = evaluations.find((e) => e.nutrientId === 'carbohydrate');
  const fat = evaluations.find((e) => e.nutrientId === 'total_fat');

  if (protein && carbs && fat) {
    const proteinPct = protein.percentOfTarget ?? 0;
    const carbsPct = carbs.percentOfTarget ?? 0;
    const fatPct = fat.percentOfTarget ?? 0;

    // Check if all macros are in reasonable range (50-150% of target)
    const macrosBalanced =
      proteinPct >= 50 &&
      proteinPct <= 150 &&
      carbsPct >= 50 &&
      carbsPct <= 150 &&
      fatPct >= 50 &&
      fatPct <= 150;

    if (macrosBalanced) {
      score += 10;
    } else {
      // Partial credit based on how close
      const avgMacroPct = (proteinPct + carbsPct + fatPct) / 3;
      if (avgMacroPct >= 67) score += 5;
      else if (avgMacroPct >= 33) score += 2;
    }
  }

  // Variety (10 points)
  // Count nutrients with at least 25% of target
  const nutrientsWithIntake = evaluations.filter(
    (e) => e.classification === 'beneficial' && (e.percentOfTarget ?? 0) >= 25
  ).length;

  if (nutrientsWithIntake >= 15) {
    score += 10;
  } else if (nutrientsWithIntake >= 10) {
    score += 7;
  } else if (nutrientsWithIntake >= 5) {
    score += 4;
  } else if (nutrientsWithIntake >= 2) {
    score += 2;
  }

  return score;
}

/**
 * Calculate complete score with breakdown
 */
export function calculateScore(evaluations: NutrientEvaluation[]): {
  score: number;
  breakdown: ScoreBreakdown;
} {
  const beneficial = calculateBeneficialScore(evaluations);
  const limit = calculateLimitScore(evaluations);
  const balance = calculateBalanceScore(evaluations);

  const score = Math.min(100, beneficial + limit + balance);

  return {
    score,
    breakdown: {
      beneficial,
      limit,
      balance,
    },
  };
}

/**
 * Get score label based on score value
 */
export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Great';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Improvement';
}

/**
 * Get score color based on score value
 */
export function getScoreColor(score: number): 'green' | 'yellow' | 'orange' | 'red' {
  if (score >= 75) return 'green';
  if (score >= 60) return 'yellow';
  if (score >= 40) return 'orange';
  return 'red';
}

/**
 * Calculate weekly average score
 */
export function calculateWeeklyScore(dailyScores: number[]): number {
  if (dailyScores.length === 0) return 0;
  const sum = dailyScores.reduce((a, b) => a + b, 0);
  return Math.round(sum / dailyScores.length);
}
