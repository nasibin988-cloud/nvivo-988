/**
 * WeeklySummaryCard - Shows weekly nutrition evaluation trends
 *
 * Displays:
 * - Average score for the week
 * - Trend direction (improving, stable, declining)
 * - Best day highlight
 * - Consistent patterns (nutrients that are always high/low)
 * - Days logged vs total days
 *
 * Uses the useCurrentWeekNutrition hook for multi-day evaluation.
 */

import { TrendingUp, TrendingDown, Minus, Calendar, Trophy, Target, AlertCircle, Sparkles } from 'lucide-react';
import {
  useCurrentWeekNutrition,
  getTrendLabel,
} from '../../../../hooks/nutrition';

interface WeeklySummaryCardProps {
  dailyTotals: Map<string, Record<string, number>>;
  onViewDay?: (date: string) => void;
}

export function WeeklySummaryCard({
  dailyTotals,
  onViewDay,
}: WeeklySummaryCardProps): React.ReactElement | null {
  const { data: weekData, isLoading, error } = useCurrentWeekNutrition(dailyTotals);

  // Don't render if no data
  if (dailyTotals.size === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-5 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-32 bg-white/10 rounded" />
          <div className="h-16 w-16 rounded-full bg-white/5" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 bg-white/5 rounded-xl" />
          <div className="h-16 bg-white/5 rounded-xl" />
          <div className="h-16 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !weekData) {
    return null;
  }

  const { averageScore, trend, bestDay, daysLogged, consistentHighlights, consistentGaps, days } = weekData;

  const TrendIcon = getTrendIconComponent(trend);
  const trendColor = getTrendColor(trend);

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden">
      {/* Header with Average Score */}
      <div className="p-5 border-b border-white/[0.04]">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={14} className="text-blue-400" />
              <h3 className="text-sm font-bold text-text-primary">This Week</h3>
            </div>
            <p className="text-xs text-text-muted">
              {daysLogged} of 7 days logged
            </p>
          </div>

          {/* Average Score Ring */}
          <div className="relative">
            <svg width="64" height="64" className="transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="4"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke={getScoreColor(averageScore)}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - averageScore / 100)}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-text-primary">{Math.round(averageScore)}</span>
              <span className="text-[8px] text-text-muted">avg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 divide-x divide-white/[0.04] bg-white/[0.01]">
        {/* Trend */}
        <div className="p-3 text-center">
          <div
            className="w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-1"
            style={{ backgroundColor: `${trendColor}15` }}
          >
            <TrendIcon size={16} style={{ color: trendColor }} />
          </div>
          <span className="text-[10px] text-text-muted block">Trend</span>
          <span className="text-xs font-medium" style={{ color: trendColor }}>
            {getTrendLabel(trend)}
          </span>
        </div>

        {/* Best Day */}
        <div className="p-3 text-center">
          <div className="w-8 h-8 mx-auto rounded-lg bg-amber-500/15 flex items-center justify-center mb-1">
            <Trophy size={16} className="text-amber-400" />
          </div>
          <span className="text-[10px] text-text-muted block">Best Day</span>
          {bestDay ? (
            <button
              onClick={() => onViewDay?.(bestDay.date)}
              className="text-xs font-medium text-amber-400 hover:underline"
            >
              {formatDayName(bestDay.date)} ({bestDay.score})
            </button>
          ) : (
            <span className="text-xs text-text-muted">—</span>
          )}
        </div>

        {/* Days on Target */}
        <div className="p-3 text-center">
          <div className="w-8 h-8 mx-auto rounded-lg bg-emerald-500/15 flex items-center justify-center mb-1">
            <Target size={16} className="text-emerald-400" />
          </div>
          <span className="text-[10px] text-text-muted block">Good Days</span>
          <span className="text-xs font-medium text-emerald-400">
            {days.filter(d => d.score >= 70).length} / {daysLogged}
          </span>
        </div>
      </div>

      {/* Consistent Patterns */}
      {(consistentHighlights.length > 0 || consistentGaps.length > 0) && (
        <div className="p-4 border-t border-white/[0.04] space-y-3">
          <h4 className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Weekly Patterns
          </h4>

          {consistentHighlights.length > 0 && (
            <div className="flex items-start gap-2">
              <Sparkles size={12} className="text-emerald-400 mt-0.5" />
              <div className="flex-1">
                <span className="text-[10px] text-emerald-400 font-medium">Consistently good:</span>
                <p className="text-xs text-text-secondary">
                  {consistentHighlights.join(', ')}
                </p>
              </div>
            </div>
          )}

          {consistentGaps.length > 0 && (
            <div className="flex items-start gap-2">
              <AlertCircle size={12} className="text-amber-400 mt-0.5" />
              <div className="flex-1">
                <span className="text-[10px] text-amber-400 font-medium">Needs attention:</span>
                <p className="text-xs text-text-secondary">
                  {consistentGaps.join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Daily Scores Mini Chart */}
      <div className="px-4 pb-4">
        <div className="flex items-end justify-between gap-1 h-12">
          {getLast7Days().map((date) => {
            const dayData = days.find(d => d.date === date);
            const score = dayData?.score ?? 0;
            const hasData = dayData !== undefined;

            return (
              <button
                key={date}
                onClick={() => hasData && onViewDay?.(date)}
                disabled={!hasData}
                className="flex-1 flex flex-col items-center gap-1 group"
              >
                <div
                  className={`w-full rounded-t transition-all ${
                    hasData ? 'group-hover:opacity-80' : ''
                  }`}
                  style={{
                    height: hasData ? `${Math.max(score / 100 * 40, 4)}px` : '4px',
                    backgroundColor: hasData ? getScoreColor(score) : 'rgba(255,255,255,0.06)',
                  }}
                />
                <span className="text-[8px] text-text-muted">
                  {getDayInitial(date)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getTrendIconComponent(trend: 'improving' | 'stable' | 'declining') {
  switch (trend) {
    case 'improving':
      return TrendingUp;
    case 'declining':
      return TrendingDown;
    default:
      return Minus;
  }
}

function getTrendColor(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving':
      return '#10b981';
    case 'declining':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

function formatDayName(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split('T')[0]) return 'Today';
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';

  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function getDayInitial(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'narrow' });
}

function getLast7Days(): string[] {
  const days: string[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }

  return days;
}
