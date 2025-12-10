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
exports.searchFoods = exports.analyzeFoodPhoto = exports.clearCareDataFn = exports.seedCareDataFn = exports.getAppointmentsFn = exports.getCarePlanGoalsFn = exports.completeTaskFn = exports.getTasksFn = exports.logMedicationDoseFn = exports.getMedicationScheduleFn = exports.getMedicationsFn = exports.getCareTeamFn = exports.getCareDataFn = exports.completeMicroWin = exports.getDailyMicroWins = exports.reseedHealthTrendsFn = exports.reseedMicroWinsFn = exports.deleteTestPatientFn = exports.seedTestPatientFn = void 0;
const admin = __importStar(require("firebase-admin"));
const v2_1 = require("firebase-functions/v2");
const seed_1 = require("./seed");
const dailyMicroWins_1 = require("./domains/gamification/dailyMicroWins");
const careDataFunctions = __importStar(require("./domains/care/careData"));
const seedCareData_1 = require("./seed/seedCareData");
const seedMicroWins_1 = require("./seed/seedMicroWins");
const seedHealthTrends_1 = require("./seed/seedHealthTrends");
const foodAnalysis_1 = require("./domains/ai/foodAnalysis");
const foodSearch_1 = require("./domains/ai/foodSearch");
// Initialize Firebase Admin
admin.initializeApp();
// Export seed functions (only for development)
exports.seedTestPatientFn = v2_1.https.onCall({ cors: true }, async () => {
    return (0, seed_1.seedTestPatient)();
});
exports.deleteTestPatientFn = v2_1.https.onCall({ cors: true }, async () => {
    return (0, seed_1.deleteTestPatient)();
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
 */
exports.analyzeFoodPhoto = v2_1.https.onCall({
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
        const result = await (0, foodAnalysis_1.analyzeFoodPhoto)(imageBase64);
        return result;
    }
    catch (error) {
        console.error('Error analyzing food photo:', error);
        throw new v2_1.https.HttpsError('internal', 'Failed to analyze food photo');
    }
});
/**
 * Search foods using USDA FoodData Central
 * Returns foods matching the query with nutrition information
 */
exports.searchFoods = v2_1.https.onCall({
    cors: true,
    secrets: [foodSearch_1.usdaApiKey],
}, async (request) => {
    var _a;
    const { query, limit } = (_a = request.data) !== null && _a !== void 0 ? _a : {};
    if (!query || typeof query !== 'string') {
        throw new v2_1.https.HttpsError('invalid-argument', 'Search query is required');
    }
    if (query.length < 2) {
        throw new v2_1.https.HttpsError('invalid-argument', 'Query must be at least 2 characters');
    }
    try {
        const results = await (0, foodSearch_1.searchFoods)(query, limit || 15);
        return results;
    }
    catch (error) {
        console.error('Error searching foods:', error);
        throw new v2_1.https.HttpsError('internal', 'Failed to search foods');
    }
});
//# sourceMappingURL=index.js.map