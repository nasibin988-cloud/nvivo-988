/**
 * Medications Tab Data
 * Mock data and configuration constants
 */

import { CheckCircle2, Timer, XCircle, Clock } from 'lucide-react';
import type { Medication, AdherenceData, MedicationStatus, StatusConfig } from './types';

// Mock medications
export const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    scheduledTime: '8:00 AM',
    instructions: 'Take with food',
    purpose: 'Blood sugar control',
    status: 'taken',
    takenAt: '8:05 AM',
  },
  {
    id: '2',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    scheduledTime: '9:00 AM',
    instructions: 'Can be taken with or without food',
    purpose: 'Blood pressure management',
    status: 'taken',
    takenAt: '9:12 AM',
  },
  {
    id: '3',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    scheduledTime: '8:00 PM',
    instructions: 'Take with dinner',
    purpose: 'Blood sugar control',
    status: 'pending',
  },
  {
    id: '4',
    name: 'Vitamin D3',
    dosage: '2000 IU',
    frequency: 'Once daily',
    scheduledTime: '12:00 PM',
    purpose: 'Vitamin supplementation',
    status: 'upcoming',
  },
];

// Weekly adherence history
export const mockAdherenceHistory: AdherenceData[] = [
  { date: 'Mon', percentage: 100 },
  { date: 'Tue', percentage: 100 },
  { date: 'Wed', percentage: 75 },
  { date: 'Thu', percentage: 100 },
  { date: 'Fri', percentage: 100 },
  { date: 'Sat', percentage: 50 },
  { date: 'Sun', percentage: 100 },
];

// Generate 14-day data
export const mock14DayData: AdherenceData[] = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  }),
  percentage: Math.random() > 0.2 ? 100 : Math.random() > 0.5 ? 75 : 50,
}));

// Status configuration
export const statusConfig: Record<MedicationStatus, StatusConfig> = {
  taken: {
    label: 'Taken',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15 border-emerald-500/30',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Due Now',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/15 border-amber-500/30',
    icon: Timer,
  },
  missed: {
    label: 'Missed',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/15 border-rose-500/30',
    icon: XCircle,
  },
  upcoming: {
    label: 'Upcoming',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15 border-blue-500/30',
    icon: Clock,
  },
};
