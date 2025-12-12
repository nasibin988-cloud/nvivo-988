/**
 * DESIGN 14: Visual Timeline
 * A proper timeline that shows the day's eating pattern.
 * Connected dots with time markers, expanding cards on tap.
 * Matches the app's visual language.
 */

import { useState } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import type { FoodLog } from '../../../../../hooks/nutrition';

interface Design14Props {
  meals: FoodLog[];
  onDelete: (id: string) => void;
  onEdit: (meal: FoodLog) => void;
}

function TimelineCard({ meal, isLast, onClick }: { meal: FoodLog; isLast: boolean; onClick: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Color based on calorie content
  const calories = meal.calories || 0;
  const dotColor = calories > 600 ? '#f59e0b' : calories > 400 ? '#10b981' : '#3b82f6';

  return (
    <div className="relative flex gap-4">
      {/* Timeline column */}
      <div className="flex flex-col items-center w-12 shrink-0">
        {/* Time */}
        <span className="text-[9px] text-text-muted tabular-nums mb-1">{meal.time}</span>

        {/* Dot */}
        <div
          className="w-3 h-3 rounded-full border-2 bg-surface z-10"
          style={{ borderColor: dotColor }}
        />

        {/* Connecting line */}
        {!isLast && (
          <div className="w-px flex-1 bg-gradient-to-b from-white/20 to-white/5 mt-1" />
        )}
      </div>

      {/* Card */}
      <div className="flex-1 pb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all text-left overflow-hidden"
        >
          <div className="p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {meal.isAiAnalyzed && <Sparkles size={10} className="text-violet-400" />}
                  <p className="text-sm font-medium text-text-primary line-clamp-1">{meal.description}</p>
                </div>

                {/* Quick macros */}
                <div className="flex items-center gap-3">
                  {meal.protein && (
                    <span className="text-[10px] text-text-muted">
                      <span className="text-rose-400">{meal.protein}g</span> protein
                    </span>
                  )}
                  {meal.fiber && meal.fiber > 0 && (
                    <span className="text-[10px] text-text-muted">
                      <span className="text-emerald-400">{meal.fiber}g</span> fiber
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                {meal.calories && (
                  <span className="text-base font-bold text-text-primary tabular-nums">{meal.calories}</span>
                )}
                <ChevronDown
                  size={14}
                  className={`text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* Expanded content */}
          <div className={`grid transition-all duration-300 ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              <div className="px-3 pb-3 pt-0 border-t border-white/[0.04]">
                {/* Full macro breakdown */}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[
                    { label: 'Protein', value: meal.protein, color: 'text-rose-400', bg: 'bg-rose-500/10' },
                    { label: 'Carbs', value: meal.carbs, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { label: 'Fat', value: meal.fat, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Fiber', value: meal.fiber, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} className={`p-2 rounded-lg ${bg} text-center`}>
                      <span className={`text-xs font-bold ${color}`}>{value || 0}g</span>
                      <span className="text-[8px] text-text-muted block">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Edit button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                  className="mt-3 w-full py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all"
                >
                  Edit meal
                </button>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

export function Design14_Timeline({ meals, onDelete: _onDelete, onEdit }: Design14Props): React.ReactElement {
  if (meals.length === 0) {
    return (
      <div className="bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/[0.04] p-8 text-center">
        <div className="flex flex-col items-center gap-1 mb-3">
          <div className="w-3 h-3 rounded-full border-2 border-white/20" />
          <div className="w-px h-6 bg-white/10" />
          <div className="w-3 h-3 rounded-full border-2 border-white/10" />
        </div>
        <p className="text-sm text-text-muted">Your meal timeline will appear here</p>
      </div>
    );
  }

  return (
    <div className="pl-1">
      {meals.map((meal, index) => (
        <TimelineCard
          key={meal.id}
          meal={meal}
          isLast={index === meals.length - 1}
          onClick={() => onEdit(meal)}
        />
      ))}
    </div>
  );
}
