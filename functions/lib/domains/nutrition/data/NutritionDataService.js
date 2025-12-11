"use strict";
/**
 * NutritionDataService
 *
 * Singleton service that loads and indexes all nutrition reference JSON files.
 * Provides fast lookups for nutrients, DRI values, FDA daily values, etc.
 *
 * JSON files are the SINGLE SOURCE OF TRUTH for all nutritional reference data.
 * This service never hardcodes nutrient values - everything comes from JSON.
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
exports.nutritionData = exports.NutritionDataService = void 0;
exports.preloadAllData = preloadAllData;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// =============================================================================
// NutritionDataService Class
// =============================================================================
class NutritionDataService {
    constructor() {
        // Indexed data
        this.nutrients = new Map();
        this.driEntries = [];
        this.fdaDailyValues = new Map();
        this.clinicalThresholds = null;
        this.loaded = false;
        // Private constructor for singleton
    }
    /**
     * Get the singleton instance
     */
    static getInstance() {
        if (!NutritionDataService.instance) {
            NutritionDataService.instance = new NutritionDataService();
        }
        return NutritionDataService.instance;
    }
    /**
     * Load all JSON data files. Safe to call multiple times (idempotent).
     */
    loadAll() {
        if (this.loaded)
            return;
        const dataDir = path.join(__dirname);
        // Load nutrient definitions
        this.loadNutrientDefinitions(path.join(dataDir, 'nutrient_definitions.json'));
        // Load DRI values
        this.loadDriValues(path.join(dataDir, 'dri_by_lifestage.json'));
        // Load FDA Daily Values
        this.loadFdaDailyValues(path.join(dataDir, 'fda_daily_values.json'));
        // Load clinical thresholds
        this.loadClinicalThresholds(path.join(dataDir, 'clinical_thresholds_and_overrides.json'));
        this.loaded = true;
    }
    /**
     * Check if data is loaded
     */
    isLoaded() {
        return this.loaded;
    }
    // ---------------------------------------------------------------------------
    // Loaders
    // ---------------------------------------------------------------------------
    loadNutrientDefinitions(filePath) {
        var _a;
        try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(raw);
            for (const n of data.nutrients) {
                this.nutrients.set(n.nutrientId, {
                    nutrientId: n.nutrientId,
                    displayName: n.displayName,
                    shortName: (_a = n.shortName) !== null && _a !== void 0 ? _a : n.displayName,
                    category: n.category,
                    unit: n.unit,
                    classification: n.classification,
                    education: n.clinicalInterpretation
                        ? {
                            importance: n.clinicalInterpretation.importance,
                            deficiencySigns: n.clinicalInterpretation.deficiencySigns,
                            excessRisks: n.clinicalInterpretation.excessRisks,
                            foodSources: n.clinicalInterpretation.foodSources,
                            specialConsiderations: n.clinicalInterpretation.specialConsiderations,
                        }
                        : undefined,
                });
            }
        }
        catch (err) {
            console.error('Failed to load nutrient_definitions.json:', err);
        }
    }
    loadDriValues(filePath) {
        try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(raw);
            this.driEntries = data.entries;
        }
        catch (err) {
            console.error('Failed to load dri_by_lifestage.json:', err);
        }
    }
    loadFdaDailyValues(filePath) {
        try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(raw);
            for (const dv of data.dailyValues) {
                this.fdaDailyValues.set(dv.nutrientId, dv);
            }
        }
        catch (err) {
            console.error('Failed to load fda_daily_values.json:', err);
        }
    }
    loadClinicalThresholds(filePath) {
        try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            this.clinicalThresholds = JSON.parse(raw);
        }
        catch (err) {
            console.error('Failed to load clinical_thresholds_and_overrides.json:', err);
        }
    }
    // ---------------------------------------------------------------------------
    // Nutrient Lookups
    // ---------------------------------------------------------------------------
    /**
     * Get a nutrient definition by ID
     */
    getNutrient(nutrientId) {
        var _a;
        this.ensureLoaded();
        return (_a = this.nutrients.get(nutrientId)) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Get all nutrient definitions
     */
    getAllNutrients() {
        this.ensureLoaded();
        return Array.from(this.nutrients.values());
    }
    /**
     * Get nutrients by category (e.g., 'vitamin', 'mineral', 'macronutrient')
     */
    getNutrientsByCategory(category) {
        this.ensureLoaded();
        return Array.from(this.nutrients.values()).filter((n) => n.category === category);
    }
    /**
     * Get nutrients by classification (beneficial, limit, neutral)
     */
    getNutrientsByClassification(classification) {
        this.ensureLoaded();
        return Array.from(this.nutrients.values()).filter((n) => n.classification === classification);
    }
    // ---------------------------------------------------------------------------
    // DRI Lookups
    // ---------------------------------------------------------------------------
    /**
     * Look up DRI value for a nutrient based on age, sex, and life stage
     *
     * @param nutrientId - e.g., 'vitamin_c', 'calcium'
     * @param ageYears - User's age in years
     * @param sex - 'male' or 'female'
     * @param lifeStage - 'standard', 'pregnancy', or 'lactation'
     * @returns DRI lookup result or null if not found
     */
    getDri(nutrientId, ageYears, sex, lifeStage = 'standard') {
        var _a;
        this.ensureLoaded();
        // Find matching entry: nutrient + age range + sex (or 'both') + life stage
        const entry = this.driEntries.find((e) => {
            if (e.nutrientId !== nutrientId)
                return false;
            if (ageYears < e.ageMinYears || ageYears > e.ageMaxYears)
                return false;
            if (e.sex !== 'both' && e.sex !== sex)
                return false;
            if (e.lifeStage !== lifeStage)
                return false;
            return true;
        });
        if (!entry)
            return null;
        return {
            driType: entry.driType,
            value: entry.driValue,
            ulValue: (_a = entry.ulValue) !== null && _a !== void 0 ? _a : null,
            unit: entry.unit,
            source: entry.source,
        };
    }
    /**
     * Get the Upper Limit (UL) for a nutrient
     */
    getUpperLimit(nutrientId, ageYears, sex) {
        var _a;
        const dri = this.getDri(nutrientId, ageYears, sex, 'standard');
        return (_a = dri === null || dri === void 0 ? void 0 : dri.ulValue) !== null && _a !== void 0 ? _a : null;
    }
    // ---------------------------------------------------------------------------
    // FDA Daily Value Lookups
    // ---------------------------------------------------------------------------
    /**
     * Get FDA Daily Value for adults (4+ years)
     */
    getFdaDvForAdults(nutrientId) {
        var _a;
        this.ensureLoaded();
        const entry = this.fdaDailyValues.get(nutrientId);
        return (_a = entry === null || entry === void 0 ? void 0 : entry.adults_and_children_4plus) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Get FDA Daily Value for a specific population
     */
    getFdaDv(nutrientId, population) {
        this.ensureLoaded();
        const entry = this.fdaDailyValues.get(nutrientId);
        if (!entry)
            return null;
        return {
            value: entry[population],
            unit: entry.unit,
        };
    }
    // ---------------------------------------------------------------------------
    // Clinical Thresholds
    // ---------------------------------------------------------------------------
    /**
     * Get condition-specific nutrient modifications
     */
    getConditionOverrides(conditionId) {
        var _a, _b;
        this.ensureLoaded();
        return (_b = (_a = this.clinicalThresholds) === null || _a === void 0 ? void 0 : _a.conditionOverrides[conditionId]) !== null && _b !== void 0 ? _b : null;
    }
    /**
     * Get all available condition IDs
     */
    getAvailableConditions() {
        this.ensureLoaded();
        if (!this.clinicalThresholds)
            return [];
        return Object.keys(this.clinicalThresholds.conditionOverrides);
    }
    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------
    ensureLoaded() {
        if (!this.loaded) {
            this.loadAll();
        }
    }
}
exports.NutritionDataService = NutritionDataService;
NutritionDataService.instance = null;
// =============================================================================
// Convenience singleton export
// =============================================================================
exports.nutritionData = NutritionDataService.getInstance();
/**
 * Preload all nutrition data (call during cold start)
 */
function preloadAllData() {
    exports.nutritionData.loadAll();
}
//# sourceMappingURL=NutritionDataService.js.map