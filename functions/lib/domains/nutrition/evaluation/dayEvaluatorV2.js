"use strict";
/**
 * Day Evaluator V2
 *
 * Evaluates an entire day's nutrition intake using the advanced scoring system.
 * Produces complete evaluation with:
 * - MAR-based score
 * - Focus-specific adjustments
 * - Detailed breakdown (adequacy, moderation, balance)
 * - Fat quality metrics
 * - Glycemic impact (when enabled)
 * - Nutrient highlights and gaps
 * - Human-readable summary
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateDayV2 = evaluateDayV2;
exports.evaluateDayWithTargetsV2 = evaluateDayWithTargetsV2;
exports.evaluateWeekV2 = evaluateWeekV2;
exports.quickScoreV2 = quickScoreV2;
const focus_1 = require("../focus");
const targets_1 = require("../targets");
const nutrientEvaluator_1 = require("./nutrientEvaluator");
const scoreCalculatorV2_1 = require("./scoreCalculatorV2");
// =============================================================================
// Helper Functions
// =============================================================================
/**
 * Generate highlights from evaluation results
 */
function generateHighlights(evaluations) {
    const highlightEvals = (0, nutrientEvaluator_1.findHighlights)(evaluations);
    return highlightEvals.slice(0, 5).map((e) => {
        var _a;
        const pct = (_a = e.percentOfTarget) !== null && _a !== void 0 ? _a : 0;
        let message;
        let icon;
        if (e.classification === 'beneficial') {
            if (pct >= 120) {
                message = `Excellent ${e.displayName} - exceeded target!`;
                icon = 'trophy';
            }
            else {
                message = `Great ${e.displayName} intake (${pct}% of target)`;
                icon = 'star';
            }
        }
        else {
            message = `${e.displayName} well within limits`;
            icon = 'heart';
        }
        return {
            nutrientId: e.nutrientId,
            displayName: e.displayName,
            percentOfTarget: pct,
            message,
            icon,
        };
    });
}
/**
 * Generate gaps from evaluation results
 */
function generateGaps(evaluations) {
    const gapEvals = (0, nutrientEvaluator_1.findNutrientGaps)(evaluations, 67);
    return gapEvals
        .sort((a, b) => { var _a, _b; return ((_a = a.percentOfTarget) !== null && _a !== void 0 ? _a : 0) - ((_b = b.percentOfTarget) !== null && _b !== void 0 ? _b : 0); })
        .slice(0, 5)
        .map((e) => {
        var _a, _b;
        const pct = (_a = e.percentOfTarget) !== null && _a !== void 0 ? _a : 0;
        let severity;
        let suggestion;
        if (pct < 33) {
            severity = 'severe';
            suggestion = `${e.displayName} is very low. Consider adding rich sources to your diet.`;
        }
        else if (pct < 50) {
            severity = 'moderate';
            suggestion = `${e.displayName} needs attention. Try including more foods with this nutrient.`;
        }
        else {
            severity = 'low';
            suggestion = `${e.displayName} is slightly below target (${pct}%). A small adjustment could help.`;
        }
        return {
            nutrientId: e.nutrientId,
            displayName: e.displayName,
            intake: e.intake,
            target: (_b = e.target) !== null && _b !== void 0 ? _b : 0,
            percentOfTarget: pct,
            unit: e.unit,
            severity,
            suggestion,
        };
    });
}
/**
 * Generate summary message based on score and evaluation
 */
function generateSummary(score, mar, highlights, gaps, focusName, loggingStatus) {
    var _a, _b, _c, _d, _e, _f;
    if (loggingStatus === 'likely_incomplete') {
        return 'Your food log appears incomplete. Add any missing meals for an accurate score.';
    }
    if (score >= 90) {
        return `Outstanding ${focusName} day! You met or exceeded most nutrient targets while keeping limits in check. MAR: ${Math.round(mar * 100)}%.`;
    }
    if (score >= 75) {
        const highlightText = (_b = (_a = highlights[0]) === null || _a === void 0 ? void 0 : _a.displayName) !== null && _b !== void 0 ? _b : 'several nutrients';
        return `Great job on your ${focusName} goals! Excellent ${highlightText} intake. MAR: ${Math.round(mar * 100)}%.`;
    }
    if (score >= 60) {
        const gapText = (_d = (_c = gaps[0]) === null || _c === void 0 ? void 0 : _c.displayName) !== null && _d !== void 0 ? _d : 'some nutrients';
        return `Good progress toward ${focusName} goals. Consider boosting ${gapText} intake for better results.`;
    }
    if (score >= 40) {
        const topGap = (_f = (_e = gaps[0]) === null || _e === void 0 ? void 0 : _e.displayName) !== null && _f !== void 0 ? _f : 'key nutrients';
        return `Fair day with room for improvement. Focus on increasing ${topGap} and maintaining variety.`;
    }
    return 'This day had several nutritional gaps. Try including more variety and nutrient-rich foods.';
}
/**
 * Calculate fat quality metrics
 */
function calculateFatQualityMetrics(nutrients) {
    var _a, _b, _c, _d, _e;
    const pufa = (_a = nutrients.polyunsaturatedFat) !== null && _a !== void 0 ? _a : 0;
    const mufa = (_b = nutrients.monounsaturatedFat) !== null && _b !== void 0 ? _b : 0;
    const sfa = (_c = nutrients.saturatedFat) !== null && _c !== void 0 ? _c : 0;
    const omega3 = (_d = nutrients.omega3) !== null && _d !== void 0 ? _d : 0;
    const omega6 = (_e = nutrients.omega6) !== null && _e !== void 0 ? _e : 0;
    const unsatToSatRatio = sfa > 0 ? (pufa + mufa) / sfa : 3.0;
    const omega3To6Ratio = omega6 > 0 ? omega3 / omega6 : null;
    // Score based on ratio
    let score = 0;
    if (unsatToSatRatio >= 2.0)
        score += 4;
    else if (unsatToSatRatio >= 1.5)
        score += 3;
    else if (unsatToSatRatio >= 1.0)
        score += 2;
    else if (unsatToSatRatio >= 0.5)
        score += 1;
    if (omega3To6Ratio !== null) {
        if (omega3To6Ratio >= 0.25)
            score += 2;
        else if (omega3To6Ratio >= 0.15)
            score += 1.5;
        else if (omega3To6Ratio >= 0.10)
            score += 1;
        else
            score += 0.5;
    }
    else {
        score += 1; // Default partial credit
    }
    return {
        unsaturatedToSaturatedRatio: Math.round(unsatToSatRatio * 100) / 100,
        omega3To6Ratio: omega3To6Ratio !== null ? Math.round(omega3To6Ratio * 1000) / 1000 : null,
        score,
    };
}
/**
 * Calculate glycemic impact metrics
 */
function calculateGlycemicMetrics(nutrients) {
    var _a, _b, _c;
    const addedSugar = (_b = (_a = nutrients.addedSugar) !== null && _a !== void 0 ? _a : nutrients.sugar) !== null && _b !== void 0 ? _b : 0;
    const fiber = (_c = nutrients.fiber) !== null && _c !== void 0 ? _c : 0;
    if (fiber === 0 && addedSugar === 0)
        return undefined;
    const ratio = fiber > 0 ? addedSugar / fiber : addedSugar > 10 ? 10 : 0;
    let penalty = 0;
    if (ratio > 6)
        penalty = 4;
    else if (ratio > 4)
        penalty = 3;
    else if (ratio > 2)
        penalty = 2;
    else if (ratio > 1)
        penalty = 1;
    return {
        sugarFiberRatio: Math.round(ratio * 100) / 100,
        penalty,
    };
}
// =============================================================================
// Main Evaluation Functions
// =============================================================================
/**
 * Evaluate an entire day's nutrition with focus-specific scoring
 */
function evaluateDayV2(profile, dailyIntake, focusId = 'balanced') {
    var _a, _b;
    const focusConfig = (0, focus_1.getFocusConfig)(focusId);
    // Compute personalized targets
    const targets = (0, targets_1.computeUserTargets)(profile);
    // Evaluate all nutrients
    const nutrientEvaluations = (0, nutrientEvaluator_1.evaluateNutrients)(dailyIntake.totals, targets.nutrients);
    // Prepare intake data for scoring
    const intakeData = {
        nutrients: dailyIntake.totals,
        calories: (_a = dailyIntake.totals.calories) !== null && _a !== void 0 ? _a : 0,
        calorieTarget: targets.calories,
        bmr: targets.profile ? undefined : undefined, // BMR would be in energy calculation
    };
    // Calculate score
    const scoreResult = (0, scoreCalculatorV2_1.calculateScoreV2)(nutrientEvaluations, intakeData, focusId);
    // Generate highlights and gaps
    const highlights = generateHighlights(nutrientEvaluations);
    const gaps = generateGaps(nutrientEvaluations);
    // Calculate fat quality
    const fatQuality = calculateFatQualityMetrics(dailyIntake.totals);
    // Calculate glycemic impact if enabled
    const glycemicImpact = focusConfig.glycemicImpactEnabled
        ? calculateGlycemicMetrics(dailyIntake.totals)
        : undefined;
    // Generate summary
    const summary = generateSummary(scoreResult.score, scoreResult.mar, highlights, gaps, focusConfig.name, scoreResult.loggingAssessment.status);
    // Calorie summary
    const caloriesConsumed = (_b = dailyIntake.totals.calories) !== null && _b !== void 0 ? _b : 0;
    const calorieTarget = targets.calories;
    return {
        date: dailyIntake.date,
        score: scoreResult.score,
        label: scoreResult.label,
        color: scoreResult.color,
        mar: scoreResult.mar,
        breakdown: scoreResult.breakdown,
        nutrients: nutrientEvaluations,
        fatQuality,
        glycemicImpact,
        highlights,
        gaps,
        loggingAssessment: scoreResult.loggingAssessment,
        summary,
        focus: {
            id: focusId,
            name: focusConfig.name,
        },
        calories: {
            consumed: caloriesConsumed,
            target: calorieTarget,
            percentOfTarget: calorieTarget > 0 ? Math.round((caloriesConsumed / calorieTarget) * 100) : 0,
        },
    };
}
/**
 * Evaluate a day using pre-computed targets (more efficient for batch operations)
 */
function evaluateDayWithTargetsV2(dailyIntake, targets, focusId = 'balanced') {
    var _a, _b;
    const focusConfig = (0, focus_1.getFocusConfig)(focusId);
    // Evaluate all nutrients
    const nutrientEvaluations = (0, nutrientEvaluator_1.evaluateNutrients)(dailyIntake.totals, targets.nutrients);
    // Prepare intake data
    const intakeData = {
        nutrients: dailyIntake.totals,
        calories: (_a = dailyIntake.totals.calories) !== null && _a !== void 0 ? _a : 0,
        calorieTarget: targets.calories,
    };
    // Calculate score
    const scoreResult = (0, scoreCalculatorV2_1.calculateScoreV2)(nutrientEvaluations, intakeData, focusId);
    // Generate highlights and gaps
    const highlights = generateHighlights(nutrientEvaluations);
    const gaps = generateGaps(nutrientEvaluations);
    // Calculate fat quality and glycemic impact
    const fatQuality = calculateFatQualityMetrics(dailyIntake.totals);
    const glycemicImpact = focusConfig.glycemicImpactEnabled
        ? calculateGlycemicMetrics(dailyIntake.totals)
        : undefined;
    // Generate summary
    const summary = generateSummary(scoreResult.score, scoreResult.mar, highlights, gaps, focusConfig.name, scoreResult.loggingAssessment.status);
    const caloriesConsumed = (_b = dailyIntake.totals.calories) !== null && _b !== void 0 ? _b : 0;
    return {
        date: dailyIntake.date,
        score: scoreResult.score,
        label: scoreResult.label,
        color: scoreResult.color,
        mar: scoreResult.mar,
        breakdown: scoreResult.breakdown,
        nutrients: nutrientEvaluations,
        fatQuality,
        glycemicImpact,
        highlights,
        gaps,
        loggingAssessment: scoreResult.loggingAssessment,
        summary,
        focus: {
            id: focusId,
            name: focusConfig.name,
        },
        calories: {
            consumed: caloriesConsumed,
            target: targets.calories,
            percentOfTarget: targets.calories > 0 ? Math.round((caloriesConsumed / targets.calories) * 100) : 0,
        },
    };
}
/**
 * Evaluate a week's nutrition
 */
function evaluateWeekV2(profile, dailyIntakes, focusId = 'balanced') {
    var _a, _b;
    const focusConfig = (0, focus_1.getFocusConfig)(focusId);
    const targets = (0, targets_1.computeUserTargets)(profile);
    // Evaluate each day
    const dayEvaluations = dailyIntakes.map((intake) => evaluateDayWithTargetsV2(intake, targets, focusId));
    // Calculate weekly scores
    const scoreResults = dayEvaluations.map((d) => ({
        score: d.score,
        label: d.label,
        color: d.color,
        mar: d.mar,
        breakdown: d.breakdown,
        loggingAssessment: d.loggingAssessment,
    }));
    const weeklyScoreResult = (0, scoreCalculatorV2_1.calculateWeeklyScoreV2)(scoreResults);
    // Calculate cumulative MAR
    const weeklyEvaluations = dayEvaluations.map((d) => d.nutrients);
    const cumulativeMAR = (0, scoreCalculatorV2_1.calculateCumulativeWeeklyMAR)(weeklyEvaluations, focusId);
    // Determine trend
    let trend = 'stable';
    if (dayEvaluations.length >= 3) {
        const firstHalf = dayEvaluations.slice(0, Math.floor(dayEvaluations.length / 2));
        const secondHalf = dayEvaluations.slice(Math.floor(dayEvaluations.length / 2));
        const firstAvg = firstHalf.reduce((sum, d) => sum + d.score, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, d) => sum + d.score, 0) / secondHalf.length;
        if (secondAvg - firstAvg > 5)
            trend = 'improving';
        else if (firstAvg - secondAvg > 5)
            trend = 'declining';
    }
    // Sort dates
    const dates = dailyIntakes.map((i) => i.date).sort();
    const weekStartDate = (_a = dates[0]) !== null && _a !== void 0 ? _a : '';
    const weekEndDate = (_b = dates[dates.length - 1]) !== null && _b !== void 0 ? _b : '';
    // Generate summary
    let summary;
    if (weeklyScoreResult.score >= 80) {
        summary = `Excellent week for ${focusConfig.name}! You maintained strong nutrition habits with ${weeklyScoreResult.daysLogged} days logged.`;
    }
    else if (weeklyScoreResult.score >= 65) {
        summary = `Good week overall. Your average MAR of ${Math.round(weeklyScoreResult.averageMAR * 100)}% shows solid nutrient coverage.`;
    }
    else if (weeklyScoreResult.score >= 50) {
        summary = `Fair week with room to grow. Focus on consistency and filling nutrient gaps.`;
    }
    else {
        summary = `This week had nutritional challenges. Try planning meals ahead for better balance.`;
    }
    if (trend === 'improving') {
        summary += ' Your scores are trending upward!';
    }
    else if (trend === 'declining') {
        summary += ' Consider what changed - your scores dipped toward the end.';
    }
    return {
        weekStartDate,
        weekEndDate,
        dailyScores: dayEvaluations.map((d) => d.score),
        averageScore: weeklyScoreResult.score,
        scoreLabel: weeklyScoreResult.label,
        scoreColor: weeklyScoreResult.color,
        averageMAR: weeklyScoreResult.averageMAR,
        cumulativeMAR: Math.round(cumulativeMAR * 1000) / 1000,
        daysLogged: weeklyScoreResult.daysLogged,
        consistency: weeklyScoreResult.consistency,
        trend,
        summary,
        focus: {
            id: focusId,
            name: focusConfig.name,
        },
    };
}
/**
 * Quick score calculation without full evaluation details
 */
function quickScoreV2(profile, dailyIntake, focusId = 'balanced') {
    var _a;
    const targets = (0, targets_1.computeUserTargets)(profile);
    const nutrientEvaluations = (0, nutrientEvaluator_1.evaluateNutrients)(dailyIntake.totals, targets.nutrients);
    const intakeData = {
        nutrients: dailyIntake.totals,
        calories: (_a = dailyIntake.totals.calories) !== null && _a !== void 0 ? _a : 0,
        calorieTarget: targets.calories,
    };
    const scoreResult = (0, scoreCalculatorV2_1.calculateScoreV2)(nutrientEvaluations, intakeData, focusId);
    return {
        score: scoreResult.score,
        label: scoreResult.label,
        color: scoreResult.color,
        mar: scoreResult.mar,
    };
}
//# sourceMappingURL=dayEvaluatorV2.js.map