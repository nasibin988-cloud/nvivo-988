"use strict";
/**
 * Target Computer
 *
 * Computes personalized nutrition targets for a user based on their profile.
 * Combines DRI lookups, calorie calculations, and AMDR ranges.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeUserTargets = computeUserTargets;
exports.computeTargetsForNutrients = computeTargetsForNutrients;
exports.computeSingleTarget = computeSingleTarget;
exports.computeCalorieTarget = computeCalorieTarget;
const data_1 = require("../data");
const ageUtils_1 = require("./ageUtils");
const calorieCalculator_1 = require("./calorieCalculator");
/**
 * Priority nutrients to always include in targets
 */
const PRIORITY_NUTRIENTS = [
    // Macros
    'calories',
    'protein',
    'carbohydrate',
    'total_fat',
    'fiber',
    // Sugars
    'total_sugars',
    'added_sugars',
    // Fats
    'saturated_fat',
    'trans_fat',
    'cholesterol',
    // Key minerals
    'sodium',
    'potassium',
    'calcium',
    'iron',
    'magnesium',
    'zinc',
    // Key vitamins
    'vitamin_a',
    'vitamin_c',
    'vitamin_d',
    'vitamin_e',
    'vitamin_k',
    'thiamin',
    'riboflavin',
    'niacin',
    'vitamin_b6',
    'folate',
    'vitamin_b12',
    // Other important nutrients
    'choline',
    'phosphorus',
    'selenium',
    'copper',
    'manganese',
    'chromium',
    'molybdenum',
    'iodine',
];
/**
 * AMDR (Acceptable Macronutrient Distribution Range) definitions
 * Expressed as percent of total calories
 */
const AMDR_RANGES = {
    carbohydrate: { minPercent: 45, maxPercent: 65, kcalPerGram: 4 },
    protein: { minPercent: 10, maxPercent: 35, kcalPerGram: 4 },
    total_fat: { minPercent: 20, maxPercent: 35, kcalPerGram: 9 },
};
/**
 * Calculate AMDR-based gram targets from calorie target
 */
function calculateAmdrGrams(targetCalories, minPercent, maxPercent, kcalPerGram) {
    const minKcal = (targetCalories * minPercent) / 100;
    const maxKcal = (targetCalories * maxPercent) / 100;
    const min = Math.round(minKcal / kcalPerGram);
    const max = Math.round(maxKcal / kcalPerGram);
    const midpoint = Math.round((min + max) / 2);
    return { min, max, midpoint };
}
/**
 * Build a single nutrient target from lookups
 */
function buildNutrientTarget(nutrientId, ageYears, sex, lifeStageGroup, targetCalories, isPregnant, isLactating) {
    const nutrientDef = data_1.nutritionData.getNutrient(nutrientId);
    if (!nutrientDef)
        return null;
    // Look up DRI value
    const driLifeStage = (0, ageUtils_1.getDriLifeStage)(isPregnant, isLactating);
    const dri = data_1.nutritionData.getDri(nutrientId, ageYears, sex, driLifeStage);
    // Get FDA Daily Value
    const fdaDv = data_1.nutritionData.getFdaDvForAdults(nutrientId);
    // Build base target
    const target = {
        nutrientId,
        displayName: nutrientDef.displayName,
        unit: nutrientDef.unit,
        source: dri ? `${dri.driType} ${sex} age ${ageYears}` : 'FDA DV',
    };
    // Set primary target from DRI
    if (dri && dri.value !== null) {
        target.target = dri.value;
        target.targetType = dri.driType === 'RDA' ? 'RDA' : 'AI';
    }
    // Set Upper Limit from DRI
    if (dri && dri.ulValue !== null) {
        target.upperLimit = dri.ulValue;
    }
    // Set FDA Daily Value
    if (fdaDv !== null) {
        target.dailyValue = fdaDv;
    }
    // Handle AMDR for macronutrients
    const amdrDef = AMDR_RANGES[nutrientId];
    if (amdrDef) {
        const amdr = calculateAmdrGrams(targetCalories, amdrDef.minPercent, amdrDef.maxPercent, amdrDef.kcalPerGram);
        target.amdrMin = amdr.min;
        target.amdrMax = amdr.max;
        target.amdrMinPercent = amdrDef.minPercent;
        target.amdrMaxPercent = amdrDef.maxPercent;
        // Use AMDR midpoint as target if no DRI target
        if (!target.target) {
            target.target = amdr.midpoint;
        }
    }
    // Special handling for sodium (CDRR limit)
    if (nutrientId === 'sodium') {
        target.cdrrLimit = 2300; // CDRR chronic disease risk reduction limit
        if (!target.upperLimit) {
            target.upperLimit = 2300;
        }
    }
    // Special handling for calories
    if (nutrientId === 'calories') {
        target.target = targetCalories;
    }
    return target;
}
/**
 * Compute all personalized nutrition targets for a user
 */
function computeUserTargets(profile) {
    const { years: ageYears } = (0, ageUtils_1.calculateAge)(profile.dateOfBirth);
    const lifeStageGroup = (0, ageUtils_1.getLifeStageGroup)(ageYears, profile.sex, profile.isPregnant, profile.isLactating);
    // Calculate energy/calorie target
    const energy = (0, calorieCalculator_1.calculateEnergy)(profile.dateOfBirth, profile.sex, profile.weightKg, profile.heightCm, profile.activityLevel, profile.goal, profile.isPregnant, profile.isLactating);
    const nutrients = {};
    // Build targets for all priority nutrients
    for (const nutrientId of PRIORITY_NUTRIENTS) {
        const target = buildNutrientTarget(nutrientId, ageYears, profile.sex, lifeStageGroup, energy.targetCalories, profile.isPregnant, profile.isLactating);
        if (target) {
            nutrients[nutrientId] = target;
        }
    }
    // Also include any additional nutrients from data that have DRI values
    const allNutrients = data_1.nutritionData.getAllNutrients();
    for (const nutrient of allNutrients) {
        if (!nutrients[nutrient.nutrientId]) {
            const target = buildNutrientTarget(nutrient.nutrientId, ageYears, profile.sex, lifeStageGroup, energy.targetCalories, profile.isPregnant, profile.isLactating);
            if (target && (target.target || target.dailyValue)) {
                nutrients[nutrient.nutrientId] = target;
            }
        }
    }
    return {
        calories: energy.targetCalories,
        nutrients,
        profile: {
            ageYears,
            sex: profile.sex,
            lifeStageGroup,
            activityLevel: profile.activityLevel,
            goal: profile.goal,
        },
        computedAt: new Date().toISOString(),
    };
}
/**
 * Compute targets for a specific list of nutrients only
 */
function computeTargetsForNutrients(profile, nutrientIds) {
    const { years: ageYears } = (0, ageUtils_1.calculateAge)(profile.dateOfBirth);
    const lifeStageGroup = (0, ageUtils_1.getLifeStageGroup)(ageYears, profile.sex, profile.isPregnant, profile.isLactating);
    const energy = (0, calorieCalculator_1.calculateEnergy)(profile.dateOfBirth, profile.sex, profile.weightKg, profile.heightCm, profile.activityLevel, profile.goal, profile.isPregnant, profile.isLactating);
    const nutrients = {};
    for (const nutrientId of nutrientIds) {
        const target = buildNutrientTarget(nutrientId, ageYears, profile.sex, lifeStageGroup, energy.targetCalories, profile.isPregnant, profile.isLactating);
        if (target) {
            nutrients[nutrientId] = target;
        }
    }
    return {
        calories: energy.targetCalories,
        nutrients,
        profile: {
            ageYears,
            sex: profile.sex,
            lifeStageGroup,
            activityLevel: profile.activityLevel,
            goal: profile.goal,
        },
        computedAt: new Date().toISOString(),
    };
}
/**
 * Get a single nutrient target
 */
function computeSingleTarget(profile, nutrientId) {
    const { years: ageYears } = (0, ageUtils_1.calculateAge)(profile.dateOfBirth);
    const lifeStageGroup = (0, ageUtils_1.getLifeStageGroup)(ageYears, profile.sex, profile.isPregnant, profile.isLactating);
    const energy = (0, calorieCalculator_1.calculateEnergy)(profile.dateOfBirth, profile.sex, profile.weightKg, profile.heightCm, profile.activityLevel, profile.goal, profile.isPregnant, profile.isLactating);
    return buildNutrientTarget(nutrientId, ageYears, profile.sex, lifeStageGroup, energy.targetCalories, profile.isPregnant, profile.isLactating);
}
/**
 * Get calorie target only (without full nutrient computation)
 */
function computeCalorieTarget(profile) {
    const energy = (0, calorieCalculator_1.calculateEnergy)(profile.dateOfBirth, profile.sex, profile.weightKg, profile.heightCm, profile.activityLevel, profile.goal, profile.isPregnant, profile.isLactating);
    return energy.targetCalories;
}
//# sourceMappingURL=targetComputer.js.map