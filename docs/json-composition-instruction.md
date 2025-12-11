You are a nutrition data engineering assistant.

You have **direct, programmatic access** to the following two documents (you MUST use them as your only sources of truth):

1. "Comprehensive DRI.docx"
2. "DRI-Based Nutrient Evaluation Reference.docx"

Your job is to **fully and losslessly compile** these documents into a set of **normalized JSON files** designed for use in a TypeScript / Next.js app that evaluates nutrient intake at the food and user level.

You must:

- Merge the information from BOTH documents
- Avoid duplication
- Resolve conflicts deterministically
- Preserve ALL clinically relevant content (no omissions)
- Produce **strict, machine-usable JSON** matching the schemas below

Do NOT hallucinate values or “fill in” missing tables from your own external knowledge. If something is missing or inconsistent between the two docs, you must choose from the documents according to the rules below.

---

## 0. SOURCE PRIORITY & MERGE RULES

1. **Always read both documents in full first.**
   - Parse all tables and narrative text that contain:
     - DRI values (RDA, AI, UL, AMDR, CDRR)
     - FDA Daily Values
     - WHO / AHA / DGA thresholds
     - Clinical modifications for CKD, HTN, diabetes, pregnancy, elderly
     - Algorithmic instructions and classification logic

2. **Priority when conflicts occur:**
   - If the same numeric value appears in **both** docs and they match → use that value.
   - If they differ:
     - Prefer the value that is explicitly labeled as:
       - More recent (e.g., “2019 Na/K update”, “2011 Ca/Vit D update”), OR
       - Tied to an official source (e.g., DRI 2019, FDA 21 CFR 101.9, DGA 2020-2025).
     - If both appear equally “official”, prefer the version in **“DRI-Based Nutrient Evaluation Reference.docx”** (treat this as the more curated/structured overview).
   - If one doc has values that the other simply omits → include them.

3. **No external web or memory sources.**
   - All numbers, ranges, and rules must come from **one or both** of the uploaded documents.
   - If you see a discrepancy you cannot resolve with this rule, you MUST:
     - Include the value that is **explicitly tied to the authoritative source** (DRI, FDA, WHO, AHA, DGA) in the doc’s own text.
     - If still ambiguous, choose one value but add a `"notes"` field describing the ambiguity and where each came from.

4. **No information loss.**
   - If something is clinically relevant (e.g., “Mg UL applies to supplements only”), and appears anywhere in either doc, it must appear somewhere in the JSON (usually in `notes`, `clinicalNotes`, or `warningFlags`).

---

## 1. GLOBAL DESIGN & ID CONVENTIONS

You must normalize nutrients across all JSONs using a **single canonical `nutrientId`**.

### 1.1 Nutrient ID Rules

- `nutrientId` must be:
  - lowercase
  - snake_case
  - stable, short, descriptive
- Examples (you must follow these exact IDs for the nutrients mentioned in the docs):

Macronutrients & related:
- `"energy_kcal"`
- `"protein"`
- `"carbohydrate"`
- `"total_fat"`
- `"saturated_fat"`
- `"trans_fat"`
- `"monounsaturated_fat"`
- `"polyunsaturated_fat"`
- `"cholesterol"`
- `"total_sugars"`
- `"added_sugars"`
- `"dietary_fiber"`
- `"alcohol"`

Essential fatty acids:
- `"ala_omega3"`
- `"la_omega6"`
- `"epa_dha"`

Vitamins:
- `"vitamin_a"`
- `"vitamin_d"`
- `"vitamin_e"`
- `"vitamin_k"`
- `"vitamin_c"`
- `"thiamin"`
- `"riboflavin"`
- `"niacin"`
- `"vitamin_b6"`
- `"folate"`
- `"vitamin_b12"`
- `"pantothenic_acid"`
- `"biotin"`
- `"choline"`

Minerals & electrolytes:
- `"calcium"`
- `"iron"`
- `"magnesium"`
- `"phosphorus"`
- `"zinc"`
- `"selenium"`
- `"copper"`
- `"manganese"`
- `"chromium"`
- `"molybdenum"`
- `"iodine"`
- `"sodium"`
- `"potassium"`
- `"chloride"`

If other nutrients are present in the docs (e.g., water, fluoride), assign consistent IDs following this pattern.

### 1.2 USDA / External IDs

- If either document includes USDA nutrient IDs or mappings, include them as:
  - `"usdaNutrientId": "XXXXX"` (string or number as appropriate).
- If not present, set this field to `null` (do NOT invent IDs).

---

## 2. JSON #1 — NUTRIENT DEFINITIONS & METADATA

File name suggestion: `nutrient_definitions.json`

### 2.1 Schema

Produce an object:

```json
{
  "schemaVersion": "1.0",
  "nutrients": [ /* NutrientDefinition[] */ ]
}
````

Each `NutrientDefinition` MUST have this shape:

```jsonc
{
  "nutrientId": "sodium",
  "displayName": "Sodium",
  "shortName": "Sodium",
  "category": "mineral", // "macronutrient" | "vitamin" | "mineral" | "fatty_acid" | "other"
  "unit": "mg",
  "usdaNutrientId": null, // or a concrete id if available in docs
  "classification": "risk", // "beneficial" | "risk" | "neutral"
  "hasDRI": true,
  "hasUL": false,
  "hasFDA_DV": true,
  "driTypes": ["AI", "CDRR"], // union of used types for this nutrient
  "defaultTargetSource": "DRI", // "DRI" | "FDA_DV"
  "labeling": {
    "hasPercentDV": true,
    "dvUnit": "mg"
  },
  "notes": [
    "Summarized narrative notes from either document that are nutrient-specific, e.g. 'CDRR 2300 mg/day for adults.'",
    "Include clinically important comments like 'UL applies to supplements only' or 'Different guideline targets for WHO/AHA/DGA'."
  ],
  "warningFlags": {
    "pregnancy": "Any specific pregnancy-related risk from the docs (e.g., vitamin A retinol teratogenicity).",
    "ckd": "Any CKD-specific considerations mentioned.",
    "elderly": "Notes on absorption or increased needs.",
    "drugInteractions": [
      "Any relevant drug interaction notes explicitly mentioned (e.g., vitamin K and warfarin)."
    ]
  }
}
```

### 2.2 Population

* Include **all nutrients** that appear in:

  * DRI tables
  * FDA DV tables
  * Clinical modification sections
* For each nutrient:

  * Fill `classification` using the classification logic in the docs (beneficial vs risk vs neutral).
  * Fill `notes` with key statements from both docs (no copy-paste over 1–2 sentences per note; summarize).
  * For `driTypes`: collect all that apply to that nutrient in the documents (e.g., `["RDA", "AI", "UL"]` etc.).

---

## 3. JSON #2 — DRI (RDA/AI/UL) BY LIFE-STAGE & SEX

Even if “already done” elsewhere, you must regenerate it from the two docs to ensure it is consistent and complete.

File name suggestion: `dri_by_lifestage.json`

### 3.1 Life-Stage Model

Use the life-stage buckets defined in the documents. Derive values from their tables ONLY.

Each record is a **single nutrient × demographic** combination.

### 3.2 Schema

```json
{
  "schemaVersion": "1.0",
  "entries": [
    {
      "nutrientId": "calcium",
      "ageMinYears": 19,
      "ageMaxYears": 50,
      "sex": "female", // "male" | "female" | "both"
      "lifeStage": "standard", // "standard" | "pregnancy" | "lactation"
      "driType": "RDA", // "RDA" | "AI"
      "driValue": 1000,
      "ulValue": 2500, // null if none
      "unit": "mg",
      "source": "DRI 2011 Ca/Vit D update",
      "notes": [
        "Include any important footnotes from the table such as AI vs RDA, or supplement-only UL comments if relevant.",
        "If the doc mentions special caveats for this age group, summarize here."
      ]
    }
  ]
}
```

### 3.3 Requirements

* Include values for:

  * All vitamins
  * All minerals / electrolytes
  * Fiber AIs (if present)
  * Potassium and sodium updated AIs/CDRR (2019)
* Ensure that:

  * Units match the docs exactly (mg vs mcg vs g).
  * ULs that apply only to supplements are still stored in `ulValue`, but the **UL caveat** must be in `notes`.

---

## 4. JSON #3 — MACRONUTRIENTS, FIBER, ESSENTIAL FATTY ACIDS, AMDR

File name suggestion: `macros_fiber_fatty_acids.json`

### 4.1 Schema

```json
{
  "schemaVersion": "1.0",
  "amdr": [
    {
      "macronutrientId": "protein", // same as nutrientId where possible
      "ageMinYears": 19,
      "ageMaxYears": 150,
      "sex": "both",
      "percentMin": 10,
      "percentMax": 35,
      "notes": [
        "Acceptable macronutrient distribution range for adults from the DRI macronutrient report."
      ]
    }
  ],
  "macronutrientDRI": [
    {
      "nutrientId": "carbohydrate",
      "ageMinYears": 1,
      "ageMaxYears": 150,
      "sex": "both",
      "lifeStage": "standard",
      "driType": "RDA",
      "driValue": 130,
      "unit": "g",
      "notes": [
        "Minimum carbohydrate intake based on brain glucose requirements."
      ]
    }
  ],
  "fiberAI": [
    {
      "ageMinYears": 19,
      "ageMaxYears": 50,
      "sex": "male",
      "lifeStage": "standard",
      "aiValue": 38,
      "unit": "g",
      "notes": [
        "Based on 14 g fiber per 1000 kcal as described in the documents."
      ]
    }
  ],
  "efaAI": [
    {
      "nutrientId": "ala_omega3",
      "ageMinYears": 19,
      "ageMaxYears": 150,
      "sex": "male",
      "lifeStage": "standard",
      "aiValue": 1.6,
      "unit": "g",
      "notes": [
        "Adult male AI for alpha-linolenic acid."
      ]
    }
  ],
  "energyConversion": {
    "protein_kcal_per_g": 4,
    "carbohydrate_kcal_per_g": 4,
    "fat_kcal_per_g": 9,
    "alcohol_kcal_per_g": 7,
    "fiber_kcal_per_g": 2
  }
}
```

* All values must be taken from the macronutrient/fiber/AMDR sections of the documents.
* Include **all age bands** that are present in the docs (children, adults, etc.).

---

## 5. JSON #4 — FDA DAILY VALUES (WE HAVE THE SCHEMA)

You already have the conceptual table in the docs. Compile them exactly as described.

File name suggestion: `fda_daily_values.json`

### 5.1 Schema

Use this exact structure:

```json
{
  "schemaVersion": "1.0",
  "reference": {
    "calories": 2000,
    "notes": [
      "Anything from the docs explaining the basis of these DVs."
    ]
  },
  "dailyValues": [
    {
      "nutrientId": "sodium",
      "labelName": "Sodium",
      "unit": "mg",
      "adultsChildren4Plus": 2300,
      "children1to3": 1500,
      "infants": null,
      "pregnancyLactation": 2300
    }
  ]
}
```

* Fill out **all nutrients** that appear in the FDA DV tables of the documents.
* Use `null` where the docs indicate “no DV”.

---

## 6. JSON #5 — CLINICAL & GUIDELINE THRESHOLDS

File name suggestion: `clinical_thresholds_and_overrides.json`

This JSON captures:

* Condition-specific overrides (CKD, HTN, diabetes, pregnancy, elderly)
* WHO/AHA/DGA thresholds
* Classification bands for “low/adequate/high/excess” for risk vs beneficial nutrients

### 6.1 Schema

```json
{
  "schemaVersion": "1.0",
  "conditions": [
    {
      "conditionId": "ckd",
      "displayName": "Chronic Kidney Disease",
      "notes": [
        "Summaries from docs (e.g., KDOQI) about nutrition in CKD."
      ],
      "nutrientOverrides": [
        {
          "nutrientId": "protein",
          "stageOrDetail": "CKD 3-4 non-dialysis",
          "recommendedRange": {
            "min": 0.55,
            "max": 0.8,
            "unit": "g_per_kg_per_day"
          },
          "notes": [
            "Values must be taken from the CKD section in the docs."
          ]
        }
      ]
    }
  ],
  "guidelines": [
    {
      "guidelineId": "aha",
      "displayName": "American Heart Association",
      "notes": [
        "Brief description of the guideline as per docs."
      ],
      "nutrientThresholds": [
        {
          "nutrientId": "sodium",
          "thresholdType": "max",
          "value": 1500,
          "unit": "mg_per_day",
          "context": "ideal",
          "notes": [
            "Use the exact values and language from the documents (e.g., 'ideal < 1500 mg; < 2300 mg acceptable')."
          ]
        }
      ]
    }
  ],
  "intakeClassificationRules": [
    {
      "nutrientClassification": "beneficial",
      "ruleDescription": "For beneficial nutrients, classify intake based on % of DRI.",
      "bands": [
        {
          "label": "inadequate",
          "minPercentOfDRI": 0,
          "maxPercentOfDRI": 67
        },
        {
          "label": "below_target",
          "minPercentOfDRI": 67,
          "maxPercentOfDRI": 100
        },
        {
          "label": "adequate",
          "minPercentOfDRI": 100,
          "maxPercentOfDRI": 200
        },
        {
          "label": "high",
          "minPercentOfDRI": 200,
          "maxPercentOfDRI": 400
        }
      ]
    },
    {
      "nutrientClassification": "risk",
      "ruleDescription": "For risk nutrients (e.g., sodium, saturated fat, added sugars), higher intake is worse.",
      "bands": [
        {
          "label": "adequate",
          "minPercentOfTarget": 0,
          "maxPercentOfTarget": 100
        },
        {
          "label": "high",
          "minPercentOfTarget": 100,
          "maxPercentOfTarget": 150
        },
        {
          "label": "excess",
          "minPercentOfTarget": 150,
          "maxPercentOfTarget": 999
        }
      ]
    }
  ]
}
```

* Every numeric threshold in this JSON must trace directly to something in one of the documents (DRI, WHO, AHA, DGA, CKD, ADA, etc.).
* Do NOT invent values.

---

## 7. JSON #6 — FDA NUTRIENT CONTENT CLAIM THRESHOLDS

File name suggestion: `fda_nutrient_content_claims.json`

### 7.1 Schema

```json
{
  "schemaVersion": "1.0",
  "claims": [
    {
      "nutrientId": "sodium",
      "claimType": "free", // "free" | "very_low" | "low" | "reduced" | "light" | "good_source" | "high" | "lean" | "extra_lean" | etc.
      "regulation": "21 CFR 101.61(b)(1)",
      "criteria": {
        "perRACC": {
          "maxValue": 5,
          "unit": "mg"
        },
        "additionalConditions": [
          "If any special conditions exist in the docs (e.g. reference to saturated fat limits or per 100g conditions), include them as plain text rules."
        ]
      },
      "appliesTo": "general", // or "meals_main_dishes", etc.
      "notes": [
        "Summarize any explanatory notes from the docs."
      ]
    }
  ]
}
```

Populate from the tables/sections in the docs that list FDA “free/low/reduced/good source/high/lean/extra lean” criteria and CFR references.

---

## 8. DATA VALIDATION REQUIREMENTS

Before finalizing, you must:

1. Ensure all JSON is valid:

   * Proper commas, quotes, and nesting.
   * No trailing commas.
   * All `nutrientId` values are consistent across all files.

2. Check cross-consistency:

   * Every `nutrientId` appearing in the DRI / DV / clinical / claims JSONs must exist in `nutrient_definitions.json`.
   * Units must match between:

     * DRI
     * FDA DVs
     * Nutrient definitions
     * Clinical thresholds

3. Explicitly include all nutrients and age groups that appear in **either** document.

   * If one doc has a table the other doesn’t, still include those entries.

4. Preserve all clinically important caveats:

   * UL applies to supplements only (e.g., magnesium, niacin, folate).
   * Vitamin A teratogenicity in pregnancy.
   * B12 malabsorption in elderly.
   * CKD restrictions for potassium/phosphorus.

These go into `notes`, `clinicalNotes`, or `warningFlags`, depending on the context.

---

## 9. OUTPUT FORMAT

* Output each JSON as a separate top-level object.

* If you cannot output multiple files, then output them sequentially in a single response, clearly delimited, in this order:

  1. `nutrient_definitions.json`
  2. `dri_by_lifestage.json`
  3. `macros_fiber_fatty_acids.json`
  4. `fda_daily_values.json`
  5. `clinical_thresholds_and_overrides.json`
  6. `fda_nutrient_content_claims.json`

* Each must be **valid JSON** with no comments, ready to copy-paste.

Your goal: **lossless, normalized, machine-usable JSON representation of ALL relevant data** from the two documents, with no omissions, no hallucinations, and deterministic handling of conflicts.

```

---

If you want, I can also give you a **matching TypeScript interface file** for these JSONs so your app can type-check them automatically.
```
