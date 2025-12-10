/**
 * History View Component
 * Shows completed assessments and score trends
 */

import { Brain, Heart, Check, ClipboardList } from 'lucide-react';
import type { Questionnaire } from '../types';
import { QuestionnaireCard } from './QuestionnaireCard';
import { ScoreTrendCard } from './ScoreTrendCard';

interface HistoryViewProps {
  questionnaires: Questionnaire[];
  onStart: (q: Questionnaire) => void;
  onViewResults: (q: Questionnaire) => void;
}

export function HistoryView({
  questionnaires,
  onStart,
  onViewResults,
}: HistoryViewProps): React.ReactElement {
  if (questionnaires.length === 0) {
    return (
      <div className="text-center py-10 bg-surface rounded-2xl border border-border">
        <ClipboardList size={40} className="mx-auto text-text-muted mb-3" />
        <p className="text-sm text-text-muted">No completed assessments yet</p>
        <p className="text-xs text-text-muted">Complete your first assessment to see results</p>
      </div>
    );
  }

  return (
    <>
      {/* Score Trends */}
      <div className="grid grid-cols-2 gap-3">
        <ScoreTrendCard
          title="PHQ-9"
          icon={<Brain size={14} className="text-blue-400" />}
          scores={[
            { date: 'Jan', value: 8, max: 27 },
            { date: 'Feb', value: 6, max: 27 },
            { date: 'Mar', value: 5, max: 27 },
            { date: 'Apr', value: 4, max: 27 },
          ]}
          color="text-blue-400"
        />
        <ScoreTrendCard
          title="GAD-7"
          icon={<Heart size={14} className="text-rose-400" />}
          scores={[
            { date: 'Jan', value: 7, max: 21 },
            { date: 'Feb', value: 5, max: 21 },
            { date: 'Mar', value: 4, max: 21 },
            { date: 'Apr', value: 3, max: 21 },
          ]}
          color="text-rose-400"
        />
      </div>

      {/* Completed Questionnaires */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Check size={14} className="text-emerald-400" />
          Completed Assessments
        </h4>
        {questionnaires.map((q) => (
          <QuestionnaireCard
            key={q.id}
            questionnaire={q}
            onStart={onStart}
            onViewResults={onViewResults}
          />
        ))}
      </div>
    </>
  );
}
