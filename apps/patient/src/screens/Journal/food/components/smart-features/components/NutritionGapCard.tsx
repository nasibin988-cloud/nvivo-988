/**
 * NutritionGapCard - Visual display of nutrition deficits
 */

import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import type { NutritionGap } from '../types';

interface NutritionGapCardProps {
  gaps: NutritionGap[];
  isOnTrack: boolean;
  progressPercentage: number;
}

const NUTRIENT_CONFIG = {
  protein: { color: 'rose', label: 'Protein' },
  carbs: { color: 'amber', label: 'Carbs' },
  fat: { color: 'blue', label: 'Fat' },
  fiber: { color: 'emerald', label: 'Fiber' },
  calories: { color: 'teal', label: 'Calories' },
} as const;

export function NutritionGapCard({
  gaps,
  isOnTrack,
  progressPercentage,
}: NutritionGapCardProps): React.ReactElement {
  return (
    <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-4">
      {/* Progress header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isOnTrack ? (
            <CheckCircle size={16} className="text-emerald-400" />
          ) : (
            <TrendingUp size={16} className="text-amber-400" />
          )}
          <span className="text-sm font-semibold text-text-primary">
            {isOnTrack ? "You're on track!" : 'Nutrition gaps'}
          </span>
        </div>
        <span className={`text-xs font-bold ${isOnTrack ? 'text-emerald-400' : 'text-amber-400'}`}>
          {progressPercentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOnTrack
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : 'bg-gradient-to-r from-amber-500 to-orange-400'
          }`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Gap list */}
      {gaps.length > 0 ? (
        <div className="space-y-2">
          {gaps.slice(0, 4).map((gap) => {
            const config = NUTRIENT_CONFIG[gap.nutrient];
            const isLow = gap.percentage < 50;

            return (
              <div
                key={gap.nutrient}
                className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]"
              >
                <div className="flex items-center gap-2">
                  {isLow && <AlertTriangle size={12} className="text-amber-400" />}
                  <span className={`text-xs font-medium text-${config.color}-400`}>
                    {config.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${config.color}-400/80 rounded-full`}
                      style={{ width: `${Math.min(gap.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-text-muted w-12 text-right">
                    {gap.percentage}%
                  </span>
                  <span className="text-[10px] text-text-muted w-16 text-right">
                    -{gap.deficit}{gap.nutrient === 'calories' ? '' : 'g'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-3">
          <CheckCircle size={24} className="text-emerald-400 mx-auto mb-2" />
          <p className="text-xs text-text-muted">All nutrition targets met!</p>
        </div>
      )}
    </div>
  );
}
