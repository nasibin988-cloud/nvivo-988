/**
 * ProviderStep Component
 * Select a healthcare provider for the appointment
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { providers } from '../data';
import type { RequestData, RequestStep } from '../types';

interface ProviderStepProps {
  requestData: RequestData;
  setRequestData: (data: RequestData) => void;
  setStep: (step: RequestStep) => void;
  onReset: () => void;
}

export default function ProviderStep({
  requestData,
  setRequestData,
  setStep,
  onReset,
}: ProviderStepProps): React.ReactElement {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onReset}
          className="p-2 rounded-xl hover:bg-white/[0.06] text-text-secondary"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h3 className="font-medium text-text-primary">Select Provider</h3>
          <p className="text-xs text-text-muted">Who would you like to see?</p>
        </div>
      </div>

      <div className="space-y-2">
        {providers.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setRequestData({ ...requestData, providerId: p.id });
              setStep('type');
            }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface border border-white/[0.04] hover:bg-surface-2 hover:border-white/[0.08] transition-all group"
          >
            <img
              src={p.avatarUrl}
              alt={p.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-white/5 group-hover:ring-white/10"
            />
            <div className="flex-1 text-left">
              <h4 className="font-medium text-text-primary">{p.name}</h4>
              <span className="inline-block px-2 py-0.5 mt-1 rounded-full bg-white/[0.04] text-xs text-text-muted">
                {p.title}
              </span>
            </div>
            <ChevronRight size={18} className="text-text-muted group-hover:text-text-secondary" />
          </button>
        ))}
      </div>
    </div>
  );
}
