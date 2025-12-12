/**
 * DESIGN 9: Bento Grid
 * Japanese-inspired asymmetric grid layout. Each meal gets a "bento box"
 * sized based on calories. Photos are showcased beautifully.
 * High visual impact, editorial feel.
 */

import { Sparkles } from 'lucide-react';
import type { FoodLog } from '../../../../../hooks/nutrition';

interface Design9Props {
  meals: FoodLog[];
  onDelete: (id: string) => void;
  onEdit: (meal: FoodLog) => void;
}

type BoxSize = 'large' | 'medium' | 'small';

function getBoxSize(meal: FoodLog, index: number, _total: number): BoxSize {
  const calories = meal.calories || 300;

  // First meal or highest calorie gets large
  if (index === 0 || calories > 600) return 'large';
  // Low calorie items get small
  if (calories < 250) return 'small';
  // Everything else medium
  return 'medium';
}

function BentoBox({ meal, size, onClick }: { meal: FoodLog; size: BoxSize; onClick: () => void }) {
  const sizeClasses = {
    large: 'col-span-2 row-span-2',
    medium: 'col-span-1 row-span-1',
    small: 'col-span-1 row-span-1',
  };

  const heightClasses = {
    large: 'aspect-square',
    medium: 'aspect-[4/3]',
    small: 'aspect-square',
  };

  // Color based on primary macro
  const protein = meal.protein || 0;
  const carbs = meal.carbs || 0;
  const fat = meal.fat || 0;
  const dominant = protein > carbs && protein > fat ? 'protein' : carbs > fat ? 'carbs' : 'fat';

  const accentColors = {
    protein: { border: 'border-rose-500/20', text: 'text-rose-400', bg: 'from-rose-500/10' },
    carbs: { border: 'border-amber-500/20', text: 'text-amber-400', bg: 'from-amber-500/10' },
    fat: { border: 'border-blue-500/20', text: 'text-blue-400', bg: 'from-blue-500/10' },
  };

  const accent = accentColors[dominant];

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} ${heightClasses[size]} relative rounded-2xl overflow-hidden border ${accent.border} hover:border-white/20 transition-all group`}
    >
      {/* Background */}
      {meal.photoUrl ? (
        <>
          <img
            src={meal.photoUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${accent.bg} via-transparent to-transparent bg-surface`} />
      )}

      {/* Content overlay */}
      <div className="absolute inset-0 p-3 flex flex-col justify-between">
        {/* Top: Time + AI badge */}
        <div className="flex items-start justify-between">
          <span className={`text-[10px] ${meal.photoUrl ? 'text-white/70' : 'text-text-muted'} tabular-nums bg-black/20 backdrop-blur-sm px-1.5 py-0.5 rounded`}>
            {meal.time}
          </span>
          {meal.isAiAnalyzed && (
            <div className="w-5 h-5 rounded-full bg-violet-500/80 backdrop-blur-sm flex items-center justify-center">
              <Sparkles size={10} className="text-white" />
            </div>
          )}
        </div>

        {/* Bottom: Info */}
        <div>
          {/* Description */}
          <p className={`text-sm font-medium ${meal.photoUrl ? 'text-white' : 'text-text-primary'} line-clamp-2 mb-2`}>
            {meal.description}
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {size !== 'small' && (
                <>
                  {meal.protein && (
                    <span className={`text-[10px] ${meal.photoUrl ? 'text-white/80' : 'text-rose-400'}`}>
                      {meal.protein}g P
                    </span>
                  )}
                  {meal.carbs && (
                    <span className={`text-[10px] ${meal.photoUrl ? 'text-white/80' : 'text-amber-400'}`}>
                      {meal.carbs}g C
                    </span>
                  )}
                  {meal.fat && (
                    <span className={`text-[10px] ${meal.photoUrl ? 'text-white/80' : 'text-blue-400'}`}>
                      {meal.fat}g F
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Calories badge */}
            {meal.calories && (
              <div className={`px-2 py-0.5 rounded-lg ${meal.photoUrl ? 'bg-white/20 backdrop-blur-sm' : 'bg-white/[0.06]'}`}>
                <span className={`text-sm font-bold ${meal.photoUrl ? 'text-white' : accent.text}`}>
                  {meal.calories}
                </span>
                <span className={`text-[8px] ml-0.5 ${meal.photoUrl ? 'text-white/70' : 'text-text-muted'}`}>cal</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export function Design9_Bento({ meals, onDelete: _onDelete, onEdit }: Design9Props): React.ReactElement {
  if (meals.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="grid grid-cols-3 gap-2 w-24 mx-auto mb-4">
          <div className="col-span-2 row-span-2 aspect-square rounded-lg bg-white/[0.03] border border-white/[0.06]" />
          <div className="aspect-square rounded-lg bg-white/[0.03] border border-white/[0.06]" />
          <div className="aspect-square rounded-lg bg-white/[0.03] border border-white/[0.06]" />
        </div>
        <p className="text-sm text-text-muted">Your meals will appear in a beautiful grid</p>
      </div>
    );
  }

  // Calculate sizes for each meal
  const sizes = meals.map((meal, index) => getBoxSize(meal, index, meals.length));

  // Ensure grid works well
  // If first is large, others should be small/medium to fit
  if (sizes[0] === 'large' && meals.length > 1) {
    sizes[1] = 'small';
    if (sizes[2]) sizes[2] = 'small';
  }

  return (
    <div className="grid grid-cols-2 gap-2 auto-rows-min">
      {meals.map((meal, index) => (
        <BentoBox
          key={meal.id}
          meal={meal}
          size={sizes[index]}
          onClick={() => onEdit(meal)}
        />
      ))}
    </div>
  );
}
