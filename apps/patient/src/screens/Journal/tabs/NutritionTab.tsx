/**
 * Nutrition Tab - Food and Nutrition Tracking
 * Features: AI photo analysis, USDA search, animated macro orbs, meal timeline,
 * water tracker, Firestore persistence, goal celebration confetti
 *
 * Modularized version - components extracted to separate files
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Apple,
  Camera,
  Beef,
  Wheat,
  Droplets,
  Leaf,
  Candy,
  Zap,
  Flame,
  Target,
  Calendar,
  Settings,
  FileText,
  Scale,
  Sparkles,
  Calculator,
  Wand2,
} from 'lucide-react';
import { ViewToggle } from '@nvivo/ui';
import { useFoodLogs, useWaterIntake, useFoodLogsHistory, useWaterStreak, type FoodLog, type MealType } from '../../../hooks/nutrition';
import { useNutritionTargets, type NutritionTargets } from '../../../hooks/nutrition';
import { PhotoAnalysisModal, MenuScannerModal, FoodComparisonModal, SmartFeaturesModal, TextAnalysisModal } from '../../Journal/food/components';
import type { MenuItem } from '../../Journal/food/components/menu-scanner';
import { Confetti } from '../../../components/animations';

// Modular imports
import {
  ViewMode,
  MACRO_COLORS,
} from '../nutrition';

import {
  MacroOrb,
  WaterTracker,
  NutritionSkeleton,
  EmptyState,
  DailyScoreCard,
  HighlightsGapsPanel,
  NutrientInfoModal,
  WeeklySummaryCard,
  Design16_Grid,
} from '../nutrition/components';

import {
  EditMealModal,
  MacroGoalsModal,
  DVCalculatorModal,
} from '../nutrition/modals';

import {
  WeeklyChart,
  NutritionCalendarHeatmap,
  NutritionTrends,
  MealTimelineFeed,
} from '../nutrition/history';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NutritionTab(): React.ReactElement {
  const [view, setView] = useState<ViewMode>('today');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showMenuScanner, setShowMenuScanner] = useState(false);
  const [showTextAnalysis, setShowTextAnalysis] = useState(false);
  const [showFoodComparison, setShowFoodComparison] = useState(false);
  const [showSmartFeatures, setShowSmartFeatures] = useState(false);
  const [showDVCalculator, setShowDVCalculator] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [customTargets, setCustomTargets] = useState<Partial<NutritionTargets> | null>(null);
  const [editingMeal, setEditingMeal] = useState<FoodLog | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedNutrient, setSelectedNutrient] = useState<string | null>(null);
  const hasTriggeredConfetti = useRef(false);

  const today = new Date().toISOString().split('T')[0];

  // Data hooks
  const { logs, isLoading, dailyTotals, addLog, updateLog, deleteLog, isUpdating } = useFoodLogs(today);
  const { data: targets, isLoading: targetsLoading } = useNutritionTargets();
  const { glasses: waterGlasses, updateWater, isUpdating: isUpdatingWater } = useWaterIntake(today);
  // Fetch 180 days of history for trends (NutritionTrends handles time range selection)
  const { data: historyData } = useFoodLogsHistory(180);
  const { data: waterStreakData } = useWaterStreak(targets?.water || 8);

  // Use targets or defaults, with custom overrides
  const defaultTargets: NutritionTargets = {
    calories: 2000,
    protein: 50,
    carbs: 250,
    fat: 65,
    fiber: 28,
    sodium: 2300,
    water: 8,
  };

  const nutritionTargets: NutritionTargets = {
    ...(targets || defaultTargets),
    ...customTargets,
  };

  // Calculate calorie percentage
  const caloriePercentage = Math.round((dailyTotals.calories / nutritionTargets.calories) * 100);

  // Calculate if all main macros are at/above 95% of target (goal achievement)
  const isGoalAchieved = useMemo(() => {
    const caloriesOk = dailyTotals.calories >= nutritionTargets.calories * 0.95 && dailyTotals.calories <= nutritionTargets.calories * 1.2;
    const proteinOk = dailyTotals.protein >= nutritionTargets.protein * 0.95;
    const carbsOk = dailyTotals.carbs >= nutritionTargets.carbs * 0.95;
    const fatOk = dailyTotals.fat >= nutritionTargets.fat * 0.95;
    return caloriesOk && proteinOk && carbsOk && fatOk;
  }, [dailyTotals, nutritionTargets]);

  // Trigger confetti when goals are achieved (only once per session)
  useEffect(() => {
    if (isGoalAchieved && !hasTriggeredConfetti.current && !isLoading) {
      hasTriggeredConfetti.current = true;
      setShowConfetti(true);
    }
  }, [isGoalAchieved, isLoading]);

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

  // Prepare daily totals Map for WeeklySummaryCard
  const dailyTotalsMap = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    if (!historyData) return map;

    for (const day of historyData) {
      if (day.meals.length > 0) {
        map.set(day.date, day.totals);
      }
    }
    return map;
  }, [historyData]);

  // Handle photo/text analysis result (both use AnalysisResult type)
  const handlePhotoAnalysis = async (result: {
    items: { name: string; calories: number; protein: number; carbs: number; fat: number; fiber?: number; sugar?: number; sodium?: number }[];
    mealType: string;
    eatenAt?: string;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    totalFiber?: number;
    totalSugar?: number;
    totalSodium?: number;
  }) => {
    const description = result.items.map(i => i.name).join(', ');
    // Use eatenAt time if provided, otherwise current time
    const time = result.eatenAt
      ? new Date(`1970-01-01T${result.eatenAt}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const meal: Omit<FoodLog, 'id' | 'createdAt' | 'updatedAt'> = {
      mealType: (result.mealType as MealType) || 'snack',
      description,
      date: today,
      time,
      calories: result.totalCalories,
      protein: result.totalProtein,
      carbs: result.totalCarbs,
      fat: result.totalFat,
      fiber: result.totalFiber ?? null,
      sugar: result.totalSugar ?? null,
      sodium: result.totalSodium ?? null,
      isAiAnalyzed: true,
      aiConfidence: 0.85,
    };
    await addLog(meal);
    setShowPhotoModal(false);
  };

  // Handle menu scanner results
  const handleMenuScannerConfirm = async (items: MenuItem[]) => {
    // Add each selected menu item as a food log
    for (const item of items) {
      const meal: Omit<FoodLog, 'id' | 'createdAt' | 'updatedAt'> = {
        mealType: 'snack' as MealType, // User can edit later
        description: item.name,
        date: today,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        calories: item.calories || null,
        protein: item.protein || null,
        carbs: item.carbs || null,
        fat: item.fat || null,
        fiber: item.fiber || null,
        sugar: item.sugar || null,
        sodium: item.sodium || null,
        isAiAnalyzed: true,
        aiConfidence: item.confidence,
      };
      await addLog(meal);
    }
    setShowMenuScanner(false);
  };

  // Handle smart features add
  const handleSmartFeaturesAdd = async (food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number | null;
    sugar: number | null;
    sodium: number | null;
  }) => {
    const meal: Omit<FoodLog, 'id' | 'createdAt' | 'updatedAt'> = {
      mealType: 'snack' as MealType,
      description: food.name,
      date: today,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      sugar: food.sugar,
      sodium: food.sodium,
    };
    await addLog(meal);
  };

  // Loading state
  if (isLoading || targetsLoading) {
    return <NutritionSkeleton />;
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Goal Achievement Confetti */}
      <Confetti
        active={showConfetti}
        onComplete={() => setShowConfetti(false)}
        colors={[MACRO_COLORS.protein, MACRO_COLORS.carbs, MACRO_COLORS.fat, MACRO_COLORS.fiber, '#10b981']}
      />

      {/* View Toggle */}
      <ViewToggle
        options={[
          { value: 'today', label: 'Today' },
          { value: 'history', label: 'History' },
        ]}
        value={view}
        onChange={setView}
        color="emerald"
        variant="glass"
      />

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
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-3xl font-bold text-emerald-400">{dailyTotals.calories}</span>
                    <span className="text-sm text-text-muted"> / {nutritionTargets.calories} cal</span>
                  </div>
                  <button
                    onClick={() => setShowGoalsModal(true)}
                    className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-emerald-400 hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all"
                    title="Edit nutrition goals"
                  >
                    <Settings size={16} />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden mb-5 relative">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                    caloriePercentage > 100
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${Math.min(caloriePercentage, 100)}%` }}
                >
                  {/* Animated shine */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
                {caloriePercentage > 100 && (
                  <span className="absolute right-0 -top-5 text-[9px] font-bold text-amber-400">
                    +{caloriePercentage - 100}% over
                  </span>
                )}
              </div>

              {/* Macro Orbs - 2x3 Grid for all nutrients */}
              <div className="grid grid-cols-3 gap-3 px-1">
                <MacroOrb
                  label="Protein"
                  current={dailyTotals.protein}
                  target={nutritionTargets.protein}
                  unit="g"
                  color={MACRO_COLORS.protein}
                  icon={Beef}
                  delay={0}
                />
                <MacroOrb
                  label="Carbs"
                  current={dailyTotals.carbs}
                  target={nutritionTargets.carbs}
                  unit="g"
                  color={MACRO_COLORS.carbs}
                  icon={Wheat}
                  delay={50}
                />
                <MacroOrb
                  label="Fat"
                  current={dailyTotals.fat}
                  target={nutritionTargets.fat}
                  unit="g"
                  color={MACRO_COLORS.fat}
                  icon={Droplets}
                  delay={100}
                />
                <MacroOrb
                  label="Fiber"
                  current={dailyTotals.fiber}
                  target={nutritionTargets.fiber}
                  unit="g"
                  color={MACRO_COLORS.fiber}
                  icon={Leaf}
                  delay={150}
                />
                <MacroOrb
                  label="Sugar"
                  current={dailyTotals.sugar}
                  target={nutritionTargets.sugar || 50}
                  unit="g"
                  color={MACRO_COLORS.sugar}
                  icon={Candy}
                  delay={200}
                  invertProgress
                />
                <MacroOrb
                  label="Sodium"
                  current={dailyTotals.sodium}
                  target={nutritionTargets.sodium}
                  unit="mg"
                  color={MACRO_COLORS.sodium}
                  icon={Zap}
                  delay={250}
                  invertProgress
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
            streak={waterStreakData?.currentStreak || 0}
          />

          {/* DRI-Based Nutrition Score - Shows personalized evaluation */}
          <DailyScoreCard
            date={today}
            totals={dailyTotals}
          />

          {/* Highlights & Gaps - What you did well and areas to improve */}
          <HighlightsGapsPanel
            date={today}
            totals={dailyTotals}
            onNutrientTap={(nutrientId) => setSelectedNutrient(nutrientId)}
          />

          {/* Quick Actions - 3x2 Grid */}
          <div className="grid grid-cols-3 gap-2">
            {/* Row 1: AI Input Methods */}
            <button
              onClick={() => setShowPhotoModal(true)}
              className="group relative flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl bg-white/[0.02] border border-violet-500/20 text-violet-400 hover:bg-white/[0.04] hover:border-violet-500/30 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-xl bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-[7px] font-bold text-violet-300">AI</div>
              <Camera size={20} className="relative z-10" />
              <span className="text-xs font-medium relative z-10">Photo</span>
            </button>
            <button
              onClick={() => setShowTextAnalysis(true)}
              className="group relative flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl bg-white/[0.02] border border-purple-500/20 text-purple-400 hover:bg-white/[0.04] hover:border-purple-500/30 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-xl bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-[7px] font-bold text-purple-300">AI</div>
              <Wand2 size={20} className="relative z-10" />
              <span className="text-xs font-medium relative z-10">Describe</span>
            </button>
            <button
              onClick={() => setShowMenuScanner(true)}
              className="group relative flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl bg-white/[0.02] border border-teal-500/20 text-teal-400 hover:bg-white/[0.04] hover:border-teal-500/30 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-xl bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-[7px] font-bold text-teal-300">AI</div>
              <FileText size={20} className="relative z-10" />
              <span className="text-xs font-medium relative z-10">Menu</span>
            </button>

            {/* Row 2: Tools */}
            <button
              onClick={() => setShowSmartFeatures(true)}
              className="group relative flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl bg-white/[0.02] border border-emerald-500/20 text-emerald-400 hover:bg-white/[0.04] hover:border-emerald-500/30 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-xl bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Sparkles size={20} className="relative z-10" />
              <span className="text-xs font-medium relative z-10">Smart Add</span>
            </button>
            <button
              onClick={() => setShowFoodComparison(true)}
              className="group relative flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl bg-white/[0.02] border border-amber-500/20 text-amber-400 hover:bg-white/[0.04] hover:border-amber-500/30 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-xl bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[7px] font-bold text-amber-300">AI</div>
              <Scale size={20} className="relative z-10" />
              <span className="text-xs font-medium relative z-10">Compare</span>
            </button>
            <button
              onClick={() => setShowDVCalculator(true)}
              className="group relative flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl bg-white/[0.02] border border-cyan-500/20 text-cyan-400 hover:bg-white/[0.04] hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-xl bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Calculator size={20} className="relative z-10" />
              <span className="text-xs font-medium relative z-10">My DVs</span>
            </button>
          </div>

          {/* Meals List with Timeline */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Apple size={14} className="text-emerald-400" />
              Today's Meals
            </h4>

            {logs.length === 0 ? (
              <EmptyState onAddMeal={() => setShowTextAnalysis(true)} />
            ) : (
              <Design16_Grid
                meals={logs}
                onDelete={deleteLog}
                onEdit={setEditingMeal}
                targets={nutritionTargets}
              />
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Weekly DRI-Based Summary */}
          <WeeklySummaryCard
            dailyTotals={dailyTotalsMap}
          />

          {/* Quick Stats Row */}
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
              <div key={label} className="bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] p-3 text-center">
                <div className={`w-8 h-8 mx-auto rounded-full ${bg} flex items-center justify-center mb-1.5`}>
                  <IconComponent size={16} className={color} />
                </div>
                <span className="text-base font-bold text-text-primary block">{value.toLocaleString()}</span>
                <span className="text-[9px] text-text-muted">{label}</span>
              </div>
            ))}
          </div>

          {/* Calendar Heatmap */}
          <NutritionCalendarHeatmap
            history={historyData || []}
            targets={{
              calories: nutritionTargets.calories,
              protein: nutritionTargets.protein,
              carbs: nutritionTargets.carbs,
              fat: nutritionTargets.fat,
            }}
            onSelectDate={() => {
              // TODO: Could switch to "today" view for selected date
            }}
          />

          {/* Weekly Chart */}
          <WeeklyChart data={weeklyChartData} target={nutritionTargets.calories} />

          {/* Nutrition Trends */}
          <NutritionTrends
            history={historyData || []}
            targets={nutritionTargets}
          />

          {/* Meal Timeline Feed */}
          <MealTimelineFeed
            history={historyData || []}
            onSelectDate={() => {
              // TODO: Could switch to "today" view for selected date
            }}
          />
        </div>
      )}

      {/* Modals */}
      {showPhotoModal && (
        <PhotoAnalysisModal
          onClose={() => setShowPhotoModal(false)}
          onConfirm={handlePhotoAnalysis}
        />
      )}

      {showMenuScanner && (
        <MenuScannerModal
          onClose={() => setShowMenuScanner(false)}
          onConfirm={handleMenuScannerConfirm}
        />
      )}

      {showTextAnalysis && (
        <TextAnalysisModal
          onClose={() => setShowTextAnalysis(false)}
          onConfirm={handlePhotoAnalysis}
        />
      )}

      {showFoodComparison && (
        <FoodComparisonModal
          onClose={() => setShowFoodComparison(false)}
        />
      )}

      {showSmartFeatures && (
        <SmartFeaturesModal
          onClose={() => setShowSmartFeatures(false)}
          onAddFood={handleSmartFeaturesAdd}
          currentTotals={{
            calories: dailyTotals.calories,
            protein: dailyTotals.protein,
            carbs: dailyTotals.carbs,
            fat: dailyTotals.fat,
            fiber: dailyTotals.fiber,
          }}
          targets={{
            calories: nutritionTargets.calories,
            protein: nutritionTargets.protein,
            carbs: nutritionTargets.carbs,
            fat: nutritionTargets.fat,
            fiber: nutritionTargets.fiber,
          }}
        />
      )}

      {showGoalsModal && (
        <MacroGoalsModal
          currentTargets={nutritionTargets}
          onSave={setCustomTargets}
          onClose={() => setShowGoalsModal(false)}
        />
      )}

      {editingMeal && (
        <EditMealModal
          meal={editingMeal}
          onClose={() => setEditingMeal(null)}
          onSave={async (updates) => {
            await updateLog(updates);
            setEditingMeal(null);
          }}
          isSaving={isUpdating}
        />
      )}

      {/* Nutrient Info Modal - Educational content */}
      {selectedNutrient && (
        <NutrientInfoModal
          nutrientId={selectedNutrient}
          currentIntake={dailyTotals[selectedNutrient as keyof typeof dailyTotals]}
          onClose={() => setSelectedNutrient(null)}
        />
      )}

      {/* DV Calculator Modal */}
      {showDVCalculator && (
        <DVCalculatorModal
          onClose={() => setShowDVCalculator(false)}
          onSaved={() => {
            // Could trigger a refetch of nutrition targets here
            console.log('Personalized DVs saved');
          }}
        />
      )}
    </div>
  );
}
