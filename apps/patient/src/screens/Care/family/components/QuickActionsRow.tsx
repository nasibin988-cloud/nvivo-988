/**
 * QuickActionsRow - Share Summary and Family Explainer action cards
 */

import { Share2, BookOpen } from 'lucide-react';

interface QuickActionsRowProps {
  onShareClick: () => void;
  onExplainerClick: () => void;
}

export function QuickActionsRow({
  onShareClick,
  onExplainerClick,
}: QuickActionsRowProps): React.ReactElement {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Share Health Summary */}
      <button
        onClick={onShareClick}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500/[0.08] via-surface to-surface-2 border border-teal-500/15 p-4 hover:border-teal-500/25 transition-all group text-left"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-60 group-hover:opacity-100 transition-opacity" />
        <div className="relative">
          <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 w-fit mb-3">
            <Share2 size={18} className="text-teal-400" />
          </div>
          <h4 className="font-medium text-text-primary text-sm mb-1">Share Summary</h4>
          <p className="text-xs text-text-muted">Generate secure health report</p>
        </div>
      </button>

      {/* Family Explainer */}
      <button
        onClick={onExplainerClick}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/[0.08] via-surface to-surface-2 border border-amber-500/15 p-4 hover:border-amber-500/25 transition-all group text-left"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-60 group-hover:opacity-100 transition-opacity" />
        <div className="relative">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 w-fit mb-3">
            <BookOpen size={18} className="text-amber-400" />
          </div>
          <h4 className="font-medium text-text-primary text-sm mb-1">Family Explainer</h4>
          <p className="text-xs text-text-muted">Simplify health for family</p>
        </div>
      </button>
    </div>
  );
}
