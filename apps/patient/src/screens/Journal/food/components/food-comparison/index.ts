/**
 * Food Comparison Module - Main Barrel Export
 */

// Types
export * from './types';

// Utils
export * from './utils';

// Hooks
export { useFoodComparison, useMultiFoodComparison } from './hooks';

// Components
export {
  HealthGradeBadge,
  NutrientScoreBar,
  ConditionImpactCard,
  FoodAnalysisCard,
  FoodInputForm,
  FoodCaptureModal,
  FoodInputCard,
  ComparisonResultsView,
  MultiComparisonModal,
} from './components';
