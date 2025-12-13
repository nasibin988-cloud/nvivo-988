/**
 * Nutrition Evaluation Module
 *
 * Exports functions for evaluating nutrient intake against targets.
 */

// Classifier
export {
  classifyBeneficialIntake,
  classifyLimitIntake,
  classifyNutrientIntake,
  getStatusLabel,
  getStatusColor,
  isOverUpperLimit,
  getUpperLimitWarning,
} from './classifier';

// Nutrient evaluator
export {
  evaluateNutrient,
  evaluateNutrients,
  findNutrientGaps,
  findExceedingLimits,
  findHighlights,
} from './nutrientEvaluator';

// Score calculator (V1 - legacy)
export {
  calculateScore,
  getScoreLabel,
  getScoreColor,
  calculateWeeklyScore,
} from './scoreCalculator';

// Day evaluator (V1 - legacy)
export {
  evaluateDay,
  evaluateDayWithTargets,
  quickScore,
} from './dayEvaluator';

// =============================================================================
// V2 - Advanced scoring with MAR, focus modes, and quality metrics
// =============================================================================

// Score calculator V2
export {
  calculateScoreV2,
  getScoreLabelV2,
  getScoreColorV2,
  calculateWeeklyScoreV2,
  calculateCumulativeWeeklyMAR,
  type ScoreBreakdownV2,
  type ScoreResultV2,
  type IntakeData,
} from './scoreCalculatorV2';

// Day evaluator V2
export {
  evaluateDayV2,
  evaluateDayWithTargetsV2,
  evaluateWeekV2,
  quickScoreV2,
  type DayEvaluationV2,
  type WeekEvaluationV2,
  type Highlight,
  type NutrientGap,
} from './dayEvaluatorV2';
