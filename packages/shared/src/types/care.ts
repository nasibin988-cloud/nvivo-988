import type { Timestamp } from 'firebase/firestore';

export type ClinicianSpecialty =
  | 'cardiologist'
  | 'primary_care'
  | 'neurologist'
  | 'nurse_practitioner'
  | 'registered_nurse'
  | 'dietitian'
  | 'health_coach'
  | 'mental_health'
  | 'physical_therapist'
  | 'pharmacist'
  | 'care_coordinator'
  | 'other';

export interface CareTeamMember {
  id: string;
  name: string;
  title: string;
  specialty: ClinicianSpecialty;
  role: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  isPrimary: boolean;
  createdAt: Timestamp;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  scheduledTimes: string[];
  instructions: string;
  prescribedBy: string;
  startDate: Timestamp;
  status: 'active' | 'paused' | 'discontinued';
  createdAt: Timestamp;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  scheduledTime: Timestamp;
  status: 'taken' | 'missed' | 'skipped';
  takenAt: Timestamp | null;
  notes: string | null;
  createdAt: Timestamp;
}

export type LifestyleCategory = 'exercise' | 'nutrition' | 'sleep' | 'mindset' | 'other';

export interface LifestyleTask {
  id: string;
  category: LifestyleCategory;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'custom';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'paused';
  assignedBy: string;
  createdAt: Timestamp;
}

export interface TaskLog {
  id: string;
  taskId: string;
  date: string;
  completed: boolean;
  completedAt: Timestamp | null;
  notes: string | null;
  createdAt: Timestamp;
}

export interface Appointment {
  id: string;
  providerId: string;
  providerName: string;
  type: 'in-person' | 'telehealth';
  specialty: string;
  reason: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  location: string | null;
  videoCallUrl: string | null;
  notes: string | null;
  createdAt: Timestamp;
}
