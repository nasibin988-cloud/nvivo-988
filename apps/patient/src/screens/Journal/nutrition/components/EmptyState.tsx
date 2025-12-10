/**
 * EmptyState - Shown when no meals are logged for the day
 * Provides call-to-action to add first meal
 */

import { UtensilsCrossed, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAddMeal: () => void;
}

export function EmptyState({ onAddMeal }: EmptyStateProps): React.ReactElement {
  return (
    <div className="text-center py-12 bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/[0.06]">
      {/* Floating icon */}
      <div
        className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-4"
        style={{ animation: 'float 3s ease-in-out infinite' }}
      >
        <UtensilsCrossed size={36} className="text-emerald-400" />
      </div>

      <h3 className="text-lg font-bold text-text-primary mb-1">No meals logged yet</h3>
      <p className="text-sm text-text-secondary mb-6 max-w-xs mx-auto">
        Start tracking your nutrition to see insights about your eating habits
      </p>

      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onAddMeal}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus size={16} />
          Log Your First Meal
        </button>
        <span className="text-xs text-text-muted">or take a photo for AI analysis</span>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
