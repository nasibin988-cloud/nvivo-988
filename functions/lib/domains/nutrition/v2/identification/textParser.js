"use strict";
/**
 * Text Food Identification
 *
 * Parses natural language food descriptions into structured food items.
 * AI ONLY identifies foods - does NOT estimate nutrition.
 * Nutrition comes from resolution layer (databases).
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.textParserOpenaiApiKey = void 0;
exports.parseFoodText = parseFoodText;
exports.parseMultipleFoods = parseMultipleFoods;
exports.quickParseSingleFood = quickParseSingleFood;
const openai_1 = __importDefault(require("openai"));
const params_1 = require("firebase-functions/params");
const openai_2 = require("../../../../config/openai");
// Define secret for lazy access at runtime
const openaiApiKey = (0, params_1.defineSecret)('OPENAI_API_KEY');
exports.textParserOpenaiApiKey = openaiApiKey;
// Lazy-initialized OpenAI client
let openaiClient = null;
function getOpenAIClient() {
    if (!openaiClient) {
        const apiKey = openaiApiKey.value();
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY secret is not configured');
        }
        openaiClient = new openai_1.default({ apiKey });
    }
    return openaiClient;
}
/**
 * System prompt for text food parsing
 * Strictly focused on identification and portion parsing
 */
const TEXT_PARSER_SYSTEM_PROMPT = `You are a food parsing expert. Your task is to parse natural language food descriptions into structured data.

IMPORTANT RULES:
1. Parse the input into individual food items with quantities
2. Normalize food names to be specific and searchable
3. Convert quantities to grams where possible
4. Identify food type for each item
5. DO NOT estimate nutrition values - only identify and parse

FOOD TYPE CLASSIFICATIONS:
- whole_food: Single natural ingredients (apple, chicken breast, rice)
- restaurant_item: Restaurant/fast food items (Big Mac, Chipotle Burrito)
- branded_packaged: Branded packaged foods (KIND bar, Cheerios)
- homemade_dish: Home-cooked composite dishes (homemade chicken soup)
- generic_dish: Generic prepared foods without brand (cheeseburger, pasta)

QUANTITY CONVERSIONS (approximate):
- 1 cup liquid = 240ml = 240g for water-based
- 1 cup rice/grains (cooked) = 180g
- 1 cup vegetables (chopped) = 100-150g
- 1 tablespoon = 15ml
- 1 teaspoon = 5ml
- 1 oz = 28g
- 1 slice bread = 30g
- 1 medium fruit = 150g
- 1 large egg = 50g
- 1 chicken breast = 170g
- Palm-sized portion meat = 85g
- Fist-sized portion = 200ml/200g

BRAND/RESTAURANT DETECTION:
- Extract brand names from input (e.g., "Starbucks latte" → restaurantName: "Starbucks")
- Recognize common chains: McDonald's, Chipotle, Starbucks, Subway, etc.
- Recognize brands: KIND, Clif, Nature Valley, Cheerios, etc.

OUTPUT FORMAT:
Return a JSON object with an "items" array. Each item:
{
  "name": "specific searchable food name",
  "quantity": number,
  "unit": "serving unit",
  "estimatedGrams": number,
  "foodType": "whole_food" | "restaurant_item" | "branded_packaged" | "homemade_dish" | "generic_dish",
  "restaurantName": "if mentioned" or null,
  "brandName": "if mentioned" or null,
  "ingredients": [{"name": "ingredient", "estimatedGrams": number}] for composite dishes or null,
  "confidence": 0.0-1.0
}`;
/**
 * User prompt template
 */
function createUserPrompt(text) {
    return `Parse the following food description into structured food items. Be specific with food names for database lookup. Return only valid JSON.

Input: "${text}"`;
}
/**
 * Parse text description into food items
 */
async function parseFoodText(text) {
    var _a, _b;
    try {
        // Pre-process: detect obvious patterns
        const preprocessed = preprocessText(text);
        const openai = getOpenAIClient();
        const response = await openai.chat.completions.create({
            model: openai_2.OPENAI_MODEL,
            max_completion_tokens: 2000,
            temperature: 0.1,
            messages: [
                {
                    role: 'system',
                    content: TEXT_PARSER_SYSTEM_PROMPT,
                },
                {
                    role: 'user',
                    content: createUserPrompt(preprocessed),
                },
            ],
            response_format: { type: 'json_object' },
        });
        const rawResponse = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '{"items": []}';
        const parsed = JSON.parse(rawResponse);
        const rawItems = Array.isArray(parsed) ? parsed : parsed.items || [];
        const items = rawItems.map((item) => {
            var _a;
            return ({
                name: item.name || 'Unknown food',
                quantity: item.quantity || 1,
                unit: item.unit || 'serving',
                estimatedGrams: item.estimatedGrams || item.estimated_grams || 100,
                foodType: validateFoodType(item.foodType || item.food_type),
                restaurantName: item.restaurantName || item.restaurant_name || undefined,
                brandName: item.brandName || item.brand_name || undefined,
                cuisineType: item.cuisineType || item.cuisine_type || undefined,
                ingredients: (_a = item.ingredients) === null || _a === void 0 ? void 0 : _a.map((ing) => ({
                    name: ing.name,
                    estimatedGrams: ing.estimatedGrams || ing.estimated_grams || 50,
                })),
                confidence: item.confidence || 0.8,
            });
        });
        return {
            items,
            mealType: inferMealType(text, items),
            parseConfidence: calculateParseConfidence(text, items),
            rawResponse,
        };
    }
    catch (error) {
        console.error('Text parsing error:', error);
        throw new Error('Failed to parse food text');
    }
}
/**
 * Pre-process text to handle common patterns
 */
function preprocessText(text) {
    let processed = text.trim();
    // Normalize common abbreviations
    const abbreviations = {
        'tbsp': 'tablespoon',
        'tsp': 'teaspoon',
        'oz': 'ounce',
        'lb': 'pound',
        'g': 'gram',
        'ml': 'milliliter',
        'c': 'cup',
        'med': 'medium',
        'lg': 'large',
        'sm': 'small',
        'w/': 'with',
        'w/o': 'without',
    };
    for (const [abbr, full] of Object.entries(abbreviations)) {
        // Replace abbreviation only when it's a standalone word
        processed = processed.replace(new RegExp(`\\b${abbr}\\b`, 'gi'), full);
    }
    return processed;
}
/**
 * Validate food type
 */
function validateFoodType(type) {
    const validTypes = [
        'whole_food',
        'restaurant_item',
        'branded_packaged',
        'homemade_dish',
        'generic_dish',
    ];
    if (type && validTypes.includes(type)) {
        return type;
    }
    return 'generic_dish';
}
/**
 * Infer meal type from text and parsed items
 */
function inferMealType(text, items) {
    const combined = (text + ' ' + items.map(i => i.name).join(' ')).toLowerCase();
    // Explicit meal mentions
    if (/\bbreakfast\b/i.test(text))
        return 'breakfast';
    if (/\blunch\b/i.test(text))
        return 'lunch';
    if (/\bdinner\b/i.test(text))
        return 'dinner';
    if (/\bsnack\b/i.test(text))
        return 'snack';
    // Food type indicators
    if (/egg|bacon|pancake|waffle|cereal|oatmeal|toast|bagel|coffee.*morning|orange juice/i.test(combined)) {
        return 'breakfast';
    }
    if (/sandwich|salad|soup|wrap|sub/i.test(combined)) {
        return 'lunch';
    }
    if (/steak|pasta.*dinner|rice.*chicken|curry|roast|wine/i.test(combined)) {
        return 'dinner';
    }
    if (/chip|cookie|candy|bar|nuts|apple|yogurt|smoothie/i.test(combined) && items.length <= 2) {
        return 'snack';
    }
    return 'unknown';
}
/**
 * Calculate parse confidence based on input clarity
 */
function calculateParseConfidence(text, items) {
    let confidence = 0.7; // Base confidence
    // Boost for specific quantities
    if (/\d+\s*(g|gram|oz|cup|tablespoon|teaspoon|slice|piece)/i.test(text)) {
        confidence += 0.1;
    }
    // Boost for brand/restaurant names
    if (items.some(i => i.brandName || i.restaurantName)) {
        confidence += 0.1;
    }
    // Penalty for very short or vague input
    if (text.length < 10) {
        confidence -= 0.2;
    }
    // Penalty for no items parsed
    if (items.length === 0) {
        confidence = 0.3;
    }
    return Math.min(0.95, Math.max(0.3, confidence));
}
/**
 * Parse multiple food entries (e.g., from a meal log)
 * Handles newline-separated or comma-separated lists
 */
async function parseMultipleFoods(text) {
    // Use the same parser - it handles multiple items
    return parseFoodText(text);
}
/**
 * Quick parse for simple single-food queries
 * Uses pattern matching first, AI only if needed
 */
async function quickParseSingleFood(text) {
    // Try pattern matching first
    const patternResult = tryPatternMatch(text);
    if (patternResult) {
        return patternResult;
    }
    // Fall back to AI
    const result = await parseFoodText(text);
    return result.items[0] || null;
}
/**
 * Pattern matching for common simple inputs
 * Avoids AI call for straightforward cases
 */
function tryPatternMatch(text) {
    var _a;
    const normalized = text.toLowerCase().trim();
    // Pattern: "1 apple" or "2 slices bread"
    const simplePattern = /^(\d+(?:\.\d+)?)\s*(small|medium|large|slice|piece|cup|tablespoon|teaspoon|oz|g|ml)?\s*(.+)$/i;
    const match = normalized.match(simplePattern);
    if (match) {
        const quantity = parseFloat(match[1]);
        const unit = ((_a = match[2]) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || 'serving';
        const foodName = match[3].trim();
        // Only use pattern match for obvious whole foods
        const wholeFoodPatterns = [
            'apple', 'banana', 'orange', 'egg', 'bread', 'rice', 'chicken', 'beef', 'fish',
            'milk', 'cheese', 'yogurt', 'carrot', 'broccoli', 'potato', 'tomato',
        ];
        if (wholeFoodPatterns.some(p => foodName.includes(p))) {
            const estimatedGrams = estimateGrams(quantity, unit, foodName);
            return {
                name: foodName,
                quantity,
                unit,
                estimatedGrams,
                foodType: 'whole_food',
                confidence: 0.85,
            };
        }
    }
    return null;
}
/**
 * Estimate grams from quantity and unit
 */
function estimateGrams(quantity, unit, foodName) {
    // Base unit conversions
    const unitGrams = {
        'g': 1,
        'gram': 1,
        'oz': 28,
        'ounce': 28,
        'cup': 240,
        'tablespoon': 15,
        'teaspoon': 5,
        'slice': 30,
        'piece': 100,
        'small': 100,
        'medium': 150,
        'large': 200,
    };
    // Food-specific adjustments
    const foodAdjustments = {
        'apple': 150,
        'banana': 120,
        'orange': 150,
        'egg': 50,
        'bread': 30, // per slice
        'chicken': 170, // per breast
        'rice': 180, // per cup cooked
    };
    // Check for food-specific default
    for (const [food, grams] of Object.entries(foodAdjustments)) {
        if (foodName.includes(food)) {
            return Math.round(quantity * grams);
        }
    }
    // Use unit conversion
    const unitMultiplier = unitGrams[unit] || 100;
    return Math.round(quantity * unitMultiplier);
}
//# sourceMappingURL=textParser.js.map