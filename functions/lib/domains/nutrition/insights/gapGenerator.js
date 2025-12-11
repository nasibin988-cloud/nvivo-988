"use strict";
/**
 * Gap Generator
 *
 * Generates informational messages about nutritional gaps
 * with educational suggestions (not medical advice).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGapInfo = generateGapInfo;
exports.generateGapMessage = generateGapMessage;
exports.generateDetailedGap = generateDetailedGap;
exports.prioritizeGaps = prioritizeGaps;
const educationGenerator_1 = require("./educationGenerator");
/**
 * Generate gap information from nutrient evaluations
 */
function generateGapInfo(evaluations, maxCount = 5) {
    const gaps = [];
    // Find beneficial nutrients below target
    const belowTarget = evaluations
        .filter((e) => e.classification === 'beneficial' &&
        (e.status === 'below_target' || e.status === 'low') &&
        e.percentOfTarget !== null &&
        e.target !== null)
        .sort((a, b) => { var _a, _b; return ((_a = a.percentOfTarget) !== null && _a !== void 0 ? _a : 0) - ((_b = b.percentOfTarget) !== null && _b !== void 0 ? _b : 0); });
    for (const eval_ of belowTarget.slice(0, maxCount)) {
        const foodSuggestions = (0, educationGenerator_1.getFoodSuggestions)(eval_.nutrientId, 3);
        const suggestion = generateSuggestion(eval_, foodSuggestions);
        gaps.push({
            nutrientId: eval_.nutrientId,
            displayName: eval_.displayName,
            intake: eval_.intake,
            target: eval_.target,
            percentOfTarget: eval_.percentOfTarget,
            unit: eval_.unit,
            suggestion,
        });
    }
    return gaps;
}
/**
 * Generate a helpful suggestion for a gap
 */
function generateSuggestion(eval_, foodSources) {
    var _a, _b, _c;
    const percent = (_a = eval_.percentOfTarget) !== null && _a !== void 0 ? _a : 0;
    const foods = foodSources.slice(0, 3).join(', ');
    if (percent < 33) {
        // Low intake
        if (foods) {
            return `Consider including more ${foods.toLowerCase()} in your diet.`;
        }
        return `This nutrient is significantly below your daily target.`;
    }
    if (percent < 67) {
        // Below target
        if (foods) {
            return `Foods like ${foods.toLowerCase()} can help you reach your target.`;
        }
        return `You're about halfway to your daily target.`;
    }
    // Close to target (67-99%)
    if (foods) {
        return `A small boost from ${(_c = (_b = foodSources[0]) === null || _b === void 0 ? void 0 : _b.toLowerCase()) !== null && _c !== void 0 ? _c : 'nutrient-rich foods'} could help you reach 100%.`;
    }
    return `You're close to meeting your daily target.`;
}
/**
 * Generate a gap message for display
 */
function generateGapMessage(gap) {
    const percent = gap.percentOfTarget;
    if (percent < 33) {
        return `${gap.displayName} is low at ${percent}% of your daily target`;
    }
    if (percent < 67) {
        return `${gap.displayName} is below target at ${percent}%`;
    }
    return `${gap.displayName} is at ${percent}% - almost there!`;
}
/**
 * Generate detailed gap information with education
 */
function generateDetailedGap(eval_) {
    if (eval_.percentOfTarget === null || eval_.target === null) {
        return null;
    }
    const percent = eval_.percentOfTarget;
    const whyItMatters = (0, educationGenerator_1.getWhyItMatters)(eval_.nutrientId);
    const foodSuggestions = (0, educationGenerator_1.getFoodSuggestions)(eval_.nutrientId, 5);
    let message;
    if (percent < 33) {
        message = `Your ${eval_.displayName} intake is significantly below the recommended amount.`;
    }
    else if (percent < 67) {
        message = `You're getting about half of your recommended ${eval_.displayName}.`;
    }
    else {
        message = `You're close to meeting your ${eval_.displayName} target.`;
    }
    const currentVsTarget = `${eval_.intake} ${eval_.unit} of ${eval_.target} ${eval_.unit} target (${percent}%)`;
    return {
        message,
        whyItMatters,
        foodSuggestions,
        currentVsTarget,
    };
}
/**
 * Prioritize gaps by importance
 * Returns the most important gaps to address first
 */
function prioritizeGaps(gaps) {
    // Priority nutrients that are more critical when low
    const priorityNutrients = [
        'protein',
        'fiber',
        'vitamin_d',
        'calcium',
        'iron',
        'potassium',
        'vitamin_b12',
        'folate',
    ];
    return gaps.sort((a, b) => {
        // First, sort by whether it's a priority nutrient
        const aPriority = priorityNutrients.indexOf(a.nutrientId);
        const bPriority = priorityNutrients.indexOf(b.nutrientId);
        const aIsPriority = aPriority !== -1;
        const bIsPriority = bPriority !== -1;
        if (aIsPriority && !bIsPriority)
            return -1;
        if (!aIsPriority && bIsPriority)
            return 1;
        if (aIsPriority && bIsPriority)
            return aPriority - bPriority;
        // Then by how far below target (lower % = higher priority)
        return a.percentOfTarget - b.percentOfTarget;
    });
}
//# sourceMappingURL=gapGenerator.js.map