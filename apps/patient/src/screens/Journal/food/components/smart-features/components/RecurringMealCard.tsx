/**
 * RecurringMealCard - Displays a recurring meal schedule
 */

import { Clock, Repeat, Bell, BellOff, Trash2, Play, Pause } from 'lucide-react';
import type { RecurringMeal } from '../types';
import { formatSchedule } from '../utils';

interface RecurringMealCardProps {
  meal: RecurringMeal;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
  onLogNow: (meal: RecurringMeal) => void;
}

const MEAL_TYPE_CONFIG = {
  breakfast: { label: 'Breakfast', color: 'amber' },
  lunch: { label: 'Lunch', color: 'emerald' },
  dinner: { label: 'Dinner', color: 'violet' },
  snack: { label: 'Snack', color: 'blue' },
} as const;

export function RecurringMealCard({
  meal,
  onToggleActive,
  onDelete,
  onLogNow,
}: RecurringMealCardProps): React.ReactElement {
  const config = MEAL_TYPE_CONFIG[meal.mealType];

  return (
    <div className={`bg-white/[0.02] rounded-xl border ${meal.isActive ? 'border-white/[0.08]' : 'border-white/[0.04] opacity-60'} overflow-hidden transition-all`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-${config.color}-500/15 flex items-center justify-center`}>
              <Repeat size={18} className={`text-${config.color}-400`} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary">{meal.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium bg-${config.color}-500/15 text-${config.color}-400`}>
                  {config.label}
                </span>
                <span className="text-[10px] text-text-muted flex items-center gap-1">
                  <Clock size={10} />
                  {formatSchedule(meal.schedule)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleActive(meal.id)}
              className={`p-1.5 rounded-lg border transition-all ${
                meal.isActive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15'
                  : 'bg-white/[0.02] border-white/[0.04] text-text-muted hover:text-text-primary'
              }`}
              title={meal.isActive ? 'Pause schedule' : 'Resume schedule'}
            >
              {meal.isActive ? <Pause size={12} /> : <Play size={12} />}
            </button>
            <button
              onClick={() => onDelete(meal.id)}
              className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-text-muted hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Foods list */}
        <div className="bg-white/[0.02] rounded-lg p-2.5 mb-3 space-y-1.5">
          {meal.foods.map((food) => (
            <div key={food.id} className="flex items-center justify-between text-xs">
              <span className="text-text-secondary truncate flex-1 mr-2">{food.name}</span>
              <span className="text-text-muted">{food.calories} cal</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: 'Calories', value: meal.totalCalories },
            { label: 'Protein', value: `${meal.totalProtein}g` },
            { label: 'Carbs', value: `${meal.totalCarbs}g` },
            { label: 'Fat', value: `${meal.totalFat}g` },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <span className="text-xs font-bold text-text-primary block">{value}</span>
              <span className="text-[9px] text-text-muted">{label}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
            {meal.schedule.reminderEnabled ? (
              <>
                <Bell size={10} className="text-amber-400" />
                <span>Reminder on</span>
              </>
            ) : (
              <>
                <BellOff size={10} />
                <span>No reminder</span>
              </>
            )}
          </div>
          <button
            onClick={() => onLogNow(meal)}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all"
          >
            Log Now
          </button>
        </div>
      </div>
    </div>
  );
}
