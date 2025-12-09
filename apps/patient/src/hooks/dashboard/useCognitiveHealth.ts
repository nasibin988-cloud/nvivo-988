import { useQuery } from '@tanstack/react-query';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { getDb } from '@nvivo/shared';

export interface BrainMRI {
  status: string;
  date: string;
  findings: string;
}

export interface CognitiveAssessment {
  moca: number; // Montreal Cognitive Assessment (0-30)
  date: string;
}

export type RiskStatus = 'on-target' | 'attention' | 'alert';

export interface StrokeRisk {
  bloodPressure: {
    value: string;
    status: RiskStatus;
  };
  carotidPlaque: {
    value: string;
    status: RiskStatus;
  };
  hba1c: {
    value: number;
    status: RiskStatus;
  };
}

export interface DASS21 {
  depression: number; // 0-42
  anxiety: number; // 0-42
  stress: number; // 0-42
  date: string;
}

export interface MentalHealth {
  dass21: DASS21;
  qols: {
    score: number;
    date: string;
  };
  moodTrend?: number[]; // Last 30 days
  sleepQuality?: number[]; // Last 30 days
  sleepHours?: number[]; // Last 30 days
}

export interface CognitiveHealth {
  brainMRI: BrainMRI;
  cognitiveAssessment: CognitiveAssessment;
  strokeRisk: StrokeRisk;
  mentalHealth: MentalHealth;
  updatedAt?: unknown;
}

interface WellnessLogData {
  date: string;
  mood: number;
  energy: number;
  stress: number;
  sleepQuality: number;
  sleepHours?: number;
}

export function useCognitiveHealth(patientId: string | null) {
  return useQuery({
    queryKey: ['cognitiveHealth', patientId],
    queryFn: async (): Promise<CognitiveHealth | null> => {
      if (!patientId) return null;

      const db = getDb();

      // Fetch cognitive health document
      const cognitiveRef = doc(db, 'patients', patientId, 'cognitiveHealth', 'latest');
      const snapshot = await getDoc(cognitiveRef);

      if (!snapshot.exists()) {
        return null;
      }

      const cognitiveData = snapshot.data() as CognitiveHealth;

      // Fetch the last 30 days of wellness logs for real trend data
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const startDateStr = startDate.toISOString().split('T')[0];

      const logsRef = collection(db, 'patients', patientId, 'wellnessLogs');
      const q = query(
        logsRef,
        where('date', '>=', startDateStr),
        orderBy('date', 'asc'),
        limit(30)
      );

      const logsSnapshot = await getDocs(q);

      // Extract mood and sleep data from wellness logs
      const moodTrend: number[] = [];
      const sleepQuality: number[] = [];
      const sleepHours: number[] = [];

      logsSnapshot.docs.forEach((doc) => {
        const data = doc.data() as WellnessLogData;
        moodTrend.push(data.mood);
        sleepQuality.push(data.sleepQuality);
        if (data.sleepHours !== undefined) {
          sleepHours.push(data.sleepHours);
        }
      });

      // Merge real wellness data with cognitive health document
      return {
        ...cognitiveData,
        mentalHealth: {
          ...cognitiveData.mentalHealth,
          moodTrend: moodTrend.length > 0 ? moodTrend : cognitiveData.mentalHealth?.moodTrend,
          sleepQuality: sleepQuality.length > 0 ? sleepQuality : cognitiveData.mentalHealth?.sleepQuality,
          sleepHours: sleepHours.length > 0 ? sleepHours : cognitiveData.mentalHealth?.sleepHours,
        },
      };
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}
