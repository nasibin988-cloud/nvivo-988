/**
 * DESIGN 1: Timeline Flow
 * Compact timeline with floating time markers and inline stats.
 */

import { useState } from 'react';
import { Clock, Trash2, Flame } from 'lucide-react';
import type { FoodLog } from '../../../../../hooks/nutrition';
import { mealConfig } from '../../types';

interface Design1Props {
  meals: FoodLog[];
  onDelete: (id: string) => void;
  onEdit: (meal: FoodLog) => void;
}

function TimelineItem({ meal, onDelete, onEdit }: { meal: FoodLog; onDelete: () => void; onEdit: () => void }) {
  const [showActions, setShowActions] = useState(false);
  const config = mealConfig[meal.mealType];
  const Icon = config.icon;

  return (
    <div
      className="relative group"
      onTouchStart={() => setShowActions(true)}
      onTouchEnd={() => setTimeout(() => setShowActions(false), 3000)}
    >
      {/* Time marker - floating pill */}
      <div className="absolute -left-1 top-3 z-10">
        <div className="flex items-center gap-1 bg-surface-2/95 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 shadow-lg">
          <Clock size={9} className="text-text-muted" />
          <span className="text-[9px] font-medium text-text-secondary">{meal.time}</span>
        </div>
      </div>

      {/* Main card - compact */}
      <button
        onClick={onEdit}
        className="ml-16 w-[calc(100%-4rem)] relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/[0.1] transition-all text-left"
      >
        <div className="flex items-center gap-3 p-3">
          {/* Photo thumbnail or icon */}
          {meal.photoUrl ? (
            <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-white/10">
              <img src={meal.photoUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center shrink-0`}>
              <Icon size={18} className="text-white" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{config.label}</span>
            </div>
            <p className="text-sm text-text-primary line-clamp-1">{meal.description}</p>
          </div>

          {/* Calories */}
          {meal.calories && (
            <div className="flex items-center gap-1 shrink-0">
              <Flame size={12} className="text-amber-400" />
              <span className="text-sm font-bold text-amber-400">{meal.calories}</span>
            </div>
          )}
        </div>

        {/* Swipe actions overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-l from-rose-500/90 via-rose-500/70 to-transparent flex items-center justify-end pr-4 transition-all duration-300 ${
            showActions ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </button>
    </div>
  );
}

export function Design1_Timeline({ meals, onDelete, onEdit }: Design1Props): React.ReactElement {
  if (meals.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p className="text-sm">No meals logged today</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-[1.85rem] top-4 bottom-4 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent" />

      <div className="space-y-2">
        {meals.map((meal) => (
          <TimelineItem
            key={meal.id}
            meal={meal}
            onDelete={() => onDelete(meal.id)}
            onEdit={() => onEdit(meal)}
          />
        ))}
      </div>
    </div>
  );
}
