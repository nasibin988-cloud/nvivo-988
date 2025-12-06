import type { Timestamp } from 'firebase/firestore';

export interface HealthMetrics {
  date: string;
  steps: number | null;
  activeMinutes: number | null;
  caloriesBurned: number | null;
  heartRate: {
    avg: number;
    min: number;
    max: number;
    resting: number;
  } | null;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  } | null;
  bloodGlucose: number | null;
  weight: number | null;
  sleep: {
    duration: number;
    quality: number;
    deep: number;
    rem: number;
    light: number;
  } | null;
  hrv: number | null;
  source: 'manual' | 'wearable' | 'device';
  updatedAt: Timestamp;
}

export interface LabResult {
  id: string;
  date: string;
  orderedBy: string;
  type: string;
  results: Array<{
    name: string;
    value: number;
    unit: string;
    range: { min: number; max: number };
    status: 'normal' | 'low' | 'high';
  }>;
  createdAt: Timestamp;
}

export interface WellnessLog {
  id: string;
  date: string;
  mood: number;
  energy: number;
  stress: number;
  sleepQuality: number;
  notes: string | null;
  tags: string[];
  createdAt: Timestamp;
}

export interface FoodLog {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  calories: number | null;
  photoUrl: string | null;
  notes: string | null;
  createdAt: Timestamp;
}

export interface ExerciseLog {
  id: string;
  date: string;
  type: string;
  duration: number;
  intensity: 'low' | 'moderate' | 'high';
  caloriesBurned: number | null;
  notes: string | null;
  createdAt: Timestamp;
}

export interface WearableConnection {
  id: string;
  provider: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSyncAt: Timestamp | null;
  connectedAt: Timestamp;
  metadata: Record<string, unknown>;
}
