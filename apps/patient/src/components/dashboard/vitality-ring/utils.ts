/**
 * VitalityRing Utilities
 * Score calculation and color mapping functions
 */

import type { ScoreColors, WellnessLog } from './types';

/**
 * 7-tier color gradient for vitality score
 */
export function getScoreColors(score: number): ScoreColors {
  if (score >= 90) {
    return { main: '#22c55e', secondary: '#4ade80', label: 'Excellent' };
  }
  if (score >= 80) {
    return { main: '#10b981', secondary: '#34d399', label: 'Great' };
  }
  if (score >= 70) {
    return { main: '#14b8a6', secondary: '#2dd4bf', label: 'Good' };
  }
  if (score >= 60) {
    return { main: '#eab308', secondary: '#facc15', label: 'Fair' };
  }
  if (score >= 50) {
    return { main: '#f97316', secondary: '#fb923c', label: 'Needs Work' };
  }
  if (score >= 40) {
    return { main: '#ef4444', secondary: '#f87171', label: 'Poor' };
  }
  return { main: '#dc2626', secondary: '#f87171', label: 'Critical' };
}

/**
 * Calculate vitality score from wellness log metrics
 */
export function calculateVitalityScore(log: WellnessLog): number {
  const normalizedStress = 11 - log.stress;
  const raw = (log.mood + log.energy + log.sleepQuality + normalizedStress) / 4;
  const score = (raw / 10) * 100;
  return Math.round(Math.min(100, Math.max(0, score)));
}
