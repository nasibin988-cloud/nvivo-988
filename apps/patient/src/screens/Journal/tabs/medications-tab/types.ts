/**
 * Medications Tab Types
 */

import type { Check } from 'lucide-react';

export type MedicationStatus = 'taken' | 'pending' | 'missed' | 'upcoming';
export type ViewMode = 'today' | 'history';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  scheduledTime: string;
  instructions?: string;
  purpose?: string;
  status: MedicationStatus;
  takenAt?: string;
}

export interface AdherenceData {
  date: string;
  percentage: number;
}

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: typeof Check;
}
