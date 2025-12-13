"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveNutrition = resolveNutrition;
exports.batchResolveNutrition = batchResolveNutrition;
exports.resolveByBarcode = resolveByBarcode;
const usdaClient_1 = require("./usdaClient");
const edamamClient_1 = require("./edamamClient");
const openFoodFactsClient_1 = require("./openFoodFactsClient");
const nutritionCache_1 = require("./nutritionCache");
// Default nutrition for complete failures (should rarely happen)
const EMPTY_NUTRITION = {
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
async function resolveNutrition(food) {
    // 1. Check cache first
    const cached = await (0, nutritionCache_1.getCachedNutrition)(food.name, food.estimatedGrams);
    if (cached) {
        return {
            nutrition: scaleNutrition(cached.nutrition, cached.servingGrams, food.estimatedGrams),
            source: 'cache',
            confidence: cached.confidence,
            servingGrams: food.estimatedGrams,
        };
    }
    // 2. Route based on food type
    let result = null;
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
        await (0, nutritionCache_1.setCachedNutrition)(food.name, result.nutrition, result.source, result.confidence, result.servingGrams, food.foodType);
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
async function resolveWholeFood(food) {
    // USDA is best for whole foods
    const usda = await (0, usdaClient_1.searchUSDA)(food.name);
    if (usda && usda.confidence >= 0.7) {
        return {
            nutrition: scaleNutrition(usda.nutrition, usda.servingGrams, food.estimatedGrams),
            source: 'usda',
            confidence: usda.confidence,
            servingGrams: food.estimatedGrams,
        };
    }
    // Fallback to OpenFoodFacts (for some produce with barcodes)
    const off = await (0, openFoodFactsClient_1.searchOpenFoodFacts)(food.name);
    if (off && off.confidence >= 0.7) {
        return {
            nutrition: scaleNutritionPartial(off.nutrition, off.servingGrams, food.estimatedGrams),
            source: 'openfoodfacts',
            confidence: off.confidence,
            servingGrams: food.estimatedGrams,
        };
    }
    // Final fallback to Edamam
    const edamam = await (0, edamamClient_1.searchEdamam)(food.name);
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
async function resolveBrandedFood(food) {
    // Try OpenFoodFacts first (has label data)
    const off = await (0, openFoodFactsClient_1.searchOpenFoodFacts)(food.brandName ? `${food.brandName} ${food.name}` : food.name);
    if (off && off.confidence >= 0.7) {
        // OFF often has accurate macros but incomplete micros
        // Try to fill in micros from USDA for similar generic food
        const genericName = extractGenericName(food.name);
        const usdaMicros = await (0, usdaClient_1.searchUSDA)(genericName);
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
    const edamam = await (0, edamamClient_1.searchEdamam)(food.brandName ? `${food.brandName} ${food.name}` : food.name);
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
async function resolveRestaurantItem(food) {
    console.log('Resolving restaurant item:', food.name, 'from', food.restaurantName);
    // Edamam is best for restaurant items
    const edamam = await (0, edamamClient_1.searchEdamamRestaurant)(food.name, food.restaurantName);
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
    const off = await (0, openFoodFactsClient_1.searchOpenFoodFacts)(query);
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
async function resolveHomemadeDish(food) {
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
async function resolveGenericDish(food) {
    // USDA has many prepared foods
    const usda = await (0, usdaClient_1.searchUSDA)(food.name);
    if (usda && usda.confidence >= 0.7) {
        return {
            nutrition: scaleNutrition(usda.nutrition, usda.servingGrams, food.estimatedGrams),
            source: 'usda',
            confidence: usda.confidence,
            servingGrams: food.estimatedGrams,
        };
    }
    // Edamam as fallback
    const edamam = await (0, edamamClient_1.searchEdamam)(food.name);
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
async function resolveWithCascade(query, targetGrams) {
    // Try USDA
    const usda = await (0, usdaClient_1.searchUSDA)(query);
    if (usda && usda.confidence >= 0.7) {
        return {
            nutrition: scaleNutrition(usda.nutrition, usda.servingGrams, targetGrams),
            source: 'usda',
            confidence: usda.confidence,
            servingGrams: targetGrams,
        };
    }
    // Try OpenFoodFacts
    const off = await (0, openFoodFactsClient_1.searchOpenFoodFacts)(query);
    if (off && off.confidence >= 0.7) {
        return {
            nutrition: scaleNutritionPartial(off.nutrition, off.servingGrams, targetGrams),
            source: 'openfoodfacts',
            confidence: off.confidence,
            servingGrams: targetGrams,
        };
    }
    // Try Edamam
    const edamam = await (0, edamamClient_1.searchEdamam)(query);
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
async function batchResolveNutrition(foods) {
    console.log('Batch resolving', foods.length, 'foods');
    console.log('Food types:', foods.map(f => `${f.name} (${f.foodType})`).join(', '));
    const results = new Map();
    if (foods.length === 0)
        return results;
    // 1. Check cache for all foods
    const cacheKeys = foods.map(f => ({
        name: f.name,
        servingGrams: f.estimatedGrams,
    }));
    const cached = await (0, nutritionCache_1.batchGetCachedNutrition)(cacheKeys);
    // Separate cached and uncached
    const uncached = [];
    for (const food of foods) {
        const key = (0, nutritionCache_1.generateCacheKey)(food.name, food.estimatedGrams);
        const cachedResult = cached.get(key);
        if (cachedResult) {
            results.set(food.name, {
                nutrition: scaleNutrition(cachedResult.nutrition, cachedResult.servingGrams, food.estimatedGrams),
                source: 'cache',
                confidence: cachedResult.confidence,
                servingGrams: food.estimatedGrams,
            });
        }
        else {
            uncached.push(food);
        }
    }
    if (uncached.length === 0)
        return results;
    // 2. Batch resolve by food type
    const wholeFoods = uncached.filter(f => f.foodType === 'whole_food');
    const brandedFoods = uncached.filter(f => f.foodType === 'branded_packaged');
    const restaurantItems = uncached.filter(f => f.foodType === 'restaurant_item');
    const otherFoods = uncached.filter(f => !['whole_food', 'branded_packaged', 'restaurant_item'].includes(f.foodType));
    // Parallel batch searches
    const [usdaResults, offResults, edamamResults] = await Promise.all([
        (0, usdaClient_1.batchSearchUSDA)(wholeFoods.map(f => f.name)),
        (0, openFoodFactsClient_1.batchSearchOFF)(brandedFoods.map(f => f.brandName ? `${f.brandName} ${f.name}` : f.name)),
        (0, edamamClient_1.batchSearchEdamam)(restaurantItems.map(f => f.restaurantName ? `${f.restaurantName} ${f.name}` : f.name)),
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
        const food = foods.find(f => f.name === name);
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
        await (0, nutritionCache_1.batchSetCachedNutrition)(toCache);
    }
    return results;
}
/**
 * Resolve ingredients for homemade dishes
 */
async function batchResolveIngredients(ingredients) {
    const results = [];
    // Convert ingredients to NormalizedFoodDescriptors
    const foods = ingredients.map(ing => ({
        name: ing.name,
        quantity: 1,
        unit: 'g',
        estimatedGrams: ing.estimatedGrams,
        foodType: 'whole_food', // Assume ingredients are whole foods
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
function scaleNutrition(nutrition, sourceGrams, targetGrams) {
    if (sourceGrams === targetGrams || sourceGrams === 0) {
        return { ...nutrition };
    }
    const scale = targetGrams / sourceGrams;
    const scaled = { ...EMPTY_NUTRITION };
    for (const key of Object.keys(nutrition)) {
        const value = nutrition[key];
        if (typeof value === 'number') {
            scaled[key] = roundNutrient(value * scale, key);
        }
    }
    return scaled;
}
/**
 * Scale partial nutrition (for OpenFoodFacts which may have incomplete data)
 */
function scaleNutritionPartial(nutrition, sourceGrams, targetGrams) {
    const complete = { ...EMPTY_NUTRITION, ...nutrition };
    return scaleNutrition(complete, sourceGrams, targetGrams);
}
/**
 * Sum nutrition from multiple sources
 */
function sumNutrition(nutritions) {
    const total = { ...EMPTY_NUTRITION };
    for (const nutrition of nutritions) {
        for (const key of Object.keys(total)) {
            const value = nutrition[key];
            if (typeof value === 'number') {
                total[key] += value;
            }
        }
    }
    // Round final values
    for (const key of Object.keys(total)) {
        const value = total[key];
        if (typeof value === 'number') {
            total[key] = roundNutrient(value, key);
        }
    }
    return total;
}
/**
 * Merge nutrition from two sources
 * Uses primary for specified nutrients, fills rest from secondary
 */
function mergeNutrition(primary, secondary, primaryNutrients) {
    const merged = { ...secondary };
    // Override with primary values for reliable nutrients
    for (const key of primaryNutrients) {
        if (primary[key] !== undefined) {
            merged[key] = primary[key];
        }
    }
    return merged;
}
/**
 * Extract generic food name from branded product
 * e.g., "KIND Dark Chocolate Nuts Bar" → "chocolate nut bar"
 */
function extractGenericName(name) {
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
function roundNutrient(value, key) {
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
async function resolveByBarcode(barcode) {
    const off = await (0, openFoodFactsClient_1.getByBarcode)(barcode);
    if (!off)
        return null;
    return {
        nutrition: scaleNutritionPartial(off.nutrition, off.servingGrams, off.servingGrams),
        source: 'openfoodfacts',
        confidence: off.confidence,
        servingGrams: off.servingGrams,
    };
}
//# sourceMappingURL=resolver.js.map