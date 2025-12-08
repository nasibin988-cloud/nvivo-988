/**
 * Interactive Quiz Question Component
 * Renders quiz questions with selectable options and feedback
 */

import { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface QuizQuestionProps {
  questionNumber: number;
  question: string;
  options: { letter: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

export default function QuizQuestion({
  questionNumber,
  question,
  options,
  correctAnswer,
  explanation,
}: QuizQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (letter: string) => {
    if (showResult) return; // Don't allow changing answer after reveal
    setSelectedAnswer(letter);
  };

  const handleCheck = () => {
    if (!selectedAnswer) return;
    setShowResult(true);
  };

  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <div className="my-6 p-4 rounded-2xl bg-surface border border-border">
      {/* Question Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-amber-400">{questionNumber}</span>
        </div>
        <p className="text-sm font-medium text-text-primary leading-relaxed pt-1">
          {question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2 ml-11">
        {options.map((option) => {
          const isSelected = selectedAnswer === option.letter;
          const isCorrectOption = option.letter === correctAnswer;

          let optionStyles = 'bg-surface-2 border-border text-text-secondary hover:border-amber-500/30 hover:bg-amber-500/5';

          if (showResult) {
            if (isCorrectOption) {
              optionStyles = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400';
            } else if (isSelected && !isCorrectOption) {
              optionStyles = 'bg-red-500/10 border-red-500/40 text-red-400';
            } else {
              optionStyles = 'bg-surface-2 border-border text-text-muted opacity-50';
            }
          } else if (isSelected) {
            optionStyles = 'bg-amber-500/15 border-amber-500/40 text-amber-400';
          }

          return (
            <button
              key={option.letter}
              onClick={() => handleSelect(option.letter)}
              disabled={showResult}
              className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${optionStyles}`}
            >
              <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-xs font-medium">
                {option.letter}
              </span>
              <span className="text-sm leading-relaxed pt-0.5">{option.text}</span>
              {showResult && isCorrectOption && (
                <CheckCircle2 size={18} className="ml-auto text-emerald-400 flex-shrink-0" />
              )}
              {showResult && isSelected && !isCorrectOption && (
                <XCircle size={18} className="ml-auto text-red-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Check Answer Button */}
      {!showResult && (
        <div className="mt-4 ml-11">
          <button
            onClick={handleCheck}
            disabled={!selectedAnswer}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedAnswer
                ? 'bg-amber-500 text-black hover:bg-amber-400'
                : 'bg-surface-2 text-text-muted cursor-not-allowed'
            }`}
          >
            Check Answer
          </button>
        </div>
      )}

      {/* Result & Explanation */}
      {showResult && (
        <div className={`mt-4 ml-11 p-3 rounded-xl border ${
          isCorrect
            ? 'bg-emerald-500/5 border-emerald-500/20'
            : 'bg-amber-500/5 border-amber-500/20'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {isCorrect ? (
              <>
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Correct!</span>
              </>
            ) : (
              <>
                <HelpCircle size={16} className="text-amber-400" />
                <span className="text-sm font-medium text-amber-400">
                  The correct answer is {correctAnswer}
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
}
