"use strict";
/**
 * Summary Generator
 *
 * Generates daily and weekly nutrition summaries with
 * educational insights and actionable information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDailySummary = generateDailySummary;
exports.generateNarrativeSummary = generateNarrativeSummary;
exports.generateWeeklySummary = generateWeeklySummary;
/**
 * Generate a daily summary from evaluation results
 */
function generateDailySummary(evaluations, calorieTarget) {
    var _a, _b, _c, _d, _e, _f;
    // Extract key macro values
    const calories = evaluations.find((e) => e.nutrientId === 'calories');
    const protein = evaluations.find((e) => e.nutrientId === 'protein');
    const carbs = evaluations.find((e) => e.nutrientId === 'carbohydrate');
    const fat = evaluations.find((e) => e.nutrientId === 'total_fat');
    const fiber = evaluations.find((e) => e.nutrientId === 'fiber');
    const sodium = evaluations.find((e) => e.nutrientId === 'sodium');
    // Calculate score from evaluations
    const beneficialGood = evaluations.filter((e) => e.classification === 'beneficial' && (e.status === 'excellent' || e.status === 'good')).length;
    const totalBeneficial = evaluations.filter((e) => e.classification === 'beneficial').length;
    const beneficialRatio = totalBeneficial > 0 ? beneficialGood / totalBeneficial : 0;
    const limitGood = evaluations.filter((e) => e.classification === 'limit' && (e.status === 'well_within' || e.status === 'moderate')).length;
    const totalLimit = evaluations.filter((e) => e.classification === 'limit').length;
    const limitRatio = totalLimit > 0 ? limitGood / totalLimit : 1;
    const score = Math.round((beneficialRatio * 50 + limitRatio * 50));
    // Generate highlights
    const topHighlights = generateTopHighlights(evaluations);
    // Generate gaps
    const topGaps = generateTopGaps(evaluations);
    return {
        score,
        caloriesConsumed: (_a = calories === null || calories === void 0 ? void 0 : calories.intake) !== null && _a !== void 0 ? _a : 0,
        calorieTarget,
        proteinGrams: (_b = protein === null || protein === void 0 ? void 0 : protein.intake) !== null && _b !== void 0 ? _b : 0,
        carbsGrams: (_c = carbs === null || carbs === void 0 ? void 0 : carbs.intake) !== null && _c !== void 0 ? _c : 0,
        fatGrams: (_d = fat === null || fat === void 0 ? void 0 : fat.intake) !== null && _d !== void 0 ? _d : 0,
        fiberGrams: (_e = fiber === null || fiber === void 0 ? void 0 : fiber.intake) !== null && _e !== void 0 ? _e : 0,
        sodiumMg: (_f = sodium === null || sodium === void 0 ? void 0 : sodium.intake) !== null && _f !== void 0 ? _f : 0,
        topHighlights,
        topGaps,
    };
}
/**
 * Generate top highlight messages
 */
function generateTopHighlights(evaluations) {
    const highlights = [];
    // Find excellent beneficial nutrients
    const excellent = evaluations
        .filter((e) => e.classification === 'beneficial' && e.status === 'excellent')
        .slice(0, 3);
    for (const e of excellent) {
        highlights.push(`${e.displayName} at ${e.percentOfTarget}%`);
    }
    // Find well-controlled limit nutrients
    const wellControlled = evaluations
        .filter((e) => e.classification === 'limit' && e.status === 'well_within')
        .slice(0, 2);
    for (const e of wellControlled) {
        highlights.push(`${e.displayName} well under limit`);
    }
    return highlights.slice(0, 3);
}
/**
 * Generate top gap messages
 */
function generateTopGaps(evaluations) {
    const gaps = [];
    // Find low beneficial nutrients
    const low = evaluations
        .filter((e) => e.classification === 'beneficial' &&
        (e.status === 'low' || e.status === 'below_target'))
        .sort((a, b) => { var _a, _b; return ((_a = a.percentOfTarget) !== null && _a !== void 0 ? _a : 100) - ((_b = b.percentOfTarget) !== null && _b !== void 0 ? _b : 100); })
        .slice(0, 3);
    for (const e of low) {
        gaps.push(`${e.displayName} at ${e.percentOfTarget}%`);
    }
    // Find exceeded limit nutrients
    const exceeded = evaluations
        .filter((e) => e.classification === 'limit' && e.status === 'exceeds_limit')
        .slice(0, 2);
    for (const e of exceeded) {
        gaps.push(`${e.displayName} over limit (${e.percentOfLimit}%)`);
    }
    return gaps.slice(0, 3);
}
/**
 * Generate a natural language summary of the day
 */
function generateNarrativeSummary(score, breakdown, highlights, gaps) {
    const parts = [];
    // Opening based on score
    if (score >= 90) {
        parts.push('Outstanding day!');
    }
    else if (score >= 75) {
        parts.push('Great nutrition day!');
    }
    else if (score >= 60) {
        parts.push('Good progress today.');
    }
    else if (score >= 40) {
        parts.push('Decent day with room for improvement.');
    }
    else {
        parts.push('Today had some challenges.');
    }
    // Add specifics based on breakdown
    if (breakdown.beneficial >= 35) {
        parts.push('You hit most of your nutrient targets.');
    }
    else if (breakdown.beneficial >= 25) {
        parts.push('You met several nutrient targets.');
    }
    else if (breakdown.beneficial < 15) {
        parts.push('Many nutrients were below target.');
    }
    if (breakdown.limit >= 35) {
        parts.push('Limit nutrients were well controlled.');
    }
    else if (breakdown.limit < 20) {
        parts.push('Some limit nutrients were high.');
    }
    // Add actionable insight
    if (gaps.length > 0 && score < 80) {
        const topGap = gaps[0].split(' at ')[0]; // Extract nutrient name
        parts.push(`Consider adding more ${topGap.toLowerCase()}-rich foods.`);
    }
    return parts.join(' ');
}
/**
 * Generate a weekly summary
 */
function generateWeeklySummary(dailyEvaluations) {
    var _a;
    if (dailyEvaluations.length === 0) {
        return {
            averageScore: 0,
            daysLogged: 0,
            bestDay: null,
            consistentHighlights: [],
            consistentGaps: [],
            trend: 'stable',
            summary: 'No nutrition data logged this week.',
        };
    }
    // Calculate average score
    const scores = dailyEvaluations.map((e) => e.score);
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    // Find best day
    const sortedByScore = [...dailyEvaluations].sort((a, b) => b.score - a.score);
    const bestDay = sortedByScore[0]
        ? { date: sortedByScore[0].date, score: sortedByScore[0].score }
        : null;
    // Find consistent patterns
    const consistentHighlights = findConsistentPatterns(dailyEvaluations.flatMap((e) => e.highlights));
    const consistentGaps = findConsistentPatterns(dailyEvaluations.flatMap((e) => e.gaps));
    // Determine trend (compare first half to second half)
    const midpoint = Math.floor(dailyEvaluations.length / 2);
    const firstHalf = scores.slice(0, midpoint);
    const secondHalf = scores.slice(midpoint);
    let trend = 'stable';
    if (firstHalf.length > 0 && secondHalf.length > 0) {
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        if (secondAvg > firstAvg + 5)
            trend = 'improving';
        else if (secondAvg < firstAvg - 5)
            trend = 'declining';
    }
    // Generate summary
    let summary;
    if (averageScore >= 80) {
        summary = `Excellent week! You averaged ${averageScore} points across ${dailyEvaluations.length} days.`;
    }
    else if (averageScore >= 60) {
        summary = `Good week with an average score of ${averageScore}. ${trend === 'improving' ? 'Your scores are improving!' : ''}`;
    }
    else {
        summary = `Your average score was ${averageScore}. Focus on ${(_a = consistentGaps[0]) !== null && _a !== void 0 ? _a : 'meeting more nutrient targets'}.`;
    }
    return {
        averageScore,
        daysLogged: dailyEvaluations.length,
        bestDay,
        consistentHighlights,
        consistentGaps,
        trend,
        summary,
    };
}
/**
 * Find patterns that appear multiple times
 */
function findConsistentPatterns(messages) {
    var _a;
    const counts = new Map();
    for (const msg of messages) {
        // Extract the nutrient name (first word or two)
        const nutrient = msg.split(' ').slice(0, 2).join(' ');
        counts.set(nutrient, ((_a = counts.get(nutrient)) !== null && _a !== void 0 ? _a : 0) + 1);
    }
    // Return patterns that appear multiple times
    return Array.from(counts.entries())
        .filter(([, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([nutrient]) => nutrient);
}
//# sourceMappingURL=summaryGenerator.js.map