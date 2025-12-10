/**
 * Nutrition Calendar Heatmap - GitHub-style month view
 * Shows nutrition achievement score per day
 */

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DailyFoodData } from '../../../../hooks/nutrition';

interface NutritionCalendarHeatmapProps {
  history: DailyFoodData[];
  targets: { calories: number; protein: number; carbs: number; fat: number };
  onSelectDate: (date: string) => void;
}

/**
 * Calculate nutrition score for a day (0-10)
 * Based on how well targets were hit, with penalty for overconsumption
 */
function calculateNutritionScore(
  dayData: DailyFoodData,
  targets: { calories: number; protein: number; carbs: number; fat: number }
): number {
  const { totals } = dayData;

  // No meals logged = no score
  if (totals.calories === 0) return -1;

  // Calculate individual metric scores (0-10)
  const calorieRatio = totals.calories / targets.calories;
  let calorieScore = 10;
  if (calorieRatio < 0.7) calorieScore = calorieRatio * 10;
  else if (calorieRatio > 1.2) calorieScore = Math.max(0, 10 - (calorieRatio - 1) * 15);
  else if (calorieRatio >= 0.9 && calorieRatio <= 1.1) calorieScore = 10;
  else calorieScore = 8;

  const proteinScore = Math.min(10, (totals.protein / targets.protein) * 10);
  const carbScore = Math.min(10, (totals.carbs / targets.carbs) * 10);
  const fatScore = Math.min(10, (totals.fat / targets.fat) * 10);

  // Weighted average (calories matter most)
  const score = (calorieScore * 0.4 + proteinScore * 0.25 + carbScore * 0.2 + fatScore * 0.15);

  return Math.round(score * 10) / 10;
}

/**
 * Get heatmap color based on nutrition score
 */
function getNutritionHeatmapColor(score: number): string {
  if (score < 0) return 'rgba(255,255,255,0.02)'; // No data
  if (score >= 9) return 'rgba(34,197,94,0.6)';   // Excellent - bright green
  if (score >= 8) return 'rgba(16,185,129,0.5)';  // Great - emerald
  if (score >= 7) return 'rgba(20,184,166,0.45)'; // Good - teal
  if (score >= 6) return 'rgba(234,179,8,0.5)';   // Fair - yellow
  if (score >= 5) return 'rgba(249,115,22,0.5)';  // Needs work - orange
  if (score >= 3) return 'rgba(239,68,68,0.5)';   // Poor - red
  return 'rgba(220,38,38,0.5)';                    // Very poor - dark red
}

export function NutritionCalendarHeatmap({
  history,
  targets,
  onSelectDate,
}: NutritionCalendarHeatmapProps): React.ReactElement {
  const [monthOffset, setMonthOffset] = useState(0);

  // Build lookup map for quick access
  const historyMap = new Map<string, DailyFoodData>();
  history.forEach((day) => historyMap.set(day.date, day));

  // Generate calendar grid for the month
  const getMonthData = () => {
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() - monthOffset);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();

    const days: { date: string | null; dayNum: number | null; score: number }[] = [];

    // Add padding for days before the month starts
    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, dayNum: null, score: -1 });
    }

    // Add days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayData = historyMap.get(dateStr);
      const score = dayData ? calculateNutritionScore(dayData, targets) : -1;
      days.push({ date: dateStr, dayNum: d, score });
    }

    return {
      monthName: targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      days,
    };
  };

  const { monthName, days } = getMonthData();
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="rounded-2xl p-4 bg-white/[0.02] border border-white/[0.06]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setMonthOffset((m) => m + 1)}
          className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <h3 className="text-sm font-bold text-text-primary">{monthName}</h3>
        <button
          onClick={() => setMonthOffset((m) => Math.max(0, m - 1))}
          disabled={monthOffset === 0}
          className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-text-muted hover:text-text-primary transition-colors disabled:opacity-30"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((day, i) => (
          <div key={i} className="text-[9px] text-text-muted text-center font-medium py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <button
            key={i}
            onClick={() => day.date && onSelectDate(day.date)}
            disabled={!day.date}
            className={`h-8 rounded flex items-center justify-center text-[10px] font-medium transition-all ${
              day.date ? 'hover:ring-1 hover:ring-emerald-500/50 cursor-pointer' : 'cursor-default'
            } ${day.score >= 0 ? 'text-text-primary' : 'text-text-muted/50'}`}
            style={{ backgroundColor: getNutritionHeatmapColor(day.score) }}
          >
            {day.dayNum}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t border-white/[0.06]">
        <span className="text-[9px] text-text-muted">Poor</span>
        <div className="flex gap-0.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'rgba(220,38,38,0.5)' }} />
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'rgba(239,68,68,0.5)' }} />
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'rgba(249,115,22,0.5)' }} />
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'rgba(234,179,8,0.5)' }} />
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'rgba(20,184,166,0.45)' }} />
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'rgba(16,185,129,0.5)' }} />
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'rgba(34,197,94,0.6)' }} />
        </div>
        <span className="text-[9px] text-text-muted">Great</span>
      </div>
    </div>
  );
}
