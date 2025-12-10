/**
 * WaterTracker - Interactive water intake tracker with animations
 * Shows glasses as tappable elements with fill and ripple effects
 */

import { useState } from 'react';
import { Droplets, Loader2, Check } from 'lucide-react';

interface WaterTrackerProps {
  current: number;
  target: number;
  onUpdate: (glasses: number) => void;
  isUpdating: boolean;
}

export function WaterTracker({
  current,
  target,
  onUpdate,
  isUpdating,
}: WaterTrackerProps): React.ReactElement {
  const [rippleIndex, setRippleIndex] = useState<number | null>(null);

  const handleTap = (index: number) => {
    const newGlasses = index + 1;
    setRippleIndex(index);
    onUpdate(newGlasses);
    setTimeout(() => setRippleIndex(null), 500);
  };

  const isComplete = current >= target;

  return (
    <div className="bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/[0.04] p-4 relative overflow-hidden">
      {/* Celebration effect when complete */}
      {isComplete && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/8 to-cyan-500/5" />
      )}

      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg transition-colors ${isComplete ? 'bg-cyan-500/10' : 'bg-blue-500/10'}`}>
            <Droplets size={16} className={isComplete ? 'text-cyan-400' : 'text-blue-400'} />
          </div>
          <span className="text-sm font-semibold text-text-primary">Water Intake</span>
        </div>
        <div className="flex items-center gap-2">
          {isUpdating && <Loader2 size={12} className="text-blue-400 animate-spin" />}
          <span className={`text-sm font-bold ${isComplete ? 'text-cyan-400' : 'text-blue-400'}`}>
            {current}/{target} glasses
          </span>
          {isComplete && <Check size={14} className="text-cyan-400" />}
        </div>
      </div>

      <div className="flex gap-1.5">
        {Array.from({ length: target }).map((_, i) => {
          const isFilled = i < current;
          const isRippling = rippleIndex === i;

          return (
            <button
              key={i}
              onClick={() => handleTap(i)}
              className={`relative flex-1 h-9 rounded-lg overflow-hidden transition-all duration-300 ${
                isFilled
                  ? 'bg-white/[0.03] border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.15)]'
                  : 'bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]'
              }`}
            >
              {/* Fill from bottom for filled glasses */}
              {isFilled && (
                <div className="absolute inset-0 overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-cyan-500/40 via-blue-500/25 to-transparent"
                    style={{
                      animation: 'waterFill 0.5s ease-out forwards, wave 3s ease-in-out infinite',
                      animationDelay: `${i * 50}ms, ${i * 100}ms`,
                    }}
                  />
                </div>
              )}

              {/* Ripple effect on tap */}
              {isRippling && (
                <span
                  className="absolute inset-0 bg-white/20 animate-ping"
                  style={{ animationDuration: '0.5s' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Wave animation keyframes */}
      <style>{`
        @keyframes waterFill {
          from { height: 0%; }
          to { height: 100%; }
        }
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
      `}</style>
    </div>
  );
}
