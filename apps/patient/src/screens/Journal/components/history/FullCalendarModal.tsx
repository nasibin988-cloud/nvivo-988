/**
 * Full Calendar Browser Modal
 * Allows browsing all logged entries across months and years
 */

import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { HistoryLog } from './types';
import { calculateVitalityScore, getVitalityColor } from './colorUtils';

interface FullCalendarModalProps {
  history: Record<string, HistoryLog>;
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

export function FullCalendarModal({
  history,
  onSelectDate,
  onClose,
}: FullCalendarModalProps): React.ReactElement {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  // Get vitality color for a log
  const getLogColor = (log: HistoryLog): string => {
    const score = calculateVitalityScore(log);
    return getVitalityColor(score);
  };

  // Get years that have entries
  const yearsWithEntries = useMemo(() => {
    const years = new Set<number>();
    Object.keys(history).forEach(date => {
      years.add(new Date(date).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [history]);

  // Generate calendar for selected month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const startPadding = firstDay.getDay();
    const days: { date: string | null; dayNum: number | null; log: HistoryLog | null }[] = [];

    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, dayNum: null, log: null });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: dateStr, dayNum: d, log: history[dateStr] || null });
    }

    return days;
  }, [selectedYear, selectedMonth, history]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handleDateClick = (date: string) => {
    onSelectDate(date);
    onClose();
  };

  const goToPrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-b from-white/[0.03] to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Calendar size={20} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Browse All Entries</h2>
              <p className="text-xs text-text-muted">{Object.keys(history).length} total logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-text-muted" />
          </button>
        </div>

        {/* Year Selector */}
        {yearsWithEntries.length > 1 && (
          <div className="flex items-center justify-center gap-2 p-3 border-b border-border">
            {yearsWithEntries.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedYear === year
                    ? 'bg-violet-500 text-white'
                    : 'bg-white/[0.05] text-text-muted hover:bg-white/[0.1]'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        )}

        {/* Month Navigation */}
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={goToPrevMonth}
            className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={18} className="text-text-muted" />
          </button>
          <span className="text-base font-semibold text-text-primary">
            {monthNames[selectedMonth]} {selectedYear}
          </span>
          <button
            onClick={goToNextMonth}
            className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
          >
            <ChevronRight size={18} className="text-text-muted" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="px-5 pb-5">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-[10px] font-medium text-text-muted uppercase py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              const hasLog = day.log !== null;
              const color = hasLog ? getLogColor(day.log!) : 'transparent';
              const isToday = day.date === new Date().toISOString().split('T')[0];

              return (
                <button
                  key={i}
                  onClick={() => day.date && handleDateClick(day.date)}
                  disabled={!day.date}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all relative ${
                    day.date
                      ? hasLog
                        ? 'hover:ring-2 hover:ring-violet-500/50 cursor-pointer'
                        : 'text-text-muted/40 hover:bg-white/[0.05] cursor-pointer'
                      : ''
                  } ${isToday ? 'ring-1 ring-violet-500/50' : ''}`}
                  style={hasLog ? { backgroundColor: `${color}40`, color } : {}}
                >
                  {day.dayNum}
                  {hasLog && (
                    <div
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="px-5 pb-5">
          <div className="flex items-center justify-center gap-3 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[10px] text-text-muted">Vitality:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(220,38,38,0.4)' }} />
              <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.4)' }} />
              <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(249,115,22,0.4)' }} />
              <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(234,179,8,0.4)' }} />
              <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(20,184,166,0.4)' }} />
              <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(16,185,129,0.4)' }} />
              <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.4)' }} />
            </div>
            <div className="flex gap-4 text-[10px] text-text-muted">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
