/**
 * TrendChart Component
 * SVG-based line chart with gradient fill for health metrics
 */

interface TrendChartProps {
  data: number[];
  color: string;
  height?: number;
}

export default function TrendChart({ data, color, height = 70 }: TrendChartProps): React.ReactElement {
  if (data.length < 2) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-text-muted text-xs">
        No data
      </div>
    );
  }

  const padding = 4;
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;

  // Generate polyline points string
  const points = data
    .map((val, i) => {
      const x = padding + (i / (data.length - 1)) * (100 - padding * 2);
      const y = padding + (1 - (val - minVal) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

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

  const displayMin = Math.round(minVal);
  const displayMax = Math.round(maxVal);

  return (
    <div className="relative" style={{ height }}>
      {/* Y-axis labels */}
      <div
        className="absolute left-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none z-10"
        style={{ paddingTop: padding, paddingBottom: padding }}
      >
        <span className="text-[9px] text-text-muted/50 leading-none">{displayMax}</span>
        <span className="text-[9px] text-text-muted/50 leading-none">{displayMin}</span>
      </div>

      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        {/* Subtle gradient fill */}
        <defs>
          <linearGradient id={`fill-${color.slice(1)}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <polygon points={areaPoints} fill={`url(#fill-${color.slice(1)})`} />

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
