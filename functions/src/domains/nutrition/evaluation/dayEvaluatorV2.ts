/**
 * Day Evaluator V2
 *
 * Evaluates an entire day's nutrition intake using the advanced scoring system.
 * Produces complete evaluation with:
 * - MAR-based score
 * - Focus-specific adjustments
 * - Detailed breakdown (adequacy, moderation, balance)
 * - Fat quality metrics
 * - Glycemic impact (when enabled)
 * - Nutrient highlights and gaps
 * - Human-readable summary
 */

import type {
  NutritionUserProfile,
  DailyIntake,
  NutrientEvaluation,
} from '../../../types/nutrition';
import type { NutritionFocusId } from '../focus';
import { getFocusConfig } from '../focus';
import { computeUserTargets } from '../targets';
import { evaluateNutrients, findNutrientGaps, findHighlights } from './nutrientEvaluator';
import {
  calculateScoreV2,
  calculateWeeklyScoreV2,
  calculateCumulativeWeeklyMAR,
  type ScoreResultV2,
  type ScoreBreakdownV2,
  type IntakeData,
} from './scoreCalculatorV2';

// =============================================================================
// Types
// =============================================================================

export interface DayEvaluationV2 {
  date: string;
  score: number;
  label: string;
  color: 'green' | 'yellow' | 'orange' | 'red';

  /** Mean Adequacy Ratio */
  mar: number;

  /** Detailed score breakdown */
  breakdown: ScoreBreakdownV2;

  /** Individual nutrient evaluations */
  nutrients: NutrientEvaluation[];

  /** Fat quality metrics */
  fatQuality: {
    unsaturatedToSaturatedRatio: number;
    omega3To6Ratio: number | null;
    score: number;
  };

  /** Glycemic impact (if focus enables it) */
  glycemicImpact?: {
    sugarFiberRatio: number;
    penalty: number;
  };

  /** Nutrients doing well */
  highlights: Highlight[];

  /** Nutrients needing improvement */
  gaps: NutrientGap[];

  /** Logging completeness assessment */
  loggingAssessment: {
    status: 'complete' | 'possibly_incomplete' | 'likely_incomplete';
    confidence: 'high' | 'medium' | 'low';
    message: string | null;
  };

  /** Human-readable summary */
  summary: string;

  /** Focus configuration used */
  focus: {
    id: NutritionFocusId;
    name: string;
  };

  /** Calorie summary */
  calories: {
    consumed: number;
    target: number;
    percentOfTarget: number;
  };
}

export interface Highlight {
  nutrientId: string;
  displayName: string;
  percentOfTarget: number;
  message: string;
  icon: 'star' | 'check' | 'trophy' | 'heart';
}

export interface NutrientGap {
  nutrientId: string;
  displayName: string;
  intake: number;
  target: number;
  percentOfTarget: number;
  unit: string;
  severity: 'low' | 'moderate' | 'severe';
  suggestion: string;
}

export interface WeekEvaluationV2 {
  weekStartDate: string;
  weekEndDate: string;
  dailyScores: number[];
  averageScore: number;
  scoreLabel: string;
  scoreColor: 'green' | 'yellow' | 'orange' | 'red';
  averageMAR: number;
  cumulativeMAR: number;
  daysLogged: number;
  consistency: number;
  trend: 'improving' | 'stable' | 'declining';
  summary: string;
  focus: {
    id: NutritionFocusId;
    name: string;
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generate highlights from evaluation results
 */
function generateHighlights(evaluations: NutrientEvaluation[]): Highlight[] {
  const highlightEvals = findHighlights(evaluations);

  return highlightEvals.slice(0, 5).map((e) => {
    const pct = e.percentOfTarget ?? 0;

    let message: string;
    let icon: Highlight['icon'];

    if (e.classification === 'beneficial') {
      if (pct >= 120) {
        message = `Excellent ${e.displayName} - exceeded target!`;
        icon = 'trophy';
      } else {
        message = `Great ${e.displayName} intake (${pct}% of target)`;
        icon = 'star';
      }
    } else {
      message = `${e.displayName} well within limits`;
      icon = 'heart';
    }

    return {
      nutrientId: e.nutrientId,
      displayName: e.displayName,
      percentOfTarget: pct,
      message,
      icon,
    };
  });
}

/**
 * Generate gaps from evaluation results
 */
function generateGaps(evaluations: NutrientEvaluation[]): NutrientGap[] {
  const gapEvals = findNutrientGaps(evaluations, 67);

  return gapEvals
    .sort((a, b) => (a.percentOfTarget ?? 0) - (b.percentOfTarget ?? 0))
    .slice(0, 5)
    .map((e) => {
      const pct = e.percentOfTarget ?? 0;
      let severity: NutrientGap['severity'];
      let suggestion: string;

      if (pct < 33) {
        severity = 'severe';
        suggestion = `${e.displayName} is very low. Consider adding rich sources to your diet.`;
      } else if (pct < 50) {
        severity = 'moderate';
        suggestion = `${e.displayName} needs attention. Try including more foods with this nutrient.`;
      } else {
        severity = 'low';
        suggestion = `${e.displayName} is slightly below target (${pct}%). A small adjustment could help.`;
      }

      return {
        nutrientId: e.nutrientId,
        displayName: e.displayName,
        intake: e.intake,
        target: e.target ?? 0,
        percentOfTarget: pct,
        unit: e.unit,
        severity,
        suggestion,
      };
    });
}

/**
 * Generate summary message based on score and evaluation
 */
function generateSummary(
  score: number,
  mar: number,
  highlights: Highlight[],
  gaps: NutrientGap[],
  focusName: string,
  loggingStatus: string
): string {
  if (loggingStatus === 'likely_incomplete') {
    return 'Your food log appears incomplete. Add any missing meals for an accurate score.';
  }

  if (score >= 90) {
    return `Outstanding ${focusName} day! You met or exceeded most nutrient targets while keeping limits in check. MAR: ${Math.round(mar * 100)}%.`;
  }

  if (score >= 75) {
    const highlightText = highlights[0]?.displayName ?? 'several nutrients';
    return `Great job on your ${focusName} goals! Excellent ${highlightText} intake. MAR: ${Math.round(mar * 100)}%.`;
  }

  if (score >= 60) {
    const gapText = gaps[0]?.displayName ?? 'some nutrients';
    return `Good progress toward ${focusName} goals. Consider boosting ${gapText} intake for better results.`;
  }

  if (score >= 40) {
    const topGap = gaps[0]?.displayName ?? 'key nutrients';
    return `Fair day with room for improvement. Focus on increasing ${topGap} and maintaining variety.`;
  }

  return 'This day had several nutritional gaps. Try including more variety and nutrient-rich foods.';
}

/**
 * Calculate fat quality metrics
 */
function calculateFatQualityMetrics(nutrients: Record<string, number>): DayEvaluationV2['fatQuality'] {
  const pufa = nutrients.polyunsaturatedFat ?? 0;
  const mufa = nutrients.monounsaturatedFat ?? 0;
  const sfa = nutrients.saturatedFat ?? 0;
  const omega3 = nutrients.omega3 ?? 0;
  const omega6 = nutrients.omega6 ?? 0;

  const unsatToSatRatio = sfa > 0 ? (pufa + mufa) / sfa : 3.0;
  const omega3To6Ratio = omega6 > 0 ? omega3 / omega6 : null;

  // Score based on ratio
  let score = 0;
  if (unsatToSatRatio >= 2.0) score += 4;
  else if (unsatToSatRatio >= 1.5) score += 3;
  else if (unsatToSatRatio >= 1.0) score += 2;
  else if (unsatToSatRatio >= 0.5) score += 1;

  if (omega3To6Ratio !== null) {
    if (omega3To6Ratio >= 0.25) score += 2;
    else if (omega3To6Ratio >= 0.15) score += 1.5;
    else if (omega3To6Ratio >= 0.10) score += 1;
    else score += 0.5;
  } else {
    score += 1; // Default partial credit
  }

  return {
    unsaturatedToSaturatedRatio: Math.round(unsatToSatRatio * 100) / 100,
    omega3To6Ratio: omega3To6Ratio !== null ? Math.round(omega3To6Ratio * 1000) / 1000 : null,
    score,
  };
}

/**
 * Calculate glycemic impact metrics
 */
function calculateGlycemicMetrics(
  nutrients: Record<string, number>
): DayEvaluationV2['glycemicImpact'] | undefined {
  const addedSugar = nutrients.addedSugar ?? nutrients.sugar ?? 0;
  const fiber = nutrients.fiber ?? 0;

  if (fiber === 0 && addedSugar === 0) return undefined;

  const ratio = fiber > 0 ? addedSugar / fiber : addedSugar > 10 ? 10 : 0;

  let penalty = 0;
  if (ratio > 6) penalty = 4;
  else if (ratio > 4) penalty = 3;
  else if (ratio > 2) penalty = 2;
  else if (ratio > 1) penalty = 1;

  return {
    sugarFiberRatio: Math.round(ratio * 100) / 100,
    penalty,
  };
}

// =============================================================================
// Main Evaluation Functions
// =============================================================================

/**
 * Evaluate an entire day's nutrition with focus-specific scoring
 */
export function evaluateDayV2(
  profile: NutritionUserProfile,
  dailyIntake: DailyIntake,
  focusId: NutritionFocusId = 'balanced'
): DayEvaluationV2 {
  const focusConfig = getFocusConfig(focusId);

  // Compute personalized targets
  const targets = computeUserTargets(profile);

  // Evaluate all nutrients
  const nutrientEvaluations = evaluateNutrients(dailyIntake.totals, targets.nutrients);

  // Prepare intake data for scoring
  const intakeData: IntakeData = {
    nutrients: dailyIntake.totals,
    calories: dailyIntake.totals.calories ?? 0,
    calorieTarget: targets.calories,
    bmr: targets.profile ? undefined : undefined, // BMR would be in energy calculation
  };

  // Calculate score
  const scoreResult = calculateScoreV2(nutrientEvaluations, intakeData, focusId);

  // Generate highlights and gaps
  const highlights = generateHighlights(nutrientEvaluations);
  const gaps = generateGaps(nutrientEvaluations);

  // Calculate fat quality
  const fatQuality = calculateFatQualityMetrics(dailyIntake.totals);

  // Calculate glycemic impact if enabled
  const glycemicImpact = focusConfig.glycemicImpactEnabled
    ? calculateGlycemicMetrics(dailyIntake.totals)
    : undefined;

  // Generate summary
  const summary = generateSummary(
    scoreResult.score,
    scoreResult.mar,
    highlights,
    gaps,
    focusConfig.name,
    scoreResult.loggingAssessment.status
  );

  // Calorie summary
  const caloriesConsumed = dailyIntake.totals.calories ?? 0;
  const calorieTarget = targets.calories;

  return {
    date: dailyIntake.date,
    score: scoreResult.score,
    label: scoreResult.label,
    color: scoreResult.color,
    mar: scoreResult.mar,
    breakdown: scoreResult.breakdown,
    nutrients: nutrientEvaluations,
    fatQuality,
    glycemicImpact,
    highlights,
    gaps,
    loggingAssessment: scoreResult.loggingAssessment,
    summary,
    focus: {
      id: focusId,
      name: focusConfig.name,
    },
    calories: {
      consumed: caloriesConsumed,
      target: calorieTarget,
      percentOfTarget: calorieTarget > 0 ? Math.round((caloriesConsumed / calorieTarget) * 100) : 0,
    },
  };
}

/**
 * Evaluate a day using pre-computed targets (more efficient for batch operations)
 */
export function evaluateDayWithTargetsV2(
  dailyIntake: DailyIntake,
  targets: ReturnType<typeof computeUserTargets>,
  focusId: NutritionFocusId = 'balanced'
): DayEvaluationV2 {
  const focusConfig = getFocusConfig(focusId);

  // Evaluate all nutrients
  const nutrientEvaluations = evaluateNutrients(dailyIntake.totals, targets.nutrients);

  // Prepare intake data
  const intakeData: IntakeData = {
    nutrients: dailyIntake.totals,
    calories: dailyIntake.totals.calories ?? 0,
    calorieTarget: targets.calories,
  };

  // Calculate score
  const scoreResult = calculateScoreV2(nutrientEvaluations, intakeData, focusId);

  // Generate highlights and gaps
  const highlights = generateHighlights(nutrientEvaluations);
  const gaps = generateGaps(nutrientEvaluations);

  // Calculate fat quality and glycemic impact
  const fatQuality = calculateFatQualityMetrics(dailyIntake.totals);
  const glycemicImpact = focusConfig.glycemicImpactEnabled
    ? calculateGlycemicMetrics(dailyIntake.totals)
    : undefined;

  // Generate summary
  const summary = generateSummary(
    scoreResult.score,
    scoreResult.mar,
    highlights,
    gaps,
    focusConfig.name,
    scoreResult.loggingAssessment.status
  );

  const caloriesConsumed = dailyIntake.totals.calories ?? 0;

  return {
    date: dailyIntake.date,
    score: scoreResult.score,
    label: scoreResult.label,
    color: scoreResult.color,
    mar: scoreResult.mar,
    breakdown: scoreResult.breakdown,
    nutrients: nutrientEvaluations,
    fatQuality,
    glycemicImpact,
    highlights,
    gaps,
    loggingAssessment: scoreResult.loggingAssessment,
    summary,
    focus: {
      id: focusId,
      name: focusConfig.name,
    },
    calories: {
      consumed: caloriesConsumed,
      target: targets.calories,
      percentOfTarget: targets.calories > 0 ? Math.round((caloriesConsumed / targets.calories) * 100) : 0,
    },
  };
}

/**
 * Evaluate a week's nutrition
 */
export function evaluateWeekV2(
  profile: NutritionUserProfile,
  dailyIntakes: DailyIntake[],
  focusId: NutritionFocusId = 'balanced'
): WeekEvaluationV2 {
  const focusConfig = getFocusConfig(focusId);
  const targets = computeUserTargets(profile);

  // Evaluate each day
  const dayEvaluations = dailyIntakes.map((intake) =>
    evaluateDayWithTargetsV2(intake, targets, focusId)
  );

  // Calculate weekly scores
  const scoreResults: ScoreResultV2[] = dayEvaluations.map((d) => ({
    score: d.score,
    label: d.label,
    color: d.color,
    mar: d.mar,
    breakdown: d.breakdown,
    loggingAssessment: d.loggingAssessment,
  }));

  const weeklyScoreResult = calculateWeeklyScoreV2(scoreResults);

  // Calculate cumulative MAR
  const weeklyEvaluations = dayEvaluations.map((d) => d.nutrients);
  const cumulativeMAR = calculateCumulativeWeeklyMAR(weeklyEvaluations, focusId);

  // Determine trend
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (dayEvaluations.length >= 3) {
    const firstHalf = dayEvaluations.slice(0, Math.floor(dayEvaluations.length / 2));
    const secondHalf = dayEvaluations.slice(Math.floor(dayEvaluations.length / 2));

    const firstAvg = firstHalf.reduce((sum, d) => sum + d.score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.score, 0) / secondHalf.length;

    if (secondAvg - firstAvg > 5) trend = 'improving';
    else if (firstAvg - secondAvg > 5) trend = 'declining';
  }

  // Sort dates
  const dates = dailyIntakes.map((i) => i.date).sort();
  const weekStartDate = dates[0] ?? '';
  const weekEndDate = dates[dates.length - 1] ?? '';

  // Generate summary
  let summary: string;
  if (weeklyScoreResult.score >= 80) {
    summary = `Excellent week for ${focusConfig.name}! You maintained strong nutrition habits with ${weeklyScoreResult.daysLogged} days logged.`;
  } else if (weeklyScoreResult.score >= 65) {
    summary = `Good week overall. Your average MAR of ${Math.round(weeklyScoreResult.averageMAR * 100)}% shows solid nutrient coverage.`;
  } else if (weeklyScoreResult.score >= 50) {
    summary = `Fair week with room to grow. Focus on consistency and filling nutrient gaps.`;
  } else {
    summary = `This week had nutritional challenges. Try planning meals ahead for better balance.`;
  }

  if (trend === 'improving') {
    summary += ' Your scores are trending upward!';
  } else if (trend === 'declining') {
    summary += ' Consider what changed - your scores dipped toward the end.';
  }

  return {
    weekStartDate,
    weekEndDate,
    dailyScores: dayEvaluations.map((d) => d.score),
    averageScore: weeklyScoreResult.score,
    scoreLabel: weeklyScoreResult.label,
    scoreColor: weeklyScoreResult.color,
    averageMAR: weeklyScoreResult.averageMAR,
    cumulativeMAR: Math.round(cumulativeMAR * 1000) / 1000,
    daysLogged: weeklyScoreResult.daysLogged,
    consistency: weeklyScoreResult.consistency,
    trend,
    summary,
    focus: {
      id: focusId,
      name: focusConfig.name,
    },
  };
}

/**
 * Quick score calculation without full evaluation details
 */
export function quickScoreV2(
  profile: NutritionUserProfile,
  dailyIntake: DailyIntake,
  focusId: NutritionFocusId = 'balanced'
): { score: number; label: string; color: 'green' | 'yellow' | 'orange' | 'red'; mar: number } {
  const targets = computeUserTargets(profile);
  const nutrientEvaluations = evaluateNutrients(dailyIntake.totals, targets.nutrients);

  const intakeData: IntakeData = {
    nutrients: dailyIntake.totals,
    calories: dailyIntake.totals.calories ?? 0,
    calorieTarget: targets.calories,
  };

  const scoreResult = calculateScoreV2(nutrientEvaluations, intakeData, focusId);

  return {
    score: scoreResult.score,
    label: scoreResult.label,
    color: scoreResult.color,
    mar: scoreResult.mar,
  };
}
