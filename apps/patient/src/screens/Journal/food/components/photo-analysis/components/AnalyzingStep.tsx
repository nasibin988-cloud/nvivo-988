/**
 * AnalyzingStep Component
 * Analysis loading state with progress indicators
 */

import { Loader2, Sparkles, Check } from 'lucide-react';

interface AnalyzingStepProps {
  imageData: string;
}

const PROGRESS_STEPS = ['Detecting food items', 'Estimating portions', 'Calculating nutrition'];

export default function AnalyzingStep({ imageData }: AnalyzingStepProps): React.ReactElement {
  return (
    <div className="p-5 space-y-4">
      {/* Image preview */}
      <div className="aspect-[4/3] rounded-2xl overflow-hidden relative border border-white/[0.06]">
        <img src={imageData} alt="Food" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="relative">
            <Loader2 size={48} className="text-violet-400 animate-spin" />
            <Sparkles size={20} className="text-violet-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <p className="text-white font-medium mt-4">Analyzing your meal...</p>
          <p className="text-white/50 text-sm mt-1">This may take a few seconds</p>
        </div>
      </div>

      {/* Progress indicators */}
      <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
        {PROGRESS_STEPS.map((text, i) => (
          <div key={text} className="flex items-center gap-3">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                i < 2 ? 'bg-emerald-500/80' : 'bg-violet-500/80 animate-pulse'
              }`}
            >
              {i < 2 ? (
                <Check size={12} className="text-white" />
              ) : (
                <Loader2 size={12} className="text-white animate-spin" />
              )}
            </div>
            <span className="text-sm text-text-secondary">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
