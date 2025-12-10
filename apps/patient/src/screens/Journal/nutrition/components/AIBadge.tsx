/**
 * AIBadge - Shimmer badge indicating AI-analyzed meal
 * Shows confidence percentage when available
 */

import { Sparkles } from 'lucide-react';

interface AIBadgeProps {
  confidence?: number;
}

export function AIBadge({ confidence }: AIBadgeProps): React.ReactElement {
  return (
    <span className="relative overflow-hidden px-1.5 py-0.5 rounded bg-violet-500/15 border border-violet-500/30 text-violet-400 text-[9px] font-bold flex items-center gap-0.5">
      {/* Shimmer effect */}
      <span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{
          animation: 'shimmer 2s infinite',
        }}
      />
      <Sparkles size={8} className="relative" />
      <span className="relative">AI</span>
      {confidence && (
        <span className="relative text-violet-300 ml-0.5">{Math.round(confidence * 100)}%</span>
      )}

      {/* Keyframe animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </span>
  );
}
