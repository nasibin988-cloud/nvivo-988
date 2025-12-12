/**
 * DESIGN 6: Gradient Flow Cards
 * Beautiful gradient cards that flow based on nutritional quality.
 * Color shifts from emerald (healthy) to amber (moderate) to rose (indulgent).
 * No meal type icons - uses time and smart visual cues instead.
 */

import { Flame, Sparkles } from 'lucide-react';
import type { FoodLog } from '../../../../../hooks/nutrition';

interface Design6Props {
  meals: FoodLog[];
  onDelete: (id: string) => void;
  onEdit: (meal: FoodLog) => void;
}

// Calculate a "health score" to determine gradient
function getHealthGradient(meal: FoodLog): { gradient: string; glow: string; score: 'great' | 'good' | 'moderate' | 'indulgent' } {
  const calories = meal.calories || 0;
  const protein = meal.protein || 0;
  const fiber = meal.fiber || 0;

  // Simple heuristic: protein density + fiber = healthier
  const proteinDensity = calories > 0 ? (protein / calories) * 100 : 0;
  const fiberBonus = fiber > 3 ? 15 : fiber > 1 ? 8 : 0;
  const score = proteinDensity + fiberBonus;

  if (score > 12) return { gradient: 'from-emerald-500/20 via-teal-500/10 to-cyan-500/5', glow: 'bg-emerald-500/30', score: 'great' };
  if (score > 6) return { gradient: 'from-teal-500/15 via-cyan-500/10 to-blue-500/5', glow: 'bg-teal-500/25', score: 'good' };
  if (score > 3) return { gradient: 'from-amber-500/15 via-orange-500/10 to-yellow-500/5', glow: 'bg-amber-500/25', score: 'moderate' };
  return { gradient: 'from-rose-500/15 via-pink-500/10 to-orange-500/5', glow: 'bg-rose-500/20', score: 'indulgent' };
}

function MacroBar({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const total = protein + carbs + fat;
  if (total === 0) return null;

  return (
    <div className="flex h-1 rounded-full overflow-hidden bg-white/5">
      <div className="bg-rose-400/80 transition-all" style={{ width: `${(protein / total) * 100}%` }} />
      <div className="bg-amber-400/80 transition-all" style={{ width: `${(carbs / total) * 100}%` }} />
      <div className="bg-blue-400/80 transition-all" style={{ width: `${(fat / total) * 100}%` }} />
    </div>
  );
}

function GradientCard({ meal, onClick }: { meal: FoodLog; onClick: () => void }) {
  const { gradient, glow, score } = getHealthGradient(meal);

  const scoreColors = {
    great: 'text-emerald-400',
    good: 'text-teal-400',
    moderate: 'text-amber-400',
    indulgent: 'text-rose-400',
  };

  return (
    <button
      onClick={onClick}
      className={`relative w-full overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} border border-white/[0.08] backdrop-blur-sm hover:border-white/[0.15] transition-all duration-300 text-left group`}
    >
      {/* Ambient glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 ${glow} rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity`} />

      <div className="relative p-4">
        {/* Top row: Time + Calories */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-text-muted tabular-nums">{meal.time}</span>
          {meal.calories && (
            <div className="flex items-center gap-1.5">
              <Flame size={14} className={scoreColors[score]} />
              <span className={`text-lg font-bold ${scoreColors[score]}`}>{meal.calories}</span>
              <span className="text-[10px] text-text-muted">cal</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm font-medium text-text-primary mb-3 line-clamp-2 pr-8">{meal.description}</p>

        {/* Macro bar */}
        <MacroBar protein={meal.protein || 0} carbs={meal.carbs || 0} fat={meal.fat || 0} />

        {/* Macro labels */}
        <div className="flex items-center gap-4 mt-2">
          {meal.protein && (
            <span className="text-[10px] text-rose-400/80">
              <span className="font-semibold">{meal.protein}g</span> protein
            </span>
          )}
          {meal.carbs && (
            <span className="text-[10px] text-amber-400/80">
              <span className="font-semibold">{meal.carbs}g</span> carbs
            </span>
          )}
          {meal.fat && (
            <span className="text-[10px] text-blue-400/80">
              <span className="font-semibold">{meal.fat}g</span> fat
            </span>
          )}
        </div>

        {/* AI badge */}
        {meal.isAiAnalyzed && (
          <div className="absolute top-3 right-3">
            <Sparkles size={14} className="text-violet-400" />
          </div>
        )}
      </div>
    </button>
  );
}

export function Design6_Gradient({ meals, onDelete: _onDelete, onEdit }: Design6Props): React.ReactElement {
  if (meals.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-1 mx-auto rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 mb-4" />
        <p className="text-sm text-text-muted">Start logging to see your nutrition flow</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {meals.map((meal) => (
        <GradientCard key={meal.id} meal={meal} onClick={() => onEdit(meal)} />
      ))}
    </div>
  );
}
