/**
 * ComparisonResultsView - Display comparison results for multiple food items
 * Enhanced visualization with insights, bar charts, AI analysis, and smart commentary
 */

import { Trophy, Sparkles, Flame, Beef, Wheat, Droplets, Cookie, Zap, Award, TrendingDown, TrendingUp, Loader2, Brain, AlertTriangle, Check, Heart, Pill, type LucideIcon } from 'lucide-react';
import { useMemo } from 'react';
import type { MultiComparisonResult, FoodHealthProfile, WellnessFocus } from '../types';
import { HealthGradeBadge } from './HealthGradeBadge';
import { FOCUS_LABELS } from '../utils';
import type { PersonalizedDVs } from '../../../../../../hooks/nutrition/usePersonalizedDV';
import { FDA_BASELINE_DVS } from '../../../../../../hooks/nutrition/usePersonalizedDV';

interface ComparisonResultsViewProps {
  result: MultiComparisonResult;
  isLoadingAIInsight?: boolean;
  selectedFocuses?: WellnessFocus[];
  /** Personalized Daily Values - if not provided, uses FDA baseline */
  personalizedDVs?: PersonalizedDVs;
  /** Whether the DVs are personalized (shows indicator in UI) */
  isPersonalized?: boolean;
  /** Set of selected indices for adding to food log */
  selectedForLog?: Set<number>;
  /** Callback when food selection is toggled */
  onToggleSelection?: (index: number) => void;
}

/**
 * Format a single number for display
 */
function formatNum(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
}

function formatDiff(value: number): string {
  return Math.round(Math.abs(value)).toString();
}

function formatForComparison(values: number[]): string[] {
  const rounded = values.map(v => Math.round(v * 10) / 10);
  const anyHasDecimal = rounded.some(v => v % 1 !== 0);
  if (anyHasDecimal) {
    return rounded.map(v => v.toFixed(1));
  } else {
    return rounded.map(v => v.toFixed(0));
  }
}

// =============================================================================
// DV Helper Functions (use personalized or fallback to FDA baseline)
// =============================================================================

type NutrientType = 'limit' | 'beneficial' | 'neutral';

/**
 * Calculate % Daily Value using provided DVs
 */
function getPercentDV(value: number, nutrientKey: string, dvs: PersonalizedDVs): number {
  const config = dvs[nutrientKey];
  if (!config || config.dv === 0) return 0;
  return Math.round((value / config.dv) * 100);
}

/**
 * Get color class based on % DV and nutrient type
 * - LIMIT nutrients: low = green, high = red
 * - BENEFICIAL nutrients: low = gray, high = green
 * - NEUTRAL nutrients: no coloring
 */
function getThresholdColor(value: number, nutrientKey: string, dvs: PersonalizedDVs): string {
  const config = dvs[nutrientKey];
  if (!config || config.dv === 0) return 'text-text-muted';

  const percentDv = (value / config.dv) * 100;

  if (config.type === 'limit') {
    // For sat fat, sodium, cholesterol, trans fat, sugar - lower is better
    if (percentDv <= 5) return 'text-emerald-400'; // Very low - excellent
    if (percentDv <= 15) return 'text-text-secondary'; // Low - good
    if (percentDv <= 25) return 'text-amber-400'; // Moderate - caution
    return 'text-red-400'; // High - concern
  } else if (config.type === 'beneficial') {
    // For fiber, protein, vitamins, minerals - higher is better
    if (percentDv >= 20) return 'text-emerald-400'; // Good source
    if (percentDv >= 10) return 'text-text-secondary'; // Contains some
    return 'text-text-muted'; // Low
  }
  // Neutral - no special coloring
  return 'text-text-secondary';
}

// =============================================================================
// Nutrient Configuration
// =============================================================================

// Primary nutrients (macros) - shown with bar charts + % DV
const PRIMARY_NUTRIENTS = [
  { key: 'calories', label: 'Calories', icon: Flame, color: 'amber', unit: '', lowerBetter: true },
  { key: 'protein', label: 'Protein', icon: Beef, color: 'rose', unit: 'g', lowerBetter: false },
  { key: 'carbs', label: 'Carbs', icon: Wheat, color: 'orange', unit: 'g', lowerBetter: null },
  { key: 'fat', label: 'Total Fat', icon: Droplets, color: 'yellow', unit: 'g', lowerBetter: null },
  { key: 'fiber', label: 'Fiber', icon: Zap, color: 'emerald', unit: 'g', lowerBetter: false },
  { key: 'sugar', label: 'Sugar', icon: Cookie, color: 'pink', unit: 'g', lowerBetter: true },
] as const;

// "Limit" nutrients - things to watch/reduce
const LIMIT_NUTRIENTS = [
  { key: 'saturatedFat', label: 'Saturated Fat', unit: 'g' },
  { key: 'transFat', label: 'Trans Fat', unit: 'g', noDV: true }, // No FDA DV - show "Minimize"
  { key: 'sodium', label: 'Sodium', unit: 'mg' },
  { key: 'addedSugar', label: 'Added Sugar', unit: 'g' },
] as const;

// Nutrients with no DV that should show special text instead of percentage
// Empty string means no % shown, but also no warning text
const NO_DV_DISPLAY: Record<string, string> = {
  transFat: 'Minimize',
  cholesterol: '', // No DV per 2015-2020 guidelines - just show value
};

// Fat breakdown, cholesterol, and other compounds (combined into one group)
const FAT_AND_OTHER_NUTRIENTS = [
  // Fat types
  { key: 'monounsaturatedFat', label: 'Monounsaturated Fat', unit: 'g' },
  { key: 'polyunsaturatedFat', label: 'Polyunsaturated Fat', unit: 'g' },
  { key: 'omega3', label: 'Omega-3 (ALA)', unit: 'g' },
  { key: 'epaDha', label: 'EPA + DHA (Fish Oil)', unit: 'mg' },
  { key: 'omega6', label: 'Omega-6', unit: 'g' },
  { key: 'cholesterol', label: 'Cholesterol', unit: 'mg' },
  // Other compounds
  { key: 'caffeine', label: 'Caffeine', unit: 'mg' },
  { key: 'water', label: 'Water', unit: 'ml' },
  { key: 'alcohol', label: 'Alcohol', unit: 'g' },
  // Glycemic data
  { key: 'glycemicIndex', label: 'Glycemic Index', unit: '' },
  { key: 'glycemicLoad', label: 'Glycemic Load', unit: '' },
] as const;

// Vitamins and Minerals (combined into one group)
const VITAMINS_AND_MINERALS = [
  // Vitamins - Fat-soluble
  { key: 'vitaminA', label: 'Vitamin A', unit: 'mcg' },
  { key: 'vitaminD', label: 'Vitamin D', unit: 'mcg' },
  { key: 'vitaminE', label: 'Vitamin E', unit: 'mg' },
  { key: 'vitaminK', label: 'Vitamin K', unit: 'mcg' },
  // Vitamins - Water-soluble
  { key: 'vitaminC', label: 'Vitamin C', unit: 'mg' },
  { key: 'thiamin', label: 'Thiamin (B1)', unit: 'mg' },
  { key: 'riboflavin', label: 'Riboflavin (B2)', unit: 'mg' },
  { key: 'niacin', label: 'Niacin (B3)', unit: 'mg' },
  { key: 'pantothenicAcid', label: 'Pantothenic Acid (B5)', unit: 'mg' },
  { key: 'vitaminB6', label: 'Vitamin B6', unit: 'mg' },
  { key: 'biotin', label: 'Biotin (B7)', unit: 'mcg' },
  { key: 'folate', label: 'Folate (B9)', unit: 'mcg' },
  { key: 'vitaminB12', label: 'Vitamin B12', unit: 'mcg' },
  { key: 'choline', label: 'Choline', unit: 'mg' },
  // Minerals - Electrolytes
  { key: 'potassium', label: 'Potassium', unit: 'mg' },
  { key: 'calcium', label: 'Calcium', unit: 'mg' },
  { key: 'magnesium', label: 'Magnesium', unit: 'mg' },
  { key: 'phosphorus', label: 'Phosphorus', unit: 'mg' },
  // Minerals - Trace
  { key: 'iron', label: 'Iron', unit: 'mg' },
  { key: 'zinc', label: 'Zinc', unit: 'mg' },
  { key: 'copper', label: 'Copper', unit: 'mg' },
  { key: 'manganese', label: 'Manganese', unit: 'mg' },
  { key: 'selenium', label: 'Selenium', unit: 'mcg' },
  { key: 'iodine', label: 'Iodine', unit: 'mcg' },
  { key: 'chromium', label: 'Chromium', unit: 'mcg' },
  { key: 'molybdenum', label: 'Molybdenum', unit: 'mcg' },
  { key: 'fluoride', label: 'Fluoride', unit: 'mg' },
] as const;

const ITEM_COLORS = [
  { bg: 'bg-violet-500', text: 'text-violet-400', light: 'bg-violet-500/20' },
  { bg: 'bg-blue-500', text: 'text-blue-400', light: 'bg-blue-500/20' },
  { bg: 'bg-emerald-500', text: 'text-emerald-400', light: 'bg-emerald-500/20' },
  { bg: 'bg-amber-500', text: 'text-amber-400', light: 'bg-amber-500/20' },
];

// =============================================================================
// Components
// =============================================================================

interface NutrientConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  unit: string;
  lowerBetter: boolean | null;
}

/**
 * Primary nutrient bar charts with % DV
 */
function NutrientBarCharts({
  nutrients,
  items,
  dvs,
}: {
  nutrients: readonly NutrientConfig[];
  items: FoodHealthProfile[];
  dvs: PersonalizedDVs;
}): React.ReactElement {
  return (
    <>
      {nutrients.map(({ key, label, icon: Icon, color, unit, lowerBetter }) => {
        const values = items.map(item => {
          const val = item[key as keyof FoodHealthProfile];
          return typeof val === 'number' ? val : 0;
        });
        const formattedValues = formatForComparison(values);
        const maxVal = Math.max(...values);
        const minVal = Math.min(...values);

        const bestIdx = lowerBetter === null
          ? -1
          : lowerBetter
          ? values.indexOf(minVal)
          : values.indexOf(maxVal);

        if (maxVal === 0) return null;

        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Icon size={12} className={`text-${color}-400`} />
                <span className="text-xs font-medium text-text-primary">{label}</span>
              </div>
              {lowerBetter !== null && (
                <div className="flex items-center gap-1">
                  {lowerBetter ? (
                    <TrendingDown size={10} className="text-emerald-400" />
                  ) : (
                    <TrendingUp size={10} className="text-emerald-400" />
                  )}
                  <span className="text-[9px] text-text-muted">
                    {lowerBetter ? 'Lower better' : 'Higher better'}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              {items.map((_, idx) => {
                const value = values[idx];
                const formattedValue = formattedValues[idx];
                const percentage = maxVal > 0 ? (value / maxVal) * 100 : 0;
                const itemColors = ITEM_COLORS[idx % ITEM_COLORS.length];
                const isBest = idx === bestIdx;
                const percentDv = getPercentDV(value, key, dvs);

                return (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`w-20 text-right flex items-center justify-end gap-1 ${isBest ? `${itemColors.light} px-1.5 py-0.5 rounded-md` : ''}`}>
                      <span className={`text-[10px] font-medium ${isBest ? itemColors.text : 'text-text-muted'}`}>
                        {formattedValue}{unit}
                      </span>
                      {percentDv > 0 && (
                        <span className={`text-[9px] ${getThresholdColor(value, key, dvs)}`}>
                          ({percentDv}%)
                        </span>
                      )}
                    </div>
                    <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${itemColors.bg} ${isBest ? 'opacity-100' : 'opacity-40'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

interface TableNutrientConfig {
  key: string;
  label: string;
  unit: string;
}

/**
 * Get column width class based on number of items (2-4)
 */
function getColumnWidthClass(itemCount: number): string {
  switch (itemCount) {
    case 2: return 'w-20'; // 80px each
    case 3: return 'w-16'; // 64px each
    case 4: return 'w-14'; // 56px each
    default: return 'w-16';
  }
}

/**
 * Nutrient Comparison Section - Non-collapsible table with numbered column headers
 */
function NutrientComparisonSection({
  nutrients,
  items,
  title,
  icon: Icon,
  iconColor,
  nutrientType,
  dvs,
}: {
  nutrients: readonly TableNutrientConfig[];
  items: FoodHealthProfile[];
  title: string;
  icon: LucideIcon;
  iconColor: string;
  nutrientType: NutrientType;
  dvs: PersonalizedDVs;
}): React.ReactElement | null {
  // Filter to nutrients with data
  const availableNutrients = nutrients.filter(({ key }) => {
    return items.some(item => {
      const val = item[key as keyof FoodHealthProfile];
      return typeof val === 'number' && val > 0;
    });
  });

  if (availableNutrients.length === 0) {
    return null;
  }

  // For 'limit' nutrients, lower is better; for 'beneficial', higher is better; 'neutral' has no winner
  const lowerBetter = nutrientType === 'limit' ? true : nutrientType === 'beneficial' ? false : null;
  const colWidth = getColumnWidthClass(items.length);

  return (
    <div className="pt-5 mt-4 border-t border-white/[0.06]">
      {/* Section header with numbered column badges */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color: iconColor }} />
          <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
            {title}
          </span>
        </div>
        {/* Numbered column headers */}
        <div className="flex items-center gap-1">
          {items.map((_, idx) => {
            const colors = ITEM_COLORS[idx % ITEM_COLORS.length];
            return (
              <div
                key={idx}
                className={`${colWidth} flex justify-center`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${colors.light} ${colors.text}`}>
                  {idx + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nutrient rows */}
      <div className="space-y-0">
        {availableNutrients.map(({ key, label, unit }) => {
          const values = items.map(item => {
            const val = item[key as keyof FoodHealthProfile];
            return typeof val === 'number' ? val : 0;
          });
          const maxVal = Math.max(...values);
          const minVal = Math.min(...values);

          // For neutral nutrients (lowerBetter === null), no winner is determined
          const bestIdx = lowerBetter === null
            ? -1
            : lowerBetter
            ? values.indexOf(minVal)
            : values.indexOf(maxVal);

          const isTie = lowerBetter !== null && values.filter(v => v === (lowerBetter ? minVal : maxVal)).length > 1;

          // Check if this nutrient has no DV (like trans fat)
          const noDvText = NO_DV_DISPLAY[key];

          // Format label with unit
          const labelWithUnit = unit ? `${label} (${unit})` : label;

          return (
            <div key={key} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
              <span className="text-xs text-text-secondary flex-1">{labelWithUnit}</span>
              <div className="flex items-center gap-1">
                {values.map((value, idx) => {
                  const isBest = lowerBetter !== null && idx === bestIdx && !isTie && maxVal !== minVal;
                  const percentDv = noDvText ? 0 : getPercentDV(value, key, dvs);

                  // For trans fat (no DV), color based on absolute value: 0 = green, any amount = red
                  const colorClass = noDvText
                    ? value === 0 ? 'text-emerald-400' : 'text-red-400'
                    : getThresholdColor(value, key, dvs);

                  const colors = ITEM_COLORS[idx % ITEM_COLORS.length];

                  return (
                    <div
                      key={idx}
                      className={`${colWidth} flex flex-col items-center`}
                    >
                      <span
                        className={`text-xs ${colorClass} ${isBest ? `${colors.light} px-1.5 py-0.5 rounded-md font-medium` : ''}`}
                      >
                        {formatNum(value)}
                      </span>
                      {noDvText && value > 0 ? (
                        <span className="text-[9px] text-red-400">({noDvText})</span>
                      ) : noDvText === undefined && percentDv > 0 ? (
                        <span className={`text-[9px] ${colorClass}`}>({percentDv}%)</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function ComparisonResultsView({
  result,
  isLoadingAIInsight = false,
  selectedFocuses = ['balanced'],
  personalizedDVs,
  isPersonalized = false,
  selectedForLog,
  onToggleSelection,
}: ComparisonResultsViewProps): React.ReactElement {
  const winner = result.items[result.rankings[0]?.index];
  const runnerUp = result.items[result.rankings[1]?.index];
  const aiInsight = result.aiInsight;

  // Use personalized DVs if provided, otherwise use FDA baseline
  const dvs = personalizedDVs ?? FDA_BASELINE_DVS;

  const insights = useMemo(() => generateInsights(result), [result]);
  const activeFocuses = selectedFocuses.filter(f => f !== 'balanced');

  return (
    <div className="space-y-4">
      {/* Winner Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-orange-500/5 border border-yellow-500/30 p-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl" />

        <div className="relative">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
              <Trophy size={20} className="text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-yellow-400/80 uppercase tracking-wider">Best Choice</p>
              <h3 className="text-lg font-bold text-text-primary">{winner?.name}</h3>
            </div>
            <HealthGradeBadge grade={winner?.healthGrade || 'C'} size="md" />
          </div>

          {/* Winner stats row */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Flame size={12} className="text-amber-400" />
              <span className="text-text-secondary">{formatNum(winner?.calories ?? 0)} cal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Beef size={12} className="text-rose-400" />
              <span className="text-text-secondary">{formatNum(winner?.protein ?? 0)}g protein</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={12} className="text-emerald-400" />
              <span className="text-text-secondary">{formatNum(winner?.fiber ?? 0)}g fiber</span>
            </div>
          </div>

          {/* AI Grading Insights */}
          {winner?.aiGrading && (
            <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
              {winner.aiGrading.strengths.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 text-[10px]">✓</span>
                  <p className="text-xs text-emerald-400/90">{winner.aiGrading.strengths[0]}</p>
                </div>
              )}
              {winner.aiGrading.primaryConcerns.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-amber-400 text-[10px]">!</span>
                  <p className="text-xs text-amber-400/90">{winner.aiGrading.primaryConcerns[0]}</p>
                </div>
              )}
            </div>
          )}

          {/* Comparison highlight (fallback) */}
          {runnerUp && !winner?.aiGrading && (
            <div className="mt-3 pt-3 border-t border-white/[0.06]">
              <p className="text-xs text-text-muted">
                <span className="text-yellow-400 font-medium">{getComparisonHighlight(winner, runnerUp)}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rankings Podium */}
      <div className="bg-white/[0.02] rounded-xl border border-white/[0.08] p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award size={14} className="text-violet-400" />
            <h3 className="font-semibold text-text-primary text-xs uppercase tracking-wider">Rankings</h3>
          </div>
          {onToggleSelection && (
            <span className="text-[9px] text-text-muted">Tap to add to log</span>
          )}
        </div>
        <div className="flex gap-2">
          {result.rankings.map((ranking, idx) => {
            const profile = result.items[ranking.index];
            const colors = ITEM_COLORS[idx % ITEM_COLORS.length];
            const isSelected = selectedForLog?.has(ranking.index);
            const canSelect = !!onToggleSelection;
            return (
              <button
                key={ranking.index}
                onClick={() => onToggleSelection?.(ranking.index)}
                disabled={!canSelect}
                className={`flex-1 p-2.5 rounded-xl border transition-all text-left ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-500/30'
                    : idx === 0
                    ? 'bg-yellow-500/[0.08] border-yellow-500/30'
                    : 'bg-white/[0.02] border-white/[0.06]'
                } ${canSelect ? 'hover:border-white/20 active:scale-[0.98]' : ''}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${colors.light} ${colors.text}`}>
                      {idx + 1}
                    </div>
                    <HealthGradeBadge grade={ranking.grade} size="sm" />
                  </div>
                  {canSelect && (
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-white/20'
                    }`}>
                      {isSelected && <Check size={10} className="text-white" />}
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-text-primary truncate">{profile.name}</p>
                <p className="text-[10px] text-text-muted">{formatNum(profile.calories)} cal</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Smart Insights - MOVED HERE after Rankings */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-br from-violet-500/[0.08] to-purple-500/[0.04] rounded-xl border border-violet-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-violet-400" />
            <h3 className="font-semibold text-text-primary text-xs uppercase tracking-wider">Quick Insights</h3>
          </div>
          <div className="space-y-2.5">
            {insights.map((insight, idx) => (
              <div key={idx} className="flex gap-2">
                <div className="w-1 rounded-full bg-violet-500/50 shrink-0" />
                <p className="text-xs text-text-secondary leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nutrient Comparison */}
      <div className="bg-white/[0.02] rounded-xl border border-white/[0.08] p-4">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-400" />
            <h3 className="font-semibold text-text-primary text-xs uppercase tracking-wider">Nutrient Comparison</h3>
          </div>
          {isPersonalized && (
            <span className="text-[9px] text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">
              Personalized DVs
            </span>
          )}
        </div>

        {/* Legend - Numbered badges with full names */}
        <div className="flex flex-wrap gap-3 mb-4">
          {result.items.map((item, idx) => {
            const colors = ITEM_COLORS[idx % ITEM_COLORS.length];
            return (
              <div key={idx} className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${colors.light} ${colors.text}`}>
                  {idx + 1}
                </div>
                <span className="text-[10px] text-text-secondary">{item.name}</span>
              </div>
            );
          })}
        </div>

        {/* Primary Nutrients (Macros) - Bar Charts with % DV */}
        <div className="space-y-4">
          <NutrientBarCharts nutrients={PRIMARY_NUTRIENTS} items={result.items} dvs={dvs} />
        </div>

        {/* Nutrients to Limit */}
        <NutrientComparisonSection
          nutrients={LIMIT_NUTRIENTS}
          items={result.items}
          title="Nutrients to Limit"
          icon={AlertTriangle}
          iconColor="#fbbf24"
          nutrientType="limit"
          dvs={dvs}
        />

        {/* Fat Breakdown & Other */}
        <NutrientComparisonSection
          nutrients={FAT_AND_OTHER_NUTRIENTS}
          items={result.items}
          title="Fat Breakdown & Other"
          icon={Droplets}
          iconColor="#60a5fa"
          nutrientType="neutral"
          dvs={dvs}
        />

        {/* Vitamins */}
        <NutrientComparisonSection
          nutrients={VITAMINS_AND_MINERALS.filter(n => n.key.startsWith('vitamin') || ['thiamin', 'riboflavin', 'niacin', 'pantothenicAcid', 'biotin', 'folate', 'choline'].includes(n.key))}
          items={result.items}
          title="Vitamins"
          icon={Heart}
          iconColor="#fb7185"
          nutrientType="beneficial"
          dvs={dvs}
        />

        {/* Minerals */}
        <NutrientComparisonSection
          nutrients={VITAMINS_AND_MINERALS.filter(n => !n.key.startsWith('vitamin') && !['thiamin', 'riboflavin', 'niacin', 'pantothenicAcid', 'biotin', 'folate', 'choline'].includes(n.key))}
          items={result.items}
          title="Minerals"
          icon={Pill}
          iconColor="#a78bfa"
          nutrientType="beneficial"
          dvs={dvs}
        />
      </div>

      {/* AI Insight Card */}
      {(isLoadingAIInsight || aiInsight) && (
        <div className="bg-gradient-to-br from-blue-500/[0.08] to-cyan-500/[0.04] rounded-xl border border-blue-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain size={14} className="text-blue-400" />
            <h3 className="font-semibold text-text-primary text-xs uppercase tracking-wider">AI Analysis</h3>
            {isLoadingAIInsight && (
              <Loader2 size={12} className="text-blue-400 animate-spin ml-auto" />
            )}
          </div>

          {isLoadingAIInsight && !aiInsight && (
            <div className="space-y-2">
              <div className="h-4 bg-white/[0.04] rounded animate-pulse w-full" />
              <div className="h-4 bg-white/[0.04] rounded animate-pulse w-3/4" />
              <div className="h-4 bg-white/[0.04] rounded animate-pulse w-5/6" />
            </div>
          )}

          {aiInsight && (
            <div className="space-y-3">
              {/* Main Verdict */}
              <div className="bg-white/[0.04] rounded-lg p-3">
                <p className="text-sm text-text-primary font-medium leading-relaxed">
                  {aiInsight.verdict}
                </p>
              </div>

              {/* Contextual Analysis */}
              {aiInsight.contextualAnalysis && (
                <p className="text-xs text-text-secondary leading-relaxed">
                  {aiInsight.contextualAnalysis}
                </p>
              )}

              {/* Focus-Specific Insights */}
              {activeFocuses.length > 0 && aiInsight.focusInsights && (
                <div className="space-y-2">
                  {activeFocuses.map(focus => {
                    const insight = aiInsight.focusInsights[focus];
                    if (!insight) return null;
                    return (
                      <div key={focus} className="flex gap-2 items-start">
                        <div className="w-1 rounded-full bg-blue-500/50 shrink-0 h-full min-h-[16px]" />
                        <div>
                          <span className="text-[10px] font-medium text-blue-400 uppercase tracking-wider">
                            {FOCUS_LABELS[focus]}
                          </span>
                          <p className="text-xs text-text-secondary leading-relaxed">{insight}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Surprising Facts */}
              {aiInsight.surprises && aiInsight.surprises.length > 0 && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <p className="text-[10px] font-medium text-amber-400 uppercase tracking-wider mb-1.5">
                    Did you know?
                  </p>
                  <div className="space-y-1.5">
                    {aiInsight.surprises.map((surprise, idx) => (
                      <p key={idx} className="text-xs text-text-muted leading-relaxed">
                        {surprise}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Recommendation */}
              {aiInsight.recommendation && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <p className="text-xs text-emerald-400 font-medium leading-relaxed">
                    {aiInsight.recommendation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

function getComparisonHighlight(winner: FoodHealthProfile, runnerUp: FoodHealthProfile): string {
  const highlights: string[] = [];

  const calorieDiff = runnerUp.calories - winner.calories;
  if (calorieDiff > 50) {
    highlights.push(`${formatDiff(calorieDiff)} fewer calories than ${runnerUp.name}`);
  }

  const proteinDiff = winner.protein - runnerUp.protein;
  if (proteinDiff > 5) {
    highlights.push(`${formatDiff(proteinDiff)}g more protein`);
  }

  const sugarDiff = runnerUp.sugar - winner.sugar;
  if (sugarDiff > 3) {
    highlights.push(`${formatDiff(sugarDiff)}g less sugar`);
  }

  if (highlights.length > 0) {
    return highlights.slice(0, 2).join(' and ');
  }

  return `Grade ${winner.healthGrade} vs ${runnerUp.healthGrade} for ${runnerUp.name}`;
}

function generateInsights(result: MultiComparisonResult): string[] {
  const insights: string[] = [];
  const items = result.items;

  if (items.length < 2) return insights;

  // Calorie insight
  const calories = items.map(i => i.calories);
  const calorieRange = Math.max(...calories) - Math.min(...calories);
  if (calorieRange > 200) {
    const lowestCalItem = items[calories.indexOf(Math.min(...calories))];
    const highestCalItem = items[calories.indexOf(Math.max(...calories))];
    const walkingMinutes = Math.round(calorieRange / 100) * 10;
    insights.push(
      `${lowestCalItem.name} has ${formatNum(calorieRange)} fewer calories than ${highestCalItem.name} — roughly ${walkingMinutes} min of walking.`
    );
  }

  // Protein insight
  const proteins = items.map(i => i.protein);
  const maxProtein = Math.max(...proteins);
  const avgProtein = proteins.reduce((a, b) => a + b, 0) / proteins.length;
  if (maxProtein > avgProtein * 1.5 && maxProtein > 15) {
    const highProteinItem = items[proteins.indexOf(maxProtein)];
    insights.push(
      `${highProteinItem.name} has ${formatNum(maxProtein)}g protein — great for muscle and satiety.`
    );
  }

  // Sat fat warning
  const satFats = items.map(i => i.saturatedFat ?? 0);
  const maxSatFat = Math.max(...satFats);
  if (maxSatFat > 10) {
    const highSatFatItem = items[satFats.indexOf(maxSatFat)];
    const percentDv = Math.round((maxSatFat / 20) * 100);
    insights.push(
      `Watch out: ${highSatFatItem.name} has ${formatNum(maxSatFat)}g saturated fat (${percentDv}% DV).`
    );
  }

  // Sodium warning
  const sodiums = items.map(i => i.sodium);
  const maxSodium = Math.max(...sodiums);
  if (maxSodium > 800) {
    const highSodiumItem = items[sodiums.indexOf(maxSodium)];
    const percentDv = Math.round((maxSodium / 2300) * 100);
    insights.push(
      `${highSodiumItem.name} has ${formatNum(maxSodium)}mg sodium (${percentDv}% DV) — watch if limiting salt.`
    );
  }

  // Fiber insight
  const fibers = items.map(i => i.fiber);
  const maxFiber = Math.max(...fibers);
  if (maxFiber > 5) {
    const highFiberItem = items[fibers.indexOf(maxFiber)];
    insights.push(
      `${highFiberItem.name} has ${formatNum(maxFiber)}g fiber — excellent for digestion and fullness.`
    );
  }

  return insights.slice(0, 4);
}
