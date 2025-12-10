/**
 * Menu Scanner Types
 * Type definitions for restaurant menu OCR scanning
 */

export type ScanStep = 'capture' | 'scanning' | 'review';

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  isSelected: boolean;
  confidence: number;
}

export interface DetectedRestaurant {
  name: string;
  logoDetected: boolean;
  confidence: number;
  cuisine?: string;
}

export interface MenuScanResult {
  restaurant: DetectedRestaurant | null;
  menuItems: MenuItem[];
  rawText: string;
  scanConfidence: number;
}

export interface MenuScannerModalProps {
  onClose: () => void;
  onConfirm: (items: MenuItem[]) => void;
}

export interface MenuSectionGroup {
  title: string;
  items: MenuItem[];
}
