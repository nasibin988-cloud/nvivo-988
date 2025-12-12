/**
 * DESIGN 16: Glassmorphic Grid
 * 3-column layout with tall cards, cool time indicator, and macro visualization.
 * Each meal is 1/3 width, emphasizing visual hierarchy.
 */

import { Sparkles } from 'lucide-react';
import type { FoodLog, MealType } from '../../../../../hooks/nutrition';
import type { NutritionTargets } from '../../../../../hooks/nutrition';

interface Design16Props {
  meals: FoodLog[];
  onDelete: (id: string) => void;
  onEdit: (meal: FoodLog) => void;
  targets?: NutritionTargets;
}

// Default targets if not provided
const DEFAULT_TARGETS = {
  protein: 50,
  carbs: 250,
  fat: 65,
};

function MacroGauge({
  value,
  target,
  color,
  label,
}: {
  value: number;
  target: number;
  color: string;
  label: string;
}) {
  const percentage = Math.min((value / target) * 100, 100);
  const isOver = value > target;

  // Semi-circle gauge (180 degrees)
  const radius = 24;
  const strokeWidth = 5;
  const circumference = Math.PI * radius; // Half circle
  const filledLength = (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${isOver ? 'animate-pulse' : ''}`} style={{ animationDuration: '2s' }}>
        <svg width="58" height="34" viewBox="0 0 58 34">
          {/* Background arc */}
          <path
            d="M 5 29 A 24 24 0 0 1 53 29"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Filled arc */}
          <path
            d="M 5 29 A 24 24 0 0 1 53 29"
            fill="none"
            stroke={isOver ? '#ef4444' : color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${filledLength} ${circumference}`}
            style={{
              filter: isOver
                ? 'drop-shadow(0 0 6px rgba(239,68,68,0.8)) drop-shadow(0 0 12px rgba(239,68,68,0.5))'
                : `drop-shadow(0 0 4px ${color}66)`,
              transition: 'all 0.6s ease-out',
            }}
          />

          {/* Overflow sparks effect */}
          {isOver && (
            <>
              <circle cx="53" cy="29" r="3" fill="#ef4444" className="animate-ping" style={{ animationDuration: '1s' }} />
              <circle cx="53" cy="29" r="2" fill="#fbbf24" />
            </>
          )}
        </svg>

        {/* Percentage in center */}
        <div className="absolute inset-0 flex items-end justify-center pb-0.5">
          <span className={`text-[11px] font-bold tabular-nums ${isOver ? 'text-red-400' : 'text-text-primary'}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      {/* Label and value */}
      <div className="text-center -mt-0.5">
        <span className={`text-[9px] font-medium ${isOver ? 'text-red-400' : ''}`} style={{ color: isOver ? undefined : color }}>
          {label}
        </span>
        <span className="text-[8px] text-text-muted ml-1">
          {value}g
        </span>
      </div>
    </div>
  );
}

function MacroGauges({
  protein,
  carbs,
  fat,
  targets,
}: {
  protein: number;
  carbs: number;
  fat: number;
  targets: { protein: number; carbs: number; fat: number };
}) {
  return (
    <div className="flex justify-between items-end gap-1 mb-2 px-1">
      <MacroGauge value={protein} target={targets.protein} color="#f43f5e" label="Protein" />
      <MacroGauge value={carbs} target={targets.carbs} color="#f59e0b" label="Carbs" />
      <MacroGauge value={fat} target={targets.fat} color="#3b82f6" label="Fat" />
    </div>
  );
}

function TimeIndicator({ time }: { time: string }) {
  // Parse time - handle both "HH:MM" and "H:MM AM/PM" formats
  const timeStr = time.toLowerCase();
  let hour: number;

  if (timeStr.includes('am') || timeStr.includes('pm')) {
    const [hourPart] = time.split(':');
    hour = parseInt(hourPart, 10);
    if (timeStr.includes('pm') && hour !== 12) hour += 12;
    if (timeStr.includes('am') && hour === 12) hour = 0;
  } else {
    hour = parseInt(time.split(':')[0], 10);
  }

  // Calculate position on timeline (6am = 0%, 12am = 100%)
  // Map 6am to midnight (18 hour span)
  const startHour = 6;
  const endHour = 24; // midnight
  const adjustedHour = hour < startHour ? hour + 24 : hour; // Handle early morning
  const clampedHour = Math.max(startHour, Math.min(endHour, adjustedHour));
  const position = ((clampedHour - startHour) / (endHour - startHour)) * 100;

  // Format display time
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const isPM = hour >= 12;

  return (
    <div className="mb-3">
      {/* Time display */}
      <div className="text-center mb-2">
        <span className="text-lg font-semibold text-text-primary tabular-nums">{displayHour}</span>
        <span className="text-[10px] text-text-muted ml-0.5 uppercase">{isPM ? 'pm' : 'am'}</span>
      </div>

      {/* Timeline bar */}
      <div className="relative h-5">
        {/* Hour markers - properly spaced */}
        <div className="absolute inset-x-0 top-0 flex justify-between px-0.5">
          <span className="text-[7px] text-text-muted/50 tabular-nums">6AM</span>
          <span className="text-[7px] text-text-muted/50 tabular-nums">12PM</span>
          <span className="text-[7px] text-text-muted/50 tabular-nums">12AM</span>
        </div>

        {/* Track - centered vertically */}
        <div className="absolute inset-x-0 top-[14px] h-[3px] bg-white/[0.08] rounded-full">
          {/* Filled portion up to current time */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500/50 to-cyan-400/70 rounded-full transition-all duration-300"
            style={{ width: `${position}%` }}
          />
        </div>

        {/* Glowing indicator dot - properly centered on track */}
        <div
          className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_2px_rgba(34,211,238,0.6)] border border-[#0a0a0f]"
          style={{
            left: `${position}%`,
            top: '12px',
            transform: 'translateX(-50%)',
          }}
        />
      </div>
    </div>
  );
}

// Map meal type to display style
const MEAL_TYPE_STYLES: Record<MealType, { label: string; color: string; bg: string }> = {
  breakfast: { label: 'Breakfast', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  lunch: { label: 'Lunch', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  dinner: { label: 'Dinner', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  snack: { label: 'Snack', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
};

function getMealTypeStyle(mealType?: MealType): { label: string; color: string; bg: string } {
  if (mealType && MEAL_TYPE_STYLES[mealType]) {
    return MEAL_TYPE_STYLES[mealType];
  }
  return MEAL_TYPE_STYLES.snack; // Default fallback
}

function MealCard({ meal, onClick, targets }: { meal: FoodLog; onClick: () => void; targets: { protein: number; carbs: number; fat: number } }) {
  const protein = Math.round(meal.protein || 0);
  const carbs = Math.round(meal.carbs || 0);
  const fat = Math.round(meal.fat || 0);
  const calories = Math.round(meal.calories || 0);
  const mealTypeStyle = getMealTypeStyle(meal.mealType);

  // Check if any macro exceeds target (for card glow effect)
  const hasOverflow = protein > targets.protein || carbs > targets.carbs || fat > targets.fat;

  return (
    <button
      onClick={onClick}
      className="group relative bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-4 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 text-left overflow-hidden h-full flex flex-col"
    >
      {/* Glassmorphic glow effect - red if overflow */}
      <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl transition-opacity duration-500 ${
        hasOverflow
          ? 'bg-gradient-to-br from-red-500/30 to-orange-500/20 opacity-60'
          : 'bg-gradient-to-br from-cyan-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100'
      }`} />

      {/* Top badges row */}
      <div className="flex items-center justify-between mb-2">
        {/* Meal type tag */}
        <span className={`text-[8px] font-medium px-2 py-0.5 rounded-full border ${mealTypeStyle.bg} ${mealTypeStyle.color} uppercase tracking-wider`}>
          {mealTypeStyle.label}
        </span>

        {/* AI Badge */}
        {meal.isAiAnalyzed && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20">
            <Sparkles size={8} className="text-violet-400" />
            <span className="text-[8px] text-violet-400 font-medium">AI</span>
          </div>
        )}
      </div>

      {/* Time indicator */}
      <TimeIndicator time={meal.time} />

      {/* Food name - graceful caps */}
      <p className="text-[10px] text-text-primary text-center line-clamp-2 mb-2 uppercase tracking-widest font-light">
        {meal.description}
      </p>

      {/* Macro gauges */}
      <MacroGauges protein={protein} carbs={carbs} fat={fat} targets={targets} />

      {/* Calories - bottom */}
      <div className="text-center mt-auto pt-3 border-t border-white/[0.04]">
        <span className="text-2xl font-bold text-emerald-400 tabular-nums">{calories}</span>
        <span className="text-[9px] text-text-muted ml-1">cal</span>
      </div>
    </button>
  );
}

export function Design16_Grid({ meals, onDelete: _onDelete, onEdit, targets }: Design16Props): React.ReactElement {
  // Use provided targets or defaults
  const macroTargets = {
    protein: targets?.protein || DEFAULT_TARGETS.protein,
    carbs: targets?.carbs || DEFAULT_TARGETS.carbs,
    fat: targets?.fat || DEFAULT_TARGETS.fat,
  };

  if (meals.length === 0) {
    return (
      <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-white/[0.06] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/20" />
        </div>
        <p className="text-sm text-text-muted">No meals logged yet</p>
        <p className="text-[10px] text-text-muted/60 mt-1">Add your first meal to see the grid</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {meals.map((meal) => (
        <MealCard key={meal.id} meal={meal} onClick={() => onEdit(meal)} targets={macroTargets} />
      ))}
    </div>
  );
}
