/**
 * Summary Generator
 *
 * Generates daily and weekly nutrition summaries with
 * educational insights and actionable information.
 */

import type {
  NutrientEvaluation,
  DayEvaluation,
  DailySummary,
  ScoreBreakdown,
} from '../../../types/nutrition';

/**
 * Generate a daily summary from evaluation results
 */
export function generateDailySummary(
  evaluations: NutrientEvaluation[],
  calorieTarget: number
): DailySummary {
  // Extract key macro values
  const calories = evaluations.find((e) => e.nutrientId === 'calories');
  const protein = evaluations.find((e) => e.nutrientId === 'protein');
  const carbs = evaluations.find((e) => e.nutrientId === 'carbohydrate');
  const fat = evaluations.find((e) => e.nutrientId === 'total_fat');
  const fiber = evaluations.find((e) => e.nutrientId === 'fiber');
  const sodium = evaluations.find((e) => e.nutrientId === 'sodium');

  // Calculate score from evaluations
  const beneficialGood = evaluations.filter(
    (e) => e.classification === 'beneficial' && (e.status === 'excellent' || e.status === 'good')
  ).length;
  const totalBeneficial = evaluations.filter((e) => e.classification === 'beneficial').length;
  const beneficialRatio = totalBeneficial > 0 ? beneficialGood / totalBeneficial : 0;

  const limitGood = evaluations.filter(
    (e) => e.classification === 'limit' && (e.status === 'well_within' || e.status === 'moderate')
  ).length;
  const totalLimit = evaluations.filter((e) => e.classification === 'limit').length;
  const limitRatio = totalLimit > 0 ? limitGood / totalLimit : 1;

  const score = Math.round((beneficialRatio * 50 + limitRatio * 50));

  // Generate highlights
  const topHighlights = generateTopHighlights(evaluations);

  // Generate gaps
  const topGaps = generateTopGaps(evaluations);

  return {
    score,
    caloriesConsumed: calories?.intake ?? 0,
    calorieTarget,
    proteinGrams: protein?.intake ?? 0,
    carbsGrams: carbs?.intake ?? 0,
    fatGrams: fat?.intake ?? 0,
    fiberGrams: fiber?.intake ?? 0,
    sodiumMg: sodium?.intake ?? 0,
    topHighlights,
    topGaps,
  };
}

/**
 * Generate top highlight messages
 */
function generateTopHighlights(evaluations: NutrientEvaluation[]): string[] {
  const highlights: string[] = [];

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
function generateTopGaps(evaluations: NutrientEvaluation[]): string[] {
  const gaps: string[] = [];

  // Find low beneficial nutrients
  const low = evaluations
    .filter(
      (e) =>
        e.classification === 'beneficial' &&
        (e.status === 'low' || e.status === 'below_target')
    )
    .sort((a, b) => (a.percentOfTarget ?? 100) - (b.percentOfTarget ?? 100))
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
export function generateNarrativeSummary(
  score: number,
  breakdown: ScoreBreakdown,
  highlights: string[],
  gaps: string[]
): string {
  const parts: string[] = [];

  // Opening based on score
  if (score >= 90) {
    parts.push('Outstanding day!');
  } else if (score >= 75) {
    parts.push('Great nutrition day!');
  } else if (score >= 60) {
    parts.push('Good progress today.');
  } else if (score >= 40) {
    parts.push('Decent day with room for improvement.');
  } else {
    parts.push('Today had some challenges.');
  }

  // Add specifics based on breakdown
  if (breakdown.beneficial >= 35) {
    parts.push('You hit most of your nutrient targets.');
  } else if (breakdown.beneficial >= 25) {
    parts.push('You met several nutrient targets.');
  } else if (breakdown.beneficial < 15) {
    parts.push('Many nutrients were below target.');
  }

  if (breakdown.limit >= 35) {
    parts.push('Limit nutrients were well controlled.');
  } else if (breakdown.limit < 20) {
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
export function generateWeeklySummary(
  dailyEvaluations: DayEvaluation[]
): {
  averageScore: number;
  daysLogged: number;
  bestDay: { date: string; score: number } | null;
  consistentHighlights: string[];
  consistentGaps: string[];
  trend: 'improving' | 'stable' | 'declining';
  summary: string;
} {
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
  const consistentHighlights = findConsistentPatterns(
    dailyEvaluations.flatMap((e) => e.highlights)
  );
  const consistentGaps = findConsistentPatterns(
    dailyEvaluations.flatMap((e) => e.gaps)
  );

  // Determine trend (compare first half to second half)
  const midpoint = Math.floor(dailyEvaluations.length / 2);
  const firstHalf = scores.slice(0, midpoint);
  const secondHalf = scores.slice(midpoint);

  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (firstHalf.length > 0 && secondHalf.length > 0) {
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 5) trend = 'improving';
    else if (secondAvg < firstAvg - 5) trend = 'declining';
  }

  // Generate summary
  let summary: string;
  if (averageScore >= 80) {
    summary = `Excellent week! You averaged ${averageScore} points across ${dailyEvaluations.length} days.`;
  } else if (averageScore >= 60) {
    summary = `Good week with an average score of ${averageScore}. ${
      trend === 'improving' ? 'Your scores are improving!' : ''
    }`;
  } else {
    summary = `Your average score was ${averageScore}. Focus on ${
      consistentGaps[0] ?? 'meeting more nutrient targets'
    }.`;
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
function findConsistentPatterns(messages: string[]): string[] {
  const counts = new Map<string, number>();

  for (const msg of messages) {
    // Extract the nutrient name (first word or two)
    const nutrient = msg.split(' ').slice(0, 2).join(' ');
    counts.set(nutrient, (counts.get(nutrient) ?? 0) + 1);
  }

  // Return patterns that appear multiple times
  return Array.from(counts.entries())
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([nutrient]) => nutrient);
}
