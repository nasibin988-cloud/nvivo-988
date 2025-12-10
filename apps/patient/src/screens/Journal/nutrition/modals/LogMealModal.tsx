/**
 * LogMealModal - Modal for logging a new meal
 * Supports meal type selection, description, and optional macros
 */

import { useState } from 'react';
import { Plus, X, Check, Loader2 } from 'lucide-react';
import type { FoodLog, MealType } from '../../../../hooks/nutrition';
import { mealConfig, getMealAccentColor } from '../types';

interface LogMealModalProps {
  onClose: () => void;
  onSave: (meal: Omit<FoodLog, 'id' | 'createdAt' | 'updatedAt'>) => void;
  isSaving: boolean;
}

export function LogMealModal({
  onClose,
  onSave,
  isSaving,
}: LogMealModalProps): React.ReactElement {
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [sugar, setSugar] = useState('');
  const [sodium, setSodium] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSave = () => {
    if (!description.trim()) return;
    onSave({
      mealType,
      description: description.trim(),
      date: today,
      calories: calories ? parseInt(calories) : null,
      protein: protein ? parseInt(protein) : null,
      carbs: carbs ? parseInt(carbs) : null,
      fat: fat ? parseInt(fat) : null,
      fiber: fiber ? parseInt(fiber) : null,
      sugar: sugar ? parseInt(sugar) : null,
      sodium: sodium ? parseInt(sodium) : null,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.04] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <Plus size={18} className="text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Log Meal</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.04] text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Meal Type */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Meal Type</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(mealConfig) as MealType[]).map((type) => {
                const config = mealConfig[type];
                const IconComponent = config.icon;
                const isSelected = mealType === type;
                const accentColor = getMealAccentColor(type);
                return (
                  <button
                    key={type}
                    onClick={() => setMealType(type)}
                    className={`p-3 rounded-xl flex flex-col items-center gap-1.5 transition-all duration-300 ${
                      isSelected
                        ? 'bg-white/[0.08] border border-white/[0.15] text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                        : 'bg-white/[0.02] border border-white/[0.04] text-text-muted hover:bg-white/[0.04]'
                    }`}
                  >
                    <IconComponent size={18} className={isSelected ? accentColor : ''} />
                    <span className="text-[10px] font-medium">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider">What did you eat?</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Grilled chicken with vegetables and rice"
              className="w-full h-20 px-4 py-3 rounded-xl text-sm bg-white/[0.02] border border-white/[0.04] text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-emerald-500/30 focus:bg-white/[0.03] transition-all"
            />
          </div>

          {/* Macros */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider">Nutrition (optional)</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: calories, setter: setCalories, placeholder: 'Calories', unit: 'cal' },
                { value: protein, setter: setProtein, placeholder: 'Protein', unit: 'g' },
                { value: carbs, setter: setCarbs, placeholder: 'Carbs', unit: 'g' },
                { value: fat, setter: setFat, placeholder: 'Fat', unit: 'g' },
                { value: fiber, setter: setFiber, placeholder: 'Fiber', unit: 'g' },
                { value: sugar, setter: setSugar, placeholder: 'Sugar', unit: 'g' },
                { value: sodium, setter: setSodium, placeholder: 'Sodium', unit: 'mg' },
              ].map(({ value, setter, placeholder, unit }) => (
                <div key={placeholder} className="relative">
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm bg-white/[0.02] border border-white/[0.04] text-text-primary placeholder-text-muted focus:outline-none focus:border-emerald-500/30 focus:bg-white/[0.03] transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">{unit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/[0.04] shrink-0">
          <button
            onClick={handleSave}
            disabled={!description.trim() || isSaving}
            className="w-full py-3.5 rounded-xl font-semibold text-sm bg-white/[0.06] border border-emerald-500/30 text-emerald-400 transition-all duration-300 hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={16} />
                Save Meal
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
