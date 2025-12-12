/**
 * DESIGN 10: Hyper Minimal
 * Inspired by luxury brand aesthetics. Maximum whitespace,
 * beautiful typography, subtle data visualization.
 * Every element has purpose. Nothing superfluous.
 */

import { Sparkles } from 'lucide-react';
import type { FoodLog } from '../../../../../hooks/nutrition';

interface Design10Props {
  meals: FoodLog[];
  onDelete: (id: string) => void;
  onEdit: (meal: FoodLog) => void;
}

// Elegant thin bar showing macro ratio
function MacroLine({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const total = protein + carbs + fat;
  if (total === 0) return <div className="h-px bg-white/10 w-full" />;

  const p = (protein / total) * 100;
  const c = (carbs / total) * 100;

  return (
    <div className="relative h-px w-full bg-white/5 overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full bg-rose-400"
        style={{ width: `${p}%` }}
      />
      <div
        className="absolute top-0 h-full bg-amber-400"
        style={{ left: `${p}%`, width: `${c}%` }}
      />
      <div
        className="absolute right-0 top-0 h-full bg-blue-400"
        style={{ width: `${100 - p - c}%` }}
      />
    </div>
  );
}

function MinimalCard({ meal, onClick }: { meal: FoodLog; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left group py-5 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.01] transition-colors -mx-2 px-2 rounded-lg"
    >
      <div className="flex items-start gap-6">
        {/* Left: Photo (if exists) */}
        {meal.photoUrl && (
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 opacity-90 group-hover:opacity-100 transition-opacity">
            <img src={meal.photoUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Middle: Content */}
        <div className="flex-1 min-w-0">
          {/* Time - very subtle */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-text-muted/60 uppercase tracking-[0.2em]">{meal.time}</span>
            {meal.isAiAnalyzed && <Sparkles size={8} className="text-violet-400/60" />}
          </div>

          {/* Description - the hero */}
          <p className="text-base font-light text-text-primary tracking-tight leading-snug mb-3">
            {meal.description}
          </p>

          {/* Macro line */}
          <MacroLine protein={meal.protein || 0} carbs={meal.carbs || 0} fat={meal.fat || 0} />

          {/* Macro values - subtle */}
          <div className="flex items-center gap-4 mt-2">
            {meal.protein && (
              <span className="text-[9px] text-text-muted/70 tracking-wider">
                {meal.protein}G PROTEIN
              </span>
            )}
            {meal.fiber && meal.fiber > 0 && (
              <span className="text-[9px] text-text-muted/70 tracking-wider">
                {meal.fiber}G FIBER
              </span>
            )}
          </div>
        </div>

        {/* Right: Calories */}
        {meal.calories && (
          <div className="text-right shrink-0 pt-1">
            <span className="text-2xl font-extralight text-text-primary tabular-nums tracking-tighter">
              {meal.calories}
            </span>
            <span className="text-[8px] text-text-muted/50 uppercase tracking-[0.3em] block mt-0.5">
              cal
            </span>
          </div>
        )}
      </div>
    </button>
  );
}

function DaySummary({ meals }: { meals: FoodLog[] }) {
  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="flex items-center justify-between py-4 border-t border-white/[0.06] mt-2">
      <span className="text-[10px] text-text-muted/60 uppercase tracking-[0.2em]">Total</span>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <span className="text-[9px] text-text-muted/50 uppercase tracking-wider block">P</span>
          <span className="text-sm font-light text-text-secondary">{totals.protein}g</span>
        </div>
        <div className="text-right">
          <span className="text-[9px] text-text-muted/50 uppercase tracking-wider block">C</span>
          <span className="text-sm font-light text-text-secondary">{totals.carbs}g</span>
        </div>
        <div className="text-right">
          <span className="text-[9px] text-text-muted/50 uppercase tracking-wider block">F</span>
          <span className="text-sm font-light text-text-secondary">{totals.fat}g</span>
        </div>
        <div className="text-right pl-4 border-l border-white/[0.06]">
          <span className="text-lg font-extralight text-text-primary tabular-nums">{totals.calories}</span>
          <span className="text-[8px] text-text-muted/50 ml-1">cal</span>
        </div>
      </div>
    </div>
  );
}

export function Design10_Minimal({ meals, onDelete: _onDelete, onEdit }: Design10Props): React.ReactElement {
  if (meals.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto mb-6" />
        <p className="text-sm font-light text-text-muted/60 tracking-wide">Nothing logged yet</p>
      </div>
    );
  }

  return (
    <div>
      {meals.map((meal) => (
        <MinimalCard key={meal.id} meal={meal} onClick={() => onEdit(meal)} />
      ))}
      <DaySummary meals={meals} />
    </div>
  );
}
