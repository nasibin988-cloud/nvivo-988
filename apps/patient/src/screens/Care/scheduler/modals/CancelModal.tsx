/**
 * CancelModal Component
 * Confirm cancellation of appointment request
 */

import { AlertCircle } from 'lucide-react';

interface CancelModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export default function CancelModal({
  onClose,
  onConfirm,
}: CancelModalProps): React.ReactElement {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl border border-white/[0.08] p-6 max-w-sm w-full shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary text-center mb-2">
          Cancel Appointment?
        </h3>
        <p className="text-sm text-text-secondary text-center mb-6">
          Are you sure you want to cancel this appointment request? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary font-medium hover:bg-white/[0.08] transition-all"
          >
            Keep It
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow-[0_4px_16px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
