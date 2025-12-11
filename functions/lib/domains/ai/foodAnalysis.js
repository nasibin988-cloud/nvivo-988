"use strict";
/**
 * AI Food Analysis using OpenAI Vision
 * Analyzes food photos to estimate nutritional content
 *
 * ARCHITECTURE:
 * - All analysis returns COMPLETE nutrition data (35+ nutrients)
 * - UI displays "essential" view by default, user can toggle to see more
 * - Cost optimizations:
 *   1. Common foods lookup (no AI needed)
 *   2. Cache for text-based analysis
 *   3. Tiered model selection (simple vs complex meals)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openaiApiKey = exports.TEXT_FOOD_ANALYSIS_PROMPT = exports.FOOD_ANALYSIS_PROMPT = exports.FOOD_ANALYSIS_FEATURES = void 0;
exports.analyzeFoodPhoto = analyzeFoodPhoto;
exports.analyzeFoodText = analyzeFoodText;
// ============================================================================
// FEATURE FLAGS
// ============================================================================
/**
 * Feature flags for food analysis
 * Set ENABLE_INGREDIENT_BREAKDOWN to true to request ingredient-level breakdown
 * This increases output tokens ~2-3x but provides detailed ingredient analysis
 */
exports.FOOD_ANALYSIS_FEATURES = {
    /** Enable ingredient breakdown for analyzed foods */
    ENABLE_INGREDIENT_BREAKDOWN: false,
};
const openai_1 = __importDefault(require("openai"));
const params_1 = require("firebase-functions/params");
const openai_2 = require("../../config/openai");
const commonFoodsLookup_1 = require("../nutrition/commonFoodsLookup");
const foodAnalysisCache_1 = require("../nutrition/foodAnalysisCache");
// Define OpenAI API key as a secret (for production)
const openaiApiKey = (0, params_1.defineSecret)('OPENAI_API_KEY');
exports.openaiApiKey = openaiApiKey;
/**
 * Get API key from Firebase secret
 */
function getApiKey() {
    const secretValue = openaiApiKey.value();
    if (secretValue) {
        return secretValue;
    }
    throw new Error('OpenAI API key not configured');
}
// ============================================================================
// PROMPT GENERATION - Always returns complete nutrition data
// ============================================================================
/**
 * Ingredient JSON structure (only used when feature is enabled)
 */
const INGREDIENT_JSON_STRUCTURE = `{
        "name": "Ingredient Name",
        "quantity": 100,
        "unit": "g",
        "calories": 50,
        "protein": 2,
        "carbs": 8,
        "fat": 1,
        "percentOfDish": 25
      }`;
/**
 * Complete JSON structure for food analysis response
 */
function getCompleteJsonStructure() {
    const ingredientsField = exports.FOOD_ANALYSIS_FEATURES.ENABLE_INGREDIENT_BREAKDOWN
        ? `,
      "ingredients": [
        ${INGREDIENT_JSON_STRUCTURE}
      ]`
        : '';
    return `{
      "name": "Food Name",
      "quantity": 1,
      "unit": "burger",
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
      "confidence": 0.85${ingredientsField}
    }`;
}
/**
 * Complete nutrient request list
 */
const COMPLETE_NUTRIENT_LIST = `
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
/**
 * Ingredient breakdown instructions (only used when feature is enabled)
 */
const INGREDIENT_BREAKDOWN_INSTRUCTIONS = `
40. For composite dishes (e.g., pasta alfredo, sandwiches, salads), also provide an "ingredients" array breaking down the main components:
    - Each ingredient should have: name, quantity (in grams), unit, calories, protein, carbs, fat
    - Include percentOfDish (0-100) showing what portion of the total dish each ingredient represents
    - The sum of all ingredient calories should approximately equal the total dish calories
    - Focus on the 3-8 main ingredients, not every minor component`;
/**
 * Generate food analysis prompt - always returns complete nutrition
 */
function getFoodAnalysisPrompt() {
    const ingredientInstructions = exports.FOOD_ANALYSIS_FEATURES.ENABLE_INGREDIENT_BREAKDOWN
        ? INGREDIENT_BREAKDOWN_INSTRUCTIONS
        : '';
    return `You are a nutrition expert analyzing a food photo. Analyze this image and provide comprehensive nutrition including all vitamins, minerals, and micronutrients.

IMPORTANT RULES:

1. Identify foods as complete dishes, NOT broken down by ingredients:
   - A cheeseburger is ONE item called "Cheeseburger", not separate bun, patty, cheese, lettuce, etc.
   - A sandwich is ONE item, not bread + fillings
   - A salad is ONE item (e.g., "Caesar Salad"), not lettuce + croutons + dressing
   - A pizza slice is ONE item, not crust + sauce + cheese + toppings
   - Only list SEPARATE food types as separate items (e.g., "Burger" and "French Fries" and "Soda" = 3 items)

2. COUNT ALL visible items and set the quantity accordingly:
   - If there are 3 tacos, set quantity: 3 (not 1)
   - If there are 2 slices of pizza, set quantity: 2
   - If there's a plate of 12 cookies, set quantity: 12
   - The nutrition values should reflect the TOTAL for all items of that type

3. Use SIMPLE units based on count:
   - For countable items use the item name as unit: "burger", "taco", "slice", "cookie", "egg"
   - For non-countable items use standard measures: "cup", "bowl", "oz", "serving"
   - Do NOT include descriptions in the unit (no "approx 1/3 lb patty with bacon...")

4. If NO FOOD is visible in the image (e.g., a selfie, landscape, object, or unclear image):
   - Return an empty items array: "items": []
   - This is important - do not make up food if none is visible

For each food item (as a complete dish), provide:
${COMPLETE_NUTRIENT_LIST}${ingredientInstructions}

Also determine the meal type based on the foods present (breakfast, lunch, dinner, snack, or unknown).

Respond ONLY with a valid JSON object in this exact format:
{
  "items": [
    ${getCompleteJsonStructure()}
  ],
  "mealType": "lunch"
}

Be accurate with portion sizes and nutritional values based on USDA data. The nutrition should reflect the COMPLETE dish (all components combined). If you cannot identify a food item clearly, still make your best estimate but use a lower confidence score.`;
}
// Default prompt (exported for testing/reference)
exports.FOOD_ANALYSIS_PROMPT = getFoodAnalysisPrompt();
/**
 * Parse a nutrition value with appropriate rounding
 */
function parseNutrientValue(value, decimals = 1) {
    if (value === undefined || value === null)
        return undefined;
    const num = Number(value);
    if (isNaN(num))
        return undefined;
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
}
/**
 * Parse all nutrition fields from API response (always complete)
 */
function parseNutritionFields(item) {
    return {
        // Essential fields
        calories: Math.round(Number(item.calories) || 0),
        protein: parseNutrientValue(item.protein) || 0,
        carbs: parseNutrientValue(item.carbs) || 0,
        fat: parseNutrientValue(item.fat) || 0,
        fiber: parseNutrientValue(item.fiber) || 0,
        sugar: parseNutrientValue(item.sugar) || 0,
        sodium: Math.round(Number(item.sodium) || 0),
        // Extended fields
        saturatedFat: parseNutrientValue(item.saturatedFat) || 0,
        transFat: parseNutrientValue(item.transFat) || 0,
        cholesterol: Math.round(Number(item.cholesterol) || 0),
        potassium: Math.round(Number(item.potassium) || 0),
        calcium: Math.round(Number(item.calcium) || 0),
        iron: parseNutrientValue(item.iron) || 0,
        magnesium: Math.round(Number(item.magnesium) || 0),
        // Complete fields - Fat details
        monounsaturatedFat: parseNutrientValue(item.monounsaturatedFat),
        polyunsaturatedFat: parseNutrientValue(item.polyunsaturatedFat),
        // Vitamins (fat-soluble)
        vitaminA: parseNutrientValue(item.vitaminA),
        vitaminD: parseNutrientValue(item.vitaminD),
        vitaminE: parseNutrientValue(item.vitaminE),
        vitaminK: parseNutrientValue(item.vitaminK),
        // Vitamins (water-soluble)
        vitaminC: parseNutrientValue(item.vitaminC),
        thiamin: parseNutrientValue(item.thiamin, 2),
        riboflavin: parseNutrientValue(item.riboflavin, 2),
        niacin: parseNutrientValue(item.niacin),
        vitaminB6: parseNutrientValue(item.vitaminB6, 2),
        folate: parseNutrientValue(item.folate),
        vitaminB12: parseNutrientValue(item.vitaminB12, 2),
        choline: parseNutrientValue(item.choline),
        // Trace minerals
        zinc: parseNutrientValue(item.zinc),
        phosphorus: parseNutrientValue(item.phosphorus),
        selenium: parseNutrientValue(item.selenium),
        copper: parseNutrientValue(item.copper, 2),
        manganese: parseNutrientValue(item.manganese, 2),
        // Other
        caffeine: parseNutrientValue(item.caffeine),
        alcohol: parseNutrientValue(item.alcohol),
        water: parseNutrientValue(item.water),
    };
}
/**
 * Calculate all totals from food items (always complete)
 */
function calculateTotals(items) {
    const round = (n, decimals = 1) => {
        const factor = Math.pow(10, decimals);
        return Math.round(n * factor) / factor;
    };
    // Initialize all totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSugar = 0;
    let totalSodium = 0;
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
        // Complete
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
    return {
        totalCalories: Math.round(totalCalories),
        totalProtein: round(totalProtein),
        totalCarbs: round(totalCarbs),
        totalFat: round(totalFat),
        totalFiber: round(totalFiber),
        totalSugar: round(totalSugar),
        totalSodium: Math.round(totalSodium),
        totalSaturatedFat: round(totalSaturatedFat),
        totalTransFat: round(totalTransFat),
        totalCholesterol: Math.round(totalCholesterol),
        totalPotassium: Math.round(totalPotassium),
        totalCalcium: Math.round(totalCalcium),
        totalIron: round(totalIron),
        totalMagnesium: Math.round(totalMagnesium),
        totalZinc: round(totalZinc),
        totalVitaminA: round(totalVitaminA),
        totalVitaminC: round(totalVitaminC),
        totalVitaminD: round(totalVitaminD),
        totalMonounsaturatedFat: round(totalMonounsaturatedFat),
        totalPolyunsaturatedFat: round(totalPolyunsaturatedFat),
        totalVitaminE: round(totalVitaminE),
        totalVitaminK: round(totalVitaminK),
        totalThiamin: round(totalThiamin, 2),
        totalRiboflavin: round(totalRiboflavin, 2),
        totalNiacin: round(totalNiacin),
        totalVitaminB6: round(totalVitaminB6, 2),
        totalFolate: round(totalFolate),
        totalVitaminB12: round(totalVitaminB12, 2),
        totalCholine: round(totalCholine),
        totalPhosphorus: Math.round(totalPhosphorus),
        totalSelenium: round(totalSelenium),
        totalCopper: round(totalCopper, 2),
        totalManganese: round(totalManganese, 2),
        totalCaffeine: round(totalCaffeine),
        totalWater: round(totalWater),
    };
}
// ============================================================================
// MODEL SELECTION - Cost optimization
// ============================================================================
/**
 * Model configuration for tiered selection
 * - fast: GPT-4o-mini for simple, single-item foods (cheaper)
 * - full: GPT-5.1 for complex plates (more accurate)
 */
const MODEL_CONFIG = {
    fast: {
        model: 'gpt-4o-mini',
        maxCompletionTokens: 3000,
    },
    full: {
        model: openai_2.OPENAI_CONFIG.vision.model,
        maxCompletionTokens: 4000,
    },
};
/**
 * Determine if a food description is simple (single item) or complex (multiple items)
 */
function isSimpleFood(description) {
    const normalizedDesc = description.toLowerCase().trim();
    // Check for conjunctions that indicate multiple items
    const multiItemIndicators = [' and ', ' with ', ' plus ', ',', '&', '\n'];
    for (const indicator of multiItemIndicators) {
        if (normalizedDesc.includes(indicator)) {
            return false;
        }
    }
    // Check word count - simple foods are usually 1-4 words
    const wordCount = normalizedDesc.split(/\s+/).length;
    return wordCount <= 4;
}
// ============================================================================
// PHOTO ANALYSIS
// ============================================================================
/**
 * Analyze a food photo using GPT Vision
 * Always returns complete nutrition data (35+ nutrients)
 *
 * @param imageBase64 - Base64 encoded image
 * @param modelTier - Optional model tier override ('fast' or 'full'). Default: 'full' for photos
 */
async function analyzeFoodPhoto(imageBase64, modelTier = 'full') {
    var _a, _b;
    const apiKey = getApiKey();
    const openai = new openai_1.default({ apiKey });
    const config = MODEL_CONFIG[modelTier];
    const prompt = getFoodAnalysisPrompt();
    try {
        const response = await openai.chat.completions.create({
            model: config.model,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
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
            max_completion_tokens: config.maxCompletionTokens,
            temperature: 0.3,
        });
        const choice = response.choices[0];
        const content = (_a = choice === null || choice === void 0 ? void 0 : choice.message) === null || _a === void 0 ? void 0 : _a.content;
        // Always log response info for debugging
        console.log('OpenAI response received:', {
            model: response.model,
            finishReason: choice === null || choice === void 0 ? void 0 : choice.finish_reason,
            hasContent: !!content,
            contentLength: (_b = content === null || content === void 0 ? void 0 : content.length) !== null && _b !== void 0 ? _b : 0,
            choicesCount: response.choices.length,
        });
        if (!content) {
            console.error('OpenAI empty response details:', JSON.stringify({
                choices: response.choices,
                usage: response.usage,
                model: response.model,
            }, null, 2));
            // Check if it was a content moderation issue
            if ((choice === null || choice === void 0 ? void 0 : choice.finish_reason) === 'content_filter') {
                throw new Error('Image was flagged by content filter. Please try a different photo.');
            }
            // Check if response was cut off
            if ((choice === null || choice === void 0 ? void 0 : choice.finish_reason) === 'length') {
                throw new Error('Response was truncated. Please try again.');
            }
            throw new Error('No response from OpenAI. The image may not have been recognized as food.');
        }
        // Check if response was truncated (even with content)
        if ((choice === null || choice === void 0 ? void 0 : choice.finish_reason) === 'length') {
            console.warn('Response truncated - finish_reason is "length"');
            throw new Error('Too many items to analyze at once. Please take a photo of fewer food items (1-5 items works best).');
        }
        return parseAnalysisResponse(content);
    }
    catch (error) {
        console.error('Food analysis error:', error);
        throw error;
    }
}
// ============================================================================
// TEXT ANALYSIS - with lookup and cache optimizations
// ============================================================================
/**
 * Text-based food analysis prompt
 */
function getTextAnalysisPrompt() {
    const ingredientInstructions = exports.FOOD_ANALYSIS_FEATURES.ENABLE_INGREDIENT_BREAKDOWN
        ? INGREDIENT_BREAKDOWN_INSTRUCTIONS
        : '';
    return `You are a nutrition expert. Analyze the following food description and provide comprehensive nutrition including all vitamins, minerals, and micronutrients.

For each food item in the description, provide:
${COMPLETE_NUTRIENT_LIST}${ingredientInstructions}

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
    ${getCompleteJsonStructure()}
  ],
  "mealType": "lunch",
  "description": "Brief description of the meal"
}

Be accurate with nutritional values based on USDA data when possible. If quantities are specified in the input, use those instead of typical portions.`;
}
// Default text prompt (exported for testing/reference)
exports.TEXT_FOOD_ANALYSIS_PROMPT = getTextAnalysisPrompt();
/**
 * Analyze a text description of food
 * Implements cost optimizations:
 * 1. Common foods lookup (no AI needed)
 * 2. Cache for previously analyzed foods
 * 3. Tiered model selection (simple vs complex)
 *
 * @param foodDescription - Text description of food
 * @param skipCache - Skip cache lookup (for testing)
 */
async function analyzeFoodText(foodDescription, skipCache = false) {
    const normalizedDesc = (0, commonFoodsLookup_1.normalizeForLookup)(foodDescription);
    // OPTION 4: Try common foods lookup first (FREE - no AI call)
    const lookupResult = (0, commonFoodsLookup_1.getCommonFood)(normalizedDesc);
    if (lookupResult) {
        console.log(`[FoodAnalysis] Lookup hit for: ${normalizedDesc}`);
        return {
            ...lookupResult,
            description: foodDescription,
            source: 'lookup',
        };
    }
    // OPTION 3: Try cache lookup (FREE - no AI call)
    if (!skipCache) {
        const cachedResult = await (0, foodAnalysisCache_1.getCachedFoodAnalysis)(normalizedDesc);
        if (cachedResult) {
            console.log(`[FoodAnalysis] Cache hit for: ${normalizedDesc}`);
            return {
                ...cachedResult,
                description: foodDescription,
                source: 'cache',
            };
        }
    }
    // OPTION 2: Determine model tier based on complexity
    const isSimple = isSimpleFood(foodDescription);
    const modelTier = isSimple ? 'fast' : 'full';
    console.log(`[FoodAnalysis] AI call (${modelTier}) for: ${foodDescription.substring(0, 50)}...`);
    // Call AI
    const result = await callTextAnalysisAI(foodDescription, modelTier);
    // Cache the result for future use
    await (0, foodAnalysisCache_1.setCachedFoodAnalysis)(normalizedDesc, result);
    return {
        ...result,
        description: foodDescription,
        source: 'ai',
    };
}
/**
 * Internal: Call AI for text-based food analysis
 */
async function callTextAnalysisAI(foodDescription, modelTier) {
    var _a, _b;
    const apiKey = getApiKey();
    const openai = new openai_1.default({ apiKey });
    const config = MODEL_CONFIG[modelTier];
    try {
        const response = await openai.chat.completions.create({
            model: config.model,
            messages: [
                { role: 'system', content: getTextAnalysisPrompt() },
                { role: 'user', content: `Analyze this food: ${foodDescription}` },
            ],
            max_completion_tokens: config.maxCompletionTokens,
            temperature: 0.3,
        });
        const content = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
        if (!content) {
            throw new Error('No response from OpenAI');
        }
        return parseAnalysisResponse(content);
    }
    catch (error) {
        console.error('Text food analysis error:', error);
        throw error;
    }
}
// ============================================================================
// RESPONSE PARSING
// ============================================================================
/**
 * Parse ingredients array from item (only when feature is enabled)
 */
function parseIngredients(rawIngredients) {
    if (!exports.FOOD_ANALYSIS_FEATURES.ENABLE_INGREDIENT_BREAKDOWN) {
        return undefined;
    }
    if (!Array.isArray(rawIngredients) || rawIngredients.length === 0) {
        return undefined;
    }
    return rawIngredients.map((ing) => ({
        name: String(ing.name || 'Unknown ingredient'),
        quantity: Number(ing.quantity) || 0,
        unit: String(ing.unit || 'g'),
        calories: Math.round(Number(ing.calories) || 0),
        protein: Math.round((Number(ing.protein) || 0) * 10) / 10,
        carbs: Math.round((Number(ing.carbs) || 0) * 10) / 10,
        fat: Math.round((Number(ing.fat) || 0) * 10) / 10,
        percentOfDish: ing.percentOfDish ? Math.round(Number(ing.percentOfDish)) : undefined,
    }));
}
/**
 * Parse AI response into FoodAnalysisResult
 */
function parseAnalysisResponse(content) {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Could not parse JSON from response');
    }
    let parsed;
    try {
        parsed = JSON.parse(jsonMatch[0]);
    }
    catch (parseError) {
        console.error('JSON parse error - likely truncated response:', parseError);
        throw new Error('Too many items to analyze at once. Please take a photo of fewer food items (1-5 items works best).');
    }
    const items = (parsed.items || []).map((item) => {
        const nutritionFields = parseNutritionFields(item);
        const ingredients = parseIngredients(item.ingredients);
        return {
            name: String(item.name || 'Unknown food'),
            quantity: Number(item.quantity) || 1,
            unit: String(item.unit || 'serving'),
            ...nutritionFields,
            servingMultiplier: Number(item.servingMultiplier) || 1,
            confidence: Math.min(1, Math.max(0, Number(item.confidence) || 0.7)),
            ...(ingredients && { ingredients }),
        };
    });
    // Handle case where no food was detected in the image
    if (items.length === 0) {
        throw new Error('No food detected in this image. Please take a photo of food or a meal.');
    }
    const totals = calculateTotals(items);
    const mealType = ['breakfast', 'lunch', 'dinner', 'snack'].includes(parsed.mealType)
        ? parsed.mealType
        : 'unknown';
    return {
        items,
        detailLevel: 'complete', // Always complete now
        ...totals,
        mealType,
    };
}
//# sourceMappingURL=foodAnalysis.js.map