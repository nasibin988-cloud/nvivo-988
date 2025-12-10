/**
 * Stroke Prevention Section Component
 * Blood Pressure, HbA1c, and Carotid Ultrasound metrics
 */

import { Activity } from 'lucide-react';
import type { CognitiveHealth } from '../../../../hooks/dashboard';
import { getStatusLabel } from '../utils';

interface StrokePreventionSectionProps {
  strokeRisk: CognitiveHealth['strokeRisk'];
}

export function StrokePreventionSection({ strokeRisk }: StrokePreventionSectionProps): React.ReactElement {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Activity size={16} className="text-text-primary" strokeWidth={2.5} />
        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Stroke Prevention</h4>
      </div>

      <div className="bg-surface-2/50 backdrop-blur-sm rounded-theme-lg border border-white/10 p-4 hover:bg-surface-2 transition-all duration-300">
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/50">
          {/* Blood Pressure */}
          <div className="pb-3 md:pb-0 md:pr-6 flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-text-tertiary">Blood Pressure</p>
              <span className="text-xs font-semibold" style={{ color: getStatusLabel(strokeRisk?.bloodPressure?.status ?? 'on-target').color }}>
                {getStatusLabel(strokeRisk?.bloodPressure?.status ?? 'on-target').label}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-xl font-bold text-text-primary">
                {strokeRisk?.bloodPressure?.value ?? '—'}
              </span>
              <span className="text-xs text-text-muted">mmHg</span>
            </div>
            <span className="text-xs text-text-muted">Target: &lt; 120/80</span>
          </div>

          {/* HbA1c */}
          <div className="py-3 md:py-0 md:px-6 flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-text-tertiary">HbA1c</p>
              <span className="text-xs font-semibold" style={{ color: getStatusLabel(strokeRisk?.hba1c?.status ?? 'on-target').color }}>
                {getStatusLabel(strokeRisk?.hba1c?.status ?? 'on-target').label}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-xl font-bold text-text-primary">
                {strokeRisk?.hba1c?.value ?? '—'}
              </span>
              <span className="text-xs text-text-muted">%</span>
            </div>
            <span className="text-xs text-text-muted">Target: &lt; 5.7%</span>
          </div>

          {/* Carotid Ultrasound */}
          <div className="pt-3 md:pt-0 md:pl-6 flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-text-tertiary">Carotid Ultrasound</p>
              <span className="text-xs font-semibold" style={{ color: getStatusLabel(strokeRisk?.carotidPlaque?.status ?? 'on-target').color }}>
                {getStatusLabel(strokeRisk?.carotidPlaque?.status ?? 'on-target').label}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-xl font-bold text-text-primary">
                {strokeRisk?.carotidPlaque?.value === 'None' ? 'No Plaque' : strokeRisk?.carotidPlaque?.value ?? '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
