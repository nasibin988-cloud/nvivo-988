/**
 * PhotoAnalysis Module - Main Barrel Export
 */

// Types
export * from './types';

// Data (no mock data - AI analysis only)
export { MEAL_TYPES, MACRO_CONFIGS, getMealTypeColor, NUTRIENT_DISPLAY_CONFIG } from './data';

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
  NutritionTierSelector,
} from './components';
