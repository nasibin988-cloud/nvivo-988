/**
 * Patient app hooks - organized by domain
 *
 * Note: Types like FoodLog, MealType should be imported from @nvivo/shared
 * This file only exports hooks, not types that might conflict
 */

// Dashboard hooks (excluding types that are in @nvivo/shared)
export {
  useLatestWellnessLog,
  useTodayWellnessLog,
  useTodayFoodLogStatus,
  useTodayMedicationStatus,
  useCardiacHealth,
  useCognitiveHealth,
  useStreak,
  useHealthMetrics,
  useMicroWins,
  useCompleteMicroWin,
  useNextAppointment,
  useHealthTrends,
  getSparklineData,
  calculateTrendChange,
} from './dashboard';

// Nutrition hooks (excluding types that are in @nvivo/shared)
export {
  useFoodLogs,
  useWaterIntake,
  useFoodLogsHistory,
  useNutritionTargets,
} from './nutrition';

// Patient profile hooks
export * from './patient';

// AI Food Analysis hook (shared across food logging and comparison)
export { useFoodAI } from './useFoodAI';
export type {
  AnalyzedFoodItem,
  FoodAnalysisResult,
  UseFoodAIReturn,
  UseFoodAIOptions,
  NutritionDetailLevel,
  EssentialNutrition,
  ExtendedNutrition,
  CompleteNutrition,
} from './useFoodAI';
