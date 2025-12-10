/**
 * EditMealModal - Modal for editing an existing meal
 * Pre-populated with existing meal data
 */

import { useState } from 'react';
import { Pencil, X, Check, Loader2 } from 'lucide-react';
import type { FoodLog, MealType } from '../../../../hooks/nutrition';
import { mealConfig, getMealAccentColor } from '../types';

interface EditMealModalProps {
  meal: FoodLog;
  onClose: () => void;
  onSave: (updates: Partial<FoodLog> & { id: string }) => void;
  isSaving: boolean;
}

export function EditMealModal({
  meal,
  onClose,
  onSave,
  isSaving,
}: EditMealModalProps): React.ReactElement {
  const [mealType, setMealType] = useState<MealType>(meal.mealType);
  const [description, setDescription] = useState(meal.description);
  const [calories, setCalories] = useState(meal.calories?.toString() ?? '');
  const [protein, setProtein] = useState(meal.protein?.toString() ?? '');
  const [carbs, setCarbs] = useState(meal.carbs?.toString() ?? '');
  const [fat, setFat] = useState(meal.fat?.toString() ?? '');
  const [fiber, setFiber] = useState(meal.fiber?.toString() ?? '');

  const handleSave = () => {
    if (!description.trim()) return;
    onSave({
      id: meal.id,
      mealType,
      description: description.trim(),
      calories: calories ? parseInt(calories) : null,
      protein: protein ? parseFloat(protein) : null,
      carbs: carbs ? parseFloat(carbs) : null,
      fat: fat ? parseFloat(fat) : null,
      fiber: fiber ? parseFloat(fiber) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.04] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Pencil size={18} className="text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Edit Meal</h2>
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
              className="w-full h-20 px-4 py-3 rounded-xl text-sm bg-white/[0.02] border border-white/[0.04] text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-blue-500/30 focus:bg-white/[0.03] transition-all"
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
              ].map(({ value, setter, placeholder, unit }) => (
                <div key={placeholder} className="relative">
                  <input
                    type="number"
                    step={unit === 'cal' ? '1' : '0.1'}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm bg-white/[0.02] border border-white/[0.04] text-text-primary placeholder-text-muted focus:outline-none focus:border-blue-500/30 focus:bg-white/[0.03] transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">{unit}</span>
                </div>
              ))}
            </div>
            {/* Fiber field */}
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={fiber}
                onChange={(e) => setFiber(e.target.value)}
                placeholder="Fiber"
                className="w-full px-4 py-3 pr-12 rounded-xl text-sm bg-white/[0.02] border border-white/[0.04] text-text-primary placeholder-text-muted focus:outline-none focus:border-blue-500/30 focus:bg-white/[0.03] transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">g</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/[0.04] shrink-0">
          <button
            onClick={handleSave}
            disabled={!description.trim() || isSaving}
            className="w-full py-3.5 rounded-xl font-semibold text-sm bg-white/[0.06] border border-blue-500/30 text-blue-400 transition-all duration-300 hover:bg-blue-500/10 hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
