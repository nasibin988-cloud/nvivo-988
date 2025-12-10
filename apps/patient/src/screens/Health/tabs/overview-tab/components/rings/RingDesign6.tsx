/**
 * Ring Design 6: Dotted Circle
 */

import type { RingProps } from '../../types';

export function RingDesign6({ score }: RingProps): React.ReactElement {
  const totalDots = 24;
  const activeDots = Math.round((score / 100) * totalDots);

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <defs>
          <filter id="ring6-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {Array.from({ length: totalDots }).map((_, i) => {
          const angle = (i * 360) / totalDots - 90;
          const rad = (angle * Math.PI) / 180;
          const x = 50 + 40 * Math.cos(rad);
          const y = 50 + 40 * Math.sin(rad);
          const isActive = i < activeDots;
          const size = isActive ? 4 : 2.5;

          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={size}
              fill={isActive ? '#f43f5e' : 'rgba(244,63,94,0.15)'}
              filter={isActive ? 'url(#ring6-glow)' : undefined}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-rose-500/5 flex items-center justify-center">
          <span className="text-3xl font-bold text-rose-400">A</span>
        </div>
      </div>
    </div>
  );
}
