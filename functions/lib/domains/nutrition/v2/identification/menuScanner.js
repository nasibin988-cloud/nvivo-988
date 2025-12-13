"use strict";
/**
 * Menu Scanner
 *
 * Uses GPT-5.1 vision to identify menu items and restaurant from menu images.
 * AI ONLY identifies items - does NOT estimate nutrition.
 * Nutrition comes from resolution layer (databases).
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuScannerOpenaiApiKey = void 0;
exports.scanMenu = scanMenu;
exports.scanMenuFromUrl = scanMenuFromUrl;
exports.getSelectedMenuItems = getSelectedMenuItems;
exports.selectMenuItems = selectMenuItems;
exports.menuItemsToDescriptors = menuItemsToDescriptors;
const openai_1 = __importDefault(require("openai"));
const params_1 = require("firebase-functions/params");
const openai_2 = require("../../../../config/openai");
// Define secret for lazy access at runtime
const openaiApiKey = (0, params_1.defineSecret)('OPENAI_API_KEY');
exports.menuScannerOpenaiApiKey = openaiApiKey;
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
 * System prompt for menu scanning
 */
const MENU_SCAN_SYSTEM_PROMPT = `You are a menu analysis expert. Your task is to:
1. Identify the restaurant (name, logo, cuisine type)
2. Extract all menu items with their descriptions and prices
3. Classify each item by food type

IMPORTANT RULES:
1. Extract the restaurant name if visible (logo, header, watermark)
2. List ALL menu items you can see, even partially visible ones
3. Include item descriptions and prices when visible
4. Classify each item by food type for better nutrition lookup
5. DO NOT estimate nutrition - only identify items

FOOD TYPE CLASSIFICATIONS:
- restaurant_item: Most menu items (default for restaurant menus)
- whole_food: Simple single ingredients (side of vegetables, plain rice)
- generic_dish: Generic items without restaurant branding

RESTAURANT DETECTION:
- Look for logos, headers, footers, watermarks
- Common chains: McDonald's, Chipotle, Subway, Starbucks, Panera, etc.
- Note the cuisine type (Mexican, Italian, American, etc.)

OUTPUT FORMAT:
Return a JSON object:
{
  "restaurant": {
    "name": "restaurant name or null",
    "logoDetected": boolean,
    "confidence": 0.0-1.0,
    "cuisine": "cuisine type or null"
  },
  "menuItems": [
    {
      "id": "unique_id",
      "name": "item name",
      "description": "item description if visible" or null,
      "price": "$X.XX" or null,
      "quantity": 1,
      "unit": "serving",
      "estimatedGrams": number (rough estimate for typical serving),
      "foodType": "restaurant_item" | "whole_food" | "generic_dish",
      "confidence": 0.0-1.0
    }
  ],
  "scanConfidence": 0.0-1.0
}`;
const MENU_SCAN_USER_PROMPT = `Scan this menu image. Extract the restaurant information and all menu items. Return only valid JSON.`;
/**
 * Scan a menu image
 */
async function scanMenu(imageBase64, mimeType = 'image/jpeg') {
    var _a, _b;
    try {
        const openai = getOpenAIClient();
        const response = await openai.chat.completions.create({
            model: openai_2.OPENAI_MODEL,
            max_completion_tokens: 4000, // Menus can have many items
            temperature: 0.1,
            messages: [
                {
                    role: 'system',
                    content: MENU_SCAN_SYSTEM_PROMPT,
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: MENU_SCAN_USER_PROMPT,
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${mimeType};base64,${imageBase64}`,
                                detail: 'high',
                            },
                        },
                    ],
                },
            ],
            response_format: { type: 'json_object' },
        });
        const rawResponse = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '{}';
        return parseMenuScanResponse(rawResponse);
    }
    catch (error) {
        console.error('Menu scan error:', error);
        throw new Error('Failed to scan menu');
    }
}
/**
 * Scan a menu from URL
 */
async function scanMenuFromUrl(imageUrl) {
    var _a, _b;
    try {
        const openai = getOpenAIClient();
        const response = await openai.chat.completions.create({
            model: openai_2.OPENAI_MODEL,
            max_completion_tokens: 4000,
            temperature: 0.1,
            messages: [
                {
                    role: 'system',
                    content: MENU_SCAN_SYSTEM_PROMPT,
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: MENU_SCAN_USER_PROMPT,
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
        const rawResponse = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '{}';
        return parseMenuScanResponse(rawResponse);
    }
    catch (error) {
        console.error('Menu scan from URL error:', error);
        throw new Error('Failed to scan menu from URL');
    }
}
/**
 * Parse the menu scan response
 */
function parseMenuScanResponse(rawResponse) {
    var _a, _b, _c, _d;
    const parsed = JSON.parse(rawResponse);
    // Extract restaurant info
    const restaurant = {
        name: ((_a = parsed.restaurant) === null || _a === void 0 ? void 0 : _a.name) || null,
        logoDetected: ((_b = parsed.restaurant) === null || _b === void 0 ? void 0 : _b.logoDetected) || false,
        confidence: ((_c = parsed.restaurant) === null || _c === void 0 ? void 0 : _c.confidence) || 0.5,
        cuisine: ((_d = parsed.restaurant) === null || _d === void 0 ? void 0 : _d.cuisine) || undefined,
    };
    // Extract menu items
    const rawItems = parsed.menuItems || [];
    const menuItems = rawItems.map((item, index) => ({
        id: item.id || `item_${index}`,
        name: item.name || 'Unknown item',
        description: item.description || undefined,
        price: item.price || undefined,
        quantity: item.quantity || 1,
        unit: item.unit || 'serving',
        estimatedGrams: item.estimatedGrams || item.estimated_grams || estimateMenuItemGrams(item.name || ''),
        foodType: validateFoodType(item.foodType || item.food_type),
        restaurantName: restaurant.name || undefined,
        cuisineType: restaurant.cuisine || undefined,
        confidence: item.confidence || 0.7,
        isSelected: false,
    }));
    // Extract raw text (combine item names for reference)
    const rawText = menuItems.map(item => {
        let text = item.name;
        if (item.description)
            text += ` - ${item.description}`;
        if (item.price)
            text += ` ${item.price}`;
        return text;
    }).join('\n');
    return {
        restaurant,
        menuItems,
        rawText,
        scanConfidence: parsed.scanConfidence || calculateScanConfidence(restaurant, menuItems),
    };
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
    return 'restaurant_item'; // Default for menu items
}
/**
 * Estimate grams for a menu item based on type
 */
function estimateMenuItemGrams(itemName) {
    const nameLower = itemName.toLowerCase();
    // Common menu item estimates
    if (/burger|sandwich|sub/i.test(nameLower))
        return 250;
    if (/salad/i.test(nameLower))
        return 300;
    if (/soup|bowl/i.test(nameLower))
        return 350;
    if (/wrap|burrito|taco/i.test(nameLower))
        return 300;
    if (/pizza/i.test(nameLower))
        return 200; // per slice
    if (/appetizer|starter|side/i.test(nameLower))
        return 150;
    if (/dessert|cake|pie/i.test(nameLower))
        return 150;
    if (/drink|coffee|tea|juice|soda/i.test(nameLower))
        return 350;
    if (/smoothie|shake/i.test(nameLower))
        return 450;
    if (/entree|main|plate/i.test(nameLower))
        return 400;
    if (/chicken|steak|fish/i.test(nameLower))
        return 250;
    if (/pasta|noodle/i.test(nameLower))
        return 350;
    if (/rice|grain/i.test(nameLower))
        return 200;
    if (/fries|chips/i.test(nameLower))
        return 150;
    return 300; // Default for unknown items
}
/**
 * Calculate overall scan confidence
 */
function calculateScanConfidence(restaurant, menuItems) {
    let confidence = 0.5; // Base confidence
    // Boost for detected restaurant
    if (restaurant.name) {
        confidence += 0.2;
    }
    // Boost for logo detection
    if (restaurant.logoDetected) {
        confidence += 0.1;
    }
    // Boost for number of items (more items = clearer menu)
    if (menuItems.length >= 5) {
        confidence += 0.1;
    }
    // Average item confidence
    if (menuItems.length > 0) {
        const avgItemConfidence = menuItems.reduce((sum, item) => sum + item.confidence, 0) / menuItems.length;
        confidence = (confidence + avgItemConfidence) / 2;
    }
    return Math.min(0.95, Math.max(0.3, confidence));
}
/**
 * Filter menu items by selection
 */
function getSelectedMenuItems(result) {
    return result.menuItems.filter(item => item.isSelected);
}
/**
 * Select menu items by IDs
 */
function selectMenuItems(result, itemIds) {
    const updatedItems = result.menuItems.map(item => ({
        ...item,
        isSelected: itemIds.includes(item.id),
    }));
    return {
        ...result,
        menuItems: updatedItems,
    };
}
/**
 * Convert selected menu items to NormalizedFoodDescriptors for resolution
 */
function menuItemsToDescriptors(items, restaurantName) {
    return items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        estimatedGrams: item.estimatedGrams,
        foodType: item.foodType,
        restaurantName: restaurantName || item.restaurantName || undefined,
        cuisineType: item.cuisineType,
        confidence: item.confidence,
    }));
}
//# sourceMappingURL=menuScanner.js.map