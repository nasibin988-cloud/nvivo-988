/**
 * Today View Component
 * Shows today's medications grouped by status
 */

import { AlertCircle, Clock, Check, Pill } from 'lucide-react';
import type { Medication } from '../types';
import { MedicationCard } from './MedicationCard';
import { TodaySummary } from './TodaySummary';

interface TodayViewProps {
  medications: Medication[];
  onMarkTaken: (id: string) => void;
  onMarkMissed: (id: string) => void;
}

export function TodayView({
  medications,
  onMarkTaken,
  onMarkMissed,
}: TodayViewProps): React.ReactElement {
  const takenCount = medications.filter((m) => m.status === 'taken').length;
  const totalCount = medications.length;
  const adherencePercentage = Math.round((takenCount / totalCount) * 100);

  const pendingMeds = medications.filter((m) => m.status === 'pending');
  const upcomingMeds = medications.filter((m) => m.status === 'upcoming');
  const completedMeds = medications.filter((m) => m.status === 'taken' || m.status === 'missed');

  if (medications.length === 0) {
    return (
      <div className="text-center py-10 bg-surface rounded-2xl border border-border">
        <Pill size={40} className="mx-auto text-text-muted mb-3" />
        <p className="text-sm text-text-muted">No medications scheduled</p>
        <p className="text-xs text-text-muted">Your medications will appear here</p>
      </div>
    );
  }

  return (
    <>
      {/* Today's Summary */}
      <TodaySummary taken={takenCount} total={totalCount} percentage={adherencePercentage} />

      {/* Pending Medications */}
      {pendingMeds.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <AlertCircle size={14} />
            Due Now ({pendingMeds.length})
          </h4>
          {pendingMeds.map((med) => (
            <MedicationCard
              key={med.id}
              medication={med}
              onMarkTaken={onMarkTaken}
              onMarkMissed={onMarkMissed}
            />
          ))}
        </div>
      )}

      {/* Upcoming Medications */}
      {upcomingMeds.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
            <Clock size={14} />
            Coming Up ({upcomingMeds.length})
          </h4>
          {upcomingMeds.map((med) => (
            <MedicationCard
              key={med.id}
              medication={med}
              onMarkTaken={onMarkTaken}
              onMarkMissed={onMarkMissed}
            />
          ))}
        </div>
      )}

      {/* Completed Medications */}
      {completedMeds.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-text-muted flex items-center gap-2">
            <Check size={14} />
            Completed ({completedMeds.length})
          </h4>
          {completedMeds.map((med) => (
            <MedicationCard
              key={med.id}
              medication={med}
              onMarkTaken={onMarkTaken}
              onMarkMissed={onMarkMissed}
            />
          ))}
        </div>
      )}
    </>
  );
}
