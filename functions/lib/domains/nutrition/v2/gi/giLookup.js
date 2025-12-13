"use strict";
/**
 * Glycemic Index Lookup Functions
 *
 * Lookup cascade:
 * 1. Exact match in database
 * 2. Alias match
 * 3. Fuzzy match (word overlap)
 * 4. Category default
 *
 * GL Calculation: GL = (GI × net_carbs_per_serving) / 100
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupGI = lookupGI;
exports.batchLookupGI = batchLookupGI;
exports.getGIBand = getGIBand;
exports.getGLBand = getGLBand;
exports.hasRelevantGI = hasRelevantGI;
exports.getGIExplanation = getGIExplanation;
exports.calculateMealGI = calculateMealGI;
exports.calculateMealGL = calculateMealGL;
const giDatabase_1 = require("./giDatabase");
// GI thresholds (from Sydney University)
const GI_LOW_MAX = 55;
const GI_MEDIUM_MAX = 69;
// GL thresholds (standard)
const GL_LOW_MAX = 10;
const GL_MEDIUM_MAX = 19;
/**
 * Main GI lookup function
 * Returns GI, GL, and bands for a food
 */
function lookupGI(foodName, nutrition, servingGrams) {
    const normalizedName = normalizeFoodName(foodName);
    // 1. Try exact match
    let entry = giDatabase_1.GI_DATABASE[normalizedName];
    let source = 'exact';
    // 2. Try alias match
    if (!entry) {
        const aliasMatch = findByAlias(normalizedName);
        if (aliasMatch) {
            entry = aliasMatch;
            source = 'exact'; // Alias is still considered exact
        }
    }
    // 3. Try fuzzy match
    if (!entry) {
        const fuzzy = findFuzzyMatch(normalizedName);
        if (fuzzy) {
            entry = fuzzy.entry;
            source = 'fuzzy';
        }
    }
    // 4. Fall back to category default
    if (!entry) {
        const category = inferCategory(normalizedName, nutrition);
        const defaultGI = giDatabase_1.CATEGORY_DEFAULTS[category];
        entry = {
            gi: defaultGI,
            servingGrams: 100,
            carbsPerServing: nutrition.carbs,
            confidence: 'low',
            category,
        };
        source = 'category';
    }
    // Calculate GL based on actual nutrition
    const netCarbs = calculateNetCarbs(nutrition, servingGrams);
    const gl = Math.round((entry.gi * netCarbs) / 100);
    return {
        gi: entry.gi,
        gl,
        giBand: getGIBand(entry.gi),
        glBand: getGLBand(gl),
        source,
        confidence: calculateConfidence(entry, source),
    };
}
/**
 * Batch lookup GI for multiple foods
 */
function batchLookupGI(foods) {
    const results = new Map();
    for (const food of foods) {
        const result = lookupGI(food.name, food.nutrition, food.servingGrams);
        results.set(food.name, result);
    }
    return results;
}
/**
 * Get GI band classification
 */
function getGIBand(gi) {
    if (gi <= GI_LOW_MAX)
        return 'low';
    if (gi <= GI_MEDIUM_MAX)
        return 'medium';
    return 'high';
}
/**
 * Get GL band classification
 */
function getGLBand(gl) {
    if (gl <= GL_LOW_MAX)
        return 'low';
    if (gl <= GL_MEDIUM_MAX)
        return 'medium';
    return 'high';
}
/**
 * Calculate net carbs (total carbs - fiber)
 */
function calculateNetCarbs(nutrition, servingGrams) {
    const carbs = nutrition.carbs || 0;
    const fiber = nutrition.fiber || 0;
    return Math.max(0, carbs - fiber);
}
/**
 * Normalize food name for lookup
 */
function normalizeFoodName(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        // Remove common modifiers that don't affect GI
        .replace(/\b(raw|fresh|cooked|boiled|baked|grilled|roasted|steamed|organic)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}
/**
 * Find entry by alias
 */
function findByAlias(normalizedName) {
    var _a;
    for (const [_, entry] of Object.entries(giDatabase_1.GI_DATABASE)) {
        if ((_a = entry.aliases) === null || _a === void 0 ? void 0 : _a.some(alias => alias.toLowerCase() === normalizedName ||
            normalizedName.includes(alias.toLowerCase()))) {
            return entry;
        }
    }
    return null;
}
/**
 * Find fuzzy match using word overlap
 */
function findFuzzyMatch(normalizedName) {
    const queryWords = normalizedName.split(/\s+/);
    let bestMatch = null;
    for (const [name, entry] of Object.entries(giDatabase_1.GI_DATABASE)) {
        const nameWords = name.split(/\s+/);
        // Calculate word overlap
        let matching = 0;
        for (const qw of queryWords) {
            if (nameWords.some(nw => nw === qw || nw.includes(qw) || qw.includes(nw))) {
                matching++;
            }
        }
        const score = matching / Math.max(queryWords.length, nameWords.length);
        // Also check aliases
        let aliasScore = 0;
        if (entry.aliases) {
            for (const alias of entry.aliases) {
                const aliasWords = alias.toLowerCase().split(/\s+/);
                let aliasMatching = 0;
                for (const qw of queryWords) {
                    if (aliasWords.some(aw => aw === qw || aw.includes(qw) || qw.includes(aw))) {
                        aliasMatching++;
                    }
                }
                aliasScore = Math.max(aliasScore, aliasMatching / Math.max(queryWords.length, aliasWords.length));
            }
        }
        const finalScore = Math.max(score, aliasScore);
        if (finalScore > 0.5 && (!bestMatch || finalScore > bestMatch.score)) {
            bestMatch = { entry, score: finalScore };
        }
    }
    return bestMatch;
}
/**
 * Infer food category from name and nutrition
 */
function inferCategory(name, nutrition) {
    const nameLower = name.toLowerCase();
    // Check for category keywords
    const categoryKeywords = {
        bread: ['bread', 'toast', 'roll', 'bun', 'bagel', 'muffin', 'croissant', 'pita', 'tortilla'],
        cereal: ['cereal', 'oatmeal', 'granola', 'muesli', 'porridge', 'flakes'],
        rice: ['rice', 'risotto'],
        pasta: ['pasta', 'spaghetti', 'noodle', 'penne', 'macaroni', 'fettuccine', 'linguine', 'lasagna'],
        grain: ['quinoa', 'couscous', 'bulgur', 'barley', 'buckwheat', 'millet', 'farro', 'polenta'],
        legume: ['bean', 'lentil', 'chickpea', 'pea', 'hummus', 'dal', 'falafel'],
        vegetable: ['vegetable', 'salad', 'broccoli', 'spinach', 'carrot', 'potato', 'tomato', 'pepper', 'onion', 'mushroom', 'celery', 'corn', 'squash'],
        fruit: ['apple', 'banana', 'orange', 'grape', 'berry', 'melon', 'mango', 'peach', 'pear', 'plum', 'cherry', 'pineapple', 'fruit'],
        dairy: ['milk', 'yogurt', 'cheese', 'cream', 'ice cream', 'custard', 'pudding'],
        beverage: ['juice', 'soda', 'cola', 'drink', 'smoothie', 'shake'],
        snack: ['chip', 'cracker', 'cookie', 'cake', 'chocolate', 'candy', 'nut', 'bar', 'popcorn', 'pretzel'],
        sweetener: ['sugar', 'honey', 'syrup', 'sweetener'],
        mixed_meal: ['pizza', 'burger', 'sandwich', 'taco', 'burrito', 'curry', 'soup', 'stew', 'casserole'],
        other: [],
    };
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(kw => nameLower.includes(kw))) {
            return category;
        }
    }
    // Infer from nutrition profile
    if (nutrition.protein > 15 && nutrition.carbs < 10) {
        // High protein, low carb - likely protein source (no significant GI)
        return 'other';
    }
    if (nutrition.carbs > 40) {
        // High carb - likely grain/starch
        return 'grain';
    }
    if (nutrition.sugar > 15 && nutrition.carbs > 20) {
        // High sugar - likely fruit or sweet
        return 'fruit';
    }
    if (nutrition.fiber > 5 && nutrition.carbs < 15) {
        // High fiber, low carb - likely vegetable
        return 'vegetable';
    }
    return 'other';
}
/**
 * Calculate confidence score based on match type and entry confidence
 */
function calculateConfidence(entry, source) {
    const baseConfidence = {
        high: 0.95,
        medium: 0.80,
        low: 0.65,
    };
    const sourceMultiplier = {
        exact: 1.0,
        fuzzy: 0.85,
        category: 0.60,
        default: 0.40,
    };
    return baseConfidence[entry.confidence] * sourceMultiplier[source];
}
/**
 * Check if a food typically has GI data
 * (proteins/fats without carbs don't have meaningful GI)
 */
function hasRelevantGI(nutrition) {
    // Foods with < 5g carbs per serving don't have meaningful GI
    return nutrition.carbs >= 5;
}
/**
 * Get GI explanation text
 */
function getGIExplanation(giResult) {
    const giBandText = {
        low: 'Low GI foods cause a slower, steadier rise in blood sugar',
        medium: 'Medium GI foods cause a moderate rise in blood sugar',
        high: 'High GI foods cause a rapid spike in blood sugar',
    };
    const glBandText = {
        low: 'This serving has a low glycemic load',
        medium: 'This serving has a moderate glycemic load',
        high: 'This serving has a high glycemic load',
    };
    return `${giBandText[giResult.giBand]}. ${glBandText[giResult.glBand]}.`;
}
/**
 * Calculate combined GI for a meal (weighted average by carb content)
 */
function calculateMealGI(items) {
    const totalCarbs = items.reduce((sum, item) => sum + item.carbsInServing, 0);
    if (totalCarbs === 0) {
        return { gi: 0, giBand: 'low' };
    }
    const weightedGI = items.reduce((sum, item) => sum + (item.gi * item.carbsInServing), 0) / totalCarbs;
    const roundedGI = Math.round(weightedGI);
    return {
        gi: roundedGI,
        giBand: getGIBand(roundedGI),
    };
}
/**
 * Calculate combined GL for a meal (sum of individual GLs)
 */
function calculateMealGL(items) {
    const totalGL = items.reduce((sum, item) => sum + item.gl, 0);
    return {
        gl: totalGL,
        glBand: getGLBand(totalGL),
    };
}
//# sourceMappingURL=giLookup.js.map