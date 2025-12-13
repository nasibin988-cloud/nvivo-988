/**
 * OpenFoodFacts API Client
 *
 * Free, open-source database with 3M+ packaged products.
 * Best for branded/packaged foods (macros accurate from labels, micros incomplete).
 * https://world.openfoodfacts.org/data
 */

import type { CompleteNutrition, OFFProduct, OFFNutriments } from '../types';

const OFF_BASE_URL = 'https://world.openfoodfacts.org';

export interface OFFSearchResult {
  nutrition: Partial<CompleteNutrition>;
  confidence: number;
  barcode?: string;
  productName: string;
  servingGrams: number;
  brand?: string;
  /** Nutrients that are reliably from the label */
  reliableNutrients: (keyof CompleteNutrition)[];
}

interface OFFSearchResponse {
  count: number;
  products: OFFProduct[];
}

/**
 * Search OpenFoodFacts by product name
 */
export async function searchOpenFoodFacts(query: string): Promise<OFFSearchResult | null> {
  try {
    const url = `${OFF_BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=5&fields=code,product_name,brands,nutriments,serving_size,serving_quantity`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NvivoHealthApp/1.0 (contact@nvivo.health)',
      },
    });

    if (!response.ok) {
      console.error(`OpenFoodFacts API error: ${response.status}`);
      return null;
    }

    const data = await response.json() as OFFSearchResponse;

    if (!data.products || data.products.length === 0) {
      return null;
    }

    // Find best match
    const best = findBestMatch(query, data.products);
    if (!best) return null;

    const { nutrition, reliableNutrients } = mapOFFToNutrition(best.nutriments);
    const servingGrams = best.serving_quantity || 100;
    const confidence = calculateConfidence(query, best.product_name);

    return {
      nutrition: scaleNutrition(nutrition, servingGrams),
      confidence,
      barcode: best.code,
      productName: best.product_name,
      servingGrams,
      brand: best.brands,
      reliableNutrients,
    };
  } catch (error) {
    console.error('OpenFoodFacts search error:', error);
    return null;
  }
}

/**
 * Get product by barcode (most accurate)
 */
export async function getByBarcode(barcode: string): Promise<OFFSearchResult | null> {
  try {
    const url = `${OFF_BASE_URL}/api/v0/product/${barcode}.json`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NvivoHealthApp/1.0 (contact@nvivo.health)',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.status !== 1 || !data.product) {
      return null;
    }

    const product = data.product as OFFProduct;
    const { nutrition, reliableNutrients } = mapOFFToNutrition(product.nutriments);
    const servingGrams = product.serving_quantity || 100;

    return {
      nutrition: scaleNutrition(nutrition, servingGrams),
      confidence: 0.95,
      barcode,
      productName: product.product_name,
      servingGrams,
      reliableNutrients,
    };
  } catch (error) {
    console.error('OpenFoodFacts barcode lookup error:', error);
    return null;
  }
}

/**
 * Batch search multiple products
 */
export async function batchSearchOFF(queries: string[]): Promise<Map<string, OFFSearchResult>> {
  // OpenFoodFacts doesn't have batch API, parallelize with rate limiting
  const CONCURRENCY = 2; // OFF has stricter rate limits
  const results = new Map<string, OFFSearchResult>();

  for (let i = 0; i < queries.length; i += CONCURRENCY) {
    const batch = queries.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (query) => {
        const result = await searchOpenFoodFacts(query);
        return { query, result };
      })
    );

    for (const { query, result } of batchResults) {
      if (result && result.confidence >= 0.7) {
        results.set(query.toLowerCase(), result);
      }
    }

    // Small delay between batches for rate limiting
    if (i + CONCURRENCY < queries.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return results;
}

/**
 * Find best matching product from search results
 */
function findBestMatch(query: string, products: OFFProduct[]): OFFProduct | null {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);

  let bestMatch: OFFProduct | null = null;
  let bestScore = 0;

  for (const product of products) {
    if (!product.product_name || !product.nutriments) continue;

    const nameLower = product.product_name.toLowerCase();

    // Exact match
    if (nameLower === queryLower) {
      return product;
    }

    // Word overlap scoring
    const nameWords = nameLower.split(/[\s,]+/);
    let matching = 0;
    for (const qw of queryWords) {
      if (nameWords.some(nw => nw.includes(qw) || qw.includes(nw))) {
        matching++;
      }
    }

    const score = matching / Math.max(queryWords.length, nameWords.length);

    // Prefer products with more complete nutrition data
    const nutrientCount = Object.keys(product.nutriments).length;
    const completenessBonus = Math.min(0.1, nutrientCount * 0.005);

    if (score + completenessBonus > bestScore) {
      bestScore = score + completenessBonus;
      bestMatch = product;
    }
  }

  return bestScore >= 0.3 ? bestMatch : null;
}

/**
 * Map OpenFoodFacts nutrients to our format
 * OFF uses _100g suffix for per 100g values
 *
 * Returns both nutrition and list of reliable nutrients (from label)
 */
function mapOFFToNutrition(
  nutriments: OFFNutriments
): { nutrition: Partial<CompleteNutrition>; reliableNutrients: (keyof CompleteNutrition)[] } {
  const nutrition: Partial<CompleteNutrition> = {};
  const reliableNutrients: (keyof CompleteNutrition)[] = [];

  // Macros - always reliable from labels
  if (nutriments.energy_kcal_100g !== undefined) {
    nutrition.calories = Math.round(nutriments.energy_kcal_100g);
    reliableNutrients.push('calories');
  }
  if (nutriments.proteins_100g !== undefined) {
    nutrition.protein = round1(nutriments.proteins_100g);
    reliableNutrients.push('protein');
  }
  if (nutriments.carbohydrates_100g !== undefined) {
    nutrition.carbs = round1(nutriments.carbohydrates_100g);
    reliableNutrients.push('carbs');
  }
  if (nutriments.fat_100g !== undefined) {
    nutrition.fat = round1(nutriments.fat_100g);
    reliableNutrients.push('fat');
  }
  if (nutriments.fiber_100g !== undefined) {
    nutrition.fiber = round1(nutriments.fiber_100g);
    reliableNutrients.push('fiber');
  }
  if (nutriments.sugars_100g !== undefined) {
    nutrition.sugar = round1(nutriments.sugars_100g);
    reliableNutrients.push('sugar');
  }
  if (nutriments.sodium_100g !== undefined) {
    // OFF stores sodium in g, we want mg
    nutrition.sodium = Math.round(nutriments.sodium_100g * 1000);
    reliableNutrients.push('sodium');
  }

  // Fat breakdown - often on labels
  if (nutriments['saturated-fat_100g'] !== undefined) {
    nutrition.saturatedFat = round1(nutriments['saturated-fat_100g']);
    reliableNutrients.push('saturatedFat');
  }
  if (nutriments['trans-fat_100g'] !== undefined) {
    nutrition.transFat = round1(nutriments['trans-fat_100g']);
    reliableNutrients.push('transFat');
  }

  // Cholesterol - sometimes on labels
  if (nutriments.cholesterol_100g !== undefined) {
    nutrition.cholesterol = Math.round(nutriments.cholesterol_100g * 1000); // g to mg
    reliableNutrients.push('cholesterol');
  }

  // Potassium - sometimes on labels
  if (nutriments.potassium_100g !== undefined) {
    nutrition.potassium = Math.round(nutriments.potassium_100g * 1000); // g to mg
    reliableNutrients.push('potassium');
  }

  // Calcium - sometimes on labels
  if (nutriments.calcium_100g !== undefined) {
    nutrition.calcium = Math.round(nutriments.calcium_100g * 1000); // g to mg
    reliableNutrients.push('calcium');
  }

  // Iron - sometimes on labels
  if (nutriments.iron_100g !== undefined) {
    nutrition.iron = round1(nutriments.iron_100g * 1000); // g to mg
    reliableNutrients.push('iron');
  }

  // Vitamin D - often on labels now
  if (nutriments['vitamin-d_100g'] !== undefined) {
    nutrition.vitaminD = round2(nutriments['vitamin-d_100g'] * 1000000); // g to mcg
    reliableNutrients.push('vitaminD');
  }

  return { nutrition, reliableNutrients };
}

/**
 * Scale nutrition (OFF is per 100g, scale to serving)
 */
function scaleNutrition(
  nutrition: Partial<CompleteNutrition>,
  servingGrams: number
): Partial<CompleteNutrition> {
  if (servingGrams === 100) return nutrition;

  const scale = servingGrams / 100;
  const scaled: Partial<CompleteNutrition> = {};

  for (const [key, value] of Object.entries(nutrition)) {
    if (typeof value === 'number') {
      const k = key as keyof CompleteNutrition;
      if (['calories', 'sodium', 'potassium', 'calcium', 'cholesterol', 'phosphorus', 'magnesium'].includes(k)) {
        (scaled as Record<string, number>)[k] = Math.round(value * scale);
      } else {
        (scaled as Record<string, number>)[k] = round1(value * scale);
      }
    }
  }

  return scaled;
}

/**
 * Calculate confidence in the match
 */
function calculateConfidence(query: string, productName: string): number {
  const qLower = query.toLowerCase();
  const pLower = productName.toLowerCase();

  if (pLower === qLower) return 0.95;
  if (pLower.includes(qLower) || qLower.includes(pLower)) return 0.88;

  const qWords = qLower.split(/\s+/);
  const pWords = pLower.split(/[\s,]+/);

  let matching = 0;
  for (const qw of qWords) {
    if (pWords.some(pw => pw === qw)) matching++;
  }

  return Math.min(0.85, 0.6 + (matching / qWords.length) * 0.25);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
