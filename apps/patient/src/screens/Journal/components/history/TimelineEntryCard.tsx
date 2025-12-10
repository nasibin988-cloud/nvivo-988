/**
 * Timeline Entry Card - Compact Pill Style
 * Reusable across Journal tabs for displaying history entries
 */

import { HistoryLog } from './types';
import { NEGATIVE_TAGS } from './constants';
import { calculateVitalityScore, getVitalityColor, capitalize } from './colorUtils';

interface TimelineEntryCardProps {
  log: HistoryLog;
  onEdit: () => void;
}

export function TimelineEntryCard({ log, onEdit }: TimelineEntryCardProps): React.ReactElement {
  const vitalityScore = calculateVitalityScore(log);
  const vitalityColor = getVitalityColor(vitalityScore);

  const dateObj = new Date(log.date);
  const dayNum = dateObj.getDate();
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const year = dateObj.getFullYear();
  const currentYear = new Date().getFullYear();
  const showYear = year !== currentYear;

  return (
    <button
      onClick={onEdit}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-violet-500/20 transition-all text-left group"
    >
      {/* Date tile */}
      <div className="flex-shrink-0 w-14 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col items-center py-2">
        <span className="text-[10px] text-violet-400 font-medium uppercase">{dayName}</span>
        <span className="text-xl font-bold text-text-primary leading-none">{dayNum}</span>
        <span className="text-[9px] text-text-muted uppercase">{monthShort}{showYear ? ` ${year}` : ''}</span>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-2">
        <div className="w-12 text-center py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/15">
          <div className="text-sm font-bold text-emerald-400">{log.mood}</div>
          <div className="text-[8px] text-text-muted uppercase">Mood</div>
        </div>
        <div className="w-12 text-center py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/15">
          <div className="text-sm font-bold text-amber-400">{log.energy}</div>
          <div className="text-[8px] text-text-muted uppercase">Energy</div>
        </div>
        <div className="w-12 text-center py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/15">
          <div className="text-sm font-bold text-rose-400">{log.stress}</div>
          <div className="text-[8px] text-text-muted uppercase">Stress</div>
        </div>
        <div className="w-12 text-center py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/15">
          <div className="text-sm font-bold text-violet-400">{log.sleepQuality}</div>
          <div className="text-[8px] text-text-muted uppercase">Sleep</div>
        </div>
        <div className="w-12 text-center py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/15">
          <div className="text-sm font-bold text-cyan-400">{log.sleepHours.toFixed(1)}</div>
          <div className="text-[8px] text-text-muted uppercase">Hours</div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex-1 flex flex-wrap gap-1.5 justify-end">
        {log.tags.slice(0, 3).map(tag => (
          <span
            key={tag}
            className={`px-2 py-1 rounded-md text-xs font-medium ${
              NEGATIVE_TAGS.includes(tag)
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {capitalize(tag)}
          </span>
        ))}
        {log.tags.length > 3 && (
          <span className="px-2 py-1 rounded-md text-xs text-text-muted bg-white/[0.03]">+{log.tags.length - 3}</span>
        )}
      </div>

      {/* Vitality Score */}
      <div className="flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center" style={{ background: `${vitalityColor}10`, border: `1px solid ${vitalityColor}30` }}>
        <span className="text-xl font-bold leading-none" style={{ color: vitalityColor }}>{vitalityScore}</span>
        <span className="text-[7px] text-text-muted uppercase">Vitality</span>
      </div>
    </button>
  );
}
