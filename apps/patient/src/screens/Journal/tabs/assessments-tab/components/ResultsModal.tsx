/**
 * Results Modal Component
 * Modal for viewing assessment results
 */

import { X, TrendingUp } from 'lucide-react';
import type { Questionnaire } from '../types';
import { categoryConfig } from '../data';

interface ResultsModalProps {
  questionnaire: Questionnaire;
  onClose: () => void;
}

export function ResultsModal({
  questionnaire,
  onClose,
}: ResultsModalProps): React.ReactElement {
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
