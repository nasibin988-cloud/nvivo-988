/**
 * ShareSummaryModal - Generate secure health summary sharing link
 */

import { Share2, X, Lock, Check, Activity, Pill, Calendar } from 'lucide-react';

interface ShareSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareEmail: string;
  onShareEmailChange: (email: string) => void;
  shareDuration: string;
  onShareDurationChange: (duration: string) => void;
  shareIncludeMetrics: boolean;
  onShareIncludeMetricsChange: (include: boolean) => void;
  shareIncludeMeds: boolean;
  onShareIncludeMedsChange: (include: boolean) => void;
  shareIncludeAppts: boolean;
  onShareIncludeApptsChange: (include: boolean) => void;
  onGenerate: () => void;
}

const dataOptions = [
  { key: 'metrics', label: 'Vitals & Metrics', icon: Activity },
  { key: 'meds', label: 'Medications', icon: Pill },
  { key: 'appts', label: 'Appointments', icon: Calendar },
] as const;

export function ShareSummaryModal({
  isOpen,
  onClose,
  shareEmail,
  onShareEmailChange,
  shareDuration,
  onShareDurationChange,
  shareIncludeMetrics,
  onShareIncludeMetricsChange,
  shareIncludeMeds,
  onShareIncludeMedsChange,
  shareIncludeAppts,
  onShareIncludeApptsChange,
  onGenerate,
}: ShareSummaryModalProps): React.ReactElement | null {
  if (!isOpen) return null;

  const getValueAndSetter = (key: string) => {
    switch (key) {
      case 'metrics':
        return { value: shareIncludeMetrics, setter: onShareIncludeMetricsChange };
      case 'meds':
        return { value: shareIncludeMeds, setter: onShareIncludeMedsChange };
      case 'appts':
        return { value: shareIncludeAppts, setter: onShareIncludeApptsChange };
      default:
        return { value: false, setter: () => {} };
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl border border-white/[0.08] p-6 max-w-md w-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20">
              <Share2 size={18} className="text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">Share Health Summary</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/[0.06] text-text-muted"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Security notice */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-teal-500/[0.08] border border-teal-500/20">
            <Lock size={14} className="text-teal-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-teal-400/90">
              Your summary will be protected with a 6-digit access code. Only people with the code
              can view it.
            </p>
          </div>

          {/* Recipient email */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Recipient Email (optional)
            </label>
            <input
              type="email"
              value={shareEmail}
              onChange={(e) => onShareEmailChange(e.target.value)}
              placeholder="doctor@clinic.com"
              className="w-full px-4 py-3 bg-surface-2 rounded-xl border border-white/[0.04] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-teal-500/30"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">Link Expires In</label>
            <div className="grid grid-cols-4 gap-2">
              {['1', '7', '14', '30'].map((days) => (
                <button
                  key={days}
                  onClick={() => onShareDurationChange(days)}
                  className={`py-2 rounded-xl text-sm font-medium transition-all ${
                    shareDuration === days
                      ? 'bg-teal-500/15 border border-teal-500/30 text-teal-400'
                      : 'bg-surface-2 border border-white/[0.04] text-text-secondary hover:bg-white/[0.06]'
                  }`}
                >
                  {days} day{days !== '1' ? 's' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Data to include */}
          <div>
            <label className="block text-sm text-text-secondary mb-2">Include in Summary</label>
            <div className="space-y-2">
              {dataOptions.map((item) => {
                const Icon = item.icon;
                const { value, setter } = getValueAndSetter(item.key);
                return (
                  <button
                    key={item.key}
                    onClick={() => setter(!value)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                      value
                        ? 'bg-teal-500/10 border-teal-500/20'
                        : 'bg-surface-2 border-white/[0.04] hover:border-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className={value ? 'text-teal-400' : 'text-text-muted'} />
                      <span className={`text-sm ${value ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {item.label}
                      </span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center ${
                        value ? 'bg-teal-500' : 'bg-white/[0.1]'
                      }`}
                    >
                      {value && <Check size={12} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary font-medium hover:bg-white/[0.08] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onGenerate}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium shadow-[0_4px_16px_rgba(20,184,166,0.3)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)] transition-all"
          >
            <Share2 size={16} />
            Generate Link
          </button>
        </div>
      </div>
    </div>
  );
}
