/**
 * LabDetailModal Component
 * Shows detailed view of a lab panel with all test results
 */

import { X } from 'lucide-react';
import type { LabPanel, LabTestStatus } from '../types';

interface LabDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  panel: LabPanel | null;
}

const statusStyles: Record<LabTestStatus, { text: string; bg: string }> = {
  normal: { text: 'text-emerald-400', bg: 'bg-emerald-500/5' },
  low: { text: 'text-amber-400', bg: 'bg-amber-500/5' },
  high: { text: 'text-rose-400', bg: 'bg-rose-500/5' },
};

export default function LabDetailModal({ isOpen, onClose, panel }: LabDetailModalProps): React.ReactElement | null {
  if (!isOpen || !panel) return null;

  const abnormalCount = panel.tests.filter((t) => t.status !== 'normal').length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-surface w-full max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-white/[0.06] px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{panel.name}</h2>
              <p className="text-xs text-text-muted mt-0.5">Collected: {panel.date}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.06]">
              <X size={20} className="text-text-muted" />
            </button>
          </div>

          {/* Status Summary */}
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                abnormalCount === 0
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-amber-400 bg-amber-500/10'
              }`}
            >
              {abnormalCount === 0
                ? '✓ All results within normal range'
                : `${abnormalCount} result(s) outside normal range`}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-4">
          <div className="space-y-2">
            {/* Column Headers */}
            <div className="flex items-center justify-between px-3 py-2 text-[10px] text-text-muted uppercase tracking-wide">
              <span className="flex-1">Test Name</span>
              <span className="w-24 text-center">Target</span>
              <span className="w-24 text-right">Result</span>
            </div>

            {/* Test Rows */}
            {panel.tests.map((test, i) => {
              const style = statusStyles[test.status];

              return (
                <div
                  key={i}
                  className={`flex items-center justify-between px-3 py-3 rounded-lg ${style.bg} border border-white/[0.03]`}
                >
                  <div className="flex-1">
                    <span className="text-sm text-text-primary">{test.name}</span>
                    {test.status !== 'normal' && (
                      <span className={`ml-2 text-[10px] ${style.text}`}>
                        ({test.status === 'low' ? '↓ Low' : '↑ High'})
                      </span>
                    )}
                  </div>
                  <span className="w-24 text-center text-xs text-text-muted">{test.target}</span>
                  <span className={`w-24 text-right text-sm font-medium ${style.text}`}>
                    {test.value} {test.unit}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Notes Section */}
          <div className="mt-6 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
            <h4 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">Notes</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              {abnormalCount === 0
                ? 'All values are within the expected reference ranges. Continue current health regimen and schedule follow-up testing as recommended.'
                : `${abnormalCount} value(s) are outside the normal reference range. Discuss these results with your healthcare provider at your next visit.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
