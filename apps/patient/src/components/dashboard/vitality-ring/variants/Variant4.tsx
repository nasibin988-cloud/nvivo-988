/**
 * Variant 4: Premium Dark
 * Deep shadows, sophisticated gradients, luxury aesthetic
 */

import type { Variant4Props } from '../types';

export default function Variant4({
  score: _score,
  animatedScore,
  colors,
  size,
  strokeWidth,
  animation = 0,
}: Variant4Props): JSX.Element {
  const radius = (size - strokeWidth * 2.5) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Animation 1: Gentle Breathe - soft pulsing glow */}
      {animation === 1 && (
        <div
          className="absolute rounded-full"
          style={{
            width: size * 1.4,
            height: size * 1.4,
            background: `radial-gradient(circle, ${colors.main}50 0%, ${colors.main}20 40%, transparent 70%)`,
            animation: 'breathe 3s ease-in-out infinite',
          }}
        />
      )}

      {/* Animation 2: Orbiting Particle - single dot orbits the ring */}
      {animation === 2 && (
        <div
          className="absolute"
          style={{
            width: size,
            height: size,
            animation: 'orbit 8s linear infinite',
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 6,
              height: 6,
              background: colors.main,
              boxShadow: `0 0 12px 3px ${colors.main}`,
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </div>
      )}

      {/* Animation 3: Shimmer Wave - shine travels along the arc */}
      {animation === 3 && (
        <div
          className="absolute rounded-full overflow-hidden"
          style={{
            width: size,
            height: size,
          }}
        >
          <div
            className="absolute"
            style={{
              width: size * 0.3,
              height: size * 2,
              background: `linear-gradient(90deg, transparent, ${colors.main}30, transparent)`,
              animation: 'shimmer 3s ease-in-out infinite',
              transform: 'rotate(-45deg)',
              left: '-20%',
            }}
          />
        </div>
      )}

      {/* Animation 4: Aura Ripple - soft ripples emanate outward */}
      {animation === 4 && (
        <>
          <div
            className="absolute rounded-full"
            style={{
              width: size * 0.9,
              height: size * 0.9,
              border: `1px solid ${colors.main}`,
              animation: 'ripple 5s ease-out infinite',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: size * 0.9,
              height: size * 0.9,
              border: `1px solid ${colors.main}`,
              animation: 'ripple 5s ease-out infinite 1.67s',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: size * 0.9,
              height: size * 0.9,
              border: `1px solid ${colors.main}`,
              animation: 'ripple 5s ease-out infinite 3.33s',
            }}
          />
        </>
      )}

      {/* Deep shadow base */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.75,
          height: size * 0.75,
          background: 'radial-gradient(circle, rgba(0,0,0,0.4) 0%, transparent 70%)',
          filter: 'blur(20px)',
          transform: 'translateY(5px)',
        }}
      />

      {/* Inner circle with subtle gradient */}
      <div
        className="absolute rounded-full"
        style={{
          width: radius * 1.5,
          height: radius * 1.5,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.2) 100%)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      />

      {/* Color accent reflection */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.4,
          height: size * 0.4,
          background: `radial-gradient(circle at 40% 40%, ${colors.main}10, transparent 60%)`,
          top: '20%',
          left: '20%',
        }}
      />

      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        {/* Outer decorative ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius + strokeWidth + 4}
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth={1}
        />

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />

        {/* Progress shadow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 1.5s ease-out',
            transform: 'translate(2px, 2px)',
            filter: 'blur(4px)',
          }}
        />

        {/* Main Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#premium-gradient-${size})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />

        {/* Highlight on arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth / 3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset + (circumference * 0.02)}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />

        <defs>
          <linearGradient id={`premium-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.secondary} />
            <stop offset="40%" stopColor={colors.main} />
            <stop offset="100%" stopColor={colors.main} stopOpacity={0.8} />
          </linearGradient>
        </defs>
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span className="text-5xl font-bold text-white tabular-nums" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
          {animatedScore}
        </span>
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.2em] mt-1.5 px-2 py-0.5 rounded-full"
          style={{
            color: colors.main,
            backgroundColor: `${colors.main}15`,
            border: `1px solid ${colors.main}30`,
          }}
        >
          {colors.label}
        </span>
      </div>

      {/* Animation keyframes */}
      {animation > 0 && (
        <style>{`
          @keyframes breathe {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
          @keyframes orbit {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes shimmer {
            0% { left: -30%; }
            50% { left: 100%; }
            100% { left: 100%; }
          }
          @keyframes ripple {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(1.4); opacity: 0; }
          }
        `}</style>
      )}
    </div>
  );
}
