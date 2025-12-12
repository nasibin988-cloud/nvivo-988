/**
 * DESIGN 2: Compact Cards Grid
 * A dense, data-rich grid layout with mini donut charts for macros.
 * Great for power users who want to see everything at a glance.
 */

import { Flame, Clock, Sparkles } from 'lucide-react';
import type { FoodLog } from '../../../../../hooks/nutrition';
import { mealConfig } from '../../types';

interface Design2Props {
  meals: FoodLog[];
  onDelete: (id: string) => void;
  onEdit: (meal: FoodLog) => void;
}

// Mini donut chart for macro distribution
function MacroDonut({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const total = protein + carbs + fat;
  if (total === 0) return null;

  const proteinPct = (protein / total) * 100;
  const carbsPct = (carbs / total) * 100;
  const fatPct = (fat / total) * 100;

  // SVG donut calculations
  const size = 32;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const proteinOffset = 0;
  const carbsOffset = (proteinPct / 100) * circumference;
  const fatOffset = ((proteinPct + carbsPct) / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Protein - Rose */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="#f43f5e"
        strokeWidth={strokeWidth}
        strokeDasharray={`${(proteinPct / 100) * circumference} ${circumference}`}
        strokeDashoffset={-proteinOffset}
      />
      {/* Carbs - Amber */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="#f59e0b"
        strokeWidth={strokeWidth}
        strokeDasharray={`${(carbsPct / 100) * circumference} ${circumference}`}
        strokeDashoffset={-carbsOffset}
      />
      {/* Fat - Blue */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="#3b82f6"
        strokeWidth={strokeWidth}
        strokeDasharray={`${(fatPct / 100) * circumference} ${circumference}`}
        strokeDashoffset={-fatOffset}
      />
    </svg>
  );
}

function CompactCard({ meal, onClick }: { meal: FoodLog; onClick: () => void }) {
  const config = mealConfig[meal.mealType];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className="relative w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all text-left group"
    >
      {/* AI badge */}
      {meal.isAiAnalyzed && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Sparkles size={10} className="text-white" />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Photo thumbnail or icon */}
        <div className="relative shrink-0">
          {meal.photoUrl ? (
            <div className="w-12 h-12 rounded-lg overflow-hidden">
              <img src={meal.photoUrl} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
              <Icon size={20} className="text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{config.label}</span>
            <span className="text-text-muted/40">•</span>
            <span className="text-[10px] text-text-muted flex items-center gap-0.5">
              <Clock size={8} />
              {meal.time}
            </span>
          </div>
          <p className="text-xs text-text-primary font-medium line-clamp-2">{meal.description}</p>
        </div>

        {/* Macro donut + calories */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <MacroDonut
            protein={meal.protein || 0}
            carbs={meal.carbs || 0}
            fat={meal.fat || 0}
          />
          {meal.calories && (
            <div className="flex items-center gap-0.5">
              <Flame size={10} className="text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400">{meal.calories}</span>
            </div>
          )}
        </div>
      </div>

      {/* Macro breakdown bar - shown on hover */}
      <div className="mt-2 h-1 rounded-full overflow-hidden bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity">
        {(meal.protein || meal.carbs || meal.fat) ? (
          <div className="h-full flex">
            <div
              className="h-full bg-rose-400"
              style={{ width: `${((meal.protein || 0) / ((meal.protein || 0) + (meal.carbs || 0) + (meal.fat || 0))) * 100}%` }}
            />
            <div
              className="h-full bg-amber-400"
              style={{ width: `${((meal.carbs || 0) / ((meal.protein || 0) + (meal.carbs || 0) + (meal.fat || 0))) * 100}%` }}
            />
            <div
              className="h-full bg-blue-400"
              style={{ width: `${((meal.fat || 0) / ((meal.protein || 0) + (meal.carbs || 0) + (meal.fat || 0))) * 100}%` }}
            />
          </div>
        ) : null}
      </div>
    </button>
  );
}

export function Design2_Cards({ meals, onDelete: _onDelete, onEdit }: Design2Props): React.ReactElement {
  if (meals.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p className="text-sm">No meals logged today</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {meals.map((meal) => (
        <CompactCard
          key={meal.id}
          meal={meal}
          onClick={() => onEdit(meal)}
        />
      ))}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-rose-400" />
          <span className="text-[9px] text-text-muted">Protein</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-[9px] text-text-muted">Carbs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-[9px] text-text-muted">Fat</span>
        </div>
      </div>
    </div>
  );
}
