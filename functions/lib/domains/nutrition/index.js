"use strict";
/**
 * Nutrition Domain Module
 *
 * Comprehensive nutrition evaluation system including:
 * - Reference data loading (DRI, FDA Daily Values, etc.)
 * - Personalized target calculation
 * - Intake evaluation and scoring
 * - Focus-specific scoring (10 nutrition focuses)
 * - Educational insights generation
 * - Cloud Functions API
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNutritionFocusOptions = exports.evaluateNutritionWeekV2 = exports.evaluateNutritionDayV2 = exports.evaluateNutritionWeek = exports.getNutrientInfo = exports.getNutritionTargets = exports.evaluateNutritionDay = exports.generateWeeklySummary = exports.generateDailySummary = exports.generateGapInfo = exports.generateHighlights = exports.getFoodSuggestions = exports.getWhyItMatters = exports.getNutrientEducation = exports.quickScoreV2 = exports.evaluateWeekV2 = exports.evaluateDayWithTargetsV2 = exports.evaluateDayV2 = exports.calculateCumulativeWeeklyMAR = exports.calculateWeeklyScoreV2 = exports.getScoreColorV2 = exports.getScoreLabelV2 = exports.calculateScoreV2 = exports.quickScore = exports.calculateScore = exports.evaluateDayWithTargets = exports.evaluateDay = exports.evaluateNutrients = exports.evaluateNutrient = exports.getFocusDisplayInfo = exports.getAllFocusIds = exports.getFocusConfig = exports.FOCUS_CONFIGS = exports.computeUserTargets = exports.calculateEnergy = exports.calculateTargetCalories = exports.calculateTDEE = exports.calculateBMR = exports.getLifeStageGroup = exports.calculateAge = exports.preloadAllData = exports.nutritionData = exports.NutritionDataService = void 0;
// Data layer
var data_1 = require("./data");
Object.defineProperty(exports, "NutritionDataService", { enumerable: true, get: function () { return data_1.NutritionDataService; } });
Object.defineProperty(exports, "nutritionData", { enumerable: true, get: function () { return data_1.nutritionData; } });
Object.defineProperty(exports, "preloadAllData", { enumerable: true, get: function () { return data_1.preloadAllData; } });
// Target computation
var targets_1 = require("./targets");
Object.defineProperty(exports, "calculateAge", { enumerable: true, get: function () { return targets_1.calculateAge; } });
Object.defineProperty(exports, "getLifeStageGroup", { enumerable: true, get: function () { return targets_1.getLifeStageGroup; } });
Object.defineProperty(exports, "calculateBMR", { enumerable: true, get: function () { return targets_1.calculateBMR; } });
Object.defineProperty(exports, "calculateTDEE", { enumerable: true, get: function () { return targets_1.calculateTDEE; } });
Object.defineProperty(exports, "calculateTargetCalories", { enumerable: true, get: function () { return targets_1.calculateTargetCalories; } });
Object.defineProperty(exports, "calculateEnergy", { enumerable: true, get: function () { return targets_1.calculateEnergy; } });
Object.defineProperty(exports, "computeUserTargets", { enumerable: true, get: function () { return targets_1.computeUserTargets; } });
// Focus configuration (10 nutrition focuses)
var focus_1 = require("./focus");
Object.defineProperty(exports, "FOCUS_CONFIGS", { enumerable: true, get: function () { return focus_1.FOCUS_CONFIGS; } });
Object.defineProperty(exports, "getFocusConfig", { enumerable: true, get: function () { return focus_1.getFocusConfig; } });
Object.defineProperty(exports, "getAllFocusIds", { enumerable: true, get: function () { return focus_1.getAllFocusIds; } });
Object.defineProperty(exports, "getFocusDisplayInfo", { enumerable: true, get: function () { return focus_1.getFocusDisplayInfo; } });
// Evaluation engine (V1 - legacy)
var evaluation_1 = require("./evaluation");
Object.defineProperty(exports, "evaluateNutrient", { enumerable: true, get: function () { return evaluation_1.evaluateNutrient; } });
Object.defineProperty(exports, "evaluateNutrients", { enumerable: true, get: function () { return evaluation_1.evaluateNutrients; } });
Object.defineProperty(exports, "evaluateDay", { enumerable: true, get: function () { return evaluation_1.evaluateDay; } });
Object.defineProperty(exports, "evaluateDayWithTargets", { enumerable: true, get: function () { return evaluation_1.evaluateDayWithTargets; } });
Object.defineProperty(exports, "calculateScore", { enumerable: true, get: function () { return evaluation_1.calculateScore; } });
Object.defineProperty(exports, "quickScore", { enumerable: true, get: function () { return evaluation_1.quickScore; } });
// Evaluation engine (V2 - advanced with MAR, focus modes)
var evaluation_2 = require("./evaluation");
// Score calculator V2
Object.defineProperty(exports, "calculateScoreV2", { enumerable: true, get: function () { return evaluation_2.calculateScoreV2; } });
Object.defineProperty(exports, "getScoreLabelV2", { enumerable: true, get: function () { return evaluation_2.getScoreLabelV2; } });
Object.defineProperty(exports, "getScoreColorV2", { enumerable: true, get: function () { return evaluation_2.getScoreColorV2; } });
Object.defineProperty(exports, "calculateWeeklyScoreV2", { enumerable: true, get: function () { return evaluation_2.calculateWeeklyScoreV2; } });
Object.defineProperty(exports, "calculateCumulativeWeeklyMAR", { enumerable: true, get: function () { return evaluation_2.calculateCumulativeWeeklyMAR; } });
// Day evaluator V2
Object.defineProperty(exports, "evaluateDayV2", { enumerable: true, get: function () { return evaluation_2.evaluateDayV2; } });
Object.defineProperty(exports, "evaluateDayWithTargetsV2", { enumerable: true, get: function () { return evaluation_2.evaluateDayWithTargetsV2; } });
Object.defineProperty(exports, "evaluateWeekV2", { enumerable: true, get: function () { return evaluation_2.evaluateWeekV2; } });
Object.defineProperty(exports, "quickScoreV2", { enumerable: true, get: function () { return evaluation_2.quickScoreV2; } });
// Insights
var insights_1 = require("./insights");
Object.defineProperty(exports, "getNutrientEducation", { enumerable: true, get: function () { return insights_1.getNutrientEducation; } });
Object.defineProperty(exports, "getWhyItMatters", { enumerable: true, get: function () { return insights_1.getWhyItMatters; } });
Object.defineProperty(exports, "getFoodSuggestions", { enumerable: true, get: function () { return insights_1.getFoodSuggestions; } });
Object.defineProperty(exports, "generateHighlights", { enumerable: true, get: function () { return insights_1.generateHighlights; } });
Object.defineProperty(exports, "generateGapInfo", { enumerable: true, get: function () { return insights_1.generateGapInfo; } });
Object.defineProperty(exports, "generateDailySummary", { enumerable: true, get: function () { return insights_1.generateDailySummary; } });
Object.defineProperty(exports, "generateWeeklySummary", { enumerable: true, get: function () { return insights_1.generateWeeklySummary; } });
// API (Cloud Functions)
var api_1 = require("./api");
// V1 endpoints
Object.defineProperty(exports, "evaluateNutritionDay", { enumerable: true, get: function () { return api_1.evaluateNutritionDay; } });
Object.defineProperty(exports, "getNutritionTargets", { enumerable: true, get: function () { return api_1.getNutritionTargets; } });
Object.defineProperty(exports, "getNutrientInfo", { enumerable: true, get: function () { return api_1.getNutrientInfo; } });
Object.defineProperty(exports, "evaluateNutritionWeek", { enumerable: true, get: function () { return api_1.evaluateNutritionWeek; } });
// V2 endpoints (advanced scoring)
Object.defineProperty(exports, "evaluateNutritionDayV2", { enumerable: true, get: function () { return api_1.evaluateNutritionDayV2; } });
Object.defineProperty(exports, "evaluateNutritionWeekV2", { enumerable: true, get: function () { return api_1.evaluateNutritionWeekV2; } });
Object.defineProperty(exports, "getNutritionFocusOptions", { enumerable: true, get: function () { return api_1.getNutritionFocusOptions; } });
//# sourceMappingURL=index.js.map