/**
 * Health Wearables Tab
 * Comprehensive view of connected devices, sync status, and health data
 */

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import {
  connectedDevices,
  availableDevices,
  ConnectedDeviceCard,
  AvailableDeviceCard,
  ManualEntryCard,
  SyncStatusBanner,
  NvivoInsight,
  TerraInfo,
} from './wearables-tab';

export default function WearablesTab(): React.ReactElement {
  const [expandedDevice, setExpandedDevice] = useState<string | null>('apple-watch');
  const [showAllDevices, setShowAllDevices] = useState(false);

  const displayedAvailableDevices = showAllDevices
    ? availableDevices
    : availableDevices.slice(0, 4);

  return (
    <div className="space-y-5">
      {/* Sync Status Banner */}
      <SyncStatusBanner devices={connectedDevices} />

      {/* Connected Devices */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary">Connected Devices</h3>
          <span className="text-xs text-text-muted">{connectedDevices.length} active</span>
        </div>
        <div className="space-y-3">
          {connectedDevices.map((device) => (
            <ConnectedDeviceCard
              key={device.id}
              device={device}
              expanded={expandedDevice === device.id}
              onToggle={() => setExpandedDevice(
                expandedDevice === device.id ? null : device.id
              )}
            />
          ))}
        </div>
      </div>

      {/* Manual Entry */}
      <ManualEntryCard />

      {/* Add Device */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary">Add Device</h3>
          <button
            onClick={() => setShowAllDevices(!showAllDevices)}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
          >
            {showAllDevices ? 'Show less' : 'View all'}
            <ChevronRight size={12} className={showAllDevices ? 'rotate-90' : ''} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayedAvailableDevices.map((device) => (
            <AvailableDeviceCard key={device.id} device={device} />
          ))}
        </div>
      </div>

      {/* NVIVO Insight */}
      <NvivoInsight />

      {/* Terra Info */}
      <TerraInfo />
    </div>
  );
}
