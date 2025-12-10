/**
 * FoodItemCard Component
 * Individual food item with expandable edit mode
 */

import { ChevronDown, Plus, Minus } from 'lucide-react';
import type { AnalyzedFood } from '../types';
import { MACRO_CONFIGS } from '../data';

interface FoodItemCardProps {
  item: AnalyzedFood;
  index: number;
  isEditing: boolean;
  onToggleEdit: () => void;
  onUpdate: (updates: Partial<AnalyzedFood>) => void;
  onPortionChange: (newQuantity: number) => void;
  onRemove: () => void;
}

export default function FoodItemCard({
  item,
  index: _index,
  isEditing,
  onToggleEdit,
  onUpdate,
  onPortionChange,
  onRemove,
}: FoodItemCardProps): React.ReactElement {
  return (
    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">{item.name}</span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded ${
                item.confidence >= 0.8
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : item.confidence >= 0.6
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-rose-500/15 text-rose-400'
              }`}
            >
              {Math.round(item.confidence * 100)}%
            </span>
          </div>
          <span className="text-xs text-text-muted">
            {item.quantity} {item.unit}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-amber-400">{item.calories} cal</span>
          <button
            onClick={onToggleEdit}
            className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
          >
            <ChevronDown
              size={14}
              className={`text-text-muted transition-transform duration-200 ${
                isEditing ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expanded edit view */}
      {isEditing && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-3">
          {/* Food name edit */}
          <div>
            <label className="text-xs font-medium text-text-muted mb-1.5 block">Food Name</label>
            <input
              type="text"
              value={item.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-text-primary focus:outline-none focus:border-violet-500/40 transition-colors"
            />
          </div>

          {/* Calories edit */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-text-muted">Calories</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdate({ calories: Math.max(0, item.calories - 10) })}
                className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/[0.06] hover:border-amber-500/30 transition-all"
              >
                <Minus size={14} />
              </button>
              <input
                type="number"
                value={item.calories}
                onChange={(e) => onUpdate({ calories: parseInt(e.target.value) || 0 })}
                className="w-20 px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-center text-sm text-amber-400 font-semibold focus:outline-none focus:border-amber-500/40 transition-colors"
              />
              <button
                onClick={() => onUpdate({ calories: item.calories + 10 })}
                className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/[0.06] hover:border-amber-500/30 transition-all"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Portion controls */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-text-muted">Portion</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPortionChange(Math.max(0.25, item.quantity - 0.25))}
                className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/[0.06] hover:border-violet-500/30 transition-all"
              >
                <Minus size={14} />
              </button>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  value={item.quantity}
                  onChange={(e) => onPortionChange(parseFloat(e.target.value) || 0.25)}
                  className="w-16 px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-center text-sm text-text-primary focus:outline-none focus:border-violet-500/40 transition-colors"
                />
                <span className="text-xs text-text-muted">{item.unit}</span>
              </div>
              <button
                onClick={() => onPortionChange(item.quantity + 0.25)}
                className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/[0.06] hover:border-violet-500/30 transition-all"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Macros edit */}
          <div>
            <label className="text-xs font-medium text-text-muted mb-2 block">Macros (grams)</label>
            <div className="grid grid-cols-4 gap-2">
              {MACRO_CONFIGS.map(({ key, label, borderColor, textColor }) => (
                <div key={key} className="text-center">
                  <input
                    type="number"
                    step="0.1"
                    value={item[key] || 0}
                    onChange={(e) => onUpdate({ [key]: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-center text-sm font-semibold ${textColor} focus:outline-none ${borderColor} transition-colors`}
                  />
                  <div className="text-[9px] text-text-muted mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onRemove}
            className="w-full py-2.5 rounded-lg bg-rose-500/[0.08] border border-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500/[0.15] hover:border-rose-500/30 transition-all"
          >
            Remove Item
          </button>
        </div>
      )}
    </div>
  );
}
