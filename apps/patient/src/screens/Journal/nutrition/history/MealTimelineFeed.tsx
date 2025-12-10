/**
 * Meal Timeline Feed - Recent meal entries grouped by date
 * Shows meal history with photos, macros, and expandable details
 */

import { useState, useMemo } from 'react';
import { ChevronRight, Calendar, Clock, Utensils } from 'lucide-react';
import type { FoodLog, DailyFoodData } from '../../../../hooks/nutrition';
import { mealConfig } from '../types';

interface MealTimelineFeedProps {
  history: DailyFoodData[];
  onSelectDate: (date: string) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split('T')[0]) return 'Today';
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

interface MealEntryProps {
  meal: FoodLog;
}

function MealEntry({ meal }: MealEntryProps): React.ReactElement {
  const config = mealConfig[meal.mealType];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 py-2">
      {/* Photo or icon */}
      {meal.photoUrl ? (
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
          <img src={meal.photoUrl} alt={meal.description} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0`}>
          <Icon size={16} className="text-white" />
        </div>
      )}

      {/* Meal info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-primary">{config.label}</span>
          <span className="text-[10px] text-text-muted flex items-center gap-0.5">
            <Clock size={8} />
            {meal.time}
          </span>
        </div>
        <p className="text-[11px] text-text-secondary truncate">{meal.description}</p>
      </div>

      {/* Calories */}
      {meal.calories && (
        <span className="text-xs font-bold text-amber-400 flex-shrink-0">{meal.calories}</span>
      )}
    </div>
  );
}

interface DayGroupProps {
  date: string;
  meals: FoodLog[];
  totals: DailyFoodData['totals'];
  onSelect: () => void;
}

function DayGroup({ date, meals, totals, onSelect }: DayGroupProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(date === new Date().toISOString().split('T')[0]);

  return (
    <div className="bg-white/[0.02] rounded-xl border border-white/[0.04] overflow-hidden">
      {/* Day header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary">{formatDate(date)}</span>
          <span className="text-[10px] text-text-muted">({meals.length} meals)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-amber-400">{totals.calories} cal</span>
          <ChevronRight
            size={14}
            className={`text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
          />
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-white/[0.04]">
          {/* Meals list */}
          <div className="divide-y divide-white/[0.04]">
            {meals.map((meal) => (
              <MealEntry key={meal.id} meal={meal} />
            ))}
          </div>

          {/* Day summary */}
          <div className="mt-3 pt-2 border-t border-white/[0.04] grid grid-cols-4 gap-2">
            {[
              { value: totals.protein, label: 'Protein', color: 'text-rose-400' },
              { value: totals.carbs, label: 'Carbs', color: 'text-amber-400' },
              { value: totals.fat, label: 'Fat', color: 'text-blue-400' },
              { value: totals.fiber, label: 'Fiber', color: 'text-emerald-400' },
            ].map(({ value, label, color }) => (
              <div key={label} className="text-center">
                <span className={`text-[11px] font-bold ${color}`}>{Math.round(value)}g</span>
                <span className="text-[9px] text-text-muted block">{label}</span>
              </div>
            ))}
          </div>

          {/* View details button */}
          <button
            onClick={onSelect}
            className="w-full mt-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs font-medium text-text-secondary hover:bg-white/[0.06] hover:text-text-primary transition-all"
          >
            View Full Day
          </button>
        </div>
      )}
    </div>
  );
}

export function MealTimelineFeed({ history, onSelectDate }: MealTimelineFeedProps): React.ReactElement | null {
  const [showAll, setShowAll] = useState(false);

  // Filter to days with meals, sorted newest first
  const daysWithMeals = useMemo(() => {
    return history
      .filter((d) => d.meals.length > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history]);

  if (daysWithMeals.length === 0) {
    return (
      <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-6 text-center">
        <Utensils size={24} className="text-text-muted mx-auto mb-2" />
        <p className="text-sm text-text-muted">No meals logged yet</p>
        <p className="text-xs text-text-muted/60 mt-1">Start tracking your meals to see history</p>
      </div>
    );
  }

  const displayDays = showAll ? daysWithMeals : daysWithMeals.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-primary">Recent Meals</h3>
        <span className="text-xs text-text-muted">{daysWithMeals.length} days logged</span>
      </div>

      {/* Day groups */}
      <div className="space-y-2">
        {displayDays.map((day) => (
          <DayGroup
            key={day.date}
            date={day.date}
            meals={day.meals}
            totals={day.totals}
            onSelect={() => onSelectDate(day.date)}
          />
        ))}
      </div>

      {/* Show more button */}
      {daysWithMeals.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/40 flex items-center justify-center gap-2 transition-all group"
        >
          <Calendar size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium text-emerald-400">
            {showAll ? 'Show Less' : `Browse All ${daysWithMeals.length} Days`}
          </span>
        </button>
      )}
    </div>
  );
}
