/**
 * Journey Tab Data - Static journey data
 */

import {
  Heart,
  Activity,
  Shield,
  Zap,
  Flame,
  TrendingDown,
  Trophy,
} from 'lucide-react';
import type { JourneyPhase, Transformation, UpcomingGoal } from './types';

export const journeyPhases: JourneyPhase[] = [
  {
    id: 'discovery',
    name: 'Discovery',
    period: 'May - Jun 2024',
    description: 'Understanding your health baseline',
    color: 'slate',
    completed: true,
    highlights: [
      { label: 'Initial CCTA', detail: 'CAD-RADS 3 (moderate stenosis)' },
      { label: 'First labs', detail: 'LDL: 132 mg/dL' },
      { label: 'Care plan created', detail: 'Personalized approach' },
    ],
  },
  {
    id: 'foundation',
    name: 'Building Foundation',
    period: 'Jul - Sep 2024',
    description: 'Establishing habits that stick',
    color: 'cyan',
    completed: true,
    highlights: [
      { label: 'Medication optimized', detail: 'Rosuvastatin + Ezetimibe' },
      { label: '90-day streak', detail: 'Perfect adherence' },
      { label: 'Activity goals', detail: 'Averaging 8,000 steps/day' },
    ],
  },
  {
    id: 'momentum',
    name: 'Gaining Momentum',
    period: 'Oct - Nov 2024',
    description: 'Seeing real results',
    color: 'emerald',
    completed: true,
    highlights: [
      { label: 'LDL target hit', detail: 'Down to 65 mg/dL' },
      { label: 'Plaque regression', detail: '-15% total volume' },
      { label: 'CAD-RADS improved', detail: 'Now CAD-RADS 2' },
    ],
  },
  {
    id: 'optimization',
    name: 'Optimization',
    period: 'Dec 2024 - Present',
    description: 'Fine-tuning for long-term success',
    color: 'violet',
    completed: false,
    current: true,
    highlights: [
      { label: 'Maintaining gains', detail: 'Stable metrics' },
      { label: 'VO2 max focus', detail: 'Cardio optimization' },
      { label: 'Quality of life', detail: '+16 points on SF-36' },
    ],
  },
];

export const transformations: Transformation[] = [
  {
    id: 'ldl',
    label: 'LDL Cholesterol',
    before: 132,
    after: 65,
    unit: 'mg/dL',
    target: 70,
    icon: Heart,
    color: 'rose',
    improvement: true,
  },
  {
    id: 'plaque',
    label: 'Total Plaque Volume',
    before: 168,
    after: 142,
    unit: 'mm³',
    icon: Activity,
    color: 'cyan',
    improvement: true,
  },
  {
    id: 'cadRads',
    label: 'CAD-RADS Score',
    before: 3,
    after: 2,
    unit: '',
    icon: Shield,
    color: 'emerald',
    improvement: true,
  },
  {
    id: 'ffr',
    label: 'FFR-CT',
    before: 0.82,
    after: 0.88,
    unit: '',
    icon: Zap,
    color: 'violet',
    improvement: true,
  },
];

export const upcomingGoals: UpcomingGoal[] = [
  {
    id: 'vo2',
    title: 'VO2 Max Target',
    description: 'Reach 45 mL/kg/min',
    target: 'Feb 2025',
    progress: 78,
    icon: Flame,
  },
  {
    id: 'plaque2',
    title: 'Continued Regression',
    description: 'Further 10% plaque reduction',
    target: 'May 2025',
    progress: 45,
    icon: TrendingDown,
  },
  {
    id: 'year',
    title: '1-Year Anniversary',
    description: 'Complete first year of transformation',
    target: 'May 2025',
    progress: 82,
    icon: Trophy,
  },
];

export const PROGRAM_START_DATE = new Date('2024-05-01');
