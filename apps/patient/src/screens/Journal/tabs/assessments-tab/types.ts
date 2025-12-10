/**
 * Assessments Tab Types
 */

export type QuestionnaireType = 'DASS-21' | 'QOLS' | 'SLIQ' | 'INTAKE' | 'PHQ-9' | 'GAD-7';
export type QuestionnaireStatus = 'pending' | 'available' | 'completed';
export type Category = 'mental-health' | 'lifestyle' | 'quality-of-life' | 'intake' | 'cognitive';
export type ViewMode = 'pending' | 'history';

export interface Questionnaire {
  id: string;
  name: string;
  type: QuestionnaireType;
  description: string;
  estimatedTime: number;
  icon: string;
  category: Category;
  status: QuestionnaireStatus;
  dueDate?: string;
  lastCompleted?: string;
  latestScore?: string;
  scoreInterpretation?: string;
}

export interface CategoryConfig {
  label: string;
  gradient: string;
  color: string;
  bgColor: string;
}

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
}

export interface ScoreEntry {
  date: string;
  value: number;
  max: number;
}
