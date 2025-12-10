/**
 * SuccessStep Component
 * Confirmation screen after successful submission
 */

import { Check, Hourglass } from 'lucide-react';
import { providers } from '../data';
import type { RequestData } from '../types';

interface SuccessStepProps {
  requestData: RequestData;
  onReset: () => void;
}

export default function SuccessStep({ requestData, onReset }: SuccessStepProps): React.ReactElement {
  const provider = providers.find((p) => p.id === requestData.providerId);

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-[0_8px_32px_rgba(16,185,129,0.4)]">
          <Check size={40} className="text-white" />
        </div>
        <div className="absolute inset-0 w-20 h-20 rounded-full bg-emerald-500/20 animate-ping" />
      </div>

      <h3 className="text-xl font-semibold text-text-primary mb-2">Request Submitted</h3>
      <p className="text-text-secondary mb-6 max-w-xs">
        Your appointment request has been sent to {provider?.name}. You'll receive slot
        options within 1-2 business days.
      </p>

      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/[0.1] border border-blue-500/20 text-blue-400 text-sm mb-8">
        <Hourglass size={16} />
        <span>Awaiting slot offers</span>
      </div>

      <button
        onClick={onReset}
        className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] transition-all"
      >
        Back to Schedule
      </button>
    </div>
  );
}
