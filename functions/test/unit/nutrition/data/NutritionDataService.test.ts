import { describe, it, expect, beforeAll } from 'vitest';
import { nutritionData, preloadAllData } from '../../../../src/domains/nutrition/data';

describe('NutritionDataService', () => {
  beforeAll(() => {
    preloadAllData();
  });

  describe('getNutrient', () => {
    it('should return vitamin C definition', () => {
      const vitC = nutritionData.getNutrient('vitamin_c');
      expect(vitC).not.toBeNull();
      expect(vitC?.displayName).toBe('Vitamin C');
      expect(vitC?.unit).toBe('mg');
      expect(vitC?.classification).toBe('beneficial');
    });

    it('should return sodium definition with risk classification', () => {
      const sodium = nutritionData.getNutrient('sodium');
      expect(sodium).not.toBeNull();
      // JSON uses 'risk' for nutrients to limit (sodium, saturated fat, etc.)
      expect(['limit', 'risk']).toContain(sodium?.classification);
    });

    it('should return null for unknown nutrient', () => {
      const unknown = nutritionData.getNutrient('fake_nutrient_xyz');
      expect(unknown).toBeNull();
    });
  });

  describe('getAllNutrients', () => {
    it('should return many nutrients', () => {
      const all = nutritionData.getAllNutrients();
      expect(all.length).toBeGreaterThan(30);
    });
  });

  describe('getNutrientsByClassification', () => {
    it('should return beneficial nutrients', () => {
      const beneficial = nutritionData.getNutrientsByClassification('beneficial');
      expect(beneficial.length).toBeGreaterThan(0);
      expect(beneficial.every((n) => n.classification === 'beneficial')).toBe(true);
    });

    it('should return risk nutrients (sodium, saturated fat, etc)', () => {
      // JSON uses 'risk' classification for nutrients to limit
      const risk = nutritionData.getNutrientsByClassification('risk' as 'limit');
      expect(risk.length).toBeGreaterThan(0);
      const ids = risk.map((n) => n.nutrientId);
      expect(ids).toContain('sodium');
    });
  });

  describe('getDri', () => {
    it('should return vitamin C RDA for 30yo male', () => {
      const dri = nutritionData.getDri('vitamin_c', 30, 'male', 'standard');
      expect(dri).not.toBeNull();
      expect(dri?.driType).toBe('RDA');
      expect(dri?.value).toBe(90); // 90mg RDA for adult males
      expect(dri?.unit).toBe('mg');
    });

    it('should return vitamin C RDA for 30yo female', () => {
      const dri = nutritionData.getDri('vitamin_c', 30, 'female', 'standard');
      expect(dri).not.toBeNull();
      expect(dri?.value).toBe(75); // 75mg RDA for adult females
    });

    it('should return calcium RDA for adults', () => {
      const dri = nutritionData.getDri('calcium', 35, 'male', 'standard');
      expect(dri).not.toBeNull();
      expect(dri?.value).toBe(1000); // 1000mg for 19-50
    });

    it('should return higher calcium for 55yo', () => {
      const dri = nutritionData.getDri('calcium', 55, 'female', 'standard');
      expect(dri).not.toBeNull();
      expect(dri?.value).toBe(1200); // 1200mg for 51+
    });

    it('should return pregnancy values when life stage is pregnancy', () => {
      const dri = nutritionData.getDri('folate', 28, 'female', 'pregnancy');
      expect(dri).not.toBeNull();
      expect(dri?.value).toBe(600); // 600mcg DFE during pregnancy
    });
  });

  describe('getFdaDvForAdults', () => {
    it('should return FDA DV for vitamin C', () => {
      const dv = nutritionData.getFdaDvForAdults('vitamin_c');
      expect(dv).toBe(90);
    });

    it('should return FDA DV for sodium', () => {
      const dv = nutritionData.getFdaDvForAdults('sodium');
      expect(dv).toBe(2300);
    });

    it('should return FDA DV for fiber', () => {
      const dv = nutritionData.getFdaDvForAdults('fiber');
      expect(dv).toBe(28);
    });
  });

  describe('getConditionOverrides', () => {
    it('should return hypertension overrides', () => {
      const overrides = nutritionData.getConditionOverrides('hypertension');
      expect(overrides).not.toBeNull();
      expect(overrides?.condition).toBe('Hypertension');
    });

    it('should return CKD overrides', () => {
      const overrides = nutritionData.getConditionOverrides('ckd_stage_3_4');
      expect(overrides).not.toBeNull();
      expect(overrides?.modifications.length).toBeGreaterThan(0);
    });
  });
});
