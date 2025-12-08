/**
 * Shared TrendLabel component for displaying trend indicators
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { colors } from '../../constants/colors';

export type TrendDirection = 'up' | 'down' | 'stable';

interface TrendLabelProps {
  trend: TrendDirection;
  value?: string | number;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Whether "up" is good (default) or bad */
  upIsGood?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { icon: 10, text: 'text-[10px]' },
  md: { icon: 12, text: 'text-xs' },
  lg: { icon: 14, text: 'text-sm' },
};

export function TrendLabel({
  trend,
  value,
  suffix,
  size = 'sm',
  upIsGood = true,
  className = '',
}: TrendLabelProps): JSX.Element {
  const config = sizeConfig[size];

  // Determine color based on trend and whether up is good
  const getColor = (): string => {
    if (trend === 'stable') return colors.textMuted;
    if (trend === 'up') return upIsGood ? colors.success : colors.error;
    return upIsGood ? colors.error : colors.success;
  };

  const color = getColor();

  const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${config.text} font-medium ${className}`}
      style={{ color }}
    >
      <Icon size={config.icon} />
      {value !== undefined && (
        <span>
          {value}
          {suffix}
        </span>
      )}
    </span>
  );
}

export default TrendLabel;
