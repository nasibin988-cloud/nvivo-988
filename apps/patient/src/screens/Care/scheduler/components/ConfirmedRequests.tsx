/**
 * ConfirmedRequests Component
 * Display confirmed appointments
 */

import { Calendar, Clock, Video, X } from 'lucide-react';
import type { AppointmentRequest } from '../types';

interface ConfirmedRequestsProps {
  requests: AppointmentRequest[];
  onCancel: (requestId: string) => void;
}

export default function ConfirmedRequests({
  requests,
  onCancel,
}: ConfirmedRequestsProps): React.ReactElement | null {
  if (requests.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text-secondary px-1">Confirmed Appointments</h3>

      {requests.map((req) => (
        <div
          key={req.id}
          className="relative rounded-2xl bg-surface border border-white/[0.04] p-4 hover:bg-surface-2 transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={req.avatarUrl}
                alt={req.provider}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/5"
              />
              {req.visitType === 'video' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500 border-2 border-surface flex items-center justify-center">
                  <Video size={10} className="text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-text-primary text-sm">{req.provider}</h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-[10px] text-emerald-400 font-medium">
                  Confirmed
                </span>
              </div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-white/[0.04] text-xs text-text-muted mb-2">
                {req.type}
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-text-muted" />
                  <span className="text-xs text-text-secondary">{req.confirmedDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-text-muted" />
                  <span className="text-xs text-text-secondary">{req.confirmedTime}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onCancel(req.id)}
              className="p-2 rounded-xl text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
