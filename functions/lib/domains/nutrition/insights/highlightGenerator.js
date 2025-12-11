"use strict";
/**
 * Highlight Generator
 *
 * Generates positive highlights and achievement messages
 * based on nutrient evaluation results.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHighlights = generateHighlights;
exports.generateHighlightMessage = generateHighlightMessage;
exports.generateAchievementMessages = generateAchievementMessages;
/**
 * Generate highlights from nutrient evaluations
 * Highlights are positive messages about nutrients meeting or exceeding targets
 */
function generateHighlights(evaluations, maxCount = 5) {
    const highlights = [];
    // Find beneficial nutrients exceeding target
    const excellentBeneficial = evaluations
        .filter((e) => e.classification === 'beneficial' && e.status === 'excellent')
        .sort((a, b) => { var _a, _b; return ((_a = b.percentOfTarget) !== null && _a !== void 0 ? _a : 0) - ((_b = a.percentOfTarget) !== null && _b !== void 0 ? _b : 0); });
    for (const eval_ of excellentBeneficial.slice(0, 3)) {
        highlights.push({
            nutrientId: eval_.nutrientId,
            displayName: eval_.displayName,
            message: `Great ${eval_.displayName}!`,
            detail: `You're at ${eval_.percentOfTarget}% of your daily target.`,
            icon: 'star',
        });
    }
    // Find limit nutrients well under limit
    const wellWithinLimit = evaluations
        .filter((e) => e.classification === 'limit' && e.status === 'well_within')
        .sort((a, b) => { var _a, _b; return ((_a = a.percentOfLimit) !== null && _a !== void 0 ? _a : 100) - ((_b = b.percentOfLimit) !== null && _b !== void 0 ? _b : 100); });
    for (const eval_ of wellWithinLimit.slice(0, 2)) {
        highlights.push({
            nutrientId: eval_.nutrientId,
            displayName: eval_.displayName,
            message: `${eval_.displayName} in check`,
            detail: `Only ${eval_.percentOfLimit}% of your daily limit.`,
            icon: 'check',
        });
    }
    return highlights.slice(0, maxCount);
}
/**
 * Generate a single highlight message for a nutrient
 */
function generateHighlightMessage(eval_) {
    if (eval_.classification === 'beneficial') {
        if (eval_.status === 'excellent') {
            return `Excellent ${eval_.displayName} intake at ${eval_.percentOfTarget}% of target`;
        }
        if (eval_.status === 'good') {
            return `Good ${eval_.displayName} intake at ${eval_.percentOfTarget}% of target`;
        }
    }
    if (eval_.classification === 'limit') {
        if (eval_.status === 'well_within') {
            return `${eval_.displayName} well controlled at ${eval_.percentOfLimit}% of limit`;
        }
    }
    return `${eval_.displayName}: ${eval_.intake} ${eval_.unit}`;
}
/**
 * Generate achievement-style messages for exceptional days
 */
function generateAchievementMessages(evaluations, score) {
    const messages = [];
    // Score-based achievements
    if (score >= 90) {
        messages.push('Outstanding nutrition day! 🌟');
    }
    else if (score >= 80) {
        messages.push('Excellent balance today!');
    }
    // Count excellent nutrients
    const excellentCount = evaluations.filter((e) => e.classification === 'beneficial' && e.status === 'excellent').length;
    if (excellentCount >= 10) {
        messages.push(`Hit targets for ${excellentCount} nutrients!`);
    }
    else if (excellentCount >= 5) {
        messages.push(`Met ${excellentCount} nutrient targets`);
    }
    // Check if all limit nutrients are under control
    const limitNutrients = evaluations.filter((e) => e.classification === 'limit');
    const allLimitsGood = limitNutrients.every((e) => e.status === 'well_within' || e.status === 'moderate');
    if (allLimitsGood && limitNutrients.length > 0) {
        messages.push('All limit nutrients in healthy range');
    }
    return messages.slice(0, 3);
}
//# sourceMappingURL=highlightGenerator.js.map