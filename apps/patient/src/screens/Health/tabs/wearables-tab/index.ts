/**
 * Wearables Tab Module - Main Barrel Export
 */

// Types
export * from './types';

// Data
export { connectedDevices, availableDevices, deviceCategories, colorClasses } from './data';

// Components
export {
  SignalIndicator,
  BatteryIndicator,
  TrendIndicator,
  DataPointCard,
  ConnectedDeviceCard,
  AvailableDeviceCard,
  ManualEntryCard,
  SyncStatusBanner,
  NvivoInsight,
  TerraInfo,
} from './components';
