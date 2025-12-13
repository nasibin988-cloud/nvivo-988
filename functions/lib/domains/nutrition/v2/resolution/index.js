"use strict";
/**
 * Resolution Layer Exports
 *
 * Main entry point for nutrition resolution.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchSearchOFF = exports.getByBarcode = exports.searchOpenFoodFacts = exports.edamamAppKey = exports.edamamAppId = exports.batchSearchEdamam = exports.getNutritionByFoodId = exports.searchEdamamRestaurant = exports.searchEdamam = exports.usdaApiKey = exports.batchSearchUSDA = exports.getUSDAByFdcId = exports.searchUSDA = exports.generateCacheKey = exports.cleanupExpiredCache = exports.getCacheStats = exports.invalidateCache = exports.batchSetCachedNutrition = exports.batchGetCachedNutrition = exports.setCachedNutrition = exports.getCachedNutrition = exports.resolveByBarcode = exports.batchResolveNutrition = exports.resolveNutrition = void 0;
// Main resolver
var resolver_1 = require("./resolver");
Object.defineProperty(exports, "resolveNutrition", { enumerable: true, get: function () { return resolver_1.resolveNutrition; } });
Object.defineProperty(exports, "batchResolveNutrition", { enumerable: true, get: function () { return resolver_1.batchResolveNutrition; } });
Object.defineProperty(exports, "resolveByBarcode", { enumerable: true, get: function () { return resolver_1.resolveByBarcode; } });
// Cache operations
var nutritionCache_1 = require("./nutritionCache");
Object.defineProperty(exports, "getCachedNutrition", { enumerable: true, get: function () { return nutritionCache_1.getCachedNutrition; } });
Object.defineProperty(exports, "setCachedNutrition", { enumerable: true, get: function () { return nutritionCache_1.setCachedNutrition; } });
Object.defineProperty(exports, "batchGetCachedNutrition", { enumerable: true, get: function () { return nutritionCache_1.batchGetCachedNutrition; } });
Object.defineProperty(exports, "batchSetCachedNutrition", { enumerable: true, get: function () { return nutritionCache_1.batchSetCachedNutrition; } });
Object.defineProperty(exports, "invalidateCache", { enumerable: true, get: function () { return nutritionCache_1.invalidateCache; } });
Object.defineProperty(exports, "getCacheStats", { enumerable: true, get: function () { return nutritionCache_1.getCacheStats; } });
Object.defineProperty(exports, "cleanupExpiredCache", { enumerable: true, get: function () { return nutritionCache_1.cleanupExpiredCache; } });
Object.defineProperty(exports, "generateCacheKey", { enumerable: true, get: function () { return nutritionCache_1.generateCacheKey; } });
// Individual API clients (for direct access if needed)
var usdaClient_1 = require("./usdaClient");
Object.defineProperty(exports, "searchUSDA", { enumerable: true, get: function () { return usdaClient_1.searchUSDA; } });
Object.defineProperty(exports, "getUSDAByFdcId", { enumerable: true, get: function () { return usdaClient_1.getUSDAByFdcId; } });
Object.defineProperty(exports, "batchSearchUSDA", { enumerable: true, get: function () { return usdaClient_1.batchSearchUSDA; } });
Object.defineProperty(exports, "usdaApiKey", { enumerable: true, get: function () { return usdaClient_1.usdaApiKey; } });
var edamamClient_1 = require("./edamamClient");
Object.defineProperty(exports, "searchEdamam", { enumerable: true, get: function () { return edamamClient_1.searchEdamam; } });
Object.defineProperty(exports, "searchEdamamRestaurant", { enumerable: true, get: function () { return edamamClient_1.searchEdamamRestaurant; } });
Object.defineProperty(exports, "getNutritionByFoodId", { enumerable: true, get: function () { return edamamClient_1.getNutritionByFoodId; } });
Object.defineProperty(exports, "batchSearchEdamam", { enumerable: true, get: function () { return edamamClient_1.batchSearchEdamam; } });
Object.defineProperty(exports, "edamamAppId", { enumerable: true, get: function () { return edamamClient_1.edamamAppId; } });
Object.defineProperty(exports, "edamamAppKey", { enumerable: true, get: function () { return edamamClient_1.edamamAppKey; } });
var openFoodFactsClient_1 = require("./openFoodFactsClient");
Object.defineProperty(exports, "searchOpenFoodFacts", { enumerable: true, get: function () { return openFoodFactsClient_1.searchOpenFoodFacts; } });
Object.defineProperty(exports, "getByBarcode", { enumerable: true, get: function () { return openFoodFactsClient_1.getByBarcode; } });
Object.defineProperty(exports, "batchSearchOFF", { enumerable: true, get: function () { return openFoodFactsClient_1.batchSearchOFF; } });
//# sourceMappingURL=index.js.map