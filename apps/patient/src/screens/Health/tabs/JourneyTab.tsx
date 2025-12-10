/**
 * Health Journey Tab
 * Visual infographic of the patient's health transformation over the past year
 */

import { TrendingUp, Flag } from 'lucide-react';
import {
  journeyPhases,
  transformations,
  upcomingGoals,
  PROGRAM_START_DATE,
  TransformationCard,
  PhaseCard,
  JourneyHero,
  UpcomingGoalsList,
  MotivationCard,
} from './journey-tab';

export default function JourneyTab(): React.ReactElement {
  const today = new Date();
  const daysSinceStart = Math.floor(
    (today.getTime() - PROGRAM_START_DATE.getTime()) / (1000 * 60 * 60 * 24)
  );
  const monthsSinceStart = Math.floor(daysSinceStart / 30);
  const twoYearProgress = Math.min((daysSinceStart / 730) * 100, 100);
  const completedPhases = journeyPhases.filter((p) => p.completed).length;

  return (
    <div className="space-y-5">
      {/* Hero - Journey Celebration */}
      <JourneyHero
        daysSinceStart={daysSinceStart}
        twoYearProgress={twoYearProgress}
        completedPhases={completedPhases}
      />

      {/* Transformation Summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-400" />
            Your Transformation
          </h3>
          <span className="text-xs text-text-muted">Since May 2024</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {transformations.map((t) => (
            <TransformationCard key={t.id} data={t} />
          ))}
        </div>
      </div>

      {/* Journey Phases */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Flag size={14} className="text-cyan-400" />
          Your Journey So Far
        </h3>
        <div className="space-y-3">
          {journeyPhases.map((phase, i) => (
            <PhaseCard key={phase.id} phase={phase} index={i} total={journeyPhases.length} />
          ))}
        </div>
      </div>

      {/* What's Next */}
      <UpcomingGoalsList goals={upcomingGoals} />

      {/* Motivation Card */}
      <MotivationCard monthsSinceStart={monthsSinceStart} />
    </div>
  );
}
