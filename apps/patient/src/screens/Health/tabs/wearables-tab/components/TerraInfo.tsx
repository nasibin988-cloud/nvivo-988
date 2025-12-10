/**
 * Terra Info Component
 * Information about secure data sync through Terra
 */

import { AlertCircle } from 'lucide-react';

export function TerraInfo(): React.ReactElement {
  return (
    <div className="bg-surface/50 rounded-xl border border-border p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-surface-2">
          <AlertCircle size={14} className="text-text-muted" />
        </div>
        <div>
          <p className="text-xs font-medium text-text-secondary mb-1">Secure Data Sync</p>
          <p className="text-xs text-text-muted leading-relaxed">
            All wearable data is synced securely through Terra's HIPAA-compliant infrastructure.
            Your data is encrypted end-to-end and never shared with third parties without your consent.
          </p>
        </div>
      </div>
    </div>
  );
}
