/**
 * QuestionsStep Component
 * Pre-visit questionnaire form
 */

import { ChevronLeft } from 'lucide-react';
import type { RequestData, RequestStep } from '../types';

interface QuestionsStepProps {
  requestData: RequestData;
  setRequestData: (data: RequestData) => void;
  setStep: (step: RequestStep) => void;
}

export default function QuestionsStep({
  requestData,
  setRequestData,
  setStep,
}: QuestionsStepProps): React.ReactElement {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setStep('availability')}
          className="p-2 rounded-xl hover:bg-white/[0.06] text-text-secondary"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h3 className="font-medium text-text-primary">Pre-Visit Information</h3>
          <p className="text-xs text-text-muted">Help your provider prepare for your visit</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Reason for visit */}
        <div>
          <label className="block text-sm text-text-secondary mb-2">
            Reason for Visit <span className="text-red-400">*</span>
          </label>
          <textarea
            value={requestData.reason}
            onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
            placeholder="Briefly describe why you need this appointment..."
            className="w-full px-4 py-3 bg-surface rounded-xl border border-white/[0.04] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500/30 resize-none"
            rows={3}
          />
        </div>

        {/* Current concerns */}
        <div>
          <label className="block text-sm text-text-secondary mb-2">Current Symptoms or Concerns</label>
          <textarea
            value={requestData.currentConcerns}
            onChange={(e) => setRequestData({ ...requestData, currentConcerns: e.target.value })}
            placeholder="Any new or ongoing symptoms you'd like to discuss..."
            className="w-full px-4 py-3 bg-surface rounded-xl border border-white/[0.04] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500/30 resize-none"
            rows={3}
          />
        </div>

        {/* Medication changes */}
        <div>
          <label className="block text-sm text-text-secondary mb-2">Medication Updates</label>
          <textarea
            value={requestData.medicationChanges}
            onChange={(e) => setRequestData({ ...requestData, medicationChanges: e.target.value })}
            placeholder="Any changes to medications, new side effects, or refill needs..."
            className="w-full px-4 py-3 bg-surface rounded-xl border border-white/[0.04] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500/30 resize-none"
            rows={3}
          />
        </div>

        {/* Additional notes */}
        <div>
          <label className="block text-sm text-text-secondary mb-2">Additional Notes</label>
          <textarea
            value={requestData.additionalNotes}
            onChange={(e) => setRequestData({ ...requestData, additionalNotes: e.target.value })}
            placeholder="Anything else your provider should know..."
            className="w-full px-4 py-3 bg-surface rounded-xl border border-white/[0.04] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500/30 resize-none"
            rows={2}
          />
        </div>
      </div>

      {/* Continue button */}
      <button
        onClick={() => setStep('review')}
        disabled={!requestData.reason.trim()}
        className={`w-full py-3.5 rounded-xl font-medium transition-all ${
          requestData.reason.trim()
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] hover:scale-[1.01]'
            : 'bg-white/[0.04] text-text-muted cursor-not-allowed'
        }`}
      >
        Review Request
      </button>
    </div>
  );
}
