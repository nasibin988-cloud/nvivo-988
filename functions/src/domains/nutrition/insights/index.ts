/**
 * Nutrition Insights Module
 *
 * Exports functions for generating educational content,
 * highlights, gaps, and summaries from nutrition data.
 */

// Education
export {
  getNutrientEducation,
  getWhyItMatters,
  getFoodSuggestions,
  getNutrientsByCategory,
  type NutrientEducation,
} from './educationGenerator';

// Highlights
export {
  generateHighlights,
  generateHighlightMessage,
  generateAchievementMessages,
  type Highlight,
} from './highlightGenerator';

// Gaps
export {
  generateGapInfo,
  generateGapMessage,
  generateDetailedGap,
  prioritizeGaps,
} from './gapGenerator';

// Summaries
export {
  generateDailySummary,
  generateNarrativeSummary,
  generateWeeklySummary,
} from './summaryGenerator';
