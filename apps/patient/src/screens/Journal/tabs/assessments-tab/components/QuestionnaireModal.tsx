/**
 * Questionnaire Modal Component
 * Modal for taking an assessment
 */

import { useState } from 'react';
import { X, CircleDot } from 'lucide-react';
import type { Questionnaire } from '../types';
import { categoryConfig, sampleQuestions } from '../data';

interface QuestionnaireModalProps {
  questionnaire: Questionnaire;
  onClose: () => void;
  onComplete: () => void;
}

export function QuestionnaireModal({
  questionnaire,
  onClose,
  onComplete,
}: QuestionnaireModalProps): React.ReactElement {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const catConfig = categoryConfig[questionnaire.category];

  const questions = sampleQuestions;
  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswer = (answerIndex: number): void => {
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
