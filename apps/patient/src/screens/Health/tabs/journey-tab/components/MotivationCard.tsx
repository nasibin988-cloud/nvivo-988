/**
 * Motivation Card Component
 * Inspirational message with stats
 */

import { Sparkles, Star, Award } from 'lucide-react';

interface MotivationCardProps {
  monthsSinceStart: number;
}

export function MotivationCard({ monthsSinceStart }: MotivationCardProps): React.ReactElement {
  return (
    <div className="bg-gradient-to-br from-surface to-surface/50 rounded-xl border border-emerald-500/10 p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Sparkles size={18} className="text-emerald-400" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-text-primary">
            You&apos;re Building Something Lasting
          </h4>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
            Every day of your journey adds up. Your cardiovascular improvements over the past{' '}
            {monthsSinceStart} months are reducing your long-term risk and building healthier
            arteries. The habits you&apos;ve formed are creating lasting change that compounds over
            time. Keep going—the best is yet to come.
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              <Star size={12} className="text-amber-400" />
              <span className="text-[10px] text-text-muted">95% adherence</span>
            </div>
            <div className="flex items-center gap-1">
              <Award size={12} className="text-emerald-400" />
              <span className="text-[10px] text-text-muted">3 milestones reached</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
