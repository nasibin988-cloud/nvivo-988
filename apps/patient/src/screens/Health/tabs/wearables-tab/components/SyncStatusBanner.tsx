/**
 * Sync Status Banner Component
 * Shows overall sync status for all connected devices
 */

import { Check, RefreshCw } from 'lucide-react';
import type { ConnectedDevice } from '../types';

interface SyncStatusBannerProps {
  devices: ConnectedDevice[];
}

export function SyncStatusBanner({ devices }: SyncStatusBannerProps): React.ReactElement {
  const totalDataPoints = devices.reduce(
    (sum, device) => sum + device.dataTypes.length,
    0
  );

  return (
    <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/5 rounded-2xl border border-emerald-500/20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
            <Check size={20} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">All devices synced</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-text-muted">
                {devices.length} devices • {totalDataPoints} data types
              </span>
            </div>
          </div>
        </div>
        <button className="p-2.5 rounded-xl bg-surface border border-border hover:bg-surface-2 hover:border-emerald-500/30 transition-all group">
          <RefreshCw size={16} className="text-text-muted group-hover:text-emerald-400 transition-colors" />
        </button>
      </div>
    </div>
  );
}
