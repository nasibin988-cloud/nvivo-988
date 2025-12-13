/**
 * MenuItemCard - Selectable menu item with nutrition details
 */

import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { MenuItem } from '../types';
import { formatPrice, getConfidenceColor, getConfidenceBg, formatConfidence } from '../utils';
import FoodIntelligencePanel from '../../shared/FoodIntelligencePanel';

interface MenuItemCardProps {
  item: MenuItem;
  onToggle: () => void;
  onUpdateNutrition?: (updates: Partial<MenuItem>) => void;
  /** User's nutrition focus for intelligence display */
  userFocus?: string;
}

export function MenuItemCard({
  item,
  onToggle,
  userFocus = 'balanced',
}: MenuItemCardProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        item.isSelected
          ? 'bg-teal-500/[0.08] border-teal-500/30'
          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.03]'
      }`}
    >
      {/* Main row - clickable to select */}
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-start gap-3 text-left"
      >
        {/* Selection checkbox */}
        <div
          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
            item.isSelected
              ? 'bg-teal-500 text-white'
              : 'bg-white/[0.04] border border-white/[0.1]'
          }`}
        >
          {item.isSelected && <Check size={12} strokeWidth={3} />}
        </div>

        {/* Item details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-text-primary line-clamp-2">
              {item.name}
            </h4>
            {item.price && (
              <span className="text-xs font-medium text-emerald-400 flex-shrink-0">
                {formatPrice(item.price)}
              </span>
            )}
          </div>

          {item.description && (
            <p className="text-xs text-text-muted mt-1 line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Quick nutrition preview */}
          <div className="flex items-center gap-3 mt-2">
            {item.calories && (
              <span className="text-xs font-bold text-amber-400">
                {item.calories} cal
              </span>
            )}
            {/* Confidence badge */}
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${getConfidenceBg(item.confidence)} ${getConfidenceColor(item.confidence)}`}
            >
              {formatConfidence(item.confidence)} match
            </span>
          </div>
        </div>

        {/* Expand button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all"
        >
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </button>

      {/* Expanded nutrition details */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-white/[0.04]">
          <div className="pt-3 grid grid-cols-4 gap-2">
            {[
              { key: 'protein' as const, label: 'Protein', color: 'text-rose-400', unit: 'g' },
              { key: 'carbs' as const, label: 'Carbs', color: 'text-amber-400', unit: 'g' },
              { key: 'fat' as const, label: 'Fat', color: 'text-blue-400', unit: 'g' },
              { key: 'fiber' as const, label: 'Fiber', color: 'text-emerald-400', unit: 'g' },
            ].map(({ key, label, color, unit }) => (
              <div key={key} className="text-center">
                <span className={`text-sm font-bold ${color}`}>
                  {item[key] || 0}{unit}
                </span>
                <span className="text-[9px] text-text-muted block">{label}</span>
              </div>
            ))}
          </div>

          {/* Additional nutrients */}
          <div className="mt-2 pt-2 border-t border-white/[0.04] grid grid-cols-2 gap-2">
            <div className="text-center">
              <span className="text-xs font-bold text-purple-400">
                {item.sugar || 0}g
              </span>
              <span className="text-[9px] text-text-muted block">Sugar</span>
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-red-400">
                {item.sodium || 0}mg
              </span>
              <span className="text-[9px] text-text-muted block">Sodium</span>
            </div>
          </div>

          {/* Note about estimates */}
          <p className="mt-3 text-[10px] text-text-muted/70 text-center italic">
            Nutrition values are AI estimates. Tap values to edit.
          </p>

          {/* Food Intelligence Panel */}
          {item.intelligence && (
            <FoodIntelligencePanel
              intelligence={item.intelligence}
              userFocus={userFocus}
            />
          )}
        </div>
      )}
    </div>
  );
}
