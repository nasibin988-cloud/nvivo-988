/**
 * PendingRequests Component
 * Display pending appointment requests
 */

import { Hourglass, X } from 'lucide-react';
import type { AppointmentRequest } from '../types';

interface PendingRequestsProps {
  requests: AppointmentRequest[];
  onCancel: (requestId: string) => void;
}

export default function PendingRequests({
  requests,
  onCancel,
}: PendingRequestsProps): React.ReactElement | null {
  if (requests.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text-secondary px-1">Pending Requests</h3>

      {requests.map((req) => (
        <div
          key={req.id}
          className="relative rounded-2xl bg-surface border border-white/[0.04] p-4 group"
        >
          <div className="flex items-start gap-4">
            <img
              src={req.avatarUrl}
              alt={req.provider}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-white/5"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-text-primary text-sm">{req.provider}</h4>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] text-[10px] text-text-muted">
                  <Hourglass size={10} />
                  Pending
                </span>
              </div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-white/[0.04] text-xs text-text-muted mb-2">
                {req.type}
              </span>
              <p className="text-xs text-text-muted">
                Submitted {req.submittedDate} • Awaiting slot offers
              </p>
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
