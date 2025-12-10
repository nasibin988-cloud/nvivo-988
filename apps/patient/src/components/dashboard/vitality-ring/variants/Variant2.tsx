/**
 * Variant 2: Neon Pulse
 * Vibrant glow, pulsing effects, futuristic cyberpunk vibe
 */

import type { VariantProps } from '../types';

export default function Variant2({
  score: _score,
  animatedScore,
  colors,
  size,
  strokeWidth,
}: VariantProps): JSX.Element {
  const radius = (size - strokeWidth * 3) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer neon glow - intense */}
      <div
        className="absolute rounded-full animate-pulse"
        style={{
          width: size * 1.3,
          height: size * 1.3,
          background: `radial-gradient(circle, ${colors.main}40 0%, ${colors.main}10 40%, transparent 70%)`,
          filter: 'blur(25px)',
        }}
      />

      {/* Rotating light beam */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 1.1,
          height: size * 1.1,
          background: `conic-gradient(from 0deg, transparent, ${colors.main}60, transparent 30%)`,
          filter: 'blur(15px)',
          animation: 'spin 4s linear infinite',
        }}
      />

      {/* Inner glow pulse */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.85,
          height: size * 0.85,
          background: `radial-gradient(circle, ${colors.main}15 0%, transparent 60%)`,
          animation: 'pulse 2s ease-in-out infinite',
        }}
      />

      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        {/* Outer ring decoration */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius + strokeWidth + 6}
          fill="none"
          stroke={colors.main}
          strokeWidth={0.5}
          opacity={0.2}
        />

        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />

        {/* Glow behind arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.main}
          strokeWidth={strokeWidth + 8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 1.5s ease-out',
            opacity: 0.3,
            filter: 'blur(10px)',
          }}
        />

        {/* Main Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#neon-gradient-${size})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 1.5s ease-out',
            filter: `drop-shadow(0 0 6px ${colors.main})`,
          }}
        />

        <defs>
          <linearGradient id={`neon-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.secondary} />
            <stop offset="50%" stopColor={colors.main} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>
        </defs>
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <div className="relative">
          <span
            className="absolute text-5xl font-black blur-md tabular-nums"
            style={{ color: colors.main, opacity: 0.5 }}
          >
            {animatedScore}
          </span>
          <span className="relative text-5xl font-black text-white tabular-nums">
            {animatedScore}
          </span>
        </div>
        <span
          className="text-xs font-bold uppercase tracking-widest mt-1"
          style={{ color: colors.main, textShadow: `0 0 10px ${colors.main}` }}
        >
          {colors.label}
        </span>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
}
