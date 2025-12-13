# Nutrition Scoring Algorithm

## Technical Specification v2.0

**Document Status:** Implementation Specification
**Last Updated:** December 2024
**Authors:** NVIVO Engineering Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Scientific Foundation](#2-scientific-foundation)
3. [Algorithm Overview](#3-algorithm-overview)
4. [Component 1: Nutrient Adequacy (MAR)](#4-component-1-nutrient-adequacy-mar)
5. [Component 2: Moderation](#5-component-2-moderation)
6. [Component 3: Balance & Quality](#6-component-3-balance--quality)
7. [Focus-Specific Scoring](#7-focus-specific-scoring)
8. [Score Calculation](#8-score-calculation)
9. [Weekly Score Aggregation](#9-weekly-score-aggregation)
10. [Missing Data Handling](#10-missing-data-handling)
11. [Data Structures](#11-data-structures)
12. [Implementation Notes](#12-implementation-notes)
13. [References](#13-references)

---

## 1. Executive Summary

The NVIVO Nutrition Scoring Algorithm produces a daily score from 0 to 100 that reflects the overall quality of a patient's diet. The algorithm evaluates three core dimensions:

| Component | Weight | Purpose |
|-----------|--------|---------|
| **Nutrient Adequacy** | 50 points | Did you get enough beneficial nutrients? |
| **Moderation** | 30 points | Did you limit harmful nutrients? |
| **Balance & Quality** | 20 points | Is your diet well-rounded? |

The score is personalized based on the patient's age, sex, life stage, health conditions, and chosen nutrition focus (e.g., Heart Health, Muscle Building, Blood Sugar Control). This personalization ensures the score accurately reflects how well the patient is eating *for their specific goals*.

### Design Principles

1. **Evidence-Based:** All thresholds and weights derive from peer-reviewed research and established dietary guidelines (DRI, AHA, WHO, NIH).

2. **Personalized:** Targets adjust for demographics, health conditions, and goals—not one-size-fits-all.

3. **Balanced Assessment:** High intake of one nutrient cannot mask deficiencies in others (via MAR capping).

4. **Actionable:** The score breakdown identifies specific areas for improvement.

5. **Transparent:** Patients can understand exactly why they received their score.

---

## 2. Scientific Foundation

### 2.1 Validated Diet Quality Indices

This algorithm draws from established, validated diet quality assessment tools:

| Index | Key Concepts Adopted |
|-------|---------------------|
| **Healthy Eating Index (HEI-2020)** | Adequacy vs. moderation components; density-based scoring |
| **Diet Quality Index-International (DQI-I)** | Four-component model (variety, adequacy, moderation, balance) |
| **Mean Adequacy Ratio (MAR)** | Averaging capped nutrient adequacy ratios |
| **Dietary Inflammatory Index (DII)** | Pro- and anti-inflammatory nutrient weighting |

### 2.2 Nutrient Adequacy Ratio (NAR) and Mean Adequacy Ratio (MAR)

The NAR/MAR methodology is the gold standard for assessing dietary adequacy across multiple nutrients:

```
NAR = min(1.0, intake / recommended)
MAR = Σ(NAR) / n
```

**Key insight:** Capping each NAR at 1.0 (100%) prevents excess intake of one nutrient from compensating for deficiencies in others. A person who consumes 300% of their vitamin C but only 20% of their iron will not receive an inflated adequacy score.

### 2.3 Reference Standards

| Standard | Application |
|----------|-------------|
| **Dietary Reference Intakes (DRI)** | RDA, AI, UL values for 60+ nutrients by age/sex |
| **Acceptable Macronutrient Distribution Ranges (AMDR)** | Carbs 45-65%, Protein 10-35%, Fat 20-35% of calories |
| **American Heart Association (AHA)** | Saturated fat <7-10%, sodium <2300mg |
| **World Health Organization (WHO)** | Added sugars <10% of calories (ideally <5%) |
| **FDA Daily Values** | Reference values for nutrition labeling |

---

## 3. Algorithm Overview

### 3.1 High-Level Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Patient        │     │  Daily Food      │     │  Nutrition      │
│  Profile        │────▶│  Intake          │────▶│  Focus          │
│  (age, sex...)  │     │  (50+ nutrients) │     │  (e.g., Heart)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TARGET COMPUTATION                            │
│  • DRI lookup by age, sex, life stage                           │
│  • Calorie calculation (Mifflin-St Jeor)                        │
│  • Condition-specific adjustments (heart disease, CKD, etc.)    │
│  • Focus-specific target modifications                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SCORE CALCULATION                             │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐     │
│  │  ADEQUACY   │  │ MODERATION  │  │  BALANCE & QUALITY  │     │
│  │  (50 pts)   │  │  (30 pts)   │  │     (20 pts)        │     │
│  │             │  │             │  │                     │     │
│  │  • MAR      │  │  • Sodium   │  │  • Macro balance    │     │
│  │  • 26       │  │  • Sat fat  │  │  • Fat quality      │     │
│  │    nutrients│  │  • Sugar    │  │  • Variety          │     │
│  │             │  │  • Calories │  │  • Glycemic impact  │     │
│  └─────────────┘  └─────────────┘  └─────────────────────┘     │
│                              │                                   │
│                              ▼                                   │
│                    FOCUS WEIGHT ADJUSTMENT                       │
│                              │                                   │
│                              ▼                                   │
│                     FINAL SCORE (0-100)                         │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Nutrient Classification

All 60+ tracked nutrients are classified by their dietary role:

| Classification | Count | Examples | Scoring Behavior |
|---------------|-------|----------|------------------|
| **Beneficial** | 26 | Protein, fiber, vitamins, minerals | Higher intake = better score (up to 100% of target) |
| **Limit** | 10 | Sodium, saturated fat, trans fat, added sugars, cholesterol | Lower intake = better score |
| **Neutral** | 6 | Calories, total carbs, total fat, water, caffeine, alcohol | Context-dependent; assessed via balance |

---

## 4. Component 1: Nutrient Adequacy (MAR)

**Weight:** 50 points (default)
**Purpose:** Assess whether the patient is consuming sufficient amounts of beneficial nutrients.

### 4.1 Calculation Method

For each beneficial nutrient, calculate the Nutrient Adequacy Ratio (NAR):

```typescript
function calculateNAR(intake: number, recommended: number): number {
  if (recommended <= 0) return 1.0; // No requirement = automatically adequate
  return Math.min(1.0, intake / recommended); // Cap at 100%
}
```

Then calculate the Mean Adequacy Ratio (MAR) across all beneficial nutrients:

```typescript
function calculateMAR(intakes: NutrientIntake[], targets: NutrientTarget[]): number {
  const nars = beneficialNutrients.map(nutrient => {
    const intake = intakes[nutrient.id] ?? 0;
    const target = targets[nutrient.id]?.recommended ?? 0;
    return calculateNAR(intake, target);
  });

  return nars.reduce((sum, nar) => sum + nar, 0) / nars.length;
}
```

### 4.2 Beneficial Nutrients (26 total)

| Category | Nutrients |
|----------|-----------|
| **Macronutrients** | Protein, Fiber |
| **Fat-Soluble Vitamins** | Vitamin A, D, E, K |
| **Water-Soluble Vitamins** | Vitamin C, Thiamin (B1), Riboflavin (B2), Niacin (B3), Pantothenic Acid (B5), Vitamin B6, Folate, Vitamin B12, Choline |
| **Major Minerals** | Calcium, Phosphorus, Magnesium, Potassium |
| **Trace Minerals** | Iron, Zinc, Copper, Manganese, Selenium, Chromium, Molybdenum |

### 4.3 Scoring

```typescript
const adequacyPoints = MAR * 50; // Scale to 50-point component
```

**Example:**
- Patient meets 100% of 20 nutrients, 50% of 6 nutrients
- MAR = (20 × 1.0 + 6 × 0.5) / 26 = 23/26 = 0.885
- Adequacy Points = 0.885 × 50 = **44.2 points**

### 4.4 Focus-Specific Nutrient Emphasis

Certain focuses apply multipliers to specific nutrients before averaging:

| Focus | Emphasized Nutrients | Multiplier |
|-------|---------------------|------------|
| Muscle Building | Protein | 2.0x |
| Heart Health | Fiber, Potassium, Magnesium | 1.5x |
| Brain & Focus | Omega-3 (DHA/EPA), B6, B12, Folate | 1.5x |
| Gut Health | Fiber | 3.0x |
| Bone & Joint | Calcium, Vitamin D, Vitamin K | 2.0x |
| Anti-Inflammatory | Omega-3, Vitamin C, Vitamin E, Selenium | 1.5x |

When multipliers are applied, the denominator adjusts accordingly to maintain a 0-1 MAR range.

---

## 5. Component 2: Moderation

**Weight:** 30 points (default)
**Purpose:** Assess whether the patient is limiting nutrients that can harm health when consumed in excess.

### 5.1 Limit Nutrients

| Nutrient | Default Limit | Heart Health Limit | Source |
|----------|--------------|-------------------|--------|
| **Sodium** | 2,300 mg | 1,500 mg | AHA/CDC |
| **Saturated Fat** | <10% of calories (~22g on 2000 kcal) | <7% of calories (~15g) | AHA |
| **Trans Fat** | 0g (as low as possible) | 0g | FDA/AHA |
| **Added Sugars** | <10% of calories (~50g on 2000 kcal) | <5% of calories | WHO |
| **Cholesterol** | 300 mg | 200 mg | Dietary Guidelines |

### 5.2 Scoring Method

For each limit nutrient, calculate a moderation score where lower intake = higher score:

```typescript
function calculateModerationScore(intake: number, limit: number): number {
  if (intake <= 0) return 1.0; // No intake = perfect score
  if (intake >= limit * 2) return 0; // Double the limit = zero points

  // Linear scale: at limit = 0.5, at 0 = 1.0, at 2x limit = 0
  if (intake <= limit) {
    return 1.0 - (intake / limit) * 0.5; // 1.0 to 0.5
  } else {
    return 0.5 - ((intake - limit) / limit) * 0.5; // 0.5 to 0
  }
}
```

**Scoring breakdown:**

| Intake Level | Score | Interpretation |
|--------------|-------|----------------|
| 0% of limit | 100% | Excellent |
| 50% of limit | 75% | Very good |
| 100% of limit | 50% | Acceptable |
| 150% of limit | 25% | Concerning |
| 200%+ of limit | 0% | Poor |

### 5.3 Calorie Balance

Calorie intake is assessed bidirectionally—both excess and severe deficit are penalized:

```typescript
function calculateCaloriePenalty(intake: number, target: number, focus: string): number {
  const ratio = intake / target;

  // Severe undereating (potential crash dieting or incomplete logging)
  if (ratio < 0.5) {
    return 10; // 10-point penalty, flag as potentially incomplete
  }

  // Moderate undereating
  if (ratio < 0.8) {
    return (0.8 - ratio) * 15; // Up to 4.5 point penalty
  }

  // Within acceptable range
  if (ratio <= 1.15) {
    return 0; // No penalty
  }

  // Overeating
  if (ratio <= 1.5) {
    return (ratio - 1.15) * 20; // Up to 7 point penalty
  }

  // Significant overeating
  return 7 + (ratio - 1.5) * 10; // Escalating penalty
}
```

**Focus-specific adjustments:**
- **Weight Management:** Stricter tolerance (±10% of target)
- **Muscle Building:** More lenient on surplus (up to +20%)

### 5.4 Combined Moderation Score

```typescript
const sodiumScore = calculateModerationScore(sodium, sodiumLimit);
const satFatScore = calculateModerationScore(satFat, satFatLimit);
const transFatScore = calculateModerationScore(transFat, 2); // 2g practical limit
const sugarScore = calculateModerationScore(addedSugar, sugarLimit);
const cholesterolScore = calculateModerationScore(cholesterol, cholesterolLimit);

const baseModerationScore = (
  sodiumScore * 6 +      // 6 points max
  satFatScore * 8 +      // 8 points max
  transFatScore * 4 +    // 4 points max
  sugarScore * 8 +       // 8 points max
  cholesterolScore * 4   // 4 points max
); // Total: 30 points

const caloriePenalty = calculateCaloriePenalty(calories, calorieTarget, focus);
const moderationPoints = Math.max(0, baseModerationScore - caloriePenalty);
```

---

## 6. Component 3: Balance & Quality

**Weight:** 20 points (default)
**Purpose:** Assess the overall composition and diversity of the diet.

### 6.1 Macronutrient Balance (8 points)

Evaluate whether macronutrient distribution falls within Acceptable Macronutrient Distribution Ranges (AMDR):

| Macronutrient | AMDR | Optimal Range |
|---------------|------|---------------|
| Carbohydrates | 45-65% of calories | 45-55% |
| Protein | 10-35% of calories | 15-25% |
| Fat | 20-35% of calories | 25-35% |

```typescript
function calculateMacroBalance(
  carbPercent: number,
  proteinPercent: number,
  fatPercent: number
): number {
  let score = 8;

  // Carbohydrate assessment
  if (carbPercent < 45 || carbPercent > 65) {
    score -= Math.min(3, Math.abs(carbPercent - 55) / 10);
  }

  // Protein assessment
  if (proteinPercent < 10 || proteinPercent > 35) {
    score -= Math.min(3, Math.abs(proteinPercent - 20) / 10);
  }

  // Fat assessment
  if (fatPercent < 20 || fatPercent > 35) {
    score -= Math.min(2, Math.abs(fatPercent - 30) / 10);
  }

  return Math.max(0, score);
}
```

### 6.2 Fat Quality (6 points)

Assess the types of fats consumed, not just the quantity:

#### Unsaturated-to-Saturated Ratio

```typescript
function calculateFatQualityScore(
  pufa: number,   // Polyunsaturated fat (g)
  mufa: number,   // Monounsaturated fat (g)
  sfa: number     // Saturated fat (g)
): number {
  if (sfa === 0) return 4; // No saturated fat = full points

  const ratio = (pufa + mufa) / sfa;

  // Target ratio: ≥2.0 (twice as much unsaturated as saturated)
  if (ratio >= 2.0) return 4;
  if (ratio >= 1.5) return 3;
  if (ratio >= 1.0) return 2;
  if (ratio >= 0.5) return 1;
  return 0;
}
```

#### Omega-3 to Omega-6 Ratio

```typescript
function calculateOmegaRatioScore(omega3: number, omega6: number): number {
  if (omega6 === 0) return 2;

  const ratio = omega3 / omega6;

  // Ideal: 1:4 or better (ratio ≥ 0.25)
  // Typical Western: 1:15-20 (ratio 0.05-0.07)
  if (ratio >= 0.25) return 2;      // Excellent
  if (ratio >= 0.15) return 1.5;    // Good
  if (ratio >= 0.10) return 1;      // Moderate
  if (ratio >= 0.05) return 0.5;    // Poor
  return 0;                          // Very poor
}
```

**Combined Fat Quality Score:**
```typescript
const fatQualityPoints = calculateFatQualityScore(pufa, mufa, sfa) +
                         calculateOmegaRatioScore(omega3, omega6);
// Maximum: 6 points
```

### 6.3 Dietary Variety (6 points)

Assess consumption across food groups using indicator nutrients:

| Food Group | Indicator Nutrients | Threshold for Credit |
|------------|--------------------|--------------------|
| Fruits | Vitamin C, Potassium | Both ≥50% of target |
| Vegetables | Vitamin A, Vitamin K, Folate | ≥2 of 3 at ≥50% |
| Whole Grains | Fiber, B-vitamins (B1, B2, B3) | Fiber ≥75% AND ≥1 B-vitamin ≥50% |
| Lean Protein | Protein, B12, Iron, Zinc | Protein ≥75% AND ≥2 others ≥50% |
| Dairy/Alternatives | Calcium, Vitamin D, Riboflavin | Calcium ≥75% AND ≥1 other ≥50% |
| Healthy Fats | MUFA, PUFA, Vitamin E | ≥2 of 3 at ≥50% |

```typescript
function calculateVarietyScore(evaluations: NutrientEvaluation[]): number {
  let foodGroupsRepresented = 0;

  // Check each food group
  if (hasFruits(evaluations)) foodGroupsRepresented++;
  if (hasVegetables(evaluations)) foodGroupsRepresented++;
  if (hasWholeGrains(evaluations)) foodGroupsRepresented++;
  if (hasLeanProtein(evaluations)) foodGroupsRepresented++;
  if (hasDairy(evaluations)) foodGroupsRepresented++;
  if (hasHealthyFats(evaluations)) foodGroupsRepresented++;

  // Scale to 6 points
  return foodGroupsRepresented; // 0-6 points
}
```

### 6.4 Glycemic Impact (Focus-Specific Bonus/Penalty)

For **Energy**, **Blood Sugar**, and **Weight Management** focuses, assess glycemic quality:

#### Sugar-to-Fiber Ratio

```typescript
function calculateSugarFiberRatio(addedSugar: number, fiber: number): number {
  if (fiber === 0) return addedSugar > 0 ? 10 : 0; // High ratio if no fiber
  return addedSugar / fiber;
}

function getGlycemicPenalty(sugarFiberRatio: number, focus: string): number {
  if (!['energy', 'blood_sugar', 'weight_management'].includes(focus)) {
    return 0; // Only applies to relevant focuses
  }

  // Lower ratio = better glycemic control
  if (sugarFiberRatio <= 1.0) return 0;      // Excellent: no penalty
  if (sugarFiberRatio <= 2.0) return 1;      // Good
  if (sugarFiberRatio <= 4.0) return 2;      // Moderate
  if (sugarFiberRatio <= 6.0) return 3;      // Poor
  return 4;                                    // Very poor
}
```

---

## 7. Focus-Specific Scoring

The algorithm supports 10 nutrition focuses, each modifying weights and thresholds:

### 7.1 Focus Configuration Matrix

| Focus | Adequacy Weight | Moderation Weight | Balance Weight | Key Modifications |
|-------|-----------------|-------------------|----------------|-------------------|
| **Balanced** | 50 | 30 | 20 | Default configuration |
| **Muscle Building** | 55 | 25 | 20 | Protein 2x emphasis; calorie surplus tolerated |
| **Heart Health** | 45 | 35 | 20 | Stricter sat fat/sodium limits; fiber/omega-3 emphasis |
| **Energy** | 50 | 25 | 25 | Glycemic impact assessed; B-vitamin emphasis |
| **Weight Management** | 45 | 35 | 20 | Strict calorie tolerance; nutrient density rewarded |
| **Brain & Focus** | 50 | 25 | 25 | Omega-3/B-vitamin emphasis; antioxidant bonus |
| **Gut Health** | 55 | 25 | 20 | Fiber 3x emphasis |
| **Blood Sugar** | 45 | 35 | 20 | Glycemic impact primary; carb quality assessed |
| **Bone & Joint** | 55 | 25 | 20 | Ca/D/K 2x emphasis |
| **Anti-Inflammatory** | 45 | 30 | 25 | DII-inspired scoring; omega-3/antioxidant emphasis |

### 7.2 Detailed Focus Specifications

#### Balanced (Default)
- Standard DRI targets
- Equal weighting across all beneficial nutrients
- Standard limits for sodium, saturated fat, sugar

#### Muscle Building
- **Protein target:** 1.6g per kg body weight (vs. 0.8g RDA)
- **Calorie tolerance:** Up to +20% surplus acceptable
- **Protein NAR weight:** 2.0x in MAR calculation
- **Leucine tracking:** If available, emphasize leucine-rich protein

#### Heart Health
- **Saturated fat limit:** <7% of calories (vs. 10%)
- **Sodium limit:** 1,500mg (vs. 2,300mg)
- **Cholesterol limit:** 200mg (vs. 300mg)
- **Fiber emphasis:** 1.5x weight in adequacy
- **Potassium emphasis:** 1.5x weight (supports blood pressure)
- **Omega-3 emphasis:** 1.5x weight

#### Energy
- **Glycemic impact:** Sugar:fiber ratio assessed
- **B-vitamin emphasis:** 1.3x weight for B1, B2, B3, B6, B12
- **Iron emphasis:** 1.3x weight (energy metabolism)
- **Complex carb bonus:** High fiber + moderate carbs = bonus points

#### Weight Management
- **Calorie precision:** ±10% tolerance (vs. ±15% default)
- **Nutrient density:** MAR should be high relative to calorie intake
- **Fiber emphasis:** 1.5x weight (satiety)
- **Protein emphasis:** 1.3x weight (satiety, muscle preservation)

#### Brain & Focus
- **Omega-3 (DHA/EPA) emphasis:** 2.0x weight
- **B6, B12, Folate emphasis:** 1.5x weight
- **Antioxidants (C, E) emphasis:** 1.3x weight
- **Saturated fat limit:** Stricter (linked to cognitive decline)

#### Gut Health
- **Fiber emphasis:** 3.0x weight in adequacy
- **Fiber target:** Upper end of range (30-38g)
- **Variety bonus:** Extra points for diverse fiber sources

#### Blood Sugar
- **Glycemic impact:** Primary consideration (up to 10 points)
- **Added sugar limit:** <5% of calories (stricter)
- **Fiber emphasis:** 2.0x weight
- **Carbohydrate moderation:** Assessed but not overly penalized if quality is good

#### Bone & Joint
- **Calcium emphasis:** 2.0x weight
- **Vitamin D emphasis:** 2.0x weight
- **Vitamin K emphasis:** 1.5x weight
- **Magnesium emphasis:** 1.3x weight
- **Protein adequacy:** Important for bone matrix

#### Anti-Inflammatory
- **Omega-3 emphasis:** 2.0x weight
- **Antioxidant emphasis:** 1.5x weight (C, E, selenium, zinc)
- **Saturated fat limit:** Stricter (<7% of calories)
- **Added sugar limit:** Stricter (<5% of calories)
- **DII bonus:** Extra points for anti-inflammatory pattern

---

## 8. Score Calculation

### 8.1 Final Score Formula

```typescript
function calculateDailyScore(
  adequacyPoints: number,   // 0-50
  moderationPoints: number, // 0-30
  balancePoints: number,    // 0-20
  focus: NutritionFocus
): DailyScore {
  // Apply focus-specific weights
  const weights = focus.weights;
  const totalWeight = weights.adequacy + weights.moderation + weights.balance;

  // Normalize to 100-point scale
  const weightedAdequacy = (adequacyPoints / 50) * weights.adequacy;
  const weightedModeration = (moderationPoints / 30) * weights.moderation;
  const weightedBalance = (balancePoints / 20) * weights.balance;

  const rawScore = weightedAdequacy + weightedModeration + weightedBalance;
  const normalizedScore = (rawScore / totalWeight) * 100;

  // Cap at 100
  const finalScore = Math.min(100, Math.round(normalizedScore * 10) / 10);

  return {
    score: finalScore,
    label: getScoreLabel(finalScore),
    color: getScoreColor(finalScore),
    breakdown: {
      adequacy: { points: adequacyPoints, weighted: weightedAdequacy },
      moderation: { points: moderationPoints, weighted: weightedModeration },
      balance: { points: balancePoints, weighted: weightedBalance },
    },
  };
}
```

### 8.2 Score Labels and Colors

| Score Range | Label | Color | Interpretation |
|-------------|-------|-------|----------------|
| 90-100 | Excellent | Green (#22C55E) | Exceptional diet quality |
| 75-89 | Great | Green (#22C55E) | Very good, minor improvements possible |
| 60-74 | Good | Yellow (#EAB308) | Solid foundation, some gaps to address |
| 40-59 | Fair | Orange (#F97316) | Multiple areas need attention |
| 0-39 | Needs Improvement | Red (#EF4444) | Significant dietary changes recommended |

---

## 9. Weekly Score Aggregation

### 9.1 Primary Method: Daily Average

```typescript
function calculateWeeklyScore(dailyScores: number[]): number {
  const validScores = dailyScores.filter(s => s !== null && !isNaN(s));
  if (validScores.length === 0) return 0;

  return validScores.reduce((sum, s) => sum + s, 0) / validScores.length;
}
```

### 9.2 Secondary Method: Cumulative Adequacy

For nutrients that can be "caught up" over the week:

```typescript
function calculateWeeklyCumulativeMAR(
  weeklyIntakes: DailyIntake[],
  dailyTargets: NutrientTarget[]
): number {
  // Sum all intakes across 7 days
  const totalIntakes = sumIntakesAcrossDays(weeklyIntakes);

  // Weekly requirements = daily × 7
  const weeklyTargets = multiplyTargets(dailyTargets, 7);

  // Calculate MAR on weekly totals
  return calculateMAR(totalIntakes, weeklyTargets);
}
```

### 9.3 Hybrid Reporting

The weekly summary reports both metrics:

```typescript
interface WeeklyScore {
  averageDaily: number;        // Mean of daily scores
  cumulativeMAR: number;       // MAR on weekly totals
  consistency: number;         // Standard deviation of daily scores
  daysLogged: number;          // Number of days with data
  trend: 'improving' | 'stable' | 'declining';
}
```

---

## 10. Missing Data Handling

### 10.1 Missing Patient Profile Data

| Field | Default | Rationale |
|-------|---------|-----------|
| Age | 35 | Adult RDAs; conservative |
| Sex | Use higher requirement | Prevents underestimation |
| Activity Level | Moderate (1.55x) | Middle ground |
| Weight Goal | Maintenance | Neutral calorie adjustment |
| Health Conditions | None | Standard limits apply |

### 10.2 Missing Nutrient Data

```typescript
function handleMissingNutrient(
  nutrientId: string,
  foods: FoodEntry[],
  strategy: 'exclude' | 'zero' | 'estimate'
): number | null {
  const hasData = foods.some(f => f.nutrients[nutrientId] !== undefined);

  switch (strategy) {
    case 'exclude':
      // Exclude from MAR calculation entirely
      return hasData ? sumNutrient(foods, nutrientId) : null;

    case 'zero':
      // Treat missing as zero (conservative)
      return sumNutrient(foods, nutrientId) ?? 0;

    case 'estimate':
      // Estimate based on similar foods (advanced)
      return estimateFromSimilarFoods(foods, nutrientId);
  }
}
```

**Default strategy:** `'exclude'` for minor nutrients, `'zero'` for major nutrients (protein, fiber, key vitamins).

### 10.3 Incomplete Logging Detection

```typescript
function assessLoggingCompleteness(
  loggedCalories: number,
  estimatedBMR: number
): LoggingAssessment {
  const ratio = loggedCalories / estimatedBMR;

  if (ratio < 0.5) {
    return {
      status: 'likely_incomplete',
      confidence: 'low',
      message: 'Logged intake appears incomplete. Score may not reflect actual diet.',
    };
  }

  if (ratio < 0.8) {
    return {
      status: 'possibly_incomplete',
      confidence: 'medium',
      message: 'Some meals may be missing from today\'s log.',
    };
  }

  return {
    status: 'likely_complete',
    confidence: 'high',
    message: null,
  };
}
```

---

## 11. Data Structures

### 11.1 Core Types

```typescript
interface NutrientTarget {
  nutrientId: string;
  recommended: number;      // RDA or AI
  minimum?: number;         // Lower bound (if different from recommended)
  upperLimit?: number;      // UL - maximum safe intake
  unit: string;
  source: 'DRI' | 'FDA' | 'AHA' | 'custom';
}

interface NutrientEvaluation {
  nutrientId: string;
  displayName: string;
  intake: number;
  target: NutrientTarget;
  percentOfTarget: number;
  percentOfLimit?: number;
  nar: number;              // Nutrient Adequacy Ratio (capped at 1.0)
  status: NutrientStatus;
  classification: 'beneficial' | 'limit' | 'neutral';
}

type NutrientStatus =
  | 'excellent'         // ≥100% of target (beneficial)
  | 'good'              // 67-99% of target
  | 'below_target'      // 33-66% of target
  | 'low'               // <33% of target
  | 'well_within'       // <50% of limit (limit nutrients)
  | 'moderate'          // 50-79% of limit
  | 'approaching_limit' // 80-99% of limit
  | 'exceeds_limit';    // ≥100% of limit
```

### 11.2 Score Output

```typescript
interface DayEvaluation {
  date: string;                    // YYYY-MM-DD
  score: number;                   // 0-100
  label: ScoreLabel;
  color: string;

  mar: number;                     // Mean Adequacy Ratio

  breakdown: {
    adequacy: ComponentScore;
    moderation: ComponentScore;
    balance: ComponentScore;
  };

  nutrients: NutrientEvaluation[];

  highlights: Highlight[];         // Nutrients doing well
  gaps: NutrientGap[];            // Nutrients needing improvement

  fatQuality: {
    unsatToSatRatio: number;
    omega3To6Ratio: number;
    score: number;
  };

  glycemicImpact?: {
    sugarFiberRatio: number;
    penalty: number;
  };

  loggingAssessment: LoggingAssessment;

  summary: string;                 // Human-readable summary

  focus: {
    id: string;
    name: string;
    appliedWeights: FocusWeights;
  };
}

interface ComponentScore {
  points: number;          // Raw points earned
  maxPoints: number;       // Maximum possible
  percentage: number;      // points / maxPoints
  weighted: number;        // After focus weight applied
  details: SubScore[];     // Breakdown of sub-components
}
```

### 11.3 Focus Configuration

```typescript
interface NutritionFocus {
  id: string;
  name: string;
  description: string;

  weights: {
    adequacy: number;      // Default: 50
    moderation: number;    // Default: 30
    balance: number;       // Default: 20
  };

  nutrientEmphasis: {
    [nutrientId: string]: number;  // Multiplier (default: 1.0)
  };

  limitOverrides: {
    [nutrientId: string]: number;  // Custom limits
  };

  targetOverrides: {
    [nutrientId: string]: number;  // Custom targets
  };

  bonusCriteria: BonusCriterion[];

  glycemicImpactEnabled: boolean;

  inflammatoryIndexEnabled: boolean;
}
```

---

## 12. Implementation Notes

### 12.1 Performance Considerations

- **Cache DRI lookups:** Life stage and DRI values don't change mid-day
- **Precompute focus weights:** Load focus configuration once per evaluation
- **Batch nutrient evaluation:** Process all nutrients in single pass

### 12.2 Validation Rules

1. **Score bounds:** Always 0-100, rounded to 1 decimal place
2. **MAR bounds:** Always 0-1, capped per nutrient
3. **Intake validation:** Non-negative, reasonable upper bounds
4. **Date validation:** Ensure evaluations are for single calendar days

### 12.3 Testing Strategy

| Test Category | Coverage |
|---------------|----------|
| Unit Tests | Each calculation function in isolation |
| Integration Tests | Full pipeline from intake to score |
| Focus Tests | Each of 10 focuses with representative diets |
| Edge Cases | Zero intake, extreme values, missing data |
| Regression Tests | Known diets with expected scores |

### 12.4 Logging and Debugging

```typescript
interface EvaluationDebugLog {
  timestamp: string;
  patientId: string;
  date: string;
  inputIntakes: NutrientIntake[];
  computedTargets: NutrientTarget[];
  intermediateCalculations: {
    nars: Record<string, number>;
    mar: number;
    moderationScores: Record<string, number>;
    balanceMetrics: BalanceMetrics;
  };
  focusAdjustments: FocusAdjustment[];
  finalScore: number;
  processingTimeMs: number;
}
```

---

## 13. References

### Dietary Guidelines and Standards

1. **Dietary Reference Intakes (DRI)** - National Academies of Sciences, Engineering, and Medicine. [https://www.ncbi.nlm.nih.gov/books/NBK545442/](https://www.ncbi.nlm.nih.gov/books/NBK545442/)

2. **Dietary Guidelines for Americans 2020-2025** - U.S. Department of Agriculture. [https://www.dietaryguidelines.gov/](https://www.dietaryguidelines.gov/)

3. **AHA Diet and Lifestyle Recommendations** - American Heart Association. [https://www.heart.org/en/healthy-living/healthy-eating](https://www.heart.org/en/healthy-living/healthy-eating)

4. **WHO Sugar Intake Guidelines** - World Health Organization. [https://www.who.int/news/item/04-03-2015-who-calls-on-countries-to-reduce-sugars-intake](https://www.who.int/news/item/04-03-2015-who-calls-on-countries-to-reduce-sugars-intake)

### Diet Quality Indices

5. **Healthy Eating Index (HEI-2020)** - USDA Food and Nutrition Service. [https://www.fns.usda.gov/healthy-eating-index-hei](https://www.fns.usda.gov/healthy-eating-index-hei)

6. **Diet Quality Index-International (DQI-I)** - Kim S, et al. J Am Diet Assoc. 2003;103(11):1481-1490.

7. **Mean Adequacy Ratio (MAR)** - INDDEX Project, Tufts University. [https://inddex.nutrition.tufts.edu/data4diets/indicator/mean-adequacy-ratio-mar](https://inddex.nutrition.tufts.edu/data4diets/indicator/mean-adequacy-ratio-mar)

### Focus-Specific Research

8. **Protein and Muscle Synthesis** - Morton RW, et al. Br J Sports Med. 2018;52(6):376-384.

9. **Mediterranean Diet and Cognition** - Valls-Pedret C, et al. JAMA Intern Med. 2015;175(7):1094-1103.

10. **Dietary Inflammatory Index** - Shivappa N, et al. Public Health Nutr. 2014;17(8):1689-1696.

11. **Fiber and Gut Health** - Makki K, et al. Cell Host Microbe. 2018;23(6):705-715.

12. **Glycemic Index and Energy** - Ludwig DS. JAMA. 2002;287(18):2414-2423.

---

## Appendix A: Nutrient Reference Table

| Nutrient ID | Display Name | Classification | Default Target (Adult) | Unit |
|-------------|--------------|----------------|----------------------|------|
| protein | Protein | Beneficial | 50g (0.8g/kg) | g |
| fiber | Dietary Fiber | Beneficial | 28g | g |
| vitaminA | Vitamin A | Beneficial | 900 mcg RAE | mcg |
| vitaminC | Vitamin C | Beneficial | 90 mg | mg |
| vitaminD | Vitamin D | Beneficial | 600 IU | IU |
| vitaminE | Vitamin E | Beneficial | 15 mg | mg |
| vitaminK | Vitamin K | Beneficial | 120 mcg | mcg |
| calcium | Calcium | Beneficial | 1000 mg | mg |
| iron | Iron | Beneficial | 8-18 mg | mg |
| magnesium | Magnesium | Beneficial | 400 mg | mg |
| potassium | Potassium | Beneficial | 2600-3400 mg | mg |
| zinc | Zinc | Beneficial | 8-11 mg | mg |
| sodium | Sodium | Limit | <2300 mg | mg |
| saturatedFat | Saturated Fat | Limit | <22g (10% cal) | g |
| transFat | Trans Fat | Limit | 0g | g |
| addedSugars | Added Sugars | Limit | <50g (10% cal) | g |
| cholesterol | Cholesterol | Limit | <300 mg | mg |

*(Full table with 60+ nutrients available in `nutrient_definitions.json`)*

---

## Appendix B: Change Log

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | Dec 2024 | Complete algorithm redesign with MAR, focus system, fat quality |
| 1.0 | Nov 2024 | Initial implementation with basic adequacy/moderation scoring |

---

*This document is maintained by the NVIVO Engineering Team. For questions or clarifications, contact the Nutrition Domain team.*
