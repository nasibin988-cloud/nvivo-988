/**
 * Timeline Feed (Collapsible)
 * Displays recent history entries with expandable detail
 */

import { useState, useMemo } from 'react';
import { ChevronRight, Calendar } from 'lucide-react';
import { HistoryLog } from './types';
import { TimelineEntryCard } from './TimelineEntryCard';
import { FullCalendarModal } from './FullCalendarModal';

interface TimelineFeedProps {
  history: Record<string, HistoryLog>;
  onSelectDate: (date: string) => void;
}

export function TimelineFeed({ history, onSelectDate }: TimelineFeedProps): React.ReactElement | null {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Get all entries sorted by date (newest first)
  const entries = useMemo(() => {
    return Object.values(history)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history]);

  if (entries.length === 0) {
    return null; // Don't show if no entries
  }

  return (
    <>
      <div className="rounded-2xl bg-surface border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-sm font-bold text-text-primary">Recent Entries</span>
            <span className="text-xs text-text-muted">({entries.length})</span>
            <ChevronRight
              size={16}
              className={`text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            />
          </button>
        </div>

        {/* Collapsible Content */}
        {isExpanded && (
          <div className="p-4 space-y-2">
            {entries.slice(0, 10).map(log => (
              <TimelineEntryCard
                key={log.id}
                log={log}
                onEdit={() => onSelectDate(log.date)}
              />
            ))}

            {/* View All Button */}
            {entries.length > 10 && (
              <button
                onClick={() => setShowCalendarModal(true)}
                className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 hover:border-violet-500/40 flex items-center justify-center gap-2 transition-all group"
              >
                <Calendar size={16} className="text-violet-400 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-violet-400">Browse All {entries.length} Entries</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Full Calendar Modal */}
      {showCalendarModal && (
        <FullCalendarModal
          history={history}
          onSelectDate={onSelectDate}
          onClose={() => setShowCalendarModal(false)}
        />
      )}
    </>
  );
}
