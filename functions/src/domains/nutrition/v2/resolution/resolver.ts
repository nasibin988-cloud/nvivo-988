/**
 * Nutrition Resolution Layer - Main Resolver
 *
 * Orchestrates the cascade: Cache → USDA → OpenFoodFacts → Edamam → AI Fallback
 * Routes to appropriate source based on food type.
 *
 * Key design principles:
 * - Whole foods → USDA (most accurate for generic foods)
 * - Branded/packaged → OpenFoodFacts (label data)
 * - Restaurant items → Edamam (130K+ restaurant items)
 * - Homemade dishes → Decompose into ingredients, resolve each
 * - Generic dishes → USDA or Edamam
 */

import type {
  NormalizedFoodDescriptor,
  CompleteNutrition,
  ResolutionResult,
  FoodType,
  IngredientDescriptor,
} from '../types';
import { searchUSDA, batchSearchUSDA } from './usdaClient';
import { searchEdamam, searchEdamamRestaurant, batchSearchEdamam } from './edamamClient';
import { searchOpenFoodFacts, getByBarcode, batchSearchOFF } from './openFoodFactsClient';
import {
  getCachedNutrition,
  setCachedNutrition,
  batchGetCachedNutrition,
  batchSetCachedNutrition,
  generateCacheKey,
} from './nutritionCache';

// Default nutrition for complete failures (should rarely happen)
const EMPTY_NUTRITION: CompleteNutrition = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
  saturatedFat: 0,
  transFat: 0,
  monounsaturatedFat: 0,
  polyunsaturatedFat: 0,
  cholesterol: 0,
  potassium: 0,
  calcium: 0,
  iron: 0,
  magnesium: 0,
  zinc: 0,
  phosphorus: 0,
  vitaminA: 0,
  vitaminD: 0,
  vitaminE: 0,
  vitaminK: 0,
  vitaminC: 0,
  thiamin: 0,
  riboflavin: 0,
  niacin: 0,
  vitaminB6: 0,
  folate: 0,
  vitaminB12: 0,
};

/**
 * Main resolution function
 * Resolves nutrition data for a normalized food descriptor
 */
export async function resolveNutrition(
  food: NormalizedFoodDescriptor
): Promise<ResolutionResult> {
  // 1. Check cache first
  const cached = await getCachedNutrition(food.name, food.estimatedGrams);
  if (cached) {
    return {
      nutrition: scaleNutrition(cached.nutrition, cached.servingGrams, food.estimatedGrams),
      source: 'cache',
      confidence: cached.confidence,
      servingGrams: food.estimatedGrams,
    };
  }

  // 2. Route based on food type
  let result: ResolutionResult | null = null;

  switch (food.foodType) {
    case 'whole_food':
      result = await resolveWholeFood(food);
      break;

    case 'branded_packaged':
      result = await resolveBrandedFood(food);
      break;

    case 'restaurant_item':
      result = await resolveRestaurantItem(food);
      break;

    case 'homemade_dish':
      result = await resolveHomemadeDish(food);
      break;

    case 'generic_dish':
      result = await resolveGenericDish(food);
      break;

    default:
      result = await resolveWithCascade(food.name, food.estimatedGrams);
  }

  // 3. Cache the result (if from a reliable source)
  if (result && result.confidence >= 0.6) {
    await setCachedNutrition(
      food.name,
      result.nutrition,
      result.source,
      result.confidence,
      result.servingGrams,
      food.foodType
    );
  }

  return result || {
    nutrition: EMPTY_NUTRITION,
    source: 'ai_fallback',
    confidence: 0,
    servingGrams: food.estimatedGrams,
  };
}

/**
 * Resolve whole food (apple, chicken breast, rice)
 * Priority: USDA → OpenFoodFacts → Edamam
 */
async function resolveWholeFood(food: NormalizedFoodDescriptor): Promise<ResolutionResult | null> {
  // USDA is best for whole foods
  const usda = await searchUSDA(food.name);
  if (usda && usda.confidence >= 0.7) {
    return {
      nutrition: scaleNutrition(usda.nutrition, usda.servingGrams, food.estimatedGrams),
      source: 'usda',
      confidence: usda.confidence,
      servingGrams: food.estimatedGrams,
    };
  }

  // Fallback to OpenFoodFacts (for some produce with barcodes)
  const off = await searchOpenFoodFacts(food.name);
  if (off && off.confidence >= 0.7) {
    return {
      nutrition: scaleNutritionPartial(off.nutrition, off.servingGrams, food.estimatedGrams),
      source: 'openfoodfacts',
      confidence: off.confidence,
      servingGrams: food.estimatedGrams,
    };
  }

  // Final fallback to Edamam
  const edamam = await searchEdamam(food.name);
  if (edamam && edamam.confidence >= 0.6) {
    return {
      nutrition: scaleNutrition(edamam.nutrition, edamam.servingGrams, food.estimatedGrams),
      source: 'edamam',
      confidence: edamam.confidence,
      servingGrams: food.estimatedGrams,
    };
  }

  return null;
}

/**
 * Resolve branded/packaged food (KIND bar, Cheerios)
 * Priority: OpenFoodFacts (barcode if available) → Edamam
 * Use hybrid approach: OFF macros + USDA micros
 */
async function resolveBrandedFood(food: NormalizedFoodDescriptor): Promise<ResolutionResult | null> {
  // Try OpenFoodFacts first (has label data)
  const off = await searchOpenFoodFacts(
    food.brandName ? `${food.brandName} ${food.name}` : food.name
  );

  if (off && off.confidence >= 0.7) {
    // OFF often has accurate macros but incomplete micros
    // Try to fill in micros from USDA for similar generic food
    const genericName = extractGenericName(food.name);
    const usdaMicros = await searchUSDA(genericName);

    if (usdaMicros && usdaMicros.confidence >= 0.6) {
      // Hybrid: OFF macros + USDA micros
      const hybridNutrition = mergeNutrition(off.nutrition, usdaMicros.nutrition, off.reliableNutrients);
      return {
        nutrition: scaleNutritionPartial(hybridNutrition, off.servingGrams, food.estimatedGrams),
        source: 'hybrid',
        confidence: Math.min(off.confidence, usdaMicros.confidence),
        servingGrams: food.estimatedGrams,
      };
    }

    // Just use OFF data
    return {
      nutrition: scaleNutritionPartial(off.nutrition, off.servingGrams, food.estimatedGrams),
      source: 'openfoodfacts',
      confidence: off.confidence,
      servingGrams: food.estimatedGrams,
    };
  }

  // Fallback to Edamam (has branded items)
  const edamam = await searchEdamam(
    food.brandName ? `${food.brandName} ${food.name}` : food.name
  );
  if (edamam && edamam.confidence >= 0.6) {
    return {
      nutrition: scaleNutrition(edamam.nutrition, edamam.servingGrams, food.estimatedGrams),
      source: 'edamam',
      confidence: edamam.confidence,
      servingGrams: food.estimatedGrams,
    };
  }

  return null;
}

/**
 * Resolve restaurant item (Big Mac, Chipotle Burrito)
 * Priority: Edamam (best for restaurants) → cascade
 */
async function resolveRestaurantItem(food: NormalizedFoodDescriptor): Promise<ResolutionResult | null> {
  console.log('Resolving restaurant item:', food.name, 'from', food.restaurantName);
  // Edamam is best for restaurant items
  const edamam = await searchEdamamRestaurant(food.name, food.restaurantName);
  console.log('Edamam result:', edamam ? `found with ${edamam.confidence} confidence` : 'not found');
  if (edamam && edamam.confidence >= 0.7) {
    return {
      nutrition: scaleNutrition(edamam.nutrition, edamam.servingGrams, food.estimatedGrams),
      source: 'edamam',
      confidence: edamam.confidence,
      servingGrams: food.estimatedGrams,
    };
  }

  // Try OpenFoodFacts (some chains submit data)
  const query = food.restaurantName
    ? `${food.restaurantName} ${food.name}`
    : food.name;
  const off = await searchOpenFoodFacts(query);
  if (off && off.confidence >= 0.7) {
    return {
      nutrition: scaleNutritionPartial(off.nutrition, off.servingGrams, food.estimatedGrams),
      source: 'openfoodfacts',
      confidence: off.confidence,
      servingGrams: food.estimatedGrams,
    };
  }

  // Fall back to treating as generic dish
  return resolveGenericDish(food);
}

/**
 * Resolve homemade dish by decomposing into ingredients
 */
async function resolveHomemadeDish(food: NormalizedFoodDescriptor): Promise<ResolutionResult | null> {
  if (!food.ingredients || food.ingredients.length === 0) {
    // No ingredients provided, treat as generic dish
    return resolveGenericDish(food);
  }

  // Resolve each ingredient
  const ingredientResults = await batchResolveIngredients(food.ingredients);

  if (ingredientResults.length === 0) {
    return null;
  }

  // Sum up nutrition from all ingredients
  const totalNutrition = sumNutrition(ingredientResults.map(r => r.nutrition));
  const avgConfidence = ingredientResults.reduce((sum, r) => sum + r.confidence, 0) / ingredientResults.length;

  return {
    nutrition: totalNutrition,
    source: 'decomposed',
    confidence: avgConfidence * 0.9, // Slight penalty for composition uncertainty
    servingGrams: food.estimatedGrams,
  };
}

/**
 * Resolve generic dish (cheeseburger, pasta)
 * Priority: USDA → Edamam
 */
async function resolveGenericDish(food: NormalizedFoodDescriptor): Promise<ResolutionResult | null> {
  // USDA has many prepared foods
  const usda = await searchUSDA(food.name);
  if (usda && usda.confidence >= 0.7) {
    return {
      nutrition: scaleNutrition(usda.nutrition, usda.servingGrams, food.estimatedGrams),
      source: 'usda',
      confidence: usda.confidence,
      servingGrams: food.estimatedGrams,
    };
  }

  // Edamam as fallback
  const edamam = await searchEdamam(food.name);
  if (edamam && edamam.confidence >= 0.6) {
    return {
      nutrition: scaleNutrition(edamam.nutrition, edamam.servingGrams, food.estimatedGrams),
      source: 'edamam',
      confidence: edamam.confidence,
      servingGrams: food.estimatedGrams,
    };
  }

  return null;
}

/**
 * Generic cascade fallback
 */
async function resolveWithCascade(
  query: string,
  targetGrams: number
): Promise<ResolutionResult | null> {
  // Try USDA
  const usda = await searchUSDA(query);
  if (usda && usda.confidence >= 0.7) {
    return {
      nutrition: scaleNutrition(usda.nutrition, usda.servingGrams, targetGrams),
      source: 'usda',
      confidence: usda.confidence,
      servingGrams: targetGrams,
    };
  }

  // Try OpenFoodFacts
  const off = await searchOpenFoodFacts(query);
  if (off && off.confidence >= 0.7) {
    return {
      nutrition: scaleNutritionPartial(off.nutrition, off.servingGrams, targetGrams),
      source: 'openfoodfacts',
      confidence: off.confidence,
      servingGrams: targetGrams,
    };
  }

  // Try Edamam
  const edamam = await searchEdamam(query);
  if (edamam && edamam.confidence >= 0.6) {
    return {
      nutrition: scaleNutrition(edamam.nutrition, edamam.servingGrams, targetGrams),
      source: 'edamam',
      confidence: edamam.confidence,
      servingGrams: targetGrams,
    };
  }

  return null;
}

/**
 * Batch resolve multiple foods
 * More efficient than individual calls - uses parallel API requests
 */
export async function batchResolveNutrition(
  foods: NormalizedFoodDescriptor[]
): Promise<Map<string, ResolutionResult>> {
  console.log('Batch resolving', foods.length, 'foods');
  console.log('Food types:', foods.map(f => `${f.name} (${f.foodType})`).join(', '));
  const results = new Map<string, ResolutionResult>();

  if (foods.length === 0) return results;

  // 1. Check cache for all foods
  const cacheKeys = foods.map(f => ({
    name: f.name,
    servingGrams: f.estimatedGrams,
  }));
  const cached = await batchGetCachedNutrition(cacheKeys);

  // Separate cached and uncached
  const uncached: NormalizedFoodDescriptor[] = [];
  for (const food of foods) {
    const key = generateCacheKey(food.name, food.estimatedGrams);
    const cachedResult = cached.get(key);

    if (cachedResult) {
      results.set(food.name, {
        nutrition: scaleNutrition(cachedResult.nutrition, cachedResult.servingGrams, food.estimatedGrams),
        source: 'cache',
        confidence: cachedResult.confidence,
        servingGrams: food.estimatedGrams,
      });
    } else {
      uncached.push(food);
    }
  }

  if (uncached.length === 0) return results;

  // 2. Batch resolve by food type
  const wholeFoods = uncached.filter(f => f.foodType === 'whole_food');
  const brandedFoods = uncached.filter(f => f.foodType === 'branded_packaged');
  const restaurantItems = uncached.filter(f => f.foodType === 'restaurant_item');
  const otherFoods = uncached.filter(f =>
    !['whole_food', 'branded_packaged', 'restaurant_item'].includes(f.foodType)
  );

  // Parallel batch searches
  const [usdaResults, offResults, edamamResults] = await Promise.all([
    batchSearchUSDA(wholeFoods.map(f => f.name)),
    batchSearchOFF(brandedFoods.map(f => f.brandName ? `${f.brandName} ${f.name}` : f.name)),
    batchSearchEdamam(restaurantItems.map(f =>
      f.restaurantName ? `${f.restaurantName} ${f.name}` : f.name
    )),
  ]);

  // Process whole foods
  for (const food of wholeFoods) {
    const usda = usdaResults.get(food.name.toLowerCase());
    if (usda) {
      results.set(food.name, {
        nutrition: scaleNutrition(usda.nutrition, usda.servingGrams, food.estimatedGrams),
        source: 'usda',
        confidence: usda.confidence,
        servingGrams: food.estimatedGrams,
      });
    }
  }

  // Process branded foods
  for (const food of brandedFoods) {
    const key = (food.brandName ? `${food.brandName} ${food.name}` : food.name).toLowerCase();
    const off = offResults.get(key);
    if (off) {
      results.set(food.name, {
        nutrition: scaleNutritionPartial(off.nutrition, off.servingGrams, food.estimatedGrams),
        source: 'openfoodfacts',
        confidence: off.confidence,
        servingGrams: food.estimatedGrams,
      });
    }
  }

  // Process restaurant items
  for (const food of restaurantItems) {
    const key = (food.restaurantName ? `${food.restaurantName} ${food.name}` : food.name).toLowerCase();
    const edamam = edamamResults.get(key);
    if (edamam) {
      results.set(food.name, {
        nutrition: scaleNutrition(edamam.nutrition, edamam.servingGrams, food.estimatedGrams),
        source: 'edamam',
        confidence: edamam.confidence,
        servingGrams: food.estimatedGrams,
      });
    }
  }

  // Handle remaining uncached foods individually
  const stillUnresolved = [...wholeFoods, ...brandedFoods, ...restaurantItems, ...otherFoods]
    .filter(f => !results.has(f.name));

  for (const food of stillUnresolved) {
    const result = await resolveNutrition(food);
    results.set(food.name, result);
  }

  // 3. Cache new results
  const toCache = Array.from(results.entries())
    .filter(([name, result]) => {
      const food = foods.find(f => f.name === name);
      return food && result.source !== 'cache' && result.confidence >= 0.6;
    })
    .map(([name, result]) => {
      const food = foods.find(f => f.name === name)!;
      return {
        foodName: name,
        nutrition: result.nutrition,
        source: result.source,
        confidence: result.confidence,
        servingGrams: result.servingGrams,
        foodType: food.foodType,
      };
    });

  if (toCache.length > 0) {
    await batchSetCachedNutrition(toCache);
  }

  return results;
}

/**
 * Resolve ingredients for homemade dishes
 */
async function batchResolveIngredients(
  ingredients: IngredientDescriptor[]
): Promise<Array<{ nutrition: CompleteNutrition; confidence: number }>> {
  const results: Array<{ nutrition: CompleteNutrition; confidence: number }> = [];

  // Convert ingredients to NormalizedFoodDescriptors
  const foods: NormalizedFoodDescriptor[] = ingredients.map(ing => ({
    name: ing.name,
    quantity: 1,
    unit: 'g',
    estimatedGrams: ing.estimatedGrams,
    foodType: 'whole_food' as FoodType, // Assume ingredients are whole foods
    confidence: 0.8,
  }));

  const resolved = await batchResolveNutrition(foods);

  for (const ing of ingredients) {
    const result = resolved.get(ing.name);
    if (result && result.confidence >= 0.5) {
      results.push({
        nutrition: result.nutrition,
        confidence: result.confidence,
      });
    }
  }

  return results;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Scale nutrition from source serving to target serving
 */
function scaleNutrition(
  nutrition: CompleteNutrition,
  sourceGrams: number,
  targetGrams: number
): CompleteNutrition {
  if (sourceGrams === targetGrams || sourceGrams === 0) {
    return { ...nutrition };
  }

  const scale = targetGrams / sourceGrams;
  const scaled: CompleteNutrition = { ...EMPTY_NUTRITION };

  for (const key of Object.keys(nutrition) as (keyof CompleteNutrition)[]) {
    const value = nutrition[key];
    if (typeof value === 'number') {
      (scaled[key] as number) = roundNutrient(value * scale, key);
    }
  }

  return scaled;
}

/**
 * Scale partial nutrition (for OpenFoodFacts which may have incomplete data)
 */
function scaleNutritionPartial(
  nutrition: Partial<CompleteNutrition>,
  sourceGrams: number,
  targetGrams: number
): CompleteNutrition {
  const complete: CompleteNutrition = { ...EMPTY_NUTRITION, ...nutrition };
  return scaleNutrition(complete, sourceGrams, targetGrams);
}

/**
 * Sum nutrition from multiple sources
 */
function sumNutrition(nutritions: CompleteNutrition[]): CompleteNutrition {
  const total: CompleteNutrition = { ...EMPTY_NUTRITION };

  for (const nutrition of nutritions) {
    for (const key of Object.keys(total) as (keyof CompleteNutrition)[]) {
      const value = nutrition[key];
      if (typeof value === 'number') {
        (total[key] as number) += value;
      }
    }
  }

  // Round final values
  for (const key of Object.keys(total) as (keyof CompleteNutrition)[]) {
    const value = total[key];
    if (typeof value === 'number') {
      (total[key] as number) = roundNutrient(value, key);
    }
  }

  return total;
}

/**
 * Merge nutrition from two sources
 * Uses primary for specified nutrients, fills rest from secondary
 */
function mergeNutrition(
  primary: Partial<CompleteNutrition>,
  secondary: CompleteNutrition,
  primaryNutrients: (keyof CompleteNutrition)[]
): Partial<CompleteNutrition> {
  const merged: Partial<CompleteNutrition> = { ...secondary };

  // Override with primary values for reliable nutrients
  for (const key of primaryNutrients) {
    if (primary[key] !== undefined) {
      (merged[key] as number) = primary[key] as number;
    }
  }

  return merged;
}

/**
 * Extract generic food name from branded product
 * e.g., "KIND Dark Chocolate Nuts Bar" → "chocolate nut bar"
 */
function extractGenericName(name: string): string {
  // Remove common brand indicators
  const brandPatterns = [
    /^(KIND|Clif|Luna|RXBar|Quest|ThinkThin|Nature Valley|Kashi)\s+/i,
    /\s+(bar|bars)$/i,
  ];

  let generic = name;
  for (const pattern of brandPatterns) {
    generic = generic.replace(pattern, ' ');
  }

  return generic.trim().toLowerCase();
}

/**
 * Round nutrient value appropriately
 */
function roundNutrient(value: number, key: keyof CompleteNutrition): number {
  if (['calories', 'sodium', 'potassium', 'calcium', 'cholesterol', 'phosphorus', 'magnesium'].includes(key)) {
    return Math.round(value);
  }
  if (['thiamin', 'riboflavin', 'vitaminB6', 'vitaminB12', 'vitaminD', 'vitaminK'].includes(key)) {
    return Math.round(value * 100) / 100;
  }
  return Math.round(value * 10) / 10;
}

/**
 * Resolve by barcode (most accurate for packaged foods)
 */
export async function resolveByBarcode(barcode: string): Promise<ResolutionResult | null> {
  const off = await getByBarcode(barcode);
  if (!off) return null;

  return {
    nutrition: scaleNutritionPartial(off.nutrition, off.servingGrams, off.servingGrams),
    source: 'openfoodfacts',
    confidence: off.confidence,
    servingGrams: off.servingGrams,
  };
}
