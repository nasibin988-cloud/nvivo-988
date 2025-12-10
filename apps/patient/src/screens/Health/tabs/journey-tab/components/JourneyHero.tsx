/**
 * Journey Hero Component
 * Hero section with journey celebration
 */

import { Trophy, TrendingDown, Heart, Flame } from 'lucide-react';

interface JourneyHeroProps {
  daysSinceStart: number;
  twoYearProgress: number;
  completedPhases: number;
}

export function JourneyHero({
  daysSinceStart,
  twoYearProgress,
  completedPhases,
}: JourneyHeroProps): React.ReactElement {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface border border-border">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-cyan-500/8 to-transparent rounded-full blur-xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] border border-white/[0.02] rounded-full" />
      </div>

      <div className="relative z-10 p-5">
        {/* Top row with badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-5 px-2 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wide leading-none">
                  Year One
                </span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-text-primary leading-tight">
              {daysSinceStart} Days
              <span className="text-emerald-400"> Stronger</span>
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Building a healthier heart, one day at a time
            </p>
          </div>

          {/* Achievement badge */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Trophy size={28} className="text-emerald-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-surface flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">{completedPhases}</span>
            </div>
          </div>
        </div>

        {/* Progress timeline - 2 year journey */}
        <div className="relative mb-4">
          <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden relative">
            {/* Year 1 marker */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 relative"
              style={{ width: `${twoYearProgress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-400 rounded-full border-2 border-surface shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] mt-1.5">
            <span className="text-text-muted">May 2024</span>
            <span className="text-text-muted/60">Year 1</span>
            <span className="text-text-muted">May 2026</span>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-surface-2/50 rounded-lg p-2.5 border border-white/[0.03]">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingDown size={10} className="text-rose-400" />
              <span className="text-sm font-bold text-text-primary">51%</span>
            </div>
            <p className="text-[9px] text-text-muted text-center">LDL Reduction</p>
            <p className="text-[8px] text-text-muted/70 text-center mt-0.5">132 → 65 mg/dL</p>
          </div>
          <div className="bg-surface-2/50 rounded-lg p-2.5 border border-white/[0.03]">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Heart size={10} className="text-emerald-400" />
              <span className="text-sm font-bold text-text-primary">15%</span>
            </div>
            <p className="text-[9px] text-text-muted text-center">Plaque Regressed</p>
            <p className="text-[8px] text-text-muted/70 text-center mt-0.5">Arteries healing</p>
          </div>
          <div className="bg-surface-2/50 rounded-lg p-2.5 border border-white/[0.03]">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame size={10} className="text-amber-400" />
              <span className="text-sm font-bold text-text-primary">95%</span>
            </div>
            <p className="text-[9px] text-text-muted text-center">Adherence</p>
            <p className="text-[8px] text-text-muted/70 text-center mt-0.5">Meds & habits</p>
          </div>
        </div>
      </div>
    </div>
  );
}
