/**
 * ReviewStep Component
 * Review appointment request before submitting
 */

import { ChevronLeft, FileText, Calendar, AlertCircle, Send, Video } from 'lucide-react';
import { providers, appointmentTypes, visitTypes, timePreferences } from '../data';
import { formatShortDate } from '../utils';
import type { RequestData, RequestStep } from '../types';

interface ReviewStepProps {
  requestData: RequestData;
  setStep: (step: RequestStep) => void;
  onReset: () => void;
}

export default function ReviewStep({
  requestData,
  setStep,
  onReset,
}: ReviewStepProps): React.ReactElement {
  const provider = providers.find((p) => p.id === requestData.providerId);
  const appointmentType = appointmentTypes.find((t) => t.id === requestData.appointmentType);
  const visitType = visitTypes.find((v) => v.id === requestData.visitType);
  const VisitIcon = visitType?.icon || Video;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setStep('questions')}
          className="p-2 rounded-xl hover:bg-white/[0.06] text-text-secondary"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h3 className="font-medium text-text-primary">Review Your Request</h3>
          <p className="text-xs text-text-muted">Confirm before submitting</p>
        </div>
      </div>

      {/* Request summary */}
      <div className="relative bg-gradient-to-br from-blue-500/[0.08] to-surface rounded-2xl border border-blue-500/15 p-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative space-y-4">
          {/* Provider */}
          {provider && (
            <div className="flex items-center gap-4">
              <img
                src={provider.avatarUrl}
                alt={provider.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-white/10"
              />
              <div>
                <h4 className="font-medium text-text-primary">{provider.name}</h4>
                <span className="inline-block px-2.5 py-1 mt-1 rounded-full bg-white/[0.04] text-xs text-text-secondary">
                  {provider.title}
                </span>
              </div>
            </div>
          )}

          <div className="h-px bg-white/[0.06]" />

          {/* Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
              <FileText size={16} className="text-blue-400" />
              <div>
                <p className="text-xs text-text-muted">Type</p>
                <p className="text-sm text-text-primary font-medium">{appointmentType?.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
              <VisitIcon size={16} className="text-blue-400" />
              <div>
                <p className="text-xs text-text-muted">Format</p>
                <p className="text-sm text-text-primary font-medium">{visitType?.label}</p>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="p-3 rounded-xl bg-white/[0.03]">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-emerald-400" />
              <p className="text-xs text-text-muted">Your Availability</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {requestData.availability.map((slot) => {
                const tp = timePreferences.find((t) => t.id === slot.timePreference);
                return (
                  <span
                    key={slot.date.toISOString()}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400"
                  >
                    {formatShortDate(slot.date)} ({tp?.label})
                  </span>
                );
              })}
            </div>
          </div>

          {/* Reason */}
          <div className="p-3 rounded-xl bg-white/[0.03]">
            <p className="text-xs text-text-muted mb-1">Reason for Visit</p>
            <p className="text-sm text-text-primary">{requestData.reason}</p>
          </div>

          {requestData.currentConcerns && (
            <div className="p-3 rounded-xl bg-white/[0.03]">
              <p className="text-xs text-text-muted mb-1">Current Concerns</p>
              <p className="text-sm text-text-secondary">{requestData.currentConcerns}</p>
            </div>
          )}
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/20">
        <AlertCircle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-400/90">
          After submitting, our scheduling team will review your request and offer you available
          time slots within 1-2 business days.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary font-medium hover:bg-white/[0.08] transition-all"
        >
          Cancel
        </button>
        <button
          onClick={() => setStep('success')}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] hover:scale-[1.01] transition-all"
        >
          <Send size={16} />
          Submit Request
        </button>
      </div>
    </div>
  );
}
