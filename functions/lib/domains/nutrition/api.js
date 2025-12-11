"use strict";
/**
 * Nutrition API Module
 *
 * Cloud Functions for nutrition evaluation and insights.
 * These functions are exposed as Firebase Callable Functions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateNutritionWeek = exports.getNutrientInfo = exports.getNutritionTargets = exports.evaluateNutritionDay = void 0;
exports.handleEvaluateDay = handleEvaluateDay;
exports.handleGetTargets = handleGetTargets;
exports.handleGetNutrientInfo = handleGetNutrientInfo;
exports.handleEvaluateWeek = handleEvaluateWeek;
const v2_1 = require("firebase-functions/v2");
const data_1 = require("./data");
const targets_1 = require("./targets");
const evaluation_1 = require("./evaluation");
const insights_1 = require("./insights");
// Preload all nutrition data on cold start
(0, data_1.preloadAllData)();
// =============================================================================
// VALIDATION HELPERS
// =============================================================================
function validateProfile(profile) {
    if (!profile || typeof profile !== 'object') {
        throw new v2_1.https.HttpsError('invalid-argument', 'Profile is required');
    }
    const p = profile;
    if (!p.userId || typeof p.userId !== 'string') {
        throw new v2_1.https.HttpsError('invalid-argument', 'Profile.userId is required');
    }
    if (!p.dateOfBirth || typeof p.dateOfBirth !== 'string') {
        throw new v2_1.https.HttpsError('invalid-argument', 'Profile.dateOfBirth is required');
    }
    if (!p.sex || !['male', 'female'].includes(p.sex)) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Profile.sex must be "male" or "female"');
    }
    if (!p.activityLevel || !['sedentary', 'light', 'moderate', 'high', 'athlete'].includes(p.activityLevel)) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Profile.activityLevel must be one of: sedentary, light, moderate, high, athlete');
    }
    if (!p.goal || !['weight_loss', 'maintenance', 'weight_gain', 'muscle_gain', 'performance'].includes(p.goal)) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Profile.goal must be one of: weight_loss, maintenance, weight_gain, muscle_gain, performance');
    }
    return profile;
}
function validateIntake(intake) {
    if (!intake || typeof intake !== 'object') {
        throw new v2_1.https.HttpsError('invalid-argument', 'Intake data is required');
    }
    const i = intake;
    if (!i.date || typeof i.date !== 'string') {
        throw new v2_1.https.HttpsError('invalid-argument', 'Intake.date is required');
    }
    if (!i.totals || typeof i.totals !== 'object') {
        throw new v2_1.https.HttpsError('invalid-argument', 'Intake.totals is required');
    }
    // foods array is optional but must be array if present
    if (i.foods !== undefined && !Array.isArray(i.foods)) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Intake.foods must be an array');
    }
    return intake;
}
// =============================================================================
// CALLABLE FUNCTION HANDLERS
// =============================================================================
/**
 * Handler for evaluateNutritionDay callable function
 */
async function handleEvaluateDay(data) {
    const profile = validateProfile(data.profile);
    const intake = validateIntake(data.intake);
    const evaluation = (0, evaluation_1.evaluateDay)(profile, intake);
    return {
        success: true,
        evaluation,
    };
}
/**
 * Handler for getNutritionTargets callable function
 */
async function handleGetTargets(data) {
    const profile = validateProfile(data.profile);
    const targets = (0, targets_1.computeUserTargets)(profile);
    return {
        success: true,
        targets,
    };
}
/**
 * Handler for getNutrientInfo callable function
 */
async function handleGetNutrientInfo(data) {
    const { nutrientId } = data;
    if (!nutrientId || typeof nutrientId !== 'string') {
        throw new v2_1.https.HttpsError('invalid-argument', 'Nutrient ID is required');
    }
    const education = (0, insights_1.getNutrientEducation)(nutrientId);
    const whyItMatters = (0, insights_1.getWhyItMatters)(nutrientId);
    const foodSuggestions = (0, insights_1.getFoodSuggestions)(nutrientId, 10);
    return {
        success: true,
        nutrientId,
        education,
        whyItMatters,
        foodSuggestions,
    };
}
/**
 * Handler for evaluateNutritionWeek callable function
 */
async function handleEvaluateWeek(data) {
    const profile = validateProfile(data.profile);
    if (!data.intakes || !Array.isArray(data.intakes)) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Intakes array is required');
    }
    if (data.intakes.length === 0) {
        return {
            success: true,
            days: [],
            averageScore: 0,
            bestDay: null,
            trend: 'stable',
        };
    }
    if (data.intakes.length > 14) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Maximum 14 days of intake data allowed');
    }
    // Compute targets once for efficiency
    const targets = (0, targets_1.computeUserTargets)(profile);
    // Evaluate each day
    const days = [];
    for (const intake of data.intakes) {
        const validatedIntake = validateIntake(intake);
        const evaluation = (0, evaluation_1.evaluateDayWithTargets)(validatedIntake, targets);
        days.push(evaluation);
    }
    // Sort by date
    days.sort((a, b) => a.date.localeCompare(b.date));
    // Calculate average score
    const scores = days.map(d => d.score);
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    // Find best day
    const bestDayEval = days.reduce((best, day) => { var _a; return (day.score > ((_a = best === null || best === void 0 ? void 0 : best.score) !== null && _a !== void 0 ? _a : 0) ? day : best); }, days[0]);
    const bestDay = bestDayEval
        ? { date: bestDayEval.date, score: bestDayEval.score }
        : null;
    // Determine trend
    let trend = 'stable';
    if (scores.length >= 4) {
        const midpoint = Math.floor(scores.length / 2);
        const firstHalf = scores.slice(0, midpoint);
        const secondHalf = scores.slice(midpoint);
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        if (secondAvg > firstAvg + 5)
            trend = 'improving';
        else if (secondAvg < firstAvg - 5)
            trend = 'declining';
    }
    return {
        success: true,
        days,
        averageScore,
        bestDay,
        trend,
    };
}
// =============================================================================
// FIREBASE CALLABLE FUNCTIONS
// =============================================================================
/**
 * Evaluate a single day's nutrition intake
 *
 * @param profile - User's nutrition profile (age, sex, activity, goal)
 * @param intake - Day's food intake with nutrient totals
 * @returns Full day evaluation with score, highlights, gaps, summary
 */
exports.evaluateNutritionDay = v2_1.https.onCall({ cors: true }, async (request) => {
    const data = request.data;
    return handleEvaluateDay(data);
});
/**
 * Get personalized nutrition targets for a user
 *
 * @param profile - User's nutrition profile
 * @returns Computed daily targets for all nutrients
 */
exports.getNutritionTargets = v2_1.https.onCall({ cors: true }, async (request) => {
    const data = request.data;
    return handleGetTargets(data);
});
/**
 * Get educational information about a specific nutrient
 *
 * @param nutrientId - The nutrient identifier (e.g., 'vitamin_c', 'protein')
 * @returns Educational content, why it matters, food sources
 */
exports.getNutrientInfo = v2_1.https.onCall({ cors: true }, async (request) => {
    const data = request.data;
    return handleGetNutrientInfo(data);
});
/**
 * Evaluate multiple days of nutrition intake (up to 14 days)
 *
 * @param profile - User's nutrition profile
 * @param intakes - Array of daily intake data
 * @returns Daily evaluations, average score, best day, trend
 */
exports.evaluateNutritionWeek = v2_1.https.onCall({ cors: true }, async (request) => {
    const data = request.data;
    return handleEvaluateWeek(data);
});
//# sourceMappingURL=api.js.map