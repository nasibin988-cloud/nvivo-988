/**
 * Today View Component
 * Shows today's activity summary, quick actions, and exercise list
 */

import {
  Dumbbell,
  Flame,
  Clock,
  Plus,
  Footprints,
  Bike,
  Waves,
} from 'lucide-react';
import type { ExerciseLog } from '../types';
import { ExerciseCard } from './ExerciseCard';
import { QuickActivityButton } from './QuickActivityButton';

interface TodayViewProps {
  exercises: ExerciseLog[];
  onLogExercise: () => void;
}

export function TodayView({ exercises, onLogExercise }: TodayViewProps): React.ReactElement {
  const todayMinutes = exercises.reduce((sum, e) => sum + e.duration, 0);
  const todayCalories = exercises.reduce((sum, e) => sum + e.calories, 0);

  return (
    <>
      {/* Today's Summary */}
      <div className="bg-surface rounded-2xl border border-border p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <h3 className="text-lg font-bold text-text-primary mb-1">Today&apos;s Activity</h3>
          <p className="text-xs text-text-muted mb-4">Keep moving, stay healthy</p>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-sky-500/15 flex items-center justify-center">
                <Clock size={20} className="text-sky-400" />
              </div>
              <span className="text-xl font-bold text-text-primary">{todayMinutes}</span>
              <span className="text-[10px] text-text-muted block">Minutes</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-amber-500/15 flex items-center justify-center">
                <Flame size={20} className="text-amber-400" />
              </div>
              <span className="text-xl font-bold text-text-primary">{todayCalories}</span>
              <span className="text-[10px] text-text-muted block">Calories</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <Dumbbell size={20} className="text-emerald-400" />
              </div>
              <span className="text-xl font-bold text-text-primary">{exercises.length}</span>
              <span className="text-[10px] text-text-muted block">Workouts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Activities */}
      <div className="grid grid-cols-4 gap-2">
        <QuickActivityButton
          icon={<Footprints size={18} className="text-rose-400" />}
          label="Walk"
          color="bg-rose-500/15"
          onClick={onLogExercise}
        />
        <QuickActivityButton
          icon={<Bike size={18} className="text-blue-400" />}
          label="Cycle"
          color="bg-blue-500/15"
          onClick={onLogExercise}
        />
        <QuickActivityButton
          icon={<Waves size={18} className="text-purple-400" />}
          label="Yoga"
          color="bg-purple-500/15"
          onClick={onLogExercise}
        />
        <QuickActivityButton
          icon={<Dumbbell size={18} className="text-emerald-400" />}
          label="Gym"
          color="bg-emerald-500/15"
          onClick={onLogExercise}
        />
      </div>

      {/* Log Button */}
      <button
        onClick={onLogExercise}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-sky-500/20 to-blue-500/20 border border-sky-500/30 text-sky-400 hover:from-sky-500/30 hover:to-blue-500/30 transition-all"
      >
        <Plus size={18} />
        <span className="text-sm font-semibold">Log Exercise</span>
      </button>

      {/* Today's Exercises */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Dumbbell size={14} className="text-sky-400" />
          Today&apos;s Workouts
        </h4>
        {exercises.length === 0 ? (
          <div className="text-center py-10 bg-surface rounded-2xl border border-border">
            <Dumbbell size={40} className="mx-auto text-text-muted mb-3" />
            <p className="text-sm text-text-muted">No workouts logged yet</p>
            <p className="text-xs text-text-muted">Get moving and track your progress!</p>
          </div>
        ) : (
          exercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))
        )}
      </div>
    </>
  );
}
