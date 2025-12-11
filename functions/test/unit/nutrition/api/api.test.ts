import { describe, it, expect, beforeAll } from 'vitest';
import { preloadAllData } from '../../../../src/domains/nutrition/data';
import {
  handleEvaluateDay,
  handleGetTargets,
  handleGetNutrientInfo,
  handleEvaluateWeek,
  type EvaluateDayRequest,
  type GetTargetsRequest,
  type GetNutrientInfoRequest,
  type EvaluateWeekRequest,
} from '../../../../src/domains/nutrition/api';
import type { NutritionUserProfile, DailyIntake } from '../../../../src/types/nutrition';

// Test user profile - 35 year old male, moderate activity, maintenance
const TEST_PROFILE: NutritionUserProfile = {
  userId: 'test-user-123',
  dateOfBirth: '1989-06-15',
  sex: 'male',
  weightKg: 80,
  heightCm: 178,
  activityLevel: 'moderate',
  goal: 'maintenance',
};

// Test daily intake - balanced day
const TEST_INTAKE: DailyIntake = {
  date: '2024-12-11',
  foods: [],
  totals: {
    calories: 2200,
    protein: 120,
    carbohydrate: 280,
    total_fat: 70,
    fiber: 25,
    sodium: 1800,
    potassium: 3200,
    calcium: 900,
    iron: 14,
    vitamin_c: 95,
    vitamin_d: 15,
    vitamin_a: 800,
    vitamin_b12: 2.5,
    folate: 350,
    magnesium: 380,
    zinc: 10,
    saturated_fat: 15,
    sugar: 45,
  },
};

// Poor day intake for comparison
const POOR_INTAKE: DailyIntake = {
  date: '2024-12-10',
  foods: [],
  totals: {
    calories: 1500,
    protein: 30,
    carbohydrate: 250,
    total_fat: 50,
    fiber: 8,
    sodium: 4000,
    vitamin_c: 15,
    saturated_fat: 35,
    sugar: 120,
  },
};

describe('Nutrition API', () => {
  beforeAll(() => {
    preloadAllData();
  });

  describe('handleEvaluateDay', () => {
    it('should evaluate a balanced day', async () => {
      const request: EvaluateDayRequest = {
        profile: TEST_PROFILE,
        intake: TEST_INTAKE,
      };

      const response = await handleEvaluateDay(request);

      expect(response.success).toBe(true);
      expect(response.evaluation).toBeDefined();
      expect(response.evaluation.date).toBe('2024-12-11');
      expect(response.evaluation.score).toBeGreaterThan(50);
      expect(response.evaluation.scoreLabel).toBeDefined();
      expect(response.evaluation.scoreColor).toBeDefined();
      expect(response.evaluation.nutrients.length).toBeGreaterThan(0);
    });

    it('should evaluate a poor day with lower score', async () => {
      const request: EvaluateDayRequest = {
        profile: TEST_PROFILE,
        intake: POOR_INTAKE,
      };

      const response = await handleEvaluateDay(request);

      expect(response.success).toBe(true);
      expect(response.evaluation.score).toBeLessThan(60);
      expect(response.evaluation.gaps.length).toBeGreaterThan(0);
    });

    it('should return highlights for good nutrients', async () => {
      const request: EvaluateDayRequest = {
        profile: TEST_PROFILE,
        intake: TEST_INTAKE,
      };

      const response = await handleEvaluateDay(request);

      expect(response.evaluation.highlights.length).toBeGreaterThan(0);
    });

    it('should throw on missing profile', async () => {
      const request = {
        profile: null,
        intake: TEST_INTAKE,
      } as unknown as EvaluateDayRequest;

      await expect(handleEvaluateDay(request)).rejects.toThrow('Profile is required');
    });

    it('should throw on missing intake', async () => {
      const request = {
        profile: TEST_PROFILE,
        intake: null,
      } as unknown as EvaluateDayRequest;

      await expect(handleEvaluateDay(request)).rejects.toThrow('Intake data is required');
    });

    it('should throw on invalid sex', async () => {
      const request: EvaluateDayRequest = {
        profile: { ...TEST_PROFILE, sex: 'other' as 'male' },
        intake: TEST_INTAKE,
      };

      await expect(handleEvaluateDay(request)).rejects.toThrow('sex must be "male" or "female"');
    });
  });

  describe('handleGetTargets', () => {
    it('should return personalized targets', async () => {
      const request: GetTargetsRequest = {
        profile: TEST_PROFILE,
      };

      const response = await handleGetTargets(request);

      expect(response.success).toBe(true);
      expect(response.targets).toBeDefined();
      expect(response.targets.calories).toBeGreaterThan(1500);
      expect(response.targets.nutrients).toBeDefined();
      expect(response.targets.profile.sex).toBe('male');
    });

    it('should include protein target', async () => {
      const request: GetTargetsRequest = {
        profile: TEST_PROFILE,
      };

      const response = await handleGetTargets(request);

      const protein = response.targets.nutrients['protein'];
      expect(protein).toBeDefined();
      expect(protein.target).toBeGreaterThan(0);
      expect(protein.unit).toBe('g');
    });

    it('should include vitamin targets', async () => {
      const request: GetTargetsRequest = {
        profile: TEST_PROFILE,
      };

      const response = await handleGetTargets(request);

      expect(response.targets.nutrients['vitamin_c']).toBeDefined();
      expect(response.targets.nutrients['vitamin_d']).toBeDefined();
    });

    it('should adjust for female profile', async () => {
      const femaleProfile = { ...TEST_PROFILE, sex: 'female' as const };

      const maleResponse = await handleGetTargets({ profile: TEST_PROFILE });
      const femaleResponse = await handleGetTargets({ profile: femaleProfile });

      // Female iron needs are typically higher
      expect(femaleResponse.targets.nutrients['iron']?.target).toBeGreaterThan(
        maleResponse.targets.nutrients['iron']?.target ?? 0
      );
    });

    it('should throw on missing profile', async () => {
      const request = { profile: null } as unknown as GetTargetsRequest;

      await expect(handleGetTargets(request)).rejects.toThrow('Profile is required');
    });
  });

  describe('handleGetNutrientInfo', () => {
    it('should return info for vitamin C', async () => {
      const request: GetNutrientInfoRequest = {
        nutrientId: 'vitamin_c',
      };

      const response = await handleGetNutrientInfo(request);

      expect(response.success).toBe(true);
      expect(response.nutrientId).toBe('vitamin_c');
      expect(response.education).not.toBeNull();
      expect(response.education?.displayName).toBe('Vitamin C');
      expect(response.whyItMatters.length).toBeGreaterThan(10);
      expect(response.foodSuggestions.length).toBeGreaterThan(0);
    });

    it('should return info for protein', async () => {
      const request: GetNutrientInfoRequest = {
        nutrientId: 'protein',
      };

      const response = await handleGetNutrientInfo(request);

      expect(response.success).toBe(true);
      expect(response.education?.displayName).toBe('Protein');
      // Should have food suggestions like chicken, fish, etc.
      expect(response.foodSuggestions.length).toBeGreaterThan(0);
    });

    it('should return null education for unknown nutrient', async () => {
      const request: GetNutrientInfoRequest = {
        nutrientId: 'fake_nutrient_xyz',
      };

      const response = await handleGetNutrientInfo(request);

      expect(response.success).toBe(true);
      expect(response.education).toBeNull();
    });

    it('should throw on missing nutrientId', async () => {
      const request = { nutrientId: '' } as GetNutrientInfoRequest;

      await expect(handleGetNutrientInfo(request)).rejects.toThrow('Nutrient ID is required');
    });
  });

  describe('handleEvaluateWeek', () => {
    const weekIntakes: DailyIntake[] = [
      {
        date: '2024-12-05',
        foods: [],
        totals: { ...TEST_INTAKE.totals, protein: 80 },
      },
      {
        date: '2024-12-06',
        foods: [],
        totals: { ...TEST_INTAKE.totals, protein: 100 },
      },
      {
        date: '2024-12-07',
        foods: [],
        totals: { ...TEST_INTAKE.totals, protein: 120 },
      },
      {
        date: '2024-12-08',
        foods: [],
        totals: { ...TEST_INTAKE.totals, protein: 130 },
      },
    ];

    it('should evaluate multiple days', async () => {
      const request: EvaluateWeekRequest = {
        profile: TEST_PROFILE,
        intakes: weekIntakes,
      };

      const response = await handleEvaluateWeek(request);

      expect(response.success).toBe(true);
      expect(response.days.length).toBe(4);
      expect(response.averageScore).toBeGreaterThan(0);
      expect(response.bestDay).not.toBeNull();
    });

    it('should sort days by date', async () => {
      const unorderedIntakes = [weekIntakes[2], weekIntakes[0], weekIntakes[1]];
      const request: EvaluateWeekRequest = {
        profile: TEST_PROFILE,
        intakes: unorderedIntakes,
      };

      const response = await handleEvaluateWeek(request);

      // Should be sorted chronologically
      expect(response.days[0].date).toBe('2024-12-05');
      expect(response.days[1].date).toBe('2024-12-06');
      expect(response.days[2].date).toBe('2024-12-07');
    });

    it('should find best day correctly', async () => {
      const request: EvaluateWeekRequest = {
        profile: TEST_PROFILE,
        intakes: weekIntakes,
      };

      const response = await handleEvaluateWeek(request);

      const scores = response.days.map(d => d.score);
      const maxScore = Math.max(...scores);

      expect(response.bestDay?.score).toBe(maxScore);
    });

    it('should handle empty intakes', async () => {
      const request: EvaluateWeekRequest = {
        profile: TEST_PROFILE,
        intakes: [],
      };

      const response = await handleEvaluateWeek(request);

      expect(response.success).toBe(true);
      expect(response.days.length).toBe(0);
      expect(response.averageScore).toBe(0);
      expect(response.bestDay).toBeNull();
      expect(response.trend).toBe('stable');
    });

    it('should detect improving trend', async () => {
      // Create intakes with improving scores
      const improvingIntakes: DailyIntake[] = [
        { date: '2024-12-01', foods: [], totals: { ...POOR_INTAKE.totals } },
        { date: '2024-12-02', foods: [], totals: { ...POOR_INTAKE.totals } },
        { date: '2024-12-03', foods: [], totals: { ...TEST_INTAKE.totals } },
        { date: '2024-12-04', foods: [], totals: { ...TEST_INTAKE.totals } },
      ];

      const request: EvaluateWeekRequest = {
        profile: TEST_PROFILE,
        intakes: improvingIntakes,
      };

      const response = await handleEvaluateWeek(request);

      expect(response.trend).toBe('improving');
    });

    it('should reject more than 14 days', async () => {
      const tooManyIntakes = Array.from({ length: 15 }, (_, i) => ({
        date: `2024-12-${String(i + 1).padStart(2, '0')}`,
        foods: [],
        totals: TEST_INTAKE.totals,
      }));

      const request: EvaluateWeekRequest = {
        profile: TEST_PROFILE,
        intakes: tooManyIntakes,
      };

      await expect(handleEvaluateWeek(request)).rejects.toThrow('Maximum 14 days');
    });

    it('should throw on invalid intakes array', async () => {
      const request = {
        profile: TEST_PROFILE,
        intakes: null,
      } as unknown as EvaluateWeekRequest;

      await expect(handleEvaluateWeek(request)).rejects.toThrow('Intakes array is required');
    });
  });
});
