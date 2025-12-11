/**
 * Calorie Calculator
 *
 * Calculates BMR, TDEE, and target calories using the Mifflin-St Jeor equation.
 * This is considered the most accurate formula for estimating metabolic rate.
 */

import type { ActivityLevel, NutritionGoal, EnergyCalculation } from '../../../types/nutrition';
import { calculateAge } from './ageUtils';

/**
 * Activity level multipliers (PAL - Physical Activity Level)
 * Based on IOM dietary reference intakes
 */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,      // Little or no exercise, desk job
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  high: 1.725,         // Hard exercise 6-7 days/week
  athlete: 1.9,        // Very hard exercise, physical job, or 2x/day training
};

/**
 * Goal-based calorie adjustments
 */
const GOAL_ADJUSTMENTS: Record<NutritionGoal, number> = {
  weight_loss: -500,   // ~1 lb/week loss (500 kcal deficit)
  maintenance: 0,      // No adjustment
  weight_gain: 300,    // Gradual surplus
  muscle_gain: 300,    // Surplus for muscle building
  performance: 400,    // Higher surplus for athletic performance
};

/**
 * Default calorie values when BMR cannot be calculated (missing weight/height)
 */
const DEFAULT_CALORIES = {
  male: 2500,
  female: 2000,
};

/**
 * Minimum safe calorie levels
 */
const MINIMUM_CALORIES = {
  male: 1500,
  female: 1200,
};

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation (1990)
 *
 * Male:   BMR = 10×weight(kg) + 6.25×height(cm) - 5×age + 5
 * Female: BMR = 10×weight(kg) + 6.25×height(cm) - 5×age - 161
 *
 * @param weightKg - Weight in kilograms
 * @param heightCm - Height in centimeters
 * @param ageYears - Age in years
 * @param sex - Biological sex
 * @returns BMR in kcal/day
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  sex: 'male' | 'female'
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return sex === 'male' ? base + 5 : base - 161;
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * TDEE = BMR × Activity Multiplier
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55;
  return Math.round(bmr * multiplier);
}

/**
 * Calculate target calories including goal adjustment
 */
export function calculateTargetCalories(
  tdee: number,
  goal: NutritionGoal,
  sex: 'male' | 'female'
): number {
  const adjustment = GOAL_ADJUSTMENTS[goal] ?? 0;
  const target = tdee + adjustment;

  // Ensure minimum safe calories
  const minimum = MINIMUM_CALORIES[sex];
  return Math.max(minimum, Math.round(target));
}

/**
 * Complete energy calculation from user profile data
 *
 * @param dateOfBirth - ISO date string
 * @param sex - 'male' or 'female'
 * @param weightKg - Weight in kg (optional)
 * @param heightCm - Height in cm (optional)
 * @param activityLevel - Activity level
 * @param goal - Nutrition goal
 * @param isPregnant - Whether user is pregnant
 * @param isLactating - Whether user is lactating
 */
export function calculateEnergy(
  dateOfBirth: string,
  sex: 'male' | 'female',
  weightKg: number | undefined,
  heightCm: number | undefined,
  activityLevel: ActivityLevel,
  goal: NutritionGoal,
  isPregnant?: boolean,
  isLactating?: boolean
): EnergyCalculation {
  const { years: ageYears } = calculateAge(dateOfBirth);
  const activityMultiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55;
  const goalAdjustment = GOAL_ADJUSTMENTS[goal] ?? 0;

  // If we have weight and height, use Mifflin-St Jeor
  if (weightKg && heightCm) {
    const bmr = calculateBMR(weightKg, heightCm, ageYears, sex);
    let tdee = calculateTDEE(bmr, activityLevel);

    // Pregnancy/lactation adjustments (from IOM)
    if (isPregnant) {
      tdee += 340; // Average additional needs during pregnancy
    } else if (isLactating) {
      tdee += 400; // Additional needs for milk production
    }

    const targetCalories = calculateTargetCalories(tdee, goal, sex);

    return {
      bmr: Math.round(bmr),
      tdee,
      targetCalories,
      activityMultiplier,
      goalAdjustment,
      method: 'mifflin_st_jeor',
    };
  }

  // Fallback to defaults when weight/height not available
  let defaultCalories = DEFAULT_CALORIES[sex];

  // Pregnancy/lactation adjustments
  if (isPregnant) {
    defaultCalories += 340;
  } else if (isLactating) {
    defaultCalories += 400;
  }

  const adjustedDefault = defaultCalories + goalAdjustment;
  const minimum = MINIMUM_CALORIES[sex];

  return {
    bmr: Math.round(defaultCalories / activityMultiplier),
    tdee: defaultCalories,
    targetCalories: Math.max(minimum, adjustedDefault),
    activityMultiplier,
    goalAdjustment,
    method: 'default',
  };
}

/**
 * Get activity multiplier value for display
 */
export function getActivityMultiplier(activityLevel: ActivityLevel): number {
  return ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55;
}

/**
 * Get goal adjustment value for display
 */
export function getGoalAdjustment(goal: NutritionGoal): number {
  return GOAL_ADJUSTMENTS[goal] ?? 0;
}
