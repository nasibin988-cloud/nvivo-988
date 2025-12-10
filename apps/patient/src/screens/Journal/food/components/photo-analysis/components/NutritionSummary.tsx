/**
 * NutritionSummary Component
 * Total nutrition display card
 */

import { Sparkles } from 'lucide-react';
import type { AnalysisResult } from '../types';

interface NutritionSummaryProps {
  result: AnalysisResult;
}

export default function NutritionSummary({ result }: NutritionSummaryProps): React.ReactElement {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/[0.08] via-teal-500/[0.04] to-transparent border border-emerald-500/20">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-text-secondary">Total Nutrition</span>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-violet-500/[0.12] border border-violet-500/20 text-violet-400 text-xs font-medium">
          <Sparkles size={10} />
          AI Estimated
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center">
          <div className="text-xl font-bold text-amber-400">{result.totalCalories}</div>
          <div className="text-[10px] text-text-muted">Calories</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-rose-400">{result.totalProtein}g</div>
          <div className="text-[10px] text-text-muted">Protein</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-amber-400/80">{result.totalCarbs}g</div>
          <div className="text-[10px] text-text-muted">Carbs</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-blue-400">{result.totalFat}g</div>
          <div className="text-[10px] text-text-muted">Fat</div>
        </div>
      </div>
    </div>
  );
}
