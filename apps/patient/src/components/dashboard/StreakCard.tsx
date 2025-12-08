import { Flame } from 'lucide-react';
import type { Streak } from '../../hooks/dashboard';

interface StreakCardProps {
  streak: Streak | null | undefined;
}

export function StreakCard({ streak }: StreakCardProps) {
  const currentStreak = streak?.currentStreak ?? 0;
  const hasStreak = currentStreak > 0;

  return (
    <div className="card flex items-center gap-3">
      <div
        className={`p-2.5 rounded-theme-md ${
          hasStreak ? 'bg-warning-muted' : 'bg-surface-2'
        }`}
      >
        <Flame
          size={24}
          className={hasStreak ? 'text-warning' : 'text-text-muted'}
        />
      </div>

      <div className="flex-1">
        {hasStreak ? (
          <>
            <p className="text-lg font-semibold text-text-primary">
              {currentStreak} day streak
            </p>
            <p className="text-xs text-text-secondary">
              Keep it going!
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-text-secondary">
              Start your streak
            </p>
            <p className="text-xs text-text-tertiary">
              Complete tasks to build momentum
            </p>
          </>
        )}
      </div>

      {streak?.longestStreak && streak.longestStreak > currentStreak && (
        <div className="text-right">
          <p className="text-xs text-text-tertiary">Best</p>
          <p className="text-sm font-medium text-text-secondary">
            {streak.longestStreak}d
          </p>
        </div>
      )}
    </div>
  );
}

export function StreakCardSkeleton() {
  return (
    <div className="card flex items-center gap-3">
      <div className="w-11 h-11 skeleton rounded-theme-md" />
      <div className="flex-1">
        <div className="h-5 w-24 skeleton rounded" />
        <div className="h-3 w-16 skeleton rounded mt-1" />
      </div>
    </div>
  );
}
