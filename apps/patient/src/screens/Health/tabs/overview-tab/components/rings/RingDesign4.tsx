/**
 * Ring Design 4: Dual Arc with Glow
 */

import type { RingProps } from '../../types';

export function RingDesign4({ score }: RingProps): React.ReactElement {
  const circumference = 2 * Math.PI * 40;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ring4-main" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#be123c" />
            <stop offset="50%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
          <filter id="ring4-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Subtle background ring */}
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(244,63,94,0.08)" strokeWidth="8" />
        {/* Inner decorative ring */}
        <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(244,63,94,0.05)" strokeWidth="1" />
        {/* Main progress arc */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="url(#ring4-main)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          transform="rotate(-90 50 50)"
          filter="url(#ring4-glow)"
        />
        {/* End cap highlight */}
        <circle
          cx="50"
          cy="10"
          r="4"
          fill="#fb7185"
          filter="url(#ring4-glow)"
          transform={`rotate(${(score / 100) * 360 - 90} 50 50)`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]">
          A
        </span>
      </div>
    </div>
  );
}
