import { describe, it, expect, beforeAll } from 'vitest';
import { preloadAllData } from '../../../../src/domains/nutrition/data';
import {
  getNutrientEducation,
  getWhyItMatters,
  getFoodSuggestions,
} from '../../../../src/domains/nutrition/insights/educationGenerator';
import {
  generateHighlights,
  generateAchievementMessages,
} from '../../../../src/domains/nutrition/insights/highlightGenerator';
import {
  generateGapInfo,
  generateGapMessage,
  prioritizeGaps,
} from '../../../../src/domains/nutrition/insights/gapGenerator';
import {
  generateDailySummary,
  generateNarrativeSummary,
  generateWeeklySummary,
} from '../../../../src/domains/nutrition/insights/summaryGenerator';
import type { NutrientEvaluation, DayEvaluation, NutrientGap } from '../../../../src/types/nutrition';

// Test fixtures
const GOOD_EVALUATIONS: NutrientEvaluation[] = [
  {
    nutrientId: 'protein',
    displayName: 'Protein',
    intake: 100,
    target: 56,
    upperLimit: null,
    unit: 'g',
    percentOfTarget: 179,
    percentOfLimit: null,
    classification: 'beneficial',
    status: 'excellent',
    statusLabel: 'Excellent',
    statusColor: 'green',
  },
  {
    nutrientId: 'vitamin_c',
    displayName: 'Vitamin C',
    intake: 95,
    target: 90,
    upperLimit: 2000,
    unit: 'mg',
    percentOfTarget: 106,
    percentOfLimit: 5,
    classification: 'beneficial',
    status: 'excellent',
    statusLabel: 'Excellent',
    statusColor: 'green',
  },
  {
    nutrientId: 'fiber',
    displayName: 'Fiber',
    intake: 18,
    target: 28,
    upperLimit: null,
    unit: 'g',
    percentOfTarget: 64,
    percentOfLimit: null,
    classification: 'beneficial',
    status: 'below_target',
    statusLabel: 'Below target',
    statusColor: 'yellow',
  },
  {
    nutrientId: 'sodium',
    displayName: 'Sodium',
    intake: 1800,
    target: null,
    upperLimit: 2300,
    unit: 'mg',
    percentOfTarget: null,
    percentOfLimit: 78,
    classification: 'limit',
    status: 'moderate',
    statusLabel: 'Moderate',
    statusColor: 'yellow',
  },
  {
    nutrientId: 'saturated_fat',
    displayName: 'Saturated Fat',
    intake: 8,
    target: null,
    upperLimit: 20,
    unit: 'g',
    percentOfTarget: null,
    percentOfLimit: 40,
    classification: 'limit',
    status: 'well_within',
    statusLabel: 'Well within',
    statusColor: 'green',
  },
];

const POOR_EVALUATIONS: NutrientEvaluation[] = [
  {
    nutrientId: 'protein',
    displayName: 'Protein',
    intake: 20,
    target: 56,
    upperLimit: null,
    unit: 'g',
    percentOfTarget: 36,
    percentOfLimit: null,
    classification: 'beneficial',
    status: 'below_target',
    statusLabel: 'Below target',
    statusColor: 'yellow',
  },
  {
    nutrientId: 'fiber',
    displayName: 'Fiber',
    intake: 5,
    target: 28,
    upperLimit: null,
    unit: 'g',
    percentOfTarget: 18,
    percentOfLimit: null,
    classification: 'beneficial',
    status: 'low',
    statusLabel: 'Low',
    statusColor: 'orange',
  },
  {
    nutrientId: 'sodium',
    displayName: 'Sodium',
    intake: 4500,
    target: null,
    upperLimit: 2300,
    unit: 'mg',
    percentOfTarget: null,
    percentOfLimit: 196,
    classification: 'limit',
    status: 'exceeds_limit',
    statusLabel: 'Exceeds limit',
    statusColor: 'red',
  },
];

describe('Insight Engine', () => {
  beforeAll(() => {
    preloadAllData();
  });

  describe('Education Generator', () => {
    describe('getNutrientEducation', () => {
      it('should return education for vitamin C', () => {
        const education = getNutrientEducation('vitamin_c');
        expect(education).not.toBeNull();
        expect(education?.displayName).toBe('Vitamin C');
        expect(education?.whatItDoes).toBeDefined();
        expect(education?.foodSources.length).toBeGreaterThan(0);
      });

      it('should return education for protein', () => {
        const education = getNutrientEducation('protein');
        expect(education).not.toBeNull();
        // Food sources may be lowercase from JSON parsing
        const hasProteinSource = education?.foodSources.some(
          (s) => s.toLowerCase().includes('meat') || s.toLowerCase().includes('poultry')
        );
        expect(hasProteinSource).toBe(true);
      });

      it('should return null for unknown nutrient', () => {
        const education = getNutrientEducation('fake_nutrient');
        expect(education).toBeNull();
      });
    });

    describe('getWhyItMatters', () => {
      it('should return a brief description', () => {
        const why = getWhyItMatters('calcium');
        expect(why.length).toBeGreaterThan(10);
        expect(why.length).toBeLessThan(200);
      });
    });

    describe('getFoodSuggestions', () => {
      it('should return food suggestions', () => {
        const foods = getFoodSuggestions('vitamin_c', 3);
        expect(foods.length).toBeLessThanOrEqual(3);
        expect(foods.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Highlight Generator', () => {
    describe('generateHighlights', () => {
      it('should generate highlights for good evaluations', () => {
        const highlights = generateHighlights(GOOD_EVALUATIONS);
        expect(highlights.length).toBeGreaterThan(0);
        expect(highlights[0].message).toBeDefined();
        expect(highlights[0].icon).toBeDefined();
      });

      it('should limit highlights to maxCount', () => {
        const highlights = generateHighlights(GOOD_EVALUATIONS, 2);
        expect(highlights.length).toBeLessThanOrEqual(2);
      });

      it('should prioritize excellent beneficial nutrients', () => {
        const highlights = generateHighlights(GOOD_EVALUATIONS);
        const proteinHighlight = highlights.find((h) => h.nutrientId === 'protein');
        expect(proteinHighlight).toBeDefined();
      });
    });

    describe('generateAchievementMessages', () => {
      it('should generate achievement for high score', () => {
        const achievements = generateAchievementMessages(GOOD_EVALUATIONS, 92);
        expect(achievements.length).toBeGreaterThan(0);
        expect(achievements[0]).toContain('Outstanding');
      });

      it('should return fewer achievements for lower score', () => {
        const highScoreAchievements = generateAchievementMessages(GOOD_EVALUATIONS, 95);
        const lowScoreAchievements = generateAchievementMessages(POOR_EVALUATIONS, 35);
        expect(highScoreAchievements.length).toBeGreaterThanOrEqual(lowScoreAchievements.length);
      });
    });
  });

  describe('Gap Generator', () => {
    describe('generateGapInfo', () => {
      it('should generate gaps for below-target nutrients', () => {
        const gaps = generateGapInfo(GOOD_EVALUATIONS);
        expect(gaps.length).toBeGreaterThan(0);
        // Fiber is below target
        const fiberGap = gaps.find((g) => g.nutrientId === 'fiber');
        expect(fiberGap).toBeDefined();
        expect(fiberGap?.percentOfTarget).toBe(64);
      });

      it('should generate more gaps for poor evaluations', () => {
        const poorGaps = generateGapInfo(POOR_EVALUATIONS);
        const goodGaps = generateGapInfo(GOOD_EVALUATIONS);
        expect(poorGaps.length).toBeGreaterThanOrEqual(goodGaps.length);
      });

      it('should include suggestions', () => {
        const gaps = generateGapInfo(POOR_EVALUATIONS);
        expect(gaps[0]?.suggestion).toBeDefined();
        expect(gaps[0]?.suggestion.length).toBeGreaterThan(10);
      });
    });

    describe('generateGapMessage', () => {
      it('should generate appropriate message for low intake', () => {
        const gap: NutrientGap = {
          nutrientId: 'fiber',
          displayName: 'Fiber',
          intake: 5,
          target: 28,
          percentOfTarget: 18,
          unit: 'g',
          suggestion: '',
        };
        const message = generateGapMessage(gap);
        expect(message).toContain('low');
        expect(message).toContain('18%');
      });
    });

    describe('prioritizeGaps', () => {
      it('should prioritize protein over less critical nutrients', () => {
        const gaps: NutrientGap[] = [
          { nutrientId: 'manganese', displayName: 'Manganese', intake: 1, target: 2, percentOfTarget: 50, unit: 'mg', suggestion: '' },
          { nutrientId: 'protein', displayName: 'Protein', intake: 20, target: 56, percentOfTarget: 36, unit: 'g', suggestion: '' },
        ];
        const prioritized = prioritizeGaps(gaps);
        expect(prioritized[0].nutrientId).toBe('protein');
      });
    });
  });

  describe('Summary Generator', () => {
    describe('generateDailySummary', () => {
      it('should generate a complete daily summary', () => {
        const summary = generateDailySummary(GOOD_EVALUATIONS, 2500);
        expect(summary.score).toBeGreaterThanOrEqual(0);
        expect(summary.score).toBeLessThanOrEqual(100);
        expect(summary.calorieTarget).toBe(2500);
        expect(summary.topHighlights).toBeDefined();
        expect(summary.topGaps).toBeDefined();
      });

      it('should extract macro values', () => {
        const evaluationsWithMacros: NutrientEvaluation[] = [
          ...GOOD_EVALUATIONS,
          {
            nutrientId: 'calories',
            displayName: 'Calories',
            intake: 2200,
            target: 2500,
            upperLimit: null,
            unit: 'kcal',
            percentOfTarget: 88,
            percentOfLimit: null,
            classification: 'neutral',
            status: 'adequate',
            statusLabel: 'Adequate',
            statusColor: 'green',
          },
        ];
        const summary = generateDailySummary(evaluationsWithMacros, 2500);
        expect(summary.caloriesConsumed).toBe(2200);
        expect(summary.proteinGrams).toBe(100);
      });
    });

    describe('generateNarrativeSummary', () => {
      it('should generate positive summary for high score', () => {
        const summary = generateNarrativeSummary(
          90,
          { beneficial: 36, limit: 38, balance: 16 },
          ['Protein at 150%'],
          []
        );
        expect(summary).toContain('Outstanding');
      });

      it('should include actionable insight for lower scores', () => {
        const summary = generateNarrativeSummary(
          55,
          { beneficial: 20, limit: 25, balance: 10 },
          [],
          ['Fiber at 30%']
        );
        expect(summary.toLowerCase()).toContain('fiber');
      });
    });

    describe('generateWeeklySummary', () => {
      const mockDayEvaluations: DayEvaluation[] = [
        {
          date: '2024-12-09',
          score: 72,
          scoreLabel: 'Good',
          scoreColor: 'yellow',
          breakdown: { beneficial: 28, limit: 30, balance: 14 },
          nutrients: [],
          highlights: ['Protein at 120%'],
          gaps: ['Fiber at 50%'],
          summary: '',
        },
        {
          date: '2024-12-10',
          score: 85,
          scoreLabel: 'Great',
          scoreColor: 'green',
          breakdown: { beneficial: 34, limit: 35, balance: 16 },
          nutrients: [],
          highlights: ['Protein at 130%', 'Vitamin C at 110%'],
          gaps: [],
          summary: '',
        },
        {
          date: '2024-12-11',
          score: 78,
          scoreLabel: 'Great',
          scoreColor: 'green',
          breakdown: { beneficial: 30, limit: 32, balance: 16 },
          nutrients: [],
          highlights: ['Protein at 115%'],
          gaps: ['Calcium at 60%'],
          summary: '',
        },
      ];

      it('should calculate average score', () => {
        const weekly = generateWeeklySummary(mockDayEvaluations);
        expect(weekly.averageScore).toBe(78); // (72 + 85 + 78) / 3 = 78.33 rounded
        expect(weekly.daysLogged).toBe(3);
      });

      it('should find best day', () => {
        const weekly = generateWeeklySummary(mockDayEvaluations);
        expect(weekly.bestDay?.date).toBe('2024-12-10');
        expect(weekly.bestDay?.score).toBe(85);
      });

      it('should find consistent patterns', () => {
        const weekly = generateWeeklySummary(mockDayEvaluations);
        // "Protein" appears in highlights multiple times
        expect(weekly.consistentHighlights).toContain('Protein at');
      });

      it('should handle empty evaluations', () => {
        const weekly = generateWeeklySummary([]);
        expect(weekly.averageScore).toBe(0);
        expect(weekly.daysLogged).toBe(0);
        expect(weekly.bestDay).toBeNull();
      });
    });
  });
});
