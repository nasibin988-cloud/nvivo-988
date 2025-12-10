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
}

export function MacroOrb({
  label,
  current,
  target,
  unit,
  color,
  icon: Icon,
  delay = 0,
}: MacroOrbProps): React.ReactElement {
  const rawPercentage = (current / target) * 100;
  const displayPercentage = Math.min(rawPercentage, 100);
  const isOverGoal = rawPercentage > 100;
  const isNearGoal = rawPercentage >= 90 && rawPercentage < 100;
  const overflowAmount = isOverGoal ? Math.round(rawPercentage - 100) : 0;

  return (
    <div className="flex flex-col items-center group">
      <div className="relative">
        {/* Glow effect */}
        <div
          className="absolute w-[72px] h-[72px] rounded-full blur-xl transition-opacity duration-500"
          style={{
            backgroundColor: color,
            opacity: isOverGoal ? 0.4 : isNearGoal ? 0.3 : 0.15,
            animationDelay: `${delay}ms`,
          }}
        />

        {/* Orb container */}
        <div
          className={`relative w-[72px] h-[72px] rounded-full bg-white/[0.03] backdrop-blur-sm border transition-all duration-500 flex flex-col items-center justify-center overflow-hidden ${
            isOverGoal ? 'border-white/20 shadow-lg' : 'border-white/[0.06]'
          }`}
          style={{
            boxShadow: isOverGoal ? `0 0 20px ${color}40, inset 0 0 20px ${color}20` : undefined,
          }}
        >
          {/* Fill from bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
            style={{
              height: `${displayPercentage}%`,
              background: isOverGoal
                ? `linear-gradient(to top, ${color}50, ${color}25)`
                : `linear-gradient(to top, ${color}40, ${color}15)`,
              transitionDelay: `${delay}ms`,
            }}
          />

          {/* Shimmer effect when at/over goal */}
          {isOverGoal && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{ animation: 'shimmer 2s infinite' }}
            />
          )}

          {/* Icon */}
          <Icon
            size={18}
            className="relative z-10 transition-all duration-300"
            style={{
              color,
              filter: isOverGoal ? `drop-shadow(0 0 4px ${color})` : undefined,
            }}
          />

          {/* Value */}
          <span
            className="relative z-10 text-sm font-bold text-white mt-0.5 transition-all duration-300"
            style={{
              textShadow: isOverGoal ? `0 0 8px ${color}` : undefined,
            }}
          >
            {current}{unit}
          </span>
        </div>
      </div>

      {/* Label with goal */}
      <div className="mt-2 text-center">
        <span className="text-[10px] text-text-muted uppercase tracking-wider block">{label}</span>
        <span className="text-[9px] text-text-muted/60">/ {target}{unit}</span>
        {isOverGoal && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 block"
            style={{ color, backgroundColor: `${color}20` }}
          >
            +{overflowAmount}%
          </span>
        )}
      </div>
    </div>
  );
}
