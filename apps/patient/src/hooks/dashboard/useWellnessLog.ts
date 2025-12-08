import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { getDb } from '@nvivo/shared';

export interface WellnessLog {
  id: string;
  date: string;
  mood: number;
  energy: number;
  stress: number;
  sleepQuality: number;
  symptoms: string[];
  notes: string | null;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function useLatestWellnessLog(patientId: string | null) {
  return useQuery({
    queryKey: ['latest-wellness-log', patientId],
    queryFn: async (): Promise<WellnessLog | null> => {
      if (!patientId) return null;

      const db = getDb();
      const logsRef = collection(db, 'patients', patientId, 'wellnessLogs');

      // Get the most recent wellness log
      const q = query(logsRef, orderBy('date', 'desc'), limit(1));

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as WellnessLog;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTodayWellnessLog(patientId: string | null) {
  const today = getTodayDate();

  return useQuery({
    queryKey: ['today-wellness-log', patientId, today],
    queryFn: async (): Promise<WellnessLog | null> => {
      if (!patientId) return null;

      const db = getDb();
      const logsRef = collection(db, 'patients', patientId, 'wellnessLogs');

      const q = query(logsRef, where('date', '==', today), limit(1));

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as WellnessLog;
    },
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000,
  });
}
