/**
 * PhotoAnalysis Types
 * Comprehensive type definitions for AI food photo analysis
 */

export type NutritionDetailLevel = 'essential' | 'extended' | 'complete';

/**
 * Feature flags for photo analysis
 */
export const PHOTO_ANALYSIS_FEATURES = {
  /** Enable ingredient breakdown for analyzed foods (increases API output tokens ~2-3x) */
  INGREDIENT_BREAKDOWN: false,
} as const;

/**
 * Individual ingredient within a food item
 * Used when INGREDIENT_BREAKDOWN feature is enabled
 */
export interface FoodIngredient {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  /** Percentage of the total dish this ingredient represents */
  percentOfDish?: number;
}

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
  omega3?: number;         // ALA (plant omega-3) in g
  omega6?: number;
  epaDha?: number;         // EPA + DHA (fish oil omega-3) in mg
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

  // Ingredient breakdown (only populated when INGREDIENT_BREAKDOWN feature is enabled)
  ingredients?: FoodIngredient[];

  // Food Intelligence (populated from our database when matched)
  intelligence?: FoodIntelligence;

  // === V2 FIELDS ===
  /** Complete grading result (overall + focus-specific) */
  grading?: GradingResult;
  /** AI-generated personalized insight */
  insight?: FoodInsight;
  /** Estimated weight in grams */
  estimatedGrams?: number;
  /** Food type classification */
  foodType?: 'whole_food' | 'branded' | 'restaurant' | 'homemade';
  /** Nutrition data source */
  nutritionSource?: 'usda' | 'branded' | 'recipe' | 'ai_estimated';
  /** Confidence in nutrition data (0-1) */
  nutritionConfidence?: number;
}

/**
 * Focus-specific grade for a food
 */
export interface FocusGrade {
  grade: string; // A, B, C, D, F
  score: number; // 0-100
  insight: string; // Brief explanation
  pros: string[]; // Benefits for this focus
  cons: string[]; // Drawbacks for this focus
}

/**
 * AI-generated personalized insight for a food (V2)
 */
export interface FoodInsight {
  /** 1-2 sentence contextual summary */
  summary: string;
  /** Why this food works (or doesn't) for user's focus */
  focusExplanation: string;
  /** Practical tips (timing, pairing, portion) - 1-3 items */
  tips: string[];
  /** Things to be mindful of - 0-2 items */
  considerations: string[];
}

/**
 * Overall health grade (Nutri-Score style)
 */
export interface OverallGrade {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: number; // 0-100
  nutriScorePoints: number;
}

/**
 * Satiety result
 */
export interface SatietyResult {
  score: number;
  category: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
}

/**
 * Inflammatory result
 */
export interface InflammatoryResult {
  index: number;
  category: 'anti_inflammatory' | 'neutral' | 'mildly_inflammatory' | 'inflammatory';
}

/**
 * Complete grading result (V2)
 */
export interface GradingResult {
  overall: OverallGrade;
  focusGrades: FoodFocusGrades;
  satiety: SatietyResult;
  inflammatory: InflammatoryResult;
  strengths: string[];
  concerns: string[];
}

/**
 * All 10 nutrition focus grades for a food
 */
export interface FoodFocusGrades {
  balanced?: FocusGrade;
  muscle_building?: FocusGrade;
  heart_health?: FocusGrade;
  energy?: FocusGrade;
  weight_management?: FocusGrade;
  brain_focus?: FocusGrade;
  gut_health?: FocusGrade;
  blood_sugar?: FocusGrade;
  bone_joint?: FocusGrade;
  anti_inflammatory?: FocusGrade;
}

/**
 * Food intelligence data - contextual info beyond raw nutrition
 */
export interface FoodIntelligence {
  /** One-liner contextual insight about this food */
  insight?: string;
  /** Focus-specific grades (A-F with insights) */
  focusGrades?: FoodFocusGrades;
  /** Glycemic index (0-100) */
  glycemicIndex?: number;
  /** Glycemic load */
  glycemicLoad?: number;
  /** Glycemic category */
  glycemicCategory?: 'low' | 'medium' | 'high';
  /** Satiety score (0-100) - how filling */
  satietyScore?: number;
  /** Inflammatory index (negative = anti-inflammatory) */
  inflammatoryIndex?: number;
  /** NOVA food processing classification (1-4) */
  novaClass?: 1 | 2 | 3 | 4;
  /** Dietary tags */
  dietaryTags?: string[];
  /** Allergens present */
  allergens?: string[];
  /** Nutrient density score */
  nutrientDensityScore?: number;
  /** ORAC antioxidant score */
  oracScore?: number;
  /** Food category */
  foodGroup?: string;
  /** Omega 6:3 ratio */
  omegaRatio?: number;
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
  totalOmega3?: number;      // ALA in g
  totalOmega6?: number;
  totalEpaDha?: number;      // EPA + DHA in mg
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

  // === V2 FIELDS ===
  /** User's wellness focus for personalized grades */
  userFocus?: WellnessFocus;
  /** Total glycemic index for the meal */
  totalGI?: GIResult;
  /** Analysis version */
  version?: string;
  /** When analysis was performed */
  analyzedAt?: Date | string;
}

/**
 * Glycemic index result
 */
export interface GIResult {
  gi: number;
  gl: number;
  giBand: 'low' | 'medium' | 'high';
  glBand: 'low' | 'medium' | 'high';
  source: 'exact' | 'similar' | 'category' | 'estimated';
  confidence: number;
}

/**
 * Wellness focus options
 */
export type WellnessFocus =
  | 'balanced'
  | 'muscle_building'
  | 'heart_health'
  | 'energy_endurance'
  | 'weight_management'
  | 'brain_focus'
  | 'gut_health'
  | 'blood_sugar_balance'
  | 'bone_joint_support'
  | 'anti_inflammatory';

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
