/**
 * Phase Card Component
 * Journey phase timeline item
 */

import { useState } from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import type { JourneyPhase, ColorClasses } from '../types';

interface PhaseCardProps {
  phase: JourneyPhase;
  index: number;
  total: number;
}

const colorClasses: Record<string, ColorClasses & { dot: string }> = {
  slate: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', dot: 'bg-slate-400' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', dot: 'bg-cyan-400' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', dot: 'bg-violet-400' },
};

export function PhaseCard({ phase, index, total }: PhaseCardProps): React.ReactElement {
  const [expanded, setExpanded] = useState(phase.current || false);
  const colors = colorClasses[phase.color] || colorClasses.slate;

  return (
    <div className="relative">
      {/* Connector line */}
      {index < total - 1 && (
        <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gradient-to-b from-border to-transparent" />
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full text-left rounded-xl border p-4 transition-all ${
          phase.current
            ? `${colors.bg} ${colors.border}`
            : 'bg-surface border-border hover:border-white/[0.1]'
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Phase number/status */}
          <div
            className={`relative w-12 h-12 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center shrink-0`}
          >
            {phase.completed ? (
              <CheckCircle2 size={20} className={colors.text} />
            ) : phase.current ? (
              <div className="relative">
                <span className={`text-lg font-bold ${colors.text}`}>{index + 1}</span>
                <div
                  className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${colors.dot} animate-pulse`}
                />
              </div>
            ) : (
              <span className="text-lg font-bold text-text-muted">{index + 1}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-text-primary">{phase.name}</h4>
                  {phase.current && (
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded ${colors.bg} ${colors.text}`}
                    >
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5">{phase.period}</p>
              </div>
              <ChevronRight
                size={16}
                className={`text-text-muted transition-transform ${expanded ? 'rotate-90' : ''}`}
              />
            </div>
            <p className="text-xs text-text-secondary mt-1">{phase.description}</p>
          </div>
        </div>

        {/* Expanded highlights */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-2 ml-15">
            {phase.highlights.map((highlight, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${colors.dot} mt-1.5 shrink-0`} />
                <div>
                  <span className="text-xs font-medium text-text-primary">{highlight.label}</span>
                  <span className="text-xs text-text-muted"> — {highlight.detail}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </button>
    </div>
  );
}
