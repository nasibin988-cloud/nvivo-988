/**
 * SuggestionCard - AI-powered meal suggestion with quick add
 */

import { Sparkles, Lightbulb, Target, Clock, Heart, Plus, ChevronRight } from 'lucide-react';
import type { MealSuggestion, SuggestedFood } from '../types';

interface SuggestionCardProps {
  suggestion: MealSuggestion;
  onAddFood: (food: SuggestedFood) => void;
  onViewDetails?: () => void;
}

const TYPE_CONFIG = {
  macro_balance: {
    icon: Target,
    color: 'blue',
    bgGradient: 'from-blue-500/[0.08] to-cyan-500/[0.05]',
    borderColor: 'border-blue-500/20',
  },
  time_based: {
    icon: Clock,
    color: 'amber',
    bgGradient: 'from-amber-500/[0.08] to-orange-500/[0.05]',
    borderColor: 'border-amber-500/20',
  },
  variety: {
    icon: Heart,
    color: 'rose',
    bgGradient: 'from-rose-500/[0.08] to-pink-500/[0.05]',
    borderColor: 'border-rose-500/20',
  },
  goal_completion: {
    icon: Sparkles,
    color: 'emerald',
    bgGradient: 'from-emerald-500/[0.08] to-teal-500/[0.05]',
    borderColor: 'border-emerald-500/20',
  },
} as const;

export function SuggestionCard({
  suggestion,
  onAddFood,
  onViewDetails,
}: SuggestionCardProps): React.ReactElement {
  const config = TYPE_CONFIG[suggestion.type];
  const IconComponent = config.icon;

  return (
    <div className={`bg-gradient-to-r ${config.bgGradient} rounded-xl border ${config.borderColor} overflow-hidden`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl bg-${config.color}-500/20 flex items-center justify-center`}>
              <IconComponent size={16} className={`text-${config.color}-400`} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary">{suggestion.title}</h4>
              <p className="text-[10px] text-text-muted">{suggestion.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Lightbulb size={10} className="text-amber-400" />
            <span className="text-[9px] text-text-muted">{Math.round(suggestion.confidence * 100)}%</span>
          </div>
        </div>

        {/* Suggested foods */}
        <div className="space-y-2 mb-3">
          {suggestion.foods.slice(0, 3).map((food, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] group hover:bg-white/[0.05] hover:border-white/[0.08] transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary truncate">
                    {food.name}
                  </span>
                  {food.isFavorite && (
                    <Heart size={10} className="text-rose-400 fill-rose-400 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-text-muted">
                    {food.calories} cal • {food.protein}g protein
                  </span>
                  <span className={`text-[9px] text-${config.color}-400`}>{food.benefit}</span>
                </div>
              </div>
              <button
                onClick={() => onAddFood(food)}
                className={`p-2 rounded-lg bg-${config.color}-500/10 border border-${config.color}-500/20 text-${config.color}-400 opacity-60 group-hover:opacity-100 transition-all`}
              >
                <Plus size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Reason */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <Sparkles size={12} className="text-violet-400 flex-shrink-0" />
          <p className="text-[10px] text-text-secondary flex-1">{suggestion.reason}</p>
        </div>

        {/* View more */}
        {onViewDetails && suggestion.foods.length > 3 && (
          <button
            onClick={onViewDetails}
            className="w-full mt-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-all flex items-center justify-center gap-1"
          >
            View {suggestion.foods.length - 3} more options
            <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
