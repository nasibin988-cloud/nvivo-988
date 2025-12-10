/**
 * ScanningStep - Animated loading state during OCR processing
 */

import { FileText, Loader2 } from 'lucide-react';

interface ScanningStepProps {
  imageData: string;
}

export function ScanningStep({ imageData }: ScanningStepProps): React.ReactElement {
  return (
    <div className="p-5">
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/40 border border-white/[0.06]">
        {/* Image preview with scanning overlay */}
        <img
          src={imageData}
          alt="Scanning menu"
          className="w-full h-full object-cover opacity-50"
        />

        {/* Scanning animation overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
          {/* Animated scan line */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-scan" />

          {/* Loading indicator */}
          <div className="relative">
            <div className="absolute -inset-4 bg-teal-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative p-4 rounded-full bg-teal-500/20 border border-teal-500/30">
              <FileText size={32} className="text-teal-400 animate-pulse" />
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-teal-400 font-semibold">
              <Loader2 size={16} className="animate-spin" />
              Scanning Menu...
            </div>
            <p className="text-xs text-text-muted mt-2">
              Extracting menu items and nutrition info
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mt-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-teal-400/60 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scanning steps indicator */}
      <div className="mt-5 space-y-3">
        {[
          { label: 'Detecting text', complete: true },
          { label: 'Identifying menu items', complete: false },
          { label: 'Estimating nutrition', complete: false },
        ].map((step, idx) => (
          <div
            key={step.label}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
              step.complete
                ? 'bg-teal-500/10 border border-teal-500/20'
                : 'bg-white/[0.02] border border-white/[0.04] opacity-50'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                step.complete
                  ? 'bg-teal-500/20 text-teal-400'
                  : 'bg-white/[0.05] text-text-muted'
              }`}
            >
              {idx + 1}
            </div>
            <span className={`text-sm ${step.complete ? 'text-teal-400' : 'text-text-muted'}`}>
              {step.label}
            </span>
            {step.complete && (
              <Loader2 size={14} className="ml-auto text-teal-400 animate-spin" />
            )}
          </div>
        ))}
      </div>

      {/* Custom styles for scan animation */}
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
