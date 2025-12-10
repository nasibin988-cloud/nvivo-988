/**
 * ConditionImpactCard - Shows how food impacts a specific health condition
 */

import { Heart, Droplets, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import type { ConditionImpact } from '../types';
import { IMPACT_COLORS } from '../utils';

interface ConditionImpactCardProps {
  impact: ConditionImpact;
}

const CONDITION_ICONS: Record<string, typeof Heart> = {
  Diabetes: Activity,
  Hypertension: Droplets,
  'Heart Health': Heart,
};

const IMPACT_ICONS: Record<string, typeof CheckCircle> = {
  beneficial: CheckCircle,
  moderate: Activity,
  caution: AlertTriangle,
  avoid: AlertTriangle,
};

export function ConditionImpactCard({ impact }: ConditionImpactCardProps): React.ReactElement {
  const colors = IMPACT_COLORS[impact.impact];
  const ConditionIcon = CONDITION_ICONS[impact.condition] || Activity;
  const ImpactIcon = IMPACT_ICONS[impact.impact] || Activity;

  return (
    <div
      className={`p-3 rounded-xl ${colors.bg} border border-white/[0.06]`}
    >
      <div className="flex items-start gap-3">
        {/* Condition icon */}
        <div className="p-2 rounded-lg bg-white/[0.05]">
          <ConditionIcon size={16} className={colors.text} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-text-primary">
              {impact.condition}
            </h4>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${colors.bg}`}>
              <ImpactIcon size={10} className={colors.text} />
              <span className={`text-[10px] font-bold uppercase ${colors.text}`}>
                {impact.impact}
              </span>
            </div>
          </div>

          {/* Reason */}
          <p className="text-xs text-text-secondary">{impact.reason}</p>

          {/* Recommendation */}
          {impact.recommendation && (
            <p className="text-[10px] text-text-muted mt-1.5 italic">
              💡 {impact.recommendation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
