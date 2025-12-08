import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@nvivo/shared';

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  streakStartDate: string;
}

export function useStreak(patientId: string | null) {
  return useQuery({
    queryKey: ['streak', patientId],
    queryFn: async (): Promise<Streak | null> => {
      if (!patientId) return null;

      const db = getDb();
      const streakRef = doc(db, 'patients', patientId, 'streaks', 'current');
      const snapshot = await getDoc(streakRef);

      if (!snapshot.exists()) {
        return null;
      }

      return snapshot.data() as Streak;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}
