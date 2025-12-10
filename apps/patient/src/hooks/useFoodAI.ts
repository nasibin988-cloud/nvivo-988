/**
 * useFoodAI Hook
 * Unified hook for AI-powered food analysis across the app
 *
 * Used by:
 * - Food logging (FoodLogTab) - photo and text analysis
 * - Food comparison (FoodComparisonModal) - photo and text analysis
 * - Menu scanning (MenuScannerModal) - already has separate hook
 *
 * Provides:
 * - analyzePhoto: Analyze food from a photo (camera or upload)
 * - analyzeText: Analyze food from a text description
 * - applyMultiplier: Scale nutrition values by serving multiplier
 * - Error handling with mock data fallback
 *
 * Supports tiered nutrition detail levels:
 * - essential: Basic macros (calories, protein, carbs, fat, fiber, sugar, sodium)
 * - extended: + fat breakdown, key minerals (potassium, calcium, iron, magnesium)
 * - complete: + all vitamins, trace minerals, fatty acid details
 */

import { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { getFunctions } from '@nvivo/shared';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Nutrition detail level for AI analysis
 */
export type NutritionDetailLevel = 'essential' | 'extended' | 'complete';

/**
 * Essential nutrition fields (Tier 1)
 */
export interface EssentialNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

/**
 * Extended nutrition fields (Tier 2)
 */
export interface ExtendedNutrition extends EssentialNutrition {
  saturatedFat: number;
  transFat: number;
  cholesterol: number;
  potassium: number;
  calcium: number;
  iron: number;
  magnesium: number;
}

/**
 * Complete nutrition fields (Tier 3)
 */
export interface CompleteNutrition extends ExtendedNutrition {
  monounsaturatedFat?: number;
  polyunsaturatedFat?: number;
  vitaminA?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;
  vitaminC?: number;
  thiamin?: number;
  riboflavin?: number;
  niacin?: number;
  vitaminB6?: number;
  folate?: number;
  vitaminB12?: number;
  choline?: number;
  zinc?: number;
  phosphorus?: number;
  selenium?: number;
  copper?: number;
  manganese?: number;
  caffeine?: number;
  alcohol?: number;
  water?: number;
}

export interface AnalyzedFoodItem extends Partial<CompleteNutrition> {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  servingMultiplier: number;
  confidence: number;
}

export interface FoodAnalysisResult {
  items: AnalyzedFoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'unknown';
  description?: string;
}

type AnalysisStatus = 'idle' | 'analyzing' | 'success' | 'error';

export interface UseFoodAIOptions {
  /**
   * Default nutrition detail level for AI analysis
   * Can be overridden per-call
   */
  defaultDetailLevel?: NutritionDetailLevel;
}

export interface UseFoodAIReturn {
  // State
  status: AnalysisStatus;
  result: FoodAnalysisResult | null;
  error: string | null;
  detailLevel: NutritionDetailLevel;

  // Actions
  analyzePhoto: (imageBase64: string, detailLevel?: NutritionDetailLevel) => Promise<FoodAnalysisResult>;
  analyzeText: (foodDescription: string, detailLevel?: NutritionDetailLevel) => Promise<FoodAnalysisResult>;
  applyMultiplier: (item: AnalyzedFoodItem, multiplier: number) => AnalyzedFoodItem;
  setDetailLevel: (level: NutritionDetailLevel) => void;
  reset: () => void;

  // Utilities
  calculateTotals: (items: AnalyzedFoodItem[]) => {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

// ============================================================================
// MOCK DATA (for fallback when API fails)
// ============================================================================

const getMockPhotoResult = (): FoodAnalysisResult => ({
  items: [
    {
      name: 'Detected Food',
      quantity: 1,
      unit: 'serving',
      calories: 350,
      protein: 25,
      carbs: 30,
      fat: 12,
      fiber: 4,
      sugar: 6,
      sodium: 450,
      servingMultiplier: 1.0,
      confidence: 0.75,
    },
  ],
  totalCalories: 350,
  totalProtein: 25,
  totalCarbs: 30,
  totalFat: 12,
  mealType: 'unknown',
  description: 'Food detected (mock data - API unavailable)',
});

const getMockTextResult = (description: string): FoodAnalysisResult => ({
  items: [
    {
      name: description.slice(0, 50),
      quantity: 1,
      unit: 'serving',
      calories: 300,
      protein: 20,
      carbs: 35,
      fat: 10,
      fiber: 3,
      sugar: 5,
      sodium: 400,
      servingMultiplier: 1.0,
      confidence: 0.7,
    },
  ],
  totalCalories: 300,
  totalProtein: 20,
  totalCarbs: 35,
  totalFat: 10,
  mealType: 'unknown',
  description: `${description} (mock data - API unavailable)`,
});

// ============================================================================
// HOOK
// ============================================================================

export function useFoodAI(options: UseFoodAIOptions = {}): UseFoodAIReturn {
  const { defaultDetailLevel = 'essential' } = options;

  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [result, setResult] = useState<FoodAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailLevel, setDetailLevel] = useState<NutritionDetailLevel>(defaultDetailLevel);

  /**
   * Calculate totals from a list of food items
   */
  const calculateTotals = useCallback((items: AnalyzedFoodItem[]) => {
    return items.reduce(
      (acc, item) => {
        const mult = item.servingMultiplier || 1;
        return {
          calories: acc.calories + Math.round(item.calories * mult),
          protein: acc.protein + Math.round(item.protein * mult * 10) / 10,
          carbs: acc.carbs + Math.round(item.carbs * mult * 10) / 10,
          fat: acc.fat + Math.round(item.fat * mult * 10) / 10,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, []);

  /**
   * Apply serving multiplier to scale nutrition values
   */
  const applyMultiplier = useCallback(
    (item: AnalyzedFoodItem, multiplier: number): AnalyzedFoodItem => {
      return {
        ...item,
        calories: Math.round(item.calories * multiplier),
        protein: Math.round(item.protein * multiplier * 10) / 10,
        carbs: Math.round(item.carbs * multiplier * 10) / 10,
        fat: Math.round(item.fat * multiplier * 10) / 10,
        fiber: Math.round(item.fiber * multiplier * 10) / 10,
        sugar: Math.round(item.sugar * multiplier * 10) / 10,
        sodium: Math.round(item.sodium * multiplier),
        servingMultiplier: multiplier,
      };
    },
    []
  );

  /**
   * Parse a nutrition value with appropriate rounding
   */
  const parseNutrientValue = (value: unknown, decimals: number = 1): number | undefined => {
    if (value === undefined || value === null) return undefined;
    const num = Number(value);
    if (isNaN(num)) return undefined;
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  };

  /**
   * Normalize API response to our standard format
   * Handles all nutrition tiers (essential, extended, complete)
   */
  const normalizeResult = useCallback(
    (apiResult: Record<string, unknown>): FoodAnalysisResult => {
      const items = ((apiResult.items as Record<string, unknown>[]) || []).map(
        (item): AnalyzedFoodItem => {
          // Essential fields (always present)
          const baseFields: AnalyzedFoodItem = {
            name: String(item.name || 'Unknown'),
            quantity: Number(item.quantity) || 1,
            unit: String(item.unit || 'serving'),
            calories: Math.round(Number(item.calories) || 0),
            protein: parseNutrientValue(item.protein) || 0,
            carbs: parseNutrientValue(item.carbs) || 0,
            fat: parseNutrientValue(item.fat) || 0,
            fiber: parseNutrientValue(item.fiber) || 0,
            sugar: parseNutrientValue(item.sugar) || 0,
            sodium: Math.round(Number(item.sodium) || 0),
            servingMultiplier: Number(item.servingMultiplier) || 1,
            confidence: Math.min(1, Math.max(0, Number(item.confidence) || 0.8)),
          };

          // Extended fields (if present)
          if (item.saturatedFat !== undefined) {
            baseFields.saturatedFat = parseNutrientValue(item.saturatedFat) || 0;
          }
          if (item.transFat !== undefined) {
            baseFields.transFat = parseNutrientValue(item.transFat) || 0;
          }
          if (item.cholesterol !== undefined) {
            baseFields.cholesterol = Math.round(Number(item.cholesterol) || 0);
          }
          if (item.potassium !== undefined) {
            baseFields.potassium = Math.round(Number(item.potassium) || 0);
          }
          if (item.calcium !== undefined) {
            baseFields.calcium = Math.round(Number(item.calcium) || 0);
          }
          if (item.iron !== undefined) {
            baseFields.iron = parseNutrientValue(item.iron) || 0;
          }
          if (item.magnesium !== undefined) {
            baseFields.magnesium = Math.round(Number(item.magnesium) || 0);
          }

          // Complete fields (if present)
          // Fat details
          if (item.monounsaturatedFat !== undefined) {
            baseFields.monounsaturatedFat = parseNutrientValue(item.monounsaturatedFat);
          }
          if (item.polyunsaturatedFat !== undefined) {
            baseFields.polyunsaturatedFat = parseNutrientValue(item.polyunsaturatedFat);
          }

          // Vitamins (fat-soluble)
          if (item.vitaminA !== undefined) baseFields.vitaminA = parseNutrientValue(item.vitaminA);
          if (item.vitaminD !== undefined) baseFields.vitaminD = parseNutrientValue(item.vitaminD);
          if (item.vitaminE !== undefined) baseFields.vitaminE = parseNutrientValue(item.vitaminE);
          if (item.vitaminK !== undefined) baseFields.vitaminK = parseNutrientValue(item.vitaminK);

          // Vitamins (water-soluble)
          if (item.vitaminC !== undefined) baseFields.vitaminC = parseNutrientValue(item.vitaminC);
          if (item.thiamin !== undefined) baseFields.thiamin = parseNutrientValue(item.thiamin, 2);
          if (item.riboflavin !== undefined) baseFields.riboflavin = parseNutrientValue(item.riboflavin, 2);
          if (item.niacin !== undefined) baseFields.niacin = parseNutrientValue(item.niacin);
          if (item.vitaminB6 !== undefined) baseFields.vitaminB6 = parseNutrientValue(item.vitaminB6, 2);
          if (item.folate !== undefined) baseFields.folate = parseNutrientValue(item.folate);
          if (item.vitaminB12 !== undefined) baseFields.vitaminB12 = parseNutrientValue(item.vitaminB12, 2);
          if (item.choline !== undefined) baseFields.choline = parseNutrientValue(item.choline);

          // Trace minerals
          if (item.zinc !== undefined) baseFields.zinc = parseNutrientValue(item.zinc);
          if (item.phosphorus !== undefined) baseFields.phosphorus = parseNutrientValue(item.phosphorus);
          if (item.selenium !== undefined) baseFields.selenium = parseNutrientValue(item.selenium);
          if (item.copper !== undefined) baseFields.copper = parseNutrientValue(item.copper, 2);
          if (item.manganese !== undefined) baseFields.manganese = parseNutrientValue(item.manganese, 2);

          // Other
          if (item.caffeine !== undefined) baseFields.caffeine = parseNutrientValue(item.caffeine);
          if (item.alcohol !== undefined) baseFields.alcohol = parseNutrientValue(item.alcohol);
          if (item.water !== undefined) baseFields.water = parseNutrientValue(item.water);

          return baseFields;
        }
      );

      const totals = calculateTotals(items);

      return {
        items,
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFat: totals.fat,
        mealType: ['breakfast', 'lunch', 'dinner', 'snack'].includes(
          String(apiResult.mealType)
        )
          ? (apiResult.mealType as FoodAnalysisResult['mealType'])
          : 'unknown',
        description: apiResult.description
          ? String(apiResult.description)
          : undefined,
      };
    },
    [calculateTotals]
  );

  /**
   * Analyze food from a photo (base64 encoded)
   * @param imageBase64 - Base64 encoded image
   * @param overrideDetailLevel - Override the default detail level for this call
   */
  const analyzePhoto = useCallback(
    async (imageBase64: string, overrideDetailLevel?: NutritionDetailLevel): Promise<FoodAnalysisResult> => {
      setStatus('analyzing');
      setError(null);

      const level = overrideDetailLevel ?? detailLevel;

      try {
        const functions = getFunctions();
        const analyzeFn = httpsCallable<
          { imageBase64: string; detailLevel: NutritionDetailLevel },
          Record<string, unknown>
        >(functions, 'analyzeFoodPhoto');

        // Remove data URL prefix if present
        const imageContent = imageBase64.includes(',')
          ? imageBase64.split(',')[1]
          : imageBase64;

        const response = await analyzeFn({ imageBase64: imageContent, detailLevel: level });
        const normalized = normalizeResult(response.data);

        setResult(normalized);
        setStatus('success');
        return normalized;
      } catch (err) {
        console.error('Photo analysis failed:', err);
        const mockResult = getMockPhotoResult();
        setResult(mockResult);
        setError('Analysis failed - using estimated values');
        setStatus('error');
        return mockResult;
      }
    },
    [normalizeResult, detailLevel]
  );

  /**
   * Analyze food from a text description
   * @param foodDescription - Natural language description of food
   * @param overrideDetailLevel - Override the default detail level for this call
   */
  const analyzeText = useCallback(
    async (foodDescription: string, overrideDetailLevel?: NutritionDetailLevel): Promise<FoodAnalysisResult> => {
      setStatus('analyzing');
      setError(null);

      const level = overrideDetailLevel ?? detailLevel;

      try {
        const functions = getFunctions();
        const analyzeFn = httpsCallable<
          { foodDescription: string; detailLevel: NutritionDetailLevel },
          Record<string, unknown>
        >(functions, 'analyzeFoodText');

        const response = await analyzeFn({ foodDescription, detailLevel: level });
        const normalized = normalizeResult(response.data);

        setResult(normalized);
        setStatus('success');
        return normalized;
      } catch (err) {
        console.error('Text analysis failed:', err);
        const mockResult = getMockTextResult(foodDescription);
        setResult(mockResult);
        setError('Analysis failed - using estimated values');
        setStatus('error');
        return mockResult;
      }
    },
    [normalizeResult, detailLevel]
  );

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return {
    status,
    result,
    error,
    detailLevel,
    analyzePhoto,
    analyzeText,
    applyMultiplier,
    setDetailLevel,
    reset,
    calculateTotals,
  };
}
