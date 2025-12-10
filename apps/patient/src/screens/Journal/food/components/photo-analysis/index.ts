/**
 * PhotoAnalysis Module - Main Barrel Export
 */

// Types
export * from './types';

// Data
export { MEAL_TYPES, MACRO_CONFIGS, getMealTypeColor, getMockAnalysisResult } from './data';

// Hooks
export { useCamera, usePhotoAnalysis } from './hooks';

// Components
export {
  CaptureStep,
  AnalyzingStep,
  ReviewStep,
  FoodItemCard,
  NutritionSummary,
  MealTypeSelector,
} from './components';
