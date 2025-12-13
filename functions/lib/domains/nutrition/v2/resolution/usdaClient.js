"use strict";
/**
 * USDA FoodData Central API Client
 *
 * Free API with 300K+ foods - best for whole foods and generic items.
 * https://fdc.nal.usda.gov/api-guide.html
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.usdaApiKey = void 0;
exports.searchUSDA = searchUSDA;
exports.getUSDAByFdcId = getUSDAByFdcId;
exports.batchSearchUSDA = batchSearchUSDA;
const params_1 = require("firebase-functions/params");
const usdaApiKey = (0, params_1.defineSecret)('USDA_API_KEY');
exports.usdaApiKey = usdaApiKey;
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';
// USDA Nutrient IDs mapping
const NUTRIENT_ID_MAP = {
    1008: 'calories', // Energy (kcal)
    1003: 'protein', // Protein
    1005: 'carbs', // Carbohydrate, by difference
    1004: 'fat', // Total lipid (fat)
    1079: 'fiber', // Fiber, total dietary
    2000: 'sugar', // Sugars, total
    1093: 'sodium', // Sodium, Na
    1258: 'saturatedFat', // Fatty acids, total saturated
    1257: 'transFat', // Fatty acids, total trans
    1292: 'monounsaturatedFat', // Fatty acids, total monounsaturated
    1293: 'polyunsaturatedFat', // Fatty acids, total polyunsaturated
    1253: 'cholesterol', // Cholesterol
    1092: 'potassium', // Potassium, K
    1087: 'calcium', // Calcium, Ca
    1089: 'iron', // Iron, Fe
    1090: 'magnesium', // Magnesium, Mg
    1095: 'zinc', // Zinc, Zn
    1091: 'phosphorus', // Phosphorus, P
    1106: 'vitaminA', // Vitamin A, RAE
    1114: 'vitaminD', // Vitamin D (D2 + D3)
    1109: 'vitaminE', // Vitamin E (alpha-tocopherol)
    1185: 'vitaminK', // Vitamin K (phylloquinone)
    1162: 'vitaminC', // Vitamin C, total ascorbic acid
    1165: 'thiamin', // Thiamin
    1166: 'riboflavin', // Riboflavin
    1167: 'niacin', // Niacin
    1175: 'vitaminB6', // Vitamin B-6
    1177: 'folate', // Folate, DFE
    1178: 'vitaminB12', // Vitamin B-12
    1180: 'choline', // Choline, total
    1170: 'pantothenicAcid', // Pantothenic acid
};
/**
 * Get USDA API key from Firebase secret
 */
function getApiKey() {
    const key = usdaApiKey.value();
    if (!key) {
        throw new Error('USDA API key not configured');
    }
    return key;
}
/**
 * Search USDA database for a food
 */
async function searchUSDA(query) {
    const apiKey = getApiKey();
    try {
        const response = await fetch(`${USDA_BASE_URL}/foods/search?query=${encodeURIComponent(query)}&api_key=${apiKey}&pageSize=5&dataType=Survey%20(FNDDS),Foundation,SR%20Legacy`);
        if (!response.ok) {
            console.error(`USDA API error: ${response.status}`);
            return null;
        }
        const data = await response.json();
        const foods = data.foods;
        if (!foods || foods.length === 0) {
            return null;
        }
        // Find best match
        const best = findBestMatch(query, foods);
        if (!best)
            return null;
        const nutrition = mapUSDAToNutrition(best.foodNutrients);
        const confidence = calculateConfidence(query, best.description);
        const servingGrams = best.servingSize || 100;
        return {
            nutrition: scaleToServing(nutrition, servingGrams),
            confidence,
            fdcId: best.fdcId,
            description: best.description,
            servingGrams,
        };
    }
    catch (error) {
        console.error('USDA search error:', error);
        return null;
    }
}
/**
 * Get food by FDC ID (more accurate than search)
 */
async function getUSDAByFdcId(fdcId) {
    const apiKey = getApiKey();
    try {
        const response = await fetch(`${USDA_BASE_URL}/food/${fdcId}?api_key=${apiKey}`);
        if (!response.ok) {
            return null;
        }
        const food = await response.json();
        const nutrition = mapUSDAToNutrition(food.foodNutrients);
        const servingGrams = food.servingSize || 100;
        return {
            nutrition: scaleToServing(nutrition, servingGrams),
            confidence: 0.98,
            fdcId: food.fdcId,
            description: food.description,
            servingGrams,
        };
    }
    catch (error) {
        console.error('USDA get by ID error:', error);
        return null;
    }
}
/**
 * Batch search multiple foods in parallel
 */
async function batchSearchUSDA(queries) {
    const results = await Promise.all(queries.map(async (query) => {
        const result = await searchUSDA(query);
        return { query, result };
    }));
    const map = new Map();
    for (const { query, result } of results) {
        if (result && result.confidence >= 0.7) {
            map.set(query.toLowerCase(), result);
        }
    }
    return map;
}
/**
 * Find best matching food from search results
 */
function findBestMatch(query, foods) {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);
    let bestMatch = null;
    let bestScore = 0;
    for (const food of foods) {
        const descLower = food.description.toLowerCase();
        // Exact match gets highest score
        if (descLower === queryLower) {
            return food;
        }
        // Calculate word overlap score
        const descWords = descLower.split(/[\s,]+/);
        let matchingWords = 0;
        for (const word of queryWords) {
            if (descWords.some(dw => dw.includes(word) || word.includes(dw))) {
                matchingWords++;
            }
        }
        const score = matchingWords / Math.max(queryWords.length, descWords.length);
        // Prefer Foundation and SR Legacy data types (more accurate)
        const dataTypeBonus = food.dataType === 'Foundation' ? 0.1 :
            food.dataType === 'SR Legacy' ? 0.05 : 0;
        const totalScore = score + dataTypeBonus;
        if (totalScore > bestScore) {
            bestScore = totalScore;
            bestMatch = food;
        }
    }
    return bestScore >= 0.3 ? bestMatch : null;
}
/**
 * Map USDA nutrients to our CompleteNutrition format
 * USDA returns per 100g, we keep it that way for now
 */
function mapUSDAToNutrition(nutrients) {
    const nutrition = {
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
    for (const nutrient of nutrients) {
        const key = NUTRIENT_ID_MAP[nutrient.nutrientId];
        if (key && key in nutrition) {
            nutrition[key] = roundNutrient(nutrient.value, key);
        }
    }
    return nutrition;
}
/**
 * Scale nutrition from per 100g to actual serving
 */
function scaleToServing(nutrition, servingGrams) {
    if (servingGrams === 100)
        return nutrition;
    const scale = servingGrams / 100;
    const scaled = { ...nutrition };
    for (const key of Object.keys(scaled)) {
        const value = scaled[key];
        if (typeof value === 'number') {
            scaled[key] = roundNutrient(value * scale, key);
        }
    }
    return scaled;
}
/**
 * Round nutrient value appropriately
 */
function roundNutrient(value, key) {
    // Integer nutrients
    if (['calories', 'sodium', 'potassium', 'calcium', 'cholesterol', 'phosphorus', 'magnesium'].includes(key)) {
        return Math.round(value);
    }
    // High precision for trace nutrients
    if (['thiamin', 'riboflavin', 'vitaminB6', 'vitaminB12', 'vitaminD', 'vitaminK'].includes(key)) {
        return Math.round(value * 100) / 100;
    }
    // Default: 1 decimal
    return Math.round(value * 10) / 10;
}
/**
 * Calculate confidence score for a match
 */
function calculateConfidence(query, description) {
    const queryLower = query.toLowerCase();
    const descLower = description.toLowerCase();
    // Exact match
    if (descLower === queryLower)
        return 0.98;
    // Contains full query
    if (descLower.includes(queryLower))
        return 0.92;
    // Query contains description
    if (queryLower.includes(descLower))
        return 0.88;
    // Word overlap
    const queryWords = queryLower.split(/\s+/);
    const descWords = descLower.split(/[\s,]+/);
    let matching = 0;
    for (const qw of queryWords) {
        if (descWords.some(dw => dw === qw))
            matching++;
    }
    const overlap = matching / queryWords.length;
    return Math.min(0.85, 0.6 + overlap * 0.25);
}
//# sourceMappingURL=usdaClient.js.map