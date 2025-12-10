# Nutrition Tab Comprehensive Improvement Plan

> **Document Version:** 1.1
> **Created:** December 2024
> **Updated:** December 2024
> **Status:** Planning Phase
> **AI Provider:** OpenAI (gpt-5.1-2025-11-1)

---

## Executive Summary

This document outlines a staged implementation plan for enhancing the Nutrition Tab in the NVIVO patient app. The improvements span both aesthetic enhancements and functional features, leveraging existing backend capabilities that are not yet exposed in the frontend.

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Stage 1: Aesthetic Polish](#stage-1-aesthetic-polish)
3. [Stage 2: History View Redesign](#stage-2-history-view-redesign)
4. [Stage 3: Enhanced Data Tracking](#stage-3-enhanced-data-tracking)
5. [Stage 4: Menu Scanner Integration](#stage-4-menu-scanner-integration)
6. [Stage 5: Food Comparison Feature](#stage-5-food-comparison-feature)
7. [Stage 6: Smart Features](#stage-6-smart-features)
8. [Dependencies & Prerequisites](#dependencies--prerequisites)
9. [File Structure](#file-structure)

---

## Current State Analysis

### Frontend Components (nvivo-988)
```
apps/patient/src/
├── screens/Journal/tabs/NutritionTab.tsx          # Main tab component
├── screens/Journal/nutrition/
│   ├── components/
│   │   ├── MacroOrb.tsx                           # Animated macro circles
│   │   ├── MealCard.tsx                           # Expandable meal cards
│   │   ├── WaterTracker.tsx                       # Water intake tracker
│   │   ├── AIBadge.tsx                            # AI analysis indicator
│   │   ├── EmptyState.tsx                         # No meals state
│   │   └── NutritionSkeleton.tsx                  # Loading skeleton
│   ├── modals/
│   │   ├── LogMealModal.tsx                       # Manual meal entry
│   │   ├── EditMealModal.tsx                      # Edit existing meal
│   │   └── MacroGoalsModal.tsx                    # Goal customization
│   └── history/
│       └── WeeklyChart.tsx                        # Basic calorie chart
├── screens/Journal/food/components/
│   ├── FoodSearchModal.tsx                        # USDA food search
│   └── PhotoAnalysisModal.tsx                     # AI photo analysis
└── hooks/nutrition/
    ├── useFoodLogs.ts                             # CRUD for food logs
    ├── useNutritionTargets.ts                     # Goal targets
    └── index.ts
```

### Backend Functions - Current State (nvivo-988)
```
functions/src/domains/
├── ai/
│   ├── foodAnalysis.ts                            # ✅ GPT-4o photo analysis
│   └── foodSearch.ts                              # ✅ USDA API integration
├── care/
│   └── careData.ts                                # Care team data
└── gamification/
    ├── dailyMicroWins.ts                          # Micro-wins system
    └── challengeLibrary.ts                        # Challenge definitions
```

### Backend Functions - TO BE IMPLEMENTED (from old repo reference)
```
functions/src/domains/
├── ai/
│   └── mealPhotoAnalysis.ts                       # ❌ NEEDS: Mediterranean alignment
├── food-comparison/
│   ├── menuScannerService.ts                      # ❌ NEEDS: OpenAI Vision OCR
│   ├── foodDatabaseService.ts                     # ❌ NEEDS: Restaurant/UPC lookup
│   └── comparisonEngine.ts                        # ❌ NEEDS: Health scoring engine
└── patient/
    └── tracking.ts                                # ❌ NEEDS: Food/exercise logging
```

### Key Gaps - Self-Containment Requirements
| Feature | Backend Status | Frontend | Action Required |
|---------|----------------|----------|-----------------|
| Photo Analysis | ✅ Exists | ✅ Exists | None |
| USDA Search | ✅ Exists | ✅ Exists | None |
| Meal Alignment | ❌ Missing | ❌ None | **Implement in Stage 4** |
| Menu Scanner | ❌ Missing | ❌ None | **Implement in Stage 4** |
| Food Comparison | ❌ Missing | ❌ None | **Implement in Stage 5** |
| Food Database | ❌ Missing | ❌ None | **Implement in Stage 4** |
| Barcode Lookup | ❌ Missing | ❌ None | **Implement in Stage 6** |
| Health Scoring | ❌ Missing | ❌ None | **Implement in Stage 5** |
| Patient Tracking | ❌ Missing | ⚠️ Partial | **Implement in Stage 3** |

> **IMPORTANT**: All backend functions must be implemented in the nvivo-988 repo.
> Do NOT reference or import from the old nvivo repo.

---

## Stage 1: Aesthetic Polish

**Priority:** High
**Effort:** Low-Medium
**Duration:** 1 sprint

### 1.1 Goal Celebration Confetti

Add celebratory animation when user hits daily nutrition targets.

**Files to modify:**
- `apps/patient/src/screens/Journal/nutrition/components/MacroOrb.tsx`
- `apps/patient/src/animations/effects/Confetti.tsx` (use existing)

**Implementation:**
```typescript
// Trigger confetti when all macros hit 100%
const allGoalsReached =
  dailyTotals.calories >= targets.calories * 0.95 &&
  dailyTotals.protein >= targets.protein * 0.95;

{allGoalsReached && <Confetti trigger={true} />}
```

**Behavior:**
- Confetti triggers once per day when all 4 macros reach 95%+
- Store in localStorage: `nutrition_celebrated_${date}`
- Quick burst (1.5s), not overwhelming

### 1.2 Meal Card Gradients

Add meal-type specific gradient backgrounds.

**Files to modify:**
- `apps/patient/src/screens/Journal/nutrition/components/MealCard.tsx`
- `apps/patient/src/screens/Journal/nutrition/types.ts`

**Gradient Scheme:**
```typescript
const mealGradients = {
  breakfast: 'from-amber-500/8 via-orange-500/5 to-transparent',   // Warm sunrise
  lunch: 'from-emerald-500/8 via-teal-500/5 to-transparent',       // Fresh midday
  dinner: 'from-indigo-500/8 via-purple-500/5 to-transparent',     // Cool evening
  snack: 'from-rose-500/8 via-pink-500/5 to-transparent',          // Light accent
};
```

### 1.3 Photo Thumbnails for AI Meals

Show the analyzed photo as a thumbnail on AI-analyzed meal cards.

**Files to modify:**
- `apps/patient/src/hooks/nutrition/useFoodLogs.ts` (extend FoodLog type)
- `apps/patient/src/screens/Journal/nutrition/components/MealCard.tsx`
- `apps/patient/src/screens/Journal/food/components/PhotoAnalysisModal.tsx`

**Data Model Extension:**
```typescript
interface FoodLog {
  // ... existing fields
  photoUrl?: string;        // Firebase Storage URL
  photoThumbnail?: string;  // Base64 or small URL for list view
}
```

**UI:**
- 48x48 rounded thumbnail on left side of MealCard
- Tap to view full photo in modal
- Shimmer loading state

### 1.4 Quick-Edit Inline Portions

Add portion adjustment buttons without opening modal.

**Files to modify:**
- `apps/patient/src/screens/Journal/nutrition/components/MealCard.tsx`

**UI:**
- When expanded, show [-] [portion] [+] buttons
- Increment/decrement by 0.25 servings
- Auto-recalculate macros based on per-serving values
- Debounced save (500ms after last change)

### 1.5 Water Tracker Enhancements

**Files to modify:**
- `apps/patient/src/screens/Journal/nutrition/components/WaterTracker.tsx`
- `apps/patient/src/hooks/nutrition/useWaterStreak.ts` (new)

**Enhancements:**
1. **Wave Animation:** Already partially implemented, enhance with CSS:
```css
@keyframes wave {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-2px) rotate(1deg); }
  75% { transform: translateY(-1px) rotate(-1deg); }
}
```

2. **Streak Counter:**
```typescript
interface WaterStreak {
  currentStreak: number;
  longestStreak: number;
  lastHitDate: string;
}
```
- Display: "🔥 3 days hitting water goal!"
- Small badge below the glasses

---

## Stage 2: History View Redesign

**Priority:** High
**Effort:** Medium
**Duration:** 1-2 sprints

### 2.1 Overview

Mirror the Wellness Tab's history view pattern:
1. **Calendar Heatmap** - GitHub-style month view
2. **Nutrition Trends** - Multi-metric sparkline cards
3. **Timeline Feed** - Recent meal entries

### 2.2 Calendar Heatmap (Nutrition-Specific)

**New Files:**
- `apps/patient/src/screens/Journal/nutrition/history/NutritionCalendarHeatmap.tsx`

**Scoring Logic:**
```typescript
function calculateNutritionScore(dayData: DayNutritionSummary): number {
  // Score 0-10 based on how well targets were hit
  const calorieScore = Math.min(10, (dayData.calories / targets.calories) * 10);
  const proteinScore = Math.min(10, (dayData.protein / targets.protein) * 10);
  const overPenalty = dayData.calories > targets.calories * 1.2 ? -2 : 0;

  return Math.max(0, (calorieScore + proteinScore) / 2 + overPenalty);
}
```

**Color Gradient:**
- 0-2: Red (major deficit or excess)
- 3-4: Orange (below target)
- 5-6: Yellow (close to target)
- 7-8: Light green (hitting targets)
- 9-10: Deep green (perfect day)

### 2.3 Nutrition Trends Component

**New Files:**
- `apps/patient/src/screens/Journal/nutrition/history/NutritionTrends.tsx`
- `apps/patient/src/screens/Journal/nutrition/history/NutritionMetricCard.tsx`

**Metrics to Track:**
| Metric | Color | Good Direction |
|--------|-------|----------------|
| Calories | Amber | Stable (near target) |
| Protein | Rose | Up |
| Fiber | Green | Up |
| Sodium | Red | Down |
| Sugar | Purple | Down |
| Water | Cyan | Up |

**Card Layout:**
```
┌─────────────────────────────────────────┐
│ Protein                    ↑ +12g (8%)  │
│ 68g avg /day               ▔▔▔▔▔▔▔▔▔▔▔ │
│ ─────────────────────────────[sparkline]│
│ vs last month                           │
└─────────────────────────────────────────┘
```

**Time Ranges:** 1W | 1M | 3M | 6M | 1Y (same as Wellness)

### 2.4 Meal Timeline Feed

**New Files:**
- `apps/patient/src/screens/Journal/nutrition/history/MealTimelineFeed.tsx`
- `apps/patient/src/screens/Journal/nutrition/history/MealTimelineCard.tsx`

**Display:**
- Group by date
- Show meal thumbnails if available
- Expandable to see macros
- "View All" button opens full calendar modal

### 2.5 Advanced Stats Cards

**Add below timeline:**
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ 2,847    │  │ 18/30    │  │ 7        │
│ Avg Cal  │  │ On-Target│  │ Day      │
│ /day     │  │ Days     │  │ Streak   │
└──────────┘  └──────────┘  └──────────┘
```

---

## Stage 3: Enhanced Data Tracking

**Priority:** High
**Effort:** Low
**Duration:** 0.5 sprint

### 3.1 Sugar Tracking

**Files to modify:**
- `apps/patient/src/screens/Journal/nutrition/components/MacroOrb.tsx`
- `apps/patient/src/screens/Journal/nutrition/modals/LogMealModal.tsx`
- `apps/patient/src/hooks/nutrition/useFoodLogs.ts`

**Implementation:**
- Add Sugar to MacroOrb row (5th orb)
- Add Sugar field to LogMealModal
- Default target: 50g (FDA recommendation)

### 3.2 Sodium Tracking

**Same pattern as Sugar:**
- Add Sodium MacroOrb
- Target: 2300mg (FDA)
- Color: Red-Orange (warning color)

### 3.3 Saturated Fat Tracking

**For heart health patients:**
- Add Saturated Fat MacroOrb (optional, show if conditions include heart)
- Target: 20g
- Color: Deep red

### 3.4 Macro Orb Grid Refactor

**Current:** 4 orbs in a row
**New:** 2 rows of 3, responsive

```
┌─────────────────────────────────────┐
│  [Protein]  [Carbs]    [Fat]        │
│  [Fiber]    [Sugar]    [Sodium]     │
└─────────────────────────────────────┘
```

---

## Stage 4: Menu Scanner Integration

**Priority:** High
**Effort:** Medium-High
**Duration:** 2 sprints

### 4.1 Overview

Implement menu scanning capability using **OpenAI GPT-5.1 Vision** for OCR, menu item extraction, and nutrition estimation. All AI operations use the centralized OpenAI configuration (`functions/src/config/openai.ts`).

### 4.2 Backend Implementation (REQUIRED FIRST)

**New Backend Files to Create:**
```
functions/src/domains/
├── food-comparison/
│   ├── index.ts                       # Barrel exports
│   ├── menuScannerService.ts          # Main scanner service
│   ├── foodDatabaseService.ts         # Restaurant/food database
│   └── types.ts                       # Shared types
├── ai/
│   └── mealPhotoAnalysis.ts           # Mediterranean alignment scoring
```

**4.2.1 Menu Scanner Service (`menuScannerService.ts`)**
```typescript
// Key functionality to implement:
export class MenuScannerService {
  // OCR + Extract menu items in one call using OpenAI Vision
  async scanAndExtractMenuItems(imageBase64: string, context?: MenuScanContext): Promise<ExtractedMenuItem[]>;

  // Estimate nutrition for each item
  async estimateNutrition(item: ExtractedMenuItem, context?: MenuScanContext): Promise<NutritionEstimate>;

  // Detect restaurant and cuisine type
  async detectRestaurantAndCuisine(ocrText: string): Promise<{ restaurant?: string; cuisine?: CuisineType }>;

  // Main entry point
  async scanMenu(request: MenuScanRequest): Promise<MenuScanResult>;
}
```

**4.2.2 Food Database Service (`foodDatabaseService.ts`)**
```typescript
export class FoodDatabaseService {
  // Search USDA FoodData Central
  async searchFoods(query: string, limit?: number): Promise<FoodSearchResult[]>;

  // Get nutrition by USDA FDC ID
  async getNutritionByFdcId(fdcId: string): Promise<FlatNutritionData>;

  // Get nutrition by UPC barcode
  async getNutritionByUpc(upc: string): Promise<FlatNutritionData>;

  // Search restaurant items
  async findRestaurantItem(restaurantName: string, itemName: string): Promise<RestaurantItem | null>;

  // Find similar foods for estimation
  async searchSimilarFoods(query: string, limit: number): Promise<SimilarFood[]>;
}
```

**4.2.3 Meal Alignment Service (`mealPhotoAnalysis.ts`)**
```typescript
export interface CoachMealAnalysis {
  foodItems: CoachIdentifiedFood[];
  totalCalories: number;
  macros: { protein: number; carbs: number; fat: number; fiber: number };
  alignment: 'excellent' | 'good' | 'moderate' | 'poor';
  alignmentReason: string;
  suggestions: string[];
  confidence: number;
}

export async function analyzeMealPhoto(
  base64Image: string,
  mimeType: string
): Promise<CoachMealAnalysis>;
```

**4.2.4 Cloud Function Exports (`functions/src/index.ts`)**
```typescript
// Add to index.ts
export { scanMenu } from './domains/food-comparison';
export { analyzeMealAlignment } from './domains/ai/mealPhotoAnalysis';
```

**4.2.5 Required Types (`packages/shared/types/foodComparison.ts`)**
```typescript
export interface MenuScanRequest {
  imageBase64: string;
  patientId: string;
  context?: MenuScanContext;
}

export interface MenuScanResult {
  id: string;
  menuItems: ExtractedMenuItem[];
  restaurantDetected?: string;
  cuisineDetected?: CuisineType;
  confidence: number;
  rawOcrText: string;
  processingTimeMs: number;
  scannedAt: string;
}

export interface ExtractedMenuItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  confidence: number;
  nutritionEstimate?: NutritionEstimate;
}

export type CuisineType =
  | 'american' | 'mexican' | 'italian' | 'chinese' | 'japanese'
  | 'indian' | 'thai' | 'mediterranean' | 'french' | 'korean'
  | 'vietnamese' | 'greek' | 'middle_eastern' | 'fast_food' | 'other';
```

### 4.3 Frontend Files

```
apps/patient/src/
├── screens/Journal/nutrition/scanner/
│   ├── MenuScannerModal.tsx           # Camera/gallery picker
│   ├── MenuScanResults.tsx            # Display scanned items
│   ├── MenuItemCard.tsx               # Individual menu item
│   └── RestaurantHeader.tsx           # Detected restaurant info
├── hooks/nutrition/
│   └── useMenuScanner.ts              # Cloud function caller
└── services/
    └── menuScannerService.ts          # API wrapper
```

### 4.3 User Flow

```
[Scan Menu Button]
      ↓
[Camera / Photo Library]
      ↓
[Loading: "Analyzing menu..."]
      ↓
┌─────────────────────────────────────┐
│ 🍴 Olive Garden (Italian)           │
│ Confidence: 92%                     │
├─────────────────────────────────────┤
│ ☑ Chicken Alfredo         890 cal   │
│   32g protein | 68g carbs | 42g fat │
│   [Add to Log]                      │
├─────────────────────────────────────┤
│ ☐ Garden Salad            220 cal   │
│   [Add to Log]                      │
├─────────────────────────────────────┤
│        [Compare Selected]           │
│        [Add All to Log]             │
└─────────────────────────────────────┘
```

### 4.4 Cloud Function Call

```typescript
// useMenuScanner.ts
export function useMenuScanner() {
  const scanMenu = useMutation({
    mutationFn: async (imageBase64: string) => {
      const result = await httpsCallable(functions, 'scanMenu')({
        imageBase64,
        patientId,
        context: {
          // Optional hints
          restaurantName: null,
          cuisineType: null,
        },
      });
      return result.data as MenuScanResult;
    },
  });

  return { scanMenu };
}
```

### 4.5 Data Persistence

- Save scanned menus to Firestore for quick re-use
- Collection: `patients/{patientId}/menuScans`
- Enable "Recent Menus" quick-add feature

---

## Stage 5: Food Comparison Feature

**Priority:** High
**Effort:** High
**Duration:** 2-3 sprints

### 5.1 Overview

Implement AI-powered food comparison with personalized health scoring based on patient conditions and dietary goals.

### 5.2 Backend Implementation (REQUIRED FIRST)

**New Backend Files to Create:**
```
functions/src/domains/food-comparison/
├── comparisonEngine.ts                # Main comparison logic
├── healthScoring.ts                   # Health score calculations
└── types.ts                           # Extended types
```

**5.2.1 Comparison Engine (`comparisonEngine.ts`)**
```typescript
export class FoodComparisonEngine {
  // Main comparison entry point
  async compare(request: FoodComparisonRequest): Promise<FoodComparisonResult>;

  // Resolve and score foods
  async resolveAndScoreFoods(foods: FoodComparisonItem[], context: ComparisonContext): Promise<ComparedFood[]>;

  // Calculate health score for a food
  calculateHealthScore(nutrition: FlatNutritionData, context: ComparisonContext): HealthScore;

  // Generate rankings based on preferences
  calculateRankings(foods: ComparedFood[], preferences?: ComparisonPreferences): FoodRanking[];

  // Build side-by-side comparison matrix
  buildComparisonMatrix(foods: ComparedFood[], preferences?: ComparisonPreferences): NutritionComparisonMatrix;

  // Determine the winner
  determineWinner(foods: ComparedFood[], rankings: FoodRanking[], context: ComparisonContext): ComparisonWinner;

  // Analyze health impacts
  async analyzeHealth(foods: ComparedFood[], context: ComparisonContext): Promise<HealthAnalysis>;

  // Generate AI recommendation using OpenAI
  async generateAIRecommendation(
    foods: ComparedFood[],
    rankings: FoodRanking[],
    healthAnalysis: HealthAnalysis,
    context: ComparisonContext
  ): Promise<AIRecommendation>;
}
```

**5.2.2 Health Scoring (`healthScoring.ts`)**
```typescript
export interface HealthScoreBreakdown {
  heartHealth: number;      // 0-100
  macroBalance: number;     // 0-100
  sodiumScore: number;      // 0-100 (lower sodium = higher score)
  fiberScore: number;       // 0-100 (higher fiber = higher score)
  sugarScore: number;       // 0-100 (lower sugar = higher score)
  satFatScore: number;      // 0-100
  proteinAdequacy: number;  // 0-100
  nutrientDensity: number;  // 0-100
}

export type HealthGrade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';

export type HealthCondition =
  | 'hypertension'
  | 'type_2_diabetes'
  | 'hyperlipidemia'
  | 'coronary_artery_disease'
  | 'heart_failure'
  | 'atrial_fibrillation'
  | 'obesity'
  | 'chronic_kidney_disease'
  | 'gout'
  | 'celiac_disease'
  | 'lactose_intolerance'
  | 'food_allergies';

// Personalized scoring based on health conditions
export function calculatePersonalizedScore(
  breakdown: HealthScoreBreakdown,
  context: ComparisonContext
): number;

// Convert numeric score to letter grade
export function scoreToGrade(score: number): HealthGrade;
```

**5.2.3 Required Types (`packages/shared/types/foodComparison.ts`)**
```typescript
export interface FoodComparisonRequest {
  patientId: string;
  foods: FoodComparisonItem[];
  comparisonContext: ComparisonContext;
  preferences?: ComparisonPreferences;
}

export interface ComparisonContext {
  healthConditions: HealthCondition[];
  dietaryGoals: Array<{ type: DietaryGoalType; priority: 'primary' | 'secondary' }>;
  targetNutrition?: NutritionTargets;
  currentDayIntake?: { totalCalories: number; totalSodium: number };
}

export interface FoodComparisonResult {
  id: string;
  patientId: string;
  foods: ComparedFood[];
  winner: ComparisonWinner;
  rankings: FoodRanking[];
  nutritionComparison: NutritionComparisonMatrix;
  healthAnalysis: HealthAnalysis;
  aiRecommendation: AIRecommendation;
  alternatives?: AlternativeSuggestion[];
  metadata: ComparisonMetadata;
  createdAt: string;
}

export interface AIRecommendation {
  recommendedChoice: string;
  confidence: number;
  reasoning: string;
  shortSummary: string;
  detailedAnalysis: string;
  personalizedTips: string[];
}
```

**5.2.4 Cloud Function Export**
```typescript
// Add to functions/src/index.ts
export { compareFoods } from './domains/food-comparison';
```

### 5.3 Frontend Files

```
apps/patient/src/
├── screens/Journal/nutrition/comparison/
│   ├── FoodComparisonModal.tsx        # Main comparison UI
│   ├── ComparisonMatrix.tsx           # Side-by-side nutrition table
│   ├── HealthScoreCard.tsx            # A+/B/C grade display
│   ├── WinnerBadge.tsx                # "Better Choice" indicator
│   ├── ConditionImpactList.tsx        # "For your hypertension..."
│   ├── AIRecommendation.tsx           # Personalized suggestion
│   └── ComparisonEmptyState.tsx       # "Select 2+ foods to compare"
├── hooks/nutrition/
│   └── useFoodComparison.ts           # Comparison engine caller
└── types/
    └── comparison.ts                  # Frontend types
```

### 5.3 Entry Points

1. **From Menu Scanner:** "Compare Selected" button
2. **From Meal Log:** Long-press to select multiple meals → "Compare"
3. **From Search:** Compare search results before logging
4. **Standalone:** "Compare Foods" button in Quick Actions

### 5.4 Comparison UI

```
┌─────────────────────────────────────────────────┐
│ Food Comparison                            [X]  │
├─────────────────────────────────────────────────┤
│  [Grilled Chicken]  vs  [Chicken Alfredo]       │
│       A-                      C+                │
│    ⭐ Better Choice                             │
├─────────────────────────────────────────────────┤
│              Chicken  │  Alfredo  │  Diff       │
│  Calories     320     │    890    │  -63%  ✅   │
│  Protein       42g    │     32g   │  +31%  ✅   │
│  Sodium       450mg   │   1200mg  │  -63%  ✅   │
│  Sat Fat        3g    │     18g   │  -83%  ✅   │
│  Fiber          2g    │      3g   │  -33%  ⚠️   │
├─────────────────────────────────────────────────┤
│ 🫀 For Your Heart Health:                       │
│ Grilled Chicken is significantly better due to  │
│ lower saturated fat and sodium.                 │
├─────────────────────────────────────────────────┤
│ 💡 AI Recommendation:                           │
│ "Choose the Grilled Chicken. If you want more   │
│  flavor, ask for lemon herb seasoning."         │
├─────────────────────────────────────────────────┤
│        [Log Grilled Chicken]                    │
└─────────────────────────────────────────────────┘
```

### 5.5 Health Context Integration

Pull patient's health conditions from profile:
```typescript
const { data: profile } = usePatientProfile(patientId);
const healthConditions = profile?.healthConditions || [];
// ['hypertension', 'type_2_diabetes']
```

Pass to comparison engine for personalized scoring.

---

## Stage 6: Smart Features

**Priority:** Medium
**Effort:** Medium-High
**Duration:** 2 sprints

### 6.1 Barcode Scanner

**Backend Requirement:** Uses `foodDatabaseService.getNutritionByUpc()` from Stage 4.

**New Frontend Files:**
- `apps/patient/src/screens/Journal/nutrition/scanner/BarcodeScanner.tsx`
- `apps/patient/src/hooks/nutrition/useBarcodeScanner.ts`

**Implementation:**
```typescript
// useBarcodeScanner.ts
export function useBarcodeScanner() {
  const lookupBarcode = useMutation({
    mutationFn: async (upc: string) => {
      // Call the cloud function created in Stage 4
      const result = await httpsCallable(functions, 'lookupBarcode')({ upc });
      return result.data as BarcodeResult;
    },
  });

  return { lookupBarcode };
}
```

**Frontend:**
- Use web `BarcodeDetector` API (Chrome/Edge) with fallback to `@nicolo-ribaudo/barcode-detector` polyfill
- For React Native: use `expo-barcode-scanner` or `react-native-camera`
- Fall back to manual search if UPC not found

**Backend Cloud Function (`functions/src/domains/food-comparison/barcodeScanner.ts`):**
```typescript
export const lookupBarcode = onCall(async (request) => {
  const { upc } = request.data;
  const nutrition = await foodDatabaseService.getNutritionByUpc(upc);
  return { nutrition, found: !!nutrition };
});
```

### 6.2 Favorites System

**New Files:**
- `apps/patient/src/hooks/nutrition/useFavorites.ts`
- `apps/patient/src/screens/Journal/nutrition/components/FavoritesCarousel.tsx`

**Features:**
- Star button on MealCards
- "Quick Add" section at top of Today view
- Stored in Firestore: `patients/{patientId}/favorites`

### 6.3 Recurring Meals Detection

**New Files:**
- `apps/patient/src/hooks/nutrition/useRecurringMeals.ts`

**Implementation:**
- Analyze past 30 days of logs
- Detect patterns: "You usually have oatmeal on weekdays"
- Show suggestion: "Add your usual breakfast?"

### 6.4 Meal Planning Suggestions

**New Files:**
- `apps/patient/src/screens/Journal/nutrition/suggestions/MealSuggestion.tsx`

**Logic:**
```typescript
function suggestDinner(currentIntake: DayTotals, targets: Targets): string {
  const remainingProtein = targets.protein - currentIntake.protein;
  const remainingCalories = targets.calories - currentIntake.calories;

  if (remainingProtein > 30 && remainingCalories > 500) {
    return "Consider a protein-rich dinner like grilled salmon";
  }
  // ... more logic
}
```

### 6.5 Meal Alignment Badges

Show how each meal aligns with Mediterranean/heart-healthy diet.

**Backend already returns:**
```typescript
interface MealAnalysis {
  alignment: 'excellent' | 'good' | 'moderate' | 'poor';
  alignmentReason: string;
  suggestions: string[];
}
```

**Frontend display:**
- Badge on MealCard: "🫒 Heart Healthy" or "⚠️ High Sodium"
- Tap for details modal with suggestions

---

## Dependencies & Prerequisites

### OpenAI Configuration (Already Set Up)
- [x] OpenAI API key configured in `functions/.env`
- [x] Centralized model config in `functions/src/config/openai.ts`
- [x] Model version: `gpt-5.1-2025-11-1`
- [ ] Firebase Storage configured for image uploads

### Stage 1 Prerequisites
- [ ] Existing animation system works (`apps/patient/src/animations/`)
- [ ] Firebase Storage configured for photo uploads
- [ ] No backend changes required

### Stage 2 Prerequisites
- [ ] Stage 1 complete
- [ ] History hooks refactored to support nutrition data shape
- [ ] Reuse CalendarHeatmap and TimelineFeed from `screens/Journal/components/history/`
- [ ] No backend changes required

### Stage 3 Prerequisites
- [ ] None (can run in parallel with Stage 1-2)
- [ ] No backend changes required

### Stage 4 Prerequisites (BACKEND HEAVY)
- [ ] **IMPLEMENT:** `functions/src/domains/food-comparison/menuScannerService.ts`
- [ ] **IMPLEMENT:** `functions/src/domains/food-comparison/foodDatabaseService.ts`
- [ ] **IMPLEMENT:** `functions/src/domains/ai/mealPhotoAnalysis.ts`
- [ ] **IMPLEMENT:** `packages/shared/types/foodComparison.ts`
- [ ] **DEPLOY:** Cloud Functions with `scanMenu` and `lookupBarcode` endpoints
- [ ] Camera permissions configured in app
- [x] OpenAI API key configured (uses existing setup)

### Stage 5 Prerequisites (BACKEND HEAVY)
- [ ] Stage 4 backend complete
- [ ] **IMPLEMENT:** `functions/src/domains/food-comparison/comparisonEngine.ts`
- [ ] **IMPLEMENT:** `functions/src/domains/food-comparison/healthScoring.ts`
- [ ] **DEPLOY:** Cloud Function with `compareFoods` endpoint
- [ ] Patient health conditions schema defined in profile (`packages/shared/types/patient.ts`)

### Stage 6 Prerequisites
- [ ] Stage 4 backend complete (barcode scanner uses foodDatabaseService)
- [ ] Stage 5 backend complete (for meal alignment badges)
- [ ] Barcode scanner library: `@nicolo-ribaudo/barcode-detector` (web polyfill)
- [ ] Sufficient meal history data for pattern detection (2+ weeks)

### Self-Containment Checklist
- [ ] All backend code exists in `nvivo-988/functions/src/`
- [ ] All shared types exist in `nvivo-988/packages/shared/types/`
- [ ] No imports from or references to old nvivo repo
- [ ] All GCP service credentials configured in Firebase project

---

## File Structure (Final State)

```
apps/patient/src/screens/Journal/nutrition/
├── index.ts                              # Barrel export
├── types.ts                              # Shared types
├── constants.ts                          # Colors, targets, etc.
│
├── components/
│   ├── MacroOrb.tsx                      # Enhanced with confetti
│   ├── MacroOrbGrid.tsx                  # 2x3 grid layout
│   ├── MealCard.tsx                      # With gradients, thumbnails
│   ├── WaterTracker.tsx                  # With streak
│   ├── WaterStreakBadge.tsx              # "🔥 3 days"
│   ├── AIBadge.tsx
│   ├── AlignmentBadge.tsx                # Heart healthy indicator
│   ├── EmptyState.tsx
│   ├── NutritionSkeleton.tsx
│   ├── FavoritesCarousel.tsx             # Quick-add favorites
│   └── index.ts
│
├── modals/
│   ├── LogMealModal.tsx                  # With sugar/sodium fields
│   ├── EditMealModal.tsx
│   ├── MacroGoalsModal.tsx
│   └── index.ts
│
├── history/
│   ├── NutritionCalendarHeatmap.tsx      # GitHub-style
│   ├── NutritionTrends.tsx               # Multi-metric sparklines
│   ├── NutritionMetricCard.tsx           # Individual metric card
│   ├── MealTimelineFeed.tsx              # Recent entries
│   ├── MealTimelineCard.tsx              # Single entry card
│   ├── WeeklyChart.tsx                   # Legacy, enhanced
│   ├── AdvancedStats.tsx                 # Streak, avg, etc.
│   └── index.ts
│
├── scanner/
│   ├── MenuScannerModal.tsx              # Main scanner
│   ├── MenuScanResults.tsx               # Results display
│   ├── MenuItemCard.tsx                  # Scanned item
│   ├── RestaurantHeader.tsx              # Detected restaurant
│   ├── BarcodeScanner.tsx                # UPC scanner
│   ├── RecentMenus.tsx                   # Previously scanned
│   └── index.ts
│
├── comparison/
│   ├── FoodComparisonModal.tsx           # Main comparison
│   ├── ComparisonMatrix.tsx              # Nutrition table
│   ├── HealthScoreCard.tsx               # A-F grade
│   ├── WinnerBadge.tsx                   # Better choice
│   ├── ConditionImpactList.tsx           # Health conditions
│   ├── AIRecommendation.tsx              # AI advice
│   └── index.ts
│
└── suggestions/
    ├── MealSuggestion.tsx                # "Consider having..."
    ├── RecurringMealPrompt.tsx           # "Your usual breakfast?"
    └── index.ts
```

---

## Backend Implementation Summary

### Files to Create (Self-Contained in nvivo-988)

```
functions/src/domains/
├── food-comparison/
│   ├── index.ts                       # Barrel exports + cloud function handlers
│   ├── menuScannerService.ts          # ~400 LOC - OpenAI Vision OCR + extraction
│   ├── foodDatabaseService.ts         # ~300 LOC - USDA + restaurant lookup
│   ├── comparisonEngine.ts            # ~600 LOC - Health scoring + AI recommendations
│   ├── healthScoring.ts               # ~200 LOC - Condition-based scoring
│   └── types.ts                       # ~150 LOC - Internal types
├── ai/
│   └── mealPhotoAnalysis.ts           # ~150 LOC - Mediterranean alignment

packages/shared/types/
├── foodComparison.ts                  # ~200 LOC - Shared types for food comparison
└── index.ts                           # Update exports
```

### Cloud Functions to Export

| Function | Stage | Description |
|----------|-------|-------------|
| `scanMenu` | 4 | OCR + AI menu extraction |
| `lookupBarcode` | 4 | UPC → nutrition lookup |
| `analyzeMealAlignment` | 4 | Mediterranean diet scoring |
| `compareFoods` | 5 | Side-by-side comparison |

### Estimated Backend LOC: ~2,000 lines

---

## Implementation Timeline

| Stage | Name | Duration | Frontend | Backend | Dependencies |
|-------|------|----------|----------|---------|--------------|
| 1 | Aesthetic Polish | 1 sprint | ✅ Yes | ❌ No | None |
| 2 | History View Redesign | 1-2 sprints | ✅ Yes | ❌ No | Stage 1 |
| 3 | Enhanced Data Tracking | 0.5 sprint | ✅ Yes | ❌ No | None |
| 4 | Menu Scanner Integration | 2 sprints | ✅ Yes | ✅ Yes (~1,000 LOC) | GCP APIs |
| 5 | Food Comparison Feature | 2-3 sprints | ✅ Yes | ✅ Yes (~800 LOC) | Stage 4 |
| 6 | Smart Features | 2 sprints | ✅ Yes | ⚠️ Minimal | Stage 4-5 |

### Recommended Parallel Tracks

**Track A (Frontend-Only):** Stages 1 → 2 → 3
**Track B (Full-Stack):** Stage 4 Backend → Stage 4 Frontend → Stage 5 Backend → Stage 5 Frontend → Stage 6

**Total Estimated Duration:** 8-10 sprints (can be reduced with parallel execution)

---

## Success Metrics

### Stage 1-2
- [ ] Confetti triggers on goal completion
- [ ] Meal cards show gradients by type
- [ ] History view matches Wellness Tab pattern
- [ ] Water streak displays correctly

### Stage 3
- [ ] Sugar, Sodium visible in MacroOrb grid
- [ ] All nutrients save/load from Firestore

### Stage 4
- [ ] Menu scan completes in <10 seconds
- [ ] 80%+ menu items correctly extracted
- [ ] Scanned items log to meal history

### Stage 5
- [ ] Comparison shows personalized health scores
- [ ] AI recommendation displays
- [ ] Winner clearly indicated

### Stage 6
- [ ] Barcode scanner works offline (local cache)
- [ ] Favorites persist across sessions
- [ ] Meal suggestions are contextually relevant

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| OpenAI API costs | Implement daily scan limits, cache results |
| AI analysis latency | Show progressive loading, cache common items |
| Camera permissions denied | Provide manual entry fallback |
| USDA API rate limits | Implement local cache, fallback to common foods |
| Health condition data missing | Use general scoring, prompt user to update profile |

---

## Next Steps

1. **Review this document** with stakeholders
2. **Prioritize stages** based on user feedback and business needs
3. **Create Jira/Linear tickets** for each stage
4. **Begin Stage 1** implementation
5. **Deploy Cloud Functions** needed for Stage 4+ in parallel

---

*Document maintained by: AI Assistant*
*Last updated: December 2024*
