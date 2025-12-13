/**
 * Grading Layer Exports
 *
 * All grading is deterministic - no AI calls for grades.
 * AI is used for optional comparison insights and food insights.
 */

// Main grading
export {
  gradeNutrition,
  gradeNutritionWithGI,
  gradeFocus,
  getOverallGrade,
  batchGradeNutrition,
} from './grader';

// Comparison
export {
  compareFoods,
  compareFoodsWithInsights,
  getQuickWinner,
  compareTwo,
} from './comparator';

// AI Insights for individual foods
export {
  generateFoodInsight,
  batchGenerateFoodInsights,
  type FoodInsight,
  type InsightInput,
} from './insightGenerator';

// Re-export from original for compatibility
export {
  calculateDeterministicGrades,
  gradeSingleFocus,
  getNutriScore,
  type NutritionInput,
  type DeterministicGradingResult,
} from '../../deterministicGrading';
