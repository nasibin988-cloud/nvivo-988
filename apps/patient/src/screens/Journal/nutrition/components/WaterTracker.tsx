/**
 * WaterTracker - Interactive water intake tracker with animations
 * Shows glasses as tappable elements with fill, wave, and ripple effects
 * Includes streak counter for motivation
 */

import { useState } from 'react';
import { Droplets, Loader2, Check, Flame, TrendingUp } from 'lucide-react';

interface WaterTrackerProps {
  current: number;
  target: number;
  onUpdate: (glasses: number) => void;
  isUpdating: boolean;
  streak?: number;
}

export function WaterTracker({
  current,
  target,
  onUpdate,
  isUpdating,
  streak = 0,
}: WaterTrackerProps): React.ReactElement {
  const [rippleIndex, setRippleIndex] = useState<number | null>(null);

  const handleTap = (index: number) => {
    // If tapping the same glass that's currently filled, toggle it off
    const newGlasses = index + 1 === current ? index : index + 1;
    setRippleIndex(index);
    onUpdate(newGlasses);
    setTimeout(() => setRippleIndex(null), 500);
  };

  const isComplete = current >= target;

  return (
    <div className="bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/[0.04] p-4 relative overflow-hidden">
      {/* Celebration effect when complete */}
      {isComplete && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/8 to-cyan-500/5 animate-pulse" />
      )}

      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg transition-colors ${isComplete ? 'bg-cyan-500/10' : 'bg-blue-500/10'}`}>
            <Droplets size={16} className={isComplete ? 'text-cyan-400' : 'text-blue-400'} />
          </div>
          <span className="text-sm font-semibold text-text-primary">Water Intake</span>
          {/* Streak badge */}
          {streak > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/20">
              <Flame size={10} className="text-orange-400" />
              <span className="text-[10px] font-bold text-orange-400">{streak} day{streak > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isUpdating && <Loader2 size={12} className="text-blue-400 animate-spin" />}
          <span className={`text-sm font-bold ${isComplete ? 'text-cyan-400' : 'text-blue-400'}`}>
            {current}/{target}
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
              className={`relative flex-1 h-10 rounded-lg overflow-hidden transition-all duration-300 ${
                isFilled
                  ? 'bg-white/[0.03] border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.15)]'
                  : 'bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04]'
              }`}
            >
              {/* Fill from bottom for filled glasses with wave effect */}
              {isFilled && (
                <div className="absolute inset-0 overflow-hidden">
                  {/* Main water fill */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-full"
                    style={{
                      background: 'linear-gradient(to top, rgba(34, 211, 238, 0.5), rgba(59, 130, 246, 0.3), transparent)',
                      animation: 'waterFill 0.5s ease-out forwards',
                      animationDelay: `${i * 50}ms`,
                    }}
                  />
                  {/* Wave overlay */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-full"
                    style={{
                      background: 'linear-gradient(180deg, transparent 60%, rgba(255,255,255,0.1) 80%, transparent 100%)',
                      animation: 'wave 2s ease-in-out infinite',
                      animationDelay: `${i * 150}ms`,
                    }}
                  />
                  {/* Bubble effect */}
                  <div
                    className="absolute bottom-1 left-1/2 w-1 h-1 rounded-full bg-white/30"
                    style={{
                      animation: 'bubble 3s ease-in-out infinite',
                      animationDelay: `${i * 200}ms`,
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

      {/* Motivational message when close to goal */}
      {!isComplete && current >= target - 2 && current > 0 && (
        <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-cyan-400/80">
          <TrendingUp size={10} />
          <span>Almost there! {target - current} more to go</span>
        </div>
      )}

      {/* Wave animation keyframes */}
      <style>{`
        @keyframes waterFill {
          from { height: 0%; opacity: 0; }
          to { height: 100%; opacity: 1; }
        }
        @keyframes wave {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-3px) scaleY(1.02); }
        }
        @keyframes bubble {
          0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0; }
          50% { transform: translateX(-50%) translateY(-15px); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
