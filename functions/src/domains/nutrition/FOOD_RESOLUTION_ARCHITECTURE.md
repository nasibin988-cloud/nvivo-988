# Food Resolution Architecture

## Overview

This document describes the hybrid AI + database approach for food nutrition resolution. The goal is to maximize **accuracy** while minimizing **cost** by using AI for what it's best at (context understanding) and databases for what they're best at (accurate nutrient values).

---

## Core Principle

```
AI identifies and parses → Database provides accurate nutrition → AI adjusts for context
```

**Why this is most accurate:**
- AI excels at: Understanding natural language, portion estimation, preparation identification, dish recognition
- Databases excel at: Lab-tested nutrient values, consistency, completeness
- Combining both gives contextual accuracy with scientific precision

---

## Data Architecture

### Proposed File Structure

```
/functions/src/domains/nutrition/data/
├── foods/
│   ├── base_foods.json          # Core foods with standard nutrition (per 100g)
│   ├── preparations.json        # Cooking method modifiers
│   ├── aliases.json             # Synonyms and common names
│   └── categories.json          # Hierarchy for smart fallbacks
├── reference/
│   ├── nutrient_definitions.json
│   ├── dri_by_lifestage.json
│   └── clinical_thresholds.json
└── enhanced_foods.json          # Legacy (migrate to new structure)
```

### base_foods.json Schema

```json
{
  "chicken_breast": {
    "id": "chicken_breast",
    "name": "Chicken Breast",
    "category": "proteins/poultry",
    "basePreparation": "raw",

    "nutrition": {
      "per100g": {
        "calories": 165,
        "protein": 31,
        "carbs": 0,
        "fat": 3.6,
        "fiber": 0,
        "sugar": 0,
        "sodium": 74,
        "saturatedFat": 1,
        "cholesterol": 85,
        "potassium": 256,
        "calcium": 11,
        "iron": 0.7,
        "magnesium": 29,
        "vitaminA": 6,
        "vitaminC": 0,
        "vitaminD": 0.1,
        "vitaminB12": 0.3
      }
    },

    "standardServing": {
      "amount": 120,
      "unit": "g",
      "description": "1 medium breast"
    },

    "focusGrades": {
      "heart_health": { "grade": "A", "score": 92, "insight": "...", "pros": [], "cons": [] },
      "muscle_building": { "grade": "A+", "score": 98, "insight": "...", "pros": [], "cons": [] }
      // ... all 10 focus areas
    },

    "allergens": [],
    "dietaryTags": ["high-protein", "low-carb", "keto-friendly", "paleo"],
    "glycemicIndex": 0,
    "glycemicLoad": 0,

    "usdaFdcId": "171077",  // Link to USDA for verification
    "confidence": 1.0,
    "source": "usda"
  }
}
```

### preparations.json Schema

```json
{
  "grilled": {
    "id": "grilled",
    "name": "Grilled",
    "description": "Cooked over direct heat, excess fat drips away",
    "applicableTo": ["proteins", "vegetables"],

    "modifiers": {
      "fatMultiplier": 0.92,      // Fat reduces ~8% (drips off)
      "sodiumAdd": 50,            // Often seasoned
      "waterLossPercent": 25,     // Weight reduction from cooking
      "calorieMultiplier": 0.95   // Slight reduction
    },

    "notes": "Healthier than frying, retains protein"
  },

  "fried": {
    "id": "fried",
    "name": "Fried / Deep-Fried",
    "description": "Cooked in oil, often with breading",
    "applicableTo": ["proteins", "vegetables", "starches"],

    "modifiers": {
      "fatAdd": 12,               // Absorbs oil
      "carbsAdd": 15,             // Breading
      "calorieAdd": 150,          // Significant increase
      "saturatedFatAdd": 3,
      "sodiumAdd": 200            // Breading + seasoning
    },

    "variants": {
      "pan_fried": {
        "fatAdd": 5,
        "calorieAdd": 60
      },
      "deep_fried": {
        "fatAdd": 15,
        "calorieAdd": 180
      },
      "air_fried": {
        "fatAdd": 2,
        "calorieAdd": 30
      }
    }
  },

  "steamed": {
    "id": "steamed",
    "name": "Steamed",
    "modifiers": {
      "waterLossPercent": 10,
      // Minimal nutrition change - healthiest cooking method
    }
  },

  "raw": {
    "id": "raw",
    "name": "Raw",
    "modifiers": {}  // No changes - base values
  },

  "roasted": {
    "id": "roasted",
    "name": "Roasted / Baked",
    "modifiers": {
      "waterLossPercent": 20,
      "fatMultiplier": 0.95
    }
  },

  "boiled": {
    "id": "boiled",
    "name": "Boiled",
    "modifiers": {
      "waterLossPercent": 5,
      "potassiumMultiplier": 0.7,  // Leaches into water
      "vitaminCMultiplier": 0.5    // Heat-sensitive vitamins
    }
  }
}
```

### aliases.json Schema

```json
{
  "chicken_breast": [
    "chicken breast",
    "breast of chicken",
    "chicken",
    "boneless chicken",
    "skinless chicken breast",
    "chicken fillet"
  ],

  "french_fries": [
    "fries",
    "chips",
    "freedom fries",
    "potato fries",
    "steak fries",
    "shoestring fries"
  ],

  "soda": [
    "coke",
    "coca cola",
    "pepsi",
    "soft drink",
    "pop",
    "cola",
    "fizzy drink"
  ],

  "pad_thai": [
    "pad thai",
    "phad thai",
    "thai noodles",
    "thai stir fry noodles"
  ]
}
```

### categories.json Schema

```json
{
  "proteins": {
    "poultry": {
      "chicken": ["chicken_breast", "chicken_thigh", "chicken_wing", "chicken_drumstick"],
      "turkey": ["turkey_breast", "ground_turkey"],
      "duck": ["duck_breast"]
    },
    "beef": {
      "steaks": ["ribeye", "sirloin", "filet_mignon"],
      "ground": ["ground_beef", "ground_beef_lean"],
      "roasts": ["beef_roast", "brisket"]
    },
    "pork": {
      "cuts": ["pork_chop", "pork_tenderloin"],
      "processed": ["bacon", "ham", "sausage"]
    },
    "seafood": {
      "fish": ["salmon", "tuna", "cod", "tilapia", "trout"],
      "shellfish": ["shrimp", "crab", "lobster", "scallops"]
    }
  },

  "vegetables": {
    "leafy_greens": ["spinach", "kale", "lettuce", "arugula"],
    "cruciferous": ["broccoli", "cauliflower", "cabbage", "brussels_sprouts"],
    "root": ["carrot", "potato", "sweet_potato", "beet"],
    "alliums": ["onion", "garlic", "leek", "shallot"]
  },

  "grains": {
    "rice": ["white_rice", "brown_rice", "basmati_rice"],
    "pasta": ["spaghetti", "penne", "linguine"],
    "bread": ["white_bread", "whole_wheat_bread", "sourdough"]
  },

  "ethnic_dishes": {
    "mexican": ["burrito", "taco", "enchilada", "quesadilla"],
    "chinese": ["fried_rice", "lo_mein", "kung_pao_chicken"],
    "italian": ["lasagna", "pizza", "risotto"],
    "indian": ["curry", "tikka_masala", "biryani"],
    "thai": ["pad_thai", "green_curry", "tom_yum_soup"],
    "japanese": ["sushi_roll", "ramen", "teriyaki_chicken"]
  }
}
```

---

## Resolution Algorithm

### UnifiedFoodResolutionService

```typescript
// /functions/src/domains/nutrition/foodResolution.ts

interface ResolvedFood {
  nutrition: NutritionData;
  source: 'database' | 'usda' | 'ai' | 'computed';
  confidence: number;          // 0-1
  baseFood?: string;           // e.g., "chicken_breast"
  preparation?: string;        // e.g., "grilled"
  portionMultiplier: number;   // e.g., 1.5 for 150g when base is 100g
  adjustments?: {
    preparation?: PreparationModifiers;
    portion?: { from: number; to: number };
  };
  meta: {
    inputRaw: string;
    inputNormalized: string;
    resolvedAs: string;
    resolutionPath: string[];  // e.g., ['alias', 'base_food', 'preparation']
    timeMs: number;
  };
}

class UnifiedFoodResolutionService {

  /**
   * Main entry point for all food resolution
   */
  async resolve(input: FoodInput): Promise<ResolvedFood> {
    const startTime = Date.now();
    const resolutionPath: string[] = [];

    // STEP 1: Classify input type
    const classification = await this.classifyInput(input);
    resolutionPath.push(`classified:${classification.type}`);

    switch (classification.type) {
      case 'simple_ingredient':
        // Direct lookup path
        return this.resolveSimpleFood(classification.normalized, resolutionPath);

      case 'known_meal':
        // Direct meal lookup
        return this.resolveKnownMeal(classification.normalized, resolutionPath);

      case 'composite_meal':
        // Parse into components, resolve each
        return this.resolveCompositeMeal(classification.components, resolutionPath);

      case 'unknown':
        // Full AI analysis
        return this.resolveViaAI(input.raw, resolutionPath);
    }
  }

  /**
   * Resolve a simple food item (e.g., "grilled chicken breast")
   */
  private async resolveSimpleFood(
    normalized: string,
    path: string[]
  ): Promise<ResolvedFood> {

    // 1. Try exact match in base_foods
    let result = await this.tryExactMatch(normalized);
    if (result) {
      path.push('exact_match');
      return result;
    }

    // 2. Try alias lookup
    const aliasMatch = await this.tryAliasMatch(normalized);
    if (aliasMatch) {
      path.push(`alias:${aliasMatch}`);
      result = await this.tryExactMatch(aliasMatch);
      if (result) return result;
    }

    // 3. Try fuzzy match with preparation extraction
    const parsed = this.extractPreparation(normalized);
    if (parsed.preparation) {
      path.push(`prep:${parsed.preparation}`);
      const baseResult = await this.tryExactMatch(parsed.baseFood);
      if (baseResult) {
        return this.applyPreparation(baseResult, parsed.preparation, path);
      }
    }

    // 4. Try category-based fallback
    const categoryMatch = await this.tryCategoryFallback(normalized);
    if (categoryMatch) {
      path.push(`category_fallback:${categoryMatch}`);
      return this.tryExactMatch(categoryMatch);
    }

    // 5. Try USDA API
    const usdaResult = await this.tryUSDA(normalized);
    if (usdaResult) {
      path.push('usda');
      return usdaResult;
    }

    // 6. Fall back to AI
    path.push('ai_fallback');
    return this.resolveViaAI(normalized, path);
  }

  /**
   * Extract preparation method from food description
   */
  private extractPreparation(input: string): { baseFood: string; preparation?: string; portion?: number } {
    const prepPatterns = [
      { pattern: /\b(grilled|bbq|barbecued)\b/i, prep: 'grilled' },
      { pattern: /\b(fried|deep.?fried|pan.?fried)\b/i, prep: 'fried' },
      { pattern: /\b(baked|roasted|oven)\b/i, prep: 'roasted' },
      { pattern: /\b(steamed)\b/i, prep: 'steamed' },
      { pattern: /\b(boiled)\b/i, prep: 'boiled' },
      { pattern: /\b(raw|fresh|uncooked)\b/i, prep: 'raw' },
      { pattern: /\b(sauteed|sautéed)\b/i, prep: 'sauteed' },
    ];

    let preparation: string | undefined;
    let baseFood = input;

    for (const { pattern, prep } of prepPatterns) {
      if (pattern.test(input)) {
        preparation = prep;
        baseFood = input.replace(pattern, '').trim();
        break;
      }
    }

    // Extract portion if present
    const portionMatch = input.match(/(\d+(?:\.\d+)?)\s*(g|oz|cup|tbsp|piece)/i);
    const portion = portionMatch ? this.normalizePortionToGrams(portionMatch) : undefined;

    return { baseFood: this.normalize(baseFood), preparation, portion };
  }

  /**
   * Apply preparation modifiers to base nutrition
   */
  private applyPreparation(
    baseFood: ResolvedFood,
    preparation: string,
    path: string[]
  ): ResolvedFood {
    const modifier = this.preparations[preparation];
    if (!modifier) return baseFood;

    const adjusted = { ...baseFood.nutrition };

    // Apply multipliers
    if (modifier.fatMultiplier) adjusted.fat *= modifier.fatMultiplier;
    if (modifier.calorieMultiplier) adjusted.calories *= modifier.calorieMultiplier;
    if (modifier.potassiumMultiplier) adjusted.potassium *= modifier.potassiumMultiplier;

    // Apply additions
    if (modifier.fatAdd) adjusted.fat += modifier.fatAdd;
    if (modifier.carbsAdd) adjusted.carbs += modifier.carbsAdd;
    if (modifier.calorieAdd) adjusted.calories += modifier.calorieAdd;
    if (modifier.sodiumAdd) adjusted.sodium += modifier.sodiumAdd;

    path.push(`applied_prep:${preparation}`);

    return {
      ...baseFood,
      nutrition: adjusted,
      source: 'computed',
      preparation,
      adjustments: {
        ...baseFood.adjustments,
        preparation: modifier
      }
    };
  }
}
```

---

## Integration Points

### 1. analyzeFoodText (Text-based food logging)

```typescript
// Current: Direct AI call for complex foods
// New: Use resolver for all foods

async function analyzeFoodTextFn(description: string): Promise<FoodAnalysisResult> {
  const resolver = UnifiedFoodResolutionService.getInstance();

  // Single item or multiple?
  const items = await parseMultipleItems(description);

  const results = await Promise.all(
    items.map(item => resolver.resolve({ raw: item, type: 'text' }))
  );

  return aggregateResults(results);
}
```

### 2. analyzeFoodPhoto (Photo-based food logging)

```typescript
// Current: AI Vision does everything (identification + nutrition)
// New: AI Vision identifies, resolver provides nutrition

async function analyzeFoodPhotoFn(imageBase64: string): Promise<FoodAnalysisResult> {
  const resolver = UnifiedFoodResolutionService.getInstance();

  // Step 1: AI Vision identifies foods (REQUIRED - can't skip)
  const identified = await identifyFoodsFromPhoto(imageBase64);
  // Returns: [{ name: "grilled salmon", portion: "~200g" }, { name: "rice", portion: "1 cup" }]

  // Step 2: Resolve each identified food via database
  const results = await Promise.all(
    identified.map(item => resolver.resolve({
      raw: item.name,
      type: 'parsed',
      estimatedPortion: item.portion
    }))
  );

  return aggregateResults(results);
}
```

### 3. scanMenuPhoto (Menu scanning)

```typescript
// Current: AI Vision extracts + estimates nutrition
// New: AI Vision extracts, resolver provides accurate nutrition

async function scanMenuPhotoFn(imageBase64: string): Promise<MenuAnalysisResult> {
  const resolver = UnifiedFoodResolutionService.getInstance();

  // Step 1: AI extracts menu items
  const menuItems = await extractMenuItems(imageBase64);

  // Step 2: Enrich each item with accurate nutrition
  const enriched = await Promise.all(
    menuItems.map(async item => ({
      ...item,
      nutrition: await resolver.resolve({ raw: item.name, type: 'text' })
    }))
  );

  return { items: enriched };
}
```

### 4. compareFoodsAI (Food comparison)

```typescript
// Current: Assumes foods are pre-analyzed
// New: Ensure consistent resolution before comparison

async function compareFoodsWithAI(
  foods: string[],
  focuses: string[]
): Promise<ComparisonResult> {
  const resolver = UnifiedFoodResolutionService.getInstance();

  // Resolve all foods with consistent data source
  const resolved = await Promise.all(
    foods.map(f => resolver.resolve({ raw: f, type: 'text' }))
  );

  // Now compare with consistent, accurate data
  return generateComparison(resolved, focuses);
}
```

---

## Cost vs Accuracy Analysis

### Resolution Source Comparison

| Source | Cost | Accuracy | Speed | Best For |
|--------|------|----------|-------|----------|
| base_foods.json | $0 | 95-100% | <1ms | Standard foods |
| preparations.json | $0 | 90-95% | <1ms | Cooking variants |
| aliases.json | $0 | 95-100% | <1ms | Synonym matching |
| USDA API | $0 | 100% | 200-500ms | Unknown ingredients |
| AI estimation | $0.001-0.01 | 80-90% | 1-3s | Complex/unknown |

### Expected Resolution Distribution

With 394 foods in database + aliases + preparations:

```
Simple lookups (direct match):     ~50%  → $0, instant
Alias + preparation match:         ~25%  → $0, instant
USDA fallback:                     ~15%  → $0, 200ms
AI fallback:                       ~10%  → $0.005 avg, 2s
```

**Cost reduction: ~90% vs current approach**

---

## Migration Plan

### Phase 1: Restructure Data (This sprint)
1. Convert enhanced_foods.json → base_foods.json
2. Create preparations.json with cooking modifiers
3. Create aliases.json from common variations
4. Create categories.json for hierarchy

### Phase 2: Build Resolution Service (Next sprint)
1. Implement UnifiedFoodResolutionService
2. Add preparation modifier logic
3. Add fuzzy matching with aliases
4. Add USDA fallback integration

### Phase 3: Integration (Following sprint)
1. Update analyzeFoodText to use resolver
2. Update analyzeFoodPhoto to use resolver
3. Update scanMenuPhoto to use resolver
4. Update compareFoodsAI to use resolver

### Phase 4: Optimization (Ongoing)
1. Add cache layer for resolved foods
2. Monitor resolution distribution
3. Expand base_foods.json based on cache misses
4. Tune preparation modifiers based on USDA validation

---

## Accuracy Validation

### How to Verify Accuracy

1. **Cross-reference with USDA**
   - For each base food, verify nutrients match USDA FoodData Central
   - Log discrepancies > 10%

2. **Preparation modifier validation**
   - Compare "chicken_breast" + "fried" modifier vs USDA "chicken breast, fried"
   - Adjust modifiers until within 5% of USDA values

3. **User feedback loop**
   - Track when users edit AI-resolved nutrition
   - Use edits to improve base data

4. **A/B testing**
   - Compare user satisfaction: AI-only vs hybrid approach
   - Measure nutrition accuracy vs manual food diary apps

---

## Key Files

| File | Purpose |
|------|---------|
| `/domains/nutrition/foodResolution.ts` | Main resolution service |
| `/domains/nutrition/data/foods/base_foods.json` | Core food database |
| `/domains/nutrition/data/foods/preparations.json` | Cooking modifiers |
| `/domains/nutrition/data/foods/aliases.json` | Synonym mappings |
| `/domains/nutrition/data/foods/categories.json` | Food hierarchy |
| `/domains/nutrition/preparationModifiers.ts` | Apply cooking changes |
| `/domains/nutrition/fuzzyMatcher.ts` | Alias and fuzzy matching |

---

## Open Questions

1. **Portion estimation**: Should AI always estimate portions, or can we have standard portions?
2. **Regional variations**: "Biscuit" means different things in US vs UK
3. **Brand-specific foods**: Should we support "Big Mac" or just "cheeseburger"?
4. **Recipe complexity**: How deep should composite meal breakdown go?

---

## Appendix: Preparation Modifiers Reference

| Preparation | Calories | Fat | Carbs | Sodium | Notes |
|-------------|----------|-----|-------|--------|-------|
| Raw | 0% | 0% | 0% | 0% | Base values |
| Grilled | -5% | -8% | 0% | +50mg | Fat drips off |
| Pan-fried | +15% | +5g | 0% | +100mg | Oil absorbed |
| Deep-fried | +40% | +12g | +15g | +200mg | Breading + oil |
| Baked/Roasted | -3% | -5% | 0% | +30mg | Slight fat loss |
| Steamed | 0% | 0% | 0% | 0% | Healthiest method |
| Boiled | 0% | 0% | 0% | varies | Nutrient leaching |
| Air-fried | +8% | +2g | +5g | +50mg | Less oil than deep-fry |

---

*Last updated: 2024-12-12*
*Author: Claude Code*
