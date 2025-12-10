/**
 * Brain Health Section Component
 * Brain MRI and MoCA cognitive assessment cards
 */

import { Brain, FileText, Calendar } from 'lucide-react';
import type { CognitiveHealth } from '../../../../hooks/dashboard';
import { formatDate, getStatusBg } from '../utils';

interface BrainHealthSectionProps {
  brainMRI: CognitiveHealth['brainMRI'];
  cognitiveAssessment: CognitiveHealth['cognitiveAssessment'];
}

export function BrainHealthSection({ brainMRI, cognitiveAssessment }: BrainHealthSectionProps): React.ReactElement {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Brain size={16} className="text-sleep" strokeWidth={2.5} />
        <h4 className="text-xs font-bold text-sleep uppercase tracking-wider">Brain Health & Cognition</h4>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Brain MRI */}
        <div className="bg-surface-2/50 backdrop-blur-sm rounded-theme-lg border border-white/10 p-4 hover:bg-surface-2 transition-all duration-300">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-theme-sm bg-gradient-to-br from-info/10 to-info/5 border border-info/20">
                <FileText size={14} className="text-info" strokeWidth={2.5} />
              </div>
              <div>
                <h5 className="text-sm font-bold text-text-primary">Brain MRI</h5>
                <div className="flex items-center gap-1 mt-0.5">
                  <Calendar size={10} className="text-text-muted" />
                  <span className="text-xs text-text-muted">{formatDate(brainMRI?.date)}</span>
                </div>
              </div>
            </div>
            <div className={`px-2 py-1 ${getStatusBg('on-target')} border rounded-theme-sm flex items-center justify-center`}>
              <span className="text-xs font-bold text-success leading-none">{brainMRI?.status ?? '—'}</span>
            </div>
          </div>
          <p className="text-xs text-text-tertiary leading-relaxed">{brainMRI?.findings ?? '—'}</p>
        </div>

        {/* MoCA */}
        <div className="bg-surface-2/50 backdrop-blur-sm rounded-theme-lg border border-white/10 p-4 hover:bg-surface-2 transition-all duration-300">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-text-tertiary mb-1">Cognitive Function (MoCA)</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-text-primary">{cognitiveAssessment?.moca ?? '—'}</span>
                <span className="text-sm text-text-muted">/ 30</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Calendar size={10} className="text-text-muted" />
                <span className="text-xs text-text-muted">{formatDate(cognitiveAssessment?.date)}</span>
              </div>
            </div>
            <div className={`px-2 py-1 ${getStatusBg('on-target')} border rounded-theme-sm flex items-center justify-center`}>
              <span className="text-xs font-bold text-success leading-none">
                {cognitiveAssessment?.moca !== undefined && cognitiveAssessment.moca >= 26 ? 'Normal' : 'Review'}
              </span>
            </div>
          </div>
          <div className="h-2 bg-surface-3 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-sleep to-accent rounded-full transition-all duration-700"
              style={{ width: `${((cognitiveAssessment?.moca ?? 0) / 30) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
