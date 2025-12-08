import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { getDb } from '@nvivo/shared';

export interface AppointmentLocation {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Appointment {
  id: string;
  providerId: string;
  providerName: string;
  providerPhoto?: string;
  type: 'in-person' | 'telehealth';
  specialty: string;
  reason: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  location: AppointmentLocation | null;
  videoCallUrl: string | null;
  notes?: string;
  prepInstructions?: string;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function useNextAppointment(patientId: string | null) {
  return useQuery({
    queryKey: ['next-appointment', patientId],
    queryFn: async (): Promise<Appointment | null> => {
      if (!patientId) return null;

      const db = getDb();
      const appointmentsRef = collection(db, 'patients', patientId, 'appointments');

      // Query for upcoming appointments (status = scheduled or confirmed, date >= today)
      const q = query(
        appointmentsRef,
        where('status', 'in', ['scheduled', 'confirmed']),
        where('date', '>=', getTodayDate()),
        orderBy('date', 'asc'),
        orderBy('time', 'asc'),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as Appointment;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}
