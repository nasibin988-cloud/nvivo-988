/**
 * CaregiverDashboardModal - Full dashboard view for a person being cared for
 */

import {
  X,
  Activity,
  AlertCircle,
  ChevronRight,
  Pill,
  Calendar,
  CheckCircle,
  Check,
  Phone,
  MessageSquare,
} from 'lucide-react';
import type { CaregivingTarget, UnifiedScheduleItem } from '../types';

interface CaregiverDashboardModalProps {
  isOpen: boolean;
  caregiver: CaregivingTarget | undefined;
  scheduleItems: UnifiedScheduleItem[];
  completedItems: Set<string>;
  onToggleItem: (itemId: string) => void;
  onClose: () => void;
}

const mockVitals = [
  { label: 'Blood Pressure', value: '128/82', unit: 'mmHg', status: 'normal' as const },
  { label: 'Heart Rate', value: '72', unit: 'bpm', status: 'normal' as const },
  { label: 'Blood Sugar', value: '145', unit: 'mg/dL', status: 'elevated' as const },
];

export function CaregiverDashboardModal({
  isOpen,
  caregiver,
  scheduleItems,
  completedItems,
  onToggleItem,
  onClose,
}: CaregiverDashboardModalProps): React.ReactElement | null {
  if (!isOpen || !caregiver) return null;

  const personSchedule = scheduleItems.filter((item) => item.member === caregiver.name);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl border border-white/[0.08] max-w-lg w-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-white/[0.04] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={caregiver.avatarUrl}
              alt={caregiver.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/20"
            />
            <div>
              <h3 className="font-semibold text-text-primary">{caregiver.name}</h3>
              <p className="text-xs text-text-muted">{caregiver.relationship}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/[0.06] text-text-muted"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Health Score */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/[0.1] via-surface to-surface-2 border border-emerald-500/20 p-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted mb-1">Health Score</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-emerald-400">
                    {caregiver.healthScore}
                  </span>
                  <span className="text-text-muted">/100</span>
                </div>
                <p className="text-xs text-emerald-400/80 mt-1">&uarr; 3 points this week</p>
              </div>
              <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 flex items-center justify-center">
                <Activity size={28} className="text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Alert Banner */}
          {caregiver.alertCount > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20">
              <AlertCircle size={18} className="text-red-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400">Attention Needed</p>
                <p className="text-xs text-red-400/70">Missed medication dose at 8:00 AM</p>
              </div>
              <ChevronRight size={16} className="text-red-400" />
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-2 mb-2">
                <Pill size={14} className="text-blue-400" />
                <span className="text-xs text-text-muted">Next Medication</span>
              </div>
              <p className="text-sm font-medium text-text-primary">{caregiver.nextMedication}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={14} className="text-violet-400" />
                <span className="text-xs text-text-muted">Next Appointment</span>
              </div>
              <p className="text-sm font-medium text-text-primary">{caregiver.nextAppointment}</p>
            </div>
          </div>

          {/* Today's Schedule for this person */}
          {personSchedule.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-text-secondary mb-3">
                Today&apos;s Schedule
              </h4>
              <div className="bg-white/[0.02] rounded-xl border border-white/[0.04] divide-y divide-white/[0.04]">
                {personSchedule.map((item) => {
                  const Icon =
                    item.type === 'medication'
                      ? Pill
                      : item.type === 'appointment'
                        ? Calendar
                        : CheckCircle;
                  const isCompleted = completedItems.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 ${isCompleted ? 'opacity-50' : ''}`}
                    >
                      <span className="text-xs text-text-muted w-14">{item.time}</span>
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isCompleted ? 'bg-emerald-500/10' : 'bg-white/[0.04]'
                        }`}
                      >
                        {isCompleted ? (
                          <Check size={14} className="text-emerald-400" />
                        ) : (
                          <Icon size={14} className="text-text-muted" />
                        )}
                      </div>
                      <span
                        className={`flex-1 text-sm ${
                          isCompleted ? 'text-text-muted line-through' : 'text-text-primary'
                        }`}
                      >
                        {item.title}
                      </span>
                      <button
                        onClick={() => onToggleItem(item.id)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : 'bg-white/[0.04] border border-white/[0.08] hover:bg-emerald-500/20'
                        }`}
                      >
                        <Check
                          size={12}
                          className={isCompleted ? 'text-white' : 'text-text-muted'}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Vitals */}
          <div>
            <h4 className="text-sm font-medium text-text-secondary mb-3">Recent Vitals</h4>
            <div className="grid grid-cols-3 gap-2">
              {mockVitals.map((vital) => (
                <div
                  key={vital.label}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center"
                >
                  <p className="text-xs text-text-muted mb-1">{vital.label}</p>
                  <p
                    className={`text-lg font-semibold ${
                      vital.status === 'elevated' ? 'text-amber-400' : 'text-text-primary'
                    }`}
                  >
                    {vital.value}
                  </p>
                  <p className="text-[10px] text-text-muted">{vital.unit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary font-medium hover:bg-white/[0.08] transition-all">
              <Phone size={16} />
              Call
            </button>
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-500/[0.12] border border-violet-500/25 text-violet-400 font-medium hover:bg-violet-500/[0.18] hover:border-violet-500/35 transition-all">
              <MessageSquare size={16} />
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
