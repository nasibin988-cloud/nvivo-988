/**
 * Vitals Grid Component
 * Displays today's vital signs in a grid layout
 */

import type { VitalData } from '../types';

interface VitalsGridProps {
  vitals: VitalData[];
}

export function VitalsGrid({ vitals }: VitalsGridProps): React.ReactElement {
  return (
    <div>
      <h3 className="text-sm font-medium text-text-secondary mb-3">Today&apos;s Vitals</h3>
      <div className="grid grid-cols-2 gap-3">
        {vitals.map((vital) => {
          const Icon = vital.icon;
          return (
            <div key={vital.id} className="bg-surface rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg bg-${vital.color}-500/10`}>
                  <Icon size={16} className={`text-${vital.color}-400`} />
                </div>
                <span className="text-xs text-text-muted">{vital.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-text-primary">{vital.value}</span>
                <span className="text-xs text-text-muted">{vital.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
