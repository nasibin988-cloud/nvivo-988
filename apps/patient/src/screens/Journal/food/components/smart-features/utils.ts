/**
 * Smart Features Utilities
 * Helper functions for barcode lookup, suggestions, and meal planning
 */

import type { FavoriteFood, MealSuggestion, NutritionGap, SuggestedFood } from './types';

// Calculate nutrition gaps based on current totals and targets
export function calculateNutritionGaps(
  current: { calories: number; protein: number; carbs: number; fat: number; fiber: number },
  targets: { calories: number; protein: number; carbs: number; fat: number; fiber: number }
): NutritionGap[] {
  const gaps: NutritionGap[] = [];

  const nutrients = ['protein', 'carbs', 'fat', 'fiber', 'calories'] as const;

  for (const nutrient of nutrients) {
    const currentVal = current[nutrient];
    const targetVal = targets[nutrient];
    const deficit = targetVal - currentVal;
    const percentage = Math.round((currentVal / targetVal) * 100);

    if (deficit > 0) {
      gaps.push({
        nutrient,
        current: currentVal,
        target: targetVal,
        deficit,
        percentage,
      });
    }
  }

  // Sort by percentage (lowest first - biggest gaps)
  return gaps.sort((a, b) => a.percentage - b.percentage);
}

// Generate meal suggestions based on gaps and time of day
export function generateSuggestions(
  gaps: NutritionGap[],
  favorites: FavoriteFood[],
  timeOfDay: 'morning' | 'afternoon' | 'evening'
): MealSuggestion[] {
  const suggestions: MealSuggestion[] = [];
  let suggestionId = 1;

  // Suggestion 1: Macro balance based on biggest gap
  if (gaps.length > 0) {
    const biggestGap = gaps[0];
    const foodsForGap = getSuggestedFoodsForNutrient(biggestGap.nutrient, biggestGap.deficit);

    suggestions.push({
      id: `suggestion-${suggestionId++}`,
      type: 'macro_balance',
      title: `Boost Your ${capitalizeFirst(biggestGap.nutrient)}`,
      description: `You're at ${biggestGap.percentage}% of your ${biggestGap.nutrient} goal`,
      foods: foodsForGap,
      reason: `Add ${biggestGap.deficit}${biggestGap.nutrient === 'calories' ? '' : 'g'} more ${biggestGap.nutrient} to hit your target`,
      confidence: 0.9,
      priority: 1,
    });
  }

  // Suggestion 2: Time-based meal suggestion
  const timeBasedSuggestion = getTimeBasedSuggestion(timeOfDay, favorites);
  if (timeBasedSuggestion) {
    suggestions.push({
      ...timeBasedSuggestion,
      id: `suggestion-${suggestionId++}`,
    });
  }

  // Suggestion 3: Add favorite foods
  const frequentFavorites = favorites.slice(0, 3);
  if (frequentFavorites.length > 0) {
    suggestions.push({
      id: `suggestion-${suggestionId++}`,
      type: 'variety',
      title: 'Quick Add Favorites',
      description: 'Your most logged foods',
      foods: frequentFavorites.map(f => ({
        name: f.name,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        benefit: `Logged ${f.usageCount} times`,
        isFavorite: true,
      })),
      reason: 'Quickly add foods you eat regularly',
      confidence: 0.85,
      priority: 3,
    });
  }

  // Suggestion 4: Goal completion suggestion if close to targets
  if (gaps.length > 0 && gaps.every(g => g.percentage >= 70)) {
    const remainingCals = gaps.find(g => g.nutrient === 'calories')?.deficit || 200;

    suggestions.push({
      id: `suggestion-${suggestionId++}`,
      type: 'goal_completion',
      title: 'Finish Strong!',
      description: `Only ~${remainingCals} calories left to hit your goals`,
      foods: getGoalCompletionFoods(remainingCals),
      reason: 'These options will help you reach your daily targets',
      confidence: 0.88,
      priority: 2,
    });
  }

  return suggestions.sort((a, b) => a.priority - b.priority);
}

// Get suggested foods for a specific nutrient deficiency
function getSuggestedFoodsForNutrient(nutrient: NutritionGap['nutrient'], _deficit: number): SuggestedFood[] {
  const foodDatabase: Record<string, SuggestedFood[]> = {
    protein: [
      { name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 4, benefit: 'Lean protein, low fat' },
      { name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 1, benefit: 'Quick, high protein snack' },
      { name: 'Eggs (2)', calories: 140, protein: 12, carbs: 1, fat: 10, benefit: 'Complete protein source' },
      { name: 'Cottage Cheese', calories: 110, protein: 14, carbs: 5, fat: 4, benefit: 'Slow-digesting protein' },
    ],
    carbs: [
      { name: 'Brown Rice (1 cup)', calories: 215, protein: 5, carbs: 45, fat: 2, benefit: 'Complex carbs, fiber' },
      { name: 'Sweet Potato', calories: 103, protein: 2, carbs: 24, fat: 0, benefit: 'Vitamins A & C' },
      { name: 'Oatmeal', calories: 150, protein: 5, carbs: 27, fat: 3, benefit: 'Sustained energy' },
      { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0, benefit: 'Quick energy, potassium' },
    ],
    fat: [
      { name: 'Avocado (half)', calories: 120, protein: 1, carbs: 6, fat: 11, benefit: 'Heart-healthy fats' },
      { name: 'Almonds (1oz)', calories: 164, protein: 6, carbs: 6, fat: 14, benefit: 'Vitamin E, magnesium' },
      { name: 'Olive Oil (1 tbsp)', calories: 119, protein: 0, carbs: 0, fat: 14, benefit: 'Monounsaturated fats' },
      { name: 'Salmon (3oz)', calories: 175, protein: 19, carbs: 0, fat: 11, benefit: 'Omega-3 fatty acids' },
    ],
    fiber: [
      { name: 'Raspberries (1 cup)', calories: 64, protein: 1, carbs: 15, fat: 1, benefit: '8g fiber, antioxidants' },
      { name: 'Lentils (1 cup)', calories: 230, protein: 18, carbs: 40, fat: 1, benefit: '16g fiber, iron' },
      { name: 'Broccoli (1 cup)', calories: 55, protein: 4, carbs: 11, fat: 1, benefit: '5g fiber, vitamin C' },
      { name: 'Chia Seeds (2 tbsp)', calories: 138, protein: 5, carbs: 12, fat: 9, benefit: '10g fiber, omega-3' },
    ],
    calories: [
      { name: 'Trail Mix (1/4 cup)', calories: 175, protein: 5, carbs: 16, fat: 11, benefit: 'Balanced macros' },
      { name: 'Peanut Butter Toast', calories: 270, protein: 10, carbs: 25, fat: 15, benefit: 'Protein + carbs + fat' },
      { name: 'Smoothie Bowl', calories: 350, protein: 12, carbs: 55, fat: 10, benefit: 'Nutrient dense' },
      { name: 'Granola Bar', calories: 190, protein: 4, carbs: 28, fat: 8, benefit: 'Convenient energy' },
    ],
  };

  return foodDatabase[nutrient] || foodDatabase.calories;
}

// Get time-based meal suggestion
function getTimeBasedSuggestion(
  timeOfDay: 'morning' | 'afternoon' | 'evening',
  _favorites: FavoriteFood[]
): Omit<MealSuggestion, 'id'> | null {
  const suggestions: Record<string, Omit<MealSuggestion, 'id'>> = {
    morning: {
      type: 'time_based',
      title: 'Morning Energy Boost',
      description: 'Start your day right with balanced nutrition',
      foods: [
        { name: 'Overnight Oats', calories: 280, protein: 12, carbs: 45, fat: 7, benefit: 'Sustained energy' },
        { name: 'Protein Smoothie', calories: 320, protein: 25, carbs: 35, fat: 8, benefit: 'Quick & nutritious' },
        { name: 'Eggs & Avocado Toast', calories: 380, protein: 16, carbs: 28, fat: 24, benefit: 'Protein + healthy fats' },
      ],
      reason: 'Breakfast kickstarts your metabolism',
      confidence: 0.85,
      priority: 2,
    },
    afternoon: {
      type: 'time_based',
      title: 'Midday Refuel',
      description: 'Keep your energy steady through the afternoon',
      foods: [
        { name: 'Grilled Chicken Salad', calories: 350, protein: 32, carbs: 18, fat: 16, benefit: 'Light but filling' },
        { name: 'Turkey Wrap', calories: 420, protein: 28, carbs: 38, fat: 18, benefit: 'Balanced meal' },
        { name: 'Buddha Bowl', calories: 480, protein: 18, carbs: 55, fat: 22, benefit: 'Veggie-packed' },
      ],
      reason: 'Avoid the afternoon slump with balanced nutrition',
      confidence: 0.82,
      priority: 2,
    },
    evening: {
      type: 'time_based',
      title: 'Satisfying Dinner',
      description: 'End your day with a nutritious meal',
      foods: [
        { name: 'Grilled Salmon + Veggies', calories: 420, protein: 35, carbs: 15, fat: 24, benefit: 'Omega-3s for recovery' },
        { name: 'Stir-Fry with Tofu', calories: 380, protein: 22, carbs: 35, fat: 18, benefit: 'Plant-based protein' },
        { name: 'Lean Beef + Sweet Potato', calories: 450, protein: 38, carbs: 30, fat: 20, benefit: 'Iron & complex carbs' },
      ],
      reason: 'Support overnight recovery with protein',
      confidence: 0.8,
      priority: 2,
    },
  };

  return suggestions[timeOfDay] || null;
}

// Get foods for goal completion (when close to targets)
function getGoalCompletionFoods(remainingCals: number): SuggestedFood[] {
  if (remainingCals < 150) {
    return [
      { name: 'Apple with Almond Butter', calories: 130, protein: 3, carbs: 18, fat: 7, benefit: 'Perfect small snack' },
      { name: 'Hard-Boiled Egg', calories: 78, protein: 6, carbs: 1, fat: 5, benefit: 'Protein-rich' },
      { name: 'String Cheese', calories: 80, protein: 7, carbs: 1, fat: 6, benefit: 'Quick protein' },
    ];
  } else if (remainingCals < 300) {
    return [
      { name: 'Greek Yogurt with Berries', calories: 180, protein: 18, carbs: 22, fat: 2, benefit: 'Protein + antioxidants' },
      { name: 'Hummus with Veggies', calories: 200, protein: 6, carbs: 20, fat: 10, benefit: 'Fiber + healthy fats' },
      { name: 'Protein Bar', calories: 220, protein: 20, carbs: 22, fat: 8, benefit: 'Convenient option' },
    ];
  } else {
    return [
      { name: 'Turkey & Cheese Roll-ups', calories: 280, protein: 24, carbs: 4, fat: 18, benefit: 'High protein' },
      { name: 'Cottage Cheese & Fruit', calories: 250, protein: 20, carbs: 25, fat: 5, benefit: 'Casein protein' },
      { name: 'Tuna Salad on Crackers', calories: 300, protein: 22, carbs: 18, fat: 15, benefit: 'Omega-3s' },
    ];
  }
}

// Get time of day category
export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

// Format last used date
export function formatLastUsed(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}

// Sort favorites by usage frequency and recency
export function sortFavorites(favorites: FavoriteFood[]): FavoriteFood[] {
  return [...favorites].sort((a, b) => {
    // Primary: usage count (higher is better)
    const usageDiff = b.usageCount - a.usageCount;
    if (usageDiff !== 0) return usageDiff;

    // Secondary: recency (more recent is better)
    return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
  });
}

// Helper function to capitalize first letter
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Format schedule for display
export function formatSchedule(schedule: { type: string; daysOfWeek?: number[]; time: string }): string {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (schedule.type === 'daily') {
    return `Daily at ${schedule.time}`;
  }

  if (schedule.type === 'weekly' && schedule.daysOfWeek) {
    const days = schedule.daysOfWeek.map(d => dayNames[d]).join(', ');
    return `${days} at ${schedule.time}`;
  }

  return `Custom schedule at ${schedule.time}`;
}
