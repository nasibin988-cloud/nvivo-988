import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getDb } from '@nvivo/shared';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodLog {
  id: string;
  date: string;
  mealType: MealType;
  description: string;
  calories?: number;
  loggedAt: string;
}

export interface FoodLogStatus {
  totalMeals: number;
  loggedMeals: number;
  pendingMeals: number;
  totalCalories: number;
  meals: Array<{
    type: MealType;
    logged: boolean;
    description?: string;
    calories?: number;
    loggedAt?: string;
  }>;
  completionPercentage: number;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getCurrentHour(): number {
  return new Date().getHours();
}

const MEAL_SCHEDULE: Array<{ type: MealType; startHour: number; endHour: number }> = [
  { type: 'breakfast', startHour: 6, endHour: 10 },
  { type: 'lunch', startHour: 11, endHour: 14 },
  { type: 'snack', startHour: 14, endHour: 17 },
  { type: 'dinner', startHour: 17, endHour: 21 },
];

export function useTodayFoodLogStatus(patientId: string | null) {
  const today = getTodayDate();

  return useQuery({
    queryKey: ['today-food-log-status', patientId, today],
    queryFn: async (): Promise<FoodLogStatus> => {
      if (!patientId) {
        return {
          totalMeals: 4,
          loggedMeals: 0,
          pendingMeals: 0,
          totalCalories: 0,
          meals: MEAL_SCHEDULE.map((m) => ({ type: m.type, logged: false })),
          completionPercentage: 0,
        };
      }

      const db = getDb();
      const currentHour = getCurrentHour();

      // Get today's food logs
      const logsRef = collection(db, 'patients', patientId, 'foodLogs');
      const logsQuery = query(logsRef, where('date', '==', today));
      const snapshot = await getDocs(logsQuery);

      const logsByMeal = new Map<MealType, FoodLog>();
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        logsByMeal.set(data.mealType as MealType, {
          id: doc.id,
          date: data.date as string,
          mealType: data.mealType as MealType,
          description: data.description as string,
          calories: data.calories as number | undefined,
          loggedAt: data.loggedAt as string,
        });
      });

      // Determine which meals should be logged by now
      let expectedMeals = 0;
      for (const meal of MEAL_SCHEDULE) {
        if (currentHour >= meal.endHour) {
          expectedMeals++;
        }
      }

      // Build status for each meal
      const meals = MEAL_SCHEDULE.map((meal) => {
        const log = logsByMeal.get(meal.type);
        return {
          type: meal.type,
          logged: !!log,
          description: log?.description,
          calories: log?.calories,
          loggedAt: log?.loggedAt,
        };
      });

      const loggedMeals = meals.filter((m) => m.logged).length;
      const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);

      // Only count meals that should have been logged by now
      const pendingMeals = Math.max(0, expectedMeals - loggedMeals);
      const completionPercentage = expectedMeals > 0 ? Math.round((loggedMeals / expectedMeals) * 100) : 100;

      return {
        totalMeals: 4,
        loggedMeals,
        pendingMeals,
        totalCalories,
        meals,
        completionPercentage,
      };
    },
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 2 * 60 * 1000,
  });
}
