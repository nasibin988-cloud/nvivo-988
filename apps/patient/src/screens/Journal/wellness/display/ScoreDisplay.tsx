/**
 * Score Display - Compact display of wellness scores
 */

import { HistoryLog, getScoreColor } from '../../components/history';

interface ScoreDisplayProps {
  log: HistoryLog;
}

export function ScoreDisplay({ log }: ScoreDisplayProps): React.ReactElement {
  const scores = [
    { label: 'Mood', value: log.mood, color: getScoreColor(log.mood) },
    { label: 'Energy', value: log.energy, color: getScoreColor(log.energy) },
    { label: 'Stress', value: log.stress, color: getScoreColor(log.stress, true) },
    { label: 'Sleep', value: log.sleepQuality, color: getScoreColor(log.sleepQuality), suffix: ` · ${log.sleepHours.toFixed(1)}h` },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mt-4">
      {scores.map(({ label, value, color, suffix }) => (
        <div key={label} className="text-center">
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium block mb-1">{label}</span>
          <div className="text-xl font-bold" style={{ color }}>
            {value}
            <span className="text-xs text-text-muted font-normal">/10{suffix || ''}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
