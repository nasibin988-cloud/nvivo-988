/**
 * Grading Rubric for Food Analysis
 *
 * This file provides food grading functionality with two modes:
 * 1. DETERMINISTIC (default): Uses published algorithms (Nutri-Score, DRI thresholds)
 *    - Consistent, reproducible grades
 *    - No API costs
 *    - Based on peer-reviewed research
 *
 * 2. AI-ENHANCED (optional): Uses GPT for nuanced analysis
 *    - Can capture edge cases
 *    - More expensive
 *    - Less consistent
 *
 * The deterministic approach is now the PRIMARY method.
 */

import OpenAI from 'openai';
import { defineSecret } from 'firebase-functions/params';
import { OPENAI_CONFIG } from '../../config/openai';
import {
  calculateDeterministicGrades,
  gradeSingleFocus,
  getNutriScore,
  type NutritionInput,
  type DeterministicGradingResult,
  type FocusGradeResult,
} from '../nutrition/deterministicGrading';

// Define OpenAI API key as a secret
export const openaiApiKeyGrading = defineSecret('OPENAI_API_KEY');

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

export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export const ALL_FOCUSES: WellnessFocus[] = [
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

/**
 * Compact grading rubric to send to AI
 * Each focus has specific criteria with thresholds
 */
export const GRADING_RUBRIC = `
GRADING RUBRIC - Grade each food A/B/C/D/F for the focus below:

BALANCED: Standard healthy eating.
- Good: protein >15g, fiber >5g, varied nutrients
- Bad: sat fat >5g, sodium >600mg, sugar >15g, low nutrients
- A: Nutrient-dense, balanced macros, minimal bad
- F: High bad nutrients, low good nutrients

MUSCLE_BUILDING: Prioritize protein, lenient on calories/fat.
- Good: protein >25g (A), >18g (B), >12g (C)
- Bad: very low protein <8g (F)
- Sat fat/calories OK if protein high
- A: High protein + complete amino acids
- F: Low protein, empty calories

HEART_HEALTH: Strict on sat fat, sodium, cholesterol.
- Bad: sat fat >6g (D), >10g (F); sodium >700mg (D), >1000mg (F)
- Good: fiber >5g, potassium, omega-3, unsaturated fats
- A: Low sat fat + high fiber + good fats
- F: High sat fat + high sodium + processed

ENERGY_ENDURANCE: Complex carbs, iron, B vitamins.
- Good: complex carbs, iron >3mg, magnesium, B vitamins
- Bad: simple sugars without fiber, very low carbs
- A: Sustained energy sources + micronutrients
- F: Sugar spikes, no sustaining nutrients

WEIGHT_MANAGEMENT: Strict on calories, reward satiety.
- Bad: calorie-dense (>250 per serving), high sugar
- Good: high protein (satiety), high fiber (fullness), low cal density
- A: Low cal + high protein + high fiber
- F: High cal + low protein + low fiber

BRAIN_FOCUS: Omega-3, antioxidants, stable blood sugar.
- Good: omega-3, antioxidants, choline, low glycemic
- Bad: high sugar (crashes), trans fat, processed
- A: Brain nutrients + stable energy
- F: Sugar bomb, trans fats, processed

GUT_HEALTH: Fiber is king.
- Good: fiber >8g (A), >5g (B), prebiotic foods
- Bad: low fiber <2g, highly processed, artificial
- A: High fiber + whole food
- F: No fiber, ultra-processed

BLOOD_SUGAR_BALANCE: Low glycemic, fiber to slow absorption.
- Bad: sugar >12g (D), >20g (F); refined carbs
- Good: fiber (slows glucose), protein, low GI
- A: Low sugar + high fiber + protein
- F: High sugar + low fiber + refined carbs

BONE_JOINT: Calcium, vitamin D, anti-inflammatory.
- Good: calcium >150mg, vitamin D, magnesium, omega-3
- Bad: excess sodium (calcium loss), very low calcium
- A: Bone-building nutrients present
- F: No calcium, high sodium

ANTI_INFLAMMATORY: Omega-3, antioxidants, avoid processed.
- Good: omega-3, colorful plants, turmeric/ginger, fiber
- Bad: sat fat >5g, sugar >10g, processed/fried
- A: Anti-inflammatory profile
- F: Pro-inflammatory (high sat fat, sugar, processed)

GRADE SCALE:
A = Excellent for this focus
B = Good, minor concerns
C = Moderate, some tradeoffs
D = Poor, significant concerns
F = Avoid for this focus
`.trim();

/**
 * Reference ranges for sanity checking AI nutrition estimates
 * If AI returns values outside these, we should flag them
 */
export const NUTRITION_REFERENCE_RANGES = {
  calories: { min: 0, max: 2000, typical: [100, 800] },
  protein: { min: 0, max: 100, typical: [5, 50] },
  carbs: { min: 0, max: 200, typical: [10, 80] },
  fat: { min: 0, max: 100, typical: [5, 40] },
  fiber: { min: 0, max: 30, typical: [1, 15] },
  sugar: { min: 0, max: 80, typical: [0, 30] },
  sodium: { min: 0, max: 3000, typical: [50, 1500] },
  saturatedFat: { min: 0, max: 30, typical: [0, 15] },
  cholesterol: { min: 0, max: 500, typical: [0, 150] },
  potassium: { min: 0, max: 2000, typical: [100, 800] },
};

/**
 * Compact prompt addition for grading
 * This goes at the end of the food analysis prompt
 */
export function getGradingPromptAddition(): string {
  return `
Also grade this food for ALL 10 wellness focuses using the rubric below.
Return grades as: "focusGrades": { "balanced": "B", "muscle_building": "A", ... }

${GRADING_RUBRIC}
`;
}

/**
 * Generate a compact comparison prompt
 * Used when comparing already-graded foods
 */
export function getComparisonPrompt(
  foods: Array<{
    name: string;
    grade: HealthGrade;
    calories: number;
    protein: number;
    fat: number;
    saturatedFat?: number;
    fiber: number;
    sugar: number;
    sodium: number;
  }>,
  focus: WellnessFocus
): string {
  const focusLabel = {
    balanced: 'overall nutrition',
    muscle_building: 'muscle building (protein focus)',
    heart_health: 'heart health (low sat fat/sodium)',
    energy_endurance: 'sustained energy',
    weight_management: 'weight management (low cal, high satiety)',
    brain_focus: 'brain health & focus',
    gut_health: 'gut health (fiber focus)',
    blood_sugar_balance: 'blood sugar stability',
    bone_joint_support: 'bone & joint health',
    anti_inflammatory: 'anti-inflammatory',
  }[focus];

  const foodSummaries = foods.map((f, i) => {
    const parts = [
      `${i + 1}. ${f.name} (Grade: ${f.grade})`,
      `   ${f.calories}cal, ${f.protein}g protein, ${f.fat}g fat${f.saturatedFat ? ` (${f.saturatedFat}g sat)` : ''}`,
      `   ${f.fiber}g fiber, ${f.sugar}g sugar, ${f.sodium}mg sodium`,
    ];
    return parts.join('\n');
  }).join('\n');

  return `Compare these foods for ${focusLabel}:

${foodSummaries}

Return JSON:
{
  "winner": <1-based index or null if tie>,
  "verdict": "<1-2 sentence verdict explaining why>",
  "insight": "<1 surprising or useful fact>",
  "tip": "<optional practical tip>"
}`;
}

// ============================================================================
// AI GRADING FUNCTION
// ============================================================================

/**
 * Nutrition data for grading
 */
export interface GradingNutritionData {
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
  calcium?: number;
  iron?: number;
  magnesium?: number;
}

/**
 * Result from AI grading
 */
export interface AIGradingResult {
  focusGrades: Record<WellnessFocus, HealthGrade>;
  overallGrade: HealthGrade;
  primaryConcerns: string[];
  strengths: string[];
}

/**
 * Get OpenAI API key from secret
 */
function getApiKey(): string {
  const secretValue = openaiApiKeyGrading.value();
  if (secretValue) {
    return secretValue;
  }
  throw new Error('OpenAI API key not configured');
}

/**
 * Grade a food for all 10 wellness focuses using GPT-4o-mini
 * Returns grades A-F for each focus based on the grading rubric
 *
 * Cost optimization: Single AI call returns all 10 grades
 */
export async function gradeFoodWithAI(
  nutrition: GradingNutritionData
): Promise<AIGradingResult> {
  const apiKey = getApiKey();
  const openai = new OpenAI({ apiKey });

  // Build compact nutrition summary
  const nutritionSummary = [
    `Food: ${nutrition.name}`,
    `Calories: ${nutrition.calories}`,
    `Protein: ${nutrition.protein}g`,
    `Carbs: ${nutrition.carbs}g`,
    `Fat: ${nutrition.fat}g${nutrition.saturatedFat ? ` (${nutrition.saturatedFat}g sat)` : ''}`,
    `Fiber: ${nutrition.fiber}g`,
    `Sugar: ${nutrition.sugar}g`,
    `Sodium: ${nutrition.sodium}mg`,
  ];
  if (nutrition.cholesterol) nutritionSummary.push(`Cholesterol: ${nutrition.cholesterol}mg`);
  if (nutrition.potassium) nutritionSummary.push(`Potassium: ${nutrition.potassium}mg`);
  if (nutrition.calcium) nutritionSummary.push(`Calcium: ${nutrition.calcium}mg`);
  if (nutrition.iron) nutritionSummary.push(`Iron: ${nutrition.iron}mg`);

  const prompt = `Grade this food for ALL 10 wellness focuses using the rubric below.

${nutritionSummary.join('\n')}

${GRADING_RUBRIC}

Return JSON only:
{
  "focusGrades": {
    "balanced": "X",
    "muscle_building": "X",
    "heart_health": "X",
    "energy_endurance": "X",
    "weight_management": "X",
    "brain_focus": "X",
    "gut_health": "X",
    "blood_sugar_balance": "X",
    "bone_joint_support": "X",
    "anti_inflammatory": "X"
  },
  "overallGrade": "X",
  "primaryConcerns": ["concern1", "concern2"],
  "strengths": ["strength1", "strength2"]
}

Replace X with A/B/C/D/F. Be specific about concerns and strengths based on the nutrition data.`;

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_CONFIG.grading.model,
      messages: [
        {
          role: 'system',
          content:
            'You are a nutrition grading assistant. Grade foods based on the provided rubric. Be consistent and use the specific thresholds in the rubric. Respond with JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: OPENAI_CONFIG.grading.maxCompletionTokens,
      temperature: OPENAI_CONFIG.grading.temperature,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as AIGradingResult;

    // Validate and normalize grades
    const validGrades: HealthGrade[] = ['A', 'B', 'C', 'D', 'F'];
    const normalizedGrades: Record<WellnessFocus, HealthGrade> = {} as Record<WellnessFocus, HealthGrade>;

    for (const focus of ALL_FOCUSES) {
      const grade = parsed.focusGrades?.[focus]?.toUpperCase() as HealthGrade;
      normalizedGrades[focus] = validGrades.includes(grade) ? grade : 'C';
    }

    const overallGrade = validGrades.includes(parsed.overallGrade?.toUpperCase() as HealthGrade)
      ? (parsed.overallGrade.toUpperCase() as HealthGrade)
      : 'C';

    return {
      focusGrades: normalizedGrades,
      overallGrade,
      primaryConcerns: Array.isArray(parsed.primaryConcerns)
        ? parsed.primaryConcerns.slice(0, 3)
        : [],
      strengths: Array.isArray(parsed.strengths)
        ? parsed.strengths.slice(0, 3)
        : [],
    };
  } catch (error) {
    console.error('Error in AI grading:', error);

    // Return fallback grades based on basic heuristics
    return getFallbackGrades(nutrition);
  }
}

/**
 * Fallback grading when AI fails
 * Now uses the deterministic grading system instead of simple heuristics
 */
function getFallbackGrades(nutrition: GradingNutritionData): AIGradingResult {
  // Convert to NutritionInput format for deterministic grading
  const input: NutritionInput = {
    calories: nutrition.calories,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fat: nutrition.fat,
    fiber: nutrition.fiber,
    sugar: nutrition.sugar,
    sodium: nutrition.sodium,
    saturatedFat: nutrition.saturatedFat ?? 0,
    transFat: nutrition.transFat,
    cholesterol: nutrition.cholesterol,
    potassium: nutrition.potassium,
    calcium: nutrition.calcium,
    iron: nutrition.iron,
    magnesium: nutrition.magnesium,
  };

  const result = calculateDeterministicGrades(input);

  // Convert FocusGradeResult grades to HealthGrade
  const focusGrades: Record<WellnessFocus, HealthGrade> = {} as Record<WellnessFocus, HealthGrade>;
  for (const [focus, gradeResult] of Object.entries(result.focusGrades)) {
    focusGrades[focus as WellnessFocus] = gradeResult.grade;
  }

  return {
    focusGrades,
    overallGrade: result.overallGrade,
    primaryConcerns: result.primaryConcerns,
    strengths: result.strengths,
  };
}

// ============================================================================
// DETERMINISTIC GRADING (PRIMARY - No AI calls)
// ============================================================================

/**
 * Grade a food using deterministic algorithms (NO AI CALLS)
 * This is the RECOMMENDED approach for consistent, reproducible grades.
 *
 * Uses:
 * - Nutri-Score (EU algorithm) for overall grade
 * - DRI/AHA/WHO thresholds for focus grades
 * - Published formulas for satiety & inflammatory index
 *
 * @param nutrition - Nutrition data for the food
 * @returns Complete grading result with all focuses
 */
export function gradeFood(nutrition: GradingNutritionData): DeterministicGradingResult {
  const input: NutritionInput = {
    calories: nutrition.calories,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fat: nutrition.fat,
    fiber: nutrition.fiber,
    sugar: nutrition.sugar,
    sodium: nutrition.sodium,
    saturatedFat: nutrition.saturatedFat ?? 0,
    transFat: nutrition.transFat,
    cholesterol: nutrition.cholesterol,
    potassium: nutrition.potassium,
    calcium: nutrition.calcium,
    iron: nutrition.iron,
    magnesium: nutrition.magnesium,
  };

  return calculateDeterministicGrades(input);
}

/**
 * Get grade for a single focus (more efficient when you only need one)
 */
export function gradeFoodForFocus(
  nutrition: GradingNutritionData,
  focus: WellnessFocus
): FocusGradeResult {
  const input: NutritionInput = {
    calories: nutrition.calories,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fat: nutrition.fat,
    fiber: nutrition.fiber,
    sugar: nutrition.sugar,
    sodium: nutrition.sodium,
    saturatedFat: nutrition.saturatedFat ?? 0,
    transFat: nutrition.transFat,
    cholesterol: nutrition.cholesterol,
    potassium: nutrition.potassium,
    calcium: nutrition.calcium,
    iron: nutrition.iron,
    magnesium: nutrition.magnesium,
  };

  return gradeSingleFocus(input, focus);
}

/**
 * Get only the overall Nutri-Score grade
 */
export function getOverallGrade(nutrition: GradingNutritionData): { grade: HealthGrade; score: number } {
  const input: NutritionInput = {
    calories: nutrition.calories,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fat: nutrition.fat,
    fiber: nutrition.fiber,
    sugar: nutrition.sugar,
    sodium: nutrition.sodium,
    saturatedFat: nutrition.saturatedFat ?? 0,
  };

  return getNutriScore(input);
}

// Re-export types from deterministic grading
export type { NutritionInput, DeterministicGradingResult, FocusGradeResult };
