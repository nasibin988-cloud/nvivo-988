"use strict";
/**
 * Nutrient Nature Registry
 *
 * Maps nutrient IDs to their nature (beneficial, risk, or neutral).
 * This determines how high/low values are classified:
 * - beneficial: Higher amounts are good (protein, fiber, vitamins)
 * - risk: Lower amounts are better (sodium, saturated fat, trans fat)
 * - neutral: Context-dependent (calories, total fat, carbs)
 *
 * Sources:
 * - FDA Daily Values: https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels
 * - WHO Guidelines: https://www.who.int/news-room/fact-sheets/detail/healthy-diet
 * - AHA Dietary Recommendations: https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/nutrition-basics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NUTRIENT_NATURE = void 0;
exports.getNutrientNature = getNutrientNature;
exports.isBeneficialNutrient = isBeneficialNutrient;
exports.isRiskNutrient = isRiskNutrient;
exports.getNutrientsByNature = getNutrientsByNature;
/**
 * Maps nutrient IDs to their nature for classification purposes.
 * Keys match the nutrient keys in packages/shared/src/types/models/nutrition.ts
 */
exports.NUTRIENT_NATURE = {
    // ═══════════════════════════════════════════════════════════════════
    // BENEFICIAL NUTRIENTS - Higher is better
    // These nutrients are essential for health; most people should aim
    // to get adequate amounts.
    // ═══════════════════════════════════════════════════════════════════
    // Macronutrients (beneficial)
    protein: 'beneficial',
    fiber: 'beneficial',
    // Minerals (beneficial)
    potassium: 'beneficial',
    calcium: 'beneficial',
    iron: 'beneficial',
    magnesium: 'beneficial',
    zinc: 'beneficial',
    phosphorus: 'beneficial',
    selenium: 'beneficial',
    copper: 'beneficial',
    manganese: 'beneficial',
    // Fat-soluble vitamins
    vitaminA: 'beneficial',
    vitaminD: 'beneficial',
    vitaminE: 'beneficial',
    vitaminK: 'beneficial',
    // Water-soluble vitamins
    vitaminC: 'beneficial',
    thiamin: 'beneficial',
    riboflavin: 'beneficial',
    niacin: 'beneficial',
    vitaminB6: 'beneficial',
    folate: 'beneficial',
    vitaminB12: 'beneficial',
    choline: 'beneficial',
    // ═══════════════════════════════════════════════════════════════════
    // RISK NUTRIENTS - Lower is better
    // These nutrients should be limited; excessive intake is associated
    // with negative health outcomes.
    // ═══════════════════════════════════════════════════════════════════
    // Minerals (risk)
    sodium: 'risk',
    // Fat subtypes (risk)
    saturatedFat: 'risk',
    transFat: 'risk',
    cholesterol: 'risk',
    // Sugars (risk)
    sugar: 'risk',
    addedSugar: 'risk',
    // ═══════════════════════════════════════════════════════════════════
    // NEUTRAL NUTRIENTS - Context-dependent
    // These nutrients are neither inherently good nor bad; the ideal
    // amount depends on individual goals and circumstances.
    // ═══════════════════════════════════════════════════════════════════
    // Energy
    calories: 'neutral',
    // Macronutrients (neutral)
    carbs: 'neutral',
    fat: 'neutral',
    // Fat subtypes (neutral - not inherently bad)
    monounsaturatedFat: 'neutral',
    polyunsaturatedFat: 'neutral',
    // Other (neutral)
    caffeine: 'neutral',
    alcohol: 'neutral',
    water: 'neutral',
};
/**
 * Get the nature of a nutrient for classification purposes.
 *
 * @param nutrientId - The nutrient identifier (e.g., 'protein', 'sodium')
 * @returns The nutrient's nature ('beneficial', 'risk', or 'neutral')
 *          Returns 'neutral' for unknown nutrients.
 */
function getNutrientNature(nutrientId) {
    var _a;
    return (_a = exports.NUTRIENT_NATURE[nutrientId]) !== null && _a !== void 0 ? _a : 'neutral';
}
/**
 * Check if a nutrient is beneficial (higher is better).
 *
 * @param nutrientId - The nutrient identifier
 * @returns true if the nutrient is beneficial
 */
function isBeneficialNutrient(nutrientId) {
    return getNutrientNature(nutrientId) === 'beneficial';
}
/**
 * Check if a nutrient is a risk nutrient (lower is better).
 *
 * @param nutrientId - The nutrient identifier
 * @returns true if the nutrient should be limited
 */
function isRiskNutrient(nutrientId) {
    return getNutrientNature(nutrientId) === 'risk';
}
/**
 * Get all nutrient IDs of a specific nature.
 *
 * @param nature - The nature to filter by
 * @returns Array of nutrient IDs with that nature
 */
function getNutrientsByNature(nature) {
    return Object.entries(exports.NUTRIENT_NATURE)
        .filter(([, n]) => n === nature)
        .map(([id]) => id);
}
//# sourceMappingURL=nutrientNature.js.map