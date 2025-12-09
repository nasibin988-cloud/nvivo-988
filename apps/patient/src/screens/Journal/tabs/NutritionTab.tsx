/**
 * Nutrition Tab
 * Food logging with AI photo analysis, macro tracking, and meal history
 */

import { useState } from 'react';
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
} from 'lucide-react';

// Types
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
type ViewMode = 'today' | 'history';

interface MealLog {
  id: string;
  mealType: MealType;
  description: string;
  time: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  photoUrl?: string;
  isAiAnalyzed?: boolean;
}

interface DailyNutrition {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
  fiber: { current: number; target: number };
  water: { current: number; target: number };
}

// Mock data
const mockMeals: MealLog[] = [
  {
    id: '1',
    mealType: 'breakfast',
    description: 'Greek yogurt with berries and granola',
    time: '7:30 AM',
    calories: 320,
    protein: 18,
    carbs: 42,
    fat: 8,
    fiber: 5,
    isAiAnalyzed: true,
  },
  {
    id: '2',
    mealType: 'lunch',
    description: 'Grilled chicken salad with quinoa',
    time: '12:15 PM',
    calories: 480,
    protein: 35,
    carbs: 38,
    fat: 18,
    fiber: 8,
  },
  {
    id: '3',
    mealType: 'snack',
    description: 'Apple with almond butter',
    time: '3:30 PM',
    calories: 220,
    protein: 6,
    carbs: 28,
    fat: 12,
    fiber: 4,
  },
];

const mockNutrition: DailyNutrition = {
  calories: { current: 1020, target: 2000 },
  protein: { current: 59, target: 120 },
  carbs: { current: 108, target: 250 },
  fat: { current: 38, target: 65 },
  fiber: { current: 17, target: 30 },
  water: { current: 5, target: 8 },
};

const mockWeeklyData = [
  { day: 'Mon', calories: 1850, target: 2000 },
  { day: 'Tue', calories: 2100, target: 2000 },
  { day: 'Wed', calories: 1920, target: 2000 },
  { day: 'Thu', calories: 1780, target: 2000 },
  { day: 'Fri', calories: 2050, target: 2000 },
  { day: 'Sat', calories: 2200, target: 2000 },
  { day: 'Sun', calories: 1020, target: 2000 },
];

const mealConfig: Record<MealType, { label: string; icon: typeof Coffee; gradient: string; time: string }> = {
  breakfast: { label: 'Breakfast', icon: Coffee, gradient: 'from-amber-500 to-orange-500', time: '6-10 AM' },
  lunch: { label: 'Lunch', icon: Sun, gradient: 'from-blue-500 to-cyan-500', time: '11 AM-2 PM' },
  snack: { label: 'Snack', icon: Cookie, gradient: 'from-emerald-500 to-teal-500', time: '2-5 PM' },
  dinner: { label: 'Dinner', icon: Moon, gradient: 'from-purple-500 to-pink-500', time: '5-9 PM' },
};

// Macro Ring Component
function MacroRing({
  label,
  current,
  target,
  unit,
  color,
  icon,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  icon: React.ReactNode;
}) {
  const percentage = Math.min((current / target) * 100, 100);
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-surface-2"
          />
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
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <span className="text-xs font-bold text-text-primary mt-1">{current}{unit}</span>
      <span className="text-[10px] text-text-muted">{label}</span>
    </div>
  );
}

// Meal Card Component
function MealCard({
  meal,
  onDelete,
}: {
  meal: MealLog;
  onDelete: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = mealConfig[meal.mealType];
  const Icon = config.icon;

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-start gap-3 text-left"
      >
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${config.gradient} text-white shrink-0`}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-text-primary">{config.label}</span>
            {meal.isAiAnalyzed && (
              <span className="px-1.5 py-0.5 rounded bg-violet-500/15 border border-violet-500/30 text-violet-400 text-[9px] font-bold flex items-center gap-0.5">
                <Sparkles size={8} />
                AI
              </span>
            )}
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
          className={`text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border mt-0">
          <div className="pt-3 grid grid-cols-4 gap-2">
            {meal.protein !== null && (
              <div className="text-center p-2 rounded-lg bg-surface-2">
                <span className="text-xs font-bold text-rose-400">{meal.protein}g</span>
                <span className="text-[9px] text-text-muted block">Protein</span>
              </div>
            )}
            {meal.carbs !== null && (
              <div className="text-center p-2 rounded-lg bg-surface-2">
                <span className="text-xs font-bold text-amber-400">{meal.carbs}g</span>
                <span className="text-[9px] text-text-muted block">Carbs</span>
              </div>
            )}
            {meal.fat !== null && (
              <div className="text-center p-2 rounded-lg bg-surface-2">
                <span className="text-xs font-bold text-blue-400">{meal.fat}g</span>
                <span className="text-[9px] text-text-muted block">Fat</span>
              </div>
            )}
            {meal.fiber !== null && (
              <div className="text-center p-2 rounded-lg bg-surface-2">
                <span className="text-xs font-bold text-emerald-400">{meal.fiber}g</span>
                <span className="text-[9px] text-text-muted block">Fiber</span>
              </div>
            )}
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
      )}
    </div>
  );
}

// Log Meal Modal
function LogMealModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (meal: Partial<MealLog>) => void;
}) {
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const handleSave = () => {
    if (!description.trim()) return;
    onSave({
      mealType,
      description: description.trim(),
      calories: calories ? parseInt(calories) : null,
      protein: protein ? parseInt(protein) : null,
      carbs: carbs ? parseInt(carbs) : null,
      fat: fat ? parseInt(fat) : null,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface rounded-2xl border border-white/[0.08] overflow-hidden max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-border flex justify-between items-center shrink-0">
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
                const Icon = config.icon;
                const isSelected = mealType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setMealType(type)}
                    className={`p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? `bg-gradient-to-br ${config.gradient} text-white`
                        : 'bg-surface-2 border border-border text-text-muted hover:bg-surface'
                    }`}
                  >
                    <Icon size={18} />
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
              className="w-full h-20 px-4 py-3 rounded-xl text-sm bg-surface-2 border border-border text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Macros */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Nutrition (optional)</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="Calories"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm bg-surface-2 border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-amber-500/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">cal</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="Protein"
                  className="w-full px-4 py-3 pr-8 rounded-xl text-sm bg-surface-2 border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-rose-500/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">g</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  placeholder="Carbs"
                  className="w-full px-4 py-3 pr-8 rounded-xl text-sm bg-surface-2 border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-amber-500/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">g</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  placeholder="Fat"
                  className="w-full px-4 py-3 pr-8 rounded-xl text-sm bg-surface-2 border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-blue-500/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border shrink-0">
          <button
            onClick={handleSave}
            disabled={!description.trim()}
            className="w-full py-3.5 rounded-2xl font-bold text-base bg-gradient-to-r from-emerald-500 to-teal-500 text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
          >
            Save Meal
          </button>
        </div>
      </div>
    </div>
  );
}

// Water Tracker
function WaterTracker({ current, target }: { current: number; target: number }) {
  const [glasses, setGlasses] = useState(current);

  return (
    <div className="bg-surface rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400">
            <Droplets size={16} />
          </div>
          <span className="text-sm font-semibold text-text-primary">Water Intake</span>
        </div>
        <span className="text-sm font-bold text-blue-400">{glasses}/{target} glasses</span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: target }).map((_, i) => (
          <button
            key={i}
            onClick={() => setGlasses(i + 1)}
            className={`flex-1 h-8 rounded-lg transition-all ${
              i < glasses
                ? 'bg-gradient-to-t from-blue-500 to-cyan-400'
                : 'bg-surface-2 hover:bg-surface'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Main Nutrition Tab
export default function NutritionTab() {
  const [view, setView] = useState<ViewMode>('today');
  const [meals, setMeals] = useState<MealLog[]>(mockMeals);
  const [showLogModal, setShowLogModal] = useState(false);
  const [nutrition] = useState<DailyNutrition>(mockNutrition);

  const handleDeleteMeal = (id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  const handleSaveMeal = (meal: Partial<MealLog>) => {
    const newMeal: MealLog = {
      id: Date.now().toString(),
      mealType: meal.mealType || 'snack',
      description: meal.description || '',
      time: meal.time || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      calories: meal.calories ?? null,
      protein: meal.protein ?? null,
      carbs: meal.carbs ?? null,
      fat: meal.fat ?? null,
      fiber: null,
    };
    setMeals(prev => [...prev, newMeal]);
  };

  const caloriePercentage = Math.round((nutrition.calories.current / nutrition.calories.target) * 100);

  return (
    <div className="space-y-4 pb-4">
      {/* View Toggle */}
      <div className="flex bg-surface-2 rounded-xl p-1">
        <button
          onClick={() => setView('today')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            view === 'today'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setView('history')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            view === 'history'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          History
        </button>
      </div>

      {view === 'today' ? (
        <>
          {/* Calorie Hero Card */}
          <div className="bg-surface rounded-2xl border border-border p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">Today&apos;s Nutrition</h3>
                  <p className="text-xs text-text-muted">Track your daily intake</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-emerald-400">{nutrition.calories.current}</span>
                  <span className="text-sm text-text-muted"> / {nutrition.calories.target} cal</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-3 bg-surface-2 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                  style={{ width: `${Math.min(caloriePercentage, 100)}%` }}
                />
              </div>

              {/* Macro Rings */}
              <div className="flex justify-between">
                <MacroRing
                  label="Protein"
                  current={nutrition.protein.current}
                  target={nutrition.protein.target}
                  unit="g"
                  color="#f43f5e"
                  icon={<Beef size={14} className="text-rose-400" />}
                />
                <MacroRing
                  label="Carbs"
                  current={nutrition.carbs.current}
                  target={nutrition.carbs.target}
                  unit="g"
                  color="#f59e0b"
                  icon={<Wheat size={14} className="text-amber-400" />}
                />
                <MacroRing
                  label="Fat"
                  current={nutrition.fat.current}
                  target={nutrition.fat.target}
                  unit="g"
                  color="#3b82f6"
                  icon={<Droplets size={14} className="text-blue-400" />}
                />
                <MacroRing
                  label="Fiber"
                  current={nutrition.fiber.current}
                  target={nutrition.fiber.target}
                  unit="g"
                  color="#10b981"
                  icon={<Leaf size={14} className="text-emerald-400" />}
                />
              </div>
            </div>
          </div>

          {/* Water Tracker */}
          <WaterTracker current={nutrition.water.current} target={nutrition.water.target} />

          {/* Quick Add Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowLogModal(true)}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-surface border border-border text-text-primary hover:bg-surface-2 transition-all"
            >
              <Plus size={18} className="text-emerald-400" />
              <span className="text-sm font-semibold">Log Meal</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-400 hover:from-violet-500/30 hover:to-purple-500/30 transition-all">
              <Camera size={18} />
              <span className="text-sm font-semibold">Photo AI</span>
            </button>
          </div>

          {/* Meals List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Apple size={14} className="text-emerald-400" />
              Today&apos;s Meals
            </h4>
            {meals.length === 0 ? (
              <div className="text-center py-10 bg-surface rounded-2xl border border-border">
                <Apple size={40} className="mx-auto text-text-muted mb-3" />
                <p className="text-sm text-text-muted">No meals logged yet</p>
                <p className="text-xs text-text-muted">Tap &quot;Log Meal&quot; to get started</p>
              </div>
            ) : (
              meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} onDelete={handleDeleteMeal} />
              ))
            )}
          </div>
        </>
      ) : (
        <>
          {/* Weekly Chart */}
          <div className="bg-surface rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <TrendingUp size={14} className="text-emerald-400" />
                Weekly Calories
              </h3>
              <span className="text-xs text-emerald-400 font-medium">This Week</span>
            </div>
            <div className="flex items-end justify-between gap-2 h-32">
              {mockWeeklyData.map((day, i) => {
                const percentage = (day.calories / day.target) * 100;
                const isToday = i === mockWeeklyData.length - 1;
                const isOverTarget = percentage > 100;
                return (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-text-muted">{day.calories}</span>
                    <div className="w-full h-24 bg-surface-2 rounded-lg relative overflow-hidden">
                      <div
                        className={`absolute bottom-0 w-full rounded-lg transition-all ${
                          isOverTarget
                            ? 'bg-gradient-to-t from-amber-500 to-orange-400'
                            : isToday
                              ? 'bg-gradient-to-t from-emerald-500 to-teal-400'
                              : 'bg-emerald-500/50'
                        }`}
                        style={{ height: `${Math.min(percentage, 100)}%` }}
                      />
                      {/* Target line */}
                      <div className="absolute w-full h-px bg-white/20 bottom-[100%] left-0" />
                    </div>
                    <span className={`text-[10px] font-medium ${isToday ? 'text-emerald-400' : 'text-text-muted'}`}>
                      {day.day}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border">
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

          {/* Weekly Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface rounded-xl border border-border p-4 text-center">
              <Flame size={20} className="mx-auto text-amber-400 mb-1" />
              <span className="text-lg font-bold text-text-primary">13,920</span>
              <span className="text-[10px] text-text-muted block">Total Calories</span>
            </div>
            <div className="bg-surface rounded-xl border border-border p-4 text-center">
              <Check size={20} className="mx-auto text-emerald-400 mb-1" />
              <span className="text-lg font-bold text-text-primary">5</span>
              <span className="text-[10px] text-text-muted block">Days on Target</span>
            </div>
            <div className="bg-surface rounded-xl border border-border p-4 text-center">
              <Calendar size={20} className="mx-auto text-blue-400 mb-1" />
              <span className="text-lg font-bold text-text-primary">7</span>
              <span className="text-[10px] text-text-muted block">Days Logged</span>
            </div>
          </div>
        </>
      )}

      {/* Log Modal */}
      {showLogModal && (
        <LogMealModal onClose={() => setShowLogModal(false)} onSave={handleSaveMeal} />
      )}
    </div>
  );
}
