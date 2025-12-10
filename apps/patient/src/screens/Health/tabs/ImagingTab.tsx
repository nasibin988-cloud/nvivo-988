/**
 * Health Imaging Tab
 * Comprehensive view of CCTA, Echo, and Brain MRI with detailed metrics
 */

import { useState } from 'react';
import { Heart, Activity, Brain, Sparkles } from 'lucide-react';
import {
  type ImagingType,
  cctaData,
  echoData,
  brainMRIData,
  ImagingCard,
  CCTADetailView,
  EchoDetailView,
  BrainMRIDetailView,
} from '../imaging';

export default function ImagingTab(): React.ReactElement {
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
