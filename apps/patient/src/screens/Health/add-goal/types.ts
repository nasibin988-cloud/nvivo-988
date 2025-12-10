/**
 * AddGoal Types
 * Type definitions for goal creation flow
 */

import type { LucideIcon } from 'lucide-react';

export interface GoalCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  goals: GoalTemplate[];
}

export interface GoalTemplate {
  id: string;
  name: string;
  icon: LucideIcon;
  unit: string;
  defaultTarget: number;
  minTarget: number;
  maxTarget: number;
  step: number;
  description: string;
}

export type AddGoalStep = 'category' | 'goal' | 'target' | 'confirm';

export interface AddGoalScreenProps {
  onBack: () => void;
  onSave?: (goal: GoalSaveData) => void;
}

export interface GoalSaveData {
  categoryId: string;
  goalId: string;
  target: number;
}

export interface StepProps {
  selectedCategory: GoalCategory | null;
  selectedGoal: GoalTemplate | null;
  targetValue: number;
  customGoalName: string;
  customGoalUnit: string;
  onCategorySelect: (category: GoalCategory) => void;
  onGoalSelect: (goal: GoalTemplate) => void;
  onTargetChange: (value: number) => void;
  onCustomNameChange: (name: string) => void;
  onCustomUnitChange: (unit: string) => void;
  onConfirm: () => void;
  onBack: () => void;
}
