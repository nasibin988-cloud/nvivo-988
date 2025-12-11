/**
 * Nutrient Intake Classifier
 *
 * Classifies nutrient intake levels and assigns status labels and colors.
 * Uses different logic for beneficial vs limit nutrients.
 */

import type {
  NutrientClassification,
  BeneficialStatus,
  LimitStatus,
  EvaluationStatus,
} from '../../../types/nutrition';

/**
 * Thresholds for beneficial nutrients (as % of target)
 * Higher is better (up to Upper Limit)
 */
const BENEFICIAL_THRESHOLDS = {
  excellent: 100, // ≥100% of target
  good: 67,       // 67-99% of target
  below_target: 33, // 33-66% of target
  low: 0,         // <33% of target
};

/**
 * Thresholds for limit nutrients (as % of limit)
 * Lower is better - these are the LOWER BOUNDS for each range
 */
const LIMIT_THRESHOLDS = {
  well_within: 0,       // 0-49% of limit
  moderate: 50,         // 50-79% of limit
  approaching_limit: 80, // 80-99% of limit
  exceeds_limit: 100,   // ≥100% of limit
};

/**
 * Status labels (descriptive, not prescriptive - FDA compliant)
 */
const STATUS_LABELS: Record<EvaluationStatus, string> = {
  // Beneficial statuses
  excellent: 'Excellent - exceeding daily target',
  good: 'Good - meeting most of daily target',
  below_target: 'Below target - room for improvement',
  low: 'Low - significantly below target',

  // Limit statuses
  well_within: 'Well within recommended range',
  moderate: 'Moderate - within typical range',
  approaching_limit: 'Approaching daily limit',
  exceeds_limit: 'Exceeds recommended daily limit',

  // Other
  adequate: 'Adequate intake',
  unknown: 'Unable to evaluate',
};

/**
 * Status colors for UI
 */
const STATUS_COLORS: Record<EvaluationStatus, 'green' | 'yellow' | 'orange' | 'red' | 'gray'> = {
  // Beneficial statuses
  excellent: 'green',
  good: 'green',
  below_target: 'yellow',
  low: 'orange',

  // Limit statuses
  well_within: 'green',
  moderate: 'yellow',
  approaching_limit: 'orange',
  exceeds_limit: 'red',

  // Other
  adequate: 'green',
  unknown: 'gray',
};

/**
 * Classify intake for a BENEFICIAL nutrient
 * (vitamins, minerals, protein, fiber - more is generally better)
 */
export function classifyBeneficialIntake(
  percentOfTarget: number,
  percentOfUpperLimit: number | null
): BeneficialStatus {
  // Check if exceeding upper limit (if one exists)
  if (percentOfUpperLimit !== null && percentOfUpperLimit >= 100) {
    // Even for beneficial nutrients, exceeding UL is concerning
    // But we still return a beneficial status - the UL warning is separate
    return 'excellent'; // They met the target, UL warning shown separately
  }

  if (percentOfTarget >= BENEFICIAL_THRESHOLDS.excellent) {
    return 'excellent';
  }
  if (percentOfTarget >= BENEFICIAL_THRESHOLDS.good) {
    return 'good';
  }
  if (percentOfTarget >= BENEFICIAL_THRESHOLDS.below_target) {
    return 'below_target';
  }
  return 'low';
}

/**
 * Classify intake for a LIMIT nutrient
 * (sodium, saturated fat, added sugars, trans fat - less is better)
 */
export function classifyLimitIntake(percentOfLimit: number): LimitStatus {
  if (percentOfLimit >= LIMIT_THRESHOLDS.exceeds_limit) {
    return 'exceeds_limit';
  }
  if (percentOfLimit >= LIMIT_THRESHOLDS.approaching_limit) {
    return 'approaching_limit';
  }
  if (percentOfLimit >= LIMIT_THRESHOLDS.moderate) {
    return 'moderate';
  }
  return 'well_within';
}

/**
 * Main classification function - routes to appropriate classifier
 */
export function classifyNutrientIntake(
  classification: NutrientClassification,
  percentOfTarget: number | null,
  percentOfLimit: number | null
): EvaluationStatus {
  // Handle unknown cases
  if (percentOfTarget === null && percentOfLimit === null) {
    return 'unknown';
  }

  // Route based on nutrient classification
  switch (classification) {
    case 'beneficial':
      if (percentOfTarget === null) return 'unknown';
      return classifyBeneficialIntake(percentOfTarget, percentOfLimit);

    case 'limit':
    case 'risk':
      if (percentOfLimit === null) {
        // If no limit but has target, use target-based evaluation
        if (percentOfTarget !== null) {
          return percentOfTarget <= 100 ? 'well_within' : 'exceeds_limit';
        }
        return 'unknown';
      }
      return classifyLimitIntake(percentOfLimit);

    case 'neutral':
    case 'context_dependent':
      // For neutral nutrients, use a balanced approach
      if (percentOfTarget !== null && percentOfTarget >= 67) {
        return 'adequate';
      }
      if (percentOfLimit !== null && percentOfLimit <= 100) {
        return 'adequate';
      }
      return percentOfTarget !== null ? 'below_target' : 'unknown';

    default:
      return 'unknown';
  }
}

/**
 * Get human-readable label for a status
 */
export function getStatusLabel(status: EvaluationStatus): string {
  return STATUS_LABELS[status] ?? 'Unable to evaluate';
}

/**
 * Get color for a status
 */
export function getStatusColor(
  status: EvaluationStatus
): 'green' | 'yellow' | 'orange' | 'red' | 'gray' {
  return STATUS_COLORS[status] ?? 'gray';
}

/**
 * Check if a nutrient is over its Upper Limit
 */
export function isOverUpperLimit(percentOfUpperLimit: number | null): boolean {
  return percentOfUpperLimit !== null && percentOfUpperLimit >= 100;
}

/**
 * Get Upper Limit warning message if applicable
 */
export function getUpperLimitWarning(
  nutrientName: string,
  percentOfUpperLimit: number | null
): string | null {
  if (!isOverUpperLimit(percentOfUpperLimit)) {
    return null;
  }
  return `${nutrientName} intake exceeds the Tolerable Upper Intake Level (UL). Very high intakes may have adverse effects.`;
}
