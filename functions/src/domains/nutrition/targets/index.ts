/**
 * Nutrition Targets Module
 *
 * Exports functions for calculating personalized nutrition targets.
 */

// Age utilities
export {
  calculateAge,
  getLifeStageGroup,
  getDriLifeStage,
  isPediatric,
  isElderly,
} from './ageUtils';

// Calorie calculator
export {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateEnergy,
  getActivityMultiplier,
  getGoalAdjustment,
} from './calorieCalculator';

// Target computer
export {
  computeUserTargets,
  computeTargetsForNutrients,
  computeSingleTarget,
  computeCalorieTarget,
} from './targetComputer';
