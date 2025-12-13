"use strict";
/**
 * AI Menu Scanning using OpenAI Vision
 * Analyzes restaurant menu photos to extract items and estimate nutritional content
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanMenuPhoto = scanMenuPhoto;
const openai_1 = __importDefault(require("openai"));
const params_1 = require("firebase-functions/params");
const openai_2 = require("../../config/openai");
const foodIntelligenceLookup_1 = require("../nutrition/foodIntelligenceLookup");
// Define OpenAI API key as a secret (for production)
const openaiApiKey = (0, params_1.defineSecret)('OPENAI_API_KEY');
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
const MENU_SCAN_PROMPT = `You are a nutrition expert analyzing a restaurant menu photo. Extract all visible menu items and estimate their nutritional content.

For each menu item you can identify:
1. Name of the item exactly as shown
2. Description if visible
3. Price if visible (include currency symbol)
4. Estimated calories
5. Estimated protein (grams)
6. Estimated carbohydrates (grams)
7. Estimated fat (grams)
8. Estimated fiber (grams)
9. Estimated sugar (grams)
10. Estimated sodium (milligrams)
11. Your confidence level (0-1) in the item identification and nutrition estimates

Also try to identify:
- Restaurant name (from logo, header, or watermark)
- Cuisine type (American, Italian, Mexican, Asian, etc.)

Base your nutrition estimates on typical restaurant portion sizes and standard recipes. For items where nutrition is uncertain, provide reasonable estimates based on similar dishes.

Respond ONLY with a valid JSON object in this exact format:
{
  "restaurant": {
    "name": "Restaurant Name or null if unknown",
    "logoDetected": false,
    "confidence": 0.7,
    "cuisine": "American"
  },
  "menuItems": [
    {
      "name": "Grilled Chicken Salad",
      "description": "Mixed greens with grilled chicken breast",
      "price": "$12.99",
      "calories": 420,
      "protein": 35,
      "carbs": 18,
      "fat": 22,
      "fiber": 4,
      "sugar": 6,
      "sodium": 680,
      "confidence": 0.85
    }
  ],
  "rawText": "Extracted text from the menu...",
  "scanConfidence": 0.8
}

Important guidelines:
- Extract ALL visible menu items, even partially visible ones (use lower confidence)
- For combo meals, estimate combined nutrition
- If prices aren't visible, omit the price field
- Use realistic restaurant portion sizes (typically larger than home cooking)
- Account for cooking methods (fried items have more fat/calories)
- If the image is not a menu, return empty menuItems array with low scanConfidence`;
/**
 * Generate a unique ID for menu items
 */
function generateId() {
    return `menu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Scan a menu photo using GPT-4 Vision
 */
async function scanMenuPhoto(imageBase64) {
    var _a, _b, _c, _d, _e, _f;
    const apiKey = getApiKey();
    const openai = new openai_1.default({
        apiKey,
    });
    try {
        const response = await openai.chat.completions.create({
            model: openai_2.OPENAI_CONFIG.vision.model,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: MENU_SCAN_PROMPT,
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
            max_completion_tokens: openai_2.OPENAI_CONFIG.vision.maxCompletionTokens,
            temperature: openai_2.OPENAI_CONFIG.vision.temperature,
        });
        const content = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
        if (!content) {
            throw new Error('No response from OpenAI');
        }
        // Parse JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Could not parse JSON from response');
        }
        const parsed = JSON.parse(jsonMatch[0]);
        // Validate and transform restaurant info
        const restaurant = {
            name: ((_c = parsed.restaurant) === null || _c === void 0 ? void 0 : _c.name) || null,
            logoDetected: Boolean((_d = parsed.restaurant) === null || _d === void 0 ? void 0 : _d.logoDetected),
            confidence: Math.min(1, Math.max(0, Number((_e = parsed.restaurant) === null || _e === void 0 ? void 0 : _e.confidence) || 0.5)),
            cuisine: ((_f = parsed.restaurant) === null || _f === void 0 ? void 0 : _f.cuisine) || undefined,
        };
        // Validate and transform menu items with intelligence enrichment
        const menuItems = (parsed.menuItems || []).map((item) => {
            const name = String(item.name || 'Unknown item');
            // Enrich with food intelligence data (includes focus grades, GI, satiety, etc.)
            const intelligence = (0, foodIntelligenceLookup_1.getFoodIntelligence)(name);
            return {
                id: generateId(),
                name,
                description: item.description ? String(item.description) : undefined,
                price: item.price ? String(item.price) : undefined,
                calories: Math.round(Number(item.calories) || 0),
                protein: Math.round(Number(item.protein) || 0),
                carbs: Math.round(Number(item.carbs) || 0),
                fat: Math.round(Number(item.fat) || 0),
                fiber: item.fiber ? Math.round(Number(item.fiber)) : undefined,
                sugar: item.sugar ? Math.round(Number(item.sugar)) : undefined,
                sodium: item.sodium ? Math.round(Number(item.sodium)) : undefined,
                isSelected: false,
                confidence: Math.min(1, Math.max(0, Number(item.confidence) || 0.5)),
                ...(intelligence && { intelligence }),
            };
        });
        return {
            restaurant,
            menuItems,
            rawText: String(parsed.rawText || ''),
            scanConfidence: Math.min(1, Math.max(0, Number(parsed.scanConfidence) || 0.5)),
        };
    }
    catch (error) {
        console.error('Menu scan error:', error);
        throw error;
    }
}
//# sourceMappingURL=menuScanning.js.map