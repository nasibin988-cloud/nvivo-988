/**
 * Nutrition Trend Chart - SVG sparkline with dynamic scale
 * Supports various nutrition metrics (calories, protein, etc.)
 */

interface NutritionTrendChartProps {
  data: number[];
  color: string;
  height?: number;
  target?: number;
  showTarget?: boolean;
}

export function NutritionTrendChart({
  data,
  color,
  height = 80,
  target,
  showTarget = false,
}: NutritionTrendChartProps): React.ReactElement {
  if (data.length < 2) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-text-muted text-xs">
        Not enough data
      </div>
    );
  }

  const padding = 4;

  // Dynamic scale based on data range
  const maxVal = Math.max(...data, target || 0) * 1.1;
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal || 1;

  // Generate polyline points
  const points = data
    .map((val, i) => {
      const x = padding + (i / (data.length - 1)) * (100 - padding * 2);
      const y = padding + (1 - (val - minVal) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  // Generate area polygon points
  const areaPoints = [
    `${padding},${height - padding}`,
    ...data.map((val, i) => {
      const x = padding + (i / (data.length - 1)) * (100 - padding * 2);
      const y = padding + (1 - (val - minVal) / range) * (height - padding * 2);
      return `${x},${y}`;
    }),
    `${100 - padding},${height - padding}`,
  ].join(' ');

  // Target line Y position
  const targetY = target ? padding + (1 - (target - minVal) / range) * (height - padding * 2) : 0;

  const colorId = color.replace('#', '');

  return (
    <div className="relative" style={{ height }}>
      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        {/* Gradient fill */}
        <defs>
          <linearGradient id={`fill-nutrition-${colorId}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Target line */}
        {showTarget && target && (
          <line
            x1={padding}
            y1={targetY}
            x2={100 - padding}
            y2={targetY}
            stroke={color}
            strokeWidth="1"
            strokeDasharray="3,3"
            strokeOpacity="0.4"
          />
        )}

        {/* Area fill */}
        <polygon points={areaPoints} fill={`url(#fill-nutrition-${colorId})`} />

        {/* Main line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* End point dot */}
        {data.length > 0 && (
          <circle
            cx={100 - padding}
            cy={padding + (1 - (data[data.length - 1] - minVal) / range) * (height - padding * 2)}
            r="3"
            fill={color}
          />
        )}
      </svg>
    </div>
  );
}
