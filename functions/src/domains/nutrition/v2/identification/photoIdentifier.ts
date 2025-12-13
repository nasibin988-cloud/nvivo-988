/**
 * Photo Food Identification
 *
 * Uses GPT-5.1 vision to identify foods in photos.
 * AI ONLY identifies foods - does NOT estimate nutrition.
 * Nutrition comes from resolution layer (databases).
 */

import OpenAI from 'openai';
import { defineSecret } from 'firebase-functions/params';
import { OPENAI_MODEL } from '../../../../config/openai';
import type { NormalizedFoodDescriptor, FoodType } from '../types';

// Define secret for lazy access at runtime
const openaiApiKey = defineSecret('OPENAI_API_KEY');

// Lazy-initialized OpenAI client (only created when needed at runtime)
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = openaiApiKey.value();
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY secret is not configured');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// Export the secret for Cloud Function registration
export { openaiApiKey as photoIdOpenaiApiKey };

/**
 * System prompt for photo food identification
 * Strictly focused on identification - no nutrition estimation
 */
const PHOTO_ID_SYSTEM_PROMPT = `You are a food identification expert. Your task is to identify foods in photos.

IMPORTANT RULES:
1. ONLY identify what you see - do NOT estimate nutrition values
2. For each food item, provide:
   - Name (specific, searchable name)
   - Estimated quantity and unit
   - Estimated weight in grams
   - Food type classification
   - Brand name if visible
   - Restaurant name if identifiable
   - Ingredient breakdown for composite dishes

FOOD TYPE CLASSIFICATIONS:
- whole_food: Single natural ingredients (apple, chicken breast, rice)
- restaurant_item: Restaurant/fast food items (Big Mac, Chipotle Burrito)
- branded_packaged: Branded packaged foods (KIND bar, Cheerios)
- homemade_dish: Home-cooked composite dishes (homemade chicken soup)
- generic_dish: Generic prepared foods without brand (cheeseburger, pasta)

PORTION ESTIMATION GUIDELINES:
- Use visual cues (plate size, utensils, hands) for scale
- A standard dinner plate is ~10 inches (25cm)
- A closed fist ≈ 1 cup ≈ 200ml
- A palm ≈ 3oz (85g) of meat
- A thumb tip ≈ 1 teaspoon
- If unsure, estimate conservatively

OUTPUT FORMAT:
Return a JSON array of identified foods. Each item should have:
{
  "name": "specific searchable food name",
  "quantity": number,
  "unit": "serving unit",
  "estimatedGrams": number,
  "foodType": "whole_food" | "restaurant_item" | "branded_packaged" | "homemade_dish" | "generic_dish",
  "restaurantName": "if identifiable" or null,
  "brandName": "if visible" or null,
  "cuisineType": "cuisine type if relevant" or null,
  "ingredients": [{"name": "ingredient", "estimatedGrams": number}] for composite dishes or null,
  "confidence": 0.0-1.0
}`;

/**
 * User prompt template
 */
const PHOTO_ID_USER_PROMPT = `Identify all food items in this photo. Be specific with food names (e.g., "grilled chicken breast" not just "chicken"). For composite dishes, break down visible ingredients. Return only valid JSON array.`;

interface PhotoIdentificationResult {
  items: NormalizedFoodDescriptor[];
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'unknown';
  imageConfidence: number;
  rawResponse: string;
}

/**
 * Identify foods in a photo
 */
export async function identifyFoodsFromPhoto(
  imageBase64: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg'
): Promise<PhotoIdentificationResult> {
  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      max_completion_tokens: 2000,
      temperature: 0.1, // Low temperature for consistent identification
      messages: [
        {
          role: 'system',
          content: PHOTO_ID_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: PHOTO_ID_USER_PROMPT,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
                detail: 'high', // Use high detail for better food identification
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    });

    const rawResponse = response.choices[0]?.message?.content || '{"items": []}';
    console.log('OpenAI raw response:', rawResponse.substring(0, 500));

    // Parse the JSON response
    const parsed = JSON.parse(rawResponse);
    console.log('Parsed keys:', Object.keys(parsed));
    // OpenAI may return 'items' or 'foods' array
    const rawItems = Array.isArray(parsed) ? parsed : (parsed.items || parsed.foods || []);
    console.log('Raw items count:', rawItems.length);

    // Transform to NormalizedFoodDescriptor format
    const items: NormalizedFoodDescriptor[] = rawItems.map((item: RawFoodItem) => ({
      name: item.name || 'Unknown food',
      quantity: item.quantity || 1,
      unit: item.unit || 'serving',
      estimatedGrams: item.estimatedGrams || item.estimated_grams || 100,
      foodType: validateFoodType(item.foodType || item.food_type),
      restaurantName: item.restaurantName || item.restaurant_name || undefined,
      brandName: item.brandName || item.brand_name || undefined,
      cuisineType: item.cuisineType || item.cuisine_type || undefined,
      mealType: inferMealType(rawItems),
      ingredients: item.ingredients?.map((ing: { name: string; estimatedGrams?: number; estimated_grams?: number }) => ({
        name: ing.name,
        estimatedGrams: ing.estimatedGrams || ing.estimated_grams || 50,
      })),
      confidence: item.confidence || 0.8,
    }));

    return {
      items,
      mealType: inferMealType(rawItems),
      imageConfidence: calculateImageConfidence(items),
      rawResponse,
    };
  } catch (error) {
    console.error('Photo identification error:', error);
    throw new Error('Failed to identify foods in photo');
  }
}

// Raw food item from AI response (with possible snake_case)
interface RawFoodItem {
  name?: string;
  quantity?: number;
  unit?: string;
  estimatedGrams?: number;
  estimated_grams?: number;
  foodType?: string;
  food_type?: string;
  restaurantName?: string;
  restaurant_name?: string;
  brandName?: string;
  brand_name?: string;
  cuisineType?: string;
  cuisine_type?: string;
  ingredients?: Array<{
    name: string;
    estimatedGrams?: number;
    estimated_grams?: number;
  }>;
  confidence?: number;
}

/**
 * Validate and normalize food type
 */
function validateFoodType(type: string | undefined): FoodType {
  const validTypes: FoodType[] = [
    'whole_food',
    'restaurant_item',
    'branded_packaged',
    'homemade_dish',
    'generic_dish',
  ];

  if (type && validTypes.includes(type as FoodType)) {
    return type as FoodType;
  }

  return 'generic_dish'; // Default
}

/**
 * Infer meal type from foods identified
 */
function inferMealType(items: RawFoodItem[]): 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'unknown' {
  const names = items.map(item => (item.name || '').toLowerCase()).join(' ');

  // Breakfast indicators
  if (/breakfast|egg|bacon|pancake|waffle|cereal|oatmeal|toast|bagel|coffee|orange juice/i.test(names)) {
    return 'breakfast';
  }

  // Lunch indicators
  if (/sandwich|salad|soup|wrap|lunch/i.test(names)) {
    return 'lunch';
  }

  // Dinner indicators
  if (/steak|pasta|rice|curry|dinner|roast|wine/i.test(names)) {
    return 'dinner';
  }

  // Snack indicators
  if (/chip|cookie|candy|bar|nuts|fruit|yogurt|smoothie/i.test(names)) {
    return 'snack';
  }

  return 'unknown';
}

/**
 * Calculate overall confidence for the image analysis
 */
function calculateImageConfidence(items: NormalizedFoodDescriptor[]): number {
  if (items.length === 0) return 0;

  const avgConfidence = items.reduce((sum, item) => sum + item.confidence, 0) / items.length;
  return Math.round(avgConfidence * 100) / 100;
}

/**
 * Identify foods from a photo URL
 */
export async function identifyFoodsFromPhotoUrl(
  imageUrl: string
): Promise<PhotoIdentificationResult> {
  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      max_completion_tokens: 2000,
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content: PHOTO_ID_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: PHOTO_ID_USER_PROMPT,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high',
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    });

    const rawResponse = response.choices[0]?.message?.content || '{"items": []}';
    const parsed = JSON.parse(rawResponse);
    // OpenAI may return 'items' or 'foods' array
    const rawItems = Array.isArray(parsed) ? parsed : (parsed.items || parsed.foods || []);

    const items: NormalizedFoodDescriptor[] = rawItems.map((item: RawFoodItem) => ({
      name: item.name || 'Unknown food',
      quantity: item.quantity || 1,
      unit: item.unit || 'serving',
      estimatedGrams: item.estimatedGrams || item.estimated_grams || 100,
      foodType: validateFoodType(item.foodType || item.food_type),
      restaurantName: item.restaurantName || item.restaurant_name || undefined,
      brandName: item.brandName || item.brand_name || undefined,
      cuisineType: item.cuisineType || item.cuisine_type || undefined,
      mealType: inferMealType(rawItems),
      ingredients: item.ingredients?.map((ing: { name: string; estimatedGrams?: number; estimated_grams?: number }) => ({
        name: ing.name,
        estimatedGrams: ing.estimatedGrams || ing.estimated_grams || 50,
      })),
      confidence: item.confidence || 0.8,
    }));

    return {
      items,
      mealType: inferMealType(rawItems),
      imageConfidence: calculateImageConfidence(items),
      rawResponse,
    };
  } catch (error) {
    console.error('Photo URL identification error:', error);
    throw new Error('Failed to identify foods from photo URL');
  }
}
