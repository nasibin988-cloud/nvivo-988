/**
 * ConfirmStep Component
 * Goal creation confirmation view
 */

import { Check } from 'lucide-react';
import type { GoalTemplate } from '../types';

interface ConfirmStepProps {
  goal: GoalTemplate | null;
  customGoalName: string;
  targetValue: number;
  customGoalUnit: string;
  onDone: () => void;
}

export default function ConfirmStep({
  goal,
  customGoalName,
  targetValue,
  customGoalUnit,
  onDone,
}: ConfirmStepProps): React.ReactElement {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
        <Check size={40} className="text-emerald-400" />
      </div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">Goal Added!</h2>
      <p className="text-text-muted mb-8">
        {goal?.name || customGoalName} has been added to your weekly goals.
      </p>

      <div className="bg-surface rounded-2xl border border-border p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Target</span>
          <span className="text-lg font-bold text-text-primary">
            {targetValue} {goal?.unit || customGoalUnit}
          </span>
        </div>
      </div>

      <button
        onClick={onDone}
        className="w-full py-4 bg-surface border border-border text-text-primary font-semibold rounded-xl transition-all hover:bg-surface-2"
      >
        Done
      </button>
    </div>
  );
}
