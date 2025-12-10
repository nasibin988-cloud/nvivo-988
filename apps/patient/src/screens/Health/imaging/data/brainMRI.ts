/**
 * Brain MRI Data
 * Neuroimaging mock data
 */

import type { BrainMRIData, KnowledgeItem } from '../types';

export const brainMRIData: BrainMRIData = {
  scanDate: 'Aug 5, 2024',
  overallStatus: 'No significant abnormalities',
  metrics: [
    { label: 'Total Brain Volume', value: 1245, unit: 'mL', interpretation: 'Within normal range for age', status: 'normal' },
    { label: 'Hippocampal Volume', value: 7.8, unit: 'mL', interpretation: '95th percentile for age', status: 'normal' },
    { label: 'White Matter Hyperintensities', value: 2.1, unit: 'mL', interpretation: 'Minimal, age-appropriate', status: 'normal' },
    { label: 'Cortical Thickness', value: 2.4, unit: 'mm', interpretation: 'Normal for age', status: 'normal' },
    { label: 'Fazekas Score', value: 1, unit: '', interpretation: 'Minimal periventricular changes', status: 'normal' },
    { label: 'Cerebral Blood Flow', value: 52, unit: 'mL/100g/min', interpretation: 'Normal perfusion', status: 'normal' },
  ],
  regions: [
    { name: 'Frontal Lobe', status: 'Normal', notes: 'No atrophy or lesions' },
    { name: 'Temporal Lobe', status: 'Normal', notes: 'Preserved hippocampal volume' },
    { name: 'Parietal Lobe', status: 'Normal', notes: 'No focal abnormalities' },
    { name: 'Occipital Lobe', status: 'Normal', notes: 'Normal appearance' },
    { name: 'Cerebellum', status: 'Normal', notes: 'No atrophy' },
    { name: 'Brainstem', status: 'Normal', notes: 'No signal abnormalities' },
  ],
  findings: [
    'No evidence of acute infarct or hemorrhage',
    'No mass effect or midline shift',
    'Ventricular system normal in size',
    'Age-appropriate brain volume',
    'Minimal white matter changes (Fazekas 1)',
  ],
};

export const brainMRIKnowledge: KnowledgeItem[] = [
  {
    title: 'Hippocampal volume correlates with memory function',
    summary: 'This brain region is critical for forming new memories...',
    detail: 'The hippocampus is essential for memory consolidation, and research has shown that larger hippocampal volumes are associated with better memory performance. Studies indicate that preserved hippocampal volume in older adults correlates with maintained cognitive function and lower dementia risk. Physical exercise and cardiovascular health have been linked to hippocampal preservation.',
  },
  {
    title: 'White matter changes are age-related but modifiable',
    summary: 'Small vessel changes are common with aging but can be influenced...',
    detail: 'White matter hyperintensities (WMH) increase with age, but their progression has been shown to be influenced by cardiovascular risk factors. Research indicates that blood pressure control, diabetes management, and regular physical activity are associated with slower WMH progression. Your Fazekas score of 1 indicates minimal changes.',
  },
  {
    title: 'Brain volume decline can be slowed',
    summary: 'Certain lifestyle factors have been associated with preserved brain volume...',
    detail: 'Longitudinal studies have demonstrated that physical activity, cognitive engagement, social connections, and Mediterranean-style dietary patterns are associated with slower rates of brain volume loss. The FINGER trial showed that multi-domain lifestyle interventions can help maintain cognitive function in at-risk older adults.',
  },
  {
    title: 'Cerebral blood flow reflects brain health',
    summary: 'Adequate blood flow is essential for optimal brain function...',
    detail: 'Research using arterial spin labeling (ASL) MRI has shown that cerebral blood flow is a marker of brain health and function. Reduced perfusion has been observed years before cognitive symptoms in neurodegenerative conditions. Your normal cerebral blood flow of 52 mL/100g/min indicates healthy brain perfusion.',
  },
];
