# NVIVO Nutrition System - Comprehensive Implementation Plan

## Overview

This document provides a step-by-step implementation plan for building the NVIVO Nutrition System. The architecture follows a **JSON-first approach** where all nutritional reference data is stored in JSON files that serve as the single source of truth.

**Key Principles:**
1. JSON files contain all DRI values, nutrient definitions, and clinical data
2. TypeScript code loads and indexes JSON data - never hardcodes nutritional values
3. Evaluation logic is pure and testable
4. Frontend consumes Cloud Functions API
5. All user-facing content is descriptive, not prescriptive

**AI Model:** GPT-5.1 (`gpt-5.1-2025-11-13`)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           JSON DATA LAYER                                   │
│                       docs/nutrition-json/                                  │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │ dri_by_         │  │ nutrient_        │  │ clinical_thresholds_     │   │
│  │ lifestage.json  │  │ definitions.json │  │ and_overrides.json       │   │
│  └─────────────────┘  └──────────────────┘  └──────────────────────────┘   │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │ fda_daily_      │  │ fda_nutrient_    │  │ macros_fiber_            │   │
│  │ values.json     │  │ content_claims   │  │ fatty_acids.json         │   │
│  └─────────────────┘  └──────────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SHARED TYPES LAYER                                     │
│                 packages/shared/src/types/nutrition/                        │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │ dri.ts          │  │ nutrients.ts     │  │ evaluation.ts            │   │
│  │ (DRI types)     │  │ (nutrient types) │  │ (result types)           │   │
│  └─────────────────┘  └──────────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DATA LOADER LAYER                                      │
│              functions/src/domains/nutrition/data/                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  NutritionDataService                                               │   │
│  │  - Loads JSON files at startup                                      │   │
│  │  - Indexes data for fast lookups                                    │   │
│  │  - Provides typed access to all nutritional reference data          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      EVALUATION ENGINE                                      │
│            functions/src/domains/nutrition/evaluation/                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  - computePersonalizedTargets(profile) → UserTargets                │   │
│  │  - evaluateNutrient(amount, target) → NutrientEvaluation            │   │
│  │  - evaluateFood(nutrients, targets) → FoodEvaluation                │   │
│  │  - evaluateDay(foodLogs, targets) → DayEvaluation                   │   │
│  │  - computeNutritionScore(evaluation) → number (0-100)               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      INSIGHT ENGINE                                         │
│             functions/src/domains/nutrition/insights/                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  - generateHighlights(evaluation) → Highlight[]                     │   │
│  │  - generateGapInfo(evaluation) → GapInfo[]                          │   │
│  │  - getNutrientEducation(nutrientId) → EducationContent              │   │
│  │  - generateDailySummary(dayEval) → DailySummary                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CLOUD FUNCTIONS API                                    │
│                     functions/src/index.ts                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  evaluateFoodNutrition    │  getUserNutritionTargets                │   │
│  │  evaluateMealNutrition    │  getNutrientInfo                        │   │
│  │  evaluateDayNutrition     │  getDailySummary                        │   │
│  │  analyzeFoodPhoto         │  getWeeklyReport                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CLIENT HOOKS                                           │
│                apps/patient/src/hooks/nutrition/                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  useNutritionTargets      │  useFoodEvaluation                      │   │
│  │  useDayEvaluation         │  useNutrientInfo                        │   │
│  │  useNutritionScore        │  useWeeklyReport                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
nvivo-988/
├── docs/
│   └── nutrition-json/                    # SOURCE OF TRUTH
│       ├── dri_by_lifestage.json          # DRI values by age/sex/lifestage
│       ├── nutrient_definitions.json      # Nutrient metadata + clinical interpretations
│       ├── macros_fiber_fatty_acids.json  # Detailed macro definitions
│       ├── fda_daily_values.json          # FDA Daily Values
│       ├── fda_nutrient_content_claims.json # "Free", "Low", "High" thresholds
│       └── clinical_thresholds_and_overrides.json # Condition info
│
├── packages/shared/src/types/
│   └── nutrition/                         # SHARED TYPES
│       ├── index.ts                       # Barrel export
│       ├── dri.ts                         # DRI-related types
│       ├── nutrients.ts                   # Nutrient definition types
│       ├── evaluation.ts                  # Evaluation result types
│       ├── profile.ts                     # User profile types
│       └── json-schemas.ts                # Types matching JSON structure
│
├── functions/src/domains/nutrition/
│   ├── index.ts                           # Barrel export
│   ├── data/                              # DATA LOADER
│   │   ├── index.ts
│   │   ├── NutritionDataService.ts        # Main data service
│   │   ├── loaders.ts                     # JSON file loaders
│   │   └── indexes.ts                     # Data indexing utilities
│   │
│   ├── targets/                           # TARGET CALCULATION
│   │   ├── index.ts
│   │   ├── calorieCalculator.ts           # BMR/TDEE calculation
│   │   ├── driLookup.ts                   # DRI value lookup
│   │   ├── targetComputer.ts              # Personalized target computation
│   │   └── amdrCalculator.ts              # AMDR-based macro targets
│   │
│   ├── evaluation/                        # EVALUATION ENGINE
│   │   ├── index.ts
│   │   ├── classifier.ts                  # Nutrient classification
│   │   ├── nutrientEvaluator.ts           # Single nutrient evaluation
│   │   ├── foodEvaluator.ts               # Food evaluation
│   │   ├── dayEvaluator.ts                # Daily evaluation
│   │   └── scoreCalculator.ts             # Nutrition score (0-100)
│   │
│   ├── insights/                          # INSIGHT GENERATION
│   │   ├── index.ts
│   │   ├── highlights.ts                  # Positive highlights
│   │   ├── gaps.ts                        # Nutrient gap info
│   │   ├── education.ts                   # Educational content
│   │   ├── patterns.ts                    # Pattern detection
│   │   └── summaries.ts                   # Summary generation
│   │
│   └── api/                               # API HANDLERS
│       ├── index.ts
│       ├── evaluationHandlers.ts          # Evaluation endpoints
│       ├── targetHandlers.ts              # Target endpoints
│       └── insightHandlers.ts             # Insight endpoints
│
└── apps/patient/src/
    ├── hooks/nutrition/                   # CLIENT HOOKS
    │   ├── index.ts
    │   ├── useNutritionTargets.ts
    │   ├── useFoodEvaluation.ts
    │   ├── useDayEvaluation.ts
    │   ├── useNutrientInfo.ts
    │   └── useNutritionScore.ts
    │
    └── screens/journal/nutrition/         # UI COMPONENTS
        ├── components/
        ├── modals/
        └── views/
```

---

## Implementation Phases

### Phase 1: Shared Types
Create TypeScript interfaces matching all JSON structures and evaluation results.

### Phase 2: Data Loader
Build service to load, parse, and index JSON reference data.

### Phase 3: Target Calculator
Implement personalized DRI target computation from JSON data.

### Phase 4: Evaluation Engine
Build nutrient, food, and day evaluation with classification.

### Phase 5: Nutrition Score
Implement aggregate scoring algorithm.

### Phase 6: Insight Engine
Build highlight, gap, and educational content generation.

### Phase 7: Cloud Functions API
Expose all functionality via callable Cloud Functions.

### Phase 8: Client Hooks
Create React hooks for frontend consumption.

### Phase 9: Dashboard UI
Build the daily nutrition dashboard.

### Phase 10: History & Trends
Implement historical views and trend analysis.

### Phase 11: Food Analysis Tools
Build menu scanner, comparison, and "What If" features.

### Phase 12: Reports & Export
Implement weekly reports and data export.

### Phase 13: Gamification
Add streaks, achievements, and engagement features.

### Phase 14: Integration & Polish
Wearable sync, accessibility, final polish.

---

## Detailed Phase Instructions

Each phase below contains:
- **Files to create/modify**
- **Code specifications**
- **Verification steps**
- **Definition of done**

---

## Phase 1: Shared Types

Create TypeScript interfaces that match the JSON file structures and define evaluation result types.

### Step 1.1: JSON Schema Types

**File**: `packages/shared/src/types/nutrition/json-schemas.ts`

These types mirror the structure of the JSON files exactly.

```typescript
// =============================================================================
// DRI BY LIFESTAGE JSON SCHEMA (dri_by_lifestage.json)
// =============================================================================

export type Sex = 'male' | 'female';
export type LifeStageGroup =
  | 'infants_0_6mo' | 'infants_7_12mo'
  | 'children_1_3' | 'children_4_8'
  | 'children_9_13' | 'adolescents_14_18'
  | 'adults_19_30' | 'adults_31_50' | 'adults_51_70' | 'adults_70_plus'
  | 'pregnancy_14_18' | 'pregnancy_19_30' | 'pregnancy_31_50'
  | 'lactation_14_18' | 'lactation_19_30' | 'lactation_31_50';

export type DriType = 'RDA' | 'AI' | 'UL' | 'AMDR' | 'CDRR' | 'EER';

export interface DriValue {
  value: number | null;
  unit: string;
  type: DriType;
  footnotes?: string[];
}

export interface LifeStageDriEntry {
  lifeStageGroup: LifeStageGroup;
  sex: Sex | 'both';
  ageRange: string;
  nutrients: Record<string, DriValue>;
}

export interface DriByLifestageJson {
  schemaVersion: string;
  generatedFrom: string[];
  lastUpdated: string;
  lifeStages: LifeStageDriEntry[];
}

// =============================================================================
// NUTRIENT DEFINITIONS JSON SCHEMA (nutrient_definitions.json)
// =============================================================================

export type NutrientCategory =
  | 'macronutrient' | 'vitamin' | 'mineral'
  | 'fatty_acid' | 'other';

export type RiskClassification = 'beneficial' | 'risk' | 'neutral' | 'context_dependent';

export interface ClinicalInterpretation {
  importance: string;
  deficiencySigns: string;
  excessRisks: string;
  foodSources: string;
  specialConsiderations: string;
}

export interface WarningFlags {
  pregnancy: string | null;
  ckd: string | null;
  elderly: string | null;
  drugInteractions: string[];
}

export interface NutrientLabeling {
  hasPercentDV: boolean;
  dvUnit: string;
}

export interface NutrientDefinition {
  nutrientId: string;
  displayName: string;
  shortName: string;
  category: NutrientCategory;
  unit: string;
  usdaNutrientIds?: number[];
  riskClassification: RiskClassification;
  labeling: NutrientLabeling;
  notes: string[];
  clinicalInterpretation?: ClinicalInterpretation;
  warningFlags?: WarningFlags;
}

export interface NutrientDefinitionsJson {
  schemaVersion: string;
  generatedFrom: string[];
  lastUpdated: string;
  nutrients: NutrientDefinition[];
}

// =============================================================================
// FDA DAILY VALUES JSON SCHEMA (fda_daily_values.json)
// =============================================================================

export interface FdaDailyValue {
  nutrientId: string;
  unit: string;
  adults_and_children_4plus: number | null;
  children_1_3: number | null;
  infants: number | null;
  pregnancy_lactation: number | null;
  source: string;
  notes?: string[];
}

export interface FdaDailyValuesJson {
  schemaVersion: string;
  generatedFrom: string[];
  lastUpdated: string;
  regulatoryBasis: string;
  effectiveDate: string;
  referenceCalories: number;
  populations: Record<string, { description: string; referenceCalories: number | null }>;
  dailyValues: FdaDailyValue[];
  percentDvClassification: Record<string, { threshold: number; description: string }>;
}

// =============================================================================
// FDA NUTRIENT CONTENT CLAIMS JSON SCHEMA (fda_nutrient_content_claims.json)
// =============================================================================

export type ClaimOperator =
  | 'less_than' | 'less_than_or_equal'
  | 'greater_than' | 'greater_than_or_equal';

export type ClaimBasis =
  | 'per_RACC' | 'per_RACC_and_serving' | 'per_serving'
  | 'per_100g' | 'per_RACC_and_100g';

export interface ClaimCondition {
  nutrientId?: string;
  metric?: string;
  threshold: number;
  operator: ClaimOperator;
  unit?: string;
  basis?: ClaimBasis;
}

export interface NutrientClaim {
  claim: string;
  alternateNames?: string[];
  nutrientId?: string;
  threshold?: number;
  operator?: ClaimOperator;
  unit?: string;
  basis?: ClaimBasis;
  conditions?: ClaimCondition[];
  cfr?: string;
  notes?: string[];
  requirements?: string[];
  additionalRequirements?: string[];
}

export interface FdaNutrientContentClaimsJson {
  schemaVersion: string;
  generatedFrom: string[];
  lastUpdated: string;
  regulatoryBasis: string;
  definitions: Record<string, string>;
  freeClaims: NutrientClaim[];
  lowClaims: {
    individualFoods: NutrientClaim[];
    mealsAndMainDishes: NutrientClaim[];
  };
  reducedClaims: NutrientClaim[];
  highAndGoodSourceClaims: NutrientClaim[];
  leanClaims: {
    appliesToCategories: string[];
    claims: NutrientClaim[];
  };
  sugarClaims: NutrientClaim[];
  percentDvInterpretation: Record<string, { description: string; application: string }>;
}

// =============================================================================
// CLINICAL THRESHOLDS AND OVERRIDES JSON SCHEMA
// =============================================================================

export interface GuidelineValue {
  value?: number;
  unit?: string;
  notes?: string;
  recommendation?: string;
}

export interface ConditionModification {
  nutrientId: string;
  target?: number | null;
  targetMin?: number;
  targetMax?: number;
  targetIdeal?: number;
  targetOptimal?: number;
  unit?: string;
  direction: 'max' | 'min' | 'target' | 'restrict' | 'limit' | 'rda' | 'ai' |
             'individualized' | 'ensure_adequate' | 'minimum' | 'minimize' |
             'supplement_often_needed';
  notes?: string[];
}

export interface ConditionOverride {
  condition: string;
  source: string;
  gfrRange?: string;
  modifications: ConditionModification[];
  warnings?: string[];
}

export interface WhoGuideline {
  nutrientId: string;
  recommendation: string;
  value: number;
  unit: string;
  strength?: string;
  year: number;
  notes?: string[];
}

export interface ClinicalThresholdsJson {
  schemaVersion: string;
  generatedFrom: string[];
  lastUpdated: string;
  guidelineComparison: Record<string, Record<string, GuidelineValue>>;
  whoGuidelines: WhoGuideline[];
  conditionOverrides: Record<string, ConditionOverride>;
  nutrientClassifications: {
    beneficial: string[];
    risk: string[];
    neutral: string[];
    context_dependent: Record<string, { defaultClassification: string; notes: string }>;
  };
  evaluationAlgorithm: {
    intakeVsTarget: Record<string, { threshold?: number; thresholdMin?: number; thresholdMax?: number; operator?: string; description: string }>;
    noUlRule: { description: string; threshold: number };
  };
}

// =============================================================================
// MACROS FIBER FATTY ACIDS JSON SCHEMA
// =============================================================================

export interface MacroDefinition {
  nutrientId: string;
  displayName: string;
  category: string;
  unit: string;
  energyDensity?: number;
  amdr?: { min: number; max: number };
  notes: string[];
}

export interface MacrosFiberFattyAcidsJson {
  schemaVersion: string;
  generatedFrom: string[];
  lastUpdated: string;
  macronutrients: MacroDefinition[];
  fiberTypes: MacroDefinition[];
  fattyAcids: MacroDefinition[];
}
```

**Verification**:
```bash
pnpm run type-check
```

---

### Step 1.2: User Profile Types

**File**: `packages/shared/src/types/nutrition/profile.ts`

```typescript
import type { Sex, LifeStageGroup } from './json-schemas';

/**
 * Activity level for TDEE calculation
 */
export type ActivityLevel =
  | 'sedentary'      // Little or no exercise
  | 'light'          // Light exercise 1-3 days/week
  | 'moderate'       // Moderate exercise 3-5 days/week
  | 'high'           // Hard exercise 6-7 days/week
  | 'athlete';       // Very hard exercise, physical job, or training 2x/day

/**
 * User's nutrition-related goal
 */
export type NutritionGoal =
  | 'maintenance'    // Maintain current weight
  | 'weight_loss'    // Gradual weight loss
  | 'weight_gain'    // Gradual weight gain
  | 'muscle_gain'    // Build muscle (higher protein)
  | 'performance';   // Athletic performance

/**
 * Health conditions user has self-reported (for educational content only)
 */
export interface SelfReportedConditions {
  hypertension?: boolean;
  diabetes?: boolean;
  ckd?: boolean;              // Chronic kidney disease
  heartDisease?: boolean;
  obesity?: boolean;
  anemia?: boolean;
  osteoporosis?: boolean;
}

/**
 * User's nutrition profile for DRI calculation
 */
export interface NutritionUserProfile {
  // Required demographics
  dateOfBirth: string;        // ISO date string
  sex: Sex;

  // Optional physical stats (for BMR calculation)
  weightKg?: number;
  heightCm?: number;

  // Activity and goals
  activityLevel: ActivityLevel;
  goal: NutritionGoal;

  // Life stage
  isPregnant?: boolean;
  isLactating?: boolean;
  pregnancyTrimester?: 1 | 2 | 3;

  // Self-reported conditions (for educational content)
  conditions?: SelfReportedConditions;

  // Dietary preferences
  dietaryPreferences?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    dairyFree?: boolean;
    allergies?: string[];
  };
}

/**
 * Computed age information from date of birth
 */
export interface AgeInfo {
  years: number;
  months: number;
  lifeStageGroup: LifeStageGroup;
}

/**
 * BMR/TDEE calculation result
 */
export interface EnergyCalculation {
  bmr: number;                // Basal Metabolic Rate (kcal)
  tdee: number;               // Total Daily Energy Expenditure (kcal)
  targetCalories: number;     // After goal adjustment
  activityMultiplier: number;
  goalAdjustment: number;
  method: 'mifflin_st_jeor' | 'default';
}
```

---

### Step 1.3: DRI Types

**File**: `packages/shared/src/types/nutrition/dri.ts`

```typescript
import type { DriType } from './json-schemas';

/**
 * A single DRI target value for a nutrient
 */
export interface DriTarget {
  nutrientId: string;
  value: number;
  unit: string;
  type: DriType;              // RDA, AI, UL, AMDR, etc.
  source: string;             // e.g., "RDA adults_19_30 male"
}

/**
 * Complete target for a nutrient including all applicable values
 */
export interface NutrientTarget {
  nutrientId: string;
  displayName: string;
  unit: string;

  // Primary target (RDA or AI)
  target?: number;
  targetType?: 'RDA' | 'AI';

  // Upper limit
  upperLimit?: number;

  // AMDR range (for macros)
  amdrMin?: number;           // grams
  amdrMax?: number;           // grams
  amdrMinPercent?: number;    // % of calories
  amdrMaxPercent?: number;    // % of calories

  // CDRR (for sodium)
  cdrrLimit?: number;

  // FDA Daily Value (for labeling context)
  dailyValue?: number;

  // Source information
  source: string;
  footnotes?: string[];
}

/**
 * Complete set of personalized targets for a user
 */
export interface UserNutritionTargets {
  // Energy
  calories: number;

  // All nutrient targets
  nutrients: Record<string, NutrientTarget>;

  // Metadata
  profile: {
    ageYears: number;
    sex: string;
    lifeStageGroup: string;
    activityLevel: string;
    goal: string;
  };

  // When computed
  computedAt: string;
}
```

---

### Step 1.4: Evaluation Types

**File**: `packages/shared/src/types/nutrition/evaluation.ts`

```typescript
import type { NutrientTarget } from './dri';
import type { ClinicalInterpretation, RiskClassification } from './json-schemas';

/**
 * Classification of a nutrient evaluation
 */
export type NutrientClassification =
  // For beneficial nutrients
  | 'excellent'           // ≥100% of target
  | 'good'                // 67-99% of target
  | 'below_target'        // 33-66% of target
  | 'low'                 // <33% of target

  // For limit nutrients
  | 'well_within'         // <50% of limit
  | 'moderate'            // 50-80% of limit
  | 'approaching_limit'   // 80-100% of limit
  | 'exceeds_limit'       // >100% of limit

  // For neutral nutrients
  | 'neutral'             // No good/bad judgment

  // Special cases
  | 'no_target'           // No DRI reference available
  | 'no_data';            // Missing intake data

/**
 * Visual indicator for UI
 */
export type StatusColor = 'green' | 'light_green' | 'yellow' | 'orange' | 'red' | 'gray';

/**
 * Evaluation of a single nutrient
 */
export interface NutrientEvaluation {
  nutrientId: string;
  displayName: string;

  // Intake data
  intake: number | null;
  unit: string;

  // Target data
  target: NutrientTarget | null;

  // Evaluation results
  percentOfTarget?: number;       // % of RDA/AI
  percentOfLimit?: number;        // % of UL or CDRR
  percentOfDailyValue?: number;   // % of FDA DV

  // Classification
  riskClassification: RiskClassification;
  classification: NutrientClassification;
  statusColor: StatusColor;

  // Educational content (from JSON)
  clinicalInterpretation?: ClinicalInterpretation;
}

/**
 * Evaluation of a food item
 */
export interface FoodEvaluation {
  // Food info
  foodId?: string;
  foodName: string;
  servingSize?: string;

  // All nutrient evaluations
  nutrients: NutrientEvaluation[];

  // Highlights
  highlights: {
    beneficial: NutrientEvaluation[];   // Top positive nutrients
    concerns: NutrientEvaluation[];     // Top concerning nutrients
  };

  // Optional score for this food
  score?: number;
}

/**
 * Evaluation of a full day
 */
export interface DayEvaluation {
  date: string;                         // ISO date

  // Totals
  totalCalories: number;
  totalsByNutrient: Record<string, number>;

  // All nutrient evaluations
  nutrients: NutrientEvaluation[];

  // Macro distribution
  macroDistribution: {
    carbsPercent: number;
    proteinPercent: number;
    fatPercent: number;
    alcoholPercent?: number;
  };

  // Daily score (0-100)
  score: number;
  scoreBreakdown: {
    beneficialScore: number;            // Points from beneficial nutrients
    limitScore: number;                 // Points from staying under limits
    balanceScore: number;               // Points from macro balance
  };

  // Highlights
  highlights: {
    achieved: NutrientEvaluation[];     // Targets met
    gaps: NutrientEvaluation[];         // Significant gaps
    concerns: NutrientEvaluation[];     // Limits approached/exceeded
  };

  // Meals included
  mealsLogged: number;
  foodsLogged: number;
}

/**
 * Nutrient gap information (educational)
 */
export interface NutrientGapInfo {
  nutrientId: string;
  displayName: string;
  currentIntake: number;
  target: number;
  percentOfTarget: number;
  unit: string;

  // Educational content
  importance: string;
  commonSources: string;
}

/**
 * Positive highlight
 */
export interface NutrientHighlight {
  nutrientId: string;
  displayName: string;
  intake: number;
  percentOfTarget: number;
  unit: string;
  message: string;                      // e.g., "Great fiber intake today!"
}

/**
 * Daily summary for display
 */
export interface DailySummary {
  date: string;
  score: number;
  scoreLabel: string;                   // "Excellent", "Good", "Fair", etc.

  caloriesConsumed: number;
  caloriesTarget: number;

  highlights: NutrientHighlight[];
  gaps: NutrientGapInfo[];

  // Simple stats
  nutrientsMet: number;                 // Count of nutrients at ≥100%
  nutrientsTotal: number;               // Total tracked nutrients

  // Streak info
  loggingStreak: number;
  scoreStreak: number;                  // Days with score ≥75
}
```

---

### Step 1.5: Barrel Export

**File**: `packages/shared/src/types/nutrition/index.ts`

```typescript
// JSON Schema types
export * from './json-schemas';

// Profile types
export * from './profile';

// DRI types
export * from './dri';

// Evaluation types
export * from './evaluation';
```

**File**: `packages/shared/src/types/index.ts` (add to existing)

```typescript
// Add this line
export * from './nutrition';
```

---

### Step 1.6: Verification

```bash
# Type check
pnpm run type-check

# Verify exports
grep -r "from.*nutrition" packages/shared/src/types/

# Build shared package
pnpm --filter @nvivo/shared build
```

### Definition of Done - Phase 1

- [ ] All JSON schema types match actual JSON file structures
- [ ] Profile types cover all user attributes needed for DRI lookup
- [ ] DRI types support RDA, AI, UL, AMDR, CDRR
- [ ] Evaluation types support all classification scenarios
- [ ] All types exported from shared package
- [ ] `pnpm run type-check` passes
- [ ] Zero `any` types

---

## Phase 2: Data Loader

Build a service that loads JSON files and provides typed, indexed access to nutritional reference data.

### Step 2.1: Copy JSON Files to Functions

The JSON files need to be accessible to Cloud Functions at runtime.

**Action**: Copy JSON files to functions directory

```bash
mkdir -p functions/src/data/nutrition-json
cp docs/nutrition-json/*.json functions/src/data/nutrition-json/
```

**Note**: Add to `.gitignore` if you prefer to copy at build time, or commit them for simplicity.

---

### Step 2.2: JSON Loaders

**File**: `functions/src/domains/nutrition/data/loaders.ts`

```typescript
import * as fs from 'fs';
import * as path from 'path';
import type {
  DriByLifestageJson,
  NutrientDefinitionsJson,
  FdaDailyValuesJson,
  FdaNutrientContentClaimsJson,
  ClinicalThresholdsJson,
  MacrosFiberFattyAcidsJson,
} from '@nvivo/shared';

// Path to JSON data directory
const DATA_DIR = path.join(__dirname, '../../data/nutrition-json');

/**
 * Cache for loaded JSON data (singleton pattern)
 */
let driByLifestageCache: DriByLifestageJson | null = null;
let nutrientDefinitionsCache: NutrientDefinitionsJson | null = null;
let fdaDailyValuesCache: FdaDailyValuesJson | null = null;
let fdaClaimsCache: FdaNutrientContentClaimsJson | null = null;
let clinicalThresholdsCache: ClinicalThresholdsJson | null = null;
let macrosCache: MacrosFiberFattyAcidsJson | null = null;

/**
 * Load and parse a JSON file with caching
 */
function loadJsonFile<T>(filename: string, cache: T | null, setCache: (data: T) => void): T {
  if (cache) return cache;

  const filePath = path.join(DATA_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content) as T;
  setCache(data);
  return data;
}

/**
 * Load DRI by lifestage data
 */
export function loadDriByLifestage(): DriByLifestageJson {
  return loadJsonFile<DriByLifestageJson>(
    'dri_by_lifestage.json',
    driByLifestageCache,
    (data) => { driByLifestageCache = data; }
  );
}

/**
 * Load nutrient definitions
 */
export function loadNutrientDefinitions(): NutrientDefinitionsJson {
  return loadJsonFile<NutrientDefinitionsJson>(
    'nutrient_definitions.json',
    nutrientDefinitionsCache,
    (data) => { nutrientDefinitionsCache = data; }
  );
}

/**
 * Load FDA daily values
 */
export function loadFdaDailyValues(): FdaDailyValuesJson {
  return loadJsonFile<FdaDailyValuesJson>(
    'fda_daily_values.json',
    fdaDailyValuesCache,
    (data) => { fdaDailyValuesCache = data; }
  );
}

/**
 * Load FDA nutrient content claims
 */
export function loadFdaNutrientContentClaims(): FdaNutrientContentClaimsJson {
  return loadJsonFile<FdaNutrientContentClaimsJson>(
    'fda_nutrient_content_claims.json',
    fdaClaimsCache,
    (data) => { fdaClaimsCache = data; }
  );
}

/**
 * Load clinical thresholds and overrides
 */
export function loadClinicalThresholds(): ClinicalThresholdsJson {
  return loadJsonFile<ClinicalThresholdsJson>(
    'clinical_thresholds_and_overrides.json',
    clinicalThresholdsCache,
    (data) => { clinicalThresholdsCache = data; }
  );
}

/**
 * Load macros, fiber, and fatty acids definitions
 */
export function loadMacrosFiberFattyAcids(): MacrosFiberFattyAcidsJson {
  return loadJsonFile<MacrosFiberFattyAcidsJson>(
    'macros_fiber_fatty_acids.json',
    macrosCache,
    (data) => { macrosCache = data; }
  );
}

/**
 * Preload all JSON data (call at function cold start)
 */
export function preloadAllData(): void {
  loadDriByLifestage();
  loadNutrientDefinitions();
  loadFdaDailyValues();
  loadFdaNutrientContentClaims();
  loadClinicalThresholds();
  loadMacrosFiberFattyAcids();
}

/**
 * Clear all caches (for testing)
 */
export function clearCaches(): void {
  driByLifestageCache = null;
  nutrientDefinitionsCache = null;
  fdaDailyValuesCache = null;
  fdaClaimsCache = null;
  clinicalThresholdsCache = null;
  macrosCache = null;
}
```

---

### Step 2.3: Data Indexes

**File**: `functions/src/domains/nutrition/data/indexes.ts`

```typescript
import type {
  NutrientDefinition,
  LifeStageDriEntry,
  FdaDailyValue,
  ConditionOverride,
  LifeStageGroup,
  Sex,
  ClinicalInterpretation,
  RiskClassification,
} from '@nvivo/shared';
import {
  loadDriByLifestage,
  loadNutrientDefinitions,
  loadFdaDailyValues,
  loadClinicalThresholds,
} from './loaders';

// =============================================================================
// INDEXED DATA STRUCTURES
// =============================================================================

/** Map of nutrientId -> NutrientDefinition */
let nutrientIndex: Map<string, NutrientDefinition> | null = null;

/** Map of `${lifeStageGroup}_${sex}` -> LifeStageDriEntry */
let driIndex: Map<string, LifeStageDriEntry> | null = null;

/** Map of nutrientId -> FdaDailyValue */
let fdaDvIndex: Map<string, FdaDailyValue> | null = null;

/** Map of conditionId -> ConditionOverride */
let conditionIndex: Map<string, ConditionOverride> | null = null;

// =============================================================================
// INDEX BUILDERS
// =============================================================================

/**
 * Build nutrient definition index
 */
function buildNutrientIndex(): Map<string, NutrientDefinition> {
  if (nutrientIndex) return nutrientIndex;

  const data = loadNutrientDefinitions();
  nutrientIndex = new Map();

  for (const nutrient of data.nutrients) {
    nutrientIndex.set(nutrient.nutrientId, nutrient);
  }

  return nutrientIndex;
}

/**
 * Build DRI index by lifestage and sex
 */
function buildDriIndex(): Map<string, LifeStageDriEntry> {
  if (driIndex) return driIndex;

  const data = loadDriByLifestage();
  driIndex = new Map();

  for (const entry of data.lifeStages) {
    // Key format: "adults_19_30_male" or "adults_19_30_both"
    const key = `${entry.lifeStageGroup}_${entry.sex}`;
    driIndex.set(key, entry);
  }

  return driIndex;
}

/**
 * Build FDA Daily Value index
 */
function buildFdaDvIndex(): Map<string, FdaDailyValue> {
  if (fdaDvIndex) return fdaDvIndex;

  const data = loadFdaDailyValues();
  fdaDvIndex = new Map();

  for (const dv of data.dailyValues) {
    fdaDvIndex.set(dv.nutrientId, dv);
  }

  return fdaDvIndex;
}

/**
 * Build condition override index
 */
function buildConditionIndex(): Map<string, ConditionOverride> {
  if (conditionIndex) return conditionIndex;

  const data = loadClinicalThresholds();
  conditionIndex = new Map();

  for (const [key, override] of Object.entries(data.conditionOverrides)) {
    conditionIndex.set(key, override);
  }

  return conditionIndex;
}

// =============================================================================
// LOOKUP FUNCTIONS
// =============================================================================

/**
 * Get nutrient definition by ID
 */
export function getNutrientDefinition(nutrientId: string): NutrientDefinition | undefined {
  return buildNutrientIndex().get(nutrientId);
}

/**
 * Get all nutrient definitions
 */
export function getAllNutrientDefinitions(): NutrientDefinition[] {
  return Array.from(buildNutrientIndex().values());
}

/**
 * Get nutrient IDs by category
 */
export function getNutrientIdsByCategory(category: string): string[] {
  return getAllNutrientDefinitions()
    .filter(n => n.category === category)
    .map(n => n.nutrientId);
}

/**
 * Get nutrient IDs by risk classification
 */
export function getNutrientIdsByRisk(classification: RiskClassification): string[] {
  return getAllNutrientDefinitions()
    .filter(n => n.riskClassification === classification)
    .map(n => n.nutrientId);
}

/**
 * Get clinical interpretation for a nutrient
 */
export function getClinicalInterpretation(nutrientId: string): ClinicalInterpretation | undefined {
  return getNutrientDefinition(nutrientId)?.clinicalInterpretation;
}

/**
 * Get DRI entry for a specific lifestage and sex
 */
export function getDriEntry(lifeStageGroup: LifeStageGroup, sex: Sex): LifeStageDriEntry | undefined {
  const index = buildDriIndex();

  // Try exact match first
  const exactKey = `${lifeStageGroup}_${sex}`;
  if (index.has(exactKey)) {
    return index.get(exactKey);
  }

  // Fall back to "both" sex
  const bothKey = `${lifeStageGroup}_both`;
  return index.get(bothKey);
}

/**
 * Get DRI value for a specific nutrient, lifestage, and sex
 */
export function getDriValue(
  nutrientId: string,
  lifeStageGroup: LifeStageGroup,
  sex: Sex
): { value: number | null; unit: string; type: string } | undefined {
  const entry = getDriEntry(lifeStageGroup, sex);
  if (!entry) return undefined;

  const nutrientDri = entry.nutrients[nutrientId];
  if (!nutrientDri) return undefined;

  return {
    value: nutrientDri.value,
    unit: nutrientDri.unit,
    type: nutrientDri.type,
  };
}

/**
 * Get FDA Daily Value for a nutrient
 */
export function getFdaDailyValue(nutrientId: string): FdaDailyValue | undefined {
  return buildFdaDvIndex().get(nutrientId);
}

/**
 * Get condition override by condition ID
 */
export function getConditionOverride(conditionId: string): ConditionOverride | undefined {
  return buildConditionIndex().get(conditionId);
}

/**
 * Get all condition IDs
 */
export function getAllConditionIds(): string[] {
  return Array.from(buildConditionIndex().keys());
}

/**
 * Clear all indexes (for testing)
 */
export function clearIndexes(): void {
  nutrientIndex = null;
  driIndex = null;
  fdaDvIndex = null;
  conditionIndex = null;
}
```

---

### Step 2.4: Main Data Service

**File**: `functions/src/domains/nutrition/data/NutritionDataService.ts`

```typescript
import type {
  NutrientDefinition,
  LifeStageGroup,
  Sex,
  ClinicalInterpretation,
  RiskClassification,
  ConditionOverride,
  FdaDailyValue,
} from '@nvivo/shared';
import { preloadAllData, clearCaches } from './loaders';
import {
  getNutrientDefinition,
  getAllNutrientDefinitions,
  getNutrientIdsByCategory,
  getNutrientIdsByRisk,
  getClinicalInterpretation,
  getDriEntry,
  getDriValue,
  getFdaDailyValue,
  getConditionOverride,
  getAllConditionIds,
  clearIndexes,
} from './indexes';

/**
 * NutritionDataService - Central access point for all nutrition reference data
 *
 * This service provides typed access to all JSON reference data.
 * Data is loaded lazily and cached for performance.
 *
 * Usage:
 *   const service = NutritionDataService.getInstance();
 *   const proteinDef = service.getNutrient('protein');
 *   const driValue = service.getDri('protein', 'adults_19_30', 'male');
 */
export class NutritionDataService {
  private static instance: NutritionDataService | null = null;
  private initialized = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): NutritionDataService {
    if (!NutritionDataService.instance) {
      NutritionDataService.instance = new NutritionDataService();
    }
    return NutritionDataService.instance;
  }

  /**
   * Preload all data (call at function cold start for better performance)
   */
  initialize(): void {
    if (this.initialized) return;
    preloadAllData();
    this.initialized = true;
  }

  // ===========================================================================
  // NUTRIENT DEFINITIONS
  // ===========================================================================

  /**
   * Get nutrient definition by ID
   */
  getNutrient(nutrientId: string): NutrientDefinition | undefined {
    return getNutrientDefinition(nutrientId);
  }

  /**
   * Get all nutrient definitions
   */
  getAllNutrients(): NutrientDefinition[] {
    return getAllNutrientDefinitions();
  }

  /**
   * Get nutrient IDs for a category (macronutrient, vitamin, mineral, etc.)
   */
  getNutrientsByCategory(category: string): string[] {
    return getNutrientIdsByCategory(category);
  }

  /**
   * Get nutrient IDs by risk classification (beneficial, risk, neutral)
   */
  getNutrientsByRisk(classification: RiskClassification): string[] {
    return getNutrientIdsByRisk(classification);
  }

  /**
   * Get clinical interpretation for educational content
   */
  getClinicalInfo(nutrientId: string): ClinicalInterpretation | undefined {
    return getClinicalInterpretation(nutrientId);
  }

  /**
   * Get nutrient display name
   */
  getNutrientDisplayName(nutrientId: string): string {
    return this.getNutrient(nutrientId)?.displayName ?? nutrientId;
  }

  /**
   * Get nutrient unit
   */
  getNutrientUnit(nutrientId: string): string {
    return this.getNutrient(nutrientId)?.unit ?? 'g';
  }

  /**
   * Check if nutrient is beneficial
   */
  isBeneficial(nutrientId: string): boolean {
    const def = this.getNutrient(nutrientId);
    return def?.riskClassification === 'beneficial';
  }

  /**
   * Check if nutrient should be limited
   */
  isLimitNutrient(nutrientId: string): boolean {
    const def = this.getNutrient(nutrientId);
    return def?.riskClassification === 'risk';
  }

  // ===========================================================================
  // DRI VALUES
  // ===========================================================================

  /**
   * Get DRI value for a nutrient at a specific lifestage
   */
  getDri(
    nutrientId: string,
    lifeStageGroup: LifeStageGroup,
    sex: Sex
  ): { value: number | null; unit: string; type: string } | undefined {
    return getDriValue(nutrientId, lifeStageGroup, sex);
  }

  /**
   * Get all DRI values for a lifestage
   */
  getAllDriForLifestage(
    lifeStageGroup: LifeStageGroup,
    sex: Sex
  ): Record<string, { value: number | null; unit: string; type: string }> {
    const entry = getDriEntry(lifeStageGroup, sex);
    if (!entry) return {};

    const result: Record<string, { value: number | null; unit: string; type: string }> = {};
    for (const [nutrientId, dri] of Object.entries(entry.nutrients)) {
      result[nutrientId] = {
        value: dri.value,
        unit: dri.unit,
        type: dri.type,
      };
    }
    return result;
  }

  // ===========================================================================
  // FDA DAILY VALUES
  // ===========================================================================

  /**
   * Get FDA Daily Value for a nutrient
   */
  getFdaDv(nutrientId: string): FdaDailyValue | undefined {
    return getFdaDailyValue(nutrientId);
  }

  /**
   * Get FDA DV amount for adults
   */
  getFdaDvForAdults(nutrientId: string): number | null {
    return this.getFdaDv(nutrientId)?.adults_and_children_4plus ?? null;
  }

  // ===========================================================================
  // CONDITION OVERRIDES
  // ===========================================================================

  /**
   * Get condition-specific nutrition information
   */
  getConditionInfo(conditionId: string): ConditionOverride | undefined {
    return getConditionOverride(conditionId);
  }

  /**
   * Get all available condition IDs
   */
  getAllConditions(): string[] {
    return getAllConditionIds();
  }

  // ===========================================================================
  // UTILITY
  // ===========================================================================

  /**
   * Reset all caches and indexes (for testing)
   */
  reset(): void {
    clearCaches();
    clearIndexes();
    this.initialized = false;
  }
}

// Export singleton accessor
export const nutritionData = NutritionDataService.getInstance();
```

---

### Step 2.5: Barrel Export

**File**: `functions/src/domains/nutrition/data/index.ts`

```typescript
export { NutritionDataService, nutritionData } from './NutritionDataService';
export {
  loadDriByLifestage,
  loadNutrientDefinitions,
  loadFdaDailyValues,
  loadFdaNutrientContentClaims,
  loadClinicalThresholds,
  loadMacrosFiberFattyAcids,
  preloadAllData,
} from './loaders';
export {
  getNutrientDefinition,
  getAllNutrientDefinitions,
  getDriEntry,
  getDriValue,
  getFdaDailyValue,
  getConditionOverride,
} from './indexes';
```

---

### Step 2.6: Unit Tests

**File**: `functions/test/unit/nutrition/data/loaders.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadDriByLifestage,
  loadNutrientDefinitions,
  loadFdaDailyValues,
  clearCaches,
} from '../../../../src/domains/nutrition/data/loaders';

describe('Nutrition Data Loaders', () => {
  beforeEach(() => {
    clearCaches();
  });

  describe('loadDriByLifestage', () => {
    it('should load DRI data with correct schema version', () => {
      const data = loadDriByLifestage();
      expect(data.schemaVersion).toBe('1.0');
      expect(data.lifeStages).toBeDefined();
      expect(Array.isArray(data.lifeStages)).toBe(true);
    });

    it('should contain adult lifestage entries', () => {
      const data = loadDriByLifestage();
      const adult = data.lifeStages.find(ls => ls.lifeStageGroup === 'adults_19_30');
      expect(adult).toBeDefined();
    });

    it('should have protein DRI for adults', () => {
      const data = loadDriByLifestage();
      const adultMale = data.lifeStages.find(
        ls => ls.lifeStageGroup === 'adults_19_30' && ls.sex === 'male'
      );
      expect(adultMale?.nutrients.protein).toBeDefined();
      expect(adultMale?.nutrients.protein.value).toBeGreaterThan(0);
    });
  });

  describe('loadNutrientDefinitions', () => {
    it('should load nutrient definitions', () => {
      const data = loadNutrientDefinitions();
      expect(data.nutrients).toBeDefined();
      expect(data.nutrients.length).toBeGreaterThan(30);
    });

    it('should have clinical interpretations for most nutrients', () => {
      const data = loadNutrientDefinitions();
      const withClinical = data.nutrients.filter(n => n.clinicalInterpretation);
      expect(withClinical.length).toBeGreaterThan(30);
    });

    it('should classify sodium as risk nutrient', () => {
      const data = loadNutrientDefinitions();
      const sodium = data.nutrients.find(n => n.nutrientId === 'sodium');
      expect(sodium?.riskClassification).toBe('risk');
    });

    it('should classify fiber as beneficial nutrient', () => {
      const data = loadNutrientDefinitions();
      const fiber = data.nutrients.find(n => n.nutrientId === 'fiber');
      expect(fiber?.riskClassification).toBe('beneficial');
    });
  });

  describe('loadFdaDailyValues', () => {
    it('should load FDA daily values', () => {
      const data = loadFdaDailyValues();
      expect(data.dailyValues).toBeDefined();
      expect(data.referenceCalories).toBe(2000);
    });

    it('should have correct sodium DV', () => {
      const data = loadFdaDailyValues();
      const sodium = data.dailyValues.find(dv => dv.nutrientId === 'sodium');
      expect(sodium?.adults_and_children_4plus).toBe(2300);
    });
  });
});
```

**File**: `functions/test/unit/nutrition/data/NutritionDataService.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { NutritionDataService } from '../../../../src/domains/nutrition/data/NutritionDataService';

describe('NutritionDataService', () => {
  let service: NutritionDataService;

  beforeEach(() => {
    service = NutritionDataService.getInstance();
    service.reset();
    service.initialize();
  });

  describe('getNutrient', () => {
    it('should return protein definition', () => {
      const protein = service.getNutrient('protein');
      expect(protein).toBeDefined();
      expect(protein?.displayName).toBe('Protein');
      expect(protein?.unit).toBe('g');
    });

    it('should return undefined for unknown nutrient', () => {
      const unknown = service.getNutrient('unknown_nutrient');
      expect(unknown).toBeUndefined();
    });
  });

  describe('getDri', () => {
    it('should return DRI for protein adult male', () => {
      const dri = service.getDri('protein', 'adults_19_30', 'male');
      expect(dri).toBeDefined();
      expect(dri?.value).toBe(56);
      expect(dri?.type).toBe('RDA');
    });

    it('should return different iron DRI for female', () => {
      const male = service.getDri('iron', 'adults_19_30', 'male');
      const female = service.getDri('iron', 'adults_19_30', 'female');
      expect(male?.value).toBe(8);
      expect(female?.value).toBe(18);
    });
  });

  describe('isBeneficial / isLimitNutrient', () => {
    it('should identify fiber as beneficial', () => {
      expect(service.isBeneficial('fiber')).toBe(true);
      expect(service.isLimitNutrient('fiber')).toBe(false);
    });

    it('should identify sodium as limit nutrient', () => {
      expect(service.isBeneficial('sodium')).toBe(false);
      expect(service.isLimitNutrient('sodium')).toBe(true);
    });
  });

  describe('getClinicalInfo', () => {
    it('should return clinical interpretation for vitamin D', () => {
      const info = service.getClinicalInfo('vitamin_d');
      expect(info).toBeDefined();
      expect(info?.importance).toContain('bone');
      expect(info?.foodSources).toBeDefined();
    });
  });
});
```

---

### Step 2.7: Verification

```bash
# Copy JSON files
mkdir -p functions/src/data/nutrition-json
cp docs/nutrition-json/*.json functions/src/data/nutrition-json/

# Build functions
cd functions && pnpm run build

# Run tests
cd functions && pnpm test -- --grep "Nutrition Data"

# Verify file loading works
node -e "
const { nutritionData } = require('./lib/domains/nutrition/data');
nutritionData.initialize();
console.log('Nutrients loaded:', nutritionData.getAllNutrients().length);
console.log('Protein DRI (male 19-30):', nutritionData.getDri('protein', 'adults_19_30', 'male'));
"
```

### Definition of Done - Phase 2

- [ ] JSON files copied to functions/src/data/nutrition-json/
- [ ] Loaders load all 6 JSON files with caching
- [ ] Indexes provide fast lookups by nutrient ID, lifestage, etc.
- [ ] NutritionDataService provides clean API
- [ ] Unit tests pass for loaders and service
- [ ] `pnpm run build` passes in functions
- [ ] Data loads in <100ms

---

## Phase 3: Target Calculator

Build the system that computes personalized daily nutrition targets from user profile and JSON reference data.

### Step 3.1: Age Utilities

**File**: `functions/src/domains/nutrition/targets/ageUtils.ts`

```typescript
import type { LifeStageGroup, Sex, AgeInfo, NutritionUserProfile } from '@nvivo/shared';

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): { years: number; months: number } {
  const dob = new Date(dateOfBirth);
  const today = new Date();

  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();

  if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
    years--;
    months += 12;
  }

  if (today.getDate() < dob.getDate()) {
    months--;
    if (months < 0) months += 12;
  }

  return { years, months };
}

/**
 * Determine lifestage group from age and life circumstances
 */
export function getLifeStageGroup(
  ageYears: number,
  sex: Sex,
  isPregnant?: boolean,
  isLactating?: boolean
): LifeStageGroup {
  // Handle pregnancy/lactation first (female only)
  if (sex === 'female') {
    if (isPregnant) {
      if (ageYears < 19) return 'pregnancy_14_18';
      if (ageYears <= 30) return 'pregnancy_19_30';
      return 'pregnancy_31_50';
    }
    if (isLactating) {
      if (ageYears < 19) return 'lactation_14_18';
      if (ageYears <= 30) return 'lactation_19_30';
      return 'lactation_31_50';
    }
  }

  // Standard age groups
  if (ageYears < 1) return 'infants_7_12mo';  // Assuming 7-12mo for simplicity
  if (ageYears < 4) return 'children_1_3';
  if (ageYears < 9) return 'children_4_8';
  if (ageYears < 14) return 'children_9_13';
  if (ageYears < 19) return 'adolescents_14_18';
  if (ageYears <= 30) return 'adults_19_30';
  if (ageYears <= 50) return 'adults_31_50';
  if (ageYears <= 70) return 'adults_51_70';
  return 'adults_70_plus';
}

/**
 * Get complete age info from user profile
 */
export function getAgeInfo(profile: NutritionUserProfile): AgeInfo {
  const { years, months } = calculateAge(profile.dateOfBirth);
  const lifeStageGroup = getLifeStageGroup(
    years,
    profile.sex,
    profile.isPregnant,
    profile.isLactating
  );

  return { years, months, lifeStageGroup };
}

/**
 * Check if user is in pediatric age range (different DRI handling)
 */
export function isPediatric(ageYears: number): boolean {
  return ageYears < 19;
}

/**
 * Check if user is elderly (may need special considerations)
 */
export function isElderly(ageYears: number): boolean {
  return ageYears >= 65;
}
```

---

### Step 3.2: Calorie Calculator

**File**: `functions/src/domains/nutrition/targets/calorieCalculator.ts`

```typescript
import type { NutritionUserProfile, ActivityLevel, NutritionGoal, EnergyCalculation } from '@nvivo/shared';
import { calculateAge } from './ageUtils';

/**
 * Activity level multipliers for TDEE calculation (PAL values)
 */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,      // Little or no exercise
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  high: 1.725,         // Hard exercise 6-7 days/week
  athlete: 1.9,        // Very hard exercise or physical job
};

/**
 * Goal-based calorie adjustments
 */
const GOAL_ADJUSTMENTS: Record<NutritionGoal, number> = {
  weight_loss: -500,   // ~1 lb/week loss
  maintenance: 0,
  weight_gain: 300,    // Gradual gain
  muscle_gain: 300,    // Surplus for muscle building
  performance: 400,    // Higher surplus for athletic performance
};

/**
 * Default calorie values when BMR cannot be calculated
 */
const DEFAULT_CALORIES = {
  male: 2500,
  female: 2000,
};

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
 *
 * Male: BMR = 10×weight(kg) + 6.25×height(cm) - 5×age + 5
 * Female: BMR = 10×weight(kg) + 6.25×height(cm) - 5×age - 161
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  sex: 'male' | 'female'
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return sex === 'male' ? base + 5 : base - 161;
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55;
  return Math.round(bmr * multiplier);
}

/**
 * Calculate target calories including goal adjustment
 */
export function calculateTargetCalories(tdee: number, goal: NutritionGoal): number {
  const adjustment = GOAL_ADJUSTMENTS[goal] ?? 0;
  const target = tdee + adjustment;

  // Ensure minimum safe calories
  const minimum = 1200;
  return Math.max(minimum, Math.round(target));
}

/**
 * Complete energy calculation from user profile
 */
export function calculateEnergy(profile: NutritionUserProfile): EnergyCalculation {
  const { years: ageYears } = calculateAge(profile.dateOfBirth);
  const activityMultiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel] ?? 1.55;
  const goalAdjustment = GOAL_ADJUSTMENTS[profile.goal] ?? 0;

  // If we have weight and height, use Mifflin-St Jeor
  if (profile.weightKg && profile.heightCm) {
    const bmr = calculateBMR(profile.weightKg, profile.heightCm, ageYears, profile.sex);
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    const targetCalories = calculateTargetCalories(tdee, profile.goal);

    return {
      bmr: Math.round(bmr),
      tdee,
      targetCalories,
      activityMultiplier,
      goalAdjustment,
      method: 'mifflin_st_jeor',
    };
  }

  // Fallback to defaults
  const defaultCalories = DEFAULT_CALORIES[profile.sex];
  const adjustedDefault = defaultCalories + goalAdjustment;

  return {
    bmr: Math.round(defaultCalories / activityMultiplier),
    tdee: defaultCalories,
    targetCalories: Math.max(1200, adjustedDefault),
    activityMultiplier,
    goalAdjustment,
    method: 'default',
  };
}

/**
 * Get activity multiplier for display
 */
export function getActivityMultiplier(activityLevel: ActivityLevel): number {
  return ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55;
}
```

---

### Step 3.3: DRI Lookup

**File**: `functions/src/domains/nutrition/targets/driLookup.ts`

```typescript
import type { NutritionUserProfile, LifeStageGroup, Sex, NutrientTarget, DriType } from '@nvivo/shared';
import { nutritionData } from '../data';
import { getAgeInfo } from './ageUtils';
import { calculateEnergy } from './calorieCalculator';

/**
 * Look up DRI value for a single nutrient based on user profile
 */
export function lookupDriValue(
  nutrientId: string,
  lifeStageGroup: LifeStageGroup,
  sex: Sex
): { value: number | null; unit: string; type: DriType } | null {
  const dri = nutritionData.getDri(nutrientId, lifeStageGroup, sex);
  if (!dri || dri.value === null) return null;

  return {
    value: dri.value,
    unit: dri.unit,
    type: dri.type as DriType,
  };
}

/**
 * Look up Upper Limit for a nutrient
 */
export function lookupUpperLimit(
  nutrientId: string,
  lifeStageGroup: LifeStageGroup,
  sex: Sex
): number | null {
  // UL is typically stored as a separate entry with type 'UL'
  // For now, look it up from the same DRI entry if available
  const dri = nutritionData.getDri(nutrientId, lifeStageGroup, sex);

  // Check if this is a UL entry
  if (dri?.type === 'UL' && dri.value !== null) {
    return dri.value;
  }

  // TODO: Look up UL separately if needed
  return null;
}

/**
 * Calculate AMDR-based macro target in grams
 *
 * @param targetCalories - Daily calorie target
 * @param minPercent - Minimum % of calories
 * @param maxPercent - Maximum % of calories
 * @param kcalPerGram - Energy density (4 for carbs/protein, 9 for fat)
 */
export function calculateAmdrTarget(
  targetCalories: number,
  minPercent: number,
  maxPercent: number,
  kcalPerGram: number
): { min: number; max: number; midpoint: number } {
  const min = Math.round((targetCalories * minPercent / 100) / kcalPerGram);
  const max = Math.round((targetCalories * maxPercent / 100) / kcalPerGram);
  const midpoint = Math.round((min + max) / 2);

  return { min, max, midpoint };
}

/**
 * Get FDA Daily Value for a nutrient
 */
export function getFdaDailyValue(nutrientId: string): number | null {
  return nutritionData.getFdaDvForAdults(nutrientId);
}

/**
 * Build a complete NutrientTarget from lookups
 */
export function buildNutrientTarget(
  nutrientId: string,
  profile: NutritionUserProfile,
  targetCalories: number
): NutrientTarget | null {
  const { lifeStageGroup } = getAgeInfo(profile);
  const nutrientDef = nutritionData.getNutrient(nutrientId);

  if (!nutrientDef) return null;

  const dri = lookupDriValue(nutrientId, lifeStageGroup, profile.sex);
  const fdaDv = getFdaDailyValue(nutrientId);

  const target: NutrientTarget = {
    nutrientId,
    displayName: nutrientDef.displayName,
    unit: nutrientDef.unit,
    source: dri ? `${dri.type} ${lifeStageGroup} ${profile.sex}` : 'FDA DV',
  };

  // Set primary target from DRI
  if (dri && dri.value !== null) {
    target.target = dri.value;
    target.targetType = dri.type === 'RDA' ? 'RDA' : 'AI';
  }

  // Set FDA Daily Value
  if (fdaDv !== null) {
    target.dailyValue = fdaDv;
  }

  // Handle AMDR for macronutrients
  if (nutrientId === 'carbohydrate') {
    const amdr = calculateAmdrTarget(targetCalories, 45, 65, 4);
    target.amdrMin = amdr.min;
    target.amdrMax = amdr.max;
    target.amdrMinPercent = 45;
    target.amdrMaxPercent = 65;
    // Use AMDR midpoint if no RDA
    if (!target.target) target.target = amdr.midpoint;
  } else if (nutrientId === 'protein') {
    const amdr = calculateAmdrTarget(targetCalories, 10, 35, 4);
    target.amdrMin = amdr.min;
    target.amdrMax = amdr.max;
    target.amdrMinPercent = 10;
    target.amdrMaxPercent = 35;
  } else if (nutrientId === 'total_fat') {
    const amdr = calculateAmdrTarget(targetCalories, 20, 35, 9);
    target.amdrMin = amdr.min;
    target.amdrMax = amdr.max;
    target.amdrMinPercent = 20;
    target.amdrMaxPercent = 35;
    if (!target.target) target.target = amdr.midpoint;
  }

  // Look up Upper Limit
  const ul = lookupUpperLimit(nutrientId, lifeStageGroup, profile.sex);
  if (ul !== null) {
    target.upperLimit = ul;
  }

  // For sodium, use CDRR of 2300mg
  if (nutrientId === 'sodium') {
    target.cdrrLimit = 2300;
    if (!target.upperLimit) target.upperLimit = 2300;
  }

  return target;
}
```

---

### Step 3.4: Target Computer

**File**: `functions/src/domains/nutrition/targets/targetComputer.ts`

```typescript
import type { NutritionUserProfile, UserNutritionTargets, NutrientTarget } from '@nvivo/shared';
import { nutritionData } from '../data';
import { getAgeInfo } from './ageUtils';
import { calculateEnergy } from './calorieCalculator';
import { buildNutrientTarget } from './driLookup';

/**
 * Priority nutrients to always include in targets
 */
const PRIORITY_NUTRIENTS = [
  // Macros
  'calories', 'protein', 'carbohydrate', 'total_fat', 'fiber',

  // Sugars
  'total_sugars', 'added_sugars',

  // Fats
  'saturated_fat', 'trans_fat', 'cholesterol',

  // Minerals (priority)
  'sodium', 'potassium', 'calcium', 'iron', 'magnesium', 'zinc',

  // Vitamins (priority)
  'vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k',
  'thiamin', 'riboflavin', 'niacin', 'vitamin_b6', 'folate', 'vitamin_b12',

  // Other
  'choline', 'phosphorus', 'selenium', 'copper', 'manganese',
  'chromium', 'molybdenum', 'iodine',
];

/**
 * Compute personalized nutrition targets for a user
 */
export function computeUserTargets(profile: NutritionUserProfile): UserNutritionTargets {
  const ageInfo = getAgeInfo(profile);
  const energy = calculateEnergy(profile);

  const nutrients: Record<string, NutrientTarget> = {};

  // Build targets for all priority nutrients
  for (const nutrientId of PRIORITY_NUTRIENTS) {
    const target = buildNutrientTarget(nutrientId, profile, energy.targetCalories);
    if (target) {
      nutrients[nutrientId] = target;
    }
  }

  // Also include any additional nutrients from the JSON that have DRI values
  const allNutrients = nutritionData.getAllNutrients();
  for (const nutrient of allNutrients) {
    if (!nutrients[nutrient.nutrientId]) {
      const target = buildNutrientTarget(nutrient.nutrientId, profile, energy.targetCalories);
      if (target && (target.target || target.dailyValue)) {
        nutrients[nutrient.nutrientId] = target;
      }
    }
  }

  return {
    calories: energy.targetCalories,
    nutrients,
    profile: {
      ageYears: ageInfo.years,
      sex: profile.sex,
      lifeStageGroup: ageInfo.lifeStageGroup,
      activityLevel: profile.activityLevel,
      goal: profile.goal,
    },
    computedAt: new Date().toISOString(),
  };
}

/**
 * Get targets for a specific list of nutrients only
 */
export function computeTargetsForNutrients(
  profile: NutritionUserProfile,
  nutrientIds: string[]
): UserNutritionTargets {
  const ageInfo = getAgeInfo(profile);
  const energy = calculateEnergy(profile);

  const nutrients: Record<string, NutrientTarget> = {};

  for (const nutrientId of nutrientIds) {
    const target = buildNutrientTarget(nutrientId, profile, energy.targetCalories);
    if (target) {
      nutrients[nutrientId] = target;
    }
  }

  return {
    calories: energy.targetCalories,
    nutrients,
    profile: {
      ageYears: ageInfo.years,
      sex: profile.sex,
      lifeStageGroup: ageInfo.lifeStageGroup,
      activityLevel: profile.activityLevel,
      goal: profile.goal,
    },
    computedAt: new Date().toISOString(),
  };
}

/**
 * Get a single nutrient target
 */
export function computeSingleTarget(
  profile: NutritionUserProfile,
  nutrientId: string
): NutrientTarget | null {
  const energy = calculateEnergy(profile);
  return buildNutrientTarget(nutrientId, profile, energy.targetCalories);
}

/**
 * Get calorie target only (without full nutrient computation)
 */
export function computeCalorieTarget(profile: NutritionUserProfile): number {
  const energy = calculateEnergy(profile);
  return energy.targetCalories;
}
```

---

### Step 3.5: Barrel Export

**File**: `functions/src/domains/nutrition/targets/index.ts`

```typescript
export { calculateAge, getLifeStageGroup, getAgeInfo, isPediatric, isElderly } from './ageUtils';
export {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateEnergy,
  getActivityMultiplier,
} from './calorieCalculator';
export {
  lookupDriValue,
  lookupUpperLimit,
  calculateAmdrTarget,
  getFdaDailyValue,
  buildNutrientTarget,
} from './driLookup';
export {
  computeUserTargets,
  computeTargetsForNutrients,
  computeSingleTarget,
  computeCalorieTarget,
} from './targetComputer';
```

---

### Step 3.6: Unit Tests

**File**: `functions/test/unit/nutrition/targets/calorieCalculator.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateEnergy,
} from '../../../../src/domains/nutrition/targets/calorieCalculator';
import type { NutritionUserProfile } from '@nvivo/shared';

describe('Calorie Calculator', () => {
  describe('calculateBMR', () => {
    it('should calculate BMR for adult male', () => {
      // 30yo male, 70kg, 175cm
      // BMR = 10×70 + 6.25×175 - 5×30 + 5 = 700 + 1093.75 - 150 + 5 = 1648.75
      const bmr = calculateBMR(70, 175, 30, 'male');
      expect(bmr).toBeCloseTo(1648.75, 0);
    });

    it('should calculate BMR for adult female', () => {
      // 30yo female, 60kg, 165cm
      // BMR = 10×60 + 6.25×165 - 5×30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25
      const bmr = calculateBMR(60, 165, 30, 'female');
      expect(bmr).toBeCloseTo(1320.25, 0);
    });
  });

  describe('calculateTDEE', () => {
    it('should apply sedentary multiplier', () => {
      const tdee = calculateTDEE(1650, 'sedentary');
      expect(tdee).toBe(Math.round(1650 * 1.2));
    });

    it('should apply moderate multiplier', () => {
      const tdee = calculateTDEE(1650, 'moderate');
      expect(tdee).toBe(Math.round(1650 * 1.55));
    });

    it('should apply athlete multiplier', () => {
      const tdee = calculateTDEE(1650, 'athlete');
      expect(tdee).toBe(Math.round(1650 * 1.9));
    });
  });

  describe('calculateTargetCalories', () => {
    it('should subtract 500 for weight loss', () => {
      const target = calculateTargetCalories(2500, 'weight_loss');
      expect(target).toBe(2000);
    });

    it('should add 300 for muscle gain', () => {
      const target = calculateTargetCalories(2500, 'muscle_gain');
      expect(target).toBe(2800);
    });

    it('should enforce minimum of 1200', () => {
      const target = calculateTargetCalories(1500, 'weight_loss');
      expect(target).toBe(1200);
    });
  });

  describe('calculateEnergy', () => {
    it('should use Mifflin-St Jeor when weight/height provided', () => {
      const profile: NutritionUserProfile = {
        dateOfBirth: '1994-06-15',
        sex: 'male',
        weightKg: 70,
        heightCm: 175,
        activityLevel: 'moderate',
        goal: 'maintenance',
      };

      const energy = calculateEnergy(profile);
      expect(energy.method).toBe('mifflin_st_jeor');
      expect(energy.bmr).toBeGreaterThan(1500);
      expect(energy.tdee).toBeGreaterThan(energy.bmr);
    });

    it('should use defaults when weight/height not provided', () => {
      const profile: NutritionUserProfile = {
        dateOfBirth: '1994-06-15',
        sex: 'female',
        activityLevel: 'moderate',
        goal: 'maintenance',
      };

      const energy = calculateEnergy(profile);
      expect(energy.method).toBe('default');
      expect(energy.targetCalories).toBe(2000);
    });
  });
});
```

**File**: `functions/test/unit/nutrition/targets/targetComputer.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { computeUserTargets, computeSingleTarget } from '../../../../src/domains/nutrition/targets/targetComputer';
import { NutritionDataService } from '../../../../src/domains/nutrition/data';
import type { NutritionUserProfile } from '@nvivo/shared';

describe('Target Computer', () => {
  beforeEach(() => {
    const service = NutritionDataService.getInstance();
    service.reset();
    service.initialize();
  });

  const testProfile: NutritionUserProfile = {
    dateOfBirth: '1990-01-15',
    sex: 'male',
    weightKg: 75,
    heightCm: 178,
    activityLevel: 'moderate',
    goal: 'maintenance',
  };

  describe('computeUserTargets', () => {
    it('should compute targets for all priority nutrients', () => {
      const targets = computeUserTargets(testProfile);

      expect(targets.calories).toBeGreaterThan(2000);
      expect(targets.nutrients.protein).toBeDefined();
      expect(targets.nutrients.fiber).toBeDefined();
      expect(targets.nutrients.sodium).toBeDefined();
      expect(targets.nutrients.vitamin_d).toBeDefined();
    });

    it('should include profile metadata', () => {
      const targets = computeUserTargets(testProfile);

      expect(targets.profile.sex).toBe('male');
      expect(targets.profile.activityLevel).toBe('moderate');
      expect(targets.profile.ageYears).toBeGreaterThan(30);
    });

    it('should compute AMDR for macros', () => {
      const targets = computeUserTargets(testProfile);

      expect(targets.nutrients.carbohydrate?.amdrMin).toBeDefined();
      expect(targets.nutrients.carbohydrate?.amdrMax).toBeDefined();
      expect(targets.nutrients.total_fat?.amdrMin).toBeDefined();
    });
  });

  describe('computeSingleTarget', () => {
    it('should return protein target for male', () => {
      const target = computeSingleTarget(testProfile, 'protein');

      expect(target).not.toBeNull();
      expect(target?.target).toBe(56); // RDA for adult male
      expect(target?.targetType).toBe('RDA');
    });

    it('should return different iron target for female', () => {
      const femaleProfile: NutritionUserProfile = {
        ...testProfile,
        sex: 'female',
      };

      const target = computeSingleTarget(femaleProfile, 'iron');
      expect(target?.target).toBe(18); // Higher RDA for premenopausal female
    });
  });
});
```

---

### Step 3.7: Verification

```bash
# Build functions
cd functions && pnpm run build

# Run tests
cd functions && pnpm test -- --grep "Target"

# Test target computation manually
node -e "
const { computeUserTargets } = require('./lib/domains/nutrition/targets');
const { NutritionDataService } = require('./lib/domains/nutrition/data');

NutritionDataService.getInstance().initialize();

const profile = {
  dateOfBirth: '1990-05-15',
  sex: 'male',
  weightKg: 75,
  heightCm: 178,
  activityLevel: 'moderate',
  goal: 'maintenance'
};

const targets = computeUserTargets(profile);
console.log('Calorie target:', targets.calories);
console.log('Protein target:', targets.nutrients.protein?.target, 'g');
console.log('Sodium limit:', targets.nutrients.sodium?.cdrrLimit, 'mg');
console.log('Nutrients computed:', Object.keys(targets.nutrients).length);
"
```

### Definition of Done - Phase 3

- [ ] Age utilities correctly map ages to lifestage groups
- [ ] Calorie calculator uses Mifflin-St Jeor equation
- [ ] DRI lookup retrieves values from JSON data
- [ ] AMDR targets computed for macros based on calorie target
- [ ] Sodium has CDRR limit of 2300mg
- [ ] All unit tests pass
- [ ] `pnpm run build` passes
- [ ] Targets computed in <50ms

---

## Phase 4: Evaluation Engine

Build the core evaluation system that classifies nutrient intake against targets and produces actionable insights.

### Step 4.1: Nutrient Classifier

**File**: `functions/src/domains/nutrition/evaluation/classifier.ts`

```typescript
import type {
  NutrientTarget,
  NutrientClassification,
  StatusColor,
  RiskClassification,
} from '@nvivo/shared';
import { nutritionData } from '../data';

/**
 * Thresholds for evaluating beneficial nutrients (% of target)
 */
const BENEFICIAL_THRESHOLDS = {
  excellent: 100,    // ≥100% of target
  good: 67,          // 67-99% of target
  below_target: 33,  // 33-66% of target
  low: 0,            // <33% of target
};

/**
 * Thresholds for evaluating limit nutrients (% of limit)
 */
const LIMIT_THRESHOLDS = {
  well_within: 50,      // <50% of limit
  moderate: 80,         // 50-79% of limit
  approaching_limit: 100, // 80-99% of limit
  exceeds_limit: 100,   // ≥100% of limit
};

/**
 * Map classification to status color
 */
const CLASSIFICATION_COLORS: Record<NutrientClassification, StatusColor> = {
  // Beneficial nutrients
  excellent: 'green',
  good: 'light_green',
  below_target: 'yellow',
  low: 'orange',

  // Limit nutrients
  well_within: 'green',
  moderate: 'light_green',
  approaching_limit: 'yellow',
  exceeds_limit: 'red',

  // Neutral/other
  neutral: 'gray',
  no_target: 'gray',
  no_data: 'gray',
};

/**
 * Get risk classification for a nutrient
 */
export function getNutrientRiskClassification(nutrientId: string): RiskClassification {
  const def = nutritionData.getNutrient(nutrientId);
  return def?.riskClassification ?? 'neutral';
}

/**
 * Classify intake of a beneficial nutrient
 */
export function classifyBeneficialNutrient(
  percentOfTarget: number
): NutrientClassification {
  if (percentOfTarget >= BENEFICIAL_THRESHOLDS.excellent) return 'excellent';
  if (percentOfTarget >= BENEFICIAL_THRESHOLDS.good) return 'good';
  if (percentOfTarget >= BENEFICIAL_THRESHOLDS.below_target) return 'below_target';
  return 'low';
}

/**
 * Classify intake of a limit (risk) nutrient
 */
export function classifyLimitNutrient(
  percentOfLimit: number
): NutrientClassification {
  if (percentOfLimit >= LIMIT_THRESHOLDS.exceeds_limit) return 'exceeds_limit';
  if (percentOfLimit >= LIMIT_THRESHOLDS.approaching_limit) return 'approaching_limit';
  if (percentOfLimit >= LIMIT_THRESHOLDS.well_within) return 'moderate';
  return 'well_within';
}

/**
 * Classify any nutrient based on intake and target
 */
export function classifyNutrientIntake(
  nutrientId: string,
  intake: number,
  target: NutrientTarget
): { classification: NutrientClassification; statusColor: StatusColor } {
  const riskClass = getNutrientRiskClassification(nutrientId);

  // Handle limit nutrients (sodium, saturated fat, etc.)
  if (riskClass === 'risk') {
    const limit = target.upperLimit ?? target.cdrrLimit ?? target.target;
    if (!limit) {
      return { classification: 'no_target', statusColor: 'gray' };
    }

    const percentOfLimit = (intake / limit) * 100;
    const classification = classifyLimitNutrient(percentOfLimit);
    return { classification, statusColor: CLASSIFICATION_COLORS[classification] };
  }

  // Handle beneficial nutrients
  if (riskClass === 'beneficial') {
    const targetValue = target.target;
    if (!targetValue) {
      return { classification: 'no_target', statusColor: 'gray' };
    }

    const percentOfTarget = (intake / targetValue) * 100;
    const classification = classifyBeneficialNutrient(percentOfTarget);
    return { classification, statusColor: CLASSIFICATION_COLORS[classification] };
  }

  // Handle context-dependent nutrients
  if (riskClass === 'context_dependent') {
    // For context-dependent (like iron), treat as beneficial by default
    // but check upper limit too
    const targetValue = target.target;
    if (!targetValue) {
      return { classification: 'no_target', statusColor: 'gray' };
    }

    const percentOfTarget = (intake / targetValue) * 100;

    // Check if exceeding upper limit
    if (target.upperLimit && intake >= target.upperLimit) {
      return { classification: 'exceeds_limit', statusColor: 'red' };
    }

    const classification = classifyBeneficialNutrient(percentOfTarget);
    return { classification, statusColor: CLASSIFICATION_COLORS[classification] };
  }

  // Neutral nutrients - no good/bad judgment
  return { classification: 'neutral', statusColor: 'gray' };
}

/**
 * Get status color for a classification
 */
export function getStatusColor(classification: NutrientClassification): StatusColor {
  return CLASSIFICATION_COLORS[classification] ?? 'gray';
}

/**
 * Check if a classification indicates a positive outcome
 */
export function isPositiveClassification(classification: NutrientClassification): boolean {
  return ['excellent', 'good', 'well_within'].includes(classification);
}

/**
 * Check if a classification indicates a concern
 */
export function isConcerningClassification(classification: NutrientClassification): boolean {
  return ['low', 'exceeds_limit', 'approaching_limit'].includes(classification);
}
```

---

### Step 4.2: Nutrient Evaluator

**File**: `functions/src/domains/nutrition/evaluation/nutrientEvaluator.ts`

```typescript
import type {
  NutrientTarget,
  NutrientEvaluation,
  RiskClassification,
} from '@nvivo/shared';
import { nutritionData } from '../data';
import { classifyNutrientIntake, getNutrientRiskClassification } from './classifier';

/**
 * Calculate percentage values for display
 */
function calculatePercentages(
  intake: number,
  target: NutrientTarget
): {
  percentOfTarget?: number;
  percentOfLimit?: number;
  percentOfDailyValue?: number;
} {
  const result: ReturnType<typeof calculatePercentages> = {};

  // % of target (RDA/AI)
  if (target.target) {
    result.percentOfTarget = Math.round((intake / target.target) * 100);
  }

  // % of limit (UL or CDRR)
  const limit = target.upperLimit ?? target.cdrrLimit;
  if (limit) {
    result.percentOfLimit = Math.round((intake / limit) * 100);
  }

  // % of FDA Daily Value
  if (target.dailyValue) {
    result.percentOfDailyValue = Math.round((intake / target.dailyValue) * 100);
  }

  return result;
}

/**
 * Evaluate a single nutrient intake against target
 */
export function evaluateNutrient(
  nutrientId: string,
  intake: number | null,
  target: NutrientTarget | null
): NutrientEvaluation {
  const nutrientDef = nutritionData.getNutrient(nutrientId);
  const displayName = nutrientDef?.displayName ?? nutrientId;
  const unit = nutrientDef?.unit ?? 'g';
  const riskClassification = getNutrientRiskClassification(nutrientId);
  const clinicalInterpretation = nutritionData.getClinicalInfo(nutrientId);

  // Handle missing data
  if (intake === null || intake === undefined) {
    return {
      nutrientId,
      displayName,
      intake: null,
      unit,
      target,
      riskClassification,
      classification: 'no_data',
      statusColor: 'gray',
      clinicalInterpretation,
    };
  }

  // Handle missing target
  if (!target) {
    return {
      nutrientId,
      displayName,
      intake,
      unit,
      target: null,
      riskClassification,
      classification: 'no_target',
      statusColor: 'gray',
      clinicalInterpretation,
    };
  }

  // Calculate percentages
  const percentages = calculatePercentages(intake, target);

  // Get classification
  const { classification, statusColor } = classifyNutrientIntake(
    nutrientId,
    intake,
    target
  );

  return {
    nutrientId,
    displayName,
    intake,
    unit,
    target,
    percentOfTarget: percentages.percentOfTarget,
    percentOfLimit: percentages.percentOfLimit,
    percentOfDailyValue: percentages.percentOfDailyValue,
    riskClassification,
    classification,
    statusColor,
    clinicalInterpretation,
  };
}

/**
 * Evaluate multiple nutrients at once
 */
export function evaluateNutrients(
  intakes: Record<string, number | null>,
  targets: Record<string, NutrientTarget>
): NutrientEvaluation[] {
  const evaluations: NutrientEvaluation[] = [];

  // Evaluate all nutrients that have targets
  for (const [nutrientId, target] of Object.entries(targets)) {
    const intake = intakes[nutrientId] ?? null;
    evaluations.push(evaluateNutrient(nutrientId, intake, target));
  }

  // Also evaluate nutrients with intake but no target (for completeness)
  for (const [nutrientId, intake] of Object.entries(intakes)) {
    if (!targets[nutrientId] && intake !== null) {
      evaluations.push(evaluateNutrient(nutrientId, intake, null));
    }
  }

  return evaluations;
}

/**
 * Get evaluations sorted by concern level (most concerning first)
 */
export function sortEvaluationsByConcern(
  evaluations: NutrientEvaluation[]
): NutrientEvaluation[] {
  const concernOrder: Record<string, number> = {
    exceeds_limit: 1,
    low: 2,
    approaching_limit: 3,
    below_target: 4,
    moderate: 5,
    good: 6,
    well_within: 7,
    excellent: 8,
    neutral: 9,
    no_target: 10,
    no_data: 11,
  };

  return [...evaluations].sort((a, b) => {
    const orderA = concernOrder[a.classification] ?? 99;
    const orderB = concernOrder[b.classification] ?? 99;
    return orderA - orderB;
  });
}

/**
 * Filter evaluations to only include beneficial nutrients
 */
export function filterBeneficialEvaluations(
  evaluations: NutrientEvaluation[]
): NutrientEvaluation[] {
  return evaluations.filter(e => e.riskClassification === 'beneficial');
}

/**
 * Filter evaluations to only include limit nutrients
 */
export function filterLimitEvaluations(
  evaluations: NutrientEvaluation[]
): NutrientEvaluation[] {
  return evaluations.filter(e => e.riskClassification === 'risk');
}
```

---

### Step 4.3: Food Evaluator

**File**: `functions/src/domains/nutrition/evaluation/foodEvaluator.ts`

```typescript
import type {
  NutrientTarget,
  NutrientEvaluation,
  FoodEvaluation,
} from '@nvivo/shared';
import { evaluateNutrient } from './nutrientEvaluator';
import { isPositiveClassification, isConcerningClassification } from './classifier';

/**
 * Nutrient data from a food item (USDA format or similar)
 */
export interface FoodNutrientData {
  foodId?: string;
  foodName: string;
  servingSize?: string;
  servingGrams?: number;
  nutrients: Record<string, number>;  // nutrientId -> amount per serving
}

/**
 * Evaluate a single food item against user targets
 *
 * @param food - Food nutrient data
 * @param targets - User's personalized targets (full day)
 * @param servingMultiplier - Number of servings consumed (default 1)
 */
export function evaluateFood(
  food: FoodNutrientData,
  targets: Record<string, NutrientTarget>,
  servingMultiplier: number = 1
): FoodEvaluation {
  const nutrientEvaluations: NutrientEvaluation[] = [];

  // Evaluate each nutrient in the food
  for (const [nutrientId, target] of Object.entries(targets)) {
    const rawAmount = food.nutrients[nutrientId];
    const intake = rawAmount !== undefined ? rawAmount * servingMultiplier : null;

    const evaluation = evaluateNutrient(nutrientId, intake, target);
    nutrientEvaluations.push(evaluation);
  }

  // Sort by relevance (nutrients with data first)
  const sortedEvaluations = nutrientEvaluations.sort((a, b) => {
    if (a.intake !== null && b.intake === null) return -1;
    if (a.intake === null && b.intake !== null) return 1;
    return 0;
  });

  // Extract highlights (beneficial contributions)
  const beneficial = sortedEvaluations
    .filter(e =>
      e.intake !== null &&
      e.riskClassification === 'beneficial' &&
      e.percentOfTarget !== undefined &&
      e.percentOfTarget >= 10  // At least 10% of daily target
    )
    .sort((a, b) => (b.percentOfTarget ?? 0) - (a.percentOfTarget ?? 0))
    .slice(0, 5);

  // Extract concerns (limit nutrients that contribute significantly)
  const concerns = sortedEvaluations
    .filter(e =>
      e.intake !== null &&
      e.riskClassification === 'risk' &&
      e.percentOfLimit !== undefined &&
      e.percentOfLimit >= 15  // At least 15% of daily limit
    )
    .sort((a, b) => (b.percentOfLimit ?? 0) - (a.percentOfLimit ?? 0))
    .slice(0, 5);

  return {
    foodId: food.foodId,
    foodName: food.foodName,
    servingSize: food.servingSize,
    nutrients: sortedEvaluations,
    highlights: {
      beneficial,
      concerns,
    },
  };
}

/**
 * Compare two foods on specific nutrients
 */
export function compareFoods(
  foodA: FoodNutrientData,
  foodB: FoodNutrientData,
  nutrientIds: string[],
  targets: Record<string, NutrientTarget>
): {
  foodAName: string;
  foodBName: string;
  comparisons: Array<{
    nutrientId: string;
    displayName: string;
    foodAValue: number | null;
    foodBValue: number | null;
    foodAPercent: number | null;
    foodBPercent: number | null;
    betterChoice: 'A' | 'B' | 'equal' | 'unknown';
  }>;
} {
  const comparisons = nutrientIds.map(nutrientId => {
    const target = targets[nutrientId];
    const nutrientDef = target;

    const valueA = foodA.nutrients[nutrientId] ?? null;
    const valueB = foodB.nutrients[nutrientId] ?? null;

    const evalA = evaluateNutrient(nutrientId, valueA, target ?? null);
    const evalB = evaluateNutrient(nutrientId, valueB, target ?? null);

    // Determine which is better
    let betterChoice: 'A' | 'B' | 'equal' | 'unknown' = 'unknown';

    if (evalA.riskClassification === 'beneficial') {
      // For beneficial nutrients, higher is better
      if (valueA !== null && valueB !== null) {
        if (valueA > valueB) betterChoice = 'A';
        else if (valueB > valueA) betterChoice = 'B';
        else betterChoice = 'equal';
      }
    } else if (evalA.riskClassification === 'risk') {
      // For risk nutrients, lower is better
      if (valueA !== null && valueB !== null) {
        if (valueA < valueB) betterChoice = 'A';
        else if (valueB < valueA) betterChoice = 'B';
        else betterChoice = 'equal';
      }
    }

    return {
      nutrientId,
      displayName: evalA.displayName,
      foodAValue: valueA,
      foodBValue: valueB,
      foodAPercent: evalA.percentOfTarget ?? evalA.percentOfLimit ?? null,
      foodBPercent: evalB.percentOfTarget ?? evalB.percentOfLimit ?? null,
      betterChoice,
    };
  });

  return {
    foodAName: foodA.foodName,
    foodBName: foodB.foodName,
    comparisons,
  };
}

/**
 * Calculate a simple food score (0-100)
 * Based on beneficial nutrient coverage minus penalty for limit nutrients
 */
export function calculateFoodScore(evaluation: FoodEvaluation): number {
  let beneficialPoints = 0;
  let limitPenalty = 0;
  let beneficialCount = 0;
  let limitCount = 0;

  for (const nutrient of evaluation.nutrients) {
    if (nutrient.intake === null) continue;

    if (nutrient.riskClassification === 'beneficial' && nutrient.percentOfTarget) {
      // Cap at 100% - eating more doesn't add more points
      beneficialPoints += Math.min(nutrient.percentOfTarget, 100);
      beneficialCount++;
    } else if (nutrient.riskClassification === 'risk' && nutrient.percentOfLimit) {
      // Penalty increases as we approach or exceed limit
      if (nutrient.percentOfLimit > 100) {
        limitPenalty += 20; // Flat penalty for exceeding
      } else if (nutrient.percentOfLimit > 80) {
        limitPenalty += 10; // Approaching limit
      } else if (nutrient.percentOfLimit > 50) {
        limitPenalty += 5; // Moderate contribution to limit
      }
      limitCount++;
    }
  }

  // Normalize beneficial points (average of % met, scaled to 0-80)
  const beneficialScore = beneficialCount > 0
    ? (beneficialPoints / beneficialCount) * 0.8
    : 0;

  // Start with beneficial score, subtract penalties
  const rawScore = beneficialScore + 20 - limitPenalty; // +20 baseline for not exceeding limits

  // Clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(rawScore)));
}
```

---

### Step 4.4: Day Evaluator

**File**: `functions/src/domains/nutrition/evaluation/dayEvaluator.ts`

```typescript
import type {
  NutrientTarget,
  NutrientEvaluation,
  DayEvaluation,
  UserNutritionTargets,
} from '@nvivo/shared';
import { evaluateNutrients, sortEvaluationsByConcern } from './nutrientEvaluator';
import { isPositiveClassification, isConcerningClassification } from './classifier';

/**
 * Food log entry for a day
 */
export interface FoodLogEntry {
  foodId?: string;
  foodName: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servings: number;
  nutrients: Record<string, number>;  // Per serving
  loggedAt: string;
}

/**
 * Sum nutrients across multiple food logs
 */
export function sumNutrients(logs: FoodLogEntry[]): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const log of logs) {
    for (const [nutrientId, amountPerServing] of Object.entries(log.nutrients)) {
      const total = amountPerServing * log.servings;
      totals[nutrientId] = (totals[nutrientId] ?? 0) + total;
    }
  }

  return totals;
}

/**
 * Calculate macro distribution percentages
 */
function calculateMacroDistribution(totals: Record<string, number>): {
  carbsPercent: number;
  proteinPercent: number;
  fatPercent: number;
  alcoholPercent?: number;
} {
  const carbGrams = totals['carbohydrate'] ?? 0;
  const proteinGrams = totals['protein'] ?? 0;
  const fatGrams = totals['total_fat'] ?? 0;
  const alcoholGrams = totals['alcohol'] ?? 0;

  // Calculate calories from each macro
  const carbCals = carbGrams * 4;
  const proteinCals = proteinGrams * 4;
  const fatCals = fatGrams * 9;
  const alcoholCals = alcoholGrams * 7;

  const totalMacroCals = carbCals + proteinCals + fatCals + alcoholCals;

  if (totalMacroCals === 0) {
    return { carbsPercent: 0, proteinPercent: 0, fatPercent: 0 };
  }

  const result: ReturnType<typeof calculateMacroDistribution> = {
    carbsPercent: Math.round((carbCals / totalMacroCals) * 100),
    proteinPercent: Math.round((proteinCals / totalMacroCals) * 100),
    fatPercent: Math.round((fatCals / totalMacroCals) * 100),
  };

  if (alcoholCals > 0) {
    result.alcoholPercent = Math.round((alcoholCals / totalMacroCals) * 100);
  }

  return result;
}

/**
 * Calculate daily nutrition score (0-100)
 */
function calculateDayScore(
  evaluations: NutrientEvaluation[],
  macroDistribution: ReturnType<typeof calculateMacroDistribution>
): { score: number; breakdown: { beneficialScore: number; limitScore: number; balanceScore: number } } {
  let beneficialPoints = 0;
  let beneficialMax = 0;
  let limitPoints = 0;
  let limitMax = 0;

  for (const eval_ of evaluations) {
    if (eval_.classification === 'no_data' || eval_.classification === 'no_target') {
      continue;
    }

    if (eval_.riskClassification === 'beneficial') {
      beneficialMax += 100;

      // Points based on % of target achieved (capped at 100%)
      if (eval_.percentOfTarget !== undefined) {
        beneficialPoints += Math.min(eval_.percentOfTarget, 100);
      }
    } else if (eval_.riskClassification === 'risk') {
      limitMax += 100;

      // Points for staying under limit
      if (eval_.percentOfLimit !== undefined) {
        if (eval_.percentOfLimit <= 50) {
          limitPoints += 100;  // Full points for well under
        } else if (eval_.percentOfLimit <= 80) {
          limitPoints += 80;   // Good points for moderate
        } else if (eval_.percentOfLimit <= 100) {
          limitPoints += 50;   // Some points for approaching
        } else {
          limitPoints += 0;    // No points for exceeding
        }
      }
    }
  }

  // Calculate beneficial score (0-40 points)
  const beneficialScore = beneficialMax > 0
    ? Math.round((beneficialPoints / beneficialMax) * 40)
    : 0;

  // Calculate limit score (0-40 points)
  const limitScore = limitMax > 0
    ? Math.round((limitPoints / limitMax) * 40)
    : 40; // Full points if no limit nutrients tracked

  // Calculate balance score (0-20 points) based on macro distribution
  let balanceScore = 20;

  // Check if macros are within AMDR ranges
  // Carbs: 45-65%, Protein: 10-35%, Fat: 20-35%
  const { carbsPercent, proteinPercent, fatPercent } = macroDistribution;

  if (carbsPercent > 0) {  // Only evaluate if we have data
    if (carbsPercent < 40 || carbsPercent > 70) balanceScore -= 5;
    if (proteinPercent < 8 || proteinPercent > 40) balanceScore -= 5;
    if (fatPercent < 15 || fatPercent > 40) balanceScore -= 5;
  }

  const score = Math.max(0, Math.min(100, beneficialScore + limitScore + balanceScore));

  return {
    score,
    breakdown: {
      beneficialScore,
      limitScore,
      balanceScore: Math.max(0, balanceScore),
    },
  };
}

/**
 * Evaluate a full day of food logs
 */
export function evaluateDay(
  date: string,
  logs: FoodLogEntry[],
  userTargets: UserNutritionTargets
): DayEvaluation {
  // Sum all nutrients
  const totals = sumNutrients(logs);
  const totalCalories = totals['calories'] ?? 0;

  // Evaluate all nutrients
  const evaluations = evaluateNutrients(totals, userTargets.nutrients);

  // Calculate macro distribution
  const macroDistribution = calculateMacroDistribution(totals);

  // Calculate score
  const { score, breakdown } = calculateDayScore(evaluations, macroDistribution);

  // Extract highlights
  const sortedByBenefit = [...evaluations]
    .filter(e => e.riskClassification === 'beneficial' && e.percentOfTarget !== undefined)
    .sort((a, b) => (b.percentOfTarget ?? 0) - (a.percentOfTarget ?? 0));

  const achieved = sortedByBenefit
    .filter(e => (e.percentOfTarget ?? 0) >= 100)
    .slice(0, 5);

  const gaps = sortedByBenefit
    .filter(e => (e.percentOfTarget ?? 0) < 67)
    .reverse()  // Lowest first
    .slice(0, 5);

  const concerns = evaluations
    .filter(e =>
      e.riskClassification === 'risk' &&
      e.percentOfLimit !== undefined &&
      e.percentOfLimit >= 80
    )
    .sort((a, b) => (b.percentOfLimit ?? 0) - (a.percentOfLimit ?? 0))
    .slice(0, 5);

  // Count unique meals
  const mealTypes = new Set(logs.map(l => l.mealType));

  return {
    date,
    totalCalories,
    totalsByNutrient: totals,
    nutrients: evaluations,
    macroDistribution,
    score,
    scoreBreakdown: breakdown,
    highlights: {
      achieved,
      gaps,
      concerns,
    },
    mealsLogged: mealTypes.size,
    foodsLogged: logs.length,
  };
}

/**
 * Check if day has enough data for meaningful evaluation
 */
export function hasMinimumLoggingData(logs: FoodLogEntry[]): boolean {
  // Require at least 2 food logs or 1 main meal (breakfast/lunch/dinner)
  if (logs.length >= 2) return true;

  const mainMeals = logs.filter(l =>
    ['breakfast', 'lunch', 'dinner'].includes(l.mealType)
  );

  return mainMeals.length >= 1;
}
```

---

### Step 4.5: Score Calculator

**File**: `functions/src/domains/nutrition/evaluation/scoreCalculator.ts`

```typescript
import type { DayEvaluation, NutrientEvaluation } from '@nvivo/shared';

/**
 * Score label thresholds
 */
const SCORE_LABELS: Array<{ min: number; label: string }> = [
  { min: 90, label: 'Excellent' },
  { min: 75, label: 'Great' },
  { min: 60, label: 'Good' },
  { min: 45, label: 'Fair' },
  { min: 30, label: 'Needs Improvement' },
  { min: 0, label: 'Getting Started' },
];

/**
 * Get human-readable label for score
 */
export function getScoreLabel(score: number): string {
  for (const threshold of SCORE_LABELS) {
    if (score >= threshold.min) {
      return threshold.label;
    }
  }
  return 'Getting Started';
}

/**
 * Get color for score display
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return '#10B981'; // Green
  if (score >= 75) return '#22C55E'; // Light green
  if (score >= 60) return '#84CC16'; // Lime
  if (score >= 45) return '#EAB308'; // Yellow
  if (score >= 30) return '#F97316'; // Orange
  return '#EF4444'; // Red
}

/**
 * Calculate weekly average score
 */
export function calculateWeeklyScore(dayEvaluations: DayEvaluation[]): {
  averageScore: number;
  trend: 'improving' | 'declining' | 'stable';
  daysLogged: number;
} {
  if (dayEvaluations.length === 0) {
    return { averageScore: 0, trend: 'stable', daysLogged: 0 };
  }

  const scores = dayEvaluations.map(d => d.score);
  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  // Calculate trend (compare first half to second half of week)
  let trend: 'improving' | 'declining' | 'stable' = 'stable';

  if (scores.length >= 4) {
    const midpoint = Math.floor(scores.length / 2);
    const firstHalf = scores.slice(0, midpoint);
    const secondHalf = scores.slice(midpoint);

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (secondAvg - firstAvg >= 5) {
      trend = 'improving';
    } else if (firstAvg - secondAvg >= 5) {
      trend = 'declining';
    }
  }

  return {
    averageScore,
    trend,
    daysLogged: dayEvaluations.length,
  };
}

/**
 * Calculate streak of days with score above threshold
 */
export function calculateScoreStreak(
  dayEvaluations: DayEvaluation[],
  threshold: number = 75
): number {
  let streak = 0;

  // Sort by date descending (most recent first)
  const sorted = [...dayEvaluations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const day of sorted) {
    if (day.score >= threshold) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Identify consistently low nutrients across multiple days
 */
export function identifyConsistentGaps(
  dayEvaluations: DayEvaluation[],
  minDays: number = 3
): string[] {
  if (dayEvaluations.length < minDays) {
    return [];
  }

  // Count how many days each nutrient was below target
  const gapCounts: Record<string, number> = {};

  for (const day of dayEvaluations) {
    for (const eval_ of day.nutrients) {
      if (
        eval_.riskClassification === 'beneficial' &&
        eval_.percentOfTarget !== undefined &&
        eval_.percentOfTarget < 67
      ) {
        gapCounts[eval_.nutrientId] = (gapCounts[eval_.nutrientId] ?? 0) + 1;
      }
    }
  }

  // Return nutrients that were low on at least minDays
  return Object.entries(gapCounts)
    .filter(([_, count]) => count >= minDays)
    .sort((a, b) => b[1] - a[1])
    .map(([nutrientId]) => nutrientId);
}

/**
 * Identify consistently high limit nutrients across multiple days
 */
export function identifyConsistentConcerns(
  dayEvaluations: DayEvaluation[],
  minDays: number = 3
): string[] {
  if (dayEvaluations.length < minDays) {
    return [];
  }

  const concernCounts: Record<string, number> = {};

  for (const day of dayEvaluations) {
    for (const eval_ of day.nutrients) {
      if (
        eval_.riskClassification === 'risk' &&
        eval_.percentOfLimit !== undefined &&
        eval_.percentOfLimit >= 80
      ) {
        concernCounts[eval_.nutrientId] = (concernCounts[eval_.nutrientId] ?? 0) + 1;
      }
    }
  }

  return Object.entries(concernCounts)
    .filter(([_, count]) => count >= minDays)
    .sort((a, b) => b[1] - a[1])
    .map(([nutrientId]) => nutrientId);
}
```

---

### Step 4.6: Barrel Export

**File**: `functions/src/domains/nutrition/evaluation/index.ts`

```typescript
// Classifier
export {
  getNutrientRiskClassification,
  classifyBeneficialNutrient,
  classifyLimitNutrient,
  classifyNutrientIntake,
  getStatusColor,
  isPositiveClassification,
  isConcerningClassification,
} from './classifier';

// Nutrient Evaluator
export {
  evaluateNutrient,
  evaluateNutrients,
  sortEvaluationsByConcern,
  filterBeneficialEvaluations,
  filterLimitEvaluations,
} from './nutrientEvaluator';

// Food Evaluator
export type { FoodNutrientData } from './foodEvaluator';
export {
  evaluateFood,
  compareFoods,
  calculateFoodScore,
} from './foodEvaluator';

// Day Evaluator
export type { FoodLogEntry } from './dayEvaluator';
export {
  sumNutrients,
  evaluateDay,
  hasMinimumLoggingData,
} from './dayEvaluator';

// Score Calculator
export {
  getScoreLabel,
  getScoreColor,
  calculateWeeklyScore,
  calculateScoreStreak,
  identifyConsistentGaps,
  identifyConsistentConcerns,
} from './scoreCalculator';
```

---

### Step 4.7: Unit Tests

**File**: `functions/test/unit/nutrition/evaluation/classifier.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  classifyBeneficialNutrient,
  classifyLimitNutrient,
  classifyNutrientIntake,
} from '../../../../src/domains/nutrition/evaluation/classifier';
import { NutritionDataService } from '../../../../src/domains/nutrition/data';
import type { NutrientTarget } from '@nvivo/shared';

describe('Nutrient Classifier', () => {
  beforeEach(() => {
    NutritionDataService.getInstance().reset();
    NutritionDataService.getInstance().initialize();
  });

  describe('classifyBeneficialNutrient', () => {
    it('should classify 100%+ as excellent', () => {
      expect(classifyBeneficialNutrient(100)).toBe('excellent');
      expect(classifyBeneficialNutrient(150)).toBe('excellent');
    });

    it('should classify 67-99% as good', () => {
      expect(classifyBeneficialNutrient(67)).toBe('good');
      expect(classifyBeneficialNutrient(85)).toBe('good');
      expect(classifyBeneficialNutrient(99)).toBe('good');
    });

    it('should classify 33-66% as below_target', () => {
      expect(classifyBeneficialNutrient(33)).toBe('below_target');
      expect(classifyBeneficialNutrient(50)).toBe('below_target');
    });

    it('should classify <33% as low', () => {
      expect(classifyBeneficialNutrient(0)).toBe('low');
      expect(classifyBeneficialNutrient(32)).toBe('low');
    });
  });

  describe('classifyLimitNutrient', () => {
    it('should classify >100% as exceeds_limit', () => {
      expect(classifyLimitNutrient(101)).toBe('exceeds_limit');
      expect(classifyLimitNutrient(150)).toBe('exceeds_limit');
    });

    it('should classify 80-100% as approaching_limit', () => {
      expect(classifyLimitNutrient(80)).toBe('approaching_limit');
      expect(classifyLimitNutrient(99)).toBe('approaching_limit');
    });

    it('should classify 50-79% as moderate', () => {
      expect(classifyLimitNutrient(50)).toBe('moderate');
      expect(classifyLimitNutrient(79)).toBe('moderate');
    });

    it('should classify <50% as well_within', () => {
      expect(classifyLimitNutrient(0)).toBe('well_within');
      expect(classifyLimitNutrient(49)).toBe('well_within');
    });
  });

  describe('classifyNutrientIntake', () => {
    it('should classify fiber intake correctly (beneficial)', () => {
      const target: NutrientTarget = {
        nutrientId: 'fiber',
        displayName: 'Fiber',
        unit: 'g',
        target: 28,
        targetType: 'AI',
        source: 'FDA DV',
      };

      const excellent = classifyNutrientIntake('fiber', 30, target);
      expect(excellent.classification).toBe('excellent');
      expect(excellent.statusColor).toBe('green');

      const low = classifyNutrientIntake('fiber', 8, target);
      expect(low.classification).toBe('low');
      expect(low.statusColor).toBe('orange');
    });

    it('should classify sodium intake correctly (risk)', () => {
      const target: NutrientTarget = {
        nutrientId: 'sodium',
        displayName: 'Sodium',
        unit: 'mg',
        upperLimit: 2300,
        cdrrLimit: 2300,
        source: 'CDRR',
      };

      const wellWithin = classifyNutrientIntake('sodium', 1000, target);
      expect(wellWithin.classification).toBe('well_within');
      expect(wellWithin.statusColor).toBe('green');

      const exceeds = classifyNutrientIntake('sodium', 3000, target);
      expect(exceeds.classification).toBe('exceeds_limit');
      expect(exceeds.statusColor).toBe('red');
    });
  });
});
```

**File**: `functions/test/unit/nutrition/evaluation/dayEvaluator.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { evaluateDay, sumNutrients } from '../../../../src/domains/nutrition/evaluation/dayEvaluator';
import { computeUserTargets } from '../../../../src/domains/nutrition/targets';
import { NutritionDataService } from '../../../../src/domains/nutrition/data';
import type { NutritionUserProfile } from '@nvivo/shared';

describe('Day Evaluator', () => {
  beforeEach(() => {
    NutritionDataService.getInstance().reset();
    NutritionDataService.getInstance().initialize();
  });

  const testProfile: NutritionUserProfile = {
    dateOfBirth: '1990-01-15',
    sex: 'male',
    weightKg: 75,
    heightCm: 178,
    activityLevel: 'moderate',
    goal: 'maintenance',
  };

  describe('sumNutrients', () => {
    it('should sum nutrients across multiple logs', () => {
      const logs = [
        {
          foodName: 'Oatmeal',
          mealType: 'breakfast' as const,
          servings: 1,
          nutrients: { fiber: 4, protein: 6 },
          loggedAt: '2024-01-15T08:00:00Z',
        },
        {
          foodName: 'Salad',
          mealType: 'lunch' as const,
          servings: 1,
          nutrients: { fiber: 3, protein: 10 },
          loggedAt: '2024-01-15T12:00:00Z',
        },
      ];

      const totals = sumNutrients(logs);
      expect(totals.fiber).toBe(7);
      expect(totals.protein).toBe(16);
    });

    it('should handle multiple servings', () => {
      const logs = [
        {
          foodName: 'Rice',
          mealType: 'dinner' as const,
          servings: 2,
          nutrients: { carbohydrate: 45 },
          loggedAt: '2024-01-15T18:00:00Z',
        },
      ];

      const totals = sumNutrients(logs);
      expect(totals.carbohydrate).toBe(90);
    });
  });

  describe('evaluateDay', () => {
    it('should produce evaluation with score', () => {
      const targets = computeUserTargets(testProfile);

      const logs = [
        {
          foodName: 'Breakfast',
          mealType: 'breakfast' as const,
          servings: 1,
          nutrients: {
            calories: 500,
            protein: 20,
            carbohydrate: 60,
            total_fat: 15,
            fiber: 8,
            sodium: 400,
          },
          loggedAt: '2024-01-15T08:00:00Z',
        },
        {
          foodName: 'Lunch',
          mealType: 'lunch' as const,
          servings: 1,
          nutrients: {
            calories: 700,
            protein: 30,
            carbohydrate: 80,
            total_fat: 25,
            fiber: 10,
            sodium: 800,
          },
          loggedAt: '2024-01-15T12:00:00Z',
        },
      ];

      const evaluation = evaluateDay('2024-01-15', logs, targets);

      expect(evaluation.date).toBe('2024-01-15');
      expect(evaluation.totalCalories).toBe(1200);
      expect(evaluation.score).toBeGreaterThan(0);
      expect(evaluation.score).toBeLessThanOrEqual(100);
      expect(evaluation.mealsLogged).toBe(2);
      expect(evaluation.foodsLogged).toBe(2);
    });

    it('should identify highlights', () => {
      const targets = computeUserTargets(testProfile);

      // Log with high fiber
      const logs = [
        {
          foodName: 'High Fiber Day',
          mealType: 'breakfast' as const,
          servings: 1,
          nutrients: {
            fiber: 35, // Exceeds 28g target
            sodium: 500, // Well under 2300mg
          },
          loggedAt: '2024-01-15T08:00:00Z',
        },
      ];

      const evaluation = evaluateDay('2024-01-15', logs, targets);

      // Fiber should be in achieved
      const fiberAchieved = evaluation.highlights.achieved.find(
        h => h.nutrientId === 'fiber'
      );
      expect(fiberAchieved).toBeDefined();
    });
  });
});
```

---

### Step 4.8: Verification

```bash
# Build functions
cd functions && pnpm run build

# Run tests
cd functions && pnpm test -- --grep "Evaluation"

# Test evaluation manually
node -e "
const { evaluateDay } = require('./lib/domains/nutrition/evaluation');
const { computeUserTargets } = require('./lib/domains/nutrition/targets');
const { NutritionDataService } = require('./lib/domains/nutrition/data');

NutritionDataService.getInstance().initialize();

const profile = {
  dateOfBirth: '1990-05-15',
  sex: 'male',
  weightKg: 75,
  heightCm: 178,
  activityLevel: 'moderate',
  goal: 'maintenance'
};

const targets = computeUserTargets(profile);

const logs = [
  {
    foodName: 'Test Day',
    mealType: 'lunch',
    servings: 1,
    nutrients: { calories: 2000, protein: 60, fiber: 30, sodium: 2000 },
    loggedAt: new Date().toISOString()
  }
];

const evaluation = evaluateDay(new Date().toISOString().split('T')[0], logs, targets);
console.log('Score:', evaluation.score);
console.log('Score breakdown:', evaluation.scoreBreakdown);
console.log('Achieved:', evaluation.highlights.achieved.map(h => h.displayName));
console.log('Gaps:', evaluation.highlights.gaps.map(h => h.displayName));
"
```

### Definition of Done - Phase 4

- [ ] Classifier correctly categorizes beneficial vs risk nutrients
- [ ] Nutrient evaluator produces classifications and colors
- [ ] Food evaluator extracts highlights and concerns
- [ ] Day evaluator sums nutrients and computes score
- [ ] Score calculator provides labels and trend analysis
- [ ] All unit tests pass
- [ ] `pnpm run build` passes
- [ ] Evaluation of 50+ nutrients completes in <100ms

---

## Phase 5: Insight Engine

Generate educational highlights, gap information, and descriptive content from evaluations.

### Step 5.1: Highlights Generator

**File**: `functions/src/domains/nutrition/insights/highlights.ts`

```typescript
import type { NutrientEvaluation, NutrientHighlight, DayEvaluation } from '@nvivo/shared';
import { nutritionData } from '../data';

/**
 * Messages for different achievement levels
 */
const ACHIEVEMENT_MESSAGES: Record<string, string[]> = {
  excellent_fiber: [
    'Great fiber intake today!',
    'Your fiber intake supports digestive health.',
    'Excellent fiber - supports gut health.',
  ],
  excellent_protein: [
    'Strong protein intake!',
    'Good protein for muscle maintenance.',
    'Protein target achieved.',
  ],
  excellent_vitamin_c: [
    'Excellent vitamin C intake!',
    'Great antioxidant intake today.',
    'Vitamin C supports immune function.',
  ],
  excellent_vitamin_d: [
    'Good vitamin D today!',
    'Vitamin D supports bone health.',
  ],
  excellent_calcium: [
    'Excellent calcium intake!',
    'Calcium supports bone health.',
  ],
  excellent_iron: [
    'Good iron intake!',
    'Iron supports healthy blood cells.',
  ],
  excellent_potassium: [
    'Great potassium intake!',
    'Potassium supports heart health.',
  ],
  default_excellent: [
    'Target achieved!',
    'Great intake today.',
  ],
  default_good: [
    'Good progress toward target.',
    'Nearly there!',
  ],
};

/**
 * Get a message for a nutrient achievement
 */
function getAchievementMessage(nutrientId: string, classification: string): string {
  const key = `${classification}_${nutrientId}`;
  const messages = ACHIEVEMENT_MESSAGES[key] ?? ACHIEVEMENT_MESSAGES[`default_${classification}`] ?? ['Good job!'];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Generate highlights from nutrient evaluations
 */
export function generateHighlights(evaluations: NutrientEvaluation[]): NutrientHighlight[] {
  const highlights: NutrientHighlight[] = [];

  for (const eval_ of evaluations) {
    // Only highlight beneficial nutrients that are doing well
    if (eval_.riskClassification !== 'beneficial') continue;
    if (eval_.intake === null) continue;
    if (eval_.percentOfTarget === undefined || eval_.percentOfTarget < 67) continue;

    const classification = eval_.percentOfTarget >= 100 ? 'excellent' : 'good';

    highlights.push({
      nutrientId: eval_.nutrientId,
      displayName: eval_.displayName,
      intake: eval_.intake,
      percentOfTarget: eval_.percentOfTarget,
      unit: eval_.unit,
      message: getAchievementMessage(eval_.nutrientId, classification),
    });
  }

  // Sort by % achieved, highest first
  return highlights.sort((a, b) => b.percentOfTarget - a.percentOfTarget);
}

/**
 * Generate top highlights for display (limit to N)
 */
export function getTopHighlights(evaluations: NutrientEvaluation[], limit: number = 3): NutrientHighlight[] {
  return generateHighlights(evaluations).slice(0, limit);
}

/**
 * Generate positive summary statement
 */
export function generatePositiveSummary(dayEval: DayEvaluation): string {
  const achieved = dayEval.highlights.achieved.length;
  const score = dayEval.score;

  if (score >= 90) {
    return `Excellent nutrition day! You met ${achieved} nutrient targets.`;
  } else if (score >= 75) {
    return `Great job today! You achieved ${achieved} nutrient targets.`;
  } else if (score >= 60) {
    return `Good progress! You met ${achieved} nutrient targets.`;
  } else if (achieved > 0) {
    return `You met ${achieved} nutrient target${achieved > 1 ? 's' : ''} today.`;
  }
  return 'Keep logging to see your nutrition insights.';
}
```

---

### Step 5.2: Gaps Generator

**File**: `functions/src/domains/nutrition/insights/gaps.ts`

```typescript
import type { NutrientEvaluation, NutrientGapInfo } from '@nvivo/shared';
import { nutritionData } from '../data';

/**
 * Generate gap information for nutrients below target
 */
export function generateGapInfo(evaluations: NutrientEvaluation[]): NutrientGapInfo[] {
  const gaps: NutrientGapInfo[] = [];

  for (const eval_ of evaluations) {
    // Only show gaps for beneficial nutrients
    if (eval_.riskClassification !== 'beneficial') continue;
    if (eval_.intake === null) continue;
    if (eval_.target?.target === undefined) continue;
    if (eval_.percentOfTarget === undefined || eval_.percentOfTarget >= 67) continue;

    const clinicalInfo = nutritionData.getClinicalInfo(eval_.nutrientId);

    gaps.push({
      nutrientId: eval_.nutrientId,
      displayName: eval_.displayName,
      currentIntake: eval_.intake,
      target: eval_.target.target,
      percentOfTarget: eval_.percentOfTarget,
      unit: eval_.unit,
      importance: clinicalInfo?.importance ?? `${eval_.displayName} is an important nutrient.`,
      commonSources: clinicalInfo?.foodSources ?? 'Various foods',
    });
  }

  // Sort by severity (lowest % first)
  return gaps.sort((a, b) => a.percentOfTarget - b.percentOfTarget);
}

/**
 * Get the most significant gaps (limit to N)
 */
export function getTopGaps(evaluations: NutrientEvaluation[], limit: number = 3): NutrientGapInfo[] {
  return generateGapInfo(evaluations).slice(0, limit);
}

/**
 * Generate gap summary message
 */
export function generateGapSummary(gaps: NutrientGapInfo[]): string {
  if (gaps.length === 0) {
    return 'Great job meeting your nutrient targets!';
  }

  const nutrientNames = gaps.slice(0, 3).map(g => g.displayName);

  if (nutrientNames.length === 1) {
    return `Consider foods rich in ${nutrientNames[0]}.`;
  } else if (nutrientNames.length === 2) {
    return `Consider foods rich in ${nutrientNames[0]} and ${nutrientNames[1]}.`;
  } else {
    const last = nutrientNames.pop();
    return `Consider foods rich in ${nutrientNames.join(', ')}, and ${last}.`;
  }
}

/**
 * Get food suggestions for a gap (educational only)
 */
export function getFoodSuggestionsForGap(nutrientId: string): string[] {
  const clinicalInfo = nutritionData.getClinicalInfo(nutrientId);
  if (!clinicalInfo?.foodSources) return [];

  // Parse food sources string into array
  const sources = clinicalInfo.foodSources
    .split(/[,;]/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && s.length < 50);

  return sources.slice(0, 5);
}
```

---

### Step 5.3: Education Generator

**File**: `functions/src/domains/nutrition/insights/education.ts`

```typescript
import type { ClinicalInterpretation, NutrientDefinition } from '@nvivo/shared';
import { nutritionData } from '../data';

/**
 * Educational content for a nutrient
 */
export interface NutrientEducation {
  nutrientId: string;
  displayName: string;
  category: string;
  unit: string;

  // From clinical interpretation
  importance: string;
  deficiencySigns: string;
  foodSources: string;
  specialConsiderations: string;

  // Additional context
  riskClassification: string;
  notes: string[];
}

/**
 * Get educational content for a nutrient
 */
export function getNutrientEducation(nutrientId: string): NutrientEducation | null {
  const def = nutritionData.getNutrient(nutrientId);
  if (!def) return null;

  const clinical = def.clinicalInterpretation;

  return {
    nutrientId: def.nutrientId,
    displayName: def.displayName,
    category: def.category,
    unit: def.unit,
    importance: clinical?.importance ?? `${def.displayName} is a nutrient tracked in your diet.`,
    deficiencySigns: clinical?.deficiencySigns ?? 'Information not available.',
    foodSources: clinical?.foodSources ?? 'Various foods.',
    specialConsiderations: clinical?.specialConsiderations ?? '',
    riskClassification: def.riskClassification,
    notes: def.notes,
  };
}

/**
 * Get brief description for a nutrient (1-2 sentences)
 */
export function getNutrientBrief(nutrientId: string): string {
  const def = nutritionData.getNutrient(nutrientId);
  if (!def) return '';

  const clinical = def.clinicalInterpretation;
  if (clinical?.importance) {
    // Truncate to first sentence
    const firstSentence = clinical.importance.split('.')[0];
    return firstSentence + '.';
  }

  return `${def.displayName} is a ${def.category}.`;
}

/**
 * Get warning information for a limit nutrient
 */
export function getLimitNutrientInfo(nutrientId: string): string {
  const def = nutritionData.getNutrient(nutrientId);
  if (!def) return '';

  const clinical = def.clinicalInterpretation;
  if (clinical?.excessRisks) {
    return clinical.excessRisks;
  }

  return `High intake of ${def.displayName} may have health implications.`;
}

/**
 * Get all nutrients by category for browsing
 */
export function getNutrientsByCategory(): Record<string, NutrientEducation[]> {
  const allNutrients = nutritionData.getAllNutrients();
  const byCategory: Record<string, NutrientEducation[]> = {};

  for (const def of allNutrients) {
    const education = getNutrientEducation(def.nutrientId);
    if (education) {
      if (!byCategory[def.category]) {
        byCategory[def.category] = [];
      }
      byCategory[def.category].push(education);
    }
  }

  return byCategory;
}
```

---

### Step 5.4: Summary Generator

**File**: `functions/src/domains/nutrition/insights/summaries.ts`

```typescript
import type { DayEvaluation, DailySummary } from '@nvivo/shared';
import { getScoreLabel } from '../evaluation/scoreCalculator';
import { getTopHighlights } from './highlights';
import { getTopGaps } from './gaps';

/**
 * Generate a daily summary for display
 */
export function generateDailySummary(
  dayEval: DayEvaluation,
  loggingStreak: number = 0,
  scoreStreak: number = 0
): DailySummary {
  const highlights = getTopHighlights(dayEval.nutrients, 3);
  const gaps = getTopGaps(dayEval.nutrients, 3);

  // Count nutrients at or above target
  const nutrientsMet = dayEval.nutrients.filter(
    n => n.riskClassification === 'beneficial' &&
         n.percentOfTarget !== undefined &&
         n.percentOfTarget >= 100
  ).length;

  const nutrientsTotal = dayEval.nutrients.filter(
    n => n.riskClassification === 'beneficial' &&
         n.percentOfTarget !== undefined
  ).length;

  return {
    date: dayEval.date,
    score: dayEval.score,
    scoreLabel: getScoreLabel(dayEval.score),
    caloriesConsumed: dayEval.totalCalories,
    caloriesTarget: 0, // Will be filled from user targets
    highlights,
    gaps,
    nutrientsMet,
    nutrientsTotal,
    loggingStreak,
    scoreStreak,
  };
}

/**
 * Generate a brief text summary of the day
 */
export function generateDayTextSummary(dayEval: DayEvaluation): string {
  const parts: string[] = [];

  // Score
  parts.push(`Nutrition Score: ${dayEval.score}/100 (${getScoreLabel(dayEval.score)})`);

  // Calories
  parts.push(`Calories: ${Math.round(dayEval.totalCalories)} kcal`);

  // Achievements
  if (dayEval.highlights.achieved.length > 0) {
    const names = dayEval.highlights.achieved.slice(0, 3).map(h => h.displayName);
    parts.push(`Targets met: ${names.join(', ')}`);
  }

  // Concerns
  if (dayEval.highlights.concerns.length > 0) {
    const names = dayEval.highlights.concerns.slice(0, 2).map(h => h.displayName);
    parts.push(`Watch: ${names.join(', ')}`);
  }

  return parts.join('\n');
}

/**
 * Generate macro summary text
 */
export function generateMacroSummary(dayEval: DayEvaluation): string {
  const { carbsPercent, proteinPercent, fatPercent } = dayEval.macroDistribution;

  return `Macros: ${carbsPercent}% carbs, ${proteinPercent}% protein, ${fatPercent}% fat`;
}
```

---

### Step 5.5: Barrel Export

**File**: `functions/src/domains/nutrition/insights/index.ts`

```typescript
// Highlights
export { generateHighlights, getTopHighlights, generatePositiveSummary } from './highlights';

// Gaps
export {
  generateGapInfo,
  getTopGaps,
  generateGapSummary,
  getFoodSuggestionsForGap,
} from './gaps';

// Education
export type { NutrientEducation } from './education';
export {
  getNutrientEducation,
  getNutrientBrief,
  getLimitNutrientInfo,
  getNutrientsByCategory,
} from './education';

// Summaries
export {
  generateDailySummary,
  generateDayTextSummary,
  generateMacroSummary,
} from './summaries';
```

---

### Step 5.6: Verification

```bash
cd functions && pnpm run build
cd functions && pnpm test -- --grep "Insight"
```

### Definition of Done - Phase 5

- [ ] Highlights generator produces positive messages
- [ ] Gaps generator identifies nutrients below target
- [ ] Education generator retrieves clinical interpretations
- [ ] Summary generator creates daily summaries
- [ ] `pnpm run build` passes

---

## Phase 6: Cloud Functions API

Expose nutrition functionality via callable Cloud Functions.

### Step 6.1: Evaluation Handlers

**File**: `functions/src/domains/nutrition/api/evaluationHandlers.ts`

```typescript
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import type { NutritionUserProfile, UserNutritionTargets } from '@nvivo/shared';
import { computeUserTargets } from '../targets';
import { evaluateDay, evaluateFood } from '../evaluation';
import { generateDailySummary } from '../insights';
import { nutritionData } from '../data';

/**
 * Get personalized nutrition targets
 */
export const getUserNutritionTargets = onCall<{ profile: NutritionUserProfile }>(
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { profile } = request.data;
    if (!profile || !profile.dateOfBirth || !profile.sex) {
      throw new HttpsError('invalid-argument', 'Profile with dateOfBirth and sex required');
    }

    // Initialize data service
    nutritionData.initialize();

    const targets = computeUserTargets(profile);
    return { targets };
  }
);

/**
 * Evaluate a day of food logs
 */
export const evaluateDayNutrition = onCall<{
  date: string;
  logs: Array<{
    foodName: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    servings: number;
    nutrients: Record<string, number>;
    loggedAt: string;
  }>;
  profile: NutritionUserProfile;
}>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { date, logs, profile } = request.data;

  if (!date || !logs || !profile) {
    throw new HttpsError('invalid-argument', 'date, logs, and profile required');
  }

  nutritionData.initialize();

  const targets = computeUserTargets(profile);
  const evaluation = evaluateDay(date, logs, targets);
  const summary = generateDailySummary(evaluation);

  return { evaluation, summary };
});

/**
 * Evaluate a single food item
 */
export const evaluateFoodNutrition = onCall<{
  food: {
    foodName: string;
    servingSize?: string;
    nutrients: Record<string, number>;
  };
  servings: number;
  profile: NutritionUserProfile;
}>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { food, servings, profile } = request.data;

  if (!food || !profile) {
    throw new HttpsError('invalid-argument', 'food and profile required');
  }

  nutritionData.initialize();

  const targets = computeUserTargets(profile);
  const evaluation = evaluateFood(food, targets.nutrients, servings ?? 1);

  return { evaluation };
});
```

---

### Step 6.2: Info Handlers

**File**: `functions/src/domains/nutrition/api/infoHandlers.ts`

```typescript
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { nutritionData } from '../data';
import { getNutrientEducation, getNutrientsByCategory } from '../insights';

/**
 * Get information about a specific nutrient
 */
export const getNutrientInfo = onCall<{ nutrientId: string }>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { nutrientId } = request.data;
  if (!nutrientId) {
    throw new HttpsError('invalid-argument', 'nutrientId required');
  }

  nutritionData.initialize();

  const education = getNutrientEducation(nutrientId);
  if (!education) {
    throw new HttpsError('not-found', `Nutrient ${nutrientId} not found`);
  }

  return { nutrient: education };
});

/**
 * Get all nutrients organized by category
 */
export const getAllNutrients = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be authenticated');
  }

  nutritionData.initialize();

  const byCategory = getNutrientsByCategory();
  const allNutrients = nutritionData.getAllNutrients();

  return {
    byCategory,
    totalCount: allNutrients.length,
  };
});

/**
 * Get FDA Daily Values reference
 */
export const getFdaDailyValues = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be authenticated');
  }

  nutritionData.initialize();

  const nutrients = nutritionData.getAllNutrients();
  const dvList = nutrients
    .map(n => ({
      nutrientId: n.nutrientId,
      displayName: n.displayName,
      unit: n.unit,
      dailyValue: nutritionData.getFdaDvForAdults(n.nutrientId),
    }))
    .filter(n => n.dailyValue !== null);

  return { dailyValues: dvList };
});
```

---

### Step 6.3: Export Functions

**File**: `functions/src/domains/nutrition/api/index.ts`

```typescript
export {
  getUserNutritionTargets,
  evaluateDayNutrition,
  evaluateFoodNutrition,
} from './evaluationHandlers';

export {
  getNutrientInfo,
  getAllNutrients,
  getFdaDailyValues,
} from './infoHandlers';
```

Add to `functions/src/index.ts`:

```typescript
// Nutrition API
export {
  getUserNutritionTargets,
  evaluateDayNutrition,
  evaluateFoodNutrition,
  getNutrientInfo,
  getAllNutrients,
  getFdaDailyValues,
} from './domains/nutrition/api';
```

---

### Step 6.4: Verification

```bash
cd functions && pnpm run build
firebase emulators:start --only functions
# Test via Firebase console or curl
```

### Definition of Done - Phase 6

- [ ] `getUserNutritionTargets` returns personalized targets
- [ ] `evaluateDayNutrition` returns day evaluation and summary
- [ ] `evaluateFoodNutrition` returns food evaluation
- [ ] `getNutrientInfo` returns educational content
- [ ] All functions require authentication
- [ ] `pnpm run build` passes

---

## Phase 7: Client Hooks

Create React hooks for the patient app to consume the nutrition API.

### Step 7.1: Base Hook

**File**: `apps/patient/src/hooks/nutrition/useNutritionApi.ts`

```typescript
import { useMemo, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';

/**
 * Base hook for calling nutrition Cloud Functions
 */
export function useNutritionApi() {
  const callFunction = useCallback(
    async <TData, TResult>(name: string, data: TData): Promise<TResult> => {
      const fn = httpsCallable<TData, TResult>(functions, name);
      const result = await fn(data);
      return result.data;
    },
    []
  );

  return { callFunction };
}
```

---

### Step 7.2: Targets Hook

**File**: `apps/patient/src/hooks/nutrition/useNutritionTargets.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';
import type { NutritionUserProfile, UserNutritionTargets } from '@nvivo/shared';

interface TargetsResponse {
  targets: UserNutritionTargets;
}

/**
 * Fetch personalized nutrition targets
 */
export function useNutritionTargets(profile: NutritionUserProfile | null) {
  return useQuery({
    queryKey: ['nutritionTargets', profile?.dateOfBirth, profile?.sex, profile?.activityLevel],
    queryFn: async (): Promise<UserNutritionTargets> => {
      if (!profile) throw new Error('Profile required');

      const fn = httpsCallable<{ profile: NutritionUserProfile }, TargetsResponse>(
        functions,
        'getUserNutritionTargets'
      );
      const result = await fn({ profile });
      return result.data.targets;
    },
    enabled: !!profile,
    staleTime: 1000 * 60 * 60, // 1 hour - targets don't change often
  });
}
```

---

### Step 7.3: Day Evaluation Hook

**File**: `apps/patient/src/hooks/nutrition/useDayEvaluation.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';
import type { NutritionUserProfile, DayEvaluation, DailySummary } from '@nvivo/shared';

interface FoodLogInput {
  foodName: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servings: number;
  nutrients: Record<string, number>;
  loggedAt: string;
}

interface DayEvaluationResponse {
  evaluation: DayEvaluation;
  summary: DailySummary;
}

/**
 * Evaluate a day's nutrition
 */
export function useDayEvaluation(
  date: string,
  logs: FoodLogInput[],
  profile: NutritionUserProfile | null
) {
  return useQuery({
    queryKey: ['dayEvaluation', date, logs.length, profile?.dateOfBirth],
    queryFn: async (): Promise<DayEvaluationResponse> => {
      if (!profile) throw new Error('Profile required');

      const fn = httpsCallable<
        { date: string; logs: FoodLogInput[]; profile: NutritionUserProfile },
        DayEvaluationResponse
      >(functions, 'evaluateDayNutrition');

      const result = await fn({ date, logs, profile });
      return result.data;
    },
    enabled: !!profile && logs.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

---

### Step 7.4: Nutrient Info Hook

**File**: `apps/patient/src/hooks/nutrition/useNutrientInfo.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';

interface NutrientEducation {
  nutrientId: string;
  displayName: string;
  category: string;
  unit: string;
  importance: string;
  deficiencySigns: string;
  foodSources: string;
  specialConsiderations: string;
  riskClassification: string;
  notes: string[];
}

interface NutrientInfoResponse {
  nutrient: NutrientEducation;
}

/**
 * Get educational info about a nutrient
 */
export function useNutrientInfo(nutrientId: string | null) {
  return useQuery({
    queryKey: ['nutrientInfo', nutrientId],
    queryFn: async (): Promise<NutrientEducation> => {
      if (!nutrientId) throw new Error('nutrientId required');

      const fn = httpsCallable<{ nutrientId: string }, NutrientInfoResponse>(
        functions,
        'getNutrientInfo'
      );
      const result = await fn({ nutrientId });
      return result.data.nutrient;
    },
    enabled: !!nutrientId,
    staleTime: Infinity, // Educational content doesn't change
  });
}
```

---

### Step 7.5: Barrel Export

**File**: `apps/patient/src/hooks/nutrition/index.ts`

```typescript
export { useNutritionApi } from './useNutritionApi';
export { useNutritionTargets } from './useNutritionTargets';
export { useDayEvaluation } from './useDayEvaluation';
export { useNutrientInfo } from './useNutrientInfo';
```

Add to `apps/patient/src/hooks/index.ts`:

```typescript
export * from './nutrition';
```

---

### Definition of Done - Phase 7

- [ ] `useNutritionTargets` fetches personalized targets
- [ ] `useDayEvaluation` evaluates daily nutrition
- [ ] `useNutrientInfo` fetches educational content
- [ ] Hooks use React Query for caching
- [ ] TypeScript types are correct

---

## Phase 8: Dashboard UI - Score Card

Build the main nutrition score display component.

### Step 8.1: Score Circle Component

**File**: `apps/patient/src/screens/journal/nutrition/components/ScoreCircle.tsx`

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ScoreCircleProps {
  score: number;
  label: string;
  size?: number;
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#10B981';
  if (score >= 75) return '#22C55E';
  if (score >= 60) return '#84CC16';
  if (score >= 45) return '#EAB308';
  if (score >= 30) return '#F97316';
  return '#EF4444';
}

export function ScoreCircle({ score, label, size = 120 }: ScoreCircleProps) {
  const color = getScoreColor(score);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <View style={styles.textContainer}>
        <Text style={[styles.score, { color }]}>{score}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  textContainer: {
    alignItems: 'center',
  },
  score: {
    fontSize: 32,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});
```

---

### Step 8.2: Daily Summary Card

**File**: `apps/patient/src/screens/journal/nutrition/components/DailySummaryCard.tsx`

```tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { DailySummary } from '@nvivo/shared';
import { ScoreCircle } from './ScoreCircle';

interface DailySummaryCardProps {
  summary: DailySummary;
  onPress?: () => void;
}

export function DailySummaryCard({ summary, onPress }: DailySummaryCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.date}>Today's Nutrition</Text>
        {summary.loggingStreak > 1 && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {summary.loggingStreak} days</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <ScoreCircle score={summary.score} label={summary.scoreLabel} />

        <View style={styles.stats}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Calories</Text>
            <Text style={styles.statValue}>
              {Math.round(summary.caloriesConsumed)} kcal
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Targets Met</Text>
            <Text style={styles.statValue}>
              {summary.nutrientsMet}/{summary.nutrientsTotal}
            </Text>
          </View>

          {summary.highlights.length > 0 && (
            <View style={styles.highlights}>
              <Text style={styles.highlightsLabel}>Top nutrients:</Text>
              <Text style={styles.highlightsText}>
                {summary.highlights.slice(0, 2).map(h => h.displayName).join(', ')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  date: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  streakBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 12,
    color: '#92400E',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stats: {
    flex: 1,
    marginLeft: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  highlights: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  highlightsLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  highlightsText: {
    fontSize: 13,
    color: '#059669',
    marginTop: 2,
  },
});
```

---

### Step 8.3: Nutrient Bar Component

**File**: `apps/patient/src/screens/journal/nutrition/components/NutrientBar.tsx`

```tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { NutrientEvaluation } from '@nvivo/shared';

interface NutrientBarProps {
  evaluation: NutrientEvaluation;
  onPress?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  green: '#10B981',
  light_green: '#34D399',
  yellow: '#FBBF24',
  orange: '#F97316',
  red: '#EF4444',
  gray: '#9CA3AF',
};

export function NutrientBar({ evaluation, onPress }: NutrientBarProps) {
  const percent = evaluation.percentOfTarget ?? evaluation.percentOfLimit ?? 0;
  const displayPercent = Math.min(percent, 150); // Cap display at 150%
  const barWidth = Math.min((displayPercent / 100) * 100, 100); // Cap bar at 100%
  const color = STATUS_COLORS[evaluation.statusColor] ?? '#9CA3AF';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{evaluation.displayName}</Text>
        <Text style={styles.value}>
          {evaluation.intake !== null
            ? `${Math.round(evaluation.intake)} ${evaluation.unit}`
            : '-'}
        </Text>
      </View>

      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          <View
            style={[
              styles.barFill,
              { width: `${barWidth}%`, backgroundColor: color },
            ]}
          />
          {/* Target marker at 100% */}
          <View style={styles.targetMarker} />
        </View>
        <Text style={[styles.percent, { color }]}>{percent}%</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  value: {
    fontSize: 14,
    color: '#6B7280',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  targetMarker: {
    position: 'absolute',
    right: 0,
    top: -2,
    bottom: -2,
    width: 2,
    backgroundColor: '#374151',
  },
  percent: {
    width: 45,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '500',
  },
});
```

---

### Step 8.4: Component Index

**File**: `apps/patient/src/screens/journal/nutrition/components/index.ts`

```typescript
export { ScoreCircle } from './ScoreCircle';
export { DailySummaryCard } from './DailySummaryCard';
export { NutrientBar } from './NutrientBar';
```

---

### Definition of Done - Phase 8

- [ ] ScoreCircle displays score with color coding
- [ ] DailySummaryCard shows score, calories, highlights
- [ ] NutrientBar shows progress toward target
- [ ] Components are properly typed
- [ ] Components compile without errors

---

## Phase 9: Nutrient Details UI

Build the nutrient detail modal and education display.

### Step 9.1: Nutrient Detail Modal

**File**: `apps/patient/src/screens/journal/nutrition/components/NutrientDetailModal.tsx`

```tsx
import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import type { NutrientEvaluation } from '@nvivo/shared';
import { useNutrientInfo } from '../../../../hooks/nutrition';
import { NutrientBar } from './NutrientBar';

interface NutrientDetailModalProps {
  visible: boolean;
  evaluation: NutrientEvaluation | null;
  onClose: () => void;
}

export function NutrientDetailModal({ visible, evaluation, onClose }: NutrientDetailModalProps) {
  const { data: education, isLoading } = useNutrientInfo(evaluation?.nutrientId ?? null);

  if (!evaluation) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{evaluation.displayName}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Current Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Intake</Text>
            <NutrientBar evaluation={evaluation} />
          </View>

          {/* Educational Content */}
          {education && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Why It Matters</Text>
                <Text style={styles.bodyText}>{education.importance}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Food Sources</Text>
                <Text style={styles.bodyText}>{education.foodSources}</Text>
              </View>

              {education.deficiencySigns && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Signs of Low Intake</Text>
                  <Text style={styles.bodyText}>{education.deficiencySigns}</Text>
                </View>
              )}

              {education.specialConsiderations && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Special Considerations</Text>
                  <Text style={styles.bodyText}>{education.specialConsiderations}</Text>
                </View>
              )}
            </>
          )}

          {isLoading && (
            <View style={styles.loading}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  loading: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
  },
});
```

---

### Step 9.2: Nutrient List Section

**File**: `apps/patient/src/screens/journal/nutrition/components/NutrientListSection.tsx`

```tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import type { NutrientEvaluation } from '@nvivo/shared';
import { NutrientBar } from './NutrientBar';

interface NutrientListSectionProps {
  title: string;
  nutrients: NutrientEvaluation[];
  initiallyExpanded?: boolean;
  onNutrientPress?: (evaluation: NutrientEvaluation) => void;
}

export function NutrientListSection({
  title,
  nutrients,
  initiallyExpanded = false,
  onNutrientPress,
}: NutrientListSectionProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  if (nutrients.length === 0) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.count}>{nutrients.length}</Text>
          {expanded ? (
            <ChevronUp size={20} color="#6B7280" />
          ) : (
            <ChevronDown size={20} color="#6B7280" />
          )}
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.list}>
          {nutrients.map((evaluation) => (
            <NutrientBar
              key={evaluation.nutrientId}
              evaluation={evaluation}
              onPress={() => onNutrientPress?.(evaluation)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  count: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});
```

---

### Step 9.3: Update Component Index

**File**: `apps/patient/src/screens/journal/nutrition/components/index.ts`

```typescript
export { ScoreCircle } from './ScoreCircle';
export { DailySummaryCard } from './DailySummaryCard';
export { NutrientBar } from './NutrientBar';
export { NutrientDetailModal } from './NutrientDetailModal';
export { NutrientListSection } from './NutrientListSection';
```

---

### Definition of Done - Phase 9

- [ ] NutrientDetailModal shows educational content
- [ ] NutrientListSection is collapsible
- [ ] Tapping a nutrient opens detail modal
- [ ] Components compile without errors

---

## Phase 10: History & Trends View

Build the weekly history view with score trends.

### Step 10.1: Weekly Score Chart

**File**: `apps/patient/src/screens/journal/nutrition/components/WeeklyScoreChart.tsx`

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DayScore {
  date: string;
  score: number;
  dayLabel: string;
}

interface WeeklyScoreChartProps {
  scores: DayScore[];
}

function getBarColor(score: number): string {
  if (score >= 75) return '#10B981';
  if (score >= 60) return '#84CC16';
  if (score >= 45) return '#EAB308';
  return '#F97316';
}

export function WeeklyScoreChart({ scores }: WeeklyScoreChartProps) {
  const maxScore = 100;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>This Week</Text>
      <View style={styles.chart}>
        {scores.map((day, index) => {
          const height = (day.score / maxScore) * 80;
          const color = getBarColor(day.score);

          return (
            <View key={day.date} style={styles.barContainer}>
              <Text style={styles.score}>{day.score}</Text>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    { height, backgroundColor: color },
                  ]}
                />
              </View>
              <Text style={styles.dayLabel}>{day.dayLabel}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  score: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  barWrapper: {
    height: 80,
    width: 24,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
});
```

---

### Step 10.2: Trends Summary Card

**File**: `apps/patient/src/screens/journal/nutrition/components/TrendsSummaryCard.tsx`

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';

interface TrendsSummaryCardProps {
  averageScore: number;
  trend: 'improving' | 'declining' | 'stable';
  daysLogged: number;
  consistentGaps: string[];
}

export function TrendsSummaryCard({
  averageScore,
  trend,
  daysLogged,
  consistentGaps,
}: TrendsSummaryCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'improving':
        return <TrendingUp size={20} color="#10B981" />;
      case 'declining':
        return <TrendingDown size={20} color="#EF4444" />;
      default:
        return <Minus size={20} color="#6B7280" />;
    }
  };

  const getTrendLabel = () => {
    switch (trend) {
      case 'improving':
        return 'Improving';
      case 'declining':
        return 'Declining';
      default:
        return 'Stable';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{averageScore}</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>

        <View style={styles.stat}>
          <View style={styles.trendRow}>
            {getTrendIcon()}
            <Text style={styles.trendLabel}>{getTrendLabel()}</Text>
          </View>
          <Text style={styles.statLabel}>Trend</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statValue}>{daysLogged}/7</Text>
          <Text style={styles.statLabel}>Days Logged</Text>
        </View>
      </View>

      {consistentGaps.length > 0 && (
        <View style={styles.gapsSection}>
          <Text style={styles.gapsTitle}>Consider focusing on:</Text>
          <Text style={styles.gapsText}>{consistentGaps.slice(0, 3).join(', ')}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 4,
  },
  gapsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  gapsTitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  gapsText: {
    fontSize: 14,
    color: '#111827',
    marginTop: 4,
  },
});
```

---

### Definition of Done - Phase 10

- [ ] WeeklyScoreChart displays 7-day bar chart
- [ ] TrendsSummaryCard shows avg, trend, and gaps
- [ ] Trend direction shows appropriate icon
- [ ] Components compile without errors

---

## Phase 11: Food Photo Analysis

Build the GPT-5.1 powered food photo analysis feature.

### Step 11.1: Photo Analysis Cloud Function

**File**: `functions/src/domains/nutrition/api/photoAnalysisHandler.ts`

```typescript
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import OpenAI from 'openai';
import type { NutritionUserProfile } from '@nvivo/shared';
import { computeUserTargets } from '../targets';
import { evaluateFood } from '../evaluation';
import { nutritionData } from '../data';

const openaiApiKey = defineSecret('OPENAI_API_KEY');

// GPT-5.1 model as specified
const OPENAI_MODEL = 'gpt-5.1-2025-11-13';

interface AnalyzedFood {
  foodName: string;
  servingSize: string;
  confidence: 'high' | 'medium' | 'low';
  nutrients: Record<string, number>;
}

/**
 * Analyze a food photo using GPT-5.1 vision
 */
export const analyzeFoodPhoto = onCall<{
  imageBase64: string;
  profile: NutritionUserProfile;
}>(
  { secrets: [openaiApiKey] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { imageBase64, profile } = request.data;

    if (!imageBase64 || !profile) {
      throw new HttpsError('invalid-argument', 'imageBase64 and profile required');
    }

    const openai = new OpenAI({ apiKey: openaiApiKey.value() });

    // Analyze image with GPT-5.1
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a nutrition analysis assistant. Analyze food photos and estimate nutritional content.

Return JSON in this exact format:
{
  "foods": [
    {
      "foodName": "string - name of the food item",
      "servingSize": "string - estimated portion (e.g., '1 cup', '2 oz')",
      "confidence": "high" | "medium" | "low",
      "nutrients": {
        "calories": number,
        "protein": number (grams),
        "carbohydrate": number (grams),
        "total_fat": number (grams),
        "fiber": number (grams),
        "sodium": number (mg),
        "saturated_fat": number (grams),
        "added_sugars": number (grams)
      }
    }
  ],
  "mealDescription": "string - brief description of the meal"
}

Be conservative with estimates. If uncertain, use "low" confidence.
Only include nutrients you can reasonably estimate from the image.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
            {
              type: 'text',
              text: 'Analyze this food photo and estimate the nutritional content.',
            },
          ],
        },
      ],
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const analysisText = response.choices[0]?.message?.content;
    if (!analysisText) {
      throw new HttpsError('internal', 'Failed to analyze image');
    }

    let analysis: { foods: AnalyzedFood[]; mealDescription: string };
    try {
      analysis = JSON.parse(analysisText);
    } catch {
      throw new HttpsError('internal', 'Failed to parse analysis result');
    }

    // Initialize nutrition data and compute targets
    nutritionData.initialize();
    const targets = computeUserTargets(profile);

    // Evaluate each identified food
    const evaluatedFoods = analysis.foods.map((food) => {
      const evaluation = evaluateFood(food, targets.nutrients);
      return {
        ...food,
        evaluation,
      };
    });

    return {
      foods: evaluatedFoods,
      mealDescription: analysis.mealDescription,
      model: OPENAI_MODEL,
    };
  }
);
```

---

### Step 11.2: Photo Capture Hook

**File**: `apps/patient/src/hooks/nutrition/useFoodPhotoAnalysis.ts`

```typescript
import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';
import type { NutritionUserProfile, FoodEvaluation } from '@nvivo/shared';

interface AnalyzedFood {
  foodName: string;
  servingSize: string;
  confidence: 'high' | 'medium' | 'low';
  nutrients: Record<string, number>;
  evaluation: FoodEvaluation;
}

interface AnalysisResult {
  foods: AnalyzedFood[];
  mealDescription: string;
  model: string;
}

interface AnalysisParams {
  imageBase64: string;
  profile: NutritionUserProfile;
}

export function useFoodPhotoAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const mutation = useMutation({
    mutationFn: async (params: AnalysisParams): Promise<AnalysisResult> => {
      const fn = httpsCallable<AnalysisParams, AnalysisResult>(
        functions,
        'analyzeFoodPhoto'
      );
      const response = await fn(params);
      return response.data;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const analyze = useCallback(
    (imageBase64: string, profile: NutritionUserProfile) => {
      mutation.mutate({ imageBase64, profile });
    },
    [mutation]
  );

  const reset = useCallback(() => {
    setResult(null);
    mutation.reset();
  }, [mutation]);

  return {
    analyze,
    result,
    isAnalyzing: mutation.isPending,
    error: mutation.error,
    reset,
  };
}
```

---

### Definition of Done - Phase 11

- [ ] `analyzeFoodPhoto` uses GPT-5.1 vision API
- [ ] Returns estimated nutrients with confidence level
- [ ] Evaluates each food against user targets
- [ ] Hook manages analysis state
- [ ] `pnpm run build` passes

---

## Phase 12: Weekly Reports

Build the weekly nutrition report feature.

### Step 12.1: Report Generator

**File**: `functions/src/domains/nutrition/insights/weeklyReport.ts`

```typescript
import type { DayEvaluation, NutrientEvaluation } from '@nvivo/shared';
import { getScoreLabel, calculateWeeklyScore, identifyConsistentGaps, identifyConsistentConcerns } from '../evaluation/scoreCalculator';
import { nutritionData } from '../data';

export interface WeeklyNutritionReport {
  weekStartDate: string;
  weekEndDate: string;

  // Summary stats
  averageScore: number;
  scoreLabel: string;
  trend: 'improving' | 'declining' | 'stable';
  daysLogged: number;

  // Daily breakdown
  dailyScores: Array<{
    date: string;
    score: number;
    mealsLogged: number;
  }>;

  // Nutrient analysis
  topAchievements: Array<{
    nutrientId: string;
    displayName: string;
    averagePercent: number;
    daysAchieved: number;
  }>;

  consistentGaps: Array<{
    nutrientId: string;
    displayName: string;
    averagePercent: number;
    foodSuggestions: string;
  }>;

  consistentConcerns: Array<{
    nutrientId: string;
    displayName: string;
    averagePercent: number;
  }>;

  // Macros average
  averageMacros: {
    carbsPercent: number;
    proteinPercent: number;
    fatPercent: number;
  };

  // Calorie summary
  averageCalories: number;
}

/**
 * Generate a weekly nutrition report from day evaluations
 */
export function generateWeeklyReport(
  dayEvaluations: DayEvaluation[],
  weekStartDate: string,
  weekEndDate: string
): WeeklyNutritionReport {
  const { averageScore, trend, daysLogged } = calculateWeeklyScore(dayEvaluations);

  // Daily scores
  const dailyScores = dayEvaluations.map((d) => ({
    date: d.date,
    score: d.score,
    mealsLogged: d.mealsLogged,
  }));

  // Calculate average nutrients
  const nutrientTotals: Record<string, { total: number; count: number; achieved: number }> = {};

  for (const day of dayEvaluations) {
    for (const nutrient of day.nutrients) {
      if (!nutrientTotals[nutrient.nutrientId]) {
        nutrientTotals[nutrient.nutrientId] = { total: 0, count: 0, achieved: 0 };
      }
      if (nutrient.percentOfTarget !== undefined) {
        nutrientTotals[nutrient.nutrientId].total += nutrient.percentOfTarget;
        nutrientTotals[nutrient.nutrientId].count++;
        if (nutrient.percentOfTarget >= 100) {
          nutrientTotals[nutrient.nutrientId].achieved++;
        }
      }
    }
  }

  // Top achievements (highest average % met)
  const achievements = Object.entries(nutrientTotals)
    .map(([id, data]) => ({
      nutrientId: id,
      displayName: nutritionData.getNutrientDisplayName(id),
      averagePercent: Math.round(data.total / data.count),
      daysAchieved: data.achieved,
    }))
    .filter((a) => a.averagePercent >= 80)
    .sort((a, b) => b.averagePercent - a.averagePercent)
    .slice(0, 5);

  // Consistent gaps
  const gapIds = identifyConsistentGaps(dayEvaluations, 3);
  const gaps = gapIds.map((id) => {
    const data = nutrientTotals[id];
    const clinical = nutritionData.getClinicalInfo(id);
    return {
      nutrientId: id,
      displayName: nutritionData.getNutrientDisplayName(id),
      averagePercent: data ? Math.round(data.total / data.count) : 0,
      foodSuggestions: clinical?.foodSources ?? 'Various foods',
    };
  });

  // Consistent concerns
  const concernIds = identifyConsistentConcerns(dayEvaluations, 3);
  const concerns = concernIds.map((id) => {
    const data = nutrientTotals[id];
    return {
      nutrientId: id,
      displayName: nutritionData.getNutrientDisplayName(id),
      averagePercent: data ? Math.round(data.total / data.count) : 0,
    };
  });

  // Average macros
  let totalCarbs = 0, totalProtein = 0, totalFat = 0;
  for (const day of dayEvaluations) {
    totalCarbs += day.macroDistribution.carbsPercent;
    totalProtein += day.macroDistribution.proteinPercent;
    totalFat += day.macroDistribution.fatPercent;
  }
  const daysCount = dayEvaluations.length || 1;

  // Average calories
  const totalCalories = dayEvaluations.reduce((sum, d) => sum + d.totalCalories, 0);

  return {
    weekStartDate,
    weekEndDate,
    averageScore,
    scoreLabel: getScoreLabel(averageScore),
    trend,
    daysLogged,
    dailyScores,
    topAchievements: achievements,
    consistentGaps: gaps,
    consistentConcerns: concerns,
    averageMacros: {
      carbsPercent: Math.round(totalCarbs / daysCount),
      proteinPercent: Math.round(totalProtein / daysCount),
      fatPercent: Math.round(totalFat / daysCount),
    },
    averageCalories: Math.round(totalCalories / daysCount),
  };
}
```

---

### Step 12.2: Report Cloud Function

**File**: Add to `functions/src/domains/nutrition/api/evaluationHandlers.ts`

```typescript
/**
 * Generate weekly nutrition report
 */
export const getWeeklyNutritionReport = onCall<{
  weekStartDate: string;
  weekEndDate: string;
  dayEvaluations: DayEvaluation[];
}>(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { weekStartDate, weekEndDate, dayEvaluations } = request.data;

  if (!weekStartDate || !dayEvaluations) {
    throw new HttpsError('invalid-argument', 'weekStartDate and dayEvaluations required');
  }

  nutritionData.initialize();

  const report = generateWeeklyReport(dayEvaluations, weekStartDate, weekEndDate);
  return { report };
});
```

---

### Definition of Done - Phase 12

- [ ] `generateWeeklyReport` produces comprehensive report
- [ ] Top achievements identified
- [ ] Consistent gaps with food suggestions
- [ ] Average macros calculated
- [ ] `pnpm run build` passes

---

## Phase 13: Streaks & Gamification

Add streak tracking and achievement badges.

### Step 13.1: Streak Calculator

**File**: `functions/src/domains/nutrition/gamification/streaks.ts`

```typescript
import type { DayEvaluation } from '@nvivo/shared';

export interface StreakInfo {
  loggingStreak: number;
  scoreStreak: number;         // Days with score >= 75
  perfectDaysStreak: number;   // Days with score >= 90
  longestLoggingStreak: number;
  longestScoreStreak: number;
}

/**
 * Calculate current streaks from day evaluations
 */
export function calculateStreaks(
  dayEvaluations: DayEvaluation[],
  today: string
): StreakInfo {
  // Sort by date descending (most recent first)
  const sorted = [...dayEvaluations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let loggingStreak = 0;
  let scoreStreak = 0;
  let perfectDaysStreak = 0;
  let longestLoggingStreak = 0;
  let longestScoreStreak = 0;

  // Calculate current logging streak
  const todayDate = new Date(today);
  let expectedDate = todayDate;

  for (const day of sorted) {
    const dayDate = new Date(day.date);
    const diffDays = Math.floor(
      (expectedDate.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 1) {
      loggingStreak++;
      expectedDate = dayDate;
    } else {
      break;
    }
  }

  // Calculate score streak (>= 75)
  for (const day of sorted) {
    if (day.score >= 75) {
      scoreStreak++;
    } else {
      break;
    }
  }

  // Calculate perfect days streak (>= 90)
  for (const day of sorted) {
    if (day.score >= 90) {
      perfectDaysStreak++;
    } else {
      break;
    }
  }

  // Calculate longest streaks (iterate all)
  let currentLogging = 0;
  let currentScore = 0;

  for (let i = 0; i < sorted.length; i++) {
    // Logging streak
    if (i === 0 || isConsecutiveDay(sorted[i].date, sorted[i - 1].date)) {
      currentLogging++;
    } else {
      longestLoggingStreak = Math.max(longestLoggingStreak, currentLogging);
      currentLogging = 1;
    }

    // Score streak
    if (sorted[i].score >= 75) {
      currentScore++;
    } else {
      longestScoreStreak = Math.max(longestScoreStreak, currentScore);
      currentScore = 0;
    }
  }

  longestLoggingStreak = Math.max(longestLoggingStreak, currentLogging);
  longestScoreStreak = Math.max(longestScoreStreak, currentScore);

  return {
    loggingStreak,
    scoreStreak,
    perfectDaysStreak,
    longestLoggingStreak,
    longestScoreStreak,
  };
}

function isConsecutiveDay(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = Math.abs(d1.getTime() - d2.getTime());
  return diff <= 24 * 60 * 60 * 1000;
}
```

---

### Step 13.2: Achievement Definitions

**File**: `functions/src/domains/nutrition/gamification/achievements.ts`

```typescript
import type { DayEvaluation } from '@nvivo/shared';
import type { StreakInfo } from './streaks';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'score' | 'nutrient' | 'milestone';
  unlockedAt?: string;
}

const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  // Streak achievements
  { id: 'streak_3', name: 'Getting Started', description: 'Log 3 days in a row', icon: '🔥', category: 'streak' },
  { id: 'streak_7', name: 'Week Warrior', description: 'Log 7 days in a row', icon: '🗓️', category: 'streak' },
  { id: 'streak_14', name: 'Fortnight Focus', description: 'Log 14 days in a row', icon: '📆', category: 'streak' },
  { id: 'streak_30', name: 'Monthly Master', description: 'Log 30 days in a row', icon: '🏆', category: 'streak' },

  // Score achievements
  { id: 'score_75_3', name: 'Great Week', description: 'Score 75+ for 3 days', icon: '⭐', category: 'score' },
  { id: 'score_90_1', name: 'Perfect Day', description: 'Achieve a 90+ score', icon: '🌟', category: 'score' },
  { id: 'score_90_7', name: 'Perfect Week', description: 'Score 90+ for 7 days', icon: '💫', category: 'score' },

  // Nutrient achievements
  { id: 'fiber_champ', name: 'Fiber Champion', description: 'Meet fiber target 7 days in a row', icon: '🥦', category: 'nutrient' },
  { id: 'protein_pro', name: 'Protein Pro', description: 'Meet protein target 7 days in a row', icon: '💪', category: 'nutrient' },
  { id: 'vitamin_c_star', name: 'Vitamin C Star', description: 'Meet vitamin C target 7 days in a row', icon: '🍊', category: 'nutrient' },

  // Milestones
  { id: 'first_log', name: 'First Steps', description: 'Log your first meal', icon: '👋', category: 'milestone' },
  { id: 'logs_50', name: 'Dedicated Logger', description: 'Log 50 meals', icon: '📝', category: 'milestone' },
  { id: 'logs_100', name: 'Century Club', description: 'Log 100 meals', icon: '💯', category: 'milestone' },
];

/**
 * Check which achievements are unlocked
 */
export function checkAchievements(
  dayEvaluations: DayEvaluation[],
  streaks: StreakInfo,
  totalMealsLogged: number
): Achievement[] {
  const unlocked: Achievement[] = [];
  const now = new Date().toISOString();

  // Streak achievements
  if (streaks.longestLoggingStreak >= 3) {
    unlocked.push({ ...ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'streak_3')!, unlockedAt: now });
  }
  if (streaks.longestLoggingStreak >= 7) {
    unlocked.push({ ...ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'streak_7')!, unlockedAt: now });
  }
  if (streaks.longestLoggingStreak >= 14) {
    unlocked.push({ ...ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'streak_14')!, unlockedAt: now });
  }
  if (streaks.longestLoggingStreak >= 30) {
    unlocked.push({ ...ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'streak_30')!, unlockedAt: now });
  }

  // Score achievements
  if (streaks.scoreStreak >= 3) {
    unlocked.push({ ...ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'score_75_3')!, unlockedAt: now });
  }
  if (dayEvaluations.some(d => d.score >= 90)) {
    unlocked.push({ ...ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'score_90_1')!, unlockedAt: now });
  }
  if (streaks.perfectDaysStreak >= 7) {
    unlocked.push({ ...ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'score_90_7')!, unlockedAt: now });
  }

  // Milestone achievements
  if (totalMealsLogged >= 1) {
    unlocked.push({ ...ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'first_log')!, unlockedAt: now });
  }
  if (totalMealsLogged >= 50) {
    unlocked.push({ ...ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'logs_50')!, unlockedAt: now });
  }
  if (totalMealsLogged >= 100) {
    unlocked.push({ ...ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'logs_100')!, unlockedAt: now });
  }

  return unlocked.filter(Boolean);
}

/**
 * Get all achievement definitions
 */
export function getAllAchievements(): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS;
}
```

---

### Step 13.3: Barrel Export

**File**: `functions/src/domains/nutrition/gamification/index.ts`

```typescript
export type { StreakInfo } from './streaks';
export { calculateStreaks } from './streaks';

export type { Achievement } from './achievements';
export { checkAchievements, getAllAchievements } from './achievements';
```

---

### Definition of Done - Phase 13

- [ ] Streak calculator tracks logging and score streaks
- [ ] 14+ achievements defined across categories
- [ ] Achievement checking logic implemented
- [ ] `pnpm run build` passes

---

## Phase 14: Final Integration

Wire everything together and add polish.

### Step 14.1: Domain Barrel Export

**File**: `functions/src/domains/nutrition/index.ts`

```typescript
// Data
export { nutritionData, NutritionDataService, preloadAllData } from './data';

// Targets
export {
  computeUserTargets,
  computeTargetsForNutrients,
  computeSingleTarget,
  computeCalorieTarget,
  calculateEnergy,
  getLifeStageGroup,
  getAgeInfo,
} from './targets';

// Evaluation
export {
  evaluateNutrient,
  evaluateNutrients,
  evaluateFood,
  evaluateDay,
  classifyNutrientIntake,
  getScoreLabel,
  getScoreColor,
  calculateWeeklyScore,
} from './evaluation';

// Insights
export {
  generateHighlights,
  generateGapInfo,
  generateDailySummary,
  getNutrientEducation,
  getNutrientsByCategory,
} from './insights';

// Gamification
export { calculateStreaks, checkAchievements, getAllAchievements } from './gamification';
```

---

### Step 14.2: Initialize in Functions Entry Point

**File**: Add to top of `functions/src/index.ts`

```typescript
import { preloadAllData } from './domains/nutrition/data';

// Preload nutrition data on cold start
preloadAllData();
```

---

### Step 14.3: Verification Checklist

```bash
# Full build test
cd functions && pnpm run build
cd apps/patient && pnpm run build

# Type check
pnpm run type-check

# Run all nutrition tests
cd functions && pnpm test -- --grep "nutrition"

# Start emulators and test manually
firebase emulators:start
```

---

### Definition of Done - Phase 14

- [ ] All exports consolidated in barrel files
- [ ] Nutrition data preloaded on cold start
- [ ] Full build passes for functions and patient app
- [ ] Type check passes
- [ ] Unit tests pass
- [ ] Manual testing in emulator successful

---

## Summary

This implementation plan provides **14 phases** to build a complete, FDA-compliant nutrition evaluation system:

1. **Shared Types** - TypeScript interfaces for JSON schemas
2. **Data Loader** - Service to load/index JSON reference data
3. **Target Calculator** - Personalized DRI targets from profile
4. **Evaluation Engine** - Classify nutrients, evaluate foods/days
5. **Insight Engine** - Highlights, gaps, educational content
6. **Cloud Functions API** - Expose via callable functions
7. **Client Hooks** - React Query hooks for patient app
8. **Dashboard UI** - Score circle, summary card, nutrient bars
9. **Nutrient Details UI** - Detail modal, list sections
10. **History & Trends** - Weekly chart, trends summary
11. **Food Photo Analysis** - GPT-5.1 vision integration
12. **Weekly Reports** - Comprehensive weekly summary
13. **Gamification** - Streaks and achievements
14. **Final Integration** - Wire up and polish

**Key Architecture Principles:**

- JSON files are the **single source of truth** for all nutritional reference data
- TypeScript code **never hardcodes** nutrient values - always loads from JSON
- All user-facing content is **descriptive and educational**, not prescriptive
- Evaluation is **pure and testable** - input profile + intake, output evaluation

**Estimated Total:** ~3,500 lines of new TypeScript code across functions and patient app.
