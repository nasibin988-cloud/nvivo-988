/**
 * OfferedRequests Component
 * Display appointment requests with offered time slots
 */

import { Calendar, Clock, CheckCircle } from 'lucide-react';
import type { AppointmentRequest } from '../types';

interface OfferedRequestsProps {
  requests: AppointmentRequest[];
  onSelectSlot: (requestId: string, slotId: string) => void;
}

export default function OfferedRequests({
  requests,
  onSelectSlot,
}: OfferedRequestsProps): React.ReactElement | null {
  if (requests.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <h3 className="text-sm font-medium text-amber-400">Action Required</h3>
      </div>

      {requests.map((req) => (
        <div
          key={req.id}
          className="relative rounded-2xl bg-gradient-to-br from-amber-500/[0.06] to-surface border border-amber-500/15 p-4 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.05] via-transparent to-amber-500/[0.02]" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative">
            <div className="flex items-start gap-4 mb-4">
              <img
                src={req.avatarUrl}
                alt={req.provider}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/5"
              />
              <div className="flex-1">
                <h4 className="font-medium text-text-primary text-sm">{req.provider}</h4>
                <span className="inline-block px-2 py-0.5 mt-1 rounded-full bg-white/[0.04] text-xs text-text-muted">
                  {req.type}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/20 text-xs text-amber-400 font-medium">
                Choose Slot
              </span>
            </div>

            <p className="text-xs text-text-muted mb-3">Select one of the offered time slots:</p>

            <div className="space-y-2">
              {req.offeredSlots?.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => onSelectSlot(req.id, slot.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-2/50 border border-white/[0.04] hover:bg-surface-2 hover:border-amber-500/20 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Calendar size={14} className="text-text-muted" />
                    <span className="text-sm text-text-primary">{slot.date}</span>
                    <span className="text-text-muted">•</span>
                    <Clock size={14} className="text-text-muted" />
                    <span className="text-sm text-text-primary">{slot.time}</span>
                  </div>
                  <CheckCircle
                    size={18}
                    className="text-text-muted group-hover:text-amber-400 transition-colors"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
