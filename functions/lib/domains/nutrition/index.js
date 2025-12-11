"use strict";
/**
 * Nutrition Domain Module
 *
 * Comprehensive nutrition evaluation system including:
 * - Reference data loading (DRI, FDA Daily Values, etc.)
 * - Personalized target calculation
 * - Intake evaluation and scoring
 * - Educational insights generation
 * - Cloud Functions API
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateNutritionWeek = exports.getNutrientInfo = exports.getNutritionTargets = exports.evaluateNutritionDay = exports.generateWeeklySummary = exports.generateDailySummary = exports.generateGapInfo = exports.generateHighlights = exports.getFoodSuggestions = exports.getWhyItMatters = exports.getNutrientEducation = exports.quickScore = exports.calculateScore = exports.evaluateDayWithTargets = exports.evaluateDay = exports.evaluateNutrients = exports.evaluateNutrient = exports.computeUserTargets = exports.calculateEnergy = exports.calculateTargetCalories = exports.calculateTDEE = exports.calculateBMR = exports.getLifeStageGroup = exports.calculateAge = exports.preloadAllData = exports.nutritionData = exports.NutritionDataService = void 0;
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
// Evaluation engine
var evaluation_1 = require("./evaluation");
Object.defineProperty(exports, "evaluateNutrient", { enumerable: true, get: function () { return evaluation_1.evaluateNutrient; } });
Object.defineProperty(exports, "evaluateNutrients", { enumerable: true, get: function () { return evaluation_1.evaluateNutrients; } });
Object.defineProperty(exports, "evaluateDay", { enumerable: true, get: function () { return evaluation_1.evaluateDay; } });
Object.defineProperty(exports, "evaluateDayWithTargets", { enumerable: true, get: function () { return evaluation_1.evaluateDayWithTargets; } });
Object.defineProperty(exports, "calculateScore", { enumerable: true, get: function () { return evaluation_1.calculateScore; } });
Object.defineProperty(exports, "quickScore", { enumerable: true, get: function () { return evaluation_1.quickScore; } });
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
Object.defineProperty(exports, "evaluateNutritionDay", { enumerable: true, get: function () { return api_1.evaluateNutritionDay; } });
Object.defineProperty(exports, "getNutritionTargets", { enumerable: true, get: function () { return api_1.getNutritionTargets; } });
Object.defineProperty(exports, "getNutrientInfo", { enumerable: true, get: function () { return api_1.getNutrientInfo; } });
Object.defineProperty(exports, "evaluateNutritionWeek", { enumerable: true, get: function () { return api_1.evaluateNutritionWeek; } });
//# sourceMappingURL=index.js.map