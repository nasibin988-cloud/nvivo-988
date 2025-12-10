/**
 * EchoDetailView Component
 * Detailed view for Echocardiogram report
 */

import { Activity, X, CheckCircle2, Sparkles } from 'lucide-react';
import { echoData, echoKnowledge } from '../data';
import { StatusBadge, ExpandableKnowledge } from '../components';

interface EchoDetailViewProps {
  onClose: () => void;
}

export default function EchoDetailView({ onClose }: EchoDetailViewProps): React.ReactElement {
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
