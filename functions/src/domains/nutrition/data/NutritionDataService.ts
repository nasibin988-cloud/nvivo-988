/**
 * NutritionDataService
 *
 * Singleton service that loads and indexes all nutrition reference JSON files.
 * Provides fast lookups for nutrients, DRI values, FDA daily values, etc.
 *
 * JSON files are the SINGLE SOURCE OF TRUTH for all nutritional reference data.
 * This service never hardcodes nutrient values - everything comes from JSON.
 */

import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// Types for JSON structures (internal to this module)
// =============================================================================

interface NutrientDefinitionJson {
  nutrientId: string;
  displayName: string;
  shortName?: string;
  category: string;
  unit: string;
  classification: 'beneficial' | 'limit' | 'risk' | 'neutral' | 'context_dependent';
  clinicalInterpretation?: {
    importance?: string;
    deficiencySigns?: string;
    excessRisks?: string;
    foodSources?: string;
    specialConsiderations?: string;
  };
  warningFlags?: {
    pregnancy?: string | null;
    ckd?: string | null;
    elderly?: string | null;
    drugInteractions?: string[];
  };
  notes?: string[];
}

interface NutrientDefinitionsFile {
  schemaVersion: string;
  nutrients: NutrientDefinitionJson[];
}

interface DriEntryJson {
  nutrientId: string;
  ageMinYears: number;
  ageMaxYears: number;
  sex: 'male' | 'female' | 'both';
  lifeStage: 'standard' | 'pregnancy' | 'lactation';
  driType: 'RDA' | 'AI' | 'UL' | 'EAR';
  driValue: number | null;
  ulValue?: number | null;
  unit: string;
  source?: string;
  notes?: string[];
}

interface DriByLifestageFile {
  schemaVersion: string;
  entries: DriEntryJson[];
}

interface FdaDailyValueJson {
  nutrientId: string;
  unit: string;
  adults_and_children_4plus: number | null;
  children_1_3: number | null;
  infants: number | null;
  pregnancy_lactation: number | null;
  notes?: string[];
}

interface FdaDailyValuesFile {
  schemaVersion: string;
  dailyValues: FdaDailyValueJson[];
}

interface ClinicalThresholdsFile {
  schemaVersion: string;
  conditionOverrides: Record<string, {
    condition: string;
    source: string;
    modifications: Array<{
      nutrientId: string;
      target?: number | null;
      targetMin?: number;
      targetMax?: number;
      unit: string;
      direction: string;
      notes?: string[];
    }>;
    warnings?: string[];
  }>;
  nutrientClassifications: {
    beneficial: string[];
    risk: string[];
    neutral: string[];
    context_dependent: Record<string, { defaultClassification: string; notes: string }>;
  };
}

// =============================================================================
// Exported Types (what consumers will use)
// =============================================================================

export interface NutrientDef {
  nutrientId: string;
  displayName: string;
  shortName: string;
  category: string;
  unit: string;
  classification: 'beneficial' | 'limit' | 'risk' | 'neutral' | 'context_dependent';
  education?: {
    importance?: string;
    deficiencySigns?: string;
    excessRisks?: string;
    foodSources?: string;
    specialConsiderations?: string;
  };
}

export interface DriLookupResult {
  driType: 'RDA' | 'AI' | 'UL' | 'EAR';
  value: number | null;
  ulValue: number | null;
  unit: string;
  source?: string;
}

export interface FdaDvLookupResult {
  value: number | null;
  unit: string;
}

// =============================================================================
// NutritionDataService Class
// =============================================================================

export class NutritionDataService {
  private static instance: NutritionDataService | null = null;

  // Indexed data
  private nutrients: Map<string, NutrientDef> = new Map();
  private driEntries: DriEntryJson[] = [];
  private fdaDailyValues: Map<string, FdaDailyValueJson> = new Map();
  private clinicalThresholds: ClinicalThresholdsFile | null = null;

  private loaded = false;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): NutritionDataService {
    if (!NutritionDataService.instance) {
      NutritionDataService.instance = new NutritionDataService();
    }
    return NutritionDataService.instance;
  }

  /**
   * Load all JSON data files. Safe to call multiple times (idempotent).
   */
  loadAll(): void {
    if (this.loaded) return;

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
  isLoaded(): boolean {
    return this.loaded;
  }

  // ---------------------------------------------------------------------------
  // Loaders
  // ---------------------------------------------------------------------------

  private loadNutrientDefinitions(filePath: string): void {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data: NutrientDefinitionsFile = JSON.parse(raw);

      for (const n of data.nutrients) {
        this.nutrients.set(n.nutrientId, {
          nutrientId: n.nutrientId,
          displayName: n.displayName,
          shortName: n.shortName ?? n.displayName,
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
    } catch (err) {
      console.error('Failed to load nutrient_definitions.json:', err);
    }
  }

  private loadDriValues(filePath: string): void {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data: DriByLifestageFile = JSON.parse(raw);
      this.driEntries = data.entries;
    } catch (err) {
      console.error('Failed to load dri_by_lifestage.json:', err);
    }
  }

  private loadFdaDailyValues(filePath: string): void {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data: FdaDailyValuesFile = JSON.parse(raw);

      for (const dv of data.dailyValues) {
        this.fdaDailyValues.set(dv.nutrientId, dv);
      }
    } catch (err) {
      console.error('Failed to load fda_daily_values.json:', err);
    }
  }

  private loadClinicalThresholds(filePath: string): void {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      this.clinicalThresholds = JSON.parse(raw);
    } catch (err) {
      console.error('Failed to load clinical_thresholds_and_overrides.json:', err);
    }
  }

  // ---------------------------------------------------------------------------
  // Nutrient Lookups
  // ---------------------------------------------------------------------------

  /**
   * Get a nutrient definition by ID
   */
  getNutrient(nutrientId: string): NutrientDef | null {
    this.ensureLoaded();
    return this.nutrients.get(nutrientId) ?? null;
  }

  /**
   * Get all nutrient definitions
   */
  getAllNutrients(): NutrientDef[] {
    this.ensureLoaded();
    return Array.from(this.nutrients.values());
  }

  /**
   * Get nutrients by category (e.g., 'vitamin', 'mineral', 'macronutrient')
   */
  getNutrientsByCategory(category: string): NutrientDef[] {
    this.ensureLoaded();
    return Array.from(this.nutrients.values()).filter((n) => n.category === category);
  }

  /**
   * Get nutrients by classification (beneficial, limit, neutral)
   */
  getNutrientsByClassification(
    classification: 'beneficial' | 'limit' | 'neutral' | 'context_dependent'
  ): NutrientDef[] {
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
  getDri(
    nutrientId: string,
    ageYears: number,
    sex: 'male' | 'female',
    lifeStage: 'standard' | 'pregnancy' | 'lactation' = 'standard'
  ): DriLookupResult | null {
    this.ensureLoaded();

    // Find matching entry: nutrient + age range + sex (or 'both') + life stage
    const entry = this.driEntries.find((e) => {
      if (e.nutrientId !== nutrientId) return false;
      if (ageYears < e.ageMinYears || ageYears > e.ageMaxYears) return false;
      if (e.sex !== 'both' && e.sex !== sex) return false;
      if (e.lifeStage !== lifeStage) return false;
      return true;
    });

    if (!entry) return null;

    return {
      driType: entry.driType,
      value: entry.driValue,
      ulValue: entry.ulValue ?? null,
      unit: entry.unit,
      source: entry.source,
    };
  }

  /**
   * Get the Upper Limit (UL) for a nutrient
   */
  getUpperLimit(
    nutrientId: string,
    ageYears: number,
    sex: 'male' | 'female'
  ): number | null {
    const dri = this.getDri(nutrientId, ageYears, sex, 'standard');
    return dri?.ulValue ?? null;
  }

  // ---------------------------------------------------------------------------
  // FDA Daily Value Lookups
  // ---------------------------------------------------------------------------

  /**
   * Get FDA Daily Value for adults (4+ years)
   */
  getFdaDvForAdults(nutrientId: string): number | null {
    this.ensureLoaded();
    const entry = this.fdaDailyValues.get(nutrientId);
    return entry?.adults_and_children_4plus ?? null;
  }

  /**
   * Get FDA Daily Value for a specific population
   */
  getFdaDv(
    nutrientId: string,
    population: 'adults_and_children_4plus' | 'children_1_3' | 'infants' | 'pregnancy_lactation'
  ): FdaDvLookupResult | null {
    this.ensureLoaded();
    const entry = this.fdaDailyValues.get(nutrientId);
    if (!entry) return null;

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
  getConditionOverrides(conditionId: string): ClinicalThresholdsFile['conditionOverrides'][string] | null {
    this.ensureLoaded();
    return this.clinicalThresholds?.conditionOverrides[conditionId] ?? null;
  }

  /**
   * Get all available condition IDs
   */
  getAvailableConditions(): string[] {
    this.ensureLoaded();
    if (!this.clinicalThresholds) return [];
    return Object.keys(this.clinicalThresholds.conditionOverrides);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private ensureLoaded(): void {
    if (!this.loaded) {
      this.loadAll();
    }
  }
}

// =============================================================================
// Convenience singleton export
// =============================================================================

export const nutritionData = NutritionDataService.getInstance();

/**
 * Preload all nutrition data (call during cold start)
 */
export function preloadAllData(): void {
  nutritionData.loadAll();
}
