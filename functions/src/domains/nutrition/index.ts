/**
 * Nutrition Domain Module
 *
 * Comprehensive nutrition evaluation system including:
 * - Reference data loading (DRI, FDA Daily Values, etc.)
 * - Personalized target calculation
 * - Intake evaluation and scoring
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

// Evaluation engine
export {
  evaluateNutrient,
  evaluateNutrients,
  evaluateDay,
  evaluateDayWithTargets,
  calculateScore,
  quickScore,
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
  evaluateNutritionDay,
  getNutritionTargets,
  getNutrientInfo,
  evaluateNutritionWeek,
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
