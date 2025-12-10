/**
 * LabHistoryModal Component
 * Shows complete lab history organized by date
 */

import { useMemo } from 'react';
import { X, ChevronRight, FileText } from 'lucide-react';
import type { LabPanel } from '../types';
import { allLabHistory, getLabHistoryByDate } from '../data';

interface LabHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPanel: (panel: LabPanel) => void;
}

export default function LabHistoryModal({
  isOpen,
  onClose,
  onSelectPanel,
}: LabHistoryModalProps): React.ReactElement | null {
  const labHistory = useMemo(() => getLabHistoryByDate(), []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-surface w-full max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-white/[0.06] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Lab History</h2>
              <p className="text-xs text-text-muted mt-0.5">
                {labHistory.length} visits • {allLabHistory.length} total panels
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.06]">
              <X size={20} className="text-text-muted" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-4 space-y-6">
          {labHistory.map((entry, i) => {
            // Calculate total abnormals for this date
            const totalAbnormal = entry.panels.reduce(
              (sum, panel) => sum + panel.tests.filter((t) => t.status !== 'normal').length,
              0
            );

            return (
              <div key={i}>
                {/* Date header with summary */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-400" />
                    <h3 className="text-sm font-medium text-text-primary">{entry.label}</h3>
                  </div>
                  <span
                    className={`text-xs ${totalAbnormal === 0 ? 'text-emerald-400' : 'text-amber-400'}`}
                  >
                    {totalAbnormal === 0 ? 'All Normal' : `${totalAbnormal} Outside Range`}
                  </span>
                </div>

                {/* Panels for this date */}
                <div className="space-y-2 pl-4 border-l-2 border-white/[0.06]">
                  {entry.panels.map((panel) => {
                    const abnormalCount = panel.tests.filter((t) => t.status !== 'normal').length;
                    const hasAbnormal = abnormalCount > 0;

                    return (
                      <button
                        key={panel.id}
                        onClick={() => {
                          onClose();
                          onSelectPanel(panel);
                        }}
                        className={`w-full rounded-xl p-3 border transition-all text-left ${
                          hasAbnormal
                            ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                            : 'bg-white/[0.02] border-white/[0.04] hover:border-white/[0.08]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                hasAbnormal ? 'bg-amber-500/10' : 'bg-emerald-500/10'
                              }`}
                            >
                              <FileText
                                size={14}
                                className={hasAbnormal ? 'text-amber-400' : 'text-emerald-400'}
                              />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-text-primary">{panel.name}</h4>
                              <p className="text-[11px] text-text-muted">{panel.tests.length} tests</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {hasAbnormal ? (
                              <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                {abnormalCount} flag{abnormalCount > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="text-xs text-emerald-400">✓</span>
                            )}
                            <ChevronRight size={14} className="text-text-muted" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Timeline legend */}
          <div className="mt-4 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Showing {labHistory.length} lab visits</span>
              <span>Dec 2023 — Dec 2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
