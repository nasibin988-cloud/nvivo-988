/**
 * ChangeIndicator Component
 * Display metric change with trend icon
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ChangeIndicatorProps {
  change: number;
  inverted?: boolean;
}

export default function ChangeIndicator({
  change,
  inverted = false,
}: ChangeIndicatorProps): React.ReactElement {
  const isPositive = inverted ? change < 0 : change > 0;
  const isImproved = change < 0; // For most metrics, decrease is improvement

  if (Math.abs(change) < 1) {
    return (
      <div className="flex items-center gap-1 text-text-muted">
        <Minus size={12} />
        <span className="text-xs">Stable</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${isImproved ? 'text-emerald-400' : 'text-amber-400'}`}>
      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      <span className="text-xs font-medium">{Math.abs(change).toFixed(1)}%</span>
    </div>
  );
}
