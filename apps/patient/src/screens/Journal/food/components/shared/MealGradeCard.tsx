/**
 * MealGradeCard - Shows health grade for a meal using Food Intelligence data
 * Used in Photo AI and Text AI results views
 * Uses pre-computed grades from our food intelligence database
 */

import { Trophy, Sparkles, Lightbulb, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { WellnessFocus, HealthGrade } from '../food-comparison/types';
import { FOCUS_LABELS } from '../food-comparison/utils';
import type { FoodIntelligence, FoodFocusGrades } from '../photo-analysis/types';
import { HealthGradeBadge } from '../food-comparison/components/HealthGradeBadge';

interface MealGradeCardProps {
  /** Food intelligence data from the analyzed items */
  intelligence: FoodIntelligence | null;
  /** Food name for display */
  foodName?: string;
  /** Selected wellness focus */
  focus: WellnessFocus;
}

// Map WellnessFocus IDs to FoodFocusGrades keys
function mapFocusToGradeKey(focus: string): keyof FoodFocusGrades {
  const mapping: Record<string, keyof FoodFocusGrades> = {
    energy_endurance: 'energy',
    blood_sugar_balance: 'blood_sugar',
    bone_joint_support: 'bone_joint',
  };
  return (mapping[focus] || focus) as keyof FoodFocusGrades;
}

/**
 * Get grade-specific header text
 */
function getGradeHeader(grade: string): { text: string; subtext: string } {
  const letter = grade.charAt(0).toUpperCase();
  switch (letter) {
    case 'A':
      return { text: 'Excellent Choice', subtext: 'A nutritious option for your goals' };
    case 'B':
      return { text: 'Good Choice', subtext: 'Solid nutrition with minor trade-offs' };
    case 'C':
      return { text: 'Average Choice', subtext: 'Moderate nutrition — balance with healthier options' };
    case 'D':
      return { text: 'Below Average', subtext: 'Consider healthier alternatives when possible' };
    case 'F':
      return { text: 'Poor Choice', subtext: 'Best as an occasional treat, not a regular choice' };
    default:
      return { text: 'Analyzed', subtext: 'Review the details below' };
  }
}

/**
 * Convert letter grade to HealthGrade type
 */
function toHealthGrade(grade: string): HealthGrade {
  const letter = grade.charAt(0).toUpperCase();
  if (['A', 'B', 'C', 'D', 'F'].includes(letter)) {
    return letter as HealthGrade;
  }
  return 'C'; // Default
}

/**
 * Get gradient class based on grade
 */
function getGradientClass(grade: string): string {
  const letter = grade.charAt(0).toUpperCase();
  if (letter === 'A' || letter === 'B') {
    return 'from-emerald-500/15 via-teal-500/10 to-cyan-500/5 border-emerald-500/30';
  }
  if (letter === 'C') {
    return 'from-amber-500/15 via-yellow-500/10 to-orange-500/5 border-amber-500/30';
  }
  return 'from-red-500/15 via-orange-500/10 to-amber-500/5 border-red-500/30';
}

export function MealGradeCard({
  intelligence,
  foodName,
  focus,
}: MealGradeCardProps): React.ReactElement | null {
  // Get the focus grade
  const gradeKey = mapFocusToGradeKey(focus);
  const focusGrade = intelligence?.focusGrades?.[gradeKey];

  // If no intelligence data or no grade, don't render
  if (!intelligence || !focusGrade) {
    return null;
  }

  const grade = focusGrade.grade;
  const focusLabel = focus === 'balanced' ? 'Overall' : FOCUS_LABELS[focus] || focus.replace(/_/g, ' ');
  const { text: headerText, subtext: headerSubtext } = getGradeHeader(grade);
  const gradientClass = getGradientClass(grade);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradientClass} border p-4`}>
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />

      <div className="relative">
        {/* Header with grade badge */}
        <div className="flex items-start gap-3 mb-3">
          <HealthGradeBadge grade={toHealthGrade(grade)} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">{headerText}</p>
            <p className="text-xs text-text-muted">{headerSubtext}</p>
            <p className="text-[10px] text-text-muted mt-1">
              {focusLabel} Focus{foodName ? ` • ${foodName}` : ''}
            </p>
          </div>
        </div>

        {/* Focus-specific insight */}
        {focusGrade.insight && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] mb-3">
            <Lightbulb size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-text-secondary leading-relaxed">{focusGrade.insight}</p>
          </div>
        )}

        {/* Pros & Cons */}
        {(focusGrade.pros.length > 0 || focusGrade.cons.length > 0) && (
          <div className="space-y-2 pt-3 border-t border-white/[0.08]">
            {/* Pros (Strengths) */}
            {focusGrade.pros.slice(0, 2).map((pro: string, idx: number) => (
              <div key={`p-${idx}`} className="flex items-start gap-2">
                <div className="shrink-0 mt-0.5">
                  {grade.charAt(0) === 'A' || grade.charAt(0) === 'B' ? (
                    <Trophy size={12} className="text-emerald-400" />
                  ) : (
                    <ThumbsUp size={12} className="text-emerald-400" />
                  )}
                </div>
                <p className="text-xs text-emerald-400/90 leading-relaxed">{pro}</p>
              </div>
            ))}

            {/* Cons (Concerns) */}
            {focusGrade.cons.slice(0, 2).map((con: string, idx: number) => (
              <div key={`c-${idx}`} className="flex items-start gap-2">
                <ThumbsDown size={12} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-400/90 leading-relaxed">{con}</p>
              </div>
            ))}
          </div>
        )}

        {/* General insight (if no focus insight but has general insight) */}
        {!focusGrade.insight && intelligence.insight && (
          <div className="flex items-start gap-2 mt-3 pt-3 border-t border-white/[0.08]">
            <Sparkles size={12} className="text-violet-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-text-muted leading-relaxed">{intelligence.insight}</p>
          </div>
        )}
      </div>
    </div>
  );
}
