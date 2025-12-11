/**
 * Highlight Generator
 *
 * Generates positive highlights and achievement messages
 * based on nutrient evaluation results.
 */

import type { NutrientEvaluation } from '../../../types/nutrition';

export interface Highlight {
  nutrientId: string;
  displayName: string;
  message: string;
  detail: string;
  icon: 'star' | 'check' | 'trophy' | 'heart';
}

/**
 * Generate highlights from nutrient evaluations
 * Highlights are positive messages about nutrients meeting or exceeding targets
 */
export function generateHighlights(
  evaluations: NutrientEvaluation[],
  maxCount: number = 5
): Highlight[] {
  const highlights: Highlight[] = [];

  // Find beneficial nutrients exceeding target
  const excellentBeneficial = evaluations
    .filter((e) => e.classification === 'beneficial' && e.status === 'excellent')
    .sort((a, b) => (b.percentOfTarget ?? 0) - (a.percentOfTarget ?? 0));

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
    .sort((a, b) => (a.percentOfLimit ?? 100) - (b.percentOfLimit ?? 100));

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
export function generateHighlightMessage(eval_: NutrientEvaluation): string {
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
export function generateAchievementMessages(
  evaluations: NutrientEvaluation[],
  score: number
): string[] {
  const messages: string[] = [];

  // Score-based achievements
  if (score >= 90) {
    messages.push('Outstanding nutrition day! 🌟');
  } else if (score >= 80) {
    messages.push('Excellent balance today!');
  }

  // Count excellent nutrients
  const excellentCount = evaluations.filter(
    (e) => e.classification === 'beneficial' && e.status === 'excellent'
  ).length;

  if (excellentCount >= 10) {
    messages.push(`Hit targets for ${excellentCount} nutrients!`);
  } else if (excellentCount >= 5) {
    messages.push(`Met ${excellentCount} nutrient targets`);
  }

  // Check if all limit nutrients are under control
  const limitNutrients = evaluations.filter((e) => e.classification === 'limit');
  const allLimitsGood = limitNutrients.every(
    (e) => e.status === 'well_within' || e.status === 'moderate'
  );

  if (allLimitsGood && limitNutrients.length > 0) {
    messages.push('All limit nutrients in healthy range');
  }

  return messages.slice(0, 3);
}
