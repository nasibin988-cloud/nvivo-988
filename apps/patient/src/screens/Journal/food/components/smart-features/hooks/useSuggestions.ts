/**
 * useSuggestions Hook
 * Generates AI-powered meal suggestions based on nutrition gaps and history
 */

import { useMemo } from 'react';
import type { MealSuggestion, FavoriteFood, NutritionGap } from '../types';
import { calculateNutritionGaps, generateSuggestions, getTimeOfDay } from '../utils';

interface UseSuggestionsProps {
  currentTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  favorites: FavoriteFood[];
}

interface UseSuggestionsReturn {
  suggestions: MealSuggestion[];
  nutritionGaps: NutritionGap[];
  topGap: NutritionGap | null;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  isOnTrack: boolean;
  progressPercentage: number;
}

export function useSuggestions({
  currentTotals,
  targets,
  favorites,
}: UseSuggestionsProps): UseSuggestionsReturn {
  // Get current time of day
  const timeOfDay = useMemo(() => getTimeOfDay(), []);

  // Calculate nutrition gaps
  const nutritionGaps = useMemo(
    () => calculateNutritionGaps(currentTotals, targets),
    [currentTotals, targets]
  );

  // Get the biggest gap
  const topGap = useMemo(
    () => nutritionGaps.length > 0 ? nutritionGaps[0] : null,
    [nutritionGaps]
  );

  // Generate suggestions
  const suggestions = useMemo(
    () => generateSuggestions(nutritionGaps, favorites, timeOfDay),
    [nutritionGaps, favorites, timeOfDay]
  );

  // Check if user is on track (all macros > 70%)
  const isOnTrack = useMemo(
    () => nutritionGaps.every(gap => gap.percentage >= 70),
    [nutritionGaps]
  );

  // Calculate overall progress
  const progressPercentage = useMemo(() => {
    const caloriePercent = Math.min((currentTotals.calories / targets.calories) * 100, 100);
    const proteinPercent = Math.min((currentTotals.protein / targets.protein) * 100, 100);
    const carbsPercent = Math.min((currentTotals.carbs / targets.carbs) * 100, 100);
    const fatPercent = Math.min((currentTotals.fat / targets.fat) * 100, 100);

    return Math.round((caloriePercent + proteinPercent + carbsPercent + fatPercent) / 4);
  }, [currentTotals, targets]);

  return {
    suggestions,
    nutritionGaps,
    topGap,
    timeOfDay,
    isOnTrack,
    progressPercentage,
  };
}
