/**
 * Nutrition domain types - Single source of truth for food/nutrition data
 */

import type { DateString, Timestamp, BaseEntity } from './common';

// ============================================================================
// NUTRITION DETAIL LEVELS
// ============================================================================

/**
 * User preference for how much nutrition detail to track
 * - essential: Basic macros (calories, protein, carbs, fat, fiber, sugar, sodium)
 * - extended: + fat breakdown, key minerals (potassium, calcium, iron, magnesium)
 * - complete: + all vitamins, trace minerals, fatty acid details
 */
export type NutritionDetailLevel = 'essential' | 'extended' | 'complete';

// ============================================================================
// USDA NUTRIENT IDS
// Maps our fields to USDA FoodData Central nutrient IDs
// Reference: https://fdc.nal.usda.gov/
// ============================================================================

export const USDA_NUTRIENT_IDS = {
  // Essential (Tier 1)
  CALORIES: 1008,
  PROTEIN: 1003,
  CARBS: 1005,
  FAT: 1004,
  FIBER: 1079,
  SUGAR: 2000,
  SODIUM: 1093,

  // Extended (Tier 2) - Fat breakdown
  SATURATED_FAT: 1258,
  TRANS_FAT: 1257,
  CHOLESTEROL: 1253,

  // Extended (Tier 2) - Key minerals
  POTASSIUM: 1092,
  CALCIUM: 1087,
  IRON: 1089,
  MAGNESIUM: 1090,

  // Complete (Tier 3) - Fat details
  MONOUNSATURATED_FAT: 1292,
  POLYUNSATURATED_FAT: 1293,

  // Complete (Tier 3) - Vitamins (Fat-soluble)
  VITAMIN_A: 1106,
  VITAMIN_D: 1114,
  VITAMIN_E: 1109,
  VITAMIN_K: 1185,

  // Complete (Tier 3) - Vitamins (Water-soluble)
  VITAMIN_C: 1162,
  THIAMIN: 1165,
  RIBOFLAVIN: 1166,
  NIACIN: 1167,
  VITAMIN_B6: 1175,
  FOLATE: 1177,
  VITAMIN_B12: 1178,
  CHOLINE: 1180,

  // Complete (Tier 3) - Trace minerals
  ZINC: 1095,
  PHOSPHORUS: 1091,
  SELENIUM: 1103,
  COPPER: 1098,
  MANGANESE: 1101,

  // Complete (Tier 3) - Other
  CAFFEINE: 1057,
  ALCOHOL: 1018,
  WATER: 1051,
} as const;

// ============================================================================
// COMPREHENSIVE NUTRITION INTERFACE
// ============================================================================

/**
 * Essential nutrition data - basic macros everyone sees
 */
export interface EssentialNutrition {
  calories: number;
  protein: number;        // g
  carbs: number;          // g
  fat: number;            // g
  fiber: number;          // g
  sugar: number;          // g
  sodium: number;         // mg
}

/**
 * Extended nutrition data - adds fat breakdown + key minerals
 */
export interface ExtendedNutrition extends EssentialNutrition {
  // Fat breakdown
  saturatedFat: number;   // g
  transFat: number;       // g
  cholesterol: number;    // mg

  // Key minerals
  potassium: number;      // mg
  calcium: number;        // mg
  iron: number;           // mg
  magnesium: number;      // mg
}

/**
 * Complete nutrition data - full vitamin/mineral tracking
 */
export interface CompleteNutrition extends ExtendedNutrition {
  // Additional fat details
  monounsaturatedFat?: number;  // g
  polyunsaturatedFat?: number;  // g

  // Vitamins (Fat-soluble)
  vitaminA?: number;      // mcg RAE
  vitaminD?: number;      // mcg
  vitaminE?: number;      // mg
  vitaminK?: number;      // mcg

  // Vitamins (Water-soluble)
  vitaminC?: number;      // mg
  thiamin?: number;       // mg (B1)
  riboflavin?: number;    // mg (B2)
  niacin?: number;        // mg (B3)
  vitaminB6?: number;     // mg
  folate?: number;        // mcg DFE
  vitaminB12?: number;    // mcg
  choline?: number;       // mg

  // Trace minerals
  zinc?: number;          // mg
  phosphorus?: number;    // mg
  selenium?: number;      // mcg
  copper?: number;        // mg
  manganese?: number;     // mg

  // Other
  caffeine?: number;      // mg
  alcohol?: number;       // g
  water?: number;         // g
}

/**
 * Union type for any nutrition level
 */
export type NutritionData = EssentialNutrition | ExtendedNutrition | CompleteNutrition;

/**
 * Helper to get USDA nutrient IDs for a given detail level
 */
export function getUSDANutrientIdsForLevel(level: NutritionDetailLevel): number[] {
  const ids = USDA_NUTRIENT_IDS;

  const essential = [
    ids.CALORIES, ids.PROTEIN, ids.CARBS, ids.FAT,
    ids.FIBER, ids.SUGAR, ids.SODIUM,
  ];

  const extended = [
    ...essential,
    ids.SATURATED_FAT, ids.TRANS_FAT, ids.CHOLESTEROL,
    ids.POTASSIUM, ids.CALCIUM, ids.IRON, ids.MAGNESIUM,
  ];

  const complete = [
    ...extended,
    ids.MONOUNSATURATED_FAT, ids.POLYUNSATURATED_FAT,
    ids.VITAMIN_A, ids.VITAMIN_D, ids.VITAMIN_E, ids.VITAMIN_K,
    ids.VITAMIN_C, ids.THIAMIN, ids.RIBOFLAVIN, ids.NIACIN,
    ids.VITAMIN_B6, ids.FOLATE, ids.VITAMIN_B12, ids.CHOLINE,
    ids.ZINC, ids.PHOSPHORUS, ids.SELENIUM, ids.COPPER, ids.MANGANESE,
    ids.CAFFEINE, ids.ALCOHOL, ids.WATER,
  ];

  switch (level) {
    case 'essential': return essential;
    case 'extended': return extended;
    case 'complete': return complete;
  }
}

/**
 * Nutrient metadata for display purposes
 */
export interface NutrientMeta {
  key: keyof CompleteNutrition;
  label: string;
  unit: string;
  level: NutritionDetailLevel;
  category: 'macro' | 'fat' | 'mineral' | 'vitamin' | 'other';
  dailyValue?: number; // FDA daily value for % calculation
}

/**
 * Complete nutrient metadata registry
 */
export const NUTRIENT_METADATA: NutrientMeta[] = [
  // Essential - Macros
  { key: 'calories', label: 'Calories', unit: 'kcal', level: 'essential', category: 'macro', dailyValue: 2000 },
  { key: 'protein', label: 'Protein', unit: 'g', level: 'essential', category: 'macro', dailyValue: 50 },
  { key: 'carbs', label: 'Carbohydrates', unit: 'g', level: 'essential', category: 'macro', dailyValue: 275 },
  { key: 'fat', label: 'Total Fat', unit: 'g', level: 'essential', category: 'macro', dailyValue: 78 },
  { key: 'fiber', label: 'Fiber', unit: 'g', level: 'essential', category: 'macro', dailyValue: 28 },
  { key: 'sugar', label: 'Sugars', unit: 'g', level: 'essential', category: 'macro', dailyValue: 50 },
  { key: 'sodium', label: 'Sodium', unit: 'mg', level: 'essential', category: 'mineral', dailyValue: 2300 },

  // Extended - Fat breakdown
  { key: 'saturatedFat', label: 'Saturated Fat', unit: 'g', level: 'extended', category: 'fat', dailyValue: 20 },
  { key: 'transFat', label: 'Trans Fat', unit: 'g', level: 'extended', category: 'fat' },
  { key: 'cholesterol', label: 'Cholesterol', unit: 'mg', level: 'extended', category: 'fat', dailyValue: 300 },

  // Extended - Key minerals
  { key: 'potassium', label: 'Potassium', unit: 'mg', level: 'extended', category: 'mineral', dailyValue: 4700 },
  { key: 'calcium', label: 'Calcium', unit: 'mg', level: 'extended', category: 'mineral', dailyValue: 1300 },
  { key: 'iron', label: 'Iron', unit: 'mg', level: 'extended', category: 'mineral', dailyValue: 18 },
  { key: 'magnesium', label: 'Magnesium', unit: 'mg', level: 'extended', category: 'mineral', dailyValue: 420 },

  // Complete - Fat details
  { key: 'monounsaturatedFat', label: 'Monounsaturated Fat', unit: 'g', level: 'complete', category: 'fat' },
  { key: 'polyunsaturatedFat', label: 'Polyunsaturated Fat', unit: 'g', level: 'complete', category: 'fat' },

  // Complete - Vitamins (Fat-soluble)
  { key: 'vitaminA', label: 'Vitamin A', unit: 'mcg', level: 'complete', category: 'vitamin', dailyValue: 900 },
  { key: 'vitaminD', label: 'Vitamin D', unit: 'mcg', level: 'complete', category: 'vitamin', dailyValue: 20 },
  { key: 'vitaminE', label: 'Vitamin E', unit: 'mg', level: 'complete', category: 'vitamin', dailyValue: 15 },
  { key: 'vitaminK', label: 'Vitamin K', unit: 'mcg', level: 'complete', category: 'vitamin', dailyValue: 120 },

  // Complete - Vitamins (Water-soluble)
  { key: 'vitaminC', label: 'Vitamin C', unit: 'mg', level: 'complete', category: 'vitamin', dailyValue: 90 },
  { key: 'thiamin', label: 'Thiamin (B1)', unit: 'mg', level: 'complete', category: 'vitamin', dailyValue: 1.2 },
  { key: 'riboflavin', label: 'Riboflavin (B2)', unit: 'mg', level: 'complete', category: 'vitamin', dailyValue: 1.3 },
  { key: 'niacin', label: 'Niacin (B3)', unit: 'mg', level: 'complete', category: 'vitamin', dailyValue: 16 },
  { key: 'vitaminB6', label: 'Vitamin B6', unit: 'mg', level: 'complete', category: 'vitamin', dailyValue: 1.7 },
  { key: 'folate', label: 'Folate', unit: 'mcg', level: 'complete', category: 'vitamin', dailyValue: 400 },
  { key: 'vitaminB12', label: 'Vitamin B12', unit: 'mcg', level: 'complete', category: 'vitamin', dailyValue: 2.4 },
  { key: 'choline', label: 'Choline', unit: 'mg', level: 'complete', category: 'vitamin', dailyValue: 550 },

  // Complete - Trace minerals
  { key: 'zinc', label: 'Zinc', unit: 'mg', level: 'complete', category: 'mineral', dailyValue: 11 },
  { key: 'phosphorus', label: 'Phosphorus', unit: 'mg', level: 'complete', category: 'mineral', dailyValue: 1250 },
  { key: 'selenium', label: 'Selenium', unit: 'mcg', level: 'complete', category: 'mineral', dailyValue: 55 },
  { key: 'copper', label: 'Copper', unit: 'mg', level: 'complete', category: 'mineral', dailyValue: 0.9 },
  { key: 'manganese', label: 'Manganese', unit: 'mg', level: 'complete', category: 'mineral', dailyValue: 2.3 },

  // Complete - Other
  { key: 'caffeine', label: 'Caffeine', unit: 'mg', level: 'complete', category: 'other' },
  { key: 'alcohol', label: 'Alcohol', unit: 'g', level: 'complete', category: 'other' },
  { key: 'water', label: 'Water', unit: 'g', level: 'complete', category: 'other' },
];

/**
 * Get nutrients filtered by detail level
 */
export function getNutrientsForLevel(level: NutritionDetailLevel): NutrientMeta[] {
  const levels: NutritionDetailLevel[] = ['essential'];
  if (level === 'extended' || level === 'complete') levels.push('extended');
  if (level === 'complete') levels.push('complete');

  return NUTRIENT_METADATA.filter(n => levels.includes(n.level));
}

/**
 * Get nutrients grouped by category for a given level
 */
export function getNutrientsByCategory(level: NutritionDetailLevel): Record<string, NutrientMeta[]> {
  const nutrients = getNutrientsForLevel(level);
  return nutrients.reduce((acc, n) => {
    if (!acc[n.category]) acc[n.category] = [];
    acc[n.category].push(n);
    return acc;
  }, {} as Record<string, NutrientMeta[]>);
}

/**
 * Meal type - the four main meals of the day
 */
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/**
 * Food log entry - represents a single food item or meal logged
 */
export interface FoodLog extends BaseEntity {
  mealType: MealType;
  description: string;
  time: string; // Time of day (e.g., "8:30 AM")
  date: DateString;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  sodium: number | null;
  photoUrl?: string;
  isAiAnalyzed?: boolean;
  aiConfidence?: number;
  fdcId?: string; // USDA Food Data Central ID
}

/**
 * Simplified food log for dashboard status display
 */
export interface FoodLogSummary {
  id: string;
  date: DateString;
  mealType: MealType;
  description: string;
  calories?: number;
  loggedAt: Timestamp;
}

/**
 * Daily nutrition totals
 */
export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

/**
 * Daily nutrition with targets
 */
export interface DailyNutrition {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
  fiber: { current: number; target: number };
  water: { current: number; target: number };
}

/**
 * Daily food data aggregation
 */
export interface DailyFoodData {
  date: DateString;
  meals: FoodLog[];
  totals: NutritionTotals;
}

/**
 * Nutrition targets/goals
 */
export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  water: number;
}

/**
 * Food log status for dashboard
 */
export interface FoodLogStatus {
  totalMeals: number;
  loggedMeals: number;
  pendingMeals: number;
  totalCalories: number;
  meals: Array<{
    type: MealType;
    logged: boolean;
    description?: string;
    calories?: number;
    loggedAt?: string;
  }>;
  completionPercentage: number;
}

/**
 * View modes for nutrition tab
 */
export type NutritionViewMode = 'today' | 'history';

/**
 * Time range options for history charts
 */
export type TimeRange = '1W' | '1M' | '3M';

/**
 * Time range to days mapping
 */
export const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
};

/**
 * Macro nutrient colors for consistent theming
 */
export const MACRO_COLORS = {
  protein: { from: '#ef4444', to: '#f97316' }, // red to orange
  carbs: { from: '#eab308', to: '#facc15' },   // yellow
  fat: { from: '#3b82f6', to: '#60a5fa' },     // blue
  fiber: { from: '#22c55e', to: '#4ade80' },   // green
} as const;

/**
 * Meal schedule configuration
 */
export const MEAL_SCHEDULE: Array<{ type: MealType; startHour: number; endHour: number; label: string }> = [
  { type: 'breakfast', startHour: 6, endHour: 10, label: 'Breakfast' },
  { type: 'lunch', startHour: 11, endHour: 14, label: 'Lunch' },
  { type: 'snack', startHour: 14, endHour: 17, label: 'Snack' },
  { type: 'dinner', startHour: 17, endHour: 21, label: 'Dinner' },
];
