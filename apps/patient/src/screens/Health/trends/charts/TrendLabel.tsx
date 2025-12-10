/**
 * TrendLabel Component
 * Shows trend direction indicator with appropriate color coding
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TrendDirection } from '../types';

interface TrendLabelProps {
  direction: TrendDirection;
  isGoodTrend?: boolean;
}

const trendConfig: Record<TrendDirection, { icon: typeof TrendingUp; label: string }> = {
  up: { icon: TrendingUp, label: 'Increasing' },
  down: { icon: TrendingDown, label: 'Decreasing' },
  stable: { icon: Minus, label: 'Stable' },
};

export default function TrendLabel({ direction, isGoodTrend = true }: TrendLabelProps): React.ReactElement {
  const { icon: Icon, label } = trendConfig[direction];

  let colorClass = 'text-text-muted';
  if (direction !== 'stable') {
    const isPositive = (direction === 'up' && isGoodTrend) || (direction === 'down' && !isGoodTrend);
    colorClass = isPositive ? 'text-emerald-400' : 'text-amber-400';
  }

  return (
    <div className={`flex items-center gap-1 ${colorClass}`}>
      <Icon size={12} />
      <span className="text-[11px] font-medium">{label}</span>
    </div>
  );
}
