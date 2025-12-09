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
  sleepHours?: number;
  tags?: string[];
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

export function useWellnessHistory(patientId: string | null, days = 365) {
  return useQuery({
    queryKey: ['wellness-history', patientId, days],
    queryFn: async (): Promise<Record<string, WellnessLog>> => {
      if (!patientId) return {};

      const db = getDb();
      const logsRef = collection(db, 'patients', patientId, 'wellnessLogs');

      // Get logs from the last N days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];

      const q = query(
        logsRef,
        where('date', '>=', startDateStr),
        orderBy('date', 'desc'),
        limit(days)
      );

      const snapshot = await getDocs(q);

      const history: Record<string, WellnessLog> = {};
      snapshot.docs.forEach((docSnapshot) => {
        const data = docSnapshot.data() as Omit<WellnessLog, 'id'>;
        history[data.date] = {
          ...data,
          id: docSnapshot.id,
        };
      });

      return history;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}
