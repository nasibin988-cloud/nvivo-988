/**
 * MacroOrb - Animated macro nutrient display with fill-from-bottom effect
 * Shows progress towards daily macro targets with glow and shimmer effects
 */

import type { LucideIcon } from 'lucide-react';

interface MacroOrbProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  icon: LucideIcon;
  delay?: number;
  /** For nutrients like sodium/sugar where staying under is good */
  invertProgress?: boolean;
}

export function MacroOrb({
  label,
  current,
  target,
  unit,
  color,
  icon: Icon,
  delay = 0,
  invertProgress = false,
}: MacroOrbProps): React.ReactElement {
  const rawPercentage = (current / target) * 100;
  const displayPercentage = Math.min(rawPercentage, 100);

  // For inverted progress (sodium, sugar), going over is bad
  const isOverLimit = invertProgress && rawPercentage > 100;
  const isNearLimit = invertProgress && rawPercentage >= 80 && rawPercentage < 100;

  // For regular macros, hitting 100% is good
  const isOverGoal = !invertProgress && rawPercentage > 100;
  const isNearGoal = !invertProgress && rawPercentage >= 90 && rawPercentage < 100;

  const overflowAmount = rawPercentage > 100 ? Math.round(rawPercentage - 100) : 0;

  // Determine visual state
  const showGlow = isOverGoal || isOverLimit || isNearGoal || isNearLimit;
  const showShimmer = isOverGoal; // Only positive achievements get shimmer
  const showWarning = isOverLimit; // Over limit for inverted metrics

  return (
    <div className="flex flex-col items-center group">
      <div className="relative">
        {/* Glow effect */}
        <div
          className="absolute w-[72px] h-[72px] rounded-full blur-xl transition-opacity duration-500"
          style={{
            backgroundColor: isOverLimit ? '#ef4444' : color,
            opacity: isOverGoal || isOverLimit ? 0.4 : isNearGoal || isNearLimit ? 0.3 : 0.15,
            animationDelay: `${delay}ms`,
          }}
        />

        {/* Orb container */}
        <div
          className={`relative w-[72px] h-[72px] rounded-full bg-white/[0.03] backdrop-blur-sm border transition-all duration-500 flex flex-col items-center justify-center overflow-hidden ${
            isOverGoal || isOverLimit ? 'border-white/20 shadow-lg' : 'border-white/[0.06]'
          }`}
          style={{
            boxShadow: showGlow ? `0 0 20px ${isOverLimit ? '#ef444440' : `${color}40`}, inset 0 0 20px ${isOverLimit ? '#ef444420' : `${color}20`}` : undefined,
          }}
        >
          {/* Fill from bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
            style={{
              height: `${displayPercentage}%`,
              background: isOverLimit
                ? `linear-gradient(to top, #ef444450, #ef444425)`
                : isOverGoal
                ? `linear-gradient(to top, ${color}50, ${color}25)`
                : `linear-gradient(to top, ${color}40, ${color}15)`,
              transitionDelay: `${delay}ms`,
            }}
          />

          {/* Shimmer effect when at/over goal (not for warnings) */}
          {showShimmer && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{ animation: 'shimmer 2s infinite' }}
            />
          )}

          {/* Warning pulse for over limit */}
          {showWarning && (
            <div
              className="absolute inset-0 rounded-full border-2 border-red-500/40 animate-pulse"
            />
          )}

          {/* Icon */}
          <Icon
            size={18}
            className="relative z-10 transition-all duration-300"
            style={{
              color: isOverLimit ? '#ef4444' : color,
              filter: isOverGoal || isOverLimit ? `drop-shadow(0 0 4px ${isOverLimit ? '#ef4444' : color})` : undefined,
            }}
          />

          {/* Value */}
          <span
            className="relative z-10 text-sm font-bold text-white mt-0.5 transition-all duration-300"
            style={{
              textShadow: isOverGoal || isOverLimit ? `0 0 8px ${isOverLimit ? '#ef4444' : color}` : undefined,
            }}
          >
            {current}{unit}
          </span>
        </div>
      </div>

      {/* Label with goal */}
      <div className="mt-2 text-center">
        <span className="text-[10px] text-text-muted uppercase tracking-wider block">{label}</span>
        <span className="text-[9px] text-text-muted/60">{invertProgress ? 'Limit' : '/'} {target}{unit}</span>
        {isOverGoal && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 block"
            style={{ color, backgroundColor: `${color}20` }}
          >
            +{overflowAmount}%
          </span>
        )}
        {isOverLimit && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 block text-red-400 bg-red-500/20"
          >
            Over +{overflowAmount}%
          </span>
        )}
      </div>
    </div>
  );
}
