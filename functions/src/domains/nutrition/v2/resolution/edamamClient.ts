/**
 * Edamam Food Database API Client
 *
 * Paid API (~$0.00014/call) with 130K+ restaurant items.
 * Best for restaurant food and branded items.
 * https://developer.edamam.com/food-database-api
 */

import { defineSecret } from 'firebase-functions/params';
import type { CompleteNutrition } from '../types';

const edamamAppId = defineSecret('EDAMAM_APP_ID');
const edamamAppKey = defineSecret('EDAMAM_APP_KEY');

const EDAMAM_BASE_URL = 'https://api.edamam.com/api/food-database/v2';

// Edamam nutrient code mapping
const EDAMAM_NUTRIENT_MAP: Record<string, keyof CompleteNutrition> = {
  ENERC_KCAL: 'calories',
  PROCNT: 'protein',
  CHOCDF: 'carbs',
  FAT: 'fat',
  FIBTG: 'fiber',
  SUGAR: 'sugar',
  NA: 'sodium',
  FASAT: 'saturatedFat',
  FATRN: 'transFat',
  FAMS: 'monounsaturatedFat',
  FAPU: 'polyunsaturatedFat',
  CHOLE: 'cholesterol',
  K: 'potassium',
  CA: 'calcium',
  FE: 'iron',
  MG: 'magnesium',
  ZN: 'zinc',
  P: 'phosphorus',
  VITA_RAE: 'vitaminA',
  VITD: 'vitaminD',
  TOCPHA: 'vitaminE',
  VITK1: 'vitaminK',
  VITC: 'vitaminC',
  THIA: 'thiamin',
  RIBF: 'riboflavin',
  NIA: 'niacin',
  VITB6A: 'vitaminB6',
  FOLDFE: 'folate',
  VITB12: 'vitaminB12',
};

export interface EdamamSearchResult {
  nutrition: CompleteNutrition;
  confidence: number;
  foodId: string;
  label: string;
  servingGrams: number;
  category?: string;
}

interface EdamamFood {
  foodId: string;
  label: string;
  nutrients: Record<string, number>;
  category?: string;
  categoryLabel?: string;
  brand?: string;
  servingSizes?: { uri: string; label: string; quantity: number }[];
}

interface EdamamMeasure {
  uri: string;
  label: string;
  weight: number;
}

interface EdamamParsedItem {
  food: EdamamFood;
  quantity: number;
  measure: EdamamMeasure;
}

interface EdamamHint {
  food: EdamamFood;
  measures: EdamamMeasure[];
}

interface EdamamParserResponse {
  parsed: EdamamParsedItem[];
  hints: EdamamHint[];
}

/**
 * Get Edamam credentials
 */
function getCredentials(): { appId: string; appKey: string } {
  const appId = edamamAppId.value();
  const appKey = edamamAppKey.value();

  if (!appId || !appKey) {
    throw new Error('Edamam credentials not configured');
  }

  return { appId, appKey };
}

/**
 * Search Edamam for a food item
 */
export async function searchEdamam(query: string): Promise<EdamamSearchResult | null> {
  console.log('Edamam search for:', query);
  const { appId, appKey } = getCredentials();

  try {
    const url = `${EDAMAM_BASE_URL}/parser?ingr=${encodeURIComponent(query)}&app_id=${appId}&app_key=${appKey}`;
    console.log('Edamam URL:', url.replace(appKey, '***'));
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Edamam API error: ${response.status}`);
      return null;
    }

    const data = await response.json() as EdamamParserResponse;

    // Prefer parsed results (exact matches) over hints (fuzzy)
    if (data.parsed && data.parsed.length > 0) {
      const parsed = data.parsed[0];
      const nutrition = mapEdamamToNutrition(parsed.food.nutrients);
      const servingGrams = parsed.measure?.weight || 100;

      return {
        nutrition: scaleNutrition(nutrition, servingGrams),
        confidence: 0.95,
        foodId: parsed.food.foodId,
        label: parsed.food.label,
        servingGrams,
        category: parsed.food.categoryLabel,
      };
    }

    // Fall back to hints
    if (data.hints && data.hints.length > 0) {
      const hint = data.hints[0];
      const nutrition = mapEdamamToNutrition(hint.food.nutrients);

      // Try to find a reasonable serving size
      const serving = hint.measures?.find(m =>
        m.label.toLowerCase().includes('serving') ||
        m.label.toLowerCase().includes('cup') ||
        m.label.toLowerCase().includes('piece')
      ) || hint.measures?.[0];

      const servingGrams = serving?.weight || 100;

      return {
        nutrition: scaleNutrition(nutrition, servingGrams),
        confidence: 0.80,
        foodId: hint.food.foodId,
        label: hint.food.label,
        servingGrams,
        category: hint.food.categoryLabel,
      };
    }

    return null;
  } catch (error) {
    console.error('Edamam search error:', error);
    return null;
  }
}

/**
 * Search specifically for restaurant items
 */
export async function searchEdamamRestaurant(
  query: string,
  restaurantName?: string
): Promise<EdamamSearchResult | null> {
  // Combine restaurant name with query for better matches
  const searchQuery = restaurantName
    ? `${restaurantName} ${query}`
    : query;

  const result = await searchEdamam(searchQuery);

  // If no result with restaurant name, try without
  if (!result && restaurantName) {
    return searchEdamam(query);
  }

  return result;
}

/**
 * Get nutrition for a specific food ID with measure
 */
export async function getNutritionByFoodId(
  foodId: string,
  measureUri?: string,
  quantity: number = 1
): Promise<EdamamSearchResult | null> {
  const { appId, appKey } = getCredentials();

  try {
    const response = await fetch(`${EDAMAM_BASE_URL}/nutrients?app_id=${appId}&app_key=${appKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ingredients: [{
          quantity,
          measureURI: measureUri || 'http://www.edamam.com/ontologies/edamam.owl#Measure_gram',
          foodId,
        }],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const nutrition = mapEdamamToNutrition(data.totalNutrients);

    return {
      nutrition,
      confidence: 0.95,
      foodId,
      label: data.ingredients?.[0]?.parsed?.[0]?.food || 'Unknown',
      servingGrams: data.totalWeight || 100,
    };
  } catch (error) {
    console.error('Edamam nutrient lookup error:', error);
    return null;
  }
}

/**
 * Batch search multiple foods
 */
export async function batchSearchEdamam(queries: string[]): Promise<Map<string, EdamamSearchResult>> {
  // Edamam doesn't have a true batch API, so we parallelize individual requests
  // But we limit concurrency to avoid rate limits
  const CONCURRENCY = 3;
  const results = new Map<string, EdamamSearchResult>();

  for (let i = 0; i < queries.length; i += CONCURRENCY) {
    const batch = queries.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (query) => {
        const result = await searchEdamam(query);
        return { query, result };
      })
    );

    for (const { query, result } of batchResults) {
      if (result && result.confidence >= 0.7) {
        results.set(query.toLowerCase(), result);
      }
    }
  }

  return results;
}

/**
 * Map Edamam nutrients to our format
 * Edamam returns nutrients as { NUTRIENT_CODE: { quantity: number, unit: string } }
 */
function mapEdamamToNutrition(
  nutrients: Record<string, number | { quantity: number; unit: string }>
): CompleteNutrition {
  const nutrition: CompleteNutrition = {
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

  for (const [code, value] of Object.entries(nutrients)) {
    const key = EDAMAM_NUTRIENT_MAP[code];
    if (key && key in nutrition) {
      const numValue = typeof value === 'number' ? value : value?.quantity || 0;
      (nutrition[key] as number) = roundNutrient(numValue, key);
    }
  }

  return nutrition;
}

/**
 * Scale nutrition to actual serving
 */
function scaleNutrition(nutrition: CompleteNutrition, servingGrams: number): CompleteNutrition {
  // Edamam returns per serving already if measure is used, or per 100g
  // We return as-is since it's already scaled
  return nutrition;
}

/**
 * Round nutrient appropriately
 */
function roundNutrient(value: number, key: keyof CompleteNutrition): number {
  if (['calories', 'sodium', 'potassium', 'calcium', 'cholesterol', 'phosphorus', 'magnesium'].includes(key)) {
    return Math.round(value);
  }
  if (['thiamin', 'riboflavin', 'vitaminB6', 'vitaminB12', 'vitaminD', 'vitaminK'].includes(key)) {
    return Math.round(value * 100) / 100;
  }
  return Math.round(value * 10) / 10;
}

// Export secrets for Cloud Function access
export { edamamAppId, edamamAppKey };
