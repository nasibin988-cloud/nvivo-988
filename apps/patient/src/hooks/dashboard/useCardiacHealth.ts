import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { getDb, createLogger } from '@nvivo/shared';

const log = createLogger('useCardiacHealth');

export interface PlaqueData {
  tpv: number; // Total Plaque Volume mm³
  cadRads: number;
  cadRadsDescription: string;
  ffr: number; // Fractional Flow Reserve
  pav: number; // Percent Atheroma Volume %
  lrnc: number; // Low Radiodensity NonCalcified plaque mm³
  scanDate: string;
}

export interface LipidPanel {
  ldl: number;
  hdl: number;
  triglycerides: number;
  testDate: string;
}

export interface Metabolic {
  hba1c: number;
  testDate: string;
}

export interface Biomarkers {
  apoB: number;
  hsCRP: number;
  lpA: number;
  testDate: string;
}

export interface VitalTrend {
  date: string;
  value: number;
}

export interface BloodPressureTrend {
  date: string;
  systolic: number;
  diastolic: number;
}

export type TrendDirection = 'increasing' | 'decreasing' | 'stable';

export interface CardiacHealth {
  plaqueData: PlaqueData;
  lipidPanel: LipidPanel;
  metabolic: Metabolic;
  biomarkers: Biomarkers;
  // Blood pressure trend (last 30 days)
  bloodPressureTrend?: BloodPressureTrend[];
  bloodPressureTrendDirection?: TrendDirection;
  latestBloodPressure?: string;
  // LDL trend (last 12 months)
  ldlTrend?: VitalTrend[];
  ldlTrendDirection?: TrendDirection;
  updatedAt?: unknown;
}

export function useCardiacHealth(patientId: string | null) {
  return useQuery({
    queryKey: ['cardiacHealth', patientId],
    queryFn: async (): Promise<CardiacHealth | null> => {
      if (!patientId) return null;

      const db = getDb();
      const cardiacRef = doc(db, 'patients', patientId, 'cardiacHealth', 'latest');
      const snapshot = await getDoc(cardiacRef);

      if (!snapshot.exists()) {
        log.debug('No document found for patientId:', patientId);
        return null;
      }

      const data = snapshot.data() as CardiacHealth;
      log.debug('Data fetched', {
        patientId,
        hasBPTrend: !!data.bloodPressureTrend,
        bpTrendLength: data.bloodPressureTrend?.length,
        hasLDLTrend: !!data.ldlTrend,
        ldlTrendLength: data.ldlTrend?.length,
      });
      return data;
    },
    enabled: !!patientId,
    staleTime: 0, // Force fresh fetch every time
  });
}
