/**
 * Log Exercise Modal Component
 * Modal for logging new exercise entries
 */

import { useState } from 'react';
import { X } from 'lucide-react';
import type { ExerciseLog, ExerciseType, Intensity } from '../types';
import { exerciseTypes, intensityConfig } from '../data';

interface LogExerciseModalProps {
  onClose: () => void;
  onSave: (exercise: Partial<ExerciseLog>) => void;
}

export function LogExerciseModal({ onClose, onSave }: LogExerciseModalProps): React.ReactElement {
  const [name, setName] = useState('');
  const [type, setType] = useState<ExerciseType>('cardio');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [intensity, setIntensity] = useState<Intensity>('moderate');

  const handleSave = (): void => {
    if (!name.trim() || !duration) return;
    onSave({
      name: name.trim(),
      type,
      duration: parseInt(duration),
      calories: calories ? parseInt(calories) : Math.round(parseInt(duration) * 8),
      intensity,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface rounded-2xl border border-white/[0.08] overflow-hidden max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-border flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-text-primary">Log Exercise</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface-2 border border-border text-text-muted hover:text-text-primary transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Activity Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Activity</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Run, Yoga Session"
              className="w-full px-4 py-3 rounded-xl text-sm bg-surface-2 border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-sky-500/50"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Type</label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(exerciseTypes) as ExerciseType[]).map((t) => {
                const config = exerciseTypes[t];
                const Icon = config.icon;
                const isSelected = type === t;
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? `bg-${config.color}-500/20 border border-${config.color}-500/30 text-${config.color}-400`
                        : 'bg-surface-2 border border-border text-text-muted hover:bg-surface'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-[9px] font-medium">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration & Calories */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Duration</label>
              <div className="relative">
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm bg-surface-2 border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-sky-500/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">min</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Calories (opt)</label>
              <div className="relative">
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="Auto"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm bg-surface-2 border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-amber-500/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">cal</span>
              </div>
            </div>
          </div>

          {/* Intensity */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Intensity</label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'moderate', 'high'] as Intensity[]).map((i) => {
                const conf = intensityConfig[i];
                const isSelected = intensity === i;
                return (
                  <button
                    key={i}
                    onClick={() => setIntensity(i)}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all border ${
                      isSelected ? conf.bgColor + ' ' + conf.color : 'bg-surface-2 border-border text-text-muted hover:bg-surface'
                    }`}
                  >
                    {conf.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border shrink-0">
          <button
            onClick={handleSave}
            disabled={!name.trim() || !duration}
            className="w-full py-3.5 rounded-2xl font-bold text-base bg-gradient-to-r from-sky-500 to-blue-500 text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-sky-500/25"
          >
            Save Exercise
          </button>
        </div>
      </div>
    </div>
  );
}
