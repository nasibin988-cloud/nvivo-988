/**
 * SlotConfirmationModal Component
 * Confirm time slot selection for appointment
 */

import { CalendarCheck } from 'lucide-react';

interface SlotConfirmationModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export default function SlotConfirmationModal({
  onClose,
  onConfirm,
}: SlotConfirmationModalProps): React.ReactElement {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl border border-white/[0.08] p-6 max-w-sm w-full shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <CalendarCheck size={24} className="text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary text-center mb-2">
          Confirm This Slot?
        </h3>
        <p className="text-sm text-text-secondary text-center mb-6">
          Once confirmed, your appointment will be scheduled for this time.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary font-medium hover:bg-white/[0.08] transition-all"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] transition-all"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
