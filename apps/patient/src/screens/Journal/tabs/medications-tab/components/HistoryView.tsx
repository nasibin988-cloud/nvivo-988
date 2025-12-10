/**
 * History View Component
 * Shows medication adherence history and statistics
 */

import { Calendar, Pill } from 'lucide-react';
import type { AdherenceData } from '../types';
import { AdherenceChart } from './AdherenceChart';

interface HistoryViewProps {
  adherenceData: AdherenceData[];
  weeklyData: AdherenceData[];
}

export function HistoryView({ adherenceData, weeklyData }: HistoryViewProps): React.ReactElement {
  return (
    <>
      {/* Adherence Chart */}
      <AdherenceChart data={adherenceData} />

      {/* Weekly Summary */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
          <Calendar size={14} className="text-rose-400" />
          This Week
        </h3>
        <div className="flex items-end justify-between gap-2 h-24 mb-2">
          {weeklyData.map((day, i) => {
            const isToday = i === weeklyData.length - 1;
            const color =
              day.percentage === 100 ? 'bg-emerald-500' : day.percentage >= 75 ? 'bg-amber-500' : 'bg-rose-500';
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] text-text-muted">{day.percentage}%</span>
                <div className="w-full h-20 bg-surface-2 rounded-lg relative overflow-hidden">
                  <div
                    className={`absolute bottom-0 w-full rounded-lg ${color} ${isToday ? 'opacity-100' : 'opacity-70'}`}
                    style={{ height: `${day.percentage}%` }}
                  />
                </div>
                <span className={`text-[10px] font-medium ${isToday ? 'text-rose-400' : 'text-text-muted'}`}>
                  {day.date}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-text-muted">100%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] text-text-muted">75%+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-[10px] text-text-muted">&lt;75%</span>
          </div>
        </div>
      </div>

      {/* Medication List */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Pill size={14} className="text-rose-400" />
          Your Medications
        </h4>
        <div className="space-y-2">
          {['Metformin', 'Lisinopril', 'Vitamin D3'].map((name, i) => (
            <div key={name} className="bg-surface rounded-xl border border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
                  <Pill size={18} className="text-rose-400" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-text-primary">{name}</span>
                  <span className="text-xs text-text-muted block">
                    {i === 0 ? '500mg • Twice daily' : i === 1 ? '10mg • Once daily' : '2000 IU • Once daily'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-emerald-400">{95 - i * 3}%</span>
                <span className="text-[10px] text-text-muted block">Adherence</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
