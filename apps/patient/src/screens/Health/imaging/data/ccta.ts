/**
 * CCTA Data
 * Cardiac CT Angiography mock data
 */

import type { CCTAData, KnowledgeItem } from '../types';

export const cctaData: CCTAData = {
  currentScan: {
    date: 'Oct 15, 2024',
    cadRads: '2',
    cadRadsDescription: 'Mild stenosis (25-49%). Non-obstructive CAD present. Continue current medical therapy.',
  },
  priorScan: {
    date: 'Oct 20, 2023',
    cadRads: '3',
    cadRadsDescription: 'Moderate stenosis (50-69%). Non-obstructive CAD.',
  },
  metrics: [
    { label: 'Total Plaque Volume', current: 142, prior: 168, unit: 'mm³', change: -15.5, status: 'improved' },
    { label: 'Calcium Score', current: 85, prior: 92, unit: 'AU', change: -7.6, status: 'improved' },
    { label: 'FFR-CT', current: 0.88, prior: 0.82, unit: '', target: '>0.80', change: 7.3, status: 'improved' },
    { label: 'PAV', current: 38, prior: 44, unit: '%', target: '<40%', change: -13.6, status: 'improved' },
    { label: 'LRNC', current: 8.2, prior: 12.5, unit: 'mm³', change: -34.4, status: 'improved' },
    { label: 'Remodeling Index', current: 1.05, prior: 1.12, unit: '', target: '<1.1', change: -6.3, status: 'improved' },
  ],
  vessels: [
    { name: 'LAD (Left Anterior Descending)', stenosis: 35, priorStenosis: 48, plaqueType: 'mixed', status: 'mild' },
    { name: 'LCX (Left Circumflex)', stenosis: 20, priorStenosis: 25, plaqueType: 'calcified', status: 'mild' },
    { name: 'RCA (Right Coronary Artery)', stenosis: 15, priorStenosis: 18, plaqueType: 'calcified', status: 'normal' },
    { name: 'Left Main', stenosis: 0, priorStenosis: 0, plaqueType: 'none', status: 'normal' },
  ],
  findings: [
    'Significant plaque regression noted in LAD territory',
    'No new high-risk plaque features identified',
    'Improved FFR-CT suggesting better coronary flow',
    'Continued mild non-obstructive CAD in proximal LAD',
  ],
  recommendations: [
    'Continue current statin therapy (Rosuvastatin 20mg)',
    'Maintain lifestyle modifications',
    'Follow-up CCTA in 12-18 months',
    'Annual lipid panel monitoring',
  ],
};

export const cctaKnowledge: KnowledgeItem[] = [
  {
    title: 'Plaque composition matters more than volume alone',
    summary: 'Soft and mixed plaques carry different risk profiles than calcified plaques...',
    detail: 'Research has shown that soft and mixed (non-calcified) plaques are more prone to rupture and acute events than calcified plaques. Calcification is often considered a sign of plaque stability. Your transition from mixed to more calcified plaque patterns has been associated with reduced cardiovascular events in long-term studies.',
  },
  {
    title: 'FFR-CT correlates with invasive measurements',
    summary: 'Studies demonstrate strong agreement between CT-derived and catheter-based FFR...',
    detail: 'The PLATFORM and NXT trials demonstrated that FFR-CT has approximately 86% accuracy compared to invasive FFR measurements. An FFR-CT value above 0.80 has been associated with an excellent prognosis and typically indicates that any stenosis present is not causing significant flow limitation.',
  },
  {
    title: 'Plaque regression is achievable with therapy',
    summary: 'Clinical trials have demonstrated atherosclerotic plaque can regress...',
    detail: 'The GLAGOV and ASTEROID trials showed that intensive lipid-lowering therapy can lead to measurable plaque regression. Studies indicate that achieving LDL cholesterol levels below 70 mg/dL has been associated with plaque stabilization and regression, particularly in patients with established coronary artery disease.',
  },
  {
    title: 'Serial imaging tracks disease progression',
    summary: 'Regular CCTA monitoring provides valuable trend data over time...',
    detail: 'Serial CCTA imaging at 12-24 month intervals has been shown to be valuable for tracking disease progression or regression. Changes in total plaque volume of greater than 10% are generally considered clinically meaningful and beyond measurement variability.',
  },
];
