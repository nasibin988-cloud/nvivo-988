"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateNutritionWeek = exports.getNutrientInfo = exports.getNutritionTargets = exports.evaluateNutritionDay = exports.analyzeFoodText = exports.searchFoods = exports.scanMenuPhoto = exports.analyzeFoodPhoto = exports.clearCareDataFn = exports.seedCareDataFn = exports.getAppointmentsFn = exports.getCarePlanGoalsFn = exports.completeTaskFn = exports.getTasksFn = exports.logMedicationDoseFn = exports.getMedicationScheduleFn = exports.getMedicationsFn = exports.getCareTeamFn = exports.getCareDataFn = exports.completeMicroWin = exports.getDailyMicroWins = exports.reseedHealthTrendsFn = exports.reseedMicroWinsFn = exports.seedArticlesFn = exports.deleteTestPatientFn = exports.seedTestPatientFn = void 0;
const admin = __importStar(require("firebase-admin"));
const v2_1 = require("firebase-functions/v2");
const index_1 = require("./seed/index");
const dailyMicroWins_1 = require("./domains/gamification/dailyMicroWins");
const careDataFunctions = __importStar(require("./domains/care/careData"));
const seedCareData_1 = require("./seed/seedCareData");
const seedMicroWins_1 = require("./seed/seedMicroWins");
const seedHealthTrends_1 = require("./seed/seedHealthTrends");
const foodAnalysis_1 = require("./domains/ai/foodAnalysis");
const menuScanning_1 = require("./domains/ai/menuScanning");
const foodSearch_1 = require("./domains/ai/foodSearch");
// Nutrition evaluation functions
const nutrition_1 = require("./domains/nutrition");
Object.defineProperty(exports, "evaluateNutritionDay", { enumerable: true, get: function () { return nutrition_1.evaluateNutritionDay; } });
Object.defineProperty(exports, "getNutritionTargets", { enumerable: true, get: function () { return nutrition_1.getNutritionTargets; } });
Object.defineProperty(exports, "getNutrientInfo", { enumerable: true, get: function () { return nutrition_1.getNutrientInfo; } });
Object.defineProperty(exports, "evaluateNutritionWeek", { enumerable: true, get: function () { return nutrition_1.evaluateNutritionWeek; } });
// Initialize Firebase Admin
admin.initializeApp();
// Export seed functions (only for development)
exports.seedTestPatientFn = v2_1.https.onCall({ cors: true }, async () => {
    // Seed test patient
    const patientResult = await (0, index_1.seedTestPatient)();
    // Also seed articles
    await (0, index_1.seedArticles)();
    return patientResult;
});
exports.deleteTestPatientFn = v2_1.https.onCall({ cors: true }, async () => {
    return (0, index_1.deleteTestPatient)();
});
exports.seedArticlesFn = v2_1.https.onCall({ cors: true }, async () => {
    return (0, index_1.seedArticles)();
});
/**
 * Reseed MicroWins for test patient - clears existing and regenerates with new challenges
 */
exports.reseedMicroWinsFn = v2_1.https.onCall({ cors: true }, async (request) => {
    var _a;
    const patientId = ((_a = request.data) === null || _a === void 0 ? void 0 : _a.patientId) || 'sarah-mitchell-test';
    // Clear existing micro-wins
    await (0, seedMicroWins_1.clearMicroWins)(patientId);
    // Reseed with new challenges
    await (0, seedMicroWins_1.seedMicroWins)({
        patientId,
        daysToSeed: 7,
        challengesPerDay: 5,
        completionRate: 0.7,
    });
    return { success: true, message: 'MicroWins reseeded successfully' };
});
/**
 * Reseed Health Trends for test patient - clears existing and regenerates 365 days of data
 */
exports.reseedHealthTrendsFn = v2_1.https.onCall({ cors: true }, async (request) => {
    var _a, _b;
    const patientId = ((_a = request.data) === null || _a === void 0 ? void 0 : _a.patientId) || 'sarah-mitchell-test';
    const daysToSeed = ((_b = request.data) === null || _b === void 0 ? void 0 : _b.daysToSeed) || 365;
    // Clear existing health trends
    await (0, seedHealthTrends_1.clearHealthTrends)(patientId);
    // Reseed with new data
    await (0, seedHealthTrends_1.seedHealthTrends)({
        patientId,
        daysToSeed,
    });
    return { success: true, message: `Health trends reseeded (${daysToSeed} days)` };
});
// ============================================================================
// MICRO-WINS FUNCTIONS
// ============================================================================
/**
 * Get or initialize today's MicroWins for the authenticated patient
 */
exports.getDailyMicroWins = v2_1.https.onCall({ cors: true }, async (request) => {
    var _a, _b, _c;
    const patientId = (_a = request.data) === null || _a === void 0 ? void 0 : _a.patientId;
    if (!patientId) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Patient ID is required');
    }
    const challengeCount = (_c = (_b = request.data) === null || _b === void 0 ? void 0 : _b.challengeCount) !== null && _c !== void 0 ? _c : 5;
    try {
        const microWins = await (0, dailyMicroWins_1.getOrInitializeDailyMicroWins)(patientId, challengeCount);
        return microWins;
    }
    catch (error) {
        console.error('Error getting daily MicroWins:', error);
        throw new v2_1.https.HttpsError('internal', 'Failed to get MicroWins');
    }
});
/**
 * Complete or skip a MicroWin challenge
 */
exports.completeMicroWin = v2_1.https.onCall({ cors: true }, async (request) => {
    var _a;
    const { patientId, challengeId, action } = (_a = request.data) !== null && _a !== void 0 ? _a : {};
    if (!patientId) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Patient ID is required');
    }
    if (!challengeId) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Challenge ID is required');
    }
    if (!action || !['complete', 'skip', 'undo'].includes(action)) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Action must be "complete", "skip", or "undo"');
    }
    try {
        const microWins = await (0, dailyMicroWins_1.updateMicroWinChallenge)(patientId, challengeId, action);
        return microWins;
    }
    catch (error) {
        console.error('Error completing MicroWin:', error);
        throw new v2_1.https.HttpsError('internal', 'Failed to complete MicroWin');
    }
});
// ============================================================================
// CARE DATA FUNCTIONS
// ============================================================================
/**
 * Get all care data for a patient
 */
exports.getCareDataFn = v2_1.https.onCall({ cors: true }, async (request) => {
    var _a;
    const patientId = (_a = request.data) === null || _a === void 0 ? void 0 : _a.patientId;
    if (!patientId) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Patient ID is required');
    }
    try {
        return await careDataFunctions.getCareData(patientId);
    }
    catch (error) {
        console.error('Error getting care data:', error);
        throw new v2_1.https.HttpsError('internal', 'Failed to get care data');
    }
});
/**
 * Get care team members
 */
exports.getCareTeamFn = v2_1.https.onCall({ cors: true }, async (request) => {
    var _a;
    const patientId = (_a = request.data) === null || _a === void 0 ? void 0 : _a.patientId;
    if (!patientId) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Patient ID is required');
    }
    try {
        return await careDataFunctions.getCareTeam(patientId);
    }
    catch (error) {
        console.error('Error getting care team:', error);
        throw new v2_1.https.HttpsError('internal', 'Failed to get care team');
    }
});
/**
 * Get medications
 */
exports.getMedicationsFn = v2_1.https.onCall({ cors: true }, async (request) => {
    var _a;
    const patientId = (_a = request.data) === null || _a === void 0 ? void 0 : _a.patientId;
    if (!patientId) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Patient ID is required');
    }
    try {
        return await careDataFunctions.getMedications(patientId);
    }
    catch (error) {
        console.error('Error getting medications:', error);
        throw new v2_1.https.HttpsError('internal', 'Failed to get medications');
    }
});
/**
 * Get today's medication schedule
 */
exports.getMedicationScheduleFn = v2_1.https.onCall({ cors: true }, async (request) => {
    var _a;
    const patientId = (_a = request.data) === null || _a === void 0 ? void 0 : _a.patientId;
    if (!patientId) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Patient ID is required');
    }
    try {
        return await careDataFunctions.getMedicationSchedule(patientId);
    }
    catch (error) {
        console.error('Error getting medication schedule:', error);
        throw new v2_1.https.HttpsError('internal', 'Failed to get medication schedule');
    }
});
/**
 * Log medication dose
 */
exports.logMedicationDoseFn = v2_1.https.onCall({ cors: true }, async (request) => {
    var _a;
    const { patientId, doseId, action } = (_a = request.data) !== null && _a !== void 0 ? _a : {};
    if (!patientId) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Patient ID is required');
    }
    if (!doseId) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Dose ID is required');
    }
    if (!action || !['taken', 'skipped'].includes(action)) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Action must be "taken" or "skipped"');
    }
    try {
        return await careDataFunctions.logMedicationDose(patientId, doseId, action);
    }
    catch (error) {
        console.error('Error logging medication dose:', error);
        throw new v2_1.https.HttpsError('internal', 'Failed to log medication dose');
    }
});
/**
 * Get tasks
 */
exports.getTasksFn = v2_1.https.onCall({ cors: true }, async (request) => {
    var _a;
    const patientId = (_a = request.data) === null || _a === void 0 ? void 0 : _a.patientId;
    if (!patientId) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Patient ID is required');
    }
    try {
        return await careDataFunctions.getTasks(patientId);
    }
    catch (error) {
        console.error('Error getting tasks:', error);
        throw new v2_1.https.HttpsError('internal', 'Failed to get tasks');
    }
});
/**
 * Complete a task
 */
exports.completeTaskFn = v2_1.https.onCall({ cors: true }, async (request) => {
    var _a;
    const { patientId, taskId } = (_a = request.data) !== null && _a !== void 0 ? _a : {};
    if (!patientId) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Patient ID is required');
    }
    if (!taskId) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Task ID is required');
    }
    try {
        return await careDataFunctions.completeTask(patientId, taskId);
    }
    catch (error) {
        console.error('Error completing task:', error);
        throw new v2_1.https.HttpsError('internal', 'Failed to complete task');
    }
});
/**
 * Get care plan goals
 */
exports.getCarePlanGoalsFn = v2_1.https.onCall({ cors: true }, async (request) => {
    var _a;
    const patientId = (_a = request.data) === null || _a === void 0 ? void 0 : _a.patientId;
    if (!patientId) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Patient ID is required');
    }
    try {
        return await careDataFunctions.getCarePlanGoals(patientId);
    }
    catch (error) {
        console.error('Error getting care plan goals:', error);
        throw new v2_1.https.HttpsError('internal', 'Failed to get care plan goals');
    }
});
/**
 * Get appointments
 */
exports.getAppointmentsFn = v2_1.https.onCall({ cors: true }, async (request) => {
    var _a;
    const patientId = (_a = request.data) === null || _a === void 0 ? void 0 : _a.patientId;
    if (!patientId) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Patient ID is required');
    }
    try {
        return await careDataFunctions.getAppointments(patientId);
    }
    catch (error) {
        console.error('Error getting appointments:', error);
        throw new v2_1.https.HttpsError('internal', 'Failed to get appointments');
    }
});
/**
 * Seed care data for a patient (development only)
 */
exports.seedCareDataFn = v2_1.https.onCall({ cors: true }, async (request) => {
    var _a;
    const patientId = (_a = request.data) === null || _a === void 0 ? void 0 : _a.patientId;
    if (!patientId) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Patient ID is required');
    }
    try {
        await (0, seedCareData_1.seedCareData)({ patientId });
        return { success: true };
    }
    catch (error) {
        console.error('Error seeding care data:', error);
        throw new v2_1.https.HttpsError('internal', 'Failed to seed care data');
    }
});
/**
 * Clear care data for a patient (development only)
 */
exports.clearCareDataFn = v2_1.https.onCall({ cors: true }, async (request) => {
    var _a;
    const patientId = (_a = request.data) === null || _a === void 0 ? void 0 : _a.patientId;
    if (!patientId) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Patient ID is required');
    }
    try {
        await (0, seedCareData_1.clearCareData)(patientId);
        return { success: true };
    }
    catch (error) {
        console.error('Error clearing care data:', error);
        throw new v2_1.https.HttpsError('internal', 'Failed to clear care data');
    }
});
// ============================================================================
// AI FOOD ANALYSIS FUNCTIONS
// ============================================================================
/**
 * Analyze a food photo using GPT-4 Vision
 * Returns nutritional information for detected food items
 *
 * @param imageBase64 - Base64 encoded image data
 * @param detailLevel - Nutrition detail level: 'essential' | 'extended' | 'complete'
 *   - essential: Basic macros (calories, protein, carbs, fat, fiber, sugar, sodium)
 *   - extended: + fat breakdown, key minerals (potassium, calcium, iron, magnesium)
 *   - complete: + all vitamins, trace minerals, fatty acid details
 */
exports.analyzeFoodPhoto = v2_1.https.onCall({
    cors: true,
    secrets: [foodAnalysis_1.openaiApiKey],
}, async (request) => {
    var _a;
    const { imageBase64, detailLevel = 'essential' } = (_a = request.data) !== null && _a !== void 0 ? _a : {};
    if (!imageBase64) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Image data is required');
    }
    // Validate base64 string (basic check)
    if (typeof imageBase64 !== 'string' || imageBase64.length < 100) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Invalid image data');
    }
    // Validate detail level
    const validLevels = ['essential', 'extended', 'complete'];
    if (!validLevels.includes(detailLevel)) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Invalid detail level. Must be: essential, extended, or complete');
    }
    try {
        // Note: detailLevel is accepted for backward compatibility but analysis always returns complete data
        // The UI filters what to display based on user preference
        // Photo analysis always uses 'full' model for best accuracy
        const result = await (0, foodAnalysis_1.analyzeFoodPhoto)(imageBase64, 'full');
        return result;
    }
    catch (error) {
        console.error('Error analyzing food photo:', error);
        throw new v2_1.https.HttpsError('internal', 'Failed to analyze food photo');
    }
});
/**
 * Scan a restaurant menu photo using GPT-4 Vision
 * Returns extracted menu items with estimated nutritional information
 */
exports.scanMenuPhoto = v2_1.https.onCall({
    cors: true,
    secrets: [foodAnalysis_1.openaiApiKey],
}, async (request) => {
    var _a;
    const { imageBase64 } = (_a = request.data) !== null && _a !== void 0 ? _a : {};
    if (!imageBase64) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Image data is required');
    }
    // Validate base64 string (basic check)
    if (typeof imageBase64 !== 'string' || imageBase64.length < 100) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Invalid image data');
    }
    try {
        const result = await (0, menuScanning_1.scanMenuPhoto)(imageBase64);
        return result;
    }
    catch (error) {
        console.error('Error scanning menu photo:', error);
        throw new v2_1.https.HttpsError('internal', 'Failed to scan menu photo');
    }
});
/**
 * Search foods using USDA FoodData Central
 * Returns foods matching the query with nutrition information
 *
 * @param query - Search query string
 * @param limit - Max number of results (default 15)
 * @param detailLevel - Nutrition detail level: 'essential' | 'extended' | 'complete'
 *   - essential: Basic macros (calories, protein, carbs, fat, fiber, sugar, sodium)
 *   - extended: + fat breakdown, key minerals (potassium, calcium, iron, magnesium)
 *   - complete: + all vitamins, trace minerals, fatty acid details
 */
exports.searchFoods = v2_1.https.onCall({
    cors: true,
    secrets: [foodSearch_1.usdaApiKey],
}, async (request) => {
    var _a;
    const { query, limit, detailLevel = 'essential' } = (_a = request.data) !== null && _a !== void 0 ? _a : {};
    if (!query || typeof query !== 'string') {
        throw new v2_1.https.HttpsError('invalid-argument', 'Search query is required');
    }
    if (query.length < 2) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Query must be at least 2 characters');
    }
    // Validate detail level
    const validLevels = ['essential', 'extended', 'complete'];
    if (!validLevels.includes(detailLevel)) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Invalid detail level. Must be: essential, extended, or complete');
    }
    try {
        const results = await (0, foodSearch_1.searchFoods)(query, limit || 15, detailLevel);
        return results;
    }
    catch (error) {
        console.error('Error searching foods:', error);
        throw new v2_1.https.HttpsError('internal', 'Failed to search foods');
    }
});
/**
 * Analyze food from text description using AI
 * Takes a natural language food description and returns nutritional estimates
 * Uses typical portion sizes for common foods when not specified
 *
 * Examples:
 * - "grilled chicken breast with rice and broccoli"
 * - "2 eggs, toast with butter, orange juice"
 * - "caesar salad"
 *
 * @param foodDescription - Natural language description of food
 * @param detailLevel - Nutrition detail level: 'essential' | 'extended' | 'complete'
 *   - essential: Basic macros (calories, protein, carbs, fat, fiber, sugar, sodium)
 *   - extended: + fat breakdown, key minerals (potassium, calcium, iron, magnesium)
 *   - complete: + all vitamins, trace minerals, fatty acid details
 *
 * Returns items with servingMultiplier field that can be adjusted by user
 */
exports.analyzeFoodText = v2_1.https.onCall({
    cors: true,
    secrets: [foodAnalysis_1.openaiApiKey],
}, async (request) => {
    var _a;
    const { foodDescription, detailLevel = 'essential' } = (_a = request.data) !== null && _a !== void 0 ? _a : {};
    if (!foodDescription) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Food description is required');
    }
    if (typeof foodDescription !== 'string' || foodDescription.length < 2) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Food description must be at least 2 characters');
    }
    if (foodDescription.length > 500) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Food description must be less than 500 characters');
    }
    // Validate detail level
    const validLevels = ['essential', 'extended', 'complete'];
    if (!validLevels.includes(detailLevel)) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Invalid detail level. Must be: essential, extended, or complete');
    }
    try {
        // Note: detailLevel is accepted for backward compatibility but analysis always returns complete data
        // The UI filters what to display based on user preference
        const result = await (0, foodAnalysis_1.analyzeFoodText)(foodDescription, false);
        return result;
    }
    catch (error) {
        console.error('Error analyzing food text:', error);
        throw new v2_1.https.HttpsError('internal', 'Failed to analyze food description');
    }
});
//# sourceMappingURL=index.js.map