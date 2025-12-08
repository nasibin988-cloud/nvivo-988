/**
 * Health Overview Tab
 * Displays Health Score, AI insights, What-If teaser, and trajectory preview
 */

import { TrendingUp, Brain, Sparkles, ChevronRight, Heart, Activity, Droplets, Moon } from 'lucide-react';

// Quick vitals for today's snapshot
const todayVitals = [
  { id: 'heart', label: 'Heart Rate', value: '72', unit: 'bpm', icon: Heart, color: 'rose' },
  { id: 'bp', label: 'Blood Pressure', value: '118/78', unit: 'mmHg', icon: Activity, color: 'rose' },
  { id: 'glucose', label: 'Glucose', value: '95', unit: 'mg/dL', icon: Droplets, color: 'amber' },
  { id: 'sleep', label: 'Sleep', value: '7.5', unit: 'hrs', icon: Moon, color: 'violet' },
];

// Health score breakdown - each category has its own color
const scoreBreakdown = [
  { label: 'Cardiovascular', score: 88, color: 'text-rose-400' },
  { label: 'Metabolic', score: 82, color: 'text-amber-400' },
  { label: 'Cognitive', score: 90, color: 'text-violet-400' },
  { label: 'Lifestyle', score: 78, color: 'text-emerald-400' },
];

// Selected ring design
const RING_DESIGN = 2;

// Ring Design 1: Radiant Gradient Arc
function RingDesign1({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 42;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ring1-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <filter id="ring1-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background track */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="rgba(244,63,94,0.1)"
          strokeWidth="6"
        />
        {/* Progress arc */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="url(#ring1-gradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          filter="url(#ring1-glow)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold bg-gradient-to-br from-rose-400 to-pink-500 bg-clip-text text-transparent">A</span>
      </div>
    </div>
  );
}

// Ring Design 2: Concentric Orbits
function RingDesign2({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 40;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ring2-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
        </defs>
        {/* Outer faint orbit */}
        <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(244,63,94,0.05)" strokeWidth="1" />
        {/* Middle orbit */}
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(244,63,94,0.1)" strokeWidth="4" />
        {/* Inner ring */}
        <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(244,63,94,0.08)" strokeWidth="2" />
        {/* Progress on middle ring */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="url(#ring2-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          transform="rotate(-90 50 50)"
        />
        {/* Orbiting dots */}
        <circle cx="50" cy="4" r="2.5" fill="#f43f5e" opacity="0.8" />
        <circle cx="96" cy="50" r="2" fill="#fb7185" opacity="0.6" />
        <circle cx="50" cy="96" r="1.5" fill="#fda4af" opacity="0.4" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold text-rose-400">A</span>
      </div>
    </div>
  );
}

// Ring Design 3: Segmented Progress
function RingDesign3({ score }: { score: number }) {
  const segments = 20;
  const activeSegments = Math.round((score / 100) * segments);
  const segmentAngle = 360 / segments;
  const gapAngle = 4;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ring3-active" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>
        {Array.from({ length: segments }).map((_, i) => {
          const startAngle = i * segmentAngle + gapAngle / 2;
          const endAngle = (i + 1) * segmentAngle - gapAngle / 2;
          const isActive = i < activeSegments;

          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;

          const x1 = 50 + 42 * Math.cos(startRad);
          const y1 = 50 + 42 * Math.sin(startRad);
          const x2 = 50 + 42 * Math.cos(endRad);
          const y2 = 50 + 42 * Math.sin(endRad);

          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A 42 42 0 0 1 ${x2} ${y2}`}
              fill="none"
              stroke={isActive ? 'url(#ring3-active)' : 'rgba(244,63,94,0.1)'}
              strokeWidth="5"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500/10 to-rose-500/5 flex items-center justify-center">
          <span className="text-3xl font-bold text-rose-400">A</span>
        </div>
      </div>
    </div>
  );
}

// Ring Design 4: Dual Arc with Glow
function RingDesign4({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 40;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ring4-main" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#be123c" />
            <stop offset="50%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
          <filter id="ring4-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Subtle background ring */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="rgba(244,63,94,0.08)"
          strokeWidth="8"
        />
        {/* Inner decorative ring */}
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="rgba(244,63,94,0.05)"
          strokeWidth="1"
        />
        {/* Main progress arc */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="url(#ring4-main)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          transform="rotate(-90 50 50)"
          filter="url(#ring4-glow)"
        />
        {/* End cap highlight */}
        <circle
          cx="50"
          cy="10"
          r="4"
          fill="#fb7185"
          filter="url(#ring4-glow)"
          transform={`rotate(${(score / 100) * 360 - 90} 50 50)`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]">A</span>
      </div>
    </div>
  );
}

// Ring Design 5: Neon Pulse
function RingDesign5({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 38;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ring5-neon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff1493" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
          <filter id="ring5-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur1" />
            <feGaussianBlur stdDeviation="2" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Outer glow ring */}
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(244,63,94,0.15)" strokeWidth="2" />
        {/* Background */}
        <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(244,63,94,0.1)" strokeWidth="6" />
        {/* Neon progress */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="url(#ring5-neon)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          transform="rotate(-90 50 50)"
          filter="url(#ring5-glow)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-black text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]">A</span>
      </div>
    </div>
  );
}

// Ring Design 6: Dotted Circle
function RingDesign6({ score }: { score: number }) {
  const totalDots = 24;
  const activeDots = Math.round((score / 100) * totalDots);

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <defs>
          <filter id="ring6-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {Array.from({ length: totalDots }).map((_, i) => {
          const angle = (i * 360) / totalDots - 90;
          const rad = (angle * Math.PI) / 180;
          const x = 50 + 40 * Math.cos(rad);
          const y = 50 + 40 * Math.sin(rad);
          const isActive = i < activeDots;
          const size = isActive ? 4 : 2.5;

          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={size}
              fill={isActive ? '#f43f5e' : 'rgba(244,63,94,0.15)'}
              filter={isActive ? 'url(#ring6-glow)' : undefined}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-rose-500/5 flex items-center justify-center">
          <span className="text-3xl font-bold text-rose-400">A</span>
        </div>
      </div>
    </div>
  );
}

// Ring Design 7: Stacked Arcs
function RingDesign7({ score }: { score: number }) {
  const mainCirc = 2 * Math.PI * 40;
  const innerCirc = 2 * Math.PI * 32;
  const mainProgress = (score / 100) * mainCirc;
  const innerProgress = ((score - 10) / 100) * innerCirc; // Slightly offset

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ring7-outer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
          <linearGradient id="ring7-inner" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
        </defs>
        {/* Outer track */}
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(244,63,94,0.08)" strokeWidth="5" />
        {/* Inner track */}
        <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(244,63,94,0.06)" strokeWidth="4" />
        {/* Outer progress */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="url(#ring7-outer)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${mainProgress} ${mainCirc}`}
          transform="rotate(-90 50 50)"
        />
        {/* Inner progress */}
        <circle
          cx="50"
          cy="50"
          r="32"
          fill="none"
          stroke="url(#ring7-inner)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${innerProgress} ${innerCirc}`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-rose-400">A</span>
      </div>
    </div>
  );
}

// Ring Design 8: Elegant Sweep
function RingDesign8({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 42;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ring8-sweep" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fecdd3" stopOpacity="0.3" />
            <stop offset="30%" stopColor="#fb7185" />
            <stop offset="70%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>
          <filter id="ring8-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#f43f5e" floodOpacity="0.3" />
          </filter>
        </defs>
        {/* Subtle background */}
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(244,63,94,0.06)" strokeWidth="10" />
        {/* Progress sweep */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="url(#ring8-sweep)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          transform="rotate(-90 50 50)"
          filter="url(#ring8-shadow)"
        />
        {/* Inner accent circle */}
        <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(244,63,94,0.1)" strokeWidth="0.5" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-semibold text-rose-400">A</span>
      </div>
    </div>
  );
}

// Ring selector component
function HealthScoreRing({ score, design }: { score: number; design: number }) {
  switch (design) {
    case 1: return <RingDesign1 score={score} />;
    case 2: return <RingDesign2 score={score} />;
    case 3: return <RingDesign3 score={score} />;
    case 4: return <RingDesign4 score={score} />;
    case 5: return <RingDesign5 score={score} />;
    case 6: return <RingDesign6 score={score} />;
    case 7: return <RingDesign7 score={score} />;
    case 8: return <RingDesign8 score={score} />;
    default: return <RingDesign1 score={score} />;
  }
}

interface OverviewTabProps {
  onOpenGoals?: () => void;
}

export default function OverviewTab({ onOpenGoals }: OverviewTabProps) {
  return (
    <div className="space-y-4">
      {/* Health Score Card */}
      <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent rounded-2xl border border-rose-500/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xs font-semibold tracking-wider text-text-secondary uppercase">Health Score</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-bold text-text-primary">85</span>
              <span className="text-lg text-text-muted">/100</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">+3 from last week</span>
            </div>
          </div>
          <HealthScoreRing score={85} design={RING_DESIGN} />
        </div>

        {/* Score Breakdown - each category colored */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-rose-500/10">
          {scoreBreakdown.map((item) => (
            <div key={item.label} className="text-center">
              <div className={`text-lg font-bold ${item.color}`}>{item.score}</div>
              <div className="text-[10px] text-text-muted">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <Brain size={20} className="text-rose-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-text-primary mb-1">AI Health Insight</h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              Your LDL has dropped 12% this month. Combined with improved sleep quality,
              your cardiovascular risk score is trending favorably.
            </p>
          </div>
        </div>
      </div>

      {/* Today's Vitals Grid */}
      <div>
        <h3 className="text-sm font-medium text-text-secondary mb-3">Today's Vitals</h3>
        <div className="grid grid-cols-2 gap-3">
          {todayVitals.map((vital) => {
            const Icon = vital.icon;
            return (
              <div
                key={vital.id}
                className="bg-surface rounded-2xl border border-border p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg bg-${vital.color}-500/10`}>
                    <Icon size={16} className={`text-${vital.color}-400`} />
                  </div>
                  <span className="text-xs text-text-muted">{vital.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-text-primary">{vital.value}</span>
                  <span className="text-xs text-text-muted">{vital.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goals & Progress */}
      <button
        onClick={onOpenGoals}
        className="w-full bg-surface rounded-2xl border border-border p-4 text-left group hover:border-rose-500/30 hover:bg-rose-500/5 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <Sparkles size={20} className="text-rose-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary">Goals & Progress</h4>
              <p className="text-xs text-text-muted mt-0.5">Track behaviors & learn from research</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-text-muted group-hover:text-rose-400 transition-colors" />
        </div>
      </button>
    </div>
  );
}
