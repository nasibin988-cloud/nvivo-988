/**
 * Ring Design 2: Concentric Orbits
 */

import type { RingProps } from '../../types';

export function RingDesign2({ score }: RingProps): React.ReactElement {
  const circumference = 2 * Math.PI * 40;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ring2-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
        </defs>
        {/* Outer faint orbit */}
        <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(244,63,94,0.05)" strokeWidth="1" />
        {/* Middle orbit */}
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(244,63,94,0.1)" strokeWidth="4" />
        {/* Inner ring */}
        <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(244,63,94,0.08)" strokeWidth="2" />
        {/* Progress on middle ring */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="url(#ring2-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          transform="rotate(-90 50 50)"
        />
        {/* Orbiting dots */}
        <circle cx="50" cy="4" r="2.5" fill="#f43f5e" opacity="0.8" />
        <circle cx="96" cy="50" r="2" fill="#fb7185" opacity="0.6" />
        <circle cx="50" cy="96" r="1.5" fill="#fda4af" opacity="0.4" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold text-rose-400">A</span>
      </div>
    </div>
  );
}
