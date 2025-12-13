"use strict";
/**
 * Nutrition V2 Cloud Functions
 *
 * New endpoints for the v2 nutrition architecture.
 * Coexists with v1 endpoints for gradual migration.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.nutritionV2Health = exports.getNutritionCacheStatsV2 = exports.cleanupNutritionCacheV2 = exports.compareFoodsFnV2 = exports.scanAndAnalyzeMenuFnV2 = exports.analyzeMenuItemsV2Fn = exports.scanMenuV2 = exports.analyzeSingleFoodFnV2 = exports.analyzeFoodTextV2 = exports.analyzeFoodPhotoUrlV2 = exports.analyzeFoodPhotoV2 = void 0;
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const v2_1 = require("firebase-functions/v2");
const pipeline_1 = require("./pipeline");
const identification_1 = require("./identification");
const resolution_1 = require("./resolution");
const resolution_2 = require("./resolution");
// Configure with secrets (including OpenAI for photo/text identification)
const functionConfig = {
    secrets: [resolution_2.usdaApiKey, resolution_2.edamamAppId, resolution_2.edamamAppKey, identification_1.photoIdOpenaiApiKey],
    memory: '512MiB',
    timeoutSeconds: 60,
    region: 'us-central1',
};
// ============================================================================
// PHOTO ANALYSIS
// ============================================================================
/**
 * Analyze food from photo (base64)
 */
exports.analyzeFoodPhotoV2 = (0, https_1.onCall)(functionConfig, async (request) => {
    const { imageBase64, mimeType, userFocus, generateInsights } = request.data;
    if (!imageBase64) {
        throw new https_1.HttpsError('invalid-argument', 'imageBase64 is required');
    }
    try {
        v2_1.logger.info('Analyzing food photo v2', { userFocus: userFocus || 'balanced' });
        const result = await (0, pipeline_1.analyzePhotoV2)(imageBase64, mimeType || 'image/jpeg', {
            userFocus: userFocus || 'balanced',
            generateInsights: generateInsights !== false, // Default true
        });
        v2_1.logger.info(`Analyzed ${result.items.length} items`);
        return result;
    }
    catch (error) {
        v2_1.logger.error('Photo analysis failed:', error);
        throw new https_1.HttpsError('internal', 'Failed to analyze photo');
    }
});
/**
 * Analyze food from photo URL
 */
exports.analyzeFoodPhotoUrlV2 = (0, https_1.onCall)(functionConfig, async (request) => {
    const { imageUrl, userFocus, generateInsights } = request.data;
    if (!imageUrl) {
        throw new https_1.HttpsError('invalid-argument', 'imageUrl is required');
    }
    try {
        v2_1.logger.info('Analyzing food photo URL v2:', imageUrl);
        const result = await (0, pipeline_1.analyzePhotoUrlV2)(imageUrl, {
            userFocus: userFocus || 'balanced',
            generateInsights: generateInsights !== false,
        });
        v2_1.logger.info(`Analyzed ${result.items.length} items`);
        return result;
    }
    catch (error) {
        v2_1.logger.error('Photo URL analysis failed:', error);
        throw new https_1.HttpsError('internal', 'Failed to analyze photo URL');
    }
});
// ============================================================================
// TEXT ANALYSIS
// ============================================================================
/**
 * Analyze food from text description
 */
exports.analyzeFoodTextV2 = (0, https_1.onCall)(functionConfig, async (request) => {
    const { text, userFocus, generateInsights } = request.data;
    if (!text || typeof text !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'text is required');
    }
    try {
        v2_1.logger.info('Analyzing food text v2:', text.substring(0, 50));
        const result = await (0, pipeline_1.analyzeTextV2)(text, {
            userFocus: userFocus || 'balanced',
            generateInsights: generateInsights !== false,
        });
        v2_1.logger.info(`Analyzed ${result.items.length} items`);
        return result;
    }
    catch (error) {
        v2_1.logger.error('Text analysis failed:', error);
        throw new https_1.HttpsError('internal', 'Failed to analyze text');
    }
});
/**
 * Analyze single food by name
 * Simpler endpoint for quick lookups
 */
exports.analyzeSingleFoodFnV2 = (0, https_1.onCall)(functionConfig, async (request) => {
    const { foodName, quantity, unit, estimatedGrams, userFocus, generateInsights } = request.data;
    if (!foodName || typeof foodName !== 'string') {
        throw new https_1.HttpsError('invalid-argument', 'foodName is required');
    }
    try {
        v2_1.logger.info('Analyzing single food v2:', foodName);
        const result = await (0, pipeline_1.analyzeSingleFoodV2)(foodName, quantity || 1, unit || 'serving', estimatedGrams || 100, {
            userFocus: userFocus || 'balanced',
            generateInsights: generateInsights !== false,
        });
        return result;
    }
    catch (error) {
        v2_1.logger.error('Single food analysis failed:', error);
        throw new https_1.HttpsError('internal', 'Failed to analyze food');
    }
});
// ============================================================================
// MENU SCANNING
// ============================================================================
/**
 * Scan menu from image (returns items for selection)
 */
exports.scanMenuV2 = (0, https_1.onCall)({ ...functionConfig, timeoutSeconds: 120 }, // Longer timeout for menu scanning
async (request) => {
    const { imageBase64, imageUrl, mimeType } = request.data;
    if (!imageBase64 && !imageUrl) {
        throw new https_1.HttpsError('invalid-argument', 'imageBase64 or imageUrl is required');
    }
    try {
        v2_1.logger.info('Scanning menu v2');
        let result;
        if (imageBase64) {
            result = await (0, identification_1.scanMenu)(imageBase64, mimeType || 'image/jpeg');
        }
        else {
            result = await (0, identification_1.scanMenuFromUrl)(imageUrl);
        }
        v2_1.logger.info(`Found ${result.menuItems.length} menu items`);
        return result;
    }
    catch (error) {
        v2_1.logger.error('Menu scan failed:', error);
        throw new https_1.HttpsError('internal', 'Failed to scan menu');
    }
});
/**
 * Analyze selected menu items
 */
exports.analyzeMenuItemsV2Fn = (0, https_1.onCall)(functionConfig, async (request) => {
    const { menuScan, selectedItemIds, userFocus, generateInsights } = request.data;
    if (!menuScan || !selectedItemIds || !Array.isArray(selectedItemIds)) {
        throw new https_1.HttpsError('invalid-argument', 'menuScan and selectedItemIds are required');
    }
    if (selectedItemIds.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'At least one item must be selected');
    }
    try {
        v2_1.logger.info(`Analyzing ${selectedItemIds.length} menu items v2`);
        const result = await (0, pipeline_1.analyzeMenuItemsV2)(menuScan, selectedItemIds, {
            userFocus: userFocus || 'balanced',
            generateInsights: generateInsights !== false,
        });
        return result;
    }
    catch (error) {
        v2_1.logger.error('Menu items analysis failed:', error);
        throw new https_1.HttpsError('internal', 'Failed to analyze menu items');
    }
});
/**
 * Scan menu and analyze selected items in one call
 */
exports.scanAndAnalyzeMenuFnV2 = (0, https_1.onCall)({ ...functionConfig, timeoutSeconds: 120 }, async (request) => {
    const { imageBase64, selectedItemIds, mimeType, userFocus, generateInsights } = request.data;
    if (!imageBase64) {
        throw new https_1.HttpsError('invalid-argument', 'imageBase64 is required');
    }
    if (!selectedItemIds || !Array.isArray(selectedItemIds) || selectedItemIds.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'selectedItemIds is required and must have at least one item');
    }
    try {
        v2_1.logger.info('Scan and analyze menu v2');
        const result = await (0, pipeline_1.scanAndAnalyzeMenuV2)(imageBase64, selectedItemIds, mimeType || 'image/jpeg', {
            userFocus: userFocus || 'balanced',
            generateInsights: generateInsights !== false,
        });
        return result;
    }
    catch (error) {
        v2_1.logger.error('Scan and analyze failed:', error);
        throw new https_1.HttpsError('internal', 'Failed to scan and analyze menu');
    }
});
// ============================================================================
// FOOD COMPARISON
// ============================================================================
/**
 * Compare multiple foods
 */
exports.compareFoodsFnV2 = (0, https_1.onCall)(functionConfig, async (request) => {
    const { foods, userFocus, includeAIInsights } = request.data;
    if (!foods || !Array.isArray(foods) || foods.length < 2) {
        throw new https_1.HttpsError('invalid-argument', 'At least 2 foods are required for comparison');
    }
    // Validate each food has at least one identifier
    for (let i = 0; i < foods.length; i++) {
        const food = foods[i];
        if (!food.text && !food.imageBase64 && !food.imageUrl) {
            throw new https_1.HttpsError('invalid-argument', `Food ${i + 1} must have text, imageBase64, or imageUrl`);
        }
    }
    // Validate focus
    const validFocuses = [
        'balanced', 'muscle_building', 'heart_health', 'energy_endurance',
        'weight_management', 'brain_focus', 'gut_health', 'blood_sugar_balance',
        'bone_joint_support', 'anti_inflammatory',
    ];
    if (userFocus && !validFocuses.includes(userFocus)) {
        throw new https_1.HttpsError('invalid-argument', `Invalid userFocus. Must be one of: ${validFocuses.join(', ')}`);
    }
    try {
        v2_1.logger.info(`Comparing ${foods.length} foods v2 for focus: ${userFocus || 'balanced'}`);
        const result = await (0, pipeline_1.compareFoodsV2)(foods, userFocus || 'balanced', includeAIInsights || false);
        return result;
    }
    catch (error) {
        v2_1.logger.error('Food comparison failed:', error);
        throw new https_1.HttpsError('internal', 'Failed to compare foods');
    }
});
// ============================================================================
// CACHE MANAGEMENT
// ============================================================================
/**
 * Clean up expired cache entries (scheduled)
 */
exports.cleanupNutritionCacheV2 = (0, scheduler_1.onSchedule)({
    schedule: 'every 24 hours',
    region: 'us-central1',
    timeZone: 'America/New_York',
}, async () => {
    v2_1.logger.info('Running nutrition cache cleanup v2');
    try {
        let totalDeleted = 0;
        let deleted = 0;
        // Delete in batches until no more expired entries
        do {
            deleted = await (0, resolution_1.cleanupExpiredCache)();
            totalDeleted += deleted;
            v2_1.logger.info(`Deleted ${deleted} expired cache entries`);
        } while (deleted > 0);
        v2_1.logger.info(`Cache cleanup complete. Total deleted: ${totalDeleted}`);
    }
    catch (error) {
        v2_1.logger.error('Cache cleanup failed:', error);
        throw error;
    }
});
/**
 * Get cache statistics (admin only)
 */
exports.getNutritionCacheStatsV2 = (0, https_1.onCall)(functionConfig, async (request) => {
    // TODO: Add admin check
    // if (!request.auth || !isAdmin(request.auth.uid)) {
    //   throw new HttpsError('permission-denied', 'Admin access required');
    // }
    try {
        const stats = await (0, resolution_1.getCacheStats)();
        return stats;
    }
    catch (error) {
        v2_1.logger.error('Failed to get cache stats:', error);
        throw new https_1.HttpsError('internal', 'Failed to get cache statistics');
    }
});
// ============================================================================
// HEALTH CHECK
// ============================================================================
/**
 * Health check for v2 nutrition functions
 */
exports.nutritionV2Health = (0, https_1.onCall)({ memory: '256MiB', region: 'us-central1' }, async () => {
    return {
        status: 'healthy',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        features: {
            photoAnalysis: true,
            textAnalysis: true,
            menuScanning: true,
            foodComparison: true,
            giLookup: true,
            deterministicGrading: true,
        },
    };
});
//# sourceMappingURL=functions.js.map