/**
 * AI Food Comparison Analysis
 * Uses GPT-4o-mini to provide contextual comparison insights
 * Wellness-focused language (no medical claims)
 */

import OpenAI from 'openai';
import { defineSecret } from 'firebase-functions/params';
import { OPENAI_CONFIG } from '../../config/openai';

// Define OpenAI API key as a secret
export const openaiApiKeyComparison = defineSecret('OPENAI_API_KEY');

/**
 * Wellness focus types for food comparison
 */
export type WellnessFocus =
  | 'muscle_building'
  | 'heart_health'
  | 'energy_endurance'
  | 'weight_management'
  | 'brain_focus'
  | 'gut_health'
  | 'blood_sugar_balance'
  | 'bone_joint_support'
  | 'anti_inflammatory'
  | 'balanced';

/**
 * Food nutrition data for comparison
 */
export interface ComparisonFoodData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  saturatedFat?: number;
  transFat?: number;
  cholesterol?: number;
  potassium?: number;
  healthGrade: string;
  overallScore: number;
}

/**
 * AI comparison insight response
 */
export interface AIComparisonInsightResponse {
  verdict: string;
  winnerIndex: number | null;
  contextualAnalysis: string;
  focusInsights: Partial<Record<WellnessFocus, string>>;
  surprises: string[];
  recommendation?: string;
}

/**
 * Focus labels for display
 */
const FOCUS_LABELS: Record<WellnessFocus, string> = {
  muscle_building: 'Muscle Building',
  heart_health: 'Heart Health',
  energy_endurance: 'Energy & Endurance',
  weight_management: 'Weight Management',
  brain_focus: 'Brain & Focus',
  gut_health: 'Gut Health',
  blood_sugar_balance: 'Blood Sugar Balance',
  bone_joint_support: 'Bone & Joint Support',
  anti_inflammatory: 'Anti-Inflammatory',
  balanced: 'Balanced',
};

/**
 * Get OpenAI API key from secret
 */
function getApiKey(): string {
  const secretValue = openaiApiKeyComparison.value();
  if (secretValue) {
    return secretValue;
  }
  throw new Error('OpenAI API key not configured');
}

/**
 * Compare foods using AI to provide contextual insights
 * Uses GPT-4o-mini for cost-effectiveness
 */
export async function compareFoodsWithAI(
  foods: ComparisonFoodData[],
  userFocuses: WellnessFocus[]
): Promise<AIComparisonInsightResponse> {
  const apiKey = getApiKey();
  const openai = new OpenAI({ apiKey });

  // Build food descriptions for the prompt
  const foodDescriptions = foods
    .map((food, idx) => {
      const parts = [
        `Food ${idx + 1}: ${food.name}`,
        `  Calories: ${food.calories}`,
        `  Protein: ${food.protein}g`,
        `  Carbs: ${food.carbs}g`,
        `  Fat: ${food.fat}g${food.saturatedFat ? ` (${food.saturatedFat}g saturated)` : ''}`,
        `  Fiber: ${food.fiber}g`,
        `  Sugar: ${food.sugar}g`,
        `  Sodium: ${food.sodium}mg`,
      ];
      if (food.cholesterol) parts.push(`  Cholesterol: ${food.cholesterol}mg`);
      if (food.potassium) parts.push(`  Potassium: ${food.potassium}mg`);
      parts.push(`  Health Grade: ${food.healthGrade} (Score: ${food.overallScore}/100)`);
      return parts.join('\n');
    })
    .join('\n\n');

  // Build focus context
  const activeFocuses = userFocuses.filter(f => f !== 'balanced');
  const focusContext =
    activeFocuses.length > 0
      ? `The user has selected these wellness priorities: ${activeFocuses.map(f => FOCUS_LABELS[f]).join(', ')}.`
      : 'The user wants a balanced nutritional comparison.';

  const prompt = `You are a nutrition expert providing food comparison insights. Be conversational, helpful, and wellness-focused. NEVER make medical claims or diagnoses. Use phrases like "may support", "could help with", "often associated with" rather than definitive health claims.

${focusContext}

Compare these foods:

${foodDescriptions}

Provide a JSON response with:
1. "verdict": A 1-2 sentence summary of which food is the better choice and why (based on their focuses or overall if balanced). Be specific about nutritional differences.
2. "winnerIndex": The index (0-based) of the best food, or null if it's truly too close to call.
3. "contextualAnalysis": A 2-3 sentence deeper analysis explaining the tradeoffs. Mention specific numbers.
4. "focusInsights": An object with insights for each of the user's selected focuses. Key should be the focus ID (like "heart_health"), value is a 1-2 sentence insight for that specific goal. Only include focuses the user selected.
5. "surprises": An array of 1-2 interesting nutritional facts that might surprise the user (e.g., "The pasta actually has more fiber than you might expect").
6. "recommendation": Optional. A practical tip for how to make the less healthy option healthier, or how to get the best of both worlds.

Focus IDs to use: ${activeFocuses.length > 0 ? activeFocuses.join(', ') : 'none (user selected balanced)'}

Respond ONLY with valid JSON, no markdown or explanation.`;

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_CONFIG.generation.model,
      messages: [
        {
          role: 'system',
          content:
            'You are a nutrition comparison assistant. Provide helpful, wellness-focused insights without making medical claims. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse JSON response
    const parsed = JSON.parse(content.trim()) as AIComparisonInsightResponse;

    // Validate response structure
    if (!parsed.verdict || typeof parsed.verdict !== 'string') {
      throw new Error('Invalid AI response: missing verdict');
    }

    return {
      verdict: parsed.verdict,
      winnerIndex: typeof parsed.winnerIndex === 'number' ? parsed.winnerIndex : null,
      contextualAnalysis: parsed.contextualAnalysis || '',
      focusInsights: parsed.focusInsights || {},
      surprises: Array.isArray(parsed.surprises) ? parsed.surprises.slice(0, 3) : [],
      recommendation: parsed.recommendation,
    };
  } catch (error) {
    console.error('Error in AI food comparison:', error);

    // Return a fallback response
    const winnerIdx = foods.reduce(
      (best, food, idx) => (food.overallScore > (foods[best]?.overallScore ?? 0) ? idx : best),
      0
    );

    return {
      verdict: `Based on the nutritional analysis, ${foods[winnerIdx]?.name ?? 'the first option'} appears to be the better choice with a score of ${foods[winnerIdx]?.overallScore ?? 0}/100.`,
      winnerIndex: winnerIdx,
      contextualAnalysis:
        'Unable to generate detailed AI analysis. The comparison is based on our algorithmic scoring system.',
      focusInsights: {},
      surprises: [],
    };
  }
}
