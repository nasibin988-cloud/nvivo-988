/**
 * CCTADetailView Component
 * Detailed view for CCTA (Cardiac CT Angiography) report
 */

import { useState } from 'react';
import {
  Heart,
  Activity,
  ChevronUp,
  ChevronDown,
  X,
  CheckCircle2,
  Info,
  Sparkles,
  TrendingDown,
} from 'lucide-react';
import { cctaData, cctaKnowledge } from '../data';
import { ChangeIndicator, StatusBadge, ExpandableKnowledge } from '../components';

interface CCTADetailViewProps {
  onClose: () => void;
}

export default function CCTADetailView({ onClose }: CCTADetailViewProps): React.ReactElement {
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
