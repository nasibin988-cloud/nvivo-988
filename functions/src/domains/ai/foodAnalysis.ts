/**
 * AI Food Analysis using OpenAI Vision
 * Analyzes food photos to estimate nutritional content
 */

import OpenAI from 'openai';
import { defineSecret } from 'firebase-functions/params';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { OPENAI_CONFIG } from '../../config/openai';

// Load .env file for local development (try both functions dir and root)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'functions/.env') });
dotenv.config(); // Also try root .env

// Define OpenAI API key as a secret (for production)
const openaiApiKey = defineSecret('OPENAI_API_KEY');

/**
 * Get API key - uses env var for local dev, secret for production
 */
function getApiKey(): string {
  // Try environment variable first (for emulator/local dev)
  const envKey = process.env.OPENAI_API_KEY;
  if (envKey) {
    return envKey;
  }

  // Try Firebase secret (for production)
  try {
    const secretValue = openaiApiKey.value();
    if (secretValue) {
      return secretValue;
    }
  } catch {
    // Secret not available in emulator
  }

  throw new Error('OpenAI API key not configured');
}

export interface AnalyzedFood {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  confidence: number;
}

export interface FoodAnalysisResult {
  items: AnalyzedFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'unknown';
}

const FOOD_ANALYSIS_PROMPT = `You are a nutrition expert analyzing a food photo. Analyze this image and provide detailed nutritional information.

For each food item you can identify:
1. Name of the food item
2. Estimated quantity and unit (e.g., "1 cup", "6 oz", "2 slices")
3. Calories
4. Protein (grams)
5. Carbohydrates (grams)
6. Fat (grams)
7. Fiber (grams) if applicable
8. Your confidence level (0-1) in the identification

Also determine the meal type based on the foods present (breakfast, lunch, dinner, snack, or unknown).

Respond ONLY with a valid JSON object in this exact format:
{
  "items": [
    {
      "name": "Food Name",
      "quantity": 1,
      "unit": "serving size",
      "calories": 200,
      "protein": 10,
      "carbs": 25,
      "fat": 5,
      "fiber": 3,
      "confidence": 0.85
    }
  ],
  "mealType": "lunch"
}

Be accurate with portion sizes and nutritional values. If you cannot identify a food item clearly, still make your best estimate but use a lower confidence score.`;

/**
 * Analyze a food photo using GPT-4 Vision
 */
export async function analyzeFoodPhoto(imageBase64: string): Promise<FoodAnalysisResult> {
  // Get the API key (env var for local, secret for production)
  const apiKey = getApiKey();

  const openai = new OpenAI({
    apiKey,
  });

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_CONFIG.vision.model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: FOOD_ANALYSIS_PROMPT,
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
      max_tokens: 1000,
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

    // Validate and transform the response
    const items: AnalyzedFood[] = (parsed.items || []).map((item: Record<string, unknown>) => ({
      name: String(item.name || 'Unknown food'),
      quantity: Number(item.quantity) || 1,
      unit: String(item.unit || 'serving'),
      calories: Math.round(Number(item.calories) || 0),
      protein: Math.round((Number(item.protein) || 0) * 10) / 10,
      carbs: Math.round((Number(item.carbs) || 0) * 10) / 10,
      fat: Math.round((Number(item.fat) || 0) * 10) / 10,
      fiber: item.fiber ? Math.round((Number(item.fiber) || 0) * 10) / 10 : undefined,
      confidence: Math.min(1, Math.max(0, Number(item.confidence) || 0.5)),
    }));

    // Calculate totals
    const totals = items.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const mealType = ['breakfast', 'lunch', 'dinner', 'snack'].includes(parsed.mealType)
      ? parsed.mealType
      : 'unknown';

    return {
      items,
      totalCalories: Math.round(totals.calories),
      totalProtein: Math.round(totals.protein * 10) / 10,
      totalCarbs: Math.round(totals.carbs * 10) / 10,
      totalFat: Math.round(totals.fat * 10) / 10,
      mealType,
    };
  } catch (error) {
    console.error('Food analysis error:', error);
    throw error;
  }
}

// Export the secret for use in the Cloud Function
export { openaiApiKey };
