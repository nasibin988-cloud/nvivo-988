/**
 * Trend Chart Component - Fixed 0-10 scale for consistent comparison
 */

interface TrendChartProps {
  data: number[];
  color: string;
  height?: number;
}

export function TrendChart({ data, color, height = 90 }: TrendChartProps): React.ReactElement {
  if (data.length < 2) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-text-muted text-xs">
        No data
      </div>
    );
  }

  const padding = 4;
  // Fixed scale from 0 to 10 for wellness metrics
  const minVal = 0;
  const maxVal = 10;
  const range = maxVal - minVal;

  // Generate polyline points string with fixed 0-10 scale - full width
  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (100 - padding * 2);
    const y = padding + (1 - (val - minVal) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  // Generate area polygon points (for fill)
  const areaPoints = [
    `${padding},${height - padding}`,
    ...data.map((val, i) => {
      const x = padding + (i / (data.length - 1)) * (100 - padding * 2);
      const y = padding + (1 - (val - minVal) / range) * (height - padding * 2);
      return `${x},${y}`;
    }),
    `${100 - padding},${height - padding}`,
  ].join(' ');

  const colorId = color.replace('#', '');

  // Calculate y positions for grid lines and labels
  const yTop = padding;
  const yMid = height / 2;
  const yBottom = height - padding;

  return (
    <div className="relative" style={{ height }}>
      {/* Y-axis labels - positioned with background for readability */}
      <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-between pointer-events-none z-10" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <span className="text-[9px] text-text-muted/60 leading-none bg-surface/80 px-0.5 rounded">10</span>
        <span className="text-[9px] text-text-muted/60 leading-none bg-surface/80 px-0.5 rounded">5</span>
        <span className="text-[9px] text-text-muted/60 leading-none bg-surface/80 px-0.5 rounded">0</span>
      </div>

      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        {/* Subtle gradient fill */}
        <defs>
          <linearGradient id={`fill-${colorId}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines at 0, 5, 10 */}
        <line x1={padding} y1={yTop} x2={100 - padding} y2={yTop} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        <line x1={padding} y1={yMid} x2={100 - padding} y2={yMid} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        <line x1={padding} y1={yBottom} x2={100 - padding} y2={yBottom} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />

        {/* Area fill */}
        <polygon points={areaPoints} fill={`url(#fill-${colorId})`} />

        {/* Main line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
