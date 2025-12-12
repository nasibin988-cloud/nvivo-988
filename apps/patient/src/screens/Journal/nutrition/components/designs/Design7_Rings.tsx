/**
 * DESIGN 7: Concentric Rings
 * Each meal shows as concentric rings representing P/C/F completion.
 * Apple Watch-inspired but more sophisticated. Photo-forward when available.
 */

import { Sparkles } from 'lucide-react';
import type { FoodLog } from '../../../../../hooks/nutrition';

interface Design7Props {
  meals: FoodLog[];
  onDelete: (id: string) => void;
  onEdit: (meal: FoodLog) => void;
}

// Animated ring component
function NutrientRing({
  value,
  max,
  radius,
  color,
  strokeWidth = 3
}: {
  value: number;
  max: number;
  radius: number;
  color: string;
  strokeWidth?: number;
}) {
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference - (progress * circumference);

  return (
    <circle
      cx="32"
      cy="32"
      r={radius}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray={circumference}
      strokeDashoffset={offset}
      className="transition-all duration-700 ease-out"
      style={{ transform: 'rotate(-90deg)', transformOrigin: '32px 32px' }}
    />
  );
}

function RingsDisplay({ meal }: { meal: FoodLog }) {
  // Target values for a single meal (roughly 1/3 of daily)
  const targets = { protein: 20, carbs: 60, fat: 20 };

  return (
    <div className="relative w-16 h-16">
      <svg viewBox="0 0 64 64" className="w-full h-full">
        {/* Background rings */}
        <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(244,63,94,0.15)" strokeWidth="3" />
        <circle cx="32" cy="32" r="22" fill="none" stroke="rgba(245,158,11,0.15)" strokeWidth="3" />
        <circle cx="32" cy="32" r="16" fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="3" />

        {/* Progress rings */}
        <NutrientRing value={meal.protein || 0} max={targets.protein} radius={28} color="#f43f5e" />
        <NutrientRing value={meal.carbs || 0} max={targets.carbs} radius={22} color="#f59e0b" />
        <NutrientRing value={meal.fat || 0} max={targets.fat} radius={16} color="#3b82f6" />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-text-primary">{meal.calories || 0}</span>
      </div>
    </div>
  );
}

function RingsCard({ meal, onClick }: { meal: FoodLog; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative w-full flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all text-left group"
    >
      {/* Photo or Rings */}
      {meal.photoUrl ? (
        <div className="relative">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10">
            <img src={meal.photoUrl} alt="" className="w-full h-full object-cover" />
          </div>
          {/* Mini rings overlay */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-surface rounded-full p-0.5 border border-white/10">
            <svg viewBox="0 0 64 64" className="w-full h-full">
              <NutrientRing value={meal.protein || 0} max={20} radius={26} color="#f43f5e" strokeWidth={5} />
              <NutrientRing value={meal.carbs || 0} max={60} radius={18} color="#f59e0b" strokeWidth={5} />
            </svg>
          </div>
        </div>
      ) : (
        <RingsDisplay meal={meal} />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] text-text-muted tabular-nums">{meal.time}</span>
          {meal.isAiAnalyzed && <Sparkles size={10} className="text-violet-400" />}
        </div>
        <p className="text-sm font-medium text-text-primary line-clamp-1 mb-2">{meal.description}</p>

        {/* Inline macros with dots */}
        <div className="flex items-center gap-3">
          {meal.protein && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span className="text-[10px] text-text-secondary">{meal.protein}g</span>
            </div>
          )}
          {meal.carbs && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[10px] text-text-secondary">{meal.carbs}g</span>
            </div>
          )}
          {meal.fat && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-[10px] text-text-secondary">{meal.fat}g</span>
            </div>
          )}
        </div>
      </div>

      {/* Calories on right */}
      {meal.calories && (
        <div className="text-right shrink-0">
          <span className="text-xl font-light text-text-primary tabular-nums">{meal.calories}</span>
          <span className="text-[9px] text-text-muted block">cal</span>
        </div>
      )}
    </button>
  );
}

export function Design7_Rings({ meals, onDelete: _onDelete, onEdit }: Design7Props): React.ReactElement {
  if (meals.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-4">
          <svg viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(244,63,94,0.2)" strokeWidth="3" />
            <circle cx="32" cy="32" r="22" fill="none" stroke="rgba(245,158,11,0.2)" strokeWidth="3" />
            <circle cx="32" cy="32" r="16" fill="none" stroke="rgba(59,130,246,0.2)" strokeWidth="3" />
          </svg>
        </div>
        <p className="text-sm text-text-muted">Log meals to fill your rings</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {meals.map((meal) => (
        <RingsCard key={meal.id} meal={meal} onClick={() => onEdit(meal)} />
      ))}
    </div>
  );
}
