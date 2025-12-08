/**
 * Centralized color palette for the patient app
 * All hex color values should be defined here for consistency
 */

// Primary semantic colors
export const colors = {
  // Status colors
  success: '#10B981',
  successLight: '#34D399',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  error: '#EF4444',
  errorLight: '#F87171',
  info: '#06B6D4',
  infoLight: '#22D3EE',

  // Brand/Accent colors
  accent: '#8B5CF6',
  accentLight: '#A78BFA',
  indigo: '#6366F1',
  indigoLight: '#818CF8',
  blue: '#3B82F6',
  blueLight: '#60A5FA',
  pink: '#EC4899',
  pinkLight: '#F472B6',
  orange: '#F97316',
  orangeLight: '#FB923C',

  // Neutral colors
  white: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
} as const;

// Color with opacity variations for backgrounds/borders
export interface ColorVariant {
  color: string;
  bgLight: string;
  border: string;
  glow: string;
}

export const colorVariants: Record<string, ColorVariant> = {
  success: {
    color: colors.success,
    bgLight: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.3)',
    glow: 'rgba(16, 185, 129, 0.06)',
  },
  warning: {
    color: colors.warning,
    bgLight: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.3)',
    glow: 'rgba(245, 158, 11, 0.06)',
  },
  error: {
    color: colors.error,
    bgLight: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.3)',
    glow: 'rgba(239, 68, 68, 0.06)',
  },
  info: {
    color: colors.info,
    bgLight: 'rgba(6, 182, 212, 0.15)',
    border: 'rgba(6, 182, 212, 0.3)',
    glow: 'rgba(6, 182, 212, 0.06)',
  },
  accent: {
    color: colors.accent,
    bgLight: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(139, 92, 246, 0.3)',
    glow: 'rgba(139, 92, 246, 0.06)',
  },
  indigo: {
    color: colors.indigo,
    bgLight: 'rgba(99, 102, 241, 0.15)',
    border: 'rgba(99, 102, 241, 0.3)',
    glow: 'rgba(99, 102, 241, 0.06)',
  },
  blue: {
    color: colors.blue,
    bgLight: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.3)',
    glow: 'rgba(59, 130, 246, 0.06)',
  },
  pink: {
    color: colors.pink,
    bgLight: 'rgba(236, 72, 153, 0.15)',
    border: 'rgba(236, 72, 153, 0.3)',
    glow: 'rgba(236, 72, 153, 0.06)',
  },
  orange: {
    color: colors.orange,
    bgLight: 'rgba(249, 115, 22, 0.15)',
    border: 'rgba(249, 115, 22, 0.3)',
    glow: 'rgba(249, 115, 22, 0.06)',
  },
};

// Category-specific color mappings
export const categoryColors = {
  activity: colorVariants.success,
  nutrition: colorVariants.warning,
  mindfulness: colorVariants.accent,
  sleep: colorVariants.indigo,
  health: colorVariants.pink,
  cardiac: colorVariants.error,
  cognitive: colorVariants.accent,
} as const;

// Score-based color thresholds
export interface ScoreColors {
  main: string;
  secondary: string;
  label: string;
}

export function getScoreColors(score: number): ScoreColors {
  if (score >= 90) return { main: colors.success, secondary: colors.successLight, label: 'Optimal' };
  if (score >= 80) return { main: colors.blue, secondary: colors.blueLight, label: 'High' };
  if (score >= 70) return { main: colors.info, secondary: colors.infoLight, label: 'Good' };
  if (score >= 60) return { main: colors.warning, secondary: colors.warningLight, label: 'Fair' };
  return { main: colors.error, secondary: colors.errorLight, label: 'Needs Work' };
}

// Status badge colors
export type StatusType = 'on-target' | 'optimal' | 'elevated' | 'attention' | 'high' | 'low' | 'very-low' | 'high-risk';

export function getStatusColor(status: StatusType): string {
  switch (status) {
    case 'on-target':
    case 'optimal':
      return colors.success;
    case 'elevated':
    case 'attention':
    case 'low':
      return colors.warning;
    case 'high':
    case 'very-low':
    case 'high-risk':
      return colors.error;
    default:
      return colors.textSecondary;
  }
}

// DASS-21 score colors
export function getDassColor(score: number, thresholds: { normal: number; mild: number; moderate: number }): string {
  if (score <= thresholds.normal) return colors.success;
  if (score <= thresholds.mild) return colors.info;
  if (score <= thresholds.moderate) return colors.warning;
  return colors.error;
}

// DASS-21 thresholds
export const dassThresholds = {
  depression: { normal: 9, mild: 13, moderate: 20 },
  anxiety: { normal: 7, mild: 9, moderate: 14 },
  stress: { normal: 14, mild: 18, moderate: 25 },
} as const;
