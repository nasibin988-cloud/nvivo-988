/**
 * VitalityRing Types
 * Type definitions for vitality ring visualization
 */

import type { WellnessLog } from '../../../hooks/dashboard';

export interface VitalityRingProps {
  wellnessLog: WellnessLog | null | undefined;
  size?: number;
  strokeWidth?: number;
  className?: string;
  variant?: 1 | 2 | 3 | 4 | 5;
  animation?: 0 | 1 | 2 | 3 | 4;
}

export interface ScoreColors {
  main: string;
  secondary: string;
  label: string;
}

export interface VariantProps {
  score: number;
  animatedScore: number;
  colors: ScoreColors;
  size: number;
  strokeWidth: number;
}

export interface Variant4Props extends VariantProps {
  animation?: 0 | 1 | 2 | 3 | 4;
}

export interface Variant5Props extends VariantProps {
  wellnessLog: WellnessLog;
}

export interface RingConfig {
  label: string;
  value: number;
  color: string;
  secondaryColor: string;
}

export type { WellnessLog };
