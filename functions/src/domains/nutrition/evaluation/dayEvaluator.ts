/**
 * Day Evaluator
 *
 * Evaluates an entire day's nutrition intake, producing a complete
 * evaluation with score, nutrient breakdown, highlights, and gaps.
 */

import type {
  NutritionUserProfile,
  DailyIntake,
  DayEvaluation,
  NutrientEvaluation,
} from '../../../types/nutrition';
import { computeUserTargets } from '../targets';
import { evaluateNutrients, findNutrientGaps, findHighlights } from './nutrientEvaluator';
import { calculateScore, getScoreLabel, getScoreColor } from './scoreCalculator';

/**
 * Generate highlight messages from evaluation results
 */
function generateHighlightMessages(highlights: NutrientEvaluation[]): string[] {
  return highlights.slice(0, 5).map((h) => {
    if (h.classification === 'beneficial') {
      return `Great ${h.displayName} intake (${h.percentOfTarget}% of target)`;
    }
    return `${h.displayName} well within recommended limits`;
  });
}

/**
 * Generate gap messages from evaluation results
 */
function generateGapMessages(gaps: NutrientEvaluation[]): string[] {
  return gaps.slice(0, 5).map((g) => {
    const percent = g.percentOfTarget ?? 0;
    if (percent < 33) {
      return `${g.displayName} is low - consider foods rich in this nutrient`;
    }
    return `${g.displayName} is below target (${percent}%)`;
  });
}

/**
 * Generate daily summary message
 */
function generateSummary(
  score: number,
  highlights: string[],
  gaps: string[]
): string {
  if (score >= 90) {
    return 'Outstanding nutrition day! You met or exceeded targets for most nutrients while keeping limit nutrients in check.';
  }
  if (score >= 75) {
    return 'Great job today! Your nutrition is well-balanced with good variety.';
  }
  if (score >= 60) {
    return 'Good progress! A few areas could use attention, but overall a solid day.';
  }
  if (score >= 40) {
    if (gaps.length > 0) {
      return `Fair day with room for improvement. Consider adding foods rich in ${gaps[0]?.split(' ')[0] ?? 'key nutrients'}.`;
    }
    return 'Fair day with room for improvement. Try to include more variety in your meals.';
  }
  return 'This day had some nutritional gaps. Try to include a wider variety of nutrient-rich foods.';
}

/**
 * Evaluate an entire day's nutrition
 */
export function evaluateDay(
  profile: NutritionUserProfile,
  dailyIntake: DailyIntake
): DayEvaluation {
  // Compute personalized targets for this user
  const targets = computeUserTargets(profile);

  // Evaluate all nutrients
  const nutrientEvaluations = evaluateNutrients(dailyIntake.totals, targets.nutrients);

  // Calculate overall score
  const { score, breakdown } = calculateScore(nutrientEvaluations);
  const scoreLabel = getScoreLabel(score);
  const scoreColor = getScoreColor(score);

  // Find highlights and gaps
  const highlightEvals = findHighlights(nutrientEvaluations);
  const gapEvals = findNutrientGaps(nutrientEvaluations);

  const highlights = generateHighlightMessages(highlightEvals);
  const gaps = generateGapMessages(gapEvals);
  const summary = generateSummary(score, highlights, gaps);

  return {
    date: dailyIntake.date,
    score,
    scoreLabel,
    scoreColor,
    breakdown,
    nutrients: nutrientEvaluations,
    highlights,
    gaps,
    summary,
  };
}

/**
 * Evaluate a day using pre-computed targets (more efficient for batch operations)
 */
export function evaluateDayWithTargets(
  dailyIntake: DailyIntake,
  targets: ReturnType<typeof computeUserTargets>
): DayEvaluation {
  // Evaluate all nutrients
  const nutrientEvaluations = evaluateNutrients(dailyIntake.totals, targets.nutrients);

  // Calculate overall score
  const { score, breakdown } = calculateScore(nutrientEvaluations);
  const scoreLabel = getScoreLabel(score);
  const scoreColor = getScoreColor(score);

  // Find highlights and gaps
  const highlightEvals = findHighlights(nutrientEvaluations);
  const gapEvals = findNutrientGaps(nutrientEvaluations);

  const highlights = generateHighlightMessages(highlightEvals);
  const gaps = generateGapMessages(gapEvals);
  const summary = generateSummary(score, highlights, gaps);

  return {
    date: dailyIntake.date,
    score,
    scoreLabel,
    scoreColor,
    breakdown,
    nutrients: nutrientEvaluations,
    highlights,
    gaps,
    summary,
  };
}

/**
 * Quick score calculation without full evaluation details
 * Useful for history/trend displays
 */
export function quickScore(
  profile: NutritionUserProfile,
  dailyIntake: DailyIntake
): { score: number; scoreLabel: string; scoreColor: 'green' | 'yellow' | 'orange' | 'red' } {
  const targets = computeUserTargets(profile);
  const nutrientEvaluations = evaluateNutrients(dailyIntake.totals, targets.nutrients);
  const { score } = calculateScore(nutrientEvaluations);

  return {
    score,
    scoreLabel: getScoreLabel(score),
    scoreColor: getScoreColor(score),
  };
}
