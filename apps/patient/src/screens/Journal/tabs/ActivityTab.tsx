/**
 * Activity Tab
 * Exercise tracking with intensity levels, weekly stats, and workout history
 */

import { useState } from 'react';
import { ViewToggle } from '@nvivo/ui';
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
      <ViewToggle
        options={[
          { value: 'today', label: 'Today' },
          { value: 'week', label: 'This Week' },
        ]}
        value={view}
        onChange={setView}
        color="sky"
        variant="solid"
      />

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
