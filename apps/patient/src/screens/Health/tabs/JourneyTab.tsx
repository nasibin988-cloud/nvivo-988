/**
 * Health Journey Tab
 * Visual infographic of the patient's health transformation over the past year
 */

import { useState } from 'react';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Heart,
  Activity,
  Award,
  Calendar,
  Target,
  CheckCircle2,
  ChevronRight,
  Star,
  Sparkles,
  Flame,
  Zap,
  Shield,
  Flag,
  ArrowRight,
} from 'lucide-react';

// Journey phases/chapters
const journeyPhases = [
  {
    id: 'discovery',
    name: 'Discovery',
    period: 'May - Jun 2024',
    description: 'Understanding your health baseline',
    color: 'slate',
    completed: true,
    highlights: [
      { label: 'Initial CCTA', detail: 'CAD-RADS 3 (moderate stenosis)' },
      { label: 'First labs', detail: 'LDL: 132 mg/dL' },
      { label: 'Care plan created', detail: 'Personalized approach' },
    ],
  },
  {
    id: 'foundation',
    name: 'Building Foundation',
    period: 'Jul - Sep 2024',
    description: 'Establishing habits that stick',
    color: 'cyan',
    completed: true,
    highlights: [
      { label: 'Medication optimized', detail: 'Rosuvastatin + Ezetimibe' },
      { label: '90-day streak', detail: 'Perfect adherence' },
      { label: 'Activity goals', detail: 'Averaging 8,000 steps/day' },
    ],
  },
  {
    id: 'momentum',
    name: 'Gaining Momentum',
    period: 'Oct - Nov 2024',
    description: 'Seeing real results',
    color: 'emerald',
    completed: true,
    highlights: [
      { label: 'LDL target hit', detail: 'Down to 65 mg/dL' },
      { label: 'Plaque regression', detail: '-15% total volume' },
      { label: 'CAD-RADS improved', detail: 'Now CAD-RADS 2' },
    ],
  },
  {
    id: 'optimization',
    name: 'Optimization',
    period: 'Dec 2024 - Present',
    description: 'Fine-tuning for long-term success',
    color: 'violet',
    completed: false,
    current: true,
    highlights: [
      { label: 'Maintaining gains', detail: 'Stable metrics' },
      { label: 'VO2 max focus', detail: 'Cardio optimization' },
      { label: 'Quality of life', detail: '+16 points on SF-36' },
    ],
  },
];

// Key transformation metrics
const transformations = [
  {
    id: 'ldl',
    label: 'LDL Cholesterol',
    before: 132,
    after: 65,
    unit: 'mg/dL',
    target: 70,
    icon: Heart,
    color: 'rose',
    improvement: true,
  },
  {
    id: 'plaque',
    label: 'Total Plaque Volume',
    before: 168,
    after: 142,
    unit: 'mm³',
    icon: Activity,
    color: 'cyan',
    improvement: true,
  },
  {
    id: 'cadRads',
    label: 'CAD-RADS Score',
    before: 3,
    after: 2,
    unit: '',
    icon: Shield,
    color: 'emerald',
    improvement: true,
  },
  {
    id: 'ffr',
    label: 'FFR-CT',
    before: 0.82,
    after: 0.88,
    unit: '',
    icon: Zap,
    color: 'violet',
    improvement: true,
  },
];

// Future milestones
const upcomingGoals = [
  {
    id: 'vo2',
    title: 'VO2 Max Target',
    description: 'Reach 45 mL/kg/min',
    target: 'Feb 2025',
    progress: 78,
    icon: Flame,
  },
  {
    id: 'plaque2',
    title: 'Continued Regression',
    description: 'Further 10% plaque reduction',
    target: 'May 2025',
    progress: 45,
    icon: TrendingDown,
  },
  {
    id: 'year',
    title: '1-Year Anniversary',
    description: 'Complete first year of transformation',
    target: 'May 2025',
    progress: 82,
    icon: Trophy,
  },
];

// Helper components
function TransformationCard({ data }: { data: typeof transformations[0] }) {
  const Icon = data.icon;
  const change = data.before - data.after;
  const percentChange = Math.abs((change / data.before) * 100).toFixed(0);
  // Round to avoid floating point precision errors (e.g., 0.06000000000000005)
  const displayChange = Number(Math.abs(change).toFixed(2));

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  };

  const colors = colorClasses[data.color] || colorClasses.cyan;

  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.border} border`}>
          <Icon size={14} className={colors.text} />
        </div>
        <span className="text-xs text-text-secondary font-medium">{data.label}</span>
      </div>

      {/* Before/After comparison */}
      <div className="flex items-center justify-between">
        <div className="text-center">
          <p className="text-[10px] text-text-muted mb-0.5">Before</p>
          <p className="text-lg font-bold text-text-muted line-through decoration-text-muted/30">
            {data.before}{data.unit && <span className="text-xs">{data.unit}</span>}
          </p>
        </div>

        <ArrowRight size={16} className={colors.text} />

        <div className="text-center">
          <p className="text-[10px] text-text-muted mb-0.5">Now</p>
          <p className={`text-lg font-bold ${colors.text}`}>
            {data.after}{data.unit && <span className="text-xs">{data.unit}</span>}
          </p>
        </div>
      </div>

      {/* Change indicator */}
      <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-center gap-1">
        {data.improvement ? (
          <TrendingDown size={12} className="text-emerald-400" />
        ) : (
          <TrendingUp size={12} className="text-emerald-400" />
        )}
        <span className="text-xs font-semibold text-emerald-400">
          {change > 0 ? '-' : '+'}{displayChange}{data.unit} ({percentChange}%)
        </span>
      </div>
    </div>
  );
}

function ProgressRing({ progress, size = 48, strokeWidth = 4, color = 'cyan' }: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const colorMap: Record<string, string> = {
    cyan: '#06b6d4',
    emerald: '#10b981',
    violet: '#8b5cf6',
    amber: '#f59e0b',
  };

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        className="text-white/[0.06]"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={colorMap[color] || colorMap.cyan}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-700"
      />
    </svg>
  );
}

function PhaseCard({ phase, index, total }: {
  phase: typeof journeyPhases[0];
  index: number;
  total: number;
}) {
  const [expanded, setExpanded] = useState(phase.current || false);

  const colorClasses: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    slate: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', dot: 'bg-slate-400' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', dot: 'bg-cyan-400' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', dot: 'bg-violet-400' },
  };

  const colors = colorClasses[phase.color] || colorClasses.slate;

  return (
    <div className="relative">
      {/* Connector line */}
      {index < total - 1 && (
        <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gradient-to-b from-border to-transparent" />
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full text-left rounded-xl border p-4 transition-all ${
          phase.current
            ? `${colors.bg} ${colors.border}`
            : 'bg-surface border-border hover:border-white/[0.1]'
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Phase number/status */}
          <div className={`relative w-12 h-12 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center shrink-0`}>
            {phase.completed ? (
              <CheckCircle2 size={20} className={colors.text} />
            ) : phase.current ? (
              <div className="relative">
                <span className={`text-lg font-bold ${colors.text}`}>{index + 1}</span>
                <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${colors.dot} animate-pulse`} />
              </div>
            ) : (
              <span className="text-lg font-bold text-text-muted">{index + 1}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-text-primary">{phase.name}</h4>
                  {phase.current && (
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded ${colors.bg} ${colors.text}`}>
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5">{phase.period}</p>
              </div>
              <ChevronRight
                size={16}
                className={`text-text-muted transition-transform ${expanded ? 'rotate-90' : ''}`}
              />
            </div>
            <p className="text-xs text-text-secondary mt-1">{phase.description}</p>
          </div>
        </div>

        {/* Expanded highlights */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-2 ml-15">
            {phase.highlights.map((highlight, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${colors.dot} mt-1.5 shrink-0`} />
                <div>
                  <span className="text-xs font-medium text-text-primary">{highlight.label}</span>
                  <span className="text-xs text-text-muted"> — {highlight.detail}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </button>
    </div>
  );
}

// Main Component
export default function JourneyTab() {
  const programStartDate = new Date('2024-05-01');
  const today = new Date();
  const daysSinceStart = Math.floor(
    (today.getTime() - programStartDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const monthsSinceStart = Math.floor(daysSinceStart / 30);
  const twoYearProgress = Math.min((daysSinceStart / 730) * 100, 100); // 2-year journey

  return (
    <div className="space-y-5">
      {/* Hero - Journey Celebration */}
      <div className="relative overflow-hidden rounded-2xl bg-surface border border-border">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-cyan-500/8 to-transparent rounded-full blur-xl" />
          {/* Subtle animated ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] border border-white/[0.02] rounded-full" />
        </div>

        <div className="relative z-10 p-5">
          {/* Top row with badge */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 px-2 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                  <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wide leading-none">Year One</span>
                </div>
              </div>
              <h2 className="text-xl font-bold text-text-primary leading-tight">
                {daysSinceStart} Days
                <span className="text-emerald-400"> Stronger</span>
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Building a healthier heart, one day at a time
              </p>
            </div>

            {/* Achievement badge */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Trophy size={28} className="text-emerald-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-surface flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">{journeyPhases.filter(p => p.completed).length}</span>
              </div>
            </div>
          </div>

          {/* Progress timeline - 2 year journey */}
          <div className="relative mb-4">
            <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden relative">
              {/* Year 1 marker */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 relative"
                style={{ width: `${twoYearProgress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-400 rounded-full border-2 border-surface shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] mt-1.5">
              <span className="text-text-muted">May 2024</span>
              <span className="text-text-muted/60">Year 1</span>
              <span className="text-text-muted">May 2026</span>
            </div>
          </div>

          {/* Quick stats row with explanations */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-surface-2/50 rounded-lg p-2.5 border border-white/[0.03]">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingDown size={10} className="text-rose-400" />
                <span className="text-sm font-bold text-text-primary">51%</span>
              </div>
              <p className="text-[9px] text-text-muted text-center">LDL Reduction</p>
              <p className="text-[8px] text-text-muted/70 text-center mt-0.5">132 → 65 mg/dL</p>
            </div>
            <div className="bg-surface-2/50 rounded-lg p-2.5 border border-white/[0.03]">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Heart size={10} className="text-emerald-400" />
                <span className="text-sm font-bold text-text-primary">15%</span>
              </div>
              <p className="text-[9px] text-text-muted text-center">Plaque Regressed</p>
              <p className="text-[8px] text-text-muted/70 text-center mt-0.5">Arteries healing</p>
            </div>
            <div className="bg-surface-2/50 rounded-lg p-2.5 border border-white/[0.03]">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame size={10} className="text-amber-400" />
                <span className="text-sm font-bold text-text-primary">95%</span>
              </div>
              <p className="text-[9px] text-text-muted text-center">Adherence</p>
              <p className="text-[8px] text-text-muted/70 text-center mt-0.5">Meds & habits</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transformation Summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-400" />
            Your Transformation
          </h3>
          <span className="text-xs text-text-muted">Since May 2024</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {transformations.map((t) => (
            <TransformationCard key={t.id} data={t} />
          ))}
        </div>
      </div>

      {/* Journey Phases */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Flag size={14} className="text-cyan-400" />
          Your Journey So Far
        </h3>
        <div className="space-y-3">
          {journeyPhases.map((phase, i) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              index={i}
              total={journeyPhases.length}
            />
          ))}
        </div>
      </div>

      {/* What's Next */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Target size={14} className="text-violet-400" />
          What You're Building Towards
        </h3>
        <div className="space-y-3">
          {upcomingGoals.map((goal) => {
            const Icon = goal.icon;
            return (
              <div
                key={goal.id}
                className="bg-surface rounded-xl border border-border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <ProgressRing progress={goal.progress} size={48} strokeWidth={4} color="violet" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon size={16} className="text-violet-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-text-primary">{goal.title}</h4>
                    <p className="text-xs text-text-muted mt-0.5">{goal.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-text-muted">Target: {goal.target}</span>
                      <span className="text-[10px] font-semibold text-violet-400">{goal.progress}% there</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivation Card */}
      <div className="bg-gradient-to-br from-surface to-surface/50 rounded-xl border border-emerald-500/10 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Sparkles size={18} className="text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary">You're Building Something Lasting</h4>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Every day of your journey adds up. Your cardiovascular improvements over the past {monthsSinceStart} months
              are reducing your long-term risk and building healthier arteries. The habits you've formed are creating
              lasting change that compounds over time. Keep going—the best is yet to come.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1">
                <Star size={12} className="text-amber-400" />
                <span className="text-[10px] text-text-muted">95% adherence</span>
              </div>
              <div className="flex items-center gap-1">
                <Award size={12} className="text-emerald-400" />
                <span className="text-[10px] text-text-muted">3 milestones reached</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
