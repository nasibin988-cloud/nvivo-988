/**
 * Dual Trend Line Graph Component
 * SVG-based dual line graph with labels and area fill
 */

import type { DualTrendLineGraphProps } from '../types';
import { generateSvgPath } from '../utils';

export function DualTrendLineGraph({
  data1,
  data2,
  color1,
  color2,
  label1,
  label2,
  height = 80,
  showArea = true,
  minLabel = '0',
  maxLabel = '10',
  uniqueId,
}: DualTrendLineGraphProps): React.ReactElement {
  if (data1.length === 0 && data2.length === 0) {
    return (
      <div className="h-20 flex items-center justify-center text-text-muted text-sm">
        No trend data available
      </div>
    );
  }

  const allData = [...data1, ...data2];
  const minVal = Math.min(...allData) * 0.9;
  const maxVal = Math.max(...allData) * 1.1;
  const width = 300;

  const path1 = generateSvgPath(data1, width, height, minVal, maxVal);
  const path2 = generateSvgPath(data2, width, height, minVal, maxVal);
  const areaPath = data1.length > 0 ? `${path1} L ${width},${height} L 0,${height} Z` : '';

  return (
    <div>
      <div className="relative" style={{ height }}>
        {/* Min/Max labels - overlaid on left edge */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none z-10 py-0.5">
          <span className="text-[9px] text-text-muted/60 leading-none">{maxLabel}</span>
          <span className="text-[9px] text-text-muted/60 leading-none">{minLabel}</span>
        </div>

        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`fill-cog-${uniqueId}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color1} stopOpacity="0.15" />
              <stop offset="100%" stopColor={color1} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          <line x1="0" y1="0" x2={width} y2="0" stroke="var(--color-border)" strokeWidth="0.5" />
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="var(--color-border)" strokeWidth="0.5" />
          <line x1="0" y1={height} x2={width} y2={height} stroke="var(--color-border)" strokeWidth="0.5" />
          {showArea && areaPath && (
            <path d={areaPath} fill={`url(#fill-cog-${uniqueId})`} stroke="none" />
          )}
          {/* Line 1 */}
          {path1 && <path d={path1} fill="none" stroke={color1} strokeWidth="1.5" strokeLinecap="round" />}
          {/* Line 2 */}
          {path2 && <path d={path2} fill="none" stroke={color2} strokeWidth="1.5" strokeLinecap="round" />}
        </svg>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: color1 }} />
          <span>{label1}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: color2 }} />
          <span>{label2}</span>
        </div>
      </div>
    </div>
  );
}
