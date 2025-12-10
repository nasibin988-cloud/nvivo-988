/**
 * Indicator Components
 * Small indicator components for signal, battery, and trend
 */

import { Wifi, WifiOff, Battery, TrendingUp } from 'lucide-react';

interface SignalIndicatorProps {
  strength: 'strong' | 'weak' | 'offline';
}

export function SignalIndicator({ strength }: SignalIndicatorProps): React.ReactElement {
  if (strength === 'offline') {
    return <WifiOff size={12} className="text-text-muted" />;
  }
  return (
    <Wifi
      size={12}
      className={strength === 'strong' ? 'text-emerald-400' : 'text-amber-400'}
    />
  );
}

interface BatteryIndicatorProps {
  level?: number;
}

export function BatteryIndicator({ level }: BatteryIndicatorProps): React.ReactElement | null {
  if (level === undefined) return null;

  const color = level > 50 ? 'text-emerald-400' : level > 20 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="flex items-center gap-1">
      <Battery size={12} className={color} />
      <span className="text-[10px] text-text-muted">{level}%</span>
    </div>
  );
}

interface TrendIndicatorProps {
  trend?: 'up' | 'down' | 'stable';
}

export function TrendIndicator({ trend }: TrendIndicatorProps): React.ReactElement | null {
  if (!trend || trend === 'stable') return null;

  return trend === 'up' ? (
    <TrendingUp size={10} className="text-emerald-400" />
  ) : (
    <TrendingUp size={10} className="text-rose-400 rotate-180" />
  );
}
