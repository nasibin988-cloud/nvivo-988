/**
 * NvivoInsight Component
 * AI-powered health insight with recommendations for each category
 */

import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { type SubTab, insightsByCategory } from '../types';

interface NvivoInsightProps {
  category: SubTab;
  color: string;
}

export default function NvivoInsight({ category, color }: NvivoInsightProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);
  const insight = insightsByCategory[category];

  return (
    <div
      className="bg-gradient-to-br from-surface to-surface/50 rounded-2xl border border-white/[0.06] p-4 mt-4"
      style={{ borderColor: `${color}20` }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}15` }}>
            <Sparkles size={14} style={{ color }} />
          </div>
          <span className="text-sm font-medium text-text-primary">NVIVO Insight</span>
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className="text-text-muted" />
        ) : (
          <ChevronDown size={16} className="text-text-muted" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-white/[0.04] space-y-3">
          <p className="text-xs text-text-secondary leading-relaxed">{insight.insight}</p>
          <div className="bg-white/[0.02] rounded-xl p-3">
            <span className="text-[10px] text-text-muted uppercase tracking-wide">Recommendation</span>
            <p className="text-xs text-text-primary mt-1">{insight.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
