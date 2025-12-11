/**
 * AnalyzingStep Component
 * Analysis loading state
 */

import { Loader2, Sparkles } from 'lucide-react';

interface AnalyzingStepProps {
  imageData: string;
}

export default function AnalyzingStep({ imageData }: AnalyzingStepProps): React.ReactElement {
  return (
    <div className="p-5">
      {/* Image preview with loading overlay */}
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
    </div>
  );
}
