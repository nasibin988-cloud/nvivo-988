/**
 * DESIGN 12: Compact Rows
 * Dense, information-rich rows that fit the app's aesthetic.
 * Photo thumbnails, inline macro dots, clean typography.
 */

import { Sparkles, ChevronRight } from 'lucide-react';
import type { FoodLog } from '../../../../../hooks/nutrition';

interface Design12Props {
  meals: FoodLog[];
  onDelete: (id: string) => void;
  onEdit: (meal: FoodLog) => void;
}

function MacroDot({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div className="flex items-center gap-1" title={label}>
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] text-text-secondary tabular-nums">{value}g</span>
    </div>
  );
}

function CompactRow({ meal, onClick }: { meal: FoodLog; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all text-left group"
    >
      {/* Photo or placeholder */}
      {meal.photoUrl ? (
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/[0.06]">
          <img src={meal.photoUrl} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.04] flex items-center justify-center shrink-0">
          <span className="text-lg">🍽️</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] text-text-muted tabular-nums">{meal.time}</span>
          {meal.isAiAnalyzed && <Sparkles size={10} className="text-violet-400" />}
        </div>
        <p className="text-sm font-medium text-text-primary line-clamp-1 mb-1">{meal.description}</p>

        {/* Macro dots */}
        <div className="flex items-center gap-3">
          {meal.protein && <MacroDot value={meal.protein} color="#f43f5e" label="Protein" />}
          {meal.carbs && <MacroDot value={meal.carbs} color="#f59e0b" label="Carbs" />}
          {meal.fat && <MacroDot value={meal.fat} color="#3b82f6" label="Fat" />}
        </div>
      </div>

      {/* Calories + chevron */}
      <div className="flex items-center gap-2 shrink-0">
        {meal.calories && (
          <div className="text-right">
            <span className="text-base font-bold text-emerald-400 tabular-nums">{meal.calories}</span>
            <span className="text-[8px] text-text-muted block">cal</span>
          </div>
        )}
        <ChevronRight size={16} className="text-text-muted/40 group-hover:text-text-muted transition-colors" />
      </div>
    </button>
  );
}

export function Design12_Compact({ meals, onDelete: _onDelete, onEdit }: Design12Props): React.ReactElement {
  if (meals.length === 0) {
    return (
      <div className="bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/[0.04] p-8 text-center">
        <p className="text-sm text-text-muted">No meals logged yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {meals.map((meal) => (
        <CompactRow key={meal.id} meal={meal} onClick={() => onEdit(meal)} />
      ))}
    </div>
  );
}
