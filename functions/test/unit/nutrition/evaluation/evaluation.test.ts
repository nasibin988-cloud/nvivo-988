import { describe, it, expect, beforeAll } from 'vitest';
import { preloadAllData } from '../../../../src/domains/nutrition/data';
import {
  classifyBeneficialIntake,
  classifyLimitIntake,
  classifyNutrientIntake,
  getStatusLabel,
  getStatusColor,
} from '../../../../src/domains/nutrition/evaluation/classifier';
import {
  evaluateNutrient,
  evaluateNutrients,
  findNutrientGaps,
  findHighlights,
} from '../../../../src/domains/nutrition/evaluation/nutrientEvaluator';
import {
  calculateScore,
  getScoreLabel,
  getScoreColor,
  calculateWeeklyScore,
} from '../../../../src/domains/nutrition/evaluation/scoreCalculator';
import {
  evaluateDay,
  quickScore,
} from '../../../../src/domains/nutrition/evaluation/dayEvaluator';
import type { NutritionUserProfile, DailyIntake, NutrientTarget } from '../../../../src/types/nutrition';

// Test fixtures
const TEST_PROFILE: NutritionUserProfile = {
  userId: 'test-user',
  dateOfBirth: '1990-01-15',
  sex: 'male',
  weightKg: 75,
  heightCm: 178,
  activityLevel: 'moderate',
  goal: 'maintenance',
};

const GOOD_DAY_INTAKE: DailyIntake = {
  date: '2024-12-11',
  foods: [],
  totals: {
    calories: 2500,
    protein: 100,
    carbohydrate: 300,
    total_fat: 80,
    fiber: 30,
    sodium: 1800,
    saturated_fat: 15,
    added_sugars: 30,
    vitamin_c: 95,
    vitamin_d: 18,
    calcium: 1100,
    iron: 16,
    potassium: 4000,
    magnesium: 400,
    zinc: 12,
    vitamin_a: 850,
  },
};

const POOR_DAY_INTAKE: DailyIntake = {
  date: '2024-12-11',
  foods: [],
  totals: {
    calories: 1800,
    protein: 30,
    carbohydrate: 250,
    total_fat: 90,
    fiber: 8,
    sodium: 4500,
    saturated_fat: 35,
    added_sugars: 80,
    vitamin_c: 20,
    calcium: 300,
  },
};

describe('Evaluation Engine', () => {
  beforeAll(() => {
    preloadAllData();
  });

  describe('Classifier', () => {
    describe('classifyBeneficialIntake', () => {
      it('should return excellent for >=100% of target', () => {
        expect(classifyBeneficialIntake(100, null)).toBe('excellent');
        expect(classifyBeneficialIntake(150, null)).toBe('excellent');
      });

      it('should return good for 67-99% of target', () => {
        expect(classifyBeneficialIntake(67, null)).toBe('good');
        expect(classifyBeneficialIntake(80, null)).toBe('good');
        expect(classifyBeneficialIntake(99, null)).toBe('good');
      });

      it('should return below_target for 33-66% of target', () => {
        expect(classifyBeneficialIntake(33, null)).toBe('below_target');
        expect(classifyBeneficialIntake(50, null)).toBe('below_target');
        expect(classifyBeneficialIntake(66, null)).toBe('below_target');
      });

      it('should return low for <33% of target', () => {
        expect(classifyBeneficialIntake(0, null)).toBe('low');
        expect(classifyBeneficialIntake(20, null)).toBe('low');
        expect(classifyBeneficialIntake(32, null)).toBe('low');
      });
    });

    describe('classifyLimitIntake', () => {
      it('should return well_within for <50% of limit', () => {
        expect(classifyLimitIntake(0)).toBe('well_within');
        expect(classifyLimitIntake(30)).toBe('well_within');
        expect(classifyLimitIntake(49)).toBe('well_within');
      });

      it('should return moderate for 50-79% of limit', () => {
        expect(classifyLimitIntake(50)).toBe('moderate');
        expect(classifyLimitIntake(65)).toBe('moderate');
        expect(classifyLimitIntake(79)).toBe('moderate');
      });

      it('should return approaching_limit for 80-99% of limit', () => {
        expect(classifyLimitIntake(80)).toBe('approaching_limit');
        expect(classifyLimitIntake(90)).toBe('approaching_limit');
        expect(classifyLimitIntake(99)).toBe('approaching_limit');
      });

      it('should return exceeds_limit for >=100% of limit', () => {
        expect(classifyLimitIntake(100)).toBe('exceeds_limit');
        expect(classifyLimitIntake(150)).toBe('exceeds_limit');
      });
    });

    describe('classifyNutrientIntake', () => {
      it('should route beneficial nutrients correctly', () => {
        expect(classifyNutrientIntake('beneficial', 100, null)).toBe('excellent');
        expect(classifyNutrientIntake('beneficial', 50, null)).toBe('below_target');
      });

      it('should route limit nutrients correctly', () => {
        expect(classifyNutrientIntake('limit', null, 40)).toBe('well_within');
        expect(classifyNutrientIntake('limit', null, 120)).toBe('exceeds_limit');
      });

      it('should handle risk classification as limit', () => {
        expect(classifyNutrientIntake('risk', null, 40)).toBe('well_within');
      });

      it('should return unknown when no data', () => {
        expect(classifyNutrientIntake('beneficial', null, null)).toBe('unknown');
      });
    });

    describe('getStatusLabel', () => {
      it('should return descriptive labels', () => {
        expect(getStatusLabel('excellent')).toContain('Excellent');
        expect(getStatusLabel('low')).toContain('Low');
        expect(getStatusLabel('exceeds_limit')).toContain('Exceeds');
      });
    });

    describe('getStatusColor', () => {
      it('should return appropriate colors', () => {
        expect(getStatusColor('excellent')).toBe('green');
        expect(getStatusColor('good')).toBe('green');
        expect(getStatusColor('below_target')).toBe('yellow');
        expect(getStatusColor('low')).toBe('orange');
        expect(getStatusColor('exceeds_limit')).toBe('red');
      });
    });
  });

  describe('Nutrient Evaluator', () => {
    const mockTarget: NutrientTarget = {
      nutrientId: 'vitamin_c',
      displayName: 'Vitamin C',
      unit: 'mg',
      target: 90,
      upperLimit: 2000,
      source: 'RDA male 35',
    };

    describe('evaluateNutrient', () => {
      it('should evaluate a nutrient meeting target', () => {
        const result = evaluateNutrient('vitamin_c', 90, mockTarget);
        expect(result.percentOfTarget).toBe(100);
        expect(result.status).toBe('excellent');
        expect(result.statusColor).toBe('green');
      });

      it('should evaluate a nutrient below target', () => {
        const result = evaluateNutrient('vitamin_c', 45, mockTarget);
        expect(result.percentOfTarget).toBe(50);
        expect(result.status).toBe('below_target');
      });

      it('should calculate percentOfLimit correctly', () => {
        const result = evaluateNutrient('vitamin_c', 1000, mockTarget);
        expect(result.percentOfLimit).toBe(50); // 1000/2000 = 50%
      });
    });

    describe('evaluateNutrients', () => {
      it('should evaluate multiple nutrients', () => {
        const targets: Record<string, NutrientTarget> = {
          vitamin_c: mockTarget,
          calcium: {
            nutrientId: 'calcium',
            displayName: 'Calcium',
            unit: 'mg',
            target: 1000,
            source: 'RDA',
          },
        };
        const intakes = { vitamin_c: 90, calcium: 800 };

        const results = evaluateNutrients(intakes, targets);
        expect(results.length).toBe(2);
        expect(results.find((r) => r.nutrientId === 'vitamin_c')?.percentOfTarget).toBe(100);
        expect(results.find((r) => r.nutrientId === 'calcium')?.percentOfTarget).toBe(80);
      });
    });

    describe('findNutrientGaps', () => {
      it('should find nutrients below threshold', () => {
        const evals = [
          { ...evaluateNutrient('vitamin_c', 90, mockTarget), classification: 'beneficial' as const },
          { ...evaluateNutrient('vitamin_c', 30, mockTarget), nutrientId: 'calcium', classification: 'beneficial' as const },
        ];
        const gaps = findNutrientGaps(evals);
        expect(gaps.length).toBe(1);
        expect(gaps[0].nutrientId).toBe('calcium');
      });
    });
  });

  describe('Score Calculator', () => {
    describe('calculateScore', () => {
      it('should return score between 0 and 100', () => {
        const evaluation = evaluateDay(TEST_PROFILE, GOOD_DAY_INTAKE);
        expect(evaluation.score).toBeGreaterThanOrEqual(0);
        expect(evaluation.score).toBeLessThanOrEqual(100);
      });

      it('should give higher score for good day', () => {
        const goodEval = evaluateDay(TEST_PROFILE, GOOD_DAY_INTAKE);
        const poorEval = evaluateDay(TEST_PROFILE, POOR_DAY_INTAKE);
        expect(goodEval.score).toBeGreaterThan(poorEval.score);
      });
    });

    describe('getScoreLabel', () => {
      it('should return Excellent for 90+', () => {
        expect(getScoreLabel(90)).toBe('Excellent');
        expect(getScoreLabel(100)).toBe('Excellent');
      });

      it('should return Great for 75-89', () => {
        expect(getScoreLabel(75)).toBe('Great');
        expect(getScoreLabel(89)).toBe('Great');
      });

      it('should return Good for 60-74', () => {
        expect(getScoreLabel(60)).toBe('Good');
        expect(getScoreLabel(74)).toBe('Good');
      });

      it('should return Fair for 40-59', () => {
        expect(getScoreLabel(40)).toBe('Fair');
        expect(getScoreLabel(59)).toBe('Fair');
      });

      it('should return Needs Improvement for <40', () => {
        expect(getScoreLabel(39)).toBe('Needs Improvement');
        expect(getScoreLabel(0)).toBe('Needs Improvement');
      });
    });

    describe('getScoreColor', () => {
      it('should return appropriate colors', () => {
        expect(getScoreColor(90)).toBe('green');
        expect(getScoreColor(65)).toBe('yellow');
        expect(getScoreColor(45)).toBe('orange');
        expect(getScoreColor(30)).toBe('red');
      });
    });

    describe('calculateWeeklyScore', () => {
      it('should calculate average of daily scores', () => {
        expect(calculateWeeklyScore([80, 70, 90])).toBe(80);
        expect(calculateWeeklyScore([100, 50])).toBe(75);
      });

      it('should return 0 for empty array', () => {
        expect(calculateWeeklyScore([])).toBe(0);
      });
    });
  });

  describe('Day Evaluator', () => {
    describe('evaluateDay', () => {
      it('should return complete evaluation', () => {
        const result = evaluateDay(TEST_PROFILE, GOOD_DAY_INTAKE);

        expect(result.date).toBe('2024-12-11');
        expect(result.score).toBeGreaterThan(0);
        expect(result.scoreLabel).toBeDefined();
        expect(result.scoreColor).toBeDefined();
        expect(result.breakdown).toBeDefined();
        expect(result.breakdown.beneficial).toBeGreaterThanOrEqual(0);
        expect(result.breakdown.limit).toBeGreaterThanOrEqual(0);
        expect(result.breakdown.balance).toBeGreaterThanOrEqual(0);
        expect(result.nutrients.length).toBeGreaterThan(0);
        expect(result.summary).toBeDefined();
      });

      it('should generate highlights for good intake', () => {
        const result = evaluateDay(TEST_PROFILE, GOOD_DAY_INTAKE);
        expect(result.highlights.length).toBeGreaterThan(0);
      });

      it('should generate gaps for poor intake', () => {
        const result = evaluateDay(TEST_PROFILE, POOR_DAY_INTAKE);
        expect(result.gaps.length).toBeGreaterThan(0);
      });

      it('should include nutrient evaluations', () => {
        const result = evaluateDay(TEST_PROFILE, GOOD_DAY_INTAKE);
        const proteinEval = result.nutrients.find((n) => n.nutrientId === 'protein');
        expect(proteinEval).toBeDefined();
        expect(proteinEval?.intake).toBe(100);
      });
    });

    describe('quickScore', () => {
      it('should return score without full details', () => {
        const result = quickScore(TEST_PROFILE, GOOD_DAY_INTAKE);
        expect(result.score).toBeGreaterThan(0);
        expect(result.scoreLabel).toBeDefined();
        expect(result.scoreColor).toBeDefined();
      });
    });
  });
});
