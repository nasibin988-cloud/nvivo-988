/**
 * Nutrition Tab - Complete Rewrite
 * Features: AI photo analysis, USDA search, animated rings, glassmorphic cards,
 * meal timeline, enhanced water tracker, Firestore persistence
 */

import { useState, useCallback, useMemo } from 'react';
import {
  Apple,
  Camera,
  Plus,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Droplets,
  Leaf,
  Flame,
  Beef,
  Wheat,
  Sparkles,
  X,
  ChevronDown,
  Clock,
  Trash2,
  TrendingUp,
  Calendar,
  Check,
  Search,
  Loader2,
  UtensilsCrossed,
  Zap,
  Target,
} from 'lucide-react';
import { useFoodLogs, useWaterIntake, useFoodLogsHistory, type FoodLog, type MealType } from '../../../hooks/nutrition';
import { useNutritionTargets, type NutritionTargets } from '../../../hooks/nutrition';
import { FoodSearchModal, PhotoAnalysisModal } from '../../journal/food/components';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

type ViewMode = 'today' | 'history';
type TimeRange = '1W' | '1M' | '3M';

const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
};

const mealConfig: Record<MealType, { label: string; icon: typeof Coffee; gradient: string; time: string; bgGlow: string }> = {
  breakfast: {
    label: 'Breakfast',
    icon: Coffee,
    gradient: 'from-amber-500 to-orange-500',
    time: '6-10 AM',
    bgGlow: 'bg-amber-500/20',
  },
  lunch: {
    label: 'Lunch',
    icon: Sun,
    gradient: 'from-blue-500 to-cyan-500',
    time: '11 AM-2 PM',
    bgGlow: 'bg-blue-500/20',
  },
  snack: {
    label: 'Snack',
    icon: Cookie,
    gradient: 'from-emerald-500 to-teal-500',
    time: '2-5 PM',
    bgGlow: 'bg-emerald-500/20',
  },
  dinner: {
    label: 'Dinner',
    icon: Moon,
    gradient: 'from-purple-500 to-pink-500',
    time: '5-9 PM',
    bgGlow: 'bg-purple-500/20',
  },
};

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

function NutritionSkeleton() {
  return (
    <div className="space-y-4 pb-4 animate-pulse">
      {/* View Toggle Skeleton */}
      <div className="h-12 bg-surface-2 rounded-xl" />

      {/* Hero Card Skeleton */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-surface-2 rounded" />
            <div className="h-3 w-24 bg-surface-2 rounded" />
          </div>
          <div className="h-10 w-24 bg-surface-2 rounded" />
        </div>
        <div className="h-3 bg-surface-2 rounded-full" />
        <div className="flex justify-between">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-surface-2 rounded-full" />
              <div className="h-3 w-8 bg-surface-2 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Water Tracker Skeleton */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex justify-between mb-3">
          <div className="h-4 w-24 bg-surface-2 rounded" />
          <div className="h-4 w-16 bg-surface-2 rounded" />
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex-1 h-8 bg-surface-2 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Buttons Skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <div className="h-14 bg-surface-2 rounded-2xl" />
        <div className="h-14 bg-surface-2 rounded-2xl" />
      </div>

      {/* Meals Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-24 bg-surface-2 rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-surface-2 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ANIMATED MACRO RING
// ============================================================================

function AnimatedMacroRing({
  label,
  current,
  target,
  unit,
  color,
  glowColor,
  icon,
  delay = 0,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  glowColor: string;
  icon: React.ReactNode;
  delay?: number;
}) {
  const percentage = Math.min((current / target) * 100, 100);
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isNearGoal = percentage >= 90;
  const isOverGoal = percentage >= 100;

  return (
    <div className="flex flex-col items-center group">
      <div className="relative w-16 h-16">
        {/* Glow effect when near goal */}
        {isNearGoal && (
          <div
            className={`absolute inset-0 rounded-full ${glowColor} blur-lg opacity-50 animate-pulse`}
            style={{ animationDelay: `${delay}ms` }}
          />
        )}

        <svg className="w-16 h-16 -rotate-90 relative">
          {/* Background circle */}
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-white/[0.06]"
          />
          {/* Progress circle with animation */}
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: `stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
              filter: isNearGoal ? `drop-shadow(0 0 6px ${color})` : undefined,
            }}
            className={isOverGoal ? 'animate-pulse' : ''}
          />
        </svg>

        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {icon}
        </div>
      </div>

      <span className="text-xs font-bold text-text-primary mt-1.5 group-hover:scale-105 transition-transform">
        {current}{unit}
      </span>
      <span className="text-[10px] text-text-muted">{label}</span>
    </div>
  );
}

// ============================================================================
// MEAL CARD WITH TIMELINE
// ============================================================================

function MealCard({
  meal,
  onDelete,
  isFirst,
  isLast,
  previousMealTime,
}: {
  meal: FoodLog;
  onDelete: (id: string) => void;
  isFirst?: boolean;
  isLast?: boolean;
  previousMealTime?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = mealConfig[meal.mealType];
  const Icon = config.icon;

  // Calculate time since last meal
  const getTimeSinceLast = () => {
    if (!previousMealTime || isFirst) return null;

    const parseTime = (timeStr: string) => {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return 0;
      let hours = parseInt(match[1]);
      const mins = parseInt(match[2]);
      const period = match[3].toUpperCase();
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + mins;
    };

    const current = parseTime(meal.time);
    const previous = parseTime(previousMealTime);
    const diff = current - previous;

    if (diff <= 0 || diff > 600) return null;

    const hours = Math.floor(diff / 60);
    const mins = diff % 60;

    if (hours > 0) return `${hours}h ${mins}m since last meal`;
    return `${mins}m since last meal`;
  };

  const timeSinceLast = getTimeSinceLast();

  return (
    <div className="relative">
      {/* Timeline connector */}
      {!isFirst && (
        <div className="absolute left-6 -top-3 w-px h-3 bg-gradient-to-b from-transparent to-border" />
      )}
      {!isLast && (
        <div className="absolute left-6 -bottom-3 w-px h-3 bg-gradient-to-b from-border to-transparent" />
      )}

      {/* Time gap indicator */}
      {timeSinceLast && (
        <div className="flex items-center justify-center mb-2">
          <span className="text-[9px] text-text-muted bg-surface-2 px-2 py-0.5 rounded-full">
            {timeSinceLast}
          </span>
        </div>
      )}

      {/* Card */}
      <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] overflow-hidden hover:border-white/[0.1] transition-colors">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-start gap-3 text-left"
        >
          {/* Meal type icon with glow */}
          <div className="relative">
            <div className={`absolute inset-0 ${config.bgGlow} rounded-xl blur-md opacity-50`} />
            <div className={`relative p-2.5 rounded-xl bg-gradient-to-br ${config.gradient} text-white`}>
              <Icon size={18} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-semibold text-text-primary">{config.label}</span>
              {meal.isAiAnalyzed && <AIBadge confidence={meal.aiConfidence} />}
            </div>
            <p className="text-sm text-text-secondary line-clamp-1">{meal.description}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[10px] text-text-muted flex items-center gap-1">
                <Clock size={10} />
                {meal.time}
              </span>
              {meal.calories && (
                <span className="text-[10px] font-bold text-amber-400">{meal.calories} cal</span>
              )}
            </div>
          </div>

          <ChevronDown
            size={16}
            className={`text-text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Expanded content */}
        <div
          className={`grid transition-all duration-300 ${
            isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="px-4 pb-4 pt-0 border-t border-white/[0.06]">
              <div className="pt-3 grid grid-cols-4 gap-2">
                {[
                  { value: meal.protein, label: 'Protein', color: 'text-rose-400' },
                  { value: meal.carbs, label: 'Carbs', color: 'text-amber-400' },
                  { value: meal.fat, label: 'Fat', color: 'text-blue-400' },
                  { value: meal.fiber, label: 'Fiber', color: 'text-emerald-400' },
                ].map(({ value, label, color }) => (
                  value !== null && (
                    <div key={label} className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                      <span className={`text-xs font-bold ${color}`}>{value}g</span>
                      <span className="text-[9px] text-text-muted block">{label}</span>
                    </div>
                  )
                ))}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(meal.id);
                }}
                className="mt-3 w-full py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-rose-500/20 transition-colors"
              >
                <Trash2 size={12} />
                Remove Meal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// AI BADGE WITH SHIMMER
// ============================================================================

function AIBadge({ confidence }: { confidence?: number }) {
  return (
    <span className="relative overflow-hidden px-1.5 py-0.5 rounded bg-violet-500/15 border border-violet-500/30 text-violet-400 text-[9px] font-bold flex items-center gap-0.5">
      {/* Shimmer effect */}
      <span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{
          animation: 'shimmer 2s infinite',
        }}
      />
      <Sparkles size={8} className="relative" />
      <span className="relative">AI</span>
      {confidence && (
        <span className="relative text-violet-300 ml-0.5">{Math.round(confidence * 100)}%</span>
      )}

      {/* Keyframe animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </span>
  );
}

// ============================================================================
// WATER TRACKER WITH ANIMATIONS
// ============================================================================

function WaterTracker({
  current,
  target,
  onUpdate,
  isUpdating,
}: {
  current: number;
  target: number;
  onUpdate: (glasses: number) => void;
  isUpdating: boolean;
}) {
  const [rippleIndex, setRippleIndex] = useState<number | null>(null);

  const handleTap = (index: number) => {
    const newGlasses = index + 1;
    setRippleIndex(index);
    onUpdate(newGlasses);
    setTimeout(() => setRippleIndex(null), 500);
  };

  const isComplete = current >= target;

  return (
    <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-4 relative overflow-hidden">
      {/* Celebration effect when complete */}
      {isComplete && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/10 to-blue-500/5 animate-pulse" />
      )}

      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isComplete ? 'bg-cyan-500/20' : 'bg-blue-500/15'} transition-colors`}>
            <Droplets size={16} className={isComplete ? 'text-cyan-400' : 'text-blue-400'} />
          </div>
          <span className="text-sm font-semibold text-text-primary">Water Intake</span>
        </div>
        <div className="flex items-center gap-2">
          {isUpdating && <Loader2 size={12} className="text-blue-400 animate-spin" />}
          <span className={`text-sm font-bold ${isComplete ? 'text-cyan-400' : 'text-blue-400'}`}>
            {current}/{target} glasses
          </span>
          {isComplete && <Check size={14} className="text-cyan-400" />}
        </div>
      </div>

      <div className="flex gap-1.5">
        {Array.from({ length: target }).map((_, i) => {
          const isFilled = i < current;
          const isRippling = rippleIndex === i;

          return (
            <button
              key={i}
              onClick={() => handleTap(i)}
              className={`relative flex-1 h-10 rounded-lg overflow-hidden transition-all duration-300 ${
                isFilled
                  ? 'bg-gradient-to-t from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
            >
              {/* Wave animation for filled glasses */}
              {isFilled && (
                <div className="absolute inset-0">
                  <div
                    className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-blue-600/50 to-transparent"
                    style={{
                      animation: 'wave 2s ease-in-out infinite',
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                </div>
              )}

              {/* Ripple effect on tap */}
              {isRippling && (
                <span
                  className="absolute inset-0 bg-white/30 animate-ping"
                  style={{ animationDuration: '0.5s' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Wave animation keyframes */}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function EmptyState({ onAddMeal }: { onAddMeal: () => void }) {
  return (
    <div className="text-center py-12 bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/[0.06]">
      {/* Floating icon */}
      <div
        className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-4"
        style={{ animation: 'float 3s ease-in-out infinite' }}
      >
        <UtensilsCrossed size={36} className="text-emerald-400" />
      </div>

      <h3 className="text-lg font-bold text-text-primary mb-1">No meals logged yet</h3>
      <p className="text-sm text-text-secondary mb-6 max-w-xs mx-auto">
        Start tracking your nutrition to see insights about your eating habits
      </p>

      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onAddMeal}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus size={16} />
          Log Your First Meal
        </button>
        <span className="text-xs text-text-muted">or take a photo for AI analysis</span>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// WEEKLY CHART (IMPROVED)
// ============================================================================

function WeeklyChart({
  data,
  target,
}: {
  data: { day: string; date: string; calories: number }[];
  target: number;
}) {
  const maxCalories = Math.max(...data.map(d => d.calories), target);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <TrendingUp size={14} className="text-emerald-400" />
          Weekly Calories
        </h3>
        <span className="text-xs text-emerald-400 font-medium">This Week</span>
      </div>

      <div className="relative">
        {/* Target line */}
        <div
          className="absolute left-0 right-0 border-t border-dashed border-white/20"
          style={{ bottom: `${(target / maxCalories) * 100}%` }}
        >
          <span className="absolute -top-2 right-0 text-[8px] text-text-muted bg-surface px-1">
            {target}
          </span>
        </div>

        {/* Bars */}
        <div className="flex items-end justify-between gap-2 h-36">
          {data.map((day, i) => {
            const percentage = (day.calories / maxCalories) * 100;
            const isToday = day.date === today;
            const isOverTarget = day.calories > target;

            return (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[9px] text-text-muted font-medium">{day.calories || '-'}</span>
                <div className="w-full h-28 bg-white/[0.04] rounded-lg relative overflow-hidden">
                  {/* Area gradient fill */}
                  <div
                    className={`absolute bottom-0 w-full rounded-lg transition-all duration-700 ${
                      isOverTarget
                        ? 'bg-gradient-to-t from-amber-500 to-orange-400'
                        : isToday
                        ? 'bg-gradient-to-t from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-t from-emerald-500/60 to-emerald-400/40'
                    }`}
                    style={{
                      height: day.calories > 0 ? `${percentage}%` : '0%',
                      transitionDelay: `${i * 50}ms`,
                    }}
                  />

                  {/* Glow for today */}
                  {isToday && day.calories > 0 && (
                    <div
                      className="absolute bottom-0 w-full bg-emerald-400/30 blur-md"
                      style={{ height: `${percentage}%` }}
                    />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isToday ? 'text-emerald-400' : 'text-text-muted'}`}>
                  {day.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-text-muted">Under Target</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-[10px] text-text-muted">Over Target</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LOG MEAL MODAL
// ============================================================================

function LogMealModal({
  onClose,
  onSave,
  isSaving,
}: {
  onClose: () => void;
  onSave: (meal: Omit<FoodLog, 'id' | 'createdAt' | 'updatedAt'>) => void;
  isSaving: boolean;
}) {
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSave = () => {
    if (!description.trim()) return;
    onSave({
      mealType,
      description: description.trim(),
      date: today,
      calories: calories ? parseInt(calories) : null,
      protein: protein ? parseInt(protein) : null,
      carbs: carbs ? parseInt(carbs) : null,
      fat: fat ? parseInt(fat) : null,
      fiber: null,
      sodium: null,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface rounded-2xl border border-white/[0.08] overflow-hidden max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-border flex justify-between items-center shrink-0 bg-white/[0.02]">
          <h2 className="text-lg font-bold text-text-primary">Log Meal</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface-2 border border-border text-text-muted hover:text-text-primary transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Meal Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Meal Type</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(mealConfig) as MealType[]).map((type) => {
                const config = mealConfig[type];
                const IconComponent = config.icon;
                const isSelected = mealType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setMealType(type)}
                    className={`p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? `bg-gradient-to-br ${config.gradient} text-white shadow-lg`
                        : 'bg-white/[0.03] border border-white/[0.06] text-text-muted hover:bg-white/[0.06]'
                    }`}
                  >
                    <IconComponent size={18} />
                    <span className="text-[10px] font-medium">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">What did you eat?</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Grilled chicken with vegetables and rice"
              className="w-full h-20 px-4 py-3 rounded-xl text-sm bg-white/[0.03] border border-white/[0.06] text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          {/* Macros */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Nutrition (optional)</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: calories, setter: setCalories, placeholder: 'Calories', unit: 'cal', color: 'amber' },
                { value: protein, setter: setProtein, placeholder: 'Protein', unit: 'g', color: 'rose' },
                { value: carbs, setter: setCarbs, placeholder: 'Carbs', unit: 'g', color: 'amber' },
                { value: fat, setter: setFat, placeholder: 'Fat', unit: 'g', color: 'blue' },
              ].map(({ value, setter, placeholder, unit, color }) => (
                <div key={placeholder} className="relative">
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full px-4 py-3 pr-12 rounded-xl text-sm bg-white/[0.03] border border-white/[0.06] text-text-primary placeholder-text-muted focus:outline-none focus:border-${color}-500/50 transition-colors`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">{unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border shrink-0 bg-white/[0.02]">
          <button
            onClick={handleSave}
            disabled={!description.trim() || isSaving}
            className="w-full py-3.5 rounded-2xl font-bold text-base bg-gradient-to-r from-emerald-500 to-teal-500 text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              'Save Meal'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NutritionTab() {
  const [view, setView] = useState<ViewMode>('today');
  const [timeRange, setTimeRange] = useState<TimeRange>('1W');
  const [showLogModal, setShowLogModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Data hooks
  const { logs, isLoading, dailyTotals, addLog, deleteLog, isAdding, isDeleting } = useFoodLogs(today);
  const { data: targets, isLoading: targetsLoading } = useNutritionTargets();
  const { glasses: waterGlasses, updateWater, isUpdating: isUpdatingWater } = useWaterIntake(today);
  const { data: historyData } = useFoodLogsHistory(TIME_RANGE_DAYS[timeRange]);

  // Use targets or defaults
  const nutritionTargets: NutritionTargets = targets || {
    calories: 2000,
    protein: 50,
    carbs: 250,
    fat: 65,
    fiber: 28,
    sodium: 2300,
    water: 8,
  };

  // Calculate calorie percentage
  const caloriePercentage = Math.round((dailyTotals.calories / nutritionTargets.calories) * 100);

  // Prepare weekly chart data
  const weeklyChartData = useMemo(() => {
    if (!historyData) return [];

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return historyData.slice(-7).map((d) => ({
      day: days[new Date(d.date).getDay()],
      date: d.date,
      calories: d.totals.calories,
    }));
  }, [historyData]);

  // Handle save from log modal
  const handleSaveMeal = async (meal: Omit<FoodLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    await addLog(meal);
    setShowLogModal(false);
  };

  // Handle food search selection
  const handleFoodSelected = async (food: { name: string; nutrition: { calories: number; protein: number; carbohydrates: number; fat: number; fiber?: number } }) => {
    const meal: Omit<FoodLog, 'id' | 'createdAt' | 'updatedAt'> = {
      mealType: 'snack',
      description: food.name,
      date: today,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      calories: food.nutrition.calories,
      protein: food.nutrition.protein,
      carbs: food.nutrition.carbohydrates,
      fat: food.nutrition.fat,
      fiber: food.nutrition.fiber || null,
      sodium: null,
    };
    await addLog(meal);
    setShowSearchModal(false);
  };

  // Handle photo analysis result
  const handlePhotoAnalysis = async (result: { items: { name: string; calories: number; protein: number; carbs: number; fat: number; fiber?: number }[]; mealType: string; totalCalories: number; totalProtein: number; totalCarbs: number; totalFat: number }) => {
    const description = result.items.map(i => i.name).join(', ');
    const meal: Omit<FoodLog, 'id' | 'createdAt' | 'updatedAt'> = {
      mealType: (result.mealType as MealType) || 'snack',
      description,
      date: today,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      calories: result.totalCalories,
      protein: result.totalProtein,
      carbs: result.totalCarbs,
      fat: result.totalFat,
      fiber: null,
      sodium: null,
      isAiAnalyzed: true,
      aiConfidence: 0.85,
    };
    await addLog(meal);
    setShowPhotoModal(false);
  };

  // Loading state
  if (isLoading || targetsLoading) {
    return <NutritionSkeleton />;
  }

  return (
    <div className="space-y-4 pb-4">
      {/* View Toggle */}
      <div className="flex bg-white/[0.03] backdrop-blur-sm rounded-xl p-1 border border-white/[0.06]">
        <button
          onClick={() => setView('today')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            view === 'today'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setView('history')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            view === 'history'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          History
        </button>
      </div>

      {view === 'today' ? (
        <>
          {/* Calorie Hero Card - Glassmorphic */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-5 relative overflow-hidden">
            {/* Gradient glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">Today's Nutrition</h3>
                  <p className="text-xs text-text-muted">Track your daily intake</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-emerald-400">{dailyTotals.calories}</span>
                  <span className="text-sm text-text-muted"> / {nutritionTargets.calories} cal</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden mb-4 relative">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-out relative"
                  style={{ width: `${Math.min(caloriePercentage, 100)}%` }}
                >
                  {/* Animated shine */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </div>
              </div>

              {/* Macro Rings */}
              <div className="flex justify-between">
                <AnimatedMacroRing
                  label="Protein"
                  current={dailyTotals.protein}
                  target={nutritionTargets.protein}
                  unit="g"
                  color="#f43f5e"
                  glowColor="bg-rose-500"
                  icon={<Beef size={14} className="text-rose-400" />}
                  delay={0}
                />
                <AnimatedMacroRing
                  label="Carbs"
                  current={dailyTotals.carbs}
                  target={nutritionTargets.carbs}
                  unit="g"
                  color="#f59e0b"
                  glowColor="bg-amber-500"
                  icon={<Wheat size={14} className="text-amber-400" />}
                  delay={100}
                />
                <AnimatedMacroRing
                  label="Fat"
                  current={dailyTotals.fat}
                  target={nutritionTargets.fat}
                  unit="g"
                  color="#3b82f6"
                  glowColor="bg-blue-500"
                  icon={<Droplets size={14} className="text-blue-400" />}
                  delay={200}
                />
                <AnimatedMacroRing
                  label="Fiber"
                  current={dailyTotals.fiber}
                  target={nutritionTargets.fiber}
                  unit="g"
                  color="#10b981"
                  glowColor="bg-emerald-500"
                  icon={<Leaf size={14} className="text-emerald-400" />}
                  delay={300}
                />
              </div>
            </div>
          </div>

          {/* Water Tracker */}
          <WaterTracker
            current={waterGlasses}
            target={nutritionTargets.water}
            onUpdate={updateWater}
            isUpdating={isUpdatingWater}
          />

          {/* Quick Add Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setShowLogModal(true)}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-text-primary hover:bg-white/[0.06] transition-all"
            >
              <Plus size={18} className="text-emerald-400" />
              <span className="text-sm font-semibold">Log</span>
            </button>
            <button
              onClick={() => setShowSearchModal(true)}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-text-primary hover:bg-white/[0.06] transition-all"
            >
              <Search size={18} className="text-blue-400" />
              <span className="text-sm font-semibold">Search</span>
            </button>
            <button
              onClick={() => setShowPhotoModal(true)}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-400 hover:from-violet-500/30 hover:to-purple-500/30 transition-all"
            >
              <Camera size={18} />
              <span className="text-sm font-semibold">Photo AI</span>
            </button>
          </div>

          {/* Meals List with Timeline */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Apple size={14} className="text-emerald-400" />
              Today's Meals
            </h4>

            {logs.length === 0 ? (
              <EmptyState onAddMeal={() => setShowLogModal(true)} />
            ) : (
              <div className="space-y-3">
                {logs.map((meal, index) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onDelete={deleteLog}
                    isFirst={index === 0}
                    isLast={index === logs.length - 1}
                    previousMealTime={index > 0 ? logs[index - 1].time : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {(['1W', '1M', '3M'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/[0.03] text-text-muted border border-white/[0.06] hover:bg-white/[0.06]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Weekly Chart */}
          <WeeklyChart data={weeklyChartData} target={nutritionTargets.calories} />

          {/* Weekly Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: Flame,
                color: 'text-amber-400',
                bg: 'bg-amber-500/15',
                value: historyData?.reduce((sum, d) => sum + d.totals.calories, 0) || 0,
                label: 'Total Calories'
              },
              {
                icon: Target,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/15',
                value: historyData?.filter(d => d.totals.calories > 0 && d.totals.calories <= nutritionTargets.calories).length || 0,
                label: 'Days on Target'
              },
              {
                icon: Calendar,
                color: 'text-blue-400',
                bg: 'bg-blue-500/15',
                value: historyData?.filter(d => d.meals.length > 0).length || 0,
                label: 'Days Logged'
              },
            ].map(({ icon: IconComponent, color, bg, value, label }) => (
              <div key={label} className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-4 text-center">
                <div className={`w-10 h-10 mx-auto rounded-full ${bg} flex items-center justify-center mb-2`}>
                  <IconComponent size={20} className={color} />
                </div>
                <span className="text-lg font-bold text-text-primary block">{value.toLocaleString()}</span>
                <span className="text-[10px] text-text-muted">{label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      {showLogModal && (
        <LogMealModal
          onClose={() => setShowLogModal(false)}
          onSave={handleSaveMeal}
          isSaving={isAdding}
        />
      )}

      {showSearchModal && (
        <FoodSearchModal
          onClose={() => setShowSearchModal(false)}
          onSelect={handleFoodSelected}
        />
      )}

      {showPhotoModal && (
        <PhotoAnalysisModal
          onClose={() => setShowPhotoModal(false)}
          onConfirm={handlePhotoAnalysis}
        />
      )}
    </div>
  );
}
