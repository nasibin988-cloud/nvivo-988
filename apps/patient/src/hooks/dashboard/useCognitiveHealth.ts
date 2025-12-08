import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
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

export function useCognitiveHealth(patientId: string | null) {
  return useQuery({
    queryKey: ['cognitiveHealth', patientId],
    queryFn: async (): Promise<CognitiveHealth | null> => {
      if (!patientId) return null;

      const db = getDb();
      const cognitiveRef = doc(db, 'patients', patientId, 'cognitiveHealth', 'latest');
      const snapshot = await getDoc(cognitiveRef);

      if (!snapshot.exists()) {
        return null;
      }

      return snapshot.data() as CognitiveHealth;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}
