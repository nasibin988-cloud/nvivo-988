"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzePhotoUrlV2 = exports.analyzePhotoV2 = exports.batchGenerateFoodInsights = exports.generateFoodInsight = exports.compareTwo = exports.getQuickWinner = exports.compareFoodsWithInsights = exports.compareFoods = exports.batchGradeNutrition = exports.getOverallGrade = exports.gradeFocus = exports.gradeNutritionWithGI = exports.gradeNutrition = exports.getFoodsByCategory = exports.getDatabaseSize = exports.CATEGORY_DEFAULTS = exports.GI_DATABASE = exports.calculateMealGL = exports.calculateMealGI = exports.getGIExplanation = exports.hasRelevantGI = exports.getGLBand = exports.getGIBand = exports.batchLookupGI = exports.lookupGI = exports.edamamAppKey = exports.edamamAppId = exports.usdaApiKey = exports.getByBarcode = exports.searchOpenFoodFacts = exports.searchEdamam = exports.searchUSDA = exports.cleanupExpiredCache = exports.getCacheStats = exports.invalidateCache = exports.setCachedNutrition = exports.getCachedNutrition = exports.resolveByBarcode = exports.batchResolveNutrition = exports.resolveNutrition = exports.menuItemsToDescriptors = exports.selectMenuItems = exports.getSelectedMenuItems = exports.scanMenuFromUrl = exports.scanMenu = exports.quickParseSingleFood = exports.parseMultipleFoods = exports.parseFoodText = exports.identifyFoodsFromPhotoUrl = exports.identifyFoodsFromPhoto = void 0;
exports.nutritionV2Health = exports.getNutritionCacheStatsV2 = exports.cleanupNutritionCacheV2 = exports.compareFoodsFnV2 = exports.scanAndAnalyzeMenuFnV2 = exports.analyzeMenuItemsV2Fn = exports.scanMenuV2 = exports.analyzeSingleFoodFnV2 = exports.analyzeFoodTextV2 = exports.analyzeFoodPhotoUrlV2 = exports.analyzeFoodPhotoV2 = exports.analyzeSingleFoodV2 = exports.compareFoodsV2 = exports.scanAndAnalyzeMenuV2 = exports.analyzeMenuItemsV2 = exports.analyzeTextV2 = void 0;
// ============================================================================
// TYPES
// ============================================================================
__exportStar(require("./types"), exports);
// ============================================================================
// IDENTIFICATION (AI Layer)
// ============================================================================
var identification_1 = require("./identification");
Object.defineProperty(exports, "identifyFoodsFromPhoto", { enumerable: true, get: function () { return identification_1.identifyFoodsFromPhoto; } });
Object.defineProperty(exports, "identifyFoodsFromPhotoUrl", { enumerable: true, get: function () { return identification_1.identifyFoodsFromPhotoUrl; } });
Object.defineProperty(exports, "parseFoodText", { enumerable: true, get: function () { return identification_1.parseFoodText; } });
Object.defineProperty(exports, "parseMultipleFoods", { enumerable: true, get: function () { return identification_1.parseMultipleFoods; } });
Object.defineProperty(exports, "quickParseSingleFood", { enumerable: true, get: function () { return identification_1.quickParseSingleFood; } });
Object.defineProperty(exports, "scanMenu", { enumerable: true, get: function () { return identification_1.scanMenu; } });
Object.defineProperty(exports, "scanMenuFromUrl", { enumerable: true, get: function () { return identification_1.scanMenuFromUrl; } });
Object.defineProperty(exports, "getSelectedMenuItems", { enumerable: true, get: function () { return identification_1.getSelectedMenuItems; } });
Object.defineProperty(exports, "selectMenuItems", { enumerable: true, get: function () { return identification_1.selectMenuItems; } });
Object.defineProperty(exports, "menuItemsToDescriptors", { enumerable: true, get: function () { return identification_1.menuItemsToDescriptors; } });
// ============================================================================
// RESOLUTION (Database Layer)
// ============================================================================
var resolution_1 = require("./resolution");
Object.defineProperty(exports, "resolveNutrition", { enumerable: true, get: function () { return resolution_1.resolveNutrition; } });
Object.defineProperty(exports, "batchResolveNutrition", { enumerable: true, get: function () { return resolution_1.batchResolveNutrition; } });
Object.defineProperty(exports, "resolveByBarcode", { enumerable: true, get: function () { return resolution_1.resolveByBarcode; } });
Object.defineProperty(exports, "getCachedNutrition", { enumerable: true, get: function () { return resolution_1.getCachedNutrition; } });
Object.defineProperty(exports, "setCachedNutrition", { enumerable: true, get: function () { return resolution_1.setCachedNutrition; } });
Object.defineProperty(exports, "invalidateCache", { enumerable: true, get: function () { return resolution_1.invalidateCache; } });
Object.defineProperty(exports, "getCacheStats", { enumerable: true, get: function () { return resolution_1.getCacheStats; } });
Object.defineProperty(exports, "cleanupExpiredCache", { enumerable: true, get: function () { return resolution_1.cleanupExpiredCache; } });
// Individual API access
Object.defineProperty(exports, "searchUSDA", { enumerable: true, get: function () { return resolution_1.searchUSDA; } });
Object.defineProperty(exports, "searchEdamam", { enumerable: true, get: function () { return resolution_1.searchEdamam; } });
Object.defineProperty(exports, "searchOpenFoodFacts", { enumerable: true, get: function () { return resolution_1.searchOpenFoodFacts; } });
Object.defineProperty(exports, "getByBarcode", { enumerable: true, get: function () { return resolution_1.getByBarcode; } });
// Secrets for Cloud Function registration
Object.defineProperty(exports, "usdaApiKey", { enumerable: true, get: function () { return resolution_1.usdaApiKey; } });
Object.defineProperty(exports, "edamamAppId", { enumerable: true, get: function () { return resolution_1.edamamAppId; } });
Object.defineProperty(exports, "edamamAppKey", { enumerable: true, get: function () { return resolution_1.edamamAppKey; } });
// ============================================================================
// GLYCEMIC INDEX (Pre-loaded Database)
// ============================================================================
var gi_1 = require("./gi");
Object.defineProperty(exports, "lookupGI", { enumerable: true, get: function () { return gi_1.lookupGI; } });
Object.defineProperty(exports, "batchLookupGI", { enumerable: true, get: function () { return gi_1.batchLookupGI; } });
Object.defineProperty(exports, "getGIBand", { enumerable: true, get: function () { return gi_1.getGIBand; } });
Object.defineProperty(exports, "getGLBand", { enumerable: true, get: function () { return gi_1.getGLBand; } });
Object.defineProperty(exports, "hasRelevantGI", { enumerable: true, get: function () { return gi_1.hasRelevantGI; } });
Object.defineProperty(exports, "getGIExplanation", { enumerable: true, get: function () { return gi_1.getGIExplanation; } });
Object.defineProperty(exports, "calculateMealGI", { enumerable: true, get: function () { return gi_1.calculateMealGI; } });
Object.defineProperty(exports, "calculateMealGL", { enumerable: true, get: function () { return gi_1.calculateMealGL; } });
Object.defineProperty(exports, "GI_DATABASE", { enumerable: true, get: function () { return gi_1.GI_DATABASE; } });
Object.defineProperty(exports, "CATEGORY_DEFAULTS", { enumerable: true, get: function () { return gi_1.CATEGORY_DEFAULTS; } });
Object.defineProperty(exports, "getDatabaseSize", { enumerable: true, get: function () { return gi_1.getDatabaseSize; } });
Object.defineProperty(exports, "getFoodsByCategory", { enumerable: true, get: function () { return gi_1.getFoodsByCategory; } });
// ============================================================================
// GRADING (Deterministic Layer)
// ============================================================================
var grading_1 = require("./grading");
Object.defineProperty(exports, "gradeNutrition", { enumerable: true, get: function () { return grading_1.gradeNutrition; } });
Object.defineProperty(exports, "gradeNutritionWithGI", { enumerable: true, get: function () { return grading_1.gradeNutritionWithGI; } });
Object.defineProperty(exports, "gradeFocus", { enumerable: true, get: function () { return grading_1.gradeFocus; } });
Object.defineProperty(exports, "getOverallGrade", { enumerable: true, get: function () { return grading_1.getOverallGrade; } });
Object.defineProperty(exports, "batchGradeNutrition", { enumerable: true, get: function () { return grading_1.batchGradeNutrition; } });
Object.defineProperty(exports, "compareFoods", { enumerable: true, get: function () { return grading_1.compareFoods; } });
Object.defineProperty(exports, "compareFoodsWithInsights", { enumerable: true, get: function () { return grading_1.compareFoodsWithInsights; } });
Object.defineProperty(exports, "getQuickWinner", { enumerable: true, get: function () { return grading_1.getQuickWinner; } });
Object.defineProperty(exports, "compareTwo", { enumerable: true, get: function () { return grading_1.compareTwo; } });
// AI Insights
Object.defineProperty(exports, "generateFoodInsight", { enumerable: true, get: function () { return grading_1.generateFoodInsight; } });
Object.defineProperty(exports, "batchGenerateFoodInsights", { enumerable: true, get: function () { return grading_1.batchGenerateFoodInsights; } });
// ============================================================================
// PIPELINE (Orchestration)
// ============================================================================
var pipeline_1 = require("./pipeline");
Object.defineProperty(exports, "analyzePhotoV2", { enumerable: true, get: function () { return pipeline_1.analyzePhotoV2; } });
Object.defineProperty(exports, "analyzePhotoUrlV2", { enumerable: true, get: function () { return pipeline_1.analyzePhotoUrlV2; } });
Object.defineProperty(exports, "analyzeTextV2", { enumerable: true, get: function () { return pipeline_1.analyzeTextV2; } });
Object.defineProperty(exports, "analyzeMenuItemsV2", { enumerable: true, get: function () { return pipeline_1.analyzeMenuItemsV2; } });
Object.defineProperty(exports, "scanAndAnalyzeMenuV2", { enumerable: true, get: function () { return pipeline_1.scanAndAnalyzeMenuV2; } });
Object.defineProperty(exports, "compareFoodsV2", { enumerable: true, get: function () { return pipeline_1.compareFoodsV2; } });
Object.defineProperty(exports, "analyzeSingleFoodV2", { enumerable: true, get: function () { return pipeline_1.analyzeSingleFoodV2; } });
// ============================================================================
// CLOUD FUNCTIONS
// ============================================================================
var functions_1 = require("./functions");
Object.defineProperty(exports, "analyzeFoodPhotoV2", { enumerable: true, get: function () { return functions_1.analyzeFoodPhotoV2; } });
Object.defineProperty(exports, "analyzeFoodPhotoUrlV2", { enumerable: true, get: function () { return functions_1.analyzeFoodPhotoUrlV2; } });
Object.defineProperty(exports, "analyzeFoodTextV2", { enumerable: true, get: function () { return functions_1.analyzeFoodTextV2; } });
Object.defineProperty(exports, "analyzeSingleFoodFnV2", { enumerable: true, get: function () { return functions_1.analyzeSingleFoodFnV2; } });
Object.defineProperty(exports, "scanMenuV2", { enumerable: true, get: function () { return functions_1.scanMenuV2; } });
Object.defineProperty(exports, "analyzeMenuItemsV2Fn", { enumerable: true, get: function () { return functions_1.analyzeMenuItemsV2Fn; } });
Object.defineProperty(exports, "scanAndAnalyzeMenuFnV2", { enumerable: true, get: function () { return functions_1.scanAndAnalyzeMenuFnV2; } });
Object.defineProperty(exports, "compareFoodsFnV2", { enumerable: true, get: function () { return functions_1.compareFoodsFnV2; } });
Object.defineProperty(exports, "cleanupNutritionCacheV2", { enumerable: true, get: function () { return functions_1.cleanupNutritionCacheV2; } });
Object.defineProperty(exports, "getNutritionCacheStatsV2", { enumerable: true, get: function () { return functions_1.getNutritionCacheStatsV2; } });
Object.defineProperty(exports, "nutritionV2Health", { enumerable: true, get: function () { return functions_1.nutritionV2Health; } });
//# sourceMappingURL=index.js.map