/**
 * Exercise Card Component
 * Displays an exercise entry with details
 */

import { Clock, Flame, Heart, Sparkles } from 'lucide-react';
import type { ExerciseLog } from '../types';
import { exerciseTypes, intensityConfig } from '../data';

interface ExerciseCardProps {
  exercise: ExerciseLog;
}

export function ExerciseCard({ exercise }: ExerciseCardProps): React.ReactElement {
  const typeConfig = exerciseTypes[exercise.type];
  const intensityConf = intensityConfig[exercise.intensity];
  const Icon = typeConfig.icon;

  return (
    <div className="bg-surface rounded-2xl border border-border p-4">
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-xl bg-${typeConfig.color}-500/15 text-${typeConfig.color}-400`}>
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-text-primary">{exercise.name}</span>
            {exercise.isAutoDetected && (
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[9px] font-bold flex items-center gap-0.5">
                <Sparkles size={8} />
                Auto
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-text-muted">
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {exercise.time}
            </span>
            <span className="flex items-center gap-1">
              <Flame size={10} className="text-amber-400" />
              {exercise.calories} cal
            </span>
            {exercise.heartRateAvg && (
              <span className="flex items-center gap-1">
                <Heart size={10} className="text-rose-400" />
                {exercise.heartRateAvg} bpm
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-text-primary">{exercise.duration}</span>
          <span className="text-xs text-text-muted block">min</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${intensityConf.bgColor} ${intensityConf.color}`}>
            {intensityConf.label} Intensity
          </span>
          <span className="px-2 py-1 rounded-lg text-[10px] font-medium bg-surface-2 text-text-muted">
            {typeConfig.label}
          </span>
        </div>
        <div className="flex gap-1">
          {['low', 'moderate', 'high'].map((level) => (
            <div
              key={level}
              className={`w-1.5 h-4 rounded-full transition-all ${
                (level === 'low' && ['low', 'moderate', 'high'].includes(exercise.intensity)) ||
                (level === 'moderate' && ['moderate', 'high'].includes(exercise.intensity)) ||
                (level === 'high' && exercise.intensity === 'high')
                  ? level === 'low' ? 'bg-emerald-400' : level === 'moderate' ? 'bg-amber-400' : 'bg-rose-400'
                  : 'bg-surface-2'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
