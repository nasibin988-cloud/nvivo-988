"use strict";
/**
 * Food Database Index
 *
 * Exports the comprehensive USDA-validated food database with 500+ foods.
 * All nutrition values are per 100g edible portion from USDA FoodData Central.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.foodCategories = exports.foodAliases = exports.preparationModifiers = exports.foodMeta = exports.foodDatabase = void 0;
exports.getFood = getFood;
exports.getFoodByAlias = getFoodByAlias;
exports.searchFoods = searchFoods;
exports.getFoodsByCategory = getFoodsByCategory;
exports.getAllFoodIds = getAllFoodIds;
exports.getTotalFoodCount = getTotalFoodCount;
exports.calculateNutrition = calculateNutrition;
exports.applyPreparationModifier = applyPreparationModifier;
exports.getFocusGrade = getFocusGrade;
const base_foods_json_1 = __importDefault(require("./base_foods.json"));
const preparations_json_1 = __importDefault(require("./preparations.json"));
const aliases_json_1 = __importDefault(require("./aliases.json"));
const categories_json_1 = __importDefault(require("./categories.json"));
const baseFoods = base_foods_json_1.default;
const preparations = preparations_json_1.default;
const aliases = aliases_json_1.default;
const categories = categories_json_1.default;
// Extract metadata
const { _meta, ...foods } = baseFoods;
// Export raw data
exports.foodDatabase = foods;
exports.foodMeta = _meta;
exports.preparationModifiers = preparations;
exports.foodAliases = aliases;
exports.foodCategories = categories;
// Helper functions
/**
 * Get a food by its ID
 */
function getFood(id) {
    return exports.foodDatabase[id];
}
/**
 * Get a food by alias (returns canonical food entry)
 */
function getFoodByAlias(alias) {
    const normalizedAlias = alias.toLowerCase().trim();
    // Check if it's a direct ID
    if (exports.foodDatabase[normalizedAlias]) {
        return exports.foodDatabase[normalizedAlias];
    }
    // Check aliases
    for (const [canonicalId, aliasEntry] of Object.entries(exports.foodAliases.aliases)) {
        if (aliasEntry.aliases.includes(normalizedAlias)) {
            return exports.foodDatabase[canonicalId];
        }
    }
    return undefined;
}
/**
 * Search foods by name (fuzzy matching)
 */
function searchFoods(query, limit = 10) {
    const normalizedQuery = query.toLowerCase().trim();
    const results = [];
    for (const food of Object.values(exports.foodDatabase)) {
        const name = food.name.toLowerCase();
        const id = food.id.toLowerCase();
        // Exact match gets highest score
        if (name === normalizedQuery || id === normalizedQuery) {
            results.push({ food, score: 100 });
            continue;
        }
        // Starts with query
        if (name.startsWith(normalizedQuery) || id.startsWith(normalizedQuery)) {
            results.push({ food, score: 80 });
            continue;
        }
        // Contains query
        if (name.includes(normalizedQuery) || id.includes(normalizedQuery)) {
            results.push({ food, score: 60 });
        }
    }
    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(r => r.food);
}
/**
 * Get foods by category
 */
function getFoodsByCategory(categoryId) {
    const category = exports.foodCategories.categories.find(c => c.id === categoryId);
    if (!category)
        return [];
    return category.examples
        .map(id => exports.foodDatabase[id])
        .filter((f) => f !== undefined);
}
/**
 * Get all food IDs
 */
function getAllFoodIds() {
    return Object.keys(exports.foodDatabase);
}
/**
 * Get total food count
 */
function getTotalFoodCount() {
    return exports.foodMeta.totalFoods;
}
/**
 * Calculate nutrition for a specific amount of food
 */
function calculateNutrition(food, amountGrams) {
    const multiplier = amountGrams / 100;
    const result = {
        calories: Math.round(food.nutritionPer100g.calories * multiplier),
        protein: Number((food.nutritionPer100g.protein * multiplier).toFixed(1)),
        carbs: Number((food.nutritionPer100g.carbs * multiplier).toFixed(1)),
        fat: Number((food.nutritionPer100g.fat * multiplier).toFixed(1)),
        fiber: Number((food.nutritionPer100g.fiber * multiplier).toFixed(1)),
        sugar: Number((food.nutritionPer100g.sugar * multiplier).toFixed(1)),
        sodium: Math.round(food.nutritionPer100g.sodium * multiplier),
    };
    // Apply multiplier to optional fields if present
    const optionalFields = [
        'saturatedFat',
        'cholesterol',
        'potassium',
        'calcium',
        'iron',
        'magnesium',
        'vitaminA',
        'vitaminC',
        'vitaminD',
        'vitaminB12',
        'vitaminE',
        'vitaminK',
        'folate',
        'omega3',
        'phosphorus',
    ];
    for (const field of optionalFields) {
        const value = food.nutritionPer100g[field];
        if (value !== undefined) {
            // Use index assignment with type assertion
            result[field] = Number((value * multiplier).toFixed(2));
        }
    }
    return result;
}
/**
 * Apply preparation modifier to nutrition values
 */
function applyPreparationModifier(nutrition, preparationId) {
    const prep = exports.preparationModifiers.preparations[preparationId];
    if (!prep)
        return nutrition;
    const result = { ...nutrition };
    for (const [field, multiplier] of Object.entries(prep.multipliers)) {
        const key = field;
        const value = result[key];
        if (value !== undefined && typeof value === 'number') {
            // Use index assignment with type assertion
            result[key] = Number((value * multiplier).toFixed(2));
        }
    }
    return result;
}
/**
 * Get grade for a food on a specific focus goal
 */
function getFocusGrade(food, focusGoal) {
    var _a;
    return (_a = food.focusGrades) === null || _a === void 0 ? void 0 : _a[focusGoal];
}
// Default export with all utilities
exports.default = {
    foods: exports.foodDatabase,
    meta: exports.foodMeta,
    preparations: exports.preparationModifiers,
    aliases: exports.foodAliases,
    categories: exports.foodCategories,
    getFood,
    getFoodByAlias,
    searchFoods,
    getFoodsByCategory,
    getAllFoodIds,
    getTotalFoodCount,
    calculateNutrition,
    applyPreparationModifier,
    getFocusGrade,
};
//# sourceMappingURL=index.js.map