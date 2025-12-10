/**
 * Panel Header Component
 * Header with brain icon, title, and view more button
 */

import { Brain, ChevronRight } from 'lucide-react';

interface PanelHeaderProps {
  onViewMore?: () => void;
}

export function PanelHeader({ onViewMore }: PanelHeaderProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-theme-md bg-gradient-to-br from-sleep/15 to-sleep/5 border border-sleep/20 shadow-sm">
          <Brain size={24} className="text-sleep" strokeWidth={2} />
        </div>
        <h3 className="text-lg font-bold text-text-primary">
          Cognitive Health & Mental Wellbeing
        </h3>
      </div>
      {onViewMore && (
        <button onClick={onViewMore} className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent transition-base">
          View more <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
