/**
 * Medications Tab
 * Medication adherence tracking, scheduling, and history
 */

import { useState } from 'react';
import { ViewToggle } from '@nvivo/ui';
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
      <ViewToggle
        options={[
          { value: 'today', label: 'Today' },
          { value: 'history', label: 'History' },
        ]}
        value={view}
        onChange={setView}
        color="rose"
        variant="solid"
      />

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
