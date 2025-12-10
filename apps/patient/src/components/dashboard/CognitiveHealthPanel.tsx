/**
 * Cognitive Health Panel
 * Dashboard panel showing cognitive health and mental wellbeing metrics
 */

import type { CognitiveHealthPanelProps } from './cognitive-health-panel';
import {
  PanelHeader,
  BrainHealthSection,
  StrokePreventionSection,
  MentalWellbeingSection,
  CognitiveHealthPanelSkeleton,
} from './cognitive-health-panel';

export function CognitiveHealthPanel({ data, onViewMore }: CognitiveHealthPanelProps): React.ReactElement {
  if (!data) {
    return <CognitiveHealthPanelSkeleton />;
  }

  const { brainMRI, cognitiveAssessment, strokeRisk, mentalHealth } = data;

  return (
    <div className="relative group">
      <div className="absolute -inset-2 bg-gradient-to-br from-sleep/5 via-transparent to-accent/5 rounded-[32px] opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700" />

      <div className="relative overflow-hidden bg-gradient-to-br from-surface via-surface to-surface-2 backdrop-blur-2xl rounded-theme-xl border border-border p-5 shadow-card">
        <div className="absolute inset-0 bg-gradient-to-br from-sleep/[0.02] via-transparent to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <PanelHeader onViewMore={onViewMore} />

          <BrainHealthSection
            brainMRI={brainMRI}
            cognitiveAssessment={cognitiveAssessment}
          />

          <StrokePreventionSection strokeRisk={strokeRisk} />

          <MentalWellbeingSection mentalHealth={mentalHealth} />
        </div>
      </div>
    </div>
  );
}

export { CognitiveHealthPanelSkeleton };
