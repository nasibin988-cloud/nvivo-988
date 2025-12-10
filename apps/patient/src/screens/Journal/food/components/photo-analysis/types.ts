/**
 * PhotoAnalysis Types
 * Comprehensive type definitions for AI food photo analysis
 */

export type NutritionDetailLevel = 'essential' | 'extended' | 'complete';

/**
 * Comprehensive nutrition data for a single food item
 * Based on USDA nutrient database standards
 */
export interface AnalyzedFood {
  name: string;
  quantity: number;
  unit: string;
  confidence: number;

  // === MACRONUTRIENTS ===
  calories: number;
  protein: number;

  // Carbohydrates breakdown
  carbs: number;
  fiber?: number;
  sugar?: number;
  addedSugar?: number;
  starch?: number;

  // Fat breakdown
  fat: number;
  saturatedFat?: number;
  monounsaturatedFat?: number;
  polyunsaturatedFat?: number;
  transFat?: number;
  omega3?: number;
  omega6?: number;
  cholesterol?: number;

  // === MINERALS ===
  // Electrolytes
  sodium?: number;
  potassium?: number;
  calcium?: number;
  magnesium?: number;
  phosphorus?: number;

  // Trace minerals
  iron?: number;
  zinc?: number;
  copper?: number;
  manganese?: number;
  selenium?: number;
  iodine?: number;
  chromium?: number;
  molybdenum?: number;
  fluoride?: number;

  // === VITAMINS ===
  // Fat-soluble
  vitaminA?: number;        // mcg RAE
  vitaminD?: number;        // mcg
  vitaminE?: number;        // mg
  vitaminK?: number;        // mcg

  // Water-soluble
  vitaminC?: number;        // mg
  thiamin?: number;         // B1 mg
  riboflavin?: number;      // B2 mg
  niacin?: number;          // B3 mg
  pantothenicAcid?: number; // B5 mg
  vitaminB6?: number;       // mg
  biotin?: number;          // mcg
  folate?: number;          // mcg DFE
  vitaminB12?: number;      // mcg
  choline?: number;         // mg

  // === OTHER BIOACTIVE ===
  caffeine?: number;        // mg
  alcohol?: number;         // g
  water?: number;           // ml
  lycopene?: number;        // mcg
  lutein?: number;          // mcg
  betaCarotene?: number;    // mcg

  // === METADATA ===
  glycemicIndex?: number;
  glycemicLoad?: number;
  novaClass?: 1 | 2 | 3 | 4;
  allergens?: string[];
  dietaryFlags?: string[];

  // Serving info
  servingSize?: string;
  servingWeight?: number;   // g
}

/**
 * Aggregated analysis result for a meal
 */
export interface AnalysisResult {
  items: AnalyzedFood[];
  detailLevel: NutritionDetailLevel;

  // === MACRO TOTALS ===
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber?: number;
  totalSugar?: number;
  totalAddedSugar?: number;

  // Fat breakdown totals
  totalSaturatedFat?: number;
  totalMonounsaturatedFat?: number;
  totalPolyunsaturatedFat?: number;
  totalTransFat?: number;
  totalOmega3?: number;
  totalOmega6?: number;
  totalCholesterol?: number;

  // === MINERAL TOTALS ===
  totalSodium?: number;
  totalPotassium?: number;
  totalCalcium?: number;
  totalMagnesium?: number;
  totalPhosphorus?: number;
  totalIron?: number;
  totalZinc?: number;
  totalCopper?: number;
  totalManganese?: number;
  totalSelenium?: number;

  // === VITAMIN TOTALS ===
  totalVitaminA?: number;
  totalVitaminD?: number;
  totalVitaminE?: number;
  totalVitaminK?: number;
  totalVitaminC?: number;
  totalThiamin?: number;
  totalRiboflavin?: number;
  totalNiacin?: number;
  totalVitaminB6?: number;
  totalFolate?: number;
  totalVitaminB12?: number;
  totalCholine?: number;

  // === OTHER TOTALS ===
  totalCaffeine?: number;
  totalAlcohol?: number;
  totalWater?: number;

  // Meal metadata
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'unknown';
  eatenAt?: string;

  // Overall meal metadata
  allergens?: string[];
  dietaryFlags?: string[];
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type AnalysisStep = 'capture' | 'analyzing' | 'review';

export interface PhotoAnalysisModalProps {
  onClose: () => void;
  onConfirm: (result: AnalysisResult) => void;
}

export interface MealTypeConfig {
  type: MealType;
  label: string;
  icon: React.ComponentType<Record<string, unknown>>;
  color: string;
}

export interface MacroConfig {
  key: keyof AnalyzedFood;
  label: string;
  borderColor: string;
  textColor: string;
}

/**
 * Nutrient display configuration
 */
export interface NutrientDisplayConfig {
  key: keyof AnalyzedFood;
  totalKey: keyof AnalysisResult;
  label: string;
  unit: string;
  color: string;
  dailyValue?: number; // FDA recommended daily value
}

/**
 * Tier-specific nutrient groups
 */
export const ESSENTIAL_NUTRIENTS: (keyof AnalyzedFood)[] = [
  'calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium'
];

export const EXTENDED_NUTRIENTS: (keyof AnalyzedFood)[] = [
  ...ESSENTIAL_NUTRIENTS,
  'saturatedFat', 'transFat', 'cholesterol', 'potassium', 'calcium',
  'iron', 'magnesium', 'zinc', 'vitaminA', 'vitaminC', 'vitaminD'
];

export const COMPLETE_NUTRIENTS: (keyof AnalyzedFood)[] = [
  ...EXTENDED_NUTRIENTS,
  'monounsaturatedFat', 'polyunsaturatedFat', 'omega3', 'omega6',
  'addedSugar', 'starch', 'phosphorus', 'copper', 'manganese', 'selenium',
  'vitaminE', 'vitaminK', 'thiamin', 'riboflavin', 'niacin', 'vitaminB6',
  'folate', 'vitaminB12', 'choline', 'caffeine', 'water',
  'glycemicIndex', 'glycemicLoad', 'novaClass'
];
