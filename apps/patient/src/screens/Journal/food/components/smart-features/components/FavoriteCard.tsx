/**
 * FavoriteCard - Displays a favorite food item with quick add functionality
 */

import { Heart, Plus, Trash2 } from 'lucide-react';
import type { FavoriteFood } from '../types';
import { formatLastUsed } from '../utils';

interface FavoriteCardProps {
  favorite: FavoriteFood;
  onAdd: (favorite: FavoriteFood) => void;
  onRemove: (id: string) => void;
  compact?: boolean;
}

export function FavoriteCard({
  favorite,
  onAdd,
  onRemove,
  compact = false,
}: FavoriteCardProps): React.ReactElement {
  if (compact) {
    return (
      <button
        onClick={() => onAdd(favorite)}
        className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-rose-500/20 transition-all group text-left w-full"
      >
        <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center flex-shrink-0">
          <Heart size={14} className="text-rose-400" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-text-primary truncate block">
            {favorite.name}
          </span>
          <span className="text-[10px] text-text-muted">
            {favorite.calories} cal
          </span>
        </div>
        <Plus size={16} className="text-text-muted group-hover:text-rose-400 transition-colors" />
      </button>
    );
  }

  return (
    <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] overflow-hidden hover:border-white/[0.1] transition-all">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center">
              <Heart size={16} className="text-rose-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary line-clamp-1">
                {favorite.name}
              </h4>
              {favorite.brand && (
                <span className="text-[10px] text-text-muted">{favorite.brand}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => onRemove(favorite.id)}
            className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-text-muted hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* Nutrition */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: 'Calories', value: favorite.calories, unit: '' },
            { label: 'Protein', value: favorite.protein, unit: 'g' },
            { label: 'Carbs', value: favorite.carbs, unit: 'g' },
            { label: 'Fat', value: favorite.fat, unit: 'g' },
          ].map(({ label, value, unit }) => (
            <div key={label} className="text-center">
              <span className="text-xs font-bold text-text-primary block">
                {value}{unit}
              </span>
              <span className="text-[9px] text-text-muted">{label}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          <div className="text-[10px] text-text-muted">
            <span className="text-amber-400 font-medium">{favorite.usageCount}x</span> logged
            <span className="mx-1">•</span>
            {formatLastUsed(favorite.lastUsed)}
          </div>
          <button
            onClick={() => onAdd(favorite)}
            className="px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 hover:border-rose-500/40 transition-all flex items-center gap-1"
          >
            <Plus size={12} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
