/**
 * Gap Generator
 *
 * Generates informational messages about nutritional gaps
 * with educational suggestions (not medical advice).
 */

import type { NutrientEvaluation, NutrientGap } from '../../../types/nutrition';
import { getFoodSuggestions, getWhyItMatters } from './educationGenerator';

/**
 * Generate gap information from nutrient evaluations
 */
export function generateGapInfo(
  evaluations: NutrientEvaluation[],
  maxCount: number = 5
): NutrientGap[] {
  const gaps: NutrientGap[] = [];

  // Find beneficial nutrients below target
  const belowTarget = evaluations
    .filter(
      (e) =>
        e.classification === 'beneficial' &&
        (e.status === 'below_target' || e.status === 'low') &&
        e.percentOfTarget !== null &&
        e.target !== null
    )
    .sort((a, b) => (a.percentOfTarget ?? 0) - (b.percentOfTarget ?? 0));

  for (const eval_ of belowTarget.slice(0, maxCount)) {
    const foodSuggestions = getFoodSuggestions(eval_.nutrientId, 3);
    const suggestion = generateSuggestion(eval_, foodSuggestions);

    gaps.push({
      nutrientId: eval_.nutrientId,
      displayName: eval_.displayName,
      intake: eval_.intake,
      target: eval_.target!,
      percentOfTarget: eval_.percentOfTarget!,
      unit: eval_.unit,
      suggestion,
    });
  }

  return gaps;
}

/**
 * Generate a helpful suggestion for a gap
 */
function generateSuggestion(
  eval_: NutrientEvaluation,
  foodSources: string[]
): string {
  const percent = eval_.percentOfTarget ?? 0;
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
    return `A small boost from ${foodSources[0]?.toLowerCase() ?? 'nutrient-rich foods'} could help you reach 100%.`;
  }
  return `You're close to meeting your daily target.`;
}

/**
 * Generate a gap message for display
 */
export function generateGapMessage(gap: NutrientGap): string {
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
export function generateDetailedGap(
  eval_: NutrientEvaluation
): {
  message: string;
  whyItMatters: string;
  foodSuggestions: string[];
  currentVsTarget: string;
} | null {
  if (eval_.percentOfTarget === null || eval_.target === null) {
    return null;
  }

  const percent = eval_.percentOfTarget;
  const whyItMatters = getWhyItMatters(eval_.nutrientId);
  const foodSuggestions = getFoodSuggestions(eval_.nutrientId, 5);

  let message: string;
  if (percent < 33) {
    message = `Your ${eval_.displayName} intake is significantly below the recommended amount.`;
  } else if (percent < 67) {
    message = `You're getting about half of your recommended ${eval_.displayName}.`;
  } else {
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
export function prioritizeGaps(gaps: NutrientGap[]): NutrientGap[] {
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

    if (aIsPriority && !bIsPriority) return -1;
    if (!aIsPriority && bIsPriority) return 1;
    if (aIsPriority && bIsPriority) return aPriority - bPriority;

    // Then by how far below target (lower % = higher priority)
    return a.percentOfTarget - b.percentOfTarget;
  });
}
