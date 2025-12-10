/**
 * Empty State - Shown when no wellness check-in exists for a date
 */

import { Heart } from 'lucide-react';
import { formatDate } from '../../components/history';

interface EmptyStateProps {
  date: string;
  onLog: () => void;
}

export function EmptyState({ date, onLog }: EmptyStateProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
        <Heart size={28} className="text-violet-400" />
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">No check-in for {formatDate(date)}</h3>
      <p className="text-sm text-text-muted mb-6 max-w-xs">
        Track your mood, energy, and sleep to see patterns and improve your wellbeing.
      </p>
      <button
        onClick={onLog}
        className="px-6 py-3 rounded-xl font-semibold text-sm bg-violet-500/15 border border-violet-500/30 text-violet-300 transition-all hover:bg-violet-500/20 active:scale-[0.98] backdrop-blur-sm"
      >
        Log Today&apos;s Wellness
      </button>
    </div>
  );
}
