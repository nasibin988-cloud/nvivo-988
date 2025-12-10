/**
 * Imaging Types
 * Type definitions for health imaging data
 */

export type ImagingType = 'ccta' | 'echo' | 'brain-mri';

export interface CCTAMetric {
  label: string;
  current: number | string;
  prior: number | string | null;
  unit: string;
  target?: string;
  change?: number;
  status: 'improved' | 'stable' | 'worsened' | 'normal';
}

export interface VesselData {
  name: string;
  stenosis: number;
  priorStenosis: number | null;
  plaqueType: 'calcified' | 'mixed' | 'soft' | 'none';
  status: 'normal' | 'mild' | 'moderate' | 'severe';
}

export interface EchoMetric {
  label: string;
  value: string | number;
  unit: string;
  range: string;
  status: 'normal' | 'borderline' | 'abnormal';
}

export interface BrainMRIMetric {
  label: string;
  value: string | number;
  unit: string;
  interpretation: string;
  status: 'normal' | 'borderline' | 'abnormal';
}

export interface KnowledgeItem {
  title: string;
  summary: string;
  detail: string;
}

export interface ValveData {
  name: string;
  status: string;
  regurgitation: string;
}

export interface BrainRegion {
  name: string;
  status: string;
  notes: string;
}

export interface CCTAScanData {
  date: string;
  cadRads: string;
  cadRadsDescription: string;
}

export interface CCTAData {
  currentScan: CCTAScanData;
  priorScan: CCTAScanData;
  metrics: CCTAMetric[];
  vessels: VesselData[];
  findings: string[];
  recommendations: string[];
}

export interface EchoData {
  scanDate: string;
  overallStatus: string;
  metrics: EchoMetric[];
  valves: ValveData[];
  findings: string[];
}

export interface BrainMRIData {
  scanDate: string;
  overallStatus: string;
  metrics: BrainMRIMetric[];
  regions: BrainRegion[];
  findings: string[];
}
