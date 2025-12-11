/**
 * NutritionDashboardWidget - Compact nutrition status for home screen
 *
 * Shows:
 * - Today's nutrition score (0-100 ring)
 * - Quick calorie/macro summary
 * - Trend indicator
 * - Link to full nutrition tab
 *
 * Designed to be embedded in the home dashboard.
 */

import { useNutritionDayEvaluation, useCurrentWeekNutrition } from '../../../../hooks/nutrition';
import { Apple, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';

interface NutritionDashboardWidgetProps {
  date: string;
  totals: Record<string, number> | null;
  dailyTotalsMap?: Map<string, Record<string, number>>;
  calorieTarget: number;
  onPress?: () => void;
}

export function NutritionDashboardWidget({
  date,
  totals,
  dailyTotalsMap,
  calorieTarget,
  onPress,
}: NutritionDashboardWidgetProps): React.ReactElement {
  const { data: evaluation, isLoading: evalLoading } = useNutritionDayEvaluation(date, totals);
  const { data: weekData } = useCurrentWeekNutrition(dailyTotalsMap ?? new Map());

  const score = evaluation?.score ?? 0;
  const calories = totals?.calories ?? 0;
  const hasData = totals && Object.keys(totals).length > 0;
  const trend = weekData?.trend ?? 'stable';

  const TrendIcon = trend === 'improving' ? TrendingUp : trend === 'declining' ? TrendingDown : Minus;
  const trendColor = trend === 'improving' ? '#10b981' : trend === 'declining' ? '#ef4444' : '#6b7280';

  // Score ring
  const ringProgress = score / 100;
  const circumference = 2 * Math.PI * 22;
  const strokeDashoffset = circumference * (1 - ringProgress);
  const scoreColor = getScoreColor(score);

  return (
    <button
      onClick={onPress}
      className="w-full bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-4 text-left hover:bg-white/[0.05] hover:border-white/[0.10] transition-all group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <Apple size={16} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Nutrition</h3>
            <span className="text-[10px] text-text-muted">Today's progress</span>
          </div>
        </div>
        <ChevronRight
          size={16}
          className="text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-all"
        />
      </div>

      {!hasData ? (
        <div className="text-center py-4">
          <p className="text-xs text-text-muted">No food logged yet</p>
          <p className="text-[10px] text-text-muted/60 mt-1">Tap to start logging</p>
        </div>
      ) : evalLoading ? (
        <div className="flex items-center gap-4 animate-pulse">
          <div className="w-14 h-14 rounded-full bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-white/5 rounded" />
            <div className="h-3 w-32 bg-white/5 rounded" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {/* Score Ring */}
          <div className="relative flex-shrink-0">
            <svg width="56" height="56" className="transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="22"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="4"
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                fill="none"
                stroke={scoreColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-bold" style={{ color: scoreColor }}>
                {score}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-text-primary">{calories}</span>
              <span className="text-xs text-text-muted">/ {calorieTarget} cal</span>
            </div>

            {/* Calorie progress bar */}
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((calories / calorieTarget) * 100, 100)}%`,
                  backgroundColor: calories > calorieTarget ? '#f59e0b' : '#10b981',
                }}
              />
            </div>

            {/* Trend indicator */}
            <div className="flex items-center gap-1">
              <TrendIcon size={12} color={trendColor} />
              <span className="text-[10px]" style={{ color: trendColor }}>
                {trend === 'improving' ? 'Improving' : trend === 'declining' ? 'Needs focus' : 'Stable'}
              </span>
            </div>
          </div>
        </div>
      )}
    </button>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}
