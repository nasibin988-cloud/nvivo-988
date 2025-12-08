import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getDb } from '@nvivo/shared';

export interface MedicationLog {
  id: string;
  date: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  takenAt: string | null;
  status: 'taken' | 'missed' | 'skipped';
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  scheduledTimes: string[];
  instructions: string;
  prescribedBy: string;
  status: 'active' | 'paused' | 'discontinued';
}

export interface MedicationStatus {
  totalDoses: number;
  takenDoses: number;
  pendingDoses: number;
  missedDoses: number;
  medications: Array<{
    id: string;
    name: string;
    dosage: string;
    scheduledTime: string;
    status: 'taken' | 'pending' | 'missed' | 'upcoming';
    takenAt?: string;
  }>;
  adherencePercentage: number;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getCurrentHour(): number {
  return new Date().getHours();
}

function parseTimeToHour(time: string): number {
  const [hours] = time.split(':').map(Number);
  return hours;
}

export function useTodayMedicationStatus(patientId: string | null) {
  const today = getTodayDate();

  return useQuery({
    queryKey: ['today-medication-status', patientId, today],
    queryFn: async (): Promise<MedicationStatus> => {
      if (!patientId) {
        return {
          totalDoses: 0,
          takenDoses: 0,
          pendingDoses: 0,
          missedDoses: 0,
          medications: [],
          adherencePercentage: 0,
        };
      }

      const db = getDb();
      const currentHour = getCurrentHour();

      // Get active medications
      const medsRef = collection(db, 'patients', patientId, 'medications');
      const medsQuery = query(medsRef, where('status', '==', 'active'));
      const medsSnapshot = await getDocs(medsQuery);

      const medications: Medication[] = medsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Medication[];

      // Get today's medication logs
      const logsRef = collection(db, 'patients', patientId, 'medicationLogs');
      const logsQuery = query(logsRef, where('date', '==', today));
      const logsSnapshot = await getDocs(logsQuery);

      const logs = new Map<string, MedicationLog>();
      logsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        // Key by medicationId + scheduledTime to handle multiple doses
        const key = `${data.medicationId}-${data.scheduledTime}`;
        logs.set(key, {
          id: doc.id,
          date: data.date as string,
          medicationId: data.medicationId as string,
          medicationName: data.medicationName as string,
          dosage: data.dosage as string,
          scheduledTime: data.scheduledTime as string,
          takenAt: data.takenAt as string | null,
          status: data.status as 'taken' | 'missed' | 'skipped',
        });
      });

      // Build status for each scheduled dose
      const medicationStatuses: MedicationStatus['medications'] = [];
      let takenCount = 0;
      let pendingCount = 0;
      let missedCount = 0;

      for (const med of medications) {
        for (const scheduledTime of med.scheduledTimes) {
          const key = `${med.id}-${scheduledTime}`;
          const log = logs.get(key);
          const scheduledHour = parseTimeToHour(scheduledTime);

          let status: 'taken' | 'pending' | 'missed' | 'upcoming';

          if (log && log.status === 'taken') {
            status = 'taken';
            takenCount++;
          } else if (currentHour < scheduledHour) {
            status = 'upcoming';
            pendingCount++;
          } else if (currentHour === scheduledHour) {
            status = 'pending';
            pendingCount++;
          } else {
            // Past the scheduled time and not taken
            status = 'missed';
            missedCount++;
          }

          medicationStatuses.push({
            id: med.id,
            name: med.name,
            dosage: med.dosage,
            scheduledTime,
            status,
            takenAt: log?.takenAt ?? undefined,
          });
        }
      }

      const totalDoses = medicationStatuses.length;
      const adherencePercentage =
        totalDoses > 0 ? Math.round((takenCount / (takenCount + missedCount)) * 100) || 100 : 100;

      return {
        totalDoses,
        takenDoses: takenCount,
        pendingDoses: pendingCount,
        missedDoses: missedCount,
        medications: medicationStatuses.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime)),
        adherencePercentage,
      };
    },
    enabled: !!patientId,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute to update status
  });
}
