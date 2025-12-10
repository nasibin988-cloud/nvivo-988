/**
 * Variant 1: Minimal Zen
 * Ultra-clean, thin strokes, subtle gradient, peaceful aesthetic
 */

import type { VariantProps } from '../types';

export default function Variant1({
  score: _score,
  animatedScore,
  colors,
  size,
  strokeWidth,
}: VariantProps): JSX.Element {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Subtle ambient glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          background: `radial-gradient(circle, ${colors.main}20 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
      />

      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track - very subtle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={strokeWidth}
        />

        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#zen-gradient-${size})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />

        <defs>
          <linearGradient id={`zen-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.main} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>
        </defs>
      </svg>

      {/* Center Content - minimal */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-extralight text-white tabular-nums tracking-tight">
          {animatedScore}
        </span>
        <span
          className="text-[10px] font-medium uppercase tracking-[0.3em] mt-1"
          style={{ color: colors.main }}
        >
          {colors.label}
        </span>
      </div>
    </div>
  );
}
