/**
 * AI Insights Panel - NVIVO Insights with horizontal scroll cards
 */

import { Activity, Lightbulb, ChevronRight } from 'lucide-react';
import { colorVariants } from '../../constants/colors';

type InsightType = 'observation' | 'recommendation';

interface AIInsight {
  id: string;
  type: InsightType;
  title: string;
  summary: string;
  metrics: string[];
}

interface AIInsightsPanelProps {
  onViewMore?: () => void;
}

// Sample insights data
const SAMPLE_INSIGHTS: AIInsight[] = [
  {
    id: '1',
    type: 'observation',
    title: 'Blood Pressure Trend',
    summary: 'Your systolic BP has decreased by 8 mmHg over the past 2 weeks while maintaining medication adherence.',
    metrics: ['Blood Pressure', 'Medication'],
  },
  {
    id: '2',
    type: 'recommendation',
    title: 'Activity Pattern',
    summary: 'Your activity and sleep data suggest morning movement may support your energy levels. Discuss with your care team.',
    metrics: ['Activity', 'Sleep'],
  },
  {
    id: '3',
    type: 'observation',
    title: 'LDL Progress',
    summary: 'Your LDL levels have been trending downward over the past 3 months.',
    metrics: ['Lipids', 'Cholesterol'],
  },
];

// Type configuration using shared color variants
const typeConfig: Record<InsightType, { icon: typeof Activity; label: string }> = {
  observation: { icon: Activity, label: 'Observation' },
  recommendation: { icon: Lightbulb, label: 'Suggestion' },
};

// Map insight types to color variants
const insightColors = {
  observation: colorVariants.accent,
  recommendation: colorVariants.warning,
};

export function AIInsightsPanel({ onViewMore }: AIInsightsPanelProps) {
  return (
    <div className="relative bg-gradient-to-br from-surface via-surface to-surface-2 rounded-theme-xl border border-border p-4 pb-8 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-text-primary">NVIVO Insights</h3>
        {onViewMore && (
          <button onClick={onViewMore} className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent transition-base">
            See all <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Horizontal scroll - extra padding for hover effects */}
      <div className="relative -mx-4 px-4">
        <div className="flex gap-3 pt-3 pb-6 snap-x snap-mandatory overflow-x-auto scrollbar-hide">
          {SAMPLE_INSIGHTS.map((insight) => {
            const TypeIcon = typeConfig[insight.type].icon;
            const colors = insightColors[insight.type];

            return (
              <div
                key={insight.id}
                className="group/card relative flex flex-col flex-shrink-0 w-[calc(33.333%-8px)] min-w-[280px] snap-start rounded-theme-lg backdrop-blur-sm p-4 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${colors.bgLight} 0%, transparent 60%)`,
                  border: `1px solid ${colors.border}`,
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 8px 16px -4px ${colors.glow}`;
                  e.currentTarget.style.borderColor = colors.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                {/* Type badge */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="p-1.5 rounded-md transition-transform duration-300 group-hover/card:scale-110"
                    style={{ backgroundColor: colors.bgLight }}
                  >
                    <TypeIcon size={14} style={{ color: colors.color }} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: colors.color }}>
                    {typeConfig[insight.type].label}
                  </span>
                </div>

                {/* Title - colored by type */}
                <h4 className="text-sm font-bold mb-2 line-clamp-2" style={{ color: colors.color }}>
                  {insight.title}
                </h4>

                {/* Summary - white text */}
                <p className="text-xs text-white/90 mb-3 line-clamp-3 min-h-[3.6em]">{insight.summary}</p>

                {/* Footer - Metric Tags */}
                <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-white/10">
                  {insight.metrics.map((metric) => (
                    <span
                      key={metric}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                      style={{ backgroundColor: colors.bgLight, color: colors.color }}
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function AIInsightsPanelSkeleton() {
  return (
    <div className="relative bg-gradient-to-br from-surface via-surface to-surface-2 rounded-theme-xl border border-border p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="w-32 h-6 skeleton rounded" />
        <div className="w-16 h-4 skeleton rounded" />
      </div>
      <div className="flex gap-3 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-shrink-0 w-[280px] rounded-theme-lg border border-border/50 p-4">
            <div className="w-20 h-4 skeleton rounded mb-3" />
            <div className="w-full h-4 skeleton rounded mb-2" />
            <div className="w-full h-4 skeleton rounded mb-2" />
            <div className="w-2/3 h-3 skeleton rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
