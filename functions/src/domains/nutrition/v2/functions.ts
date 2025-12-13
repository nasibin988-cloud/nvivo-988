/**
 * Nutrition V2 Cloud Functions
 *
 * New endpoints for the v2 nutrition architecture.
 * Coexists with v1 endpoints for gradual migration.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions/v2';
import {
  analyzePhotoV2,
  analyzePhotoUrlV2,
  analyzeTextV2,
  analyzeMenuItemsV2,
  scanAndAnalyzeMenuV2,
  compareFoodsV2,
  analyzeSingleFoodV2,
} from './pipeline';
import { scanMenu, scanMenuFromUrl, photoIdOpenaiApiKey } from './identification';
import { cleanupExpiredCache, getCacheStats } from './resolution';
import { usdaApiKey, edamamAppId, edamamAppKey } from './resolution';
import type { WellnessFocus } from './types';

// Configure with secrets (including OpenAI for photo/text identification)
const functionConfig = {
  secrets: [usdaApiKey, edamamAppId, edamamAppKey, photoIdOpenaiApiKey],
  memory: '512MiB' as const,
  timeoutSeconds: 60,
  region: 'us-central1',
};

// ============================================================================
// PHOTO ANALYSIS
// ============================================================================

/**
 * Analyze food from photo (base64)
 */
export const analyzeFoodPhotoV2 = onCall(
  functionConfig,
  async (request) => {
    const { imageBase64, mimeType, userFocus, generateInsights } = request.data;

    if (!imageBase64) {
      throw new HttpsError('invalid-argument', 'imageBase64 is required');
    }

    try {
      logger.info('Analyzing food photo v2', { userFocus: userFocus || 'balanced' });
      const result = await analyzePhotoV2(imageBase64, mimeType || 'image/jpeg', {
        userFocus: userFocus || 'balanced',
        generateInsights: generateInsights !== false, // Default true
      });
      logger.info(`Analyzed ${result.items.length} items`);
      return result;
    } catch (error) {
      logger.error('Photo analysis failed:', error);
      throw new HttpsError('internal', 'Failed to analyze photo');
    }
  }
);

/**
 * Analyze food from photo URL
 */
export const analyzeFoodPhotoUrlV2 = onCall(
  functionConfig,
  async (request) => {
    const { imageUrl, userFocus, generateInsights } = request.data;

    if (!imageUrl) {
      throw new HttpsError('invalid-argument', 'imageUrl is required');
    }

    try {
      logger.info('Analyzing food photo URL v2:', imageUrl);
      const result = await analyzePhotoUrlV2(imageUrl, {
        userFocus: userFocus || 'balanced',
        generateInsights: generateInsights !== false,
      });
      logger.info(`Analyzed ${result.items.length} items`);
      return result;
    } catch (error) {
      logger.error('Photo URL analysis failed:', error);
      throw new HttpsError('internal', 'Failed to analyze photo URL');
    }
  }
);

// ============================================================================
// TEXT ANALYSIS
// ============================================================================

/**
 * Analyze food from text description
 */
export const analyzeFoodTextV2 = onCall(
  functionConfig,
  async (request) => {
    const { text, userFocus, generateInsights } = request.data;

    if (!text || typeof text !== 'string') {
      throw new HttpsError('invalid-argument', 'text is required');
    }

    try {
      logger.info('Analyzing food text v2:', text.substring(0, 50));
      const result = await analyzeTextV2(text, {
        userFocus: userFocus || 'balanced',
        generateInsights: generateInsights !== false,
      });
      logger.info(`Analyzed ${result.items.length} items`);
      return result;
    } catch (error) {
      logger.error('Text analysis failed:', error);
      throw new HttpsError('internal', 'Failed to analyze text');
    }
  }
);

/**
 * Analyze single food by name
 * Simpler endpoint for quick lookups
 */
export const analyzeSingleFoodFnV2 = onCall(
  functionConfig,
  async (request) => {
    const { foodName, quantity, unit, estimatedGrams, userFocus, generateInsights } = request.data;

    if (!foodName || typeof foodName !== 'string') {
      throw new HttpsError('invalid-argument', 'foodName is required');
    }

    try {
      logger.info('Analyzing single food v2:', foodName);
      const result = await analyzeSingleFoodV2(
        foodName,
        quantity || 1,
        unit || 'serving',
        estimatedGrams || 100,
        {
          userFocus: userFocus || 'balanced',
          generateInsights: generateInsights !== false,
        }
      );
      return result;
    } catch (error) {
      logger.error('Single food analysis failed:', error);
      throw new HttpsError('internal', 'Failed to analyze food');
    }
  }
);

// ============================================================================
// MENU SCANNING
// ============================================================================

/**
 * Scan menu from image (returns items for selection)
 */
export const scanMenuV2 = onCall(
  { ...functionConfig, timeoutSeconds: 120 }, // Longer timeout for menu scanning
  async (request) => {
    const { imageBase64, imageUrl, mimeType } = request.data;

    if (!imageBase64 && !imageUrl) {
      throw new HttpsError('invalid-argument', 'imageBase64 or imageUrl is required');
    }

    try {
      logger.info('Scanning menu v2');

      let result;
      if (imageBase64) {
        result = await scanMenu(imageBase64, mimeType || 'image/jpeg');
      } else {
        result = await scanMenuFromUrl(imageUrl);
      }

      logger.info(`Found ${result.menuItems.length} menu items`);
      return result;
    } catch (error) {
      logger.error('Menu scan failed:', error);
      throw new HttpsError('internal', 'Failed to scan menu');
    }
  }
);

/**
 * Analyze selected menu items
 */
export const analyzeMenuItemsV2Fn = onCall(
  functionConfig,
  async (request) => {
    const { menuScan, selectedItemIds, userFocus, generateInsights } = request.data;

    if (!menuScan || !selectedItemIds || !Array.isArray(selectedItemIds)) {
      throw new HttpsError('invalid-argument', 'menuScan and selectedItemIds are required');
    }

    if (selectedItemIds.length === 0) {
      throw new HttpsError('invalid-argument', 'At least one item must be selected');
    }

    try {
      logger.info(`Analyzing ${selectedItemIds.length} menu items v2`);
      const result = await analyzeMenuItemsV2(menuScan, selectedItemIds, {
        userFocus: userFocus || 'balanced',
        generateInsights: generateInsights !== false,
      });
      return result;
    } catch (error) {
      logger.error('Menu items analysis failed:', error);
      throw new HttpsError('internal', 'Failed to analyze menu items');
    }
  }
);

/**
 * Scan menu and analyze selected items in one call
 */
export const scanAndAnalyzeMenuFnV2 = onCall(
  { ...functionConfig, timeoutSeconds: 120 },
  async (request) => {
    const { imageBase64, selectedItemIds, mimeType, userFocus, generateInsights } = request.data;

    if (!imageBase64) {
      throw new HttpsError('invalid-argument', 'imageBase64 is required');
    }

    if (!selectedItemIds || !Array.isArray(selectedItemIds) || selectedItemIds.length === 0) {
      throw new HttpsError('invalid-argument', 'selectedItemIds is required and must have at least one item');
    }

    try {
      logger.info('Scan and analyze menu v2');
      const result = await scanAndAnalyzeMenuV2(imageBase64, selectedItemIds, mimeType || 'image/jpeg', {
        userFocus: userFocus || 'balanced',
        generateInsights: generateInsights !== false,
      });
      return result;
    } catch (error) {
      logger.error('Scan and analyze failed:', error);
      throw new HttpsError('internal', 'Failed to scan and analyze menu');
    }
  }
);

// ============================================================================
// FOOD COMPARISON
// ============================================================================

/**
 * Compare multiple foods
 */
export const compareFoodsFnV2 = onCall(
  functionConfig,
  async (request) => {
    const { foods, userFocus, includeAIInsights } = request.data;

    if (!foods || !Array.isArray(foods) || foods.length < 2) {
      throw new HttpsError('invalid-argument', 'At least 2 foods are required for comparison');
    }

    // Validate each food has at least one identifier
    for (let i = 0; i < foods.length; i++) {
      const food = foods[i];
      if (!food.text && !food.imageBase64 && !food.imageUrl) {
        throw new HttpsError(
          'invalid-argument',
          `Food ${i + 1} must have text, imageBase64, or imageUrl`
        );
      }
    }

    // Validate focus
    const validFocuses: WellnessFocus[] = [
      'balanced', 'muscle_building', 'heart_health', 'energy_endurance',
      'weight_management', 'brain_focus', 'gut_health', 'blood_sugar_balance',
      'bone_joint_support', 'anti_inflammatory',
    ];

    if (userFocus && !validFocuses.includes(userFocus)) {
      throw new HttpsError('invalid-argument', `Invalid userFocus. Must be one of: ${validFocuses.join(', ')}`);
    }

    try {
      logger.info(`Comparing ${foods.length} foods v2 for focus: ${userFocus || 'balanced'}`);
      const result = await compareFoodsV2(
        foods,
        userFocus || 'balanced',
        includeAIInsights || false
      );
      return result;
    } catch (error) {
      logger.error('Food comparison failed:', error);
      throw new HttpsError('internal', 'Failed to compare foods');
    }
  }
);

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * Clean up expired cache entries (scheduled)
 */
export const cleanupNutritionCacheV2 = onSchedule(
  {
    schedule: 'every 24 hours',
    region: 'us-central1',
    timeZone: 'America/New_York',
  },
  async () => {
    logger.info('Running nutrition cache cleanup v2');

    try {
      let totalDeleted = 0;
      let deleted = 0;

      // Delete in batches until no more expired entries
      do {
        deleted = await cleanupExpiredCache();
        totalDeleted += deleted;
        logger.info(`Deleted ${deleted} expired cache entries`);
      } while (deleted > 0);

      logger.info(`Cache cleanup complete. Total deleted: ${totalDeleted}`);
    } catch (error) {
      logger.error('Cache cleanup failed:', error);
      throw error;
    }
  }
);

/**
 * Get cache statistics (admin only)
 */
export const getNutritionCacheStatsV2 = onCall(
  functionConfig,
  async (request) => {
    // TODO: Add admin check
    // if (!request.auth || !isAdmin(request.auth.uid)) {
    //   throw new HttpsError('permission-denied', 'Admin access required');
    // }

    try {
      const stats = await getCacheStats();
      return stats;
    } catch (error) {
      logger.error('Failed to get cache stats:', error);
      throw new HttpsError('internal', 'Failed to get cache statistics');
    }
  }
);

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * Health check for v2 nutrition functions
 */
export const nutritionV2Health = onCall(
  { memory: '256MiB' as const, region: 'us-central1' },
  async () => {
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
  }
);
