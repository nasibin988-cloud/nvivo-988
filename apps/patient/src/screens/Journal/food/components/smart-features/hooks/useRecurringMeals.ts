/**
 * useRecurringMeals Hook
 * Manages recurring meal schedules with reminder support
 */

import { useState, useCallback, useMemo } from 'react';
import type { RecurringMeal, FavoriteFood } from '../types';

// Mock initial recurring meals
const MOCK_RECURRING_MEALS: RecurringMeal[] = [
  {
    id: 'rec-1',
    name: 'Morning Protein Shake',
    mealType: 'breakfast',
    foods: [
      {
        id: 'fav-shake',
        name: 'Protein Shake',
        calories: 280,
        protein: 30,
        carbs: 15,
        fat: 8,
        fiber: 3,
        sugar: 5,
        sodium: 150,
        servingSize: '1 shake',
        usageCount: 45,
        lastUsed: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
      },
    ],
    schedule: {
      type: 'daily',
      time: '07:30',
      reminderEnabled: true,
    },
    isActive: true,
    totalCalories: 280,
    totalProtein: 30,
    totalCarbs: 15,
    totalFat: 8,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'rec-2',
    name: 'Post-Workout Meal',
    mealType: 'snack',
    foods: [
      {
        id: 'fav-chicken',
        name: 'Grilled Chicken',
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 4,
        fiber: 0,
        sugar: 0,
        sodium: 74,
        servingSize: '3 oz',
        usageCount: 20,
        lastUsed: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
      },
      {
        id: 'fav-rice',
        name: 'Brown Rice',
        calories: 215,
        protein: 5,
        carbs: 45,
        fat: 2,
        fiber: 4,
        sugar: 0,
        sodium: 10,
        servingSize: '1 cup',
        usageCount: 15,
        lastUsed: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
      },
    ],
    schedule: {
      type: 'weekly',
      daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
      time: '18:00',
      reminderEnabled: true,
    },
    isActive: true,
    totalCalories: 380,
    totalProtein: 36,
    totalCarbs: 45,
    totalFat: 6,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
];

interface UseRecurringMealsReturn {
  recurringMeals: RecurringMeal[];
  activeMeals: RecurringMeal[];
  isLoading: boolean;
  createRecurringMeal: (meal: Omit<RecurringMeal, 'id' | 'createdAt' | 'totalCalories' | 'totalProtein' | 'totalCarbs' | 'totalFat'>) => void;
  updateRecurringMeal: (id: string, updates: Partial<RecurringMeal>) => void;
  deleteRecurringMeal: (id: string) => void;
  toggleMealActive: (id: string) => void;
  getDueMeals: () => RecurringMeal[];
}

export function useRecurringMeals(): UseRecurringMealsReturn {
  const [recurringMeals, setRecurringMeals] = useState<RecurringMeal[]>(MOCK_RECURRING_MEALS);
  const [isLoading] = useState(false);

  // Get only active meals
  const activeMeals = useMemo(
    () => recurringMeals.filter(m => m.isActive),
    [recurringMeals]
  );

  // Calculate totals from foods
  const calculateTotals = (foods: FavoriteFood[]) => ({
    totalCalories: foods.reduce((sum, f) => sum + f.calories, 0),
    totalProtein: foods.reduce((sum, f) => sum + f.protein, 0),
    totalCarbs: foods.reduce((sum, f) => sum + f.carbs, 0),
    totalFat: foods.reduce((sum, f) => sum + f.fat, 0),
  });

  // Create a new recurring meal
  const createRecurringMeal = useCallback((meal: Omit<RecurringMeal, 'id' | 'createdAt' | 'totalCalories' | 'totalProtein' | 'totalCarbs' | 'totalFat'>) => {
    const totals = calculateTotals(meal.foods);
    const newMeal: RecurringMeal = {
      ...meal,
      ...totals,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setRecurringMeals(prev => [...prev, newMeal]);
  }, []);

  // Update an existing recurring meal
  const updateRecurringMeal = useCallback((id: string, updates: Partial<RecurringMeal>) => {
    setRecurringMeals(prev => prev.map(meal => {
      if (meal.id !== id) return meal;

      const updatedFoods = updates.foods || meal.foods;
      const totals = updates.foods ? calculateTotals(updatedFoods) : {};

      return {
        ...meal,
        ...updates,
        ...totals,
      };
    }));
  }, []);

  // Delete a recurring meal
  const deleteRecurringMeal = useCallback((id: string) => {
    setRecurringMeals(prev => prev.filter(m => m.id !== id));
  }, []);

  // Toggle meal active status
  const toggleMealActive = useCallback((id: string) => {
    setRecurringMeals(prev => prev.map(meal =>
      meal.id === id ? { ...meal, isActive: !meal.isActive } : meal
    ));
  }, []);

  // Get meals that are due now (based on schedule)
  const getDueMeals = useCallback(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return activeMeals.filter(meal => {
      const { schedule } = meal;

      // Check time (within 30 min window)
      const [schedHour, schedMin] = schedule.time.split(':').map(Number);
      const [currHour, currMin] = currentTime.split(':').map(Number);
      const schedMinutes = schedHour * 60 + schedMin;
      const currMinutes = currHour * 60 + currMin;
      const timeDiff = Math.abs(currMinutes - schedMinutes);

      if (timeDiff > 30) return false;

      // Check day
      if (schedule.type === 'daily') return true;
      if (schedule.type === 'weekly' && schedule.daysOfWeek) {
        return schedule.daysOfWeek.includes(currentDay);
      }

      return false;
    });
  }, [activeMeals]);

  return {
    recurringMeals,
    activeMeals,
    isLoading,
    createRecurringMeal,
    updateRecurringMeal,
    deleteRecurringMeal,
    toggleMealActive,
    getDueMeals,
  };
}
