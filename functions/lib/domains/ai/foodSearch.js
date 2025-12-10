"use strict";
/**
 * Food Search using USDA FoodData Central API
 * Search for foods with nutrition information
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.usdaApiKey = void 0;
exports.searchFoods = searchFoods;
const params_1 = require("firebase-functions/params");
// USDA API key (free registration at https://fdc.nal.usda.gov/api-key-signup.html)
// For now, we'll use DEMO_KEY which has rate limits
const usdaApiKey = (0, params_1.defineSecret)('USDA_API_KEY');
exports.usdaApiKey = usdaApiKey;
// Nutrient IDs in USDA database
const NUTRIENT_IDS = {
    CALORIES: 1008, // Energy (kcal)
    PROTEIN: 1003, // Protein (g)
    FAT: 1004, // Total lipid (fat) (g)
    CARBS: 1005, // Carbohydrate, by difference (g)
    FIBER: 1079, // Fiber, total dietary (g)
    SODIUM: 1093, // Sodium (mg)
};
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
 * Search foods using USDA FoodData Central API
 */
async function searchFoods(query, limit = 15) {
    const apiKey = getApiKey();
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
            }),
        });
        if (!response.ok) {
            console.error('USDA API error:', response.status, await response.text());
            return getFallbackResults(query);
        }
        const data = await response.json();
        if (!data.foods || data.foods.length === 0) {
            return getFallbackResults(query);
        }
        return data.foods.map((food) => ({
            name: food.description,
            fdcId: food.fdcId.toString(),
            brandName: food.brandName || food.brandOwner,
            nutrition: {
                calories: Math.round(getNutrientValue(food.foodNutrients, NUTRIENT_IDS.CALORIES)),
                protein: Math.round(getNutrientValue(food.foodNutrients, NUTRIENT_IDS.PROTEIN) * 10) / 10,
                carbohydrates: Math.round(getNutrientValue(food.foodNutrients, NUTRIENT_IDS.CARBS) * 10) / 10,
                fat: Math.round(getNutrientValue(food.foodNutrients, NUTRIENT_IDS.FAT) * 10) / 10,
                fiber: Math.round(getNutrientValue(food.foodNutrients, NUTRIENT_IDS.FIBER) * 10) / 10 || undefined,
                sodium: Math.round(getNutrientValue(food.foodNutrients, NUTRIENT_IDS.SODIUM)) || undefined,
            },
        }));
    }
    catch (error) {
        console.error('Food search error:', error);
        return getFallbackResults(query);
    }
}
/**
 * Fallback results when API is unavailable
 */
function getFallbackResults(query) {
    const commonFoods = [
        { name: 'Chicken breast, grilled', nutrition: { calories: 165, protein: 31, carbohydrates: 0, fat: 3.6, fiber: 0 } },
        { name: 'Brown rice, cooked', nutrition: { calories: 216, protein: 5, carbohydrates: 45, fat: 1.8, fiber: 3.5 } },
        { name: 'Salmon, Atlantic, baked', nutrition: { calories: 208, protein: 20, carbohydrates: 0, fat: 13, fiber: 0 } },
        { name: 'Broccoli, steamed', nutrition: { calories: 55, protein: 3.7, carbohydrates: 11, fat: 0.6, fiber: 5.1 } },
        { name: 'Greek yogurt, plain, nonfat', nutrition: { calories: 100, protein: 17, carbohydrates: 6, fat: 0.7, fiber: 0 } },
        { name: 'Avocado, raw', nutrition: { calories: 160, protein: 2, carbohydrates: 9, fat: 15, fiber: 7 } },
        { name: 'Eggs, whole, scrambled', nutrition: { calories: 147, protein: 10, carbohydrates: 2, fat: 11, fiber: 0 } },
        { name: 'Banana, raw', nutrition: { calories: 89, protein: 1.1, carbohydrates: 23, fat: 0.3, fiber: 2.6 } },
        { name: 'Oatmeal, cooked with water', nutrition: { calories: 158, protein: 6, carbohydrates: 27, fat: 3, fiber: 4 } },
        { name: 'Spinach, raw', nutrition: { calories: 23, protein: 2.9, carbohydrates: 3.6, fat: 0.4, fiber: 2.2 } },
        { name: 'Apple, raw with skin', nutrition: { calories: 95, protein: 0.5, carbohydrates: 25, fat: 0.3, fiber: 4.4 } },
        { name: 'Quinoa, cooked', nutrition: { calories: 222, protein: 8, carbohydrates: 39, fat: 3.5, fiber: 5 } },
        { name: 'Sweet potato, baked', nutrition: { calories: 103, protein: 2.3, carbohydrates: 24, fat: 0.1, fiber: 3.8 } },
        { name: 'Almonds, raw', nutrition: { calories: 164, protein: 6, carbohydrates: 6, fat: 14, fiber: 3.5 } },
        { name: 'Cottage cheese, low fat', nutrition: { calories: 163, protein: 28, carbohydrates: 6, fat: 2.3, fiber: 0 } },
    ];
    const lowerQuery = query.toLowerCase();
    return commonFoods.filter((food) => food.name.toLowerCase().includes(lowerQuery));
}
//# sourceMappingURL=foodSearch.js.map