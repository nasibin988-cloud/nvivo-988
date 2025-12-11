/**
 * Age Utilities
 *
 * Functions for calculating age and determining life stage groups
 * for DRI lookups.
 */

import type { Sex, LifeStageGroup } from '../../../types/nutrition';

/**
 * Calculate age in years and months from date of birth
 */
export function calculateAge(dateOfBirth: string): { years: number; months: number } {
  const dob = new Date(dateOfBirth);
  const now = new Date();

  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();

  if (months < 0 || (months === 0 && now.getDate() < dob.getDate())) {
    years--;
    months += 12;
  }

  if (now.getDate() < dob.getDate()) {
    months--;
    if (months < 0) months += 12;
  }

  return { years, months };
}

/**
 * Determine life stage group for DRI lookup based on age, sex, and special states
 */
export function getLifeStageGroup(
  ageYears: number,
  sex: Sex,
  isPregnant?: boolean,
  isLactating?: boolean
): LifeStageGroup {
  // Handle pregnancy/lactation first (only applies to females)
  if (sex === 'female') {
    if (isPregnant) {
      if (ageYears < 19) return 'pregnancy_14_18';
      if (ageYears <= 30) return 'pregnancy_19_30';
      return 'pregnancy_31_50';
    }
    if (isLactating) {
      if (ageYears < 19) return 'lactation_14_18';
      if (ageYears <= 30) return 'lactation_19_30';
      return 'lactation_31_50';
    }
  }

  // Standard age-based life stages
  if (ageYears < 0.5) return 'infants_0_6mo';
  if (ageYears < 1) return 'infants_7_12mo';
  if (ageYears < 4) return 'children_1_3';
  if (ageYears < 9) return 'children_4_8';
  if (ageYears < 14) return 'children_9_13';
  if (ageYears < 19) return 'adolescents_14_18';
  if (ageYears <= 30) return 'adults_19_30';
  if (ageYears <= 50) return 'adults_31_50';
  if (ageYears <= 70) return 'adults_51_70';
  return 'adults_70_plus';
}

/**
 * Get the DRI life stage string for lookup (standard, pregnancy, lactation)
 */
export function getDriLifeStage(
  isPregnant?: boolean,
  isLactating?: boolean
): 'standard' | 'pregnancy' | 'lactation' {
  if (isPregnant) return 'pregnancy';
  if (isLactating) return 'lactation';
  return 'standard';
}

/**
 * Check if user is in pediatric age range
 */
export function isPediatric(ageYears: number): boolean {
  return ageYears < 19;
}

/**
 * Check if user is elderly (65+)
 */
export function isElderly(ageYears: number): boolean {
  return ageYears >= 65;
}
