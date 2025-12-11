/**
 * Nutrition Hooks - Barrel Export
 */

// Food logging hooks
export {
  useFoodLogs,
  useFoodLogsHistory,
  useWaterIntake,
  type FoodLog,
  type MealType,
  type DailyNutrition,
  type DailyFoodData,
} from './useFoodLogs';

// Legacy client-side targets (for backward compatibility)
export {
  useNutritionTargets,
  useCalorieTarget,
  calculateMacroPercentages,
  DEFAULT_TARGETS,
  type NutritionTargets,
} from './useNutritionTargets';

export { useWaterStreak } from './useWaterStreak';

// NEW: Server-side DRI-based nutrition evaluation system
export {
  useNutritionDayEvaluation,
  useEvaluateNutrition,
  nutritionEvaluationKeys,
  getScoreColorClass,
  getScoreBgClass,
  type DayEvaluation,
  type NutrientEvaluation,
  type ScoreBreakdown,
  type NutritionUserProfile,
  type DailyIntake,
} from './useNutritionEvaluation';

export {
  useNutritionTargetsV2,
  useCalorieTargetV2,
  useNutrientTarget,
  useMacroTargets,
  nutritionTargetsKeys,
  calculateTargetPercent,
  calculateLimitPercent,
  type NutrientTarget,
  type UserNutritionTargets,
} from './useNutritionTargetsV2';

export {
  useNutrientInfo,
  usePrefetchNutrientInfo,
  nutrientInfoKeys,
  getNutrientShortDescription,
  getNutrientCategoryColor,
  formatFoodSources,
  type NutrientEducation,
  type NutrientInfoResponse,
} from './useNutrientInfo';

export {
  useWeeklyNutrition,
  useCurrentWeekNutrition,
  weeklyNutritionKeys,
  getTrendIcon,
  getTrendColorClass,
  getTrendLabel,
  formatScoreWithEmoji,
  type WeeklyNutritionData,
} from './useWeeklyNutrition';
