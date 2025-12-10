/**
 * Score Trend Card Component
 * Shows score history with bar chart visualization
 */

import { TrendingUp } from 'lucide-react';
import type { ScoreEntry } from '../types';

interface ScoreTrendCardProps {
  title: string;
  icon: React.ReactNode;
  scores: ScoreEntry[];
  color: string;
}

export function ScoreTrendCard({
  title,
  icon,
  scores,
  color,
}: ScoreTrendCardProps): React.ReactElement {
  const latest = scores[scores.length - 1];
  const previous = scores.length > 1 ? scores[scores.length - 2] : null;
  const trend = previous ? latest.value - previous.value : 0;

  return (
    <div className="bg-surface rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-text-primary">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {trend !== 0 && (
            <TrendingUp size={12} className={trend < 0 ? 'text-emerald-400' : 'text-rose-400'} />
          )}
          <span className={`text-lg font-bold ${color}`}>
            {latest.value}/{latest.max}
          </span>
        </div>
      </div>
      <div className="flex items-end gap-1 h-12">
        {scores.map((score, i) => {
          const heightPercent = (score.value / score.max) * 100;
          const isLatest = i === scores.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full h-10 bg-surface-2 rounded relative overflow-hidden">
                <div
                  className={`absolute bottom-0 w-full rounded transition-all ${
                    isLatest ? color.replace('text-', 'bg-') : 'bg-white/20'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-[10px] text-text-muted text-center mt-2">
        {scores[0].date} - {scores[scores.length - 1].date}
      </div>
    </div>
  );
}
