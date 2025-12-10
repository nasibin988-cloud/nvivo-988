/**
 * Wearables Tab Types
 */

import type { LucideIcon } from 'lucide-react';

export interface DataPoint {
  label: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface ConnectedDevice {
  id: string;
  name: string;
  type: string;
  icon: LucideIcon;
  connected: boolean;
  lastSync: string;
  lastSyncTime: Date;
  batteryLevel?: number;
  signalStrength: 'strong' | 'weak' | 'offline';
  dataTypes: string[];
  recentData: DataPoint[];
  syncStatus: 'synced' | 'syncing' | 'error';
}

export interface AvailableDevice {
  id: string;
  name: string;
  icon: LucideIcon;
  category: 'smartwatch' | 'fitness' | 'cgm' | 'sleep' | 'other';
  description: string;
  popular?: boolean;
}

export interface DeviceCategoryConfig {
  label: string;
  icon: LucideIcon;
  color: string;
}

export type DeviceCategories = Record<AvailableDevice['category'], DeviceCategoryConfig>;

export interface ColorClasses {
  bg: string;
  text: string;
  border: string;
}
