/**
 * LabPanelCard Component
 * Displays a lab panel with all tests and status summary
 */

import { ChevronRight } from 'lucide-react';
import type { LabPanel } from '../types';
import LabTestRow from './LabTestRow';

interface LabPanelCardProps {
  panel: LabPanel;
  onViewDetails: () => void;
}

export default function LabPanelCard({ panel, onViewDetails }: LabPanelCardProps): React.ReactElement {
  const abnormalCount = panel.tests.filter((t) => t.status !== 'normal').length;

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 border-b border-white/[0.04]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{panel.name}</h3>
            <p className="text-xs text-text-muted mt-0.5">{panel.date}</p>
          </div>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              abnormalCount === 0
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-amber-400 bg-amber-500/10'
            }`}
          >
            {abnormalCount === 0 ? 'All Normal' : `${abnormalCount} Outside Range`}
          </span>
        </div>
      </div>

      {/* Tests Header */}
      <div className="px-4 py-2 bg-white/[0.02] flex items-center justify-between text-[10px] text-text-muted uppercase tracking-wide">
        <span>Test</span>
        <div className="flex items-center gap-3">
          <span className="w-20 text-right">Target</span>
          <span className="w-20 text-right">Result</span>
        </div>
      </div>

      {/* Tests */}
      <div className="px-4">
        {panel.tests.map((test, i) => (
          <LabTestRow key={i} test={test} />
        ))}
      </div>

      {/* View Details */}
      <button
        onClick={onViewDetails}
        className="w-full py-3 border-t border-white/[0.04] flex items-center justify-center gap-1 text-xs text-text-muted hover:text-text-secondary hover:bg-white/[0.02] transition-colors"
      >
        View full details
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
