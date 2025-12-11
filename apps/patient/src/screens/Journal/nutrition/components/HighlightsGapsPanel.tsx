/**
 * HighlightsGapsPanel - Shows what user did well and areas to improve
 *
 * Displays:
 * - Highlights: Nutrients where user met or exceeded targets (beneficial)
 * - Gaps: Nutrients where user fell short or went over limits
 *
 * Uses the DayEvaluation data from useNutritionDayEvaluation hook.
 */

import { useState } from 'react';
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Sparkles, Target } from 'lucide-react';
import { useNutritionDayEvaluation } from '../../../../hooks/nutrition';

interface HighlightsGapsPanelProps {
  date: string;
  totals: Record<string, number> | null;
  onNutrientTap?: (nutrientId: string) => void;
}

export function HighlightsGapsPanel({
  date,
  totals,
  onNutrientTap,
}: HighlightsGapsPanelProps): React.ReactElement | null {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: evaluation, isLoading } = useNutritionDayEvaluation(date, totals);

  // Don't render if no data
  if (!totals || Object.keys(totals).length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-4 animate-pulse">
        <div className="h-4 w-32 bg-white/10 rounded mb-3" />
        <div className="space-y-2">
          <div className="h-8 bg-white/5 rounded-lg" />
          <div className="h-8 bg-white/5 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return null;
  }

  const { highlights, gaps } = evaluation;
  const hasHighlights = highlights.length > 0;
  const hasGaps = gaps.length > 0;

  // Show top 2 of each when collapsed, all when expanded
  const visibleHighlights = isExpanded ? highlights : highlights.slice(0, 2);
  const visibleGaps = isExpanded ? gaps : gaps.slice(0, 2);
  const totalHidden = (highlights.length - 2) + (gaps.length - 2);
  const showExpandButton = totalHidden > 0;

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/[0.04]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Target size={14} className="text-emerald-400" />
            Today's Insights
          </h3>
          <div className="flex items-center gap-3 text-[10px]">
            {hasHighlights && (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 size={10} />
                {highlights.length} achieved
              </span>
            )}
            {hasGaps && (
              <span className="flex items-center gap-1 text-amber-400">
                <AlertCircle size={10} />
                {gaps.length} to improve
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Highlights Section */}
        {hasHighlights && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={12} className="text-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                What you did well
              </span>
            </div>
            <div className="space-y-1.5">
              {visibleHighlights.map((highlight, index) => (
                <InsightItem
                  key={`highlight-${index}`}
                  text={highlight}
                  type="highlight"
                  onTap={onNutrientTap ? () => {
                    // Extract nutrient from highlight text (first word usually)
                    const nutrientMatch = highlight.match(/^(\w+)/);
                    if (nutrientMatch) {
                      onNutrientTap(nutrientMatch[1].toLowerCase());
                    }
                  } : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {/* Gaps Section */}
        {hasGaps && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={12} className="text-amber-400" />
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                Areas to improve
              </span>
            </div>
            <div className="space-y-1.5">
              {visibleGaps.map((gap, index) => (
                <InsightItem
                  key={`gap-${index}`}
                  text={gap}
                  type="gap"
                  onTap={onNutrientTap ? () => {
                    const nutrientMatch = gap.match(/^(\w+)/);
                    if (nutrientMatch) {
                      onNutrientTap(nutrientMatch[1].toLowerCase());
                    }
                  } : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasHighlights && !hasGaps && (
          <p className="text-xs text-text-muted text-center py-4">
            Log more food to see personalized insights
          </p>
        )}

        {/* Expand/Collapse Button */}
        {showExpandButton && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-2 text-[10px] font-medium text-text-muted hover:text-text-primary flex items-center justify-center gap-1 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={12} />
                Show less
              </>
            ) : (
              <>
                <ChevronDown size={12} />
                Show {totalHidden} more
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface InsightItemProps {
  text: string;
  type: 'highlight' | 'gap';
  onTap?: () => void;
}

function InsightItem({ text, type, onTap }: InsightItemProps): React.ReactElement {
  const isHighlight = type === 'highlight';

  return (
    <button
      onClick={onTap}
      disabled={!onTap}
      className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
        onTap ? 'hover:bg-white/[0.04] cursor-pointer' : 'cursor-default'
      } ${
        isHighlight
          ? 'bg-emerald-500/[0.06] border border-emerald-500/10'
          : 'bg-amber-500/[0.06] border border-amber-500/10'
      }`}
    >
      <div className="flex items-start gap-2">
        <div
          className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
            isHighlight ? 'bg-emerald-400' : 'bg-amber-400'
          }`}
        />
        <span className="text-xs text-text-secondary leading-relaxed">{text}</span>
      </div>
    </button>
  );
}
