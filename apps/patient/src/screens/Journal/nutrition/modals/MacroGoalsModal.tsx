/**
 * MacroGoalsModal - Modal for editing daily nutrition targets
 * Allows customization of calorie and macro goals
 */

import { useState } from 'react';
import { Target, X, Check, Flame, Beef, Wheat, Droplets, Leaf } from 'lucide-react';
import type { NutritionTargets } from '../../../../hooks/nutrition';

interface MacroGoalsModalProps {
  currentTargets: NutritionTargets;
  onSave: (targets: Partial<NutritionTargets>) => void;
  onClose: () => void;
}

export function MacroGoalsModal({
  currentTargets,
  onSave,
  onClose,
}: MacroGoalsModalProps): React.ReactElement {
  const [protein, setProtein] = useState(currentTargets.protein.toString());
  const [carbs, setCarbs] = useState(currentTargets.carbs.toString());
  const [fat, setFat] = useState(currentTargets.fat.toString());
  const [fiber, setFiber] = useState(currentTargets.fiber.toString());
  const [calories, setCalories] = useState(currentTargets.calories.toString());
  const [water, setWater] = useState(currentTargets.water.toString());

  const handleSave = () => {
    onSave({
      protein: parseInt(protein) || currentTargets.protein,
      carbs: parseInt(carbs) || currentTargets.carbs,
      fat: parseInt(fat) || currentTargets.fat,
      fiber: parseInt(fiber) || currentTargets.fiber,
      calories: parseInt(calories) || currentTargets.calories,
      water: parseInt(water) || currentTargets.water,
    });
    onClose();
  };

  const inputFields = [
    { label: 'Daily Calories', value: calories, setter: setCalories, unit: 'cal', color: 'emerald', icon: Flame },
    { label: 'Protein', value: protein, setter: setProtein, unit: 'g', color: 'rose', icon: Beef },
    { label: 'Carbs', value: carbs, setter: setCarbs, unit: 'g', color: 'amber', icon: Wheat },
    { label: 'Fat', value: fat, setter: setFat, unit: 'g', color: 'blue', icon: Droplets },
    { label: 'Fiber', value: fiber, setter: setFiber, unit: 'g', color: 'emerald', icon: Leaf },
    { label: 'Water', value: water, setter: setWater, unit: 'glasses', color: 'cyan', icon: Droplets },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20">
              <Target size={18} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Nutrition Goals</h2>
              <p className="text-xs text-text-muted">Set your daily targets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {inputFields.map(({ label, value, setter, unit, color, icon: IconComponent }) => (
            <div key={label} className="space-y-2">
              <label className="text-xs font-medium text-text-muted flex items-center gap-2">
                <IconComponent size={12} className={`text-${color}-400`} />
                {label}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="w-full px-4 py-3 pr-16 rounded-xl text-sm bg-white/[0.03] border border-white/[0.06] text-text-primary placeholder-text-muted focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-muted">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/[0.06] shrink-0">
          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-xl font-semibold text-sm bg-white/[0.06] border border-emerald-500/30 text-emerald-400 transition-all duration-300 hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Check size={16} />
            Save Goals
          </button>
        </div>
      </div>
    </div>
  );
}
