import type { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'patient';
  patientId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PatientProfile {
  height: { value: number; unit: 'cm' | 'in' } | null;
  weight: { value: number; unit: 'kg' | 'lb' } | null;
  bloodType: string | null;
  allergies: string[];
  conditions: string[];
  updatedAt: Timestamp;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  streakStartDate: string;
  updatedAt: Timestamp;
}

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  relationship: string;
  accessLevel: 'view' | 'full';
  permissions: string[];
  status: 'active' | 'pending' | 'revoked';
  createdAt: Timestamp;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read: boolean;
  readAt: Timestamp | null;
  createdAt: Timestamp;
}
