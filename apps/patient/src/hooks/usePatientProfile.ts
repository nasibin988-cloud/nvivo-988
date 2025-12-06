import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { getDb, type Patient } from '@nvivo/shared';

export function usePatientProfile(patientId: string | null) {
  return useQuery({
    queryKey: ['patient-profile', patientId],
    queryFn: async (): Promise<Patient | null> => {
      if (!patientId) return null;

      const db = getDb();
      const patientRef = doc(db, 'patients', patientId);
      const snapshot = await getDoc(patientRef);

      if (!snapshot.exists()) {
        return null;
      }

      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as Patient;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}
