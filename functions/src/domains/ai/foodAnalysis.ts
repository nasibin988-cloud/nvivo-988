/**
 * AI Food Analysis using OpenAI Vision
 * Analyzes food photos to estimate nutritional content
 * Supports tiered nutrition detail levels: essential, extended, complete
 */

import OpenAI from 'openai';
import { defineSecret } from 'firebase-functions/params';
import { OPENAI_CONFIG } from '../../config/openai';

// Define OpenAI API key as a secret (for production)
const openaiApiKey = defineSecret('OPENAI_API_KEY');

/**
 * Get API key from Firebase secret
 */
function getApiKey(): string {
  const secretValue = openaiApiKey.value();
  if (secretValue) {
    return secretValue;
  }
  throw new Error('OpenAI API key not configured');
}

/**
 * Nutrition detail level for AI analysis
 */
export type NutritionDetailLevel = 'essential' | 'extended' | 'complete';

/**
 * Essential nutrition fields (Tier 1)
 */
export interface EssentialNutritionFields {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

/**
 * Extended nutrition fields (Tier 2) - includes essential + these
 */
export interface ExtendedNutritionFields extends EssentialNutritionFields {
  saturatedFat: number;
  transFat: number;
  cholesterol: number;
  potassium: number;
  calcium: number;
  iron: number;
  magnesium: number;
}

/**
 * Complete nutrition fields (Tier 3) - includes extended + these
 */
export interface CompleteNutritionFields extends ExtendedNutritionFields {
  monounsaturatedFat?: number;
  polyunsaturatedFat?: number;
  vitaminA?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;
  vitaminC?: number;
  thiamin?: number;
  riboflavin?: number;
  niacin?: number;
  vitaminB6?: number;
  folate?: number;
  vitaminB12?: number;
  choline?: number;
  zinc?: number;
  phosphorus?: number;
  selenium?: number;
  copper?: number;
  manganese?: number;
  caffeine?: number;
  alcohol?: number;
  water?: number;
}

export interface AnalyzedFood extends Partial<CompleteNutritionFields> {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  confidence: number;
  servingMultiplier?: number;
}

export interface FoodAnalysisResult {
  items: AnalyzedFood[];
  detailLevel: NutritionDetailLevel;

  // Essential totals (always present)
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber?: number;
  totalSugar?: number;
  totalSodium?: number;

  // Extended totals (extended + complete)
  totalSaturatedFat?: number;
  totalTransFat?: number;
  totalCholesterol?: number;
  totalPotassium?: number;
  totalCalcium?: number;
  totalIron?: number;
  totalMagnesium?: number;
  totalZinc?: number;
  totalVitaminA?: number;
  totalVitaminC?: number;
  totalVitaminD?: number;

  // Complete totals (complete only)
  totalMonounsaturatedFat?: number;
  totalPolyunsaturatedFat?: number;
  totalVitaminE?: number;
  totalVitaminK?: number;
  totalThiamin?: number;
  totalRiboflavin?: number;
  totalNiacin?: number;
  totalVitaminB6?: number;
  totalFolate?: number;
  totalVitaminB12?: number;
  totalCholine?: number;
  totalPhosphorus?: number;
  totalSelenium?: number;
  totalCopper?: number;
  totalManganese?: number;
  totalCaffeine?: number;
  totalWater?: number;

  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'unknown';
}

// ============================================================================
// TIERED PROMPT GENERATION
// ============================================================================

/**
 * Generate JSON structure based on nutrition detail level
 */
function getJSONStructureForLevel(level: NutritionDetailLevel): string {
  const essential = `{
      "name": "Food Name",
      "quantity": 1,
      "unit": "serving size",
      "calories": 200,
      "protein": 10,
      "carbs": 25,
      "fat": 5,
      "fiber": 3,
      "sugar": 2,
      "sodium": 300,
      "servingMultiplier": 1.0,
      "confidence": 0.85
    }`;

  const extended = `{
      "name": "Food Name",
      "quantity": 1,
      "unit": "serving size",
      "calories": 200,
      "protein": 10,
      "carbs": 25,
      "fat": 5,
      "fiber": 3,
      "sugar": 2,
      "sodium": 300,
      "saturatedFat": 2,
      "transFat": 0,
      "cholesterol": 50,
      "potassium": 400,
      "calcium": 100,
      "iron": 2,
      "magnesium": 30,
      "servingMultiplier": 1.0,
      "confidence": 0.85
    }`;

  const complete = `{
      "name": "Food Name",
      "quantity": 1,
      "unit": "serving size",
      "calories": 200,
      "protein": 10,
      "carbs": 25,
      "fat": 5,
      "fiber": 3,
      "sugar": 2,
      "sodium": 300,
      "saturatedFat": 2,
      "transFat": 0,
      "cholesterol": 50,
      "potassium": 400,
      "calcium": 100,
      "iron": 2,
      "magnesium": 30,
      "monounsaturatedFat": 2,
      "polyunsaturatedFat": 1,
      "vitaminA": 100,
      "vitaminD": 2,
      "vitaminE": 1,
      "vitaminK": 10,
      "vitaminC": 15,
      "thiamin": 0.1,
      "riboflavin": 0.1,
      "niacin": 2,
      "vitaminB6": 0.2,
      "folate": 50,
      "vitaminB12": 1,
      "choline": 30,
      "zinc": 1,
      "phosphorus": 150,
      "selenium": 10,
      "copper": 0.1,
      "manganese": 0.2,
      "caffeine": 0,
      "alcohol": 0,
      "water": 50,
      "servingMultiplier": 1.0,
      "confidence": 0.85
    }`;

  switch (level) {
    case 'essential': return essential;
    case 'extended': return extended;
    case 'complete': return complete;
  }
}

/**
 * Generate nutrient request list based on level
 */
function getNutrientListForLevel(level: NutritionDetailLevel): string {
  const essential = `
1. Name of the food item
2. Estimated quantity and unit (e.g., "1 cup", "6 oz", "2 slices")
3. Calories (kcal)
4. Protein (g)
5. Carbohydrates (g)
6. Fat (g)
7. Fiber (g)
8. Sugar (g)
9. Sodium (mg)
10. Your confidence level (0-1) in the identification`;

  const extended = `
1. Name of the food item
2. Estimated quantity and unit (e.g., "1 cup", "6 oz", "2 slices")

MACRONUTRIENTS:
3. Calories (kcal)
4. Protein (g)
5. Carbohydrates (g)
6. Fat (g)
7. Fiber (g)
8. Sugar (g)
9. Sodium (mg)

FAT BREAKDOWN:
10. Saturated Fat (g)
11. Trans Fat (g)
12. Cholesterol (mg)

KEY MINERALS:
13. Potassium (mg)
14. Calcium (mg)
15. Iron (mg)
16. Magnesium (mg)

17. Your confidence level (0-1) in the identification`;

  const complete = `
1. Name of the food item
2. Estimated quantity and unit (e.g., "1 cup", "6 oz", "2 slices")

MACRONUTRIENTS:
3. Calories (kcal)
4. Protein (g)
5. Carbohydrates (g)
6. Fat (g)
7. Fiber (g)
8. Sugar (g)
9. Sodium (mg)

FAT BREAKDOWN:
10. Saturated Fat (g)
11. Trans Fat (g)
12. Cholesterol (mg)
13. Monounsaturated Fat (g)
14. Polyunsaturated Fat (g)

MINERALS:
15. Potassium (mg)
16. Calcium (mg)
17. Iron (mg)
18. Magnesium (mg)
19. Zinc (mg)
20. Phosphorus (mg)
21. Selenium (mcg)
22. Copper (mg)
23. Manganese (mg)

VITAMINS (Fat-soluble):
24. Vitamin A (mcg RAE)
25. Vitamin D (mcg)
26. Vitamin E (mg)
27. Vitamin K (mcg)

VITAMINS (Water-soluble):
28. Vitamin C (mg)
29. Thiamin/B1 (mg)
30. Riboflavin/B2 (mg)
31. Niacin/B3 (mg)
32. Vitamin B6 (mg)
33. Folate (mcg DFE)
34. Vitamin B12 (mcg)
35. Choline (mg)

OTHER:
36. Caffeine (mg) - if present
37. Alcohol (g) - if present
38. Water content (g)

39. Your confidence level (0-1) in the identification`;

  switch (level) {
    case 'essential': return essential;
    case 'extended': return extended;
    case 'complete': return complete;
  }
}

/**
 * Generate food analysis prompt based on nutrition detail level
 */
function getFoodAnalysisPrompt(level: NutritionDetailLevel): string {
  const levelDescriptions: Record<NutritionDetailLevel, string> = {
    essential: 'basic macronutrients',
    extended: 'macronutrients plus fat breakdown and key minerals',
    complete: 'comprehensive nutrition including all vitamins, minerals, and micronutrients',
  };

  return `You are a nutrition expert analyzing a food photo. Analyze this image and provide ${levelDescriptions[level]}.

For each food item you can identify, provide:
${getNutrientListForLevel(level)}

Also determine the meal type based on the foods present (breakfast, lunch, dinner, snack, or unknown).

Respond ONLY with a valid JSON object in this exact format:
{
  "items": [
    ${getJSONStructureForLevel(level)}
  ],
  "mealType": "lunch"
}

Be accurate with portion sizes and nutritional values based on USDA data. If you cannot identify a food item clearly, still make your best estimate but use a lower confidence score.`;
}

// Default prompt for backward compatibility (exported for testing/reference)
export const FOOD_ANALYSIS_PROMPT = getFoodAnalysisPrompt('essential');

/**
 * Parse a nutrition value with appropriate rounding
 */
function parseNutrientValue(value: unknown, decimals: number = 1): number | undefined {
  if (value === undefined || value === null) return undefined;
  const num = Number(value);
  if (isNaN(num)) return undefined;
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/**
 * Parse nutrition fields from API response based on detail level
 */
function parseNutritionFields(item: Record<string, unknown>, level: NutritionDetailLevel): Partial<CompleteNutritionFields> {
  const nutrition: Partial<CompleteNutritionFields> = {
    // Essential fields (always present)
    calories: Math.round(Number(item.calories) || 0),
    protein: parseNutrientValue(item.protein) || 0,
    carbs: parseNutrientValue(item.carbs) || 0,
    fat: parseNutrientValue(item.fat) || 0,
    fiber: parseNutrientValue(item.fiber) || 0,
    sugar: parseNutrientValue(item.sugar) || 0,
    sodium: Math.round(Number(item.sodium) || 0),
  };

  // Extended fields
  if (level === 'extended' || level === 'complete') {
    nutrition.saturatedFat = parseNutrientValue(item.saturatedFat) || 0;
    nutrition.transFat = parseNutrientValue(item.transFat) || 0;
    nutrition.cholesterol = Math.round(Number(item.cholesterol) || 0);
    nutrition.potassium = Math.round(Number(item.potassium) || 0);
    nutrition.calcium = Math.round(Number(item.calcium) || 0);
    nutrition.iron = parseNutrientValue(item.iron) || 0;
    nutrition.magnesium = Math.round(Number(item.magnesium) || 0);
  }

  // Complete fields
  if (level === 'complete') {
    // Fat details
    nutrition.monounsaturatedFat = parseNutrientValue(item.monounsaturatedFat);
    nutrition.polyunsaturatedFat = parseNutrientValue(item.polyunsaturatedFat);

    // Vitamins (fat-soluble)
    nutrition.vitaminA = parseNutrientValue(item.vitaminA);
    nutrition.vitaminD = parseNutrientValue(item.vitaminD);
    nutrition.vitaminE = parseNutrientValue(item.vitaminE);
    nutrition.vitaminK = parseNutrientValue(item.vitaminK);

    // Vitamins (water-soluble)
    nutrition.vitaminC = parseNutrientValue(item.vitaminC);
    nutrition.thiamin = parseNutrientValue(item.thiamin, 2);
    nutrition.riboflavin = parseNutrientValue(item.riboflavin, 2);
    nutrition.niacin = parseNutrientValue(item.niacin);
    nutrition.vitaminB6 = parseNutrientValue(item.vitaminB6, 2);
    nutrition.folate = parseNutrientValue(item.folate);
    nutrition.vitaminB12 = parseNutrientValue(item.vitaminB12, 2);
    nutrition.choline = parseNutrientValue(item.choline);

    // Trace minerals
    nutrition.zinc = parseNutrientValue(item.zinc);
    nutrition.phosphorus = parseNutrientValue(item.phosphorus);
    nutrition.selenium = parseNutrientValue(item.selenium);
    nutrition.copper = parseNutrientValue(item.copper, 2);
    nutrition.manganese = parseNutrientValue(item.manganese, 2);

    // Other
    nutrition.caffeine = parseNutrientValue(item.caffeine);
    nutrition.alcohol = parseNutrientValue(item.alcohol);
    nutrition.water = parseNutrientValue(item.water);
  }

  return nutrition;
}

/**
 * Essential totals type (always required)
 */
interface EssentialTotals {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
}

/**
 * Calculate all tier-appropriate totals from food items
 */
function calculateTotals(items: AnalyzedFood[], detailLevel: NutritionDetailLevel): EssentialTotals & Partial<Omit<FoodAnalysisResult, keyof EssentialTotals | 'items' | 'mealType' | 'detailLevel'>> {
  const round = (n: number, decimals: number = 1): number => {
    const factor = Math.pow(10, decimals);
    return Math.round(n * factor) / factor;
  };

  // Essential totals (always calculated)
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalSugar = 0;
  let totalSodium = 0;

  // Extended totals
  let totalSaturatedFat = 0;
  let totalTransFat = 0;
  let totalCholesterol = 0;
  let totalPotassium = 0;
  let totalCalcium = 0;
  let totalIron = 0;
  let totalMagnesium = 0;
  let totalZinc = 0;
  let totalVitaminA = 0;
  let totalVitaminC = 0;
  let totalVitaminD = 0;

  // Complete totals
  let totalMonounsaturatedFat = 0;
  let totalPolyunsaturatedFat = 0;
  let totalVitaminE = 0;
  let totalVitaminK = 0;
  let totalThiamin = 0;
  let totalRiboflavin = 0;
  let totalNiacin = 0;
  let totalVitaminB6 = 0;
  let totalFolate = 0;
  let totalVitaminB12 = 0;
  let totalCholine = 0;
  let totalPhosphorus = 0;
  let totalSelenium = 0;
  let totalCopper = 0;
  let totalManganese = 0;
  let totalCaffeine = 0;
  let totalWater = 0;

  for (const item of items) {
    // Essential
    totalCalories += item.calories || 0;
    totalProtein += item.protein || 0;
    totalCarbs += item.carbs || 0;
    totalFat += item.fat || 0;
    totalFiber += item.fiber || 0;
    totalSugar += item.sugar || 0;
    totalSodium += item.sodium || 0;

    // Extended
    if (detailLevel === 'extended' || detailLevel === 'complete') {
      totalSaturatedFat += item.saturatedFat || 0;
      totalTransFat += item.transFat || 0;
      totalCholesterol += item.cholesterol || 0;
      totalPotassium += item.potassium || 0;
      totalCalcium += item.calcium || 0;
      totalIron += item.iron || 0;
      totalMagnesium += item.magnesium || 0;
      totalZinc += item.zinc || 0;
      totalVitaminA += item.vitaminA || 0;
      totalVitaminC += item.vitaminC || 0;
      totalVitaminD += item.vitaminD || 0;
    }

    // Complete
    if (detailLevel === 'complete') {
      totalMonounsaturatedFat += item.monounsaturatedFat || 0;
      totalPolyunsaturatedFat += item.polyunsaturatedFat || 0;
      totalVitaminE += item.vitaminE || 0;
      totalVitaminK += item.vitaminK || 0;
      totalThiamin += item.thiamin || 0;
      totalRiboflavin += item.riboflavin || 0;
      totalNiacin += item.niacin || 0;
      totalVitaminB6 += item.vitaminB6 || 0;
      totalFolate += item.folate || 0;
      totalVitaminB12 += item.vitaminB12 || 0;
      totalCholine += item.choline || 0;
      totalPhosphorus += item.phosphorus || 0;
      totalSelenium += item.selenium || 0;
      totalCopper += item.copper || 0;
      totalManganese += item.manganese || 0;
      totalCaffeine += item.caffeine || 0;
      totalWater += item.water || 0;
    }
  }

  // Build result - essential totals are always present
  const essential: EssentialTotals = {
    totalCalories: Math.round(totalCalories),
    totalProtein: round(totalProtein),
    totalCarbs: round(totalCarbs),
    totalFat: round(totalFat),
    totalFiber: round(totalFiber),
    totalSugar: round(totalSugar),
    totalSodium: Math.round(totalSodium),
  };

  // Extended totals (optional)
  const extended: Partial<FoodAnalysisResult> = {};
  if (detailLevel === 'extended' || detailLevel === 'complete') {
    extended.totalSaturatedFat = round(totalSaturatedFat);
    extended.totalTransFat = round(totalTransFat);
    extended.totalCholesterol = Math.round(totalCholesterol);
    extended.totalPotassium = Math.round(totalPotassium);
    extended.totalCalcium = Math.round(totalCalcium);
    extended.totalIron = round(totalIron);
    extended.totalMagnesium = Math.round(totalMagnesium);
    extended.totalZinc = round(totalZinc);
    extended.totalVitaminA = round(totalVitaminA);
    extended.totalVitaminC = round(totalVitaminC);
    extended.totalVitaminD = round(totalVitaminD);
  }

  // Complete totals (optional)
  const complete: Partial<FoodAnalysisResult> = {};
  if (detailLevel === 'complete') {
    complete.totalMonounsaturatedFat = round(totalMonounsaturatedFat);
    complete.totalPolyunsaturatedFat = round(totalPolyunsaturatedFat);
    complete.totalVitaminE = round(totalVitaminE);
    complete.totalVitaminK = round(totalVitaminK);
    complete.totalThiamin = round(totalThiamin, 2);
    complete.totalRiboflavin = round(totalRiboflavin, 2);
    complete.totalNiacin = round(totalNiacin);
    complete.totalVitaminB6 = round(totalVitaminB6, 2);
    complete.totalFolate = round(totalFolate);
    complete.totalVitaminB12 = round(totalVitaminB12, 2);
    complete.totalCholine = round(totalCholine);
    complete.totalPhosphorus = Math.round(totalPhosphorus);
    complete.totalSelenium = round(totalSelenium);
    complete.totalCopper = round(totalCopper, 2);
    complete.totalManganese = round(totalManganese, 2);
    complete.totalCaffeine = round(totalCaffeine);
    complete.totalWater = round(totalWater);
  }

  return { ...essential, ...extended, ...complete };
}

/**
 * Analyze a food photo using GPT-4 Vision
 * @param imageBase64 - Base64 encoded image
 * @param detailLevel - Nutrition detail level (essential, extended, complete)
 */
export async function analyzeFoodPhoto(
  imageBase64: string,
  detailLevel: NutritionDetailLevel = 'essential'
): Promise<FoodAnalysisResult> {
  // Get the API key (env var for local, secret for production)
  const apiKey = getApiKey();

  const openai = new OpenAI({
    apiKey,
  });

  // Use tiered prompt based on detail level
  const prompt = getFoodAnalysisPrompt(detailLevel);

  // Increase token limit for complete analysis
  const maxTokens = detailLevel === 'complete' ? 2000 : detailLevel === 'extended' ? 1500 : 1000;

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_CONFIG.vision.model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_completion_tokens: maxTokens,
      temperature: 0.3, // Lower temperature for more consistent results
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and transform the response with full nutrition fields
    const items: AnalyzedFood[] = (parsed.items || []).map((item: Record<string, unknown>) => {
      const nutritionFields = parseNutritionFields(item, detailLevel);

      return {
        name: String(item.name || 'Unknown food'),
        quantity: Number(item.quantity) || 1,
        unit: String(item.unit || 'serving'),
        ...nutritionFields,
        servingMultiplier: Number(item.servingMultiplier) || 1,
        confidence: Math.min(1, Math.max(0, Number(item.confidence) || 0.5)),
      };
    });

    // Calculate all tier-appropriate totals
    const totals = calculateTotals(items, detailLevel);

    const mealType = ['breakfast', 'lunch', 'dinner', 'snack'].includes(parsed.mealType)
      ? parsed.mealType
      : 'unknown';

    return {
      items,
      detailLevel,
      ...totals,
      mealType,
    };
  } catch (error) {
    console.error('Food analysis error:', error);
    throw error;
  }
}

/**
 * Generate text-based food analysis prompt based on nutrition detail level
 */
function getTextFoodAnalysisPrompt(level: NutritionDetailLevel): string {
  const levelDescriptions: Record<NutritionDetailLevel, string> = {
    essential: 'basic macronutrients',
    extended: 'macronutrients plus fat breakdown and key minerals',
    complete: 'comprehensive nutrition including all vitamins, minerals, and micronutrients',
  };

  return `You are a nutrition expert. Analyze the following food description and provide ${levelDescriptions[level]}.

For each food item in the description, provide:
${getNutrientListForLevel(level)}

Use typical/average portion sizes that people commonly eat:
- A typical breakfast egg = 1 large egg
- A typical slice of bread = 1 slice (about 30g)
- A typical serving of pasta = 1 cup cooked
- A typical chicken breast = 6 oz
- A typical bowl of rice = 1 cup cooked
- etc.

Respond ONLY with a valid JSON object in this exact format:
{
  "items": [
    ${getJSONStructureForLevel(level)}
  ],
  "mealType": "lunch",
  "description": "Brief description of the meal"
}

Be accurate with nutritional values based on USDA data when possible. If quantities are specified in the input, use those instead of typical portions.`;
}

// Default text prompt for backward compatibility (exported for testing/reference)
export const TEXT_FOOD_ANALYSIS_PROMPT = getTextFoodAnalysisPrompt('essential');

/**
 * Analyze a text description of food using GPT
 * @param foodDescription - Text description of food
 * @param detailLevel - Nutrition detail level (essential, extended, complete)
 */
export async function analyzeFoodText(
  foodDescription: string,
  detailLevel: NutritionDetailLevel = 'essential'
): Promise<FoodAnalysisResult & { description?: string }> {
  const apiKey = getApiKey();

  const openai = new OpenAI({
    apiKey,
  });

  // Use tiered prompt based on detail level
  const prompt = getTextFoodAnalysisPrompt(detailLevel);

  // Increase token limit for complete analysis
  const maxTokens = detailLevel === 'complete' ? 2000 : detailLevel === 'extended' ? 1500 : 1000;

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_CONFIG.vision.model, // Use same model for consistency
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: `Analyze this food: ${foodDescription}`,
        },
      ],
      max_completion_tokens: maxTokens,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and transform the response with full nutrition fields
    const items: AnalyzedFood[] = (parsed.items || []).map((item: Record<string, unknown>) => {
      const nutritionFields = parseNutritionFields(item, detailLevel);

      return {
        name: String(item.name || 'Unknown food'),
        quantity: Number(item.quantity) || 1,
        unit: String(item.unit || 'serving'),
        ...nutritionFields,
        servingMultiplier: Number(item.servingMultiplier) || 1,
        confidence: Math.min(1, Math.max(0, Number(item.confidence) || 0.8)),
      };
    });

    // Calculate all tier-appropriate totals
    const totals = calculateTotals(items, detailLevel);

    const mealType = ['breakfast', 'lunch', 'dinner', 'snack'].includes(parsed.mealType)
      ? parsed.mealType
      : 'unknown';

    return {
      items,
      detailLevel,
      ...totals,
      mealType,
      description: parsed.description || foodDescription,
    };
  } catch (error) {
    console.error('Text food analysis error:', error);
    throw error;
  }
}

// Export the secret for use in the Cloud Function
export { openaiApiKey };
