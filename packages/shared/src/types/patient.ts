import type { Timestamp } from 'firebase/firestore';
import type { NutritionDetailLevel } from './models/nutrition';

/**
 * Patient app settings - stored in Firestore patients/{patientId}/settings
 */
export interface PatientSettings {
  nutrition: NutritionSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  updatedAt: Timestamp;
}

/**
 * Nutrition-specific settings
 */
export interface NutritionSettings {
  /** Detail level for AI food analysis: essential, extended, complete */
  detailLevel: NutritionDetailLevel;
  /** Daily calorie goal */
  dailyCalorieGoal: number;
  /** Macro targets as percentages (should sum to ~100) */
  macroTargets: {
    protein: number; // percentage
    carbs: number;   // percentage
    fat: number;     // percentage
  };
  /** Whether to track specific micronutrients */
  trackMicronutrients: boolean;
  /** Specific nutrients to highlight in UI */
  highlightedNutrients: string[];
}

/**
 * Notification settings
 */
export interface NotificationSettings {
  mealReminders: boolean;
  medicationReminders: boolean;
  appointmentReminders: boolean;
  healthInsights: boolean;
  quietHoursStart: string | null; // HH:mm format
  quietHoursEnd: string | null;   // HH:mm format
}

/**
 * Privacy settings
 */
export interface PrivacySettings {
  shareHealthDataWithCareTeam: boolean;
  shareHealthDataWithFamily: boolean;
  allowAnonymousDataForResearch: boolean;
}

/**
 * Default patient settings
 */
export const DEFAULT_PATIENT_SETTINGS: Omit<PatientSettings, 'updatedAt'> = {
  nutrition: {
    detailLevel: 'essential',
    dailyCalorieGoal: 2000,
    macroTargets: {
      protein: 25,
      carbs: 50,
      fat: 25,
    },
    trackMicronutrients: false,
    highlightedNutrients: [],
  },
  notifications: {
    mealReminders: true,
    medicationReminders: true,
    appointmentReminders: true,
    healthInsights: true,
    quietHoursStart: null,
    quietHoursEnd: null,
  },
  privacy: {
    shareHealthDataWithCareTeam: true,
    shareHealthDataWithFamily: false,
    allowAnonymousDataForResearch: false,
  },
};

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
