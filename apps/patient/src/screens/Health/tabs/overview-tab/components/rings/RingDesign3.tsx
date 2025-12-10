/**
 * Ring Design 3: Segmented Progress
 */

import type { RingProps } from '../../types';

export function RingDesign3({ score }: RingProps): React.ReactElement {
  const segments = 20;
  const activeSegments = Math.round((score / 100) * segments);
  const segmentAngle = 360 / segments;
  const gapAngle = 4;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ring3-active" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>
        {Array.from({ length: segments }).map((_, i) => {
          const startAngle = i * segmentAngle + gapAngle / 2;
          const endAngle = (i + 1) * segmentAngle - gapAngle / 2;
          const isActive = i < activeSegments;

          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;

          const x1 = 50 + 42 * Math.cos(startRad);
          const y1 = 50 + 42 * Math.sin(startRad);
          const x2 = 50 + 42 * Math.cos(endRad);
          const y2 = 50 + 42 * Math.sin(endRad);

          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A 42 42 0 0 1 ${x2} ${y2}`}
              fill="none"
              stroke={isActive ? 'url(#ring3-active)' : 'rgba(244,63,94,0.1)'}
              strokeWidth="5"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500/10 to-rose-500/5 flex items-center justify-center">
          <span className="text-3xl font-bold text-rose-400">A</span>
        </div>
      </div>
    </div>
  );
}
