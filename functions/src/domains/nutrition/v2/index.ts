/**
 * Nutrition V2 Module
 *
 * New architecture: AI Identifies → Databases Resolve → Formulas Grade
 *
 * Key principles:
 * 1. AI only identifies foods (1 call per meal)
 * 2. Nutrition comes from authoritative databases (USDA, Edamam, OpenFoodFacts)
 * 3. Grading is 100% deterministic (Nutri-Score + threshold-based)
 * 4. GI from pre-loaded database (Sydney University)
 */

// ============================================================================
// TYPES
// ============================================================================
export * from './types';

// ============================================================================
// IDENTIFICATION (AI Layer)
// ============================================================================
export {
  identifyFoodsFromPhoto,
  identifyFoodsFromPhotoUrl,
  parseFoodText,
  parseMultipleFoods,
  quickParseSingleFood,
  scanMenu,
  scanMenuFromUrl,
  getSelectedMenuItems,
  selectMenuItems,
  menuItemsToDescriptors,
} from './identification';

// ============================================================================
// RESOLUTION (Database Layer)
// ============================================================================
export {
  resolveNutrition,
  batchResolveNutrition,
  resolveByBarcode,
  getCachedNutrition,
  setCachedNutrition,
  invalidateCache,
  getCacheStats,
  cleanupExpiredCache,
  // Individual API access
  searchUSDA,
  searchEdamam,
  searchOpenFoodFacts,
  getByBarcode,
  // Secrets for Cloud Function registration
  usdaApiKey,
  edamamAppId,
  edamamAppKey,
} from './resolution';

// ============================================================================
// GLYCEMIC INDEX (Pre-loaded Database)
// ============================================================================
export {
  lookupGI,
  batchLookupGI,
  getGIBand,
  getGLBand,
  hasRelevantGI,
  getGIExplanation,
  calculateMealGI,
  calculateMealGL,
  GI_DATABASE,
  CATEGORY_DEFAULTS,
  getDatabaseSize,
  getFoodsByCategory,
} from './gi';

// ============================================================================
// GRADING (Deterministic Layer)
// ============================================================================
export {
  gradeNutrition,
  gradeNutritionWithGI,
  gradeFocus,
  getOverallGrade,
  batchGradeNutrition,
  compareFoods,
  compareFoodsWithInsights,
  getQuickWinner,
  compareTwo,
  // AI Insights
  generateFoodInsight,
  batchGenerateFoodInsights,
} from './grading';

// ============================================================================
// PIPELINE (Orchestration)
// ============================================================================
export {
  analyzePhotoV2,
  analyzePhotoUrlV2,
  analyzeTextV2,
  analyzeMenuItemsV2,
  scanAndAnalyzeMenuV2,
  compareFoodsV2,
  analyzeSingleFoodV2,
  type AnalysisOptionsV2,
} from './pipeline';

// ============================================================================
// CLOUD FUNCTIONS
// ============================================================================
export {
  analyzeFoodPhotoV2,
  analyzeFoodPhotoUrlV2,
  analyzeFoodTextV2,
  analyzeSingleFoodFnV2,
  scanMenuV2,
  analyzeMenuItemsV2Fn,
  scanAndAnalyzeMenuFnV2,
  compareFoodsFnV2,
  cleanupNutritionCacheV2,
  getNutritionCacheStatsV2,
  nutritionV2Health,
} from './functions';
