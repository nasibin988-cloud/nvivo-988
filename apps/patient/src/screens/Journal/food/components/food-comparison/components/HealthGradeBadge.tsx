/**
 * HealthGradeBadge - Visual display of food health grade
 */

import type { HealthGrade } from '../types';
import { GRADE_COLORS } from '../utils';

interface HealthGradeBadgeProps {
  grade: HealthGrade;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const GRADE_LABELS: Record<HealthGrade, string> = {
  A: 'Excellent',
  B: 'Good',
  C: 'Average',
  D: 'Below Avg',
  F: 'Poor',
};

export function HealthGradeBadge({
  grade,
  size = 'md',
  showLabel = false,
}: HealthGradeBadgeProps): React.ReactElement {
  const colors = GRADE_COLORS[grade];

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-3xl',
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${sizeClasses[size]} rounded-xl ${colors.bg} ${colors.text} border ${colors.border} flex items-center justify-center font-bold shadow-lg`}
      >
        {grade}
      </div>
      {showLabel && (
        <span className={`text-[10px] font-medium ${colors.text}`}>
          {GRADE_LABELS[grade]}
        </span>
      )}
    </div>
  );
}
