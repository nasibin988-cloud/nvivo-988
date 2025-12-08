/**
 * Wellness Tab
 * Mood tracking, vitality, and mindfulness with beautiful animations
 * Matching the original repo's premium design
 */

import { useState, useEffect, useRef } from 'react';
import {
  Smile,
  Zap,
  Moon,
  Heart,
  Wind,
  Play,
  Pause,
  X,
  ChevronRight,
  TrendingUp,
  Brain,
  Waves,
  Star,
  ArrowUp,
  ArrowDown,
  Volume2,
  SkipBack,
  SkipForward,
  Sparkles,
  Plus,
  Minus,
} from 'lucide-react';
import { VitalityRing } from '../../../components/dashboard/VitalityRing';
import type { WellnessLog } from '../../../hooks/dashboard';

// Mock wellness data for demo
const mockWellnessLog: WellnessLog = {
  id: 'today',
  userId: 'demo',
  date: new Date().toISOString().split('T')[0],
  mood: 7,
  energy: 8,
  stress: 3,
  sleepQuality: 8,
  sleepHours: 7.5,
  notes: '',
  tags: ['productive', 'calm'],
  createdAt: new Date().toISOString(),
};

// Mock weekly data for the chart
const mockWeeklyData = [
  { day: 'Mon', mood: 6.5, energy: 7, stress: 4, vitality: 72 },
  { day: 'Tue', mood: 7, energy: 7.5, stress: 3.5, vitality: 76 },
  { day: 'Wed', mood: 6, energy: 6, stress: 5, vitality: 65 },
  { day: 'Thu', mood: 7.5, energy: 8, stress: 3, vitality: 82 },
  { day: 'Fri', mood: 8, energy: 8.5, stress: 2.5, vitality: 85 },
  { day: 'Sat', mood: 8.5, energy: 9, stress: 2, vitality: 90 },
  { day: 'Sun', mood: 7.5, energy: 8, stress: 3, vitality: 84 },
];

// Mindfulness Module Type (matching old repo)
interface MindfulnessModule {
  id: string;
  title: string;
  description: string;
  category: 'Focus' | 'Sleep' | 'Stress' | 'Vitality';
  duration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

// Extended mindfulness modules (like old repo)
const mindfulnessModules: MindfulnessModule[] = [
  // Vitality
  { id: 'v1', title: 'Morning Awakening', description: 'Start your day with renewed energy', category: 'Vitality', duration: 5, difficulty: 'Beginner' },
  { id: 'v2', title: 'Energy Boost', description: 'Quick revitalization breathing', category: 'Vitality', duration: 3, difficulty: 'Beginner' },
  { id: 'v3', title: 'Breath of Fire', description: 'Energizing pranayama technique', category: 'Vitality', duration: 7, difficulty: 'Intermediate' },
  // Sleep
  { id: 's1', title: 'Sleep Stories', description: 'Drift into peaceful slumber', category: 'Sleep', duration: 15, difficulty: 'Beginner' },
  { id: 's2', title: 'Deep Rest', description: 'Body scan for total relaxation', category: 'Sleep', duration: 20, difficulty: 'Beginner' },
  { id: 's3', title: 'Moonlight Meditation', description: 'Gentle wind-down practice', category: 'Sleep', duration: 12, difficulty: 'Intermediate' },
  // Stress
  { id: 'st1', title: 'Calm Breathing', description: 'Find your center in chaos', category: 'Stress', duration: 5, difficulty: 'Beginner' },
  { id: 'st2', title: 'Anxiety Release', description: 'Let go of tension and worry', category: 'Stress', duration: 10, difficulty: 'Intermediate' },
  { id: 'st3', title: 'Emergency Calm', description: 'Quick stress relief technique', category: 'Stress', duration: 3, difficulty: 'Beginner' },
  { id: 'st4', title: 'Progressive Relaxation', description: 'Systematic muscle tension release', category: 'Stress', duration: 15, difficulty: 'Advanced' },
  // Focus
  { id: 'f1', title: 'Sharp Mind', description: 'Enhance mental clarity', category: 'Focus', duration: 10, difficulty: 'Intermediate' },
  { id: 'f2', title: 'Flow State', description: 'Enter deep concentration', category: 'Focus', duration: 15, difficulty: 'Advanced' },
  { id: 'f3', title: 'Mindful Attention', description: 'Train your focus muscle', category: 'Focus', duration: 8, difficulty: 'Beginner' },
  { id: 'f4', title: 'Clarity Practice', description: 'Clear mental fog', category: 'Focus', duration: 12, difficulty: 'Intermediate' },
];

const CATEGORIES = [
  { key: 'All', label: 'All' },
  { key: 'Recommended', label: 'For You', icon: Sparkles },
  { key: 'Favorites', label: 'Saved', icon: Star },
  { key: 'Vitality', label: 'Vitality' },
  { key: 'Sleep', label: 'Sleep' },
  { key: 'Stress', label: 'Stress' },
  { key: 'Focus', label: 'Focus' },
];

function getCategoryColor(category: string): { text: string; bg: string; border: string; hex: string } {
  const colors: Record<string, { text: string; bg: string; border: string; hex: string }> = {
    Vitality: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', hex: '#06b6d4' },
    Sleep: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', hex: '#a855f7' },
    Stress: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', hex: '#10b981' },
    Focus: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', hex: '#f59e0b' },
  };
  return colors[category] || colors.Vitality;
}

function getCategoryIcon(category: string) {
  const icons: Record<string, typeof Wind> = {
    Vitality: Wind,
    Sleep: Moon,
    Stress: Sparkles,
    Focus: Waves,
  };
  return icons[category] || Brain;
}

function getCategoryGradient(category: string): string {
  const gradients: Record<string, string> = {
    Vitality: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    Sleep: 'from-purple-500/20 via-pink-500/10 to-transparent',
    Stress: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    Focus: 'from-amber-500/20 via-orange-500/10 to-transparent',
  };
  return gradients[category] || 'from-gray-500/10 to-transparent';
}

// Hero Card Component (matching old repo design)
function HeroCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  sevenDayAvg,
  color,
  delay = 0,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  sevenDayAvg?: string;
  color: string;
  delay?: number;
}) {
  return (
    <button
      className="group relative overflow-hidden rounded-2xl text-left w-full transition-all duration-500 hover:scale-[1.03] active:scale-[0.98]"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: `0 8px 32px -8px rgba(0, 0, 0, 0.3), 0 0 0 1px ${color}08`,
        animation: `fadeInUp 0.6s ease-out ${delay}ms backwards`,
      }}
    >
      {/* Background Glow on Hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ background: `radial-gradient(circle at 30% 50%, ${color}20 0%, transparent 70%)` }}
      />

      {/* Celebration Particles for Upward Trends */}
      {trend === 'up' && (
        <>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full opacity-0 group-hover:opacity-100"
              style={{
                left: `${20 + i * 15}%`,
                top: '50%',
                backgroundColor: color,
                animation: `particle-float 1.5s ease-out ${i * 0.1}s infinite`,
                boxShadow: `0 0 8px ${color}`,
              }}
            />
          ))}
        </>
      )}

      {/* Shimmer Effect */}
      <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 rotate-12 translate-x-[-200%] group-hover:translate-x-[200%]" />

      {/* Top Border Accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          boxShadow: `0 0 20px ${color}80`,
        }}
      />

      <div className="p-3 relative z-10">
        {/* Header Row */}
        <div className="flex justify-between items-start mb-2">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-lg blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
              style={{ backgroundColor: color }}
            />
            <div
              className="relative p-1.5 rounded-lg transition-all duration-500 group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                border: `1px solid ${color}30`,
                color: color,
              }}
            >
              {icon}
            </div>
          </div>

          {trend && trendValue && (
            <div
              className={`flex items-center justify-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                trend === 'up'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : trend === 'down'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
              }`}
            >
              {trend === 'up' && <ArrowUp size={10} strokeWidth={3} />}
              {trend === 'down' && <ArrowDown size={10} strokeWidth={3} />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-gray-400 text-[9px] uppercase tracking-[0.12em] font-bold mb-1">{title}</h3>

        {/* Value and Bar */}
        <div className="space-y-1.5">
          <div className="text-lg font-bold text-white">{value}</div>

          {/* Visual Bar */}
          <div className="relative h-1 bg-white/5 rounded-full overflow-hidden">
            {(() => {
              const numericValue = typeof value === 'string' ? parseFloat(value.split('/')[0]) : value;
              const maxValue = typeof value === 'string' && value.includes('/') ? parseFloat(value.split('/')[1]) : 10;
              const percentage = typeof numericValue === 'number' ? Math.min((numericValue / maxValue) * 100, 100) : 0;
              return (
                <>
                  <div
                    className="absolute inset-0 transition-all duration-700 rounded-full"
                    style={{
                      width: `${percentage}%`,
                      background: `linear-gradient(90deg, ${color}60, ${color})`,
                      boxShadow: `0 0 10px ${color}80`,
                    }}
                  />
                  <div
                    className="absolute inset-0 opacity-50"
                    style={{
                      width: `${percentage}%`,
                      background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
                      animation: 'shimmer 2s infinite',
                    }}
                  />
                </>
              );
            })()}
          </div>

          {sevenDayAvg && (
            <div className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">
              7-Day: <span style={{ color }}>{sevenDayAvg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Gradient Bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-500 group-hover:h-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: 0.5,
        }}
      />
    </button>
  );
}

// Smooth Breathing Animation with CSS transitions (no glitchy particles)
function BreathingAnimation({ isPlaying, color }: { isPlaying: boolean; color: string }) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [scale, setScale] = useState(0.6);

  useEffect(() => {
    if (!isPlaying) {
      setPhase('inhale');
      setScale(0.6);
      return;
    }

    // Breathing cycle: Inhale 4s -> Hold 2s -> Exhale 6s = 12s total
    const runCycle = () => {
      // Inhale phase
      setPhase('inhale');
      setScale(1);

      // Hold phase after 4s
      const holdTimer = setTimeout(() => {
        setPhase('hold');
      }, 4000);

      // Exhale phase after 6s (4s inhale + 2s hold)
      const exhaleTimer = setTimeout(() => {
        setPhase('exhale');
        setScale(0.6);
      }, 6000);

      return { holdTimer, exhaleTimer };
    };

    const { holdTimer, exhaleTimer } = runCycle();
    const interval = setInterval(runCycle, 12000);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exhaleTimer);
      clearInterval(interval);
    };
  }, [isPlaying]);

  const colors: Record<string, { ring: string; glow: string }> = {
    cyan: { ring: '#06b6d4', glow: 'rgba(6,182,212,0.4)' },
    purple: { ring: '#a855f7', glow: 'rgba(168,85,247,0.4)' },
    emerald: { ring: '#10b981', glow: 'rgba(16,185,129,0.4)' },
    amber: { ring: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
  };

  const c = colors[color] || colors.cyan;

  const instruction = phase === 'inhale' ? 'Breathe in...' : phase === 'hold' ? 'Hold...' : 'Breathe out...';

  return (
    <div className="relative w-72 h-72 flex items-center justify-center">
      {/* Outer glow rings */}
      <div
        className="absolute rounded-full transition-all duration-[4000ms] ease-in-out"
        style={{
          width: '100%',
          height: '100%',
          border: `2px solid ${c.ring}`,
          opacity: isPlaying ? (scale > 0.8 ? 0.4 : 0.15) : 0.1,
          transform: `scale(${isPlaying ? scale * 1.1 : 0.9})`,
        }}
      />
      <div
        className="absolute rounded-full transition-all duration-[4000ms] ease-in-out delay-100"
        style={{
          width: '90%',
          height: '90%',
          border: `1px solid ${c.ring}`,
          opacity: isPlaying ? (scale > 0.8 ? 0.3 : 0.1) : 0.08,
          transform: `scale(${isPlaying ? scale * 1.05 : 0.9})`,
        }}
      />
      <div
        className="absolute rounded-full transition-all duration-[4000ms] ease-in-out delay-200"
        style={{
          width: '80%',
          height: '80%',
          border: `1px solid ${c.ring}`,
          opacity: isPlaying ? (scale > 0.8 ? 0.25 : 0.08) : 0.05,
          transform: `scale(${isPlaying ? scale : 0.9})`,
        }}
      />

      {/* Main breathing orb */}
      <div
        className="relative rounded-full flex items-center justify-center transition-all ease-in-out"
        style={{
          width: '55%',
          height: '55%',
          background: `radial-gradient(circle at 30% 30%, ${c.ring}50, ${c.ring}15)`,
          boxShadow: `0 0 ${isPlaying ? 60 * scale : 20}px ${c.glow}, 0 0 ${isPlaying ? 30 * scale : 10}px ${c.glow}`,
          transform: `scale(${scale})`,
          transitionDuration: phase === 'inhale' ? '4000ms' : phase === 'exhale' ? '6000ms' : '0ms',
        }}
      >
        {/* Inner glow layer */}
        <div
          className="absolute rounded-full transition-all ease-in-out"
          style={{
            width: '85%',
            height: '85%',
            background: `radial-gradient(circle, ${c.ring}40 0%, transparent 70%)`,
            opacity: scale > 0.8 ? 0.8 : 0.4,
            transitionDuration: phase === 'inhale' ? '4000ms' : phase === 'exhale' ? '6000ms' : '0ms',
          }}
        />

        {/* Core */}
        <div
          className="relative w-14 h-14 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${c.ring}, ${c.ring}70)`,
            boxShadow: `0 0 40px ${c.glow}, inset 0 -4px 15px rgba(0,0,0,0.3)`,
          }}
        />
      </div>

      {/* Breathing instruction */}
      {isPlaying && (
        <div className="absolute bottom-6 text-center">
          <span
            className="text-lg font-medium text-white/90 transition-opacity duration-500"
            style={{ textShadow: `0 0 15px ${c.glow}` }}
          >
            {instruction}
          </span>
        </div>
      )}
    </div>
  );
}

// Full-screen Mindfulness Player
function MindfulnessPlayer({
  module,
  onClose,
}: {
  module: MindfulnessModule;
  onClose: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = module.duration * 60;
  const categoryColors = getCategoryColor(module.category);
  const colorKey = module.category === 'Vitality' ? 'cyan' : module.category === 'Sleep' ? 'purple' : module.category === 'Stress' ? 'emerald' : 'amber';

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 1;
          setProgress((next / totalSeconds) * 100);
          if (next >= totalSeconds) {
            setIsPlaying(false);
            return totalSeconds;
          }
          return next;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, totalSeconds]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const IconComponent = getCategoryIcon(module.category);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d15 50%, #0a0a0f 100%)',
      }}
    >
      {/* Background gradient based on category */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${getCategoryGradient(module.category)} opacity-40`}
      />

      {/* Ambient floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: `${categoryColors.hex}40`,
              animation: `ambient-float ${8 + Math.random() * 12}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 8}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-4">
        <button
          onClick={onClose}
          className="p-2.5 -ml-2 rounded-xl transition-all hover:bg-white/5"
        >
          <X size={24} className="text-white/70" />
        </button>
        <div className="flex items-center gap-3">
          <Volume2 size={20} className="text-white/50" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center px-8">
        {/* Session info */}
        <div className={`mb-3 p-3 rounded-2xl ${categoryColors.bg} ${categoryColors.border} border`}>
          <IconComponent size={24} className={categoryColors.text} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">{module.title}</h2>
        <p className="text-sm text-white/60 mb-2">{module.description}</p>
        <span
          className="text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider mb-10"
          style={{
            background: module.difficulty === 'Advanced' ? 'rgba(239, 68, 68, 0.1)' : module.difficulty === 'Intermediate' ? 'rgba(251, 146, 60, 0.1)' : 'rgba(34, 197, 94, 0.1)',
            border: `1px solid ${module.difficulty === 'Advanced' ? 'rgba(239, 68, 68, 0.3)' : module.difficulty === 'Intermediate' ? 'rgba(251, 146, 60, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
            color: module.difficulty === 'Advanced' ? '#fca5a5' : module.difficulty === 'Intermediate' ? '#fdba74' : '#86efac',
          }}
        >
          {module.difficulty}
        </span>

        {/* Breathing visualization */}
        <BreathingAnimation isPlaying={isPlaying} color={colorKey} />

        {/* Time display */}
        <div className="mt-10 text-center">
          <span className="text-4xl font-light text-white tabular-nums">
            {formatTime(currentTime)}
          </span>
          <span className="text-xl text-white/40"> / {formatTime(totalSeconds)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 px-8 pb-10">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${categoryColors.hex}80, ${categoryColors.hex})`,
                boxShadow: `0 0 10px ${categoryColors.hex}`,
              }}
            />
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-10">
          <button
            onClick={() => setCurrentTime(Math.max(0, currentTime - 15))}
            className="p-3 text-white/50 hover:text-white transition-colors"
          >
            <SkipBack size={28} />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95`}
            style={{
              background: `linear-gradient(135deg, ${categoryColors.hex}30, ${categoryColors.hex}15)`,
              border: `2px solid ${categoryColors.hex}50`,
              boxShadow: `0 0 30px ${categoryColors.hex}30`,
            }}
          >
            {isPlaying ? (
              <Pause size={32} className={categoryColors.text} />
            ) : (
              <Play size={32} className={`${categoryColors.text} ml-1`} />
            )}
          </button>

          <button
            onClick={() => setCurrentTime(Math.min(totalSeconds, currentTime + 15))}
            className="p-3 text-white/50 hover:text-white transition-colors"
          >
            <SkipForward size={28} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes ambient-float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          25% { transform: translateY(-30px) translateX(15px); opacity: 0.6; }
          50% { transform: translateY(-20px) translateX(-10px); opacity: 0.4; }
          75% { transform: translateY(-40px) translateX(20px); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

// Mindfulness Card (matching old repo Neuro-Library design)
function MindfulnessCard({
  module,
  isFavorite,
  onToggleFavorite,
  onPlay,
}: {
  module: MindfulnessModule;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPlay: () => void;
}) {
  const colors = getCategoryColor(module.category);
  const gradient = getCategoryGradient(module.category);
  const IconComponent = getCategoryIcon(module.category);

  return (
    <div
      className="group relative flex flex-col gap-3 p-4 bg-gray-950/70 rounded-2xl transition-all duration-500 text-left overflow-hidden backdrop-blur-xl hover:-translate-y-0.5"
      style={{
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
      }}
    >
      {/* Category color tint overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-40 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none`} />

      {/* Dark bottom shading */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent opacity-60 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start w-full z-10">
        <div className="flex items-start gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gray-800/80 border border-white/5 ${colors.text} group-hover:scale-105 transition-transform`}>
            <IconComponent size={20} />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="z-20 p-1.5 rounded-lg transition-all hover:scale-110 active:scale-95"
            style={{
              background: isFavorite ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0, 0, 0, 0.3)',
              border: isFavorite ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Star size={12} className={isFavorite ? 'text-amber-400' : 'text-gray-500'} fill={isFavorite ? '#f59e0b' : 'none'} />
          </button>
        </div>

        {/* Difficulty Badge */}
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider"
          style={{
            background: module.difficulty === 'Advanced' ? 'rgba(239, 68, 68, 0.1)' : module.difficulty === 'Intermediate' ? 'rgba(251, 146, 60, 0.1)' : 'rgba(34, 197, 94, 0.1)',
            borderColor: module.difficulty === 'Advanced' ? 'rgba(239, 68, 68, 0.3)' : module.difficulty === 'Intermediate' ? 'rgba(251, 146, 60, 0.3)' : 'rgba(34, 197, 94, 0.3)',
            color: module.difficulty === 'Advanced' ? '#fca5a5' : module.difficulty === 'Intermediate' ? '#fdba74' : '#86efac',
          }}
        >
          {module.difficulty}
        </span>
      </div>

      {/* Clickable area */}
      <button onClick={onPlay} className="absolute inset-0 z-10" aria-label={`Play ${module.title}`} />

      {/* Title and Description */}
      <div className="flex-1 z-10 relative pointer-events-none">
        <h4 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors mb-0.5">
          {module.title}
        </h4>
        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{module.description}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 z-10 border-t border-white/5 pt-3 w-full mt-auto relative pointer-events-none">
        <Play size={12} className="text-gray-400" fill="currentColor" />
        <span className="text-[11px] font-bold text-gray-400">{module.duration} min</span>
        <div className="flex-1" />
        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
          {module.category}
        </span>
      </div>
    </div>
  );
}

// Comprehensive Wellness Log Modal (consistent with repo theme)
function WellnessLogModal({
  onClose,
  onSave,
  existingLog,
}: {
  onClose: () => void;
  onSave: (log: Partial<WellnessLog>) => void;
  existingLog?: WellnessLog | null;
}) {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState(existingLog?.mood || 5);
  const [energy, setEnergy] = useState(existingLog?.energy || 5);
  const [stress, setStress] = useState(existingLog?.stress || 5);
  const [sleepQuality, setSleepQuality] = useState(existingLog?.sleepQuality || 5);
  const [sleepHours, setSleepHours] = useState(existingLog?.sleepHours || 7);
  const [tags, setTags] = useState<string[]>(existingLog?.tags || []);
  const [notes, setNotes] = useState(existingLog?.notes || '');

  const POSITIVE_TAGS = ['Gym', 'Sauna', 'Nature', 'Social', 'Nutrition', 'Meditation'];
  const NEGATIVE_TAGS = ['Work', 'Stress', 'Traffic', 'Conflict', 'Illness', 'Bad Sleep'];

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const formatSleepTime = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const isStep1Complete = mood && stress && energy && sleepQuality;

  const RatingSlider = ({ label, icon, colorClass, value, onChange }: { label: string; icon: React.ReactNode; colorClass: string; value: number; onChange: (v: number) => void }) => {
    const colorMap: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
      pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400', gradient: 'from-pink-500/60 to-pink-400' },
      violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', gradient: 'from-violet-500/60 to-violet-400' },
      orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', gradient: 'from-orange-500/60 to-orange-400' },
      cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', gradient: 'from-cyan-500/60 to-cyan-400' },
    };
    const c = colorMap[colorClass] || colorMap.violet;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${c.bg} border ${c.border} ${c.text}`}>
              {icon}
            </div>
            <span className="text-sm font-bold text-text-muted uppercase tracking-wider">{label}</span>
          </div>
          <span className={`text-xl font-bold ${c.text}`}>{value}/5</span>
        </div>
        <div className="relative h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${c.gradient} transition-all`}
            style={{ width: `${(value / 5) * 100}%` }}
          />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              onClick={() => onChange(val)}
              className={`h-11 rounded-xl font-bold text-base transition-all ${
                value === val
                  ? `${c.bg} border ${c.border} ${c.text} scale-105`
                  : 'bg-surface border border-border text-text-muted hover:bg-surface-2'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        {/* Header */}
        <div className="relative p-5 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-1">Daily Check-in</h2>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2].map((s) => (
                  <div key={s} className={`h-1 w-6 rounded-full transition-all ${step >= s ? 'bg-violet-500' : 'bg-surface-2'}`} />
                ))}
              </div>
              <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Step {step} of 2</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface-2 border border-border text-text-muted hover:text-text-primary hover:bg-surface transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-y-auto p-6 space-y-6">
          {step === 1 ? (
            <>
              <RatingSlider label="Mood" icon={<Heart size={16} />} colorClass="pink" value={mood} onChange={setMood} />
              <RatingSlider label="Energy" icon={<Zap size={16} />} colorClass="violet" value={energy} onChange={setEnergy} />
              <RatingSlider label="Stress" icon={<Brain size={16} />} colorClass="orange" value={stress} onChange={setStress} />

              {/* Sleep Section */}
              <div className="space-y-3 pt-4 border-t border-border">
                <RatingSlider label="Sleep Quality" icon={<Moon size={16} />} colorClass="cyan" value={sleepQuality} onChange={setSleepQuality} />

                {/* Hours Selector */}
                <div className="flex items-center justify-between p-4 rounded-2xl mt-3 bg-surface-2 border border-border">
                  <button
                    onClick={() => setSleepHours(Math.max(4, sleepHours - 0.25))}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface border border-border text-text-primary transition-all hover:scale-110 active:scale-95"
                  >
                    <Minus size={16} />
                  </button>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-text-primary">{formatSleepTime(sleepHours)}</span>
                    <span className="text-[10px] text-text-muted block mt-0.5 uppercase tracking-wider font-bold">SLEEP TIME</span>
                  </div>
                  <button
                    onClick={() => setSleepHours(Math.min(12, sleepHours + 0.25))}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface border border-border text-text-primary transition-all hover:scale-110 active:scale-95"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Tags Section */}
              <div className="space-y-4">
                <h3 className="text-text-primary font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={14} className="text-emerald-400" />
                  What helped today?
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {POSITIVE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                        tags.includes(tag)
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 scale-105'
                          : 'bg-surface border border-border text-text-muted hover:bg-surface-2'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-text-primary font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <Heart size={14} className="text-rose-400" />
                  What was difficult?
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {NEGATIVE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                        tags.includes(tag)
                          ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400 scale-105'
                          : 'bg-surface border border-border text-text-muted hover:bg-surface-2'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <h3 className="text-text-primary font-bold text-sm uppercase tracking-wider">Notes (optional)</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How are you feeling today?"
                  className="w-full h-24 px-4 py-3 rounded-xl text-sm bg-surface-2 border border-border text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="relative p-5 border-t border-border">
          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={!isStep1Complete}
              className="w-full py-3.5 rounded-2xl font-bold text-base bg-gradient-to-r from-violet-500 to-purple-500 text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
            >
              Next Step
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3.5 rounded-2xl font-bold text-base bg-surface border border-border text-text-primary transition-all hover:bg-surface-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                Back
              </button>
              <button
                onClick={() => {
                  onSave({ mood, energy, stress, sleepQuality, sleepHours, tags, notes });
                  onClose();
                }}
                className="flex-1 py-3.5 rounded-2xl font-bold text-base bg-gradient-to-r from-violet-500 to-purple-500 text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-500/25"
              >
                Complete Check-in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Wellness Tab Component
export default function WellnessTab() {
  const [wellnessLog, setWellnessLog] = useState<WellnessLog | null>(mockWellnessLog);
  const [showWellnessLog, setShowWellnessLog] = useState(false);
  const [activeSession, setActiveSession] = useState<MindfulnessModule | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['st1', 's1']);

  const handleSaveLog = (data: Partial<WellnessLog>) => {
    setWellnessLog(prev => prev ? { ...prev, ...data } : null);
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  // Filter modules based on category
  const filteredModules = mindfulnessModules.filter(module => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Recommended') return ['st1', 'v1', 's1'].includes(module.id);
    if (selectedCategory === 'Favorites') return favoriteIds.includes(module.id);
    return module.category === selectedCategory;
  });

  return (
    <div className="space-y-6 pb-4">
      {/* Vitality Section */}
      <div
        className="rounded-3xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Background glows */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex items-start justify-between mb-4 relative z-10">
          <div>
            <h3 className="text-base font-bold text-white">Today&apos;s Vitality</h3>
            <p className="text-xs text-gray-500 mt-0.5">Based on your wellness check-in</p>
          </div>
          <button
            onClick={() => setShowWellnessLog(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1))',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#a78bfa',
            }}
          >
            Log Now
          </button>
        </div>

        <div className="flex justify-center relative z-10">
          <VitalityRing
            wellnessLog={wellnessLog}
            size={180}
            strokeWidth={10}
            variant={4}
            animation={1}
          />
        </div>
      </div>

      {/* Hero Cards (matching old repo design) */}
      {wellnessLog && (
        <div className="grid grid-cols-2 gap-3">
          <HeroCard
            title="Mood"
            value={`${wellnessLog.mood}/10`}
            icon={<Smile size={16} />}
            trend="up"
            trendValue="+0.5"
            sevenDayAvg="7.2"
            color="#10b981"
            delay={0}
          />
          <HeroCard
            title="Energy"
            value={`${wellnessLog.energy}/10`}
            icon={<Zap size={16} />}
            trend="up"
            trendValue="+1.2"
            sevenDayAvg="7.5"
            color="#f59e0b"
            delay={100}
          />
          <HeroCard
            title="Stress"
            value={`${wellnessLog.stress}/10`}
            icon={<Heart size={16} />}
            trend="down"
            trendValue="-0.8"
            sevenDayAvg="3.5"
            color="#ec4899"
            delay={200}
          />
          <HeroCard
            title="Sleep"
            value={`${wellnessLog.sleepHours} HRS`}
            icon={<Moon size={16} />}
            trend="neutral"
            trendValue="–"
            sevenDayAvg="7.2h"
            color="#8b5cf6"
            delay={300}
          />
        </div>
      )}

      {/* Neuro-Library (Mindfulness) */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 px-1">
          <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
            <Brain size={16} />
          </div>
          <h3 className="text-sm font-bold uppercase text-white tracking-widest">Neuro-Library</h3>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                selectedCategory === key
                  ? 'text-white border border-white/20'
                  : 'bg-gray-900/40 text-gray-400 border border-white/5 hover:bg-gray-800/60 hover:text-white'
              }`}
              style={selectedCategory === key ? {
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.05))',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
              } : {}}
            >
              {Icon && <Icon size={12} />}
              {label}
            </button>
          ))}
        </div>

        {/* Modules Grid */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {filteredModules.map((module) => (
            <MindfulnessCard
              key={module.id}
              module={module}
              isFavorite={favoriteIds.includes(module.id)}
              onToggleFavorite={() => toggleFavorite(module.id)}
              onPlay={() => setActiveSession(module)}
            />
          ))}
        </div>
      </div>

      {/* Weekly Trends */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp size={14} className="text-cyan-400" />
            This Week
          </h3>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <ArrowUp size={12} />
            +12% vitality
          </span>
        </div>

        {/* Chart with actual data points */}
        <div className="flex items-end justify-between gap-1.5 h-24">
          {mockWeeklyData.map((data, i) => {
            const isToday = i === mockWeeklyData.length - 1;
            return (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="relative w-full flex flex-col items-center">
                  {/* Data tooltip on hover */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-[9px] text-cyan-400 font-bold whitespace-nowrap">{data.vitality}%</span>
                  </div>
                  <div
                    className={`w-full rounded-t-sm transition-all ${isToday ? 'bg-gradient-to-t from-cyan-500 to-cyan-400' : 'bg-white/10 hover:bg-white/15'}`}
                    style={{ height: `${data.vitality}%`, minHeight: 4 }}
                  />
                </div>
                <span className={`text-[9px] ${isToday ? 'text-cyan-400 font-bold' : 'text-gray-500'}`}>
                  {data.day}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-gray-400">Mood</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[10px] text-gray-400">Energy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-[10px] text-gray-400">Stress</span>
          </div>
        </div>
      </div>

      {/* Wellness Log Modal */}
      {showWellnessLog && (
        <WellnessLogModal
          onClose={() => setShowWellnessLog(false)}
          onSave={handleSaveLog}
          existingLog={wellnessLog}
        />
      )}

      {/* Mindfulness Player */}
      {activeSession && (
        <MindfulnessPlayer
          module={activeSession}
          onClose={() => setActiveSession(null)}
        />
      )}

      {/* Global animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes particle-float {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-30px) scale(0.5); opacity: 0; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
