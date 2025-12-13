"use strict";
/**
 * Food Intelligence Lookup
 *
 * Provides food intelligence data (insights, focus grades, GI, satiety, etc.)
 * from the enhanced foods database. This enriches food analysis results with
 * contextual information beyond raw nutrition facts.
 *
 * Loads ALL batch files from the enhanced directory and handles multiple
 * schema variants.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFoodIntelligence = getFoodIntelligence;
exports.getFocusGradeForFood = getFocusGradeForFood;
exports.hasIntelligence = hasIntelligence;
exports.getIntelligenceFoodCount = getIntelligenceFoodCount;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ============================================================================
// SCHEMA MAPPING
// ============================================================================
// Map old focus keys to new standardized keys
const FOCUS_KEY_MAP = {
    // Direct mappings
    balanced: 'balanced',
    muscle_building: 'muscle_building',
    heart_health: 'heart_health',
    energy: 'energy',
    weight_management: 'weight_management',
    brain_focus: 'brain_focus',
    gut_health: 'gut_health',
    blood_sugar: 'blood_sugar',
    bone_joint: 'bone_joint',
    anti_inflammatory: 'anti_inflammatory',
    // Alternative names from batch files
    general: 'balanced',
    diabetes: 'blood_sugar',
    hypertension: 'heart_health',
    weight_loss: 'weight_management',
    kidney_health: 'balanced', // map to balanced as closest
    inflammation: 'anti_inflammatory',
    bone_health: 'bone_joint',
};
// Map processing level to NOVA class
const PROCESSING_TO_NOVA = {
    unprocessed: 1,
    minimally_processed: 1,
    processed_culinary: 2,
    processed: 3,
    moderately_processed: 3,
    ultra_processed: 4,
    highly_processed: 4,
};
// ============================================================================
// HELPERS
// ============================================================================
/**
 * Safely get a nested property from an object
 */
function getNestedValue(obj, ...paths) {
    for (const pathStr of paths) {
        const keys = pathStr.split('.');
        let value = obj;
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            }
            else {
                value = undefined;
                break;
            }
        }
        if (value !== undefined)
            return value;
    }
    return undefined;
}
/**
 * Convert dietary flags object to tags array
 */
function convertDietaryFlagsToTags(flags) {
    const tags = [];
    if (flags.isVegetarian)
        tags.push('vegetarian');
    if (flags.isVegan)
        tags.push('vegan');
    if (flags.isGlutenFree)
        tags.push('gluten_free');
    if (flags.isDairyFree)
        tags.push('dairy_free');
    if (flags.isKeto)
        tags.push('keto');
    if (flags.isPaleo)
        tags.push('paleo');
    if (flags.isWholeFoodPlantBased)
        tags.push('whole_food_plant_based');
    if (flags.isLowCarb)
        tags.push('low_carb');
    if (flags.isHighProtein)
        tags.push('high_protein');
    if (flags.isLowSodium)
        tags.push('low_sodium');
    return tags;
}
/**
 * Convert raw focus grades to typed FoodFocusGrades
 * Handles both old format (balanced, muscle_building, etc.) and
 * new format (general, diabetes, hypertension, etc.)
 */
function convertFocusGrades(rawGrades) {
    const result = {};
    for (const [rawKey, rawValue] of Object.entries(rawGrades)) {
        if (!rawValue || typeof rawValue !== 'object')
            continue;
        const mappedKey = FOCUS_KEY_MAP[rawKey];
        if (!mappedKey)
            continue;
        const raw = rawValue;
        // Handle both 'insight' and 'reasoning' fields
        const insight = String(raw.insight || raw.reasoning || '');
        const grade = {
            grade: String(raw.grade || 'C'),
            score: Number(raw.score) || 50,
            insight,
            pros: Array.isArray(raw.pros) ? raw.pros.map(String) : [],
            cons: Array.isArray(raw.cons) ? raw.cons.map(String) : [],
        };
        // Don't overwrite if we already have a value for this key
        // (in case multiple source keys map to same target)
        if (!result[mappedKey]) {
            result[mappedKey] = grade;
        }
    }
    return Object.keys(result).length > 0 ? result : undefined;
}
/**
 * Extract intelligence data from a food entry with varying structure
 */
function extractIntelligence(entry) {
    const intelligence = {};
    // Extract insight from various locations
    const insight = getNestedValue(entry, 'insight', 'healthMetrics.insight', 'focusGrades.general.reasoning', 'focusGrades.balanced.insight');
    if (insight) {
        intelligence.insight = insight;
    }
    // Extract focus grades
    const focusGrades = getNestedValue(entry, 'focusGrades');
    if (focusGrades) {
        intelligence.focusGrades = convertFocusGrades(focusGrades);
    }
    // Extract glycemic data from multiple possible locations
    const gi = getNestedValue(entry, 'glycemicIndex', 'healthMetrics.glycemicIndex', 'derivedScores.glycemicIndex');
    if (typeof gi === 'number') {
        intelligence.glycemicIndex = gi;
        // Auto-calculate category if not provided
        if (!intelligence.glycemicCategory) {
            intelligence.glycemicCategory = gi <= 55 ? 'low' : gi <= 69 ? 'medium' : 'high';
        }
    }
    const gl = getNestedValue(entry, 'glycemicLoad', 'healthMetrics.glycemicLoad', 'derivedScores.glycemicLoad');
    if (typeof gl === 'number') {
        intelligence.glycemicLoad = gl;
    }
    // Extract satiety score
    const satiety = getNestedValue(entry, 'satietyScore', 'healthMetrics.satietyScore', 'derivedScores.satietyScore');
    if (typeof satiety === 'number') {
        intelligence.satietyScore = satiety;
    }
    // Extract inflammatory index/score
    const inflammatory = getNestedValue(entry, 'inflammatoryIndex', 'inflammatoryScore', 'healthMetrics.inflammatoryScore', 'healthMetrics.inflammatoryIndex', 'derivedScores.inflammatoryIndex');
    if (typeof inflammatory === 'number') {
        intelligence.inflammatoryIndex = inflammatory;
    }
    // Extract NOVA class or derive from processing level
    let nova = getNestedValue(entry, 'novaClass', 'healthMetrics.novaClass', 'derivedScores.novaClass');
    if (!nova) {
        const processingLevel = getNestedValue(entry, 'processingLevel', 'healthMetrics.processingLevel');
        if (processingLevel) {
            nova = PROCESSING_TO_NOVA[processingLevel];
        }
    }
    if (nova && [1, 2, 3, 4].includes(nova)) {
        intelligence.novaClass = nova;
    }
    // Extract dietary tags from multiple sources
    let tags = getNestedValue(entry, 'dietaryTags', 'tags');
    if (!tags || tags.length === 0) {
        const dietaryFlags = getNestedValue(entry, 'dietaryFlags', 'healthMetrics.dietaryFlags');
        if (dietaryFlags) {
            tags = convertDietaryFlagsToTags(dietaryFlags);
        }
    }
    if (Array.isArray(tags) && tags.length > 0) {
        intelligence.dietaryTags = tags;
    }
    // Extract allergens
    const allergens = getNestedValue(entry, 'allergens', 'healthMetrics.allergens');
    if (Array.isArray(allergens) && allergens.length > 0) {
        intelligence.allergens = allergens;
    }
    // Extract nutrient density score
    const nutrientDensity = getNestedValue(entry, 'nutrientDensityScore', 'nutrientDensity', 'healthMetrics.nutrientDensity', 'derivedScores.nutrientDensityScore');
    if (typeof nutrientDensity === 'number') {
        intelligence.nutrientDensityScore = nutrientDensity;
    }
    // Extract ORAC score
    const orac = getNestedValue(entry, 'oracScore', 'healthMetrics.oracScore', 'derivedScores.oracScore');
    if (typeof orac === 'number') {
        intelligence.oracScore = orac;
    }
    // Extract food group/category
    const foodGroup = getNestedValue(entry, 'foodGroup', 'foodGroups', 'category');
    if (foodGroup) {
        intelligence.foodGroup = Array.isArray(foodGroup) ? foodGroup[0] : foodGroup;
    }
    // Extract omega ratio
    const omegaRatio = getNestedValue(entry, 'omegaRatio');
    if (typeof omegaRatio === 'number') {
        intelligence.omegaRatio = omegaRatio;
    }
    return Object.keys(intelligence).length > 0 ? intelligence : null;
}
/**
 * Extract name from a food entry with varying structure
 */
function extractName(entry) {
    return getNestedValue(entry, 'name', 'displayName', 'description', 'basicInfo.name');
}
// ============================================================================
// DATA LOADING
// ============================================================================
// Build a unified lookup from all sources
const FOOD_INTELLIGENCE = new Map();
/**
 * Add entries from a data source to the lookup
 */
function loadEntries(data) {
    if (!data || typeof data !== 'object')
        return 0;
    const entries = data;
    let count = 0;
    for (const [key, entry] of Object.entries(entries)) {
        if (!entry || typeof entry !== 'object')
            continue;
        const intelligence = extractIntelligence(entry);
        if (!intelligence)
            continue;
        // Add by key
        FOOD_INTELLIGENCE.set(key.toLowerCase(), intelligence);
        count++;
        // Add by name
        const name = extractName(entry);
        if (name) {
            FOOD_INTELLIGENCE.set(name.toLowerCase(), intelligence);
            // Also add simplified version
            const simplified = name.toLowerCase()
                .replace(/,\s*(raw|cooked|fresh|frozen|canned|dried).*$/i, '')
                .trim();
            if (simplified !== name.toLowerCase()) {
                FOOD_INTELLIGENCE.set(simplified, intelligence);
            }
        }
    }
    return count;
}
/**
 * Load all JSON files from the enhanced directory
 */
function loadAllEnhancedData() {
    const enhancedDir = path.join(__dirname, 'data', 'enhanced');
    const mainDataFile = path.join(__dirname, 'data', 'enhanced_foods.json');
    // Load main enhanced_foods.json
    try {
        if (fs.existsSync(mainDataFile)) {
            const data = JSON.parse(fs.readFileSync(mainDataFile, 'utf-8'));
            const count = loadEntries(data);
            console.log(`Loaded ${count} entries from enhanced_foods.json`);
        }
    }
    catch (err) {
        console.error('Error loading enhanced_foods.json:', err);
    }
    // Load all batch files from enhanced directory
    try {
        if (fs.existsSync(enhancedDir)) {
            const files = fs.readdirSync(enhancedDir).filter(f => f.endsWith('.json'));
            for (const file of files) {
                try {
                    const filePath = path.join(enhancedDir, file);
                    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                    const count = loadEntries(data);
                    if (count > 0) {
                        console.log(`Loaded ${count} entries from ${file}`);
                    }
                }
                catch (err) {
                    console.error(`Error loading ${file}:`, err);
                }
            }
        }
    }
    catch (err) {
        console.error('Error reading enhanced directory:', err);
    }
    console.log(`Total food intelligence entries: ${FOOD_INTELLIGENCE.size}`);
}
// Initialize on module load
loadAllEnhancedData();
// ============================================================================
// LOOKUP FUNCTIONS
// ============================================================================
/**
 * Normalize a food name for lookup
 */
function normalizeForLookup(name) {
    return name
        .toLowerCase()
        .trim()
        // Remove common qualifiers
        .replace(/\b(raw|cooked|fresh|frozen|canned|dried|sliced|diced|chopped|whole|organic|natural)\b/gi, '')
        // Remove quantities
        .replace(/\d+\s*(g|oz|cup|tbsp|tsp|slice|piece|serving)s?/gi, '')
        // Remove parenthetical descriptions
        .replace(/\s*\([^)]*\)\s*/g, ' ')
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        .trim();
}
/**
 * Get food intelligence data for a food by name
 * Returns null if not found in the enhanced database
 */
function getFoodIntelligence(foodName) {
    const normalized = normalizeForLookup(foodName);
    // Direct match
    if (FOOD_INTELLIGENCE.has(normalized)) {
        return FOOD_INTELLIGENCE.get(normalized);
    }
    // Try without common prefixes
    const withoutPrefix = normalized.replace(/^(a|an|the|some)\s+/, '');
    if (FOOD_INTELLIGENCE.has(withoutPrefix)) {
        return FOOD_INTELLIGENCE.get(withoutPrefix);
    }
    // Try singular/plural
    if (normalized.endsWith('s')) {
        const singular = normalized.slice(0, -1);
        if (FOOD_INTELLIGENCE.has(singular)) {
            return FOOD_INTELLIGENCE.get(singular);
        }
    }
    else {
        const plural = normalized + 's';
        if (FOOD_INTELLIGENCE.has(plural)) {
            return FOOD_INTELLIGENCE.get(plural);
        }
    }
    // Try common variations
    const variations = [
        normalized.replace(/beef\s*/i, ''),
        normalized.replace(/chicken\s*/i, ''),
        normalized.replace(/\s+soft$/i, ''),
        normalized.replace(/\s+hard$/i, ''),
    ];
    for (const variation of variations) {
        if (variation !== normalized && FOOD_INTELLIGENCE.has(variation)) {
            return FOOD_INTELLIGENCE.get(variation);
        }
    }
    // Fuzzy match: check if any key contains the normalized name or vice versa
    for (const [key, intelligence] of FOOD_INTELLIGENCE) {
        if (key.includes(normalized) || normalized.includes(key)) {
            return intelligence;
        }
    }
    return null;
}
/**
 * Get focus grade for a specific focus
 */
function getFocusGradeForFood(foodName, focusId) {
    const intelligence = getFoodIntelligence(foodName);
    if (!(intelligence === null || intelligence === void 0 ? void 0 : intelligence.focusGrades))
        return null;
    return intelligence.focusGrades[focusId] || null;
}
/**
 * Check if a food has intelligence data
 */
function hasIntelligence(foodName) {
    return getFoodIntelligence(foodName) !== null;
}
/**
 * Get count of foods in intelligence database
 */
function getIntelligenceFoodCount() {
    return FOOD_INTELLIGENCE.size;
}
//# sourceMappingURL=foodIntelligenceLookup.js.map