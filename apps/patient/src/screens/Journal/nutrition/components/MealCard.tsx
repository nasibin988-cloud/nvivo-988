/**
 * MealCard - Expandable meal card with timeline connector
 * Shows meal summary, macros, and edit/delete actions
 */

import { useState } from 'react';
import { ChevronDown, Clock, Trash2, Pencil } from 'lucide-react';
import type { FoodLog } from '../../../../hooks/nutrition';
import { mealConfig, getTimeSinceMeal } from '../types';
import { AIBadge } from './AIBadge';

interface MealCardProps {
  meal: FoodLog;
  onDelete: (id: string) => void;
  onEdit: (meal: FoodLog) => void;
  isFirst?: boolean;
  isLast?: boolean;
  previousMealTime?: string;
}

export function MealCard({
  meal,
  onDelete,
  onEdit,
  isFirst,
  isLast,
  previousMealTime,
}: MealCardProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = mealConfig[meal.mealType];
  const Icon = config.icon;

  // Calculate time since last meal
  const timeSinceLast = !isFirst && previousMealTime
    ? getTimeSinceMeal(meal.time, previousMealTime)
    : null;

  return (
    <div className="relative">
      {/* Timeline connector */}
      {!isFirst && (
        <div className="absolute left-6 -top-3 w-px h-3 bg-gradient-to-b from-transparent to-border" />
      )}
      {!isLast && (
        <div className="absolute left-6 -bottom-3 w-px h-3 bg-gradient-to-b from-border to-transparent" />
      )}

      {/* Time gap indicator */}
      {timeSinceLast && (
        <div className="flex items-center justify-center mb-2">
          <span className="text-[9px] text-text-muted bg-surface-2 px-2 py-0.5 rounded-full">
            {timeSinceLast}
          </span>
        </div>
      )}

      {/* Card */}
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] overflow-hidden hover:border-white/[0.1] transition-colors">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-start gap-3 text-left"
        >
          {/* Meal type icon with glow */}
          <div className="relative">
            <div className={`absolute inset-0 ${config.bgGlow} rounded-xl blur-md opacity-50`} />
            <div className={`relative p-2.5 rounded-xl bg-gradient-to-br ${config.gradient} text-white`}>
              <Icon size={18} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-semibold text-text-primary">{config.label}</span>
              {meal.isAiAnalyzed && <AIBadge confidence={meal.aiConfidence} />}
            </div>
            <p className="text-sm text-text-secondary line-clamp-1">{meal.description}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[10px] text-text-muted flex items-center gap-1">
                <Clock size={10} />
                {meal.time}
              </span>
              {meal.calories && (
                <span className="text-[10px] font-bold text-amber-400">{meal.calories} cal</span>
              )}
            </div>
          </div>

          <ChevronDown
            size={16}
            className={`text-text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Expanded content */}
        <div
          className={`grid transition-all duration-300 ${
            isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="px-4 pb-4 pt-0 border-t border-white/[0.06]">
              <div className="pt-3 grid grid-cols-4 gap-2">
                {[
                  { value: meal.protein, label: 'Protein', color: 'text-rose-400' },
                  { value: meal.carbs, label: 'Carbs', color: 'text-amber-400' },
                  { value: meal.fat, label: 'Fat', color: 'text-blue-400' },
                  { value: meal.fiber, label: 'Fiber', color: 'text-emerald-400' },
                ].map(({ value, label, color }) => (
                  <div key={label} className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                    <span className={`text-xs font-bold ${value !== null ? color : 'text-text-muted/50'}`}>
                      {value !== null ? `${value}g` : '—'}
                    </span>
                    <span className="text-[9px] text-text-muted block">{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(meal);
                  }}
                  className="py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-white/[0.08] hover:border-blue-500/20 hover:text-blue-400 transition-all"
                >
                  <Pencil size={12} />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(meal.id);
                  }}
                  className="py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-rose-500/20 transition-colors"
                >
                  <Trash2 size={12} />
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
