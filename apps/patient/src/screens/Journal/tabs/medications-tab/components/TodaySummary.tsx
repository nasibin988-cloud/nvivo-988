/**
 * Today Summary Component
 * Shows today's medication progress
 */

import { Award } from 'lucide-react';

interface TodaySummaryProps {
  taken: number;
  total: number;
  percentage: number;
}

export function TodaySummary({ taken, total, percentage }: TodaySummaryProps): React.ReactElement {
  return (
    <div className="bg-surface rounded-2xl border border-border p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Today&apos;s Medications</h3>
            <p className="text-xs text-text-muted">Track your daily doses</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-rose-400">{taken}</span>
            <span className="text-lg text-text-muted">/{total}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-surface-2 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              percentage === 100
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-rose-500 to-pink-400'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-text-muted">
          <span>{taken} taken</span>
          <span>{percentage === 100 ? 'All done!' : `${total - taken} remaining`}</span>
        </div>

        {percentage === 100 && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3">
            <Award size={24} className="text-emerald-400" />
            <div>
              <span className="text-sm font-bold text-emerald-400">Perfect adherence!</span>
              <span className="text-xs text-text-muted block">You&apos;ve taken all medications today</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
