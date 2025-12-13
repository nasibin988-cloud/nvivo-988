/**
 * Nutrition V2 Types
 *
 * Core types for the new nutrition architecture.
 * AI identifies → Databases resolve → Formulas grade
 */

// ============================================================================
// FOOD IDENTIFICATION TYPES (AI Layer Output)
// ============================================================================

/**
 * Food type classification - determines resolution routing
 */
export type FoodType =
  | 'whole_food'        // apple, chicken breast, rice
  | 'restaurant_item'   // Big Mac, Chipotle Burrito
  | 'branded_packaged'  // KIND bar, Cheerios
  | 'homemade_dish'     // homemade chicken soup
  | 'generic_dish';     // "cheeseburger" (no brand)

/**
 * Normalized food descriptor - common output from all AI entry points
 */
export interface NormalizedFoodDescriptor {
  // Core identification
  name: string;
  quantity: number;
  unit: string;
  estimatedGrams: number;

  // Classification
  foodType: FoodType;

  // Context (improves resolution accuracy)
  restaurantName?: string;
  brandName?: string;
  cuisineType?: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';

  // Ingredient breakdown for composite dishes
  ingredients?: IngredientDescriptor[];

  // Confidence in identification
  confidence: number;
}

export interface IngredientDescriptor {
  name: string;
  estimatedGrams: number;
}

// ============================================================================
// COMPLETE NUTRITION TYPES (Resolution Layer Output)
// ============================================================================

/**
 * Complete nutrition data - 33 nutrients tracked
 * All values are for the actual serving size, not per 100g
 */
export interface CompleteNutrition {
  // Macronutrients (7)
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;

  // Fat breakdown (4)
  saturatedFat: number;
  transFat: number;
  monounsaturatedFat: number;
  polyunsaturatedFat: number;

  // Other macros (1)
  cholesterol: number;

  // Minerals (8)
  potassium: number;
  calcium: number;
  iron: number;
  magnesium: number;
  zinc: number;
  phosphorus: number;
  iodine?: number;
  chromium?: number;

  // Vitamins - Fat soluble (4)
  vitaminA: number;
  vitaminD: number;
  vitaminE: number;
  vitaminK: number;

  // Vitamins - Water soluble (9)
  vitaminC: number;
  thiamin: number;
  riboflavin: number;
  niacin: number;
  vitaminB6: number;
  folate: number;
  vitaminB12: number;
  pantothenicAcid?: number;
  choline?: number;
}

/**
 * Resolution result from the resolution layer
 */
export interface ResolutionResult {
  nutrition: CompleteNutrition;
  source: ResolutionSource;
  confidence: number;
  servingGrams: number;
}

export type ResolutionSource =
  | 'cache'
  | 'usda'
  | 'edamam'
  | 'openfoodfacts'
  | 'hybrid'          // OFF macros + USDA micros
  | 'decomposed'      // Sum of resolved ingredients
  | 'ai_fallback';    // Last resort

// ============================================================================
// GI ENRICHMENT TYPES
// ============================================================================

export type GIBand = 'low' | 'medium' | 'high';
export type GLBand = 'low' | 'medium' | 'high';

export interface GIResult {
  gi: number;
  gl: number;
  giBand: GIBand;
  glBand: GLBand;
  source: 'exact' | 'fuzzy' | 'category' | 'default';
  confidence: number;
}

/**
 * Enriched nutrition with GI data
 */
export interface EnrichedNutrition extends CompleteNutrition {
  gi?: number;
  gl?: number;
  giBand?: GIBand;
  glBand?: GLBand;
}

// ============================================================================
// GRADING TYPES
// ============================================================================

export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'F';

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

export interface FocusGradeResult {
  grade: HealthGrade;
  score: number;
  insight: string;
  pros: string[];
  cons: string[];
}

export interface SatietyResult {
  score: number;
  category: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
}

export interface InflammatoryResult {
  index: number;
  category: 'anti_inflammatory' | 'neutral' | 'mildly_inflammatory' | 'inflammatory';
}

export interface CompleteGradingResult {
  // Overall Nutri-Score
  overall: {
    grade: HealthGrade;
    score: number;
    nutriScorePoints: number;
  };

  // Focus grades
  focusGrades: Record<WellnessFocus, FocusGradeResult>;

  // Additional scores
  satiety: SatietyResult;
  inflammatory: InflammatoryResult;

  // Summary
  strengths: string[];
  concerns: string[];
}

// ============================================================================
// AI INSIGHT TYPES
// ============================================================================

/**
 * AI-generated personalized insight for a food
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

// ============================================================================
// COMPLETE ANALYZED FOOD (Final Output)
// ============================================================================

/**
 * Fully analyzed food with all layers applied
 */
export interface AnalyzedFoodV2 {
  // Identification
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedGrams: number;
  foodType: FoodType;

  // Nutrition
  nutrition: EnrichedNutrition;
  nutritionSource: ResolutionSource;
  nutritionConfidence: number;

  // GI (if applicable)
  gi?: GIResult;

  // Grading
  grading: CompleteGradingResult;

  // AI-generated insight (personalized to user's focus)
  insight?: FoodInsight;

  // Context
  restaurantName?: string;
  brandName?: string;

  // Ingredient breakdown (if composite)
  ingredients?: AnalyzedIngredient[];
}

export interface AnalyzedIngredient {
  name: string;
  estimatedGrams: number;
  nutrition: CompleteNutrition;
  source: ResolutionSource;
}

// ============================================================================
// ANALYSIS RESULT TYPES
// ============================================================================

export interface FoodAnalysisResultV2 {
  items: AnalyzedFoodV2[];
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'unknown';

  // Totals
  totals: CompleteNutrition;
  totalGI?: GIResult;

  // User's wellness focus used for grading/insights
  userFocus: WellnessFocus;

  // Metadata
  analyzedAt: Date;
  version: string;
}

// ============================================================================
// COMPARISON TYPES
// ============================================================================

export interface ComparisonWinner {
  foodId: string;
  foodName: string;
  margin: 'decisive' | 'moderate' | 'slight' | 'tie';
  score: number;
}

export interface ComparisonInsight {
  summary: string;
  winnerExplanation: string;
  considerations: string[];
  recommendation: string;
}

export interface ComparisonResultV2 {
  foods: AnalyzedFoodV2[];
  userFocus: WellnessFocus;

  // Deterministic results
  winner: ComparisonWinner;
  focusWinners: Record<WellnessFocus, ComparisonWinner>;
  nutrientComparison: Record<keyof CompleteNutrition, {
    values: Record<string, number>;
    leader: string;
  }>;

  // AI insights (optional)
  insights?: ComparisonInsight;

  // Metadata
  comparedAt: Date;
  aiInsightsEnabled: boolean;
}

// ============================================================================
// MENU SCAN TYPES
// ============================================================================

export interface MenuItemV2 extends NormalizedFoodDescriptor {
  id: string;
  description?: string;
  price?: string;
  isSelected: boolean;
}

export interface DetectedRestaurant {
  name: string | null;
  logoDetected: boolean;
  confidence: number;
  cuisine?: string;
}

export interface MenuScanResultV2 {
  restaurant: DetectedRestaurant;
  menuItems: MenuItemV2[];
  rawText: string;
  scanConfidence: number;
}

// ============================================================================
// API RESPONSE TYPES (for external APIs)
// ============================================================================

export interface USDAFoodItem {
  fdcId: number;
  description: string;
  dataType: string;
  foodNutrients: USDANutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
}

export interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  unitName: string;
  value: number;
}

export interface EdamamFoodItem {
  foodId: string;
  label: string;
  nutrients: {
    ENERC_KCAL?: number;
    PROCNT?: number;
    FAT?: number;
    CHOCDF?: number;
    FIBTG?: number;
    // ... more nutrients
  };
  category?: string;
  categoryLabel?: string;
}

export interface OFFProduct {
  code: string;
  product_name: string;
  nutriments: OFFNutriments;
  serving_size?: string;
  serving_quantity?: number;
  brands?: string;
}

export interface OFFNutriments {
  energy_kcal_100g?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  fiber_100g?: number;
  sugars_100g?: number;
  sodium_100g?: number;
  'saturated-fat_100g'?: number;
  'trans-fat_100g'?: number;
  cholesterol_100g?: number;
  potassium_100g?: number;
  calcium_100g?: number;
  iron_100g?: number;
  'vitamin-d_100g'?: number;
  // Allow any additional nutrient properties
  [key: string]: number | undefined;
}
