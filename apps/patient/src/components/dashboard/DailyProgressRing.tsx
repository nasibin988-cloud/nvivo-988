interface DailyProgressRingProps {
  completed: number | null;
  total: number | null;
}

export function DailyProgressRing({ completed, total }: DailyProgressRingProps) {
  // Handle no data state
  const hasData = completed !== null && total !== null && total > 0;
  const percentage = hasData ? Math.round((completed / total) * 100) : 0;

  // SVG parameters
  const size = 80;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = hasData
    ? circumference - (percentage / 100) * circumference
    : circumference;

  return (
    <div className="card flex items-center gap-4">
      {/* Progress Ring */}
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-surface-2)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-text-primary">
            {hasData ? `${percentage}%` : '—'}
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">
          Daily Progress
        </p>
        {hasData ? (
          <p className="text-sm text-text-secondary mt-0.5">
            {completed} of {total} completed
          </p>
        ) : (
          <p className="text-sm text-text-tertiary mt-0.5">
            No tasks scheduled
          </p>
        )}
      </div>
    </div>
  );
}

export function DailyProgressRingSkeleton() {
  return (
    <div className="card flex items-center gap-4">
      <div className="w-20 h-20 skeleton rounded-full" />
      <div className="flex-1">
        <div className="h-4 w-24 skeleton rounded" />
        <div className="h-3 w-32 skeleton rounded mt-2" />
      </div>
    </div>
  );
}
