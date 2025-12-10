/**
 * Overview Tab Types
 */

import type { LucideIcon } from 'lucide-react';

export interface VitalData {
  id: string;
  label: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  color: string;
}

export interface ScoreBreakdown {
  label: string;
  score: number;
  color: string;
}

export interface OverviewTabProps {
  onOpenGoals?: () => void;
}

export interface RingProps {
  score: number;
}
