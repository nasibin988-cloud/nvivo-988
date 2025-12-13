"use strict";
/**
 * Nutrition Analysis Pipeline V2
 *
 * Orchestrates the full analysis flow:
 * 1. Identification (AI) → NormalizedFoodDescriptor
 * 2. Resolution (Databases) → CompleteNutrition
 * 3. GI Lookup (Pre-loaded) → GIResult
 * 4. Grading (Deterministic) → CompleteGradingResult
 * 5. AI Insight (GPT-4o-mini) → FoodInsight
 * 6. Assembled → AnalyzedFoodV2
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzePhotoV2 = analyzePhotoV2;
exports.analyzePhotoUrlV2 = analyzePhotoUrlV2;
exports.analyzeTextV2 = analyzeTextV2;
exports.analyzeMenuItemsV2 = analyzeMenuItemsV2;
exports.scanAndAnalyzeMenuV2 = scanAndAnalyzeMenuV2;
exports.compareFoodsV2 = compareFoodsV2;
exports.analyzeSingleFoodV2 = analyzeSingleFoodV2;
const uuid_1 = require("uuid");
const identification_1 = require("./identification");
const resolution_1 = require("./resolution");
const gi_1 = require("./gi");
const grading_1 = require("./grading");
// Version for tracking
const PIPELINE_VERSION = '2.0.0';
const DEFAULT_OPTIONS = {
    userFocus: 'balanced',
    generateInsights: true,
};
/**
 * Analyze food from photo
 * Full pipeline: Photo → AI ID → DB Resolution → GI → Grade → Insight
 */
async function analyzePhotoV2(imageBase64, mimeType = 'image/jpeg', options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    // 1. AI Identification
    const identified = await (0, identification_1.identifyFoodsFromPhoto)(imageBase64, mimeType);
    // 2. Process identified foods through pipeline
    return processIdentifiedFoods(identified.items, identified.mealType, opts);
}
/**
 * Analyze food from photo URL
 */
async function analyzePhotoUrlV2(imageUrl, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const identified = await (0, identification_1.identifyFoodsFromPhotoUrl)(imageUrl);
    return processIdentifiedFoods(identified.items, identified.mealType, opts);
}
/**
 * Analyze food from text description
 */
async function analyzeTextV2(text, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const parsed = await (0, identification_1.parseFoodText)(text);
    return processIdentifiedFoods(parsed.items, parsed.mealType, opts);
}
/**
 * Analyze menu items (from menu scan)
 */
async function analyzeMenuItemsV2(menuScan, selectedItemIds, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const selectedItems = menuScan.menuItems.filter(item => selectedItemIds.includes(item.id));
    if (selectedItems.length === 0) {
        throw new Error('No items selected for analysis');
    }
    const descriptors = (0, identification_1.menuItemsToDescriptors)(selectedItems, menuScan.restaurant.name);
    return processIdentifiedFoods(descriptors, 'unknown', opts);
}
/**
 * Full menu scan and analysis
 */
async function scanAndAnalyzeMenuV2(imageBase64, selectedItemIds, mimeType = 'image/jpeg', options = {}) {
    const menuScan = await (0, identification_1.scanMenu)(imageBase64, mimeType);
    const analysis = await analyzeMenuItemsV2(menuScan, selectedItemIds, options);
    return { menuScan, analysis };
}
/**
 * Compare multiple foods
 */
async function compareFoodsV2(foods, userFocus = 'balanced', includeAIInsights = false) {
    // Analyze each food
    const analyzedFoods = [];
    for (const food of foods) {
        let result;
        if (food.text) {
            result = await analyzeTextV2(food.text);
        }
        else if (food.imageBase64) {
            result = await analyzePhotoV2(food.imageBase64);
        }
        else if (food.imageUrl) {
            result = await analyzePhotoUrlV2(food.imageUrl);
        }
        else {
            throw new Error('Each food must have text, imageBase64, or imageUrl');
        }
        // Take the first item from each analysis
        if (result.items.length > 0) {
            analyzedFoods.push(result.items[0]);
        }
    }
    if (analyzedFoods.length < 2) {
        throw new Error('Need at least 2 valid foods to compare');
    }
    // Compare with or without AI insights
    if (includeAIInsights) {
        return (0, grading_1.compareFoodsWithInsights)(analyzedFoods, userFocus);
    }
    return (0, grading_1.compareFoods)(analyzedFoods, userFocus);
}
/**
 * Process identified foods through resolution, GI, grading, and insights
 */
async function processIdentifiedFoods(descriptors, mealType, options) {
    const { userFocus, generateInsights } = options;
    if (descriptors.length === 0) {
        return {
            items: [],
            mealType,
            totals: createEmptyNutrition(),
            userFocus,
            analyzedAt: new Date(),
            version: PIPELINE_VERSION,
        };
    }
    // 2. Resolve nutrition from databases (batch for efficiency)
    const resolutionResults = await (0, resolution_1.batchResolveNutrition)(descriptors);
    // 3. Process each food (nutrition, GI, grading)
    const analyzedItems = [];
    for (const descriptor of descriptors) {
        const resolution = resolutionResults.get(descriptor.name);
        if (!resolution) {
            // Fallback to individual resolution
            const singleResolution = await (0, resolution_1.resolveNutrition)(descriptor);
            const analyzed = await processFood(descriptor, singleResolution.nutrition, singleResolution.source, singleResolution.confidence);
            analyzedItems.push(analyzed);
        }
        else {
            const analyzed = await processFood(descriptor, resolution.nutrition, resolution.source, resolution.confidence);
            analyzedItems.push(analyzed);
        }
    }
    // 4. Generate AI insights for each food (in parallel)
    if (generateInsights) {
        const insightPromises = analyzedItems.map(async (item) => {
            const insightInput = {
                foodName: item.name,
                servingDescription: `${item.quantity} ${item.unit}`,
                nutrition: item.nutrition,
                gi: item.gi,
                grading: item.grading,
                userFocus,
            };
            return (0, grading_1.generateFoodInsight)(insightInput);
        });
        const insights = await Promise.all(insightPromises);
        // Attach insights to items
        for (let i = 0; i < analyzedItems.length; i++) {
            analyzedItems[i].insight = insights[i];
        }
    }
    // 5. Calculate totals
    const totals = sumNutrition(analyzedItems.map(item => item.nutrition));
    // 6. Calculate meal GI if relevant
    let totalGI = undefined;
    const itemsWithGI = analyzedItems.filter(item => item.gi && (0, gi_1.hasRelevantGI)(item.nutrition));
    if (itemsWithGI.length > 0) {
        const mealGI = (0, gi_1.calculateMealGI)(itemsWithGI.map(item => ({
            gi: item.gi.gi,
            carbsInServing: item.nutrition.carbs,
        })));
        const mealGL = (0, gi_1.calculateMealGL)(itemsWithGI.map(item => ({
            gl: item.gi.gl,
        })));
        totalGI = {
            gi: mealGI.gi,
            gl: mealGL.gl,
            giBand: mealGI.giBand,
            glBand: mealGL.glBand,
            source: 'exact',
            confidence: 0.8,
        };
    }
    return {
        items: analyzedItems,
        mealType,
        totals,
        totalGI,
        userFocus,
        analyzedAt: new Date(),
        version: PIPELINE_VERSION,
    };
}
/**
 * Process a single food through GI and grading
 */
async function processFood(descriptor, nutrition, source, confidence) {
    var _a;
    // Lookup GI
    let giResult = undefined;
    if ((0, gi_1.hasRelevantGI)(nutrition)) {
        giResult = (0, gi_1.lookupGI)(descriptor.name, nutrition, descriptor.estimatedGrams);
    }
    // Enrich nutrition with GI
    const enrichedNutrition = {
        ...nutrition,
        gi: giResult === null || giResult === void 0 ? void 0 : giResult.gi,
        gl: giResult === null || giResult === void 0 ? void 0 : giResult.gl,
        giBand: giResult === null || giResult === void 0 ? void 0 : giResult.giBand,
        glBand: giResult === null || giResult === void 0 ? void 0 : giResult.glBand,
    };
    // Grade nutrition
    const grading = (0, grading_1.gradeNutritionWithGI)(enrichedNutrition, descriptor.estimatedGrams, giResult, descriptor.foodType, descriptor.foodType === 'whole_food' && /juice|milk|tea|coffee|drink|soda/i.test(descriptor.name));
    return {
        id: (0, uuid_1.v4)(),
        name: descriptor.name,
        quantity: descriptor.quantity,
        unit: descriptor.unit,
        estimatedGrams: descriptor.estimatedGrams,
        foodType: descriptor.foodType,
        nutrition: enrichedNutrition,
        nutritionSource: source,
        nutritionConfidence: confidence,
        gi: giResult,
        grading,
        restaurantName: descriptor.restaurantName,
        brandName: descriptor.brandName,
        ingredients: (_a = descriptor.ingredients) === null || _a === void 0 ? void 0 : _a.map(ing => ({
            name: ing.name,
            estimatedGrams: ing.estimatedGrams,
            nutrition: createEmptyNutrition(), // Would need separate resolution
            source: 'decomposed',
        })),
    };
}
/**
 * Sum nutrition from multiple items
 */
function sumNutrition(nutritions) {
    const total = createEmptyNutrition();
    for (const n of nutritions) {
        for (const key of Object.keys(total)) {
            const value = n[key];
            if (typeof value === 'number') {
                total[key] += value;
            }
        }
    }
    // Round the totals
    for (const key of Object.keys(total)) {
        const value = total[key];
        if (typeof value === 'number') {
            if (['calories', 'sodium', 'potassium', 'calcium', 'cholesterol', 'phosphorus', 'magnesium'].includes(key)) {
                total[key] = Math.round(value);
            }
            else {
                total[key] = Math.round(value * 10) / 10;
            }
        }
    }
    return total;
}
/**
 * Create empty nutrition object
 */
function createEmptyNutrition() {
    return {
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
}
/**
 * Analyze single food directly by name (for simple cases)
 */
async function analyzeSingleFoodV2(foodName, quantity = 1, unit = 'serving', estimatedGrams = 100, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const descriptor = {
        name: foodName,
        quantity,
        unit,
        estimatedGrams,
        foodType: 'whole_food', // Default
        confidence: 0.9,
    };
    const resolution = await (0, resolution_1.resolveNutrition)(descriptor);
    const analyzed = await processFood(descriptor, resolution.nutrition, resolution.source, resolution.confidence);
    // Generate insight if enabled
    if (opts.generateInsights) {
        const insightInput = {
            foodName: analyzed.name,
            servingDescription: `${analyzed.quantity} ${analyzed.unit}`,
            nutrition: analyzed.nutrition,
            gi: analyzed.gi,
            grading: analyzed.grading,
            userFocus: opts.userFocus,
        };
        analyzed.insight = await (0, grading_1.generateFoodInsight)(insightInput);
    }
    return analyzed;
}
//# sourceMappingURL=pipeline.js.map