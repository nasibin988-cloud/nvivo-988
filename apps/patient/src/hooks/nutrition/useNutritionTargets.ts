/**
 * Nutrition Targets Hook
 * Fetches personalized nutrition targets from patient profile
 */

import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@nvivo/shared';
import { useAuth } from '../../contexts/AuthContext';

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  water: number; // glasses
  saturatedFat?: number;
  sugar?: number;
  cholesterol?: number;
}

// Default targets based on general guidelines
const DEFAULT_TARGETS: NutritionTargets = {
  calories: 2000,
  protein: 50, // grams
  carbs: 250, // grams
  fat: 65, // grams
  fiber: 28, // grams
  sodium: 2300, // mg
  water: 8, // glasses
  saturatedFat: 20, // grams
  sugar: 50, // grams
  cholesterol: 300, // mg
};

// Condition-specific target adjustments
const CONDITION_ADJUSTMENTS: Record<string, Partial<NutritionTargets>> = {
  hypertension: {
    sodium: 1500, // Lower sodium for blood pressure
  },
  diabetes: {
    carbs: 180, // Lower carbs
    sugar: 25, // Much lower sugar
    fiber: 35, // Higher fiber
  },
  heart_disease: {
    saturatedFat: 13, // Lower saturated fat
    cholesterol: 200, // Lower cholesterol
    sodium: 1500,
    fiber: 30,
  },
  obesity: {
    calories: 1500, // Caloric deficit
    carbs: 150,
    fiber: 35,
  },
  kidney_disease: {
    protein: 40, // Lower protein
    sodium: 1500,
  },
  high_cholesterol: {
    saturatedFat: 13,
    cholesterol: 200,
    fiber: 30,
  },
};

// Goal-specific adjustments
const GOAL_ADJUSTMENTS: Record<string, Partial<NutritionTargets>> = {
  weight_loss: {
    calories: 1500,
    carbs: 150,
    fiber: 35,
  },
  muscle_gain: {
    calories: 2500,
    protein: 120,
  },
  heart_health: {
    saturatedFat: 13,
    fiber: 30,
    sodium: 1500,
  },
  blood_sugar_control: {
    carbs: 150,
    sugar: 25,
    fiber: 35,
  },
  energy_boost: {
    calories: 2200,
    carbs: 275,
    protein: 70,
  },
};

/**
 * Hook to get personalized nutrition targets
 */
export function useNutritionTargets() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['nutritionTargets', user?.uid],
    queryFn: async (): Promise<NutritionTargets> => {
      if (!user?.uid) return DEFAULT_TARGETS;

      // Try to get custom targets from patient profile
      const db = getDb();
      const profileRef = doc(db, 'patients', user.uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        return DEFAULT_TARGETS;
      }

      const profile = profileSnap.data();

      // Start with defaults
      let targets = { ...DEFAULT_TARGETS };

      // Apply custom targets if set
      if (profile.nutritionTargets) {
        targets = { ...targets, ...profile.nutritionTargets };
      }

      // Apply condition-based adjustments
      const conditions: string[] = profile.healthConditions || [];
      conditions.forEach((condition) => {
        const adjustment = CONDITION_ADJUSTMENTS[condition.toLowerCase().replace(/\s+/g, '_')];
        if (adjustment) {
          targets = { ...targets, ...adjustment };
        }
      });

      // Apply goal-based adjustments
      const goals: string[] = profile.dietaryGoals || [];
      goals.forEach((goal) => {
        const adjustment = GOAL_ADJUSTMENTS[goal.toLowerCase().replace(/\s+/g, '_')];
        if (adjustment) {
          targets = { ...targets, ...adjustment };
        }
      });

      // Apply BMR-based calorie adjustment if available
      if (profile.bmr && profile.activityLevel) {
        const activityMultipliers: Record<string, number> = {
          sedentary: 1.2,
          light: 1.375,
          moderate: 1.55,
          active: 1.725,
          very_active: 1.9,
        };
        const multiplier = activityMultipliers[profile.activityLevel] || 1.55;
        const tdee = Math.round(profile.bmr * multiplier);

        // Adjust based on goal
        if (goals.includes('weight_loss')) {
          targets.calories = Math.max(1200, tdee - 500); // 500 cal deficit
        } else if (goals.includes('muscle_gain')) {
          targets.calories = tdee + 300; // 300 cal surplus
        } else {
          targets.calories = tdee;
        }
      }

      return targets;
    },
    enabled: !!user?.uid,
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Hook to get just the calorie target (for simpler components)
 */
export function useCalorieTarget(): number {
  const { data: targets } = useNutritionTargets();
  return targets?.calories || DEFAULT_TARGETS.calories;
}

/**
 * Calculate macro percentages
 */
export function calculateMacroPercentages(targets: NutritionTargets): {
  protein: number;
  carbs: number;
  fat: number;
} {
  const proteinCals = targets.protein * 4;
  const carbsCals = targets.carbs * 4;
  const fatCals = targets.fat * 9;
  const totalCals = proteinCals + carbsCals + fatCals;

  return {
    protein: Math.round((proteinCals / totalCals) * 100),
    carbs: Math.round((carbsCals / totalCals) * 100),
    fat: Math.round((fatCals / totalCals) * 100),
  };
}

export { DEFAULT_TARGETS };
