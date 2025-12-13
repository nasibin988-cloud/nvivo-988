/**
 * Nutrition Analysis Pipeline V2
 *
 * Orchestrates the full analysis flow:
 * 1. Identification (AI) → NormalizedFoodDescriptor
 * 2. Resolution (Databases) → CompleteNutrition
 * 3. GI Lookup (Pre-loaded) → GIResult
 * 4. Grading (Deterministic) → CompleteGradingResult
 * 5. AI Insight (GPT-4o-mini) → FoodInsight
 * 6. Assembled → AnalyzedFoodV2
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  NormalizedFoodDescriptor,
  AnalyzedFoodV2,
  FoodAnalysisResultV2,
  CompleteNutrition,
  EnrichedNutrition,
  WellnessFocus,
  MenuScanResultV2,
  ComparisonResultV2,
} from './types';
import { identifyFoodsFromPhoto, identifyFoodsFromPhotoUrl, parseFoodText, scanMenu, menuItemsToDescriptors } from './identification';
import { resolveNutrition, batchResolveNutrition } from './resolution';
import { lookupGI, hasRelevantGI, calculateMealGI, calculateMealGL } from './gi';
import { gradeNutritionWithGI, compareFoodsWithInsights, compareFoods, generateFoodInsight, type InsightInput } from './grading';

// Version for tracking
const PIPELINE_VERSION = '2.0.0';

/**
 * Analysis options
 */
export interface AnalysisOptionsV2 {
  /** User's wellness focus for personalized grades/insights */
  userFocus?: WellnessFocus;
  /** Generate AI insights for each food (default: true) */
  generateInsights?: boolean;
}

const DEFAULT_OPTIONS: Required<AnalysisOptionsV2> = {
  userFocus: 'balanced',
  generateInsights: true,
};

/**
 * Analyze food from photo
 * Full pipeline: Photo → AI ID → DB Resolution → GI → Grade → Insight
 */
export async function analyzePhotoV2(
  imageBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  options: AnalysisOptionsV2 = {}
): Promise<FoodAnalysisResultV2> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // 1. AI Identification
  const identified = await identifyFoodsFromPhoto(imageBase64, mimeType);

  // 2. Process identified foods through pipeline
  return processIdentifiedFoods(identified.items, identified.mealType, opts);
}

/**
 * Analyze food from photo URL
 */
export async function analyzePhotoUrlV2(
  imageUrl: string,
  options: AnalysisOptionsV2 = {}
): Promise<FoodAnalysisResultV2> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const identified = await identifyFoodsFromPhotoUrl(imageUrl);
  return processIdentifiedFoods(identified.items, identified.mealType, opts);
}

/**
 * Analyze food from text description
 */
export async function analyzeTextV2(
  text: string,
  options: AnalysisOptionsV2 = {}
): Promise<FoodAnalysisResultV2> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const parsed = await parseFoodText(text);
  return processIdentifiedFoods(parsed.items, parsed.mealType, opts);
}

/**
 * Analyze menu items (from menu scan)
 */
export async function analyzeMenuItemsV2(
  menuScan: MenuScanResultV2,
  selectedItemIds: string[],
  options: AnalysisOptionsV2 = {}
): Promise<FoodAnalysisResultV2> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const selectedItems = menuScan.menuItems.filter(item => selectedItemIds.includes(item.id));

  if (selectedItems.length === 0) {
    throw new Error('No items selected for analysis');
  }

  const descriptors = menuItemsToDescriptors(selectedItems, menuScan.restaurant.name);
  return processIdentifiedFoods(descriptors, 'unknown', opts);
}

/**
 * Full menu scan and analysis
 */
export async function scanAndAnalyzeMenuV2(
  imageBase64: string,
  selectedItemIds: string[],
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  options: AnalysisOptionsV2 = {}
): Promise<{ menuScan: MenuScanResultV2; analysis: FoodAnalysisResultV2 }> {
  const menuScan = await scanMenu(imageBase64, mimeType);
  const analysis = await analyzeMenuItemsV2(menuScan, selectedItemIds, options);

  return { menuScan, analysis };
}

/**
 * Compare multiple foods
 */
export async function compareFoodsV2(
  foods: Array<{ text?: string; imageBase64?: string; imageUrl?: string }>,
  userFocus: WellnessFocus = 'balanced',
  includeAIInsights: boolean = false
): Promise<ComparisonResultV2> {
  // Analyze each food
  const analyzedFoods: AnalyzedFoodV2[] = [];

  for (const food of foods) {
    let result: FoodAnalysisResultV2;

    if (food.text) {
      result = await analyzeTextV2(food.text);
    } else if (food.imageBase64) {
      result = await analyzePhotoV2(food.imageBase64);
    } else if (food.imageUrl) {
      result = await analyzePhotoUrlV2(food.imageUrl);
    } else {
      throw new Error('Each food must have text, imageBase64, or imageUrl');
    }

    // Take the first item from each analysis
    if (result.items.length > 0) {
      analyzedFoods.push(result.items[0]);
    }
  }

  if (analyzedFoods.length < 2) {
    throw new Error('Need at least 2 valid foods to compare');
  }

  // Compare with or without AI insights
  if (includeAIInsights) {
    return compareFoodsWithInsights(analyzedFoods, userFocus);
  }

  return compareFoods(analyzedFoods, userFocus);
}

/**
 * Process identified foods through resolution, GI, grading, and insights
 */
async function processIdentifiedFoods(
  descriptors: NormalizedFoodDescriptor[],
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'unknown',
  options: Required<AnalysisOptionsV2>
): Promise<FoodAnalysisResultV2> {
  const { userFocus, generateInsights } = options;

  if (descriptors.length === 0) {
    return {
      items: [],
      mealType,
      totals: createEmptyNutrition(),
      userFocus,
      analyzedAt: new Date(),
      version: PIPELINE_VERSION,
    };
  }

  // 2. Resolve nutrition from databases (batch for efficiency)
  const resolutionResults = await batchResolveNutrition(descriptors);

  // 3. Process each food (nutrition, GI, grading)
  const analyzedItems: AnalyzedFoodV2[] = [];

  for (const descriptor of descriptors) {
    const resolution = resolutionResults.get(descriptor.name);

    if (!resolution) {
      // Fallback to individual resolution
      const singleResolution = await resolveNutrition(descriptor);
      const analyzed = await processFood(descriptor, singleResolution.nutrition, singleResolution.source, singleResolution.confidence);
      analyzedItems.push(analyzed);
    } else {
      const analyzed = await processFood(descriptor, resolution.nutrition, resolution.source, resolution.confidence);
      analyzedItems.push(analyzed);
    }
  }

  // 4. Generate AI insights for each food (in parallel)
  if (generateInsights) {
    const insightPromises = analyzedItems.map(async (item) => {
      const insightInput: InsightInput = {
        foodName: item.name,
        servingDescription: `${item.quantity} ${item.unit}`,
        nutrition: item.nutrition,
        gi: item.gi,
        grading: item.grading,
        userFocus,
      };
      return generateFoodInsight(insightInput);
    });

    const insights = await Promise.all(insightPromises);

    // Attach insights to items
    for (let i = 0; i < analyzedItems.length; i++) {
      analyzedItems[i].insight = insights[i];
    }
  }

  // 5. Calculate totals
  const totals = sumNutrition(analyzedItems.map(item => item.nutrition));

  // 6. Calculate meal GI if relevant
  let totalGI = undefined;
  const itemsWithGI = analyzedItems.filter(item => item.gi && hasRelevantGI(item.nutrition));
  if (itemsWithGI.length > 0) {
    const mealGI = calculateMealGI(itemsWithGI.map(item => ({
      gi: item.gi!.gi,
      carbsInServing: item.nutrition.carbs,
    })));
    const mealGL = calculateMealGL(itemsWithGI.map(item => ({
      gl: item.gi!.gl,
    })));

    totalGI = {
      gi: mealGI.gi,
      gl: mealGL.gl,
      giBand: mealGI.giBand,
      glBand: mealGL.glBand,
      source: 'exact' as const,
      confidence: 0.8,
    };
  }

  return {
    items: analyzedItems,
    mealType,
    totals,
    totalGI,
    userFocus,
    analyzedAt: new Date(),
    version: PIPELINE_VERSION,
  };
}

/**
 * Process a single food through GI and grading
 */
async function processFood(
  descriptor: NormalizedFoodDescriptor,
  nutrition: CompleteNutrition,
  source: string,
  confidence: number
): Promise<AnalyzedFoodV2> {
  // Lookup GI
  let giResult = undefined;
  if (hasRelevantGI(nutrition)) {
    giResult = lookupGI(descriptor.name, nutrition, descriptor.estimatedGrams);
  }

  // Enrich nutrition with GI
  const enrichedNutrition: EnrichedNutrition = {
    ...nutrition,
    gi: giResult?.gi,
    gl: giResult?.gl,
    giBand: giResult?.giBand,
    glBand: giResult?.glBand,
  };

  // Grade nutrition
  const grading = gradeNutritionWithGI(
    enrichedNutrition,
    descriptor.estimatedGrams,
    giResult,
    descriptor.foodType,
    descriptor.foodType === 'whole_food' && /juice|milk|tea|coffee|drink|soda/i.test(descriptor.name)
  );

  return {
    id: uuidv4(),
    name: descriptor.name,
    quantity: descriptor.quantity,
    unit: descriptor.unit,
    estimatedGrams: descriptor.estimatedGrams,
    foodType: descriptor.foodType,
    nutrition: enrichedNutrition,
    nutritionSource: source as AnalyzedFoodV2['nutritionSource'],
    nutritionConfidence: confidence,
    gi: giResult,
    grading,
    restaurantName: descriptor.restaurantName,
    brandName: descriptor.brandName,
    ingredients: descriptor.ingredients?.map(ing => ({
      name: ing.name,
      estimatedGrams: ing.estimatedGrams,
      nutrition: createEmptyNutrition(), // Would need separate resolution
      source: 'decomposed' as const,
    })),
  };
}

/**
 * Sum nutrition from multiple items
 */
function sumNutrition(nutritions: CompleteNutrition[]): CompleteNutrition {
  const total = createEmptyNutrition();

  for (const n of nutritions) {
    for (const key of Object.keys(total) as (keyof CompleteNutrition)[]) {
      const value = n[key];
      if (typeof value === 'number') {
        (total[key] as number) += value;
      }
    }
  }

  // Round the totals
  for (const key of Object.keys(total) as (keyof CompleteNutrition)[]) {
    const value = total[key];
    if (typeof value === 'number') {
      if (['calories', 'sodium', 'potassium', 'calcium', 'cholesterol', 'phosphorus', 'magnesium'].includes(key)) {
        (total[key] as number) = Math.round(value);
      } else {
        (total[key] as number) = Math.round(value * 10) / 10;
      }
    }
  }

  return total;
}

/**
 * Create empty nutrition object
 */
function createEmptyNutrition(): CompleteNutrition {
  return {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    saturatedFat: 0,
    transFat: 0,
    monounsaturatedFat: 0,
    polyunsaturatedFat: 0,
    cholesterol: 0,
    potassium: 0,
    calcium: 0,
    iron: 0,
    magnesium: 0,
    zinc: 0,
    phosphorus: 0,
    vitaminA: 0,
    vitaminD: 0,
    vitaminE: 0,
    vitaminK: 0,
    vitaminC: 0,
    thiamin: 0,
    riboflavin: 0,
    niacin: 0,
    vitaminB6: 0,
    folate: 0,
    vitaminB12: 0,
  };
}

/**
 * Analyze single food directly by name (for simple cases)
 */
export async function analyzeSingleFoodV2(
  foodName: string,
  quantity: number = 1,
  unit: string = 'serving',
  estimatedGrams: number = 100,
  options: AnalysisOptionsV2 = {}
): Promise<AnalyzedFoodV2> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const descriptor: NormalizedFoodDescriptor = {
    name: foodName,
    quantity,
    unit,
    estimatedGrams,
    foodType: 'whole_food', // Default
    confidence: 0.9,
  };

  const resolution = await resolveNutrition(descriptor);
  const analyzed = await processFood(descriptor, resolution.nutrition, resolution.source, resolution.confidence);

  // Generate insight if enabled
  if (opts.generateInsights) {
    const insightInput: InsightInput = {
      foodName: analyzed.name,
      servingDescription: `${analyzed.quantity} ${analyzed.unit}`,
      nutrition: analyzed.nutrition,
      gi: analyzed.gi,
      grading: analyzed.grading,
      userFocus: opts.userFocus,
    };
    analyzed.insight = await generateFoodInsight(insightInput);
  }

  return analyzed;
}
