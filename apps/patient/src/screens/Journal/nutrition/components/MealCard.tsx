/**
 * MealCard - Expandable meal card with timeline connector
 * Shows meal summary, macros, photo thumbnails, quick portion edit, and edit/delete actions
 */

import { useState, useCallback } from 'react';
import { ChevronDown, Clock, Trash2, Pencil, Minus, Plus } from 'lucide-react';
import type { FoodLog } from '../../../../hooks/nutrition';
import { mealConfig, getTimeSinceMeal, MEAL_GRADIENT_BG } from '../types';
import { AIBadge } from './AIBadge';

// Simple debounce utility
function debounce<T extends (...args: Parameters<T>) => void>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

interface MealCardProps {
  meal: FoodLog;
  onDelete: (id: string) => void;
  onEdit: (meal: FoodLog) => void;
  onQuickUpdate?: (id: string, updates: Partial<FoodLog>) => void;
  isFirst?: boolean;
  isLast?: boolean;
  previousMealTime?: string;
}

export function MealCard({
  meal,
  onDelete,
  onEdit,
  onQuickUpdate,
  isFirst,
  isLast,
  previousMealTime,
}: MealCardProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);
  const [portionMultiplier, setPortionMultiplier] = useState(1);
  const config = mealConfig[meal.mealType];
  const Icon = config.icon;

  // Debounce quick update
  const debouncedUpdate = useCallback(
    debounce((multiplier: number) => {
      if (onQuickUpdate && multiplier !== 1) {
        onQuickUpdate(meal.id, {
          calories: Math.round((meal.calories || 0) * multiplier),
          protein: meal.protein ? Math.round(meal.protein * multiplier * 10) / 10 : null,
          carbs: meal.carbs ? Math.round(meal.carbs * multiplier * 10) / 10 : null,
          fat: meal.fat ? Math.round(meal.fat * multiplier * 10) / 10 : null,
          fiber: meal.fiber ? Math.round(meal.fiber * multiplier * 10) / 10 : null,
        });
      }
    }, 500),
    [meal, onQuickUpdate]
  );

  const adjustPortion = (delta: number) => {
    const newMultiplier = Math.max(0.25, Math.min(3, portionMultiplier + delta));
    setPortionMultiplier(newMultiplier);
    debouncedUpdate(newMultiplier);
  };

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

      {/* Card with meal-type gradient background */}
      <div className={`relative backdrop-blur-sm rounded-2xl border border-white/[0.06] overflow-hidden hover:border-white/[0.1] transition-colors ${MEAL_GRADIENT_BG[meal.mealType]}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-start gap-3 text-left"
        >
          {/* Photo thumbnail or meal type icon */}
          <div className="relative flex-shrink-0">
            {meal.photoUrl ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10">
                <img
                  src={meal.photoUrl}
                  alt={meal.description}
                  className="w-full h-full object-cover"
                />
                {meal.isAiAnalyzed && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">AI</span>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className={`absolute inset-0 ${config.bgGlow} rounded-xl blur-md opacity-50`} />
                <div className={`relative p-2.5 rounded-xl bg-gradient-to-br ${config.gradient} text-white`}>
                  <Icon size={18} />
                </div>
              </>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-semibold text-text-primary">{config.label}</span>
              {meal.isAiAnalyzed && !meal.photoUrl && <AIBadge confidence={meal.aiConfidence} />}
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
              {/* Quick Portion Adjustment */}
              {onQuickUpdate && (
                <div className="pt-3 pb-2 flex items-center justify-between">
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">Adjust Portion</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        adjustPortion(-0.25);
                      }}
                      className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] text-text-muted hover:bg-white/[0.08] hover:text-text-primary flex items-center justify-center transition-all"
                    >
                      <Minus size={12} />
                    </button>
                    <span className={`min-w-[3rem] text-center text-sm font-bold ${portionMultiplier !== 1 ? 'text-emerald-400' : 'text-text-primary'}`}>
                      {portionMultiplier === 1 ? '1x' : `${portionMultiplier.toFixed(2)}x`}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        adjustPortion(0.25);
                      }}
                      className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] text-text-muted hover:bg-white/[0.08] hover:text-text-primary flex items-center justify-center transition-all"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: meal.protein, label: 'Protein', color: 'text-rose-400' },
                  { value: meal.carbs, label: 'Carbs', color: 'text-amber-400' },
                  { value: meal.fat, label: 'Fat', color: 'text-blue-400' },
                  { value: meal.fiber, label: 'Fiber', color: 'text-emerald-400' },
                ].map(({ value, label, color }) => {
                  const adjustedValue = value !== null ? Math.round(value * portionMultiplier * 10) / 10 : null;
                  return (
                    <div key={label} className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                      <span className={`text-xs font-bold ${adjustedValue !== null ? color : 'text-text-muted/50'}`}>
                        {adjustedValue !== null ? `${adjustedValue}g` : '—'}
                      </span>
                      <span className="text-[9px] text-text-muted block">{label}</span>
                    </div>
                  );
                })}
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
