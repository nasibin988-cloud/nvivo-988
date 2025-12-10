/**
 * DRI (Dietary Reference Intakes) Domain Module
 *
 * Barrel export for all DRI-related functionality.
 *
 * Usage:
 * ```typescript
 * import {
 *   NUTRIENT_NATURE,
 *   getNutrientNature,
 *   DRI_TABLE,
 *   getDriDefinition,
 *   CLASSIFICATION_THRESHOLDS,
 * } from './domains/nutrition/dri';
 * ```
 */

// Types (local definitions for functions package)
export type {
  Sex,
  ActivityLevel,
  LifeStage,
  GoalType,
  HealthFlags,
  DriUserProfile,
  AgeRange,
  DriReferenceType,
  DriValueByAge,
  DriRdaAiBySex,
  DriUpperLimit,
  DriAmdr,
  SpecialAdjustment,
  NutrientDriDefinition,
  NutrientNature,
  NutrientClassification,
  DailyNutrientTarget,
  NutrientEvaluation,
  FoodEvaluationResult,
} from './types';

// Nutrient nature registry
export {
  NUTRIENT_NATURE,
  getNutrientNature,
  isBeneficialNutrient,
  isRiskNutrient,
  getNutrientsByNature,
} from './nutrientNature';

// DRI data table
export {
  DRI_TABLE,
  getDriDefinition,
  getDefinedNutrients,
} from './driTable';

// Classification thresholds
export {
  BENEFICIAL_THRESHOLDS,
  RISK_THRESHOLDS,
  CLASSIFICATION_THRESHOLDS,
  getThreshold,
  CLASSIFICATION_SEVERITY,
  getClassificationSeverity,
  sortByPriority,
} from './classificationThresholds';
