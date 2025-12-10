/**
 * Ring Design 8: Elegant Sweep
 */

import type { RingProps } from '../../types';

export function RingDesign8({ score }: RingProps): React.ReactElement {
  const circumference = 2 * Math.PI * 42;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ring8-sweep" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fecdd3" stopOpacity="0.3" />
            <stop offset="30%" stopColor="#fb7185" />
            <stop offset="70%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>
          <filter id="ring8-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#f43f5e" floodOpacity="0.3" />
          </filter>
        </defs>
        {/* Subtle background */}
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(244,63,94,0.06)" strokeWidth="10" />
        {/* Progress sweep */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="url(#ring8-sweep)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          transform="rotate(-90 50 50)"
          filter="url(#ring8-shadow)"
        />
        {/* Inner accent circle */}
        <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(244,63,94,0.1)" strokeWidth="0.5" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-semibold text-rose-400">A</span>
      </div>
    </div>
  );
}
