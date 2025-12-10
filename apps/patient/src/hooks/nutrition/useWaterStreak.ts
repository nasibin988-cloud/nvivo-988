/**
 * Water Streak Hook
 * Calculates consecutive days of hitting water goal
 */

import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { getDb } from '@nvivo/shared';
import { useAuth } from '../../contexts/AuthContext';

interface WaterStreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

/**
 * Hook to calculate water intake streak
 * @param waterTarget - Daily water target in glasses (default 8)
 */
export function useWaterStreak(waterTarget: number = 8) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['waterStreak', user?.uid, waterTarget],
    queryFn: async (): Promise<WaterStreakData> => {
      if (!user?.uid) return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };

      const db = getDb();
      const trackingRef = collection(db, 'patients', user.uid, 'dailyTracking');

      // Get last 30 days of tracking data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];

      const q = query(
        trackingRef,
        where('date', '>=', startDate),
        orderBy('date', 'desc'),
        limit(30)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
      }

      // Build map of dates to water glasses
      const waterByDate = new Map<string, number>();
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.date && data.waterGlasses !== undefined) {
          waterByDate.set(data.date, data.waterGlasses);
        }
      });

      // Calculate streaks
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let lastCompletedDate: string | null = null;

      const checkDate = new Date();

      // Start from today and go backwards
      for (let i = 0; i < 30; i++) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const glasses = waterByDate.get(dateStr) || 0;

        if (glasses >= waterTarget) {
          tempStreak++;
          if (!lastCompletedDate) {
            lastCompletedDate = dateStr;
          }
          // Only count current streak if it includes today or yesterday
          if (i <= 1 || currentStreak > 0) {
            currentStreak = tempStreak;
          }
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 0;
          // Break current streak calculation if we hit a gap after counting
          if (currentStreak > 0) {
            break;
          }
        }

        checkDate.setDate(checkDate.getDate() - 1);
      }

      longestStreak = Math.max(longestStreak, tempStreak);

      return {
        currentStreak,
        longestStreak,
        lastCompletedDate,
      };
    },
    enabled: !!user?.uid,
    staleTime: 60000, // 1 minute
  });
}
