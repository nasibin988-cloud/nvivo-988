/**
 * Add Goal Screen
 * Full page for creating a new weekly goal
 */

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  type AddGoalStep,
  type AddGoalScreenProps,
  type GoalCategory,
  type GoalTemplate,
  CategoryStep,
  GoalStep,
  TargetStep,
  ConfirmStep,
} from './add-goal';

export default function AddGoalScreen({ onBack, onSave }: AddGoalScreenProps): React.ReactElement {
  const [step, setStep] = useState<AddGoalStep>('category');
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<GoalTemplate | null>(null);
  const [targetValue, setTargetValue] = useState<number>(0);
  const [customGoalName, setCustomGoalName] = useState('');
  const [customGoalUnit, setCustomGoalUnit] = useState('days');

  const handleCategorySelect = (category: GoalCategory): void => {
    setSelectedCategory(category);
    if (category.id === 'custom') {
      setStep('target');
    } else if (category.goals.length === 1) {
      setSelectedGoal(category.goals[0]);
      setTargetValue(category.goals[0].defaultTarget);
      setStep('target');
    } else {
      setStep('goal');
    }
  };

  const handleGoalSelect = (goal: GoalTemplate): void => {
    setSelectedGoal(goal);
    setTargetValue(goal.defaultTarget);
    setStep('target');
  };

  const handleConfirm = (): void => {
    setStep('confirm');
    if (onSave && selectedCategory && (selectedGoal || selectedCategory.id === 'custom')) {
      onSave({
        categoryId: selectedCategory.id,
        goalId: selectedGoal?.id || 'custom',
        target: targetValue,
      });
    }
  };

  const handleBack = (): void => {
    if (step === 'category') {
      onBack();
    } else if (step === 'goal') {
      setStep('category');
      setSelectedCategory(null);
    } else if (step === 'target') {
      if (selectedCategory?.id === 'custom' || selectedCategory?.goals.length === 1) {
        setStep('category');
        setSelectedCategory(null);
      } else {
        setStep('goal');
        setSelectedGoal(null);
      }
    } else if (step === 'confirm') {
      onBack();
    }
  };

  const getStepTitle = (): string => {
    switch (step) {
      case 'category':
        return 'Choose a Category';
      case 'goal':
        return `${selectedCategory?.name} Goals`;
      case 'target':
        return 'Set Your Target';
      case 'confirm':
        return 'Goal Added!';
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={handleBack} className="p-2 -ml-2 rounded-lg hover:bg-surface transition-colors">
            <ArrowLeft size={20} className="text-text-secondary" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-text-primary">Add New Goal</h1>
            <p className="text-xs text-text-muted">{getStepTitle()}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {step === 'category' && (
          <CategoryStep onCategorySelect={handleCategorySelect} />
        )}

        {step === 'goal' && selectedCategory && (
          <GoalStep category={selectedCategory} onGoalSelect={handleGoalSelect} />
        )}

        {step === 'target' && selectedCategory && (
          <TargetStep
            category={selectedCategory}
            goal={selectedGoal}
            targetValue={targetValue}
            customGoalName={customGoalName}
            customGoalUnit={customGoalUnit}
            onTargetChange={setTargetValue}
            onCustomNameChange={setCustomGoalName}
            onCustomUnitChange={setCustomGoalUnit}
            onConfirm={handleConfirm}
          />
        )}

        {step === 'confirm' && (
          <ConfirmStep
            goal={selectedGoal}
            customGoalName={customGoalName}
            targetValue={targetValue}
            customGoalUnit={customGoalUnit}
            onDone={onBack}
          />
        )}
      </div>
    </div>
  );
}
