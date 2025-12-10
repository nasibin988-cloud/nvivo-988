/**
 * Shared color utilities for history components
 * 7-tier color gradient system based on vitality score
 *
 * Can be used with any numeric score on a 0-100 or 0-10 scale
 */

import type { BaseHistoryEntry, ScoreCalculator } from './types';

/**
 * Get vitality color based on score (0-100 scale)
 */
export function getVitalityColor(score: number): string {
  if (score >= 90) return '#22c55e'; // Bright Green - Excellent
  if (score >= 80) return '#10b981'; // Emerald - Great
  if (score >= 70) return '#14b8a6'; // Teal - Good
  if (score >= 60) return '#eab308'; // Yellow - Fair
  if (score >= 50) return '#f97316'; // Orange - Needs Work
  if (score >= 40) return '#ef4444'; // Light Red - Poor
  return '#dc2626'; // Red - Critical
}

/**
 * Generic score calculator factory
 * Creates a score calculator for different entry types
 */
export function createScoreCalculator<T extends BaseHistoryEntry>(
  calculator: ScoreCalculator<T>
): ScoreCalculator<T> {
  return calculator;
}

/**
 * Pre-built score calculators for common entry types
 */
export const scoreCalculators = {
  /** Wellness score based on mood, energy, sleep, and inverted stress */
  wellness: (entry: { mood: number; energy: number; stress: number; sleepQuality: number }): number => {
    const positiveAvg = (entry.mood + entry.energy + entry.sleepQuality) / 3;
    const stressAdjusted = (10 - entry.stress) / 10;
    return positiveAvg * (0.7 + stressAdjusted * 0.3);
  },

  /** Nutrition score based on calories vs target */
  nutrition: (entry: { totalCalories: number; targetCalories: number }): number => {
    const ratio = entry.totalCalories / entry.targetCalories;
    // Perfect score at 100%, declining for over/under
    if (ratio >= 0.9 && ratio <= 1.1) return 10;
    if (ratio >= 0.8 && ratio <= 1.2) return 8;
    if (ratio >= 0.7 && ratio <= 1.3) return 6;
    return Math.max(0, 10 - Math.abs(1 - ratio) * 10);
  },

  /** Activity score based on minutes vs target */
  activity: (entry: { totalMinutes: number; targetMinutes: number }): number => {
    return Math.min(10, (entry.totalMinutes / entry.targetMinutes) * 10);
  },

  /** Medication adherence score */
  medication: (entry: { taken: number; total: number }): number => {
    return entry.total > 0 ? (entry.taken / entry.total) * 10 : 10;
  },
};

/**
 * Get heatmap color with background and foreground
 * @param score - Score on 1-10 scale (null for no data)
 */
export function getHeatmapColor(score: number | null): { bg: string; color: string } {
  if (score === null) return { bg: 'rgba(255,255,255,0.02)', color: 'transparent' };
  // Score is 1-10, multiply by 10 for 0-100 scale
  const normalizedScore = score * 10;
  if (normalizedScore >= 90) return { bg: 'rgba(34,197,94,0.5)', color: '#22c55e' };   // Bright Green
  if (normalizedScore >= 80) return { bg: 'rgba(16,185,129,0.5)', color: '#10b981' }; // Emerald
  if (normalizedScore >= 70) return { bg: 'rgba(20,184,166,0.5)', color: '#14b8a6' }; // Teal
  if (normalizedScore >= 60) return { bg: 'rgba(234,179,8,0.5)', color: '#eab308' };   // Yellow
  if (normalizedScore >= 50) return { bg: 'rgba(249,115,22,0.5)', color: '#f97316' }; // Orange
  if (normalizedScore >= 40) return { bg: 'rgba(239,68,68,0.5)', color: '#ef4444' };  // Light Red
  return { bg: 'rgba(220,38,38,0.5)', color: '#dc2626' };                              // Red
}

/**
 * Get score color for individual metrics (mood, energy, etc.)
 * @param score - Score on 1-10 scale
 * @param isStress - If true, inverts the scale (high stress = bad)
 */
export function getScoreColor(score: number, isStress = false): string {
  // For stress, invert: high stress = low score (bad)
  const normalizedScore = isStress ? (10 - score) * 10 : score * 10;
  return getVitalityColor(normalizedScore);
}

/**
 * Calculate vitality score from a log entry
 */
export function calculateVitalityScore(log: {
  mood: number;
  energy: number;
  stress: number;
  sleepQuality: number;
}): number {
  return Math.round(((log.mood + log.energy + log.sleepQuality + (10 - log.stress)) / 4) * 10);
}

/**
 * Calculate wellness score (0-10) for heatmap
 */
export function calculateWellnessScore(log: {
  mood: number;
  energy: number;
  stress: number;
  sleepQuality: number;
}): number {
  const positiveAvg = (log.mood + log.energy + log.sleepQuality) / 3;
  const stressAdjusted = (10 - log.stress) / 10; // Convert stress to positive factor
  return positiveAvg * (0.7 + stressAdjusted * 0.3); // Weighted average
}

/**
 * Format date string for display
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split('T')[0]) return 'Today';
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
