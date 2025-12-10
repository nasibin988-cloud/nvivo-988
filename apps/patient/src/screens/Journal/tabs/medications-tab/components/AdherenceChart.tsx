/**
 * Adherence Chart Component
 * 14-day medication adherence visualization
 */

import { TrendingUp, Flame } from 'lucide-react';
import type { AdherenceData } from '../types';

interface AdherenceChartProps {
  data: AdherenceData[];
}

export function AdherenceChart({ data }: AdherenceChartProps): React.ReactElement {
  const avgAdherence = Math.round(data.reduce((sum, d) => sum + d.percentage, 0) / data.length);
  const perfectDays = data.filter((d) => d.percentage === 100).length;

  // Calculate current streak
  let streak = 0;
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].percentage === 100) streak++;
    else break;
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <TrendingUp size={14} className="text-rose-400" />
          14-Day Adherence
        </h3>
        <div className="flex items-center gap-1">
          <Flame size={14} className="text-amber-400" />
          <span className="text-xs font-bold text-amber-400">{streak} day streak</span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end gap-1 h-16 mb-4">
        {data.map((day, i) => {
          const isToday = i === data.length - 1;
          const color =
            day.percentage === 100 ? 'bg-emerald-500' : day.percentage >= 75 ? 'bg-amber-500' : 'bg-rose-500';
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full h-12 bg-surface-2 rounded relative overflow-hidden group cursor-pointer">
                <div
                  className={`absolute bottom-0 w-full rounded transition-all ${color} ${isToday ? 'opacity-100' : 'opacity-70'}`}
                  style={{ height: `${day.percentage}%` }}
                />
                {/* Tooltip */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-bold text-white bg-black/70 px-1 py-0.5 rounded">
                    {day.percentage}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
        <div className="text-center">
          <span className="text-lg font-bold text-rose-400">{avgAdherence}%</span>
          <span className="text-[9px] text-text-muted block uppercase tracking-wider">Average</span>
        </div>
        <div className="text-center">
          <span className="text-lg font-bold text-emerald-400">{perfectDays}</span>
          <span className="text-[9px] text-text-muted block uppercase tracking-wider">Perfect Days</span>
        </div>
        <div className="text-center">
          <span className="text-lg font-bold text-amber-400">{streak}</span>
          <span className="text-[9px] text-text-muted block uppercase tracking-wider">Current Streak</span>
        </div>
      </div>
    </div>
  );
}
