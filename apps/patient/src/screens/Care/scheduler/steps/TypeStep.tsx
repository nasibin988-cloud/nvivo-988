/**
 * TypeStep Component
 * Select appointment type and visit format
 */

import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { providers, appointmentTypes, visitTypes } from '../data';
import type { RequestData, RequestStep } from '../types';

interface TypeStepProps {
  requestData: RequestData;
  setRequestData: (data: RequestData) => void;
  setStep: (step: RequestStep) => void;
}

export default function TypeStep({
  requestData,
  setRequestData,
  setStep,
}: TypeStepProps): React.ReactElement {
  const provider = providers.find((p) => p.id === requestData.providerId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setStep('provider')}
          className="p-2 rounded-xl hover:bg-white/[0.06] text-text-secondary"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h3 className="font-medium text-text-primary">Appointment Type</h3>
          <p className="text-xs text-text-muted">What kind of visit do you need?</p>
        </div>
      </div>

      {/* Selected provider preview */}
      {provider && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/[0.08] border border-blue-500/20 mb-4">
          <img src={provider.avatarUrl} alt={provider.name} className="w-8 h-8 rounded-full" />
          <span className="text-sm text-text-primary">{provider.name}</span>
        </div>
      )}

      {/* Appointment types */}
      <div className="space-y-2">
        {appointmentTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => {
              setRequestData({ ...requestData, appointmentType: type.id });
              setStep('availability');
            }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface border border-white/[0.04] hover:bg-surface-2 hover:border-white/[0.08] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
              <FileText size={18} className="text-text-secondary" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-medium text-text-primary">{type.label}</h4>
              <span className="text-xs text-text-muted">{type.duration}</span>
            </div>
            <ChevronRight size={18} className="text-text-muted group-hover:text-text-secondary" />
          </button>
        ))}
      </div>

      {/* Visit type selection */}
      <div className="mt-6">
        <p className="text-sm text-text-secondary mb-3">Preferred Visit Format</p>
        <div className="flex gap-2">
          {visitTypes.map((vt) => {
            const Icon = vt.icon;
            const isSelected = requestData.visitType === vt.id;
            return (
              <button
                key={vt.id}
                onClick={() => setRequestData({ ...requestData, visitType: vt.id })}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                    : 'bg-surface border-white/[0.04] text-text-secondary hover:bg-surface-2'
                }`}
              >
                <Icon size={16} />
                <span className="text-sm font-medium">{vt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
