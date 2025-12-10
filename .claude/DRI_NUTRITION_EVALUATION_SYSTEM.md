# DRI-Based Nutrient Evaluation System - Implementation Plan

## Overview

This document outlines the implementation of a comprehensive **Dietary Reference Intake (DRI)** based nutrient evaluation system for the NVIVO nutrition app. The system computes personalized daily targets based on user demographics and health conditions, evaluates foods against those targets, and classifies nutrients as beneficial or risk-based.

**Goal**: Build the best-in-class nutrition evaluation system that is production-ready, fully functional, and clinically accurate.

---

## Architecture Principles

### 1. Separation of Concerns

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SHARED TYPES LAYER                            │
│                    packages/shared/src/types/models/                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  dri.ts     │  │ nutrition.ts│  │  patient.ts │  │  common.ts  │    │
│  │ (DRI types) │  │ (nutrients) │  │ (profiles)  │  │  (base)     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DOMAIN LOGIC LAYER                              │
│                   functions/src/domains/nutrition/dri/                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ driTable.ts │  │ driLogic.ts │  │classific-   │  │userProfile  │    │
│  │ (data only) │  │(pure funcs) │  │ation.ts    │  │  .ts        │    │
│  │             │  │             │  │(pure funcs) │  │(Firestore)  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│         │                │                │                │            │
│         └────────────────┼────────────────┼────────────────┘            │
│                          ▼                ▼                             │
│                   ┌─────────────────────────────┐                       │
│                   │       evaluator.ts          │                       │
│                   │  (orchestrates all above)   │                       │
│                   └─────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            API LAYER                                    │
│                        functions/src/index.ts                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  evaluateNutrition()  │  getUserTargets()  │  evaluateMeal()    │   │
│  │     (Cloud Fn)        │    (Cloud Fn)      │    (Cloud Fn)      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                    │
│                   apps/patient/src/hooks/nutrition/                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ useNutrientEvaluation()  │  useUserTargets()  │  useDailyScore() │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2. Dependency Rules

- **Types** → No dependencies (pure TypeScript interfaces)
- **Data Tables** → Only import Types
- **Logic Functions** → Import Types + Data Tables (NO side effects)
- **Evaluator** → Orchestrates Logic Functions (NO direct Firestore)
- **User Profile Adapter** → Only file that touches Firestore
- **API Layer** → Composes Evaluator + User Profile Adapter
- **Client Hooks** → Only call API Layer

### 3. Testability

Every module is independently testable:
- **Data Tables**: Validate against NIH/USDA source data
- **Logic Functions**: Pure input/output, no mocking needed
- **Classification**: Deterministic threshold-based rules
- **API Layer**: Integration tests with emulator

---

## Verification Protocol

For each step, you can verify completion by running specific commands. I'll provide:
1. **Build Check**: `pnpm run type-check` must pass
2. **Test Check**: Specific tests must pass
3. **Manual Check**: What to inspect in the output

---

## Phase 1: Foundation Types

### Step 1.1: Create Core DRI Types
**File**: `packages/shared/src/types/models/dri.ts`

**What to Create**:
```typescript
// User demographic types
export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high' | 'athlete';
export type LifeStage = 'non_pregnant' | 'pregnant' | 'lactating';
export type GoalType = 'weight_loss' | 'maintenance' | 'muscle_gain' | 'performance';

// Health condition flags
export interface HealthFlags {
  hypertension?: boolean;
  ckd?: boolean;           // chronic kidney disease
  diabetes?: boolean;
  heartDisease?: boolean;
}

// User profile for DRI calculations
export interface DriUserProfile {
  ageYears: number;
  sex: Sex;
  weightKg?: number;
  heightCm?: number;
  activityLevel?: ActivityLevel;
  lifeStage?: LifeStage;
  health?: HealthFlags;
  goal?: GoalType;
}
```

**Verification**:
```bash
# 1. Type check passes
pnpm run type-check

# 2. Verify file exists and exports types
cat packages/shared/src/types/models/dri.ts | head -50

# 3. Manual check: No 'any' types, all properties have explicit types
grep -n "any" packages/shared/src/types/models/dri.ts  # Should return nothing
```

**Definition of Done**:
- [ ] File exists at correct path
- [ ] All types are exported
- [ ] `pnpm run type-check` passes
- [ ] Zero `any` types in file

---

### Step 1.2: Create DRI Value Structure Types
**File**: `packages/shared/src/types/models/dri.ts` (append)

**What to Create**:
```typescript
// Age range string type for DRI lookups
export type AgeRange = '19-30' | '31-50' | '51-70' | '70+';

// DRI reference type (which standard we're using)
export type DriReferenceType = 'RDA' | 'AI' | 'UL' | 'AMDR';

// Values indexed by age range
export type DriValueByAge = Record<AgeRange, number>;

// RDA/AI values split by sex
export interface DriRdaAiBySex {
  male: Partial<DriValueByAge>;
  female: Partial<DriValueByAge>;
}

// Upper Limit values (sometimes same for both sexes)
export interface DriUpperLimit {
  male?: Partial<DriValueByAge>;
  female?: Partial<DriValueByAge>;
  both?: Partial<DriValueByAge>;  // When UL is same for both sexes
}

// Acceptable Macronutrient Distribution Range (% of calories)
export interface DriAmdr {
  minPctKcal: number;
  maxPctKcal: number;
}

// Complete DRI definition for a single nutrient
export interface NutrientDriDefinition {
  nutrientId: string;                    // Maps to existing nutrient keys
  unit: 'kcal' | 'g' | 'mg' | 'mcg';
  rda?: DriRdaAiBySex;                   // Recommended Dietary Allowance
  ai?: DriRdaAiBySex;                    // Adequate Intake (when RDA unavailable)
  ul?: DriUpperLimit;                    // Tolerable Upper Intake Level
  amdr?: DriAmdr;                        // % of calories range
  primaryReference?: 'RDA' | 'AI';       // Which to prefer
  specialAdjustments?: SpecialAdjustment[];
}

// Adjustments for special populations
export interface SpecialAdjustment {
  condition: 'pregnant' | 'lactating' | 'athlete' | 'hypertension' | 'ckd' | 'diabetes';
  adjustment: {
    type: 'absolute' | 'multiplier' | 'replace';
    value: number;
    target: 'base' | 'upperLimit';
  };
}
```

**Verification**:
```bash
# 1. Type check passes
pnpm run type-check

# 2. Verify type exports work in another file
echo "import type { NutrientDriDefinition } from './dri';" > /tmp/test-import.ts
# Should not error when building

# 3. Count exported types (should be 10+)
grep -c "^export" packages/shared/src/types/models/dri.ts
```

**Definition of Done**:
- [ ] All 10+ types exported
- [ ] Types use discriminated unions where appropriate
- [ ] `pnpm run type-check` passes
- [ ] Types are composable (interfaces extend properly)

---

### Step 1.3: Create Evaluation Result Types
**File**: `packages/shared/src/types/models/dri.ts` (append)

**What to Create**:
```typescript
// Nature of a nutrient (determines classification direction)
export type NutrientNature = 'beneficial' | 'risk' | 'neutral';

// Classification result for a single nutrient
export type NutrientClassification =
  | 'beneficial_high'      // Good nutrient, high amount (green)
  | 'beneficial_moderate'  // Good nutrient, moderate amount (light green)
  | 'beneficial_low'       // Good nutrient, low amount (gray)
  | 'risk_high'            // Bad nutrient, high amount (red)
  | 'risk_moderate'        // Bad nutrient, moderate amount (orange)
  | 'risk_low'             // Bad nutrient, low amount (yellow)
  | 'neutral'              // Nutrient is neither good nor bad
  | 'not_applicable'       // No DRI reference available
  | 'insufficient_data';   // Missing food nutrition data

// Computed daily target for a user
export interface DailyNutrientTarget {
  nutrientId: string;
  unit: 'kcal' | 'g' | 'mg' | 'mcg';
  referenceType: DriReferenceType;
  base?: number;           // RDA/AI target value
  min?: number;            // AMDR minimum (grams)
  max?: number;            // AMDR maximum (grams)
  upperLimit?: number;     // UL (don't exceed)
  source: string;          // For debugging: "RDA male 19-30" etc.
}

// Single nutrient evaluation result
export interface NutrientEvaluation {
  nutrientId: string;
  nutrientName: string;
  amountInFood: number | null;
  unit: 'kcal' | 'g' | 'mg' | 'mcg';
  target: DailyNutrientTarget | null;
  percentOfTarget?: number;      // % of RDA/AI
  percentOfUpperLimit?: number;  // % of UL
  classification: NutrientClassification;
  nature: NutrientNature;
}

// Complete evaluation result for a food item
export interface FoodEvaluationResult {
  evaluations: NutrientEvaluation[];
  overallScore?: number;          // Optional 0-100 score
  highlights: {
    beneficial: NutrientEvaluation[];  // Top beneficial nutrients
    concerns: NutrientEvaluation[];    // Top risk nutrients
  };
  userProfile: {
    ageRange: AgeRange;
    sex: Sex;
    calorieTarget: number;
  };
}
```

**Verification**:
```bash
# 1. Type check passes
pnpm run type-check

# 2. Verify classification union is complete
grep "NutrientClassification" packages/shared/src/types/models/dri.ts

# 3. Count all types in file (should be 15+)
grep -c "export type\|export interface" packages/shared/src/types/models/dri.ts
```

**Definition of Done**:
- [ ] 15+ types/interfaces exported
- [ ] `NutrientClassification` has all 9 states
- [ ] `NutrientEvaluation` contains all fields for UI rendering
- [ ] `pnpm run type-check` passes
- [ ] Types can represent any evaluation scenario

---

### Step 1.4: Export Types from Shared Package
**File**: `packages/shared/src/types/models/index.ts` (modify)

**What to Add**:
```typescript
export * from './dri';
```

**Verification**:
```bash
# 1. Type check passes
pnpm run type-check

# 2. Verify exports work from package root
grep "dri" packages/shared/src/types/models/index.ts

# 3. Build shared package
pnpm --filter @nvivo/shared build
```

**Definition of Done**:
- [ ] Export statement added
- [ ] `pnpm --filter @nvivo/shared build` passes
- [ ] Types importable as `import { DriUserProfile } from '@nvivo/shared'`

---

## Phase 2: DRI Reference Data Tables

### Step 2.1: Create Nutrient Nature Registry
**File**: `functions/src/domains/nutrition/dri/nutrientNature.ts`

**What to Create**:
```typescript
import type { NutrientNature } from '@nvivo/shared';

/**
 * Maps nutrient IDs to their nature (beneficial, risk, or neutral).
 * This determines how we classify high/low values.
 *
 * Sources:
 * - FDA Daily Values: https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels
 * - WHO Guidelines: https://www.who.int/news-room/fact-sheets/detail/healthy-diet
 */
export const NUTRIENT_NATURE: Record<string, NutrientNature> = {
  // === BENEFICIAL: Higher is better ===
  protein: 'beneficial',
  fiber: 'beneficial',
  potassium: 'beneficial',
  calcium: 'beneficial',
  iron: 'beneficial',
  magnesium: 'beneficial',
  zinc: 'beneficial',
  phosphorus: 'beneficial',
  selenium: 'beneficial',
  copper: 'beneficial',
  manganese: 'beneficial',
  vitaminA: 'beneficial',
  vitaminC: 'beneficial',
  vitaminD: 'beneficial',
  vitaminE: 'beneficial',
  vitaminK: 'beneficial',
  thiamin: 'beneficial',
  riboflavin: 'beneficial',
  niacin: 'beneficial',
  vitaminB6: 'beneficial',
  folate: 'beneficial',
  vitaminB12: 'beneficial',
  choline: 'beneficial',

  // === RISK: Lower is better ===
  sodium: 'risk',
  saturatedFat: 'risk',
  transFat: 'risk',
  cholesterol: 'risk',
  sugar: 'risk',
  addedSugar: 'risk',

  // === NEUTRAL: Context-dependent ===
  calories: 'neutral',
  carbs: 'neutral',
  fat: 'neutral',
  monounsaturatedFat: 'neutral',
  polyunsaturatedFat: 'neutral',
  caffeine: 'neutral',
  alcohol: 'neutral',
  water: 'neutral',
} as const;

/**
 * Get the nature of a nutrient for classification purposes.
 * Returns 'neutral' for unknown nutrients.
 */
export function getNutrientNature(nutrientId: string): NutrientNature {
  return NUTRIENT_NATURE[nutrientId] ?? 'neutral';
}
```

**Verification**:
```bash
# 1. Type check
cd functions && pnpm run build

# 2. Verify all nutrients from existing NUTRIENT_METADATA are covered
# Compare keys in NUTRIENT_NATURE with keys in NUTRIENT_METADATA
# Manual check: open both files and cross-reference

# 3. Count nutrients (should be 30+)
grep -c ":" functions/src/domains/nutrition/dri/nutrientNature.ts
```

**Definition of Done**:
- [ ] All 30+ nutrients from `NUTRIENT_METADATA` have a nature assigned
- [ ] Function `getNutrientNature()` returns correct type
- [ ] `pnpm run build` in functions passes
- [ ] Comments cite authoritative sources

---

### Step 2.2: Create DRI Data Table (Adults 19-70+)
**File**: `functions/src/domains/nutrition/dri/driTable.ts`

**What to Create**:
```typescript
import type { NutrientDriDefinition } from '@nvivo/shared';

/**
 * Comprehensive DRI table for all tracked nutrients.
 *
 * Data Sources:
 * - NIH Office of Dietary Supplements: https://ods.od.nih.gov/
 * - USDA Dietary Guidelines 2020-2025: https://www.dietaryguidelines.gov/
 * - National Academies DRI Tables: https://www.nationalacademies.org/
 * - FDA Daily Values (2020): https://www.fda.gov/
 *
 * All values are for adults 19+ years unless otherwise noted.
 */
export const NUTRIENT_DRI_TABLE: Record<string, NutrientDriDefinition> = {
  // ═══════════════════════════════════════════════════════════════════
  // MACRONUTRIENTS
  // ═══════════════════════════════════════════════════════════════════

  calories: {
    nutrientId: 'calories',
    unit: 'kcal',
    // No fixed RDA - calculated from BMR + activity
    // EER (Estimated Energy Requirement) varies by individual
  },

  protein: {
    nutrientId: 'protein',
    unit: 'g',
    primaryReference: 'RDA',
    rda: {
      male: { '19-30': 56, '31-50': 56, '51-70': 56, '70+': 56 },
      female: { '19-30': 46, '31-50': 46, '51-70': 46, '70+': 46 },
    },
    amdr: { minPctKcal: 10, maxPctKcal: 35 },
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'absolute', value: 25, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'absolute', value: 25, target: 'base' } },
      { condition: 'athlete', adjustment: { type: 'multiplier', value: 1.6, target: 'base' } },
    ],
  },

  carbs: {
    nutrientId: 'carbs',
    unit: 'g',
    primaryReference: 'RDA',
    rda: {
      male: { '19-30': 130, '31-50': 130, '51-70': 130, '70+': 130 },
      female: { '19-30': 130, '31-50': 130, '51-70': 130, '70+': 130 },
    },
    amdr: { minPctKcal: 45, maxPctKcal: 65 },
  },

  fat: {
    nutrientId: 'fat',
    unit: 'g',
    amdr: { minPctKcal: 20, maxPctKcal: 35 },
    // No RDA - use AMDR to calculate grams from calorie target
  },

  fiber: {
    nutrientId: 'fiber',
    unit: 'g',
    primaryReference: 'AI',
    ai: {
      male: { '19-30': 38, '31-50': 38, '51-70': 30, '70+': 30 },
      female: { '19-30': 25, '31-50': 25, '51-70': 21, '70+': 21 },
    },
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 28, target: 'base' } },
    ],
  },

  sugar: {
    nutrientId: 'sugar',
    unit: 'g',
    // WHO recommends <10% of calories, ideally <5%
    // FDA DV is 50g based on 2000 kcal diet
    ul: {
      both: { '19-30': 50, '31-50': 50, '51-70': 50, '70+': 50 },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // FAT BREAKDOWN
  // ═══════════════════════════════════════════════════════════════════

  saturatedFat: {
    nutrientId: 'saturatedFat',
    unit: 'g',
    // AHA: <10% of calories, ideally <7%
    // Based on 2000 kcal: <20g
    ul: {
      both: { '19-30': 20, '31-50': 20, '51-70': 20, '70+': 20 },
    },
  },

  transFat: {
    nutrientId: 'transFat',
    unit: 'g',
    // WHO: <1% of calories, FDA: as low as possible
    ul: {
      both: { '19-30': 2, '31-50': 2, '51-70': 2, '70+': 2 },
    },
  },

  cholesterol: {
    nutrientId: 'cholesterol',
    unit: 'mg',
    // 2020 Guidelines removed specific limit but recommend minimizing
    // FDA DV remains 300mg
    ul: {
      both: { '19-30': 300, '31-50': 300, '51-70': 300, '70+': 300 },
    },
    specialAdjustments: [
      { condition: 'heartDisease', adjustment: { type: 'replace', value: 200, target: 'upperLimit' } },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // MINERALS
  // ═══════════════════════════════════════════════════════════════════

  sodium: {
    nutrientId: 'sodium',
    unit: 'mg',
    primaryReference: 'AI',
    ai: {
      male: { '19-30': 1500, '31-50': 1500, '51-70': 1500, '70+': 1500 },
      female: { '19-30': 1500, '31-50': 1500, '51-70': 1500, '70+': 1500 },
    },
    ul: {
      both: { '19-30': 2300, '31-50': 2300, '51-70': 2300, '70+': 2300 },
    },
    specialAdjustments: [
      { condition: 'hypertension', adjustment: { type: 'replace', value: 1500, target: 'upperLimit' } },
      { condition: 'ckd', adjustment: { type: 'replace', value: 2000, target: 'upperLimit' } },
    ],
  },

  potassium: {
    nutrientId: 'potassium',
    unit: 'mg',
    primaryReference: 'AI',
    ai: {
      male: { '19-30': 3400, '31-50': 3400, '51-70': 3400, '70+': 3400 },
      female: { '19-30': 2600, '31-50': 2600, '51-70': 2600, '70+': 2600 },
    },
    specialAdjustments: [
      { condition: 'ckd', adjustment: { type: 'replace', value: 2000, target: 'base' } },
    ],
  },

  calcium: {
    nutrientId: 'calcium',
    unit: 'mg',
    primaryReference: 'RDA',
    rda: {
      male: { '19-30': 1000, '31-50': 1000, '51-70': 1000, '70+': 1200 },
      female: { '19-30': 1000, '31-50': 1000, '51-70': 1200, '70+': 1200 },
    },
    ul: {
      both: { '19-30': 2500, '31-50': 2500, '51-70': 2000, '70+': 2000 },
    },
  },

  iron: {
    nutrientId: 'iron',
    unit: 'mg',
    primaryReference: 'RDA',
    rda: {
      male: { '19-30': 8, '31-50': 8, '51-70': 8, '70+': 8 },
      female: { '19-30': 18, '31-50': 18, '51-70': 8, '70+': 8 },
    },
    ul: {
      both: { '19-30': 45, '31-50': 45, '51-70': 45, '70+': 45 },
    },
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 27, target: 'base' } },
    ],
  },

  magnesium: {
    nutrientId: 'magnesium',
    unit: 'mg',
    primaryReference: 'RDA',
    rda: {
      male: { '19-30': 400, '31-50': 420, '51-70': 420, '70+': 420 },
      female: { '19-30': 310, '31-50': 320, '51-70': 320, '70+': 320 },
    },
    ul: {
      // UL only for supplemental magnesium, not dietary
      both: { '19-30': 350, '31-50': 350, '51-70': 350, '70+': 350 },
    },
  },

  zinc: {
    nutrientId: 'zinc',
    unit: 'mg',
    primaryReference: 'RDA',
    rda: {
      male: { '19-30': 11, '31-50': 11, '51-70': 11, '70+': 11 },
      female: { '19-30': 8, '31-50': 8, '51-70': 8, '70+': 8 },
    },
    ul: {
      both: { '19-30': 40, '31-50': 40, '51-70': 40, '70+': 40 },
    },
  },

  phosphorus: {
    nutrientId: 'phosphorus',
    unit: 'mg',
    primaryReference: 'RDA',
    rda: {
      male: { '19-30': 700, '31-50': 700, '51-70': 700, '70+': 700 },
      female: { '19-30': 700, '31-50': 700, '51-70': 700, '70+': 700 },
    },
    ul: {
      both: { '19-30': 4000, '31-50': 4000, '51-70': 4000, '70+': 3000 },
    },
    specialAdjustments: [
      { condition: 'ckd', adjustment: { type: 'replace', value: 800, target: 'upperLimit' } },
    ],
  },

  selenium: {
    nutrientId: 'selenium',
    unit: 'mcg',
    primaryReference: 'RDA',
    rda: {
      male: { '19-30': 55, '31-50': 55, '51-70': 55, '70+': 55 },
      female: { '19-30': 55, '31-50': 55, '51-70': 55, '70+': 55 },
    },
    ul: {
      both: { '19-30': 400, '31-50': 400, '51-70': 400, '70+': 400 },
    },
  },

  copper: {
    nutrientId: 'copper',
    unit: 'mg',
    primaryReference: 'RDA',
    rda: {
      male: { '19-30': 0.9, '31-50': 0.9, '51-70': 0.9, '70+': 0.9 },
      female: { '19-30': 0.9, '31-50': 0.9, '51-70': 0.9, '70+': 0.9 },
    },
    ul: {
      both: { '19-30': 10, '31-50': 10, '51-70': 10, '70+': 10 },
    },
  },

  manganese: {
    nutrientId: 'manganese',
    unit: 'mg',
    primaryReference: 'AI',
    ai: {
      male: { '19-30': 2.3, '31-50': 2.3, '51-70': 2.3, '70+': 2.3 },
      female: { '19-30': 1.8, '31-50': 1.8, '51-70': 1.8, '70+': 1.8 },
    },
    ul: {
      both: { '19-30': 11, '31-50': 11, '51-70': 11, '70+': 11 },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // VITAMINS (FAT-SOLUBLE)
  // ═══════════════════════════════════════════════════════════════════

  vitaminA: {
    nutrientId: 'vitaminA',
    unit: 'mcg',
    primaryReference: 'RDA',
    rda: {
      male: { '19-30': 900, '31-50': 900, '51-70': 900, '70+': 900 },
      female: { '19-30': 700, '31-50': 700, '51-70': 700, '70+': 700 },
    },
    ul: {
      both: { '19-30': 3000, '31-50': 3000, '51-70': 3000, '70+': 3000 },
    },
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 770, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 1300, target: 'base' } },
    ],
  },

  vitaminD: {
    nutrientId: 'vitaminD',
    unit: 'mcg',
    primaryReference: 'RDA',
    rda: {
      male: { '19-30': 15, '31-50': 15, '51-70': 15, '70+': 20 },
      female: { '19-30': 15, '31-50': 15, '51-70': 15, '70+': 20 },
    },
    ul: {
      both: { '19-30': 100, '31-50': 100, '51-70': 100, '70+': 100 },
    },
  },

  vitaminE: {
    nutrientId: 'vitaminE',
    unit: 'mg',
    primaryReference: 'RDA',
    rda: {
      male: { '19-30': 15, '31-50': 15, '51-70': 15, '70+': 15 },
      female: { '19-30': 15, '31-50': 15, '51-70': 15, '70+': 15 },
    },
    ul: {
      both: { '19-30': 1000, '31-50': 1000, '51-70': 1000, '70+': 1000 },
    },
  },

  vitaminK: {
    nutrientId: 'vitaminK',
    unit: 'mcg',
    primaryReference: 'AI',
    ai: {
      male: { '19-30': 120, '31-50': 120, '51-70': 120, '70+': 120 },
      female: { '19-30': 90, '31-50': 90, '51-70': 90, '70+': 90 },
    },
    // No established UL
  },

  // ═══════════════════════════════════════════════════════════════════
  // VITAMINS (WATER-SOLUBLE)
  // ═══════════════════════════════════════════════════════════════════

  vitaminC: {
    nutrientId: 'vitaminC',
    unit: 'mg',
    primaryReference: 'RDA',
    rda: {
      male: { '19-30': 90, '31-50': 90, '51-70': 90, '70+': 90 },
      female: { '19-30': 75, '31-50': 75, '51-70': 75, '70+': 75 },
    },
    ul: {
      both: { '19-30': 2000, '31-50': 2000, '51-70': 2000, '70+': 2000 },
    },
  },

  thiamin: {
    nutrientId: 'thiamin',
    unit: 'mg',
    primaryReference: 'RDA',
    rda: {
      male: { '19-30': 1.2, '31-50': 1.2, '51-70': 1.2, '70+': 1.2 },
      female: { '19-30': 1.1, '31-50': 1.1, '51-70': 1.1, '70+': 1.1 },
    },
    // No established UL
  },

  riboflavin: {
    nutrientId: 'riboflavin',
    unit: 'mg',
    primaryReference: 'RDA',
    rda: {
      male: { '19-30': 1.3, '31-50': 1.3, '51-70': 1.3, '70+': 1.3 },
      female: { '19-30': 1.1, '31-50': 1.1, '51-70': 1.1, '70+': 1.1 },
    },
    // No established UL
  },

  niacin: {
    nutrientId: 'niacin',
    unit: 'mg',
    primaryReference: 'RDA',
    rda: {
      male: { '19-30': 16, '31-50': 16, '51-70': 16, '70+': 16 },
      female: { '19-30': 14, '31-50': 14, '51-70': 14, '70+': 14 },
    },
    ul: {
      // UL is for supplemental niacin (nicotinic acid)
      both: { '19-30': 35, '31-50': 35, '51-70': 35, '70+': 35 },
    },
  },

  vitaminB6: {
    nutrientId: 'vitaminB6',
    unit: 'mg',
    primaryReference: 'RDA',
    rda: {
      male: { '19-30': 1.3, '31-50': 1.3, '51-70': 1.7, '70+': 1.7 },
      female: { '19-30': 1.3, '31-50': 1.3, '51-70': 1.5, '70+': 1.5 },
    },
    ul: {
      both: { '19-30': 100, '31-50': 100, '51-70': 100, '70+': 100 },
    },
  },

  folate: {
    nutrientId: 'folate',
    unit: 'mcg',
    primaryReference: 'RDA',
    rda: {
      male: { '19-30': 400, '31-50': 400, '51-70': 400, '70+': 400 },
      female: { '19-30': 400, '31-50': 400, '51-70': 400, '70+': 400 },
    },
    ul: {
      // UL is for synthetic folic acid
      both: { '19-30': 1000, '31-50': 1000, '51-70': 1000, '70+': 1000 },
    },
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 600, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 500, target: 'base' } },
    ],
  },

  vitaminB12: {
    nutrientId: 'vitaminB12',
    unit: 'mcg',
    primaryReference: 'RDA',
    rda: {
      male: { '19-30': 2.4, '31-50': 2.4, '51-70': 2.4, '70+': 2.4 },
      female: { '19-30': 2.4, '31-50': 2.4, '51-70': 2.4, '70+': 2.4 },
    },
    // No established UL
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 2.6, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 2.8, target: 'base' } },
    ],
  },

  choline: {
    nutrientId: 'choline',
    unit: 'mg',
    primaryReference: 'AI',
    ai: {
      male: { '19-30': 550, '31-50': 550, '51-70': 550, '70+': 550 },
      female: { '19-30': 425, '31-50': 425, '51-70': 425, '70+': 425 },
    },
    ul: {
      both: { '19-30': 3500, '31-50': 3500, '51-70': 3500, '70+': 3500 },
    },
    specialAdjustments: [
      { condition: 'pregnant', adjustment: { type: 'replace', value: 450, target: 'base' } },
      { condition: 'lactating', adjustment: { type: 'replace', value: 550, target: 'base' } },
    ],
  },
};

/**
 * Get DRI definition for a nutrient
 */
export function getDriDefinition(nutrientId: string): NutrientDriDefinition | undefined {
  return NUTRIENT_DRI_TABLE[nutrientId];
}

/**
 * Get all nutrient IDs that have DRI definitions
 */
export function getAllDriNutrientIds(): string[] {
  return Object.keys(NUTRIENT_DRI_TABLE);
}
```

**Verification**:
```bash
# 1. Build functions
cd functions && pnpm run build

# 2. Verify key nutrients have correct values (manual spot check)
# Protein male 19-30: 56g ✓
# Iron female 19-30: 18mg ✓
# Sodium UL: 2300mg ✓
# Vitamin D 70+: 20mcg ✓

# 3. Count nutrients with DRI definitions (should be 25+)
grep -c "nutrientId:" functions/src/domains/nutrition/dri/driTable.ts

# 4. Verify special adjustments exist
grep -c "specialAdjustments" functions/src/domains/nutrition/dri/driTable.ts
```

**Definition of Done**:
- [ ] 25+ nutrients have DRI definitions
- [ ] All values match NIH/USDA sources (spot check 5 nutrients)
- [ ] Special adjustments for pregnancy, lactation, athletes, hypertension
- [ ] `pnpm run build` in functions passes
- [ ] Data source comments included

---

### Step 2.3: Create Classification Thresholds Config
**File**: `functions/src/domains/nutrition/dri/thresholds.ts`

**What to Create**:
```typescript
/**
 * Classification thresholds for nutrient evaluation.
 * These determine what % of DV/UL triggers each classification level.
 *
 * Design rationale:
 * - 20%+ of DV in a single food = significant source (FDA "good source" is 10-19%)
 * - 10-20% = moderate contribution
 * - <10% = low contribution
 *
 * For risk nutrients, same logic applies to Upper Limit.
 */
export const CLASSIFICATION_THRESHOLDS = {
  /** % of daily target above which a beneficial nutrient is "high" */
  BENEFICIAL_HIGH: 20,

  /** % of daily target above which a beneficial nutrient is "moderate" */
  BENEFICIAL_MODERATE: 10,

  /** % of upper limit above which a risk nutrient is "high" (warning) */
  RISK_HIGH: 20,

  /** % of upper limit above which a risk nutrient is "moderate" */
  RISK_MODERATE: 10,
} as const;

/**
 * Number of top beneficial/risk nutrients to highlight in results
 */
export const HIGHLIGHT_COUNT = {
  BENEFICIAL: 3,
  CONCERNS: 3,
} as const;

/**
 * Calorie estimation constants (Mifflin-St Jeor equation)
 */
export const CALORIE_CONSTANTS = {
  MALE_OFFSET: 5,
  FEMALE_OFFSET: -161,
  WEIGHT_MULTIPLIER: 10,
  HEIGHT_MULTIPLIER: 6.25,
  AGE_MULTIPLIER: 5,
} as const;

/**
 * Activity level multipliers for TDEE calculation
 */
export const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
  athlete: 1.9,
} as const;

/**
 * Goal adjustments for calorie target
 */
export const GOAL_ADJUSTMENTS: Record<string, number> = {
  weight_loss: -300,
  maintenance: 0,
  muscle_gain: 200,
  performance: 300,
} as const;

/**
 * Default values when user profile is incomplete
 */
export const PROFILE_DEFAULTS = {
  AGE_YEARS: 30,
  WEIGHT_KG: 70,
  HEIGHT_CM: 170,
  ACTIVITY_LEVEL: 'moderate' as const,
  GOAL: 'maintenance' as const,
  CALORIE_MALE: 2500,
  CALORIE_FEMALE: 2000,
} as const;
```

**Verification**:
```bash
# 1. Build functions
cd functions && pnpm run build

# 2. Verify all constants are exported
grep "export const" functions/src/domains/nutrition/dri/thresholds.ts

# 3. Verify thresholds are reasonable (manual check)
# FDA "good source" = 10-19% DV
# FDA "excellent source" = 20%+ DV
# Our thresholds align with these
```

**Definition of Done**:
- [ ] All thresholds are configurable constants (not magic numbers)
- [ ] Comments explain rationale for each threshold
- [ ] Activity multipliers cover all `ActivityLevel` values
- [ ] `pnpm run build` passes

---

## Phase 3: Core Calculation Functions

### Step 3.1: Implement Age Range Utility
**File**: `functions/src/domains/nutrition/dri/driLogic.ts`

**What to Create**:
```typescript
import type { AgeRange, DriUserProfile, DailyNutrientTarget, Sex } from '@nvivo/shared';
import { NUTRIENT_DRI_TABLE, getDriDefinition } from './driTable';
import {
  CALORIE_CONSTANTS,
  ACTIVITY_MULTIPLIERS,
  GOAL_ADJUSTMENTS,
  PROFILE_DEFAULTS,
} from './thresholds';

/**
 * Convert a numeric age to the appropriate DRI age range.
 *
 * @param ageYears - User's age in years
 * @returns Age range string for DRI lookup
 * @throws Error if age < 19 (pediatric DRI not implemented)
 */
export function getAgeRange(ageYears: number): AgeRange {
  if (ageYears < 19) {
    throw new Error('DRI calculations for ages < 19 not yet implemented');
  }
  if (ageYears <= 30) return '19-30';
  if (ageYears <= 50) return '31-50';
  if (ageYears <= 70) return '51-70';
  return '70+';
}
```

**Verification**:
```bash
# Test will be created in Phase 8
# For now, verify build passes
cd functions && pnpm run build
```

---

### Step 3.2: Implement Calorie Target Calculator
**File**: `functions/src/domains/nutrition/dri/driLogic.ts` (append)

**What to Create**:
```typescript
/**
 * Estimate daily calorie target using Mifflin-St Jeor equation.
 *
 * Formula:
 * - Male: BMR = 10*weight + 6.25*height - 5*age + 5
 * - Female: BMR = 10*weight + 6.25*height - 5*age - 161
 * - TDEE = BMR * activity_multiplier
 * - Target = TDEE + goal_adjustment
 *
 * @param user - User profile with optional weight/height/activity/goal
 * @returns Estimated daily calorie target
 */
export function estimateCalorieTarget(user: DriUserProfile): number {
  const {
    ageYears,
    sex,
    weightKg,
    heightCm,
    activityLevel = PROFILE_DEFAULTS.ACTIVITY_LEVEL,
    goal = PROFILE_DEFAULTS.GOAL,
  } = user;

  // If weight/height not provided, use simple defaults
  if (!weightKg || !heightCm) {
    return sex === 'male' ? PROFILE_DEFAULTS.CALORIE_MALE : PROFILE_DEFAULTS.CALORIE_FEMALE;
  }

  // Mifflin-St Jeor BMR calculation
  const {
    WEIGHT_MULTIPLIER,
    HEIGHT_MULTIPLIER,
    AGE_MULTIPLIER,
    MALE_OFFSET,
    FEMALE_OFFSET,
  } = CALORIE_CONSTANTS;

  const bmr =
    WEIGHT_MULTIPLIER * weightKg +
    HEIGHT_MULTIPLIER * heightCm -
    AGE_MULTIPLIER * ageYears +
    (sex === 'male' ? MALE_OFFSET : FEMALE_OFFSET);

  // Apply activity multiplier for TDEE
  const activityMultiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55;
  const tdee = bmr * activityMultiplier;

  // Apply goal adjustment
  const goalAdjustment = GOAL_ADJUSTMENTS[goal] ?? 0;

  return Math.round(tdee + goalAdjustment);
}
```

**Verification**:
```bash
# Build check
cd functions && pnpm run build

# Manual verification (calculate expected values):
# 30yo male, 70kg, 175cm, moderate activity, maintenance:
# BMR = 10*70 + 6.25*175 - 5*30 + 5 = 700 + 1093.75 - 150 + 5 = 1648.75
# TDEE = 1648.75 * 1.55 = 2555.56
# Expected: ~2556 kcal
```

---

### Step 3.3: Implement Single Nutrient Target Calculator
**File**: `functions/src/domains/nutrition/dri/driLogic.ts` (append)

**What to Create**:
```typescript
/**
 * Compute the daily target for a specific nutrient based on user profile.
 *
 * Logic:
 * 1. Look up nutrient DRI definition
 * 2. Get base value from RDA or AI (by sex and age range)
 * 3. Apply special adjustments for health conditions
 * 4. Compute AMDR min/max if applicable (requires calorie target)
 * 5. Get Upper Limit if defined
 *
 * @param nutrientId - ID of nutrient to get target for
 * @param user - User profile
 * @param calorieTarget - Pre-computed calorie target (optional, will compute if needed)
 * @returns Daily target or null if no DRI data available
 */
export function getUserDailyTarget(
  nutrientId: string,
  user: DriUserProfile,
  calorieTarget?: number
): DailyNutrientTarget | null {
  const def = getDriDefinition(nutrientId);
  if (!def) return null;

  const ageRange = getAgeRange(user.ageYears);
  const sex = user.sex;
  const calories = calorieTarget ?? estimateCalorieTarget(user);

  const target: DailyNutrientTarget = {
    nutrientId,
    unit: def.unit,
    referenceType: def.primaryReference ?? 'RDA',
    source: '',
  };

  // 1. Get base value from RDA or AI
  let base: number | undefined;

  if (def.rda?.[sex]?.[ageRange] !== undefined) {
    base = def.rda[sex][ageRange];
    target.referenceType = 'RDA';
    target.source = `RDA ${sex} ${ageRange}`;
  } else if (def.ai?.[sex]?.[ageRange] !== undefined) {
    base = def.ai[sex][ageRange];
    target.referenceType = 'AI';
    target.source = `AI ${sex} ${ageRange}`;
  }

  // 2. Apply special adjustments
  if (def.specialAdjustments && base !== undefined) {
    for (const adj of def.specialAdjustments) {
      if (shouldApplyAdjustment(adj.condition, user)) {
        if (adj.adjustment.target === 'base') {
          base = applyAdjustment(base, adj.adjustment);
          target.source += ` (adjusted for ${adj.condition})`;
        }
      }
    }
  }

  if (base !== undefined) {
    target.base = base;
  }

  // 3. Compute AMDR min/max if applicable
  if (def.amdr) {
    const kcalPerGram = nutrientId === 'fat' || nutrientId.includes('Fat') ? 9 : 4;
    target.min = Math.round((calories * def.amdr.minPctKcal) / 100 / kcalPerGram);
    target.max = Math.round((calories * def.amdr.maxPctKcal) / 100 / kcalPerGram);
    target.referenceType = 'AMDR';
    target.source += target.source ? ' + AMDR' : `AMDR ${def.amdr.minPctKcal}-${def.amdr.maxPctKcal}%`;

    // If no base from RDA/AI, use AMDR midpoint
    if (target.base === undefined) {
      target.base = Math.round((target.min + target.max) / 2);
    }
  }

  // 4. Get Upper Limit
  let ul: number | undefined;
  if (def.ul) {
    ul =
      def.ul[sex]?.[ageRange] ??
      def.ul.both?.[ageRange];
  }

  // Apply UL adjustments
  if (ul !== undefined && def.specialAdjustments) {
    for (const adj of def.specialAdjustments) {
      if (shouldApplyAdjustment(adj.condition, user) && adj.adjustment.target === 'upperLimit') {
        ul = applyAdjustment(ul, adj.adjustment);
        target.source += ` (UL adjusted for ${adj.condition})`;
      }
    }
    target.upperLimit = ul;
  } else if (ul !== undefined) {
    target.upperLimit = ul;
  }

  return target;
}

/**
 * Check if a special adjustment condition applies to the user
 */
function shouldApplyAdjustment(
  condition: string,
  user: DriUserProfile
): boolean {
  switch (condition) {
    case 'pregnant':
      return user.lifeStage === 'pregnant';
    case 'lactating':
      return user.lifeStage === 'lactating';
    case 'athlete':
      return user.activityLevel === 'athlete';
    case 'hypertension':
      return user.health?.hypertension === true;
    case 'ckd':
      return user.health?.ckd === true;
    case 'diabetes':
      return user.health?.diabetes === true;
    case 'heartDisease':
      return user.health?.heartDisease === true;
    default:
      return false;
  }
}

/**
 * Apply an adjustment to a base value
 */
function applyAdjustment(
  value: number,
  adjustment: { type: 'absolute' | 'multiplier' | 'replace'; value: number }
): number {
  switch (adjustment.type) {
    case 'absolute':
      return value + adjustment.value;
    case 'multiplier':
      return Math.round(value * adjustment.value);
    case 'replace':
      return adjustment.value;
    default:
      return value;
  }
}
```

**Verification**:
```bash
# Build check
cd functions && pnpm run build

# Manual verification:
# Protein for 27yo male: base = 56g
# Protein for pregnant female: base = 46 + 25 = 71g
# Sodium UL for hypertensive: 1500mg (not 2300mg)
```

---

### Step 3.4: Implement Batch Target Calculator
**File**: `functions/src/domains/nutrition/dri/driLogic.ts` (append)

**What to Create**:
```typescript
/**
 * Compute daily targets for all tracked nutrients.
 *
 * @param user - User profile
 * @param nutrientIds - Optional list of nutrient IDs to compute (defaults to all)
 * @returns Map of nutrient ID to daily target
 */
export function getAllDailyTargets(
  user: DriUserProfile,
  nutrientIds?: string[]
): Map<string, DailyNutrientTarget> {
  const ids = nutrientIds ?? Object.keys(NUTRIENT_DRI_TABLE);
  const calorieTarget = estimateCalorieTarget(user);
  const targets = new Map<string, DailyNutrientTarget>();

  for (const id of ids) {
    const target = getUserDailyTarget(id, user, calorieTarget);
    if (target) {
      targets.set(id, target);
    }
  }

  return targets;
}

/**
 * Get daily targets as a plain object (for JSON serialization)
 */
export function getDailyTargetsAsObject(
  user: DriUserProfile,
  nutrientIds?: string[]
): Record<string, DailyNutrientTarget> {
  const targets = getAllDailyTargets(user, nutrientIds);
  return Object.fromEntries(targets);
}
```

**Verification**:
```bash
# Build check
cd functions && pnpm run build

# Verify exports
grep "export function" functions/src/domains/nutrition/dri/driLogic.ts
# Should show: getAgeRange, estimateCalorieTarget, getUserDailyTarget, getAllDailyTargets, getDailyTargetsAsObject
```

**Definition of Done for Phase 3**:
- [ ] `getAgeRange()` returns correct ranges for all age inputs
- [ ] `estimateCalorieTarget()` uses Mifflin-St Jeor formula correctly
- [ ] `getUserDailyTarget()` handles RDA, AI, UL, and AMDR
- [ ] Special adjustments work for pregnancy, athletes, hypertension
- [ ] `getAllDailyTargets()` returns targets for all nutrients
- [ ] `pnpm run build` passes
- [ ] All functions are pure (no side effects)

---

## Phase 4: Classification System

### Step 4.1: Implement Percent Calculators
**File**: `functions/src/domains/nutrition/dri/classification.ts`

**What to Create**:
```typescript
import type {
  NutrientEvaluation,
  NutrientClassification,
  DailyNutrientTarget,
  DriUserProfile,
  FoodEvaluationResult,
  AgeRange,
} from '@nvivo/shared';
import { CLASSIFICATION_THRESHOLDS, HIGHLIGHT_COUNT } from './thresholds';
import { getNutrientNature } from './nutrientNature';
import { getUserDailyTarget, estimateCalorieTarget, getAgeRange } from './driLogic';
import { NUTRIENT_METADATA } from '@nvivo/shared'; // Reuse existing metadata for names

/**
 * Calculate what percentage of the daily target a food provides.
 *
 * @param amount - Amount of nutrient in food
 * @param target - Daily target for this nutrient
 * @returns Percentage (0-100+) or undefined if no base target
 */
export function computePercentOfTarget(
  amount: number,
  target: DailyNutrientTarget
): number | undefined {
  if (!target.base || target.base <= 0) return undefined;
  return (amount / target.base) * 100;
}

/**
 * Calculate what percentage of the Upper Limit a food provides.
 *
 * @param amount - Amount of nutrient in food
 * @param target - Daily target for this nutrient
 * @returns Percentage (0-100+) or undefined if no UL
 */
export function computePercentOfUpperLimit(
  amount: number,
  target: DailyNutrientTarget
): number | undefined {
  if (!target.upperLimit || target.upperLimit <= 0) return undefined;
  return (amount / target.upperLimit) * 100;
}
```

---

### Step 4.2: Implement Classification Logic
**File**: `functions/src/domains/nutrition/dri/classification.ts` (append)

**What to Create**:
```typescript
/**
 * Classify a nutrient based on its nature and percentage of target/UL.
 *
 * For BENEFICIAL nutrients (protein, fiber, vitamins):
 * - >20% of target = beneficial_high (green)
 * - 10-20% = beneficial_moderate (light green)
 * - <10% = beneficial_low (gray)
 *
 * For RISK nutrients (sodium, sat fat, trans fat):
 * - >20% of UL = risk_high (red)
 * - 10-20% = risk_moderate (orange)
 * - <10% = risk_low (yellow)
 *
 * For NEUTRAL nutrients (calories, total fat, carbs):
 * - Return 'neutral' (no good/bad judgment)
 */
export function classifyNutrient(
  nature: 'beneficial' | 'risk' | 'neutral',
  percentOfTarget: number | undefined,
  percentOfUpperLimit: number | undefined
): NutrientClassification {
  const { BENEFICIAL_HIGH, BENEFICIAL_MODERATE, RISK_HIGH, RISK_MODERATE } = CLASSIFICATION_THRESHOLDS;

  if (nature === 'beneficial') {
    if (percentOfTarget === undefined) return 'not_applicable';
    if (percentOfTarget >= BENEFICIAL_HIGH) return 'beneficial_high';
    if (percentOfTarget >= BENEFICIAL_MODERATE) return 'beneficial_moderate';
    return 'beneficial_low';
  }

  if (nature === 'risk') {
    // Prefer UL for risk nutrients
    const pct = percentOfUpperLimit ?? percentOfTarget;
    if (pct === undefined) return 'not_applicable';
    if (pct >= RISK_HIGH) return 'risk_high';
    if (pct >= RISK_MODERATE) return 'risk_moderate';
    return 'risk_low';
  }

  return 'neutral';
}
```

---

### Step 4.3: Implement Single Nutrient Evaluator
**File**: `functions/src/domains/nutrition/dri/classification.ts` (append)

**What to Create**:
```typescript
/**
 * Evaluate a single nutrient from a food against a user's DRI.
 *
 * @param nutrientId - ID of nutrient to evaluate
 * @param amountInFood - Amount in the food (may be null/undefined)
 * @param user - User profile for personalized targets
 * @param calorieTarget - Pre-computed calorie target (optional)
 * @returns Complete evaluation with classification
 */
export function evaluateNutrient(
  nutrientId: string,
  amountInFood: number | null | undefined,
  user: DriUserProfile,
  calorieTarget?: number
): NutrientEvaluation {
  const nature = getNutrientNature(nutrientId);
  const target = getUserDailyTarget(nutrientId, user, calorieTarget);

  // Get nutrient display name from existing metadata
  const meta = NUTRIENT_METADATA.find(m => m.key === nutrientId);
  const nutrientName = meta?.label ?? nutrientId;
  const unit = target?.unit ?? meta?.unit ?? 'g';

  // Handle missing food data
  if (amountInFood === null || amountInFood === undefined) {
    return {
      nutrientId,
      nutrientName,
      amountInFood: null,
      unit: unit as 'kcal' | 'g' | 'mg' | 'mcg',
      target,
      classification: 'insufficient_data',
      nature,
    };
  }

  // Handle missing DRI data
  if (!target) {
    return {
      nutrientId,
      nutrientName,
      amountInFood,
      unit: unit as 'kcal' | 'g' | 'mg' | 'mcg',
      target: null,
      classification: 'not_applicable',
      nature,
    };
  }

  const percentOfTarget = computePercentOfTarget(amountInFood, target);
  const percentOfUpperLimit = computePercentOfUpperLimit(amountInFood, target);
  const classification = classifyNutrient(nature, percentOfTarget, percentOfUpperLimit);

  return {
    nutrientId,
    nutrientName,
    amountInFood,
    unit: target.unit,
    target,
    percentOfTarget: percentOfTarget ? Math.round(percentOfTarget * 10) / 10 : undefined,
    percentOfUpperLimit: percentOfUpperLimit ? Math.round(percentOfUpperLimit * 10) / 10 : undefined,
    classification,
    nature,
  };
}
```

---

### Step 4.4: Implement Batch Evaluator
**File**: `functions/src/domains/nutrition/dri/classification.ts` (append)

**What to Create**:
```typescript
/**
 * Food nutrient profile - maps nutrient IDs to amounts.
 * This is the input format for evaluation.
 */
export interface FoodNutrientProfile {
  [nutrientId: string]: number | null | undefined;
}

/**
 * Evaluate all nutrients in a food against a user's DRI.
 *
 * @param food - Nutrient profile of the food
 * @param user - User profile
 * @param nutrientIds - Optional list to evaluate (defaults to all in food)
 * @returns Complete evaluation result with highlights
 */
export function evaluateFood(
  food: FoodNutrientProfile,
  user: DriUserProfile,
  nutrientIds?: string[]
): FoodEvaluationResult {
  const calorieTarget = estimateCalorieTarget(user);
  const ageRange = getAgeRange(user.ageYears);

  // Determine which nutrients to evaluate
  const idsToEvaluate = nutrientIds ?? Object.keys(food);

  // Evaluate each nutrient
  const evaluations: NutrientEvaluation[] = idsToEvaluate.map(id =>
    evaluateNutrient(id, food[id], user, calorieTarget)
  );

  // Find highlights
  const beneficial = evaluations
    .filter(e => e.classification === 'beneficial_high' || e.classification === 'beneficial_moderate')
    .sort((a, b) => (b.percentOfTarget ?? 0) - (a.percentOfTarget ?? 0))
    .slice(0, HIGHLIGHT_COUNT.BENEFICIAL);

  const concerns = evaluations
    .filter(e => e.classification === 'risk_high' || e.classification === 'risk_moderate')
    .sort((a, b) => (b.percentOfUpperLimit ?? b.percentOfTarget ?? 0) - (a.percentOfUpperLimit ?? a.percentOfTarget ?? 0))
    .slice(0, HIGHLIGHT_COUNT.CONCERNS);

  return {
    evaluations,
    highlights: { beneficial, concerns },
    userProfile: {
      ageRange,
      sex: user.sex,
      calorieTarget,
    },
  };
}

/**
 * Evaluate multiple foods (e.g., a meal) combined.
 * Sums the nutrient amounts before evaluation.
 */
export function evaluateMeal(
  foods: FoodNutrientProfile[],
  user: DriUserProfile,
  nutrientIds?: string[]
): FoodEvaluationResult {
  // Combine all foods into a single profile
  const combined: FoodNutrientProfile = {};

  for (const food of foods) {
    for (const [id, amount] of Object.entries(food)) {
      if (amount !== null && amount !== undefined) {
        combined[id] = (combined[id] ?? 0) + amount;
      }
    }
  }

  return evaluateFood(combined, user, nutrientIds);
}
```

**Verification**:
```bash
# Build check
cd functions && pnpm run build

# Verify all exports
grep "export function\|export interface" functions/src/domains/nutrition/dri/classification.ts
# Should show: computePercentOfTarget, computePercentOfUpperLimit, classifyNutrient,
#              evaluateNutrient, evaluateFood, evaluateMeal, FoodNutrientProfile
```

**Definition of Done for Phase 4**:
- [ ] `classifyNutrient()` returns correct classification for all nature/percent combos
- [ ] `evaluateNutrient()` handles missing data gracefully
- [ ] `evaluateFood()` returns highlights sorted by significance
- [ ] `evaluateMeal()` correctly sums nutrients from multiple foods
- [ ] `pnpm run build` passes
- [ ] All classification functions are deterministic

---

## Phase 5: User Profile Integration

### Step 5.1: Create Firestore Profile Adapter
**File**: `functions/src/domains/nutrition/dri/userProfile.ts`

**What to Create**:
```typescript
import { getFirestore } from 'firebase-admin/firestore';
import type { DriUserProfile, Sex, ActivityLevel, LifeStage, HealthFlags } from '@nvivo/shared';
import { PROFILE_DEFAULTS } from './thresholds';

/**
 * Fetch user profile from Firestore and convert to DRI format.
 *
 * @param uid - Firebase user ID
 * @returns DRI user profile or null if not found
 */
export async function getUserProfileFromFirestore(uid: string): Promise<DriUserProfile | null> {
  const db = getFirestore();
  const patientDoc = await db.collection('patients').doc(uid).get();

  if (!patientDoc.exists) {
    return null;
  }

  const data = patientDoc.data();
  if (!data) return null;

  return convertFirestoreToProfile(data);
}

/**
 * Convert Firestore patient document to DRI profile.
 * Handles field name differences and data transformations.
 */
export function convertFirestoreToProfile(data: Record<string, unknown>): DriUserProfile {
  // Calculate age from date of birth
  let ageYears = PROFILE_DEFAULTS.AGE_YEARS;
  if (data.dateOfBirth) {
    const dob = new Date(data.dateOfBirth as string);
    const today = new Date();
    ageYears = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      ageYears--;
    }
  }

  // Map gender to sex
  const sex: Sex = (data.gender as string)?.toLowerCase() === 'female' ? 'female' : 'male';

  // Convert weight (might be in lbs)
  let weightKg = data.weightKg as number | undefined;
  if (!weightKg && data.weightLbs) {
    weightKg = (data.weightLbs as number) * 0.453592;
  }

  // Convert height (might be in inches)
  let heightCm = data.heightCm as number | undefined;
  if (!heightCm && data.heightInches) {
    heightCm = (data.heightInches as number) * 2.54;
  }

  // Map health conditions
  const health: HealthFlags = {};
  const conditions = data.healthConditions as string[] | undefined;
  if (conditions) {
    health.hypertension = conditions.includes('hypertension') || conditions.includes('high blood pressure');
    health.diabetes = conditions.includes('diabetes') || conditions.includes('type 2 diabetes');
    health.ckd = conditions.includes('ckd') || conditions.includes('kidney disease');
    health.heartDisease = conditions.includes('heart disease') || conditions.includes('cardiovascular');
  }

  // Map activity level
  const activityMap: Record<string, ActivityLevel> = {
    'sedentary': 'sedentary',
    'lightly active': 'light',
    'light': 'light',
    'moderately active': 'moderate',
    'moderate': 'moderate',
    'very active': 'high',
    'high': 'high',
    'extremely active': 'athlete',
    'athlete': 'athlete',
  };
  const activityLevel = activityMap[(data.activityLevel as string)?.toLowerCase()] ?? 'moderate';

  // Map life stage
  let lifeStage: LifeStage | undefined;
  if (data.isPregnant) lifeStage = 'pregnant';
  else if (data.isLactating) lifeStage = 'lactating';

  return {
    ageYears,
    sex,
    weightKg,
    heightCm,
    activityLevel,
    lifeStage,
    health: Object.keys(health).length > 0 ? health : undefined,
    goal: data.nutritionGoal as DriUserProfile['goal'],
  };
}

/**
 * Fill in default values for missing profile fields.
 */
export function fillProfileDefaults(partial: Partial<DriUserProfile>): DriUserProfile {
  return {
    ageYears: partial.ageYears ?? PROFILE_DEFAULTS.AGE_YEARS,
    sex: partial.sex ?? 'male',
    weightKg: partial.weightKg ?? PROFILE_DEFAULTS.WEIGHT_KG,
    heightCm: partial.heightCm ?? PROFILE_DEFAULTS.HEIGHT_CM,
    activityLevel: partial.activityLevel ?? PROFILE_DEFAULTS.ACTIVITY_LEVEL,
    goal: partial.goal ?? PROFILE_DEFAULTS.GOAL,
    lifeStage: partial.lifeStage,
    health: partial.health,
  };
}
```

**Verification**:
```bash
# Build check
cd functions && pnpm run build

# Verify Firestore import
grep "firebase-admin/firestore" functions/src/domains/nutrition/dri/userProfile.ts
```

**Definition of Done for Phase 5**:
- [ ] `getUserProfileFromFirestore()` queries correct collection
- [ ] `convertFirestoreToProfile()` handles all field mappings
- [ ] Age calculation is correct
- [ ] Unit conversions (lbs→kg, inches→cm) work
- [ ] Health conditions map correctly
- [ ] `fillProfileDefaults()` provides sensible defaults

---

## Phase 6: Cloud Function API

### Step 6.1: Create Barrel Export
**File**: `functions/src/domains/nutrition/dri/index.ts`

**What to Create**:
```typescript
// Types (re-export from shared)
export type {
  DriUserProfile,
  DailyNutrientTarget,
  NutrientEvaluation,
  NutrientClassification,
  FoodEvaluationResult,
} from '@nvivo/shared';

// Data
export { NUTRIENT_DRI_TABLE, getDriDefinition, getAllDriNutrientIds } from './driTable';
export { NUTRIENT_NATURE, getNutrientNature } from './nutrientNature';
export { CLASSIFICATION_THRESHOLDS, PROFILE_DEFAULTS } from './thresholds';

// Logic
export {
  getAgeRange,
  estimateCalorieTarget,
  getUserDailyTarget,
  getAllDailyTargets,
  getDailyTargetsAsObject,
} from './driLogic';

// Classification
export {
  computePercentOfTarget,
  computePercentOfUpperLimit,
  classifyNutrient,
  evaluateNutrient,
  evaluateFood,
  evaluateMeal,
} from './classification';
export type { FoodNutrientProfile } from './classification';

// User Profile
export {
  getUserProfileFromFirestore,
  convertFirestoreToProfile,
  fillProfileDefaults,
} from './userProfile';
```

---

### Step 6.2: Create Cloud Functions
**File**: `functions/src/index.ts` (add to existing)

**What to Add**:
```typescript
import {
  evaluateFood,
  evaluateMeal,
  getDailyTargetsAsObject,
  getUserProfileFromFirestore,
  fillProfileDefaults,
  FoodNutrientProfile,
} from './domains/nutrition/dri';

// ═══════════════════════════════════════════════════════════════════════════
// NUTRITION DRI EVALUATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Evaluate a food item against user's personalized DRI targets.
 *
 * Input: { food: FoodNutrientProfile, nutrientIds?: string[] }
 * Output: { ok: true, results: FoodEvaluationResult }
 */
export const evaluateNutrition = https.onCall(
  { cors: true },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new https.HttpsError('unauthenticated', 'Must be logged in');
    }

    const { food, nutrientIds } = request.data ?? {};
    if (!food || typeof food !== 'object') {
      throw new https.HttpsError('invalid-argument', 'food is required');
    }

    try {
      // Get user profile from Firestore
      let profile = await getUserProfileFromFirestore(uid);
      if (!profile) {
        profile = fillProfileDefaults({});
      }

      // Evaluate the food
      const result = evaluateFood(food as FoodNutrientProfile, profile, nutrientIds);

      return { ok: true, result };
    } catch (error) {
      console.error('evaluateNutrition error:', error);
      throw new https.HttpsError('internal', 'Failed to evaluate nutrition');
    }
  }
);

/**
 * Evaluate multiple foods (a meal) against user's DRI targets.
 *
 * Input: { foods: FoodNutrientProfile[], nutrientIds?: string[] }
 * Output: { ok: true, results: FoodEvaluationResult }
 */
export const evaluateMealNutrition = https.onCall(
  { cors: true },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new https.HttpsError('unauthenticated', 'Must be logged in');
    }

    const { foods, nutrientIds } = request.data ?? {};
    if (!Array.isArray(foods) || foods.length === 0) {
      throw new https.HttpsError('invalid-argument', 'foods array is required');
    }

    try {
      let profile = await getUserProfileFromFirestore(uid);
      if (!profile) {
        profile = fillProfileDefaults({});
      }

      const result = evaluateMeal(foods as FoodNutrientProfile[], profile, nutrientIds);

      return { ok: true, result };
    } catch (error) {
      console.error('evaluateMealNutrition error:', error);
      throw new https.HttpsError('internal', 'Failed to evaluate meal nutrition');
    }
  }
);

/**
 * Get user's personalized daily nutrition targets.
 *
 * Input: { nutrientIds?: string[] }
 * Output: { ok: true, targets: Record<string, DailyNutrientTarget>, calorieTarget: number }
 */
export const getUserNutritionTargets = https.onCall(
  { cors: true },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new https.HttpsError('unauthenticated', 'Must be logged in');
    }

    const { nutrientIds } = request.data ?? {};

    try {
      let profile = await getUserProfileFromFirestore(uid);
      if (!profile) {
        profile = fillProfileDefaults({});
      }

      const targets = getDailyTargetsAsObject(profile, nutrientIds);
      const { estimateCalorieTarget } = await import('./domains/nutrition/dri');
      const calorieTarget = estimateCalorieTarget(profile);

      return {
        ok: true,
        targets,
        calorieTarget,
        profile: {
          ageYears: profile.ageYears,
          sex: profile.sex,
          activityLevel: profile.activityLevel,
        },
      };
    } catch (error) {
      console.error('getUserNutritionTargets error:', error);
      throw new https.HttpsError('internal', 'Failed to get nutrition targets');
    }
  }
);
```

**Verification**:
```bash
# Build functions
cd functions && pnpm run build

# Verify new functions are exported
grep "export const evaluate\|export const getUser" functions/src/index.ts

# Deploy to emulator and test
firebase emulators:start --only functions

# Test with curl (example)
curl -X POST http://127.0.0.1:5001/nvivo-988/us-central1/evaluateNutrition \
  -H "Content-Type: application/json" \
  -d '{"data":{"food":{"protein":25,"sodium":500,"fiber":3}}}'
# Note: Will fail without auth - that's expected
```

**Definition of Done for Phase 6**:
- [ ] All three Cloud Functions exported
- [ ] Functions handle unauthenticated requests correctly
- [ ] Functions handle missing user profile gracefully
- [ ] `pnpm run build` passes
- [ ] Functions appear in emulator UI

---

## Phases 7-10: Testing

Due to length, these phases are summarized. Full test file contents will be created during implementation.

### Phase 7: Test Infrastructure Setup
- [ ] Add Jest to functions/package.json
- [ ] Create jest.config.js
- [ ] Create test fixtures (users.ts, foods.ts)
- [ ] Verify `pnpm test` runs (even with no tests)

### Phase 8: Unit Tests - Core Logic
- [ ] Test `getAgeRange()` - all age brackets
- [ ] Test `estimateCalorieTarget()` - various profiles
- [ ] Test `getUserDailyTarget()` - RDA/AI/UL/AMDR cases
- [ ] Test special adjustments (pregnancy, hypertension)
- [ ] All tests pass with `pnpm test`

### Phase 9: Unit Tests - Classification
- [ ] Test beneficial nutrients (high/moderate/low)
- [ ] Test risk nutrients (high/moderate/low)
- [ ] Test edge cases (missing data, no DRI)
- [ ] All tests pass

### Phase 10: Integration Tests
- [ ] Test `evaluateFood()` end-to-end
- [ ] Test highlight extraction
- [ ] Test Cloud Functions with emulator

---

## Phases 11-15: Integration & Frontend

### Phase 11: Shared Package Exports
- [ ] Export all types from packages/shared
- [ ] Verify imports work in apps

### Phase 12: Documentation
- [ ] API reference in docs/api/
- [ ] JSDoc comments on all public functions

### Phase 13: Frontend Hooks
- [ ] `useNutrientEvaluation()` hook
- [ ] `useUserNutritionTargets()` hook

### Phase 14: Frontend UI
- [ ] Nutrient classification badges
- [ ] Update NutritionSummary.tsx

### Phase 15: Final Integration
- [ ] Connect to food analysis flow
- [ ] Deploy to production
- [ ] Verify end-to-end

---

## Appendix: Manual Verification Commands

### After Each Phase

```bash
# 1. Type check entire monorepo
pnpm run type-check

# 2. Build functions
cd functions && pnpm run build

# 3. Build shared package
pnpm --filter @nvivo/shared build

# 4. Run tests (after Phase 7)
cd functions && pnpm test

# 5. Start emulator and verify
firebase emulators:start

# 6. Check for any 'any' types
grep -rn ": any" functions/src/domains/nutrition/dri/
# Should return nothing

# 7. Count exported functions
grep -c "export function" functions/src/domains/nutrition/dri/*.ts
```

### Verification Checklist Template

After completing each step, you can verify:

```
□ File exists at correct path
□ No TypeScript errors (pnpm run type-check)
□ No 'any' types
□ Functions are pure (no side effects in logic files)
□ Tests pass (after Phase 7)
□ Exports are documented with JSDoc
```

---

## Success Criteria

1. **Type Safety**: Zero `any` types, strict TypeScript throughout
2. **Clinical Accuracy**: All DRI values match NIH/USDA sources
3. **Test Coverage**: >80% on domain logic
4. **Performance**: <50ms evaluation time per food
5. **Modularity**: Each file has single responsibility
6. **Production Ready**: Deployed and functional in production

---

## References

- [NIH Office of Dietary Supplements - Nutrient Recommendations](https://ods.od.nih.gov/HealthInformation/nutrientrecommendations.aspx)
- [USDA Dietary Guidelines 2020-2025](https://www.dietaryguidelines.gov/)
- [National Academies DRI Tables](https://www.nationalacademies.org/our-work/dietary-reference-intakes)
- [FDA Daily Values](https://www.fda.gov/food/nutrition-facts-label/daily-value-nutrition-and-supplement-facts-labels)
- [Mifflin-St Jeor Equation](https://pubmed.ncbi.nlm.nih.gov/2305711/)
