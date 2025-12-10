/**
 * Manual Entry Card Component
 * Card for users without wearables to log data manually
 */

import { PenLine, Heart, Droplets, Moon, Footprints } from 'lucide-react';

export function ManualEntryCard(): React.ReactElement {
  return (
    <div className="bg-gradient-to-br from-violet-500/5 to-indigo-500/5 rounded-2xl border border-violet-500/10 p-5">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
          <PenLine size={24} className="text-violet-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-text-primary">Manual Health Entry</h4>
          <p className="text-xs text-text-muted mt-1">
            Don't have a wearable? You can still track your health by entering data manually.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-surface border border-border hover:border-violet-500/30 text-xs text-text-secondary hover:text-violet-400 transition-colors">
              <Heart size={12} />
              Blood Pressure
            </button>
            <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-surface border border-border hover:border-violet-500/30 text-xs text-text-secondary hover:text-violet-400 transition-colors">
              <Droplets size={12} />
              Blood Glucose
            </button>
            <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-surface border border-border hover:border-violet-500/30 text-xs text-text-secondary hover:text-violet-400 transition-colors">
              <Moon size={12} />
              Sleep
            </button>
            <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-surface border border-border hover:border-violet-500/30 text-xs text-text-secondary hover:text-violet-400 transition-colors">
              <Footprints size={12} />
              Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
