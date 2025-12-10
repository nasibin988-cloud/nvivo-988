/**
 * Goals Button Component
 * Navigation button to goals & progress section
 */

import { Sparkles, ChevronRight } from 'lucide-react';

interface GoalsButtonProps {
  onClick?: () => void;
}

export function GoalsButton({ onClick }: GoalsButtonProps): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className="w-full bg-surface rounded-2xl border border-border p-4 text-left group hover:border-rose-500/30 hover:bg-rose-500/5 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <Sparkles size={20} className="text-rose-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary">Goals & Progress</h4>
            <p className="text-xs text-text-muted mt-0.5">
              Track behaviors & learn from research
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-text-muted group-hover:text-rose-400 transition-colors"
        />
      </div>
    </button>
  );
}
