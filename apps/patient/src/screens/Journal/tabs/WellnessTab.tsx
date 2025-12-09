/**
 * Wellness Tab - Comprehensive Rewrite
 * Features: Voice notes, symptoms, streaks, history, line charts, ambient sounds
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useWellnessHistory, type WellnessLog as FirestoreWellnessLog } from '../../../hooks/dashboard/useWellnessLog';
import {
  Moon,
  Heart,
  Wind,
  Play,
  Pause,
  X,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Brain,
  Waves,
  Star,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Sparkles,
  Plus,
  Minus,
  Mic,
  Square,
  Calendar,
  Flame,
  Check,
  AlertCircle,
  Loader2,
  CloudRain,
  TreePine,
} from 'lucide-react';
import { VitalityRing } from '../../../components/dashboard/VitalityRing';

// ============================================================================
// TYPES
// ============================================================================

interface WellnessLog {
  id: string;
  date: string;
  mood: number; // 1-10
  energy: number; // 1-10
  stress: number; // 1-10
  sleepQuality: number; // 1-10
  sleepHours: number;
  symptoms: string[];
  notes: string;
  voiceNoteUrl?: string;
  tags: string[];
  createdAt: string;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

interface MindfulnessModule {
  id: string;
  title: string;
  description: string;
  category: 'Focus' | 'Sleep' | 'Stress' | 'Vitality';
  duration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

type AmbientSound = 'none' | 'rain' | 'ocean' | 'forest' | 'fireplace' | 'brownnoise' | 'pinknoise' | 'singing-bowl' | 'theta' | 'nature' | 'stream';

// Audio file mappings
const AMBIENT_AUDIO_FILES: Record<Exclude<AmbientSound, 'none'>, string> = {
  rain: '/audio/ambience/12-Rain-Window.mp3',
  ocean: '/audio/ambience/6-Ocean-Waves.mp3',
  forest: '/audio/ambience/11-Forest-1.mp3',
  fireplace: '/audio/ambience/8-Fireplace.mp3',
  brownnoise: '/audio/ambience/19-Brown-Noise.mp3',
  pinknoise: '/audio/ambience/3-Pink-Noise.mp3',
  'singing-bowl': '/audio/ambience/10-Singing-Bowl.mp3',
  theta: '/audio/ambience/9-Theta-Waves.mp3',
  nature: '/audio/ambience/4-Nature-1.mp3',
  stream: '/audio/ambience/2-Gentle-Stream.mp3',
};

// Default sounds for each meditation module (matching JSON ambience URLs)
const MODULE_DEFAULT_SOUNDS: Record<string, AmbientSound> = {
  'mindfulness-01': 'nature',      // Morning Clarity → Dawn Chorus / Nature
  'mindfulness-02': 'stream',      // Lunch Break Reset → Gentle Stream
  'mindfulness-03': 'pinknoise',   // Power Nap → Pink Noise
  'mindfulness-04': 'nature',      // Walking Meditation → Nature
  'mindfulness-05': 'singing-bowl', // Breath Awareness → Heartbeat/Bowl
  'mindfulness-06': 'ocean',       // Deep Rest → Ocean Waves
  'mindfulness-07': 'ocean',       // Sleep Drift → Lake Water
  'mindfulness-08': 'fireplace',   // Evening Wind Down → Fireplace
  'mindfulness-09': 'theta',       // Body Scan for Sleep → Theta Waves
  'mindfulness-10': 'singing-bowl', // Pain Management → Singing Bowl
  'mindfulness-11': 'nature',      // Anxiety Release → Nature
  'mindfulness-12': 'rain',        // Commute Calm → Rain Window
  'mindfulness-13': 'nature',      // Gratitude Practice → Nature
  'mindfulness-14': 'forest',      // Loving Kindness → Forest
  'mindfulness-15': 'pinknoise',   // Focus Flow → Gamma Waves
  'mindfulness-16': 'singing-bowl', // Sound Bath → Crystal Bowl
  'mindfulness-17': 'rain',        // Rain Sounds → Rain
  'mindfulness-18': 'forest',      // Forest Ambience → Forest
  'mindfulness-19': 'brownnoise',  // Deep White Noise → Brown Noise
  'mindfulness-20': 'theta',       // Beta Waves → Beta Waves
};

// ============================================================================
// DATA SETUP
// ============================================================================

const today = new Date().toISOString().split('T')[0];

// Time range options
type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y';
const TIME_RANGES: TimeRange[] = ['1W', '1M', '3M', '6M', '1Y'];
const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  '1W': 7,
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
};

const mockStreak: StreakData = {
  currentStreak: 7,
  longestStreak: 14,
  lastActivityDate: today,
};

const SYMPTOM_OPTIONS = [
  'Headache', 'Fatigue', 'Anxiety', 'Nausea',
  'Insomnia', 'Dizziness', 'Back pain', 'Joint pain',
  'Brain fog', 'Bloating', 'Cramps', 'Congestion',
  'Shortness', 'Palpitations', 'Weakness', 'Chills',
];

const POSITIVE_TAGS = [
  'Gym', 'Sauna', 'Nature', 'Social',
  'Nutrition', 'Reading', 'Creative', 'Hydrated',
  'Meditation', 'Good sleep', 'Outdoors', 'Stretching',
  'Journaling', 'Music', 'Friends', 'Gratitude',
];

const NEGATIVE_TAGS = [
  'Conflict', 'Illness', 'Sedentary', 'Tired',
  'Poor sleep', 'No exercise', 'Stress', 'Skipped meal',
  'Alcohol', 'Anxious', 'Screens', 'Junk food',
  'Lonely', 'Rushed', 'Caffeine', 'Late night',
];

// All 20 Mindfulness Modules
const mindfulnessModules: MindfulnessModule[] = [
  // Vitality (5 modules)
  { id: 'mindfulness-01', title: 'Morning Clarity', description: 'Start your day with intention and a clear mind. A brief practice to set a positive tone for the hours ahead.', category: 'Vitality', duration: 5, difficulty: 'Beginner' },
  { id: 'mindfulness-02', title: 'Lunch Break Reset', description: 'A quick energy boost to overcome the midday slump. Clear mental fog and return to your day refreshed.', category: 'Vitality', duration: 5, difficulty: 'Beginner' },
  { id: 'mindfulness-03', title: 'Power Nap', description: 'Guided relaxation followed by a gentle wake-up call to recharge your battery without grogginess.', category: 'Vitality', duration: 20, difficulty: 'Beginner' },
  { id: 'mindfulness-04', title: 'Walking Meditation', description: 'Transform a simple walk into a grounding practice. Connect with your surroundings and your body in motion.', category: 'Vitality', duration: 15, difficulty: 'Intermediate' },
  { id: 'mindfulness-05', title: 'Breath Awareness', description: 'The fundamental practice of observing the breath. Builds focus and calms the nervous system.', category: 'Vitality', duration: 10, difficulty: 'Beginner' },
  // Sleep (5 modules)
  { id: 'mindfulness-06', title: 'Deep Rest', description: 'A guided body scan to help you release tension and drift into a state of deep relaxation.', category: 'Sleep', duration: 15, difficulty: 'Beginner' },
  { id: 'mindfulness-07', title: 'Sleep Drift', description: 'Visualize floating on calm waters under a starry sky. Designed to transition you seamlessly into sleep.', category: 'Sleep', duration: 20, difficulty: 'Beginner' },
  { id: 'mindfulness-08', title: 'Evening Wind Down', description: 'Process the day\'s events and mentally put them away, clearing space for a restful night.', category: 'Sleep', duration: 10, difficulty: 'Beginner' },
  { id: 'mindfulness-09', title: 'Body Scan for Sleep', description: 'Systematically relax every muscle group from toe to head, signaling safety to your nervous system.', category: 'Sleep', duration: 15, difficulty: 'Intermediate' },
  { id: 'mindfulness-10', title: 'Pain Management', description: 'Techniques to soften resistance to physical discomfort, allowing for greater ease and rest.', category: 'Sleep', duration: 15, difficulty: 'Advanced' },
  // Stress (4 modules)
  { id: 'mindfulness-11', title: 'Anxiety Release', description: 'Breathwork techniques to instantly lower cortisol levels and ground you in the present moment.', category: 'Stress', duration: 10, difficulty: 'Beginner' },
  { id: 'mindfulness-12', title: 'Commute Calm', description: 'Turn travel time into "me time". Release road rage or transit stress and arrive feeling composed.', category: 'Stress', duration: 10, difficulty: 'Beginner' },
  { id: 'mindfulness-13', title: 'Gratitude Practice', description: 'Shift your perspective from what is lacking to what is abundant. A powerful antidote to stress.', category: 'Stress', duration: 10, difficulty: 'Beginner' },
  { id: 'mindfulness-14', title: 'Loving Kindness', description: 'Cultivate feelings of compassion for yourself and others. Melts away anger and resentment.', category: 'Stress', duration: 15, difficulty: 'Intermediate' },
  // Focus (6 modules)
  { id: 'mindfulness-15', title: 'Focus Flow', description: 'A countdown technique to enter a state of deep, undistracted work. Ideal before starting a big project.', category: 'Focus', duration: 20, difficulty: 'Intermediate' },
  { id: 'mindfulness-16', title: 'Sound Bath', description: 'Immersive crystal singing bowls at 432Hz. Use for deep meditation or creative work.', category: 'Focus', duration: 30, difficulty: 'Advanced' },
  { id: 'mindfulness-17', title: 'Rain Sounds', description: 'Consistent, heavy rainfall on a roof. Natural white noise to block out distractions.', category: 'Focus', duration: 60, difficulty: 'Beginner' },
  { id: 'mindfulness-18', title: 'Forest Ambience', description: 'Birds, wind in the trees, and gentle rustling. Bring the calm of nature to your workspace.', category: 'Focus', duration: 45, difficulty: 'Beginner' },
  { id: 'mindfulness-19', title: 'Deep White Noise', description: 'Pure brown noise. A consistent, low-frequency hum that masks sudden sounds and aids concentration.', category: 'Focus', duration: 60, difficulty: 'Beginner' },
  { id: 'mindfulness-20', title: 'Beta Waves', description: 'Binaural beats designed to stimulate beta brainwave activity for active thinking and problem solving.', category: 'Focus', duration: 45, difficulty: 'Intermediate' },
];

// ============================================================================
// AMBIENT SOUND PLAYER (Real Audio Files)
// ============================================================================

class AmbientSoundPlayer {
  private audio: HTMLAudioElement | null = null;
  private currentSound: AmbientSound = 'none';

  play(type: AmbientSound, volume = 0.3): void {
    if (type === 'none') {
      this.stop();
      return;
    }

    // If same sound, just adjust volume
    if (this.audio && this.currentSound === type) {
      this.audio.volume = volume;
      if (this.audio.paused) {
        this.audio.play().catch(() => {});
      }
      return;
    }

    this.stop();

    const audioFile = AMBIENT_AUDIO_FILES[type];
    if (!audioFile) return;

    this.audio = new Audio(audioFile);
    this.audio.loop = true;
    this.audio.volume = volume;
    this.currentSound = type;

    // Fade in
    this.audio.volume = 0;
    this.audio.play().catch(() => {});

    // Gradual fade in over 1 second
    let fadeVolume = 0;
    const fadeInterval = setInterval(() => {
      fadeVolume += 0.05;
      if (this.audio && fadeVolume <= volume) {
        this.audio.volume = fadeVolume;
      } else {
        clearInterval(fadeInterval);
      }
    }, 50);
  }

  stop(): void {
    if (this.audio) {
      // Immediately stop - no fade to prevent race conditions
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.currentSound = 'none';
  }

  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  getCurrentSound(): AmbientSound {
    return this.currentSound;
  }
}

const ambientSound = new AmbientSoundPlayer();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split('T')[0]) return 'Today';
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-emerald-400';
  if (score >= 6) return 'text-cyan-400';
  if (score >= 4) return 'text-amber-400';
  return 'text-rose-400';
}

function getStressColor(score: number): string {
  // Inverse for stress - lower is better
  if (score <= 3) return 'text-emerald-400';
  if (score <= 5) return 'text-cyan-400';
  if (score <= 7) return 'text-amber-400';
  return 'text-rose-400';
}

// ============================================================================
// COMPONENTS
// ============================================================================

// Helper function to capitalize first letter
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Compact Score Display (no icons, clean design)
function ScoreDisplay({ log }: { log: WellnessLog }) {
  const scores = [
    { label: 'Mood', value: log.mood, color: getScoreColor(log.mood) },
    { label: 'Energy', value: log.energy, color: getScoreColor(log.energy) },
    { label: 'Stress', value: log.stress, color: getStressColor(log.stress) },
    { label: 'Sleep', value: log.sleepQuality, color: getScoreColor(log.sleepQuality), suffix: ` · ${log.sleepHours.toFixed(1)}h` },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mt-4">
      {scores.map(({ label, value, color, suffix }) => (
        <div key={label} className="text-center">
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium block mb-1">{label}</span>
          <div className={`text-xl font-bold ${color}`}>
            {value}
            <span className="text-xs text-text-muted font-normal">/10{suffix || ''}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Streak Display
function StreakDisplay({ streak }: { streak: StreakData }) {
  return (
    <div className="flex items-center justify-center gap-6 py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 border border-amber-500/20">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-amber-500/20">
          <Flame size={18} className="text-amber-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-amber-400">{streak.currentStreak}</div>
          <div className="text-[10px] text-text-muted uppercase tracking-wider">Day Streak</div>
        </div>
      </div>
      <div className="w-px h-10 bg-border" />
      <div className="text-center">
        <div className="text-lg font-bold text-text-primary">{streak.longestStreak}</div>
        <div className="text-[10px] text-text-muted uppercase tracking-wider">Best</div>
      </div>
    </div>
  );
}

// TrendChart Component - Fixed 0-10 scale for consistent comparison
function TrendChart({ data, color, height = 90 }: { data: number[]; color: string; height?: number }) {
  if (data.length < 2) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-text-muted text-xs">
        No data
      </div>
    );
  }

  const padding = 4;
  // Fixed scale from 0 to 10 for wellness metrics
  const minVal = 0;
  const maxVal = 10;
  const range = maxVal - minVal;

  // Generate polyline points string with fixed 0-10 scale - full width
  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (100 - padding * 2);
    const y = padding + (1 - (val - minVal) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  // Generate area polygon points (for fill)
  const areaPoints = [
    `${padding},${height - padding}`,
    ...data.map((val, i) => {
      const x = padding + (i / (data.length - 1)) * (100 - padding * 2);
      const y = padding + (1 - (val - minVal) / range) * (height - padding * 2);
      return `${x},${y}`;
    }),
    `${100 - padding},${height - padding}`,
  ].join(' ');

  const colorId = color.replace('#', '');

  // Calculate y positions for grid lines and labels
  const yTop = padding;
  const yMid = height / 2;
  const yBottom = height - padding;

  return (
    <div className="relative" style={{ height }}>
      {/* Y-axis labels - positioned with background for readability */}
      <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-between pointer-events-none z-10" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <span className="text-[9px] text-text-muted/60 leading-none bg-surface/80 px-0.5 rounded">10</span>
        <span className="text-[9px] text-text-muted/60 leading-none bg-surface/80 px-0.5 rounded">5</span>
        <span className="text-[9px] text-text-muted/60 leading-none bg-surface/80 px-0.5 rounded">0</span>
      </div>

      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        {/* Subtle gradient fill */}
        <defs>
          <linearGradient id={`fill-${colorId}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines at 0, 5, 10 */}
        <line x1={padding} y1={yTop} x2={100 - padding} y2={yTop} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        <line x1={padding} y1={yMid} x2={100 - padding} y2={yMid} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        <line x1={padding} y1={yBottom} x2={100 - padding} y2={yBottom} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />

        {/* Area fill */}
        <polygon points={areaPoints} fill={`url(#fill-${colorId})`} />

        {/* Main line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}


// Wellness Metric Card Component - Redesigned layout
function WellnessMetricCard({
  label,
  value,
  unit,
  change,
  changeGood,
  sparklineData,
  color,
  timeRangeLabel,
}: {
  label: string;
  value: string;
  unit: string;
  change: number; // Percentage change from previous period
  changeGood: boolean; // Whether this change direction is good for this metric
  sparklineData: number[];
  color: string;
  timeRangeLabel: string;
}) {
  // Determine color based on whether change is good
  const changeColor = change === 0
    ? 'text-text-muted'
    : changeGood
      ? 'text-emerald-400'
      : 'text-rose-400';

  const changeSign = change > 0 ? '+' : '';

  return (
    <div className="bg-surface rounded-2xl border border-border p-4">
      {/* Header - Label on left, Avg label + Score on right */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-text-primary">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">{timeRangeLabel} Avg:</span>
          <span className="text-xl font-bold text-text-primary">{value}</span>
          <span className="text-xs text-text-muted">{unit}</span>
          {change !== 0 && (
            <span className={`text-xs font-medium ${changeColor}`}>
              {changeSign}{change.toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Chart - Increased height */}
      <TrendChart data={sparklineData} color={color} height={100} />
    </div>
  );
}

// Helper to extract metric data for a time range
function getMetricSparkline(
  history: Record<string, WellnessLog>,
  metric: keyof Pick<WellnessLog, 'mood' | 'energy' | 'stress' | 'sleepQuality'>,
  days: number
): number[] {
  const data: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const log = history[dateStr];
    if (log) {
      data.push(log[metric]);
    }
  }
  return data;
}

// Downsample to fixed points for smooth display
function downsampleData(data: number[], targetPoints: number = 30): number[] {
  if (data.length <= targetPoints) return data;

  const chunkSize = data.length / targetPoints;
  const result: number[] = [];

  for (let i = 0; i < targetPoints; i++) {
    const start = Math.floor(i * chunkSize);
    const end = Math.floor((i + 1) * chunkSize);
    const chunk = data.slice(start, end);
    const avg = chunk.reduce((sum, val) => sum + val, 0) / chunk.length;
    result.push(avg);
  }

  return result;
}


// Time range labels for display
const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  '1W': 'Weekly',
  '1M': 'Monthly',
  '3M': '3-Month',
  '6M': '6-Month',
  '1Y': 'Yearly',
};

// Calculate average of an array
function calculateAverage(data: number[]): number {
  if (data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
}

// Calculate percentage change between current and previous period
function calculatePeriodChange(
  history: Record<string, WellnessLog>,
  metric: keyof Pick<WellnessLog, 'mood' | 'energy' | 'stress' | 'sleepQuality'>,
  days: number
): { currentAvg: number; change: number } {
  // Get current period data
  const currentData = getMetricSparkline(history, metric, days);
  const currentAvg = calculateAverage(currentData);

  // Get previous period data (same length, starting from end of current period)
  const previousData: number[] = [];
  for (let i = days * 2 - 1; i >= days; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const log = history[dateStr];
    if (log) {
      previousData.push(log[metric]);
    }
  }
  const previousAvg = calculateAverage(previousData);

  // Calculate percentage change
  if (previousAvg === 0) return { currentAvg, change: 0 };
  const change = ((currentAvg - previousAvg) / previousAvg) * 100;

  return { currentAvg, change };
}

// Wellness Trends Section - 4 individual metric cards
function WellnessTrends({ history }: { history: Record<string, WellnessLog> }) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const days = TIME_RANGE_DAYS[timeRange];
  const timeRangeLabel = TIME_RANGE_LABELS[timeRange];

  // Extract and downsample data for sparklines
  const moodData = downsampleData(getMetricSparkline(history, 'mood', days));
  const energyData = downsampleData(getMetricSparkline(history, 'energy', days));
  const stressData = downsampleData(getMetricSparkline(history, 'stress', days));
  const sleepData = downsampleData(getMetricSparkline(history, 'sleepQuality', days));

  // Calculate period averages and changes
  const moodStats = calculatePeriodChange(history, 'mood', days);
  const energyStats = calculatePeriodChange(history, 'energy', days);
  const stressStats = calculatePeriodChange(history, 'stress', days);
  const sleepStats = calculatePeriodChange(history, 'sleepQuality', days);

  // Determine if change is good (for coloring)
  // Mood up = good, Energy up = good, Stress down = good, Sleep up = good
  const moodChangeGood = moodStats.change >= 0;
  const energyChangeGood = energyStats.change >= 0;
  const stressChangeGood = stressStats.change <= 0; // Stress decreasing is GOOD
  const sleepChangeGood = sleepStats.change >= 0;

  return (
    <div className="space-y-4">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <TrendingUp size={14} className="text-cyan-400" />
          Wellness Trends
        </h3>
        <div className="flex gap-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                timeRange === range
                  ? 'bg-white/10 text-text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Metric Cards in vertical stack */}
      <div className="space-y-3">
        <WellnessMetricCard
          label="Mood"
          value={moodStats.currentAvg.toFixed(1)}
          unit="/10"
          change={moodStats.change}
          changeGood={moodChangeGood}
          sparklineData={moodData}
          color="#10b981"
          timeRangeLabel={timeRangeLabel}
        />
        <WellnessMetricCard
          label="Energy"
          value={energyStats.currentAvg.toFixed(1)}
          unit="/10"
          change={energyStats.change}
          changeGood={energyChangeGood}
          sparklineData={energyData}
          color="#f59e0b"
          timeRangeLabel={timeRangeLabel}
        />
        <WellnessMetricCard
          label="Stress"
          value={stressStats.currentAvg.toFixed(1)}
          unit="/10"
          change={stressStats.change}
          changeGood={stressChangeGood}
          sparklineData={stressData}
          color="#f43f5e"
          timeRangeLabel={timeRangeLabel}
        />
        <WellnessMetricCard
          label="Sleep Quality"
          value={sleepStats.currentAvg.toFixed(1)}
          unit="/10"
          change={sleepStats.change}
          changeGood={sleepChangeGood}
          sparklineData={sleepData}
          color="#8b5cf6"
          timeRangeLabel={timeRangeLabel}
        />
      </div>
    </div>
  );
}

// History Calendar
function HistoryCalendar({
  history,
  selectedDate,
  onSelectDate,
}: {
  history: Record<string, WellnessLog>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const [weekOffset, setWeekOffset] = useState(0);

  const getWeekDays = () => {
    const days: { date: string; dayNum: number; dayName: string; hasLog: boolean }[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weekOffset * 7));

    for (let i = 6; i >= 0; i--) {
      const date = new Date(startDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        dayNum: date.getDate(),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2),
        hasLog: !!history[dateStr],
      });
    }
    return days;
  };

  const weekDays = getWeekDays();
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="rounded-2xl p-4 bg-surface border border-border">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setWeekOffset(w => w + 1)}
          className="p-2 rounded-xl bg-surface-2 border border-border text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Calendar size={14} className="text-violet-400" />
          History
        </h3>
        <button
          onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
          disabled={weekOffset === 0}
          className="p-2 rounded-xl bg-surface-2 border border-border text-text-muted hover:text-text-primary transition-colors disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const isSelected = day.date === selectedDate;
          const isToday = day.date === todayStr;
          return (
            <button
              key={day.date}
              onClick={() => onSelectDate(day.date)}
              className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
                isSelected
                  ? 'bg-violet-500/20 border border-violet-500/40'
                  : day.hasLog
                    ? 'bg-surface-2 border border-border hover:border-violet-500/30'
                    : 'bg-surface-2/50 border border-transparent opacity-50'
              }`}
            >
              <span className="text-[9px] text-text-muted uppercase">{day.dayName}</span>
              <span className={`text-sm font-bold ${isToday ? 'text-violet-400' : 'text-text-primary'}`}>
                {day.dayNum}
              </span>
              {day.hasLog && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Voice Recorder Component
function VoiceRecorder({
  onRecordingComplete,
}: {
  onRecordingComplete: (audioUrl: string) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } catch {
      console.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-400 hover:bg-rose-500/20 transition-all"
          >
            <Mic size={16} />
            <span className="text-sm font-medium">Record Voice Note</span>
          </button>
        )}

        {isRecording && (
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-sm font-bold text-rose-400 tabular-nums">{formatTime(recordingTime)}</span>
            </div>
            <button
              onClick={stopRecording}
              className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 transition-all"
            >
              <Square size={16} fill="currentColor" />
            </button>
          </div>
        )}

        {audioUrl && !isRecording && (
          <div className="flex items-center gap-3 flex-1">
            <audio src={audioUrl} controls className="flex-1 h-10" />
            <button
              onClick={() => {
                setAudioUrl(null);
                onRecordingComplete('');
              }}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-text-muted hover:text-rose-400 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Body Signals Selector (FDA-friendly naming - avoiding "symptoms")
function BodySignalsSelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (signals: string[]) => void;
}) {
  const toggle = (signal: string) => {
    onChange(
      selected.includes(signal)
        ? selected.filter(s => s !== signal)
        : [...selected, signal]
    );
  };

  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
      <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
        <AlertCircle size={14} className="text-amber-400" />
        How does your body feel?
      </h4>
      <div className="grid grid-cols-4 gap-2">
        {SYMPTOM_OPTIONS.map((signal) => (
          <button
            key={signal}
            onClick={() => toggle(signal)}
            className={`py-2 rounded-lg text-xs font-medium text-center transition-all ${
              selected.includes(signal)
                ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                : 'bg-white/[0.04] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.06]'
            }`}
          >
            {capitalize(signal)}
          </button>
        ))}
      </div>
    </div>
  );
}

// Rating Slider - Glassmorphism design matching app aesthetic
function RatingSlider({
  label,
  value,
  onChange,
  color,
  lowLabel = 'Low',
  highLabel = 'High',
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
  lowLabel?: string;
  highLabel?: string;
}) {
  const colorMap: Record<string, { text: string; fill: string; glow: string }> = {
    pink: { text: 'text-pink-400', fill: '#ec4899', glow: 'rgba(236, 72, 153, 0.3)' },
    violet: { text: 'text-violet-400', fill: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.3)' },
    orange: { text: 'text-orange-400', fill: '#f97316', glow: 'rgba(249, 115, 22, 0.3)' },
    cyan: { text: 'text-cyan-400', fill: '#06b6d4', glow: 'rgba(6, 182, 212, 0.3)' },
    amber: { text: 'text-amber-400', fill: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' },
    emerald: { text: 'text-emerald-400', fill: '#10b981', glow: 'rgba(16, 185, 129, 0.3)' },
    rose: { text: 'text-rose-400', fill: '#f43f5e', glow: 'rgba(244, 63, 94, 0.3)' },
  };
  const c = colorMap[color] || colorMap.violet;
  const percentage = ((value - 1) / 9) * 100;

  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-text-primary">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className={`text-2xl font-bold ${c.text}`}>{value}</span>
          <span className="text-xs text-text-muted/60">/10</span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="slider-glass w-full h-3 rounded-full appearance-none cursor-pointer relative z-10"
          style={{
            background: `linear-gradient(to right, ${c.fill}25 0%, ${c.fill}70 ${percentage}%, rgba(255,255,255,0.04) ${percentage}%)`,
          }}
        />
        <div className="flex justify-between mt-2 px-0.5">
          <span className="text-[10px] text-text-muted/50 font-medium">{lowLabel}</span>
          <span className="text-[10px] text-text-muted/50 font-medium">{highLabel}</span>
        </div>
      </div>
    </div>
  );
}

// Wellness Log Modal
function WellnessLogModal({
  onClose,
  onSave,
  existingLog,
  selectedDate,
  isSaving,
}: {
  onClose: () => void;
  onSave: (log: Partial<WellnessLog>) => void;
  existingLog?: WellnessLog | null;
  selectedDate: string;
  isSaving: boolean;
}) {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState(existingLog?.mood || 7);
  const [energy, setEnergy] = useState(existingLog?.energy || 7);
  const [stress, setStress] = useState(existingLog?.stress || 4);
  const [sleepQuality, setSleepQuality] = useState(existingLog?.sleepQuality || 7);
  const [sleepHours, setSleepHours] = useState(existingLog?.sleepHours || 7);
  const [symptoms, setSymptoms] = useState<string[]>(existingLog?.symptoms || []);
  const [tags, setTags] = useState<string[]>(existingLog?.tags || []);
  const [notes, setNotes] = useState(existingLog?.notes || '');
  const [voiceNoteUrl, setVoiceNoteUrl] = useState(existingLog?.voiceNoteUrl || '');

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const formatSleepTime = (hours: number): string => {
    // Round to nearest 15 minutes (0.25 hours) to avoid floating point issues
    const roundedHours = Math.round(hours * 4) / 4;
    const h = Math.floor(roundedHours);
    const m = Math.round((roundedHours - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#0d0d12]/95 rounded-2xl border border-white/[0.06] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="relative p-5 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.02]">
          <div>
            <h2 className="text-lg font-bold text-text-primary mb-1.5">
              {existingLog ? 'Edit' : 'Log'} Wellness · {formatDate(selectedDate)}
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`h-1.5 w-6 rounded-full transition-all ${step >= s ? 'bg-violet-500/80' : 'bg-white/[0.06]'}`} />
                ))}
              </div>
              <span className="text-xs text-text-muted/60 font-medium">Step {step} of 3</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-text-muted hover:text-text-primary hover:bg-white/[0.08] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-y-auto p-5 space-y-3">
          {step === 1 && (
            <>
              <RatingSlider label="Mood" color="emerald" value={mood} onChange={setMood} lowLabel="Low" highLabel="Great" />
              <RatingSlider label="Energy" color="amber" value={energy} onChange={setEnergy} lowLabel="Tired" highLabel="Energized" />
              <RatingSlider label="Stress" color="rose" value={stress} onChange={setStress} lowLabel="Calm" highLabel="Stressed" />
              <RatingSlider label="Sleep Quality" color="violet" value={sleepQuality} onChange={setSleepQuality} lowLabel="Poor" highLabel="Excellent" />

              {/* Sleep Hours */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
                <button
                  onClick={() => setSleepHours(Math.max(3, sleepHours - 0.25))}
                  className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/[0.08] text-text-primary transition-all hover:bg-white/[0.08] active:scale-95"
                >
                  <Minus size={18} />
                </button>
                <div className="text-center">
                  <span className="text-3xl font-bold text-text-primary">{formatSleepTime(sleepHours)}</span>
                  <span className="text-[10px] text-text-muted/60 block mt-1 uppercase tracking-wider font-medium">Sleep Duration</span>
                </div>
                <button
                  onClick={() => setSleepHours(Math.min(12, sleepHours + 0.25))}
                  className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/[0.08] text-text-primary transition-all hover:bg-white/[0.08] active:scale-95"
                >
                  <Plus size={18} />
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Positive Tags */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Sparkles size={14} className="text-emerald-400" />
                  What helped today?
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {POSITIVE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`py-2 rounded-lg text-xs font-medium text-center transition-all ${
                        tags.includes(tag)
                          ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                          : 'bg-white/[0.04] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.06]'
                      }`}
                    >
                      {capitalize(tag)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Negative Tags */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Heart size={14} className="text-rose-400" />
                  What was challenging?
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {NEGATIVE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`py-2 rounded-lg text-xs font-medium text-center transition-all ${
                        tags.includes(tag)
                          ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
                          : 'bg-white/[0.04] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.06]'
                      }`}
                    >
                      {capitalize(tag)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body Signals (FDA-friendly) */}
              <BodySignalsSelector selected={symptoms} onChange={setSymptoms} />
            </>
          )}

          {step === 3 && (
            <>
              {/* Voice Note */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Mic size={14} className="text-rose-400" />
                  Voice Note (optional)
                </h4>
                <VoiceRecorder onRecordingComplete={setVoiceNoteUrl} />
              </div>

              {/* Text Notes */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                <h4 className="text-sm font-semibold text-text-primary">Notes (optional)</h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How are you feeling? Any thoughts to capture..."
                  className="w-full h-28 px-4 py-3 rounded-xl text-sm bg-white/[0.03] border border-white/[0.06] text-text-primary placeholder-text-muted/50 resize-none focus:outline-none focus:border-violet-500/30 transition-colors"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="relative p-5 border-t border-white/[0.06]">
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-5 py-3 rounded-xl font-semibold text-sm bg-white/[0.05] border border-white/[0.08] text-text-primary transition-all hover:bg-white/[0.08] active:scale-[0.98]"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-violet-500/20 border border-violet-500/30 text-violet-300 transition-all hover:bg-violet-500/25 active:scale-[0.98] backdrop-blur-sm"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={() => {
                  onSave({
                    date: selectedDate,
                    mood,
                    energy,
                    stress,
                    sleepQuality,
                    sleepHours,
                    symptoms,
                    tags,
                    notes,
                    voiceNoteUrl: voiceNoteUrl || undefined,
                  });
                }}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition-all hover:bg-emerald-500/25 active:scale-[0.98] backdrop-blur-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Save Check-in
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Particle Swarm Animation (CSS-based version of framer-motion original)
type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'relax';

const PARTICLE_COUNT = 60;

// Pre-generate particles with fixed seeds
const particles = Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
  id: i,
  angle: (i * 137.5 * Math.PI) / 180, // Phyllotaxis golden angle
  size: 2 + (i % 4),
  delay: (i % 10) * 0.05,
}));

function ParticleSwarm({ phase, color, isPlaying }: { phase: BreathPhase; color: string; isPlaying: boolean }) {
  const getParticleStyle = (p: typeof particles[0]): React.CSSProperties => {
    let spread = 60;
    let opacity = 0.6;
    let scale = 1;

    if (isPlaying) {
      switch (phase) {
        case 'inhale':
          spread = 140 + (p.id % 7) * 5;
          opacity = 0.4;
          scale = 1.2;
          break;
        case 'hold':
          spread = 150 + (p.id % 5) * 4;
          opacity = 0.3;
          scale = 1.3;
          break;
        case 'exhale':
          spread = 20 + (p.id % 5) * 3;
          opacity = 0.9;
          scale = 0.8;
          break;
        case 'relax':
          spread = 60 + (p.id % 7) * 4;
          opacity = 0.6;
          scale = 1;
          break;
      }
    }

    const x = Math.cos(p.angle) * spread;
    const y = Math.sin(p.angle) * spread;

    return {
      position: 'absolute',
      width: p.size,
      height: p.size,
      backgroundColor: color,
      boxShadow: `0 0 10px ${color}`,
      borderRadius: '50%',
      filter: 'blur(1px)',
      transform: `translate(${x}px, ${y}px) scale(${scale})`,
      opacity,
      transition: `all 4s ease-out`,
      transitionDelay: `${p.delay}s`,
    };
  };

  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      {/* Particles */}
      {particles.map((p) => (
        <div key={p.id} style={getParticleStyle(p)} />
      ))}

      {/* Inner Glow Core */}
      <div
        className="absolute rounded-full blur-2xl transition-all duration-[4000ms] ease-in-out"
        style={{
          width: phase === 'exhale' ? '80px' : '160px',
          height: phase === 'exhale' ? '80px' : '160px',
          backgroundColor: color,
          opacity: phase === 'exhale' ? 0.5 : 0.2,
        }}
      />
    </div>
  );
}

// Breathing Animation with Particle Swarm
function BreathingAnimation({ isPlaying, color }: { isPlaying: boolean; color: string }) {
  const [phase, setPhase] = useState<BreathPhase>('relax');
  const [message, setMessage] = useState('PREPARE FOR RELAXATION...');

  useEffect(() => {
    if (!isPlaying) {
      setPhase('relax');
      setMessage('PREPARE FOR RELAXATION...');
      return;
    }

    // Box breathing pattern: 4-4-4-4
    const phases: { phase: BreathPhase; duration: number; message: string }[] = [
      { phase: 'inhale', duration: 4000, message: 'BREATHE IN...' },
      { phase: 'hold', duration: 4000, message: 'HOLD...' },
      { phase: 'exhale', duration: 4000, message: 'EXHALE...' },
      { phase: 'relax', duration: 4000, message: 'RELAX...' },
    ];

    let phaseIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const runPhase = () => {
      const current = phases[phaseIndex];
      setPhase(current.phase);
      setMessage(current.message);
      phaseIndex = (phaseIndex + 1) % phases.length;
      timeoutId = setTimeout(runPhase, current.duration);
    };

    runPhase();

    return () => clearTimeout(timeoutId);
  }, [isPlaying]);

  const colors: Record<string, { primary: string; glow: string }> = {
    cyan: { primary: '#22D3EE', glow: 'rgba(34, 211, 238, 0.4)' },
    purple: { primary: '#A78BFA', glow: 'rgba(167, 139, 250, 0.4)' },
    emerald: { primary: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' },
    amber: { primary: '#FBBF24', glow: 'rgba(251, 191, 36, 0.4)' },
  };

  const c = colors[color] || colors.cyan;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <ParticleSwarm phase={phase} color={c.primary} isPlaying={isPlaying} />

      {/* Instruction */}
      {isPlaying && (
        <div
          className="absolute bottom-8 text-center text-2xl font-light tracking-widest uppercase transition-opacity duration-500"
          style={{
            color: c.primary,
            textShadow: `0 0 15px ${c.glow}`,
            opacity: 1,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

// Mindfulness Player
function MindfulnessPlayer({
  module,
  onClose,
}: {
  module: MindfulnessModule;
  onClose: () => void;
}) {
  // Get default sound for this module
  const defaultSound = MODULE_DEFAULT_SOUNDS[module.id] || 'none';

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedSound, setSelectedSound] = useState<AmbientSound>(defaultSound);
  const [soundVolume, setSoundVolume] = useState(0.4);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Lock body scroll when modal is open and stop sound on unmount
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
      // Always stop ambient sound when modal closes
      ambientSound.stop();
    };
  }, []);

  const totalSeconds = module.duration * 60;
  const categoryColors = getCategoryColor(module.category);
  const colorKey = module.category === 'Vitality' ? 'cyan' : module.category === 'Sleep' ? 'purple' : module.category === 'Stress' ? 'emerald' : 'amber';

  // Rich sound options using real audio files
  const soundOptions: { id: AmbientSound | 'default'; label: string; icon: typeof CloudRain }[] = [
    { id: 'default', label: 'Default', icon: Sparkles },
    { id: 'none', label: 'Silent', icon: VolumeX },
    { id: 'rain', label: 'Rain', icon: CloudRain },
    { id: 'ocean', label: 'Ocean', icon: Waves },
    { id: 'forest', label: 'Forest', icon: TreePine },
    { id: 'fireplace', label: 'Fire', icon: Flame },
    { id: 'singing-bowl', label: 'Bowl', icon: Star },
  ];

  useEffect(() => {
    // Always stop current sound first when any dependency changes
    ambientSound.stop();

    if (isPlaying) {
      // Only play if not 'none'
      if (selectedSound !== 'none') {
        ambientSound.play(selectedSound, soundVolume);
      }
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 1;
          setProgress((next / totalSeconds) * 100);
          if (next >= totalSeconds) {
            setIsPlaying(false);
            ambientSound.stop();
            return totalSeconds;
          }
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      ambientSound.stop();
    };
  }, [isPlaying, selectedSound, soundVolume, totalSeconds]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const IconComponent = getCategoryIcon(module.category);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#0a0a0f] overflow-hidden" style={{ width: '100vw', height: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button onClick={onClose} className="p-2.5 -ml-2 rounded-xl text-white/70 hover:bg-white/5">
          <X size={24} />
        </button>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            value={soundVolume * 100}
            onChange={(e) => {
              const vol = parseInt(e.target.value) / 100;
              setSoundVolume(vol);
              ambientSound.setVolume(vol);
            }}
            className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
          />
          <Volume2 size={18} className="text-white/50" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className={`mb-3 p-3 rounded-2xl ${categoryColors.bg} ${categoryColors.border} border`}>
          <IconComponent size={24} className={categoryColors.text} />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">{module.title}</h2>
        <p className="text-sm text-white/60 mb-6">{module.description}</p>

        {/* Sound Selector */}
        <div className="grid grid-cols-7 gap-1.5 mb-8 w-full max-w-md">
          {soundOptions.map(({ id, label, icon: SoundIcon }) => {
            const actualSound = id === 'default' ? defaultSound : id;
            const isSelected = id === 'default'
              ? selectedSound === defaultSound
              : selectedSound === id;
            return (
              <button
                key={id}
                onClick={() => {
                  const soundToPlay = id === 'default' ? defaultSound : id;
                  setSelectedSound(soundToPlay);
                  if (isPlaying) {
                    ambientSound.stop();
                    if (soundToPlay !== 'none') ambientSound.play(soundToPlay, soundVolume);
                  }
                }}
                className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-white/10 border border-white/20'
                    : 'bg-white/5 border border-transparent hover:bg-white/10'
                }`}
              >
                <SoundIcon size={16} className={isSelected ? 'text-white' : 'text-white/50'} />
                <span className={`text-[10px] ${isSelected ? 'text-white' : 'text-white/50'}`}>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Breathing */}
        <BreathingAnimation isPlaying={isPlaying} color={colorKey} />

        {/* Time */}
        <div className="mt-8 text-center">
          <span className="text-3xl font-light text-white tabular-nums">{formatTime(currentTime)}</span>
          <span className="text-lg text-white/40"> / {formatTime(totalSeconds)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-8 pb-10">
        <div className="mb-6">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${categoryColors.hex}80, ${categoryColors.hex})`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-8">
          <button
            onClick={() => setCurrentTime(Math.max(0, currentTime - 15))}
            className="flex flex-col items-center gap-0.5 p-2 text-white/50 hover:text-white transition-colors"
          >
            <SkipBack size={20} />
            <span className="text-[9px] font-medium">15s</span>
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${categoryColors.hex}30, ${categoryColors.hex}15)`,
              border: `2px solid ${categoryColors.hex}50`,
            }}
          >
            {isPlaying ? (
              <Pause size={28} className={categoryColors.text} />
            ) : (
              <Play size={28} className={`${categoryColors.text} ml-1`} />
            )}
          </button>

          <button
            onClick={() => setCurrentTime(Math.min(totalSeconds, currentTime + 15))}
            className="flex flex-col items-center gap-0.5 p-2 text-white/50 hover:text-white transition-colors"
          >
            <SkipForward size={20} />
            <span className="text-[9px] font-medium">15s</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Get category gradient for fancy cards
function getCategoryGradient(category: string): string {
  const gradients: Record<string, string> = {
    Vitality: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    Sleep: 'from-purple-500/20 via-pink-500/10 to-transparent',
    Stress: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    Focus: 'from-amber-500/20 via-orange-500/10 to-transparent',
  };
  return gradients[category] || 'from-gray-500/10 to-transparent';
}

// Fancy Mindfulness Card (Neuro-Library design)
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
  const IconComponent = getCategoryIcon(module.category);
  const gradient = getCategoryGradient(module.category);

  return (
    <div
      className="group flex flex-col gap-4 p-5 bg-surface rounded-2xl transition-all duration-500 text-left relative overflow-hidden h-full backdrop-blur-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-border"
    >
      {/* Category-specific color tint overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-40 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none`}
      />

      {/* Deep dark shading at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-70" />

      {/* Header */}
      <div className="flex justify-between items-start w-full z-10">
        <div className="flex items-start gap-2">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-surface-2 border border-border ${colors.text} shadow-lg group-hover:scale-105 transition-transform`}
          >
            <IconComponent size={24} />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="z-20 p-2 rounded-xl transition-all hover:scale-110 active:scale-95"
            style={{
              background: isFavorite
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))'
                : 'rgba(0, 0, 0, 0.3)',
              border: isFavorite
                ? '1px solid rgba(245, 158, 11, 0.4)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Star
              size={14}
              className={isFavorite ? 'text-amber-400' : 'text-gray-500'}
              fill={isFavorite ? '#f59e0b' : 'none'}
            />
          </button>
        </div>

        {/* Difficulty Badge */}
        <span
          className="text-[10px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wider"
          style={{
            background:
              module.difficulty === 'Advanced'
                ? 'rgba(239, 68, 68, 0.1)'
                : module.difficulty === 'Intermediate'
                  ? 'rgba(251, 146, 60, 0.1)'
                  : 'rgba(34, 197, 94, 0.1)',
            borderColor:
              module.difficulty === 'Advanced'
                ? 'rgba(239, 68, 68, 0.3)'
                : module.difficulty === 'Intermediate'
                  ? 'rgba(251, 146, 60, 0.3)'
                  : 'rgba(34, 197, 94, 0.3)',
            color:
              module.difficulty === 'Advanced'
                ? '#fca5a5'
                : module.difficulty === 'Intermediate'
                  ? '#fdba74'
                  : '#86efac',
          }}
        >
          {module.difficulty || 'Beginner'}
        </span>
      </div>

      {/* Clickable area for playing session */}
      <button
        onClick={onPlay}
        className="absolute inset-0 z-10"
        aria-label={`Play ${module.title}`}
      />

      {/* Title and Description */}
      <div className="flex-1 z-10 relative pointer-events-none">
        <h4 className="text-base font-bold text-text-primary group-hover:text-cyan-300 transition-colors mb-1">
          {module.title}
        </h4>
        <p className="text-xs text-text-muted leading-relaxed">{module.description}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 z-10 border-t border-border pt-3 w-full mt-auto relative pointer-events-none">
        <Play size={14} className="text-text-muted" fill="currentColor" />
        <span className="text-xs font-bold text-text-muted">{module.duration} min</span>
        <div className="flex-1" />
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg ${colors.bg} ${colors.text} w-20 text-center`}
        >
          {module.category}
        </span>
      </div>
    </div>
  );
}

// Empty State
function EmptyState({ date, onLog }: { date: string; onLog: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
        <Heart size={28} className="text-violet-400" />
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">No check-in for {formatDate(date)}</h3>
      <p className="text-sm text-text-muted mb-6 max-w-xs">
        Track your mood, energy, and sleep to see patterns and improve your wellbeing.
      </p>
      <button
        onClick={onLog}
        className="px-6 py-3 rounded-xl font-semibold text-sm bg-violet-500/15 border border-violet-500/30 text-violet-300 transition-all hover:bg-violet-500/20 active:scale-[0.98] backdrop-blur-sm"
      >
        Log Today&apos;s Wellness
      </button>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function WellnessTab() {
  const { patientId } = useAuth();
  const { data: firestoreHistory, isLoading } = useWellnessHistory(patientId);

  // Convert Firestore data to local WellnessLog format
  const history = useMemo(() => {
    if (!firestoreHistory) return {};
    const converted: Record<string, WellnessLog> = {};
    Object.entries(firestoreHistory).forEach(([date, log]) => {
      converted[date] = {
        id: log.id,
        date: log.date,
        mood: log.mood,
        energy: log.energy,
        stress: log.stress,
        sleepQuality: log.sleepQuality,
        sleepHours: log.sleepHours ?? 7,
        symptoms: log.symptoms ?? [],
        notes: log.notes ?? '',
        tags: log.tags ?? [],
        createdAt: new Date().toISOString(),
      };
    });
    return converted;
  }, [firestoreHistory]);

  const [localHistory, setLocalHistory] = useState<Record<string, WellnessLog>>({});
  const [streak, setStreak] = useState<StreakData>(mockStreak);
  const [selectedDate, setSelectedDate] = useState(today);
  const [showLogModal, setShowLogModal] = useState(false);
  const [activeSession, setActiveSession] = useState<MindfulnessModule | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['mindfulness-11', 'mindfulness-06']);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Merge Firestore history with local (newly saved) history
  const mergedHistory = useMemo(() => ({ ...history, ...localHistory }), [history, localHistory]);

  const selectedLog = mergedHistory[selectedDate] || null;

  const handleSaveLog = useCallback(async (data: Partial<WellnessLog>) => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const newLog: WellnessLog = {
      id: selectedDate,
      date: selectedDate,
      mood: data.mood || 7,
      energy: data.energy || 7,
      stress: data.stress || 4,
      sleepQuality: data.sleepQuality || 7,
      sleepHours: data.sleepHours || 7,
      symptoms: data.symptoms || [],
      notes: data.notes || '',
      voiceNoteUrl: data.voiceNoteUrl,
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
    };

    setLocalHistory(prev => ({ ...prev, [selectedDate]: newLog }));
    setIsSaving(false);
    setShowLogModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    // Update streak if logging today
    if (selectedDate === today) {
      setStreak(prev => ({
        ...prev,
        currentStreak: prev.currentStreak + 1,
        lastActivityDate: today,
      }));
    }
  }, [selectedDate]);

  return (
    <div className="space-y-5 pb-4">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-sm font-medium flex items-center gap-2 animate-fadeIn">
          <Check size={16} />
          Check-in saved!
        </div>
      )}

      {/* Vitality Section with Scores Below */}
      <div className="rounded-2xl p-5 bg-surface border border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="mb-4">
          <h3 className="text-base font-bold text-text-primary">{formatDate(selectedDate)}&apos;s Wellness</h3>
        </div>

        {selectedLog ? (
          <>
            <div className="flex justify-center">
              <VitalityRing
                wellnessLog={{
                  id: selectedLog.id,
                  date: selectedLog.date,
                  mood: selectedLog.mood,
                  energy: selectedLog.energy,
                  stress: selectedLog.stress,
                  sleepQuality: selectedLog.sleepQuality,
                  symptoms: selectedLog.symptoms,
                  notes: selectedLog.notes || null,
                }}
                size={160}
                strokeWidth={10}
                variant={4}
                animation={1}
              />
            </div>
            <ScoreDisplay log={selectedLog} />

            {/* Tags + Body signals row with Log button */}
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
              {/* Tags and body signals on the left - sorted by length (shorter first) */}
              <div className="flex-1 flex flex-wrap gap-1.5">
                {/* Positive/Negative Tags - sorted by length */}
                {[...selectedLog.tags].sort((a, b) => a.length - b.length).map(t => {
                  const isNegative = NEGATIVE_TAGS.includes(t);
                  return (
                    <span
                      key={t}
                      className={`min-w-[88px] px-2.5 py-1 rounded-lg text-[11px] font-medium text-center ${
                        isNegative
                          ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                          : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {capitalize(t)}
                    </span>
                  );
                })}
                {/* Body signals - sorted by length */}
                {[...selectedLog.symptoms].sort((a, b) => a.length - b.length).map(s => (
                  <span key={s} className="min-w-[88px] px-2.5 py-1 rounded-lg text-[11px] font-medium text-center bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    {capitalize(s)}
                  </span>
                ))}
              </div>
              {/* Log/Edit button on the right */}
              <button
                onClick={() => setShowLogModal(true)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-violet-500/15 border border-violet-500/30 text-violet-300 transition-all hover:bg-violet-500/20 active:scale-[0.98] whitespace-nowrap backdrop-blur-sm"
              >
                {selectedLog ? 'Edit Log' : 'Log Now'}
              </button>
            </div>
          </>
        ) : (
          <EmptyState date={selectedDate} onLog={() => setShowLogModal(true)} />
        )}
      </div>

      {/* Streak Display */}
      <StreakDisplay streak={streak} />

      {/* Mindfulness Section (Neuro-Library) */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
            <Brain size={18} />
          </div>
          <h3 className="text-sm font-bold uppercase text-text-primary tracking-widest">Neuro-Library</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mindfulnessModules.map((module) => (
            <MindfulnessCard
              key={module.id}
              module={module}
              isFavorite={favoriteIds.includes(module.id)}
              onToggleFavorite={() => setFavoriteIds(prev =>
                prev.includes(module.id) ? prev.filter(f => f !== module.id) : [...prev, module.id]
              )}
              onPlay={() => setActiveSession(module)}
            />
          ))}
        </div>
      </div>

      {/* History Calendar */}
      <HistoryCalendar
        history={mergedHistory}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Weekly Line Chart */}
      <WellnessTrends history={mergedHistory} />

      {/* Modals */}
      {showLogModal && (
        <WellnessLogModal
          onClose={() => setShowLogModal(false)}
          onSave={handleSaveLog}
          existingLog={selectedLog}
          selectedDate={selectedDate}
          isSaving={isSaving}
        />
      )}

      {activeSession && (
        <MindfulnessPlayer
          module={activeSession}
          onClose={() => setActiveSession(null)}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }

        /* Glassmorphism slider styling */
        .slider-glass::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.1);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .slider-glass::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 3px rgba(255,255,255,0.15);
        }
        .slider-glass::-webkit-slider-thumb:active {
          transform: scale(0.95);
        }
        .slider-glass::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.1);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .slider-glass::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 3px rgba(255,255,255,0.15);
        }
        .slider-glass:focus {
          outline: none;
        }
        .slider-glass::-webkit-slider-runnable-track {
          border-radius: 9999px;
        }
        .slider-glass::-moz-range-track {
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
}
