/**
 * Echo Data
 * Echocardiogram mock data
 */

import type { EchoData, KnowledgeItem } from '../types';

export const echoData: EchoData = {
  scanDate: 'Sep 20, 2024',
  overallStatus: 'Normal',
  metrics: [
    { label: 'Ejection Fraction (EF)', value: 62, unit: '%', range: '55-70%', status: 'normal' },
    { label: 'LV End-Diastolic Diameter', value: 48, unit: 'mm', range: '39-53mm', status: 'normal' },
    { label: 'LV End-Systolic Diameter', value: 32, unit: 'mm', range: '22-40mm', status: 'normal' },
    { label: 'LA Volume Index', value: 28, unit: 'mL/m²', range: '<34 mL/m²', status: 'normal' },
    { label: 'E/e\' Ratio', value: 8, unit: '', range: '<14', status: 'normal' },
    { label: 'TAPSE', value: 22, unit: 'mm', range: '>17mm', status: 'normal' },
  ],
  valves: [
    { name: 'Mitral Valve', status: 'Normal', regurgitation: 'Trace' },
    { name: 'Aortic Valve', status: 'Normal', regurgitation: 'None' },
    { name: 'Tricuspid Valve', status: 'Normal', regurgitation: 'Trace' },
    { name: 'Pulmonic Valve', status: 'Normal', regurgitation: 'None' },
  ],
  findings: [
    'Normal left ventricular systolic function',
    'No regional wall motion abnormalities',
    'Normal diastolic function',
    'Structurally normal valves with trivial regurgitation',
  ],
};

export const echoKnowledge: KnowledgeItem[] = [
  {
    title: 'Ejection fraction is one piece of the puzzle',
    summary: 'Heart function involves more than just how much blood is pumped...',
    detail: 'While ejection fraction (EF) is widely used, research has shown that diastolic function—how well the heart relaxes and fills—is equally important. Studies indicate that "heart failure with preserved EF" (HFpEF) accounts for roughly half of all heart failure cases, highlighting that a normal EF alone does not guarantee optimal heart health.',
  },
  {
    title: 'E/e\' ratio reflects filling pressures',
    summary: 'This measurement correlates with pressures inside the heart...',
    detail: 'The E/e\' ratio has been validated as a non-invasive estimate of left ventricular filling pressure. Values below 8 are generally considered normal, while values above 14 have been associated with elevated filling pressures. Your value falls well within the normal range.',
  },
  {
    title: 'Trace regurgitation is common and benign',
    summary: 'Small amounts of valve leakage are frequently observed in healthy adults...',
    detail: 'Population studies have shown that trace (trivial) regurgitation of the mitral and tricuspid valves is found in up to 70-80% of healthy adults and is considered a normal finding. This minor backflow is not associated with adverse outcomes and requires no treatment.',
  },
  {
    title: 'LA volume reflects long-term filling dynamics',
    summary: 'Left atrial size serves as a "memory" of cardiac filling...',
    detail: 'Research has established that left atrial volume index (LAVI) reflects the cumulative effects of filling pressures over time—sometimes called the "HbA1c of diastolic function." A LAVI below 34 mL/m² has been associated with normal diastolic function and lower cardiovascular risk.',
  },
];
