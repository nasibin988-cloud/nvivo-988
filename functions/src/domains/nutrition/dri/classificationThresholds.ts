/**
 * Classification Thresholds Configuration
 *
 * Defines the thresholds used to classify nutrient amounts as
 * high/moderate/low based on percent of DRI targets.
 *
 * These thresholds can be adjusted to fine-tune the sensitivity of
 * nutrient classifications without changing the core classification logic.
 *
 * Research basis:
 * - FDA: >20% DV is "High", >5% DV is "Good Source"
 * - Per-serving context vs. daily context
 */

/**
 * Thresholds for beneficial nutrients (higher is better).
 * Used for nutrients like protein, fiber, vitamins, minerals.
 *
 * @example
 * - HIGH: >20% of RDA/AI = Great source
 * - MODERATE: 10-20% of RDA/AI = Good contribution
 * - LOW: <10% of RDA/AI = Minimal contribution
 */
export const BENEFICIAL_THRESHOLDS = {
  /** Percent of RDA/AI to be classified as "high" (green/excellent) */
  HIGH: 20,
  /** Percent of RDA/AI to be classified as "moderate" (light green/good) */
  MODERATE: 10,
  /** Below this is "low" (gray/minimal) */
  LOW: 10,
} as const;

/**
 * Thresholds for risk nutrients (lower is better).
 * Used for nutrients like sodium, saturated fat, trans fat, added sugar.
 *
 * @example
 * - HIGH: >20% of UL = Significant portion of daily limit (red warning)
 * - MODERATE: 10-20% of UL = Notable amount (orange caution)
 * - LOW: <10% of UL = Safe amount (green/safe)
 */
export const RISK_THRESHOLDS = {
  /** Percent of UL to be classified as "high" risk (red warning) */
  HIGH: 20,
  /** Percent of UL to be classified as "moderate" risk (orange caution) */
  MODERATE: 10,
  /** Below this is "low" risk (safe) */
  LOW: 10,
} as const;

/**
 * Combined thresholds configuration.
 * Exported for use in classification logic.
 */
export const CLASSIFICATION_THRESHOLDS = {
  beneficial: BENEFICIAL_THRESHOLDS,
  risk: RISK_THRESHOLDS,
} as const;

/**
 * Get the classification threshold for a specific nature and level.
 *
 * @param nature - 'beneficial' or 'risk'
 * @param level - 'HIGH', 'MODERATE', or 'LOW'
 * @returns The threshold percentage
 */
export function getThreshold(
  nature: 'beneficial' | 'risk',
  level: 'HIGH' | 'MODERATE' | 'LOW'
): number {
  return CLASSIFICATION_THRESHOLDS[nature][level];
}

/**
 * Classification levels for UI display.
 * Maps classification strings to severity levels for styling.
 */
export const CLASSIFICATION_SEVERITY = {
  beneficial_high: { level: 'success', priority: 3 },
  beneficial_moderate: { level: 'info', priority: 2 },
  beneficial_low: { level: 'neutral', priority: 1 },
  risk_high: { level: 'error', priority: 3 },
  risk_moderate: { level: 'warning', priority: 2 },
  risk_low: { level: 'success', priority: 1 },
  neutral: { level: 'neutral', priority: 0 },
  not_applicable: { level: 'muted', priority: 0 },
  insufficient_data: { level: 'muted', priority: 0 },
} as const;

/**
 * Get the UI severity level for a classification.
 *
 * @param classification - The nutrient classification
 * @returns Object with level and priority
 */
export function getClassificationSeverity(
  classification: keyof typeof CLASSIFICATION_SEVERITY
): { level: string; priority: number } {
  return CLASSIFICATION_SEVERITY[classification] ?? CLASSIFICATION_SEVERITY.neutral;
}

/**
 * Sort evaluations by priority (highest first).
 * Useful for highlighting the most important nutrients.
 *
 * @param classifications - Array of classification strings
 * @returns Sorted array (highest priority first)
 */
export function sortByPriority<T extends { classification: keyof typeof CLASSIFICATION_SEVERITY }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const aPriority = CLASSIFICATION_SEVERITY[a.classification]?.priority ?? 0;
    const bPriority = CLASSIFICATION_SEVERITY[b.classification]?.priority ?? 0;
    return bPriority - aPriority;
  });
}
