/**
 * Food Logs Hook
 * Manages food log data from Firestore with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  limit,
} from 'firebase/firestore';
import { getDb } from '@nvivo/shared';
import { useAuth } from '../../contexts/AuthContext';

// Types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodLog {
  id: string;
  mealType: MealType;
  description: string;
  time: string;
  date: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  sodium: number | null;
  photoUrl?: string;
  isAiAnalyzed?: boolean;
  aiConfidence?: number;
  fdcId?: string; // USDA Food Data Central ID
  createdAt: string;
  updatedAt: string;
}

export interface DailyNutrition {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
  fiber: { current: number; target: number };
  water: { current: number; target: number };
}

export interface DailyFoodData {
  date: string;
  meals: FoodLog[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number;
  };
}

// Helper to get date string
const getDateString = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

// Helper to get date range
const getDateRange = (days: number): { start: string; end: string } => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    start: getDateString(start),
    end: getDateString(end),
  };
};

/**
 * Hook to fetch food logs for a specific date
 */
export function useFoodLogs(date: string = getDateString()) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const logsQuery = useQuery({
    queryKey: ['foodLogs', user?.uid, date],
    queryFn: async (): Promise<FoodLog[]> => {
      if (!user?.uid) return [];

      const db = getDb();
      const logsRef = collection(db, 'patients', user.uid, 'foodLogs');
      const q = query(
        logsRef,
        where('date', '==', date),
        orderBy('createdAt', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as FoodLog[];
    },
    enabled: !!user?.uid,
    staleTime: 30000, // 30 seconds
  });

  // Add food log mutation
  const addLogMutation = useMutation({
    mutationFn: async (newLog: Omit<FoodLog, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user?.uid) throw new Error('Not authenticated');

      const db = getDb();
      const logsRef = collection(db, 'patients', user.uid, 'foodLogs');
      const now = new Date().toISOString();

      const docRef = await addDoc(logsRef, {
        ...newLog,
        createdAt: now,
        updatedAt: now,
      });

      return { id: docRef.id, ...newLog, createdAt: now, updatedAt: now } as FoodLog;
    },
    onSuccess: (newLog) => {
      // Optimistically update the cache
      queryClient.setQueryData<FoodLog[]>(
        ['foodLogs', user?.uid, newLog.date],
        (old = []) => [...old, newLog]
      );
      // Invalidate history queries
      queryClient.invalidateQueries({ queryKey: ['foodLogsHistory'] });
    },
  });

  // Update food log mutation
  const updateLogMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FoodLog> & { id: string }) => {
      if (!user?.uid) throw new Error('Not authenticated');

      const db = getDb();
      const logRef = doc(db, 'patients', user.uid, 'foodLogs', id);
      const now = new Date().toISOString();

      await updateDoc(logRef, {
        ...updates,
        updatedAt: now,
      });

      return { id, ...updates, updatedAt: now };
    },
    onSuccess: (updatedLog) => {
      queryClient.invalidateQueries({ queryKey: ['foodLogs', user?.uid] });
    },
  });

  // Delete food log mutation
  const deleteLogMutation = useMutation({
    mutationFn: async (logId: string) => {
      if (!user?.uid) throw new Error('Not authenticated');

      const db = getDb();
      const logRef = doc(db, 'patients', user.uid, 'foodLogs', logId);
      await deleteDoc(logRef);
      return logId;
    },
    onSuccess: (logId) => {
      // Optimistically update the cache
      queryClient.setQueryData<FoodLog[]>(
        ['foodLogs', user?.uid, date],
        (old = []) => old.filter((log) => log.id !== logId)
      );
      queryClient.invalidateQueries({ queryKey: ['foodLogsHistory'] });
    },
  });

  // Calculate daily totals
  const dailyTotals = logsQuery.data?.reduce(
    (acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
      carbs: acc.carbs + (log.carbs || 0),
      fat: acc.fat + (log.fat || 0),
      fiber: acc.fiber + (log.fiber || 0),
      sodium: acc.sodium + (log.sodium || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 }
  ) || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 };

  return {
    logs: logsQuery.data || [],
    isLoading: logsQuery.isLoading,
    error: logsQuery.error,
    dailyTotals,
    addLog: addLogMutation.mutateAsync,
    updateLog: updateLogMutation.mutateAsync,
    deleteLog: deleteLogMutation.mutateAsync,
    isAdding: addLogMutation.isPending,
    isUpdating: updateLogMutation.isPending,
    isDeleting: deleteLogMutation.isPending,
    refetch: logsQuery.refetch,
  };
}

/**
 * Hook to fetch food log history for charts
 */
export function useFoodLogsHistory(days: number = 7) {
  const { user } = useAuth();
  const { start, end } = getDateRange(days);

  return useQuery({
    queryKey: ['foodLogsHistory', user?.uid, days],
    queryFn: async (): Promise<DailyFoodData[]> => {
      if (!user?.uid) return [];

      const db = getDb();
      const logsRef = collection(db, 'patients', user.uid, 'foodLogs');
      const q = query(
        logsRef,
        where('date', '>=', start),
        where('date', '<=', end),
        orderBy('date', 'desc'),
        orderBy('createdAt', 'asc')
      );

      const snapshot = await getDocs(q);
      const logsByDate: Record<string, FoodLog[]> = {};

      snapshot.docs.forEach((docSnap) => {
        const log = { id: docSnap.id, ...docSnap.data() } as FoodLog;
        if (!logsByDate[log.date]) {
          logsByDate[log.date] = [];
        }
        logsByDate[log.date].push(log);
      });

      // Build daily data array
      const dailyData: DailyFoodData[] = [];
      const current = new Date(start);
      const endDate = new Date(end);

      while (current <= endDate) {
        const dateStr = getDateString(current);
        const meals = logsByDate[dateStr] || [];
        const totals = meals.reduce(
          (acc, log) => ({
            calories: acc.calories + (log.calories || 0),
            protein: acc.protein + (log.protein || 0),
            carbs: acc.carbs + (log.carbs || 0),
            fat: acc.fat + (log.fat || 0),
            fiber: acc.fiber + (log.fiber || 0),
            sodium: acc.sodium + (log.sodium || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 }
        );

        dailyData.push({ date: dateStr, meals, totals });
        current.setDate(current.getDate() + 1);
      }

      return dailyData;
    },
    enabled: !!user?.uid,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to get water intake for today
 */
export function useWaterIntake(date: string = getDateString()) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const waterQuery = useQuery({
    queryKey: ['waterIntake', user?.uid, date],
    queryFn: async (): Promise<number> => {
      if (!user?.uid) return 0;

      const db = getDb();
      const snapshot = await getDocs(
        query(collection(db, 'patients', user.uid, 'dailyTracking'), where('date', '==', date), limit(1))
      );

      if (snapshot.empty) return 0;
      return snapshot.docs[0].data()?.waterGlasses || 0;
    },
    enabled: !!user?.uid,
  });

  const updateWaterMutation = useMutation({
    mutationFn: async (glasses: number) => {
      if (!user?.uid) throw new Error('Not authenticated');

      const db = getDb();
      const trackingRef = collection(db, 'patients', user.uid, 'dailyTracking');
      const q = query(trackingRef, where('date', '==', date), limit(1));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        await addDoc(trackingRef, {
          date,
          waterGlasses: glasses,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await updateDoc(snapshot.docs[0].ref, {
          waterGlasses: glasses,
          updatedAt: new Date().toISOString(),
        });
      }

      return glasses;
    },
    onSuccess: (glasses) => {
      queryClient.setQueryData(['waterIntake', user?.uid, date], glasses);
    },
  });

  return {
    glasses: waterQuery.data || 0,
    isLoading: waterQuery.isLoading,
    updateWater: updateWaterMutation.mutateAsync,
    isUpdating: updateWaterMutation.isPending,
  };
}
