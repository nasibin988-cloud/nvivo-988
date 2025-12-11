/**
 * MacroOrbDRI - Enhanced macro nutrient display with DRI-based status
 *
 * Uses DRI reference data for proper nutrient classification:
 * - Beneficial nutrients: Green when meeting target
 * - Limit nutrients: Warning when exceeding upper limit
 * - Shows proper status based on nutrient classification
 *
 * This is an enhanced version of MacroOrb that integrates with
 * the DRI-based evaluation system.
 */

import type { LucideIcon } from 'lucide-react';
import { useNutrientTarget } from '../../../../hooks/nutrition';

interface MacroOrbDRIProps {
  nutrientId: string;
  label: string;
  current: number;
  unit: string;
  color: string;
  icon: LucideIcon;
  delay?: number;
  /** Override target (for when DRI lookup isn't available) */
  fallbackTarget?: number;
  /** For nutrients where staying under is the goal */
  isLimitNutrient?: boolean;
  onTap?: () => void;
}

export function MacroOrbDRI({
  nutrientId,
  label,
  current,
  unit,
  color,
  icon: Icon,
  delay = 0,
  fallbackTarget,
  isLimitNutrient = false,
  onTap,
}: MacroOrbDRIProps): React.ReactElement {
  const targetData = useNutrientTarget(nutrientId);

  // Determine target and limits from DRI data or fallback
  const target = targetData?.target ?? fallbackTarget ?? 100;
  const upperLimit = targetData?.upperLimit;

  // Calculate percentages
  const targetPercentage = (current / target) * 100;
  const limitPercentage = upperLimit ? (current / upperLimit) * 100 : null;
  const displayPercentage = Math.min(targetPercentage, 100);

  // Determine status based on nutrient type and DRI data
  const status = getStatus({
    current,
    target,
    upperLimit,
    targetPercentage,
    limitPercentage,
    isLimitNutrient,
  });

  const statusColor = getStatusColor(status, color);
  const overflowAmount = targetPercentage > 100 ? Math.round(targetPercentage - 100) : 0;

  return (
    <button
      onClick={onTap}
      disabled={!onTap}
      className={`flex flex-col items-center group ${onTap ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="relative">
        {/* Glow effect */}
        <div
          className="absolute w-[72px] h-[72px] rounded-full blur-xl transition-opacity duration-500"
          style={{
            backgroundColor: statusColor,
            opacity: status === 'excellent' || status === 'warning' || status === 'danger' ? 0.4 : 0.15,
            animationDelay: `${delay}ms`,
          }}
        />

        {/* Orb container */}
        <div
          className={`relative w-[72px] h-[72px] rounded-full bg-white/[0.03] backdrop-blur-sm border transition-all duration-500 flex flex-col items-center justify-center overflow-hidden ${
            status === 'excellent' || status === 'danger' ? 'border-white/20 shadow-lg' : 'border-white/[0.06]'
          } ${onTap ? 'group-hover:border-white/20' : ''}`}
          style={{
            boxShadow: status !== 'normal' ? `0 0 20px ${statusColor}40, inset 0 0 20px ${statusColor}20` : undefined,
          }}
        >
          {/* Fill from bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
            style={{
              height: `${displayPercentage}%`,
              background: `linear-gradient(to top, ${statusColor}50, ${statusColor}15)`,
              transitionDelay: `${delay}ms`,
            }}
          />

          {/* Shimmer effect for excellent status */}
          {status === 'excellent' && (
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{ animation: 'shimmer 2s infinite' }}
            />
          )}

          {/* Warning pulse for danger status */}
          {status === 'danger' && (
            <div className="absolute inset-0 rounded-full border-2 border-red-500/40 animate-pulse" />
          )}

          {/* Icon */}
          <Icon
            size={18}
            className="relative z-10 transition-all duration-300"
            style={{
              color: statusColor,
              filter: status !== 'normal' ? `drop-shadow(0 0 4px ${statusColor})` : undefined,
            }}
          />

          {/* Value */}
          <span
            className="relative z-10 text-sm font-bold text-white mt-0.5 transition-all duration-300"
            style={{
              textShadow: status !== 'normal' ? `0 0 8px ${statusColor}` : undefined,
            }}
          >
            {Math.round(current)}{unit}
          </span>
        </div>
      </div>

      {/* Label with goal */}
      <div className="mt-2 text-center">
        <span className="text-[10px] text-text-muted uppercase tracking-wider block">{label}</span>
        <span className="text-[9px] text-text-muted/60">
          {isLimitNutrient ? 'limit' : '/'} {target}{unit}
        </span>

        {/* Status badges */}
        {status === 'excellent' && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 block"
            style={{ color: statusColor, backgroundColor: `${statusColor}20` }}
          >
            {overflowAmount > 0 ? `+${overflowAmount}%` : 'On target'}
          </span>
        )}
        {status === 'danger' && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 block text-red-400 bg-red-500/20">
            Over limit
          </span>
        )}
        {status === 'warning' && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 block text-amber-400 bg-amber-500/20">
            Near limit
          </span>
        )}

        {/* DRI info indicator */}
        {targetData && (
          <span className="text-[7px] text-text-muted/40 block mt-0.5">
            {targetData.targetType || 'DRI'}
          </span>
        )}
      </div>
    </button>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

type NutrientStatus = 'excellent' | 'good' | 'normal' | 'warning' | 'danger';

interface StatusParams {
  current: number;
  target: number;
  upperLimit?: number;
  targetPercentage: number;
  limitPercentage: number | null;
  isLimitNutrient: boolean;
}

function getStatus(params: StatusParams): NutrientStatus {
  const { current, upperLimit, targetPercentage, limitPercentage, isLimitNutrient } = params;

  if (isLimitNutrient) {
    // For limit nutrients (sodium, sugar, sat fat), going over is bad
    if (limitPercentage !== null && limitPercentage > 100) return 'danger';
    if (limitPercentage !== null && limitPercentage >= 80) return 'warning';
    if (targetPercentage > 100) return 'warning';
    if (targetPercentage <= 70) return 'excellent'; // Well under limit is good
    return 'normal';
  } else {
    // For beneficial nutrients, meeting target is good
    // But check upper limit if it exists (some vitamins have toxicity concerns)
    if (upperLimit && current > upperLimit) return 'danger';
    if (targetPercentage >= 90 && targetPercentage <= 150) return 'excellent';
    if (targetPercentage >= 70) return 'good';
    if (targetPercentage < 50) return 'warning';
    return 'normal';
  }
}

function getStatusColor(status: NutrientStatus, defaultColor: string): string {
  switch (status) {
    case 'excellent':
      return '#10b981'; // emerald
    case 'good':
      return defaultColor;
    case 'warning':
      return '#f59e0b'; // amber
    case 'danger':
      return '#ef4444'; // red
    default:
      return defaultColor;
  }
}
