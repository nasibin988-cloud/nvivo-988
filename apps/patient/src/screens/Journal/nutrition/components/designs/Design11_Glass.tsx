/**
 * DESIGN 11: Glass Cards
 * Matches the app's glassmorphic design language perfectly.
 * Clean cards with subtle gradients, macro progress bars, and elegant typography.
 */

import { Sparkles } from 'lucide-react';
import type { FoodLog } from '../../../../../hooks/nutrition';

interface Design11Props {
  meals: FoodLog[];
  onDelete: (id: string) => void;
  onEdit: (meal: FoodLog) => void;
}

function MacroProgress({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const percentage = Math.min((value / target) * 100, 100);

  return (
    <div className="flex-1">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[9px] text-text-muted">{label}</span>
        <span className="text-[10px] font-semibold text-text-secondary">{value}g</span>
      </div>
      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function GlassCard({ meal, onClick }: { meal: FoodLog; onClick: () => void }) {
  // Determine accent color based on dominant macro
  const protein = meal.protein || 0;
  const carbs = meal.carbs || 0;
  const fat = meal.fat || 0;
  const total = protein + carbs + fat;

  let accentColor = '#10b981'; // default emerald
  let glowColor = 'bg-emerald-500/10';

  if (total > 0) {
    if (protein / total > 0.35) {
      accentColor = '#f43f5e';
      glowColor = 'bg-rose-500/10';
    } else if (carbs / total > 0.5) {
      accentColor = '#f59e0b';
      glowColor = 'bg-amber-500/10';
    }
  }

  return (
    <button
      onClick={onClick}
      className="w-full bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/[0.04] p-4 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all text-left relative overflow-hidden group"
    >
      {/* Subtle glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${glowColor} rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity`} />

      <div className="relative">
        {/* Header: Time + Calories */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted tabular-nums">{meal.time}</span>
            {meal.isAiAnalyzed && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                <Sparkles size={8} className="text-violet-400" />
                <span className="text-[8px] font-medium text-violet-400">AI</span>
              </div>
            )}
          </div>
          {meal.calories && (
            <div className="text-right">
              <span className="text-lg font-bold" style={{ color: accentColor }}>{meal.calories}</span>
              <span className="text-[9px] text-text-muted ml-0.5">cal</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm font-medium text-text-primary mb-3 line-clamp-2">{meal.description}</p>

        {/* Macro bars */}
        <div className="flex gap-3">
          <MacroProgress label="Protein" value={protein} target={25} color="#f43f5e" />
          <MacroProgress label="Carbs" value={carbs} target={60} color="#f59e0b" />
          <MacroProgress label="Fat" value={fat} target={20} color="#3b82f6" />
        </div>
      </div>
    </button>
  );
}

export function Design11_Glass({ meals, onDelete: _onDelete, onEdit }: Design11Props): React.ReactElement {
  if (meals.length === 0) {
    return (
      <div className="bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/[0.04] p-8 text-center">
        <p className="text-sm text-text-muted">No meals logged yet</p>
        <p className="text-[10px] text-text-muted/60 mt-1">Tap + to add your first meal</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {meals.map((meal) => (
        <GlassCard key={meal.id} meal={meal} onClick={() => onEdit(meal)} />
      ))}
    </div>
  );
}
