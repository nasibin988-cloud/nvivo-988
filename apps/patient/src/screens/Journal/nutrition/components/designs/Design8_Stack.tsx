/**
 * DESIGN 8: Stacked Cards
 * Cards that visually "stack" with depth effect. Most recent on top.
 * Swipe or tap to reveal cards underneath. Premium, playful feel.
 */

import { useState } from 'react';
import { ChevronUp, Sparkles } from 'lucide-react';
import type { FoodLog } from '../../../../../hooks/nutrition';

interface Design8Props {
  meals: FoodLog[];
  onDelete: (id: string) => void;
  onEdit: (meal: FoodLog) => void;
}

function StackedCard({
  meal,
  index,
  total,
  isExpanded,
  onClick,
  onEdit
}: {
  meal: FoodLog;
  index: number;
  total: number;
  isExpanded: boolean;
  onClick: () => void;
  onEdit: () => void;
}) {
  const isTop = index === 0;
  const depth = index;

  // Calculate visual properties based on position
  const scale = isExpanded ? 1 : Math.max(0.92, 1 - depth * 0.03);
  const yOffset = isExpanded ? index * 100 : depth * 8;
  const opacity = isExpanded ? 1 : Math.max(0.4, 1 - depth * 0.2);
  const blur = isExpanded ? 0 : depth * 0.5;

  // Gradient based on calorie density
  const calories = meal.calories || 0;
  const gradient = calories > 600
    ? 'from-rose-500/10 via-pink-500/5 to-transparent'
    : calories > 400
    ? 'from-amber-500/10 via-orange-500/5 to-transparent'
    : 'from-emerald-500/10 via-teal-500/5 to-transparent';

  return (
    <div
      className="absolute inset-x-0 transition-all duration-500 ease-out"
      style={{
        transform: `translateY(${yOffset}px) scale(${scale})`,
        opacity,
        filter: `blur(${blur}px)`,
        zIndex: total - index,
      }}
    >
      <button
        onClick={isTop || isExpanded ? onEdit : onClick}
        className={`w-full rounded-2xl bg-gradient-to-br ${gradient} bg-surface border border-white/[0.08] backdrop-blur-xl overflow-hidden text-left transition-all hover:border-white/[0.15]`}
      >
        <div className="p-4">
          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-[10px] text-text-muted tabular-nums block mb-0.5">{meal.time}</span>
              <p className="text-sm font-semibold text-text-primary line-clamp-1">{meal.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {meal.isAiAnalyzed && <Sparkles size={12} className="text-violet-400" />}
              {meal.calories && (
                <div className="bg-white/[0.06] px-2.5 py-1 rounded-lg">
                  <span className="text-sm font-bold text-text-primary">{meal.calories}</span>
                  <span className="text-[9px] text-text-muted ml-0.5">cal</span>
                </div>
              )}
            </div>
          </div>

          {/* Macro visualization - stacked bars */}
          <div className="space-y-1.5">
            {meal.protein && (
              <div className="flex items-center gap-2">
                <div className="w-12 text-[9px] text-text-muted">Protein</div>
                <div className="flex-1 h-2 bg-white/[0.03] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((meal.protein / 30) * 100, 100)}%` }}
                  />
                </div>
                <span className="w-8 text-[10px] font-medium text-rose-400 text-right">{meal.protein}g</span>
              </div>
            )}
            {meal.carbs && (
              <div className="flex items-center gap-2">
                <div className="w-12 text-[9px] text-text-muted">Carbs</div>
                <div className="flex-1 h-2 bg-white/[0.03] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((meal.carbs / 80) * 100, 100)}%` }}
                  />
                </div>
                <span className="w-8 text-[10px] font-medium text-amber-400 text-right">{meal.carbs}g</span>
              </div>
            )}
            {meal.fat && (
              <div className="flex items-center gap-2">
                <div className="w-12 text-[9px] text-text-muted">Fat</div>
                <div className="flex-1 h-2 bg-white/[0.03] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((meal.fat / 25) * 100, 100)}%` }}
                  />
                </div>
                <span className="w-8 text-[10px] font-medium text-blue-400 text-right">{meal.fat}g</span>
              </div>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}

export function Design8_Stack({ meals, onDelete: _onDelete, onEdit }: Design8Props): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);

  if (meals.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="relative w-24 h-16 mx-auto mb-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute inset-x-0 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              style={{
                transform: `translateY(${i * 6}px) scale(${1 - i * 0.05})`,
                opacity: 1 - i * 0.3,
              }}
            />
          ))}
        </div>
        <p className="text-sm text-text-muted">Your meals will stack here</p>
      </div>
    );
  }

  // Sort by time (most recent first)
  const sortedMeals = [...meals].reverse();
  const containerHeight = isExpanded ? sortedMeals.length * 100 + 20 : 140;

  return (
    <div className="space-y-3">
      {/* Stack container */}
      <div
        className="relative transition-all duration-500"
        style={{ height: containerHeight }}
      >
        {sortedMeals.map((meal, index) => (
          <StackedCard
            key={meal.id}
            meal={meal}
            index={index}
            total={sortedMeals.length}
            isExpanded={isExpanded}
            onClick={() => setIsExpanded(true)}
            onEdit={() => onEdit(meal)}
          />
        ))}
      </div>

      {/* Expand/Collapse toggle */}
      {meals.length > 1 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-1 py-2 text-[11px] text-text-muted hover:text-text-secondary transition-colors"
        >
          <ChevronUp
            size={14}
            className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          />
          {isExpanded ? 'Collapse' : `View all ${meals.length} meals`}
        </button>
      )}
    </div>
  );
}
