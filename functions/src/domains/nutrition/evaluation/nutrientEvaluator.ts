/**
 * Nutrient Evaluator
 *
 * Evaluates a single nutrient's intake against its target and limits.
 */

import type {
  NutrientTarget,
  NutrientEvaluation,
  NutrientClassification,
} from '../../../types/nutrition';
import { nutritionData } from '../data';
import {
  classifyNutrientIntake,
  getStatusLabel,
  getStatusColor,
} from './classifier';

/**
 * Calculate percentage of target
 */
function calcPercentOfTarget(intake: number, target: number | null): number | null {
  if (target === null || target === 0) return null;
  return Math.round((intake / target) * 100);
}

/**
 * Calculate percentage of limit (upper limit or CDRR)
 */
function calcPercentOfLimit(
  intake: number,
  upperLimit: number | null | undefined,
  cdrrLimit: number | null | undefined
): number | null {
  // Use CDRR if available (more restrictive), otherwise use UL
  const limit = cdrrLimit ?? upperLimit;
  if (limit === null || limit === undefined || limit === 0) return null;
  return Math.round((intake / limit) * 100);
}

/**
 * Get nutrient classification from data service
 */
function getNutrientClassification(nutrientId: string): NutrientClassification {
  const nutrientDef = nutritionData.getNutrient(nutrientId);
  if (!nutrientDef) return 'neutral';

  // Map 'risk' to 'limit' for evaluation purposes
  if (nutrientDef.classification === 'risk') {
    return 'limit';
  }
  return nutrientDef.classification;
}

/**
 * Evaluate a single nutrient's intake against its target
 */
export function evaluateNutrient(
  nutrientId: string,
  intake: number,
  target: NutrientTarget
): NutrientEvaluation {
  const classification = getNutrientClassification(nutrientId);

  // Calculate percentages
  const percentOfTarget = calcPercentOfTarget(intake, target.target ?? null);
  const percentOfLimit = calcPercentOfLimit(intake, target.upperLimit, target.cdrrLimit);

  // Classify the intake
  const status = classifyNutrientIntake(classification, percentOfTarget, percentOfLimit);
  const statusLabel = getStatusLabel(status);
  const statusColor = getStatusColor(status);

  return {
    nutrientId,
    displayName: target.displayName,
    intake,
    target: target.target ?? null,
    upperLimit: target.upperLimit ?? null,
    unit: target.unit,
    percentOfTarget,
    percentOfLimit,
    classification,
    status,
    statusLabel,
    statusColor,
  };
}

/**
 * Evaluate multiple nutrients at once
 */
export function evaluateNutrients(
  intakes: Record<string, number>,
  targets: Record<string, NutrientTarget>
): NutrientEvaluation[] {
  const evaluations: NutrientEvaluation[] = [];

  for (const [nutrientId, target] of Object.entries(targets)) {
    const intake = intakes[nutrientId] ?? 0;
    const evaluation = evaluateNutrient(nutrientId, intake, target);
    evaluations.push(evaluation);
  }

  return evaluations;
}

/**
 * Get nutrients that are below target (gaps)
 */
export function findNutrientGaps(
  evaluations: NutrientEvaluation[],
  thresholdPercent: number = 67
): NutrientEvaluation[] {
  return evaluations.filter((e) => {
    // Only consider beneficial nutrients for gaps
    if (e.classification !== 'beneficial') return false;
    // Check if below threshold
    return e.percentOfTarget !== null && e.percentOfTarget < thresholdPercent;
  });
}

/**
 * Get nutrients that are exceeding limits
 */
export function findExceedingLimits(evaluations: NutrientEvaluation[]): NutrientEvaluation[] {
  return evaluations.filter((e) => {
    // Only consider limit nutrients
    if (e.classification !== 'limit') return false;
    // Check if at or over limit
    return e.percentOfLimit !== null && e.percentOfLimit >= 100;
  });
}

/**
 * Get nutrients that are doing well (highlights)
 */
export function findHighlights(evaluations: NutrientEvaluation[]): NutrientEvaluation[] {
  return evaluations.filter((e) => {
    if (e.classification === 'beneficial') {
      // Beneficial nutrient meeting target
      return e.percentOfTarget !== null && e.percentOfTarget >= 100;
    }
    if (e.classification === 'limit') {
      // Limit nutrient well under limit
      return e.percentOfLimit !== null && e.percentOfLimit < 50;
    }
    return false;
  });
}
