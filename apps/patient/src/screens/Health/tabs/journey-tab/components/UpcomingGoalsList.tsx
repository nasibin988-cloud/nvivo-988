/**
 * Upcoming Goals List Component
 * List of future goals with progress
 */

import { Target } from 'lucide-react';
import type { UpcomingGoal } from '../types';
import { ProgressRing } from './ProgressRing';

interface UpcomingGoalsListProps {
  goals: UpcomingGoal[];
}

export function UpcomingGoalsList({ goals }: UpcomingGoalsListProps): React.ReactElement {
  return (
    <div>
      <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
        <Target size={14} className="text-violet-400" />
        What You&apos;re Building Towards
      </h3>
      <div className="space-y-3">
        {goals.map((goal) => {
          const Icon = goal.icon;
          return (
            <div key={goal.id} className="bg-surface rounded-xl border border-border p-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <ProgressRing progress={goal.progress} size={48} strokeWidth={4} color="violet" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon size={16} className="text-violet-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-text-primary">{goal.title}</h4>
                  <p className="text-xs text-text-muted mt-0.5">{goal.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-text-muted">Target: {goal.target}</span>
                    <span className="text-[10px] font-semibold text-violet-400">
                      {goal.progress}% there
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
