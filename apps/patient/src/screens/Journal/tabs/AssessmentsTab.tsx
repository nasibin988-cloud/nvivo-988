/**
 * Assessments Tab
 * Health questionnaires, surveys, and progress tracking
 */

import { useState } from 'react';
import {
  type Questionnaire,
  type QuestionnaireStatus,
  type ViewMode,
  mockQuestionnaires,
  QuestionnaireModal,
  ResultsModal,
  PendingView,
  HistoryView,
} from './assessments-tab';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AssessmentsTab(): React.ReactElement {
  const [view, setView] = useState<ViewMode>('pending');
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>(mockQuestionnaires);
  const [activeQuestionnaire, setActiveQuestionnaire] = useState<Questionnaire | null>(null);
  const [resultsQuestionnaire, setResultsQuestionnaire] = useState<Questionnaire | null>(null);

  const handleStartQuestionnaire = (q: Questionnaire): void => {
    setActiveQuestionnaire(q);
  };

  const handleCompleteQuestionnaire = (): void => {
    if (activeQuestionnaire) {
      setQuestionnaires((prev) =>
        prev.map((q) =>
          q.id === activeQuestionnaire.id
            ? {
                ...q,
                status: 'completed' as QuestionnaireStatus,
                lastCompleted: 'Just now',
                latestScore: '4/27',
                scoreInterpretation: 'Minimal',
              }
            : q
        )
      );
    }
    setActiveQuestionnaire(null);
  };

  const pendingQuestionnaires = questionnaires.filter(
    (q) => q.status === 'pending' || q.status === 'available'
  );
  const completedQuestionnaires = questionnaires.filter((q) => q.status === 'completed');
  const pendingCount = questionnaires.filter((q) => q.status === 'pending').length;

  return (
    <div className="space-y-4 pb-4">
      {/* Header Card */}
      <div className="bg-surface rounded-2xl border border-border p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Health Assessments</h3>
            <p className="text-xs text-text-muted">Track your health progress over time</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-amber-400">{pendingCount}</span>
            <span className="text-xs text-text-muted block">Pending</span>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex bg-surface-2 rounded-xl p-1">
        <button
          onClick={() => setView('pending')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            view === 'pending'
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Pending ({pendingQuestionnaires.length})
        </button>
        <button
          onClick={() => setView('history')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            view === 'history'
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          History ({completedQuestionnaires.length})
        </button>
      </div>

      {/* View Content */}
      {view === 'pending' ? (
        <PendingView
          questionnaires={pendingQuestionnaires}
          onStart={handleStartQuestionnaire}
          onViewResults={setResultsQuestionnaire}
        />
      ) : (
        <HistoryView
          questionnaires={completedQuestionnaires}
          onStart={handleStartQuestionnaire}
          onViewResults={setResultsQuestionnaire}
        />
      )}

      {/* Active Questionnaire Modal */}
      {activeQuestionnaire && (
        <QuestionnaireModal
          questionnaire={activeQuestionnaire}
          onClose={() => setActiveQuestionnaire(null)}
          onComplete={handleCompleteQuestionnaire}
        />
      )}

      {/* Results Modal */}
      {resultsQuestionnaire && (
        <ResultsModal
          questionnaire={resultsQuestionnaire}
          onClose={() => setResultsQuestionnaire(null)}
        />
      )}
    </div>
  );
}
