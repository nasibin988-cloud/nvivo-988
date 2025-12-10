/**
 * ImagingCard Component
 * Card preview for imaging reports
 */

import { ChevronRight, Calendar } from 'lucide-react';
import type { ImagingType } from '../types';

interface ImagingCardProps {
  type: ImagingType;
  title: string;
  subtitle: string;
  icon: React.ComponentType<Record<string, unknown>>;
  color: string;
  date: string;
  status: string;
  highlight?: string;
  onClick: () => void;
}

const colorStyles: Record<string, { bg: string; border: string; text: string }> = {
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400' },
};

export default function ImagingCard({
  type: _type,
  title,
  subtitle,
  icon: Icon,
  color,
  date,
  status,
  highlight,
  onClick,
}: ImagingCardProps): React.ReactElement {
  const style = colorStyles[color] || colorStyles.rose;

  return (
    <button
      onClick={onClick}
      className="w-full bg-surface rounded-2xl border border-border p-4 text-left group hover:border-white/[0.08] transition-all"
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${style.bg} ${style.border} border`}>
          <Icon size={24} className={style.text} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
              <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
            </div>
            <ChevronRight size={18} className="text-text-muted group-hover:text-text-secondary transition-colors shrink-0" />
          </div>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Calendar size={12} />
              {date}
            </div>
            <span className="text-xs font-medium text-emerald-400">{status}</span>
          </div>

          {highlight && (
            <div className="mt-3 p-2 bg-white/[0.02] rounded-lg border border-white/[0.04]">
              <p className="text-xs text-text-secondary">{highlight}</p>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
