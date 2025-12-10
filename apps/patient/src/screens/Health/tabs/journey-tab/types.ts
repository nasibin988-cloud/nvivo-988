/**
 * Journey Tab Types
 */

import type { LucideIcon } from 'lucide-react';

export interface PhaseHighlight {
  label: string;
  detail: string;
}

export interface JourneyPhase {
  id: string;
  name: string;
  period: string;
  description: string;
  color: string;
  completed: boolean;
  current?: boolean;
  highlights: PhaseHighlight[];
}

export interface Transformation {
  id: string;
  label: string;
  before: number;
  after: number;
  unit: string;
  target?: number;
  icon: LucideIcon;
  color: string;
  improvement: boolean;
}

export interface UpcomingGoal {
  id: string;
  title: string;
  description: string;
  target: string;
  progress: number;
  icon: LucideIcon;
}

export interface ColorClasses {
  bg: string;
  text: string;
  border: string;
  dot?: string;
}
