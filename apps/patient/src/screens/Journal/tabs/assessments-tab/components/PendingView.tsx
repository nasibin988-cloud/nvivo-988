/**
 * Pending View Component
 * Shows pending and available questionnaires
 */

import { ClipboardList, AlertCircle, Award } from 'lucide-react';
import type { Questionnaire } from '../types';
import { QuestionnaireCard } from './QuestionnaireCard';

interface PendingViewProps {
  questionnaires: Questionnaire[];
  onStart: (q: Questionnaire) => void;
  onViewResults: (q: Questionnaire) => void;
}

export function PendingView({
  questionnaires,
  onStart,
  onViewResults,
}: PendingViewProps): React.ReactElement {
  const pendingItems = questionnaires.filter((q) => q.status === 'pending');
  const availableItems = questionnaires.filter((q) => q.status === 'available');

  if (questionnaires.length === 0) {
    return (
      <div className="text-center py-10 bg-surface rounded-2xl border border-border">
        <Award size={40} className="mx-auto text-emerald-400 mb-3" />
        <p className="text-sm text-text-primary font-medium">All caught up!</p>
        <p className="text-xs text-text-muted">No pending assessments</p>
      </div>
    );
  }

  return (
    <>
      {/* Due Soon */}
      {pendingItems.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <AlertCircle size={14} />
            Due Soon
          </h4>
          {pendingItems.map((q) => (
            <QuestionnaireCard
              key={q.id}
              questionnaire={q}
              onStart={onStart}
              onViewResults={onViewResults}
            />
          ))}
        </div>
      )}

      {/* Available Anytime */}
      {availableItems.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-text-muted flex items-center gap-2">
            <ClipboardList size={14} />
            Available Anytime
          </h4>
          {availableItems.map((q) => (
            <QuestionnaireCard
              key={q.id}
              questionnaire={q}
              onStart={onStart}
              onViewResults={onViewResults}
            />
          ))}
        </div>
      )}
    </>
  );
}
