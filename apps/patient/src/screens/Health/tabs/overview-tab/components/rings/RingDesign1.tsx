/**
 * Ring Design 1: Radiant Gradient Arc
 */

import type { RingProps } from '../../types';

export function RingDesign1({ score }: RingProps): React.ReactElement {
  const circumference = 2 * Math.PI * 42;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ring1-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <filter id="ring1-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background track */}
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(244,63,94,0.1)" strokeWidth="6" />
        {/* Progress arc */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="url(#ring1-gradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          filter="url(#ring1-glow)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold bg-gradient-to-br from-rose-400 to-pink-500 bg-clip-text text-transparent">
          A
        </span>
      </div>
    </div>
  );
}
