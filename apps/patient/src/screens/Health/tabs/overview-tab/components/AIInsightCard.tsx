/**
 * AI Insight Card Component
 * Displays AI-generated health insights
 */

import { Brain } from 'lucide-react';

interface AIInsightCardProps {
  insight: string;
}

export function AIInsightCard({ insight }: AIInsightCardProps): React.ReactElement {
  return (
    <div className="bg-surface rounded-2xl border border-border p-4">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <Brain size={20} className="text-rose-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-text-primary mb-1">AI Health Insight</h4>
          <p className="text-sm text-text-secondary leading-relaxed">{insight}</p>
        </div>
      </div>
    </div>
  );
}
