/**
 * Lab Data
 * Mock data for lab panels and test results
 */

import type { LabPanel, LabHistoryEntry } from './types';
import { dateLabels } from './types';

// Current (latest) results shown on main Labs tab
export const currentLabPanels: LabPanel[] = [
  {
    id: 'lipid-2024-12-01',
    name: 'Lipid Panel',
    date: '12/01/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'Total Cholesterol', value: '186', unit: 'mg/dL', target: '<200', status: 'normal' },
      { name: 'LDL Cholesterol', value: '108', unit: 'mg/dL', target: '<100', status: 'high' },
      { name: 'HDL Cholesterol', value: '56', unit: 'mg/dL', target: '>40', status: 'normal' },
      { name: 'Triglycerides', value: '142', unit: 'mg/dL', target: '<150', status: 'normal' },
      { name: 'VLDL Cholesterol', value: '28', unit: 'mg/dL', target: '<30', status: 'normal' },
      { name: 'Total/HDL Ratio', value: '3.3', unit: '', target: '<5.0', status: 'normal' },
    ],
  },
  {
    id: 'cbc-2024-12-01',
    name: 'Complete Blood Count',
    date: '12/01/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'Hemoglobin', value: '14.2', unit: 'g/dL', target: '12-16', status: 'normal' },
      { name: 'Hematocrit', value: '42.1', unit: '%', target: '36-48', status: 'normal' },
      { name: 'White Blood Cells', value: '6.8', unit: 'K/uL', target: '4.5-11', status: 'normal' },
      { name: 'Red Blood Cells', value: '4.72', unit: 'M/uL', target: '4.0-5.5', status: 'normal' },
      { name: 'Platelets', value: '245', unit: 'K/uL', target: '150-400', status: 'normal' },
      { name: 'MCV', value: '89.2', unit: 'fL', target: '80-100', status: 'normal' },
      { name: 'MCH', value: '30.1', unit: 'pg', target: '27-33', status: 'normal' },
      { name: 'MCHC', value: '33.7', unit: 'g/dL', target: '32-36', status: 'normal' },
    ],
  },
  {
    id: 'cmp-2024-12-01',
    name: 'Comprehensive Metabolic Panel',
    date: '12/01/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'Glucose, Fasting', value: '94', unit: 'mg/dL', target: '70-100', status: 'normal' },
      { name: 'BUN', value: '15', unit: 'mg/dL', target: '7-20', status: 'normal' },
      { name: 'Creatinine', value: '0.9', unit: 'mg/dL', target: '0.6-1.2', status: 'normal' },
      { name: 'eGFR', value: '95', unit: 'mL/min', target: '>60', status: 'normal' },
      { name: 'Sodium', value: '140', unit: 'mEq/L', target: '136-145', status: 'normal' },
      { name: 'Potassium', value: '4.2', unit: 'mEq/L', target: '3.5-5.0', status: 'normal' },
      { name: 'Chloride', value: '101', unit: 'mEq/L', target: '98-106', status: 'normal' },
      { name: 'CO2', value: '24', unit: 'mEq/L', target: '22-29', status: 'normal' },
      { name: 'Calcium', value: '9.4', unit: 'mg/dL', target: '8.5-10.5', status: 'normal' },
      { name: 'Total Protein', value: '7.0', unit: 'g/dL', target: '6.0-8.3', status: 'normal' },
      { name: 'Albumin', value: '4.2', unit: 'g/dL', target: '3.5-5.0', status: 'normal' },
      { name: 'Bilirubin, Total', value: '0.8', unit: 'mg/dL', target: '0.1-1.2', status: 'normal' },
      { name: 'AST (SGOT)', value: '24', unit: 'U/L', target: '10-40', status: 'normal' },
      { name: 'ALT (SGPT)', value: '28', unit: 'U/L', target: '7-56', status: 'normal' },
    ],
  },
  {
    id: 'hba1c-2024-12-01',
    name: 'Hemoglobin A1c',
    date: '12/01/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'HbA1c', value: '5.4', unit: '%', target: '<5.7', status: 'normal' },
      { name: 'Est. Avg Glucose', value: '108', unit: 'mg/dL', target: '<117', status: 'normal' },
    ],
  },
  {
    id: 'thyroid-2024-12-01',
    name: 'Thyroid Panel',
    date: '12/01/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'TSH', value: '2.1', unit: 'mIU/L', target: '0.4-4.0', status: 'normal' },
      { name: 'Free T4', value: '1.2', unit: 'ng/dL', target: '0.8-1.8', status: 'normal' },
      { name: 'Free T3', value: '3.1', unit: 'pg/mL', target: '2.3-4.2', status: 'normal' },
    ],
  },
  {
    id: 'vitamin-2024-12-01',
    name: 'Vitamin Panel',
    date: '12/01/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'Vitamin D, 25-OH', value: '42', unit: 'ng/mL', target: '30-100', status: 'normal' },
      { name: 'Vitamin B12', value: '510', unit: 'pg/mL', target: '200-900', status: 'normal' },
      { name: 'Folate', value: '14.2', unit: 'ng/mL', target: '>3.0', status: 'normal' },
      { name: 'Ferritin', value: '82', unit: 'ng/mL', target: '20-200', status: 'normal' },
      { name: 'Iron, Total', value: '98', unit: 'mcg/dL', target: '60-170', status: 'normal' },
    ],
  },
  {
    id: 'inflammation-2024-12-01',
    name: 'Inflammatory Markers',
    date: '12/01/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'hs-CRP', value: '0.9', unit: 'mg/L', target: '<1.0', status: 'normal' },
      { name: 'ESR', value: '8', unit: 'mm/hr', target: '0-20', status: 'normal' },
      { name: 'Homocysteine', value: '8.2', unit: 'umol/L', target: '<15', status: 'normal' },
    ],
  },
];

// Historical lab panels
const historicalLabPanels: LabPanel[] = [
  // September 2024
  {
    id: 'lipid-2024-09-15',
    name: 'Lipid Panel',
    date: '09/15/24',
    overallStatus: '1 High',
    tests: [
      { name: 'Total Cholesterol', value: '198', unit: 'mg/dL', target: '<200', status: 'normal' },
      { name: 'LDL Cholesterol', value: '118', unit: 'mg/dL', target: '<100', status: 'high' },
      { name: 'HDL Cholesterol', value: '52', unit: 'mg/dL', target: '>40', status: 'normal' },
      { name: 'Triglycerides', value: '158', unit: 'mg/dL', target: '<150', status: 'high' },
      { name: 'VLDL Cholesterol', value: '32', unit: 'mg/dL', target: '<30', status: 'high' },
      { name: 'Total/HDL Ratio', value: '3.8', unit: '', target: '<5.0', status: 'normal' },
    ],
  },
  {
    id: 'cbc-2024-09-15',
    name: 'Complete Blood Count',
    date: '09/15/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'Hemoglobin', value: '13.8', unit: 'g/dL', target: '12-16', status: 'normal' },
      { name: 'Hematocrit', value: '41.2', unit: '%', target: '36-48', status: 'normal' },
      { name: 'White Blood Cells', value: '7.1', unit: 'K/uL', target: '4.5-11', status: 'normal' },
      { name: 'Red Blood Cells', value: '4.65', unit: 'M/uL', target: '4.0-5.5', status: 'normal' },
      { name: 'Platelets', value: '238', unit: 'K/uL', target: '150-400', status: 'normal' },
      { name: 'MCV', value: '88.6', unit: 'fL', target: '80-100', status: 'normal' },
      { name: 'MCH', value: '29.7', unit: 'pg', target: '27-33', status: 'normal' },
      { name: 'MCHC', value: '33.5', unit: 'g/dL', target: '32-36', status: 'normal' },
    ],
  },
  {
    id: 'cmp-2024-09-15',
    name: 'Comprehensive Metabolic Panel',
    date: '09/15/24',
    overallStatus: '1 High',
    tests: [
      { name: 'Glucose, Fasting', value: '102', unit: 'mg/dL', target: '70-100', status: 'high' },
      { name: 'BUN', value: '16', unit: 'mg/dL', target: '7-20', status: 'normal' },
      { name: 'Creatinine', value: '0.9', unit: 'mg/dL', target: '0.6-1.2', status: 'normal' },
      { name: 'eGFR', value: '92', unit: 'mL/min', target: '>60', status: 'normal' },
      { name: 'Sodium', value: '139', unit: 'mEq/L', target: '136-145', status: 'normal' },
      { name: 'Potassium', value: '4.1', unit: 'mEq/L', target: '3.5-5.0', status: 'normal' },
      { name: 'Chloride', value: '100', unit: 'mEq/L', target: '98-106', status: 'normal' },
      { name: 'CO2', value: '25', unit: 'mEq/L', target: '22-29', status: 'normal' },
      { name: 'Calcium', value: '9.3', unit: 'mg/dL', target: '8.5-10.5', status: 'normal' },
      { name: 'Total Protein', value: '6.9', unit: 'g/dL', target: '6.0-8.3', status: 'normal' },
      { name: 'Albumin', value: '4.1', unit: 'g/dL', target: '3.5-5.0', status: 'normal' },
      { name: 'Bilirubin, Total', value: '0.7', unit: 'mg/dL', target: '0.1-1.2', status: 'normal' },
      { name: 'AST (SGOT)', value: '26', unit: 'U/L', target: '10-40', status: 'normal' },
      { name: 'ALT (SGPT)', value: '32', unit: 'U/L', target: '7-56', status: 'normal' },
    ],
  },
  {
    id: 'hba1c-2024-09-15',
    name: 'Hemoglobin A1c',
    date: '09/15/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'HbA1c', value: '5.6', unit: '%', target: '<5.7', status: 'normal' },
      { name: 'Est. Avg Glucose', value: '114', unit: 'mg/dL', target: '<117', status: 'normal' },
    ],
  },
  {
    id: 'vitamin-2024-09-15',
    name: 'Vitamin Panel',
    date: '09/15/24',
    overallStatus: '1 Low',
    tests: [
      { name: 'Vitamin D, 25-OH', value: '28', unit: 'ng/mL', target: '30-100', status: 'low' },
      { name: 'Vitamin B12', value: '485', unit: 'pg/mL', target: '200-900', status: 'normal' },
      { name: 'Folate', value: '12.5', unit: 'ng/mL', target: '>3.0', status: 'normal' },
      { name: 'Ferritin', value: '78', unit: 'ng/mL', target: '20-200', status: 'normal' },
      { name: 'Iron, Total', value: '95', unit: 'mcg/dL', target: '60-170', status: 'normal' },
    ],
  },

  // June 2024
  {
    id: 'lipid-2024-06-10',
    name: 'Lipid Panel',
    date: '06/10/24',
    overallStatus: '2 High',
    tests: [
      { name: 'Total Cholesterol', value: '212', unit: 'mg/dL', target: '<200', status: 'high' },
      { name: 'LDL Cholesterol', value: '132', unit: 'mg/dL', target: '<100', status: 'high' },
      { name: 'HDL Cholesterol', value: '48', unit: 'mg/dL', target: '>40', status: 'normal' },
      { name: 'Triglycerides', value: '172', unit: 'mg/dL', target: '<150', status: 'high' },
      { name: 'VLDL Cholesterol', value: '34', unit: 'mg/dL', target: '<30', status: 'high' },
      { name: 'Total/HDL Ratio', value: '4.4', unit: '', target: '<5.0', status: 'normal' },
    ],
  },
  {
    id: 'cmp-2024-06-10',
    name: 'Comprehensive Metabolic Panel',
    date: '06/10/24',
    overallStatus: '1 High',
    tests: [
      { name: 'Glucose, Fasting', value: '108', unit: 'mg/dL', target: '70-100', status: 'high' },
      { name: 'BUN', value: '17', unit: 'mg/dL', target: '7-20', status: 'normal' },
      { name: 'Creatinine', value: '1.0', unit: 'mg/dL', target: '0.6-1.2', status: 'normal' },
      { name: 'eGFR', value: '88', unit: 'mL/min', target: '>60', status: 'normal' },
      { name: 'Sodium', value: '141', unit: 'mEq/L', target: '136-145', status: 'normal' },
      { name: 'Potassium', value: '4.3', unit: 'mEq/L', target: '3.5-5.0', status: 'normal' },
      { name: 'Chloride', value: '102', unit: 'mEq/L', target: '98-106', status: 'normal' },
      { name: 'CO2', value: '23', unit: 'mEq/L', target: '22-29', status: 'normal' },
      { name: 'Calcium', value: '9.5', unit: 'mg/dL', target: '8.5-10.5', status: 'normal' },
      { name: 'Total Protein', value: '7.1', unit: 'g/dL', target: '6.0-8.3', status: 'normal' },
      { name: 'Albumin', value: '4.0', unit: 'g/dL', target: '3.5-5.0', status: 'normal' },
      { name: 'Bilirubin, Total', value: '0.9', unit: 'mg/dL', target: '0.1-1.2', status: 'normal' },
      { name: 'AST (SGOT)', value: '28', unit: 'U/L', target: '10-40', status: 'normal' },
      { name: 'ALT (SGPT)', value: '35', unit: 'U/L', target: '7-56', status: 'normal' },
    ],
  },
  {
    id: 'hba1c-2024-06-10',
    name: 'Hemoglobin A1c',
    date: '06/10/24',
    overallStatus: '1 High',
    tests: [
      { name: 'HbA1c', value: '5.8', unit: '%', target: '<5.7', status: 'high' },
      { name: 'Est. Avg Glucose', value: '120', unit: 'mg/dL', target: '<117', status: 'high' },
    ],
  },
  {
    id: 'thyroid-2024-06-10',
    name: 'Thyroid Panel',
    date: '06/10/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'TSH', value: '2.4', unit: 'mIU/L', target: '0.4-4.0', status: 'normal' },
      { name: 'Free T4', value: '1.1', unit: 'ng/dL', target: '0.8-1.8', status: 'normal' },
      { name: 'Free T3', value: '2.9', unit: 'pg/mL', target: '2.3-4.2', status: 'normal' },
    ],
  },

  // March 2024
  {
    id: 'lipid-2024-03-05',
    name: 'Lipid Panel',
    date: '03/05/24',
    overallStatus: '2 High',
    tests: [
      { name: 'Total Cholesterol', value: '225', unit: 'mg/dL', target: '<200', status: 'high' },
      { name: 'LDL Cholesterol', value: '145', unit: 'mg/dL', target: '<100', status: 'high' },
      { name: 'HDL Cholesterol', value: '45', unit: 'mg/dL', target: '>40', status: 'normal' },
      { name: 'Triglycerides', value: '185', unit: 'mg/dL', target: '<150', status: 'high' },
      { name: 'VLDL Cholesterol', value: '37', unit: 'mg/dL', target: '<30', status: 'high' },
      { name: 'Total/HDL Ratio', value: '5.0', unit: '', target: '<5.0', status: 'normal' },
    ],
  },
  {
    id: 'cbc-2024-03-05',
    name: 'Complete Blood Count',
    date: '03/05/24',
    overallStatus: 'All Normal',
    tests: [
      { name: 'Hemoglobin', value: '13.5', unit: 'g/dL', target: '12-16', status: 'normal' },
      { name: 'Hematocrit', value: '40.5', unit: '%', target: '36-48', status: 'normal' },
      { name: 'White Blood Cells', value: '6.5', unit: 'K/uL', target: '4.5-11', status: 'normal' },
      { name: 'Red Blood Cells', value: '4.58', unit: 'M/uL', target: '4.0-5.5', status: 'normal' },
      { name: 'Platelets', value: '232', unit: 'K/uL', target: '150-400', status: 'normal' },
      { name: 'MCV', value: '88.4', unit: 'fL', target: '80-100', status: 'normal' },
      { name: 'MCH', value: '29.5', unit: 'pg', target: '27-33', status: 'normal' },
      { name: 'MCHC', value: '33.3', unit: 'g/dL', target: '32-36', status: 'normal' },
    ],
  },
  {
    id: 'cmp-2024-03-05',
    name: 'Comprehensive Metabolic Panel',
    date: '03/05/24',
    overallStatus: '1 High',
    tests: [
      { name: 'Glucose, Fasting', value: '112', unit: 'mg/dL', target: '70-100', status: 'high' },
      { name: 'BUN', value: '18', unit: 'mg/dL', target: '7-20', status: 'normal' },
      { name: 'Creatinine', value: '1.0', unit: 'mg/dL', target: '0.6-1.2', status: 'normal' },
      { name: 'eGFR', value: '85', unit: 'mL/min', target: '>60', status: 'normal' },
      { name: 'Sodium', value: '138', unit: 'mEq/L', target: '136-145', status: 'normal' },
      { name: 'Potassium', value: '4.4', unit: 'mEq/L', target: '3.5-5.0', status: 'normal' },
      { name: 'Chloride', value: '103', unit: 'mEq/L', target: '98-106', status: 'normal' },
      { name: 'CO2', value: '24', unit: 'mEq/L', target: '22-29', status: 'normal' },
      { name: 'Calcium', value: '9.2', unit: 'mg/dL', target: '8.5-10.5', status: 'normal' },
      { name: 'Total Protein', value: '6.8', unit: 'g/dL', target: '6.0-8.3', status: 'normal' },
      { name: 'Albumin', value: '3.9', unit: 'g/dL', target: '3.5-5.0', status: 'normal' },
      { name: 'Bilirubin, Total', value: '0.8', unit: 'mg/dL', target: '0.1-1.2', status: 'normal' },
      { name: 'AST (SGOT)', value: '30', unit: 'U/L', target: '10-40', status: 'normal' },
      { name: 'ALT (SGPT)', value: '38', unit: 'U/L', target: '7-56', status: 'normal' },
    ],
  },

  // December 2023 (Annual)
  {
    id: 'lipid-2023-12-12',
    name: 'Lipid Panel',
    date: '12/12/23',
    overallStatus: '3 High',
    tests: [
      { name: 'Total Cholesterol', value: '238', unit: 'mg/dL', target: '<200', status: 'high' },
      { name: 'LDL Cholesterol', value: '158', unit: 'mg/dL', target: '<100', status: 'high' },
      { name: 'HDL Cholesterol', value: '42', unit: 'mg/dL', target: '>40', status: 'normal' },
      { name: 'Triglycerides', value: '198', unit: 'mg/dL', target: '<150', status: 'high' },
      { name: 'VLDL Cholesterol', value: '40', unit: 'mg/dL', target: '<30', status: 'high' },
      { name: 'Total/HDL Ratio', value: '5.7', unit: '', target: '<5.0', status: 'high' },
    ],
  },
  {
    id: 'cbc-2023-12-12',
    name: 'Complete Blood Count',
    date: '12/12/23',
    overallStatus: 'All Normal',
    tests: [
      { name: 'Hemoglobin', value: '13.2', unit: 'g/dL', target: '12-16', status: 'normal' },
      { name: 'Hematocrit', value: '39.8', unit: '%', target: '36-48', status: 'normal' },
      { name: 'White Blood Cells', value: '7.2', unit: 'K/uL', target: '4.5-11', status: 'normal' },
      { name: 'Red Blood Cells', value: '4.52', unit: 'M/uL', target: '4.0-5.5', status: 'normal' },
      { name: 'Platelets', value: '228', unit: 'K/uL', target: '150-400', status: 'normal' },
      { name: 'MCV', value: '88.1', unit: 'fL', target: '80-100', status: 'normal' },
      { name: 'MCH', value: '29.2', unit: 'pg', target: '27-33', status: 'normal' },
      { name: 'MCHC', value: '33.2', unit: 'g/dL', target: '32-36', status: 'normal' },
    ],
  },
  {
    id: 'cmp-2023-12-12',
    name: 'Comprehensive Metabolic Panel',
    date: '12/12/23',
    overallStatus: '2 High',
    tests: [
      { name: 'Glucose, Fasting', value: '118', unit: 'mg/dL', target: '70-100', status: 'high' },
      { name: 'BUN', value: '19', unit: 'mg/dL', target: '7-20', status: 'normal' },
      { name: 'Creatinine', value: '1.1', unit: 'mg/dL', target: '0.6-1.2', status: 'normal' },
      { name: 'eGFR', value: '82', unit: 'mL/min', target: '>60', status: 'normal' },
      { name: 'Sodium', value: '137', unit: 'mEq/L', target: '136-145', status: 'normal' },
      { name: 'Potassium', value: '4.5', unit: 'mEq/L', target: '3.5-5.0', status: 'normal' },
      { name: 'Chloride', value: '104', unit: 'mEq/L', target: '98-106', status: 'normal' },
      { name: 'CO2', value: '23', unit: 'mEq/L', target: '22-29', status: 'normal' },
      { name: 'Calcium', value: '9.1', unit: 'mg/dL', target: '8.5-10.5', status: 'normal' },
      { name: 'Total Protein', value: '6.7', unit: 'g/dL', target: '6.0-8.3', status: 'normal' },
      { name: 'Albumin', value: '3.8', unit: 'g/dL', target: '3.5-5.0', status: 'normal' },
      { name: 'Bilirubin, Total', value: '1.0', unit: 'mg/dL', target: '0.1-1.2', status: 'normal' },
      { name: 'AST (SGOT)', value: '32', unit: 'U/L', target: '10-40', status: 'normal' },
      { name: 'ALT (SGPT)', value: '42', unit: 'U/L', target: '7-56', status: 'normal' },
    ],
  },
  {
    id: 'hba1c-2023-12-12',
    name: 'Hemoglobin A1c',
    date: '12/12/23',
    overallStatus: '1 High',
    tests: [
      { name: 'HbA1c', value: '6.1', unit: '%', target: '<5.7', status: 'high' },
      { name: 'Est. Avg Glucose', value: '128', unit: 'mg/dL', target: '<117', status: 'high' },
    ],
  },
  {
    id: 'thyroid-2023-12-12',
    name: 'Thyroid Panel',
    date: '12/12/23',
    overallStatus: 'All Normal',
    tests: [
      { name: 'TSH', value: '2.8', unit: 'mIU/L', target: '0.4-4.0', status: 'normal' },
      { name: 'Free T4', value: '1.0', unit: 'ng/dL', target: '0.8-1.8', status: 'normal' },
      { name: 'Free T3', value: '2.7', unit: 'pg/mL', target: '2.3-4.2', status: 'normal' },
    ],
  },
  {
    id: 'vitamin-2023-12-12',
    name: 'Vitamin Panel',
    date: '12/12/23',
    overallStatus: '1 Low',
    tests: [
      { name: 'Vitamin D, 25-OH', value: '22', unit: 'ng/mL', target: '30-100', status: 'low' },
      { name: 'Vitamin B12', value: '420', unit: 'pg/mL', target: '200-900', status: 'normal' },
      { name: 'Folate', value: '10.8', unit: 'ng/mL', target: '>3.0', status: 'normal' },
      { name: 'Ferritin', value: '65', unit: 'ng/mL', target: '20-200', status: 'normal' },
      { name: 'Iron, Total', value: '85', unit: 'mcg/dL', target: '60-170', status: 'normal' },
    ],
  },
];

// Complete lab history with all past results
export const allLabHistory: LabPanel[] = [...currentLabPanels, ...historicalLabPanels];

/**
 * Group history by date for display
 */
export function getLabHistoryByDate(): LabHistoryEntry[] {
  const dateMap = new Map<string, LabPanel[]>();

  allLabHistory.forEach((panel) => {
    const existing = dateMap.get(panel.date) || [];
    dateMap.set(panel.date, [...existing, panel]);
  });

  return Array.from(dateMap.entries())
    .sort((a, b) => {
      const [ma, da, ya] = a[0].split('/').map(Number);
      const [mb, db, yb] = b[0].split('/').map(Number);
      const dateA = new Date(2000 + ya, ma - 1, da);
      const dateB = new Date(2000 + yb, mb - 1, db);
      return dateB.getTime() - dateA.getTime();
    })
    .map(([date, panels]) => ({
      date,
      label: dateLabels[date] || date,
      panels,
    }));
}
