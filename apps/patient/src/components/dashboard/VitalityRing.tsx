import { useMemo, useEffect, useState } from 'react';
import type { WellnessLog } from '../../hooks/dashboard';

interface VitalityRingProps {
  wellnessLog: WellnessLog | null | undefined;
  size?: number;
  strokeWidth?: number;
  className?: string;
  variant?: 1 | 2 | 3 | 4;
  animation?: 0 | 1 | 2 | 3 | 4; // 0 = none, 1-4 = different animations
}

interface ScoreColors {
  main: string;
  secondary: string;
  label: string;
}

// 5 distinct color categories based on vitality score
function getScoreColors(score: number): ScoreColors {
  if (score >= 90) {
    return { main: '#10B981', secondary: '#34D399', label: 'Optimal' }; // Emerald
  }
  if (score >= 80) {
    return { main: '#3B82F6', secondary: '#60A5FA', label: 'High' }; // Blue
  }
  if (score >= 60) {
    return { main: '#8B5CF6', secondary: '#A78BFA', label: 'Good' }; // Purple
  }
  if (score >= 40) {
    return { main: '#F59E0B', secondary: '#FBBF24', label: 'Moderate' }; // Amber
  }
  return { main: '#EF4444', secondary: '#F87171', label: 'Low' }; // Red
}

function calculateVitalityScore(log: WellnessLog): number {
  const normalizedStress = 11 - log.stress;
  const raw = (log.mood + log.energy + log.sleepQuality + normalizedStress) / 4;
  const score = (raw / 10) * 100;
  return Math.round(Math.min(100, Math.max(0, score)));
}

// ============================================================================
// VARIANT 1: Minimal Zen
// Ultra-clean, thin strokes, subtle gradient, peaceful aesthetic
// ============================================================================
function Variant1({
  score: _score,
  animatedScore,
  colors,
  size,
  strokeWidth,
}: {
  score: number;
  animatedScore: number;
  colors: ScoreColors;
  size: number;
  strokeWidth: number;
}): JSX.Element {
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

// ============================================================================
// VARIANT 2: Neon Pulse
// Vibrant glow, pulsing effects, futuristic cyberpunk vibe
// ============================================================================
function Variant2({
  score: _score,
  animatedScore,
  colors,
  size,
  strokeWidth,
}: {
  score: number;
  animatedScore: number;
  colors: ScoreColors;
  size: number;
  strokeWidth: number;
}): JSX.Element {
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

// ============================================================================
// VARIANT 3: Frosted Glass
// Glassmorphism, soft blur, elegant and modern
// ============================================================================
function Variant3({
  score: _score,
  animatedScore,
  colors,
  size,
  strokeWidth,
}: {
  score: number;
  animatedScore: number;
  colors: ScoreColors;
  size: number;
  strokeWidth: number;
}): JSX.Element {
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

// ============================================================================
// VARIANT 4: Premium Dark
// Deep shadows, sophisticated gradients, luxury aesthetic
// ============================================================================
function Variant4({
  score: _score,
  animatedScore,
  colors,
  size,
  strokeWidth,
  animation = 0,
}: {
  score: number;
  animatedScore: number;
  colors: ScoreColors;
  size: number;
  strokeWidth: number;
  animation?: 0 | 1 | 2 | 3 | 4;
}): JSX.Element {
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function VitalityRing({
  wellnessLog,
  size = 160,
  strokeWidth = 8,
  className = '',
  variant = 1,
  animation = 0,
}: VitalityRingProps): JSX.Element {
  const [animatedScore, setAnimatedScore] = useState(0);

  const score = useMemo(() => {
    if (!wellnessLog) return null;
    return calculateVitalityScore(wellnessLog);
  }, [wellnessLog]);

  const colors = useMemo(() => {
    return getScoreColors(score ?? 0);
  }, [score]);

  useEffect(() => {
    if (score === null) {
      setAnimatedScore(0);
      return;
    }
    const timer = setTimeout(() => setAnimatedScore(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = (size - strokeWidth * 2) / 2;

  // No data state
  if (!wellnessLog || score === null) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={strokeWidth}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-text-muted text-sm">No data</span>
            <span className="text-text-muted text-xs mt-1">Log wellness</span>
          </div>
        </div>
        <span className="text-xs text-text-muted mt-3 font-medium uppercase tracking-wider">Vitality</span>
      </div>
    );
  }

  const variantProps = { score, animatedScore, colors, size, strokeWidth };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {variant === 1 && <Variant1 {...variantProps} />}
      {variant === 2 && <Variant2 {...variantProps} />}
      {variant === 3 && <Variant3 {...variantProps} />}
      {variant === 4 && <Variant4 {...variantProps} animation={animation} />}
      <span className="text-xs text-text-muted mt-3 font-medium uppercase tracking-[0.15em]">Vitality</span>
    </div>
  );
}

export function VitalityRingSkeleton({
  size = 160,
  strokeWidth = 8,
}: {
  size?: number;
  strokeWidth?: number;
}): JSX.Element {
  const radius = (size - strokeWidth * 2) / 2;

  return (
    <div className="flex flex-col items-center justify-center animate-pulse">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="w-14 h-10 bg-surface-2 rounded" />
          <div className="w-16 h-4 bg-surface-2 rounded" />
        </div>
      </div>
      <div className="w-14 h-3 bg-surface-2 rounded mt-3" />
    </div>
  );
}
