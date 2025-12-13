"use strict";
/**
 * Grading Layer Exports
 *
 * All grading is deterministic - no AI calls for grades.
 * AI is used for optional comparison insights and food insights.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNutriScore = exports.gradeSingleFocus = exports.calculateDeterministicGrades = exports.batchGenerateFoodInsights = exports.generateFoodInsight = exports.compareTwo = exports.getQuickWinner = exports.compareFoodsWithInsights = exports.compareFoods = exports.batchGradeNutrition = exports.getOverallGrade = exports.gradeFocus = exports.gradeNutritionWithGI = exports.gradeNutrition = void 0;
// Main grading
var grader_1 = require("./grader");
Object.defineProperty(exports, "gradeNutrition", { enumerable: true, get: function () { return grader_1.gradeNutrition; } });
Object.defineProperty(exports, "gradeNutritionWithGI", { enumerable: true, get: function () { return grader_1.gradeNutritionWithGI; } });
Object.defineProperty(exports, "gradeFocus", { enumerable: true, get: function () { return grader_1.gradeFocus; } });
Object.defineProperty(exports, "getOverallGrade", { enumerable: true, get: function () { return grader_1.getOverallGrade; } });
Object.defineProperty(exports, "batchGradeNutrition", { enumerable: true, get: function () { return grader_1.batchGradeNutrition; } });
// Comparison
var comparator_1 = require("./comparator");
Object.defineProperty(exports, "compareFoods", { enumerable: true, get: function () { return comparator_1.compareFoods; } });
Object.defineProperty(exports, "compareFoodsWithInsights", { enumerable: true, get: function () { return comparator_1.compareFoodsWithInsights; } });
Object.defineProperty(exports, "getQuickWinner", { enumerable: true, get: function () { return comparator_1.getQuickWinner; } });
Object.defineProperty(exports, "compareTwo", { enumerable: true, get: function () { return comparator_1.compareTwo; } });
// AI Insights for individual foods
var insightGenerator_1 = require("./insightGenerator");
Object.defineProperty(exports, "generateFoodInsight", { enumerable: true, get: function () { return insightGenerator_1.generateFoodInsight; } });
Object.defineProperty(exports, "batchGenerateFoodInsights", { enumerable: true, get: function () { return insightGenerator_1.batchGenerateFoodInsights; } });
// Re-export from original for compatibility
var deterministicGrading_1 = require("../../deterministicGrading");
Object.defineProperty(exports, "calculateDeterministicGrades", { enumerable: true, get: function () { return deterministicGrading_1.calculateDeterministicGrades; } });
Object.defineProperty(exports, "gradeSingleFocus", { enumerable: true, get: function () { return deterministicGrading_1.gradeSingleFocus; } });
Object.defineProperty(exports, "getNutriScore", { enumerable: true, get: function () { return deterministicGrading_1.getNutriScore; } });
//# sourceMappingURL=index.js.map