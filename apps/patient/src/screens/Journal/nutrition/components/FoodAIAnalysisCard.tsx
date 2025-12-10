/**
 * FoodAIAnalysisCard - AI Food Analysis Display with 4 Design Variants
 *
 * Displays AI-analyzed food items with tiered nutrition data.
 * Toggle between designs by changing the DESIGN_VARIANT constant.
 *
 * Design Variants:
 * 1. "compact-grid" - Compact grid with color-coded macro pills
 * 2. "nutrition-label" - FDA nutrition label style with full breakdown
 * 3. "cards-horizontal" - Horizontal scrolling cards per food item
 * 4. "radial-dashboard" - Radial progress rings with detailed metrics
 *
 * Note: Multiplier options removed - users choose weights/volumes directly
 */

import { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  Check,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Zap,
  Heart,
  Pill,
  Leaf,
  FlaskConical,
  Sun,
} from 'lucide-react';
import type { AnalyzedFoodItem, NutritionDetailLevel } from '../../../../hooks';

// ============================================================================
// TOGGLE DESIGN HERE - Change to 1, 2, 3, or 4
// ============================================================================
const DESIGN_VARIANT: 1 | 2 | 3 | 4 = 1;

// ============================================================================
// TYPES
// ============================================================================

interface FoodAIAnalysisCardProps {
  items: AnalyzedFoodItem[];
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'unknown';
  detailLevel: NutritionDetailLevel;
  onSave?: (items: AnalyzedFoodItem[]) => void;
  onMealTypeChange?: (type: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
  isLoading?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatValue = (value: number | undefined, decimals: number = 1): string => {
  if (value === undefined || value === null) return '—';
  return decimals === 0 ? Math.round(value).toString() : value.toFixed(decimals);
};

const getMacroColor = (macro: string): string => {
  const colors: Record<string, string> = {
    calories: 'text-amber-400',
    protein: 'text-rose-400',
    carbs: 'text-purple-400',
    fat: 'text-blue-400',
    fiber: 'text-emerald-400',
    sugar: 'text-pink-400',
    sodium: 'text-orange-400',
    saturatedFat: 'text-red-400',
    cholesterol: 'text-yellow-400',
    potassium: 'text-cyan-400',
    calcium: 'text-slate-300',
    iron: 'text-red-300',
    vitaminA: 'text-orange-300',
    vitaminC: 'text-yellow-300',
    vitaminD: 'text-amber-300',
  };
  return colors[macro] || 'text-gray-400';
};

const getMacroBgColor = (macro: string): string => {
  const colors: Record<string, string> = {
    calories: 'bg-amber-500/10 border-amber-500/20',
    protein: 'bg-rose-500/10 border-rose-500/20',
    carbs: 'bg-purple-500/10 border-purple-500/20',
    fat: 'bg-blue-500/10 border-blue-500/20',
    fiber: 'bg-emerald-500/10 border-emerald-500/20',
    sugar: 'bg-pink-500/10 border-pink-500/20',
    sodium: 'bg-orange-500/10 border-orange-500/20',
  };
  return colors[macro] || 'bg-gray-500/10 border-gray-500/20';
};

// Calculate totals from items
const calculateTotals = (items: AnalyzedFoodItem[]) => {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fat: acc.fat + (item.fat || 0),
      fiber: acc.fiber + (item.fiber || 0),
      sugar: acc.sugar + (item.sugar || 0),
      sodium: acc.sodium + (item.sodium || 0),
      saturatedFat: acc.saturatedFat + (item.saturatedFat || 0),
      cholesterol: acc.cholesterol + (item.cholesterol || 0),
      potassium: acc.potassium + (item.potassium || 0),
      calcium: acc.calcium + (item.calcium || 0),
      iron: acc.iron + (item.iron || 0),
      magnesium: acc.magnesium + (item.magnesium || 0),
      vitaminA: acc.vitaminA + (item.vitaminA || 0),
      vitaminC: acc.vitaminC + (item.vitaminC || 0),
      vitaminD: acc.vitaminD + (item.vitaminD || 0),
    }),
    {
      calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0,
      saturatedFat: 0, cholesterol: 0, potassium: 0, calcium: 0, iron: 0, magnesium: 0,
      vitaminA: 0, vitaminC: 0, vitaminD: 0,
    }
  );
};

// ============================================================================
// DESIGN 1: Compact Grid with Color-Coded Pills
// ============================================================================

function CompactGridDesign({
  items,
  detailLevel,
  totals,
}: {
  items: AnalyzedFoodItem[];
  detailLevel: NutritionDetailLevel;
  totals: ReturnType<typeof calculateTotals>;
}) {
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {/* Total Summary - Hero Card */}
      <div className="relative p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border border-violet-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-violet-400" />
          <span className="text-xs font-semibold text-violet-300 uppercase tracking-wider">AI Analysis</span>
        </div>

        {/* Main Calories */}
        <div className="text-center mb-4">
          <span className="text-4xl font-black text-white">{Math.round(totals.calories)}</span>
          <span className="text-lg text-text-muted ml-1">cal</span>
        </div>

        {/* Essential Macros Grid */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { key: 'protein', value: totals.protein, unit: 'g', icon: Beef },
            { key: 'carbs', value: totals.carbs, unit: 'g', icon: Wheat },
            { key: 'fat', value: totals.fat, unit: 'g', icon: Droplets },
            { key: 'fiber', value: totals.fiber, unit: 'g', icon: Leaf },
          ].map(({ key, value, icon: Icon }) => (
            <div
              key={key}
              className={`p-2.5 rounded-xl text-center ${getMacroBgColor(key)} border`}
            >
              <Icon size={14} className={`mx-auto mb-1 ${getMacroColor(key)}`} />
              <span className={`text-sm font-bold ${getMacroColor(key)}`}>
                {formatValue(value)}
              </span>
              <span className="text-[10px] text-text-muted block capitalize">{key}</span>
            </div>
          ))}
        </div>

        {/* Extended Macros (if level >= extended) */}
        {(detailLevel === 'extended' || detailLevel === 'complete') && (
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/[0.06]">
            {[
              { key: 'sugar', value: totals.sugar, unit: 'g' },
              { key: 'sodium', value: totals.sodium, unit: 'mg' },
              { key: 'cholesterol', value: totals.cholesterol, unit: 'mg' },
            ].map(({ key, value, unit }) => (
              <div key={key} className="text-center py-1.5 px-2 rounded-lg bg-white/[0.03]">
                <span className={`text-xs font-bold ${getMacroColor(key)}`}>
                  {formatValue(value, key === 'sodium' || key === 'cholesterol' ? 0 : 1)}{unit}
                </span>
                <span className="text-[9px] text-text-muted block capitalize">{key}</span>
              </div>
            ))}
          </div>
        )}

        {/* Complete Vitamins (if level === complete) */}
        {detailLevel === 'complete' && (
          <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-white/[0.06]">
            {[
              { key: 'vitaminA', value: totals.vitaminA, unit: 'mcg', label: 'Vit A' },
              { key: 'vitaminC', value: totals.vitaminC, unit: 'mg', label: 'Vit C' },
              { key: 'vitaminD', value: totals.vitaminD, unit: 'mcg', label: 'Vit D' },
              { key: 'iron', value: totals.iron, unit: 'mg', label: 'Iron' },
            ].map(({ key, value, unit, label }) => (
              <div key={key} className="text-center py-1.5 px-1 rounded-lg bg-white/[0.03]">
                <span className="text-[10px] font-bold text-text-primary">
                  {formatValue(value, 1)}{unit}
                </span>
                <span className="text-[8px] text-text-muted block">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Individual Items - Expandable */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider px-1">
          {items.length} Item{items.length !== 1 ? 's' : ''} Detected
        </span>
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden"
          >
            <button
              onClick={() => setExpandedItem(expandedItem === index ? null : index)}
              className="w-full p-3 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-400">{index + 1}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-text-primary">{item.name}</span>
                  <span className="text-xs text-text-muted block">
                    {item.quantity} {item.unit} • {Math.round(item.calories)} cal
                  </span>
                </div>
              </div>
              <ChevronDown
                size={16}
                className={`text-text-muted transition-transform ${expandedItem === index ? 'rotate-180' : ''}`}
              />
            </button>

            {expandedItem === index && (
              <div className="px-3 pb-3 pt-0">
                <div className="grid grid-cols-4 gap-2 p-2 rounded-lg bg-white/[0.02]">
                  <div className="text-center">
                    <span className="text-xs font-bold text-rose-400">{formatValue(item.protein)}g</span>
                    <span className="text-[9px] text-text-muted block">Protein</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-purple-400">{formatValue(item.carbs)}g</span>
                    <span className="text-[9px] text-text-muted block">Carbs</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-blue-400">{formatValue(item.fat)}g</span>
                    <span className="text-[9px] text-text-muted block">Fat</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-emerald-400">{formatValue(item.fiber)}g</span>
                    <span className="text-[9px] text-text-muted block">Fiber</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 px-1">
                  <span className="text-[10px] text-text-muted">
                    Confidence: {Math.round((item.confidence || 0.8) * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// DESIGN 2: FDA Nutrition Label Style
// ============================================================================

function NutritionLabelDesign({
  items,
  detailLevel,
  totals,
}: {
  items: AnalyzedFoodItem[];
  detailLevel: NutritionDetailLevel;
  totals: ReturnType<typeof calculateTotals>;
}) {
  return (
    <div className="space-y-4">
      {/* FDA-Style Label */}
      <div className="rounded-2xl bg-white/[0.03] border-2 border-white/[0.15] overflow-hidden">
        {/* Header */}
        <div className="bg-white/[0.05] px-4 py-3 border-b-4 border-white/[0.15]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-text-primary">Nutrition Facts</h3>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-violet-500/20 border border-violet-500/30">
              <Sparkles size={12} className="text-violet-400" />
              <span className="text-[10px] font-bold text-violet-300">AI Analyzed</span>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-1">
            {items.length} serving{items.length !== 1 ? 's' : ''} • {items.map(i => i.name).join(', ')}
          </p>
        </div>

        {/* Calories - Big Display */}
        <div className="px-4 py-3 border-b-4 border-white/[0.15] flex justify-between items-baseline">
          <span className="text-sm font-bold text-text-primary">Calories</span>
          <span className="text-3xl font-black text-white">{Math.round(totals.calories)}</span>
        </div>

        {/* Daily Value Header */}
        <div className="px-4 py-1.5 bg-white/[0.02] border-b border-white/[0.08] text-right">
          <span className="text-[10px] font-bold text-text-muted">% Daily Value*</span>
        </div>

        {/* Nutrient Rows */}
        <div className="divide-y divide-white/[0.06]">
          {/* Essential */}
          <NutrientRow label="Total Fat" value={totals.fat} unit="g" dv={78} bold />
          {(detailLevel === 'extended' || detailLevel === 'complete') && (
            <NutrientRow label="Saturated Fat" value={totals.saturatedFat} unit="g" dv={20} indent />
          )}
          {(detailLevel === 'extended' || detailLevel === 'complete') && (
            <NutrientRow label="Cholesterol" value={totals.cholesterol} unit="mg" dv={300} />
          )}
          <NutrientRow label="Sodium" value={totals.sodium} unit="mg" dv={2300} />
          <NutrientRow label="Total Carbohydrate" value={totals.carbs} unit="g" dv={275} bold />
          <NutrientRow label="Dietary Fiber" value={totals.fiber} unit="g" dv={28} indent />
          <NutrientRow label="Total Sugars" value={totals.sugar} unit="g" indent />
          <NutrientRow label="Protein" value={totals.protein} unit="g" bold />

          {/* Extended Minerals */}
          {(detailLevel === 'extended' || detailLevel === 'complete') && (
            <>
              <div className="border-t-4 border-white/[0.15]" />
              <NutrientRow label="Potassium" value={totals.potassium} unit="mg" dv={4700} />
              <NutrientRow label="Calcium" value={totals.calcium} unit="mg" dv={1300} />
              <NutrientRow label="Iron" value={totals.iron} unit="mg" dv={18} />
              <NutrientRow label="Magnesium" value={totals.magnesium} unit="mg" dv={420} />
            </>
          )}

          {/* Complete Vitamins */}
          {detailLevel === 'complete' && (
            <>
              <div className="border-t-4 border-white/[0.15]" />
              <NutrientRow label="Vitamin A" value={totals.vitaminA} unit="mcg" dv={900} />
              <NutrientRow label="Vitamin C" value={totals.vitaminC} unit="mg" dv={90} />
              <NutrientRow label="Vitamin D" value={totals.vitaminD} unit="mcg" dv={20} />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-white/[0.02] border-t border-white/[0.08]">
          <p className="text-[9px] text-text-muted leading-tight">
            * The % Daily Value tells you how much a nutrient in a serving contributes to a daily diet.
            2,000 calories a day is used for general nutrition advice.
          </p>
        </div>
      </div>
    </div>
  );
}

function NutrientRow({
  label,
  value,
  unit,
  dv,
  bold,
  indent,
}: {
  label: string;
  value: number;
  unit: string;
  dv?: number;
  bold?: boolean;
  indent?: boolean;
}) {
  const dvPercent = dv ? Math.round((value / dv) * 100) : null;
  return (
    <div className={`px-4 py-2 flex justify-between items-center ${indent ? 'pl-8' : ''}`}>
      <span className={`text-sm ${bold ? 'font-bold' : ''} text-text-primary`}>
        {label} <span className="font-normal text-text-secondary">{formatValue(value, unit === 'mg' ? 0 : 1)}{unit}</span>
      </span>
      {dvPercent !== null && (
        <span className={`text-sm ${dvPercent > 20 ? 'font-bold text-amber-400' : 'text-text-secondary'}`}>
          {dvPercent}%
        </span>
      )}
    </div>
  );
}

// ============================================================================
// DESIGN 3: Horizontal Scrolling Cards per Item
// ============================================================================

function HorizontalCardsDesign({
  items,
  detailLevel,
  totals,
}: {
  items: AnalyzedFoodItem[];
  detailLevel: NutritionDetailLevel;
  totals: ReturnType<typeof calculateTotals>;
}) {
  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
        <div className="flex items-center gap-2">
          <Flame size={20} className="text-amber-400" />
          <div>
            <span className="text-2xl font-black text-white">{Math.round(totals.calories)}</span>
            <span className="text-xs text-text-muted ml-1">calories</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-end gap-4">
          <MacroPill label="P" value={totals.protein} color="rose" />
          <MacroPill label="C" value={totals.carbs} color="purple" />
          <MacroPill label="F" value={totals.fat} color="blue" />
        </div>
      </div>

      {/* Horizontal Scroll Items */}
      <div className="-mx-4 px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[280px] p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition-colors"
            >
              {/* Item Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-text-primary line-clamp-1">{item.name}</h4>
                  <span className="text-xs text-text-muted">{item.quantity} {item.unit}</span>
                </div>
                <div className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
                  <span className="text-xs font-bold">{Math.round(item.calories)}</span>
                </div>
              </div>

              {/* Macros Row */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { label: 'Protein', value: item.protein, color: 'rose' },
                  { label: 'Carbs', value: item.carbs, color: 'purple' },
                  { label: 'Fat', value: item.fat, color: 'blue' },
                  { label: 'Fiber', value: item.fiber, color: 'emerald' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center">
                    <span className={`text-sm font-bold text-${color}-400`}>
                      {formatValue(value)}g
                    </span>
                    <span className="text-[9px] text-text-muted block">{label}</span>
                  </div>
                ))}
              </div>

              {/* Extended Info */}
              {(detailLevel === 'extended' || detailLevel === 'complete') && (
                <div className="pt-2 border-t border-white/[0.06] grid grid-cols-3 gap-2">
                  <MiniStat label="Sugar" value={item.sugar} unit="g" />
                  <MiniStat label="Sodium" value={item.sodium} unit="mg" />
                  {item.saturatedFat !== undefined && (
                    <MiniStat label="Sat Fat" value={item.saturatedFat} unit="g" />
                  )}
                </div>
              )}

              {/* Confidence Bar */}
              <div className="mt-3 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-text-muted">AI Confidence</span>
                  <span className="text-[10px] font-bold text-emerald-400">
                    {Math.round((item.confidence || 0.8) * 100)}%
                  </span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    style={{ width: `${(item.confidence || 0.8) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Extended/Complete Totals */}
      {(detailLevel === 'extended' || detailLevel === 'complete') && (
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">
            {detailLevel === 'complete' ? 'Vitamins & Minerals' : 'Additional Nutrients'}
          </span>
          <div className="grid grid-cols-4 gap-2">
            <MiniStat label="Potassium" value={totals.potassium} unit="mg" />
            <MiniStat label="Calcium" value={totals.calcium} unit="mg" />
            <MiniStat label="Iron" value={totals.iron} unit="mg" />
            <MiniStat label="Magnesium" value={totals.magnesium} unit="mg" />
            {detailLevel === 'complete' && (
              <>
                <MiniStat label="Vit A" value={totals.vitaminA} unit="mcg" />
                <MiniStat label="Vit C" value={totals.vitaminC} unit="mg" />
                <MiniStat label="Vit D" value={totals.vitaminD} unit="mcg" />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MacroPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-${color}-500/20`}>
      <span className={`text-xs font-bold text-${color}-400`}>{label}</span>
      <span className="text-xs text-text-secondary">{formatValue(value)}g</span>
    </div>
  );
}

function MiniStat({ label, value, unit }: { label: string; value: number | undefined; unit: string }) {
  return (
    <div className="text-center py-1">
      <span className="text-[10px] font-bold text-text-primary">
        {formatValue(value, unit === 'mg' || unit === 'mcg' ? 0 : 1)}{unit}
      </span>
      <span className="text-[8px] text-text-muted block">{label}</span>
    </div>
  );
}

// ============================================================================
// DESIGN 4: Radial Dashboard with Progress Rings
// ============================================================================

function RadialDashboardDesign({
  items,
  detailLevel,
  totals,
}: {
  items: AnalyzedFoodItem[];
  detailLevel: NutritionDetailLevel;
  totals: ReturnType<typeof calculateTotals>;
}) {
  const dailyGoals = {
    calories: 2000,
    protein: 50,
    carbs: 275,
    fat: 78,
    fiber: 28,
  };

  return (
    <div className="space-y-4">
      {/* Central Radial Display */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 via-gray-900/80 to-slate-950/90 border border-white/[0.08] overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl" />

        {/* AI Badge */}
        <div className="relative flex justify-center mb-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30">
            <Sparkles size={14} className="text-violet-400" />
            <span className="text-xs font-bold text-violet-300">AI Analysis Complete</span>
          </div>
        </div>

        {/* Main Calorie Ring */}
        <div className="relative flex justify-center mb-6">
          <RadialProgress
            value={totals.calories}
            max={dailyGoals.calories}
            size={160}
            strokeWidth={12}
            color="from-amber-400 to-orange-500"
          >
            <div className="text-center">
              <span className="text-4xl font-black text-white">{Math.round(totals.calories)}</span>
              <span className="text-sm text-text-muted block">calories</span>
            </div>
          </RadialProgress>
        </div>

        {/* Macro Rings Row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { key: 'protein', value: totals.protein, goal: dailyGoals.protein, color: 'from-rose-400 to-pink-500', icon: Beef },
            { key: 'carbs', value: totals.carbs, goal: dailyGoals.carbs, color: 'from-purple-400 to-violet-500', icon: Wheat },
            { key: 'fat', value: totals.fat, goal: dailyGoals.fat, color: 'from-blue-400 to-cyan-500', icon: Droplets },
            { key: 'fiber', value: totals.fiber, goal: dailyGoals.fiber, color: 'from-emerald-400 to-teal-500', icon: Leaf },
          ].map(({ key, value, goal, color, icon: Icon }) => (
            <div key={key} className="flex flex-col items-center">
              <RadialProgress
                value={value}
                max={goal}
                size={64}
                strokeWidth={6}
                color={color}
              >
                <Icon size={16} className="text-white/80" />
              </RadialProgress>
              <span className="text-sm font-bold text-text-primary mt-2">{formatValue(value)}g</span>
              <span className="text-[10px] text-text-muted capitalize">{key}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Extended Metrics Grid */}
      {(detailLevel === 'extended' || detailLevel === 'complete') && (
        <div className="grid grid-cols-2 gap-3">
          <MetricCard icon={Heart} label="Cholesterol" value={totals.cholesterol} unit="mg" color="red" />
          <MetricCard icon={Zap} label="Sodium" value={totals.sodium} unit="mg" color="orange" />
          <MetricCard icon={FlaskConical} label="Potassium" value={totals.potassium} unit="mg" color="cyan" />
          <MetricCard icon={Pill} label="Calcium" value={totals.calcium} unit="mg" color="slate" />
        </div>
      )}

      {/* Complete Vitamins */}
      {detailLevel === 'complete' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/10">
          <div className="flex items-center gap-2 mb-3">
            <Sun size={14} className="text-amber-400" />
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Vitamins</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <VitaminPill label="Vitamin A" value={totals.vitaminA} unit="mcg" dv={900} />
            <VitaminPill label="Vitamin C" value={totals.vitaminC} unit="mg" dv={90} />
            <VitaminPill label="Vitamin D" value={totals.vitaminD} unit="mcg" dv={20} />
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Check size={18} className="text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-text-primary block truncate">{item.name}</span>
              <span className="text-xs text-text-muted">
                {item.quantity} {item.unit} • {Math.round(item.confidence * 100)}% confidence
              </span>
            </div>
            <span className="text-sm font-bold text-amber-400">{Math.round(item.calories)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RadialProgress({
  value,
  max,
  size,
  strokeWidth,
  color,
  children,
}: {
  value: number;
  max: number;
  size: number;
  strokeWidth: number;
  color: string;
  children: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = Math.min(value / max, 1);
  const offset = circumference - percent * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#gradient-${color})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className={color.split(' ')[0].replace('from-', 'stop-')} />
            <stop offset="100%" className={color.split(' ')[1]?.replace('to-', 'stop-') || color.split(' ')[0].replace('from-', 'stop-')} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: typeof Heart;
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div className={`p-3 rounded-xl bg-${color}-500/5 border border-${color}-500/10`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={`text-${color}-400`} />
        <span className="text-xs text-text-muted">{label}</span>
      </div>
      <span className="text-lg font-bold text-text-primary">{formatValue(value, 0)}</span>
      <span className="text-xs text-text-muted ml-1">{unit}</span>
    </div>
  );
}

function VitaminPill({ label, value, unit, dv }: { label: string; value: number; unit: string; dv: number }) {
  const percent = Math.round((value / dv) * 100);
  return (
    <div className="text-center p-2 rounded-lg bg-white/[0.03]">
      <span className="text-xs font-bold text-text-primary">{formatValue(value, 0)}{unit}</span>
      <span className="text-[10px] text-text-muted block">{label}</span>
      <span className="text-[9px] text-amber-400">{percent}% DV</span>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT - Renders selected design variant
// ============================================================================

export function FoodAIAnalysisCard({
  items,
  mealType = 'unknown',
  detailLevel,
  onSave,
  onMealTypeChange,
  isLoading,
}: FoodAIAnalysisCardProps): React.ReactElement {
  const totals = calculateTotals(items);

  const mealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = [
    'breakfast',
    'lunch',
    'dinner',
    'snack',
  ];

  if (isLoading) {
    return (
      <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin mb-4" />
        <span className="text-sm text-text-muted">Analyzing your food...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
        <span className="text-text-muted">No food items detected</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Design Variant Indicator (remove in production) */}
      <div className="text-center text-[10px] text-text-muted">
        Design Variant {DESIGN_VARIANT} • {['Compact Grid', 'Nutrition Label', 'Horizontal Cards', 'Radial Dashboard'][DESIGN_VARIANT - 1]}
      </div>

      {/* Render Selected Design */}
      {DESIGN_VARIANT === 1 && <CompactGridDesign items={items} detailLevel={detailLevel} totals={totals} />}
      {DESIGN_VARIANT === 2 && <NutritionLabelDesign items={items} detailLevel={detailLevel} totals={totals} />}
      {DESIGN_VARIANT === 3 && <HorizontalCardsDesign items={items} detailLevel={detailLevel} totals={totals} />}
      {DESIGN_VARIANT === 4 && <RadialDashboardDesign items={items} detailLevel={detailLevel} totals={totals} />}

      {/* Meal Type Selector */}
      {onMealTypeChange && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Meal Type</span>
          <div className="grid grid-cols-4 gap-2">
            {mealTypes.map((type) => (
              <button
                key={type}
                onClick={() => onMealTypeChange(type)}
                className={`py-2.5 rounded-xl text-xs font-medium capitalize transition-all ${
                  mealType === type
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                    : 'bg-white/[0.02] border border-white/[0.06] text-text-muted hover:bg-white/[0.04]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      {onSave && (
        <button
          onClick={() => onSave(items)}
          className="w-full py-3.5 rounded-xl font-semibold text-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Check size={16} />
          Save Meal
        </button>
      )}
    </div>
  );
}

export default FoodAIAnalysisCard;
