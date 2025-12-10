/**
 * Body Signals Selector (FDA-friendly naming - avoiding "symptoms")
 */

import { AlertCircle } from 'lucide-react';
import { SYMPTOM_OPTIONS, capitalize } from '../../components/history';

interface BodySignalsSelectorProps {
  selected: string[];
  onChange: (signals: string[]) => void;
}

export function BodySignalsSelector({ selected, onChange }: BodySignalsSelectorProps): React.ReactElement {
  const toggle = (signal: string) => {
    onChange(
      selected.includes(signal)
        ? selected.filter(s => s !== signal)
        : [...selected, signal]
    );
  };

  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
      <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
        <AlertCircle size={14} className="text-amber-400" />
        How does your body feel?
      </h4>
      <div className="grid grid-cols-4 gap-2">
        {SYMPTOM_OPTIONS.map((signal) => (
          <button
            key={signal}
            onClick={() => toggle(signal)}
            className={`py-2 rounded-lg text-xs font-medium text-center transition-all ${
              selected.includes(signal)
                ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                : 'bg-white/[0.04] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.06]'
            }`}
          >
            {capitalize(signal)}
          </button>
        ))}
      </div>
    </div>
  );
}
