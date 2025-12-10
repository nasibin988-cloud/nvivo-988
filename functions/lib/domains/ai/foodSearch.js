"use strict";
/**
 * Food Search using USDA FoodData Central API
 * Search for foods with nutrition information
 *
 * Supports tiered nutrition detail levels:
 * - essential: Basic macros (calories, protein, carbs, fat, fiber, sugar, sodium)
 * - extended: + fat breakdown, key minerals (potassium, calcium, iron, magnesium)
 * - complete: + all vitamins, trace minerals, fatty acid details
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.usdaApiKey = void 0;
exports.searchFoods = searchFoods;
const params_1 = require("firebase-functions/params");
// USDA API key (free registration at https://fdc.nal.usda.gov/api-key-signup.html)
// For now, we'll use DEMO_KEY which has rate limits
const usdaApiKey = (0, params_1.defineSecret)('USDA_API_KEY');
exports.usdaApiKey = usdaApiKey;
// ============================================================================
// USDA NUTRIENT ID MAPPINGS
// Reference: https://fdc.nal.usda.gov/
// ============================================================================
const NUTRIENT_IDS = {
    // Essential (Tier 1)
    CALORIES: 1008,
    PROTEIN: 1003,
    FAT: 1004,
    CARBS: 1005,
    FIBER: 1079,
    SUGAR: 2000,
    SODIUM: 1093,
    // Extended (Tier 2) - Fat breakdown
    SATURATED_FAT: 1258,
    TRANS_FAT: 1257,
    CHOLESTEROL: 1253,
    // Extended (Tier 2) - Key minerals
    POTASSIUM: 1092,
    CALCIUM: 1087,
    IRON: 1089,
    MAGNESIUM: 1090,
    // Complete (Tier 3) - Fat details
    MONOUNSATURATED_FAT: 1292,
    POLYUNSATURATED_FAT: 1293,
    // Complete (Tier 3) - Vitamins (Fat-soluble)
    VITAMIN_A: 1106,
    VITAMIN_D: 1114,
    VITAMIN_E: 1109,
    VITAMIN_K: 1185,
    // Complete (Tier 3) - Vitamins (Water-soluble)
    VITAMIN_C: 1162,
    THIAMIN: 1165,
    RIBOFLAVIN: 1166,
    NIACIN: 1167,
    VITAMIN_B6: 1175,
    FOLATE: 1177,
    VITAMIN_B12: 1178,
    CHOLINE: 1180,
    // Complete (Tier 3) - Trace minerals
    ZINC: 1095,
    PHOSPHORUS: 1091,
    SELENIUM: 1103,
    COPPER: 1098,
    MANGANESE: 1101,
    // Complete (Tier 3) - Other
    CAFFEINE: 1057,
};
/**
 * Get the USDA nutrient IDs to request for a given detail level
 */
function getNutrientIdsForLevel(level) {
    const essential = [
        NUTRIENT_IDS.CALORIES, NUTRIENT_IDS.PROTEIN, NUTRIENT_IDS.FAT,
        NUTRIENT_IDS.CARBS, NUTRIENT_IDS.FIBER, NUTRIENT_IDS.SUGAR, NUTRIENT_IDS.SODIUM,
    ];
    const extended = [
        ...essential,
        NUTRIENT_IDS.SATURATED_FAT, NUTRIENT_IDS.TRANS_FAT, NUTRIENT_IDS.CHOLESTEROL,
        NUTRIENT_IDS.POTASSIUM, NUTRIENT_IDS.CALCIUM, NUTRIENT_IDS.IRON, NUTRIENT_IDS.MAGNESIUM,
    ];
    const complete = [
        ...extended,
        NUTRIENT_IDS.MONOUNSATURATED_FAT, NUTRIENT_IDS.POLYUNSATURATED_FAT,
        NUTRIENT_IDS.VITAMIN_A, NUTRIENT_IDS.VITAMIN_D, NUTRIENT_IDS.VITAMIN_E, NUTRIENT_IDS.VITAMIN_K,
        NUTRIENT_IDS.VITAMIN_C, NUTRIENT_IDS.THIAMIN, NUTRIENT_IDS.RIBOFLAVIN, NUTRIENT_IDS.NIACIN,
        NUTRIENT_IDS.VITAMIN_B6, NUTRIENT_IDS.FOLATE, NUTRIENT_IDS.VITAMIN_B12, NUTRIENT_IDS.CHOLINE,
        NUTRIENT_IDS.ZINC, NUTRIENT_IDS.PHOSPHORUS, NUTRIENT_IDS.SELENIUM, NUTRIENT_IDS.COPPER,
        NUTRIENT_IDS.MANGANESE, NUTRIENT_IDS.CAFFEINE,
    ];
    switch (level) {
        case 'essential': return essential;
        case 'extended': return extended;
        case 'complete': return complete;
    }
}
/**
 * Get the API key - uses env var for local dev, or DEMO_KEY as fallback
 */
function getApiKey() {
    // Try environment variable first (for emulator/local dev)
    const envKey = process.env.USDA_API_KEY;
    if (envKey) {
        return envKey;
    }
    // Try Firebase secret (for production)
    try {
        const secretValue = usdaApiKey.value();
        if (secretValue) {
            return secretValue;
        }
    }
    catch (_a) {
        // Secret not available
    }
    // Fallback to DEMO_KEY (rate limited but works)
    return 'DEMO_KEY';
}
/**
 * Extract nutrient value from USDA food item
 */
function getNutrientValue(nutrients, nutrientId) {
    var _a;
    const nutrient = nutrients.find((n) => n.nutrientId === nutrientId);
    return (_a = nutrient === null || nutrient === void 0 ? void 0 : nutrient.value) !== null && _a !== void 0 ? _a : 0;
}
/**
 * Extract nutrition data for a given detail level
 */
function extractNutrition(nutrients, level) {
    // Essential (always included)
    const essential = {
        calories: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.CALORIES)),
        protein: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.PROTEIN) * 10) / 10,
        carbohydrates: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.CARBS) * 10) / 10,
        fat: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.FAT) * 10) / 10,
        fiber: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.FIBER) * 10) / 10,
        sugar: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.SUGAR) * 10) / 10,
        sodium: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.SODIUM)),
    };
    if (level === 'essential') {
        return essential;
    }
    // Extended (adds fat breakdown + key minerals)
    const extended = {
        ...essential,
        saturatedFat: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.SATURATED_FAT) * 10) / 10,
        transFat: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.TRANS_FAT) * 10) / 10,
        cholesterol: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.CHOLESTEROL)),
        potassium: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.POTASSIUM)),
        calcium: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.CALCIUM)),
        iron: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.IRON) * 10) / 10,
        magnesium: Math.round(getNutrientValue(nutrients, NUTRIENT_IDS.MAGNESIUM)),
    };
    if (level === 'extended') {
        return extended;
    }
    // Complete (adds all vitamins, trace minerals, fatty acid details)
    const complete = {
        ...extended,
        // Fat details
        monounsaturatedFat: getNutrientValue(nutrients, NUTRIENT_IDS.MONOUNSATURATED_FAT) || undefined,
        polyunsaturatedFat: getNutrientValue(nutrients, NUTRIENT_IDS.POLYUNSATURATED_FAT) || undefined,
        // Vitamins (Fat-soluble)
        vitaminA: getNutrientValue(nutrients, NUTRIENT_IDS.VITAMIN_A) || undefined,
        vitaminD: getNutrientValue(nutrients, NUTRIENT_IDS.VITAMIN_D) || undefined,
        vitaminE: getNutrientValue(nutrients, NUTRIENT_IDS.VITAMIN_E) || undefined,
        vitaminK: getNutrientValue(nutrients, NUTRIENT_IDS.VITAMIN_K) || undefined,
        // Vitamins (Water-soluble)
        vitaminC: getNutrientValue(nutrients, NUTRIENT_IDS.VITAMIN_C) || undefined,
        thiamin: getNutrientValue(nutrients, NUTRIENT_IDS.THIAMIN) || undefined,
        riboflavin: getNutrientValue(nutrients, NUTRIENT_IDS.RIBOFLAVIN) || undefined,
        niacin: getNutrientValue(nutrients, NUTRIENT_IDS.NIACIN) || undefined,
        vitaminB6: getNutrientValue(nutrients, NUTRIENT_IDS.VITAMIN_B6) || undefined,
        folate: getNutrientValue(nutrients, NUTRIENT_IDS.FOLATE) || undefined,
        vitaminB12: getNutrientValue(nutrients, NUTRIENT_IDS.VITAMIN_B12) || undefined,
        choline: getNutrientValue(nutrients, NUTRIENT_IDS.CHOLINE) || undefined,
        // Trace minerals
        zinc: getNutrientValue(nutrients, NUTRIENT_IDS.ZINC) || undefined,
        phosphorus: getNutrientValue(nutrients, NUTRIENT_IDS.PHOSPHORUS) || undefined,
        selenium: getNutrientValue(nutrients, NUTRIENT_IDS.SELENIUM) || undefined,
        copper: getNutrientValue(nutrients, NUTRIENT_IDS.COPPER) || undefined,
        manganese: getNutrientValue(nutrients, NUTRIENT_IDS.MANGANESE) || undefined,
        // Other
        caffeine: getNutrientValue(nutrients, NUTRIENT_IDS.CAFFEINE) || undefined,
    };
    return complete;
}
/**
 * Search foods using USDA FoodData Central API
 *
 * @param query - Search query string
 * @param limit - Max number of results (default 15)
 * @param detailLevel - Nutrition detail level: essential, extended, or complete
 */
async function searchFoods(query, limit = 15, detailLevel = 'essential') {
    const apiKey = getApiKey();
    const nutrientIds = getNutrientIdsForLevel(detailLevel);
    try {
        const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                pageSize: limit,
                dataType: ['Foundation', 'SR Legacy', 'Branded'],
                sortBy: 'dataType.keyword',
                sortOrder: 'asc',
                // Request only the nutrients we need for this detail level
                nutrients: nutrientIds,
            }),
        });
        if (!response.ok) {
            console.error('USDA API error:', response.status, await response.text());
            return getFallbackResults(query, detailLevel);
        }
        const data = await response.json();
        if (!data.foods || data.foods.length === 0) {
            return getFallbackResults(query, detailLevel);
        }
        return data.foods.map((food) => ({
            name: food.description,
            fdcId: food.fdcId.toString(),
            brandName: food.brandName || food.brandOwner,
            servingSize: food.servingSize,
            servingSizeUnit: food.servingSizeUnit,
            nutrition: extractNutrition(food.foodNutrients, detailLevel),
        }));
    }
    catch (error) {
        console.error('Food search error:', error);
        return getFallbackResults(query, detailLevel);
    }
}
/**
 * Fallback results when API is unavailable
 * Returns common foods with nutrition data based on detail level
 */
function getFallbackResults(query, detailLevel = 'essential') {
    // Comprehensive fallback data with extended nutrition
    const commonFoods = [
        {
            name: 'Chicken breast, grilled',
            essential: { calories: 165, protein: 31, carbohydrates: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
            extended: { saturatedFat: 1, transFat: 0, cholesterol: 85, potassium: 256, calcium: 11, iron: 0.9, magnesium: 26 },
            complete: { vitaminB6: 0.5, vitaminB12: 0.3, zinc: 0.9, phosphorus: 196, selenium: 24 },
        },
        {
            name: 'Brown rice, cooked',
            essential: { calories: 216, protein: 5, carbohydrates: 45, fat: 1.8, fiber: 3.5, sugar: 0.4, sodium: 10 },
            extended: { saturatedFat: 0.4, transFat: 0, cholesterol: 0, potassium: 84, calcium: 20, iron: 0.8, magnesium: 84 },
            complete: { manganese: 1.8, phosphorus: 162, selenium: 19 },
        },
        {
            name: 'Salmon, Atlantic, baked',
            essential: { calories: 208, protein: 20, carbohydrates: 0, fat: 13, fiber: 0, sugar: 0, sodium: 59 },
            extended: { saturatedFat: 2.5, transFat: 0, cholesterol: 55, potassium: 363, calcium: 9, iron: 0.3, magnesium: 27 },
            complete: { vitaminD: 11, vitaminB12: 2.8, vitaminB6: 0.6, phosphorus: 252, selenium: 36 },
        },
        {
            name: 'Broccoli, steamed',
            essential: { calories: 55, protein: 3.7, carbohydrates: 11, fat: 0.6, fiber: 5.1, sugar: 2.2, sodium: 64 },
            extended: { saturatedFat: 0.1, transFat: 0, cholesterol: 0, potassium: 457, calcium: 62, iron: 1, magnesium: 33 },
            complete: { vitaminC: 101, vitaminK: 177, folate: 108, vitaminA: 79 },
        },
        {
            name: 'Greek yogurt, plain, nonfat',
            essential: { calories: 100, protein: 17, carbohydrates: 6, fat: 0.7, fiber: 0, sugar: 6, sodium: 36 },
            extended: { saturatedFat: 0.3, transFat: 0, cholesterol: 5, potassium: 220, calcium: 187, iron: 0.1, magnesium: 19 },
            complete: { vitaminB12: 1.3, phosphorus: 213 },
        },
        {
            name: 'Avocado, raw',
            essential: { calories: 160, protein: 2, carbohydrates: 9, fat: 15, fiber: 7, sugar: 0.7, sodium: 7 },
            extended: { saturatedFat: 2.1, transFat: 0, cholesterol: 0, potassium: 485, calcium: 12, iron: 0.6, magnesium: 29 },
            complete: { vitaminC: 10, vitaminE: 2.1, vitaminK: 21, folate: 81, vitaminB6: 0.3 },
        },
        {
            name: 'Eggs, whole, scrambled',
            essential: { calories: 147, protein: 10, carbohydrates: 2, fat: 11, fiber: 0, sugar: 1.6, sodium: 145 },
            extended: { saturatedFat: 3.3, transFat: 0.1, cholesterol: 294, potassium: 132, calcium: 48, iron: 1.5, magnesium: 10 },
            complete: { vitaminA: 149, vitaminD: 1.5, vitaminB12: 0.9, choline: 225, selenium: 22, zinc: 1.1 },
        },
        {
            name: 'Banana, raw',
            essential: { calories: 89, protein: 1.1, carbohydrates: 23, fat: 0.3, fiber: 2.6, sugar: 12.2, sodium: 1 },
            extended: { saturatedFat: 0.1, transFat: 0, cholesterol: 0, potassium: 358, calcium: 5, iron: 0.3, magnesium: 27 },
            complete: { vitaminC: 8.7, vitaminB6: 0.4, manganese: 0.3 },
        },
        {
            name: 'Oatmeal, cooked with water',
            essential: { calories: 158, protein: 6, carbohydrates: 27, fat: 3, fiber: 4, sugar: 0.6, sodium: 9 },
            extended: { saturatedFat: 0.5, transFat: 0, cholesterol: 0, potassium: 143, calcium: 21, iron: 2.1, magnesium: 56 },
            complete: { zinc: 1.5, phosphorus: 180, manganese: 1.4, thiamin: 0.3 },
        },
        {
            name: 'Spinach, raw',
            essential: { calories: 23, protein: 2.9, carbohydrates: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, sodium: 79 },
            extended: { saturatedFat: 0.1, transFat: 0, cholesterol: 0, potassium: 558, calcium: 99, iron: 2.7, magnesium: 79 },
            complete: { vitaminA: 469, vitaminC: 28, vitaminK: 483, folate: 194, vitaminE: 2 },
        },
        {
            name: 'Apple, raw with skin',
            essential: { calories: 95, protein: 0.5, carbohydrates: 25, fat: 0.3, fiber: 4.4, sugar: 19, sodium: 2 },
            extended: { saturatedFat: 0.1, transFat: 0, cholesterol: 0, potassium: 195, calcium: 11, iron: 0.2, magnesium: 9 },
            complete: { vitaminC: 8.4 },
        },
        {
            name: 'Quinoa, cooked',
            essential: { calories: 222, protein: 8, carbohydrates: 39, fat: 3.5, fiber: 5, sugar: 0.9, sodium: 13 },
            extended: { saturatedFat: 0.4, transFat: 0, cholesterol: 0, potassium: 318, calcium: 31, iron: 2.8, magnesium: 118 },
            complete: { zinc: 2, phosphorus: 281, manganese: 1.1, folate: 78 },
        },
        {
            name: 'Sweet potato, baked',
            essential: { calories: 103, protein: 2.3, carbohydrates: 24, fat: 0.1, fiber: 3.8, sugar: 7.4, sodium: 41 },
            extended: { saturatedFat: 0, transFat: 0, cholesterol: 0, potassium: 475, calcium: 38, iron: 0.7, magnesium: 27 },
            complete: { vitaminA: 1096, vitaminC: 19.6, vitaminB6: 0.3, manganese: 0.5 },
        },
        {
            name: 'Almonds, raw',
            essential: { calories: 164, protein: 6, carbohydrates: 6, fat: 14, fiber: 3.5, sugar: 1.2, sodium: 0 },
            extended: { saturatedFat: 1.1, transFat: 0, cholesterol: 0, potassium: 200, calcium: 76, iron: 1, magnesium: 76 },
            complete: { vitaminE: 7.3, riboflavin: 0.3, phosphorus: 136, zinc: 0.9, manganese: 0.6 },
        },
        {
            name: 'Cottage cheese, low fat',
            essential: { calories: 163, protein: 28, carbohydrates: 6, fat: 2.3, fiber: 0, sugar: 6, sodium: 918 },
            extended: { saturatedFat: 1.5, transFat: 0.1, cholesterol: 18, potassium: 194, calcium: 138, iron: 0.1, magnesium: 12 },
            complete: { vitaminB12: 1.5, phosphorus: 302, selenium: 20, zinc: 0.7 },
        },
    ];
    const lowerQuery = query.toLowerCase();
    const filtered = commonFoods.filter((food) => food.name.toLowerCase().includes(lowerQuery));
    // Map to FoodSearchResult with appropriate detail level
    return filtered.map((food) => {
        let nutrition = { ...food.essential };
        if (detailLevel === 'extended' || detailLevel === 'complete') {
            nutrition = { ...nutrition, ...food.extended };
        }
        if (detailLevel === 'complete') {
            nutrition = { ...nutrition, ...food.complete };
        }
        return { name: food.name, nutrition };
    });
}
//# sourceMappingURL=foodSearch.js.map