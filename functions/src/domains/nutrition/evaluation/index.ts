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

// Score calculator
export {
  calculateScore,
  getScoreLabel,
  getScoreColor,
  calculateWeeklyScore,
} from './scoreCalculator';

// Day evaluator
export {
  evaluateDay,
  evaluateDayWithTargets,
  quickScore,
} from './dayEvaluator';
