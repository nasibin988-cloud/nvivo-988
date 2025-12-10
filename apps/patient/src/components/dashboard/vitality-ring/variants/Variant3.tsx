/**
 * Variant 3: Frosted Glass
 * Glassmorphism, soft blur, elegant and modern
 */

import type { VariantProps } from '../types';

export default function Variant3({
  score: _score,
  animatedScore,
  colors,
  size,
  strokeWidth,
}: VariantProps): JSX.Element {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  const innerRadius = radius - strokeWidth - 15;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Frosted background circle */}
      <div
        className="absolute rounded-full"
        style={{
          width: innerRadius * 2,
          height: innerRadius * 2,
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      />

      {/* Subtle color reflection */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          background: `radial-gradient(circle at 30% 30%, ${colors.main}15, transparent 60%)`,
        }}
      />

      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track with glass effect */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />

        {/* Soft glow behind */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.main}
          strokeWidth={strokeWidth + 2}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: 0.2,
            filter: 'blur(6px)',
          }}
        />

        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#glass-gradient-${size})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />

        <defs>
          <linearGradient id={`glass-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.secondary} stopOpacity={0.9} />
            <stop offset="100%" stopColor={colors.main} />
          </linearGradient>
        </defs>
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold text-white tabular-nums">
          {animatedScore}
        </span>
        <div className="flex items-center gap-1.5 mt-1">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: colors.main }}
          />
          <span
            className="text-[11px] font-medium uppercase tracking-wider"
            style={{ color: colors.secondary }}
          >
            {colors.label}
          </span>
        </div>
      </div>
    </div>
  );
}
