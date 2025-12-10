/**
 * UnifiedSchedule - Family schedule view for caregivers
 * Shows medications, appointments, and tasks across all family members
 */

import { Pill, Calendar, CheckCircle, Check } from 'lucide-react';
import { getMemberColor, type UnifiedScheduleItem } from '../types';

interface UnifiedScheduleProps {
  scheduleItems: UnifiedScheduleItem[];
  completedItems: Set<string>;
  onToggleItem: (itemId: string) => void;
}

export function UnifiedSchedule({
  scheduleItems,
  completedItems,
  onToggleItem,
}: UnifiedScheduleProps): React.ReactElement {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-medium text-text-secondary">Today&apos;s Family Schedule</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-[10px] text-text-muted">Margaret</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-text-muted">Robert</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] text-text-muted">You</span>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-white/[0.04] divide-y divide-white/[0.04]">
        {scheduleItems.map((item) => {
          const Icon =
            item.type === 'medication' ? Pill : item.type === 'appointment' ? Calendar : CheckCircle;
          const isCompleted = completedItems.has(item.id);

          return (
            <div
              key={item.id}
              className={`flex items-center gap-4 p-4 ${isCompleted ? 'opacity-50' : ''}`}
            >
              <div className="w-16 text-right">
                <span className="text-sm font-medium text-text-secondary">{item.time}</span>
              </div>
              <div className={`w-1 h-10 rounded-full ${getMemberColor(item.memberColor)}`} />
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isCompleted ? 'bg-emerald-500/10' : 'bg-white/[0.04]'
                }`}
              >
                {isCompleted ? (
                  <Check size={16} className="text-emerald-400" />
                ) : (
                  <Icon size={16} className="text-text-muted" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    isCompleted ? 'text-text-muted line-through' : 'text-text-primary'
                  }`}
                >
                  {item.title}
                </p>
                <p className="text-xs text-text-muted">{item.member}</p>
              </div>
              <button
                onClick={() => onToggleItem(item.id)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    : 'bg-white/[0.04] border border-white/[0.08] hover:bg-emerald-500/20 hover:border-emerald-500/30'
                }`}
              >
                <Check size={16} className={isCompleted ? 'text-white' : 'text-text-muted'} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
