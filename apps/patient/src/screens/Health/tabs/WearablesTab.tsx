/**
 * Health Wearables Tab
 * Comprehensive view of connected devices, sync status, and health data
 */

import { useState } from 'react';
import {
  Watch,
  Activity,
  RefreshCw,
  Plus,
  Check,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Heart,
  Moon,
  Footprints,
  Flame,
  Droplets,
  Settings,
  X,
  Smartphone,
  Zap,
  Clock,
  TrendingUp,
  Battery,
  Wifi,
  WifiOff,
  CircleDot,
  Sparkles,
  PenLine,
} from 'lucide-react';

// Types
interface DataPoint {
  label: string;
  value: string | number;
  unit: string;
  icon: typeof Heart;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

interface ConnectedDevice {
  id: string;
  name: string;
  type: string;
  icon: typeof Watch;
  connected: boolean;
  lastSync: string;
  lastSyncTime: Date;
  batteryLevel?: number;
  signalStrength: 'strong' | 'weak' | 'offline';
  dataTypes: string[];
  recentData: DataPoint[];
  syncStatus: 'synced' | 'syncing' | 'error';
}

interface AvailableDevice {
  id: string;
  name: string;
  icon: typeof Watch;
  category: 'smartwatch' | 'fitness' | 'cgm' | 'sleep' | 'other';
  description: string;
  popular?: boolean;
}

// Mock data for connected devices with richer information
const connectedDevices: ConnectedDevice[] = [
  {
    id: 'apple-watch',
    name: 'Apple Watch Series 9',
    type: 'Smartwatch',
    icon: Watch,
    connected: true,
    lastSync: '2 min ago',
    lastSyncTime: new Date(Date.now() - 2 * 60 * 1000),
    batteryLevel: 78,
    signalStrength: 'strong',
    dataTypes: ['Heart Rate', 'Steps', 'Sleep', 'HRV', 'Blood Oxygen', 'Workouts'],
    syncStatus: 'synced',
    recentData: [
      { label: 'Heart Rate', value: 72, unit: 'bpm', icon: Heart, color: 'rose', trend: 'stable' },
      { label: 'Steps Today', value: '8,432', unit: 'steps', icon: Footprints, color: 'emerald', trend: 'up' },
      { label: 'HRV', value: 48, unit: 'ms', icon: Activity, color: 'violet', trend: 'up' },
      { label: 'SpO2', value: 98, unit: '%', icon: Droplets, color: 'cyan', trend: 'stable' },
    ],
  },
  {
    id: 'oura',
    name: 'Oura Ring Gen 3',
    type: 'Sleep & Recovery',
    icon: CircleDot,
    connected: true,
    lastSync: '1 hour ago',
    lastSyncTime: new Date(Date.now() - 60 * 60 * 1000),
    batteryLevel: 45,
    signalStrength: 'strong',
    dataTypes: ['Sleep', 'Readiness', 'Activity', 'Temperature', 'HRV'],
    syncStatus: 'synced',
    recentData: [
      { label: 'Sleep Score', value: 85, unit: '/100', icon: Moon, color: 'indigo', trend: 'up' },
      { label: 'Readiness', value: 78, unit: '/100', icon: Zap, color: 'amber', trend: 'stable' },
      { label: 'Resting HR', value: 58, unit: 'bpm', icon: Heart, color: 'rose', trend: 'down' },
      { label: 'Body Temp', value: '+0.2', unit: '°C', icon: Activity, color: 'orange' },
    ],
  },
];

// Available devices to connect
const availableDevices: AvailableDevice[] = [
  { id: 'fitbit', name: 'Fitbit', icon: Watch, category: 'fitness', description: 'Sense 2, Versa 4, Charge 6', popular: true },
  { id: 'garmin', name: 'Garmin', icon: Watch, category: 'fitness', description: 'Venu 3, Fenix 8, Forerunner', popular: true },
  { id: 'whoop', name: 'WHOOP 4.0', icon: Activity, category: 'fitness', description: 'Strain & recovery tracking' },
  { id: 'samsung', name: 'Samsung Galaxy Watch', icon: Watch, category: 'smartwatch', description: 'Galaxy Watch 6, Watch 5' },
  { id: 'dexcom', name: 'Dexcom G7', icon: Droplets, category: 'cgm', description: 'Continuous glucose monitor', popular: true },
  { id: 'freestyle', name: 'FreeStyle Libre 3', icon: Droplets, category: 'cgm', description: 'Continuous glucose monitor' },
  { id: 'withings', name: 'Withings', icon: Activity, category: 'other', description: 'ScanWatch, Body+, BPM' },
  { id: 'polar', name: 'Polar', icon: Heart, category: 'fitness', description: 'Vantage V3, Pacer Pro, H10' },
];

// Device category configuration
const deviceCategories = {
  smartwatch: { label: 'Smartwatches', icon: Watch, color: 'cyan' },
  fitness: { label: 'Fitness Trackers', icon: Activity, color: 'emerald' },
  cgm: { label: 'CGM Devices', icon: Droplets, color: 'amber' },
  sleep: { label: 'Sleep Trackers', icon: Moon, color: 'indigo' },
  other: { label: 'Other Devices', icon: Smartphone, color: 'violet' },
};

// Helper components
function SignalIndicator({ strength }: { strength: 'strong' | 'weak' | 'offline' }) {
  if (strength === 'offline') {
    return <WifiOff size={12} className="text-text-muted" />;
  }
  return (
    <Wifi
      size={12}
      className={strength === 'strong' ? 'text-emerald-400' : 'text-amber-400'}
    />
  );
}

function BatteryIndicator({ level }: { level?: number }) {
  if (level === undefined) return null;

  const color = level > 50 ? 'text-emerald-400' : level > 20 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="flex items-center gap-1">
      <Battery size={12} className={color} />
      <span className="text-[10px] text-text-muted">{level}%</span>
    </div>
  );
}

function TrendIndicator({ trend }: { trend?: 'up' | 'down' | 'stable' }) {
  if (!trend || trend === 'stable') return null;

  return trend === 'up' ? (
    <TrendingUp size={10} className="text-emerald-400" />
  ) : (
    <TrendingUp size={10} className="text-rose-400 rotate-180" />
  );
}

function DataPointCard({ data }: { data: DataPoint }) {
  const Icon = data.icon;
  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  };

  const colors = colorClasses[data.color] || colorClasses.cyan;

  return (
    <div className={`rounded-lg ${colors.bg} ${colors.border} border p-2`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={10} className={colors.text} />
        <span className="text-[10px] text-text-muted">{data.label}</span>
        <TrendIndicator trend={data.trend} />
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-sm font-bold text-text-primary">{data.value}</span>
        <span className="text-[10px] text-text-muted">{data.unit}</span>
      </div>
    </div>
  );
}

// Connected Device Card
function ConnectedDeviceCard({ device, expanded, onToggle }: {
  device: ConnectedDevice;
  expanded: boolean;
  onToggle: () => void;
}) {
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

// Available Device Card
function AvailableDeviceCard({ device }: { device: AvailableDevice }) {
  const Icon = device.icon;
  const categoryConfig = deviceCategories[device.category];

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

// Manual Entry Card
function ManualEntryCard() {
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

// Main Component
export default function WearablesTab() {
  const [expandedDevice, setExpandedDevice] = useState<string | null>('apple-watch');
  const [showAllDevices, setShowAllDevices] = useState(false);

  const displayedAvailableDevices = showAllDevices
    ? availableDevices
    : availableDevices.slice(0, 4);

  const totalDataPoints = connectedDevices.reduce(
    (sum, device) => sum + device.dataTypes.length,
    0
  );

  return (
    <div className="space-y-5">
      {/* Sync Status Banner */}
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
                  {connectedDevices.length} devices • {totalDataPoints} data types
                </span>
              </div>
            </div>
          </div>
          <button className="p-2.5 rounded-xl bg-surface border border-border hover:bg-surface-2 hover:border-emerald-500/30 transition-all group">
            <RefreshCw size={16} className="text-text-muted group-hover:text-emerald-400 transition-colors" />
          </button>
        </div>
      </div>

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
      <div className="bg-gradient-to-br from-surface to-surface/50 rounded-xl border border-cyan-500/10 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10">
            <Sparkles size={14} className="text-cyan-400" />
          </div>
          <span className="text-sm font-medium text-text-primary">NVIVO Insight</span>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          Your wearable data helps us provide personalized health insights. We've collected over{' '}
          <span className="font-semibold text-cyan-400">2,400 data points</span> in the last 30 days,
          tracking your heart health, sleep patterns, and activity levels. This data feeds directly
          into your health trends and helps your care team monitor your progress.
        </p>
      </div>

      {/* Terra Info */}
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
    </div>
  );
}
