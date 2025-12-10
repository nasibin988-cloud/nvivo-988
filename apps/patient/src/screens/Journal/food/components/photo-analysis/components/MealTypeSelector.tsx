/**
 * MealTypeSelector Component
 * Meal type and time selection
 */

import { Clock } from 'lucide-react';
import type { MealType } from '../types';
import { MEAL_TYPES, getMealTypeColor } from '../data';

interface MealTypeSelectorProps {
  selectedMealType: MealType;
  eatenAt: string;
  onMealTypeChange: (type: MealType) => void;
  onTimeChange: (time: string) => void;
}

export default function MealTypeSelector({
  selectedMealType,
  eatenAt,
  onMealTypeChange,
  onTimeChange,
}: MealTypeSelectorProps): React.ReactElement {
  const setNow = (): void => {
    const now = new Date();
    onTimeChange(
      `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    );
  };

  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-4">
      {/* Meal Type */}
      <div>
        <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">
          Meal Type
        </label>
        <div className="grid grid-cols-4 gap-2">
          {MEAL_TYPES.map(({ type, label, icon: Icon, color }) => (
            <button
              key={type}
              onClick={() => onMealTypeChange(type)}
              className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-medium transition-all ${
                selectedMealType === type
                  ? ''
                  : 'bg-white/[0.02] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.04]'
              }`}
              style={
                selectedMealType === type
                  ? {
                      backgroundColor: getMealTypeColor(color, 'bg'),
                      borderWidth: 1,
                      borderStyle: 'solid',
                      borderColor: getMealTypeColor(color, 'border'),
                      color: getMealTypeColor(color, 'text'),
                    }
                  : {}
              }
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Time */}
      <div>
        <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">
          Time Eaten
        </label>
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="time"
              value={eatenAt}
              onChange={(e) => onTimeChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-text-primary focus:outline-none focus:border-violet-500/40 transition-colors [color-scheme:dark]"
            />
          </div>
          <button
            onClick={setNow}
            className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-text-muted text-sm font-medium hover:text-text-primary hover:bg-white/[0.06] transition-all"
          >
            Now
          </button>
        </div>
      </div>
    </div>
  );
}
