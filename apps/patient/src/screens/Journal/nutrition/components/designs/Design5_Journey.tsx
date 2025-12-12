/**
 * DESIGN 5: Daily Journey
 * A unique horizontal scroll experience showing meals as a "day journey"
 * from morning to night with a sun/moon indicator and health grades.
 * Shows the day's nutrition story with health grades and insights.
 */

import { useRef } from 'react';
import { Sunrise, Sun, Sunset, Moon, Flame, Trophy, AlertTriangle, Sparkles, ChevronRight } from 'lucide-react';
import type { FoodLog } from '../../../../../hooks/nutrition';
import { mealConfig } from '../../types';

interface Design5Props {
  meals: FoodLog[];
  onDelete: (id: string) => void;
  onEdit: (meal: FoodLog) => void;
  dailyTotals?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

// Calculate a simple health grade based on macros
function getQuickGrade(meal: FoodLog): { grade: string; color: string } {
  const protein = meal.protein || 0;
  const fiber = meal.fiber || 0;
  const calories = meal.calories || 1;

  const proteinPer100 = (protein / calories) * 100;
  const fiberPer100 = (fiber / calories) * 100;

  // Simple scoring
  let score = 50;
  if (proteinPer100 > 4) score += 20;
  else if (proteinPer100 > 2) score += 10;
  if (fiberPer100 > 1.5) score += 15;
  else if (fiberPer100 > 0.8) score += 8;

  if (score >= 75) return { grade: 'A', color: 'bg-emerald-500 text-white' };
  if (score >= 60) return { grade: 'B', color: 'bg-teal-500 text-white' };
  if (score >= 45) return { grade: 'C', color: 'bg-amber-500 text-white' };
  return { grade: 'D', color: 'bg-orange-500 text-white' };
}

// Get time-of-day icon
function getTimeIcon(time: string): typeof Sun {
  const hour = parseInt(time.split(':')[0]);
  const isPM = time.toLowerCase().includes('pm');
  const hour24 = isPM && hour !== 12 ? hour + 12 : hour;

  if (hour24 < 10) return Sunrise;
  if (hour24 < 14) return Sun;
  if (hour24 < 18) return Sunset;
  return Moon;
}

function JourneyCard({ meal, onClick }: { meal: FoodLog; onClick: () => void }) {
  const config = mealConfig[meal.mealType];
  const Icon = config.icon;
  const TimeIcon = getTimeIcon(meal.time);
  const { grade, color } = getQuickGrade(meal);

  return (
    <button
      onClick={onClick}
      className="relative flex-shrink-0 w-[200px] rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all group"
    >
      {/* Time indicator at top */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-purple-500 opacity-50" />

      {/* Photo or gradient background */}
      <div className="aspect-[4/3] relative">
        {meal.photoUrl ? (
          <img src={meal.photoUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${config.gradient} opacity-20`} />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />

        {/* Health Grade Badge - top left */}
        <div className={`absolute top-2 left-2 w-7 h-7 rounded-lg ${color} flex items-center justify-center font-bold text-sm shadow-lg`}>
          {grade}
        </div>

        {/* Time badge - top right */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
          <TimeIcon size={10} className="text-amber-300" />
          <span className="text-[10px] text-white/90">{meal.time}</span>
        </div>

        {/* AI indicator */}
        {meal.isAiAnalyzed && (
          <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-violet-500/90 flex items-center justify-center">
            <Sparkles size={10} className="text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 -mt-4 relative">
        {/* Meal type */}
        <div className="flex items-center gap-1.5 mb-1">
          <Icon size={12} className={`text-white/70`} />
          <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">{config.label}</span>
        </div>

        {/* Description */}
        <p className="text-xs text-text-primary line-clamp-2 mb-2 min-h-[2rem]">{meal.description}</p>

        {/* Stats row */}
        <div className="flex items-center justify-between">
          {meal.calories && (
            <div className="flex items-center gap-1">
              <Flame size={11} className="text-amber-400" />
              <span className="text-xs font-semibold text-amber-400">{meal.calories}</span>
            </div>
          )}

          {/* Macros mini */}
          <div className="flex items-center gap-2">
            {meal.protein && <span className="text-[9px] text-rose-400">P:{meal.protein}g</span>}
            {meal.carbs && <span className="text-[9px] text-amber-400">C:{meal.carbs}g</span>}
          </div>
        </div>
      </div>

      {/* Edit hint */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight size={14} className="text-text-muted" />
      </div>
    </button>
  );
}

function DailyInsight({ totals }: { totals: Design5Props['dailyTotals'] }) {
  if (!totals || totals.calories === 0) return null;

  const insights: { icon: typeof Trophy; text: string; color: string }[] = [];

  if (totals.protein > 50) {
    insights.push({ icon: Trophy, text: 'Great protein day!', color: 'text-emerald-400' });
  }
  if (totals.fiber > 20) {
    insights.push({ icon: Trophy, text: 'Excellent fiber intake', color: 'text-emerald-400' });
  }
  if (totals.protein < 30 && totals.calories > 1000) {
    insights.push({ icon: AlertTriangle, text: 'Could use more protein', color: 'text-amber-400' });
  }

  if (insights.length === 0) return null;

  return (
    <div className="px-4 py-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
      {insights.map((insight, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <insight.icon size={12} className={insight.color} />
          <span className={`text-xs ${insight.color}`}>{insight.text}</span>
        </div>
      ))}
    </div>
  );
}

export function Design5_Journey({ meals, onDelete: _onDelete, onEdit, dailyTotals }: Design5Props): React.ReactElement {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (meals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center gap-2 text-text-muted mb-3">
          <Sunrise size={20} />
          <div className="w-12 h-px bg-gradient-to-r from-amber-500 via-orange-400 to-purple-500 opacity-50" />
          <Moon size={20} />
        </div>
        <p className="text-sm text-text-muted">Start your food journey</p>
        <p className="text-xs text-text-muted/60 mt-1">Log your first meal to see your day unfold</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Journey header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sunrise size={14} className="text-amber-400" />
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-400 to-purple-500" />
          <Moon size={14} className="text-indigo-400" />
        </div>
        <span className="text-[10px] text-text-muted">
          {meals.length} {meals.length === 1 ? 'meal' : 'meals'} logged
        </span>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {meals.map((meal) => (
          <div key={meal.id} className="snap-start">
            <JourneyCard meal={meal} onClick={() => onEdit(meal)} />
          </div>
        ))}

        {/* "Add more" prompt at end */}
        <div className="flex-shrink-0 w-[100px] rounded-2xl border-2 border-dashed border-white/[0.08] flex items-center justify-center">
          <span className="text-xs text-text-muted text-center px-2">Add another meal</span>
        </div>
      </div>

      {/* Daily insight */}
      <DailyInsight totals={dailyTotals} />
    </div>
  );
}
