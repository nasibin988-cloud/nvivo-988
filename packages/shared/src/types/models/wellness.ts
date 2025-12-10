/**
 * Wellness domain types - Single source of truth for wellness/mood tracking
 */

import type { DateString, BaseEntity } from './common';

/**
 * Wellness log entry - daily mood, energy, stress tracking
 */
export interface WellnessLog extends BaseEntity {
  date: DateString;
  mood: number;        // 1-10 scale
  energy: number;      // 1-10 scale
  stress: number;      // 1-10 scale
  sleepQuality: number; // 1-10 scale
  sleepHours: number;
  symptoms: string[];
  notes: string;
  voiceNoteUrl?: string;
  tags: string[];
}

/**
 * History log format for calendar/timeline display
 */
export interface HistoryLog {
  id: string;
  date: string;
  mood: number;
  energy: number;
  stress: number;
  sleepQuality: number;
  sleepHours: number;
  symptoms: string[];
  notes: string;
  voiceNoteUrl?: string;
  tags: string[];
  createdAt: string;
}

/**
 * Streak data for gamification
 */
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

/**
 * View modes for wellness tab
 */
export type WellnessViewMode = 'today' | 'history';

/**
 * Negative tags that indicate warning states
 */
export const NEGATIVE_TAGS = [
  'anxious',
  'stressed',
  'sad',
  'tired',
  'overwhelmed',
  'irritable',
  'lonely',
  'unmotivated',
] as const;

/**
 * Common symptom options for quick selection
 */
export const SYMPTOM_OPTIONS = [
  'headache',
  'fatigue',
  'nausea',
  'dizziness',
  'muscle pain',
  'joint pain',
  'chest pain',
  'shortness of breath',
  'brain fog',
  'insomnia',
] as const;

/**
 * Positive mood tags
 */
export const POSITIVE_TAGS = [
  'happy',
  'calm',
  'energetic',
  'focused',
  'grateful',
  'motivated',
  'relaxed',
  'productive',
] as const;
