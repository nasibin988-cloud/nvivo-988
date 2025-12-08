import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@nvivo/shared';

export interface HealthMetrics {
  date: string;
  steps: number | null;
  activeMinutes: number | null;
  caloriesBurned: number | null;
  heartRate: {
    avg: number;
    min: number;
    max: number;
    resting: number;
  } | null;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  } | null;
  bloodGlucose: number | null;
  weight: number | null;
  sleep: {
    duration: number;
    quality: number;
    deep: number;
    rem: number;
    light: number;
  } | null;
  hrv: number | null;
  source: 'manual' | 'wearable' | 'device';
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function useHealthMetrics(patientId: string | null, date?: string) {
  const targetDate = date ?? getTodayDate();

  return useQuery({
    queryKey: ['health-metrics', patientId, targetDate],
    queryFn: async (): Promise<HealthMetrics | null> => {
      if (!patientId) return null;

      const db = getDb();
      const metricsRef = doc(db, 'patients', patientId, 'healthMetrics', targetDate);
      const snapshot = await getDoc(metricsRef);

      if (!snapshot.exists()) {
        return null;
      }

      return {
        date: targetDate,
        ...snapshot.data(),
      } as HealthMetrics;
    },
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // Health data is more dynamic
  });
}
