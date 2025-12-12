/**
 * DESIGN 3: Ultra Minimal List
 * Clean, Apple Health-inspired list with subtle typography hierarchy.
 * Focus on readability and elegance. No icons, just beautiful text.
 */

import { useState } from 'react';
import type { FoodLog } from '../../../../../hooks/nutrition';
import { mealConfig } from '../../types';

interface Design3Props {
  meals: FoodLog[];
  onDelete: (id: string) => void;
  onEdit: (meal: FoodLog) => void;
}

function ListItem({ meal, onEdit, onDelete }: { meal: FoodLog; onEdit: () => void; onDelete: () => void }) {
  const [isPressed, setIsPressed] = useState(false);
  const config = mealConfig[meal.mealType];

  // Color accent based on meal type
  const accentColors: Record<string, string> = {
    breakfast: 'text-amber-400',
    lunch: 'text-emerald-400',
    snack: 'text-rose-400',
    dinner: 'text-indigo-400',
  };

  return (
    <div
      className={`relative transition-all duration-200 ${isPressed ? 'scale-[0.98] opacity-80' : ''}`}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      <button
        onClick={onEdit}
        className="w-full py-4 flex items-baseline gap-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors text-left"
      >
        {/* Time - fixed width */}
        <span className="w-16 text-[11px] tabular-nums text-text-muted shrink-0">
          {meal.time}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Meal type label - colored accent */}
          <span className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${accentColors[meal.mealType]}`}>
            {config.label}
          </span>

          {/* Description */}
          <p className="text-sm text-text-primary mt-0.5 line-clamp-1">
            {meal.description}
          </p>

          {/* Macros inline - subtle */}
          {(meal.protein || meal.carbs || meal.fat) && (
            <div className="flex items-center gap-3 mt-1">
              {meal.protein && (
                <span className="text-[10px] text-text-muted">
                  P <span className="font-medium text-text-secondary">{meal.protein}g</span>
                </span>
              )}
              {meal.carbs && (
                <span className="text-[10px] text-text-muted">
                  C <span className="font-medium text-text-secondary">{meal.carbs}g</span>
                </span>
              )}
              {meal.fat && (
                <span className="text-[10px] text-text-muted">
                  F <span className="font-medium text-text-secondary">{meal.fat}g</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Calories - right aligned, bold */}
        {meal.calories && (
          <div className="shrink-0 text-right">
            <span className="text-lg font-light text-text-primary tabular-nums">{meal.calories}</span>
            <span className="text-[10px] text-text-muted ml-0.5">cal</span>
          </div>
        )}
      </button>

      {/* Delete on long press - hint */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-[10px] text-rose-400/60 hover:text-rose-400 px-2 py-1"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export function Design3_List({ meals, onDelete, onEdit }: Design3Props): React.ReactElement {
  if (meals.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-text-muted">Nothing logged yet</p>
        <p className="text-xs text-text-muted/60 mt-1">Your meals will appear here</p>
      </div>
    );
  }

  // Group by meal type
  const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner'] as const;
  const groupedMeals = mealTypes.reduce((acc, type) => {
    acc[type] = meals.filter(m => m.mealType === type);
    return acc;
  }, {} as Record<string, FoodLog[]>);

  const hasMultipleGroups = Object.values(groupedMeals).filter(g => g.length > 0).length > 1;

  // If only one type, show flat list
  if (!hasMultipleGroups) {
    return (
      <div className="divide-y divide-white/[0.04]">
        {meals.map((meal) => (
          <ListItem
            key={meal.id}
            meal={meal}
            onEdit={() => onEdit(meal)}
            onDelete={() => onDelete(meal.id)}
          />
        ))}
      </div>
    );
  }

  // Show grouped
  return (
    <div className="space-y-6">
      {mealTypes.map((type) => {
        const typeMeals = groupedMeals[type];
        if (typeMeals.length === 0) return null;

        return (
          <div key={type}>
            {typeMeals.map((meal) => (
              <ListItem
                key={meal.id}
                meal={meal}
                onEdit={() => onEdit(meal)}
                onDelete={() => onDelete(meal.id)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
