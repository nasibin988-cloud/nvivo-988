/**
 * DRI Reference Data Table
 *
 * Comprehensive Dietary Reference Intakes for all tracked nutrients.
 * Values are from NIH Office of Dietary Supplements and USDA Dietary Guidelines 2020-2025.
 *
 * PLACEHOLDER VALUES:
 * This file contains initial placeholder values based on FDA Daily Values.
 * The user will provide AI researcher data with exact NIH/USDA values.
 *
 * Sources:
 * - NIH ODS: https://ods.od.nih.gov/HealthInformation/nutrientrecommendations.aspx
 * - DRI Tables: https://www.nal.usda.gov/human-nutrition-and-food-safety/dri-calculator
 * - FDA Daily Values: https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels
 *
 * Age Ranges (Adults):
 * - '19-30': Young adults
 * - '31-50': Middle-aged adults
 * - '51-70': Older adults
 * - '70+': Elderly
 */

import type { NutrientDriDefinition } from './types';

/**
 * Complete DRI table with all nutrient definitions.
 * Indexed by nutrientId for O(1) lookups.
 *
 * NOTE: Values are placeholder/estimated pending AI researcher data.
 * The structure is production-ready; only the numbers need verification.
 */
export const DRI_TABLE: Record<string, NutrientDriDefinition> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // MACRONUTRIENTS
  // ═══════════════════════════════════════════════════════════════════════════

  calories: {
    nutrientId: 'calories',
    unit: 'kcal',
    // Calories are calculated dynamically based on Mifflin-St Jeor formula
    // No static RDA/AI - see driLogic.ts estimateCalorieTarget()
    amdr: { minPctKcal: 100, maxPctKcal: 100 }, // Self-referential for macros
  },

  protein: {
    nutrientId: 'protein',
    unit: 'g',
    // RDA: 0.8 g/kg body weight, FDA DV = 50g based on 2000 kcal diet
    // Values below are for reference; actual calculation uses weight
    rda: {
      male: { '19-30': 56, '31-50': 56, '51-70': 56, '70+': 56 },
      female: { '19-30': 46, '31-50': 46, '51-70': 46, '70+': 46 },
    },
    amdr: { minPctKcal: 10, maxPctKcal: 35 },
    specialAdjustments: [
      { condition: 'athlete', adjustment: { type: 'multiplier', value: 1.6, target: 'base' } },
      { condition: 'pregnant', adjustment: { type: 'absolute', value: 25, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'absolute', value: 25, target: 'base' } },
    ],
  },

  carbs: {
    nutrientId: 'carbs',
    unit: 'g',
    rda: {
      male: { '19-30': 130, '31-50': 130, '51-70': 130, '70+': 130 },
      female: { '19-30': 130, '31-50': 130, '51-70': 130, '70+': 130 },
    },
    amdr: { minPctKcal: 45, maxPctKcal: 65 },
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'absolute', value: 45, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'absolute', value: 80, target: 'base' } },
    ],
  },

  fat: {
    nutrientId: 'fat',
    unit: 'g',
    // Total fat has no RDA, only AMDR
    amdr: { minPctKcal: 20, maxPctKcal: 35 },
  },

  fiber: {
    nutrientId: 'fiber',
    unit: 'g',
    ai: {
      male: { '19-30': 38, '31-50': 38, '51-70': 30, '70+': 30 },
      female: { '19-30': 25, '31-50': 25, '51-70': 21, '70+': 21 },
    },
    primaryReference: 'AI',
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 28, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 29, target: 'base' } },
    ],
  },

  sugar: {
    nutrientId: 'sugar',
    unit: 'g',
    // WHO recommends <10% of calories from free sugars
    // For 2000 kcal diet = 50g max
    ul: { both: { '19-30': 50, '31-50': 50, '51-70': 50, '70+': 50 } },
  },

  addedSugar: {
    nutrientId: 'addedSugar',
    unit: 'g',
    // AHA recommends <25g for women, <36g for men
    ul: {
      male: { '19-30': 36, '31-50': 36, '51-70': 36, '70+': 36 },
      female: { '19-30': 25, '31-50': 25, '51-70': 25, '70+': 25 },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FAT SUBTYPES
  // ═══════════════════════════════════════════════════════════════════════════

  saturatedFat: {
    nutrientId: 'saturatedFat',
    unit: 'g',
    // AHA: <10% of calories, ideally <7% for heart disease
    // For 2000 kcal = 22g max (10%), 15.5g (7%)
    ul: { both: { '19-30': 22, '31-50': 22, '51-70': 20, '70+': 20 } },
    specialAdjustments: [
      { condition: 'heartDisease', adjustment: { type: 'replace', value: 15, target: 'upperLimit' } },
    ],
  },

  transFat: {
    nutrientId: 'transFat',
    unit: 'g',
    // WHO recommends <1% of calories
    // FDA: As low as possible, ideally 0
    ul: { both: { '19-30': 2, '31-50': 2, '51-70': 2, '70+': 2 } },
  },

  cholesterol: {
    nutrientId: 'cholesterol',
    unit: 'mg',
    // 2020-2025 Dietary Guidelines: Keep as low as possible
    // Historical guideline was 300mg
    ul: { both: { '19-30': 300, '31-50': 300, '51-70': 300, '70+': 300 } },
    specialAdjustments: [
      { condition: 'heartDisease', adjustment: { type: 'replace', value: 200, target: 'upperLimit' } },
    ],
  },

  monounsaturatedFat: {
    nutrientId: 'monounsaturatedFat',
    unit: 'g',
    // No specific DRI - calculated as part of total fat balance
  },

  polyunsaturatedFat: {
    nutrientId: 'polyunsaturatedFat',
    unit: 'g',
    // No specific DRI - calculated as part of total fat balance
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MINERALS
  // ═══════════════════════════════════════════════════════════════════════════

  sodium: {
    nutrientId: 'sodium',
    unit: 'mg',
    // AI for adequate intake, UL for maximum
    ai: {
      male: { '19-30': 1500, '31-50': 1500, '51-70': 1300, '70+': 1200 },
      female: { '19-30': 1500, '31-50': 1500, '51-70': 1300, '70+': 1200 },
    },
    ul: { both: { '19-30': 2300, '31-50': 2300, '51-70': 2300, '70+': 2300 } },
    primaryReference: 'AI',
    specialAdjustments: [
      { condition: 'hypertension', adjustment: { type: 'replace', value: 1500, target: 'upperLimit' } },
      { condition: 'heartDisease', adjustment: { type: 'replace', value: 1500, target: 'upperLimit' } },
    ],
  },

  potassium: {
    nutrientId: 'potassium',
    unit: 'mg',
    ai: {
      male: { '19-30': 3400, '31-50': 3400, '51-70': 3400, '70+': 3400 },
      female: { '19-30': 2600, '31-50': 2600, '51-70': 2600, '70+': 2600 },
    },
    primaryReference: 'AI',
    specialAdjustments: [
      // CKD requires potassium restriction
      { condition: 'ckd', adjustment: { type: 'replace', value: 2000, target: 'base' } },
      { condition: 'pregnant', adjustment: { type: 'replace', value: 2900, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 2800, target: 'base' } },
    ],
  },

  calcium: {
    nutrientId: 'calcium',
    unit: 'mg',
    rda: {
      male: { '19-30': 1000, '31-50': 1000, '51-70': 1000, '70+': 1200 },
      female: { '19-30': 1000, '31-50': 1000, '51-70': 1200, '70+': 1200 },
    },
    ul: { both: { '19-30': 2500, '31-50': 2500, '51-70': 2000, '70+': 2000 } },
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 1000, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 1000, target: 'base' } },
    ],
  },

  iron: {
    nutrientId: 'iron',
    unit: 'mg',
    rda: {
      male: { '19-30': 8, '31-50': 8, '51-70': 8, '70+': 8 },
      female: { '19-30': 18, '31-50': 18, '51-70': 8, '70+': 8 },
    },
    ul: { both: { '19-30': 45, '31-50': 45, '51-70': 45, '70+': 45 } },
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 27, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 9, target: 'base' } },
    ],
  },

  magnesium: {
    nutrientId: 'magnesium',
    unit: 'mg',
    rda: {
      male: { '19-30': 400, '31-50': 420, '51-70': 420, '70+': 420 },
      female: { '19-30': 310, '31-50': 320, '51-70': 320, '70+': 320 },
    },
    ul: { both: { '19-30': 350, '31-50': 350, '51-70': 350, '70+': 350 } },
    // Note: UL applies to supplemental magnesium only, not dietary
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 350, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 310, target: 'base' } },
    ],
  },

  zinc: {
    nutrientId: 'zinc',
    unit: 'mg',
    rda: {
      male: { '19-30': 11, '31-50': 11, '51-70': 11, '70+': 11 },
      female: { '19-30': 8, '31-50': 8, '51-70': 8, '70+': 8 },
    },
    ul: { both: { '19-30': 40, '31-50': 40, '51-70': 40, '70+': 40 } },
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 11, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 12, target: 'base' } },
    ],
  },

  phosphorus: {
    nutrientId: 'phosphorus',
    unit: 'mg',
    rda: {
      male: { '19-30': 700, '31-50': 700, '51-70': 700, '70+': 700 },
      female: { '19-30': 700, '31-50': 700, '51-70': 700, '70+': 700 },
    },
    ul: { both: { '19-30': 4000, '31-50': 4000, '51-70': 4000, '70+': 3000 } },
    specialAdjustments: [
      { condition: 'ckd', adjustment: { type: 'replace', value: 800, target: 'upperLimit' } },
      { condition: 'pregnant', adjustment: { type: 'replace', value: 700, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 700, target: 'base' } },
    ],
  },

  selenium: {
    nutrientId: 'selenium',
    unit: 'mcg',
    rda: {
      male: { '19-30': 55, '31-50': 55, '51-70': 55, '70+': 55 },
      female: { '19-30': 55, '31-50': 55, '51-70': 55, '70+': 55 },
    },
    ul: { both: { '19-30': 400, '31-50': 400, '51-70': 400, '70+': 400 } },
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 60, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 70, target: 'base' } },
    ],
  },

  copper: {
    nutrientId: 'copper',
    unit: 'mcg',
    rda: {
      male: { '19-30': 900, '31-50': 900, '51-70': 900, '70+': 900 },
      female: { '19-30': 900, '31-50': 900, '51-70': 900, '70+': 900 },
    },
    ul: { both: { '19-30': 10000, '31-50': 10000, '51-70': 10000, '70+': 10000 } },
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 1000, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 1300, target: 'base' } },
    ],
  },

  manganese: {
    nutrientId: 'manganese',
    unit: 'mg',
    ai: {
      male: { '19-30': 2.3, '31-50': 2.3, '51-70': 2.3, '70+': 2.3 },
      female: { '19-30': 1.8, '31-50': 1.8, '51-70': 1.8, '70+': 1.8 },
    },
    ul: { both: { '19-30': 11, '31-50': 11, '51-70': 11, '70+': 11 } },
    primaryReference: 'AI',
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 2.0, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 2.6, target: 'base' } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FAT-SOLUBLE VITAMINS
  // ═══════════════════════════════════════════════════════════════════════════

  vitaminA: {
    nutrientId: 'vitaminA',
    unit: 'mcg',
    // RAE (Retinol Activity Equivalents)
    rda: {
      male: { '19-30': 900, '31-50': 900, '51-70': 900, '70+': 900 },
      female: { '19-30': 700, '31-50': 700, '51-70': 700, '70+': 700 },
    },
    ul: { both: { '19-30': 3000, '31-50': 3000, '51-70': 3000, '70+': 3000 } },
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 770, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 1300, target: 'base' } },
    ],
  },

  vitaminD: {
    nutrientId: 'vitaminD',
    unit: 'mcg',
    rda: {
      male: { '19-30': 15, '31-50': 15, '51-70': 15, '70+': 20 },
      female: { '19-30': 15, '31-50': 15, '51-70': 15, '70+': 20 },
    },
    ul: { both: { '19-30': 100, '31-50': 100, '51-70': 100, '70+': 100 } },
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 15, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 15, target: 'base' } },
    ],
  },

  vitaminE: {
    nutrientId: 'vitaminE',
    unit: 'mg',
    // Alpha-tocopherol
    rda: {
      male: { '19-30': 15, '31-50': 15, '51-70': 15, '70+': 15 },
      female: { '19-30': 15, '31-50': 15, '51-70': 15, '70+': 15 },
    },
    ul: { both: { '19-30': 1000, '31-50': 1000, '51-70': 1000, '70+': 1000 } },
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 15, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 19, target: 'base' } },
    ],
  },

  vitaminK: {
    nutrientId: 'vitaminK',
    unit: 'mcg',
    ai: {
      male: { '19-30': 120, '31-50': 120, '51-70': 120, '70+': 120 },
      female: { '19-30': 90, '31-50': 90, '51-70': 90, '70+': 90 },
    },
    primaryReference: 'AI',
    // No established UL
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 90, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 90, target: 'base' } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WATER-SOLUBLE VITAMINS
  // ═══════════════════════════════════════════════════════════════════════════

  vitaminC: {
    nutrientId: 'vitaminC',
    unit: 'mg',
    rda: {
      male: { '19-30': 90, '31-50': 90, '51-70': 90, '70+': 90 },
      female: { '19-30': 75, '31-50': 75, '51-70': 75, '70+': 75 },
    },
    ul: { both: { '19-30': 2000, '31-50': 2000, '51-70': 2000, '70+': 2000 } },
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 85, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 120, target: 'base' } },
    ],
  },

  thiamin: {
    nutrientId: 'thiamin',
    unit: 'mg',
    // Vitamin B1
    rda: {
      male: { '19-30': 1.2, '31-50': 1.2, '51-70': 1.2, '70+': 1.2 },
      female: { '19-30': 1.1, '31-50': 1.1, '51-70': 1.1, '70+': 1.1 },
    },
    // No established UL
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 1.4, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 1.4, target: 'base' } },
    ],
  },

  riboflavin: {
    nutrientId: 'riboflavin',
    unit: 'mg',
    // Vitamin B2
    rda: {
      male: { '19-30': 1.3, '31-50': 1.3, '51-70': 1.3, '70+': 1.3 },
      female: { '19-30': 1.1, '31-50': 1.1, '51-70': 1.1, '70+': 1.1 },
    },
    // No established UL
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 1.4, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 1.6, target: 'base' } },
    ],
  },

  niacin: {
    nutrientId: 'niacin',
    unit: 'mg',
    // Vitamin B3 - NE (Niacin Equivalents)
    rda: {
      male: { '19-30': 16, '31-50': 16, '51-70': 16, '70+': 16 },
      female: { '19-30': 14, '31-50': 14, '51-70': 14, '70+': 14 },
    },
    ul: { both: { '19-30': 35, '31-50': 35, '51-70': 35, '70+': 35 } },
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 18, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 17, target: 'base' } },
    ],
  },

  vitaminB6: {
    nutrientId: 'vitaminB6',
    unit: 'mg',
    rda: {
      male: { '19-30': 1.3, '31-50': 1.3, '51-70': 1.7, '70+': 1.7 },
      female: { '19-30': 1.3, '31-50': 1.3, '51-70': 1.5, '70+': 1.5 },
    },
    ul: { both: { '19-30': 100, '31-50': 100, '51-70': 100, '70+': 100 } },
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 1.9, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 2.0, target: 'base' } },
    ],
  },

  folate: {
    nutrientId: 'folate',
    unit: 'mcg',
    // DFE (Dietary Folate Equivalents)
    rda: {
      male: { '19-30': 400, '31-50': 400, '51-70': 400, '70+': 400 },
      female: { '19-30': 400, '31-50': 400, '51-70': 400, '70+': 400 },
    },
    ul: { both: { '19-30': 1000, '31-50': 1000, '51-70': 1000, '70+': 1000 } },
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 600, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 500, target: 'base' } },
    ],
  },

  vitaminB12: {
    nutrientId: 'vitaminB12',
    unit: 'mcg',
    rda: {
      male: { '19-30': 2.4, '31-50': 2.4, '51-70': 2.4, '70+': 2.4 },
      female: { '19-30': 2.4, '31-50': 2.4, '51-70': 2.4, '70+': 2.4 },
    },
    // No established UL
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 2.6, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 2.8, target: 'base' } },
    ],
  },

  choline: {
    nutrientId: 'choline',
    unit: 'mg',
    ai: {
      male: { '19-30': 550, '31-50': 550, '51-70': 550, '70+': 550 },
      female: { '19-30': 425, '31-50': 425, '51-70': 425, '70+': 425 },
    },
    ul: { both: { '19-30': 3500, '31-50': 3500, '51-70': 3500, '70+': 3500 } },
    primaryReference: 'AI',
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 450, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 550, target: 'base' } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OTHER NUTRIENTS
  // ═══════════════════════════════════════════════════════════════════════════

  caffeine: {
    nutrientId: 'caffeine',
    unit: 'mg',
    // FDA: Up to 400mg/day is generally not associated with negative effects
    ul: { both: { '19-30': 400, '31-50': 400, '51-70': 400, '70+': 400 } },
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 200, target: 'upperLimit' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 300, target: 'upperLimit' } },
    ],
  },

  alcohol: {
    nutrientId: 'alcohol',
    unit: 'g',
    // Dietary Guidelines: Up to 1 drink/day women, 2/day men
    // 1 drink = ~14g alcohol
    ul: {
      male: { '19-30': 28, '31-50': 28, '51-70': 28, '70+': 28 },
      female: { '19-30': 14, '31-50': 14, '51-70': 14, '70+': 14 },
    },
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 0, target: 'upperLimit' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 0, target: 'upperLimit' } },
    ],
  },

  water: {
    nutrientId: 'water',
    unit: 'g',
    // AI for total water (food + beverages)
    ai: {
      male: { '19-30': 3700, '31-50': 3700, '51-70': 3700, '70+': 3700 },
      female: { '19-30': 2700, '31-50': 2700, '51-70': 2700, '70+': 2700 },
    },
    primaryReference: 'AI',
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 3000, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 3800, target: 'base' } },
      { condition: 'athlete', adjustment: { type: 'multiplier', value: 1.5, target: 'base' } },
    ],
  },
} as const;

/**
 * Get DRI definition for a specific nutrient.
 *
 * @param nutrientId - The nutrient identifier
 * @returns The DRI definition or undefined if not found
 */
export function getDriDefinition(nutrientId: string): NutrientDriDefinition | undefined {
  return DRI_TABLE[nutrientId];
}

/**
 * Get all nutrient IDs that have DRI definitions.
 *
 * @returns Array of nutrient IDs with DRI data
 */
export function getDefinedNutrients(): string[] {
  return Object.keys(DRI_TABLE);
}
