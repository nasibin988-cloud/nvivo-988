/**
 * Streak Display - Shows current streak and best streak
 */

import { Flame } from 'lucide-react';
import { StreakData } from '../../components/history/types';

interface StreakDisplayProps {
  streak: StreakData;
}

export function StreakDisplay({ streak }: StreakDisplayProps): React.ReactElement {
  return (
    <div className="flex items-center justify-center gap-6 py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 border border-amber-500/20">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-amber-500/20">
          <Flame size={18} className="text-amber-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-amber-400">{streak.currentStreak}</div>
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Day Streak</div>
        </div>
      </div>
      <div className="w-px h-10 bg-border" />
      <div className="text-center">
        <div className="text-lg font-bold text-text-primary">{streak.longestStreak}</div>
        <div className="text-[10px] text-text-muted uppercase tracking-wider">Best</div>
      </div>
    </div>
  );
}
