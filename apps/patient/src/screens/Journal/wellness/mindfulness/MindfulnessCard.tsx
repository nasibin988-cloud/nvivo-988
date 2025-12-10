/**
 * Mindfulness Card (Neuro-Library design)
 * Card component for displaying mindfulness modules
 */

import { Star, Play } from 'lucide-react';
import { MindfulnessModule } from './types';
import { getCategoryColor, getCategoryIcon, getCategoryGradient } from './categoryUtils';

interface MindfulnessCardProps {
  module: MindfulnessModule;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPlay: () => void;
}

export function MindfulnessCard({
  module,
  isFavorite,
  onToggleFavorite,
  onPlay,
}: MindfulnessCardProps): React.ReactElement {
  const colors = getCategoryColor(module.category);
  const IconComponent = getCategoryIcon(module.category);
  const gradient = getCategoryGradient(module.category);

  return (
    <div
      className="group flex flex-col gap-4 p-5 bg-surface rounded-2xl transition-all duration-500 text-left relative overflow-hidden h-full backdrop-blur-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-border"
    >
      {/* Category-specific color tint overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-40 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none`}
      />

      {/* Deep dark shading at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-70" />

      {/* Header */}
      <div className="flex justify-between items-start w-full z-10">
        <div className="flex items-start gap-2">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-surface-2 border border-border ${colors.text} shadow-lg group-hover:scale-105 transition-transform`}
          >
            <IconComponent size={24} />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="z-20 p-2 rounded-xl transition-all hover:scale-110 active:scale-95"
            style={{
              background: isFavorite
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))'
                : 'rgba(0, 0, 0, 0.3)',
              border: isFavorite
                ? '1px solid rgba(245, 158, 11, 0.4)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Star
              size={14}
              className={isFavorite ? 'text-amber-400' : 'text-gray-500'}
              fill={isFavorite ? '#f59e0b' : 'none'}
            />
          </button>
        </div>

        {/* Difficulty Badge */}
        <span
          className="text-[10px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wider"
          style={{
            background:
              module.difficulty === 'Advanced'
                ? 'rgba(239, 68, 68, 0.1)'
                : module.difficulty === 'Intermediate'
                  ? 'rgba(251, 146, 60, 0.1)'
                  : 'rgba(34, 197, 94, 0.1)',
            borderColor:
              module.difficulty === 'Advanced'
                ? 'rgba(239, 68, 68, 0.3)'
                : module.difficulty === 'Intermediate'
                  ? 'rgba(251, 146, 60, 0.3)'
                  : 'rgba(34, 197, 94, 0.3)',
            color:
              module.difficulty === 'Advanced'
                ? '#fca5a5'
                : module.difficulty === 'Intermediate'
                  ? '#fdba74'
                  : '#86efac',
          }}
        >
          {module.difficulty || 'Beginner'}
        </span>
      </div>

      {/* Clickable area for playing session */}
      <button
        onClick={onPlay}
        className="absolute inset-0 z-10"
        aria-label={`Play ${module.title}`}
      />

      {/* Title and Description */}
      <div className="flex-1 z-10 relative pointer-events-none">
        <h4 className="text-base font-bold text-text-primary group-hover:text-cyan-300 transition-colors mb-1">
          {module.title}
        </h4>
        <p className="text-xs text-text-muted leading-relaxed">{module.description}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 z-10 border-t border-border pt-3 w-full mt-auto relative pointer-events-none">
        <Play size={14} className="text-text-muted" fill="currentColor" />
        <span className="text-xs font-bold text-text-muted">{module.duration} min</span>
        <div className="flex-1" />
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg ${colors.bg} ${colors.text} w-20 text-center`}
        >
          {module.category}
        </span>
      </div>
    </div>
  );
}
