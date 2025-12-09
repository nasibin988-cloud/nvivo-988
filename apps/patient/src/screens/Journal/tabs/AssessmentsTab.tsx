/**
 * Assessments Tab
 * Health questionnaires, surveys, and progress tracking
 */

import { useState } from 'react';
import {
  ClipboardList,
  Clock,
  ChevronRight,
  TrendingUp,
  Award,
  Brain,
  Heart,
  Sparkles,
  Target,
  Check,
  AlertCircle,
  Calendar,
  BarChart3,
  X,
  ArrowRight,
  CircleDot,
} from 'lucide-react';

// Types
type QuestionnaireType = 'DASS-21' | 'QOLS' | 'SLIQ' | 'INTAKE' | 'PHQ-9' | 'GAD-7';
type QuestionnaireStatus = 'pending' | 'available' | 'completed';
type Category = 'mental-health' | 'lifestyle' | 'quality-of-life' | 'intake' | 'cognitive';
type ViewMode = 'pending' | 'history';

interface Questionnaire {
  id: string;
  name: string;
  type: QuestionnaireType;
  description: string;
  estimatedTime: number;
  icon: string;
  category: Category;
  status: QuestionnaireStatus;
  dueDate?: string;
  lastCompleted?: string;
  latestScore?: string;
  scoreInterpretation?: string;
}

// Mock data
const mockQuestionnaires: Questionnaire[] = [
  {
    id: '1',
    name: 'DASS-21',
    type: 'DASS-21',
    description: 'Depression, Anxiety & Stress Scale',
    estimatedTime: 5,
    icon: '🧠',
    category: 'mental-health',
    status: 'pending',
    dueDate: 'Today',
  },
  {
    id: '2',
    name: 'Quality of Life',
    type: 'QOLS',
    description: 'Assess your overall life satisfaction',
    estimatedTime: 8,
    icon: '⭐',
    category: 'quality-of-life',
    status: 'available',
  },
  {
    id: '3',
    name: 'Lifestyle Assessment',
    type: 'SLIQ',
    description: 'Diet, exercise, sleep & stress habits',
    estimatedTime: 6,
    icon: '🌿',
    category: 'lifestyle',
    status: 'available',
  },
  {
    id: '4',
    name: 'Patient Intake',
    type: 'INTAKE',
    description: 'Comprehensive health history form',
    estimatedTime: 15,
    icon: '📋',
    category: 'intake',
    status: 'completed',
    lastCompleted: '2 weeks ago',
    latestScore: 'Complete',
  },
  {
    id: '5',
    name: 'PHQ-9',
    type: 'PHQ-9',
    description: 'Depression screening questionnaire',
    estimatedTime: 3,
    icon: '💭',
    category: 'mental-health',
    status: 'completed',
    lastCompleted: '1 week ago',
    latestScore: '4/27',
    scoreInterpretation: 'Minimal',
  },
  {
    id: '6',
    name: 'GAD-7',
    type: 'GAD-7',
    description: 'Anxiety screening questionnaire',
    estimatedTime: 3,
    icon: '🎯',
    category: 'mental-health',
    status: 'completed',
    lastCompleted: '1 week ago',
    latestScore: '3/21',
    scoreInterpretation: 'Minimal',
  },
];

const categoryConfig: Record<Category, { label: string; gradient: string; color: string; bgColor: string }> = {
  'mental-health': { label: 'Mental Health', gradient: 'from-blue-500 to-cyan-500', color: 'text-blue-400', bgColor: 'bg-blue-500/15 border-blue-500/30' },
  'lifestyle': { label: 'Lifestyle', gradient: 'from-emerald-500 to-teal-500', color: 'text-emerald-400', bgColor: 'bg-emerald-500/15 border-emerald-500/30' },
  'quality-of-life': { label: 'Quality of Life', gradient: 'from-amber-500 to-orange-500', color: 'text-amber-400', bgColor: 'bg-amber-500/15 border-amber-500/30' },
  'intake': { label: 'Intake', gradient: 'from-violet-500 to-purple-500', color: 'text-violet-400', bgColor: 'bg-violet-500/15 border-violet-500/30' },
  'cognitive': { label: 'Cognitive', gradient: 'from-pink-500 to-rose-500', color: 'text-pink-400', bgColor: 'bg-pink-500/15 border-pink-500/30' },
};

const statusConfig: Record<QuestionnaireStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Due Soon', color: 'text-amber-400', bgColor: 'bg-amber-500/15 border-amber-500/30' },
  available: { label: 'Available', color: 'text-blue-400', bgColor: 'bg-blue-500/15 border-blue-500/30' },
  completed: { label: 'Completed', color: 'text-emerald-400', bgColor: 'bg-emerald-500/15 border-emerald-500/30' },
};

// Questionnaire Card Component
function QuestionnaireCard({
  questionnaire,
  onStart,
  onViewResults,
}: {
  questionnaire: Questionnaire;
  onStart: (q: Questionnaire) => void;
  onViewResults: (q: Questionnaire) => void;
}) {
  const catConfig = categoryConfig[questionnaire.category];
  const statConfig = statusConfig[questionnaire.status];
  const isCompleted = questionnaire.status === 'completed';

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden group hover:border-white/10 transition-all">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${catConfig.gradient} flex items-center justify-center text-2xl shrink-0`}>
            {questionnaire.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-semibold text-text-primary">{questionnaire.name}</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${statConfig.bgColor} ${statConfig.color}`}>
                {statConfig.label}
              </span>
            </div>
            <p className="text-xs text-text-muted line-clamp-1">{questionnaire.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] text-text-muted flex items-center gap-1">
                <Clock size={10} />
                {questionnaire.estimatedTime} min
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${catConfig.bgColor} ${catConfig.color} border`}>
                {catConfig.label}
              </span>
            </div>
          </div>

          {/* Action */}
          {isCompleted ? (
            <button
              onClick={() => onViewResults(questionnaire)}
              className="p-2 rounded-xl bg-surface-2 border border-border text-text-muted hover:text-text-primary hover:bg-surface transition-all"
            >
              <BarChart3 size={18} />
            </button>
          ) : (
            <button
              onClick={() => onStart(questionnaire)}
              className={`p-2 rounded-xl bg-gradient-to-br ${catConfig.gradient} text-white hover:scale-105 transition-all`}
            >
              <ArrowRight size={18} />
            </button>
          )}
        </div>

        {/* Completed Info */}
        {isCompleted && (
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check size={12} className="text-emerald-400" />
              <span className="text-[11px] text-text-muted">Completed {questionnaire.lastCompleted}</span>
            </div>
            {questionnaire.latestScore && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-primary">{questionnaire.latestScore}</span>
                {questionnaire.scoreInterpretation && (
                  <span className="text-[10px] text-emerald-400 font-medium">{questionnaire.scoreInterpretation}</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Due Soon Warning */}
        {questionnaire.status === 'pending' && questionnaire.dueDate && (
          <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
            <AlertCircle size={12} className="text-amber-400" />
            <span className="text-[11px] text-amber-400 font-medium">Due: {questionnaire.dueDate}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Score Trend Card
function ScoreTrendCard({
  title,
  icon,
  scores,
  color,
}: {
  title: string;
  icon: React.ReactNode;
  scores: { date: string; value: number; max: number }[];
  color: string;
}) {
  const latest = scores[scores.length - 1];
  const previous = scores.length > 1 ? scores[scores.length - 2] : null;
  const trend = previous ? latest.value - previous.value : 0;

  return (
    <div className="bg-surface rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-text-primary">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {trend !== 0 && (
            <TrendingUp size={12} className={trend < 0 ? 'text-emerald-400' : 'text-rose-400'} />
          )}
          <span className={`text-lg font-bold ${color}`}>
            {latest.value}/{latest.max}
          </span>
        </div>
      </div>
      <div className="flex items-end gap-1 h-12">
        {scores.map((score, i) => {
          const heightPercent = (score.value / score.max) * 100;
          const isLatest = i === scores.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full h-10 bg-surface-2 rounded relative overflow-hidden">
                <div
                  className={`absolute bottom-0 w-full rounded transition-all ${
                    isLatest ? color.replace('text-', 'bg-') : 'bg-white/20'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-[10px] text-text-muted text-center mt-2">
        {scores[0].date} - {scores[scores.length - 1].date}
      </div>
    </div>
  );
}

// Questionnaire Modal (Simple implementation)
function QuestionnaireModal({
  questionnaire,
  onClose,
  onComplete,
}: {
  questionnaire: Questionnaire;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const catConfig = categoryConfig[questionnaire.category];

  // Sample questions (simplified)
  const questions = [
    { text: 'I found it hard to wind down', options: ['Never', 'Sometimes', 'Often', 'Always'] },
    { text: 'I was aware of dryness of my mouth', options: ['Never', 'Sometimes', 'Often', 'Always'] },
    { text: 'I couldn\'t seem to experience any positive feeling at all', options: ['Never', 'Sometimes', 'Often', 'Always'] },
    { text: 'I experienced breathing difficulty', options: ['Never', 'Sometimes', 'Often', 'Always'] },
    { text: 'I found it difficult to work up the initiative to do things', options: ['Never', 'Sometimes', 'Often', 'Always'] },
  ];

  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface rounded-2xl border border-white/[0.08] overflow-hidden max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${catConfig.gradient} flex items-center justify-center text-xl`}>
                {questionnaire.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">{questionnaire.name}</h2>
                <p className="text-xs text-text-muted">Question {currentQuestion + 1} of {totalQuestions}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-surface-2 border border-border text-text-muted hover:text-text-primary transition-all"
            >
              <X size={18} />
            </button>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${catConfig.gradient} transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 p-6 flex flex-col justify-center">
          <p className="text-lg font-medium text-text-primary text-center mb-8">
            {questions[currentQuestion].text}
          </p>
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className="w-full py-4 px-5 rounded-2xl bg-surface-2 border border-border text-text-primary text-sm font-medium hover:bg-surface hover:border-white/10 transition-all flex items-center justify-between group"
              >
                <span>{option}</span>
                <CircleDot size={18} className="text-text-muted group-hover:text-text-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Results Modal
function ResultsModal({
  questionnaire,
  onClose,
}: {
  questionnaire: Questionnaire;
  onClose: () => void;
}) {
  const catConfig = categoryConfig[questionnaire.category];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${catConfig.gradient} flex items-center justify-center text-2xl`}>
                {questionnaire.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">{questionnaire.name}</h2>
                <p className="text-xs text-text-muted">Last taken {questionnaire.lastCompleted}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-surface-2 border border-border text-text-muted hover:text-text-primary transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Score Display */}
          <div className="text-center py-8 bg-surface-2 rounded-2xl border border-border mb-6">
            <span className={`text-5xl font-bold ${catConfig.color}`}>{questionnaire.latestScore}</span>
            {questionnaire.scoreInterpretation && (
              <div className="mt-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
                  {questionnaire.scoreInterpretation}
                </span>
              </div>
            )}
          </div>

          {/* Trend */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <TrendingUp size={14} className={catConfig.color} />
              Score History
            </h4>
            <div className="flex items-end gap-2 h-20 bg-surface-2 rounded-xl p-3">
              {[8, 6, 5, 4, 4].map((score, i) => {
                const isLatest = i === 4;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full h-14 bg-surface rounded relative overflow-hidden">
                      <div
                        className={`absolute bottom-0 w-full rounded ${isLatest ? catConfig.color.replace('text-', 'bg-') : 'bg-white/20'}`}
                        style={{ height: `${(score / 27) * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-text-muted">{score}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Retake Button */}
          <button
            onClick={onClose}
            className={`w-full mt-6 py-3.5 rounded-2xl font-bold text-base bg-gradient-to-r ${catConfig.gradient} text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg`}
          >
            Retake Assessment
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Assessments Tab
export default function AssessmentsTab() {
  const [view, setView] = useState<ViewMode>('pending');
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>(mockQuestionnaires);
  const [activeQuestionnaire, setActiveQuestionnaire] = useState<Questionnaire | null>(null);
  const [resultsQuestionnaire, setResultsQuestionnaire] = useState<Questionnaire | null>(null);

  const handleStartQuestionnaire = (q: Questionnaire) => {
    setActiveQuestionnaire(q);
  };

  const handleCompleteQuestionnaire = () => {
    if (activeQuestionnaire) {
      setQuestionnaires(prev => prev.map(q =>
        q.id === activeQuestionnaire.id
          ? { ...q, status: 'completed' as QuestionnaireStatus, lastCompleted: 'Just now', latestScore: '4/27', scoreInterpretation: 'Minimal' }
          : q
      ));
    }
    setActiveQuestionnaire(null);
  };

  const pendingQuestionnaires = questionnaires.filter(q => q.status === 'pending' || q.status === 'available');
  const completedQuestionnaires = questionnaires.filter(q => q.status === 'completed');
  const pendingCount = questionnaires.filter(q => q.status === 'pending').length;

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

      {view === 'pending' ? (
        <>
          {/* Pending Questionnaires */}
          {pendingQuestionnaires.filter(q => q.status === 'pending').length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <AlertCircle size={14} />
                Due Soon
              </h4>
              {pendingQuestionnaires
                .filter(q => q.status === 'pending')
                .map((q) => (
                  <QuestionnaireCard
                    key={q.id}
                    questionnaire={q}
                    onStart={handleStartQuestionnaire}
                    onViewResults={setResultsQuestionnaire}
                  />
                ))}
            </div>
          )}

          {/* Available Questionnaires */}
          {pendingQuestionnaires.filter(q => q.status === 'available').length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-text-muted flex items-center gap-2">
                <ClipboardList size={14} />
                Available Anytime
              </h4>
              {pendingQuestionnaires
                .filter(q => q.status === 'available')
                .map((q) => (
                  <QuestionnaireCard
                    key={q.id}
                    questionnaire={q}
                    onStart={handleStartQuestionnaire}
                    onViewResults={setResultsQuestionnaire}
                  />
                ))}
            </div>
          )}

          {pendingQuestionnaires.length === 0 && (
            <div className="text-center py-10 bg-surface rounded-2xl border border-border">
              <Award size={40} className="mx-auto text-emerald-400 mb-3" />
              <p className="text-sm text-text-primary font-medium">All caught up!</p>
              <p className="text-xs text-text-muted">No pending assessments</p>
            </div>
          )}
        </>
      ) : (
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
            {completedQuestionnaires.map((q) => (
              <QuestionnaireCard
                key={q.id}
                questionnaire={q}
                onStart={handleStartQuestionnaire}
                onViewResults={setResultsQuestionnaire}
              />
            ))}
          </div>

          {completedQuestionnaires.length === 0 && (
            <div className="text-center py-10 bg-surface rounded-2xl border border-border">
              <ClipboardList size={40} className="mx-auto text-text-muted mb-3" />
              <p className="text-sm text-text-muted">No completed assessments yet</p>
              <p className="text-xs text-text-muted">Complete your first assessment to see results</p>
            </div>
          )}
        </>
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
