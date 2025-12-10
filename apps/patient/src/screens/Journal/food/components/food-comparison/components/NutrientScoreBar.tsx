/**
 * NutrientScoreBar - Visual bar showing nutrient score with impact
 */

import type { NutrientScore } from '../types';
import { IMPACT_COLORS } from '../utils';

interface NutrientScoreBarProps {
  score: NutrientScore;
}

export function NutrientScoreBar({ score }: NutrientScoreBarProps): React.ReactElement {
  const colors = IMPACT_COLORS[score.impact];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-primary">{score.name}</span>
        <span className={`text-xs font-bold ${colors.text}`}>
          {Math.round(score.score)}/100
        </span>
      </div>

      {/* Score bar */}
      <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            score.impact === 'positive'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : score.impact === 'neutral'
              ? 'bg-gradient-to-r from-slate-500 to-slate-400'
              : 'bg-gradient-to-r from-red-500 to-orange-400'
          }`}
          style={{ width: `${score.score}%` }}
        />
      </div>

      {/* Reason */}
      <p className="text-[10px] text-text-muted">{score.reason}</p>
    </div>
  );
}
