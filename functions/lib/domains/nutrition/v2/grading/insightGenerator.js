"use strict";
/**
 * AI Food Insight Generator
 *
 * Generates personalized, nuanced insights for analyzed foods.
 * Uses GPT-4o-mini with structured output for consistent formatting.
 *
 * Flow:
 * 1. Receive deterministic analysis (nutrition, grades, GI, satiety, inflammatory)
 * 2. Build context for AI including user's wellness focus
 * 3. Generate structured insight with summary, explanation, tips, considerations
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insightOpenaiApiKey = void 0;
exports.generateFoodInsight = generateFoodInsight;
exports.batchGenerateFoodInsights = batchGenerateFoodInsights;
const openai_1 = __importDefault(require("openai"));
const params_1 = require("firebase-functions/params");
const openaiApiKey = (0, params_1.defineSecret)('OPENAI_API_KEY');
exports.insightOpenaiApiKey = openaiApiKey;
// Use GPT-4o-mini for cost efficiency
const INSIGHT_MODEL = 'gpt-4o-mini';
/**
 * Focus display names for prompts
 */
const FOCUS_DISPLAY_NAMES = {
    balanced: 'balanced nutrition',
    muscle_building: 'muscle building',
    heart_health: 'heart health',
    energy_endurance: 'energy and endurance',
    weight_management: 'weight management',
    brain_focus: 'brain function and focus',
    gut_health: 'gut health',
    blood_sugar_balance: 'blood sugar balance',
    bone_joint_support: 'bone and joint health',
    anti_inflammatory: 'reducing inflammation',
};
/**
 * Build the prompt for insight generation
 */
function buildInsightPrompt(input) {
    const { foodName, servingDescription, nutrition, gi, grading, userFocus } = input;
    const focusGrade = grading.focusGrades[userFocus];
    const focusName = FOCUS_DISPLAY_NAMES[userFocus];
    // Build nutrition summary
    const nutritionSummary = `
Calories: ${nutrition.calories} kcal
Protein: ${nutrition.protein}g
Carbs: ${nutrition.carbs}g (Fiber: ${nutrition.fiber}g, Sugar: ${nutrition.sugar}g)
Fat: ${nutrition.fat}g (Sat: ${nutrition.saturatedFat}g, Trans: ${nutrition.transFat}g)
Sodium: ${nutrition.sodium}mg
Key vitamins: A ${nutrition.vitaminA}mcg, C ${nutrition.vitaminC}mg, D ${nutrition.vitaminD}mcg
Key minerals: Calcium ${nutrition.calcium}mg, Iron ${nutrition.iron}mg, Potassium ${nutrition.potassium}mg
`.trim();
    // Build grades summary
    const gradesSummary = `
Overall Nutri-Score: ${grading.overall.grade} (${grading.overall.score}/100)
${focusName} Grade: ${focusGrade.grade} (${focusGrade.score}/100)
Satiety: ${grading.satiety.category} (${grading.satiety.score}/100)
Inflammatory: ${grading.inflammatory.category} (index: ${grading.inflammatory.index})
`.trim();
    // GI info if available
    const giInfo = gi
        ? `Glycemic Index: ${gi.gi} (${gi.giBand}), Glycemic Load: ${gi.gl} (${gi.glBand})`
        : 'Glycemic data: Not applicable (low-carb food)';
    return `You are a friendly nutritionist providing personalized food insights.

FOOD ANALYZED:
${foodName} (${servingDescription})

NUTRITION DATA:
${nutritionSummary}

GRADES & SCORES:
${gradesSummary}
${giInfo}

USER'S WELLNESS FOCUS: ${focusName}

Based on this analysis, provide a personalized insight. Be conversational but informative.
- Summary: 1-2 sentences explaining what makes this food notable for their goals
- Focus explanation: Why this food specifically helps (or hinders) their ${focusName} goal
- Tips: 1-3 practical, actionable tips (timing, pairings, preparation)
- Considerations: 0-2 things to be mindful of (only if relevant, don't force negatives)

Keep it concise and helpful. Focus on the most important points.`;
}
/**
 * JSON schema for structured output
 */
const INSIGHT_SCHEMA = {
    type: 'object',
    properties: {
        summary: {
            type: 'string',
            description: '1-2 sentence contextual summary of this food for the user',
        },
        focusExplanation: {
            type: 'string',
            description: 'Why this food works (or doesn\'t) for the user\'s specific wellness focus',
        },
        tips: {
            type: 'array',
            items: { type: 'string' },
            description: '1-3 practical tips for timing, pairing, or preparation',
        },
        considerations: {
            type: 'array',
            items: { type: 'string' },
            description: '0-2 things to be mindful of (only if genuinely relevant)',
        },
    },
    required: ['summary', 'focusExplanation', 'tips', 'considerations'],
    additionalProperties: false,
};
/**
 * Generate personalized insight for an analyzed food
 */
async function generateFoodInsight(input) {
    var _a, _b;
    const apiKey = openaiApiKey.value();
    if (!apiKey) {
        // Return a fallback insight based on deterministic data
        return generateFallbackInsight(input);
    }
    const openai = new openai_1.default({ apiKey });
    try {
        const response = await openai.chat.completions.create({
            model: INSIGHT_MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are a friendly, knowledgeable nutritionist. Provide concise, personalized food insights.',
                },
                {
                    role: 'user',
                    content: buildInsightPrompt(input),
                },
            ],
            response_format: {
                type: 'json_schema',
                json_schema: {
                    name: 'food_insight',
                    strict: true,
                    schema: INSIGHT_SCHEMA,
                },
            },
            max_completion_tokens: 500,
            temperature: 0.7,
        });
        const content = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
        if (!content) {
            return generateFallbackInsight(input);
        }
        const parsed = JSON.parse(content);
        // Validate and sanitize
        return {
            summary: parsed.summary || '',
            focusExplanation: parsed.focusExplanation || '',
            tips: Array.isArray(parsed.tips) ? parsed.tips.slice(0, 3) : [],
            considerations: Array.isArray(parsed.considerations) ? parsed.considerations.slice(0, 2) : [],
        };
    }
    catch (error) {
        console.error('Food insight generation error:', error);
        return generateFallbackInsight(input);
    }
}
/**
 * Generate a fallback insight from deterministic data when AI is unavailable
 */
function generateFallbackInsight(input) {
    const { foodName, grading, userFocus } = input;
    const focusGrade = grading.focusGrades[userFocus];
    const focusName = FOCUS_DISPLAY_NAMES[userFocus];
    // Build summary based on grade
    let summary;
    const gradeChar = focusGrade.grade.charAt(0);
    if (gradeChar === 'A') {
        summary = `${foodName} is an excellent choice for ${focusName}, scoring highly across key metrics.`;
    }
    else if (gradeChar === 'B') {
        summary = `${foodName} is a good option for ${focusName}, with solid nutritional value.`;
    }
    else if (gradeChar === 'C') {
        summary = `${foodName} is a moderate choice for ${focusName} — consider balancing with nutrient-dense foods.`;
    }
    else {
        summary = `${foodName} may not be ideal for ${focusName} goals. Best enjoyed occasionally.`;
    }
    // Use the deterministic insight as focus explanation
    const focusExplanation = focusGrade.insight || `This food received a ${focusGrade.grade} grade for ${focusName}.`;
    // Convert pros to tips and cons to considerations
    const tips = focusGrade.pros.slice(0, 3);
    const considerations = focusGrade.cons.slice(0, 2);
    return {
        summary,
        focusExplanation,
        tips,
        considerations,
    };
}
/**
 * Batch generate insights for multiple foods
 * Uses parallel execution with concurrency limit
 */
async function batchGenerateFoodInsights(inputs) {
    const CONCURRENCY = 3;
    const results = new Map();
    for (let i = 0; i < inputs.length; i += CONCURRENCY) {
        const batch = inputs.slice(i, i + CONCURRENCY);
        const batchResults = await Promise.all(batch.map(async (input) => {
            const insight = await generateFoodInsight(input);
            return { name: input.foodName, insight };
        }));
        for (const { name, insight } of batchResults) {
            results.set(name, insight);
        }
    }
    return results;
}
//# sourceMappingURL=insightGenerator.js.map