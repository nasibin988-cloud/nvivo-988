/**
 * Questionnaire Card Component
 * Displays a questionnaire with its details and actions
 */

import { Clock, Check, AlertCircle, BarChart3, ArrowRight } from 'lucide-react';
import type { Questionnaire } from '../types';
import { categoryConfig, statusConfig } from '../data';

interface QuestionnaireCardProps {
  questionnaire: Questionnaire;
  onStart: (q: Questionnaire) => void;
  onViewResults: (q: Questionnaire) => void;
}

export function QuestionnaireCard({
  questionnaire,
  onStart,
  onViewResults,
}: QuestionnaireCardProps): React.ReactElement {
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
