/**
 * Nutrition Data Module
 *
 * Exports the NutritionDataService for loading and querying
 * nutrition reference data from JSON files.
 */

export {
  NutritionDataService,
  nutritionData,
  preloadAllData,
  type NutrientDef,
  type DriLookupResult,
  type FdaDvLookupResult,
} from './NutritionDataService';
