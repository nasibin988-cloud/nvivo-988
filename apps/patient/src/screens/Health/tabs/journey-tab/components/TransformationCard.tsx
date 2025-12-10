/**
 * Transformation Card Component
 * Before/after metric comparison
 */

import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import type { Transformation, ColorClasses } from '../types';

interface TransformationCardProps {
  data: Transformation;
}

const colorClasses: Record<string, ColorClasses> = {
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
};

export function TransformationCard({ data }: TransformationCardProps): React.ReactElement {
  const Icon = data.icon;
  const change = data.before - data.after;
  const percentChange = Math.abs((change / data.before) * 100).toFixed(0);
  const displayChange = Number(Math.abs(change).toFixed(2));

  const colors = colorClasses[data.color] || colorClasses.cyan;

  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.border} border`}>
          <Icon size={14} className={colors.text} />
        </div>
        <span className="text-xs text-text-secondary font-medium">{data.label}</span>
      </div>

      {/* Before/After comparison */}
      <div className="flex items-center justify-between">
        <div className="text-center">
          <p className="text-[10px] text-text-muted mb-0.5">Before</p>
          <p className="text-lg font-bold text-text-muted line-through decoration-text-muted/30">
            {data.before}
            {data.unit && <span className="text-xs">{data.unit}</span>}
          </p>
        </div>

        <ArrowRight size={16} className={colors.text} />

        <div className="text-center">
          <p className="text-[10px] text-text-muted mb-0.5">Now</p>
          <p className={`text-lg font-bold ${colors.text}`}>
            {data.after}
            {data.unit && <span className="text-xs">{data.unit}</span>}
          </p>
        </div>
      </div>

      {/* Change indicator */}
      <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-center gap-1">
        {data.improvement ? (
          <TrendingDown size={12} className="text-emerald-400" />
        ) : (
          <TrendingUp size={12} className="text-emerald-400" />
        )}
        <span className="text-xs font-semibold text-emerald-400">
          {change > 0 ? '-' : '+'}
          {displayChange}
          {data.unit} ({percentChange}%)
        </span>
      </div>
    </div>
  );
}
