/**
 * Wearables Tab Data
 */

import {
  Watch,
  Activity,
  Heart,
  Moon,
  Footprints,
  Droplets,
  Zap,
  Smartphone,
  CircleDot,
} from 'lucide-react';
import type { ConnectedDevice, AvailableDevice, DeviceCategories, ColorClasses } from './types';

// Connected devices mock data
export const connectedDevices: ConnectedDevice[] = [
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
export const availableDevices: AvailableDevice[] = [
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
export const deviceCategories: DeviceCategories = {
  smartwatch: { label: 'Smartwatches', icon: Watch, color: 'cyan' },
  fitness: { label: 'Fitness Trackers', icon: Activity, color: 'emerald' },
  cgm: { label: 'CGM Devices', icon: Droplets, color: 'amber' },
  sleep: { label: 'Sleep Trackers', icon: Moon, color: 'indigo' },
  other: { label: 'Other Devices', icon: Smartphone, color: 'violet' },
};

// Color classes for data points
export const colorClasses: Record<string, ColorClasses> = {
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
};
