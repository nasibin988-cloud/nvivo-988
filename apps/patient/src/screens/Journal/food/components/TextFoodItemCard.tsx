/**
 * TextFoodItemCard Component
 * Individual food item card for text analysis (no confidence badge)
 * Based on FoodItemCard from photo-analysis
 */

import { useState, useEffect } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import type { AnalyzedFood } from './photo-analysis/types';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  step?: number;
  min?: number;
}

function NumberInput({ value, onChange, className, step = 1, min = 0 }: NumberInputProps): React.ReactElement {
  const [localValue, setLocalValue] = useState(String(value));

  useEffect(() => {
    setLocalValue(String(value));
  }, [value]);

  return (
    <input
      type="text"
      inputMode="decimal"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => {
        const parsed = parseFloat(localValue);
        if (!isNaN(parsed) && parsed >= min) {
          onChange(step < 1 ? Math.round(parsed * 10) / 10 : Math.round(parsed));
        } else {
          onChange(min);
          setLocalValue(String(min));
        }
      }}
      className={className}
    />
  );
}

const MACRO_CONFIGS = [
  { key: 'protein', label: 'Protein', borderColor: 'focus:border-blue-500/40', textColor: 'text-blue-400' },
  { key: 'carbs', label: 'Carbs', borderColor: 'focus:border-emerald-500/40', textColor: 'text-emerald-400' },
  { key: 'fat', label: 'Fat', borderColor: 'focus:border-rose-500/40', textColor: 'text-rose-400' },
  { key: 'fiber', label: 'Fiber', borderColor: 'focus:border-teal-500/40', textColor: 'text-teal-400' },
] as const;

interface TextFoodItemCardProps {
  item: AnalyzedFood;
  index: number;
  isEditing: boolean;
  onToggleEdit: () => void;
  onUpdate: (updates: Partial<AnalyzedFood>) => void;
  onPortionChange: (newQuantity: number) => void;
  onRemove: () => void;
}

export default function TextFoodItemCard({
  item,
  index: _index,
  isEditing,
  onToggleEdit,
  onUpdate,
  onPortionChange,
  onRemove,
}: TextFoodItemCardProps): React.ReactElement {
  return (
    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="text-sm font-semibold text-text-primary">
            {item.name}
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
              <NumberInput
                value={item.calories}
                onChange={(val) => onUpdate({ calories: val })}
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
            <label className="text-xs font-medium text-text-muted">Portion ({item.unit})</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPortionChange(Math.max(0.25, item.quantity - 0.25))}
                className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/[0.06] hover:border-violet-500/30 transition-all"
              >
                <Minus size={14} />
              </button>
              <div
                className="w-20 px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-center text-sm text-text-primary"
              >
                {item.quantity}
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
          <div className="pt-2">
            <label className="text-xs font-medium text-text-muted mb-2 block">Macros (g)</label>
            <div className="grid grid-cols-4 gap-2">
              {MACRO_CONFIGS.map(({ key, label, borderColor, textColor }) => (
                <div key={key} className="text-center">
                  <NumberInput
                    value={(item[key] as number) || 0}
                    onChange={(val) => onUpdate({ [key]: val })}
                    step={0.1}
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
