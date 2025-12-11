"use strict";
/**
 * Nutrition Evaluation Module
 *
 * Exports functions for evaluating nutrient intake against targets.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.quickScore = exports.evaluateDayWithTargets = exports.evaluateDay = exports.calculateWeeklyScore = exports.getScoreColor = exports.getScoreLabel = exports.calculateScore = exports.findHighlights = exports.findExceedingLimits = exports.findNutrientGaps = exports.evaluateNutrients = exports.evaluateNutrient = exports.getUpperLimitWarning = exports.isOverUpperLimit = exports.getStatusColor = exports.getStatusLabel = exports.classifyNutrientIntake = exports.classifyLimitIntake = exports.classifyBeneficialIntake = void 0;
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
// Score calculator
var scoreCalculator_1 = require("./scoreCalculator");
Object.defineProperty(exports, "calculateScore", { enumerable: true, get: function () { return scoreCalculator_1.calculateScore; } });
Object.defineProperty(exports, "getScoreLabel", { enumerable: true, get: function () { return scoreCalculator_1.getScoreLabel; } });
Object.defineProperty(exports, "getScoreColor", { enumerable: true, get: function () { return scoreCalculator_1.getScoreColor; } });
Object.defineProperty(exports, "calculateWeeklyScore", { enumerable: true, get: function () { return scoreCalculator_1.calculateWeeklyScore; } });
// Day evaluator
var dayEvaluator_1 = require("./dayEvaluator");
Object.defineProperty(exports, "evaluateDay", { enumerable: true, get: function () { return dayEvaluator_1.evaluateDay; } });
Object.defineProperty(exports, "evaluateDayWithTargets", { enumerable: true, get: function () { return dayEvaluator_1.evaluateDayWithTargets; } });
Object.defineProperty(exports, "quickScore", { enumerable: true, get: function () { return dayEvaluator_1.quickScore; } });
//# sourceMappingURL=index.js.map