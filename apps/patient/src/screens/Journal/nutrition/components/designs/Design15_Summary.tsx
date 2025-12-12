/**
 * DESIGN 15: Summary View
 * Shows meals in a unified card with running totals.
 * Each meal is a row, with a summary bar at the top showing daily progress.
 * Clean, informative, matches app aesthetic.
 */

import { Sparkles, Plus } from 'lucide-react';
import type { FoodLog } from '../../../../../hooks/nutrition';

interface Design15Props {
  meals: FoodLog[];
  onDelete: (id: string) => void;
  onEdit: (meal: FoodLog) => void;
}

function ProgressBar({ current, target, color, label }: { current: number; target: number; color: string; label: string }) {
  const percentage = Math.min((current / target) * 100, 100);
  const isOver = current > target;

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] text-text-muted">{label}</span>
        <span className={`text-[10px] font-semibold ${isOver ? 'text-amber-400' : 'text-text-secondary'}`}>
          {current}
          <span className="text-text-muted/60">/{target}g</span>
        </span>
      </div>
      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: isOver ? '#f59e0b' : color,
          }}
        />
      </div>
    </div>
  );
}

function MealRow({ meal, onClick }: { meal: FoodLog; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] -mx-1 px-1 rounded-lg transition-colors text-left group"
    >
      {/* Time */}
      <span className="w-14 text-[10px] text-text-muted tabular-nums shrink-0">{meal.time}</span>

      {/* Photo (small) */}
      {meal.photoUrl && (
        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/[0.06]">
          <img src={meal.photoUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {meal.isAiAnalyzed && <Sparkles size={9} className="text-violet-400 shrink-0" />}
          <p className="text-sm text-text-primary line-clamp-1">{meal.description}</p>
        </div>
      </div>

      {/* Macros - inline small */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[9px] text-rose-400/80">{meal.protein || 0}p</span>
        <span className="text-[9px] text-amber-400/80">{meal.carbs || 0}c</span>
        <span className="text-[9px] text-blue-400/80">{meal.fat || 0}f</span>
      </div>

      {/* Calories */}
      <span className="w-12 text-right text-sm font-semibold text-text-primary tabular-nums shrink-0">
        {meal.calories || 0}
      </span>
    </button>
  );
}

export function Design15_Summary({ meals, onDelete: _onDelete, onEdit }: Design15Props): React.ReactElement {
  // Calculate totals
  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Daily targets (could come from props)
  const targets = { protein: 50, carbs: 250, fat: 65 };

  if (meals.length === 0) {
    return (
      <div className="bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/[0.04] p-6 text-center">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <Plus size={20} className="text-text-muted" />
        </div>
        <p className="text-sm text-text-muted">No meals logged yet</p>
        <p className="text-[10px] text-text-muted/60 mt-1">Start tracking your nutrition</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/[0.04] overflow-hidden">
      {/* Summary header */}
      <div className="p-4 border-b border-white/[0.06] bg-white/[0.01]">
        {/* Total calories */}
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-[10px] text-text-muted uppercase tracking-wider">Today's Total</span>
          <div>
            <span className="text-2xl font-bold text-emerald-400 tabular-nums">{totals.calories}</span>
            <span className="text-xs text-text-muted ml-1">cal</span>
          </div>
        </div>

        {/* Macro progress bars */}
        <div className="flex gap-4">
          <ProgressBar current={totals.protein} target={targets.protein} color="#f43f5e" label="Protein" />
          <ProgressBar current={totals.carbs} target={targets.carbs} color="#f59e0b" label="Carbs" />
          <ProgressBar current={totals.fat} target={targets.fat} color="#3b82f6" label="Fat" />
        </div>
      </div>

      {/* Meals list */}
      <div className="p-3">
        {/* Header row */}
        <div className="flex items-center gap-3 pb-2 border-b border-white/[0.04] mb-1">
          <span className="w-14 text-[9px] text-text-muted/60 uppercase tracking-wider">Time</span>
          <span className="flex-1 text-[9px] text-text-muted/60 uppercase tracking-wider">Meal</span>
          <span className="text-[9px] text-text-muted/60 uppercase tracking-wider">Macros</span>
          <span className="w-12 text-right text-[9px] text-text-muted/60 uppercase tracking-wider">Cal</span>
        </div>

        {meals.map((meal) => (
          <MealRow key={meal.id} meal={meal} onClick={() => onEdit(meal)} />
        ))}
      </div>
    </div>
  );
}
