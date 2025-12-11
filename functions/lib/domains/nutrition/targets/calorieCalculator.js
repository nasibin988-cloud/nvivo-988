"use strict";
/**
 * Calorie Calculator
 *
 * Calculates BMR, TDEE, and target calories using the Mifflin-St Jeor equation.
 * This is considered the most accurate formula for estimating metabolic rate.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBMR = calculateBMR;
exports.calculateTDEE = calculateTDEE;
exports.calculateTargetCalories = calculateTargetCalories;
exports.calculateEnergy = calculateEnergy;
exports.getActivityMultiplier = getActivityMultiplier;
exports.getGoalAdjustment = getGoalAdjustment;
const ageUtils_1 = require("./ageUtils");
/**
 * Activity level multipliers (PAL - Physical Activity Level)
 * Based on IOM dietary reference intakes
 */
const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2, // Little or no exercise, desk job
    light: 1.375, // Light exercise 1-3 days/week
    moderate: 1.55, // Moderate exercise 3-5 days/week
    high: 1.725, // Hard exercise 6-7 days/week
    athlete: 1.9, // Very hard exercise, physical job, or 2x/day training
};
/**
 * Goal-based calorie adjustments
 */
const GOAL_ADJUSTMENTS = {
    weight_loss: -500, // ~1 lb/week loss (500 kcal deficit)
    maintenance: 0, // No adjustment
    weight_gain: 300, // Gradual surplus
    muscle_gain: 300, // Surplus for muscle building
    performance: 400, // Higher surplus for athletic performance
};
/**
 * Default calorie values when BMR cannot be calculated (missing weight/height)
 */
const DEFAULT_CALORIES = {
    male: 2500,
    female: 2000,
};
/**
 * Minimum safe calorie levels
 */
const MINIMUM_CALORIES = {
    male: 1500,
    female: 1200,
};
/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation (1990)
 *
 * Male:   BMR = 10×weight(kg) + 6.25×height(cm) - 5×age + 5
 * Female: BMR = 10×weight(kg) + 6.25×height(cm) - 5×age - 161
 *
 * @param weightKg - Weight in kilograms
 * @param heightCm - Height in centimeters
 * @param ageYears - Age in years
 * @param sex - Biological sex
 * @returns BMR in kcal/day
 */
function calculateBMR(weightKg, heightCm, ageYears, sex) {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
    return sex === 'male' ? base + 5 : base - 161;
}
/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * TDEE = BMR × Activity Multiplier
 */
function calculateTDEE(bmr, activityLevel) {
    var _a;
    const multiplier = (_a = ACTIVITY_MULTIPLIERS[activityLevel]) !== null && _a !== void 0 ? _a : 1.55;
    return Math.round(bmr * multiplier);
}
/**
 * Calculate target calories including goal adjustment
 */
function calculateTargetCalories(tdee, goal, sex) {
    var _a;
    const adjustment = (_a = GOAL_ADJUSTMENTS[goal]) !== null && _a !== void 0 ? _a : 0;
    const target = tdee + adjustment;
    // Ensure minimum safe calories
    const minimum = MINIMUM_CALORIES[sex];
    return Math.max(minimum, Math.round(target));
}
/**
 * Complete energy calculation from user profile data
 *
 * @param dateOfBirth - ISO date string
 * @param sex - 'male' or 'female'
 * @param weightKg - Weight in kg (optional)
 * @param heightCm - Height in cm (optional)
 * @param activityLevel - Activity level
 * @param goal - Nutrition goal
 * @param isPregnant - Whether user is pregnant
 * @param isLactating - Whether user is lactating
 */
function calculateEnergy(dateOfBirth, sex, weightKg, heightCm, activityLevel, goal, isPregnant, isLactating) {
    var _a, _b;
    const { years: ageYears } = (0, ageUtils_1.calculateAge)(dateOfBirth);
    const activityMultiplier = (_a = ACTIVITY_MULTIPLIERS[activityLevel]) !== null && _a !== void 0 ? _a : 1.55;
    const goalAdjustment = (_b = GOAL_ADJUSTMENTS[goal]) !== null && _b !== void 0 ? _b : 0;
    // If we have weight and height, use Mifflin-St Jeor
    if (weightKg && heightCm) {
        const bmr = calculateBMR(weightKg, heightCm, ageYears, sex);
        let tdee = calculateTDEE(bmr, activityLevel);
        // Pregnancy/lactation adjustments (from IOM)
        if (isPregnant) {
            tdee += 340; // Average additional needs during pregnancy
        }
        else if (isLactating) {
            tdee += 400; // Additional needs for milk production
        }
        const targetCalories = calculateTargetCalories(tdee, goal, sex);
        return {
            bmr: Math.round(bmr),
            tdee,
            targetCalories,
            activityMultiplier,
            goalAdjustment,
            method: 'mifflin_st_jeor',
        };
    }
    // Fallback to defaults when weight/height not available
    let defaultCalories = DEFAULT_CALORIES[sex];
    // Pregnancy/lactation adjustments
    if (isPregnant) {
        defaultCalories += 340;
    }
    else if (isLactating) {
        defaultCalories += 400;
    }
    const adjustedDefault = defaultCalories + goalAdjustment;
    const minimum = MINIMUM_CALORIES[sex];
    return {
        bmr: Math.round(defaultCalories / activityMultiplier),
        tdee: defaultCalories,
        targetCalories: Math.max(minimum, adjustedDefault),
        activityMultiplier,
        goalAdjustment,
        method: 'default',
    };
}
/**
 * Get activity multiplier value for display
 */
function getActivityMultiplier(activityLevel) {
    var _a;
    return (_a = ACTIVITY_MULTIPLIERS[activityLevel]) !== null && _a !== void 0 ? _a : 1.55;
}
/**
 * Get goal adjustment value for display
 */
function getGoalAdjustment(goal) {
    var _a;
    return (_a = GOAL_ADJUSTMENTS[goal]) !== null && _a !== void 0 ? _a : 0;
}
//# sourceMappingURL=calorieCalculator.js.map