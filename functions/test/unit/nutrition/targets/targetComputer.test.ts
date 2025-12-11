import { describe, it, expect, beforeAll } from 'vitest';
import { preloadAllData } from '../../../../src/domains/nutrition/data';
import {
  computeUserTargets,
  computeSingleTarget,
  computeCalorieTarget,
} from '../../../../src/domains/nutrition/targets';
import {
  calculateBMR,
  calculateTDEE,
  calculateEnergy,
} from '../../../../src/domains/nutrition/targets/calorieCalculator';
import {
  calculateAge,
  getLifeStageGroup,
} from '../../../../src/domains/nutrition/targets/ageUtils';
import type { NutritionUserProfile } from '../../../../src/types/nutrition';

// Test user profiles
const ADULT_MALE: NutritionUserProfile = {
  userId: 'test-user-1',
  dateOfBirth: '1990-01-15', // ~35 years old
  sex: 'male',
  weightKg: 75,
  heightCm: 178,
  activityLevel: 'moderate',
  goal: 'maintenance',
};

const ADULT_FEMALE: NutritionUserProfile = {
  userId: 'test-user-2',
  dateOfBirth: '1985-06-20', // ~39 years old
  sex: 'female',
  weightKg: 62,
  heightCm: 165,
  activityLevel: 'light',
  goal: 'weight_loss',
};

const PREGNANT_FEMALE: NutritionUserProfile = {
  userId: 'test-user-3',
  dateOfBirth: '1992-03-10', // ~32 years old
  sex: 'female',
  weightKg: 65,
  heightCm: 168,
  activityLevel: 'light',
  goal: 'maintenance',
  isPregnant: true,
};

const ELDERLY_MALE: NutritionUserProfile = {
  userId: 'test-user-4',
  dateOfBirth: '1950-08-01', // ~74 years old
  sex: 'male',
  weightKg: 72,
  heightCm: 175,
  activityLevel: 'sedentary',
  goal: 'maintenance',
};

describe('Target Calculator', () => {
  beforeAll(() => {
    preloadAllData();
  });

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const age = calculateAge('1990-01-15');
      expect(age.years).toBeGreaterThanOrEqual(34);
      expect(age.years).toBeLessThanOrEqual(35);
    });
  });

  describe('getLifeStageGroup', () => {
    it('should return correct life stage for adult male', () => {
      const group = getLifeStageGroup(35, 'male');
      expect(group).toBe('adults_31_50');
    });

    it('should return correct life stage for young adult female', () => {
      const group = getLifeStageGroup(25, 'female');
      expect(group).toBe('adults_19_30');
    });

    it('should return pregnancy life stage when pregnant', () => {
      const group = getLifeStageGroup(28, 'female', true);
      expect(group).toBe('pregnancy_19_30');
    });

    it('should return lactation life stage when lactating', () => {
      const group = getLifeStageGroup(32, 'female', false, true);
      expect(group).toBe('lactation_31_50');
    });

    it('should return elderly life stage for 75yo', () => {
      const group = getLifeStageGroup(75, 'male');
      expect(group).toBe('adults_70_plus');
    });
  });

  describe('calculateBMR', () => {
    it('should calculate BMR for adult male', () => {
      // 30yo male, 75kg, 178cm
      // BMR = 10×75 + 6.25×178 - 5×30 + 5 = 750 + 1112.5 - 150 + 5 = 1717.5
      const bmr = calculateBMR(75, 178, 30, 'male');
      expect(bmr).toBeCloseTo(1717.5, 0);
    });

    it('should calculate BMR for adult female', () => {
      // 30yo female, 60kg, 165cm
      // BMR = 10×60 + 6.25×165 - 5×30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
      const bmr = calculateBMR(60, 165, 30, 'female');
      expect(bmr).toBeCloseTo(1320.25, 0);
    });
  });

  describe('calculateTDEE', () => {
    it('should apply activity multiplier correctly', () => {
      const bmr = 1700;
      const tdee = calculateTDEE(bmr, 'moderate');
      // TDEE = 1700 × 1.55 = 2635
      expect(tdee).toBeCloseTo(2635, 0);
    });

    it('should handle sedentary correctly', () => {
      const bmr = 1500;
      const tdee = calculateTDEE(bmr, 'sedentary');
      // TDEE = 1500 × 1.2 = 1800
      expect(tdee).toBe(1800);
    });
  });

  describe('calculateEnergy', () => {
    it('should calculate full energy for adult male', () => {
      const energy = calculateEnergy(
        '1990-01-15',
        'male',
        75,
        178,
        'moderate',
        'maintenance'
      );
      expect(energy.method).toBe('mifflin_st_jeor');
      expect(energy.bmr).toBeGreaterThan(1600);
      expect(energy.bmr).toBeLessThan(1800);
      expect(energy.tdee).toBeGreaterThan(2400);
      expect(energy.targetCalories).toBe(energy.tdee); // maintenance = no adjustment
    });

    it('should subtract 500 kcal for weight loss goal', () => {
      const energy = calculateEnergy(
        '1990-01-15',
        'female',
        62,
        165,
        'light',
        'weight_loss'
      );
      expect(energy.goalAdjustment).toBe(-500);
      expect(energy.targetCalories).toBe(energy.tdee - 500);
    });

    it('should add calories for pregnancy', () => {
      const normalEnergy = calculateEnergy(
        '1990-01-15',
        'female',
        65,
        168,
        'light',
        'maintenance',
        false
      );
      const pregnantEnergy = calculateEnergy(
        '1990-01-15',
        'female',
        65,
        168,
        'light',
        'maintenance',
        true
      );
      expect(pregnantEnergy.tdee).toBe(normalEnergy.tdee + 340);
    });

    it('should use default method when weight/height missing', () => {
      const energy = calculateEnergy(
        '1990-01-15',
        'male',
        undefined,
        undefined,
        'moderate',
        'maintenance'
      );
      expect(energy.method).toBe('default');
      expect(energy.tdee).toBe(2500); // default for males
    });
  });

  describe('computeCalorieTarget', () => {
    it('should compute calorie target for adult male', () => {
      const calories = computeCalorieTarget(ADULT_MALE);
      expect(calories).toBeGreaterThan(2200);
      expect(calories).toBeLessThan(2800);
    });

    it('should compute lower calories for weight loss female', () => {
      const calories = computeCalorieTarget(ADULT_FEMALE);
      expect(calories).toBeGreaterThan(1200);
      expect(calories).toBeLessThan(1800);
    });
  });

  describe('computeSingleTarget', () => {
    it('should compute vitamin C target for adult male', () => {
      const target = computeSingleTarget(ADULT_MALE, 'vitamin_c');
      expect(target).not.toBeNull();
      expect(target?.nutrientId).toBe('vitamin_c');
      expect(target?.target).toBe(90); // RDA for adult males
      expect(target?.unit).toBe('mg');
    });

    it('should compute calcium target for adult female', () => {
      const target = computeSingleTarget(ADULT_FEMALE, 'calcium');
      expect(target).not.toBeNull();
      expect(target?.target).toBe(1000); // RDA for 31-50 females
    });

    it('should compute higher folate for pregnant female', () => {
      const target = computeSingleTarget(PREGNANT_FEMALE, 'folate');
      expect(target).not.toBeNull();
      expect(target?.target).toBe(600); // RDA during pregnancy
    });

    it('should compute sodium with CDRR limit', () => {
      const target = computeSingleTarget(ADULT_MALE, 'sodium');
      expect(target).not.toBeNull();
      expect(target?.cdrrLimit).toBe(2300);
      expect(target?.upperLimit).toBe(2300);
    });

    it('should compute protein with AMDR range', () => {
      const target = computeSingleTarget(ADULT_MALE, 'protein');
      expect(target).not.toBeNull();
      expect(target?.amdrMin).toBeGreaterThan(0);
      expect(target?.amdrMax).toBeGreaterThan(target?.amdrMin ?? 0);
      expect(target?.amdrMinPercent).toBe(10);
      expect(target?.amdrMaxPercent).toBe(35);
    });
  });

  describe('computeUserTargets', () => {
    it('should compute all targets for adult male', () => {
      const targets = computeUserTargets(ADULT_MALE);

      expect(targets.calories).toBeGreaterThan(2000);
      expect(targets.profile.sex).toBe('male');
      expect(targets.profile.lifeStageGroup).toBe('adults_31_50');

      // Check key nutrients are present
      expect(targets.nutrients.protein).toBeDefined();
      expect(targets.nutrients.carbohydrate).toBeDefined();
      expect(targets.nutrients.total_fat).toBeDefined();
      expect(targets.nutrients.fiber).toBeDefined();
      expect(targets.nutrients.sodium).toBeDefined();
      expect(targets.nutrients.vitamin_c).toBeDefined();
      expect(targets.nutrients.calcium).toBeDefined();
    });

    it('should include computedAt timestamp', () => {
      const targets = computeUserTargets(ADULT_MALE);
      expect(targets.computedAt).toBeDefined();
      expect(new Date(targets.computedAt).getTime()).not.toBeNaN();
    });

    it('should compute many nutrients', () => {
      const targets = computeUserTargets(ADULT_MALE);
      const nutrientCount = Object.keys(targets.nutrients).length;
      expect(nutrientCount).toBeGreaterThan(25);
    });

    it('should set calories target in nutrients', () => {
      const targets = computeUserTargets(ADULT_MALE);
      expect(targets.nutrients.calories).toBeDefined();
      expect(targets.nutrients.calories.target).toBe(targets.calories);
    });
  });
});
