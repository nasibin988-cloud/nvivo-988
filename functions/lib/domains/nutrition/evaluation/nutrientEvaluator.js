"use strict";
/**
 * Nutrient Evaluator
 *
 * Evaluates a single nutrient's intake against its target and limits.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateNutrient = evaluateNutrient;
exports.evaluateNutrients = evaluateNutrients;
exports.findNutrientGaps = findNutrientGaps;
exports.findExceedingLimits = findExceedingLimits;
exports.findHighlights = findHighlights;
const data_1 = require("../data");
const classifier_1 = require("./classifier");
/**
 * Calculate percentage of target
 */
function calcPercentOfTarget(intake, target) {
    if (target === null || target === 0)
        return null;
    return Math.round((intake / target) * 100);
}
/**
 * Calculate percentage of limit (upper limit or CDRR)
 */
function calcPercentOfLimit(intake, upperLimit, cdrrLimit) {
    // Use CDRR if available (more restrictive), otherwise use UL
    const limit = cdrrLimit !== null && cdrrLimit !== void 0 ? cdrrLimit : upperLimit;
    if (limit === null || limit === undefined || limit === 0)
        return null;
    return Math.round((intake / limit) * 100);
}
/**
 * Get nutrient classification from data service
 */
function getNutrientClassification(nutrientId) {
    const nutrientDef = data_1.nutritionData.getNutrient(nutrientId);
    if (!nutrientDef)
        return 'neutral';
    // Map 'risk' to 'limit' for evaluation purposes
    if (nutrientDef.classification === 'risk') {
        return 'limit';
    }
    return nutrientDef.classification;
}
/**
 * Evaluate a single nutrient's intake against its target
 */
function evaluateNutrient(nutrientId, intake, target) {
    var _a, _b, _c;
    const classification = getNutrientClassification(nutrientId);
    // Calculate percentages
    const percentOfTarget = calcPercentOfTarget(intake, (_a = target.target) !== null && _a !== void 0 ? _a : null);
    const percentOfLimit = calcPercentOfLimit(intake, target.upperLimit, target.cdrrLimit);
    // Classify the intake
    const status = (0, classifier_1.classifyNutrientIntake)(classification, percentOfTarget, percentOfLimit);
    const statusLabel = (0, classifier_1.getStatusLabel)(status);
    const statusColor = (0, classifier_1.getStatusColor)(status);
    return {
        nutrientId,
        displayName: target.displayName,
        intake,
        target: (_b = target.target) !== null && _b !== void 0 ? _b : null,
        upperLimit: (_c = target.upperLimit) !== null && _c !== void 0 ? _c : null,
        unit: target.unit,
        percentOfTarget,
        percentOfLimit,
        classification,
        status,
        statusLabel,
        statusColor,
    };
}
/**
 * Evaluate multiple nutrients at once
 */
function evaluateNutrients(intakes, targets) {
    var _a;
    const evaluations = [];
    for (const [nutrientId, target] of Object.entries(targets)) {
        const intake = (_a = intakes[nutrientId]) !== null && _a !== void 0 ? _a : 0;
        const evaluation = evaluateNutrient(nutrientId, intake, target);
        evaluations.push(evaluation);
    }
    return evaluations;
}
/**
 * Get nutrients that are below target (gaps)
 */
function findNutrientGaps(evaluations, thresholdPercent = 67) {
    return evaluations.filter((e) => {
        // Only consider beneficial nutrients for gaps
        if (e.classification !== 'beneficial')
            return false;
        // Check if below threshold
        return e.percentOfTarget !== null && e.percentOfTarget < thresholdPercent;
    });
}
/**
 * Get nutrients that are exceeding limits
 */
function findExceedingLimits(evaluations) {
    return evaluations.filter((e) => {
        // Only consider limit nutrients
        if (e.classification !== 'limit')
            return false;
        // Check if at or over limit
        return e.percentOfLimit !== null && e.percentOfLimit >= 100;
    });
}
/**
 * Get nutrients that are doing well (highlights)
 */
function findHighlights(evaluations) {
    return evaluations.filter((e) => {
        if (e.classification === 'beneficial') {
            // Beneficial nutrient meeting target
            return e.percentOfTarget !== null && e.percentOfTarget >= 100;
        }
        if (e.classification === 'limit') {
            // Limit nutrient well under limit
            return e.percentOfLimit !== null && e.percentOfLimit < 50;
        }
        return false;
    });
}
//# sourceMappingURL=nutrientEvaluator.js.map