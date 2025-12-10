/**
 * LabTestRow Component
 * Displays a single lab test result with status indicator
 */

import type { LabTest } from '../types';

interface LabTestRowProps {
  test: LabTest;
}

const statusStyles = {
  normal: 'text-emerald-400',
  low: 'text-amber-400',
  high: 'text-rose-400',
};

export default function LabTestRow({ test }: LabTestRowProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
      <span className="text-xs text-text-secondary flex-1">{test.name}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-text-muted w-20 text-right">{test.target}</span>
        <span className={`text-xs font-medium w-20 text-right ${statusStyles[test.status]}`}>
          {test.value} {test.unit}
        </span>
      </div>
    </div>
  );
}
