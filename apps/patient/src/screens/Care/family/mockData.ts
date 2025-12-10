/**
 * Family Hub Mock Data
 * Mock data for development and testing
 */

import type {
  FamilyMember,
  CaregivingTarget,
  UnifiedScheduleItem,
  SharedSummary,
  AccessLevel,
} from './types';

// Mock family members (people who can view MY data)
export const mockFamilyMembers: FamilyMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    relationship: 'Spouse',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 123-4567',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face&q=80',
    accessLevel: 'full' as AccessLevel,
    lastActive: '2 hours ago',
    isEmergencyContact: true,
    status: 'active',
  },
  {
    id: '2',
    name: 'Michael Johnson',
    relationship: 'Son',
    email: 'mike.j@email.com',
    phone: '+1 (555) 234-5678',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face&q=80',
    accessLevel: 'limited' as AccessLevel,
    lastActive: '1 day ago',
    isEmergencyContact: false,
    status: 'active',
  },
  {
    id: '3',
    name: 'Emily Johnson',
    relationship: 'Daughter',
    email: 'emily.j@email.com',
    phone: '+1 (555) 345-6789',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face&q=80',
    accessLevel: 'emergency' as AccessLevel,
    lastActive: '3 days ago',
    isEmergencyContact: true,
    status: 'active',
  },
];

// Mock people I am a caregiver FOR
export const mockCaregivingFor: CaregivingTarget[] = [
  {
    id: 'c1',
    name: 'Margaret Johnson',
    relationship: 'Mother',
    avatarUrl: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=200&h=200&fit=crop&crop=face&q=80',
    healthScore: 72,
    nextMedication: '2:00 PM - Metformin',
    nextAppointment: '12/12/24 - Dr. Smith',
    alertCount: 1,
  },
  {
    id: 'c2',
    name: 'Robert Johnson',
    relationship: 'Father',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face&q=80',
    healthScore: 85,
    nextMedication: '6:00 PM - Lisinopril',
    nextAppointment: '12/18/24 - Dr. Williams',
    alertCount: 0,
  },
];

// Mock unified schedule
export const mockUnifiedSchedule: UnifiedScheduleItem[] = [
  {
    id: 's1',
    time: '8:00 AM',
    type: 'medication',
    title: 'Metformin 500mg',
    member: 'Margaret Johnson',
    memberColor: 'rose',
    status: 'completed',
  },
  {
    id: 's2',
    time: '10:00 AM',
    type: 'appointment',
    title: 'Dr. Anderson - Cardiology',
    member: 'You',
    memberColor: 'blue',
    status: 'upcoming',
  },
  {
    id: 's3',
    time: '12:00 PM',
    type: 'medication',
    title: 'Lisinopril 10mg',
    member: 'Robert Johnson',
    memberColor: 'emerald',
    status: 'upcoming',
  },
  {
    id: 's4',
    time: '2:00 PM',
    type: 'medication',
    title: 'Metformin 500mg',
    member: 'Margaret Johnson',
    memberColor: 'rose',
    status: 'upcoming',
  },
  {
    id: 's5',
    time: '3:30 PM',
    type: 'task',
    title: 'Weekly check-in call',
    member: 'Margaret Johnson',
    memberColor: 'rose',
    status: 'upcoming',
  },
];

// Mock shared summaries
export const mockSharedSummaries: SharedSummary[] = [
  {
    id: 'sh1',
    recipientEmail: 'dr.smith@clinic.com',
    createdAt: '12/05/24',
    expiresAt: '12/12/24',
    accessCode: '806890',
    viewCount: 3,
    includesMetrics: true,
    includesMedications: true,
    includesAppointments: false,
  },
];

// Mock vitals data for caregiver dashboard
export const mockCaregiverVitals = [
  { label: 'Blood Pressure', value: '128/82', unit: 'mmHg', status: 'normal' as const },
  { label: 'Heart Rate', value: '72', unit: 'bpm', status: 'normal' as const },
  { label: 'Blood Sugar', value: '145', unit: 'mg/dL', status: 'elevated' as const },
];

// Notification settings presets
export const defaultNotificationSettings = [
  { label: 'Medication reminders', enabled: true },
  { label: 'Appointment alerts', enabled: true },
  { label: 'Health updates', enabled: false },
];
