/**
 * Data Point Card Component
 * Displays a single data point metric with icon and trend
 */

import type { DataPoint } from '../types';
import { colorClasses } from '../data';
import { TrendIndicator } from './Indicators';

interface DataPointCardProps {
  data: DataPoint;
}

export function DataPointCard({ data }: DataPointCardProps): React.ReactElement {
  const Icon = data.icon;
  const colors = colorClasses[data.color] || colorClasses.cyan;

  return (
    <div className={`rounded-lg ${colors.bg} ${colors.border} border p-2`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={10} className={colors.text} />
        <span className="text-[10px] text-text-muted">{data.label}</span>
        <TrendIndicator trend={data.trend} />
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-sm font-bold text-text-primary">{data.value}</span>
        <span className="text-[10px] text-text-muted">{data.unit}</span>
      </div>
    </div>
  );
}
