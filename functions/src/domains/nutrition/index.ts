/**
 * Nutrition Domain Module
 *
 * Comprehensive nutrition evaluation system including:
 * - Reference data loading (DRI, FDA Daily Values, etc.)
 * - Personalized target calculation
 * - Intake evaluation and scoring
 * - Focus-specific scoring (10 nutrition focuses)
 * - Educational insights generation
 * - Cloud Functions API
 */

// Data layer
export { NutritionDataService, nutritionData, preloadAllData } from './data';

// Target computation
export {
  calculateAge,
  getLifeStageGroup,
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateEnergy,
  computeUserTargets,
} from './targets';

// Focus configuration (10 nutrition focuses)
export {
  type NutritionFocusId,
  type FocusWeights,
  type NutritionFocusConfig,
  FOCUS_CONFIGS,
  getFocusConfig,
  getAllFocusIds,
  getFocusDisplayInfo,
} from './focus';

// Evaluation engine (V1 - legacy)
export {
  evaluateNutrient,
  evaluateNutrients,
  evaluateDay,
  evaluateDayWithTargets,
  calculateScore,
  quickScore,
} from './evaluation';

// Evaluation engine (V2 - advanced with MAR, focus modes)
export {
  // Score calculator V2
  calculateScoreV2,
  getScoreLabelV2,
  getScoreColorV2,
  calculateWeeklyScoreV2,
  calculateCumulativeWeeklyMAR,
  // Day evaluator V2
  evaluateDayV2,
  evaluateDayWithTargetsV2,
  evaluateWeekV2,
  quickScoreV2,
  // Types
  type ScoreBreakdownV2,
  type ScoreResultV2,
  type IntakeData,
  type DayEvaluationV2,
  type WeekEvaluationV2,
  type Highlight,
  type NutrientGap as NutrientGapV2,
} from './evaluation';

// Insights
export {
  getNutrientEducation,
  getWhyItMatters,
  getFoodSuggestions,
  generateHighlights,
  generateGapInfo,
  generateDailySummary,
  generateWeeklySummary,
} from './insights';

// API (Cloud Functions)
export {
  // V1 endpoints
  evaluateNutritionDay,
  getNutritionTargets,
  getNutrientInfo,
  evaluateNutritionWeek,
  // V2 endpoints (advanced scoring)
  evaluateNutritionDayV2,
  evaluateNutritionWeekV2,
  getNutritionFocusOptions,
} from './api';

// Types re-exported for convenience
export type {
  NutritionUserProfile,
  UserNutritionTargets,
  DailyIntake,
  DayEvaluation,
  NutrientEvaluation,
  NutrientGap,
} from '../../types/nutrition';
