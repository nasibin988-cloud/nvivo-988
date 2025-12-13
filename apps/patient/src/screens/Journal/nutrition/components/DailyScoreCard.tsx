/**
 * DailyScoreCard - Displays the DRI-based nutrition evaluation score
 *
 * Shows:
 * - Overall score (0-100) with animated ring
 * - Score breakdown (beneficial, limit, balance)
 * - Visual color coding based on score level
 *
 * Uses the new useNutritionDayEvaluation hook which calls the
 * Cloud Functions API for DRI-based evaluation.
 */

import { useNutritionDayEvaluation, type NutritionFocusId } from '../../../../hooks/nutrition';
import { Info, Sparkles, Shield, Scale } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface DailyScoreCardProps {
  date: string;
  totals: Record<string, number> | null;
  focusId?: NutritionFocusId;
  onViewDetails?: () => void;
}

export function DailyScoreCard({
  date,
  totals,
  focusId = 'balanced',
  onViewDetails,
}: DailyScoreCardProps): React.ReactElement | null {
  const { data: evaluation, isLoading, error } = useNutritionDayEvaluation(date, totals, focusId);

  // Don't render if no data logged
  if (!totals || Object.keys(totals).length === 0) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-white/10 rounded" />
            <div className="h-3 w-32 bg-white/5 rounded" />
          </div>
          <div className="w-20 h-20 rounded-full bg-white/5" />
        </div>
      </div>
    );
  }

  // Error state - silently hide
  if (error || !evaluation) {
    return null;
  }

  const { score, label: scoreLabel, breakdown, summary, mar } = evaluation;

  // Determine score color
  const scoreColor = getScoreColor(score);
  const scoreGradient = getScoreGradient(score);

  // Calculate ring progress (0-1)
  const ringProgress = score / 100;
  const circumference = 2 * Math.PI * 36; // radius = 36
  const strokeDashoffset = circumference * (1 - ringProgress);

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-5 relative overflow-hidden">
      {/* Background glow based on score */}
      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: scoreColor }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          {/* Score info */}
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-text-primary">Nutrition Score</h3>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${scoreColor}20`,
                  color: scoreColor,
                }}
              >
                {scoreLabel}
              </span>
            </div>
            <p className="text-xs text-text-muted line-clamp-2">{summary}</p>
          </div>

          {/* Animated Score Ring */}
          <div className="relative flex-shrink-0">
            <svg width="84" height="84" className="transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="42"
                cy="42"
                r="36"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="6"
              />
              {/* Progress ring */}
              <circle
                cx="42"
                cy="42"
                r="36"
                fill="none"
                stroke={`url(#scoreGradient-${date})`}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id={`scoreGradient-${date}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={scoreGradient[0]} />
                  <stop offset="100%" stopColor={scoreGradient[1]} />
                </linearGradient>
              </defs>
            </svg>
            {/* Score number in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-2xl font-bold"
                style={{ color: scoreColor }}
              >
                {score}
              </span>
              <span className="text-[9px] text-text-muted">/ 100</span>
            </div>
          </div>
        </div>

        {/* Score Breakdown - V2 MAR-based scoring */}
        <div className="grid grid-cols-3 gap-2">
          <BreakdownItem
            icon={Sparkles}
            label="Adequacy"
            value={breakdown.adequacy.points}
            maxValue={breakdown.adequacy.maxPoints}
            color="#10b981"
            description={`MAR: ${Math.round(mar * 100)}%`}
          />
          <BreakdownItem
            icon={Shield}
            label="Moderation"
            value={breakdown.moderation.points}
            maxValue={breakdown.moderation.maxPoints}
            color="#f59e0b"
            description="Sodium, sugar, sat fat"
          />
          <BreakdownItem
            icon={Scale}
            label="Balance"
            value={breakdown.balance.points}
            maxValue={breakdown.balance.maxPoints}
            color="#8b5cf6"
            description="Macros & fat quality"
          />
        </div>

        {/* View Details Button */}
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="mt-4 w-full py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-medium text-text-muted hover:text-text-primary hover:bg-white/[0.06] hover:border-white/[0.12] transition-all flex items-center justify-center gap-2"
          >
            <Info size={14} />
            View Detailed Analysis
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface BreakdownItemProps {
  icon: LucideIcon;
  label: string;
  value: number;
  maxValue: number;
  color: string;
  description: string;
}

function BreakdownItem({
  icon: Icon,
  label,
  value,
  maxValue,
  color,
  description,
}: BreakdownItemProps): React.ReactElement {
  const percentage = Math.round((value / maxValue) * 100);

  return (
    <div className="bg-white/[0.02] rounded-xl p-2.5 border border-white/[0.04]">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={12} color={color} />
        <span className="text-[10px] font-medium text-text-muted">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-bold text-text-primary">{value}</span>
        <span className="text-[9px] text-text-muted">/ {maxValue}</span>
      </div>
      {/* Mini progress bar */}
      <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden mt-1.5">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <p className="text-[8px] text-text-muted/60 mt-1 line-clamp-1">{description}</p>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981'; // green
  if (score >= 60) return '#f59e0b'; // amber
  if (score >= 40) return '#f97316'; // orange
  return '#ef4444'; // red
}

function getScoreGradient(score: number): [string, string] {
  if (score >= 80) return ['#10b981', '#14b8a6']; // green to teal
  if (score >= 60) return ['#f59e0b', '#fbbf24']; // amber
  if (score >= 40) return ['#f97316', '#fb923c']; // orange
  return ['#ef4444', '#f87171']; // red
}
