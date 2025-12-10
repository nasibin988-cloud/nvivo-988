/**
 * Assessments Tab Data
 * Mock data and configuration constants
 */

import type {
  Questionnaire,
  Category,
  QuestionnaireStatus,
  CategoryConfig,
  StatusConfig,
} from './types';

// Mock questionnaires data
export const mockQuestionnaires: Questionnaire[] = [
  {
    id: '1',
    name: 'DASS-21',
    type: 'DASS-21',
    description: 'Depression, Anxiety & Stress Scale',
    estimatedTime: 5,
    icon: '🧠',
    category: 'mental-health',
    status: 'pending',
    dueDate: 'Today',
  },
  {
    id: '2',
    name: 'Quality of Life',
    type: 'QOLS',
    description: 'Assess your overall life satisfaction',
    estimatedTime: 8,
    icon: '⭐',
    category: 'quality-of-life',
    status: 'available',
  },
  {
    id: '3',
    name: 'Lifestyle Assessment',
    type: 'SLIQ',
    description: 'Diet, exercise, sleep & stress habits',
    estimatedTime: 6,
    icon: '🌿',
    category: 'lifestyle',
    status: 'available',
  },
  {
    id: '4',
    name: 'Patient Intake',
    type: 'INTAKE',
    description: 'Comprehensive health history form',
    estimatedTime: 15,
    icon: '📋',
    category: 'intake',
    status: 'completed',
    lastCompleted: '2 weeks ago',
    latestScore: 'Complete',
  },
  {
    id: '5',
    name: 'PHQ-9',
    type: 'PHQ-9',
    description: 'Depression screening questionnaire',
    estimatedTime: 3,
    icon: '💭',
    category: 'mental-health',
    status: 'completed',
    lastCompleted: '1 week ago',
    latestScore: '4/27',
    scoreInterpretation: 'Minimal',
  },
  {
    id: '6',
    name: 'GAD-7',
    type: 'GAD-7',
    description: 'Anxiety screening questionnaire',
    estimatedTime: 3,
    icon: '🎯',
    category: 'mental-health',
    status: 'completed',
    lastCompleted: '1 week ago',
    latestScore: '3/21',
    scoreInterpretation: 'Minimal',
  },
];

// Category configuration
export const categoryConfig: Record<Category, CategoryConfig> = {
  'mental-health': {
    label: 'Mental Health',
    gradient: 'from-blue-500 to-cyan-500',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15 border-blue-500/30',
  },
  'lifestyle': {
    label: 'Lifestyle',
    gradient: 'from-emerald-500 to-teal-500',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15 border-emerald-500/30',
  },
  'quality-of-life': {
    label: 'Quality of Life',
    gradient: 'from-amber-500 to-orange-500',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/15 border-amber-500/30',
  },
  'intake': {
    label: 'Intake',
    gradient: 'from-violet-500 to-purple-500',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/15 border-violet-500/30',
  },
  'cognitive': {
    label: 'Cognitive',
    gradient: 'from-pink-500 to-rose-500',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/15 border-pink-500/30',
  },
};

// Status configuration
export const statusConfig: Record<QuestionnaireStatus, StatusConfig> = {
  pending: {
    label: 'Due Soon',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/15 border-amber-500/30',
  },
  available: {
    label: 'Available',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15 border-blue-500/30',
  },
  completed: {
    label: 'Completed',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15 border-emerald-500/30',
  },
};

// Sample questions for questionnaire modal
export const sampleQuestions = [
  { text: 'I found it hard to wind down', options: ['Never', 'Sometimes', 'Often', 'Always'] },
  { text: 'I was aware of dryness of my mouth', options: ['Never', 'Sometimes', 'Often', 'Always'] },
  { text: "I couldn't seem to experience any positive feeling at all", options: ['Never', 'Sometimes', 'Often', 'Always'] },
  { text: 'I experienced breathing difficulty', options: ['Never', 'Sometimes', 'Often', 'Always'] },
  { text: 'I found it difficult to work up the initiative to do things', options: ['Never', 'Sometimes', 'Often', 'Always'] },
];
