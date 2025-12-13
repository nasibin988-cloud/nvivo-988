# Nutrition AI Architecture

## Complete Technical Specification

This document describes the comprehensive architecture for food analysis, nutrition resolution, and health grading. The system is designed to be **accurate**, **efficient**, and **cost-effective** by minimizing AI usage and leveraging authoritative nutrition databases.

---

## Table of Contents

1. [Overview & Design Principles](#1-overview--design-principles)
2. [AI Identification Layer](#2-ai-identification-layer)
3. [Resolution Layer](#3-resolution-layer)
4. [GI Enrichment Layer](#4-gi-enrichment-layer)
5. [Grading Layer](#5-grading-layer)
6. [Comparison Layer](#6-comparison-layer)
7. [Data Storage](#7-data-storage)
8. [Performance & Cost Analysis](#8-performance--cost-analysis)

---

## 1. Overview & Design Principles

### Core Philosophy

**AI identifies. Databases provide facts. Formulas grade.**

| Layer | Responsibility | Uses AI? |
|-------|----------------|----------|
| Identification | What food is this? | ✅ Yes (1 call) |
| Resolution | What are the nutrients? | ❌ No (APIs) |
| GI Enrichment | What's the glycemic impact? | ❌ No (lookup) |
| Grading | How healthy is it? | ❌ No (formulas) |
| Comparison Insights | Why is one better? | ✅ Yes (optional) |

### Why This Architecture?

| Previous Approach | New Approach |
|-------------------|--------------|
| AI estimates all 35+ nutrients | AI only identifies food |
| Inconsistent results | Deterministic, reproducible |
| ~$0.01 per food | ~$0.0001 per food |
| 2-5 second latency | 200-500ms latency |
| AI-guessed grades | Formula-based grades (Nutri-Score, DRI thresholds) |

### System Flow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INPUT                                   │
│         Photo | Text | Menu Photo | Multiple Foods              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              AI IDENTIFICATION LAYER                             │
│                    (1 AI call)                                   │
│                                                                  │
│   Output: NormalizedFoodDescriptor                              │
│   { name, quantity, unit, foodType, ingredients[], ... }        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 RESOLUTION LAYER                                 │
│                    (0 AI calls)                                  │
│                                                                  │
│   Cache → USDA → OpenFoodFacts → Edamam → (AI last resort)      │
│                                                                  │
│   Output: Complete nutrition (35+ nutrients)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               GI ENRICHMENT LAYER                                │
│                    (0 AI calls)                                  │
│                                                                  │
│   GI Database lookup → Calculate GL                             │
│                                                                  │
│   Output: Glycemic Index + Glycemic Load                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  GRADING LAYER                                   │
│                    (0 AI calls)                                  │
│                                                                  │
│   Nutri-Score → Overall Grade (A-F)                             │
│   DRI/AHA/WHO thresholds → 10 Focus Grades (A-F)                │
│   Holt formula → Satiety Score                                  │
│   DII coefficients → Inflammatory Index                         │
│                                                                  │
│   Output: Complete health assessment                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              COMPARISON LAYER (if applicable)                    │
│                    (1 AI call - optional)                        │
│                                                                  │
│   Deterministic facts + GPT-4o-mini insights                    │
│                                                                  │
│   Output: Structured comparison with insights                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. AI Identification Layer

### Entry Points

The system has **four entry points**, all converging to a single output format:

| Entry Point | Input | Use Case |
|-------------|-------|----------|
| **Photo AI** | Food photo | User photographs their meal |
| **Text AI** | Text description | User types "chicken salad with ranch" |
| **Menu AI** | Menu photo + optional restaurant name | User photographs restaurant menu |
| **Comparison AI** | Multiple foods (any input method) | User wants to compare options |

### Convergence Point: NormalizedFoodDescriptor

All entry points output the same structure:

```typescript
interface NormalizedFoodDescriptor {
  // Core identification
  name: string;                    // "Chicken Caesar Salad"
  quantity: number;                // 1
  unit: string;                    // "bowl"
  estimatedGrams: number;          // 350

  // Classification (helps resolution routing)
  foodType: FoodType;              // "restaurant_item"

  // Context (improves resolution accuracy)
  restaurantName?: string;         // "Panera Bread"
  cuisineType?: string;            // "American"
  mealType?: string;               // "lunch"

  // Ingredient breakdown (for composite dishes)
  ingredients?: {
    name: string;                  // "grilled chicken breast"
    estimatedGrams: number;        // 150
  }[];

  // Confidence
  confidence: number;              // 0.88
}

type FoodType =
  | 'whole_food'          // apple, chicken breast, rice
  | 'restaurant_item'     // Big Mac, Chipotle Burrito
  | 'branded_packaged'    // KIND bar, Cheerios
  | 'homemade_dish'       // homemade chicken soup
  | 'generic_dish';       // "cheeseburger" (no brand)
```

### AI Prompt Strategy

The AI prompt is designed to:
1. **Identify** foods accurately
2. **Classify** by food type (for resolution routing)
3. **Extract** ingredients for composite dishes
4. **NOT estimate** nutrition values

```typescript
const IDENTIFICATION_PROMPT = `You are a food identification expert. Analyze this input and identify all food items.

YOUR JOB:
- Identify what foods are present
- Estimate portions in grams
- Classify the food type
- Break down composite dishes into ingredients

DO NOT:
- Estimate calories or nutrients (this will be looked up from databases)
- Guess nutritional values

For each food item, provide:
1. Name (as specific as possible, include brand/restaurant if known)
2. Quantity and unit
3. Estimated weight in grams
4. Food type: whole_food | restaurant_item | branded_packaged | homemade_dish | generic_dish
5. Restaurant name (if applicable)
6. Ingredient breakdown with gram estimates (for composite dishes)
7. Your confidence (0-1)

Respond in this exact JSON format:
{
  "items": [
    {
      "name": "Chicken Caesar Salad",
      "quantity": 1,
      "unit": "bowl",
      "estimatedGrams": 350,
      "foodType": "restaurant_item",
      "restaurantName": "Panera Bread",
      "cuisineType": "American",
      "mealType": "lunch",
      "ingredients": [
        { "name": "grilled chicken breast", "estimatedGrams": 150 },
        { "name": "romaine lettuce", "estimatedGrams": 100 },
        { "name": "parmesan cheese", "estimatedGrams": 30 },
        { "name": "caesar dressing", "estimatedGrams": 45 },
        { "name": "croutons", "estimatedGrams": 25 }
      ],
      "confidence": 0.88
    }
  ]
}`;
```

### Entry Point Specifics

#### Photo AI
```typescript
async function analyzePhoto(imageBase64: string): Promise<NormalizedFoodDescriptor[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',  // Vision model
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: IDENTIFICATION_PROMPT },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
      ]
    }],
    max_tokens: 1000,
    temperature: 0.3,
  });

  return parseIdentificationResponse(response);
}
```

#### Text AI
```typescript
async function analyzeText(description: string): Promise<NormalizedFoodDescriptor[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',  // Cheaper model sufficient for text
    messages: [
      { role: 'system', content: IDENTIFICATION_PROMPT },
      { role: 'user', content: `Identify this food: ${description}` }
    ],
    max_tokens: 800,
    temperature: 0.3,
  });

  return parseIdentificationResponse(response);
}
```

#### Menu AI
```typescript
async function analyzeMenu(
  imageBase64: string,
  restaurantName?: string  // Optional user input
): Promise<NormalizedFoodDescriptor[]> {
  const contextNote = restaurantName
    ? `\n\nRESTAURANT CONTEXT: This menu is from "${restaurantName}". Use this for accurate identification.`
    : '\n\nTry to identify the restaurant from any logos, headers, or branding visible on the menu.';

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: IDENTIFICATION_PROMPT + contextNote },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
      ]
    }],
    max_tokens: 2000,  // Menus have many items
    temperature: 0.3,
  });

  return parseIdentificationResponse(response);
}
```

#### Comparison AI (Entry Point)
```typescript
async function prepareComparison(
  inputs: Array<{ type: 'photo' | 'text'; data: string }>
): Promise<NormalizedFoodDescriptor[]> {
  // Process each input through appropriate entry point
  const descriptors = await Promise.all(
    inputs.map(input => {
      if (input.type === 'photo') return analyzePhoto(input.data);
      return analyzeText(input.data);
    })
  );

  return descriptors.flat();
}
```

### Key Design Decisions

1. **One AI call per input** - Ingredients are extracted in the same call, no follow-up needed

2. **FoodType classification** - Enables smart routing in the resolution layer

3. **Restaurant name capture** - Critical for accurate Edamam lookups

4. **Gram estimates for ingredients** - Enables accurate summing after resolution

5. **No nutrition estimation** - AI only identifies; databases provide facts

---

## 3. Resolution Layer

The Resolution Layer transforms food identifications into complete nutrition data using authoritative databases. **No AI is used in this layer** except as an absolute last resort.

### Data Sources

| Source | Type | Cost | Coverage | Best For |
|--------|------|------|----------|----------|
| **Our Cache** | Local | Free | Growing | Previously resolved foods |
| **USDA FoodData Central** | API | Free | 300K+ foods | Whole foods, generic items |
| **OpenFoodFacts** | API | Free | 3M+ products | Packaged goods (macros) |
| **Edamam** | API | ~$0.00014/call | 130K+ restaurant | Restaurant & branded items |
| **AI Estimation** | OpenAI | ~$0.01/call | Unlimited | LAST RESORT (<1%) |

### Nutrients Tracked (33 Total)

```typescript
interface CompleteNutrition {
  // Macronutrients (7)
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;

  // Fat Breakdown (4)
  saturatedFat: number;
  transFat: number;
  monounsaturatedFat: number;
  polyunsaturatedFat: number;

  // Other Macros (1)
  cholesterol: number;

  // Minerals (8)
  potassium: number;
  calcium: number;
  iron: number;
  magnesium: number;
  zinc: number;
  phosphorus: number;
  iodine?: number;
  chromium?: number;

  // Vitamins - Fat Soluble (4)
  vitaminA: number;
  vitaminD: number;
  vitaminE: number;
  vitaminK: number;

  // Vitamins - Water Soluble (9)
  vitaminC: number;
  thiamin: number;
  riboflavin: number;
  niacin: number;
  vitaminB6: number;
  folate: number;
  vitaminB12: number;
  pantothenicAcid?: number;
  choline?: number;
}
```

### Resolution Strategy by Food Type

Each food type has an optimized fallback chain:

#### Whole Foods (apple, chicken breast, salmon)
```
Cache → USDA → Edamam → OpenFoodFacts → AI (last resort)
```
USDA is primary because it has lab-tested data for raw/whole foods.

#### Restaurant Items (Big Mac, Chipotle Burrito)
```
Cache → Edamam → USDA → Decompose → AI (last resort)
```
Edamam is primary because it has 130K+ restaurant items.

#### Branded/Packaged (KIND bar, Cheerios)
```
Cache → Edamam → OpenFoodFacts → USDA generic → AI (last resort)
```
For packaged foods, use **Hybrid Resolution** (see below).

#### Homemade Dishes (grandma's soup)
```
Cache → Edamam → USDA → Decompose into ingredients → AI (last resort)
```

#### Generic Dishes (cheeseburger, caesar salad)
```
Cache → Edamam → USDA → OpenFoodFacts → Decompose → AI (last resort)
```

### The Resolution Algorithm

```typescript
interface ResolutionResult {
  nutrition: CompleteNutrition;
  source: 'cache' | 'usda' | 'edamam' | 'openfoodfacts' | 'hybrid' | 'decomposed' | 'ai';
  confidence: number;
}

async function resolveFood(descriptor: NormalizedFoodDescriptor): Promise<ResolutionResult> {
  // STEP 1: Always check cache first (FREE, <1ms)
  const cached = await cacheGet(descriptor.name, descriptor.restaurantName);
  if (cached) {
    return { nutrition: cached, source: 'cache', confidence: 0.98 };
  }

  // STEP 2: Get fallback chain based on food type
  const chain = getFallbackChain(descriptor.foodType);

  // STEP 3: Try each source in order
  for (const source of chain) {
    const result = await trySource(source, descriptor);
    if (result && result.confidence > 0.75) {
      await cacheSet(descriptor.name, result.nutrition);
      return result;
    }
  }

  // STEP 4: Try decomposition if ingredients available
  if (descriptor.ingredients?.length > 0) {
    const decomposed = await resolveByDecomposition(descriptor.ingredients);
    if (decomposed) {
      await cacheSet(descriptor.name, decomposed.nutrition);
      return { ...decomposed, source: 'decomposed' };
    }
  }

  // STEP 5: AI estimation (LAST RESORT)
  console.warn(`AI fallback for: ${descriptor.name}`);
  const aiResult = await estimateWithAI(descriptor);
  // Don't cache AI estimates (or use short TTL)
  return { ...aiResult, source: 'ai', confidence: 0.70 };
}

function getFallbackChain(foodType: FoodType): Source[] {
  switch (foodType) {
    case 'whole_food':
      return ['usda', 'edamam', 'openfoodfacts'];
    case 'restaurant_item':
      return ['edamam', 'usda', 'openfoodfacts'];
    case 'branded_packaged':
      return ['edamam', 'openfoodfacts', 'usda'];
    case 'homemade_dish':
      return ['edamam', 'usda'];
    case 'generic_dish':
      return ['edamam', 'usda', 'openfoodfacts'];
  }
}
```

### Hybrid Resolution (Branded/Packaged Foods)

For branded foods, OpenFoodFacts has accurate **macros** (from the label) but incomplete **micros**. USDA has complete micros for generic equivalents.

**Solution**: Merge both sources.

```typescript
async function resolveHybrid(descriptor: NormalizedFoodDescriptor): Promise<ResolutionResult> {
  // Step 1: Get exact brand macros from OpenFoodFacts
  const offResult = await openFoodFactsLookup(descriptor.name);

  if (!offResult) {
    return null; // Fall through to next source
  }

  // Step 2: Extract generic food type
  const genericName = extractGenericFoodType(descriptor.name);
  // "KIND Dark Chocolate Nuts Bar" → "chocolate nut bar"

  // Step 3: Get complete micros from USDA
  const usdaResult = await usdaLookup(genericName);

  if (!usdaResult) {
    // Return OFF data with incomplete micros
    return { nutrition: offResult, source: 'openfoodfacts', confidence: 0.80 };
  }

  // Step 4: Merge - brand macros + scaled USDA micros
  const merged = mergeNutrition(offResult, usdaResult, descriptor.estimatedGrams);

  return { nutrition: merged, source: 'hybrid', confidence: 0.90 };
}

function mergeNutrition(
  brandData: Partial<CompleteNutrition>,   // OpenFoodFacts
  usdaData: CompleteNutrition,              // USDA per 100g
  servingGrams: number
): CompleteNutrition {
  const scaleFactor = servingGrams / 100;

  return {
    // FROM BRAND (exact label values)
    calories: brandData.calories!,
    protein: brandData.protein!,
    carbs: brandData.carbs!,
    fat: brandData.fat!,
    fiber: brandData.fiber ?? usdaData.fiber * scaleFactor,
    sugar: brandData.sugar ?? usdaData.sugar * scaleFactor,
    sodium: brandData.sodium!,
    saturatedFat: brandData.saturatedFat ?? usdaData.saturatedFat * scaleFactor,
    transFat: brandData.transFat ?? usdaData.transFat * scaleFactor,

    // FROM USDA (scaled generic micros)
    cholesterol: brandData.cholesterol ?? usdaData.cholesterol * scaleFactor,
    potassium: brandData.potassium ?? usdaData.potassium * scaleFactor,
    calcium: brandData.calcium ?? usdaData.calcium * scaleFactor,
    iron: brandData.iron ?? usdaData.iron * scaleFactor,
    magnesium: usdaData.magnesium * scaleFactor,
    zinc: usdaData.zinc * scaleFactor,
    phosphorus: usdaData.phosphorus * scaleFactor,
    vitaminA: usdaData.vitaminA * scaleFactor,
    vitaminC: usdaData.vitaminC * scaleFactor,
    vitaminD: brandData.vitaminD ?? usdaData.vitaminD * scaleFactor,
    vitaminE: usdaData.vitaminE * scaleFactor,
    vitaminK: usdaData.vitaminK * scaleFactor,
    thiamin: usdaData.thiamin * scaleFactor,
    riboflavin: usdaData.riboflavin * scaleFactor,
    niacin: usdaData.niacin * scaleFactor,
    vitaminB6: usdaData.vitaminB6 * scaleFactor,
    folate: usdaData.folate * scaleFactor,
    vitaminB12: usdaData.vitaminB12 * scaleFactor,
    // ... remaining nutrients
  };
}

function extractGenericFoodType(brandedName: string): string {
  let generic = brandedName.toLowerCase();

  // Remove brand names
  const brands = ['kind', 'clif', 'rxbar', 'larabar', 'cheerios', 'kellogg',
                  'nestle', 'kraft', 'pepsi', 'coca-cola', 'frito-lay'];
  for (const brand of brands) {
    generic = generic.replace(new RegExp(`\\b${brand}['s]*\\b`, 'gi'), '');
  }

  // Remove marketing words
  const marketingWords = ['original', 'classic', 'new', 'improved', 'natural',
                          'organic', 'premium', 'artisan', 'homestyle'];
  for (const word of marketingWords) {
    generic = generic.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  }

  // Simplify
  generic = generic
    .replace(/dark chocolate/gi, 'chocolate')
    .replace(/milk chocolate/gi, 'chocolate')
    .replace(/sea salt/gi, '')
    .replace(/&/g, 'and')
    .replace(/\s+/g, ' ')
    .trim();

  return generic;
}
```

### Batch Resolution (For Ingredients)

When decomposing a composite dish, resolve all ingredients efficiently using batch queries:

```typescript
async function resolveByDecomposition(
  ingredients: { name: string; estimatedGrams: number }[]
): Promise<ResolutionResult | null> {
  const resolved = new Map<string, CompleteNutrition>();
  let remaining = [...ingredients];

  // STEP 1: Batch cache lookup (FREE, instant)
  const cacheResults = await batchCacheGet(remaining.map(i => i.name));
  for (const ingredient of remaining) {
    if (cacheResults.has(ingredient.name)) {
      resolved.set(ingredient.name, scaleNutrition(
        cacheResults.get(ingredient.name)!,
        ingredient.estimatedGrams
      ));
    }
  }
  remaining = remaining.filter(i => !resolved.has(i.name));
  if (remaining.length === 0) return sumNutrition(resolved);

  // STEP 2: USDA + OpenFoodFacts in PARALLEL (FREE)
  const [usdaResults, offResults] = await Promise.all([
    batchUSDALookup(remaining.map(i => i.name)),
    batchOpenFoodFactsLookup(remaining.map(i => i.name))
  ]);

  for (const ingredient of remaining) {
    const usdaMatch = findBestMatch(ingredient.name, usdaResults);
    const offMatch = findBestMatch(ingredient.name, offResults);

    if (usdaMatch?.confidence > 0.8) {
      resolved.set(ingredient.name, scaleNutrition(usdaMatch.nutrition, ingredient.estimatedGrams));
      await cacheSet(ingredient.name, usdaMatch.nutrition);
    } else if (offMatch?.confidence > 0.7) {
      resolved.set(ingredient.name, scaleNutrition(offMatch.nutrition, ingredient.estimatedGrams));
      await cacheSet(ingredient.name, offMatch.nutrition);
    }
  }
  remaining = remaining.filter(i => !resolved.has(i.name));
  if (remaining.length === 0) return sumNutrition(resolved);

  // STEP 3: Edamam for remaining (PAID, parallel)
  const edamamResults = await Promise.all(
    remaining.map(i => edamamLookup(i.name))
  );

  for (let idx = 0; idx < remaining.length; idx++) {
    const ingredient = remaining[idx];
    const match = edamamResults[idx];
    if (match?.confidence > 0.75) {
      resolved.set(ingredient.name, scaleNutrition(match.nutrition, ingredient.estimatedGrams));
      await cacheSet(ingredient.name, match.nutrition);
    }
  }
  remaining = remaining.filter(i => !resolved.has(i.name));

  // STEP 4: AI for stragglers (LAST RESORT)
  if (remaining.length > 0) {
    console.warn(`AI fallback for ${remaining.length} ingredients:`, remaining.map(i => i.name));
    const aiResults = await batchAIEstimate(remaining);
    for (const result of aiResults) {
      resolved.set(result.name, result.nutrition);
    }
  }

  return sumNutrition(resolved);
}

function sumNutrition(items: Map<string, CompleteNutrition>): ResolutionResult {
  const total: CompleteNutrition = {
    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0,
    saturatedFat: 0, transFat: 0, monounsaturatedFat: 0, polyunsaturatedFat: 0,
    cholesterol: 0, potassium: 0, calcium: 0, iron: 0, magnesium: 0,
    zinc: 0, phosphorus: 0, vitaminA: 0, vitaminD: 0, vitaminE: 0, vitaminK: 0,
    vitaminC: 0, thiamin: 0, riboflavin: 0, niacin: 0, vitaminB6: 0,
    folate: 0, vitaminB12: 0,
  };

  for (const nutrition of items.values()) {
    for (const [key, value] of Object.entries(nutrition)) {
      if (typeof value === 'number') {
        (total as any)[key] += value;
      }
    }
  }

  // Round values
  for (const key of Object.keys(total)) {
    (total as any)[key] = Math.round((total as any)[key] * 10) / 10;
  }

  return { nutrition: total, source: 'decomposed', confidence: 0.85 };
}
```

### API Integration Details

#### USDA FoodData Central
```typescript
const USDA_API_KEY = process.env.USDA_API_KEY;
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

async function usdaLookup(foodName: string): Promise<NutritionMatch | null> {
  const response = await fetch(
    `${USDA_BASE_URL}/foods/search?query=${encodeURIComponent(foodName)}&api_key=${USDA_API_KEY}&pageSize=5`
  );
  const data = await response.json();

  if (!data.foods?.length) return null;

  // Find best match
  const best = data.foods[0];
  const nutrition = mapUSDAToNutrition(best.foodNutrients);

  return {
    nutrition,
    confidence: calculateMatchConfidence(foodName, best.description),
  };
}

async function batchUSDALookup(names: string[]): Promise<Map<string, NutritionMatch>> {
  // Run searches in parallel
  const results = await Promise.all(names.map(name => usdaLookup(name)));

  const map = new Map();
  names.forEach((name, idx) => {
    if (results[idx]) map.set(name, results[idx]);
  });
  return map;
}
```

#### Edamam Food Database
```typescript
const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;
const EDAMAM_BASE_URL = 'https://api.edamam.com/api/food-database/v2';

async function edamamLookup(foodName: string): Promise<NutritionMatch | null> {
  const response = await fetch(
    `${EDAMAM_BASE_URL}/parser?ingr=${encodeURIComponent(foodName)}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`
  );
  const data = await response.json();

  if (!data.parsed?.length && !data.hints?.length) return null;

  // Prefer parsed (exact match) over hints (fuzzy)
  const match = data.parsed?.[0]?.food || data.hints?.[0]?.food;
  if (!match) return null;

  const nutrition = mapEdamamToNutrition(match.nutrients);

  return {
    nutrition,
    confidence: data.parsed?.length ? 0.95 : 0.80,
  };
}
```

#### OpenFoodFacts
```typescript
const OFF_BASE_URL = 'https://world.openfoodfacts.org/api/v0';

async function openFoodFactsLookup(foodName: string): Promise<NutritionMatch | null> {
  const response = await fetch(
    `${OFF_BASE_URL}/search?search_terms=${encodeURIComponent(foodName)}&json=1&page_size=5`
  );
  const data = await response.json();

  if (!data.products?.length) return null;

  const product = data.products[0];
  const nutrition = mapOFFToNutrition(product.nutriments);

  return {
    nutrition,
    confidence: 0.85,
  };
}
```

### Resolution Confidence Levels

| Source | Confidence | Rationale |
|--------|------------|-----------|
| Cache | 0.98 | Previously validated |
| USDA (exact match) | 0.95 | Lab-tested, authoritative |
| USDA (fuzzy match) | 0.85 | Good approximation |
| Edamam (parsed) | 0.95 | Exact product match |
| Edamam (hint) | 0.80 | Fuzzy match |
| OpenFoodFacts | 0.85 | User-contributed but verified |
| Hybrid (OFF + USDA) | 0.90 | Brand macros + generic micros |
| Decomposed | 0.85 | Sum of resolved ingredients |
| AI Estimation | 0.70 | Last resort, less reliable |

---

## 4. GI Enrichment Layer

The GI Enrichment Layer adds glycemic impact data to resolved nutrition. This is critical for blood sugar management and several focus grades. **No AI is used** - all data comes from a pre-loaded database.

### Why GI Needs a Database

Unlike macronutrients and micronutrients, **Glycemic Index cannot be calculated from other values**. It must be measured experimentally by feeding foods to human subjects and measuring blood glucose response.

The gold standard source is the **Sydney University Glycemic Index Database** (~4,000 tested foods).

### Database Design

```typescript
// Firestore collection: glycemicIndex
interface GIRecord {
  name: string;              // "white rice, boiled"
  gi: number;                // 73
  servingSizeGrams: number;  // 150
  carbsPerServing: number;   // 40
  source: 'sydney' | 'fao' | 'literature';
  testedYear?: number;
  notes?: string;            // "Long-grain, parboiled"

  // For fuzzy matching
  aliases: string[];         // ["white rice", "boiled rice", "steamed rice"]
  category: GICategory;      // 'grains'
}

type GICategory =
  | 'grains'          // rice, bread, pasta
  | 'legumes'         // beans, lentils
  | 'fruits'          // apples, bananas
  | 'vegetables'      // carrots, potatoes
  | 'dairy'           // milk, yogurt
  | 'snacks'          // chips, crackers
  | 'beverages'       // juice, soda
  | 'mixed_meals';    // pizza, sandwiches
```

### Pre-Loading Strategy

Load all 4,000 GI values into Firestore once, with fallback categories for unknown foods:

```typescript
// GI Category Fallbacks (when exact match not found)
const GI_CATEGORY_DEFAULTS: Record<string, number> = {
  'grains_refined': 72,      // white bread, white rice
  'grains_whole': 55,        // brown rice, whole wheat
  'legumes': 32,             // beans, lentils (generally low)
  'fruits_tropical': 65,     // mango, pineapple
  'fruits_temperate': 45,    // apple, pear
  'vegetables_root': 75,     // potato, parsnip
  'vegetables_green': 15,    // broccoli, spinach
  'dairy': 35,               // milk, yogurt
  'meat_fish': 0,            // no carbs = no GI
  'nuts_seeds': 15,          // almonds, walnuts
};
```

### GI Lookup Algorithm

```typescript
interface GIResult {
  gi: number;
  gl: number;              // Glycemic Load
  source: 'exact' | 'fuzzy' | 'category' | 'default';
  confidence: number;
}

async function lookupGI(
  foodName: string,
  carbsGrams: number
): Promise<GIResult> {
  // STEP 1: Exact match
  const exactMatch = await giCollection
    .where('name', '==', foodName.toLowerCase())
    .limit(1)
    .get();

  if (!exactMatch.empty) {
    const gi = exactMatch.docs[0].data().gi;
    return {
      gi,
      gl: calculateGL(gi, carbsGrams),
      source: 'exact',
      confidence: 0.98,
    };
  }

  // STEP 2: Alias match
  const aliasMatch = await giCollection
    .where('aliases', 'array-contains', foodName.toLowerCase())
    .limit(1)
    .get();

  if (!aliasMatch.empty) {
    const gi = aliasMatch.docs[0].data().gi;
    return {
      gi,
      gl: calculateGL(gi, carbsGrams),
      source: 'fuzzy',
      confidence: 0.90,
    };
  }

  // STEP 3: Fuzzy search with Levenshtein distance
  const fuzzyMatch = await fuzzySearchGI(foodName);
  if (fuzzyMatch && fuzzyMatch.score > 0.75) {
    return {
      gi: fuzzyMatch.gi,
      gl: calculateGL(fuzzyMatch.gi, carbsGrams),
      source: 'fuzzy',
      confidence: fuzzyMatch.score,
    };
  }

  // STEP 4: Category-based default
  const category = classifyFoodCategory(foodName);
  const defaultGI = GI_CATEGORY_DEFAULTS[category] ?? 50;

  return {
    gi: defaultGI,
    gl: calculateGL(defaultGI, carbsGrams),
    source: 'category',
    confidence: 0.60,
  };
}

/**
 * Glycemic Load = (GI × carbs in grams) / 100
 * GL < 10 = Low
 * GL 10-20 = Medium
 * GL > 20 = High
 */
function calculateGL(gi: number, carbsGrams: number): number {
  return Math.round((gi * carbsGrams) / 100);
}
```

### Meal GI Calculation

For meals with multiple foods, calculate weighted average GI by carbohydrate contribution:

```typescript
interface FoodWithGI {
  name: string;
  carbsGrams: number;
  gi: number;
}

function calculateMealGI(foods: FoodWithGI[]): { mealGI: number; mealGL: number } {
  const totalCarbs = foods.reduce((sum, f) => sum + f.carbsGrams, 0);

  if (totalCarbs === 0) {
    return { mealGI: 0, mealGL: 0 };  // No carb meal
  }

  // Weighted average: each food's GI × its carb contribution
  let weightedSum = 0;
  for (const food of foods) {
    const carbContribution = food.carbsGrams / totalCarbs;
    weightedSum += food.gi * carbContribution;
  }

  const mealGI = Math.round(weightedSum);
  const mealGL = Math.round((mealGI * totalCarbs) / 100);

  return { mealGI, mealGL };
}

// Example:
// White rice (150g carbs from 200g rice, GI=73)
// Grilled chicken (0g carbs, GI=0)
// Steamed broccoli (5g carbs, GI=15)
// Total carbs: 155g
// Weighted GI: (73 × 150/155) + (0 × 0/155) + (15 × 5/155) = 70.7 + 0 + 0.5 = 71.2
// Meal GI: 71
// Meal GL: (71 × 155) / 100 = 110 (High)
```

### GI Classification Bands

```typescript
type GIBand = 'low' | 'medium' | 'high';
type GLBand = 'low' | 'medium' | 'high';

function classifyGI(gi: number): GIBand {
  if (gi <= 55) return 'low';
  if (gi <= 69) return 'medium';
  return 'high';
}

function classifyGL(gl: number): GLBand {
  if (gl < 10) return 'low';
  if (gl <= 20) return 'medium';
  return 'high';
}
```

### Output Structure

```typescript
interface GIEnrichment {
  // Per-food GI
  gi: number;                // 73
  giBand: GIBand;            // "high"
  giSource: 'exact' | 'fuzzy' | 'category' | 'default';
  giConfidence: number;      // 0.98

  // Per-food GL (based on actual portion)
  gl: number;                // 29
  glBand: GLBand;            // "high"
}

// Added to CompleteNutrition
interface EnrichedNutrition extends CompleteNutrition {
  gi?: number;
  gl?: number;
  giBand?: GIBand;
  glBand?: GLBand;
}
```

### Database Seeding

One-time script to import Sydney University GI data:

```typescript
async function seedGIDatabase(): Promise<void> {
  // Sydney University GI Database CSV format:
  // Food Name, GI, Serving Size (g), Carbs per serving (g), Source

  const csvData = await loadSydneyGICSV();
  const batch = db.batch();

  for (const row of csvData) {
    const docRef = giCollection.doc();
    batch.set(docRef, {
      name: row.foodName.toLowerCase(),
      gi: parseInt(row.gi),
      servingSizeGrams: parseInt(row.servingSize),
      carbsPerServing: parseFloat(row.carbsPerServing),
      source: 'sydney',
      aliases: generateAliases(row.foodName),
      category: classifyGICategory(row.foodName),
      createdAt: new Date(),
    });
  }

  await batch.commit();
  console.log(`Seeded ${csvData.length} GI records`);
}

function generateAliases(foodName: string): string[] {
  const name = foodName.toLowerCase();
  const aliases = [name];

  // Add variations
  if (name.includes('cooked')) {
    aliases.push(name.replace('cooked', '').trim());
    aliases.push(name.replace('cooked', 'boiled').trim());
  }
  if (name.includes('white')) {
    aliases.push(name.replace('white', '').trim());
  }
  if (name.includes('bread')) {
    aliases.push(name.replace(',', '').trim());
  }

  return [...new Set(aliases)];
}
```

---

## 5. Grading Layer

The Grading Layer transforms nutrition data into meaningful health assessments. **All grading is deterministic** - using formulas and thresholds from scientific sources. No AI is involved.

### Grade Types

| Grade Type | Purpose | Algorithm Source |
|------------|---------|------------------|
| **Overall Grade** | General nutritional quality (A-F) | Nutri-Score (EU standard) |
| **Focus Grades** | 10 wellness focus areas (A-F each) | DRI/AHA/WHO thresholds |
| **Satiety Score** | How filling is the food? (0-100) | Holt Satiety Index (1995) |
| **Inflammatory Index** | Pro/anti-inflammatory rating | Dietary Inflammatory Index (DII) |

### 5.1 Overall Grade: Nutri-Score Algorithm

Nutri-Score is the European Union's food quality scoring system. It produces a letter grade (A-F) based on positive and negative nutritional factors.

```typescript
type NutriScoreGrade = 'A' | 'B' | 'C' | 'D' | 'E';

interface NutriScoreResult {
  grade: NutriScoreGrade;
  score: number;           // -15 to +40
  negativePoints: number;  // 0-40
  positivePoints: number;  // 0-15
}

function calculateNutriScore(nutrition: CompleteNutrition): NutriScoreResult {
  // All values per 100g
  const per100g = normalizeTo100g(nutrition);

  // NEGATIVE POINTS (0-40)
  const energyPoints = getEnergyPoints(per100g.calories);           // 0-10
  const sugarPoints = getSugarPoints(per100g.sugar);                // 0-10
  const saturatedFatPoints = getSaturatedFatPoints(per100g.saturatedFat); // 0-10
  const sodiumPoints = getSodiumPoints(per100g.sodium);             // 0-10

  const negativePoints = energyPoints + sugarPoints + saturatedFatPoints + sodiumPoints;

  // POSITIVE POINTS (0-15)
  const fiberPoints = getFiberPoints(per100g.fiber);                // 0-5
  const proteinPoints = getProteinPoints(per100g.protein);          // 0-5
  // Note: Fruit/vegetable % not available from nutrition alone
  const fruitVegPoints = estimateFruitVegPoints(nutrition);         // 0-5

  const positivePoints = fiberPoints + proteinPoints + fruitVegPoints;

  // FINAL SCORE
  // If negative >= 11 and fruitVegPoints < 5, don't count protein
  let score: number;
  if (negativePoints >= 11 && fruitVegPoints < 5) {
    score = negativePoints - (fiberPoints + fruitVegPoints);
  } else {
    score = negativePoints - positivePoints;
  }

  // GRADE
  const grade = scoreToGrade(score);

  return { grade, score, negativePoints, positivePoints };
}

// Nutri-Score thresholds (per 100g)
function getEnergyPoints(kcal: number): number {
  if (kcal <= 80) return 0;
  if (kcal <= 160) return 1;
  if (kcal <= 240) return 2;
  if (kcal <= 320) return 3;
  if (kcal <= 400) return 4;
  if (kcal <= 480) return 5;
  if (kcal <= 560) return 6;
  if (kcal <= 640) return 7;
  if (kcal <= 720) return 8;
  if (kcal <= 800) return 9;
  return 10;
}

function getSugarPoints(sugar: number): number {
  if (sugar <= 4.5) return 0;
  if (sugar <= 9) return 1;
  if (sugar <= 13.5) return 2;
  if (sugar <= 18) return 3;
  if (sugar <= 22.5) return 4;
  if (sugar <= 27) return 5;
  if (sugar <= 31) return 6;
  if (sugar <= 36) return 7;
  if (sugar <= 40) return 8;
  if (sugar <= 45) return 9;
  return 10;
}

function getSaturatedFatPoints(satFat: number): number {
  if (satFat <= 1) return 0;
  if (satFat <= 2) return 1;
  if (satFat <= 3) return 2;
  if (satFat <= 4) return 3;
  if (satFat <= 5) return 4;
  if (satFat <= 6) return 5;
  if (satFat <= 7) return 6;
  if (satFat <= 8) return 7;
  if (satFat <= 9) return 8;
  if (satFat <= 10) return 9;
  return 10;
}

function getSodiumPoints(sodium: number): number {
  if (sodium <= 90) return 0;
  if (sodium <= 180) return 1;
  if (sodium <= 270) return 2;
  if (sodium <= 360) return 3;
  if (sodium <= 450) return 4;
  if (sodium <= 540) return 5;
  if (sodium <= 630) return 6;
  if (sodium <= 720) return 7;
  if (sodium <= 810) return 8;
  if (sodium <= 900) return 9;
  return 10;
}

function getFiberPoints(fiber: number): number {
  if (fiber <= 0.9) return 0;
  if (fiber <= 1.9) return 1;
  if (fiber <= 2.8) return 2;
  if (fiber <= 3.7) return 3;
  if (fiber <= 4.7) return 4;
  return 5;
}

function getProteinPoints(protein: number): number {
  if (protein <= 1.6) return 0;
  if (protein <= 3.2) return 1;
  if (protein <= 4.8) return 2;
  if (protein <= 6.4) return 3;
  if (protein <= 8.0) return 4;
  return 5;
}

function scoreToGrade(score: number): NutriScoreGrade {
  if (score <= -1) return 'A';
  if (score <= 2) return 'B';
  if (score <= 10) return 'C';
  if (score <= 18) return 'D';
  return 'E';
}
```

### 5.2 Focus Grades: DRI/AHA/WHO Threshold-Based

Each of the 10 wellness focuses has a custom grading formula based on relevant nutrients and scientific thresholds.

```typescript
type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'F';

interface FocusGradeResult {
  grade: HealthGrade;
  score: number;        // 0-100
  insight: string;
  pros: string[];
  cons: string[];
}

const WELLNESS_FOCUSES = [
  'balanced',           // Overall balanced nutrition
  'heart_health',       // Cardiovascular focus
  'blood_sugar',        // Glycemic management
  'weight_loss',        // Calorie/satiety optimization
  'muscle_building',    // Protein/amino acids
  'energy',             // Energy & endurance
  'gut_health',         // Digestive wellness
  'brain',              // Cognitive function
  'bone_joint',         // Skeletal health
  'immunity',           // Immune system support
] as const;

type WellnessFocus = typeof WELLNESS_FOCUSES[number];
```

#### Heart Health Grading

Based on AHA (American Heart Association) guidelines:

```typescript
function gradeHeartHealth(n: CompleteNutrition, gi?: number): FocusGradeResult {
  let score = 50; // Start neutral
  const pros: string[] = [];
  const cons: string[] = [];

  // Saturated Fat: AHA recommends <6% of calories
  const satFatCalPct = (n.saturatedFat * 9) / n.calories * 100;
  if (satFatCalPct < 6) {
    score += 15;
    pros.push('Low saturated fat');
  } else if (satFatCalPct > 10) {
    score -= 20;
    cons.push('High saturated fat');
  }

  // Trans Fat: Should be 0
  if (n.transFat === 0) {
    score += 10;
    pros.push('No trans fat');
  } else if (n.transFat > 0.5) {
    score -= 25;
    cons.push('Contains trans fat');
  }

  // Sodium: AHA limit 2,300mg/day, ideal <1,500mg
  const sodiumPctDV = (n.sodium / 2300) * 100;
  if (sodiumPctDV < 10) {
    score += 15;
    pros.push('Very low sodium');
  } else if (sodiumPctDV > 30) {
    score -= 15;
    cons.push('High sodium');
  }

  // Fiber: 25-30g/day goal
  const fiberPctDV = (n.fiber / 28) * 100;
  if (fiberPctDV > 20) {
    score += 15;
    pros.push('Good fiber content');
  }

  // Potassium: 4,700mg/day (heart-protective)
  const potassiumPctDV = (n.potassium / 4700) * 100;
  if (potassiumPctDV > 15) {
    score += 10;
    pros.push('Good potassium');
  }

  // Omega-3 (from fat profile) - if poly > mono suggests omega-3
  if (n.polyunsaturatedFat > n.saturatedFat) {
    score += 10;
    pros.push('Favorable fat profile');
  }

  return {
    grade: scoreToHealthGrade(score),
    score: Math.min(100, Math.max(0, score)),
    insight: generateHeartInsight(score, pros, cons),
    pros,
    cons,
  };
}

function scoreToHealthGrade(score: number): HealthGrade {
  if (score >= 80) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  if (score >= 35) return 'D';
  return 'F';
}
```

#### Blood Sugar Grading

Based on glycemic impact and ADA (American Diabetes Association) guidelines:

```typescript
function gradeBloodSugar(n: CompleteNutrition, gi?: number, gl?: number): FocusGradeResult {
  let score = 50;
  const pros: string[] = [];
  const cons: string[] = [];

  // Glycemic Index (critical factor)
  if (gi !== undefined) {
    if (gi <= 55) {
      score += 25;
      pros.push('Low glycemic index');
    } else if (gi <= 69) {
      score += 5;
    } else {
      score -= 20;
      cons.push('High glycemic index');
    }
  }

  // Glycemic Load
  if (gl !== undefined) {
    if (gl < 10) {
      score += 15;
      pros.push('Low glycemic load');
    } else if (gl > 20) {
      score -= 15;
      cons.push('High glycemic load');
    }
  }

  // Fiber slows glucose absorption
  const fiberRatio = n.fiber / n.carbs;
  if (fiberRatio > 0.1) {
    score += 15;
    pros.push('High fiber-to-carb ratio');
  } else if (fiberRatio < 0.03 && n.carbs > 20) {
    score -= 10;
    cons.push('Low fiber relative to carbs');
  }

  // Sugar content
  const sugarRatio = n.sugar / n.carbs;
  if (sugarRatio > 0.5) {
    score -= 20;
    cons.push('High sugar content');
  } else if (sugarRatio < 0.2) {
    score += 10;
    pros.push('Low sugar');
  }

  // Protein helps stabilize blood sugar
  if (n.protein > 15) {
    score += 10;
    pros.push('Protein helps stabilize glucose');
  }

  // Chromium (helps insulin sensitivity)
  if (n.chromium && n.chromium > 10) {
    score += 5;
    pros.push('Contains chromium');
  }

  return {
    grade: scoreToHealthGrade(score),
    score: Math.min(100, Math.max(0, score)),
    insight: generateBloodSugarInsight(score, gi, gl),
    pros,
    cons,
  };
}
```

#### Weight Loss Grading

Based on caloric density, satiety research, and protein leverage hypothesis:

```typescript
function gradeWeightLoss(n: CompleteNutrition, satietyScore?: number): FocusGradeResult {
  let score = 50;
  const pros: string[] = [];
  const cons: string[] = [];

  // Caloric density: calories per gram
  // Low: <1.0, Medium: 1.0-2.25, High: >2.25
  const caloricDensity = n.calories / (n.protein + n.carbs + n.fat + n.fiber);
  if (caloricDensity < 1.0) {
    score += 20;
    pros.push('Low caloric density');
  } else if (caloricDensity > 2.5) {
    score -= 20;
    cons.push('High caloric density');
  }

  // Protein % of calories (protein leverage - higher protein = more satiety)
  const proteinCalPct = (n.protein * 4) / n.calories * 100;
  if (proteinCalPct > 30) {
    score += 20;
    pros.push('High protein percentage');
  } else if (proteinCalPct > 20) {
    score += 10;
    pros.push('Good protein content');
  } else if (proteinCalPct < 10) {
    score -= 10;
    cons.push('Low protein');
  }

  // Fiber (increases satiety, reduces absorption)
  if (n.fiber > 8) {
    score += 15;
    pros.push('High fiber');
  } else if (n.fiber < 2) {
    score -= 10;
    cons.push('Low fiber');
  }

  // Satiety Score (if available from Holt formula)
  if (satietyScore !== undefined) {
    if (satietyScore > 150) {
      score += 15;
      pros.push('Very filling');
    } else if (satietyScore < 80) {
      score -= 15;
      cons.push('Not very filling');
    }
  }

  // Added sugars (empty calories)
  if (n.sugar > 15) {
    score -= 15;
    cons.push('High sugar');
  }

  return {
    grade: scoreToHealthGrade(score),
    score: Math.min(100, Math.max(0, score)),
    insight: generateWeightLossInsight(score, caloricDensity, proteinCalPct),
    pros,
    cons,
  };
}
```

#### Other Focus Grades (Summary)

```typescript
// Muscle Building: protein quality, leucine content, timing
function gradeMuscleBuilding(n: CompleteNutrition): FocusGradeResult {
  // Key factors: protein (>25g), protein quality, zinc, magnesium
  // DRI: 0.8-1.6g protein per kg body weight
}

// Energy & Endurance: carb quality, B vitamins, iron
function gradeEnergy(n: CompleteNutrition, gi?: number): FocusGradeResult {
  // Key factors: complex carbs, low GI, iron, B12, magnesium
}

// Gut Health: fiber diversity, prebiotics, anti-inflammatory
function gradeGutHealth(n: CompleteNutrition): FocusGradeResult {
  // Key factors: fiber (>25g), diversity, low sugar, probiotics
}

// Brain Health: omega-3, antioxidants, B vitamins, choline
function gradeBrain(n: CompleteNutrition): FocusGradeResult {
  // Key factors: omega-3 (poly fat), B12, folate, choline, antioxidants
}

// Bone & Joint: calcium, vitamin D, vitamin K, magnesium
function gradeBoneJoint(n: CompleteNutrition): FocusGradeResult {
  // Key factors: calcium (>300mg), vitamin D, vitamin K, phosphorus
}

// Immunity: vitamins C/D/E, zinc, antioxidants
function gradeImmunity(n: CompleteNutrition): FocusGradeResult {
  // Key factors: vitamin C, vitamin D, zinc, vitamin E, selenium
}
```

### 5.3 Satiety Score: Holt Satiety Index

Based on Dr. Susanne Holt's 1995 research at University of Sydney:

```typescript
interface SatietyResult {
  score: number;        // 0-200+ (100 = white bread baseline)
  category: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
}

function calculateSatietyScore(n: CompleteNutrition): SatietyResult {
  // Holt's formula coefficients (simplified model)
  // Higher protein, fiber, water content = more filling
  // Higher fat, sugar, caloric density = less filling

  const proteinContrib = n.protein * 2.5;    // Protein is very satiating
  const fiberContrib = n.fiber * 3.0;        // Fiber increases bulk
  const waterContrib = estimateWaterContent(n) * 0.5;

  const fatPenalty = n.fat * 0.8;            // Fat less satiating per calorie
  const sugarPenalty = n.sugar * 1.2;        // Sugar causes rapid hunger return
  const densityPenalty = (n.calories / 100) * 0.5; // Dense foods less filling

  // Base score of 100 (white bread = reference)
  const score = Math.round(
    100 + proteinContrib + fiberContrib + waterContrib
        - fatPenalty - sugarPenalty - densityPenalty
  );

  return {
    score: Math.max(0, score),
    category: categorizeSatiety(score),
  };
}

function categorizeSatiety(score: number): SatietyResult['category'] {
  if (score >= 150) return 'very_high';   // Boiled potatoes: 323
  if (score >= 120) return 'high';        // Fish: 225, Oatmeal: 209
  if (score >= 90) return 'moderate';     // White bread: 100
  if (score >= 60) return 'low';          // Donuts: 68
  return 'very_low';                      // Croissant: 47, Cake: 65
}

function estimateWaterContent(n: CompleteNutrition): number {
  // Estimate water from macros (rough approximation)
  const solidMass = n.protein + n.carbs + n.fat + n.fiber;
  const totalMass = 100; // Assuming per 100g
  return Math.max(0, totalMass - solidMass);
}
```

### 5.4 Inflammatory Index: DII Coefficients

Based on the Dietary Inflammatory Index research:

```typescript
interface InflammatoryResult {
  index: number;           // Negative = anti-inflammatory, Positive = pro-inflammatory
  category: 'anti_inflammatory' | 'neutral' | 'mildly_inflammatory' | 'inflammatory';
}

// DII coefficients from peer-reviewed research
const DII_COEFFICIENTS: Record<string, number> = {
  fiber: -0.663,           // Anti-inflammatory
  vitaminC: -0.424,
  vitaminE: -0.419,
  vitaminD: -0.446,
  magnesium: -0.484,
  zinc: -0.313,
  omega3: -0.436,          // Polyunsaturated proxy

  saturatedFat: 0.373,     // Pro-inflammatory
  transFat: 0.229,
  cholesterol: 0.110,
  sugar: 0.117,            // Added sugars
};

function calculateInflammatoryIndex(n: CompleteNutrition): InflammatoryResult {
  let index = 0;

  // Anti-inflammatory nutrients
  index += (n.fiber / 28) * DII_COEFFICIENTS.fiber;
  index += (n.vitaminC / 90) * DII_COEFFICIENTS.vitaminC;
  index += (n.vitaminE / 15) * DII_COEFFICIENTS.vitaminE;
  index += (n.vitaminD / 20) * DII_COEFFICIENTS.vitaminD;
  index += (n.magnesium / 420) * DII_COEFFICIENTS.magnesium;
  index += (n.zinc / 11) * DII_COEFFICIENTS.zinc;
  index += (n.polyunsaturatedFat / 10) * DII_COEFFICIENTS.omega3;

  // Pro-inflammatory nutrients
  index += (n.saturatedFat / 20) * DII_COEFFICIENTS.saturatedFat;
  index += (n.transFat / 2) * DII_COEFFICIENTS.transFat;
  index += (n.cholesterol / 300) * DII_COEFFICIENTS.cholesterol;
  index += (n.sugar / 50) * DII_COEFFICIENTS.sugar;

  return {
    index: Math.round(index * 100) / 100,
    category: categorizeInflammation(index),
  };
}

function categorizeInflammation(index: number): InflammatoryResult['category'] {
  if (index < -0.5) return 'anti_inflammatory';
  if (index < 0.5) return 'neutral';
  if (index < 1.5) return 'mildly_inflammatory';
  return 'inflammatory';
}
```

### 5.5 Complete Grading Output

```typescript
interface CompleteGradingResult {
  // Overall
  overall: {
    grade: NutriScoreGrade;
    score: number;
  };

  // Focus Grades
  focusGrades: Record<WellnessFocus, FocusGradeResult>;

  // Additional Scores
  satiety: SatietyResult;
  inflammatory: InflammatoryResult;

  // Metadata
  gradedAt: Date;
  version: string;
}

async function gradeFood(
  nutrition: CompleteNutrition,
  gi?: number,
  gl?: number
): Promise<CompleteGradingResult> {
  const satiety = calculateSatietyScore(nutrition);

  return {
    overall: calculateNutriScore(nutrition),
    focusGrades: {
      balanced: calculateNutriScore(nutrition), // Reuse overall
      heart_health: gradeHeartHealth(nutrition, gi),
      blood_sugar: gradeBloodSugar(nutrition, gi, gl),
      weight_loss: gradeWeightLoss(nutrition, satiety.score),
      muscle_building: gradeMuscleBuilding(nutrition),
      energy: gradeEnergy(nutrition, gi),
      gut_health: gradeGutHealth(nutrition),
      brain: gradeBrain(nutrition),
      bone_joint: gradeBoneJoint(nutrition),
      immunity: gradeImmunity(nutrition),
    },
    satiety,
    inflammatory: calculateInflammatoryIndex(nutrition),
    gradedAt: new Date(),
    version: '2.0.0',
  };
}
```

---

## 6. Comparison Layer

The Comparison Layer enables users to compare multiple foods and get actionable insights. This layer uses **one optional AI call** to synthesize insights, but the AI is **anchored to deterministic facts** - it cannot override grades or winners.

### Entry Points to Comparison

Comparison can be triggered from three routes:

```
┌─────────────────────────────────────────────────┐
│           COMPARISON ENTRY POINTS               │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. Comparison AI (dedicated)                   │
│     User: "Compare oatmeal vs eggs for energy"  │
│                                                 │
│  2. Menu AI → Select items → Compare            │
│     User photographs menu, selects 2+ items     │
│                                                 │
│  3. Photo/Text AI → Add to compare              │
│     User analyzes multiple foods sequentially   │
│                                                 │
└─────────────────────────────────────────────────┘
                        │
                        ▼
         ┌──────────────────────────┐
         │   All foods resolved &   │
         │   graded (Layers 2-5)    │
         └──────────────────────────┘
                        │
                        ▼
         ┌──────────────────────────┐
         │   Deterministic          │
         │   Winner Selection       │
         └──────────────────────────┘
                        │
                        ▼
         ┌──────────────────────────┐
         │   AI Insight Generation  │
         │   (Anchored to facts)    │
         └──────────────────────────┘
```

### Deterministic Winner Selection

Winners are determined by formulas, not AI:

```typescript
interface ComparedFood {
  id: string;
  name: string;
  nutrition: CompleteNutrition;
  grading: CompleteGradingResult;
  gi?: number;
  gl?: number;
}

interface ComparisonWinner {
  foodId: string;
  foodName: string;
  margin: 'decisive' | 'moderate' | 'slight' | 'tie';
  score: number;
}

interface FocusComparison {
  focus: WellnessFocus;
  winner: ComparisonWinner;
  scores: Record<string, number>;  // foodId → score
  grades: Record<string, HealthGrade>;  // foodId → grade
}

function selectWinner(
  foods: ComparedFood[],
  focus: WellnessFocus
): ComparisonWinner {
  // Get scores for this focus
  const scores = foods.map(f => ({
    id: f.id,
    name: f.name,
    score: f.grading.focusGrades[focus].score,
    grade: f.grading.focusGrades[focus].grade,
  }));

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  const winner = scores[0];
  const runnerUp = scores[1];
  const margin = winner.score - runnerUp.score;

  // Determine margin category
  let marginCategory: ComparisonWinner['margin'];
  if (margin === 0) {
    marginCategory = 'tie';
  } else if (margin >= 25) {
    marginCategory = 'decisive';
  } else if (margin >= 10) {
    marginCategory = 'moderate';
  } else {
    marginCategory = 'slight';
  }

  return {
    foodId: winner.id,
    foodName: winner.name,
    margin: marginCategory,
    score: winner.score,
  };
}
```

### Deterministic Fact Generation

Before AI insight generation, we compute all facts deterministically:

```typescript
interface DeterministicFacts {
  // Winner info
  overallWinner: ComparisonWinner;
  focusWinners: Record<WellnessFocus, ComparisonWinner>;

  // Nutrient comparisons
  nutrientLeaders: {
    highestProtein: { foodId: string; value: number };
    lowestCalories: { foodId: string; value: number };
    highestFiber: { foodId: string; value: number };
    lowestSodium: { foodId: string; value: number };
    lowestGI: { foodId: string; value: number } | null;
    // ... more as needed
  };

  // Grade summaries
  gradeSummaries: Record<string, {
    overallGrade: string;
    focusGrade: string;
    pros: string[];
    cons: string[];
  }>;

  // Key differences
  significantDifferences: {
    nutrient: string;
    foods: { name: string; value: number }[];
    differencePercent: number;
  }[];
}

function computeDeterministicFacts(
  foods: ComparedFood[],
  userFocus: WellnessFocus
): DeterministicFacts {
  // Compute overall winner
  const overallWinner = selectWinner(foods, 'balanced');

  // Compute focus winners for all focuses
  const focusWinners: Record<WellnessFocus, ComparisonWinner> = {} as any;
  for (const focus of WELLNESS_FOCUSES) {
    focusWinners[focus] = selectWinner(foods, focus);
  }

  // Find nutrient leaders
  const nutrientLeaders = {
    highestProtein: findLeader(foods, 'protein', 'max'),
    lowestCalories: findLeader(foods, 'calories', 'min'),
    highestFiber: findLeader(foods, 'fiber', 'max'),
    lowestSodium: findLeader(foods, 'sodium', 'min'),
    lowestGI: foods.some(f => f.gi !== undefined)
      ? findLeader(foods.filter(f => f.gi !== undefined), 'gi', 'min')
      : null,
  };

  // Compute significant differences (>50% difference)
  const significantDifferences = findSignificantDifferences(foods);

  // Compile grade summaries
  const gradeSummaries: DeterministicFacts['gradeSummaries'] = {};
  for (const food of foods) {
    gradeSummaries[food.id] = {
      overallGrade: food.grading.overall.grade,
      focusGrade: food.grading.focusGrades[userFocus].grade,
      pros: food.grading.focusGrades[userFocus].pros,
      cons: food.grading.focusGrades[userFocus].cons,
    };
  }

  return {
    overallWinner,
    focusWinners,
    nutrientLeaders,
    gradeSummaries,
    significantDifferences,
  };
}

function findLeader(
  foods: ComparedFood[],
  nutrient: keyof CompleteNutrition | 'gi',
  direction: 'min' | 'max'
): { foodId: string; value: number } {
  const sorted = [...foods].sort((a, b) => {
    const aVal = nutrient === 'gi' ? a.gi! : a.nutrition[nutrient as keyof CompleteNutrition];
    const bVal = nutrient === 'gi' ? b.gi! : b.nutrition[nutrient as keyof CompleteNutrition];
    return direction === 'max' ? bVal - aVal : aVal - bVal;
  });

  const leader = sorted[0];
  const value = nutrient === 'gi' ? leader.gi! : leader.nutrition[nutrient as keyof CompleteNutrition];

  return { foodId: leader.id, value };
}
```

### AI Insight Generation (Anchored to Facts)

The AI receives **pre-computed facts** and generates natural language insights. It **cannot change winners or grades**.

```typescript
interface ComparisonInsight {
  summary: string;           // "Oatmeal wins for sustained energy due to its low GI and high fiber."
  winnerExplanation: string; // "Despite having more calories, oatmeal's complex carbs provide..."
  considerations: string[];  // ["Eggs are better if you're watching carbs", ...]
  recommendation: string;    // "For your energy focus, choose oatmeal for breakfast."
}

async function generateComparisonInsights(
  foods: ComparedFood[],
  facts: DeterministicFacts,
  userFocus: WellnessFocus
): Promise<ComparisonInsight> {
  const focusLabel = FOCUS_LABELS[userFocus];
  const winner = facts.focusWinners[userFocus];
  const winnerFood = foods.find(f => f.id === winner.foodId)!;
  const otherFoods = foods.filter(f => f.id !== winner.foodId);

  // Build the anchored prompt
  const prompt = `You are a nutrition advisor helping a user compare foods for their ${focusLabel} goals.

IMPORTANT: You MUST use these pre-computed facts. Do NOT change the winner or grades.

== DETERMINISTIC FACTS (DO NOT OVERRIDE) ==
Winner for ${focusLabel}: ${winner.foodName} (Score: ${winner.score}/100, Grade: ${facts.gradeSummaries[winner.foodId].focusGrade})
Margin: ${winner.margin}

${winnerFood.name} (WINNER):
- Grade: ${facts.gradeSummaries[winner.foodId].focusGrade}
- Strengths: ${facts.gradeSummaries[winner.foodId].pros.join(', ')}
- Concerns: ${facts.gradeSummaries[winner.foodId].cons.join(', ') || 'None'}

${otherFoods.map(f => `${f.name}:
- Grade: ${facts.gradeSummaries[f.id].focusGrade}
- Strengths: ${facts.gradeSummaries[f.id].pros.join(', ')}
- Concerns: ${facts.gradeSummaries[f.id].cons.join(', ') || 'None'}`).join('\n\n')}

Key Nutrient Differences:
${facts.significantDifferences.slice(0, 5).map(d =>
  `- ${d.nutrient}: ${d.foods.map(f => `${f.name}: ${f.value}`).join(' vs ')}`
).join('\n')}

== YOUR TASK ==
Generate helpful insights that EXPLAIN why ${winner.foodName} wins for ${focusLabel}.
Do NOT contradict the facts above. Do NOT suggest a different winner.

Respond in this exact JSON format:
{
  "summary": "One sentence explaining the winner",
  "winnerExplanation": "2-3 sentences explaining WHY this food wins for this focus",
  "considerations": ["When the other option might be better", "Trade-offs to consider"],
  "recommendation": "Actionable advice for the user"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',  // Cost-effective for synthesis
    messages: [
      { role: 'system', content: 'You are a nutrition expert. Always support your explanations with the provided facts.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 500,
    temperature: 0.5,  // Some creativity but factual
  });

  const content = response.choices[0]?.message?.content || '';
  const parsed = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] || '{}');

  return {
    summary: parsed.summary || `${winner.foodName} is the better choice for ${focusLabel}.`,
    winnerExplanation: parsed.winnerExplanation || 'Based on nutritional analysis.',
    considerations: parsed.considerations || [],
    recommendation: parsed.recommendation || `Choose ${winner.foodName}.`,
  };
}
```

### Complete Comparison Output

```typescript
interface ComparisonResult {
  // Foods compared
  foods: {
    id: string;
    name: string;
    nutrition: CompleteNutrition;
    grading: CompleteGradingResult;
  }[];

  // User's focus
  userFocus: WellnessFocus;

  // Deterministic results (always computed)
  deterministic: {
    winner: ComparisonWinner;
    focusWinners: Record<WellnessFocus, ComparisonWinner>;
    nutrientComparison: Record<keyof CompleteNutrition, {
      values: Record<string, number>;
      leader: string;
    }>;
  };

  // AI insights (optional, can be disabled)
  insights?: ComparisonInsight;

  // Metadata
  comparedAt: Date;
  aiInsightsEnabled: boolean;
}

async function compareFoods(
  foods: ComparedFood[],
  userFocus: WellnessFocus,
  enableAIInsights: boolean = true
): Promise<ComparisonResult> {
  // STEP 1: Compute all deterministic facts
  const facts = computeDeterministicFacts(foods, userFocus);

  // STEP 2: Generate AI insights (if enabled)
  let insights: ComparisonInsight | undefined;
  if (enableAIInsights) {
    insights = await generateComparisonInsights(foods, facts, userFocus);
  }

  // STEP 3: Build nutrient comparison table
  const nutrientComparison = buildNutrientComparison(foods);

  return {
    foods: foods.map(f => ({
      id: f.id,
      name: f.name,
      nutrition: f.nutrition,
      grading: f.grading,
    })),
    userFocus,
    deterministic: {
      winner: facts.focusWinners[userFocus],
      focusWinners: facts.focusWinners,
      nutrientComparison,
    },
    insights,
    comparedAt: new Date(),
    aiInsightsEnabled: enableAIInsights,
  };
}
```

### Key Design Decisions

1. **AI Cannot Override Winners**: The winner is always determined by deterministic scores. AI can only explain why.

2. **Facts First, Insights Second**: All comparisons work without AI. AI adds explanation value.

3. **GPT-4o-mini for Cost**: Insight generation uses the cheaper model since it's just synthesis.

4. **Insights are Optional**: Users or the system can disable AI insights for faster/cheaper results.

5. **Multi-Focus Awareness**: Even if user focuses on one goal, we show winners for all focuses.

---

## 7. Data Storage

### Firestore Collections

```typescript
// Collection: glycemicIndex
// Purpose: Pre-loaded GI values from Sydney University database
// Size: ~4,000 documents (one-time seed)
interface GIDocument {
  name: string;              // Indexed, lowercase
  gi: number;
  servingSizeGrams: number;
  carbsPerServing: number;
  source: 'sydney' | 'fao' | 'literature';
  aliases: string[];         // Array-contains indexed
  category: GICategory;
  createdAt: Timestamp;
}

// Collection: nutritionCache
// Purpose: Cache resolved nutrition to avoid repeated API calls
// TTL: 30 days (Cloud Firestore TTL policy)
interface NutritionCacheDocument {
  foodKey: string;           // Normalized food name (indexed)
  restaurantKey?: string;    // Optional restaurant context
  nutrition: CompleteNutrition;
  source: 'usda' | 'edamam' | 'openfoodfacts' | 'hybrid' | 'ai';
  confidence: number;
  resolvedAt: Timestamp;
  expiresAt: Timestamp;      // TTL field
  hitCount: number;          // Track popularity for cache warming
}

// Collection: foodIntelligence
// Purpose: Pre-computed food intelligence database
// Size: ~600+ common foods with full grading
interface FoodIntelligenceDocument {
  name: string;              // Indexed, lowercase
  aliases: string[];         // Array-contains indexed
  category: string;
  nutrition: CompleteNutrition;
  gi?: number;
  gl?: number;
  focusGrades: Record<WellnessFocus, FocusGradeResult>;
  satiety: SatietyResult;
  inflammatory: InflammatoryResult;
  insight: string;
  updatedAt: Timestamp;
}
```

### Cache Strategy

```typescript
// Cache key generation
function generateCacheKey(name: string, restaurant?: string): string {
  const normalized = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')  // Remove punctuation
    .replace(/\s+/g, '_');    // Spaces to underscores

  if (restaurant) {
    const normalizedRestaurant = restaurant.toLowerCase().replace(/[^\w]/g, '');
    return `${normalizedRestaurant}__${normalized}`;
  }

  return normalized;
}

// Cache lookup with fallback
async function cacheGet(name: string, restaurant?: string): Promise<CompleteNutrition | null> {
  const key = generateCacheKey(name, restaurant);

  const doc = await nutritionCacheCollection.doc(key).get();

  if (!doc.exists) return null;

  const data = doc.data()!;

  // Check if expired (backup for TTL policy)
  if (data.expiresAt.toDate() < new Date()) {
    return null;
  }

  // Increment hit count (fire-and-forget)
  doc.ref.update({ hitCount: FieldValue.increment(1) });

  return data.nutrition;
}

// Cache write
async function cacheSet(
  name: string,
  nutrition: CompleteNutrition,
  source: string,
  confidence: number,
  restaurant?: string
): Promise<void> {
  const key = generateCacheKey(name, restaurant);

  const ttlDays = source === 'ai' ? 7 : 30;  // Shorter TTL for AI estimates
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + ttlDays);

  await nutritionCacheCollection.doc(key).set({
    foodKey: name.toLowerCase(),
    restaurantKey: restaurant?.toLowerCase(),
    nutrition,
    source,
    confidence,
    resolvedAt: Timestamp.now(),
    expiresAt: Timestamp.fromDate(expiresAt),
    hitCount: 1,
  });
}
```

### Firestore Indexes

```yaml
# firestore.indexes.json
indexes:
  # GI lookup by name
  - collectionGroup: glycemicIndex
    fields:
      - fieldPath: name
        order: ASCENDING

  # GI lookup by alias
  - collectionGroup: glycemicIndex
    fields:
      - fieldPath: aliases
        arrayConfig: CONTAINS

  # Cache lookup
  - collectionGroup: nutritionCache
    fields:
      - fieldPath: foodKey
        order: ASCENDING
      - fieldPath: restaurantKey
        order: ASCENDING

  # Food intelligence lookup
  - collectionGroup: foodIntelligence
    fields:
      - fieldPath: name
        order: ASCENDING

  # Food intelligence by alias
  - collectionGroup: foodIntelligence
    fields:
      - fieldPath: aliases
        arrayConfig: CONTAINS
```

---

## 8. Performance & Cost Analysis

### Latency Breakdown

| Layer | Operation | Latency | Notes |
|-------|-----------|---------|-------|
| **Identification** | GPT-4o vision | 1-3s | Single AI call |
| **Identification** | GPT-4o-mini text | 0.5-1s | Cheaper for text input |
| **Resolution - Cache** | Firestore lookup | 10-50ms | Free, instant |
| **Resolution - USDA** | API call | 100-300ms | Free, fast |
| **Resolution - OpenFoodFacts** | API call | 200-500ms | Free, moderate |
| **Resolution - Edamam** | API call | 150-400ms | Paid, fast |
| **Resolution - Parallel Batch** | Multiple APIs | 200-500ms | Concurrent execution |
| **GI Enrichment** | Firestore lookup | 10-50ms | Pre-loaded database |
| **Grading** | Computation | <5ms | Pure formulas |
| **Comparison** | Deterministic | <10ms | Pure computation |
| **Comparison** | GPT-4o-mini insights | 0.5-1s | Optional |

### Total Latency Scenarios

```
BEST CASE (Cached food, no AI insights):
  Cache hit: 50ms
  GI lookup: 30ms
  Grading: 5ms
  TOTAL: ~85ms

TYPICAL CASE (Single food photo, API resolution):
  AI identification: 2s
  Cache miss + USDA: 250ms
  GI lookup: 30ms
  Grading: 5ms
  TOTAL: ~2.3s

WORST CASE (Complex menu, all decomposed, AI fallback):
  AI identification (menu): 3s
  Parallel API batch: 500ms
  AI estimation for 2 items: 1s
  GI lookups: 100ms
  Grading (10 items): 50ms
  TOTAL: ~4.6s

COMPARISON WITH AI INSIGHTS:
  Base resolution (2 foods): 2.5s
  Comparison computation: 10ms
  AI insights: 800ms
  TOTAL: ~3.3s
```

### Cost Analysis

| Operation | Cost | Volume | Monthly Cost |
|-----------|------|--------|--------------|
| **GPT-4o (vision)** | ~$0.01/image | 10,000 photos | $100 |
| **GPT-4o-mini (text)** | ~$0.0003/call | 5,000 texts | $1.50 |
| **GPT-4o-mini (insights)** | ~$0.0005/call | 3,000 comparisons | $1.50 |
| **USDA API** | Free | Unlimited | $0 |
| **OpenFoodFacts API** | Free | Unlimited | $0 |
| **Edamam API** | ~$0.00014/call | 20,000 lookups | $2.80 |
| **AI Fallback** | ~$0.005/call | 500 fallbacks | $2.50 |
| **Firestore** | ~$0.06/100K reads | 500K reads | $3 |

**Estimated Monthly Total: ~$111** (at 10K MAU with moderate usage)

### Cost Optimization Strategies

```typescript
// 1. Cache warming for popular foods
async function warmCache(): Promise<void> {
  const popularFoods = [
    'chicken breast', 'brown rice', 'salmon', 'broccoli', 'eggs',
    'oatmeal', 'greek yogurt', 'banana', 'almonds', 'avocado',
    // Top 100 most-logged foods
  ];

  for (const food of popularFoods) {
    const cached = await cacheGet(food);
    if (!cached) {
      await resolveFood({ name: food, foodType: 'whole_food' });
    }
  }
}

// 2. Batch menu items to reduce API calls
async function resolveMenuItems(items: NormalizedFoodDescriptor[]): Promise<void> {
  // Group by food type for optimal routing
  const byType = groupBy(items, 'foodType');

  // Resolve in parallel by type
  await Promise.all([
    resolveWholeFoods(byType.whole_food || []),
    resolveRestaurantItems(byType.restaurant_item || []),
    resolveBrandedItems(byType.branded_packaged || []),
  ]);
}

// 3. Skip AI insights for simple queries
function shouldGenerateInsights(foods: ComparedFood[], userTier: string): boolean {
  // Skip for free users on simple comparisons
  if (userTier === 'free' && foods.length === 2) {
    return false;
  }

  // Skip if one food is decisively better
  const scores = foods.map(f => f.grading.overall.score);
  const maxDiff = Math.max(...scores) - Math.min(...scores);
  if (maxDiff > 40) {
    return false;  // Winner is obvious
  }

  return true;
}

// 4. Use GPT-4o-mini where possible
function selectModel(task: 'identification' | 'insights'): string {
  switch (task) {
    case 'identification':
      // Use mini for text, full for images
      return hasImage ? 'gpt-4o' : 'gpt-4o-mini';
    case 'insights':
      return 'gpt-4o-mini';  // Always mini for synthesis
  }
}
```

### Cache Hit Rate Targets

| Cache | Target Hit Rate | Strategy |
|-------|-----------------|----------|
| Nutrition Cache | >80% | Pre-warm top 500 foods |
| GI Database | >95% | Pre-load all 4,000 values |
| Food Intelligence | >70% | Expand to 1,000+ foods |

### Monitoring & Alerts

```typescript
// Track resolution sources
const resolutionMetrics = {
  cache_hit: 0,
  usda: 0,
  edamam: 0,
  openfoodfacts: 0,
  hybrid: 0,
  decomposed: 0,
  ai_fallback: 0,
};

function trackResolution(source: string): void {
  resolutionMetrics[source]++;

  // Alert if AI fallback rate exceeds 5%
  const total = Object.values(resolutionMetrics).reduce((a, b) => a + b, 0);
  const aiRate = resolutionMetrics.ai_fallback / total;

  if (aiRate > 0.05 && total > 100) {
    alertOps('AI fallback rate exceeds 5%', { rate: aiRate, total });
  }
}

// Track latency by layer
async function measureLatency<T>(
  layer: string,
  operation: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    return await operation();
  } finally {
    const duration = performance.now() - start;
    recordMetric(`nutrition.${layer}.latency`, duration);
  }
}
```

---

## Summary

### Architecture Principles

1. **AI Identifies, Databases Resolve, Formulas Grade**
   - AI is expensive and inconsistent for nutrition facts
   - Authoritative databases (USDA, Edamam) provide accurate data
   - Deterministic formulas ensure reproducible grades

2. **Minimize AI Calls**
   - One AI call for identification (unavoidable)
   - Zero AI calls for resolution (APIs + cache)
   - One optional AI call for comparison insights

3. **Cache Aggressively**
   - Pre-load GI database (4,000 values)
   - Pre-compute food intelligence (600+ foods)
   - Cache all resolved nutrition (30-day TTL)

4. **Fail Gracefully**
   - Cascading fallback chain for resolution
   - Category-based defaults for unknown GI
   - AI estimation only as last resort

### Data Flow Summary

```
INPUT (Photo/Text/Menu)
         │
         ▼
┌─────────────────┐
│ AI IDENTIFICATION │ ← 1 AI call (GPT-4o/4o-mini)
│ What food is this? │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│    RESOLUTION    │ ← 0 AI calls (APIs + Cache)
│ What nutrients?  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  GI ENRICHMENT   │ ← 0 AI calls (Pre-loaded DB)
│ Glycemic impact? │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│     GRADING     │ ← 0 AI calls (Formulas)
│   How healthy?   │
│  Nutri-Score     │
│  Focus Grades    │
│  Satiety/DII     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   COMPARISON    │ ← 0-1 AI calls (Optional insights)
│  Which is better?│
└─────────────────┘
         │
         ▼
      OUTPUT
```

### Key Metrics

| Metric | Target | Rationale |
|--------|--------|-----------|
| AI Fallback Rate | <5% | Cost control |
| Cache Hit Rate | >80% | Latency optimization |
| Resolution Latency (P95) | <500ms | User experience |
| Total Latency (P95) | <3s | User experience |
| Monthly AI Cost | <$150 | Budget |
| Grade Consistency | 100% | Same input = same grade |

---

*Document Version: 2.0.0*
*Last Updated: December 2025*
*Architecture Owner: Engineering Team*
