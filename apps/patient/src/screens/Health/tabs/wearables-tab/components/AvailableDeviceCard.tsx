/**
 * Available Device Card Component
 * Card for devices that can be connected
 */

import { Plus } from 'lucide-react';
import type { AvailableDevice } from '../types';

interface AvailableDeviceCardProps {
  device: AvailableDevice;
}

export function AvailableDeviceCard({ device }: AvailableDeviceCardProps): React.ReactElement {
  const Icon = device.icon;

  return (
    <button className="bg-surface rounded-xl border border-border p-4 text-left hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-surface-2 group-hover:bg-cyan-500/10 transition-colors">
          <Icon size={20} className="text-text-muted group-hover:text-cyan-400 transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-text-primary">{device.name}</p>
            {device.popular && (
              <span className="px-1.5 py-0.5 text-[9px] font-medium bg-amber-500/20 text-amber-400 rounded">
                Popular
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-0.5 truncate">{device.description}</p>
        </div>
        <Plus size={16} className="text-text-muted group-hover:text-cyan-400 transition-colors flex-shrink-0" />
      </div>
    </button>
  );
}
