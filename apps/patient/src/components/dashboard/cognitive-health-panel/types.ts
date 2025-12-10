/**
 * Cognitive Health Panel Types
 */

import type { CognitiveHealth } from '../../../hooks/dashboard';

export type TrendDirection = 'increasing' | 'decreasing' | 'stable';

export interface CognitiveHealthPanelProps {
  data: CognitiveHealth | null | undefined;
  onViewMore?: () => void;
}

export interface DassThresholds {
  normal: number;
  mild: number;
  moderate: number;
}

export interface StatusInfo {
  label: string;
  color: string;
}

export interface TrendLabelProps {
  direction?: TrendDirection;
  color?: string;
}

export interface DualTrendLineGraphProps {
  data1: number[];
  data2: number[];
  color1: string;
  color2: string;
  label1: string;
  label2: string;
  height?: number;
  showArea?: boolean;
  minLabel?: string;
  maxLabel?: string;
  uniqueId: string;
}
