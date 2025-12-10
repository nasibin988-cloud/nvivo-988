/**
 * Medication Card Component
 * Displays a medication with status and actions
 */

import { useState } from 'react';
import { Clock, Check, X, ChevronDown, Bell, Info, Target } from 'lucide-react';
import type { Medication } from '../types';
import { statusConfig } from '../data';

interface MedicationCardProps {
  medication: Medication;
  onMarkTaken: (id: string) => void;
  onMarkMissed: (id: string) => void;
}

export function MedicationCard({
  medication,
  onMarkTaken,
  onMarkMissed,
}: MedicationCardProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = statusConfig[medication.status];

  return (
    <div
      className={`bg-surface rounded-2xl border ${medication.status === 'pending' ? 'border-amber-500/30' : 'border-border'} overflow-hidden`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox / Status */}
          {medication.status === 'pending' ? (
            <button
              onClick={() => onMarkTaken(medication.id)}
              className="w-10 h-10 rounded-xl border-2 border-amber-500/50 flex items-center justify-center hover:bg-amber-500/15 transition-all group shrink-0"
            >
              <Check size={18} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ) : medication.status === 'taken' ? (
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Check size={18} className="text-emerald-400" />
            </div>
          ) : medication.status === 'missed' ? (
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
              <X size={18} className="text-rose-400" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Clock size={18} className="text-blue-400" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className={`text-sm font-semibold ${medication.status === 'taken' ? 'text-text-muted line-through' : 'text-text-primary'}`}
              >
                {medication.name}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${config.bgColor} ${config.color}`}>
                {config.label}
              </span>
            </div>
            <p className="text-xs text-text-muted">
              {medication.dosage} &bull; {medication.frequency}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[11px] text-text-muted flex items-center gap-1">
                <Clock size={10} />
                {medication.scheduledTime}
              </span>
              {medication.takenAt && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Check size={10} />
                  Taken at {medication.takenAt}
                </span>
              )}
            </div>
          </div>

          {/* Expand Button */}
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded-lg hover:bg-surface-2 transition-all">
            <ChevronDown
              size={16}
              className={`text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Actions for pending */}
        {medication.status === 'pending' && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-border">
            <button
              onClick={() => onMarkTaken(medication.id)}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-500/25 transition-all"
            >
              <Check size={14} />
              Mark as Taken
            </button>
            <button
              onClick={() => onMarkMissed(medication.id)}
              className="py-2.5 px-4 rounded-xl bg-surface-2 border border-border text-text-muted text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-surface hover:text-text-primary transition-all"
            >
              <X size={14} />
              Skip
            </button>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border mt-0">
          <div className="pt-3 space-y-2">
            {medication.instructions && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-surface-2">
                <Info size={14} className="text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-0.5">Instructions</span>
                  <span className="text-xs text-text-primary">{medication.instructions}</span>
                </div>
              </div>
            )}
            {medication.purpose && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-surface-2">
                <Target size={14} className="text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-0.5">Purpose</span>
                  <span className="text-xs text-text-primary">{medication.purpose}</span>
                </div>
              </div>
            )}
            <button className="w-full py-2 rounded-xl bg-surface-2 border border-border text-text-muted text-xs font-medium flex items-center justify-center gap-1.5 hover:text-text-primary transition-colors">
              <Bell size={12} />
              Set Reminder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
