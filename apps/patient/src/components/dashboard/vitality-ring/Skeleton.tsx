/**
 * VitalityRing Skeleton
 * Loading state placeholder for vitality ring
 */

interface VitalityRingSkeletonProps {
  size?: number;
  strokeWidth?: number;
}

export default function VitalityRingSkeleton({
  size = 160,
  strokeWidth = 8,
}: VitalityRingSkeletonProps): JSX.Element {
  const radius = (size - strokeWidth * 2) / 2;

  return (
    <div className="flex flex-col items-center justify-center animate-pulse">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="w-14 h-10 bg-surface-2 rounded" />
          <div className="w-16 h-4 bg-surface-2 rounded" />
        </div>
      </div>
      <div className="w-14 h-3 bg-surface-2 rounded mt-3" />
    </div>
  );
}
