/**
 * Variant 5: Multi-Ring (Activity Ring Style)
 * Shows individual metrics with distinct colors
 */

import type { Variant5Props, RingConfig } from '../types';

export default function Variant5({
  wellnessLog,
  animatedScore,
  colors,
  size,
  strokeWidth,
}: Variant5Props): JSX.Element {
  const ringGap = 3;
  const rings: RingConfig[] = [
    { label: 'Mood', value: wellnessLog.mood, color: '#06B6D4', secondaryColor: '#22D3EE' },
    { label: 'Energy', value: wellnessLog.energy, color: '#10B981', secondaryColor: '#34D399' },
    { label: 'Sleep', value: wellnessLog.sleepQuality, color: '#8B5CF6', secondaryColor: '#A78BFA' },
    { label: 'Calm', value: 11 - wellnessLog.stress, color: '#F59E0B', secondaryColor: '#FBBF24' },
  ];

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Ambient glow based on overall score */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.6,
          height: size * 0.6,
          background: `radial-gradient(circle, ${colors.main}25 0%, transparent 70%)`,
          filter: 'blur(15px)',
        }}
      />

      <svg width={size} height={size} className="transform -rotate-90">
        {rings.map((ring, index) => {
          const ringRadius = (size / 2) - (strokeWidth * (index + 1)) - (ringGap * index) - 5;
          const circumference = 2 * Math.PI * ringRadius;
          const progress = (ring.value / 10) * 100;
          const strokeDashoffset = circumference - (progress / 100) * circumference;

          return (
            <g key={ring.label}>
              {/* Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={ringRadius}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={strokeWidth}
              />
              {/* Glow */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={ringRadius}
                fill="none"
                stroke={ring.color}
                strokeWidth={strokeWidth + 4}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{
                  transition: 'stroke-dashoffset 1.2s ease-out',
                  opacity: 0.25,
                  filter: 'blur(4px)',
                }}
              />
              {/* Progress */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={ringRadius}
                fill="none"
                stroke={`url(#ring-gradient-${index}-${size})`}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
              />
            </g>
          );
        })}

        <defs>
          {rings.map((ring, index) => (
            <linearGradient key={index} id={`ring-gradient-${index}-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={ring.secondaryColor} />
              <stop offset="100%" stopColor={ring.color} />
            </linearGradient>
          ))}
        </defs>
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white tabular-nums">
          {animatedScore}
        </span>
        <span
          className="text-[9px] font-semibold uppercase tracking-[0.15em] mt-1 px-2 py-0.5 rounded-full"
          style={{
            color: colors.main,
            backgroundColor: `${colors.main}15`,
            border: `1px solid ${colors.main}30`,
          }}
        >
          {colors.label}
        </span>
      </div>

      {/* Ring Legend */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-2">
        {rings.map((ring) => (
          <div key={ring.label} className="flex items-center gap-0.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: ring.color }}
            />
            <span className="text-[8px] text-text-muted uppercase tracking-wide">{ring.label[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
