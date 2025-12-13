/**
 * Resolution Layer Exports
 *
 * Main entry point for nutrition resolution.
 */

// Main resolver
export {
  resolveNutrition,
  batchResolveNutrition,
  resolveByBarcode,
} from './resolver';

// Cache operations
export {
  getCachedNutrition,
  setCachedNutrition,
  batchGetCachedNutrition,
  batchSetCachedNutrition,
  invalidateCache,
  getCacheStats,
  cleanupExpiredCache,
  generateCacheKey,
  type CachedNutrition,
} from './nutritionCache';

// Individual API clients (for direct access if needed)
export {
  searchUSDA,
  getUSDAByFdcId,
  batchSearchUSDA,
  usdaApiKey,
  type USDASearchResult,
} from './usdaClient';

export {
  searchEdamam,
  searchEdamamRestaurant,
  getNutritionByFoodId,
  batchSearchEdamam,
  edamamAppId,
  edamamAppKey,
  type EdamamSearchResult,
} from './edamamClient';

export {
  searchOpenFoodFacts,
  getByBarcode,
  batchSearchOFF,
  type OFFSearchResult,
} from './openFoodFactsClient';
