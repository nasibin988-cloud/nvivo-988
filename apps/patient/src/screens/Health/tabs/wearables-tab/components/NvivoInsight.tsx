/**
 * NVIVO Insight Component
 * Shows insight about collected wearable data
 */

import { Sparkles } from 'lucide-react';

export function NvivoInsight(): React.ReactElement {
  return (
    <div className="bg-gradient-to-br from-surface to-surface/50 rounded-xl border border-cyan-500/10 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-cyan-500/10">
          <Sparkles size={14} className="text-cyan-400" />
        </div>
        <span className="text-sm font-medium text-text-primary">NVIVO Insight</span>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">
        Your wearable data helps us provide personalized health insights. We've collected over{' '}
        <span className="font-semibold text-cyan-400">2,400 data points</span> in the last 30 days,
        tracking your heart health, sleep patterns, and activity levels. This data feeds directly
        into your health trends and helps your care team monitor your progress.
      </p>
    </div>
  );
}
