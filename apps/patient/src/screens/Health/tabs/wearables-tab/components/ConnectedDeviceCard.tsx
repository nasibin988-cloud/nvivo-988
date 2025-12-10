/**
 * Connected Device Card Component
 * Expandable card showing device details and recent data
 */

import {
  RefreshCw,
  Check,
  ChevronDown,
  ChevronUp,
  Settings,
  X,
  Clock,
} from 'lucide-react';
import type { ConnectedDevice } from '../types';
import { SignalIndicator, BatteryIndicator } from './Indicators';
import { DataPointCard } from './DataPointCard';

interface ConnectedDeviceCardProps {
  device: ConnectedDevice;
  expanded: boolean;
  onToggle: () => void;
}

export function ConnectedDeviceCard({ device, expanded, onToggle }: ConnectedDeviceCardProps): React.ReactElement {
  const Icon = device.icon;

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <Icon size={24} className="text-cyan-400" />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-text-primary">{device.name}</h4>
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-500/20 text-emerald-400 rounded">
              {device.syncStatus === 'syncing' ? 'Syncing...' : 'Connected'}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-text-muted">{device.type}</p>
            <span className="text-xs text-text-muted">•</span>
            <div className="flex items-center gap-1">
              <Clock size={10} className="text-text-muted" />
              <span className="text-xs text-text-muted">{device.lastSync}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <SignalIndicator strength={device.signalStrength} />
            <BatteryIndicator level={device.batteryLevel} />
          </div>
          {expanded ? (
            <ChevronUp size={16} className="text-text-muted" />
          ) : (
            <ChevronDown size={16} className="text-text-muted" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
          {/* Recent Data Grid */}
          <div>
            <h5 className="text-xs font-medium text-text-secondary mb-2">Recent Data</h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {device.recentData.map((data) => (
                <DataPointCard key={data.label} data={data} />
              ))}
            </div>
          </div>

          {/* Data Types */}
          <div>
            <h5 className="text-xs font-medium text-text-secondary mb-2">Synced Data Types</h5>
            <div className="flex flex-wrap gap-1.5">
              {device.dataTypes.map((type) => (
                <span
                  key={type}
                  className="px-2 py-1 text-[10px] bg-surface-2 text-text-muted rounded-full flex items-center gap-1"
                >
                  <Check size={8} className="text-emerald-400" />
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border text-xs text-text-secondary transition-colors">
              <RefreshCw size={12} />
              Sync Now
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border text-xs text-text-secondary transition-colors">
              <Settings size={12} />
              Settings
            </button>
            <button className="py-2 px-3 rounded-lg hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-xs text-text-muted hover:text-rose-400 transition-colors">
              <X size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
