import { useState } from 'react';
import { Target, Check, ChevronLeft, ChevronRight, Trophy, Star, RotateCcw } from 'lucide-react';
import type { MicroWins } from '../../hooks/dashboard';
import { categoryColors } from '../../constants/colors';

interface MicroWinsWidgetProps {
  microWins: MicroWins | null | undefined;
  onComplete?: (challengeId: string) => void;
  onSkip?: (challengeId: string) => void;
  onUndo?: (challengeId: string) => void;
}

// Category detection based on challenge title keywords
type ChallengeCategory = 'activity' | 'nutrition' | 'mindfulness' | 'sleep' | 'health';

function getChallengeCategory(title: string): ChallengeCategory {
  const lower = title.toLowerCase();
  if (lower.includes('walk') || lower.includes('step') || lower.includes('exercise') || lower.includes('move') || lower.includes('stretch')) {
    return 'activity';
  }
  if (lower.includes('water') || lower.includes('eat') || lower.includes('fruit') || lower.includes('vegetable') || lower.includes('meal')) {
    return 'nutrition';
  }
  if (lower.includes('breath') || lower.includes('meditat') || lower.includes('relax') || lower.includes('mindful') || lower.includes('calm')) {
    return 'mindfulness';
  }
  if (lower.includes('sleep') || lower.includes('rest') || lower.includes('bed') || lower.includes('nap')) {
    return 'sleep';
  }
  return 'health';
}

export function MicroWinsWidget({
  microWins,
  onComplete,
  onUndo,
}: MicroWinsWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const challenges = microWins?.challenges ?? [];
  const pendingChallenges = challenges.filter((c) => !c.completed && !c.skipped);
  const completedCount = challenges.filter((c) => c.completed).length;

  // Empty state
  if (challenges.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-surface via-surface to-surface-2 rounded-theme-xl border border-border p-5 shadow-card">
        <div className="mb-4">
          <h3 className="font-bold text-text-primary">Micro-Wins</h3>
          <p className="text-xs text-accent">Personalized for you</p>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
            <Target size={18} className="text-accent" />
          </div>
          <p className="text-sm text-text-secondary">
            No challenges available today. Check back tomorrow!
          </p>
        </div>
      </div>
    );
  }

  // All completed state
  if (pendingChallenges.length === 0) {
    return <AllCompleteState completedCount={completedCount} total={challenges.length} />;
  }

  // Get visible challenges starting from current index
  const visibleChallenges = challenges.slice(currentIndex, currentIndex + 4);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < challenges.length - 1;

  const goNext = () => {
    if (canGoNext) setCurrentIndex(currentIndex + 1);
  };

  const goPrev = () => {
    if (canGoPrev) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="relative bg-gradient-to-br from-surface via-surface to-surface-2 rounded-theme-xl border border-border p-5 pb-6 shadow-card">
      {/* Header */}
      <div className="relative flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-text-primary">Micro-Wins</h3>
          <p className="text-xs text-accent">Personalized for you</p>
        </div>
        <div className="flex items-center justify-center px-3 py-1 rounded-full bg-success/10 border border-success/20">
          <span className="text-[11px] font-semibold text-success">{completedCount}/{challenges.length}</span>
        </div>
      </div>

      {/* Stacked Cards */}
      <div className="relative h-[130px]">
        {visibleChallenges.map((challenge, index) => {
          const isTop = index === 0;
          const isCompleted = challenge.completed;
          const category = getChallengeCategory(challenge.title);
          const colors = categoryColors[category];
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={challenge.id}
              className="absolute inset-x-0"
              style={{
                transform: `translateY(${index * 22}px) scale(${1 - index * 0.025})`,
                zIndex: 10 - index,
                opacity: isTop ? 1 : 0.35,
                transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: isTop ? 'auto' : 'none',
              }}
            >
              <div
                className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl backdrop-blur-sm cursor-pointer"
                style={{
                  background: isTop
                    ? isCompleted
                      ? `linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, transparent 60%)`
                      : `linear-gradient(135deg, ${colors.bgLight} 0%, transparent 60%)`
                    : 'rgba(255, 255, 255, 0.02)',
                  border: isTop
                    ? isCompleted
                      ? '1px solid rgba(16, 185, 129, 0.35)'
                      : `1px solid ${isHovered ? colors.color : colors.border}`
                    : '1px solid rgba(255, 255, 255, 0.05)',
                  boxShadow: isTop && isHovered && !isCompleted
                    ? `0 8px 16px -4px ${colors.glow}`
                    : 'none',
                  transform: isTop && isHovered && !isCompleted ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={() => isTop && setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden"
                  style={{
                    opacity: isTop ? 1 : 0,
                    transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {isCompleted && (
                    <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                      <Check size={10} className="text-success" />
                    </div>
                  )}
                  <p
                    className="font-medium text-sm truncate"
                    style={{ color: isCompleted ? '#10B981' : 'white' }}
                  >
                    {challenge.title}
                  </p>
                </div>

                {isTop && !isCompleted && (
                  <button
                    onClick={() => onComplete?.(challenge.id)}
                    className="flex-shrink-0 relative group/btn"
                  >
                    <div
                      className="absolute inset-0 rounded-full blur-md opacity-0 group-hover/btn:opacity-60 transition-opacity"
                      style={{ backgroundColor: colors.color }}
                    />
                    <div
                      className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all group-hover/btn:scale-110 group-active/btn:scale-95"
                      style={{
                        backgroundColor: colors.bgLight,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <Check size={16} style={{ color: colors.color }} />
                    </div>
                  </button>
                )}

                {/* Undo button for completed challenges */}
                {isTop && isCompleted && (
                  <button
                    onClick={() => onUndo?.(challenge.id)}
                    className="flex-shrink-0 relative group/btn"
                  >
                    <div className="relative w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center transition-all group-hover/btn:bg-white/[0.08] group-hover/btn:border-white/[0.15] group-hover/btn:scale-110 group-active/btn:scale-95">
                      <RotateCcw size={12} className="text-white/40 group-hover/btn:text-white/70 transition-colors" />
                    </div>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="relative flex items-center justify-between mt-4">
        <button
          onClick={goPrev}
          disabled={!canGoPrev}
          className={`p-1.5 rounded-lg transition-all ${
            canGoPrev
              ? 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15]'
              : 'opacity-20 cursor-not-allowed'
          }`}
        >
          <ChevronLeft size={14} className="text-white/60" />
        </button>

        {/* Progress dots with category colors */}
        <div className="flex items-center gap-1.5">
          {challenges.map((challenge, i) => {
            const category = getChallengeCategory(challenge.title);
            const colors = categoryColors[category];
            return (
              <button
                key={challenge.id}
                onClick={() => setCurrentIndex(i)}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === currentIndex ? '16px' : challenge.completed ? '8px' : '6px',
                  backgroundColor: i === currentIndex
                    ? colors.color
                    : challenge.completed
                      ? 'rgba(16, 185, 129, 0.6)'
                      : 'rgba(255, 255, 255, 0.2)',
                }}
              />
            );
          })}
        </div>

        <button
          onClick={goNext}
          disabled={!canGoNext}
          className={`p-1.5 rounded-lg transition-all ${
            canGoNext
              ? 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15]'
              : 'opacity-20 cursor-not-allowed'
          }`}
        >
          <ChevronRight size={14} className="text-white/60" />
        </button>
      </div>
    </div>
  );
}

function AllCompleteState({ completedCount, total }: { completedCount: number; total: number }) {
  return (
    <div className="relative bg-gradient-to-br from-surface via-surface to-surface-2 rounded-theme-xl border border-border p-5 shadow-card overflow-hidden">
      {/* Celebration background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-success/8 via-transparent to-warning/8 pointer-events-none" />

      {/* Header */}
      <div className="relative mb-4">
        <h3 className="font-bold text-text-primary">Micro-Wins</h3>
        <p className="text-xs text-accent">Personalized for you</p>
      </div>

      {/* Celebration content */}
      <div
        className="relative flex items-center gap-4 p-4 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, transparent 60%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        }}
      >
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-success/20 rounded-full blur-lg animate-pulse" />
          <div
            className="relative p-3 rounded-full"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <Trophy size={22} style={{ color: '#10B981' }} />
          </div>
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-white">All Done!</h4>
          <p className="text-sm text-white/70 mt-0.5">
            {completedCount}/{total} micro-wins completed
          </p>
          {/* Stars decoration */}
          <div className="flex gap-1 mt-2">
            {Array.from({ length: Math.min(total, 5) }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className="text-warning fill-warning"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MicroWinsWidgetSkeleton() {
  return (
    <div className="relative bg-gradient-to-br from-surface via-surface to-surface-2 rounded-theme-xl border border-border p-5 shadow-card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="w-24 h-5 skeleton rounded" />
          <div className="w-32 h-3 skeleton rounded mt-1" />
        </div>
        <div className="w-12 h-6 skeleton rounded-full" />
      </div>
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3.5 bg-white/[0.02] border border-white/[0.05] rounded-xl">
            <div className="flex-1">
              <div className="w-48 h-4 skeleton rounded" />
            </div>
            <div className="w-9 h-9 skeleton rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
