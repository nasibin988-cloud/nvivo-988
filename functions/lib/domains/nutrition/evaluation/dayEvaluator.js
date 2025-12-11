"use strict";
/**
 * Day Evaluator
 *
 * Evaluates an entire day's nutrition intake, producing a complete
 * evaluation with score, nutrient breakdown, highlights, and gaps.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateDay = evaluateDay;
exports.evaluateDayWithTargets = evaluateDayWithTargets;
exports.quickScore = quickScore;
const targets_1 = require("../targets");
const nutrientEvaluator_1 = require("./nutrientEvaluator");
const scoreCalculator_1 = require("./scoreCalculator");
/**
 * Generate highlight messages from evaluation results
 */
function generateHighlightMessages(highlights) {
    return highlights.slice(0, 5).map((h) => {
        if (h.classification === 'beneficial') {
            return `Great ${h.displayName} intake (${h.percentOfTarget}% of target)`;
        }
        return `${h.displayName} well within recommended limits`;
    });
}
/**
 * Generate gap messages from evaluation results
 */
function generateGapMessages(gaps) {
    return gaps.slice(0, 5).map((g) => {
        var _a;
        const percent = (_a = g.percentOfTarget) !== null && _a !== void 0 ? _a : 0;
        if (percent < 33) {
            return `${g.displayName} is low - consider foods rich in this nutrient`;
        }
        return `${g.displayName} is below target (${percent}%)`;
    });
}
/**
 * Generate daily summary message
 */
function generateSummary(score, highlights, gaps) {
    var _a, _b;
    if (score >= 90) {
        return 'Outstanding nutrition day! You met or exceeded targets for most nutrients while keeping limit nutrients in check.';
    }
    if (score >= 75) {
        return 'Great job today! Your nutrition is well-balanced with good variety.';
    }
    if (score >= 60) {
        return 'Good progress! A few areas could use attention, but overall a solid day.';
    }
    if (score >= 40) {
        if (gaps.length > 0) {
            return `Fair day with room for improvement. Consider adding foods rich in ${(_b = (_a = gaps[0]) === null || _a === void 0 ? void 0 : _a.split(' ')[0]) !== null && _b !== void 0 ? _b : 'key nutrients'}.`;
        }
        return 'Fair day with room for improvement. Try to include more variety in your meals.';
    }
    return 'This day had some nutritional gaps. Try to include a wider variety of nutrient-rich foods.';
}
/**
 * Evaluate an entire day's nutrition
 */
function evaluateDay(profile, dailyIntake) {
    // Compute personalized targets for this user
    const targets = (0, targets_1.computeUserTargets)(profile);
    // Evaluate all nutrients
    const nutrientEvaluations = (0, nutrientEvaluator_1.evaluateNutrients)(dailyIntake.totals, targets.nutrients);
    // Calculate overall score
    const { score, breakdown } = (0, scoreCalculator_1.calculateScore)(nutrientEvaluations);
    const scoreLabel = (0, scoreCalculator_1.getScoreLabel)(score);
    const scoreColor = (0, scoreCalculator_1.getScoreColor)(score);
    // Find highlights and gaps
    const highlightEvals = (0, nutrientEvaluator_1.findHighlights)(nutrientEvaluations);
    const gapEvals = (0, nutrientEvaluator_1.findNutrientGaps)(nutrientEvaluations);
    const highlights = generateHighlightMessages(highlightEvals);
    const gaps = generateGapMessages(gapEvals);
    const summary = generateSummary(score, highlights, gaps);
    return {
        date: dailyIntake.date,
        score,
        scoreLabel,
        scoreColor,
        breakdown,
        nutrients: nutrientEvaluations,
        highlights,
        gaps,
        summary,
    };
}
/**
 * Evaluate a day using pre-computed targets (more efficient for batch operations)
 */
function evaluateDayWithTargets(dailyIntake, targets) {
    // Evaluate all nutrients
    const nutrientEvaluations = (0, nutrientEvaluator_1.evaluateNutrients)(dailyIntake.totals, targets.nutrients);
    // Calculate overall score
    const { score, breakdown } = (0, scoreCalculator_1.calculateScore)(nutrientEvaluations);
    const scoreLabel = (0, scoreCalculator_1.getScoreLabel)(score);
    const scoreColor = (0, scoreCalculator_1.getScoreColor)(score);
    // Find highlights and gaps
    const highlightEvals = (0, nutrientEvaluator_1.findHighlights)(nutrientEvaluations);
    const gapEvals = (0, nutrientEvaluator_1.findNutrientGaps)(nutrientEvaluations);
    const highlights = generateHighlightMessages(highlightEvals);
    const gaps = generateGapMessages(gapEvals);
    const summary = generateSummary(score, highlights, gaps);
    return {
        date: dailyIntake.date,
        score,
        scoreLabel,
        scoreColor,
        breakdown,
        nutrients: nutrientEvaluations,
        highlights,
        gaps,
        summary,
    };
}
/**
 * Quick score calculation without full evaluation details
 * Useful for history/trend displays
 */
function quickScore(profile, dailyIntake) {
    const targets = (0, targets_1.computeUserTargets)(profile);
    const nutrientEvaluations = (0, nutrientEvaluator_1.evaluateNutrients)(dailyIntake.totals, targets.nutrients);
    const { score } = (0, scoreCalculator_1.calculateScore)(nutrientEvaluations);
    return {
        score,
        scoreLabel: (0, scoreCalculator_1.getScoreLabel)(score),
        scoreColor: (0, scoreCalculator_1.getScoreColor)(score),
    };
}
//# sourceMappingURL=dayEvaluator.js.map