/**
 * CategoryStep Component
 * Category selection view for goal creation
 */

import { ChevronRight } from 'lucide-react';
import type { GoalCategory } from '../types';
import { goalCategories } from '../data';

interface CategoryStepProps {
  onCategorySelect: (category: GoalCategory) => void;
}

export default function CategoryStep({ onCategorySelect }: CategoryStepProps): React.ReactElement {
  return (
    <div className="space-y-3">
      {goalCategories.map((category) => {
        const Icon = category.icon;
        return (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01] ${category.bgColor} ${category.borderColor}`}
          >
            <div className={`p-3 rounded-xl ${category.bgColor} border ${category.borderColor}`}>
              <Icon size={24} className={category.color} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-base font-semibold text-text-primary">{category.name}</h3>
              <p className="text-xs text-text-muted mt-0.5">
                {category.id === 'custom'
                  ? 'Create your own goal'
                  : `${category.goals.length} goal${category.goals.length !== 1 ? 's' : ''} available`}
              </p>
            </div>
            <ChevronRight size={20} className="text-text-muted" />
          </button>
        );
      })}
    </div>
  );
}
