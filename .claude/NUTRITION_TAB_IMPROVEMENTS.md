# Nutrition Tab Improvements - Implementation Plan

## Overview
Comprehensive upgrade to the NutritionTab with functional backend integration and aesthetic polish to match the rest of the app.

---

## FUNCTIONAL IMPROVEMENTS

### F1. AI Photo Analysis
**Goal:** Take a photo of food → AI analyzes → auto-fills nutrition

**Backend (new Cloud Function needed):**
- [ ] Create `analyzeFoodPhoto` function in `functions/src/domains/nutrition/`
- [ ] Accept base64 image
- [ ] Call OpenAI GPT-4 Vision to describe the food
- [ ] Pass description to existing `extractNutrition()` function
- [ ] Return: food items with estimated nutrition + confidence scores

**Frontend:**
- [ ] Create `PhotoAnalysisModal` component
- [ ] Camera capture with preview
- [ ] Loading state during analysis
- [ ] Results review screen (user can adjust before saving)
- [ ] Confidence indicator for each item

**Files to create/modify:**
- `functions/src/domains/nutrition/photoAnalysis.ts` (new)
- `functions/src/index.ts` (export new function)
- `apps/patient/src/screens/Journal/tabs/NutritionTab.tsx`
- `apps/patient/src/screens/journal/food/components/PhotoAnalysisModal.tsx` (new)

---

### F2. USDA Food Database Search
**Goal:** Search 400k+ foods with accurate nutrition data

**Backend:**
- [ ] Copy `foodDatabaseService.ts` from old repo to new repo
- [ ] Copy `searchFoods` and `getFoodNutrition` Cloud Functions
- [ ] Ensure USDA API key is configured

**Frontend:**
- [ ] Create `FoodSearchModal` component
- [ ] Search input with debounced API calls
- [ ] Results list with nutrition preview
- [ ] Selection fills the meal log form
- [ ] Recent searches cache

**Files to create/modify:**
- `functions/src/domains/nutrition/foodDatabase.ts` (copy from old repo)
- `apps/patient/src/screens/journal/food/components/FoodSearchModal.tsx` (new)
- `apps/patient/src/hooks/nutrition/useFoodSearch.ts` (new)

---

### F7. Personalized Targets
**Goal:** Replace static targets (2000 cal) with patient-specific ones

**Implementation:**
- [ ] Read targets from patient profile/settings in Firestore
- [ ] Create `useNutritionTargets` hook
- [ ] Default targets if none set
- [ ] Allow targets to vary by condition (sodium for hypertension, etc.)

**Files to modify:**
- `apps/patient/src/hooks/nutrition/useNutritionTargets.ts` (new)
- `apps/patient/src/screens/Journal/tabs/NutritionTab.tsx`

---

### F8. Real Firestore Persistence
**Goal:** Replace mock data with real Firestore data

**Implementation:**
- [ ] Create `useFoodLogs` hook with React Query
- [ ] Collection: `patients/{patientId}/foodLogs`
- [ ] CRUD operations: add, update, delete meals
- [ ] Optimistic updates for snappy UX
- [ ] Offline support with persistence

**Files to create/modify:**
- `apps/patient/src/hooks/nutrition/useFoodLogs.ts` (new)
- `apps/patient/src/hooks/nutrition/index.ts` (new - barrel export)
- `apps/patient/src/screens/Journal/tabs/NutritionTab.tsx`

---

## AESTHETIC IMPROVEMENTS

### A1. Animated Macro Rings
**Goal:** Smooth animations matching VitalityRing patterns

**Implementation:**
- [ ] Add `stroke-dashoffset` transition on load
- [ ] Glow effect when near goal (90%+)
- [ ] Pulse animation when goal exceeded
- [ ] Staggered animation delays for each ring

**CSS/Component changes:**
- Add `transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)`
- Add glow filter: `filter: drop-shadow(0 0 6px currentColor)`
- Add keyframes for pulse animation

---

### A2. Glassmorphic Cards
**Goal:** Match WellnessTab's frosted glass aesthetic

**Implementation:**
- [ ] Update hero card with glassmorphism
- [ ] Add gradient overlays
- [ ] Subtle backdrop blur on modals
- [ ] Border styling: `border-white/[0.06]`

**Style patterns:**
```css
bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]
```

---

### A3. Better Data Visualization (History view)
**Goal:** Improve weekly chart with animations and interactivity

**Implementation:**
- [ ] Add area gradient fill under bars
- [ ] Animated bar growth on view
- [ ] Tap for day details tooltip
- [ ] Rolling 7-day average line overlay
- [ ] Smooth transitions between time periods

---

### A4. Meal Type Timeline
**Goal:** Visual timeline showing meals at actual times

**Implementation:**
- [ ] Replace simple list with timeline component
- [ ] Time-of-day gradient background (sunrise → sunset colors)
- [ ] Meal cards positioned by time
- [ ] "Time since last meal" indicator
- [ ] Visual meal spacing insights

---

### A6. Water Tracker Enhancement
**Goal:** More engaging water tracking experience

**Implementation:**
- [ ] Animated fill when tapping glasses
- [ ] Ripple effect on tap
- [ ] Celebration animation at 8/8
- [ ] Wave animation in filled glasses
- [ ] Subtle glow on completed glasses

---

### A7. AI Badge Polish
**Goal:** Make AI-analyzed meals more visually distinct

**Implementation:**
- [ ] Shimmer animation on AI badge
- [ ] Larger badge with confidence display
- [ ] Sparkle particles on new AI analysis
- [ ] Tooltip with "Analyzed with X% confidence"

---

### A8. Empty State Polish
**Goal:** Match other tabs' empty state patterns

**Implementation:**
- [ ] Larger icon in colored circle
- [ ] Actionable suggestions
- [ ] Subtle animation (float or pulse)
- [ ] Quick action buttons

---

### A9. Loading Skeletons
**Goal:** Smooth loading experience

**Implementation:**
- [ ] Create `NutritionSkeleton` component
- [ ] Skeleton for hero card
- [ ] Skeleton for meal cards list
- [ ] Pulse animation matching other skeletons

**Files to create:**
- `apps/patient/src/components/skeletons/screens/NutritionSkeleton.tsx`

---

## Implementation Order

1. **Aesthetic foundations** (can do without backend):
   - A9: Loading Skeletons
   - A1: Animated Macro Rings
   - A2: Glassmorphic Cards
   - A6: Water Tracker Enhancement
   - A7: AI Badge Polish
   - A8: Empty State Polish

2. **Data layer**:
   - F8: Firestore Persistence (hook + wiring)
   - F7: Personalized Targets

3. **Visualization**:
   - A3: Better Data Visualization
   - A4: Meal Type Timeline

4. **AI Features**:
   - F2: USDA Food Search (simpler)
   - F1: Photo Analysis (more complex)

---

## File Structure After Implementation

```
apps/patient/src/
├── hooks/
│   └── nutrition/
│       ├── index.ts
│       ├── useFoodLogs.ts
│       ├── useFoodSearch.ts
│       └── useNutritionTargets.ts
├── screens/
│   └── journal/
│       └── food/
│           └── components/
│               ├── PhotoAnalysisModal.tsx
│               ├── FoodSearchModal.tsx
│               └── index.ts
└── components/
    └── skeletons/
        └── screens/
            └── NutritionSkeleton.tsx

functions/src/
└── domains/
    └── nutrition/
        ├── index.ts
        ├── photoAnalysis.ts
        └── foodDatabase.ts
```

---

## Notes

- Menu Scanner (F3) is deferred for later
- All AI uses OpenAI GPT-4 (not Gemini)
- Follow existing patterns from WellnessTab, ActivityTab, VitalityRing
- Maintain TypeScript strict mode compliance
