/**
 * ComparisonResultsView - Display comparison results for multiple food items
 * Enhanced visualization with insights, bar charts, AI analysis, and smart commentary
 */

import { Trophy, Sparkles, Flame, Beef, Wheat, Droplets, Cookie, Zap, Award, TrendingDown, TrendingUp, Loader2, Brain, ChevronDown, ChevronUp, AlertTriangle, type LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
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
const NO_DV_DISPLAY: Record<string, string> = {
  transFat: 'Minimize',
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
  { bg: 'bg-rose-500', text: 'text-rose-400', light: 'bg-rose-500/20' },
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
                    <div className="w-20 text-right flex items-center justify-end gap-1">
                      <span className={`text-[10px] font-medium ${isBest ? 'text-emerald-400' : 'text-text-muted'}`}>
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
                    {isBest && (
                      <span className="text-[8px] font-bold text-emerald-400 w-6">★</span>
                    )}
                    {!isBest && <span className="w-6" />}
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
 * Nutrient Value Table with % DV and threshold coloring
 */
function NutrientValueTable({
  nutrients,
  items,
  title,
  nutrientType,
  defaultExpanded = false,
  dvs,
}: {
  nutrients: readonly TableNutrientConfig[];
  items: FoodHealthProfile[];
  title: string;
  nutrientType: NutrientType;
  defaultExpanded?: boolean;
  dvs: PersonalizedDVs;
}): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Filter to nutrients with data
  const availableNutrients = nutrients.filter(({ key }) => {
    return items.some(item => {
      const val = item[key as keyof FoodHealthProfile];
      return typeof val === 'number' && val > 0;
    });
  });

  if (availableNutrients.length === 0) {
    return <></>;
  }

  // For 'limit' nutrients, lower is better; for 'beneficial', higher is better; 'neutral' has no winner
  const lowerBetter = nutrientType === 'limit' ? true : nutrientType === 'beneficial' ? false : null;

  return (
    <div className="border-t border-white/[0.06] pt-3 mt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left group mb-2"
      >
        <div className="flex items-center gap-2">
          {nutrientType === 'limit' && (
            <AlertTriangle size={12} className="text-amber-400" />
          )}
          <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
            {title}
          </span>
          <span className="text-[9px] text-text-muted">({availableNutrients.length})</span>
        </div>
        <div className="flex items-center gap-1 text-text-muted">
          {isExpanded ? (
            <ChevronUp size={12} className="group-hover:text-text-secondary transition-colors" />
          ) : (
            <ChevronDown size={12} className="group-hover:text-text-secondary transition-colors" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-1.5 pr-2 text-text-muted font-medium">Nutrient</th>
                {items.map((item, idx) => (
                  <th key={idx} className="text-right py-1.5 px-1 text-text-muted font-medium min-w-[70px]">
                    <span className="truncate block max-w-[70px]" title={item.name}>
                      {item.name.length > 10 ? item.name.slice(0, 8) + '...' : item.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {availableNutrients.map(({ key, label, unit }) => {
                const values = items.map(item => {
                  const val = item[key as keyof FoodHealthProfile];
                  return typeof val === 'number' ? val : 0;
                });
                const maxVal = Math.max(...values);
                const minVal = Math.min(...values);

                // For neutral nutrients (lowerBetter === null), no winner is determined
                const bestIdx = lowerBetter === null
                  ? -1 // No winner for neutral nutrients
                  : lowerBetter
                  ? values.indexOf(minVal)
                  : values.indexOf(maxVal);

                const isTie = lowerBetter !== null && values.filter(v => v === (lowerBetter ? minVal : maxVal)).length > 1;

                // Check if this nutrient has no DV (like trans fat)
                const noDvText = NO_DV_DISPLAY[key];

                return (
                  <tr key={key} className="border-b border-white/[0.04]">
                    <td className="py-1.5 pr-2 text-text-secondary">{label}</td>
                    {values.map((value, idx) => {
                      const isBest = lowerBetter !== null && idx === bestIdx && !isTie && maxVal !== minVal;
                      const percentDv = noDvText ? 0 : getPercentDV(value, key, dvs);

                      // For trans fat (no DV), color based on absolute value: 0 = green, any amount = red
                      const colorClass = noDvText
                        ? value === 0 ? 'text-emerald-400' : 'text-red-400'
                        : getThresholdColor(value, key, dvs);

                      return (
                        <td
                          key={idx}
                          className={`text-right py-1.5 px-1 ${colorClass} ${isBest ? 'font-bold' : ''}`}
                        >
                          <div className="flex flex-col items-end">
                            <span>
                              {formatNum(value)}{unit}
                              {isBest && <span className="ml-0.5 text-[8px]">★</span>}
                            </span>
                            {noDvText && value > 0 ? (
                              <span className="text-[9px] text-red-400">
                                ({noDvText})
                              </span>
                            ) : percentDv > 0 ? (
                              <span className={`text-[9px] ${colorClass}`}>
                                ({percentDv}%)
                              </span>
                            ) : null}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Legend for this nutrient type (only show for limit/beneficial) */}
          {nutrientType !== 'neutral' && (
            <div className="mt-2 text-[9px] text-text-muted">
              {nutrientType === 'limit' ? (
                <>
                  <span className="text-emerald-400">●</span> Low (≤5% DV) &nbsp;
                  <span className="text-amber-400">●</span> High (15-25%) &nbsp;
                  <span className="text-red-400">●</span> Very High (&gt;25%)
                </>
              ) : (
                <>
                  <span className="text-emerald-400">●</span> Good source (≥20% DV) &nbsp;
                  <span className="text-text-muted">●</span> Low (&lt;10%)
                </>
              )}
            </div>
          )}
        </div>
      )}
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
        <div className="flex items-center gap-2 mb-3">
          <Award size={14} className="text-violet-400" />
          <h3 className="font-semibold text-text-primary text-xs uppercase tracking-wider">Rankings</h3>
        </div>
        <div className="flex gap-2">
          {result.rankings.map((ranking, idx) => {
            const profile = result.items[ranking.index];
            const colors = ITEM_COLORS[idx % ITEM_COLORS.length];
            return (
              <div
                key={ranking.index}
                className={`flex-1 p-2.5 rounded-xl border transition-all ${
                  idx === 0
                    ? 'bg-yellow-500/[0.08] border-yellow-500/30'
                    : 'bg-white/[0.02] border-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${colors.light} ${colors.text}`}>
                    {idx + 1}
                  </div>
                  <HealthGradeBadge grade={ranking.grade} size="sm" />
                </div>
                <p className="text-xs font-medium text-text-primary truncate">{profile.name}</p>
                <p className="text-[10px] text-text-muted">{formatNum(profile.calories)} cal</p>
              </div>
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

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          {result.items.map((item, idx) => {
            const colors = ITEM_COLORS[idx % ITEM_COLORS.length];
            return (
              <div key={idx} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-sm ${colors.bg}`} />
                <span className="text-[10px] text-text-muted truncate max-w-[80px]">{item.name}</span>
              </div>
            );
          })}
        </div>

        {/* Primary Nutrients (Macros) - Bar Charts with % DV */}
        <div className="space-y-4">
          <NutrientBarCharts nutrients={PRIMARY_NUTRIENTS} items={result.items} dvs={dvs} />
        </div>

        {/* Nutrients to Limit (collapsible, expanded by default) */}
        <NutrientValueTable
          nutrients={LIMIT_NUTRIENTS}
          items={result.items}
          title="Nutrients to Limit"
          nutrientType="limit"
          defaultExpanded={true}
          dvs={dvs}
        />

        {/* Fat Breakdown, Cholesterol & Other Compounds (combined) */}
        <NutrientValueTable
          nutrients={FAT_AND_OTHER_NUTRIENTS}
          items={result.items}
          title="Fat Breakdown & Other"
          nutrientType="neutral"
          defaultExpanded={false}
          dvs={dvs}
        />

        {/* Vitamins & Minerals (combined) */}
        <NutrientValueTable
          nutrients={VITAMINS_AND_MINERALS}
          items={result.items}
          title="Vitamins & Minerals"
          dvs={dvs}
          nutrientType="beneficial"
          defaultExpanded={false}
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
