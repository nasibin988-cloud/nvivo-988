/**
 * Labs Types
 * Type definitions for lab tests and panels
 */

export type LabTestStatus = 'normal' | 'low' | 'high';

export interface LabTest {
  name: string;
  value: string;
  unit: string;
  target: string;
  status: LabTestStatus;
}

export interface LabPanel {
  id: string;
  name: string;
  date: string; // mm/dd/yy format
  tests: LabTest[];
  overallStatus: 'All Normal' | string;
}

export interface LabHistoryEntry {
  date: string;
  label: string;
  panels: LabPanel[];
}

export const dateLabels: Record<string, string> = {
  '12/01/24': 'December 2024',
  '09/15/24': 'September 2024',
  '06/10/24': 'June 2024',
  '03/05/24': 'March 2024',
  '12/12/23': 'December 2023',
};
