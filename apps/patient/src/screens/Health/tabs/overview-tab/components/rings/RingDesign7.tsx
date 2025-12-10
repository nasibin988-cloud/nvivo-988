/**
 * Ring Design 7: Stacked Arcs
 */

import type { RingProps } from '../../types';

export function RingDesign7({ score }: RingProps): React.ReactElement {
  const mainCirc = 2 * Math.PI * 40;
  const innerCirc = 2 * Math.PI * 32;
  const mainProgress = (score / 100) * mainCirc;
  const innerProgress = ((score - 10) / 100) * innerCirc;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ring7-outer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
          <linearGradient id="ring7-inner" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
        </defs>
        {/* Outer track */}
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(244,63,94,0.08)" strokeWidth="5" />
        {/* Inner track */}
        <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(244,63,94,0.06)" strokeWidth="4" />
        {/* Outer progress */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="url(#ring7-outer)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${mainProgress} ${mainCirc}`}
          transform="rotate(-90 50 50)"
        />
        {/* Inner progress */}
        <circle
          cx="50"
          cy="50"
          r="32"
          fill="none"
          stroke="url(#ring7-inner)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${innerProgress} ${innerCirc}`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-rose-400">A</span>
      </div>
    </div>
  );
}
