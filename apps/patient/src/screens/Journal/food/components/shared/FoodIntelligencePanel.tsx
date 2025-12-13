/**
 * FoodIntelligencePanel - Displays food intelligence data
 *
 * Shows contextual information about a food item including:
 * - Focus-specific grade (for user's selected focus)
 * - Insight one-liner
 * - Context-aware metrics (GI, satiety, etc.)
 * - Dietary tags and allergens
 *
 * Uses progressive disclosure - compact by default, expandable for details.
 */

import { useState } from 'react';
import {
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Flame,
  Brain,
  Info,
} from 'lucide-react';
import type { FoodIntelligence, FocusGrade, FoodFocusGrades, GradingResult, FoodInsight, WellnessFocus } from '../photo-analysis/types';

// Focus display names - supports both NutritionFocusId and WellnessFocus variants
const FOCUS_LABELS: Record<string, string> = {
  // NutritionFocusId values
  balanced: 'Balanced',
  muscle_building: 'Muscle Building',
  heart_health: 'Heart Health',
  energy: 'Energy',
  weight_management: 'Weight Management',
  brain_focus: 'Brain & Focus',
  gut_health: 'Gut Health',
  blood_sugar: 'Blood Sugar',
  bone_joint: 'Bone & Joint',
  anti_inflammatory: 'Anti-Inflammatory',
  // WellnessFocus variants (for compatibility)
  energy_endurance: 'Energy',
  blood_sugar_balance: 'Blood Sugar',
  bone_joint_support: 'Bone & Joint',
};

// Map WellnessFocus IDs to FoodFocusGrades keys
function mapFocusToGradeKey(focus: string): keyof FoodFocusGrades {
  const mapping: Record<string, keyof FoodFocusGrades> = {
    energy_endurance: 'energy',
    blood_sugar_balance: 'blood_sugar',
    bone_joint_support: 'bone_joint',
  };
  return (mapping[focus] || focus) as keyof FoodFocusGrades;
}

interface FoodIntelligencePanelProps {
  /** Legacy intelligence data (v1) */
  intelligence?: FoodIntelligence;
  /** V2 grading result with overall + focus grades */
  grading?: GradingResult;
  /** V2 AI-generated insight */
  insight?: FoodInsight;
  /** User's current nutrition focus (accepts NutritionFocusId or WellnessFocus) */
  userFocus?: WellnessFocus | string;
  /** Compact mode - shows only grade and insight */
  compact?: boolean;
}

/**
 * Get grade color based on letter grade
 */
function getGradeColor(grade: string): { bg: string; text: string; border: string } {
  const letter = grade.charAt(0).toUpperCase();
  switch (letter) {
    case 'A':
      return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case 'B':
      return { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' };
    case 'C':
      return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'D':
      return { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' };
    case 'F':
      return { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' };
    default:
      return { bg: 'bg-white/10', text: 'text-text-secondary', border: 'border-white/20' };
  }
}

/**
 * Format GI category with color
 */
function GIBadge({ gi, category }: { gi: number; category?: string }): React.ReactElement {
  const colors = {
    low: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
    medium: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
    high: { bg: 'bg-rose-500/15', text: 'text-rose-400' },
  };
  const cat = category || (gi <= 55 ? 'low' : gi <= 69 ? 'medium' : 'high');
  const color = colors[cat as keyof typeof colors] || colors.medium;

  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${color.bg} ${color.text}`}>
      GI {gi}
    </span>
  );
}

/**
 * NOVA class badge
 */
function NOVABadge({ novaClass }: { novaClass: 1 | 2 | 3 | 4 }): React.ReactElement {
  const colors = [
    { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
    { bg: 'bg-blue-500/15', text: 'text-blue-400' },
    { bg: 'bg-amber-500/15', text: 'text-amber-400' },
    { bg: 'bg-rose-500/15', text: 'text-rose-400' },
  ];
  const color = colors[novaClass - 1];

  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${color.bg} ${color.text}`}>
      NOVA {novaClass}
    </span>
  );
}

/**
 * Satiety score indicator
 */
function SatietyIndicator({ score }: { score: number }): React.ReactElement {
  const level = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
  const colors = {
    high: 'text-emerald-400',
    medium: 'text-amber-400',
    low: 'text-rose-400',
  };

  return (
    <div className="flex items-center gap-1">
      <Flame size={12} className={colors[level]} />
      <span className={`text-[10px] font-medium ${colors[level]}`}>
        {level === 'high' ? 'Very filling' : level === 'medium' ? 'Moderately filling' : 'Low satiety'}
      </span>
    </div>
  );
}

/**
 * Focus grade display with pros/cons
 */
function FocusGradeCard({
  grade,
  focusId,
  expanded,
}: {
  grade: FocusGrade;
  focusId: string;
  expanded: boolean;
}): React.ReactElement {
  const color = getGradeColor(grade.grade);

  return (
    <div className={`rounded-lg ${color.bg} border ${color.border} p-2.5`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-text-secondary">{FOCUS_LABELS[focusId] || focusId}</span>
        <span className={`text-lg font-bold ${color.text}`}>{grade.grade}</span>
      </div>
      <p className="text-[11px] text-text-muted leading-relaxed">{grade.insight}</p>

      {expanded && (grade.pros.length > 0 || grade.cons.length > 0) && (
        <div className="mt-2 pt-2 border-t border-white/[0.06] space-y-1.5">
          {grade.pros.length > 0 && (
            <div className="flex items-start gap-1.5">
              <ThumbsUp size={10} className="text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-[10px] text-text-muted">{grade.pros.join(', ')}</span>
            </div>
          )}
          {grade.cons.length > 0 && (
            <div className="flex items-start gap-1.5">
              <ThumbsDown size={10} className="text-rose-400 mt-0.5 flex-shrink-0" />
              <span className="text-[10px] text-text-muted">{grade.cons.join(', ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * V2 AI Insight Display
 */
function V2InsightDisplay({ insight, expanded }: { insight: FoodInsight; expanded: boolean }): React.ReactElement {
  return (
    <div className="space-y-2">
      {/* Summary */}
      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.02]">
        <Brain size={14} className="text-violet-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-text-secondary leading-relaxed">{insight.summary}</p>
      </div>

      {/* Focus explanation */}
      {insight.focusExplanation && (
        <div className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.015]">
          <Info size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-text-muted leading-relaxed">{insight.focusExplanation}</p>
        </div>
      )}

      {/* Tips and Considerations - shown when expanded */}
      {expanded && (
        <div className="space-y-1.5 pt-1">
          {insight.tips.length > 0 && (
            <div className="space-y-1">
              {insight.tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <ThumbsUp size={10} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-[10px] text-text-muted">{tip}</span>
                </div>
              ))}
            </div>
          )}
          {insight.considerations.length > 0 && (
            <div className="space-y-1">
              {insight.considerations.map((consideration, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <AlertTriangle size={10} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <span className="text-[10px] text-text-muted">{consideration}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Dual grade display (Overall + Focus)
 */
function DualGradeDisplay({
  grading,
  userFocus,
}: {
  grading: GradingResult;
  userFocus: string;
}): React.ReactElement {
  const gradeKey = mapFocusToGradeKey(userFocus);
  const focusGrade = grading.focusGrades[gradeKey];
  const overallColor = getGradeColor(grading.overall.grade);
  const focusColor = focusGrade ? getGradeColor(focusGrade.grade) : null;

  return (
    <div className="flex items-center gap-2">
      {/* Overall Nutri-Score Grade */}
      <div className={`px-2 py-1 rounded-lg ${overallColor.bg} ${overallColor.border} border`}>
        <div className="flex items-center gap-1.5">
          <span className={`text-lg font-bold ${overallColor.text}`}>{grading.overall.grade}</span>
          <span className="text-[9px] text-text-muted">Overall</span>
        </div>
      </div>

      {/* Focus-specific Grade */}
      {focusGrade && focusColor && (
        <div className={`px-2 py-1 rounded-lg ${focusColor.bg} ${focusColor.border} border`}>
          <div className="flex items-center gap-1.5">
            <span className={`text-lg font-bold ${focusColor.text}`}>{focusGrade.grade}</span>
            <span className="text-[9px] text-text-muted">{FOCUS_LABELS[userFocus] || userFocus.replace(/_/g, ' ')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FoodIntelligencePanel({
  intelligence,
  grading,
  insight,
  userFocus = 'balanced',
  compact = false,
}: FoodIntelligencePanelProps): React.ReactElement | null {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine if we have v2 data
  const hasV2Data = grading || insight;

  // Get the user's focus grade (map WellnessFocus to FoodFocusGrades key if needed)
  const gradeKey = mapFocusToGradeKey(userFocus);
  const focusGrade = grading?.focusGrades[gradeKey] || intelligence?.focusGrades?.[gradeKey];

  // If no data at all, don't render
  if (!hasV2Data && !intelligence?.insight && !focusGrade && !intelligence?.glycemicIndex) {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-white/[0.06]">
      {/* Header with grade badges */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles size={12} className="text-violet-400" />
          <span className="text-xs font-medium text-text-secondary">
            {hasV2Data ? 'AI Analysis' : 'Food Intelligence'}
          </span>
        </div>

        {/* V2: Dual grade display */}
        {grading && <DualGradeDisplay grading={grading} userFocus={userFocus} />}

        {/* V1 fallback: Single focus grade */}
        {!grading && focusGrade && (
          <div className={`px-2 py-0.5 rounded-full ${getGradeColor(focusGrade.grade).bg} ${getGradeColor(focusGrade.grade).border} border`}>
            <span className={`text-xs font-bold ${getGradeColor(focusGrade.grade).text}`}>
              {focusGrade.grade} for {FOCUS_LABELS[userFocus] || userFocus.replace(/_/g, ' ')}
            </span>
          </div>
        )}
      </div>

      {/* V2 AI Insight */}
      {insight && <V2InsightDisplay insight={insight} expanded={isExpanded} />}

      {/* V1 Insight fallback */}
      {!insight && intelligence?.insight && (
        <div className="flex items-start gap-2 mb-2.5 p-2 rounded-lg bg-white/[0.02]">
          <Lightbulb size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-text-secondary leading-relaxed">{intelligence.insight}</p>
        </div>
      )}

      {/* Quick metrics row - V2 uses grading data, V1 uses intelligence data */}
      <div className="flex flex-wrap items-center gap-2 mb-2 mt-2">
        {/* GI from grading or intelligence */}
        {intelligence?.glycemicIndex !== undefined && (
          <GIBadge gi={intelligence.glycemicIndex} category={intelligence.glycemicCategory} />
        )}

        {/* NOVA class */}
        {intelligence?.novaClass && <NOVABadge novaClass={intelligence.novaClass} />}

        {/* Satiety - V2 or V1 */}
        {grading?.satiety && (
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              grading.satiety.category === 'very_high' || grading.satiety.category === 'high'
                ? 'bg-emerald-500/15 text-emerald-400'
                : grading.satiety.category === 'moderate'
                ? 'bg-amber-500/15 text-amber-400'
                : 'bg-rose-500/15 text-rose-400'
            }`}
          >
            <Flame size={10} className="inline mr-0.5" />
            {grading.satiety.category === 'very_high' ? 'Very filling' :
             grading.satiety.category === 'high' ? 'Filling' :
             grading.satiety.category === 'moderate' ? 'Moderate' : 'Low satiety'}
          </span>
        )}
        {!grading?.satiety && intelligence?.satietyScore !== undefined && (
          <SatietyIndicator score={intelligence.satietyScore} />
        )}

        {/* Inflammatory - V2 or V1 */}
        {grading?.inflammatory && (
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              grading.inflammatory.category === 'anti_inflammatory'
                ? 'bg-emerald-500/15 text-emerald-400'
                : grading.inflammatory.category === 'inflammatory'
                ? 'bg-rose-500/15 text-rose-400'
                : 'bg-amber-500/15 text-amber-400'
            }`}
          >
            {grading.inflammatory.category === 'anti_inflammatory' ? 'Anti-inflammatory' :
             grading.inflammatory.category === 'inflammatory' ? 'Inflammatory' :
             grading.inflammatory.category === 'mildly_inflammatory' ? 'Mildly inflammatory' : 'Neutral'}
          </span>
        )}
        {!grading?.inflammatory && intelligence?.inflammatoryIndex !== undefined && (
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              intelligence.inflammatoryIndex < 0
                ? 'bg-emerald-500/15 text-emerald-400'
                : intelligence.inflammatoryIndex > 1
                ? 'bg-rose-500/15 text-rose-400'
                : 'bg-amber-500/15 text-amber-400'
            }`}
          >
            {intelligence.inflammatoryIndex < 0 ? 'Anti-inflammatory' : intelligence.inflammatoryIndex > 1 ? 'Inflammatory' : 'Neutral'}
          </span>
        )}
      </div>

      {/* V2 Strengths and Concerns */}
      {grading && isExpanded && (grading.strengths.length > 0 || grading.concerns.length > 0) && (
        <div className="space-y-1.5 mb-2 pt-1 border-t border-white/[0.04]">
          {grading.strengths.length > 0 && (
            <div className="flex items-start gap-1.5">
              <ThumbsUp size={10} className="text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-[10px] text-text-muted">{grading.strengths.join(' • ')}</span>
            </div>
          )}
          {grading.concerns.length > 0 && (
            <div className="flex items-start gap-1.5">
              <ThumbsDown size={10} className="text-rose-400 mt-0.5 flex-shrink-0" />
              <span className="text-[10px] text-text-muted">{grading.concerns.join(' • ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Dietary tags - V1 only */}
      {intelligence?.dietaryTags && intelligence.dietaryTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {intelligence.dietaryTags.slice(0, isExpanded ? undefined : 4).map((tag) => (
            <span
              key={tag}
              className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white/[0.04] text-text-muted border border-white/[0.06]"
            >
              {tag.replace(/_/g, ' ')}
            </span>
          ))}
          {!isExpanded && intelligence.dietaryTags.length > 4 && (
            <span className="text-[9px] text-text-muted">+{intelligence.dietaryTags.length - 4} more</span>
          )}
        </div>
      )}

      {/* Allergens warning - V1 only */}
      {intelligence?.allergens && intelligence.allergens.length > 0 && (
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 mb-2">
          <AlertTriangle size={12} className="text-rose-400 flex-shrink-0" />
          <span className="text-[10px] font-medium text-rose-400">
            Contains: {intelligence.allergens.join(', ')}
          </span>
        </div>
      )}

      {/* Expand/collapse for more details */}
      {!compact && (focusGrade || grading || insight) && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-1 py-1.5 text-[10px] font-medium text-text-muted hover:text-text-secondary transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={12} />
                Show less
              </>
            ) : (
              <>
                <ChevronDown size={12} />
                {insight ? 'Show tips & details' : 'Show grade details'}
              </>
            )}
          </button>

          {/* V1 Focus Grade Details */}
          {isExpanded && !grading && focusGrade && (
            <div className="mt-2 space-y-2">
              <FocusGradeCard grade={focusGrade} focusId={userFocus} expanded={true} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
