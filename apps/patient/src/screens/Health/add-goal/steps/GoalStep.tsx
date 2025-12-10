/**
 * GoalStep Component
 * Goal selection within a category
 */

import { ChevronRight } from 'lucide-react';
import type { GoalCategory, GoalTemplate } from '../types';

interface GoalStepProps {
  category: GoalCategory;
  onGoalSelect: (goal: GoalTemplate) => void;
}

export default function GoalStep({ category, onGoalSelect }: GoalStepProps): React.ReactElement {
  return (
    <div className="space-y-3">
      {category.goals.map((goal) => {
        const Icon = goal.icon;
        return (
          <button
            key={goal.id}
            onClick={() => onGoalSelect(goal)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01] bg-surface border-border"
          >
            <div className={`p-3 rounded-xl ${category.bgColor} border ${category.borderColor}`}>
              <Icon size={20} className={category.color} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-sm font-semibold text-text-primary">{goal.name}</h3>
              <p className="text-xs text-text-muted mt-0.5">{goal.description}</p>
            </div>
            <ChevronRight size={20} className="text-text-muted" />
          </button>
        );
      })}
    </div>
  );
}
