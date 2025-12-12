/**
 * DESIGN 4: Photo Gallery
 * Instagram-style photo-first grid. Meals with photos get full attention,
 * text-only entries are shown in a compact list below.
 * Perfect for users who love photo logging.
 */

import { useState } from 'react';
import { Clock, Flame, Camera, ChevronDown, Sparkles } from 'lucide-react';
import type { FoodLog } from '../../../../../hooks/nutrition';
import { mealConfig } from '../../types';

interface Design4Props {
  meals: FoodLog[];
  onDelete: (id: string) => void;
  onEdit: (meal: FoodLog) => void;
}

function PhotoCard({ meal, onClick }: { meal: FoodLog; onClick: () => void }) {
  const config = mealConfig[meal.mealType];

  return (
    <button
      onClick={onClick}
      className="relative aspect-square rounded-2xl overflow-hidden group"
    >
      <img
        src={meal.photoUrl}
        alt={meal.description}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

      {/* AI badge */}
      {meal.isAiAnalyzed && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-violet-500/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
          <Sparkles size={12} className="text-white" />
        </div>
      )}

      {/* Content overlay */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        {/* Meal type + time */}
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] font-semibold uppercase tracking-wider text-white/90`}>
            {config.label}
          </span>
          <span className="text-[10px] text-white/60 flex items-center gap-0.5">
            <Clock size={8} />
            {meal.time}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-white/90 line-clamp-2 mb-2">{meal.description}</p>

        {/* Calories badge */}
        {meal.calories && (
          <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full">
            <Flame size={10} className="text-amber-400" />
            <span className="text-[10px] font-bold text-white">{meal.calories} cal</span>
          </div>
        )}
      </div>
    </button>
  );
}

function TextMealItem({ meal, onClick }: { meal: FoodLog; onClick: () => void }) {
  const config = mealConfig[meal.mealType];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors w-full text-left"
    >
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center shrink-0`}>
        <Icon size={14} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-primary line-clamp-1">{meal.description}</p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted">{meal.time}</span>
          {meal.calories && (
            <span className="text-[10px] font-medium text-amber-400">{meal.calories} cal</span>
          )}
        </div>
      </div>
    </button>
  );
}

export function Design4_Photo({ meals, onDelete: _onDelete, onEdit }: Design4Props): React.ReactElement {
  const [showTextMeals, setShowTextMeals] = useState(true);

  const photoMeals = meals.filter(m => m.photoUrl);
  const textMeals = meals.filter(m => !m.photoUrl);

  if (meals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
          <Camera size={24} className="text-text-muted" />
        </div>
        <p className="text-sm text-text-muted">No meals logged</p>
        <p className="text-xs text-text-muted/60 mt-1">Take a photo of your food to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Photo grid */}
      {photoMeals.length > 0 && (
        <div className={`grid gap-2 ${photoMeals.length === 1 ? 'grid-cols-1' : photoMeals.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {photoMeals.map((meal, idx) => (
            <div
              key={meal.id}
              className={photoMeals.length === 3 && idx === 0 ? 'col-span-2' : ''}
            >
              <PhotoCard meal={meal} onClick={() => onEdit(meal)} />
            </div>
          ))}
        </div>
      )}

      {/* Text meals section */}
      {textMeals.length > 0 && (
        <div className="border-t border-white/[0.06] pt-3">
          <button
            onClick={() => setShowTextMeals(!showTextMeals)}
            className="flex items-center gap-2 w-full py-1 text-left"
          >
            <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
              {textMeals.length} more {textMeals.length === 1 ? 'entry' : 'entries'}
            </span>
            <ChevronDown
              size={12}
              className={`text-text-muted transition-transform ${showTextMeals ? 'rotate-180' : ''}`}
            />
          </button>

          {showTextMeals && (
            <div className="mt-2 space-y-1">
              {textMeals.map((meal) => (
                <TextMealItem
                  key={meal.id}
                  meal={meal}
                  onClick={() => onEdit(meal)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* No photos prompt */}
      {photoMeals.length === 0 && textMeals.length > 0 && (
        <div className="text-center py-4 border border-dashed border-white/10 rounded-xl">
          <Camera size={20} className="text-text-muted mx-auto mb-2" />
          <p className="text-xs text-text-muted">Try photo logging for a richer experience</p>
        </div>
      )}
    </div>
  );
}
