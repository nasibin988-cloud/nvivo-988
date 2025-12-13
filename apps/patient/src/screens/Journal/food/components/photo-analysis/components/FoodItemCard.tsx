/**
 * FoodItemCard Component
 * Individual food item with expandable edit mode
 */

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, Minus } from 'lucide-react';
import type { AnalyzedFood, FoodIngredient, WellnessFocus } from '../types';
import { MACRO_CONFIGS, PHOTO_ANALYSIS_FEATURES } from '../data';
import FoodIntelligencePanel from '../../shared/FoodIntelligencePanel';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  step?: number;
  min?: number;
}

/**
 * Ingredient breakdown display (only shown when feature is enabled and ingredients exist)
 */
function IngredientsList({ ingredients }: { ingredients: FoodIngredient[] }): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-2 pt-2 border-t border-white/[0.04]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
      >
        <ChevronRight
          size={12}
          className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
        />
        <span>Ingredients ({ingredients.length})</span>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-1.5">
          {ingredients.map((ing, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/[0.02]"
            >
              <div className="flex-1">
                <span className="text-xs text-text-secondary">{ing.name}</span>
                <span className="text-[10px] text-text-muted ml-1.5">
                  {ing.quantity}{ing.unit}
                  {ing.percentOfDish && ` (${ing.percentOfDish}%)`}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-amber-400">{ing.calories}</span>
                <span className="text-blue-400">P{ing.protein}</span>
                <span className="text-emerald-400">C{ing.carbs}</span>
                <span className="text-rose-400">F{ing.fat}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
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

interface FoodItemCardProps {
  item: AnalyzedFood;
  index: number;
  isEditing: boolean;
  onToggleEdit: () => void;
  onUpdate: (updates: Partial<AnalyzedFood>) => void;
  onPortionChange: (newQuantity: number) => void;
  onRemove: () => void;
  /** User's nutrition focus for intelligence grade display */
  userFocus?: WellnessFocus;
}

export default function FoodItemCard({
  item,
  index: _index,
  isEditing,
  onToggleEdit,
  onUpdate,
  onPortionChange,
  onRemove,
  userFocus = 'balanced',
}: FoodItemCardProps): React.ReactElement {
  return (
    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="text-sm font-semibold text-text-primary">
            {item.name}{' '}
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded inline ${
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

      {/* Food Intelligence Panel - shown when v2 grading/insight or legacy intelligence data is available */}
      {(item.grading || item.insight || item.intelligence) && (
        <FoodIntelligencePanel
          intelligence={item.intelligence}
          grading={item.grading}
          insight={item.insight}
          userFocus={userFocus}
          compact={!isEditing}
        />
      )}

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

          {/* Ingredient breakdown (only shown when feature enabled and ingredients exist) */}
          {PHOTO_ANALYSIS_FEATURES.INGREDIENT_BREAKDOWN && item.ingredients && item.ingredients.length > 0 && (
            <IngredientsList ingredients={item.ingredients} />
          )}

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
