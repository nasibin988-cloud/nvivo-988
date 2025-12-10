/**
 * TargetStep Component
 * Target value configuration for goals
 */

import type { GoalCategory, GoalTemplate } from '../types';
import { customUnitOptions } from '../data';

interface TargetStepProps {
  category: GoalCategory;
  goal: GoalTemplate | null;
  targetValue: number;
  customGoalName: string;
  customGoalUnit: string;
  onTargetChange: (value: number) => void;
  onCustomNameChange: (name: string) => void;
  onCustomUnitChange: (unit: string) => void;
  onConfirm: () => void;
}

export default function TargetStep({
  category,
  goal,
  targetValue,
  customGoalName,
  customGoalUnit,
  onTargetChange,
  onCustomNameChange,
  onCustomUnitChange,
  onConfirm,
}: TargetStepProps): React.ReactElement {
  const isCustom = category.id === 'custom';
  const Icon = goal?.icon ?? category.icon;

  return (
    <div className="space-y-6">
      {/* Goal Preview */}
      <div className={`flex items-center gap-4 p-4 rounded-2xl ${category.bgColor} border ${category.borderColor}`}>
        <div className={`p-3 rounded-xl ${category.bgColor} border ${category.borderColor}`}>
          <Icon size={24} className={category.color} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-text-primary">
            {goal?.name || 'Custom Goal'}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            {goal?.description || 'Create your own weekly goal'}
          </p>
        </div>
      </div>

      {/* Custom Goal Name Input */}
      {isCustom && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Goal Name</label>
          <input
            type="text"
            value={customGoalName}
            onChange={(e) => onCustomNameChange(e.target.value)}
            placeholder="e.g., Read 30 minutes"
            className="w-full px-4 py-3 bg-surface rounded-xl border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-500/50"
          />
        </div>
      )}

      {/* Target Value Slider */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-text-secondary">Weekly Target</label>

        <div className="text-center py-6">
          <span className="text-5xl font-bold text-text-primary">{targetValue}</span>
          <span className="text-xl text-text-muted ml-2">
            {goal?.unit || customGoalUnit}
          </span>
        </div>

        {goal ? (
          <input
            type="range"
            min={goal.minTarget}
            max={goal.maxTarget}
            step={goal.step}
            value={targetValue}
            onChange={(e) => onTargetChange(Number(e.target.value))}
            className="w-full h-2 bg-surface-2 rounded-full appearance-none cursor-pointer accent-teal-500"
          />
        ) : (
          <>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={targetValue}
              onChange={(e) => onTargetChange(Number(e.target.value))}
              className="w-full h-2 bg-surface-2 rounded-full appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex gap-2 mt-4">
              {customUnitOptions.map((unit) => (
                <button
                  key={unit}
                  onClick={() => onCustomUnitChange(unit)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    customGoalUnit === unit
                      ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                      : 'bg-surface border border-border text-text-muted'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </>
        )}

        {goal && (
          <div className="flex justify-between text-xs text-text-muted">
            <span>{goal.minTarget} {goal.unit}</span>
            <span>{goal.maxTarget} {goal.unit}</span>
          </div>
        )}
      </div>

      {/* Add Goal Button */}
      <button
        onClick={onConfirm}
        disabled={isCustom && !customGoalName}
        className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
      >
        Add Goal
      </button>
    </div>
  );
}
