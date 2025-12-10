/**
 * Ring Design 5: Neon Pulse
 */

import type { RingProps } from '../../types';

export function RingDesign5({ score }: RingProps): React.ReactElement {
  const circumference = 2 * Math.PI * 38;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ring5-neon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff1493" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
          <filter id="ring5-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur1" />
            <feGaussianBlur stdDeviation="2" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Outer glow ring */}
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(244,63,94,0.15)" strokeWidth="2" />
        {/* Background */}
        <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(244,63,94,0.1)" strokeWidth="6" />
        {/* Neon progress */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="url(#ring5-neon)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          transform="rotate(-90 50 50)"
          filter="url(#ring5-glow)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-black text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]">
          A
        </span>
      </div>
    </div>
  );
}
