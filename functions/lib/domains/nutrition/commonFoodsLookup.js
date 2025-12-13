"use strict";
/**
 * Common Foods Lookup - Pre-computed nutrition data for frequently logged foods
 *
 * This module provides instant nutrition lookup for common foods without any AI call.
 * Data is sourced from USDA FoodData Central and covers ~200 most commonly logged foods.
 *
 * Benefits:
 * - Zero cost (no AI call)
 * - Instant response
 * - Consistent, accurate USDA data
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeForLookup = normalizeForLookup;
exports.getCommonFood = getCommonFood;
exports.hasCommonFood = hasCommonFood;
exports.getCommonFoodKeys = getCommonFoodKeys;
const foodIntelligenceLookup_1 = require("./foodIntelligenceLookup");
// Import common foods data
const common_foods_json_1 = __importDefault(require("./data/common_foods.json"));
// Type the imported data
const COMMON_FOODS = common_foods_json_1.default;
/**
 * Normalize a food description for lookup
 * - Lowercase
 * - Remove quantities/numbers
 * - Remove common filler words
 * - Trim whitespace
 */
function normalizeForLookup(description) {
    return description
        .toLowerCase()
        .trim()
        // Remove numbers and fractions
        .replace(/\d+\/?\d*/g, '')
        // Remove common units
        .replace(/\b(cup|cups|oz|ounce|ounces|tbsp|tablespoon|tsp|teaspoon|slice|slices|piece|pieces|serving|servings|large|medium|small|g|gram|grams|ml|lb|pound|pounds)\b/gi, '')
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        .trim();
}
/**
 * Get common food data if it exists in the lookup
 * Returns null if not found
 */
function getCommonFood(normalizedDescription) {
    // Direct lookup
    const entry = COMMON_FOODS[normalizedDescription];
    if (entry) {
        return convertToFoodAnalysisResult(entry);
    }
    // Try partial matches for common variations
    const variations = generateVariations(normalizedDescription);
    for (const variation of variations) {
        const varEntry = COMMON_FOODS[variation];
        if (varEntry) {
            return convertToFoodAnalysisResult(varEntry);
        }
    }
    return null;
}
/**
 * Generate common variations of a food name
 */
function generateVariations(name) {
    const variations = [];
    // Remove "a" or "an" prefix
    if (name.startsWith('a ')) {
        variations.push(name.slice(2));
    }
    if (name.startsWith('an ')) {
        variations.push(name.slice(3));
    }
    // Add "a" or "an" prefix
    if (!name.startsWith('a ') && !name.startsWith('an ')) {
        variations.push(`a ${name}`);
        variations.push(`an ${name}`);
    }
    // Singular/plural variations
    if (name.endsWith('s')) {
        variations.push(name.slice(0, -1)); // Remove s
    }
    else {
        variations.push(`${name}s`); // Add s
    }
    // Common synonyms
    const synonyms = {
        'banana': ['banana', 'bananas'],
        'apple': ['apple', 'apples'],
        'egg': ['egg', 'eggs', 'fried egg', 'scrambled egg', 'boiled egg'],
        'chicken breast': ['chicken breast', 'grilled chicken', 'chicken'],
        'rice': ['rice', 'white rice', 'steamed rice'],
        'coffee': ['coffee', 'black coffee', 'coffee black'],
        'orange juice': ['orange juice', 'oj'],
        'peanut butter': ['peanut butter', 'pb'],
    };
    for (const syns of Object.values(synonyms)) {
        if (syns.includes(name)) {
            variations.push(...syns.filter(s => s !== name));
        }
    }
    return variations;
}
/**
 * Convert a common food entry to FoodAnalysisResult
 */
function convertToFoodAnalysisResult(entry) {
    // Try to enrich with intelligence data
    const intelligence = (0, foodIntelligenceLookup_1.getFoodIntelligence)(entry.name);
    const item = {
        name: entry.name,
        quantity: entry.quantity,
        unit: entry.unit,
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        fiber: entry.fiber,
        sugar: entry.sugar,
        sodium: entry.sodium,
        saturatedFat: entry.saturatedFat,
        transFat: entry.transFat,
        cholesterol: entry.cholesterol,
        potassium: entry.potassium,
        calcium: entry.calcium,
        iron: entry.iron,
        magnesium: entry.magnesium,
        zinc: entry.zinc,
        vitaminA: entry.vitaminA,
        vitaminC: entry.vitaminC,
        vitaminD: entry.vitaminD,
        vitaminE: entry.vitaminE,
        vitaminK: entry.vitaminK,
        thiamin: entry.thiamin,
        riboflavin: entry.riboflavin,
        niacin: entry.niacin,
        vitaminB6: entry.vitaminB6,
        folate: entry.folate,
        vitaminB12: entry.vitaminB12,
        choline: entry.choline,
        phosphorus: entry.phosphorus,
        selenium: entry.selenium,
        copper: entry.copper,
        manganese: entry.manganese,
        caffeine: entry.caffeine,
        water: entry.water,
        confidence: 1.0, // USDA data is highly accurate
        servingMultiplier: 1,
        ...(intelligence && { intelligence }),
    };
    return {
        items: [item],
        detailLevel: 'complete',
        totalCalories: entry.calories,
        totalProtein: entry.protein,
        totalCarbs: entry.carbs,
        totalFat: entry.fat,
        totalFiber: entry.fiber,
        totalSugar: entry.sugar,
        totalSodium: entry.sodium,
        totalSaturatedFat: entry.saturatedFat,
        totalTransFat: entry.transFat,
        totalCholesterol: entry.cholesterol,
        totalPotassium: entry.potassium,
        totalCalcium: entry.calcium,
        totalIron: entry.iron,
        totalMagnesium: entry.magnesium,
        totalZinc: entry.zinc,
        totalVitaminA: entry.vitaminA,
        totalVitaminC: entry.vitaminC,
        totalVitaminD: entry.vitaminD,
        totalVitaminE: entry.vitaminE,
        totalVitaminK: entry.vitaminK,
        totalThiamin: entry.thiamin,
        totalRiboflavin: entry.riboflavin,
        totalNiacin: entry.niacin,
        totalVitaminB6: entry.vitaminB6,
        totalFolate: entry.folate,
        totalVitaminB12: entry.vitaminB12,
        totalCholine: entry.choline,
        totalPhosphorus: entry.phosphorus,
        totalSelenium: entry.selenium,
        totalCopper: entry.copper,
        totalManganese: entry.manganese,
        totalCaffeine: entry.caffeine,
        totalWater: entry.water,
        totalMonounsaturatedFat: 0,
        totalPolyunsaturatedFat: 0,
        mealType: entry.mealType,
    };
}
/**
 * Check if a food is in the lookup
 */
function hasCommonFood(normalizedDescription) {
    return getCommonFood(normalizedDescription) !== null;
}
/**
 * Get all available common food keys (for debugging/testing)
 */
function getCommonFoodKeys() {
    return Object.keys(COMMON_FOODS);
}
//# sourceMappingURL=commonFoodsLookup.js.map