/**
 * Food Comparison Layer
 *
 * Deterministic comparison of multiple foods.
 * AI can add insights but CANNOT override deterministic winners.
 */

import OpenAI from 'openai';
import { defineSecret } from 'firebase-functions/params';
import type {
  AnalyzedFoodV2,
  CompleteNutrition,
  WellnessFocus,
  HealthGrade,
  ComparisonResultV2,
  ComparisonWinner,
  ComparisonInsight,
} from '../types';

// Define secret for lazy access at runtime
const openaiApiKey = defineSecret('OPENAI_API_KEY');

// Lazy-initialized OpenAI client
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
export { openaiApiKey as comparatorOpenaiApiKey };

/**
 * Compare multiple analyzed foods deterministically
 */
export function compareFoods(
  foods: AnalyzedFoodV2[],
  userFocus: WellnessFocus = 'balanced'
): ComparisonResultV2 {
  if (foods.length < 2) {
    throw new Error('Need at least 2 foods to compare');
  }

  // Calculate winners for each focus
  const focusWinners: Record<WellnessFocus, ComparisonWinner> = {} as Record<WellnessFocus, ComparisonWinner>;
  const allFocuses: WellnessFocus[] = [
    'balanced',
    'muscle_building',
    'heart_health',
    'energy_endurance',
    'weight_management',
    'brain_focus',
    'gut_health',
    'blood_sugar_balance',
    'bone_joint_support',
    'anti_inflammatory',
  ];

  for (const focus of allFocuses) {
    focusWinners[focus] = determineFocusWinner(foods, focus);
  }

  // Calculate nutrient-by-nutrient comparison
  const nutrientComparison = compareNutrients(foods);

  // Overall winner for user's focus
  const winner = focusWinners[userFocus];

  return {
    foods,
    userFocus,
    winner,
    focusWinners,
    nutrientComparison,
    comparedAt: new Date(),
    aiInsightsEnabled: false,
  };
}

/**
 * Compare with AI insights (optional enhancement)
 * AI cannot change winners, only adds explanation
 */
export async function compareFoodsWithInsights(
  foods: AnalyzedFoodV2[],
  userFocus: WellnessFocus = 'balanced'
): Promise<ComparisonResultV2> {
  // Get deterministic comparison first
  const baseComparison = compareFoods(foods, userFocus);

  try {
    // Generate AI insights
    const insights = await generateComparisonInsights(foods, baseComparison, userFocus);

    return {
      ...baseComparison,
      insights,
      aiInsightsEnabled: true,
    };
  } catch (error) {
    console.error('Failed to generate comparison insights:', error);
    return baseComparison;
  }
}

/**
 * Determine winner for a specific focus
 */
function determineFocusWinner(foods: AnalyzedFoodV2[], focus: WellnessFocus): ComparisonWinner {
  // Get scores for this focus
  const scores = foods.map(food => ({
    id: food.id,
    name: food.name,
    score: food.grading.focusGrades[focus].score,
    grade: food.grading.focusGrades[focus].grade,
  }));

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  const winner = scores[0];
  const runnerUp = scores[1];

  // Determine margin
  const scoreDiff = winner.score - runnerUp.score;
  let margin: ComparisonWinner['margin'];

  if (scoreDiff >= 25) margin = 'decisive';
  else if (scoreDiff >= 15) margin = 'moderate';
  else if (scoreDiff >= 5) margin = 'slight';
  else margin = 'tie';

  return {
    foodId: winner.id,
    foodName: winner.name,
    margin,
    score: winner.score,
  };
}

/**
 * Compare nutrients between foods
 */
function compareNutrients(
  foods: AnalyzedFoodV2[]
): Record<keyof CompleteNutrition, { values: Record<string, number>; leader: string }> {
  const nutrients: (keyof CompleteNutrition)[] = [
    'calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium',
    'saturatedFat', 'transFat', 'monounsaturatedFat', 'polyunsaturatedFat',
    'cholesterol', 'potassium', 'calcium', 'iron', 'magnesium', 'zinc',
    'phosphorus', 'vitaminA', 'vitaminD', 'vitaminE', 'vitaminK',
    'vitaminC', 'thiamin', 'riboflavin', 'niacin', 'vitaminB6', 'folate', 'vitaminB12',
  ];

  const comparison = {} as Record<keyof CompleteNutrition, { values: Record<string, number>; leader: string }>;

  for (const nutrient of nutrients) {
    const values: Record<string, number> = {};
    let leader = '';
    let leaderValue = -Infinity;
    const higherIsBetter = isHigherBetter(nutrient);

    for (const food of foods) {
      const value = food.nutrition[nutrient] || 0;
      values[food.id] = value;

      if (higherIsBetter) {
        if (value > leaderValue) {
          leaderValue = value;
          leader = food.id;
        }
      } else {
        // For nutrients where lower is better (calories, sodium, sugar, etc.)
        if (leaderValue === -Infinity || value < leaderValue) {
          leaderValue = value;
          leader = food.id;
        }
      }
    }

    comparison[nutrient] = { values, leader };
  }

  return comparison;
}

/**
 * Determine if higher value is better for a nutrient
 */
function isHigherBetter(nutrient: keyof CompleteNutrition): boolean {
  const lowerIsBetter = [
    'calories', 'sodium', 'sugar', 'saturatedFat', 'transFat', 'cholesterol',
  ];
  return !lowerIsBetter.includes(nutrient);
}

/**
 * Generate AI insights for comparison
 * These are explanatory only - they cannot change the winner
 */
async function generateComparisonInsights(
  foods: AnalyzedFoodV2[],
  comparison: ComparisonResultV2,
  userFocus: WellnessFocus
): Promise<ComparisonInsight> {
  const prompt = buildInsightPrompt(foods, comparison, userFocus);

  const openai = getOpenAIClient();
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Use mini for cost efficiency
    max_completion_tokens: 500,
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content: `You are a nutrition advisor. Explain food comparison results.
IMPORTANT: The winner has been determined algorithmically. You can explain WHY but cannot suggest a different winner.
Be concise and helpful. Focus on practical takeaways.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const rawResponse = response.choices[0]?.message?.content || '{}';
  const parsed = JSON.parse(rawResponse);

  return {
    summary: parsed.summary || `${comparison.winner.foodName} is the better choice for ${formatFocus(userFocus)}.`,
    winnerExplanation: parsed.winnerExplanation || 'Based on the nutritional analysis.',
    considerations: parsed.considerations || [],
    recommendation: parsed.recommendation || `Choose ${comparison.winner.foodName} for your ${formatFocus(userFocus)} goal.`,
  };
}

/**
 * Build prompt for AI insights
 */
function buildInsightPrompt(
  foods: AnalyzedFoodV2[],
  comparison: ComparisonResultV2,
  userFocus: WellnessFocus
): string {
  const foodSummaries = foods.map(food => `
${food.name}:
- Calories: ${food.nutrition.calories}
- Protein: ${food.nutrition.protein}g
- Carbs: ${food.nutrition.carbs}g
- Fat: ${food.nutrition.fat}g
- Fiber: ${food.nutrition.fiber}g
- Sugar: ${food.nutrition.sugar}g
- ${userFocus} score: ${food.grading.focusGrades[userFocus].score}/100 (${food.grading.focusGrades[userFocus].grade})
- Pros: ${food.grading.focusGrades[userFocus].pros.join(', ') || 'None'}
- Cons: ${food.grading.focusGrades[userFocus].cons.join(', ') || 'None'}
`).join('\n');

  return `Compare these foods for someone focused on ${formatFocus(userFocus)}:

${foodSummaries}

WINNER (determined by algorithm): ${comparison.winner.foodName} (${comparison.winner.margin} margin)

Provide a JSON response with:
{
  "summary": "1-2 sentence summary",
  "winnerExplanation": "Why the winner is better for this focus (2-3 sentences)",
  "considerations": ["when the other option might be better", "situational factors"],
  "recommendation": "Practical advice (1 sentence)"
}`;
}

/**
 * Format wellness focus for display
 */
function formatFocus(focus: WellnessFocus): string {
  const formatted: Record<WellnessFocus, string> = {
    balanced: 'balanced nutrition',
    muscle_building: 'building muscle',
    heart_health: 'heart health',
    energy_endurance: 'energy and endurance',
    weight_management: 'weight management',
    brain_focus: 'brain health and focus',
    gut_health: 'gut health',
    blood_sugar_balance: 'blood sugar balance',
    bone_joint_support: 'bone and joint support',
    anti_inflammatory: 'reducing inflammation',
  };
  return formatted[focus];
}

/**
 * Get a quick winner without full comparison
 */
export function getQuickWinner(
  foods: AnalyzedFoodV2[],
  focus: WellnessFocus
): { winner: string; score: number; grade: HealthGrade } {
  const winner = determineFocusWinner(foods, focus);
  const winningFood = foods.find(f => f.id === winner.foodId)!;

  return {
    winner: winner.foodName,
    score: winner.score,
    grade: winningFood.grading.focusGrades[focus].grade,
  };
}

/**
 * Compare two foods for a quick A vs B decision
 */
export function compareTwo(
  foodA: AnalyzedFoodV2,
  foodB: AnalyzedFoodV2,
  focus: WellnessFocus
): {
  winner: 'A' | 'B' | 'tie';
  scoreA: number;
  scoreB: number;
  explanation: string;
} {
  const scoreA = foodA.grading.focusGrades[focus].score;
  const scoreB = foodB.grading.focusGrades[focus].score;
  const diff = scoreA - scoreB;

  let winner: 'A' | 'B' | 'tie';
  let explanation: string;

  if (Math.abs(diff) < 5) {
    winner = 'tie';
    explanation = `Both ${foodA.name} and ${foodB.name} are similarly suited for ${formatFocus(focus)}.`;
  } else if (diff > 0) {
    winner = 'A';
    explanation = `${foodA.name} scores ${diff} points higher for ${formatFocus(focus)}.`;
  } else {
    winner = 'B';
    explanation = `${foodB.name} scores ${-diff} points higher for ${formatFocus(focus)}.`;
  }

  return { winner, scoreA, scoreB, explanation };
}
