/**
 * Nutrition Hooks - Barrel Export
 */

export {
  useFoodLogs,
  useFoodLogsHistory,
  useWaterIntake,
  type FoodLog,
  type MealType,
  type DailyNutrition,
  type DailyFoodData,
} from './useFoodLogs';

export {
  useNutritionTargets,
  useCalorieTarget,
  calculateMacroPercentages,
  DEFAULT_TARGETS,
  type NutritionTargets,
} from './useNutritionTargets';
