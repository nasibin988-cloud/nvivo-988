/**
 * WeeklyChart - Weekly calorie bar chart with target line
 * Shows 7-day calorie history with visual indicators for over/under target
 */

import { TrendingUp } from 'lucide-react';

interface WeeklyChartData {
  day: string;
  date: string;
  calories: number;
}

interface WeeklyChartProps {
  data: WeeklyChartData[];
  target: number;
}

export function WeeklyChart({ data, target }: WeeklyChartProps): React.ReactElement {
  const maxCalories = Math.max(...data.map(d => d.calories), target);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <TrendingUp size={14} className="text-emerald-400" />
          Weekly Calories
        </h3>
        <span className="text-xs text-emerald-400 font-medium">This Week</span>
      </div>

      <div className="relative">
        {/* Target line */}
        <div
          className="absolute left-0 right-0 border-t border-dashed border-white/20"
          style={{ bottom: `${(target / maxCalories) * 100}%` }}
        >
          <span className="absolute -top-2 right-0 text-[8px] text-text-muted bg-surface px-1">
            {target}
          </span>
        </div>

        {/* Bars */}
        <div className="flex items-end justify-between gap-2 h-36">
          {data.map((day, i) => {
            const percentage = (day.calories / maxCalories) * 100;
            const isToday = day.date === today;
            const isOverTarget = day.calories > target;

            return (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[9px] text-text-muted font-medium">{day.calories || '-'}</span>
                <div className="w-full h-28 bg-white/[0.04] rounded-lg relative overflow-hidden">
                  {/* Area gradient fill */}
                  <div
                    className={`absolute bottom-0 w-full rounded-lg transition-all duration-700 ${
                      isOverTarget
                        ? 'bg-gradient-to-t from-amber-500 to-orange-400'
                        : isToday
                        ? 'bg-gradient-to-t from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-t from-emerald-500/60 to-emerald-400/40'
                    }`}
                    style={{
                      height: day.calories > 0 ? `${percentage}%` : '0%',
                      transitionDelay: `${i * 50}ms`,
                    }}
                  />

                  {/* Glow for today */}
                  {isToday && day.calories > 0 && (
                    <div
                      className="absolute bottom-0 w-full bg-emerald-400/30 blur-md"
                      style={{ height: `${percentage}%` }}
                    />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isToday ? 'text-emerald-400' : 'text-text-muted'}`}>
                  {day.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-text-muted">Under Target</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-[10px] text-text-muted">Over Target</span>
        </div>
      </div>
    </div>
  );
}
