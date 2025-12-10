/**
 * Health Score Card Component
 * Displays the main health score with ring and breakdown
 */

import { TrendingUp } from 'lucide-react';
import type { ScoreBreakdown } from '../types';
import { HealthScoreRing } from './HealthScoreRing';

interface HealthScoreCardProps {
  score: number;
  change: number;
  breakdown: ScoreBreakdown[];
  ringDesign: number;
}

export function HealthScoreCard({
  score,
  change,
  breakdown,
  ringDesign,
}: HealthScoreCardProps): React.ReactElement {
  return (
    <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent rounded-2xl border border-rose-500/20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-xs font-semibold tracking-wider text-text-secondary uppercase">
            Health Score
          </h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-bold text-text-primary">{score}</span>
            <span className="text-lg text-text-muted">/100</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">
              {change > 0 ? '+' : ''}
              {change} from last week
            </span>
          </div>
        </div>
        <HealthScoreRing score={score} design={ringDesign} />
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-rose-500/10">
        {breakdown.map((item) => (
          <div key={item.label} className="text-center">
            <div className={`text-lg font-bold ${item.color}`}>{item.score}</div>
            <div className="text-[10px] text-text-muted">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
