/**
 * FoodInputForm - Form for entering food nutrition data
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';

interface FoodInputFormProps {
  onSubmit: (food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  }) => void;
  onCancel?: () => void;
}

export function FoodInputForm({ onSubmit, onCancel }: FoodInputFormProps): React.ReactElement {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [sugar, setSugar] = useState('');
  const [sodium, setSodium] = useState('');

  const isValid = name.trim() && calories;

  const handleSubmit = () => {
    if (!isValid) return;

    onSubmit({
      name: name.trim(),
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fat: parseInt(fat) || 0,
      fiber: parseInt(fiber) || 0,
      sugar: parseInt(sugar) || 0,
      sodium: parseInt(sodium) || 0,
    });
  };

  return (
    <div className="space-y-4">
      {/* Food name */}
      <div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Food name (e.g., Grilled Chicken)"
          className="w-full px-4 py-3 rounded-xl text-sm bg-white/[0.02] border border-white/[0.06] text-text-primary placeholder-text-muted focus:outline-none focus:border-emerald-500/30 focus:bg-white/[0.03] transition-all"
        />
      </div>

      {/* Nutrition inputs - 2 column grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: calories, setter: setCalories, label: 'Calories', unit: 'cal', required: true },
          { value: protein, setter: setProtein, label: 'Protein', unit: 'g' },
          { value: carbs, setter: setCarbs, label: 'Carbs', unit: 'g' },
          { value: fat, setter: setFat, label: 'Fat', unit: 'g' },
          { value: fiber, setter: setFiber, label: 'Fiber', unit: 'g' },
          { value: sugar, setter: setSugar, label: 'Sugar', unit: 'g' },
          { value: sodium, setter: setSodium, label: 'Sodium', unit: 'mg' },
        ].map(({ value, setter, label, unit, required }) => (
          <div key={label} className="relative">
            <input
              type="number"
              value={value}
              onChange={(e) => setter(e.target.value)}
              placeholder={label}
              className={`w-full px-4 py-2.5 pr-10 rounded-xl text-sm bg-white/[0.02] border ${
                required && !value ? 'border-amber-500/30' : 'border-white/[0.06]'
              } text-text-primary placeholder-text-muted focus:outline-none focus:border-emerald-500/30 focus:bg-white/[0.03] transition-all`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">
              {unit}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/[0.02] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-all"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          Analyze
        </button>
      </div>
    </div>
  );
}
