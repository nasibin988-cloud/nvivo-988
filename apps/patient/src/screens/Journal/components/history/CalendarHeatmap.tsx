/**
 * Calendar Heatmap (GitHub-style)
 * Reusable across Journal tabs for visualizing history data
 */

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HistoryLog } from './types';
import { calculateWellnessScore, getHeatmapColor } from './colorUtils';

interface CalendarHeatmapProps {
  history: Record<string, HistoryLog>;
  onSelectDate: (date: string) => void;
}

export function CalendarHeatmap({ history, onSelectDate }: CalendarHeatmapProps): React.ReactElement {
  const [monthOffset, setMonthOffset] = useState(0);

  // Generate calendar grid for the month
  const getMonthData = () => {
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() - monthOffset);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay(); // 0 = Sunday

    const days: { date: string | null; dayNum: number | null; score: number | null }[] = [];

    // Add padding for days before the month starts
    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, dayNum: null, score: null });
    }

    // Add days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const log = history[dateStr];
      days.push({
        date: dateStr,
        dayNum: d,
        score: log ? calculateWellnessScore(log) : null,
      });
    }

    return {
      monthName: targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      days,
    };
  };

  const { monthName, days } = getMonthData();
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="rounded-2xl p-4 bg-surface border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setMonthOffset(m => m + 1)}
          className="p-1.5 rounded-lg bg-surface-2 border border-border text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <h3 className="text-sm font-bold text-text-primary">{monthName}</h3>
        <button
          onClick={() => setMonthOffset(m => Math.max(0, m - 1))}
          disabled={monthOffset === 0}
          className="p-1.5 rounded-lg bg-surface-2 border border-border text-text-muted hover:text-text-primary transition-colors disabled:opacity-30"
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

      {/* Calendar grid - compact */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const heatmapStyle = getHeatmapColor(day.score);
          return (
            <button
              key={i}
              onClick={() => day.date && onSelectDate(day.date)}
              disabled={!day.date}
              className={`h-8 rounded flex items-center justify-center text-[10px] font-medium transition-all ${
                day.date ? 'hover:ring-1 hover:ring-violet-500/50 cursor-pointer' : 'cursor-default'
              } ${day.score !== null ? 'text-text-primary' : 'text-text-muted/50'}`}
              style={{ backgroundColor: heatmapStyle.bg }}
            >
              {day.dayNum}
            </button>
          );
        })}
      </div>

      {/* Legend - 7-tier gradient */}
      <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t border-border">
        <span className="text-[9px] text-text-muted">Low</span>
        <div className="flex gap-0.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'rgba(220,38,38,0.5)' }} />
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'rgba(239,68,68,0.5)' }} />
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'rgba(249,115,22,0.5)' }} />
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'rgba(234,179,8,0.5)' }} />
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'rgba(20,184,166,0.5)' }} />
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'rgba(16,185,129,0.5)' }} />
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'rgba(34,197,94,0.5)' }} />
        </div>
        <span className="text-[9px] text-text-muted">High</span>
      </div>
    </div>
  );
}
