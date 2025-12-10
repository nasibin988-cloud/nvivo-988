/**
 * Medications Tab
 * Medication adherence tracking, scheduling, and history
 */

import { useState } from 'react';
import {
  type Medication,
  type MedicationStatus,
  type ViewMode,
  mockMedications,
  mock14DayData,
  mockAdherenceHistory,
  TodayView,
  HistoryView,
} from './medications-tab';

export default function MedicationsTab(): React.ReactElement {
  const [view, setView] = useState<ViewMode>('today');
  const [medications, setMedications] = useState<Medication[]>(mockMedications);

  const handleMarkTaken = (id: string): void => {
    setMedications((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: 'taken' as MedicationStatus,
              takenAt: new Date().toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              }),
            }
          : m
      )
    );
  };

  const handleMarkMissed = (id: string): void => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'missed' as MedicationStatus } : m))
    );
  };

  return (
    <div className="space-y-4 pb-4">
      {/* View Toggle */}
      <div className="flex bg-surface-2 rounded-xl p-1">
        <button
          onClick={() => setView('today')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            view === 'today'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setView('history')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            view === 'history'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          History
        </button>
      </div>

      {view === 'today' ? (
        <TodayView
          medications={medications}
          onMarkTaken={handleMarkTaken}
          onMarkMissed={handleMarkMissed}
        />
      ) : (
        <HistoryView adherenceData={mock14DayData} weeklyData={mockAdherenceHistory} />
      )}
    </div>
  );
}
