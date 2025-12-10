/**
 * Trend Label Component
 * Displays trend direction with icon and label
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TrendDirection, TrendLabelProps } from '../types';

const trendConfig: Record<TrendDirection, { icon: typeof TrendingUp; label: string; colorClass: string }> = {
  increasing: { icon: TrendingUp, label: 'Increasing', colorClass: 'text-success' },
  decreasing: { icon: TrendingDown, label: 'Decreasing', colorClass: 'text-warning' },
  stable: { icon: Minus, label: 'Stable', colorClass: 'text-text-secondary' },
};

export function TrendLabel({ direction, color = 'text-text-secondary' }: TrendLabelProps): React.ReactElement | null {
  if (!direction) return null;

  const { icon: Icon, label, colorClass } = trendConfig[direction];

  return (
    <div className={`flex items-center gap-1 ${color === 'auto' ? colorClass : color}`}>
      <Icon size={12} />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
