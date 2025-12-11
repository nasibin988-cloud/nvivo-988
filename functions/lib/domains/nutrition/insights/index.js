"use strict";
/**
 * Nutrition Insights Module
 *
 * Exports functions for generating educational content,
 * highlights, gaps, and summaries from nutrition data.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWeeklySummary = exports.generateNarrativeSummary = exports.generateDailySummary = exports.prioritizeGaps = exports.generateDetailedGap = exports.generateGapMessage = exports.generateGapInfo = exports.generateAchievementMessages = exports.generateHighlightMessage = exports.generateHighlights = exports.getNutrientsByCategory = exports.getFoodSuggestions = exports.getWhyItMatters = exports.getNutrientEducation = void 0;
// Education
var educationGenerator_1 = require("./educationGenerator");
Object.defineProperty(exports, "getNutrientEducation", { enumerable: true, get: function () { return educationGenerator_1.getNutrientEducation; } });
Object.defineProperty(exports, "getWhyItMatters", { enumerable: true, get: function () { return educationGenerator_1.getWhyItMatters; } });
Object.defineProperty(exports, "getFoodSuggestions", { enumerable: true, get: function () { return educationGenerator_1.getFoodSuggestions; } });
Object.defineProperty(exports, "getNutrientsByCategory", { enumerable: true, get: function () { return educationGenerator_1.getNutrientsByCategory; } });
// Highlights
var highlightGenerator_1 = require("./highlightGenerator");
Object.defineProperty(exports, "generateHighlights", { enumerable: true, get: function () { return highlightGenerator_1.generateHighlights; } });
Object.defineProperty(exports, "generateHighlightMessage", { enumerable: true, get: function () { return highlightGenerator_1.generateHighlightMessage; } });
Object.defineProperty(exports, "generateAchievementMessages", { enumerable: true, get: function () { return highlightGenerator_1.generateAchievementMessages; } });
// Gaps
var gapGenerator_1 = require("./gapGenerator");
Object.defineProperty(exports, "generateGapInfo", { enumerable: true, get: function () { return gapGenerator_1.generateGapInfo; } });
Object.defineProperty(exports, "generateGapMessage", { enumerable: true, get: function () { return gapGenerator_1.generateGapMessage; } });
Object.defineProperty(exports, "generateDetailedGap", { enumerable: true, get: function () { return gapGenerator_1.generateDetailedGap; } });
Object.defineProperty(exports, "prioritizeGaps", { enumerable: true, get: function () { return gapGenerator_1.prioritizeGaps; } });
// Summaries
var summaryGenerator_1 = require("./summaryGenerator");
Object.defineProperty(exports, "generateDailySummary", { enumerable: true, get: function () { return summaryGenerator_1.generateDailySummary; } });
Object.defineProperty(exports, "generateNarrativeSummary", { enumerable: true, get: function () { return summaryGenerator_1.generateNarrativeSummary; } });
Object.defineProperty(exports, "generateWeeklySummary", { enumerable: true, get: function () { return summaryGenerator_1.generateWeeklySummary; } });
//# sourceMappingURL=index.js.map