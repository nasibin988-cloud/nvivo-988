/**
 * Cognitive Health Panel
 * Dashboard panel showing cognitive health and mental wellbeing metrics
 */

import { useMemo } from 'react';
import {
  Brain,
  Heart,
  Activity,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
} from 'lucide-react';
import type { CognitiveHealth, RiskStatus } from '../../hooks/dashboard';

// ============================================================================
// Types
// ============================================================================

type TrendDirection = 'increasing' | 'decreasing' | 'stable';

interface CognitiveHealthPanelProps {
  data: CognitiveHealth | null | undefined;
  onViewMore?: () => void;
}

interface DassThresholds {
  normal: number;
  mild: number;
  moderate: number;
}

// ============================================================================
// Utilities
// ============================================================================

function calculateTrendDirection(data: number[], threshold: number = 0.3): TrendDirection {
  if (data.length < 14) return 'stable';
  const first7Avg = data.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
  const last7Avg = data.slice(-7).reduce((a, b) => a + b, 0) / 7;
  const diff = last7Avg - first7Avg;
  if (diff > threshold) return 'increasing';
  if (diff < -threshold) return 'decreasing';
  return 'stable';
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
}

function getStatusLabel(status: RiskStatus): { label: string; color: string } {
  if (status === 'on-target') return { label: 'On Target', color: '#10B981' };
  if (status === 'attention') return { label: 'Attention', color: '#F59E0B' };
  return { label: 'High Risk', color: '#EF4444' };
}

function getStatusBg(status: RiskStatus): string {
  if (status === 'on-target') return 'bg-success-muted border-success/20';
  if (status === 'attention') return 'bg-warning-muted border-warning/20';
  return 'bg-error-muted border-error/20';
}

function getDassLabel(score: number, thresholds: DassThresholds): string {
  if (score <= thresholds.normal) return 'Normal';
  if (score <= thresholds.mild) return 'Mild';
  if (score <= thresholds.moderate) return 'Moderate';
  return 'Severe';
}

function getDassColor(score: number, thresholds: DassThresholds): string {
  if (score <= thresholds.normal) return '#10B981';
  if (score <= thresholds.mild) return '#06B6D4';
  if (score <= thresholds.moderate) return '#F59E0B';
  return '#EF4444';
}

// ============================================================================
// Sub-Components (inline, single-use)
// ============================================================================

function TrendLabel({ direction, color = 'text-text-secondary' }: { direction?: TrendDirection; color?: string }) {
  if (!direction) return null;
  const config: Record<TrendDirection, { icon: typeof TrendingUp; label: string; colorClass: string }> = {
    increasing: { icon: TrendingUp, label: 'Increasing', colorClass: 'text-success' },
    decreasing: { icon: TrendingDown, label: 'Decreasing', colorClass: 'text-warning' },
    stable: { icon: Minus, label: 'Stable', colorClass: 'text-text-secondary' },
  };
  const { icon: Icon, label, colorClass } = config[direction];
  return (
    <div className={`flex items-center gap-1 ${color === 'auto' ? colorClass : color}`}>
      <Icon size={12} />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

function DualTrendLineGraph({
  data1, data2, color1, color2, label1, label2, height = 80, showArea = true, minLabel = '0', maxLabel = '10', uniqueId,
}: {
  data1: number[]; data2: number[]; color1: string; color2: string;
  label1: string; label2: string; height?: number; showArea?: boolean;
  minLabel?: string; maxLabel?: string; uniqueId: string;
}) {
  if (data1.length === 0 && data2.length === 0) {
    return <div className="h-20 flex items-center justify-center text-text-muted text-sm">No trend data available</div>;
  }

  const allData = [...data1, ...data2];
  const minVal = Math.min(...allData) * 0.9;
  const maxVal = Math.max(...allData) * 1.1;
  const width = 300;

  const getPath = (data: number[]) => {
    if (data.length === 0) return '';
    const range = maxVal - minVal || 1;
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - minVal) / range) * height;
      return [x, y];
    });
    return points.reduce((acc, [x, y], i, arr) => {
      if (i === 0) return `M ${x},${y}`;
      const [px, py] = arr[i - 1];
      const cp1x = px + (x - px) * 0.25;
      const cp2x = x - (x - px) * 0.25;
      return `${acc} C ${cp1x},${py} ${cp2x},${y} ${x},${y}`;
    }, '');
  };

  const path1 = getPath(data1);
  const path2 = getPath(data2);
  const areaPath = data1.length > 0 ? `${path1} L ${width},${height} L 0,${height} Z` : '';

  return (
    <div>
      <div className="relative" style={{ height }}>
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none z-10 py-0.5">
          <span className="text-[9px] text-text-muted/60 leading-none">{maxLabel}</span>
          <span className="text-[9px] text-text-muted/60 leading-none">{minLabel}</span>
        </div>
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`fill-cog-${uniqueId}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color1} stopOpacity="0.15" />
              <stop offset="100%" stopColor={color1} stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="0" x2={width} y2="0" stroke="var(--color-border)" strokeWidth="0.5" />
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="var(--color-border)" strokeWidth="0.5" />
          <line x1="0" y1={height} x2={width} y2={height} stroke="var(--color-border)" strokeWidth="0.5" />
          {showArea && areaPath && <path d={areaPath} fill={`url(#fill-cog-${uniqueId})`} stroke="none" />}
          {path1 && <path d={path1} fill="none" stroke={color1} strokeWidth="1.5" strokeLinecap="round" />}
          {path2 && <path d={path2} fill="none" stroke={color2} strokeWidth="1.5" strokeLinecap="round" />}
        </svg>
      </div>
      <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: color1 }} />
          <span>{label1}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: color2 }} />
          <span>{label2}</span>
        </div>
      </div>
    </div>
  );
}

function DassBar({ label, score, thresholds, maxScore }: { label: string; score: number | undefined; thresholds: DassThresholds; maxScore: number }) {
  const normalizedScore = score ?? 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-text-secondary">{label}</p>
        <span className="text-xs font-bold text-text-primary">{getDassLabel(normalizedScore, thresholds)}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min((normalizedScore / maxScore) * 100, 100)}%`, backgroundColor: getDassColor(normalizedScore, thresholds) }}
          />
        </div>
        <span className="text-sm font-bold text-text-primary">{score ?? '—'}<span className="text-text-muted font-normal">/{maxScore}</span></span>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function CognitiveHealthPanel({ data, onViewMore }: CognitiveHealthPanelProps) {
  if (!data) return <CognitiveHealthPanelSkeleton />;

  const { brainMRI, cognitiveAssessment, strokeRisk, mentalHealth } = data;
  const moodTrend = mentalHealth?.moodTrend || [];
  const sleepQuality = mentalHealth?.sleepQuality || [];

  const sleepHours = useMemo(() => {
    if (mentalHealth?.sleepHours && mentalHealth.sleepHours.length > 0) return mentalHealth.sleepHours;
    return sleepQuality.map((quality, i) => {
      const seed = Math.sin(i * 12.9898) * 43758.5453;
      const variation = (seed - Math.floor(seed) - 0.5) * 0.8;
      return 5 + (quality / 10) * 4 + variation;
    });
  }, [mentalHealth?.sleepHours, sleepQuality]);

  const vitalityTrend = useMemo(() => {
    return moodTrend.map((mood, i) => {
      const seed = Math.sin((i + 100) * 12.9898) * 43758.5453;
      const variation = (seed - Math.floor(seed) - 0.5) * 1.5;
      const base = mood * 0.85 + (sleepQuality[i] || 5) * 0.15;
      return Math.max(1, Math.min(10, base + variation));
    });
  }, [moodTrend, sleepQuality]);

  const moodTrendDirection = calculateTrendDirection(moodTrend);
  const sleepTrendDirection = calculateTrendDirection(sleepQuality);

  return (
    <div className="relative group">
      <div className="absolute -inset-2 bg-gradient-to-br from-sleep/5 via-transparent to-accent/5 rounded-[32px] opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700" />
      <div className="relative overflow-hidden bg-gradient-to-br from-surface via-surface to-surface-2 backdrop-blur-2xl rounded-theme-xl border border-border p-5 shadow-card">
        <div className="absolute inset-0 bg-gradient-to-br from-sleep/[0.02] via-transparent to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="relative z-10 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-theme-md bg-gradient-to-br from-sleep/15 to-sleep/5 border border-sleep/20 shadow-sm">
                <Brain size={24} className="text-sleep" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-text-primary">Cognitive Health & Mental Wellbeing</h3>
            </div>
            {onViewMore && (
              <button onClick={onViewMore} className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent transition-base">
                View more <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Brain Health & Cognition */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-sleep" strokeWidth={2.5} />
              <h4 className="text-xs font-bold text-sleep uppercase tracking-wider">Brain Health & Cognition</h4>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Brain MRI */}
              <div className="bg-surface-2/50 backdrop-blur-sm rounded-theme-lg border border-white/10 p-4 hover:bg-surface-2 transition-all duration-300">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-theme-sm bg-gradient-to-br from-info/10 to-info/5 border border-info/20">
                      <FileText size={14} className="text-info" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-text-primary">Brain MRI</h5>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Calendar size={10} className="text-text-muted" />
                        <span className="text-xs text-text-muted">{formatDate(brainMRI?.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 ${getStatusBg('on-target')} border rounded-theme-sm flex items-center justify-center`}>
                    <span className="text-xs font-bold text-success leading-none">{brainMRI?.status ?? '—'}</span>
                  </div>
                </div>
                <p className="text-xs text-text-tertiary leading-relaxed">{brainMRI?.findings ?? '—'}</p>
              </div>
              {/* MoCA */}
              <div className="bg-surface-2/50 backdrop-blur-sm rounded-theme-lg border border-white/10 p-4 hover:bg-surface-2 transition-all duration-300">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-text-tertiary mb-1">Cognitive Function (MoCA)</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-text-primary">{cognitiveAssessment?.moca ?? '—'}</span>
                      <span className="text-sm text-text-muted">/ 30</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar size={10} className="text-text-muted" />
                      <span className="text-xs text-text-muted">{formatDate(cognitiveAssessment?.date)}</span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 ${getStatusBg('on-target')} border rounded-theme-sm flex items-center justify-center`}>
                    <span className="text-xs font-bold text-success leading-none">
                      {cognitiveAssessment?.moca !== undefined && cognitiveAssessment.moca >= 26 ? 'Normal' : 'Review'}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-surface-3 rounded-full overflow-hidden border border-white/10">
                  <div className="h-full bg-gradient-to-r from-sleep to-accent rounded-full transition-all duration-700" style={{ width: `${((cognitiveAssessment?.moca ?? 0) / 30) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Stroke Prevention */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-text-primary" strokeWidth={2.5} />
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Stroke Prevention</h4>
            </div>
            <div className="bg-surface-2/50 backdrop-blur-sm rounded-theme-lg border border-white/10 p-4 hover:bg-surface-2 transition-all duration-300">
              <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/50">
                <div className="pb-3 md:pb-0 md:pr-6 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-text-tertiary">Blood Pressure</p>
                    <span className="text-xs font-semibold" style={{ color: getStatusLabel(strokeRisk?.bloodPressure?.status ?? 'on-target').color }}>
                      {getStatusLabel(strokeRisk?.bloodPressure?.status ?? 'on-target').label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-xl font-bold text-text-primary">{strokeRisk?.bloodPressure?.value ?? '—'}</span>
                    <span className="text-xs text-text-muted">mmHg</span>
                  </div>
                  <span className="text-xs text-text-muted">Target: &lt; 120/80</span>
                </div>
                <div className="py-3 md:py-0 md:px-6 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-text-tertiary">HbA1c</p>
                    <span className="text-xs font-semibold" style={{ color: getStatusLabel(strokeRisk?.hba1c?.status ?? 'on-target').color }}>
                      {getStatusLabel(strokeRisk?.hba1c?.status ?? 'on-target').label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-xl font-bold text-text-primary">{strokeRisk?.hba1c?.value ?? '—'}</span>
                    <span className="text-xs text-text-muted">%</span>
                  </div>
                  <span className="text-xs text-text-muted">Target: &lt; 5.7%</span>
                </div>
                <div className="pt-3 md:pt-0 md:pl-6 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-text-tertiary">Carotid Ultrasound</p>
                    <span className="text-xs font-semibold" style={{ color: getStatusLabel(strokeRisk?.carotidPlaque?.status ?? 'on-target').color }}>
                      {getStatusLabel(strokeRisk?.carotidPlaque?.status ?? 'on-target').label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-xl font-bold text-text-primary">
                      {strokeRisk?.carotidPlaque?.value === 'None' ? 'No Plaque' : strokeRisk?.carotidPlaque?.value ?? '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mental Wellbeing */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-text-primary" strokeWidth={2.5} />
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Mental Wellbeing</h4>
            </div>
            {/* DASS-21 */}
            <div className="bg-surface-2/50 backdrop-blur-sm rounded-theme-lg border border-white/10 p-4 hover:bg-surface-2 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h5 className="text-sm font-bold text-text-primary">Mental Health Assessment (DASS-21)</h5>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Calendar size={10} className="text-text-muted" />
                    <span className="text-xs text-text-muted">{formatDate(mentalHealth?.dass21?.date)}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <DassBar label="Depression" score={mentalHealth?.dass21?.depression} thresholds={{ normal: 9, mild: 13, moderate: 20 }} maxScore={42} />
                <DassBar label="Anxiety" score={mentalHealth?.dass21?.anxiety} thresholds={{ normal: 7, mild: 9, moderate: 14 }} maxScore={42} />
                <DassBar label="Stress" score={mentalHealth?.dass21?.stress} thresholds={{ normal: 14, mild: 18, moderate: 25 }} maxScore={42} />
              </div>
            </div>
            {/* Trend Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="bg-surface-2/50 backdrop-blur-sm rounded-theme-lg border border-white/10 p-4 hover:bg-surface-2 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="text-sm font-bold text-text-primary">Sleep</h5>
                    <p className="text-xs text-text-muted mt-0.5">Last month</p>
                  </div>
                  <TrendLabel direction={sleepTrendDirection} color="auto" />
                </div>
                <DualTrendLineGraph data1={sleepQuality} data2={sleepHours} color1="#6366F1" color2="#8B5CF6" label1="Quality" label2="Hours" height={80} uniqueId="sleep" />
              </div>
              <div className="bg-surface-2/50 backdrop-blur-sm rounded-theme-lg border border-white/10 p-4 hover:bg-surface-2 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="text-sm font-bold text-text-primary">Mood & Vitality</h5>
                    <p className="text-xs text-text-muted mt-0.5">Last month</p>
                  </div>
                  <TrendLabel direction={moodTrendDirection} color="auto" />
                </div>
                <DualTrendLineGraph data1={moodTrend} data2={vitalityTrend} color1="#06B6D4" color2="#10B981" label1="Mood" label2="Vitality" height={80} uniqueId="mood" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Skeleton
// ============================================================================

export function CognitiveHealthPanelSkeleton() {
  return (
    <div className="relative">
      <div className="overflow-hidden bg-gradient-to-br from-surface via-surface to-surface-2 rounded-theme-xl border border-border p-5">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 skeleton rounded-theme-md" />
            <div className="w-64 h-6 skeleton rounded" />
          </div>
          <div className="space-y-3">
            <div className="w-40 h-4 skeleton rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-surface-2/50 rounded-theme-lg border border-white/10 p-4">
                  <div className="w-24 h-4 skeleton rounded mb-2" />
                  <div className="w-16 h-8 skeleton rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 skeleton rounded-theme-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
