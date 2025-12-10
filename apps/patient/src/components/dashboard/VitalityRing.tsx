/**
 * VitalityRing Component
 * Animated ring visualization for wellness vitality score
 */

import { useMemo, useEffect, useState } from 'react';
import {
  type VitalityRingProps,
  type VariantProps,
  getScoreColors,
  calculateVitalityScore,
  Variant1,
  Variant2,
  Variant3,
  Variant4,
  Variant5,
} from './vitality-ring';

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

  const variantProps: VariantProps = { score, animatedScore, colors, size, strokeWidth };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {variant === 1 && <Variant1 {...variantProps} />}
      {variant === 2 && <Variant2 {...variantProps} />}
      {variant === 3 && <Variant3 {...variantProps} />}
      {variant === 4 && <Variant4 {...variantProps} animation={animation} />}
      {variant === 5 && <Variant5 wellnessLog={wellnessLog} {...variantProps} />}
      {variant !== 5 && <span className="text-xs text-text-muted mt-3 font-medium uppercase tracking-[0.15em]">Vitality</span>}
    </div>
  );
}

export { VitalityRingSkeleton } from './vitality-ring';
