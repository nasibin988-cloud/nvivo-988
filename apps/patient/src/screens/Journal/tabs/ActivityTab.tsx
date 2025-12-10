/**
 * Activity Tab
 * Exercise tracking with intensity levels, weekly stats, and workout history
 */

import { useState } from 'react';
import {
  type ExerciseLog,
  type ViewMode,
  type WeeklyStats,
  mockExercises,
  mockWeeklyStats,
  mockWeeklyData,
  LogExerciseModal,
  TodayView,
  WeekView,
} from './activity-tab';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ActivityTab(): React.ReactElement {
  const [view, setView] = useState<ViewMode>('today');
  const [exercises, setExercises] = useState<ExerciseLog[]>(mockExercises);
  const [showLogModal, setShowLogModal] = useState(false);
  const [stats] = useState<WeeklyStats>(mockWeeklyStats);

  const handleSaveExercise = (exercise: Partial<ExerciseLog>): void => {
    const newExercise: ExerciseLog = {
      id: Date.now().toString(),
      name: exercise.name || 'Exercise',
      type: exercise.type || 'other',
      duration: exercise.duration || 0,
      calories: exercise.calories || 0,
      intensity: exercise.intensity || 'moderate',
      time: exercise.time || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
    setExercises((prev) => [...prev, newExercise]);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* View Toggle */}
      <div className="flex bg-surface-2 rounded-xl p-1">
        <button
          onClick={() => setView('today')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            view === 'today'
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setView('week')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            view === 'week'
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          This Week
        </button>
      </div>

      {/* View Content */}
      {view === 'today' ? (
        <TodayView exercises={exercises} onLogExercise={() => setShowLogModal(true)} />
      ) : (
        <WeekView stats={stats} weeklyData={mockWeeklyData} />
      )}

      {/* Log Modal */}
      {showLogModal && (
        <LogExerciseModal onClose={() => setShowLogModal(false)} onSave={handleSaveExercise} />
      )}
    </div>
  );
}
