/**
 * Shared types for history components across Journal tabs
 */

export interface HistoryLog {
  id: string;
  date: string;
  mood: number; // 1-10
  energy: number; // 1-10
  stress: number; // 1-10
  sleepQuality: number; // 1-10
  sleepHours: number;
  symptoms: string[];
  notes: string;
  voiceNoteUrl?: string;
  tags: string[];
  createdAt: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}
