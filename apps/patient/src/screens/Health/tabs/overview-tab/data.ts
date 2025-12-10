/**
 * Overview Tab Data - Static data and configuration
 */

import { Heart, Activity, Droplets, Moon } from 'lucide-react';
import type { VitalData, ScoreBreakdown } from './types';

export const todayVitals: VitalData[] = [
  { id: 'heart', label: 'Heart Rate', value: '72', unit: 'bpm', icon: Heart, color: 'rose' },
  { id: 'bp', label: 'Blood Pressure', value: '118/78', unit: 'mmHg', icon: Activity, color: 'rose' },
  { id: 'glucose', label: 'Glucose', value: '95', unit: 'mg/dL', icon: Droplets, color: 'amber' },
  { id: 'sleep', label: 'Sleep', value: '7.5', unit: 'hrs', icon: Moon, color: 'violet' },
];

export const scoreBreakdown: ScoreBreakdown[] = [
  { label: 'Cardiovascular', score: 88, color: 'text-rose-400' },
  { label: 'Metabolic', score: 82, color: 'text-amber-400' },
  { label: 'Cognitive', score: 90, color: 'text-violet-400' },
  { label: 'Lifestyle', score: 78, color: 'text-emerald-400' },
];

export const RING_DESIGN = 2;
