"use strict";
/**
 * Nutrition Evaluation Module
 *
 * Exports functions for evaluating nutrient intake against targets.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.quickScoreV2 = exports.evaluateWeekV2 = exports.evaluateDayWithTargetsV2 = exports.evaluateDayV2 = exports.calculateCumulativeWeeklyMAR = exports.calculateWeeklyScoreV2 = exports.getScoreColorV2 = exports.getScoreLabelV2 = exports.calculateScoreV2 = exports.quickScore = exports.evaluateDayWithTargets = exports.evaluateDay = exports.calculateWeeklyScore = exports.getScoreColor = exports.getScoreLabel = exports.calculateScore = exports.findHighlights = exports.findExceedingLimits = exports.findNutrientGaps = exports.evaluateNutrients = exports.evaluateNutrient = exports.getUpperLimitWarning = exports.isOverUpperLimit = exports.getStatusColor = exports.getStatusLabel = exports.classifyNutrientIntake = exports.classifyLimitIntake = exports.classifyBeneficialIntake = void 0;
// Classifier
var classifier_1 = require("./classifier");
Object.defineProperty(exports, "classifyBeneficialIntake", { enumerable: true, get: function () { return classifier_1.classifyBeneficialIntake; } });
Object.defineProperty(exports, "classifyLimitIntake", { enumerable: true, get: function () { return classifier_1.classifyLimitIntake; } });
Object.defineProperty(exports, "classifyNutrientIntake", { enumerable: true, get: function () { return classifier_1.classifyNutrientIntake; } });
Object.defineProperty(exports, "getStatusLabel", { enumerable: true, get: function () { return classifier_1.getStatusLabel; } });
Object.defineProperty(exports, "getStatusColor", { enumerable: true, get: function () { return classifier_1.getStatusColor; } });
Object.defineProperty(exports, "isOverUpperLimit", { enumerable: true, get: function () { return classifier_1.isOverUpperLimit; } });
Object.defineProperty(exports, "getUpperLimitWarning", { enumerable: true, get: function () { return classifier_1.getUpperLimitWarning; } });
// Nutrient evaluator
var nutrientEvaluator_1 = require("./nutrientEvaluator");
Object.defineProperty(exports, "evaluateNutrient", { enumerable: true, get: function () { return nutrientEvaluator_1.evaluateNutrient; } });
Object.defineProperty(exports, "evaluateNutrients", { enumerable: true, get: function () { return nutrientEvaluator_1.evaluateNutrients; } });
Object.defineProperty(exports, "findNutrientGaps", { enumerable: true, get: function () { return nutrientEvaluator_1.findNutrientGaps; } });
Object.defineProperty(exports, "findExceedingLimits", { enumerable: true, get: function () { return nutrientEvaluator_1.findExceedingLimits; } });
Object.defineProperty(exports, "findHighlights", { enumerable: true, get: function () { return nutrientEvaluator_1.findHighlights; } });
// Score calculator (V1 - legacy)
var scoreCalculator_1 = require("./scoreCalculator");
Object.defineProperty(exports, "calculateScore", { enumerable: true, get: function () { return scoreCalculator_1.calculateScore; } });
Object.defineProperty(exports, "getScoreLabel", { enumerable: true, get: function () { return scoreCalculator_1.getScoreLabel; } });
Object.defineProperty(exports, "getScoreColor", { enumerable: true, get: function () { return scoreCalculator_1.getScoreColor; } });
Object.defineProperty(exports, "calculateWeeklyScore", { enumerable: true, get: function () { return scoreCalculator_1.calculateWeeklyScore; } });
// Day evaluator (V1 - legacy)
var dayEvaluator_1 = require("./dayEvaluator");
Object.defineProperty(exports, "evaluateDay", { enumerable: true, get: function () { return dayEvaluator_1.evaluateDay; } });
Object.defineProperty(exports, "evaluateDayWithTargets", { enumerable: true, get: function () { return dayEvaluator_1.evaluateDayWithTargets; } });
Object.defineProperty(exports, "quickScore", { enumerable: true, get: function () { return dayEvaluator_1.quickScore; } });
// =============================================================================
// V2 - Advanced scoring with MAR, focus modes, and quality metrics
// =============================================================================
// Score calculator V2
var scoreCalculatorV2_1 = require("./scoreCalculatorV2");
Object.defineProperty(exports, "calculateScoreV2", { enumerable: true, get: function () { return scoreCalculatorV2_1.calculateScoreV2; } });
Object.defineProperty(exports, "getScoreLabelV2", { enumerable: true, get: function () { return scoreCalculatorV2_1.getScoreLabelV2; } });
Object.defineProperty(exports, "getScoreColorV2", { enumerable: true, get: function () { return scoreCalculatorV2_1.getScoreColorV2; } });
Object.defineProperty(exports, "calculateWeeklyScoreV2", { enumerable: true, get: function () { return scoreCalculatorV2_1.calculateWeeklyScoreV2; } });
Object.defineProperty(exports, "calculateCumulativeWeeklyMAR", { enumerable: true, get: function () { return scoreCalculatorV2_1.calculateCumulativeWeeklyMAR; } });
// Day evaluator V2
var dayEvaluatorV2_1 = require("./dayEvaluatorV2");
Object.defineProperty(exports, "evaluateDayV2", { enumerable: true, get: function () { return dayEvaluatorV2_1.evaluateDayV2; } });
Object.defineProperty(exports, "evaluateDayWithTargetsV2", { enumerable: true, get: function () { return dayEvaluatorV2_1.evaluateDayWithTargetsV2; } });
Object.defineProperty(exports, "evaluateWeekV2", { enumerable: true, get: function () { return dayEvaluatorV2_1.evaluateWeekV2; } });
Object.defineProperty(exports, "quickScoreV2", { enumerable: true, get: function () { return dayEvaluatorV2_1.quickScoreV2; } });
//# sourceMappingURL=index.js.map