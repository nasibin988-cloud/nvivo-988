/**
 * Health Imaging Tab
 * Comprehensive view of CCTA, Echo, and Brain MRI with detailed metrics
 */

import { useState } from 'react';
import {
  Heart,
  Activity,
  Brain,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  CheckCircle2,
  Info,
  Sparkles,
  Lightbulb,
} from 'lucide-react';

// Types
type ImagingType = 'ccta' | 'echo' | 'brain-mri';

interface CCTAMetric {
  label: string;
  current: number | string;
  prior: number | string | null;
  unit: string;
  target?: string;
  change?: number;
  status: 'improved' | 'stable' | 'worsened' | 'normal';
}

interface VesselData {
  name: string;
  stenosis: number;
  priorStenosis: number | null;
  plaqueType: 'calcified' | 'mixed' | 'soft' | 'none';
  status: 'normal' | 'mild' | 'moderate' | 'severe';
}

interface EchoMetric {
  label: string;
  value: string | number;
  unit: string;
  range: string;
  status: 'normal' | 'borderline' | 'abnormal';
}

interface BrainMRIMetric {
  label: string;
  value: string | number;
  unit: string;
  interpretation: string;
  status: 'normal' | 'borderline' | 'abnormal';
}

// CCTA Data with comparison
const cctaData = {
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
    { label: 'Total Plaque Volume', current: 142, prior: 168, unit: 'mm³', change: -15.5, status: 'improved' as const },
    { label: 'Calcium Score', current: 85, prior: 92, unit: 'AU', change: -7.6, status: 'improved' as const },
    { label: 'FFR-CT', current: 0.88, prior: 0.82, unit: '', target: '>0.80', change: 7.3, status: 'improved' as const },
    { label: 'PAV', current: 38, prior: 44, unit: '%', target: '<40%', change: -13.6, status: 'improved' as const },
    { label: 'LRNC', current: 8.2, prior: 12.5, unit: 'mm³', change: -34.4, status: 'improved' as const },
    { label: 'Remodeling Index', current: 1.05, prior: 1.12, unit: '', target: '<1.1', change: -6.3, status: 'improved' as const },
  ] as CCTAMetric[],
  vessels: [
    { name: 'LAD (Left Anterior Descending)', stenosis: 35, priorStenosis: 48, plaqueType: 'mixed' as const, status: 'mild' as const },
    { name: 'LCX (Left Circumflex)', stenosis: 20, priorStenosis: 25, plaqueType: 'calcified' as const, status: 'mild' as const },
    { name: 'RCA (Right Coronary Artery)', stenosis: 15, priorStenosis: 18, plaqueType: 'calcified' as const, status: 'normal' as const },
    { name: 'Left Main', stenosis: 0, priorStenosis: 0, plaqueType: 'none' as const, status: 'normal' as const },
  ] as VesselData[],
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

// Echo Data
const echoData = {
  scanDate: 'Sep 20, 2024',
  overallStatus: 'Normal',
  metrics: [
    { label: 'Ejection Fraction (EF)', value: 62, unit: '%', range: '55-70%', status: 'normal' as const },
    { label: 'LV End-Diastolic Diameter', value: 48, unit: 'mm', range: '39-53mm', status: 'normal' as const },
    { label: 'LV End-Systolic Diameter', value: 32, unit: 'mm', range: '22-40mm', status: 'normal' as const },
    { label: 'LA Volume Index', value: 28, unit: 'mL/m²', range: '<34 mL/m²', status: 'normal' as const },
    { label: 'E/e\' Ratio', value: 8, unit: '', range: '<14', status: 'normal' as const },
    { label: 'TAPSE', value: 22, unit: 'mm', range: '>17mm', status: 'normal' as const },
  ] as EchoMetric[],
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

// Brain MRI Data
const brainMRIData = {
  scanDate: 'Aug 5, 2024',
  overallStatus: 'No significant abnormalities',
  metrics: [
    { label: 'Total Brain Volume', value: 1245, unit: 'mL', interpretation: 'Within normal range for age', status: 'normal' as const },
    { label: 'Hippocampal Volume', value: 7.8, unit: 'mL', interpretation: '95th percentile for age', status: 'normal' as const },
    { label: 'White Matter Hyperintensities', value: 2.1, unit: 'mL', interpretation: 'Minimal, age-appropriate', status: 'normal' as const },
    { label: 'Cortical Thickness', value: 2.4, unit: 'mm', interpretation: 'Normal for age', status: 'normal' as const },
    { label: 'Fazekas Score', value: 1, unit: '', interpretation: 'Minimal periventricular changes', status: 'normal' as const },
    { label: 'Cerebral Blood Flow', value: 52, unit: 'mL/100g/min', interpretation: 'Normal perfusion', status: 'normal' as const },
  ] as BrainMRIMetric[],
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

// Helper Components
function ChangeIndicator({ change, inverted = false }: { change: number; inverted?: boolean }) {
  const isPositive = inverted ? change < 0 : change > 0;
  const isImproved = change < 0; // For most metrics, decrease is improvement

  if (Math.abs(change) < 1) {
    return (
      <div className="flex items-center gap-1 text-text-muted">
        <Minus size={12} />
        <span className="text-xs">Stable</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${isImproved ? 'text-emerald-400' : 'text-amber-400'}`}>
      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      <span className="text-xs font-medium">{Math.abs(change).toFixed(1)}%</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    improved: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    stable: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    worsened: { bg: 'bg-rose-500/10', text: 'text-rose-400' },
    normal: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    borderline: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
    abnormal: { bg: 'bg-rose-500/10', text: 'text-rose-400' },
    mild: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
    moderate: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
    severe: { bg: 'bg-rose-500/10', text: 'text-rose-400' },
  };

  const style = config[status] || config.normal;

  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${style.bg} ${style.text} uppercase`}>
      {status}
    </span>
  );
}

// Knowledge Item interface
interface KnowledgeItem {
  title: string;
  summary: string;
  detail: string;
}

// Expandable Knowledge Component
function ExpandableKnowledge({ items, color }: { items: KnowledgeItem[]; color: string }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const colorStyles: Record<string, { bg: string; border: string; text: string; lightBg: string }> = {
    rose: { bg: 'bg-rose-500/5', border: 'border-rose-500/10', text: 'text-rose-400', lightBg: 'bg-rose-500/10' },
    cyan: { bg: 'bg-cyan-500/5', border: 'border-cyan-500/10', text: 'text-cyan-400', lightBg: 'bg-cyan-500/10' },
    violet: { bg: 'bg-violet-500/5', border: 'border-violet-500/10', text: 'text-violet-400', lightBg: 'bg-violet-500/10' },
  };

  const style = colorStyles[color] || colorStyles.rose;

  return (
    <div className={`rounded-xl ${style.bg} ${style.border} border p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg ${style.lightBg}`}>
          <Lightbulb size={14} className={style.text} />
        </div>
        <span className="text-sm font-medium text-text-primary">Did You Know?</span>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => {
          const isExpanded = expandedIndex === i;
          return (
            <button
              key={i}
              onClick={() => setExpandedIndex(isExpanded ? null : i)}
              className="w-full text-left"
            >
              <div className={`rounded-lg p-3 transition-all ${
                isExpanded ? 'bg-white/[0.04] border border-white/[0.06]' : 'hover:bg-white/[0.02]'
              }`}>
                <div className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${style.text.replace('text-', 'bg-')} mt-1.5 shrink-0`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <span className={`text-sm ${isExpanded ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                        {item.title}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={14} className="text-text-muted shrink-0 ml-2" />
                      ) : (
                        <ChevronDown size={14} className="text-text-muted shrink-0 ml-2" />
                      )}
                    </div>
                    {!isExpanded && (
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{item.summary}</p>
                    )}
                    {isExpanded && (
                      <p className="text-xs text-text-secondary mt-2 leading-relaxed">{item.detail}</p>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Knowledge data for CCTA
const cctaKnowledge: KnowledgeItem[] = [
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

// Knowledge data for Echo
const echoKnowledge: KnowledgeItem[] = [
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

// Knowledge data for Brain MRI
const brainMRIKnowledge: KnowledgeItem[] = [
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

// CCTA Detail View
function CCTADetailView({ onClose }: { onClose: () => void }) {
  const [showAllVessels, setShowAllVessels] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-surface w-full max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-white/[0.06] px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Heart size={20} className="text-rose-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">CCTA Report</h2>
                <p className="text-xs text-text-muted">Cardiac CT Angiography</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.06]">
              <X size={20} className="text-text-muted" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4 space-y-5">
          {/* Scan Comparison Header */}
          <div className="bg-gradient-to-r from-rose-500/5 to-transparent rounded-xl p-4 border border-rose-500/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-text-muted">Current Scan</span>
                  <span className="text-sm font-semibold text-text-primary">{cctaData.currentScan.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">Prior Scan</span>
                  <span className="text-sm text-text-secondary">{cctaData.priorScan.date}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-2xl font-bold text-text-primary">CAD-RADS {cctaData.currentScan.cadRads}</span>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <TrendingDown size={14} />
                    <span className="text-xs">from {cctaData.priorScan.cadRads}</span>
                  </div>
                </div>
                <p className="text-xs text-text-muted mt-1 max-w-xs">{cctaData.currentScan.cadRadsDescription}</p>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Activity size={14} className="text-rose-400" />
              Key Metrics Comparison
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {cctaData.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[11px] text-text-muted">{metric.label}</span>
                    {metric.change !== undefined && <ChangeIndicator change={metric.change} />}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-text-primary">{metric.current}</span>
                    <span className="text-xs text-text-muted">{metric.unit}</span>
                  </div>
                  {metric.prior !== null && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-text-muted">Prior: {metric.prior}{metric.unit}</span>
                    </div>
                  )}
                  {metric.target && (
                    <span className="text-[10px] text-text-muted mt-1 block">Target: {metric.target}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Vessel Analysis */}
          <div>
            <button
              onClick={() => setShowAllVessels(!showAllVessels)}
              className="w-full flex items-center justify-between text-sm font-semibold text-text-primary mb-3"
            >
              <span className="flex items-center gap-2">
                <Heart size={14} className="text-rose-400" />
                Per-Vessel Analysis
              </span>
              {showAllVessels ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <div className={`space-y-2 ${showAllVessels ? '' : 'max-h-[200px] overflow-hidden'}`}>
              {cctaData.vessels.map((vessel) => {
                const improvement = vessel.priorStenosis
                  ? ((vessel.priorStenosis - vessel.stenosis) / vessel.priorStenosis * 100)
                  : 0;

                return (
                  <div
                    key={vessel.name}
                    className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-text-primary">{vessel.name}</span>
                          <StatusBadge status={vessel.status} />
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-text-muted">Stenosis:</span>
                            <span className="text-sm font-semibold text-text-primary">{vessel.stenosis}%</span>
                          </div>
                          {vessel.priorStenosis !== null && (
                            <>
                              <span className="text-xs text-text-muted">←</span>
                              <span className="text-xs text-text-muted">{vessel.priorStenosis}%</span>
                              {improvement > 0 && (
                                <span className="text-xs text-emerald-400">↓{improvement.toFixed(0)}%</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          vessel.plaqueType === 'none' ? 'bg-emerald-500/10 text-emerald-400' :
                          vessel.plaqueType === 'calcified' ? 'bg-blue-500/10 text-blue-400' :
                          vessel.plaqueType === 'mixed' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-rose-500/10 text-rose-400'
                        }`}>
                          {vessel.plaqueType === 'none' ? 'No Plaque' : `${vessel.plaqueType.charAt(0).toUpperCase() + vessel.plaqueType.slice(1)} Plaque`}
                        </span>
                      </div>
                    </div>
                    {/* Stenosis bar */}
                    <div className="mt-2 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          vessel.stenosis < 25 ? 'bg-emerald-400' :
                          vessel.stenosis < 50 ? 'bg-amber-400' :
                          vessel.stenosis < 70 ? 'bg-orange-400' :
                          'bg-rose-400'
                        }`}
                        style={{ width: `${vessel.stenosis}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {!showAllVessels && cctaData.vessels.length > 2 && (
              <button
                onClick={() => setShowAllVessels(true)}
                className="w-full mt-2 text-xs text-text-muted hover:text-text-secondary py-2"
              >
                Show all {cctaData.vessels.length} vessels
              </button>
            )}
          </div>

          {/* Findings */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              Key Findings
            </h3>
            <div className="space-y-2">
              {cctaData.findings.map((finding, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span className="text-sm text-text-secondary">{finding}</span>
                </div>
              ))}
            </div>
          </div>

          {/* General Knowledge */}
          <ExpandableKnowledge items={cctaKnowledge} color="rose" />

          {/* Recommendations */}
          <div className="bg-gradient-to-r from-blue-500/5 to-transparent rounded-xl p-4 border border-blue-500/10">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Info size={14} className="text-blue-400" />
              Recommendations
            </h3>
            <div className="space-y-2">
              {cctaData.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs text-blue-400 font-medium">{i + 1}.</span>
                  <span className="text-sm text-text-secondary">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* NVIVO Insight */}
          <div className="bg-gradient-to-br from-surface to-surface/50 rounded-xl border border-rose-500/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10">
                <Sparkles size={14} className="text-rose-400" />
              </div>
              <span className="text-sm font-medium text-text-primary">NVIVO Insight</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Your CCTA shows remarkable improvement over the past year. Total plaque volume decreased by 15.5%,
              and your CAD-RADS score improved from 3 to 2. The plaque regression in your LAD is particularly
              encouraging. This suggests your current treatment plan is working effectively. Continue with your
              statin therapy and lifestyle modifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Echo Detail View
function EchoDetailView({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-surface w-full max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-white/[0.06] px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Activity size={20} className="text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Echocardiogram</h2>
                <p className="text-xs text-text-muted">Heart Ultrasound • {echoData.scanDate}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.06]">
              <X size={20} className="text-text-muted" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4 space-y-5">
          {/* Overall Status */}
          <div className="bg-gradient-to-r from-emerald-500/5 to-transparent rounded-xl p-4 border border-emerald-500/10">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-400" />
              <div>
                <span className="text-sm font-semibold text-text-primary">Overall Assessment</span>
                <p className="text-lg font-bold text-emerald-400">{echoData.overallStatus}</p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Cardiac Measurements</h3>
            <div className="grid grid-cols-2 gap-3">
              {echoData.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[11px] text-text-muted">{metric.label}</span>
                    <StatusBadge status={metric.status} />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-text-primary">{metric.value}</span>
                    <span className="text-xs text-text-muted">{metric.unit}</span>
                  </div>
                  <span className="text-[10px] text-text-muted mt-1 block">Range: {metric.range}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Valve Assessment */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Valve Assessment</h3>
            <div className="grid grid-cols-2 gap-3">
              {echoData.valves.map((valve) => (
                <div
                  key={valve.name}
                  className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]"
                >
                  <span className="text-sm font-medium text-text-primary">{valve.name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-emerald-400">{valve.status}</span>
                    <span className="text-xs text-text-muted">•</span>
                    <span className="text-xs text-text-muted">{valve.regurgitation} regurgitation</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Findings */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              Findings
            </h3>
            <div className="space-y-2">
              {echoData.findings.map((finding, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span className="text-sm text-text-secondary">{finding}</span>
                </div>
              ))}
            </div>
          </div>

          {/* General Knowledge */}
          <ExpandableKnowledge items={echoKnowledge} color="cyan" />

          {/* NVIVO Insight */}
          <div className="bg-gradient-to-br from-surface to-surface/50 rounded-xl border border-cyan-500/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10">
                <Sparkles size={14} className="text-cyan-400" />
              </div>
              <span className="text-sm font-medium text-text-primary">NVIVO Insight</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Your echocardiogram shows excellent heart function with an ejection fraction of 62%, well within
              the normal range. All four heart valves are functioning normally with no significant regurgitation.
              Your heart chambers are normal in size, and there's no evidence of diastolic dysfunction.
              This is an excellent baseline for monitoring your cardiac health.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Brain MRI Detail View
function BrainMRIDetailView({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-surface w-full max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-white/[0.06] px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <Brain size={20} className="text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Brain MRI</h2>
                <p className="text-xs text-text-muted">Neuroimaging Report • {brainMRIData.scanDate}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.06]">
              <X size={20} className="text-text-muted" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4 space-y-5">
          {/* Overall Status */}
          <div className="bg-gradient-to-r from-emerald-500/5 to-transparent rounded-xl p-4 border border-emerald-500/10">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-400" />
              <div>
                <span className="text-sm font-semibold text-text-primary">Overall Assessment</span>
                <p className="text-lg font-bold text-emerald-400">{brainMRIData.overallStatus}</p>
              </div>
            </div>
          </div>

          {/* Volumetric Analysis */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Volumetric Analysis</h3>
            <div className="grid grid-cols-2 gap-3">
              {brainMRIData.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[11px] text-text-muted">{metric.label}</span>
                    <StatusBadge status={metric.status} />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-text-primary">{metric.value}</span>
                    {metric.unit && <span className="text-xs text-text-muted">{metric.unit}</span>}
                  </div>
                  <span className="text-[10px] text-text-muted mt-1 block">{metric.interpretation}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Assessment */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Regional Assessment</h3>
            <div className="grid grid-cols-2 gap-3">
              {brainMRIData.regions.map((region) => (
                <div
                  key={region.name}
                  className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-primary">{region.name}</span>
                    <span className="text-xs text-emerald-400">{region.status}</span>
                  </div>
                  <span className="text-xs text-text-muted">{region.notes}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Findings */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              Imaging Findings
            </h3>
            <div className="space-y-2">
              {brainMRIData.findings.map((finding, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span className="text-sm text-text-secondary">{finding}</span>
                </div>
              ))}
            </div>
          </div>

          {/* General Knowledge */}
          <ExpandableKnowledge items={brainMRIKnowledge} color="violet" />

          {/* NVIVO Insight */}
          <div className="bg-gradient-to-br from-surface to-surface/50 rounded-xl border border-violet-500/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-violet-500/10">
                <Sparkles size={14} className="text-violet-400" />
              </div>
              <span className="text-sm font-medium text-text-primary">NVIVO Insight</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Your brain MRI shows excellent structural health with no significant abnormalities. Your hippocampal
              volume is in the 95th percentile for your age, which is associated with good memory function.
              The minimal white matter changes (Fazekas score 1) are age-appropriate and not clinically significant.
              Your brain volume and cortical thickness are well-preserved, suggesting healthy brain aging.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Imaging Card Component
function ImagingCard({
  type,
  title,
  subtitle,
  icon: Icon,
  color,
  date,
  status,
  highlight,
  onClick,
}: {
  type: ImagingType;
  title: string;
  subtitle: string;
  icon: typeof Heart;
  color: string;
  date: string;
  status: string;
  highlight?: string;
  onClick: () => void;
}) {
  const colorStyles: Record<string, { bg: string; border: string; text: string }> = {
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400' },
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400' },
  };

  const style = colorStyles[color] || colorStyles.rose;

  return (
    <button
      onClick={onClick}
      className="w-full bg-surface rounded-2xl border border-border p-4 text-left group hover:border-white/[0.08] transition-all"
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${style.bg} ${style.border} border`}>
          <Icon size={24} className={style.text} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
              <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
            </div>
            <ChevronRight size={18} className="text-text-muted group-hover:text-text-secondary transition-colors shrink-0" />
          </div>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Calendar size={12} />
              {date}
            </div>
            <span className="text-xs font-medium text-emerald-400">{status}</span>
          </div>

          {highlight && (
            <div className="mt-3 p-2 bg-white/[0.02] rounded-lg border border-white/[0.04]">
              <p className="text-xs text-text-secondary">{highlight}</p>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// Main Component
export default function ImagingTab() {
  const [selectedImaging, setSelectedImaging] = useState<ImagingType | null>(null);

  return (
    <div className="space-y-4">
      {/* CCTA Card - Featured with comparison */}
      <ImagingCard
        type="ccta"
        title="CCTA Report"
        subtitle="Cardiac CT Angiography"
        icon={Heart}
        color="rose"
        date={cctaData.currentScan.date}
        status="Plaque regression"
        highlight={`CAD-RADS improved from ${cctaData.priorScan.cadRads} → ${cctaData.currentScan.cadRads} • Total plaque volume ↓15.5% vs prior scan`}
        onClick={() => setSelectedImaging('ccta')}
      />

      {/* Echo Card */}
      <ImagingCard
        type="echo"
        title="Echocardiogram"
        subtitle="Heart Ultrasound"
        icon={Activity}
        color="cyan"
        date={echoData.scanDate}
        status="Normal function"
        highlight={`EF: ${echoData.metrics[0].value}% • All valves normal`}
        onClick={() => setSelectedImaging('echo')}
      />

      {/* Brain MRI Card */}
      <ImagingCard
        type="brain-mri"
        title="Brain MRI"
        subtitle="Neuroimaging Report"
        icon={Brain}
        color="violet"
        date={brainMRIData.scanDate}
        status="No abnormalities"
        highlight={`Hippocampal volume 95th percentile • Fazekas score: 1`}
        onClick={() => setSelectedImaging('brain-mri')}
      />

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-surface to-surface/50 rounded-xl border border-white/[0.06] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-indigo-400" />
          <span className="text-sm font-medium text-text-primary">Imaging Summary</span>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          Your imaging studies show positive trends across all areas. The CCTA demonstrates
          significant plaque regression with improved coronary flow. Cardiac function remains
          excellent on echocardiogram, and brain MRI shows age-appropriate healthy structure
          with preserved hippocampal volume.
        </p>
      </div>

      {/* Detail Modals */}
      {selectedImaging === 'ccta' && (
        <CCTADetailView onClose={() => setSelectedImaging(null)} />
      )}
      {selectedImaging === 'echo' && (
        <EchoDetailView onClose={() => setSelectedImaging(null)} />
      )}
      {selectedImaging === 'brain-mri' && (
        <BrainMRIDetailView onClose={() => setSelectedImaging(null)} />
      )}
    </div>
  );
}
