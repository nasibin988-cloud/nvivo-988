"use strict";
/**
 * Classification Thresholds Configuration
 *
 * Defines the thresholds used to classify nutrient amounts as
 * high/moderate/low based on percent of DRI targets.
 *
 * These thresholds can be adjusted to fine-tune the sensitivity of
 * nutrient classifications without changing the core classification logic.
 *
 * Research basis:
 * - FDA: >20% DV is "High", >5% DV is "Good Source"
 * - Per-serving context vs. daily context
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLASSIFICATION_SEVERITY = exports.CLASSIFICATION_THRESHOLDS = exports.RISK_THRESHOLDS = exports.BENEFICIAL_THRESHOLDS = void 0;
exports.getThreshold = getThreshold;
exports.getClassificationSeverity = getClassificationSeverity;
exports.sortByPriority = sortByPriority;
/**
 * Thresholds for beneficial nutrients (higher is better).
 * Used for nutrients like protein, fiber, vitamins, minerals.
 *
 * @example
 * - HIGH: >20% of RDA/AI = Great source
 * - MODERATE: 10-20% of RDA/AI = Good contribution
 * - LOW: <10% of RDA/AI = Minimal contribution
 */
exports.BENEFICIAL_THRESHOLDS = {
    /** Percent of RDA/AI to be classified as "high" (green/excellent) */
    HIGH: 20,
    /** Percent of RDA/AI to be classified as "moderate" (light green/good) */
    MODERATE: 10,
    /** Below this is "low" (gray/minimal) */
    LOW: 10,
};
/**
 * Thresholds for risk nutrients (lower is better).
 * Used for nutrients like sodium, saturated fat, trans fat, added sugar.
 *
 * @example
 * - HIGH: >20% of UL = Significant portion of daily limit (red warning)
 * - MODERATE: 10-20% of UL = Notable amount (orange caution)
 * - LOW: <10% of UL = Safe amount (green/safe)
 */
exports.RISK_THRESHOLDS = {
    /** Percent of UL to be classified as "high" risk (red warning) */
    HIGH: 20,
    /** Percent of UL to be classified as "moderate" risk (orange caution) */
    MODERATE: 10,
    /** Below this is "low" risk (safe) */
    LOW: 10,
};
/**
 * Combined thresholds configuration.
 * Exported for use in classification logic.
 */
exports.CLASSIFICATION_THRESHOLDS = {
    beneficial: exports.BENEFICIAL_THRESHOLDS,
    risk: exports.RISK_THRESHOLDS,
};
/**
 * Get the classification threshold for a specific nature and level.
 *
 * @param nature - 'beneficial' or 'risk'
 * @param level - 'HIGH', 'MODERATE', or 'LOW'
 * @returns The threshold percentage
 */
function getThreshold(nature, level) {
    return exports.CLASSIFICATION_THRESHOLDS[nature][level];
}
/**
 * Classification levels for UI display.
 * Maps classification strings to severity levels for styling.
 */
exports.CLASSIFICATION_SEVERITY = {
    beneficial_high: { level: 'success', priority: 3 },
    beneficial_moderate: { level: 'info', priority: 2 },
    beneficial_low: { level: 'neutral', priority: 1 },
    risk_high: { level: 'error', priority: 3 },
    risk_moderate: { level: 'warning', priority: 2 },
    risk_low: { level: 'success', priority: 1 },
    neutral: { level: 'neutral', priority: 0 },
    not_applicable: { level: 'muted', priority: 0 },
    insufficient_data: { level: 'muted', priority: 0 },
};
/**
 * Get the UI severity level for a classification.
 *
 * @param classification - The nutrient classification
 * @returns Object with level and priority
 */
function getClassificationSeverity(classification) {
    var _a;
    return (_a = exports.CLASSIFICATION_SEVERITY[classification]) !== null && _a !== void 0 ? _a : exports.CLASSIFICATION_SEVERITY.neutral;
}
/**
 * Sort evaluations by priority (highest first).
 * Useful for highlighting the most important nutrients.
 *
 * @param classifications - Array of classification strings
 * @returns Sorted array (highest priority first)
 */
function sortByPriority(items) {
    return [...items].sort((a, b) => {
        var _a, _b, _c, _d;
        const aPriority = (_b = (_a = exports.CLASSIFICATION_SEVERITY[a.classification]) === null || _a === void 0 ? void 0 : _a.priority) !== null && _b !== void 0 ? _b : 0;
        const bPriority = (_d = (_c = exports.CLASSIFICATION_SEVERITY[b.classification]) === null || _c === void 0 ? void 0 : _c.priority) !== null && _d !== void 0 ? _d : 0;
        return bPriority - aPriority;
    });
}
//# sourceMappingURL=classificationThresholds.js.map