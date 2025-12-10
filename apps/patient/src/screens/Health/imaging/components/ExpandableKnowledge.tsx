/**
 * ExpandableKnowledge Component
 * Display expandable knowledge items with "Did You Know?" sections
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import type { KnowledgeItem } from '../types';

interface ExpandableKnowledgeProps {
  items: KnowledgeItem[];
  color: string;
}

const colorStyles: Record<string, { bg: string; border: string; text: string; lightBg: string }> = {
  rose: { bg: 'bg-rose-500/5', border: 'border-rose-500/10', text: 'text-rose-400', lightBg: 'bg-rose-500/10' },
  cyan: { bg: 'bg-cyan-500/5', border: 'border-cyan-500/10', text: 'text-cyan-400', lightBg: 'bg-cyan-500/10' },
  violet: { bg: 'bg-violet-500/5', border: 'border-violet-500/10', text: 'text-violet-400', lightBg: 'bg-violet-500/10' },
};

export default function ExpandableKnowledge({
  items,
  color,
}: ExpandableKnowledgeProps): React.ReactElement {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const style = colorStyles[color] || colorStyles.rose;

  return (
    <div className={`rounded-xl ${style.bg} ${style.border} border p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg ${style.lightBg}`}>
          <Lightbulb size={14} className={style.text} />
        </div>
        <span className="text-sm font-medium text-text-primary">Did You Know?</span>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => {
          const isExpanded = expandedIndex === i;
          return (
            <button
              key={i}
              onClick={() => setExpandedIndex(isExpanded ? null : i)}
              className="w-full text-left"
            >
              <div className={`rounded-lg p-3 transition-all ${
                isExpanded ? 'bg-white/[0.04] border border-white/[0.06]' : 'hover:bg-white/[0.02]'
              }`}>
                <div className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${style.text.replace('text-', 'bg-')} mt-1.5 shrink-0`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <span className={`text-sm ${isExpanded ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                        {item.title}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={14} className="text-text-muted shrink-0 ml-2" />
                      ) : (
                        <ChevronDown size={14} className="text-text-muted shrink-0 ml-2" />
                      )}
                    </div>
                    {!isExpanded && (
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{item.summary}</p>
                    )}
                    {isExpanded && (
                      <p className="text-xs text-text-secondary mt-2 leading-relaxed">{item.detail}</p>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
