/**
 * Health Overview Tab
 * Displays Health Score, AI insights, What-If teaser, and trajectory preview
 */

import {
  type OverviewTabProps,
  todayVitals,
  scoreBreakdown,
  RING_DESIGN,
  HealthScoreCard,
  AIInsightCard,
  VitalsGrid,
  GoalsButton,
} from './overview-tab';

const AI_INSIGHT =
  'Your LDL has dropped 12% this month. Combined with improved sleep quality, your cardiovascular risk score is trending favorably.';

export default function OverviewTab({ onOpenGoals }: OverviewTabProps): React.ReactElement {
  return (
    <div className="space-y-4">
      {/* Health Score Card */}
      <HealthScoreCard
        score={85}
        change={3}
        breakdown={scoreBreakdown}
        ringDesign={RING_DESIGN}
      />

      {/* AI Insight Card */}
      <AIInsightCard insight={AI_INSIGHT} />

      {/* Today's Vitals Grid */}
      <VitalsGrid vitals={todayVitals} />

      {/* Goals & Progress */}
      <GoalsButton onClick={onOpenGoals} />
    </div>
  );
}
